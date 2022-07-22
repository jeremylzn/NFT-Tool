const Moralis = require("moralis/node");

let PQueue;

(async () => {
    PQueue = (await import('p-queue')).default;
})();

/* Moralis init code */
const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTER_KEY;

await Moralis.start({ serverUrl, appId, masterKey });

const moralis = async function moralis(params, doRetry = true) {
    let response;
    let url = `https://api.etherscan.io/api`
    console.log(`@ URL API : ${url}`)
    try {
        response = await axios.get(url, {
            params: params,
            timeout: 30000,
        });
    } catch (error) {
        if (!doRetry) {
            throw error;
        }

        if (error.code === 'ENOTFOUND') {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await etherscan(params);
        }

        if (error.code === 'ETIMEDOUT') {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await etherscan(params);
        }

        if (error.message.startsWith('timeout of ')) {
            console.error(error);
            await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
            return await etherscan(params);
        }

        if (error.response && error.response.status === 404) {
            throw error;
        }

        if (error.response && error.response.status >= 400 && error.response.status < 600) {
            console.error(`Error : ${error}`);
            console.log('Sleep 30 sec')
            await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
            return await etherscan(params);
        }

        throw error;
    }

    if (response.data.errors && response.data.errors[0].message.startsWith('Complexity budget exhausted,')) {
        let match = response.data.errors[0].message.match(/([0-9]+) seconds$/);

        if (match) {
            let secondsToWait = parseInt(match[1]);
            console.log(`! Maximum query rate is reached. Need to wait for ${secondsToWait}s...`);
            await new Promise((resolve) => setTimeout(resolve, secondsToWait * 1000 + 1000));
            return await etherscan(param);
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

etherscan.ERC721ByAddress = async function ({ address, page }) {

    const params = {
        module: "account", 
        action: "tokennfttx",
        address: address,
        page: `${page}`,
        offset: "1000",
        sort: "asc",
        apikey: process.env.ETHERSCAN_API_KEY
    }
    let response = await etherscan(params);

    const result = [];
    if (response["status"] === "1") {
        result.push(...response["result"]);
        const nextPage = page + 1;
        await this.ERC721ByAddress({ address : address, page : nextPage });
    }
    return result;
};

module.exports = etherscan;

