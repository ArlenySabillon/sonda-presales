class ResumenOrdenDeVentaControlador {
    tokenCliente: SubscriptionToken;
    tokenTarea: SubscriptionToken;
    tokenListaOrdenDeVenta: SubscriptionToken;
    tokenPago: SubscriptionToken;

    ordenDeVentaServicio = new OrdenDeVentaServicio();
    taareaServicio = new TareaServcio();
    clienteServicio = new ClienteServicio();
    manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
    pagoServicio = new PagoServicio();
    bonoServicio = new BonoServicio();

    cliente: Cliente;
    tarea: Tarea;
    ordenDeVenta: OrdenDeVenta;
    pago: PagoEncabezado;
    listaDeSkuDeVenta: Sku[] = [];
    configuracionDecimales: ManejoDeDecimales;
    seCreoTareaAceptada: boolean = false;
    listaSkuOrdenDeVentaPrincipal: Sku[] = [];
    listaDeOrdnesDeVEntaCf: (Sku[])[] = [];
    ordenDeVentaPricipal = new OrdenDeVenta();
    listaDeSkuParaBonificacion = Array<Sku>();
    esOrdenDeVentaParaCobrar: boolean = false;
    listaDeSkuParaBonificacionDeCombo = Array<BonoPorCombo>();
    listaDeSkuParaBonificacionFinal = Array<Sku>();
    usuarioPuedeModificarBonificacionDeCombo: boolean = false;
    isImpresoraZebra = (localStorage.getItem("isPrinterZebra") === "1");
    totalDeLaOrden: number = 0;

    mostrarImagenDeVerificacionDePosteoEnBo: boolean = false;

    constructor(public mensajero: Messenger) {
    }

    clienteEntregado(mensaje: ClienteMensaje, subcriber: any) {
        subcriber.cliente = mensaje.cliente;
    }

    tareaEntregado(mensaje: TareaMensaje, subcriber: any) {
        subcriber.tarea = mensaje.tarea;
        subcriber.esReimpresion = false;
    }

    listaDeSkuDeVentaEntregado(mensaje: ListaSkuMensaje, subcriber: any) {
        subcriber.listaDeSkuDeVenta = mensaje.listaSku;
        subcriber.listaSkuOrdenDeVentaPrincipal = [];
        subcriber.listaDeOrdnesDeVEntaCf = [];
        subcriber.listaDeSkuParaBonificacion = mensaje.listaDeSkuParaBonificacion;
        subcriber.listaDeSkuParaBonificacionDeCombo = mensaje.listaDeSkuParaBonificacionDeCombo;
        subcriber.usuarioPuedeModificarBonificacionDeCombo = mensaje.usuarioPuedeModificarBonificacionDeCombo;

        subcriber.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(subcriber.listaDeSkuParaBonificacion, subcriber.listaDeSkuParaBonificacionDeCombo, (bonosFinales: Array<Sku>) => {
            subcriber.listaDeSkuParaBonificacionFinal = bonosFinales;
        }, (resultado: Operacion) => {
            notify(resultado.mensaje);
        });
    }

    pagoEntregado(mensaje: PagoMensaje, subcriber: any) {
        subcriber.pago = mensaje.pago;

        let uiBotonDeFormaDePago = $("#UiBotonDeFormaDePago");
        if (subcriber.pago === null || subcriber.pago === undefined) {
            uiBotonDeFormaDePago.text("Efectivo");
        } else {
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
    }

    delegarResumenOrdenDeVentaControlador() {

        var este = this;

        $("#UiPageRepPreSale").on("pageshow", () => {
            este.bonoServicio.validarSiModificaBonificacionPorCombo((puedeModificar: boolean) => {
                este.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
                este.esOrdenDeVentaParaCobrar = false;
                este.obtenerConfiguracionDeDecimales();
                este.cargarResumen();
            },
                (resultado: Operacion) => {
                    this.usuarioPuedeModificarBonificacionDeCombo = false;
                    notify("Error al validar si puede modificar la bonificacion por combo: " + resultado.mensaje);
                });
        });

        $("#UiBotonFimaFotoPresale").bind("touchstart", () => {
            this.usuarioDeseaFirmarYTomarFotografia();
        });

        $("#UiBotonDeFormaDePago").bind("touchstart", () => {
            this.usuarioDeseaSeleccionarFormaDePago();
        });

        $("#UiBotonImprimirPresale").bind("touchstart", () => {
            let printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            if (printMacAddress !== undefined && printMacAddress !== "" && printMacAddress !== null) {
                printMacAddress = null;
                navigator.notification.confirm("Desea imprimir la orden de venta?", (buttonIndex) => {
                    if (buttonIndex === 2) {
                        this.usuarioDeseaReImprimirlaVenta();
                    }
                }, "Sonda® " + SondaVersion, <any>"No,Si");
            } else {
                notify("No tiene asociada una impresora");
                printMacAddress = null;
            }
        });

        $("#UiBotonImprimirPagoPreVenta").bind("touchstart", () => {
            let printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            if (printMacAddress !== undefined && printMacAddress !== "" && printMacAddress !== null) {
                printMacAddress = null;
                navigator.notification.confirm("Desea imprimir el pago de la orden de venta?", (buttonIndex) => {
                    if (buttonIndex === 2) {
                        this.usuarioDeseaReImprimirlaVentaPago();
                    }
                }, "Sonda® " + SondaVersion, <any>"No,Si");
            } else {
                notify("No tiene asociada una impresora");
                printMacAddress = null;
            }
        });

        //$("#UiPageRepPreSale").on("swiperight", () => {
        //    if (gVentaEsReimpresion) {
        //        var myPanel = <any>$.mobile.activePage.children('[id="UiPanelDerrecho"]');
        //        myPanel.panel("toggle");
        //    }
        //});

// ReSharper disable once TsResolvedFromInaccessibleModule
        $("#UiPageRepPreSale").swipe({
            swipe: (event, direction, distance, duration, fingerCount, fingerData) => {
                if (fingerCount === 1 && direction === "right") {
                    if (gVentaEsReimpresion) {
                        var myPanel = <any>$.mobile.activePage.children('[id="UiPanelDerrecho"]');
                        myPanel.panel("toggle");
                    }
                }
            }
        });

        $("#UIBotonCrearOrdenDeVenta").bind("touchstart", () => {
            this.usuarioDeseaCrearTareaPreventa();
        });

        $("#UIBotonModificcarClienteDesdeResumen").bind("touchstart", () => {
            this.usuarioDeseaModifcarCliente();
        });
    }

    usuarioDeseaCrearTareaPreventa() {
        try {
            this.creatTarea(this.tarea, this.cliente, (taskId: number) => {
                gtaskid = taskId;
                gTaskType = this.tarea.taskType;
                gClientID = this.cliente.clientId;
                gVentaEsReimpresion = false;

                actualizarListadoDeTareas(gtaskid, this.tarea.taskType, TareaEstado.Asignada, this.cliente.clientId, this.cliente.clientName, this.cliente.address, 0, "", this.cliente.rgaCode);

                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });

            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
        } catch (err) {
            notify("Error al crear la tarea: " + err.message);
        }
    }

    cargarResumen() {
        this.limpiarCamposDeResumenDeVenta(() => {
            this.validarPedidoTipoCobro(() => {
                if (gVentaEsReimpresion) {
                    this.cargarResumenParaReimpresion();
                    this.mostrarImagenDeVerificacionDePosteoEnBo = true;
                } else {
                    this.mostrarImagenDeVerificacionDePosteoEnBo = false;
                    ObtenerPosicionGPS(() => {
                    });
                    this.mostrarDatosCliente();
                    this.generarListaOrdenDeVenta();
                    this.mostrarBotones();
                   
                    if (this.esOrdenDeVentaParaCobrar) {
                        notify("Debe de cobrar la orden de venta");
                    }

                    var uiEtiquetaEstadoOrdenDeVenta = $('#UiEtiquetaEstadoOrdenDeVenta');
                    uiEtiquetaEstadoOrdenDeVenta.text("Activa");
                    uiEtiquetaEstadoOrdenDeVenta = null;
                }
            });
        });
    }

    limpiarCamposDeResumenDeVenta(callback: () => void) {
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

        let imgEstadoDePosteoBo = $("#imgEstadoPosteoOrdenDeVenta");
        imgEstadoDePosteoBo.css("display", "none");
        imgEstadoDePosteoBo = null;
        
        callback();
    }

    cargarResumenParaReimpresion() {
        try {
            this.obtenerCliente((cliente: Cliente) => {
                this.cliente = cliente;
                this.obtenerOrdeDeVenta(() => {
                    this.mostrarDatosCliente();
                    this.generarListaOrdenDeVenta();
                    this.mostrarBotones();
                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
        } catch (err) {
            notify("Error al cargar el resumen:" + err.message);
        }
    }

    obtenerCliente(callback: (cliente: Cliente) => void, errCallBack: (resultado: Operacion) => void) {
        try {
            var cliente = new Cliente();
            cliente.clientId = gClientID;

            this.clienteServicio.obtenerCliente(cliente, this.configuracionDecimales, (cliente: Cliente) => {
                callback(cliente);
            }, (resultado: Operacion) => {
                errCallBack(resultado);
            });
        } catch (err) {
            errCallBack(<Operacion>{ codigo: -1, mensaje: "Error al obtener el cliente: " + err.message });
        }
    }

    obtenerOrdeDeVenta(callback: () => void, errCallBack: (resultado: Operacion) => void) {
        try {
            this.totalDeLaOrden = 0;
            this.tarea = new Tarea();
            this.tarea.taskId = gtaskid;
            this.tarea.taskType = gTaskType;
            this.tarea.taskStatus = TareaEstado.Completada;
            this.ordenDeVentaServicio.obtenerOrdenDeVentaPorTarea(this.tarea, this.configuracionDecimales, (ordenDeVenta: OrdenDeVenta) => {
                this.ordenDeVenta = ordenDeVenta;
                this.cliente.deliveryDate = ordenDeVenta.deliveryDate;
                this.cliente.totalAmout = trunc_number(ordenDeVenta.totalAmount, this.configuracionDecimales.defaultCalculationsDecimals);
                this.cliente.appliedDiscount = ordenDeVenta.discountByGeneralAmountApplied;
                this.mostarDatosDeOrdenDeVenta(ordenDeVenta);
                this.listaDeSkuDeVenta = [];
                this.listaDeSkuParaBonificacion = new Array<Sku>();
                this.totalDeLaOrden = ordenDeVenta.totalAmountDisplay;
                for (var i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
                    var detalleOrdenDeVentaDetalle = ordenDeVenta.ordenDeVentaDetalle[i];
                    var sku = new Sku();
                    sku.sku = detalleOrdenDeVentaDetalle.sku;
                    sku.skuName = detalleOrdenDeVentaDetalle.skuName;
                    sku.qty = trunc_number(detalleOrdenDeVentaDetalle.qty, this.configuracionDecimales.defaultCalculationsDecimals);
                    sku.total = trunc_number(detalleOrdenDeVentaDetalle.totalLine, this.configuracionDecimales.defaultCalculationsDecimals);
                    sku.cost = trunc_number(detalleOrdenDeVentaDetalle.price, this.configuracionDecimales.defaultCalculationsDecimals);
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
                    } else {
                        sku.dimension = 0;
                    }
                    sku.totalCD = detalleOrdenDeVentaDetalle.totalAmountDisplay;
                    (sku.isBonus === 0) ? this.listaDeSkuDeVenta.push(sku) : this.listaDeSkuParaBonificacion.push(sku);
                }
                callback();
            }, (resultado: Operacion) => {
                errCallBack(resultado);
            });
        } catch (err) {
            errCallBack(<Operacion>{ codigo: -1, mensaje: "Error al obtener la orden de venta: " + err.message });
        }
    }

    usuarioDeseaFirmarYTomarFotografia() {
        try {
            let mensaje = 'Desea dar por finalizada la orden de venta?';
            let formaDePago = "";
            if (this.pago === null || this.pago === undefined) {
                formaDePago = "Efectivo";
            } else {
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

            navigator.notification.confirm(mensaje, (buttonIndex) => {
                if (buttonIndex === 2) {
                    MostrarCapturaDeFirmaYFoto(OpcionFirmaYFotoTipo.Firma, (firma: string, foto: string) => {
                        this.seguirProcesoDeCrearOrdenDeVenta(firma, foto);
                    });
                }
            }, "Sonda® " + SondaVersion, <any>"No,Si");
        } catch (err) {
            notify("Error al mostrar firma y foto: " + err.message);
        }
    }

    seguirProcesoDeCrearOrdenDeVenta(firma: string, foto: string) {
        my_dialog("Creando orden de venta", "Espere...", "open");
        this.crearTareaParaOrdeDeVenta((taskId: number) => {
            this.tarea.taskId = taskId;
            if (this.tarea.taskType === TareaTipo.Preventa) {
                this.procesarOrdenDeVenta(firma, foto, (ordenDeVenta: OrdenDeVenta) => {
                    //my_dialog("", "", "close");

                    this.obtenerPago((pago: PagoEncabezado) => {
                        pago.pagoDetalle[0].sourceDocSerie = ordenDeVenta.docSerie;
                        pago.pagoDetalle[0].sourceDocNum = ordenDeVenta.docNum;

                        this.pagoServicio.guardarPago(pago, this.esOrdenDeVentaParaCobrar, (pagoN1) => {
                            this.obtenerFormatosDeImpresion(this.cliente, ordenDeVenta, pagoN1, this.esOrdenDeVentaParaCobrar, (formatoDeOrdenDeVenta: string, formatoDePago: string) => {
                                this.cerrarDocumento(formatoDeOrdenDeVenta, formatoDePago, () => {
                                    this.pago = null;
                                    let printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                                    if (printMacAddress !== undefined && printMacAddress !== "" && printMacAddress !== null && printMacAddress !== "undefined") {
                                        printMacAddress = null;
                                        this.preguntarSiSeImprimeOrdenDeVenta(formatoDeOrdenDeVenta, () => {
                                            this.preguntarSiSeImprimePagoDeOrdenDeVenta(formatoDePago, this.esOrdenDeVentaParaCobrar, () => {
                                                my_dialog("", "", "close");
                                                RegresarAPaginaAnterior("pickupplan_page");
                                            }, (resultadoN5: Operacion) => {
                                                if (!this.isImpresoraZebra) {
                                                    notify(resultadoN5.mensaje);
                                                }
                                                my_dialog("", "", "close");
                                                RegresarAPaginaAnterior("pickupplan_page");

                                            });
                                        }, (resultadoN4: Operacion) => {
                                            if (!this.isImpresoraZebra) {
                                                notify(resultadoN4.mensaje);
                                            }
                                            my_dialog("", "", "close");
                                            RegresarAPaginaAnterior("pickupplan_page");
                                        });
                                    } else {
                                        printMacAddress = null;
                                        my_dialog("", "", "close");
                                        RegresarAPaginaAnterior("pickupplan_page");
                                    }

                                }, (resultado: Operacion) => {
                                    if (!this.isImpresoraZebra) {
                                        notify(resultado.mensaje);
                                    }
                                    my_dialog("", "", "close");
                                    RegresarAPaginaAnterior("pickupplan_page");
                                });
                                if (this.tarea.hasDraft) {
                                    const ordenDeVentaTemporal = new OrdenDeVenta();
                                    ordenDeVentaTemporal.salesOrderId = this.tarea.salesOrderIdDraft;
                                    ordenDeVentaTemporal.docSerie = this.tarea.salesOrderDocSerieDraft;
                                    ordenDeVentaTemporal.docNum = this.tarea.salesOrderDocNumDraft;
                                    this.ordenDeVentaServicio.cancelarOCompletarOrdenDeVentaDraft(ordenDeVentaTemporal, () => {
                                        this.tarea.hasDraft = false;
                                        my_dialog("", "", "close");
                                        RegresarAPaginaAnterior("pickupplan_page");
                                        my_dialog("", "", "close");
                                    }, (resultadoN3: Operacion) => {
                                        notify(resultadoN3.mensaje);
                                        RegresarAPaginaAnterior("pickupplan_page");
                                        my_dialog("", "", "close");
                                    });
                                }

                            }, (resultadoN2: Operacion) => {
                                notify(resultadoN2.mensaje);
                                RegresarAPaginaAnterior("pickupplan_page");
                                my_dialog("", "", "close");
                            });
                        }, (resultadoN1: Operacion) => {
                            notify(resultadoN1.mensaje);
                            RegresarAPaginaAnterior("pickupplan_page");
                            my_dialog("", "", "close");
                        });
                    });
                });
            }
        }, (resultado: Operacion) => {
            my_dialog("", "", "close");
            notify(resultado.mensaje);
        });
    }

    procesarOrdenDeVenta(firma: string, foto: string, callback: (ordenDeVenta: OrdenDeVenta) => void) {
        try {
            this.prepararOrdenDeVenta(firma, foto, this.listaDeSkuDeVenta, true, (ordenDeVenta: OrdenDeVenta) => {
                this.ordenDeVentaServicio.insertarOrdenDeVenta(ordenDeVenta, () => {
                    this.listaDeSkuParaBonificacionDeCombo = Array<BonoPorCombo>();
                    this.publicarCombo();

                    callback(ordenDeVenta);
                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            });
        } catch (ex) {
            notify("Error al procesarOrdenDeVenta: " + ex.message);
        }
    }
    
    cerrarDocumento(formatoDeOrdenDeVenta: string, formatoDePago: string, callback: () => void, callbackError: (resultado: Operacion) => void) {
        try {
            this.ordenDeVentaServicio.actualizarDocumnetoImpreso(this.tarea.taskId, formatoDeOrdenDeVenta, formatoDePago, () => {
                this.tarea.taskStatus = TareaEstado.Completada;
                if (!this.seCreoTareaAceptada) {
                    actualizarListadoDeTareas(this.tarea.taskId, this.tarea.taskType, this.tarea.taskStatus, this.cliente.clientId, this.cliente.clientName, this.cliente.address, 0, TareaEstado.Aceptada, this.cliente.rgaCode);
                }
                this.taareaServicio.actualizarTareaEstado(this.tarea, () => {
                    callback();
                }, (resultado: Operacion) => {
                    callbackError(resultado);
                });

            }, (resultado: Operacion) => {
                callbackError(resultado);
            });
        } catch (err) {
            callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener formato de impresion de orden de venta: " + err.message });
        }
    }

    obtenerSecuenciaDeDocumentos(controlador: any, callback: (sequence: string, serie: string, numeroDeDocumento: number, controlador: any) => void) {
        try {
            GetNexSequence("SALES", (sequence) => {
                ObtenerSecuenciaSiguiente(TipoDocumento.OrdenDeVenta, (serie, numeroDeDocumento) => {
                    callback(sequence, serie, numeroDeDocumento, controlador);
                }, (err) => {
                    notify("Error al obtener sequencia de documento: " + err.message);
                });
            }, (err) => {
                notify("Error al obtener sequencia de documento: " + err.message);
            });
        } catch (err) {
            notify("Error al obtener secuencia de documento: " + err.message);
        }
    }

    prepararOrdenDeVenta(firma: string, foto: string, listaSku: Sku[], esOrdenDeVentaPadre: boolean, callback: (ordenDeVenta: OrdenDeVenta) => void) {
        try {
            this.EsOrdenDeVentaAutorizada((autorizada: boolean) => {
                this.obtenerSecuenciaDeDocumentos(this, (sequence: string, serie: string, numeroDeDocumento: number, controlador: any) => {
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

                    let i = 0;
                    let sku = new Sku();
                    let lineSequence = 0;
                    let ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                    for (i = 0; i < listaSku.length; i++) {
                        sku = listaSku[i];
                        ordenDeVentaDetalle = new OrdenDeVentaDetalle();

                        if (sku.dimensions.length > 0) {
                            for (let skuConDimension of sku.dimensions) {
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
                        } else {
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

                    //------ Agregar sku de bonificacion
                    let lineSeq = i;
                    for (i = 0; i < this.listaDeSkuParaBonificacionFinal.length; i++) {
                        sku = this.listaDeSkuParaBonificacionFinal[i];
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
            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
        } catch (err) {
            notify("Error al preparar ordenDeVenta: " + err.message);
        }
    }

    mostrarBotones() {
        try {
            let uilistaFirmFotoPreVenta = $("#listaFirmFotoPreVenta");
            let uilistaFormaDePago = $("#listaFormaDePago");
            let uilistaImprimirPreVenta = $("#listaImprimirPreVenta");
            let uilistaImprimirPagoPreVenta = $("#listaImprimirPagoPreVenta");
            let uiLiEtiquetaDeTipoDePago = $("#UiLiEtiquetaDeTipoDePago");
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
            } else {
                this.ordenDeVentaServicio.obtenerVecesImpresionOrdenDeVenta(this.tarea, (cantidadDeVencesDeOrdenDeCompa: number, cantidadDeVencesDePago: number) => {
                    if (cantidadDeVencesDeOrdenDeCompa < gMaxImpresiones) {
                        let uilistaImprimirPreVenta = $("#listaImprimirPreVenta");
                        uilistaImprimirPreVenta.show();
                        uilistaImprimirPreVenta = null;


                    } else {
                        ToastThis("Ya ha impreso el documento " + gMaxImpresiones + " veces");
                    }

                    if (this.esOrdenDeVentaParaCobrar) {
                        if (cantidadDeVencesDePago < gMaxImpresiones) {
                            var uilistaImprimirPagoPreVenta = $("#listaImprimirPagoPreVenta");
                            uilistaImprimirPagoPreVenta.show();
                            uilistaImprimirPagoPreVenta = null;

                            let uiLiEtiquetaDeTipoDePago = $("#UiLiEtiquetaDeTipoDePago");
                            uiLiEtiquetaDeTipoDePago.show();
                            uiLiEtiquetaDeTipoDePago = null;

                            this.mostrarEnTareaFinalizadaTipoDePago();
                        } else {
                            ToastThis("Ya ha impreso el pago del documento " + gMaxImpresiones + " veces");
                        }
                    }
                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            }
            uilistaImprimirPreVenta = null;
            uilistaFormaDePago = null;
            uilistaFirmFotoPreVenta = null;
            uilistaImprimirPagoPreVenta = null;
            uiLiEtiquetaDeTipoDePago = null;
        } catch (err) {
            notify("Error al mostrar botones: " + err.message);
        }
    }

    mostrarDatosCliente() {
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

            let imgEstadoPosteoBo = $("#imgEstadoPosteoOrdenDeVenta");
            if (this.ordenDeVenta && this.ordenDeVenta.isPosted === 2 && this.mostrarImagenDeVerificacionDePosteoEnBo) {
                imgEstadoPosteoBo.attr("src", "../www/css/styles/images/icons-png/check-white.png");
                imgEstadoPosteoBo.css("display", "block");
            } else {
                imgEstadoPosteoBo.attr("src", "../www/css/styles/images/icons-png/delete-white.png");
                imgEstadoPosteoBo.css("display", "block");
            }
            
        } catch (err) {
            notify("Error al mostrar datos del cliente " + err.message);
        }
    }

    mostarDatosDeOrdenDeVenta(ordenDeVenta: OrdenDeVenta) {
        var uiEtiquetaSerieDeDocumento = $('#UiEtiquetaSerieDeDocumento');
        uiEtiquetaSerieDeDocumento.text(ordenDeVenta.docSerie);
        uiEtiquetaSerieDeDocumento = null;
        var uiEtiquetaNumeroDeDocumento = $('#UiEtiquetaNumeroDeDocumento');
        uiEtiquetaNumeroDeDocumento.text(ordenDeVenta.docNum);
        uiEtiquetaNumeroDeDocumento = null;
        var uiEtiquetaEstadoOrdenDeVenta = $('#UiEtiquetaEstadoOrdenDeVenta');
        if (ordenDeVenta.isVoid) {
            uiEtiquetaEstadoOrdenDeVenta.text("Anulada");
        } else {
            uiEtiquetaEstadoOrdenDeVenta.text("Activa");
        }
        uiEtiquetaEstadoOrdenDeVenta = null;

        this.cliente.salesComment = ordenDeVenta.comment;
    }

    generarListaOrdenDeVenta() {
        try {
            var uiListaOrdenDeVenta = $('#UiListaRepPrsSale');
            uiListaOrdenDeVenta.children().remove('li');
            let i = 0;
            let sku = new Sku();
            let li = "";
            for (i = 0; i < this.listaDeSkuDeVenta.length; i++) {
                sku = this.listaDeSkuDeVenta[i];

                //let totalDescuento = sku.total;
                let totalDescuento = sku.totalCD;
                /*switch (sku.discountType) {
                    case TiposDeDescuento.Porcentaje.toString():
                        totalDescuento = trunc_number((totalDescuento - ((sku.appliedDiscount * totalDescuento) / 100)), this.configuracionDecimales.defaultCalculationsDecimals);
                        break;
                    case TiposDeDescuento.Monetario.toString():
                        totalDescuento = trunc_number((totalDescuento - sku.appliedDiscount), this.configuracionDecimales.defaultCalculationsDecimals);
                        break;                    
                }

                //Aplicamos el descuento por monto general y familia
                switch (sku.typeOfDiscountByFamily) {
                    case TiposDeDescuento.Porcentaje.toString():
                        totalDescuento = trunc_number((totalDescuento - ((sku.discountByFamily * totalDescuento) / 100)), this.configuracionDecimales.defaultCalculationsDecimals);
                        break;
                    case TiposDeDescuento.Monetario.toString():
                        totalDescuento = trunc_number((totalDescuento - sku.discountByFamily), this.configuracionDecimales.defaultCalculationsDecimals);
                        break;                    
                }

                //Aplicamos el descuento por familia y tipo pago

                switch (sku.typeOfDiscountByFamilyAndPaymentType) {
                    case TiposDeDescuento.Porcentaje.toString():
                        totalDescuento = trunc_number((totalDescuento - ((sku.discountByFamilyAndPaymentType * totalDescuento) / 100)), this.configuracionDecimales.defaultCalculationsDecimals);
                        break;
                    case TiposDeDescuento.Monetario.toString():
                        totalDescuento = trunc_number((totalDescuento - sku.discountByFamilyAndPaymentType), this.configuracionDecimales.defaultCalculationsDecimals);
                        break;                    
                }*/

                if (sku.dimensions.length > 0) {

                    for (let skuConDimension of sku.dimensions) {
                        li += "<li data-icon='false' class='ui-field-contain'>";
                        li += "<p><h4>" + sku.sku + "/" + sku.skuName + "</h4></p>";
                        li += "<p>";
                        li += "<b>Denominacion: </b><span>" + sku.codePackUnit + " </span>";
                        li += "<b> Cant: </b><span>" + skuConDimension.qtySku + " </span>";
                        //li += "<br/><b>Pre: </b><span>" + ToDecimal(sku.cost) + " </span>";
                        li += "<br/><b>Pre: </b><span>" + format_number(sku.cost, this.configuracionDecimales.defaultDisplayDecimals) + " </span>";
                        if (sku.discount !== 0) {
                            //li += "<b> Des: </b><span>" + ToDecimal(sku.appliedDiscount) + "%</span>";
                            li += "<b> Des: </b><span>" + format_number(sku.appliedDiscount, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                            //li += "<b> Total: </b><span>" + ToDecimal(sku.total) + " </span>";
                            li += "<b> Total: </b><span>" + format_number(sku.total, this.configuracionDecimales.defaultDisplayDecimals) + " </span>";
                            //li += "<span class='ui-li-count' style='position:absolute; top:80%'>Q" + ToDecimal(totalDescuento) + "</span><br/>";    
                            li += "<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(totalDescuento, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                        } else {
                            //li += "<span class='ui-li-count' style='position:absolute; top:80%'>Q" + ToDecimal(sku.total) + "</span><br/>";
                            li += "<span class='ui-li-count' style='position:absolute; top:55%'>" + DarFormatoAlMonto(format_number(skuConDimension.total, this.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                        }
                        li += "<b>Dimensión: </b><span>" + format_number(skuConDimension.dimensionSku, this.configuracionDecimales.defaultDisplayDecimals) + "</span>";

                        li += "</p>";
                    }

                } else {
                    li = "<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
                    li += "<p><h4>" + sku.sku + "/" + sku.skuName + "</h4></p>";
                    li += "<p>";
                    li += "<b>Denominacion: </b><span>" + sku.codePackUnit + " </span>";
                    li += "<b> Cant: </b><span>" + sku.qty + " </span>";
                    //li += "<br/><b>Pre: </b><span>" + ToDecimal(sku.cost) + " </span>";
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

                        //Agregamos el descuento por monto general y familia
                        if(sku.discountByFamily !== 0){
                            switch (sku.typeOfDiscountByFamily) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DMF: </b><span>" + format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DMF: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;                            
                            }
                        }
                        //Agregamos el descuento por familia y tipo pago
                        if(sku.discountByFamilyAndPaymentType !== 0){
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
                    } else {
                        //Agregamos el descuento por monto general y tipo pago
                        if(sku.discountByFamily !== 0){
                            switch (sku.typeOfDiscountByFamily) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DMF: </b><span>" + format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DMF: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamily, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;                            
                            }
                        }

                        //Agregamos el descuento por familia y tipo pago
                        if(sku.discountByFamilyAndPaymentType !== 0){
                            switch (sku.typeOfDiscountByFamilyAndPaymentType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    li += "<b> DFP: </b><span>" + format_number(sku.discountByFamilyAndPaymentType, this.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    li += "<b> DFP: </b><span>" + DarFormatoAlMonto(format_number(sku.discountByFamilyAndPaymentType, this.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;                            
                            }
                        }

                        //li += "<span class='ui-li-count' style='position:absolute; top:80%'>Q" + ToDecimal(sku.total) + "</span><br/>";
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
        } catch (err) {
            notify("Error al generar la lista de orden de venta: " + err.message);
        }
    }

    usuarioDeseaReImprimirlaVenta() {
        try {
            if (this.tarea.taskType === TareaTipo.Preventa) {
                this.ordenDeVentaServicio.obtenerFormatoImpresoOrdenDeVenta(this.tarea,
                    (formato: string) => {
                        my_dialog("", "", "close");
                        my_dialog("Espere...", "validando impresora", "open");
                        const impresionServicio = new ImpresionServicio();
                        const printMacAddress = localStorage.getItem('PRINTER_ADDRESS');
                        impresionServicio.validarEstadosYImprimir(this.isImpresoraZebra,
                            printMacAddress,
                            formato,
                            true,
                            (resultado: Operacion) => {
                                if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                                    this.ordenDeVenta.timesPrinted += 1;
                                    this.ordenDeVentaServicio.actualizarVecesImpresionOrdenDeVenta(this.tarea,
                                        this.ordenDeVenta,
                                        () => {
                                            if (this.ordenDeVenta.timesPrinted === gMaxImpresiones) {
                                                let uilistaImprimirPreVenta = $("#listaImprimirPreVenta");
                                                uilistaImprimirPreVenta.hide();
                                                uilistaImprimirPreVenta = null;
                                            }
                                        },
                                        (resultado: Operacion) => {
                                            notify(resultado.mensaje);
                                        });
                                } else {
                                    if (!this.isImpresoraZebra) {
                                        notify(resultado.mensaje);
                                    }
                                }
                                my_dialog("", "", "close");
                            });
                    },
                    (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });
            }
        } catch (err) {
            notify("Error al reimprimir la venta: " + err.message);
        }
    }

    usuarioDeseaReImprimirlaVentaPago() {
        try {
            if (this.tarea.taskType === TareaTipo.Preventa) {
                this.ordenDeVentaServicio.obtenerFormatoImpresoOrdenDeVentaPago(this.tarea,
                    (formato: string) => {
                        my_dialog("", "", "close");
                        my_dialog("Espere...", "validando impresora", "open");
                        const impresionServicio = new ImpresionServicio();
                        const printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                        impresionServicio.validarEstadosYImprimir(this.isImpresoraZebra,
                            printMacAddress,
                            formato,
                            true,
                            (resultado: Operacion) => {
                                if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                                    this.ordenDeVenta.paymentTimesPrinted += 1;
                                    this.ordenDeVentaServicio.actualizarVecesImpresionOrdenDeVenta(this.tarea,
                                        this.ordenDeVenta,
                                        () => {
                                            if (this.ordenDeVenta.paymentTimesPrinted === gMaxImpresiones) {
                                                var uilistaImprimirPagoPreVenta = $("#listaImprimirPagoPreVenta");
                                                uilistaImprimirPagoPreVenta.hide();
                                                uilistaImprimirPagoPreVenta = null;
                                            }
                                        },
                                        (resultado: Operacion) => {
                                            notify(resultado.mensaje);
                                        });
                                } else {
                                    if (!this.isImpresoraZebra) {
                                        notify(resultado.mensaje);
                                    }
                                }
                                my_dialog("", "", "close");
                            });
                    },
                    (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });
            }
        } catch (err) {
            notify("Error al reimprimir la venta: " + err.message);
        }
    }

    crearTareaParaOrdeDeVenta(callback: (taskId: number) => any, errCallBack: (resultado: Operacion) => void) {
        try {
            if (this.tarea.taskId === 0) {
                this.creatTarea(this.tarea, this.cliente, (taskId: number) => {
                    this.seCreoTareaAceptada = true;
                    callback(taskId);
                }, (resultado: Operacion) => {
                    errCallBack(resultado);
                });
            } else {
                callback(this.tarea.taskId);
            }
        } catch (err) {
            errCallBack(<Operacion>{ codigo: -1, mensaje: "Error al crear la tarea:" + err.message });
        }
    }

    creatTarea(tarea: Tarea, cliente: Cliente, callback: (taskId: number) => any, errCallBack: (resultado: Operacion) => void) {
        try {
            var direccion = cliente.address;
            if (direccion === "") {
                direccion = "No tiene direccion";
            }
            var clienteTarea = {
                Nombre: cliente.clientName
                , Direccion: direccion
                , Telefono: cliente.phone
                , CodigoHH: cliente.clientId
            };
            CrearTarea(clienteTarea, tarea.taskType, (clienteNuevo: string, codigoTarea: string) => {
                callback(Number(codigoTarea));
            });
        } catch (err) {
            errCallBack(<Operacion>{ codigo: -1, mensaje: "Error al crear la tarea:" + err.message });
        }
    }

    obtenerConfiguracionDeDecimales() {
        this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales((decimales: ManejoDeDecimales) => {
            this.configuracionDecimales = decimales;
        }, (operacion: Operacion) => {
            notify(operacion.mensaje);
        });
    }

    publicarCliente() {
        var msg = new ClienteMensaje(this);
        msg.cliente = this.cliente;
        this.mensajero.publish(msg, getType(ClienteMensaje));
    }

    usuarioDeseaModifcarCliente() {
        this.cliente.origen = "ResumenOrdenDeVentaControlador";
        this.publicarCliente();
        $.mobile.changePage("UiPageCustomerInfo", {
            transition: "flow"
            , reverse: true
            , showLoadMsg: false,
            data: {
                "cliente": this.cliente
                , "tarea": this.tarea
                , "configuracionDecimales": this.configuracionDecimales
            }
        });
    }

    obtenerBonificacionPorUnidad(sku: Sku): Sku {
        try {
            if (sku.qty !== 0) {
                for (let i = 0; i < this.listaDeSkuParaBonificacionFinal.length; i++) {
                    let skuBonificacion: Sku = this.listaDeSkuParaBonificacionFinal[i];
                    if (sku.sku === skuBonificacion.parentCodeSku && sku.codePackUnit === skuBonificacion.parentCodePackUnit) {
                        return skuBonificacion;
                    }
                }
            }
            return new Sku();
        } catch (err) {
            notify("Error al obtener bonificacion por unidad: " + err.message);
            return new Sku();
        }
    }

    obtenerTotalDeOrdenDeVenta(descuento: number, listaDeSku: Array<Sku>): number {
        /*let total = 0;

        for (let i = 0; i < listaDeSku.length; i++) {
            let sku: Sku = listaDeSku[i];
            let totalSku: number = sku.total;
            switch (sku.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                    totalSku = (sku.appliedDiscount !== 0 ? (totalSku - ((sku.appliedDiscount * totalSku) / 100)) : totalSku);
                    break;
                case TiposDeDescuento.Monetario.toString():
                    totalSku = (sku.appliedDiscount !== 0 ? (totalSku - sku.appliedDiscount) : totalSku);
                    break;                
            }
            switch (sku.typeOfDiscountByFamily) {
                case TiposDeDescuento.Porcentaje.toString():
                    totalSku = (sku.discountByFamily !== 0 ? (totalSku - ((sku.discountByFamily * totalSku) / 100)) : totalSku);
                    break;
                case TiposDeDescuento.Monetario.toString():
                    totalSku = (sku.discountByFamily !== 0 ? (totalSku - sku.discountByFamily) : totalSku);
                    break;                
            }

            switch (sku.typeOfDiscountByFamilyAndPaymentType) {
                case TiposDeDescuento.Porcentaje.toString():
                    totalSku = (sku.discountByFamilyAndPaymentType !== 0 ? (totalSku - ((sku.discountByFamilyAndPaymentType * totalSku) / 100)) : totalSku);
                    break;
                case TiposDeDescuento.Monetario.toString():
                    totalSku = (sku.discountByFamilyAndPaymentType !== 0 ? (totalSku - sku.discountByFamilyAndPaymentType) : totalSku);
                    break;                
            }

            total += totalSku;
        }
        total = (descuento !== 0 ? (total - ((descuento * total) / 100)) : total);*/
        return this.totalDeLaOrden;
    }

    obtenerFormatosDeImpresion(cliente: Cliente, ordenDeVenta: OrdenDeVenta, pago: PagoEncabezado, esOrdenDeVentaParaCobrar: boolean, callback: (formatoDeOrdenDeVenta: string, formatoDePago: string) => void, callbackError: (resultado: Operacion) => void): void {
        this.ordenDeVentaServicio.obtenerFormatoDeImpresionPreSale(cliente, ordenDeVenta, (formatoDeOrdenDeVenta: string) => {
            if (esOrdenDeVentaParaCobrar) {
                this.pagoServicio.obtenerFormatoDeImpresionDePago(cliente, ordenDeVenta, pago, (formatoDePago: string) => {
                    callback(formatoDeOrdenDeVenta, formatoDePago);
                }, (resultadoN1: Operacion) => {
                    notify(resultadoN1.mensaje);
                });
            } else {
                callback(formatoDeOrdenDeVenta, "");
            }
        }, (resultado: Operacion) => {
            notify(resultado.mensaje);
        });
    }

    preguntarSiSeImprimeOrdenDeVenta(formatoDeOrdenDeVenta: string, callback: () => void, callbackError: (resultado: Operacion) => void): void {
        navigator.notification.confirm("Desea imprimir la orden de venta?",
            (respuesta) => {
                if (respuesta === 2) {
                    my_dialog("", "", "close");
                    my_dialog("Espere...", "validando impresora", "open");
                    const impresionServicio = new ImpresionServicio();
                    const printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
                    impresionServicio.validarEstadosYImprimir(this.isImpresoraZebra, printMacAddress, formatoDeOrdenDeVenta, true, (resultado: Operacion) => {
                        if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                            callback();
                        } else {
                            callbackError(<Operacion>{ codigo: -1, mensaje: resultado.mensaje });
                        }
                    });
                } else {
                    callback();
                }


            }, "Sonda® " + SondaVersion,
            <any>"No,Si");
    }

    preguntarSiSeImprimePagoDeOrdenDeVenta(formatoDePago: string, esOrdenDeVentaParaCobrar: boolean, callback: () => void, callbackError: (resultado: Operacion) => void): void {
        if (esOrdenDeVentaParaCobrar) {
            navigator.notification.confirm("Desea imprimir el pago de la orden de venta?",
                (respuesta) => {
                    if (respuesta === 2) {
                        my_dialog("", "", "close");
                        my_dialog("Espere...", "validando impresora", "open");
                        const impresionServicio = new ImpresionServicio();
                        const printMacAddress = localStorage.getItem('PRINTER_ADDRESS');
                        impresionServicio.validarEstadosYImprimir(this.isImpresoraZebra, printMacAddress, formatoDePago, true, (resultado: Operacion) => {
                            if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                                callback();
                            } else {
                                callbackError(<Operacion>{ codigo: -1, mensaje: resultado.mensaje });
                            }
                        });
                    } else {
                        callback();
                    }
                }, "Sonda® " + SondaVersion,
                <any>"No,Si");
        } else {
            callback();
        }
    }

    validarPedidoTipoCobro(callback: () => void) {
        this.taareaServicio.obtenerRegla("CobrarOrdenDeVenta", (listaDeReglas: Regla[]) => {
            if (listaDeReglas.length > 0 && listaDeReglas[0].enabled === 'Si') {
                this.esOrdenDeVentaParaCobrar = true;
                callback();
            } else {
                callback();
            }
        }, (resultado: Operacion) => {
            notify(resultado.mensaje);
        });
    }

    usuarioDeseaSeleccionarFormaDePago() {
        this.publicarCliente();
        this.publicarListaDeSkuOrdenDeVenta();
        this.publicarTarea();
        this.publicarPago();

        $.mobile.changePage("#UiPagePayment", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });
    }

    publicarTarea() {
        var msg = new TareaMensaje(this);
        msg.tarea = this.tarea;
        this.mensajero.publish(msg, getType(TareaMensaje));
    }

    publicarListaDeSkuOrdenDeVenta() {
        var msg = new ListaSkuMensaje(this);
        msg.listaSku = this.listaDeSkuDeVenta;
        msg.listaDeSkuParaBonificacion = this.listaDeSkuParaBonificacionFinal;
        this.mensajero.publish(msg, getType(ListaSkuMensaje));
    }

    publicarPago() {
        var msg = new PagoMensaje(this);
        msg.pago = this.pago;
        this.mensajero.publish(msg, getType(PagoMensaje));
    }

    mostrarTipoDePago() {
        let uiBotonDeFormaDePago = $("#UiBotonDeFormaDePago");
        try {
            if (this.pago === null || this.pago === undefined) {
                uiBotonDeFormaDePago.text('Efectivo');
            } else {
                switch (this.pago.pagoDetalle[0].paymentType) {
                    case TipoDePago.Efectivo.toString():
                        uiBotonDeFormaDePago.text('Efectivo');
                        break;
                    case TipoDePago.Cheque.toString():
                        uiBotonDeFormaDePago.text("Cheque");
                        break;
                }
            }
        } catch (ex) {
            notify("Error al mostrar el tipo de pago: " + ex.message);
        }
        uiBotonDeFormaDePago = null;
    }

    obtenerPago(callback: (pago: PagoEncabezado) => void) {
        if (this.esOrdenDeVentaParaCobrar) {
            if (this.pago === null || this.pago === undefined) {
                this.pagoServicio.formarPagoUnicoDesdeLista(this.cliente, this.listaDeSkuDeVenta, TipoDePago.Efectivo, null, null, null, (pago: PagoEncabezado) => {
                    callback(pago);
                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            } else {
                callback(this.pago);
            }
        } else {
            let pago = new PagoEncabezado();
            pago.pagoDetalle = [];
            let detalle = new PagoDetalle();
            pago.pagoDetalle.push(detalle);

            callback(pago);
        }


    }

    mostrarEnTareaFinalizadaTipoDePago() {
        this.pagoServicio.obtenerTipoDePagoPorDocumentoDeOrdenDeVenta(this.ordenDeVenta, (tipoDePago: string) => {
            let uiEtiquetaDeTipoDePago = $("#UiEtiquetaDeTipoDePago");
            switch (tipoDePago) {
                case TipoDePago.Efectivo.toString():
                    uiEtiquetaDeTipoDePago.text("Efectivo");
                    break;
                case TipoDePago.Cheque.toString():
                    uiEtiquetaDeTipoDePago.text("Cheque");
                    break;
            }
            uiEtiquetaDeTipoDePago = null;
        }, (resultado: Operacion) => {
            notify(resultado.mensaje);
        });
    }

    EsOrdenDeVentaAutorizada(callback: (autorizada: boolean) => void, errCallback: (resultado: Operacion) => void) {
        this.taareaServicio.obtenerRegla("OrdenesDeVentaNoAutorizadas", (listaDeReglas: Regla[]) => {
            if (listaDeReglas.length > 0 && listaDeReglas[0].enabled === 'Si') {
                callback(false);
            } else {
                callback(true);
            }
        }, (resultado: Operacion) => {
            errCallback(resultado);
        });
    }

    unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(bonosNormales: Array<Sku>, bonosPorCombo: Array<BonoPorCombo>, callback: (bonosFinales: Array<Sku>) => void, errCallback: (resultado: Operacion) => void) {
        try {
            let bonosFinales: Array<Sku> = [];
            let existe = false;

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

            for (let j = 0; j < bonosPorCombo.length; j++) {
                if (bonosPorCombo[j].isConfig) {
                    for (var k = 0; k < bonosPorCombo[j].skusDeBonoPorComboAsociados.length; k++) {
                        for (let i = 0; i < bonosNormales.length; i++) {
                            if (bonosNormales[i].sku === bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codeSku && bonosNormales[i].codePackUnit === bonosPorCombo[j].skusDeBonoPorComboAsociados[k].codePackUnit) {
                                existe = true;
                                bonosNormales[i].qty += bonosPorCombo[j].skusDeBonoPorComboAsociados[k].qty;
                                break;
                            }
                        }

                        if (!existe) {
                            let skuParaBonificacion = new Sku();
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
        } catch (e) {
            errCallback(<Operacion>{ codigo: -1, mensaje: "Error al unir bonificaciones del pedido: " + e.message });
        }
    }

    publicarCombo() {
        var listaDeSkuParaBonificacionDeCombo: Array<BonoPorCombo> = [];
        var msg = new ListaDeSkuParaBonificacionDeComboMensaje(this);
        msg.listaDeSkuParaBonificacionDeCombo = listaDeSkuParaBonificacionDeCombo;
        this.mensajero.publish(msg, getType(ListaDeSkuParaBonificacionDeComboMensaje));
    }
}