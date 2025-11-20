import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import paymentRoutes from './routes/payments.js';
import enrollmentRoutes from './routes/enrollments.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';
import errorHandler from './middleware/errorHandler.js';
import configureSocket from './config/socket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = configureSocket(server);

// Security Middleware
app.use(helmet());

// ✅ FIXED CORS CONFIGURATION
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://e-learning-platform-client-q9v7.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Ayush-db:MyPassword@cluster0.8zuiw6u.mongodb.net/E-Learning?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'E-Learning Platform API is running!',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler - EXPRESS 5 COMPATIBLE
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// Error Handling Middleware (MUST BE LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 E-Learning Platform Backend Ready!`);
    console.log(`🔌 WebSocket server running!`);
});

export { io };
