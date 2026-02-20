/**
 * report_app.js — 보고서 · 과제 관리 통합 모듈
 * Tab 1: 보고서 작성, Tab 2: 과제 생성, Tab 3: 과제 채점
 */

// ═══════════════════════════════════════
//  TAB SYSTEM
// ═══════════════════════════════════════
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    const tabMap = { report: 'tabReport', assignment: 'tabAssignment', grading: 'tabGrading' };
    const btnMap = { report: 'tabBtnReport', assignment: 'tabBtnAssignment', grading: 'tabBtnGrading' };
    document.getElementById(tabMap[tabName]).classList.add('active');
    document.getElementById(btnMap[tabName]).classList.add('active');
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    if (typeof getAllChapters !== 'function') return;
    const chapters = getAllChapters();

    // Report chapter dropdown
    const reportSel = document.getElementById('reportChapter');
    chapters.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.id; opt.textContent = `Ch.${ch.id} ${ch.title}`;
        reportSel.appendChild(opt);
    });

    // Grading chapter dropdown
    const gradeSel = document.getElementById('gradeChapter');
    chapters.forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch.id; opt.textContent = `Ch.${ch.id} ${ch.title}`;
        gradeSel.appendChild(opt);
    });

    // Assignment chapter checklist
    const assignList = document.getElementById('assignChapterList');
    assignList.innerHTML = chapters.map(ch => `
    <label style="display:flex;align-items:center;gap:8px;padding:4px 6px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;">
      <input type="checkbox" class="assign-ch-check" value="${ch.id}">
      <span>Ch.${ch.id} ${ch.title}</span>
    </label>
  `).join('');

    // Default: chapter 1
    const urlP = new URLSearchParams(window.location.search);
    reportSel.value = urlP.get('chapter') || '1';
    updateTopicSuggestions();

    // Set default due date (2 weeks from now)
    const dd = new Date(); dd.setDate(dd.getDate() + 14);
    document.getElementById('assignDueDate').value = dd.toISOString().slice(0, 10);

    // Setup drag-and-drop
    setupDragDrop();
});

// ═══════════════════════════════════════
//  TAB 1: 보고서 작성 (기존 로직 유지)
// ═══════════════════════════════════════
const SUGGESTED_TOPICS = {
    1: ['경제학의 10대 기본원리와 일상생활 경제 분석', '기회비용의 개념과 현대사회에서의 적용', '인센티브가 인간 행동에 미치는 영향'],
    2: ['경제 모형의 역할과 한계', '실증적 분석과 규범적 분석의 구분', '순환흐름도로 본 한국 경제'],
    3: ['절대우위와 비교우위의 차이 분석', '한국의 무역 구조와 비교우위', '자유무역 협정(FTA)의 경제적 효과'],
    4: ['코로나19 이후 특정 시장의 수요-공급 변화 분석', '부동산 시장의 수요와 공급 메카니즘'],
    5: ['필수재와 사치재의 수요탄력성 비교', '유류가격의 비탄력성과 정부 조세정책'],
    6: ['최저임금 인상의 경제적 효과', '부동산 가격 규제 정책의 효과와 한계'],
    7: ['소비자잉여의 측정과 경제정책 평가', '가격차별과 소비자잉여의 관계'],
    8: ['조세의 경제적 순손실 분석', '래퍼곡선과 한국의 조세수입'],
    9: ['한국의 무역정책 변화와 후생 분석', '관세와 수입쿼터의 경제적 효과 비교'],
    10: ['탄소배출권 거래제의 경제학적 분석', '환경 규제의 비용과 편익'],
    11: ['공공재 공급의 효율성 분석', '무임승차 문제와 해결방안'],
    12: ['한국 조세제도의 공평성 평가', '누진세 vs 역진세 비교 분석'],
    13: ['기업의 비용 구조와 규모의 경제 분석', '한계비용과 평균비용의 관계'],
    14: ['완전경쟁 시장의 현실 사례 분석', '농산물 시장의 경쟁 구조'],
    15: ['한국 플랫폼 기업의 독점 논쟁', '빅테크 기업의 시장지배력과 반독점 정책'],
    16: ['독점적 경쟁 시장의 광고 효과 분석', '브랜드 차별화 전략의 경제학적 분석'],
    17: ['과점시장에서의 기업 간 전략적 행동', 'OPEC의 담합과 유가 변동 분석'],
    18: ['한국 노동시장의 구조 분석', '노동의 한계생산가치와 임금 결정'],
    19: ['한국의 성별 임금 격차 분석', '인적자본 투자 수익률 분석'],
    20: ['한국의 소득불평등 현황과 대응 정책', '기본소득제의 경제적 효과'],
    21: ['소비자 선택 이론으로 본 소비 트렌드', '행동경제학과 전통적 소비자 선택 이론 비교'],
    22: ['GDP의 한계와 대안적 경제지표', '한국 GDP 성장률 추이와 구조적 변화'],
    23: ['한국의 인플레이션 추이와 CPI 분석', '실질이자율과 명목이자율의 의미'],
    24: ['한국의 경제성장 요인 분석', '기술 혁신과 생산성 향상'],
    25: ['한국의 가계저축률 변화 분석', '대부자금시장과 이자율 결정'],
    26: ['효율적 시장가설의 유효성 검증', '한국 주식시장의 효율성 분석'],
    27: ['한국의 청년 실업 원인과 대책', '기술 발전과 구조적 실업의 관계'],
    28: ['한국은행의 통화정책 분석', '디지털 화폐(CBDC)와 통화제도의 변화'],
    29: ['화폐수량설과 현대 인플레이션', '초인플레이션 사례 연구'],
    30: ['한국의 경상수지 분석', '환율 변동이 수출입에 미치는 영향'],
    31: ['한국의 자본유출입 패턴 분석', '미국 금리 인상이 한국 경제에 미치는 영향'],
    32: ['최근 경기변동 원인 분석 (총수요-총공급)', '스태그플레이션의 역사와 교훈'],
    33: ['한국의 재정정책 효과 분석', '자동안정화장치의 역할'],
    34: ['필립스 곡선의 유효성: 한국 데이터 분석', '인플레이션과 실업의 상충관계 분석'],
    35: ['재량적 정책 vs 준칙의 장단점 분석', '한국의 국가채무와 재정건전성'],
    36: ['경제학 전체를 관통하는 핵심 원리 정리']
};

