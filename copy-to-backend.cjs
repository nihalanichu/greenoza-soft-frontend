const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

(async () => {
  try {
    const repoRoot = path.resolve(__dirname);
    const distDir = path.join(repoRoot, 'dist');
    if (!fs.existsSync(distDir)) {
      console.error('Build output not found. Run `npm run build` first.');
      process.exit(1);
    }

    const backendPublic = path.resolve(repoRoot, '..', 'backend-laravel', 'public', 'frontend');

    // Remove existing target
    if (fs.existsSync(backendPublic)) {
      fs.rmSync(backendPublic, { recursive: true, force: true });
    }

    // Copy dist to backend public/frontend
    copyRecursiveSync(distDir, backendPublic);

    console.log('Frontend build copied to backend-laravel/public/frontend');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
