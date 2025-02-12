const arweave = require('./config.js');
const fs = require('fs');

async function securityTest() {
    try {
        console.log('\nGüvenlik Testi:');
        console.log('------------------------');
        
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // 1. İmza Manipülasyon Testi
        console.log('\n1. İmza Güvenlik Testi:');
        const tx = await arweave.createTransaction({
            data: 'Test Data'
        }, wallet);
        
        await arweave.transactions.sign(tx, wallet);
        const originalSignature = tx.signature;
        
        // İmzayı boz
        tx.signature = Buffer.from('bozuk_imza').toString('base64');
        
        // İmza doğrulaması yap
        const isValidSignature = await verifySignature(tx, originalSignature);
        console.log('İmza Doğrulama:', isValidSignature ? 'Başarılı' : 'Başarısız');
        
        // 2. İzinsiz Transfer Testi
        console.log('\n2. İzinsiz Transfer Testi:');
        const newWallet = await arweave.wallets.generate();
        const transferTx = await arweave.createTransaction({
            target: await arweave.wallets.jwkToAddress(newWallet),
            quantity: arweave.big.bigToWinston('1')
        }, newWallet);
        
        // Bakiye kontrolü
        const hasBalance = await verifyBalance(transferTx);
        console.log('Bakiye Kontrolü:', hasBalance ? 'Başarılı' : 'Başarısız');
        
        // 3. Veri Bütünlüğü Testi
        console.log('\n3. Veri Bütünlüğü Testi:');
        const originalData = 'Orijinal Veri';
        const integrityTx = await arweave.createTransaction({
            data: originalData
        }, wallet);
        
        await arweave.transactions.sign(integrityTx, wallet);
        const originalHash = await arweave.crypto.hash(Buffer.from(originalData));
        
        // Veriyi değiştir
        integrityTx.data = Buffer.from('Değiştirilmiş Veri').toString('base64');
        const modifiedHash = await arweave.crypto.hash(Buffer.from('Değiştirilmiş Veri'));
        
        console.log('Veri Bütünlüğü:', originalHash !== modifiedHash ? 'Başarılı' : 'Başarısız');
        
    } catch (error) {
        console.error('\nGüvenlik Testi Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

// Yardımcı fonksiyonlar
async function verifySignature(tx, originalSignature) {
    try {
        const data = tx.get('data', {decode: true, string: false});
        const owner = await arweave.wallets.ownerToAddress(tx.owner);
        
        // RSA-PSS imza doğrulaması
        const isValid = await arweave.crypto.verify(
            owner,
            data,
            Buffer.from(originalSignature, 'base64')
        );
        
        return isValid;
    } catch (err) {
        console.error('İmza Doğrulama Hatası:', err.message);
        return false;
    }
}

async function verifyBalance(tx) {
    try {
        const balance = await arweave.wallets.getBalance(tx.owner);
        const total = tx.quantity + tx.reward;
        return Number(balance) >= Number(total);
    } catch {
        return false;
    }
}

securityTest(); 