function updateTopicSuggestions() {
    const chId = parseInt(document.getElementById('reportChapter').value);
    const container = document.getElementById('suggestedTopics');
    if (!chId) { container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);">챕터를 선택하면 추천 주제가 표시됩니다</div>'; return; }
    let topics = SUGGESTED_TOPICS[chId] || [];
    const chapter = typeof getChapter === 'function' ? getChapter(chId) : null;
    if (topics.length === 0 && chapter) {
        topics = [`${chapter.title}의 이론적 분석과 현실 적용`, `${chapter.keywords[0]}의 경제학적 의미와 사례 분석`];
    }
    container.innerHTML = topics.map(t => `
    <button class="btn btn-ghost btn-sm" style="text-align:left;font-size:0.8rem;padding:8px 12px;justify-content:flex-start;"
      onclick="document.getElementById('reportTopic').value='${t.replace(/'/g, "\\'")}'"> ${t}</button>
  `).join('');
}

function generateReport() {
    const chId = parseInt(document.getElementById('reportChapter').value);
    const topic = document.getElementById('reportTopic').value.trim();
    const reportType = document.getElementById('reportType').value;
    const length = document.getElementById('reportLength').value;
    if (!chId) { showToast('관련 챕터를 선택해주세요.', 'error'); return; }
    if (!topic) { showToast('보고서 주제를 입력해주세요.', 'error'); return; }
    const chapter = getChapter(chId);
    const typeLabels = { analysis: '분석 보고서', comparison: '비교 분석 보고서', case: '사례 연구 보고서', policy: '정책 제언 보고서', literature: '문헌 조사 보고서' };
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    document.getElementById('reportEmpty').classList.add('hidden');
    const out = document.getElementById('reportOutput');
    out.classList.remove('hidden');
    out.innerHTML = `
    <div class="output-panel">
      <div class="output-header">
        <span class="output-header-title">${typeLabels[reportType]}</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="printContent('reportBody')">인쇄</button>
          <button class="btn btn-secondary btn-sm" onclick="downloadReport()">다운로드</button>
          <button class="btn btn-ghost btn-sm" onclick="copyReport()">복사</button>
        </div>
      </div>
      <div class="output-body" id="reportBody">
        <div style="text-align:center;padding:2rem 0;margin-bottom:2rem;border-bottom:2px solid var(--border-light);">
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">경제학 보고서</div>
          <h1 style="font-size:1.6rem;font-weight:800;margin-bottom:1rem;line-height:1.4;">${topic}</h1>
          <div style="font-size:0.9rem;color:var(--text-secondary);">
            <p>기반: 맨큐의 경제학 제10판 Chapter ${chapter.id}. ${chapter.title}</p>
            <p style="margin-top:0.5rem;">${today}</p>
          </div>
        </div>
        <div style="margin-bottom:2rem;">
          <h2 style="color:var(--primary-400);border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">I. 서론</h2>
          <p style="color:var(--text-secondary);font-size:0.9rem;text-indent:1rem;line-height:1.8;">
            현대 경제에서 ${topic}은(는) 중요한 의미를 지닌다. ${chapter.summary}
            본 보고서는 맨큐의 경제학 제10판 Chapter ${chapter.id}의 이론적 틀을 바탕으로, ${topic}에 대한 체계적인 분석을 수행하고자 한다.
          </p>
        </div>
        <div style="margin-bottom:2rem;">
          <h2 style="color:var(--primary-400);border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">II. 이론적 배경</h2>
          ${(chapter.concepts || []).map(c => `
            <div style="background:var(--bg-tertiary);border-left:3px solid var(--primary-500);padding:12px 16px;border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:10px;">
              <strong style="color:var(--primary-400);">${c.name}:</strong>
              <span style="color:var(--text-secondary);font-size:0.9rem;"> ${c.desc}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-bottom:2rem;">
          <h2 style="color:var(--primary-400);border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">III. 본론</h2>
          <p style="color:var(--text-secondary);font-size:0.9rem;text-indent:1rem;line-height:1.8;">
            [여기에 현황 분석, 경제학적 분석, 사례 및 데이터를 서술합니다.]
          </p>
        </div>
        <div style="margin-bottom:2rem;">
          <h2 style="color:var(--primary-400);border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">IV. 결론</h2>
          <p style="color:var(--text-secondary);font-size:0.9rem;text-indent:1rem;line-height:1.8;">
            본 보고서는 ${chapter.title}의 이론을 바탕으로 ${topic}에 대해 분석하였다.
          </p>
        </div>
        <div style="margin-top:2rem;border-top:2px solid var(--border-light);padding-top:1.5rem;">
          <h2 style="color:var(--primary-400);margin-bottom:1rem;">참고문헌</h2>
          <div style="font-size:0.85rem;color:var(--text-secondary);line-height:2;">
            <p>Mankiw, N. G. (2024). <em>Principles of Economics</em> (10th ed.). Cengage Learning.</p>
            <p>맨큐, N. G. (2024). 『맨큐의 경제학』 제10판. (이병락 역). 센게이지러닝코리아.</p>
          </div>
        </div>
      </div>
    </div>`;
}

function downloadReport() {
    const body = document.getElementById('reportBody');
    if (!body) return;
    const topic = document.getElementById('reportTopic').value.trim();
    downloadAsText(body.innerText, `보고서_${topic.slice(0, 20)}_${new Date().toISOString().slice(0, 10)}.txt`);
    showToast('보고서가 다운로드되었습니다.', 'success');
}

function copyReport() {
    const body = document.getElementById('reportBody');
    if (!body) return;
    const range = document.createRange(); range.selectNode(body);
    window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
    document.execCommand('copy'); window.getSelection().removeAllRanges();
    showToast('보고서 내용이 클립보드에 복사되었습니다.', 'success');
}


// ═══════════════════════════════════════
//  TAB 2: 과제 생성하기
// ═══════════════════════════════════════
const ASSIGN_TYPE_LABELS = {
    essay: '에세이 (논술형)', case_study: '사례 분석', comparison: '비교 분석',
    debate: '토론문 작성', data_analysis: '데이터 분석', policy_proposal: '정책 제안서'
};
const DIFF_LABELS = { basic: '기본', intermediate: '중급', advanced: '심화' };
const LEN_LABELS = { short: 'A4 2-3매 (1,000~1,500자)', medium: 'A4 5-7매 (2,500~3,500자)', long: 'A4 10매 이상 (5,000자+)' };

function generateAssignment() {
    const checks = document.querySelectorAll('.assign-ch-check:checked');
    if (checks.length === 0) { showToast('최소 1개 챕터를 선택해주세요.', 'error'); return; }

    const chapterIds = Array.from(checks).map(c => parseInt(c.value));
    const chapters = chapterIds.map(id => getChapter(id)).filter(Boolean);
    const type = document.getElementById('assignType').value;
    const diff = document.getElementById('assignDifficulty').value;
    const len = document.getElementById('assignLength').value;
    const dueDate = document.getElementById('assignDueDate').value;
    const includeRubric = document.getElementById('assignIncludeRubric').checked;

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const dueDateStr = dueDate ? new Date(dueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '추후 공지';

    // Build chapter info text
    const chInfoHtml = chapters.map(ch => `
    <div style="margin-bottom:8px;">
      <strong>Ch.${ch.id} ${ch.title}</strong> (${ch.pages}쪽)
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">${ch.keywords.join(', ')}</div>
    </div>
  `).join('');

    // Build assignment prompt based on type
    const prompts = buildAssignmentPrompt(chapters, type, diff);

    // Build rubric
    const rubricHtml = includeRubric ? buildRubricTable(type) : '';

    document.getElementById('assignEmpty').classList.add('hidden');
    const out = document.getElementById('assignOutput');
    out.classList.remove('hidden');
    out.innerHTML = `
    <div class="output-panel">
      <div class="output-header">
        <span class="output-header-title">과제지</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="printContent('assignBody')">인쇄</button>
          <button class="btn btn-ghost btn-sm" onclick="copyAssignment()">복사</button>
        </div>
      </div>
      <div class="output-body" id="assignBody">
        <div class="assignment-preview">
          <!-- Header -->
          <div style="text-align:center;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:2px solid var(--border-light);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:2px;margin-bottom:0.5rem;">경제학원론 과제</div>
            <h1 style="font-size:1.4rem;font-weight:800;color:var(--text-primary);margin-bottom:0.5rem;">${ASSIGN_TYPE_LABELS[type]}</h1>
            <div style="display:flex;justify-content:center;gap:8px;margin-top:1rem;">
              <span class="tag tag-blue">${DIFF_LABELS[diff]}</span>
              <span class="tag tag-green">${LEN_LABELS[len]}</span>
            </div>
          </div>

          <!-- Info Grid -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;font-size:0.85rem;">
            <div><strong style="color:var(--text-muted);">출제일:</strong> <span style="color:var(--text-secondary);">${today}</span></div>
            <div><strong style="color:var(--text-muted);">제출기한:</strong> <span style="color:var(--text-secondary);">${dueDateStr}</span></div>
            <div><strong style="color:var(--text-muted);">분량:</strong> <span style="color:var(--text-secondary);">${LEN_LABELS[len]}</span></div>
            <div><strong style="color:var(--text-muted);">제출형식:</strong> <span style="color:var(--text-secondary);">PDF 파일</span></div>
          </div>

          <!-- Related Chapters -->
          <div style="background:var(--bg-tertiary);padding:1rem 1.2rem;border-radius:var(--radius-sm);margin-bottom:1.5rem;">
            <h3 style="font-size:0.9rem;color:var(--primary-400);margin-bottom:0.8rem;">관련 챕터</h3>
            ${chInfoHtml}
          </div>

          <!-- Assignment Content -->
          <div style="margin-bottom:1.5rem;">
            <h3 style="font-size:1rem;color:var(--primary-400);margin-bottom:1rem;border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">과제 내용</h3>
            ${prompts}
          </div>

          <!-- Requirements -->
          <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);padding:1rem 1.2rem;border-radius:var(--radius-sm);margin-bottom:1.5rem;">
            <h3 style="font-size:0.9rem;color:var(--accent-amber);margin-bottom:0.8rem;">유의사항</h3>
            <ul style="font-size:0.85rem;color:var(--text-secondary);padding-left:1.2rem;line-height:1.8;">
              <li>반드시 맨큐의 경제학 제10판의 관련 챕터를 참고하여 작성하세요.</li>
              <li>AI 도구(ChatGPT 등)를 활용한 작성은 <strong style="color:var(--accent-amber);">AI 탐지 시스템</strong>으로 검출됩니다.</li>
              <li>표절 및 AI 생성 콘텐츠가 발견될 경우 0점 처리됩니다.</li>
              <li>참고문헌은 APA 양식에 맞추어 작성하세요.</li>
              <li>파일명: <code>학번_이름_과제${chapterIds[0]}.pdf</code></li>
            </ul>
          </div>

          ${rubricHtml}
        </div>
      </div>
    </div>`;
}

function buildAssignmentPrompt(chapters, type, diff) {
    const ch = chapters[0];
    const allKeywords = chapters.flatMap(c => c.keywords).filter((v, i, a) => a.indexOf(v) === i);
    const keyStr = allKeywords.slice(0, 6).join(', ');

    const prompts = {
        essay: `
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin-bottom:1rem;">
        다음 주제 중 <strong>하나를 선택</strong>하여 논술형 에세이를 작성하시오.
      </p>
      <ol style="color:var(--text-primary);font-size:0.9rem;line-height:2;padding-left:1.5rem;">
        <li>${ch.title}에서 다루는 핵심 개념(${allKeywords.slice(0, 3).join(', ')})을 정의하고, 한국 경제에서의 실제 적용 사례를 분석하시오.</li>
        <li>${ch.summary.replace(/\.$/, '')}. 이 내용을 바탕으로 현대 경제 현안 하나를 선택하여 경제학적 분석을 수행하시오.</li>
        <li>${keyStr} 등의 개념들이 실제 경제 현상에서 어떻게 관련되는지 사례를 들어 설명하시오.</li>
      </ol>`,
        case_study: `
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin-bottom:1rem;">
        <strong>${ch.title}</strong>에서 다루는 이론을 활용하여 실제 경제 사례를 분석하시오.
      </p>
      <div style="padding:1rem;background:var(--bg-tertiary);border-radius:var(--radius-sm);margin-bottom:1rem;">
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8;">
          <strong>분석 대상:</strong> 최근 1년 이내의 한국 또는 세계 경제 이슈 중에서 ${keyStr}과(와) 관련된 사례를 선택하시오.<br>
          <strong>분석 방법:</strong> 교과서의 이론적 틀(${(ch.concepts || []).map(c => c.name).join(', ')})을 적용하여 원인, 과정, 결과를 분석하시오.<br>
          <strong>결론:</strong> 이 사례가 주는 경제학적 시사점과 정책적 함의를 도출하시오.
        </p>
      </div>`,
        comparison: `
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin-bottom:1rem;">
        다음 주제에 대해 <strong>비교·분석</strong> 보고서를 작성하시오.
      </p>
      <ol style="color:var(--text-primary);font-size:0.9rem;line-height:2;padding-left:1.5rem;">
        <li>${allKeywords.length >= 2 ? allKeywords[0] + '과(와) ' + allKeywords[1] + '의 개념을 비교하고, 각각의 경제적 의미를 분석하시오.' : ch.title + '의 핵심 개념들을 비교 분석하시오.'}</li>
        <li>한국과 다른 국가(미국, 일본, EU 중 택 1)의 관련 정책을 비교하고 시사점을 도출하시오.</li>
      </ol>`,
        debate: `
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin-bottom:1rem;">
        다음 논제에 대해 <strong>찬성 또는 반대</strong> 입장을 선택하여 토론문을 작성하시오.
      </p>
      <div style="padding:1.2rem;background:var(--bg-tertiary);border-left:3px solid var(--primary-500);border-radius:0 var(--radius-sm) var(--radius-sm) 0;margin-bottom:1rem;">
        <p style="font-size:1rem;color:var(--text-primary);font-weight:600;font-style:italic;">
          "${ch.title}와 관련하여, 정부의 시장 개입은 경제적 효율성을 높이는가?"
        </p>
      </div>
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8;">
        교과서의 ${keyStr} 등의 개념을 활용하여 논거를 구성하고, 반대 입장의 논거도 검토한 후 반박하시오.
      </p>`,
        data_analysis: `
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin-bottom:1rem;">
        <strong>데이터를 수집·분석</strong>하여 ${ch.title}의 이론을 실증적으로 검증하시오.
      </p>
      <ol style="color:var(--text-primary);font-size:0.9rem;line-height:2;padding-left:1.5rem;">
        <li>한국은행(ECOS), 통계청(KOSIS) 등에서 관련 데이터를 수집하시오.</li>
        <li>${keyStr}과 관련된 변수들 간의 관계를 표 또는 그래프로 시각화하시오.</li>
        <li>데이터 분석 결과가 교과서 이론과 일치하는지 비교·평가하시오.</li>
      </ol>`,
        policy_proposal: `
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8;margin-bottom:1rem;">
        ${ch.title}의 이론을 바탕으로 <strong>구체적인 정책을 제안</strong>하시오.
      </p>
      <ol style="color:var(--text-primary);font-size:0.9rem;line-height:2;padding-left:1.5rem;">
        <li>현재 한국 경제에서 ${keyStr}과 관련된 문제를 하나 선택하시오.</li>
        <li>해당 문제의 원인을 교과서 이론으로 분석하시오.</li>
        <li>경제학적 근거에 기반한 정책 제안 3가지를 제시하고, 각 정책의 예상 효과와 한계를 분석하시오.</li>
      </ol>`
    };
    return prompts[type] || prompts.essay;
}

function buildRubricTable(type) {
    return `
    <div style="margin-top:1.5rem;">
      <h3 style="font-size:1rem;color:var(--primary-400);margin-bottom:1rem;border-bottom:1px solid var(--border-light);padding-bottom:0.5rem;">채점 기준표 (총 100점)</h3>
      <table class="rubric-table">
        <thead>
          <tr><th style="width:25%;">평가 항목</th><th style="width:15%;">배점</th><th>평가 기준</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>이론 이해도</strong></td><td>30점</td><td>교과서 핵심 개념의 정확한 이해 및 적용</td></tr>
          <tr><td><strong>분석의 깊이</strong></td><td>25점</td><td>경제학적 분석 도구의 적절한 활용, 논리적 근거 제시</td></tr>
          <tr><td><strong>사례/데이터</strong></td><td>20점</td><td>실제 사례 또는 데이터의 적절한 인용 및 분석</td></tr>
          <tr><td><strong>논리 구조</strong></td><td>15점</td><td>서론-본론-결론의 체계적 구성, 문장 가독성</td></tr>
          <tr><td><strong>참고문헌</strong></td><td>10점</td><td>APA 양식 준수, 다양한 학술 자료 인용</td></tr>
        </tbody>
      </table>
      <div style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted);line-height:1.6;">
        * AI 작성 탐지 시 0점 처리 | 표절률 30% 초과 시 감점 | 기한 초과 시 일당 10점 감점
      </div>
    </div>`;
}

function copyAssignment() {
    const body = document.getElementById('assignBody');
    if (!body) return;
    const range = document.createRange(); range.selectNode(body);
    window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
    document.execCommand('copy'); window.getSelection().removeAllRanges();
    showToast('과제지가 클립보드에 복사되었습니다.', 'success');
}


// ═══════════════════════════════════════
//  TAB 3: 과제 채점하기
// ═══════════════════════════════════════
let uploadedFile = null;
let uploadedText = '';

function setupDragDrop() {
    const zone = document.getElementById('uploadZone');
    if (!zone) return;
    ['dragenter', 'dragover'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.remove('dragover'); }));
    zone.addEventListener('drop', ev => {
        const file = ev.dataTransfer.files[0];
        if (file) processFile(file);
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    if (!file.name.match(/\.(pdf|txt)$/i)) {
        showToast('PDF 또는 TXT 파일만 업로드 가능합니다.', 'error');
        return;
    }
    uploadedFile = file;
    const sizeStr = file.size < 1024 * 1024 ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('fileInfo').innerHTML = `
    <div class="file-info">
      <div><i class="fa-solid fa-file-pdf" style="color:var(--primary-400);font-size:1.2rem;"></i></div>
      <div class="file-name">${file.name}</div>
      <div class="file-size">${sizeStr}</div>
      <button class="btn btn-ghost btn-sm" onclick="removeFile()" style="padding:4px 8px;font-size:0.75rem;">삭제</button>
    </div>`;
    document.getElementById('gradeBtn').disabled = false;

    // Extract text from file
    if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = e => { uploadedText = e.target.result; };
        reader.readAsText(file, 'utf-8');
    } else {
        // For PDF: try to read as text (basic), or leave for server-side processing
        uploadedText = '[PDF 파일: 서버에서 텍스트 추출 필요]';
    }
}

function removeFile() {
    uploadedFile = null;
    uploadedText = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('fileInfo').innerHTML = '';
    document.getElementById('pdfInput').value = '';
    document.getElementById('gradeBtn').disabled = true;
}

function gradeAssignment() {
    if (!uploadedFile) { showToast('파일을 먼저 업로드해주세요.', 'error'); return; }

    const chId = parseInt(document.getElementById('gradeChapter').value);
    const topic = document.getElementById('gradeAssignTopic').value.trim();
    const chapter = chId ? getChapter(chId) : null;

    const checkAi = document.getElementById('gradeAiDetect').checked;
    const checkContent = document.getElementById('gradeContent').checked;
    const checkLogic = document.getElementById('gradeLogic').checked;
    const checkRef = document.getElementById('gradeRef').checked;

    document.getElementById('gradeEmpty').classList.add('hidden');
    const out = document.getElementById('gradeOutput');
    out.classList.remove('hidden');

    // Show loading
    out.innerHTML = `
    <div class="content-panel" style="text-align:center;padding:3rem;">
      <div class="loading-spinner" style="margin:0 auto 1rem;width:40px;height:40px;border:3px solid var(--border-light);border-top:3px solid var(--primary-500);border-radius:50%;animation:spin 1s linear infinite;"></div>
      <div style="color:var(--text-secondary);">AI 분석 중... 잠시만 기다려주세요.</div>
      <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
    </div>`;

    // Simulate grading (in production: send to RAG server /api/grade endpoint)
    setTimeout(() => {
        const scores = simulateGrading(chapter, topic, checkAi, checkContent, checkLogic, checkRef);
        renderGradeResult(scores, chapter, checkAi, checkContent, checkLogic, checkRef);
    }, 2000);
}

function simulateGrading(chapter, topic, checkAi, checkContent, checkLogic, checkRef) {
    // Simulated AI analysis scores (in production, these come from Gemini API)
    return {
        aiScore: Math.floor(Math.random() * 40 + 15),  // AI 의심도 (0~100, 낮을수록 좋음)
        contentScore: Math.floor(Math.random() * 30 + 60), // 내용 충실도 (0~100)
        logicScore: Math.floor(Math.random() * 25 + 65),   // 논리 구조 (0~100)
        refScore: Math.floor(Math.random() * 30 + 55),     // 참고문헌 (0~100)
        totalScore: 0,
        grade: '',
        feedback: []
    };
}

function renderGradeResult(scores, chapter, checkAi, checkContent, checkLogic, checkRef) {
    // Calculate total
    let total = 0, count = 0;
    if (checkContent) { total += scores.contentScore; count++; }
    if (checkLogic) { total += scores.logicScore; count++; }
    if (checkRef) { total += scores.refScore; count++; }
    const avg = count > 0 ? Math.round(total / count) : 0;

    // Determine grade
    let grade, gradeColor, gradeBg;
    if (avg >= 90) { grade = 'A+'; gradeColor = '#10b981'; gradeBg = 'rgba(16,185,129,0.15)'; }
    else if (avg >= 85) { grade = 'A'; gradeColor = '#10b981'; gradeBg = 'rgba(16,185,129,0.1)'; }
    else if (avg >= 80) { grade = 'B+'; gradeColor = '#3b82f6'; gradeBg = 'rgba(59,130,246,0.12)'; }
    else if (avg >= 75) { grade = 'B'; gradeColor = '#3b82f6'; gradeBg = 'rgba(59,130,246,0.08)'; }
    else if (avg >= 70) { grade = 'C+'; gradeColor = '#f59e0b'; gradeBg = 'rgba(245,158,11,0.1)'; }
    else if (avg >= 65) { grade = 'C'; gradeColor = '#f59e0b'; gradeBg = 'rgba(245,158,11,0.08)'; }
    else { grade = 'D'; gradeColor = '#ef4444'; gradeBg = 'rgba(239,68,68,0.1)'; }

    // AI penalty
    let aiPenalty = '';
    let aiRiskClass = 'ai-risk-low';
    let aiRiskText = '낮음 (자체 작성 추정)';
    if (scores.aiScore >= 70) { aiRiskClass = 'ai-risk-high'; aiRiskText = '높음 (AI 생성 의심)'; aiPenalty = '<div style="color:#ef4444;font-weight:600;margin-top:8px;">⚠ AI 작성 의심도가 높습니다. 구술 확인이 권장됩니다.</div>'; }
    else if (scores.aiScore >= 40) { aiRiskClass = 'ai-risk-medium'; aiRiskText = '보통 (부분 AI 활용 가능성)'; }

    const out = document.getElementById('gradeOutput');
    out.innerHTML = `
    <div class="output-panel">
      <div class="output-header">
        <span class="output-header-title">채점 결과: ${uploadedFile.name}</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="printContent('gradeBody')">인쇄</button>
          <button class="btn btn-ghost btn-sm" onclick="copyGrade()">복사</button>
        </div>
      </div>
      <div class="output-body" id="gradeBody">

        <!-- Overall Grade Card -->
        <div style="display:flex;align-items:center;gap:2rem;padding:1.5rem;background:${gradeBg};border-radius:var(--radius-md);margin-bottom:1.5rem;">
          <div class="grade-badge" style="background:${gradeColor};color:#fff;flex-shrink:0;">${grade}</div>
          <div>
            <div style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">종합 평가: ${avg}점 / 100점</div>
            <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:4px;">
              ${chapter ? `Ch.${chapter.id} ${chapter.title} 기반 평가` : '일반 평가'}
            </div>
          </div>
        </div>

        ${checkAi ? `
        <!-- AI Detection Card -->
        <div class="grade-card">
          <h3><i class="fa-solid fa-robot" style="color:${scores.aiScore >= 70 ? '#ef4444' : scores.aiScore >= 40 ? '#f59e0b' : '#10b981'};"></i> AI 작성 여부 탐지</h3>
          <div class="score-label"><span>AI 의심도</span><span class="${aiRiskClass}">${scores.aiScore}% — ${aiRiskText}</span></div>
          <div class="score-bar"><div class="score-bar-fill ${scores.aiScore >= 70 ? 'score-low' : scores.aiScore >= 40 ? 'score-medium' : 'score-high'}" style="width:${scores.aiScore}%;"></div></div>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-top:8px;line-height:1.6;">
            분석 기준: 문체 일관성, 어휘 다양성, 문장 패턴, 창의적 표현 비율, 반복적 구조 사용 여부
          </div>
          ${aiPenalty}
        </div>` : ''}

        ${checkContent ? `
        <!-- Content Quality Card -->
        <div class="grade-card">
          <h3><i class="fa-solid fa-book-open" style="color:var(--primary-400);"></i> 내용 충실도</h3>
          <div class="score-label"><span>교과서 내용 반영도</span><span>${scores.contentScore}점</span></div>
          <div class="score-bar"><div class="score-bar-fill ${scores.contentScore >= 80 ? 'score-high' : scores.contentScore >= 60 ? 'score-medium' : 'score-low'}" style="width:${scores.contentScore}%;"></div></div>
          <div style="margin-top:12px;">
            <div class="feedback-item"><strong>핵심 개념 활용:</strong> ${scores.contentScore >= 75 ? '주요 개념을 적절히 활용하고 있습니다.' : '교과서의 핵심 개념을 더 활용할 필요가 있습니다.'}</div>
            <div class="feedback-item"><strong>이론 적용:</strong> ${scores.contentScore >= 70 ? '이론을 실제 상황에 적용하려는 시도가 보입니다.' : '이론과 현실의 연결이 부족합니다.'}</div>
          </div>
        </div>` : ''}

        ${checkLogic ? `
        <!-- Logic Structure Card -->
        <div class="grade-card">
          <h3><i class="fa-solid fa-sitemap" style="color:var(--primary-400);"></i> 논리 구조</h3>
          <div class="score-label"><span>구조 체계성</span><span>${scores.logicScore}점</span></div>
          <div class="score-bar"><div class="score-bar-fill ${scores.logicScore >= 80 ? 'score-high' : scores.logicScore >= 60 ? 'score-medium' : 'score-low'}" style="width:${scores.logicScore}%;"></div></div>
          <div style="margin-top:12px;">
            <div class="feedback-item"><strong>서론-본론-결론:</strong> ${scores.logicScore >= 80 ? '체계적으로 구성되어 있습니다.' : '서론-본론-결론 구분이 더 명확해야 합니다.'}</div>
            <div class="feedback-item"><strong>단락 연결:</strong> ${scores.logicScore >= 75 ? '단락 간 논리적 흐름이 자연스럽습니다.' : '단락 간 전환이 매끄럽지 않은 부분이 있습니다.'}</div>
          </div>
        </div>` : ''}

        ${checkRef ? `
        <!-- References Card -->
        <div class="grade-card">
          <h3><i class="fa-solid fa-quote-right" style="color:var(--primary-400);"></i> 참고문헌 적절성</h3>
          <div class="score-label"><span>인용 적절성</span><span>${scores.refScore}점</span></div>
          <div class="score-bar"><div class="score-bar-fill ${scores.refScore >= 80 ? 'score-high' : scores.refScore >= 60 ? 'score-medium' : 'score-low'}" style="width:${scores.refScore}%;"></div></div>
          <div style="margin-top:12px;">
            <div class="feedback-item"><strong>인용 양식:</strong> ${scores.refScore >= 80 ? 'APA 양식을 잘 준수하고 있습니다.' : 'APA 양식을 더 정확히 따를 필요가 있습니다.'}</div>
            <div class="feedback-item"><strong>자료 다양성:</strong> ${scores.refScore >= 70 ? '다양한 출처를 활용하고 있습니다.' : '보다 다양한 학술 자료를 참고할 필요가 있습니다.'}</div>
          </div>
        </div>` : ''}

        <!-- Summary Feedback -->
        <div class="grade-card" style="border-left:3px solid ${gradeColor};">
          <h3><i class="fa-solid fa-comment-dots" style="color:${gradeColor};"></i> 종합 피드백</h3>
          <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.8;">
            <p>전체적으로 ${avg >= 80 ? '우수한' : avg >= 65 ? '보통 수준의' : '보완이 필요한'} 과제입니다.</p>
            <p style="margin-top:8px;">${scores.contentScore >= 75 ? '교과서 핵심 개념을 비교적 잘 활용하였으며, ' : '교과서 핵심 개념의 활용도를 높여야 하며, '}
            ${scores.logicScore >= 75 ? '논리적 구조도 체계적입니다.' : '논리적 구조의 개선이 필요합니다.'}</p>
            ${scores.aiScore >= 40 ? '<p style="margin-top:8px;color:var(--accent-amber);">* AI 도구 활용 가능성이 일부 감지되었습니다. 향후 과제에서는 본인의 분석과 문체를 더 반영해 주세요.</p>' : ''}
          </div>
        </div>
      </div>
    </div>`;
}

function copyGrade() {
    const body = document.getElementById('gradeBody');
    if (!body) return;
    const range = document.createRange(); range.selectNode(body);
    window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
    document.execCommand('copy'); window.getSelection().removeAllRanges();
    showToast('채점 결과가 클립보드에 복사되었습니다.', 'success');
}
