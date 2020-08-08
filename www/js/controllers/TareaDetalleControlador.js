var timerElapsed = false;
var emitCompleted = false;
var socketTareaDetalle;
var tareaDetalleControlador;
var TareaDetalleControlador = (function () {
    function TareaDetalleControlador(mensajero) {
        this.mensajero = mensajero;
        this.clienteServicio = new ClienteServicio();
        this.tareaServicio = new TareaServcio();
        this.ordenDeVentaServicio = new OrdenDeVentaServicio();
        this.draftServicio = new DraftServicio();
        this.configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.skuServicio = new SkuServicio();
        this.listaDePreciosServicio = new ListaDePreciosServicio();
        this.comboServicio = new ComboServicio();
        this.promoServicio = new PromoServicio();
        this.tarea = new Tarea();
        this.cliente = new Cliente();
        this.contadorDeIteraciones = 0;
        this.encuestaServicio = new EncuestaServicio();
        this.cuentaCorrienteServicio = new CuentaCorrienteServicio();
        this.tokenProcesarTipoTarea = mensajero.subscribe(this.tipoDeTareaEntregado, getType(ProcesarTipoDeTareaMensaje), this);
    }
    TareaDetalleControlador.prototype.delegadoTareaDetalleControlador = function () {
        var _this_1 = this;
        tareaDetalleControlador = this;
        $("#btnAcceptThisTask").on("click", function () {
            _this_1.obtenerDatosDeTarea(function () {
                _this_1.usuarioDeseaAceptarLaTarea();
            });
        });
        $("#taskdetail_page").on("pageshow", function () {
            _this_1.obtenerConfiguracionDeDecimales(function () {
                _this_1.limpiarCamposDetalleTarea();
                _this_1.obtenerDatosDeTarea(function () {
                    _this_1.draftServicio.obtenerDraftsOrdenDeVenta(function (ordenes) {
                        _this_1.draftServicio.obtenerDetalleDeOrdenDeVentaDraft(ordenes, function (ordenes) {
                            _this_1.actualizarTareaIdABorradorOrdeDeVenta(ordenes);
                        }, function (resultadoN1) {
                            console.log(resultadoN1.mensaje);
                        });
                    }, function (resultado) {
                        console.log(resultado.mensaje);
                    });
                });
            }, function (operacion) {
                notify(operacion.mensaje);
            });
        });
        $("#taskdetail_page").swipe({
            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                if (fingerCount === 1 && direction === "right") {
                    var myPanel = ($.mobile.activePage.children('[id="UiPanelDerrechoAceptarTarea"]'));
                    myPanel.panel("toggle");
                }
            }
        });
        $("#UIBotonModificarClienteDesdeAceptarTarea").bind("touchstart", function () {
            _this_1.usuarioDeseaModifcarCliente();
        });
        $("#UiBotonPromocionesTareaDetalle").bind("touchstart", function () {
            _this_1.usuarioDeseaVerPromocionesDisponibles();
        });
    };
    TareaDetalleControlador.prototype.delegarSockets = function (socketIo) {
        var _this_1 = this;
        socketTareaDetalle = socketIo;
        socketIo.on("GetCurrentAccountByCustomer_Request", function (data) {
            switch (data.option) {
                case OpcionRespuesta.Exito:
                    my_dialog("", "", "close");
                    console.log("Validando Saldo desde: " + data.source);
                    switch (data.source) {
                        case OpcionValidarSaldoCliente.EjecutarTarea:
                            _this_1.obtenerDatosDeTarea(function () {
                                _this_1.seguirOrdenDeVenta(_this_1.cliente);
                            });
                            break;
                    }
                    break;
            }
        });
        socketIo.on("GetPriceListBySkuUsingCustomerId", function (data) {
            switch (data.option) {
                case "add_price_list_by_sku_using_customerid":
                    if (!timerElapsed) {
                        _this_1.tarea = JSON.parse(JSON.stringify(data.tarea));
                        _this_1.listaDePreciosServicio.agregarPaqueteDeListaDePreciosPorSku(data.recordset, data.cliente, function (clienteRespuesta) {
                            emitCompleted = true;
                            var client = JSON.parse(JSON.stringify(clienteRespuesta));
                            _this_1.procesarClienteParaOrdenDeVenta(client);
                        }, function (resultado) {
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
                    _this_1.establecerListaDePreciosAClienteYProcesarlo(data.cliente);
                    break;
            }
        });
    };
    TareaDetalleControlador.prototype.actualizarTareaIdABorradorOrdeDeVenta = function (ordenesDeVentaDraft) {
        var _this_1 = this;
        try {
            for (var i = 0; i < ordenesDeVentaDraft.length; i++) {
                if (ordenesDeVentaDraft[i].taskId === 0) {
                    this.draftServicio.obtenerTaskIdParaBorradorDeOrdenDeVenta(ordenesDeVentaDraft[i], i, function (ordenDeVenta, indice) {
                        ordenesDeVentaDraft[indice] = ordenDeVenta;
                        if (ordenesDeVentaDraft[indice].taskId !== 0) {
                            _this_1.draftServicio.actualizarTareaIdParaBorradorDeOrdenDeVenta(ordenesDeVentaDraft[indice], function () {
                            }, function (resultado) {
                                notify(resultado.mensaje);
                            });
                        }
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
            }
        }
        catch (err) {
            notify("Erro al actualizar la tarea id para el borrador: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.desplegarDatosCliente = function (cliente) {
        var uiLblLimiteDeCredito = $("#UiLblLimiteDeCredito");
        var uiLblSaldoVencido = $("#UiLblSaldoVencido");
        var uiLblSaldoDisponibleTarea = $("#UiLblSaldoDisponibleTarea");
        var uiLblDiasDeCredito = $("#UiLblDiasDeCredito");
        var uiLblUltimaCompra = $("#UiLblUltimaCompra");
        var uiLblFechaUltimaCompra = $("#UiLblFechaUltimaCompra");
        var uiTxtTareaDesc = $("#UiTxtTareaDesc");
        var uiLblSaldoTareaFooter = $("#UiLblSaldoTareaFooter");
        var uiLblTotalSaldoTareaFooter = $("#UiLblTotalSaldoTareaFooter");
        var disponible = !cliente.cuentaCorriente.limiteDeCredito ||
            cliente.cuentaCorriente.limiteDeCredito <= 0
            ? 0
            : cliente.cuentaCorriente.limiteDeCredito - cliente.previousBalance;
        uiLblLimiteDeCredito.text("" + this.configuracionDecimales.currencySymbol + format_number(cliente.cuentaCorriente.limiteDeCredito, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblSaldoVencido.text("" + this.configuracionDecimales.currencySymbol + format_number(cliente.previousBalance, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblSaldoDisponibleTarea.text("" + this.configuracionDecimales.currencySymbol + format_number(disponible, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblDiasDeCredito.text(cliente.cuentaCorriente.diasCredito);
        if (cliente.lastPurchase && cliente.lastPurchase > 0) {
            uiLblFechaUltimaCompra.text("(" + cliente.lastPurchaseDate + ")");
        }
        else {
            uiLblFechaUltimaCompra.text("");
        }
        uiLblUltimaCompra.text("" + this.configuracionDecimales.currencySymbol + format_number(cliente.lastPurchase, this.configuracionDecimales.defaultDisplayDecimals));
        uiTxtTareaDesc.val("Tarea Generada para Cliente: " + cliente.clientName);
        uiLblSaldoTareaFooter.text(format_number(cliente.previousBalance, this.configuracionDecimales.defaultDisplayDecimals));
        uiLblTotalSaldoTareaFooter.text(format_number(disponible, this.configuracionDecimales.defaultDisplayDecimals));
    };
    TareaDetalleControlador.prototype.obtenerDatosDeTarea = function (callback) {
        var _this_1 = this;
        try {
            this.tarea.taskId = gtaskid;
            this.tarea.taskType = gTaskType;
            this.tarea.taskStatus = TareaEstado.Aceptada;
            this.tarea.taskIsFrom = gTaskIsFrom;
            this.tarea.salesOrderTotal = 0;
            if (gtaskid !== 0) {
                this.tareaServicio.obtenerTarea(this.tarea, function (tarea) {
                    var uiClienteName = $("#lblClientName_pickup");
                    uiClienteName.text(tarea.relatedClientName);
                    uiClienteName = null;
                    var uiAdrres = $("#lblAddress_pickup");
                    uiAdrres.text(tarea.taskAddress);
                    uiAdrres = null;
                    gtaskStatus = tarea.taskStatus;
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
            this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
                var cliente = new Cliente();
                cliente.clientId = gClientID;
                _this_1.configuracionDecimales = decimales;
                _this_1.clienteServicio.obtenerCliente(cliente, decimales, function (clienteFiltrado) {
                    _this_1.cliente = clienteFiltrado;
                    _this_1.comboServicio.obtenerCombosPorCliente(clienteFiltrado, function (clienteConCombos) {
                        _this_1.obtenerHistoricodePromo(function (listaDeHistoricoDePromos) {
                            _this_1.validarSiAplicaLasBonificacionesPorCombo(clienteFiltrado.bonoPorCombos, 0, listaDeHistoricoDePromos, function (listaDeBonificaciones) {
                                _this_1.cliente.bonoPorCombos = listaDeBonificaciones;
                                _this_1.cliente.cuentaCorriente = new CuentaCorriente();
                                _this_1.clienteServicio.obtenerCuentaCorriente(clienteConCombos, _this_1.configuracionDecimales, function (clienteConCuentaCorriente) {
                                    _this_1.cliente = clienteConCuentaCorriente;
                                    _this_1.desplegarDatosCliente(clienteConCuentaCorriente);
                                    _this_1.encuestaServicio.obtenerEncuestas(_this_1.cliente, function (encuestas) {
                                        _this_1.tarea.microsurveys = encuestas;
                                        callback();
                                    }, function (error) {
                                        notify(error.mensaje);
                                    });
                                }, function (resultado) {
                                    notify(resultado.mensaje);
                                });
                            }, function (operacion) {
                                notify(operacion.mensaje);
                            });
                        }, function (operacion) {
                            notify(operacion.mensaje);
                        });
                    }, function (operacion) {
                        notify(operacion.mensaje);
                    });
                }, function (operacion) {
                    notify(operacion.mensaje);
                });
            }, function (operacion) {
                notify(operacion.mensaje);
            });
        }
        catch (err) {
            notify("Error al cargar la tarea: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.limpiarCamposDetalleTarea = function () {
        try {
            var uiClienteName = $("#lblClientName_pickup");
            var uiClientAddress = $("#lblAddress_pickup");
            uiClienteName.text("");
            uiClientAddress.text("");
            uiClienteName = null;
            uiClientAddress = null;
        }
        catch (e) {
            notify("No se han podido limpiar los campos de detalle de la tarea actual debido a: " +
                e.message);
        }
    };
    TareaDetalleControlador.prototype.usuarioDeseaCargarTarea = function () {
        var _this_1 = this;
        try {
            this.obtenerDatosDeTarea(function () {
                _this_1.prosesarTipoTarea();
            });
        }
        catch (err) {
            notify("Error al cargar la tarea: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.usuarioDeseaAceptarLaTarea = function () {
        try {
            if (gIsOnline === EstaEnLinea.Si) {
                this.tareaServicio.enviarTareaAceptada(this.tarea, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
            this.prosesarTipoTarea();
        }
        catch (err) {
            notify(err.mensaje);
        }
    };
    TareaDetalleControlador.prototype.prosesarTipoTarea = function () {
        var _this_1 = this;
        try {
            this.limpiarVariablesGlobales();
            switch (this.tarea.taskType) {
                case TareaTipo.Entrega:
                    this.tareaServicio.actualizarTareaEstado(this.tarea, function () {
                        _this_1.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
                            var cliente = new Cliente();
                            cliente.clientId = gClientID;
                            _this_1.clienteServicio.obtenerCliente(cliente, decimales, function (clienteFiltrado) {
                                actualizarListadoDeTareas(_this_1.tarea.taskId, _this_1.tarea.taskType, _this_1.tarea.taskStatus, clienteFiltrado.clientId, clienteFiltrado.clientName, clienteFiltrado.address, 0, gtaskStatus, clienteFiltrado.rgaCode);
                                gotomyDelivery();
                            }, function (operacion) {
                                notify(operacion.mensaje);
                            });
                        }, function (operacion) {
                            notify(operacion.mensaje);
                        });
                    }, function (operacion) {
                        notify("Error al actualizar tarea: " + operacion.mensaje);
                    });
                    break;
                case TareaTipo.Preventa:
                    this.realizarCobroDeFacturasYProcesarTarea();
                    break;
                case TareaTipo.Borrador:
                    this.realizarCobroDeFacturasYProcesarTarea();
                    break;
                case TareaTipo.Venta:
                    EjecutarTareaDeVenta(gClientID);
                    break;
                case TareaTipo.Obsoleto:
                    EjecutarTareaDeVenta(gClientID);
                    break;
                case TareaTipo.TomaDeInventario:
                    this.publicarTareaDeTomaDeInventario(this.tarea);
                    this.tareaServicio.actualizarTareaEstado(this.tarea, function () {
                        var cliente = new Cliente();
                        cliente.clientId = gClientID;
                        _this_1.clienteServicio.obtenerCliente(cliente, _this_1.configuracionDecimales, function (cliente) {
                            actualizarListadoDeTareas(_this_1.tarea.taskId, _this_1.tarea.taskType, _this_1.tarea.taskStatus, cliente.clientId, cliente.clientName, cliente.address, 0, gtaskStatus, cliente.rgaCode);
                        }, function (resultado) {
                            my_dialog("", "", "closed");
                            notify(resultado.mensaje);
                        });
                    }, function (operacion) {
                        notify("Error al actualizar: " + operacion.mensaje);
                    });
                    my_dialog("", "", "closed");
                    this.mostrarPantallaDeTomaDeInventario();
                    break;
            }
        }
        catch (err) {
            notify(err.mensaje);
        }
    };
    TareaDetalleControlador.prototype.validarSiSeAplicaLaRegla = function (listDeRaglasAValidar) {
        if (listDeRaglasAValidar.length === 0) {
            return false;
        }
        else {
            switch (listDeRaglasAValidar[0].enabled.toUpperCase()) {
                case "SI":
                    return true;
                case "SÍ":
                    return true;
            }
        }
    };
    TareaDetalleControlador.prototype.ejecutarTareaDePreventa = function () {
        var este = this;
        var cliente = new Cliente();
        cliente.clientId = gClientID;
        este.clienteServicio.obtenerCliente(cliente, este.configuracionDecimales, function (clienteFiltrado) {
            este.comboServicio.obtenerCombosPorCliente(clienteFiltrado, function (clienteConCombos) {
                este.cliente = clienteConCombos;
                este.obtenerHistoricodePromo(function (listaHistoricoDePromos) {
                    este.validarSiAplicaLasBonificacionesPorCombo(este.cliente.bonoPorCombos, 0, listaHistoricoDePromos, function (listaDeBonificaciones) {
                        este.cliente.bonoPorCombos = listaDeBonificaciones;
                        este.tareaServicio.obtenerRegla("ValidarListaDePreciosConServidor", function (listaDeReglasValidarListaDePreciosConServidor) {
                            if (este.validarSiSeAplicaLaRegla(listaDeReglasValidarListaDePreciosConServidor)) {
                                if (este.cliente.priceListId === null ||
                                    este.cliente.priceListId === "") {
                                    este.establecerListaDePreciosAClienteYProcesarlo(este.cliente);
                                }
                                else {
                                    este.skuServicio.verificarCantidadDeSkusDisponiblesParaCliente(este.cliente, function (cantidadSkus, clienteVerificado) {
                                        este.cliente = clienteVerificado;
                                        if (cantidadSkus > 0) {
                                            este.procesarClienteParaOrdenDeVenta(clienteVerificado);
                                        }
                                        else {
                                            if (gIsOnline === 1) {
                                                tareaDetalleControlador = este;
                                                var data = {
                                                    loginid: gLastLogin,
                                                    dbuser: gdbuser,
                                                    dbuserpass: gdbuserpass,
                                                    cliente: clienteVerificado,
                                                    routeid: gCurrentRoute,
                                                    tarea: este.tarea
                                                };
                                                socketTareaDetalle.emit("GetPriceListBySkuUsingCustomerId", data);
                                                BloquearPantalla();
                                                interval = setInterval(function () {
                                                    ToastThis("Consultando Precios");
                                                    este.contadorDeIteraciones++;
                                                    if (este.contadorDeIteraciones >= 5) {
                                                        DesBloquearPantalla();
                                                        timerElapsed = true;
                                                        if (!emitCompleted) {
                                                            este.establecerListaDePreciosAClienteYProcesarlo(clienteVerificado);
                                                        }
                                                        clearInterval(interval);
                                                    }
                                                }, 1000);
                                            }
                                            else {
                                                if (clienteVerificado.priceListId !==
                                                    localStorage.getItem("gDefaultPriceList")) {
                                                    notify("No se encontró conexión al Servidor, la lista de precios a utilizar será la Lista por Defecto.");
                                                }
                                                este.establecerListaDePreciosAClienteYProcesarlo(clienteVerificado);
                                            }
                                        }
                                    }, function (resultado) {
                                        notify(resultado.mensaje);
                                        my_dialog("", "", "closed");
                                    });
                                }
                            }
                            else {
                                este.skuServicio.verificarCantidadDeSkusDisponiblesParaCliente(clienteConCombos, function (cantidadSkus, clienteVerificado) {
                                    if (cantidadSkus > 0) {
                                        este.procesarClienteParaOrdenDeVenta(clienteVerificado);
                                    }
                                    else {
                                        este.establecerListaDePreciosAClienteYProcesarlo(clienteVerificado);
                                    }
                                }, function (resultado) {
                                    notify(resultado.mensaje);
                                    my_dialog("", "", "closed");
                                });
                            }
                        }, function (resultado) {
                            notify(resultado.mensaje);
                            my_dialog("", "", "closed");
                        });
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }, function (operacion) {
                    notify(operacion.mensaje);
                });
            }, function (operacion) {
                notify(operacion.mensaje);
            });
        }, function (resultado) {
            my_dialog("", "", "closed");
            notify(resultado.mensaje);
        });
    };
    TareaDetalleControlador.prototype.publicarListaDeSkuOrdenDeVenta = function () {
        var listaDeSkuOrdenDeVenta = [];
        var msg = new ListaSkuMensaje(this);
        msg.listaSku = listaDeSkuOrdenDeVenta;
    };
    TareaDetalleControlador.prototype.publicarCombo = function () {
        var listaDeSkuParaBonificacionDeCombo = [];
        var msg = new ListaDeSkuParaBonificacionDeComboMensaje(this);
        msg.listaDeSkuParaBonificacionDeCombo = listaDeSkuParaBonificacionDeCombo;
        this.mensajero.publish(msg, getType(ListaDeSkuParaBonificacionDeComboMensaje));
    };
    TareaDetalleControlador.prototype.tipoDeTareaEntregado = function (mensaje, subscriber) {
        subscriber.usuarioDeseaCargarTarea();
    };
    TareaDetalleControlador.prototype.usuarioDeseaVerOpcionesDeTipoDeOrdenesDeVenta = function (callback) {
        try {
            if (this.tarea.hasDraft) {
                gSalesOrderType = this.tarea.salesOrderType;
                switch (gSalesOrderType) {
                    case OrdenDeVentaTipo.Contado:
                        ToastThis("Orden de Venta de Tipo: Contado");
                        break;
                    case OrdenDeVentaTipo.Credito:
                        ToastThis("Orden de Venta de Tipo: Credito");
                        break;
                }
                return callback();
            }
            var config = {
                title: "Tipo de Orden de Venta",
                items: [
                    { text: "Contado", value: OrdenDeVentaTipo.Contado },
                    { text: "Credito", value: OrdenDeVentaTipo.Credito }
                ],
                doneButtonLabel: "Ok",
                cancelButtonLabel: "Cancelar"
            };
            plugins.listpicker.showPicker(config, function (item) {
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
                    default:
                        InteraccionConUsuarioServicio.desbloquearPantalla();
                        break;
                }
            }, function (error) {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                if (error != "Error") {
                    notify(error);
                }
            });
        }
        catch (err) {
            notify("Error al cargar los Tipos de Orden de Venta: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.seguirOrdenDeVenta = function (cliente) {
        var _this_1 = this;
        try {
            var procesarOrdenDeVentaDeCliente = function () {
                _this_1.verificarSiDebeModificarCliente(function (debeValidarCliente) {
                    if (debeValidarCliente &&
                        _this_1.tarea.taskType === TareaTipo.Preventa &&
                        gTaskIsFrom === TareaEstado.Asignada) {
                        cliente.origen = "TareaDetalleControlador";
                        cliente.estaEnModificacionObligatoria = true;
                        _this_1.cliente = cliente;
                        if (_this_1.pregutarTipoOrdenDeVenta === 1) {
                            _this_1.usuarioDeseaVerOpcionesDeTipoDeOrdenesDeVenta(function () {
                                _this_1.mostrarPantallaDeModificacionDeCliente();
                                my_dialog("", "", "closed");
                            });
                        }
                        else {
                            _this_1.mostrarPantallaDeModificacionDeCliente();
                            my_dialog("", "", "closed");
                        }
                    }
                    else {
                        _this_1.cliente.estaEnModificacionObligatoria = false;
                        _this_1.tareaServicio.actualizarTareaEstado(_this_1.tarea, function () {
                            actualizarListadoDeTareas(_this_1.tarea.taskId, _this_1.tarea.taskType, _this_1.tarea.taskStatus, cliente.clientId, cliente.clientName, cliente.address, 0, gtaskStatus, _this_1.cliente.rgaCode);
                            if (_this_1.pregutarTipoOrdenDeVenta === 1) {
                                _this_1.usuarioDeseaVerOpcionesDeTipoDeOrdenesDeVenta(function () {
                                    if (_this_1.tarea.hasDraft) {
                                        _this_1.motrarPantallaOrdenDeVenta();
                                    }
                                    else {
                                        _this_1.mostrarPantallaDeListadoDeSkus();
                                    }
                                });
                            }
                            else {
                                if (_this_1.tarea.hasDraft) {
                                    _this_1.motrarPantallaOrdenDeVenta();
                                }
                                else {
                                    _this_1.mostrarPantallaDeListadoDeSkus();
                                }
                            }
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    }
                }, function (error) {
                    notify(error.mensaje);
                });
            };
            var encuestasAEjecutarEnInicioDeTarea = this.encuestaServicio.filtrarEncuestasPorDisparador(this.tarea.microsurveys, DisparadorDeEncuesta.InicioDeTarea);
            if (encuestasAEjecutarEnInicioDeTarea &&
                encuestasAEjecutarEnInicioDeTarea.length > 0) {
                BloquearPantalla();
                this.encuestaServicio.procesarEncuestasDeCliente(encuestasAEjecutarEnInicioDeTarea, 0, this.tarea.hasDraft, procesarOrdenDeVentaDeCliente, function (error) {
                    notify(error.mensaje);
                });
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
                procesarOrdenDeVentaDeCliente();
            }
        }
        catch (err) {
            notify("Error al seguir orden de venta: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.motrarPantallaOrdenDeVenta = function () {
        try {
            $.mobile.changePage("pos_skus_page", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false,
                data: {
                    cliente: this.cliente,
                    tarea: this.tarea,
                    configuracionDecimales: this.configuracionDecimales,
                    esPrimeraVez: true
                }
            });
            my_dialog("", "", "closed");
        }
        catch (err) {
            notify("Error al seguir orden de venta: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.mostrarPantallaDeListadoDeSkus = function () {
        try {
            $.mobile.changePage("skus_list_page", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false,
                data: {
                    cliente: this.cliente,
                    tarea: this.tarea,
                    configuracionDecimales: this.configuracionDecimales,
                    listaSku: new Array(),
                    esPrimeraVez: true,
                    listaDeSkuOrdenDeVenta: new Array()
                }
            });
            my_dialog("", "", "closed");
        }
        catch (err) {
            notify("Error al mostrar el listado de SKU's debido a: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.irDirectoAOrdenDeVenta = function (cliente, lstSku) {
        var _this_1 = this;
        if (this.tarea.taskType === TareaTipo.Preventa) {
            this.obtenerOrdenDeVenta(cliente, function (cliente, ordenDeVenta, publicarOrdenDeVenta) {
                cliente.fotoDeInicioDeVisita = ordenDeVenta.image3;
                if (_this_1.tarea.taskId !== 0) {
                    _this_1.publicarListaDeSkuOrdenDeVenta();
                }
                if (publicarOrdenDeVenta) {
                    _this_1.tarea.hasDraft = true;
                    _this_1.publicarOrdenDeVentaDraf(ordenDeVenta);
                }
                else {
                    _this_1.tarea.hasDraft = false;
                }
                _this_1.seguirOrdenDeVenta(cliente);
            });
        }
        else {
            if (this.tarea.taskId !== 0) {
                this.publicarListaDeSkuOrdenDeVenta();
            }
            this.seguirOrdenDeVenta(cliente);
        }
    };
    TareaDetalleControlador.prototype.irAOrdenDeVentaValidandoCuentaCorriente = function (cliente, lstSku) {
        var _this_1 = this;
        this.clienteServicio.validarDatosGeneralesCuentaCorriente(cliente, function (cliente) {
            _this_1.tareaServicio.obtenerRegla("ValidarConServidorAntiguedadDeSaldos", function (listaDeReglasValidarConServidorAntiguedadDeSaldos) {
                if (gIsOnline === EstaEnLinea.No ||
                    (listaDeReglasValidarConServidorAntiguedadDeSaldos.length === 0 ||
                        listaDeReglasValidarConServidorAntiguedadDeSaldos[0].enabled.toUpperCase() ===
                            "NO")) {
                    _this_1.clienteServicio.validarCuentaCorriente(cliente, lstSku, gSalesOrderType, _this_1.configuracionDecimales, function (cliente) {
                        if (_this_1.tarea.taskType === TareaTipo.Preventa) {
                            _this_1.obtenerOrdenDeVenta(cliente, function (cliente, ordenDeVenta, publicarOrdenDeVenta) {
                                if (_this_1.tarea.taskId !== 0) {
                                    _this_1.publicarListaDeSkuOrdenDeVenta();
                                }
                                if (publicarOrdenDeVenta) {
                                    _this_1.tarea.hasDraft = true;
                                    _this_1.publicarOrdenDeVentaDraf(ordenDeVenta);
                                }
                                else {
                                    _this_1.tarea.hasDraft = false;
                                }
                                _this_1.seguirOrdenDeVenta(cliente);
                            });
                        }
                        else {
                            if (_this_1.tarea.taskId !== 0) {
                                _this_1.publicarListaDeSkuOrdenDeVenta();
                            }
                            _this_1.seguirOrdenDeVenta(cliente);
                        }
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
                else {
                    _this_1.clienteServicio.enviarSolicitudParaObtenerCuentaCorriente(socketTareaDetalle, cliente, OpcionValidarSaldoCliente.EjecutarTarea, gSalesOrderType, function (cliente) {
                        _this_1.cliente = cliente;
                        if (_this_1.tarea.taskType === TareaTipo.Preventa) {
                            _this_1.obtenerOrdenDeVenta(cliente, function (cliente, ordenDeVenta, publicarOrdenDeVenta) {
                                if (_this_1.tarea.taskId !== 0) {
                                    _this_1.publicarListaDeSkuOrdenDeVenta();
                                }
                                if (publicarOrdenDeVenta) {
                                    _this_1.publicarOrdenDeVentaDraf(ordenDeVenta);
                                }
                            });
                        }
                        else {
                            if (_this_1.tarea.taskId !== 0) {
                                _this_1.publicarListaDeSkuOrdenDeVenta();
                            }
                        }
                    }, function (resultado) {
                        notify(resultado.mensaje);
                        my_dialog("", "", "closed");
                    });
                }
            }, function (resultado) {
                notify(resultado.mensaje);
                my_dialog("", "", "closed");
            });
        }, function (resultado) {
            notify(resultado.mensaje);
            my_dialog("", "", "closed");
        });
    };
    TareaDetalleControlador.prototype.publicarOrdenDeVentaDraf = function (ordenDeVenta) {
        var msg = new OrdenDeVentaDraftMensaje(this);
        msg.ordenDeVenta = ordenDeVenta;
        this.mensajero.publish(msg, getType(OrdenDeVentaDraftMensaje));
    };
    TareaDetalleControlador.prototype.obtenerOrdenDeVenta = function (cliente, callback) {
        var _this_1 = this;
        try {
            this.ordenDeVentaServicio.obtenerOrdenDeVentaPorTarea(this.tarea, this.configuracionDecimales, function (ordenDeVenta) {
                if (ordenDeVenta.ordenDeVentaDetalle.length >= 1) {
                    if (ordenDeVenta.isDraft === 1) {
                        cliente.deliveryDate = ordenDeVenta.deliveryDate;
                        cliente.totalAmout = ordenDeVenta.totalAmount;
                        _this_1.tarea.salesOrderType = ordenDeVenta.salesOrderType;
                        callback(cliente, ordenDeVenta, true);
                    }
                    else {
                        callback(cliente, ordenDeVenta, false);
                    }
                }
                else {
                    callback(cliente, ordenDeVenta, false);
                }
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al obtener orden de venta: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.obtenerConfiguracionDeDecimales = function (callback, errCallback) {
        var _this_1 = this;
        this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this_1.configuracionDecimales = decimales;
            callback();
        }, function (operacion) {
            errCallback(operacion);
        });
    };
    TareaDetalleControlador.prototype.publicarTareaDeTomaDeInventario = function (tarea) {
        var msg = new TareaMensaje(this);
        msg.tarea = tarea;
        this.mensajero.publish(msg, getType(TareaMensaje));
    };
    TareaDetalleControlador.prototype.mostrarPantallaDeTomaDeInventario = function () {
        try {
            $.mobile.changePage("#UiPageTakeInventory", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false
            });
        }
        catch (err) {
            notify("Error al seguir toma de inventario: " + err.message);
        }
    };
    TareaDetalleControlador.prototype.usuarioDeseaModifcarCliente = function () {
        this.cliente.origen = "TareaDetalleControlador";
        this.mostrarPantallaDeModificacionDeCliente();
    };
    TareaDetalleControlador.prototype.procesarClienteParaOrdenDeVenta = function (cliente) {
        var _this_1 = this;
        this.cliente = cliente;
        var sku = new Sku();
        sku.sku = "";
        sku.onHand = 0;
        var lstSku = [];
        this.clienteServicio.obtenerCuentaCorriente(cliente, tareaDetalleControlador.configuracionDecimales, function (cliente) {
            _this_1.tareaServicio.obtenerRegla("tipoOrdenDeVenta", function (listaDeReglasTipoOrdenDeVenta) {
                _this_1.tareaServicio.obtenerRegla("AplicarReglasComerciales", function (listaDeReglasAplicarReglasComerciales) {
                    if (listaDeReglasAplicarReglasComerciales.length > 0 &&
                        listaDeReglasAplicarReglasComerciales[0].enabled === "Si") {
                        my_dialog("Validando crédito y saldo", "Espere...", "open");
                        _this_1.tareaServicio.obtenerRegla("NoValidarAntiguedadDeSaldos", function (listaDeReglasValidarAntiguedadDeSaldos) {
                            if ((listaDeReglasValidarAntiguedadDeSaldos.length > 0 &&
                                listaDeReglasValidarAntiguedadDeSaldos[0].enabled ===
                                    "Si") ||
                                listaDeReglasValidarAntiguedadDeSaldos[0].enabled ===
                                    "SI") {
                                gSalesOrderType = OrdenDeVentaTipo.Contado;
                                _this_1.pregutarTipoOrdenDeVenta = 0;
                                _this_1.irDirectoAOrdenDeVenta(cliente, lstSku);
                            }
                            else {
                                _this_1.tareaServicio.obtenerRegla("LimiteDeCreditoCero", function (listaDeReglasLimiteDeCredito) {
                                    if (listaDeReglasLimiteDeCredito.length >= 1 &&
                                        listaDeReglasTipoOrdenDeVenta.length >= 1) {
                                        if (cliente.cuentaCorriente.limiteDeCredito === 0) {
                                            notify("Creando Orden de Venta de Tipo Contado");
                                            gSalesOrderType = OrdenDeVentaTipo.Contado;
                                            _this_1.pregutarTipoOrdenDeVenta = 0;
                                            _this_1.irDirectoAOrdenDeVenta(cliente, lstSku);
                                        }
                                        else {
                                            gSalesOrderType = OrdenDeVentaTipo.Credito;
                                            _this_1.pregutarTipoOrdenDeVenta = 1;
                                            _this_1.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                        }
                                    }
                                    else if (listaDeReglasLimiteDeCredito.length >= 1 &&
                                        listaDeReglasTipoOrdenDeVenta.length === 0) {
                                        if (cliente.cuentaCorriente.limiteDeCredito === 0) {
                                            notify("Creando Orden de Venta de Tipo Contado");
                                            gSalesOrderType = OrdenDeVentaTipo.Contado;
                                            _this_1.pregutarTipoOrdenDeVenta = 0;
                                            _this_1.irDirectoAOrdenDeVenta(cliente, lstSku);
                                        }
                                        else {
                                            gSalesOrderType = OrdenDeVentaTipo.Credito;
                                            _this_1.pregutarTipoOrdenDeVenta = 0;
                                            _this_1.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                        }
                                    }
                                    else if (listaDeReglasLimiteDeCredito.length === 0 &&
                                        listaDeReglasTipoOrdenDeVenta.length >= 1) {
                                        gSalesOrderType = OrdenDeVentaTipo.Credito;
                                        _this_1.pregutarTipoOrdenDeVenta = 1;
                                        _this_1.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                    }
                                    else {
                                        gSalesOrderType = OrdenDeVentaTipo.Credito;
                                        _this_1.pregutarTipoOrdenDeVenta = 0;
                                        _this_1.irAOrdenDeVentaValidandoCuentaCorriente(cliente, lstSku);
                                    }
                                }, function (resultado) {
                                    notify(resultado.mensaje);
                                    my_dialog("", "", "closed");
                                });
                            }
                        }, function (resultado) {
                            notify(resultado.mensaje);
                            my_dialog("", "", "closed");
                        });
                    }
                    else {
                        gSalesOrderType = OrdenDeVentaTipo.Credito;
                        if (listaDeReglasTipoOrdenDeVenta.length > 0 &&
                            listaDeReglasTipoOrdenDeVenta[0].enabled === "Si") {
                            _this_1.pregutarTipoOrdenDeVenta = 1;
                        }
                        else {
                            _this_1.pregutarTipoOrdenDeVenta = 0;
                        }
                        _this_1.irDirectoAOrdenDeVenta(cliente, lstSku);
                    }
                }, function (resultado) {
                    notify(resultado.mensaje);
                    my_dialog("", "", "closed");
                });
            }, function (resultado) {
                notify(resultado.mensaje);
                my_dialog("", "", "closed");
            });
        }, function (resultado) {
            notify(resultado.mensaje);
            my_dialog("", "", "closed");
        });
    };
    TareaDetalleControlador.prototype.establecerListaDePreciosAClienteYProcesarlo = function (cliente) {
        var este = this;
        este.cliente.priceListId = localStorage.getItem("gDefaultPriceList");
        este.procesarClienteParaOrdenDeVenta(este.cliente);
        my_dialog("", "", "closed");
    };
    TareaDetalleControlador.prototype.limpiarVariablesGlobales = function () {
        timerElapsed = false;
        emitCompleted = false;
        interval = 0;
    };
    TareaDetalleControlador.prototype.verificarSiDebeModificarCliente = function (callBack, errorCallBack) {
        var op;
        try {
            ObtenerReglas("ModificarDatosDeCliente", function (reglas) {
                if (reglas.rows.length > 0) {
                    var regla = reglas.rows.item(0);
                    if (regla.ENABLED === "SI" || regla.ENABLED === "Si") {
                        callBack(true);
                        regla = null;
                    }
                    else {
                        callBack(false);
                        regla = null;
                    }
                }
                else {
                    callBack(false);
                }
            }, function (error) {
                op = new Operacion();
                op.codigo = -1;
                op.mensaje = error;
                op.resultado = ResultadoOperacionTipo.Error;
                errorCallBack(op);
                op = null;
            });
        }
        catch (e) {
            op = new Operacion();
            op.codigo = -1;
            op.mensaje = e.message;
            op.resultado = ResultadoOperacionTipo.Error;
            errorCallBack(op);
            op = null;
        }
    };
    TareaDetalleControlador.prototype.mostrarPantallaDeModificacionDeCliente = function () {
        $.mobile.changePage("UiPageCustomerInfo", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false,
            data: {
                cliente: this.cliente,
                tarea: this.tarea,
                configuracionDecimales: this.configuracionDecimales,
                esPrimeraVez: true
            }
        });
    };
    TareaDetalleControlador.prototype.validarSiAplicaLasBonificacionesPorCombo = function (listaDeBonificaciones, indiceDeListaDeBonificacion, listaHistoricoDePromos, callBack, errCallback) {
        var _this_1 = this;
        try {
            if (listaHistoricoDePromos.length > 0) {
                if (listaDeBonificaciones.length > 0 &&
                    listaDeBonificaciones.length > indiceDeListaDeBonificacion) {
                    var bonificacionAValidar_1 = listaDeBonificaciones[indiceDeListaDeBonificacion];
                    var resultadoDePromoHistorico_1 = listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === bonificacionAValidar_1.promoId;
                    });
                    if (resultadoDePromoHistorico_1) {
                        var promoDeBonificacion = new Promo();
                        promoDeBonificacion.promoId = bonificacionAValidar_1.promoId;
                        promoDeBonificacion.promoName = bonificacionAValidar_1.promoName;
                        promoDeBonificacion.frequency = bonificacionAValidar_1.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico_1, function (aplicaPromo) {
                            if (!aplicaPromo) {
                                listaDeBonificaciones = listaDeBonificaciones.filter(function (bonificacion) {
                                    return (resultadoDePromoHistorico_1.promoId !==
                                        bonificacion.promoId);
                                });
                            }
                            _this_1.validarSiAplicaLasBonificacionesPorCombo(listaDeBonificaciones, indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0), listaHistoricoDePromos, function (listaDeBonificaciones) {
                                callBack(listaDeBonificaciones);
                            }, function (resultado) {
                                errCallback(resultado);
                            });
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                        promoDeBonificacion = null;
                    }
                    else {
                        this.validarSiAplicaLasBonificacionesPorCombo(listaDeBonificaciones, indiceDeListaDeBonificacion + 1, listaHistoricoDePromos, function (listaDeDescuento) {
                            callBack(listaDeDescuento);
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                    }
                }
                else {
                    callBack(listaDeBonificaciones);
                }
            }
            else {
                callBack(listaDeBonificaciones);
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar la si aplica la bonificacion por combo: " + ex.message
            });
        }
    };
    TareaDetalleControlador.prototype.obtenerHistoricodePromo = function (callBack, errCallback) {
        try {
            this.promoServicio.obtenerHistoricoDePromosParaCliente(this.cliente, function (listaHistoricoDePromos) {
                callBack(listaHistoricoDePromos);
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener historico de promociones: " + ex.message
            });
        }
    };
    TareaDetalleControlador.prototype.usuarioDeseaVerPromocionesDisponibles = function () {
        try {
            var _this = this;
            $.mobile.changePage("PantallaDePromociones", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false,
                data: {
                    cliente: _this.cliente,
                    configuracionDecimales: _this.configuracionDecimales
                }
            });
        }
        catch (err) {
            notify("Error al mostrar las promos: " + err.message);
            my_dialog("", "", "closed");
        }
    };
    TareaDetalleControlador.prototype.realizarCobroDeFacturas = function (tipoDePagoDeFactura, callback) {
        var _this_1 = this;
        var este = this;
        try {
            este.debeCobrarFacturasVencidas(tipoDePagoDeFactura === TipoDePagoDeFactura.FacturaVencida
                ? ReglaTipo.CobroDeFacturaVencida.toString()
                : ReglaTipo.NoVenderAlContadoConLimiteExcedido.toString(), function (debeCobrarFacturas) {
                este.visualizaListadoDeFacturasAbiertasOVencidas(function (visualizaFacturasAbiertasOVencidas) {
                    if (debeCobrarFacturas || visualizaFacturasAbiertasOVencidas) {
                        este.obtenerFacturasVencidas(tipoDePagoDeFactura, function (facturasVencidas) {
                            if (!_this_1.cuentaCorrienteServicio.clienteTieneFacturasAbiertasOVencidas(facturasVencidas)) {
                                return callback();
                            }
                            var actualizacionDeInformacionDePagoDeFacturasVencidasMensaje = new ActualizacionDeInformacionDePagoDeFacturasVencidasMensaje(este);
                            actualizacionDeInformacionDePagoDeFacturasVencidasMensaje.montoCubiertoPorUltimoPagoProcesado = 0;
                            este.mensajero.publish(actualizacionDeInformacionDePagoDeFacturasVencidasMensaje, getType(ActualizacionDeInformacionDePagoDeFacturasVencidasMensaje));
                            var mensajeClientePagoDeFacturasVencidas = new ClienteMensaje(este);
                            mensajeClientePagoDeFacturasVencidas.cliente = este.cliente;
                            mensajeClientePagoDeFacturasVencidas.vistaCargandosePorPrimeraVez = true;
                            mensajeClientePagoDeFacturasVencidas.tipoDePagoAProcesar = tipoDePagoDeFactura;
                            mensajeClientePagoDeFacturasVencidas.funcionDeRetornoAPocesoPrincipal = callback;
                            mensajeClientePagoDeFacturasVencidas.permitirSoloVisualizacionDeFacturasVencidasOAbiertas =
                                visualizaFacturasAbiertasOVencidas &&
                                    debeCobrarFacturas === false;
                            este.mensajero.publish(mensajeClientePagoDeFacturasVencidas, getType(ClienteMensaje));
                            $.mobile.changePage("#UiOverdueInvoicePaymentPage", {
                                transition: "flip",
                                reverse: false,
                                showLoadMsg: false
                            });
                        });
                    }
                    else {
                        callback();
                    }
                });
            });
        }
        catch (error) {
            notify("Error al intentar cobrar facturas vencidas debido a: " + error.message);
        }
    };
    TareaDetalleControlador.prototype.debeCobrarFacturasVencidas = function (reglaTipoDeFactura, callBack) {
        ObtenerReglas(reglaTipoDeFactura, function (reglas) {
            callBack(reglas.rows.length > 0 &&
                reglas.rows.item(0).ENABLED.toUpperCase() === "SI");
        }, function (error) {
            notify(error);
        });
    };
    TareaDetalleControlador.prototype.visualizaListadoDeFacturasAbiertasOVencidas = function (callBack) {
        ObtenerReglas(ReglaTipo.VisualizarFacturasAbiertasOVencidas.toString(), function (reglas) {
            callBack(reglas.rows.length > 0 &&
                reglas.rows.item(0).ENABLED.toUpperCase() === "SI");
        }, function (error) {
            notify(error);
        });
    };
    TareaDetalleControlador.prototype.obtenerFacturasVencidas = function (tipoDePagoDeFactura, callback) {
        var cliente = new Cliente();
        cliente.clientId = this.cliente.clientId;
        cliente.paymentType = tipoDePagoDeFactura;
        this.cuentaCorrienteServicio.obtenerFacturasVencidasDeCliente(cliente, function (facturasVencidas) {
            callback(facturasVencidas);
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    TareaDetalleControlador.prototype.realizarCobroDeFacturasYProcesarTarea = function () {
        var este = this;
        este.realizarCobroDeFacturas(TipoDePagoDeFactura.FacturaVencida, function () {
            este.ejecutarTareaDePreventa();
        });
    };
    return TareaDetalleControlador;
}());
//# sourceMappingURL=TareaDetalleControlador.js.map