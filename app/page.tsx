'use client';

import { useState } from 'react';
import { Carta, calcularPontos } from '@/lib/blackjack'; 

interface Jogo {
  jogador: Carta[];
  pontos_jogador: number;
  dealer_visivel?: Carta[]; 
  dealer?: Carta[];         
  pontos_dealer?: number;
  gameOver: boolean;
  resultado: string;
}

export default function Home() {
  const [game, setGame] = useState<Jogo | null>(null);
  const [loading, setLoading] = useState(false);

// Função para chamar a API /start 
  const handleStartGame = async () => {
    setLoading(true);
    setGame(null); // Limpa o jogo anterior
    try {
      const res = await fetch('/api/game/start', { method: 'POST' });
      if (!res.ok) {
        console.error("Erro da API ao iniciar o jogo:", await res.text());
        setGame(null); 
      } else {
        const data = await res.json();
        
        if (data.pontos_jogador === 21) {
          handleStand(); 
        } else {
          setGame(data);
        }
      }

    } catch (error) {
      console.error("Erro de rede ao iniciar jogo:", error);
      setGame(null); 
    }
    setLoading(false);
  };

  const handleHit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/hit', { method: 'POST' });
      const data = await res.json();
      setGame(data);
    } catch (error) {
      console.error("Erro no 'Hit':", error);
    }
    setLoading(false);
  };

  const handleStand = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/stand', { method: 'POST' });
      const data = await res.json();
      setGame(data); 
    } catch (error) {
      console.error("Erro no 'Stand':", error);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">♠️ Blackjack Boladão ♥️</h1>

      {/* Botão de Controle Principal */}
      {!game || game.gameOver ? (
        <button
          onClick={handleStartGame}
          disabled={loading}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-lg text-2xl font-bold disabled:opacity-50"
        >
          {loading ? 'Embaralhando...' : 'Novo Jogo'}
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={handleHit}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-xl font-bold disabled:opacity-50"
          >
            [H] Hit (Carta)
          </button>
          <button
            onClick={handleStand}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-xl font-bold disabled:opacity-50"
          >
            [S] Stand (Parar)
          </button>
        </div>
      )}

      {/* Área de Resultado */}
      {game?.gameOver && (
        <div className="mt-8 text-center">
          <h2 className="text-4xl font-bold text-yellow-400">{game.resultado}</h2>
          <p className="text-xl">
            Dealer tinha {game.pontos_dealer} pontos.
          </p>
        </div>
      )}

      {/* A Mesa de Jogo */}
      {game && (
        <div className="flex flex-col md:flex-row gap-16 mt-12 w-full max-w-4xl">
          {/* Mão do Dealer */}
          <div className="flex-1">
            <h2 className="text-3xl mb-4">
              Mão do Dealer 
              ({game.gameOver ? game.pontos_dealer : game.dealer_visivel ? calcularPontos(game.dealer_visivel) : '?'})
            </h2>
            <div className="flex gap-3 h-36">
              {/* Lógica para mostrar a mão (final ou parcial) */}
              {(game.gameOver ? game.dealer : game.dealer_visivel)?.map((carta, i) => (
                <CartaVisual key={i} carta={carta} />
              ))}
              {/* A carta virada */}
              {!game.gameOver && (
                <div className="w-24 h-36 bg-red-800 border-2 border-red-900 rounded-lg flex items-center justify-center text-5xl">
                  ❓
                </div>
              )}
            </div>
          </div>

          {/* Mão do Jogador */}
          <div className="flex-1">
            <h2 className="text-3xl mb-4">
              Sua Mão ({game.pontos_jogador})
            </h2>
            <div className="flex gap-3 h-36">
              {game.jogador?.map((carta, i) => (
                <CartaVisual key={i} carta={carta} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
interface CartaProps {
  carta: Carta;
}

function CartaVisual({ carta }: CartaProps) {
  const cor = (carta.naipe === "♥️" || carta.naipe === "♦️") 
    ? "text-red-500" 
    : "text-black";

  return (
    <div 
      className={`w-24 h-36 bg-white rounded-lg shadow-md p-2 flex flex-col justify-between items-center ${cor}`}
    >
      <span className="text-3xl font-bold self-start">{carta.valor}</span>
      <span className="text-5xl">{carta.naipe}</span>
      <span className="text-3xl font-bold self-end transform rotate-180">{carta.valor}</span>
    </div>
  );
}