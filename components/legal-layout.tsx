import Link from "next/link";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  title: string;
  description: string;
  activePage: "terms" | "privacy";
  children: ReactNode;
};

export function LegalLayout({
  title,
  description,
  activePage,
  children,
}: LegalLayoutProps) {
  return (
    <div className="legal-shell">
      <header className="legal-header">
        <Link className="legal-brand" href="/" aria-label="Sitepulse home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>sitepulse</span>
        </Link>
        <nav className="legal-nav" aria-label="Legal pages">
          <Link href="/">Checker</Link>
          <Link
            href="/terms"
            aria-current={activePage === "terms" ? "page" : undefined}
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            aria-current={activePage === "privacy" ? "page" : undefined}
          >
            Privacy
          </Link>
        </nav>
      </header>

      <main className="legal-content">
        <p className="legal-eyebrow">SITEPULSE / LEGAL</p>
        <h1>{title}</h1>
        <p className="legal-summary">{description}</p>
        <p className="legal-updated">Last updated October 6, 2026</p>
        <article className="legal-prose">{children}</article>
      </main>

      <footer className="legal-footer">
        <span>© {new Date().getFullYear()} Sitepulse</span>
        <nav className="legal-footer-links" aria-label="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}