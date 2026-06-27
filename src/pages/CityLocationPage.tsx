import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLocationById } from "../data/city-levels";
import { useAuth } from "../hooks/useAuth";
import { useAdminAccess } from "../hooks/useAdminAccess";
import { redirectToLogin } from "../lib/auth-routes";
import { CITY_PATH } from "../lib/city-config";
import "./CityLocationPage.css";

export default function CityLocationPage() {
  const navigate = useNavigate();
  const { locationId = "" } = useParams();
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAccess();

  const location = useMemo(
    () => getLocationById(locationId),
    [locationId],
  );

  useEffect(() => {
    if (loading || adminLoading) return;
    if (!user) {
      redirectToLogin(navigate, `/city/locations/${locationId}`);
      return;
    }
    if (!isAdmin) {
      navigate(CITY_PATH, { replace: true });
    }
  }, [adminLoading, isAdmin, loading, navigate, user]);

  if (loading || adminLoading || !user || !isAdmin) {
    return (
      <div className="cityLocationPage">
        <div className="cityLocationPage__bg" />
        <div className="cityLocationPage__loading">LOADING...</div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="cityLocationPage">
        <div className="cityLocationPage__bg" />
        <main className="cityLocationPage__main">
          <p className="cityLocationPage__eyebrow">ADMIN BUILD</p>
          <h1 className="cityLocationPage__title">UNKNOWN SITE</h1>
          <p className="cityLocationPage__body">
            No location registered for <code>{locationId}</code>.
          </p>
          <button
            type="button"
            className="cityLocationPage__backBtn"
            onClick={() => navigate(CITY_PATH)}
          >
            ◀ BACK TO CITY MAP
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="cityLocationPage">
      <div className="cityLocationPage__bg" />
      <div className="cityLocationPage__scanlines" />
      <div className="cityLocationPage__vignette" />

      <main className="cityLocationPage__main">
        <p className="cityLocationPage__eyebrow">ADMIN BUILD SURFACE</p>
        <h1 className="cityLocationPage__title">{location.name}</h1>
        <p className="cityLocationPage__tag">{location.tagline}</p>
        <p className="cityLocationPage__body">{location.description}</p>
        <p className="cityLocationPage__meta">
          {location.kind.toUpperCase()} · {location.levelId} · {location.id}
        </p>
        <div className="cityLocationPage__placeholder">
          Build this location here — scene, shop flow, or lodging UI.
        </div>
        <button
          type="button"
          className="cityLocationPage__backBtn"
          onClick={() => navigate(CITY_PATH)}
        >
          ◀ BACK TO CITY MAP
        </button>
      </main>
    </div>
  );
}
