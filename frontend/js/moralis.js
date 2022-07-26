/* Moralis init code */
const serverUrl = "https://yt1lod1oa7lj.usemoralis.com:2053/server";
const appId = "QtKomBTYSeabPnrUwH6YN7k6Tg1oawaR3bSWrQmH";
Moralis.start({ serverUrl, appId });

/* Authentication code */
async function login() {
    let user = await isConnected();
    if (!user) {
        user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
        selectedAccount = user.get("ethAddress")
        fetchAccountData();
    }
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
    // Display fully loaded UI for wallet data
    document.querySelector("#disconnected").style.display = "block";
    document.querySelector("#connected").style.display = "none";
}

async function isConnected() {
    let user = Moralis.User.current();
    if (!user)
        return false
    return user
}

async function getBalance(address) {
    let response = await get(`account/${address}`);
    let account = await response.json()
    return account['data']['balance']
}
  
