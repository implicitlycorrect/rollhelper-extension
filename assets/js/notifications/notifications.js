// Pushover notification
var sendPushoverNotification = ( scrapedData = {} ) => {
    const url = 'https://api.pushover.net/1/messages.json'
    const formData = new FormData();
    formData.append('token', Token);
    formData.append('user', Userkey);
    formData.append('message', scrapedData.tradeInfo);

    fetch(url, {
        method: 'POST',
        body: formData,
    })
        .catch(error => console.error('PUSHOVER ERROR:', error));
}

// Discord notification
var sendWebHookDiscord = (urlDiscordWebhook = Webhook, webhookType, scrapedData = {} ,embeds = []) => {
    const url = urlDiscordWebhook
    const templateWebhook = {
        "areYouReady": {
            "username": `DEPOSIT`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `Ready to deliver!`,
                    "description": `Send the item!
                    @`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.tradeInfo
                        }
                    ]
                }
            ]
        },
        "IncommingTrade": {
            "username": `WITHDRAWBOT`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `Item Withdrawn!`,
                    "description": `Accept the item!
                    @`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.tradeInfo
                        }
                    ],
                    "image": {
                        "url": ''
                    }
                }
            ]
        },
        "TradeCompleted": {
            "username": `TRADEBOT`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `TRADE COMPLETED`,
                    "description": `@`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.tradeInfo
                        }
                    ],
                    "image": {
                        "url": ''
                    }
                }
            ]
        },
        "TradeCooldown": {
            "username": `TRADEBOT`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `TRADE COOLDOWN`,
                    "description": `Cancell the steam offer!
                    @`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.tradeInfo
                        }
                    ],
                    "image": {
                        "url": ''
                    }
                }
            ]
        },
        "user_cancelled": {
            "username": `TRADEBOT`,
            "avatar_url": 'https://pbs.twimg.com/profile_images/1610084878720049154/n0j4nld9_400x400.png',
            "content": ``,
            "embeds": [
                {
                    "title": `WITHDRAW CANCELLED`,
                    "description": `@`,
                    "color": 0,
                    "fields": [
                        {
                            "name": "ITEM: ",
                            "value": scrapedData.tradeInfo
                        }
                    ],
                    "image": {
                        "url": ''
                    }
                }
            ]
        }
    }
    params = templateWebhook[webhookType]
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
        },
        body: JSON.stringify(params)
    })
}