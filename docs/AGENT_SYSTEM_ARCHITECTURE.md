# Agent System Architecture
## 5-Phase Workshop Agent Design

---

## Overview

Work Redesign Workshop uses a **5-Agent system**, where each phase is managed by a specialized AI agent with specific expertise and conversation patterns.

```
User Journey:
  Context Interview → State Analysis → Gap Discovery → Automation Planning → Workflow Design
       ↓                  ↓                ↓                 ↓                    ↓
    Agent 1           Agent 2         Agent 3           Agent 4              Agent 5
```

---

## Agent Specifications

### Agent 1: Context Interviewer
- **Role**: Strategic Consultant
- **Expertise**: Mission/goal clarification, stakeholder mapping
- **Tone**: Empathetic, probing, clarifying
- **Duration**: 10 minutes
- **Output**: `context.json`

**Key Behaviors**:
- Probe vague language ("good marketing" → "30% customer growth")
- Connect objectives to mission
- Surface the gap between ideal vs current time allocation
- Time-box ruthlessly

**Conversation Pattern**:
```
1. Open with big picture → Mission
2. Drill into specifics → Objectives with metrics
3. Prioritize → Role responsibilities ranking
4. Contextualize → Stakeholders
5. Discover pain → Current challenges
6. Envision → Success in 6 months
7. Summarize → User confirmation
```

---

### Agent 2: State Analyzer
- **Role**: Work Analyst
- **Expertise**: Task extraction, time analysis, pattern detection
- **Tone**: Analytical, thorough, detail-oriented
- **Duration**: 10 minutes
- **Output**: `current_state.json`

**Key Behaviors**:
- Parse documents (PDF, DOCX, TXT)
- Extract tasks with frequency/time
- Score each task (mission contribution, automation potential, strategic value)
- Detect patterns (repetition, bottlenecks, context switching)
- Visualize portfolio (charts, breakdown)

**Processing Pipeline**:
```
Input (files/text)
  → Parse & extract tasks
  → Classify by domain/type
  → Score (3 dimensions)
  → Detect patterns
  → Calculate time allocation
  → Generate visualizations
  → User review & edit
  → Save current_state.json
```

---

### Agent 3: Strategic Gap Finder
- **Role**: Strategy Consultant
- **Expertise**: Gap analysis, benchmarking, prioritization
- **Tone**: Insightful, evidence-based, actionable
- **Duration**: 20 minutes
- **Output**: `strategic_gaps.json`

**Key Behaviors**:
- Compare ideal vs actual portfolio
- For each objective → infer required activities
- Find missing activities (gaps)
- Benchmark against industry standards
- Prioritize gaps (critical/high/medium)
- Calculate time needed to close gaps

**Analysis Logic**:
```
Load: context.json + current_state.json

1. Build ideal portfolio
   - Role level (IC/Manager/Director)
   - Industry benchmarks
   - Strategic work: 30%, Execution: 40%, People: 15%, Admin: 15%

2. Compare to actual
   - Your strategic work: 20% (−10% gap!)
   - Your execution: 45% (+5% over-invested)

3. For each objective:
   - Required activities?
   - Currently doing?
   - Gap = required − current

4. Prioritize gaps
   - Criticality: Can goals be met without this?
   - Impact: How much does it move the needle?
   - Urgency: Timeline pressure?
   - Feasibility: Easy to start?

5. Calculate time needed
   - Gap #1: Customer research (4h/week)
   - Gap #2: Team 1:1s (3h/week)
   - Gap #3: A/B testing (3h/week)
   - Total: 10h/week needed
```

---

### Agent 4: Automation Advisor
- **Role**: Automation Specialist
- **Expertise**: ROI analysis, scenario planning, implementation strategy
- **Tone**: Practical, solution-oriented, risk-aware
- **Duration**: 15 minutes
- **Output**: `automation_plan.json`

