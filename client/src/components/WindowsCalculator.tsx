import { useState } from "react";
import { X, Minus, Square } from "lucide-react";

interface WindowsCalculatorProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  zIndex: number;
}

export default function WindowsCalculator({ 
  onClose, 
  onMinimize, 
  position, 
  zIndex 
}: WindowsCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay("0");
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const buttons = [
    [
      { text: "Backspace", span: 2, action: () => setDisplay(display.length > 1 ? display.slice(0, -1) : "0") },
      { text: "CE", action: clearEntry },
      { text: "C", action: clear }
    ],
    [
      { text: "MC", action: () => {} },
      { text: "MR", action: () => {} },
      { text: "MS", action: () => {} },
      { text: "M+", action: () => {} }
    ],
    [
      { text: "7", action: () => inputNumber("7") },
      { text: "8", action: () => inputNumber("8") },
      { text: "9", action: () => inputNumber("9") },
      { text: "÷", action: () => inputOperation("÷") }
    ],
    [
      { text: "4", action: () => inputNumber("4") },
      { text: "5", action: () => inputNumber("5") },
      { text: "6", action: () => inputNumber("6") },
      { text: "×", action: () => inputOperation("×") }
    ],
    [
      { text: "1", action: () => inputNumber("1") },
      { text: "2", action: () => inputNumber("2") },
      { text: "3", action: () => inputNumber("3") },
      { text: "-", action: () => inputOperation("-") }
    ],
    [
      { text: "0", action: () => inputNumber("0") },
      { text: "+/-", action: () => setDisplay(String(-parseFloat(display))) },
      { text: ".", action: inputDecimal },
      { text: "+", action: () => inputOperation("+") }
    ],
    [
      { text: "=", span: 4, action: performCalculation }
    ]
  ];

  return (
    <div
      className="fixed bg-gray-200 shadow-lg select-none"
      style={{
        left: position.x,
        top: position.y,
        width: '280px',
        height: '320px',
        zIndex: zIndex,
        border: '2px outset #c0c0c0'
      }}
    >
      {/* Title Bar */}
      <div className="h-7 px-2 flex justify-between items-center text-white text-sm font-bold"
           style={{ 
             background: 'linear-gradient(to bottom, #0078d4 0%, #1e3c72 100%)',
             borderBottom: '1px solid #316ac5'
           }}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 border border-gray-600 flex items-center justify-center">
            <span style={{ fontSize: '8px' }}>🔢</span>
          </div>
          <span>Calculator</span>
        </div>
        <div className="flex space-x-1">
          {onMinimize && (
            <button 
              className="w-5 h-4 bg-gray-300 hover:bg-gray-400 border border-gray-600 text-black text-xs flex items-center justify-center"
              onClick={onMinimize}
            >
              <Minus className="w-3 h-3" />
            </button>
          )}
          <button 
            className="w-5 h-4 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs flex items-center justify-center"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-6 px-2 flex items-center text-xs bg-gray-100 border-b border-gray-300">
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
      </div>

      {/* Display */}
      <div className="p-2">
        <div className="bg-white border-2 border-inset p-2 mb-2 text-right text-lg font-mono h-8 flex items-center justify-end"
             style={{ borderColor: '#8b8b8b' }}>
          {display}
        </div>

        {/* Button Grid */}
        <div className="space-y-1">
          {buttons.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-1">
              {row.map((button, buttonIndex) => (
                <button
                  key={buttonIndex}
                  className="h-8 bg-gray-300 hover:bg-gray-400 border-2 border-outset text-sm font-medium"
                  style={{ 
                    width: button.span ? `${button.span * 25 + (button.span - 1) * 4}%` : '25%',
                    borderColor: '#c0c0c0'
                  }}
                  onClick={button.action}
                >
                  {button.text}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}