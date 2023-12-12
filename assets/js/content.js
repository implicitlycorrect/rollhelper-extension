// DEV MESSAGE:
console.log(`%c[ROLLHELPER - EXTENSION]`, "color:#e0e0e0;font-weight: bold; font-size:23px")
// console.log(`%cIf you enocunter any issues / bugs or just have suggestions for the addon, you can email me at: rollhelperdeveloper@gmail.com`,
//     "color:#e0e0e0;font-weight: normal; font-size:15px")
const kniveTypes = ["knife","karambit","bayonet","daggers"]
let itemID
let userID
let balance
let socket
let itemsList = []
let allItemList = []
rates = {}

chrome.runtime.sendMessage({type: 'getActiveRollUrls'}, async response => {
    let csgorollUrlCount = response
    if (csgorollUrlCount === 1) {
        await getUserID()
        getCurrentSteamInvData()
        await updateSettings()
        connectWSS()
    }else{
        console.log(`%cRollHelper websocket connection runs in different tab!`,"color:#e0e0e0;font-weight: normal; font-size:15px")
    }
});

let coinsCounter = 0
invFailFetchCount = 0
let afterID = ''
const getCurrentSteamInvData  =  () => {
    const url = "https://api.csgoroll.com/graphql"
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "operationName": "steamInventoryItems",
            "variables": {
                "steamAppName":"CSGO",
                "first":250,
                "userId":userID,
                "after": `${afterID}`
            },
            "extensions":{
                "persistedQuery":{
                    "version":1,
                    "sha256Hash":"7ac9a690c0ac108b6742c9a4726af9df78e53b75152608d0b3acaf184977c306"
                }
            }
        }),
        credentials: 'include'
    })
        .then(res => res.json())
        .then(res => {
           //  console.log(res)
            let tradeListData = res.data.steamInventoryItems.edges
            let hasNextPage = res.data.steamInventoryItems.pageInfo.hasNextPage // bool
            for (const itemData of tradeListData) {

                let itemValue = itemData.node.itemVariant.value
                coinsCounter += itemValue

                if (itemData.node.tradable === true) {
                    let item = {}
                    let stickers = []
                    if (itemData.node.steamStickersDescriptions.length > 0) {
                        for (const sticker of itemData.node.steamStickersDescriptions) {
                            let name = sticker.name
                            stickers.push(name)
                        }
                    }
                    item.steamExternalId = itemData.node.steamExternalAssetId
                    item.marketName = itemData.node.itemVariant.externalId
                    item.assetID = itemData.node.steamItemIdentifiers.assetId
                    item.itemID = itemData.node.itemVariant.itemId
                    item.stickers = stickers
                    if (itemData.node.steamInspectItem?.paintWear) {
                        item.float = Math.floor(itemData.node.steamInspectItem.paintWear * 1000) / 1000;
                    }
                    itemsList.push(item)
                }
            }
            if (hasNextPage) {
                afterID = res.data.steamInventoryItems.pageInfo.endCursor
                getCurrentSteamInvData()
            }else{
                console.log(`%c[ROLLHELPER] -> Successfully loaded tradable items from steam: (${itemsList.length})`,depositCSSlog)
                document.getElementsByClassName('counterCoinButton')[0].innerHTML = Math.round(coinsCounter)
            }
            //console.log(itemsList)
        })
        .catch(error => {
            console.log(error)
            console.log(`%c[ROLLHELPER - ERROR] -> Failed to load the steam inventory data - trying again in 3 seconds`,errorCSSlog)
            invFailFetchCount += 1
            setTimeout(()=>{
                if (invFailFetchCount <= 3) {
                    getCurrentSteamInvData()
                }else {
                    console.log(`%c[ROLLHELPER - ERROR] -> Max amount of tries reached - refresh the page to load inventory`,errorCSSlog)
                }
            },3000)
        })
}

const ratesURL = chrome.runtime.getURL('assets/js/rates.json');
fetch(ratesURL)
    .then(response => response.json())
    .then(data => {
        rates = data;
    })
    .catch(error => {
        console.log(`%c[ROLLHELPER - ERROR] - Could not load the pricing rates file (rates.json)`,errorCSSlog);
    });

let getUserIDcounter = 0
async function  getUserID() {
    getUserIDcounter += 1
    const url = "https://api.csgoroll.com/graphql"
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "operationName": "CurrentUser",
            "variables": {},
            "query": "query CurrentUser {\n  currentUser {\n    ...User\n    __typename\n  }\n}\n\nfragment User on User {\n  id\n  name\n  email\n  verified\n  currency\n  createdAt\n  acceptTos\n  avatar\n  steamId\n  mutedUntil\n  roles\n  userProgress {\n    id\n    xp\n    requiredXp\n    nextRequiredXp\n    level\n    __typename\n  }\n  unlockedChat\n  lastDepositAt\n  stickyReferee\n  steamApiKey\n  steamTradeUrl\n  verificationStatus\n  totalDeposit\n  dailyWithdrawLimit\n  preferences {\n    ...UserPreferences\n    __typename\n  }\n  referralPromoCode {\n    id\n    code\n    __typename\n  }\n  team {\n    id\n    name\n    __typename\n  }\n  tickets {\n    total\n    __typename\n  }\n  wallets {\n    ...Wallet\n    __typename\n  }\n  market {\n    id\n    slug\n    name\n    __typename\n  }\n  trader\n  suspectedTrader\n  microphoneEnabled\n  __typename\n}\n\nfragment UserPreferences on UserPreferences {\n  id\n  name\n  lastName\n  address1\n  address2\n  postcode\n  region\n  city\n  country {\n    code\n    name\n    __typename\n  }\n  birthDate\n  gender\n  phone\n  __typename\n}\n\nfragment Wallet on Wallet {\n  id\n  name\n  amount\n  currency\n  __typename\n}\n" }),
        credentials: 'include'
    })
        .then(res => res.json())
        .then(res => {
            //data currentUser wallet0 amount
            userID = res.data.currentUser.id;
            balance = res.data.currentUser.wallets[0].amount

            if (getUserIDcounter === 1) {
                coinsCounter += balance
                document.getElementsByClassName('counterCoinButton')[0].innerHTML = Math.round(coinsCounter)
            }
            // console.log(userID)
        })
}
itemInfo = {};
prices = {};

