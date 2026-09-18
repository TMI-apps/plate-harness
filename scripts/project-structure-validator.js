#!/usr/bin/env node
/**
 * Unified Project Structure Validator
 * 
 * Validates entire project structure against projectStructure.config.cjs
 * 
 * Handles all file types (parseable and non-parseable) and validates
 * the entire project structure recursively.
 * 
 * @relatedFiles
 * When updating this file, also check:
 * - projectStructure.config.cjs - Configuration file that defines allowed structure
 * - package.json - Contains scripts that call this validator (validate:structure)
 * - documentation/PROJECT-STRUCTURE-VALIDATION.md - User documentation
 * - ARCHITECTURE.md - Architecture documentation mentioning this validator
 * - .cursor/rules/file-placement/RULE.mdc - File placement rules that reference this
 * - .cursor/rules/architecture/RULE.mdc - Architecture rules mentioning structure validation
 */

const fs = require('fs');
const path = require('path');
const { minimatch } = require('minimatch');

// Load project structure config
const projectStructureConfig = require('../projectStructure.config.cjs');

// Cache for minimatch results to avoid repeated pattern matching
const minimatchCache = new Map();

// Default ignore patterns (common build artifacts and dependencies)
// NOTE: We intentionally DO NOT ignore .tmp_*, backup/, backups/, or *-check.* files
// so they get caught as violations by the validator
// NOTE: .eslintcache is ignored because CI runs `pnpm lint` before `validate:structure`,
// which creates it. Pre-commit uses validate:structure:staged (staged files only), so
// .eslintcache is never validated locally (it's in .gitignore, so never staged).
const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  'node_modules',
  'dist/**',
  'dist',
  'build/**',
  'build',
  '.git/**',
  '.git',
  '.firebase/**',
  '.firebase',
  '.next/**',
  '.next',
  '.cache/**',
  '.cache',
  'coverage/**',
  'coverage',
  '.nyc_output/**',
  '.nyc_output',
  '.DS_Store',
  'Thumbs.db',
  '.eslintcache', // ESLint cache (auto-generated when lint runs)
  '.pnpm-store/**', // pnpm cache directory
  '.pnpm-store',
  'supabase/.temp/**', // Supabase CLI temporary files
  'supabase/.temp',
  '.wrangler/**', // Wrangler local state (Cloudflare Workers)
  '.wrangler',
  '.agents/*.zip', // local skill zips; not a package artifact (D24)
  // Removed: 'backup/**', 'backup', 'backups/**', 'backups' - want to catch these as violations
  // Removed: '**/temp-*' - want to catch temp files as violations
  // Removed: '**/*-check.*' - want to catch check files as violations
  // Removed: '**/*-backup.*' - want to catch backup files as violations
  // Removed: '.tmp_*' - want to catch temporary files as violations
];

/**
 * Check if a path should be ignored (with caching)
 */
function createIgnoreChecker(ignorePatterns) {
  const cache = new Map();
  const cwd = process.cwd();
  
  return function shouldIgnore(filePath) {
    // Check cache first
    if (cache.has(filePath)) {
      return cache.get(filePath);
    }
    
    const relativePath = path.relative(cwd, filePath);
    const basename = path.basename(relativePath);
    
    for (const pattern of ignorePatterns) {
      if (minimatch(relativePath, pattern) || minimatch(basename, pattern)) {
        cache.set(filePath, true);
        return true;
      }
    }
    
    cache.set(filePath, false);
    return false;
  };
}

/**
 * Build a validation tree from the config structure
 * Returns a map of paths to allowed patterns
 */
