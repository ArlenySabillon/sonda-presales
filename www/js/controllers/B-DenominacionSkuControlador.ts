//class DenominacionSkuControladorBa {

//    tokenSku: SubscriptionToken;
//    tokenCliente: SubscriptionToken;
//    tokenTarea: SubscriptionToken;
//    tokenListaSkuParaDenominacion: SubscriptionToken;
//    tokenListaSkuTotales: SubscriptionToken;


//    clienteServicio = new ClienteServicio();
//    paqueteServicio = new PaqueteServicio();
//    skuServicio = new SkuServicio();
//    precioSkuServicio = new PrecioSkuServicio();
//    configuracionDecimalesServicio = new ManejoDeDecimalesServicio();
//    historicoDeArticuloServicio = new HistoricoDeArticuloServicio();
//    bonoServicio = new BonoServicio();
//    tareaServicio = new TareaServcio();
//    ventasPorMultiploServicio = new VentasPorMultiploServicio();
//    descuentoServicio = new DescuentoServicio();

//    conversionDePaquetes: PaqueteConversion[];
//    paquetes: Paquete[];
//    sku = new Sku();
//    listaSku: Sku[] = [];
//    listaSkuDenominacion: Sku[] = [];
//    listSkuTotales: Sku[] = [];
//    cliente = new Cliente();
//    tarea = new Tarea();
//    useCodePackUnit: number;
//    configuracionDeDecimales: ManejoDeDecimales;

//    listaDeBonificacion = Array<Bono>();
//    listaDeSkuParaBonificacion = Array<Sku>();

//    listaDeDescuentos = Array<DescuentoPorEscalaSku>();

//    paqueteSeleccionado = new Paquete();
//    descuentoActual = new DescuentoPorEscalaSku();

//    esUltimoSku = false;
//    estaAgregando = false;
//    usuarioPuedeModificarDescuento = false;
//    usuarioPuedeModificarBonificacion = false;
//    seleccionoBotonAtras = false;
//    primerPaqueteOrdenadoPorPrimeraVez = "";
//    totalPedido: number;
//    totalPedidoModificable: number;
//    descuentoPorMontoGeneral: DescuentoPorMontoGeneral;


//    skuOriginal: Sku;
//    listaDeSkuParaBonificacionOriginal = Array<Sku>();
//    listaSkuOriginal: Sku[] = [];


//    socketIo: SocketIOClient.Socket;

//    constructor(public mensajero: Messenger) {
//        this.tokenSku = mensajero.subscribe<SkuMensaje>(this.skuEntregado, getType(SkuMensaje), this);
//        this.tokenCliente = mensajero.subscribe<ClienteMensaje>(this.clienteEntrega, getType(ClienteMensaje), this);
//        this.tokenTarea = mensajero.subscribe<TareaMensaje>(this.tareaEntregado, getType(TareaMensaje), this);
//        this.tokenListaSkuTotales = mensajero.subscribe<ListaSkuMensaje>(this.listaSkuTotalesEntregado, getType(ListaSkuMensaje), this);
//    }

//    delegarDenominacionSkuControladorBa() {
//        let este: DenominacionSkuControladorBa = this;
//        document.addEventListener("backbutton", () => {
//            este.seleccionoBotonAtras = true;
//            este.mostrarPantallaAnterior();
//        }, true);

//        $(document).on("pagebeforechange",
//            (event, data) => {
//                if (data.toPage === "skucant_page") {
//                    este.cliente = data.options.data.cliente;
//                    este.tarea = data.options.data.tarea;
//                    este.sku = data.options.data.sku;
//                    este.skuOriginal = JSON.parse(JSON.stringify(data.options.data.sku));
//                    este.descuentoActual = new DescuentoPorEscalaSku();
//                    este.listaDeDescuentos = new Array<DescuentoPorEscalaSku>();

//                    este.configuracionDeDecimales = data.options.data.configuracionDecimales;
//                    este.listaDeSkuParaBonificacion = <Array<Sku>>JSON.parse(JSON.stringify(data.options.data.listaDeSkuParaBonificacion));
//                    este.listaDeSkuParaBonificacionOriginal = <Array<Sku>>JSON.parse(JSON.stringify(data.options.data.listaDeSkuParaBonificacion));

//                    este.estaAgregando = data.options.data.estaAgregando;
//                    este.listaSku = <Array<Sku>>JSON.parse(JSON.stringify(data.options.data.listaSku));
//                    este.listaSkuOriginal = <Array<Sku>>JSON.parse(JSON.stringify(data.options.data.listaSku));


//                    este.seleccionoBotonAtras = false;

//                    if (!este.estaAgregando) {
//                        this.listaSkuDenominacionEntregado(este, () => {
//                            este.cargarPantalla(este);
//                        });
//                    } else {
//                        este.cargarPantalla(este);
//                    }

//                    $.mobile.changePage("#skucant_page");
//                }
//            });

//        $("#UiBotonCalcularDenominacion").bind("touchstart", () => {
//            let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");

//            let cnatidad = parseFloat((uiTextoCantidadUnidadMedida.val() === "" ? 0 : uiTextoCantidadUnidadMedida.val()));
//            uiTextoCantidadUnidadMedida = null;
//            este.establecerCantidad(cnatidad, este.paqueteSeleccionado.codePackUnit);
//            este.usuarioDeseaCalcularDenominaciones();

//        });

//        $("#UiBotonAceptarCantidadSku").bind("touchstart",
//            () => {
//                BloquearPantalla();
//                este.usuarioDeseaCalcularTotales(este,
//                    () => {
//                        setTimeout(() => {
//                            if (este.validarSiIngresoCantidades()) {
//                                este.aceptarCantidadSku();
//                            } else {
//                                DesBloquearPantalla();
//                                notify("Debe ingresar la cantidad del SKU seleccionado...");
//                            }
//                        },
//                            1000);
//                    }
//                    ,
//                    (resultado: Operacion) => {
//                        DesBloquearPantalla();
//                        notify(resultado.mensaje);
//                    }, "AceptarCantidadSku"
//                );
//            });



//        $("#UiBotonListadoDeUnidadesDeMedida").bind("touchstart", () => {
//            este.usuarioSeleccionoUnidadDeMedida();
//        });

//        $("#skucant_page").bind("swiperight", () => {
//            este.usuarioDeseaVerResumenDelProducto();
//        });

//        $('#UiTextoCantidadUnidadMedida').keydown((e) => {
//            if (e.keyCode === 9) {
//                return false;
//            }
//        });

//        $("#UiTextoDecuentoSku").keydown((e) => {
//            if (e.keyCode === 9) {
//                return false;
//            }
//        });



//        $("#skucant_page").on("swipeleft", "#UiListaDeDimensionesYCantidadesDeSku li", (event) => {
//            if ((<any>event).type === "swipeleft") {
//                let id = (event as any).currentTarget.attributes["id"].nodeValue;
//                este.quitarCantidadConDimension(id);
//            }
//        });

//        $("#uiTxtCantidadSku").keydown((e) => {
//            if (e.keyCode === 9) {
//                let cantidad = $("#uiTxtCantidadSku");
//                if (cantidad.val() === "" || parseFloat(cantidad.val()) === 0) {
//                    e.preventDefault();
//                    notify("El campo no debe estar vacío, por favor ingrese una cantidad...");
//                    cantidad.trigger("click");
//                    cantidad = null;
//                    return false;
//                } else {
//                    let txt = $("uiTxtDimensionSku");
//                    txt.click();
//                    txt = null;
//                    cantidad = null;
//                }
//            }
//        });

//        $("#UiTextoCantidadUnidadMedida").on("focusout",
//            () => {
//                if (!este.seleccionoBotonAtras) {
//                    este.usuarioDeseaCalcularTotales(este,
//                        () => {

//                        },
//                        (resultado: Operacion) => {
//                            DesBloquearPantalla();
//                            notify(resultado.mensaje);
//                        });
//                }
//            });

//        $("#UiTextoDecuentoSku").on("focusout", () => {
//            if (!este.seleccionoBotonAtras) {
//                este.usuarioDeseaCalcularTotales(este, () => {

//                }, (resultado: Operacion) => {
//                    DesBloquearPantalla();
//                    notify(resultado.mensaje);
//                });
//            }
//        });
//    }

//    delegarSockets(socketIo: SocketIOClient.Socket) {
//        this.socketIo = socketIo;
//        socketIo.on("GetCurrentAccountByCustomer_Request", (data) => {
//            switch (data.option) {
//                case OpcionRespuesta.Exito:
//                    my_dialog("", "", "close");
//                    console.log("Validando Saldo desde: " + data.source);
//                    switch (data.source) {
//                        case OpcionValidarSaldoCliente.PonerCantidad:
//                            this.terminiarDeAgregarSku();
//                            break;
//                        case OpcionValidarSaldoCliente.AgregarSku:
//                            this.terminiarDeAgregarSku();
//                            break;
//                    }
//                    break;
//            }
//        });
//    }

//    usuarioDeseaCalcularTotales(_this: DenominacionSkuControladorBa, callback: () => void, errCallback: (resultado: Operacion) => void, triggeredFrom?: string) {
//        if (_this.paqueteSeleccionado.packUnit !== 0 && _this.paqueteSeleccionado.codePackUnit !== "") {
//            _this.sku.unidadMedidaSeleccionada = _this.paqueteSeleccionado.codePackUnit;
//            _this.ventasPorMultiploServicio.verificarVentasPorMultiploSkuUm(_this.cliente, _this.sku, (skuMultiplo: VentaPorMultiplo) => {
//                _this.sku.unidadMedidaSeleccionada = "";
//                let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
//                let uiEtiquetaUnidadesTotales = $("#UiEtiquetaCantidadesTotales");
//                const cantidad = parseFloat((uiTextoCantidadUnidadMedida.val() === "" ? 0 : uiTextoCantidadUnidadMedida.val()));
//                uiTextoCantidadUnidadMedida = null;
//                var cantidadTotal = 0;
//                _this.establecerCantidad((cantidad * (skuMultiplo.multiple === 0 ? 1 : skuMultiplo.multiple)), _this.paqueteSeleccionado.codePackUnit);

//                if (skuMultiplo.multiple !== 0) {
//                    cantidadTotal = (cantidad * skuMultiplo.multiple);
//                    uiEtiquetaUnidadesTotales.css("display", "block");
//                    uiEtiquetaUnidadesTotales.text("Cantidad Total: " + (cantidad * skuMultiplo.multiple));
//                    _this.sku.isSaleByMultiple = true;
//                    _this.sku.multipleSaleQty = skuMultiplo.multiple;
//                } else {
//                    cantidadTotal = cantidad;
//                    uiEtiquetaUnidadesTotales.css("display", "none");
//                    _this.sku.isSaleByMultiple = false;
//                    _this.sku.multipleSaleQty = 0;
//                }
//                _this.validarCantidadIngresada(cantidadTotal,
//                    () => {
//                        var descuento: any = null;

//                        _this.listaDeDescuentos.map(descTemp => {
//                            if (descTemp.codeSku === _this.sku.sku &&
//                                descTemp.codePackUnit === _this.paqueteSeleccionado.codePackUnit
//                                && cantidadTotal >= descTemp.lowLimit
//                                && cantidadTotal <= descTemp.highLimit) {
//                                descuento = descTemp;
//                            }
//                        });

//                        if (descuento == null) {
//                            _this.descuentoActual = new DescuentoPorEscalaSku();
//                            _this.descuentoActual.appliedDiscount = 0;
//                        }

//                        _this.validarDescuentoIngresado(_this, () => {
//                            _this.usuarioDeseaCalcularTotalesDeLinea(() => {
//                                callback();
//                            }, (resultadoN1: Operacion) => {
//                                errCallback(resultadoN1);
//                            });
//                            descuento = null;
//                        }, (resultado: Operacion) => {
//                            if (triggeredFrom && triggeredFrom === "AceptarCantidadSku") {
//                                errCallback(resultado);
//                            }

//                        });
//                    },
//                    (resultadoN1: Operacion) => {
//                        errCallback(resultadoN1);
//                    });
//            }, (resultado: Operacion) => {
//                DesBloquearPantalla();
//                _this.sku.unidadMedidaSeleccionada = "";
//                errCallback(resultado);
//            });
//        } else {
//            DesBloquearPantalla();
//            notify("Seleccione la unidad de medida");
//        }
//    }

