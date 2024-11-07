

import { XMLBuilder } from "fast-xml-parser";

export function toAbapGitXML(data: unknown, serializer: string): string {

    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

    const payload = {
        "?xml": {
            "@_version": "1.0",
            "@_encoding": "utf-8"
        },
        "abapGit": {
            "asx:abap": {
                "asx:values": data,
                "@_xmlns:asx": "http://www.sap.com/abapxml",
                "@_version": "1.0"
            },
            "@_version": "v1.0.0",
            "@_serializer": serializer,
            "@_serializer_version": "v1.0.0"
        }
    }

    const xml = builder.build(payload);

    return xml;

}