"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api";

export interface SiteSettings {
  enable_gst?: boolean;
  enable_store?: boolean;
  enable_software?: boolean;
  enable_services?: boolean;
  enable_lab_setup?: boolean;
  enable_projects?: boolean;
  enable_training?: boolean;
  enable_blog?: boolean;
  enable_career?: boolean;
  enable_contact?: boolean;
  [key: string]: any;
}

export const defaultSiteSettings: SiteSettings = {
  enable_gst: false,
  enable_store: true,
  enable_software: true,
  enable_services: true,
  enable_lab_setup: true,
  enable_projects: true,
  enable_training: true,
  enable_blog: true,
  enable_career: true,
  enable_contact: true,
};

export function useSiteSettings() {
  const { data: settings = defaultSiteSettings, isLoading, refetch } = useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      try {
        const res = await settingsApi.get();
        return { ...defaultSiteSettings, ...res.data };
      } catch {
        return defaultSiteSettings;
      }
    },
    staleTime: 15000,
  });

  const isModuleEnabled = (moduleKey: string): boolean => {
    const key = moduleKey.startsWith("enable_") ? moduleKey : `enable_${moduleKey}`;
    if (settings && typeof settings[key] === "boolean") {
      return settings[key];
    }
    return true;
  };

  return {
    settings,
    isLoading,
    isModuleEnabled,
    refetch,
  };
}