//    mostrarUnidadDeMedidaMasPequeño(_this: DenominacionSkuControladorBa, paquetes: Paquete[]) {
//        if (paquetes === undefined) {
//            return;
//        }
//        let listaDeUnidadesDeMedida = [];
//        let primerPaquete = (paquetes.length > 0) ? paquetes[0].codePackUnit : "";

//        let cambiarOrdenDePaquete = false;
//        if (primerPaquete !== _this.primerPaqueteOrdenadoPorPrimeraVez) {
//            paquetes.reverse();
//            cambiarOrdenDePaquete = true;
//        }
//        primerPaquete = null;

//        for (let paquete of paquetes) {
//            if ((_this.useCodePackUnit === 1 && paquete.price !== -1) || _this.useCodePackUnit === 0) {
//                listaDeUnidadesDeMedida.push({
//                    text: paquete.descriptionPackUnit,
//                    value: paquete.codePackUnit
//                });
//            }
//        }

//        _this.paqueteSeleccionado.packUnit = 1;
//        _this.paqueteSeleccionado.codePackUnit = listaDeUnidadesDeMedida[0].value;
//        if (_this.useCodePackUnit === 0) {
//            /*let primerPaquete = (paquetes.length > 0) ? paquetes[0].codePackUnit : "";

//            let cambiarOrdenDePaquete = false;
//            if (primerPaquete !== _this.primerPaqueteOrdenadoPorPrimeraVez) {
//                paquetes.reverse();
//                cambiarOrdenDePaquete = true;
//            }
//            primerPaquete = null;
//            _this.usuarioDeseaCalcularDenominaciones();*/
//            notify("No puede escoger unidad de medidad, por favor comuniquese con su administrador");
//            _this.mostrarPantallaAnterior();
//        } else {

//            _this.validarDescuentoIngresado(_this, () => {
//                _this.usuarioDeseaCalcularTotalesDeLinea(() => {

//                }, (resultadoN1: Operacion) => {
//                    DesBloquearPantalla();
//                    notify(resultadoN1.mensaje);
//                });
//            }, (resultado: Operacion) => {
//                DesBloquearPantalla();
//                if (resultado.codigo === -1) {
//                    notify(resultado.mensaje);
//                }
//            });
//        }

//        if (cambiarOrdenDePaquete) {
//            paquetes.reverse();
//        }
//        cambiarOrdenDePaquete = null;
//        listaDeUnidadesDeMedida = null;
//    }

//    obtenerConversiones(_this: DenominacionSkuControladorBa, callback: () => void) {
//        var uiListaSkuMedidas = $("#UiListaSkuMedidas");
//        uiListaSkuMedidas.children().remove('li');
//        uiListaSkuMedidas = null;
//        _this.paqueteServicio.obtenerConversionDePaquetes(_this.sku, _this.configuracionDeDecimales, (conversionDePaquetes: PaqueteConversion[]) => {
//            _this.conversionDePaquetes = conversionDePaquetes;
//            callback();
//        }, (resultado: Operacion) => {
//            notify(resultado.mensaje);
//            callback();
//        }
//        );
//    }

//    generarListadoDeUnidades(_this: DenominacionSkuControladorBa, callback: () => void) {
//        _this.paqueteServicio.obtenerDenominacionesPorSku(_this.skuOriginal, _this.configuracionDeDecimales, _this.cliente, _this.useCodePackUnit === 1, (paquetes: Paquete[]) => {
//            _this.historicoDeArticuloServicio.colocarSugerenciaDeVentaAPaquetes(TIpoDeDocumento.OrdenDeVenta, _this.cliente, _this.sku, paquetes, _this.configuracionDeDecimales, (paquetesN1: Paquete[]) => {
//                if (_this.listaSkuDenominacion.length > 0) {
//                    _this.colocarCantidadAPaquetes(_this.listaSkuDenominacion, paquetesN1, (paquetesN2: Paquete[]) => {
//                        _this.listaSkuDenominacion = [];
//                        _this.paquetes = paquetesN2;
//                        _this.procesarPaquetes(_this, _this.paquetes, (paquetes: Paquete[]) => {
//                            _this.calcularTotalesDescuentosPaquetes(_this, _this.paquetes, () => {
//                                if (_this.sku.handleDimension) {
//                                    _this.generarListaDeDimension(_this);
//                                    _this.calcularTotalesDeCantidadConDimension(_this);
//                                }

//                                _this.calcularBonificacion(_this, _this.paquetes, () => {
//                                    _this.paquetes.reverse();
//                                    _this.primerPaqueteOrdenadoPorPrimeraVez = (_this.paquetes.length > 0) ? _this.paquetes[0].codePackUnit : "";
//                                    callback();
//                                }, (resultado: Operacion) => {
//                                    notify(resultado.mensaje);
//                                });
//                            });
//                        });
//                    }, (resultado: Operacion) => {
//                        notify(resultado.mensaje);
//                    }
//                    );
//                } else {
//                    _this.paquetes = paquetesN1;
//                    _this.procesarPaquetes(_this, _this.paquetes, (paquetes: Paquete[]) => {
//                        _this.calcularTotalesDescuentosPaquetes(_this, _this.paquetes, () => {
//                            _this.calcularBonificacion(_this, _this.paquetes, () => {
//                                _this.paquetes.reverse();
//                                _this.primerPaqueteOrdenadoPorPrimeraVez = (_this.paquetes.length > 0) ? _this.paquetes[0].codePackUnit : "";
//                                callback();
//                            }, (resultado: Operacion) => {
//                                notify(resultado.mensaje);
//                            });
//                        });
//                    });
//                }
//            }, (resultado: Operacion) => {
//                notify(resultado.mensaje);
//                callback();
//            });
//        }, (resultado: Operacion) => {
//            notify(resultado.mensaje);
//            callback();
//        });
//    }

//    colocarCantidadAPaquetes(listaSku: Sku[], paquetes: Paquete[], callback: (paquetes: Paquete[]) => void, callbackError: (resultado: Operacion) => void) {
//        try {
//            for (let i = 0; i < paquetes.length; i++) {
//                for (let j = 0; j < listaSku.length; j++) {
//                    if (paquetes[i].codePackUnit === listaSku[j].codePackUnit) {

//                        paquetes[i].qty = listaSku[j].qty;
//                        paquetes[i].dimensions = listaSku[j].dimensions;
//                        if (paquetes[i].appliedDiscount === 0) {
//                            paquetes[i].appliedDiscount = listaSku[j].appliedDiscount;
//                        }
//                    }
//                }
//            }

//            callback(paquetes);
//        } catch (err) {
//            var operacion = new Operacion();
//            operacion.resultado = ResultadoOperacionTipo.Error;
//            operacion.codigo = err.code;
//            operacion.mensaje = err.message;
//            callbackError(operacion);
//        }
//    }

//    procesarPaquetes(_this: DenominacionSkuControladorBa, paquetes: Paquete[], callback: (paquete: Paquete[]) => void) {
//        _this.precioSkuServicio.obtenerPreciosDePaquetes(_this.cliente, _this.sku, _this.paquetes, _this.configuracionDeDecimales, (paquetes: Paquete[]) => {
//            if (_this.paqueteSeleccionado.packUnit !== 0) {
//                _this.generarListaDeUnidadesDeMedidaPorSku(_this, paquetes, _this.useCodePackUnit, () => {
//                    if (_this.useCodePackUnit === 0) {
//                        _this.usuarioDeseaCalcularDenominaciones();
//                    } else {
//                        callback(paquetes);
//                    }
//                });
//            } else {
//                callback(paquetes);
//            }
//        }, (resultado: Operacion) => {
//            notify(resultado.mensaje);
//        });
//    }

//    generarListaDeUnidadesDeMedidaPorSku(_this: DenominacionSkuControladorBa, paquetes: Paquete[], useCodePackUnit: number, callback: () => void) {
//        paquetes.map((paquete, index, array) => {
//            _this.totalPedidoModificable = _this.totalPedido;
//            if (paquete.codePackUnit === _this.paqueteSeleccionado.codePackUnit) {

//                let listaDeSkuABonificar: Array<Sku> = _this.obtenerBonificacionPorUnidad(paquete);
//                let totalDescuento = 0, descuento = paquete.appliedDiscount;
//                let useMaxDiscount = localStorage.getItem("USE_MAX_DISCOUNT");
//                if (useMaxDiscount === "1") {
//                    descuento = paquete.appliedDiscount !== 0 ? paquete.appliedDiscount : _this.descuentoActual.discount;
//                }
//                totalDescuento = trunc_number(((paquete.qty * paquete.price) - ((descuento * (paquete.qty * paquete.price)) / 100)), _this.configuracionDeDecimales.defaultCalculationsDecimals);
//                paquete.appliedDiscount = descuento;

//                let uiEtiquetaUnidadDeMedida = $("#UiEtiquetaUnidadDeMedida");
//                uiEtiquetaUnidadDeMedida.text(paquete.descriptionPackUnit);
//                uiEtiquetaUnidadDeMedida = null;

//                let clase = (paquetes.length - 1 === index) ? "'IntegerNumber'" : "'DoubleNumber'";
//                let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
//                document.getElementById("UiTextoCantidadUnidadMedida").className = "";
//                uiTextoCantidadUnidadMedida.addClass(clase);
//                clase = null;
//                let uiEtiquetaUnidadesTotales = $("#UiEtiquetaCantidadesTotales");

//                _this.ventasPorMultiploServicio.validarSiTieneVentaPorMultiplo(_this.cliente, _this.sku, paquete, uiTextoCantidadUnidadMedida, (tiene: boolean, paqueteN1: Paquete, controlN1: any) => {
//                    let uiEtiquetaUnidadesTotales = $("#UiEtiquetaCantidadesTotales");

//                    if (tiene) {
//                        _this.ventasPorMultiploServicio.obtenerVentaPorMultiploDeSkuConUnidadDeMedida(_this.cliente, _this.sku.sku, paqueteN1.codePackUnit, controlN1, (multiplo: number, controlN2: any) => {
//                            _this.sku.isSaleByMultiple = true;
//                            controlN2.val(((paqueteN1.qty > 0) ? format_number((paqueteN1.qty / multiplo), _this.configuracionDeDecimales.defaultDisplayDecimals) : ""));
//                            uiEtiquetaUnidadesTotales.text("Cantidad Total: " + paqueteN1.qty);
//                            uiEtiquetaUnidadesTotales.css("display", "block");
//                        }, (resultadoN1: Operacion) => {
//                            notify(resultadoN1.mensaje);
//                        });
//                    } else {
//                        controlN1.val(((paqueteN1.qty > 0) ? format_number(paqueteN1.qty, _this.configuracionDeDecimales.defaultDisplayDecimals) : ""));
//                        _this.sku.isSaleByMultiple = false;
//                        uiEtiquetaUnidadesTotales.css("display", "none");
//                        uiEtiquetaUnidadesTotales.text("Cantidad Total: 0");
//                    }
//                }, (resultado: Operacion) => {
//                    notify(resultado.mensaje);
//                });

//                let des1;
//                let uiTxtDescuentoSku = $("#UiTextoDecuentoSku");
//                if (paquete.appliedDiscount !== 0 || paquete.appliedDiscount.toString() !== "0") {
//                    if (_this.listaDeDescuentos.length !== 0) {

//                        des1 = _this.listaDeDescuentos
//                            .filter(x => x.codeSku === _this.sku.sku &&
//                                x.codePackUnit === paquete.codePackUnit &&
//                                paquete.qty >= x.lowLimit && x.highLimit >= paquete.qty)[0];

//                        if (des1 !== undefined) {

//                            uiTxtDescuentoSku.val(paquete.appliedDiscount);

//                            _this.descuentoActual = des1;
//                            _this.descuentoActual.appliedDiscount = paquete.appliedDiscount;

//                            _this.mostrarTextoDescuento(_this, true);
//                        } else {
//                            _this.mostrarTextoDescuento(_this, false);
//                        }
//                    }
//                }

//                uiTextoCantidadUnidadMedida = null;
//                uiEtiquetaUnidadesTotales = null;

