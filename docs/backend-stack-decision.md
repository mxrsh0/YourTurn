# YourTurn Backend Stack Decision

## Decision

For the first real backend implementation, YourTurn will use **Supabase** for:

- PostgreSQL database
- Authentication
- Private file storage for CV uploads
- Row Level Security (RLS)
- API access to database data

This is a pragmatic BETA-to-production starting point: it gives us the relational database we need while keeping authentication, storage and authorization close to the data layer.

Supabase's current Free plan includes a PostgreSQL database, authentication, 1 GB file storage and 50,000 monthly active users. Free projects can pause after a period of inactivity, so production hosting requirements will be reviewed before launch. See the official pricing page for current limits and pricing.

## Why this fits YourTurn

1. **Relational data:** users, CVs, jobs, sources, preferences and saved jobs have clear relationships.
2. **Authentication:** we do not need to invent password/session handling ourselves.
3. **CV storage:** uploaded CV files can live in private object storage rather than GitHub.
4. **Security:** RLS can enforce that a user only accesses their own profile, CV and saved-job records.
5. **Growth:** PostgreSQL gives us a strong foundation for the search system and future backend services.
6. **Low initial cost:** we can build and test the first real version without immediately paying for infrastructure.

## Security rules

- Never put Supabase service-role credentials in frontend JavaScript.
- Only publish the browser-safe project URL/key where appropriate.
- Enable RLS on exposed tables.
- Create explicit ownership policies for user data.
- Keep CV storage buckets private.
- Keep AI/API/job-source secrets server-side.
- Do not put `.env` files or secrets into GitHub.

## Architecture

```text
Browser
   ↓ HTTPS
YourTurn frontend
   ↓
Supabase Auth ──────── PostgreSQL
   │                       │
   │                       ├── profiles
   │                       ├── CVs
   │                       ├── preferences
   │                       ├── jobs
   │                       └── saved jobs
   │
   └────────────── Private CV Storage

Later:

Job-source workers / backend services
   ↓
Normalisation → Deduplication → PostgreSQL
```

## Important boundary

Supabase is the initial backend/data platform. It does **not** mean all future processing must run directly in browser code. Job ingestion, AI processing, privileged operations and source credentials will use server-side functions/workers where appropriate.

## Next action

The user now needs to create a Supabase project. **Do not add any credentials to GitHub.** After the project exists, the next implementation step is to create the database tables and RLS policies from the approved schema, then connect authentication to the existing onboarding UI.
