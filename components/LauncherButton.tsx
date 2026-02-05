"use client";

import { useWidgetTheme } from "@/contexts/WidgetThemeContext";

export default function LauncherButton({ toggleWidget }: { toggleWidget: () => void }) {
  const theme = useWidgetTheme();
  return (
        <>
            {/* Launcher Button - Icon Only */}
            <div className="fixed bottom-4 right-4">
                <div
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: theme.iconColor }}
                    onClick={toggleWidget}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M12 8v13" />
                        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                </div>
            </div>
        </>
    )
}