import { useState } from 'react';
import { Loader2, Sun } from 'lucide-react';
import type { FortuneResult } from '@/types';
import { ZODIAC_LIST, ZODIAC_SYMBOL, ZODIAC_DATES, ZODIAC_ELEMENT, ZODIAC_RULER, ZODIAC_COLOR } from '@/lib/saju';

interface Props {
  onResult: (result: FortuneResult) => void;
}

const today = new Date();
const TODAY_STR = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

export default function DailyFortuneForm({ onResult }: Props) {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [name,     setName]     = useState('');
  const [selected, setSelected] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return setError('별자리를 선택해주세요.');
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'daily',
          input: { name: name || selected, zodiac: selected, date: today.toISOString().slice(0, 10) },
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '운세 분석 실패');
      onResult(data.data as FortuneResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const zodiac = selected as typeof ZODIAC_LIST[number] | '';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 날짜 배너 */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <Sun size={16} className="text-amber-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-700">{TODAY_STR} 오늘의 운세</span>
      </div>

      {/* 이름 (선택) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          이름 <span className="text-gray-400 font-normal text-xs">(선택)</span>
        </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="홍길동 (입력 시 맞춤 운세)"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white" />
      </div>

      {/* 별자리 선택 그리드 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2.5">나의 별자리</label>
        <div className="grid grid-cols-4 gap-2">
          {ZODIAC_LIST.map(z => {
            const isSelected = selected === z;
            return (
              <button key={z} type="button" onClick={() => { setSelected(z); setError(null); }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-300 bg-white'
                }`}>
                <span className={`text-xl bg-gradient-to-br ${ZODIAC_COLOR[z]} bg-clip-text`}
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: isSelected ? undefined : 'inherit' }}>
                  {ZODIAC_SYMBOL[z]}
                </span>
                <span className={`text-[10px] font-semibold leading-tight ${isSelected ? 'text-amber-700' : 'text-gray-600'}`}>
                  {z.replace('자리', '')}
                </span>
                <span className="text-[9px] text-gray-400">{ZODIAC_DATES[z]}</span>
              </button>
            );
          })}
        </div>

        {/* 선택된 별자리 정보 */}
        {zodiac && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
            <span className="text-2xl">{ZODIAC_SYMBOL[zodiac]}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{zodiac}</p>
              <p className="text-xs text-gray-500">
                {ZODIAC_ELEMENT[zodiac]} &nbsp;·&nbsp; 지배행성: {ZODIAC_RULER[zodiac]}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      <button type="submit" disabled={loading || !selected}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-200">
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />오늘의 운세 분석 중...</>
        ) : (
          <><Sun size={18} />오늘의 운세 보기</>
        )}
      </button>
    </form>
  );
}
