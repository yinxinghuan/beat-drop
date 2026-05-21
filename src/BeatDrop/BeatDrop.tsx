import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Leaderboard, useGameScore } from '@shared/leaderboard';
import { Scene } from './components/Scene';
import { SplashScene } from './components/SplashScene';
import { createGameState, ROUND_CLEAR_DURATION } from './hooks/useGameLoop';
import type { DeliveryInfo, RoundClearInfo } from './hooks/useGameLoop';
import { useJoystick } from './hooks/useJoystick';
import { playSfx, startBgm, stopBgm, unlockAudio } from './utils/audio';
import { t } from './i18n';
import {
  BARK_COOLDOWN, DYE_NAME, DYE_PALETTE, NpcBehavior,
  TARGET_PER_GATE, roundTime,
} from './constants';
import { nextEnvForRound } from './environment';
import alteruSvg from './img/alteru.svg';
import './BeatDrop.less';
import './SplashScene.less';

type Phase = 'splash' | 'playing' | 'gameover';

const HIGH_KEY = 'beat_drop_high';
const BEHAVIOR_KEY = 'beat_drop_behavior';

interface Pellet {
  key: number;
  text: string;
  sign: 1 | -1;
  color: string;
  side: 'left' | 'right' | 'center';
}

interface WolfFx {
  key: number;
  count: number;
}

interface GateProgress {
  color: number;
  delivered: number;
}

