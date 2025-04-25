import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { DesignerCanvas } from "@/components/canvas/DesignerCanvas";
import { ComponentEditor } from "@/components/canvas/ComponentEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Image, Type, Square, QrCode, Variable, Layers, Download, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CertificateComponent } from "@/lib/types";
import { useTemplate } from "@/hooks/useTemplate";
import { jsPDF } from "jspdf";
import { fabric } from "fabric";

export default function TemplateDesigner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [templateId, setTemplateId] = useState<string | undefined>(id);
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedComponent, setSelectedComponent] = useState<CertificateComponent | null>(null);
  const { components, updateComponent } = useTemplate(templateId);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to create templates");
        navigate("/auth", { state: { from: location } });
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/auth");
        }
        setIsAuthenticated(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const createTemplate = async () => {
      if (!id && isAuthenticated) {
        try {
          const { data, error } = await supabase
            .from('certificate_templates')
            .insert([
              { name: templateName }
            ])
            .select()
            .single();
          
          if (error) throw error;
          
          setTemplateId(data.id);
          navigate(`/designer/${data.id}`, { replace: true });
          toast.success("Template created successfully");
        } catch (err) {
          toast.error('Failed to create template');
          console.error(err);
        }
      }
    };
    
    if (!isLoading) {
      createTemplate();
    }
  }, [id, navigate, templateName, isLoading, isAuthenticated]);

  useEffect(() => {
    if (id) {
      const loadTemplateDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('certificate_templates')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          if (data) {
            setTemplateName(data.name);
          }
        } catch (err) {
          toast.error('Failed to load template details');
          console.error(err);
        }
      };
      
      loadTemplateDetails();
    }
  }, [id]);

  const handleUpdateTemplateName = async () => {
    if (!templateId) return;
    
    try {
      const { error } = await supabase
        .from('certificate_templates')
        .update({ name: templateName })
        .eq('id', templateId);
      
      if (error) throw error;
      toast.success('Template name updated');
    } catch (err) {
      toast.error('Failed to update template name');
      console.error(err);
    }
  };

  const handleDragStart = (type: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('componentType', type);
    setDraggedComponent(type);
    console.log(`Started dragging: ${type}`);
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  const handleExportPDF = async () => {
    if (!templateId) {
      toast.error("Template ID is missing");
      return;
    }
    
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [800, 600]
      });
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 600;
      const tempContext = tempCanvas.getContext('2d');
      
      if (!tempContext) {
        toast.error("Failed to create PDF context");
        return;
      }
      
      const fabricCanvas = new fabric.Canvas(tempCanvas);
      fabricCanvas.backgroundColor = 'white';
      
      const loadComponentsPromise = new Promise<void>((resolve) => {
        let loadedComponents = 0;
        const totalComponents = components?.length || 0;
        
        if (totalComponents === 0) {
          resolve();
          return;
        }
        
        components?.forEach(component => {
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
              fabricCanvas.add(obj);
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
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
                  fabricCanvas.add(img);
                  loadedComponents++;
                  if (loadedComponents === totalComponents) resolve();
                });
              } else {
                obj = new fabric.Rect({
                  left: component.properties.x,
                  top: component.properties.y,
                  width: component.properties.width,
                  height: component.properties.height,
                  fill: '#f0f0f0',
                });
                fabricCanvas.add(obj);
                loadedComponents++;
                if (loadedComponents === totalComponents) resolve();
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
              fabricCanvas.add(obj);
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
              break;
              
            case 'qrcode':
              obj = new fabric.Rect({
                left: component.properties.x,
                top: component.properties.y,
                width: component.properties.width,
                height: component.properties.height,
                fill: '#f0f0f0',
              });
              fabricCanvas.add(obj);
              
              const qrLabel = new fabric.Text('QR Code', {
                left: component.properties.x + component.properties.width / 2,
                top: component.properties.y + component.properties.height / 2,
                fontSize: 14,
                originX: 'center',
                originY: 'center',
                fill: '#666'
              });
              fabricCanvas.add(qrLabel);
              
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
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
              fabricCanvas.add(obj);
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
              break;
              
            default:
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
          }
        });
      });
      
      await loadComponentsPromise;
      
      const imgData = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      
      pdf.save(`${templateName.replace(/\s+/g, '-')}.pdf`);
      
      toast.success('Template exported as PDF');
    } catch (error) {
      console.error('Failed to export PDF', error);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="max-w-7xl mx-auto w-full px-4 py-4 flex justify-between items-center">
            <div>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onBlur={handleUpdateTemplateName}
                className="text-xl font-bold border-none focus-visible:ring-0 p-0 h-auto"
              />
              <p className="text-sm text-muted-foreground">Certificate Template</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button onClick={handleUpdateTemplateName}>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r p-4 flex flex-col">
            <Tabs defaultValue="components">
              <TabsList className="w-full">
                <TabsTrigger value="components" className="flex-1">Components</TabsTrigger>
                <TabsTrigger value="layers" className="flex-1">Layers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="components" className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">Drag components to the canvas</p>
                
                <div className="grid gap-2">
                  <Card 
                    className="cursor-move hover:bg-accent transition-colors"
                    draggable
                    onDragStart={handleDragStart('text')}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3 flex items-center">
                      <Type className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Text</span>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-move hover:bg-accent transition-colors"
                    draggable
                    onDragStart={handleDragStart('image')}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3 flex items-center">
                      <Image className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Image</span>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-move hover:bg-accent transition-colors"
                    draggable
                    onDragStart={handleDragStart('shape')}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3 flex items-center">
                      <Square className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Shape</span>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-move hover:bg-accent transition-colors"
                    draggable
                    onDragStart={handleDragStart('variable')}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3 flex items-center">
                      <Variable className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Variable</span>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-move hover:bg-accent transition-colors"
                    draggable
                    onDragStart={handleDragStart('qrcode')}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-3 flex items-center">
                      <QrCode className="h-5 w-5 mr-3 text-brand-600" />
                      <span>QR Code</span>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="layers" className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Manage layers</p>
                  <Button variant="ghost" size="sm" title="Reorder layers">
                    <Layers className="h-4 w-4" />
                  </Button>
                </div>
                {components && components.length > 0 ? (
                  <div className="space-y-1">
                    {components.map((component) => (
                      <div 
                        key={component.id} 
                        className={`p-2 text-sm rounded-md cursor-pointer flex items-center justify-between ${selectedComponent?.id === component.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedComponent(component)}
                      >
                        <div className="flex items-center">
                          {component.type === 'text' && <Type className="h-4 w-4 mr-2" />}
                          {component.type === 'image' && <Image className="h-4 w-4 mr-2" />}
                          {component.type === 'shape' && <Square className="h-4 w-4 mr-2" />}
                          {component.type === 'qrcode' && <QrCode className="h-4 w-4 mr-2" />}
                          {component.type === 'variable' && <Variable className="h-4 w-4 mr-2" />}
                          <span>{component.content || component.type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {component.properties.zIndex}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-center py-8 text-muted-foreground">
                    No components added yet
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <DesignerCanvas 
                templateId={templateId} 
                draggedComponent={draggedComponent}
                onSelectComponent={setSelectedComponent} 
              />
            </div>
          </div>
          
          <div className="w-80 border-l p-4 flex flex-col">
            <h3 className="font-medium mb-4">Properties</h3>
            <Separator className="mb-4" />
            
            <ComponentEditor 
              component={selectedComponent}
              onUpdate={updateComponent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
