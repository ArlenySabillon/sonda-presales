var ValidacionDeLicenciaServicio = (function() {
    function ValidacionDeLicenciaServicio() {}
    ValidacionDeLicenciaServicio.prototype.validarLicencia = function(pUserId, pPinCode, callback, callbackError) {
        /*var request = {
            requestUri: "http://mobilitywebapi.centralus.cloudapp.azure.com:1025/SecurityAPI/odata/ValidateCredentials(loginId='" + pUserId + "',password='" + pPinCode + "',codeApp='SondaCore',deviceId='" + device.uuid + "')",
            method: "GET",
            headers: { Accept: "application/json", "Content-Type": "application/json" }
        };
        odatajs.oData.request(request, function (data, response) {
            callback(data);
        }, function (err) {
            var error = JSON.parse(err.response.body).error;
            if (error == undefined) {
                error = err;
            }
            callbackError(error);
        });*/
        callback({ CommunicationAddress: 'http://190.4.59.46:9095' });
    };
    return ValidacionDeLicenciaServicio;
}());
//# sourceMappingURL=ValidacionDeLicenciaServicio.js.map