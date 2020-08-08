var ResumenOrdenDeVentaControlador = (function () {
    function ResumenOrdenDeVentaControlador(mensajero) {
        this.mensajero = mensajero;
        this.ordenDeVentaServicio = new OrdenDeVentaServicio();
        this.taareaServicio = new TareaServcio();
        this.clienteServicio = new ClienteServicio();
        this.manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.pagoServicio = new PagoServicio();
        this.bonoServicio = new BonoServicio();
        this.listaDeSkuDeVenta = [];
        this.seCreoTareaAceptada = false;
        this.listaSkuOrdenDeVentaPrincipal = [];
        this.listaDeOrdnesDeVEntaCf = [];
        this.ordenDeVentaPricipal = new OrdenDeVenta();
        this.listaDeSkuParaBonificacion = Array();
        this.esOrdenDeVentaParaCobrar = false;
        this.listaDeSkuParaBonificacionDeCombo = Array();
        this.listaDeSkuParaBonificacionFinal = Array();
        this.usuarioPuedeModificarBonificacionDeCombo = false;
        this.isImpresoraZebra = (localStorage.getItem("isPrinterZebra") === "1");
        this.totalDeLaOrden = 0;
        this.mostrarImagenDeVerificacionDePosteoEnBo = false;
    }
    ResumenOrdenDeVentaControlador.prototype.clienteEntregado = function (mensaje, subcriber) {
        subcriber.cliente = mensaje.cliente;
    };
    ResumenOrdenDeVentaControlador.prototype.tareaEntregado = function (mensaje, subcriber) {
        subcriber.tarea = mensaje.tarea;
        subcriber.esReimpresion = false;
    };
    ResumenOrdenDeVentaControlador.prototype.listaDeSkuDeVentaEntregado = function (mensaje, subcriber) {
        subcriber.listaDeSkuDeVenta = mensaje.listaSku;
        subcriber.listaSkuOrdenDeVentaPrincipal = [];
        subcriber.listaDeOrdnesDeVEntaCf = [];
        subcriber.listaDeSkuParaBonificacion = mensaje.listaDeSkuParaBonificacion;
        subcriber.listaDeSkuParaBonificacionDeCombo = mensaje.listaDeSkuParaBonificacionDeCombo;
        subcriber.usuarioPuedeModificarBonificacionDeCombo = mensaje.usuarioPuedeModificarBonificacionDeCombo;
        subcriber.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(subcriber.listaDeSkuParaBonificacion, subcriber.listaDeSkuParaBonificacionDeCombo, function (bonosFinales) {
            subcriber.listaDeSkuParaBonificacionFinal = bonosFinales;
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    ResumenOrdenDeVentaControlador.prototype.pagoEntregado = function (mensaje, subcriber) {
        subcriber.pago = mensaje.pago;
        var uiBotonDeFormaDePago = $("#UiBotonDeFormaDePago");
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
    ResumenOrdenDeVentaControlador.prototype.delegarResumenOrdenDeVentaControlador = function () {
        var _this = this;
        var este = this;
        $("#UiPageRepPreSale").on("pageshow", function () {
            este.bonoServicio.validarSiModificaBonificacionPorCombo(function (puedeModificar) {
                este.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
                este.esOrdenDeVentaParaCobrar = false;
                este.obtenerConfiguracionDeDecimales();
                este.cargarResumen();
            }, function (resultado) {
                _this.usuarioPuedeModificarBonificacionDeCombo = false;
                notify("Error al validar si puede modificar la bonificacion por combo: " + resultado.mensaje);
            });
        });
        $("#UiBotonFimaFotoPresale").bind("touchstart", function () {
            _this.usuarioDeseaFirmarYTomarFotografia();
        });
        $("#UiBotonDeFormaDePago").bind("touchstart", function () {
            _this.usuarioDeseaSeleccionarFormaDePago();
        });
        $("#UiBotonImprimirPresale").bind("touchstart", function () {
            var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            if (printMacAddress !== undefined && printMacAddress !== "" && printMacAddress !== null) {
                printMacAddress = null;
                navigator.notification.confirm("Desea imprimir la orden de venta?", function (buttonIndex) {
                    if (buttonIndex === 2) {
                        _this.usuarioDeseaReImprimirlaVenta();
                    }
                }, "Sonda® " + SondaVersion, "No,Si");
            }
            else {
                notify("No tiene asociada una impresora");
                printMacAddress = null;
            }
        });
        $("#UiBotonImprimirPagoPreVenta").bind("touchstart", function () {
            var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            if (printMacAddress !== undefined && printMacAddress !== "" && printMacAddress !== null) {
                printMacAddress = null;
                navigator.notification.confirm("Desea imprimir el pago de la orden de venta?", function (buttonIndex) {
                    if (buttonIndex === 2) {
                        _this.usuarioDeseaReImprimirlaVentaPago();
                    }
                }, "Sonda® " + SondaVersion, "No,Si");
            }
            else {
                notify("No tiene asociada una impresora");
                printMacAddress = null;
            }
        });
        $("#UiPageRepPreSale").swipe({
            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                if (fingerCount === 1 && direction === "right") {
                    if (gVentaEsReimpresion) {
                        var myPanel = $.mobile.activePage.children('[id="UiPanelDerrecho"]');
                        myPanel.panel("toggle");
                    }
                }
            }
        });
        $("#UIBotonCrearOrdenDeVenta").bind("touchstart", function () {
            _this.usuarioDeseaCrearTareaPreventa();
        });
        $("#UIBotonModificcarClienteDesdeResumen").bind("touchstart", function () {
            _this.usuarioDeseaModifcarCliente();
        });
    };
    ResumenOrdenDeVentaControlador.prototype.usuarioDeseaCrearTareaPreventa = function () {
        var _this = this;
        try {
            this.creatTarea(this.tarea, this.cliente, function (taskId) {
                gtaskid = taskId;
                gTaskType = _this.tarea.taskType;
                gClientID = _this.cliente.clientId;
                gVentaEsReimpresion = false;
                actualizarListadoDeTareas(gtaskid, _this.tarea.taskType, TareaEstado.Asignada, _this.cliente.clientId, _this.cliente.clientName, _this.cliente.address, 0, "", _this.cliente.rgaCode);
                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al crear la tarea: " + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.cargarResumen = function () {
        var _this = this;
        this.limpiarCamposDeResumenDeVenta(function () {
            _this.validarPedidoTipoCobro(function () {
                if (gVentaEsReimpresion) {
                    _this.cargarResumenParaReimpresion();
                    _this.mostrarImagenDeVerificacionDePosteoEnBo = true;
                }
                else {
                    _this.mostrarImagenDeVerificacionDePosteoEnBo = false;
                    ObtenerPosicionGPS(function () {
                    });
                    _this.mostrarDatosCliente();
                    _this.generarListaOrdenDeVenta();
                    _this.mostrarBotones();
                    if (_this.esOrdenDeVentaParaCobrar) {
                        notify("Debe de cobrar la orden de venta");
                    }
                    var uiEtiquetaEstadoOrdenDeVenta = $('#UiEtiquetaEstadoOrdenDeVenta');
                    uiEtiquetaEstadoOrdenDeVenta.text("Activa");
                    uiEtiquetaEstadoOrdenDeVenta = null;
                }
            });
        });
    };
    ResumenOrdenDeVentaControlador.prototype.limpiarCamposDeResumenDeVenta = function (callback) {
        var uiEtiquetaRepPreSaleRanzonSocial = $('#UiEtiquetaRepPreSaleRanzonSocial');
        uiEtiquetaRepPreSaleRanzonSocial.text("...");
        uiEtiquetaRepPreSaleRanzonSocial = null;
        var uiEtiquetaRepPreSaleDireccion = $('#UiEtiquetaRepPreSaleDireccion');
        uiEtiquetaRepPreSaleDireccion.text("...");
        uiEtiquetaRepPreSaleDireccion = null;
        var uiEtiquetaRepPreSaleNoTelefono = $('#UiEtiquetaRepPreSaleNoTelefono');
        uiEtiquetaRepPreSaleNoTelefono.text("...");
        uiEtiquetaRepPreSaleNoTelefono = null;
        var uiEtiquetaRepPreSaleContacto = $('#UiEtiquetaRepPreSaleContacto');
        uiEtiquetaRepPreSaleContacto.text("...");
        uiEtiquetaRepPreSaleContacto = null;
        var uiEtiquetaFecEntre = $('#UiEtiquetaFecEntre');
        uiEtiquetaFecEntre.text("...");
        uiEtiquetaFecEntre = null;
        var uiEtiquetaTotal = $('#UiEtiquetaTotal');
        uiEtiquetaTotal.text("0.00");
        uiEtiquetaTotal = null;
        var uiEtiquetaSerieDeDocumento = $('#UiEtiquetaSerieDeDocumento');
        uiEtiquetaSerieDeDocumento.text("...");
        uiEtiquetaSerieDeDocumento = null;
        var uiEtiquetaNumeroDeDocumento = $('#UiEtiquetaNumeroDeDocumento');
        uiEtiquetaNumeroDeDocumento.text("...");
        uiEtiquetaNumeroDeDocumento = null;
        var uiEtiquetaEstadoOrdenDeVenta = $("#UiEtiquetaEstadoOrdenDeVenta");
        uiEtiquetaEstadoOrdenDeVenta.text("...");
        uiEtiquetaEstadoOrdenDeVenta = null;
        var uiComentarioDeOrdenDeVenta = $('#UiEtiquetaComentarioDeOrdenDeVenta');
        uiComentarioDeOrdenDeVenta.val("...");
        uiComentarioDeOrdenDeVenta = null;
        var imgEstadoDePosteoBo = $("#imgEstadoPosteoOrdenDeVenta");
        imgEstadoDePosteoBo.css("display", "none");
        imgEstadoDePosteoBo = null;
        callback();
    };
    ResumenOrdenDeVentaControlador.prototype.cargarResumenParaReimpresion = function () {
        var _this = this;
        try {
            this.obtenerCliente(function (cliente) {
                _this.cliente = cliente;
                _this.obtenerOrdeDeVenta(function () {
                    _this.mostrarDatosCliente();
                    _this.generarListaOrdenDeVenta();
                    _this.mostrarBotones();
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al cargar el resumen:" + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerCliente = function (callback, errCallBack) {
        try {
            var cliente = new Cliente();
            cliente.clientId = gClientID;
            this.clienteServicio.obtenerCliente(cliente, this.configuracionDecimales, function (cliente) {
                callback(cliente);
            }, function (resultado) {
                errCallBack(resultado);
            });
        }
        catch (err) {
            errCallBack({ codigo: -1, mensaje: "Error al obtener el cliente: " + err.message });
        }
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerOrdeDeVenta = function (callback, errCallBack) {
        var _this = this;
        try {
            this.totalDeLaOrden = 0;
            this.tarea = new Tarea();
            this.tarea.taskId = gtaskid;
            this.tarea.taskType = gTaskType;
            this.tarea.taskStatus = TareaEstado.Completada;
            this.ordenDeVentaServicio.obtenerOrdenDeVentaPorTarea(this.tarea, this.configuracionDecimales, function (ordenDeVenta) {
                _this.ordenDeVenta = ordenDeVenta;
                _this.cliente.deliveryDate = ordenDeVenta.deliveryDate;
                _this.cliente.totalAmout = trunc_number(ordenDeVenta.totalAmount, _this.configuracionDecimales.defaultCalculationsDecimals);
                _this.cliente.appliedDiscount = ordenDeVenta.discountByGeneralAmountApplied;
                _this.mostarDatosDeOrdenDeVenta(ordenDeVenta);
                _this.listaDeSkuDeVenta = [];
                _this.listaDeSkuParaBonificacion = new Array();
                _this.totalDeLaOrden = ordenDeVenta.totalAmountDisplay;
                for (var i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
                    var detalleOrdenDeVentaDetalle = ordenDeVenta.ordenDeVentaDetalle[i];
                    var sku = new Sku();
                    sku.sku = detalleOrdenDeVentaDetalle.sku;
                    sku.skuName = detalleOrdenDeVentaDetalle.skuName;
                    sku.qty = trunc_number(detalleOrdenDeVentaDetalle.qty, _this.configuracionDecimales.defaultCalculationsDecimals);
                    sku.total = trunc_number(detalleOrdenDeVentaDetalle.totalLine, _this.configuracionDecimales.defaultCalculationsDecimals);
                    sku.cost = trunc_number(detalleOrdenDeVentaDetalle.price, _this.configuracionDecimales.defaultCalculationsDecimals);
                    sku.codePackUnit = detalleOrdenDeVentaDetalle.codePackUnit;
                    sku.isBonus = detalleOrdenDeVentaDetalle.isBonus;
                    sku.discount = detalleOrdenDeVentaDetalle.discount;
                    sku.appliedDiscount = detalleOrdenDeVentaDetalle.discount;
                    sku.discountType = detalleOrdenDeVentaDetalle.discountType;
                    sku.discountByFamily = detalleOrdenDeVentaDetalle.discountByFamily;
                    sku.typeOfDiscountByFamily = detalleOrdenDeVentaDetalle.typeOfDiscountByFamily;
                    sku.discountByFamilyAndPaymentType = detalleOrdenDeVentaDetalle.discountByFamilyAndPaymentType;
                    sku.typeOfDiscountByFamilyAndPaymentType = detalleOrdenDeVentaDetalle.typeOfDiscountByFamilyAndPaymentType;
                    if ((detalleOrdenDeVentaDetalle.long * 1) !== 0) {
                        sku.dimension = (detalleOrdenDeVentaDetalle.long * 1);
                    }
                    else {
                        sku.dimension = 0;
                    }
                    sku.totalCD = detalleOrdenDeVentaDetalle.totalAmountDisplay;
                    (sku.isBonus === 0) ? _this.listaDeSkuDeVenta.push(sku) : _this.listaDeSkuParaBonificacion.push(sku);
                }
                callback();
            }, function (resultado) {
                errCallBack(resultado);
            });
        }
        catch (err) {
            errCallBack({ codigo: -1, mensaje: "Error al obtener la orden de venta: " + err.message });
        }
    };
    ResumenOrdenDeVentaControlador.prototype.usuarioDeseaFirmarYTomarFotografia = function () {
        var _this = this;
        try {
            var mensaje = 'Desea dar por finalizada la orden de venta?';
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
                mensaje = "El Monto del pedido es Q." + format_number(this.cliente.totalAmout, this.configuracionDecimales.defaultDisplayDecimals) + " y es pagado en " + formaDePago + ", " + mensaje;
            }
            navigator.notification.confirm(mensaje, function (buttonIndex) {
                if (buttonIndex === 2) {
                    MostrarCapturaDeFirmaYFoto(OpcionFirmaYFotoTipo.Firma, function (firma, foto) {
                        _this.seguirProcesoDeCrearOrdenDeVenta(firma, foto);
                    });
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        catch (err) {
            notify("Error al mostrar firma y foto: " + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.seguirProcesoDeCrearOrdenDeVenta = function (firma, foto) {
        var _this = this;
        my_dialog("Creando orden de venta", "Espere...", "open");
        this.crearTareaParaOrdeDeVenta(function (taskId) {
            _this.tarea.taskId = taskId;
            if (_this.tarea.taskType === TareaTipo.Preventa) {
                _this.procesarOrdenDeVenta(firma, foto, function (ordenDeVenta) {
                    _this.obtenerPago(function (pago) {
                        pago.pagoDetalle[0].sourceDocSerie = ordenDeVenta.docSerie;
                        pago.pagoDetalle[0].sourceDocNum = ordenDeVenta.docNum;
                        _this.pagoServicio.guardarPago(pago, _this.esOrdenDeVentaParaCobrar, function (pagoN1) {
                            _this.obtenerFormatosDeImpresion(_this.cliente, ordenDeVenta, pagoN1, _this.esOrdenDeVentaParaCobrar, function (formatoDeOrdenDeVenta, formatoDePago) {
                                _this.cerrarDocumento(formatoDeOrdenDeVenta, formatoDePago, function () {
                                    _this.pago = null;
                                    var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                                    if (printMacAddress !== undefined && printMacAddress !== "" && printMacAddress !== null && printMacAddress !== "undefined") {
                                        printMacAddress = null;
                                        _this.preguntarSiSeImprimeOrdenDeVenta(formatoDeOrdenDeVenta, function () {
                                            _this.preguntarSiSeImprimePagoDeOrdenDeVenta(formatoDePago, _this.esOrdenDeVentaParaCobrar, function () {
                                                my_dialog("", "", "close");
                                                RegresarAPaginaAnterior("pickupplan_page");
                                            }, function (resultadoN5) {
                                                if (!_this.isImpresoraZebra) {
                                                    notify(resultadoN5.mensaje);
                                                }
                                                my_dialog("", "", "close");
                                                RegresarAPaginaAnterior("pickupplan_page");
                                            });
                                        }, function (resultadoN4) {
                                            if (!_this.isImpresoraZebra) {
                                                notify(resultadoN4.mensaje);
                                            }
                                            my_dialog("", "", "close");
                                            RegresarAPaginaAnterior("pickupplan_page");
                                        });
                                    }
                                    else {
                                        printMacAddress = null;
                                        my_dialog("", "", "close");
                                        RegresarAPaginaAnterior("pickupplan_page");
                                    }
                                }, function (resultado) {
                                    if (!_this.isImpresoraZebra) {
                                        notify(resultado.mensaje);
                                    }
                                    my_dialog("", "", "close");
                                    RegresarAPaginaAnterior("pickupplan_page");
                                });
                                if (_this.tarea.hasDraft) {
                                    var ordenDeVentaTemporal = new OrdenDeVenta();
                                    ordenDeVentaTemporal.salesOrderId = _this.tarea.salesOrderIdDraft;
                                    ordenDeVentaTemporal.docSerie = _this.tarea.salesOrderDocSerieDraft;
                                    ordenDeVentaTemporal.docNum = _this.tarea.salesOrderDocNumDraft;
                                    _this.ordenDeVentaServicio.cancelarOCompletarOrdenDeVentaDraft(ordenDeVentaTemporal, function () {
                                        _this.tarea.hasDraft = false;
                                        my_dialog("", "", "close");
                                        RegresarAPaginaAnterior("pickupplan_page");
                                        my_dialog("", "", "close");
                                    }, function (resultadoN3) {
                                        notify(resultadoN3.mensaje);
                                        RegresarAPaginaAnterior("pickupplan_page");
                                        my_dialog("", "", "close");
                                    });
                                }
                            }, function (resultadoN2) {
                                notify(resultadoN2.mensaje);
                                RegresarAPaginaAnterior("pickupplan_page");
                                my_dialog("", "", "close");
                            });
                        }, function (resultadoN1) {
                            notify(resultadoN1.mensaje);
                            RegresarAPaginaAnterior("pickupplan_page");
                            my_dialog("", "", "close");
                        });
                    });
                });
            }
        }, function (resultado) {
            my_dialog("", "", "close");
            notify(resultado.mensaje);
        });
    };
    ResumenOrdenDeVentaControlador.prototype.procesarOrdenDeVenta = function (firma, foto, callback) {
        var _this = this;
        try {
            this.prepararOrdenDeVenta(firma, foto, this.listaDeSkuDeVenta, true, function (ordenDeVenta) {
                _this.ordenDeVentaServicio.insertarOrdenDeVenta(ordenDeVenta, function () {
                    _this.listaDeSkuParaBonificacionDeCombo = Array();
                    _this.publicarCombo();
                    callback(ordenDeVenta);
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            });
        }
        catch (ex) {
            notify("Error al procesarOrdenDeVenta: " + ex.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.cerrarDocumento = function (formatoDeOrdenDeVenta, formatoDePago, callback, callbackError) {
        var _this = this;
        try {
            this.ordenDeVentaServicio.actualizarDocumnetoImpreso(this.tarea.taskId, formatoDeOrdenDeVenta, formatoDePago, function () {
                _this.tarea.taskStatus = TareaEstado.Completada;
                if (!_this.seCreoTareaAceptada) {
                    actualizarListadoDeTareas(_this.tarea.taskId, _this.tarea.taskType, _this.tarea.taskStatus, _this.cliente.clientId, _this.cliente.clientName, _this.cliente.address, 0, TareaEstado.Aceptada, _this.cliente.rgaCode);
                }
                _this.taareaServicio.actualizarTareaEstado(_this.tarea, function () {
                    callback();
                }, function (resultado) {
                    callbackError(resultado);
                });
            }, function (resultado) {
                callbackError(resultado);
            });
        }
        catch (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener formato de impresion de orden de venta: " + err.message });
        }
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerSecuenciaDeDocumentos = function (controlador, callback) {
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
    ResumenOrdenDeVentaControlador.prototype.prepararOrdenDeVenta = function (firma, foto, listaSku, esOrdenDeVentaPadre, callback) {
        var _this = this;
        try {
            this.EsOrdenDeVentaAutorizada(function (autorizada) {
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
                    ordenDeVenta.image3 = (controlador.cliente.fotoDeInicioDeVisita !== "" ? controlador.cliente.fotoDeInicioDeVisita : null);
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
                    ordenDeVenta.referenceId = localStorage.getItem("LAST_LOGIN_ID") + getDateTime() + sequence;
                    ordenDeVenta.timesPrinted = 0;
                    ordenDeVenta.paymentTimesPrinted = 0;
                    ordenDeVenta.sinc = 0;
                    ordenDeVenta.isPostedVoid = 2;
                    ordenDeVenta.isVoid = false;
                    ordenDeVenta.salesOrderType = controlador.tarea.salesOrderType;
                    ordenDeVenta.discountByGeneralAmountApplied = controlador.cliente.appliedDiscount;
                    ordenDeVenta.discountApplied = controlador.cliente.discount;
                    ordenDeVenta.taskId = controlador.tarea.taskId;
                    ordenDeVenta.salesOrderIdBo = 0;
                    ordenDeVenta.isDraft = 0;
                    ordenDeVenta.isUpdated = 1;
                    ordenDeVenta.ordenDeVentaDetalle = [];
                    ordenDeVenta.comment = controlador.cliente.salesComment;
                    ordenDeVenta.paidToDate = controlador.cliente.totalAmout;
                    ordenDeVenta.toBill = (controlador.esOrdenDeVentaParaCobrar ? 1 : 0);
                    ordenDeVenta.authorized = autorizada;
                    ordenDeVenta.isPostedValidated = 0;
                    var total = 0;
                    var i = 0;
                    var sku = new Sku();
                    var lineSequence = 0;
                    var ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                    for (i = 0; i < listaSku.length; i++) {
                        sku = listaSku[i];
                        ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                        if (sku.dimensions.length > 0) {
                            for (var _i = 0, _a = sku.dimensions; _i < _a.length; _i++) {
                                var skuConDimension = _a[_i];
                                ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                                ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                                ordenDeVentaDetalle.sku = sku.sku;
                                ordenDeVentaDetalle.lineSeq = (lineSequence + 1);
                                ordenDeVentaDetalle.qty = skuConDimension.qtySku;
                                ordenDeVentaDetalle.price = sku.cost;
                                ordenDeVentaDetalle.totalLine = skuConDimension.total;
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
                                ordenDeVentaDetalle.long = skuConDimension.dimensionSku;
                                ordenDeVentaDetalle.isSaleByMultiple = sku.isSaleByMultiple;
                                ordenDeVentaDetalle.multipleSaleQty = sku.multipleSaleQty;
                                ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                                total += ordenDeVentaDetalle.totalLine;
                                lineSequence++;
                            }
                        }
                        else {
                            ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                            ordenDeVentaDetalle.sku = sku.sku;
                            ordenDeVentaDetalle.lineSeq = (lineSequence + 1);
                            ordenDeVentaDetalle.qty = sku.qty;
                            ordenDeVentaDetalle.price = sku.cost;
                            ordenDeVentaDetalle.totalLine = sku.total;
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
                            ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                            total += ordenDeVentaDetalle.totalLine;
                        }
                    }
                    var lineSeq = i;
                    for (i = 0; i < _this.listaDeSkuParaBonificacionFinal.length; i++) {
                        sku = _this.listaDeSkuParaBonificacionFinal[i];
                        ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                        ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                        ordenDeVentaDetalle.sku = sku.sku;
                        ordenDeVentaDetalle.lineSeq = (lineSeq + 1);
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
                        ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                        lineSeq++;
                    }
                    ordenDeVenta.detailQty = ordenDeVenta.ordenDeVentaDetalle.length;
                    ordenDeVenta.totalAmount = total;
                    callback(ordenDeVenta);
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al preparar ordenDeVenta: " + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.mostrarBotones = function () {
        var _this = this;
        try {
            var uilistaFirmFotoPreVenta = $("#listaFirmFotoPreVenta");
            var uilistaFormaDePago = $("#listaFormaDePago");
            var uilistaImprimirPreVenta = $("#listaImprimirPreVenta");
            var uilistaImprimirPagoPreVenta = $("#listaImprimirPagoPreVenta");
            var uiLiEtiquetaDeTipoDePago = $("#UiLiEtiquetaDeTipoDePago");
            uilistaFirmFotoPreVenta.hide();
            uilistaFormaDePago.hide();
            uilistaImprimirPreVenta.hide();
            uilistaImprimirPagoPreVenta.hide();
            uiLiEtiquetaDeTipoDePago.hide();
            if (this.tarea.taskStatus === TareaEstado.Aceptada) {
                uilistaFirmFotoPreVenta.show();
                if (this.esOrdenDeVentaParaCobrar) {
                    uilistaFormaDePago.show();
                    this.mostrarTipoDePago();
                }
            }
            else {
                this.ordenDeVentaServicio.obtenerVecesImpresionOrdenDeVenta(this.tarea, function (cantidadDeVencesDeOrdenDeCompa, cantidadDeVencesDePago) {
                    if (cantidadDeVencesDeOrdenDeCompa < gMaxImpresiones) {
                        var uilistaImprimirPreVenta_1 = $("#listaImprimirPreVenta");
                        uilistaImprimirPreVenta_1.show();
                        uilistaImprimirPreVenta_1 = null;
                    }
                    else {
                        ToastThis("Ya ha impreso el documento " + gMaxImpresiones + " veces");
                    }
                    if (_this.esOrdenDeVentaParaCobrar) {
                        if (cantidadDeVencesDePago < gMaxImpresiones) {
                            var uilistaImprimirPagoPreVenta = $("#listaImprimirPagoPreVenta");
                            uilistaImprimirPagoPreVenta.show();
                            uilistaImprimirPagoPreVenta = null;
                            var uiLiEtiquetaDeTipoDePago_1 = $("#UiLiEtiquetaDeTipoDePago");
                            uiLiEtiquetaDeTipoDePago_1.show();
                            uiLiEtiquetaDeTipoDePago_1 = null;
                            _this.mostrarEnTareaFinalizadaTipoDePago();
                        }
                        else {
                            ToastThis("Ya ha impreso el pago del documento " + gMaxImpresiones + " veces");
                        }
                    }
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
            uilistaImprimirPreVenta = null;
            uilistaFormaDePago = null;
            uilistaFirmFotoPreVenta = null;
            uilistaImprimirPagoPreVenta = null;
            uiLiEtiquetaDeTipoDePago = null;
        }
        catch (err) {
            notify("Error al mostrar botones: " + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.mostrarDatosCliente = function () {
        try {
            var uiEtiquetaRepPreSaleRanzonSocial = $('#UiEtiquetaRepPreSaleRanzonSocial');
            uiEtiquetaRepPreSaleRanzonSocial.text(this.cliente.clientName);
            uiEtiquetaRepPreSaleRanzonSocial = null;
            var uiEtiquetaRepPreSaleDireccion = $('#UiEtiquetaRepPreSaleDireccion');
            uiEtiquetaRepPreSaleDireccion.text((this.cliente.address === undefined) ? "..." : this.cliente.address.toString());
            uiEtiquetaRepPreSaleDireccion = null;
            var uiEtiquetaRepPreSaleNoTelefono = $('#UiEtiquetaRepPreSaleNoTelefono');
            uiEtiquetaRepPreSaleNoTelefono.text(this.cliente.phone);
            uiEtiquetaRepPreSaleNoTelefono = null;
            var uiEtiquetaRepPreSaleContacto = $('#UiEtiquetaRepPreSaleContacto');
            uiEtiquetaRepPreSaleContacto.text(this.cliente.contactCustomer);
            uiEtiquetaRepPreSaleContacto = null;
            var uiEtiquetaFecEntre = $('#UiEtiquetaFecEntre');
            uiEtiquetaFecEntre.text((this.cliente.deliveryDate === undefined) ? "..." : this.cliente.deliveryDate.toString());
            uiEtiquetaFecEntre = null;
            var uiEtiquetaTotal = $('#UiEtiquetaTotal');
            uiEtiquetaTotal.text(format_number(this.obtenerTotalDeOrdenDeVenta(this.cliente.appliedDiscount, this.listaDeSkuDeVenta), this.configuracionDecimales.defaultDisplayDecimals));
            uiEtiquetaTotal = null;
            var uiComentarioDeOrdenDeVenta = $('#UiEtiquetaComentarioDeOrdenDeVenta');
            uiComentarioDeOrdenDeVenta.val(this.cliente.salesComment);
            uiComentarioDeOrdenDeVenta = null;
            var imgEstadoPosteoBo = $("#imgEstadoPosteoOrdenDeVenta");
            if (this.ordenDeVenta && this.ordenDeVenta.isPosted === 2 && this.mostrarImagenDeVerificacionDePosteoEnBo) {
                imgEstadoPosteoBo.attr("src", "../www/css/styles/images/icons-png/check-white.png");
                imgEstadoPosteoBo.css("display", "block");
            }
            else {
                imgEstadoPosteoBo.attr("src", "../www/css/styles/images/icons-png/delete-white.png");
                imgEstadoPosteoBo.css("display", "block");
            }
        }
        catch (err) {
            notify("Error al mostrar datos del cliente " + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.mostarDatosDeOrdenDeVenta = function (ordenDeVenta) {
        var uiEtiquetaSerieDeDocumento = $('#UiEtiquetaSerieDeDocumento');
        uiEtiquetaSerieDeDocumento.text(ordenDeVenta.docSerie);
        uiEtiquetaSerieDeDocumento = null;
        var uiEtiquetaNumeroDeDocumento = $('#UiEtiquetaNumeroDeDocumento');
        uiEtiquetaNumeroDeDocumento.text(ordenDeVenta.docNum);
        uiEtiquetaNumeroDeDocumento = null;
        var uiEtiquetaEstadoOrdenDeVenta = $('#UiEtiquetaEstadoOrdenDeVenta');
        if (ordenDeVenta.isVoid) {
            uiEtiquetaEstadoOrdenDeVenta.text("Anulada");
        }
        else {
            uiEtiquetaEstadoOrdenDeVenta.text("Activa");
        }
        uiEtiquetaEstadoOrdenDeVenta = null;
        this.cliente.salesComment = ordenDeVenta.comment;
    };
    ResumenOrdenDeVentaControlador.prototype.generarListaOrdenDeVenta = function () {
        try {
            var uiListaOrdenDeVenta = $('#UiListaRepPrsSale');
            uiListaOrdenDeVenta.children().remove('li');
            var i = 0;
            var sku = new Sku();
            var li = "";
            for (i = 0; i < this.listaDeSkuDeVenta.length; i++) {
                sku = this.listaDeSkuDeVenta[i];
                var totalDescuento = sku.totalCD;
                if (sku.dimensions.length > 0) {
                    for (var _i = 0, _a = sku.dimensions; _i < _a.length; _i++) {
                        var skuConDimension = _a[_i];
                        li += "<li data-icon='false' class='ui-field-contain'>";
                        li += "<p><h4>" + sku.sku + "/" + sku.skuName + "</h4></p>";
                        li += "<p>";
                        li += "<b>Denominacion: </b><span>" + sku.codePackUnit + " </span>";
                        li += "<b> Cant: </b><span>" + skuConDimension.qtySku + " </span>";
                        li += "<br/><b>Pre: </b><span>" + format_number(sku.cost, this.configuracionDecimales.defaultDisplayDecimals) + " </span>";
                        if (sku.discount !== 0) {
                            li += "<b> Des: </b><span>" + format_number(sku.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                            li += "<b> Total: </b><span>" + format_number(sku.total, this.configuracionDecimales.defaultDisplayDecimals) + " </span>";
                            li += "<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(totalDescuento, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                        }
                        else {
                            li += "<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(skuConDimension.total, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                        }
                        li += "<b>Dimensión: </b><span>" + format_number(skuConDimension.dimensionSku, this.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                        li += "</p>";
                    }
                }
                else {
                    li = "<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
                    li += "<p><h4>" + sku.sku + "/" + sku.skuName + "</h4></p>";
                    li += "<p>";
                    li += "<b>Denominacion: </b><span>" + sku.codePackUnit + " </span>";
                    li += "<b> Cant: </b><span>" + sku.qty + " </span>";
                    li += "<br/><b>Pre: </b><span>" + format_number(sku.cost, this.configuracionDecimales.defaultDisplayDecimals) + " </span>";
                    if (sku.discount !== 0) {
                        switch (sku.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                li += "<b> Des: </b><span>" + format_number(sku.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                li += "<b> Des: </b><span>" + DarFormatoAlMonto(format_number(sku.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                break;
                        }
                        if (sku.discountByFamily !== 0) {
                            switch (sku.typeOfDiscountByFamily) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DMF: </b><span>" + format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DMF: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                        }
                        if (sku.discountByFamilyAndPaymentType !== 0) {
                            switch (sku.typeOfDiscountByFamilyAndPaymentType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DFP: </b><span>" + format_number(sku.discountByFamilyAndPaymentType, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DFP: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamilyAndPaymentType, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                        }
                        li += "<b> Total: </b><span>" + format_number(totalDescuento, this.configuracionDecimales.defaultDisplayDecimals) + " </span>";
                        li += "<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(totalDescuento, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                    }
                    else {
                        if (sku.discountByFamily !== 0) {
                            switch (sku.typeOfDiscountByFamily) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DMF: </b><span>" + format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DMF: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                        }
                        if (sku.discountByFamilyAndPaymentType !== 0) {
                            switch (sku.typeOfDiscountByFamilyAndPaymentType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DFP: </b><span>" + format_number(sku.discountByFamilyAndPaymentType, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DFP: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamilyAndPaymentType, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                        }
                        li += "<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(totalDescuento, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                    }
                    if (sku.dimension > 0) {
                        li += "<b>Dimensión: </b><span>" + format_number(sku.dimension, this.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                    }
                    li += "</p>";
                }
                uiListaOrdenDeVenta.append(li);
            }
            uiListaOrdenDeVenta.listview('refresh');
            for (i = 0; i < this.listaDeSkuParaBonificacion.length; i++) {
                sku = this.listaDeSkuParaBonificacion[i];
                li = "<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
                li += "<p><h4>" + sku.sku + "/" + sku.skuName + "</h4></p>";
                li += "<p>";
                li += "<b>Denominacion: </b><span>" + sku.codePackUnit + " </span>";
                li += "<b> Cantidad: </b><span>" + sku.qty + " </span>";
                li += "</p>";
                uiListaOrdenDeVenta.append(li);
            }
            uiListaOrdenDeVenta.listview('refresh');
            uiListaOrdenDeVenta = null;
        }
        catch (err) {
            notify("Error al generar la lista de orden de venta: " + err.message);
        }
    };
    ResumenOrdenDeVentaControlador.prototype.usuarioDeseaReImprimirlaVenta = function () {
        var _this = this;
        try {
            if (this.tarea.taskType === TareaTipo.Preventa) {
                this.ordenDeVentaServicio.obtenerFormatoImpresoOrdenDeVenta(this.tarea, function (formato) {
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    var impresionServicio = new ImpresionServicio();
                    var printMacAddress = localStorage.getItem('PRINTER_ADDRESS');
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
    ResumenOrdenDeVentaControlador.prototype.usuarioDeseaReImprimirlaVentaPago = function () {
        var _this = this;
        try {
            if (this.tarea.taskType === TareaTipo.Preventa) {
                this.ordenDeVentaServicio.obtenerFormatoImpresoOrdenDeVentaPago(this.tarea, function (formato) {
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    var impresionServicio = new ImpresionServicio();
                    var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                    impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formato, true, function (resultado) {
                        if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                            _this.ordenDeVenta.paymentTimesPrinted += 1;
                            _this.ordenDeVentaServicio.actualizarVecesImpresionOrdenDeVenta(_this.tarea, _this.ordenDeVenta, function () {
                                if (_this.ordenDeVenta.paymentTimesPrinted === gMaxImpresiones) {
                                    var uilistaImprimirPagoPreVenta = $("#listaImprimirPagoPreVenta");
                                    uilistaImprimirPagoPreVenta.hide();
                                    uilistaImprimirPagoPreVenta = null;
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
    ResumenOrdenDeVentaControlador.prototype.crearTareaParaOrdeDeVenta = function (callback, errCallBack) {
        var _this = this;
        try {
            if (this.tarea.taskId === 0) {
                this.creatTarea(this.tarea, this.cliente, function (taskId) {
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
            errCallBack({ codigo: -1, mensaje: "Error al crear la tarea:" + err.message });
        }
    };
    ResumenOrdenDeVentaControlador.prototype.creatTarea = function (tarea, cliente, callback, errCallBack) {
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
            errCallBack({ codigo: -1, mensaje: "Error al crear la tarea:" + err.message });
        }
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerConfiguracionDeDecimales = function () {
        var _this = this;
        this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this.configuracionDecimales = decimales;
        }, function (operacion) {
            notify(operacion.mensaje);
        });
    };
    ResumenOrdenDeVentaControlador.prototype.publicarCliente = function () {
        var msg = new ClienteMensaje(this);
        msg.cliente = this.cliente;
        this.mensajero.publish(msg, getType(ClienteMensaje));
    };
    ResumenOrdenDeVentaControlador.prototype.usuarioDeseaModifcarCliente = function () {
        this.cliente.origen = "ResumenOrdenDeVentaControlador";
        this.publicarCliente();
        $.mobile.changePage("UiPageCustomerInfo", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false,
            data: {
                "cliente": this.cliente,
                "tarea": this.tarea,
                "configuracionDecimales": this.configuracionDecimales
            }
        });
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerBonificacionPorUnidad = function (sku) {
        try {
            if (sku.qty !== 0) {
                for (var i = 0; i < this.listaDeSkuParaBonificacionFinal.length; i++) {
                    var skuBonificacion = this.listaDeSkuParaBonificacionFinal[i];
                    if (sku.sku === skuBonificacion.parentCodeSku && sku.codePackUnit === skuBonificacion.parentCodePackUnit) {
                        return skuBonificacion;
                    }
                }
            }
            return new Sku();
        }
        catch (err) {
            notify("Error al obtener bonificacion por unidad: " + err.message);
            return new Sku();
        }
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerTotalDeOrdenDeVenta = function (descuento, listaDeSku) {
        return this.totalDeLaOrden;
    };
    ResumenOrdenDeVentaControlador.prototype.obtenerFormatosDeImpresion = function (cliente, ordenDeVenta, pago, esOrdenDeVentaParaCobrar, callback, callbackError) {
        var _this = this;
        this.ordenDeVentaServicio.obtenerFormatoDeImpresionPreSale(cliente, ordenDeVenta, function (formatoDeOrdenDeVenta) {
            if (esOrdenDeVentaParaCobrar) {
                _this.pagoServicio.obtenerFormatoDeImpresionDePago(cliente, ordenDeVenta, pago, function (formatoDePago) {
                    callback(formatoDeOrdenDeVenta, formatoDePago);
                }, function (resultadoN1) {
                    notify(resultadoN1.mensaje);
                });
            }
            else {
                callback(formatoDeOrdenDeVenta, "");
            }
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    ResumenOrdenDeVentaControlador.prototype.preguntarSiSeImprimeOrdenDeVenta = function (formatoDeOrdenDeVenta, callback, callbackError) {
        var _this = this;
        navigator.notification.confirm("Desea imprimir la orden de venta?", function (respuesta) {
            if (respuesta === 2) {
                my_dialog("", "", "close");
                my_dialog("Espere...", "validando impresora", "open");
                var impresionServicio = new ImpresionServicio();
                var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formatoDeOrdenDeVenta, true, function (resultado) {
                    if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                        callback();
                    }
                    else {
                        callbackError({ codigo: -1, mensaje: resultado.mensaje });
                    }
                });
            }
            else {
                callback();
            }
        }, "Sonda® " + SondaVersion, "No,Si");
    };
    ResumenOrdenDeVentaControlador.prototype.preguntarSiSeImprimePagoDeOrdenDeVenta = function (formatoDePago, esOrdenDeVentaParaCobrar, callback, callbackError) {
        var _this = this;
        if (esOrdenDeVentaParaCobrar) {
            navigator.notification.confirm("Desea imprimir el pago de la orden de venta?", function (respuesta) {
                if (respuesta === 2) {
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    var impresionServicio = new ImpresionServicio();
                    var printMacAddress = localStorage.getItem('PRINTER_ADDRESS');
                    impresionServicio.validarEstadosYImprimir(_this.isImpresoraZebra, printMacAddress, formatoDePago, true, function (resultado) {
                        if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                            callback();
                        }
                        else {
                            callbackError({ codigo: -1, mensaje: resultado.mensaje });
                        }
                    });
                }
                else {
                    callback();
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        else {
            callback();
        }
    };
    ResumenOrdenDeVentaControlador.prototype.validarPedidoTipoCobro = function (callback) {
        var _this = this;
        this.taareaServicio.obtenerRegla("CobrarOrdenDeVenta", function (listaDeReglas) {
            if (listaDeReglas.length > 0 && listaDeReglas[0].enabled === 'Si') {
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
    ResumenOrdenDeVentaControlador.prototype.usuarioDeseaSeleccionarFormaDePago = function () {
        this.publicarCliente();
        this.publicarListaDeSkuOrdenDeVenta();
        this.publicarTarea();
        this.publicarPago();
        $.mobile.changePage("#UiPagePayment", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });
    };
    ResumenOrdenDeVentaControlador.prototype.publicarTarea = function () {
        var msg = new TareaMensaje(this);
        msg.tarea = this.tarea;
        this.mensajero.publish(msg, getType(TareaMensaje));
    };
    ResumenOrdenDeVentaControlador.prototype.publicarListaDeSkuOrdenDeVenta = function () {
        var msg = new ListaSkuMensaje(this);
        msg.listaSku = this.listaDeSkuDeVenta;
        msg.listaDeSkuParaBonificacion = this.listaDeSkuParaBonificacionFinal;
        this.mensajero.publish(msg, getType(ListaSkuMensaje));
    };
    ResumenOrdenDeVentaControlador.prototype.publicarPago = function () {
        var msg = new PagoMensaje(this);
        msg.pago = this.pago;
        this.mensajero.publish(msg, getType(PagoMensaje));
    };
    ResumenOrdenDeVentaControlador.prototype.mostrarTipoDePago = function () {
        var uiBotonDeFormaDePago = $("#UiBotonDeFormaDePago");
        try {
            if (this.pago === null || this.pago === undefined) {
                uiBotonDeFormaDePago.text('Efectivo');
            }
            else {
                switch (this.pago.pagoDetalle[0].paymentType) {
                    case TipoDePago.Efectivo.toString():
                        uiBotonDeFormaDePago.text('Efectivo');
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
    ResumenOrdenDeVentaControlador.prototype.obtenerPago = function (callback) {
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
    ResumenOrdenDeVentaControlador.prototype.mostrarEnTareaFinalizadaTipoDePago = function () {
        this.pagoServicio.obtenerTipoDePagoPorDocumentoDeOrdenDeVenta(this.ordenDeVenta, function (tipoDePago) {
            var uiEtiquetaDeTipoDePago = $("#UiEtiquetaDeTipoDePago");
            switch (tipoDePago) {
                case TipoDePago.Efectivo.toString():
                    uiEtiquetaDeTipoDePago.text("Efectivo");
                    break;
                case TipoDePago.Cheque.toString():
                    uiEtiquetaDeTipoDePago.text("Cheque");
                    break;
            }
            uiEtiquetaDeTipoDePago = null;
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    ResumenOrdenDeVentaControlador.prototype.EsOrdenDeVentaAutorizada = function (callback, errCallback) {
        this.taareaServicio.obtenerRegla("OrdenesDeVentaNoAutorizadas", function (listaDeReglas) {
            if (listaDeReglas.length > 0 && listaDeReglas[0].enabled === 'Si') {
                callback(false);
            }
            else {
                callback(true);
            }
        }, function (resultado) {
            errCallback(resultado);
        });
    };
    ResumenOrdenDeVentaControlador.prototype.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo = function (bonosNormales, bonosPorCombo, callback, errCallback) {
        try {
            var bonosFinales = [];
            var existe = false;
            for (var l = 0; l < bonosPorCombo.length; l++) {
                if (!bonosPorCombo[l].isConfig) {
                    if (!this.usuarioPuedeModificarBonificacionDeCombo || localStorage.getItem("USE_MAX_BONUS") === "1") {
                        if (bonosPorCombo[l].bonusSubType === SubTipoDeBonificacionPorCombo.Multiple.toString() || (bonosPorCombo[l].bonusSubType === SubTipoDeBonificacionPorCombo.Unica.toString() && bonosPorCombo[l].skusDeBonoPorCombo.length === 1)) {
                            bonosPorCombo[l].skusDeBonoPorComboAsociados = bonosPorCombo[l].skusDeBonoPorCombo;
                            bonosPorCombo[l].isConfig = true;
                            bonosPorCombo[l].isEmpty = false;
                        }
                    }
                }
            }
            for (var j = 0; j < bonosPorCombo.length; j++) {
                if (bonosPorCombo[j].isConfig) {
                    for (var k = 0; k < bonosPorCombo[j].skusDeBonoPorComboAsociados.length; k++) {
                        for (var i = 0; i < bonosNormales.length; i++) {
                            if (bonosNormales[i].sku === bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codeSku && bonosNormales[i].codePackUnit === bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codePackUnit) {
                                existe = true;
                                bonosNormales[i].qty += bonosPorCombo[j].skusDeBonoPorComboAsociados[k].qty;
                                break;
                            }
                        }
                        if (!existe) {
                            var skuParaBonificacion = new Sku();
                            skuParaBonificacion.sku = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codeSku;
                            skuParaBonificacion.codePackUnit = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codePackUnit;
                            skuParaBonificacion.skuName = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].descriptionSku;
                            skuParaBonificacion.skuDescription = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].descriptionSku;
                            skuParaBonificacion.qty = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].qty;
                            skuParaBonificacion.parentCodeSku = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codeSku;
                            skuParaBonificacion.parentCodePackUnit = bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codePackUnit;
                            skuParaBonificacion.skuPrice = 0;
                            skuParaBonificacion.discount = 0;
                            skuParaBonificacion.multipleSaleQty = 0;
                            skuParaBonificacion.isSaleByMultiple = false;
                            bonosNormales.push(skuParaBonificacion);
                            skuParaBonificacion = null;
                        }
                        existe = false;
                    }
                }
            }
            callback(bonosNormales);
        }
        catch (e) {
            errCallback({ codigo: -1, mensaje: "Error al unir bonificaciones del pedido: " + e.message });
        }
    };
    ResumenOrdenDeVentaControlador.prototype.publicarCombo = function () {
        var listaDeSkuParaBonificacionDeCombo = [];
        var msg = new ListaDeSkuParaBonificacionDeComboMensaje(this);
        msg.listaDeSkuParaBonificacionDeCombo = listaDeSkuParaBonificacionDeCombo;
        this.mensajero.publish(msg, getType(ListaDeSkuParaBonificacionDeComboMensaje));
    };
    return ResumenOrdenDeVentaControlador;
}());
//# sourceMappingURL=ResumenOrdenDeVentaControlador.js.map