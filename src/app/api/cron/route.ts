import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  // 1. Movemos a criação do admin para DENTRO da função!
  // Assim a Vercel não tenta ler as chaves na hora errada.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { erro: "Acesso negado. Senha de automação incorreta." },
      { status: 401 },
    );
  }

  try {
    // Usando o admin, ele consegue ver a lista de todos os usuários
    const { data: games, error } = await supabaseAdmin
      .from("wishlist")
      .select("*");
    if (error) throw error;

    if (!games || games.length === 0) {
      return NextResponse.json({
        mensagem: "Nenhum jogo na wishlist para atualizar.",
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let atualizados = 0;

    for (const game of games) {
      try {
        const res = await fetch(
          `${baseUrl}/api/scraper?jogo=${encodeURIComponent(game.game_title)}&midia=${encodeURIComponent(game.media_type)}`,
        );
        const result = await res.json();

        if (result.sucesso && result.precoAtual !== null) {
          await supabaseAdmin
            .from("wishlist")
            .update({ current_price: result.precoAtual })
            .eq("id", game.id);

          atualizados++;
        }
      } catch (err) {
        console.error(`Erro ao atualizar ${game.game_title}:`, err);
        continue;
      }
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: `Batida de rotina finalizada! ${atualizados} jogos foram atualizados no banco de dados.`,
    });
  } catch (erro) {
    // Verificamos se o erro é realmente um objeto de Erro estruturado antes de tentar ler a mensagem
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);

    return NextResponse.json(
      { erro: "Falha estrutural no Cron Job.", detalhes: mensagemErro },
      { status: 500 },
    );
  }
}
