import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useAutocomplete, AutocompleteOption } from '@/hooks/useAutocomplete';
import { colors } from '@/lib/theme/theme';

// Types
export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string, category?: string) => void;
  onClear?: () => void;
  width?: string | number;
  autoFocus?: boolean;
  showCategories?: boolean;
  className?: string;
}

// Categories data with Stripe-inspired colors from tokens
const CATEGORIES = [
  { id: 'all', name: '전체', color: colors.neutral.gray['500'] },
  { id: 'course', name: '강의', color: colors.primary.blue.default },
  { id: 'template', name: '템플릿', color: colors.primary.lightBlue },
  { id: 'sound', name: '효과음', color: colors.primary.blue.hover },
  { id: 'subtitle', name: '자막 도구', color: colors.neutral.gray['600'] },
  { id: 'analytics', name: '분석 도구', color: colors.primary.blue.active },
  { id: 'community', name: '커뮤니티', color: colors.primary.darkBlue },
];

// Main component
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "강의, 템플릿, 효과음 검색...",
  defaultValue = "",
  onSearch,
  onClear,
  width,
  autoFocus = false,
  showCategories = true,
  className = ""
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, clearSuggestions } = useAutocomplete({
    query,
    delay: 300,
    minLength: 2,
    maxSuggestions: 8
  });

  const showSuggestions = isFocused && suggestions.length > 0 && query.length > 1;

  // Handle search submission
  const handleSearch = (value?: string) => {
    const searchQuery = value || query;
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery, selectedCategory !== 'all' ? selectedCategory : undefined);
      clearSuggestions();
      setIsFocused(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    clearSuggestions();
    inputRef.current?.focus();
    onClear?.();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const suggestion = suggestions[highlightedIndex];
          setQuery(suggestion.value);
          handleSearch(suggestion.value);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        clearSuggestions();
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: AutocompleteOption) => {
    setQuery(suggestion.value);
    handleSearch(suggestion.value);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full max-w-[600px] ${className}`}
      style={{ width }}
    >
      <div 
        className={`
          relative flex items-center bg-white
          border-2 transition-all duration-200 ease-in-out
          rounded-full px-5 h-12
          ${isFocused 
            ? 'shadow-md' 
            : 'border-gray-200 shadow-sm hover:shadow-md'
          }
        `}
        style={{
          borderColor: isFocused ? colors.primary.blue.default : undefined
        }}
        onMouseEnter={(e) => {
          if (!isFocused) {
            e.currentTarget.style.borderColor = colors.primary.blue.default;
          }
        }}
        onMouseLeave={(e) => {
          if (!isFocused) {
            e.currentTarget.style.borderColor = '';
          }
        }}
      >
        <FiSearch className="text-gray-400 text-xl mr-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="검색"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
          role="combobox"
          className="flex-1 border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="검색어 지우기"
            type="button"
            className="flex items-center justify-center bg-transparent border-none cursor-pointer p-1 ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {showCategories && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              type="button"
              aria-pressed={selectedCategory === category.id}
              className={`
                px-4 py-1.5 rounded-full border text-sm font-medium
                cursor-pointer transition-all duration-200
                ${selectedCategory === category.id
                  ? 'text-white'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
              style={selectedCategory === category.id ? {
                backgroundColor: category.color,
                borderColor: category.color
              } : {
                borderColor: selectedCategory === category.id ? category.color : undefined
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.borderColor = category.color;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.borderColor = colors.neutral.gray['200'];
                }
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div
        id="search-suggestions"
        role="listbox"
        className={`
          absolute top-[calc(100%+8px)] left-0 right-0
          bg-white rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-[1000]
          transition-all duration-300 ease-in-out
          ${showSuggestions 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible -translate-y-2'
          }
        `}
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.value}-${index}`}
            onClick={() => handleSuggestionClick(suggestion)}
            role="option"
            aria-selected={index === highlightedIndex}
            className={`
              flex items-center justify-between w-full px-5 py-3
              border-none cursor-pointer transition-colors duration-200
              ${index === highlightedIndex ? 'bg-gray-50' : 'bg-transparent hover:bg-gray-50'}
              ${index < suggestions.length - 1 ? 'border-b border-gray-100' : ''}
            `}
          >
            <span className="text-gray-800 text-left">{suggestion.value}</span>
            {suggestion.category && (
              <span className="text-sm text-gray-500 ml-3">{suggestion.category}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;