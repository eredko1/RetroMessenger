import { useState } from "react";

interface DesktopIconsProps {
  onOpenApplication?: (appName: string) => void;
}

export default function DesktopIcons({ onOpenApplication }: DesktopIconsProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  const icons = [
    { 
      name: "My Computer", 
      icon: "💻", 
      x: 20, 
      y: 20,
      app: "explorer"
    },
    { 
      name: "Recycle Bin", 
      icon: "🗑️", 
      x: 20, 
      y: 100,
      app: "recycle"
    },
    { 
      name: "My Documents", 
      icon: "📁", 
      x: 20, 
      y: 180,
      app: "documents"
    },
    { 
      name: "Internet Explorer", 
      icon: "🌐", 
      x: 20, 
      y: 260,
      app: "internet-explorer"
    },
    { 
      name: "Windows Media Player", 
      icon: "🎵", 
      x: 20, 
      y: 340,
      app: "mediaplayer"
    },
    { 
      name: "Notepad", 
      icon: "📝", 
      x: 20, 
      y: 420,
      app: "notepad"
    },
    { 
      name: "Paint", 
      icon: "🎨", 
      x: 20, 
      y: 500,
      app: "paint"
    },
    { 
      name: "Calculator", 
      icon: "🔢", 
      x: 120, 
      y: 20,
      app: "calculator"
    },
    { 
      name: "Solitaire", 
      icon: "🃏", 
      x: 120, 
      y: 100,
      app: "solitaire"
    },
    { 
      name: "Minesweeper", 
      icon: "💣", 
      x: 120, 
      y: 180,
      app: "minesweeper"
    },

  ];

  const handleIconClick = (icon: any) => {
    setSelectedIcon(icon.name);
    console.log('Desktop icon clicked:', icon.name, icon.app);
    // Single click opens application immediately for touch devices
    if (onOpenApplication) {
      console.log('Calling onOpenApplication with:', icon.app);
      onOpenApplication(icon.app);
    }
  };

  return (
    <>
      {icons.map((icon) => (
        <div
          key={icon.name}
          className={`absolute cursor-pointer select-none group ${
            selectedIcon === icon.name ? 'bg-blue-500 bg-opacity-30' : ''
          }`}
          style={{ left: icon.x, top: icon.y }}
          onClick={() => handleIconClick(icon)}
        >
          <div className="flex flex-col items-center p-2 w-20 h-20 hover:bg-blue-200 hover:bg-opacity-50 rounded">
            <div className="text-2xl mb-1 filter drop-shadow-sm">{icon.icon}</div>
            <div className={`text-white text-xs text-center font-medium drop-shadow-lg px-1 rounded max-w-full break-words leading-tight ${
              selectedIcon === icon.name ? 'bg-blue-600' : 'group-hover:bg-blue-600'
            }`}>
              {icon.name}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}