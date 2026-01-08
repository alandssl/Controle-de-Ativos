'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from "@/components/ui/select"

import { useNotifications } from '@/providers/notification-provider';
import { api, ENDPOINTS } from '@/services/api';

export default function NewEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();

    // Estado do Formulário
    const [formData, setFormData] = useState({
        nome: '',
        chapa: '', // Campo chapa adicionado pois é obrigatório na API
        email: '',
        cargo: '',
        setor: '',
        cpf: '',
        cnpj: '',
        status: 'ATIVO'
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post(ENDPOINTS.EMPLOYEES, {
                nome: formData.nome,
                chapa: formData.chapa || '00000',
                funcao: formData.cargo,
                setor: formData.setor,
                email: formData.email,
                cpf: formData.cpf,
                cnpj: formData.cnpj,
                situacao: formData.status,
                // Obrigatório na entidade do backend mas não no formulário
                codPessoa: Math.floor(Math.random() * 100000),
                codSituacao: 'A'
            });

            addNotification({
                title: 'Novo Colaborador',
                message: 'Um novo registro de funcionário foi criado com sucesso.',
                type: 'success'
            });
            router.push('/employees');
        } catch (error) {
            console.error("Erro ao criar colaborador:", error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível cadastrar o colaborador.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/employees">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Novo Colaborador</h1>
                    <p className="text-sm text-muted-foreground">Cadastre as informações de um novo colaborador.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome Completo</Label>
                                    <Input
                                        id="nome"
                                        placeholder="Nome do colaborador"
                                        required
                                        value={formData.nome}
                                        onChange={(e) => handleChange('nome', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Corporativo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nome@empresa.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF (Opcional)</Label>
                                    <Input
                                        id="cpf"
                                        placeholder="000.000.000-00"
                                        value={formData.cpf}
                                        onChange={(e) => handleChange('cpf', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                                    <Input
                                        id="cnpj"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpj}
                                        onChange={(e) => handleChange('cnpj', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Profissionais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cargo">Cargo / Função</Label>
                                    <Input
                                        id="cargo"
                                        placeholder="Ex: Desenvolvedor"
                                        required
                                        value={formData.cargo}
                                        onChange={(e) => handleChange('cargo', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="setor">Setor</Label>
                                    <Input
                                        id="setor"
                                        placeholder="Ex: TI"
                                        required
                                        value={formData.setor}
                                        onChange={(e) => handleChange('setor', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="chapa">Matrícula / Chapa</Label>
                                    <Input
                                        id="chapa"
                                        placeholder="00000"
                                        required
                                        value={formData.chapa}
                                        onChange={(e) => handleChange('chapa', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                    >
                                        <option value="ATIVO">ATIVO</option>
                                        <option value="FERIAS">FERIAS</option>
                                        <option value="AFASTADO">AFASTADO</option>
                                        <option value="DEMITIDO">DEMITIDO</option>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Link href="/employees">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Colaborador'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
