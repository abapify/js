const package_abapgit = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DEVC" serializer_version="v1.0.0">
  <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
      <DEVC>
        <CTEXT>test package</CTEXT>
      </DEVC>
    </asx:values>
  </asx:abap>
</abapGit>
`;

import { toAbapGitXML } from '../abapgit/abapgit';

describe('package', () => {
  test('abapGit', () => {
    expect(
      toAbapGitXML({ DEVC: { CTEXT: 'test package' } }, 'LCL_OBJECT_DEVC')
    ).to.eq(package_abapgit);
  });
});
