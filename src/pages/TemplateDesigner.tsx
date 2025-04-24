import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DesignerCanvas } from "@/components/canvas/DesignerCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Image, Type, Square, QrCode, Variable, Layers, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function TemplateDesigner() {
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  const handleDragStart = (type: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    setDraggedComponent(type);
  };

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
                className="text-xl font-bold border-none focus-visible:ring-0 p-0 h-auto"
              />
              <p className="text-sm text-muted-foreground">Certificate Template</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
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
                  >
                    <CardContent className="p-3 flex items-center">
                      <Image className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Image</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-3 flex items-center">
                      <Square className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Shape</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-3 flex items-center">
                      <Variable className="h-5 w-5 mr-3 text-brand-600" />
                      <span>Variable</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
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
                <div className="text-sm text-center py-8 text-muted-foreground">
                  No components added yet
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <DesignerCanvas />
            </div>
          </div>
          
          <div className="w-80 border-l p-4 flex flex-col">
            <h3 className="font-medium mb-4">Properties</h3>
            <Separator className="mb-4" />
            
            <div className="text-sm text-center py-8 text-muted-foreground">
              Select a component to edit its properties
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
