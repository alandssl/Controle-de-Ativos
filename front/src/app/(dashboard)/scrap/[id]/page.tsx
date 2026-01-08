'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit, Recycle, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPecas, mockAtivos } from '@/lib/data';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ScrapDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const partId = parseInt(resolvedParams.id);
    const part = mockPecas.find(p => p.id === partId);

    if (!part) {
        notFound();
    }

    const originAsset = mockAtivos.find(a => a.id === part.id_ativo_origem);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/scrap">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Cpu className="h-6 w-6" />
                            {part.nome}
                        </h1>
                        <p className="text-sm text-muted-foreground">SN: {part.serial || 'N/A'}</p>
                    </div>
                </div>
                <Link href={`/scrap/${partId}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Peça
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações da Peça</CardTitle>
                        <CardDescription>Detalhes técnicos e status atual</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Status</span>
                                <div>
                                    <Badge variant={
                                        part.status === 'Disponivel' ? 'success' :
                                            part.status === 'Reservado' ? 'warning' : 'destructive'
                                    }>
                                        {part.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Data Retirada</span>
                                <p className="font-medium text-sm">
                                    {new Date(part.data_retirada).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Nome da Peça</span>
                            <p className="font-medium text-sm">{part.nome}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Número de Série</span>
                            <p className="font-medium text-sm font-mono bg-muted/50 p-2 rounded w-fit">
                                {part.serial || '-'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Origem</CardTitle>
                        <CardDescription>Equipamento de onde a peça foi retirada</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {originAsset ? (
                            <>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Ativo</span>
                                    <Link href={`/assets/${originAsset.id}`} className="hover:underline text-primary">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <Recycle className="h-4 w-4" />
                                            {originAsset.modelo}
                                        </div>
                                    </Link>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Patrimônio</span>
                                    <p className="font-medium text-sm">{originAsset.patrimonio}</p>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Origem desconhecida ou ativo removido.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
