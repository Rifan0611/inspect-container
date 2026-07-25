import React, { useRef, useState, useEffect } from "react";
import { Camera, X, Zap, ZapOff } from "lucide-react";
import "./CameraScanner.css";

export default function CameraScanner({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [hasFlashlight, setHasFlashlight] = useState(false);

  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const track = mediaStream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === 'function') {
          const capabilities = track.getCapabilities();
          if (capabilities.torch) {
            setHasFlashlight(true);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.");
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const toggleFlashlight = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashlightOn }]
        });
        setIsFlashlightOn(!isFlashlightOn);
      } catch (err) {
        console.error("Flashlight error:", err);
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && boxRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const box = boxRef.current;
      
      const videoRect = video.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      
      const videoRatio = video.videoWidth / video.videoHeight;
      const rectRatio = videoRect.width / videoRect.height;
      
      let renderWidth, renderHeight, xOffset, yOffset;
      if (videoRatio > rectRatio) {
        renderHeight = videoRect.height;
        renderWidth = videoRect.height * videoRatio;
        xOffset = (renderWidth - videoRect.width) / 2;
        yOffset = 0;
      } else {
        renderWidth = videoRect.width;
        renderHeight = videoRect.width / videoRatio;
        xOffset = 0;
        yOffset = (renderHeight - videoRect.height) / 2;
      }
      
      const scale = video.videoWidth / renderWidth;
      
      const cropX = (boxRect.left - videoRect.left + xOffset) * scale;
      const cropY = (boxRect.top - videoRect.top + yOffset) * scale;
      const cropWidth = boxRect.width * scale;
      const cropHeight = boxRect.height * scale;
      
      const padX = cropWidth * 0.1;
      const padY = cropHeight * 0.1;
      
      const finalX = Math.max(0, cropX - padX);
      const finalY = Math.max(0, cropY - padY);
      const finalW = Math.min(video.videoWidth - finalX, cropWidth + padX * 2);
      const finalH = Math.min(video.videoHeight - finalY, cropHeight + padY * 2);

      canvas.width = finalW;
      canvas.height = finalH;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "scanned-container.jpg", { type: "image/jpeg" });
            onCapture(file);
          }
        },
        "image/jpeg",
        0.8
      );
    }
  };

  return (
    <div className="camera-scanner-overlay">
      <div className="camera-scanner-container">
        {error ? (
          <div className="camera-error">
            <p>{error}</p>
            <label className="btn-close-error" style={{ background: '#3b82f6', marginBottom: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              📷 Pilih / Ambil Foto dari HP
              <input
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onCapture(e.target.files[0]);
                  }
                }}
              />
            </label>
            <button className="btn-close-error" onClick={onClose} style={{ background: '#4b5563' }}>
              Kembali
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
            
            {/* Overlay UI */}
            <div className="scanner-ui">
              <div className="scanner-instruction">
                Arahkan nomor container ke dalam kotak
              </div>
              <div className="scanner-box" ref={boxRef}>
                <div className="scanner-corner top-left"></div>
                <div className="scanner-corner top-right"></div>
                <div className="scanner-corner bottom-left"></div>
                <div className="scanner-corner bottom-right"></div>
                <div className="scanner-line"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="scanner-controls">
              <button className="btn-close-scanner" onClick={onClose}>
                <X size={24} />
              </button>
              <button className="btn-capture" onClick={handleCapture}>
                <div className="capture-inner" />
              </button>
              {hasFlashlight ? (
                <button 
                  className="btn-close-scanner" 
                  onClick={toggleFlashlight}
                  style={{ 
                    background: isFlashlightOn ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)', 
                    color: isFlashlightOn ? 'black' : 'white' 
                  }}
                >
                  {isFlashlightOn ? <ZapOff size={24} /> : <Zap size={24} />}
                </button>
              ) : (
                <div style={{ width: 48 }} />
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </>
        )}
      </div>
    </div>
  );
}
