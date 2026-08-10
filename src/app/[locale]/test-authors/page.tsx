import { prisma } from '@/lib/prisma';

export default async function TestAuthorsPage() {
  let authors: any[] = [];
  let error: any = null;
  let dbStatus = 'Not connected';

  try {
    dbStatus = 'Connected';
    authors = await prisma.author.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  } catch (e: any) {
    error = e;
    dbStatus = 'Error';
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Authors Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <p className="mb-2"><strong>Status:</strong> {dbStatus}</p>
          <p className="mb-2"><strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? 'Set' : 'Not set'}</p>
          {error && (
            <p className="text-red-600"><strong>Error:</strong> {error.message || String(error)}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authors in Database ({authors.length})</h2>
          
          {authors.length === 0 ? (
            <p>No authors found</p>
          ) : (
            <div className="space-y-4">
              {authors.map((author) => (
                <div key={author.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{author.name}</h3>
                  <p><strong>Slug:</strong> {author.slug}</p>
                  <p><strong>Role:</strong> {author.role || 'N/A'}</p>
                  <p><strong>Email:</strong> {author.email || 'N/A'}</p>
                  <p><strong>Articles:</strong> {author._count.articles}</p>
                  <p><strong>ID:</strong> {author.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Test Specific Authors</h2>
          <div className="space-y-2">
            <p><strong>/auteurs/sage-bahati:</strong> {authors.find((a: any) => a.slug === 'sage-bahati') ? '✓ Found' : '✗ Not found'}</p>
            <p><strong>/auteurs/caly:</strong> {authors.find((a: any) => a.slug === 'caly') ? '✓ Found' : '✗ Not found'}</p>
            <p><strong>/auteurs/alexis-mutombo:</strong> {authors.find((a: any) => a.slug === 'alexis-mutombo') ? '✓ Found' : '✗ Not found'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
