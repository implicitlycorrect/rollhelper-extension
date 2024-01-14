console.log(`%c[ROLLHELPER] [v1.0.1]`, "color:#e0e0e0;font-weight: bold; font-size:23px")

let itemID
let userID
let balance
let socket

let itemsList = []
let allItemList = []

itemInfo = {};
prices = {};
rates = {}

setTimeout(()=>{
    updateSettings()
},6000)


chrome.runtime.sendMessage({type: 'getActiveRollUrls'}, async response => {
    let csgorollUrlCount = response
    if (csgorollUrlCount === 1) {
        await getUserID()
        getCurrentSteamInvData()
        await updateSettings()
        connectWSS()
    }else{
        console.log(`%cRollHelper connection runs in different tab!`,"color:#e0e0e0;font-weight: normal; font-size:15px")
    }
});

const ratesURL = chrome.runtime.getURL('assets/rates/rates.json');
fetch(ratesURL)
    .then(response => response.json())
    .then(data => {
        rates = data;
    })
    .catch(error => {
        console.log(error)
        console.log(`%c[ROLLHELPER - ERROR] - Could not load the pricing rates file (rates.json)`, errorCSSlog);
    });

chrome.storage.sync.get(["peApi"]).then((res) => {
    peApiKey = res.peApi;
    if (peApiKey != undefined){
        loadPriceDataPricempire()
    } else {
        loadPriceDataPricempire()
    }
});


