import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Settings,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';
import { Button, Switch } from '@/components/ui';
import { useTheme } from '@/contexts';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help', icon: HelpCircle },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-screen bg-background border-r border-border',
                'flex flex-col transition-all duration-300 z-40',
                isCollapsed ? 'w-16' : 'w-60'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
                        <img src="/sumai.svg" alt="SumAI Logo" className="w-6 h-6" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-semibold text-foreground">
                            SumAI
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-md',
                                            'text-sm font-medium transition-colors duration-150',
                                            'hover:bg-surface-hover',
                                            isActive
                                                ? 'bg-accent-light text-white'
                                                : 'text-muted hover:text-foreground'
                                        )
                                    }
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className="w-5 h-5 shrink-0" />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Dark Mode Toggle */}
            <div className={cn(
                'p-3 border-t border-border',
                isCollapsed ? 'flex justify-center' : ''
            )}>
                {isCollapsed ? (
                    <Switch
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        size="sm"
                    />
                ) : (
                    <Switch
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        label="Dark Mode"
                        size="sm"
                    />
                )}
            </div>

            {/* Collapse Button */}
            <div className="p-2 border-t border-border">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className={cn('w-full', isCollapsed ? 'justify-center' : 'justify-start')}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="ml-2">Collapse</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
