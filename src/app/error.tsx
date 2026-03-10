'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isConfigError =
    error.message.includes('NEXT_PUBLIC_INSTANT_APP_ID') ||
    error.message.includes('InstantDB App ID');

  return (
    <div className="poetry-bg flex min-h-screen flex-col items-center justify-center px-4">
      <div className="poetry-card max-w-md rounded-xl p-6">
        <h1 className="text-lg font-semibold text-red-600 dark:text-red-400">
          {isConfigError ? 'Configuration required' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {error.message}
        </p>
        {isConfigError && (
          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            In Vercel: open your project → Settings → Environment Variables →
            add <code className="rounded bg-[var(--cream-dark)] px-1">NEXT_PUBLIC_INSTANT_APP_ID</code> with your App ID from{' '}
            <a
              href="https://instantdb.com/dash"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink)] underline hover:text-[var(--accent)]"
            >
              instantdb.com/dash
            </a>
            , then redeploy.
          </p>
        )}
        {!isConfigError && (
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
