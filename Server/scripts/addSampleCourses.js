import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleCourses = [
    {
        title: "JavaScript Masterclass - From Beginner to Expert",
        subtitle: "Learn modern JavaScript with real-world projects",
        description: "Complete JavaScript course covering ES6+, Async/Await, DOM manipulation, and building real applications. Perfect for beginners and those looking to master advanced concepts.",
        category: "web-development",
        level: "beginner",
        price: 2999,
        discountPrice: 1499,
        thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
        learningObjectives: [
            "Master JavaScript fundamentals",
            "Understand ES6+ features",
            "Build real-world projects",
            "Learn async programming",
            "DOM manipulation techniques"
        ],
        requirements: [
            "Basic computer knowledge",
            "No programming experience required",
            "Web browser and text editor"
        ],
        curriculum: [
            {
                sectionTitle: "JavaScript Fundamentals",
                description: "Learn the basics of JavaScript",
                lectures: [
                    {
                        title: "Introduction to JavaScript",
                        description: "What is JavaScript and why learn it?",
                        duration: 1200,
                        position: 1,
                        isPreview: true
                    },
                    {
                        title: "Variables and Data Types",
                        description: "Understanding let, const, and data types",
                        duration: 1800,
                        position: 2
                    }
                ],
                position: 1
            }
        ],
        totalLectures: 45,
        totalDuration: 28800, // 8 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "React.js - The Complete Guide 2024",
        subtitle: "Build modern web applications with React Hooks, Context, and Redux",
        description: "Master React.js with Hooks, Context API, Redux, and build professional React applications. Includes real projects and best practices.",
        category: "web-development",
        level: "intermediate",
        price: 3999,
        discountPrice: 1999,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
        learningObjectives: [
            "Build React applications from scratch",
            "Master React Hooks and Context API",
            "State management with Redux",
            "Professional project structure",
            "Deployment and optimization"
        ],
        requirements: [
            "Basic JavaScript knowledge",
            "HTML/CSS fundamentals",
            "Node.js installed"
        ],
        totalLectures: 52,
        totalDuration: 32400, // 9 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "Python for Data Science and Machine Learning",
        subtitle: "Complete Python course for data analysis, visualization, and ML",
        description: "Learn Python programming, data analysis with Pandas, data visualization with Matplotlib, and machine learning with Scikit-learn.",
        category: "data-science",
        level: "beginner",
        price: 3499,
        discountPrice: 1799,
        thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400",
        learningObjectives: [
            "Python programming fundamentals",
            "Data analysis with Pandas",
            "Data visualization techniques",
            "Machine learning algorithms",
            "Real data science projects"
        ],
        totalLectures: 48,
        totalDuration: 30600, // 8.5 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "Node.js - Backend Development Mastery",
        subtitle: "Build scalable backend APIs with Node.js, Express, and MongoDB",
        description: "Learn to build professional backend applications with Node.js, Express framework, MongoDB database, and deploy to production.",
        category: "web-development",
        level: "intermediate",
        price: 3299,
        discountPrice: 1699,
        thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
        learningObjectives: [
            "Node.js fundamentals",
            "Express.js framework",
            "MongoDB database integration",
            "REST API development",
            "Authentication and security"
        ],
        totalLectures: 38,
        totalDuration: 25200, // 7 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "UI/UX Design Fundamentals",
        subtitle: "Learn user interface and user experience design principles",
        description: "Master the principles of good design, create wireframes and prototypes, and learn to design user-friendly interfaces.",
        category: "design",
        level: "beginner",
        price: 2799,
        discountPrice: 1399,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
        learningObjectives: [
            "UI/UX design principles",
            "Wireframing and prototyping",
            "User research methods",
            "Design tools mastery",
            "Portfolio creation"
        ],
        totalLectures: 42,
        totalDuration: 23400, // 6.5 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "Mobile App Development with React Native",
        subtitle: "Build cross-platform mobile apps for iOS and Android",
        description: "Create professional mobile applications using React Native. Learn to build once, deploy everywhere with real projects.",
        category: "mobile-development",
        level: "intermediate",
        price: 3699,
        discountPrice: 1899,
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
        learningObjectives: [
            "React Native fundamentals",
            "Cross-platform development",
            "Mobile UI components",
            "API integration",
            "App store deployment"
        ],
        totalLectures: 44,
        totalDuration: 27000, // 7.5 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "Digital Marketing Mastery",
        subtitle: "Complete digital marketing course for 2024",
        description: "Learn SEO, social media marketing, email marketing, Google Ads, and analytics to grow any business online.",
        category: "business",
        level: "beginner",
        price: 2599,
        discountPrice: 1299,
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
        learningObjectives: [
            "SEO optimization",
            "Social media marketing",
            "Google Ads campaigns",
            "Email marketing strategies",
            "Analytics and tracking"
        ],
        totalLectures: 40,
        totalDuration: 21600, // 6 hours
        language: "English",
        isPublished: true,
        status: "published"
    },
    {
        title: "Advanced JavaScript Patterns",
        subtitle: "Master advanced JavaScript concepts and design patterns",
        description: "Deep dive into advanced JavaScript topics including design patterns, performance optimization, and professional coding practices.",
        category: "web-development",
        level: "advanced",
        price: 4299,
        discountPrice: 2199,
        thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
        learningObjectives: [
            "Advanced JavaScript patterns",
            "Performance optimization",
            "Memory management",
            "Professional code structure",
            "Interview preparation"
        ],
        totalLectures: 35,
        totalDuration: 19800, // 5.5 hours
        language: "English",
        isPublished: true,
        status: "published"
    }
];

const addSampleCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get an instructor user
        const instructor = await User.findOne({ role: 'instructor' });

        if (!instructor) {
            console.log('❌ No instructor found. Please create an instructor account first.');
            process.exit(1);
        }

        // Clear existing courses
        await Course.deleteMany({});
        console.log('✅ Cleared existing courses');

        // Add instructor to each course
        const coursesWithInstructor = sampleCourses.map(course => ({
            ...course,
            instructor: instructor._id
        }));

        // Insert sample courses
        await Course.insertMany(coursesWithInstructor);
        console.log('✅ Added sample courses');

        console.log('🎉 Sample data added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding sample courses:', error);
        process.exit(1);
    }
};

addSampleCourses();