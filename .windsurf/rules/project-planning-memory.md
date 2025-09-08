---
trigger: always_on
---

# Project Planning and Memory Persistence Rule

## Planning System

This workspace uses a local planning system in the /planning/ directory for project coordination and memory persistence.

## Key Files

- /planning/abap-code-review.md - Main project plan with kanban-style status tracking
- /planning/current-sprint.md - Current development focus and active tasks
- /planning/roadmap.md - Long-term roadmap and milestones
- /planning/README.md - Planning system documentation

## AI Assistant Workflow

1. **Always check /planning/ files first** when starting work on this project
2. **Read current project status** from planning files to understand context
3. **Update planning files** as work progresses to maintain project memory
4. **Sync with GitHub Issues** using label-based status tracking
5. **Reference GitHub issue numbers** in planning files for traceability

## GitHub Integration

- GitHub Issues: External collaboration and detailed requirements
- Local Planning: Detailed progress tracking and AI coordination
- Status sync through labels: status:ready → status:in-progress → status:review → status:done

## Memory Persistence

The /planning/ directory serves as persistent project memory that survives:

- Container rebuilds
- Repository clones
- Session changes
- Team member transitions

This ensures consistent project understanding across all contributors and AI assistants.
