const arweave = require('./config.js');

async function testNetworkInfo() {
    try {
        console.log('\nAğ Bilgileri Testi:');
        console.log('------------------------');
        
        // Ağ bilgilerini al
        const networkInfo = await arweave.network.getInfo();
        console.log('Ağ Adı:', networkInfo.network);
        console.log('Versiyon:', networkInfo.version);
        console.log('Blok Yüksekliği:', networkInfo.height);
        console.log('Peer Sayısı:', networkInfo.peers);
        console.log('Kuyruk Uzunluğu:', networkInfo.queue_length);
        
        // Peer listesini al
        const peers = await arweave.network.getPeers();
        console.log('\nBağlı Peer\'lar:', peers);
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testNetworkInfo(); 