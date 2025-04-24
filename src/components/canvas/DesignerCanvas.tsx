
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DesignerCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export function DesignerCanvas({ width = 800, height = 600, className }: DesignerCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Simple initial implementation with placeholder
  return (
    <div className="overflow-auto h-full flex items-center justify-center bg-gray-100 p-4">
      <div 
        ref={canvasRef}
        className={cn(
          "designer-canvas relative border border-gray-200 shadow-md mx-auto transition-all",
          className
        )}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Canvas area - drag components here
            <br />
            <span className="text-sm">{width} x {height}px</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DesignerCanvas;
