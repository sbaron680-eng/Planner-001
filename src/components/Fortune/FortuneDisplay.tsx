import type { FortuneResult } from '@/types';

interface Props {
  result: FortuneResult;
}

const SCORE_COLOR = (score: number) => {
  if (score >= 8) return 'bg-green-100 text-green-700';
  if (score >= 5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
};

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export default function FortuneDisplay({ result }: Props) {
  return (
    <div className="space-y-6">
      {/* 종합 운세 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">종합 운세</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.summary}</p>
      </div>

      {/* 연간 운세 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">연간 운세</h3>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{result.yearly_fortune}</p>
      </div>

      {/* 분야별 운세 */}
      {(result.career || result.relationships || result.health || result.wealth) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.relationships && (
            <div className="bg-pink-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-pink-600 mb-2">💕 인간관계·사랑운</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.relationships}</p>
            </div>
          )}
          {result.career && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 mb-2">💼 직업·사업운</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.career}</p>
            </div>
          )}
          {result.wealth && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 mb-2">💰 금전·재물운</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.wealth}</p>
            </div>
          )}
          {result.health && (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-600 mb-2">🌿 건강운</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.health}</p>
            </div>
          )}
        </div>
      )}

      {/* 월별 운세 */}
      {result.monthly_fortunes?.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">월별 운세</h3>
          <div className="space-y-3">
            {result.monthly_fortunes.map((mf) => (
              <div key={mf.month} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex-shrink-0 w-12 text-center">
                  <p className="text-sm font-bold text-gray-800">{MONTHS[mf.month - 1]}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SCORE_COLOR(mf.score)}`}>
                    {mf.score}/10
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 leading-relaxed">{mf.fortune}</p>
                  {mf.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mf.keywords.map((kw) => (
                        <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">#{kw}</span>
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
        <div className="flex flex-wrap gap-6 p-5 bg-purple-50 rounded-2xl">
          {result.lucky_colors && result.lucky_colors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-1.5">행운의 색</p>
              <div className="flex gap-2">
                {result.lucky_colors.map((c) => (
                  <span key={c} className="text-sm bg-white px-3 py-1 rounded-full text-gray-700 shadow-sm">{c}</span>
                ))}
              </div>
            </div>
          )}
          {result.lucky_numbers && result.lucky_numbers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-1.5">행운의 숫자</p>
              <div className="flex gap-2">
                {result.lucky_numbers.map((n) => (
                  <span key={n} className="text-sm font-bold bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center">{n}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
