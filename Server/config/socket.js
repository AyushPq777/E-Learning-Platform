import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const configureSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.userId = user._id.toString();
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);

        // Handle joining chat rooms
        socket.on('join-chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`User ${socket.userId} joined chat: ${chatId}`);
        });

        // Handle leaving chat rooms
        socket.on('leave-chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`User ${socket.userId} left chat: ${chatId}`);
        });

        // Handle sending messages
        socket.on('send-message', async (data) => {
            try {
                const message = {
                    id: Date.now().toString(),
                    chatId: data.chatId,
                    senderId: socket.userId,
                    senderName: socket.user.name,
                    content: data.content,
                    timestamp: new Date().toISOString()
                };

                // Broadcast to all users in the chat room
                io.to(`chat:${data.chatId}`).emit('new-message', message);

                // Send notification to other users in the chat
                socket.to(`chat:${data.chatId}`).emit('notification', {
                    type: 'new_message',
                    message: `New message from ${socket.user.name}`,
                    chatId: data.chatId
                });
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicators
        socket.on('typing-start', (data) => {
            socket.to(`chat:${data.chatId}`).emit('user-typing', {
                userId: socket.userId,
                userName: socket.user.name,
                chatId: data.chatId
            });
        });

        socket.on('typing-stop', (data) => {
            socket.to(`chat:${data.chatId}`).emit('user-stop-typing', {
                userId: socket.userId,
                chatId: data.chatId
            });
        });

        // Handle system notifications
        socket.on('send-notification', (data) => {
            if (data.userId) {
                // Send to specific user
                io.to(`user:${data.userId}`).emit('notification', data);
            } else {
                // Broadcast to all users (for admin notifications)
                io.emit('notification', data);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });

    return io;
};

export default configureSocket;