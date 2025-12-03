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
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return null;

        const trigger = triggerRef.current.getBoundingClientRect();
        const gap = 8;

        // Estimate tooltip size (will be adjusted after render)
        const estimatedWidth = 150;
        const estimatedHeight = 30;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = trigger.top - estimatedHeight - gap + window.scrollY;
                left = trigger.left + (trigger.width / 2) - (estimatedWidth / 2) + window.scrollX;
                break;
            case 'bottom':
                top = trigger.bottom + gap + window.scrollY;
                left = trigger.left + (trigger.width / 2) - (estimatedWidth / 2) + window.scrollX;
                break;
            case 'left':
                top = trigger.top + (trigger.height / 2) - (estimatedHeight / 2) + window.scrollY;
                left = trigger.left - estimatedWidth - gap + window.scrollX;
                break;
            case 'right':
                top = trigger.top + (trigger.height / 2) - (estimatedHeight / 2) + window.scrollY;
                left = trigger.right + gap + window.scrollX;
                break;
        }

        return { top, left };
    }, [position]);

    const updatePosition = useCallback(() => {
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
            const initialCoords = calculatePosition();
            if (initialCoords) {
                setCoords(initialCoords);
            }
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
        setCoords(null);
    };

    // Update position after tooltip is rendered to get accurate dimensions
    useEffect(() => {
        if (isVisible && tooltipRef.current) {
            // Small delay to ensure the tooltip is rendered
            requestAnimationFrame(() => {
                updatePosition();
            });
        }
    }, [isVisible, updatePosition]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!content) return <>{children}</>;

    return (
        <>
            {/* Clone children with ref and event handlers */}
            <span
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                className="inline-flex"
            >
                {children}
            </span>

            {/* Tooltip */}
            {isVisible && coords &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        role="tooltip"
                        className={cn(
                            'fixed z-9999 px-3 py-1.5',
                            'text-xs rounded-md',
                            'shadow-lg pointer-events-none',
                            'bg-foreground text-background',
                            'transition-opacity duration-150',
                            'opacity-100'
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