function connectWSS(){
    socket = new WebSocket(
        "wss://api.csgoroll.com/graphql",
        "graphql-transport-ws"
    );

    socket.onopen = () => {
        setTimeout(() => {
            socket.send(JSON.stringify({"type":"connection_init"}));
        },300);

        setTimeout(() => {
            socket.send(JSON.stringify(updateTradePayload));
        },1300);

        setInterval( () => {
            socket.send(JSON.stringify({"type":"ping"}))
        },57000);
    }

    socket.onmessage = (event) => {
        let data = JSON.parse(event.data)
        if (data?.type === 'connection_ack') {
            console.log(`%c${DateFormater(new Date())} | [ROLLHELPER - CONNECTED]`,noticeCSSlog)
        }

        if(data?.payload?.data?.updateTrade){
            let trade = data.payload.data.updateTrade.trade
            if(trade.withdrawer != null && trade.status === 'JOINED'){
                // DEPOSIT
                if (trade.depositor.id === userID && depoAutoAccept) {
                    let marketName = trade.tradeItems[0].marketName;
                    let markup = trade.tradeItems[0].markupPercent;
                    let value = trade.tradeItems[0].value;
                    let withdrawerName = trade.withdrawer.displayName;
                    let withdrawerID = trade.withdrawer.id;
                    let float = trade.avgPaintWear; // 3 decimal cut
                    let ID = trade.tradeItems[0].itemVariant.id // longer id
                    let itemID = trade.tradeItems[0].itemVariant.itemId // shorter id
                    let stickersArr = trade.tradeItems[0].stickers
                    let basePrice = trade.tradeItems[0].itemVariant.value
                    let addedStickersValue = 0
                    let maxMarkup = 12
                    let coinsToUsd
                    acceptTrade(trade.id)

                    if (stickersArr.length > 0) {
                        for (const sticker of stickersArr) {
                            if (sticker.wear == 0) {
                                addedStickersValue += (sticker.value)/5;
                            }else {
                                addedStickersValue += (sticker.value)/20;
                            }
                        }
                        maxMarkup = evalMaxMarkup(basePrice, addedStickersValue)
                    }

                    let usd;
                    let profit;
                    let rate;
                    let eval_res = buffProfitEval(marketName, value, 'deposit') // [usd, profit]

                    if (eval_res) {
                        usd = eval_res[0];
                        profit = eval_res[1];
                        rate = eval_res[2];
                        coinsToUsd = (value*rate).toFixed(2);
                    }else {
                        usd = '[-]';
                        profit = '[-]';
                        coinsToUsd = '[-]'
                        rate = '[-]'
                    }
                    const encodedItemName = encodeURIComponent(marketName).replace(/\(/g, '%28').replace(/\)/g, '%29');
                    const buffUrl = "https://api.pricempire.com/v1/redirectBuff/" + encodedItemName;
                    console.log(`%c${DateFormater(new Date())} | [DEPOSIT]\n\t${marketName}\n\t${value} coins | (${markup}%) | ${coinsToUsd}$\n\t[FV]: ${float} | [MAX MARKUP]: ${maxMarkup}%\n\t[BUFF163]: ${usd}$ (RATE: ${rate})\n\t[Price-Of-BUFF]: ${profit}%`,depositCSSlog)
                    console.log(buffUrl)
                    itemInfo.tradeInfo = `[DEPOSIT]\n${marketName}\n${value} coins | +${markup}%\n[FV: ${float}]`
                    if (depoAlert) {
                        if (Pushover){
                            sendPushoverNotification(itemInfo);
                        }
                        if (discord) {
                            sendWebHookDiscord(Webhook, webhookType = 'areYouReady', itemInfo);
                        }
                    }
                }


                if (trade.depositor.id != userID){
                    let marketName = trade.tradeItems[0].marketName;
                    let markup = trade.tradeItems[0].markupPercent;
                    let value = trade.tradeItems[0].value;
                    let rollName = trade.depositor.displayName;
                    let steamName = trade.depositor.steamDisplayName;
                    let rollID = trade.depositor.id;
                    let float = trade.avgPaintWear;
                    let usd;
                    let profit;
                    let rate;
                    let coinsToUsd
                    let stickersArr = trade.tradeItems[0].stickers
                    let basePrice = trade.tradeItems[0].itemVariant.value
                    let addedStickersValue = 0
                    let maxMarkup = 12
                    if (stickersArr.length > 0) {
                        for (const sticker of stickersArr) {
                            if (sticker.wear == 0) {
                                addedStickersValue += (sticker.value)/5;
                            }else {
                                addedStickersValue += (sticker.value)/20;
                            }
                        }
                         maxMarkup = evalMaxMarkup(basePrice,addedStickersValue)
                    }

                    let eval_res = buffProfitEval(marketName, value) // [usd, profit, rate]
                    if (eval_res) {
                        usd = eval_res[0];
                        profit = eval_res[1];
                        rate = eval_res[2]
                        coinsToUsd = (value*rate).toFixed(2);
                    }else {
                        usd = '[-]';
                        profit = '[-]';
                        coinsToUsd = '[-]'
                        rate = '[-]'
                    }
                    console.log(`%c${DateFormater(new Date())} | [WITHDRAW - WAITING]\n\t${marketName}\n\t${value} coins | (${markup}%) | ${coinsToUsd}$\n\t[FV]: ${float} | [MAX MARKUP]: ${maxMarkup}%\n\tROLLNAME: ${rollName}\n\tRollID: ${rollID}\n\t[BUFF163]: ${usd}$ (RATE: ${rate})\n\t[Price-Of-BUFF]: ${profit}%`,noticeCSSlog)
                }
            }


            if (trade.withdrawer != null && trade.status === 'COMPLETED'){
                let marketName = trade.tradeItems[0].marketName;
                let markup = trade.tradeItems[0].markupPercent;
                let value = trade.tradeItems[0].value;
                let float = trade.avgPaintWear;
                let usd;
                let profit;
                let rate;
                let coinsToUsd

                let stickersArr = trade.tradeItems[0].stickers
                let basePrice = trade.tradeItems[0].itemVariant.value
                let addedStickersValue = 0
                let maxMarkup = 12
                if (stickersArr.length > 0) {
                    for (const sticker of stickersArr) {
                        if (sticker.wear == 0) {
                            addedStickersValue += (sticker.value)/5;
                        }else {
                            addedStickersValue += (sticker.value)/20;
                        }
                    }
                    maxMarkup = evalMaxMarkup(basePrice,addedStickersValue)
                }

                let eval_res = buffProfitEval(marketName, value) // [usd, profit]
                if (eval_res) {
                     usd = eval_res[0];
                     profit = eval_res[1];
                     rate = eval_res[2];
                     coinsToUsd = (value*rate).toFixed(2);
                }else {
                    usd = '[-]';
                    profit = '[-]';
                    coinsToUsd = '[-]'
                    rate = '[-]'
                }

                console.log(`%c${DateFormater(new Date())} | [TRADE - COMPLETED]\n\t${marketName}\n\t${value} coins | (${markup}%) | ${coinsToUsd}$\n\t[FV]: ${float} | [MAX MARKUP]: ${maxMarkup}%\n\t[BUFF163]: ${usd}$ (RATE: ${rate})\n\t[Price-Of-BUFF]: ${profit}%`,tradeCompletedCSSlog)
                itemInfo.tradeInfo = `[TRADE - COMPLETED]\n${marketName}\n${value} coins | +${markup}%\n[FV: ${float}]`

                if (depoAlert && completedAlert) {
                    if (Pushover) sendPushoverNotification(itemInfo);
                    if (discord) sendWebHookDiscord(Webhook, webhookType = 'TradeCompleted', itemInfo);
                }
            }

            if (trade.withdrawer != null && trade.status === 'COOLDOWN'){
                let marketName = trade.tradeItems[0].marketName;
                let markup = trade.tradeItems[0].markupPercent;
                let value = trade.tradeItems[0].value;
                let float = trade.avgPaintWear;

                console.log(`%c${DateFormater(new Date())} | [TRADE - COOLDOWN]\n\t${marketName}\n\t${value} coins | (${markup}%)\n\t[FV]: ${float}`,errorCSSlog)
                itemInfo.tradeInfo = `[TRADE - COOLDOWN]\n${marketName}\n${value} coins | +${markup}%\n[FV: ${float}]`

                if (depoAlert && cooldownAlert) {
                    if (Pushover) sendPushoverNotification(itemInfo);
                    if (discord) sendWebHookDiscord(Webhook, webhookType = 'TradeCooldown', itemInfo);
                }
            }

            if(trade.withdrawer != null && trade.status === 'PROCESSING'){
                if (trade.depositor.id == userID && sendSteamOffers) {
                    //send the steam offer here
                    let markup = trade.tradeItems[0].markupPercent;
                    let value = trade.tradeItems[0].value;
                    let marketName = trade.tradeItems[0].marketName;
                    let float = trade.avgPaintWear; // 3 decimal cut
                    let ID = trade.tradeItems[0].itemVariant.id // longer id
                    let itemID = trade.tradeItems[0].itemVariant.itemId // shorter id
                    let tradeLink = data.payload.data.updateTrade.trade.withdrawerSteamTradeUrl;
                    let asset
                    let found = false
                    let externalSteamId =  data.payload.data.updateTrade.trade.tradeItems[0].steamExternalAssetId

                    let stickers = trade.tradeItems[0].stickers
                    let formattedStickersText = ''
                    for (const sticker of stickers) {
                        if (sticker.color != null) {
                            formattedStickersText += `${sticker.name} (${sticker.color})\n`
                        } else {
                            formattedStickersText += `${sticker.name}\n`
                        }
                    }
                    for (const item of itemsList) {
                        if (item.itemID === itemID && item.steamExternalId === externalSteamId) {
                            if (item.float == float) {
                                asset = item.assetID
                                found = true
                                sendSteamTradeOffer(asset, tradeLink, offerMessage)
                                console.log(`%c${DateFormater(new Date())} | [ROLLHELPER - Steam offer sent]`, steamOfferCSSlog)
                                break
                            }
                        }
                    }

                    if (!found) {
                        console.log (`%c${DateFormater(new Date())} | [ROLLHELPER - Steam offer error (item not found)]`, errorCSSlog)
                    }
                }

                if (trade.depositor.id != userID){
                    let marketName = trade.tradeItems[0].marketName;
                    let markup = trade.tradeItems[0].markupPercent;
                    let value = trade.tradeItems[0].value;
                    let float = trade.avgPaintWear;
                    let usd;
                    let profit;
                    let rate;
                    let coinsToUsd
                    let stickersArr = trade.tradeItems[0].stickers
                    let basePrice = trade.tradeItems[0].itemVariant.value
                    let addedStickersValue = 0
                    let maxMarkup = 12
                    let formattedStickersText = ''

                    if (stickersArr.length > 0) {
                        for (const sticker of stickersArr) {
                            if (sticker.wear == 0) {
                                addedStickersValue += (sticker.value)/5;
                            }else {
                                addedStickersValue += (sticker.value)/20;
                            }
                            if (sticker.color != null) {
                                formattedStickersText += `\t${sticker.name} (${sticker.color})\n`
                            } else {
                                formattedStickersText += `\t${sticker.name}\n`
                            }
                        }
                        maxMarkup = evalMaxMarkup(basePrice,addedStickersValue)
                    }

                    let eval_res = buffProfitEval(marketName, value) // [usd, profit]
                    if (eval_res) {
                        usd = eval_res[0];
                        profit = eval_res[1];
                        rate = eval_res[2];
                        coinsToUsd = (value*rate).toFixed(2);
                    }else {
                        usd = '[-]';
                        profit = '[-]';
                        coinsToUsd = '[-]'
                        rate = '[-]'
                    }
                    const encodedItemName = encodeURIComponent(marketName).replace(/\(/g, '%28').replace(/\)/g, '%29');
                    const buffUrl = "https://api.pricempire.com/v1/redirectBuff/" + encodedItemName;
                    console.log(`%c${DateFormater(new Date())} | [WITHDRAW - ACCEPTED]\n\t${marketName}\n\t${value} coins | (${markup}%) | ${coinsToUsd}$\n\t[FV]: ${float} | [MAX MARKUP]: ${maxMarkup}%\n\t[BUFF163]: ${usd}$ (RATE: ${rate})\n\t[Price-Of-BUFF]: ${profit}%`, withdrawAcceptedCSSlog)
                    console.log(buffUrl)
                    itemInfo.tradeInfo = `[WITHDRAW]\n${marketName}\n${value} coins | +${markup}% (MAX: ${maxMarkup}%)\n[FV: ${float}]\n [STICKERS]:\n${formattedStickersText}`

                    if (withdrawAlert == true) {
                        if (Pushover) sendPushoverNotification(itemInfo);
                        if (discord) sendWebHookDiscord(Webhook, webhookType = 'IncommingTrade', itemInfo);
                    }
                }
            }
        }
    }

    socket.onerror = (err) => {
        setTimeout(()=>{
            console.log(`%c${DateFormater(new Date())} | [ROLLHELPER - DISCONNECTED]`,errorCSSlog)
            connectWSS()
        },1300)
    };

    socket.onclose = (err) => {
        setTimeout(()=>{
            console.log(`%c${DateFormater(new Date())} | [ROLLHELPER - DISCONNECTED]`,errorCSSlog)
            connectWSS()
        },1200)
    };
}

