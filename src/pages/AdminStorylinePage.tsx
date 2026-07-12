import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAccess } from "../hooks/useAdminAccess";
import { useAuth } from "../hooks/useAuth";
import { LOGIN_PATH } from "../lib/auth-routes";
import {
  fetchAllStorylineRecords,
  type StorylineRecord,
} from "../lib/storyline";
import "./AdminStorylinePage.css";

function formatChoice(choice: StorylineRecord["main_storyline_choice"]) {
  if (choice === "yes") return "YES";
  if (choice === "no") return "NO";
  return "PENDING";
}

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function AdminStorylinePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const [records, setRecords] = useState<StorylineRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || adminLoading) return;

    if (!user) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [adminLoading, authLoading, isAdmin, navigate, user]);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;
    setLoadingRecords(true);
    setError(null);

    void fetchAllStorylineRecords()
      .then((data) => {
        if (cancelled) return;
        setRecords(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load storyline records.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingRecords(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const yes = records.filter((r) => r.main_storyline_choice === "yes").length;
    const no = records.filter((r) => r.main_storyline_choice === "no").length;
    const pending = records.filter((r) => !r.main_storyline_choice).length;
    return { yes, no, pending, total: records.length };
  }, [records]);

  if (authLoading || adminLoading || !user || !isAdmin) {
    return (
      <div className="adminStoryline">
        <div className="adminStoryline__loading">VERIFYING ADMIN CLEARANCE...</div>
      </div>
    );
  }

  return (
    <div className="adminStoryline">
      <div className="adminStoryline__bg" />
      <div className="adminStoryline__scanlines" />

      <header className="adminStoryline__header">
        <div>
          <p className="adminStoryline__eyebrow">ADMIN CONSOLE</p>
          <h1 className="adminStoryline__title">MAIN STORYLINE RESPONSES</h1>
        </div>
        <Link to="/" className="adminStoryline__back">
          ◀ TITLE SCREEN
        </Link>
      </header>

      <section className="adminStoryline__stats">
        <div className="adminStoryline__stat">
          <span>TOTAL OPERATORS</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="adminStoryline__stat adminStoryline__stat--yes">
          <span>STARTED STORYLINE</span>
          <strong>{stats.yes}</strong>
        </div>
        <div className="adminStoryline__stat adminStoryline__stat--no">
          <span>DECLINED</span>
          <strong>{stats.no}</strong>
        </div>
        <div className="adminStoryline__stat adminStoryline__stat--pending">
          <span>PENDING</span>
          <strong>{stats.pending}</strong>
        </div>
      </section>

      {error && <div className="adminStoryline__error">{error}</div>}

      <section className="adminStoryline__panel">
        <div className="adminStoryline__panelHeader">
          <span className="adminStoryline__dot" />
          OPERATOR RESPONSE LOG
        </div>

        {loadingRecords ? (
          <div className="adminStoryline__empty">LOADING RECORDS...</div>
        ) : records.length === 0 ? (
          <div className="adminStoryline__empty">NO OPERATOR RECORDS FOUND.</div>
        ) : (
          <div className="adminStoryline__tableWrap">
            <table className="adminStoryline__table">
              <thead>
                <tr>
                  <th>OPERATOR</th>
                  <th>CHOICE</th>
                  <th>DECIDED AT</th>
                  <th>REGISTERED</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.username}</td>
                    <td>
                      <span
                        className={`adminStoryline__badge adminStoryline__badge--${
                          record.main_storyline_choice ?? "pending"
                        }`}
                      >
                        {formatChoice(record.main_storyline_choice)}
                      </span>
                    </td>
                    <td>{formatTimestamp(record.main_storyline_decided_at)}</td>
                    <td>{formatTimestamp(record.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
