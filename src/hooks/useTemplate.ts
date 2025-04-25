
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CertificateComponent } from '@/lib/types';
import { toast } from 'sonner';

interface AddComponentParams {
  type: CertificateComponent['type'];
  content?: string;
  template_id: string;
  properties: CertificateComponent['properties'];
}

export function useTemplate(templateId?: string) {
  const [components, setComponents] = useState<CertificateComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) {
      setIsLoading(false);
      return;
    }

    const loadTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from('template_components')
          .select('*')
          .eq('template_id', templateId);

        if (error) throw error;
        
        // Map Supabase data to CertificateComponent type
        const mappedComponents = data?.map(item => ({
          id: item.id,
          type: item.type as CertificateComponent['type'],
          content: item.content || '',
          template_id: item.template_id,
          properties: item.properties as CertificateComponent['properties']
        })) || [];
        
        setComponents(mappedComponents);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load template';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const addComponent = async (component: AddComponentParams) => {
    try {
      const { type, content, properties, template_id } = component;
      
      const { data, error } = await supabase
        .from('template_components')
        .insert([{
          type,
          content: content || '',
          properties,
          template_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Map the returned data to our CertificateComponent type
      const newComponent: CertificateComponent = {
        id: data.id,
        type: data.type as CertificateComponent['type'],
        content: data.content || '',
        template_id: data.template_id,
        properties: data.properties as CertificateComponent['properties']
      };
      
      setComponents(prev => [...prev, newComponent]);
      toast.success('Component added');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add component';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const updateComponent = async (id: string, updates: Partial<CertificateComponent>) => {
    try {
      const { data, error } = await supabase
        .from('template_components')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Map the returned data to our CertificateComponent type
      const updatedComponent: CertificateComponent = {
        id: data.id,
        type: data.type as CertificateComponent['type'],
        content: data.content || '',
        template_id: data.template_id,
        properties: data.properties as CertificateComponent['properties']
      };
      
      setComponents(prev => prev.map(c => c.id === id ? updatedComponent : c));
      toast.success('Component updated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update component';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return { components, isLoading, error, addComponent, updateComponent };
}
