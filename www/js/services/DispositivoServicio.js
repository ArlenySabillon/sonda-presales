function DelegadoDispositivo() {
    //Validación de Numeros Enteros
    $(".validarEnteros").on("keypress keyup blur", function(event) {
        $(this).val($(this).val().replace(/[^\d].+/, ""));
        if (((event.which < 48 || event.which > 57))) {
            event.preventDefault();
        }

        var e = event || window.event;
        var key = e.keyCode || e.which;

        if (key === 110 || key === 190 || key === 188) {

            e.preventDefault();
        }
    });
}

function ObtenerPosicionGPS(callback) {
    my_dialog("Espere...", "Obteniendo ubicacion", "open");
    navigator.geolocation.getCurrentPosition(
        function(position) {
            gCurrentGPS = position.coords.latitude + "," + position.coords.longitude;
            my_dialog("", "", "close");
            $(".gpsclass").text(position.coords.latitude + "," + position.coords.longitude);
            callback();
        },
        function() {
            /*my_dialog("", "", "close");
            navigator.notification.confirm("No se pudo obtener el GPS desea reintentarlo",
          function (respuesta) {
              if (respuesta === 2) {
                  ObtenerPosicionGPS(function () {
                      callback();
                  });
              }
          }, "Sonda® " + SondaVersion,
          "No,Si");*/
            gCurrentGPS = "0,0";
            my_dialog("", "", "close");
            callback();
        }, { maximumAge: 30000, timeout: 15000, enableHighAccuracy: true }
    );
}

function OcultarTeclado() {
    var field = document.createElement('input');
    field.setAttribute('type', 'text');
    document.body.appendChild(field);

    setTimeout(function() {
        field.focus();
        setTimeout(function() {
            field.setAttribute('style', 'display:none;');
        }, 50);
    }, 50);
}

function ImprimirDocumento(documento, callback, errCallback) {
    bluetoothSerial.write(documento, function() {
        callback();
    }, function() {
        errCallback({
            code: -1,
            message: "Imposible Imprimir"
        });
    });
}

function EstaGpsDesavilitado(callback) {

    cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled) {
        if (enabled) {
            callback();
        } else {
            cordova.plugins.diagnostic.switchToLocationSettings();
        }
    }, function(error) {
        notify(error);
    });


}

function TomarFoto(callback, errCallback) {

    navigator.camera.getPicture(function(imageUri) {
        callback(imageUri);
    }, function(message) {
        errCallback(message);
    }, {
        quality: 90,
        targetWidth: 350,
        targetHeight: 350,
        saveToPhotoAlbum: false,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        destinationType: Camera.DestinationType.DATA_URL

    });
}

function ListPicker(options, callback, cancelledCallback) {
    window.plugins.listpicker.showPicker(options, callback, cancelledCallback);

}

function DarFormatoAlMonto(monto) {
    return localStorage.getItem("DISPLAY_SYMBOL_CURRENCY") + monto;
}

function LeerCodigoBarraConCamara(callback) {
    cordova.plugins.barcodeScanner.scan(
        function(result) {
            if (result.text.length > 0) {
                callback(result.text);
            } else {
                alert("No se ha podido escanear");
                callback("");
            }
        },
        function(error) {
            alert("No se ha podido escanear debido a: " + error);
            callback("");
        }
    );
}

function RegresarAPaginaAnterior(paginaAnterior) {
    if (paginaAnterior == "pickupplan_page") {
        window.vistaCargandosePorPrimeraVez = false;
        cargarListaDeTareas();
        DesBloquearPantalla();
    }

    $.mobile.changePage("#" + paginaAnterior, {
        transition: "flow",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
    });
}

