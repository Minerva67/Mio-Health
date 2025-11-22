import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { Language } from '../types';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
  lang: Language;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, isAnalyzing, lang }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    event.target.value = '';
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(lang === 'zh' ? "文件过大，请上传 10MB 以下的图片。" : "File is too large. Please upload an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
    closeCamera();
  };

  // --- Custom Camera Logic ---

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Request explicit constraints
      const constraints = { 
        video: { 
          facingMode: 'environment', // Prefer rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait a tick for the video element to exist
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Important for iOS
          videoRef.current.setAttribute('playsinline', 'true'); 
          videoRef.current.play().catch(e => console.error("Play failed", e));
        }
      }, 100);

    } catch (err) {
      console.error("Camera Access Error:", err);
      let msg = "Unknown Error";
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') msg = lang === 'zh' ? "相机权限被拒绝，请在浏览器设置中允许访问。" : "Camera permission denied.";
        else if (err.name === 'NotFoundError') msg = lang === 'zh' ? "未找到相机设备。" : "No camera device found.";
        else msg = err.name;
      }
      alert(lang === 'zh' ? `无法打开相机: ${msg}` : `Cannot open camera: ${msg}`);
      // Fallback to file input
      cameraInputRef.current?.click();
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Match canvas size to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
            processFile(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // --- UI Text ---

  const t = {
    en: {
      retake: "Retake",
      title: "Show Mio Your Food",
      camera: "Snap It",
      gallery: "Pick Photo",
      subtitle: "Take a quick photo or choose from gallery",
      capture: "Capture"
    },
    zh: {
      retake: "重新拍摄",
      title: "给 Mio 看看你在吃什么",
      camera: "拍一张",
      gallery: "选照片",
      subtitle: "拍张照片，或者从相册上传",
      capture: "拍摄"
    }
  };

  const text = t[lang];

  return (
    <div className="w-full mb-6">
      {/* Standard Inputs (Fallback & Gallery) */}
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={galleryInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Full Screen Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
            <video 
              ref={videoRef} 
              className="absolute w-full h-full object-cover"
              autoPlay 
              playsInline // CRITICAL for mobile
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Close Button */}
            <button 
              onClick={closeCamera}
              className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full z-10"
            >
              <X size={24} />
            </button>
          </div>

          {/* Camera Controls */}
          <div className="h-32 bg-black flex items-center justify-center gap-8 pb-6">
             <button 
               onClick={takePhoto}
               className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center active:scale-95 transition-transform"
             >
               <div className="w-16 h-16 bg-white rounded-full border-2 border-black"></div>
             </button>
          </div>
        </div>
      )}

      <div 
        className={`relative w-full min-h-[320px] rounded-3xl overflow-hidden border-2 border-dashed transition-all shadow-sm
          ${preview ? 'border-orange-500 bg-black' : 'border-gray-200 bg-white'}
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Food Preview" 
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            <button 
              onClick={(e) => { e.stopPropagation(); setPreview(null); }}
              className="absolute bottom-6 right-6 bg-white text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 hover:bg-gray-100 active:scale-95 transition-all pointer-events-auto"
            >
              <Camera size={18} />
              {text.retake}
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="font-bold text-gray-400 text-sm tracking-wider mb-6">{text.title}</h3>
            
            <div className="flex gap-4 w-full max-w-xs">
              {/* Camera Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                className="flex-1 bg-orange-50 hover:bg-orange-100 border border-orange-100 text-orange-700 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
              >
                <div className="bg-white p-3 rounded-full shadow-sm text-orange-600 group-hover:scale-110 transition-transform">
                  <Camera size={28} />
                </div>
                <span className="font-bold text-sm">{text.camera}</span>
              </button>

              {/* Gallery Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}
                className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
              >
                <div className="bg-white p-3 rounded-full shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                  <ImageIcon size={28} />
                </div>
                <span className="font-bold text-sm">{text.gallery}</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-6">{text.subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;