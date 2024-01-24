let getUserIDcounter = 0

// We get the roll UserID via this request and count up the
// total inventory coins value (balance + inv)
async function getUserID() {
    getUserIDcounter += 1

    fetch(domainUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "operationName": "CurrentUser",
            "variables": {},
            "query": "query CurrentUser {\n  currentUser {\n    ...User\n    __typename\n" +
                "  }\n}\n\nfragment User on User {\n  id\n  name\n  email\n  verified\n  cu" +
                "rrency\n  createdAt\n  acceptTos\n  avatar\n  steamId\n  mutedUntil\n  role" +
                "s\n  userProgress {\n    id\n    xp\n    requiredXp\n    nextRequiredXp\n    le" +
                "vel\n    __typename\n  }\n  unlockedChat\n  lastDepositAt\n  stickyReferee\n  stea" +
                "mApiKey\n  steamTradeUrl\n  verificationStatus\n  totalDeposit\n  dailyWithdrawLimit" +
                "\n  preferences {\n    ...UserPreferences\n    __typename\n  }\n  referralPromoCode {\n   " +
                " id\n    code\n    __typename\n  }\n  team {\n    id\n    name\n    __typename\n  }\n  tick" +
                "ets {\n    total\n    __typename\n  }\n  wallets {\n    ...Wallet\n    __typename\n  }\n  marke" +
                "t {\n    id\n    slug\n    name\n    __typename\n  }\n  trader\n  suspectedTrader\n  microphoneEna" +
                "bled\n  __typename\n}\n\nfragment UserPreferences on UserPreferences {\n  id\n  name\n  lastName\n " +
                " address1\n  address2\n  postcode\n  region\n  city\n  country {\n    code\n    name\n    __typenam" +
                "e\n  }\n  birthDate\n  gender\n  phone\n  __typename\n}\n\nfragment Wallet on Wallet {\n  id\n  name\n" +
                "  amount\n  currency\n  __typename\n}\n" }),
        credentials: 'include'
    })
        .then(res => res.json())
        .then(res => {
            userID = res.data.currentUser.id;
            balance = res.data.currentUser.wallets[0].amount

            if (getUserIDcounter === 1) {
                coinsCounter += balance
                document.getElementsByClassName('counterCoinButton')[0].innerHTML = Math.round(coinsCounter)
            }
        })
}