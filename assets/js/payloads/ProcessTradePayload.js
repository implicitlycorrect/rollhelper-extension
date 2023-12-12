const acceptTrade = (tradeid) => {
    socket.send(JSON.stringify(ProcessTradePayload = {
        "id": uuidv4(),
        "type": "subscribe",
        "payload": {
            "variables": {
                "input": {
                    "tradeId": tradeid
                }
            },
            "extensions": {},
            "operationName": "ProcessTrade",
            "query": "mutation ProcessTrade($input: ProcessTradeInput!) " +
                "{\n  processTrade(input: $input) {\n    trade {\n     " +
                " id\n      status\n      totalValue\n      updatedAt\n    " +
                "  expiresAt\n      withdrawerSteamTradeUrl\n      __typename\n    }\n    __typename\n  }\n}\n"
        }
    }))
}