#!/usr/bin/env ts-node

/**
 * 단일 그룹 테스트 스크립트
 * Group 1만 실행하여 시스템 검증
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { runGroupSimulation } from './group-simulations/run-group-simulation';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const testPersonas = [
  { id: 'P001', name: '김지훈', department: 'Marketing', teamSize: 8, digitalMaturity: 'Advanced' },
  { id: 'P002', name: '이서연', department: 'Sales', teamSize: 12, digitalMaturity: 'Intermediate' },
  { id: 'P003', name: '박민수', department: 'Marketing', teamSize: 5, digitalMaturity: 'Beginner' },
  { id: 'P004', name: '최유진', department: 'Sales', teamSize: 15, digitalMaturity: 'Advanced' },
  { id: 'P005', name: '정도현', department: 'Marketing', teamSize: 7, digitalMaturity: 'Expert' }
];

console.log('🧪 Testing single group simulation...');
console.log(`📋 Group: Marketing & Sales Leaders`);
console.log(`👥 Personas: ${testPersonas.length}`);
console.log('\n⏱️  Estimated time: ~10-15 minutes for 5 personas');
console.log('⚡ Each persona goes through 11 workshop stages\n');

runGroupSimulation('group1', 'Marketing & Sales Leaders', testPersonas)
  .then(() => {
    console.log('\n✅ Test simulation completed successfully!');
    console.log('📁 Results saved in: outputs/parallel-simulations/group1/');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test simulation failed:', error);
    process.exit(1);
  });