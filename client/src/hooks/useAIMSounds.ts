import { useCallback } from "react";

export function useAIMSounds() {
  // Enhanced Windows XP-style sound system
  const playSound = useCallback((soundType: string, customFreq?: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      
      switch (soundType) {
        case 'message':
          // Classic AIM message sound - two-tone chime
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
          
        case 'buddy_online':
          // Windows XP ascending chime
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'buddy_offline':
          // Windows XP descending chime
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
          
        case 'system_notification':
          // Windows XP balloon tip sound
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
          
        case 'custom':
          // Custom frequency for buddy-specific sounds
          const freq = customFreq || 700;
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(freq * 1.2, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
          
        default:
          // Default Windows ding
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.stop(audioContext.currentTime + 0.2);
      }
      
      oscillator.start(audioContext.currentTime);
    } catch (error) {
      console.log('Sound not available');
    }
  }, []);

  const playMessageSound = useCallback(() => playSound('message'), [playSound]);
  const playBuddyOnlineSound = useCallback(() => playSound('buddy_online'), [playSound]);
  const playBuddyOfflineSound = useCallback(() => playSound('buddy_offline'), [playSound]);
  const playSystemNotificationSound = useCallback(() => playSound('system_notification'), [playSound]);
  const playCustomBuddySound = useCallback((frequency?: number) => playSound('custom', frequency), [playSound]);
  
  return { 
    playMessageSound, 
    playBuddyOnlineSound, 
    playBuddyOfflineSound,
    playSystemNotificationSound,
    playCustomBuddySound,
    playSound
  };
}
