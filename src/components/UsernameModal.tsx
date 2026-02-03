'use client';

import { useState, useEffect } from 'react';

interface UsernameModalProps {
    onSubmit: (username: string) => void;
    onClose?: () => void;
    initialUsername?: string;
    canClose?: boolean;
}

export default function UsernameModal({ onSubmit, onClose, initialUsername = '', canClose = false }: UsernameModalProps) {
    const [username, setUsername] = useState(initialUsername || '');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (initialUsername) setUsername(initialUsername);
    }, [initialUsername]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-md w-full p-8 animate-[scale-in_0.3s_ease-out]">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">👋</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحباً بك!</h2>
                    <p className="text-gray-600">الرجاء إدخال اسمك للمتابعة</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="اسم المستخدم"
                            className="input-modern"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary flex-1">
                            متابعة
                        </button>
                        {canClose && onClose && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onClose();
                                }}
                                className="px-4 py-2 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                إلغاء
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
