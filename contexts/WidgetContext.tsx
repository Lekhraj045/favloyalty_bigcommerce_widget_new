"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
        throw new Error('useWidget must be used within a WidgetProvider');
    }
    return context;
}
