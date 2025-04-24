
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileEdit, Copy, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function TemplateList() {
  // In a real app, this would come from a database
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    description: string;
    createdAt: Date;
  }>>([]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Certificate Templates" 
          description="Create, edit and manage your certificate templates"
          action={{
            label: "Create Template",
            href: "/designer",
            icon: Plus
          }}
        />
        
        {templates.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No templates yet" 
            description="Create your first certificate template to get started"
            action={{
              label: "Create Template",
              href: "/designer",
              icon: Plus
            }}
            className="bg-white border rounded-lg shadow-sm"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[8.5/11] bg-gray-100 rounded-md flex items-center justify-center">
                    <p className="text-gray-400">Certificate Preview</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/designer/${template.id}`}>
                      <FileEdit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
