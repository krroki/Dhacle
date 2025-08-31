# 📋 Planning Session Guide - Dhacle Project

## 🎯 Planning AI Core Mission
**Role**: Strategic planner and system designer  
**Duration**: 30-45 minutes maximum  
**Output**: Complete implementation roadmap for handoff

## 🚀 Session Startup Protocol

### 1. Context Loading (2-3 minutes)
```bash
# Run these commands first
npm run context:load
npm run scan:assets
npm run verify:parallel
```

**SuperClaude Command**: `/load @ai-context-warmup.md @CLAUDE.md`

### 2. Planning AI Persona Activation
```yaml
Auto-Personas:
  Primary: --persona-architect (System design & long-term thinking)
  Secondary: --persona-analyzer (Evidence-based investigation)
  Support: --persona-scribe (Documentation quality)

MCP Integration:
  Sequential: Complex analysis & structured planning
  Context7: Framework patterns & best practices
  No Magic: Planning phase doesn't need UI generation
```

## 📊 Core Planning Workflow

### Phase 1: Discovery & Analysis (10 minutes)
**SuperClaude Commands**: 
- `/analyze [target] --scope project --focus architecture`
- `/troubleshoot [symptoms] --think-hard`

#### 1.1 Project State Assessment
- [ ] Read `asset-inventory.json` for current asset status
- [ ] Check `project-dna.json` for project configuration
- [ ] Review recent git commits for context
- [ ] Identify critical issues from `ai-context-warmup.md`

#### 1.2 Technical Requirements Mapping
```typescript
interface PlanningAnalysis {
  current_state: {
    components: number;      // From asset scanner
    api_routes: number;      // From asset scanner
    tables: number;          // DB status
    quality_score: number;   // % score
  };
  requirements: {
    functional: string[];    // What needs to be built
    non_functional: string[]; // Quality, performance, security
    constraints: string[];   // Technical limitations
  };
  dependencies: {
    external: string[];      // Libraries, APIs
    internal: string[];      // Existing components/APIs
    database: string[];      // Tables, policies needed
  };
}
```

### Phase 2: Architecture Design (15 minutes)
**SuperClaude Commands**:
- `/design [domain] --wave-mode auto`
- `/estimate [target] --scope system`

#### 2.1 System Architecture Planning
- [ ] Database schema design (tables, RLS policies)
- [ ] API endpoint architecture (routes, auth patterns)
- [ ] Component hierarchy (pages → components → UI)
- [ ] Security layer planning (auth, validation, RLS)

#### 2.2 Implementation Strategy
```yaml
Strategy_Levels:
  Wave_Mode: # For complex multi-stage operations
    trigger: complexity >= 0.7 AND files > 20 AND operation_types > 2
    approach: Progressive enhancement with validation gates
  
  Sub_Agent_Delegation: # For parallel processing
    trigger: directories > 7 OR files > 50 OR complexity > 0.8
    approach: Specialized agents for different domains
  
  Standard_Implementation: # For simple features
    approach: Direct implementation with quality gates
```

### Phase 3: Risk Assessment & Validation (8 minutes)
**SuperClaude Commands**:
- `/analyze --focus security --validate`
- `/improve [target] --risk-assessment`

#### 3.1 Technical Risks
- [ ] **Database Risks**: Missing RLS, table dependencies
- [ ] **Type Safety Risks**: any types, missing type definitions
- [ ] **Security Risks**: Unprotected routes, validation gaps
- [ ] **Performance Risks**: N+1 queries, heavy components

#### 3.2 Implementation Blockers
- [ ] Missing dependencies or configurations
- [ ] Incomplete understanding of requirements
- [ ] Resource or time constraints
- [ ] Integration complexities

## 📝 Planning Session Deliverables

### 1. Technical Specification Document
```markdown
# Feature Implementation Plan: [FEATURE_NAME]

## Overview
- Purpose: [What this accomplishes]
- Scope: [What's included/excluded]  
- Success Criteria: [Measurable outcomes]

## Architecture
### Database Changes
- Tables: [SQL definitions with RLS]
- Migrations: [File names and order]

### API Design  
- Endpoints: [Routes with auth patterns]
- Types: [Request/response interfaces]

### Component Structure
- Pages: [Route structure]
- Components: [Component hierarchy]
- UI: [shadcn/ui components needed]

## Implementation Steps
1. [Database setup]
2. [Type definitions]  
3. [API implementation]
4. [Component development]
5. [Integration & testing]

## Quality Gates
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Security review complete
- [ ] Performance benchmarks met

## Handoff Notes
[Critical information for Implementation AI]
```

### 2. Implementation Checklist
```yaml
Database_Tasks:
  - SQL files: [List with priorities]
  - RLS policies: [Security requirements]
  - Type generation: [Commands to run]

Development_Tasks:
  - API routes: [Endpoints with complexity]
  - Components: [UI elements with patterns]  
  - Integration: [Connection points]

Validation_Tasks:
  - Tests: [Coverage requirements]
  - Security: [Audit checklist]
  - Performance: [Benchmark targets]
```

### 3. Sub-Agent Assignment Matrix
```yaml
API_Route_Agent:
  files: "src/app/api/**"
  focus: "Authentication, validation, response patterns"
  
Component_Agent:
  files: "src/components/**"
  focus: "Server components, shadcn/ui, type safety"
  
Database_Agent:
  files: "supabase/migrations/**"
  focus: "RLS policies, table structure, relationships"
  
Type_Agent:
  files: "src/types/**"
  focus: "Central type definitions, any type elimination"
```

## 🔄 Handoff Preparation

### Pre-Handoff Validation
- [ ] All planning documents complete
- [ ] No ambiguous requirements
- [ ] Clear implementation order defined
- [ ] Risks documented with mitigation strategies
- [ ] Success criteria measurable

### Handoff Package Creation
**SuperClaude Command**: `/document [target] --persona-scribe=en --comprehensive`

```bash
# Generate handoff package
npm run context:load  # Update latest context
# Create implementation-ready package in templates/
```

## 🎯 Planning Session Success Criteria

### Quality Gates
- [ ] **Completeness**: All requirements captured and specified
- [ ] **Feasibility**: Technical approach validated against project constraints
- [ ] **Clarity**: Implementation steps clear and unambiguous
- [ ] **Safety**: Security and quality requirements identified
- [ ] **Measurability**: Success criteria defined and testable

### Handoff Readiness Checklist
- [ ] Technical specification complete
- [ ] Implementation checklist prepared
- [ ] Sub-agent assignments clear
- [ ] Risk assessment documented
- [ ] Quality gates defined
- [ ] All planning artifacts in `templates/` directory

---

**⏰ Time Management**: Planning sessions should not exceed 45 minutes. Use `--uc` flag if approaching time limit to compress output while maintaining essential information.

**🚨 Escalation Protocol**: If planning reveals requirements too complex for single session, document scope reduction options or multi-session breakdown strategy.