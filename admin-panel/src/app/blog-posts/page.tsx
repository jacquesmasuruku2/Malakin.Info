'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  type: string;
  publishedAt: string;
  featured: boolean;
  views: number;
  author: { name: string } | null;
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible de charger les blogs.');
      setPosts(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error('Failed to load blog posts:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void loadPosts(), 0);
    return () => clearTimeout(timer);
  }, []);

  const deletePost = async (post: BlogPost) => {
    if (!window.confirm(`Supprimer « ${post.title} » et ses traductions ?`)) return;
    try {
      const response = await fetch(`/api/blog-posts/${post.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible de supprimer ce billet.');
      await loadPosts();
    } catch (deleteError) {
      console.error('Failed to delete blog post:', deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Erreur de suppression.');
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Blogs</h1>
              <p className="mt-1 text-secondary">Gérer les billets et leurs traductions.</p>
            </div>
            <Link href="/blog-posts/new" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
              Nouveau billet
            </Link>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
          <div className="card overflow-hidden rounded-xl border">
            {loading ? <p className="p-6">Chargement…</p> : posts.length === 0 ? (
              <p className="p-6 text-secondary">Aucun billet de blog.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-gray-50 text-sm">
                    <tr>
                      <th className="p-4">Titre</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Auteur</th>
                      <th className="p-4">Publication</th>
                      <th className="p-4">Vues</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-t">
                        <td className="p-4 font-medium">{post.title}{post.featured ? ' · À la une' : ''}</td>
                        <td className="p-4">{post.type}</td>
                        <td className="p-4">{post.author?.name || 'MalakInfo'}</td>
                        <td className="p-4">{new Date(post.publishedAt).toLocaleDateString('fr-FR')}</td>
                        <td className="p-4">{post.views}</td>
                        <td className="space-x-3 p-4">
                          <Link className="text-blue-700 hover:underline" href={`/blog-posts/${post.id}/edit`}>Modifier</Link>
                          <button type="button" className="text-red-700 hover:underline" onClick={() => void deletePost(post)}>Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
