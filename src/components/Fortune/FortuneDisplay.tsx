import type { FortuneResult } from '@/types';

interface Props {
  result: FortuneResult;
}

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

const SCORE_COLOR = (score: number) => {
  if (score >= 8) return 'bg-emerald-100 text-emerald-700';
  if (score >= 5) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-600';
};

const SCORE_BAR_COLOR = (score: number) => {
  if (score >= 8) return 'bg-emerald-400';
  if (score >= 5) return 'bg-amber-400';
  return 'bg-red-400';
};

// 오행 색상
const OHHAENG_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  목: { color: 'bg-emerald-500', label: '목(木)', emoji: '🌳' },
  화: { color: 'bg-red-500',     label: '화(火)', emoji: '🔥' },
  토: { color: 'bg-amber-500',   label: '토(土)', emoji: '🌍' },
  금: { color: 'bg-gray-400',    label: '금(金)', emoji: '⚙️' },
  수: { color: 'bg-blue-500',    label: '수(水)', emoji: '💧' },
};

function OhhaengBar({ element, value }: { element: string; value: number }) {
  const cfg = OHHAENG_CONFIG[element];
  if (!cfg) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{cfg.emoji} {cfg.label}</span>
        <span className="font-bold text-gray-600">{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${cfg.color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CompatibilityRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? '천생연분' : score >= 60 ? '잘 어울림' : score >= 40 ? '노력 필요' : '어려운 궁합';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 48 48)" />
        <text x="48" y="46" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}</text>
        <text x="48" y="60" textAnchor="middle" fontSize="9" fill="#9ca3af">점</text>
      </svg>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

export default function FortuneDisplay({ result }: Props) {
  return (
    <div className="space-y-6">
      {/* 사주 핵심 정보 */}
      {(result.ganji_year || result.day_master || result.zodiac) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {result.ganji_year && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-1">연주(年柱)</p>
              <p className="text-lg font-black text-violet-700">{result.ganji_year}</p>
            </div>
          )}
          {result.day_master && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">일간(日干)</p>
              <p className="text-lg font-black text-indigo-700">{result.day_master}</p>
            </div>
          )}
          {result.zodiac && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-1">별자리</p>
              <p className="text-sm font-bold text-blue-700">{result.zodiac}</p>
            </div>
          )}
        </div>
      )}

      {/* 커플 궁합 점수 */}
      {result.compatibility_score !== undefined && (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            💕 커플 궁합 분석
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <CompatibilityRing score={result.compatibility_score} />
            <div className="flex-1 space-y-2.5">
              {result.compatibility_summary && (
                <p className="text-sm text-gray-700 leading-relaxed">{result.compatibility_summary}</p>
              )}
              {result.couple_advice && (
                <div className="bg-white/70 rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-rose-600 mb-1">💌 사랑 조언</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.couple_advice}</p>
                </div>
              )}
              {result.couple_caution && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-amber-600 mb-1">⚠️ 주의사항</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.couple_caution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 오행 균형 */}
      {result.ohhaeng_balance && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">오행(五行) 균형</h3>
          <div className="space-y-3">
            {(Object.entries(result.ohhaeng_balance) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([el, val]) => (
                <OhhaengBar key={el} element={el} value={val} />
              ))}
          </div>
          {result.saju_advice && (
            <p className="mt-4 text-sm text-gray-600 bg-indigo-50 rounded-xl px-4 py-3 leading-relaxed">
              💡 {result.saju_advice}
            </p>
          )}
        </div>
      )}

      {/* 종합 운세 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-base font-bold text-gray-900 mb-3">종합 운세</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{result.summary}</p>
      </div>

      {/* 연간 운세 */}
      {result.yearly_fortune && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">연간 운세</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{result.yearly_fortune}</p>
        </div>
      )}

      {/* 행성 트랜짓 / 점성술 정보 */}
      {(result.planetary_highlights || result.retrograde_warning || result.zodiac_element || result.ruling_planet) && (
        <div className="bg-indigo-950 text-white rounded-2xl p-5 space-y-3">
          <h3 className="text-base font-bold text-indigo-200 flex items-center gap-2">
            ✨ 행성 에너지
          </h3>
          {(result.zodiac_element || result.ruling_planet) && (
            <div className="flex gap-3">
              {result.zodiac_element && (
                <span className="text-xs font-semibold bg-indigo-800 text-indigo-200 px-3 py-1.5 rounded-full">
                  원소: {result.zodiac_element}
                </span>
              )}
              {result.ruling_planet && (
                <span className="text-xs font-semibold bg-indigo-800 text-indigo-200 px-3 py-1.5 rounded-full">
                  지배성: {result.ruling_planet}
                </span>
              )}
            </div>
          )}
          {result.planetary_highlights && (
            <p className="text-sm text-indigo-100 leading-relaxed">{result.planetary_highlights}</p>
          )}
          {result.retrograde_warning && (
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-300 mb-1">역행 주의</p>
              <p className="text-sm text-amber-100 leading-relaxed">{result.retrograde_warning}</p>
            </div>
          )}
        </div>
      )}

      {/* 신살 배지 */}
      {result.shinsal && result.shinsal.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            🔮 신살(神殺) 분석
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.shinsal.map(s => (
              <span key={s} className="text-xs font-semibold bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full border border-violet-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 분야별 운세 */}
      {(result.career || result.relationships || result.health || result.wealth) && (
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">분야별 운세</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.relationships && (
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <p className="text-xs font-semibold text-pink-600 mb-2">💕 인간관계·사랑운</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.relationships}</p>
              </div>
            )}
            {result.career && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 mb-2">💼 직업·사업운</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.career}</p>
              </div>
            )}
            {result.wealth && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 mb-2">💰 금전·재물운</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.wealth}</p>
              </div>
            )}
            {result.health && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs font-semibold text-green-600 mb-2">🌿 건강운</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.health}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 행운 / 주의 방향 */}
      {((result.lucky_directions?.length ?? 0) > 0 || (result.caution_months?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.lucky_directions && result.lucky_directions.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-600 mb-2">🧭 행운 방향</p>
              <div className="flex flex-wrap gap-1.5">
                {result.lucky_directions.map(d => (
                  <span key={d} className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{d}</span>
                ))}
              </div>
            </div>
          )}
          {result.caution_months && result.caution_months.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-orange-600 mb-2">⚠️ 주의 월</p>
              <div className="flex flex-wrap gap-1.5">
                {result.caution_months.map(m => (
                  <span key={m} className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-medium">{m}월</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 월별 운세 */}
      {result.monthly_fortunes?.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4">월별 운세</h3>
          <div className="space-y-2.5">
            {result.monthly_fortunes.map((mf) => (
              <div key={mf.month} className="flex gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                <div className="flex-shrink-0 w-14 text-center">
                  <p className="text-xs font-bold text-gray-700">{MONTHS[mf.month - 1]}</p>
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SCORE_COLOR(mf.score)}`}>
                      {mf.score}/10
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${SCORE_BAR_COLOR(mf.score)}`}
                      style={{ width: `${mf.score * 10}%` }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 leading-relaxed">{mf.fortune}</p>
                  {mf.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {mf.keywords.map((kw) => (
                        <span key={kw} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">#{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 행운 정보 */}
      {((result.lucky_colors?.length ?? 0) > 0 || (result.lucky_numbers?.length ?? 0) > 0) && (
        <div className="flex flex-wrap gap-6 p-5 bg-purple-50 rounded-2xl border border-purple-100">
          {result.lucky_colors && result.lucky_colors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-2">행운의 색</p>
              <div className="flex gap-2">
                {result.lucky_colors.map((c) => (
                  <span key={c} className="text-sm bg-white px-3 py-1.5 rounded-full text-gray-700 shadow-sm border border-purple-100">{c}</span>
                ))}
              </div>
            </div>
          )}
          {result.lucky_numbers && result.lucky_numbers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-2">행운의 숫자</p>
              <div className="flex gap-2">
                {result.lucky_numbers.map((n) => (
                  <span key={n} className="text-sm font-bold bg-purple-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm">{n}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
