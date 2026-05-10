"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, ZoomIn, RotateCcw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64: string, mimeType: string, previewUrl: string) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async (mode: "environment" | "user") => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setReady(false);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      setError("Camera access denied. Allow camera permission and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !ready) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const base64 = dataUrl.split(",")[1];
    onCapture(base64, "image/jpeg", dataUrl);

    // Stop stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [ready, onCapture]);

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 z-10 absolute top-0 left-0 right-0">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-white text-sm font-semibold bg-black/50 backdrop-blur px-3 py-1.5 rounded-full">
          Point at donation items
        </p>
        <button
          onClick={flipCamera}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Corner guides */}
        {ready && (
          <div className="absolute inset-8 pointer-events-none">
            {[
              "top-0 left-0 border-t-2 border-l-2 w-8 h-8",
              "top-0 right-0 border-t-2 border-r-2 w-8 h-8",
              "bottom-0 left-0 border-b-2 border-l-2 w-8 h-8",
              "bottom-0 right-0 border-b-2 border-r-2 w-8 h-8",
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute ${cls} border-gl-gold rounded-sm`}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-gl-gold/40" />
            </div>
          </div>
        )}

        {/* Flash overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white opacity-70 pointer-events-none" />
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-gl-surface border border-gl-red rounded-2xl p-6 text-center">
              <Camera className="w-8 h-8 text-gl-red mx-auto mb-3" />
              <p className="text-sm text-gl-text">{error}</p>
            </div>
          </div>
        )}

        {/* AI hint overlay */}
        {ready && (
          <div className="absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-gl-purple/80 backdrop-blur text-white text-xs font-medium px-4 py-2 rounded-full">
              AI will analyze quantity, category &amp; value
            </div>
          </div>
        )}
      </div>

      {/* Capture button */}
      <div className="h-32 flex items-center justify-center bg-black">
        <button
          onClick={capture}
          disabled={!ready}
          className="w-20 h-20 rounded-full border-4 border-white bg-white/10 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
