var ImpresionManifiestoControlador = (function () {
    function ImpresionManifiestoControlador() {
        this.impresionManifiestoServicio = new ImpresionManifiestoServicio();
        this.isImpresoraZebra = (localStorage.getItem("isPrinterZebra") === "1");
    }
    ImpresionManifiestoControlador.prototype.delegarImpresionManifiestoConrolador = function () {
        var _this = this;
        var este = this;
        document.addEventListener("backbutton", function () {
            este.usuarioDeseaVolverAPaginaAnterior();
        }, true);
        $("#UiPagePrintManifest").on("pageshow", function () {
            _this.limpiarCampos();
            var btnImprimirManifiesto = $("#UiBtnImprimirManifiesto");
            btnImprimirManifiesto.addClass("ui-state-disabled");
            btnImprimirManifiesto = null;
        });
        $("#UiBtnBuscarManifiesto").on("click", function () {
            _this.buscarInformacionManifiesto();
        });
        $("#UiBtnLimpiarCamposImpresionManifiesto").on("click", function () {
            _this.limpiarCampos();
        });
        $("#UiBtnAtrasImpresionManifiesto").on("click", function () {
            _this.usuarioDeseaVolverAPaginaAnterior();
        });
        $("#UiBtnImprimirManifiesto").on("click", function () {
        });
    };
    ImpresionManifiestoControlador.prototype.delegarSockets = function (socketIo) {
        var _this = this;
        this.socketIo = socketIo;
        socketIo.on("ObtenerInformacionDeManifiesto", function (data) {
            switch (data.option) {
                case "informacionDeManifiestoNoEncontrada":
                    notify("No se ha encontrado información para el manifiesto proporcionado.\rPor favor, verifíque y vuelva a intentar.");
                    break;
                case "procesarInformacionDeManifiesto":
                    _this.procesarInformacionDeManifiesto(data.data);
                    break;
                case "fail":
                    notify(data.Message);
                    break;
            }
        });
    };
    ImpresionManifiestoControlador.prototype.limpiarCampos = function () {
        try {
            var txtOperadorEnBodega = $("#UiTxtNombreBodeguero");
            txtOperadorEnBodega.val("");
            txtOperadorEnBodega.focus();
            txtOperadorEnBodega = null;
        }
        catch (e) {
            notify("No se han podido limpiar los camos debido a: " + e.message);
        }
    };
    ImpresionManifiestoControlador.prototype.buscarInformacionManifiesto = function () {
        try {
            var txtManifiesto = $("#UiTxtNumeroDeManifiesto");
            var txtBodeguero = $("#UiTxtNombreBodeguero");
            if (txtManifiesto.val() === "") {
                notify("Por favor, proporcione un numero de manifiesto...");
                txtManifiesto.focus();
            }
            else if (txtBodeguero.val() === "") {
                notify("Por favor, proporcione el nombre del bodeguero...");
                txtBodeguero.focus();
            }
            else {
                this.impresionManifiestoServicio.enviarSolicitudDeInformacionDeManifiesto(parseInt(txtManifiesto.val()), function (resultado) {
                    notify(resultado.mensaje);
                });
            }
            txtManifiesto = null;
            txtBodeguero = null;
        }
        catch (e) {
            notify("No se ha podido buscar informacion del manifiesto debido a" + e.message);
        }
    };
    ImpresionManifiestoControlador.prototype.usuarioDeseaVolverAPaginaAnterior = function () {
        try {
            switch ($.mobile.activePage[0].id) {
                case "UiPagePrintManifest":
                    navigator.notification.confirm("Esta seguro de abandonar la Impresion Del Manifiesto? ", function (buttonIndex) {
                        if (buttonIndex === 2) {
                            $.mobile.changePage("#pageManifestHeader", {
                                transition: "flow",
                                reverse: true,
                                showLoadMsg: false
                            });
                        }
                    }, "Sonda\u00AE " + SondaVersion, ["No", "Si"]);
                    break;
            }
        }
        catch (e) {
            notify("Error al intentar cambiar a la pantalla anterior debido a:" + e.message);
        }
    };
    ImpresionManifiestoControlador.prototype.procesarInformacionDeManifiesto = function (data) {
        var _this = this;
        try {
            var operadorEnBodega_1 = $("#UiTxtNombreBodeguero").val();
            this.impresionManifiestoServicio.generarObjetoManifiesto(data, function (manifiesto) {
                _this.impresionManifiestoServicio.obtenerFormatoDeImpresionManifiesto(manifiesto, operadorEnBodega_1, function (formato) {
                    ToastThis("Imprimiendo manifiesto, por favor, espere...");
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    var printMacAddress = localStorage.getItem('PRINTER_ADDRESS');
                    var impresionServicio = new ImpresionServicio();
                    impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formato, true, function (resultado) {
                        my_dialog("", "", "close");
                        if (resultado.resultado === ResultadoOperacionTipo.Error) {
                            if (!_this.isImpresoraZebra) {
                                notify(resultado.mensaje);
                            }
                        }
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (e) {
            notify("No se ha podido procesar el detalle del manifiesto debido a: " + e.message);
        }
    };
    return ImpresionManifiestoControlador;
}());
//# sourceMappingURL=ImpresionManifiestoControlador.js.map