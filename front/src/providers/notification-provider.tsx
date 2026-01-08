'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    hasNotifications: boolean;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const hasNotifications = notifications.some(n => !n.read);

    const addNotification = (n: Omit<Notification, 'id' | 'read' | 'time'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substring(7),
            time: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, hasNotifications, addNotification, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
