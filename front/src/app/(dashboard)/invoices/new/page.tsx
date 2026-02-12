'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

import { useRouter } from 'next/navigation';
import { useNotifications } from '@/providers/notification-provider';
import { api, ENDPOINTS } from '@/services/api';

export default function NewInvoicePage() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [supplierNames, setSupplierNames] = useState<string[]>([]);
    const [invoiceNumbers, setInvoiceNumbers] = useState<string[]>([]);
    const [hasWarranty, setHasWarranty] = useState(false);

    const { addNotification } = useNotifications();
    const router = useRouter();

    useEffect(() => {
        api.get(ENDPOINTS.SUPPLIER_NAMES).then(setSupplierNames).catch(console.error);
        api.get(ENDPOINTS.INVOICE_NUMBERS).then(setInvoiceNumbers).catch(console.error);
    }, []);

    const handleAddItem = () => {
        setItems([...items, { descricao: '', qtd: 1, valor: 0 }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get form data
            const formData = new FormData(e.target as HTMLFormElement);

            // Construct payload matching NotaFiscalRequest DTO
            const payload = {
                numero: (formData.get('numero') as string),
                serie: (formData.get('serie') as string) || null,
                dataEmissao: formData.get('data_emissao') as string,
                dataEntrada: formData.get('data_entrada') as string,
                valorTotal: parseFloat(formData.get('valor_total') as string || '0'),
                fornecedorNome: (formData.get('fornecedor_nome') as string).trim(),
                fornecedorCnpj: (formData.get('fornecedor_cnpj') as string) || null,
                fornecedorEndereco: (formData.get('endereco_fornecedor') as string) || null,
                chaveAcesso: (formData.get('chave_acesso') as string) || null,
                observacoes: '',
                garantia: hasWarranty,
                dataValidadeGarantia: hasWarranty ? (formData.get('data_validade_garantia') as string) : null
            };

            // 1. Create Invoice
            const createdInvoice = await api.post(ENDPOINTS.INVOICES, payload);

            // 2. Upload File (if exists)
            if (file && createdInvoice.id) {
                const fileFormData = new FormData();
                fileFormData.append('file', file);

                await api.post(`${ENDPOINTS.INVOICES}/${createdInvoice.id}/anexo`, fileFormData);
            }

            addNotification({
                title: 'Sucesso',
                message: 'Nota Fiscal criada com sucesso.',
                type: 'success'
            });

            router.push('/invoices');

        } catch (error: any) {
            console.error("Erro ao salvar nota fiscal:", error);
            addNotification({
                title: 'Erro',
                message: error.message || 'Erro ao salvar a nota fiscal.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
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
                                    <Input id="numero" name="numero" placeholder="000.000.000" list="invoice-numbers" required />
                                    <datalist id="invoice-numbers">
                                        {invoiceNumbers.map((num, i) => (
                                            <option key={i} value={num} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serie">Série</Label>
                                    <Input id="serie" name="serie" placeholder="1" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="chave">Chave de Acesso</Label>
                                    <Input id="chave_acesso" name="chave_acesso" placeholder="44 dígitos..." />
                                </div>
                            </div>

                            {/* Linha 2: Datas e Valor */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data_emissao">Data de Emissão</Label>
                                    <Input id="data_emissao" name="data_emissao" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_entrada">Data de Entrada</Label>
                                    <Input id="data_entrada" name="data_entrada" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="valor_total">Valor Total</Label>
                                    <Input id="valor_total" name="valor_total" placeholder="R$ 0,00" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Label htmlFor="garantia" className="cursor-pointer">Garantia?</Label>
                                        <input
                                            type="checkbox"
                                            id="garantia"
                                            name="garantia"
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer border"
                                            checked={hasWarranty}
                                            onChange={(e) => setHasWarranty(e.target.checked)}
                                        />
                                    </div>
                                    {hasWarranty && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Label htmlFor="data_validade_garantia" className="text-xs">Validade Garantia</Label>
                                            <Input id="data_validade_garantia" name="data_validade_garantia" type="date" required={hasWarranty} className="mt-1" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Linha 3: Fornecedor */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="fornecedor">Nome do Fornecedor</Label>
                                    <Input
                                        id="fornecedor_nome"
                                        name="fornecedor_nome"
                                        placeholder="Digite o nome ou selecione"
                                        list="supplier-names"
                                        required
                                        autoComplete="off"
                                    />
                                    <datalist id="supplier-names">
                                        {supplierNames.map((name, i) => (
                                            <option key={i} value={name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fornecedor_cnpj">CNPJ Fornecedor</Label>
                                    <Input id="fornecedor_cnpj" name="fornecedor_cnpj" placeholder="00.000.000/0000-00" />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="endereco_fornecedor">Endereço Fornecedor</Label>
                                    <Input id="endereco_fornecedor" name="endereco_fornecedor" placeholder="Endereço completo" />
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
