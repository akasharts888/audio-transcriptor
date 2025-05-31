const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 5000;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.webm');
  }
});

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
      files: 1
    }
});

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));


app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
    
        const audioFile = req.file;
        let transcriptData;

        try {
            transcriptData = JSON.parse(req.body.transcript);
        } catch (e) {
            console.error('Error parsing transcript data:', e);
            transcriptData = { fullText: req.body.transcript };
        }

        console.log('Received audio file:', audioFile.filename);
        console.log('File size:', audioFile.size, 'bytes');
        console.log('Transcript length:', transcriptData.fullText.length, 'characters');

        // Create form data for Python backend
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(audioFile.path));
        formData.append('transcript', JSON.stringify(transcriptData));

  
        // Send to Python backend
        const pythonResponse = await axios.post(
            `${PYTHON_API_URL}/process-audio`,
            formData,
            {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000
            }
        );
  
        // Clean up the uploaded file
        fs.unlink(audioFile.path, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    
        res.status(pythonResponse.status).json({
            response: pythonResponse.data.response,
            id: pythonResponse.data.id
        });
  
    } catch (error) {
        console.error('Error processing audio:', error);
      // Clean up on error
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
            });
        }
    
        res.status(500).json({ 
            response: error.response?.data?.response || 'Failed to process audio'
        });
    }
  });
  

// Endpoint to query transcriptions
app.post('/api/query', async (req, res) => {
    try {
      const { query } = req.body;
      
      // Forward query to Python backend
      const pythonResponse = await axios.post(`${PYTHON_API_URL}/query`,{
        query: query
      });

      console.log(pythonResponse.data.response);
      const response = pythonResponse.data.response;
      res.json({response});
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ 
          response: error.response?.data?.response || 'Failed to process query'
        });
    }
});

app.listen(PORT, () => {
  console.log(`Node server running on port ${PORT}`);
});
