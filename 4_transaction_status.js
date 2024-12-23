const arweave = require('./config.js');

async function checkTransaction(txId) {
    try {
        // İşlem durumunu kontrol et
        const status = await arweave.transactions.getStatus(txId);
        console.log('İşlem Durumu:', status);
        
        if (status.status === 404) {
            console.log('İşlem henüz onaylanmamış veya bulunamadı. Biraz bekleyip tekrar deneyin.');
            return;
        }
        
        try {
            const transaction = await arweave.transactions.get(txId);
            console.log('İşlem Detayları:', {
                id: transaction.id,
                owner: transaction.owner,
                data: transaction.data,
                reward: arweave.ar.winstonToAr(transaction.reward),
                tags: transaction.tags
            });
        } catch (txError) {
            console.log('İşlem detayları henüz kullanılabilir değil');
        }
        
    } catch (error) {
        console.error('İşlem kontrol hatası:', error);
    }
}

// Kontrol edilecek işlem ID'sini parametre olarak verin
checkTransaction('BPv83FxsMlUpYKUP21BwpFb5TPWc21C4Z8cDHo_NROc'); 