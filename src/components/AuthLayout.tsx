import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./AuthPage.css";

type Props = {
  code: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  terminalLines?: string[];
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthLayout({
  code,
  eyebrow,
  title,
  subtitle,
  terminalLines = [],
  children,
  footer,
}: Props) {
  return (
    <div className="authScreen">
      <div className="authScreen__bg" />
      <div className="authScreen__vignette" />
      <div className="authScreen__scanlines" />
      <div className="authScreen__noise" />

      <div className="authHud authHud--tl">
        <span className="authHud__label">MODULE</span>
        <span className="authHud__value">{code}</span>
      </div>
      <div className="authHud authHud--tr">
        <span className="authHud__label">STATUS</span>
        <span className="authHud__value authHud__value--live">SECURE</span>
      </div>
      <div className="authHud authHud--bl">
        <span className="authHud__label">CHANNEL</span>
        <span className="authHud__value">ENCRYPTED</span>
      </div>
      <div className="authHud authHud--br">
        <span className="authHud__label">BUILD</span>
        <span className="authHud__value">0.1.0</span>
      </div>

      <div className="authFrame authFrame--tl" />
      <div className="authFrame authFrame--tr" />
      <div className="authFrame authFrame--bl" />
      <div className="authFrame authFrame--br" />

      <Link to="/" className="authBack">
        <span className="authBack__cursor">◀</span> EXIT TO MAIN MENU
      </Link>

      <div className="authLayout">
        <aside className="authTerminal">
          <div className="authTerminal__header">
            <span className="authTerminal__dot" />
            IDENTITY REGISTRY
          </div>

          <div className="authTerminal__body">
            {terminalLines.map((line) => (
              <div key={line} className="authTerminal__line">
                <span className="authTerminal__prompt">&gt;</span>
                {line}
              </div>
            ))}
            <div className="authTerminal__line authTerminal__line--blink">
              <span className="authTerminal__prompt">&gt;</span>
              AWAITING INPUT...
            </div>
          </div>

          <div className="authTerminal__warning">
            WARNING: All identities are permanently logged. The city remembers
            everything.
          </div>
        </aside>

        <section className="authMain">
          <div className="authMain__header">
            <div className="authMain__eyebrow">{eyebrow}</div>
            <h1 className="authMain__title">{title}</h1>
            <p className="authMain__subtitle">{subtitle}</p>
          </div>

          <div className="authMain__panel">
            <div className="authMain__panelScan" />
            {children}
          </div>

          {footer && <div className="authMain__footer">{footer}</div>}
        </section>
      </div>
    </div>
  );
}
