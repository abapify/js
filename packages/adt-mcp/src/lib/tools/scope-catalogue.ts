/**
 * Server-enforced MCP operation classes.
 *
 * This catalogue is deliberately independent from transport authentication:
 * the HTTP sidecar supplies trusted access through `requestAccess`, while the
 * catalogue is the single source of truth for the operation a tool performs.
 */

export type McpOperationClass = 'server' | 'read' | 'safe_execute' | 'write';

const destinationKeyPattern = /^[a-z][a-z0-9-]{1,62}$/u;

export function isMcpOperationClass(
  value: unknown,
): value is McpOperationClass {
  return (
    value === 'server' ||
    value === 'read' ||
    value === 'safe_execute' ||
    value === 'write'
  );
}

export function isMcpDestinationKey(value: unknown): value is string {
  return typeof value === 'string' && destinationKeyPattern.test(value);
}

export interface McpRequestAccess {
  /** Explicit trusted classes. `write` is never inferred from `read`. */
  classes: readonly McpOperationClass[];
  /** Explicit trusted destination keys. An empty list authorises no SAP I/O. */
  destinationKeys: readonly string[];
  /** A typed signed policy that removes ambient AI Review read authority. */
  frozenSource?: McpFrozenSourceAccess;
}

export interface McpFrozenSourceAccess {
  readonly systemSid: string;
  readonly sources: readonly {
    readonly canonicalKey: string;
    /** Immutable source component within the canonical review object. */
    readonly componentId: string;
    /** Opaque ADT capability; never accepted as a model/tool argument. */
    readonly sourceRef: string;
  }[];
  readonly maxSourceBytes: number;
}

type StaticToolScope = {
  operationClass: McpOperationClass;
};

type DynamicToolScope = {
  /** Every validated action and the operation class it requires. */
  actionClasses: Readonly<Record<string, McpOperationClass>>;
};

export type McpToolScope = StaticToolScope | DynamicToolScope;

const read = (names: readonly string[]): Record<string, StaticToolScope> =>
  Object.fromEntries(names.map((name) => [name, { operationClass: 'read' }]));

const write = (names: readonly string[]): Record<string, StaticToolScope> =>
  Object.fromEntries(names.map((name) => [name, { operationClass: 'write' }]));

const safeExecute = (
  names: readonly string[],
): Record<string, StaticToolScope> =>
  Object.fromEntries(
    names.map((name) => [name, { operationClass: 'safe_execute' }]),
  );

/**
 * Every registered MCP tool has one entry. A mixed-action tool resolves its
 * operation class from validated arguments; the default remains `write`.
 */
export const MCP_TOOL_SCOPE_CATALOGUE: Readonly<Record<string, McpToolScope>> =
  {
    ...read([
      'check_syntax',
      'discovery',
      'find_definition',
      'find_references',
      'gcts_get_repo',
      'gcts_list_branches',
      'gcts_list_repos',
      'gcts_log',
      'get_badi',
      'get_bdef',
      'get_callers_of',
      'get_callees_of',
      'get_cds_dcl',
      'get_cds_ddl',
      'get_completions',
      'get_context',
      'get_data_element',
      'get_domain',
      'get_features',
      'get_flp_tile',
      'get_function',
      'get_function_group',
      'get_git_types',
      'get_include',
      'get_installed_components',
      'get_object',
      'get_object_structure',
      'get_package',
      'get_short_dumps',
      'get_frozen_source',
      'get_source',
      'get_source_version',
      'get_srvb',
      'get_srvd',
      'get_structure',
      'get_table',
      'get_table_contents',
      'get_test_classes',
      'get_traces',
      'get_type_hierarchy',
      'git_export',
      'grep_objects',
      'grep_packages',
      'lint_abap',
      'list_certs',
      'list_flp_catalogs',
      'list_flp_groups',
      'list_flp_tiles',
      'list_package_objects',
      'list_pses',
      'list_source_versions',
      'lookup_user',
      'pretty_print',
      'run_query',
      'run_unit_tests',
      'sap_connect',
      'sap_disconnect',
      'search_objects',
      'stat_package',
      'system_info',
      'cts_get_transport',
      'cts_list_transports',
      'cts_search_transports',
      'cts_transport_objects',
      'cts_transport_source_manifest',
    ]),
    // ATC creates a server-side worklist even though it does not mutate ABAP
    // repository objects. It therefore needs an explicit execution grant.
    ...safeExecute(['atc_run']),
    ...write([
      'activate_object',
      'activate_package',
      'call_rfc',
      'changeset_add',
      'changeset_begin',
      'changeset_commit',
      'changeset_rollback',
      'checkin',
      'clone_object',
      'create_badi',
      'create_bdef',
      'create_function_group',
      'create_function_module',
      'create_object',
      'create_package',
      'create_srvb',
      'create_srvd',
      'cts_create_transport',
      'cts_delete_transport',
      'cts_reassign_transport',
      'cts_release_transport',
      'cts_update_transport',
      'delete_badi',
      'delete_bdef',
      'delete_cert',
      'delete_function_module',
      'delete_object',
      'delete_srvb',
      'delete_srvd',
      'gcts_checkout_branch',
      'gcts_clone_repo',
      'gcts_commit',
      'gcts_create_branch',
      'gcts_create_repo',
      'gcts_delete_repo',
      'gcts_pull',
      'gcts_switch_branch',
      'import_object',
      'import_package',
      'import_transport',
      'lock_object',
      'publish_service_binding',
      'run_abap',
      'unlock_object',
      'unpublish_srvb',
      'update_source',
      'upload_cert',
    ]),
    gcts_config: {
      actionClasses: {
        get: 'read',
        set: 'write',
        unset: 'write',
        list: 'read',
      },
    },
  };