function buildValidationTree(structure) {
  const tree = new Map();
  
  function processItem(item, currentPath) {
    if (!item || typeof item !== 'object' || !item.name) {
      return;
    }
    
    // Normalize path (use forward slashes for consistency)
    const itemPath = currentPath === '' ? item.name : `${currentPath}/${item.name}`;
    const normalizedPath = itemPath.replace(/\/+/g, '/');
    
    if (item.children && Array.isArray(item.children)) {
      // This is a folder with children
      const allowedFiles = [];
      const allowedFolders = [];
      
      for (const child of item.children) {
        if (child && typeof child === 'object' && child.name) {
          if (child.children) {
            // It's a subfolder
            allowedFolders.push(child.name);
            processItem(child, normalizedPath);
          } else {
            // It's a file pattern
            allowedFiles.push(child.name);
          }
        }
      }
      
      // Store configuration for this path
      tree.set(normalizedPath, {
        allowedFiles,
        allowedFolders,
        path: normalizedPath,
      });
    } else {
      // This is a file pattern at root level
      const rootKey = '.';
      if (!tree.has(rootKey)) {
        tree.set(rootKey, {
          allowedFiles: [],
          allowedFolders: [],
          path: rootKey,
        });
      }
      tree.get(rootKey).allowedFiles.push(item.name);
    }
  }
  
  // Process root level items
  const rootFolders = [];
  for (const item of structure) {
    if (item && typeof item === 'object' && item.name) {
      if (item.children) {
        // It's a folder - track it for root level
        rootFolders.push(item.name);
      }
      processItem(item, '');
    }
  }
  
  // Ensure root level configuration exists for folder validation
  if (!tree.has('.')) {
    tree.set('.', {
      allowedFiles: [],
      allowedFolders: rootFolders,
      path: '.',
    });
  } else {
    // Merge root folders if root files were already added
    tree.get('.').allowedFolders = rootFolders;
  }
  
  return tree;
}

/**
 * Check if a name matches any allowed pattern (cached)
 * Used for both files and folders
 */
function matchesPattern(name, patterns) {
  for (const pattern of patterns) {
    const cacheKey = `${name}:${pattern}`;
    let result = minimatchCache.get(cacheKey);
    if (result === undefined) {
      result = minimatch(name, pattern);
      minimatchCache.set(cacheKey, result);
    }
    if (result) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a file matches any allowed pattern in a directory
 */
function matchesFilePattern(fileName, patterns) {
  return matchesPattern(fileName, patterns);
}

/**
 * Check if a folder name matches any allowed pattern
 */
function matchesFolderPattern(folderName, patterns) {
  return matchesPattern(folderName, patterns);
}

/**
 * Build a path lookup structure for faster matching
 * Creates a trie-like structure for O(depth) lookups instead of O(configs)
 */
function buildPathLookup(tree) {
  const lookup = new Map();
  const exactPaths = new Map();
  const allConfigs = new Map(); // Store all configs for retrieval
  
  // Separate exact paths from wildcard paths for faster lookup
  for (const [configPath, config] of tree.entries()) {
    // Store all configs for retrieval
    allConfigs.set(configPath, config);
    
    if (configPath === '.') {
      exactPaths.set('.', config);
      continue;
    }
    
    const parts = configPath.split('/').filter(p => p);
    const hasWildcard = parts.includes('*');
    
    if (!hasWildcard) {
      // Exact path - store directly
      exactPaths.set(configPath, config);
    } else {
      // Wildcard path - build lookup structure
      let current = lookup;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === '*') {
          // Store wildcard match at this level
          if (!current.has('*')) {
            current.set('*', new Map());
          }
          current = current.get('*');
        } else {
          if (!current.has(part)) {
            current.set(part, new Map());
          }
          current = current.get(part);
        }
      }
      // Store config at the end
      if (!current.has('__config__')) {
        current.set('__config__', []);
      }
      current.get('__config__').push({ path: configPath, config, parts, hasWildcard: true });
    }
  }
  
  return { lookup, exactPaths, allConfigs };
}

/**
 * Find the matching configuration path for a given file/directory path
 * Optimized with trie-like lookup structure
 */
