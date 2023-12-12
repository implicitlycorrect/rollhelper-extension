let saveBtn = document.getElementById('saveSettings');
let switchDepo = document.getElementById('depoSwitch');
let sendOfferSwitch = document.getElementById('sendOfferSwitch')
let steamMsgInput = document.getElementById('steamOfferMessageInput')

document.addEventListener('DOMContentLoaded', function () {
    restoreOptions();
});

saveBtn.addEventListener('click', function(){
    let offerMessageValue = steamMsgInput.value

    if (offerMessageValue != '') {
        chrome.storage.sync.set({
            steamOfferMessage: offerMessageValue
        });

        // chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        //     var activeTab = tabs[0];
        //     chrome.tabs.sendMessage(activeTab.id, {steamOfferMessage: offerMessage});
        // });
    }

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {update: true});
    });

    window.close()
})

let UIconfigSTATE

sendOfferSwitch.addEventListener('change', function() {
    if (this.checked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantSendOffers: true});
        });

        // save state into storage
        chrome.storage.sync.set({
            wantSendOffersState: true
        });
    }
    else {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantSendOffers: false});
        });

        // save state into storage
        chrome.storage.sync.set({
            wantSendOffersState: false
        });
    }
})


switchDepo.addEventListener('change', function(){
    if(this.checked){

        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {switchDepoState: true});
        });

        chrome.storage.sync.set({
            switchDepoState: true
        });

    } else{
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {switchDepoState: false});
        });

        chrome.storage.sync.set({
            switchDepoState: false
        });
    }
});

function restoreOptions(){

    chrome.storage.sync.get(["switchDepoState"]).then((res) => {
        switchDepo.checked = res.switchDepoState;
    });

    chrome.storage.sync.get(["wantSendOffersState"]).then((res)=>{
        sendOfferSwitch.checked = res.wantSendOffersState
    })

    chrome.storage.sync.get(["steamOfferMessage"]).then((res) => {
        if(!res.steamOfferMessage){
            steamMsgInput.placeholder = "Steam Offer Message"
        }
        if(res.steamOfferMessage){
            steamMsgInput.placeholder = res.steamOfferMessage
        }
    });

}