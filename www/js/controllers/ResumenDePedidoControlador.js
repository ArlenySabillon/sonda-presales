var ResumenDePedidoControlador = (function () {
    function ResumenDePedidoControlador(mensajero) {
        this.mensajero = mensajero;
        this.manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.ordenDeVentaServicio = new OrdenDeVentaServicio();
        this.promoServicio = new PromoServicio();
        this.tareaServicio = new TareaServcio();
        this.pagoServicio = new PagoServicio();
        this.bonoServicio = new BonoServicio();
        this.encuestaServicio = new EncuestaServicio();
        this.listaDeSkuDeVenta = [];
        this.listaSkuOrdenDeVentaPrincipal = [];
        this.listaDeOrdnesDeVEntaCf = [];
        this.listaDeSkuParaBonificacionParaOrdenDeVenta = [];
        this.listaDeSkuParaBonificacion = [];
        this.listaDeSkuParaBonificacionDeCombo = [];
        this.listaDeBonificacionesPorMontoGeneral = new Array();
        this.usuarioPuedeModificarBonificacionDeCombo = false;
        this.esOrdenDeVentaParaCobrar = false;
        this.seCreoTareaAceptada = false;
        this.obtuboGps = false;
        this.isImpresoraZebra = localStorage.getItem("isPrinterZebra") === "1";
        this.firma = null;
        this.foto = null;
        this.formatoDeOrdenDeVenta = "";
        this.formatoDePago = "";
        this.listaDeDescuentoPorMontoGeneralYFamilia = [];
        this.listaDeDescuentoPorFamiliaYTipoPago = [];
        this.listaDeOrdenAplicarDescuentos = [];
        this.tokenPago = mensajero.subscribe(this.pagoEntregado, getType(PagoMensaje), this);
        this.tokenFirma = mensajero.subscribe(this.firmaEntregado, getType(FirmaMensaje), this);
    }
    ResumenDePedidoControlador.prototype.delegarResumenDePedidoControlador = function () {
        var este = this;
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "SalesOrderSummaryPage") {
                este.cliente = data.options.data.cliente;
                este.tarea = data.options.data.tarea;
                este.configuracionDecimales = data.options.data.configuracionDecimales;
                este.listaDeSkuDeVenta = data.options.data.listaSku;
                este.listaDeSkuParaBonificacion =
                    data.options.data.listaDeSkuParaBonificacion;
                este.listaDeSkuParaBonificacionDeCombo =
                    data.options.data.listaDeSkuParaBonificacionDeCombo;
                este.usuarioPuedeModificarBonificacionDeCombo =
                    data.options.data.usuarioPuedeModificarBonificacionDeCombo;
                este.listaDeBonificacionesPorMontoGeneral =
                    data.options.data.listaDeBonificacionesPorMontoGeneral;
                este.listaDeDescuentoPorMontoGeneralYFamilia =
                    data.options.data.listaDeDescuentoPorMontoGeneralYFamilia;
                este.listaDeDescuentoPorFamiliaYTipoPago =
                    data.options.data.listaDeDescuentoPorFamiliaYTipoPago;
                este.listaDeOrdenAplicarDescuentos =
                    data.options.data.listaDeOrdenAplicarDescuentos;
                $.mobile.changePage("#SalesOrderSummaryPage");
            }
        });
        $("#SalesOrderSummaryPage").on("pageshow", function () {
            este.cargarPantalla();
        });
        $("#uiFirmaResumen").bind("touchstart", function () {
            este.publicarFirma(function () {
                $.mobile.changePage("#UiUserSignaturPage");
            });
        });
        $("#uiFotoResumen").bind("touchstart", function () {
            cordova.plugins.diagnostic.isCameraAuthorized(function (enabled) {
                if (enabled) {
                    TomarFoto(function (fotografia) {
                        este.establecerFoto(fotografia);
                    }, function (op) {
                        notify(op.toString());
                    });
                }
                else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(function (authorization) {
                        if (authorization === "DENIED") {
                            cordova.plugins.diagnostic.switchToSettings(function () {
                                ToastThis("Debe autorizar el uso de la Cámara para poder leer el Código.");
                            }, function (error) {
                                console.log(error);
                            });
                        }
                        else if (authorization === "GRANTED") {
                            TomarFoto(function (fotografia) {
                                este.establecerFoto(fotografia);
                            }, function (op) {
                                notify(op.toString());
                            });
                        }
                        else {
                            cordova.plugins.diagnostic.switchToSettings(function () {
                                ToastThis("Debe autorizar el uso de la Cámara para poder leer el Código.");
                            }, function (error) {
                                console.log(error);
                            });
                        }
                    }, function (error) {
                        notify(error);
                    });
                }
            }, function (error) {
                notify(error);
            });
        });
        $("#uiImprimirResumen").bind("touchstart", function () {
            este.usuarioDeseaImprimirOrdenDeVenta();
        });
        $("#uiGuardarResumen").bind("touchstart", function () {
            este.usuarioDeseaFinalizarOrdenDeVenta();
        });
        $("#UiBotonFormaDePago").bind("touchstart", function () {
            este.usuarioDeseaSeleccionarFormaDePago();
        });
    };
    ResumenDePedidoControlador.prototype.obtenerConfiguracionDeDecimales = function () {
        var _this = this;
        this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this.configuracionDecimales = decimales;
        }, function (operacion) {
            notify(operacion.mensaje);
        });
    };
    ResumenDePedidoControlador.prototype.pagoEntregado = function (mensaje, subcriber) {
        subcriber.pago = mensaje.pago;
        var uiBotonDeFormaDePago = $("#UiBotonFormaDePago");
        if (subcriber.pago === null || subcriber.pago === undefined) {
            uiBotonDeFormaDePago.text("Efectivo");
        }
        else {
            switch (subcriber.pago.tipoDePago) {
                case TipoDePago.Efectivo.toString():
                    uiBotonDeFormaDePago.text("Efectivo");
                    break;
                case TipoDePago.Cheque.toString():
                    uiBotonDeFormaDePago.text("Cheque");
                    break;
            }
        }
        uiBotonDeFormaDePago = null;
    };
    ResumenDePedidoControlador.prototype.firmaEntregado = function (mensaje, subcriber) {
        subcriber.firma = mensaje.firma;
        subcriber.origen = mensaje.origen;
    };
    ResumenDePedidoControlador.prototype.establecerFoto = function (fotografia) {
        this.foto = fotografia;
    };
    ResumenDePedidoControlador.prototype.preguntarSiSeImprimeOrdenDeVenta = function (formatoDeOrdenDeVenta, callback, callbackError) {
        var _this = this;
        DesBloquearPantalla();
        navigator.notification.confirm("Desea imprimir la orden de venta?", function (respuesta) {
            if (respuesta === 2) {
                _this.imprimio = true;
                my_dialog("", "", "close");
                my_dialog("Espere...", "validando impresora", "open");
                var impresionServicio = new ImpresionServicio();
                var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formatoDeOrdenDeVenta, true, function (resultado) {
                    if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                        callback();
                    }
                    else {
                        callbackError({
                            codigo: -1,
                            mensaje: resultado.mensaje
                        });
                    }
                });
            }
            else {
                callback();
            }
        }, "Sonda® " + SondaVersion, "No,Si");
    };
    ResumenDePedidoControlador.prototype.cargarInformacionResumen = function (callback) {
        var uiLblCodigoClienteResumen = $("#UiLblCodigoClienteResumen");
        uiLblCodigoClienteResumen.text(this.cliente.clientId);
        uiLblCodigoClienteResumen = null;
        var uiLblNombreClienteResumen = $("#UiLblNombreClienteResumen");
        uiLblNombreClienteResumen.text(this.cliente.clientName);
        uiLblNombreClienteResumen = null;
        var uiLblDireccionClienteResumen = $("#UiLblDireccionClienteResumen");
        uiLblDireccionClienteResumen.text(this.cliente.address);
        uiLblDireccionClienteResumen = null;
        var uiLblTelefonoResumen = $("#UiLblTelefonoResumen");
        uiLblTelefonoResumen.text(this.cliente.phone);
        uiLblTelefonoResumen = null;
        var uiLblContactoResumen = $("#UiLblContactoResumen");
        uiLblContactoResumen.text(this.cliente.contactCustomer);
        uiLblContactoResumen = null;
        var uiLblFechaEntregaResumen = $("#UiLblFechaEntregaResumen");
        uiLblFechaEntregaResumen.text(this.cliente.deliveryDate === undefined
            ? "..."
            : this.cliente.deliveryDate.toString());
        uiLblFechaEntregaResumen = null;
        var uiLblTotalResumen = $("#UiLblTotalResumen");
        uiLblTotalResumen.text(format_number(this.obtenerTotalDeOrdenDeVenta(this.cliente.appliedDiscount, this.listaDeSkuDeVenta), this.configuracionDecimales.defaultDisplayDecimals));
        uiLblTotalResumen = null;
        var uiTxtComentarioResumen = $("#UiTxtComentarioResumen");
        uiTxtComentarioResumen.val(this.cliente.salesComment);
        uiTxtComentarioResumen = null;
        var uiListaFormaDePago = $("#UiListaFormaDePago");
        uiListaFormaDePago.hide();
        if (this.esOrdenDeVentaParaCobrar) {
            if (this.cargaPrimeraVez) {
                notify("Debe de cobrar la orden de venta");
                this.cargaPrimeraVez = false;
            }
            uiListaFormaDePago.show();
            this.mostrarTipoDePago();
        }
        uiListaFormaDePago = null;
        callback();
    };
    ResumenDePedidoControlador.prototype.mostrarTipoDePago = function () {
        var uiBotonDeFormaDePago = $("#UiBotonFormaDePago");
        try {
            if (this.pago === null || this.pago === undefined) {
                uiBotonDeFormaDePago.text("Efectivo");
            }
            else {
                switch (this.pago.pagoDetalle[0].paymentType) {
                    case TipoDePago.Efectivo.toString():
                        uiBotonDeFormaDePago.text("Efectivo");
                        break;
                    case TipoDePago.Cheque.toString():
                        uiBotonDeFormaDePago.text("Cheque");
                        break;
                }
            }
        }
        catch (ex) {
            notify("Error al mostrar el tipo de pago: " + ex.message);
        }
        uiBotonDeFormaDePago = null;
    };
    ResumenDePedidoControlador.prototype.cargarSkus = function (callback) {
        try {
            var uiListaOrdenDeVenta = $("#UiListaSkuResumen");
            uiListaOrdenDeVenta.children().remove("li");
            var i = 0;
            var sku_1 = new Sku();
            var listaDeLi_1 = [];
            for (i = 0; i < this.listaDeSkuDeVenta.length; i++) {
                sku_1 = this.listaDeSkuDeVenta[i];
                var resultadoDescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
                var resultadoDescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
                if (!sku_1.isUniqueDiscountScale) {
                    resultadoDescuentoPorMontoGeneralYFamilia = this
                        .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                        return descuentoABuscar.codeFamily === sku_1.codeFamilySku;
                    });
                    resultadoDescuentoPorFamiliaYTipoPago = this
                        .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                        return descuentoABuscar.codeFamily === sku_1.codeFamilySku;
                    });
                }
                var total = sku_1.totalCD;
                if (sku_1.dimensions.length > 0) {
                    for (var _i = 0, _a = sku_1.dimensions; _i < _a.length; _i++) {
                        var skuConDimension = _a[_i];
                        listaDeLi_1.push("<li data-icon='false' class='ui-field-contain'>");
                        listaDeLi_1.push("<p><h4>" + sku_1.sku + "/" + sku_1.skuName + "</h4></p>");
                        listaDeLi_1.push("<p>");
                        listaDeLi_1.push("<b>UM: </b><span>" + sku_1.codePackUnit + " </span>");
                        listaDeLi_1.push("<b> Cant: </b><span>" + skuConDimension.qtySku + " </span>");
                        listaDeLi_1.push("<br/><b>Pre: </b><span>" + format_number(sku_1.cost, this.configuracionDecimales.defaultDisplayDecimals) + " </span>");
                        if (sku_1.discount !== 0) {
                            listaDeLi_1.push("<b> Des: </b><span>" + format_number(sku_1.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>");
                            listaDeLi_1.push("<b> Total: </b><span>" + format_number(sku_1.total, this.configuracionDecimales.defaultDisplayDecimals) + " </span>");
                            listaDeLi_1.push("<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(total, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>");
                        }
                        else {
                            listaDeLi_1.push("<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(skuConDimension.total, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>");
                        }
                        listaDeLi_1.push("<b>Dimensi\u00F3n: </b><span>" + format_number(skuConDimension.dimensionSku, this.configuracionDecimales.defaultDisplayDecimals) + "</span>");
                        listaDeLi_1.push("</p>");
                    }
                }
                else {
                    listaDeLi_1.push("<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>");
                    listaDeLi_1.push("<p><h4>" + sku_1.sku + "/" + sku_1.skuName + "</h4></p>");
                    listaDeLi_1.push("<p>");
                    listaDeLi_1.push("<b>UM: </b><span>" + sku_1.codePackUnit + " </span>");
                    listaDeLi_1.push("<b> Cant: </b><span>" + sku_1.qty + " </span>");
                    listaDeLi_1.push("<br/><b>Pre: </b><span>" + format_number(sku_1.cost, this.configuracionDecimales.defaultDisplayDecimals) + " </span>");
                    if (sku_1.discount !== 0) {
                        switch (sku_1.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                listaDeLi_1.push("<b> Des: </b><span>" + format_number(sku_1.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>");
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                listaDeLi_1.push("<b> Des: </b><span>" + DarFormatoAlMonto(format_number(sku_1.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>");
                                break;
                        }
                        if (resultadoDescuentoPorMontoGeneralYFamilia &&
                            !sku_1.isUniqueDiscountScale) {
                            switch (resultadoDescuentoPorMontoGeneralYFamilia.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaDeLi_1.push("<br/><b> DMF: </b><span>" + format_number(resultadoDescuentoPorMontoGeneralYFamilia.discount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaDeLi_1.push("<br/><b> DMF: </b><span>" + DarFormatoAlMonto(format_number(resultadoDescuentoPorMontoGeneralYFamilia.discount, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>");
                                    break;
                            }
                        }
                        if (resultadoDescuentoPorFamiliaYTipoPago &&
                            !sku_1.isUniqueDiscountScale) {
                            switch (resultadoDescuentoPorFamiliaYTipoPago.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaDeLi_1.push("<br/><b> DFT: </b><span>" + format_number(resultadoDescuentoPorFamiliaYTipoPago.discount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaDeLi_1.push("<br/><b> DFT: </b><span>" + DarFormatoAlMonto(format_number(resultadoDescuentoPorFamiliaYTipoPago.discount, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>");
                                    break;
                            }
                        }
                        listaDeLi_1.push("<b> Total: </b><span>" + format_number(sku_1.total, this.configuracionDecimales.defaultDisplayDecimals) + " </span>");
                        listaDeLi_1.push("<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(total, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>");
                    }
                    else {
                        if (resultadoDescuentoPorMontoGeneralYFamilia &&
                            !sku_1.isUniqueDiscountScale) {
                            switch (resultadoDescuentoPorMontoGeneralYFamilia.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaDeLi_1.push("<br/><b> DMF: </b><span>" + format_number(resultadoDescuentoPorMontoGeneralYFamilia.discount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaDeLi_1.push("<br/><b> DMF: </b><span>" + DarFormatoAlMonto(format_number(resultadoDescuentoPorMontoGeneralYFamilia.discount, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>");
                                    break;
                            }
                            if (!resultadoDescuentoPorFamiliaYTipoPago) {
                                listaDeLi_1.push("<b> Total: </b><span>" + format_number(sku_1.total, this.configuracionDecimales.defaultDisplayDecimals) + " </span>");
                            }
                        }
                        if (resultadoDescuentoPorFamiliaYTipoPago &&
                            !sku_1.isUniqueDiscountScale) {
                            switch (resultadoDescuentoPorFamiliaYTipoPago.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaDeLi_1.push("<br/><b> DFT: </b><span>" + format_number(resultadoDescuentoPorFamiliaYTipoPago.discount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaDeLi_1.push("<br/><b> DFT: </b><span>" + DarFormatoAlMonto(format_number(resultadoDescuentoPorFamiliaYTipoPago.discount, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>");
                                    break;
                            }
                            listaDeLi_1.push("<b> Total: </b><span>" + format_number(sku_1.total, this.configuracionDecimales.defaultDisplayDecimals) + " </span>");
                        }
                        listaDeLi_1.push("<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(total, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>");
                    }
                    if (sku_1.dimension > 0) {
                        listaDeLi_1.push("<b>DIM: </b><span>" + format_number(sku_1.dimension, this.configuracionDecimales.defaultDisplayDecimals) + "</span>");
                    }
                    listaDeLi_1.push("</p>");
                }
            }
            this.listaDeSkuParaBonificacionParaOrdenDeVenta.map(function (skuBonificacion) {
                listaDeLi_1.push("<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>");
                listaDeLi_1.push("<p><h4>" + skuBonificacion.sku + "/" + (skuBonificacion.skuName = ""
                    ? skuBonificacion.skuDescription
                    : skuBonificacion.skuName) + "</h4></p>");
                listaDeLi_1.push("<p>");
                listaDeLi_1.push("<b>UM: </b><span>" + skuBonificacion.codePackUnit + " </span>");
                listaDeLi_1.push("<b> Cantidad: </b><span>" + skuBonificacion.qty + " </span>");
                listaDeLi_1.push("</p>");
            });
            uiListaOrdenDeVenta.append(listaDeLi_1.join(""));
            uiListaOrdenDeVenta.listview("refresh");
            uiListaOrdenDeVenta = null;
            callback();
        }
        catch (err) {
            notify("Error al generar la lista de orden de venta: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.obtenerTotalDeOrdenDeVenta = function (descuento, _listaDeSku) {
        var total = 0;
        total = this.tarea.salesOrderTotal;
        total = descuento !== 0 ? total - (descuento * total) / 100 : total;
        return total;
    };
    ResumenDePedidoControlador.prototype.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo = function (bonosNormales, listaDeBonificacionesPorMontoGeneral, bonosPorCombo, callback, errCallback) {
        var _this = this;
        try {
            bonosPorCombo.map(function (bono, index, array) {
                if (!bono.isConfig) {
                    if (!_this.usuarioPuedeModificarBonificacionDeCombo ||
                        localStorage.getItem("USE_MAX_BONUS") === "1") {
                        if (bono.bonusSubType ===
                            SubTipoDeBonificacionPorCombo.Multiple.toString() ||
                            (bono.bonusSubType ===
                                SubTipoDeBonificacionPorCombo.Unica.toString() &&
                                bono.skusDeBonoPorCombo.length === 1)) {
                            bono.skusDeBonoPorComboAsociados = bono.skusDeBonoPorCombo;
                            bono.isConfig = true;
                            bono.isEmpty = false;
                        }
                    }
                }
            });
            bonosPorCombo.map(function (bonoPorCombo) {
                bonoPorCombo.skusDeBonoPorComboAsociados.map(function (skuDeBonoPorCombo) {
                    var bono = bonosNormales.find(function (bonoNormal) {
                        return (bonoNormal.sku === skuDeBonoPorCombo.codeSku &&
                            bonoNormal.codePackUnit === skuDeBonoPorCombo.codePackUnit);
                    });
                    if (bono) {
                        bono.qty += skuDeBonoPorCombo.selectedQty;
                    }
                    else {
                        var skuBonificacionNuevo = new Sku();
                        skuBonificacionNuevo.sku = skuDeBonoPorCombo.codeSku;
                        skuBonificacionNuevo.codePackUnit =
                            skuDeBonoPorCombo.codePackUnit;
                        skuBonificacionNuevo.skuDescription =
                            skuDeBonoPorCombo.descriptionSku;
                        skuBonificacionNuevo.skuName = skuDeBonoPorCombo.descriptionSku;
                        skuBonificacionNuevo.qty = skuDeBonoPorCombo.selectedQty;
                        skuBonificacionNuevo.owner = skuDeBonoPorCombo.owner;
                        skuBonificacionNuevo.ownerId = skuDeBonoPorCombo.ownerId;
                        bonosNormales.push(skuBonificacionNuevo);
                    }
                });
            });
            listaDeBonificacionesPorMontoGeneral.map(function (bonoPorMontoGeneral) {
                var bono = bonosNormales.find(function (bonoNormal) {
                    return (bonoNormal.sku === bonoPorMontoGeneral.codeSkuBonus &&
                        bonoNormal.codePackUnit === bonoPorMontoGeneral.codePackUnitBonus);
                });
                if (bono) {
                    bono.qty += bonoPorMontoGeneral.bonusQty;
                }
                else {
                    var skuBonificacionNuevo = new Sku();
                    skuBonificacionNuevo.sku = bonoPorMontoGeneral.codeSkuBonus;
                    skuBonificacionNuevo.codePackUnit =
                        bonoPorMontoGeneral.codePackUnitBonus;
                    skuBonificacionNuevo.skuDescription =
                        bonoPorMontoGeneral.skuNameBonus;
                    skuBonificacionNuevo.qty = bonoPorMontoGeneral.bonusQty;
                    skuBonificacionNuevo.owner = bonoPorMontoGeneral.owner;
                    skuBonificacionNuevo.ownerId = bonoPorMontoGeneral.ownerId;
                    bonosNormales.push(skuBonificacionNuevo);
                }
            });
            callback(bonosNormales);
        }
        catch (e) {
            errCallback({
                codigo: -1,
                mensaje: "1-Error al unir bonificaciones del pedido: " + e.message
            });
        }
    };
    ResumenDePedidoControlador.prototype.usuarioDeseaFinalizarOrdenDeVenta = function () {
        var _this = this;
        try {
            var mensaje = "Desea dar por finalizada la orden de venta?";
            var formaDePago = "";
            if (this.pago === null || this.pago === undefined) {
                formaDePago = "Efectivo";
            }
            else {
                switch (this.pago.pagoDetalle[0].paymentType) {
                    case TipoDePago.Efectivo.toString():
                        formaDePago = "Efectivo";
                        break;
                    case TipoDePago.Cheque.toString():
                        formaDePago = "Cheque";
                        break;
                }
            }
            if (this.esOrdenDeVentaParaCobrar) {
                mensaje =
                    "El Monto del pedido es Q." +
                        format_number(this.cliente.totalAmout, this.configuracionDecimales.defaultDisplayDecimals) +
                        " y es pagado en " +
                        formaDePago +
                        ", " +
                        mensaje;
            }
            navigator.notification.confirm(mensaje, function (buttonIndex) {
                if (buttonIndex === 2) {
                    _this.seguirProcesoDeCrearOrdenDeVenta(_this.firma, _this.foto);
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        catch (err) {
            notify("Error al mostrar finalizar la orden de venta: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.validarPedidoTipoCobro = function (callback) {
        var _this = this;
        this.tareaServicio.obtenerRegla("CobrarOrdenDeVenta", function (listaDeReglas) {
            if (listaDeReglas.length > 0 &&
                listaDeReglas[0].enabled.toUpperCase() === "SI") {
                _this.esOrdenDeVentaParaCobrar = true;
                callback();
            }
            else {
                callback();
            }
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    ResumenDePedidoControlador.prototype.seguirProcesoDeCrearOrdenDeVenta = function (firma, foto) {
        var _this = this;
        if (this.fotoObligatoria) {
            if (foto == undefined || foto === "") {
                notify("Debe de tomar una fotografia antes de finalizar la orden de venta.");
                return;
            }
        }
        if (this.firmaObligatoria) {
            if (firma == undefined || firma === "") {
                notify("Debe de firmar el documento antes de finalizar la orden de venta.");
                return;
            }
        }
        my_dialog("Creando orden de venta", "Espere...", "open");
        BloquearPantalla();
        this.crearTareaParaOrdeDeVenta(function (taskId) {
            _this.tarea.taskId = taskId;
            if (_this.tarea.taskType === TareaTipo.Preventa) {
                _this.procesarOrdenDeVenta(firma, foto, SiNo.Si, function (ordenDeVenta) {
                    _this.ordenDeVenta = ordenDeVenta;
                    _this.obtenerPago(function (pago) {
                        pago.pagoDetalle[0].sourceDocSerie = ordenDeVenta.docSerie;
                        pago.pagoDetalle[0].sourceDocNum = ordenDeVenta.docNum;
                        _this.pagoServicio.guardarPago(pago, _this.esOrdenDeVentaParaCobrar, function (pagoGuardado) {
                            _this.pago = pagoGuardado;
                            var cerrarDocumentoDeCliente = function (formatoOrdenDeventa, formatoPago) {
                                var encuestasAEjecutarEnFinalizacionDeTarea = _this.encuestaServicio.filtrarEncuestasPorDisparador(_this.tarea.microsurveys, DisparadorDeEncuesta.FinDeTarea);
                                if (encuestasAEjecutarEnFinalizacionDeTarea &&
                                    encuestasAEjecutarEnFinalizacionDeTarea.length > 0) {
                                    _this.encuestaServicio.procesarEncuestasDeCliente(encuestasAEjecutarEnFinalizacionDeTarea, 0, _this.tarea.hasDraft, function () {
                                        _this.usuarioDeseaCerrarDocumento(formatoOrdenDeventa, formatoPago);
                                    }, function (error) {
                                        DesBloquearPantalla();
                                        notify(error.mensaje);
                                        my_dialog("", "", "close");
                                        RegresarAPaginaAnterior("pickupplan_page");
                                    });
                                    BloquearPantalla();
                                    var timeOut_1 = setTimeout(function () {
                                        $.mobile.changePage("#UiSurveyPage", {
                                            transition: "flow",
                                            reverse: true,
                                            changeHash: true,
                                            showLoadMsg: false
                                        });
                                        clearTimeout(timeOut_1);
                                    }, 1000);
                                }
                                else {
                                    _this.usuarioDeseaCerrarDocumento(formatoOrdenDeventa, formatoPago);
                                }
                            };
                            if (!_this.formatoDeOrdenDeVenta ||
                                _this.formatoDeOrdenDeVenta === "") {
                                _this.obtenerFormatosDeImpresion(_this.cliente, ordenDeVenta, pagoGuardado, _this.esOrdenDeVentaParaCobrar, function (formatoDeOrdenDeVenta, formatoDePago) {
                                    cerrarDocumentoDeCliente(formatoDeOrdenDeVenta, formatoDePago);
                                }, function (resultado) {
                                    notify(resultado.mensaje);
                                    RegresarAPaginaAnterior("pickupplan_page");
                                    my_dialog("", "", "close");
                                    DesBloquearPantalla();
                                });
                            }
                            else {
                                cerrarDocumentoDeCliente(_this.formatoDeOrdenDeVenta, _this.formatoDePago);
                            }
                        }, function (resultado) {
                            notify(resultado.mensaje);
                            RegresarAPaginaAnterior("pickupplan_page");
                            my_dialog("", "", "close");
                            DesBloquearPantalla();
                        });
                    });
                });
            }
        }, function (resultado) {
            my_dialog("", "", "close");
            DesBloquearPantalla();
            notify(resultado.mensaje);
        });
    };
    ResumenDePedidoControlador.prototype.crearTareaParaOrdeDeVenta = function (callback, errCallBack) {
        var _this = this;
        try {
            if (this.tarea.taskId === 0) {
                this.crearTareaOv(this.tarea, this.cliente, function (taskId) {
                    _this.seCreoTareaAceptada = true;
                    callback(taskId);
                }, function (resultado) {
                    errCallBack(resultado);
                });
            }
            else {
                callback(this.tarea.taskId);
            }
        }
        catch (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al crear la tarea:" + err.message
            });
        }
    };
    ResumenDePedidoControlador.prototype.crearTareaOv = function (tarea, cliente, callback, errCallBack) {
        try {
            var direccion = cliente.address;
            if (direccion === "") {
                direccion = "No tiene direccion";
            }
            var clienteTarea = {
                Nombre: cliente.clientName,
                Direccion: direccion,
                Telefono: cliente.phone,
                CodigoHH: cliente.clientId
            };
            CrearTarea(clienteTarea, tarea.taskType, function (clienteNuevo, codigoTarea) {
                callback(Number(codigoTarea));
            });
        }
        catch (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al crear la tarea:" + err.message
            });
        }
    };
    ResumenDePedidoControlador.prototype.procesarOrdenDeVenta = function (firma, foto, guardarPedido, callback) {
        var _this = this;
        try {
            this.prepararOrdenDeVenta(firma, foto, this.listaDeSkuDeVenta, true, function (ordenDeVenta, listaDePromo) {
                if (guardarPedido === SiNo.Si) {
                    _this.ordenDeVentaServicio.insertarOrdenDeVenta(ordenDeVenta, function () {
                        _this.recorrerListaDePromoParaInsertar(listaDePromo, 0, function () {
                            _this.listaDeSkuParaBonificacionDeCombo = Array();
                            _this.publicarCombo();
                            callback(ordenDeVenta);
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
                else {
                    callback(ordenDeVenta);
                }
            });
        }
        catch (ex) {
            notify("Error al procesarOrdenDeVenta: " + ex.message);
        }
    };
    ResumenDePedidoControlador.prototype.prepararOrdenDeVenta = function (firma, foto, listaSku, esOrdenDeVentaPadre, callback) {
        var _this = this;
        try {
            this.esOrdenDeVentaAutorizada(function (autorizada) {
                _this.obtenerSecuenciaDeDocumentos(_this, function (sequence, serie, numeroDeDocumento, controlador) {
                    var ordenDeVenta = new OrdenDeVenta();
                    ordenDeVenta.salesOrderId = parseInt(sequence);
                    ordenDeVenta.docSerie = serie;
                    ordenDeVenta.docNum = numeroDeDocumento;
                    ordenDeVenta.terms = null;
                    ordenDeVenta.postedDatetime = getDateTime();
                    ordenDeVenta.clientId = controlador.cliente.clientId;
                    ordenDeVenta.posTerminal = gCurrentRoute;
                    ordenDeVenta.gpsUrl = gCurrentGPS;
                    ordenDeVenta.status = "0";
                    ordenDeVenta.postedBy = localStorage.getItem("LAST_LOGIN_ID");
                    ordenDeVenta.image1 = firma;
                    ordenDeVenta.image2 = foto;
                    ordenDeVenta.image3 =
                        controlador.cliente.fotoDeInicioDeVisita !== ""
                            ? controlador.cliente.fotoDeInicioDeVisita
                            : null;
                    ordenDeVenta.deviceBatteryFactor = gBatteryLevel;
                    ordenDeVenta.voidDatetime = null;
                    ordenDeVenta.voidReason = null;
                    ordenDeVenta.voidNotes = null;
                    ordenDeVenta.voided = null;
                    ordenDeVenta.closedRouteDatetime = null;
                    ordenDeVenta.datetime = null;
                    ordenDeVenta.isActiveRoute = 1;
                    ordenDeVenta.gpsExpected = controlador.cliente.gps;
                    ordenDeVenta.salesOrderIdBo = null;
                    ordenDeVenta.isPosted = 0;
                    ordenDeVenta.deliveryDate = controlador.cliente.deliveryDate;
                    ordenDeVenta.isParent = esOrdenDeVentaPadre;
                    ordenDeVenta.referenceId =
                        localStorage.getItem("LAST_LOGIN_ID") +
                            getDateTime() +
                            sequence;
                    ordenDeVenta.timesPrinted = 0;
                    ordenDeVenta.paymentTimesPrinted = 0;
                    ordenDeVenta.sinc = 0;
                    ordenDeVenta.isPostedVoid = 2;
                    ordenDeVenta.isVoid = false;
                    ordenDeVenta.salesOrderType = gSalesOrderType;
                    ordenDeVenta.discountByGeneralAmountApplied =
                        controlador.cliente.appliedDiscount;
                    ordenDeVenta.discountApplied = controlador.cliente.discount;
                    ordenDeVenta.taskId = controlador.tarea.taskId;
                    ordenDeVenta.salesOrderIdBo = 0;
                    ordenDeVenta.isDraft = 0;
                    ordenDeVenta.isUpdated = 1;
                    ordenDeVenta.ordenDeVentaDetalle = [];
                    ordenDeVenta.comment = controlador.cliente.salesComment;
                    ordenDeVenta.paidToDate = controlador.cliente.totalAmout;
                    ordenDeVenta.toBill = controlador.esOrdenDeVentaParaCobrar
                        ? 1
                        : 0;
                    ordenDeVenta.authorized = autorizada;
                    ordenDeVenta.isPostedValidated = 0;
                    ordenDeVenta.totalAmountDisplay = _this.obtenerTotalDeOrdenDeVenta(_this.cliente.appliedDiscount, _this.listaDeSkuDeVenta);
                    ordenDeVenta.goalHeaderId = localStorage.getItem("GOAL_HEADER_ID")
                        ? parseInt(localStorage.getItem("GOAL_HEADER_ID"))
                        : null;
                    var total = 0;
                    var lineSequence = 0;
                    var ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                    var listaDePromosAGuardar = [];
                    listaSku.map(function (sku) {
                        ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                        var resultadoDescuentoPorMontoGeneralYFamilia = _this
                            .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                            return descuentoABuscar.codeFamily === sku.codeFamilySku;
                        });
                        var resultadoDescuentoPorFamiliaYTipoPago = _this
                            .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                            return descuentoABuscar.codeFamily === sku.codeFamilySku;
                        });
                        ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                        ordenDeVentaDetalle.sku = sku.sku;
                        ordenDeVentaDetalle.lineSeq = lineSequence + 1;
                        ordenDeVentaDetalle.qty = sku.qty;
                        ordenDeVentaDetalle.price = sku.cost;
                        ordenDeVentaDetalle.totalLine = sku.total;
                        ordenDeVentaDetalle.totalAmountDisplay = sku.totalCD;
                        ordenDeVentaDetalle.postedDatetime = getDateTime();
                        ordenDeVentaDetalle.serie = "0";
                        ordenDeVentaDetalle.serie2 = "0";
                        ordenDeVentaDetalle.requeriesSerie = false;
                        ordenDeVentaDetalle.comboReference = sku.sku;
                        ordenDeVentaDetalle.parentSeq = 1;
                        ordenDeVentaDetalle.isActiveRoute = 1;
                        ordenDeVentaDetalle.skuName = sku.skuName;
                        ordenDeVentaDetalle.isPostedVoid = 2;
                        ordenDeVentaDetalle.isVoid = false;
                        ordenDeVentaDetalle.discount = sku.appliedDiscount;
                        ordenDeVentaDetalle.codePackUnit = sku.codePackUnit;
                        ordenDeVentaDetalle.docSerie = ordenDeVenta.docSerie;
                        ordenDeVentaDetalle.docNum = ordenDeVenta.docNum;
                        ordenDeVentaDetalle.long = sku.dimension;
                        ordenDeVentaDetalle.isSaleByMultiple = sku.isSaleByMultiple;
                        ordenDeVentaDetalle.multipleSaleQty = sku.multipleSaleQty;
                        ordenDeVentaDetalle.owner = sku.owner;
                        ordenDeVentaDetalle.ownerId = sku.ownerId;
                        ordenDeVentaDetalle.discountType = sku.discountType;
                        ordenDeVentaDetalle.discountByFamily = !sku.specialPrice
                            .applyDiscount
                            ? 0
                            : sku.isUniqueDiscountScale
                                ? 0
                                : resultadoDescuentoPorMontoGeneralYFamilia
                                    ? resultadoDescuentoPorMontoGeneralYFamilia.discount
                                    : 0;
                        ordenDeVentaDetalle.typeOfDiscountByFamily = !sku.specialPrice
                            .applyDiscount
                            ? ""
                            : sku.isUniqueDiscountScale
                                ? ""
                                : resultadoDescuentoPorMontoGeneralYFamilia
                                    ? resultadoDescuentoPorMontoGeneralYFamilia.discountType
                                    : "";
                        ordenDeVentaDetalle.discountByFamilyAndPaymentType = !sku
                            .specialPrice.applyDiscount
                            ? 0
                            : sku.isUniqueDiscountScale
                                ? 0
                                : resultadoDescuentoPorFamiliaYTipoPago
                                    ? resultadoDescuentoPorFamiliaYTipoPago.discount
                                    : 0;
                        ordenDeVentaDetalle.typeOfDiscountByFamilyAndPaymentType = !sku
                            .specialPrice.applyDiscount
                            ? ""
                            : sku.isUniqueDiscountScale
                                ? ""
                                : resultadoDescuentoPorFamiliaYTipoPago
                                    ? resultadoDescuentoPorFamiliaYTipoPago.discountType
                                    : "";
                        ordenDeVentaDetalle.codeFamilySku = sku.codeFamilySku;
                        ordenDeVentaDetalle.basePrice = sku.basePrice;
                        ordenDeVentaDetalle.uniqueDiscountByScaleAplied = sku.isUniqueDiscountScale
                            ? 1
                            : 0;
                        ordenDeVentaDetalle.applyDiscountBySpecialPrice = sku
                            .specialPrice.applyDiscount
                            ? 1
                            : 0;
                        ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                        total += ordenDeVentaDetalle.totalLine;
                        sku.listPromo.map(function (promo) {
                            promo.salesOrderDocumentNumber = numeroDeDocumento;
                            promo.salesOrderDocumentSeries = serie;
                            listaDePromosAGuardar.push(promo);
                        });
                        if (sku.specialPrice.promoId > 0) {
                            var resultadoPromoBusqueda = listaDePromosAGuardar.find(function (promo) {
                                return promo.promoId === sku.specialPrice.promoId;
                            });
                            if (!resultadoPromoBusqueda) {
                                var promoParaAgregar = new Promo();
                                promoParaAgregar.promoId = sku.specialPrice.promoId;
                                promoParaAgregar.promoName = sku.specialPrice.promoName;
                                promoParaAgregar.promoType = sku.specialPrice.promoType;
                                promoParaAgregar.frequency = sku.specialPrice.frequency;
                                promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                                promoParaAgregar.salesOrderDocumentSeries = serie;
                                listaDePromosAGuardar.push(promoParaAgregar);
                            }
                        }
                        lineSequence++;
                    });
                    var listaDescuentosPorMontoGeneralYFamiliaAGuardar = [];
                    var listaDescuentoPorFamiliaYTipoPagoAGuardar = [];
                    ordenDeVenta.ordenDeVentaDetalle.map(function (ordenDeVentaDetalle) {
                        if (ordenDeVentaDetalle.discountByFamily > 0) {
                            var resultadoDescuentoPorMontoGeneralYFamiliaDeTodos_1 = _this
                                .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                                return (descuentoABuscar.codeFamily ===
                                    ordenDeVentaDetalle.codeFamilySku);
                            });
                            if (resultadoDescuentoPorMontoGeneralYFamiliaDeTodos_1) {
                                var resultadoDescuentoPorMontoGeneralYFamiliaAGuardar = listaDescuentosPorMontoGeneralYFamiliaAGuardar.find(function (descuentoABuscar) {
                                    return (resultadoDescuentoPorMontoGeneralYFamiliaDeTodos_1.promoId ===
                                        descuentoABuscar.promoId);
                                });
                                if (!resultadoDescuentoPorMontoGeneralYFamiliaAGuardar) {
                                    listaDescuentosPorMontoGeneralYFamiliaAGuardar.push(resultadoDescuentoPorMontoGeneralYFamiliaDeTodos_1);
                                }
                            }
                        }
                        if (ordenDeVentaDetalle.discountByFamilyAndPaymentType > 0) {
                            var resultadoDescuentoPorFamiliaYTipoPagoDeTodos_1 = _this
                                .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                                return (descuentoABuscar.codeFamily ===
                                    ordenDeVentaDetalle.codeFamilySku);
                            });
                            if (resultadoDescuentoPorFamiliaYTipoPagoDeTodos_1) {
                                var resultadoDescuentoPorFamiliaYTipoPagoAGuardar = listaDescuentoPorFamiliaYTipoPagoAGuardar.find(function (descuentoABuscar) {
                                    return (resultadoDescuentoPorFamiliaYTipoPagoDeTodos_1.promoId ===
                                        descuentoABuscar.promoId);
                                });
                                if (!resultadoDescuentoPorFamiliaYTipoPagoAGuardar) {
                                    listaDescuentoPorFamiliaYTipoPagoAGuardar.push(resultadoDescuentoPorFamiliaYTipoPagoDeTodos_1);
                                }
                            }
                        }
                    });
                    _this.listaDeDescuentoPorMontoGeneralYFamilia = listaDescuentosPorMontoGeneralYFamiliaAGuardar;
                    _this.listaDeDescuentoPorFamiliaYTipoPago = listaDescuentoPorFamiliaYTipoPagoAGuardar;
                    _this.listaDeSkuParaBonificacionParaOrdenDeVenta.map(function (sku) {
                        ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                        ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                        ordenDeVentaDetalle.sku = sku.sku;
                        ordenDeVentaDetalle.lineSeq = lineSequence + 1;
                        ordenDeVentaDetalle.qty = sku.qty;
                        ordenDeVentaDetalle.price = 0;
                        ordenDeVentaDetalle.totalLine = 0;
                        ordenDeVentaDetalle.postedDatetime = getDateTime();
                        ordenDeVentaDetalle.serie = "0";
                        ordenDeVentaDetalle.serie2 = "0";
                        ordenDeVentaDetalle.requeriesSerie = false;
                        ordenDeVentaDetalle.comboReference = sku.sku;
                        ordenDeVentaDetalle.parentSeq = 1;
                        ordenDeVentaDetalle.isActiveRoute = 1;
                        ordenDeVentaDetalle.skuName = sku.skuName;
                        ordenDeVentaDetalle.isPostedVoid = 2;
                        ordenDeVentaDetalle.isVoid = false;
                        ordenDeVentaDetalle.discount = 0;
                        ordenDeVentaDetalle.codePackUnit = sku.codePackUnit;
                        ordenDeVentaDetalle.docSerie = ordenDeVenta.docSerie;
                        ordenDeVentaDetalle.docNum = ordenDeVenta.docNum;
                        ordenDeVentaDetalle.isBonus = 1;
                        ordenDeVentaDetalle.isSaleByMultiple = false;
                        ordenDeVentaDetalle.multipleSaleQty = 1;
                        ordenDeVentaDetalle.owner = sku.owner;
                        ordenDeVentaDetalle.ownerId = sku.ownerId;
                        ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                        sku.listPromo.map(function (promo) {
                            promo.salesOrderDocumentNumber = numeroDeDocumento;
                            promo.salesOrderDocumentSeries = serie;
                            listaDePromosAGuardar.push(promo);
                        });
                        lineSequence++;
                    });
                    _this.listaDeSkuParaBonificacionDeCombo.map(function (bonificacionPorCombo) {
                        if (bonificacionPorCombo.skusDeBonoPorComboAsociados.length > 0) {
                            var promo = listaDePromosAGuardar.find(function (bonificacionMontoGeneral) {
                                return (bonificacionMontoGeneral.promoId ===
                                    bonificacionPorCombo.promoId);
                            });
                            if (!promo) {
                                var promoParaAgregar = new Promo();
                                promoParaAgregar.promoId = bonificacionPorCombo.promoId;
                                promoParaAgregar.promoName =
                                    bonificacionPorCombo.promoName;
                                promoParaAgregar.promoType =
                                    bonificacionPorCombo.promoType;
                                promoParaAgregar.frequency =
                                    bonificacionPorCombo.frequency;
                                promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                                promoParaAgregar.salesOrderDocumentSeries = serie;
                                listaDePromosAGuardar.push(promoParaAgregar);
                                promoParaAgregar = null;
                            }
                        }
                    });
                    _this.listaDeBonificacionesPorMontoGeneral.map(function (bonificacion) {
                        var promo = listaDePromosAGuardar.find(function (bonificacionMontoGeneral) {
                            return (bonificacionMontoGeneral.promoId ===
                                bonificacion.promoId);
                        });
                        if (!promo) {
                            var promoParaAgregar = new Promo();
                            promoParaAgregar.promoId = bonificacion.promoId;
                            promoParaAgregar.promoName = bonificacion.promoName;
                            promoParaAgregar.promoType = bonificacion.promoType;
                            promoParaAgregar.frequency = bonificacion.frequency;
                            promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                            promoParaAgregar.salesOrderDocumentSeries = serie;
                            listaDePromosAGuardar.push(promoParaAgregar);
                            promoParaAgregar = null;
                        }
                    });
                    _this.listaDeDescuentoPorMontoGeneralYFamilia.forEach(function (descuento) {
                        var promoParaAgregar = new Promo();
                        promoParaAgregar.promoId = descuento.promoId;
                        promoParaAgregar.promoName = descuento.promoName;
                        promoParaAgregar.promoType = descuento.promoType;
                        promoParaAgregar.frequency = descuento.frequency;
                        promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                        promoParaAgregar.salesOrderDocumentSeries = serie;
                        listaDePromosAGuardar.push(promoParaAgregar);
                        promoParaAgregar = null;
                    });
                    _this.listaDeDescuentoPorFamiliaYTipoPago.forEach(function (descuento) {
                        var promoParaAgregar = new Promo();
                        promoParaAgregar.promoId = descuento.promoId;
                        promoParaAgregar.promoName = descuento.promoName;
                        promoParaAgregar.promoType = descuento.promoType;
                        promoParaAgregar.frequency = descuento.frequency;
                        promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                        promoParaAgregar.salesOrderDocumentSeries = serie;
                        listaDePromosAGuardar.push(promoParaAgregar);
                        promoParaAgregar = null;
                    });
                    ordenDeVenta.detailQty = ordenDeVenta.ordenDeVentaDetalle.length;
                    ordenDeVenta.totalAmount = total;
                    var to = setTimeout(function () {
                        clearTimeout(to);
                        callback(ordenDeVenta, listaDePromosAGuardar);
                    }, 2000);
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al preparar ordenDeVenta: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.esOrdenDeVentaAutorizada = function (callback, errCallback) {
        this.tareaServicio.obtenerRegla("OrdenesDeVentaNoAutorizadas", function (listaDeReglas) {
            if (listaDeReglas.length > 0 && listaDeReglas[0].enabled === "Si") {
                callback(false);
            }
            else {
                callback(true);
            }
        }, function (resultado) {
            errCallback(resultado);
        });
    };
    ResumenDePedidoControlador.prototype.obtenerSecuenciaDeDocumentos = function (controlador, callback) {
        try {
            GetNexSequence("SALES", function (sequence) {
                ObtenerSecuenciaSiguiente(TipoDocumento.OrdenDeVenta, function (serie, numeroDeDocumento) {
                    callback(sequence, serie, numeroDeDocumento, controlador);
                }, function (err) {
                    notify("Error al obtener sequencia de documento: " + err.message);
                });
            }, function (err) {
                notify("Error al obtener sequencia de documento: " + err.message);
            });
        }
        catch (err) {
            notify("Error al obtener secuencia de documento: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.publicarFirma = function (callback) {
        var msg = new FirmaMensaje(this);
        msg.firma = this.firma;
        msg.origen = OrigenFirma.OrdenDeVenta;
        this.mensajero.publish(msg, getType(FirmaMensaje));
        callback();
    };
    ResumenDePedidoControlador.prototype.obtenerPago = function (callback) {
        if (this.esOrdenDeVentaParaCobrar) {
            if (this.pago === null || this.pago === undefined) {
                this.pagoServicio.formarPagoUnicoDesdeLista(this.cliente, this.listaDeSkuDeVenta, TipoDePago.Efectivo, null, null, null, function (pago) {
                    callback(pago);
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
            else {
                callback(this.pago);
            }
        }
        else {
            var pago = new PagoEncabezado();
            pago.pagoDetalle = [];
            var detalle = new PagoDetalle();
            pago.pagoDetalle.push(detalle);
            callback(pago);
        }
    };
    ResumenDePedidoControlador.prototype.obtenerFormatosDeImpresion = function (cliente, ordenDeVenta, pago, esOrdenDeVentaParaCobrar, callback, callbackError) {
        var _this = this;
        this.ordenDeVentaServicio.obtenerFormatoDeImpresionPreSale(cliente, ordenDeVenta, function (formatoDeOrdenDeVenta) {
            if (esOrdenDeVentaParaCobrar) {
                _this.pagoServicio.obtenerFormatoDeImpresionDePago(cliente, ordenDeVenta, pago, function (formatoDePago) {
                    _this.formatoDeOrdenDeVenta = formatoDeOrdenDeVenta;
                    _this.formatoDePago = formatoDePago;
                    callback(formatoDeOrdenDeVenta, formatoDePago);
                }, function (resultadoN1) {
                    notify(resultadoN1.mensaje);
                });
            }
            else {
                _this.formatoDeOrdenDeVenta = formatoDeOrdenDeVenta;
                callback(formatoDeOrdenDeVenta, "");
            }
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    ResumenDePedidoControlador.prototype.cerrarDocumento = function (formatoDeOrdenDeVenta, formatoDePago, callback, callbackError) {
        var _this = this;
        try {
            this.ordenDeVentaServicio.actualizarDocumnetoImpreso(this.tarea.taskId, formatoDeOrdenDeVenta, formatoDePago, function () {
                _this.tarea.taskStatus = TareaEstado.Completada;
                if (!_this.seCreoTareaAceptada) {
                    actualizarListadoDeTareas(_this.tarea.taskId, _this.tarea.taskType, _this.tarea.taskStatus, _this.cliente.clientId, _this.cliente.clientName, _this.cliente.address, 0, TareaEstado.Aceptada, _this.cliente.rgaCode);
                }
                _this.tareaServicio.actualizarTareaEstado(_this.tarea, function () {
                    callback();
                }, function (resultado) {
                    callbackError(resultado);
                });
            }, function (resultado) {
                callbackError(resultado);
            });
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener formato de impresion de orden de venta: " +
                    err.message
            });
        }
    };
    ResumenDePedidoControlador.prototype.preguntarSiSeImprimePagoDeOrdenDeVenta = function (formatoDePago, esOrdenDeVentaParaCobrar, callback, callbackError) {
        var _this = this;
        if (esOrdenDeVentaParaCobrar) {
            DesBloquearPantalla();
            navigator.notification.confirm("Desea imprimir el pago de la orden de venta?", function (respuesta) {
                if (respuesta === 2) {
                    BloquearPantalla();
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    var impresionServicio = new ImpresionServicio();
                    var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                    impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formatoDePago, true, function (resultado) {
                        if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                            callback();
                            DesBloquearPantalla();
                        }
                        else {
                            callbackError({
                                codigo: -1,
                                mensaje: resultado.mensaje
                            });
                            DesBloquearPantalla();
                        }
                    });
                }
                else {
                    callback();
                    DesBloquearPantalla();
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        else {
            callback();
            DesBloquearPantalla();
        }
    };
    ResumenDePedidoControlador.prototype.usuarioDeseaCerrarDocumento = function (formatoDeOrdenDeVenta, formatoDePago) {
        var _this = this;
        this.cerrarDocumento(formatoDeOrdenDeVenta, formatoDePago, function () {
            _this.pago = null;
            var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            if (printMacAddress !== undefined &&
                printMacAddress !== "" &&
                printMacAddress !== null &&
                printMacAddress !== "undefined") {
                printMacAddress = null;
                if (!_this.imprimio) {
                    _this.preguntarSiSeImprimeOrdenDeVenta(formatoDeOrdenDeVenta, function () {
                        _this.preguntarSiSeImprimePagoDeOrdenDeVenta(formatoDePago, _this.esOrdenDeVentaParaCobrar, function () {
                            my_dialog("", "", "close");
                            RegresarAPaginaAnterior("pickupplan_page");
                            _this.prepararVariablesParaProximaVenta();
                            DesBloquearPantalla();
                        }, function (resultadoN5) {
                            if (!_this.isImpresoraZebra) {
                                notify(resultadoN5.mensaje);
                            }
                            my_dialog("", "", "close");
                            DesBloquearPantalla();
                            RegresarAPaginaAnterior("pickupplan_page");
                            _this.prepararVariablesParaProximaVenta();
                        });
                    }, function (resultadoN4) {
                        if (!_this.isImpresoraZebra) {
                            notify(resultadoN4.mensaje);
                        }
                        my_dialog("", "", "close");
                        DesBloquearPantalla();
                        RegresarAPaginaAnterior("pickupplan_page");
                        _this.prepararVariablesParaProximaVenta();
                    });
                }
                else {
                    printMacAddress = null;
                    my_dialog("", "", "close");
                    DesBloquearPantalla();
                    RegresarAPaginaAnterior("pickupplan_page");
                    _this.prepararVariablesParaProximaVenta();
                }
            }
            else {
                printMacAddress = null;
                my_dialog("", "", "close");
                DesBloquearPantalla();
                RegresarAPaginaAnterior("pickupplan_page");
                _this.prepararVariablesParaProximaVenta();
            }
        }, function (resultado) {
            if (!_this.isImpresoraZebra) {
                notify(resultado.mensaje);
            }
            my_dialog("", "", "close");
            DesBloquearPantalla();
            RegresarAPaginaAnterior("pickupplan_page");
            _this.prepararVariablesParaProximaVenta();
        });
        if (this.tarea.hasDraft) {
            var ordenDeVentaTemporal = new OrdenDeVenta();
            ordenDeVentaTemporal.salesOrderId = this.tarea.salesOrderIdDraft;
            ordenDeVentaTemporal.docSerie = this.tarea.salesOrderDocSerieDraft;
            ordenDeVentaTemporal.docNum = this.tarea.salesOrderDocNumDraft;
            this.ordenDeVentaServicio.cancelarOCompletarOrdenDeVentaDraft(ordenDeVentaTemporal, function () {
                _this.tarea.hasDraft = false;
                RegresarAPaginaAnterior("pickupplan_page");
                my_dialog("", "", "close");
                DesBloquearPantalla();
                _this.prepararVariablesParaProximaVenta();
            }, function (resultadoN3) {
                notify(resultadoN3.mensaje);
                RegresarAPaginaAnterior("pickupplan_page");
                my_dialog("", "", "close");
                DesBloquearPantalla();
                _this.prepararVariablesParaProximaVenta();
            });
        }
    };
    ResumenDePedidoControlador.prototype.usuarioDeseaImprimirOrdenDeVenta = function () {
        var _this = this;
        if (this.fotoObligatoria) {
            if (this.foto == undefined || this.foto === "") {
                notify("Debe de tomar una fotografia antes de imprimir la orden de venta.");
                return;
            }
        }
        if (this.firmaObligatoria) {
            if (this.firma == undefined || this.firma === "") {
                notify("Debe de firmar el documento antes de imprimir la orden de venta.");
                return;
            }
        }
        var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
        if (printMacAddress !== undefined &&
            printMacAddress !== "" &&
            printMacAddress !== null &&
            printMacAddress !== "undefined") {
            printMacAddress = null;
            this.procesarOrdenDeVenta(this.firma, this.foto, SiNo.No, function (ordenDeVenta) {
                _this.ordenDeVenta = ordenDeVenta;
                _this.obtenerPago(function (pago) {
                    pago.pagoDetalle[0].sourceDocSerie = ordenDeVenta.docSerie;
                    pago.pagoDetalle[0].sourceDocNum = ordenDeVenta.docNum;
                    _this.pagoServicio.guardarPago(pago, false, function (pagoN1) {
                        _this.pago = pagoN1;
                        if (_this.formatoDeOrdenDeVenta === "" ||
                            _this.formatoDeOrdenDeVenta == undefined) {
                            _this.obtenerFormatosDeImpresion(_this.cliente, ordenDeVenta, pagoN1, _this.esOrdenDeVentaParaCobrar, function (formatoDeOrdenDeVenta, formatoDePago) {
                                _this.preguntarSiSeImprimeOrdenDeVenta(formatoDeOrdenDeVenta, function () {
                                    _this.preguntarSiSeImprimePagoDeOrdenDeVenta(formatoDePago, _this.esOrdenDeVentaParaCobrar, function () {
                                        my_dialog("", "", "close");
                                    }, function (resultadoN5) {
                                        if (!_this.isImpresoraZebra) {
                                            notify(resultadoN5.mensaje);
                                        }
                                        my_dialog("", "", "close");
                                    });
                                }, function (resultadoN4) {
                                    if (!_this.isImpresoraZebra) {
                                        notify(resultadoN4.mensaje);
                                    }
                                    my_dialog("", "", "close");
                                });
                            }, function (resultadoN2) {
                                notify(resultadoN2.mensaje);
                                my_dialog("", "", "close");
                            });
                        }
                        else {
                            _this.preguntarSiSeImprimeOrdenDeVenta(_this.formatoDePago, function () {
                                _this.preguntarSiSeImprimePagoDeOrdenDeVenta(_this.formatoDePago, _this.esOrdenDeVentaParaCobrar, function () {
                                    my_dialog("", "", "close");
                                }, function (resultadoN5) {
                                    if (!_this.isImpresoraZebra) {
                                        notify(resultadoN5.mensaje);
                                    }
                                    my_dialog("", "", "close");
                                });
                            }, function (resultadoN4) {
                                if (!_this.isImpresoraZebra) {
                                    notify(resultadoN4.mensaje);
                                }
                                my_dialog("", "", "close");
                            });
                        }
                    }, function (resultadoN1) {
                        notify(resultadoN1.mensaje);
                        my_dialog("", "", "close");
                    });
                });
            });
        }
        else {
            printMacAddress = null;
            navigator.notification.confirm("No tiene impresora asociada. Desea asociar una impresora?", function (respuesta) {
                if (respuesta === 2) {
                    $.mobile.changePage("#UiPaginaSeleccionDeImpresora");
                }
            }, "Sonda® " + SondaVersion, "No,Si");
            my_dialog("", "", "close");
        }
    };
    ResumenDePedidoControlador.prototype.validarFirmaObligatoria = function (callback) {
        var _this = this;
        try {
            this.tareaServicio.obtenerRegla("FirmaObligatoriaEnOrdenDeVenta", function (listaDeReglas) {
                if (listaDeReglas.length >= 1) {
                    if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
                        _this.firmaObligatoria = true;
                        callback();
                    }
                    else {
                        callback();
                    }
                }
                else {
                    callback();
                }
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al validar si modifica DMG: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.validarFotoObligatoria = function (callback) {
        var _this = this;
        try {
            this.tareaServicio.obtenerRegla("FotografiaObligatoriaEnOrdenDeVenta", function (listaDeReglas) {
                if (listaDeReglas.length >= 1) {
                    if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
                        _this.fotoObligatoria = true;
                        callback();
                    }
                    else {
                        callback();
                    }
                }
                else {
                    callback();
                }
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al validar si modifica DMG: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.usuarioDeseaReImprimirlaVenta = function () {
        var _this = this;
        try {
            if (this.tarea.taskType === TareaTipo.Preventa) {
                this.ordenDeVentaServicio.obtenerFormatoImpresoOrdenDeVenta(this.tarea, function (formato) {
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    var impresionServicio = new ImpresionServicio();
                    var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                    impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formato, true, function (resultado) {
                        if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                            _this.ordenDeVenta.timesPrinted += 1;
                            _this.ordenDeVentaServicio.actualizarVecesImpresionOrdenDeVenta(_this.tarea, _this.ordenDeVenta, function () {
                                if (_this.ordenDeVenta.timesPrinted === gMaxImpresiones) {
                                    var uilistaImprimirPreVenta = $("#listaImprimirPreVenta");
                                    uilistaImprimirPreVenta.hide();
                                    uilistaImprimirPreVenta = null;
                                }
                            }, function (resultado) {
                                notify(resultado.mensaje);
                            });
                        }
                        else {
                            if (!_this.isImpresoraZebra) {
                                notify(resultado.mensaje);
                            }
                        }
                        my_dialog("", "", "close");
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
        }
        catch (err) {
            notify("Error al reimprimir la venta: " + err.message);
        }
    };
    ResumenDePedidoControlador.prototype.usuarioDeseaSeleccionarFormaDePago = function () {
        this.publicarListaDeSkuOrdenDeVenta();
        $.mobile.changePage("UiPagePayment", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false,
            data: {
                cliente: this.cliente,
                tarea: this.tarea,
                configuracionDecimales: this.configuracionDecimales,
                pago: this.pago
            }
        });
    };
    ResumenDePedidoControlador.prototype.publicarTarea = function () {
        var msg = new TareaMensaje(this);
        msg.tarea = this.tarea;
        this.mensajero.publish(msg, getType(TareaMensaje));
    };
    ResumenDePedidoControlador.prototype.publicarListaDeSkuOrdenDeVenta = function () {
        var msg = new ListaSkuMensaje(this);
        msg.listaSku = this.listaDeSkuDeVenta;
        msg.listaDeSkuParaBonificacion = this.listaDeSkuDeVenta;
        this.mensajero.publish(msg, getType(ListaSkuMensaje));
    };
    ResumenDePedidoControlador.prototype.publicarPago = function () {
        var msg = new PagoMensaje(this);
        msg.pago = this.pago;
        this.mensajero.publish(msg, getType(PagoMensaje));
    };
    ResumenDePedidoControlador.prototype.cargarPantalla = function () {
        var _this = this;
        this.esOrdenDeVentaParaCobrar = false;
        this.firmaObligatoria = false;
        this.fotoObligatoria = false;
        if (!this.obtuboGps) {
            ObtenerPosicionGPS(function () {
                _this.obtuboGps = true;
                _this.obtenerValoresInicialesDePantalla();
            });
        }
        else {
            this.obtenerValoresInicialesDePantalla();
        }
    };
    ResumenDePedidoControlador.prototype.limpiarListas = function () {
        this.listaDeSkuDeVenta.length = 0;
        this.listaSkuOrdenDeVentaPrincipal.length = 0;
        this.listaDeSkuParaBonificacion.length = 0;
        this.listaDeSkuParaBonificacionDeCombo.length = 0;
        this.listaDeBonificacionesPorMontoGeneral.length = 0;
        this.listaDeSkuParaBonificacionParaOrdenDeVenta.length = 0;
    };
    ResumenDePedidoControlador.prototype.prepararVariablesParaProximaVenta = function () {
        this.formatoDeOrdenDeVenta = "";
        this.formatoDePago = "";
        this.foto = "";
        this.firma = "";
        this.obtuboGps = false;
        this.limpiarListas();
    };
    ResumenDePedidoControlador.prototype.publicarCombo = function () {
        var listaDeSkuParaBonificacionDeCombo = [];
        var msg = new ListaDeSkuParaBonificacionDeComboMensaje(this);
        msg.listaDeSkuParaBonificacionDeCombo = listaDeSkuParaBonificacionDeCombo;
        this.mensajero.publish(msg, getType(ListaDeSkuParaBonificacionDeComboMensaje));
    };
    ResumenDePedidoControlador.prototype.obtenerValoresInicialesDePantalla = function () {
        var _this = this;
        this.validarFotoObligatoria(function () {
            _this.validarFirmaObligatoria(function () {
                _this.validarPedidoTipoCobro(function () {
                    _this.cargarInformacionResumen(function () {
                        var bonificaciones = (JSON.parse(JSON.stringify(_this.listaDeSkuParaBonificacion)));
                        _this.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(bonificaciones, _this.listaDeBonificacionesPorMontoGeneral, _this.listaDeSkuParaBonificacionDeCombo, function (bonosFinales) {
                            _this.listaDeSkuParaBonificacionParaOrdenDeVenta = bonosFinales;
                            _this.cargarSkus(function () {
                                var uiListaFormaDePago = $("#UiListaFormaDePago");
                                uiListaFormaDePago.hide();
                                if (_this.esOrdenDeVentaParaCobrar) {
                                    if (_this.cargaPrimeraVez) {
                                        notify("Debe de cobrar la orden de venta");
                                        _this.cargaPrimeraVez = false;
                                    }
                                    uiListaFormaDePago.show();
                                    _this.mostrarTipoDePago();
                                }
                                uiListaFormaDePago = null;
                                DesBloquearPantalla();
                            });
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    });
                });
            });
        });
    };
    ResumenDePedidoControlador.prototype.recorrerListaDePromoParaInsertar = function (listaDePromo, indiceDeLista, callBack, errCallback) {
        var _this = this;
        try {
            if (listaDePromo.length > 0 && listaDePromo.length > indiceDeLista) {
                ObtenerSecuenciaSiguiente(TipoDocumento.Promo, function (serie, numeroDeDocumento) {
                    var promo = listaDePromo[indiceDeLista];
                    promo.docSerie = serie;
                    promo.docNum = numeroDeDocumento;
                    promo.codeCustomer = _this.cliente.clientId;
                    promo.codeRoute = gCurrentRoute;
                    _this.promoServicio.insertarHistoricoDePromo(promo, function () {
                        _this.recorrerListaDePromoParaInsertar(listaDePromo, indiceDeLista + 1, function () {
                            callBack();
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                    promo = null;
                }, function (err) {
                    errCallback({
                        codigo: -1,
                        mensaje: "Error al obtener sequencia de documento: " + err.message
                    });
                });
            }
            else {
                callBack();
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al recorrer listado de promo para insertar: " + ex.message
            });
        }
    };
    return ResumenDePedidoControlador;
}());
//# sourceMappingURL=ResumenDePedidoControlador.js.map