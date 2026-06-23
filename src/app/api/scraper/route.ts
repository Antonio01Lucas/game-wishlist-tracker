import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jogo = searchParams.get('jogo');
  const midia = searchParams.get('midia');

  if (!jogo) {
    return NextResponse.json({ erro: 'Por favor, envie o parâmetro ?jogo=NomeDoJogo' }, { status: 400 });
  }

  try {
    // ---------------------------------------------------------
    // ROTA 1: MÍDIA FÍSICA (Amazon)
    // ---------------------------------------------------------
    if (midia === 'Física') {
      const urlBusca = `https://www.amazon.com.br/s?k=${encodeURIComponent(jogo + ' jogo physical')}`;
      const resposta = await fetch(urlBusca, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        }
      });

      const html = await resposta.text();
      const $ = cheerio.load(html);
      const primeiroCard = $('div[data-component-type="s-search-result"]').first();

      if (!primeiroCard.length) return NextResponse.json({ erro: 'Jogo físico não encontrado.' }, { status: 404 });

      const precoInteiro = primeiroCard.find('.a-price-whole').first().text().replace(/[,.]/g, '').trim();
      const precoFracao = primeiroCard.find('.a-price-fraction').first().text().trim();
      
      let precoAtual = null;
      if (precoInteiro) precoAtual = parseFloat(`${precoInteiro}.${precoFracao || '00'}`);

      return NextResponse.json({ sucesso: true, precoAtual, loja: 'Amazon (Mídia Física)' });
    } 
    
    // ---------------------------------------------------------
    // ROTA 2: CONSOLES / PLAYSTATION (Via PSPrices)
    // ---------------------------------------------------------
    else if (midia === 'PlayStation') {
      // Buscamos o jogo na loja brasileira da PSN através do PSPrices
      const urlBusca = `https://psprices.com/region-br/search/?q=${encodeURIComponent(jogo)}`;
      const resposta = await fetch(urlBusca, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });

      const html = await resposta.text();
      const $ = cheerio.load(html);
      
      // Pega o primeiro card de jogo da grade de resultados
      const primeiroCard = $('.component--game-card').first();

      if (!primeiroCard.length) return NextResponse.json({ erro: 'Jogo de PlayStation não encontrado.' }, { status: 404 });

      // O PSPrices guarda o preço dentro de um span específico e usa a vírgula brasileira
      let precoTexto = primeiroCard.find('span.text-2xl.font-bold').text().trim();
      let precoAtual = null;

      if (precoTexto && precoTexto.includes('R$')) {
        // Limpa o "R$", remove espaços e troca a vírgula por ponto
        const valorLimpo = precoTexto.replace('R$', '').trim().replace(',', '.');
        precoAtual = parseFloat(valorLimpo);
      } else if (precoTexto.toLowerCase().includes('free') || precoTexto.toLowerCase().includes('gratuito')) {
        precoAtual = 0;
      }

      return NextResponse.json({ sucesso: true, precoAtual, loja: 'PlayStation Store' });
    }

    // ---------------------------------------------------------
    // ROTA 3: MÍDIA DIGITAL PC (Via CheapShark API)
    // ---------------------------------------------------------
    else {
      const urlBusca = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(jogo)}&limit=1`;
      const resposta = await fetch(urlBusca);
      const dados = await resposta.json();

      if (!dados || dados.length === 0) return NextResponse.json({ erro: 'Jogo não encontrado.' }, { status: 404 });

      return NextResponse.json({
        sucesso: true,
        precoAtual: parseFloat(dados[0].cheapest),
        loja: 'Melhor Preço Digital PC'
      });
    }

  } catch (erro: any) {
    return NextResponse.json({ erro: 'Falha na raspagem.', detalhes: erro.message }, { status: 500 });
  }
}