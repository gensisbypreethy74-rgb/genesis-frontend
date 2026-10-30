"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_V1 } from "../lib/api";
import type { SiteSettings } from "../lib/siteSettings";

// No built-in number: a WhatsApp link is only offered once the studio's own
// number is known, never pointed at one that may be out of date.
const UNKNOWN: SiteSettings = { whatsappNumber: "" };

const SettingsContext = createContext<SiteSettings>(UNKNOWN);

/** `initial` is fetched by the root layout on the server (null if that failed). */
export function SettingsProvider({
  initial,
  children,
}: {
  initial: SiteSettings | null;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initial ?? UNKNOWN);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_V1}/site-settings`, { params: { t: Date.now() } });
        if (res.data?.success && res.data?.data) {
          setSettings(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch site settings", error);
      }
    };

    fetchSettings();

    // Refetch when the user switches back to this tab (e.g., after changing settings in the admin panel)
    window.addEventListener("focus", fetchSettings);
    return () => window.removeEventListener("focus", fetchSettings);
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
