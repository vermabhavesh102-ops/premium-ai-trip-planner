import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Destination } from '../data/indianDestinations';
import { indianDestinations, searchDestinations } from '../data/indianDestinations';

interface SearchDestinationProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (destination: Destination) => void;
  selectedDestination: Destination | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onApiSearch?: (query: string) => Promise<Destination[]>;
  maxSuggestions?: number;
  isLoading?: boolean;
}

// Highlight matching text in suggestions
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#d5b487]/30 text-[#8b6914] dark:bg-[#d5b487]/20 dark:text-[#d5b487] rounded px-0.5 font-semibold"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// Loading skeleton component
function SkeletonItem() {
  return (
    <div className="flex items-center justify-between px-4 py-3 animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
      </div>
    </div>
  );
}

// Search icon SVG
function SearchIcon() {
  return (
    <svg
      className="h-5 w-5 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

// Clear icon SVG
function ClearIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// Location icon SVG
function LocationIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

// Check icon SVG
function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-[#c7a575]" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Arrow icon SVG for navigation hint
function ArrowDownIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const SearchDestination = memo(function SearchDestination({
  value,
  onChange,
  onSelect,
  selectedDestination,
  placeholder = 'Search destinations...',
  className = '',
  disabled = false,
  onApiSearch,
  maxSuggestions = 10,
  isLoading = false,
}: SearchDestinationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Destination[]>(indianDestinations.slice(0, 50));
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Debounced search with API integration
  const performSearch = useCallback(
    async (query: string) => {
      // Immediate local search for instant feedback
      const localResults = searchDestinations(query, maxSuggestions * 2);
      setSuggestions(localResults);

      if (!query.trim() || !onApiSearch) {
        setIsApiLoading(false);
        return;
      }

      setIsApiLoading(true);
      try {
        const apiResults = await onApiSearch(query);
        // Merge API results, avoiding duplicates
        setSuggestions((prev) => {
          const existingNames = new Set(prev.map((d) => d.name.toLowerCase()));
          const newResults = apiResults.filter((api) => !existingNames.has(api.name.toLowerCase()));
          const merged = [...prev, ...newResults];
          return merged.slice(0, maxSuggestions * 2);
        });
      } catch (error) {
        console.error('API search failed:', error);
      } finally {
        setIsApiLoading(false);
      }
    },
    [maxSuggestions, onApiSearch]
  );

  // Debounce implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(value);
    }, 200); // 200ms debounce for smooth UX

    return () => clearTimeout(handler);
  }, [value, performSearch]);

  // Show all destinations when focused with empty input
  useEffect(() => {
    if (isOpen && !value.trim()) {
      setSuggestions(indianDestinations.slice(0, 50));
    }
  }, [isOpen, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (!value.trim()) {
      setSuggestions(indianDestinations.slice(0, 50));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
    }
  };

  const handleSelect = (destination: Destination) => {
    onSelect(destination);
    onChange(destination.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    setSuggestions(indianDestinations.slice(0, 50));
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const displaySuggestions = suggestions.slice(0, maxSuggestions);
  const hasResults = displaySuggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pl-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c7a575] focus:ring-4 focus:ring-[#d5b487]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
            isOpen ? 'rounded-b-xl' : ''
          }`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="destination-listbox"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-2 max-h-80 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <ul
              ref={listRef}
              id="destination-listbox"
              role="listbox"
              className="max-h-72 overflow-y-auto py-2 scrollbar-custom"
            >
              {/* Loading state */}
              {(isLoading || isApiLoading) && suggestions.length === 0 && (
                <>
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                </>
              )}

              {/* No results */}
              {!isLoading && !isApiLoading && !hasResults && value.trim() && (
                <li className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No destinations found</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Try searching for a different location
                  </p>
                </li>
              )}

              {/* Suggestions */}
              {displaySuggestions.map((destination, index) => {
                const isSelected = selectedDestination?.name === destination.name;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li key={`${destination.name}-${destination.type}-${index}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(destination)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full px-4 py-3 text-left transition-all duration-100 ${
                        isSelected
                          ? 'bg-[#fbf6ee] dark:bg-slate-800'
                          : isHighlighted
                          ? 'bg-slate-50 dark:bg-slate-800/80'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold truncate ${
                                isSelected
                                  ? 'text-[#8b6914] dark:text-[#d5b487]'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              <HighlightedText
                                text={destination.name}
                                query={value}
                              />
                            </span>
                            <span className="flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {destination.type === 'ut' ? 'UT' : destination.type}
                            </span>
                          </div>
                          {(destination.region || destination.parentState) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <LocationIcon />
                              <span>
                                {destination.parentState || destination.region}
                                {destination.country && destination.country !== 'India'
                                  ? `, ${destination.country}`
                                  : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        {isSelected && <CheckIcon />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer with navigation hints */}
            {hasResults && (
              <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>
                  {displaySuggestions.length} of {suggestions.length} destinations
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[10px]">
                      ↑↓
                    </kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[10px]">
                      ↵
                    </kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[10px]">
                      esc
                    </kbd>
                    close
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SearchDestination;