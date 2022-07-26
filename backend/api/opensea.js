// const Moralis = require("moralis/node");
const axios = require('axios');

let PQueue;

(async () => {
    PQueue = (await import('p-queue')).default;
})();

const opensea = async function opensea(query, doRetry = true) {
    let response;
    let url = `https://api.opensea.io/api/v2/metadata/ethereum/` + query

    console.log('url :', url)
    try {
        response = await axios.get(url, {
            timeout: 30000,
        });
    } catch (error) {
        if (!doRetry) {
            throw error;
        }

        if (error.code === 'ENOTFOUND') {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await opensea(query);
        }

        if (error.code === 'ETIMEDOUT') {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await opensea(query);
        }

        if (error.message.startsWith('timeout of ')) {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await opensea(query);
        }

        if (error.response && error.response.status === 404) {
            throw error;
        }

        if (error.response && error.response.status >= 400 && error.response.status < 600) {
            console.error(`Error : ${error}`);
            console.log('Sleep 5 sec')
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await opensea(query);
        }

        throw error;
    }

    if (response.data.errors && response.data.errors[0].message.startsWith('Complexity budget exhausted,')) {
        let match = response.data.errors[0].message.match(/([0-9]+) seconds$/);

        if (match) {
            let secondsToWait = parseInt(match[1]);
            console.log(`! Maximum query rate is reached. Need to wait for ${secondsToWait}s...`);
            await new Promise((resolve) => setTimeout(resolve, secondsToWait * 1000 + 1000));
            return await opensea(query);
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

opensea.getMetadata = async function ({ address, tokenid }) {

    let url = `${address}/${tokenid}`
    let response = await opensea(url);

    let result = {
        name : response['name'],
        attributes : response['traits'],
        image : response['image'],
        description : response['description'],
        external_link: response['external_link'],
        animation_url: response['animation_url'],
    }

    return result;
};

module.exports = opensea;

