'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import AddGameModal from '../components/AddGameModal';
import GameCard from '../components/GameCard';

export default function Home() {
  const router = useRouter();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGames(data);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || null);
      await fetchGames();
      setLoading(false);
    };

    checkAuthAndFetchData();
  }, [router, fetchGames]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Nossas novas funções ultra-rápidas de injeção na tela!
  const handleGameAdded = (newGame: any) => {
    setGames((prev) => [newGame, ...prev]); // Coloca o jogo novo no topo da lista
  };

  const handleGameDeleted = (deletedId: string) => {
    setGames((prev) => prev.filter((game) => game.id !== deletedId)); // Tira o jogo da lista
  };

  const handleGameUpdated = (updatedGame: any) => {
    setGames((prev) => prev.map((game) => game.id === updatedGame.id ? updatedGame : game)); // Atualiza o preço do jogo exato
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Carregando cofre...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex justify-between items-center mb-10 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">Minha Wishlist</h1>
            <p className="text-gray-400 mt-2">Monitoramento de preços de jogos</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-sm text-gray-400">Logado como: <strong className="text-white">{userEmail}</strong></span>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="bg-gray-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Sair
              </button>
              <AddGameModal onGameAdded={handleGameAdded} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              onGameDeleted={handleGameDeleted}
              onGameUpdated={handleGameUpdated} 
            />
          ))}
        </div>
        
        {games.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Nenhum jogo cadastrado na sua wishlist ainda. Adicione o primeiro!
          </div>
        )}

      </div>
    </main>
  );
}