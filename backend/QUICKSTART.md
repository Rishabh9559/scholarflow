# 🚀 Quick Start Guide - PaperCraftor Backend

## ⚠️ IMPORTANT: Before Running the Server

### Step 1: Configure MongoDB Connection

Open the `.env` file and update the MongoDB URI with your actual password:

**Current (WRONG):**
```
MONGODB_URI=mongodb+srv://rishabhkushwaha9559_db_user:<db_password>@papercraftor.omsykne.mongodb.net/papercraftor?retryWrites=true&w=majority&appName=PaperCraftor
```

**Update to (CORRECT):**
```
MONGODB_URI=mongodb+srv://rishabhkushwaha9559_db_user:YOUR_ACTUAL_PASSWORD_HERE@papercraftor.omsykne.mongodb.net/papercraftor?retryWrites=true&w=majority&appName=PaperCraftor
```

Replace `<db_password>` or `YOUR_ACTUAL_PASSWORD_HERE` with your actual MongoDB Atlas password.

### Step 2: Update JWT Secret (Important for Security!)

In the `.env` file, change the JWT_SECRET to a strong, unique value:

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_xyz123ABC
```

You can generate a random secret using:

**PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Or online**: https://randomkeygen.com/

### Step 3: Start the Server

**Development Mode (recommended):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### Step 4: Verify Server is Running

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: papercraftor.omsykne.mongodb.net
Pinged your deployment. You successfully connected to MongoDB!
```

### Step 5: Test the API

Open your browser or use curl:
```
http://localhost:5000
```

Expected response:
```json
{
  "success": true,
  "message": "PaperCraftor API is running",
  "version": "1.0.0"
}
```

## 📋 Checklist

- [ ] Updated MongoDB password in `.env`
- [ ] Changed JWT_SECRET in `.env`
- [ ] Ran `npm install` (if not done already)
- [ ] Started server with `npm run dev`
- [ ] Verified server is running at http://localhost:5000
- [ ] Read `API_TESTING.md` for testing endpoints

## 🔐 MongoDB Atlas Setup (If Needed)

If you need to get your MongoDB password or create a new database user:

1. Go to https://cloud.mongodb.com/
2. Login to your account
3. Select your project "PaperCraftor"
4. Go to "Database Access" in the left sidebar
5. Click on "Add New Database User" or edit existing user
6. Set/view the password
7. Make sure the user has "Read and write to any database" privileges

## 🌐 IP Whitelist (If Connection Fails)

If you get connection errors:

1. Go to MongoDB Atlas dashboard
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address
5. Click "Confirm"

## 🧪 Testing the Backend

Once the server is running, test it:

1. **Using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000"
```

2. **Register a user:**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

3. **Check all testing examples in:** `API_TESTING.md`

## ❌ Common Errors & Solutions

### Error: "bad auth : authentication failed"
**Solution:** Your MongoDB password is incorrect. Update it in `.env` file.

### Error: "MongoServerError: bad auth"
**Solution:** The password in MONGODB_URI contains special characters that need to be URL encoded.
- Example: If password is `p@ss!word`, encode it as `p%40ss%21word`
- Or create a new password without special characters

### Error: "connect ECONNREFUSED"
**Solution:** 
- Check your internet connection
- Verify your IP is whitelisted in MongoDB Atlas
- Check if MongoDB URI is correct

### Error: "JWT_SECRET is not defined"
**Solution:** Make sure `.env` file exists and contains JWT_SECRET

## 📁 Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Auth & error handling
├── models/         # Database schemas
├── routes/         # API routes
├── .env            # Environment variables (MUST UPDATE!)
├── server.js       # Main entry point
└── README.md       # Full documentation
```

## 📚 Next Steps

1. ✅ Configure and start backend (you are here!)
2. 📖 Read `README.md` for complete API documentation
3. 🧪 Test APIs using `API_TESTING.md`
4. 🎨 Connect your frontend to the backend
5. 🚀 Deploy to production

## 🆘 Need Help?

- Read the full `README.md` file
- Check `API_TESTING.md` for API examples
- Verify all environment variables in `.env`
- Make sure MongoDB Atlas is properly configured

---

**Remember:** Never commit your `.env` file to version control! It contains sensitive information.
