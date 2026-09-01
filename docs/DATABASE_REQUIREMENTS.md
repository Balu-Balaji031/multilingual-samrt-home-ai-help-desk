# Database Requirements

## Proposed core tables

### customers
Purpose: customer account and profile data
Important fields:
- id
- name
- email
- mobile
- address1
- address2
- city
- state
- pincode
- landmark
- preferred_language
- created_at
- last_login
- status
- password_hash

Source frontend model:
- CustomerProfile

### devices
Purpose: smart-home devices owned by a customer
Important fields:
- id
- customer_id
- name
- brand
- model
- category
- location
- status
- warranty
- icon

Source frontend model:
- device objects and catalog data

### device_catalog
Purpose: catalog of available smart-home devices for adding
Important fields:
- id
- name
- category
- icon

Source frontend model:
- deviceCatalog.ts

### technicians
Purpose: technician identity and service profile
Important fields:
- id
- name
- email
- mobile
- status
- experience_years
- experience_summary
- city
- state
- service_area
- service_radius_km
- working_days
- working_hours_start
- working_hours_end
- languages

Source frontend model:
- TechnicianProfile

### technician_applications
Purpose: technician onboarding and approval pipeline
Important fields:
- id
- technician_id
- submitted_at
- status
- admin_note
- rejection_reason
- created_at

Source frontend model:
- TechnicianApplication

### assessments
Purpose: admin scheduling and evaluation of technician assessments
Important fields:
- id
- application_id
- center_id
- center_name
- address
- specialization
- date
- time
- instructions
- score
- evaluator_notes
- result
- scheduled_at
- completed_at

Source frontend model:
- AssessmentDetails

### tickets
Purpose: customer service issue and job state
Important fields:
- id
- customer_id
- device_id
- device_name
- device_category
- brand
- problem_description
- priority
- status
- created_at
- customer_address
- customer_location
- customer_language
- ai_summary
- technician_id
- otp
- otp_verified

Source frontend model:
- CustomerTicket

### ticket_status_history
Purpose: timeline of ticket and job status changes
Important fields:
- id
- ticket_id
- previous_status
- new_status
- changed_at
- changed_by

### technician_assignments
Purpose: mapping of tickets to assigned technicians
Important fields:
- id
- ticket_id
- technician_id
- assigned_at
- assignment_status

### repair_details
Purpose: repair operations and completion details
Important fields:
- id
- ticket_id
- root_cause
- repair_performed
- parts_replaced
- repair_notes
- before_image
- after_image
- checklist
- device_test_result
- customer_informed
- device_tested_with_customer
- completed_at

Source frontend model:
- RepairDetails

### ai_conversations
Purpose: AI troubleshooting sessions
Important fields:
- id
- customer_id
- device_id
- device_name
- status
- created_at
- updated_at
- resolved_at
- escalated_to_ticket

### ai_messages
Purpose: messages inside troubleshooting sessions
Important fields:
- id
- conversation_id
- speaker
- message_text
- created_at

### ai_troubleshooting_sessions
Purpose: summary of a troubleshooting session and ticket link
Important fields:
- id
- conversation_id
- problem
- troubleshooting_steps
- customer_responses
- findings
- result
- ticket_id
- status

### notifications
Purpose: customer and technician notices
Important fields:
- id
- user_id
- user_role
- type
- title
- description
- read
- created_at

### ratings
Purpose: technicians and services feedback
Important fields:
- id
- ticket_id
- customer_id
- technician_id
- rating
- review
- created_at

### admins
Purpose: administrative user accounts and profile info
Important fields:
- id
- name
- email
- mobile
- role
- created_at

### portal_settings
Purpose: admin configurable portal settings
Important fields:
- id
- portal_name
- support_email
- support_phone

## Relationships

- customers -> devices (one-to-many)
- customers -> tickets (one-to-many)
- customers -> ai_conversations (one-to-many)
- devices -> tickets (one-to-many)
- technicians -> technician_applications (one-to-many)
- technician_applications -> assessments (one-to-one)
- tickets -> technician_assignments (one-to-many)
- tickets -> repair_details (one-to-one)
- tickets -> ai_troubleshooting_sessions (one-to-one)
- technicians -> notifications (one-to-many)
- tickets -> ratings (one-to-one)
