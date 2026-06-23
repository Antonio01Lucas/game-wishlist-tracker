import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jogo = searchParams.get('jogo');

  if (!jogo) {
    return NextResponse.json({ erro: 'Por favor, envie o parâmetro ?jogo=NomeDoJogo' }, { status: 400 });
  }

  try {
    // 1. URL da CheapShark API buscando o jogo exato (limit=1 garante apenas o melhor resultado)
    const urlBusca = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(jogo)}&limit=1`;
    const resposta = await fetch(urlBusca);
    
    // 2. Lemos a resposta já como um objeto JSON perfeito (não precisamos mais de Lupa/Cheerio)
    const dados = await resposta.json();

    // 3. Se a API deles não encontrar nada, a lista volta vazia
    if (!dados || dados.length === 0) {
      return NextResponse.json({ erro: 'Jogo não encontrado na base de dados.' }, { status: 404 });
    }

    // 4. Pegamos o jogo encontrado
    const jogoEncontrado = dados[0];

    // 5. Devolvemos a embalagem padronizada para o nosso front-end
    return NextResponse.json({
      sucesso: true,
      jogoBuscado: jogo,
      tituloEncontrado: jogoEncontrado.external, // Nome oficial do jogo nas lojas
      precoAtual: parseFloat(jogoEncontrado.cheapest), // A CheapShark já calcula o menor preço entre dezenas de lojas!
      loja: 'Melhor Preço Digital (via CheapShark)'
    });

  } catch (erro: any) {
    return NextResponse.json({ erro: 'Ocorreu uma falha na integração.', detalhes: erro.message }, { status: 500 });
  }
}