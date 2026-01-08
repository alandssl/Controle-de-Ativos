'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/providers/notification-provider';
import { Ativo, Colaborador } from '@/types';
import { api, ENDPOINTS } from '@/services/api';

export default function NewMovementPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Estados para os dados
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo_movimento: 'Saida',
    ativo: '',
    colaborador: '',
    data: '',
    valor: '',
    obs: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [ativosResponse, colabResponse] = await Promise.all([
          api.get(ENDPOINTS.ASSETS),
          api.get(ENDPOINTS.EMPLOYEES)
        ]);

        setAtivos(ativosResponse.content ?? ativosResponse);
        setColaboradores(colabResponse.content ?? colabResponse);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        addNotification({
          title: 'Erro',
          message: 'Erro ao carregar os dados.',
          type: 'error'
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Se for o input de valor, garantir que é número ou string válida
    let updatedData = { ...formData, [name]: value };

    // Regra de Negócio: 
    // - Sem colaborador (Estoque) -> Entrada (Devolução)
    // - Com colaborador -> Saida (Entrega/Transferência)
    if (name === 'colaborador') {
      if (value === '') {
        // Se ficou vazio, não faz nada automático pois pode ser o checkbox controlando
      } else {
        // Se o usuário selecionou alguém manualmente, com certeza é Saída
        updatedData.tipo_movimento = 'Saida';
      }
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedAssetId = Number(formData.ativo);
    const selectedColabId = Number(formData.colaborador);

    const selectedAsset = ativos.find(a => a.id === selectedAssetId);
    const selectedColab = colaboradores.find(c => c.id === selectedColabId);

    const payload = {
      tipoMovimento: formData.tipo_movimento,
      dataMovimento: formData.data ? formData.data : new Date().toISOString(), // Se não preencher, usa data atual
      observacao: formData.obs,
      valor: formData.valor ? Number(formData.valor) : 0,
      tipo: { tipo: selectedAsset?.tipoEquipamento?.tipo || 'Outros' },
      idEquipamento: {
        id: selectedAssetId
      },
      idColaborador: {
        id: selectedColabId
      },
      setor: selectedColab?.setor
    };

    try {
      await api.post(ENDPOINTS.MOVEMENTS, payload);

      addNotification({
        title: 'Sucesso',
        message: 'Movimentação criada com sucesso.',
        type: 'success'
      });

      router.push('/movements');
    } catch (error) {
      console.error('Erro ao criar:', error);
      addNotification({
        title: 'Erro',
        message: 'Não foi possível criar a movimentação.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="p-8 text-center">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/movements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Movimentação</h1>
          <p className="text-sm text-muted-foreground">
            Registre entrega ou devolução de ativos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Movimentação</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* TIPO */}
            <div className="space-y-2">
              <Label htmlFor="tipo_movimento">Tipo de Operação</Label>
              <select
                id="tipo_movimento"
                name="tipo_movimento"
                value={formData.tipo_movimento}
                onChange={handleChange}
                disabled={true}
                className="w-full border rounded px-3 py-2 disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="Saida">Entrega (Saída)</option>
                <option value="Entrada">Devolução (Entrada)</option>
              </select>
              {formData.colaborador === '' && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  * Devoluções para o estoque são sempre entradas.
                </p>
              )}
              {formData.colaborador !== '' && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  * Entregas para colaboradores são sempre saídas.
                </p>
              )}
            </div>

            {/* ATIVO */}
            <div className="space-y-2">
              <Label htmlFor="ativo">Ativo</Label>
              <select
                id="ativo"
                name="ativo"
                required
                value={formData.ativo}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-muted/50"

              >
                <option value="">Selecione o ativo...</option>
                {ativos.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.patrimonio} - {asset.modelo}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground italic">
                * Se selecionar um ativo, verifique se o status dele é compatível.
              </p>
            </div>

            {/* COLABORADOR */}
            <div className="space-y-4 border p-4 rounded-md">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="devolucao"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={
                    // Checkbox marcado APENAS se o colaborador selecionado for explicitamente o 'ESTOQUE TI'
                    colaboradores.find(c => c.id.toString() === formData.colaborador)?.nome.toUpperCase() === 'ESTOQUE TI'
                  }
                  // Melhorar lógica para "New": checkbox deve ser explicitamente marcado pelo usuário para ativar modo estoque.
                  // Mas aqui estamos reaproveitando a lógica do edit.
                  // Vamos usar uma verificação mais robusta: se o ID selecionado é o do estoque.
                  onChange={(e) => {
                    const isChecked = e.target.checked;

                    // Buscar ID do Colaborador 'ESTOQUE TI'
                    const stockColab = colaboradores.find(c =>
                      c.nome.toUpperCase().includes('ESTOQUE') ||
                      c.nome.toUpperCase().includes('TI')
                    );

                    const exactStock = colaboradores.find(c => c.nome.toUpperCase() === 'ESTOQUE TI');
                    const targetStockId = exactStock?.id?.toString() || stockColab?.id?.toString() || '';

                    setFormData(prev => ({
                      ...prev,
                      colaborador: isChecked ? targetStockId : '', // Se desmarcar, limpa para forçar escolha
                      tipo_movimento: isChecked ? 'Entrada' : 'Saida'
                    }));
                  }}
                />
                <Label htmlFor="devolucao" className="font-medium cursor-pointer">
                  Devolução para Estoque TI
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colaborador" className={formData.colaborador === '' ? 'text-muted-foreground' : ''}>
                  Colaborador (Destino)
                </Label>
                <select
                  id="colaborador"
                  name="colaborador"
                  disabled={
                    colaboradores.find(c => c.id.toString() === formData.colaborador)?.nome.toUpperCase() === 'ESTOQUE TI'
                  }
                  value={formData.colaborador}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 disabled:bg-muted disabled:text-muted-foreground"
                >
                  <option value="">Selecione o colaborador...</option>
                  {colaboradores.map(colab => (
                    <option key={colab.id} value={colab.id}>
                      {colab.nome} - {colab.setor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DATA */}
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                name="data"
                type="datetime-local"
                value={formData.data}
                onChange={handleChange}
              />
            </div>

            {/* OBS e VALOR */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.valor}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                name="obs"
                placeholder="Detalhes sobre o estado do equipamento ou motivo..."
                value={formData.obs}
                onChange={handleChange}
              />
            </div>

            {/* AÇÕES */}
            <div className="pt-4 flex justify-end gap-2">
              <Link href="/movements">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Registrar Movimentação'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
