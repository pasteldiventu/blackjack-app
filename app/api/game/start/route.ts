import { NextResponse } from 'next/server';
import {
  criarBaralho,
  calcularPontos,
  GameState,         
  cartaToShortString, 
} from '@/lib/blackjack';

export async function POST() {
  const baralho = criarBaralho();
  
  const jogador = [baralho.pop()!, baralho.pop()!];
  const dealer = [baralho.pop()!, baralho.pop()!];

  const baralhoMinificado: string[] = baralho.map(cartaToShortString);

  const estadoParaSalvar: GameState = {
    baralho: baralhoMinificado,
    jogador: jogador,
    dealer: dealer,
  };

  const response = NextResponse.json({
    jogador: estadoParaSalvar.jogador,
    dealer_visivel: [estadoParaSalvar.dealer[0]],
    pontos_jogador: calcularPontos(estadoParaSalvar.jogador),
  });

  response.cookies.set('blackjack-game', JSON.stringify(estadoParaSalvar), { 
    httpOnly: true,
    path: '/',
  });

  return response;
}