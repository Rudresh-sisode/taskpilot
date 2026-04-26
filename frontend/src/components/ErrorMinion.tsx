import { cn } from "../lib/cn";

export function ErrorMinion({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 160"
      className={cn("select-none", className)}
      role="img"
      aria-label="Worried task mascot reporting an error"
    >
      <ellipse cx="65" cy="151" rx="34" ry="5" fill="rgba(0,0,0,0.18)" />
      <g className="error-minion-shake" style={{ transformOrigin: "65px 128px" }}>
        <path d="M47 25 Q39 9 47 7 Q52 17 52 28Z" fill="#1c1917" />
        <path d="M64 22 Q66 6 75 7 Q72 18 71 28Z" fill="#1c1917" />
        <path d="M80 25 Q94 11 99 19 Q89 23 84 31Z" fill="#1c1917" />

        <rect
          x="24"
          y="26"
          width="82"
          height="106"
          rx="41"
          fill="#facc15"
          stroke="#a16207"
          strokeWidth="1.2"
        />
        <rect x="24" y="53" width="82" height="7" fill="#1c1917" />

        <circle cx="51" cy="56" r="19" fill="#1c1917" />
        <circle cx="79" cy="56" r="19" fill="#1c1917" />
        <circle cx="51" cy="56" r="14" fill="#e5e7eb" />
        <circle cx="79" cy="56" r="14" fill="#e5e7eb" />
        <circle cx="51" cy="56" r="11" fill="#fff" />
        <circle cx="79" cy="56" r="11" fill="#fff" />
        <circle className="error-eye-left" cx="47" cy="58" r="4.3" fill="#991b1b" />
        <circle className="error-eye-right" cx="84" cy="58" r="4.3" fill="#991b1b" />
        <circle cx="48" cy="56" r="1.2" fill="#fff" />
        <circle cx="85" cy="56" r="1.2" fill="#fff" />

        <path
          d="M47 86 Q65 76 83 86"
          stroke="#1c1917"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="39" cy="80" rx="4" ry="3" fill="#fb7185" opacity="0.45" />
        <ellipse cx="91" cy="80" rx="4" ry="3" fill="#fb7185" opacity="0.45" />

        <path
          d="M24 102 L24 129 Q24 133 28 133 L102 133 Q106 133 106 129 L106 102
             L87 102 L82 111 L48 111 L43 102Z"
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="1"
        />
        <rect x="53" y="116" width="24" height="13" rx="2" fill="#991b1b" opacity="0.8" />
        <text
          x="65"
          y="126"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="900"
          fill="#fee2e2"
        >
          ERR
        </text>

        <g className="error-arm-left" style={{ transformOrigin: "25px 95px" }}>
          <path
            d="M25 93 Q11 82 10 66 Q10 59 17 58 L25 79Z"
            fill="#facc15"
            stroke="#a16207"
            strokeWidth="1"
          />
          <circle cx="17" cy="58" r="5.5" fill="#1c1917" />
        </g>
        <g className="error-arm-right" style={{ transformOrigin: "105px 95px" }}>
          <path
            d="M105 93 Q119 82 120 66 Q120 59 113 58 L105 79Z"
            fill="#facc15"
            stroke="#a16207"
            strokeWidth="1"
          />
          <circle cx="113" cy="58" r="5.5" fill="#1c1917" />
        </g>

        <ellipse cx="47" cy="138" rx="10" ry="4" fill="#1c1917" />
        <ellipse cx="83" cy="138" rx="10" ry="4" fill="#1c1917" />
      </g>

      <g className="error-alert" fontFamily="Inter, sans-serif" fontWeight="900">
        <text x="8" y="36" fontSize="24" fill="#ef4444">!</text>
        <text x="108" y="40" fontSize="20" fill="#ef4444">!</text>
      </g>

      <style>{`
        .error-minion-shake { animation: error-minion-shake 0.7s ease-in-out infinite; }
        .error-eye-left { animation: error-eye-left 1.2s ease-in-out infinite; }
        .error-eye-right { animation: error-eye-right 1.2s ease-in-out infinite; }
        .error-arm-left { animation: error-arm 0.9s ease-in-out infinite; }
        .error-arm-right { animation: error-arm 0.9s ease-in-out infinite reverse; }
        .error-alert { animation: error-alert 0.95s ease-in-out infinite; }

        @keyframes error-minion-shake {
          0%, 100% { transform: translateX(0) rotate(-1deg); }
          25% { transform: translateX(-3px) rotate(1.5deg); }
          75% { transform: translateX(3px) rotate(-1.5deg); }
        }
        @keyframes error-eye-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes error-eye-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes error-arm {
          0%, 100% { transform: rotate(-7deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes error-alert {
          0%, 100% { transform: translateY(0); opacity: 0.85; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .error-minion-shake, .error-eye-left, .error-eye-right,
          .error-arm-left, .error-arm-right, .error-alert { animation: none; }
        }
      `}</style>
    </svg>
  );
}
