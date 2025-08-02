'use client'

interface HyperspeedFallbackProps {
  className?: string
}

export default function HyperspeedFallback({ className = '' }: HyperspeedFallbackProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      {/* Animated CSS stars fallback */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Moving lines for hyperspeed effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${50 + Math.random() * 100}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `hyperspeed-line ${1 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes hyperspeed-line {
          0% {
            transform: translateZ(0) scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateZ(1000px) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}