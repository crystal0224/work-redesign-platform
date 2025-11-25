#!/usr/bin/env ts-node

/**
 * personas-v3.ts의 30명 페르소나를 Slidev 프레젠테이션으로 변환
 * 각 페르소나를 2열 레이아웃 슬라이드로 생성
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Persona 인터페이스 정의
interface Persona {
  id: string;
  name: string;
  age: number;
  company: string;
  department: string;
  role: string;
  category: string;
  leaderProfile: {
    yearsInRole: number;
    previousRole: string;
    promotionReason: string;
    leadershipStyle: string;
  };
  team: {
    size: number;
    seniorCount: number;
    juniorCount: number;
    composition: string;
    digitalMaturity: string;
    maturityDistribution: string;
  };
  work: {
    mainTasks: string[];
    dailyWorkflow: string;
    weeklyRoutine: string;
    collaboration: string;
    toolsUsed: string[];
    painPoints: string[];
    automationNeeds: string[];
    workStructure: {
      level: string;
      description: string;
    };
  };
  expectedBehavior: {
    initialAttitude: string;
    concerns: string[];
    dropoutRisk: number;
  };
  personality: {
    patience: number;
    techSavvy: number;
    changeResistance: string;
    learningSpeed: string;
  };
}

// 디지털 성숙도에 따른 색상 배지
function getMaturityBadge(maturity: string): string {
  const badges = {
    'Beginner': '🟢',
    'Intermediate': '🟡',
    'Advanced': '🟠',
    'Expert': '🔴'
  };
  return badges[maturity] || '⚪';
}

// 태도에 따른 이모지
function getAttitudeEmoji(attitude: string): string {
  const emojis = {
    '기대함': '😊',
    '중립': '😐',
    '걱정': '😟',
    '회의적': '🤔'
  };
  return emojis[attitude] || '';
}

// 위험도에 따른 색상
function getRiskColor(risk: number): string {
  if (risk <= 10) return '🟢';
  if (risk <= 30) return '🟡';
  if (risk <= 50) return '🟠';
  return '🔴';
}

// 페르소나를 슬라이드로 변환
function personaToSlide(persona: Persona): string {
  return `---
layout: two-cols
class: px-4
---

# ${persona.id}: ${persona.name}

<div class="mt-4">

## 🏢 기본 정보
- **회사**: ${persona.company}
- **부서**: ${persona.department}
- **역할**: ${persona.role}
- **나이**: ${persona.age}세
- **카테고리**: ${persona.category}

## 👔 리더십 프로필
- **팀장 경력**: ${persona.leaderProfile.yearsInRole}년
- **이전 역할**: ${persona.leaderProfile.previousRole}
- **승진 배경**:
  <div class="text-sm mt-1 ml-2">${persona.leaderProfile.promotionReason}</div>

## 👥 팀 구성 (${persona.team.size}명)
- **시니어/주니어**: ${persona.team.seniorCount}명 / ${persona.team.juniorCount}명
- **디지털 성숙도**: ${getMaturityBadge(persona.team.digitalMaturity)} ${persona.team.digitalMaturity}
- **구성원**: ${persona.team.composition}

</div>

::right::

<div class="mt-12">

## 💼 주요 업무
${persona.work.mainTasks.map(task => `- ${task}`).join('\n')}

## 😰 Pain Points
${persona.work.painPoints.slice(0, 3).map(pain => `- ${pain}`).join('\n')}

## 🤖 자동화 니즈
${persona.work.automationNeeds.slice(0, 3).map(need => `- ${need}`).join('\n')}

## 📊 워크샵 예상 반응
- **초기 태도**: ${getAttitudeEmoji(persona.expectedBehavior.initialAttitude)} ${persona.expectedBehavior.initialAttitude}
- **이탈 위험도**: ${getRiskColor(persona.expectedBehavior.dropoutRisk)} ${persona.expectedBehavior.dropoutRisk}%
- **주요 우려**:
  <div class="text-sm mt-1">${persona.expectedBehavior.concerns[0]}</div>

## 🎯 개인 특성
<div class="grid grid-cols-2 gap-2 text-sm">
  <div>인내심: ${'⭐'.repeat(Math.round(persona.personality.patience/2))}</div>
  <div>기술 친화도: ${'⭐'.repeat(Math.round(persona.personality.techSavvy/2))}</div>
  <div>변화 저항: ${persona.personality.changeResistance}</div>
  <div>학습 속도: ${persona.personality.learningSpeed}</div>
</div>

</div>

`;
}

// 타이틀 슬라이드
function generateTitleSlide(): string {
  return `---
theme: seriph
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## SK그룹 워크샵 파일럿 테스트
  30명 팀장 페르소나 프로파일
drawings:
  persist: false
transition: slide-left
title: 워크샵 파일럿 페르소나
mdc: true
---

# 워크샵 파일럿 테스트
## 30명 팀장 페르소나 프로파일

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    시작하기 <carbon:arrow-right class="inline"/>
  </span>
</div>

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

`;
}

// 카테고리별 요약 슬라이드
function generateCategorySummarySlide(personas: Persona[]): string {
  const categories = {};
  personas.forEach(p => {
    if (!categories[p.category]) {
      categories[p.category] = [];
    }
    categories[p.category].push(p);
  });

  return `---
layout: center
---

# 📊 카테고리별 분포

<div class="grid grid-cols-4 gap-4 mt-8">
${Object.entries(categories).map(([category, ps]: [string, Persona[]]) => `
  <div class="text-center p-4 border rounded-lg">
    <div class="text-2xl font-bold">${category}</div>
    <div class="text-4xl mt-2">${ps.length}</div>
    <div class="text-sm text-gray-500">명</div>
  </div>
`).join('')}
</div>

## 디지털 성숙도 분포

<div class="mt-6 flex justify-center gap-8">
  <div>🟢 Beginner: ${personas.filter(p => p.team.digitalMaturity === 'Beginner').length}명</div>
  <div>🟡 Intermediate: ${personas.filter(p => p.team.digitalMaturity === 'Intermediate').length}명</div>
  <div>🟠 Advanced: ${personas.filter(p => p.team.digitalMaturity === 'Advanced').length}명</div>
  <div>🔴 Expert: ${personas.filter(p => p.team.digitalMaturity === 'Expert').length}명</div>
</div>

`;
}

// 상세 페르소나 슬라이드 (추가 정보)
function generateDetailSlide(persona: Persona): string {
  return `---
layout: default
---

# ${persona.id} 상세 정보

<div class="grid grid-cols-2 gap-6 text-sm">

<div>

## 🕐 일일 워크플로우
<div class="bg-gray-100 p-3 rounded mt-2">
${persona.work.dailyWorkflow}
</div>

## 📅 주간 루틴
<div class="bg-gray-100 p-3 rounded mt-2">
${persona.work.weeklyRoutine}
</div>

</div>

<div>

## 🤝 협업 방식
<div class="bg-gray-100 p-3 rounded mt-2">
${persona.work.collaboration}
</div>

## 🛠️ 사용 도구
<div class="flex flex-wrap gap-2 mt-2">
${persona.work.toolsUsed.map(tool => `<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${tool}</span>`).join('\n')}
</div>

## 📋 업무 구조화 수준
- **레벨**: ${persona.work.workStructure.level}
- **설명**: ${persona.work.workStructure.description}

</div>

</div>

`;
}

// 메인 실행 함수
async function generatePresentation() {
  try {
    console.log('📚 페르소나 데이터 로딩 중...');

    // personas-v3.ts 파일 읽기 및 파싱
    const filePath = join(__dirname, 'personas-v3.ts');
    const fileContent = readFileSync(filePath, 'utf-8');

    // PERSONAS_V3 배열 추출 (간단한 방법)
    const personasStart = fileContent.indexOf('export const PERSONAS_V3: Persona[] = [');
    const personasEnd = fileContent.lastIndexOf('];');
    const personasArrayStr = fileContent.substring(
      personasStart + 'export const PERSONAS_V3: Persona[] = '.length,
      personasEnd + 1
    );

    // eval을 피하고 안전하게 파싱하기 위해 임시 파일 사용
    const tempFilePath = join(__dirname, 'temp-personas.js');
    writeFileSync(tempFilePath, `module.exports = ${personasArrayStr}`);
    const personas: Persona[] = require(tempFilePath);

    console.log(`✅ ${personas.length}명의 페르소나 로드 완료`);

    // Slidev 프레젠테이션 생성
    let presentation = '';

    // 1. 타이틀 슬라이드
    presentation += generateTitleSlide();

    // 2. 요약 슬라이드
    presentation += generateCategorySummarySlide(personas);

    // 3. 각 페르소나별 슬라이드
    personas.forEach((persona, index) => {
      // 카테고리 구분 슬라이드
      if (index === 0 || personas[index - 1].category !== persona.category) {
        presentation += `
---
layout: center
class: text-center
---

# ${persona.category} 부서

<div class="text-2xl text-gray-600 mt-4">
${personas.filter(p => p.category === persona.category).length}명의 팀장
</div>

`;
      }

      // 개인 프로파일 슬라이드
      presentation += personaToSlide(persona);

      // 상세 정보 슬라이드 (선택적)
      if (persona.work.dailyWorkflow && persona.work.weeklyRoutine) {
        presentation += generateDetailSlide(persona);
      }
    });

    // 마지막 슬라이드
    presentation += `
---
layout: center
class: text-center
---

# 감사합니다

<div class="text-xl text-gray-600 mt-8">
SK그룹 워크샵 파일럿 테스트<br>
30명 팀장 페르소나 프로파일
</div>

<div class="mt-12 text-sm text-gray-400">
Generated on ${new Date().toLocaleDateString('ko-KR')}
</div>
`;

    // 파일 저장
    const outputPath = join(__dirname, 'personas-presentation.md');
    writeFileSync(outputPath, presentation);

    console.log(`\n✅ 프레젠테이션 생성 완료: ${outputPath}`);
    console.log(`📊 총 슬라이드 수: 약 ${personas.length * 2 + 10}장`);

    // 정리
    const fs = require('fs');
    fs.unlinkSync(tempFilePath);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 실행
generatePresentation();