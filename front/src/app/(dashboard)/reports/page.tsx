'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, DollarSign, TrendingUp, TrendingDown, Package } from "lucide-react";
import { api, ENDPOINTS } from '@/services/api';
import { Ativo, Movimentacao, NotaFiscal, PecaSucata } from "@/types";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// Cores para os gráficos (Palette elegante)
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
    const [ativos, setAtivos] = useState<Ativo[]>([]);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
    const [sucata, setSucata] = useState<PecaSucata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ativosData, movData, nfData, sucataData] = await Promise.all([
                    api.get(ENDPOINTS.ASSETS),
                    api.get(ENDPOINTS.MOVEMENTS),
                    api.get(ENDPOINTS.INVOICES),
                    api.get(ENDPOINTS.SCRAP)
                ]);

                setAtivos(ativosData.content ?? ativosData);
                setMovimentacoes(movData.content ?? movData);
                setNotasFiscais(nfData.content ?? nfData);
                setSucata(sucataData.content ?? sucataData);

            } catch (error) {
                console.error("Failed to fetch data for reports", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Processamento de Dados para Gráficos ---

    // 1. Ativos por Tipo (Pie Chart)
    const ativosPorTipo = ativos.reduce((acc, curr) => {
        const tipo = curr.tipoEquipamento?.tipo || 'Outros';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dataAtivosPorTipo = Object.keys(ativosPorTipo).map(key => ({
        name: key,
        value: ativosPorTipo[key]
    })).sort((a, b) => b.value - a.value);

    // 2. Movimentações por Mês (Bar Chart / Line Chart) - Últimos 6 meses
    // Simulação: Agrupar por data real
    const dataMovimentacoesTime = movimentacoes.reduce((acc, curr) => {
        const date = new Date(curr.dataMovimento);
        const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

        if (!acc[monthYear]) {
            acc[monthYear] = { name: monthYear, entradas: 0, saidas: 0 };
        }

        const isEntrada = curr.observacao?.toLowerCase().includes('entrada');
        if (isEntrada) acc[monthYear].entradas += 1;
        else acc[monthYear].saidas += 1;

        return acc;
    }, {} as Record<string, any>);

    // Converter para array e ordenar (simplificado - assumindo ordem de inserção ou sorting manual se necessário)
    // Para garantir ordem cronológica seria necessário lógica extra, vou usar slice dos últimos items
    const chartMovimentacoesData = Object.values(dataMovimentacoesTime).slice(-6);

    // 3. Investimento por Fornecedor (Top 5)
    const investimentoPorFornecedor = notasFiscais.reduce((acc, curr) => {
        const fornecedor = curr.fornecedorNome || 'Desconhecido';
        acc[fornecedor] = (acc[fornecedor] || 0) + (curr.valorTotal || 0);
        return acc;
    }, {} as Record<string, number>);

    const dataInvestimento = Object.keys(investimentoPorFornecedor).map(key => ({
        name: key,
        value: investimentoPorFornecedor[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5);


    // Stats Summaries
    const totalAtivos = ativos.length;
    const emUsoChart = ativos.filter(a => a.status_desc === 'Em Uso').length;
    const disponivelChart = ativos.filter(a => a.status_desc === 'Disponível' || a.status_desc === 'Novo').length;
    const sucataChart = ativos.filter(a => a.status_desc === 'Sucata' || a.status_desc === 'Em Manutenção').length;

    const recentMovements = movimentacoes
        .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime())
        .slice(0, 5)
        .map(m => ({
            ...m,
            tipo_desc: m.observacao?.toLowerCase().includes('entrada') ? 'Entrada' : 'Saida',
            display_date: new Date(m.dataMovimento).toLocaleDateString()
        }));


    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando dashboards e relatórios...</div>;
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Relatórios Gerenciais</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Análise completa com métricas, gráficos e histórico.
                </p>
            </div>

            {/* Linha 1: Gráficos Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Gráfico 1: Ativos por Tipo */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-2">
                        <CardTitle className="text-base font-medium">Distribuição por Tipo</CardTitle>
                        <CardDescription>Volume de ativos por categoria</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0 min-h-[250px]">
                        <div className="h-[250px] w-full">
                            {dataAtivosPorTipo.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dataAtivosPorTipo}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {dataAtivosPorTipo.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: number | undefined) => [value ?? 0, 'Qtd']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados suficientes</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Gráfico 2: Movimentações (Entradas vs Saídas) */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-2">
                        <CardTitle className="text-base font-medium">Movimentações Recentes</CardTitle>
                        <CardDescription>Entradas vs Saídas por período</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0 min-h-[250px]">
                        <div className="h-[250px] w-full">
                            {chartMovimentacoesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartMovimentacoesData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem movimentações registradas</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Gráfico 3: Top Fornecedores (Investimento) */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-2">
                        <CardTitle className="text-base font-medium">Top Fornecedores</CardTitle>
                        <CardDescription>Maior volume de investimento (R$)</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0 min-h-[250px]">
                        <div className="h-[250px] w-full">
                            {dataInvestimento.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={dataInvestimento} margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} fontSize={11} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            formatter={(value: number | undefined) => [`R$ ${value?.toLocaleString() ?? '0'}`, 'Total']}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                                            {dataInvestimento.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados financeiros</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Linha 2: KPI Stats (Status Inventário) e Lista Recente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Status KPI Card (Refatorado para ser mais compacto) */}
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            Status Geral
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Em Uso</span>
                                <span className="font-bold text-foreground">{emUsoChart}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${totalAtivos ? (emUsoChart / totalAtivos) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Estoque</span>
                                <span className="font-bold text-foreground">{disponivelChart}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${totalAtivos ? (disponivelChart / totalAtivos) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Manutenção/Sucata</span>
                                <span className="font-bold text-foreground">{sucataChart}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${totalAtivos ? (sucataChart / totalAtivos) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Total de Ativos</span>
                            <span className="font-bold text-xl">{totalAtivos}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Atividades Recentes (Ocupando 2 colunas) */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-medium">Histórico Recente</CardTitle>
                            <CardDescription>Últimas 5 movimentações do sistema</CardDescription>
                        </div>
                        <Link href="/movements">
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                Ver tudo <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {recentMovements.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma movimentação.</div>
                            ) : (
                                recentMovements.map((mov) => (
                                    <div key={mov.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                h-8 w-8 rounded-full flex items-center justify-center border
                                                ${mov.tipo_desc === 'Saida' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}
                                            `}>
                                                {mov.tipo_desc === 'Saida' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{mov.observacao || 'Movimentação'}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{mov.display_date}</p>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded-full ${mov.tipo_desc === 'Saida' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {mov.tipo_desc === 'Saida' ? 'Saída' : 'Entrada'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
