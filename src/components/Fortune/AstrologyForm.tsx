import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { AstrologyInput, FortuneResult } from '@/types';

const ZODIAC_SIGNS = [
  '양자리', '황소자리', '쌍둥이자리', '게자리',
  '사자자리', '처녀자리', '천칭자리', '전갈자리',
  '사수자리', '염소자리', '물병자리', '물고기자리',
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface Props {
  onResult: (result: FortuneResult) => void;
}

export default function AstrologyForm({ onResult }: Props) {
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AstrologyInput>({
    name: '',
    birth_date: '',
    zodiac: '',
    year: currentYear,
  });
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const handleBirthChange = (y: string, m: string, d: string) => {
    if (y.length === 4 && m && d) {
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      setForm((prev) => ({ ...prev, birth_date: `${y}-${mm}-${dd}` }));
    } else {
      setForm((prev) => ({ ...prev, birth_date: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="홍길동"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">생년월일</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            required
            min={1900}
            max={currentYear}
            placeholder="년 (4자리)"
            value={birthYear}
            onChange={(e) => {
              const v = e.target.value.slice(0, 4);
              setBirthYear(v);
              handleBirthChange(v, birthMonth, birthDay);
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            required
            value={birthMonth}
            onChange={(e) => {
              setBirthMonth(e.target.value);
              handleBirthChange(birthYear, e.target.value, birthDay);
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">월</option>
            {MONTHS.map((m) => <option key={m} value={String(m)}>{m}월</option>)}
          </select>
          <select
            required
            value={birthDay}
            onChange={(e) => {
              setBirthDay(e.target.value);
              handleBirthChange(birthYear, birthMonth, e.target.value);
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">일</option>
            {DAYS.map((d) => <option key={d} value={String(d)}>{d}일</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            별자리 <span className="text-gray-400 font-normal">(자동 감지 또는 선택)</span>
          </label>
          <select
            value={form.zodiac}
            onChange={(e) => setForm({ ...form, zodiac: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">생년월일로 자동 감지</option>
            {ZODIAC_SIGNS.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">운세 연도</label>
          <select
            value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />별자리 운세 분석 중...</>
        ) : (
          <><Sparkles size={18} />별자리 운세 받기</>
        )}
      </button>
    </form>
  );
}
