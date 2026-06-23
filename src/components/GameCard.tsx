'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface Game {
  id: string;
  game_title: string;
  target_price: number;
  current_price: number | null;
  media_type: string; // Nova propriedade mapeada do banco
}

export default function GameCard({ game, onGameDeleted, onGameUpdated }: { game: Game, onGameDeleted: (id: string) => void, onGameUpdated: (game: any) => void }) {
  // Estados para Preço Atual
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [editCurrentPrice, setEditCurrentPrice] = useState(game.current_price?.toString() || '');
  
  // Estados para Preço Alvo
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editTargetPrice, setEditTargetPrice] = useState(game.target_price?.toString() || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPriceNum = game.current_price || Infinity;
  const atingiuMeta = currentPriceNum <= game.target_price;

  // Função para atualizar Preço Atual
  const handleUpdateCurrent = async () => {
    setIsSaving(true);
    const newPrice = parseFloat(editCurrentPrice);

    const { data, error } = await supabase
      .from('wishlist')
      .update({ current_price: isNaN(newPrice) ? null : newPrice })
      .eq('id', game.id)
      .select();

    setIsSaving(false);

    if (error) {
      alert('Erro ao atualizar: ' + error.message);
    } else if (data) {
      setIsEditingCurrent(false);
      onGameUpdated(data[0]);
    }
  };

  // Função para atualizar Preço Alvo
  const handleUpdateTarget = async () => {
    setIsSaving(true);
    const newPrice = parseFloat(editTargetPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      alert('O preço alvo deve ser um valor válido.');
      setIsSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('wishlist')
      .update({ target_price: newPrice })
      .eq('id', game.id)
      .select();

    setIsSaving(false);

    if (error) {
      alert('Erro ao atualizar meta: ' + error.message);
    } else if (data) {
      setIsEditingTarget(false);
      onGameUpdated(data[0]);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Tem certeza que deseja remover ${game.game_title} da sua wishlist?`);
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

  // Cor visual baseada no tipo de mídia
  const mediaBadgeColor = game.media_type === 'Física' ? 'bg-purple-900/60 text-purple-300 border-purple-700' : 'bg-blue-900/60 text-blue-300 border-blue-700';

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl hover:border-gray-500 transition-colors ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      <div className="flex justify-between items-start mb-4">
        {/* Título com a Etiqueta de Mídia */}
        <div className="flex flex-col gap-2 pr-4 truncate">
          <h2 className="text-xl font-bold truncate" title={game.game_title}>
            {game.game_title}
          </h2>
          <span className={`inline-block w-max px-2 py-0.5 rounded text-xs font-semibold border ${mediaBadgeColor}`}>
            {game.media_type || 'Digital'}
          </span>
        </div>
        <button onClick={handleDelete} disabled={isDeleting} className="text-gray-500 hover:text-red-500 transition-colors" title="Remover jogo">
          🗑️
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Preço Alvo Editável */}
        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg group">
          <span className="text-gray-400 text-sm">Preço Alvo:</span>
          
          {isEditingTarget ? (
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" value={editTargetPrice} onChange={(e) => setEditTargetPrice(e.target.value)} className="w-24 bg-gray-700 text-white font-mono font-bold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateTarget()} />
              <button onClick={handleUpdateTarget} disabled={isSaving} className="text-green-400 hover:text-green-300 disabled:opacity-50 text-sm font-bold w-4">
                ✓
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingTarget(true)} title="Clique para editar meta">
              <span className="font-mono text-green-400 font-bold w-24 text-right transition-colors hover:text-green-300">
                R$ {game.target_price.toFixed(2)}
              </span>
              <span className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity w-4 text-center">
                ✎
              </span>
            </div>
          )}
        </div>

        {/* Preço Atual Editável */}
        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg group">
          <span className="text-gray-400 text-sm">Preço Atual:</span>
          
          {isEditingCurrent ? (
            <div className="flex items-center gap-2">
              <input type="number" step="0.01" value={editCurrentPrice} onChange={(e) => setEditCurrentPrice(e.target.value)} className="w-24 bg-gray-700 text-white font-mono font-bold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdateCurrent()} />
              <button onClick={handleUpdateCurrent} disabled={isSaving} className="text-green-400 hover:text-green-300 disabled:opacity-50 text-sm font-bold w-4">
                ✓
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingCurrent(true)} title="Clique para editar preço atual">
              <span className="font-mono font-bold group-hover:text-blue-400 transition-colors w-24 text-right">
                {game.current_price ? `R$ ${game.current_price.toFixed(2)}` : 'N/A'}
              </span>
              <span className="text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity w-4 text-center">
                ✎
              </span>
            </div>
          )}
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
    </div>
  );
}