kniveTypes = ["knife","karambit","bayonet","daggers"]

const sendSteamTradeOffer = (assetID, tradeLink, offerMessage) => {
    chrome.runtime.sendMessage({
        type: 'sendSteamOffer',
        assetID: assetID,
        tradeLink: tradeLink,
        offerMsg: offerMessage
    }, response => {
    });
}

let DateFormater = (date) => "[" + new Date().toLocaleString("en-US",
    { hour12: false, hour: "numeric", minute: "numeric"}) + "]";

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
    let maxItemValue = (itemBasePrice + addedStickerValue)
    let maxMarkupPercent = (maxItemValue - itemBasePrice)/itemBasePrice * 100
    if (maxMarkupPercent <= 12) return 12;
    return (maxMarkupPercent+12).toFixed(2);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


const createApiUrl = (tabUrl) => {
    if (tabUrl.includes('csgorolltr.com')) {
        return 'https://api.csgorolltr.com/graphql'
    }
    if (tabUrl.includes('csgoroll.com')) {
        return 'https://api.csgoroll.com/graphql'
    }
    if (tabUrl.includes('csgoroll.gg')) {
        return 'https://api.csgoroll.gg/graphql'
    }
}