**Key Behaviors**:
- Score automation feasibility (0-100)
- Estimate implementation complexity (1-5)
- Calculate time ROI
- Generate 4 scenarios (Automation-first, Delegation-first, Hybrid, Aggressive)
- Create implementation roadmap

**Automation Scoring Algorithm**:
```python
def score_automation(task):
    score = 0

    # Repetitiveness (0-25 points)
    if task.frequency == 'daily': score += 25
    elif task.frequency == 'weekly': score += 20

    # Rule-based (0-25 points)
    if has_clear_rules(task): score += 25

    # Data-driven (0-20 points)
    if uses_apis(task): score += 20

    # Low human judgment (0-30 points)
    if not requires_creativity(task): score += 15
    if not requires_relationships(task): score += 15

    return min(score, 100)

def estimate_complexity(task):
    complexity = 1
    if requires_custom_code(task): complexity += 1
    if requires_integrations(task): complexity += 1
    if requires_ml(task): complexity += 1
    if requires_infrastructure(task): complexity += 1
    return min(complexity, 5)

def calculate_roi(task, complexity):
    implementation_hours = complexity * 6  # 6h per complexity point
    time_saved_annual = task.time_per_week * 52
    roi = time_saved_annual / implementation_hours
    return roi
```

**Scenario Generation**:
```
Scenario A: Automation-First
  - Automate 2-3 highest ROI tasks
  - Time freed: 11h
  - Timeline: 2-3 weeks
  - Pros: Permanent, consistent
  - Cons: Technical setup needed

Scenario B: Delegation-First
  - Delegate 2-3 tasks to team
  - Time freed: 11h
  - Timeline: 1 week
  - Pros: Fast, team growth
  - Cons: Dependencies

Scenario C: Hybrid ⭐ (Recommended)
  - Mix: automate + delegate + eliminate
  - Time freed: 13h (2h buffer)
  - Timeline: 2-3 weeks
  - Pros: Balanced, exceeds goal
  - Cons: Multi-pronged

Scenario D: Aggressive
  - Deep automation + redesign
  - Time freed: 18h
  - Timeline: 4-6 weeks
  - Pros: Maximum impact
  - Cons: High effort, risk
```

---

### Agent 5: Workflow Designer
- **Role**: Implementation Engineer
- **Expertise**: Workflow design, code generation, documentation
- **Tone**: Technical, thorough, supportive
- **Duration**: 20 minutes
- **Output**: `implementation_package/`

**Key Behaviors**:
- Conduct deep-dive interview per task
- Design workflow diagram
- Generate production-ready code
- Create AI prompts
- Write comprehensive documentation
- Package everything for immediate use

**Workflow Design Process**:
```
For each selected task:

1. Deep-dive interview
   Q: "Walk me through this task step by step"
   Q: "What tools/systems are involved?"
   Q: "Where does data come from?"
   Q: "What's the final output?"
   Q: "What decisions do you make?"
   Q: "What exceptions happen?"
   Q: "What must a human review?"

2. Extract workflow
   - Trigger (time-based, event-based)
   - Steps (sequential operations)
   - Decision points (conditions, branches)
   - Integrations (APIs, tools)
   - Human checkpoints (review gates)
   - Error handling (failure modes)

3. Design implementation
   Choose approach:
   - No-code: Zapier, Make, n8n
   - Low-code: Python scripts + cron
   - Code: Full application

4. Generate artifacts
   - Main script (Python/JS)
   - Helper modules
   - AI prompts
   - Config files (.env, YAML)
   - Documentation (README, setup guides)
   - Tests

5. Package for delivery
   implementation_package/
     └── task_name/
         ├── README.md
         ├── scripts/
         ├── prompts/
         ├── config/
         └── docs/
```

**Code Generation Templates**:

