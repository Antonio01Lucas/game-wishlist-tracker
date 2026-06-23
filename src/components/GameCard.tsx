'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Game {
  id: string;
  game_title: string;
  target_price: number;
  current_price: number | null;
  media_type: string;
}

export default function GameCard({ game, onGameDeleted, onGameUpdated }: { game: Game, onGameDeleted: (id: string) => void, onGameUpdated: (game: any) => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados do Modal de Edição Global
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(game.game_title);
  const [editTargetPrice, setEditTargetPrice] = useState(game.target_price.toString());
  const [editCurrentPrice, setEditCurrentPrice] = useState(game.current_price?.toString() || '');
  const [editMediaType, setEditMediaType] = useState(game.media_type || 'Digital');
  const [isSaving, setIsSaving] = useState(false);

  const currentPriceNum = game.current_price || Infinity;
  const atingiuMeta = currentPriceNum <= game.target_price;

  // Função de Deleção
  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Tem certeza que deseja remover ${game.game_title}?`);
    if (!confirmDelete) return;

    setIsDeleting(true);

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', game.id);

    setIsDeleting(false);

    if (error) {
      alert('Erro ao deletar: ' + error.message);
    } else {
      onGameDeleted(game.id);
    }
  };

  // Função de Edição Global
  const handleGlobalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const newTarget = parseFloat(editTargetPrice);
    const newCurrent = parseFloat(editCurrentPrice);

    if (isNaN(newTarget) || newTarget <= 0) {
      alert('O preço alvo deve ser um valor válido.');
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('wishlist')
      .update({
        game_title: editTitle,
        target_price: newTarget,
        current_price: isNaN(newCurrent) ? null : newCurrent,
        media_type: editMediaType
      })
      .eq('id', game.id)
      .select();

    setIsSaving(false);

    if (error) {
      alert('Erro ao atualizar o jogo: ' + error.message);
    } else if (data) {
      setIsEditModalOpen(false);
      onGameUpdated(data[0]); // Mágica da Atualização Otimista
    }
  };

  const mediaBadgeColor = game.media_type === 'Física' ? 'bg-purple-900/60 text-purple-300 border-purple-700' : 'bg-blue-900/60 text-blue-300 border-blue-700';

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl hover:border-gray-500 transition-colors relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2 pr-4 truncate">
          <h2 className="text-xl font-bold truncate" title={game.game_title}>
            {game.game_title}
          </h2>
          <span className={`inline-block w-max px-2 py-0.5 rounded text-xs font-semibold border ${mediaBadgeColor}`}>
            {game.media_type || 'Digital'}
          </span>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            disabled={isDeleting} 
            className="text-gray-500 hover:text-blue-400 transition-colors" 
            title="Editar informações do jogo"
          >
            ⚙️
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="text-gray-500 hover:text-red-500 transition-colors" 
            title="Remover jogo"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Corpo do Card (Exibição Limpa) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
          <span className="text-gray-400 text-sm">Preço Alvo:</span>
          <span className="font-mono text-green-400 font-bold w-24 text-right">
            R$ {game.target_price.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
          <span className="text-gray-400 text-sm">Preço Atual:</span>
          <span className="font-mono font-bold w-24 text-right text-white">
            {game.current_price ? `R$ ${game.current_price.toFixed(2)}` : 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-5 text-center">
        {atingiuMeta ? (
          <span className="inline-block w-full bg-green-900/50 text-green-400 py-2 rounded-md text-sm font-bold border border-green-800">
            🎯 Meta Atingida!
          </span>
        ) : (
          <span className="inline-block w-full bg-yellow-900/50 text-yellow-400 py-2 rounded-md text-sm font-bold border border-yellow-800">
            ⏳ Aguardando Promoção
          </span>
        )}
      </div>

      {/* MODAL DE EDIÇÃO GLOBAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl w-full max-w-md">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Jogo</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>

            <form onSubmit={handleGlobalEdit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nome do Jogo *</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Preço Alvo (R$) *</label>
                  <input type="number" required step="0.01" value={editTargetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Preço Atual (R$)</label>
                  <input type="number" step="0.01" value={editCurrentPrice} onChange={(e) => setEditCurrentPrice(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Tipo de Mídia</label>
                <select 
                  value={editMediaType} 
                  onChange={(e) => setEditMediaType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Digital">Digital</option>
                  <option value="Física">Física</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}