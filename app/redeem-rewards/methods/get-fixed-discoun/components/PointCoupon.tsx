"use client";

import { Copy } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const COUPON_CODE = 'INR1OFF';

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
        // Clipboard API blocked (e.g. in iframe) — use fallback
    }
    if (fallbackCopyText(text)) onSuccess();
}

export default function PointCoupon() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        copyToClipboard(COUPON_CODE, () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <>
            <div className="card flex flex-col gap-4">
                <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start">
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-[#303030] leading-tight">INR1 off Coupon</h3>
                            <p className="text-xs text-[#616161] mt-0.5">FOR YOUR NEXT ORDER</p>
                        </div>
                    </div>
                </div>
                <div className="border-t border-dashed border-[#d4d4d4]"></div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-3 py-2 flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[#303030] truncate">
                                {COUPON_CODE}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="shrink-0 p-0.5 rounded text-[#737373] hover:text-[#303030] hover:bg-[#e5e5e5] transition-colors"
                                aria-label="Copy code"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        {copied && (
                            <span className="text-xs text-[#16a34a] font-medium">
                                Copied!
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="custom-btn"
                    >
                        Apply To Cart
                    </button>
                </div>
            </div>

            <div className='card'>
                <h3 className='text-sm font-medium text-[#303030]'>Please be ensured that:
                </h3>

                <div className='flex flex-col gap-1.5 mt-2'>
                    <p className='text-xs text-[#616161]'>
                        The discount code expires in 3 days.
                    </p>
                </div>
            </div>
        </>
    );
}