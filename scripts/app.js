const conversionBaseURL = 'https://free.currencyconverterapi.com/api/v5/convert';
const currenciesURL = 'https://free.currencyconverterapi.com/api/v5/currencies';

function getCurrencyList(currencies) {
    let currencyList = '';
    for (let key in currencies) {
        currencyList += `<option value="${currencies[key].id}" data-symbol="${currencies[key].currencySymbol}">${currencies[key].currencyName}</option>
        `;
    }
    return currencyList;
}

class CurrencyConverter {
    constructor(fromSelect, toSelect, amountInput, convertedInput) {
        this.fromSelect = document.getElementById(fromSelect);
        this.toSelect = document.getElementById(toSelect);
        this.amountInput = document.getElementById(amountInput);
        this.convertedInput = document.getElementById(convertedInput);
    }

    getCurrencies() {
        fetch('https://free.currencyconverterapi.com/api/v5/currencies')
            .then(
                response => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(data => {
                        const dataValues = Object.values(data.results);
                        console.log(data.results);
                        console.log(dataValues);
                        this.fromSelect.innerHTML = this.populateSelectList(dataValues);
                        this.toSelect.innerHTML = this.populateSelectList(dataValues);
                    });
                }
            )
            .catch(err => {
                console.log('Fetch Error :-S', err);
            });
    }

    populateSelectList(currencies) {
        return `<option selected>Choose...</option>
                ${getCurrencyList(currencies)}`;
    }

    populateSelectLists() {
        const currencyData = this.getCurrencies();
        this.fromSelect.innerHTML = this.populateSelectList(currencyData);
        this.toSelect.innerHTML = this.populateSelectList(currencyData);
    }

    getFromCurrency() {

    }

    getToCurrency() {

    }
}


const myConverter = new CurrencyConverter('fromCurrency', 'toCurrency', 'amount', 'resultInput');
myConverter.getCurrencies();