# Mortgage Document AI — System Specification

## Overview
A sandbox web application for Canadian mortgage income document ingestion and review.
Documents are uploaded, text-extracted via OCR, run through a configurable agent pipeline,
and presented for human review with field-level confidence scores.

## Supported Document Types
- **T4** — Statement of Remuneration Paid (employment income)
- **NOA** — Notice of Assessment (CRA tax assessment)
- **Paystub** — Pay statement from employer
- **Bank Statement** — Monthly account statement
- **Employment Letter** — Employment verification / confirmation letter

## Processing Flow
1. User uploads document (PDF or text)
2. OCR layer extracts text (sandbox: built-in zlib PDF decompression; production: plug in Google Vision, AWS Textract, etc.)
3. Classification agent determines document type (Claude Sonnet 4.5)
4. Extraction agent pulls structured fields (Claude Sonnet 4.5)
5. Validation agent checks financial consistency (rule engine)
6. Confidence engine calculates overall score (model confidence 40%, validation 35%, cross-field 25%)
7. Documents below 85% threshold flagged for human review
8. All agent decisions logged immutably with SHA-256 input/output hashes

## Key Principles
- Agents are modular, versioned, and testable
- Deterministic test mode bypasses LLM calls (DETERMINISTIC_MODE=true)
- Audit logs are append-only
- Validation rules are externally configurable (YAML or code defaults)
- Prompts stored as separate files in `/prompts/`

## Architecture
- **Framework:** Next.js 15 (App Router) on port 3001
- **Database:** PostgreSQL (Neon) via Prisma ORM, using `mortgage` schema (isolated from other apps sharing the same database)
- **AI Model:** Claude Sonnet 4.5 for classification and extraction agents
- **OCR (Sandbox):** Built-in PDF text extraction via Node.js zlib — decompresses FlateDecode streams and parses PDF text operators (Tj, TJ)
- **Language:** TypeScript

## UI Pages
- `/` — Landing page with links to Upload and Review Queue
- `/upload` — File upload form (PDF, TXT, images)
- `/review` — Document review queue with status badges
- `/review/[documentId]` — Document detail with extracted fields, agent runs, and audit trail
- `/about` — System overview, pipeline explanation, and technical details

## Database Schema (6 tables in `mortgage` schema)
- `documents` — Uploaded documents with status and type
- `extracted_fields` — Field-level extraction results with confidence
- `agent_runs` — Agent execution logs with model, latency, and hashes
- `review_actions` — Human review overrides
- `audit_logs` — Append-only agent execution audit trail
- `review_audits` — Append-only human review audit trail
