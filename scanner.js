const fs = require('fs');
const path = require('path');

async function scanDirectory(dir, { depth = 3, showFiles = true }, currentDepth = 0) {
  if (currentDepth > depth) return '';

  try {
    const stats = await fs.promises.stat(dir);
    if (!stats.isDirectory()) return '';

    const items = await fs.promises.readdir(dir);
    const isRoot = currentDepth === 0;

    let tree = '';
    if (isRoot) {
      tree += path.basename(dir) + '/\n';
    }

    const dirs = [];
    const files = [];

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const itemStats = await fs.promises.stat(itemPath);
      if (itemStats.isDirectory()) {
        dirs.push(item);
      } else if (showFiles) {
        files.push(item);
      }
    }

    const allItems = [...dirs.sort(), ...files.sort()];
    const isLastFile = (i) => i === allItems.length - 1;

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const itemPath = path.join(dir, item);
      const itemStats = await fs.promises.stat(itemPath);

      const prefix = isRoot ? '' : '│   '.repeat(currentDepth);
      const connector = isLastFile(i) ? '└── ' : '├── ';

      tree += prefix + connector + item;
      tree += itemStats.isDirectory() ? '/' : '';
      tree += '\n';

      if (itemStats.isDirectory()) {
        const childTree = await scanDirectory(itemPath, { depth, showFiles }, currentDepth + 1);
        if (childTree && !isLastFile(i)) {
          // Add │ for non-last items
          const childLines = childTree.trimEnd().split('\n');
          tree += childLines.map((line, idx) =>
            prefix + (isLastFile(i) ? '    ' : '│   ') + line
          ).join('\n') + '\n';
        } else if (childTree) {
          tree += childTree;
        }
      }
    }

    return tree;
  } catch (err) {
    throw new Error(`Error scanning ${dir}: ${err.message}`);
  }
}

module.exports = { scanDirectory };