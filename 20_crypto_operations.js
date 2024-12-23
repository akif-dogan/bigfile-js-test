const arweave = require('./config.js');
const fs = require('fs');

async function testCryptoOperations() {
    try {
        console.log('\nKripto İşlemleri Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // 1. İmza Testi
        const testData = 'Test Message';
        const dataBuffer = Buffer.from(testData);
        const signature = await arweave.crypto.sign(wallet, dataBuffer);
        console.log('\n1. İmza Oluşturma:');
        console.log('İmza:', signature.toString('base64'));
        
        // 2. İmza Doğrulama
        const isValid = await arweave.crypto.verify(wallet.n, dataBuffer, signature);
        console.log('\n2. İmza Doğrulama:');
        console.log('Geçerli:', isValid);
        
        // 3. Hash Testi
        const hash = await arweave.crypto.hash(dataBuffer);
        console.log('\n3. Hash Oluşturma:');
        console.log('Hash:', hash.toString('base64'));
        
        // 4. Şifreleme/Çözme Testi
        const key = Buffer.from(wallet.d, 'base64');
        const encryptedData = await arweave.crypto.encrypt(dataBuffer, key);
        console.log('\n4. Şifreleme:');
        console.log('Şifreli Veri:', encryptedData.toString('base64'));
        
        const decryptedData = await arweave.crypto.decrypt(encryptedData, key);
        console.log('\n5. Çözme:');
        console.log('Çözülen Veri:', decryptedData.toString());
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testCryptoOperations(); 