//                if (useCodePackUnit === 1 && paquete.price !== -1) {
//                    if (paquete.lastQtySold > 0) {
//                        let uiLiUltimoPedidoUnidadMedida = $("#UiLiUltimoPedidoUnidadMedida");
//                        uiLiUltimoPedidoUnidadMedida.show();
//                        uiLiUltimoPedidoUnidadMedida = null;
//                        let uiEtiquetaUltimoPedidoUnidadMedida = $("#UiEtiquetaUltimoPedidoUnidadMedida");
//                        uiEtiquetaUltimoPedidoUnidadMedida.text(`Ult. Pedido: ${paquete.lastQtySold}`);
//                        uiEtiquetaUltimoPedidoUnidadMedida.show();
//                        uiEtiquetaUltimoPedidoUnidadMedida = null;
//                    }

//                    let uiEtiquetaPrecioUnidadMedida = $("#UiEtiquetaPrecioUnidadMedida");
//                    uiEtiquetaPrecioUnidadMedida.show();
//                    uiEtiquetaPrecioUnidadMedida.text("Precio: " + DarFormatoAlMonto(format_number(paquete.price, _this.configuracionDeDecimales.defaultDisplayDecimals)));
//                    uiEtiquetaPrecioUnidadMedida = null;

//                    let uiEtiquetaTotalUnidadMedida = $("#UiEtiquetaTotalUnidadMedida");
//                    let lblTotal = $("#UiTotalCantidadSkus");
//                    let total;

//                    uiEtiquetaTotalUnidadMedida.show();
//                    uiEtiquetaTotalUnidadMedida.text("Total: " + DarFormatoAlMonto(format_number((paquete.qty * paquete.price), _this.configuracionDeDecimales.defaultDisplayDecimals)));
//                    uiEtiquetaTotalUnidadMedida = null;

//                    _this.totalPedidoModificable = _this.totalPedido + _this.calcularDescuentosPaquetes(_this.paquetes);

//                    if (_this.totalPedidoModificable >= _this.tarea.discountPerGeneralAmountLowLimit &&
//                        _this.tarea.discountPerGeneralAmountHighLimit >= _this.totalPedidoModificable) {
//                        lblTotal.text(DarFormatoAlMonto(format_number(((_this.totalPedidoModificable) - (_this.totalPedidoModificable * (_this.cliente.appliedDiscount / 100))), _this.configuracionDeDecimales.defaultDisplayDecimals)));
//                    } else {
//                        _this.obtenerDescuentoPorMontoGeneral(_this.totalPedidoModificable, (tot) => {
//                            lblTotal.text(DarFormatoAlMonto(format_number((tot) - ((tot) * (_this.descuentoPorMontoGeneral.discount / 100)), _this.configuracionDeDecimales.defaultDisplayDecimals)));
//                        });
//                    }


//                    if (paquete.appliedDiscount !== 0 && des1 !== undefined) {
//                        let uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
//                        uiEtiquetaTotalCdUnidadMedida.show();
//                        uiEtiquetaTotalCdUnidadMedida.text("Total CD: " + DarFormatoAlMonto(format_number((totalDescuento), _this.configuracionDeDecimales.defaultDisplayDecimals)));
//                        uiEtiquetaTotalCdUnidadMedida = null;
//                    }

//                    let uiAcordionDeBonificacionesUnidadMedida = $("#" +
//                        "UiAcordionDeBonificacionesUnidadMedida" +
//                        "" +
//                        "" +
//                        "");
//                    let uiListaDeBonificacionesUnidadMedida = $('#UiListaDeBonificacionesUnidadMedida');
//                    uiListaDeBonificacionesUnidadMedida.children().remove('li');
//                    if (listaDeSkuABonificar.length > 0) {

//                        uiAcordionDeBonificacionesUnidadMedida.show();
//                        listaDeSkuABonificar.map(skuParaBonificacion => {
//                            let li: string = "<li class='ui-field - contain' data-theme='a' style='text- align: left'>";
//                            li += "<span class='medium'>" + skuParaBonificacion.skuDescription + "</span><br/>";
//                            li += "<span class='medium'>" + skuParaBonificacion.sku + "</span><br/>";
//                            li += "<span class='medium' id='UiEtiquetaTextoBonificacion" + skuParaBonificacion.sku + skuParaBonificacion.codePackUnit + "'>UM.: " + skuParaBonificacion.codePackUnit + " Cant.: " + skuParaBonificacion.qtyBonusMax + "</span><br/>";
//                            if (_this.usuarioPuedeModificarBonificacion) {
//                                if (localStorage.getItem("USE_MAX_BONUS") === "1") {
//                                    li += "<input type='number' class='validarEnteros' id='UiTextoBonificacion" + skuParaBonificacion.sku + skuParaBonificacion.codePackUnit + "' data-clear-btn='true' placeholder='Cantidad' value='" + ((skuParaBonificacion.qty > 0) ? skuParaBonificacion.qty : skuParaBonificacion.qtyBonusMax) + "' />";
//                                } else {
//                                    li += "<input type='number' class='validarEnteros' id='UiTextoBonificacion" + skuParaBonificacion.sku + skuParaBonificacion.codePackUnit + "' data-clear-btn='true' placeholder='Cantidad' value='" + ((skuParaBonificacion.qty > 0) ? skuParaBonificacion.qty : "") + "' />";
//                                }
//                            } else {
//                                skuParaBonificacion.qty = skuParaBonificacion.qtyBonusMax;
//                            }

//                            li += "</li>";
//                            uiListaDeBonificacionesUnidadMedida.append(li);
//                            uiListaDeBonificacionesUnidadMedida.listview("refresh");
//                            uiListaDeBonificacionesUnidadMedida.trigger("create");
//                        });
//                    } else {
//                        uiAcordionDeBonificacionesUnidadMedida.hide();
//                    }
//                    uiListaDeBonificacionesUnidadMedida = null;
//                    uiAcordionDeBonificacionesUnidadMedida = null;

//                    listaDeSkuABonificar = null;
//                    totalDescuento = null;

//                }
//            }
//        });
//        _this.paquetes.reverse();
//        callback();
//    }

//    usuarioDeseaCalcularDenominaciones() {
//        let primerPaquete = (this.paquetes.length > 0) ? this.paquetes[0].codePackUnit : "";

//        let cambiarOrdenDePaquete = false;
//        if (primerPaquete !== this.primerPaqueteOrdenadoPorPrimeraVez) {
//            this.paquetes.reverse();
//            cambiarOrdenDePaquete = true;
//        }
//        primerPaquete = null;
//        this.calcularDenominacion(0, this.paquetes);

//    }

//    usuarioDeseaCalcularTotalesDeLinea(callback: () => void, errCallback: (resultado: Operacion) => void) {
//        this.paquetes.reverse();
//        this.calcularBonificacion(this, this.paquetes, () => {
//            this.procesarPaquetes(this, this.paquetes, () => {
//                callback();
//            });
//        }, (resultado: Operacion) => {
//            DesBloquearPantalla();
//            errCallback(resultado);
//        });
//    }

//    obtieneCantidadPorUnidadDeMedidad(paquetes: Paquete[], callback: (paquetes: Paquete[]) => void, callbackError: (resultado: Operacion) => void) {
//        try {
//            for (var i = 0; i < paquetes.length; i++) {
//                if ((this.useCodePackUnit === 0) || (this.useCodePackUnit === 1 && paquetes[i].price > 0)) {
//                    var uiCantidad = $("#UiTextoCantidad" + paquetes[i].codePackUnit + "");
//                    var cantidad = (uiCantidad.val() === "" ? 0 : uiCantidad.val());
//                    paquetes[i].qty = parseFloat(cantidad);
//                    uiCantidad = null;
//                }
//            }
//            callback(paquetes);
//        } catch (err) {
//            var operacion = new Operacion();
//            operacion.resultado = ResultadoOperacionTipo.Error;
//            operacion.codigo = err.code;
//            operacion.mensaje = err.message;
//            callbackError(operacion);
//        }

//    }

//    obtenerCocienteYResiduo(cantidad: number, paqueteConversion: PaqueteConversion, paquetes: Paquete[], index: number, callback: (cociente: number, residuo: number, paqueteConversion: PaqueteConversion, paquetes: Paquete[], index: number) => void, callbackError: (resultado: Operacion) => void) {
//        try {
//            var residuo: number = 0;
//            var cociente: number = 0;
//            if (paqueteConversion.conversionFactor >= 1) {
//                residuo = cantidad % paqueteConversion.conversionFactor;
//                cociente = (cantidad - residuo) / paqueteConversion.conversionFactor;
//            } else {
//                residuo = cantidad % (1 / paqueteConversion.conversionFactor);
//                cociente = (cantidad - residuo) / (1 / paqueteConversion.conversionFactor);
//            }

//            callback(cociente, residuo, paqueteConversion, paquetes, index);
//        } catch (err) {
//            var operacion = new Operacion();
//            operacion.resultado = ResultadoOperacionTipo.Error;
//            operacion.codigo = err.code;
//            operacion.mensaje = err.message;
//            callbackError(operacion);
//        }
//    }

//    calcularDenominacion(indicePaquetes: number, paquetes: Paquete[]) {
//        if (indicePaquetes < (paquetes.length - 1)) {
//            this.paqueteServicio.obtenerConversionDePaquete(this.sku, paquetes, indicePaquetes, this.configuracionDeDecimales, (conversionDePaquete: PaqueteConversion, paquetesN1: Paquete[], index: number) => {
//                this.obtenerCocienteYResiduo(paquetesN1[index].qty, conversionDePaquete, paquetesN1, index, (cociente: number, residuo: number, paqueteConversion: PaqueteConversion, paquetesN2: Paquete[], indexN1: number) => {

//                    var uiCantidadA: number = this.obtenerCantidadIngresadaPorUnidadDeMedida(paqueteConversion.codePackUnitTo);

//                    var resultadoCociente: number = uiCantidadA + cociente;

//                    paquetesN2[indexN1].qty = residuo;
//                    paquetesN2[indexN1 + 1].qty = resultadoCociente;

//                    uiCantidadA = null;

//                    this.calcularDenominacion(indexN1 + 1, paquetesN2);
//                }, (resultado: Operacion) => {
//                    notify(resultado.mensaje);
//                }
//                );
//            }, (resultado: Operacion) => {
//                notify(resultado.mensaje);
//            }
//            );
//        } else {
//            this.paquetes = paquetes;

//            if (this.paqueteSeleccionado.packUnit !== 0) {
//                this.generarListaDeUnidadesDeMedidaPorSku(this, paquetes, this.useCodePackUnit, () => { });
//            }
//        }
//    }

//    obtenerMenorDenominacion(paquetes: Paquete[], indicePaquetes: number) {
//        try {
//            if (paquetes.length > 1) {
//                this.paqueteServicio.obtenerConversionDePaquete(this.sku, paquetes, indicePaquetes, this.configuracionDeDecimales, (conversionDePaquete: PaqueteConversion, paquetesN1: Paquete[], index: number) => {
//                    if (conversionDePaquete.conversionFactor >= 1) {
//                        paquetesN1[index].qty = paquetesN1[index].qty + (paquetesN1[index - 1].qty * conversionDePaquete.conversionFactor);
//                    } else {
//                        paquetesN1[index].qty = paquetesN1[index].qty + (paquetesN1[index - 1].qty * (1 / conversionDePaquete.conversionFactor));
//                    }
//                    if (index === (paquetesN1.length - 1)) {
//                        this.sku.qty = paquetesN1[index].qty;
//                        if (this.sku.handleDimension) {
//                            //this.sku.total = (this.sku.cost * this.sku.qty * this.sku.dimension);
//                        } else {
//                            this.sku.total = (this.sku.cost * this.sku.qty);
//                        }
//                        this.sku.codePackUnit = paquetesN1[index].codePackUnit;
//                        paquetes.reverse();
//                        this.paquetes = paquetes;
//                        this.usuarioDeseaAceptarCantidadDeSku(this.sku);
//                    } else {
//                        this.obtenerMenorDenominacion(paquetesN1, index + 1);
//                    }
//                }, (resultado: Operacion) => {
//                    notify(resultado.mensaje);
//                }
//                );
//            } else {
//                this.sku.qty = paquetes[0].qty;
//                if (this.sku.handleDimension) {
//                } else {
//                    this.sku.total = (this.sku.cost * this.sku.qty);
//                }
//                this.sku.codePackUnit = paquetes[0].codePackUnit;
//                paquetes.reverse();
//                this.paquetes = paquetes;
//                this.usuarioDeseaAceptarCantidadDeSku(this.sku);