// PRICEMPIRE PRICE PROVIDER
async function loadPriceDataPricempire(){
    const priceProviderURL = `https://api.pricempire.com/v3/getAllItems?sources=buff&api_key=${peApiKey}`;
    try{
        let res = await fetch(priceProviderURL)
        if (res.status === 200) {
            let data = await res.json()
            prices = data
            provider = 'pricempire'
            console.log(`%c[PRICEMPIRE] -> Successfully loaded current price data`, pricempireCSSlog)
        }else{
            console.log(`%c[PRICEMPIRE - ERROR] -> STATUS CODE: ${res.status}`,pricempireCSSlog)
            console.log(`%c[ROLLHELPER] -> Enter Pricempire API KEY for pricing`, pricempireCSSlog)
            //loadPriceDataCSGOTRADER() // load backup provider
        }
    }catch(err){
        console.log(`%c[PRICEMPIRE - ERROR] -> Can't update the current price data`, pricempireCSSlog)
        //loadPriceDataCSGOTRADER()
    }
}

// FREE CSGOTRADER PRICE PROVIDER
async function loadPriceDataCSGOTRADER(){
    chrome.runtime.sendMessage({type: 'priceProvider'}, response => {
        provider = 'csgotrader'
        prices = response
        console.log(`%c[CSGOTRADER] -> Successfully loaded current price data`, pricempireCSSlog)
    });
}

