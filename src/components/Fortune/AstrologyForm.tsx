import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Star, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AstrologyInput, FortuneResult } from '@/types';
import {
  ZODIAC_LIST, ZODIAC_SYMBOL, ZODIAC_DATES, ZODIAC_ELEMENT, ZODIAC_RULER, ZODIAC_COLOR,
  detectZodiac, getGanji, getYearDescription,
} from '@/lib/saju';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';

interface Props {
  onResult: (result: FortuneResult) => void;
}

const CY = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);

const FOCUS_OPTIONS = [
  { id: '',        label: '전체', icon: '✨' },
  { id: 'love',   label: '사랑·연애', icon: '💕' },
  { id: 'career', label: '직업·사업', icon: '💼' },
  { id: 'money',  label: '재물·금전', icon: '💰' },
  { id: 'health', label: '건강', icon: '🌿' },
];

const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-shadow';

export default function AstrologyForm({ onResult }: Props) {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [birthYear,  setBirthYear]  = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay,   setBirthDay]   = useState('');
  const [autoZodiac, setAutoZodiac] = useState<string>('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [form, setForm] = useState<AstrologyInput>({
    name: '', birth_date: '', zodiac: '', year: CY,
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  // 프로파일 자동 입력
  useEffect(() => {
    if (!profile || autoFilled) return;
    const src = profile.astro_data ?? profile.saju_data ?? {};
    let changed = false;
    if (src.name) { setForm(f => ({ ...f, name: src.name ?? '' })); changed = true; }
    if (src.birth_date) {
      const [y, m, d] = src.birth_date.split('-');
      setBirthYear(y); setBirthMonth(String(parseInt(m,10))); setBirthDay(String(parseInt(d,10)));
      setForm(f => ({ ...f, birth_date: src.birth_date ?? '' }));
      changed = true;
    }
    if (profile.zodiac || (profile.astro_data as { zodiac?: string })?.zodiac) {
      const z = profile.zodiac || (profile.astro_data as { zodiac?: string })?.zodiac || '';
      setForm(f => ({ ...f, zodiac: z }));
      changed = true;
    }
    if ((profile.astro_data as { focus?: string })?.focus) {
      setForm(f => ({ ...f, focus: (profile.astro_data as { focus?: string })?.focus }));
      changed = true;
    }
    if (changed) setAutoFilled(true);
  }, [profile, autoFilled]);

  // 생년월일로 별자리 자동 감지
  useEffect(() => {
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);
    if (m && d) {
      const detected = detectZodiac(m, d);
      setAutoZodiac(detected);
      setForm(prev => ({ ...prev, zodiac: prev.zodiac || detected }));
    } else {
      setAutoZodiac('');
    }
  }, [birthMonth, birthDay]);

  function syncBirthDate(y: string, m: string, d: string) {
    setForm(prev => ({
      ...prev,
      birth_date: y.length === 4 && m && d
        ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '',
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.birth_date) return setError('생년월일을 모두 입력해주세요.');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('planner_token') ? { Authorization: `Bearer ${localStorage.getItem('planner_token')}` } : {}),
        },
        body: JSON.stringify({ type: 'astrology', input: form }),
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

  const selectedZodiac = form.zodiac as typeof ZODIAC_LIST[number] | '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {user && autoFilled && (
        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
          <UserCircle size={14} className="flex-shrink-0" />
          프로파일에서 자동 입력됨 · <Link to="/profile" className="underline font-medium">프로파일 수정</Link>
        </div>
      )}

      {/* 이름 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름</label>
        <input type="text" required value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="홍길동" className={INPUT_CLS} />
      </div>

      {/* 생년월일 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">생년월일</label>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" required min={1900} max={CY} placeholder="년도"
            value={birthYear}
            onChange={e => { const v = e.target.value.slice(0,4); setBirthYear(v); syncBirthDate(v, birthMonth, birthDay); }}
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
        {autoZodiac && (
          <p className="mt-1.5 text-xs text-indigo-600 flex items-center gap-1">
            <Star size={11} className="fill-current" />
            자동 감지: <strong>{autoZodiac}</strong> ({ZODIAC_DATES[autoZodiac as typeof ZODIAC_LIST[number]]})
          </p>
        )}
      </div>

      {/* 별자리 선택 그리드 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2.5">별자리 선택</label>
        <div className="grid grid-cols-4 gap-2">
          {ZODIAC_LIST.map(z => {
            const isSelected = form.zodiac === z;
            return (
              <button key={z} type="button"
                onClick={() => setForm({ ...form, zodiac: z })}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all ${
                  isSelected ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-100 hover:border-gray-300 bg-white'
                }`}>
                <span className={`text-lg bg-gradient-to-br ${ZODIAC_COLOR[z]} bg-clip-text`}
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: isSelected ? undefined : 'inherit' }}>
                  {ZODIAC_SYMBOL[z]}
                </span>
                <span className={`text-[10px] font-semibold leading-tight ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                  {z.replace('자리', '')}
                </span>
                <span className="text-[9px] text-gray-400 leading-tight">{ZODIAC_DATES[z]}</span>
              </button>
            );
          })}
        </div>
        {selectedZodiac && (
          <div className="mt-3 flex items-center gap-3 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)' }}>
            <span className="text-2xl">{ZODIAC_SYMBOL[selectedZodiac]}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{selectedZodiac}</p>
              <p className="text-xs text-gray-500">
                {ZODIAC_ELEMENT[selectedZodiac]} &nbsp;·&nbsp; 지배행성: {ZODIAC_RULER[selectedZodiac]}
              </p>
            </div>
          </div>
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
                form.year === y ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span className="block">{y}년</span>
              <span className="block text-[10px] font-medium opacity-70">{getGanji(y)}년</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
          ✨ {form.year}년은 <strong className="text-amber-700">{getYearDescription(form.year)}</strong>입니다
        </p>
      </div>

      {/* 관심 분야 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          관심 분야 <span className="text-gray-400 font-normal text-xs">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {FOCUS_OPTIONS.map(opt => (
            <button key={opt.id} type="button"
              onClick={() => setForm({ ...form, focus: opt.id || undefined })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                (form.focus ?? '') === opt.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      <button type="submit" disabled={loading || !form.zodiac}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200">
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />AI 별자리 분석 중 (10–20초)...</>
        ) : (
          <><Sparkles size={18} />별자리 운세 받기</>
        )}
      </button>
    </form>
  );
}
