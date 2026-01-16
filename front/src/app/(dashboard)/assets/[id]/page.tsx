
'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Smartphone, Monitor, Laptop, HardDrive, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ativo, Movimentacao, Colaborador } from '@/types';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AssetDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const assetId = parseInt(resolvedParams.id);

    const [asset, setAsset] = useState<Ativo | null>(null);
    const [history, setHistory] = useState<(Movimentacao & { tipo_desc: string, colab_nome?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetRes, movRes, colabRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/equipamentos/${assetId}`),
                    fetch('http://localhost:8080/api/movimentos'),
                    fetch('http://localhost:8080/api/colaboradores')
                ]);

                if (assetRes.ok) {
                    const assetData = await assetRes.json();
                    setAsset(assetData);
                }

                if (movRes.ok && colabRes.ok) {
                    const movData: Movimentacao[] = await movRes.json();
                    const colabData: Colaborador[] = await colabRes.json();

                    // Filter and enrich movements
                    const assetMovements = movData
                        .filter(m => m.idEquipamento?.id === assetId)
                        .map(m => {
                            const colab = colabData.find(c => c.id === m.idColaborador?.id);
                            return {
                                ...m,
                                tipo_desc: m.observacao?.toLowerCase().includes('entrada') ? 'Entrada' : 'Saída',
                                colab_nome: colab?.nome || 'Desconhecido'
                            };
                        })
                        .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime());

                    setHistory(assetMovements);
                }

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        if (assetId && !isNaN(assetId)) {
            fetchData();
        }
    }, [assetId]);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p>Carregando detalhes do ativo...</p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-xl font-semibold text-muted-foreground">Ativo não encontrado</h2>
                <Link href="/assets">
                    <Button>Voltar para Lista</Button>
                </Link>
            </div>
        );
    }

    // Resolve Asset Type Icon
    const AssetIcon = () => {
        switch (asset.id_categoria) {
            case 1: return <Laptop className="h-5 w-5" />;
            case 2: return <Monitor className="h-5 w-5" />;
            case 3: return <Monitor className="h-5 w-5" />; // Monitor
            case 4: return <Smartphone className="h-5 w-5" />;
            case 5: return <HardDrive className="h-5 w-5" />;
            default: return <Cpu className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/assets">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <AssetIcon />
                            {asset.modelo}
                        </h1>
                        <p className="text-sm text-muted-foreground">{asset.patrimonio}</p>
                    </div>
                </div>
                <Link href={`/assets/${assetId}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informações do Equipamento</CardTitle>
                        <CardDescription>Detalhes técnicos e administrativos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status & Basic Info */}
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Status Atual</span>
                                <div>
                                    <Badge variant={
                                        (asset.status?.descricao || asset.status_desc) === 'Em Uso' ? 'default' :
                                            (asset.status?.descricao || asset.status_desc) === 'Disponível' ? 'secondary' : // 'success' variant doesn't strictly exist in shadcn default, map to secondary or define
                                                (asset.status?.descricao || asset.status_desc) === 'Sucata' ? 'destructive' : 'outline'
                                    } className={(asset.status?.descricao || asset.status_desc) === 'Disponível' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                                        {asset.status?.descricao || asset.status_desc || 'Sem Status'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Estado Conservação</span>
                                <p className="font-medium text-sm capitalize">
                                    {typeof asset.estado === 'object' ? asset.estado.descricao : (asset.estado || 'Novo')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Valor</span>
                                <p className="font-medium text-sm">
                                    {asset.valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.valor) : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Data Aquisição</span>
                                <p className="font-medium text-sm">
                                    {asset.data_aquisicao ? new Date(asset.data_aquisicao).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3">Identificação</h4>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Patrimônio / Tag</span>
                                    <p className="font-medium text-sm">{asset.patrimonio}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Serial Number (SN)</span>
                                    <p className="font-medium text-sm">{asset.service_tag || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Nome Técnico</span>
                                    <p className="font-medium text-sm">{asset.nome_tecnico || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Fabricante</span>
                                    <p className="font-medium text-sm">{asset.fabricante || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-3">Hardware</h4>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Processador</span>
                                    <p className="font-medium text-sm">{'-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Memória RAM</span>
                                    <p className="font-medium text-sm">
                                        {asset.quantidadeRam ? `${asset.quantidadeRam}GB (${asset.tipoRam || ''})` : '-'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Armazenamento</span>
                                    <p className="font-medium text-sm">
                                        {asset.quantidadeArmazenamento ? `${asset.quantidadeArmazenamento}GB (${asset.tipoArmazenamento || ''})` : '-'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">GPU</span>
                                    <p className="font-medium text-sm">{asset.gpu || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {asset.obs && (
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-2">Observações</h4>
                                <p className="text-sm text-muted-foreground italic">{asset.obs}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {history.length > 0 ? (
                            <div className="relative border-l border-muted ml-2 space-y-6 pb-2">
                                {history.map((mov, index) => {
                                    return (
                                        <div key={mov.id} className="relative pl-6">
                                            <span className={`absolute flex items-center justify-center w-4 h-4 rounded-full -left-2 ring-4 ring-background ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                                                }`} />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(mov.dataMovimento).toLocaleDateString()}
                                                </span>
                                                <span className="text-sm font-medium leading-none">
                                                    {mov.tipo_desc}
                                                </span>
                                                {mov.colab_nome && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {mov.colab_nome}
                                                    </span>
                                                )}
                                                {mov.observacao && (
                                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                                        "{mov.observacao}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
                        )}
                        <Link href={`/movements?assetId=${assetId}`}>
                            <Button variant="outline" className="w-full mt-4" size="sm">
                                Ver Histórico Completo
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
