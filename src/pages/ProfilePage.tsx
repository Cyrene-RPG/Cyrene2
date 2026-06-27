import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { redirectToLogin } from "../lib/auth-routes";
import {
  getProfileAvatarPath,
  isAvatarForgePaused,
} from "../lib/avatar-forge-config";
import { CITY_PATH, MISSIONS_PATH } from "../lib/city-config";
import { goToMainMenu, startNewAvatarForge } from "../lib/avatar-forge-nav";
import {
  fetchOperatorAvatars,
  getAvatarClassLabel,
  getAvatarDisplayName,
  getAvatarIdentificationNumber,
  getAvatarInitial,
  MAX_AVATAR_SLOTS,
  type OperatorAvatar,
} from "../lib/operator-avatars";
import { fetchProfile, signOutOperator, type Profile } from "../lib/profiles";
import "./ProfilePage.css";

const CHARACTER_SLOTS = MAX_AVATAR_SLOTS;

type SavedAvatarNotice = {
  id: string;
  name: string;
  identificationNumber: string;
};

type ProfileLocationState = {
  savedAvatar?: SavedAvatarNotice;
};

type NavLink = {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  external?: boolean;
  accent?: "green" | "cyan" | "purple";
};

const NAV_LINKS: NavLink[] = [
  {
    id: "city",
    label: "ENTER CYRENE",
    sublabel: "Open the city map and travel between districts",
    href: CITY_PATH,
    accent: "green",
  },
  {
    id: "missions",
    label: "MISSIONS",
    sublabel: "Resume your story and active contracts",
    href: MISSIONS_PATH,
    accent: "cyan",
  },
  {
    id: "codex",
    label: "CYRENE CODEX",
    sublabel: "Lore, factions, and city intel",
    href: "/codexhome.html",
    accent: "purple",
  },
  {
    id: "security",
    label: "SECURITY",
    sublabel: "Password and account settings",
    href: "/security.html",
    accent: "cyan",
  },
  {
    id: "shop",
    label: "MAGIC SHOP",
    sublabel: "Curiosities and upgrades",
    href: "/magic-shop",
    accent: "purple",
  },
  {
    id: "discord",
    label: "JOIN DISCORD",
    sublabel: "Community uplink",
    href: "https://discord.gg/DQnaGs7P",
    external: true,
    accent: "green",
  },
];

function formatJoinedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [selectedNav, setSelectedNav] = useState(0);
  const [avatars, setAvatars] = useState<OperatorAvatar[]>([]);
  const [avatarsLoading, setAvatarsLoading] = useState(true);
  const [savedAvatarNotice, setSavedAvatarNotice] = useState<SavedAvatarNotice | null>(
    () => (location.state as ProfileLocationState | null)?.savedAvatar ?? null,
  );

  const displayName = useMemo(() => {
    if (profile?.username) return profile.username.toUpperCase();
    return (
      user?.user_metadata?.username ??
      user?.email?.split("@")[0] ??
      "UNKNOWN"
    ).toUpperCase();
  }, [profile?.username, user]);

  const avatarInitial = displayName.charAt(0) || "?";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      redirectToLogin(navigate, location.pathname);
    }
  }, [loading, location.pathname, navigate, user]);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);

    fetchProfile(user.id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setProfileError(
            err instanceof Error ? err.message : "Failed to load profile.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAvatars([]);
      setAvatarsLoading(false);
      return;
    }

    let cancelled = false;
    setAvatarsLoading(true);

    fetchOperatorAvatars(user.id)
      .then((data) => {
        if (!cancelled) setAvatars(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setProfileError(
            err instanceof Error ? err.message : "Failed to load avatars.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAvatarsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!savedAvatarNotice) return;
    const timer = window.setTimeout(() => setSavedAvatarNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [savedAvatarNotice]);

  const slotsAvailable = CHARACTER_SLOTS - avatars.length;

  function openHref(href: string, external?: boolean) {
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = href;
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutOperator();
      navigate("/", { replace: true });
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Sign out failed.");
      setSigningOut(false);
    }
  }

  function handleCreateCharacter() {
    if (isAvatarForgePaused() || avatars.length >= CHARACTER_SLOTS) return;
    startNewAvatarForge(navigate);
  }

  function handleOpenAvatar(avatar: OperatorAvatar) {
    navigate(getProfileAvatarPath(avatar.id));
  }

  if (loading || !user) {
    return (
      <div className="profilePage">
        <div className="profilePage__bg" />
        <div className="profilePage__loading">SCANNING OPERATOR FILE...</div>
      </div>
    );
  }

  return (
    <div className="profilePage">
      <div className="profilePage__bg" />
      <div className="profilePage__scanlines" />
      <div className="profilePage__vignette" />

      <div className="profilePage__frame profilePage__frame--tl" />
      <div className="profilePage__frame profilePage__frame--tr" />
      <div className="profilePage__frame profilePage__frame--bl" />
      <div className="profilePage__frame profilePage__frame--br" />

      <div className="profilePage__hud profilePage__hud--tl">
        <span>MODULE</span>
        <span className="profilePage__hudVal">OPERATOR-FILE</span>
      </div>
      <div className="profilePage__hud profilePage__hud--tr">
        <span>OPERATOR</span>
        <span className="profilePage__hudVal profilePage__hudVal--accent">
          {displayName}
        </span>
      </div>
      <div className="profilePage__hud profilePage__hud--bl">
        <span>STATUS</span>
        <span className="profilePage__hudVal profilePage__hudVal--live">
          SESSION ACTIVE
        </span>
      </div>
      <div className="profilePage__hud profilePage__hud--br">
        <span>SLOTS</span>
        <span className="profilePage__hudVal">
          {avatarsLoading
            ? "SCANNING..."
            : `${slotsAvailable} AVAILABLE`}
        </span>
      </div>

      <main className="profilePage__main">
        <header className="profilePage__header">
          <p className="profilePage__eyebrow">IDENTITY RECORD</p>
          <h1 className="profilePage__title">OPERATOR FILE</h1>
          <p className="profilePage__subtitle">
            Welcome back, {displayName.toLowerCase()}
          </p>
        </header>

        <div className="profilePage__stage">
          <section className="profilePage__identity">
            <div className="profilePage__identityHeader">
              <span className="profilePage__dot" />
              OPERATOR PROFILE
            </div>

            <div className="profilePage__avatarWrap">
              <div className="profilePage__avatar">{avatarInitial}</div>
              <div className="profilePage__avatarGlow" />
            </div>

            <div className="profilePage__identityBlock">
              <span className="profilePage__identityLabel">Operator name</span>
              <span className="profilePage__identityValue">{displayName}</span>
            </div>

            <div className="profilePage__identityBlock">
              <span className="profilePage__identityLabel">Email uplink</span>
              <span className="profilePage__identityValue profilePage__identityValue--dim">
                {user.email ?? "—"}
              </span>
            </div>

            <div className="profilePage__identityBlock">
              <span className="profilePage__identityLabel">File opened</span>
              <span className="profilePage__identityValue profilePage__identityValue--dim">
                {profileLoading
                  ? "Scanning..."
                  : profile?.created_at
                    ? formatJoinedDate(profile.created_at)
                    : "—"}
              </span>
            </div>

            {profileError ? (
              <p className="profilePage__error">{profileError}</p>
            ) : null}

            <div className="profilePage__identityActions">
              <button
                type="button"
                className="profilePage__backBtn"
                onClick={() => goToMainMenu(navigate)}
              >
                <span className="profilePage__backCursor">◀</span>
                MAIN MENU
              </button>

              <button
                type="button"
                className="profilePage__logoutBtn"
                disabled={signingOut}
                onClick={handleSignOut}
              >
                {signingOut ? "SIGNING OUT..." : "LOG OUT"}
              </button>
            </div>
          </section>

          <section className="profilePage__panel">
            <div className="profilePage__panelHeader">
              <span className="profilePage__dot" />
              AVATAR SLOTS
            </div>

            {isAvatarForgePaused() ? (
              <p className="profilePage__forgeNotice">
                Avatar Forge is offline while character creation is redesigned.
                Slots are reserved for your future forms.
              </p>
            ) : null}

            {savedAvatarNotice ? (
              <div className="profilePage__saveNotice" role="status">
                <span className="profilePage__saveNoticeLabel">AVATAR REGISTERED</span>
                <span className="profilePage__saveNoticeName">
                  {savedAvatarNotice.name}
                </span>
                <span className="profilePage__saveNoticeId">
                  ID {savedAvatarNotice.identificationNumber}
                </span>
              </div>
            ) : null}

            <div className="profilePage__slots">
              {Array.from({ length: CHARACTER_SLOTS }, (_, index) => {
                const avatar = avatars.find(
                  (entry) => entry.slotIndex === index,
                );
                const forgePaused = isAvatarForgePaused();
                const slotsFull = avatars.length >= CHARACTER_SLOTS;

                if (avatar) {
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      className="profilePage__slot profilePage__slot--filled"
                      onClick={() => handleOpenAvatar(avatar)}
                    >
                      <span className="profilePage__slotIndex">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="profilePage__slotAvatar">
                        {getAvatarInitial(avatar)}
                      </span>
                      <span className="profilePage__slotName">
                        {getAvatarDisplayName(avatar)}
                      </span>
                      <span className="profilePage__slotMeta">
                        {getAvatarClassLabel(avatar)}
                      </span>
                      <span className="profilePage__slotId">
                        ID {getAvatarIdentificationNumber(avatar)}
                      </span>
                      <span className="profilePage__slotAction">CONTINUE</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={`profilePage__slot ${forgePaused ? "profilePage__slot--paused" : ""}`}
                    disabled={forgePaused || slotsFull || avatarsLoading}
                    onClick={handleCreateCharacter}
                  >
                    <span className="profilePage__slotIndex">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="profilePage__slotPlus">+</span>
                    <span className="profilePage__slotLabel">
                      {forgePaused
                        ? "FORGE OFFLINE"
                        : slotsFull
                          ? "SLOTS FULL"
                          : "NEW AVATAR"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="profilePage__navHeader">QUICK UPLINKS</div>

            <nav className="profilePage__nav" aria-label="Profile navigation">
              {NAV_LINKS.map((link, index) => (
                <button
                  key={link.id}
                  type="button"
                  className={`profilePage__navItem profilePage__navItem--${link.accent} ${
                    index === selectedNav ? "profilePage__navItem--selected" : ""
                  }`}
                  onMouseEnter={() => setSelectedNav(index)}
                  onClick={() => openHref(link.href, link.external)}
                >
                  <span className="profilePage__navCursor">
                    {index === selectedNav ? "▶" : " "}
                  </span>
                  <span className="profilePage__navText">
                    <span className="profilePage__navLabel">{link.label}</span>
                    <span className="profilePage__navSublabel">
                      {link.sublabel}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </section>
        </div>
      </main>
    </div>
  );
}
