'use client';

import SearchBar from '@/components/SearchBar';

export default function TestSearchBar() {
  const handleSearch = (query: string, category?: string) => {
    console.log('Search:', { query, category });
  };

  return (
    <div style={{ padding: '50px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>SearchBar Test Page</h1>
      <SearchBar 
        onSearch={handleSearch}
        placeholder="강의, 템플릿, 효과음 검색..."
        showCategories={true}
      />
      <div style={{ marginTop: '50px', color: '#666' }}>
        <p>Test the SearchBar component:</p>
        <ul>
          <li>Type to see autocomplete suggestions</li>
          <li>Click on category pills to filter</li>
          <li>Press Enter to search</li>
        </ul>
      </div>
    </div>
  );
}