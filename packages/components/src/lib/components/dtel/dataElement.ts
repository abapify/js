import { Component } from "../component"
import { ComponentType } from "../componentTypes";
import { DataElementInput } from "./dataElementInput";
import { RefKind } from "./refKind";
import { RefType } from "./refType";


export class DataElement extends Component<DataElementInput> {
    override get type(): ComponentType {
        return ComponentType.dataElement;
    }
    override get id(): string {
        return this.input.name
    }
    override get abapgitSerializer(): string {
        return 'LCL_OBJECT_DTEL';
    }
    override toAbapgit() {
        const input = this.input;

        const dtel = {
            DD04V: {
                ROLLNAME: input.name,
                DDTEXT: input.description,
                DDLANGUAGE: 'E',
                SCRTEXT_S: input.labels?.short,
                SCRTEXT_M: input.labels?.medium,
                SCRTEXT_L: input.labels?.long,
                REPTEXT: input.labels?.heading,
                SCRLEN1: input.labels?.short?.length,
                SCRLEN2: input.labels?.medium?.length,
                SCRLEN3: input.labels?.long?.length,
                HEADLEN: input.labels?.heading?.length,
                DTELMASTER: 'E',
                REFKIND: input.refKind
            }
        };

        switch (input.refKind) {

            case RefKind.DOMAIN:

                {
                    const domain = typeof input.domain === "string" ? ({ name: input.domain }) : input.domain;

                    Object.assign(dtel.DD04V, {
                        DOMNAME: domain?.name
                    });
                }

                break;

            case RefKind.REFERENCE:

                switch (input.refType) {
                    case RefType.BUILT_IN_DICTIONARY_TYPE:

                        Object.assign(dtel.DD04V, typeof input.builtInType === "string" ? {
                            DOMNAME: input.builtInType
                        } : {
                            DOMNAME: input.builtInType.type,
                            LENG: input.builtInType.length,
                            OUTPUTLEN: input.builtInType.outputLength,
                            DECIMALS: input.builtInType.decimals
                        })

                        break;

                    default:

                        Object.assign(dtel.DD04V, {
                            REFTYPE: input.refKind,
                            DOMNAME: input.referencedType
                        })

                        break;
                }

                break;

            case RefKind.DIRECT_TYPE_ENTRY:

                Object.assign(dtel.DD04V, typeof input.builtInType === "string" ? {
                    DATATYPE: input.builtInType
                } : {
                    DATATYPE: input.builtInType.type,
                    LENG: input.builtInType.length,
                    OUTPUTLEN: input.builtInType.outputLength,
                    DECIMALS: input.builtInType.decimals
                });

                break;

        }

        return dtel;
    }
}

export * from "./dataElementInput";
