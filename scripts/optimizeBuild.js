const fs = require('fs');
const path = require('path');
const { gzip } = require('zlib');
const { promisify } = require('util');

const gzipAsync = promisify(gzip);

async function optimizeBuild() {
  const buildPath = path.join(__dirname, '../build');
  
  // Gzip CSS and JS files
  const files = getAllFiles(buildPath);
  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(file);
      const compressed = await gzipAsync(content);
      fs.writeFileSync(`${file}.gz`, compressed);
    }
  }
  
  console.log('Build optimization complete!');
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  
  return arrayOfFiles;
}

optimizeBuild().catch(console.error);
