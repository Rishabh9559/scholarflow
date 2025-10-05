# API Testing Guide

Quick reference for testing PaperCraftor API endpoints

## Setup

1. Start the backend server:
```bash
npm run dev
```

2. Base URL: `http://localhost:5000`

## 1. Authentication Flow

### Step 1: Register a New User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Step 2: Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

**Save the token from response for subsequent requests!**

### Step 3: Get Current User Profile
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## 2. Paper Management

### Create a Paper
```http
POST http://localhost:5000/api/papers
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Mathematics Mid-Term Exam",
  "subject": "Mathematics",
  "class": "10th Grade",
  "duration": 120,
  "totalMarks": 50,
  "sections": [
    {
      "sectionName": "Section A - Multiple Choice",
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "What is the value of π (pi) approximately?",
          "marks": 1,
          "questionType": "multiple-choice",
          "options": ["3.12", "3.14", "3.16", "3.18"],
          "correctAnswer": "3.14"
        },
        {
          "questionNumber": 2,
          "questionText": "What is the square root of 144?",
          "marks": 1,
          "questionType": "multiple-choice",
          "options": ["10", "11", "12", "13"],
          "correctAnswer": "12"
        }
      ]
    },
    {
      "sectionName": "Section B - Short Answer",
      "questions": [
        {
          "questionNumber": 3,
          "questionText": "Solve: 2x + 5 = 15",
          "marks": 3,
          "questionType": "short-answer"
        }
      ]
    }
  ],
  "instructions": "1. Read all questions carefully\n2. Answer all questions\n3. Write neatly",
  "status": "draft"
}
```

### Get All Papers
```http
GET http://localhost:5000/api/papers
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Single Paper
```http
GET http://localhost:5000/api/papers/PAPER_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Paper
```http
PUT http://localhost:5000/api/papers/PAPER_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Mathematics Final Exam (Updated)",
  "status": "published"
}
```

### Delete Paper
```http
DELETE http://localhost:5000/api/papers/PAPER_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Papers by Status
```http
GET http://localhost:5000/api/papers/status/draft
Authorization: Bearer YOUR_TOKEN_HERE
```

Available statuses: `draft`, `published`, `archived`

## 3. Password Management

### Forgot Password
```http
POST http://localhost:5000/api/auth/forgotpassword
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Response includes resetToken (in development mode)**

### Reset Password
```http
PUT http://localhost:5000/api/auth/resetpassword/RESET_TOKEN_HERE
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Update Password (Logged In)
```http
PUT http://localhost:5000/api/auth/updatepassword
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "test123",
  "newPassword": "newtest123"
}
```

## 4. User Profile Management

### Update User Details
```http
PUT http://localhost:5000/api/auth/updatedetails
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

## Testing with PowerShell (Windows)

### Register User
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login User
```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Get Papers (with token)
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/papers" -Method GET -Headers $headers
```

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Tips

1. Always save the JWT token after login/register
2. Include token in Authorization header: `Bearer YOUR_TOKEN`
3. Token expires after 7 days (configurable in .env)
4. Update .env file with your MongoDB credentials before testing
5. Use a tool like Postman, Thunder Client, or curl for easier testing

## Troubleshooting

**Problem**: "Not authorized to access this route"
- **Solution**: Check if token is included in Authorization header

**Problem**: "User already exists"
- **Solution**: Use a different email or login with existing credentials

**Problem**: "Cannot connect to MongoDB"
- **Solution**: Verify MONGODB_URI in .env file and check internet connection
