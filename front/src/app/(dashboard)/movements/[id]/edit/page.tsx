'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMovimentacoes, mockAtivos, mockColaboradores } from '@/lib/data';
import { useNotifications } from '@/providers/notification-provider';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditMovementPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const movementId = parseInt(resolvedParams.id);
    const movement = mockMovimentacoes.find(m => m.id === movementId);
    const router = useRouter();
    const { addNotification } = useNotifications();

    const [loading, setLoading] = useState(false);

    if (!movement) {
        notFound();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simular chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));

        addNotification({
            title: 'Movimentação Editada',
            message: `O registro da movimentação #${movement.id} foi atualizado.`,
            type: 'info'
        });

        alert('Movimentação atualizada com sucesso! (Simulação)');
        setLoading(false);
        router.push(`/movements/${movementId}`);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/movements/${movementId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Movimentação</h1>
                    <p className="text-sm text-muted-foreground">Corrija informações do registro #{movement.id}.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Operação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select id="tipo" defaultValue={movement.tipoMovimento === 'Saida' ? 'Saida' : 'Entrada'}>
                                    <option value="Saida">Entrega (Saída)</option>
                                    <option value="Entrada">Devolução (Entrada)</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="data">Data e Hora</Label>
                                <Input
                                    id="data"
                                    type="datetime-local"
                                    defaultValue={new Date(movement.dataMovimento).toISOString().slice(0, 16)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ativo">Ativo</Label>
                            <Select id="ativo" defaultValue={movement.idEquipamento?.id?.toString()} disabled>
                                {mockAtivos.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.patrimonio} - {asset.modelo}
                                    </option>
                                ))}
                            </Select>
                            <p className="text-[10px] text-muted-foreground italic">O ativo não pode ser alterado após o registro. Crie uma nova movimentação se necessário.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="colaborador">Colaborador</Label>
                            <Select id="colaborador" defaultValue={movement.idColaborador?.id?.toString()}>
                                {mockColaboradores.map(colab => (
                                    <option key={colab.id} value={colab.id}>
                                        {colab.nome} - {colab.setor}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="obs">Observações</Label>
                            <Textarea
                                id="obs"
                                defaultValue={movement.observacao}
                                placeholder="Detalhes sobre o registro..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Link href={`/movements/${movementId}`}>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                                <Save className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
