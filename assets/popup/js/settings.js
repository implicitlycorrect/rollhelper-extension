let saveBtn = document.getElementById('saveSettings');
let inputUsrkey = document.getElementById('userkeyInput');
let inputToken = document.getElementById('tokenInput');
let dcWebhook = document.getElementById('discordInput');
let dcRow = document.getElementsByClassName('discordInput')[0]
let pushoverRow = document.getElementsByClassName('pushoverInput')[0]
let switchNotify = document.getElementById('notifySwitch');
let dcNotify = document.getElementById('dcNotifySwitch');
let notifBox = document.getElementsByClassName('notif-box')[0];
let peApiInput = document.getElementById('peApiKey');
let alertBox = document.getElementsByClassName('alert-set-box')[0];
let depoAlertSwitch = document.getElementById('depoAlert');
let withdrawalSwitch = document.getElementById('withdrawAlert');
let completedSwitch = document.getElementById('completedAlert');
let cooldownSwitch = document.getElementById('cooldownAlert');

// RESTORE THE UI
document.addEventListener('DOMContentLoaded', function () {
    restoreOptions();
});

saveBtn.addEventListener('click', function(){
    let userkeyValue = inputUsrkey.value
    let tokenValue = inputToken.value
    let webhookValue = dcWebhook.value
    let peAPIvalue = peApiInput.value

    if (peAPIvalue != '') {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {peApi: peAPIvalue});
        });
    }

    if (tokenValue != '') {
        chrome.storage.sync.set({
            token: tokenValue
        });
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {token: tokenValue});
        });
    }
    if (userkeyValue != '') {
        chrome.storage.sync.set({
            userkey: userkeyValue
        });
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {userkey: userkeyValue});
        });
    }

    if (webhookValue != '') {
        chrome.storage.sync.set({
            webhook: webhookValue
        });
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {webhook: webhookValue});
        });
    }

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {update: true});
    });

   window.close()
})

completedSwitch.addEventListener('change', function(){
    if (this.checked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantCompletedAlert: true});
        });

        // save state into storage
        chrome.storage.sync.set({
            completedAlertSwitchState: true
        });
    }

    else {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantCompletedAlert: false});
        });

        // save state into storage
        chrome.storage.sync.set({
            completedAlertSwitchState: false
        });
    }
})
cooldownSwitch.addEventListener('change', function(){
    if (this.checked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantCooldownAlert: true});
        });

        // save state into storage
        chrome.storage.sync.set({
            cooldownSwitchState: true
        });
    }

    else {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantCooldownAlert: false});
        });

        // save state into storage
        chrome.storage.sync.set({
            cooldownSwitchState: false
        });
    }
})

dcNotify.addEventListener('change', function(){
    if(this.checked){
        // if (dcRow.classList.contains('displayNone')) {
        //     dcRow.classList.remove('displayNone')
        // }
        chrome.storage.sync.set({
            dcNotifyState: true
        });
    } else{
        // if (!dcRow.classList.contains('displayNone')) {
        //     dcRow.classList.add('displayNone')
        // }
        chrome.storage.sync.set({
            dcNotifyState: false
        });
    }
})

switchNotify.addEventListener('change', function(){
    if(this.checked){
        chrome.storage.sync.set({
            switchNotifyState: true
        });
    } else{
        chrome.storage.sync.set({
            switchNotifyState: false
        });
    }
})


depoAlertSwitch.addEventListener('change', function(){
    if (this.checked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantDepoAlert: true});
        });

        // save state into storage
        chrome.storage.sync.set({
            depoAlertSwitchState: true
        });
    }

    else {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantDepoAlert: false});
        });

        // save state into storage
        chrome.storage.sync.set({
            depoAlertSwitchState: false
        });
    }
})

withdrawalSwitch.addEventListener('change', function(){
    if (this.checked) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantWithdrawalAlert: true});
        });

        // save state into storage
        chrome.storage.sync.set({
            withdrawAlertSwitchState: true
        });
    }

    else {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {wantWithdrawalAlert: false});
        });

        // save state into storage
        chrome.storage.sync.set({
            withdrawAlertSwitchState: false
        });
    }
})


function restoreOptions(){

    chrome.storage.sync.get(["cooldownSwitchState"]).then((res) => {
        cooldownSwitch.checked = res.cooldownSwitchState;
    });

    chrome.storage.sync.get(["completedAlertSwitchState"]).then((res) => {
        completedSwitch.checked = res.completedAlertSwitchState;
    });

    chrome.storage.sync.get(["dcNotifyState"]).then((res) => {
        dcNotify.checked = res.dcNotifyState;
    });

    chrome.storage.sync.get(["switchNotifyState"]).then((res) => {
        switchNotify.checked = res.switchNotifyState;
    });

    chrome.storage.sync.get(["token"]).then((res) => {
        if(!res.token){
            inputToken.placeholder = "token"
        }
        if(res.token){
            inputToken.placeholder = '*******'
        }
    });

    chrome.storage.sync.get(["userkey"]).then((res) => {
        if(!res.userkey){
            inputUsrkey.placeholder = "userkey"
        }
        if(res.userkey){
            inputUsrkey.placeholder = '*******'
        }
    });

    chrome.storage.sync.get(["peApi"]).then((res)=>{
        if(!res.peApi){
            peApiInput.placeholder = "PE-API"
        }
        if(res.peApi){
            peApiInput.placeholder = '*******'
        }
    })

    chrome.storage.sync.get(["webhook"]).then((res)=>{
        if(!res.webhook){
            dcWebhook.placeholder = "Discord Webhook"
        }
        if(res.webhook){
            dcWebhook.placeholder = '*******'
        }
    })

    chrome.storage.sync.get(["depoAlertSwitchState"]).then((res)=>{
        depoAlertSwitch.checked = res.depoAlertSwitchState
    })
    chrome.storage.sync.get(["withdrawAlertSwitchState"]).then((res)=>{
        withdrawalSwitch.checked = res.withdrawAlertSwitchState
    })
}