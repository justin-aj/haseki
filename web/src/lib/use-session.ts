"use client";

import { useCallback, useEffect, useState } from "react";
import { type Schemas, browserApi } from "./api/client";

export type User = Schemas["User"];

/** Signed-in user from the API session cookie. `undefined` while loading. */
export function useSession() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    browserApi.GET("/auth/me").then(({ data }) => {
      if (live) setUser(data?.user ?? null);
    });
    return () => {
      live = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await browserApi.POST("/auth/logout");
    setUser(null);
  }, []);

  return { user, setUser, signOut };
}
