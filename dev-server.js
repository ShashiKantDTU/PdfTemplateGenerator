const express = require('express');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

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

// Create a live reload server
const liveReloadServer = livereload.createServer({
    exts: ['html', 'json', 'css', 'js'],
    delay: 100
});

// Watch specific directories
liveReloadServer.watch([
    path.join(__dirname, 'templates'),
    path.join(__dirname, 'data')
]);

// Add server notification on file change
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

const app = express();
const port = 3000;

// Inject the livereload script into the page
app.use(connectLiveReload());

// Serve static files from templates directory (for images, etc.)
app.use('/templates', express.static(path.join(__dirname, 'templates'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.jpeg') || filePath.endsWith('.jpg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        }
    }
}));

// Home route - list all templates
app.get('/', (req, res) => {
    try {
        const templatesDir = path.resolve('./templates');
        const allTemplates = fs.readdirSync(templatesDir)
            .filter(file => file.endsWith('.html'))
            .map(file => file.replace('.html', ''));
        
        // Separate main templates from header/footer templates
        const mainTemplates = allTemplates.filter(t => !t.startsWith('report-header') && !t.startsWith('report-footer'));
        const headerFooterTemplates = allTemplates.filter(t => t.startsWith('report-header') || t.startsWith('report-footer'));
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>PDF Template Designer</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    h1 { color: #333; }
                    h2 { color: #666; margin-top: 30px; }
                    .template-list { list-style: none; padding: 0; }
                    .template-list li { margin: 15px 0; }
                    .template-list a { display: block; padding: 15px; background: #f5f5f5; text-decoration: none; color: #333; border-radius: 5px; transition: background 0.3s; }
                    .template-list a:hover { background: #e0e0e0; }
                    .template-name { font-size: 18px; font-weight: 600; }
                    .template-url { font-size: 14px; color: #666; margin-top: 5px; }
                    .header-footer-list a { background: #e8f4f8; }
                    .header-footer-list a:hover { background: #d0e8f0; }
                </style>
            </head>
            <body>
                <h1>📄 Available Templates</h1>
                
                <h2>Main Templates</h2>
                <ul class="template-list">
        `;
        
        mainTemplates.forEach(template => {
            html += `
                <li>
                    <a href="/${template}">
                        <div class="template-name">${template}</div>
                        <div class="template-url">http://localhost:${port}/${template}</div>
                    </a>
                </li>
            `;
        });
        
        html += `
                </ul>
                
                <h2>Header/Footer Templates (uses report1-data.json)</h2>
                <ul class="template-list header-footer-list">
        `;
        
        headerFooterTemplates.forEach(template => {
            html += `
                <li>
                    <a href="/${template}">
                        <div class="template-name">${template}</div>
                        <div class="template-url">http://localhost:${port}/${template}</div>
                    </a>
                </li>
            `;
        });
        
        html += `
                </ul>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Template route - render specific template
app.get('/:templateName', (req, res) => {
    try {
        const templateName = req.params.templateName;
        
        // Special handling for header/footer templates - use report1-data.json
        let dataPath, templatePath;
        
        if (templateName.startsWith('report-header') || templateName.startsWith('report-footer')) {
            // Use report1-data.json for header/footer templates
            dataPath = path.resolve('./data/report1-data.json');
            templatePath = path.resolve(`./templates/${templateName}.html`);
            
            if (!fs.existsSync(dataPath)) {
                return res.status(404).send(`Data file not found: report1-data.json (required for header/footer templates)`);
            }
            
            if (!fs.existsSync(templatePath)) {
                return res.status(404).send(`Template file not found: ${templateName}.html`);
            }
            
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const templateHtml = fs.readFileSync(templatePath, 'utf8');
            
            // Prepare data for header/footer templates (same as in generate-pdf.js)
            const headerFooterData = {
                patientName: data.patient?.fullName || '',
                ageGender: `${data.patient?.ageDisplay || ''} / ${data.patient?.genderDisplay || ''}`,
                referredBy: data.patient?.referringDoctor || '',
                patientId: data.report?.billNumber || '',
                reportId: data.report?.reportNumber || '',
                reportDate: `${data.dates?.reportDate || ''} ${data.dates?.reportTime || ''}`,
                regDate: data.dates?.collectionDate || '',
                qrCodeData: data.report?.barcode || '',
                doctor1Sign: data.doctorsSign?.doctor1Sign || '',
                doctor2Sign: data.doctorsSign?.doctor2Sign || '',
                doctor3Sign: data.doctorsSign?.doctor3Sign || '',
                doctor4Sign: data.doctorsSign?.doctor4Sign || '',
                doctor5Sign: data.doctorsSign?.doctor5Sign || '',
                doctor1Name: data.doctorsSign?.doctor1Name || '',
                doctor2Name: data.doctorsSign?.doctor2Name || '',
                doctor3Name: data.doctorsSign?.doctor3Name || '',
                doctor4Name: data.doctorsSign?.doctor4Name || '',
                doctor5Name: data.doctorsSign?.doctor5Name || '',
                doctor1Designation: data.doctorsSign?.doctor1Designation || '',
                doctor2Designation: data.doctorsSign?.doctor2Designation || '',
                doctor3Designation: data.doctorsSign?.doctor3Designation || '',
                doctor4Designation: data.doctorsSign?.doctor4Designation || '',
                doctor5Designation: data.doctorsSign?.doctor5Designation || ''
            };
            
            const template = handlebars.compile(templateHtml);
            const finalHtml = template(headerFooterData);
            
            return res.send(finalHtml);
        }
        
        // Normal template handling
        dataPath = path.resolve(`./data/${templateName}-data.json`);
        templatePath = path.resolve(`./templates/${templateName}.html`);
        
        // Check if files exist
        if (!fs.existsSync(dataPath)) {
            return res.status(404).send(`Data file not found: ${templateName}-data.json`);
        }
        
        if (!fs.existsSync(templatePath)) {
            return res.status(404).send(`Template file not found: ${templateName}.html`);
        }
        
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const templateHtml = fs.readFileSync(templatePath, 'utf8');

        const template = handlebars.compile(templateHtml);
        const finalHtml = template(data);

        res.send(finalHtml);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`🚀 Live preview server is running at http://localhost:${port}`);
    console.log('📝 Watching for file changes...');
    console.log('\n📄 Available routes:');
    console.log(`   - Home: http://localhost:${port}/`);
    console.log(`   - Templates: http://localhost:${port}/<template-name>`);
});
