# Workspace Rules for Abapify-JS

## Specification-Driven Development Rule

### Core Philosophy

- **Specifications are design contracts** (stable, versioned, change-resistant)
- **Documentation describes implementation** (living, refactorable)
- **Specs define WHAT and WHY before coding HOW**

### Critical Review Process for Spec Changes

#### Additions vs Modifications

- **Additions**: New features can be added to specs with standard review
- **Modifications**: Changes to existing specs require critical review and strong justification
- **Breaking Changes**: Must introduce new spec version, never modify existing version

#### AI Assistant Rule

**Be extremely critical of any proposed spec changes vs additions**

### Specification Compliance Workflow

1. **Check Existing Specs**: Before any code changes, review relevant specifications in `/specs/`
2. **Spec Alignment**: Ensure proposed changes align with documented specifications
3. **Missing Specs**: If no spec exists, create specification BEFORE implementation
4. **Spec Negotiation**: If changes conflict with specs, negotiate spec updates FIRST
5. **No Spec Violations**: Never implement code that contradicts existing specifications

### Current Specifications

- `/specs/cicd/abap-cicd-pipeline.md` - Core ABAP CI/CD architecture and principles
- `/specs/oat/` - OAT format specifications and documentation

### Missing Critical Specs (Must Be Created)

- **ADK concept and architecture specification**
- **OAT+ADK integration specification**
- **ADT CLI commands behavioral specification**

### Enforcement

This rule applies to all AI assistants and team members working in this workspace. Any code implementation must have corresponding specifications, and any changes to existing specs require critical review and strong justification.
