chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'getActiveRollUrls') {
        chrome.tabs.query({},function(tabs) {
            csgorollActiveUrls = 0
            let res = []
            for (const tab of tabs){
                if (tab.url.includes('www.csgoroll')){
                    currentDomain = tab.url
                    csgorollActiveUrls += 1
                    res = [currentDomain, csgorollActiveUrls]
                }
            }
            sendResponse(res)
        });
        return true
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

    // Pricempire prices fetch
    if (msg.type === "pricempire") {
        const apiKey = msg.key;

        try {
            const priceProviderURL = `https://api.pricempire.com/v3/getAllItems?sources=buff&api_key=${apiKey}`;

            fetch(priceProviderURL)
                .then(res => res.json())
                .then(data => {
                    sendResponse(data);
                })
                .catch(error => {
                    sendResponse({ error: "Failed to load pricempire prices" });
                });
            return true;
        } catch (e) {
            console.error("Unexpected error:", e);
            sendResponse({ error: "Unexpected error" });
        }
    }
});