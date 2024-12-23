const arweave = require('./config.js');

async function testGraphQL() {
    try {
        console.log('\nGraphQL Sorgu Testi:');
        console.log('------------------------');
        
        // Daha basit bir sorgu deneyelim
        const query = `
        {
            transactions(first: 5) {
                edges {
                    node {
                        id
                        recipient
                        owner {
                            address
                        }
                    }
                }
            }
        }`;
        
        console.log('Sorgu gönderiliyor...');
        const response = await arweave.api.post('/graphql', {
            query: query
        }).catch(err => {
            console.log('GraphQL Hatası:', err.message);
            return null;
        });

        if (response && response.data) {
            console.log('Sonuç:', JSON.stringify(response.data, null, 2));
        } else {
            console.log('GraphQL endpoint yanıt vermedi veya hata oluştu');
            console.log('BigFile node\'unda GraphQL desteği kontrol edilmeli');
        }
        
    } catch (error) {
        console.error('\nHata:', error);
    }
}

testGraphQL(); 