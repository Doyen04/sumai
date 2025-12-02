import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';

export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const trigger = triggerRef.current.getBoundingClientRect();
        const tooltip = tooltipRef.current.getBoundingClientRect();
        const gap = 8;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = trigger.top - tooltip.height - gap;
                left = trigger.left + (trigger.width - tooltip.width) / 2;
                break;
            case 'bottom':
                top = trigger.bottom + gap;
                left = trigger.left + (trigger.width - tooltip.width) / 2;
                break;
            case 'left':
                top = trigger.top + (trigger.height - tooltip.height) / 2;
                left = trigger.left - tooltip.width - gap;
                break;
            case 'right':
                top = trigger.top + (trigger.height - tooltip.height) / 2;
                left = trigger.right + gap;
                break;
        }

        // Keep tooltip within viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - tooltip.height - 8));

        setCoords({ top, left });
    }, [position]);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
        }
    }, [isVisible, calculatePosition]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const positionClasses = {
        top: 'animate-in fade-in-0 slide-in-from-bottom-1',
        bottom: 'animate-in fade-in-0 slide-in-from-top-1',
        left: 'animate-in fade-in-0 slide-in-from-right-1',
        right: 'animate-in fade-in-0 slide-in-from-left-1',
    };

    return (
        <>
            {/* Clone children with ref and event handlers */}
            <span
                ref={triggerRef as React.RefObject<HTMLSpanElement>}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                className="inline-flex"
            >
                {children}
            </span>

            {/* Tooltip */}
            {isVisible &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        role="tooltip"
                        className={cn(
                            'fixed z-50 px-3 py-1.5',
                            'text-xs text-white bg-foreground rounded-md',
                            'shadow-lg pointer-events-none',
                            'duration-150',
                            positionClasses[position]
                        )}
                        style={{
                            top: coords.top,
                            left: coords.left,
                        }}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    );
}
