﻿/// <reference path="../services/javascriptservicio.ts" />
let timerElapsed = false;
let emitCompleted = false;
let interval = 0;
var socketTareaDetalle: SocketIOClient.Socket;
let tareaDetalleControlador: TareaDetalleControlador;

class TareaDetalleControlador {

    tokenProcesarTipoTarea: SubscriptionToken;

    clienteServicio = new ClienteServicio();
    tareaServicio = new TareaServcio();
    ordenDeVentaServicio = new OrdenDeVentaServicio();
    draftServicio = new DraftServicio();
    configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
    skuServicio = new SkuServicio();
    listaDePreciosServicio = new ListaDePreciosServicio();
    comboServicio = new ComboServicio();
    promoServicio: PromoServicio = new PromoServicio();
    configuracionDecimales: ManejoDeDecimales;
    tarea = new Tarea();
    pregutarTipoOrdenDeVenta: number;
    cliente = new Cliente();
    contadorDeIteraciones: number = 0;


    constructor(public mensajero: Messenger) {
        this.tokenProcesarTipoTarea = mensajero.subscribe<ProcesarTipoDeTareaMensaje>(this.tipoDeTareaEntregado, getType(ProcesarTipoDeTareaMensaje), this);
    }

    delegadoTareaDetalleControlador() {
        tareaDetalleControlador = this;
        $("#btnAcceptThisTask").bind("touchstart", () => {
            this.obtenerDatosDeTarea(() => {
                this.usuarioDeseaAceptarLaTarea();
            });
        });

        $("#taskdetail_page").on("pageshow", () => {
            this.obtenerConfiguracionDeDecimales(() => {
                this.limpiarCamposDetalleTarea();
                this.obtenerDatosDeTarea(() => {
                    this.draftServicio.obtenerDraftsOrdenDeVenta((ordenes: OrdenDeVenta[]) => {
                        this.draftServicio.obtenerDetalleDeOrdenDeVentaDraft(ordenes, (ordenes: OrdenDeVenta[]) => {
                            this.actualizarTareaIdABorradorOrdeDeVenta(ordenes);
                        }, (resultadoN1: Operacion) => {
                            console.log(resultadoN1.mensaje);
                        });
                    }, (resultado: Operacion) => {
                        console.log(resultado.mensaje);
                    });
                });
            },(operacion: Operacion) => {
                notify(operacion.mensaje);
            });
        });

// ReSharper disable once TsResolvedFromInaccessibleModule
        $("#taskdetail_page").swipe({
            swipe: (event, direction, distance, duration, fingerCount, fingerData) => {
                if (fingerCount === 1 && direction === "right") {
                    var myPanel = <any>$.mobile.activePage.children('[id="UiPanelDerrechoAceptarTarea"]');
                    myPanel.panel("toggle");
                }
            }
        });

        //$("#taskdetail_page").on("swiperight", () => {
        //    var myPanel = <any>$.mobile.activePage.children('[id="UiPanelDerrechoAceptarTarea"]');
        //    myPanel.panel("toggle");
        //});

        $("#UIBotonModificarClienteDesdeAceptarTarea").bind("touchstart", () => {
            this.usuarioDeseaModifcarCliente();
        });


    }

    delegarSockets(socketIo: SocketIOClient.Socket) {
        socketTareaDetalle = socketIo;
        socketIo.on("GetCurrentAccountByCustomer_Request", (data) => {
            switch (data.option) {
                case OpcionRespuesta.Exito:
                    my_dialog("", "", "close");
                    console.log("Validando Saldo desde: " + data.source);
                    switch (data.source) {
                        case OpcionValidarSaldoCliente.EjecutarTarea:
                            this.obtenerDatosDeTarea(() => {
                                this.seguirOrdenDeVenta(this.cliente);
                            });
                            break;
                    }
                    break;
            }
        });

        socketIo.on("GetPriceListBySkuUsingCustomerId", (data) => {
            switch (data.option) {
                case "add_price_list_by_sku_using_customerid":
                    if (!timerElapsed) {
                        this.tarea = JSON.parse(JSON.stringify(data.tarea)) as Tarea;
                        this.listaDePreciosServicio.agregarPaqueteDeListaDePreciosPorSku(data.recordset, data.cliente,
                            (clienteRespuesta) => {
                                emitCompleted = true;
                                let client = JSON.parse(JSON.stringify(clienteRespuesta)) as Cliente;
                                this.procesarClienteParaOrdenDeVenta(client);
                            },
                            (resultado) => {
                                emitCompleted = true;
                                notify(resultado.mensaje);
                            });
                    }
                    break;

                case "get_price_list_by_sku_using_customerId_fail":
                    notify(data.message);
                    emitCompleted = true;
                    break;
                case "no_found_price_list_by_sku_using_customerid":
                    emitCompleted = true;
                    this.establecerListaDePreciosAClienteYProcesarlo(data.cliente);
                    break;
            }
        });
    }
    actualizarTareaIdABorradorOrdeDeVenta(ordenesDeVentaDraft: OrdenDeVenta[]) {
        try {
            for (var i = 0; i < ordenesDeVentaDraft.length; i++) {
                if (ordenesDeVentaDraft[i].taskId === 0) {
                    this.draftServicio.obtenerTaskIdParaBorradorDeOrdenDeVenta(ordenesDeVentaDraft[i], i, (ordenDeVenta: OrdenDeVenta, indice: number) => {
                        ordenesDeVentaDraft[indice] = ordenDeVenta;
                        if (ordenesDeVentaDraft[indice].taskId !== 0) {
                            this.draftServicio.actualizarTareaIdParaBorradorDeOrdenDeVenta(ordenesDeVentaDraft[indice], () => {
                                //--
                            }, (resultado: Operacion) => {
                                notify(resultado.mensaje);
                            });
                        }
                    }, (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });
                }
            }
        } catch (err) {
            notify("Erro al actualizar la tarea id para el borrador: " + err.message);
        }
    }

