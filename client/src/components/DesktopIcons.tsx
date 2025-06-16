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
    
    // Single click launches application immediately
    setTimeout(() => {
      if (action) {
        console.log('Executing custom action for:', iconName);
        action();
      } else if (onOpenApplication) {
        console.log('Opening application:', iconName);
        onOpenApplication(iconName);
      }
    }, 100);
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
      action: () => handleIconClick('explorer')
    },
    {
      id: 'recycle-bin',
      name: 'Recycle Bin',
      icon: '🗑️',
      x: 20,
      y: 100,
      action: () => handleIconClick('recycle')
    },
    {
      id: 'my-documents',
      name: 'My Documents',
      icon: '📁',
      x: 20,
      y: 180,
      action: () => handleIconClick('explorer')
    },
    {
      id: 'internet-explorer',
      name: 'Internet Explorer',
      icon: '🌐',
      x: 20,
      y: 260,
      action: () => handleIconClick('internet-explorer')
    },
    {
      id: 'media-player',
      name: 'Windows Media Player',
      icon: '🎵',
      x: 20,
      y: 340,
      action: () => handleIconClick('mediaplayer')
    },
    {
      id: 'paint',
      name: 'Paint',
      icon: '🎨',
      x: 20,
      y: 420,
      action: () => handleIconClick('paint')
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🔢',
      x: 120,
      y: 20,
      action: () => handleIconClick('calculator')
    },
    {
      id: 'notepad',
      name: 'Notepad',
      icon: '📝',
      x: 120,
      y: 100,
      action: () => handleIconClick('notepad')
    },
    {
      id: 'solitaire',
      name: 'Solitaire',
      icon: '🃏',
      x: 120,
      y: 180,
      action: () => handleIconClick('solitaire')
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      icon: '💣',
      x: 120,
      y: 260,
      action: () => handleIconClick('minesweeper')
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: '☁️',
      x: 220,
      y: 20,
      action: () => openWebsite('https://drive.google.com')
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      x: 220,
      y: 100,
      action: () => openWebsite('https://web.telegram.org')
    },
    {
      id: 'replit',
      name: 'Replit',
      icon: '🔧',
      x: 220,
      y: 180,
      action: () => openWebsite('https://replit.com')
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      x: 220,
      y: 260,
      action: () => openWebsite('https://chat.openai.com')
    },
    {
      id: 'gemini',
      name: 'Gemini',
      icon: '💎',
      x: 220,
      y: 340,
      action: () => openWebsite('https://gemini.google.com')
    }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className={`absolute pointer-events-auto cursor-pointer select-none transition-all duration-200 ${
            selectedIcon === icon.id ? 'bg-blue-500 bg-opacity-30' : 'hover:bg-blue-300 hover:bg-opacity-20'
          }`}
          style={{
            left: icon.x,
            top: icon.y,
            width: '80px',
            height: '80px'
          }}
          onClick={icon.action}
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