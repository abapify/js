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
