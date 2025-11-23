import * as fs from 'fs';
import * as path from 'path';

/**
 * Type definitions for persona simulation data structure
 */

interface PersonaData {
  id: string;
  name: string;
  jobFunction: string;
  digitalMaturity: string;
  age: number;
  background: string;
  painPoints: string[];
  expectations: string[];
  concerns: string[];
}

interface SimulationResult {
  persona: PersonaData;
  timestamp: string;
  error?: string;
  response?: unknown;
}

interface AnalysisByJobFunction {
  [key: string]: {
    count: number;
    personas: PersonaData[];
    painPoints: string[];
    expectations: string[];
    concerns: string[];
    maturityBreakdown: { [key: string]: number };
  };
}

interface AnalysisByMaturity {
  [key: string]: {
    count: number;
    personas: PersonaData[];
    jobFunctions: { [key: string]: number };
    painPoints: string[];
    expectations: string[];
    concerns: string[];
  };
}

interface IssuePattern {
  text: string;
  frequency: number;
  affectedPersonas: string[];
}

interface AnalysisReport {
  timestamp: string;
  totalPersonas: number;
  successRate: number;
  byJobFunction: AnalysisByJobFunction;
  byMaturity: AnalysisByMaturity;
  commonIssues: IssuePattern[];
  commonExpectations: IssuePattern[];
  commonConcerns: IssuePattern[];
  topCriticalIssues: IssuePattern[];
  topQuickWins: IssuePattern[];
}

/**
 * Loads and parses the simulation results JSON file
 * @param filePath - Path to the JSON file
 * @returns Array of simulation results
 */
function loadSimulationResults(filePath: string): SimulationResult[] {
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const results = JSON.parse(rawData) as SimulationResult[];
    console.log(`✓ Loaded ${results.length} simulation results`);
    return results;
  } catch (error) {
    console.error(`✗ Failed to load simulation results: ${error}`);
    throw error;
  }
}

/**
 * Groups personas by job function and extracts patterns
 * @param results - Array of simulation results
 * @returns Analysis grouped by job function
 */
function analyzeByJobFunction(results: SimulationResult[]): AnalysisByJobFunction {
  const analysis: AnalysisByJobFunction = {};

  results.forEach((result) => {
    const { jobFunction, digitalMaturity } = result.persona;

    if (!analysis[jobFunction]) {
      analysis[jobFunction] = {
        count: 0,
        personas: [],
        painPoints: [],
        expectations: [],
        concerns: [],
        maturityBreakdown: {},
      };
    }

    analysis[jobFunction].count++;
    analysis[jobFunction].personas.push(result.persona);
    analysis[jobFunction].painPoints.push(...result.persona.painPoints);
    analysis[jobFunction].expectations.push(...result.persona.expectations);
    analysis[jobFunction].concerns.push(...result.persona.concerns);

    if (!analysis[jobFunction].maturityBreakdown[digitalMaturity]) {
      analysis[jobFunction].maturityBreakdown[digitalMaturity] = 0;
    }
    analysis[jobFunction].maturityBreakdown[digitalMaturity]++;
  });

  return analysis;
}

/**
 * Groups personas by digital maturity level and extracts patterns
 * @param results - Array of simulation results
 * @returns Analysis grouped by digital maturity
 */
function analyzeByMaturity(results: SimulationResult[]): AnalysisByMaturity {
  const analysis: AnalysisByMaturity = {};

  results.forEach((result) => {
    const { digitalMaturity, jobFunction } = result.persona;

    if (!analysis[digitalMaturity]) {
      analysis[digitalMaturity] = {
        count: 0,
        personas: [],
        jobFunctions: {},
        painPoints: [],
        expectations: [],
        concerns: [],
      };
    }

    analysis[digitalMaturity].count++;
    analysis[digitalMaturity].personas.push(result.persona);
    analysis[digitalMaturity].painPoints.push(...result.persona.painPoints);
    analysis[digitalMaturity].expectations.push(...result.persona.expectations);
    analysis[digitalMaturity].concerns.push(...result.persona.concerns);

    if (!analysis[digitalMaturity].jobFunctions[jobFunction]) {
      analysis[digitalMaturity].jobFunctions[jobFunction] = 0;
    }
    analysis[digitalMaturity].jobFunctions[jobFunction]++;
  });

  return analysis;
}

