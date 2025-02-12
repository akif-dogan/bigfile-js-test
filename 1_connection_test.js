const arweave = require('./config.js');

async function testConnection() {
    try {
        console.log('\nBağlantı Testi:');
        console.log('------------------------');
        
        // Node durumunu kontrol et
        const networkInfo = await arweave.network.getInfo();
        console.log('\nNode Durumu:');
        console.log('------------------------');
        console.log('Network:', networkInfo.network);
        console.log('Version:', networkInfo.version);
        console.log('Release:', networkInfo.release);
        console.log('Height:', networkInfo.height);
        console.log('Current Block:', networkInfo.current);
        console.log('Queue Length:', networkInfo.queue_length);
        console.log('Node State Latency:', networkInfo.node_state_latency);
        
        // HTTP durumunu kontrol et
        try {
            const httpResponse = await fetch('http://65.108.0.39:1984/info');
            console.log('\nBağlantı Durumu:');
            console.log('------------------------');
            console.log('HTTP Bağlantısı:', httpResponse.ok ? 'Başarılı' : 'Başarısız');
            console.log('Protokol:', httpResponse.url.split(':')[0]);
        } catch (httpError) {
            console.log('HTTP kontrolü başarısız:', httpError.message);
        }
        
        // API endpoint'lerini kontrol et
        const endpoints = [
            '/info',
            '/peers',
            '/metrics',
            '/health'
        ];
        
        console.log('\nAPI Endpoint Kontrolleri:');
        console.log('------------------------');
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`http://65.108.0.39:1984${endpoint}`);
                console.log(`${endpoint}:`, response.ok ? 'Erişilebilir' : 'Erişilemez');
            } catch (error) {
                console.log(`${endpoint}: Hata -`, error.message);
            }
        }
        
        // Bağlantı hızını test et
        console.log('\nBağlantı Hızı Testi:');
        console.log('------------------------');
        const startTime = Date.now();
        await arweave.network.getInfo();
        const endTime = Date.now();
        console.log('Yanıt Süresi:', endTime - startTime, 'ms');
        
    } catch (error) {
        console.error('\nBağlantı hatası:', error.message);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
    }
}

testConnection(); 