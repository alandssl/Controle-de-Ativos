'use client';

// --- Importações ---
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, Receipt, Plus, FileText,
    Eye, Settings2, Download
} from 'lucide-react';

// Componentes de UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui/table';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableFilter } from '@/components/ui/data-table-filter';
import { SortIcon } from '@/components/ui/sort-icon';
import { useNotifications } from '@/providers/notification-provider';

// Tipos e Serviços
import { NotaFiscal } from '@/types';
import { api, ENDPOINTS } from '@/services/api';

export default function InvoicesPage() {
    // --- Estado ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState({
        numero: true,
        garantia: true,
        fornecedor: true,
        data: true,
        valor: true,
        arquivo: true,
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Estado dos Dados da API
    const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
    const [loading, setLoading] = useState(true);

    const { addNotification } = useNotifications();

    // --- Efeitos ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get(ENDPOINTS.INVOICES);
                setNotasFiscais(data.content ?? data);
            } catch (error) {
                console.error("Erro ao buscar notas fiscais:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Auxiliares / Filtros ---



    // Extrair fornecedores únicos para opções de filtro
    const suppliers = Array.from(new Set(notasFiscais.map(nf => nf.fornecedorNome)))
        .map(supplier => ({ label: supplier, value: supplier }));

    const filteredNFs = notasFiscais.filter(nf => {
        const matchesSearch = nf.numero.includes(searchTerm) ||
            nf.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(nf.fornecedorNome);

        return matchesSearch && matchesSupplier;
    });

    const sortedNFs = [...filteredNFs].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let valueA: any = '', valueB: any = '';

        switch (key) {
            case 'numero':
                valueA = a.numero; valueB = b.numero; break;
            case 'garantia':
                valueA = a.garantia ? 1 : 0; valueB = b.garantia ? 1 : 0; break;
            case 'fornecedor':
                valueA = a.fornecedorNome; valueB = b.fornecedorNome; break;
            case 'data':
                valueA = new Date(a.dataEmissao).getTime();
                valueB = new Date(b.dataEmissao).getTime();
                break;
            case 'valor':
                valueA = a.valorTotal; valueB = b.valorTotal; break;
            default:
                return 0;
        }

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // --- Renderização ---
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notas Fiscais</h1>
                    <p className="text-sm text-muted-foreground">Gerencie as NFs e associe ativos às compras.</p>
                </div>
                <Link href="/invoices/new" className='no-underline'>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Nota Fiscal
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>NFs Cadastradas</CardTitle>
                            <CardDescription>
                                Total de {notasFiscais.length} notas fiscais emitidas.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número ou fornecedor..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DataTableFilter
                                title="Fornecedor"
                                options={suppliers}
                                selectedValues={selectedSuppliers}
                                onSelect={setSelectedSuppliers}
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" title="Colunas">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Colunas</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, numero: !prev.numero }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.numero} readOnly />
                                            <span>Número</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, garantia: !prev.garantia }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.garantia} readOnly />
                                            <span>Garantia</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, fornecedor: !prev.fornecedor }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.fornecedor} readOnly />
                                            <span>Fornecedor</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, data: !prev.data }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.data} readOnly />
                                            <span>Data Emissão</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, valor: !prev.valor }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.valor} readOnly />
                                            <span>Valor Total</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, arquivo: !prev.arquivo }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.arquivo} readOnly />
                                            <span>Arquivo</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {visibleColumns.numero && (
                                        <TableHead className="w-[150px]">
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('numero')}
                                            >
                                                Número
                                                <SortIcon column="numero" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.garantia && (
                                        <TableHead className="w-[100px]">
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('garantia')}
                                            >
                                                Garantia
                                                <SortIcon column="garantia" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.fornecedor && (
                                        <TableHead>
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('fornecedor')}
                                            >
                                                Fornecedor
                                                <SortIcon column="fornecedor" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.data && (
                                        <TableHead className="w-[120px]">
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('data')}
                                            >
                                                Data Emissão
                                                <SortIcon column="data" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.valor && (
                                        <TableHead className="w-[140px]">
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('valor')}
                                            >
                                                Valor Total
                                                <SortIcon column="valor" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.arquivo && (
                                        <TableHead className="w-[100px]">
                                            <div className="flex justify-center">Arquivo</div>
                                        </TableHead>
                                    )}
                                    <TableHead className="w-[100px]">
                                        <div className="flex justify-center">Ações</div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            Carregando notas fiscais...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedNFs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            Nenhuma nota fiscal encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedNFs.map((nf) => (
                                        <TableRow key={nf.id}>
                                            {visibleColumns.numero && (
                                                <TableCell className="font-medium text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Receipt className="h-4 w-4 text-muted-foreground" />
                                                        {nf.numero}
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.garantia && (
                                                <TableCell className="text-center">
                                                    {nf.garantia ? (
                                                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                            Sim
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {visibleColumns.fornecedor && (
                                                <TableCell className="text-center">{nf.fornecedorNome}</TableCell>
                                            )}
                                            {visibleColumns.data && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        {new Date(nf.dataEmissao).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.valor && (
                                                <TableCell className="text-center">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nf.valorTotal)}
                                                </TableCell>
                                            )}
                                            {visibleColumns.arquivo && (
                                                <TableCell className="text-center bg-muted/50">
                                                    <div className="flex justify-center">
                                                        <Link href={`http://localhost:8080/api/notas-fiscais/arquivo/${nf.id}`} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" title={`Baixar ${nf.id}`}>
                                                                <FileText className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center bg-muted/50">
                                                <div className="flex justify-center gap-1">
                                                    <Link href={`/invoices/${nf.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Itens">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
