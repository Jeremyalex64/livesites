"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type CheckStatus = "up" | "issue" | "down";

type CheckDiagnosis = {
  category: string;
  title: string;
  detail: string;
  nextStep: string;
};

type CheckResult = {
  url: string;
  status: CheckStatus;
  statusCode: number | null;
  responseTime: number | null;
  checkedAt: string;
  message?: string;
  diagnosis?: CheckDiagnosis;
};

function isCheckResultPayload(
  value: unknown,
): value is Omit<CheckResult, "checkedAt"> {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.url === "string" &&
    ["up", "issue", "down"].includes(String(payload.status)) &&
    (typeof payload.statusCode === "number" || payload.statusCode === null) &&
    (typeof payload.responseTime === "number" || payload.responseTime === null)
  );
}

const HISTORY_KEY = "sitepulse-check-history";
const HISTORY_LIMIT = 30;

function formatCheckedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: CheckStatus) {
  if (status === "up") return "Live";
  if (status === "issue") return "Server error";
  return "Down";
}

function displayHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [historyReady, setHistoryReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item): item is CheckResult =>
              item &&
              typeof item.url === "string" &&
              ["up", "issue", "down"].includes(item.status) &&
              typeof item.checkedAt === "string" &&
              Number.isFinite(Date.parse(item.checkedAt)),
          );
          setHistory(valid.slice(0, HISTORY_LIMIT));
        }
      }
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
    setHistoryReady(true);
  }, []);

  useEffect(() => {
    if (historyReady) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history, historyReady]);

  async function checkWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const enteredUrl = url.trim();
    const normalizedUrl = /^https?:\/\//i.test(enteredUrl)
      ? enteredUrl
      : `https://${enteredUrl}`;

    try {
      const parsedUrl = new URL(normalizedUrl);
      if (!parsedUrl.hostname.includes(".")) {
        throw new Error("Enter a complete website address, like example.com.");
      }

      setChecking(true);
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsedUrl.toString() }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "We could not check that website.";
        throw new Error(message);
      }

      if (!isCheckResultPayload(data)) {
        throw new Error("The checker returned an invalid response. Try again.");
      }

      const checked: CheckResult = {
        ...data,
        checkedAt: new Date().toISOString(),
      };
      setResult(checked);
      setHistory((current) =>
        [checked, ...current.filter((item) => item.url !== checked.url)].slice(
          0,
          HISTORY_LIMIT,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not check that website. Try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    setResult(null);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Sitepulse home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>sitepulse</span>
        </Link>

        <div className="side-section-label">WORKSPACE</div>
        <div className="nav-item nav-item-active">
          <span className="nav-indicator" />
          Website checker
        </div>

        <div className="history-heading">
          <span className="side-section-label">RECENT CHECKS</span>
          {history.length > 0 && (
            <button
              className="text-button"
              onClick={clearHistory}
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        {history.length ? (
          <div className="history-list" aria-label="Recent website checks">
            {history.map((item) => (
              <button
                className={`history-item ${result?.url === item.url ? "history-item-selected" : ""}`}
                key={item.url}
                onClick={() => {
                  setResult(item);
                  setUrl(item.url);
                  setError("");
                }}
                type="button"
              >
                <span className={`status-dot status-${item.status}`} />
                <span className="history-copy">
                  <span className="history-domain">
                    {displayHostname(item.url)}
                  </span>
                  <span className="history-date">
                    {formatCheckedAt(item.checkedAt)}
                  </span>
                </span>
                <span className={`history-status status-text-${item.status}`}>
                  {statusLabel(item.status)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="history-empty">Your recent checks will show up here.</p>
        )}

        <div className="sidebar-bottom">
          <span className="privacy-icon" aria-hidden="true">
            ●
          </span>
          <span>History stays in this browser</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">
            Tools <span>/</span> Website checker
          </span>
          <div className="public-badge">
            <span /> Free public checker
          </div>
          <Link className="topbar-blog-link" href="/blog">
            Blog
          </Link>
        </header>

        <div className="content-wrap">
          <section className="intro-section">
            <div className="eyebrow">
              <span /> INSTANT WEBSITE STATUS
            </div>
            <h1>
              Is it down for everyone
              <br className="desktop-break" /> or just you?
            </h1>
            <p>
              Check if a website is reachable in seconds. No account, no
              guesswork.
            </p>
          </section>

          <section className="checker-section" aria-label="Check a website">
            <form className="check-form" onSubmit={checkWebsite}>
              <label className="visually-hidden" htmlFor="website-url">
                Website address
              </label>
              <span className="input-prefix" aria-hidden="true">
                https://
              </span>
              <input
                autoCapitalize="none"
                autoComplete="url"
                id="website-url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="yourwebsite.com"
                spellCheck={false}
                type="text"
                value={url.replace(/^https?:\/\//i, "")}
              />
              <button
                className="check-button"
                disabled={checking || !url.trim()}
                type="submit"
              >
                {checking ? (
                  <>
                    <span className="button-spinner" /> Checking
                  </>
                ) : (
                  "Check status"
                )}
                {!checking && <span aria-hidden="true">↗</span>}
              </button>
            </form>
            <div className="form-footnote">
              <span className="footnote-lock" aria-hidden="true">
                ✓
              </span>
              We make one request from our servers. Your searches stay private.
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </section>

          {checking && (
            <section className="result-panel result-pending" aria-live="polite">
              <span className="pending-pulse" />
              <div>
                <h2>Checking website response</h2>
                <p>This usually takes just a few seconds.</p>
              </div>
            </section>
          )}

          {result && !checking && (
            <section
              className={`result-panel result-${result.status}`}
              aria-live="polite"
            >
              <div className="result-main">
                <span className={`result-status-mark status-${result.status}`}>
                  {result.status === "up"
                    ? "✓"
                    : result.status === "issue"
                      ? "!"
                      : "×"}
                </span>
                <div className="result-copy">
                  <div className="result-kicker">STATUS CHECK</div>
                  <h2>{statusLabel(result.status)}</h2>
                  <p className="result-url">{result.url}</p>
                  {result.message && (
                    <p className="result-message">{result.message}</p>
                  )}
                </div>
                <a
                  className="open-site"
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit website <span aria-hidden="true">↗</span>
                </a>
              </div>
              {result.diagnosis && (
                <div
                  className={`diagnosis-panel diagnosis-${result.diagnosis.category}`}
                  aria-label="Likely reason for this result"
                >
                  <span className="diagnosis-icon" aria-hidden="true">
                    {result.status === "up" ? "i" : "!"}
                  </span>
                  <div className="diagnosis-copy">
                    <span className="diagnosis-label">LIKELY REASON</span>
                    <h3>{result.diagnosis.title}</h3>
                    <p>{result.diagnosis.detail}</p>
                    <p className="diagnosis-next">
                      <strong>What to check:</strong>{" "}
                      {result.diagnosis.nextStep}
                    </p>
                  </div>
                </div>
              )}
              <div className="result-metrics">
                <div>
                  <span>HTTP RESPONSE</span>
                  <strong>{result.statusCode ?? "—"}</strong>
                </div>
                <div>
                  <span>RESPONSE TIME</span>
                  <strong>
                    {result.responseTime === null
                      ? "—"
                      : `${result.responseTime} ms`}
                  </strong>
                </div>
                <div>
                  <span>CHECKED</span>
                  <strong>{formatCheckedAt(result.checkedAt)}</strong>
                </div>
              </div>
            </section>
          )}

          <aside className="ad-slot" aria-label="Advertisement">
            <span>ADVERTISEMENT</span>
          </aside>

          <section className="how-section">
            <div className="how-heading">
              <div>
                <div className="eyebrow">SIMPLE, HONEST CHECKS</div>
                <h2>Know where the problem is.</h2>
              </div>
              <p>
                We request the website directly and report what its server sends
                back.
              </p>
            </div>
            <div className="steps-grid">
              <article className="step-item">
                <span className="step-number">01</span>
                <h3>Enter a website</h3>
                <p>Type any public web address. No sign-up or setup needed.</p>
              </article>
              <article className="step-item">
                <span className="step-number">02</span>
                <h3>We check the response</h3>
                <p>
                  Our server makes a single request and measures the response
                  time.
                </p>
              </article>
              <article className="step-item">
                <span className="step-number">03</span>
                <h3>See the result</h3>
                <p>
                  Find out whether the website responded and what status it
                  returned.
                </p>
              </article>
            </div>
          </section>

          <footer className="page-footer">
            <span>© {new Date().getFullYear()} Sitepulse</span>
            <nav className="footer-links" aria-label="Legal">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </footer>
        </div>
      </main>
    </div>
  );
}
