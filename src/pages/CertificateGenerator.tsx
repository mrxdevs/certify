
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";

export default function CertificateGenerator() {
  // In a real app this would be loaded from API
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    description: string;
  }>>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Generate Certificates" 
          description="Create certificates based on your templates"
        />
        
        {templates.length === 0 ? (
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
                          <div className="text-sm text-muted-foreground">{template.description}</div>
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
                          <Input id="recipientName" placeholder="Enter recipient name" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="courseTitle">Course Title</Label>
                          <Input id="courseTitle" placeholder="Enter course title" />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <Input id="issueDate" type="date" />
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
                  <Button variant="outline">
                    Preview
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Generate
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
