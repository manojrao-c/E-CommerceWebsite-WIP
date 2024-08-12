console.clear();

if(document.cookie.indexOf(',counter=')>=0)
{
    let counter = document.cookie.split(',')[1].split('=')[1]
    document.getElementById("badge").innerHTML = counter
}


let cartContainer = document.getElementById('cartContainer')

let boxContainerDiv = document.createElement('div')
boxContainerDiv.id = 'boxContainer'

// DYNAMIC CODE TO SHOW THE SELECTED ITEMS IN YOUR CART
function dynamicCartSection(ob,itemCounter)
{
    let boxDiv = document.createElement('div')
    boxDiv.id = 'box'
    boxContainerDiv.appendChild(boxDiv)

    let boxImg = document.createElement('img')
    boxImg.src = ob.preview
    boxDiv.appendChild(boxImg)

    let boxh3 = document.createElement('h3')
    let h3Text = document.createTextNode(ob.name + ' × ' + itemCounter)
    // let h3Text = document.createTextNode(ob.name)
    boxh3.appendChild(h3Text)
    boxDiv.appendChild(boxh3)

    let boxh4 = document.createElement('h4')
    let h4Text = document.createTextNode('Amount: Rs' + ob.price)
    boxh4.appendChild(h4Text)
    boxDiv.appendChild(boxh4)

    // console.log(boxContainerDiv);

    buttonLink.appendChild(buttonText)
    cartContainer.appendChild(boxContainerDiv)
    cartContainer.appendChild(totalContainerDiv)
    // let cartMain = document.createElement('div')
    // cartmain.id = 'cartMainContainer'
    // cartMain.appendChild(totalContainerDiv)

    return cartContainer
}

let totalContainerDiv = document.createElement('div')
totalContainerDiv.id = 'totalContainer'

let totalDiv = document.createElement('div')
totalDiv.id = 'total'
totalContainerDiv.appendChild(totalDiv)

let totalh2 = document.createElement('h2')
let h2Text = document.createTextNode('Total Amount')
totalh2.appendChild(h2Text)
totalDiv.appendChild(totalh2)

// TO UPDATE THE TOTAL AMOUNT
function amountUpdate(amount)
{
    let totalh4 = document.createElement('h4')
    // let totalh4Text = document.createTextNode(amount)
    let totalh4Text = document.createTextNode('Amount: Rs ' + amount)
    totalh4Text.id = 'toth4'
    totalh4.appendChild(totalh4Text)
    totalDiv.appendChild(totalh4)
    totalDiv.appendChild(buttonDiv)
    console.log(totalh4);
}


let buttonDiv = document.createElement('div')
buttonDiv.id = 'button'
totalDiv.appendChild(buttonDiv)

let buttonTag = document.createElement('button')
buttonDiv.appendChild(buttonTag)

let buttonLink = document.createElement('a')
buttonLink.href = '/orderPlaced.html?'
buttonTag.appendChild(buttonLink)

buttonText = document.createTextNode('Place Order')
buttonTag.onclick = function()
{
    let orderDetails = {
        items: [], // Array to store item details
        totalAmount: totalAmount // This variable should already exist in your code
    };

    // Collect item details from the cart
    let itemDivs = document.querySelectorAll('#boxContainer > div');
    itemDivs.forEach(div => {
        let itemName = div.querySelector('h3').innerText.split(' × ')[0]; // Extract item name
        let itemPrice = div.querySelector('h4').innerText.replace('Amount: Rs', '').trim(); // Extract item price

        orderDetails.items.push({
            name: itemName,
            price: itemPrice
        });
    });

    // Convert the order details to JSON and then to base64
    let orderMessage = btoa(JSON.stringify(orderDetails.items));

    // Azure Queue Storage URL with SAS token
    let queueUrl = "https://orderprocessor.queue.core.windows.net/cskorder/messages?sv=2022-11-02&ss=q&srt=sco&sp=rwdlacup&se=2024-08-14T09:29:10Z&st=2024-08-12T01:29:10Z&spr=https,http&sig=FcvDr4e3yN6bQaN%2FKHUtFKIbrKv2pdjVfcXasKBUATg%3D";

    // Sending the order details to Azure Queue Storage
    fetch(queueUrl, {
        method: 'POST',
        headers: {
            'x-ms-version': '2018-03-28',
            'Content-Type': 'application/xml',
        },
        body: `<QueueMessage><MessageText>${orderMessage}</MessageText></QueueMessage>`
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/orderPlaced.html';
        } else {
            console.error('Failed to send message to Azure Queue Storage');
            alert('There was an error placing your order.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    console.log("clicked")
}  
//dynamicCartSection()
// console.log(dynamicCartSection());

// BACKEND CALL
let httpRequest = new XMLHttpRequest()
let totalAmount = 0
httpRequest.onreadystatechange = function()
{
    if(this.readyState === 4)
    {
        if(this.status == 200)
        {
            // console.log('call successful');
            contentTitle = JSON.parse(this.responseText)

            let counter = Number(document.cookie.split(',')[1].split('=')[1])
            document.getElementById("totalItem").innerHTML = ('Total Items: ' + counter)

            let item = document.cookie.split(',')[0].split('=')[1].split(" ")
            console.log(counter)
            console.log(item)

            let i;
            let totalAmount = 0
            for(i=0; i<counter; i++)
            {
                let itemCounter = 1
                for(let j = i+1; j<counter; j++)
                {   
                    if(Number(item[j]) == Number(item[i]))
                    {
                        itemCounter +=1;
                    }
                }
                totalAmount += Number(contentTitle[item[i]-1].price) * itemCounter
                dynamicCartSection(contentTitle[item[i]-1],itemCounter)
                i += (itemCounter-1)
            }
            amountUpdate(totalAmount)
        }
    }
        else
        {
            console.log('call failed!');
        }
}

httpRequest.open('GET', 'https://5d76bf96515d1a0014085cf9.mockapi.io/product', true)
httpRequest.send()




