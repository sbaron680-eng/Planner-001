import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: functions/api/contact POST 연동
    setSubmitted(true);
  }

  return (
    <>
      <SEOHead
        title="문의하기"
        description="포춘탭 서비스에 대해 궁금한 점이 있으시면 문의해 주세요."
        path="/contact"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">문의하기</h1>
        <p className="text-gray-500 mb-10">
          질문이나 제안이 있으시면 아래 양식을 작성해 주세요. 영업일 기준 1-2일 내 답변 드립니다.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <CheckCircle size={48} className="text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900">문의가 접수되었습니다</h2>
            <p className="text-gray-500">영업일 기준 1-2일 내에 이메일로 답변 드리겠습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* 이메일 직접 연락 */}
            <div className="flex items-start gap-3 mb-8 p-4 bg-indigo-50 rounded-xl">
              <Mail size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-800">이메일로 직접 문의</p>
                <a href="mailto:hello@fortunetab.com" className="text-sm text-indigo-600 hover:underline">
                  hello@fortunetab.com
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">이름 *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="홍길동"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일 *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">문의 유형 *</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all bg-white"
                >
                  <option value="">선택해 주세요</option>
                  <option value="general">일반 문의</option>
                  <option value="payment">결제·환불</option>
                  <option value="bug">오류 신고</option>
                  <option value="feature">기능 제안</option>
                  <option value="partnership">제휴·협업</option>
                  <option value="other">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">내용 *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="문의 내용을 자세히 입력해 주세요."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200"
              >
                <Send size={15} /> 문의 보내기
              </button>
            </form>
          </div>
        )}

        {/* 소셜 채널 */}
        <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
          <MessageSquare size={15} />
          <span>카카오 채널: <a href="#" className="text-indigo-600 hover:underline">@fortunetab</a></span>
        </div>
      </div>
    </>
  );
}
