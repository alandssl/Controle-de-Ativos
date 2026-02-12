'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api, ENDPOINTS } from '@/services/api';
import { Ativo } from "@/types";

import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function ReportsPage() {
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(ENDPOINTS.ASSETS);
                const data = response.content ?? response;
                setAtivos(data);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Cálculos Estatísticos ---

    const total = ativos.length;

    // Em Uso (Equivalente a "Em Aberto" no design original - Cor Azul)
    const emUso = ativos.filter(a =>
        a.status_desc?.toLowerCase() === 'em uso' ||
        a.status?.descricao?.toLowerCase() === 'em uso'
    );
    const emUsoCount = emUso.length;
    const emUsoPct = total > 0 ? Math.round((emUsoCount / total) * 100) : 0;

    // Disponível (Equivalente a "Em Andamento" - Cor Amarela/Laranja)
    const disponivel = ativos.filter(a =>
        ['disponível', 'novo'].includes(a.status_desc?.toLowerCase() || '') ||
        ['disponível', 'novo'].includes(a.status?.descricao?.toLowerCase() || '')
    );
    const disponivelCount = disponivel.length;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const disponivelPct = total > 0 ? Math.round((disponivelCount / total) * 100) : 0;

    // Manutenção/Sucata (Equivalente a "Resolvido" - Cor Verde (ou Vermelho para alerta))
    // No design original "Resolvido" é Verde. Vamos manter Verde para "Outros/Manutenção" ou talvez inverter a lógica para fazer sentido semântico.
    const outros = ativos.filter(a =>
        !['em uso', 'disponível', 'novo'].includes(a.status_desc?.toLowerCase() || '') &&
        !['em uso', 'disponível', 'novo'].includes(a.status?.descricao?.toLowerCase() || '')
    );
    const outrosCount = outros.length;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const outrosPct = total > 0 ? Math.round((outrosCount / total) * 100) : 0;


    // Distribuição por Tipo (Mapping to "Distribuição por Departamento")
    const porTipo = ativos.reduce((acc, curr) => {
        const tipo = curr.tipoEquipamento?.tipo || 'Outros';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedTipos = Object.entries(porTipo)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => ({
            name: key,
            count: value,
            pct: total > 0 ? Math.round((value / total) * 100) : 0
        }));

    // Distribuição por Status
    const porStatus = ativos.reduce((acc, curr) => {
        const st = curr.status?.descricao || curr.status_desc || 'Desconhecido';
        acc[st] = (acc[st] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedStatus = Object.entries(porStatus)
        .sort(([, a], [, b]) => b - a)
        .map(([key, value]) => ({
            name: key,
            count: value,
            pct: total > 0 ? Math.round((value / total) * 100) : 0
        }));

    // Recentes
    const recentes = [...ativos].sort((a, b) => b.id - a.id).slice(0, 5);

    // Colors mapping for statuses (Recharts uses Hex)
    const getStatusColorRecharts = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('uso')) return '#3b82f6'; // blue-500
        if (n.includes('dispon')) return '#eab308'; // yellow-500
        if (n.includes('manuten') || n.includes('sucata')) return '#22c55e'; // green-500
        return '#6b7280'; // gray-500
    };

    // Keep old helper if used elsewhere (Table), or update it.
    // The Table uses `getStatusColor` returning Tailwind classes.
    const getStatusColor = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('uso')) return 'bg-blue-500';
        if (n.includes('dispon')) return 'bg-yellow-500'; // Or orange
        if (n.includes('manuten') || n.includes('sucata')) return 'bg-green-500'; // Following chart logic
        return 'bg-gray-500';
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse">Carregando relatórios...</div>;
    }

    return (
        <div className="space-y-8 p-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios</h1>
                <div className="w-full sm:w-[200px]">
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="todos">Todo o período</option>
                        <option value="mes">Este Mês</option>
                        <option value="ano">Este Ano</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-slate-900">{total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-900">Em Uso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600">{emUsoCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">{emUsoPct}% do total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-900">Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-yellow-600">{disponivelCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">{disponivelPct}% do total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-900">Manutenção / Outros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">{outrosCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">{outrosPct}% do total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Section: Distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribuição por Tipo (Left Panel) */}
                <Card className="border-none shadow-sm ring-1 ring-slate-200 h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Distribuição por Tipo</CardTitle>
                        <CardDescription>Ativos agrupados por categoria</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={sortedTipos} margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} interval={0} />
                                <Tooltip
                                    formatter={(value: number | undefined) => [value || 0, 'Qtd']}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {sortedTipos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Distribuição por Status (Right Panel) */}
                <Card className="border-none shadow-sm ring-1 ring-slate-200 h-[400px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Distribuição por Status</CardTitle>
                        <CardDescription>Ativos agrupados por status operacional</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={sortedStatus} margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} interval={0} />
                                <Tooltip
                                    formatter={(value: number | undefined) => [value || 0, 'Qtd']}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {sortedStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getStatusColorRecharts(entry.name)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Table */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Ativos Recentes</CardTitle>
                    <CardDescription>Últimos ativos cadastrados no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Patrimônio</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data Aquisição</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentes.map((ativo) => (
                                <TableRow key={ativo.id}>
                                    <TableCell className="font-medium text-blue-600">#{ativo.id}</TableCell>
                                    <TableCell>{ativo.modelo}</TableCell>
                                    <TableCell>{ativo.tipoEquipamento?.tipo}</TableCell>
                                    <TableCell>{ativo.patrimonio}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`${getStatusColor(ativo.status?.descricao || '')} text-white hover:opacity-90`}
                                        >
                                            {ativo.status?.descricao || ativo.status_desc || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {ativo.data_aquisicao
                                            ? new Date(ativo.data_aquisicao).toLocaleDateString()
                                            : '-'
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
