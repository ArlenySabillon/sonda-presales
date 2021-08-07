var ValidacionDeLicenciaServicio = (function () {
    function ValidacionDeLicenciaServicio() {
    }
    ValidacionDeLicenciaServicio.prototype.validarLicencia = function (pUserId, pPinCode, callback, callbackError) {
        callback({ CommunicationAddress: "http://mayoreo.mellega.com:8075" });
    };
    return ValidacionDeLicenciaServicio;
}());
//# sourceMappingURL=ValidacionDeLicenciaServicio.js.map