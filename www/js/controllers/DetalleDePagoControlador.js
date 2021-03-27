var DetalleDePagoControlador = (function () {
    function DetalleDePagoControlador(mensajero) {
        this.mensajero = mensajero;
        this.tokenPago = mensajero.subscribe(this.pagoEntregado, getType(PagoDeFacturaVencidaMensaje), this);
    }
    DetalleDePagoControlador.prototype.delegarDetalleDePagoControlador = function () {
        var _this = this;
        $("#UiPaymentDetailPage").on("pageshow", function (e) {
            e.preventDefault();
            _this.cargarDatosPrincipales();
        });
        $("#UiBtnBackFromPaymentDetailPage").on("click", function (e) {
            e.preventDefault();
            _this.regresarAPantallaAnterior();
        });
    };
    DetalleDePagoControlador.prototype.regresarAPantallaAnterior = function () {
        window.history.back();
        this.documentoDePago = new PagoDeFacturaVencidaEncabezado();
    };
    DetalleDePagoControlador.prototype.pagoEntregado = function (mensaje, subscriber) {
        subscriber.documentoDePago = mensaje.pago;
        subscriber.configuracionDeDecimales = mensaje.configuracionDeDecimales;
        subscriber.simboloDeMoneda = mensaje.simboloDeMoneda;
    };
    DetalleDePagoControlador.prototype.cargarDatosPrincipales = function () {
        InteraccionConUsuarioServicio.bloquearPantalla();
        var etiquetaDeInformacionDeCliente = $("#UiLblCustomerInfo");
        etiquetaDeInformacionDeCliente.text(this.documentoDePago.codeCustomer + " - " + this.documentoDePago.nameCustomer);
        etiquetaDeInformacionDeCliente = null;
        var etiquetaDeInformacionDelPago = $("#UiLblPaymentAmountInfo");
        etiquetaDeInformacionDelPago.text("Recibo No. " + this.documentoDePago.docNum + " (" + this.simboloDeMoneda + ". " + format_number(this.documentoDePago.paymentAmount, this.configuracionDeDecimales.defaultDisplayDecimals) + ")");
        etiquetaDeInformacionDelPago = null;
        this.construirVisualizacionDeDetalleDeFacturasCanceladas(this.documentoDePago, function () {
            InteraccionConUsuarioServicio.desbloquearPantalla();
        });
    };
    DetalleDePagoControlador.prototype.construirVisualizacionDeDetalleDeFacturasCanceladas = function (documentoDePago, callback) {
        var _this = this;
        try {
            var contenedorDeDetalleDePago = $("#UiListOfInvoicesPaid");
            contenedorDeDetalleDePago.children().remove("li");
            var cadenaHtmlDeDetalleDocumentosDePago_1 = [];
            documentoDePago.overdueInvoicePaymentDetail.forEach(function (detalle) {
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <li data-icon=\"false\">");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <a href=\"#\">");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <label>No. " + detalle.invoiceId + " </label>");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <label>Vencimiento: " + detalle.dueDate.toString().split(" ")[0] + " </label>");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <label>Emisi\u00F3n: " + detalle.createdDate.toString().split(" ")[0] + " </label>");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <label>Saldo: " + _this.simboloDeMoneda + ". " + format_number(detalle.pendingToPaid, _this.configuracionDeDecimales.defaultDisplayDecimals) + " </label>");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" <span class=\"ui-li-count\">" + _this.simboloDeMoneda + ". " + format_number(detalle.payedAmount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "</span>");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" </a>");
                cadenaHtmlDeDetalleDocumentosDePago_1.push(" </li>");
            });
            var listadoDePagos = cadenaHtmlDeDetalleDocumentosDePago_1.join("");
            if (listadoDePagos !== "") {
                contenedorDeDetalleDePago.append(listadoDePagos);
                contenedorDeDetalleDePago.listview("refresh");
            }
        }
        catch (e) {
            notify("Ha ocurrido un error al crear el listado de detalle del documento de pago, por favor, vuelva a intentar.");
        }
        callback();
    };
    return DetalleDePagoControlador;
}());
//# sourceMappingURL=DetalleDePagoControlador.js.map