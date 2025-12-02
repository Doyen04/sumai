import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useBreakpoint } from '@/hooks';

export function Layout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { isMobile } = useBreakpoint();

    // Auto-collapse sidebar on mobile
    const isCollapsed = isMobile || sidebarCollapsed;

    return (
        <div className="min-h-screen bg-surface">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <div
                className={cn(
                    'transition-all duration-300',
                    isCollapsed ? 'ml-16' : 'ml-60'
                )}
            >
                <Header />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
