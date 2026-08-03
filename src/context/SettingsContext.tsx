"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface SiteSettings {
  whatsappNumber: string;
}

const defaultSettings: SiteSettings = {
  whatsappNumber: "917736830303",
};

const SettingsContext = createContext<SiteSettings>(defaultSettings);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
          : "http://localhost:5000";

        const res = await axios.get(`${baseUrl}/api/v1/site-settings`, { params: { t: Date.now() } });
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
