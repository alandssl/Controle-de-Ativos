'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api, ENDPOINTS } from '@/services/api';
import { NotaFiscal } from '@/types';

export default function InvoiceDetailsPage() {
    const params = useParams();
    const id = Number(params.id);
    const [invoice, setInvoice] = useState<NotaFiscal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await api.get(`${ENDPOINTS.INVOICES}/${id}`);
                setInvoice(data);
            } catch (error) {
                console.error("Erro ao buscar nota fiscal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <p className="text-muted-foreground">Carregando detalhes da nota fiscal...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <h2 className="text-xl font-semibold text-muted-foreground">Nota Fiscal não encontrada</h2>
                <Link href="/invoices">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Lista
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/invoices">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        Nota Fiscal {invoice.numero}
                        <Badge variant="outline" className="ml-2">
                            {invoice.fornecedorNome}
                        </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Emitida em {new Date(invoice.dataEmissao).toLocaleDateString()}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-muted-foreground block">Valor Total</span>
                    <span className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.valorTotal)}
                    </span>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <CardTitle>Itens da Nota (Equipamentos)</CardTitle>
                    </div>
                    <CardDescription>Produtos e equipamentos vinculados a esta nota.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patrimônio</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-[100px] text-center">Qtd</TableHead>
                                <TableHead className="w-[150px] text-right">Valor Unit.</TableHead>
                                <TableHead className="w-[150px] text-right">Total Item</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.equipamentos && invoice.equipamentos.length > 0 ? invoice.equipamentos.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.patrimonio}</TableCell>
                                    <TableCell>{item.descricao || item.modelo}</TableCell>
                                    <TableCell className="text-center">1</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor || 0)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor || 0)}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Nenhum equipamento vinculado a esta nota.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
