const updateSettings = async() => {
    chrome.storage.sync.get(["steamOfferMessage"]).then((res)=>{
        offerMessage = res.steamOfferMessage
    })

    chrome.storage.sync.get(["wantSendOffers"]).then((res)=>{
        sendSteamOffers = res.wantSendOffers
    })
    chrome.storage.sync.get(["wantCompletedAlert"]).then((res)=>{
        completedAlert = res.wantCompletedAlert
    })

    chrome.storage.sync.get(["wantCooldownAlert"]).then((res)=>{
        cooldownAlert = res.wantCooldownAlert
    })

    chrome.storage.sync.get(["dcNotifyState"]).then((res)=>{
        discord = res.dcNotifyState;
    });

    chrome.storage.sync.get(["wantWithdrawalAlert"]).then((res) => {
        withdrawAlert = res.wantWithdrawalAlert;
    });

    chrome.storage.sync.get(["wantDepoAlert"]).then((res) => {
        depoAlert = res.wantDepoAlert;
    });

    chrome.storage.sync.get(["peApi"]).then((res) => {
        peApiKey = res.peApi;
    });

    chrome.storage.sync.get(["switchDepoState"]).then((res) => {
        depoAutoAccept = res.switchDepoState;
    });

    chrome.storage.sync.get(["switchNotifyState"]).then((res) => {
        Pushover = res.switchNotifyState;
    });

    chrome.storage.sync.get(["token"]).then((res) => {
        token = res.token;
    });

    chrome.storage.sync.get(["userkey"]).then((res) => {
        userkey = res.userkey;
    });

    chrome.storage.sync.get(["webhook"]).then((res) => {
        webhook = res.webhook;
    });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.wantSendOffers !== undefined) {
        chrome.storage.sync.set({wantSendOffers: msg.wantSendOffers}).then(() => {
            updateSettings()
        });
    }

    if (msg?.wantCooldownAlert !== undefined) {
        chrome.storage.sync.set({wantCooldownAlert: msg.wantCooldownAlert}).then(() => {
            updateSettings()
        });
    }

    if (msg?.wantCompletedAlert !== undefined) {
        chrome.storage.sync.set({wantCompletedAlert: msg.wantCompletedAlert}).then(() => {
            updateSettings()
        });
    }

    if (msg?.wantWithdrawalAlert !== undefined) {
        chrome.storage.sync.set({wantWithdrawalAlert: msg.wantWithdrawalAlert}).then(() => {
            updateSettings()
        });
    }

    if (msg?.wantDepoAlert !== undefined) {
        chrome.storage.sync.set({wantDepoAlert: msg.wantDepoAlert}).then(() => {
            updateSettings()
        });
    }

    if (msg.peApi){
        if (msg.peApi.length != 36) {
            console.log(`%c[ROLLHELOPER] -> Please enter valid pricempire API KEY`, errorCSSlog)
            chrome.storage.sync.set({peApi: ''}).then(() => {
                updateSettings()
            });
        }else {
            chrome.storage.sync.set({peApi: msg.peApi}).then(() => {
                peApiKey = msg.peApi;
                loadPriceDataPricempire()
                updateSettings()
            });
        }
    };

    if (msg.userkey && msg.token){
        chrome.storage.sync.set({userkey: msg.userkey, token: msg.token}).then(() => {
            alert(`Pushover settings have been saved!\nMake sure you pasted correct key in order to recieve notifications`)
            updateSettings()
        });
    };

    if (msg.webhook) {
        chrome.storage.sync.set({webhook: msg.webhook}.then(()=>{
            alert(`Discord webhook has been updated!\nMake sure you pasted correct webhook in order to recieve notifications`)
            updateSettings()
        }))
    }

    if (msg.update){
        updateSettings();
    };
})