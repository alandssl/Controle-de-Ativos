'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/providers/notification-provider';
import { Ativo, Colaborador, Movimentacao } from '@/types';
import { api, ENDPOINTS } from '@/services/api';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditMovementPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const movementId = Number(resolvedParams.id);
    const router = useRouter();
    const { addNotification } = useNotifications();

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Estados para os dados
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [movement, setMovement] = useState<Movimentacao | null>(null);

    // Estados do formulário
    const [formData, setFormData] = useState({
        tipo_movimento: 'Saida',
        ativo: '',
        colaborador: '',
        data: '',
        valor: '',
        obs: ''
    });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [movResponse, ativosResponse, colabResponse] = await Promise.all([
                    api.get(`${ENDPOINTS.MOVEMENTS}/${movementId}`),
                    api.get(ENDPOINTS.ASSETS),
                    api.get(ENDPOINTS.EMPLOYEES)
                ]);

                if (!movResponse) {
                    notFound();
                    return;
                }

                setMovement(movResponse);
                setAtivos(ativosResponse.content ?? ativosResponse);
                setColaboradores(colabResponse.content ?? colabResponse);

                // Preencher formulário com dados existentes
                setFormData({
                    tipo_movimento: movResponse.tipoMovimento || 'Saida',
                    ativo: movResponse.idEquipamento?.id?.toString() || '',
                    colaborador: movResponse.idColaborador?.id?.toString() || '',
                    data: movResponse.dataMovimento ? new Date(movResponse.dataMovimento).toISOString().slice(0, 16) : '',
                    valor: movResponse.valor?.toString() || '',
                    obs: movResponse.observacao || ''
                });

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                addNotification({
                    title: 'Erro',
                    message: 'Erro ao carregar os dados da movimentação.',
                    type: 'error'
                });
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [movementId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let updatedData = { ...formData, [name]: value };

        // Regra de Negócio: 
        // - Sem colaborador (Estoque) -> Entrada (Devolução)
        // - Com colaborador -> Saida (Entrega/Transferência)
        if (name === 'colaborador') {
            if (value === '') {
                updatedData.tipo_movimento = 'Entrada';
            } else {
                updatedData.tipo_movimento = 'Saida';
            }
        }

        setFormData(updatedData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedAssetId = Number(formData.ativo);
        const selectedColabId = Number(formData.colaborador);

        const selectedAsset = ativos.find(a => a.id === selectedAssetId);
        const selectedColab = colaboradores.find(c => c.id === selectedColabId);

        const payload = {
            id: movementId,
            tipoMovimento: formData.tipo_movimento,
            dataMovimento: formData.data,
            observacao: formData.obs,
            valor: Number(formData.valor),
            tipo: { tipo: selectedAsset?.tipoEquipamento?.tipo || 'Outros' },
            idEquipamento: {
                id: selectedAssetId
            },
            idColaborador: {
                id: selectedColabId
            },
            setor: selectedColab?.setor
        };

        try {
            await api.put(`${ENDPOINTS.MOVEMENTS}/${movementId}`, payload);

            addNotification({
                title: 'Sucesso',
                message: 'Movimentação atualizada com sucesso.',
                type: 'success'
            });

            router.push('/movements');
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível atualizar a movimentação.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return <div className="p-8 text-center">Carregando dados...</div>;
    }

    if (!movement) {
        return <div className="p-8 text-center">Movimentação não encontrada.</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/movements">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Movimentação</h1>
                    <p className="text-sm text-muted-foreground">
                        Atualize as informações do registro #{movementId}.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes da Movimentação</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* TIPO */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo_movimento">Tipo de Operação</Label>
                            <select
                                id="tipo_movimento"
                                name="tipo_movimento"
                                value={formData.tipo_movimento}
                                onChange={handleChange}
                                disabled={true}
                                className="w-full border rounded px-3 py-2 disabled:bg-muted disabled:text-muted-foreground"
                            >
                                <option value="Saida">Entrega (Saída)</option>
                                <option value="Entrada">Devolução (Entrada)</option>
                            </select>
                            {formData.colaborador === '' && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    * Devoluções para o estoque são sempre entradas.
                                </p>
                            )}
                            {formData.colaborador !== '' && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    * Entregas para colaboradores são sempre saídas.
                                </p>
                            )}
                        </div>

                        {/* ATIVO */}
                        <div className="space-y-2">
                            <Label htmlFor="ativo">Ativo</Label>
                            <select
                                id="ativo"
                                name="ativo"
                                required
                                value={formData.ativo}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-muted/50"

                            >
                                <option value="">Selecione o ativo...</option>
                                {ativos.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.patrimonio} - {asset.modelo}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground italic">
                                * Se alterar o ativo, verifique se o status dele é compatível.
                            </p>
                        </div>

                        {/* COLABORADOR */}
                        <div className="space-y-4 border p-4 rounded-md">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="devolucao"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={
                                        colaboradores.find(c => c.id.toString() === formData.colaborador)?.nome.toUpperCase() === 'ESTOQUE TI' ||
                                        (formData.colaborador === '' && colaboradores.some(c => c.nome.toUpperCase() === 'ESTOQUE TI'))
                                    }
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;

                                        // Buscar ID do Colaborador 'ESTOQUE TI'
                                        const stockColab = colaboradores.find(c =>
                                            c.nome.toUpperCase().includes('ESTOQUE') ||
                                            c.nome.toUpperCase().includes('TI')
                                        ); // Tenta achar algo parecido, ou o usuário terá que selecionar

                                        // Se o usuário pediu pra buscar "ESTOQUE TI" especificamente e ele existe no banco:
                                        const exactStock = colaboradores.find(c => c.nome.toUpperCase() === 'ESTOQUE TI');
                                        const targetStockId = exactStock?.id?.toString() || stockColab?.id?.toString() || '';

                                        setFormData(prev => ({
                                            ...prev,
                                            colaborador: isChecked ? targetStockId : (colaboradores[0]?.id?.toString() || ''),
                                            tipo_movimento: isChecked ? 'Entrada' : 'Saida'
                                        }));
                                    }}
                                />
                                <Label htmlFor="devolucao" className="font-medium cursor-pointer">
                                    Devolução para Estoque TI
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="colaborador" className={formData.colaborador === '' ? 'text-muted-foreground' : ''}>
                                    Colaborador (Destino)
                                </Label>
                                <select
                                    id="colaborador"
                                    name="colaborador"
                                    disabled={
                                        colaboradores.find(c => c.id.toString() === formData.colaborador)?.nome.toUpperCase() === 'ESTOQUE TI'
                                    }
                                    value={formData.colaborador}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 disabled:bg-muted disabled:text-muted-foreground"
                                >
                                    <option value="">Selecione o colaborador...</option>
                                    {colaboradores.map(colab => (
                                        <option key={colab.id} value={colab.id}>
                                            {colab.nome} - {colab.setor}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* DATA */}
                        <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                                id="data"
                                name="data"
                                type="datetime-local"
                                value={formData.data}
                                onChange={handleChange}
                            />
                        </div>

                        {/* OBS e VALOR */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="valor">Valor (R$)</Label>
                                <Input
                                    id="valor"
                                    name="valor"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.valor}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="obs">Observações</Label>
                            <Textarea
                                id="obs"
                                name="obs"
                                placeholder="Detalhes sobre o estado do equipamento ou motivo..."
                                value={formData.obs}
                                onChange={handleChange}
                            />
                        </div>

                        {/* AÇÕES */}
                        <div className="pt-4 flex justify-end gap-2">
                            <Link href="/movements">
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
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
