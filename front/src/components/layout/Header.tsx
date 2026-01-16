'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, LogOut, Check, X, Info, AlertTriangle, Laptop, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ModeToggle } from "@/components/theme/mode-toggle";
import { mockAtivos, mockColaboradores, mockNotasFiscais } from '@/lib/data';

// Função auxiliar para capitalizar primeira letra
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Header() {
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{
        assets: typeof mockAtivos;
        employees: typeof mockColaboradores;
        invoices: typeof mockNotasFiscais;
    } | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close search on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults(null);
            setIsSearchOpen(false);
            return;
        }

        const lowerQuery = query.toLowerCase();

        const assets = mockAtivos.filter(a =>
            a.patrimonio.toLowerCase().includes(lowerQuery) ||
            a.modelo.toLowerCase().includes(lowerQuery)
        );

        const employees = mockColaboradores.filter(c =>
            c.nome.toLowerCase().includes(lowerQuery) ||
            c.chapa.toLowerCase().includes(lowerQuery)
        );

        const invoices = mockNotasFiscais.filter(n =>
            n.numero.toLowerCase().includes(lowerQuery) ||
            n.fornecedor.toLowerCase().includes(lowerQuery)
        );

        if (assets.length > 0 || employees.length > 0 || invoices.length > 0) {
            setSearchResults({ assets, employees, invoices });
            setIsSearchOpen(true);
        } else {
            setSearchResults(null);
            setIsSearchOpen(true); // Show "No results"
        }
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsSearchOpen(false);
        setSearchQuery('');
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check className="h-4 w-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'error': return <X className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

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
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar (Ativos, Funcionários, Notas)..."
                        className="w-full bg-muted/50 border-none rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                    />
                </div>

                {isSearchOpen && (
                    <Card className="absolute top-12 left-0 w-full shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            {!searchResults && searchQuery.length >= 2 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Nenhum resultado encontrado.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {searchResults?.assets.length! > 0 && (
                                        <div className="p-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Ativos</h4>
                                            {searchResults?.assets.map(asset => (
                                                <div
                                                    key={asset.id}
                                                    className="flex items-center gap-3 p-2 bg-muted/50 hover:bg-muted rounded-md cursor-pointer text-sm mb-1"
                                                    onClick={() => handleNavigate(`/assets`)} // Ideally /assets/${asset.id} but keeping it simple for now as requested plan didn't specify detail pages yet, assuming list for now or general page. Actually let's try to be helpful. The user wants search.
                                                >
                                                    <div className="bg-blue-100 p-1.5 rounded-md dark:bg-blue-900/30">
                                                        <Laptop className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{asset.modelo}</p>
                                                        <p className="text-xs text-muted-foreground">{asset.patrimonio}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults?.employees.length! > 0 && (
                                        <div className="p-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Funcionários</h4>
                                            {searchResults?.employees.map(emp => (
                                                <div
                                                    key={emp.id}
                                                    className="flex items-center gap-3 p-2 bg-muted/50 hover:bg-muted rounded-md cursor-pointer text-sm mb-1"
                                                    onClick={() => handleNavigate(`/employees`)}
                                                >
                                                    <div className="bg-emerald-100 p-1.5 rounded-md dark:bg-emerald-900/30">
                                                        <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{emp.nome}</p>
                                                        <p className="text-xs text-muted-foreground">{emp.chapa}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults?.invoices.length! > 0 && (
                                        <div className="p-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Notas Fiscais</h4>
                                            {searchResults?.invoices.map(nf => (
                                                <div
                                                    key={nf.id}
                                                    className="flex items-center gap-3 p-2 bg-muted/50 hover:bg-muted rounded-md cursor-pointer text-sm mb-1"
                                                    onClick={() => handleNavigate(`/invoices`)}
                                                >
                                                    <div className="bg-amber-100 p-1.5 rounded-md dark:bg-amber-900/30">
                                                        <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{nf.fornecedor}</p>
                                                        <p className="text-xs text-muted-foreground">NF: {nf.numero}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex items-center gap-4 ml-4">
                <div className="flex flex-col items-end justify-center px-3 gap-0.5 mt-0.5 min-w-[140px]">
                    {mounted ? (
                        <>
                            <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{formattedDate}</span>
                            <span className="text-xs font-semibold text-muted-foreground">{formattedTime}</span>
                        </>
                    ) : (
                        <div className="h-8 w-32 bg-muted/20 animate-pulse rounded"></div>
                    )}
                </div>

                <ModeToggle />

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="icon" className="rounded-full" title="Sair">
                            <LogOut size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
