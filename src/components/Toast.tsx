import { useEffect, useState } from "react";
import useToast from "../hooks/useToast";
import { cn } from "../lib/utils";  
import { X } from "lucide-react";

const positionClasses = {
  "top-start": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-end": "top-4 right-4",
  "middle-start": "top-1/2 left-4 -translate-y-1/2",
  "middle-center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "middle-end": "top-1/2 right-4 -translate-y-1/2",
  "bottom-start": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-end": "bottom-4 right-4",
};

interface ToastContainerProps {
  position?: keyof typeof positionClasses;
  className?: string;
  children: React.ReactNode;
}

const ToastContainer = ({ position = "bottom-end", className, children }: ToastContainerProps) => {
  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {children}
    </div>
  );
};

const bgColors = {
  success: "bg-green-500 text-white",
  danger: "bg-red-500 text-white",
  warning: "bg-yellow-400 text-black",
  info: "bg-blue-500 text-white",
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-600 text-white",
  light: "bg-gray-100 text-black",
  dark: "bg-gray-800 text-white",
};

interface ToastProps {
  onClose: () => void;
  show: boolean;
  delay: number;
  autohide: boolean;
  bg: keyof typeof bgColors;
  children: React.ReactNode;
}

const Toast = ({ onClose, show, delay, autohide, bg, children }: ToastProps) => {
  useEffect(() => {
    if (show && autohide) {
      const timer = setTimeout(() => onClose(), delay);
      return () => clearTimeout(timer);
    }
  }, [show, autohide, delay, onClose]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "rounded-xl shadow-lg w-fit max-w-sm px-4 py-3 relative transition-opacity duration-300 ease-in-out",
        bgColors[bg] || bgColors.light
      )}
    >
      <button
        onClick={onClose}
        className="absolute right-2 top-2 text-white hover:text-gray-300"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
};

function MyToast() {
  const toastContext = useToast();
  const toastMessage = toastContext?.toastMessage;
  const [show, setShow] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage?.message !== currentMessage) {
      setShow(true);
      setCurrentMessage(toastMessage?.message || null);
    }
  }, [toastMessage, currentMessage]);

  return (
    toastMessage && (
      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setShow(false)}
          show={show}
          delay={3000}
          autohide
          bg={toastMessage.variant} // 🎯 use variant from context
        >
          <div>{toastMessage.message}</div> {/* 🎯 use message from context */}
        </Toast>
      </ToastContainer>
    )
  );
}

export default MyToast;