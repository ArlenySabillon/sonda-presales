var ListaDePagoControlador = (function () {
    function ListaDePagoControlador(mensajero) {
        this.mensajero = mensajero;
        this.pagoServicio = new PagoDeFacturaVencidaServicio();
        this.documentosDePago = [];
        this.decimalesServicio = new ManejoDeDecimalesServicio();
    }
    ListaDePagoControlador.prototype.delegarListaDePagoControlador = function () {
        var _this = this;
        $("#UiBtnShowPaymentsList").on("click", function (e) {
            e.preventDefault();
            _this.irAPantalla("UiPaymentListPage");
        });
        $("#UiPaymentListPage").on("pageshow", function (e) {
            e.preventDefault();
            _this.cargarDatosPrincipales();
        });
        $("#UiBtnBackFromPaymentListPage").on("click", function (e) {
            e.preventDefault();
            window.history.back();
        });
        $("#UiBtnRefreshPaymentsList").on("click", function (e) {
            e.preventDefault();
            _this.cargarDatosPrincipales();
        });
        $("#UiPaymentListPage").on("click", "#UiPaymentsList a", function (e) {
            e.preventDefault();
            var id = e.currentTarget.id;
            if (id) {
                _this.mostrarOpcionesDeDocumentoDePagoSeleccionado(parseInt(id));
            }
        });
    };
    ListaDePagoControlador.prototype.irAPantalla = function (pantalla) {
        $.mobile.changePage("#" + pantalla, {
            transition: "pop",
            reverse: false,
            showLoadMsg: false
        });
    };
    ListaDePagoControlador.prototype.restablecerFiltroPrincipal = function () {
        var filtroDeListado = $("#UiTxtPaymentFilter");
        filtroDeListado.val("");
        filtroDeListado.focus();
        filtroDeListado = null;
    };
    ListaDePagoControlador.prototype.cargarDatosPrincipales = function () {
        var _this = this;
        this.simboloDeMoneda = localStorage.getItem("CURRENCY_SYMBOL") || "Q";
        this.documentosDePago.length = 0;
        InteraccionConUsuarioServicio.bloquearPantalla();
        this.restablecerFiltroPrincipal();
        this.decimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this.configuracionDeDecimales = decimales;
            _this.pagoServicio.obtenerEncabezadoDeDocumentosDePagoParaReporte(function (documentos) {
                _this.documentosDePago = documentos;
                _this.construirListadoDeRecibosEmitidos(_this.documentosDePago, function () {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                });
            }, function (resultado) {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify(resultado.mensaje);
            });
        }, function (resultado) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            notify(resultado.mensaje);
        });
    };
    ListaDePagoControlador.prototype.construirListadoDeRecibosEmitidos = function (documentosDePago, callback) {
        var _this = this;
        try {
            var contenedorDeListadoDeDocumentosDePago = $("#UiPaymentsList");
            contenedorDeListadoDeDocumentosDePago.children().remove("li");
            var etiquetaDeMontoTotalEnPagos = $("#UiLblTotalAmountOfPayments");
            var montoTotalEnPagos_1 = 0;
            var cadenaHtmlDeDocumentosDePago_1 = [];
            documentosDePago.forEach(function (pago) {
                montoTotalEnPagos_1 += pago.paymentAmount;
                cadenaHtmlDeDocumentosDePago_1.push(" <li data-filtertext=\"" + pago.codeCustomer + " " + pago.nameCustomer + " " + pago.docNum + "\" data-icon=\"false\">");
                cadenaHtmlDeDocumentosDePago_1.push(" <a href=\"#\" id=\"" + pago.docNum + "\">");
                cadenaHtmlDeDocumentosDePago_1.push(" <label>No. " + pago.docNum + " </label>");
                cadenaHtmlDeDocumentosDePago_1.push(" <label>" + pago.codeCustomer + " </label>");
                cadenaHtmlDeDocumentosDePago_1.push(" <label>" + pago.nameCustomer + " </label>");
                cadenaHtmlDeDocumentosDePago_1.push(" <span class=\"ui-li-count\">" + _this.simboloDeMoneda + ". " + format_number(pago.paymentAmount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "</span>");
                cadenaHtmlDeDocumentosDePago_1.push(" </a>");
                cadenaHtmlDeDocumentosDePago_1.push(" </li>");
            });
            var listadoDePagos = cadenaHtmlDeDocumentosDePago_1.join("");
            if (listadoDePagos !== "") {
                contenedorDeListadoDeDocumentosDePago.append(listadoDePagos);
                contenedorDeListadoDeDocumentosDePago.listview("refresh");
            }
            etiquetaDeMontoTotalEnPagos.text(this.simboloDeMoneda + " " + format_number(montoTotalEnPagos_1, this.configuracionDeDecimales.defaultDisplayDecimals));
            etiquetaDeMontoTotalEnPagos = null;
        }
        catch (e) {
            notify("Ha ocurrido un error al crear el listado de documentos de pago, por favor, vuelva a intentar.");
        }
        callback();
    };
    ListaDePagoControlador.prototype.mostrarOpcionesDeDocumentoDePagoSeleccionado = function (numeroDeDocumento) {
        var _this = this;
        try {
            var configuracionDeOpciones = {
                title: "Seleccione una opción:",
                items: [
                    {
                        text: "Reimprimir",
                        value: OpcionDisponibleParaDocumentoDePagoSeleccionado.Reimprimir
                    },
                    {
                        text: "Ver Detalle",
                        value: OpcionDisponibleParaDocumentoDePagoSeleccionado.VerDetalle
                    }
                ],
                doneButtonLabel: "Aceptar",
                cancelButtonLabel: "Cancelar"
            };
            var pagoSeleccionado_1 = this
                .documentosDePago.find(function (pago) {
                return pago.docNum === numeroDeDocumento;
            });
            if (pagoSeleccionado_1) {
                ShowListPicker(configuracionDeOpciones, function (opcionSeleccionada) {
                    switch (opcionSeleccionada) {
                        case OpcionDisponibleParaDocumentoDePagoSeleccionado.Reimprimir:
                            InteraccionConUsuarioServicio.bloquearPantalla();
                            _this.imprimirDocumentoDePagoSeleccionado(pagoSeleccionado_1);
                            break;
                        case OpcionDisponibleParaDocumentoDePagoSeleccionado.VerDetalle:
                            InteraccionConUsuarioServicio.bloquearPantalla();
                            _this.verDetalleDeDocumentoDePagoSeleccionado(pagoSeleccionado_1, function () {
                                InteraccionConUsuarioServicio.desbloquearPantalla();
                                _this.irAPantalla("UiPaymentDetailPage");
                            });
                            break;
                    }
                });
            }
            else {
                throw new Error("No se encontro el documento de pago seleccionado.");
            }
        }
        catch (e) {
            notify("Lo sentimos, ha ocurrido un error al intentar mostrar las opciones disponibles para el documento seleccionado, por favor, vuelva a intentar.");
        }
    };
    ListaDePagoControlador.prototype.imprimirDocumentoDePagoSeleccionado = function (pago) {
        var _this = this;
        this.pagoServicio.obtenerInformacionDeSecuenciaDeDocumentoDePago(function (secuencia) {
            pago.branchName = secuencia.nombreSucursal;
            pago.branchAddress = secuencia.direccionSucursal;
            pago.reprint = true;
            _this.pagoServicio.imprimirPago(pago, function () {
                pago.isReprint = true;
                _this.pagoServicio.imprimirPago(pago, function () {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                }, function (error) {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                    notify("Ha ocurrido un error al imprimir el documento de pago, por favor vuelva a intentar.");
                });
            }, function (error) {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify("Ha ocurrido un error al imprimir el documento de pago, por favor vuelva a intentar.");
            });
        }, function (resultado) {
            notify("Lo sentimos ha ocurrido un error al obtener los datos necesarios para la impresi\u00F3n del documento seleccionado, por favor, vuelva a intentar.");
        });
    };
    ListaDePagoControlador.prototype.verDetalleDeDocumentoDePagoSeleccionado = function (pago, callback) {
        var mensaje = new PagoDeFacturaVencidaMensaje(this);
        mensaje.pago = pago;
        mensaje.configuracionDeDecimales = this.configuracionDeDecimales;
        mensaje.simboloDeMoneda = this.simboloDeMoneda;
        this.mensajero.publish(mensaje, getType(PagoDeFacturaVencidaMensaje));
        callback();
    };
    return ListaDePagoControlador;
}());
//# sourceMappingURL=ListaDePagoControlador.js.map