import BlogPostEditor from '@/components/BlogPostEditor';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogPostEditor key={id} mode="edit" postId={id} />;
}
