import { useState } from "react";
import WindowComponent from "./WindowComponent";

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
  const [memory, setMemory] = useState(0);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const memorySubtract = () => {
    setMemory(memory - parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
  };

  const buttonStyle = "h-8 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-black text-sm font-medium";
  const operatorStyle = "h-8 bg-blue-200 hover:bg-blue-300 border border-blue-400 text-black text-sm font-medium";

  return (
    <WindowComponent
      title="Calculator"
      position={position}
      size={{ width: 280, height: 320 }}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      resizable={false}
      className="text-xs"
    >
      <div className="p-2 bg-gray-100 h-full flex flex-col">
        {/* Menu Bar */}
        <div className="h-6 flex items-center text-xs bg-gray-100 border-b border-gray-300 mb-2">
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
        </div>

        {/* Display */}
        <div className="mb-2 p-2 bg-white border-2 border-gray-400 text-right text-lg font-mono"
             style={{ borderStyle: 'inset' }}>
          {display}
        </div>

        {/* Memory Buttons */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          <button className={buttonStyle} onClick={() => setDisplay("0")}>Backspace</button>
          <button className={buttonStyle} onClick={clear}>CE</button>
          <button className={buttonStyle} onClick={clear}>C</button>
          <button className={buttonStyle} onClick={memoryClear}>MC</button>
          <button className={buttonStyle} onClick={memoryRecall}>MR</button>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-2">
          <button className={buttonStyle} onClick={memoryAdd}>M+</button>
          <button className={buttonStyle} onClick={memorySubtract}>M-</button>
          <button className={buttonStyle} onClick={() => setDisplay(String(-parseFloat(display)))}>+/-</button>
          <button className={buttonStyle} onClick={() => setDisplay(String(Math.sqrt(parseFloat(display))))}>sqrt</button>
          <button className={operatorStyle} onClick={() => performOperation("/")}>/</button>
        </div>

        {/* Number Buttons */}
        <div className="grid grid-cols-4 gap-1 flex-1">
          <button className={buttonStyle} onClick={() => inputNumber("7")}>7</button>
          <button className={buttonStyle} onClick={() => inputNumber("8")}>8</button>
          <button className={buttonStyle} onClick={() => inputNumber("9")}>9</button>
          <button className={operatorStyle} onClick={() => performOperation("*")}>*</button>

          <button className={buttonStyle} onClick={() => inputNumber("4")}>4</button>
          <button className={buttonStyle} onClick={() => inputNumber("5")}>5</button>
          <button className={buttonStyle} onClick={() => inputNumber("6")}>6</button>
          <button className={operatorStyle} onClick={() => performOperation("-")}>-</button>

          <button className={buttonStyle} onClick={() => inputNumber("1")}>1</button>
          <button className={buttonStyle} onClick={() => inputNumber("2")}>2</button>
          <button className={buttonStyle} onClick={() => inputNumber("3")}>3</button>
          <button className={operatorStyle} onClick={() => performOperation("+")}>+</button>

          <button className={`${buttonStyle} col-span-2`} onClick={() => inputNumber("0")}>0</button>
          <button className={buttonStyle} onClick={inputDecimal}>.</button>
          <button className={operatorStyle} onClick={() => performOperation("=")}>=</button>
        </div>
      </div>
    </WindowComponent>
  );
}