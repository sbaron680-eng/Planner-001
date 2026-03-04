-- 기본 앱 설정
INSERT OR REPLACE INTO app_settings (key, value) VALUES
  ('planner_year', '2026'),
  ('site_name', 'Planner 001'),
  ('maintenance_mode', '0');

-- 무료 플래너 5종
INSERT OR REPLACE INTO planners (id, slug, title, description, category, type, price, features, template_key, pages_count, is_fortune, sort_order) VALUES
  ('p-free-01', 'minimal-planner', '미니멀 플래너', '심플하고 깔끔한 흑백 디자인의 연간 플래너. 아이패드·갤럭시 탭 최적화.', 'minimal', 'free', 0, '["연간 캘린더","월별 계획","주간 계획","할일 목록","메모 페이지"]', 'minimal', 60, 0, 10),
  ('p-free-02', 'colorful-planner', '컬러풀 플래너', '파스텔 컬러로 매일을 밝게 채워가는 감성 플래너.', 'colorful', 'free', 0, '["연간 캘린더","월별 계획","습관 트래커","감사 일기","메모 페이지"]', 'colorful', 60, 0, 20),
  ('p-free-03', 'dark-planner', '다크 플래너', '눈에 편안한 다크 테마의 모던 플래너.', 'dark', 'free', 0, '["연간 캘린더","월별 계획","주간 계획","목표 설정","체크리스트"]', 'dark', 60, 0, 30),
  ('p-free-04', 'nature-planner', '자연 플래너', '초록빛 자연에서 영감을 받은 따뜻한 플래너.', 'nature', 'free', 0, '["연간 캘린더","월별 계획","독서 기록","건강 트래커","메모 페이지"]', 'nature', 60, 0, 40),
  ('p-free-05', 'classic-planner', '클래식 플래너', '전통적인 종이 느낌의 빈티지 스타일 플래너.', 'classic', 'free', 0, '["연간 캘린더","월별 계획","일별 계획","가계부","메모 페이지"]', 'classic', 60, 0, 50);

-- 유료 플래너 5종
INSERT OR REPLACE INTO planners (id, slug, title, description, category, type, price, features, template_key, pages_count, is_fortune, sort_order) VALUES
  ('p-pro-01', 'premium-all-in-one', '프리미엄 올인원', '모든 기능이 담긴 최고급 연간 플래너. 1년 365일 완전 커버.', 'premium', 'premium', 9900, '["연간 캘린더","월별 계획","주간 계획","일별 계획","습관 트래커","목표 관리","가계부","여행 계획","독서 기록","건강 기록","공휴일 자동 표시","PDF 내부 하이퍼링크 네비게이션"]', 'premium_all', 120, 0, 100),
  ('p-pro-02', 'saju-planner', '사주 플래너', 'AI가 분석한 나만의 사주 풀이와 연간 운세가 포함된 특별 플래너.', 'saju', 'premium', 14900, '["사주 분석 결과","연간 운세","월별 운세","월별 계획","주간 계획","습관 트래커","목표 관리","공휴일 자동 표시","PDF 내부 하이퍼링크"]', 'saju', 80, 1, 110),
  ('p-pro-03', 'astrology-planner', '별자리 플래너', '12가지 별자리 운세와 행성의 흐름이 담긴 신비로운 플래너.', 'astrology', 'premium', 12900, '["별자리 분석","연간 운세","월별 운세","월별 계획","주간 계획","사랑운·직업운·금전운","공휴일 자동 표시","PDF 내부 하이퍼링크"]', 'astrology', 80, 1, 120),
  ('p-pro-04', 'couple-planner', '커플 플래너', '두 사람의 궁합 분석과 함께하는 커플 전용 연간 플래너.', 'couple', 'premium', 19900, '["두 사람 궁합 분석","함께하는 버킷리스트","기념일 관리","데이트 계획","월별 공동 계획","추억 기록","공휴일 자동 표시","PDF 내부 하이퍼링크"]', 'couple', 100, 1, 130),
  ('p-pro-05', 'business-planner', '비즈니스 플래너', '전문적인 업무 관리와 성과 추적을 위한 비즈니스 맞춤 플래너.', 'business', 'premium', 9900, '["연간 목표 OKR","프로젝트 관리","주간 업무 계획","회의록","수입/지출 관리","클라이언트 관리","공휴일 자동 표시","PDF 내부 하이퍼링크"]', 'business', 100, 0, 140);

-- 기본 관리자 계정 (비밀번호: admin1234! - 실제 배포 시 변경 필수)
INSERT OR IGNORE INTO users (id, email, password, name, role, plan) VALUES
  ('user-admin-001', 'admin@planner001.com', '$2a$10$rQ8X.placeholder.hash.here', '관리자', 'admin', 'premium');
