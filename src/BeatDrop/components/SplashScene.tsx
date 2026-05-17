// Beat Drop splash — dark club poster. Same structural slots as the Piper
// splash (sky / halo / particles / floor plane / back layer / front layer /
// content overlay) so the SplashScene.less hierarchy survives. Visuals are
// retargeted: smoke-and-laser sky, spotlit DJ booth, crowd silhouettes,
// neon barrier posts, "Beat Drop" wordmark.

import { useState } from 'react';
import { t } from '../i18n';

interface Puff {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  hue: number;
}

export function SplashScene({ onStart, highScore }: { onStart: () => void; highScore: number }) {
  // confetti/sparkles drifting up the screen — varied neon hues
  const [puffs] = useState<Puff[]>(() =>
    Array.from({ length: 38 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: -Math.random() * 18,
      duration: 12 + Math.random() * 12,
      size: 4 + Math.random() * 7,
      hue: Math.floor(Math.random() * 4), // pink / cyan / amber / lime
    }))
  );

  return (
    <div className="bd-splash">
      <div className="bd-splash__sky" />
      <div className="bd-splash__sun" />

      <div className="bd-splash__pollen">
        {puffs.map(f => (
          <div
            key={f.id}
            className={`bd-splash__puff bd-splash__puff--h${f.hue}`}
            style={{
              left: `${f.x}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
            }}
          />
        ))}
      </div>

      {/* polished dance floor — equivalent to PR's ice plane / Piper's pasture */}
      <div className="bd-splash__pasture" />

      {/* back layer — distant laser beams cutting through haze */}
      <div className="bd-splash__hills bd-splash__hills--back">
        <svg viewBox="0 0 1600 240" preserveAspectRatio="none" width="200%" height="100%">
          <defs>
            <linearGradient id="bd-laser-pink" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%"  stopColor="#ff3ea5" stopOpacity="0.0" />
              <stop offset="60%" stopColor="#ff3ea5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff3ea5" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="bd-laser-cyan" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%"  stopColor="#38e6ff" stopOpacity="0.0" />
              <stop offset="60%" stopColor="#38e6ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38e6ff" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="bd-laser-amber" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%"  stopColor="#ffd84a" stopOpacity="0.0" />
              <stop offset="60%" stopColor="#ffd84a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffd84a" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* angled laser beams emanating from the stage area at the top */}
          <polygon points="780,0  900,240  860,240" fill="url(#bd-laser-pink)" />
          <polygon points="800,0  680,240  720,240" fill="url(#bd-laser-cyan)" />
          <polygon points="820,0 1080,240 1040,240" fill="url(#bd-laser-amber)" />
          <polygon points="780,0  520,240  560,240" fill="url(#bd-laser-pink)" opacity=".7" />
          <polygon points="800,0 1240,240 1200,240" fill="url(#bd-laser-cyan)" opacity=".7" />
        </svg>
      </div>

      {/* front layer — DJ booth silhouette + crowd silhouettes + barrier posts */}
      <div className="bd-splash__hills bd-splash__hills--front">
        <svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMax meet" width="100%" height="100%">
          <defs>
            <linearGradient id="bd-floor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stopColor="#1c1230" />
              <stop offset="50%" stopColor="#15091f" />
              <stop offset="100%" stopColor="#06060c" />
            </linearGradient>
            <linearGradient id="bd-stage" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0e0716" />
              <stop offset="100%" stopColor="#06030c" />
            </linearGradient>
          </defs>

          {/* polished floor with reflection */}
          <path
            d="M0,280 L0,210 L800,210 L800,280 Z"
            fill="url(#bd-floor)"
          />

          {/* DJ booth — wide platform centered, multiple LED stripes, back wall */}
          <g transform="translate(400,140)">
            {/* back LED wall — dark with horizontal neon lines */}
            <rect x="-180" y="-60" width="360" height="60" fill="#06030c" />
            <rect x="-180" y="-54" width="360" height="2" fill="#ff3ea5" />
            <rect x="-180" y="-44" width="360" height="2" fill="#38e6ff" />
            <rect x="-180" y="-34" width="360" height="2" fill="#ff3ea5" />
            <rect x="-180" y="-24" width="360" height="2" fill="#38e6ff" />
            <rect x="-180" y="-14" width="360" height="2" fill="#ff3ea5" />
            <rect x="-180" y= "-4" width="360" height="2" fill="#38e6ff" />

            {/* truss with hanging moving heads */}
            <rect x="-200" y="-70" width="400" height="6" fill="#16161e" />
            {[-140, -70, 0, 70, 140].map((x, i) => (
              <g key={i} transform={`translate(${x},-60)`}>
                <rect x="-5" y="0" width="10" height="10" fill="#16161e" />
                <polygon points="-7,10 7,10 4,18 -4,18" fill="#ffd84a" opacity={0.7 + (i % 2) * 0.2} />
              </g>
            ))}

            {/* stage platform */}
            <rect x="-160" y="0" width="320" height="36" fill="url(#bd-stage)" />
            {/* front fascia strips */}
            <rect x="-160" y="2"  width="320" height="3" fill="#ff3ea5" />
            <rect x="-160" y="30" width="320" height="2" fill="#38e6ff" />

            {/* DJ silhouette behind the console */}
            <g transform="translate(0,-8)">
              {/* shoulders + torso */}
              <rect x="-22" y="-2" width="44" height="22" rx="6" fill="#0a0a10" />
              {/* head */}
              <circle cx="0" cy="-10" r="11" fill="#0a0a10" />
              {/* headphone band */}
              <path d="M -11 -16 Q 0 -26 11 -16" stroke="#38e6ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="-12" cy="-12" r="3.5" fill="#0a0a10" stroke="#38e6ff" strokeWidth="1.2" />
              <circle cx=" 12" cy="-12" r="3.5" fill="#0a0a10" stroke="#38e6ff" strokeWidth="1.2" />
              {/* arms up */}
              <rect x="-26" y="-2" width="6" height="14" rx="3" transform="rotate(-25 -23 5)" fill="#0a0a10" />
              <rect x=" 20" y="-2" width="6" height="14" rx="3" transform="rotate( 25 23 5)" fill="#0a0a10" />
            </g>

            {/* turntables flanking the DJ */}
            {[-70, 70].map((x, i) => (
              <g key={i} transform={`translate(${x},14)`}>
                <ellipse cx="0" cy="0" rx="22" ry="6" fill="#0a0a10" />
                <ellipse cx="0" cy="-2" rx="18" ry="4" fill="#3a2a18" />
                <circle cx="0" cy="-2" r="2" fill="#ffd84a" />
              </g>
            ))}

            {/* console between turntables */}
            <rect x="-44" y="6" width="88" height="14" rx="3" fill="#15151c" />
            <rect x="-40" y="9" width="80" height="2" fill="#ff3ea5" opacity="0.85" />
          </g>

          {/* speaker stacks at the corners of the stage */}
          {[200, 600].map((x, i) => (
            <g key={i} transform={`translate(${x},162)`}>
              <rect x="-12" y="-44" width="24" height="48" rx="3" fill="#06030c" />
              <circle cx="0" cy="-32" r="5.5" fill="#1a1a22" />
              <circle cx="0" cy="-18" r="5.5" fill="#1a1a22" />
              <circle cx="0" cy="-4"  r="5.5" fill="#1a1a22" />
              {/* side LED */}
              <rect x="11" y="-44" width="1.5" height="48" fill={i === 0 ? "#38e6ff" : "#ff3ea5"} />
            </g>
          ))}

          {/* crowd silhouette — rows of black head bumps in front of the stage */}
          {[182, 192, 200, 208].map((y, row) => {
            const cnt = 32 + row * 4;
            const spread = 800;
            return (
              <g key={row} opacity={0.95 - row * 0.05}>
                {Array.from({ length: cnt }).map((_, i) => {
                  const cx = (i + 0.5) * (spread / cnt) + (row % 2 === 0 ? 0 : (spread / cnt) * 0.5);
                  const hr = 4.5 + ((i * 17 + row * 7) % 4) * 0.6;
                  return (
                    <ellipse
                      key={i}
                      cx={cx}
                      cy={y}
                      rx={hr}
                      ry={hr * 0.85}
                      fill="#020207"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* a handful of raised hands among the crowd */}
          {[120, 240, 360, 480, 600, 720].map((x, i) => (
            <g key={i}>
              <rect x={x - 0.8} y={175 - ((i % 2) * 3)} width="1.6" height="10" fill="#020207" />
              <circle cx={x} cy={172 - ((i % 2) * 3)} r="1.4" fill="#020207" />
            </g>
          ))}

          {/* glowing barrier posts on the runway in front of the crowd */}
          {[160, 280, 400, 520, 640].map((x, i) => (
            <g key={i} transform={`translate(${x},226)`}>
              <rect x="-1.2" y="-22" width="2.4" height="22" fill="#1a1a22" />
              <circle cx="0" cy="-22" r="3.5" fill="#ff3ea5" />
              <circle cx="0" cy="-22" r="6.5" fill="#ff3ea5" opacity="0.25" />
            </g>
          ))}
          {/* barrier belts */}
          {[[160, 280], [280, 400], [400, 520], [520, 640]].map(([a, b], i) => (
            <line key={i} x1={a} y1="224" x2={b} y2="224" stroke="#2a2a30" strokeWidth="1.5" />
          ))}

          {/* a faint dance floor LED grid in the foreground — only a hint */}
          <g opacity="0.18">
            {[230, 245, 260].map(y => (
              <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#38e6ff" strokeWidth=".5" />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 80} y1="225" x2={i * 80} y2="278" stroke="#38e6ff" strokeWidth=".5" />
            ))}
          </g>
        </svg>
      </div>

      <div className="bd-splash__content">
        <h1 className="bd-splash__title">
          <span className="bd-splash__title-emph">Beat</span>
          <span className="bd-splash__title-emph bd-splash__title-emph--accent">Drop</span>
        </h1>
        <p className="bd-splash__subtitle">{t('subtitle')}</p>

        {highScore > 0 && (
          <div className="bd-splash__best">
            <span className="bd-splash__best-label">BEST</span>
            <span className="bd-splash__best-value">{highScore}</span>
          </div>
        )}

        <button className="bd-splash__cta" onPointerDown={onStart}>
          <span className="bd-splash__cta-text">{t('tap_to_start')}</span>
          <span className="bd-splash__cta-pulse" aria-hidden />
        </button>
      </div>
    </div>
  );
}
