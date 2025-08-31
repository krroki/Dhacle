# 📋 Planning Session Template - [FEATURE_NAME]

## 🎯 Session Overview
**Feature**: [Feature Name]  
**Planning AI**: [AI Name/Session ID]  
**Date**: [Date]  
**Estimated Complexity**: [High/Medium/Low]  
**Session Duration**: [Actual time]

## 🚀 Context Loading Results
```bash
# Commands executed
npm run context:load     ✅/❌
npm run scan:assets      ✅/❌ 
npm run verify:parallel  ✅/❌

# SuperClaude initialization
/load @ai-context-warmup.md @CLAUDE.md ✅/❌
```

### Current Project State
- **Components**: [Number] (Target: [Target])
- **API Routes**: [Number] (Target: [Target])  
- **Tables**: [Number] (Target: [Target])
- **Quality Score**: [Percentage]% (Target: [Target]%)
- **Critical Issues**: [List top 3]

## 📊 Discovery & Analysis

### Requirements Analysis
```yaml
Functional_Requirements:
  - [Requirement 1 - what the feature must do]
  - [Requirement 2 - core functionality]
  - [Requirement 3 - user interactions]

Non_Functional_Requirements:
  - Performance: [Response time, throughput targets]
  - Security: [Auth requirements, data protection]
  - Usability: [UX requirements, accessibility]
  - Scalability: [Expected load, growth planning]

Constraints:
  - Technical: [Framework limitations, dependencies]
  - Business: [Timeline, resources, scope]
  - Integration: [Existing system compatibility]
```

### Stakeholder Analysis
```yaml
Primary_Users:
  - [User type 1]: [Needs and goals]
  - [User type 2]: [Needs and goals]

System_Integration:
  - [Existing system 1]: [Integration points]
  - [Existing system 2]: [Dependencies]

External_Dependencies:
  - [API/Service 1]: [Requirements]
  - [Library/Framework]: [Version requirements]
```

## 🏗️ Architecture Design

### Database Architecture
```sql
-- Tables Required
CREATE TABLE IF NOT EXISTS [table_name] (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  [field_name] [data_type] [constraints],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (MANDATORY)
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[policy_name]" ON [table_name]
FOR ALL USING (auth.uid() = user_id);

-- Additional policies as needed
CREATE POLICY "[read_policy]" ON [table_name] 
FOR SELECT USING (true); -- For public read access

CREATE POLICY "[admin_policy]" ON [table_name]
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### API Architecture
```typescript
// API Endpoints Required
interface APIEndpoints {
  "POST /api/[resource]": {
    auth: "required";
    input: InputSchema;
    output: ResponseSchema;
    validation: ValidationRules;
  };
  
  "GET /api/[resource]": {
    auth: "required";  
    params: ParamSchema;
    output: ResponseSchema;
    pagination: PaginationConfig;
  };
  
  "PUT /api/[resource]/[id]": {
    auth: "required";
    input: UpdateSchema;
    output: ResponseSchema;
    authorization: AuthorizationRules;
  };
  
  "DELETE /api/[resource]/[id]": {
    auth: "required";
    params: ParamSchema;
    authorization: AuthorizationRules;
  };
}
```

### Component Architecture  
```typescript
// Page Structure
interface PageStructure {
  pages: {
    "[route]": {
      type: "app_route";
      auth_required: boolean;
      layout: LayoutComponent;
      components: ComponentList;
    };
  };
  
  components: {
    "[ComponentName]": {
      type: "server" | "client";
      props: PropsInterface;
      dependencies: DependencyList;
      ui_library: "shadcn/ui" | "custom";
    };
  };
}
```

### Security Architecture
```yaml
Authentication_Layer:
  - Route protection: [Protected routes list]
  - Session management: [Session configuration]
  - Role-based access: [Role definitions]

Authorization_Layer:  
  - RLS policies: [Database-level security]
  - API middleware: [Endpoint protection]
  - Component guards: [UI-level security]

Data_Protection:
  - Input validation: [Validation schemas]
  - Output sanitization: [Response filtering]
  - Audit logging: [Audit requirements]
```

## ⚡ Implementation Strategy

### Development Approach
**Selected Strategy**: [Wave Mode / Sub-Agent Delegation / Standard Implementation]

#### Justification
```yaml
Complexity_Assessment:
  technical_complexity: [High/Medium/Low]
  scope_size: [Large/Medium/Small]
  integration_complexity: [High/Medium/Low]
  risk_level: [High/Medium/Low]

Strategy_Selection_Logic:
  # Wave Mode (complexity ≥ 0.7 AND files > 20 AND operation_types > 2)
  wave_mode_score: [0.0-1.0]
  wave_mode_recommended: [Yes/No]
  
  # Sub-Agent Delegation (directories > 7 OR files > 50 OR complexity > 0.8)  
  delegation_score: [0.0-1.0]
  delegation_recommended: [Yes/No]
  
  # Standard Implementation (simple, focused features)
  standard_appropriate: [Yes/No]