//            }
//        } catch (err) {
//            notify(err.message);
//        }
//    }

//    agregarSugerenciaDeCompra() {
//        var ultCantidad = parseInt($("#ultPedido").text());
//        return ultCantidad !== 0 ? ultCantidad : "0";
//    }

//    skuEntregado(mensaje: SkuMensaje, subcriber: any): void {
//        subcriber.sku = mensaje.sku;
//        subcriber.listaDeSkuParaBonificacion = new Array<Sku>();
//        subcriber.estaAgregando = true;
//    }

//    clienteEntrega(mensaje: ClienteMensaje, subcriber: any): void {
//        subcriber.cliente = mensaje.cliente;
//    }

//    tareaEntregado(mensaje: TareaMensaje, subcriber: any): void {
//        subcriber.tarea = mensaje.tarea;
//    }

//    listaSkuTotalesEntregado(mensaje: ListaSkuMensaje, subcriber: any): void {
//        subcriber.listaSku = mensaje.listaSku;
//    }

//    listaSkuDenominacionEntregado(subcriber: DenominacionSkuControladorBa, callback: () => void): void {
//        subcriber.paqueteSeleccionado = new Paquete();

//        let uiListaDeBonificacionesUnidadMedida = $('#UiListaDeBonificacionesUnidadMedida');
//        uiListaDeBonificacionesUnidadMedida.children().remove('li');
//        uiListaDeBonificacionesUnidadMedida = null;

//        let uiAcordionDeBonificacionesUnidadMedida = $("#UiAcordionDeBonificacionesUnidadMedida");
//        uiAcordionDeBonificacionesUnidadMedida.children().remove('li');
//        uiAcordionDeBonificacionesUnidadMedida.hide();
//        uiAcordionDeBonificacionesUnidadMedida = null;


//        subcriber.listaSkuDenominacion = subcriber.listaSku;
//        subcriber.sku = subcriber.listaSku[0];
//        subcriber.skuOriginal = JSON.parse(JSON.stringify(subcriber.listaSku[0]));

//        subcriber.listaDeSkuParaBonificacion = subcriber.listaDeSkuParaBonificacion;

//        subcriber.paqueteSeleccionado.packUnit = 1;
//        subcriber.paqueteSeleccionado.codePackUnit = subcriber.sku.unidadMedidaSeleccionada;

//        if (subcriber.useCodePackUnit !== 0) {
//            subcriber.limpiarControles();
//            subcriber.colocarDescuento(subcriber.sku);

//            subcriber.validarDescuentoIngresado(subcriber, () => {
//                subcriber.usuarioDeseaCalcularTotalesDeLinea(() => {

//                }, (resultadoN2: Operacion) => {
//                    DesBloquearPantalla();
//                    notify(resultadoN2.mensaje);
//                }
//                );
//            }, (resultadoN1: Operacion) => {
//                DesBloquearPantalla();
//                if (resultadoN1.codigo === -1) {
//                    notify(resultadoN1.mensaje);
//                }
//            });

//        }

//        subcriber.estaAgregando = false;
//        callback();
//    }

//    colocarDescuento(sku: Sku) {
//        let uiTxtDescuentoSku = $("#UiTextoDecuentoSku");
//        if (sku.appliedDiscount > 0 && sku.appliedDiscount.toString() !== "") {
//            uiTxtDescuentoSku.val(sku.appliedDiscount);
//        } else {
//            uiTxtDescuentoSku.val("");
//        }

//        uiTxtDescuentoSku = null;

//    }

//    publicarListaSku(listaSku: Sku[], callBack: () => void) {
//        let msg = new ListaSkuMensaje(this);
//        msg.listaSku = listaSku;

//        let listaDeBonificacion = new Array<Sku>();
//        this.listaDeSkuParaBonificacion.map(bonificacion => {
//            if (bonificacion.qty > 0) {
//                listaDeBonificacion.push(bonificacion);
//            }
//        });

//        msg.listaDeSkuParaBonificacion = listaDeBonificacion;
//        listaDeBonificacion = null;
//        this.mensajero.publish(msg, getType(ListaSkuMensaje));
//        msg = null;
//        this.publicarAgregarOQuitarDelistaSkuMensaje(listaSku);

//        callBack();
//    }

//    publicarTarea(callback: () => void) {
//        let msg = new TareaMensaje(this);
//        this.tarea.salesOrderTotal = this.totalPedido + this.calcularDescuentosPaquetes(this.paquetes);
//        msg.tarea = this.tarea;
//        this.mensajero.publish(msg, getType(TareaMensaje));

//        callback();
//    }

//    publicarAgregarOQuitarDelistaSkuMensaje(listaSku: Sku[]) {
//        var msg = new AgregarOQuitarDeListaSkuMensaje(this);
//        msg.listaSku = listaSku;
//        msg.quitarSku = this.estaAgregando;
//        msg.agregarSku = false;
//        this.mensajero.publish(msg, getType(AgregarOQuitarDeListaSkuMensaje));
//    }

//    usuarioDeseaAceptarCantidadDeSku(sku: Sku) {
//        try {
//            if (sku.qty <= 0) {
//                notify("No puede dejar vacia la cantidad, ni que sea menor a 1");
//            } else {

//                this.terminiarDeAgregarSku();

//            }
//        } catch (err) {
//            notify("Error al agregar sku" + err.message);
//        }
//    }

//    terminiarDeAgregarSku() {
//        try {

//            let primerPaquete = (this.paquetes.length > 0) ? this.paquetes[0].codePackUnit : "";

//            let cambiarOrdenDePaquete = false;
//            if (primerPaquete !== this.primerPaqueteOrdenadoPorPrimeraVez) {
//                this.paquetes.reverse();
//                cambiarOrdenDePaquete = true;
//            }
//            primerPaquete = null;

//            this.publicarTarea(() => {
//                this.publicarListaSku(this.listaSku, () => {
//                    DesBloquearPantalla();
//                    window.history.back();
//                });
//            });
//        } catch (err) {
//            notify("Error al terminar de agregar sku" + err.message);
//        }
//    }

//    obtenerPaquetesConCantidad(paquetes: Paquete[], callback: (paquetesConCantidad: Paquete[]) => void) {
//        var paquetesConCantidad: Paquete[] = [];

//        for (var i: number = 0; i < paquetes.length; i++) {
//            if (paquetes[i].qty > 0) {
//                paquetesConCantidad.push(paquetes[i]);
//            }
//        }
//        callback(paquetesConCantidad);
//    }

//    aceptarCantidadSku() {
//        this.paquetes.reverse();
//        this.precioSkuServicio.obtenerPreciosDePaquetes(this.cliente,
//            this.sku,
//            this.paquetes,
//            this.configuracionDeDecimales,
//            (paquetesN2: Paquete[]) => {
//                this.obtenerPaquetesConCantidad(paquetesN2,
//                    (paquetesConCantidad: Paquete[]) => {
//                        if (paquetesConCantidad.length > 0) {
//                            this.desfragmentarPaquetes(paquetesConCantidad,
//                                (lstSku: Sku[]) => {
//                                    this.listaSku = lstSku;
//                                    if (gIsOnline === EstaEnLinea.No) {
//                                        var listaSkuTemp = new Array<Sku>();
//                                        listaSkuTemp = this.listaSku;
//                                        this.tareaServicio.obtenerRegla("AplicarReglasComerciales",
//                                            (listaDeReglasAplicarReglasComerciales: Regla[]) => {
//                                                if (listaDeReglasAplicarReglasComerciales.length > 0 &&
//                                                    (listaDeReglasAplicarReglasComerciales[0].enabled === 'Si' ||
//                                                        listaDeReglasAplicarReglasComerciales[0].enabled === 'SI')) {
//                                                    this.clienteServicio.validarCuentaCorriente(this.cliente,
//                                                        listaSkuTemp,
//                                                        this.tarea.salesOrderType,
//                                                        this.configuracionDeDecimales,
//                                                        (cliente: Cliente) => {
//                                                            this.terminiarDeAgregarSku();
//                                                        },
//                                                        (resultado: Operacion) => {
//                                                            DesBloquearPantalla();
//                                                            notify(resultado.mensaje);
//                                                        });
//                                                } else {
//                                                    this.terminiarDeAgregarSku();
//                                                }
//                                            },
//                                            (resultado: Operacion) => {
//                                                DesBloquearPantalla();
//                                                notify(resultado.mensaje);
//                                                my_dialog("", "", "closed");
//                                            });
//                                    } else {
//                                        this.terminiarDeAgregarSku();
//                                    }
//                                });
//                        }
//                    });
//            },
//            (resultado: Operacion) => {
//                DesBloquearPantalla();
//                notify(resultado.mensaje);
//            });
//    }


//    desfragmentarPaquetes(paquetes: Paquete[], callback: (lstSku: Sku[]) => void) {
//        try {
//            var i: number;
//            var lstSkuTemp: Sku[] = [];

//            for (i = 0; i < paquetes.length; i++) {
//                this.obtenerDetalleSku(paquetes, i, (sku: Sku) => {
//                    lstSkuTemp.push(sku);
//                }, () => {
//                    callback(lstSkuTemp);
//                });

//            }
//        } catch (e) {
//            notify("Error al desfragmentar el paquete: " + e.message);
//        }
//    }


//    obtenerDetalleSku(paquetes: Paquete[], index: number, addcallbak: (sku: Sku) => void, donecallback: () => void) {

//        try {
//            var paquete = paquetes[index];
//            if (paquete.qty !== 0 && paquete.qty !== undefined) {
//                var sku = new Sku();

//                var descAplicado = this.listaDeDescuentos.filter(x => x.codeSku === this.sku.sku
//                    && x.codePackUnit === paquete.codePackUnit
//                    && paquete.qty >= x.lowLimit && x.highLimit >= paquete.qty)[0];

//                if (descAplicado == null) descAplicado = new DescuentoPorEscalaSku();

//                sku.sku = this.sku.sku;
//                sku.skuName = this.sku.skuName;
//                sku.skuDescription = this.sku.skuDescription;
//                sku.skuPrice = trunc_number(paquete.price, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                sku.skuLink = this.sku.skuLink;
//                sku.requieresSerie = this.sku.requieresSerie;
//                sku.isKit = this.sku.isKit;
//                sku.onHand = trunc_number(this.sku.onHand, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                sku.routeId = this.sku.routeId;
//                sku.isParent = this.sku.isParent;
//                sku.parentSku = this.sku.parentSku;
//                sku.exposure = this.sku.exposure;
//                sku.priority = this.sku.priority;
//                sku.qtyRelated = this.sku.qtyRelated;
//                sku.loadedLastUpdated = this.sku.loadedLastUpdated;
//                sku.skus = this.sku.skus;
//                sku.codeFamilySku = this.sku.codeFamilySku;
//                sku.descriptionFamilySku = this.sku.descriptionFamilySku;
//                sku.cost = trunc_number(paquete.price, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                sku.isComited = trunc_number(this.sku.isComited, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                sku.difference = trunc_number(this.sku.difference, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                sku.lastQtySold = this.sku.lastQtySold;
//                sku.qty = trunc_number(paquete.qty, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                if (this.sku.handleDimension) {
//                    sku.dimensions = paquete.dimensions;
//                    sku.total = paquete.totalPorDimension;
//                } else {
//                    sku.total = trunc_number((sku.qty * sku.cost), this.configuracionDeDecimales.defaultCalculationsDecimals);
//                }
//                sku.available = trunc_number(this.sku.available, this.configuracionDeDecimales.defaultCalculationsDecimals);
//                sku.codePackUnit = paquete.codePackUnit;
//                sku.discount = descAplicado.discount;
//                sku.appliedDiscount = paquete.appliedDiscount;
//                sku.handleDimension = this.sku.handleDimension;
//                sku.isSaleByMultiple = this.sku.isSaleByMultiple;
//                sku.multipleSaleQty = this.sku.multipleSaleQty;
//                sku.owner = this.sku.owner;
//                sku.ownerId = this.sku.ownerId;

//                addcallbak(sku);
//            }
//            if (index === paquetes.length - 1) {
//                donecallback();
//            }
//        } catch (e) {
//            notify("Error al obtener el sku desde la configuracion de paquetes por: " + e.message);
//        }
//    }