function findMatchingConfigPath(targetPath, lookupStructure) {
  const { lookup, exactPaths, allConfigs } = lookupStructure;
  
  if (!targetPath || targetPath === '.') {
    return exactPaths.has('.') ? '.' : null;
  }
  
  // Try exact match first (fastest)
  if (exactPaths.has(targetPath)) {
    return targetPath;
  }
  
  const targetParts = targetPath.split('/').filter(p => p);
  let bestMatch = null;
  let bestMatchDepth = -1;
  let bestMatchHasWildcard = true;
  const checkedExactPaths = new Set(['.']); // Track exact paths we've already checked
  
  // Phase 1: Try exact paths that are prefixes (parent matches)
  // Iterate in reverse order of path length to find longest match first
  const exactPathsArray = Array.from(exactPaths.entries())
    .filter(([p]) => p !== '.')
    .map(([path, config]) => ({
      path,
      parts: path.split('/').filter(p => p),
      config,
    }))
    .sort((a, b) => b.parts.length - a.parts.length); // Sort descending by length
  
  for (const { path: exactPath, parts: exactParts } of exactPathsArray) {
    if (exactParts.length > targetParts.length) continue; // Can't be a prefix if longer
    if (exactParts.length <= bestMatchDepth) break; // Already found longer match
    
    let matches = true;
    for (let i = 0; i < exactParts.length; i++) {
      if (exactParts[i] !== targetParts[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      bestMatch = exactPath;
      bestMatchDepth = exactParts.length;
      bestMatchHasWildcard = false;
      checkedExactPaths.add(exactPath);
      break; // Found longest match, no need to continue
    }
  }
  
  // Phase 2: Check wildcard config paths for same-length matches
  // Same-length matches are more specific than parent matches, so they override Phase 1 results
  // Skip configs already checked in exact match phase for performance
  for (const [configPath, config] of allConfigs.entries()) {
    // Skip root and already-checked exact paths
    if (configPath === '.' || checkedExactPaths.has(configPath)) continue;
    
    const configParts = configPath.split('/').filter(p => p);
    
    // Only match same-length paths (exact match with wildcards)
    if (configParts.length !== targetParts.length) continue;
    
    // Check if config path matches target path (considering wildcards)
    let matches = true;
    let wildcardCount = 0;
    for (let i = 0; i < configParts.length; i++) {
      if (configParts[i] === '*') {
        wildcardCount++;
      } else if (configParts[i] !== targetParts[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      // Same-length matches always override parent matches (more specific)
      // Among same-length matches, prefer fewer wildcards (more specific)
      const currentWildcardCount = bestMatch ? (bestMatch.split('*').length - 1) : Infinity;
      if (bestMatch === null || 
          configParts.length > bestMatchDepth ||
          (configParts.length === bestMatchDepth && wildcardCount < currentWildcardCount)) {
        bestMatch = configPath;
        bestMatchDepth = configParts.length;
        bestMatchHasWildcard = wildcardCount > 0;
      }
    }
  }
  
  // Phase 3: Handle wildcard parent matches explicitly (if no same-length match found)
  // This handles cases like src/features/admin/billing matching src/features/*/*
  // Only run if Phase 2 didn't find a same-length match
  if (bestMatch === null || bestMatchDepth < targetParts.length) {
    for (const [configPath, config] of allConfigs.entries()) {
      // Skip root and already-checked exact paths
      if (configPath === '.' || checkedExactPaths.has(configPath)) continue;
      
      const configParts = configPath.split('/').filter(p => p);
      
      // Only check shorter wildcard paths (parent matches)
      if (configParts.length >= targetParts.length) continue;
      
      // Check if config path is a prefix match (considering wildcards)
      let matches = true;
      let wildcardCount = 0;
      for (let i = 0; i < configParts.length; i++) {
        if (configParts[i] === '*') {
          wildcardCount++;
        } else if (configParts[i] !== targetParts[i]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        // Prefer longer parent matches with fewer wildcards
        const currentWildcardCount = bestMatch ? (bestMatch.split('*').length - 1) : Infinity;
        if (bestMatch === null || 
            configParts.length > bestMatchDepth ||
            (configParts.length === bestMatchDepth && wildcardCount < currentWildcardCount)) {
          bestMatch = configPath;
          bestMatchDepth = configParts.length;
          bestMatchHasWildcard = wildcardCount > 0;
        }
      }
    }
  }
  
  return bestMatch;
}

/**
 * Validate a file against the validation tree
 * Pure whitelist approach: only files explicitly allowed in config are permitted
 */
function validateFile(filePath, lookupStructure, violations, cwd) {
  const relativePath = path.relative(cwd, filePath).replace(/\\/g, '/');
  const parts = relativePath.split('/').filter(p => p);
  const fileName = parts[parts.length - 1];
  const dirPath = parts.slice(0, -1).join('/') || '.';
  
  // Find matching configuration for the directory
  const matchingPath = findMatchingConfigPath(dirPath, lookupStructure);
  
  if (!matchingPath) {
    violations.push({
      file: relativePath,
      type: 'file',
      message: `File "${fileName}" is in an unallowed location: "${dirPath}"`,
      expected: 'File should be moved to an allowed directory or added to projectStructure.config.cjs',
    });
    return;
  }
  
  const { exactPaths, allConfigs } = lookupStructure;
  const config = exactPaths.get(matchingPath) || allConfigs.get(matchingPath);
  if (!config) {
    return;
  }
  
  // Check if file matches allowed patterns
  if (config.allowedFiles.length > 0) {
    if (!matchesFilePattern(fileName, config.allowedFiles)) {
      violations.push({
        file: relativePath,
        type: 'file',
        message: `File "${fileName}" does not match allowed patterns in "${matchingPath}"`,
        expected: `Expected one of: ${config.allowedFiles.join(', ')}`,
      });
    }
  } else if (config.allowedFolders.length > 0) {
    // Directory only allows subfolders, not direct files
    violations.push({
      file: relativePath,
      type: 'file',
      message: `File "${fileName}" is not allowed directly in "${matchingPath}" (only subfolders allowed)`,
      expected: `Move file to an allowed subfolder (${config.allowedFolders.join(', ')}) or update projectStructure.config.cjs`,
    });
  } else {
    // No files or folders allowed - this shouldn't happen, but handle it
    violations.push({
      file: relativePath,
      type: 'file',
      message: `File "${fileName}" is not allowed in "${matchingPath}"`,
      expected: 'Update projectStructure.config.cjs to allow this file',
    });
  }
}

/**
 * Validate a directory against the validation tree
 */
function validateDirectory(dirPath, lookupStructure, violations, cwd) {
  const relativePath = path.relative(cwd, dirPath).replace(/\\/g, '/');
  const parts = relativePath.split('/').filter(p => p);
  const dirName = parts[parts.length - 1];
  const parentPath = parts.slice(0, -1).join('/') || '.';
  
  // Find matching parent configuration
  const matchingPath = findMatchingConfigPath(parentPath, lookupStructure);
  
  if (!matchingPath) {
    // Check if it's a root-level directory
    const { exactPaths } = lookupStructure;
    const rootConfig = exactPaths.get('.');
    if (rootConfig) {
      if (!matchesFolderPattern(dirName, rootConfig.allowedFolders)) {
        violations.push({
          file: relativePath,
          type: 'directory',
          message: `Directory "${dirName}" is not allowed at root level`,
          expected: rootConfig.allowedFolders.length > 0
            ? `Expected one of: ${rootConfig.allowedFolders.join(', ')}`
            : 'No directories allowed at root level',
        });
      }
    } else {
      violations.push({
        file: relativePath,
        type: 'directory',
        message: `Directory "${dirName}" is in an unallowed location: "${parentPath}"`,
        expected: 'Directory should be moved to an allowed location or added to projectStructure.config.cjs',
      });
    }
    return;
  }
  
  const { exactPaths, allConfigs } = lookupStructure;
  const config = exactPaths.get(matchingPath) || allConfigs.get(matchingPath);
  if (!config) {
    return;
  }
  
  // Check if directory matches allowed folder patterns
  if (config.allowedFolders.length > 0) {
    if (!matchesFolderPattern(dirName, config.allowedFolders)) {
      violations.push({
        file: relativePath,
        type: 'directory',
        message: `Directory "${dirName}" does not match allowed patterns in "${matchingPath}"`,
        expected: `Expected one of: ${config.allowedFolders.join(', ')}`,
      });
    }
  } else if (config.allowedFiles.length > 0) {
    // Parent only allows files, not subdirectories
    violations.push({
      file: relativePath,
      type: 'directory',
      message: `Directory "${dirName}" is not allowed in "${matchingPath}" (only files allowed)`,
      expected: 'Remove directory or update projectStructure.config.cjs to allow subdirectories',
    });
  }
}

/**
 * Validate route component placement
 * Checks that route-level components are imported from @/pages/ not @/features/
 * Architecture rule: Route-level components MUST be in src/pages/
 */
function validateRoutePlacement(routesFilePath, violations, cwd) {
  if (!fs.existsSync(routesFilePath)) {
    return; // Routes file doesn't exist, skip validation
  }
  
  const content = fs.readFileSync(routesFilePath, 'utf-8');
  
  // Compute relative path once (used in violation reporting)
  const relativePath = path.relative(cwd, routesFilePath).replace(/\\/g, '/');
  
  // Extract all imports and map component names to their import paths
  const importRegex = /import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  const imports = new Map();
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[3];
    const namedImports = match[1];
    const defaultImport = match[2];
    
    if (namedImports) {
      // Handle named imports: { Component1, Component2 as Alias }
      // Use regex to extract names directly (more efficient than split/map)
      const nameRegex = /(?:^|,)\s*(\w+)(?:\s+as\s+(\w+))?/g;
      let nameMatch;
      while ((nameMatch = nameRegex.exec(namedImports)) !== null) {
        const name = nameMatch[2] || nameMatch[1]; // Use alias if present, otherwise original name
        if (name) {
          imports.set(name, importPath);
        }
      }
    } else if (defaultImport) {
      // Handle default import: import Component from '...'
      imports.set(defaultImport, importPath);
    }
  }
  
  // Find Route elements and check their component imports
  // Match patterns like:
  // - <Route path="..." element={<Component />} />
  // - element={<ProtectedRoute element={<Component />} />}
  // - element={<ErrorBoundary><Component /></ErrorBoundary>}
  const routeRegex = /<Route\s+path=['"]([^'"]+)['"][^>]*>/g;
  const wrapperComponents = new Set(['ProtectedRoute', 'ErrorBoundary', 'Navigate', 'SAMLCallback', 'AdminLayout', 'AppLayout']);
  
  while ((match = routeRegex.exec(content)) !== null) {
    const routePath = match[1];
    const routeStart = match.index;
    
    // Find element prop in the content starting from this Route tag
    // Use indexOf with offset instead of creating substring (more efficient)
    const searchEnd = Math.min(routeStart + 2000, content.length);
    const elementStart = content.indexOf('element={', routeStart);
    if (elementStart === -1 || elementStart >= searchEnd) continue;
    
    // Find matching closing brace (handle nested braces and JSX)
    // elementStart points to start of "element={", so elementStart + 8 is after "{"
    // We need to find the matching "}" that closes this brace
    let braceCount = 1; // Start at 1 because we're already inside the opening brace
    let elementContent = '';
    let inString = false;
    let stringChar = null;
    let elementContentEnd = -1;
    
    for (let i = elementStart + 8; i < searchEnd; i++) {
      const char = content[i];
      
      // Handle string literals
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && content[i - 1] !== '\\') {
        inString = false;
        stringChar = null;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            // Found the matching closing brace
            elementContentEnd = i;
            break;
          }
        }
      }
    }
    
    if (elementContentEnd === -1) continue;
    
    // Extract content between the braces (excluding the braces themselves)
    elementContent = content.substring(elementStart + 8, elementContentEnd).trim();
    
    if (!elementContent) continue;
    
    // Find the actual component (skip wrappers) - iterate directly without creating array
    let componentName = null;
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)\s*\/?>/g;
    let compMatch;
    
    while ((compMatch = componentRegex.exec(elementContent)) !== null) {
      const comp = compMatch[1];
      if (!wrapperComponents.has(comp)) {
        componentName = comp;
        break; // Use first non-wrapper component
      }
    }
    
    // If all found components are wrappers, check for prop-based nesting
    if (!componentName) {
      // Check for prop-based nesting: element={<Wrapper element={<Component />} />}
      const propNestedMatch = elementContent.match(/element=\{<([A-Z][a-zA-Z0-9]*)\s*\/?>/);
      if (propNestedMatch && !wrapperComponents.has(propNestedMatch[1])) {
        componentName = propNestedMatch[1];
      } else {
        continue; // Can't determine actual component
      }
    }
    
    if (!componentName || wrapperComponents.has(componentName)) {
      continue;
    }
    
    const importPath = imports.get(componentName);
    
    if (!importPath) {
      // Component not found in imports - might be inline or from different import
      // This is not a violation we can detect with simple parsing
      continue;
    }
    
    // Check if import is from @/features/ instead of @/pages/
    if (importPath.startsWith('@/features/')) {
      violations.push({
        file: relativePath,
        type: 'route',
        message: `Route "${routePath}" uses component "${componentName}" from features instead of pages`,
        expected: `Component should be imported from ${importPath.replace('@/features/', '@/pages/')} and placed in src/pages/`,
        route: routePath,
        component: componentName,
        importPath: importPath,
      });
    }
  }
}

/**
 * Recursively scan directory and validate structure
 * Optimized with cached ignore checker and lookup structure
 */
function scanDirectory(dirPath, lookupStructure, violations, shouldIgnore, exitOnFirst, cwd) {
  // Early exit if flag is set and violations found
  if (exitOnFirst && violations.length > 0) {
    return;
  }
  
  // Check ignore before recursing (early exit optimization)
  if (shouldIgnore(dirPath)) {
    return;
  }
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Early exit check before processing each entry
      if (exitOnFirst && violations.length > 0) {
        return;
      }
      
      const fullPath = path.join(dirPath, entry.name);
      
      // Check ignore before processing (early exit optimization)
      if (shouldIgnore(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        validateDirectory(fullPath, lookupStructure, violations, cwd);
        // Early exit check after directory validation
        if (exitOnFirst && violations.length > 0) {
          return;
        }
        scanDirectory(fullPath, lookupStructure, violations, shouldIgnore, exitOnFirst, cwd);
      } else if (entry.isFile()) {
        validateFile(fullPath, lookupStructure, violations, cwd);
        // Early exit check after file validation
        if (exitOnFirst && violations.length > 0) {
          return;
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read (permissions, etc.)
    if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
      console.warn(`Warning: Could not read directory ${dirPath}: ${error.message}`);
    }
  }
}

/**
 * Main validation function
 * Optimized with lookup structures and caching
 */
function validateProjectStructure(options = {}) {
  const {
    format = 'human',
    ignorePatterns = [],
    exitOnFirstViolation = false,
    files = null, // Optional: specific files to check (comma-separated paths)
  } = options;
  
  const cwd = process.cwd();
  
  // Build validation tree
  const tree = buildValidationTree(projectStructureConfig.structure);
  
  // Build optimized lookup structure (one-time cost)
  const lookupStructure = buildPathLookup(tree);
  
  // Create cached ignore checker (one-time setup)
  const allIgnorePatterns = [...DEFAULT_IGNORE_PATTERNS, ...ignorePatterns];
  const shouldIgnore = createIgnoreChecker(allIgnorePatterns);
  
  // Collect violations
  const violations = [];
  
  // Validate route component placement (architecture rule)
  const routesFilePath = path.join(cwd, 'src/routes/index.tsx');
  validateRoutePlacement(routesFilePath, violations, cwd);
  
  // If specific files provided, validate only those
  if (files && Array.isArray(files) && files.length > 0) {
    for (const filePath of files) {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          validateDirectory(fullPath, lookupStructure, violations, cwd);
          scanDirectory(fullPath, lookupStructure, violations, shouldIgnore, exitOnFirstViolation, cwd);
        } else if (stat.isFile()) {
          validateFile(fullPath, lookupStructure, violations, cwd);
        }
      }
    }
  } else {
    // Scan project root (full validation)
    scanDirectory(cwd, lookupStructure, violations, shouldIgnore, exitOnFirstViolation, cwd);
  }
  
  // Output results
  if (violations.length > 0) {
    if (format === 'json') {
      console.log(JSON.stringify({
        violations: violations.map(v => ({
          file: v.file,
          type: v.type,
          message: v.message,
          expected: v.expected,
          ...(v.route && { route: v.route, component: v.component, importPath: v.importPath }),
        })),
        count: violations.length,
      }, null, 2));
    } else {
      console.error('❌ Project Structure Violations Found\n');
      console.error(`Found ${violations.length} violation(s):\n`);
      
      // Group violations by type for better output
      const routeViolations = violations.filter(v => v.type === 'route');
      const otherViolations = violations.filter(v => v.type !== 'route');
      
      if (routeViolations.length > 0) {
        console.error('Route Component Placement Violations:');
        console.error('Architecture Rule: Route-level components MUST be in src/pages/, not src/features/\n');
        for (const violation of routeViolations) {
          console.error(`  Route: ${violation.route}`);
          console.error(`  Component: ${violation.component}`);
          console.error(`  Current: ${violation.importPath}`);
          console.error(`  Expected: ${violation.expected}`);
          console.error('');
        }
      }
      
      if (otherViolations.length > 0) {
        console.error('Project Structure Violations:');
        for (const violation of otherViolations) {
          console.error(`File: ${violation.file}`);
          console.error(`Type: ${violation.type}`);
          console.error(`Issue: ${violation.message}`);
          console.error(`Expected: ${violation.expected}`);
          console.error('');
        }
      }
      
      console.error('Suggested fixes:');
      if (routeViolations.length > 0) {
        console.error('1. Move route components from src/features/ to src/pages/');
        console.error('2. Update imports in src/routes/index.tsx to use @/pages/ instead of @/features/');
      }
      console.error(`${routeViolations.length > 0 ? '3' : '1'}. Delete if temporary/corrupted file`);
      console.error(`${routeViolations.length > 0 ? '4' : '2'}. Move to appropriate directory`);
      console.error(`${routeViolations.length > 0 ? '5' : '3'}. Add to .gitignore if should be ignored`);
      console.error(`${routeViolations.length > 0 ? '6' : '4'}. Update projectStructure.config.cjs if legitimate file\n`);
    }
    
    return { success: false, violations };
  } else {
    if (format === 'json') {
      console.log(JSON.stringify({ violations: [], count: 0 }, null, 2));
    } else {
      console.log('✅ All project structure rules are valid!\n');
    }
    
    return { success: true, violations: [] };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    format: args.includes('--format=json') ? 'json' : 'human',
    exitOnFirstViolation: args.includes('--exit-on-first'),
  };
  
  // Parse custom ignore patterns
  const ignoreIndex = args.findIndex(arg => arg.startsWith('--ignore='));
  if (ignoreIndex !== -1) {
    options.ignorePatterns = args[ignoreIndex].split('=')[1].split(',').map(p => p.trim());
  }
  
  // Parse --files-from option (newline-separated paths; avoids Windows argv limits)
  const filesFromIndex = args.findIndex((arg) => arg.startsWith('--files-from='));
  if (filesFromIndex !== -1) {
    const fs = require('fs');
    const listPath = args[filesFromIndex].split('=')[1].trim();
    options.files = fs
      .readFileSync(listPath, 'utf8')
      .split(/\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  // Parse --files option (comma-separated file paths)
  const filesIndex = args.findIndex((arg) => arg.startsWith('--files='));
  if (filesIndex !== -1) {
    options.files = args[filesIndex].split('=')[1].split(',').map(p => p.trim()).filter(Boolean);
  }
  
  const result = validateProjectStructure(options);
  process.exit(result.success ? 0 : 1);
}

module.exports = { validateProjectStructure, buildValidationTree, validateRoutePlacement };
