'use client';

import { useEffect, useState } from 'react';

export type DialogType = 'success' | 'error' | 'confirm' | 'info';

interface NotificationDialogProps {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    onClose: () => void;
}

export default function NotificationDialog({
    isOpen,
    type,
    title,
    message,
    onConfirm,
    onCancel,
    onClose,
}: NotificationDialogProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <div className="text-green-500 text-5xl mb-4">✅</div>;
            case 'error':
                return <div className="text-red-500 text-5xl mb-4">❌</div>;
            case 'confirm':
                return <div className="text-blue-500 text-5xl mb-4">❓</div>;
            default:
                return <div className="text-indigo-500 text-5xl mb-4">ℹ️</div>;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return { button: 'bg-green-600 hover:bg-green-700', border: 'border-green-200' };
            case 'error':
                return { button: 'bg-red-600 hover:bg-red-700', border: 'border-red-200' };
            case 'confirm':
                return { button: 'bg-blue-600 hover:bg-blue-700', border: 'border-blue-200' };
            default:
                return { button: 'bg-indigo-600 hover:bg-indigo-700', border: 'border-indigo-200' };
        }
    };

    const colors = getColors();

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'bg-black/50 opacity-100 backdrop-blur-sm' : 'bg-black/0 opacity-0 pointer-events-none'
                }`}
        >
            <div
                className={`bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 border-2 ${colors.border} ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
            >
                <div className="text-center">
                    {getIcon()}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>

                    <div className="flex gap-3 justify-center">
                        {type === 'confirm' ? (
                            <>
                                <button
                                    onClick={() => {
                                        onClose();
                                        onCancel?.();
                                    }}
                                    className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex-1"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm?.();
                                        onClose();
                                    }}
                                    className={`px-6 py-3 rounded-xl font-bold text-white transition-colors flex-1 shadow-lg shadow-blue-200 ${colors.button}`}
                                >
                                    تأكيد
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className={`px-8 py-3 rounded-xl font-bold text-white transition-colors w-full shadow-lg ${colors.button}`}
                            >
                                حسناً
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
