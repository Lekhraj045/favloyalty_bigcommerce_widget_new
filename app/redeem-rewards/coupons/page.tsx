"use client";

import { Copy } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
};

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  return (
    (window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig })
      .FavLoyaltyWidgetConfig ?? {}
  );
}

type CouponProduct = {
  id?: string;
  name: string;
  imgUrl?: string | null;
  url?: string | null;
  productId?: string | null;
  variantId?: string | null;
};

type CouponItem = {
  id: string;
  offer: string;
  expires: string;
  code: string;
  expiresAt: string | null;
  used?: boolean;
  redeemType?: string | null;
  appliesToProducts?: CouponProduct[];
};

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

async function copyToClipboard(
  text: string,
  onSuccess: () => void
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      onSuccess();
      return;
    }
  } catch {
    // Clipboard API blocked (e.g. in iframe permissions policy) — use fallback
  }
  if (fallbackCopyText(text)) onSuccess();
}

export default function CouponsPage() {
  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<{
    id: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    setConfig(getConfig());
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        setConfig((prev) => ({
          ...prev,
          customerId:
            (data as { customerId?: string }).customerId ?? prev.customerId,
        }));
      }
      // Handle apply-coupon result from parent (widget-loader.js)
      if (data?.type === "fav-loyalty-apply-coupon-result") {
        setApplyingId(null);
        if (!data.success) {
          setApplyError({
            id: data.couponId || "",
            message: data.error || "Failed to apply coupon",
          });
          // Auto-clear error after 5 seconds
          setTimeout(() => setApplyError(null), 5000);
        }
        // On success the parent page redirects to cart, so no action needed here
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const fetchMyCoupons = useCallback(async () => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (!apiUrl || !storeHash || !channelId) {
      setCoupons([]);
      setLoading(false);
      return;
    }
    if (customerId == null || String(customerId).trim() === "") {
      setCoupons([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        storeHash: String(storeHash),
        channelId: String(channelId),
        customerId: String(customerId).trim(),
      });
      const url = `${apiUrl}/api/widget/my-coupons?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || `Failed to load coupons (${res.status})`
        );
      }
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
  ]);

  useEffect(() => {
    fetchMyCoupons();
  }, [fetchMyCoupons]);

  const handleCopy = (code: string, id: string) => {
    copyToClipboard(code, () => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleApplyNow = (coupon: CouponItem) => {
    if (applyingId) return; // prevent double-click
    setApplyingId(coupon.id);
    setApplyError(null);

    const isProductSpecific =
      Array.isArray(coupon.appliesToProducts) &&
      coupon.appliesToProducts.length > 0;

    // Send message to parent (widget-loader.js on the storefront page)
    // so it can call BigCommerce Storefront APIs (same-origin requirement)
    window.parent.postMessage(
      {
        type: "fav-loyalty-apply-coupon",
        couponId: coupon.id,
        couponCode: coupon.code,
        isProductSpecific,
        redeemType: coupon.redeemType || null,
        products: isProductSpecific ? coupon.appliesToProducts : [],
      },
      "*",
    );
  };

  if (loading) {
    return (
      <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller flex items-center justify-center">
        <p className="text-sm text-[#616161]">Loading your coupons…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller flex flex-col gap-4 items-center justify-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller flex flex-col gap-4">
        <p className="text-sm text-[#616161] text-center">
          You don&apos;t have any redeemed coupons yet. Redeem points from
          Rewards to get coupon codes here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller">
      <div className="flex flex-col gap-4">
        {coupons.map((coupon) => {
          const isUsed = coupon.used === true;
          const hasProducts =
            Array.isArray(coupon.appliesToProducts) &&
            coupon.appliesToProducts.length > 0;
          const firstProduct = hasProducts
            ? coupon.appliesToProducts![0]
            : null;
          return (
            <div
              key={coupon.id}
              className={`card flex flex-col gap-4 ${
                isUsed ? "opacity-75" : ""
              }`}
            >
              {/* Top section: image, offer, description, badge (Available / Used) */}
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center overflow-hidden bg-linear-to-br from-green-50 to-emerald-50">
                    <Image
                      src={`${basePath}/images/flat-discount.svg`}
                      alt={coupon.offer}
                      width={30}
                      height={30}
                      className="min-w-[30px] min-h-[30px] object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-[#303030] leading-tight">
                      {coupon.offer}
                    </h3>
                    <p className="text-[13px] text-[#616161] mt-0.5">
                      {coupon.expires}
                    </p>
                  </div>
                </div>
                {isUsed ? (
                  <span className="shrink-0 text-xs text-[#737373] bg-[#e5e5e5] px-2.5 py-1 rounded-full">
                    Used
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-[#16a34a] bg-[#dcfce7] px-2.5 py-1 rounded-full">
                    Available
                  </span>
                )}
              </div>

              {/* Applies to products (if any restriction) */}
              {hasProducts && firstProduct && (
                <div className="mt-1 rounded-lg bg-[#f5f5f5] px-3 py-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-[#404040]">
                      Applies to {coupon.appliesToProducts!.length} selected{" "}
                      {coupon.appliesToProducts!.length === 1
                        ? "product"
                        : "products"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#e5e5e5] flex items-center justify-center">
                      {firstProduct.imgUrl ? (
                        <img
                          src={firstProduct.imgUrl}
                          alt={firstProduct.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xs text-[#737373]">Image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#303030] font-medium truncate">
                        {firstProduct.name}
                      </p>
                      {firstProduct.url && (
                        <a
                          href={firstProduct.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] text-[#2563eb] hover:underline"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Dotted separator */}
              <div className="border-t border-dashed border-[#d4d4d4]" />

              {/* Bottom section: coupon code + Apply Now (disabled when used) */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-3 py-2 flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#303030] truncate">
                        {coupon.code}
                      </span>
                      {!isUsed && (
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code, coupon.id)}
                          className="shrink-0 p-0.5 rounded text-[#737373] hover:text-[#303030] hover:bg-[#e5e5e5] transition-colors"
                          aria-label="Copy code"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                    {!isUsed && copiedId === coupon.id && (
                      <span className="text-xs text-[#16a34a] font-medium">
                        Copied!
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="custom-btn"
                    disabled={isUsed || applyingId === coupon.id}
                    aria-disabled={isUsed || applyingId === coupon.id}
                    onClick={() => {
                      if (!isUsed) handleApplyNow(coupon);
                    }}
                    style={
                      isUsed || applyingId === coupon.id
                        ? { opacity: 0.6, cursor: "not-allowed" }
                        : undefined
                    }
                  >
                    {applyingId === coupon.id ? "Applying…" : "Apply Now"}
                  </button>
                </div>
                {applyError?.id === coupon.id && (
                  <p className="text-xs text-red-600">{applyError.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
