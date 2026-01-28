"use client";

import { isEmbeddedWidget, useWidget } from "@/contexts/WidgetContext";
import React from "react";
import LauncherButton from "./LauncherButton";
import WidgetContainer from "./WidgetContainer";

interface WidgetWrapperProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function WidgetWrapper({
  children,
  header,
}: WidgetWrapperProps) {
  const { isOpen, toggleWidget } = useWidget();
  const embedded = isEmbeddedWidget();

  return (
    <>
      {/* In iframe embed mode, always render content (outer loader controls visibility) */}
      <WidgetContainer
        isOpen={embedded ? true : isOpen}
        toggleWidget={toggleWidget}
        header={header}
      >
        {children}
      </WidgetContainer>

      {/* Prevent "widget inside widget": don't render inner launcher when embedded */}
      {!embedded && <LauncherButton toggleWidget={toggleWidget} />}
    </>
  );
}
