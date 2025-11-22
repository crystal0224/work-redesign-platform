import { expandedPersonas, WORKSHOP_STAGES, simulateStage } from './sk-expanded-personas';
import * as fs from 'fs';
import * as path from 'path';

async function runGroup6() {
  const group = expandedPersonas.slice(25, 30);
  const results = [];

  for (const persona of group) {
    console.log(`시뮬레이션: ${persona.name} (${persona.company})`);
    const experiences = [];

    for (const stage of WORKSHOP_STAGES) {
      const exp = await simulateStage(persona, stage);
      experiences.push(exp);
      await new Promise(r => setTimeout(r, 500));
    }

    results.push({ persona, experiences });
  }

  const outputPath = path.join('/Users/crystal/Desktop/new/1-Projects/Work Redesign', 'group6_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log('그룹 6 완료');
}

runGroup6();
