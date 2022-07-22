const db = require('./config').database;
const crypto = require('crypto');

db.nfts = {

    encode(data) {
        return data ? {
            ...data,
        } : null;
    },

    decode(data) {
        return data ? {
            ...data,
        } : null;
    },

    async findById(id) {
        return await db.collection('nft').doc(id).get().data() || null;
    },


    async query(callable) {
        let query =  db.collection('nft');
        callable.call(query);
        return await query;
    },

    async search(callable) {
        let query =  db.collection('nft');
        callable.call(query);
        return (await query).map(this.decode);
    },

    async create(data) {
        const id = crypto.createHash('sha256').update(`${data['contract_address']}_${data['token_id']}_${data['value']}`).digest('hex').toString();
        await db.collection('nft').doc(id).set(data, { merge: true });
        data['id'] = id
        return data;
    },
};

db.transfers = {

    encode(data) {
        return data ? {
            ...data,
        } : null;
    },

    decode(data) {
        return data ? {
            ...data,
        } : null;
    },

    async findById(id) {
        return await db.collection('transfers').doc(id).get().data() || null;
    },


    async query(callable) {
        let query =  db.collection('transfers');
        callable.call(query);
        return await query;
    },

    async search(callable) {
        let query =  db.collection('transfers');
        callable.call(query);
        return (await query).map(this.decode);
    },

    async create(data) {
        const id = crypto.createHash('sha256').update(`${data['block']}_${data['transactionIndex']}_${data['logIndex']}`).digest('hex').toString();
        await db.collection('transfers').doc(id).set(data, { merge: true });
        data['id'] = id
        return data;
    },
};

module.exports = db;