Python Script:
```python
# Auto-generated by Work Redesign Workshop
"""
{TASK_NAME} Automation

{DESCRIPTION}

Workflow:
{WORKFLOW_STEPS}
"""

import os
from dotenv import load_dotenv
import logging

# Setup
load_dotenv()
logger = logging.getLogger(__name__)

class {TaskClass}:
    def __init__(self):
        self.config = self.load_config()

    def load_config(self):
        return {
            # Auto-populated from interview
        }

    def run(self):
        try:
            logger.info("Starting automation...")

            # Auto-generated workflow steps

            logger.info("✅ Complete!")
            return True
        except Exception as e:
            logger.error(f"❌ Failed: {e}")
            self.send_error_alert(str(e))
            return False
```

AI Prompt Template:
```markdown
# {TASK_NAME} - AI Analysis Prompt

## System Prompt
You are a {DOMAIN} expert analyzing {DATA_TYPE}.
Goal: {GOAL}

## Context
Company: {COMPANY}
Target: {TARGETS}
Previous: {PREVIOUS_DATA}

## Current Data
{DATA_PLACEHOLDER}

## Task
Analyze and provide:
1. Key highlights
2. Trend analysis
3. Anomaly detection
4. Recommendations

## Output Format
{JSON_SCHEMA}
```

---

## Inter-Agent Communication

### Data Flow Between Agents

```
Agent 1 (Context)
  ↓ context.json
Agent 2 (State)
  ↓ current_state.json
Agent 3 (Gap Finder)
  ↓ strategic_gaps.json
Agent 4 (Automation)
  ↓ automation_plan.json
Agent 5 (Workflow)
  ↓ implementation_package/
```

### Context Passing

Each agent receives **all previous outputs**:

```javascript
Agent3Input = {
  context: loadJSON('context.json'),
  currentState: loadJSON('current_state.json')
}

Agent4Input = {
  context: loadJSON('context.json'),
  currentState: loadJSON('current_state.json'),
  gaps: loadJSON('strategic_gaps.json')
}
```

This allows agents to:
- Reference earlier decisions
- Show connections
- Validate consistency
- Build on previous insights

---

## Agent Orchestration Logic

### Master Orchestrator

```javascript
class WorkshopOrchestrator {
  constructor() {
    this.currentPhase = 1;
    this.sessionData = {
      sessionId: generateId(),
      startTime: Date.now(),
      context: null,
      currentState: null,
      gaps: null,
      automationPlan: null,
      implementationPackage: null
    };
  }

  async runWorkshop() {
    // Phase 1
    this.sessionData.context = await this.runAgent('ContextInterviewer');

    // Phase 2
    this.sessionData.currentState = await this.runAgent('StateAnalyzer', {
      context: this.sessionData.context
    });

    // Phase 3
    this.sessionData.gaps = await this.runAgent('GapFinder', {
      context: this.sessionData.context,
      currentState: this.sessionData.currentState
    });

    // Phase 4
    this.sessionData.automationPlan = await this.runAgent('AutomationAdvisor', {
      context: this.sessionData.context,
      currentState: this.sessionData.currentState,
      gaps: this.sessionData.gaps
    });

    // Phase 5
    this.sessionData.implementationPackage = await this.runAgent('WorkflowDesigner', {
      context: this.sessionData.context,
      currentState: this.sessionData.currentState,
      gaps: this.sessionData.gaps,
      automationPlan: this.sessionData.automationPlan
    });

    return this.sessionData;
  }

  async runAgent(agentName, input = {}) {
    const agent = this.loadAgent(agentName);
    const prompt = this.buildPrompt(agent, input);
    const result = await this.executeAgent(prompt);
    return result;
  }
}
```

### Phase Transition Protocol

