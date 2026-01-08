'use client';

import { useState, useEffect } from 'react';
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

// Mapeamento status -> ID
const STATUS_MAP: Record<string, number> = {
    'disponivel': 1,
    'em_uso': 2,
    'manutencao': 3,
    'sucata': 4,
    'novo': 5,
    'ativo': 1 // Fallback
};

export default function NewAssetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();

    const [currentUser, setCurrentUser] = useState<string>('');
    const [colaboradores, setColaboradores] = useState<{ id: number, nome: string }[]>([]);

    const [formData, setFormData] = useState({
        patrimonio: '',
        etiqueta: '', // service_tag
        tec: '', // nome_tecnico
        fabricante: '',
        modelo: '',
        descricao: '',
        gpu: '',
        tipoRam: '',
        quantidadeRam: '',
        tipoArmazenamento: '',
        quantidadeArmazenamento: '',
        valor: '',
        notaFiscal: '', // id_nf
        data_aquisicao: '',
        estado: 'NOVO',
        status: 'DISPONIVEL',
        tipoEquipamento: '',
        responsavel: '', // ID do colaborador
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

        // Fetch employees for responsavel selection
        api.get(ENDPOINTS.EMPLOYEES)
            .then(data => {
                const list = Array.isArray(data) ? data : (data.content || []);
                setColaboradores(list);
            })
            .catch(err => console.error("Erro ao buscar colaboradores:", err));
    }, []);

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

                status: formData.status ? Number(STATUS_MAP[formData.status.toLowerCase()] || 1) : null,
                responsavelId: formData.responsavel ? Number(formData.responsavel) : null, // Envia ID do responsável
            };

            await api.post(ENDPOINTS.ASSETS, body);

            addNotification({
                title: 'Novo Ativo',
                message: 'Equipamento cadastrado com sucesso.',
                type: 'success'
            });

            router.push('/assets');
        } catch (error) {
            console.error("Erro ao cadastrar ativo:", error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível cadastrar o ativo. Verifique os dados.',
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
                        <h1 className="text-2xl font-bold tracking-tight">Novo Ativo</h1>
                        <p className="text-sm text-muted-foreground">Preencha os dados do equipamento.</p>
                    </div>
                </div>
                {currentUser && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground border">
                        <User className="h-3 w-3" />
                        Cadastrando como: {currentUser}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Identificação */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Identificação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patrimonio">Patrimônio</Label>
                                    <Input
                                        id="patrimonio"
                                        placeholder="NTB-2024-001"
                                        required
                                        value={formData.patrimonio}
                                        onChange={e => handleChange('patrimonio', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tipoEquipamento">Tipo</Label>
                                    <Select
                                        value={formData.tipoEquipamento}
                                        onChange={(e) => handleChange('tipoEquipamento', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="DESKTOP">Desktop</option>
                                        <option value="NOTEBOOK">Notebook</option>
                                        <option value="IMPRESSORA">Impressora</option>
                                        <option value="CELULAR">Celular</option>
                                        <option value="TABLET">Tablet</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="etiqueta">Etiqueta (SN)</Label>
                                    <Input
                                        id="etiqueta"
                                        placeholder="Serial Number"
                                        value={formData.etiqueta}
                                        onChange={e => handleChange('etiqueta', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tec">Nome Técnico (Tec)</Label>
                                    <Input
                                        id="tec"
                                        placeholder="Ex: PC-TI-01"
                                        value={formData.tec}
                                        onChange={e => handleChange('tec', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabricante">Fabricante</Label>
                                    <Input
                                        id="fabricante"
                                        placeholder="Ex: Dell, HP"
                                        value={formData.fabricante}
                                        onChange={e => handleChange('fabricante', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modelo">Modelo</Label>
                                    <Input
                                        id="modelo"
                                        placeholder="Ex: Latitude 5420"
                                        required
                                        value={formData.modelo}
                                        onChange={e => handleChange('modelo', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Input
                                    id="descricao"
                                    placeholder="Descrição breve"
                                    value={formData.descricao}
                                    onChange={e => handleChange('descricao', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hardware */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hardware</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gpu">GPU (Placa de Vídeo)</Label>
                                <Input
                                    id="gpu"
                                    placeholder="Ex: NVIDIA RTX 3060"
                                    value={formData.gpu}
                                    onChange={e => handleChange('gpu', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoRam">Tipo RAM</Label>
                                    <Input
                                        id="tipoRam"
                                        placeholder="Ex: DDR4"
                                        value={formData.tipoRam}
                                        onChange={e => handleChange('tipoRam', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantidadeRam">Qtd. RAM (GB)</Label>
                                    <Input
                                        id="quantidadeRam"
                                        type="number"
                                        placeholder="16"
                                        value={formData.quantidadeRam}
                                        onChange={e => handleChange('quantidadeRam', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoArmazenamento">Tipo Armaz.</Label>
                                    <Input
                                        id="tipoArmazenamento"
                                        placeholder="Ex: NVMe SSD"
                                        value={formData.tipoArmazenamento}
                                        onChange={e => handleChange('tipoArmazenamento', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantidadeArmazenamento">Qtd. Armaz. (GB)</Label>
                                    <Input
                                        id="quantidadeArmazenamento"
                                        type="number"
                                        placeholder="512"
                                        value={formData.quantidadeArmazenamento}
                                        onChange={e => handleChange('quantidadeArmazenamento', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financeiro e Status */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Financeiro & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="valor">Valor (R$)</Label>
                                    <Input
                                        id="valor"
                                        type="number"
                                        step="0.01"
                                        value={formData.valor}
                                        onChange={e => handleChange('valor', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notaFiscal">ID Nota Fiscal</Label>
                                    <Input
                                        id="notaFiscal"
                                        type="number"
                                        placeholder="ID"
                                        value={formData.notaFiscal}
                                        onChange={e => handleChange('notaFiscal', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado Conservação</Label>
                                    <Select
                                        value={formData.estado}
                                        onChange={(e) => handleChange('estado', e.target.value)}
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
                                        onChange={(e) => handleChange('status', e.target.value)}
                                    >
                                        <option value="DISPONIVEL">Disponível</option>
                                        <option value="EM_USO">Em Uso</option>
                                        <option value="MANUTENCAO">Manutenção</option>
                                        <option value="SUCATA">Sucata</option>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data_aquisicao">Data Aquisição</Label>
                                    <Input
                                        id="data_aquisicao"
                                        type="date"
                                        value={formData.data_aquisicao}
                                        onChange={e => handleChange('data_aquisicao', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="responsavel">Responsável Inicial</Label>
                                    <Select
                                        value={formData.responsavel}
                                        onChange={(e) => handleChange('responsavel', e.target.value)}
                                    >
                                        <option value="">-- Selecione (para alocar) --</option>
                                        {colaboradores.map(colab => (
                                            <option key={colab.id} value={colab.id}>
                                                {colab.nome}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Observações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="obs"
                                placeholder="Observações..."
                                className="min-h-[100px]"
                                value={formData.descricao}
                                onChange={e => handleChange('descricao', e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="pt-6 flex justify-end gap-2">
                    <Link href="/assets">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Ativo'}
                        <Save className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
