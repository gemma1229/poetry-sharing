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
      <div className="poetry-bg flex min-h-screen items-center justify-center">
        <p className="font-poetry text-[var(--ink-soft)]">Loading poems…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="poetry-bg flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  const poems = data?.poems ?? [];

  return (
    <div className="poetry-bg min-h-screen">
      <header className="border-b border-[var(--paper-border)] bg-[var(--paper)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="font-poetry text-2xl font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
            Poetry
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--ink-soft)]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => db.auth.signOut()}
              className="rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--rose-soft)]/20 dark:hover:bg-[var(--rose-soft)]/30"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <PoemForm />
        <section className="mt-10">
          <h2 className="font-poetry mb-4 text-xl font-medium text-[var(--ink)] dark:text-[var(--ink)]">
            All poems
          </h2>
          <ul className="space-y-6">
            {poems.length === 0 ? (
              <li className="poetry-card rounded-xl p-6 text-center text-[var(--ink-soft)]">
                No poems yet. Post the first one above.
              </li>
            ) : (
              poems.map((poem) => (
                <li
                  key={poem.id}
                  className="poetry-card rounded-xl p-6"
                >
                  <h3 className="font-poetry text-xl font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
                    {poem.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--ink-soft)]">
                    {poem.body}
                  </p>
                  <p className="mt-4 text-xs text-[var(--rose-muted)] dark:text-[var(--ink-soft)]">
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
      className="poetry-card rounded-xl p-6"
    >
      <h2 className="font-poetry mb-4 text-xl font-medium text-[var(--ink)] dark:text-[var(--ink)]">
        New poem
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="poem-title"
            className="mb-1 block text-sm font-medium text-[var(--ink-soft)]"
          >
            Title
          </label>
          <input
            id="poem-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Poem title"
            className="w-full rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] placeholder-[var(--ink-soft)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="poem-body"
            className="mb-1 block text-sm font-medium text-[var(--ink-soft)]"
          >
            Body
          </label>
          <textarea
            id="poem-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your poem…"
            rows={5}
            className="w-full rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] placeholder-[var(--ink-soft)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            required
          />
        </div>
        {submitError && (
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
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
    <div className="poetry-bg flex min-h-screen items-center justify-center px-4">
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
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{authError}</p>
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
      className="poetry-card rounded-xl p-6"
    >
      <h2 className="font-poetry text-xl font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
        Log in
      </h2>
      <p className="mt-2 text-[var(--ink-soft)]">
        Enter your email and we&apos;ll send you a verification code. We&apos;ll
        create an account if you don&apos;t have one.
      </p>
      <input
        ref={inputRef}
        type="email"
        placeholder="you@example.com"
        className="mt-4 w-full rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] placeholder-[var(--ink-soft)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        required
        autoFocus
      />
      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-[var(--accent)] py-2 font-medium text-white hover:bg-[var(--accent-hover)]"
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
      className="poetry-card rounded-xl p-6"
    >
      <h2 className="font-poetry text-xl font-semibold text-[var(--ink)] dark:text-[var(--ink)]">
        Enter your code
      </h2>
      <p className="mt-2 text-[var(--ink-soft)]">
        We sent an email to <strong className="text-[var(--ink)]">{sentEmail}</strong>. Paste the code here.
      </p>
      <input
        ref={inputRef}
        type="text"
        placeholder="123456"
        className="mt-4 w-full rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] px-3 py-2 text-[var(--ink)] placeholder-[var(--ink-soft)]/70 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        required
        autoFocus
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--paper-border)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--rose-soft)]/20 dark:hover:bg-[var(--rose-soft)]/30"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-[var(--accent)] py-2 font-medium text-white hover:bg-[var(--accent-hover)]"
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
