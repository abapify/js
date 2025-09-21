# ADK Migration Plan (Spec-First)

Goal: Rebuild ADK on top of xmld with clean, spec-driven architecture. Create a new package under `packages/adk2/` (temporary) and only remove/rename legacy ADK after the new ADK is feature-complete.

## Principles

- Spec-first: write specs, review, then implement
- xmld as the only generic decorator/metadata engine (no SAP specifics inside xmld)
- ESNext/Node 22+, native APIs preference; extensionless imports
- No "-old" folders; legacy ADK kept as-is until the new ADK is ready
- Clean separation: ADK domain objects compose an XML representation (`xmlRep`) and delegate serialization

## Scope (Phase A)

- Namespaces: `adtcore`, `atom`, `abapsource`, `abapoo`, `intf`, `class`, `ddic`
- Base XML classes:
  - `BaseXML`: `@adtcore core`, `@atom link[]`, shared parsing helpers
  - `OoXML`: extends `BaseXML` + `@abapsource source`, `@abapoo oo`
- Object XMLs: `InterfaceXML`, `ClassXML`, `DomainXML`
- ADK domain objects (client-agnostic) mapping to `xmlRep`
- Serialization: xmld `toSerializationData` → `toFastXMLObject` → `fast-xml-parser` `XMLBuilder`
- Parsing: `fast-xml-parser` `XMLParser` to plain object + class-specific mappers (reusing base helpers)

## Out of scope (Phase B+)

- Additional ADT namespaces beyond Phase A
- Extended OO features (components, methods, visibility, etc.)
- CLI integration changes (only ensure compatibility)

## Deliverables

- Spec document: ADK on xmld (architecture, types, decorators, parsing/serialization)
- New package skeleton: `packages/adk2/` (scaffolded only after spec approval)
- Unit tests: round-trip vs fixtures
- E2E test harness using xmld + SAP XML plugin

## Milestones & Acceptance

1. Spec & Planning

- Spec committed and reviewed
- Migration plan persisted (this document)

2. Foundations

- `BaseXML`, `OoXML` implemented per spec
- Parsers: `parseAdtCoreAttributes`, `parseAtomLinks`, `parseAbapSourceAttributes`, `parseAbapOOAttributes`
- Unit tests green

3. Namespaces (Phase A)

- Thin typed wrappers over xmld namespace decorator
- No domain logic in xmld

4. Object XMLs

- `InterfaceXML`, `ClassXML`, `DomainXML` re-implemented
- Round-trip tests vs `packages/adk/fixtures/*.xml` pass (normalized compare)

5. ADK Domain Objects

- `AdkObject` interface stable; domain classes compose `xmlRep` and delegate `toAdtXml()`
- Static `fromAdtXml()` returns domain instances via XML classes

6. Integration & Cleanup

- Object registry uses new constructors
- E2E SAP XML plugin works (XML declaration, namespaces, attr order normalized in tests)
- Legacy decorators removed after the new ADK is ready

## Risks & Mitigations

- Namespace edge-cases: cover with fixtures and add normalization in tests
- XML ordering differences: compare parsed trees, not raw strings
- Scope creep: phase by namespaces; spec-reviewed changes only

## Open Questions (for spec review)

- Root style: `@root('ns:element')` vs `@root('element')` + class `@namespace('ns', uri)`
- Additional namespaces to include in Phase A?
- Keep existing `Kind` enum and `objectRegistry` design unchanged?

## Tracking

- GitHub issues mapped by labels: status:ready → status:in-progress → status:review → status:done
- Update `docs/planning/current-sprint.md` after each milestone
