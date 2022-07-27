
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
         <div class="d-flex flex-column bd-highlight mb-3" style="width: min-content;">

            <div class="card campaign-card bd-highlight">                    
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

            <div class="bd-highlight">
                <button class="btn btn-primary collapse-transfers" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTranfers_${nfts['data'][i]['token_address']}_${nfts['data'][i]['token_id']}" aria-expanded="false" aria-controls="collapseExample" onclick="getTransfersList('${nfts['data'][i]['token_address']}', '${nfts['data'][i]['token_id']}')">Transfers of this items</button>

                <div class="collapse" id="collapseTranfers_${nfts['data'][i]['token_address']}_${nfts['data'][i]['token_id']}"> 
                    <div class="card card-body" id="card-transfers-${nfts['data'][i]['token_address']}-${nfts['data'][i]['token_id']}">
                        <div id="little-loader-${nfts['data'][i]['token_address']}-${nfts['data'][i]['token_id']}" class="little-loader-wrapper" style="display: none;">
                            <div class="little-loader"></div>
                        </div>

                    </div>
                    </div>
            </div>
            </div>

        `
    }

    // Display fully loaded UI for wallet data
    document.querySelector("#disconnected").style.display = "none";
    document.querySelector("#connected").style.display = "block";

    document.querySelector("#overlay").style.display = "none";

}


function scaleAddressString(address) {
    if (address.length > 18)
        return address.substring(0, 17) + '...'
}

function convertValueToEth(value) {
    value = new BigNumber(value).dividedBy(10 ** 18).toString()
    return parseFloat(value).toFixed(4);
}

async function getTransfersList(token_address, token_id) {

    $(`#little-loader-${token_address}-${token_id}`).fadeIn();

    console.log("token_address :", token_address)
    console.log("token_id :", token_id)

    let response = await get(`transfers/${token_address}/${token_id}`);
    let transfers = (await response.json())['data']
    console.log("transfers :", transfers)

    let transfers_html = transfers.map(transfer => `<p class="address-text"> <label class="from-address" data-bs-toggle="tooltip" data-bs-placement="top" title="${transfer['from_address']}">${(transfer['from_address'] != '0x0000000000000000000000000000000000000000') ? scaleAddressString(transfer['from_address']) : "MINT"} </label> &#8594  <label class="from-address" data-bs-toggle="tooltip" data-bs-placement="top" title="${transfer['to_address']}">${(transfer['to_address'] != selectedAccount) ? scaleAddressString(transfer['to_address']) : "YOU"}</label> for ${convertValueToEth(transfer['value'])} Ξ</p>`)
    transfers_html = transfers_html.join("");

    document.querySelector(`#card-transfers-${token_address}-${token_id}`).innerHTML = transfers_html;

    $('#little-loader').fadeOut();
}


/**
 * Main entry point.
 */
window.addEventListener('load', async () => {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    
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