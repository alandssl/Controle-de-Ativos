'use client';

import Link from 'next/link';
import { LogOut, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ModeToggle } from "@/components/theme/mode-toggle";

// Função auxiliar para capitalizar primeira letra
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Header() {

    // Date/Time State
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = capitalize(currentDateTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    const formattedTime = currentDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <header className="h-16 border-b bg-background/60 backdrop-blur sticky top-0 z-20 px-6 flex items-center justify-between">
            {/* Left Section: Date & Time */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                    {mounted ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-1.5">
                                <Calendar size={16} className="text-primary" />
                                <span className="text-sm font-medium text-foreground/80 capitalize">{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5">
                                <Clock size={16} className="text-primary" />
                                <span className="text-sm font-mono font-medium text-foreground/80">{formattedTime}</span>
                            </div>
                        </>
                    ) : (
                        <div className="h-9 w-64 bg-muted/20 animate-pulse rounded"></div>
                    )}
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
                <ModeToggle />
                <Link href="/login">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Sair">
                        <LogOut size={20} />
                    </Button>
                </Link>
            </div>
        </header>
    );
}