```javascript
function transitionPhase(fromPhase, toPhase) {
  // 1. Save current phase output
  const output = currentAgent.getOutput();
  saveToFile(`phase${fromPhase}_output.json`, output);

  // 2. Show user summary
  displaySummary(output);

  // 3. Preview next phase
  showPhasePreview(toPhase);

  // 4. Ask user confirmation
  const confirmed = await askUser("Ready to continue?");

  if (confirmed) {
    // 5. Load next agent
    currentAgent = loadAgent(toPhase);

    // 6. Pass context
    currentAgent.setContext({
      ...loadPreviousOutputs(),
      userProfile: getUserProfile()
    });

    // 7. Start next phase
    currentAgent.start();
  }
}
```

---

## Error Handling & Validation

### Agent Output Validation

Each agent must validate its output before proceeding:

```javascript
function validateAgentOutput(phase, output) {
  const schemas = {
    1: ContextSchema,
    2: CurrentStateSchema,
    3: GapSchema,
    4: AutomationPlanSchema,
    5: ImplementationPackageSchema
  };

  const schema = schemas[phase];
  const valid = validateJSON(output, schema);

  if (!valid) {
    throw new AgentOutputError(`Phase ${phase} output invalid`);
  }

  return true;
}
```

### User Correction Loop

If agent makes mistake, allow user to correct:

```javascript
async function confirmWithUser(summary) {
  const confirmed = await askUser("Is this accurate?", {
    options: ["Yes, continue", "No, let me correct", "Start over"]
  });

  if (confirmed === "No, let me correct") {
    const corrections = await getUserCorrections();
    applyCorrections(corrections);
    return confirmWithUser(generateNewSummary());
  }

  return confirmed === "Yes, continue";
}
```

---

## Agent Performance Metrics

### Quality Metrics

```javascript
{
  "agent_1_context": {
    "completion_rate": 0.95,  // % who complete phase
    "edit_rate": 0.30,        // % who edit output
    "avg_duration_sec": 420,  // 7 minutes
    "satisfaction": 4.2       // 1-5 scale
  },
  "agent_2_state": {
    "task_extraction_accuracy": 0.88,  // % correct
    "avg_tasks_extracted": 23,
    "user_additions": 3.2,  // Avg tasks user adds
    "avg_duration_sec": 480
  },
  "agent_3_gaps": {
    "gaps_discovered": 4.1,  // Avg per user
    "user_agreement_rate": 0.82,  // % who agree with gaps
    "benchmark_usage": 0.65,  // % where benchmarks applied
    "avg_duration_sec": 900
  },
  "agent_4_automation": {
    "scenarios_generated": 4,
    "scenario_selected_distribution": {
      "A": 0.15,
      "B": 0.10,
      "C": 0.65,  // Hybrid most popular
      "D": 0.10
    },
    "avg_time_freed": 12.3,  // hours/week
    "avg_duration_sec": 720
  },
  "agent_5_workflow": {
    "workflows_generated": 2.1,  // Avg per user
    "code_quality_score": 0.91,
    "documentation_completeness": 0.94,
    "avg_files_generated": 18,
    "avg_duration_sec": 1080
  }
}
```

---

## Agent Personalization

### Adapting to User Level

```javascript
function inferUserLevel(context) {
  const indicators = {
    teamSize: context.stakeholders.downward.length,
    responsibilities: context.role_responsibilities,
    objectives: context.objectives
  };

  if (indicators.teamSize === 0) return 'IC';
  if (indicators.teamSize <= 5) return 'Manager';
  if (indicators.teamSize > 5) return 'Director';
}

function adjustAgentBehavior(agentId, userLevel) {
  const adjustments = {
    'IC': {
      idealPortfolio: { strategic: 0.15, execution: 0.60, learning: 0.25 },
      gapEmphasis: 'skill development',
      automationFocus: 'personal productivity'
    },
    'Manager': {
      idealPortfolio: { strategic: 0.30, execution: 0.40, people: 0.15, admin: 0.15 },
      gapEmphasis: 'team development',
      automationFocus: 'team scalability'
    },
    'Director': {
      idealPortfolio: { strategic: 0.50, people: 0.25, execution: 0.15, admin: 0.10 },
      gapEmphasis: 'strategic initiatives',
      automationFocus: 'process transformation'
    }
  };

  return adjustments[userLevel];
}
```

