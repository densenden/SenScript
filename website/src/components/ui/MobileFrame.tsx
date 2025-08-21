'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onRotate?: () => void;
  orientation?: 'portrait' | 'landscape';
}

export function MobileFrame({ 
  children, 
  isExpanded = false,
  onToggleExpanded,
  onRotate,
  orientation = 'portrait'
}: MobileFrameProps) {
  const [isRotated, setIsRotated] = useState(orientation === 'landscape');

  const handleRotate = () => {
    setIsRotated(!isRotated);
    onRotate?.();
  };

  const frameClasses = isRotated 
    ? 'w-[640px] h-[360px] max-w-[90vw]' // Landscape
    : 'w-[360px] h-[640px] max-w-[90vw]'; // Portrait

  const expandedClasses = isExpanded
    ? 'scale-125 lg:scale-150'
    : 'scale-100';

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleRotate}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Rotate</span>
        </button>
        
        <button
          onClick={onToggleExpanded}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm">Minimize</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span className="text-sm">Expand</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Frame */}
      <motion.div
        className={`relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl ${frameClasses} ${expandedClasses}`}
        animate={{
          rotate: isRotated ? 90 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        {/* Phone Frame Details */}
        <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
          {/* Notch (Portrait) */}
          {!isRotated && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
          )}
          
          {/* Screen Content */}
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/10 to-transparent z-20 flex items-center justify-between px-6 text-xs text-gray-600 dark:text-gray-400">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 border border-current rounded-sm">
                  <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* App Content */}
            <div className="pt-12 h-full">
              {children}
            </div>
          </div>

          {/* Home Indicator (Portrait) */}
          {!isRotated && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
          )}
        </div>
      </motion.div>

      {/* Device Label */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Interactive SenScript Demo</p>
        <p className="text-xs">
          {isRotated ? 'Landscape Mode' : 'Portrait Mode'} • 
          {isExpanded ? ' Expanded View' : ' Normal View'}
        </p>
      </div>
    </div>
  );
}

export default MobileFrame;