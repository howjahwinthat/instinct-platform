import confetti from 'canvas-confetti';

export function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.7 },
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  });
}

export function fireSmallConfetti() {
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.8 },
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
  });
}