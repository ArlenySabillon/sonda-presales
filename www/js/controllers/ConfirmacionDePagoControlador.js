var ConfirmacionDePagoControlador = (function () {
    function ConfirmacionDePagoControlador(mensajero) {
        this.mensajero = mensajero;
        this.pagoProcesado = new PagoDeFacturaVencidaEncabezado();
        this.pagoServicio = new PagoDeFacturaVencidaServicio();
        this.funcionDeRetornoAPocesoPrincipal = null;
        this.tokenDePago = mensajero.subscribe(this.pagoEntregado, getType(PagoDeFacturaVencidaMensaje), this);
    }
    ConfirmacionDePagoControlador.prototype.pagoEntregado = function (message, subscriber) {
        subscriber.pagoProcesado = message.pago;
        subscriber.clienteProcesado = message.cliente;
        subscriber.funcionDeRetornoAPocesoPrincipal =
            message.funcionDeRetornoAPocesoPrincipal;
    };
    ConfirmacionDePagoControlador.prototype.delegarConfirmacionDePagoControlador = function () {
        var _this = this;
        $("#UiPaymentConfirmationPage").on("pageshow", function () {
            _this.cargarDatosPrincipales();
        });
        $("#UiBtnPaymentConfirmed").on("click", function () {
            _this.definirPantallaDeDestinoEnBaseAParametroDePorcentajeMinimoDePago(function () {
                window.history.back();
            });
        });
        $("#UiBtnPrintPaidProcessed").on("click", function () {
            _this.pagoProcesado.printsQuantity = 0;
            InteraccionConUsuarioServicio.bloquearPantalla();
            _this.imprimirDocumentoDePago(function () {
                InteraccionConUsuarioServicio.desbloquearPantalla();
            });
        });
    };
    ConfirmacionDePagoControlador.prototype.definirPantallaDeDestinoEnBaseAParametroDePorcentajeMinimoDePago = function (callback) {
        var _this = this;
        if (this.pagoProcesado.validateMinimumPercentOfPaid) {
            if (this.pagoProcesado.percentCoveredWhitThePaid >=
                this.pagoProcesado.minimumPercentOfPaid) {
                this.enviarInformacionDeDetalleDePagos(function () {
                    _this.funcionDeRetornoAPocesoPrincipal();
                });
            }
            else {
                this.regresarAPantallaDeFacturasVendidasDebidoANoAlcanzarElPagoMinimoParaNuevaVenta(this.pagoProcesado.minimumPercentOfPaid, callback);
            }
        }
        else {
            this.enviarInformacionDeDetalleDePagos(function () {
                _this.funcionDeRetornoAPocesoPrincipal();
                notify("Puede seguir con el proceso de venta.");
            });
        }
    };
    ConfirmacionDePagoControlador.prototype.regresarAPantallaDeFacturasVendidasDebidoANoAlcanzarElPagoMinimoParaNuevaVenta = function (porcentajeMinimo, callback) {
        var _this = this;
        this.enviarInformacionDeClientePertenecienteAlPagoActual(function () {
            _this.enviarInformacionDeDetalleDePagos(callback);
        });
        notify("El pago realizado no cubre el porcentaje: " + (porcentajeMinimo ? porcentajeMinimo : 100) + "% m\u00EDnimo necesario para realizar una nueva venta.");
    };
    ConfirmacionDePagoControlador.prototype.cargarDatosPrincipales = function () {
        EnviarData();
        var etiquetaDePagoProcesado = $("#UiLblNumberOfPaidProcessed");
        etiquetaDePagoProcesado.text(this.pagoProcesado.docNum);
        etiquetaDePagoProcesado = null;
    };
    ConfirmacionDePagoControlador.prototype.imprimirDocumentoDePago = function (callback) {
        var _this = this;
        try {
            if (this.pagoProcesado.printsQuantity === 2) {
                return callback();
            }
            this.pagoServicio.imprimirPago(this.pagoProcesado, function () {
                _this.pagoProcesado.isReprint = true;
                _this.pagoProcesado.printsQuantity++;
                _this.imprimirDocumentoDePago(callback);
            }, function (error) {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify("Ha ocurrido un error al imprimir el documento de pago, por favor vuelva a intentar.");
            });
        }
        catch (e) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            console.log("Error al intentar imprimir el documento de pago debido a: " + e.message);
            notify("Ha ocurrido un error al imprimir el documento de pago, por favor vuelva a intentar.");
        }
    };
    ConfirmacionDePagoControlador.prototype.enviarInformacionDeDetalleDePagos = function (callback) {
        var mensaje = new DetalleDeTipoDePagoMensaje(this);
        mensaje.detalleDePagosRealizados = new Array();
        this.mensajero.publish(mensaje, getType(DetalleDeTipoDePagoMensaje));
        callback();
    };
    ConfirmacionDePagoControlador.prototype.enviarInformacionDeClientePertenecienteAlPagoActual = function (callback) {
        var clienteMensaje = new ClienteMensaje(this);
        clienteMensaje.cliente = this.clienteProcesado;
        clienteMensaje.vistaCargandosePorPrimeraVez = true;
        clienteMensaje.tipoDePagoAProcesar = this.clienteProcesado.paymentType;
        this.mensajero.publish(clienteMensaje, getType(ClienteMensaje));
        callback();
    };
    ConfirmacionDePagoControlador.prototype.enviarSolicitudDeActualizacionDeInformacionDePagoActual = function () { };
    return ConfirmacionDePagoControlador;
}());
//# sourceMappingURL=ConfirmacionDePagoControlador.js.map