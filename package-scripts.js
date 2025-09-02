// NPM Scripts Helper - Run with: npm run <script-name>
// Add to package.json scripts section:

const scripts = {
  // Lint and auto-fix React imports
  "lint": "eslint src --max-warnings=0",
  "lint:fix": "eslint src --fix",
  
  // Fix React imports with codemod
  "fix:imports": "jscodeshift -t fix-react-imports.js src/hooks src/components",
  "fix:imports:hooks": "jscodeshift -t fix-react-imports.js src/hooks",
  "fix:imports:components": "jscodeshift -t fix-react-imports.js src/components",
  
  // Combined fix + lint workflow
  "clean:imports": "npm run fix:imports && npm run lint:fix",
  
  // Pre-commit governance
  "pre-commit": "npm run lint && npm test"
};

console.log('Add these scripts to your package.json:');
console.log(JSON.stringify(scripts, null, 2));