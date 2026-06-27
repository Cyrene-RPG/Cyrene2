import { useEffect, useMemo, useState } from "react";
import { BUILTIN_ADMIN_HANDLES, isAdminUser } from "../lib/admin-access";
import { fetchProfile } from "../lib/profiles";
import { useAuth } from "./useAuth";

export function useAdminAccess() {
  const { user, loading: authLoading } = useAuth();
  const [profileAdmin, setProfileAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileAdmin(null);
      return;
    }

    let cancelled = false;

    fetchProfile(user.id)
      .then((profile) => {
        if (cancelled) return;
        const profileHandle = profile?.username?.trim().toLowerCase() ?? "";
        setProfileAdmin(
          profile?.is_admin === true ||
            BUILTIN_ADMIN_HANDLES.has(profileHandle),
        );
      })
      .catch(() => {
        if (!cancelled) setProfileAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = useMemo(() => {
    if (isAdminUser(user)) return true;
    return profileAdmin === true;
  }, [profileAdmin, user]);

  const loading =
    authLoading || (Boolean(user) && profileAdmin === null && !isAdminUser(user));

  return { isAdmin, loading };
}
