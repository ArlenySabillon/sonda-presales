var CobroDeFacturaVencidaControlador = (function () {
    function CobroDeFacturaVencidaControlador(mensajero) {
        this.mensajero = mensajero;
        this.cuentaCorrienteServicio = new CuentaCorrienteServicio();
        this.pagoServicio = new PagoDeFacturaVencidaServicio();
        this.cliente = new Cliente();
        this.sumatoriaTotalPendienteDePagoDeFacturasVencidas = 0;
        this.facturasCubiertasPorElPagoActual = [];
        this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas = false;
        this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas = 0;
        this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual = 0;
        this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal = [];
        this.vistaCargandosePorPrimeraVez = true;
        this.manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.configuracionDeDecimales = new ManejoDeDecimales();
        this.montoCubiertoPorUltimoPagoProcesado = 0;
        this.funcionDeRetornoAPocesoPrincipal = null;
        this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas = false;
        this.tokenCliente = mensajero.subscribe(this.clienteEntregado, getType(ClienteMensaje), this);
        this.tokenDetalleDeTiposDePagoRealizados = mensajero.subscribe(this.detalleDeTiposDePagosEntregados, getType(DetalleDeTipoDePagoMensaje), this);
        this.tokenActualizacionDeInformacionDePagoDeFacturasVencidas = mensajero.subscribe(this.actualizacionDeInformacionDePagoDeFacturasVencidasEntregado, getType(ActualizacionDeInformacionDePagoDeFacturasVencidasMensaje), this);
    }
    CobroDeFacturaVencidaControlador.prototype.actualizacionDeInformacionDePagoDeFacturasVencidasEntregado = function (message, subscriber) {
        subscriber.montoCubiertoPorUltimoPagoProcesado =
            message.montoCubiertoPorUltimoPagoProcesado;
    };
    CobroDeFacturaVencidaControlador.prototype.clienteEntregado = function (message, subscriber) {
        subscriber.cliente = message.cliente;
        subscriber.vistaCargandosePorPrimeraVez =
            message.vistaCargandosePorPrimeraVez;
        subscriber.cargarVistaParaPagoDeFacturas = message.tipoDePagoAProcesar;
        subscriber.tipoDePagoParaFacturasProcesadas = message.tipoDePagoAProcesar;
        subscriber.funcionDeRetornoAPocesoPrincipal =
            message.funcionDeRetornoAPocesoPrincipal;
        subscriber.permitirSoloVisualizacionDeFacturasVencidasOAbiertas =
            message.permitirSoloVisualizacionDeFacturasVencidasOAbiertas;
        var pageTitle = $("#UiLblOverdueInvoicePaymentPageTitle");
        pageTitle.text((message.permitirSoloVisualizacionDeFacturasVencidasOAbiertas
            ? "Listado"
            : "Pago") + " de Facturas " + (message.tipoDePagoAProcesar === TipoDePagoDeFactura.FacturaVencida
            ? "Vencidas"
            : "Abiertas"));
        pageTitle = null;
    };
    CobroDeFacturaVencidaControlador.prototype.delegarCobroDeFacturaVencidaControlador = function () {
        var _this = this;
        $("#UiOverdueInvoicePaymentPage").on("pageshow", function () {
            _this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (manejoDeDecimales) {
                _this.configuracionDeDecimales = manejoDeDecimales;
                try {
                    _this.sumatoriaTotalPendienteDePagoDeFacturasVencidas = 0;
                    _this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas = 0;
                    _this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual = 0;
                    _this.cliente.paymentType = _this.tipoDePagoParaFacturasProcesadas;
                    tipoDePagoProcesadoEnCobroDeFacturasVencidas = _this
                        .tipoDePagoParaFacturasProcesadas;
                    _this.cuentaCorrienteServicio.obtenerFacturasVencidasDeCliente(_this.cliente, function (facturasVencidas) {
                        _this.cliente.overdueInvoices = facturasVencidas;
                        _this.cuentaCorrienteServicio.obtenerSumatoriaDePagosRealizadosPorClienteDuranteElDia(_this.cliente, function (clienteConInformacionCompleta) {
                            _this.cliente = clienteConInformacionCompleta;
                            if (_this.cliente.paymentType ===
                                TipoDePagoDeFactura.FacturaAbierta) {
                                _this.cliente.totalAmountPayedOfOverdueInvoices = _this.montoCubiertoPorUltimoPagoProcesado;
                            }
                            _this.crearListadoDeFacturasVencidasDeCliente(function () {
                                _this.actualizarPorcentajeCubiertoPorPagoActual();
                                InteraccionConUsuarioServicio.desbloquearPantalla();
                                if (_this.vistaCargandosePorPrimeraVez) {
                                    _this.verificarSiYaSeAlcanzoElPorcentajeMinimoDePagoDeFacturasVencidas();
                                }
                            });
                        }, function (resultado) {
                            InteraccionConUsuarioServicio.desbloquearPantalla();
                            notify("Lo sentimos, ha habido un error al obtener la sumatoria de pagos realizados por el cliente " + _this.cliente.clientId);
                        });
                    }, function (resultado) {
                        InteraccionConUsuarioServicio.desbloquearPantalla();
                        notify("Lo sentimos, ha habido un error al obtener las facturas vencidas de cliente " + _this.cliente.clientId);
                    });
                }
                catch (e) {
                    notify("Error al cargar los datos iniciales del proceso, por favor, vuelva a intentar.");
                }
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        });
        $("#UiLblPercentageOfOverdueInvoicesPayment").on("click", function (e) {
            e.preventDefault();
            if (_this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas) {
                return false;
            }
            _this.obtenerAutorizacionDeUsuarioParaProcesarPago(function () {
                _this.procesarCobroDeFacturas();
            });
        });
        $("#UiBtnShowPaymentTypeDetailPage").on("click", function (e) {
            e.preventDefault();
            _this.enviarInformacionDeDetalleDePagos(function () {
                _this.irAPantalla("UiOverdueInvoicePaymentDetailPage");
            });
        });
        $("#UiBtnGoBackFromOverdueInvoicePaymentPage").on("click", function (e) {
            e.preventDefault();
            _this.irAPantallaDeCliente();
        });
    };
    CobroDeFacturaVencidaControlador.prototype.irAPantalla = function (pantalla) {
        $.mobile.changePage("#" + pantalla, {
            transition: "pop",
            reverse: false,
            showLoadMsg: false
        });
    };
    CobroDeFacturaVencidaControlador.prototype.crearListadoDeFacturasVencidasDeCliente = function (callback) {
        var _this = this;
        var contenedorDeFacturasVencidasDeCliente = $("#UlDetailOverdueInvoices");
        var etiquetaDeSumaTotalDeFacturasVencidas = $("#UiLblOverdueInvoicesAmount");
        var campoComentarioDePago = $("#UiTxtPaidComment");
        var campoDeMontoDePago = $("#UiLblPayedAmount");
        var etiquetaDePorcentajeDePagoMinimo = $("#UiLblMinimumPaidPercentaje");
        var contenedorDeBotonMostrarPantallaDeDetalleDePago = $("#UiContainerOfUiBtnShowPaymentTypeDetailPage");
        var contenedorDeMontoDePago = $("#UiContainerOfPaymentAmount");
        var contenedorComentarioDePago = $("#UiContainerOfPaymentComment");
        var contenedorPorcentajeMinimoDePago = $("#UiContainerOfMinimumPercentagePayment");
        if (this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas) {
            contenedorDeBotonMostrarPantallaDeDetalleDePago.css("display", "none");
            contenedorDeMontoDePago.css("display", "none");
            contenedorComentarioDePago.css("display", "none");
            contenedorPorcentajeMinimoDePago.css("display", "none");
        }
        else {
            contenedorDeBotonMostrarPantallaDeDetalleDePago.css("display", "block");
            contenedorDeMontoDePago.css("display", "block");
            contenedorComentarioDePago.css("display", "block");
            contenedorPorcentajeMinimoDePago.css("display", "block");
        }
        $("#OverdueInvoicePaymentMenu").trigger("refresh");
        contenedorDeBotonMostrarPantallaDeDetalleDePago = null;
        contenedorDeMontoDePago = null;
        contenedorComentarioDePago = null;
        contenedorPorcentajeMinimoDePago = null;
        campoDeMontoDePago.text(this.configuracionDeDecimales.currencySymbol + " " + format_number(this.obtenerMontoIngresadoEnCampoDePago(), this.configuracionDeDecimales.defaultDisplayDecimals));
        campoComentarioDePago.val("");
        this.actualizarPorcentajeCubiertoPorPagoActual();
        contenedorDeFacturasVencidasDeCliente.children().remove("li");
        var htmlDeFacturasVencidas = [];
        this.cliente.overdueInvoices.forEach(function (facturaVencida) {
            _this.sumatoriaTotalPendienteDePagoDeFacturasVencidas +=
                facturaVencida.pendingToPaid;
            htmlDeFacturasVencidas.push(_this.obtenerFormatoHtmlDeObjetoFactura(facturaVencida));
        });
        etiquetaDeSumaTotalDeFacturasVencidas.text(this.configuracionDeDecimales.currencySymbol + " " + format_number(this.sumatoriaTotalPendienteDePagoDeFacturasVencidas, this.configuracionDeDecimales.defaultDisplayDecimals));
        if (htmlDeFacturasVencidas.length > 0) {
            contenedorDeFacturasVencidasDeCliente.append(htmlDeFacturasVencidas.join(""));
            contenedorDeFacturasVencidasDeCliente.listview("refresh");
        }
        contenedorDeFacturasVencidasDeCliente = null;
        etiquetaDeSumaTotalDeFacturasVencidas = null;
        campoDeMontoDePago = null;
        campoComentarioDePago = null;
        this.verificarSiAplicaPorcentajeMinimoDePago(function (aplicaPorcentajeMinimoDePago, valorDePorcentajeMinimoDePago) {
            _this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas = aplicaPorcentajeMinimoDePago;
            _this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas =
                valorDePorcentajeMinimoDePago > 100
                    ? 100
                    : valorDePorcentajeMinimoDePago;
            etiquetaDePorcentajeDePagoMinimo.text(_this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas.toString());
            callback();
        });
    };
    CobroDeFacturaVencidaControlador.prototype.verificarSiAplicaPorcentajeMinimoDePago = function (callback) {
        var _this = this;
        try {
            this.pagoServicio.obtenerParametroDePorcentajeDePagoMinimoDeFacturasVencidas(function (aplicaParametro, valorDeParametro) {
                var porcentajeMinimoAAplicar = _this.cliente.paymentType === TipoDePagoDeFactura.FacturaVencida
                    ? valorDeParametro
                    : _this.obtenerPorcentajeMinimoDePagoEnBaseAFacturasAbiertas(_this.cliente);
                callback(aplicaParametro, porcentajeMinimoAAplicar);
            }, function (resultado) {
                notify("Lo sentimos, ha ocurrido un error al validar si se aplica el porcentaje m\u00EDnimo de pago de facturas vencidas, por favor vuelva a intentar.");
                callback(false, 0);
            });
        }
        catch (e) {
            notify("Lo sentimos, ha ocurrido un error al validar si se aplica el porcentaje m\u00EDnimo de pago de facturas vencidas, por favor vuelva a intentar.");
            callback(false, 0);
        }
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerPorcentajeMinimoDePagoEnBaseAFacturasAbiertas = function (cliente) {
        var porcentaje = 0;
        if (cliente.totalAmountOfOpenInvoices <= 0) {
            return porcentaje;
        }
        porcentaje =
            (cliente.totalAmountOfOpenInvoices +
                (cliente.cashAmount + cliente.creditAmount) -
                cliente.currentAccountingInformation.creditLimit) /
                (cliente.totalAmountOfOpenInvoices -
                    cliente.currentAccountingInformation.currentAmountOnCredit);
        return Math.ceil(porcentaje * 100);
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerFormatoHtmlDeObjetoFactura = function (facturaVencida) {
        var html = [];
        html.push("<li class=\"ui-field-contain\" data-count-theme=\"b\">");
        html.push("<table>");
        html.push("<tr>");
        html.push("<td>");
        html.push("<p><b>Factura: </b>" + facturaVencida.invoiceId + "</p>");
        html.push("<p><b>Creada: </b>" + facturaVencida.createdDate.toString().split(" ")[0] + " </p>");
        html.push("<p><b>Vencimiento: </b>" + facturaVencida.dueDate.toString().split(" ")[0] + " </p>");
        html.push("<p><b>Facturado: </b>" + this.configuracionDeDecimales.currencySymbol + " " + format_number(facturaVencida.totalAmount, this.configuracionDeDecimales.defaultDisplayDecimals) + " </p>");
        html.push("</td>");
        html.push("<td>");
        html.push("<span class=\"ui-li-count\">" + this.configuracionDeDecimales.currencySymbol + " " + format_number(facturaVencida.pendingToPaid, this.configuracionDeDecimales.defaultDisplayDecimals) + " </span>");
        html.push("</td>");
        html.push("</tr>");
        html.push("</table>");
        html.push("</li>");
        return html.join("");
    };
    CobroDeFacturaVencidaControlador.prototype.actualizarPorcentajeCubiertoPorPagoActual = function () {
        var etiquetaDePorcentajeDePagoCubierto = $("#UiLblPercentageOfOverdueInvoicesPayment");
        var valorDePorcentaje = format_number(format_number(this.obtenerPorcentajeDePagoCubiertoEnElPagoActual(), this.configuracionDeDecimales.defaultCalculationsDecimals), this.configuracionDeDecimales.defaultDisplayDecimals);
        etiquetaDePorcentajeDePagoCubierto.text(valorDePorcentaje + "%");
        this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual = valorDePorcentaje;
        if (this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas) {
            if (valorDePorcentaje >=
                this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas) {
                etiquetaDePorcentajeDePagoCubierto.css("color", "#4cff00");
            }
            else {
                etiquetaDePorcentajeDePagoCubierto.css("color", "#d64161");
            }
        }
        else {
            etiquetaDePorcentajeDePagoCubierto.css("color", "#4cff00");
        }
        etiquetaDePorcentajeDePagoCubierto = null;
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerPorcentajeDePagoCubiertoEnElPagoActual = function () {
        var montoDePago = this.obtenerMontoIngresadoEnCampoDePago();
        if (this.sumatoriaTotalPendienteDePagoDeFacturasVencidas <= 0) {
            return 0;
        }
        var porcentajeDePagoCubierto = 0;
        porcentajeDePagoCubierto =
            ((this.cliente.totalAmountPayedOfOverdueInvoices + montoDePago) /
                (this.cliente.totalAmountPayedOfOverdueInvoices +
                    this.sumatoriaTotalPendienteDePagoDeFacturasVencidas)) *
                100;
        return porcentajeDePagoCubierto > 100 ? 100 : porcentajeDePagoCubierto;
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerMontoIngresadoEnCampoDePago = function () {
        var montoDePago = 0;
        this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal.forEach(function (pago) {
            montoDePago += pago.amount;
        });
        return montoDePago;
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerAutorizacionDeUsuarioParaProcesarPago = function (callback) {
        navigator.notification.confirm("¿Está seguro de procesar el pago actual?", function (buttonIndex) {
            if (buttonIndex === BotonSeleccionado.Si) {
                InteraccionConUsuarioServicio.bloquearPantalla();
                callback();
            }
        }, "Sonda\u00AE " + SondaVersion, ["No", "Si"]);
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerAutorizacionDeUsuarioParaContinuarPedido = function (callback) {
        InteraccionConUsuarioServicio.desbloquearPantalla();
        navigator.notification.confirm("El monto de pago es cero. ¿Desea continuar el proceso de venta?", function (buttonIndex) {
            if (buttonIndex === BotonSeleccionado.Si) {
                InteraccionConUsuarioServicio.bloquearPantalla();
                callback();
            }
        }, "Sonda\u00AE " + SondaVersion, ["No", "Si"]);
    };
    CobroDeFacturaVencidaControlador.prototype.procesarCobroDeFacturas = function () {
        var _this = this;
        try {
            var montoDePago_1 = this.obtenerMontoIngresadoEnCampoDePago();
            if (montoDePago_1 === 0) {
                if (this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas <=
                    0 &&
                    this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas) {
                    this.obtenerAutorizacionDeUsuarioParaContinuarPedido(function () {
                        _this.funcionDeRetornoAPocesoPrincipal();
                    });
                }
                else {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                    notify("Por favor, ingrese un monto v\u00E1lido.");
                }
            }
            else {
                if (montoDePago_1 > this.sumatoriaTotalPendienteDePagoDeFacturasVencidas) {
                    montoDePago_1 = this.sumatoriaTotalPendienteDePagoDeFacturasVencidas;
                }
                this.obtenerFacturasParaDetalleDePago(montoDePago_1, function () {
                    _this.prepararPago(montoDePago_1, function (documentoDePago) {
                        _this.montoCubiertoPorUltimoPagoProcesado =
                            documentoDePago.paymentAmount;
                        _this.pagoServicio.guardarDocumentoDePago(documentoDePago, function () {
                            InteraccionConUsuarioServicio.desbloquearPantalla();
                            _this.publicarCobroProcesado(documentoDePago, function () {
                                _this.irAPantalla("UiPaymentConfirmationPage");
                            });
                        }, function (resultado) {
                            InteraccionConUsuarioServicio.desbloquearPantalla();
                            notify("Lo sentimos, ha ocurrido un error al guardar el documento de pago, por favor, vuelva a intentar.");
                        });
                    });
                });
            }
        }
        catch (e) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            notify("Lo sentimos ha ocurrido un error al procesar las facturas para el pago actual, por favor, vuelva a intentar.");
        }
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerFacturasParaDetalleDePago = function (montoDePago, callbak) {
        var _this = this;
        var montoDePagoDisponible = montoDePago;
        this.facturasCubiertasPorElPagoActual.length = 0;
        var facturasOrdenadas = this.cliente.overdueInvoices.sort(function (a, b) {
            return a.dueDate.toString().localeCompare(b.dueDate.toString());
        });
        facturasOrdenadas.forEach(function (facturaVencida) {
            facturaVencida.amountToDate = facturaVencida.pendingToPaid;
            if (facturaVencida.pendingToPaid <= montoDePagoDisponible) {
                facturaVencida.payedAmount = facturaVencida.pendingToPaid;
                facturaVencida.pendingToPaid = 0;
                _this.facturasCubiertasPorElPagoActual.push(facturaVencida);
                montoDePagoDisponible -= facturaVencida.payedAmount;
            }
            else if (montoDePagoDisponible > 0) {
                facturaVencida.payedAmount = montoDePagoDisponible;
                facturaVencida.pendingToPaid =
                    facturaVencida.pendingToPaid - facturaVencida.payedAmount;
                _this.facturasCubiertasPorElPagoActual.push(facturaVencida);
                montoDePagoDisponible -= facturaVencida.payedAmount;
            }
        });
        callbak();
    };
    CobroDeFacturaVencidaControlador.prototype.prepararPago = function (montoDePago, callback) {
        var _this = this;
        var documentoDePago = new PagoDeFacturaVencidaEncabezado();
        documentoDePago.paymentAmount = montoDePago;
        ValidarSequenciaDeDocumentos(TIpoDeDocumento.PagoDeFacturaVencida, function (secuenciaValida) {
            if (secuenciaValida) {
                _this.pagoServicio.obtenerSecuenciaDeDocumentoDePago(function (secuenciaDeDocumentos) {
                    documentoDePago.docNum = secuenciaDeDocumentos.numero;
                    documentoDePago.docSerie = secuenciaDeDocumentos.serie;
                    documentoDePago.branchName = secuenciaDeDocumentos.nombreSucursal;
                    documentoDePago.branchAddress =
                        secuenciaDeDocumentos.direccionSucursal;
                    documentoDePago.codeCustomer = _this.cliente.clientId;
                    documentoDePago.codeRoute = gCurrentRoute;
                    documentoDePago.isPosted = SiNo.No;
                    documentoDePago.loginId = gLastLogin;
                    documentoDePago.createdDate = getDateTime();
                    documentoDePago.validateMinimumPercentOfPaid = _this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas;
                    documentoDePago.minimumPercentOfPaid = _this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas;
                    documentoDePago.percentCoveredWhitThePaid = _this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual;
                    documentoDePago.paidComment = _this.obtenerComentarioDePago();
                    documentoDePago.paymentType = _this.tipoDePagoParaFacturasProcesadas;
                    _this.facturasCubiertasPorElPagoActual.forEach(function (facturaVencida) {
                        var pagoDefacturaDetalle = new PagoDeFacturaVencidaDetalle();
                        pagoDefacturaDetalle.docNum = documentoDePago.docNum;
                        pagoDefacturaDetalle.docSerie = documentoDePago.docSerie;
                        pagoDefacturaDetalle.invoiceId = facturaVencida.invoiceId;
                        pagoDefacturaDetalle.docEntry = facturaVencida.docEntry;
                        pagoDefacturaDetalle.payedAmount = facturaVencida.payedAmount;
                        pagoDefacturaDetalle.amountToDate =
                            facturaVencida.amountToDate;
                        pagoDefacturaDetalle.pendingAmount =
                            facturaVencida.pendingToPaid;
                        documentoDePago.overdueInvoicePaymentDetail.push(pagoDefacturaDetalle);
                    });
                    _this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal.forEach(function (tipoDePago) {
                        tipoDePago.docSerie = documentoDePago.docSerie;
                        tipoDePago.docNum = documentoDePago.docNum;
                        documentoDePago.overdueInvoicePaymentTypeDetail.push(tipoDePago);
                    });
                    callback(documentoDePago);
                }, function (resultado) {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                    console.log(resultado.mensaje);
                    if (resultado.codigo === -1) {
                        notify(resultado.mensaje);
                    }
                    else {
                        notify("Ha ocurrido un error al obtener la secuencia de documentos de pago, por favor, vuelva a intentar.");
                    }
                });
            }
            else {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify("No cuenta con una secuencia de documentos v\u00E1lida para procesar el cobro, por favor, comun\u00EDquese con su administrador.");
            }
        }, function (error) {
            console.log("Error al validar la secuencia de documentos de pago de facturas vencidas: " + error);
            InteraccionConUsuarioServicio.desbloquearPantalla();
            notify("Ha ocurrido un error al validar la secuencia de documentos.");
        });
    };
    CobroDeFacturaVencidaControlador.prototype.publicarCobroProcesado = function (pagoProcesado, callback) {
        var pagoMensaje = new PagoDeFacturaVencidaMensaje(this);
        pagoMensaje.pago = pagoProcesado;
        pagoMensaje.cliente = this.cliente;
        pagoMensaje.funcionDeRetornoAPocesoPrincipal = this.funcionDeRetornoAPocesoPrincipal;
        this.mensajero.publish(pagoMensaje, getType(PagoDeFacturaVencidaMensaje));
        callback();
    };
    CobroDeFacturaVencidaControlador.prototype.obtenerComentarioDePago = function () {
        var campoComentario = $("#UiTxtPaidComment");
        return campoComentario.val() ? campoComentario.val() : "";
    };
    CobroDeFacturaVencidaControlador.prototype.verificarSiYaSeAlcanzoElPorcentajeMinimoDePagoDeFacturasVencidas = function () {
        if (this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas &&
            this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas > 0) {
            if (this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual >=
                this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas) {
                if (this.cliente.paymentType === TipoDePagoDeFactura.FacturaVencida) {
                    notify("Porcentaje de pago m\u00EDnimo alcanzado, puede seguir con el proceso de venta.");
                }
                else {
                    notify("Porcentaje de pago m\u00EDnimo alcanzado, puede continuar.");
                }
                this.funcionDeRetornoAPocesoPrincipal();
            }
        }
    };
    CobroDeFacturaVencidaControlador.prototype.detalleDeTiposDePagosEntregados = function (message, subscriber) {
        subscriber.vistaCargandosePorPrimeraVez = false;
        subscriber.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal =
            message.detalleDePagosRealizados;
    };
    CobroDeFacturaVencidaControlador.prototype.enviarInformacionDeDetalleDePagos = function (callback) {
        var mensaje = new DetalleDeTipoDePagoMensaje(this);
        mensaje.detalleDePagosRealizados = this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal;
        this.mensajero.publish(mensaje, getType(DetalleDeTipoDePagoMensaje));
        callback();
    };
    CobroDeFacturaVencidaControlador.prototype.irAPantallaDeCliente = function () {
        this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal.length = 0;
        this.vistaCargandosePorPrimeraVez = true;
        this.montoCubiertoPorUltimoPagoProcesado = 0;
        this.funcionDeRetornoAPocesoPrincipal = null;
        this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas = false;
        this.enviarInformacionDeDetalleDePagos(function () {
            window.history.back();
        });
    };
    return CobroDeFacturaVencidaControlador;
}());
//# sourceMappingURL=CobroDeFacturaVencidaControlador.js.map