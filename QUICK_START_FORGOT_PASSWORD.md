# 🚀 Quick Start - Test Forgot Password Feature

## Step 1: Restart Backend Server

The backend needs to be restarted to load the email configuration:

```powershell
# Stop current backend (Ctrl+C in backend terminal)
# Then restart:
cd "c:\Users\Rishabh Kushwaha\study\format\backend"
npm run dev
```

**Look for this in console:**
```
✅ Email server is ready to send messages
Server running on port 5000
```

---

## Step 2: Test the Feature

### Option A: Use Your Own Email

1. Open browser: http://localhost:3000/login
2. Click **"Forgot Password?"**
3. Enter your email (must be registered first!)
4. Click **"Send New Password"**
5. Check your email inbox (and spam folder)
6. Copy the new password from email
7. Go back to login
8. Login with email + new password

### Option B: Test with rishabh9june2020@gmail.com

1. First, register this account (if not already):
   - Email: `rishabh9june2020@gmail.com`
   - Name: `Test User`
   - Password: `test123`

2. Logout and go to forgot password

3. Enter: `rishabh9june2020@gmail.com`

4. Click "Send New Password"

5. Check inbox at rishabh9june2020@gmail.com

6. Use new password to login

---

## Step 3: Verify Email Received

### Email Should Contain:

✅ Subject: "Password Reset - ScholarFlow"
✅ Beautiful gradient header
✅ ScholarFlow logo (📚)
✅ Your name: "Hello [Your Name]"
✅ New password in a highlighted box
✅ Security warnings
✅ "Login to ScholarFlow" button
✅ Professional footer

### Email Appearance:
- Purple/blue gradient at top
- White content box
- Large password display
- Yellow warning box
- Blue login button
- Footer with ScholarFlow branding

---

## 🎯 Expected Results

### Success Case:
1. ✅ Submit email → Loading spinner appears
2. ✅ Success screen: "Check Your Email"
3. ✅ Email arrives within 5-10 seconds
4. ✅ Password in email works for login
5. ✅ Can login successfully

### Error Cases:

**Unregistered Email:**
- ❌ Shows: "No account found with this email address"
- Page stays on forgot password form
- Can try again with different email

**Invalid Email Format:**
- ❌ Shows: "Please enter a valid email address"
- Validated on frontend (no API call)

**Empty Email:**
- ❌ Shows: "Please enter your email address"

---

## 🐛 If Email Doesn't Arrive

### Check 1: Backend Console
Look for errors in terminal:
```
❌ Error sending email: [error message]
```

### Check 2: Spam Folder
Gmail might put it in spam initially

### Check 3: Backend is Running
Verify backend server is running on port 5000

### Check 4: .env File
Verify these lines exist in `backend/.env`:
```
GMAIL_USER=rishabh9june2020@gmail.com
GMAIL_PASS=rrog lnfs uvap qwzf
```

### Check 5: Internet Connection
Nodemailer needs internet to send via Gmail

---

## 📧 What Happens Behind the Scenes

1. **User enters email** → Frontend validates format
2. **Frontend sends to API** → `POST /api/auth/forgotpassword`
3. **Backend finds user** → Searches MongoDB
4. **Generates password** → Random 10-char password
5. **Updates database** → Password hashed with bcrypt
6. **Sends email** → Uses Gmail SMTP
7. **Returns success** → Frontend shows "Check Email"

---

## 🔐 Security Notes

- ✅ Password is 10 characters with mixed case, numbers, symbols
- ✅ Password is hashed before storing (bcrypt)
- ✅ Email sent via secure TLS/SSL (port 465)
- ✅ Gmail App Password used (not regular password)
- ✅ No sensitive data in API responses
- ✅ User encouraged to change password after login

---

## 🎉 You're Ready!

Just restart the backend and test the feature. It should work perfectly!

**Any issues? Check the full documentation:** `FORGOT_PASSWORD_COMPLETE.md`
