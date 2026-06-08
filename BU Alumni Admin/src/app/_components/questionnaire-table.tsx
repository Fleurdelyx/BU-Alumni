'use client';

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  Trash,
  Edit,
  Loader2,
  PlusCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuestionnaireForm } from './questionnaire-form';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Questionnaire } from '@/lib/types';

export function QuestionnaireTable() {
  const supabase = createClient();
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Questionnaire | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('questionnaires')
      .select('*')
      .order('created_at', { ascending: false });
    setQuestionnaires(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [supabase]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from('questionnaires')
      .delete()
      .eq('id', deleteId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setQuestionnaires((prev) => prev.filter((q) => q.id !== deleteId));
      toast({ title: 'Questionnaire deleted' });
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Questionnaire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Questionnaire</DialogTitle>
              <DialogDescription>
                Create a new questionnaire to send to alumni.
              </DialogDescription>
            </DialogHeader>
            <QuestionnaireForm
              onSuccess={() => {
                setCreateOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questionnaires.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{q.title}</TableCell>
              <TableCell>
                <Badge variant={q.is_active ? 'default' : 'secondary'}>
                  {q.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{q.batch_year || 'All'}</TableCell>
              <TableCell>
                {q.deadline
                  ? new Date(q.deadline).toLocaleDateString()
                  : 'No deadline'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSelected(q)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setDeleteId(q.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {questionnaires.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No questionnaires found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the questionnaire. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selected && (
        <Dialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Questionnaire</DialogTitle>
              <DialogDescription>
                Make changes to your questionnaire. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <QuestionnaireForm
              questionnaire={selected}
              onSuccess={() => {
                setSelected(null);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
