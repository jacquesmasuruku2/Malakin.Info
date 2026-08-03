import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ReadAlsoProps {
  title: string;
  url: string;
  accentColor?: string;
}

export default function ReadAlso({ title, url, accentColor = '#2563eb' }: ReadAlsoProps) {
  const badgeStyle = {
    backgroundColor: accentColor,
  };

  const linkStyle = {
    color: accentColor,
  };

  return (
    <div className="my-8 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Badge with arrow */}
        <div className="flex justify-center mb-2">
          <div 
            className="relative px-4 py-1 text-white text-xs font-semibold uppercase tracking-wide"
            style={badgeStyle}
          >
            À lire aussi
            {/* Arrow pointing down */}
            <div 
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
              style={{ borderTopColor: accentColor }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
          <Link 
            href={url}
            className="flex items-center gap-2 font-bold text-lg hover:underline transition-colors"
            style={linkStyle}
          >
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
            <span>{title}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
