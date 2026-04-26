import { cn } from "../lib/cn";

export function MinionRunner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 160"
      className={cn("select-none", className)}
      role="img"
      aria-label="Energetic minion mascot running"
    >
      <ellipse cx="70" cy="151" rx="34" ry="4" fill="rgba(0,0,0,0.16)" />
      <g className="runner-bob" style={{ transformOrigin: "70px 130px" }}>
        <g className="runner-lean" style={{ transformOrigin: "70px 92px" }}>
          <path d="M53 20 Q50 8 57 6 Q58 15 58 24 Z" fill="#1c1917" />
          <path d="M68 19 Q68 5 75 5 Q73 15 72 24 Z" fill="#1c1917" />
          <path d="M83 22 Q88 10 94 13 Q89 20 86 27 Z" fill="#1c1917" />

          <rect
            x="30"
            y="22"
            width="80"
            height="104"
            rx="40"
            fill="#facc15"
            stroke="#a16207"
            strokeWidth="1.2"
          />
          <rect x="30" y="49" width="80" height="6" fill="#1c1917" />

          <circle cx="56" cy="52" r="17" fill="#1c1917" />
          <circle cx="84" cy="52" r="17" fill="#1c1917" />
          <circle cx="56" cy="52" r="12.5" fill="#e5e7eb" />
          <circle cx="84" cy="52" r="12.5" fill="#e5e7eb" />
          <circle cx="56" cy="52" r="9.5" fill="#fff" />
          <circle cx="84" cy="52" r="9.5" fill="#fff" />
          <circle cx="59" cy="52" r="4.5" fill="#2563eb" />
          <circle cx="87" cy="52" r="4.5" fill="#2563eb" />
          <circle cx="60" cy="50" r="1.2" fill="#fff" />
          <circle cx="88" cy="50" r="1.2" fill="#fff" />

          <path
            d="M51 80 Q70 94 89 80"
            stroke="#1c1917"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M30 99 L30 126 Q30 130 34 130 L106 130 Q110 130 110 126 L110 99
               L92 99 L87 108 L53 108 L48 99 Z"
            fill="#2563eb"
            stroke="#1d4ed8"
            strokeWidth="1"
          />
          <rect x="58" y="113" width="24" height="13" rx="2" fill="#1d4ed8" />
          <text
            x="70"
            y="123"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="8"
            fontWeight="800"
            fill="#fde68a"
          >
            GO
          </text>

          <g className="runner-arm-left" style={{ transformOrigin: "31px 94px" }}>
            <path
              d="M31 91 Q16 91 11 78 Q9 72 15 69 L24 82 Z"
              fill="#facc15"
              stroke="#a16207"
              strokeWidth="1"
            />
            <circle cx="13" cy="69" r="5" fill="#1c1917" />
          </g>
          <g className="runner-arm-right" style={{ transformOrigin: "109px 94px" }}>
            <path
              d="M109 91 Q126 99 129 115 Q130 121 123 123 L114 105 Z"
              fill="#facc15"
              stroke="#a16207"
              strokeWidth="1"
            />
            <circle cx="124" cy="123" r="5" fill="#1c1917" />
          </g>

          <g className="runner-leg-left" style={{ transformOrigin: "53px 130px" }}>
            <path d="M51 128 Q43 140 33 143" stroke="#1c1917" strokeWidth="8" strokeLinecap="round" />
          </g>
          <g className="runner-leg-right" style={{ transformOrigin: "87px 130px" }}>
            <path d="M88 128 Q102 136 111 130" stroke="#1c1917" strokeWidth="8" strokeLinecap="round" />
          </g>
        </g>
      </g>
      <g className="runner-streaks" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" opacity="0.75">
        <path d="M12 52 H0" />
        <path d="M18 76 H4" />
        <path d="M24 100 H8" />
      </g>

      <style>{`
        .runner-bob { animation: runner-bob 0.55s ease-in-out infinite; }
        .runner-lean { animation: runner-lean 1.1s ease-in-out infinite; }
        .runner-arm-left { animation: runner-arm 0.55s ease-in-out infinite; }
        .runner-arm-right { animation: runner-arm 0.55s ease-in-out infinite reverse; }
        .runner-leg-left { animation: runner-leg 0.55s ease-in-out infinite; }
        .runner-leg-right { animation: runner-leg 0.55s ease-in-out infinite reverse; }
        .runner-streaks { animation: runner-streaks 0.7s linear infinite; }

        @keyframes runner-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes runner-lean {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes runner-arm {
          0%, 100% { transform: rotate(18deg); }
          50% { transform: rotate(-24deg); }
        }
        @keyframes runner-leg {
          0%, 100% { transform: rotate(16deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes runner-streaks {
          0% { transform: translateX(8px); opacity: 0; }
          35% { opacity: 0.8; }
          100% { transform: translateX(-10px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .runner-bob, .runner-lean, .runner-arm-left, .runner-arm-right,
          .runner-leg-left, .runner-leg-right, .runner-streaks { animation: none; }
        }
      `}</style>
    </svg>
  );
}

