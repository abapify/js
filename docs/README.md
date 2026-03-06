# Project Documentation Structure

This directory contains all project documentation organized in a logical hierarchy for easy navigation and maintenance.

## Structure Overview

```
docs/
├── specs/              # Design Contracts (WHAT & WHY)
├── planning/           # Project Management (WHEN & HOW)
├── history/            # Historical Context (WHAT HAPPENED)
├── roadmaps/           # Long-term Vision (WHERE WE'RE GOING)
└── README.md          # This file
```

## Directory Purposes

### `/specs/` - Design Contracts

**Stable, versioned specifications that define system architecture**

- Architecture specifications
- API contracts and interfaces
- Technical design documents
- Integration specifications
- **Change Policy**: Requires critical review, prefer additions over modifications

### `/planning/` - Project Management

**Dynamic project coordination and execution tracking**

- Current sprint status
- Implementation plans
- Task breakdowns
- Dependency management
- **Update Frequency**: Daily/weekly as work progresses

### `/history/` - Historical Context

**Detailed records of completed work and decisions**

- Daily work summaries
- Technical decision logs
- Implementation retrospectives
- Lessons learned
- **Purpose**: Preserve institutional knowledge for future reference

### `/roadmaps/` - Long-term Vision

**Strategic direction and future planning**

- Product roadmaps
- Technology evolution plans
- Feature prioritization
- Strategic initiatives
- **Scope**: Quarterly/yearly planning horizon

## Navigation Guidelines

### For Current Work

1. Check `/planning/current-sprint.md` for active tasks
2. Reference relevant `/specs/` for implementation contracts
3. Update `/history/` with daily progress

### For New Features

1. Start with `/roadmaps/` for strategic alignment
2. Create specifications in `/specs/`
3. Plan implementation in `/planning/`
4. Document progress in `/history/`

### For Context Research

1. Search `/history/` for similar past work
2. Review `/specs/` for architectural constraints
3. Check `/planning/` for current priorities

## Integration with Development

This documentation structure integrates with:

- **Git workflow**: Daily summaries track actual commits and changes
- **Issue tracking**: Planning documents reference GitHub issues
- **Code reviews**: Specifications provide review criteria
- **AI assistance**: Structured context for better collaboration

## Maintenance

- **Specs**: Update only with formal review process
- **Planning**: Update as work progresses
- **History**: Add daily summaries consistently
- **Roadmaps**: Review quarterly, update as needed