```

### Implementation Phases
```yaml
Phase_1_Database: # [Estimated time: X hours]
  priority: 1
  tasks:
    - Create migration files
    - Define table schemas  
    - Implement RLS policies
    - Execute migrations
    - Generate TypeScript types
  validation:
    - Tables exist with proper structure
    - RLS policies active and tested
    - Types generated successfully
    - No TypeScript compilation errors

Phase_2_Types: # [Estimated time: X hours]
  priority: 2
  dependencies: [Phase_1_Database]
  tasks:
    - Define request/response interfaces
    - Create domain type definitions
    - Update central type index
    - Eliminate any remaining any types
  validation:
    - All types properly defined
    - No any types in implementation
    - Type safety at compile time
    - IntelliSense working correctly

Phase_3_API: # [Estimated time: X hours]  
  priority: 3
  dependencies: [Phase_1_Database, Phase_2_Types]
  tasks:
    - Implement API endpoints
    - Add authentication middleware
    - Implement input validation
    - Add error handling
    - Create API documentation
  validation:
    - All endpoints functional
    - Authentication working
    - Error handling comprehensive
    - API responses type-safe

Phase_4_Components: # [Estimated time: X hours]
  priority: 4  
  dependencies: [Phase_3_API]
  tasks:
    - Create page components
    - Build UI components using shadcn/ui
    - Implement client-side logic
    - Add form handling and validation
    - Integrate with API endpoints
  validation:
    - Pages render correctly
    - User interactions working
    - Forms submit and validate
    - API integration functional

Phase_5_Integration: # [Estimated time: X hours]
  priority: 5
  dependencies: [All previous phases]
  tasks:
    - End-to-end testing
    - Performance optimization  
    - Security validation
    - Documentation updates
    - Quality gate verification
  validation:
    - Feature works end-to-end
    - Performance meets targets
    - Security requirements met
    - Documentation complete
```

## 🚨 Risk Assessment

### Technical Risks
```yaml
High_Risk:
  - risk_name: [Specific technical risk]
    probability: [High/Medium/Low]  
    impact: [High/Medium/Low]
    mitigation: [Specific mitigation strategy]
    contingency: [Backup plan if mitigation fails]
    
Medium_Risk:
  - risk_name: [Another risk]
    probability: [Assessment]
    impact: [Assessment]  
    mitigation: [Strategy]
    monitoring: [How to detect early]

Low_Risk:
  - risk_name: [Minor risk]
    acceptance_criteria: [When to accept risk]
    monitoring: [Awareness level needed]
```

### Implementation Blockers
```yaml
Critical_Blockers:
  - [Blocker that would prevent any progress]
  - [Missing dependency or access]
  - [Architectural decision pending]

Major_Blockers:
  - [Issue that would significantly delay implementation]
  - [Complex integration requirement]
  - [Performance or scalability concern]

Minor_Blockers:
  - [Small issue that could be worked around]
  - [Nice-to-have feature that could be deferred]
```

### Assumptions & Dependencies
```yaml
Technical_Assumptions:
  - [Assumption about existing system behavior]
  - [Assumption about performance characteristics]
  - [Assumption about user behavior]

External_Dependencies:
  - dependency: [External system/API]
    status: [Available/Unknown/Blocked]
    impact_if_unavailable: [High/Medium/Low]
    
Internal_Dependencies:
  - dependency: [Internal system/component]
    status: [Ready/In Progress/Not Started]
    required_by: [Which phase needs this]
```

## 📋 Sub-Agent Assignment Matrix

### Agent Assignments
```yaml
Database_Agent:
  activation_pattern: "supabase/migrations/**, *.sql"
  responsibilities:
    - Table creation with proper constraints
    - RLS policy implementation
    - Migration execution coordination
    - Database relationship management
  deliverables:
    - "[migration_file_1].sql"
    - "[migration_file_2].sql"
    - "RLS policy verification report"
  success_criteria:
    - All tables created with RLS enabled
    - Policies tested and functional
    - No security vulnerabilities
    - TypeScript types generated successfully

Type_Agent:
  activation_pattern: "src/types/**, *.ts, *.tsx"
  responsibilities:
    - Central type definition creation
    - any type elimination
    - Database type integration
    - API interface definitions
  deliverables:
    - "Updated src/types/index.ts"
    - "[Feature]Types.ts interfaces"
    - "Type safety verification report"
  success_criteria:
    - No any types in codebase
    - All API interfaces properly typed
    - Database types integrated
    - IntelliSense fully functional

API_Route_Agent:
  activation_pattern: "src/app/api/**"
  responsibilities:
    - Authentication implementation
    - Input validation and sanitization
    - Business logic implementation
    - Error handling and logging
  deliverables:
    - "src/app/api/[endpoint]/route.ts files"
    - "API documentation"
    - "Authentication test report"
  success_criteria:
    - All endpoints authenticated
    - Input validation comprehensive
    - Error handling consistent
    - Performance within targets

