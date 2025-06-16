import { useState } from "react";

interface DesktopIconsProps {
  onOpenApplication?: (appName: string) => void;
  onOpenBuddyList?: () => void;
}

export default function DesktopIcons({ onOpenApplication, onOpenBuddyList }: DesktopIconsProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleIconClick = (iconName: string, action?: () => void) => {
    console.log('Desktop icon clicked:', iconName);
    setSelectedIcon(iconName);
    
    // Execute immediately on click
    if (action) {
      console.log('Executing custom action for:', iconName);
      action();
    } else if (onOpenApplication) {
      console.log('Opening application:', iconName);
      onOpenApplication(iconName);
    }
  };

  const openWebsite = (url: string) => {
    // Open in new tab instead of iframe to avoid CORS issues
    window.open(url, '_blank');
  };

  const desktopIcons = [
    {
      id: 'my-computer',
      name: 'My Computer',
      icon: '💻',
      x: 20,
      y: 20,
      action: () => {
        console.log('My Computer clicked, calling onOpenApplication with explorer');
        if (onOpenApplication) {
          onOpenApplication('explorer');
        }
      }
    },
    {
      id: 'recycle-bin',
      name: 'Recycle Bin',
      icon: '🗑️',
      x: 20,
      y: 100,
      action: () => {
        console.log('Recycle Bin clicked');
        if (onOpenApplication) onOpenApplication('recycle');
      }
    },
    {
      id: 'my-documents',
      name: 'My Documents',
      icon: '📁',
      x: 20,
      y: 180,
      action: () => {
        console.log('My Documents clicked');
        if (onOpenApplication) onOpenApplication('documents');
      }
    },
    {
      id: 'internet-explorer',
      name: 'Internet Explorer',
      icon: '🌐',
      x: 20,
      y: 260,
      action: () => {
        console.log('Internet Explorer clicked');
        if (onOpenApplication) onOpenApplication('internet-explorer');
      }
    },
    {
      id: 'media-player',
      name: 'Windows Media Player',
      icon: '🎵',
      x: 20,
      y: 340,
      action: () => {
        console.log('Media Player clicked');
        if (onOpenApplication) onOpenApplication('mediaplayer');
      }
    },
    {
      id: 'paint',
      name: 'Paint',
      icon: '🎨',
      x: 20,
      y: 420,
      action: () => {
        console.log('Paint clicked');
        if (onOpenApplication) onOpenApplication('paint');
      }
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🔢',
      x: 120,
      y: 20,
      action: () => {
        console.log('Calculator clicked');
        if (onOpenApplication) onOpenApplication('calculator');
      }
    },
    {
      id: 'notepad',
      name: 'Notepad',
      icon: '📝',
      x: 120,
      y: 100,
      action: () => {
        console.log('Notepad clicked');
        if (onOpenApplication) onOpenApplication('notepad');
      }
    },
    {
      id: 'solitaire',
      name: 'Solitaire',
      icon: '🃏',
      x: 120,
      y: 180,
      action: () => {
        console.log('Solitaire clicked');
        if (onOpenApplication) onOpenApplication('solitaire');
      }
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      icon: '💣',
      x: 120,
      y: 260,
      action: () => {
        console.log('Minesweeper clicked');
        if (onOpenApplication) onOpenApplication('minesweeper');
      }
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: '☁️',
      x: 220,
      y: 20,
      action: () => {
        console.log('Google Drive clicked');
        if (onOpenApplication) onOpenApplication('google-drive');
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      x: 220,
      y: 100,
      action: () => {
        console.log('Telegram clicked');
        if (onOpenApplication) onOpenApplication('telegram');
      }
    },
    {
      id: 'replit',
      name: 'Replit',
      icon: '🔧',
      x: 220,
      y: 180,
      action: () => {
        console.log('Replit clicked');
        if (onOpenApplication) onOpenApplication('replit');
      }
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      x: 220,
      y: 260,
      action: () => {
        console.log('OpenAI clicked');
        if (onOpenApplication) onOpenApplication('openai');
      }
    },
    {
      id: 'gemini',
      name: 'Gemini',
      icon: '💎',
      x: 220,
      y: 340,
      action: () => {
        console.log('Gemini clicked');
        if (onOpenApplication) onOpenApplication('gemini');
      }
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className={`absolute pointer-events-auto cursor-pointer select-none transition-all duration-200 rounded-lg ${
            selectedIcon === icon.id ? 'bg-blue-500 bg-opacity-40 scale-105' : 'hover:bg-blue-300 hover:bg-opacity-30 hover:scale-102'
          }`}
          style={{
            left: icon.x,
            top: icon.y,
            width: '80px',
            height: '80px'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            icon.action();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            setSelectedIcon(icon.id);
          }}
        >
          <div className="flex flex-col items-center justify-center h-full p-2">
            <div className="text-2xl mb-1">{icon.icon}</div>
            <div className="text-xs text-white text-center leading-tight drop-shadow-lg">
              {icon.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}