## ADDED Requirements

### Requirement: Transport release is verified

The system SHALL request release through SAP's transport release-job operation,
SHALL interpret its release report, and SHALL confirm released state before
reporting success.

#### Scenario: Release completes

- **GIVEN** a modifiable transport or task
- **WHEN** release is requested and SAP returns a successful release report
- **THEN** the system reads the transport state again
- **THEN** it reports success only when the resulting status is released

#### Scenario: Release report contains a failure

- **WHEN** SAP returns an abort or error release report
- **THEN** the system returns a bounded failure diagnostic
- **THEN** it does not mutate cached transport status or report release success

#### Scenario: Release request is a no-op

- **WHEN** the release operation returns without an explicit error but read-back remains modifiable
- **THEN** the system reports failure
- **THEN** CLI and MCP surfaces do not emit a released status

### Requirement: Transport owner change is verified

The system SHALL change owner through SAP's typed transport update operation and
SHALL confirm the resulting owner before reporting success.

#### Scenario: Root owner changes

- **GIVEN** a modifiable transport and a target SAP user
- **WHEN** change-owner is requested
- **THEN** the system sends the typed change-owner update
- **THEN** it reports success only when read-back owner matches the target user

#### Scenario: Owner update is a no-op

- **WHEN** the owner update returns without an explicit error but read-back owner is unchanged
- **THEN** the system reports failure
- **THEN** it does not update cached owner state

#### Scenario: Recursive owner change

- **GIVEN** a transport with modifiable and released child tasks
- **WHEN** recursive change-owner is requested
- **THEN** the root and each modifiable task use the verified owner-change operation
- **THEN** released tasks are not changed
- **THEN** recursive success is reported only when every attempted change is verified

### Requirement: Transport task creation is verified

The system SHALL create a task through SAP's typed `newtask` operation and
SHALL confirm the resulting task through parent-request read-back before
reporting success.

#### Scenario: Modifiable task is created

- **GIVEN** a modifiable transport request and a target SAP user
- **WHEN** task creation is requested
- **THEN** the system posts the typed target-user body to the request's task collection
- **THEN** it reports the new task only when read-back shows a previously absent task owned by the target user with modifiable status

#### Scenario: Task creation response is a no-op

- **WHEN** SAP returns without an explicit error but parent read-back has no matching new task
- **THEN** the system reports failure
- **THEN** CLI and MCP surfaces do not emit a created task number

#### Scenario: Parent is not a modifiable request

- **WHEN** task creation targets a released request or an existing task
- **THEN** the system reports a bounded failure without claiming task creation

### Requirement: Lifecycle delivery surfaces are equivalent

CLI and MCP lifecycle operations SHALL delegate to the same reusable service and
SHALL preserve equivalent success and failure semantics.

#### Scenario: CLI and MCP receive the same SAP responses

- **WHEN** CLI and MCP create a task, release, or reassign the same fixture transport
- **THEN** their final status and bounded diagnostic are equivalent
- **THEN** neither surface can convert an unverified HTTP response into success