/**
 * Extracts common patterns from a list of strings
 * @param items - Array of strings to analyze
 * @param threshold - Minimum frequency to be considered a pattern
 * @returns Array of patterns sorted by frequency
 */
function extractPatterns(items: string[], threshold: number = 1): IssuePattern[] {
  const patterns: { [key: string]: IssuePattern } = {};

  items.forEach((item) => {
    if (!patterns[item]) {
      patterns[item] = {
        text: item,
        frequency: 0,
        affectedPersonas: [],
      };
    }
    patterns[item].frequency++;
  });

  return Object.values(patterns)
    .filter((pattern) => pattern.frequency >= threshold)
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Identifies critical issues from pain points and concerns
 * Critical issues are those affecting multiple personas across different job functions
 * @param analysis - Analysis by job function
 * @param results - Original simulation results
 * @returns Top critical issues
 */
function identifyCriticalIssues(
  analysis: AnalysisByJobFunction,
  results: SimulationResult[]
): IssuePattern[] {
  const allPainPoints = results.flatMap((r) => r.persona.painPoints);
  const allConcerns = results.flatMap((r) => r.persona.concerns);
  const criticalItems = [...allPainPoints, ...allConcerns];

  const issueFrequency: { [key: string]: { frequency: number; personas: Set<string> } } = {};

  results.forEach((result) => {
    const { painPoints, concerns, id, name } = result.persona;
    const personaLabel = `${name}(${id})`;

    [...painPoints, ...concerns].forEach((item) => {
      if (!issueFrequency[item]) {
        issueFrequency[item] = { frequency: 0, personas: new Set() };
      }
      issueFrequency[item].frequency++;
      issueFrequency[item].personas.add(personaLabel);
    });
  });

  const criticalIssues = Object.entries(issueFrequency)
    .map(([text, data]) => ({
      text,
      frequency: data.frequency,
      affectedPersonas: Array.from(data.personas),
    }))
    .filter((issue) => issue.frequency >= 2) // At least 2 personas affected
    .sort((a, b) => b.frequency - a.frequency);

  return criticalIssues;
}

/**
 * Identifies quick wins - expectations that are commonly mentioned and achievable
 * Quick wins are expectations that are frequently mentioned and actionable
 * @param analysis - Analysis by job function
 * @param results - Original simulation results
 * @returns Top quick wins
 */
function identifyQuickWins(
  analysis: AnalysisByJobFunction,
  results: SimulationResult[]
): IssuePattern[] {
  const expectationFrequency: { [key: string]: { frequency: number; personas: Set<string> } } = {};

  results.forEach((result) => {
    const { expectations, id, name } = result.persona;
    const personaLabel = `${name}(${id})`;

    expectations.forEach((item) => {
      if (!expectationFrequency[item]) {
        expectationFrequency[item] = { frequency: 0, personas: new Set() };
      }
      expectationFrequency[item].frequency++;
      expectationFrequency[item].personas.add(personaLabel);
    });
  });

  // Quick wins: high frequency expectations (3+ personas) AND actionable
  const quickWins = Object.entries(expectationFrequency)
    .map(([text, data]) => ({
      text,
      frequency: data.frequency,
      affectedPersonas: Array.from(data.personas),
    }))
    .filter((win) => win.frequency >= 2) // Mentioned by at least 2 personas
    .sort((a, b) => b.frequency - a.frequency);

  return quickWins;
}

/**
 * Generates comprehensive analysis report
 * @param results - Array of simulation results
 * @returns Complete analysis report
 */
function generateAnalysisReport(results: SimulationResult[]): AnalysisReport {
  const successfulResults = results.filter((r) => !r.error);
  const successRate = (successfulResults.length / results.length) * 100;

  const byJobFunction = analyzeByJobFunction(results);
  const byMaturity = analyzeByMaturity(results);

  // Extract common patterns
  const allPainPoints = results.flatMap((r) => r.persona.painPoints);
  const allExpectations = results.flatMap((r) => r.persona.expectations);
  const allConcerns = results.flatMap((r) => r.persona.concerns);

  const commonIssues = extractPatterns(allPainPoints, 1);
  const commonExpectations = extractPatterns(allExpectations, 1);
  const commonConcerns = extractPatterns(allConcerns, 1);

  // Identify top issues and quick wins
  const topCriticalIssues = identifyCriticalIssues(byJobFunction, results).slice(0, 5);
  const topQuickWins = identifyQuickWins(byJobFunction, results).slice(0, 5);

  return {
    timestamp: new Date().toISOString(),
    totalPersonas: results.length,
    successRate,
    byJobFunction,
    byMaturity,
    commonIssues,
    commonExpectations,
    commonConcerns,
    topCriticalIssues,
    topQuickWins,
  };
}

/**
 * Generates markdown report from analysis
 * @param report - Analysis report
 * @returns Markdown formatted report
 */
function generateMarkdownReport(report: AnalysisReport): string {
  let markdown = '';

  // Header
  markdown += `# Persona Simulation Analysis Report\n\n`;
  markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString('ko-KR')}\n\n`;

  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `- **Total Personas Analyzed:** ${report.totalPersonas}\n`;
  markdown += `- **Success Rate:** ${report.successRate.toFixed(1)}%\n`;
  markdown += `- **Job Functions:** ${Object.keys(report.byJobFunction).join(', ')}\n`;
  markdown += `- **Digital Maturity Levels:** ${Object.keys(report.byMaturity).join(', ')}\n\n`;

  // Key Findings by Job Function
  markdown += `## Key Findings by Job Function\n\n`;
  Object.entries(report.byJobFunction).forEach(([jobFunc, data]) => {
    markdown += `### ${jobFunc}\n\n`;
    markdown += `- **Number of Personas:** ${data.count}\n`;
    markdown += `- **Digital Maturity Breakdown:**\n`;
    Object.entries(data.maturityBreakdown).forEach(([maturity, count]) => {
      markdown += `  - ${maturity}: ${count}\n`;
    });
    markdown += `\n**Representative Personas:**\n`;
    data.personas.forEach((p) => {
      markdown += `- ${p.name} (${p.digitalMaturity}, ${p.age}세) - ${p.background}\n`;
    });
    markdown += `\n`;
  });

  // Key Findings by Digital Maturity
  markdown += `## Key Findings by Digital Maturity Level\n\n`;
  Object.entries(report.byMaturity).forEach(([maturity, data]) => {
    markdown += `### ${maturity}\n\n`;
    markdown += `- **Number of Personas:** ${data.count}\n`;
    markdown += `- **Job Function Distribution:**\n`;
    Object.entries(data.jobFunctions).forEach(([jobFunc, count]) => {
      markdown += `  - ${jobFunc}: ${count}\n`;
    });
    markdown += `\n`;
  });

  // Common Pain Points and Issues
  markdown += `## Common Pain Points\n\n`;
  markdown += `### Top Issues by Frequency\n\n`;
  report.commonIssues.slice(0, 10).forEach((issue, index) => {
    markdown += `${index + 1}. **[${issue.frequency} personas]** ${issue.text}\n`;
  });
  markdown += `\n`;

  // Common Expectations
  markdown += `## Common Expectations\n\n`;
  markdown += `### What Personas Are Hoping For\n\n`;
  report.commonExpectations.slice(0, 10).forEach((exp, index) => {
    markdown += `${index + 1}. **[${exp.frequency} personas]** ${exp.text}\n`;
  });
  markdown += `\n`;

  // Common Concerns
  markdown += `## Common Concerns\n\n`;
  markdown += `### Potential Blockers and Worries\n\n`;
  report.commonConcerns.slice(0, 10).forEach((concern, index) => {
    markdown += `${index + 1}. **[${concern.frequency} personas]** ${concern.text}\n`;
  });
  markdown += `\n`;

  // Top 5 Critical Issues
  markdown += `## Top 5 Critical Issues\n\n`;
  markdown += `*Critical issues are those affecting multiple personas and requiring attention*\n\n`;
  report.topCriticalIssues.forEach((issue, index) => {
    markdown += `### ${index + 1}. ${issue.text}\n\n`;
    markdown += `- **Affected Personas:** ${issue.frequency}\n`;
    markdown += `- **Details:** ${issue.affectedPersonas.join(', ')}\n\n`;
  });

  // Top 5 Quick Wins
  markdown += `## Top 5 Quick Wins\n\n`;
  markdown += `*Quick wins are high-impact expectations that can be addressed relatively quickly*\n\n`;
  report.topQuickWins.forEach((win, index) => {
    markdown += `### ${index + 1}. ${win.text}\n\n`;
    markdown += `- **Requested by Personas:** ${win.frequency}\n`;
    markdown += `- **Details:** ${win.affectedPersonas.join(', ')}\n\n`;
  });

  // Insights by Job Function
  markdown += `## Detailed Insights by Job Function\n\n`;
  Object.entries(report.byJobFunction).forEach(([jobFunc, data]) => {
    markdown += `### ${jobFunc}\n\n`;

    markdown += `#### Pain Points\n`;
    const painPointPatterns = extractPatterns(data.painPoints);
    painPointPatterns.slice(0, 5).forEach((pp) => {
      markdown += `- ${pp.text}\n`;
    });
    markdown += `\n`;

    markdown += `#### Expectations\n`;
    const expectationPatterns = extractPatterns(data.expectations);
    expectationPatterns.slice(0, 5).forEach((exp) => {
      markdown += `- ${exp.text}\n`;
    });
    markdown += `\n`;

    markdown += `#### Concerns\n`;
    const concernPatterns = extractPatterns(data.concerns);
    concernPatterns.slice(0, 5).forEach((concern) => {
      markdown += `- ${concern.text}\n`;
    });
    markdown += `\n`;
  });

  // Insights by Digital Maturity
  markdown += `## Detailed Insights by Digital Maturity\n\n`;
  Object.entries(report.byMaturity).forEach(([maturity, data]) => {
    markdown += `### ${maturity}\n\n`;

    markdown += `#### Common Pain Points\n`;
    const painPointPatterns = extractPatterns(data.painPoints);
    painPointPatterns.slice(0, 5).forEach((pp) => {
      markdown += `- ${pp.text}\n`;
    });
    markdown += `\n`;

    markdown += `#### Common Expectations\n`;
    const expectationPatterns = extractPatterns(data.expectations);
    expectationPatterns.slice(0, 5).forEach((exp) => {
      markdown += `- ${exp.text}\n`;
    });
    markdown += `\n`;

    markdown += `#### Common Concerns\n`;
    const concernPatterns = extractPatterns(data.concerns);
    concernPatterns.slice(0, 5).forEach((concern) => {
      markdown += `- ${concern.text}\n`;
    });
    markdown += `\n`;
  });

  // Recommendations
  markdown += `## Recommendations\n\n`;
  markdown += `Based on the analysis, we recommend:\n\n`;
  markdown += `1. **Address Critical Issues First**\n`;
  markdown += `   - Focus on the top critical issues that affect multiple personas\n`;
  markdown += `   - Create targeted solutions for each job function\n\n`;
  markdown += `2. **Deliver Quick Wins**\n`;
  markdown += `   - Implement commonly requested features that provide immediate value\n`;
  markdown += `   - Use these to build momentum and trust\n\n`;
  markdown += `3. **Tailor by Digital Maturity**\n`;
  markdown += `   - Provide different levels of guidance for beginners (초보) vs advanced (고급)\n`;
  markdown += `   - Create role-specific onboarding experiences\n\n`;
  markdown += `4. **Proactive Concern Management**\n`;
  markdown += `   - Address security, accuracy, and integration concerns upfront\n`;
  markdown += `   - Provide evidence and case studies\n\n`;

  // Methodology note
  markdown += `---\n\n`;
  markdown += `## Analysis Methodology\n\n`;
  markdown += `This report was generated through automated analysis of persona simulation data:\n`;
  markdown += `- Frequency analysis of pain points, expectations, and concerns\n`;
  markdown += `- Cross-functional pattern recognition\n`;
  markdown += `- Digital maturity level segmentation\n`;
  markdown += `- Critical issue identification (affecting 2+ personas)\n`;
  markdown += `- Quick win identification (requested by 2+ personas)\n\n`;

  return markdown;
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    // Define file paths
    const simulationResultsPath = '/Users/crystal/Desktop/new/1-Projects/Work Redesign/페르소나_시뮬레이션_결과.json';
    const outputDir = '/Users/crystal/Desktop/work-redesign-platform/backend/reports';
    const outputPath = path.join(outputDir, 'simulation-analysis-report.md');
    const jsonReportPath = path.join(outputDir, 'simulation-analysis-data.json');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✓ Created output directory: ${outputDir}`);
    }

    // Load simulation results
    console.log(`\n📊 Loading simulation results from: ${simulationResultsPath}`);
    const results = loadSimulationResults(simulationResultsPath);

    // Generate analysis
    console.log('\n🔍 Analyzing simulation results...');
    const report = generateAnalysisReport(results);

    // Save JSON report
    console.log(`\n💾 Saving detailed analysis data...`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`✓ JSON report saved to: ${jsonReportPath}`);

    // Generate and save markdown report
    console.log(`\n📝 Generating markdown report...`);
    const markdownReport = generateMarkdownReport(report);
    fs.writeFileSync(outputPath, markdownReport, 'utf-8');
    console.log(`✓ Markdown report saved to: ${outputPath}`);

    // Print summary to console
    console.log('\n' + '='.repeat(60));
    console.log('ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`\nTotal Personas: ${report.totalPersonas}`);
    console.log(`Success Rate: ${report.successRate.toFixed(1)}%`);
    console.log(`\nJob Functions Represented:`);
    Object.entries(report.byJobFunction).forEach(([func, data]) => {
      console.log(`  - ${func}: ${data.count} personas`);
    });
    console.log(`\nDigital Maturity Levels:`);
    Object.entries(report.byMaturity).forEach(([level, data]) => {
      console.log(`  - ${level}: ${data.count} personas`);
    });

    console.log(`\nTop 3 Critical Issues:`);
    report.topCriticalIssues.slice(0, 3).forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.frequency} personas] ${issue.text}`);
    });

    console.log(`\nTop 3 Quick Wins:`);
    report.topQuickWins.slice(0, 3).forEach((win, i) => {
      console.log(`  ${i + 1}. [${win.frequency} personas] ${win.text}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✓ Analysis complete! Reports generated successfully.');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n✗ Analysis failed:', error);
    process.exit(1);
  }
}

// Execute main function
main();

// Export functions for use as a module
export {
  loadSimulationResults,
  analyzeByJobFunction,
  analyzeByMaturity,
  extractPatterns,
  identifyCriticalIssues,
  identifyQuickWins,
  generateAnalysisReport,
  generateMarkdownReport,
  PersonaData,
  SimulationResult,
  AnalysisByJobFunction,
  AnalysisByMaturity,
  IssuePattern,
  AnalysisReport,
};
