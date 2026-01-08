'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Briefcase,
    Building2,
    Smartphone,
    Laptop,
    History,
    FileSignature,
    CheckCircle2,
    Calendar,
    Mail,
    IdCard,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { mockColaboradores, mockMovimentacoes, mockAtivos } from '@/lib/data';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EmployeeDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const empId = parseInt(resolvedParams.id);
    const employee = mockColaboradores.find(c => c.id === empId);
    const [generatingTerm, setGeneratingTerm] = useState(false);
    const [lastContractDate, setLastContractDate] = useState(employee?.last_contract_date);

    if (!employee) {
        notFound();
    }

    // Get all movements for this employee
    const movements = mockMovimentacoes.filter(m => m.idColaborador === empId);

    // Find current assets: For each asset, check if the LAST movement for it was to this employee
    const currentAssets = mockAtivos.filter(asset => {
        const assetMovements = mockMovimentacoes
            .filter(m => m.idAtivo === asset.id)
            .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime());

        return assetMovements.length > 0 &&
            assetMovements[0].idColaborador === empId &&
            assetMovements[0].tipoDesc === 'Saida';
    });

    const isContractUpdated = () => {
        if (!lastContractDate) return false;
        const lastMov = movements.sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime())[0];
        if (!lastMov) return true;
        return new Date(lastContractDate) >= new Date(lastMov.dataMovimento);
    };

    const handleGenerateTerm = async () => {
        setGeneratingTerm(true);
        // Simulate generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLastContractDate(new Date().toISOString());
        setGeneratingTerm(false);
        alert('Termo de Responsabilidade gerado com sucesso!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/employees">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{employee.nome}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline">{employee.setor}</Badge>
                            {employee.funcao}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/employees/${employee.id}/edit`}>
                        <Button variant="outline">Editar Perfil</Button>
                    </Link>
                    <Button
                        onClick={handleGenerateTerm}
                        disabled={generatingTerm}
                        className="bg-primary text-primary-foreground"
                    >
                        <FileSignature className="mr-2 h-4 w-4" />
                        {generatingTerm ? 'Gerando...' : 'Gerar Novo Termo'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Column 1: Profile Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Dados do Funcionário</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Matrícula / Chapa</p>
                                    <p className="font-medium">{employee.chapa}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Email</p>
                                    <p className="font-medium">{employee.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Setor</p>
                                    <p className="font-medium">{employee.setor}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-muted-foreground text-xs">Cargo</p>
                                    <p className="font-medium">{employee.funcao}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted-foreground">Estado do Termo</span>
                                    {isContractUpdated() ? (
                                        <Badge className="bg-green-500 hover:bg-green-600">Atualizado</Badge>
                                    ) : (
                                        <Badge variant="destructive">Desatualizado</Badge>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Último termo assinado em: {lastContractDate ? new Date(lastContractDate).toLocaleDateString() : 'Nunca'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Situação Cadastral</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Status Atual</span>
                                <Badge variant={employee.situacao === 'ATIVO' ? 'default' : 'secondary'}>
                                    {employee.situacao}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2 & 3: Assets and History */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Laptop className="h-5 w-5" />
                                Ativos Atribuídos
                            </CardTitle>
                            <CardDescription>Equipamentos que estão sob responsabilidade deste funcionário.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {currentAssets.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patrimônio</TableHead>
                                            <TableHead>Modelo</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentAssets.map(asset => (
                                            <TableRow key={asset.id}>
                                                <TableCell className="font-medium">{asset.patrimonio}</TableCell>
                                                <TableCell>{asset.modelo}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{asset.status_desc}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/assets/${asset.id}`}>
                                                        <Button variant="ghost" size="sm">Ver Ativo</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border-2 border-dashed">
                                    <Laptop className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-sm text-muted-foreground font-medium">Nenhum ativo atribuído.</p>
                                    <p className="text-xs text-muted-foreground">Realize uma entrega (check-out) para associar equipamentos.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Histórico de Movimentações
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {movements.length > 0 ? (
                                <div className="space-y-4">
                                    {movements
                                        .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime())
                                        .map(mov => {
                                            const asset = mockAtivos.find(a => a.id === mov.idAtivo);
                                            return (
                                                <div key={mov.id} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/10">
                                                    <div className={`mt-1 p-2 rounded-full ${mov.tipoDesc === 'Saida' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                        {mov.tipoDesc === 'Saida' ? <Laptop className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="text-sm font-bold">
                                                                {mov.tipoDesc === 'Saida' ? 'Entrega de Equipamento' : 'Devolução de Equipamento'}
                                                            </h4>
                                                            <span className="text-[10px] text-muted-foreground font-mono">#{mov.id}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            {asset?.patrimonio} - {asset?.modelo}
                                                        </p>
                                                        <p className="text-xs italic text-muted-foreground/80 leading-snug">
                                                            "{mov.obs}"
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-muted">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {new Date(mov.dataMovimento).toLocaleDateString()} às {new Date(mov.dataMovimento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <Link href={`/movements/${mov.id}`} className="ml-auto">
                                                                <Button variant="ghost" size="xs">Detalhes</Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <p className="text-sm text-center py-4 text-muted-foreground">Nenhuma movimentação para este colaborador.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
