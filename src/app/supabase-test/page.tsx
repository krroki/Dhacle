import { createSupabaseServerClient } from '@/lib/supabase/server-client'

// Disable caching for this test page to always get fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function SupabaseTestPage() {
  // Create server client instance
  const supabase = await createSupabaseServerClient()
  
  // Attempt to fetch data from the test_connection table
  // Removed .single() to handle empty results gracefully
  const { data, error } = await supabase
    .from('test_connection')
    .select('*')
    .limit(1)

  // Get current timestamp for verification
  const timestamp = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">
          Supabase &ldquo;Proof-of-Life&rdquo; Test
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Connection Details
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-primary/60">
              <span className="text-primary">Timestamp:</span> {timestamp}
            </p>
            <p className="text-primary/60">
              <span className="text-primary">Table:</span> test_connection
            </p>
            <p className="text-primary/60">
              <span className="text-primary">Operation:</span> SELECT * LIMIT 1
            </p>
          </div>
        </div>

        {/* Show error for actual errors, or when no data is found */}
        {(error || (data && data.length === 0)) && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">
              {error ? '❌ Connection Failed' : '⚠️ No Data Found'}
            </h2>
            <div className="space-y-2">
              {error ? (
                <>
                  <p className="text-red-300">
                    <strong>Error Code:</strong> {error.code || 'Unknown'}
                  </p>
                  <p className="text-red-300">
                    <strong>Error Message:</strong> {error.message}
                  </p>
                </>
              ) : (
                <p className="text-yellow-300">
                  The test_connection table exists but contains no rows. Please add a test row with a message field.
                </p>
              )}
              {error && error.details && (
                <p className="text-red-300">
                  <strong>Details:</strong> {error.details}
                </p>
              )}
              {error && error.hint && (
                <p className="text-red-300">
                  <strong>Hint:</strong> {error.hint}
                </p>
              )}
            </div>
            <div className="mt-6 p-4 bg-red-950/30 rounded">
              <h3 className="font-semibold text-red-400 mb-2">Troubleshooting:</h3>
              <ul className="list-disc list-inside text-red-300 space-y-1 text-sm">
                <li>Check that your Supabase URL and Anon Key are correctly set in .env.local</li>
                <li>Ensure the test_connection table exists in your Supabase database</li>
                <li>Verify that the table has at least one row with a message field</li>
                <li>Check your Supabase RLS (Row Level Security) policies</li>
              </ul>
            </div>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              ✅ Connection Successful!
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">
                  Data Retrieved from Supabase:
                </h3>
                <div className="bg-black/30 rounded p-4 font-mono text-sm">
                  <pre className="text-green-300 whitespace-pre-wrap">
{JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
              
              {data[0].message && (
                <div className="bg-green-950/30 rounded p-4">
                  <p className="text-lg">
                    <span className="text-green-300">Message from Database:</span>{' '}
                    <strong className="text-green-400 text-xl">{data[0].message}</strong>
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-green-950/30 rounded">
                <h3 className="font-semibold text-green-400 mb-2">✨ What This Means:</h3>
                <ul className="list-disc list-inside text-green-300 space-y-1 text-sm">
                  <li>Your Supabase client is properly configured</li>
                  <li>Environment variables are correctly loaded</li>
                  <li>The database connection is working</li>
                  <li>You can now build features using Supabase!</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {(!data || data.length === 0) && !error && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">
              ⏳ Loading...
            </h2>
            <p className="text-yellow-300">
              Attempting to connect to Supabase...
            </p>
          </div>
        )}

        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-primary mb-3">
            📋 Task 1.9 Verification Checklist
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-primary/80">Supabase library installed (@supabase/supabase-js)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-primary/80">Environment variables configured (.env.local)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-primary/80">Central client created (lib/supabase/client.ts)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-primary/80">Test page created (/supabase-test)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={data && data.length > 0 ? "text-green-400" : "text-yellow-400"}>
                {data && data.length > 0 ? "✓" : "⏳"}
              </span>
              <span className="text-primary/80">
                Data fetch verified {data && data.length > 0 ? "(Success)" : "(No data in table)"}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}