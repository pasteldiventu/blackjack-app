import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  calcularPontos,
  GameState,         // <--- Importar
  shortStringToCarta, // <--- Importar
} from '@/lib/blackjack';

export async function POST() {
  const cookieStore = await cookies();
  const gameStateCookie = cookieStore.get('blackjack-game');

  if (!gameStateCookie) {
    return NextResponse.json({ error: 'Jogo não iniciado.' }, { status: 400 });
  }

  // --- A CORREÇÃO ESTÁ AQUI ---

  // 1. Pega o estado salvo (baralho é string[])
  const estado: GameState = JSON.parse(gameStateCookie.value);
  let gameOver = false;
  let mensagem = "";

  // 2. Puxa uma carta minificada do baralho
  const cartaMinificada = estado.baralho.pop();
  
  if (cartaMinificada) {
    // 3. Expande a carta para o objeto completo
    const novaCarta = shortStringToCarta(cartaMinificada);
    // 4. Adiciona o objeto completo na mão do jogador
    estado.jogador.push(novaCarta);
  }

  const pontosJogador = calcularPontos(estado.jogador);

  if (pontosJogador > 21) {
    gameOver = true;
    mensagem = "💥 Você estourou! Dealer venceu.";
  }

  const response = NextResponse.json({
    jogador: estado.jogador,
    pontos_jogador: pontosJogador,
    dealer_visivel: [estado.dealer[0]],
    gameOver: gameOver,
    mensagem: mensagem
  });

  // 5. Salva o estado atualizado (o baralho já está minificado)
  if (gameOver) {
    response.cookies.set('blackjack-game', '', { maxAge: -1 });
  } else {
    // Note que 'estado' aqui já tem o 'baralho' como string[]
    response.cookies.set('blackjack-game', JSON.stringify(estado), {
      httpOnly: true,
      path: '/',
    });
  }

  return response;
}