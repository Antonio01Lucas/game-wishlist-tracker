import { supabase } from '../lib/supabase';
import AddGameModal from '../components/AddGameModal';
import GameCard from '../components/GameCard';

// Força o Next.js a sempre buscar dados frescos ao carregar a página
export const revalidate = 0;

export default async function Home() {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">Minha Wishlist</h1>
            <p className="text-gray-400 mt-2">Monitoramento de preços de jogos</p>
          </div>
          <AddGameModal />
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg text-red-200 mb-8">
            Erro ao carregar jogos: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        
        {data?.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Nenhum jogo cadastrado na sua wishlist ainda.
          </div>
        )}

      </div>
    </main>
  );
}