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
    const [statusOptions, setStatusOptions] = useState<{ id: number, descricao: string }[]>([]);
    const [estadoOptions, setEstadoOptions] = useState<{ estadoTipo: string }[]>([]);

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
        estado: '',
        status: '',
        tipoEquipamento: '',
        responsavel: '',
        imei: '', // imei_celular
        numero_linha: '', // Mapped to 'tec' for CHIP

        // Nova Nota Fiscal
        criarNovaNota: false,
        new_nf_garantia: false,
        new_nf_data_garantia: '',
        new_nf_numero: '',
        new_nf_fornecedor: '',
        new_nf_cnpj: '',
        new_nf_data: '',
        new_nf_valor: '',
        new_nf_chave: ''
    });

    // Custom search state for Responsável
    const [responsavelSearch, setResponsavelSearch] = useState('');
    const [showResponsavelList, setShowResponsavelList] = useState(false);

    const filteredColaboradores = colaboradores.filter(c =>
        c.nome.toLowerCase().includes(responsavelSearch.toLowerCase())
    ).slice(0, 5);

    const selectResponsavel = (id: number, nome: string) => {
        setFormData(prev => ({ ...prev, responsavel: id.toString() }));
        setResponsavelSearch(nome);
        setShowResponsavelList(false);
    };

    // File state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Helper para verificar campos obrigatórios
    const getRequiredFields = (type: string) => {
        const common = ['patrimonio', 'modelo', 'fabricante', 'tipoEquipamento', 'estado', 'status'];
        switch (type) {
            case 'CELULAR':
            case 'TABLET':
                return [...common, 'imei'];
            case 'NOTEBOOK':
            case 'DESKTOP':
                return [...common, 'tipoRam', 'quantidadeRam', 'tipoArmazenamento', 'quantidadeArmazenamento', 'etiqueta'];
            case 'CHIP':
                return ['patrimonio', 'fabricante', 'numero_linha', 'tipoEquipamento', 'etiqueta']; // etiqueta = Código Verificação
            default:
                return common;
        }
    };

    const isFieldRequired = (field: string) => {
        if (!formData.tipoEquipamento) return false;
        return getRequiredFields(formData.tipoEquipamento).includes(field);
    };

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

        // Fetch Status options
        api.get(ENDPOINTS.STATUS)
            .then(data => {
                setStatusOptions(data || []);
            })
            .catch(err => console.error("Erro ao buscar status:", err));

        // Fetch Type of States options
        api.get(ENDPOINTS.TIPO_ESTADOS)
            .then(data => {
                setEstadoOptions(data || []);
            })
            .catch(err => console.error("Erro ao buscar estados:", err));
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

        // Validação dinâmica
        const required = getRequiredFields(formData.tipoEquipamento);
        const missing = required.filter(field => !formData[field as keyof typeof formData]);

        if (missing.length > 0) {
            addNotification({
                title: 'Campos Obrigatórios',
                message: `Preencha os campos obrigatórios para ${formData.tipoEquipamento}: ${missing.join(', ')}`,
                type: 'error'
            });
            setLoading(false);
            return;
        }

        try {
            const body = {
                tipoEquipamento: formData.tipoEquipamento,
                notaFiscal: formData.notaFiscal ? Number(formData.notaFiscal) : null,

                fabricante: formData.fabricante,
                etiqueta: formData.etiqueta,
                // tec: movido para baixo
                patrimonio: formData.patrimonio,
                modelo: formData.modelo,
                gpu: formData.gpu,

                tipoRam: formData.tipoRam,
                quantidadeRam: formData.quantidadeRam ? Number(formData.quantidadeRam) : null,

                tipoArmazenamento: formData.tipoArmazenamento,
                quantidadeArmazenamento: formData.quantidadeArmazenamento ? Number(formData.quantidadeArmazenamento) : null,

                descricao: formData.descricao,
                valor: formData.valor ? parseFloat(formData.valor) : 0,
                dataAquisicao: formData.data_aquisicao || null,

                status: formData.status ? parseInt(formData.status, 10) : null,
                responsavelId: formData.responsavel ? parseInt(formData.responsavel, 10) : null,
                imeiCelular: formData.imei,
                estado: formData.estado,
                // Se for CHIP, usa numero_linha no campo TEC. Se não, usa o campo TEC normal.
                tec: formData.tipoEquipamento === 'CHIP' ? formData.numero_linha : formData.tec,

                novaNotaFiscal: formData.criarNovaNota ? {
                    numero: formData.new_nf_numero,
                    fornecedorNome: formData.new_nf_fornecedor.trim(),
                    fornecedorCnpj: formData.new_nf_cnpj || null,
                    dataEmissao: formData.new_nf_data || null,
                    valorTotal: formData.new_nf_valor ? parseFloat(formData.new_nf_valor) : 0,
                    chaveAcesso: formData.new_nf_chave || null,
                    garantia: formData.new_nf_garantia || false,
                    dataValidadeGarantia: (formData.new_nf_garantia && formData.new_nf_data_garantia) ? formData.new_nf_data_garantia : null
                } : null
            };

            // 1. Cadastra o ativo (E a nota fiscal, se selected)
            const response = await api.post(ENDPOINTS.ASSETS, body);

            // 2. Se criou nova nota E selecionou arquivo, faz upload
            if (formData.criarNovaNota && selectedFile && response && response.notaFiscal && response.notaFiscal.id) {
                const nfId = response.notaFiscal.id;
                const fileData = new FormData();
                fileData.append('file', selectedFile);

                await api.post(`${ENDPOINTS.INVOICES}/${nfId}/anexo`, fileData);
            }

            addNotification({
                title: 'Novo Ativo',
                message: 'Equipamento cadastrado com sucesso.',
                type: 'success'
            });

            router.push('/assets');
        } catch (error: any) {
            console.error("Erro detalhado ao cadastrar ativo:", error);
            addNotification({
                title: 'Erro',
                message: error.message || 'Não foi possível cadastrar o ativo. Verifique os dados.',
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
                    {/* Identificação - Dinâmica por Tipo */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Identificação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipoEquipamento">Tipo de Equipamento <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.tipoEquipamento}
                                    onChange={(e) => handleChange('tipoEquipamento', e.target.value)}
                                    autoFocus
                                >
                                    <option value="">Selecione o tipo...</option>
                                    <optgroup label="Informática">
                                        <option value="DESKTOP">Desktop</option>
                                        <option value="NOTEBOOK">Notebook</option>
                                        <option value="IMPRESSORA">Impressora</option>
                                    </optgroup>
                                    <optgroup label="Mobilidade">
                                        <option value="CELULAR">Celular</option>
                                        <option value="TABLET">Tablet</option>
                                        <option value="CHIP">Chip (Sim Card)</option>
                                    </optgroup>
                                </Select>
                            </div>

                            {!formData.tipoEquipamento && (
                                <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground border border-dashed">
                                    Selecione um tipo de equipamento acima para habilitar o formulário.
                                </div>
                            )}

                            {/* Layout para CHIP */}
                            {formData.tipoEquipamento === 'CHIP' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="patrimonio">ICCID (Série do Chip) <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="patrimonio"
                                                placeholder="8955..."
                                                required
                                                value={formData.patrimonio}
                                                onChange={e => handleChange('patrimonio', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="numero_linha">Número da Linha <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="numero_linha"
                                                placeholder="(11) 99999-9999"
                                                required
                                                value={formData.numero_linha}
                                                onChange={e => handleChange('numero_linha', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fabricante">Operadora <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="fabricante"
                                                placeholder="Vivo, Tim, Claro..."
                                                required
                                                value={formData.fabricante}
                                                onChange={e => handleChange('fabricante', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="modelo">Plano de Dados <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="modelo"
                                                placeholder="Ex: Smart Empresas 5GB"
                                                required
                                                value={formData.modelo}
                                                onChange={e => handleChange('modelo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="etiqueta">Código Verificação / PIN (2 Dígitos)</Label>
                                        <Input
                                            id="etiqueta"
                                            placeholder="Ex: 42"
                                            maxLength={2}
                                            value={formData.etiqueta}
                                            onChange={e => handleChange('etiqueta', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Layout para CELULAR / TABLET */}
                            {['CELULAR', 'TABLET'].includes(formData.tipoEquipamento) && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="patrimonio">Patrimônio / ID <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="patrimonio"
                                                placeholder="Ex: CEL-001"
                                                required
                                                value={formData.patrimonio}
                                                onChange={e => handleChange('patrimonio', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="imei">IMEI <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="imei"
                                                placeholder="35..."
                                                required
                                                value={formData.imei}
                                                onChange={e => handleChange('imei', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fabricante">Marca <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="fabricante"
                                                placeholder="Apple, Samsung..."
                                                required
                                                value={formData.fabricante}
                                                onChange={e => handleChange('fabricante', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="modelo">Modelo <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="modelo"
                                                placeholder="iPhone 13, Galaxy S22..."
                                                required
                                                value={formData.modelo}
                                                onChange={e => handleChange('modelo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="etiqueta">Número Serial (Opcional)</Label>
                                        <Input
                                            id="etiqueta"
                                            placeholder="Serial Number"
                                            value={formData.etiqueta}
                                            onChange={e => handleChange('etiqueta', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Layout para COMPUTADORES / IMPRESSORAS */}
                            {['DESKTOP', 'NOTEBOOK', 'IMPRESSORA'].includes(formData.tipoEquipamento) && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="patrimonio">Patrimônio <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="patrimonio"
                                                placeholder="Ex: NTB-2024-001"
                                                required
                                                value={formData.patrimonio}
                                                onChange={e => handleChange('patrimonio', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="etiqueta">Service Tag / Serial <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="etiqueta"
                                                placeholder="Serial Number"
                                                required
                                                value={formData.etiqueta}
                                                onChange={e => handleChange('etiqueta', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tec">Hostname / Nome <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="tec"
                                                placeholder="Ex: PC-TI-01"
                                                value={formData.tec}
                                                onChange={e => handleChange('tec', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="fabricante">Fabricante <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="fabricante"
                                                placeholder="Dell, HP, Lenovo"
                                                required
                                                value={formData.fabricante}
                                                onChange={e => handleChange('fabricante', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="modelo">Modelo <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="modelo"
                                            placeholder="Ex: Latitude 5420"
                                            required
                                            value={formData.modelo}
                                            onChange={e => handleChange('modelo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hardware - Apenas para PCs */}
                    {['DESKTOP', 'NOTEBOOK'].includes(formData.tipoEquipamento) && (
                        <Card className="animate-in fade-in slide-in-from-right-4 duration-500">
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
                                        <Label htmlFor="tipoRam">Tipo RAM <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="tipoRam"
                                            placeholder="Ex: DDR4"
                                            required={['DESKTOP', 'NOTEBOOK'].includes(formData.tipoEquipamento)}
                                            value={formData.tipoRam}
                                            onChange={e => handleChange('tipoRam', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantidadeRam">Qtd. RAM (GB) <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="quantidadeRam"
                                            type="number"
                                            placeholder="16"
                                            required={['DESKTOP', 'NOTEBOOK'].includes(formData.tipoEquipamento)}
                                            value={formData.quantidadeRam}
                                            onChange={e => handleChange('quantidadeRam', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tipoArmazenamento">Tipo Armaz. <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="tipoArmazenamento"
                                            placeholder="Ex: NVMe SSD"
                                            required={['DESKTOP', 'NOTEBOOK'].includes(formData.tipoEquipamento)}
                                            value={formData.tipoArmazenamento}
                                            onChange={e => handleChange('tipoArmazenamento', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="quantidadeArmazenamento">Qtd. Armaz. (GB) <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="quantidadeArmazenamento"
                                            type="number"
                                            placeholder="512"
                                            required={['DESKTOP', 'NOTEBOOK'].includes(formData.tipoEquipamento)}
                                            value={formData.quantidadeArmazenamento}
                                            onChange={e => handleChange('quantidadeArmazenamento', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Nota Fiscal - Sempre exibido */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Nota Fiscal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                <div className="space-y-2 flex-1 w-full">
                                    <Label htmlFor="notaFiscal">Vincular Nota Fiscal Existente (ID)</Label>
                                    <Input
                                        id="notaFiscal"
                                        type="number"
                                        placeholder="Digite o ID da NF..."
                                        value={formData.notaFiscal}
                                        onChange={e => handleChange('notaFiscal', e.target.value)}
                                        disabled={Boolean(formData.criarNovaNota)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pb-3">
                                    <div className="flex items-center space-x-2 border p-2 rounded-md bg-muted/20">
                                        <input
                                            type="checkbox"
                                            id="criarNovaNota"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={Boolean(formData.criarNovaNota)}
                                            onChange={(e) => handleChange('criarNovaNota', e.target.checked)}
                                        />
                                        <Label htmlFor="criarNovaNota" className="text-sm font-medium cursor-pointer">
                                            Não tenho ID, cadastrar nova NF
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {formData.criarNovaNota && (
                                <div className="mt-4 p-6 border rounded-lg bg-stone-50/50 space-y-4">
                                    <h4 className="font-semibold text-base text-stone-800 border-b pb-2 mb-4">
                                        Dados da Nova Nota Fiscal
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_nf_numero">Número da NF <span className="text-red-500">*</span></Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="new_nf_numero"
                                                    placeholder="Ex: 123456"
                                                    value={formData.new_nf_numero}
                                                    onChange={e => handleChange('new_nf_numero', e.target.value)}
                                                    required={formData.criarNovaNota}
                                                />
                                                <div className="flex items-center gap-2 border px-3 rounded-md min-w-fit bg-white" title="Possui Garantia?">
                                                    <input
                                                        type="checkbox"
                                                        id="new_nf_garantia"
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                        checked={Boolean(formData.new_nf_garantia)}
                                                        onChange={(e) => handleChange('new_nf_garantia', e.target.checked)}
                                                    />
                                                    <Label htmlFor="new_nf_garantia" className="text-xs font-medium cursor-pointer">
                                                        Garantia
                                                    </Label>
                                                </div>
                                            </div>
                                            {formData.new_nf_garantia && (
                                                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <Label htmlFor="new_nf_data_garantia" className="text-xs">Data Validade Garantia</Label>
                                                    <Input
                                                        type="date"
                                                        id="new_nf_data_garantia"
                                                        className="mt-1"
                                                        value={formData.new_nf_data_garantia}
                                                        onChange={e => handleChange('new_nf_data_garantia', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_nf_fornecedor">Fornecedor <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="new_nf_fornecedor"
                                                placeholder="Razão Social"
                                                value={formData.new_nf_fornecedor}
                                                onChange={e => handleChange('new_nf_fornecedor', e.target.value)}
                                                required={formData.criarNovaNota}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_nf_cnpj">CNPJ</Label>
                                            <Input
                                                id="new_nf_cnpj"
                                                placeholder="00.000.000/0000-00"
                                                value={formData.new_nf_cnpj}
                                                onChange={e => handleChange('new_nf_cnpj', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_nf_data">Data Emissão</Label>
                                            <Input
                                                type="date"
                                                id="new_nf_data"
                                                value={formData.new_nf_data}
                                                onChange={e => handleChange('new_nf_data', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_nf_valor">Valor Total (R$)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                id="new_nf_valor"
                                                placeholder="0,00"
                                                value={formData.new_nf_valor}
                                                onChange={e => handleChange('new_nf_valor', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_nf_chave">Chave de Acesso</Label>
                                            <Input
                                                id="new_nf_chave"
                                                placeholder="44 dígitos..."
                                                value={formData.new_nf_chave}
                                                onChange={e => handleChange('new_nf_chave', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new_nf_file">Anexo da Nota (PDF/Imagem)</Label>
                                        <Input
                                            type="file"
                                            id="new_nf_file"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            className="cursor-pointer"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                        <p className="text-xs text-muted-foreground">Suporta PDF, JPG, PNG.</p>
                                    </div>
                                </div>
                            )}
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
                                    <Label htmlFor="valor">Valor do Ativo (R$)</Label>
                                    <Input
                                        id="valor"
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={formData.valor}
                                        onChange={e => handleChange('valor', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado Conservação <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.estado}
                                        onChange={(e) => handleChange('estado', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {estadoOptions.map(est => (
                                            <option key={est.estadoTipo} value={est.estadoTipo}>
                                                {est.estadoTipo}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status Operacional <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {statusOptions.map(st => (
                                            <option key={st.id} value={st.id}>
                                                {st.descricao}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_aquisicao">Data Aquisição</Label>
                                    <Input
                                        id="data_aquisicao"
                                        type="date"
                                        value={formData.data_aquisicao}
                                        onChange={e => handleChange('data_aquisicao', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="responsavel">Responsável Inicial</Label>
                                    <div className="relative">
                                        <Input
                                            id="responsavel"
                                            placeholder="Digite para buscar..."
                                            value={responsavelSearch}
                                            onChange={(e) => {
                                                setResponsavelSearch(e.target.value);
                                                setFormData(prev => ({ ...prev, responsavel: '' }));
                                                setShowResponsavelList(true);
                                            }}
                                            onFocus={() => setShowResponsavelList(true)}
                                            onBlur={() => setTimeout(() => setShowResponsavelList(false), 200)}
                                            autoComplete="off"
                                        />
                                        {showResponsavelList && (
                                            <div
                                                className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1"
                                                style={{ backgroundColor: '#ffffff' }}
                                            >
                                                {filteredColaboradores.length > 0 ? (
                                                    filteredColaboradores.map((colab) => (
                                                        <div
                                                            key={colab.id}
                                                            className="px-4 py-2 hover:bg-stone-200 cursor-pointer text-sm mb-0.5 last:mb-0"
                                                            onClick={() => selectResponsavel(colab.id, colab.nome)}
                                                        >
                                                            {colab.nome}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-gray-500 text-sm">Nenhum colaborador encontrado</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                                placeholder="Detalhes adicionais, estado físico, acessórios inclusos..."
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
