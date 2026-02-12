'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Laptop, Users, FileText, ArrowLeftRight } from 'lucide-react';
import { usePermissions } from '@/providers/permissions-provider';

const menuGroups = [
    {
        title: 'Principal',
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard, key: 'dashboard' },
            { name: 'Ativos', href: '/assets', icon: Laptop, key: 'assets' },
            { name: 'Movimentações', href: '/movements', icon: ArrowLeftRight, key: 'movements' },
            { name: 'Funcionários', href: '/employees', icon: Users, key: 'employees' },
            { name: 'Notas Fiscais', href: '/invoices', icon: FileText, key: 'invoices' },

        ]
    },
    {
        title: 'Gerenciamento',
        items: [
            { name: 'Relatórios', href: '/reports', icon: FileText, key: 'reports', alwaysVisible: true }, // Assuming no permission key for now or default open
        ]
    },
    {
        title: 'Usuário',
        items: [
            { name: 'Configurações', href: '/settings', icon: Users, key: 'settings', alwaysVisible: true }, // Using Users icon as placeholder or Settings icon if available
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();
    const { permissions } = usePermissions();

    // Helper to check visibility
    const isVisible = (item: any) => {
        if (item.alwaysVisible) return true;
        return permissions[item.key as keyof typeof permissions];
    };

    return (
        <aside className="w-64 bg-card border-r flex flex-col h-screen sticky top-0 overflow-y-auto z-30 shadow-sm">
            <div className="h-16 flex items-center px-6 border-b shrink-0 bg-card z-10">
                <div className="flex items-center justify-center w-full">
                    <Link href="/">
                        <img src="/logo_tecal.png" alt="Logo Tecal" className="h-10 object-contain cursor-pointer" />
                    </Link>
                </div>
            </div>

            <div className="flex-1 py-6 px-3 space-y-6">
                <div className="flex-1 py-6 px-3 space-y-6">
                    {menuGroups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <p className="px-4 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">{group.title}</p>
                            <nav className="space-y-1">
                                {group.items.filter(isVisible).map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                                            flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 no-underline hover:no-underline group relative
                                            ${isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }
                                        `}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                            )}
                                            <span className={`flex items-center justify-center w-6 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                <Icon size={18} />
                                            </span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>


            </div>

            <div className="p-4 border-t mt-auto bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                        RA
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate text-foreground">Raphael Araujo</span>
                        <span className="text-xs text-muted-foreground truncate">Admin</span>
                        <span className="text-xs text-muted-foreground truncate">Setor: TI</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
