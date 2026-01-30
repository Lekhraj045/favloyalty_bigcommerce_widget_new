"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

type AppliedProduct = {
  image: string;
  name: string;
  url: string;
};

type CouponItem = {
  id: number;
  offer: string;
  expires: string;
  code: string;
  image: string;
  // Admin can set these on any coupon from store
  minimumPurchaseRequired?: string;
  productImage?: string;
  productName?: string;
  productUrl?: string;
  appliesToProducts?: AppliedProduct[]; // accordion "Applies to X selected product(s)"
};

const coupons: CouponItem[] = [
  {
    id: 1,
    offer: '50% off',
    expires: 'Expires: Never',
    code: 'JYXXPP14AW',
    image: `${basePath}/images/get-fixed-discount.svg`,
    appliesToProducts: [
      {
        image: `${basePath}/images/product2.jpg`,
        name: 'The Inventory Not Tracked Snowboard - Default Title',
        url: '#',
      },
      {
        image: `${basePath}/images/product1.jpg`,
        name: 'The 3p Fulfilled Snowboard - Default Title',
        url: '#',
      },
      {
        image: `${basePath}/images/product2.jpg`,
        name: 'The Collection Snowboard: Hydrogen',
        url: '#',
      },
    ],
  },
  {
    id: 2,
    offer: '$20 OFF',
    expires: '18th September 2026',
    code: 'TECH20SAVE',
    image: `${basePath}/images/flat-discount.svg`,
  },
  {
    id: 3,
    offer: 'Free Shipping',
    expires: 'Expires: Never',
    code: 'GOURMETFREE',
    image: `${basePath}/images/free-shipping.svg`,
    minimumPurchaseRequired: 'INR 0.1',
  },
  {
    id: 4,
    offer: 'Free Product',
    expires: '9th February 2026',
    code: '1BI6IQ9LDI',
    image: `${basePath}/images/free-product.svg`,
    productImage: `${basePath}/images/product1.jpg`,
    productName: 'The 3p Fulfilled Snowboard - Default Title',
    productUrl: '#',
  },
  // Same types, no restrictions (admin has not set any on these)
  {
    id: 5,
    offer: 'Free Shipping',
    expires: 'Expires: Never',
    code: 'FREESHIPNO',
    image: `${basePath}/images/free-shipping.svg`,
  },
  {
    id: 6,
    offer: 'Free Product',
    expires: 'Expires: Never',
    code: 'FREEPRODNO',
    image: `${basePath}/images/free-product.svg`,
  },
  {
    id: 7,
    offer: '50% off',
    expires: 'Expires: Never',
    code: 'FIXED50NO',
    image: `${basePath}/images/get-fixed-discount.svg`,
  },
];

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

async function copyToClipboard(text: string, onSuccess: () => void): Promise<void> {
  if (typeof window === 'undefined') return;
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
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedAccordionId, setExpandedAccordionId] = useState<number | null>(1);

  const handleCopy = (code: string, id: number) => {
    copyToClipboard(code, () => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="p-4 h-[calc(100vh-130px)] overflow-y-auto custom-scroller">
      <div className="flex flex-col gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`card flex flex-col gap-4`}
          >
            {/* Top section: image, offer, description, ACTIVE badge */}
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center overflow-hidden bg-linear-to-br from-green-50 to-emerald-50 `}
                >
                  <Image
                    src={coupon.image}
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
              <span className="shrink-0 text-xs text-[#16a34a] bg-[#dcfce7] px-2.5 py-1 rounded-full">
                Available
              </span>
            </div>

            {/* Accordion "Applies to X selected product(s)" – show when admin has set products */}
            {coupon.appliesToProducts && coupon.appliesToProducts.length > 0 && (
              <div className="rounded-lg border border-[#93c5fd] bg-[#eff6ff]/50 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedAccordionId((prev) =>
                      prev === coupon.id ? null : coupon.id
                    )
                  }
                  className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#dbeafe]/50 transition-colors"
                >
                  <span className="text-[13px] font-medium text-[#303030]">
                    Applies to {coupon.appliesToProducts.length} selected product
                    {coupon.appliesToProducts.length !== 1 ? 's' : ''}
                  </span>
                  {expandedAccordionId === coupon.id ? (
                    <ChevronUp size={18} className="shrink-0 text-[#616161]" />
                  ) : (
                    <ChevronDown size={18} className="shrink-0 text-[#616161]" />
                  )}
                </button>
                {expandedAccordionId === coupon.id && (
                  <div className="border-t border-[#93c5fd] p-3 flex flex-col gap-2 custom-scroller max-h-[150px] overflow-y-auto">
                    {coupon.appliesToProducts.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white border border-[#e5e5e5]"
                      >
                        <div className="w-10 h-10 min-w-10 min-h-10 rounded-lg overflow-hidden bg-[#f5f5f5] shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[#303030] leading-snug truncate">
                            {product.name}
                          </p>
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-0.5 text-[13px] font-medium text-[#2563eb] hover:underline"
                          >
                            View
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Minimum Purchase Required – show when admin has set it on this coupon */}
            {coupon.minimumPurchaseRequired && (
              <div className="rounded-lg bg-[#f3e8ff] px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-[13px] font-normal text-[#303030]">
                  Minimum Purchase Required:
                </span>
                <span className="text-[13px] font-medium text-[#7c3aed]">
                  {coupon.minimumPurchaseRequired}
                </span>
              </div>
            )}

            {/* Product details – show when admin has set product on this coupon */}
            {(coupon.productImage ?? coupon.productName ?? coupon.productUrl) && (
              <div className="rounded-lg bg-[#fff7ed] border border-[#fed7aa]/50 p-3 flex items-start gap-3">
                {coupon.productImage && (
                  <div className="w-[56px] h-[56px] min-w-[56px] min-h-[56px] rounded-lg overflow-hidden bg-[#f5f5f5] shrink-0">
                    <Image
                      src={coupon.productImage}
                      alt={coupon.productName ?? 'Product'}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {coupon.productName && (
                    <p className="text-[13px] font-medium text-[#303030] leading-snug">
                      {coupon.productName}
                    </p>
                  )}
                  {coupon.productUrl && (
                    <a
                      href={coupon.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-[13px] font-medium text-[#ea580c] hover:underline"
                    >
                      View Product
                      <ExternalLink size={14} className="shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Dotted separator */}
            <div className="border-t border-dashed border-[#d4d4d4]" />

            {/* Bottom section: coupon code + Use Now */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-3 py-2 flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#303030] truncate">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(coupon.code, coupon.id)}
                    className="shrink-0 p-0.5 rounded text-[#737373] hover:text-[#303030] hover:bg-[#e5e5e5] transition-colors"
                    aria-label="Copy code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copiedId === coupon.id && (
                  <span className="text-xs text-[#16a34a] font-medium">
                    Copied!
                  </span>
                )}
              </div>
              <button
                type="button"
                className="custom-btn"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