setTimeout(()=>{
    updateSettings()
},6000)

let DateFormater = (date) => "[" + new Date().toLocaleString("en-US",
    { hour12: false, hour: "numeric", minute: "numeric"}) + "]";


chrome.storage.sync.get(["peApi"]).then((res) => {
    peApiKey = res.peApi;
    if (peApiKey != undefined){
        loadPriceDataPricempire()
    } else {
        loadPriceDataPricempire()
        //loadPriceDataCSGOTRADER()
    }
});


// Pushover notification
var sendPushoverNotification = ( scrapedData = {} ) => {
    const url = 'https://api.pushover.net/1/messages.json'
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user', userkey);
    formData.append('message', scrapedData.tradeInfo);

    fetch(url, {
        method: 'POST',
        body: formData,
    })
        .catch(error => console.error('PUSHOVER ERROR:', error));
}


function connectWSS(){
    socket = new WebSocket("wss://api.csgoroll.com/graphql", "graphql-transport-ws");
    socket.onopen = () => {

        setTimeout(() => {
            socket.send(JSON.stringify({"type":"connection_init"}));
        },300);

        setTimeout(() => {
            socket.send(JSON.stringify(updateTradePayload));
        },2000);

        ping = setInterval( () => {
            try {
                sendPing
            }catch(err){
            }
        },57000);
        ping;
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
                            sendWebHookDiscord(webhook, webhookType = 'areYouReady', itemInfo);
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
                    if (discord) sendWebHookDiscord(webhook, webhookType = 'TradeCompleted', itemInfo);
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
                    if (discord) sendWebHookDiscord(webhook, webhookType = 'TradeCooldown', itemInfo);
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
                        if (discord) sendWebHookDiscord(webhook, webhookType = 'IncommingTrade', itemInfo);
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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function sendPing(){
    socket.send(JSON.stringify({"type":"ping"}))
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
                    console.log(`%cPRICECHECK ERROR: ${marketName}`,errorCSSlog)
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
                    console.log(`%PRICECHECK ERROR: ${marketName}`,errorCSSlog)
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
                        console.log(`%PRICECHECK ERROR: ${marketName}`,errorCSSlog)
                    }
                }
            }
            return null;
    }
}

const isDoppler = (marketName) => {
    return (marketName.includes('Doppler') || marketName.includes('Emerald') ||
        marketName.includes('Ruby') || marketName.includes('Black Pearl') ||
        marketName.includes('Sapphire')) && isKnife(marketName) ? true : false;
}

const isKnife = (marketName) => {
    marketName = marketName.toLowerCase()
    if (kniveTypes.some((knifeType) => marketName.includes(knifeType))){
       return true;
    }
    return false;
}

const refactorDopplerNameForPE = (marketName) => {
     const phaseMatch = /Phase (\d+)/
     const gemMatch = /(Ruby|Sapphire|Black Pearl|Emerald)/
    if (marketName.match(phaseMatch)) {
        let match = marketName.match(phaseMatch)[0]
        let refactored = marketName.replace(match+' ','') + ` - ${match}`;
        return refactored;
    }
    else{
        if (marketName.match(gemMatch)) {
            let match = marketName.match(gemMatch)[0]
            if (match === 'Emerald') {
                let refactored = marketName.replace(match, 'Gamma Doppler') + ` - ${match}`;
                return refactored;
            }else{
                let refactored = marketName.replace(match, 'Doppler') + ` - ${match}`;
                return refactored;
            }
        }
    }
}

const refactorDopplerNameForCSGOTR = (marketName) => {
    const phaseMatch = /Phase (\d+)/;
    const gemMatch = /(Ruby|Sapphire|Black Pearl|Emerald)/;

    if (marketName.match(phaseMatch)) {
        let phase = marketName.match(phaseMatch)[0];
        let refactoredName = marketName.replace(phase+' ', '')
        return [refactoredName, phase]
    }else{
        if (marketName.match(gemMatch)) {
            let match = marketName.match(gemMatch)[0]
            if (match === 'Emerald') {
                let refactored = marketName.replace(match, 'Gamma Doppler');
                return [refactored, match];
            }else{
                let refactored = marketName.replace(match, 'Doppler');
                return [refactored, match];
            }
        }
    }
}


const evalMaxMarkup = (itemBasePrice, addedStickerValue) => {
  //  let addedStickerValue = (stickersValue / 5) //20
    let maxItemValue = (itemBasePrice + addedStickerValue)
    let maxMarkupPercent = (maxItemValue - itemBasePrice)/itemBasePrice * 100
    if (maxMarkupPercent <= 12) return  12;
    return (maxMarkupPercent+12).toFixed(2);
}


const sendSteamTradeOffer = (assetID, tradeLink, offerMessage) => {
    chrome.runtime.sendMessage({
        type: 'sendSteamOffer',
        assetID: assetID,
        tradeLink: tradeLink,
        offerMsg: offerMessage
    }, response => {
    });
}