# Design

## Context

The project currently documents all requirements in markdown files at the project root:
- CLAUDE.md — project constraints and workflow
- AGENTS.md — architectural overview, data formats, and constraints
- .claude/commands/skill-*.md — detailed role and responsibility specs for AI agents

These files are loaded into the AI context on each session and serve as the source of truth for the current implementation. They work well but are difficult to:
- Version independently from code
- Link and reference across projects
- Share with non-implementation stakeholders
- Integrate with other specification systems

See proposal.md for the motivation. This design describes how to migrate the content into OpenSpec while preserving current system functionality.

## Goals / Non-Goals

**Goals:**
- Extract all specification content from CLAUDE.md, AGENTS.md, and .claude/commands/*.md into OpenSpec capability specs
- Organize specs into logical capabilities (core, skill) that mirror the architecture
- Create a complete spec structure usable for future reference, audits, and requirement changes
- Preserve the original markdown files so current AI skills and code execution are not affected
- Establish OpenSpec as the authoritative specification layer going forward

**Non-Goals:**
- Modify or update implementation code during this migration
- Change how AI skills are invoked or how CLAUDE.md is used as the entry point
- Remove or retire CLAUDE.md, AGENTS.md, or .claude/commands/ files
- Perform a major spec rewrite; focus is on faithful content transfer
- Set up OpenSpec-driven automation or CI/CD (scope is planning only)

## Decisions

### Decision 1: Keep original files in place while adding OpenSpec layer

**Rationale:**
- Minimizes risk to current system. AI skills reference CLAUDE.md and AGENTS.md; removing those files would break active development.
- Allows gradual transition: OpenSpec specs become the source of truth over time; originals can be retired later.
- Supports existing workflows without interruption.

**Alternative rejected:**
- Replace .claude/commands/ files with OpenSpec spec references immediately. This risks breaking skill invocation and would require updating how skills are discovered.

**Implementation:**
- OpenSpec specs live in openspec/specs/
- CLAUDE.md, AGENTS.md, and .claude/commands/ remain unchanged in the repo
- Documentation can reference OpenSpec specs as canonical, but code and skills point to existing files until explicitly migrated

---

### Decision 2: Organize specs into two domains: core and skill

**Rationale:**
- `core/*` covers architectural principles, data formats, and constraints that apply across all modules.
- `skill/*` maps to the three AI roles and responsibilities in .claude/commands/.
- This organization mirrors the project structure and makes specs easy to navigate.

**Alternative rejected:**
- Flat structure (all specs at specs/ root) would be harder to discover and relate to roles.
- Per-module structure (layout, video-player, minigame as peers under specs/) would blur the distinction between shared core concepts and role-specific guidance.

**Specs created:**
- core/project-overview — project goals, stack, structure
- core/architecture — core principles, module interface, categories
- core/data-formats — JSON schemas and rendering principles
- core/constraints — development rules and guardrails
- skill/layout — React responsibilities
- skill/video-player — Vanilla JS player responsibilities
- skill/minigame — WebGL coin game responsibilities
- workflow — development phases and workflow

---

### Decision 3: One capability per spec file; focus on behavior, not implementation

**Rationale:**
- Spec-driven schema expects one capability per spec file. This keeps specs focused and testable.
- Capabilities represent durable system behaviors, not implementation tasks.
- Requirements include scenarios (WHEN/THEN) to make them testable.

**Alternative rejected:**
- Monolithic spec with all requirements in one file. Harder to version, reference, and modify selectively.

**Implementation:**
- Each capability in the proposal maps to exactly one spec file.
- Scenarios are written as test cases: WHEN condition, THEN expected outcome.
- Specs avoid library/framework names and internal details where possible.

---

### Decision 4: Archive-ready spec delta format

**Rationale:**
- Deltas are new capabilities, so they start with `## Purpose` (requirements omitted if it's a modified capability).
- Each spec uses ADDED Requirements header, making them future-ready for archive and diff.
- Scenarios use exactly 4 hashtags (`####`) to meet OpenSpec validation rules.

**Alternative rejected:**
- Flat markdown lists instead of spec-driven format. OpenSpec validation would fail; integration with OpenSpec tooling would be lost.

**Implementation:**
- Spec deltas include Purpose, ADDED Requirements, Scenarios
- Scenarios follow WHEN/THEN format with 4 hashtags
- Requirement descriptions kept under 500 characters for strict validation

---

## Risks / Trade-offs

**[Risk] Dual source-of-truth temptation**
→ Mitigation: Clear decision to keep originals in place and mark OpenSpec as canonical going forward. During transition, both sources are maintained; future changes go to OpenSpec, and original files are updated by hand if needed.

**[Risk] Content divergence over time**
→ Mitigation: Document that CLAUDE.md, AGENTS.md, and .claude/commands/ are legacy; new requirement changes are made in OpenSpec specs. A periodic audit can catch divergence. Automation (CI job to cross-reference) could be added later.

**[Risk] Spec discovery — engineers don't know specs exist**
→ Mitigation: Update CLAUDE.md to reference the OpenSpec specs location and link to key specs. AI skills can reference both the original prompt and the OpenSpec spec.

**[Risk] Incomplete migration — some nuances from original files might be lost**
→ Mitigation: Specs are written by human (AI assisted) from the source files, paragraph by paragraph. A review pass checks for missed requirements. The originals remain in the repo, so nothing is truly lost.

**[Risk] OpenSpec schema constraints (scenario format, requirement length)**
→ Mitigation: Initial write-through follows schema rules strictly. Requirements longer than 500 chars are split into multiple requirements with shared scenarios. Schema validates during archive.

## Migration Plan

### Phase 1: Create OpenSpec change (already completed)
- Run `openspec new change migrate-specs-to-openspec`
- Write proposal.md describing the migration
- Create 8 spec files in specs/ (core and skill capabilities)
- Write design.md (this document)
- Write tasks.md (implementation plan — not needed since this is planning-only)

### Phase 2: Validate and review (after implementation)
- Run `openspec validate` to ensure all specs meet schema rules
- Request human review of each spec delta for accuracy and completeness
- Spot-check that scenarios are testable

### Phase 3: Archive and deploy (future)
- When ready, run `openspec archive migrate-specs-to-openspec` to create durable specs in openspec/specs/
- Commit the archived specs to the repo
- Update CLAUDE.md and AGENTS.md to reference OpenSpec specs
- Consider retiring original .claude/commands/ in favor of OpenSpec (or keep both for backward compatibility)

### Phase 4: Ongoing — migrate future changes (future)
- New requirements/changes are proposed and approved in OpenSpec
- Original files are updated manually if needed (or eventually deprecated)
- OpenSpec becomes the single source of truth for specifications

## Open Questions

- **When should we retire the original CLAUDE.md and AGENTS.md?** Suggested answer: after 1–2 cycles of using OpenSpec for active changes, so the team is comfortable with the new workflow.
- **Should we set up a CI job to cross-check CLAUDE.md against OpenSpec specs?** Suggested answer: defer until after archive; manual review for now.
- **Are there requirements in .claude/commands/ that are not captured in the core/skill specs?** Suggested answer: a final audit pass will catch any gaps before archive.
