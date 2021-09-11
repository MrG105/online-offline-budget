let db;

const request = indexedDB.open('budgetDB', 1);



request.onupgradeneeded = function (event) {
    db = event.target.results;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('budgetStore', { autoIncrement: true });
    }

};



request.onerror = function (event) {
    console.log(`Error: ${event.target.errorCode}`);
};



function checkDatabase() {
    let transaction = db.transation(['budgetStore'], 'readwrite');

    const store = transaction.objectStore('budgetStore');

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                }
            }).then((response) => response.json())
            .then((res) => {
                if(res.length !== 0) {
                    transaction = db.transaction(['budgetStore'], 'readwrite');

                    const currentStore = transaction.objectStore('budgetStore');

                    currentStore.clear();
                    console.log('Current Store Cleared')
                }
            })
        }
    }
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};


const saveRecord = (record => {
    const transaction = db.transaction(['budgetStore'], 'readwrite');
    const store = transaction.objectStore('budgetStore');
    store.add(record);
});

window.addEventListener('online', checkDatabase);