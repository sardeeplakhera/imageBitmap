var db,
    currentVersion = 1;
const createDB = () => {
    var request = window.indexedDB.open("db1", currentVersion);
    request.onerror = function (event) {
        console.log("createDb: DB open failed:", event.target.error);
    };
    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("createDb: DB open successful with version:", currentVersion);

        db.onversionchange = function (event) {
            // console.log('a database change has occurred');
        };
    };
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        db.createObjectStore("ImageStore", { keyPath: "id", autoIncrement:true });

    };
};

const closeDB = () => {
    console.log("close DB");
    db.close();
};
const storeImage = (url) => {
    url = url || '1.jpg';
    fetch(url)
    .then(response => response.blob())
    .then(blob => self.createImageBitmap(blob))
    .then(imageBitmap => {
        storeData(imageBitmap);
    });
};
const storeData = (imageBitmap) => {   

    var transaction = db.transaction(["ImageStore"], "readwrite");
    transaction.oncomplete = function (event) {
        console.log("transaction successful");
    };

    transaction.onerror = function (event) {
        console.log("transaction failed", event.target.error);
    };

    var objectStore = transaction.objectStore("ImageStore");
    var request = objectStore.put(imageBitmap);
    request.onerror = function (event) {
        console.error("js", event.result, ": entry couldn't be added " + event.target.error);
    };
    request.onsuccess = function (event) {
        // console.log('%c js: entry added successfully! ', 'background: #222; color: #bada55');
    };
};
var myWorker = new Worker("worker.js");
const postToWorker = (url) => {
    url = url || '1.jpg';
    fetch(url)
    .then(response => response.blob())
    .then(blob => self.createImageBitmap(blob))
    .then(imageBitmap => {
        myWorker.postMessage(imageBitmap);
    });
};