import { fromAbapJson } from './asjson';

const abapJson = {
  "I": 123,
  "I_REF": {
    "%ref": "#d16"
  },
  "%heap": {
    "d16": {
      "%type": "xsd:int",
      "%val": 123
    }
  }
};

const abapJsonEmbedded = {
  "DATA":
  {
    "I": 123,
    "I_REF":
    {
      "%type": "xsd:int",
      "%val": 123
    }
  }
};

const dataAsRef = {
  "DATA":
  {
    "%ref": "#d1"
  },
  "%heap":
  {
    "d1":
    {
      "%type": "http://www.sap.com/abapxml/types/program/ZTEST_HEAP:PAYLOAD_TS",
      "%val":
      {
        "I": 123,
        "I_REF":
        {
          "%ref": "#d2"
        }
      }
    },
    "d2":
    {
      "%type": "xsd:int",
      "%val": 123
    }
  }
}

const dataAsRefEmbedded = {
  "DATA":
  {
    "%type": "http://www.sap.com/abapxml/types/program/ZTEST_HEAP:PAYLOAD_TS",
    "%val":
    {
      "I": 123,
      "I_REF":
      {
        "%type": "xsd:int",
        "%val": 123
      }
    }
  }
}


const targetObject = {
  "I": 123,
  "I_REF": 123
};

describe('ABAP asJSON parser', () => {
  it('should resolve data references as fully typed objects', () => {
    expect(fromAbapJson(abapJson)).toMatchObject(targetObject);
  });
  it('should support embedded data references', () => {
    expect(fromAbapJson(abapJsonEmbedded)).toMatchObject({ DATA: targetObject });
  });
  it('should support nested data references', () => {
    expect(fromAbapJson(dataAsRef)).toMatchObject({ DATA: targetObject });
  });
  it('should support nested embedded data references', () => {
    expect(fromAbapJson(dataAsRefEmbedded)).toMatchObject({ DATA: targetObject });
  });
});
