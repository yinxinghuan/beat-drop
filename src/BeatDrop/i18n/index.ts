type Locale = 'zh' | 'en';

function detectLocale(): Locale {
  const override = alteruLocalStorage.getItem('game_locale');
  if (override === 'en' || override === 'zh') return override;
  return 'en';
}

const dict: Record<Locale, Record<string, string>> = {
  zh: {
    title: 'Beat Drop',
    subtitle: '吸引同色舞客 · 送到对的舞台门',
    tap_to_start: '入场',
    again: '再来一次',
    score: '得分',
    high: '最高',
    round: '第 {n} 段',
    target: '把 {n} 位 {color} 舞客带进 {gate} 门',
    gate_left: '左',
    gate_right: '右',
    time_up: '时间到',
    round_clear: '通关',
    leaderboard: '排行榜',
    loading: '加载中…',
    behavior_static: '舞客：静止',
    behavior_wander: '舞客：游走',
    behavior_flock: '舞客：成群',
  },
  en: {
    title: 'Beat Drop',
    subtitle: 'PULL THE CROWD · DELIVER TO THE RIGHT DOOR',
    tap_to_start: 'Step on the floor',
    again: 'One more',
    score: 'Score',
    high: 'Best',
    round: 'Set {n}',
    target: 'Bring {n} {color} dancers to the {gate} door',
    gate_left: 'LEFT',
    gate_right: 'RIGHT',
    time_up: "Time's up",
    round_clear: 'Set clear',
    leaderboard: 'Leaderboard',
    loading: 'Loading…',
    behavior_static: 'Dancers: still',
    behavior_wander: 'Dancers: wander',
    behavior_flock: 'Dancers: flock',
  },
};

let cur: Locale = detectLocale();

export function setLocale(l: Locale) {
  cur = l;
  alteruLocalStorage.setItem('game_locale', l);
}

export function t(key: string, vars?: { n?: number | string; color?: string; gate?: string }): string {
  const raw = dict[cur][key] ?? dict.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String((vars as any)[k] ?? ''));
}

export function getLocale(): Locale { return cur; }
