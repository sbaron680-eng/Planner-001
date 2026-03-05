import { useState, useEffect } from 'react';
import { Loader2, Save, User, Star, Heart, Calendar } from 'lucide-react';
import { BIRTH_HOUR_OPTIONS, ZODIAC_LIST, ZODIAC_SYMBOL, ZODIAC_DATES } from '@/lib/saju';
import { useProfileStore } from '@/store/useProfileStore';

const CY = new Date().getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const INPUT_CLS = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white';

export default function ProfileForm() {
  const { profile, isLoading, fetchProfile, updateProfile } = useProfileStore();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'saju' | 'astrology' | 'partner' | 'pdf'>('saju');

  // 폼 상태
  const [birthYear,  setBirthYear]  = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay,   setBirthDay]   = useState('');
  const [birthJiji,  setBirthJiji]  = useState('');
  const [gender,     setGender]     = useState<'male' | 'female'>('female');
  const [zodiac,     setZodiac]     = useState('');
  const [sajuName,   setSajuName]   = useState('');
  const [astroName,  setAstroName]  = useState('');
  const [astroFocus, setAstroFocus] = useState('');
  const [partnerName,      setPartnerName]      = useState('');
  const [partnerBY,        setPartnerBY]        = useState('');
  const [partnerBM,        setPartnerBM]        = useState('');
  const [partnerBD,        setPartnerBD]        = useState('');
  const [partnerJiji,      setPartnerJiji]      = useState('');
  const [partnerGender,    setPartnerGender]    = useState<'male' | 'female'>('male');
  const [prefTemplate,     setPrefTemplate]     = useState('minimal');

  // 프로파일 로드 → 폼 초기화
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    if (profile.birth_date) {
      const [y, m, d] = profile.birth_date.split('-');
      setBirthYear(y);
      setBirthMonth(String(parseInt(m, 10)));
      setBirthDay(String(parseInt(d, 10)));
    }
    if (profile.birth_jiji) setBirthJiji(profile.birth_jiji);
    if (profile.gender)     setGender(profile.gender);
    if (profile.zodiac)     setZodiac(profile.zodiac);
    // 사주
    if (profile.saju_data?.name)  setSajuName(profile.saju_data.name);
    // 점성술
    if (profile.astro_data?.name)  setAstroName(profile.astro_data.name);
    if (profile.astro_data?.focus) setAstroFocus(profile.astro_data.focus ?? '');
    // 파트너
    if (profile.partner_data) {
      setPartnerName(profile.partner_data.name ?? '');
      if (profile.partner_data.birth_date) {
        const [y, m, d] = profile.partner_data.birth_date.split('-');
        setPartnerBY(y); setPartnerBM(String(parseInt(m, 10))); setPartnerBD(String(parseInt(d, 10)));
      }
      setPartnerJiji(profile.partner_data.birth_jiji ?? '');
      setPartnerGender(profile.partner_data.gender ?? 'male');
    }
    if (profile.preferred_template) setPrefTemplate(profile.preferred_template);
  }, [profile]);

  function buildBirthDate(y: string, m: string, d: string): string {
    return y.length === 4 && m && d
      ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: Record<string, unknown> = {
      birth_date: buildBirthDate(birthYear, birthMonth, birthDay),
      birth_jiji: birthJiji,
      gender,
      zodiac,
      saju_name: sajuName,
      astro_name: astroName || sajuName,
      astro_focus: astroFocus,
      partner_name: partnerName,
      partner_birth_date: buildBirthDate(partnerBY, partnerBM, partnerBD),
      partner_birth_jiji: partnerJiji,
      partner_gender: partnerGender,
      preferred_template: prefTemplate,
    };

    const err = await updateProfile(payload);
    setSaving(false);
    if (err) { setError(err); } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
  }

  const TABS = [
    { id: 'saju',      label: '나의 사주', icon: '🔮' },
    { id: 'astrology', label: '별자리',   icon: '⭐' },
    { id: 'partner',   label: '파트너',   icon: '💕' },
    { id: 'pdf',       label: 'PDF 설정', icon: '📄' },
  ] as const;

  const TEMPLATES = [
    { key: 'minimal', name: '미니멀' }, { key: 'colorful', name: '컬러풀' },
    { key: 'dark', name: '다크' }, { key: 'elegant', name: '엘레강스' },
    { key: 'nature', name: '자연' }, { key: 'classic', name: '클래식' },
    { key: 'saju', name: '사주' }, { key: 'astrology', name: '점성술' },
    { key: 'couple', name: '커플' }, { key: 'business', name: '비즈니스' },
  ];

  return (
    <div className="space-y-5">
      {/* 탭 */}
      <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 나의 사주 탭 */}
      {activeTab === 'saju' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
            <User size={15} className="text-violet-500" /> 기본 정보
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">이름</label>
              <input type="text" value={sajuName} onChange={e => setSajuName(e.target.value)}
                placeholder="홍길동" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">성별</label>
              <div className="flex gap-2">
                {(['female', 'male'] as const).map(g => (
                  <button key={g} type="button" onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      gender === g ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'
                    }`}>
                    {g === 'female' ? '여성' : '남성'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">생년월일</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min={1900} max={CY} placeholder="년도" value={birthYear}
                onChange={e => setBirthYear(e.target.value.slice(0, 4))} className={INPUT_CLS} />
              <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} className={INPUT_CLS}>
                <option value="">월</option>
                {MONTHS.map(m => <option key={m} value={String(m)}>{m}월</option>)}
              </select>
              <select value={birthDay} onChange={e => setBirthDay(e.target.value)} className={INPUT_CLS}>
                <option value="">일</option>
                {DAYS.map(d => <option key={d} value={String(d)}>{d}일</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">태어난 시간 (시주)</label>
            <select value={birthJiji} onChange={e => setBirthJiji(e.target.value)} className={INPUT_CLS}>
              {BIRTH_HOUR_OPTIONS.map(opt => (
                <option key={opt.jiji} value={opt.jiji}>
                  {opt.label}{opt.range ? ` · ${opt.range}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2">
            🔒 생년월일, 시주 등 개인정보는 AES-256 암호화 후 저장됩니다.
          </div>
        </div>
      )}

      {/* 별자리 탭 */}
      {activeTab === 'astrology' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
            <Star size={15} className="text-indigo-500" /> 별자리 프로파일
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">이름 (별자리 운세용)</label>
            <input type="text" value={astroName || sajuName} onChange={e => setAstroName(e.target.value)}
              placeholder="홍길동" className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">나의 별자리</label>
            <div className="grid grid-cols-4 gap-1.5">
              {ZODIAC_LIST.map(z => (
                <button key={z} type="button" onClick={() => setZodiac(z)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 text-center transition-all ${
                    zodiac === z
                      ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-300 bg-white'
                  }`}>
                  <span className="text-base">{ZODIAC_SYMBOL[z]}</span>
                  <span className={`text-[9px] font-semibold ${zodiac === z ? 'text-indigo-700' : 'text-gray-600'}`}>
                    {z.replace('자리', '')}
                  </span>
                  <span className="text-[8px] text-gray-400">{ZODIAC_DATES[z]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">주요 관심 분야</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '', label: '전체' }, { id: 'love', label: '사랑' },
                { id: 'career', label: '직업' }, { id: 'money', label: '재물' }, { id: 'health', label: '건강' },
              ].map(f => (
                <button key={f.id} type="button" onClick={() => setAstroFocus(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    astroFocus === f.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 파트너 탭 */}
      {activeTab === 'partner' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
            <Heart size={15} className="text-rose-500" /> 파트너 정보 (커플 궁합용)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">파트너 이름</label>
              <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)}
                placeholder="김철수" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">파트너 성별</label>
              <div className="flex gap-2">
                {(['female', 'male'] as const).map(g => (
                  <button key={g} type="button" onClick={() => setPartnerGender(g)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      partnerGender === g ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500'
                    }`}>
                    {g === 'female' ? '여성' : '남성'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">파트너 생년월일</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min={1900} max={CY} placeholder="년도" value={partnerBY}
                onChange={e => setPartnerBY(e.target.value.slice(0, 4))} className={INPUT_CLS} />
              <select value={partnerBM} onChange={e => setPartnerBM(e.target.value)} className={INPUT_CLS}>
                <option value="">월</option>
                {MONTHS.map(m => <option key={m} value={String(m)}>{m}월</option>)}
              </select>
              <select value={partnerBD} onChange={e => setPartnerBD(e.target.value)} className={INPUT_CLS}>
                <option value="">일</option>
                {DAYS.map(d => <option key={d} value={String(d)}>{d}일</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">파트너 시주 (선택)</label>
            <select value={partnerJiji} onChange={e => setPartnerJiji(e.target.value)} className={INPUT_CLS}>
              {BIRTH_HOUR_OPTIONS.map(opt => (
                <option key={opt.jiji} value={opt.jiji}>
                  {opt.label}{opt.range ? ` · ${opt.range}` : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            🔒 파트너 정보는 AES-256 암호화 후 저장됩니다. 커플 궁합 시 자동 입력됩니다.
          </p>
        </div>
      )}

      {/* PDF 설정 탭 */}
      {activeTab === 'pdf' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
            <Calendar size={15} className="text-green-500" /> PDF 플래너 기본 설정
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">기본 템플릿</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.key} type="button" onClick={() => setPrefTemplate(t.key)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                    prefTemplate === t.key
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          ✅ 프로파일이 저장되었습니다.
        </div>
      )}

      <button type="button" onClick={handleSave} disabled={saving || isLoading}
        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-6 py-3.5 rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 transition-all shadow-lg shadow-indigo-200">
        {saving ? <><Loader2 size={16} className="animate-spin" />저장 중...</> : <><Save size={16} />프로파일 저장</>}
      </button>
    </div>
  );
}
