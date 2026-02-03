'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationDialog, { DialogType } from '@/components/NotificationDialog';

interface NotificationContextType {
    showNotification: (title: string, message: string, type?: DialogType, onClose?: () => void) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        type: 'info' as DialogType,
        title: '',
        message: '',
        onConfirm: undefined as (() => void) | undefined,
        onClose: undefined as (() => void) | undefined,
    });

    const showNotification = (title: string, message: string, type: DialogType = 'info', onClose?: () => void) => {
        setConfig({
            type,
            title,
            message,
            onConfirm: undefined,
            onClose,
        });
        setIsOpen(true);
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfig({
            type: 'confirm',
            title,
            message,
            onConfirm,
            onClose: undefined,
        });
        setIsOpen(true);
    };

    const closeNotification = () => {
        const callback = config.onClose;
        setIsOpen(false);
        if (callback) {
            callback();
            setConfig((prev) => ({
                ...prev,
                onClose: undefined,
            }));
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirm, closeNotification }}>
            {children}
            <NotificationDialog
                isOpen={isOpen}
                type={config.type}
                title={config.title}
                message={config.message}
                onConfirm={config.onConfirm}
                onClose={closeNotification}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
