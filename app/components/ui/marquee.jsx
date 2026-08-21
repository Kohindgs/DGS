import { cn } from '@/lib/utils';

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  speed = 'normal',
  ...props
}) {
  const speedVariants = {
    slow: '[--duration:80s]',
    normal: '[--duration:40s]',
    fast: '[--duration:18s]',
  };

  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden p-1 [--gap:1rem] [gap:var(--gap)]',
        speedVariants[speed],
        vertical ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
            'animate-marquee flex-row': !vertical,
            'animate-marquee-vertical flex-col': vertical,
            'group-hover:[animation-play-state:paused]': pauseOnHover,
            '[animation-direction:reverse]': reverse,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
