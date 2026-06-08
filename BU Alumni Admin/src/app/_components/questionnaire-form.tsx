'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DialogFooter } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import type { Questionnaire } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  batch_year: z.string().optional(),
  deadline: z.string().optional(),
});

type QuestionnaireFormProps = {
  questionnaire?: Questionnaire | null;
  onSuccess?: () => void;
};

export function QuestionnaireForm({
  questionnaire,
  onSuccess,
}: QuestionnaireFormProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title:
        questionnaire?.title || `Graduate Tracer Study ${new Date().getFullYear()}`,
      description: questionnaire?.description || '',
      batch_year: questionnaire?.batch_year
        ? String(questionnaire.batch_year)
        : '',
      deadline: questionnaire?.deadline
        ? questionnaire.deadline.split('T')[0]
        : '',
    },
  });

  useEffect(() => {
    if (questionnaire) {
      form.reset({
        title: questionnaire.title,
        description: questionnaire.description || '',
        batch_year: questionnaire.batch_year
          ? String(questionnaire.batch_year)
          : '',
        deadline: questionnaire?.deadline
          ? questionnaire.deadline.split('T')[0]
          : '',
      });
    }
  }, [questionnaire, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      title: values.title,
      description: values.description || null,
      batch_year: values.batch_year ? parseInt(values.batch_year) : null,
      deadline: values.deadline
        ? new Date(values.deadline).toISOString()
        : null,
      is_active: true,
    };

    if (questionnaire?.id) {
      const { error } = await supabase
        .from('questionnaires')
        .update(data)
        .eq('id', questionnaire.id);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Questionnaire updated' });
    } else {
      const { error } = await supabase.from('questionnaires').insert(data);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      toast({ title: 'Questionnaire published' });
    }

    onSuccess?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Graduate Tracer Study 2025"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Purpose of the study" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="batch_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Batch Year</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full">
            {questionnaire ? 'Save Changes' : 'Publish Questionnaire'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
