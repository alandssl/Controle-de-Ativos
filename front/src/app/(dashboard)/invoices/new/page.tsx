'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

import { useRouter } from 'next/navigation';
import { useNotifications } from '@/providers/notification-provider';
import { mockNotasFiscais } from '@/lib/data';

export default function NewInvoicePage() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const { addNotification } = useNotifications();
    const router = useRouter();

    const handleAddItem = () => {
        setItems([...items, { descricao: '', qtd: 1, valor: 0 }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Get form data
        const formData = new FormData(e.target as HTMLFormElement);
        const numero = formData.get('numero') as string;
        const fornecedor = formData.get('fornecedor') as string;
        const valor_total = parseFloat(formData.get('valor_total') as string || '0');
        const data_emissao = formData.get('data_emissao') as string;

        // Create Blob URL for the file
        const arquivo_url = file ? URL.createObjectURL(file) : '';

        await new Promise(resolve => setTimeout(resolve, 800));

        // Add to mock data
        const newId = Math.max(...mockNotasFiscais.map(n => n.id)) + 1;
        mockNotasFiscais.unshift({
            id: newId,
            numero,
            fornecedor,
            data_emissao,
            valor_total,
            arquivo_url
        });

        addNotification({
            title: 'Nova Nota Fiscal',
            message: 'Uma nova NF foi registrada e processada.',
            type: 'success'
        });

        setLoading(false);
        router.push('/invoices');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/invoices">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nova Nota Fiscal</h1>
                    <p className="text-sm text-muted-foreground">Cadastre a NF e seus itens.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados da Nota</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Linha 1: Número, Série, Chave de Acesso */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número NF</Label>
                                    <Input id="numero" placeholder="000.000.000" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serie">Série</Label>
                                    <Input id="serie" placeholder="1" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="chave">Chave de Acesso</Label>
                                    <Input id="chave" placeholder="44 dígitos..." />
                                </div>
                            </div>

                            {/* Linha 2: Datas e Valor */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data_emissao">Data de Emissão</Label>
                                    <Input id="data_emissao" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_entrada">Data de Entrada</Label>
                                    <Input id="data_entrada" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_entrega">Data de Entrega</Label>
                                    <Input id="data_entrega" type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="valor_total">Valor Total</Label>
                                    <Input id="valor_total" placeholder="R$ 0,00" />
                                </div>
                            </div>

                            {/* Linha 3: Fornecedor */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="fornecedor">Razão Social Fornecedor</Label>
                                    <Input id="fornecedor" placeholder="Nome da empresa" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj_fornecedor">CNPJ Fornecedor</Label>
                                    <Input id="cnpj_fornecedor" placeholder="00.000.000/0000-00" />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="endereco_fornecedor">Endereço Fornecedor</Label>
                                    <Input id="endereco_fornecedor" placeholder="Endereço completo" />
                                </div>
                            </div>

                            {/* Linha 4: Arquivo PDF */}
                            <div className="space-y-2">
                                <Label htmlFor="arquivo">Arquivo da NF (PDF)</Label>
                                <Input
                                    id="arquivo"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.type !== 'application/pdf') {
                                                alert('Por favor, selecione apenas arquivos PDF.');
                                                e.target.value = ''; // Reset
                                                setFile(null);
                                            } else {
                                                setFile(file);
                                            }
                                        }
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">Apenas arquivos PDF são permitidos.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Itens da Nota</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {items.length > 0 ? (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Descrição</TableHead>
                                                <TableHead className="w-[100px]">Qtd</TableHead>
                                                <TableHead className="w-[150px]">Valor Unit.</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Input placeholder="Descrição do produto" className="border-0 shadow-none focus-visible:ring-0" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" defaultValue={1} className="border-0 shadow-none focus-visible:ring-0" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input type="number" placeholder="0,00" step="0.01" className="border-0 shadow-none focus-visible:ring-0" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-md">
                                    Nenhum item adicionado.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Link href="/invoices">
                            <Button type="button" variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Nota Fiscal'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
