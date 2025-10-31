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

  // 1. Pega o estado salvo (baralho é string[])
  const estado: GameState = JSON.parse(gameStateCookie.value);

  // 2. Lógica do Dealer
  let pontosDealer = calcularPontos(estado.dealer);
  while (pontosDealer < 17) {
    // 3. Puxa uma carta minificada
    const cartaMinificada = estado.baralho.pop();
    if (cartaMinificada) {
      // 4. Expande para o objeto completo
      const novaCarta = shortStringToCarta(cartaMinificada);
      // 5. Adiciona o objeto na mão do dealer
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

  // 6. Limpa o cookie (sem mudanças aqui)
  response.cookies.set('blackjack-game', '', { 
    httpOnly: true, 
    path: '/', 
    maxAge: -1
  });

  return response;
}