Component_Agent:
  activation_pattern: "src/components/**, src/app/**"
  responsibilities:
    - Server component optimization
    - shadcn/ui component integration
    - Accessibility implementation
    - Client-side state management
  deliverables:
    - "Page components in src/app"
    - "Reusable components in src/components"
    - "Accessibility audit report"
  success_criteria:
    - Components render correctly
    - Accessibility standards met
    - Performance optimized
    - Design system consistent

Security_Agent:
  activation_pattern: "Authentication, RLS, validation code"
  responsibilities:
    - Security review and hardening
    - RLS policy validation
    - Input sanitization verification
    - Audit trail implementation
  deliverables:
    - "Security review report"
    - "RLS policy test results"
    - "Vulnerability assessment"
  success_criteria:
    - No security vulnerabilities
    - RLS policies comprehensive
    - Input validation robust
    - Audit logging functional
```

## ✅ Success Criteria & Quality Gates

### Functional Success Criteria
- [ ] **Core Functionality**: [Specific feature works as specified]
- [ ] **User Experience**: [User can complete primary workflows]
- [ ] **Integration**: [Works seamlessly with existing features]
- [ ] **Data Integrity**: [Data is stored and retrieved correctly]
- [ ] **Performance**: [Meets response time requirements]

### Non-Functional Success Criteria  
- [ ] **Security**: [Authentication and authorization working]
- [ ] **Accessibility**: [Basic WCAG compliance achieved]
- [ ] **Maintainability**: [Code is clean and well-documented]
- [ ] **Testability**: [Feature is testable and tests pass]
- [ ] **Scalability**: [Handles expected load without degradation]

### Quality Gates
```yaml
Gate_1_Database:
  - [ ] Tables created with proper structure
  - [ ] RLS policies active and tested
  - [ ] Foreign key relationships correct
  - [ ] Migration executed successfully
  - [ ] Types generated without errors

Gate_2_API:
  - [ ] All endpoints functional
  - [ ] Authentication implemented correctly
  - [ ] Input validation comprehensive
  - [ ] Error handling consistent
  - [ ] Response schemas match specifications

Gate_3_Components:
  - [ ] Pages render without errors
  - [ ] User interactions work correctly
  - [ ] Forms validate and submit properly
  - [ ] Design system components used correctly
  - [ ] Accessibility requirements met

Gate_4_Integration:
  - [ ] End-to-end workflows functional
  - [ ] API integration working
  - [ ] State management correct
  - [ ] Error states handled gracefully
  - [ ] Loading states implemented

Gate_5_Quality:
  - [ ] TypeScript compilation passes
  - [ ] No any types in implementation
  - [ ] Performance benchmarks met
  - [ ] Security review completed
  - [ ] Documentation updated
```

### Acceptance Criteria
```gherkin
Feature: [Feature Name]
  As a [user type]
  I want [capability]
  So that [business value]

Scenario: [Primary use case]
  Given [initial condition]
  When [action performed]
  Then [expected outcome]
  And [additional verification]

Scenario: [Error case]
  Given [error condition setup]
  When [action that triggers error]
  Then [appropriate error handling]
  And [user guided to resolution]

Scenario: [Edge case]
  Given [unusual but valid condition]
  When [edge case action]
  Then [system handles gracefully]
```

## 🤝 Handoff Package Preparation

### Implementation Ready Checklist
- [ ] **Technical Specification Complete**: All requirements documented
- [ ] **Architecture Validated**: Design reviewed and approved
- [ ] **Implementation Steps Ordered**: Clear sequence defined
- [ ] **Sub-Agent Assignments Clear**: Roles and responsibilities defined
- [ ] **Quality Gates Defined**: Success criteria measurable
- [ ] **Risk Assessment Complete**: Risks identified with mitigations
- [ ] **Success Criteria Specific**: Outcomes are testable
- [ ] **Context References Updated**: Current project state documented

### Handoff Documents Generated
- [ ] `templates/[feature]-implementation-plan.md`
- [ ] `templates/[feature]-technical-spec.md`
- [ ] `templates/[feature]-sub-agent-matrix.md`
- [ ] `templates/[feature]-quality-gates.md`
- [ ] `templates/[feature]-risk-assessment.md` (if high-risk)

### Pre-Implementation Validation
```bash
# Validation commands for Implementation AI
npm run context:load     # Load current project state
npm run scan:assets      # Update asset inventory  
npm run verify:parallel  # Verify system health

# Handoff readiness check
/load @templates/[feature]-implementation-plan.md
/validate-handoff-completeness
```

---

## 📝 Planning Session Notes

### Key Decisions Made
- [Decision 1 with rationale]
- [Decision 2 with rationale]  
- [Decision 3 with rationale]

### Open Questions
- [Question 1 - needs resolution before implementation]
- [Question 2 - can be resolved during implementation]

### Future Considerations
- [Item 1 - for future planning sessions]
- [Item 2 - technical debt or enhancement opportunities]

---

**Planning Session Status**: ✅ Complete / ⚠️ Needs Review / ❌ Incomplete  
**Ready for Implementation**: [Yes/No - with explanation if No]  
**Estimated Implementation Time**: [Hours/Days]  
**Recommended Next Session**: [Implementation/Follow-up Planning]