export function BeatDrop() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(roundTime(1));
  const [highScore, setHighScore] = useState<number>(() => Number(localStorage.getItem(HIGH_KEY) || 0));
  const [finalScore, setFinalScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [pellet, setPellet] = useState<Pellet | null>(null);
  const [wolfFx, setWolfFx] = useState<WolfFx | null>(null);
  const [, setCombo] = useState(0);
  const [comboMult, setComboMult] = useState(1);
  const [comboBump, setComboBump] = useState(0); // changes to retrigger CSS animation
  const [round, setRound] = useState(1);
  const [leftGate, setLeftGate] = useState<GateProgress>({ color: 0, delivered: 0 });
  const [rightGate, setRightGate] = useState<GateProgress>({ color: 1, delivered: 0 });
  const [barkCooldown, setBarkCooldown] = useState(0);
  const [barkFire, setBarkFire] = useState<{ key: number } | null>(null);
  const [roundClearFx, setRoundClearFx] = useState<{
    key: number; round: number; bonus: number; nextEnvName: string;
  } | null>(null);
  const [behavior] = useState<NpcBehavior>(() => {
    const v = localStorage.getItem(BEHAVIOR_KEY);
    return (v === 'static' || v === 'wander' || v === 'flock') ? v : 'wander';
  });

  const stateRef = useRef(createGameState());
  const { stickRef, view } = useJoystick(phase === 'playing');

  const {
    isInAigram, submitScore, fetchLeaderboard,
  } = useGameScore();

  const haptic = useCallback((kind: 'light' | 'heavy') => {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate(kind === 'heavy' ? 35 : 12);
  }, []);

  const onScore = useCallback((s: number) => setScore(s), []);
  const onTime = useCallback((tt: number) => setTimeLeft(tt), []);
  const onBarkUpdate = useCallback((cd: number) => setBarkCooldown(cd), []);

  const onCombo = useCallback((c: number, mult: number) => {
    setCombo(c);
    setComboMult(mult);
    setComboBump(b => b + 1);
  }, []);

  const onDelivery = useCallback((info: DeliveryInfo) => {
    const key = Date.now() + Math.random();
    setPellet({
      key,
      sign: info.sign,
      text: (info.gain > 0 ? '+' : '') + info.gain + (info.comboMult > 1 ? ` ×${info.comboMult}` : ''),
      color: info.sign === 1 ? DYE_PALETTE[info.color] : '#ff5b3a',
      side: info.gate,
    });
    setTimeout(() => setPellet(cur => (cur && cur.key === key ? null : cur)), 1100);
  }, []);

  const onWolfHit = useCallback((count: number) => {
    const key = Date.now() + Math.random();
    setWolfFx({ key, count });
    setTimeout(() => setWolfFx(cur => (cur && cur.key === key ? null : cur)), 1400);
  }, []);

  const onRoundClear = useCallback((info: RoundClearInfo) => {
    const key = Date.now() + Math.random();
    const next = nextEnvForRound(info.round);
    setRoundClearFx({ key, round: info.round, bonus: info.bonus, nextEnvName: next.name });
    // Game loop auto-advances after ROUND_CLEAR_DURATION seconds; mirror that
    // in the UI so the banner dismisses in sync with the round number ticking
    // up (round state is updated by the rAF watcher below).
    window.setTimeout(() => {
      setRoundClearFx(cur => (cur && cur.key === key ? null : cur));
    }, ROUND_CLEAR_DURATION * 1000);
  }, []);

  const onRoundFail = useCallback((final: number) => {
    setFinalScore(final);
    setPhase('gameover');
    stopBgm();
    if (final > highScore) {
      localStorage.setItem(HIGH_KEY, String(final));
      setHighScore(final);
    }
    submitScore(final).catch(() => { /* silent */ });
  }, [highScore, submitScore]);

  const start = useCallback(async () => {
    await unlockAudio();
    const fresh = createGameState();
    fresh.behavior = behavior;
    stateRef.current = fresh;
    setScore(0);
    setCombo(0);
    setComboMult(1);
    setBarkCooldown(0);
    setRound(1);
    setPhase('playing');
    startBgm(0.06);
  }, [behavior]);

  const onBark = useCallback(() => {
    // Only emit fire feedback if the bark will actually go off this tap.
    if (stateRef.current.barkCooldown <= 0) {
      const key = Date.now() + Math.random();
      setBarkFire({ key });
      // mark on the game state so the 3D bark wave anchors to the dog's position
      stateRef.current.barkFireT = stateRef.current.time;
      stateRef.current.barkFireX = stateRef.current.headPos.x;
      stateRef.current.barkFireZ = stateRef.current.headPos.z;
      setTimeout(() => setBarkFire(cur => (cur && cur.key === key ? null : cur)), 700);
    }
    stateRef.current.barkRequested = true;
  }, []);

  useEffect(() => {
    stateRef.current.behavior = behavior;
    localStorage.setItem(BEHAVIOR_KEY, behavior);
  }, [behavior]);

  // Mirror gate state + round number from the game ref so the HUD stays live.
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    const tick = () => {
      const d = stateRef.current;
      const lg = d.gates[0];
      const rg = d.gates[1];
      if (lg) {
        setLeftGate(prev => (prev.color === lg.color && prev.delivered === lg.delivered)
          ? prev
          : { color: lg.color, delivered: lg.delivered });
      }
      if (rg) {
        setRightGate(prev => (prev.color === rg.color && prev.delivered === rg.delivered)
          ? prev
          : { color: rg.color, delivered: rg.delivered });
      }
      setRound(prev => prev === d.round ? prev : d.round);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => () => { stopBgm(); }, []);

  const showCanvas = phase !== 'splash';
  const canvasFrameloop = phase === 'playing' ? 'always' : 'demand';

  const leftHex = DYE_PALETTE[leftGate.color];
  const rightHex = DYE_PALETTE[rightGate.color];
  const leftName = DYE_NAME[leftGate.color];
  const rightName = DYE_NAME[rightGate.color];

  const barkReady = barkCooldown <= 0;
  const barkPct = Math.min(1, Math.max(0, 1 - barkCooldown / BARK_COOLDOWN));

  return (
    <div className="bd">
      {showCanvas && (
        <div className="bd__canvas">
          <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} frameloop={canvasFrameloop}>
            <Scene
              state={stateRef}
              playing={phase === 'playing'}
              stickRef={stickRef}
              onScore={onScore}
              onTime={onTime}
              onCombo={onCombo}
              onDelivery={onDelivery}
              onWolfHit={onWolfHit}
              onRoundClear={onRoundClear}
              onRoundFail={onRoundFail}
              onBarkUpdate={onBarkUpdate}
              playSfx={playSfx}
              haptic={haptic}
            />
          </Canvas>
        </div>
      )}

      {showCanvas && (
        <div className="bd__topbar">
          <div className="bd__topbar-score">
            <span className="bd__topbar-num">{String(score).padStart(2, '0')}</span>
            <span className="bd__topbar-caption">SCORE</span>
          </div>
          {phase === 'playing' && comboMult > 1 && (
            <div className={`bd__combo-float bd__combo-float--m${comboMult}`} key={comboBump}>
              <span className="bd__combo-x">×</span>
              <span className="bd__combo-n">{comboMult}</span>
            </div>
          )}
          {phase === 'playing' && (
            <div className="bd__topbar-time">
              <span className="bd__topbar-num">{Math.ceil(timeLeft)}</span>
              <span className="bd__topbar-caption">SEC</span>
            </div>
          )}
        </div>
      )}

      {showCanvas && phase === 'playing' && (
        <div className="bd__banner">
          <GateChip side="left"  hex={leftHex}  name={leftName}  delivered={leftGate.delivered} />
          <span className="bd__banner-divider" />
          <GateChip side="right" hex={rightHex} name={rightName} delivered={rightGate.delivered} />
        </div>
      )}

      {showCanvas && (
        <img className="bd__watermark" src={alteruSvg} alt="AlterU" />
      )}

      {showCanvas && phase === 'playing' && (
        <button
          type="button"
          className={`bd__bark ${barkReady ? 'bd__bark--ready' : ''}`}
          onPointerDown={onBark}
          data-no-joystick
        >
          <svg className="bd__bark-ring" viewBox="0 0 64 64" aria-hidden>
            <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="29" fill="none"
              stroke={barkReady ? '#38e6ff' : '#ffffff'} strokeWidth="3"
              strokeDasharray={`${barkPct * 182.2} 182.2`}
              transform="rotate(-90 32 32)"
              strokeLinecap="round"
            />
          </svg>
          <span className="bd__bark-inner">
            <svg className="bd__bark-icon" viewBox="0 0 32 24" aria-hidden>
              {/* microphone — capsule head + grille lines + body + base ring +
                  radiating sound waves on the right */}
              <ellipse cx="11" cy="9" rx="6" ry="7" fill="currentColor" />
              <line x1="6"  y1="7"  x2="16" y2="7"  stroke="#0a0a10" strokeWidth=".8" opacity=".5" />
              <line x1="6"  y1="9"  x2="16" y2="9"  stroke="#0a0a10" strokeWidth=".8" opacity=".5" />
              <line x1="6"  y1="11" x2="16" y2="11" stroke="#0a0a10" strokeWidth=".8" opacity=".5" />
              <rect x="9.5" y="16" width="3" height="5" fill="currentColor" />
              <rect x="7"   y="20" width="8" height="2" rx="1" fill="currentColor" />
              <path d="M21 6 Q25 12 21 18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M24.5 3 Q30 12 24.5 21" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".7" />
            </svg>
            <span className="bd__bark-text">MIC DROP</span>
          </span>
          {/* expanding rings rendered on every fire */}
          {barkFire && (
            <span className="bd__bark-rings" key={barkFire.key}>
              <span className="bd__bark-ring1" />
              <span className="bd__bark-ring2" />
            </span>
          )}
        </button>
      )}

      {pellet && (
        <div
          className={`bd__pellet bd__pellet--${pellet.sign === 1 ? 'good' : 'bad'} bd__pellet--${pellet.side}`}
          key={pellet.key}
        >
          <span style={{ color: pellet.color }}>{pellet.text}</span>
        </div>
      )}

      {wolfFx && (
        <div className="bd__wolf-fx" key={wolfFx.key}>
          <div className="bd__wolf-flash" />
          <div className="bd__wolf-pellet">
            <span className="bd__wolf-minus">−</span>
            <span className="bd__wolf-count">{wolfFx.count}</span>
            <span className="bd__wolf-label">SCATTERED</span>
          </div>
        </div>
      )}

      {roundClearFx && (
        <div className="bd__round-clear" key={roundClearFx.key}>
          <div className="bd__round-clear-eyebrow">ROUND {roundClearFx.round} CLEAR</div>
          <div className="bd__round-clear-bonus">
            <span className="bd__round-clear-plus">+</span>
            <span className="bd__round-clear-num">{roundClearFx.bonus}</span>
            <span className="bd__round-clear-tag">TIME BONUS</span>
          </div>
          <div className="bd__round-clear-next">
            <span className="bd__round-clear-arrow">NEXT</span>
            <span className="bd__round-clear-env">{roundClearFx.nextEnvName}</span>
          </div>
        </div>
      )}

      {view.active && (
        <div className="bd__joystick" style={{ left: view.ox, top: view.oy }}>
          <div className="bd__joystick__ring">
            <div className="bd__joystick__stick" style={{ transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px))` }} />
          </div>
        </div>
      )}

      {phase === 'splash' && <SplashScene onStart={start} highScore={highScore} />}

      {phase === 'gameover' && (
        <div className="bd__gameover">
          <div className="bd__gameover-eyebrow">
            {finalScore > 0 && finalScore === highScore ? 'NEW RECORD' : t('time_up').toUpperCase()}
          </div>
          <div className="bd__final-score">{finalScore}</div>
          <div className="bd__final">SCORE · ROUND {round}</div>
          <button className="bd__cta" onPointerDown={start}>
            {t('again')}
          </button>
          <button className="bd__leaderboard-btn" onPointerDown={() => setShowLeaderboard(true)}>
            {t('leaderboard')}
          </button>
        </div>
      )}

      {showLeaderboard && (
        <Leaderboard
          gameName={t('title')}
          isInAigram={isInAigram}
          onClose={() => setShowLeaderboard(false)}
          fetch={fetchLeaderboard}
        />
      )}
    </div>
  );
}

function GateChip({ side, hex, name, delivered }:
                  { side: 'left' | 'right'; hex: string; name: string; delivered: number }) {
  return (
    <div className={`bd__gchip bd__gchip--${side}`}>
      <span className="bd__gchip-arrow">{side === 'left' ? '←' : '→'}</span>
      <span className="bd__gchip-color" style={{ background: hex }} />
      <span className="bd__gchip-name" style={{ color: hex }}>{name}</span>
      <span className="bd__gchip-pips">
        {Array.from({ length: TARGET_PER_GATE }).map((_, i) => (
          <span
            key={i}
            className={`bd__gchip-pip ${i < delivered ? 'bd__gchip-pip--on' : ''}`}
            style={i < delivered ? { background: hex, boxShadow: `0 0 8px ${hex}` } : undefined}
          />
        ))}
      </span>
    </div>
  );
}
