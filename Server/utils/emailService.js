import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter configuration error:', error);
    } else {
        console.log('✅ Email service is ready to send messages');
    }
});

// Send email function
export const sendEmail = async (emailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"E-Learning Platform" <${process.env.EMAIL_USERNAME}>`,
            ...emailOptions,
        });

        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw new Error('Failed to send email');
    }
};

// Email templates
export const emailTemplates = {
    welcome: (user) => ({
        subject: 'Welcome to Our E-Learning Platform!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our Platform, ${user.name}! 🎉</h2>
        <p>We're excited to have you join our learning community.</p>
        <p>Start your learning journey by exploring our courses and expanding your skills.</p>
        <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Get Started:</h3>
          <ul>
            <li>Browse our course catalog</li>
            <li>Enroll in your first course</li>
            <li>Join the learning community</li>
          </ul>
        </div>
        <p>Happy learning!<br>The E-Learning Team</p>
      </div>
    `,
    }),

    enrollmentConfirmation: (user, course) => ({
        subject: `Enrollment Confirmation - ${course.title}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Congratulations on Your Enrollment! 🎓</h2>
        <p>Dear ${user.name},</p>
        <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
        <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Course Details:</h3>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Instructor:</strong> ${course.instructor.name}</p>
          <p><strong>Start Learning:</strong> <a href="${process.env.CLIENT_URL}/learn/${course._id}">Access Course</a></p>
        </div>
        <p>We wish you the best in your learning journey!</p>
        <p>Best regards,<br>The E-Learning Team</p>
      </div>
    `,
    }),

    courseCompletion: (user, course, certificateId) => ({
        subject: `Course Completed - ${course.title}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Congratulations on Completing the Course! 🏆</h2>
        <p>Dear ${user.name},</p>
        <p>You have successfully completed <strong>${course.title}</strong>.</p>
        <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Your Achievement:</h3>
          <p><strong>Course:</strong> ${course.title}</p>
          <p><strong>Instructor:</strong> ${course.instructor.name}</p>
          <p><strong>Certificate ID:</strong> ${certificateId}</p>
          <p><a href="${process.env.CLIENT_URL}/certificate/${certificateId}">Download Your Certificate</a></p>
        </div>
        <p>Keep up the great work and continue your learning journey!</p>
        <p>Best regards,<br>The E-Learning Team</p>
      </div>
    `,
    }),

    passwordReset: (user, resetUrl) => ({
        subject: 'Password Reset Request',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The E-Learning Team</p>
      </div>
    `,
    }),
};

export default transporter;