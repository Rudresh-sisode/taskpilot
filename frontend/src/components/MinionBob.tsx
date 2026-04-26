import { cn } from "../lib/cn";

/**
 * Stylized "Bob" — a single-eyed, minion-inspired mascot.
 * Pure inline SVG so it scales crisply and animates via CSS.
 */
export function MinionBob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={cn("select-none", className)}
      role="img"
      aria-label="Bob the minion celebrating"
    >
      {/* Drop shadow */}
      <ellipse cx="60" cy="152" rx="32" ry="4" fill="rgba(0,0,0,0.18)">
        <animate
          attributeName="rx"
          values="32;26;32"
          dur="1.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.18;0.28;0.18"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Bob group (bounces) */}
      <g className="bob-bounce" style={{ transformOrigin: "60px 130px" }}>
        {/* Hair */}
        <path
          d="M50 22 Q48 8 54 6 Q56 14 56 24 Z"
          fill="#1c1917"
          className="bob-hair"
          style={{ transformOrigin: "54px 22px" }}
        />
        <path
          d="M70 22 Q72 8 66 6 Q64 14 64 24 Z"
          fill="#1c1917"
          className="bob-hair-2"
          style={{ transformOrigin: "66px 22px" }}
        />

        {/* Body (yellow capsule) */}
        <rect
          x="22"
          y="20"
          width="76"
          height="106"
          rx="38"
          fill="#fcd34d"
          stroke="#a16207"
          strokeWidth="1.2"
        />

        {/* Body highlight */}
        <rect
          x="28"
          y="28"
          width="14"
          height="60"
          rx="7"
          fill="#fde68a"
          opacity="0.7"
        />

        {/* Goggle strap */}
        <rect x="22" y="46" width="76" height="6" fill="#1c1917" />

        {/* Goggle ring */}
        <circle cx="60" cy="49" r="22" fill="#1c1917" />
        <circle cx="60" cy="49" r="17" fill="#e5e7eb" />
        <circle cx="60" cy="49" r="14" fill="#ffffff" />

        {/* Eye (iris + pupil + sparkle) */}
        <g className="bob-eye">
          <circle cx="60" cy="49" r="9" fill="#7c3aed" />
          <circle cx="60" cy="49" r="9" fill="url(#irisGrad)" />
          <circle cx="60" cy="49" r="4.5" fill="#1c1917" />
          <circle cx="62" cy="46" r="1.6" fill="#ffffff" />
          <circle cx="58" cy="51" r="0.8" fill="#ffffff" />
        </g>

        {/* Eyelid (animated blink) */}
        <rect
          x="43"
          y="32"
          width="34"
          height="0"
          fill="#fcd34d"
          stroke="#a16207"
          strokeWidth="1"
          className="bob-blink"
        >
          <animate
            attributeName="height"
            values="0;0;0;0;0;17;0"
            keyTimes="0;0.7;0.75;0.78;0.82;0.86;1"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Smile */}
        <path
          d="M44 78 Q60 96 76 78"
          stroke="#1c1917"
          strokeWidth="2.2"
          fill="#1c1917"
          strokeLinecap="round"
        />
        <path d="M44 78 Q60 96 76 78" fill="#7c2d12" />
        {/* Teeth */}
        <rect x="54" y="80" width="5" height="6" fill="#fafafa" rx="1" />
        <rect x="61" y="80" width="5" height="6" fill="#fafafa" rx="1" />
        {/* Tongue hint */}
        <ellipse cx="60" cy="89" rx="6" ry="2.5" fill="#dc2626" opacity="0.8" />

        {/* Cheek blush */}
        <ellipse cx="36" cy="80" rx="5" ry="3" fill="#fb7185" opacity="0.45" />
        <ellipse cx="84" cy="80" rx="5" ry="3" fill="#fb7185" opacity="0.45" />

        {/* Overalls (denim) */}
        <path
          d="M22 100 L22 126 Q22 130 26 130 L94 130 Q98 130 98 126 L98 100
             L82 100 L78 108 L42 108 L38 100 Z"
          fill="#2563eb"
          stroke="#1d4ed8"
          strokeWidth="1"
        />
        {/* Pocket */}
        <rect
          x="48"
          y="112"
          width="24"
          height="14"
          rx="2"
          fill="#1d4ed8"
          stroke="#1e3a8a"
          strokeWidth="0.8"
        />
        <text
          x="60"
          y="123"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="9"
          fontWeight="700"
          fill="#fde68a"
        >
          G
        </text>
        {/* Strap buttons */}
        <circle cx="42" cy="103" r="1.6" fill="#fde68a" />
        <circle cx="78" cy="103" r="1.6" fill="#fde68a" />

        {/* Left arm (static, holding flag) */}
        <g>
          <path
            d="M22 92 Q14 96 14 108 Q14 116 22 118 L26 110 Z"
            fill="#fcd34d"
            stroke="#a16207"
            strokeWidth="1"
          />
          <circle cx="14" cy="112" r="5" fill="#1c1917" />
        </g>

        {/* Right arm (waving) */}
        <g
          className="bob-wave"
          style={{ transformOrigin: "98px 100px" }}
        >
          <path
            d="M98 92 Q108 88 112 78 Q114 70 108 66 L102 78 Z"
            fill="#fcd34d"
            stroke="#a16207"
            strokeWidth="1"
          />
          <circle cx="108" cy="64" r="5.5" fill="#1c1917" />
        </g>

        {/* Feet */}
        <ellipse cx="42" cy="134" rx="10" ry="4" fill="#1c1917" />
        <ellipse cx="78" cy="134" rx="10" ry="4" fill="#1c1917" />
      </g>

      <defs>
        <radialGradient id="irisGrad" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.6" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </radialGradient>
      </defs>

      <style>{`
        .bob-bounce { animation: bob-bounce 1.4s ease-in-out infinite; }
        .bob-wave { animation: bob-wave 0.9s ease-in-out infinite; }
        .bob-hair { animation: bob-hair 2.2s ease-in-out infinite; }
        .bob-hair-2 { animation: bob-hair 2.2s ease-in-out infinite reverse; }

        @keyframes bob-bounce {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes bob-wave {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(25deg); }
        }
        @keyframes bob-hair {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .bob-bounce, .bob-wave, .bob-hair, .bob-hair-2 { animation: none; }
        }
      `}</style>
    </svg>
  );
}
