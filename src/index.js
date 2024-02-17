const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/src/pdf", express.static("src/pdf"));
//mongodb connection----------------------------------------------
const mongoUrl =
  "mongodb+srv://user:user123@main.o78v5ur.mongodb.net/";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));
//multer------------------------------------------------------------
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/pdf");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '-filename-' + file.originalname);
  },
});

require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.file.originalname.split(".")[0];
  const fileName = req.file.filename;
  try {
    await PdfSchema.create({ title ,pdf: fileName, time: new Date() });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

app.get("/download-files", async (req, res) => {
    const {name} = req.query
    console.log('name', name);
    const pdfData = await PdfSchema.find({});
    const pdfFiles = pdfData?.filter(file => file?.title?.toLocaleLowerCase() === name?.toLocaleLowerCase());
    console.log('pdfData', pdfData);
    console.log('pdfFiles', pdfFiles);
  try {
    let latestBirthtime = 0;
    let latestObject = null;

    // Iterate through the array to find the latest birthtime
    pdfFiles?.forEach(obj => {
        const time = new Date(obj.time).getTime();
        if (time > latestBirthtime) {
            latestBirthtime = time;
            latestObject = obj;
        }
    });

    console.log("latestObject",latestObject);

    if (!latestObject) {
        return res.status(404).json({ error: 'PDF file not found' });
    }

    // Construct the file path
    console.log('===>>1111')
    const pdfFilePath = path.join(directory, 'pdf', latestObject?.filename);
    console.log('==>222')

    // Create a read stream for the PDF file
    const fileStream = fs.createReadStream(pdfFilePath);

    // Listen for errors on the file stream
    fileStream.on('error', (err) => {
        console.error('Error reading PDF file:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${latestObject.filename}"`);

    // Pipe the file stream to the response
    fileStream.pipe(res);
  } catch (error) {}
});

app.get('/get-pdf', (req, res) => {
    const { name } = req.query;
    console.log('name', name)
    if (!name) {
        return res.status(400).json({ error: 'PDF name is required' });
    }

    const directory = path.join(__dirname);
    const pdfFiles = getAllPDFFiles(directory);
    const pdfFile = pdfFiles.filter(file => file.name === `${name}.pdf`);
    let latestBirthtime = 0;
    let latestObject = null;

    // Iterate through the array to find the latest birthtime
    pdfFile?.forEach(obj => {
        const birthtime = new Date(obj.birthtime).getTime();
        if (birthtime > latestBirthtime) {
            latestBirthtime = birthtime;
            latestObject = obj;
        }
    });

    console.log("latestObject",latestObject);
    console.log('pdfFiles', pdfFiles)

    // Find the PDF file with the specified name
    console.log('pdfFile', pdfFile)
    if (!latestObject) {
        return res.status(404).json({ error: 'PDF file not found' });
    }

    // Construct the file path
    const pdfFilePath = path.join(directory, latestObject?.path, latestObject?.filename);

    // Create a read stream for the PDF file
    const fileStream = fs.createReadStream(pdfFilePath);

    // Listen for errors on the file stream
    fileStream.on('error', (err) => {
        console.error('Error reading PDF file:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfFile.filename}"`);

    // Pipe the file stream to the response
    fileStream.pipe(res);
});


//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

function getAllPDFFiles(directory) {
    let pdfFiles = [];

    // Function to recursively search for PDF files
    function findPDFFiles(dir) {
        // const dynamicPath = dir.slice(39).replaceAll(/\\/g, '/');
        const replacePath = dir.replaceAll(/\\/g, '/');
        const findPath = replacePath.lastIndexOf('pdf');
        const dynamicPath = replacePath.slice(findPath);
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
                    name: file.toLocaleLowerCase().split('-')[2],
                    path: dynamicPath,
                    birthtime: stat.birthtime,
                    filename: file
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
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
