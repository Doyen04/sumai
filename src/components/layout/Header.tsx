import { Search, User, Bell } from 'lucide-react';
import { cn } from '@/utils';
import { Button, Input } from '@/components/ui';

interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    return (
        <header
            className={cn(
                'h-16 bg-white border-b border-border',
                'flex items-center justify-between px-6',
                className
            )}
        >
            {/* Search */}
            <div className="flex-1 max-w-md">
                <Input
                    placeholder="Search documents..."
                    leftElement={<Search className="w-4 h-4" />}
                    className="bg-surface border-transparent hover:border-border focus:border-accent"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                </Button>

                <div className="w-px h-6 bg-border mx-2" />

                <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-muted" />
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">Account</span>
                </Button>
            </div>
        </header>
    );
}
