//descirbe scenario

# TS to XML transformation scenario

- we import `abapgit_examples.devc.json`
- we define fast-xml-parser compatible schema (target `abapgit_examples.devc.xml`) using `jotl-codex`
- we transform the JSON representation to a fast-xml-parser structure and build XML via `XMLBuilder`
- `tests/fast-xml-parser/abap-package-transformation.test.ts` compares the generated XML (after parsing) with the canonical fixture
- they must be structurally identical