function Imprimir(document) {

     
    document = "! 0 50 50 1100 1\r\n";
    document += "! U1 LMARGIN 10\r\n";
    document += "! U\r\n";
    document += "! U1 PAGE-WIDTH 1400\r\n";
    document += "ON-FEED IGNORE\r\n";
    document += "CENTER 550 T 1 2 0 10 Ferco Guatemala\r\n";
    document += "L 5 50 570 50 1\r\n";
    document += "CENTER 550 T 1 2 0 60 TDA LIZ\r\n";
    document += "CENTER 550 T 0 2 0 100 \r\n";
    document += "CENTER 550 T 0 3 0 130 Orden de Venta Serie SGERENT\r\n";
    document += "CENTER 550 T 0 3 0 160 No.61\r\n";
    document += "CENTER 550 T 0 3 0 190 ***** REIMPRESION ***** \r\n";
    document += "LEFT 5 T 0 2 0 220 100020- BATERIAS AAA 2PACK\r\n";
    document += "LEFT 5 T 0 2 0 250 CANTIDAD: 5 / UM: Manual/ PREC.UNIT. : Q5.00\r\n";
    document += "RIGHT 550 T 0 2 0 250 Q25.00\r\n";
    document += "L 5 280 570 280 1\r\n";
    document += "LEFT 5 T 0 2 0 290 100002- DU CB AL AA 1SB X 120CS 12SW HLLY\r\n";
    document += "LEFT 5 T 0 2 0 320 CANTIDAD: 5 / UM: Manual/ PREC.UNIT. : Q10.00\r\n";
    document += "RIGHT 550 T 0 2 0 320 Q50.00\r\n";
    document += "L 5 350 570 350 1\r\n";
    document += "LEFT 5 T 0 2 0 360 100003- DU CB AL AA 2BCd 48CS HLLY\r\n";
    document += "LEFT 5 T 0 2 0 390 CANTIDAD: 3 / UM: Manual/ PREC.UNIT. : Q10.00\r\n";
    document += "RIGHT 550 T 0 2 0 390 Q30.00\r\n";
    document += "L 5 420 570 420 1\r\n";
    document += "LEFT 5 T 0 2 0 430 100018- QUANTUM AAA 4BC 40CS BP6\r\n";
    document += "LEFT 5 T 0 2 0 460 CANTIDAD: 5 / UM: Manual/ PREC.UNIT. : Q10.00\r\n";
    document += "RIGHT 550 T 0 2 0 460 Q50.00\r\n";
    document += "L 5 490 570 490 1\r\n";
    document += "LEFT 5 T 0 2 0 500 100004- DU CB AL AA 2SPk X60CS HLLY\r\n";
    document += "LEFT 5 T 0 2 0 530 CANTIDAD: 3 / UM: Manual/ PREC.UNIT. : Q10.00\r\n";
    document += "RIGHT 550 T 0 2 0 530 Q30.00\r\n";
    document += "L 5 560 570 560 1\r\n";
    document += "LEFT 5 T 0 2 0 600 SUBTOTAL: \r\n";
    document += "RIGHT 550 T 0 2 0 600 Q185.00\r\n";
    document += "LEFT 5 T 0 2 0 630 DESCUENTO: \r\n";
    document += "RIGHT 550 T 0 2 0 630 Q0\r\n";
    document += "LEFT 5 T 0 2 0 660 TOTAL:(Q185.00 Descuento: 0%)\r\n";
    document += "RIGHT 550 T 0 2 0 660 Q0\r\n";
    document += "CENTER 550 T 0 2 0 690 2017/03/09 11:53:53 / RUTA 4 \r\n";
    document += "L 5 120 570 120 1\r\n";
    document += "PRINT\r\n";

    var macAddress = '';
    macAddress = localStorage.getItem("PRINTER_ADDRESS");
    macAddress = macAddress.split(":").join("");

    cordova.plugins.LinkOsPlugin.connect(macAddress).then(            function(res) {                
        console.log(res);                
        cordova.plugins.LinkOsPlugin.getStatus(macAddress, true).then(                    function(result) {                        
            if (result.isReadyToPrint) {                            
                cordova.plugins.LinkOsPlugin.printCPCL(document).then(                                function(res) {                                    
                    console.log(res);                                    
                    cordova.plugins.LinkOsPlugin.disconnect();                                
                }, function(reason) {                                    
                    console.log('get printer status failed ', reason);                                    
                    cordova.plugins.LinkOsPlugin.disconnect();                                    
                    ToastThis('get printer status failed ' + reason);                                
                });                        
            } else {
                cordova.plugins.LinkOsPlugin.disconnect();                            
                ToastThis("The printer is  not ready " + result.message);                            
                console.log(result);                        
            }                    
        }, function(reason) {                        
            console.log('get printer status failed ', reason);                        
            cordova.plugins.LinkOsPlugin.disconnect();                        
            ToastThis('get printer status failed ' + reason);                    
        });

                    
    }, function(reason) {                
        console.log('No connect ', reason);                
        cordova.plugins.LinkOsPlugin.disconnect();                
        ToastThis("No Connect " + reason);            
    });
}