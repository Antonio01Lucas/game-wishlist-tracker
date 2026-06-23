import { supabase } from '../lib/supabase';
import AddGameModal from '../components/AddGameModal';

// Definindo a tipagem para o TypeScript não reclamar e nos ajudar com autocompletar
interface Game {
  id: string;
  game_title: string;
  target_price: number;
  current_price: number | null;
}

export default async function Home() {
  // Buscando os dados da nossa tabela
  const { data, error } = await supabase.from('wishlist').select('*').order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho da Aplicação */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">Minha Wishlist</h1>
            <p className="text-gray-400 mt-2">Monitoramento de preços de jogos</p>
          </div>
          <AddGameModal />
        </header>

        {/* Tratamento de Erro */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg text-red-200 mb-8">
            Erro ao carregar jogos: {error.message}
          </div>
        )}

        {/* Grid de Cards dos Jogos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((game: Game) => {
            // Lógica simples para ver se o preço atual atingiu a meta
            const atingiuMeta = game.current_price && game.current_price <= game.target_price;

            return (
              <div 
                key={game.id} 
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl hover:border-blue-500 transition-colors"
              >
                <h2 className="text-xl font-bold mb-4 truncate" title={game.game_title}>
                  {game.game_title}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Preço Alvo:</span>
                    <span className="font-mono text-green-400 font-bold">
                      R$ {game.target_price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                    <span className="text-gray-400 text-sm">Preço Atual:</span>
                    <span className="font-mono font-bold">
                      {game.current_price ? `R$ ${game.current_price.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Badge de status visual */}
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
          })}
        </div>
        
        {/* Caso a lista esteja vazia */}
        {data?.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            Nenhum jogo cadastrado na sua wishlist ainda.
          </div>
        )}

      </div>
    </main>
  );
}