import { supabase } from '../lib/supabase';

export default async function Home() {
  // Tentando buscar qualquer coisa da tabela 'wishlist'
  const { data, error } = await supabase.from('wishlist').select('*');

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Minha Wishlist de Jogos</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl text-blue-400 mb-4">Status da Conexão Supabase:</h2>
        
        {/* Se der erro nas chaves ou a tabela não existir, mostra o erro */}
        {error && (
          <p className="text-red-400">Erro de conexão: {error.message}</p>
        )}

        {/* Se conectar com sucesso, mostra os dados (mesmo que vazio) */}
        {!error && (
          <div>
            <p className="text-green-400 mb-2">Conectado com sucesso! 🎉</p>
            <pre className="bg-black p-4 rounded text-sm text-gray-300 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}