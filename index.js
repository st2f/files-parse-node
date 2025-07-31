import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {processFile} from './fileProcessor.js';
import { fileURLToPath } from 'url';

// emulate __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CLI args
const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    demandOption: true,
    describe: 'Directory to scan (relative to this script)',
  })
  .option('filesPrefix', {
    alias: 'f',
    type: 'string',
    demandOption: true,
    describe: 'Prefix to match files or "*" for all',
  })
  .argv;

const baseDir = path.resolve(__dirname, argv.dir);
const filesPrefix = argv.filesPrefix;
const reportLines = [];

function timestamp() {
  return new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
}

async function walk(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? await walk(res) : res;
    })
  );
  return files.flat();
}

(async () => {
  try {
    const allFiles = await walk(baseDir);

    const matched = allFiles.filter(f => {
      const rel = path.relative(baseDir, f).replaceAll('\\', '/');
      return f.endsWith('.php') &&
        (filesPrefix === '*' || rel.startsWith(filesPrefix));
    });

    if (matched.length === 0) {
      console.log(`No PHP files matching "${filesPrefix}" found in ${baseDir}`);
      return;
    }

    for (const fullPath of matched) {
      const resultLine = processFile(fullPath);
      const relativeResultLine = resultLine.replace(baseDir + path.sep, '').replaceAll('\\', '/');
      reportLines.push(relativeResultLine);
      console.log(relativeResultLine);
    }

    const reportName = `report-${timestamp()}.txt`;
    const reportPath = path.join(__dirname, reportName);
    await fs.writeFile(reportPath, reportLines.join('\n'), 'utf8');
    console.log(`✅ Report saved to: ${reportPath}`);
  } catch (err) {
    console.error('🚨 Error:', err);
  }
})();