//    verSiOcultaElBotonCalcularDenominaciones(_this: DenominacionSkuControladorBa, callback: () => void) {
//        var uiBotonCalcularDenominacion = $("#uiLiBotonCalcularDenominacion");
//        var uiBotonAceptarCantidadSku = $("#uiLiBotonAceptarCantidadSku");

//        if (_this.useCodePackUnit === 1) {
//            uiBotonCalcularDenominacion.hide();
//            uiBotonAceptarCantidadSku.css("width", "100%");
//        } else {
//            uiBotonCalcularDenominacion.show();
//            uiBotonCalcularDenominacion.css("width", "50%");
//            uiBotonAceptarCantidadSku.css("width", "50%");
//        }
//        uiBotonCalcularDenominacion = null;
//        uiBotonAceptarCantidadSku = null;

//        _this.generarListadoDeUnidades(_this, callback);
//    }

//    obtenerDescuento(_this: DenominacionSkuControladorBa, callback: () => void) {
//        try {
//            _this.descuentoServicio.obtenerDescuentosPorClienteSku(_this.cliente, _this.sku, (descuentos: Array<DescuentoPorEscalaSku>) => {
//                _this.listaDeDescuentos = new Array<DescuentoPorEscalaSku>();
//                for (let descuento of descuentos) {
//                    let existeLaBonificacion = false;

//                    for (let descuentoExistente of _this.listaDeDescuentos) {
//                        if (descuento.packUnit === descuentoExistente.packUnit
//                            && descuento.codeSku === descuentoExistente.codeSku
//                            && descuento.discount === descuentoExistente.discount
//                            && descuento.lowLimit === descuentoExistente.lowLimit
//                            && descuento.highLimit === descuentoExistente.highLimit) {

//                            existeLaBonificacion = true;
//                            break;
//                        }
//                    }

//                    if (!existeLaBonificacion) {
//                        _this.listaDeDescuentos.push(descuento);
//                    }
//                }
//                callback();
//            }, (resultado: Operacion) => {
//                notify(resultado.mensaje);
//                callback();
//            });
//        } catch (err) {
//            callback();
//        }
//    }


//    obtenerBono(_this: DenominacionSkuControladorBa, callback, errcallback) {
//        try {
//            _this.bonoServicio.obtenerBonoPorCliente(_this.cliente, _this.sku, (listaDeBonos: Array<Bono>) => {
//                _this.listaDeBonificacion.length = 0; //= new Array<Bono>();
//                for (let bonificacion of listaDeBonos) {
//                    let existeLaBonificacion = false;

//                    for (let bonificacionExistente of _this.listaDeBonificacion) {
//                        if (bonificacion.codePackUnit === bonificacionExistente.codePackUnit
//                            && bonificacion.codeSkuBonus === bonificacionExistente.codeSkuBonus
//                            && bonificacion.codePackUnitBonues === bonificacionExistente.codePackUnitBonues) {
//                            const escalaDeBono = new EscalaDeBono();
//                            escalaDeBono.lowLimit = bonificacion.lowLimitTemp;
//                            escalaDeBono.highLimit = bonificacion.highLimitTemp;
//                            escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
//                            bonificacionExistente.escalas.push(escalaDeBono);
//                            existeLaBonificacion = true;
//                            break;
//                        }
//                    }

//                    if (!existeLaBonificacion) {
//                        const escalaDeBono = new EscalaDeBono();
//                        escalaDeBono.lowLimit = bonificacion.lowLimitTemp;
//                        escalaDeBono.highLimit = bonificacion.highLimitTemp;
//                        escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
//                        bonificacion.escalas.push(escalaDeBono);
//                        bonificacion.lowLimitTemp = 0;
//                        bonificacion.highLimitTemp = 0;
//                        bonificacion.bonusQtyTemp = 0;
//                        bonificacion.tipoDeBonificacion = TipoDeBonificacion.PorEscala;
//                        _this.listaDeBonificacion.push(bonificacion);
//                    }
//                }

//                _this.bonoServicio.obtenerBonoPorMultiploPorCliente(_this.cliente, _this.sku, (listaDeBonosPorMultiplo: Array<Bono>) => {

//                    for (let bonificacion of listaDeBonosPorMultiplo) {

//                        let existeLaBonificacion = false;

//                        for (let bonificacionExistente of _this.listaDeBonificacion) {

//                            if (bonificacion.codePackUnit === bonificacionExistente.codePackUnit
//                                && bonificacion.codeSkuBonus === bonificacionExistente.codeSkuBonus
//                                && bonificacion.codePackUnitBonues === bonificacionExistente.codePackUnitBonues) {
//                                bonificacionExistente.tipoDeBonificacion = TipoDeBonificacion.Ambos;
//                                bonificacionExistente.multiplo = bonificacion.multiplo;
//                                bonificacionExistente.bonusQtyMultiplo = bonificacion.bonusQtyMultiplo;
//                                existeLaBonificacion = true;
//                                break;
//                            }
//                        }
//                        if (!existeLaBonificacion) {
//                            bonificacion.tipoDeBonificacion = TipoDeBonificacion.PorMultiplo;
//                            _this.listaDeBonificacion.push(bonificacion);
//                        }
//                    }
//                    callback();

//                }, (resultado: Operacion) => {
//                    errcallback(resultado);
//                });
//            }, (resultado: Operacion) => {
//                errcallback(resultado);
//            });
//        } catch (err) {
//            errcallback({
//                "codigo": -1
//                , "mensaje": err.message
//                , "resultado": ResultadoOperacionTipo.Error
//                , "dbData": null
//            });
//        }
//    }

//    calcularBonificacion(_this: DenominacionSkuControladorBa, listaDePaquetes: Array<Paquete>, callback: () => void, errCallback: (resultado: Operacion) => void) {
//        try {
//            if (_this.listaDeBonificacion.length === 0) {
//                callback();
//            } else {
//                let mensajeDeError: string = "";
//                _this.paquetes.map(paquete => {
//                    if (paquete.qty !== 0) {
//                        _this.listaDeBonificacion.map(bonificacion => {
//                            if (bonificacion.codeSku === _this.sku.sku) {
//                                if (paquete.codePackUnit === bonificacion.codePackUnit && _this.validarTipBonificaion(bonificacion, paquete)) {

//                                    let exiteBonificacionEnLista = false;
//                                    _this.listaDeSkuParaBonificacion.map(skuBonificacion => {
//                                        if (paquete.codePackUnit === bonificacion.codePackUnit
//                                            && skuBonificacion.codePackUnit === bonificacion.codePackUnitBonues
//                                            && skuBonificacion.sku === bonificacion.codeSkuBonus
//                                            && skuBonificacion.parentCodePackUnit === paquete.codePackUnit) {
//                                            if (_this.usuarioPuedeModificarBonificacion) {
//                                                if (_this.paqueteSeleccionado.codePackUnit === paquete.codePackUnit) {
//                                                    if (bonificacion.tipoDeBonificacion === TipoDeBonificacion.PorMultiplo || bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos) {
//                                                        let cantidad = _this.obtenerValorEnRangoDeEscala(bonificacion, paquete);

//                                                        skuBonificacion.qtyBonusMax = (cantidad + _this.obtenerValorDeBonoMultiplo(bonificacion.multiplo, paquete.qty, bonificacion.bonusQtyMultiplo));
//                                                    } else {
//                                                        skuBonificacion.qtyBonusMax = _this.obtenerValorEnRangoDeEscala(bonificacion, paquete);
//                                                    }

//                                                    let uiEtiquetaTotalUnidadMedida = $(`#UiTextoBonificacion${skuBonificacion.sku}${skuBonificacion.codePackUnit}`);
//                                                    let cantidadABonificar: number = (uiEtiquetaTotalUnidadMedida.val() === "") ? 0 : uiEtiquetaTotalUnidadMedida.val();
//                                                    if (cantidadABonificar != undefined) {
//                                                        cantidadABonificar = parseInt(cantidadABonificar.toString());

//                                                        if (cantidadABonificar > skuBonificacion.qtyBonusMax) {
//                                                            let mensaje = `La cantidad a bonificar debe ser menor o igual a ${skuBonificacion.qtyBonusMax}`;
//                                                            $(`#UiEtiquetaTextoBonificacion${skuBonificacion
//                                                                .sku}${skuBonificacion.codePackUnit}`)
//                                                                .text(`UM.: ${skuBonificacion
//                                                                    .codePackUnit} Cant.: ${skuBonificacion
//                                                                        .qtyBonusMax}`);
//                                                            cantidadABonificar = null;
//                                                            exiteBonificacionEnLista = true;

//                                                            //errCallback(<Operacion>{ codigo: -1, mensaje: mensaje });
//                                                            mensajeDeError += mensaje;
//                                                            return;
//                                                        }
//                                                        if (cantidadABonificar !== undefined) {
//                                                            if (cantidadABonificar !== 0 || skuBonificacion.qty !== 0) {
//                                                                skuBonificacion.qty = cantidadABonificar;
//                                                            }
//                                                        }

//                                                        cantidadABonificar = null;
//                                                        uiEtiquetaTotalUnidadMedida = null;
//                                                    } else {
//                                                        exiteBonificacionEnLista = true;
//                                                        return;
//                                                    }
//                                                }
//                                            } else {
//                                                if (bonificacion.tipoDeBonificacion === TipoDeBonificacion.PorMultiplo || bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos) {
//                                                    let cantidad = _this.obtenerValorEnRangoDeEscala(bonificacion, paquete);

//                                                    skuBonificacion.qtyBonusMax = (cantidad + _this.obtenerValorDeBonoMultiplo(bonificacion.multiplo, paquete.qty, bonificacion.bonusQtyMultiplo));
//                                                } else {
//                                                    skuBonificacion.qtyBonusMax = _this.obtenerValorEnRangoDeEscala(bonificacion, paquete);
//                                                }
//                                                skuBonificacion.qty = skuBonificacion.qtyBonusMax;
//                                            }
//                                            exiteBonificacionEnLista = true;
//                                            //break;
//                                        }
//                                    });

//                                    if (!exiteBonificacionEnLista) {
//                                        let skuParaBonificacion = new Sku();
//                                        skuParaBonificacion.sku = bonificacion.codeSkuBonus;
//                                        skuParaBonificacion.codePackUnit = bonificacion.codePackUnitBonues;
//                                        skuParaBonificacion.skuName = bonificacion.descriptionSkuBonues;
//                                        skuParaBonificacion.skuDescription = bonificacion.descriptionSkuBonues;
//                                        if (bonificacion.tipoDeBonificacion === TipoDeBonificacion.PorMultiplo || bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos) {
//                                            let cantidad = _this.obtenerValorEnRangoDeEscala(bonificacion, paquete);

//                                            skuParaBonificacion.qtyBonusMax = (cantidad + _this.obtenerValorDeBonoMultiplo(bonificacion.multiplo, paquete.qty, bonificacion.bonusQtyMultiplo));
//                                        }
//                                        else {
//                                            skuParaBonificacion.qtyBonusMax = _this.obtenerValorEnRangoDeEscala(bonificacion, paquete);
//                                        }

//                                        if (localStorage.getItem("USE_MAX_BONUS") === "1") {
//                                            skuParaBonificacion.qty = skuParaBonificacion.qtyBonusMax;
//                                        } else {
//                                            skuParaBonificacion.qty = 0;
//                                        }

//                                        skuParaBonificacion.parentCodeSku = _this.sku.sku;
//                                        skuParaBonificacion.parentCodePackUnit = paquete.codePackUnit;
//                                        skuParaBonificacion.lowLimit = 0;
//                                        skuParaBonificacion.highLimit = 0;
//                                        _this.listaDeSkuParaBonificacion.push(skuParaBonificacion);
//                                        skuParaBonificacion = null;
//                                    }
//                                } else {
//                                    for (let i = 0; i < _this.listaDeSkuParaBonificacion.length; i++) {
//                                        let skuBono = _this.listaDeSkuParaBonificacion[i];
//                                        if (paquete.codePackUnit === bonificacion.codePackUnit
//                                            && skuBono.codePackUnit === bonificacion.codePackUnitBonues
//                                            && skuBono.sku === bonificacion.codeSkuBonus
//                                            && skuBono.parentCodePackUnit === paquete.codePackUnit) {
//                                            _this.listaDeSkuParaBonificacion.splice(i, 1);
//                                            i--;
//                                        }
//                                    }
//                                }
//                            }
//                        });
//                    }
//                });

