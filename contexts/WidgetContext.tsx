"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export function isEmbeddedWidget(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window as unknown as { __FAVLOYALTY_EMBEDDED__?: boolean })
      .__FAVLOYALTY_EMBEDDED__ === true
  );
}

interface WidgetContextType {
  isOpen: boolean;
  toggleWidget: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <WidgetContext.Provider value={{ isOpen, toggleWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
}
