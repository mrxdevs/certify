
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CertificateComponent } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface ComponentEditorProps {
  component: CertificateComponent | null;
  onUpdate: (id: string, updates: Partial<CertificateComponent>) => void;
}

export function ComponentEditor({ component, onUpdate }: ComponentEditorProps) {
  const [content, setContent] = useState<string>("");
  const [properties, setProperties] = useState<CertificateComponent['properties'] | {}>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    if (component) {
      setContent(component.content || "");
      setProperties({ ...component.properties });
    }
  }, [component]);
  
  const handlePropertyChange = (key: string, value: any) => {
    setProperties(prev => ({ ...prev, [key]: value }));
    
    if (component) {
      onUpdate(component.id, {
        properties: { ...properties, [key]: value } as CertificateComponent['properties']
      });
    }
  };
  
  const handleContentChange = () => {
    if (component) {
      onUpdate(component.id, { content });
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!component) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingImage(true);
      
      // Check if storage bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const certificatesBucket = buckets?.find(bucket => bucket.name === 'certificates');
      
      if (!certificatesBucket) {
        await supabase.storage.createBucket('certificates', {
          public: true,
        });
      }
      
      // Upload the file
      const filePath = `template-${component.template_id || 'unknown'}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
        
      // Update the component with the image URL
      onUpdate(component.id, {
        content: publicUrl.publicUrl
      });
      
      setContent(publicUrl.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  if (!component) {
    return (
      <div className="text-sm text-center py-8 text-muted-foreground">
        Select a component to edit its properties
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="content">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
            <TabsTrigger value="position" className="flex-1">Position</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            {component.type === 'image' ? (
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  {content ? (
                    <div className="aspect-video relative">
                      <img 
                        src={content} 
                        alt="Component image" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <p className="text-muted-foreground">No image selected</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  disabled={uploadingImage}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
                
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            ) : component.type === 'qrcode' ? (
              <div className="space-y-4">
                <Label htmlFor="qr-data">QR Code Data</Label>
                <Textarea
                  id="qr-data"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleContentChange}
                  placeholder="Enter text or URL for QR code"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  QR code will be generated from this content
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleContentChange}
                  placeholder={component.type === 'variable' ? '{{variable_name}}' : 'Enter content'}
                  rows={5}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            {(component.type === 'text' || component.type === 'variable') && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={properties.fontSize || 20}
                    onChange={(e) => handlePropertyChange('fontSize', Number(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <select
                    id="fontFamily"
                    value={properties.fontFamily || 'Arial'}
                    onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="color">Text Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: properties.color || '#000000' }}
                    />
                    <Input
                      id="color"
                      type="color"
                      value={properties.color || '#000000'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
            
            {component.type === 'shape' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="fillColor">Fill Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: properties.color || '#e0e0e0' }}
                    />
                    <Input
                      id="fillColor"
                      type="color"
                      value={properties.color || '#e0e0e0'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{ backgroundColor: properties.borderColor || '#c0c0c0' }}
                    />
                    <Input
                      id="borderColor"
                      type="color"
                      value={properties.borderColor || '#c0c0c0'}
                      onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="borderWidth">Border Width</Label>
                  <Input
                    id="borderWidth"
                    type="number"
                    value={properties.borderWidth || 1}
                    onChange={(e) => handlePropertyChange('borderWidth', Number(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    value={properties.borderRadius || 0}
                    onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value))}
                  />
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="position" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="x">X Position</Label>
                <Input
                  id="x"
                  type="number"
                  value={Math.round(properties.x) || 0}
                  onChange={(e) => handlePropertyChange('x', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="y">Y Position</Label>
                <Input
                  id="y"
                  type="number"
                  value={Math.round(properties.y) || 0}
                  onChange={(e) => handlePropertyChange('y', Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={Math.round(properties.width) || 100}
                  onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={Math.round(properties.height) || 100}
                  onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rotation">Rotation (degrees)</Label>
              <Input
                id="rotation"
                type="number"
                value={Math.round(properties.rotation) || 0}
                onChange={(e) => handlePropertyChange('rotation', Number(e.target.value))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="zIndex">Layer Order (z-index)</Label>
              <Input
                id="zIndex"
                type="number"
                value={properties.zIndex || 0}
                onChange={(e) => handlePropertyChange('zIndex', Number(e.target.value))}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
