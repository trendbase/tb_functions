const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const segmentAudio = require('./segmentLogic');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.post('/segment', async (req, res) => {
    const { url, timestamp } = req.body;

    // Validate input
    if (!url || !timestamp) {
        return res.status(400).send('URL or timestamp missing in the request');
    }

    // Extract start and end timestamps
    const [tsStart, tsEnd] = timestamp.split('-');
    if (!tsStart || !tsEnd) {
        return res.status(400).send('Invalid timestamp format');
    }

    try {
        const segmentBuffer = await segmentAudio(url, tsStart, tsEnd);
        console.log('Buffer byte length:', segmentBuffer.byteLength);
/*
        // Write the buffer to an MP3 file
        const filename = `segment_${Date.now()}.mp3`;
        fs.writeFileSync(filename, segmentBuffer);
*/
        // Send a response containing buffer
        res.send(segmentBuffer);
    } catch (error) {
        console.error('Error processing audio segment:', error);
        res.status(500).send(`Error processing audio segment: ${error.message}`);
    }
});

app.get("/", (req, res) => {
    res.send(`Server is up and running;`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
