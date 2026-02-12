'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Search, Plus,
    Eye, Settings2, Paperclip, AlertTriangle, X, Upload
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


const APP_IP = process.env.NEXT_PUBLIC_API_URL;


function MovementsContent() {
    const searchParams = useSearchParams();
    const assetIdFilter = searchParams.get('assetId');

    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);
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


    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            if (!isPdf) {
                addNotification({ type: 'error', title: 'Erro', message: 'Por favor, selecione apenas arquivos PDF.' });
                return;
            }
            setSelectedFile(file);
            setIsUploadModalOpen(true);
        }
    };



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

    const handleAbrirAnexo = (id: number) => {
        window.open(
            `${APP_IP}/movimentos/${id}/anexo`,
            '_blank'
        );
    };


    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    // --- LOGICA DE UPLOAD CORRIGIDA ---
    const handleUpload = async () => {
        if (!selectedUploadId || !selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        // O nome 'file' aqui deve ser o mesmo esperado no @RequestParam do seu Controller Java
        formData.append('file', selectedFile);

        try {

            // Importante: NÃO definimos headers de Content-Type. 
            // O navegador faz isso automaticamente para Multipart/form-data incluindo o boundary.
            const res = await fetch(`${APP_IP}/movimentos/${selectedUploadId}/anexo`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 0 || !res.status) {
                    throw new Error('Erro de conexão ou CORS. Reinicie o backend Java.');
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${res.status}: Falha ao enviar anexo.`);
            }

            addNotification({
                type: 'success',
                title: 'Sucesso',
                message: 'Comprovante anexado e salvo com sucesso!'
            });
            setIsUploadModalOpen(false);
            setSelectedFile(null);

            // Recarrega os dados para atualizar os status e ícones na tabela
            await fetchData();

        } catch (error: any) {
            const msg = error.message && error.message.includes('Failed to fetch')
                ? 'Falha na conexão (Possível erro de CORS ou Backend desligado). Reinicie o backend.'
                : (error.message || 'Erro desconhecido no upload.');

            addNotification({
                type: 'error',
                title: 'Erro no Upload',
                message: msg
            });
            console.error("Upload Error:", error);
        } finally {
            setIsUploading(false);
        }
    };



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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Movimentações</h1>
                    <p className="text-sm text-muted-foreground">Histórico de entregas e devoluções de equipamentos.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/movements/new" className='no-underline'>
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
                            Verifique se a API Java está rodando em {APP_IP}.
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
                                        <TableRow key={item.id}>
                                            {visibleColumns.tipo && (
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center justify-center">
                                                            <Badge
                                                                variant={item.tipo_desc === 'Saida' ? 'default' : 'secondary'}
                                                                className="px-3"
                                                            >
                                                                {item.tipo_desc === 'Saida' ? 'Entrega' : 'Recebimento'}
                                                            </Badge>
                                                            {item.tipo_desc === 'Saida' && (!item.anexo || item.anexo === 'NAO') && (
                                                                <div className="w-0 overflow-visible flex items-center">
                                                                    <AlertTriangle className="ml-2 h-4 w-4 text-orange-500 animate-alert-blink shrink-0" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {item.tipo_desc === 'Saida' && (!item.anexo || item.anexo === 'NAO') && (
                                                            <span className="text-xs text-orange-600 font-medium">
                                                                Movimento incompleto, insira o anexo
                                                            </span>
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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                                            title={item.anexo === 'SIM' ? "Ver Anexo" : "Inserir Anexo"}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (item.anexo === 'SIM') {
                                                                    handleAbrirAnexo(item.id);
                                                                } else {
                                                                    setSelectedUploadId(item.id);
                                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                                    fileInputRef.current?.click();
                                                                }
                                                            }}
                                                        >
                                                            <Paperclip className="h-4 w-4" />
                                                        </Button>
                                                    )}
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

            <input
                type="file"
                ref={fileInputRef}
                // className="hidden"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            {
                isUploadModalOpen && mounted && createPortal(
                    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirmar Envio</h3>
                                <button onClick={() => {
                                    setIsUploadModalOpen(false);
                                    setSelectedFile(null);
                                }} className="text-gray-500 hover:text-gray-700">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <span className="text-3xl">📄</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-gray-900 break-all">{selectedFile?.name}</p>
                                        <p className="text-sm text-gray-500">{(selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0)} MB</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 text-center">
                                    Deseja anexar este arquivo PDF à movimentação?
                                </p>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}
                                        className="flex-1"
                                        disabled={isUploading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || isUploading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isUploading ? 'Enviando...' : 'Confirmar Anexo'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
}

export default function MovementsPage() {
    return (
        <React.Suspense fallback={<div>Carregando...</div>}>
            <MovementsContent />
        </React.Suspense>
    );
}