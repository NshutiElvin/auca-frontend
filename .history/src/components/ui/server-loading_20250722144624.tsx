
import React, { useState, useEffect } from 'react';
import useToast from '../../hooks/useToast';
import { Loader } from 'lucide-react';

 
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
      top-4 right-0
      md:top-6 md:right-0
      sm:top-1/2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2
      transition-all duration-500 ease-in-out
      
    `}>
     
        <div className="flex items-center ">
          <Loader className='animate-spin'/>
          
            <p className="font-medium text-sm">
              {serverLoadingMessage?.message || 'Loading...'}
            </p>
             
      </div>
    </div>
  );
}

export default ServerLoader;