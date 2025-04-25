
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Download, FileUp, Mail, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { fabric } from "fabric";

interface Template {
  id: string;
  name: string;
  description: string;
}

interface FormValues {
  recipientName: string;
  courseTitle: string;
  issueDate: string;
  [key: string]: string;
}

export default function CertificateGenerator() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<FormValues>({
    recipientName: '',
    courseTitle: '',
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const navigate = useNavigate();
  
  // Check authentication and load templates
  useEffect(() => {
    const checkSessionAndLoadTemplates = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth');
          return;
        }
        
        // Load templates
        const { data, error } = await supabase
          .from('certificate_templates')
          .select('id, name, description')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setTemplates(data || []);
      } catch (err) {
        console.error('Error loading templates:', err);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    
    checkSessionAndLoadTemplates();
  }, [navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues(prev => ({ ...prev, [id]: value }));
  };
  
  const handleGeneratePDF = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    
    try {
      setGeneratingPdf(true);
      
      // Load template components
      const { data: components, error } = await supabase
        .from('template_components')
        .select('*')
        .eq('template_id', selectedTemplate);
        
      if (error) throw error;
      
      if (!components || components.length === 0) {
        toast.error('Template has no components');
        return;
      }
      
      // Create a PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [800, 600]
      });
      
      // Create a temporary canvas element
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 800;
      tempCanvas.height = 600;
      
      // Create a Fabric Canvas
      const fabricCanvas = new fabric.Canvas(tempCanvas);
      fabricCanvas.backgroundColor = 'white';
      
      // Process template variables
      const processVariables = (content: string) => {
        // Replace template variables with form values
        let processedContent = content;
        Object.keys(formValues).forEach(key => {
          processedContent = processedContent.replace(new RegExp(`{{${key}}}`, 'g'), formValues[key]);
        });
        return processedContent;
      };
      
      // Add components to canvas with replaced variables
      const loadComponentsPromise = new Promise<void>((resolve) => {
        let loadedComponents = 0;
        const totalComponents = components.length;
        
        components.forEach(component => {
          let obj;
          
          switch (component.type) {
            case 'text':
              obj = new fabric.Textbox(
                processVariables(component.content || 'Text'), 
                {
                  left: component.properties.x,
                  top: component.properties.y,
                  width: component.properties.width,
                  fontSize: component.properties.fontSize || 20,
                  fill: component.properties.color || 'black',
                  fontFamily: component.properties.fontFamily || 'Arial',
                }
              );
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
              
            case 'variable':
              obj = new fabric.Textbox(
                processVariables(component.content || '{{Variable}}'), 
                {
                  left: component.properties.x,
                  top: component.properties.y,
                  width: component.properties.width,
                  fontSize: component.properties.fontSize || 20,
                  fill: component.properties.color || '#0066cc',
                }
              );
              fabricCanvas.add(obj);
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
              break;
              
            default:
              loadedComponents++;
              if (loadedComponents === totalComponents) resolve();
          }
        });
        
        // If no components or all loaded immediately, resolve
        if (totalComponents === 0) {
          resolve();
        }
      });
      
      // Wait for all components to load
      await loadComponentsPromise;
      
      // Render the canvas to PDF
      const imgData = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      
      // Save PDF file
      const selectedTemplateName = templates.find(t => t.id === selectedTemplate)?.name || 'certificate';
      pdf.save(`${selectedTemplateName}-${formValues.recipientName.replace(/\s+/g, '-')}.pdf`);
      
      toast.success('Certificate generated successfully');
    } catch (error) {
      console.error('Failed to generate certificate', error);
      toast.error('Failed to generate certificate');
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Generate Certificates" 
          description="Create certificates based on your templates"
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No templates available" 
            description="Create a template first to generate certificates"
            action={{
              label: "Create Template",
              href: "/designer",
              icon: FileText
            }}
            className="bg-white border rounded-lg shadow-sm"
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Select Template</CardTitle>
                  <CardDescription>Choose a template to use</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all ${selectedTemplate === template.id ? 'ring-2 ring-brand-500' : ''}`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description || 'No description'}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Details</CardTitle>
                  <CardDescription>Enter recipient information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="single">
                    <TabsList className="mb-4">
                      <TabsTrigger value="single">Single Certificate</TabsTrigger>
                      <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="single">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="recipientName">Recipient Name</Label>
                          <Input 
                            id="recipientName" 
                            placeholder="Enter recipient name" 
                            value={formValues.recipientName}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="courseTitle">Course Title</Label>
                          <Input 
                            id="courseTitle" 
                            placeholder="Enter course title" 
                            value={formValues.courseTitle}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <Input 
                            id="issueDate" 
                            type="date" 
                            value={formValues.issueDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-4">
                          <p>Use these variable placeholders in your template:</p>
                          <ul className="list-disc list-inside mt-2">
                            <li>{'{{recipientName}}'} - Name of the recipient</li>
                            <li>{'{{courseTitle}}'} - Title of the course</li>
                            <li>{'{{issueDate}}'} - Issue date of certificate</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bulk">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-md p-8 text-center">
                          <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="mb-1">Drag and drop your CSV file here</p>
                          <p className="text-sm text-muted-foreground mb-4">or</p>
                          <Button variant="secondary">
                            Select File
                          </Button>
                          <p className="text-xs text-muted-foreground mt-3">
                            CSV file should include columns for all required fields
                          </p>
                        </div>
                        
                        <div>
                          <Button variant="outline" size="sm">
                            Download Template CSV
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" disabled={!selectedTemplate || generatingPdf}>
                    Preview
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" disabled={!selectedTemplate || generatingPdf}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button 
                      onClick={handleGeneratePDF}
                      disabled={!selectedTemplate || generatingPdf || !formValues.recipientName}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {generatingPdf ? 'Generating...' : 'Generate PDF'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
