const arweave = require('./config.js');
const fs = require('fs');

async function uploadImage(imagePath) {
    try {
        // Ana cüzdanı kullan (wallet.json)
        const wallet = JSON.parse(fs.readFileSync('wallet.json'));
        
        // Önce bakiyeyi kontrol et
        const address = await arweave.wallets.jwkToAddress(wallet);
        const balance = await arweave.wallets.getBalance(address);
        
        console.log('\nCüzdan Bilgileri:');
        console.log('------------------------');
        console.log('Adres:', address);
        console.log('Bakiye:', arweave.ar.winstonToAr(balance), 'AR');
        
        // Resim dosyasını oku
        const imageData = fs.readFileSync(imagePath);
        const imageType = imagePath.split('.').pop().toLowerCase(); // jpg, png vs.
        
        // Transaction oluştur
        const transaction = await arweave.createTransaction({
            data: imageData
        }, wallet);
        
        // Tag'leri ekle
        transaction.addTag('Network', 'BigFile.V1');  // Güncellenmiş ağ adı
        transaction.addTag('Content-Type', `image/${imageType}`);
        transaction.addTag('App-Name', 'BigFileTest');
        transaction.addTag('Type', 'Image');
        transaction.addTag('File-Type', imageType);
        transaction.addTag('Creator', address);
        transaction.addTag('Original-Name', imagePath.split('/').pop());
        transaction.addTag('Upload-Date', new Date().toISOString());
        
        // İşlem ücretini görüntüle
        console.log('\nYükleme Detayları:');
        console.log('------------------------');
        console.log('Dosya Adı:', imagePath.split('/').pop());
        console.log('Dosya Türü:', imageType);
        console.log('Dosya Boyutu:', (imageData.length / 1024).toFixed(2), 'KB');
        console.log('İşlem Ücreti:', arweave.ar.winstonToAr(transaction.reward), 'AR');
        
        // Kullanıcı onayı
        console.log('\nDevam etmek istiyor musunuz? (Y/N)');
        const response = await new Promise(resolve => {
            process.stdin.once('data', data => {
                resolve(data.toString().trim().toLowerCase());
            });
        });
        
        if (response !== 'y') {
            console.log('İşlem iptal edildi');
            return;
        }
        
        // İşlemi imzala
        await arweave.transactions.sign(transaction, wallet);
        
        console.log('\nDosya yükleniyor...');
        
        // Büyük dosyalar için chunk chunk yükle
        let uploader = await arweave.transactions.getUploader(transaction);
        
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`Yükleme: ${uploader.pctComplete}% tamamlandı`);
            // Her chunk sonrası küçük bir bekleme ekle
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // İşlem durumunu kontrol et
        const finalStatus = await arweave.transactions.getStatus(transaction.id);
        
        console.log('\nSonuç:');
        console.log('------------------------');
        console.log('İşlem ID:', transaction.id);
        console.log('Status:', finalStatus.status);
        console.log('Durum:', finalStatus.status === 200 ? 'Başarılı' : 'İşleniyor');
        
        console.log('\nVeri Erişim:');
        console.log('------------------------');
        console.log('URL:', `https://thebigfile.info:1984/${transaction.id}`);
        
        // İşlem tamamlandığında process'i sonlandır
        process.exit(0);
        
    } catch (error) {
        console.error('\nHata:', error);
        if (error.response) {
            console.error('Sunucu Yanıtı:', error.response.data);
        }
        process.exit(1);
    }
}

// Resim dosyasının yolunu belirtin
const imagePath = './testsvg.svg'; // Bu kısmı kendi resim dosyanızın yoluyla değiştirin
uploadImage(imagePath); 