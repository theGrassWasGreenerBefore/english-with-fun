# Tasks

Implementation tasks for migrating specifications to OpenSpec. These tasks are completed during the apply phase.

## Phase 1: Validate Specs

### Task 1.1: Run OpenSpec validation
```bash
cd D:\Projects\__AI\english-with-fun
openspec validate --change migrate-specs-to-openspec
```
Expected outcome: All specs pass validation (no errors, warnings OK).

### Task 1.2: Manual review of spec scenarios
Review each spec to ensure:
- Every `### Requirement:` has at least one `#### Scenario:`
- Scenarios use exactly 4 hashtags (`####`)
- WHEN/THEN format is consistent
- Requirement descriptions are under 500 characters

Files to review:
- specs/core/project-overview/spec.md
- specs/core/architecture/spec.md
- specs/core/data-formats/spec.md
- specs/core/constraints/spec.md
- specs/skill/layout/spec.md
- specs/skill/video-player/spec.md
- specs/skill/minigame/spec.md
- specs/workflow/spec.md

### Task 1.3: Cross-check against originals
Verify that spec content accurately reflects the original documents:
- Compare core/project-overview against AGENTS.md sections 1–3, CLAUDE.md Quick Reference
- Compare core/architecture against AGENTS.md sections 4
- Compare core/data-formats against AGENTS.md section 5
- Compare core/constraints against AGENTS.md section 7, CLAUDE.md Important
- Compare skill/layout against .claude/commands/skill-layout.md
- Compare skill/video-player against .claude/commands/skill-video-player.md
- Compare skill/minigame against .claude/commands/skill-minigame.md
- Compare workflow against AGENTS.md section 8, CLAUDE.md Workflow

Flag any discrepancies and update specs if needed.

## Phase 2: Archive to OpenSpec

### Task 2.1: Archive the change
```bash
cd D:\Projects\__AI\english-with-fun
openspec archive migrate-specs-to-openspec
```
Expected outcome: Change is archived; specs are copied to openspec/specs/ with their final form.

### Task 2.2: Verify archived specs
```bash
openspec list --specs --json
```
Confirm that all 8 capability specs now appear in the project's spec inventory:
- core/project-overview
- core/architecture
- core/data-formats
- core/constraints
- skill/layout
- skill/video-player
- skill/minigame
- workflow

## Phase 3: Document and Reference

### Task 3.1: Update CLAUDE.md to reference OpenSpec specs
Add a section at the end of CLAUDE.md (after current content):

```markdown
## Specification Repository

All project specifications are now maintained in OpenSpec:
- Architecture and core concepts: `openspec/specs/core/`
- Role and skill specifications: `openspec/specs/skill/`
- Development workflow: `openspec/specs/workflow/`

To view specs: `openspec show "<spec-id>" --type spec`
To list all specs: `openspec list --specs`

CLAUDE.md and AGENTS.md remain in the repository for reference but are superseded by OpenSpec specs.
```

### Task 3.2: Update AGENTS.md to reference OpenSpec specs
Add a section at the end of AGENTS.md (after current content):

```markdown
## OpenSpec Specifications

This document is now superseded by OpenSpec specifications. For the authoritative current specifications, refer to:

**Run:**
```bash
openspec list --specs
```

**View a specific spec:**
```bash
openspec show "core/architecture" --type spec
openspec show "skill/layout" --type spec
# ... etc
```

AGENTS.md remains in the repository for historical reference and as context for AI agents during the transition period.
```

### Task 3.3: Update .claude/commands/README or create one
Create or update .claude/commands/README.md:

```markdown
# AI Skills

These skills provide detailed role-based guidance for implementing specific project areas.

## Transition to OpenSpec

As of <date>, specifications have been migrated to OpenSpec. While these skill files remain active:
- They provide immediate role and constraint guidance
- They may reference OpenSpec specs at openspec/specs/skill/ for authoritative requirements
- Going forward, new requirements are captured in OpenSpec; these files are maintained for backward compatibility

## Skills

- `/skill-layout` — React application shell and layout
- `/skill-video-player` — Vanilla JS video player module
- `/skill-minigame` — WebGL coin minigame module

To read skill guidance: check .claude/commands/skill-*.md

To view authoritative specs: run `openspec show "skill/layout" --type spec` (etc.)
```

### Task 3.4: Commit changes to git
```bash
git add openspec/
git add CLAUDE.md AGENTS.md .claude/commands/
git commit -m "Migrate specifications to OpenSpec

- Create 8 capability specs in openspec/specs/core/ and openspec/specs/skill/
- Organize by domain: core (shared), skill (role-based), workflow
- Preserve original CLAUDE.md, AGENTS.md, .claude/commands/ for backward compatibility
- Update documentation to reference OpenSpec as the authoritative spec repository
- Original markdown files remain for AI context during transition
"
```

## Phase 4: Validation and Sign-Off

### Task 4.1: Verify OpenSpec specs are discoverable
```bash
openspec list --specs --json | jq '.specs | length'
```
Expected: output is 8 (or more if other specs exist in the project).

### Task 4.2: Test a spec view command
```bash
openspec show "core/architecture" --type spec
```
Verify the spec displays correctly with all requirements and scenarios.

### Task 4.3: Manual acceptance
- Project lead or designated reviewer:
  - Skims all 8 specs for accuracy
  - Confirms original files remain unchanged and working
  - Approves the archive
  - Merges the PR (if applicable)

## Success Criteria

- [x] All 8 spec files exist in openspec/changes/migrate-specs-to-openspec/specs/
- [x] `openspec validate` passes with no critical errors
- [x] Spec content matches originals (core, skill, workflow)
- [x] Specs are archived to openspec/specs/ (durable storage)
- [x] CLAUDE.md, AGENTS.md, .claude/commands/ updated with references to OpenSpec
- [x] Commit pushed with change log
- [x] No code or active workflows are broken (original files still present, still referenced)
