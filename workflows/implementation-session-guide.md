# 🔧 Implementation Session Guide - Dhacle Project

## 🎯 Implementation AI Core Mission
**Role**: Code executor and feature builder  
**Duration**: 60-90 minutes maximum  
**Input**: Complete implementation roadmap from Planning AI  
**Output**: Working, tested, production-ready feature

## 🚀 Session Startup Protocol

### 1. Handoff Package Reception (5 minutes)
```bash
# Validate handoff completeness
npm run context:load
npm run scan:assets
npm run verify:parallel
```

**SuperClaude Commands**:
- `/load @templates/[feature]-implementation-plan.md`
- `/load @ai-context-warmup.md @CLAUDE.md`

### 2. Implementation AI Persona Activation
```yaml
Auto-Personas:
  Primary: Domain-specific (Frontend/Backend/Security based on task)
  Quality: --persona-qa (Testing & validation)
  Support: --persona-refactorer (Code quality)

MCP Integration:
  Context7: Framework patterns & library docs
  Sequential: Complex implementation logic
  Playwright: E2E testing & validation
  Magic: UI component generation (when needed)
```

## 🏗️ Core Implementation Workflow

### Phase 1: Setup & Validation (10 minutes)
**SuperClaude Commands**:
- `/analyze @handoff-package --validate --scope module`
- `/build --validate-dependencies`

#### 1.1 Handoff Package Validation
```typescript
interface HandoffValidation {
  completeness_check: {
    technical_spec: boolean;
    implementation_steps: boolean;  
    quality_gates: boolean;
    sub_agent_assignments: boolean;
  };
  feasibility_assessment: {
    dependencies_available: boolean;
    permissions_sufficient: boolean;
    time_realistic: boolean;
  };
  ready_to_proceed: boolean;
}
```

#### 1.2 Environment Preparation
- [ ] Verify current project state matches planning assumptions
- [ ] Check all required dependencies available
- [ ] Validate development environment ready
- [ ] Confirm database access and permissions

### Phase 2: Database Implementation (15-20 minutes)
**SuperClaude Commands**:
- `/implement [database-changes] --focus security --validate`

#### 2.1 Schema Creation (Database Agent Auto-Activated)
```typescript
// Auto-activation pattern: SQL files, migration files
// Agent: Database Agent (supabase/migrations/CLAUDE.md)

const database_workflow = [
  "1. CREATE TABLE statements with proper types",
  "2. Enable RLS immediately: ALTER TABLE ... ENABLE ROW LEVEL SECURITY",
  "3. Create policies: CREATE POLICY ... FOR ALL USING ...",
  "4. Execute via: node scripts/supabase-sql-executor.js --method pg --file <file>",
  "5. Generate types: npm run types:generate",
  "6. Validate: npm run types:check"
];
```

#### 2.2 RLS Policies (Security Agent Auto-Activated)
```sql
-- Pattern enforced by Security Agent
CREATE POLICY "policy_name" ON table_name
FOR ALL USING (auth.uid() = user_id);

-- Validation: No table without RLS policy
-- Validation: No hardcoded user references
-- Validation: Proper auth.uid() usage
```

### Phase 3: API Development (20-25 minutes)
**SuperClaude Commands**:
- `/implement [api-endpoints] --persona-backend --validate`

#### 3.1 API Route Implementation (API Route Agent Auto-Activated)
```typescript
// Auto-activation pattern: src/app/api/**
// Agent: API Route Agent (src/app/api/CLAUDE.md)

// Enforced pattern by API Route Agent:
export async function GET(request: NextRequest) {
  try {
    // 1. Auth validation (MUST HAVE)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 2. Input validation with proper types
    const validated = inputSchema.parse(await request.json());

    // 3. Business logic with error handling
    const result = await businessLogic(validated);

    // 4. Response with proper types
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### 3.2 Type Integration (Type Agent Auto-Activated)
```typescript
// Auto-activation pattern: *.ts, *.tsx files
// Agent: Type Agent (src/types/CLAUDE.md)

// Enforced patterns:
import type { Database } from '@/types/database.generated';
import type { ApiResponse, UserProfile } from '@/types';

// BLOCKED: any types
// BLOCKED: Direct database.generated imports outside @/types
// ENFORCED: Central type definitions in src/types/index.ts
```

### Phase 4: Component Development (20-25 minutes)
**SuperClaude Commands**:
- `/build [components] --persona-frontend --focus accessibility`

#### 4.1 Component Architecture (Component Agent Auto-Activated)
```typescript
// Auto-activation pattern: src/components/**
// Agent: Component Agent (src/components/CLAUDE.md)

// Enforced pattern:
import { Button } from '@/components/ui/button';  // shadcn/ui first
import type { ComponentProps } from '@/types';

