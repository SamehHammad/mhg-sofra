'use client';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-mhg-gold mb-2">حدث خطأ</h3>
            <p className="text-white/75 mb-4">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn-primary">
                    إعادة المحاولة
                </button>
            )}
        </div>
    );
}
