'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPecas } from '@/lib/data';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditScrapPartPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const partId = parseInt(resolvedParams.id);
    const part = mockPecas.find(p => p.id === partId);
    const [loading, setLoading] = useState(false);

    if (!part) {
        notFound();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Peça atualizada com sucesso! (Simulação)');
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href={`/scrap/${partId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Peça</h1>
                    <p className="text-sm text-muted-foreground">Atualize as informações da peça recuperada.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Peça</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Componente</Label>
                            <Input id="nome" defaultValue={part.nome} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serial">Número de Série (SN)</Label>
                            <Input id="serial" defaultValue={part.serial} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select defaultValue={part.status}>
                                <option value="Disponivel">Disponível</option>
                                <option value="Reservado">Reservado</option>
                                <option value="Utilizada">Utilizada</option>
                                <option value="Sucata">Sucata (Descartar)</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-6 flex justify-end gap-2">
                    <Link href={`/scrap/${partId}`}>
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
