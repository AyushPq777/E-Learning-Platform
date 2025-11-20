// import Stripe from 'stripe';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

// Mock Stripe for development
const stripe = {
    paymentIntents: {
        create: async (data) => {
            console.log('💰 Mock Stripe: Creating payment intent for $' + (data.amount / 100));
            return {
                client_secret: 'mock_client_secret_' + Date.now(),
                id: 'mock_pi_' + Date.now(),
                amount: data.amount,
                currency: data.currency,
                metadata: data.metadata
            };
        },
        retrieve: async (paymentIntentId) => {
            console.log('💰 Mock Stripe: Retrieving payment intent:', paymentIntentId);
            return {
                status: 'succeeded',
                id: paymentIntentId,
                amount: 9999, // $99.99 in cents
                currency: 'usd',
                metadata: {
                    courseId: 'mock_course_id',
                    userId: 'mock_user_id',
                    courseTitle: 'Mock Course'
                }
            };
        }
    },
    customers: {
        create: async (data) => {
            console.log('💰 Mock Stripe: Creating customer for:', data.email);
            return { id: 'mock_customer_' + Date.now() };
        },
        retrieve: async (customerId) => {
            console.log('💰 Mock Stripe: Retrieving customer:', customerId);
            return { id: customerId, email: 'mock@test.com' };
        }
    },
    webhooks: {
        constructEvent: (body, sig, secret) => {
            console.log('💰 Mock Stripe: Webhook received');
            return { type: 'payment_intent.succeeded', data: { object: {} } };
        }
    }
};

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
    try {
        const { courseId } = req.body;

        // Get course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Calculate amount (in smallest currency unit - cents for USD)
        const amount = Math.round(course.currentPrice * 100);

        // Create or get Stripe customer
        let customer;
        const user = await User.findById(req.user.id);

        if (user.stripeCustomerId) {
            customer = await stripe.customers.retrieve(user.stripeCustomerId);
        } else {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user._id.toString()
                }
            });

            // Save Stripe customer ID to user
            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                courseId: courseId.toString(),
                userId: req.user.id.toString(),
                courseTitle: course.title
            }
        });

        console.log('💰 Mock payment created - Course:', course.title, 'Amount: $' + course.currentPrice);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: course.currentPrice,
            message: 'DEMO MODE: Using mock payments. Add Stripe keys for real payments.'
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating payment intent'
        });
    }
};

// @desc    Confirm payment and create enrollment
// @route   POST /api/payments/confirm-enrollment
// @access  Private
export const confirmEnrollment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        // In demo mode, auto-succeed all payments
        console.log('💰 Mock payment confirmed:', paymentIntentId);

        const courseId = req.body.courseId || 'mock_course_id';

        // Check if enrollment already exists (idempotency)
        const existingEnrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.json({
                success: true,
                message: 'Enrollment already exists',
                data: existingEnrollment
            });
        }

        // Get course for amount
        const course = await Course.findById(courseId);
        const amountPaid = course ? course.currentPrice : 99.99;

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: courseId,
            paymentId: paymentIntentId || 'mock_payment_' + Date.now(),
            amountPaid: amountPaid,
            currency: 'usd'
        });

        // Update course student count
        if (course) {
            await Course.findByIdAndUpdate(courseId, {
                $inc: { totalStudents: 1 }
            });
        }

        // Populate course details
        await enrollment.populate('course', 'title instructor thumbnail');
        await enrollment.populate('student', 'name email');

        console.log('✅ Mock enrollment created for user:', req.user.id, 'in course:', courseId);

        res.status(201).json({
            success: true,
            message: 'Enrollment successful (Demo Mode)',
            data: enrollment
        });
    } catch (error) {
        console.error('Confirm enrollment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while confirming enrollment'
        });
    }
};

// @desc    Handle Stripe webhooks
// @route   POST /api/payments/webhook
// @access  Public (Stripe calls this)
export const handleWebhook = async (req, res) => {
    console.log('💰 Mock webhook received');

    // In demo mode, just acknowledge receipt
    res.json({
        received: true,
        message: 'Webhook received (Demo Mode - No real payments)'
    });
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate('course', 'title thumbnail instructor')
            .populate('student', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payment history'
        });
    }
};

// Free enrollment for demo
// @desc    Free enrollment (for demo purposes)
// @route   POST /api/payments/free-enroll
// @access  Private
export const freeEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Create free enrollment
        const enrollment = await Enrollment.create({
            student: req.user.id,
            course: courseId,
            paymentId: 'free_enrollment_' + Date.now(),
            amountPaid: 0,
            currency: 'usd'
        });

        // Update course student count
        await Course.findByIdAndUpdate(courseId, {
            $inc: { totalStudents: 1 }
        });

        await enrollment.populate('course', 'title instructor thumbnail');
        await enrollment.populate('student', 'name email');

        res.status(201).json({
            success: true,
            message: 'Free enrollment successful',
            data: enrollment
        });
    } catch (error) {
        console.error('Free enrollment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during free enrollment'
        });
    }
};