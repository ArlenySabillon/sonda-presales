var ValidacionDeLicenciaServicio = (function () {
    function ValidacionDeLicenciaServicio() {
    }
    ValidacionDeLicenciaServicio.prototype.validarLicencia = function (pUserId, pPinCode, callback, callbackError) {
        getConf((data) => {
            console.log(data)
            callback({CommunicationAddress: data.url});
        })
    };
    return ValidacionDeLicenciaServicio;
}());

function writeLog(str) {
	if(!logOb) return;
	var log = str + '                           ';
	console.log("going to log "+log);
	logOb.createWriter(function(fileWriter) {
		
		//fileWriter.seek(fileWriter.length);
		
		var blob = new Blob([log], {type:'text/plain'});
		fileWriter.write(blob);
		console.log("ok, in theory i worked");
	}, (err) => {
        console.log("FileSystem Error");
	    console.dir(err);
    });
}

function justForTesting() {
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
    logOb.file(function(file) {
		var reader = new FileReader();

		reader.onloadend = function(e) {
            if (this.result == '') {
                writeLog(`{"url": "20.190.236.87:8085"}`)
            }
			callback(JSON.parse(this.result));
		};

		reader.readAsText(file);
	}, (err) => {
        console.log("FileSystem Error");
	    console.dir(err);
    });
}

function writeConfig() {
    let url = prompt('direcion servidor')
    if (url != null) {
        writeLog(`{"url": "${url}"}`)
    }
}
//# sourceMappingURL=ValidacionDeLicenciaServicio.js.map