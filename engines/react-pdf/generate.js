/**
 * React-PDF Generator Script
 * 
 * This script uses @react-pdf/renderer to generate PDFs from React components.
 * Unlike Puppeteer, this gives us full control over page breaks, headers, and footers.
 * 
 * Usage: node engines/react-pdf/generate.js <template-name>
 * Example: node engines/react-pdf/generate.js report1
 */

const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Template registry - maps template names to their component files
const templates = {
  'report1': './templates/Report1Template.js',
};

/**
 * Convert a URL to base64 data URI
 */
async function urlToBase64(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    // If already a base64 string, return as-is
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        urlToBase64(response.headers.location).then(resolve).catch(reject);
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = buffer.toString('base64');
        resolve(`data:${contentType};base64,${base64}`);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Process data to convert image URLs to base64
 */
async function processData(data) {
  const processedData = JSON.parse(JSON.stringify(data)); // Deep clone
  
  // Convert background image
  if (processedData.reportSettings?.backgroundUrl) {
    console.log('🖼️  Converting background image to base64...');
    try {
      processedData.reportSettings.backgroundBase64 = await urlToBase64(processedData.reportSettings.backgroundUrl);
      console.log('   - Background: OK');
    } catch (err) {
      console.error('   - Background: FAILED', err.message);
    }
  }
  
  // Convert doctor signatures
  if (processedData.doctors && Array.isArray(processedData.doctors)) {
    console.log('🖼️  Converting doctor signatures to base64...');
    for (const doctor of processedData.doctors) {
      if (doctor.signatureUrl) {
        try {
          doctor.signatureBase64 = await urlToBase64(doctor.signatureUrl);
          console.log(`   - ${doctor.name}: OK`);
        } catch (err) {
          console.error(`   - ${doctor.name}: FAILED`, err.message);
        }
      }
    }
  }
  
  // Convert barcode if present
  if (processedData.report?.barcode) {
    try {
      processedData.report.barcodeBase64 = await urlToBase64(processedData.report.barcode);
    } catch (err) {
      console.error('   - Barcode: FAILED', err.message);
    }
  }
  
  return processedData;
}

/**
 * Generate PDF using React-PDF
 */
async function generatePDF(templateName) {
  console.log(`\n📄 React-PDF Generator`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`Starting PDF generation for template: ${templateName}...`);
  
  // Check if template exists
  if (!templates[templateName]) {
    console.error(`❌ Template "${templateName}" not found.`);
    console.log(`Available templates: ${Object.keys(templates).join(', ')}`);
    process.exit(1);
  }
  
  // Load template component
  const templatePath = path.join(__dirname, templates[templateName]);
  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template file not found: ${templatePath}`);
    process.exit(1);
  }
  
  const Template = require(templatePath);
  
  // Load data file
  const dataPath = path.join(__dirname, '../../data', `${templateName}-data.json`);
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found: ${dataPath}`);
    process.exit(1);
  }
  
  console.log(`📂 Loading data from: ${path.basename(dataPath)}`);
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  // Process data (convert URLs to base64)
  const data = await processData(rawData);
  
  console.log(`\n📐 Layout Settings:`);
  console.log(`   - Header Height: ${data.reportSettings?.headerHeight || 80}mm`);
  console.log(`   - Footer Height: ${data.reportSettings?.footerHeight || 60}mm`);
  console.log(`   - Tests Count: ${data.tests?.length || 0}`);
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate PDF
  const outputPath = path.join(outputDir, `${templateName}-react-pdf.pdf`);
  
  console.log(`\n⚙️  Generating PDF...`);
  
  try {
    // Create the React element
    const element = React.createElement(Template, { data });
    
    // Render to file
    await ReactPDF.render(element, outputPath);
    
    console.log(`\n✅ Successfully generated PDF: ${outputPath}`);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
  } catch (error) {
    console.error(`\n❌ Error generating PDF:`, error);
    process.exit(1);
  }
}

/**
 * Render to buffer (for API usage)
 */
async function renderToBuffer(templateName, customData = null) {
  // Check if template exists
  if (!templates[templateName]) {
    throw new Error(`Template "${templateName}" not found.`);
  }
  
  // Load template component
  const templatePath = path.join(__dirname, templates[templateName]);
  const Template = require(templatePath);
  
  // Load or use custom data
  let rawData;
  if (customData) {
    rawData = customData;
  } else {
    const dataPath = path.join(__dirname, '../../data', `${templateName}-data.json`);
    rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }
  
  // Process data
  const data = await processData(rawData);
  
  // Create the React element
  const element = React.createElement(Template, { data });
  
  // Render to buffer
  const stream = await ReactPDF.renderToStream(element);
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

// Export for API usage
module.exports = {
  generatePDF,
  renderToBuffer,
  templates: Object.keys(templates),
};

// CLI execution
if (require.main === module) {
  const templateName = process.argv[2];
  
  if (!templateName) {
    console.log('\nUsage: node generate.js <template-name>');
    console.log('\nAvailable templates:');
    Object.keys(templates).forEach(t => console.log(`  - ${t}`));
    process.exit(1);
  }
  
  generatePDF(templateName).catch(console.error);
}
