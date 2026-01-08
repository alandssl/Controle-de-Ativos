'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, AlertCircle, CheckCircle2, Package, ArrowRight, Activity } from "lucide-react";
import { Ativo, Movimentacao } from "@/types";
import { api, ENDPOINTS } from '@/services/api';

export default function Home() {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ativosData, movData] = await Promise.all([
          api.get(ENDPOINTS.ASSETS),
          api.get(ENDPOINTS.MOVEMENTS)
        ]);

        setAtivos(ativosData.content ?? ativosData);
        setMovimentacoes(movData.content ?? movData);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Stats
  const totalAtivos = ativos.length;
  const emUso = ativos.filter(a => a.status_desc === 'Em Uso').length;
  const disponivel = ativos.filter(a => a.status_desc === 'Disponível' || a.status_desc === 'Novo').length;
  const sucata = ativos.filter(a => a.status_desc === 'Sucata' || a.status_desc === 'Em Manutenção').length;

  const currentDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Process recent movements for display
  const recentMovements = movimentacoes
    .sort((a, b) => new Date(b.dataMovimento).getTime() - new Date(a.dataMovimento).getTime())
    .slice(0, 5)
    .map(m => ({
      ...m,
      tipo_desc: m.observacao?.toLowerCase().includes('entrada') ? 'Entrada' : 'Saida',
      display_date: new Date(m.dataMovimento).toLocaleDateString()
    }));

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Geral</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visão estratégica dos ativos de TI e movimentações recentes.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground capitalize">{currentDate}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Ativos Card */}
        <Link href="/assets" className="no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary cursor-pointer relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Laptop className="h-24 w-24 translate-x-4 -translate-y-4" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Total de Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tabular-nums">{totalAtivos}</div>
              <div className="flex items-center text-xs text-emerald-500 mt-1 font-medium">
                <ArrowRight className="h-3 w-3 mr-1 rotate-45" /> Gerenciar
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Em Uso Card */}
        <Link href="/assets?status=Em Uso" className="cursor-pointer no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 cursor-pointer relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="h-24 w-24 translate-x-4 -translate-y-4 text-blue-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Em Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tabular-nums">{emUso}</div>
              <p className="text-xs text-muted-foreground mt-1">{(totalAtivos > 0 ? emUso / totalAtivos * 100 : 0).toFixed(0)}% do inventário</p>
            </CardContent>
          </Card>
        </Link>

        {/* Disponíveis Card */}
        <Link href="/assets?status=Disponível" className="cursor-pointer no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500 cursor-pointer relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="h-24 w-24 translate-x-4 -translate-y-4 text-emerald-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tabular-nums">{disponivel}</div>
              <p className="text-xs text-emerald-500 mt-1 font-medium">Prontos para uso</p>
            </CardContent>
          </Card>
        </Link>

        {/* Sucata Card */}
        <Link href="/assets?status=Sucata" className="cursor-pointer no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-destructive cursor-pointer relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="h-24 w-24 translate-x-4 -translate-y-4 text-destructive" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Manutenção/Sucata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground tabular-nums">{sucata}</div>
              <p className="text-xs text-destructive mt-1 font-medium">Requer atenção</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <div className="space-y-1">
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas movimentações registradas no sistema.</CardDescription>
            </div>
            <Link href="/movements" className="no-underline">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                Ver histórico <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-card">
              {recentMovements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma movimentação recente.</div>
              ) : (
                recentMovements.map((mov, index) => (
                  <Link
                    key={mov.id}
                    href={`/movements/${mov.id}`}
                    className={`
                            flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors no-underline group border-l-2 border-l-transparent hover:border-l-primary
                            ${index !== recentMovements.length - 1 ? 'border-b' : ''}
                        `}>

                    <div className="flex items-center gap-4">
                      <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center border shadow-sm
                            ${mov.tipo_desc === 'Saida' ? 'bg-primary/10 border-primary/20' : 'bg-emerald-500/10 border-emerald-500/20'}
                        `}>
                        <CheckCircle2 className={`h-5 w-5 ${mov.tipo_desc === 'Saida' ? 'text-primary' : 'text-emerald-500'}`} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
                          {mov.observacao || 'Sem observação'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={`
                                px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                ${mov.tipo_desc === 'Saida' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-600'}
                            `}>
                            {mov.tipo_desc === 'Saida' ? 'Entrega' : 'Recebimento'}
                          </span>
                          <span>•</span>
                          <span>{mov.display_date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-bold ${mov.tipo_desc === 'Saida' ? 'text-muted-foreground' : 'text-emerald-600'}`}>
                        {mov.tipo_desc === 'Saida' ? '-1' : '+1'}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Status do Inventário</CardTitle>
            <CardDescription>Distribuição percentual dos ativos.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                  Em Uso (Ativos)
                </span>
                <span className="font-bold tabular-nums">{emUso} <span className="text-muted-foreground text-xs font-normal">/ {totalAtivos}</span></span>
              </div>
              <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-muted">
                <div
                  className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                  style={{ width: `${(totalAtivos > 0 ? emUso / totalAtivos * 100 : 0)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  Disponíveis (Estoque)
                </span>
                <span className="font-bold tabular-nums">{disponivel} <span className="text-muted-foreground text-xs font-normal">/ {totalAtivos}</span></span>
              </div>
              <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-muted">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${(totalAtivos > 0 ? disponivel / totalAtivos * 100 : 0)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  Sucata / Manutenção
                </span>
                <span className="font-bold tabular-nums">{sucata} <span className="text-muted-foreground text-xs font-normal">/ {totalAtivos}</span></span>
              </div>
              <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden border border-muted">
                <div
                  className="h-full bg-destructive transition-all duration-1000 ease-out"
                  style={{ width: `${(totalAtivos > 0 ? sucata / totalAtivos * 100 : 0)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="rounded-lg bg-muted/30 p-4 border border-dashed text-center">
                <p className="text-xs text-muted-foreground">
                  Capacidade total do inventário: <span className="font-bold text-foreground">{totalAtivos}</span> itens cadastrados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