//                if (mensajeDeError === "") {
//                    callback();
//                } else {
//                    errCallback(<Operacion>{ codigo: -1, mensaje: mensajeDeError });
//                }

//            }
//        } catch (err) {
//            notify("Error al calcular bonificacion: " + err.message);
//        }
//    }

//    validarTipBonificaion(bonificacion: Bono, paquete: Paquete) {
//        try {
//            let cantidadMuliplo = 0;
//            switch (bonificacion.tipoDeBonificacion) {
//                case TipoDeBonificacion.PorEscala:
//                    cantidadMuliplo = this.obtenerValorEnRangoDeEscala(bonificacion, paquete);
//                    if (cantidadMuliplo !== 0) {
//                        return true;
//                    }
//                    break;
//                case TipoDeBonificacion.PorMultiplo:
//                    cantidadMuliplo = this.obtenerValorDeBonoMultiplo(bonificacion.multiplo, paquete.qty, bonificacion.bonusQtyMultiplo);
//                    if (cantidadMuliplo !== 0) {
//                        return true;
//                    }
//                    break;
//                case TipoDeBonificacion.Ambos:
//                    cantidadMuliplo = this.obtenerValorEnRangoDeEscala(bonificacion, paquete);
//                    if (cantidadMuliplo !== 0) {
//                        return true;
//                    }
//                    cantidadMuliplo = this.obtenerValorDeBonoMultiplo(bonificacion.multiplo, paquete.qty, bonificacion.bonusQtyMultiplo);
//                    if (cantidadMuliplo !== 0) {
//                        return true;
//                    }
//                    break;
//            }
//            return false;
//        } catch (err) {
//            notify("Error al validar tipo de bonificacion: " + err.message);
//        }
//    }

//    obtenerValorEnRangoDeEscala(bonificacion: Bono, paquete: Paquete): number {
//        try {
//            for (let escala of bonificacion.escalas) {
//                if (escala.lowLimit <= paquete.qty && paquete.qty <= escala.highLimit) {
//                    return escala.bonusQty;
//                }
//            }
//            return 0;
//        } catch (err) {
//            notify(`Error al validar si hay rango de escala: ${err.message}`);
//        }
//    }

//    obtenerValorDeBonoMultiplo(multiplo: number, cantidad: number, cantidadBono: number): number {
//        if (multiplo === 1) {
//            return cantidad * cantidadBono;
//        }
//        if (cantidad < multiplo) {
//            return 0;
//        }
//        if (cantidad === multiplo) {
//            return cantidadBono;
//        }

//        let encontroCantidad = false;
//        let indice = 1;
//        while (!encontroCantidad) {
//            if ((multiplo * (indice)) <= cantidad && cantidad <= (multiplo * (indice + 1) - 1)) {
//                encontroCantidad = true;
//            } else {
//                indice++;
//            }
//        }
//        return cantidadBono * indice;
//    }

//    obtenerBonificacionPorUnidad(paquete: Paquete): Array<Sku> {
//        const listaDeSkuABonificar = new Array<Sku>();
//        try {

//            if (paquete.qty !== 0) {
//                for (let i = 0; i < this.listaDeSkuParaBonificacion.length; i++) {
//                    const skuBonificacion: Sku = this.listaDeSkuParaBonificacion[i];
//                    if (paquete.codeSku === skuBonificacion.parentCodeSku && paquete.codePackUnit === skuBonificacion.parentCodePackUnit) {
//                        listaDeSkuABonificar.push(skuBonificacion);
//                    }
//                }
//            }
//            return listaDeSkuABonificar;
//        } catch (err) {
//            notify("Error al obtener bonificacion por unidad: " + err.message);
//            return listaDeSkuABonificar;
//        }
//    }

//    validarSiModificaDescuento(_this: DenominacionSkuControladorBa, skuManejaDescuento: boolean, callback: () => void) {
//        try {
//            if (skuManejaDescuento) {
//                _this.tareaServicio.obtenerRegla("ModificacionDescuentoMovil", (listaDeReglas: Regla[]) => {

//                    _this.usuarioPuedeModificarDescuento = false;
//                    if (listaDeReglas.length >= 1) {
//                        if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
//                            _this.usuarioPuedeModificarDescuento = true;
//                        }
//                    }
//                    callback();
//                }, (resultado: Operacion) => {
//                    notify(resultado.mensaje);
//                    _this.usuarioPuedeModificarDescuento = false;
//                });
//            } else {
//                _this.usuarioPuedeModificarDescuento = false;
//                callback();
//            }
//        } catch (err) {
//            notify("Error al validar si modifica descuento: " + err.message);
//            _this.usuarioPuedeModificarDescuento = false;
//        }
//    }

//    mostrarTextoDescuento(_this: DenominacionSkuControladorBa, motrarDescunto: boolean) {
//        if (motrarDescunto) {
//            var useMaxDiscount = localStorage.getItem('USE_MAX_DISCOUNT').toString();

//            let uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
//            uiEtiquetaTotalCdUnidadMedida.css("display", "block");
//            uiEtiquetaTotalCdUnidadMedida.css("display", "inline");
//            uiEtiquetaTotalCdUnidadMedida = null;

//            let uiListViewDescuento = $('#UiLiDescuentoSkuMaximo');
//            uiListViewDescuento.css("display", "block");
//            uiListViewDescuento = null;

//            let uiEtiquetaDescuentoSkuMaximo = $('#UiEtiquetaDescuentoSkuMaximo');
//            uiEtiquetaDescuentoSkuMaximo.text("Descuento: " + _this.descuentoActual.discount + "%");
//            uiEtiquetaDescuentoSkuMaximo = null;

//            let uiListaSkuMedidas = $('#UiTextoDecuentoSku');
//            uiListaSkuMedidas.attr("placeholder", ("Descuento"));
//            uiListaSkuMedidas.val(((_this.descuentoActual.appliedDiscount !== 0) ? _this.descuentoActual.appliedDiscount : ""));
//            if (useMaxDiscount === "1") {
//                uiListaSkuMedidas.val(((_this.descuentoActual.appliedDiscount !== 0) ? _this.descuentoActual.appliedDiscount : _this.descuentoActual.discount));
//            }
//            if (_this.usuarioPuedeModificarDescuento) {
//                uiListaSkuMedidas.css("display", "block");
//            } else {
//                uiListaSkuMedidas.css("display", "none");
//            }
//            uiListaSkuMedidas = null;
//        } else {
//            let uiListViewDescuento = $('#UiLiDescuentoSkuMaximo');
//            uiListViewDescuento.css("display", "none");
//            uiListViewDescuento = null;

//            let uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
//            uiEtiquetaTotalCdUnidadMedida.css("display", "none");
//            uiEtiquetaTotalCdUnidadMedida = null;

//            let uiListaSkuMedidas = $('#UiTextoDecuentoSku');
//            uiListaSkuMedidas.attr("placeholder", ("Descuento"));
//            uiListaSkuMedidas.val("");
//            uiListaSkuMedidas.css("display", "none");
//            uiListaSkuMedidas = null;
//        }
//    }


//    mostrarTextoTotalesDeSkuSeleccionado(mostrarInfo: boolean) {
//        let uiListInfoSku = $("#panelInfoTotalesSkuSeleccionado");
//        if (mostrarInfo) {
//            uiListInfoSku.css("display", "block");
//            uiListInfoSku = null;
//        } else {
//            uiListInfoSku.css("display", "none");
//            uiListInfoSku = null;
//        }
//    }


//    validarDescuentoIngresado(_this: DenominacionSkuControladorBa, callback: () => void, callbackError: (resultado: Operacion) => void) {
//        try {
//            let descuento = new DescuentoPorEscalaSku();
//            let useMaxDiscount = localStorage.getItem('USE_MAX_DISCOUNT').toString();
//            let aplicarDescuento = (cantidadDescuento: number) => {
//                let paquete = _this.paquetes
//                    .filter(x => x.codePackUnit === _this.paqueteSeleccionado.codePackUnit)[0];
//                let indice = _this.paquetes.indexOf(paquete);
//                _this.paquetes[indice].appliedDiscount = cantidadDescuento;

//                _this.sku.appliedDiscount = cantidadDescuento;
//                _this.descuentoActual.appliedDiscount = cantidadDescuento;
//            };


//            if (_this.listaDeDescuentos.length === 0) {
//                _this.sku.appliedDiscount = 0;
//                _this.descuentoActual.appliedDiscount = 0;
//                descuento = null;
//                callback();
//                return;
//            } else {
//                let uiTxtCantidad = $('#UiTextoCantidadUnidadMedida');
//                let cant: number = uiTxtCantidad.val();
//                if (_this.sku.isSaleByMultiple) {
//                    cant = (cant * _this.sku.multipleSaleQty);
//                }

//                descuento = _this.listaDeDescuentos
//                    .filter(x => x.codeSku === _this.sku.sku &&
//                        x.codePackUnit === _this.paqueteSeleccionado.codePackUnit &&
//                        cant >= x.lowLimit &&
//                        x.highLimit >= cant)[0];
//                if (descuento == null) {
//                    aplicarDescuento(0);
//                    _this.mostrarTextoDescuento(_this, false);
//                    callback();
//                    return;
//                } else {
//                    _this.descuentoActual = descuento;
//                    if (descuento.discount === 0) {
//                        aplicarDescuento(0);
//                        uiTxtCantidad = null;
//                        cant = null;
//                        callback();
//                        return;
//                    } else {
//                        let descuentoIngresado: number = 0;
//                        if (_this.usuarioPuedeModificarDescuento) {
//                            let uiListaSkuMedidas = $('#UiTextoDecuentoSku');
//                            if (_this.descuentoActual.appliedDiscount === 0 && useMaxDiscount === "1") descuentoIngresado = descuento.discount;
//                            else descuentoIngresado = (uiListaSkuMedidas.val() !== "") ? uiListaSkuMedidas.val() : 0;

//                            if (descuentoIngresado > descuento.discount) {
//                                uiListaSkuMedidas.focus();
//                                uiListaSkuMedidas = null;
//                                callbackError(<Operacion>{ codigo: -2, mensaje: "Sobrepasa el maximo de Descuento." });
//                                DesBloquearPantalla();
//                                return;
//                            }
//                            uiListaSkuMedidas = null;
//                        } else {
//                            descuentoIngresado = descuento.appliedDiscount;
//                        }
//                        _this.mostrarTextoDescuento(_this, true);
//                        aplicarDescuento(descuentoIngresado);
//                        callback();
//                        uiTxtCantidad = null;
//                        cant = null;
//                    }
//                }
//            }
//        } catch (err) {
//            callbackError(<Operacion>{ codigo: -1, mensaje: "Error el descuento ingresado: " + err.message });
//        }
//    }

//    usuarioSeleccionoUnidadDeMedida() {
//        try {
//            if (this.paquetes === undefined) {
//                return;
//            }

//            let listaDeUnidadesDeMedida = [];

//            let primerPaquete = (this.paquetes.length > 0) ? this.paquetes : "";

//            let cambiarOrdenDePaquete = false;
//            if (primerPaquete !== this.primerPaqueteOrdenadoPorPrimeraVez) {
//                this.paquetes.reverse();
//                cambiarOrdenDePaquete = true;
//            }
//            primerPaquete = null;

//            for (let paquete of this.paquetes) {
//                if ((this.useCodePackUnit === 1 && paquete.price !== -1) || this.useCodePackUnit === 0) {
//                    listaDeUnidadesDeMedida.push({
//                        text: paquete.descriptionPackUnit,
//                        value: paquete.codePackUnit
//                    });
//                }
//            }

//            if (cambiarOrdenDePaquete) {
//                this.paquetes.reverse();
//            }
//            cambiarOrdenDePaquete = null;
//            let configoptions = {
//                title: "Listado de Unidades de Medida",
//                items: listaDeUnidadesDeMedida,
//                doneButtonLabel: "Ok",
//                cancelButtonLabel: "Cancelar"
//            };
//            ShowListPicker(configoptions,
//                item => {
//                    this.paqueteSeleccionado.packUnit = 1;

//                    this.paqueteSeleccionado.codePackUnit = item;
//                    if (this.useCodePackUnit === 0) {
//                        let primerPaquete = (this.paquetes.length > 0) ? this.paquetes[0].codePackUnit : "";

