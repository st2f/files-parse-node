import fs from 'fs';
import engine from 'php-parser';

const parser = new engine({
  parser: { extractDoc: true, php8: true },
  ast: { withPositions: true },
});

export function processFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const ast = parser.parseCode(code);

    const classes = findAll(ast, node => node.kind === 'class');
    return `${filePath}: ${classes.length} classes`;
  } catch (err) {
    return `${filePath}: ERROR - ${err.message}`;
  }
}

function findAll(node, condition, results = []) {
  if (!node || typeof node !== 'object') return results;
  if (condition(node)) results.push(node);

  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach(c => findAll(c, condition, results));
    } else {
      findAll(child, condition, results);
    }
  }

  return results;
}
