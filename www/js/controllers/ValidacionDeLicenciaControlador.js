var ValidacionDeLicenciaControlador = (function () {
    function ValidacionDeLicenciaControlador(mensajero) {
        this.mensajero = mensajero;
        this.validacionDeLicenciaServicio = new ValidacionDeLicenciaServicio();
        this.fromDisconet = false;
        localStorage.setItem("isPrinterZebra", "0");
    }
    ValidacionDeLicenciaControlador.prototype.delegarValidacionDeLicenciaControlador = function () {
        var _this = this;
        $("#btnLogme").bind("touchstart", function () {
            _this.validateCredentials();
        });
        $("#txtPin").keyup(function (event) {
            if (event.keyCode === 13) {
                _this.validateCredentials();
                _this.limpiarInicioDeRuta();
            }
        });
    };
    ValidacionDeLicenciaControlador.prototype.validateCredentials = function () {
        pUserID = $("#txtUserID").val();
        pPinCode = $("#txtPin").val();
        if (isNaN(pPinCode)) {
            my_dialog("", "", "close");
            notify("ERROR, Debe ingresar un valor numerico");
            $("#txtPin").val("");
            $("#txtPin").focus();
        }
        else {
            if (pPinCode === "") {
                my_dialog("", "", "close");
                notify("ERROR, ingrese usuario/pin.");
                return -1;
            }
            if (navigator.connection.type === "none") {
                notify("Debe tener conectividad a Internet para poder iniciar sesión. Por favor, verifique y vuelva a intentar.");
                return -1;
            }
            else {
                my_dialog("Espere...", "validando usuario y password", "open");
                this.validarLicencia(pUserID, pPinCode, true);
            }
        }
    };
    ValidacionDeLicenciaControlador.prototype.validarLicencia = function (usuario, contraseña, estaIniciandoSession) {
        var _this = this;
        this.validacionDeLicenciaServicio.validarLicencia(usuario, contraseña, function (data) {
            try {
                var globalUtilsServicio_1 = new GlobalUtilsServicio(), tareaDetalleControlador_1 = new TareaDetalleControlador(_this.mensajero), consultaDeInventarioPorZonaControlador_1 = new ConsultaDeInventarioPorZonaControlador(), impresionManifiestoControlador_1 = new ImpresionManifiestoControlador(), unidadesDeMedidaTomaDeInventarioControlador_1 = new UnidadesDeMedidaTomaDeInventarioControlador(_this.mensajero);
                socket = io.connect(data.CommunicationAddress);
                localStorage.setItem("pUserID", usuario);
                localStorage.setItem("pUserCode", contraseña);
                socket.on("connect", function () {
                    try {
                        if (gIsOnline === 0) {
                            DeviceIsOnline();
                            socket.emit("IdentifyDeviceInRoute", {
                                user: localStorage.getItem("pUserID"),
                                routeId: gCurrentRoute,
                                deviceId: device.uuid,
                                message: "Registrando desde la aplicacion nueva " + SondaVersion
                            });
                        }
                        $(".networkclass").text(tipoDeRedALaQueEstaConectadoElDispositivo);
                        $(".networkclass").buttonMarkup({ icon: "cloud" });
                        gIsOnline = 1;
                        if (!_this.fromDisconet) {
                            globalUtilsServicio_1.delegarSockets(socket);
                            tareaDetalleControlador_1.delegarSockets(socket);
                            consultaDeInventarioPorZonaControlador_1.delegarSockets(socket);
                            impresionManifiestoControlador_1.delegarSockets(socket);
                            unidadesDeMedidaTomaDeInventarioControlador_1.delegarSockets(socket);
                            DelegarABroadcast(socket);
                            DelegarSocketsListadoOrdenDeVentaControlador(socket);
                        }
                        CheckforOffline();
                        if (localStorage.getItem("POS_STATUS") === "OPEN") {
                            EnviarData();
                        }
                    }
                    catch (ex) {
                        notify("error: " + ex.message);
                    }
                });
                socket.on("disconnect", function () {
                    _this.fromDisconet = true;
                    $(".networkclass").text("OFF");
                    $(".networkclass").buttonMarkup({ icon: "forbidden" });
                    gIsOnline = 0;
                    if (socket.connected) {
                        DeviceIsOnline();
                    }
                    else {
                        if (estaCargandoInicioRuta === 1) {
                            estaCargandoInicioRuta = 0;
                            notify("Ha perdido la conexión a internet.");
                            $("#btnStartPOS_action").css("display", "none");
                            BorrarTablasParaInicioDeRuta();
                            $.mobile.changePage("#login_page", {
                                transition: "flow",
                                reverse: true,
                                showLoadMsg: false
                            });
                            DesBloquearPantalla();
                        }
                        else if (estaEnControlDeFinDeRuta) {
                            DesBloquearPantalla();
                            my_dialog("", "", "close");
                        }
                    }
                });
                socket.on("error_message", function (data) {
                    notify(data.message);
                });
                if (estaIniciandoSession) {
                    var to_1 = setTimeout(function () {
                        socket.emit("validatecredentials", {
                            loginid: usuario,
                            pin: contraseña,
                            uuid: device.uuid,
                            validationtype: data.ValidationType,
                            version: SondaVersion
                        });
                        clearTimeout(to_1);
                    }, 1000);
                }
            }
            catch (e) {
                my_dialog("", "", "close");
                notify(e.message);
            }
            return -1;
        }, function (err) {
            my_dialog("", "", "close");
            notify(err.message);
        });
    };
    ValidacionDeLicenciaControlador.prototype.limpiarInicioDeRuta = function () {
        $("#UiImgUsuario").attr("src", "");
        $("#UiLblLogin").text("...");
        $("#UiLblRuta").text("...");
        $("#UiLblBodegaVenta").text("...");
        $("#UiLblBodegaVentaNombre").text("...");
        $("#UiLblBodegaPreventa").text("...");
        $("#UiLblBodegaPreventaNombre").text("...");
        $("#UiLblAutorizacion").text("...");
        $("#UiLblSerie").text("...");
        $("#UiLblFechaAutorizacion").text("....-..-..");
        $("#UiLblFechaVencimiento").text("...-..-..");
        $("#UiLblFacturaInicio").text("0");
        $("#UiLblFacturaFinal").text("0");
        $("#UiLblFacturaActual").text("0");
        $("#UiSecuenciaDeDocumentos")
            .children()
            .remove("li");
        $("#UiResumenDeTareas")
            .children()
            .remove("li");
        $("#UiResumenDeCantidad")
            .children()
            .remove("li");
        $("#UiAcordionInformacionUsuario").collapsible("option", "collapsed", false);
    };
    return ValidacionDeLicenciaControlador;
}());
//# sourceMappingURL=ValidacionDeLicenciaControlador.js.map