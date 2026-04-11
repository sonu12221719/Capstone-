# Health AI Assistant - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Routes (`/api/auth`)

### Register User
```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "Male",
  "allergies": ["Peanuts", "Penicillin"],
  "chronicConditions": ["Asthma"]
}

Response (201):
{
  "message": "User registered"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Profile (Protected)
```http
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "gender": "Male",
  "allergies": ["Peanuts"],
  "chronicConditions": ["Asthma"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile (Protected)
```http
PUT /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "John Updated",
  "age": 31,
  "allergies": ["Peanuts", "Shellfish"],
  "chronicConditions": ["Asthma", "Hypertension"]
}

Response (200):
{
  "_id": "...",
  "name": "John Updated",
  "age": 31,
  ...
}
```

---

## Chat Routes (`/api/chat`)

### Chat with AI (Protected)
```http
POST /api/chat/symptoms
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "message": "I've been having chest pain and shortness of breath"
}

Response (200) - Normal:
{
  "input": "I've been having chest pain and shortness of breath",
  "response": "Based on your symptoms, this could be...",
  "extracted": {
    "symptoms": ["chest pain", "shortness of breath"],
    "diagnoses": ["Possible cardiac issue"],
    "medications": ["Aspirin (if no allergy)"]
  },
  "redFlags": [],
  "confidence": {
    "score": 0.75,
    "level": "High",
    "factors": [...]
  },
  "explanation": {
    "reasoning": {...},
    "formatted": "## Analysis Explanation\n\n### Top Probable Conditions..."
  },
  "recommendations": {
    "seekProfessionalHelp": true,
    "reasons": ["Complex symptom pattern"]
  },
  "disclaimer": "⚠️ MEDICAL DISCLAIMER: This AI assistant provides..."
}

Response (200) - Emergency Detected:
{
  "isEmergency": true,
  "emergency": {
    "severity": "emergency",
    "condition": "Possible Heart Attack",
    "action": "Call emergency services immediately...",
    "immediateAdvice": "IMPORTANT: Possible Heart Attack suspected...",
    "emergencyNumbers": {
      "india": "108 (Emergency) / 102 (Ambulance)",
      "us": "911",
      "uk": "999",
      "generic": "112"
    }
  },
  "redFlags": [...],
  "confidence": {
    "score": 0.2,
    "level": "Very Low",
    "message": "Emergency detected - confidence reduced"
  },
  "disclaimer": "⚠️ MEDICAL DISCLAIMER: ...",
  "seekProfessionalHelp": true
}
```

### Get Chat History (Protected)
```http
GET /api/chat/history
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "...",
    "userMessage": "I've been having chest pain",
    "aiResponse": "Based on your symptoms...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Reports Routes (`/api/reports`)

### Upload Report (Protected)
```http
POST /api/reports/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
file: <prescription_image>

Response (201):
{
  "message": "Report uploaded and processed",
  "report": {
    "_id": "...",
    "userId": "...",
    "source": "prescription",
    "diagnosis": "Hypertension",
    "medicines": [
      { "name": "Amlodipine", "dosage": "5mg", "duration": "30 days" }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "ocrResult": {
    "diagnosis": "Hypertension",
    "medicines": [...],
    "processed": true
  }
}
```

### Get All Reports (Protected)
```http
GET /api/reports
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "...",
    "source": "prescription",
    "diagnosis": "Hypertension",
    "medicines": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Report by ID (Protected)
```http
GET /api/reports/:id
Authorization: Bearer <token>

Response (200):
{
  "_id": "...",
  "source": "prescription",
  "diagnosis": "Hypertension",
  "symptoms": ["headache", "dizziness"],
  "medicines": [
    { "name": "Amlodipine", "dosage": "5mg", "duration": "30 days" }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Delete Report (Protected)
```http
DELETE /api/reports/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Report deleted"
}
```

---

## Health Routes (`/api/health`)

### Get Health Timeline (Protected)
```http
GET /api/health/timeline
Authorization: Bearer <token>

Response (200):
[
  {
    "_id": "...",
    "source": "chat",
    "symptoms": ["chest pain"],
    "diagnosis": "Possible cardiac issue",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get AI Memory (Protected)
```http
GET /api/health/memory
Authorization: Bearer <token>

Response (200):
{
  "_id": "...",
  "userId": "...",
  "frequentSymptoms": ["headache", "fatigue"],
  "pastDiagnoses": ["Migraine", "Tension headache"],
  "medicationsHistory": ["Paracetamol", "Ibuprofen"],
  "riskPatterns": ["Recurring: headache", "Sleep disorder"],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### Get Risk Score (Protected)
```http
GET /api/health/risk-score
Authorization: Bearer <token>

Response (200):
{
  "riskScore": 45,
  "level": "Moderate",
  "riskFactors": [
    {
      "factor": "Age Risk",
      "impact": 15,
      "description": "Age group 55 years increases health risk"
    },
    {
      "factor": "Chronic Condition",
      "impact": 15,
      "description": "High-risk condition: Hypertension"
    }
  ],
  "recommendations": [
    "Schedule routine checkup",
    "Maintain healthy lifestyle"
  ],
  "summary": {
    "totalRecords": 12,
    "recentRecords": 2,
    "chronicConditions": 2,
    "documentedAllergies": 1
  }
}
```

### Clear AI Memory (Protected)
```http
DELETE /api/health/memory
Authorization: Bearer <token>

Response (200):
{
  "message": "AI memory cleared"
}
```

---

## Doctor Routes (`/api/doctor`)

### Get All Doctors (Protected)
```http
GET /api/doctor
Authorization: Bearer <token>

Query Parameters:
- specialization (optional): Filter by specialization
- city (optional): Filter by city
- available (optional): Filter by availability (true/false)
- search (optional): Search by name, specialization, hospital
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)

Response (200):
{
  "doctors": [
    {
      "_id": "...",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiologist",
      "hospital": "Apollo Hospital",
      "location": { "city": "Delhi", "state": "Delhi" },
      "qualifications": ["MD", "DM"],
      "experience": { "years": 15, "description": "..." },
      "fees": { "initial": 1000, "followUp": 500, "currency": "INR" },
      "availability": true,
      "rating": { "average": 4.5, "count": 120 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Doctor by ID (Protected)
```http
GET /api/doctor/:id
Authorization: Bearer <token>

Response (200):
{
  "_id": "...",
  "name": "Dr. Rajesh Kumar",
  "specialization": "Cardiologist",
  "hospital": "Apollo Hospital",
  "location": { "city": "Delhi", "state": "Delhi", "address": "...", "pincode": "110001" },
  "contact": { "phone": "+91-9876543210", "email": "dr.rajesh@apollo.com" },
  "qualifications": ["MD", "DM"],
  "experience": { "years": 15, "description": "Expert in interventional cardiology" },
  "consultationHours": { "start": "09:00", "end": "17:00", "days": ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  "fees": { "initial": 1000, "followUp": 500, "currency": "INR" },
  "availability": true,
  "rating": { "average": 4.5, "count": 120 }
}
```

### Create Doctor (Protected)
```http
POST /api/doctor
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Dr. John Smith",
  "specialization": "General Physician",
  "hospital": "City Hospital",
  "location": { "city": "Mumbai", "state": "Maharashtra" },
  "qualifications": ["MBBS", "MD"],
  "experience": { "years": 10, "description": "..." },
  "fees": { "initial": 500, "followUp": 250 }
}

Response (201):
{
  "_id": "...",
  "name": "Dr. John Smith",
  ...
}
```

### Update Doctor (Protected)
```http
PUT /api/doctor/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "availability": false,
  "fees": { "initial": 600, "followUp": 300 }
}

Response (200):
{
  "_id": "...",
  "availability": false,
  ...
}
```

### Delete Doctor (Protected)
```http
DELETE /api/doctor/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Doctor deactivated"
}
```

### Get Specializations (Protected)
```http
GET /api/doctor/specializations
Authorization: Bearer <token>

Response (200):
["Cardiologist", "Dermatologist", "General Physician", "Neurologist", "Orthopedic"]
```

### Recommend Doctor (Protected)
```http
POST /api/doctor/recommend
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "symptoms": ["chest pain", "shortness of breath"]
}

Response (200):
{
  "recommended": {
    "specialization": "Cardiologist",
    "reason": "Chest-related symptoms typically require cardiac evaluation"
  },
  "doctors": [
    {
      "_id": "...",
      "name": "Dr. Rajesh Kumar",
      "specialization": "Cardiologist",
      "hospital": "Apollo Hospital",
      "availability": true,
      "fees": { "initial": 1000 }
    }
  ]
}
```

### Seed Doctors (Protected)
```http
POST /api/doctor/seed
Authorization: Bearer <token>

Response (201):
{
  "message": "Doctors seeded",
  "count": 5
}
```

---

## Reminder Routes (`/api/reminders`)

### Create Reminder (Protected)
```http
POST /api/reminders
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "type": "checkup",
  "title": "Annual Health Checkup",
  "description": "Complete blood work and vitals",
  "scheduledDate": "2024-06-15T09:00:00.000Z",
  "recurring": {
    "enabled": true,
    "interval": "yearly"
  }
}

Response (201):
{
  "_id": "...",
  "userId": "...",
  "type": "checkup",
  "title": "Annual Health Checkup",
  "scheduledDate": "2024-06-15T09:00:00.000Z",
  "recurring": { "enabled": true, "interval": "yearly" },
  "isCompleted": false,
  "notificationSent": false
}
```

### Get Reminders (Protected)
```http
GET /api/reminders
Authorization: Bearer <token>

Query Parameters:
- upcoming (optional): Show only upcoming (true/false)
- completed (optional): Show only completed (true/false)

Response (200):
[
  {
    "_id": "...",
    "type": "checkup",
    "title": "Annual Health Checkup",
    "scheduledDate": "2024-06-15T09:00:00.000Z",
    "isCompleted": false
  }
]
```

### Get Reminder by ID (Protected)
```http
GET /api/reminders/:id
Authorization: Bearer <token>

Response (200):
{
  "_id": "...",
  "type": "checkup",
  "title": "Annual Health Checkup",
  "description": "Complete blood work and vitals",
  "scheduledDate": "2024-06-15T09:00:00.000Z",
  "recurring": { "enabled": true, "interval": "yearly" },
  "isCompleted": false
}
```

### Update Reminder (Protected)
```http
PUT /api/reminders/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "title": "Updated Title",
  "scheduledDate": "2024-07-01T10:00:00.000Z"
}

Response (200):
{
  "_id": "...",
  "title": "Updated Title",
  ...
}
```

### Mark Reminder Complete (Protected)
```http
PATCH /api/reminders/:id/complete
Authorization: Bearer <token>

Response (200):
{
  "completed": {
    "_id": "...",
    "isCompleted": true,
    ...
  },
  "next": { ... } // Only if recurring reminder
}
```

### Delete Reminder (Protected)
```http
DELETE /api/reminders/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Reminder deleted"
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Models Summary

### User
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | User's full name |
| email | String | Yes | Unique email |
| password | String | Yes | Hashed password |
| age | Number | Yes | User's age |
| gender | String | Yes | Male/Female/Other |
| allergies | [String] | No | List of allergies |
| chronicConditions | [String] | No | List of chronic conditions |

### HealthRecord
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| source | String | chat/prescription/report |
| symptoms | [String] | Extracted symptoms |
| diagnosis | String | AI or OCR diagnosis |
| medicines | [{name, dosage, duration}] | Extracted medicines |
| reportDate | Date | Date of report |

### AIMemory
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| frequentSymptoms | [String] | Recurring symptoms |
| pastDiagnoses | [String] | Historical diagnoses |
| medicationsHistory | [String] | Past medications |
| riskPatterns | [String] | Detected risk patterns |

### Doctor
| Field | Type | Description |
|-------|------|-------------|
| name | String | Doctor's name |
| specialization | String | Medical specialization |
| hospital | String | Hospital name |
| location | Object | City, state, address |
| qualifications | [String] | Degrees/certifications |
| experience | Object | Years and description |
| fees | Object | Initial and follow-up fees |
| availability | Boolean | Current availability |
| rating | Object | Average rating and count |

### Reminder
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| type | String | checkup/medication/vaccination/test/general |
| title | String | Reminder title |
| description | String | Details |
| scheduledDate | Date | When to remind |
| isCompleted | Boolean | Completion status |
| recurring | Object | Recurrence settings |

---

## Environment Variables

Create a `.env` file with:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/health_ai_db
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
OPENAI_KEY=your_openai_api_key
CLIENT_URLS=http://localhost:5173
```
