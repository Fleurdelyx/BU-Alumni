'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getForumIcon } from '@/lib/forum-icons';
import type { ForumCategory } from '@/lib/types';
import { Loader2, Eye, EyeOff, X } from 'lucide-react';

function NewThreadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const preselectedCategory = searchParams.get('category');

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
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
    if (!selectedCategory || !title.trim() || !body.trim() || !userId) return;
    setSubmitting(true);

    const { data: slug } = await supabase.rpc('generate_thread_slug', { title: title.trim() });

    const { error } = await supabase.from('forum_threads').insert({
      category_id: selectedCategory,
      author_id: userId,
      title: title.trim(),
      slug: slug || title.trim().toLowerCase().replace(/\s+/g, '-'),
      body: body.trim(),
      body_plain: body.trim(),
      tags,
    });

    setSubmitting(false);
    if (!error) {
      const cat = categories.find((c) => c.id === selectedCategory);
      router.push(`/forum/${cat?.slug || ''}`);
      router.refresh();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-display">Start a New Discussion</h1>
          <p className="text-slate mt-1">Choose a category and share your thoughts with the community.</p>
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
                    isSelected ? 'border-primary ring-1 ring-primary' : 'border-mist hover:border-sage'
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
                      <p className="text-sm font-medium text-forest">{cat.name}</p>
                      <p className="text-xs text-slate line-clamp-1">{cat.description}</p>
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
            <p className="text-xs text-slate mt-1 text-right">{title.length}/150</p>
          </div>

          <div>
            <label className="text-sm font-medium">Body</label>
            <Textarea
              placeholder="Elaborate on your topic..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="mt-1"
            />
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
            <Card className="border-mist bg-paper">
              <CardContent className="p-5">
                <h3 className="font-display font-semibold text-lg">{title || 'Untitled'}</h3>
                <p className="whitespace-pre-wrap mt-2 text-sm">{body}</p>
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
              disabled={!selectedCategory || !title.trim() || !body.trim() || submitting}
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
