// const Moralis = require("moralis/node");
const axios = require('axios');

let PQueue;

(async () => {
    PQueue = (await import('p-queue')).default;
})();

/* Moralis init code */
// const serverUrl = process.env.MORALIS_SERVER_URL;
// const appId = process.env.MORALIS_APP_ID;
// const masterKey = process.env.MORALIS_MASTER_KEY;

// await Moralis.start({ serverUrl, appId, masterKey });

const moralis = async function moralis(query, doRetry = true) {
    let response;
    let url = `https://deep-index.moralis.io/api/v2/` + query

    console.log('url :', url)
    try {
        response = await axios.get(url, {
            headers: { 'X-API-Key': process.env.MORALIS_API_KEY, 'accept': ' application/json' },
            timeout: 30000,
        });
    } catch (error) {
        if (!doRetry) {
            throw error;
        }

        if (error.code === 'ENOTFOUND') {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await moralis(query);
        }

        if (error.code === 'ETIMEDOUT') {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await moralis(query);
        }

        if (error.message.startsWith('timeout of ')) {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await moralis(query);
        }

        if (error.response && error.response.status === 404) {
            throw error;
        }

        if (error.response && error.response.status >= 400 && error.response.status < 600) {
            console.error(`Error : ${error}`);
            console.log('Sleep 5 sec')
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await moralis(query);
        }

        throw error;
    }

    if (response.data.errors && response.data.errors[0].message.startsWith('Complexity budget exhausted,')) {
        let match = response.data.errors[0].message.match(/([0-9]+) seconds$/);

        if (match) {
            let secondsToWait = parseInt(match[1]);
            console.log(`! Maximum query rate is reached. Need to wait for ${secondsToWait}s...`);
            await new Promise((resolve) => setTimeout(resolve, secondsToWait * 1000 + 1000));
            return await moralis(query);
        }
    }

    if (response.data.errors) {
        let error = new Error('Invalid request');
        error.errors = response.data.errors;
        throw error;
    }

    if (response.data.error_code) {
        let error = new Error(response.data.error_message);
        error.code = response.data.error_code;
        error.data = response.data.error_data;
        throw error;
    }

    return response.data;
};

moralis.getNFTs = async function ({ address, result, cursor=null }) {

    let url = `${address}/nft?chain=eth&format=decimal&limit=5`
    if (cursor) url += `&cursor=${cursor}`
    let response = await moralis(url);

    result.push(...response["result"]);
    if (response["cursor"]) {
        const nextCursor = response["cursor"];
        await this.getNFTs({ address : address, result : result, cursor : nextCursor });
    }

    console.log('result size : ', result.length)
    return result;
};

moralis.resyncMetadata = async function ({ address, tokenid }) {

    let url = `nft/${address}/${tokenid}/metadata/resync?chain=eth&flag=uri&mode=sync`
    let response = await moralis(url);
    return response;
};

moralis.transfersByNft = async function ({ address, tokenid, result, cursor=null }) {


    let url = `nft/${address}/${tokenid}/transfers?chain=eth&format=decimal`
    if (cursor) url += `&cursor=${cursor}`
    let response = await moralis(url);

    result.push(...response["result"]);
    if (response["cursor"]) {
        const nextCursor = response["cursor"];
        await this.transfersByNft({ address : address, tokenid: tokenid, result : result, cursor : nextCursor });
    }

    result.sort((a,b) => a.block_number - b.block_number);

    return result;
};


moralis.balanceAccount = async function ({ address }) {


    let url = `${address}/balance?chain=eth`
    let response = await moralis(url);

    return response;
};

module.exports = moralis;

