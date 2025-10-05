# PaperCraftor Backend API

A robust backend API for PaperCraftor application with JWT authentication and MongoDB database.

## Features

- 🔐 JWT Authentication (Login, Register, Forgot Password)
- 👤 User Management
- 📄 Paper CRUD Operations
- 🛡️ Protected Routes
- 🔒 Password Hashing with bcrypt
- ✅ Input Validation
- 🚨 Error Handling
- 📧 Password Reset Functionality

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://rishabhkushwaha9559_db_user:<YOUR_PASSWORD>@papercraftor.omsykne.mongodb.net/papercraftor?retryWrites=true&w=majority&appName=PaperCraftor

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

**Important**: Replace `<YOUR_PASSWORD>` with your actual MongoDB password!

## Running the Application

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Body**: 
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body**: 
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

#### Update User Details
- **PUT** `/api/auth/updatedetails`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Update Password
- **PUT** `/api/auth/updatepassword`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Forgot Password
- **POST** `/api/auth/forgotpassword`
- **Body**: 
```json
{
  "email": "john@example.com"
}
```

#### Reset Password
- **PUT** `/api/auth/resetpassword/:resettoken`
- **Body**: 
```json
{
  "password": "newpassword123"
}
```

### Paper Routes (`/api/papers`)

All paper routes require authentication. Include JWT token in headers:
```
Authorization: Bearer <your_jwt_token>
```

#### Get All Papers
- **GET** `/api/papers`

#### Get Single Paper
- **GET** `/api/papers/:id`

#### Create Paper
- **POST** `/api/papers`
- **Body**: 
```json
{
  "title": "Mathematics Final Exam",
  "subject": "Mathematics",
  "class": "10th Grade",
  "duration": 180,
  "totalMarks": 100,
  "sections": [
    {
      "sectionName": "Section A",
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "What is 2 + 2?",
          "marks": 2,
          "questionType": "multiple-choice",
          "options": ["2", "3", "4", "5"],
          "correctAnswer": "4"
        }
      ]
    }
  ],
  "instructions": "Read all questions carefully",
  "status": "draft"
}
```

#### Update Paper
- **PUT** `/api/papers/:id`
- **Body**: (same as create, with updated fields)

#### Delete Paper
- **DELETE** `/api/papers/:id`

#### Get Papers by Status
- **GET** `/api/papers/status/:status`
- Status values: `draft`, `published`, `archived`

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── paperController.js    # Paper CRUD logic
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   └── error.js             # Error handler middleware
├── models/
│   ├── User.js              # User schema
│   └── Paper.js             # Paper schema
├── routes/
│   ├── auth.js              # Auth routes
│   └── papers.js            # Paper routes
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Main entry point
└── README.md               # Documentation
```

## Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

### Paper Model
```javascript
{
  user: ObjectId (ref: User),
  title: String (required),
  subject: String (required),
  class: String (required),
  duration: Number (required),
  totalMarks: Number (required),
  sections: [{
    sectionName: String,
    questions: [{
      questionNumber: Number,
      questionText: String,
      marks: Number,
      questionType: String (enum),
      options: [String],
      correctAnswer: String
    }]
  }],
  instructions: String,
  status: String (enum: draft/published/archived),
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

1. User registers with name, email, and password
2. Password is hashed using bcrypt before saving
3. On login, password is compared with hashed password
4. JWT token is generated and sent to client
5. Client includes token in Authorization header for protected routes
6. Server verifies token and attaches user to request object

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Protected routes requiring authentication
- CORS configuration
- Input validation
- MongoDB injection protection

## Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- Frontend application

### Example curl command:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Troubleshooting

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check if your IP address is whitelisted in MongoDB Atlas
- Ensure the password doesn't contain special characters that need encoding

### JWT Issues
- Ensure JWT_SECRET is set in .env file
- Check token expiration time
- Verify token is sent in Authorization header as "Bearer <token>"

### CORS Issues
- Update FRONTEND_URL in .env file
- Check CORS configuration in server.js

## Next Steps

- [ ] Implement email service for password reset
- [ ] Add rate limiting
- [ ] Implement refresh tokens
- [ ] Add API documentation with Swagger
- [ ] Add unit tests
- [ ] Implement file upload for papers
- [ ] Add paper sharing functionality
- [ ] Implement paper templates

## License

ISC

## Support

For issues and questions, please contact the development team.
