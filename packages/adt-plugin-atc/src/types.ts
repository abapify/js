/**
 * ATC Plugin Types
 */

/**
 * Options for running ATC checks
 */
export interface AtcCheckOptions {
  /** Object URIs or names to check */
  objects: string[];
  /** ATC check variant to use */
  variant?: string;
  /** Maximum number of findings to return */
  maxFindings?: number;
}

/**
 * ATC finding severity levels
 */
export type AtcSeverity = 'error' | 'warning' | 'info';

/**
 * Individual ATC finding
 */
export interface AtcFinding {
  /** Unique identifier for the finding */
  id: string;
  /** Check ID that produced this finding */
  checkId: string;
  /** Check title/name */
  checkTitle: string;
  /** Finding message */
  message: string;
  /** Severity level */
  severity: AtcSeverity;
  /** Object URI where finding was detected */
  objectUri: string;
  /** Object name */
  objectName: string;
  /** Object type */
  objectType: string;
  /** Line number (if applicable) */
  line?: number;
  /** Column number (if applicable) */
  column?: number;
}

/**
 * Result of an ATC check run
 */
export interface AtcRunResult {
  /** Run identifier */
  runId: string;
  /** Timestamp of the run */
  timestamp: string;
  /** Total number of findings */
  totalFindings: number;
  /** Number of errors */
  errorCount: number;
  /** Number of warnings */
  warningCount: number;
  /** Number of info messages */
  infoCount: number;
  /** List of findings */
  findings: AtcFinding[];
}

/**
 * ATC check variant
 */
export interface AtcVariant {
  /** Variant name */
  name: string;
  /** Variant description */
  description?: string;
  /** Whether this is the default variant */
  isDefault?: boolean;
}
