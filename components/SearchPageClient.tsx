'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const SUGGESTIONS = [
  "dark art", "dark fantasy", "dark humor", "incognito", "tarot",
  "gothic", "horror", "street style", "patterns", "hooded",
  "grim reaper", "dark humor", "patterns", "horror", "hooded",
];

interface Props {
  initialQuery: string;
}

export default function SearchPageClient({ initialQuery }: Props) {
  const router  = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) { router.push("/search"); return; }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  const handleSuggestion = useCallback((tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  }, [router]);

  const filtered = query
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS;

  return (
    <div className="sp-search-wrap">
      <form onSubmit={handleSubmit} className="sp-search-form">
        <Search size={22} strokeWidth={1.2} className="sp-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="sp-search-input"
          placeholder="Search by theme, colour, device…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Search wallpapers"
          autoFocus={!initialQuery}
        />
        {query && (
          <button type="button" className="sp-search-clear"
            onClick={() => { setQuery(""); router.push("/search"); inputRef.current?.focus(); }}
            aria-label="Clear search">
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
        <button type="submit" className="sp-search-btn">SEARCH</button>
      </form>

      <div className="sp-suggestions">
        {filtered.slice(0, 10).map(tag => (
          <button key={tag} type="button"
            className={`sp-pill${query && tag.toLowerCase() === query.toLowerCase() ? " active" : ""}`}
            onClick={() => handleSuggestion(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}