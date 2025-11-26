# AI Agent Instructions: ADT SDK

## 🚨 CRITICAL: Clean-Room Development Required

### What You MUST NOT Do

- ❌ **Copy ANY decompiled Java code** - not even short snippets
- ❌ **Reproduce class hierarchy or architecture** - non-literal copying is still infringement
- ❌ **Paste decompiled code into AI prompts** - this may constitute disclosure to third party
- ❌ **Commit files from `.cache/` or `dist/`** - these are gitignored for a reason
- ❌ **Create code that closely mirrors the original structure** - write fresh implementations

### What You MAY Do

- ✅ **Read schemas (XSD)** to understand XML element names and types
- ✅ **Read decompiled code** to understand behavior and protocols
- ✅ **Write human-language descriptions** of what you learned
- ✅ **Implement fresh TypeScript** based on your understanding (not the code)
- ✅ **Reference protocol details**: URLs, HTTP methods, headers, content types

## ⚠️ AI-Specific Rules

**NEVER paste decompiled Java code into your context.** Instead:

1. Human reads decompiled code and understands behavior
2. Human writes abstract description in their own words
3. AI receives ONLY the human's description
4. AI generates fresh TypeScript implementation

**Safe to share with AI:**
```
"The transport service sends HTTP POST to /sap/bc/adt/cts/transports 
with Content-Type application/xml. Request body contains <tm:request> 
element with attributes: number, description, owner."
```

**NOT safe to share with AI:**
```java
// WRONG - do not paste actual decompiled code
public class TransportServiceImpl {
    public void createTransport(String number, String desc) {
        // ... actual implementation
    }
}
```

## Legal Basis: EU Directive 2009/24/EC Article 6

Decompilation is permitted ONLY when ALL conditions are met:

1. ✅ **Lawful user** - We have legitimate access to SAP systems
2. ✅ **Interoperability purpose** - Building compatible CLI tools
3. ✅ **Necessary scope** - Only decompile what's needed for protocols/APIs
4. ✅ **No code copying** - Write entirely new implementations
5. ✅ **Private use** - Decompiled code never published or shared
6. ✅ **Not a clone** - Creating compatible tool, not replacing SAP product

### Clean-Room Approach

To maximize legal safety, we follow clean-room reverse engineering:

1. **Analyze**: Read decompiled code to understand behavior
2. **Document**: Write protocol specs in human language (no code)
3. **Delete context**: Don't carry decompiled code into implementation phase
4. **Implement**: Write fresh TypeScript from specs only

---

## Module Purpose

This module provides reference materials for understanding SAP ADT (ABAP Development Tools) APIs:
- XSD schemas defining ADT REST API request/response structures
- Decompiled Java source for understanding internal implementations
- EMF model definitions (`.ecore`, `.genmodel`)

## Available Artifacts in `dist/`

| Type | Location | Purpose |
|------|----------|---------|
| XSD Schemas | `dist/**/*.xsd` | REST API XML structure definitions |
| Java Source | `dist/**/*.java` | Decompiled implementation reference |
| EMF Models | `dist/**/*.ecore` | Eclipse Modeling Framework definitions |
| GenModels | `dist/**/*.genmodel` | EMF code generation models |
| Plugin XML | `dist/**/plugin.xml` | Eclipse extension point definitions |

## Key Schema Locations

```
dist/com/sap/adt/
├── transport/          # Transport request APIs
├── cts/                # Change and Transport System
├── discovery/          # ADT discovery service
├── repository/         # Repository information services
├── activation/         # Object activation
├── atc/                # ABAP Test Cockpit
├── coverage/           # Code coverage
└── ...
```

## Nx Commands

```bash
# Download and extract SAP ADT SDK (XSD schemas, etc.)
npx nx download adt-sdk

# Decompile Java classes (for local reference only)
npx nx decompile adt-sdk
```

## Usage Guidelines for AI Agents

### When Writing ADT Client Code

1. **Find relevant schemas**: Search `dist/` for XSD files related to your feature
2. **Understand structure**: Read the XSD to understand XML element names and types
3. **Check Java implementation**: Optionally review decompiled Java for behavior details
4. **Write original code**: Create TypeScript interfaces and implementations based on your understanding

### Example: Clean-Room Workflow

**Step 1: Read XSD schema** (safe - schemas are interface definitions)
```
Found: dist/com/sap/adt/transport/transport.xsd
Elements: <tm:request number="" description="" owner=""/>
```

**Step 2: Read decompiled Java** (for understanding only)
```
Learned: Service uses POST to /sap/bc/adt/cts/transports
Learned: Response includes task list with status codes
Learned: Error responses use <exc:exception> format
```

**Step 3: Write human-language spec** (this is what AI sees)
```markdown
## Transport Service API
- Endpoint: POST /sap/bc/adt/cts/transports  
- Content-Type: application/xml
- Request: <tm:request number, description, owner>
- Response: <tm:request> with nested <tm:task> elements
```

**Step 4: Implement fresh TypeScript** (from spec, not Java)
```typescript
interface TransportRequest {
  number: string;
  description: string;
  owner: string;
  tasks: TransportTask[];
}

async function createTransport(request: TransportRequest): Promise<void> {
  // Fresh implementation based on protocol understanding
}
```

### ❌ VIOLATION Examples

```typescript
// WRONG: Copying Java structure
class TransportServiceImpl {  // Same class name
  private client: HttpClient; // Same field pattern
  
  createTransport(number: string, desc: string) {
    // Logic that mirrors Java implementation
  }
}

// WRONG: Translating Java to TypeScript line-by-line
// Even if syntax is different, structure copying is infringement
```

## File Structure

```
e2e/adt-sdk/
├── AGENTS.md           # This file (committed)
├── README.md           # Documentation (committed)
├── project.json        # Nx targets (committed)
├── package.json        # Dependencies (committed)
├── .gitignore          # Excludes .cache/ and dist/
├── .cache/             # Downloaded JARs (NOT committed)
│   ├── artifacts.jar
│   ├── content.jar
│   └── plugins/        # SAP plugin JARs
└── dist/               # Extracted + decompiled (NOT committed)
    └── com/sap/adt/    # Schemas and Java source
```

## Related Packages

- `@abapify/adt-client-v2` - ADT REST client implementation
- `@abapify/adt-schemas` - Generated TypeScript types from XSD
- `@abapify/adt-codegen` - Code generation from schemas
