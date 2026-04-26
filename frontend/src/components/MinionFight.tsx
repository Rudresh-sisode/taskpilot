import { cn } from "../lib/cn";

export function MinionFight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 170"
      className={cn("select-none", className)}
      role="img"
      aria-label="Two playful task mascots arguing"
    >
      <ellipse cx="130" cy="154" rx="86" ry="8" fill="rgba(0,0,0,0.12)" />

      <g className="fight-left" style={{ transformOrigin: "86px 128px" }}>
        <MascotBody x={50} color="#facc15" overall="#2563eb" eye="#7c3aed" mark="!" />
        <path
          d="M105 93 Q128 80 145 96"
          fill="none"
          stroke="#facc15"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <circle cx="146" cy="97" r="6" fill="#1c1917" />
      </g>

      <g className="fight-right" style={{ transformOrigin: "174px 128px" }}>
        <g transform="scale(-1 1) translate(-260 0)">
          <MascotBody x={50} color="#fde047" overall="#64748b" eye="#0ea5e9" mark="?" />
          <path
            d="M105 93 Q128 80 145 96"
            fill="none"
            stroke="#fde047"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <circle cx="146" cy="97" r="6" fill="#1c1917" />
        </g>
      </g>

      <g className="fight-cloud" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M108 48 C118 34 137 37 140 50 C154 45 166 58 158 71 C171 80 160 96 145 90 C136 104 116 101 113 87 C98 91 90 75 101 66 C91 56 96 45 108 48Z"
          fill="#fff"
          stroke="#e4e4e7"
          strokeWidth="2"
        />
        <path d="M118 58 L132 50 L127 66 L143 58" stroke="#a855f7" strokeWidth="3" />
        <path d="M116 76 H129" stroke="#f59e0b" strokeWidth="3" />
        <path d="M140 76 H153" stroke="#0ea5e9" strokeWidth="3" />
      </g>

      <g className="fight-marks" fontFamily="Inter, sans-serif" fontWeight="900">
        <text x="34" y="38" fontSize="20" fill="#8b5cf6">!</text>
        <text x="210" y="42" fontSize="22" fill="#0ea5e9">?</text>
        <text x="118" y="24" fontSize="16" fill="#f59e0b">!</text>
      </g>

      <style>{`
        .fight-left { animation: fight-left 0.72s ease-in-out infinite; }
        .fight-right { animation: fight-right 0.72s ease-in-out infinite; }
        .fight-cloud { animation: fight-cloud 0.42s ease-in-out infinite; transform-origin: 130px 68px; }
        .fight-marks { animation: fight-marks 1s ease-in-out infinite; }

        @keyframes fight-left {
          0%, 100% { transform: translateX(0) rotate(-3deg); }
          50% { transform: translateX(10px) rotate(4deg); }
        }
        @keyframes fight-right {
          0%, 100% { transform: translateX(0) rotate(3deg); }
          50% { transform: translateX(-10px) rotate(-4deg); }
        }
        @keyframes fight-cloud {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          50% { transform: scale(1.06) rotate(2deg); }
        }
        @keyframes fight-marks {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fight-left, .fight-right, .fight-cloud, .fight-marks { animation: none; }
        }
      `}</style>
    </svg>
  );
}

function MascotBody({
  x,
  color,
  overall,
  eye,
  mark,
}: {
  x: number;
  color: string;
  overall: string;
  eye: string;
  mark: string;
}) {
  return (
    <g>
      <path d={`M${x + 25} 25 Q${x + 20} 10 ${x + 28} 8 Q${x + 30} 18 ${x + 31} 28Z`} fill="#1c1917" />
      <path d={`M${x + 43} 26 Q${x + 48} 11 ${x + 55} 13 Q${x + 50} 22 ${x + 48} 30Z`} fill="#1c1917" />
      <rect
        x={x}
        y="28"
        width="76"
        height="104"
        rx="38"
        fill={color}
        stroke="#a16207"
        strokeWidth="1.2"
      />
      <rect x={x} y="53" width="76" height="6" fill="#1c1917" />
      <circle cx={x + 38} cy="56" r="21" fill="#1c1917" />
      <circle cx={x + 38} cy="56" r="16" fill="#e5e7eb" />
      <circle cx={x + 38} cy="56" r="13" fill="#fff" />
      <circle cx={x + 38} cy="56" r="5" fill={eye} />
      <circle cx={x + 40} cy="54" r="1.5" fill="#fff" />
      <path
        d={`M${x + 23} 84 Q${x + 38} 74 ${x + 53} 84`}
        stroke="#1c1917"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${x} 102 L${x} 129 Q${x} 133 ${x + 4} 133 L${x + 72} 133 Q${x + 76} 133 ${x + 76} 129 L${x + 76} 102 L${x + 60} 102 L${x + 55} 111 L${x + 21} 111 L${x + 16} 102Z`}
        fill={overall}
        stroke="#1e3a8a"
        strokeWidth="1"
      />
      <rect x={x + 26} y="116" width="24" height="13" rx="2" fill="#1d4ed8" opacity="0.75" />
      <text
        x={x + 38}
        y="126"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="10"
        fontWeight="900"
        fill="#fde68a"
      >
        {mark}
      </text>
      <path
        d={`M${x + 7} 95 Q${x - 8} 103 ${x - 11} 119`}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx={x - 11} cy="120" r="6" fill="#1c1917" />
      <ellipse cx={x + 24} cy="139" rx="10" ry="4" fill="#1c1917" />
      <ellipse cx={x + 52} cy="139" rx="10" ry="4" fill="#1c1917" />
    </g>
  );
}
