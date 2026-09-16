import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');

function getAllFiles(dir, exts = ['.jsx', '.js', '.css']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      const ext = path.extname(fullPath);
      if (exts.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function inspectCssBlocks(cssContent, filePath) {
  const blockRegex = /([^{]+)\{([^}]+)\}/g;
  let match;
  const violations = [];
  while ((match = blockRegex.exec(cssContent)) !== null) {
    const selector = match[1].trim();
    const rules = match[2];
    if (
      selector.includes('.fin-card') ||
      selector.includes('.modal-card') ||
      selector.includes('.metric-box')
    ) {
      const declarations = rules.split(';').map((d) => d.trim()).filter(Boolean);
      for (const dec of declarations) {
        const colonIdx = dec.indexOf(':');
        if (colonIdx === -1) continue;
        const prop = dec.slice(0, colonIdx).trim().toLowerCase();
        const val = dec.slice(colonIdx + 1).trim().toLowerCase();
        if (prop === 'border' && !val.startsWith('none') && !val.startsWith('0')) {
          violations.push(`❌ [CSS Violation] ${filePath} (${selector}): Prohibited border "${val}" found!`);
        }
        if (prop === 'box-shadow' && !val.startsWith('none') && !val.startsWith('0')) {
          violations.push(`❌ [CSS Violation] ${filePath} (${selector}): Prohibited box-shadow "${val}" found!`);
        }
      }
    }
  }
  return violations;
}

function lint() {
  console.log('--- Design & Animation System Linter ---');
  const files = getAllFiles(SRC_DIR);
  let violationCount = 0;

  // 1. Check CSS for prohibited borders or shadows on cards
  const cssFiles = files.filter((f) => f.endsWith('.css'));
  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, 'utf8');
    const violations = inspectCssBlocks(content, path.relative(process.cwd(), cssFile));
    for (const v of violations) {
      console.error(v);
      violationCount++;
    }
  }

  // 2. Check Modals in JSX to ensure they use useModalAnimation or Modal primitive
  const modalFiles = files.filter((f) => path.basename(f).includes('Modal.jsx'));
  for (const modalFile of modalFiles) {
    if (path.basename(modalFile) === 'Modal.jsx') continue; // Primitive component itself
    const content = fs.readFileSync(modalFile, 'utf8');

    const usesHook = content.includes('useModalAnimation');
    const usesModalPrimitive = content.includes('<Modal');

    if (!usesHook && !usesModalPrimitive) {
      console.error(
        `❌ [Animation Violation] ${path.relative(
          process.cwd(),
          modalFile
        )}: Modal does not use useModalAnimation or <Modal /> primitive. Risk of instant unmount on close!`
      );
      violationCount++;
    }
  }

  if (violationCount === 0) {
    console.log('✓ All Design System & Animation constraints PASSED! 0 violations found.');
    process.exit(0);
  } else {
    console.error(`FAILED: ${violationCount} design system violation(s) found.`);
    process.exit(1);
  }
}

lint();
