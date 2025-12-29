"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        switch (position) {
          case "top":
            top = triggerRect.top + scrollY - tooltipRect.height - 8;
            left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
            break;
          case "bottom":
            top = triggerRect.bottom + scrollY + 8;
            left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
            break;
          case "left":
            top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
            left = triggerRect.left + scrollX - tooltipRect.width - 8;
            break;
          case "right":
            top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
            left = triggerRect.right + scrollX + 8;
            break;
        }

        // Keep tooltip within viewport
        const padding = 8;
        if (top < scrollY + padding) top = scrollY + padding;
        if (left < scrollX + padding) left = scrollX + padding;
        if (left + tooltipRect.width > scrollX + window.innerWidth - padding) {
          left = scrollX + window.innerWidth - tooltipRect.width - padding;
        }

        setTooltipPosition({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-slate-900 rounded-lg shadow-lg pointer-events-none max-w-xs"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-slate-900 transform rotate-45 ${
              position === "top"
                ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                : position === "bottom"
                ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : position === "left"
                ? "right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
                : "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
            }`}
          />
        </div>
      )}
    </>
  );
}

