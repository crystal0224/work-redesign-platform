
import { PERSONAS_V3 as personas } from './src/data/personas';

console.log('Total Personas:', personas.length);

let maxStruggleLen = 0;
let maxResistanceLen = 0;
const allStruggles = new Set();
const allResistances = new Set();
const duplicates = [];

personas.forEach(p => {
    if (p.leaderProfile.hiddenStruggles) {
        p.leaderProfile.hiddenStruggles.forEach(s => {
            if (s.length > maxStruggleLen) maxStruggleLen = s.length;
            if (allStruggles.has(s)) duplicates.push(`Struggle: ${s}`);
            allStruggles.add(s);
        });
    }
    if (p.team.resistanceFactors) {
        p.team.resistanceFactors.forEach(r => {
            if (r.length > maxResistanceLen) maxResistanceLen = r.length;
            if (allResistances.has(r)) duplicates.push(`Resistance: ${r}`);
            allResistances.add(r);
        });
    }
});

console.log('Max Hidden Struggle Length:', maxStruggleLen);
console.log('Max Resistance Factor Length:', maxResistanceLen);
console.log('Duplicates:', duplicates);
