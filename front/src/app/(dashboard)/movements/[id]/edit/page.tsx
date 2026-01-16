'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Save, FilePlus } from 'lucide-react';
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

    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [movement, setMovement] = useState<Movimentacao | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
                addNotification({ title: 'Erro', message: 'Erro ao carregar dados.', type: 'error' });
            } finally {
                setDataLoading(false);
            }
        };

        fetchAllData();
    }, [movementId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };
        if (name === 'colaborador') {
            updatedData.tipo_movimento = value === '' ? 'Entrada' : 'Saida';
        }
        setFormData(updatedData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        console.log(">>> Frontend: Iniciando processo de salvamento...");

        const selectedAssetId = Number(formData.ativo);
        const selectedColabId = Number(formData.colaborador);

        // 1. Objeto JSON para atualizar dados
        const payload = {
            id: movementId,
            tipoMovimento: formData.tipo_movimento,
            dataMovimento: formData.data,
            observacao: formData.obs,
            valor: Number(formData.valor),
            idEquipamento: { id: selectedAssetId },
            idColaborador: { id: selectedColabId },
        };

        try {
            // PASSO 1: Atualiza os dados (PUT)
            console.log(">>> Frontend: Enviando dados (PUT)...");
            await api.put(`${ENDPOINTS.MOVEMENTS}/${movementId}`, payload);

            // PASSO 2: Envia o arquivo (POST)
            if (selectedFile) {
                console.log(">>> Frontend: Arquivo detectado. Enviando anexo...");
                const fileData = new FormData();
                fileData.append('file', selectedFile);

                // ATENÇÃO: Não defina 'Content-Type' manualmente aqui. 
                // O navegador DEVE definir o boundary automaticamente.
                await api.post(`${ENDPOINTS.MOVEMENTS}/${movementId}/anexo`, fileData);
                console.log(">>> Frontend: Upload concluído.");
            }

            addNotification({ title: 'Sucesso', message: 'Movimentação atualizada!', type: 'success' });
            router.push('/movements');

        } catch (error) {
            console.error('Erro no salvamento:', error);
            addNotification({
                title: 'Erro',
                message: 'Falha ao salvar. Verifique o console (F12) e o Log do Java.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) return <div className="p-8 text-center">Carregando dados...</div>;
    if (!movement) return <div className="p-8 text-center">Movimentação não encontrada.</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/movements">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Editar Movimentação</h1>
                    <p className="text-sm text-muted-foreground">Atualize as informações e anexe documentos.</p>
                </div>
            </div>

            {/* REMOVIDO FORM PARA EVITAR CONFLITOS */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes da Movimentação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipo de Operação</Label>
                        <select
                            name="tipo_movimento"
                            value={formData.tipo_movimento}
                            disabled
                            className="w-full border rounded px-3 py-2 disabled:bg-muted"
                        >
                            <option value="Saida">Entrega (Saída)</option>
                            <option value="Entrada">Devolução (Entrada)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Ativo</Label>
                        <select name="ativo" value={formData.ativo} onChange={handleChange} className="w-full border rounded px-3 py-2">
                            <option value="">Selecione...</option>
                            {ativos.map(a => <option key={a.id} value={a.id}>{a.patrimonio} - {a.modelo}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Colaborador</Label>
                        <select name="colaborador" value={formData.colaborador} onChange={handleChange} className="w-full border rounded px-3 py-2">
                            <option value="">Selecione...</option>
                            {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Input name="data" type="datetime-local" value={formData.data} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input name="valor" type="number" step="0.01" value={formData.valor} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea name="obs" value={formData.obs} onChange={handleChange} />
                    </div>

                    <div className="space-y-2 p-4 border-2 border-dashed rounded-md bg-muted/30">
                        <Label htmlFor="anexo" className="flex items-center gap-2 cursor-pointer">
                            <FilePlus className="h-5 w-5 text-primary" />
                            <span>Anexar PDF</span>
                        </Label>
                        <Input id="anexo" type="file" accept=".pdf" onChange={handleFileChange} className="cursor-pointer" />
                        {selectedFile && <p className="text-xs text-green-600 font-medium">Selecionado: {selectedFile.name}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Link href="/movements"><Button variant="outline">Cancelar</Button></Link>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}