const buffProfitEval = (marketName, rollprice, event='other') => {
    let rate;
    if (event === 'deposit') {
        rate = 0.66; // always use 0.66 rate for deposit logs
    }
    else {
        // Withdraw logs using rate.json file
        if (marketName.includes('Doppler')) {
            rate = 0.65;
        }else{
            rate = rates[marketName]
            if (rate === undefined) {
                rate = 0.66; // using default rate in case rate is not found
            }else{
                rate = rates[marketName].rate  // rate found in rate.json
            }
        }
    }
    // PRICING PROVIDERS
    switch (provider){
        // DEFAULT PROVIDER PRICEMPIRE
        case 'pricempire':
            if (isDoppler(marketName)) marketName = refactorDopplerNameForPE(marketName);

            price_obj = prices[marketName]
            if (price_obj) {
                try{
                    if (price_obj.buff.isInflated) {
                        console.log(`%c[PRICEMPIRE WARNING] -> INFLATED ITEM`, pricempireCSSlog)
                    }
                    let buff_usd = price_obj.buff.price/100
                    let coins_usd = rollprice * rate
                    let profit = (100 + (parseFloat(((coins_usd - buff_usd)/buff_usd * 100)))).toFixed(2);
                    return [buff_usd, profit, rate]

                }catch(err){
                    console.log(`%cPRICECHECK ERROR: ${marketName}`, errorCSSlog)
                }
            }
            return null;

        // BACKUP FREE PROVIDER CSGOTRADER
        case 'csgotrader':
            if (isDoppler(marketName)) {
                let res = refactorDopplerNameForCSGOTR(marketName)
                marketName = res[0]
                let phase = res[1]
                price_obj = prices[marketName]
                try{
                    let buff_usd = price_obj.buff163.starting_at.doppler[phase];
                    let coins_usd = rollprice * rate;
                    let profit = (100 + (parseFloat(((coins_usd - buff_usd)/buff_usd * 100)))).toFixed(2);
                    return [buff_usd, profit, rate];
                }catch(err){
                    console.log(`%PRICECHECK ERROR: ${marketName}`, errorCSSlog)
                }
            }else{
                price_obj = prices[marketName]
                if (price_obj) {
                    try{
                        let buff_usd = price_obj.buff163.starting_at.price;
                        let coins_usd = rollprice * rate;
                        let profit = (100 + (parseFloat(((coins_usd - buff_usd)/buff_usd * 100)))).toFixed(2);
                        return [buff_usd, profit, rate]

                    }catch(err){
                        console.log(`%cPRICECHECK ERROR: ${marketName}`, errorCSSlog)
                    }
                }
            }
            return null;
    }
}