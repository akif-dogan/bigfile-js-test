const fs = require('fs');
const crypto = require('crypto');

const fileSize = 200 * 1024 * 1024; // 200MB
const chunkSize = 1024 * 1024; // 1MB chunks
const fileName = 'test_200mb.dat';

console.log('Test dosyası oluşturuluyor...');

const writeStream = fs.createWriteStream(fileName);
let bytesWritten = 0;

function writeChunk() {
    const remainingBytes = fileSize - bytesWritten;
    const currentChunkSize = Math.min(chunkSize, remainingBytes);
    
    const chunk = crypto.randomBytes(currentChunkSize);
    writeStream.write(chunk);
    
    bytesWritten += currentChunkSize;
    const progress = ((bytesWritten / fileSize) * 100).toFixed(2);
    
    process.stdout.write(`\rİlerleme: ${progress}%`);
    
    if (bytesWritten < fileSize) {
        setImmediate(writeChunk);
    } else {
        writeStream.end();
        console.log('\nDosya oluşturuldu:', fileName);
    }
}

writeChunk(); 