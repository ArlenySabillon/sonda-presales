class ValidacionDeLicenciaServicio implements IValidacionDeLicenciaServicio {    
    validarLicencia(pUserId: String, pPinCode: String, callback: (respuesta: any) => void, callbackError: (resultado: any) => void) {
        // let request = {
        //     requestUri: "http://mobilitywebapi.centralus.cloudapp.azure.com:1025/SecurityAPI/odata/ValidateCredentials(loginId='" + pUserId + "',password='" + pPinCode + "',codeApp='SondaCore',deviceId='" + device.uuid + "')",
        //     method: "GET",
        //     headers: { Accept: "application/json", "Content-Type": "application/json" }
        // };
        // odatajs.oData.request(
        //     request,
        //     (data, response) => {
        //         callback(data);
        //     },
        //     (err) => {
        //         let error = JSON.parse(err.response.body).error;
        //         if (error == undefined) {
        //             error = err;
        //         }
        //         callbackError(error);
        //     }
        // );
        callback({CommunicationAddress: "http://mayoreo.mellega.com:8075"});
    }
}