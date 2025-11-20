import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Send, Paperclip, Smile, X } from 'lucide-react';

const ChatWindow = ({ chatId, onClose, title = "Chat" }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState(new Set());
    const messagesEndRef = useRef();
    const { socket } = useSocket();

    useEffect(() => {
        if (socket && chatId) {
            // Join chat room
            socket.emit('join-chat', chatId);

            // Listen for new messages
            socket.on('new-message', (message) => {
                if (message.chatId === chatId) {
                    setMessages(prev => [...prev, message]);
                }
            });

            // Listen for typing indicators
            socket.on('user-typing', (data) => {
                if (data.chatId === chatId) {
                    setTypingUsers(prev => new Set([...prev, data.userName]));
                }
            });

            socket.on('user-stop-typing', (data) => {
                if (data.chatId === chatId) {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.userName);
                        return newSet;
                    });
                }
            });

            // Load initial messages (mock data - in real app, fetch from API)
            setMessages([
                {
                    id: '1',
                    chatId,
                    senderId: 'system',
                    senderName: 'System',
                    content: 'Chat started',
                    timestamp: new Date().toISOString()
                }
            ]);

            return () => {
                socket.emit('leave-chat', chatId);
                socket.off('new-message');
                socket.off('user-typing');
                socket.off('user-stop-typing');
            };
        }
    }, [socket, chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket) return;

        const messageData = {
            chatId,
            content: newMessage.trim()
        };

        socket.emit('send-message', messageData);
        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing-stop', { chatId });
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing-start', { chatId });
        }
    };

    const handleStopTyping = () => {
        if (socket) {
            socket.emit('typing-stop', { chatId });
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold">{title}</h3>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === 'system' ? 'justify-center' :
                            message.senderId === socket?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${message.senderId === 'system'
                                    ? 'bg-gray-100 text-gray-600 text-xs'
                                    : message.senderId === socket?.user?.id
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                }`}
                        >
                            {message.senderId !== 'system' && message.senderId !== socket?.user?.id && (
                                <div className="text-xs font-medium mb-1">{message.senderName}</div>
                            )}
                            <div className="text-sm">{message.content}</div>
                            <div className={`text-xs mt-1 ${message.senderId === socket?.user?.id ? 'text-primary-100' : 'text-gray-500'
                                }`}>
                                {formatTime(message.timestamp)}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm">
                            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        onBlur={handleStopTyping}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;