export type BijiExpression = 'sleeping' | 'happy' | 'worried' | 'hint' | 'celebrate';

const BIJI_IMAGE_MAP: Record<BijiExpression, string> = {
  sleeping: '/assets/images/mascot-biji-sleeping.png',
  happy: '/assets/images/mascot-biji-happy.png',
  worried: '/assets/images/mascot-biji-worried.png',
  hint: '/assets/images/mascot-biji-hint.png',
  celebrate: '/assets/images/mascot-biji-celebrate.png'
};

interface BijiSvgProps {
  expression: BijiExpression;
  variant?: 'hero' | 'companion';
  id?: string;
}

export function BijiSvg({ expression, variant = 'companion', id }: BijiSvgProps) {
  if (variant === 'hero') {
    // Keep hero Pico firmly standing on grass even when all badges celebrate
    const heroSrc =
      expression === 'sleeping'
        ? BIJI_IMAGE_MAP.sleeping
        : BIJI_IMAGE_MAP.happy;

    return (
      <g
        id={id}
        className={`biji-svg${expression !== 'sleeping' ? ' biji-hero-awake' : ''}`}
        data-state={expression}
      >
        {/* Ground contact ellipse anchoring Pico firmly onto the meadow grass */}
        <ellipse cx="48" cy="94" rx="26" ry="5.5" fill="rgba(41, 58, 48, 0.28)" />
        <image
          href={heroSrc}
          x="-6"
          y="-4"
          width="108"
          height="108"
          preserveAspectRatio="xMidYMid meet"
        />
        {expression === 'celebrate' && (
          <g id="hero-pico-sparkles" aria-hidden="true">
            <circle className="pico-petal-float" cx="8" cy="36" r="4" fill="#F5D77D" />
            <circle
              className="pico-petal-float"
              cx="88"
              cy="28"
              r="3.8"
              fill="#E9A58E"
              style={{ animationDelay: '0.8s' }}
            />
            <circle
              className="pico-petal-float"
              cx="22"
              cy="10"
              r="3.2"
              fill="#F5D77D"
              style={{ animationDelay: '1.4s' }}
            />
            <path
              className="pico-petal-float"
              d="M84 54l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5z"
              fill="#F5D77D"
              style={{ animationDelay: '0.4s' }}
            />
          </g>
        )}
      </g>
    );
  }

  const src = BIJI_IMAGE_MAP[expression] || BIJI_IMAGE_MAP.happy;

  return (
    <img
      id={id}
      src={src}
      alt=""
      aria-hidden="true"
      className="biji-svg w-14 h-14 object-contain select-none pointer-events-none"
      data-state={expression}
      width={56}
      height={56}
    />
  );
}
