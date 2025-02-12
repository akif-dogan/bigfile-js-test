const arweave = require('./config.js');
const fs = require('fs');

// Ağ adına göre para birimini belirle
function getNetworkCurrency(networkName) {
    const networkStandards = {
        'BigFile.V1': 'BIG'
        // Diğer BigFile ağları buraya eklenebilir
    };
    return networkStandards[networkName] || 'BIG'; // Bilinmeyen ağlar için de BIG kullan
}

async function transferFromWallet1() {
    try {
        console.log('\nTransfer Bilgileri:');
        console.log('------------------------');
        
        // Wallet1'i kaynak olarak kullan
        const sourceWallet = JSON.parse(fs.readFileSync('wallet1.json'));
        const sourceAddress = await arweave.wallets.jwkToAddress(sourceWallet);
        
        // Ana cüzdanı hedef olarak kullan
        const targetWallet = JSON.parse(fs.readFileSync('wallet.json'));
        const targetAddress = await arweave.wallets.jwkToAddress(targetWallet);
        
        // Sabit transfer miktarı (200 milyon)
        const TRANSFER_AMOUNT = '200000000';
        
        // Bakiyeleri kontrol et ve göster
        const sourceBalance = await arweave.wallets.getBalance(sourceAddress);
        const targetBalance = await arweave.wallets.getBalance(targetAddress);
        
        // Ağ bilgilerini al
        const networkInfo = await arweave.network.getInfo();
        const currency = getNetworkCurrency(networkInfo.network);
        
        console.log('\nMevcut Bakiyeler:');
        console.log('------------------------');
        console.log('Kaynak (Wallet1):', arweave.big.winstonToBIG(sourceBalance), currency);
        console.log('Hedef (Wallet):', arweave.big.winstonToBIG(targetBalance), currency);
        
        // Transfer işlemi oluştur
        const transaction = await arweave.createTransaction({
            target: targetAddress,
            quantity: arweave.big.BIGToWinston(TRANSFER_AMOUNT)
        }, sourceWallet);
        
        // Toplam maliyet hesapla
        const transferAmountWinston = arweave.big.BIGToWinston(TRANSFER_AMOUNT);
        const totalCost = Number(transferAmountWinston) + Number(transaction.reward);
        
        console.log('\nTransfer Detayları:');
        console.log('------------------------');
        console.log('Transfer Miktarı:', TRANSFER_AMOUNT, currency);
        console.log('İşlem Ücreti:', arweave.big.winstonToBIG(transaction.reward), currency);
        console.log('Toplam Maliyet:', arweave.big.winstonToBIG(totalCost), currency);
        
        // Bakiye kontrolü
        if (Number(sourceBalance) < totalCost) {
            throw new Error(`Yetersiz bakiye!
                Gerekli: ${arweave.big.winstonToBIG(totalCost)} ${currency}
                Mevcut: ${arweave.big.winstonToBIG(sourceBalance)} ${currency}`);
        }
        
        // Network ve işlem tag'lerini ekle
        transaction.addTag('Network', 'bigfile.localnet');
        transaction.addTag('Type', 'Transfer');
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Version', '1.0');
        
        // İşlemi imzala ve gönder
        await arweave.transactions.sign(transaction, sourceWallet);
        const response = await arweave.transactions.post(transaction);
        
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Status:', response.status);
        
        if (response.status === 200) {
            console.log('Transfer başarıyla gönderildi');
            console.log('URL:', `http://65.108.0.39:1984/${transaction.id}`);
            console.log('\nİşlemi kontrol etmek için:');
            console.log(`npm run check-tx-status ${transaction.id}`);
        } else {
            console.error('Sunucu Yanıtı:', response.data);
            throw new Error(`Transfer başarısız: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('\nTransfer Hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

transferFromWallet1(); 