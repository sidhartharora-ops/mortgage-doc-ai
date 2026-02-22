# Audit Requirements

## Principles
- All audit logs are **append-only** — no updates or deletes permitted
- Every agent execution produces an audit record
- Every human override produces a review audit record
- Audit logs must be sufficient to fully reconstruct the processing history of any document

## Agent Execution Audit (AuditLog)

Each agent run must record:
1. `documentId` — Which document was processed
2. `agentName` — Which agent ran (classification, extraction, validation)
3. `version` — Agent version string
4. `inputHash` — SHA-256 hash of the input passed to the agent
5. `outputHash` — SHA-256 hash of the output produced
6. `confidence` — Overall confidence score from the agent
7. `pipelineVersion` — Version of the pipeline configuration
8. `timestamp` — When the execution occurred

## Human Review Audit (ReviewAudit)

Each field override must record:
1. `documentId` — Which document was reviewed
2. `fieldName` — Which field was changed
3. `originalValue` — Value before override
4. `updatedValue` — Value after override
5. `reviewer` — Who made the change
6. `timestamp` — When the review occurred

## Storage
- AuditLog and ReviewAudit tables must have no UPDATE or DELETE operations in application code
- Only INSERT (create) operations are permitted
- Database-level protections (triggers or policies) recommended for production
