"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const now = new Date();
            const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
            const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

            // Visitor Session ID
            let sessionId = sessionStorage.getItem("genbots_session_id");
            if (!sessionId) {
                sessionId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
                sessionStorage.setItem("genbots_session_id", sessionId);
            }

            // Unique Visitor ID
            let visitorId = localStorage.getItem("genbots_visitor_id");
            if (!visitorId) {
                visitorId = `vis_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
                localStorage.setItem("genbots_visitor_id", visitorId);
            }

            // Device detection
            const ua = navigator.userAgent;
            let device = "Desktop";
            if (/mobile/i.test(ua)) device = "Mobile";
            else if (/tablet|ipad/i.test(ua)) device = "Tablet";

            let browser = "Chrome";
            if (/firefox/i.test(ua)) browser = "Firefox";
            else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
            else if (/edg/i.test(ua)) browser = "Edge";

            // Track daily views
            const dailyViewsRaw = localStorage.getItem("genbots_daily_views");
            const dailyViews: Record<string, number> = dailyViewsRaw ? JSON.parse(dailyViewsRaw) : {};
            dailyViews[dateStr] = (dailyViews[dateStr] || 0) + 1;
            localStorage.setItem("genbots_daily_views", JSON.stringify(dailyViews));

            // Track page views breakdown
            const pageViewsRaw = localStorage.getItem("genbots_page_views");
            const pageViews: Record<string, number> = pageViewsRaw ? JSON.parse(pageViewsRaw) : {};
            pageViews[pathname] = (pageViews[pathname] || 0) + 1;
            localStorage.setItem("genbots_page_views", JSON.stringify(pageViews));

            // Track recent visitor activities (Max 50 items)
            const activitiesRaw = localStorage.getItem("genbots_visitor_activities");
            let activities: Array<{
                id: string;
                visitor_id: string;
                path: string;
                action: string;
                device: string;
                browser: string;
                time: string;
                timestamp: string;
                date: string;
            }> = activitiesRaw ? JSON.parse(activitiesRaw) : [];

            const newActivity = {
                id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                visitor_id: visitorId.slice(0, 10),
                path: pathname,
                action: getActionLabel(pathname),
                device,
                browser,
                time: timeStr,
                timestamp: now.toISOString(),
                date: dateStr,
            };

            // Filter out duplicate consecutive path logs within 3 seconds
            if (activities.length === 0 || activities[0].path !== pathname || Date.now() - new Date(activities[0].timestamp).getTime() > 3000) {
                activities = [newActivity, ...activities.slice(0, 49)];
                localStorage.setItem("genbots_visitor_activities", JSON.stringify(activities));
            }
        } catch (e) {
            console.error("Tracking error:", e);
        }
    }, [pathname]);

    return null;
}

function getActionLabel(path: string): string {
    if (path === "/") return "Visited Home Page";
    if (path.startsWith("/store")) return "Browsed Products Store";
    if (path.startsWith("/blog")) return "Read Blog Post";
    if (path.startsWith("/cart")) return "Viewed Shopping Cart";
    if (path.startsWith("/checkout")) return "Started Checkout";
    if (path.startsWith("/software")) return "Explored Software Portal";
    if (path.startsWith("/services")) return "Checked Services & Lab Setup";
    if (path.startsWith("/projects")) return "Viewed Gallery Projects";
    if (path.startsWith("/training")) return "Viewed Training Courses";
    if (path.startsWith("/about")) return "Read About GenBots";
    if (path.startsWith("/contact")) return "Opened Contact Page";
    return `Visited ${path}`;
}
