import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  calcularPontos,
  GameState,         
  shortStringToCarta, 
} from '@/lib/blackjack';

export async function POST() {
  const cookieStore = await cookies();
  const gameStateCookie = cookieStore.get('blackjack-game');

  if (!gameStateCookie) {
    return NextResponse.json({ error: 'Jogo não iniciado.' }, { status: 400 });
  }

  const estado: GameState = JSON.parse(gameStateCookie.value);

  let pontosDealer = calcularPontos(estado.dealer);
  while (pontosDealer < 17) {
    const cartaMinificada = estado.baralho.pop();
    if (cartaMinificada) {
      const novaCarta = shortStringToCarta(cartaMinificada);
      estado.dealer.push(novaCarta);
    }
    pontosDealer = calcularPontos(estado.dealer);
  }

  const pontosJogador = calcularPontos(estado.jogador);
  let resultado = "";

  if (pontosDealer > 21 || pontosJogador > pontosDealer) {
    resultado = "🎉 Você venceu!";
  } else if (pontosJogador < pontosDealer) {
    resultado = "💀 Dealer venceu!";
  } else {
    resultado = "🤝 Empate!";
  }

  const response = NextResponse.json({
    jogador: estado.jogador,
    pontos_jogador: pontosJogador,
    dealer: estado.dealer, 
    pontos_dealer: pontosDealer,
    gameOver: true,
    resultado: resultado
  });

  response.cookies.set('blackjack-game', '', { 
    httpOnly: true, 
    path: '/', 
    maxAge: -1
  });

  return response;
}