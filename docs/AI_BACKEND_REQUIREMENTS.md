# AI Backend Requirements

## Architecture expectation

Customer or technician interaction
↓
FastAPI backend
↓
AI orchestrator service
↓
conversation state
↓
retrieval / knowledge layer
↓
LLM
↓
response validation and escalation logic
↓
ticket creation or response persistence

## Current frontend AI behavior already observed

- Customer selects a device
- Customer chooses support language
- AI diagnosis starts from a device-specific flow
- Conversation is local and mock-driven
- AI result may resolve or escalate
- Escalated results can create a ticket
- History is persisted only in mock arrays in the frontend

## Minimum backend requirements

### 1. LLM API integration
Required for:
- natural troubleshooting responses
- device-specific troubleshooting suggestions
- escalation classification

### 2. System prompt / policy layer
Required to ensure:
- safe troubleshooting guidance
- no unsafe electrical advice
- clear escalation when required
- language-aware responses

### 3. Conversation memory
Required to maintain:
- customer messages
- assistant responses
- device context
- previous troubleshooting state

### 4. Troubleshooting state
Required to manage:
- device identified
- problem understood
- basic checks done
- findings detected
- escalation decision

### 5. Device context
Required to include:
- device type
- brand
- model
- location
- installation context
- customer problem statement

### 6. Knowledge base / RAG
Required to help the AI reference:
- device manual patterns
- troubleshooting playbooks
- home device operational guidance
- service escalation rules

### 7. Safety rules
Required to prevent:
- unsafe instructions
- electrical risk guidance without caution
- unsupported repair advice

### 8. Escalation logic
Required if:
- issue persists
- physical inspection is needed
- device likely needs technician visit
- no confident resolution is available

### 9. Ticket creation integration
Required when:
- troubleshooting is escalated
- device requires on-site support
- technician assignment must be triggered

### 10. AI history persistence
Required to support:
- history display
- session retrieval
- customer reference
- ticket linkage

### 11. Evaluation pipeline
Required to monitor:
- issue resolution success rate
- escalation quality
- customer satisfaction
- ticket conversion rate

## Minimum contract example

POST /api/ai/chat
Request:
- customer_id
- conversation_id
- device_id
- message
- language

Response:
- assistant_message
- troubleshooting_state
- needs_escalation
- ticket_created
- ticket_id

## Current AI status

Current implementation: static/mock frontend flow only
Real LLM: not connected
RAG: not connected
Conversation persistence: not connected
Escalation integration: only mock client-side flow

## Recommended future architecture

Customer -> FastAPI -> AI Orchestrator -> Retrieval Layer -> LLM -> Response Validation -> Ticket Service -> History Store
