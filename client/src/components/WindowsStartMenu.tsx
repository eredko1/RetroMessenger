import { useState } from "react";
import { Power, User, Settings, Search, HelpCircle, Folder, Calculator, FileText, Palette, Monitor, Music, GamepadIcon, Bomb } from "lucide-react";

interface WindowsStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApplication: (appType: string) => void;
  onShowDesktop: () => void;
  onLogout: () => void;
  user: any;
}

export default function WindowsStartMenu({ 
  isOpen, 
  onClose, 
  onOpenApplication, 
  onShowDesktop, 
  onLogout, 
  user 
}: WindowsStartMenuProps) {
  if (!isOpen) return null;

  const applications = [
    { name: "My Computer", icon: <Monitor className="w-5 h-5" />, app: "explorer" },
    { name: "My Documents", icon: <Folder className="w-5 h-5" />, app: "documents" },
    { name: "Internet Explorer", icon: "🌐", app: "internet-explorer" },
    { name: "Calculator", icon: <Calculator className="w-5 h-5" />, app: "calculator" },
    { name: "Notepad", icon: <FileText className="w-5 h-5" />, app: "notepad" },
    { name: "Paint", icon: <Palette className="w-5 h-5" />, app: "paint" },
    { name: "Windows Media Player", icon: <Music className="w-5 h-5" />, app: "mediaplayer" },
    { name: "Solitaire", icon: <GamepadIcon className="w-5 h-5" />, app: "solitaire" },
    { name: "Minesweeper", icon: <Bomb className="w-5 h-5" />, app: "minesweeper" },
    { name: "Recycle Bin", icon: "🗑️", app: "recycle" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Start Menu */}
      <div className="fixed bottom-8 left-0 z-50 w-80 bg-white shadow-2xl border-2 border-gray-400"
           style={{ 
             background: 'linear-gradient(to bottom, #245cdc 0%, #245cdc 50px, #ffffff 50px)',
             borderStyle: 'outset',
             borderWidth: '2px'
           }}>
        
        {/* Header */}
        <div className="h-12 px-4 flex items-center text-white font-bold text-lg"
             style={{ background: 'linear-gradient(to right, #245cdc, #4a7ce8)' }}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-white">{user?.screenName || 'User'}</span>
        </div>

        {/* Applications - Scrollable */}
        <div className="p-2 max-h-96 overflow-y-auto">
          {applications.map((app) => (
            <div
              key={app.name}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-blue-100 cursor-pointer rounded transition-colors"
              onClick={() => {
                console.log('Start menu opening app:', app.app);
                onOpenApplication(app.app);
                onClose();
              }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {typeof app.icon === 'string' ? (
                  <span className="text-lg">{app.icon}</span>
                ) : (
                  <div className="text-blue-600">{app.icon}</div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-800">{app.name}</span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-300 mx-2" />

        {/* System Options */}
        <div className="p-2">
          <div
            className="flex items-center space-x-3 px-3 py-2 hover:bg-blue-100 cursor-pointer rounded"
            onClick={() => {
              onShowDesktop();
              onClose();
            }}
          >
            <Monitor className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Show Desktop</span>
          </div>
          
          <div
            className="flex items-center space-x-3 px-3 py-2 hover:bg-blue-100 cursor-pointer rounded"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <Power className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Log Off</span>
          </div>
        </div>
      </div>
    </>
  );
}