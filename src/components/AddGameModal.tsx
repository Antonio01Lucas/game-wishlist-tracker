'use client'; // Isso diz ao Next.js que este componente precisa de interatividade no navegador

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddGameModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // O router nos ajuda a recarregar a tela no fundo sem piscar
  const router = useRouter();

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que a página recarregue do jeito antigo
    setIsLoading(true);

    // Inserindo os dados no Supabase
    const { error } = await supabase.from('wishlist').insert([
      {
        game_title: title,
        target_price: parseFloat(targetPrice),
        current_price: currentPrice ? parseFloat(currentPrice) : null,
      }
    ]);

    setIsLoading(false);

    if (error) {
      alert('Erro ao adicionar jogo: ' + error.message);
    } else {
      // Se deu tudo certo, limpamos a casa e fechamos a janela
      setIsOpen(false);
      setTitle('');
      setTargetPrice('');
      setCurrentPrice('');
      
      // Mágica do Next.js: manda a tela principal buscar os dados novos no banco!
      router.refresh(); 
    }
  };

  return (
    <>
      {/* O botão que fica na tela principal */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
      >
        + Novo Jogo
      </button>

      {/* A janela do Modal (só aparece se isOpen for true) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-2xl w-full max-w-md">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Adicionar Jogo</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xl">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nome do Jogo *</label>
                <input 
                  type="text" 
                  required 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Ex: EA FC 26"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Preço Alvo (R$) *</label>
                  <input 
                    type="number" 
                    required 
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ex: 150.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Preço Atual (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar Jogo'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}