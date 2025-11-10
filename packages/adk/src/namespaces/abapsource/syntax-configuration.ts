import { xml, root, element, namespace } from '../../decorators';
import { AtomLink } from '../atom';

/**
 * ABAP Source syntax language element
 */
@xml
@root('abapsource:language')
@namespace('abapsource', 'http://www.sap.com/adt/abapsource')
export class SyntaxLanguage {
  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element
  version!: string;

  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element
  description!: string;

  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element
  supported?: string;

  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element
  etag?: string;

  @element
  link?: AtomLink;
}

/**
 * ABAP Source syntax configuration element
 */
@xml
@root('abapsource:syntaxConfiguration')
@namespace('abapsource', 'http://www.sap.com/adt/abapsource')
export class SyntaxConfiguration {
  @element
  language!: SyntaxLanguage;
}
