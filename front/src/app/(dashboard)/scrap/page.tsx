'use client';

// --- Importações ---
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, Recycle, Check, X, AlertTriangle,
    Eye, Edit, Settings2, Trash2
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
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableFilter } from '@/components/ui/data-table-filter';
import { SortIcon } from '@/components/ui/sort-icon';
import { useNotifications } from '@/providers/notification-provider';

// Tipos
import { PecaSucata, Ativo } from '@/types';
import { api, ENDPOINTS } from '@/services/api';

export default function ScrapPage() {
    // --- Estado ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState({
        componente: true,
        status: true,
        origem: true,
        retirada: true,
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Estado dos Dados da API
    const [pecas, setPecas] = useState<PecaSucata[]>([]);
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [loading, setLoading] = useState(true);

    const { addNotification } = useNotifications();

    const scrapStatuses = [
        { label: 'Disponível', value: 'Disponivel' },
        { label: 'Utilizada', value: 'Utilizada' },
        { label: 'Reservado', value: 'Reservado' },
        { label: 'Descartada', value: 'Descartada' },
    ];

    // --- Efeitos ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pecasData, ativosData] = await Promise.all([
                    api.get(ENDPOINTS.SCRAP),
                    api.get(ENDPOINTS.ASSETS)
                ]);

                setPecas(pecasData.content ?? pecasData);
                setAtivos(ativosData.content ?? ativosData);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Auxiliares / Filtros ---

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta peça da sucata?')) return;

        try {
            await api.delete(`${ENDPOINTS.SCRAP}/${id}`);

            setPecas(prev => prev.filter(p => p.id !== id));
            addNotification({
                title: 'Sucesso',
                message: 'Peça excluída com sucesso.',
                type: 'success'
            });

        } catch (error) {
            console.error("Erro ao excluir:", error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível excluir a peça.',
                type: 'error'
            });
        }
    };

    const richParts = pecas.map(part => {
        const originAsset = ativos.find(a => a.id === part.id_ativo_origem);
        return { ...part, originAsset };
    }).filter(item => {
        const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serial?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);

        return matchesSearch && matchesStatus;
    });

    const sortedParts = [...richParts].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let valueA: any = '', valueB: any = '';

        switch (key) {
            case 'componente':
                valueA = a.nome; valueB = b.nome; break;
            case 'status':
                valueA = a.status; valueB = b.status; break;
            case 'origem':
                valueA = a.originAsset?.patrimonio || ''; valueB = b.originAsset?.patrimonio || ''; break;
            case 'retirada':
                valueA = new Date(a.data_retirada).getTime();
                valueB = new Date(b.data_retirada).getTime();
                break;
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
                    <h1 className="text-2xl font-bold tracking-tight">Sucata & Peças</h1>
                    <p className="text-sm text-muted-foreground">Gerencie peças recuperadas de equipamentos descartados.</p>
                </div>
                <Link href="/scrap/new" className='no-underline'>
                    <Button>
                        <Recycle className="mr-2 h-4 w-4" />
                        Registrar Descartes
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Peças em Estoque</CardTitle>
                            <CardDescription>
                                Total de {pecas.length} peças registradas na sucata.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar peça ou serial..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DataTableFilter
                                title="Status"
                                options={scrapStatuses}
                                selectedValues={selectedStatuses}
                                onSelect={setSelectedStatuses}
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
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, componente: !prev.componente }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.componente} readOnly />
                                            <span>Componente</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, status: !prev.status }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.status} readOnly />
                                            <span>Status</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, origem: !prev.origem }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.origem} readOnly />
                                            <span>Origem</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, retirada: !prev.retirada }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.retirada} readOnly />
                                            <span>Retirada</span>
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
                                    {visibleColumns.componente && (
                                        <TableHead>
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('componente')}
                                            >
                                                Componente
                                                <SortIcon column="componente" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.status && (
                                        <TableHead className="w-[120px]">
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('status')}
                                            >
                                                Status
                                                <SortIcon column="status" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.origem && (
                                        <TableHead>
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('origem')}
                                            >
                                                Origem
                                                <SortIcon column="origem" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.retirada && (
                                        <TableHead className="w-[120px]">
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('retirada')}
                                            >
                                                Retirada
                                                <SortIcon column="retirada" sortConfig={sortConfig} />
                                            </div>
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
                                        <TableCell colSpan={5} className="text-center h-24">
                                            Carregando peças...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedParts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            Nenhuma peça encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedParts.map((part) => (
                                        <TableRow key={part.id}>
                                            {visibleColumns.componente && (
                                                <TableCell className="font-medium text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span>{part.nome}</span>
                                                        <span className="text-xs text-muted-foreground font-mono">{part.serial}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.status && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <Badge className={`flex items-center gap-2 px-3 py-1 ${part.status === 'Disponivel' ? 'bg-green-500 hover:bg-green-600' :
                                                            part.status === 'Reservado' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                                                                'bg-red-500 hover:bg-red-600'
                                                            }`}>
                                                            {part.status === 'Disponivel' ? <Check className="h-4 w-4" /> :
                                                                part.status === 'Reservado' ? <AlertTriangle className="h-4 w-4" /> :
                                                                    <X className="h-4 w-4" />}
                                                            <span>{part.status}</span>
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.origem && (
                                                <TableCell className="text-center">
                                                    {part.originAsset ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-sm font-medium">{part.originAsset.patrimonio}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {part.originAsset.modelo}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-sm">Desconhecida</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {visibleColumns.retirada && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        {new Date(part.data_retirada).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center bg-muted/50">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/scrap/${part.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <span className="sr-only">Ver detalhes</span>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/scrap/${part.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <span className="sr-only">Editar</span>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(part.id)}
                                                    >
                                                        <span className="sr-only">Excluir</span>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
