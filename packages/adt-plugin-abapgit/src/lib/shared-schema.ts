/**
 * Shared XML building utilities for abapGit format
 * 
 * abapGit uses a specific XML structure:
 * <abapGit version="v1.0.0" serializer="LCL_OBJECT_*" serializer_version="v1.0.0">
 *   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 *     <asx:values>
 *       <!-- Object-specific content -->
 *     </asx:values>
 *   </asx:abap>
 * </abapGit>
 */

/**
 * Escape XML special characters
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Build a simple XML element with text content
 */
export function xmlElement(tag: string, content: string | undefined): string {
  if (content === undefined || content === '') return '';
  return `<${tag}>${escapeXml(content)}</${tag}>`;
}

/**
 * Build complete abapGit XML envelope
 * 
 * @param valuesContent - The XML content to go inside <asx:values>
 * @param serializer - The serializer class name (e.g., "LCL_OBJECT_DEVC")
 * @returns Complete abapGit XML string
 */
export function buildAbapGitEnvelope(
  valuesContent: string,
  serializer: string
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="${serializer}" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
${valuesContent}
  </asx:values>
 </asx:abap>
</abapGit>`;
}
