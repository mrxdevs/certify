
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileEdit, Copy, Trash2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
          .select('*')
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
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      // Delete template components first
      const { error: componentsError } = await supabase
        .from('template_components')
        .delete()
        .match({ template_id: id });
        
      if (componentsError) throw componentsError;
      
      // Then delete the template
      const { error } = await supabase
        .from('certificate_templates')
        .delete()
        .match({ id });
        
      if (error) throw error;
      
      // Update the local state
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted');
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
    }
  };
  
  const handleDuplicate = async (template: Template, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Create a duplicate template
      const { data: newTemplate, error } = await supabase
        .from('certificate_templates')
        .insert([{
          name: `${template.name} (Copy)`,
          description: template.description,
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Get all components of the original template
      const { data: components, error: componentsError } = await supabase
        .from('template_components')
        .select('*')
        .eq('template_id', template.id);
        
      if (componentsError) throw componentsError;
      
      // Duplicate components for the new template
      if (components && components.length > 0) {
        const newComponents = components.map(c => ({
          ...c,
          id: undefined, // Let Supabase generate a new ID
          template_id: newTemplate.id
        }));
        
        const { error: insertError } = await supabase
          .from('template_components')
          .insert(newComponents);
          
        if (insertError) throw insertError;
      }
      
      // Update local state
      setTemplates([newTemplate, ...templates]);
      toast.success('Template duplicated');
    } catch (err) {
      console.error('Error duplicating template:', err);
      toast.error('Failed to duplicate template');
    }
  };
  
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
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
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
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="truncate">{template.name}</CardTitle>
                  <CardDescription className="truncate">
                    {template.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={`/designer/${template.id}`} className="block">
                    <div className="aspect-[8.5/11] bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative hover:opacity-90 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent flex items-end p-3">
                        <p className="text-sm font-medium text-white">
                          Created {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/designer/${template.id}`}>
                      <FileEdit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => handleDuplicate(template, e)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={(e) => handleDelete(template.id, e)}
                    >
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
