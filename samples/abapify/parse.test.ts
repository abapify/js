// parse samples/abapify/ZAGE_FIXED_VALUES.doma.yml

import * as YAML from 'yaml'
import test from "node:test";
import { readFile } from 'fs/promises';
import path from "node:path"
import { DomainAdtAdapter } from '@abapify/adk';

const filepath = "ZAGE_FIXED_VALUES.doma.yml";

// unit test using native node
test("parse ZAGE_FIXED_VALUES.doma.yml", async (t) => {

    const file = await readFile(path.join(__dirname, filepath), 'utf8');

    const doc = YAML.parseDocument(file.toString()).toJSON();

    console.log(JSON.stringify(doc, null, 2));

    //render ADT XML

    const adtJson = new DomainAdtAdapter(doc).toAdtXML();
    console.log(adtJson);



})