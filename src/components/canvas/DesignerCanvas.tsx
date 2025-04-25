
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTemplate } from "@/hooks/useTemplate";
import { toast } from "sonner";
import { fabric } from 'fabric';
import { CertificateComponent } from "@/lib/types";

interface DesignerCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  templateId?: string;
  draggedComponent?: string | null;
  onSelectComponent?: (component: CertificateComponent | null) => void;
}

export function DesignerCanvas({ 
  width = 800, 
  height = 600, 
  className, 
  templateId,
  draggedComponent,
  onSelectComponent
}: DesignerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [scale, setScale] = useState(1);
  const { components, addComponent, updateComponent, error, isLoading } = useTemplate(templateId);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'white',
      selection: true,
    });
    
    setFabricCanvas(canvas);
    
    // Set up event listeners
    canvas.on('selection:created', (e) => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && activeObj.data) {
        onSelectComponent?.(activeObj.data);
      }
    });
    
    canvas.on('selection:cleared', () => {
      onSelectComponent?.(null);
    });
    
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && obj.data && obj.data.id) {
        const { left, top, width, height, angle } = obj;
        
        // Update component in database
        updateComponent(obj.data.id, {
          properties: {
            ...obj.data.properties,
            x: left,
            y: top,
            width: width! * obj.scaleX!,
            height: height! * obj.scaleY!,
            rotation: angle || 0,
          }
        });
      }
    });
    
    return () => {
      canvas.dispose();
    };
  }, [width, height, onSelectComponent, updateComponent]);
  
  // Load components when they change
  useEffect(() => {
    if (!fabricCanvas || !components) return;
    
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'white';
    
    components.forEach(component => {
      let obj;
      
      switch (component.type) {
        case 'text':
          obj = new fabric.Textbox(component.content || 'Text', {
            left: component.properties.x,
            top: component.properties.y,
            width: component.properties.width,
            fontSize: component.properties.fontSize || 20,
            fill: component.properties.color || 'black',
            fontFamily: component.properties.fontFamily || 'Arial',
          });
          break;
          
        case 'image':
          if (component.content) {
            fabric.Image.fromURL(component.content, (img) => {
              img.set({
                left: component.properties.x,
                top: component.properties.y,
                scaleX: component.properties.width / img.width!,
                scaleY: component.properties.height / img.height!,
                angle: component.properties.rotation || 0,
              });
              img.data = component;
              fabricCanvas.add(img);
              fabricCanvas.renderAll();
            });
          } else {
            obj = new fabric.Rect({
              left: component.properties.x,
              top: component.properties.y,
              width: component.properties.width,
              height: component.properties.height,
              fill: '#f0f0f0',
              stroke: '#ddd',
              strokeWidth: 1,
            });
          }
          break;
          
        case 'shape':
          obj = new fabric.Rect({
            left: component.properties.x,
            top: component.properties.y,
            width: component.properties.width,
            height: component.properties.height,
            fill: component.properties.color || '#e0e0e0',
            stroke: component.properties.borderColor || '#c0c0c0',
            strokeWidth: component.properties.borderWidth || 1,
            rx: component.properties.borderRadius || 0,
            ry: component.properties.borderRadius || 0,
            angle: component.properties.rotation || 0,
          });
          break;
          
        case 'qrcode':
          // Placeholder for QR code
          obj = new fabric.Rect({
            left: component.properties.x,
            top: component.properties.y,
            width: component.properties.width,
            height: component.properties.height,
            fill: '#f0f0f0',
            stroke: '#ddd',
            strokeWidth: 1,
          });
          // Display QR code label
          const qrLabel = new fabric.Text('QR Code', {
            left: component.properties.x + component.properties.width / 2,
            top: component.properties.y + component.properties.height / 2,
            fontSize: 14,
            originX: 'center',
            originY: 'center',
            fill: '#666'
          });
          fabricCanvas.add(qrLabel);
          break;
          
        case 'variable':
          obj = new fabric.Textbox(component.content || '{{Variable}}', {
            left: component.properties.x,
            top: component.properties.y,
            width: component.properties.width,
            fontSize: component.properties.fontSize || 20,
            fill: '#0066cc',
            fontStyle: 'italic',
          });
          break;
      }
      
      if (obj) {
        obj.data = component;
        fabricCanvas.add(obj);
      }
    });
    
    fabricCanvas.renderAll();
  }, [components, fabricCanvas]);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedComponent || !templateId || !fabricCanvas) {
      toast.error("Cannot add component: missing component type or template ID");
      return;
    }
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    // Calculate position relative to canvas
    const canvasPos = fabricCanvas.getPointer(e);
    const x = canvasPos.x;
    const y = canvasPos.y;
    
    console.log(`Adding component: ${draggedComponent} at x:${x}, y:${y} to template ${templateId}`);
    
    let defaultWidth = 200;
    let defaultHeight = 100;
    let defaultContent = '';
    
    switch(draggedComponent) {
      case 'text':
        defaultContent = 'New Text';
        defaultHeight = 50;
        break;
      case 'variable':
        defaultContent = '{{Variable}}';
        defaultHeight = 50;
        break;
      case 'qrcode':
        defaultContent = 'QR Code Data';
        break;
    }
    
    addComponent({
      type: draggedComponent as "text" | "image" | "shape" | "qrcode" | "variable",
      content: defaultContent,
      template_id: templateId,
      properties: {
        x,
        y,
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        zIndex: components?.length || 0,
        fontSize: 20,
        color: draggedComponent === 'text' ? '#000000' : '#e0e0e0',
        fontFamily: 'Arial',
        borderColor: '#c0c0c0',
        borderWidth: 1,
      }
    });
  };

  return (
    <div className="overflow-auto h-full flex items-center justify-center bg-gray-100 p-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="relative flex items-center justify-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div
            className={cn(
              "designer-canvas border border-gray-200 shadow-md mx-auto transition-all bg-white",
              className
            )}
            style={{ 
              width: `${width}px`, 
              height: `${height}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 flex gap-2 bg-white p-2 rounded-md shadow-md">
        <button 
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
          title="Zoom Out"
        >
          -
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={() => setScale(1)}
          title="Reset Zoom"
        >
          {Math.round(scale * 100)}%
        </button>
        <button 
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
          title="Zoom In"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default DesignerCanvas;
