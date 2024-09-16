const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');

async function mp3ClipToBuffer(url, tsStart, tsEnd) {
    const response = await axios.get(url, { responseType: 'stream' });
    const startTime = convertToSeconds(tsStart);
    const endTime = convertToSeconds(tsEnd);
    const duration = endTime - startTime;

    return new Promise((resolve, reject) => {
        let pass = new stream.PassThrough();
        response.data.pipe(pass);

        let buffers = [];
        let bufferStream = new stream.PassThrough();
        bufferStream.on('data', (chunk) => {
            buffers.push(chunk);
        });

        ffmpeg(pass)
            .setStartTime(startTime)
            .duration(duration)
            .format('mp3')
            .on('end', function() {
                resolve(Buffer.concat(buffers));
            })
            .on('error', function(err) {
                reject(err);
            })
            .pipe(bufferStream, { end: true });
    });
}

function convertToSeconds(timestamp) {
    const [min, sec] = timestamp.split(':').map(Number);
    return min * 60 + sec;
}


/*
// Main process
const url = "https://static.wixstatic.com/mp3/7c16b9_5affcebc187d4222b258513b8aa2d239.mp3";
const tsStart = "01:11";
const tsEnd = "01:17";

mp3ClipToBuffer(url, tsStart, tsEnd)
    .then(buffer => {
        console.log('Clipping complete');
        console.log('Buffer byte length:', buffer.byteLength);
        // You can now use the buffer as needed, for example, saving it to a file or processing it further.
    })
    .catch(error => console.error(error));
*/

module.exports = mp3ClipToBuffer;