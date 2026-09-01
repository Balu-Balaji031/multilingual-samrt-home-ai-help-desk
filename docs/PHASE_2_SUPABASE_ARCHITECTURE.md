# Phase 2: Supabase Architecture

## Objective

This Phase 2 design is a corrected backend-only schema for the real SmartAssist frontend behavior. It is grounded in the audited frontend data, not in an earlier draft schema. The design does not connect the current React frontend to Supabase, does not execute SQL, and does not alter the existing UI or workflows.

## Source of truth used

- docs/DATA_MODELS.md
- docs/DATABASE_REQUIREMENTS.md
- docs/FRONTEND_BACKEND_MAPPING.md
- docs/FRONTEND_AUDIT.md
- docs/API_REQUIREMENTS.md
- docs/AI_BACKEND_REQUIREMENTS.md
- src/mocks/customerData.ts
- src/mocks/technicianData.ts
- src/types/technicianPortal.ts
- src/types/auth.ts

## Design decisions

### 1. Authentication architecture

The application should use Supabase Auth as the source of identity. The profile tables keep only `auth_user_id` references; they do not store plaintext or custom password hashes.

Future mapping:

Supabase Auth `auth.users`
  -> `customers.auth_user_id`
  -> customer profile

Supabase Auth `auth.users`
  -> `technicians.auth_user_id`
  -> technician profile / approval workflow

Supabase Auth `auth.users`
  -> `admins.auth_user_id`
  -> admin profile

This is the correct direction for Phase 3 auth work. No custom password system is created in this phase.

### 2. Canonical role naming

The app uses a Technician Portal and the frontend role string is currently `'electrician'` in the client auth model. The canonical database role used in the backend should be `technician`.

Decision:
- Database role value is `technician`
- Any frontend role normalization layer should map legacy `'electrician'` to `technician` before persistence
- This phase does not change frontend code, but the future backend should normalize role names to the canonical value and document the compatibility mapping

### 3. Technician data model

The frontend technician model contains repeated collections:
- specializations
- skills
- languages
- serviceArea
- pincodes
- workingDays
- workingHours
- experience
- experienceSummary

The corrected schema keeps the main `technicians` table and moves repeated values into dedicated relational tables:
- technician_specializations
- technician_skills
- technician_languages
- technician_service_pincodes
- technician_working_days
- technician_working_hours

This avoids overloading one table with array columns while preserving the actual frontend information.

Frontend field -> database field mapping:
- name -> technicians.name
- email -> technicians.email
- mobile -> technicians.mobile
- status -> technicians.status
- experience -> technicians.experience_years
- experienceSummary -> technicians.experience_summary
- specializations -> technician_specializations.specialization
- skills -> technician_skills.skill
- language(s) -> technician_languages.language
- serviceArea -> technicians.service_area
- city -> technicians.city
- state -> technicians.state
- pincodes -> technician_service_pincodes.pincode
- serviceRadiusKm -> technicians.service_radius_km
- availability -> technicians.availability
- workingDays -> technician_working_days.day_of_week
- workingHours -> technician_working_hours.start_time / end_time

### 4. Ticket model and snapshot design

The ticket table keeps the data the customer and technician portal actually uses:
- customer info snapshot
- device info snapshot
- problem description
- priority
- status
- ticket lifecycle metadata
- assignment relationship

This is intentionally denormalized for service history and job tracking. The snapshot duplicates customer/device detail at ticket creation time, which is acceptable for historical accuracy and is required for job history and customer ticket review.

The ticket does not keep plaintext OTP values. OTP handling is moved to a separate table for future secure verification.

### 5. Attachments model

The frontend supports attachments on a ticket, but the actual application is mock-based and does not upload binary files to PostgreSQL. The correct architecture is:

Supabase Storage
  -> ticket_attachments metadata table
  -> ticket

The metadata table keeps only:
- ticket_id
- storage_path
- file_name
- file_type
- created_at

This preserves the real requirement without storing binary data directly in the database.

### 6. OTP model

The frontend requires OTP verification, but the migration should not create a permanent insecure OTP store. The database keeps only the minimum future-ready structure:
- ticket_verification_codes
- code_hash
- expires_at
- verified_at
- delivery_channel

Actual OTP generation, expiry, hashing, verification, and delivery are deferred to the later backend/auth phase.

### 7. AI architecture

The corrected design preserves:
- ai_conversations
- ai_messages
- ai_troubleshooting_sessions

The chain is:
Customer -> AI conversation -> messages -> troubleshooting session -> resolved or escalated ticket

The relationship is:
- ai_conversations.customer_id -> customer
- ai_messages.conversation_id -> ai_conversations
- ai_troubleshooting_sessions.conversation_id -> ai_conversations
- ai_troubleshooting_sessions.ticket_id -> tickets

This preserves escalation linkage without adding a redundant history table.

### 8. Job history

Job history is derived from the existing operational tables, not a separate table:
- tickets
- technician_assignments
- repair_details
- ratings

This aligns with the frontend Job History screen and avoids duplicate data.

### 9. Notifications

Notifications use explicit role-aware foreign keys instead of a generic UUID:
- customer_id
- technician_id
- admin_id
- user_role

This avoids leaving the notification target as an unexplained generic ID and keeps the relationship compatible with the auth architecture without creating duplicate user tables.

### 10. Portal settings

Portal settings were removed from the corrected schema because the current frontend does not demonstrate a database-backed portal settings model. The admin UI is local state in the app; the Phase 0 documentation describes admin profile settings as local component state rather than persisted service data.

This keeps the Phase 2 migration grounded in the actual frontend instead of adding invented settings functionality.

### 11. RLS design

RLS is applied only where the actual ownership model is clear:
- customers own their profile and data
- technicians own their profile and assigned jobs
- admins manage workflow records
- customers own AI and rating records
- notifications are scoped by role-aware foreign keys

No table uses `USING (true)` for sensitive business data.

If a table or policy cannot be finalized safely before auth is in place, it is documented as deferred rather than being granted broad access.

### 12. Safety and migration constraints

The migration is intentionally designed to avoid destructive operations:
- no DROP TABLE
- no DROP SCHEMA
- no DELETE
- no TRUNCATE
- no schema overwrite of existing production tables

The seed file is clearly marked as development-only and does not create any real Supabase Auth records or fake admin identities.

## Final status

The corrected Phase 2 schema is a safer and more accurate representation of the actual frontend and documentation baseline, but it remains a backend-only design document and is not yet applied to any real Supabase project.
