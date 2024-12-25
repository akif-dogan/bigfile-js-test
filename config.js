const Arweave = require('arweave');

// Arweave instance'ını oluştur
const arweave = Arweave.init({
    host: 'thebigfile.info',
    port: 1984,
    protocol: 'https',
    timeout: 60000,
    logging: true,
    network: 'BigFile.V1'
});

// Post işlemini özelleştirelim
const originalPost = arweave.transactions.post;
arweave.transactions.post = async function(transaction) {
    // Custom headers ekle
    const headers = {
        'Content-Type': 'application/json',
        'X-Network': 'BigFile.V1',
        'X-Network-Type': 'testnet',
        'X-Network-Version': '1.0'
    };
    
    // Transaction'ı JSON'a çevir
    const data = JSON.stringify(transaction);
    
    // Manuel olarak POST isteği yap
    const response = await fetch('https://thebigfile.info:1984/tx', {
        method: 'POST',
        headers: headers,
        body: data
    });
    
    return response;
};

// ARQL sorgusu için özel handler
arweave.arql = async function(query) {
    const response = await fetch('https://thebigfile.info:1984/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Network': 'BigFile.V1'
        },
        body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
        throw new Error(`ARQL query failed: ${response.statusText}`);
    }
    
    return response.json();
};

module.exports = arweave; 