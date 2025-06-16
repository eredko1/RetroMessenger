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
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    // Initialize floating bubbles
    const initialBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 40 + 20,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));
    setBubbles(initialBubbles);

    // Update time every second
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Animate bubbles
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
    }, 16); // 60fps

    return () => {
      clearInterval(timeInterval);
      clearInterval(animationInterval);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-black cursor-none select-none"
      onClick={onDismiss}
      onKeyDown={onDismiss}
      tabIndex={0}
    >
      {/* Floating Bubbles */}
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full opacity-60 pointer-events-none"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
            boxShadow: `0 0 ${bubble.size / 2}px ${bubble.color}`,
            filter: 'blur(0.5px)'
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