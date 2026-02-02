'use client';

import { useState, useRef, useEffect } from 'react';

interface MenuScannerProps {
    restaurantId: string;
    mealType: string;
    onItemsExtracted: (items: { name: string; price: number }[]) => void;
}

export default function MenuScanner({
    restaurantId,
    mealType,
    onItemsExtracted,
}: MenuScannerProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            setError(null);
            // Prefer back camera on mobile devices
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setIsCameraOpen(true);
            setPreview(null);
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('فشل الوصول للكاميرا. تأكد من منح الصلاحيات.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                        processFile(file);
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const processFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('يجب أن يكون الملف صورة');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to API
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/menu/ocr', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onItemsExtracted(data.items);
            } else {
                setError(data.error || 'فشل في استخراج البيانات من الصورة');
                setPreview(null);
            }
        } catch (err) {
            setError('حدث خطأ أثناء معالجة الصورة');
            console.error('Upload error:', err);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div className="space-y-4">
            {!isCameraOpen && !preview && (
                <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-all duration-300">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        {/* File Upload Button */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                            id="menu-image-upload"
                        />
                        <label
                            htmlFor="menu-image-upload"
                            className={`cursor-pointer w-full md:w-auto ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="bg-indigo-50 p-6 rounded-xl hover:bg-indigo-100 transition-colors">
                                <div className="text-4xl mb-2">📁</div>
                                <h3 className="font-bold text-gray-800">رفع صورة</h3>
                            </div>
                        </label>

                        <div className="text-gray-400 font-bold">- أو -</div>

                        {/* Camera Button */}
                        <button
                            onClick={startCamera}
                            disabled={uploading}
                            className="w-full md:w-auto"
                        >
                            <div className="bg-indigo-50 p-6 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer">
                                <div className="text-4xl mb-2">📸</div>
                                <h3 className="font-bold text-gray-800">التقاط صورة</h3>
                            </div>
                        </button>
                    </div>

                    <p className="text-gray-600 mt-4">
                        اختر طريقة لإضافة صورة المنيو
                    </p>
                </div>
            )}

            {/* Camera Live Preview */}
            {isCameraOpen && (
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <button
                            onClick={captureImage}
                            className="bg-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
                        >
                            <div className="w-8 h-8 rounded-full border-4 border-indigo-600"></div>
                        </button>
                        <button
                            onClick={stopCamera}
                            className="bg-red-600 text-white rounded-full px-6 py-2 shadow-lg font-bold"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* Image Preview & Loading State */}
            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Menu preview"
                        className="w-full max-h-96 object-contain rounded-xl border border-gray-200"
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-white border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white font-bold">جاري تحليل الصورة واستخراج الوجبات...</p>
                                <p className="text-white/80 text-sm mt-2">قد يستغرق ذلك بضع ثواني</p>
                            </div>
                        </div>
                    )}
                    {!uploading && (
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-2 right-2 bg-white/90 text-gray-800 rounded-full p-2 shadow-md hover:bg-white"
                        >
                            ✕ تغيير الصورة
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-[shake_0.5s_ease-in-out]">
                    {error}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                <p className="font-bold mb-1">💡 نصائح:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>صور المنيو بشكل مستقيم وتجنب الميلان</li>
                    <li>تأكد من إضاءة جيدة لقراءة النصوص بوضوح</li>
                    <li>يمكنك تعديل الأسعار والأسماء المستخرجة قبل الحفظ</li>
                </ul>
            </div>
        </div>
    );
}