export function MinionBewildered({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 160"
      className={cn("select-none", className)}
      role="img"
      aria-label="Bewildered minion mascot"
    >
      <ellipse cx="70" cy="151" rx="32" ry="4" fill="rgba(0,0,0,0.16)" />
      <g className="bewildered-wobble" style={{ transformOrigin: "70px 130px" }}>
        <path d="M55 23 Q47 10 53 7 Q57 15 60 25 Z" fill="#1c1917" />
        <path d="M70 20 Q72 6 80 7 Q76 15 76 25 Z" fill="#1c1917" />
        <path d="M84 24 Q96 14 101 20 Q91 22 88 28 Z" fill="#1c1917" />

        <rect
          x="31"
          y="24"
          width="78"
          height="104"
          rx="39"
          fill="#fde047"
          stroke="#a16207"
          strokeWidth="1.2"
        />
        <rect x="31" y="50" width="78" height="6" fill="#1c1917" />

        <circle cx="55" cy="53" r="18" fill="#1c1917" />
        <circle cx="85" cy="53" r="18" fill="#1c1917" />
        <circle cx="55" cy="53" r="13" fill="#e5e7eb" />
        <circle cx="85" cy="53" r="13" fill="#e5e7eb" />
        <circle cx="55" cy="53" r="10" fill="#fff" />
        <circle cx="85" cy="53" r="10" fill="#fff" />
        <circle className="bewildered-eye-left" cx="51" cy="55" r="4" fill="#1c1917" />
        <circle className="bewildered-eye-right" cx="90" cy="50" r="4" fill="#1c1917" />
        <circle cx="52" cy="53" r="1" fill="#fff" />
        <circle cx="91" cy="48" r="1" fill="#fff" />

        <ellipse cx="70" cy="84" rx="9" ry="11" fill="#1c1917" />
        <ellipse cx="70" cy="86" rx="5" ry="6" fill="#7c2d12" />
        <ellipse cx="43" cy="80" rx="5" ry="3" fill="#fb7185" opacity="0.4" />
        <ellipse cx="97" cy="80" rx="5" ry="3" fill="#fb7185" opacity="0.4" />

        <path
          d="M31 99 L31 127 Q31 131 35 131 L105 131 Q109 131 109 127 L109 99
             L91 99 L86 108 L54 108 L49 99 Z"
          fill="#64748b"
          stroke="#475569"
          strokeWidth="1"
        />
        <rect x="59" y="114" width="22" height="13" rx="2" fill="#475569" />
        <text
          x="70"
          y="124"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="800"
          fill="#fde68a"
        >
          ?
        </text>

        <g className="bewildered-arm-left" style={{ transformOrigin: "31px 92px" }}>
          <path
            d="M32 91 Q16 82 14 66 Q13 59 20 57 L28 78 Z"
            fill="#fde047"
            stroke="#a16207"
            strokeWidth="1"
          />
          <circle cx="20" cy="56" r="5" fill="#1c1917" />
        </g>
        <g className="bewildered-arm-right" style={{ transformOrigin: "109px 92px" }}>
          <path
            d="M108 91 Q124 82 126 66 Q127 59 120 57 L112 78 Z"
            fill="#fde047"
            stroke="#a16207"
            strokeWidth="1"
          />
          <circle cx="120" cy="56" r="5" fill="#1c1917" />
        </g>

        <ellipse cx="52" cy="135" rx="10" ry="4" fill="#1c1917" />
        <ellipse cx="88" cy="135" rx="10" ry="4" fill="#1c1917" />
      </g>

      <g className="bewildered-marks" fill="#8b5cf6" fontFamily="Inter, sans-serif" fontWeight="800">
        <text x="13" y="35" fontSize="22">?</text>
        <text x="112" y="41" fontSize="18">!</text>
        <text x="104" y="22" fontSize="14">?</text>
      </g>

      <style>{`
        .bewildered-wobble { animation: bewildered-wobble 1.05s ease-in-out infinite; }
        .bewildered-arm-left { animation: bewildered-arm 1s ease-in-out infinite; }
        .bewildered-arm-right { animation: bewildered-arm 1s ease-in-out infinite reverse; }
        .bewildered-eye-left { animation: bewildered-eye-left 1.3s ease-in-out infinite; }
        .bewildered-eye-right { animation: bewildered-eye-right 1.3s ease-in-out infinite; }
        .bewildered-marks { animation: bewildered-marks 1.1s ease-in-out infinite; }

        @keyframes bewildered-wobble {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes bewildered-arm {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes bewildered-eye-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes bewildered-eye-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes bewildered-marks {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bewildered-wobble, .bewildered-arm-left, .bewildered-arm-right,
          .bewildered-eye-left, .bewildered-eye-right, .bewildered-marks { animation: none; }
        }
      `}</style>
    </svg>
  );
}
