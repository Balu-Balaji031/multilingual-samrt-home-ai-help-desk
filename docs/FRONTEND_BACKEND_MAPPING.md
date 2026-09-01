# Frontend to Backend Mapping

## Customer

Frontend feature: Customer Profile
Current implementation: mockCustomerProfile + local form state
Current data source: src/mocks/customerData.ts
Future endpoint: GET /api/customer/profile, PUT /api/customer/profile
Future table: customers or profiles

Frontend feature: Customer Login
Current implementation: login() in authApi.ts
Current data source: localStorage and registeredCustomers
Future endpoint: POST /api/auth/customer/login
Future table: users or customers

Frontend feature: Customer Registration
Current implementation: multi-step form in App.tsx
Current data source: frontend form state
Future endpoint: POST /api/customers
Future table: customers

Frontend feature: Forgot Password / Reset
Current implementation: UtilityPage + authApi reset flow
Current data source: localStorage + generated OTP in browser
Future endpoint: POST /api/auth/customer/forgot-password, POST /api/auth/customer/reset-password
Future table: password_reset_tokens or users

Frontend feature: Customer Devices
Current implementation: devices + add-device UI in App.tsx
Current data source: device arrays + mock API
Future endpoint: GET /api/customer/devices, POST /api/customer/devices, PUT /api/customer/devices/:id
Future table: devices

Frontend feature: AI Assistant
Current implementation: mock chat assistant UI
Current data source: device selection + component state
Future endpoint: POST /api/ai/chat, GET /api/ai/history/:customer_id
Future table: ai_conversations, ai_messages

Frontend feature: AI History
Current implementation: aiTroubleshootingHistory static array
Current data source: App.tsx local array
Future endpoint: GET /api/ai/history/:customer_id
Future table: ai_troubleshooting_sessions

Frontend feature: My Tickets
Current implementation: ticket cards with static data
Current data source: activeTicket + completedTickets arrays
Future endpoint: GET /api/customer/tickets, GET /api/customer/tickets/:id
Future table: tickets

Frontend feature: Notifications
Current implementation: customerNotifications array
Current data source: notificationData.ts
Future endpoint: GET /api/customer/notifications
Future table: notifications

## Technician

Frontend feature: Technician Profile
Current implementation: TechnicianProfilePage in App.tsx
Current data source: mockStore + technicianData.ts
Future endpoint: GET /api/technician/profile, PUT /api/technician/profile
Future table: technicians or technician_profiles

Frontend feature: Technician Registration/Application
Current implementation: multi-step onboarding form
Current data source: App.tsx + mockStore
Future endpoint: POST /api/technicians/application
Future table: technician_applications

Frontend feature: Assessment Assignment
Current implementation: admin assigns center and date
Current data source: mockStore state
Future endpoint: POST /api/technician/assessments
Future table: assessments

Frontend feature: Technician Dashboard
Current implementation: dashboard summary based on mockStore
Current data source: mockStore
Future endpoint: GET /api/technician/dashboard
Future table: technicians + assignments + tickets

Frontend feature: All Jobs
Current implementation: ticket list in mockStore
Current data source: mockStore tickets
Future endpoint: GET /api/technician/jobs
Future table: technician_assignments + tickets

Frontend feature: Job Details
Current implementation: TechnicianJobDetails.tsx
Current data source: mockStore
Future endpoint: GET /api/jobs/:id
Future table: jobs or tickets

Frontend feature: Job Status Lifecycle
Current implementation: CREATED -> ACCEPTED -> ON_THE_WAY -> ARRIVED -> REPAIR_STARTED -> COMPLETED
Current data source: mockStore
Future endpoint: PATCH /api/jobs/:id/status
Future table: jobs or ticket_status_history

Frontend feature: OTP Arrival Verification
Current implementation: verifyArrivalOtp() in mockStore
Current data source: ticket otp in store
Future endpoint: POST /api/jobs/:id/verify-otp
Future table: job_verification or ticket_verifications

Frontend feature: Repair Completion
Current implementation: completeRepairJob() in mockStore
Current data source: repairDetails state
Future endpoint: POST /api/jobs/:id/repair-complete
Future table: repair_details

Frontend feature: Job History
Current implementation: TechnicianJobHistoryPage
Current data source: completed tickets in mockStore
Future endpoint: GET /api/technician/job-history
Future table: jobs or repair_records

## Admin

Frontend feature: Admin Applications
Current implementation: AdminPortal application list + review actions
Current data source: mockStore app state
Future endpoint: GET /api/admin/applications, PATCH /api/admin/applications/:id
Future table: technician_applications

Frontend feature: Admin Assessments
Current implementation: assign assessment center and grade result
Current data source: mockStore assessment state
Future endpoint: POST /api/admin/assessments, PATCH /api/admin/assessments/:id
Future table: assessments

Frontend feature: Final Approval
Current implementation: mockStore.finalApproveTechnician()
Current data source: mockStore
Future endpoint: PATCH /api/admin/technicians/:id/approve
Future table: technicians

Frontend feature: Approved Technicians List
Current implementation: admin-approved list from mock state
Current data source: mockStore + technician state
Future endpoint: GET /api/admin/technicians
Future table: technicians

Frontend feature: Customers List
Current implementation: registeredCustomers list in admin portal
Current data source: customerData.ts
Future endpoint: GET /api/admin/customers
Future table: customers

Frontend feature: Admin Settings
Current implementation: local admin profile/settings form
Current data source: local component state
Future endpoint: GET /api/admin/settings, PUT /api/admin/settings
Future table: admin_profiles or portal_settings

## Shared Models

Frontend feature: Notifications
Current implementation: local notifications arrays
Current data source: notificationData.ts and state
Future endpoint: GET /api/notifications
Future table: notifications

Frontend feature: Ratings
Current implementation: customerRating and customerReview in tickets
Current data source: ticket object
Future endpoint: POST /api/jobs/:id/rating
Future table: ratings or job_reviews
