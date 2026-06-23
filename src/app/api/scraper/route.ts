import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jogo = searchParams.get('jogo');
  const midia = searchParams.get('midia'); // Novo parâmetro para o Maestro decidir o caminho

  if (!jogo) {
    return NextResponse.json({ erro: 'Por favor, envie o parâmetro ?jogo=NomeDoJogo' }, { status: 400 });
  }

  try {
    // ---------------------------------------------------------
    // ROTA 1: MÍDIA FÍSICA (Nosso Scraper Customizado na Amazon)
    // ---------------------------------------------------------
    if (midia === 'Física') {
      // Adicionamos "jogo ps5" na busca para garantir que a Amazon traga o disco e não um livro ou brinquedo
      const urlBusca = `https://www.amazon.com.br/s?k=${encodeURIComponent(jogo + ' jogo physical')}`;
      
      // O nosso "crachá falso" para enganar a segurança da loja
      const resposta = await fetch(urlBusca, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        }
      });

      const html = await resposta.text();
      const $ = cheerio.load(html);

      // A Amazon guarda os produtos em divs com esse atributo de dados específico
      const primeiroCard = $('div[data-component-type="s-search-result"]').first();

      if (!primeiroCard.length) {
        return NextResponse.json({ erro: 'Jogo físico não encontrado na loja.' }, { status: 404 });
      }

      const tituloEncontrado = primeiroCard.find('h2 a span').text().trim();
      
      // A Amazon divide o preço em duas classes: os "reais" e os "centavos". Precisamos juntar!
      const precoInteiro = primeiroCard.find('.a-price-whole').first().text().replace(/[,.]/g, '').trim();
      const precoFracao = primeiroCard.find('.a-price-fraction').first().text().trim();
      
      let precoAtual = null;
      if (precoInteiro) {
         // Junta "150" com "90" e transforma em número 150.90
         precoAtual = parseFloat(`${precoInteiro}.${precoFracao || '00'}`);
      }

      return NextResponse.json({
        sucesso: true,
        jogoBuscado: jogo,
        tituloEncontrado: tituloEncontrado || jogo,
        precoAtual: precoAtual,
        loja: 'Amazon (Mídia Física)'
      });
    } 
    
    // ---------------------------------------------------------
    // ROTA 2: MÍDIA DIGITAL (Via CheapShark API)
    // ---------------------------------------------------------
    else {
      const urlBusca = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(jogo)}&limit=1`;
      const resposta = await fetch(urlBusca);
      const dados = await resposta.json();

      if (!dados || dados.length === 0) {
        return NextResponse.json({ erro: 'Jogo não encontrado na base de dados.' }, { status: 404 });
      }

      const jogoEncontrado = dados[0];

      return NextResponse.json({
        sucesso: true,
        jogoBuscado: jogo,
        tituloEncontrado: jogoEncontrado.external,
        precoAtual: parseFloat(jogoEncontrado.cheapest),
        loja: 'Múltiplas Lojas via CheapShark'
      });
    }

  } catch (erro: any) {
    return NextResponse.json({ erro: 'Ocorreu uma falha na raspagem de dados.', detalhes: erro.message }, { status: 500 });
  }
}