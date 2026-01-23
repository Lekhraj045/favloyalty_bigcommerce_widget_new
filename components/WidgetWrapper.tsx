"use client";

import React from 'react';
import WidgetContainer from './WidgetContainer';
import LauncherButton from './LauncherButton';
import { useWidget } from '@/contexts/WidgetContext';

interface WidgetWrapperProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function WidgetWrapper({ children, header }: WidgetWrapperProps) {
    const { isOpen, toggleWidget } = useWidget();

    return (
        <>
            <WidgetContainer isOpen={isOpen} toggleWidget={toggleWidget} header={header}>
                {children}
            </WidgetContainer>

            <LauncherButton toggleWidget={toggleWidget} />
        </>
    );
}
