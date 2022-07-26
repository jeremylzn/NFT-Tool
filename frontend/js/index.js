
async function fetchAccountData() {

    document.querySelector("#overlay").style.display = "block";

    let balance = await getBalance(selectedAccount);


    balance = new BigNumber(balance).dividedBy(10 ** 18).toString()

    const humanFriendlyBalance = parseFloat(balance).toFixed(4);

    const accountContainer = document.querySelector("#accounts");

    accountContainer.innerHTML = `
        <tr>
            <th class="address">${selectedAccount}</th>
            <td class="balance">${humanFriendlyBalance}</td>
        </tr>
    `;




    let response = await get(`nfts/wallet/${selectedAccount}`);
    let nfts = await response.json()

    console.log("nfts :", nfts);

    for (let i=0; i<nfts['data'].length; i++){
        document.getElementById("nfts").innerHTML += `
            <div class="card campaign-card">                    
                <div class="image-campaign">
                    <a href="https://opensea.io/assets/${nfts['data'][i]['token_address']}/${nfts['data'][i]['token_id']}" target="_blank">
                        <img src="${nfts['data'][i]['metadata']['image']}" alt="${nfts['data'][i]['metadata']['description']}" class="rounded card-img-top img-responsive mx-auto"/>
                    </a>
                </div>
            
                <div class="card-body">
                    <h2 class="card-title title mt-2">${nfts['data'][i]['metadata']['name']}</h2>
                    <!-- <p class="card-title total-sum">${nfts['data'][i]['metadata']['description']}</p>   -->                  
                </div>
            </div>
            <button class="btn btn-primary" type="button">Button</button>
        `
    }

    // Display fully loaded UI for wallet data
    document.querySelector("#disconnected").style.display = "none";
    document.querySelector("#connected").style.display = "block";

    document.querySelector("#overlay").style.display = "none";

}



/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
    const user = await isConnected()
    console.log(user)
    if (user) {
        selectedAccount = user.get("ethAddress");
        fetchAccountData();
    } else {
        document.querySelector("#disconnected").style.display = "block";
        document.querySelector("#connected").style.display = "none";
    }
    document.getElementById("btn-connect").onclick = login;
    document.getElementById("btn-disconnect").onclick = logOut; 
});