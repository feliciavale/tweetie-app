"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface CurrentUser {
  username: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

interface CurrentUserContextValue {
  me: CurrentUser | null;
  loading: boolean;
  refresh: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setMe(data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <CurrentUserContext.Provider value={{ me, loading, refresh: load }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
