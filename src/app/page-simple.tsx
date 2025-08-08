'use client';

import SearchBar from '@/components/SearchBar';

export default function Home() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>쇼츠 스튜디오</h1>
      <p>Application is running</p>
      <div style={{ marginTop: '30px' }}>
        <SearchBar />
      </div>
    </div>
  );
}