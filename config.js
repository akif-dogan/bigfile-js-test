const Arweave = require('arweave');

// SSL sertifika doğrulama hatasını kaldır
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const arweave = Arweave.init({
    host: '65.108.0.39',
    port: 1984,
    protocol: 'http',
    timeout: 600000,
    logging: false,
    network: 'bigfile.V.1.testnet'
});

// Token dönüşüm fonksiyonları (hem büyük hem küçük harf için)
arweave.big = {
    // Küçük harf versiyonu
    winstonToBig: function(winston) {
        return arweave.ar.winstonToAr(winston);
    },
    bigToWinston: function(big) {
        return arweave.ar.arToWinston(big);
    },
    // Büyük harf versiyonu
    winstonToBIG: function(winston) {
        return arweave.ar.winstonToAr(winston);
    },
    BIGToWinston: function(BIG) {
        return arweave.ar.arToWinston(BIG);
    }
};

module.exports = arweave; 