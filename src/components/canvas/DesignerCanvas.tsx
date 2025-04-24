
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTemplate } from "@/hooks/useTemplate";
import { toast } from "sonner";

interface DesignerCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export function DesignerCanvas({ width = 800, height = 600, className }: DesignerCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { components, addComponent, updateComponent, error } = useTemplate();
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedComponent) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = (e.clientX - canvasRect.left) / scale;
    const y = (e.clientY - canvasRect.top) / scale;

    addComponent({
      type: draggedComponent as any,
      content: '',
      properties: {
        x,
        y,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: components?.length || 0
      }
    });

    setDraggedComponent(null);
  };

  return (
    <div className="overflow-auto h-full flex items-center justify-center bg-gray-100 p-4">
      <div 
        ref={canvasRef}
        className={cn(
          "designer-canvas relative border border-gray-200 shadow-md mx-auto transition-all bg-white",
          className
        )}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {components?.map((component) => (
          <div
            key={component.id}
            className="absolute border border-transparent hover:border-brand-500"
            style={{
              left: component.properties.x,
              top: component.properties.y,
              width: component.properties.width,
              height: component.properties.height,
              transform: `rotate(${component.properties.rotation}deg)`,
              zIndex: component.properties.zIndex,
            }}
          >
            {component.content || component.type}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DesignerCanvas;
