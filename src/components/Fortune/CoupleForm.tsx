import { useState, useEffect } from 'react';
import { Loader2, Heart, Info, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FortuneResult } from '@/types';
import { BIRTH_HOUR_OPTIONS, getGanji, getYearDescription } from '@/lib/saju';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';

interface PersonInput {
  name: string;
  birth_date: string;
  birth_jiji?: string;
  gender: 'male' | 'female';
}

interface Props {
  onResult: (result: FortuneResult) => void;
}

const CY = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);

const INPUT_CLS_R = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none bg-white transition-shadow';
const INPUT_CLS_B = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white transition-shadow';

type PersonWithUI = PersonInput & { birthYear: string; birthMonth: string; birthDay: string };

function makePerson(gender: 'male' | 'female' = 'female'): PersonWithUI {
  return { name: '', birth_date: '', gender, birth_jiji: '', birthYear: '', birthMonth: '', birthDay: '' };
}

function PersonSection({
  label, color, value, onChange,
}: {
  label: string;
  color: 'rose' | 'blue';
  value: PersonWithUI;
  onChange: (field: string, val: string) => void;
}) {
  const activeBorder = color === 'rose'
    ? 'border-rose-400 bg-rose-50 text-rose-700'
    : 'border-blue-400 bg-blue-50 text-blue-700';
  const inputCls = color === 'rose' ? INPUT_CLS_R : INPUT_CLS_B;

  return (
    <div className={`rounded-2xl border-2 p-4 space-y-3.5 ${color === 'rose' ? 'border-rose-100 bg-rose-50/30' : 'border-blue-100 bg-blue-50/30'}`}>
      <h4 className={`font-bold text-sm ${color === 'rose' ? 'text-rose-700' : 'text-blue-700'}`}>{label}</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">이름</label>
          <input type="text" required value={value.name} onChange={e => onChange('name', e.target.value)} placeholder="홍길동" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">성별</label>
          <div className="flex gap-1.5">
            {(['female', 'male'] as const).map(g => (
              <button key={g} type="button" onClick={() => onChange('gender', g)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${value.gender === g ? activeBorder : 'border-gray-200 text-gray-500'}`}>
                {g === 'female' ? '여' : '남'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">생년월일</label>
        <div className="grid grid-cols-3 gap-1.5">
          <input type="number" required min={1900} max={CY} placeholder="년도" value={value.birthYear}
            onChange={e => onChange('birthYear', e.target.value.slice(0, 4))} className={inputCls} />
          <select required value={value.birthMonth} onChange={e => onChange('birthMonth', e.target.value)} className={inputCls}>
            <option value="">월</option>
            {MONTHS.map(m => <option key={m} value={String(m)}>{m}월</option>)}
          </select>
          <select required value={value.birthDay} onChange={e => onChange('birthDay', e.target.value)} className={inputCls}>
            <option value="">일</option>
            {DAYS.map(d => <option key={d} value={String(d)}>{d}일</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          태어난 시간 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <select value={value.birth_jiji ?? ''} onChange={e => onChange('birth_jiji', e.target.value)} className={inputCls}>
          {BIRTH_HOUR_OPTIONS.map(opt => (
            <option key={opt.jiji} value={opt.jiji}>{opt.label}{opt.range ? ` · ${opt.range}` : ''}</option>
          ))}
        </select>
        {value.birth_jiji && (
          <p className={`mt-1 text-[11px] flex items-center gap-1 ${color === 'rose' ? 'text-rose-600' : 'text-blue-600'}`}>
            <Info size={10} />{value.birth_jiji}시로 시주 분석
          </p>
        )}
      </div>
    </div>
  );
}

export default function CoupleForm({ onResult }: Props) {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [year,    setYear]    = useState(CY);
  const [p1, setP1] = useState(makePerson('female'));
  const [p2, setP2] = useState(makePerson('male'));
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  // 프로파일에서 나 (p1) + 파트너 (p2) 자동 입력
  useEffect(() => {
    if (!profile || autoFilled) return;
    let changed = false;
    const my = profile.saju_data;
    if (my) {
      const parts = my.birth_date?.split('-') ?? [];
      setP1(prev => ({
        ...prev,
        name: my.name || prev.name,
        birth_date: my.birth_date || prev.birth_date,
        birth_jiji: my.birth_jiji ?? prev.birth_jiji,
        gender: (my.gender ?? prev.gender) as 'male' | 'female',
        birthYear: parts[0] ?? prev.birthYear,
        birthMonth: parts[1] ? String(parseInt(parts[1], 10)) : prev.birthMonth,
        birthDay:  parts[2] ? String(parseInt(parts[2], 10)) : prev.birthDay,
      }));
      changed = true;
    }
    const partner = profile.partner_data;
    if (partner) {
      const parts = partner.birth_date?.split('-') ?? [];
      setP2(prev => ({
        ...prev,
        name: partner.name || prev.name,
        birth_date: partner.birth_date || prev.birth_date,
        birth_jiji: partner.birth_jiji ?? prev.birth_jiji,
        gender: (partner.gender ?? prev.gender) as 'male' | 'female',
        birthYear: parts[0] ?? prev.birthYear,
        birthMonth: parts[1] ? String(parseInt(parts[1], 10)) : prev.birthMonth,
        birthDay:  parts[2] ? String(parseInt(parts[2], 10)) : prev.birthDay,
      }));
      changed = true;
    }
    if (changed) setAutoFilled(true);
  }, [profile, autoFilled]);

  function updatePerson(
    setter: React.Dispatch<React.SetStateAction<PersonWithUI>>,
    field: string, val: string,
  ) {
    setter(prev => {
      const next = { ...prev, [field]: val };
      const y = field === 'birthYear'  ? val : next.birthYear;
      const m = field === 'birthMonth' ? val : next.birthMonth;
      const d = field === 'birthDay'   ? val : next.birthDay;
      next.birth_date = y.length === 4 && m && d
        ? `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` : '';
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!p1.birth_date || !p2.birth_date) return setError('두 사람의 생년월일을 모두 입력해주세요.');
    setLoading(true);
    setError(null);
    try {
      const input = {
        person1: { name: p1.name, birth_date: p1.birth_date, gender: p1.gender, birth_jiji: p1.birth_jiji || undefined },
        person2: { name: p2.name, birth_date: p2.birth_date, gender: p2.gender, birth_jiji: p2.birth_jiji || undefined },
        year,
      };
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('planner_token') ? { Authorization: `Bearer ${localStorage.getItem('planner_token')}` } : {}),
        },
        body: JSON.stringify({ type: 'couple', input }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '궁합 분석 실패');
      onResult(data.data as FortuneResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {user && autoFilled && (
        <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
          <UserCircle size={14} className="flex-shrink-0" />
          프로파일에서 나 + 파트너 정보 자동 입력됨 · <Link to="/profile" className="underline font-medium">프로파일 수정</Link>
        </div>
      )}
      {user && !autoFilled && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
          <UserCircle size={14} />
          <Link to="/profile" className="underline font-medium text-indigo-600">프로파일</Link>에 파트너 정보를 저장하면 다음에 자동 입력됩니다.
        </div>
      )}

      <PersonSection label="첫 번째 사람 (나)" color="rose" value={p1}
        onChange={(f, v) => updatePerson(setP1, f, v)} />

      <div className="flex items-center justify-center">
        <Heart size={20} className="text-rose-400 fill-rose-200" />
      </div>

      <PersonSection label="두 번째 사람 (파트너)" color="blue" value={p2}
        onChange={(f, v) => updatePerson(setP2, f, v)} />

      {/* 분석 연도 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">분석 연도</label>
        <div className="flex gap-2">
          {[CY - 1, CY, CY + 1].map(y => (
            <button key={y} type="button" onClick={() => setYear(y)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                year === y ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              <span className="block">{y}년</span>
              <span className="block text-[10px] font-medium opacity-70">{getGanji(y)}년</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
          ✨ {year}년은 <strong className="text-amber-700">{getYearDescription(year)}</strong>입니다
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      <button type="submit" disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-6 py-4 rounded-xl hover:from-rose-600 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200">
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />AI 궁합 분석 중 (15–25초)...</>
        ) : (
          <><Heart size={18} className="fill-white" />커플 궁합 분석하기</>
        )}
      </button>
    </form>
  );
}
