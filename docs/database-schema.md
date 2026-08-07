# YourTurn BETA — Database Schema

This is the production data model to implement once the backend/database provider is connected.

## Core entities

### users
- id
- email
- password/auth provider identifier
- created_at
- updated_at

### profiles
- id
- user_id
- full_name
- location
- phone
- preferred_contact_method
- target_roles
- career_summary
- created_at
- updated_at

### cvs
- id
- user_id
- title
- source (uploaded / built)
- template
- status
- created_at
- updated_at

### cv_experience
- id
- cv_id
- job_title
- employer
- location
- start_date
- end_date
- current_role
- description
- sort_order

### cv_education
- id
- cv_id
- institution
- qualification
- field
- start_date
- end_date
- description
- sort_order

### skills
- id
- name

### cv_skills
- cv_id
- skill_id
- proficiency
- sort_order

### job_preferences
- id
- user_id
- desired_roles
- experience_level
- minimum_salary
- maximum_salary
- locations
- remote_preference
- employment_types
- willing_to_relocate
- notification_preferences

### job_sources
- id
- name
- source_type (aggregator / agency / company / other)
- base_url
- active
- last_successful_sync

### jobs
- id
- source_id
- external_id
- canonical_url
- title
- company_name
- location
- description
- salary_min
- salary_max
- salary_currency
- experience_level
- employment_type
- remote_type
- posted_at
- discovered_at
- expires_at
- content_hash
- created_at
- updated_at

### saved_jobs
- id
- user_id
- job_id
- status
- notes
- created_at
- updated_at

### search_history
- id
- user_id
- query
- filters_json
- created_at

## Relationships

```text
users
 ├── profiles (1:1)
 ├── cvs (1:many)
 ├── job_preferences (1:1)
 ├── saved_jobs (1:many)
 └── search_history (1:many)

cvs
 ├── cv_experience (1:many)
 ├── cv_education (1:many)
 └── cv_skills (many:many → skills)

job_sources
 └── jobs (1:many)

jobs
 └── saved_jobs (1:many)
```

## Design rules

1. User-owned data is always scoped by `user_id` or through a verified ownership relationship.
2. Jobs are source records, not user-owned records; users reference them through saved_jobs.
3. `external_id + source_id` should identify a source listing where possible.
4. `canonical_url` and `content_hash` support duplicate detection.
5. CVs are versioned records so later edits do not destroy previous versions accidentally.
6. Sensitive CV files should live in private object storage, not inside the public GitHub Pages repository.
7. Authentication passwords should never be stored directly by the application if a managed authentication system is used.
8. Timestamps should be stored consistently in UTC and rendered in the user's locale.

## Next step

Choose and provision the production database/authentication stack. **No database needs to be created by the user yet**; this schema is the blueprint for the setup step that follows.
