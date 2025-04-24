
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CertificateComponent } from '@/lib/types';

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
        setComponents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  const addComponent = async (component: Omit<CertificateComponent, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('template_components')
        .insert([component])
        .select()
        .single();

      if (error) throw error;
      setComponents(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add component');
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
      setComponents(prev => prev.map(c => c.id === id ? data : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update component');
    }
  };

  return { components, isLoading, error, addComponent, updateComponent };
}
