const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, '../../latex/app.py');
const LATEX_ROOT = path.join(__dirname, '../../latex');
const ARTIFACT_EXTENSIONS = ['.pdf', '.log', '.aux', '.out', '.toc', '.synctex.gz'];
const PYTHON_CANDIDATES = [
  process.env.LATEX_PYTHON,
  process.env.PYTHON_PATH,
  process.env.PYTHON,
  'python',
  'py'
].filter(Boolean);

const sanitizeBaseName = (value = '') => {
  const safe = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (safe) {
    return safe;
  }

  return `paper_${crypto.randomBytes(6).toString('hex')}`;
};

const runPython = async (args) => {
  let lastError;

  for (const executable of PYTHON_CANDIDATES) {
    try {
      return await spawnProcess(executable, args);
    } catch (error) {
      if (error.code === 'ENOENT') {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  const fallbackError = new Error(
    'Unable to locate a Python interpreter. Set LATEX_PYTHON to a valid executable.'
  );
  fallbackError.cause = lastError;
  throw fallbackError;
};

const spawnProcess = (executable, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      error.executable = executable;
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const error = new Error(`Python process exited with code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        error.executable = executable;
        return reject(error);
      }

      resolve({ stdout, stderr, executable });
    });
  });

const parseCompilerOutput = (stdout) => {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error('No output received from LaTeX compiler');
  }

  const tail = lines[lines.length - 1];

  try {
    const parsed = JSON.parse(tail);
    if (!parsed.pdf) {
      throw new Error('Python script did not return a pdf path');
    }
    return parsed.pdf;
  } catch (error) {
    const parsingError = new Error('Unable to parse LaTeX compiler output');
    parsingError.cause = error;
    parsingError.stdout = stdout;
    throw parsingError;
  }
};

const cleanupLatexArtifacts = async () => {
  try {
    const entries = await fs.readdir(LATEX_ROOT, { withFileTypes: true });
    const deletions = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          ARTIFACT_EXTENSIONS.some((extension) => entry.name.toLowerCase().endsWith(extension))
      )
      .map((entry) => fs.rm(path.join(LATEX_ROOT, entry.name), { force: true }));

    await Promise.all(deletions);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('Failed to clean LaTeX artifacts:', error);
    }
  }
};

const generatePdfFromLatex = async (latexContent, baseName) => {
  if (!latexContent) {
    throw new Error('No LaTeX content provided for PDF generation');
  }

  const safeName = sanitizeBaseName(baseName);
  const tempDirPrefix = path.join(os.tmpdir(), 'latex-');
  const workingDir = await fs.mkdtemp(tempDirPrefix);
  const texPath = path.join(workingDir, `${safeName}.tex`);

  const cleanup = async () => {
    await fs.rm(workingDir, { recursive: true, force: true });
  };

  try {
    await fs.writeFile(texPath, latexContent, 'utf8');

    const args = [
      SCRIPT_PATH,
      '--tex',
      texPath,
      '--out',
      workingDir,
      '--cleanup'
    ];

    const { stdout } = await runPython(args);
    const pdfPath = parseCompilerOutput(stdout);
    const pdfBuffer = await fs.readFile(pdfPath);

    return {
      pdfBuffer,
      filename: `${safeName}.pdf`,
      cleanup
    };
  } catch (error) {
    await cleanup().catch(() => {});
    throw error;
  }
};

module.exports = {
  generatePdfFromLatex,
  cleanupLatexArtifacts
};
