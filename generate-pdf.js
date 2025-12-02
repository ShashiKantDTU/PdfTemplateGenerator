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

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // --- LOAD HEADER AND FOOTER TEMPLATES ---
        
        // Read header and footer template files
        const headerTemplatePath = path.resolve('./templates/report-header.html');
        const footerTemplatePath = path.resolve('./templates/report-footer.html');
        
        const headerTemplateHtml = fs.readFileSync(headerTemplatePath, 'utf8');
        const footerTemplateHtml = fs.readFileSync(footerTemplatePath, 'utf8');
        
        // Prepare data for header/footer templates
        const headerFooterData = {
            patientName: data.patient?.fullName || '',
            ageGender: `${data.patient?.ageDisplay || ''} / ${data.patient?.genderDisplay || ''}`,
            referredBy: data.patient?.referringDoctor || '',
            patientId: data.report?.billNumber || '',
            reportId: data.report?.reportNumber || '',
            reportDate: `${data.dates?.reportDate || ''} ${data.dates?.reportTime || ''}`,
            regDate: data.dates?.collectionDate || '',
            qrCodeData: data.report?.barcode || ''
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
                top: '92.5mm',     // 31.116% of A4 height (297mm * 0.3116)
                bottom: '140px',    // Space for footer
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
