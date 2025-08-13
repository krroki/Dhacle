'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function APITestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string, name: string) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: data,
          headers: Object.fromEntries(response.headers.entries())
        }
      }));
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [name]: {
          error: true,
          message: error.message
        }
      }));
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setResults({});
    await testAPI('/api/health', 'health');
    await testAPI('/api/revenue-proof', 'revenue-proof');
    await testAPI('/api/revenue-proof/ranking', 'ranking');
    await testAPI('/api/revenue-proof/seed', 'seed-status');
  };

  const addSeedData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/revenue-proof/seed', {
        method: 'POST'
      });
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        'seed-add': {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: data
        }
      }));
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        'seed-add': {
          error: true,
          message: error.message
        }
      }));
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API 디버깅 페이지</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API 테스트 도구</CardTitle>
          <CardDescription>
            각 API 엔드포인트를 테스트하여 문제를 진단합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              variant="default"
            >
              모든 API 테스트
            </Button>
            <Button 
              onClick={() => testAPI('/api/health', 'health')} 
              disabled={loading}
              variant="outline"
            >
              Health Check
            </Button>
            <Button 
              onClick={() => testAPI('/api/revenue-proof', 'revenue-proof')} 
              disabled={loading}
              variant="outline"
            >
              Revenue Proof
            </Button>
            <Button 
              onClick={() => testAPI('/api/revenue-proof/ranking', 'ranking')} 
              disabled={loading}
              variant="outline"
            >
              Ranking
            </Button>
            <Button 
              onClick={addSeedData} 
              disabled={loading}
              variant="destructive"
            >
              시드 데이터 추가 (POST)
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.entries(results).map(([name, result]: [string, any]) => (
        <Card key={name} className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {name}
              {result.ok && (
                <span className="text-green-600 text-sm">✓ 성공</span>
              )}
              {result.error && (
                <span className="text-red-600 text-sm">✗ 실패</span>
              )}
              {!result.ok && !result.error && (
                <span className="text-yellow-600 text-sm">
                  ⚠ Status: {result.status}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.status && (
                <div className="text-sm">
                  <strong>Status:</strong> {result.status} {result.statusText}
                </div>
              )}
              {result.error && (
                <div className="text-sm text-red-600">
                  <strong>Error:</strong> {result.message}
                </div>
              )}
              {result.data && (
                <div>
                  <strong className="text-sm">Response:</strong>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-96">
                    {typeof result.data === 'string' 
                      ? result.data.substring(0, 1000)
                      : JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              {result.headers && (
                <details>
                  <summary className="text-sm cursor-pointer">Headers</summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                    {JSON.stringify(result.headers, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(results).length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">
              버튼을 클릭하여 API를 테스트하세요
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}