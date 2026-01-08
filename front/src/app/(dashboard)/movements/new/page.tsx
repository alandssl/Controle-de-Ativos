'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useNotifications } from '@/providers/notification-provider';
import { Ativo, Colaborador } from '@/types';

export default function NewMovementPage() {
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('type') === 'entry' ? 'Entrada' : 'Saida';
  const [loading, setLoading] = useState(false);
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const { addNotification } = useNotifications();

  // ========================
  // BUSCA ATIVOS E COLABORADORES
  // ========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ativosRes, colabRes] = await Promise.all([
          fetch('http://localhost:8080/api/equipamentos'),
          fetch('http://localhost:8080/api/colaboradores'),
        ]);

        if (ativosRes.ok) setAtivos(await ativosRes.json());
        if (colabRes.ok) setColaboradores(await colabRes.json());
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========================
  // SUBMIT (POST)
  // ========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);


    const selectedAssetId = Number(formData.get('ativo'));
    const selectedColabId = Number(formData.get('colaborador'));

    const selectedAsset = ativos.find(a => a.id === selectedAssetId);
    const selectedColab = colaboradores.find(c => c.id === selectedColabId);



    const payload = {
      tipoMovimento: formData.get('tipo_movimento'),
      dataMovimento: formData.get('data'),
      observacao: formData.get('obs'),
      valor: Number(formData.get('valor')),
      // Enviando Tipo
      tipo: { tipo: selectedAsset?.tipoEquipamento?.tipo || 'Outros' },
      idEquipamento: {
        id: selectedAssetId
      },
      idColaborador: {
        id: selectedColabId
      },
      setor: selectedColab?.setor // Enviar o setor como texto
    };



    try {
      const response = await fetch('http://localhost:8080/api/movimentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao salvar');

      addNotification({
        title: 'Sucesso',
        message: 'Movimentação registrada com sucesso.',
        type: 'success',
      });

      window.location.href = '/movements';
    } catch (error) {
      console.error(error);
      addNotification({
        title: 'Erro',
        message: 'Erro ao registrar movimentação.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // RENDER
  // ========================
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
                defaultValue={defaultType}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Saida">Entrega (Saída)</option>
                <option value="Entrada">Devolução (Entrada)</option>
              </select>
            </div>


            {/* ATIVO */}
            <div className="space-y-2">
              <Label htmlFor="ativo">Ativo</Label>
              <select
                id="ativo"
                name="ativo"
                required
                disabled={dataLoading}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">
                  {dataLoading ? 'Carregando ativos...' : 'Selecione o ativo...'}
                </option>
                {ativos.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.patrimonio} - {asset.modelo}
                  </option>
                ))}
              </select>
            </div>

            {/* COLABORADOR */}
            <div className="space-y-2">
              <Label htmlFor="colaborador">Colaborador</Label>
              <select
                id="colaborador"
                name="colaborador"
                required
                disabled={dataLoading}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">
                  {dataLoading
                    ? 'Carregando colaboradores...'
                    : 'Selecione o colaborador...'}
                </option>
                {colaboradores.map(colab => (
                  <option key={colab.id} value={colab.id}>
                    {colab.nome} - {colab.setor}
                  </option>
                ))}
              </select>
            </div>

            {/* DATA */}
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" name="data" type="datetime-local" />
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                name="obs"
                placeholder="Detalhes sobre o estado do equipamento ou motivo..."
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
