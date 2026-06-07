import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const bgStyles = {
    success: 'bg-emerald-600 border-emerald-500/50',
    error: 'bg-red-600 border-red-500/50',
    info: 'bg-blue-600 border-blue-500/50',
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }[type];

  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md ${bgStyles}`}
      >
        <span>{icon}</span>
        <span>{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 transition-opacity hover:opacity-70"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
