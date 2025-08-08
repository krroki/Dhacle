import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutocompleteOption {
  value: string;
  category?: string;
  count?: number;
}

export interface UseAutocompleteProps {
  query: string;
  delay?: number;
  minLength?: number;
  maxSuggestions?: number;
}

// Mock data for autocomplete (실제로는 API에서 가져와야 함)
const MOCK_SUGGESTIONS: AutocompleteOption[] = [
  { value: '쇼츠 편집 기초', category: '강의', count: 234 },
  { value: '쇼츠 템플릿 모음', category: '템플릿', count: 156 },
  { value: '효과음 팩', category: '효과음', count: 89 },
  { value: '자동 자막 생성', category: '자막 도구', count: 45 },
  { value: '채널 분석 대시보드', category: '분석 도구', count: 67 },
  { value: '크리에이터 모임', category: '커뮤니티', count: 123 },
  { value: '바이럴 쇼츠 만들기', category: '강의', count: 345 },
  { value: '트렌드 음악 모음', category: '효과음', count: 234 },
  { value: '쇼츠 알고리즘 분석', category: '분석 도구', count: 178 },
  { value: '초보자 가이드', category: '강의', count: 456 },
  { value: '프리미엄 템플릿', category: '템플릿', count: 89 },
  { value: '커뮤니티 가이드라인', category: '커뮤니티', count: 34 },
];

export const useAutocomplete = ({
  query,
  delay = 300,
  minLength = 2,
  maxSuggestions = 8
}: UseAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const filtered = MOCK_SUGGESTIONS.filter(item =>
        item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, maxSuggestions);

      setSuggestions(filtered);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [maxSuggestions]);

  useEffect(() => {
    if (query.length < minLength) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, delay, minLength, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    clearSuggestions: () => setSuggestions([])
  };
};