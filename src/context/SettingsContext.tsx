"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_V1 } from "../lib/api";

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
