/**
 * syllabus_app.js — 강의계획서 자동 생성 모듈
 * Step 1: PDF 업로드 / 기본 데이터 사용
 * Step 2: 기본 정보 입력
 * Step 3: 16주 강의계획서 편집 & 출력
 */

let sylUploadedFiles = []; // 복수 파일 배열 (최대 10개)
let syllabusData = []; // 16주 데이터

// ═══════════════════════════════════════
//  STEP NAVIGATION
// ═══════════════════════════════════════
function goToStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`stepContent${i}`).classList.toggle('hidden', i !== n);
    const step = document.getElementById(`step${i}`);
    step.classList.remove('active', 'done');
    if (i < n) step.classList.add('done');
    if (i === n) step.classList.add('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════
//  STEP 1: FILE UPLOAD (복수 파일 지원)
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('sylUploadZone');
  if (!zone) return;
  ['dragenter', 'dragover'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, ev => { ev.preventDefault(); zone.classList.remove('dragover'); }));
  zone.addEventListener('drop', ev => {
    const files = Array.from(ev.dataTransfer.files);
    if (files.length > 0) addSylFiles(files);
  });
});

function handleSylUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length > 0) addSylFiles(files);
}

function addSylFiles(newFiles) {
  // Filter valid files
  const valid = newFiles.filter(f => f.name.match(/\.(pdf|txt)$/i));
  const invalid = newFiles.length - valid.length;
  if (invalid > 0) showToast(`${invalid}개 파일이 지원하지 않는 형식입니다 (PDF/TXT만 가능).`, 'error');

  // Check max limit
  const remaining = 10 - sylUploadedFiles.length;
  if (valid.length > remaining) {
    showToast(`최대 10개까지 업로드 가능합니다. ${valid.length - remaining}개 파일이 제외되었습니다.`, 'error');
    valid.splice(remaining);
  }
  if (valid.length === 0) return;

  // Avoid duplicates by name
  valid.forEach(f => {
    if (!sylUploadedFiles.find(existing => existing.name === f.name)) {
      sylUploadedFiles.push(f);
    }
  });

  renderSylFileList();
  showToast(`${valid.length}개 파일이 추가되었습니다. (총 ${sylUploadedFiles.length}/10)`, 'success');
}

