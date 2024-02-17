const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

function getAllPDFFiles(directory) {
    let pdfFiles = [];

    // Function to recursively search for PDF files
    function findPDFFiles(dir) {
        const dynamicPath = dir.slice(35).replaceAll(/\\/g, '/')
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // Recursively search subdirectories
                findPDFFiles(filePath);
            } else if (path.extname(file).toLowerCase() === '.pdf') {
                // Found a PDF file, add it to the list
                pdfFiles.push({
                    filename: file.toLocaleLowerCase(),
                    path: dynamicPath,
                    birthtime: stat.birthtime
                });
            }
        });
    }

    // Start the recursive search
    findPDFFiles(directory);

    return pdfFiles;
}

app.get('/download-pdf', (req, res) => {
    const directory = path.join(__dirname, 'pdf');
    const pdfFiles = getAllPDFFiles(directory);
    console.log('pdfFiles', pdfFiles)
    const findPdf = pdfFiles.filter((file) => file.filename === `${req.query.name}.pdf`);
    let latestBirthtime = 0;
    let latestObject = null;

    // Iterate through the array to find the latest birthtime
    findPdf?.forEach(obj => {
        const birthtime = new Date(obj.birthtime).getTime();
        if (birthtime > latestBirthtime) {
            latestBirthtime = birthtime;
            latestObject = obj;
        }
    });

    console.log(latestObject);
    const pdfFilePath = path.join(__dirname, latestObject?.path || '', latestObject?.filename || '');
    const fileStream = fs.createReadStream(pdfFilePath);
    // Listen for errors on the file stream
    fileStream.on('error', (err) => {
        console.error('Error reading PDF file:', err);
        res.status(404).send('File not found');
    });
    // res.setHeader('Content-Disposition', 'attachment; filename="AgentList.pdf"');
    fileStream.pipe(res);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
