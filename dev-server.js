const express = require('express');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const livereload = require('livereload');
const connectLiveReload = require('connect-livereload');

// Create a live reload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname)); // Watch current directory

const app = express();
const port = 3000;

// Inject the livereload script into the page
app.use(connectLiveReload());

app.get('/', (req, res) => {
    try {
        const dataPath = path.resolve('./sample-data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        const templatePath = path.resolve('./report-template.html');
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
});
