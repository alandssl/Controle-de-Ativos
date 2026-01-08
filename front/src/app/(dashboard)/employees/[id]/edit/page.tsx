'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from "@/components/ui/select"
import { useNotifications } from '@/providers/notification-provider';

import { api, ENDPOINTS } from '@/services/api';

export default function EditEmployeePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();

    // Estado do formulário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        cnpj: '',
        cargo: '',
        setor: '',
        chapa: '',
        status: 'ATIVO'
    });

    useEffect(() => {
        if (id) {
            const fetchEmployee = async () => {
                try {
                    const data = await api.get(`${ENDPOINTS.EMPLOYEES}/${id}`);
                    setFormData({
                        nome: data.nome,
                        email: data.email || '',
                        cpf: data.cpf || '',
                        cnpj: data.cnpj || '',
                        cargo: data.funcao,
                        setor: data.setor,
                        chapa: data.chapa,
                        status: data.situacao || 'ATIVO'
                    });
                } catch (error) {
                    console.error("Erro ao buscar colaborador:", error);
                    addNotification({
                        title: 'Erro',
                        message: 'Não foi possível carregar os dados do colaborador.',
                        type: 'error'
                    });
                }
            };
            fetchEmployee();
        }
    }, [id, addNotification]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put(`${ENDPOINTS.EMPLOYEES}/${id}`, {
                id: Number(id),
                nome: formData.nome,
                chapa: formData.chapa,
                funcao: formData.cargo,
                setor: formData.setor,
                email: formData.email,
                cpf: formData.cpf,
                cnpj: formData.cnpj,
                situacao: formData.status
            });

            addNotification({
                title: 'Perfil Atualizado',
                message: `As informações de ${formData.nome} foram atualizadas com sucesso.`,
                type: 'success'
            });
            router.push('/employees');
        } catch (error) {
            console.error("Erro ao atualizar colaborador:", error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível atualizar o colaborador.',
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
                    <h1 className="text-2xl font-bold tracking-tight">Editar Colaborador</h1>
                    <p className="text-sm text-muted-foreground">Atualize as informações do colaborador.</p>
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
                                        value={formData.nome}
                                        onChange={e => handleChange('nome', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Corporativo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input
                                        id="cpf"
                                        value={formData.cpf}
                                        onChange={e => handleChange('cpf', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input
                                        id="cnpj"
                                        value={formData.cnpj}
                                        onChange={e => handleChange('cnpj', e.target.value)}
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
                                    <Label htmlFor="cargo">Cargo</Label>
                                    <Input
                                        id="cargo"
                                        value={formData.cargo}
                                        onChange={e => handleChange('cargo', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="setor">Setor</Label>
                                    <Input
                                        id="setor"
                                        value={formData.setor}
                                        onChange={e => handleChange('setor', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="chapa">Matrícula / Chapa</Label>
                                    <Input
                                        id="chapa"
                                        value={formData.chapa}
                                        onChange={(e) => handleChange('chapa', e.target.value)}
                                        required
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
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
