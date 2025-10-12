const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const generatePdf = async () => {
    console.log('Starting PDF generation process...');

    try {
        // Use the same sample data for consistency
        const dataPath = path.resolve('./sample-data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        const templatePath = path.resolve('./report-template.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        const pdfPath = 'final-report.pdf';
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '40px', right: '40px', bottom: '40px', left: '40px' }
        });

        console.log(`✅ Successfully generated PDF: ${pdfPath}`);
        await browser.close();

    } catch (error) {
        console.error('❌ Error generating PDF:', error);
    }
};

generatePdf();
