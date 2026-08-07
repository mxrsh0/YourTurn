# YourTurn BETA — Technical Architecture

## Purpose

This document is the technical baseline for turning the BETA front end into a real UK-focused job discovery platform.

## Architecture direction

```text
Browser / GitHub Pages frontend
        |
        | HTTPS API requests
        v
YourTurn backend
        |
        +--> Authentication / sessions
        +--> CV processing / analysis
        +--> Job-source connectors
        +--> Search / filtering / ranking
        +--> Deduplication
        +--> Saved jobs / preferences
        |
        v
Database
```

GitHub Pages is suitable for the current static BETA UI. It should not contain secrets, database credentials, private API keys, or trusted business logic.

## Core data domains

### User
- id
- email
- password hash / external auth identifier
- display name
- location
- phone (optional)
- contact preferences
- notification preferences
- created/updated timestamps

### CV
- id
- user id
- source type (uploaded / built)
- original file reference (if uploaded)
- structured profile data
- generated CV content
- template
- analysis status/results
- created/updated timestamps

### Candidate profile
- target roles
- skills
- experience level
- employment preferences
- location preferences
- remote/hybrid/on-site preference
- salary expectations
- relocation preference
- other search preferences

### Job
- internal id
- source id
- source type
- source URL
- employer
- title
- description
- location
- remote status
- employment type
- experience requirement
- salary information
- posted date
- closing date (when available)
- first discovered / last checked timestamps

### Saved job
- user id
- job id
- status
- notes
- created/updated timestamps

## Job-source strategy

YourTurn should treat sources as connectors rather than hard-coding one provider into the search system.

Possible source categories:

1. Major job aggregators
2. Recruitment agencies
3. Direct company career pages
4. Specialist UK job boards
5. Other permitted public sources

Each connector should normalise its results into the common Job structure.

## Search pipeline

```text
Source connectors
      ↓
Normalise
      ↓
Validate
      ↓
Deduplicate
      ↓
Index
      ↓
Apply filters
      ↓
Rank / match
      ↓
Return results
```

The system should preserve the original source and URL so users can understand where an opportunity came from.

## Security rules

- Never put secrets in frontend JavaScript.
- Never put database credentials in GitHub Pages code.
- Store secrets in the backend hosting provider's secret/environment system.
- Passwords must be securely hashed; never store plaintext passwords.
- Validate and sanitise user input on the backend.
- Authorisation must be enforced server-side.
- CV files and personal information require restricted access controls.
- Use HTTPS for all production API traffic.
- Add rate limiting to authentication and expensive endpoints.
- Keep logs free of passwords, tokens and unnecessary personal data.

## BETA implementation order

1. Finish and test the static onboarding/CV UI.
2. Choose backend hosting and database.
3. Implement authentication.
4. Implement user/profile persistence.
5. Implement secure CV storage and processing.
6. Implement CV analysis.
7. Build the job-source connector interface.
8. Add initial UK job sources.
9. Build normalisation/deduplication/search.
10. Add ranking and personalised matching.
11. Add saved jobs and alerts.
12. Security, privacy, load and end-to-end testing.

## Important principle

Do not connect live job sources until the common data model and connector interface are established. This prevents each source from creating a separate search implementation and makes future sources much easier to add.
