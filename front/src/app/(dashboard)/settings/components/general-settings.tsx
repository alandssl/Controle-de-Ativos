'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bell, Shield, Save } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { usePermissions } from '@/providers/permissions-provider';

export function GeneralSettings() {
    const { permissions, togglePermission } = usePermissions();
    const [loading, setLoading] = useState(false);

    const modules = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'assets', label: 'Ativos' },
        { key: 'movements', label: 'Movimentações' },
        { key: 'employees', label: 'Funcionários' },
        { key: 'scrap', label: 'Sucata' },
        { key: 'invoices', label: 'Notas Fiscais' },
    ];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 800));
        alert('Configurações salvas com sucesso!');
        setLoading(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle>Controle de Acesso (Admin)</CardTitle>
                    </div>
                    <CardDescription>Defina quais módulos estão visíveis para os usuários.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((module) => (
                            <div key={module.key} className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                <Label htmlFor={`perm-${module.key}`} className="flex flex-col space-y-1">
                                    <span>{module.label}</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        {permissions[module.key as keyof typeof permissions] ? 'Visível' : 'Oculto'}
                                    </span>
                                </Label>
                                <div
                                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${permissions[module.key as keyof typeof permissions] ? 'bg-primary' : 'bg-input'}`}
                                    onClick={() => togglePermission(module.key as any)}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${permissions[module.key as keyof typeof permissions] ? 'translate-x-4' : ''}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Perfil do Usuário</CardTitle>
                    </div>
                    <CardDescription>Suas informações pessoais e de contato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" defaultValue="Administrador do Sistema" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="admin@tecal.com.br" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Input id="cargo" defaultValue="Gerente de TI" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="departamento">Departamento</Label>
                            <Input id="departamento" defaultValue="Tecnologia da Informação" disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <CardTitle>Notificações</CardTitle>
                    </div>
                    <CardDescription>Escolha como você quer ser notificado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notif-email" className="flex flex-col space-y-1">
                            <span>Alertas por Email</span>
                            <span className="font-normal text-xs text-muted-foreground">Receba atualizações importantes via email.</span>
                        </Label>
                        <Select disabled>
                            {/* Simplified Select for brevity/mock since UI component needs Children */}
                            <option value="enabled">Ativado</option>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                    <Save className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
