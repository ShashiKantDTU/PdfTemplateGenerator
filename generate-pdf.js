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

        // Process ending line - convert newlines to <br> for HTML rendering
        // Must be done BEFORE template compilation
        if (data.reportSettings?.endingLine) {
            let endingLineHtml = data.reportSettings.endingLine
                .replace(/\n/g, '<br>');                         // Convert newlines to <br>
            data.reportSettings.endingLineHtml = endingLineHtml;
        }

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

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // --- DYNAMIC MARGIN CALCULATION ---
        // User only needs to set TWO values:
        // headerHeight = Total top margin (letterhead space + patient box will fit inside)
        // footerHeight = Footer space for signatures
        // 
        // The patient box automatically positions at the BOTTOM of headerHeight
        // using CSS flexbox (justify-content: flex-end)
        
        const headerHeight = data.reportSettings?.headerHeight || 120;  // Total top margin (mm)
        const footerHeight = data.reportSettings?.footerHeight || 60;   // Footer space (mm)

        // --- INJECT BACKGROUND IMAGE ---
        // Inject background as CSS background-image on html element
        // This ensures the background covers the full page and repeats on each page
        if (data.reportSettings?.backgroundBase64) {
            console.log(`🖼️  Injecting background image into page...`);
            await page.evaluate((bgBase64, hHeight, fHeight) => {
                // Create a style element to set background on html
                const style = document.createElement('style');
                style.textContent = `
                    html {
                        background-image: url('${bgBase64}');
                        background-size: 210mm 297mm;
                        background-position: center top;
                        background-repeat: no-repeat;
                        background-attachment: fixed;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        margin: -${hHeight}mm -10mm -${fHeight}mm -10mm;
                        padding: ${hHeight}mm 10mm ${fHeight}mm 10mm;
                    }
                `;
                document.head.appendChild(style);
            }, data.reportSettings.backgroundBase64, headerHeight, footerHeight);
            console.log(`   - Background injected successfully`);
        }

        // --- LOAD HEADER AND FOOTER TEMPLATES ---
        
        // Read header and footer template files
        const headerTemplatePath = path.resolve('./templates/report-header.html');
        const footerTemplatePath = path.resolve('./templates/report-footer.html');
        
        const headerTemplateHtml = fs.readFileSync(headerTemplatePath, 'utf8');
        const footerTemplateHtml = fs.readFileSync(footerTemplatePath, 'utf8');
        
        console.log(`📐 Layout Settings:`);
        console.log(`   - Header Height (top margin): ${headerHeight}mm`);
        console.log(`   - Footer Height: ${footerHeight}mm`);
        console.log(`   - Patient box auto-positioned at bottom of header using flexbox`);
        
        // Convert doctor signature URLs to base64 (required for Puppeteer header/footer)
        console.log(`🖼️  Converting doctor signatures to base64...`);
        const doctorsWithBase64 = await Promise.all(
            (data.doctors || []).map(async (doctor) => {
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
        console.log(`   - Converted ${doctorsWithBase64.filter(d => d.signatureBase64).length} signatures`);
        
        // Prepare data for header/footer templates
        const headerFooterData = {
            patientName: data.patient?.fullName || '',
            ageGender: `${data.patient?.ageDisplay || ''} / ${data.patient?.genderDisplay || ''}`,
            referredBy: data.patient?.referringDoctor || '',
            patientId: data.report?.billNumber || '',
            reportId: data.report?.reportNumber || '',
            reportDate: `${data.dates?.reportDate || ''} ${data.dates?.reportTime || ''}`,
            regDate: data.dates?.collectionDate || '',
            qrCodeData: data.report?.barcode || '',
            // Pass the doctors array with base64 signatures
            doctors: doctorsWithBase64,
            // Pass background for full-page letterhead
            backgroundBase64: data.reportSettings?.backgroundBase64 || ''
        };
        
        // Compile header and footer templates with Handlebars
        const headerTemplateCompiled = handlebars.compile(headerTemplateHtml);
        const footerTemplateCompiled = handlebars.compile(footerTemplateHtml);
        
        const headerTemplate = headerTemplateCompiled(headerFooterData);
        const footerTemplate = footerTemplateCompiled(headerFooterData);

        const pdfPath = `output/${templateName}.pdf`;
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync('./output')) {
            fs.mkdirSync('./output');
        }
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: headerTemplate,
            footerTemplate: footerTemplate,
            margin: {
                top: `${headerHeight}mm`,     // User-defined: includes letterhead + patient box space
                bottom: `${footerHeight}mm`,  // User-defined: footer space
                left: '10mm',
                right: '10mm'
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
    console.log('Example: node generate-pdf.js bill1');
    
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
