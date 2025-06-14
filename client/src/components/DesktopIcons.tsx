export default function DesktopIcons() {
  const icons = [
    { name: "My Computer", icon: "🖥️", x: 20, y: 20 },
    { name: "Recycle Bin", icon: "🗑️", x: 20, y: 100 },
    { name: "My Documents", icon: "📁", x: 20, y: 180 },
    { name: "Internet Explorer", icon: "🌐", x: 20, y: 260 }
  ];

  return (
    <>
      {icons.map((icon) => (
        <div
          key={icon.name}
          className="absolute cursor-pointer select-none group"
          style={{ left: icon.x, top: icon.y }}
        >
          <div className="flex flex-col items-center p-2 rounded hover:bg-blue-200 hover:bg-opacity-50">
            <div className="text-2xl mb-1">{icon.icon}</div>
            <div className="text-white text-xs text-center font-bold drop-shadow-lg group-hover:bg-blue-600 group-hover:text-white px-1 rounded">
              {icon.name}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}