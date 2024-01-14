// const initInjectUsdPrice = () => {
//     const depoItems = document.getElementsByTagName('cw-deposit-listed')
//     for (const node of depoItems) {
//         injectUsdPrice(node)
//     }
// }

// const look4InjectUsdPrice = setInterval(()=>{
//     const depoScrollable = document.getElementsByClassName('trade-list')[0]
//      if (depoScrollable) {
//          clearInterval(look4InjectUsdPrice)
//          setTimeout(()=>{
//              initInjectUsdPrice()
//          },900)
//      }
// },50)

const look4rates = setInterval(()=>{
    if (Object.keys(rates).length > 0 && Object.keys(prices).length > 0) {
        clearInterval(look4rates)
        addForm();
    }
},50)

async function addForm() {
    const observer = new MutationObserver(function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {

                    if (node instanceof HTMLElement && node.localName == 'cw-csgo-market-item-card'
                        && !node.firstChild.classList.contains('horizontal')) {
                        setBuffValue(node);
                    }

                    // if (node instanceof HTMLElement && node.localName == 'cw-deposit-listed') {
                    //     injectUsdPrice(node);
                    // }
                }
            }
        }
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
}

const injectUsdPrice = async (node) => {
    let header = node.querySelector('header')
    try{
        node.querySelector('header > div').remove()
    }catch(e){
    }

    let coinsPrice = node.querySelector("div > cw-csgo-market-item-card > div > div > div.d-flex.flex-column.justify-content-between.flex-1.details-col.ng-star-inserted > div.d-flex.justify-content-between.align-items-center.position-relative.ng-star-inserted > cw-pretty-balance > span").innerText.replace(',','')

    let usdValue = Number(coinsPrice * 0.66).toFixed(2)
    let conversionDiv = document.createElement('div')
    let usdDiv = document.createElement('div')
    let rmbDiv = document.createElement('div')
    let empireDiv = document.createElement('div')

    usdDiv.innerText = `${usdValue}$`
    rmbDiv.innerText = `${(usdValue*7.29).toFixed(2)}¥`
    empireDiv.innerText = `${(usdValue*0.625).toFixed(2)} ec`

    conversionDiv.style.display = 'flex'
    conversionDiv.style.justifyContent = 'space-around'
    conversionDiv.style.alignItems = 'center'
    conversionDiv.style.fontWeight = "bold";

    usdDiv.style.color = '#63bf08'
    rmbDiv.style.color = '#f5f5f5'
    empireDiv.style.color = '#E9B10E'

    node.appendChild(conversionDiv)
    conversionDiv.appendChild(usdDiv)
    conversionDiv.appendChild(rmbDiv)
    conversionDiv.appendChild(empireDiv)
    header.style.justifyContent = 'center'
}

function drawCustomForm(calcRes, calc, rate, item) {

    let span = document.createElement('span')
    let r = "🔴 +" + calc + " %"
    let c = "🔵 " + calc + " %"
    let o = "🟢 " + calc + " %"

    if (calcRes == 'Overpriced')  span.innerText = r;
    if (calcRes == 'Underpriced') span.innerText = c;
    if (calcRes == 'Goodpriced')  span.innerText = o;

    divInner.appendChild(span)
    return divInner;
}

