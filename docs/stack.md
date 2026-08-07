# YourTurn BETA — Technical Stack Decision

## Current decision

YourTurn will remain frontend-first during BETA. The production backend/database are intentionally not connected yet.

## Requirements before production

- Secure authentication and sessions
- Relational user/profile/job data
- Private CV storage
- Server-side secrets and API credentials
- Background jobs for ingestion and analysis
- Search and filtering at scale
- Source-specific job connectors
- Deduplication and normalisation
- Auditability and error logging
- UK GDPR-conscious data handling

## Proposed production shape

```text
Browser
  ↓
YourTurn frontend
  ↓ HTTPS
Application/API backend
  ├── Authentication
  ├── Profile + CV services
  ├── Search API
  ├── Job ingestion workers
  └── CV analysis workers
        ↓
Relational database + private object storage
        ↓
External job sources / AI services
```

## Important rule

No API keys, database passwords, authentication secrets, or private service credentials belong in the public frontend or GitHub Pages build.

## Stack selection

The exact backend provider, database provider, authentication provider, object storage and deployment platform will be selected before production implementation. The choice should optimise for security, maintainability, cost, UK/EU data considerations, and the ability to scale the search/ingestion system.

## Next implementation milestone

Build the database schema and backend interface contract before wiring real authentication or job-source integrations.
