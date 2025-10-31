// lib/blackjack.ts

export interface Carta {
  valor: string; // "A", "2", "J", "K"
  naipe: string; // "♠️", "♥️", "♦️", "♣️"
  display: string; // "K♥️"
}

// *** NOVO ***
// Interface para o JOGO SALVO. Note que o baralho é minificado!
export interface GameState {
  baralho: string[]; // <--- MINIFICADO! Ex: ["10H", "KS", "AD"]
  jogador: Carta[];  // Mãos continuam com objetos completos
  dealer: Carta[];
}

const naipes = ["♠️", "♥️", "♦️", "♣️"];
const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// *** NOVO ***
// Mapas para minificar/expandir os naipes
const naipeToShort: { [key: string]: string } = {
  "♠️": "S", // Spades
  "♥️": "H", // Hearts
  "♦️": "D", // Diamonds
  "♣️": "C", // Clubs
};
const shortToNaipe: { [key: string]: string } = {
  S: "♠️",
  H: "♥️",
  D: "♦️",
  C: "♣️",
};

// *** NOVA FUNÇÃO ***
// Converte um objeto Carta em "10H", "KS", etc.
export function cartaToShortString(carta: Carta): string {
  return `${carta.valor}${naipeToShort[carta.naipe]}`;
}

// *** NOVA FUNÇÃO ***
// Converte "10H", "KS" de volta para um objeto Carta
export function shortStringToCarta(short: string): Carta {
  let valor: string;
  let naipeChar: string;

  if (short.startsWith("10")) {
    // Caso especial do "10"
    valor = "10";
    naipeChar = short.substring(2);
  } else {
    valor = short.substring(0, 1);
    naipeChar = short.substring(1);
  }

  const naipe = shortToNaipe[naipeChar];
  return {
    valor: valor,
    naipe: naipe,
    display: `${valor}${naipe}`,
  };
}

// --- Funções existentes (sem mudanças) ---

export function criarBaralho(): Carta[] {
  const baralho: Carta[] = [];
  for (const naipe of naipes) {
    for (const valor of valores) {
      baralho.push({
        valor: valor,
        naipe: naipe,
        display: `${valor}${naipe}`,
      });
    }
  }
  
  // Embaralhar (Algoritmo Fisher-Yates)
  for (let i = baralho.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
  }
  return baralho;
}

export function calcularPontos(mao: Carta[]): number {
  let pontos = 0;
  let ases = 0;

  for (const carta of mao) {
    const valor = carta.valor;
    if (["J", "Q", "K"].includes(valor)) {
      pontos += 10;
    } else if (valor === "A") {
      pontos += 11;
      ases += 1;
    } else {
      pontos += parseInt(valor, 10);
    }
  }

  while (pontos > 21 && ases > 0) {
    pontos -= 10;
    ases -= 1;
  }
  return pontos;
}