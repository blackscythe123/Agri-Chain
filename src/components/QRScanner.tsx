import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, X } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose }) => {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');
    const [hasCamera, setHasCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        checkCameraAvailability();
        return () => {
            stopCamera();
        };
    }, []);

    const checkCameraAvailability = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideoDevice = devices.some(device => device.kind === 'videoinput');
            setHasCamera(hasVideoDevice);
        } catch (err) {
            setError('Cannot access camera permissions');
        }
    };

    const startCamera = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.play();

            setScanning(true);
            requestAnimationFrame(scanQRCode);
        } catch (err) {
            setError('Failed to access camera: ' + err.message);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setScanning(false);
    };

    const scanQRCode = async () => {
        if (!scanning || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        try {
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                const batchId = extractBatchId(code.data);
                if (batchId) {
                    stopCamera();
                    onScan(batchId);
                }
            }
        } catch (err) {
            // Continue scanning
        }

        // Continue scanning
        if (scanning) {
            requestAnimationFrame(scanQRCode);
        }
    };

    const extractBatchId = (qrData) => {
        try {
            // Handle different QR code formats
            if (qrData.startsWith('agrichain://')) {
                return qrData.split('agrichain://')[1];
            }
            if (qrData.includes('batch=')) {
                return qrData.split('batch=')[1].split('&')[0];
            }
            return qrData;
        } catch (err) {
            return null;
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                try {
                    const code = jsQR(imageData.data, canvas.width, canvas.height);
                    if (code) {
                        const batchId = extractBatchId(code.data);
                        if (batchId) {
                            onScan(batchId);
                        } else {
                            setError('Invalid QR code format');
                        }
                    } else {
                        setError('No QR code found in image');
                    }
                } catch (err) {
                    setError('Failed to process QR code');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Scan QR Code</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {error && (
                        <Alert>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full hidden"
                        />
                        {!scanning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Camera className="h-12 w-12 text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {hasCamera && (
                            <Button
                                className="flex-1"
                                onClick={() => scanning ? stopCamera() : startCamera()}
                            >
                                <Camera className="h-4 w-4 mr-2" />
                                {scanning ? 'Stop' : 'Start'} Camera
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => document.getElementById('qr-file-input').click()}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                        </Button>
                        <input
                            id="qr-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QRScanner;