---

## Testing Strategy

### Agent Unit Tests

```javascript
describe('Agent 1: Context Interviewer', () => {
  test('should extract mission from vague description', () => {
    const input = "We do marketing stuff to help the company";
    const output = agent1.extractMission(input, followUpQuestions);
    expect(output.mission).toMatch(/specific goal|metric|outcome/);
  });

  test('should probe generic objectives', () => {
    const input = "Improve performance";
    const probes = agent1.generateProbes(input);
    expect(probes).toContain(/what metric|how much|by when/);
  });
});

describe('Agent 2: State Analyzer', () => {
  test('should extract tasks from document', () => {
    const doc = loadSampleDocument('marketing_tasks.pdf');
    const tasks = agent2.extractTasks(doc);
    expect(tasks.length).toBeGreaterThan(10);
    expect(tasks[0]).toHaveProperty('title');
    expect(tasks[0]).toHaveProperty('time_per_week');
  });

  test('should score automation potential correctly', () => {
    const task = {
      title: 'Weekly dashboard',
      description: 'Pull data from GA4, create Excel report',
      frequency: 'weekly'
    };
    const score = agent2.scoreAutomation(task);
    expect(score).toBeGreaterThan(80);  // High potential
  });
});
```

### Integration Tests

```javascript
describe('Workshop End-to-End', () => {
  test('should complete full 5-phase workflow', async () => {
    const orchestrator = new WorkshopOrchestrator();

    // Simulate user inputs for each phase
    const result = await orchestrator.runWorkshop({
      phase1Input: mockContextInput,
      phase2Input: mockStateInput,
      phase3Input: mockGapInput,
      phase4Input: mockAutomationInput,
      phase5Input: mockWorkflowInput
    });

    expect(result.context).toBeDefined();
    expect(result.gaps.strategic_gaps.length).toBeGreaterThan(0);
    expect(result.automationPlan.time_freed).toBeGreaterThan(result.gaps.time_needed);
    expect(result.implementationPackage.workflows.length).toBeGreaterThan(0);
  });
});
```

---

## Agent Prompt Management

### Versioning

```
/prompts/agents/
  ├── v1.0/
  │   ├── phase1_context_interviewer.md
  │   ├── phase2_state_analyzer.md
  │   ├── ...
  └── v2.0/
      ├── phase1_context_interviewer.md  (improved)
      └── ...
```

### A/B Testing

```javascript
function selectAgentVersion(userId, phaseId) {
  const abTest = getActiveABTest(phaseId);

  if (!abTest) {
    return loadPrompt(`agents/latest/phase${phaseId}.md`);
  }

  const variant = assignVariant(userId, abTest);
  logExperiment(userId, phaseId, variant);

  return loadPrompt(`agents/${variant}/phase${phaseId}.md`);
}
```

---

## Future Enhancements

### Multi-Agent Collaboration

Allow agents to consult each other:

```
Agent 3 (Gap Finder) → "Hey Agent 2, can you verify if user is doing customer research?"
Agent 2 (State Analyzer) → "I found 0 instances of customer interviews in their tasks"
Agent 3 → "Thanks, confirming this as a critical gap"
```

### Learning from Sessions

```javascript
function improveAgentFromFeedback(sessionId) {
  const session = loadSession(sessionId);
  const feedback = session.userFeedback;

  // User edited gap priority
  if (feedback.gap_priority_changed) {
    updateGapScoringModel(feedback.changes);
  }

  // User rejected automation suggestion
  if (feedback.automation_rejected) {
    updateAutomationScoring(feedback.reasons);
  }

  // Re-train agent prompts
  retrainAgent(feedback);
}
```

---

**Document Version**: 1.0
**Last Updated**: 2024-01-15
