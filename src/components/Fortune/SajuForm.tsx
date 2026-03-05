import { useState } from 'react';
import { Loader2, Sparkles, Info } from 'lucide-react';
import type { SajuInput, FortuneResult } from '@/types';
import { BIRTH_HOUR_OPTIONS, getYearDescription, getGanji } from '@/lib/saju';

interface Props {
  onResult: (result: FortuneResult) => void;
}

const CY = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);

const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white transition-shadow';

export default function SajuForm({ onResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [form, setForm] = useState<SajuInput>({
    name: '', birth_date: '', gender: 'female', year: CY,
  });
  const [birthYear,  setBirthYear]  = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay,   setBirthDay]   = useState('');
  const [jijiTime,   setJijiTime]   = useState(''); // 선택된 지지 시간

  function syncBirthDate(y: string, m: string, d: string) {
    setForm(prev => ({
      ...prev,
      birth_date: y.length === 4 && m && d
        ? `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
        : '',
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.birth_date) return setError('생년월일을 모두 입력해주세요.');
    setLoading(true);
    setError(null);
    try {
      const payload: SajuInput = {
        ...form,
        birth_jiji: jijiTime || undefined,
        birth_time: undefined,
      };
      const res  = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'saju', input: payload }),
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

  const yearGanji = form.year ? getGanji(form.year) : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 이름 + 성별 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름</label>
          <input type="text" required value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="홍길동" className={INPUT_CLS} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">성별</label>
          <div className="flex gap-2">
            {(['female', 'male'] as const).map(g => (
              <button key={g} type="button"
                onClick={() => setForm({ ...form, gender: g })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  form.gender === g
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {g === 'female' ? '여성' : '남성'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 생년월일 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">생년월일</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" required min={1900} max={CY} placeholder="년도"
            value={birthYear}
            onChange={e => {
              const v = e.target.value.slice(0, 4);
              setBirthYear(v);
              syncBirthDate(v, birthMonth, birthDay);
            }}
            className={INPUT_CLS} />
          <select required value={birthMonth}
            onChange={e => { setBirthMonth(e.target.value); syncBirthDate(birthYear, e.target.value, birthDay); }}
            className={INPUT_CLS}>
            <option value="">월</option>
            {MONTHS.map(m => <option key={m} value={String(m)}>{m}월</option>)}
          </select>
          <select required value={birthDay}
            onChange={e => { setBirthDay(e.target.value); syncBirthDate(birthYear, birthMonth, e.target.value); }}
            className={INPUT_CLS}>
            <option value="">일</option>
            {DAYS.map(d => <option key={d} value={String(d)}>{d}일</option>)}
          </select>
        </div>
      </div>

      {/* 시주 (12지지) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          태어난 시간 <span className="text-gray-400 text-xs font-normal">(선택 — 알수록 정확도 ↑)</span>
        </label>
        <select value={jijiTime} onChange={e => setJijiTime(e.target.value)} className={INPUT_CLS}>
          {BIRTH_HOUR_OPTIONS.map(opt => (
            <option key={opt.jiji} value={opt.jiji}>
              {opt.label}{opt.range ? ` · ${opt.range}` : ''}
            </option>
          ))}
        </select>
        {jijiTime && (
          <p className="mt-1.5 text-xs text-violet-600 flex items-center gap-1">
            <Info size={11} />
            {jijiTime}시로 시주(時柱)를 분석합니다
          </p>
        )}
      </div>

      {/* 운세 연도 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">운세 연도</label>
        <div className="flex gap-2">
          {[CY - 1, CY, CY + 1].map(y => (
            <button key={y} type="button"
              onClick={() => setForm({ ...form, year: y })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                form.year === y
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span className="block">{y}년</span>
              <span className="block text-[10px] font-medium opacity-70">{getGanji(y)}년</span>
            </button>
          ))}
        </div>
        {yearGanji && (
          <p className="mt-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
            ✨ {form.year}년은 <strong className="text-amber-700">{getYearDescription(form.year)}</strong>입니다
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-6 py-4 rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200">
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />AI 사주 분석 중 (10–20초)...</>
        ) : (
          <><Sparkles size={18} />사주 풀이 받기</>
        )}
      </button>
    </form>
  );
}
