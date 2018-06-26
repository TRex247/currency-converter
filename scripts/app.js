const conversionBaseURL = 'https://free.currencyconverterapi.com/api/v5/convert';
const currenciesURL = 'https://free.currencyconverterapi.com/api/v5/currencies';

function getCurrencyList(currencies) {
    let currencyList = '';
    for (let key in currencies) {
        currencyList += `<option value="${currencies[key].id}" data-symbol="${currencies[key].currencySymbol}">${currencies[key].currencyName} (${currencies[key].id})</option>
        `;
    }
    return currencyList;
}

class CurrencyConverter {
    constructor(fromSelect, toSelect, amountInput, convertedInput, convertButton) {
        this.fromSelect = document.getElementById(fromSelect);
        this.toSelect = document.getElementById(toSelect);
        this.amountInput = document.getElementById(amountInput);
        this.convertedInput = document.getElementById(convertedInput);
        this.convertButton = document.getElementById(convertButton);

        this.convertButton.addEventListener('click', () => {
            this.convertCurrency();
        });
    }

    getCurrencies() {
        fetch(currenciesURL)
            .then(
                response => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(data => {
                        const dataValues = Object.values(data.results).sort((a, b) => {
                            var nameA = a.currencyName.toUpperCase(); // ignore upper and lowercase
                            var nameB = b.currencyName.toUpperCase(); // ignore upper and lowercase
                            if (nameA < nameB) {
                                return -1;
                            }
                            if (nameA > nameB) {
                                return 1;
                            }

                            // names must be equal
                            return 0;
                        });
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

    getFrom() {
        return this.fromSelect[this.fromSelect.selectedIndex].value;
    }

    getTo() {
        return this.toSelect[this.toSelect.selectedIndex].value;
    }

    convertCurrency() {
        if (this.amountInput.value) {
            const fromID = this.getFrom();
            const toID = this.getTo();
            const apiURL = `${conversionBaseURL}?q=${fromID}_${toID}&compact=ultra`;
            fetch(apiURL)
                .then(
                    function(response) {
                        if (response.status !== 200) {
                            console.log('Looks like there was a problem. Status Code: ' +
                                response.status);
                            return;
                        }

                        response.json().then(data => {
                            const rate = data[`${fromID}_${toID}`]
                            console.log(data);
                            const convertedAmount = document.getElementById('amount').value * rate;
                            document.getElementById('resultInput').value = convertedAmount.toFixed(2);
                        });
                    }
                )
                .catch(function(err) {
                    console.log('Fetch Error :-S', err);
                });
        }
    }
}


const myConverter = new CurrencyConverter('fromCurrency', 'toCurrency', 'amount', 'resultInput', 'convertBtn');
myConverter.getCurrencies();