// Discord notification
var sendWebHookDiscord = (urlDiscordWebhook = webhook, webhookType, scrapedData = {} ,embeds = []) => {
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