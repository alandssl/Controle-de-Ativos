'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search, Plus,
    Eye, Settings2, Paperclip, AlertTriangle
} from 'lucide-react';
import { useNotifications } from '@/providers/notification-provider';

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

import { Movimentacao, Ativo, Colaborador } from '@/types';
import { api, ENDPOINTS } from '@/services/api';

export default function MovementsPage() {
    const searchParams = useSearchParams();
    const assetIdFilter = searchParams.get('assetId');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState({
        tipo: true,
        data: true,
        ativo: true,
        colaborador: true,
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addNotification } = useNotifications();

    const movementTypes = [
        { label: 'Saída (Entrega)', value: 'Saida' },
        { label: 'Entrada (Devolução)', value: 'Entrada' },
        { label: 'Manutenção', value: 'Manutencao' },
        { label: 'Descarte', value: 'Descarte' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);

                const [movData, ativosData, colabData] = await Promise.all([
                    api.get(ENDPOINTS.MOVEMENTS),
                    api.get(ENDPOINTS.ASSETS),
                    api.get(ENDPOINTS.EMPLOYEES),
                ]);

                setMovimentacoes(movData.content ?? movData);
                setAtivos(ativosData.content ?? ativosData);
                setColaboradores(colabData.content ?? colabData);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    const richMovements = movimentacoes
        .map(mov => {
            const asset = ativos.find(a => a.id === mov.idEquipamento?.id);
            const employee = colaboradores.find(c => c.id === mov.idColaborador?.id);

            const isStock = !mov.idColaborador?.id;

            return {
                id: mov.id,
                data: mov.dataMovimento,
                id_ativo: mov.idEquipamento?.id,
                id_colaborador: mov.idColaborador?.id,
                // Lógica de Negócio: Sem colaborador = Recebimento (Volta pro Estoque); Com colaborador = Entrega (Saiu do Estoque)
                tipo_desc: mov.tipoMovimento || (isStock ? 'Entrada' : 'Saida'),
                asset,
                employee: isStock ? { nome: 'ESTOQUE TI', setor: '-' } as any : employee,
                anexo: mov.anexo,
            };
        })
        .filter(item => {
            const matchesSearch =
                (item.asset?.patrimonio?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.employee?.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            const matchesAssetFilter = assetIdFilter
                ? String(item.id_ativo) === assetIdFilter
                : true;

            const matchesType =
                selectedTypes.length === 0 || selectedTypes.includes(item.tipo_desc);

            return matchesSearch && matchesAssetFilter && matchesType;
        });

    const sortedMovements = [...richMovements].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let valueA: any = '';
        let valueB: any = '';

        switch (key) {
            case 'tipo':
                valueA = a.tipo_desc;
                valueB = b.tipo_desc;
                break;
            case 'data':
                valueA = new Date(a.data).getTime();
                valueB = new Date(b.data).getTime();
                break;
            case 'ativo':
                valueA = a.asset?.patrimonio || '';
                valueB = b.asset?.patrimonio || '';
                break;
            case 'colaborador':
                valueA = a.employee?.nome || '';
                valueB = b.employee?.nome || '';
                break;
        }

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        setSortConfig(current =>
            current?.key === key
                ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                : { key, direction: 'asc' }
        );
    };

    // --- Renderização ---
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
                    <p className="text-sm text-muted-foreground">Histórico de entregas e devoluções de equipamentos.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/movements/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Movimento
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Histórico</CardTitle>
                            <CardDescription>
                                Total de {movimentacoes.length} movimentações registradas.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por tag ou funcionário..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DataTableFilter
                                title="Tipo"
                                options={movementTypes}
                                selectedValues={selectedTypes}
                                onSelect={setSelectedTypes}
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" title="Colunas">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" >
                                    <DropdownMenuLabel>Colunas</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, tipo: !prev.tipo }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.tipo} readOnly />
                                            <span>Tipo</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, data: !prev.data }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.data} readOnly />
                                            <span>Data</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, ativo: !prev.ativo }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.ativo} readOnly />
                                            <span>Ativo</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, colaborador: !prev.colaborador }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.colaborador} readOnly />
                                            <span>Colaborador</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                {error && (
                    <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                        <div className="text-red-800 text-sm">
                            <strong>Erro ao carregar dados:</strong> {error}
                        </div>
                        <div className="text-red-600 text-xs mt-1">
                            Verifique se a API Java está rodando em http://localhost:8080 e se as rotas estão corretas.
                        </div>
                    </div>
                )}
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {visibleColumns.tipo && (
                                        <TableHead className="w-[120px]">
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('tipo')}
                                            >
                                                Tipo
                                                <SortIcon column="tipo" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.data && (
                                        <TableHead className="w-[160px]">
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('data')}
                                            >
                                                Data
                                                <SortIcon column="data" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.ativo && (
                                        <TableHead>
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('ativo')}
                                            >
                                                Ativo
                                                <SortIcon column="ativo" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.colaborador && (
                                        <TableHead>
                                            <div
                                                className="flex justify-center items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('colaborador')}
                                            >
                                                Colaborador
                                                <SortIcon column="colaborador" sortConfig={sortConfig} />
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
                                            Carregando histórico...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedMovements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            Nenhuma movimentação encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedMovements.map((item) => (
                                        <TableRow
                                            key={item.id}
                                        >
                                            {visibleColumns.tipo && (
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        {item.tipo_desc === 'Saida' && !item.anexo && (
                                                            <div className="h-4 w-4" />
                                                        )}
                                                        <Badge
                                                            variant={item.tipo_desc === 'Saida' ? 'default' : 'secondary'}
                                                            className="px-3"
                                                        >
                                                            {item.tipo_desc === 'Saida' ? 'Entrega' : 'Recebimento'}
                                                        </Badge>
                                                        {item.tipo_desc === 'Saida' && !item.anexo && (
                                                            <div className="relative group flex items-center font-normal">
                                                                <AlertTriangle className="h-4 w-4 text-orange-500 animate-alert-blink cursor-help" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-md whitespace-nowrap">
                                                                    Movimento incompleto, insira o anexo
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.data && (
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span>{new Date(item.data).toLocaleDateString()}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(item.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.ativo && (
                                                <TableCell className="font-medium text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span>{item.asset?.patrimonio}</span>
                                                        <span className="text-xs text-muted-foreground">{item.asset?.modelo}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {visibleColumns.colaborador && (
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span>{item.employee?.nome || 'N/A'}</span>
                                                        <span className="text-xs text-muted-foreground">{item.employee?.setor || '-'}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center bg-muted/50">
                                                <div className="flex justify-center gap-2">
                                                    <Link href={`/movements/${item.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {item.tipo_desc === 'Saida' && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900" title={item.anexo ? "Ver Anexo" : "Inserir Anexo"}>
                                                            <Paperclip className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {/* Botões de Editar e Excluir Removidos */}
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
        </div>
    );
}
