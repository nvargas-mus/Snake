import React, { useState, useEffect, useCallback } from "react";
import "./SnakeGame.css";

const PLAY_AREA_SIZE = { width: 700, height: 700 };
const SCALE = 20;
const SPEED = 100;

type SnakePart = {
  x: number;
  y: number;
};

type Apple = {
  x: number;
  y: number;
};

const SNAKE_START: SnakePart[] = [
  { x: 8, y: 7 },
  { x: 7, y: 7 }
];

const APPLE_START: Apple = { x: 10, y: 10 };

const DIRECTIONS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<SnakePart[]>(SNAKE_START);
  const [apple, setApple] = useState<Apple>(APPLE_START);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [speed, setSpeed] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDirection({ x: 1, y: 0 });
    setSpeed(SPEED);
    setGameOver(false);
    setScore(0); // Reiniciar la puntuación
  };

  const endGame = () => {
    setSpeed(null);
    setGameOver(true);
    setScore(snake.length - SNAKE_START.length); // Calcular la puntuación
  };

  const moveSnake = (event: KeyboardEvent) => {
    const { key } = event;
    if (key in DIRECTIONS) {
      setDirection(DIRECTIONS[key as keyof typeof DIRECTIONS]);
    }
  };

  const createApple = (): Apple => {
    const x = Math.floor(Math.random() * (PLAY_AREA_SIZE.width / SCALE));
    const y = Math.floor(Math.random() * (PLAY_AREA_SIZE.height / SCALE));
    return { x, y };
  };

  const checkCollision = (piece: SnakePart, snk = snake): boolean => {
    // Colisión con los bordes
    if (
      piece.x * SCALE >= PLAY_AREA_SIZE.width ||
      piece.x < 0 ||
      piece.y * SCALE >= PLAY_AREA_SIZE.height ||
      piece.y < 0
    )
      return true;
    // Colisión con sí mismo
    for (const segment of snk.slice(1)) {
      if (piece.x === segment.x && piece.y === segment.y) return true;
    }
    return false;
  };

  const checkAppleCollision = (newSnake: SnakePart[]): boolean => {
    if (newSnake[0].x === apple.x && newSnake[0].y === apple.y) {
      const newApple: Apple = createApple();
      setApple(newApple);
      return true;
    }
    return false;
  };

  const gameLoop = useCallback(() => {
    const snakeCopy = [...snake];
    const newSnakeHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };
    // Comprobar colisiones
    if (checkCollision(newSnakeHead, snake)) {
      endGame();
      return;
    }
    snakeCopy.unshift(newSnakeHead);
    if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
    setSnake(snakeCopy);
  }, [snake, direction]);

  useEffect(() => {
    if (speed) {
      const interval = setInterval(() => gameLoop(), speed);
      return () => clearInterval(interval);
    }
  }, [gameLoop, speed]);

  useEffect(() => {
    window.addEventListener("keydown", moveSnake);
    return () => window.removeEventListener("keydown", moveSnake);
  }, []);

  return (
    <div className="game-container">
      <div
        className="play-area"
        style={{
          width: `${PLAY_AREA_SIZE.width}px`,
          height: `${PLAY_AREA_SIZE.height}px`,
          position: "relative",
          border: "1px solid black",
          backgroundColor: "white"
        }}
      >
        {snake.map((part, index) => (
          <div
            key={index}
            className="snake-part"
            style={{
              width: `${SCALE}px`,
              height: `${SCALE}px`,
              backgroundColor: "black",
              borderRadius: "50%", // Hacer que la serpiente sea circular
              position: "absolute",
              top: `${part.y * SCALE}px`,
              left: `${part.x * SCALE}px`
            }}
          />
        ))}
        <div
          className="apple"
          style={{
            width: `${SCALE}px`,
            height: `${SCALE}px`,
            backgroundColor: "#FF8C00", // Color naranja oscuro
            borderRadius: "50%", // Hacer que la manzana sea circular
            position: "absolute",
            top: `${apple.y * SCALE}px`,
            left: `${apple.x * SCALE}px`
          }}
        />
        {gameOver && (
          <div className="game-over">
            <div>Game Over!</div>
            <div>Score: {score}</div>
          </div>
        )}
      </div>
      <button onClick={startGame} className="start-button">Start Game</button>
    </div>
  );
};

export default SnakeGame;