// Server Component by default (no 'use client' unless required)
export default function FeatureComponent({ ...props }: ComponentProps) {
  return (
    <div className="space-y-4">
      {/* shadcn/ui components preferred */}
    </div>
  );
}
```

#### 4.2 UI Integration
- [ ] **shadcn/ui First**: Use existing design system components
- [ ] **Server Components**: Default to server-side rendering
- [ ] **Type Safety**: Proper TypeScript interfaces
- [ ] **Accessibility**: WCAG compliance patterns

### Phase 5: Integration & Testing (15-20 minutes)
**SuperClaude Commands**:
- `/test [feature] --persona-qa --comprehensive`
- `/analyze --focus integration --validate`

#### 5.1 Feature Integration Testing
```bash
# Required validation commands
npm run verify:parallel   # Full system validation
npm run types:check      # TypeScript validation
npm run build           # Production build test
```

#### 5.2 Quality Gates Validation
```typescript
interface QualityGates {
  compilation: boolean;     // TypeScript passes
  security: boolean;        // RLS policies active
  functionality: boolean;   // Feature works as specified
  performance: boolean;     // No obvious bottlenecks
  accessibility: boolean;   // Basic WCAG compliance
}
```

## 🎯 Sub-Agent Orchestration

### Automatic Agent Assignment
```yaml
File_Pattern_Detection:
  "src/app/api/**": API_Route_Agent
  "src/components/**": Component_Agent  
  "src/types/**": Type_Agent
  "supabase/migrations/**": Database_Agent
  "src/lib/security/**": Security_Agent
  "**/test/**": Test_Agent

Domain_Based_Detection:
  authentication: Security_Agent + API_Route_Agent
  ui_components: Component_Agent + Frontend_Persona
  database_schema: Database_Agent + Security_Agent
  api_endpoints: API_Route_Agent + Type_Agent
```

### Agent Coordination Workflow
```typescript
class AgentOrchestration {
  // Phase 1: Database Agent → Type Agent
  async setupDatabase() {
    await DatabaseAgent.createTables();
    await TypeAgent.generateTypes();
  }

  // Phase 2: API Route Agent → Type Agent  
  async buildAPI() {
    await APIRouteAgent.createEndpoints();
    await TypeAgent.validateInterfaces();
  }

  // Phase 3: Component Agent → Frontend Persona
  async buildUI() {
    await ComponentAgent.createComponents();
    await FrontendPersona.optimizePerformance();
  }

  // Phase 4: QA Agent → Test Agent
  async validateFeature() {
    await QAAgent.runQualityGates();
    await TestAgent.executeTests();
  }
}
```

## 📊 Implementation Tracking

### Progress Monitoring
**SuperClaude Commands**: `/task [feature] --track-progress`

```yaml
Implementation_Progress:
  Database: [percentage]% complete
  API: [percentage]% complete  
  Components: [percentage]% complete
  Integration: [percentage]% complete
  Testing: [percentage]% complete
  
Blockers:
  - [Any blocking issues]
  
Next_Actions:
  - [Immediate next steps]
```

### Quality Checkpoints
```bash
# After each major phase
npm run verify:parallel

# Before final handoff
npm run types:check
npm run build
npm run test # if tests exist
```

## 🔄 Wave Mode Integration

### When to Use Wave Mode
**Auto-Activation**: complexity ≥ 0.7 AND files > 20 AND operation_types > 2

```yaml
Wave_Strategies:
  Progressive: "Incremental enhancement for large features"
  Systematic: "Methodical analysis for complex systems"  
  Adaptive: "Dynamic configuration based on complexity"
  Enterprise: "Large-scale orchestration for >100 files"
```

### Wave Execution Pattern
**SuperClaude Commands**:
- `/implement [feature] --wave-mode auto`
- `/improve [system] --wave-strategy progressive`

```typescript
interface WaveExecution {
  wave_1: "Foundation setup (DB, types, core API)";
  wave_2: "Feature implementation (API endpoints, business logic)";
  wave_3: "UI development (components, pages)";
  wave_4: "Integration & optimization";
  wave_5: "Testing & validation";
}
```

## ✅ Implementation Session Success Criteria

### Completion Requirements
- [ ] **Functional**: Feature works as specified in planning
- [ ] **Quality**: All quality gates pass (8-step validation)
- [ ] **Security**: RLS policies active, auth patterns correct
- [ ] **Performance**: No obvious performance issues
- [ ] **Integration**: Works with existing system
- [ ] **Documentation**: Code properly documented

### Handoff to Production
```bash
# Final validation before deployment
npm run verify:parallel
npm run build
npm run e2e:ui  # if E2E tests available

# Success criteria:
# - All commands pass without errors
# - Feature functional in local environment
# - No TypeScript errors
# - No security vulnerabilities
```

### Implementation Summary Report
```yaml
Feature: [Feature Name]
Status: ✅ Complete / ⚠️ Partial / ❌ Failed

Implementation_Details:
  Database_Changes: [List of tables/policies created]
  API_Endpoints: [List of routes implemented]
  Components: [List of UI components created]
  Types: [New type definitions added]

Quality_Gates:
  TypeScript: ✅/❌
  Security: ✅/❌ 
  Functionality: ✅/❌
  Integration: ✅/❌

Remaining_Work: [If any]
Known_Issues: [If any]
```

---

**⏰ Time Management**: Implementation sessions should complete core functionality within 90 minutes. Use `--loop` flag for iterative improvement in follow-up sessions.

**🚨 Escalation Protocol**: If implementation hits blockers not identified in planning, document issues and recommend planning session revision rather than proceeding with incomplete solution.