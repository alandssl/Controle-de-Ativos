'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/providers/notification-provider';
import { api, ENDPOINTS } from '@/services/api';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Mapeamento status -> ID
const STATUS_MAP: Record<string, number> = {
    'disponivel': 1,
    'em_uso': 2,
    'manutencao': 3,
    'sucata': 4,
    'novo': 5,
    'ativo': 1
};

export default function EditAssetPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const assetId = resolvedParams.id;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();
    const [currentUser, setCurrentUser] = useState<string>('');

    const [formData, setFormData] = useState({
        patrimonio: '',
        etiqueta: '',
        tec: '',
        fabricante: '',
        modelo: '',
        descricao: '',
        gpu: '',
        tipoRam: '',
        quantidadeRam: '',
        tipoArmazenamento: '',
        quantidadeArmazenamento: '',
        valor: '',
        notaFiscal: '',
        data_aquisicao: '',
        estado: 'NOVO',
        status: 'DISPONIVEL',
        tipoEquipamento: '',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setCurrentUser(parsed.email || 'Usuário Desconhecido');
            } catch (e) {
                setCurrentUser('Usuário Desconhecido');
            }
        }

        if (assetId) {
            fetchAsset(assetId);
        }
    }, [assetId]);

    const fetchAsset = async (id: string) => {
        try {
            const data = await api.get(`${ENDPOINTS.ASSETS}/${id}`);

            setFormData({
                patrimonio: data.patrimonio || '',
                etiqueta: data.etiqueta || '',
                tec: data.tec || '',
                fabricante: data.fabricante || '',
                modelo: data.modelo || '',
                descricao: data.descricao || '',

                gpu: data.gpu || '',
                tipoRam: data.tipoRam || '',
                quantidadeRam: data.quantidadeRam || '',

                tipoArmazenamento: data.tipoArmazenamento || '',
                quantidadeArmazenamento: data.quantidadeArmazenamento || '',

                valor: data.valor || '',
                notaFiscal: data.notaFiscal?.id || data.notaFiscal || '',
                data_aquisicao: data.data_aquisicao ? data.data_aquisicao.split('T')[0] : '',

                estado: data.estado?.estadoTipo || data.estado || 'NOVO',
                status: (data.status?.descricao || data.status_desc || 'DISPONIVEL').toUpperCase().replace(' ', '_'),

                tipoEquipamento: data.tipoEquipamento?.tipo || data.tipoEquipamento || '',
            });

        } catch (error) {
            console.error("Erro ao carregar ativo:", error);
            addNotification({
                title: 'Erro',
                message: 'Falha ao carregar dados do ativo.',
                type: 'error'
            });
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.tipoEquipamento) {
            addNotification({
                title: 'Erro',
                message: 'Selecione o tipo de equipamento.',
                type: 'error'
            });
            setLoading(false);
            return;
        }

        try {
            const body = {
                estado: formData.estado?.toUpperCase(),
                tipoEquipamento: formData.tipoEquipamento,

                notaFiscal: formData.notaFiscal ? Number(formData.notaFiscal) : null,

                fabricante: formData.fabricante,
                etiqueta: formData.etiqueta,
                tec: formData.tec,
                patrimonio: formData.patrimonio,
                modelo: formData.modelo,
                gpu: formData.gpu,

                tipoRam: formData.tipoRam,
                quantidadeRam: formData.quantidadeRam ? Number(formData.quantidadeRam) : null,

                tipoArmazenamento: formData.tipoArmazenamento,
                quantidadeArmazenamento: formData.quantidadeArmazenamento ? Number(formData.quantidadeArmazenamento) : null,

                descricao: formData.descricao,
                valor: formData.valor ? Number(formData.valor) : 0,
                dataAquisicao: formData.data_aquisicao || null,

                status: formData.status ? Number(STATUS_MAP[formData.status.toLowerCase()] || 1) : null
            };

            await api.put(ENDPOINTS.ASSETS + '/' + assetId, body);

            addNotification({
                title: 'Sucesso',
                message: 'Ativo atualizado com sucesso.',
                type: 'success'
            });

            router.push('/assets');
        } catch (error) {
            console.error("Erro ao editar ativo:", error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível salvar as alterações.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/assets">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Editar Ativo</h1>
                        <p className="text-sm text-muted-foreground">Editando equipamento #{assetId}</p>
                    </div>
                </div>
                {currentUser && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground border">
                        <User className="h-3 w-3" />
                        Editando como: {currentUser}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Atualizar Status e Observações</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado Conservação</Label>
                                    <Select
                                        value={formData.estado}
                                        onChange={(e: any) => handleChange('estado', e.target.value)}
                                    >
                                        <option value="NOVO">Novo</option>
                                        <option value="USADO">Usado</option>
                                        <option value="CONSERVADO">Conservado</option>
                                        <option value="QUEBRADO">Quebrado</option>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status Operacional</Label>
                                    <Select
                                        value={formData.status}
                                        onChange={(e: any) => handleChange('status', e.target.value)}
                                    >
                                        <option value="DISPONIVEL">Disponível</option>
                                        <option value="EM_USO">Em Uso</option>
                                        <option value="MANUTENCAO">Manutenção</option>
                                        <option value="SUCATA">Sucata</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="obs">Observações</Label>
                                <Textarea
                                    id="obs"
                                    placeholder="Observações..."
                                    className="min-h-[150px]"
                                    value={formData.descricao}
                                    onChange={e => handleChange('descricao', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="pt-6 flex justify-end gap-2">
                    <Link href="/assets">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                        <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
