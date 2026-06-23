'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  game_title: string;
  target_price: number;
  current_price: number | null;
}

export default function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState(game.current_price?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPriceNum = game.current_price || Infinity;
  const atingiuMeta = currentPriceNum <= game.target_price;

  const handleUpdate = async () => {
    setIsSaving(true);
    const newPrice = parseFloat(editPrice);

    const { error } = await supabase
      .from('wishlist')
      .update({ current_price: isNaN(newPrice) ? null : newPrice })
      .eq('id', game.id);

    setIsSaving(false);

    if (error) {
      alert('Erro ao atualizar: ' + error.message);
    } else {
      setIsEditing(false);
      router.refresh();
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
      router.refresh(); 
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl hover:border-blue-500 transition-colors ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold truncate pr-4" title={game.game_title}>
          {game.game_title}
        </h2>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-500 hover:text-red-500 transition-colors"
          title="Remover jogo"
        >
          🗑️
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Preço Alvo com alinhamento forçado e bloco fantasma */}
        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
          <span className="text-gray-400 text-sm">Preço Alvo:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-green-400 font-bold w-24 text-right">
              R$ {game.target_price.toFixed(2)}
            </span>
            <span className="w-4"></span> {/* Espaço do tamanho exato do lápis */}
          </div>
        </div>

        {/* Preço Atual */}
        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg group">
          <span className="text-gray-400 text-sm">Preço Atual:</span>
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-24 bg-gray-700 text-white font-mono font-bold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />
              <button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="text-green-400 hover:text-green-300 disabled:opacity-50 text-sm font-bold w-4"
              >
                ✓
              </button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setIsEditing(true)}
              title="Clique para editar"
            >
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