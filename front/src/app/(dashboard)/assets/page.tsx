'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Plus, Search, FileDown, Check, X,
    AlertTriangle, Eye, Edit, Settings2
} from 'lucide-react';
import { useNotifications } from '@/providers/notification-provider';

// Componentes de UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

// Serviços & Tipos
import { api, ENDPOINTS } from '@/services/api';
import { Ativo, Movimentacao, Colaborador } from '@/types';

export default function AssetsPage() {
    // --- Estado ---
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState({
        patrimonio: true,
        modelo: true,
        responsavel: true,
        ultimaMov: true,
        status: true,
    });
    const [sortConfig, setSortConfig] =
        useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Estado dos Dados da API
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [loading, setLoading] = useState(true);

    const assetStatuses = [
        { label: 'Novo', value: 'Novo' },
        { label: 'Em Uso', value: 'Em Uso' },
        { label: 'Em Manutenção', value: 'Em Manutenção' },
        { label: 'Disponível', value: 'Disponível' },
        { label: 'Sucata', value: 'Sucata' },
        { label: 'Aguardando', value: 'Aguardando' }
    ];

    // --- Efeitos ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Buscar Ativos
                try {
                    const ativosData = await api.get(ENDPOINTS.ASSETS);
                    setAtivos(Array.isArray(ativosData) ? ativosData : (ativosData.content ?? []));
                } catch (e) {
                    console.error('Erro ao buscar ativos:', e);
                }

                // 2. Buscar Movimentações
                try {
                    const movData = await api.get(ENDPOINTS.MOVEMENTS);
                    setMovimentacoes(Array.isArray(movData) ? movData : (movData.content ?? []));
                } catch (e) {
                    console.error('Erro ao buscar movimentos:', e);
                }

                // 3. Buscar Colaboradores
                try {
                    const colabData = await api.get(ENDPOINTS.EMPLOYEES);
                    setColaboradores(Array.isArray(colabData) ? colabData : (colabData.content ?? []));
                } catch (e) {
                    console.error('Erro ao buscar colaboradores:', e);
                }

            } catch (error) {
                console.error('Erro crítico no fetchData:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Auxiliares / Filtros ---

    const richAssets = ativos.map(asset => {
        const assetMovements = movimentacoes.filter(
            m => m.idEquipamento?.id === asset.id
        );

        assetMovements.sort(
            (a, b) =>
                new Date(b.dataMovimento).getTime() -
                new Date(a.dataMovimento).getTime()
        );

        const lastMovement = assetMovements[0];
        let holderName = '-';
        let lastMoveDate = '-';

        if (lastMovement) {
            lastMoveDate = new Date(
                lastMovement.dataMovimento
            ).toLocaleDateString();

            // Inferir tipo pela observação, já que idTipo está ausente
            const isSaida = !lastMovement.observacao?.toLowerCase().includes('entrada');

            if (isSaida && lastMovement.idColaborador?.id) {
                const holder = colaboradores.find(
                    c => c.id === lastMovement.idColaborador?.id
                );
                holderName = holder ? holder.nome : 'Desconhecido';
            } else {
                holderName = 'Estoque';
            }
        }

        return { ...asset, holderName, lastMoveDate };
    }).filter(asset => {
        const matchesSearch =
            asset.patrimonio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.holderName?.toLowerCase().includes(searchTerm.toLowerCase());

        const statusDesc = asset.status?.descricao || asset.status_desc;
        const matchesStatus = statusFilter
            ? statusDesc === statusFilter
            : true;

        const matchesSelectedStatus =
            selectedStatuses.length === 0 ||
            selectedStatuses.includes(statusDesc || '');

        return matchesSearch && matchesStatus && matchesSelectedStatus;
    });

    const sortedAssets = [...richAssets].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let valueA: any = '';
        let valueB: any = '';

        switch (key) {
            case 'patrimonio':
                valueA = a.patrimonio;
                valueB = b.patrimonio;
                break;
            case 'modelo':
                valueA = a.modelo;
                valueB = b.modelo;
                break;
            case 'responsavel':
                valueA = a.holderName;
                valueB = b.holderName;
                break;
            case 'ultimaMov':
                const parseDate = (d: string) => {
                    if (d === '-') return 0;
                    const [day, month, year] = d.split('/').map(Number);
                    return new Date(year, month - 1, day).getTime();
                };
                valueA = parseDate(a.lastMoveDate);
                valueB = parseDate(b.lastMoveDate);
                break;
            case 'status':
                valueA = a.status_desc;
                valueB = b.status_desc;
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

    const { addNotification } = useNotifications();



    // --- Renderização ---
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ativos de TI</h1>
                    <p className="text-sm text-muted-foreground">Gerencie todo o inventário de equipamentos.</p>
                </div>
                <div className="flex items-center gap-2">

                    <Link href="/assets/new" className='no-underline'>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Ativo
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Inventário</CardTitle>
                            <CardDescription>
                                Total de {ativos.length} ativos cadastrados.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por tag, modelo ou responsável..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <DataTableFilter
                                title="Status"
                                options={assetStatuses}
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
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, patrimonio: !prev.patrimonio }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.patrimonio} readOnly />
                                            <span>Patrimônio</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, modelo: !prev.modelo }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.modelo} readOnly />
                                            <span>Modelo</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, responsavel: !prev.responsavel }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.responsavel} readOnly />
                                            <span>Responsável</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, ultimaMov: !prev.ultimaMov }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.ultimaMov} readOnly />
                                            <span>Última Mov.</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, status: !prev.status }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.status} readOnly />
                                            <span>Status</span>
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
                                    {visibleColumns.patrimonio && (
                                        <TableHead className="">
                                            <div
                                                className="flex w-full justify-center items-center text-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('patrimonio')}
                                            >
                                                Patrimônio
                                                <SortIcon column="patrimonio" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.modelo && (
                                        <TableHead className="">
                                            <div
                                                className="flex w-full justify-center items-center text-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('modelo')}
                                            >
                                                Modelo
                                                <SortIcon column="modelo" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.responsavel && (
                                        <TableHead className="">
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('responsavel')}
                                            >
                                                Responsável
                                                <SortIcon column="responsavel" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.ultimaMov && (
                                        <TableHead className=" w-[120px]">
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('ultimaMov')}
                                            >
                                                Última Mov.
                                                <SortIcon column="ultimaMov" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.status && (
                                        <TableHead className=" w-[120px]">
                                            <div
                                                className="flex w-full justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('status')}
                                            >
                                                Status
                                                <SortIcon column="status" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    <TableHead className="text-right w-[100px]">
                                        <div className="flex w-full justify-center">Ações</div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            Carregando dados...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedAssets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            Nenhum ativo encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedAssets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            {visibleColumns.patrimonio && (
                                                <TableCell className="font-medium text-center">{asset.patrimonio}</TableCell>
                                            )}
                                            {visibleColumns.modelo && (
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span>{asset.modelo}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {asset.quantidadeRam ? `${asset.quantidadeRam}GB ${asset.tipoRam || ''}` : ''}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.responsavel && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <span className={`font-medium ${asset.holderName === 'Estoque' ? 'text-muted-foreground italic' : ''}`}>
                                                            {asset.holderName}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.ultimaMov && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center items-center">
                                                        {asset.lastMoveDate !== '-' ? asset.lastMoveDate : '-'}
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.status && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <Badge className={`flex items-center gap-2 px-3 py-1 ${['Em Uso', 'Disponível', 'Novo'].includes(asset.status?.descricao || asset.status_desc || '') ? 'bg-green-500 hover:bg-green-600' :
                                                            ['Em Manutenção', 'Aguardando', 'Manutenção'].includes(asset.status?.descricao || asset.status_desc || '') ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                                                                'bg-red-500 hover:bg-red-600'
                                                            }`}>
                                                            {['Em Uso', 'Disponível', 'Novo'].includes(asset.status?.descricao || asset.status_desc || '') ? <Check className="h-4 w-4" /> :
                                                                ['Em Manutenção', 'Aguardando', 'Manutenção'].includes(asset.status?.descricao || asset.status_desc || '') ? <AlertTriangle className="h-4 w-4" /> :
                                                                    <X className="h-4 w-4" />}
                                                            <span>{asset.status?.descricao || asset.status_desc || 'S/ Status'}</span>
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center bg-muted/50">
                                                <div className="flex justify-center gap-1">
                                                    <Link href={`/assets/${asset.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Detalhes">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/assets/${asset.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Editar">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {/* Botão de Excluir Removido */}
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
        </div >
    );
}
