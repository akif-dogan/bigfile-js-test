const Arweave = require('arweave');

// Arweave instance'ını oluştur
const arweave = Arweave.init({
    host: 'thebigfile.info',
    port: 1984,
    protocol: 'http',
    timeout: 60000,
    logging: true,
    network: 'bigfile.localnet'  // Network adını direkt burada belirtelim
});

// Transaction oluşturma işlemini özelleştirelim
const originalCreateTransaction = arweave.createTransaction;
arweave.createTransaction = async function(attributes, jwk) {
    // Önce orijinal transaction'ı oluştur
    const tx = await originalCreateTransaction.call(this, attributes, jwk);
    
    // Gerekli tag'leri ekle
    tx.addTag('Network', 'bigfile.localnet');
    tx.addTag('Network-Type', 'testnet');
    tx.addTag('Network-Version', '1.0');
    
    return tx;
};

// Post işlemini özelleştirelim
const originalPost = arweave.transactions.post;
arweave.transactions.post = async function(transaction) {
    // Custom headers ekle
    const headers = {
        'Content-Type': 'application/json',
        'X-Network': 'bigfile.localnet',
        'X-Network-Type': 'testnet'
    };
    
    // Transaction'ı JSON'a çevir
    const data = JSON.stringify(transaction);
    
    // Manuel olarak POST isteği yap
    const response = await fetch('http://thebigfile.info:1984/tx', {
        method: 'POST',
        headers: headers,
        body: data
    });
    
    return response;
};

module.exports = arweave; 