
import React, { useState, useEffect } from 'react';
import useToast from '../../hooks/useToast';

 
function ServerLoader() {
  const { serverLoadingMessage, setServerLoadingMessage } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start fade-out animation after 4.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 4500);

    // Completely hide component after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed z-50 
      top-4 right-4 
      md:top-6 md:right-6 
      sm:top-1/2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2
      transition-all duration-500 ease-in-out
      ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
    `}>
      <div className="
        bg-white/95 backdrop-blur-sm 
        border border-gray-200/50 
        rounded-xl shadow-lg 
        px-6 py-4 
        min-w-64 max-w-sm
        animate-pulse
      ">
        <div className="flex items-center space-x-3">
          {/* Animated loading spinner */}
          <div className="relative">
            <div className="w-5 h-5 border-2 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Loading message */}
          <div className="flex-1">
            <p className="text-gray-800 font-medium text-sm">
              {serverLoadingMessage?.message || 'Loading...'}
            </p>
            <div className="flex space-x-1 mt-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerLoader;