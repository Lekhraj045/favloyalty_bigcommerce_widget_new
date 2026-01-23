"use client";

import React from 'react';

interface WidgetContainerProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    isOpen: boolean;
    toggleWidget: () => void;
}

export default function WidgetContainer({ children, header, isOpen, toggleWidget }: WidgetContainerProps) {
    if (!isOpen) return null;

    return (
        <div>
            <div className="w-[390px] right-4 fixed h-[calc(100vh-120px)] bottom-[calc(100px)] max-h-[586px] rounded-2xl border border-[#DEDEDE] bg-white shadow-sm overflow-hidden widget-container">
                {header ? (
                    <div className="relative">
                        {header}
                        <button
                            className="absolute right-4 top-4 text-white text-medium cursor-pointer z-10"
                            onClick={toggleWidget}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6L6 18" />
                                <path d="M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : null}
                {children}
            </div>
        </div>
    );
}
