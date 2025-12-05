/**
 * PDF Template Generator - Engine Index
 * 
 * This file provides a unified interface to access different PDF generation engines.
 * 
 * Available Engines:
 * - puppeteer: Uses Puppeteer (Chromium) to render HTML to PDF
 * - react-pdf: Uses @react-pdf/renderer to generate PDFs from React components
 * 
 * Usage:
 *   const { getEngine, listEngines } = require('./engines');
 *   const engine = getEngine('react-pdf');
 *   await engine.generatePDF('report1');
 */

const path = require('path');

const engines = {
  'puppeteer': {
    name: 'Puppeteer',
    description: 'Uses Chromium headless browser to render HTML templates to PDF',
    path: '../generate-pdf.js',
    templates: ['report1', 'bill1'],
    pros: [
      'Full HTML/CSS support',
      'Easy to create templates with standard web technologies',
      'Good for complex layouts',
    ],
    cons: [
      'Header/footer rendering issues with z-index',
      'Separate rendering contexts for header/body/footer',
      'Requires careful CSS for page breaks',
    ],
  },
  'react-pdf': {
    name: 'React PDF',
    description: 'Uses @react-pdf/renderer to generate PDFs from React components',
    path: './react-pdf/generate.js',
    templates: ['report1'],
    pros: [
      'Full control over page breaks',
      'Headers/footers properly rendered',
      'No z-index issues',
      'Consistent rendering',
    ],
    cons: [
      'Limited CSS support (subset of CSS)',
      'No HTML parsing - must use React components',
      'Templates must be rewritten as React components',
    ],
  },
};

/**
 * Get engine module by name
 */
function getEngine(engineName) {
  const engine = engines[engineName];
  if (!engine) {
    throw new Error(`Engine "${engineName}" not found. Available: ${Object.keys(engines).join(', ')}`);
  }
  
  const modulePath = path.join(__dirname, engine.path);
  return require(modulePath);
}

/**
 * List all available engines
 */
function listEngines() {
  return Object.keys(engines).map(key => ({
    id: key,
    ...engines[key],
  }));
}

/**
 * Get engine info
 */
function getEngineInfo(engineName) {
  return engines[engineName] || null;
}

module.exports = {
  getEngine,
  listEngines,
  getEngineInfo,
  engines,
};
