"use client";

import { useEffect, useState } from "react";
import { fetchPublicWidgetBySlug, WidgetDto } from "@/src/shared/api/widgets";
import { ContentRenderer } from "@/src/widgets/content-renderer/ContentRenderer";
import dynamic from 'next/dynamic';

const ProductListWidget = dynamic(() => import('@/src/widgets/products/ProductListWidget'), { ssr: false });
const PublicProductView = dynamic(() => import('@/src/widgets/public-product/PublicProductView'), { ssr: false });

interface WidgetRendererProps {
  slug: string;
  fallback?: React.ReactNode;
}

export const WidgetRenderer = ({ slug, fallback = null }: WidgetRendererProps) => {
  const [widget, setWidget] = useState<WidgetDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWidget() {
      try {
        setLoading(true);
        const data = await fetchPublicWidgetBySlug(slug);
        if (active) {
          setWidget(data);
        }
      } catch {
        if (active) {
          setWidget(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadWidget();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-100 rounded my-2" />;
  }

  if (!widget || widget.status !== "active") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fallback as any;
  }

  // Parse EditorJS content blocks if available
  let blocks = [];
  try {
    if (widget.content) {
      const parsed =
        typeof widget.content === "string" ? JSON.parse(widget.content) : widget.content;
      blocks = parsed.blocks || [];
    }
  } catch {
    // Ignore error
  }

  if (blocks.length === 0) {
    // Handle custom widget types stored in widget.config
    try {
      const cfg = widget.config || {};
      if (cfg.widgetType === 'products-list') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ProductListWidget config={cfg} /> as any;
      }
      if (cfg.widgetType === 'product-single') {
        const productId = cfg.productId || cfg.id || null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <PublicProductView productId={productId} config={cfg} /> as any;
      }
    } catch {
      // fallback to default
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fallback as any;
  }

  return (
    <div className="widget-container" data-widget-slug={slug}>
      <ContentRenderer blocks={blocks} publicMode />
    </div>
  );
};
