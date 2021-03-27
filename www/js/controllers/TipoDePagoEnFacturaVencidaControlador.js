var TipoDePagoEnFacturaVencidaControlador = (function () {
    function TipoDePagoEnFacturaVencidaControlador(mensajero) {
        this.mensajero = mensajero;
        this.detalleDeTiposDePagosRealizados = [];
        this.decimalesServicio = new ManejoDeDecimalesServicio();
        this.imagenFrontalDelDocumentoDePago = "";
        this.imagenPosteriorDelDocumentoDePago = "";
        this.tokenDetalleDeTiposDePagoRealizados = mensajero.subscribe(this.detalleDePagosDelDocumentoActualEntregados, getType(DetalleDeTipoDePagoMensaje), this);
    }
    TipoDePagoEnFacturaVencidaControlador.prototype.delegarTipoDePagoEnFacturaVencidaControlador = function () {
        var _this = this;
        $("#UiOverdueInvoicePaymentDetailPage").on("pageshow", function (e) {
            e.preventDefault();
            _this.cargarDatosIniciales();
        });
        $("#UiBtnGoBackFromOverdueInvoicePaymentDetailPage").on("click", function (e) {
            e.preventDefault();
            _this.enviarInformacionDeDetalleDePagos(function () {
                window.history.back();
            });
        });
        $("#UiBtnApplyPayment").on("click", function (e) {
            e.preventDefault();
            _this.obtenerAutorizacionDeUsuarioParaProcesarPago(function () {
                _this.validarPagoIngresado();
            });
        });
        $("#UiBtnTakeFrontImage").on("click", function (e) {
            e.preventDefault();
            TomarFoto(function (imagen) {
                _this.imagenFrontalDelDocumentoDePago = imagen;
            }, function (mensajeDeError) {
                if (mensajeDeError !== "Camera cancelled.") {
                    notify(mensajeDeError);
                }
            });
        });
        $("#UiBtnTakeBackImage").on("click", function (e) {
            e.preventDefault();
            TomarFoto(function (imagen) {
                _this.imagenPosteriorDelDocumentoDePago = imagen;
            }, function (mensajeDeError) {
                if (mensajeDeError !== "Camera cancelled.") {
                    notify(mensajeDeError);
                }
            });
        });
        $("#UiCmbPaymentType").on("change", function (e) {
            e.preventDefault();
            _this.expandirContenedorDeInformacionDeTipoDePagoSeleccionado(e);
        });
        $("#UiOverdueInvoicePaymentDetailPage").on("click", "#UiBanckCheksDetail a", function (e) {
            var id = e.currentTarget.id;
            if (id) {
                _this.obtenerAutorizacionDeUsuarioParaEliminarPago(function () {
                    _this.eliminarPagoSeleccionado(id);
                });
            }
        });
        $("#UiOverdueInvoicePaymentDetailPage").on("click", "#UiDepositsDetail a", function (e) {
            var id = e.currentTarget.id;
            if (id) {
                _this.obtenerAutorizacionDeUsuarioParaEliminarPago(function () {
                    _this.eliminarPagoSeleccionado(id);
                });
            }
        });
        $("#UiOverdueInvoicePaymentDetailPage").on("click", "#UiCashDetail a", function (e) {
            var id = e.currentTarget.id;
            if (id) {
                _this.obtenerAutorizacionDeUsuarioParaEliminarPago(function () {
                    _this.eliminarPagoSeleccionado(id);
                });
            }
        });
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.expandirContenedorDeInformacionDeTipoDePagoSeleccionado = function (e) {
        var tipoDePagoSeleccionado = e.currentTarget
            .selectedOptions[0].value;
        var contenedorDeInformacionEnEfectivo = $("#InfoCashContainer");
        var contenedorDeInformacionDeDepositos = $("#InfoDepositsContainer");
        var contenedorDeInformacionDeCheques = $("#InfoBankChecksContainer");
        this.colapsarTodosLosContenedoresDeInformacionDePagos(contenedorDeInformacionEnEfectivo, contenedorDeInformacionDeCheques, contenedorDeInformacionDeDepositos);
        switch (tipoDePagoSeleccionado) {
            case TipoDePagoFacturaVencida.Cheque:
                contenedorDeInformacionDeCheques.collapsible("expand");
                this.cambiarVisualizacionDeContenedorDeCamposParaChequesODepositos(true);
                break;
            case TipoDePagoFacturaVencida.Efectivo:
                contenedorDeInformacionEnEfectivo.collapsible("expand");
                this.cambiarVisualizacionDeContenedorDeCamposParaChequesODepositos(false);
                break;
            case TipoDePagoFacturaVencida.Deposito:
                contenedorDeInformacionDeDepositos.collapsible("expand");
                this.cambiarVisualizacionDeContenedorDeCamposParaChequesODepositos(true);
                break;
            default:
                contenedorDeInformacionEnEfectivo.collapsible("expand");
                this.cambiarVisualizacionDeContenedorDeCamposParaChequesODepositos(false);
        }
        contenedorDeInformacionDeDepositos = null;
        contenedorDeInformacionDeCheques = null;
        contenedorDeInformacionEnEfectivo = null;
        tipoDePagoSeleccionado = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.colapsarTodosLosContenedoresDeInformacionDePagos = function (contenedorDeInformacionEnEfectivo, contenedorDeInformacionDeCheques, contenedorDeInformacionDeDepositos) {
        contenedorDeInformacionEnEfectivo.collapsible("collapse");
        contenedorDeInformacionDeDepositos.collapsible("collapse");
        contenedorDeInformacionDeCheques.collapsible("collapse");
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.cambiarVisualizacionDeContenedorDeCamposParaChequesODepositos = function (visualizar) {
        var contenedorDeCamposParaChequesODepositos = $("#BankCheckOrDepositContainer");
        var contenedorDeCamposParaEfectivo = $("#CashContainer");
        var campoDeMontoIngresadoEnEfectivo = $("#TxtCashAmount");
        var campoDeNumeroDeDocumentoDeChequeODeposito = $("#TxtBankCheckOrDepositNumber");
        if (visualizar) {
            contenedorDeCamposParaChequesODepositos.css("display", "block");
            contenedorDeCamposParaEfectivo.css("display", "none");
            campoDeNumeroDeDocumentoDeChequeODeposito.focus();
        }
        else {
            contenedorDeCamposParaChequesODepositos.css("display", "none");
            contenedorDeCamposParaEfectivo.css("display", "block");
            campoDeMontoIngresadoEnEfectivo.focus();
        }
        contenedorDeCamposParaChequesODepositos = null;
        contenedorDeCamposParaEfectivo = null;
        campoDeMontoIngresadoEnEfectivo = null;
        campoDeNumeroDeDocumentoDeChequeODeposito = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.cargarDatosIniciales = function () {
        var _this = this;
        var tipoDePago = $("#UiCmbPaymentType");
        tipoDePago.val(TipoDePagoFacturaVencida.Efectivo);
        tipoDePago.selectmenu("refresh", true);
        tipoDePago.trigger("change");
        tipoDePago = null;
        this.limpiarCamposDePagoDeChequeODeposito();
        this.limpiarCampoDePagoEnEfectivo();
        this.decimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this.configuracionDeDecimales = decimales;
            _this.cambiarVisualizacionDeContenedorDeCamposParaChequesODepositos(false);
            _this.calcularMontosDeLosDiferentesTiposDePagos();
            _this.generarListadoDeTiposDePagos();
        }, function (resultado) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            notify(resultado.mensaje);
        });
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.calcularMontosDeLosDiferentesTiposDePagos = function () {
        var montoEnEfectivo = 0;
        var montoEnDepositos = 0;
        var montoEnCheques = 0;
        var montoPagadoEnEfectivo = $("#UiLblCashPayedAmount");
        var montoPagadoEnDepositos = $("#UiLblDepositsPayedAmount");
        var montoPagadoEnCheques = $("#UiLblBankChecksPayedAmount");
        var montoTotalPagado = $("#UiLblTotalPayedAmount");
        this.detalleDeTiposDePagosRealizados.forEach(function (tipoDePagoEnFacturaVencida) {
            switch (tipoDePagoEnFacturaVencida.paymentType) {
                case TipoDePagoFacturaVencida.Efectivo:
                    montoEnEfectivo = tipoDePagoEnFacturaVencida.amount || 0;
                    break;
                case TipoDePagoFacturaVencida.Deposito:
                    montoEnDepositos += tipoDePagoEnFacturaVencida.amount;
                    break;
                case TipoDePagoFacturaVencida.Cheque:
                    montoEnCheques += tipoDePagoEnFacturaVencida.amount;
                    break;
            }
        });
        montoPagadoEnEfectivo.text(this.configuracionDeDecimales.currencySymbol + ". " + format_number(montoEnEfectivo, this.configuracionDeDecimales.defaultDisplayDecimals));
        montoPagadoEnDepositos.text(this.configuracionDeDecimales.currencySymbol + ". " + format_number(montoEnDepositos, this.configuracionDeDecimales.defaultDisplayDecimals));
        montoPagadoEnCheques.text(this.configuracionDeDecimales.currencySymbol + ". " + format_number(montoEnCheques, this.configuracionDeDecimales.defaultDisplayDecimals));
        montoTotalPagado.text(this.configuracionDeDecimales.currencySymbol + ". " + format_number(montoEnEfectivo + montoEnDepositos + montoEnCheques, this.configuracionDeDecimales.defaultDisplayDecimals));
        montoEnEfectivo = null;
        montoEnCheques = null;
        montoEnDepositos = null;
        montoPagadoEnDepositos = null;
        montoPagadoEnCheques = null;
        montoPagadoEnEfectivo = null;
        montoTotalPagado = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.irAPantalla = function (pantalla) {
        $.mobile.changePage("#" + pantalla, {
            transition: "pop",
            reverse: false,
            showLoadMsg: false
        });
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.validarPagoIngresado = function () {
        var tipoDePagoSeleccionado = $("#UiCmbPaymentType");
        switch (tipoDePagoSeleccionado.val()) {
            case TipoDePagoFacturaVencida.Efectivo:
                this.validarPagoEnEfectivo();
                break;
            case TipoDePagoFacturaVencida.Deposito:
                this.validarPagoConDepositoOCheque();
                break;
            case TipoDePagoFacturaVencida.Cheque:
                this.validarPagoConDepositoOCheque();
                break;
        }
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.validarPagoEnEfectivo = function () {
        var montoEnEfectivo = $("#TxtCashAmount");
        if (this.usuarioIngresoValorIncorrecto(montoEnEfectivo)) {
            notify("El monto ingresado es incorrecto, por favor, verifique y vuelva a intentar.");
            InteraccionConUsuarioServicio.desbloquearPantalla();
            montoEnEfectivo.focus();
        }
        else {
            this.agregarPagoEnEfectivo(montoEnEfectivo);
        }
        montoEnEfectivo = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.validarPagoConDepositoOCheque = function () {
        var numeroDeDocumento = $("#TxtBankCheckOrDepositNumber");
        var montoDelDocumento = $("#TxtBankCheckOrDepositAmount");
        var cuentaBancaria = $("#CmbBankAccount");
        if (this.usuarioNoIngresoNumeroDeDocumento(numeroDeDocumento)) {
            notify("Debe proporcionar el n\u00FAmero del comprobante de pago, por favor, verifique y vuelva a intentar");
            InteraccionConUsuarioServicio.desbloquearPantalla();
            numeroDeDocumento.focus();
            return;
        }
        if (this.imagenFrontalDelDocumentoDePago === "") {
            notify("Debe proporcionar, por lo menos, una im\u00E1gen frontal del comprobante de pago, por favor, verifique y vuelva a intentar");
            InteraccionConUsuarioServicio.desbloquearPantalla();
            numeroDeDocumento.focus();
            return;
        }
        if (cuentaBancaria.val() === "NULL") {
            notify("Debe seleccionar un banco, por favor, verifique y vuelva a intentar");
            InteraccionConUsuarioServicio.desbloquearPantalla();
            cuentaBancaria.focus();
            return;
        }
        if (this.usuarioIngresoValorIncorrecto(montoDelDocumento)) {
            notify("El monto ingresado es incorrecto, por favor, verifique y vuelva a intentar.");
            InteraccionConUsuarioServicio.desbloquearPantalla();
            montoDelDocumento.focus();
            return;
        }
        else {
            this.agregarPagoEnChequeODeposito(numeroDeDocumento, montoDelDocumento);
        }
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.usuarioIngresoValorIncorrecto = function (campoDePago) {
        return (campoDePago.val() === "" ||
            campoDePago.val() === "." ||
            campoDePago.val() === "," ||
            campoDePago.val() === "-" ||
            isNaN(campoDePago.val()));
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.usuarioNoIngresoNumeroDeDocumento = function (numeroDeDocumento) {
        return numeroDeDocumento.val() === "";
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.agregarPagoEnChequeODeposito = function (numeroDeDocumento, montoDelDocumento) {
        var tipoDePagoSeleccionado = $("#UiCmbPaymentType");
        var bancoSeleccionado = $("#CmbBankAccount");
        var pagoEnChequeODeposito = this
            .detalleDeTiposDePagosRealizados.find(function (tipoDePago) {
            return tipoDePago.documentNumber === numeroDeDocumento.val();
        });
        if (pagoEnChequeODeposito) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            notify("Ya existe el n\u00FAmero de documento en el detalle de pagos, por favor, verifique y vuelva a intentar.");
            numeroDeDocumento.focus();
            return;
        }
        else {
            var pago = new TipoDePagoEnFacturaVencida();
            pago.paymentType = tipoDePagoSeleccionado.val();
            pago.amount = parseFloat(montoDelDocumento.val());
            pago.documentNumber = numeroDeDocumento.val();
            pago.bankName = bancoSeleccionado.val();
            pago.frontImage = this.imagenFrontalDelDocumentoDePago;
            pago.backImage = this.imagenPosteriorDelDocumentoDePago;
            this.detalleDeTiposDePagosRealizados.push(pago);
        }
        this.calcularMontosDeLosDiferentesTiposDePagos();
        InteraccionConUsuarioServicio.desbloquearPantalla();
        this.limpiarCamposDePagoDeChequeODeposito();
        numeroDeDocumento.focus();
        this.generarListadoDeTiposDePagos();
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.agregarPagoEnEfectivo = function (montoEnEfectivo) {
        var pagoEnEfectivo = this
            .detalleDeTiposDePagosRealizados.find(function (tipoDePago) {
            return tipoDePago.paymentType === TipoDePagoFacturaVencida.Efectivo;
        });
        if (pagoEnEfectivo) {
            for (var i = 0; i < this.detalleDeTiposDePagosRealizados.length; i++) {
                var tipoDePago = this.detalleDeTiposDePagosRealizados[i];
                if (tipoDePago.paymentType === TipoDePagoFacturaVencida.Efectivo) {
                    tipoDePago.amount = parseFloat(montoEnEfectivo.val());
                    break;
                }
            }
        }
        else {
            var pago = new TipoDePagoEnFacturaVencida();
            pago.paymentType = TipoDePagoFacturaVencida.Efectivo;
            pago.amount = parseFloat(montoEnEfectivo.val());
            this.detalleDeTiposDePagosRealizados.push(pago);
        }
        this.calcularMontosDeLosDiferentesTiposDePagos();
        InteraccionConUsuarioServicio.desbloquearPantalla();
        montoEnEfectivo.val("");
        montoEnEfectivo.focus();
        this.generarListadoDeTiposDePagos();
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.obtenerAutorizacionDeUsuarioParaProcesarPago = function (callback) {
        navigator.notification.confirm("¿Está seguro de aplicar el pago actual?", function (buttonIndex) {
            if (buttonIndex === BotonSeleccionado.Si) {
                InteraccionConUsuarioServicio.bloquearPantalla();
                callback();
            }
        }, "Sonda\u00AE " + SondaVersion, ["No", "Si"]);
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.obtenerAutorizacionDeUsuarioParaEliminarPago = function (callback) {
        navigator.notification.confirm("¿Está seguro de eliminar el pago seleccionado?", function (buttonIndex) {
            if (buttonIndex === BotonSeleccionado.Si) {
                InteraccionConUsuarioServicio.bloquearPantalla();
                callback();
            }
        }, "Sonda\u00AE " + SondaVersion, ["No", "Si"]);
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.limpiarCamposDePagoDeChequeODeposito = function () {
        var numeroDeDocumento = $("#TxtBankCheckOrDepositNumber");
        var montoDelDocumento = $("#TxtBankCheckOrDepositAmount");
        numeroDeDocumento.val("");
        montoDelDocumento.val("");
        this.imagenFrontalDelDocumentoDePago = "";
        this.imagenPosteriorDelDocumentoDePago = "";
        numeroDeDocumento = null;
        montoDelDocumento = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.generarListadoDeCuentasBancarias = function () {
        var contenedorDeCuentasBancarias = $("#CmbBankAccount");
        contenedorDeCuentasBancarias.children().remove("option");
        contenedorDeCuentasBancarias.selectmenu("refresh", true);
        obtenerCuentasDeBancos(function (cuentasDeBanco) {
            cuentasDeBanco.forEach(function (cuentaBancaria, posicion) {
                if (posicion === 0) {
                    contenedorDeCuentasBancarias.append("<option value=\"NULL\" selected=\"selected\">Seleccionar...</option>");
                }
                contenedorDeCuentasBancarias.append($("<option>", {
                    value: "" + cuentaBancaria.banco,
                    text: "" + cuentaBancaria.banco
                }));
            });
            contenedorDeCuentasBancarias.selectmenu("refresh", true);
        }, function (resultado) {
            notify(resultado.message);
        });
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.generarListadoDeTiposDePagos = function () {
        this.generarListadoDeCuentasBancarias();
        this.limpiarListadosDeTiposDePagos();
        var pagoEnEfectivo = this.detalleDeTiposDePagosRealizados.filter(function (tipoDePago) {
            return tipoDePago.paymentType === TipoDePagoFacturaVencida.Efectivo;
        });
        var pagoEnDepositos = this.detalleDeTiposDePagosRealizados.filter(function (tipoDePago) {
            return tipoDePago.paymentType === TipoDePagoFacturaVencida.Deposito;
        });
        var pagoEnCheques = this.detalleDeTiposDePagosRealizados.filter(function (tipoDePago) {
            return tipoDePago.paymentType === TipoDePagoFacturaVencida.Cheque;
        });
        if (pagoEnEfectivo && pagoEnEfectivo.length > 0) {
            this.generarListadoDePagoEnEfectivo(pagoEnEfectivo);
        }
        if (pagoEnDepositos && pagoEnDepositos.length > 0) {
            this.generarListadoDePagoEnDepositos(pagoEnDepositos);
        }
        if (pagoEnCheques && pagoEnCheques.length > 0) {
            this.generarListadoDePagoEnCheques(pagoEnCheques);
        }
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.generarListadoDePagoEnEfectivo = function (pagoEnEfectivo) {
        var _this = this;
        var contenedorEfectivo = $("#UiCashDetail");
        var pagosEfectivo = [];
        pagoEnEfectivo.forEach(function (pago) {
            pagosEfectivo.push(" <li>");
            pagosEfectivo.push(" <a href=\"#\">");
            pagosEfectivo.push(" <h1>" + _this.configuracionDeDecimales.currencySymbol + ". " + format_number(pago.amount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "</h1>");
            pagosEfectivo.push(" </a>");
            pagosEfectivo.push(" <a href=\"#\" id=\"" + pago.paymentType + "|0\"></a>");
            pagosEfectivo.push(" </li>");
        });
        var cadenaHtmlDeObjetoAInsertar = pagosEfectivo.join("");
        if (cadenaHtmlDeObjetoAInsertar !== "") {
            contenedorEfectivo.append(cadenaHtmlDeObjetoAInsertar);
            contenedorEfectivo.listview("refresh");
        }
        contenedorEfectivo = null;
        pagosEfectivo.length = 0;
        pagosEfectivo = null;
        cadenaHtmlDeObjetoAInsertar = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.generarListadoDePagoEnDepositos = function (pagoEnDepositos) {
        var _this = this;
        var contenedorDepositos = $("#UiDepositsDetail");
        var pagosEnDeposito = [];
        pagoEnDepositos.forEach(function (pago) {
            pagosEnDeposito.push(_this.obtenerCadenaHtmlDePagoEnChequeODeposito(pago));
        });
        var cadenaHtmlDeObjetoAInsertar = pagosEnDeposito.join("");
        if (cadenaHtmlDeObjetoAInsertar !== "") {
            contenedorDepositos.append(cadenaHtmlDeObjetoAInsertar);
            contenedorDepositos.listview("refresh");
        }
        contenedorDepositos = null;
        pagosEnDeposito.length = 0;
        pagosEnDeposito = null;
        cadenaHtmlDeObjetoAInsertar = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.generarListadoDePagoEnCheques = function (pagoEnCheques) {
        var _this = this;
        var contenedorCheques = $("#UiBanckCheksDetail");
        var pagosEnCheque = [];
        pagoEnCheques.forEach(function (pago) {
            pagosEnCheque.push(_this.obtenerCadenaHtmlDePagoEnChequeODeposito(pago));
        });
        var cadenaHtmlDeObjetoAInsertar = pagosEnCheque.join("");
        if (cadenaHtmlDeObjetoAInsertar !== "") {
            contenedorCheques.append(cadenaHtmlDeObjetoAInsertar);
            contenedorCheques.listview("refresh");
        }
        contenedorCheques = null;
        pagosEnCheque.length = 0;
        pagosEnCheque = null;
        cadenaHtmlDeObjetoAInsertar = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.obtenerCadenaHtmlDePagoEnChequeODeposito = function (pago) {
        var html = [];
        html.push(" <li>");
        html.push(" <a href=\"#\">");
        html.push(" <label>" + pago.documentNumber + " </label>");
        html.push("<span class=\"small-roboto ui-li-count\">" + this.configuracionDeDecimales.currencySymbol + ". " + format_number(pago.amount, this.configuracionDeDecimales.defaultDisplayDecimals) + "</span>");
        html.push(" <label>" + pago.bankName + "</label>");
        html.push(" </a>");
        html.push(" <a href=\"#\" id=\"" + pago.paymentType + "|" + pago.documentNumber + "\"></a>");
        html.push(" </li>");
        return html.join("");
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.limpiarListadosDeTiposDePagos = function () {
        var contenedorEfectivo = $("#UiCashDetail");
        var contenedorDepositos = $("#UiDepositsDetail");
        var contenedorCheques = $("#UiBanckCheksDetail");
        contenedorEfectivo.children().remove("li");
        contenedorDepositos.children().remove("li");
        contenedorCheques.children().remove("li");
        contenedorEfectivo = null;
        contenedorCheques = null;
        contenedorDepositos = null;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.eliminarPagoSeleccionado = function (id) {
        var tipoDePago = id.toString().split("|")[0];
        var numeroDeDocumento = id.toString().split("|")[1];
        if (tipoDePago === TipoDePagoFacturaVencida.Efectivo.toString()) {
            for (var i = 0; i < this.detalleDeTiposDePagosRealizados.length; i++) {
                var pago = this
                    .detalleDeTiposDePagosRealizados[i];
                if (pago.paymentType === TipoDePagoFacturaVencida.Efectivo) {
                    this.detalleDeTiposDePagosRealizados.splice(i, 1);
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < this.detalleDeTiposDePagosRealizados.length; i++) {
                var pago = this
                    .detalleDeTiposDePagosRealizados[i];
                if (pago.paymentType.toString() === tipoDePago &&
                    pago.documentNumber === numeroDeDocumento) {
                    this.detalleDeTiposDePagosRealizados.splice(i, 1);
                    break;
                }
            }
        }
        this.calcularMontosDeLosDiferentesTiposDePagos();
        this.generarListadoDeTiposDePagos();
        InteraccionConUsuarioServicio.desbloquearPantalla();
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.enviarInformacionDeDetalleDePagos = function (callback) {
        var mensaje = new DetalleDeTipoDePagoMensaje(this);
        mensaje.detalleDePagosRealizados = this.detalleDeTiposDePagosRealizados;
        this.mensajero.publish(mensaje, getType(DetalleDeTipoDePagoMensaje));
        callback();
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.detalleDePagosDelDocumentoActualEntregados = function (message, subscriber) {
        subscriber.detalleDeTiposDePagosRealizados =
            message.detalleDePagosRealizados;
    };
    TipoDePagoEnFacturaVencidaControlador.prototype.limpiarCampoDePagoEnEfectivo = function () {
        var montoEnEfectivo = $("#TxtCashAmount");
        montoEnEfectivo.val("");
        montoEnEfectivo = null;
    };
    return TipoDePagoEnFacturaVencidaControlador;
}());
//# sourceMappingURL=TipoDePagoEnFacturaVencidaControlador.js.map