# API Requirements

## AUTH

### POST /api/auth/customer/login
Purpose: authenticate a customer
Authentication required: No
Role: Customer
Input: identifier, password
Output: success, role, status

### POST /api/auth/customer/register
Purpose: create a customer account
Authentication required: No
Role: Customer
Input: registration fields
Output: user account created

### POST /api/auth/customer/forgot-password
Purpose: trigger password reset request
Authentication required: No
Role: Customer
Input: email or mobile
Output: reset code or token

### POST /api/auth/customer/reset-password
Purpose: reset password
Authentication required: No
Role: Customer
Input: identifier, code, new_password
Output: success/failure

### POST /api/auth/technician/login
Purpose: authenticate technician
Authentication required: No
Role: Technician
Input: identifier, password
Output: success, role, status

### POST /api/auth/admin/login
Purpose: authenticate admin
Authentication required: No
Role: Admin
Input: identifier, password
Output: success, role, status

## CUSTOMER

### GET /api/customer/profile
Purpose: get profile
Authentication required: Yes
Role: Customer
Input: customer_id
Output: customer profile

### PUT /api/customer/profile
Purpose: update profile
Authentication required: Yes
Role: Customer
Input: profile fields
Output: updated profile

### GET /api/customer/overview
Purpose: load dashboard summary
Authentication required: Yes
Role: Customer
Input: customer_id
Output: devices, active ticket, notifications, activity

## DEVICES

### GET /api/customer/devices
Purpose: list customer devices
Authentication required: Yes
Role: Customer
Input: customer_id
Output: list of devices

### POST /api/customer/devices
Purpose: add a device
Authentication required: Yes
Role: Customer
Input: name, brand, location, model, category
Output: created device

### PUT /api/customer/devices/:id
Purpose: update device
Authentication required: Yes
Role: Customer
Input: device updates
Output: updated device

## AI

### POST /api/ai/chat
Purpose: send troubleshooting message
Authentication required: Yes
Role: Customer
Input: customer_id, device_id, conversation_id, message, language
Output: assistant response, troubleshooting state, escalation status

### GET /api/ai/history/:customer_id
Purpose: get troubleshooting history
Authentication required: Yes
Role: Customer
Input: customer_id
Output: list of AI sessions

### GET /api/ai/conversations/:id
Purpose: get one conversation
Authentication required: Yes
Role: Customer
Input: conversation_id
Output: full conversation

### POST /api/ai/escalate
Purpose: escalate troubleshooting to ticket flow
Authentication required: Yes
Role: Customer or system
Input: conversation_id, summary
Output: created ticket id

## TICKETS

### GET /api/customer/tickets
Purpose: list tickets for a customer
Authentication required: Yes
Role: Customer
Input: customer_id
Output: ticket list

### GET /api/customer/tickets/:id
Purpose: fetch one ticket
Authentication required: Yes
Role: Customer
Input: ticket_id
Output: ticket details

### POST /api/customer/tickets
Purpose: create service ticket
Authentication required: Yes
Role: Customer or AI system
Input: device info, issue, language, customer info
Output: new ticket

### PATCH /api/tickets/:id/status
Purpose: update ticket state
Authentication required: Yes
Role: Technician or Admin
Input: status
Output: updated ticket

## TECHNICIANS

### GET /api/technician/profile
Purpose: fetch technician profile
Authentication required: Yes
Role: Technician
Input: technician_id
Output: technician profile

### PUT /api/technician/profile
Purpose: update technician profile
Authentication required: Yes
Role: Technician
Input: profile values
Output: updated profile

### GET /api/technician/jobs
Purpose: list technician jobs
Authentication required: Yes
Role: Technician
Input: technician_id
Output: assigned jobs

### GET /api/technician/job-history
Purpose: list completed jobs
Authentication required: Yes
Role: Technician
Input: technician_id
Output: completed jobs

## APPLICATIONS

### POST /api/technician/application
Purpose: submit technician application
Authentication required: Yes
Role: Technician
Input: profile + service fields
Output: application record

### GET /api/admin/applications
Purpose: list applications
Authentication required: Yes
Role: Admin
Input: status filters
Output: applications

### PATCH /api/admin/applications/:id
Purpose: review or update status
Authentication required: Yes
Role: Admin
Input: status, note, rejection reason
Output: updated application

## ASSESSMENTS

### POST /api/admin/assessments
Purpose: schedule assessment
Authentication required: Yes
Role: Admin
Input: center, date, time, instructions
Output: assessment record

### PATCH /api/admin/assessments/:id
Purpose: save result
Authentication required: Yes
Role: Admin
Input: score, notes, result
Output: updated assessment

## JOBS

### PATCH /api/jobs/:id/accept
Purpose: accept a job
Authentication required: Yes
Role: Technician
Input: job_id
Output: updated status

### PATCH /api/jobs/:id/travel
Purpose: mark on the way
Authentication required: Yes
Role: Technician
Input: job_id
Output: updated status

### POST /api/jobs/:id/verify-otp
Purpose: verify customer arrival OTP
Authentication required: Yes
Role: Technician
Input: job_id, otp
Output: valid/invalid

### PATCH /api/jobs/:id/repair-start
Purpose: begin repair
Authentication required: Yes
Role: Technician
Input: job_id
Output: updated status

### POST /api/jobs/:id/repair-complete
Purpose: complete repair details
Authentication required: Yes
Role: Technician
Input: repair details
Output: completed repair record

## ADMIN

### GET /api/admin/customers
Purpose: list customers
Authentication required: Yes
Role: Admin
Input: filters
Output: customer list

### GET /api/admin/settings
Purpose: fetch admin settings
Authentication required: Yes
Role: Admin
Input: admin_id
Output: settings

### PUT /api/admin/settings
Purpose: save settings
Authentication required: Yes
Role: Admin
Input: settings payload
Output: updated settings

## NOTIFICATIONS

### GET /api/notifications
Purpose: list notifications
Authentication required: Yes
Role: Customer or Technician
Input: user_id
Output: notifications

## RATINGS

### POST /api/jobs/:id/rating
Purpose: save customer rating and review
Authentication required: Yes
Role: Customer
Input: rating, review
Output: stored rating
