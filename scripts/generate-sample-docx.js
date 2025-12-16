/**
 * Generate Sample Word Document for Demo
 *
 * This script creates a comprehensive sample .docx file with realistic
 * work description content for the demo - multiple departments, 15+ tasks.
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType } = require('docx');
const fs = require('fs');
const path = require('path');

function createTaskRow(name, freq, time, desc) {
  return new TableRow({
    children: [
      new TableCell({ children: [new Paragraph(name)] }),
      new TableCell({ children: [new Paragraph(freq)] }),
      new TableCell({ children: [new Paragraph(time)] }),
      new TableCell({ children: [new Paragraph(desc)] }),
    ],
  });
}

function createHeaderRow() {
  return new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ text: '업무명', style: 'Strong' })], shading: { fill: 'E0E0E0' } }),
      new TableCell({ children: [new Paragraph({ text: '빈도', style: 'Strong' })], shading: { fill: 'E0E0E0' } }),
      new TableCell({ children: [new Paragraph({ text: '소요시간', style: 'Strong' })], shading: { fill: 'E0E0E0' } }),
      new TableCell({ children: [new Paragraph({ text: '상세 설명', style: 'Strong' })], shading: { fill: 'E0E0E0' } }),
    ],
  });
}

async function generateSampleDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ===== TITLE =====
          new Paragraph({ text: '업무 재설계 워크숍', heading: HeadingLevel.TITLE }),
          new Paragraph({ text: '종합 업무 분석 보고서', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),

          // ===== EXECUTIVE SUMMARY =====
          new Paragraph({ text: '1. 개요', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            children: [
              new TextRun('본 문서는 SK그룹 디지털 마케팅본부 산하 3개 팀(마케팅기획팀, 콘텐츠전략팀, 고객경험팀)의 주요 반복 업무를 종합 분석한 자료입니다. '),
              new TextRun('각 업무별 수행 빈도, 소요 시간, 담당자, 현재 사용 도구를 상세히 기술하고, AI 및 자동화 도구를 활용한 업무 재설계 방안을 제시합니다.'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '분석 기간: ', bold: true }),
              new TextRun('2025년 10월 1일 ~ 2025년 11월 30일 (2개월)'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '분석 대상: ', bold: true }),
              new TextRun('총 42명 (팀장 3명, 팀원 39명)'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '분석 방법: ', bold: true }),
              new TextRun('업무 일지 분석, 1:1 인터뷰, 설문조사, 시스템 로그 분석'),
            ],
          }),
          new Paragraph({ text: '' }),

          // ===== DEPARTMENT 1: 마케팅기획팀 =====
          new Paragraph({ text: '2. 마케팅기획팀 업무 분석', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '팀 현황: ', bold: true }),
              new TextRun('팀장 1명, 팀원 12명 / 주요 업무: 마케팅 전략 수립, 캠페인 기획, 예산 관리, 성과 분석'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '2.1 주요 반복 업무 목록', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createHeaderRow(),
              createTaskRow('광고 성과 리포트 작성', '주 1회', '4시간',
                'Google Ads, Meta Ads, 네이버 검색광고, 카카오모먼트 등 4개 플랫폼의 광고 데이터를 수집하여 통합 성과 리포트를 작성합니다. 각 플랫폼에서 CSV를 다운로드하고, Excel에서 데이터를 정제한 후 PowerPoint 템플릿에 주요 지표(CTR, CPC, ROAS, 전환율)를 입력합니다. 이 과정에서 데이터 수집에 약 1.5시간, 정제에 1시간, 시각화 및 보고서 작성에 1.5시간이 소요됩니다.'),
              createTaskRow('캠페인 예산 조정', '주 2회', '2시간',
                '실시간 광고 성과를 모니터링하여 예산 재배분이 필요한 캠페인을 식별합니다. 성과가 좋은 캠페인에 추가 예산을 배정하고, 저조한 캠페인은 예산을 축소하거나 일시 중지합니다. 각 플랫폼의 관리자 대시보드에 접속하여 수동으로 예산을 조정해야 하며, 변경 이력을 별도 스프레드시트에 기록합니다.'),
              createTaskRow('경쟁사 동향 분석', '주 1회', '3시간',
                '주요 경쟁사 5개 브랜드의 마케팅 활동을 모니터링합니다. SNS 계정(인스타그램, 페이스북, 유튜브), 공식 웹사이트, 뉴스 기사, 광고 라이브러리를 확인하여 신규 캠페인, 프로모션, 가격 변동 등을 파악합니다. 수집된 정보는 주간 경쟁사 동향 보고서로 정리하여 팀 내 공유합니다.'),
              createTaskRow('마케팅 캘린더 관리', '매일', '1시간',
                'Google Calendar와 Notion에서 마케팅 일정을 관리합니다. 신규 캠페인 일정 등록, 마감일 알림 설정, 관련 부서와의 일정 조율을 담당합니다. 매주 월요일에는 주간 마케팅 일정 브리핑 자료를 준비합니다.'),
              createTaskRow('월간 마케팅 성과 보고서', '월 1회', '8시간',
                '전월 마케팅 활동의 전체 성과를 분석하여 경영진 보고용 월간 보고서를 작성합니다. 채널별 성과, 캠페인별 ROI, 목표 대비 달성률, 개선 제안 등을 포함합니다. 데이터 수집 및 분석에 4시간, 보고서 작성 및 시각화에 4시간이 소요됩니다.'),
            ],
          }),
          new Paragraph({ text: '' }),

          // ===== DEPARTMENT 2: 콘텐츠전략팀 =====
          new Paragraph({ text: '3. 콘텐츠전략팀 업무 분석', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '팀 현황: ', bold: true }),
              new TextRun('팀장 1명, 팀원 15명 / 주요 업무: 콘텐츠 기획, SNS 운영, 영상 제작, 인플루언서 협업'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '3.1 주요 반복 업무 목록', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createHeaderRow(),
              createTaskRow('SNS 콘텐츠 발행 및 관리', '매일', '2시간',
                '인스타그램, 페이스북, 틱톡, 유튜브 쇼츠 등 4개 채널에 콘텐츠를 발행합니다. 카드뉴스, 릴스, 스토리 등 다양한 포맷의 콘텐츠를 제작하고 예약 발행을 설정합니다. 발행 후에는 초기 반응(좋아요, 댓글, 공유)을 모니터링하고 댓글에 응대합니다.'),
              createTaskRow('콘텐츠 성과 분석', '주 1회', '2시간',
                '각 SNS 플랫폼의 인사이트 데이터를 수집하여 콘텐츠별 성과를 분석합니다. 도달률, 참여율, 저장 수, 공유 수 등을 비교하여 고성과 콘텐츠 유형을 파악합니다. 분석 결과는 주간 콘텐츠 성과 리포트로 정리합니다.'),
              createTaskRow('인플루언서 섭외 및 관리', '주 2회', '3시간',
                '브랜드 캠페인에 적합한 인플루언서를 발굴하고 협업을 제안합니다. 팔로워 수, 참여율, 콘텐츠 스타일, 과거 협업 이력 등을 검토하여 후보 리스트를 작성합니다. 선정된 인플루언서와는 계약 조건을 협의하고, 콘텐츠 가이드라인을 전달하며, 결과물을 검수합니다.'),
              createTaskRow('트렌드 리서치', '주 1회', '2시간',
                '최신 마케팅 트렌드, 바이럴 콘텐츠, 밈(Meme), 해시태그 동향을 조사합니다. 틱톡 트렌드, 인스타그램 릴스 인기 영상, 트위터 실시간 트렌드 등을 분석하여 콘텐츠 기획에 활용합니다. 조사 결과는 팀 내 Slack 채널에 공유합니다.'),
              createTaskRow('UGC(사용자 생성 콘텐츠) 수집', '매일', '1시간',
                '브랜드 해시태그를 모니터링하여 고객이 자발적으로 생성한 콘텐츠를 수집합니다. 우수 UGC는 브랜드 공식 계정에 리그램하거나 고객에게 감사 메시지를 전달합니다. 수집된 UGC는 Notion 데이터베이스에 정리하여 향후 캠페인에 활용합니다.'),
            ],
          }),
          new Paragraph({ text: '' }),

          // ===== DEPARTMENT 3: 고객경험팀 =====
          new Paragraph({ text: '4. 고객경험팀 업무 분석', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '팀 현황: ', bold: true }),
              new TextRun('팀장 1명, 팀원 12명 / 주요 업무: 고객 문의 응대, VOC 분석, CRM 운영, 고객 설문 관리'),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '4.1 주요 반복 업무 목록', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createHeaderRow(),
              createTaskRow('고객 문의 응대', '매일', '4시간',
                '카카오톡 채널, 이메일, 전화로 들어오는 고객 문의에 응대합니다. 제품 문의, 배송 조회, 교환/반품 요청, 불만 접수 등 다양한 유형의 문의를 처리합니다. 자주 묻는 질문은 템플릿 답변을 활용하고, 복잡한 문의는 담당 부서에 전달합니다. 모든 문의 내역은 CRM 시스템에 기록합니다.'),
              createTaskRow('VOC(고객의 소리) 분석', '주 1회', '3시간',
                '전주 접수된 모든 고객 문의와 불만을 분류하고 분석합니다. 문의 유형별 건수, 불만 사유별 분포, 반복되는 이슈 등을 파악합니다. 분석 결과는 주간 VOC 리포트로 정리하여 관련 부서에 공유하고, 개선이 필요한 사항은 이슈 트래커에 등록합니다.'),
              createTaskRow('고객 만족도 설문 관리', '월 1회', '4시간',
                '월간 고객 만족도 설문을 발송하고 결과를 분석합니다. NPS(순추천지수), CSAT(고객만족도) 점수를 산출하고, 개방형 응답을 주제별로 분류합니다. 설문 결과 리포트를 작성하여 경영진에게 보고하고, 낮은 만족도 원인에 대한 개선 방안을 제안합니다.'),
              createTaskRow('CRM 데이터 정제', '주 1회', '2시간',
                'CRM 시스템의 고객 데이터를 정리하고 업데이트합니다. 중복 데이터 제거, 연락처 오류 수정, 비활성 고객 분류, 세그먼트 재설정 등을 수행합니다. 정확한 고객 데이터를 유지하여 마케팅 캠페인의 효과를 높입니다.'),
              createTaskRow('이탈 고객 분석 및 리텐션 캠페인', '월 1회', '5시간',
                '최근 3개월 이내 구매 이력이 없는 이탈 위험 고객을 추출하고 분석합니다. 이탈 원인을 파악하기 위해 과거 구매 패턴, 문의 이력, 설문 응답 등을 검토합니다. 분석 결과를 바탕으로 맞춤형 리텐션 이메일 또는 쿠폰 캠페인을 기획하고 실행합니다.'),
            ],
          }),
          new Paragraph({ text: '' }),

          // ===== AUTOMATION RECOMMENDATIONS =====
          new Paragraph({ text: '5. 자동화 추천 업무', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun('위 분석 결과를 바탕으로, 다음 업무들은 AI 및 자동화 도구를 활용하여 업무 시간을 크게 절감할 수 있을 것으로 판단됩니다:'),
            ],
          }),
          new Paragraph({ text: '' }),

          new Paragraph({ text: '5.1 높은 자동화 가능성 (High)', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '• 광고 성과 리포트 작성: API 연동을 통한 데이터 자동 수집 및 대시보드 구축으로 주당 3시간 절감 예상' }),
          new Paragraph({ text: '• 경쟁사 동향 분석: 웹 스크래핑 및 AI 요약 도구 활용으로 주당 2시간 절감 예상' }),
          new Paragraph({ text: '• 고객 문의 응대: AI 챗봇 도입으로 표준 문의의 70% 자동 응대, 일당 2.5시간 절감 예상' }),
          new Paragraph({ text: '• VOC 분석: 텍스트 분류 AI를 활용한 자동 분류 및 감성 분석으로 주당 2시간 절감 예상' }),
          new Paragraph({ text: '' }),

          new Paragraph({ text: '5.2 중간 자동화 가능성 (Medium)', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '• 캠페인 예산 조정: 규칙 기반 자동화로 일부 의사결정 자동화 가능' }),
          new Paragraph({ text: '• 콘텐츠 성과 분석: 자동 리포팅 도구로 데이터 수집 자동화 가능' }),
          new Paragraph({ text: '• 트렌드 리서치: AI 기반 트렌드 모니터링 도구 활용 가능' }),
          new Paragraph({ text: '• CRM 데이터 정제: 자동 중복 제거 및 데이터 검증 도구 활용 가능' }),
          new Paragraph({ text: '' }),

          // ===== EXPECTED BENEFITS =====
          new Paragraph({ text: '6. 기대 효과', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: '월간 절감 시간 예상: ', bold: true }),
              new TextRun('약 80~100시간 (3개 팀 합산)'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '연간 비용 절감 예상: ', bold: true }),
              new TextRun('약 4,800만원 (인건비 기준)'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '업무 품질 향상: ', bold: true }),
              new TextRun('인적 오류 감소, 데이터 정확성 향상, 의사결정 속도 개선'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '직원 만족도: ', bold: true }),
              new TextRun('반복적인 단순 업무 감소로 창의적 업무에 집중 가능'),
            ],
          }),
          new Paragraph({ text: '' }),

          // ===== NEXT STEPS =====
          new Paragraph({ text: '7. 향후 추진 계획', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '1단계 (1~2개월): 광고 성과 리포트 자동화 파일럿 진행' }),
          new Paragraph({ text: '2단계 (3~4개월): AI 챗봇 도입 및 VOC 자동 분류 시스템 구축' }),
          new Paragraph({ text: '3단계 (5~6개월): 전사 확대 적용 및 효과 측정' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // ===== FOOTER =====
          new Paragraph({
            children: [
              new TextRun({ text: '작성일: ', bold: true }),
              new TextRun('2025년 12월 15일'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '작성자: ', bold: true }),
              new TextRun('디지털 마케팅본부 업무혁신TF'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '검토자: ', bold: true }),
              new TextRun('김철수 본부장, 이영희 팀장, 박민수 팀장, 정수진 팀장'),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '문서 버전: ', bold: true }),
              new TextRun('v2.1 (Final)'),
            ],
          }),
        ],
      },
    ],
  });

  // Pack and save the document
  const outputPath = path.join(__dirname, '..', 'demo', 'sample-work-description.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ 샘플 Word 문서가 생성되었습니다: ${outputPath}`);
  return outputPath;
}

generateSampleDocx().catch(console.error);
