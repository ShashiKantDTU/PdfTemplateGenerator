const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Register Handlebars helpers
handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

handlebars.registerHelper('contains', function(str, substr) {
    if (!str) return false;
    return str.includes(substr);
});

handlebars.registerHelper('unless', function(conditional, options) {
    if (!conditional) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

handlebars.registerHelper('hasNonHtmlFields', function(fields, options) {
    if (!fields || !Array.isArray(fields)) return options.inverse(this);
    
    const hasNonHtml = (fieldsArray) => {
        for (let field of fieldsArray) {
            if (field.type === 'field' && field.value) {
                if (!field.displayValue || !field.displayValue.includes('<table')) {
                    return true;
                }
            } else if (field.type === 'group' && field.sub_fields) {
                if (hasNonHtml(field.sub_fields)) {
                    return true;
                }
            }
        }
        return false;
    };
    
    if (hasNonHtml(fields)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// Helper function to convert local image to base64 data URI
const imageToBase64 = (imagePath) => {
    try {
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            const ext = path.extname(imagePath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
            return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        }
    } catch (e) {
        console.warn(`Could not load image: ${imagePath}`);
    }
    return '';
};

// Helper function to fetch URL and convert to base64 data URI
const urlToBase64 = async (url) => {
    try {
        if (!url) return '';
        
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch image: ${url}`);
            return '';
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Determine MIME type from URL or response
        const contentType = response.headers.get('content-type') || 'image/png';
        const mimeType = contentType.split(';')[0].trim();
        
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (e) {
        console.warn(`Could not fetch image from URL: ${url}`, e.message);
        return '';
    }
};

const generatePdf = async (templateName) => {
    console.log(`Starting PDF generation for template: ${templateName}...`);
    console.log(`📋 Using Ghost Table Strategy (no Puppeteer header/footer)`);

    try {
        const dataPath = path.resolve(`./data/${templateName}-data.json`);
        const templatePath = path.resolve(`./templates/${templateName}.html`);
        
        // Check if files exist
        if (!fs.existsSync(dataPath)) {
            throw new Error(`Data file not found: ${templateName}-data.json`);
        }
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file not found: ${templateName}.html`);
        }
        
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const templateHtml = fs.readFileSync(templatePath, 'utf8');

        // --- PROCESS DATA ---
        
        // Process ending line - convert newlines to <br> for HTML rendering
        if (data.reportSettings?.endingLine) {
            let endingLineHtml = data.reportSettings.endingLine
                .replace(/\n/g, '<br>');
            data.reportSettings.endingLineHtml = endingLineHtml;
        }

        // Ensure headerHeight and footerHeight have defaults
        data.reportSettings = data.reportSettings || {};
        data.reportSettings.headerHeight = data.reportSettings.headerHeight || 80;
        data.reportSettings.footerHeight = data.reportSettings.footerHeight || 60;

        console.log(`📐 Layout Settings:`);
        console.log(`   - Header Height: ${data.reportSettings.headerHeight}mm`);
        console.log(`   - Footer Height: ${data.reportSettings.footerHeight}mm`);

        // Convert background URL to base64 if present
        if (data.reportSettings?.hasBackground && data.reportSettings?.backgroundUrl) {
            console.log(`🖼️  Converting background image to base64...`);
            const backgroundBase64 = await urlToBase64(data.reportSettings.backgroundUrl);
            if (backgroundBase64) {
                data.reportSettings.backgroundBase64 = backgroundBase64;
                console.log(`   - Background: OK (${backgroundBase64.length} chars)`);
            } else {
                console.log(`   - Background: FAILED`);
            }
        }

        // Convert doctor signature URLs to base64
        console.log(`🖼️  Converting doctor signatures to base64...`);
        if (data.doctors && Array.isArray(data.doctors)) {
            data.doctors = await Promise.all(
                data.doctors.map(async (doctor) => {
                    if (doctor.hasSignature && doctor.signatureUrl) {
                        const base64Signature = await urlToBase64(doctor.signatureUrl);
                        console.log(`   - ${doctor.name}: ${base64Signature ? 'OK (' + base64Signature.length + ' chars)' : 'FAILED'}`);
                        return {
                            ...doctor,
                            signatureBase64: base64Signature
                        };
                    }
                    return { ...doctor, signatureBase64: '' };
                })
            );
            console.log(`   - Converted ${data.doctors.filter(d => d.signatureBase64).length} signatures`);
        }

        // --- COMPILE TEMPLATE ---
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        // --- GENERATE PDF ---
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        const pdfPath = `output/${templateName}.pdf`;
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync('./output')) {
            fs.mkdirSync('./output');
        }
        
        // CRITICAL: Ghost Table Strategy requires:
        // - displayHeaderFooter: false (we handle header/footer in HTML)
        // - margin: 0 on all sides (ghost spacers create the margins)
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,  // MUST be false for Ghost Table
            margin: {
                top: '0mm',
                bottom: '0mm',
                left: '0mm',
                right: '0mm'
            }
        });

        console.log(`✅ Successfully generated PDF: ${pdfPath}`);
        await browser.close();

    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
    }
};

// Get template name from command line argument
const templateName = process.argv[2];

if (!templateName) {
    console.log('Usage: node generate-pdf.js <template-name>');
    console.log('Example: node generate-pdf.js report1');
    
    // List available templates
    const templatesDir = path.resolve('./templates');
    if (fs.existsSync(templatesDir)) {
        const templates = fs.readdirSync(templatesDir)
            .filter(file => file.endsWith('.html'))
            .map(file => file.replace('.html', ''));
        
        if (templates.length > 0) {
            console.log('\nAvailable templates:');
            templates.forEach(t => console.log(`  - ${t}`));
        }
    }
    process.exit(1);
}

generatePdf(templateName);
