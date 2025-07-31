"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  restaurantName?: string;
  restaurantSlug: string;
  onGetStarted: () => void;
}

export default function WelcomeScreen({ 
  restaurantName = "Restaurant", 
  restaurantSlug,
  onGetStarted 
}: WelcomeScreenProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  // Motion values for the swipe button
  const x = useMotionValue(0);
  const buttonWidth = 260; // Total button width (matching the div width)
  const sliderWidth = 52; // Slider circle width (60px - 8px for proper fit)
  const maxDrag = buttonWidth - sliderWidth - 8; // Max drag distance (minus padding)
  
  // Transform the x position to opacity and scale for visual feedback
  const opacity = useTransform(x, [0, maxDrag], [0.7, 1]);
  const scale = useTransform(x, [0, maxDrag], [1, 1.05]);
  
  // Slide to unlock animation values
  const fillProgress = useTransform(x, [0, maxDrag], [0, 1]);
  const fillWidth = useTransform(x, [0, maxDrag], [0, buttonWidth]);
  const textOpacity = useTransform(x, [0, maxDrag * 0.3], [1, 0]);
  const successTextOpacity = useTransform(x, [maxDrag * 0.7, maxDrag], [0, 1]);

  const handleGetStarted = async () => {
    setIsLoading(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      onGetStarted();
      setIsLoading(false);
    }, 500);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.x;
    const threshold = maxDrag * 0.8; // 80% of the way
    
    if (dragDistance >= threshold && !isCompleted) {
      // Complete the swipe
      setIsCompleted(true);
      x.set(maxDrag);
      
      // Trigger the action after a short delay
      setTimeout(() => {
        handleGetStarted();
      }, 300);
    } else {
      // Snap back to start
      x.set(0);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-purple-900 via-violet-800 to-pink-900 flex flex-col items-center justify-between px-4 py-6 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-purple-900/30"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent"></div>
      {/* Restaurant Branding */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center flex-shrink-0"
      >
        <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          {restaurantName}
        </h2>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto flex-1 justify-center">
        
        {/* Biryani Dish Image */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          className="mb-6"
        >
          <div className="relative">
            {/* Bowl Shadow */}
            <div className="absolute inset-0 bg-black/30 rounded-full blur-xl transform translate-y-4 scale-110"></div>
            
            {/* Wooden Bowl */}
            <div className="relative w-64 h-64 bg-gradient-to-br from-amber-800 to-amber-900 rounded-full p-2 shadow-2xl">
              {/* Bowl Inner */}
              <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-800 rounded-full p-3 shadow-inner">
                {/* Biryani Content */}
                <div className="relative w-full h-full bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full overflow-hidden">
                  
                  {/* Rice Base */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full"></div>
                  
                  {/* Saffron Rice Layers */}
                  <div className="absolute inset-3 bg-gradient-to-br from-yellow-300 to-orange-200 rounded-full opacity-80"></div>
                  <div className="absolute inset-6 bg-gradient-to-br from-white to-yellow-100 rounded-full opacity-60"></div>
                  
                  {/* Chicken Pieces */}
                  <div className="absolute top-8 left-12 w-10 h-6 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg transform rotate-12 shadow-md"></div>
                  <div className="absolute top-14 right-10 w-8 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg transform -rotate-6 shadow-md"></div>
                  <div className="absolute bottom-12 left-10 w-6 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg transform rotate-45 shadow-md"></div>
                  
                  {/* Fried Onions */}
                  <div className="absolute top-12 right-16 w-5 h-3 bg-gradient-to-br from-amber-800 to-amber-900 rounded-full transform rotate-12"></div>
                  <div className="absolute bottom-16 right-12 w-3 h-2 bg-gradient-to-br from-amber-700 to-amber-800 rounded-full"></div>
                  <div className="absolute top-18 left-16 w-4 h-2 bg-gradient-to-br from-amber-800 to-amber-900 rounded-full transform -rotate-12"></div>
                  
                  {/* Mint Garnish */}
                  <div className="absolute top-6 left-18 w-3 h-5 bg-green-500 rounded-full transform rotate-45"></div>
                  <div className="absolute top-8 left-20 w-2 h-4 bg-green-400 rounded-full transform -rotate-12"></div>
                  <div className="absolute bottom-10 right-16 w-2 h-3 bg-green-500 rounded-full transform rotate-30"></div>
                  
                  {/* Spices/Cardamom */}
                  <div className="absolute top-1/2 left-1/2 w-1 h-2 bg-green-800 rounded-full transform -translate-x-1/2 -translate-y-4"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-2 bg-green-700 rounded-full transform -translate-x-1/2 translate-y-2 rotate-45"></div>
                  
                  {/* Star Anise */}
                  <div className="absolute top-1/3 right-1/3">
                    <div className="w-2 h-2 bg-amber-900 rounded-full relative">
                      <div className="absolute inset-0 bg-amber-800 rounded-full transform rotate-45"></div>
                    </div>
                  </div>
                  
                  {/* Yellow Napkin/Cloth */}
                  <div className="absolute -top-1 -right-3 w-12 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 transform rotate-12 rounded-lg shadow-lg opacity-90"></div>
                  
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mb-2 leading-tight drop-shadow-lg">
            Craving something special?
          </h1>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-purple-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
            Your chef's menu awaits
          </h1>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 flex-shrink-0 flex flex-col items-center"
      >
        {/* Powered by ServeNow Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mb-4 text-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-pink-500/30 hover:border-violet-400/50 hover:bg-black/30 transition-all duration-300 cursor-pointer group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.open('https://servenow.com', '_blank')}
          >
            {/* ServeNow Logo/Icon */}
            <motion.div
              className="w-5 h-5 bg-gradient-to-r from-pink-500 via-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </motion.div>
            
            <span className="text-white/80 text-sm font-medium">
              Powered by{" "}
              <span className="text-white font-semibold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-violet-300 transition-all duration-300">
                ServeNow
              </span>
            </span>
          </motion.div>
        </motion.div>

        {/* Slide to Unlock Button */}
        <div className="flex justify-center w-full">
          <div 
            ref={constraintsRef}
            className="relative w-[260px] h-[60px] mx-auto overflow-hidden rounded-full"
          >
            {/* Button Background - Premium dark base */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-gray-900/80 rounded-full shadow-2xl border border-pink-500/30 backdrop-blur-sm" />
            
            {/* Progressive Fill Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-violet-600 via-purple-600 to-pink-500 rounded-full shadow-2xl"
              style={{
                width: fillWidth,
                transformOrigin: "left center"
              }}
            />
            
            {/* Text - "Slide to unlock" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-white/90 font-semibold text-base select-none drop-shadow-sm"
                style={{ opacity: textOpacity }}
              >
                {isLoading ? "Loading..." : "Slide to unlock"}
              </motion.span>
            </div>
            
            {/* Success Text - "Welcome!" */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isCompleted ? 1 : 0,
                scale: isCompleted ? 1 : 0.8 
              }}
              style={{ opacity: successTextOpacity }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <span className="text-white font-bold text-lg">Welcome! 🎉</span>
            </motion.div>
            
            {/* Shimmer Effect - CONTAINED within button */}
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
              style={{
                width: fillWidth
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: [-100, 300],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ width: "100px" }}
              />
            </motion.div>
            
            {/* Draggable Slider Circle */}
            <motion.div
              className="absolute left-1 top-1 w-[52px] h-[52px] rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center z-10"
              style={{ x, scale }}
              drag="x"
              dragConstraints={{ left: 0, right: maxDrag }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1 }}
              animate={{
                x: isCompleted ? maxDrag : undefined,
                backgroundColor: isCompleted ? "#ffffff" : "#ec4899"
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              ) : (
                <ArrowRight className="w-5 h-5 text-white drop-shadow-sm" />
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Instruction Text */}
        <motion.p
          className="text-white/70 text-sm text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isCompleted ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          Swipe to continue →
        </motion.p>
      </motion.div>
    </div>
  );
}