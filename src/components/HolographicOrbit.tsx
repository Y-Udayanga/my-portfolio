export default function HolographicOrbit() {
  return (
    <svg className="holographic-orbit" viewBox="0 0 600 620" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="orbit-light">
          <stop stopColor="#00f0ff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="290" r="235" fill="url(#orbit-light)" />
      <circle cx="300" cy="290" r="230" stroke="#00f0ff" strokeOpacity="0.16" strokeWidth="0.8" />
      <g className="orbital-sweep">
        <circle cx="300" cy="290" r="216" stroke="#00f0ff" strokeOpacity="0.38" strokeDasharray="100 35 1 25" strokeWidth="1" />
        {Array.from({ length: 72 }, (_, i) => (
          <path
            key={i}
            d={`M300 ${i % 6 === 0 ? '62' : '68'}V75`}
            transform={`rotate(${i * 5} 300 290)`}
            stroke="#00f0ff"
            strokeOpacity={i % 6 === 0 ? '0.55' : '0.18'}
            strokeWidth={i % 6 === 0 ? '1.4' : '0.6'}
          />
        ))}
      </g>
      <g className="orbital-sweep reverse">
        <circle cx="300" cy="290" r="194" stroke="#a855f7" strokeOpacity="0.22" strokeDasharray="180 450" strokeWidth="1" />
        <circle cx="494" cy="290" r="3" fill="#00f0ff" fillOpacity="0.85" />
      </g>
      <path d="M35 290h35m460 0h35M300 25v28m0 474v28" stroke="#00f0ff" strokeOpacity="0.32" strokeWidth="0.8" />
      <ellipse cx="300" cy="555" rx="195" ry="29" stroke="#00f0ff" strokeOpacity="0.35" strokeWidth="1" />
      <ellipse cx="300" cy="555" rx="171" ry="20" stroke="#a855f7" strokeOpacity="0.25" strokeDasharray="4 11" strokeWidth="0.8" />
    </svg>
  );
}
