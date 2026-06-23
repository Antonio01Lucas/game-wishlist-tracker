'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddGameModal({ onGameAdded }: { onGameAdded: (game: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [mediaType, setMediaType] = useState('Digital'); // Novo estado para Mídia
  const [isLoading, setIsLoading] = useState(false);

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.from('wishlist').insert([
      {
        game_title: title,
        target_price: parseFloat(targetPrice),
        current_price: currentPrice ? parseFloat(currentPrice) : null,
        media_type: mediaType // Enviando para o banco
      }
    ]).select();

    setIsLoading(false);

    if (error) {
      alert('Erro ao adicionar jogo: ' + error.message);
    } else if (data) {
      setIsOpen(false);
      setTitle('');
      setTargetPrice('');
      setCurrentPrice('');
      setMediaType('Digital');
      
      onGameAdded(data[0]);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg">
        + Novo Jogo
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl w-full max-w-md">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Adicionar Jogo</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nome do Jogo *</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" placeholder="Ex: EA FC 26" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Preço Alvo (R$) *</label>
                  <input type="number" required step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" placeholder="Ex: 150.00" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Preço Atual (R$)</label>
                  <input type="number" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" placeholder="Opcional" />
                </div>
              </div>

              {/* Novo Campo de Mídia */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">Tipo de Mídia</label>
                <select 
                  value={mediaType} 
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Digital">Digital</option>
                  <option value="Física">Física</option>
                  <option value="PlayStation">PlayStation (Digital)</option>          
                </select>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50">
                {isLoading ? 'Salvando...' : 'Salvar Jogo'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}