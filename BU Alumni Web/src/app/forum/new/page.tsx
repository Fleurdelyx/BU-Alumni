'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RichEditor } from '@/components/forum/rich-editor';
import { RenderBody } from '@/components/forum/render-body';
import { getForumIcon } from '@/lib/forum-icons';
import type { ForumCategory } from '@/lib/types';
import { Loader2, Eye, EyeOff, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function NewThreadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const preselectedCategory = searchParams.get('category');

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [bodyPlain, setBodyPlain] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setCategories(data || []);
        if (preselectedCategory) {
          const match = data?.find((c) => c.slug === preselectedCategory);
          if (match) setSelectedCategory(match.id);
        }
      });
  }, [supabase, preselectedCategory]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 5 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !title.trim() || !bodyPlain.trim() || !userId) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    try {
      const sanitizeSlug = (str: string) =>
        str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 100);

      let slug: string;
      const { data: slugData, error: slugError } = await supabase.rpc('generate_thread_slug', { title: title.trim() });
      if (!slugError && slugData) {
        slug = slugData;
      } else {
        if (slugError) console.warn('generate_thread_slug RPC failed, using fallback:', slugError);
        slug = sanitizeSlug(title);
      }

      const { data: newThread, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: selectedCategory,
          author_id: userId,
          title: title.trim(),
          slug,
          body: body.trim(),
          body_plain: bodyPlain.trim(),
          tags,
          is_deleted: false,
        })
        .select('id')
        .single();

      if (error || !newThread) {
        console.error('Insert error:', error);
        toast({ title: 'Failed to publish thread', description: error?.message || 'Please try again.', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const cat = categories.find((c) => c.id === selectedCategory);
      toast({ title: 'Thread published successfully!' });
      router.push(`/forum/${cat?.slug || 'general'}/${newThread.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to create thread:', err);
      toast({ title: 'Failed to publish thread', description: err?.message || 'Please try again.', variant: 'destructive' });
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display">Start a New Discussion</h1>
          <p className="text-muted-foreground mt-1">Choose a category and share your thoughts with the community.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium">Select a Category</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = getForumIcon(cat.icon);
              const isSelected = selectedCategory === cat.id;
              return (
                <Card
                  key={cat.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'border-primary ring-1 ring-primary' : 'border-mist dark:border-sidebar-border/30 hover:border-sage'
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: cat.color ? `${cat.color}20` : '#E0F2E7',
                        color: cat.color || '#4C992D',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/150</p>
          </div>

          <div>
            <label className="text-sm font-medium">Body</label>
            <div className="mt-1">
              <RichEditor
                content={body}
                onChange={(html, text) => {
                  setBody(html);
                  setBodyPlain(text);
                }}
                placeholder="Elaborate on your topic..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tags</label>
            <Input
              placeholder="Press Enter to add a tag (max 5)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="mt-1"
              disabled={tags.length >= 5}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
              {preview ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
              {preview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          {preview && (
            <Card className="border-mist dark:border-sidebar-border/30 bg-card">
              <CardContent className="p-5">
                <h3 className="font-display font-semibold text-lg">{title || 'Untitled'}</h3>
                <div className="mt-2 text-sm">
                  <RenderBody body={body} />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCategory || !title.trim() || !bodyPlain.trim() || submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewThreadContent />
    </Suspense>
  );
}
