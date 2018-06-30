const conversionBaseURL = 'https://free.currencyconverterapi.com/api/v5/convert';
const currenciesApiURL = 'https://free.currencyconverterapi.com/api/v5/currencies';

// Returns the list of currenciees in select list options.
function getCurrencyList(currencies) {
    let currencyList = '';
    for (let key in currencies) {
        currencyList += `<option value="${currencies[key].id}" data-symbol="${currencies[key].currencySymbol}">${currencies[key].currencyName} (${currencies[key].id})</option>
        `;
    }
    return currencyList;
}

// Return opened indexed DB and create store for conversion rates
function openDatabase() {
    if (!navigator.serviceWorker) {
        return Promise.resolve();
    }

    return idb.open('cc', 1, upgradeDb => upgradeDb.createObjectStore('conversion-rates'));
}

class CurrencyConverter {
    constructor(fromSelect, toSelect, amountInput, convertedInput, switchBtn, convertButton) {
        this.fromSelect = document.getElementById(fromSelect);
        this.toSelect = document.getElementById(toSelect);
        this.amountInput = document.getElementById(amountInput);
        this.convertedInput = document.getElementById(convertedInput);
        this.convertButton = document.getElementById(convertButton);
        this.switchBtn = document.getElementById(switchBtn)
        this.dbPromise = openDatabase();

        this.convertButton.addEventListener('click', () => this.convertCurrency());

        this.switchBtn.addEventListener('click', () => this.switchCurrencies());

        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if (!navigator.serviceWorker) return;
        navigator.serviceWorker.register('sw.js').then(reg => console.log(reg));
    }

    // Fetch list of currencies and populate the to and from select lists
    getCurrencies() {
        fetch(currenciesApiURL)
            .then(
                response => {
                    if (response.status !== 200) {
                        console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                        return;
                    }
                    response.json().then(data => {
                        // Get list of currencies sortd by their currency names
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
        // Returns currency symbol or currency id if symbol can't be found.
    getToSymbol() {
        const toOption = this.toSelect[this.toSelect.selectedIndex]
        return toOption.dataset.symbol !== 'undefined' ? toOption.dataset.symbol : toOption.value;
    }

    switchCurrencies() {
        const fromID = this.fromSelect.selectedIndex;
        const toID = this.toSelect.selectedIndex;
        this.fromSelect.selectedIndex = toID;
        this.toSelect.selectedIndex = fromID;
    }

    convertCurrency() {
            if (this.amountInput.value) {
                const fromID = this.getFrom();
                const toID = this.getTo();
                const symbol = this.getToSymbol();
                this.getConversionRate(fromID, toID).then(rate => {

                        const convertedAmount = document.getElementById('amount').value * (rate || 0);
                        document.getElementById('resultInput').value = convertedAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                        document.getElementById('currencySign').innerText = symbol;
                    })
                    .catch(function(err) {
                        console.log('Fetch Error :-S', err);
                    });
            }
        }
        // Returns conversion rate from api and updates rate in the indexed DB or try to get directly from indexed DB if fetch fails.
    getConversionRate(fromID, toID) {
        const apiURL = `${conversionBaseURL}?q=${fromID}_${toID},${toID}_${fromID}&compact=ultra`;
        const dbP = this.dbPromise;

        return fetch(apiURL).then(response => {
            if (response.status !== 200) {
                return Promise.reject(new Error(response.statusText));
            }
            return response.json().then(data => {

                const rate = data[`${fromID}_${toID}`]
                dbP.then(db => {
                    const tx = db.transaction('conversion-rates', 'readwrite');
                    const store = tx.objectStore('conversion-rates');
                    store.put(data[`${fromID}_${toID}`], `${fromID}_${toID}`);
                    store.put(data[`${toID}_${fromID}`], `${toID}_${fromID}`);
                });
                return rate;
            });
        }).catch(() => {
            return dbP.then(db => {
                if (!db) return;

                const tx = db.transaction('conversion-rates');
                const store = tx.objectStore('conversion-rates');
                return store.get(`${fromID}_${toID}`); // Get conversion rate from store
            });
        });
    }

}

// Initialise CurrencyConverter and call the getCurrency function to populate the to and from select lists.
const myConverter = new CurrencyConverter('fromCurrency', 'toCurrency', 'amount', 'resultInput', 'switchBtn', 'convertBtn');
myConverter.getCurrencies();