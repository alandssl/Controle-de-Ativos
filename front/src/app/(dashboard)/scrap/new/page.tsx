'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { mockAtivos } from '@/lib/data';

import { useNotifications } from '@/providers/notification-provider';

export default function NewScrapPage() {
    const [loading, setLoading] = useState(false);
    const [parts, setParts] = useState<any[]>([]);
    const { addNotification } = useNotifications();

    const handleAddPart = () => {
        setParts([...parts, { name: '', serial: '', status: 'Disponivel' }]);
    };

    const handleRemovePart = (index: number) => {
        const newParts = [...parts];
        newParts.splice(index, 1);
        setParts(newParts);
    };

    const handlePartChange = (index: number, field: string, value: string) => {
        const newParts = [...parts];
        newParts[index][field] = value;
        setParts(newParts);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        addNotification({
            title: 'Descarte Realizado',
            message: 'O equipamento foi movido para sucata e as peças foram catalogadas.',
            type: 'warning'
        });
        alert('Descarte registrado com sucesso!');
        setLoading(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/scrap">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Registrar Descarte</h1>
                    <p className="text-sm text-muted-foreground">Registre o descarte de um ativo e as peças recuperadas.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Descarte</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ativo">Ativo</Label>
                                <Select id="ativo" defaultValue="">
                                    <option value="" disabled>Selecione um ativo...</option>
                                    {mockAtivos.map(asset => (
                                        <option key={asset.id} value={asset.id}>
                                            {asset.patrimonio} - {asset.modelo}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data">Data do Descarte</Label>
                                    <Input id="data" type="date" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tecnico">Técnico Responsável</Label>
                                    <Input id="tecnico" placeholder="Nome do técnico" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivo">Motivo / Laudo Técnico</Label>
                                <Textarea id="motivo" placeholder="Descreva o motivo do descarte..." className="min-h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Peças Recuperadas</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddPart}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Peça
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {parts.length > 0 ? (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome da Peça</TableHead>
                                                <TableHead>Serial Number</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-[50px]"><span className="sr-only">Ações</span></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parts.map((part, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Input
                                                            value={part.name}
                                                            onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                                                            placeholder="Ex: Memória RAM 8GB"
                                                            className="border-0 shadow-none focus-visible:ring-0"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={part.serial}
                                                            onChange={(e) => handlePartChange(index, 'serial', e.target.value)}
                                                            placeholder="SN123456"
                                                            className="border-0 shadow-none focus-visible:ring-0"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={part.status}
                                                            onChange={(e) => handlePartChange(index, 'status', e.target.value)}
                                                            className="border-0 shadow-none focus-visible:ring-0 h-auto py-0"
                                                        >
                                                            <option value="Disponivel">Disponível</option>
                                                            <option value="Reservado">Reservado</option>
                                                            <option value="Sucata">Sucata</option>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            onClick={() => handleRemovePart(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md">
                                    Nenhuma peça recuperada adicionada.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Link href="/scrap">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Confirmar Descarte'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