    desplegarDatosCliente(cliente: Cliente) {
        let uiLblLimiteDeCredito = $("#UiLblLimiteDeCredito");
        let uiLblSaldoVencido = $("#UiLblSaldoVencido");
        let uiLblSaldoDisponibleTarea = $("#UiLblSaldoDisponibleTarea");
        let uiLblDiasDeCredito = $("#UiLblDiasDeCredito");
        let uiLblUltimaCompra = $("#UiLblUltimaCompra");
        let uiTxtTareaDesc = $("#UiTxtTareaDesc");
        let uiLblSaldoTareaFooter = $("#UiLblSaldoTareaFooter");
        let uiLblTotalSaldoTareaFooter = $("#UiLblTotalSaldoTareaFooter");

        let disponible = cliente.cuentaCorriente.limiteDeCredito - cliente.previousBalance;
        
        uiLblLimiteDeCredito.text(format_number(cliente.cuentaCorriente.limiteDeCredito, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblSaldoVencido.text(format_number(cliente.previousBalance, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblSaldoDisponibleTarea.text(format_number(disponible, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblDiasDeCredito.text(cliente.cuentaCorriente.diasCredito);
        uiLblUltimaCompra.text(format_number(cliente.lastPurchase, this.configuracionDecimales.defaultDisplayDecimals));
        uiTxtTareaDesc.val(`Tarea Generada para Cliente: ${cliente.clientName}`);
        uiLblSaldoTareaFooter.text(format_number(cliente.previousBalance, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblTotalSaldoTareaFooter.text(format_number(disponible, this.configuracionDecimales.defaultDisplayDecimals));
    }

    obtenerDatosDeTarea(callback) {
        try {
            this.tarea.taskId = gtaskid;
            this.tarea.taskType = gTaskType;
            this.tarea.taskStatus = TareaEstado.Aceptada;
            this.tarea.taskIsFrom = gTaskIsFrom;
            this.tarea.salesOrderTotal = 0;
            if (gtaskid !== 0) {
                this.tareaServicio.obtenerTarea(this.tarea, (tarea: Tarea) => {
                    var uiClienteName = $("#lblClientName_pickup");
                    uiClienteName.text(tarea.relatedClientName);
                    uiClienteName = null;
                    var uiAdrres = $("#lblAddress_pickup");
                    uiAdrres.text(tarea.taskAddress);
                    uiAdrres = null;
                    gtaskStatus = tarea.taskStatus;

                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            }
            
            this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales((decimales: ManejoDeDecimales) => {
                var cliente = new Cliente();
                cliente.clientId = gClientID;
                this.configuracionDecimales = decimales;
                this.clienteServicio.obtenerCliente(cliente, decimales, (clienteFiltrado: Cliente) => {
                    this.cliente = clienteFiltrado;
                    this.comboServicio.obtenerCombosPorCliente(clienteFiltrado, (clienteConCombos: Cliente) => {
                        this.obtenerHistoricodePromo((listaDeHistoricoDePromos: Promo[]) => {
                            this.validarSiAplicaLasBonificacionesPorCombo(clienteFiltrado.bonoPorCombos, 0, listaDeHistoricoDePromos, (listaDeBonificaciones: BonoPorCombo[]) => {
                                this.cliente.bonoPorCombos = listaDeBonificaciones;
                                this.cliente.cuentaCorriente = new CuentaCorriente();
                                this.clienteServicio.obtenerCuentaCorriente(clienteConCombos, this.configuracionDecimales, (clienteConCuentaCorriente: Cliente) => {
                                    this.cliente = clienteConCuentaCorriente;
                                    this.desplegarDatosCliente(clienteConCuentaCorriente);
                                    callback();
                                }, (resultado: Operacion) => {
                                    notify(resultado.mensaje);
                                });

                            }, (operacion: Operacion) => {
                                notify(operacion.mensaje);
                            });
                        }, (operacion: Operacion) => {
                            notify(operacion.mensaje);
                        });
                    }, (operacion: Operacion) => {
                        notify(operacion.mensaje);
                    });

                }, (operacion: Operacion) => {
                    notify(operacion.mensaje);
                });

            }, (operacion: Operacion) => {
                notify(operacion.mensaje);
            });

        } catch (err) {
            notify("Error al cargar la tarea: " + err.message);
        }
    }

    limpiarCamposDetalleTarea() {
        try {
            var uiClienteName = $("#lblClientName_pickup");
            var uiClientAddress = $("#lblAddress_pickup");

            uiClienteName.text("");
            uiClientAddress.text("");

            uiClienteName = null;
            uiClientAddress = null;

        } catch (e) {
            notify("No se han podido limpiar los campos de detalle de la tarea actual debido a: " + e.message);
        }
    }

    usuarioDeseaCargarTarea() {
        try {
            this.obtenerDatosDeTarea(() => {
                this.prosesarTipoTarea();
            });
        } catch (err) {
            notify("Error al cargar la tarea: " + err.message);
        }
    }

    usuarioDeseaAceptarLaTarea() {
        try {
            if (gIsOnline === EstaEnLinea.Si) {
                this.tareaServicio.enviarTareaAceptada(this.tarea, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            }
            this.prosesarTipoTarea();

        } catch (err) {
            notify(err.mensaje);
        }
    }

    prosesarTipoTarea() {
        try {
            this.limpiarVariablesGlobales();
            switch (this.tarea.taskType) {
                case TareaTipo.Entrega:
                    this.tareaServicio.actualizarTareaEstado(this.tarea, () => {
                        this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales((decimales: ManejoDeDecimales) => {
                            var cliente = new Cliente();
                            cliente.clientId = gClientID;
                            this.clienteServicio.obtenerCliente(cliente, decimales, (clienteFiltrado: Cliente) => {
                                actualizarListadoDeTareas(this.tarea.taskId, this.tarea.taskType, this.tarea.taskStatus, clienteFiltrado.clientId, clienteFiltrado.clientName, clienteFiltrado.address, 0, gtaskStatus, clienteFiltrado.rgaCode);
                                gotomyDelivery();
                            }, (operacion: Operacion) => {
                                notify(operacion.mensaje);
                            });

                        }, (operacion: Operacion) => {
                            notify(operacion.mensaje);
                        });
                    }, (operacion: Operacion) => {
                        notify("Error al actualizar tarea: " + operacion.mensaje);
                    });

                    break;
                case TareaTipo.Preventa:
                    this.ejecutarTareaDePreventa();
                    break;
                case TareaTipo.Borrador:
                    this.ejecutarTareaDePreventa();
                    break;
                case TareaTipo.Venta:
                    EjecutarTareaDeVenta(gClientID);
                    break;
                case TareaTipo.Obsoleto:
                    EjecutarTareaDeVenta(gClientID);
                    break;
                case TareaTipo.TomaDeInventario:
                    this.publicarTareaDeTomaDeInventario(this.tarea);
                    this.tareaServicio.actualizarTareaEstado(this.tarea, () => {
                        var cliente = new Cliente();
                        cliente.clientId = gClientID;
                        //this.obtenerConfiguracionDeDecimales();
                        this.clienteServicio.obtenerCliente(cliente, this.configuracionDecimales, (cliente: Cliente) => {
                            actualizarListadoDeTareas(this.tarea.taskId, this.tarea.taskType, this.tarea.taskStatus, cliente.clientId, cliente.clientName, cliente.address, 0, gtaskStatus, cliente.rgaCode);
                        }, (resultado: Operacion) => {
                            my_dialog("", "", "closed");
                            notify(resultado.mensaje);
                        });
                    }, (operacion: Operacion) => {
                        notify("Error al actualizar: " + operacion.mensaje);
                    });
                    my_dialog("", "", "closed");
                    this.mostrarPantallaDeTomaDeInventario();
                    break;
            }
        } catch (err) {
            notify(err.mensaje);
        }
    }

    validarSiSeAplicaLaRegla(listDeRaglasAValidar: Regla []):boolean {
        if (listDeRaglasAValidar.length === 0) {
            return false;
        } else {
            switch (listDeRaglasAValidar[0].enabled.toUpperCase()) {
                case "SI":
                    return true;
                case "SÍ":
                    return true;
            }
        }
    }

    ejecutarTareaDePreventa() {
        var este = this;
        var cliente = new Cliente();

        cliente.clientId = gClientID;
        this.clienteServicio.obtenerCliente(cliente, this.configuracionDecimales, (clienteFiltrado: Cliente) => {
            this.comboServicio.obtenerCombosPorCliente(clienteFiltrado, (clienteConCombos: Cliente) => {
                este.cliente = clienteConCombos;
                this.obtenerHistoricodePromo((listaHistoricoDePromos: Promo[]) => {
                    this.validarSiAplicaLasBonificacionesPorCombo(este.cliente.bonoPorCombos , 0, listaHistoricoDePromos, (listaDeBonificaciones: BonoPorCombo[]) => {
                        este.cliente.bonoPorCombos = listaDeBonificaciones;
                        this.tareaServicio.obtenerRegla("ValidarListaDePreciosConServidor", (listaDeReglasValidarListaDePreciosConServidor: Regla[]) => {
                            if (this.validarSiSeAplicaLaRegla(listaDeReglasValidarListaDePreciosConServidor)) {
                                if (este.cliente.priceListId === null || este.cliente.priceListId === "") {
                                    if (!este.cliente.isNew) {
                                        //notify("Cliente no tiene lista de precios asignada, la lista de precios a utilizar será la Lista por Defecto.");    
                                    }
                                    this.establecerListaDePreciosAClienteYProcesarlo(este.cliente);
                                }
                                else {
                                    this.skuServicio.verificarCantidadDeSkusDisponiblesParaCliente(este.cliente, (cantidadSkus, clienteVerificado) => {
                                        this.cliente = clienteVerificado;
                                        if (cantidadSkus > 0) {
                                            este.procesarClienteParaOrdenDeVenta(clienteVerificado);
                                        }
                                        else {
                                            if (gIsOnline === 1) {
                                                tareaDetalleControlador = this;
                                                const data = {
                                                    'loginid': gLastLogin,
                                                    'dbuser': gdbuser,
                                                    'dbuserpass': gdbuserpass,
                                                    'cliente': clienteVerificado,
                                                    'routeid': gCurrentRoute,
                                                    'tarea': this.tarea
                                                };
                                                console.log("Obteniendo lista de precios por sku de cliente fuera de ruta");
                                                socketTareaDetalle.emit("GetPriceListBySkuUsingCustomerId", data);

                                                BloquearPantalla();
                                                interval = setInterval(() => {
                                                    ToastThis("Consultando Precios");
                                                    este.contadorDeIteraciones++;
                                                    if (este.contadorDeIteraciones >= 5) {
                                                        DesBloquearPantalla();
                                                        timerElapsed = true;
                                                        if (!emitCompleted) {
                                                            if (
                                                                clienteVerificado.priceListId !==
                                                                localStorage.getItem("gDefaultPriceList")) {
                                                                //notify("La lista de precios a utilizar será la Lista por Defecto.");
                                                            }
                                                            este.establecerListaDePreciosAClienteYProcesarlo(clienteVerificado);
                                                        }
                                                        clearInterval(interval);
                                                    }
                                                },
                                                    1000);
                                            } else {
                                                if (
                                                    clienteVerificado.priceListId !==
                                                    localStorage.getItem("gDefaultPriceList")) {
                                                    notify("No se encontró conexión al Servidor, la lista de precios a utilizar será la Lista por Defecto.");
                                                }
                                                este
                                                    .establecerListaDePreciosAClienteYProcesarlo(clienteVerificado);
                                            }

                                        }
                                    }, (resultado: Operacion) => {
                                        notify(resultado.mensaje);
                                        my_dialog("", "", "closed");
                                    });
                                }
                            }
                            else {
                                this.skuServicio.verificarCantidadDeSkusDisponiblesParaCliente(clienteConCombos, (cantidadSkus, clienteVerificado) => {
                                    if (cantidadSkus > 0) {
                                        este.procesarClienteParaOrdenDeVenta(clienteVerificado);
                                    }
                                    else {
                                        if (
                                            clienteVerificado.priceListId !==
                                            localStorage.getItem("gDefaultPriceList")) {
                                            //notify("La lista de precios a utilizar será la Lista por Defecto.");
                                        }
                                        este.establecerListaDePreciosAClienteYProcesarlo(clienteVerificado);
                                    }
                                }, (resultado: Operacion) => {
                                    notify(resultado.mensaje);
                                    my_dialog("", "", "closed");
                                });
                            }
                        }, (resultado: Operacion) => {
                            notify(resultado.mensaje);
                            my_dialog("", "", "closed");
                        });

                    }, (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });

                }, (operacion: Operacion) => {
                    notify(operacion.mensaje);
                });
            }, (operacion: Operacion) => {
                notify(operacion.mensaje);
            });
        }, (resultado: Operacion) => {
            my_dialog("", "", "closed");
            notify(resultado.mensaje);
        });
    }

    publicarListaDeSkuOrdenDeVenta() {
        var listaDeSkuOrdenDeVenta: Sku[] = [];
        var msg = new ListaSkuMensaje(this);
        msg.listaSku = listaDeSkuOrdenDeVenta;
        //this.mensajero.publish(msg, getType(ListaSkuMensaje));
    }

    publicarCombo() {
        var listaDeSkuParaBonificacionDeCombo: Array<BonoPorCombo> = [];
        var msg = new ListaDeSkuParaBonificacionDeComboMensaje(this);
        msg.listaDeSkuParaBonificacionDeCombo = listaDeSkuParaBonificacionDeCombo;
        this.mensajero.publish(msg, getType(ListaDeSkuParaBonificacionDeComboMensaje));
    }

    tipoDeTareaEntregado(mensaje: ProcesarTipoDeTareaMensaje, subscriber: any): void {
        (<TareaDetalleControlador>subscriber).usuarioDeseaCargarTarea();
    }

    usuarioDeseaVerOpcionesDeTipoDeOrdenesDeVenta(callback: () => void) {
        try {

            var config = {
                title: "Tipo de Orden de Venta",
                items: [
                    { text: "Contado", value: OrdenDeVentaTipo.Contado },
                    { text: "Credito", value: OrdenDeVentaTipo.Credito }
                ],
                doneButtonLabel: "Ok",
                cancelButtonLabel: "Cancelar"
            };

            plugins.listpicker.showPicker(config,
                (item) => {
                    switch (item) {
                        case OrdenDeVentaTipo.Contado:
                            gSalesOrderType = OrdenDeVentaTipo.Contado;
                            ToastThis("Orden de Venta de Tipo: Contado");
                            callback();
                            break;
                        case OrdenDeVentaTipo.Credito:
                            gSalesOrderType = OrdenDeVentaTipo.Credito;
                            ToastThis("Orden de Venta de Tipo: Credito");
                            callback();
                            break;
                    }
                }
            );
        } catch (err) {
            notify("Error al cargar los Tipos de Orden de Venta: " + err.message);
        }
    }

    seguirOrdenDeVenta(cliente: Cliente) {
        try {

            this.verificarSiDebeModificarCliente((debeValidarCliente) => {
                if (debeValidarCliente && this.tarea.taskType === TareaTipo.Preventa && gTaskIsFrom === TareaEstado.Asignada) {
                    cliente.origen = "TareaDetalleControlador";
                    cliente.estaEnModificacionObligatoria = true;
                    this.cliente = cliente;
                    if (this.pregutarTipoOrdenDeVenta === 1) {
                        this.usuarioDeseaVerOpcionesDeTipoDeOrdenesDeVenta(() => {
                          
                            this.mostrarPantallaDeModificacionDeCliente();
                            my_dialog("", "", "closed");
                        });
                    } else {
                    
                        this.mostrarPantallaDeModificacionDeCliente();
                        my_dialog("", "", "closed");
                    }
                } else {
                    this.cliente.estaEnModificacionObligatoria = false;
                    this.tareaServicio.actualizarTareaEstado(this.tarea, () => {
                        actualizarListadoDeTareas(this.tarea.taskId, this.tarea.taskType, this.tarea.taskStatus, cliente.clientId, cliente.clientName, cliente.address, 0, gtaskStatus, this.cliente.rgaCode);
                        if (this.pregutarTipoOrdenDeVenta === 1) {
                            this.usuarioDeseaVerOpcionesDeTipoDeOrdenesDeVenta(() => {
                                if (this.tarea.hasDraft) {
                                    this.motrarPantallaOrdenDeVenta();
                                } else {
                                    this.mostrarPantallaDeListadoDeSkus();
                                }
                            });
                        } else {
                            if (this.tarea.hasDraft) {
                                this.motrarPantallaOrdenDeVenta();
                            } else {
                                this.mostrarPantallaDeListadoDeSkus();
                            }
                        }
                    }, (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });
                }
            }, (error) => {
                notify(error.mensaje);
            });
        } catch (err) {
            notify("Error al seguir orden de venta: " + err.message);
        }
    }

    motrarPantallaOrdenDeVenta() {
        try {
            $.mobile.changePage("pos_skus_page", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false,
                data: {
                    "cliente": this.cliente
                    , "tarea": this.tarea
                    , "configuracionDecimales": this.configuracionDecimales
                    , "esPrimeraVez": true
                }
            });
            my_dialog("", "", "closed");
        } catch (err) {
            notify(`Error al seguir orden de venta: ${err.message}`);
        }
    }

    mostrarPantallaDeListadoDeSkus() {
        try {
            $.mobile.changePage("skus_list_page", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false,
                data: {
                    "cliente": this.cliente
                    , "tarea": this.tarea
                    , "configuracionDecimales": this.configuracionDecimales
                    , "listaSku": new Array<Sku>()
                    , "esPrimeraVez": true
                    , "listaDeSkuOrdenDeVenta" : new Array<Sku>()
                }
            });
            my_dialog("", "", "closed");
        } catch (err) {
            notify(`Error al mostrar el listado de SKU's debido a: ${err.message}`);
        }
    }

    irDirectoAOrdenDeVenta(cliente: Cliente, lstSku: Sku[]) {
        if (this.tarea.taskType === TareaTipo.Preventa) {
            this.obtenerOrdenDeVenta(cliente, (cliente: Cliente, ordenDeVenta: OrdenDeVenta, publicarOrdenDeVenta: boolean) => {
                cliente.fotoDeInicioDeVisita = ordenDeVenta.image3;
                //this.publicarCliente(cliente);
                if (this.tarea.taskId !== 0) {
                    this.publicarListaDeSkuOrdenDeVenta();
                }
                if (publicarOrdenDeVenta) {
                    this.tarea.hasDraft = true;
                    this.publicarOrdenDeVentaDraf(ordenDeVenta);
                } else {
                    this.tarea.hasDraft = false;
                }
                this.seguirOrdenDeVenta(cliente);
            });
        } else {
            //this.publicarCliente(cliente);
            if (this.tarea.taskId !== 0) {
                this.publicarListaDeSkuOrdenDeVenta();
            }
            this.seguirOrdenDeVenta(cliente);
        }
    }

    irAOrdenDeVentaValidandoCuentaCorriente(cliente: Cliente, lstSku: Sku[]) {
        this.clienteServicio.validarDatosGeneralesCuentaCorriente(cliente, (cliente: Cliente) => {
            this.tareaServicio.obtenerRegla("ValidarConServidorAntiguedadDeSaldos", (listaDeReglasValidarConServidorAntiguedadDeSaldos: Regla[]) => {
                if (gIsOnline === EstaEnLinea.No || (listaDeReglasValidarConServidorAntiguedadDeSaldos.length === 0 || listaDeReglasValidarConServidorAntiguedadDeSaldos[0].enabled.toUpperCase() === 'NO')) {
                    this.clienteServicio.validarCuentaCorriente(cliente, lstSku, gSalesOrderType, this.configuracionDecimales, (cliente: Cliente) => {


                        if (this.tarea.taskType === TareaTipo.Preventa) {
                            this.obtenerOrdenDeVenta(cliente, (cliente: Cliente, ordenDeVenta: OrdenDeVenta, publicarOrdenDeVenta: boolean) => {
                                if (this.tarea.taskId !== 0) {
                                    this.publicarListaDeSkuOrdenDeVenta();
                                }
                                if (publicarOrdenDeVenta) {
                                    this.tarea.hasDraft = true;
                                    this.publicarOrdenDeVentaDraf(ordenDeVenta);
                                } else {
                                    this.tarea.hasDraft = false;
                                }
                                this.seguirOrdenDeVenta(cliente);
                            });
                        } else {
                            if (this.tarea.taskId !== 0) {
                                this.publicarListaDeSkuOrdenDeVenta();
                            }
                            this.seguirOrdenDeVenta(cliente);
                        }
                        
                    }, (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });
                } else {
                    this.clienteServicio.enviarSolicitudParaObtenerCuentaCorriente(socketTareaDetalle, cliente, OpcionValidarSaldoCliente.EjecutarTarea, gSalesOrderType, (cliente: Cliente) => {
                        this.cliente = cliente;
                        if (this.tarea.taskType === TareaTipo.Preventa) {
                            this.obtenerOrdenDeVenta(cliente, (cliente: Cliente, ordenDeVenta: OrdenDeVenta, publicarOrdenDeVenta: boolean) => {
                                if (this.tarea.taskId !== 0) {
                                    this.publicarListaDeSkuOrdenDeVenta();
                                }
                                if (publicarOrdenDeVenta) {
                                    this.publicarOrdenDeVentaDraf(ordenDeVenta);
                                }
                            });
                        } else {
                            if (this.tarea.taskId !== 0) {
                                this.publicarListaDeSkuOrdenDeVenta();
                            }
                        }
                    }, (resultado: Operacion) => {
                        notify(resultado.mensaje);
                        my_dialog("", "", "closed");
                    });
                }
            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
                my_dialog("", "", "closed");
            });
        }, (resultado: Operacion) => {
            notify(resultado.mensaje);
            my_dialog("", "", "closed");
        });
    }

    publicarOrdenDeVentaDraf(ordenDeVenta: OrdenDeVenta) {
        var msg = new OrdenDeVentaDraftMensaje(this);
        msg.ordenDeVenta = ordenDeVenta;
        this.mensajero.publish(msg, getType(OrdenDeVentaDraftMensaje));
    }

    obtenerOrdenDeVenta(cliente: Cliente, callback: (cliente: Cliente, ordenDeVenta: OrdenDeVenta, publicarOrdenDeVenta: boolean) => void) {
        try {
            this.ordenDeVentaServicio.obtenerOrdenDeVentaPorTarea(this.tarea, this.configuracionDecimales, (ordenDeVenta: OrdenDeVenta) => {
                if (ordenDeVenta.ordenDeVentaDetalle.length >= 1) {
                    if (ordenDeVenta.isDraft === 1) {
                        cliente.deliveryDate = ordenDeVenta.deliveryDate;
                        cliente.totalAmout = ordenDeVenta.totalAmount;
                        callback(cliente, ordenDeVenta, true);
                    } else {
                        callback(cliente, ordenDeVenta, false);
                    }

                } else {
                    callback(cliente, ordenDeVenta, false);
                }

            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
        } catch (err) {
            notify("Error al obtener orden de venta: " + err.message);
        }
    }

    obtenerConfiguracionDeDecimales(callback,errCallback) {
        this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales((decimales: ManejoDeDecimales) => {
            this.configuracionDecimales = decimales;
            callback();
        }, (operacion: Operacion) => {
            errCallback(operacion);
        });
    }

    publicarTareaDeTomaDeInventario(tarea: Tarea) {
        var msg = new TareaMensaje(this);
        msg.tarea = tarea;
        this.mensajero.publish(msg, getType(TareaMensaje));
    }

    mostrarPantallaDeTomaDeInventario() {
        try {
            $.mobile.changePage("#UiPageTakeInventory", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false
            });
        } catch (err) {
            notify("Error al seguir toma de inventario: " + err.message);
        }
    }

    usuarioDeseaModifcarCliente() {
        this.cliente.origen = "TareaDetalleControlador";
        this.mostrarPantallaDeModificacionDeCliente();
    }

    procesarClienteParaOrdenDeVenta(cliente: Cliente) {
        this.cliente = cliente;
        var sku = new Sku();
        sku.sku = "";
        sku.onHand = 0;
        var lstSku: Sku[] = [];

        localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", "ALL");

        this.clienteServicio.obtenerCuentaCorriente(cliente, tareaDetalleControlador.configuracionDecimales, (cliente: Cliente) => {
            this.tareaServicio.obtenerRegla("tipoOrdenDeVenta", (listaDeReglasTipoOrdenDeVenta: Regla[]) => {
                this.tareaServicio.obtenerRegla("AplicarReglasComerciales", (listaDeReglasAplicarReglasComerciales: Regla[]) => {
                    if (listaDeReglasAplicarReglasComerciales.length > 0 && listaDeReglasAplicarReglasComerciales[0].enabled === 'Si') {
                        my_dialog("Validando crédito y saldo", "Espere...", "open");
                        this.tareaServicio.obtenerRegla("NoValidarAntiguedadDeSaldos", (listaDeReglasValidarAntiguedadDeSaldos: Regla[]) => {
                            if (listaDeReglasValidarAntiguedadDeSaldos.length > 0 && listaDeReglasValidarAntiguedadDeSaldos[0].enabled === 'Si' || listaDeReglasValidarAntiguedadDeSaldos[0].enabled === 'SI') {
                                gSalesOrderType = OrdenDeVentaTipo.Contado;
                                this.pregutarTipoOrdenDeVenta = 0;
                                this.irDirectoAOrdenDeVenta(cliente, lstSku);
                            } else {
                                this.tareaServicio.obtenerRegla("LimiteDeCreditoCero", (listaDeReglasLimiteDeCredito: Regla[]) => {


                                    if (listaDeReglasLimiteDeCredito.length >= 1 && listaDeReglasTipoOrdenDeVenta.length >= 1) {

                                        if (cliente.cuentaCorriente.limiteDeCredito === 0) {
                                            notify("Creando Orden de Venta de Tipo Contado");
                                            gSalesOrderType = OrdenDeVentaTipo.Contado;
                                            this.pregutarTipoOrdenDeVenta = 0;
                                            this.irDirectoAOrdenDeVenta(cliente, lstSku);
                                        } else {

                                            gSalesOrderType = OrdenDeVentaTipo.Credito;
                                            this.pregutarTipoOrdenDeVenta = 1;
                                            this.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                        }

                                    } else if (listaDeReglasLimiteDeCredito.length >= 1 && listaDeReglasTipoOrdenDeVenta.length === 0) {

                                        if (cliente.cuentaCorriente.limiteDeCredito === 0) {
                                            notify("Creando Orden de Venta de Tipo Contado");
                                            gSalesOrderType = OrdenDeVentaTipo.Contado;
                                            this.pregutarTipoOrdenDeVenta = 0;
                                            this.irDirectoAOrdenDeVenta(cliente, lstSku);

                                        } else {

                                            gSalesOrderType = OrdenDeVentaTipo.Credito;
                                            this.pregutarTipoOrdenDeVenta = 0;
                                            this.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                        }

                                    } else if (listaDeReglasLimiteDeCredito.length === 0 && listaDeReglasTipoOrdenDeVenta.length >= 1) {
                                        gSalesOrderType = OrdenDeVentaTipo.Credito;
                                        this.pregutarTipoOrdenDeVenta = 1;
                                        this.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);

                                    } else {
                                        gSalesOrderType = OrdenDeVentaTipo.Credito;
                                        this.pregutarTipoOrdenDeVenta = 0;
                                        this.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                    }


                                }, (resultado: Operacion) => {
                                    notify(resultado.mensaje);
                                    my_dialog("", "", "closed");
                                });
                            }
                        }, (resultado: Operacion) => {
                            notify(resultado.mensaje);
                            my_dialog("", "", "closed");
                        });
                    }
                    else {
                        gSalesOrderType = OrdenDeVentaTipo.Credito;
                        if (listaDeReglasTipoOrdenDeVenta.length > 0 && listaDeReglasTipoOrdenDeVenta[0].enabled === 'Si') {
                            this.pregutarTipoOrdenDeVenta = 1;
                        }
                        else {
                            this.pregutarTipoOrdenDeVenta = 0;
                        }
                        this.irDirectoAOrdenDeVenta(cliente, lstSku);
                    }
                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                    my_dialog("", "", "closed");
                });
            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
                my_dialog("", "", "closed");
            });


        }, (resultado: Operacion) => {
            notify(resultado.mensaje);
            my_dialog("", "", "closed");
        });
    }

    establecerListaDePreciosAClienteYProcesarlo(cliente: Cliente) {
        var este = this;

        este.cliente.priceListId = localStorage.getItem("gDefaultPriceList");

        este.procesarClienteParaOrdenDeVenta(este.cliente);

        my_dialog("", "", "closed");
    }

    limpiarVariablesGlobales() {
        timerElapsed = false;
        emitCompleted = false;
        interval = 0;
    }

    verificarSiDebeModificarCliente(callBack: (debeModificarCliente: boolean) => void,
        errorCallBack: (operacion: Operacion) => void): void {
        let op: Operacion;
        try {
            ObtenerReglas("ModificarDatosDeCliente", (reglas) => {
                if (reglas.rows.length > 0) {
                    let regla = reglas.rows.item(0);
                    if (regla.ENABLED === "SI" || regla.ENABLED === "Si") {
                        callBack(true);
                        regla = null;
                    } else {
                        callBack(false);
                        regla = null;
                    }
                } else {
                    callBack(false);
                }
            }, (error) => {
                op = new Operacion();
                op.codigo = -1;
                op.mensaje = error;
                op.resultado = ResultadoOperacionTipo.Error;
                errorCallBack(op);
                op = null;
            });
        } catch (e) {
            op = new Operacion();
            op.codigo = -1;
            op.mensaje = e.message;
            op.resultado = ResultadoOperacionTipo.Error;
            errorCallBack(op);
            op = null;
        }
    }

    mostrarPantallaDeModificacionDeCliente() {
        $.mobile.changePage("UiPageCustomerInfo", {
            transition: "flow"
            , reverse: true
            , changeHash: false
            , showLoadMsg: false,
            data: {
                "cliente": this.cliente
                , "tarea": this.tarea
                , "configuracionDecimales": this.configuracionDecimales
                , "esPrimeraVez": true
            }
        });
    }

    //----------Promo---------//
    validarSiAplicaLasBonificacionesPorCombo(listaDeBonificaciones: BonoPorCombo[], indiceDeListaDeBonificacion: number, listaHistoricoDePromos: Promo[], callBack: (listaDeBonificaciones: BonoPorCombo[]) => void, errCallback: (resultado: Operacion) => void) {
        try {
            if (listaHistoricoDePromos.length > 0) {
                if (listaDeBonificaciones.length > 0 && listaDeBonificaciones.length > indiceDeListaDeBonificacion) {
                    let bonificacionAValidar: BonoPorCombo = listaDeBonificaciones[indiceDeListaDeBonificacion];
                    let resultadoDePromoHistorico : Promo = listaHistoricoDePromos.find((promo: Promo) => {
                        return promo.promoId === bonificacionAValidar.promoId;
                    });
                    if (resultadoDePromoHistorico) {
                        let promoDeBonificacion: Promo = new Promo();
                        promoDeBonificacion.promoId = bonificacionAValidar.promoId;
                        promoDeBonificacion.promoName = bonificacionAValidar.promoName;
                        promoDeBonificacion.frequency = bonificacionAValidar.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico, (aplicaPromo: boolean) => {
                            if (!aplicaPromo) {
                                listaDeBonificaciones = listaDeBonificaciones.filter((bonificacion: BonoPorCombo) => {
                                    return resultadoDePromoHistorico.promoId !== bonificacion.promoId;
                                });
                            }
                            this.validarSiAplicaLasBonificacionesPorCombo(listaDeBonificaciones, indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0), listaHistoricoDePromos, (listaDeBonificaciones: BonoPorCombo[]) => {
                                callBack(listaDeBonificaciones);
                            }, (resultado: Operacion) => {
                                errCallback(resultado);
                            });
                        }, (resultado: Operacion) => {
                            errCallback(resultado);
                        });
                        promoDeBonificacion = null;
                    } else {
                        this.validarSiAplicaLasBonificacionesPorCombo(listaDeBonificaciones, indiceDeListaDeBonificacion + 1, listaHistoricoDePromos, (listaDeDescuento: BonoPorCombo[]) => {
                            callBack(listaDeDescuento);
                        }, (resultado: Operacion) => {
                            errCallback(resultado);
                        });
                    }
                } else {
                    callBack(listaDeBonificaciones);
                }
            } else {
                callBack(listaDeBonificaciones);
            }
        } catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: `Error al validar la si aplica la bonificacion por combo: ${ex.message}`
            } as Operacion);
        }
    }

    obtenerHistoricodePromo(callBack: (listaHistoricoDePromos: Promo[]) => void, errCallback: (resultado: Operacion) => void) {
        try {
            this.promoServicio.obtenerHistoricoDePromosParaCliente(this.cliente, (listaHistoricoDePromos: Promo[]) => {
                callBack(listaHistoricoDePromos);
            }, (resultado: Operacion) => {
                errCallback(resultado);
            });
        } catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: `Error al obtener historico de promociones: ${ex.message}`
            } as Operacion);
        }
    }

    //----------Promo---------//
}