//                        let cambiarOrdenDePaquete = false;
//                        if (primerPaquete !== this.primerPaqueteOrdenadoPorPrimeraVez) {
//                            this.paquetes.reverse();
//                            cambiarOrdenDePaquete = true;
//                        }
//                        primerPaquete = null;
//                        this.usuarioDeseaCalcularDenominaciones();
//                    } else {

//                        this.limpiarControles();



//                        if (this.sku.handleDimension) {
//                            this.generarListaDeDimension(this);
//                            this.calcularTotalesDeCantidadConDimension(this);
//                        }
//                        this.calcularBonificacion(this, this.paquetes, () => {
//                            this.validarDescuentoIngresado(this, () => {
//                                this.usuarioDeseaCalcularTotalesDeLinea(() => {

//                                }, (resultadoN2: Operacion) => {
//                                    notify(resultadoN2.mensaje);
//                                });
//                            }, (resultadoN1: Operacion) => {
//                                if (resultadoN1.codigo === -1) {
//                                    notify(resultadoN1.mensaje);
//                                }
//                            });
//                        }, (resultado: Operacion) => {
//                            notify(resultado.mensaje);
//                        });
//                    }
//                    let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
//                    uiTextoCantidadUnidadMedida.focus();
//                    uiTextoCantidadUnidadMedida.trigger("keyup");
//                    uiTextoCantidadUnidadMedida = null;
//                }
//            );
//            configoptions = null;
//            listaDeUnidadesDeMedida = null;
//        } catch (ex) {
//            notify("Error al cargar las unidades de medida: " + ex.message);
//        }
//    }

//    limpiarControles() {
//        try {
//            let uiEtiquetaUnidadDeMedida = $("#UiEtiquetaUnidadDeMedida");
//            uiEtiquetaUnidadDeMedida.text("...");
//            uiEtiquetaUnidadDeMedida = null;

//            let uiLiUltimoPedidoUnidadMedida = $("#UiLiUltimoPedidoUnidadMedida");
//            uiLiUltimoPedidoUnidadMedida.hide();
//            uiLiUltimoPedidoUnidadMedida = null;

//            let uiEtiquetaUltimoPedidoUnidadMedida = $("#UiEtiquetaUltimoPedidoUnidadMedida");
//            uiEtiquetaUltimoPedidoUnidadMedida.val("Ult. Pedido: 0");
//            uiEtiquetaUltimoPedidoUnidadMedida.hide();
//            uiEtiquetaUltimoPedidoUnidadMedida = null;


//            let uiEtiquetaPrecioUnidadMedida = $("#UiEtiquetaPrecioUnidadMedida");
//            uiEtiquetaPrecioUnidadMedida.hide();
//            uiEtiquetaPrecioUnidadMedida.text("Precio: " + DarFormatoAlMonto(0));
//            uiEtiquetaPrecioUnidadMedida = null;

//            let uiEtiquetaTotalUnidadMedida = $("#UiEtiquetaTotalUnidadMedida");
//            uiEtiquetaTotalUnidadMedida.hide();
//            uiEtiquetaTotalUnidadMedida.text("Total: " + DarFormatoAlMonto(0));
//            uiEtiquetaTotalUnidadMedida = null;

//            let uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
//            uiEtiquetaTotalCdUnidadMedida.hide();
//            uiEtiquetaTotalCdUnidadMedida.text("Total CD: " + DarFormatoAlMonto(0));
//            uiEtiquetaTotalCdUnidadMedida = null;

//            let uiListaDeBonificacionesUnidadMedida = $('#UiListaDeBonificacionesUnidadMedida');
//            uiListaDeBonificacionesUnidadMedida.children().remove('li');
//            uiListaDeBonificacionesUnidadMedida = null;

//            let uiAcordionDeBonificacionesUnidadMedida = $("#UiAcordionDeBonificacionesUnidadMedida");
//            uiAcordionDeBonificacionesUnidadMedida.hide();
//            uiAcordionDeBonificacionesUnidadMedida = null;

//            let uiListaDeDimensionesYCantidadesDeSku = $("#UiListaDeDimensionesYCantidadesDeSku");
//            uiListaDeDimensionesYCantidadesDeSku.children().remove("li");
//            uiListaDeDimensionesYCantidadesDeSku = null;


//        } catch (ex) {
//            notify("Error al limpiar los controles: " + ex.message);
//        }
//    }

//    establecerCantidad(cantidad: number, codePackUnit: string) {
//        try {
//            for (let paquete of this.paquetes) {
//                if (paquete.codePackUnit === codePackUnit) {
//                    paquete.qty = cantidad;
//                    break;
//                }
//            }
//        } catch (ex) {
//            notify("Error al limpiar los controles: " + ex.message);
//        }
//    }

//    obtenerCantidadIngresadaPorUnidadDeMedida(codeUnidadMedida: string): number {
//        try {
//            for (let paquete of this.paquetes) {
//                if (codeUnidadMedida === paquete.codePackUnit) {
//                    return paquete.qty;
//                }
//            }
//            return 0;
//        } catch (ex) {
//            return 0;
//        }
//    }

//    validarSiModificaBonificacion(_this: DenominacionSkuControladorBa, callback: () => void) {
//        try {
//            _this.tareaServicio.obtenerRegla("ModificacionBonificacionMovil", (listaDeReglas: Regla[]) => {
//                _this.usuarioPuedeModificarBonificacion = false;
//                if (listaDeReglas.length >= 1) {
//                    if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
//                        _this.usuarioPuedeModificarBonificacion = true;
//                    }
//                }
//                callback();
//            }, (resultado: Operacion) => {
//                notify(resultado.mensaje);
//                _this.usuarioPuedeModificarBonificacion = false;
//                callback();
//            });
//        } catch (err) {
//            notify(`Error al validar si modifica bonificacion: ${err.message}`);
//            _this.usuarioPuedeModificarBonificacion = false;
//            callback();
//        }
//    }

//    usuarioDeseaVerResumenDelProducto() {
//        let myPanel = $.mobile.activePage.children('[id="UiPanelIzquierdoPaginaDenominacion"]') as any;
//        myPanel.panel("toggle");
//        myPanel = null;
//        this.cargarResumen();
//    }

//    cargarResumen() {
//        try {

//            if (this.paquetes === undefined) {
//                return;
//            }

//            let primerPaquete = (this.paquetes.length > 0) ? this.paquetes[0].codePackUnit : "";

//            let cambiarOrdenDePaquete = false;
//            if (primerPaquete !== this.primerPaqueteOrdenadoPorPrimeraVez) {
//                this.paquetes.reverse();
//                cambiarOrdenDePaquete = true;
//            }
//            primerPaquete = null;

//            let uiListaResumenUnidadMedida = $("#UiListaResumenUnidadMedida");
//            uiListaResumenUnidadMedida.children().remove("li");

//            for (let paquete of this.paquetes) {
//                if (paquete.qty !== 0) {
//                    let listaDeSkuABonificar: Array<Sku> = this.obtenerBonificacionPorUnidad(paquete);
//                    let totalDescuento = trunc_number(((paquete.qty * paquete.price) - ((paquete.appliedDiscount * (paquete.qty * paquete.price)) / 100)), this.configuracionDeDecimales.defaultCalculationsDecimals);

//                    let li = "<li class='ui-field - contain' data-theme='a' style='text- align: right'>";
//                    li += "<a href='#' style='text-align: left; background-color: #666;' data-theme='b' class='ui-btn ui-btn-icon-top ui-nodisc-icon'>";
//                    li += `<FONT color='#FFFFFF'>${paquete.descriptionPackUnit}</FONT>`;
//                    li += "</a>";
//                    li += "</li>";

//                    uiListaResumenUnidadMedida.append(li);
//                    uiListaResumenUnidadMedida.listview("refresh");

//                    li = "<li class='ui-field-contain' data-theme='a' style='text-align: right'>";
//                    li += `<span class='HeaderSmall'>Cantidad &emsp;&emsp; ${format_number(paquete.qty, this.configuracionDeDecimales.defaultDisplayDecimals)}</span><br>`;
//                    li += `<span class='HeaderSmall'>Precio &emsp;&emsp; ${DarFormatoAlMonto(format_number(paquete.price, this.configuracionDeDecimales.defaultDisplayDecimals))}</span><hr>`;
//                    li += `<span class='HeaderSmall'>Total &emsp;&emsp; ${DarFormatoAlMonto(format_number((paquete.qty * paquete.price), this.configuracionDeDecimales.defaultDisplayDecimals))}</span><br>`;

//                    if (paquete.lastQtySold > 0 || paquete.appliedDiscount !== 0) {
//                        if (paquete.lastQtySold > 0) {
//                            li += `<span class='HeaderSmall'>Ult. Pedido &emsp;&emsp; ${paquete.lastQtySold}</span><br>`;
//                        }
//                        if (paquete.appliedDiscount !== 0 && paquete.appliedDiscount !== undefined) {
//                            li += `<span class='HeaderSmall'>Descuento(${paquete.appliedDiscount}%) &emsp;&emsp; ${DarFormatoAlMonto(format_number((paquete.appliedDiscount / 100) * (paquete.qty * paquete.price), this.configuracionDeDecimales.defaultDisplayDecimals))}</span><hr>`;
//                        }
//                    }

//                    if (paquete.appliedDiscount !== 0) {
//                        li += `<span class='HeaderSmall'> Total CD: ${DarFormatoAlMonto(format_number((totalDescuento), this.configuracionDeDecimales.defaultDisplayDecimals))}</span>`;
//                    }

//                    li += "</li>";

//                    uiListaResumenUnidadMedida.append(li);
//                    uiListaResumenUnidadMedida.listview("refresh");

//                    if (listaDeSkuABonificar.length > 0) {
//                        let exitenBonificacionesMayorAcero = false;

//                        for (let skuParaBonificacion of listaDeSkuABonificar) {
//                            if (skuParaBonificacion.qty > 0) {
//                                exitenBonificacionesMayorAcero = true;
//                            }
//                        }

//                        if (exitenBonificacionesMayorAcero) {
//                            li = "<li class='ui-field-contain' data-theme='a' style='text-align: right'>";
//                            li += "<div data-role='collapsible' data-content-theme='a' data-inset='true' data-mini='true' data-theme='b' class='ui-nodisc-icon' data-collapsed-icon='carat-d' data-expanded-icon='carat-u' Width='100%'>";
//                            li += "<h5 style='text- align:center'>Bonificaciones</h5>";
//                            li += `<ul data-role='listview' data-inset='false' data-divider-theme='a' id='UiListaBonificacionResumenUnidadMedida${paquete.codePackUnit}' >`;
//                            li += "</ul>";
//                            li += "</div>";
//                            li += "</li>";

//                            uiListaResumenUnidadMedida.append(li);
//                            uiListaResumenUnidadMedida.listview("refresh");
//                            uiListaResumenUnidadMedida.trigger("create");

//                            let uiListaBonificacionResumenUnidadMedida = $(`#UiListaBonificacionResumenUnidadMedida${paquete.codePackUnit}`);

//                            for (let skuParaBonificacion of listaDeSkuABonificar) {
//                                if (skuParaBonificacion.qty > 0) {
//                                    li = "<li class='ui-field - contain' data-theme='a' style='text- align: left'>";
//                                    li += `<span class='medium'>${skuParaBonificacion.sku}</span><br/>`;
//                                    li += `<span class='medium'>${skuParaBonificacion.skuDescription}</span><br/>`;
//                                    li += `<span class='medium'>UM.: ${skuParaBonificacion.codePackUnit} Cant.: ${skuParaBonificacion.qty}</span><br/>`;

//                                    li += "</li>";
//                                    uiListaBonificacionResumenUnidadMedida.append(li);
//                                    uiListaBonificacionResumenUnidadMedida.listview("refresh");
//                                }
//                            }
//                            uiListaBonificacionResumenUnidadMedida = null;
//                        }

//                    }

//                    li = null;

//                    listaDeSkuABonificar = null;
//                    totalDescuento = null;
//                }
//            }

//            uiListaResumenUnidadMedida = null;

//            if (cambiarOrdenDePaquete) {
//                this.paquetes.reverse();
//            }
//            cambiarOrdenDePaquete = null;
//        } catch (ex) {
//            notify(`Error al cargar la informacion: ${ex.message}`);
//        }
//    }

