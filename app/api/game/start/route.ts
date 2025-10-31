import { NextResponse } from 'next/server';
import {
  criarBaralho,
  calcularPontos,
  GameState,         // <--- Importar
  cartaToShortString, // <--- Importar
} from '@/lib/blackjack';

export async function POST() {
  const baralho = criarBaralho();
  
  // Distribui as cartas (ainda como objetos completos)
  const jogador = [baralho.pop()!, baralho.pop()!];
  const dealer = [baralho.pop()!, baralho.pop()!];

  // --- A CORREÇÃO ESTÁ AQUI ---
  
  // 1. Minifica o baralho restante
  const baralhoMinificado: string[] = baralho.map(cartaToShortString);

  // 2. Cria o estado para salvar (com o baralho minificado)
  const estadoParaSalvar: GameState = {
    baralho: baralhoMinificado,
    jogador: jogador,
    dealer: dealer,
  };

  // 3. Prepara a resposta
  const response = NextResponse.json({
    jogador: estadoParaSalvar.jogador,
    dealer_visivel: [estadoParaSalvar.dealer[0]],
    pontos_jogador: calcularPontos(estadoParaSalvar.jogador),
  });

  // 4. Salva o estado MINIFICADO no cookie
  response.cookies.set('blackjack-game', JSON.stringify(estadoParaSalvar), { 
    httpOnly: true,
    path: '/',
  });

  return response;
}