'use client';

import React, { useState, useRef } from 'react';
import { id } from '@instantdb/react';
import db from '@/lib/db';

function Main() {
  const user = db.useUser();
  const { isLoading, error, data } = db.useQuery({
    poems: {
      $: {
        order: { createdAt: 'desc' },
      },
      author: {},
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading poems…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const poems = data?.poems ?? [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Poetry
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => db.auth.signOut()}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <PoemForm />
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
            All poems
          </h2>
          <ul className="space-y-6">
            {poems.length === 0 ? (
              <li className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                No poems yet. Post the first one above.
              </li>
            ) : (
              poems.map((poem) => (
                <li
                  key={poem.id}
                  className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {poem.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                    {poem.body}
                  </p>
                  <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                    by {poem.author?.email ?? 'Anonymous'} ·{' '}
                    {poem.createdAt
                      ? new Date(poem.createdAt).toLocaleDateString()
                      : ''}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

function PoemForm() {
  const user = db.useUser();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    try {
      db.transact(
        db.tx.poems[id()]
          .update({
            title: t,
            body: b,
            createdAt: Date.now(),
          })
          .link({ author: user.id })
      );
      setTitle('');
      setBody('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to post');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
        New poem
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="poem-title"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Title
          </label>
          <input
            id="poem-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Poem title"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="poem-body"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Body
          </label>
          <textarea
            id="poem-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your poem…"
            rows={5}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            required
          />
        </div>
        {submitError && (
          <p className="text-sm text-red-500">{submitError}</p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Post poem
        </button>
      </div>
    </form>
  );
}

function Login() {
  const [sentEmail, setSentEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {!sentEmail ? (
          <EmailStep
            onSendEmail={setSentEmail}
            onError={setAuthError}
            onClearError={() => setAuthError(null)}
          />
        ) : (
          <CodeStep
            sentEmail={sentEmail}
            onBack={() => setSentEmail('')}
            onError={setAuthError}
            onClearError={() => setAuthError(null)}
          />
        )}
        {authError && (
          <p className="mt-4 text-center text-sm text-red-500">{authError}</p>
        )}
      </div>
    </div>
  );
}

function EmailStep({
  onSendEmail,
  onError,
  onClearError,
}: {
  onSendEmail: (email: string) => void;
  onError: (msg: string) => void;
  onClearError: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    const email = inputRef.current?.value?.trim();
    if (!email) return;
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err: { body?: { message?: string } }) => {
      onError(err?.body?.message ?? 'Failed to send code');
      onSendEmail('');
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Log in
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a verification code. We&apos;ll
        create an account if you don&apos;t have one.
      </p>
      <input
        ref={inputRef}
        type="email"
        placeholder="you@example.com"
        className="mt-4 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        required
        autoFocus
      />
      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-zinc-900 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Send code
      </button>
    </form>
  );
}

function CodeStep({
  sentEmail,
  onBack,
  onError,
  onClearError,
}: {
  sentEmail: string;
  onBack: () => void;
  onError: (msg: string) => void;
  onClearError: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    const code = inputRef.current?.value?.trim();
    if (!code) return;
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err: { body?: { message?: string } }) => {
      onError(err?.body?.message ?? 'Invalid or expired code');
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Enter your code
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        We sent an email to <strong>{sentEmail}</strong>. Paste the code here.
      </p>
      <input
        ref={inputRef}
        type="text"
        placeholder="123456"
        className="mt-4 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        required
        autoFocus
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-zinc-900 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Verify
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  return (
    <>
      <db.SignedIn>
        <Main />
      </db.SignedIn>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
    </>
  );
}
