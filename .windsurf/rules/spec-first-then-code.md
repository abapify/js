---
trigger: model_decision
description: When making any changes for any of spec-driven packages
---

# Specification-Driven Development Rule

## Core Philosophy

- Specifications are design contracts (stable, versioned, change-resistant)
- Documentation describes implementation (living, refactorable)
- Specs define WHAT and WHY before coding HOW

## Critical Review Process

- **Additions**: New features can be added to specs with standard review
- **Modifications**: Changes to existing specs require critical review and strong justification
- **Breaking Changes**: Must introduce new spec version, never modify existing version
- **AI Assistant Rule**: Be extremely critical of any proposed spec changes vs additions

## Workflow

1. Check existing specs in ./specs/ before any code changes
2. Create specification BEFORE implementation if missing
3. Negotiate spec updates FIRST if changes conflict with specs
4. Never implement code that contradicts existing specifications

## List of spec-driven packages

- ADK ( ABAP development kit, TS native way to work with ABAP code and other objects )
- OAT ( Alternative to AbapGit and gCTS way of representing ABAP objects in a file tree)
- ADT CLI ( alternative to piper CLI solution to operate with ABAP backend )
