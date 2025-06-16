import { useState, useEffect } from 'react';

interface ScreensaverProps {
  isActive: boolean;
  onDismiss: () => void;
}

export default function Screensaver({ isActive, onDismiss }: ScreensaverProps) {
  const [time, setTime] = useState(new Date());
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    opacity: number;
  }>>([]);
  const [stars, setStars] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    twinkleSpeed: number;
    brightness: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    // Initialize floating bubbles with enhanced colors
    const initialBubbles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 60 + 30,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
      color: `hsl(${Math.random() * 60 + 180}, 80%, 70%)`, // Blue/cyan range
      opacity: Math.random() * 0.6 + 0.3
    }));
    setBubbles(initialBubbles);

    // Initialize twinkling stars
    const initialStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      brightness: Math.random()
    }));
    setStars(initialStars);

    // Update time every second
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Animate bubbles and stars
    const animationInterval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => {
        let newX = bubble.x + bubble.speedX;
        let newY = bubble.y + bubble.speedY;
        let newSpeedX = bubble.speedX;
        let newSpeedY = bubble.speedY;

        // Bounce off edges
        if (newX <= 0 || newX >= window.innerWidth - bubble.size) {
          newSpeedX = -newSpeedX;
          newX = Math.max(0, Math.min(window.innerWidth - bubble.size, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight - bubble.size) {
          newSpeedY = -newSpeedY;
          newY = Math.max(0, Math.min(window.innerHeight - bubble.size, newY));
        }

        return {
          ...bubble,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY
        };
      }));

      // Animate star twinkling
      setStars(prev => prev.map(star => ({
        ...star,
        brightness: Math.abs(Math.sin(Date.now() * star.twinkleSpeed))
      })));
    }, 16); // 60fps

    return () => {
      clearInterval(timeInterval);
      clearInterval(animationInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-50 cursor-none select-none"
      style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #87CEEB 50%, #98FB98 75%, #90EE90 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
      onClick={onDismiss}
      onKeyDown={onDismiss}
      tabIndex={0}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Twinkling Stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            backgroundColor: '#ffffff',
            opacity: star.brightness * 0.8,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,${star.brightness * 0.5})`
          }}
        />
      ))}

      {/* Enhanced Floating Bubbles */}
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${bubble.color})`,
            opacity: bubble.opacity,
            boxShadow: `0 0 ${bubble.size}px ${bubble.color}, inset 0 0 ${bubble.size / 3}px rgba(255,255,255,0.3)`,
            filter: 'blur(1px)'
          }}
        />
      ))}

      {/* Clock Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl font-light tracking-wider mb-4 drop-shadow-2xl">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-2xl font-light opacity-80 drop-shadow-xl">
            {time.toLocaleDateString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="mt-8 text-lg opacity-60">
            Move mouse or press any key to continue
          </div>
        </div>
      </div>

      {/* Subtle Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}