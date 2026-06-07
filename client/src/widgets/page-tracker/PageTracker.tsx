"use client";

import { useEffect, useRef } from "react";
import { createAnalyticsEntry } from "@/src/shared/api/analytics";

interface PageTrackerProps {
  entityType: "page" | "post" | "record" | "blogPost" | "article";
  entityId: number;
}

export function PageTracker({ entityType, entityId }: PageTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    const cookieName = `viewed_${entityType}_${entityId}`;
    let isUnique = true;
    
    // Check if user has a cookie
    if (document.cookie.split(";").some((item) => item.trim().startsWith(`${cookieName}=`))) {
      isUnique = false;
    } else {
      // Set cookie for 24 hours
      const date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
      document.cookie = `${cookieName}=true;expires=${date.toUTCString()};path=/`;
    }

    const data: any = {
      date: new Date().toISOString().split("T")[0],
      totalViews: 1,
      uniqueViews: isUnique ? 1 : 0,
    };

    if (entityType === "page") data.pageId = entityId;
    if (entityType === "post") data.postId = entityId;
    if (entityType === "record") data.recordId = entityId;
    if (entityType === "blogPost") data.blogPostId = entityId;
    if (entityType === "article") data.articleId = entityId;

    createAnalyticsEntry(null, data).catch((err) => {
      console.error("Failed to track analytics", err);
    });
  }, [entityType, entityId]);

  return null;
}
