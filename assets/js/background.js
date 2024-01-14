chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'getActiveRollUrls') {
        chrome.tabs.query({},function(tabs) {
            csgorollActiveUrls = 0
            for (const tab of tabs){
                if (tab.url.includes('www.csgoroll')){
                    csgorollActiveUrls += 1
                }
            }
            sendResponse(csgorollActiveUrls)
        });
        return true
    }

    if (msg.type === "priceProvider") {
        const json_url = 'https://prices.csgotrader.app/latest/prices_v6.json';
        fetch(json_url)
            .then(response => response.json()
                .then(t => sendResponse(t)))
        return true;
    }

    // Send the trade offer
    if (msg.type === "sendSteamOffer") {
        let offerMsg = msg.offerMsg
        const steamTradeUrl = msg.tradeLink
        const assetID = msg.assetID
        let tradelinkOffer = ''

        if ((offerMsg !== undefined) || (offerMsg !== ' ')) {
            let encodedMsg = encodeURIComponent(offerMsg)
            tradelinkOffer = `${steamTradeUrl}&csgotrader_send=your_id_730_2_${assetID}&csgotrader_message=${encodedMsg}`;
        }else {
            tradelinkOffer = `${steamTradeUrl}&csgotrader_send=your_id_730_2_${assetID}`;
        }

        chrome.tabs.create({ url: tradelinkOffer });
        return true;
    }
});