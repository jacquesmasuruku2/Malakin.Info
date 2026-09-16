'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { cleanTagName } from '@/lib/tags';

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export default function TagInput({ value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/tags')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setSuggestions(
          data
            .map((tag: { name?: string }) => String(tag?.name || '').trim())
            .filter(Boolean)
        );
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addTag = (raw: string) => {
    const name = cleanTagName(raw);
    if (!name) return;
    const exists = value.some((tag) => cleanTagName(tag).toLowerCase() === name.toLowerCase());
    if (!exists) onChange([...value, name]);
    setDraft('');
    setOpen(false);
  };

  const filteredSuggestions = useMemo(() => {
    const query = cleanTagName(draft).toLowerCase();
    return suggestions
      .filter((name) => !value.some((tag) => cleanTagName(tag).toLowerCase() === name.toLowerCase()))
      .filter((name) => !query || name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [draft, suggestions, value]);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 border border-blue-100"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="rounded-full p-0.5 hover:bg-blue-100"
              aria-label={`Retirer ${tag}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="#Tshisekedi, Félix Tshisekedi…"
        />
        {open && filteredSuggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {filteredSuggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(name);
                  }}
                >
                  #{name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Ajoutez n’importe quel tag manuellement (#Égypte, #Tshisekedi) puis Entrée. Dans l’article, le mot
        est surligné et mène à /fr/tag/égypte/.
      </p>
    </div>
  );
}
