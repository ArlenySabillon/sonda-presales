var ValidacionDeLicenciaServicio = (function() {
    function ValidacionDeLicenciaServicio() {}
    ValidacionDeLicenciaServicio.prototype.validarLicencia = function(pUserId, pPinCode, callback, callbackError) {
        getConf((data) => {
            console.log(data)
            callback({ CommunicationAddress: data.url });
        })
    };
    return ValidacionDeLicenciaServicio;
}());

function writeLog(str) {
    if (!logOb) return;
    var log = str + '                           ';
    console.log("going to log " + log);
    logOb.createWriter(function(fileWriter) {

        //fileWriter.seek(fileWriter.length);

        var blob = new Blob([log], { type: 'text/plain' });
        fileWriter.write(blob);
        console.log("ok, in theory i worked");
    }, (err) => {
        console.log("FileSystem Error");
        console.dir(err);
    });
}

function justForTesting() {
    if (!logOb) return;
    logOb.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
            console.log(this.result);
        };

        reader.readAsText(file);
    }, (err) => {
        console.log("FileSystem Error");
        console.dir(err);
    });
}

function getConf(callback) {
    setTimeout(() => {
        logOb.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
                // if (this.result == '') {
                writeLog(`{"url": "http://190.106.217.22:8595/`)
                callback({ "url": "http://190.106.217.22:8595/" });
                // } else {
                //     callback(JSON.parse(this.result));
                // }
            };

            reader.readAsText(file);
        }, (err) => {
            console.log("FileSystem Error");
            console.dir(err);
        });
    }, 1000);
}

function writeConfig() {
    let url = prompt('direcion servidor')
    if (url != null) {
        writeLog(`{"url": "${url}"}`)
    }
}
//# sourceMappingURL=ValidacionDeLicenciaServicio.js.map