# [POC] Compile ABAP artifacts from CAP CDS models

## The idea

The idea is to compile ABAP artifacts from CAP CDS models.

For example if we have an existing model like this:

```cds
entity projects {
    key id: String;
    type: projectTypes:projectType;
    status: ProjectStatus;
    description: String;

```

we can annotate it with ABAP annotations like this:

```cds
using { projects } from './projects';

@abap.ddic.table: 'ZPROJECTS'
annotate projects with {
     @abap.ddic: {
        dataElement: {
            generate: true,
            name: 'ZPROJECT_ID',
            domain: {
                description: 'Project Id',
                dataType: 'CHAR',
                length: 32
            }
        }
    }
    id;
    ...
};
```

and then compile it to ABAP artifacts like this:

data element ZPROJECT_ID.dtel.xml

```xml
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
  <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
      <DD04V>
        <ROLLNAME>ZPROJECT_ID</ROLLNAME>
        <DDLANGUAGE>E</DDLANGUAGE>
        <DTELMASTER>E</DTELMASTER>
      </DD04V>
    </asx:values>
  </asx:abap>
</abapGit>
```

and corresponding domain ZPROJECT_ID:

```xml
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
  <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
      <DD01V>
        <DOMNAME>ZPROJECT_ID</DOMNAME>
        <DATATYPE>CHAR</DATATYPE>
        <LENG>32</LENG>
      </DD01V>
    </asx:values>
  </asx:abap>
</abapGit>
```

Of course - there will be much more properties and artifacts supported, this is just the simplest example.

## What are benefits of this approach?

- we can start developing ABAP artifacts using existing tools such as VS Code, CDS extension like a normal CAP project
- we can reuse existing CAP models and deploy them to ABAP system
- working in VS Code opens up for us capabilities to use AI/GPT tools
- we can build ABAP artifacts using CI/CD pipelines, so our data models will be trully git-driven

## What are challenges we might face?

- It's a general problem - direct change of git-driven artifacts ideally should not be allowed in the system
- There may be a risk of not just loosing the code, but since we talk about data models also data. It should be used very carefully
- Reusing annotations themselves, like we want to reuse same data element. So maybe some reusable types should be used.

## How far we can go with ths approach?

if we can generate data models - nothing would stop us from generating other artifacts. For example what we can generate more:

- CDS views with annotations and associations
- RAP models
- Service definitions
- Service bindings