function setBuffValue(item) {
    var itemInfo = {};
    let itemName = '';
    let isSticker = false;
    let isStickered = false;

    //  WEAPON TYPE ===============================================================
    let stickeredItem = item.querySelector("div:nth-child(1) > div:nth-child(1) > div:nth-child(5) > span:nth-child(2)");
    let normalItem = item.querySelector("div:nth-child(1) > div:nth-child(1) > div:nth-child(4) > span:nth-child(2)");

    if (item.querySelector("div:nth-child(1) > div:nth-child(1) > div:nth-child(4) > span:nth-child(2)")){
        itemInfo.skinWeapon = item.querySelector("div:nth-child(1) > div:nth-child(1) > div:nth-child(4) > span:nth-child(2)").innerHTML.trim();
        //is non stickered
        if(itemInfo.skinWeapon === 'Sticker'){
            isSticker = true;
            itemName += 'Sticker | ';
        }else{
            itemName += itemInfo.skinWeapon;
        }
    }else{
        //is stickered
        itemInfo.skinWeapon = item.querySelector("div:nth-child(1) > div:nth-child(1) > div:nth-child(5) > span:nth-child(2)").innerHTML.trim();
        itemName +=  itemInfo.skinWeapon;
        isStickered = true;
    }

    // SKIN NAME  ===============================================================
    if (item.querySelector("div:nth-child(1) > div:nth-child(1) > label")) {
        if (isSticker){
            let skin = item.querySelector("div:nth-child(1) > div:nth-child(1) > label").innerHTML.trim()
            itemName += skin;
        }

        else{
            let skin = item.querySelector("div:nth-child(1) > div:nth-child(1) > label").innerHTML.trim()
            let nameArr = skin.split(' ')
            let f = nameArr[0]
            let s = nameArr[1]


            // if doppler has a phase
            if (f == 'Doppler'){
                itemInfo.skinName = 'Doppler'
                itemName += " | " + 'Doppler'
                var phase = s + ' ' + nameArr[2]
            }

            // if doppler is a gem
            else if ((nameArr.length === 1) && (f == 'Ruby' || f == 'Sapphire')){
                itemInfo.skinName = f
                itemName += " | " + 'Doppler'
                var phase = f
            }

            //FIX for Black Pearls
            //if doppler is a Black Pearl
            else if (f == 'Black' && s == 'Pearl'){
                itemInfo.skinName = 'Black Pearl'
                itemName += " | " + 'Doppler'
                var phase = 'Black Pearl'
            }

            // if doppler is a gamma doppler
            else if (f == 'Gamma' && s == 'Doppler'){
                itemInfo.skinName = f + ' ' + s
                itemName += " | " + 'Gamma Doppler'
                var phase = nameArr[2] + ' ' + nameArr[3]
            }

            // if gamma doppler is a gem -> emerald
            else if ((nameArr.length === 1) && (f == 'Emerald') && isKnife(itemName)){
                itemInfo.skinName = f
                itemName += " | " + 'Gamma Doppler'
                var phase = 'Emerald'
            }

            else if (itemInfo.skinWeapon.includes('Case') ||
                itemInfo.skinWeapon.includes('Pin')){
                // continue
            }

            else if (!skin) {
                // continue
            }

            else{
                itemInfo.skinName = skin
                itemName += " | " + skin
            }
        }
    }

    // SKIN EXTERIOR   ===============================================================
    let exterior
    let ext = item.querySelector("div:nth-child(1) > div:nth-child(1) >" +
        " div:nth-child(1) > span:nth-child(2)").innerHTML.trim().split(" ")[0]

    if (isSticker){
        itemInfo.skinExterior = ' ('+ ext + ')'
        let nameArr = itemName.split(' ')
        let f = 0
        for (let i= 0; i < nameArr.length; i++){
            if (nameArr[i] === '|'){
                f++;
                if(f === 2){
                    nameArr[i-1] += itemInfo.skinExterior;
                    break;
                }
            }
        }
        itemName = nameArr.join(' ')
    }else{
        if (ext === 'FN'){
            itemInfo.skinExterior = exterior;
            itemName += " (Factory New)" ;
        }
        if (ext === 'MW') {
            itemInfo.skinExterior = exterior;
            itemName += " (Minimal Wear)" ;
        }
        if (ext === 'FT') {
            itemInfo.skinExterior = exterior;
            itemName += " (Field-Tested)" ;
        }
        if (ext === 'WW'){
            itemInfo.skinExterior = exterior;
            itemName += " (Well-Worn)" ;
        }
        if (ext === 'BS'){
            itemInfo.skinExterior = exterior;
            itemName += " (Battle-Scarred)" ;
        }
        if(ext === '\x3C!---->-'){
            itemInfo.skinExterior = '';
            itemName += "";
        }
    }

    let rollPrice
    if (!isStickered) {
        rollPrice = Math.floor(item.querySelector("div:nth-child(1) > div:nth-child(1) > " +
            "div:nth-child(6) > cw-pretty-balance > span").innerText.replace(',','') * 100 ) / 100;
    }else{
        rollPrice = Math.floor(item.querySelector("div:nth-child(1) > div:nth-child(1) > " +
            "div:nth-child(7) > cw-pretty-balance > span").innerText.replace(',','') * 100 ) / 100;
    }

    let rate
    if (itemName.includes('Doppler') | itemName.includes('Sapphire') | itemName.includes('Ruby')) {
        rate = 0.65;
    }else{
        rate = rates[itemName]
        if (rate === undefined) {
            rate = 0.66;
        }else{
            rate = rates[itemName].rate
        }
    }

    switch (provider){
        case 'pricempire':
            if (phase !== undefined) itemName = itemName + ' - ' + phase;
            price_obj = prices[itemName]
            if (price_obj === undefined) return;
            if (price_obj?.buff?.price) {
                buff_usd = price_obj.buff.price/100
            }
            break;

        case 'csgotrader':
            if (phase !== undefined){
                price_obj = prices[itemName]
                if (price_obj === undefined) return;
                buff_usd = price_obj.buff163.starting_at.doppler[phase]
            }else{
                price_obj = prices[itemName]
                if (price_obj === undefined) return;
                buff_usd = price_obj.buff163.starting_at.price
            }
            break;
    }


    let tbuffVal = buff_usd / rate;
    let buffVal = Math.floor(tbuffVal * 100) / 100
    let calc =  Math.floor(rollPrice/buffVal*100) - 100

    let parent_el = item.querySelector('div > div:nth-child(7)')
    if (!parent_el) {
        parent_el = item.querySelector('div > div:nth-child(6)')
    }

    divInner = document.createElement('div')
    divInner.style.display = 'flex'
    divInner.style.flexDirection= 'column'
    divInner.style.justifyContent= 'center'
    divInner.style.alignItems= 'center'
    let parentElSpans = parent_el.getElementsByTagName('span')

    if (parentElSpans.length > 1 ) {
        let delSpan = parentElSpans[1]
        delSpan.style.alignSelf = 'flex-end'
        delSpan.remove()
        divInner.appendChild(delSpan)
    }

    let res = evalDisplay(rollPrice, buffVal)
    parent_el.appendChild(divInner)

    parent_el.appendChild(drawCustomForm(res, calc, rate, item))
}

function evalDisplay(rollPrice, buffPrice){
    let v = rollPrice / buffPrice;
    let val = Math.floor(v * 100) / 100;
    if (val > 1.03) return "Overpriced";
    if (val <= 1.03 && val >= 0.97) return "Goodpriced";
    if (val < 0.97) return "Underpriced";
}