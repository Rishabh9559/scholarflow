# ScholarFlow

<div align="center">
  <a href="https://youtu.be/QI8zSLf_HtQ" target="_blank" rel="noopener noreferrer">
    <img src="https://img.youtube.com/vi/QI8zSLf_HtQ/maxresdefault.jpg" alt="ScholarFlow Demo Thumbnail" width="100%" />
  </a>
</div>


## Why I Built ScholarFlow

I am a final-year student preparing to publish my research. Drafting a paper and then reshaping it to satisfy different publication formats easily eats up one to two hours every time—a painful loop of copy-paste, template tweaking, and manual LaTeX fixes. ScholarFlow is the solution I wanted for myself: a workspace where I can polish the draft once and jump between formats with a single click while still retaining the flexibility to edit the LaTeX when needed.

ScholarFlow is a full-stack platform that helps researchers draft, manage, and export academic papers. It offers guided paper creation, LaTeX previews, and one-click PDF exports in IEEE format, Springer. Backed by secure authentication and email-based verification.

## Video Demo

> 🎥 Watch ScholarFlow on YouTube: [https://youtu.be/QI8zSLf_HtQ](https://youtu.be/QI8zSLf_HtQ)

## Key Features

- User registration with OTP verification, secure login, and profile management.
- Guided paper editor with sections for introduction, literature review, methodology, and conclusions.
- Instant LaTeX preview and downloadable IEEE-formatted PDF exports compiled via `pdflatex`.
- Email notifications for account verification and password resets.
- Role-based API protection using JWT-authenticated routes.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, React Router, Axios |
| Backend    | Node.js, Express, MongoDB (Mongoose) |
| Auth & Mail| JSON Web Tokens, Nodemailer (Gmail SMTP) |
| LaTeX Tool | Python 3 helper around `pdflatex` |

## Repository Structure

```
backend/   Express API, business logic, and LaTeX compilation service
frontend/  React single-page application
latex/     Python CLI wrapper invoked by the backend (pdflatex helper)
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas connection string (or local MongoDB instance)
- Gmail SMTP credentials (or alternative SMTP credentials wired into `config/emailConfig.js`)
- Python 3.9+ with `pdflatex` available on the system `PATH` (e.g., MiKTeX, TeX Live)
- Windows users: ensure `py` or `python` launches the desired interpreter; optionally set `LATEX_PYTHON`.

## Environment Variables

Create the following `.env` files.

### `backend/.env`

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
GMAIL_USER=your.account@gmail.com
GMAIL_PASS=app-specific-password
LATEX_PYTHON=py
```

> `LATEX_PYTHON` is optional. Set it when `python` on the PATH is not the interpreter you want to use.

### `frontend/.env`

```
REACT_APP_API_URL=http://localhost:5000/api
```

Restart the corresponding server whenever you update `.env` values.

## Setup & Run

### 1. Install Dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### 2. Start the Development Servers

- **Backend:**
  ```powershell
  cd backend
  npm run dev
  ```
  The API listens on `http://localhost:5000` and exposes routes under `/api` (e.g., `/api/auth/login`).

- **Frontend:**
  ```powershell
  cd frontend
  npm start
  ```
  The React app is served at `http://localhost:3000`.

### 3. LaTeX Compilation Helper

The backend invokes `latex/app.py` to compile generated LaTeX into PDFs. Confirm the following:

1. `pdflatex` is installed and reachable from the command line.
2. Python can execute `latex/app.py`. If you have multiple interpreters, set `LATEX_PYTHON` in `backend/.env`.
3. The first IEEE PDF download may take a few seconds while dependencies warm up; a spinner is shown in the UI.

## Common Commands

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | `backend/` | Start API with Nodemon.
| `npm start` | `frontend/` | Launch React development server.
| `npm run build` | `frontend/` | Produce production build under `build/`.
| `node latex/app.py --tex <file.tex> --out <output-dir> --cleanup` | repo root | Manually compile a LaTeX document for testing.

## API Highlights

- `POST /api/auth/register` – Begin account registration (sends OTP email).
- `POST /api/auth/verify-otp` – Complete registration using the OTP.
- `POST /api/auth/login` – Obtain JWT.
- `GET /api/papers` – List authenticated user's papers.
- `GET /api/latex/preview/ieee/:paperId` – Return IEEE LaTeX content.
- `GET /api/latex/ieee/pdf/:paperId` – Download a compiled IEEE PDF.

All protected routes require the `Authorization: Bearer <token>` header.

## PDF & Artifact Cleanup

Every PDF export writes temporary files into the OS temp directory and removes them after the download completes. Residual artifacts (e.g., `.pdf`, `.log`, `.aux`) inside the `latex/` folder are also cleaned automatically per request.

## Testing SMTP

Gmail requires either an application-specific password or OAuth2. Ensure "Less secure app access" is enabled for testing or configure `emailConfig.js` to use your SMTP provider. Consider using services like Mailtrap during development.

## Troubleshooting

- **`pdflatex failed` or missing executable:** Verify that LaTeX is installed and the executable is on the PATH used by the Node.js process.
- **Email delivery fails:** Double-check `GMAIL_USER`/`GMAIL_PASS` and allow the account to send SMTP messages.
- **MongoDB connection errors:** Ensure your IP is whitelisted in Atlas or that a local MongoDB instance is running.
- **CORS issues:** Update `FRONTEND_URL` in `backend/.env` to match the origin hosting the React app.

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/awesome`
3. Commit changes following conventional commit messages.
4. Push and open a pull request.

## License

This project is licensed under the ISC License. See the `LICENSE` file if available, or define your licensing terms here.
