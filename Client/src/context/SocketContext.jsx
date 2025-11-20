import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            const newSocket = io(process.env.VITE_API_BASE_URL.replace('/api', ''), {
                auth: {
                    token: token
                }
            });

            newSocket.on('connect', () => {
                console.log('Connected to server');
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from server');
            });

            newSocket.on('notification', (data) => {
                console.log('New notification:', data);
                setNotifications(prev => [...prev, { ...data, id: Date.now(), read: false }]);

                // Show toast notification
                if (data.message && typeof window !== 'undefined') {
                    const event = new CustomEvent('show-toast', {
                        detail: {
                            message: data.message,
                            type: data.type || 'info'
                        }
                    });
                    window.dispatchEvent(event);
                }
            });

            newSocket.on('user-online', (userId) => {
                setOnlineUsers(prev => new Set([...prev, userId]));
            });

            newSocket.on('user-offline', (userId) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user, token]);

    const value = {
        socket,
        notifications,
        onlineUsers,
        markNotificationAsRead: (notificationId) => {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
        },
        clearNotifications: () => {
            setNotifications([]);
        },
        sendNotification: (data) => {
            if (socket) {
                socket.emit('send-notification', data);
            }
        }
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};