/** Unknown or ambiguous operations fail closed as `write`. */
export function operationClassForMcpTool(
  name: string,
  arguments_: Record<string, unknown> = {},
): McpOperationClass {
  const entry = MCP_TOOL_SCOPE_CATALOGUE[name];
  if (!entry) return 'write';
  if ('actionClasses' in entry) {
    const action = arguments_.action;
    return typeof action === 'string'
      ? (entry.actionClasses[action] ?? 'write')
      : 'write';
  }
  return entry.operationClass;
}

/**
 * Dynamic-action declaration for a tool, if it has one. The declaration is
 * shared by dispatch and the destination-mode tools/list projection.
 */
export function actionClassesForMcpTool(
  name: string,
): Readonly<Record<string, McpOperationClass>> | undefined {
  const entry = MCP_TOOL_SCOPE_CATALOGUE[name];
  return entry && 'actionClasses' in entry ? entry.actionClasses : undefined;
}

/** Registration fails when a newly added tool lacks an explicit catalogue row. */
export function assertMcpToolIsClassified(name: string): void {
  if (!MCP_TOOL_SCOPE_CATALOGUE[name]) {
    throw new Error(
      `MCP tool ${name} is missing an operation-class catalogue entry`,
    );
  }
}

export function isMcpToolAllowed(
  access: McpRequestAccess | undefined,
  name: string,
  arguments_: Record<string, unknown> = {},
): boolean {
  const classes = access?.classes;
  return Boolean(
    Array.isArray(classes) &&
    classes.every(isMcpOperationClass) &&
    classes.includes(operationClassForMcpTool(name, arguments_)),
  );
}

/**
 * Applies a signed resource constraint after the ordinary class check. A
 * frozen AI Review has no ambient read authority: it can ask only for an exact
 * canonical object component through the capability-mediated source tool.
 */
export function isMcpToolResourceAllowed(
  access: McpRequestAccess | undefined,
  name: string,
  arguments_: Record<string, unknown> = {},
): boolean {
  const frozenSource = access?.frozenSource;
  if (!frozenSource) return name !== 'get_frozen_source';
  if (name !== 'get_frozen_source') return false;
  const canonicalKey = arguments_.canonicalKey;
  const componentId = arguments_.componentId;
  return Boolean(
    typeof canonicalKey === 'string' &&
    typeof componentId === 'string' &&
    frozenSource.sources.some(
      (source) =>
        source.canonicalKey === canonicalKey &&
        source.componentId === componentId,
    ),
  );
}

/** Missing or untrusted destination keys fail closed before SAP state exists. */
export function isMcpDestinationAllowed(
  access: McpRequestAccess | undefined,
  destination: unknown,
): boolean {
  const destinationKeys = access?.destinationKeys;
  return Boolean(
    isMcpDestinationKey(destination) &&
    Array.isArray(destinationKeys) &&
    destinationKeys.every(isMcpDestinationKey) &&
    destinationKeys.includes(destination),
  );
}

/**
 * Whether a tool has at least one action permitted to this request. This is
 * intentionally separate from dispatch: mixed-action tools remain listed
 * when a read action is available, while each concrete call is still checked
 * through `isMcpToolAllowed`.
 */
export function isMcpToolListed(
  access: McpRequestAccess | undefined,
  name: string,
): boolean {
  const entry = MCP_TOOL_SCOPE_CATALOGUE[name];
  if (
    !entry ||
    !access ||
    !Array.isArray(access.classes) ||
    !access.classes.every(isMcpOperationClass) ||
    !Array.isArray(access.destinationKeys) ||
    access.destinationKeys.length === 0 ||
    !access.destinationKeys.every(isMcpDestinationKey)
  ) {
    return false;
  }
  if (access.frozenSource) return name === 'get_frozen_source';
  if (name === 'get_frozen_source') return false;
  const classes =
    'actionClasses' in entry
      ? Object.values(entry.actionClasses)
      : [entry.operationClass];
  return classes.some((operationClass) =>
    access.classes.includes(operationClass),
  );
}
