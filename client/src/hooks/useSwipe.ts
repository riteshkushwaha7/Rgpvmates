import { useState } from 'react';
import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface UseSwipeProps {
  onSwipeComplete: (direction: 'left' | 'right') => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export function useSwipe({ onSwipeComplete, onSwipeStart, onSwipeEnd }: UseSwipeProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const [{ x, rotate }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    config: { tension: 200, friction: 20 }
  }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2 || Math.abs(mx) > 100;
      const dir = xDir < 0 ? -1 : 1;
      
      if (!active && trigger) {
        const isRight = dir > 0;
        onSwipeComplete(isRight ? 'right' : 'left');
        
        // Animate card off screen
        api.start({
          x: (200 + window.innerWidth) * dir,
          rotate: mx / 100 + (isRight ? 1 : -1) * 10,
          config: { tension: 200, friction: 20 }
        });
        
        onSwipeEnd?.();
        return;
      }
      
      if (active && !isDragging) {
        setIsDragging(true);
        onSwipeStart?.();
      } else if (!active && isDragging) {
        setIsDragging(false);
        onSwipeEnd?.();
      }

      api.start({
        x: active ? mx : 0,
        rotate: active ? mx / 100 + (mx > 0 ? 1 : -1) * 1 : 0,
        immediate: (name) => active && name === 'x'
      });
    },
    { axis: 'x' }
  );

  const transform = x.to((x) => `translate3d(${x}px, 0, 0) rotateZ(${rotate.get()}deg)`);
  const opacity = x.to([-200, -50, 0, 50, 200], [0, 0.5, 1, 0.5, 0]);

  return {
    bind,
    transform: transform.get(),
    opacity: opacity.get(),
    isDragging
  };
}