//    validarSiIngresoCantidades(): boolean {
//        try {

//            const paquetesVerificados
//                = this.paquetes.filter(x => x.qty > 0);

//            // ReSharper disable once QualifiedExpressionMaybeNull
//            if (paquetesVerificados === undefined || paquetesVerificados.length === 0) {
//                return false;
//            } else {
//                return true;
//            }

//        } catch (ex) {
//            notify(`Error al validar Cantidades: ${ex.message}`);
//            return false;
//        }
//    }

//    generarListaDeDimension(_this: DenominacionSkuControladorBa) {
//        try {
//            if (!_this.sku.handleDimension) {
//                return;
//            }
//            let uiTxtCantidadSku = $("#uiTxtCantidadSku");
//            let uiTxtDimensionSku = $("#uiTxtDimensionSku");
//            uiTxtCantidadSku.val("");
//            uiTxtDimensionSku.val("");
//            uiTxtCantidadSku = null;
//            uiTxtDimensionSku = null;

//            for (let paquete of _this.paquetes) {
//                if (paquete.codePackUnit === _this.paqueteSeleccionado.codePackUnit) {
//                    let uiListaDeDimensionesYCantidadesDeSku = $("#UiListaDeDimensionesYCantidadesDeSku");
//                    uiListaDeDimensionesYCantidadesDeSku.children().remove('li');
//                    for (let dimension of paquete.dimensions) {
//                        let li = "";
//                        let cantidadSku = format_number(dimension.qtySku, _this.configuracionDeDecimales.defaultDisplayDecimals);
//                        let dimensionSku = format_number(dimension.dimensionSku, _this.configuracionDeDecimales.defaultDisplayDecimals);
//                        let totalSku = format_number(dimension.total, _this.configuracionDeDecimales.defaultDisplayDecimals);
//                        li += `<li id='${dimension.dimensionSku}'>`;
//                        li += "<p>";
//                        li += `<span><b>Cantidad:</b> ${cantidadSku}&nbsp;<b>Dimensión</b> ${dimensionSku}</span>`;
//                        li += ` <span class='ui-li-count'> ${DarFormatoAlMonto(format_number(totalSku, _this.configuracionDeDecimales.defaultDisplayDecimals))}</span>`;
//                        li += "</p>";
//                        li += "</li>";
//                        uiListaDeDimensionesYCantidadesDeSku.append(li);
//                        cantidadSku = null;
//                        dimensionSku = null;
//                        totalSku = null;
//                    }
//                    uiListaDeDimensionesYCantidadesDeSku.listview("refresh");
//                    uiListaDeDimensionesYCantidadesDeSku = null;
//                    break;
//                }
//            }

//        } catch (ex) {
//            notify(`Error al generar listado de dimension: ${ex.message}`);
//        }
//    }

//    quitarCantidadConDimension(dimension: number) {
//        try {
//            for (let paquete of this.paquetes) {
//                if (paquete.codePackUnit === this.paqueteSeleccionado.codePackUnit) {
//                    for (let i = 0; i < paquete.dimensions.length; i++) {
//                        if (paquete.dimensions[i].dimensionSku === (dimension * 1)) {
//                            paquete.dimensions.splice(i, 1);
//                            break;
//                        }
//                    }
//                    break;
//                }
//            }
//            this.generarListaDeDimension(this);
//            this.calcularTotalesDeCantidadConDimension(this);
//        } catch (ex) {
//            notify(`Error al quitar: ${ex.message}`);
//        }
//    }

//    calcularTotalesDeCantidadConDimension(_this: DenominacionSkuControladorBa) {
//        try {
//            for (let paquete of _this.paquetes) {
//                let qty = 0;
//                let total = 0;
//                for (let dimen of paquete.dimensions) {
//                    qty += dimen.qtySku;
//                    total += dimen.total;
//                }
//                paquete.qty = qty;
//                paquete.totalPorDimension = total;
//                if (paquete.codePackUnit === _this.paqueteSeleccionado.codePackUnit) {
//                    let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
//                    uiTextoCantidadUnidadMedida.val(paquete.qty);
//                    uiTextoCantidadUnidadMedida = null;
//                }
//            }
//            _this.usuarioDeseaCalcularTotales(_this, () => {

//            }, (resultado: Operacion) => {
//                DesBloquearPantalla();
//                notify(resultado.mensaje);
//            });
//        } catch (ex) {
//            notify(`Error al calcular: ${ex.message}`);
//        }
//    }

//    obtenerDescuentoPorMontoGeneral(total: number, callback: (total) => void) {
//        this.descuentoServicio.obtenerDescuentoPorMontoGeneral(this.cliente, total, (descuentoPorMontoGeneral) => {
//            this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
//            callback(total);
//        }, (resultado: Operacion) => {
//            callback(null);
//        });
//    }

//    calcularDescuentosPaquetes(paquetes: any): number {
//        let total = 0;
//        for (let paquete of paquetes) {
//            if (paquete.qty !== 0) {
//                total += (paquete.qty * paquete.price) - ((paquete.qty * paquete.price) * (parseFloat(paquete.appliedDiscount.toString()) / 100));
//            }
//        }
//        return total;
//    }

//    calcularTotalesDescuentosPaquetes(_this: DenominacionSkuControladorBa, paquetes: any, callback: () => void): void {
//        let total = 0;
//        paquetes.map(paquete => {
//            total += (paquete.qty * paquete.price) - ((paquete.qty * paquete.price) * (parseFloat(paquete.appliedDiscount.toString()) / 100));
//        });

//        if (_this.sku.modificando) {
//            _this.totalPedido = _this.tarea.salesOrderTotal - total;
//        } else {
//            _this.totalPedido = _this.tarea.salesOrderTotal;
//        }

//        let lblTotal = $("#UiTotalCantidadSkus");
//        lblTotal.html(DarFormatoAlMonto(format_number(_this.tarea.salesOrderTotal - (_this.tarea.salesOrderTotal * (_this.cliente.appliedDiscount / 100)), _this.configuracionDeDecimales.defaultDisplayDecimals)));

//        callback();
//    }

//    cargarPantalla(_this: DenominacionSkuControladorBa) {
//        my_dialog("Espere", "Preparando información, por favor, espere...", "open");
//        _this.useCodePackUnit = parseInt(localStorage.getItem("USE_PACK_UNIT"));
//        let uiEtiquetaCantidadesTotales = $("#UiEtiquetaCantidadesTotales");
//        _this.primerPaqueteOrdenadoPorPrimeraVez = "";

//        _this.obtenerConversiones(_this, () => {
//            _this.validarSiModificaDescuento(_this, true, () => {
//                _this.validarSiModificaBonificacion(_this, () => {
//                    _this.paquetes = [];
//                    _this.verSiOcultaElBotonCalcularDenominaciones(_this,
//                        () => {
//                            _this.limpiarControlesDePantalla(_this);


//                            _this.ventasPorMultiploServicio.validarSiTieneVentaPorMultiplo(_this.cliente, _this.sku, null, null, (tiene: boolean, paqueteN1: Paquete, controlN1: any) => {
//                                let uiCantidaSku = $("#UiCantidadSKU");
//                                let uiCantidadesTotales = $("UiEtiquetaCantidadesTotales");

//                                uiCantidadesTotales.val(_this.sku.qty);
//                                if (_this.sku.isSaleByMultiple && tiene) {
//                                    uiEtiquetaCantidadesTotales.css("display", "block");
//                                    uiCantidaSku.val(_this.sku.qty / _this.sku.multipleSaleQty);
//                                } else {
//                                    uiEtiquetaCantidadesTotales.css("display", "none");
//                                    uiCantidaSku.val(_this.sku.qty);
//                                }
//                                _this.obtenerDescuento(_this, () => {
//                                    _this.obtenerBono(_this,
//                                        () => {
//                                            if (parseFloat(_this.sku.originalDiscount.toString()) !== 0) {
//                                                _this.sku.appliedDiscount = parseFloat(_this.sku.originalDiscount.toString());
//                                                let uiTxtDescuentoSku = $("#UiTextoDecuentoSku");
//                                                if (_this.listaDeDescuentos.length !== 0) {
//                                                    let cantidad: number = _this.sku.qty;

//                                                    let des1 = _this.listaDeDescuentos
//                                                        .filter(x => x.codeSku === _this.sku.sku &&
//                                                            x.codePackUnit === _this.paqueteSeleccionado.codePackUnit &&
//                                                            cantidad >= x.lowLimit &&
//                                                            x.highLimit >= cantidad)[0];

//                                                    if (des1 !== undefined) {

//                                                        uiTxtDescuentoSku.val(_this.sku.appliedDiscount);

//                                                        _this.descuentoActual = des1;
//                                                        _this.descuentoActual.appliedDiscount = _this.sku
//                                                            .appliedDiscount;

//                                                        _this.mostrarUnidadDeMedidaMasPequeño(_this, _this.paquetes);
//                                                    }
//                                                }
//                                                uiTxtDescuentoSku = null;
//                                            } else {
//                                                _this.mostrarUnidadDeMedidaMasPequeño(_this, _this.paquetes);
//                                            }
//                                        },
//                                        (resultado: Operacion) => {
//                                            notify(resultado.mensaje);
//                                        });
//                                });

//                                uiCantidaSku = null;
//                                uiCantidadesTotales = null;
//                            },
//                                (resultado: Operacion) => {
//                                    notify(resultado.mensaje);
//                                });
//                            if (!_this.sku.handleDimension) {
//                                let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
//                                uiTextoCantidadUnidadMedida.focus();
//                                uiTextoCantidadUnidadMedida.trigger("keyup");
//                            }
//                            my_dialog("", "", "close");
//                        });
//                });
//            });
//        });
//    }

//    mostrarPantallaAnterior() {
//        let _this = this;
//        if (_this.estaAgregando) {
//            _this.tarea.salesOrderTotal = _this.totalPedido;
//        }
//        switch ($.mobile.activePage[0].id) {
//            case "skucant_page":
//                _this.sku = _this.skuOriginal;
//                _this.listaSku = _this.listaSkuOriginal;
//                _this.listaDeSkuParaBonificacion = _this.listaDeSkuParaBonificacionOriginal;
//                window.history.back();
//                break;
//        }
//    }

//    limpiarControlesDePantalla(_this: DenominacionSkuControladorBa) {
//        let ultimoPedido = $("#ultPedido");
//        let uiTxtCantidadSku = $("#uiTxtCantidadSku");
//        let uiTxtDimensionSku = $("#uiTxtDimensionSku");
//        uiTxtCantidadSku.val("");
//        uiTxtDimensionSku.val("");
//        ultimoPedido.hide();
//        uiTxtCantidadSku = null;
//        uiTxtDimensionSku = null;
//        ultimoPedido = null;

//        let uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
//        uiTextoCantidadUnidadMedida.css("display", "block");
//        uiTextoCantidadUnidadMedida.val("");


//        uiTextoCantidadUnidadMedida = null;

//        let uiAcordionDeDimensionesYCantidadesDeSku = $("#UiAcordionDeDimensionesYCantidadesDeSku");
//        uiAcordionDeDimensionesYCantidadesDeSku.css("display", "none");
//        uiAcordionDeDimensionesYCantidadesDeSku = null;

//        _this.mostrarTextoDescuento(_this, false);
//        _this.mostrarTextoTotalesDeSkuSeleccionado(true);

//        let uiEtiquetaCantidadesTotales = $("#UiEtiquetaCantidadesTotales");
//        if (_this.estaAgregando) {
//            uiEtiquetaCantidadesTotales.css("display", "none");
//            _this.paqueteSeleccionado = new Paquete();
//            _this.limpiarControles();
//            _this.listaDeSkuParaBonificacion = new Array<Sku>();
//            _this.paqueteSeleccionado.packUnit = 0;
//            _this.paqueteSeleccionado.codePackUnit = "";
//        }
//        uiEtiquetaCantidadesTotales = null;

//        _this.listaSku = [];
//    }

//    validarCantidadIngresada(cantidad: number, callback: () => void, errorCallback: (resultado: Operacion) => void) {
//        if (cantidad % 1 === 0) {
//            callback();
//        }
//        else {
//            errorCallback(<Operacion>{ codigo: -1, mensaje: "La cantidad ingresada debe de ser un número entero" });
//        }
//    }

//} 