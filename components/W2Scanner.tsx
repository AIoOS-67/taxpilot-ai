"use client";

import { useState, useRef, useCallback } from "react";

interface W2ScannerProps {
  onCapture: (blob: Blob) => void;
}

export default function W2Scanner({ onCapture }: W2ScannerProps) {
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError("Camera access denied. Please use file upload instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        stopCamera();
      }
    }, "image/jpeg", 0.92);
  }, [onCapture, stopCamera]);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{"\ud83d\udcf8"}</span>
        <h3 className="font-semibold text-sm">Camera Capture</h3>
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {!streaming ? (
        <button onClick={startCamera} className="btn-primary w-full">
          Open Camera
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 border-2 border-blue-400/30 m-8 rounded-lg" />
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-blue-300">
              Position your W-2 within the frame
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={stopCamera} className="btn-secondary flex-1">Cancel</button>
            <button onClick={capture} className="btn-primary flex-1">Capture</button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
