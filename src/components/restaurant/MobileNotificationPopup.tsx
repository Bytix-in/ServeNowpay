'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, DollarSign } from 'lucide-react';

interface NotificationPopupProps {
  show: boolean;
  title: string;
  message: string;
  amount?: number;
  onClose: () => void;
  onClick?: () => void;
}

export default function MobileNotificationPopup({
  show,
  title,
  message,
  amount,
  onClose,
  onClick
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    handleClose();
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 0.3 : 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[9998] md:hidden"
            onClick={handleClose}
          />
          
          {/* Notification popup */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              y: -50
            }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              scale: isVisible ? 1 : 0.8,
              y: isVisible ? 0 : -50
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: -50
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed top-4 left-4 right-4 md:top-6 md:left-auto md:right-6 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-green-200 z-[9999] overflow-hidden"
            onClick={handleClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-green-100 text-sm">New paid order received</p>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Animated pulse effect */}
              <div className="absolute inset-0 bg-white/10 animate-pulse rounded-t-2xl" />
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="space-y-2">
                {message.split('\n').map((line, index) => (
                  <p key={index} className="text-gray-800 font-medium">
                    {line}
                  </p>
                ))}
              </div>
              
              {amount && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-800">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              )}
              
              {onClick && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Tap to view order details
                  </p>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className="h-1 bg-green-500"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}