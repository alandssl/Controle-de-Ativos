'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, History, User, Laptop, Calendar, Info, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockMovimentacoes, mockAtivos, mockColaboradores } from '@/lib/data';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MovementDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const movId = parseInt(resolvedParams.id);
    const movement = mockMovimentacoes.find(m => m.id === movId);

    if (!movement) {
        notFound();
    }

    const asset = mockAtivos.find(a => a.id === movement.id_ativo);
    const collaborator = movement.id_colaborador ? mockColaboradores.find(c => c.id === movement.id_colaborador) : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/movements">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <History className="h-6 w-6" />
                            Detalhes da Movimentação #{movement.id}
                        </h1>
                        <p className="text-sm text-muted-foreground">Registro histórico de alteração de posse ou localização.</p>
                    </div>
                </div>
                <Link href={`/movements/${movId}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Registro
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Informações Gerais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Tipo de Operação</span>
                            <Badge variant={movement.tipo_desc === 'Saida' ? 'default' : 'secondary'}>
                                {movement.tipo_desc === 'Saida' ? 'Entrega (Saída)' : 'Devolução (Entrada)'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Data e Hora</span>
                            <div className="text-right">
                                <p className="text-sm font-medium">{new Date(movement.data).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">{new Date(movement.data).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <span className="text-sm text-muted-foreground">Observações / Motivo</span>
                            <div className="p-3 bg-muted/50 rounded-md text-sm border italic">
                                {movement.obs || 'Nenhuma observação registrada.'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Laptop className="h-4 w-4" />
                                Ativo Envolvido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {asset ? (
                                <Link href={`/assets/${asset.id}`} className="group block">
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors border">
                                        <div>
                                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{asset.patrimonio}</p>
                                            <p className="text-xs text-muted-foreground">{asset.modelo}</p>
                                        </div>
                                        <Badge variant="outline">{asset.status_desc}</Badge>
                                    </div>
                                </Link>
                            ) : (
                                <p className="text-sm text-destructive">Ativo não encontrado ou removido.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Colaborador
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {collaborator ? (
                                <Link href={`/employees/${collaborator.id}`} className="group block">
                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors border">
                                        <div>
                                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{collaborator.nome}</p>
                                            <p className="text-xs text-muted-foreground">{collaborator.setor} - {collaborator.funcao}</p>
                                        </div>
                                        <div className="text-xs px-2 py-1 bg-muted rounded">#{collaborator.chapa}</div>
                                    </div>
                                </Link>
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhum colaborador associado (Movimentação interna?).</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
