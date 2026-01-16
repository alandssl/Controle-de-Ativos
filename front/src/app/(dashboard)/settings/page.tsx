'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess(false);

        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            setSuccess(true);
            handleCancel();
            setSuccess(true);
        }, 1500);
    };

    const handleCancel = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(false);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações de Conta</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gerencie suas credenciais de acesso.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <KeyRound className="h-5 w-5 text-primary" />
                        <CardTitle>Alterar Senha</CardTitle>
                    </div>
                    <CardDescription>
                        Para sua segurança, escolha uma senha forte e única.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {success && (
                            <Alert className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Sucesso!</AlertTitle>
                                <AlertDescription>
                                    Sua senha foi alterada com sucesso.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="current-password">Senha Atual</Label>
                            <Input
                                id="current-password"
                                type="password"
                                placeholder="Digite sua senha atual"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Digite a nova senha"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirme a nova senha"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-6 pb-6">
                        <div className="flex gap-4">
                            <Button type="button" variant="ghost" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Atualizar Senha'}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