function renderSylFileList() {
  const countEl = document.getElementById('sylFileCount');
  const listEl = document.getElementById('sylFileList');
  const nextBtn = document.getElementById('sylNextBtn');

  if (sylUploadedFiles.length === 0) {
    countEl.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }

  countEl.classList.remove('hidden');
  if (nextBtn) nextBtn.classList.remove('hidden');
  countEl.textContent = `업로드된 파일: ${sylUploadedFiles.length} / 10`;

  listEl.innerHTML = sylUploadedFiles.map((f, idx) => {
    const sizeStr = f.size < 1024 * 1024 ? (f.size / 1024).toFixed(1) + ' KB' : (f.size / (1024 * 1024)).toFixed(1) + ' MB';
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg-tertiary);border-radius:var(--radius-sm);font-size:0.85rem;">
        <i class="fa-solid fa-file-pdf" style="color:var(--primary-400);font-size:1.1rem;flex-shrink:0;"></i>
        <div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-primary);">${f.name}</div>
        <div style="color:var(--text-muted);font-size:0.75rem;flex-shrink:0;">${sizeStr}</div>
        <button class="btn btn-ghost btn-sm" onclick="removeSylFile(${idx})" style="padding:2px 8px;font-size:0.7rem;flex-shrink:0;">삭제</button>
      </div>`;
  }).join('');
}

function removeSylFile(idx) {
  sylUploadedFiles.splice(idx, 1);
  renderSylFileList();
  document.getElementById('sylPdfInput').value = '';
}

function removeAllSylFiles() {
  sylUploadedFiles = [];
  renderSylFileList();
  document.getElementById('sylPdfInput').value = '';
}

function useDefaultTextbook() {
  sylUploadedFiles = [];
  renderSylFileList();
  showToast('맨큐의 경제학 제10판 데이터를 사용합니다.', 'success');
  setTimeout(() => goToStep(2), 500);
}

// ═══════════════════════════════════════
//  STEP 2 → STEP 3: GENERATE SYLLABUS
// ═══════════════════════════════════════
function generateSyllabus() {
  const courseName = document.getElementById('sylCourseName').value.trim() || '경제학원론';
  const professor = document.getElementById('sylProfessor').value.trim() || '미정';

  // Build 16 weeks from textbook data
  syllabusData = buildDefaultSyllabus();

  renderSyllabus();
  goToStep(3);
  showToast('강의계획서가 생성되었습니다. 각 주차를 클릭하여 편집할 수 있습니다.', 'success');
}

function buildDefaultSyllabus() {
  const chapters = (typeof getAllChapters === 'function') ? getAllChapters() : [];
  // Group ~36 chapters into 14 teaching weeks (weeks 8,16 are special)
  const weeks = [];
  const chPerWeek = Math.ceil(chapters.length / 14);

  let chIdx = 0;
  for (let w = 1; w <= 16; w++) {
    if (w === 8) {
      weeks.push({ week: w, topic: '중간고사', chapters: '', method: 'exam', note: '범위: 1~7주차 내용', isSpecial: true });
      continue;
    }
    if (w === 16) {
      weeks.push({ week: w, topic: '기말고사', chapters: '', method: 'exam', note: '범위: 9~15주차 내용', isSpecial: true });
      continue;
    }

    const weekChapters = [];
    const topicParts = [];
    for (let c = 0; c < chPerWeek && chIdx < chapters.length; c++, chIdx++) {
      weekChapters.push(`Ch.${chapters[chIdx].id}`);
      topicParts.push(chapters[chIdx].title);
    }

    let method = 'lecture';
    if (w === 4 || w === 11) method = 'discussion';
    if (w === 7 || w === 14) method = 'presentation';

    weeks.push({
      week: w,
      topic: topicParts.join(' / ') || `주제 ${w}`,
      chapters: weekChapters.join(', '),
      method: method,
      note: '',
      isSpecial: false
    });
  }
  return weeks;
}

// ═══════════════════════════════════════
//  RENDER SYLLABUS (STEP 3)
// ═══════════════════════════════════════
function renderSyllabus() {
  const courseName = document.getElementById('sylCourseName').value.trim() || '경제학원론';
  const professor = document.getElementById('sylProfessor').value.trim() || '미정';
  const semester = document.getElementById('sylSemester').options[document.getElementById('sylSemester').selectedIndex].text;
  const credits = document.getElementById('sylCredits').value;
  const schedule = document.getElementById('sylSchedule').value.trim() || '미정';
  const room = document.getElementById('sylRoom').value.trim() || '미정';
  const objective = document.getElementById('sylObjective').value.trim();
  const midterm = document.getElementById('sylMidterm').value;
  const final_ = document.getElementById('sylFinal').value;
  const assign = document.getElementById('sylAssign').value;
  const attend = document.getElementById('sylAttend').value;

  const methodOptions = `
    <option value="lecture">강의</option>
    <option value="discussion">토론</option>
    <option value="presentation">발표</option>
    <option value="practice">실습</option>
    <option value="flipped">플립러닝</option>
    <option value="group">조별활동</option>
    <option value="exam">시험</option>
    <option value="video">동영상</option>
  `;

  const methodLabels = { lecture: '강의', discussion: '토론', presentation: '발표', practice: '실습', flipped: '플립러닝', group: '조별활동', exam: '시험', video: '동영상' };

  const weekRowsHtml = syllabusData.map((w, idx) => {
    const selOpts = methodOptions.replace(`value="${w.method}"`, `value="${w.method}" selected`);
    const rowClass = w.isSpecial ? 'week-row special-week' : 'week-row';
    return `
      <div class="${rowClass}" data-week="${idx}">
        <div class="week-num">${w.week}주</div>
        <div class="week-topic">
          <input type="text" value="${escapeAttr(w.topic)}" onchange="updateWeekData(${idx},'topic',this.value)" placeholder="강의 주제를 입력하세요">
          ${w.chapters ? `<div class="week-chapter" style="margin-top:4px;">${w.chapters}</div>` : ''}
        </div>
        <div class="week-method">
          <select onchange="updateWeekData(${idx},'method',this.value)">${selOpts}</select>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);">
          <input type="text" value="${escapeAttr(w.note)}" onchange="updateWeekData(${idx},'note',this.value)" placeholder="비고" style="padding:6px 8px;border:1px solid var(--border-light);border-radius:var(--radius-sm);background:var(--bg-primary);color:var(--text-secondary);font-size:0.8rem;width:100%;">
        </div>
        <div class="week-actions">
          <button onclick="moveWeek(${idx},-1)" title="위로"><i class="fa-solid fa-chevron-up"></i></button>
          <button onclick="moveWeek(${idx},1)" title="아래로"><i class="fa-solid fa-chevron-down"></i></button>
        </div>
      </div>`;
  }).join('');

  const preview = document.getElementById('syllabusPreview');
  preview.innerHTML = `
    <!-- Header -->
    <div class="syl-preview-header" style="text-align:center;padding:2rem;">
      <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:2px;margin-bottom:0.5rem;">SYLLABUS</div>
      <h1 style="font-size:1.5rem;font-weight:800;color:var(--text-primary);margin-bottom:0.5rem;">${escapeHtml(courseName)}</h1>
      <div style="font-size:0.9rem;color:var(--text-secondary);">${semester}</div>
    </div>

    <!-- Course Info -->
    <div style="padding:1.5rem;border-bottom:1px solid var(--border-light);">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;font-size:0.85rem;">
        <div><strong style="color:var(--text-muted);">담당교수</strong><div style="color:var(--text-primary);margin-top:4px;">${escapeHtml(professor)}</div></div>
        <div><strong style="color:var(--text-muted);">학점</strong><div style="color:var(--text-primary);margin-top:4px;">${credits}학점</div></div>
        <div><strong style="color:var(--text-muted);">강의 시간</strong><div style="color:var(--text-primary);margin-top:4px;">${escapeHtml(schedule)}</div></div>
        <div><strong style="color:var(--text-muted);">강의실</strong><div style="color:var(--text-primary);margin-top:4px;">${escapeHtml(room)}</div></div>
        <div style="grid-column:span 2;"><strong style="color:var(--text-muted);">교재</strong><div style="color:var(--text-primary);margin-top:4px;">맨큐의 경제학 제10판 (N. Gregory Mankiw)</div></div>
      </div>
    </div>

    <!-- Objective -->
    <div style="padding:1.5rem;border-bottom:1px solid var(--border-light);">
      <h3 style="font-size:0.95rem;color:var(--primary-400);margin-bottom:0.8rem;">수업 목표</h3>
      <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.8;">${escapeHtml(objective)}</p>
    </div>

    <!-- Grading -->
    <div style="padding:1.5rem;border-bottom:1px solid var(--border-light);">
      <h3 style="font-size:0.95rem;color:var(--primary-400);margin-bottom:0.8rem;">성적 평가</h3>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        ${gradeBar('중간고사', midterm)}
        ${gradeBar('기말고사', final_)}
        ${gradeBar('과제', assign)}
        ${gradeBar('출석/참여', attend)}
      </div>
    </div>

    <!-- Weekly Schedule -->
    <div style="padding:1.5rem 1.5rem 0.5rem;">
      <h3 style="font-size:0.95rem;color:var(--primary-400);margin-bottom:1rem;">주차별 강의 계획</h3>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;">* 각 항목을 클릭하여 직접 수정할 수 있습니다</div>
    </div>
    <div class="week-header">
      <div>주차</div><div>강의 주제</div><div>수업 방법</div><div>비고</div><div></div>
    </div>
    ${weekRowsHtml}

    <!-- Add Week Button -->
    <div style="text-align:center;padding:1rem;">
      <button class="btn btn-ghost btn-sm" onclick="addWeek()"><i class="fa-solid fa-plus"></i> 주차 추가</button>
    </div>
  `;
}

function gradeBar(label, pct) {
  return `
    <div style="flex:1;min-width:120px;">
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
        <span style="color:var(--text-secondary);">${label}</span>
        <span style="color:var(--primary-400);font-weight:700;">${pct}%</span>
      </div>
      <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary-500),var(--primary-400));border-radius:3px;"></div>
      </div>
    </div>`;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ═══════════════════════════════════════
//  EDIT FUNCTIONS
// ═══════════════════════════════════════
function updateWeekData(idx, field, value) {
  if (syllabusData[idx]) syllabusData[idx][field] = value;
}

function moveWeek(idx, direction) {
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= syllabusData.length) return;
  // Swap
  const temp = syllabusData[idx];
  syllabusData[idx] = syllabusData[newIdx];
  syllabusData[newIdx] = temp;
  // Re-assign week numbers
  syllabusData.forEach((w, i) => w.week = i + 1);
  renderSyllabus();
}

function addWeek() {
  const newWeek = syllabusData.length + 1;
  syllabusData.push({ week: newWeek, topic: '', chapters: '', method: 'lecture', note: '', isSpecial: false });
  renderSyllabus();
  showToast(`${newWeek}주차가 추가되었습니다.`, 'success');
}

function resetSyllabus() {
  if (!confirm('강의계획서를 초기 상태로 되돌리시겠습니까?')) return;
  syllabusData = buildDefaultSyllabus();
  renderSyllabus();
  showToast('강의계획서가 초기화되었습니다.', 'success');
}

// ═══════════════════════════════════════
//  DOWNLOAD
// ═══════════════════════════════════════
function downloadSyllabus() {
  const courseName = document.getElementById('sylCourseName').value.trim() || '경제학원론';
  const professor = document.getElementById('sylProfessor').value.trim() || '미정';
  const semester = document.getElementById('sylSemester').options[document.getElementById('sylSemester').selectedIndex].text;
  const methodLabels = { lecture: '강의', discussion: '토론', presentation: '발표', practice: '실습', flipped: '플립러닝', group: '조별활동', exam: '시험', video: '동영상' };

  let text = `═══════════════════════════════════════\n`;
  text += `        ${courseName} 강의계획서\n`;
  text += `═══════════════════════════════════════\n\n`;
  text += `담당교수: ${professor}\n`;
  text += `학기: ${semester}\n`;
  text += `교재: 맨큐의 경제학 제10판\n\n`;
  text += `───────────────────────────────────────\n`;
  text += `주차별 강의 계획\n`;
  text += `───────────────────────────────────────\n\n`;

  syllabusData.forEach(w => {
    text += `[${w.week}주차] ${w.topic}\n`;
    if (w.chapters) text += `  관련 챕터: ${w.chapters}\n`;
    text += `  수업 방법: ${methodLabels[w.method] || w.method}\n`;
    if (w.note) text += `  비고: ${w.note}\n`;
    text += `\n`;
  });

  downloadAsText(text, `강의계획서_${courseName}_${new Date().toISOString().slice(0, 10)}.txt`);
  showToast('강의계획서가 다운로드되었습니다.', 'success');
}
