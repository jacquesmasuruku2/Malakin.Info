'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Extract locale from pathname
  const currentLocale = pathname.split('/')[1] || 'fr';
  const targetLocale = currentLocale === 'fr' ? 'en' : 'fr';
  
  // Replace locale in pathname
  const switchLanguage = () => {
    const pathParts = pathname.split('/');
    pathParts[1] = targetLocale;
    const newPath = pathParts.join('/');
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
      title={currentLocale === 'fr' ? 'Switch to English' : 'Passer au français'}
    >
      <Languages className="w-4 h-4 text-foreground" />
      <span className="text-sm font-medium text-foreground uppercase">
        {targetLocale}
      </span>
    </button>
  );
}
