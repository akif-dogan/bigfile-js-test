const arweave = require('./config.js');

async function testConnection() {
    try {
        // Ağ bilgilerini al
        const info = await arweave.network.getInfo();
        
        console.log('\nAğ Bilgileri:');
        console.log('------------------------');
        console.log(JSON.stringify(info, null, 2));
        
        // Bağlantı durumunu kontrol et
        if (info && info.network) {
            console.log('\nBağlantı başarılı ✅');
        } else {
            console.log('\nBağlantı başarısız ❌');
        }
        
    } catch (error) {
        console.error('\nBağlantı hatası:', error.message);
    }
}

testConnection(); 