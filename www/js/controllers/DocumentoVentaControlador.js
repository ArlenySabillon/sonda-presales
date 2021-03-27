var DocumentoVentaControlador = (function () {
    function DocumentoVentaControlador(mensajero) {
        this.mensajero = mensajero;
        this.clienteServicio = new ClienteServicio();
        this.tareaServicio = new TareaServcio();
        this.ordenDeVentaServicio = new OrdenDeVentaServicio();
        this.configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.razonServicio = new RazonServicio();
        this.encuestaServicio = new EncuestaServicio();
        this.listaDeSkuOrdenDeVenta = [];
        this.seCargoDatosDraft = false;
        this.bonoServicio = new BonoServicio();
        this.listaDeSkuParaBonificacion = Array();
        this.descuentoServicio = new DescuentoServicio();
        this.permiterRegregarPantallaAnterior = true;
        this.esPrimerMensajeDeDescuento = true;
        this.listaDeSkuParaBonificacionDeCombo = Array();
        this.descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
        this.usuarioPuedeModificarDescuento = false;
        this.usuarioYaColocoDescuento = false;
        this.usuarioPuedeModificarBonificacionDeCombo = false;
        this.esPrimeraVez = true;
        this.listaDeBonificacionesPorMontoGeneral = new Array();
        this.promoServicio = new PromoServicio();
        this.listaDeDescuentoPorMontoGeneralYFamilia = [];
        this.listaDeDescuentoPorFamiliaYTipoPago = [];
        this.listaHistoricoDePromos = [];
        this.listaDeOrdenAplicarDescuentos = [];
        this.aplicaReglaDeValidacionDeLimiteDeCredito = false;
        this.obtenerConfiguracionDeDecimales();
        this.tokenSocketIo = mensajero.subscribe(this.socketIoEntregado, getType(SocketIoMensaje), this);
        this.tokenCliente = mensajero.subscribe(this.clienteEntregado, getType(ClienteMensaje), this);
        this.tokenListaSku = mensajero.subscribe(this.listaSkuEntregado, getType(ListaSkuMensaje), this);
        this.tokenOrdeDeVentaDraft = mensajero.subscribe(this.ordenDeVentaDraftEntregado, getType(OrdenDeVentaDraftMensaje), this);
        this.tokenlistaDeSkuParaBonificacionDeCombo = mensajero.subscribe(this.listaDeSkuParaBonificacionDeComboEntregado, getType(BonoPorComboMensaje), this);
        this.tokenListaDeSkuParaBonificacionDeComboInicioDeVenta = mensajero.subscribe(this.listaDeSkuParaBonificacionDeComboInicioDeVentaEntregado, getType(ListaDeSkuParaBonificacionDeComboMensaje), this);
    }
    DocumentoVentaControlador.prototype.delegarDocumentoControlador = function () {
        var _this_1 = this;
        var este = this;
        document.addEventListener("backbutton", function () {
            este.usuarioDeseaRegresarAPaginaAnterior();
        }, true);
        document.addEventListener("menubutton", function () {
            este.usuarioDeseaVerListaSku();
        }, true);
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "pos_skus_page") {
                este.cliente = data.options.data.cliente;
                este.tarea = data.options.data.tarea;
                este.configuracionDecimales = data.options.data.configuracionDecimales;
                este.esPrimeraVez = data.options.data.esPrimeraVez;
                este.limpiarListas(este, function () {
                    este.cargarPantalla(este);
                    $.mobile.changePage("#pos_skus_page");
                });
            }
            if (data.toPage === "skus_list_page") {
                este.cliente = data.options.data.cliente;
                este.tarea = data.options.data.tarea;
                este.configuracionDecimales = data.options.data.configuracionDecimales;
                este.esPrimeraVez = data.options.data.esPrimeraVez;
            }
        });
        $("#pos_skus_page").on("pageshow", function () {
            este.bonoServicio.validarSiModificaBonificacionPorCombo(function (puedeModificar) {
                este.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
                este.esPrimerMensajeDeDescuento = true;
                este.validarFotoYTareaSinGestion(este);
                este.establecerTotalOrdenDeVenta(este);
                este.prepararReglaDeValidacionDeLimiteDeCredito();
            }, function (resultado) {
                este.usuarioPuedeModificarBonificacionDeCombo = false;
                notify("Error al validar si puede modificar la bonificacion por combo: " +
                    resultado.mensaje);
            });
        });
        $("#uiShowMenuPosSkuPage").bind("touchstart", function () {
            este.publicarDatos();
            este.mostrorPantallaListaSku();
        });
        $("#pos_skus_page").on("click", "#pos_skus_page_listview li", function (event) {
            var esCombo = event.currentTarget.attributes["esCombo"]
                .nodeValue;
            if (esCombo === "1") {
                _this_1.limpiarListaDeSku(function () {
                    var id = event.currentTarget.attributes["id"].nodeValue;
                    este.obtenerCombo(parseInt(id));
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
        });
        $("#pos_skus_page").on("click", "#pos_skus_page_listview a", function (event) {
            var id = event.currentTarget.attributes["id"].nodeValue;
            if (id !== "") {
                var propiedades = id.split("|");
                if (OpcionEnListadoDePedido.Modificar.toString() === propiedades[0]) {
                    este.obtenerSku(propiedades[1], propiedades[2]);
                }
                else {
                    este.esPrimerMensajeDeDescuento = true;
                    este.usuarioDeseaEliminarSku(propiedades[1], propiedades[2]);
                }
            }
        });
        $("#UiBotonCalularDescuento").bind("touchstart", function () {
            este.esPrimerMensajeDeDescuento = true;
            este.usuarioDeseaCalcularDescuento(este);
        });
        $("#panelTotalSKU").bind("touchstart", function () {
            este.usuarioDeseaFinalizarOrdenDeVenta();
        });
        $("#UiBotonGuardarVentaDraft").bind("touchstart", function () {
            este.usuarioDeseaGuardarDraft();
        });
        $("#UiBotonCancelarVentaDraft").bind("touchstart", function () {
            este.usuarioDeseaCancelarDraft();
        });
        $("#uiBtnInfoOrdenDeVenta").bind("touchstart", function () {
            este.usuarioDeseaVerInformacionDeOrdenDeVenta();
        });
        $("#uiAceptarCambiosInfoOrdenDeVenta").bind("touchstart", function () {
            este.usuarioDeseaRetornarAOrdenDeVenta();
        });
        $("#UiBotonCambiosEnCliente").bind("touchstart", function () {
            este.usuarioDeseaModificarCliente();
        });
        $("#UiComentarioDeOrdenDeVenta").keyup(function () {
            este.mostrarCaracteresRestantes();
        });
        $("#uiBotonListadoDeSkus").bind("touchstart", function () {
            este.usuarioDeseaVerlistadoDeSkus();
        });
    };
    DocumentoVentaControlador.prototype.limpiarListaDeSku = function (callback, errCallback) {
        try {
            var skulist = $("#pos_skus_page_listview");
            skulist.children().remove("li");
            skulist = null;
            callback();
        }
        catch (err) {
            errCallback({
                codigo: -1,
                mensaje: "Error al limpiar el listado de sku " + err.mensaje
            });
        }
    };
    DocumentoVentaControlador.prototype.delegarSockets = function () {
        var _this_1 = this;
        this.socketIo.on("GetCurrentAccountByCustomer_Request", function (data) {
            switch (data.option) {
                case OpcionRespuesta.Exito:
                    my_dialog("", "", "close");
                    console.log("Validando Saldo desde: " + data.source);
                    switch (data.source) {
                        case OpcionValidarSaldoCliente.FinalizarDocumento:
                            if (gTaskType === TareaTipo.Preventa) {
                                if ($("#FechaEntrega").val() === "" ||
                                    !ValidarFechaDeEntrega(ObtenerFecha(), $("#FechaEntrega").val())) {
                                    notify("ERROR, Tiene que indicar una fecha correcta.");
                                    return;
                                }
                            }
                            _this_1.finalizarOrdenDeVenta();
                            _this_1.limpiarComentario();
                            break;
                    }
                    break;
                case OpcionRespuesta.Error:
                    my_dialog("", "", "close");
                    notify("Error al validar saldo del cliente: " + data.message);
                    console.log("Error al validar saldo del cliente: " + data.message);
                    break;
                case OpcionRespuesta.Recibido:
                    console.log("Validando saldo del cliente");
                    break;
            }
        });
    };
    DocumentoVentaControlador.prototype.socketIoEntregado = function (mensaje, subscriber) {
        subscriber.socketIo = mensaje.socket;
        subscriber.delegarSockets();
    };
    DocumentoVentaControlador.prototype.usuarioDeseaVerlistadoDeSkus = function () {
        var _this_1 = this;
        this.limpiarListaDeSku(function () {
            my_dialog("Preparando Sku", "Espere...", "open");
            _this_1.publicarDatos();
            _this_1.mostrorPantallaListaSku();
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    DocumentoVentaControlador.prototype.usuarioDeseaVerListaSku = function () {
        switch ($.mobile.activePage[0].id) {
            case "pos_skus_page":
                my_dialog("Preparando Sku", "Espere...", "open");
                this.publicarDatos();
                this.mostrorPantallaListaSku();
                break;
        }
    };
    DocumentoVentaControlador.prototype.usuarioDeseaRegresarAPaginaAnterior = function () {
        var _this_1 = this;
        switch ($.mobile.activePage[0].id) {
            case "pos_skus_page":
                this.validarFecha(function () {
                    if (_this_1.permiterRegregarPantallaAnterior) {
                        _this_1.finalizarTareaSinGestion(function () { });
                    }
                });
                break;
            case "pos_skus_inofrmation_page":
                this.usuarioDeseaRetornarAOrdenDeVenta();
                break;
        }
    };
    DocumentoVentaControlador.prototype.obtenerFechaFormato = function (fecha, agregarDia) {
        var date = new Date(fecha);
        var anio = date.getFullYear().toString();
        var mes = (date.getMonth() + 1).toString();
        var dia = (date.getDate() + (agregarDia ? 1 : 0)).toString();
        var resultado = anio +
            "/" +
            (mes[1] ? mes : "0" + mes[0]) +
            "/" +
            (dia[1] ? dia : "0" + dia[0]);
        return resultado;
    };
    DocumentoVentaControlador.prototype.usuarioDeseaFinalizarOrdenDeVenta = function () {
        var _this_1 = this;
        try {
            if (this.cliente.totalAmout <= 0) {
                this.finalizarTareaSinGestion(function () { });
            }
            else {
                if (this.cliente.cuentaCorriente.limiteDeCredito > 0 &&
                    this.aplicaReglaDeValidacionDeLimiteDeCredito) {
                    var totalDeVenta = this.obtenerTotalDeOrdenDeVenta(this.cliente.appliedDiscount, this.listaDeSkuOrdenDeVenta);
                    if (this.cliente.outStandingBalance < totalDeVenta) {
                        notify("ERROR, No tiene credito sufiente para esta venta, disponible: " +
                            DarFormatoAlMonto(format_number(this.cliente.outStandingBalance, this.configuracionDecimales.defaultDisplayDecimals)));
                        return;
                    }
                }
                this.validarConfiguracionDeBonificacionPorCombos(function () {
                    var uiComentarioDeOrdenDeVenta = $("#UiComentarioDeOrdenDeVenta");
                    _this_1.cliente.salesComment = uiComentarioDeOrdenDeVenta.val();
                    uiComentarioDeOrdenDeVenta = null;
                    _this_1.esPrimerMensajeDeDescuento = true;
                    _this_1.calcularDescuento(_this_1, function () {
                        _this_1.tareaServicio.obtenerRegla("AplicarReglasComerciales", function (listaDeReglasAplicarReglasComerciales) {
                            if (listaDeReglasAplicarReglasComerciales.length > 0 &&
                                listaDeReglasAplicarReglasComerciales[0].enabled.toUpperCase() ===
                                    "SI") {
                                _this_1.tareaServicio.obtenerRegla("ValidarConServidorAntiguedadDeSaldos", function (listaDeReglasValidarConServidorAntiguedadDeSaldos) {
                                    if (gIsOnline === EstaEnLinea.No ||
                                        (listaDeReglasValidarConServidorAntiguedadDeSaldos.length ===
                                            0 ||
                                            listaDeReglasValidarConServidorAntiguedadDeSaldos[0].enabled.toUpperCase() ===
                                                "NO")) {
                                        var listaSku = [];
                                        _this_1.clienteServicio.validarCuentaCorriente(_this_1.cliente, listaSku, _this_1.tarea.salesOrderType, _this_1.configuracionDecimales, function (cliente) {
                                            if (_this_1.tarea.taskType === TareaTipo.Preventa) {
                                                if ($("#FechaEntrega").val() === "" ||
                                                    !ValidarFechaDeEntrega(ObtenerFecha(), $("#FechaEntrega").val())) {
                                                    notify("ERROR, Tiene que indicar una fecha correcta.");
                                                    return;
                                                }
                                            }
                                            _this_1.finalizarOrdenDeVenta();
                                            _this_1.limpiarComentario();
                                        }, function (resultado) {
                                            notify(resultado.mensaje);
                                        });
                                    }
                                    else {
                                        _this_1.clienteServicio.enviarSolicitudParaObtenerCuentaCorriente(_this_1.socketIo, _this_1.cliente, OpcionValidarSaldoCliente.FinalizarDocumento, _this_1.tarea.salesOrderType, function (cliente) {
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
                                _this_1.finalizarOrdenDeVenta();
                                _this_1.limpiarComentario();
                            }
                        }, function (resultado) {
                            notify(resultado.mensaje);
                            my_dialog("", "", "closed");
                        });
                    }, function (resultado) {
                        if (_this_1.esPrimerMensajeDeDescuento)
                            notify(resultado.mensaje);
                        my_dialog("", "", "closed");
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
        }
        catch (err) {
            notify("Error al finalizar la orden de venta: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.finalizarOrdenDeVenta = function () {
        var _this_1 = this;
        try {
            navigator.notification.confirm("Desea finalizar el documento?", function (buttonIndex) {
                if (buttonIndex === 2) {
                    my_dialog("", "", "close");
                    var uiFechaEntrega = $("#FechaEntrega");
                    _this_1.cliente.deliveryDate = uiFechaEntrega.val();
                    uiFechaEntrega = null;
                    _this_1.mostarResumenDeOrdenDeVenta();
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        catch (err) {
            notify("Error al finalizar la orden de venta: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.finalizarTareaSinGestion = function (errorCallback) {
        var _this_1 = this;
        try {
            navigator.notification.confirm("Desea finalizar la tarea sin gestion?", function (buttonIndex) {
                if (buttonIndex === 2) {
                    my_dialog("", "", "close");
                    var tipoDeRazon = "";
                    switch (_this_1.tarea.taskType) {
                        case TipoTarea.Preventa.toString():
                            tipoDeRazon = TipoDeRazon.OrdenDeVenta.toString();
                            break;
                    }
                    _this_1.razonServicio.obtenerRazones(tipoDeRazon, function (razones) {
                        var listadoDeRazones = [];
                        for (var i = 0; i < razones.length; i++) {
                            listadoDeRazones.push({
                                text: razones[i].reasonValue,
                                value: razones[i].reasonValue
                            });
                        }
                        var config = {
                            title: "Razones",
                            items: listadoDeRazones,
                            doneButtonLabel: "Ok",
                            cancelButtonLabel: "Cancelar"
                        };
                        ListPicker(config, function (item) {
                            var procesarOrdenDeVentaDeCliente = function () {
                                ObtenerPosicionGPS(function () {
                                    _this_1.tarea.completedSuccessfully = false;
                                    _this_1.tarea.reason = item;
                                    _this_1.tarea.taskStatus = TareaEstado.Completada;
                                    _this_1.tareaServicio.actualizarTareaEstado(_this_1.tarea, function () {
                                        actualizarListadoDeTareas(_this_1.tarea.taskId, _this_1.tarea.taskType, TareaEstado.Completada, _this_1.cliente.clientId, _this_1.cliente.clientName, _this_1.cliente.address, 0, TareaEstado.Aceptada, _this_1.cliente.rgaCode);
                                        $.mobile.changePage("#pickupplan_page", {
                                            transition: "flow",
                                            reverse: true,
                                            showLoadMsg: false
                                        });
                                        EnviarData();
                                        _this_1.limpiarComentario();
                                        _this_1.listaDeSkuOrdenDeVenta.length = 0;
                                    }, function (resultado) {
                                        notify("Error al actualizar la tarea: " +
                                            resultado.mensaje);
                                    });
                                });
                            };
                            var encuestasAEjecutarEnFinalizacionDeTarea = _this_1.encuestaServicio.filtrarEncuestasPorDisparador(_this_1.tarea.microsurveys, DisparadorDeEncuesta.FinDeTarea);
                            if (encuestasAEjecutarEnFinalizacionDeTarea &&
                                encuestasAEjecutarEnFinalizacionDeTarea.length > 0) {
                                BloquearPantalla();
                                _this_1.encuestaServicio.procesarEncuestasDeCliente(encuestasAEjecutarEnFinalizacionDeTarea, 0, _this_1.tarea.hasDraft, procesarOrdenDeVentaDeCliente, function (error) {
                                    notify(error.mensaje);
                                });
                                var timeOut_1 = setTimeout(function () {
                                    $.mobile.changePage("#UiSurveyPage", {
                                        transition: "flow",
                                        reverse: true,
                                        showLoadMsg: false
                                    });
                                    clearTimeout(timeOut_1);
                                }, 1000);
                            }
                            else {
                                procesarOrdenDeVentaDeCliente();
                            }
                        }, function () {
                            errorCallback();
                        });
                    }, function (resultado) {
                        notify("Error al obtener las razones: " + resultado.mensaje);
                    });
                }
                else {
                    errorCallback();
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        catch (err) {
            notify("Error al obtener razones: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.mostarResumenDeOrdenDeVenta = function () {
        var _this_1 = this;
        EstaGpsDesavilitado(function () {
            BloquearPantalla();
            _this_1.limpiarListaDeSku(function () {
                if (_this_1.descuentoPorMontoGeneral.apply) {
                    var promo = new Promo();
                    promo.promoId = _this_1.descuentoPorMontoGeneral.promoId;
                    promo.promoName = _this_1.descuentoPorMontoGeneral.promoName;
                    promo.promoType = _this_1.descuentoPorMontoGeneral.promoType;
                    promo.frequency = _this_1.descuentoPorMontoGeneral.frequency;
                    _this_1.listaDeSkuOrdenDeVenta[0].listPromo.push(promo);
                    promo = null;
                }
                _this_1.listaDeSkuOrdenDeVenta.map(function (sku) {
                    var descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
                    var descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
                    var resultadoDescuentoPorMontoGeneralYFamilia = _this_1
                        .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                        return descuentoABuscar.codeFamily === sku.codeFamilySku;
                    });
                    if (resultadoDescuentoPorMontoGeneralYFamilia) {
                        descuentoPorMontoGeneralYFamilia = resultadoDescuentoPorMontoGeneralYFamilia;
                    }
                    var resultadoDescuentoPorFamiliaYTipoPago = _this_1
                        .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                        return descuentoABuscar.codeFamily === sku.codeFamilySku;
                    });
                    if (resultadoDescuentoPorFamiliaYTipoPago) {
                        descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
                    }
                    sku.totalCD = _this_1.descuentoServicio.aplicarLosDescuentos(sku, sku.isUniqueDiscountScale, _this_1.listaDeOrdenAplicarDescuentos, descuentoPorMontoGeneralYFamilia, descuentoPorFamiliaYTipoPago);
                });
                $.mobile.changePage("SalesOrderSummaryPage", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false,
                    data: {
                        cliente: _this_1.cliente,
                        tarea: _this_1.tarea,
                        configuracionDecimales: _this_1.configuracionDecimales,
                        listaSku: _this_1.listaDeSkuOrdenDeVenta,
                        listaDeSkuParaBonificacion: _this_1.listaDeSkuParaBonificacion,
                        listaDeSkuParaBonificacionDeCombo: _this_1
                            .listaDeSkuParaBonificacionDeCombo,
                        usuarioPuedeModificarBonificacionDeCombo: _this_1
                            .usuarioPuedeModificarBonificacionDeCombo,
                        listaDeBonificacionesPorMontoGeneral: _this_1
                            .listaDeBonificacionesPorMontoGeneral,
                        listaDeDescuentoPorMontoGeneralYFamilia: _this_1
                            .listaDeDescuentoPorMontoGeneralYFamilia,
                        listaDeDescuentoPorFamiliaYTipoPago: _this_1
                            .listaDeDescuentoPorFamiliaYTipoPago,
                        listaDeOrdenAplicarDescuentos: _this_1.listaDeOrdenAplicarDescuentos
                    }
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        });
    };
    DocumentoVentaControlador.prototype.establecerDescuentoClienteEnEtiqueta = function () {
        var porcentajeDescuento = $("#UiPorcentajeDeDescuento");
        porcentajeDescuento.attr("placeholder", "Descuento disponible: " + this.cliente.discountMax + "%");
        porcentajeDescuento = null;
    };
    DocumentoVentaControlador.prototype.obtenerSku = function (idSku, packUnit) {
        var _this_1 = this;
        try {
            var listarSku_1 = [];
            var listaDeSkuParaBonificacion_1 = Array();
            this.listaDeSkuOrdenDeVenta.map(function (sku, index, array) {
                if (sku.sku === idSku) {
                    sku.unidadMedidaSeleccionada = packUnit;
                    sku.modificando = true;
                    sku.originalDiscount = sku.appliedDiscount;
                    listarSku_1.push(sku);
                }
            });
            listarSku_1.map(function (lSku) {
                _this_1.tarea.salesOrderTotal = _this_1.obtenerTotalParaEnviar(_this_1.listaDeSkuOrdenDeVenta, lSku);
                _this_1.obtenerBonificacionPorUnidad(lSku, listaDeSkuParaBonificacion_1);
            });
            this.limpiarListaDeSku(function () {
                $.mobile.changePage("skucant_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false,
                    data: {
                        cliente: _this_1.cliente,
                        tarea: _this_1.tarea,
                        configuracionDecimales: _this_1.configuracionDecimales,
                        sku: listarSku_1.length > 0 ? listarSku_1[0] : null,
                        listaSku: listarSku_1,
                        estaAgregando: false,
                        listaDeSkuParaBonificacion: listaDeSkuParaBonificacion_1,
                        listaDeSkuOrdenDeVenta: _this_1.listaDeSkuOrdenDeVenta
                    }
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al obtener sku: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.eliminarSku = function (idSku, packUnit, callback, errCallback) {
        try {
            for (var i = 0; i < this.listaDeSkuOrdenDeVenta.length; i++) {
                var sku = this.listaDeSkuOrdenDeVenta[i];
                if (sku.sku === idSku && sku.codePackUnit === packUnit) {
                    this.listaDeSkuOrdenDeVenta.splice(i, 1);
                    this.establecerTotalOrdenDeVenta(this);
                    var tieneMasUnidades = false;
                    for (var j = 0; j < this.listaDeSkuOrdenDeVenta.length; j++) {
                        var skuTemp = this.listaDeSkuOrdenDeVenta[j];
                        if (sku.sku === skuTemp.sku &&
                            sku.codePackUnit !== skuTemp.codePackUnit) {
                            tieneMasUnidades = true;
                            break;
                        }
                    }
                    if (!tieneMasUnidades) {
                        var listaSku = [];
                        listaSku.push(sku);
                    }
                    for (var indice = 0; indice < this.listaDeSkuParaBonificacion.length; indice++) {
                        if (idSku === this.listaDeSkuParaBonificacion[indice].parentCodeSku &&
                            packUnit ===
                                this.listaDeSkuParaBonificacion[indice].parentCodePackUnit) {
                            this.listaDeSkuParaBonificacion.splice(indice, 1);
                            indice--;
                        }
                    }
                    callback();
                    break;
                }
            }
        }
        catch (err) {
            errCallback({
                codigo: -1,
                mensaje: "Error al eliminar sku: " + err.mensaje
            });
        }
    };
    DocumentoVentaControlador.prototype.publicarAgregarOQuitarDelistaSkuMensaje = function (listaSku) {
        var msg = new AgregarOQuitarDeListaSkuMensaje(this);
        msg.listaSku = listaSku;
        msg.agregarSku = true;
        msg.quitarSku = false;
        this.mensajero.publish(msg, getType(AgregarOQuitarDeListaSkuMensaje));
    };
    DocumentoVentaControlador.prototype.usuarioDeseaEliminarSku = function (idSku, packUnit) {
        var _this_1 = this;
        try {
            navigator.notification.confirm("Confirma remover de la lista al SKU " + idSku + "?", function (buttonIndex) {
                if (buttonIndex === 2) {
                    _this_1.eliminarSku(idSku, packUnit, function () {
                        _this_1.obtenerBonificacionesPorComboEnListado(function () {
                            _this_1.cargarListaSku();
                        });
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
            }, "Sonda® " + SondaVersion, "No,Si");
        }
        catch (err) {
            notify("Error al eliminar sku: " + err.mensaje);
        }
    };
    DocumentoVentaControlador.prototype.publicarDatos = function () {
        var _this_1 = this;
        try {
            this.cliente.skus = "";
            this.listaDeSkuOrdenDeVenta.map(function (sku) {
                if (_this_1.cliente.skus === "") {
                    _this_1.cliente.skus += "'" + sku.sku + "'";
                }
                else {
                    _this_1.cliente.skus += ",'" + sku.sku + "'";
                }
            });
        }
        catch (err) {
            notify("Error al publicar datos: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.mostrorPantallaListaSku = function () {
        $.mobile.changePage("skus_list_page", {
            transition: "none",
            reverse: true,
            showLoadMsg: false,
            data: {
                cliente: this.cliente,
                tarea: this.tarea,
                configuracionDecimales: this.configuracionDecimales,
                esPrimeraVez: this.esPrimeraVez,
                listaDeSkuOrdenDeVenta: this.listaDeSkuOrdenDeVenta
            }
        });
    };
    DocumentoVentaControlador.prototype.cargarTarea = function () {
        var _this_1 = this;
        try {
            this.tarea = new Tarea();
            this.tarea.taskId = gtaskid;
            this.tarea.taskType = gTaskType;
            this.tarea.salesOrderType = gSalesOrderType;
            this.tarea.taskStatus = TareaEstado.Aceptada;
            this.tarea.completedSuccessfully = true;
            this.tarea.reason = "Genero Gestion";
            this.tarea.hasDraft =
                this.ordenDeVentaDraft &&
                    (this.ordenDeVentaDraft.ordenDeVentaDetalle !== undefined
                        ? this.ordenDeVentaDraft.ordenDeVentaDetalle.length !== 0
                        : false);
            if (this.tarea.hasDraft) {
                this.tarea.salesOrderIdDraft = this.ordenDeVentaDraft.salesOrderId;
                this.tarea.salesOrderDocSerieDraft = this.ordenDeVentaDraft.docSerie;
                this.tarea.salesOrderDocNumDraft = this.ordenDeVentaDraft.docNum;
                if (!this.seCargoDatosDraft) {
                    var porcentajeDescuento = $("#UiPorcentajeDeDescuento");
                    if (parseInt(this.ordenDeVentaDraft.discount.toString()) === 0) {
                        porcentajeDescuento.val("");
                    }
                    else {
                        porcentajeDescuento.val(this.ordenDeVentaDraft.discount);
                    }
                    porcentajeDescuento = null;
                    var uiFechaEntrega = $("#FechaEntrega");
                    uiFechaEntrega.val(this.obtenerFechaFormato(this.ordenDeVentaDraft.deliveryDate.toString(), this.ordenDeVentaDraft.salesOrderId > 0));
                    uiFechaEntrega = null;
                    this.seCargoDatosDraft = true;
                }
            }
            this.estadoDeTareaAnterior = gtaskStatus;
            var cliente = new Cliente();
            cliente.clientId = gClientID;
            cliente = this.cliente || cliente;
            this.encuestaServicio.obtenerEncuestas(cliente, function (encuestas) {
                _this_1.tarea.microsurveys = encuestas;
            }, function (error) {
                notify(error.mensaje);
            });
        }
        catch (err) {
            notify("Error al cargar la Tarea: " + err.mensaje);
        }
    };
    DocumentoVentaControlador.prototype.mostrarCliente = function () {
        alert(this.cliente.clientName);
    };
    DocumentoVentaControlador.prototype.clienteEntregado = function (mensaje, subcriber) {
        subcriber.cliente = mensaje.cliente;
    };
    DocumentoVentaControlador.prototype.listaSkuEntregado = function (mensaje, subcriber) {
        var lstSkuTemp = [];
        if (mensaje.listaSku.length === 0) {
            subcriber.limpiarListas(subcriber, function () { });
        }
        else {
            var listaDeSkuParaBonificacion = (JSON.parse(JSON.stringify(mensaje.listaDeSkuParaBonificacion)));
            subcriber.listaDeSkuParaBonificacion = subcriber.listaDeSkuParaBonificacion.filter(function (sku) {
                return mensaje.listaSku[0].sku !== sku.parentCodeSku;
            });
            mensaje.listaDeSkuParaBonificacion = (JSON.parse(JSON.stringify(listaDeSkuParaBonificacion)));
            for (var _i = 0, _a = mensaje.listaDeSkuParaBonificacion; _i < _a.length; _i++) {
                var skuParaBonificar = _a[_i];
                subcriber.listaDeSkuParaBonificacion.push(skuParaBonificar);
            }
            subcriber.listaDeSkuOrdenDeVenta.map(function (skuFiltrado) {
                if (skuFiltrado.sku === mensaje.listaSku[0].sku) {
                    skuFiltrado.deleted = true;
                    var resultadoDeBusqueda = mensaje.listaSku.filter(function (sku) {
                        return sku.codePackUnit === skuFiltrado.codePackUnit;
                    });
                    if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
                        if (resultadoDeBusqueda[0].qty > 0 &&
                            !isNaN(resultadoDeBusqueda[0].qty)) {
                            skuFiltrado.qty = trunc_number(resultadoDeBusqueda[0].qty, subcriber.configuracionDecimales.defaultCalculationsDecimals);
                            skuFiltrado.total = trunc_number(resultadoDeBusqueda[0].qty * resultadoDeBusqueda[0].cost, subcriber.configuracionDecimales.defaultCalculationsDecimals);
                            skuFiltrado.appliedDiscount =
                                resultadoDeBusqueda[0].appliedDiscount;
                            skuFiltrado.discount = resultadoDeBusqueda[0].discount;
                            skuFiltrado.discountType = resultadoDeBusqueda[0].discountType;
                            skuFiltrado.cost = resultadoDeBusqueda[0].cost;
                            skuFiltrado.listPromo = resultadoDeBusqueda[0].listPromo;
                            skuFiltrado.deleted = false;
                        }
                    }
                    resultadoDeBusqueda = null;
                }
            });
            mensaje.listaSku.map(function (skuFiltrado) {
                var seAgregarSku = true;
                for (var _i = 0, _a = subcriber.listaDeSkuOrdenDeVenta; _i < _a.length; _i++) {
                    var sku = _a[_i];
                    if (sku.sku === skuFiltrado.sku &&
                        sku.codePackUnit === skuFiltrado.codePackUnit) {
                        seAgregarSku = false;
                    }
                }
                if (seAgregarSku) {
                    subcriber.listaDeSkuOrdenDeVenta.push(skuFiltrado);
                }
            });
            subcriber.listaDeSkuOrdenDeVenta = subcriber.listaDeSkuOrdenDeVenta.filter(function (sku) {
                return sku.deleted === false;
            });
            subcriber.publicarDatos();
            subcriber.obtenerBonificacionesPorComboEnListado(function () { });
        }
    };
    DocumentoVentaControlador.prototype.listaDeSkuParaBonificacionDeComboEntregado = function (mensaje, subcriber) {
        subcriber.listaDeSkuParaBonificacionDeCombo[mensaje.indice] =
            mensaje.bonoPorCombo;
    };
    DocumentoVentaControlador.prototype.listaDeSkuParaBonificacionDeComboInicioDeVentaEntregado = function (mensaje, subcriber) {
        subcriber.EsPrimerMensajeDeDescuento = true;
        subcriber.listaDeSkuParaBonificacionDeCombo =
            mensaje.listaDeSkuParaBonificacionDeCombo;
        subcriber.usuarioYaColocoDescuento = false;
    };
    DocumentoVentaControlador.prototype.cancelarSuscripcion = function () {
        this.mensajero.unsubscribe(this.tokenCliente.guid, getType(ClienteMensaje));
    };
    DocumentoVentaControlador.prototype.publicarCombo = function (indice) {
        var msg = new BonoPorComboMensaje(this);
        msg.bonoPorCombo = this.listaDeSkuParaBonificacionDeCombo[indice];
        msg.indice = indice;
        this.mensajero.publish(msg, getType(BonoPorComboMensaje));
    };
    DocumentoVentaControlador.prototype.cargarListaSku = function () {
        var _this_1 = this;
        try {
            my_dialog("Sonda® " + SondaVersion, "Cargando Sku...", "open");
            var usarMaximaBonificacion_1 = localStorage.getItem("USE_MAX_BONUS") === "1";
            var cantidadSinDetalle_1 = 0;
            var skulist_1 = $("#pos_skus_page_listview");
            skulist_1.children().remove("li");
            this.obtenerDescuentosPorMontoYFamiliaYTipoPago(function () {
                _this_1.cargarBonificacionesPorMontoGeneral(function () {
                    if (_this_1.listaDeSkuOrdenDeVenta.length > 0) {
                        for (var j = 0; j < _this_1.listaDeSkuParaBonificacionDeCombo.length; j++) {
                            if (_this_1.listaDeSkuParaBonificacionDeCombo[j].skusDeBonoPorCombo
                                .length > 0) {
                                var liPorCombo = "<li LineSeq='" + j.toString() + "' esCombo='1' id='" + _this_1.listaDeSkuParaBonificacionDeCombo[j].comboId + "' data-filtertext='" + _this_1.listaDeSkuParaBonificacionDeCombo[j].comboId + " " + _this_1.listaDeSkuParaBonificacionDeCombo[j].nameCombo + "' style='padding:5px; background-color:#1a8dff'>";
                                liPorCombo +=
                                    "<a class='ui-alt-icon ui-shadow ui-nodisc-icon' href='#' id=''>";
                                liPorCombo +=
                                    "<h4>" +
                                        _this_1.listaDeSkuParaBonificacionDeCombo[j].nameCombo +
                                        " - " +
                                        (_this_1.listaDeSkuParaBonificacionDeCombo[j]
                                            .bonusSubType ===
                                            SubTipoDeBonificacionPorCombo.Unica.toString()
                                            ? DescripcionSubTipoDeBonificacionPorCombo.Unica.toString()
                                            : DescripcionSubTipoDeBonificacionPorCombo.Multiple.toString()) +
                                        "</h4>";
                                if (_this_1.listaDeSkuParaBonificacionDeCombo[j].isConfig) {
                                    if (_this_1.listaDeSkuParaBonificacionDeCombo[j].isEmpty) {
                                        liPorCombo += "<span class='small-roboto'>Se configuro el combo para que no bonifique</span><br/>";
                                    }
                                    else {
                                        for (var _i = 0, _a = _this_1
                                            .listaDeSkuParaBonificacionDeCombo[j]
                                            .skusDeBonoPorComboAsociados; _i < _a.length; _i++) {
                                            var skuParaBonificacionDeCombo = _a[_i];
                                            liPorCombo += "<span class='small-roboto'>Bonificaci\u00F3n: " + skuParaBonificacionDeCombo.descriptionSku + "</span><br/>";
                                            if (skuParaBonificacionDeCombo.selectedQty >
                                                skuParaBonificacionDeCombo.qty) {
                                                skuParaBonificacionDeCombo.selectedQty =
                                                    skuParaBonificacionDeCombo.qty;
                                            }
                                            else {
                                                if (!_this_1.usuarioPuedeModificarBonificacionDeCombo) {
                                                    skuParaBonificacionDeCombo.selectedQty =
                                                        skuParaBonificacionDeCombo.qty;
                                                }
                                            }
                                            liPorCombo += "<span class='small-roboto'>Cod. SKU: " + skuParaBonificacionDeCombo.codeSku + " UM.: " + skuParaBonificacionDeCombo.codePackUnit + " Cant.: " + skuParaBonificacionDeCombo.selectedQty + "</span><br/>";
                                        }
                                    }
                                }
                                else {
                                    if (_this_1.listaDeSkuParaBonificacionDeCombo[j]
                                        .bonusSubType ===
                                        SubTipoDeBonificacionPorCombo.Unica.toString() &&
                                        _this_1.listaDeSkuParaBonificacionDeCombo[j]
                                            .skusDeBonoPorCombo.length > 1) {
                                        liPorCombo += "<span class='small-roboto'>No se ha configurado la Bonificaci\u00F3n</span><br/>";
                                    }
                                    else {
                                        if (_this_1.usuarioPuedeModificarBonificacionDeCombo &&
                                            usarMaximaBonificacion_1 === false) {
                                            liPorCombo += "<span class='small-roboto'>Se configuro el combo para que no bonifique</span><br/>";
                                        }
                                        else {
                                            for (var _b = 0, _c = _this_1
                                                .listaDeSkuParaBonificacionDeCombo[j]
                                                .skusDeBonoPorCombo; _b < _c.length; _b++) {
                                                var skuParaBonificacionDeCombo = _c[_b];
                                                liPorCombo += "<span class='small-roboto'>Bonificaci\u00F3n: " + skuParaBonificacionDeCombo.descriptionSku + "</span><br/>";
                                                if (skuParaBonificacionDeCombo.selectedQty >
                                                    skuParaBonificacionDeCombo.qty) {
                                                    skuParaBonificacionDeCombo.selectedQty =
                                                        skuParaBonificacionDeCombo.qty;
                                                }
                                                else {
                                                    if (!_this_1
                                                        .usuarioPuedeModificarBonificacionDeCombo ||
                                                        usarMaximaBonificacion_1) {
                                                        skuParaBonificacionDeCombo.selectedQty =
                                                            skuParaBonificacionDeCombo.qty;
                                                    }
                                                }
                                                liPorCombo += "<span class='small-roboto'>Cod. SKU: " + skuParaBonificacionDeCombo.codeSku + " UM.: " + skuParaBonificacionDeCombo.codePackUnit + " Cant.: " + skuParaBonificacionDeCombo.qty + "</span><br/>";
                                            }
                                        }
                                    }
                                }
                                liPorCombo += "</a>";
                                liPorCombo += "</li>";
                                skulist_1.append(liPorCombo);
                            }
                            else {
                                cantidadSinDetalle_1++;
                            }
                        }
                        if (cantidadSinDetalle_1 > 0) {
                            notify("Tiene " + cantidadSinDetalle_1 + " combo(s) que bonifica(n) productos que en este momento no se encuentran en su bodega de preventa.");
                        }
                    }
                    var tabla = '<li esCombo="0" data-icon="false">' +
                        '<table data-role="table" data-mode="reflow" class="ui-responsive table-stroke" style="width: 100%">';
                    for (var i = 0; i < _this_1.listaDeSkuOrdenDeVenta.length; i++) {
                        var sku = _this_1.listaDeSkuOrdenDeVenta[i];
                        tabla += '<tr style="display: flex;">';
                        tabla +=
                            '<td style="width: 10%" valign="center" align="center">' +
                                '<a href="#" id="' +
                                OpcionEnListadoDePedido.Eliminar.toString() +
                                "|" +
                                sku.sku +
                                "|" +
                                sku.codePackUnit +
                                '|detalle" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext" style="margin-top: 20px;"></a></td>';
                        tabla += '<td style="width: 60%; word-break: break-all;">';
                        tabla += "<span class='small-roboto'>" + (sku.skuName.length > 40
                            ? sku.skuName.substring(0, 40)
                            : sku.skuName) + "</span><br/>";
                        tabla += "<span id='SKU_QTY_" + sku.sku.replace(" ", "_") + "' class='small-roboto'>Cant.: " + format_number(sku.qty, _this_1.configuracionDecimales.defaultDisplayDecimals) + "  UM: " + sku.codePackUnit + "  Pre.: " + DarFormatoAlMonto(format_number(sku.cost, _this_1.configuracionDecimales.defaultDisplayDecimals)) + "</span><br/>";
                        tabla += "<span id='SKU_AVAIL_" + sku.sku.replace(" ", "_") + "' class='small-roboto'>Disponible: " + format_number(sku.available, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</span><br/>";
                        if (sku.handleDimension) {
                            tabla +=
                                "<table style='width: 75%;' data-role='table' data-mode='reflow' class='ui-responsive table-stroke'>";
                            tabla += "<tr>";
                            tabla += "<td style='width: 30%; text-align: left;'>";
                            tabla +=
                                "<span class='small-roboto'>" + "<b>" + "CANTIDAD" + "</b>";
                            tabla += "</td>";
                            tabla += "<td style='width: 30%;text-align: center;'>";
                            tabla +=
                                "<span class='small-roboto'>" +
                                    "<b>" +
                                    "DIMENSION" +
                                    "</b>";
                            tabla += "</td>";
                            tabla += "<td style='width: 30%;text-align: right;'>";
                            tabla +=
                                "<span class='small-roboto'>" + "<b>" + "TOTAL" + "</b>";
                            tabla += "</td>";
                            tabla += "</tr>";
                            for (var _d = 0, _e = sku.dimensions; _d < _e.length; _d++) {
                                var dimension = _e[_d];
                                var dimensionSku = trunc_number(dimension.dimensionSku, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                                var cantidad = trunc_number(dimension.qtySku, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                                var total_1 = trunc_number(parseFloat(dimension.total.toString()), _this_1.configuracionDecimales.defaultCalculationsDecimals);
                                tabla += "<tr>";
                                tabla += "<td style='width: 30%; text-align: left;'>";
                                tabla += "<span class='small-roboto'>" + format_number(cantidad, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                                tabla += "</td>";
                                tabla += "<td style='width: 30%;text-align: center;'>";
                                tabla += "<span class='small-roboto'>" + format_number(dimensionSku, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                                tabla += "</td>";
                                tabla += "<td style='width: 30%;text-align: right;'>";
                                tabla += "<span class='small-roboto'>" + format_number(total_1, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                                tabla += "</td>";
                                tabla += "</tr>";
                            }
                            tabla += "</table><br/>";
                        }
                        var resultadoDescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
                        var resultadoDescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
                        if (!sku.isUniqueDiscountScale) {
                            resultadoDescuentoPorMontoGeneralYFamilia = _this_1
                                .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                                return descuentoABuscar.codeFamily === sku.codeFamilySku;
                            });
                            resultadoDescuentoPorFamiliaYTipoPago = _this_1
                                .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                                return descuentoABuscar.codeFamily === sku.codeFamilySku;
                            });
                        }
                        if (sku.discount !== 0) {
                            switch (sku.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    tabla += "<span id='SKU_DISCOUNT_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> Des: " + format_number(sku.appliedDiscount, _this_1.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    tabla += "<span id='SKU_DISCOUNT_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> Des: " + DarFormatoAlMonto(format_number(sku.appliedDiscount, _this_1.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                            if (!resultadoDescuentoPorMontoGeneralYFamilia &&
                                !resultadoDescuentoPorFamiliaYTipoPago) {
                                tabla += "<span id='SKU_LINE_TOTALCD_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> Total: " + format_number(sku.total, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                            }
                        }
                        if (resultadoDescuentoPorMontoGeneralYFamilia) {
                            switch (resultadoDescuentoPorMontoGeneralYFamilia.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    tabla += "<span id='SKU_DISCOUNT_MGF_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> DMF: " + format_number(resultadoDescuentoPorMontoGeneralYFamilia.discount, _this_1.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    tabla += "<span id='SKU_DISCOUNT_MGF_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> DMF: " + DarFormatoAlMonto(format_number(resultadoDescuentoPorMontoGeneralYFamilia.discount, _this_1.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                            if (!resultadoDescuentoPorFamiliaYTipoPago) {
                                tabla += "<span id='SKU_LINE_TOTALCD_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> Total: " + format_number(sku.total, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</span>";
                            }
                        }
                        if (resultadoDescuentoPorFamiliaYTipoPago) {
                            switch (resultadoDescuentoPorFamiliaYTipoPago.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    tabla += "<span id='SKU_DISCOUNT_MGF_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> DFT: " + format_number(resultadoDescuentoPorFamiliaYTipoPago.discount, _this_1.configuracionDecimales.defaultDisplayDecimals) + "%</span>";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    tabla += "<span id='SKU_DISCOUNT_MGF_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> DFT: " + DarFormatoAlMonto(format_number(resultadoDescuentoPorFamiliaYTipoPago.discount, _this_1.configuracionDecimales.defaultDisplayDecimals)) + "</span>";
                                    break;
                            }
                            tabla += "<p id='SKU_LINE_TOTALCD_" + sku.sku.replace(" ", "_") + "' class='small-roboto'> Total: " + format_number(sku.total, _this_1.configuracionDecimales.defaultDisplayDecimals) + "</p>";
                        }
                        tabla += "";
                        tabla += "</td>";
                        tabla += '<td style="width: 20%">';
                        var total = sku.total;
                        if (!resultadoDescuentoPorMontoGeneralYFamilia) {
                            resultadoDescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
                        }
                        if (!resultadoDescuentoPorFamiliaYTipoPago) {
                            resultadoDescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
                        }
                        total = _this_1.descuentoServicio.aplicarLosDescuentos(sku, sku.isUniqueDiscountScale, _this_1.listaDeOrdenAplicarDescuentos, resultadoDescuentoPorMontoGeneralYFamilia, resultadoDescuentoPorFamiliaYTipoPago);
                        tabla += "<a href=\"#\" id=\"" + OpcionEnListadoDePedido.Modificar.toString() + "|" + sku.sku + "|" + sku.codePackUnit + "|detalle\" class='ui-btn ui-corner-all small-roboto' style=\"margin-top: 20px;width: 80%\">" + DarFormatoAlMonto(format_number(total, _this_1.configuracionDecimales.defaultDisplayDecimals)) + "</a>";
                        tabla += "</td></tr>";
                        var listaDeSkuABonificar = new Array();
                        _this_1.obtenerBonificacionPorUnidad(sku, listaDeSkuABonificar);
                        var tieneBonificaciones = listaDeSkuABonificar.length > 0;
                        if (tieneBonificaciones) {
                            tabla +=
                                '<tr style="display: flex;border-bottom: 1px solid #00ff00;border-top: 1px solid #00ff00;border-left: 1px solid #00ff00;border-right: 1px solid #00ff00;">';
                            tabla +=
                                '<td style="width: 10%" valign="center" align="center"><a href="#" id="' +
                                    OpcionEnListadoDePedido.Eliminar.toString() +
                                    "|" +
                                    sku.sku +
                                    "|" +
                                    sku.codePackUnit +
                                    '|bonificacion" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext"></a></td>';
                            tabla += '<td style="width: 65%">';
                            for (var _f = 0, listaDeSkuABonificar_1 = listaDeSkuABonificar; _f < listaDeSkuABonificar_1.length; _f++) {
                                var skuParaBonificacion = listaDeSkuABonificar_1[_f];
                                tabla += "<span style=\"display:inline-block;width:100px;word-wrap:break-word\" class='small-roboto'>Bonificaci\u00F3n: " + skuParaBonificacion.skuDescription + "</span><br/>";
                                tabla += "<span class='small-roboto'>Cod. SKU: " + skuParaBonificacion.sku + " UM.: " + skuParaBonificacion.codePackUnit + " Cant.: " + skuParaBonificacion.qty + "</span><br/>";
                            }
                            tabla += "</td>";
                            tabla += '<td style="width: 25%">';
                            tabla += "</td></tr>";
                        }
                    }
                    tabla += "</table></li>";
                    skulist_1.append(tabla);
                    skulist_1.listview("refresh");
                    skulist_1 = null;
                    _this_1.establecerTotalOrdenDeVenta(_this_1);
                    my_dialog("", "", "close");
                }, function (resultado) {
                    my_dialog("", "", "close");
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                my_dialog("", "", "close");
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al cargar la lista de sku: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.establecerTotalOrdenDeVenta = function (_this) {
        try {
            var total = 0;
            for (var i = 0; i < _this.listaDeSkuOrdenDeVenta.length; i++) {
                var sku = _this.listaDeSkuOrdenDeVenta[i];
                total += sku.total;
                sku = null;
            }
            _this.cliente.totalAmout = total;
            var saldoActual = _this.cliente.cuentaCorriente.saldoActual + total;
            var limiteDeCredito = _this.cliente.cuentaCorriente.limiteDeCredito - saldoActual;
            var uiTotalOrdenVenta = $("#lblTotalSKU");
            var porcentajeDeImpuesto_1 = parseFloat(localStorage.getItem("TAX_PERCENT_PARAMETER"));
            _this.tareaServicio.obtenerRegla("CalcularTotalDeImpuesto", function (listaDeReglas) {
                if (listaDeReglas.length > 0 &&
                    listaDeReglas[0].enabled.toUpperCase() === "SI") {
                    var totalOrden = 0;
                    var totalOriginalOrdenDeVenta = _this.obtenerTotalDeOrdenDeVenta(_this.cliente.appliedDiscount, _this.listaDeSkuOrdenDeVenta);
                    porcentajeDeImpuesto_1 = (porcentajeDeImpuesto_1 > 0
                        ? porcentajeDeImpuesto_1 / 100
                        : 0.0);
                    totalOrden =
                        totalOriginalOrdenDeVenta * porcentajeDeImpuesto_1 +
                            totalOriginalOrdenDeVenta;
                    uiTotalOrdenVenta.text("TOTAL C.I: " +
                        DarFormatoAlMonto(format_number(totalOrden, _this.configuracionDecimales.defaultDisplayDecimals)));
                    uiTotalOrdenVenta = null;
                }
                else {
                    var totalOrdenDeVenta = _this.obtenerTotalDeOrdenDeVenta(_this.cliente.appliedDiscount, _this.listaDeSkuOrdenDeVenta);
                    uiTotalOrdenVenta.text("TOTAL: " +
                        DarFormatoAlMonto(format_number(totalOrdenDeVenta, _this.configuracionDecimales.defaultDisplayDecimals)));
                    uiTotalOrdenVenta = null;
                }
            }, function (resultado) {
                uiTotalOrdenVenta.text("TOTAL: " +
                    DarFormatoAlMonto(format_number(_this.obtenerTotalDeOrdenDeVenta(_this.cliente.appliedDiscount, _this.listaDeSkuOrdenDeVenta), _this.configuracionDecimales.defaultDisplayDecimals)));
                uiTotalOrdenVenta = null;
            });
            if (_this.tarea) {
                _this.tarea.salesOrderTotal = _this.obtenerTotalDeOrdenDeVenta(0, _this.listaDeSkuOrdenDeVenta);
            }
            var uiSubTotalOrdenDeventa = $("#lblSubTotalSKU");
            uiSubTotalOrdenDeventa.text(DarFormatoAlMonto(format_number(_this.obtenerTotalDeOrdenDeVenta(0, _this.listaDeSkuOrdenDeVenta), _this.configuracionDecimales.defaultDisplayDecimals)));
            var uiSaldoTotal = $("#lblSaldoTotal");
            uiSaldoTotal.text(DarFormatoAlMonto(format_number(saldoActual, _this.configuracionDecimales.defaultDisplayDecimals)));
            var uiSaldoTotal2 = $("#lblSaldoTotal2");
            uiSaldoTotal2.text(DarFormatoAlMonto(format_number(saldoActual, _this.configuracionDecimales.defaultDisplayDecimals)));
            var uiLimiteDeCredito = $("#lblLimiteDeCredito");
            uiLimiteDeCredito.text(DarFormatoAlMonto(format_number(limiteDeCredito, _this.configuracionDecimales.defaultDisplayDecimals)));
            var uiTotalDescuento = $("#lblTotalDescuento");
            uiTotalDescuento.text(DarFormatoAlMonto(format_number(_this.obtenerTotalDeOrdenDeVenta(_this.cliente.appliedDiscount, _this.listaDeSkuOrdenDeVenta), _this.configuracionDecimales.defaultDisplayDecimals)));
            uiTotalDescuento = null;
            uiSaldoTotal = null;
            uiSubTotalOrdenDeventa = null;
            uiSaldoTotal2 = null;
            var tot = DarFormatoAlMonto(format_number(_this.obtenerTotalDeOrdenDeVenta(0, _this.listaDeSkuOrdenDeVenta), _this.configuracionDecimales.defaultDisplayDecimals));
            tot = tot.substr(1);
            _this.obtenerDescuentos(parseFloat(tot), function () {
                _this.tarea.discountPerGeneralAmountLowLimit =
                    _this.descuentoPorMontoGeneral.lowAmount;
                if (_this.descuentoPorMontoGeneral.highAmount === 0) {
                    _this.tarea.discountPerGeneralAmountHighLimit = -1;
                }
                else {
                    _this.tarea.discountPerGeneralAmountHighLimit =
                        _this.descuentoPorMontoGeneral.highAmount;
                }
                var uiDmgMaximo = $("#UiEtiquetaDMGMaximo");
                uiDmgMaximo.html("DMG a Aplicar: (" + _this.descuentoPorMontoGeneral.discount + "%)");
                uiDmgMaximo = null;
                var uiTxtDmg = $("#UiPorcentajeDeDescuento");
                if (!_this.usuarioPuedeModificarDescuento) {
                    uiTxtDmg.attr("readonly", "true");
                    uiTxtDmg.attr("data-clear-btn", "false");
                    uiTxtDmg.val(_this.descuentoPorMontoGeneral.discount);
                }
                else {
                    uiTxtDmg.removeAttr("readonly");
                    uiTxtDmg.attr("data-clear-btn", "true");
                    if (_this.cliente.appliedDiscount >= 0 &&
                        _this.usuarioYaColocoDescuento) {
                        uiTxtDmg.val(_this.cliente.appliedDiscount);
                    }
                    else {
                        uiTxtDmg.val(_this.descuentoPorMontoGeneral.discount);
                    }
                    _this.tarea.discountPerGeneralAmount =
                        parseFloat(uiTxtDmg.val()) / 100;
                }
                uiTxtDmg = null;
                _this.calcularDescuento(_this, function () { }, function (resultado) {
                    if (_this.esPrimerMensajeDeDescuento)
                        notify(resultado.mensaje);
                });
            });
            tot = null;
        }
        catch (err) {
            notify("Error al establecer el total de la orden de venta: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.usuarioDeseaCalcularDescuento = function (_this) {
        _this.calcularDescuento(_this, function () {
            _this.usuarioYaColocoDescuento = true;
        }, function (resultado) {
            if (_this.esPrimerMensajeDeDescuento)
                notify(resultado.mensaje);
        });
    };
    DocumentoVentaControlador.prototype.calcularDescuento = function (_this, callback, errCallback) {
        try {
            var uiOrdenDeVentaDescuento = $("#UiPorcentajeDeDescuento");
            var descuento = uiOrdenDeVentaDescuento.val();
            uiOrdenDeVentaDescuento = null;
            if (descuento === undefined ||
                descuento === null ||
                descuento.toString() === "" ||
                descuento.toString() === "0") {
                _this.cliente.appliedDiscount = 0;
                _this.cliente.discount = trunc_number(_this.cliente.totalAmout -
                    (_this.cliente.appliedDiscount * _this.cliente.totalAmout) / 100, _this.configuracionDecimales.defaultCalculationsDecimals);
            }
            else {
                if (descuento < 0 ||
                    descuento > _this.descuentoPorMontoGeneral.discount) {
                    var operacion = new Operacion();
                    operacion.codigo = -1;
                    operacion.mensaje =
                        "El descuento no puede ser menor a 0% y mayor a " +
                            _this.descuentoPorMontoGeneral.discount +
                            "%";
                    console.log(operacion.mensaje);
                    _this.usuarioYaColocoDescuento = false;
                    errCallback(operacion);
                    _this.esPrimerMensajeDeDescuento = false;
                    return;
                }
                else {
                    _this.cliente.appliedDiscount = trunc_number(descuento, _this.configuracionDecimales.defaultCalculationsDecimals);
                    _this.cliente.discount = trunc_number(_this.cliente.totalAmout -
                        (_this.cliente.appliedDiscount * _this.cliente.totalAmout) / 100, _this.configuracionDecimales.defaultCalculationsDecimals);
                }
            }
            var uiTotalDescuento = $("#lblTotalDescuento");
            uiTotalDescuento.text(format_number(_this.obtenerTotalDeOrdenDeVenta(_this.cliente.appliedDiscount, _this.listaDeSkuOrdenDeVenta), _this.configuracionDecimales.defaultDisplayDecimals));
            uiTotalDescuento = null;
            var uiTotalConDescuento = $("#lblTotalSKUCD");
            uiTotalConDescuento.text(format_number(_this.cliente.discount, _this.configuracionDecimales.defaultDisplayDecimals));
            uiTotalConDescuento = null;
            callback();
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje =
                "Error al calcular el descuento de la orden de venta: " + err.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    };
    DocumentoVentaControlador.prototype.obtenerSecuenciaDeDocumentos = function (controlador, callback) {
        try {
            GetNexSequence("DRAFT", function (sequence) {
                ObtenerSecuenciaSiguiente(TipoDocumento.Borrador, function (serie, numeroDeDocumento) {
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
    DocumentoVentaControlador.prototype.prepararOrdenDeVentaParaInsertar = function (callback) {
        var _this_1 = this;
        try {
            this.obtenerSecuenciaDeDocumentos(this, function (sequence, serie, numeroDeDocumento, controlador) {
                var ordenDeVenta = new OrdenDeVenta();
                ordenDeVenta.salesOrderId = parseInt(sequence);
                ordenDeVenta.docSerie = serie;
                ordenDeVenta.docNum = numeroDeDocumento;
                ordenDeVenta.terms = null;
                ordenDeVenta.postedDatetime = getDateTime();
                ordenDeVenta.clientId = controlador.cliente.clientId;
                ordenDeVenta.posTerminal = gCurrentRoute;
                ordenDeVenta.gpsUrl = gCurrentGPS;
                switch (_this_1.configuracionDecimales.displayDecimalsRoundType) {
                    case "TRUNC":
                        ordenDeVenta.totalAmount =
                            controlador.cliente.totalAmout.toString().split(".")[0] * 1;
                        break;
                    case "ROUND":
                        ordenDeVenta.totalAmount = Math.round(controlador.cliente.totalAmout);
                        break;
                    case "FLOOR":
                        ordenDeVenta.totalAmount = Math.floor(controlador.cliente.totalAmout);
                        break;
                    case "CEILING":
                        ordenDeVenta.totalAmount = Math.ceil(controlador.cliente.totalAmout);
                        break;
                    default:
                        ordenDeVenta.totalAmount = trunc_number(controlador.cliente.totalAmout, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                        break;
                }
                ordenDeVenta.status = "0";
                ordenDeVenta.postedBy = localStorage.getItem("LAST_LOGIN_ID");
                ordenDeVenta.image1 = null;
                ordenDeVenta.image2 = null;
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
                ordenDeVenta.isParent = true;
                ordenDeVenta.referenceId =
                    localStorage.getItem("LAST_LOGIN_ID") + getDateTime() + sequence;
                ordenDeVenta.timesPrinted = 0;
                ordenDeVenta.sinc = 0;
                ordenDeVenta.isPostedVoid = 2;
                ordenDeVenta.isVoid = false;
                ordenDeVenta.salesOrderType = controlador.tarea.salesOrderType;
                ordenDeVenta.discount = trunc_number(controlador.cliente.appliedDiscount, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                ordenDeVenta.discountApplied = trunc_number(controlador.cliente.discount, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                ordenDeVenta.taskId = controlador.tarea.taskId;
                ordenDeVenta.salesOrderIdBo = 0;
                ordenDeVenta.isDraft = 1;
                ordenDeVenta.isUpdated = 0;
                ordenDeVenta.taskIdBo = 0;
                ordenDeVenta.paymentTimesPrinted = null;
                ordenDeVenta.paidToDate = 0;
                ordenDeVenta.toBill = null;
                ordenDeVenta.ordenDeVentaDetalle = [];
                controlador.listaDeSkuOrdenDeVenta.map(function (sku, index, array) {
                    var ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                    ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                    ordenDeVentaDetalle.sku = sku.sku;
                    ordenDeVentaDetalle.lineSeq = index + 1;
                    ordenDeVentaDetalle.qty = trunc_number(sku.qty, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                    ordenDeVentaDetalle.price = trunc_number(sku.cost, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                    switch (_this_1.configuracionDecimales.displayDecimalsRoundType) {
                        case "TRUNC":
                            ordenDeVentaDetalle.totalLine = trunc_number(sku.total, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                            break;
                        case "ROUND":
                            ordenDeVentaDetalle.totalLine = Math.round(sku.total);
                            break;
                        case "FLOOR":
                            ordenDeVentaDetalle.totalLine = Math.floor(sku.total);
                            break;
                        case "CEILING":
                            ordenDeVentaDetalle.totalLine = Math.ceil(sku.total);
                            break;
                        default:
                            ordenDeVentaDetalle.totalLine = trunc_number(sku.total, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                            break;
                    }
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
                    ordenDeVentaDetalle.isBonus = 0;
                    ordenDeVentaDetalle.long = sku.dimension;
                    ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                });
                callback(ordenDeVenta);
            });
        }
        catch (err) {
            notify("Error al preparar ordenDeVenta: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.prepararOrdenDeVentaParaActualizar = function (callback) {
        var _this_1 = this;
        try {
            this.ordenDeVentaDraft.terms = null;
            this.ordenDeVentaDraft.postedDatetime = getDateTime();
            this.ordenDeVentaDraft.clientId = this.cliente.clientId;
            this.ordenDeVentaDraft.posTerminal = gCurrentRoute;
            this.ordenDeVentaDraft.gpsUrl = gCurrentGPS;
            switch (this.configuracionDecimales.displayDecimalsRoundType) {
                case "TRUNC":
                    this.ordenDeVentaDraft.totalAmount = format_number(this.cliente.totalAmout, 0);
                    break;
                case "ROUND":
                    this.ordenDeVentaDraft.totalAmount = Math.round(this.cliente.totalAmout);
                    break;
                case "FLOOR":
                    this.ordenDeVentaDraft.totalAmount = Math.floor(this.cliente.totalAmout);
                    break;
                case "CEILING":
                    this.ordenDeVentaDraft.totalAmount = Math.ceil(this.cliente.totalAmout);
                    break;
                default:
                    this.ordenDeVentaDraft.totalAmount = trunc_number(this.cliente.totalAmout, this.configuracionDecimales.defaultCalculationsDecimals);
                    break;
            }
            this.ordenDeVentaDraft.status = "0";
            this.ordenDeVentaDraft.postedBy = localStorage.getItem("LAST_LOGIN_ID");
            this.ordenDeVentaDraft.image1 = null;
            this.ordenDeVentaDraft.image2 = null;
            this.ordenDeVentaDraft.image3 =
                this.cliente.fotoDeInicioDeVisita !== ""
                    ? this.cliente.fotoDeInicioDeVisita
                    : null;
            this.ordenDeVentaDraft.deviceBatteryFactor = gBatteryLevel;
            this.ordenDeVentaDraft.voidDatetime = null;
            this.ordenDeVentaDraft.voidReason = null;
            this.ordenDeVentaDraft.voidNotes = null;
            this.ordenDeVentaDraft.voided = null;
            this.ordenDeVentaDraft.closedRouteDatetime = null;
            this.ordenDeVentaDraft.datetime = null;
            this.ordenDeVentaDraft.isActiveRoute = 1;
            this.ordenDeVentaDraft.gpsExpected = this.cliente.gps;
            this.ordenDeVentaDraft.isPosted = 2;
            this.ordenDeVentaDraft.deliveryDate = this.cliente.deliveryDate;
            this.ordenDeVentaDraft.isParent = true;
            this.ordenDeVentaDraft.timesPrinted = 0;
            this.ordenDeVentaDraft.sinc = 0;
            this.ordenDeVentaDraft.isPostedVoid = 2;
            this.ordenDeVentaDraft.isVoid = false;
            this.ordenDeVentaDraft.salesOrderType = this.tarea.salesOrderType;
            this.ordenDeVentaDraft.discount = trunc_number(this.cliente.appliedDiscount, this.configuracionDecimales.defaultCalculationsDecimals);
            this.ordenDeVentaDraft.discountApplied = trunc_number(this.cliente.discount, this.configuracionDecimales.defaultCalculationsDecimals);
            this.ordenDeVentaDraft.taskId = this.tarea.taskId;
            this.ordenDeVentaDraft.isDraft = 1;
            this.ordenDeVentaDraft.isUpdated = 0;
            this.ordenDeVentaDraft.paymentTimesPrinted = null;
            this.ordenDeVentaDraft.paidToDate = 0;
            this.ordenDeVentaDraft.toBill = null;
            this.ordenDeVentaDraft.ordenDeVentaDetalle = [];
            this.listaDeSkuOrdenDeVenta.map(function (sku, index, array) {
                var ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                ordenDeVentaDetalle.salesOrderId = _this_1.ordenDeVentaDraft.salesOrderId;
                ordenDeVentaDetalle.sku = sku.sku;
                ordenDeVentaDetalle.lineSeq = index + 1;
                ordenDeVentaDetalle.qty = trunc_number(sku.qty, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                ordenDeVentaDetalle.price = trunc_number(sku.cost, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                switch (_this_1.configuracionDecimales.displayDecimalsRoundType) {
                    case "TRUNC":
                        ordenDeVentaDetalle.totalLine = format_number(sku.total, 0);
                        break;
                    case "ROUND":
                        ordenDeVentaDetalle.totalLine = Math.round(sku.total);
                        break;
                    case "FLOOR":
                        ordenDeVentaDetalle.totalLine = Math.floor(sku.total);
                        break;
                    case "CEILING":
                        ordenDeVentaDetalle.totalLine = Math.ceil(sku.total);
                        break;
                    default:
                        ordenDeVentaDetalle.totalLine = trunc_number(sku.total, _this_1.configuracionDecimales.defaultCalculationsDecimals);
                        break;
                }
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
                ordenDeVentaDetalle.docSerie = _this_1.ordenDeVentaDraft.docSerie;
                ordenDeVentaDetalle.docNum = _this_1.ordenDeVentaDraft.docNum;
                _this_1.ordenDeVentaDraft.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
            });
            callback(this.ordenDeVentaDraft);
        }
        catch (err) {
            notify("Error al preparar ordenDeVenta: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.usuarioDeseaCancelarDraft = function () {
        var _this_1 = this;
        try {
            if (this.tarea.hasDraft) {
                navigator.notification.confirm("Desea cancelar la venta como borrador?", function (buttonIndex) {
                    if (buttonIndex === 2) {
                        _this_1.ordenDeVentaServicio.cancelarOCompletarOrdenDeVentaDraft(_this_1.ordenDeVentaDraft, function () {
                            _this_1.tarea.hasDraft = false;
                            _this_1.ordenDeVentaDraft = new OrdenDeVenta();
                            _this_1.ordenDeVentaDraft.ordenDeVentaDetalle = [];
                            EnviarData();
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    }
                }, "Sonda® " + SondaVersion, "No,Si");
            }
        }
        catch (err) {
            notify("Error al cancelar el borrador: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.validarFecha = function (callback) {
        if (this.tarea.hasDraft) {
            var uiFechaEntrega = $("#FechaEntrega");
            var fecha = new Date();
            var fechaHoy = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
            var fechaActual = new Date(uiFechaEntrega.val());
            if (fechaHoy > fechaActual) {
                notify("La fecha tiene que ser mayor o igual al de hoy.");
            }
            else if (this.estadoDeTareaAnterior === TareaEstado.Asignada &&
                this.tarea.hasDraft) {
                if (this.obtenerFechaFormato(uiFechaEntrega.val(), false) ===
                    this.obtenerFechaFormato(this.ordenDeVentaDraft.deliveryDate.toString(), this.ordenDeVentaDraft.salesOrderId > 0)) {
                    notify("La fecha de entrega es la misma con que se guardo en el borrador.");
                }
                else {
                    callback();
                }
            }
            else {
                callback();
            }
            uiFechaEntrega = null;
        }
        else {
            callback();
        }
    };
    DocumentoVentaControlador.prototype.usuarioDeseaGuardarDraft = function () {
        var _this_1 = this;
        try {
            var _este = this;
            if (this.listaDeSkuOrdenDeVenta.length >= 1) {
                this.validarFecha(function () {
                    var uiFechaEntrega = $("#FechaEntrega");
                    _this_1.cliente.deliveryDate = uiFechaEntrega.val();
                    uiFechaEntrega = null;
                    _this_1.calcularDescuento(_this_1, function () {
                        navigator.notification.confirm("Desea guardar la venta como borrador?", function (buttonIndex) {
                            if (buttonIndex === 2) {
                                var finalizarProcesoDraft_1 = function () {
                                    var encuestasAEjecutarEnFinalizacionDeTarea = _este.encuestaServicio.filtrarEncuestasPorDisparador(_este.tarea.microsurveys, DisparadorDeEncuesta.FinDeTarea);
                                    if (encuestasAEjecutarEnFinalizacionDeTarea &&
                                        encuestasAEjecutarEnFinalizacionDeTarea.length > 0) {
                                        _este.encuestaServicio.procesarEncuestasDeCliente(encuestasAEjecutarEnFinalizacionDeTarea, 0, _este.tarea.hasDraft, function () {
                                            $.mobile.changePage("#pickupplan_page", {
                                                transition: "flow",
                                                reverse: true,
                                                showLoadMsg: false
                                            });
                                            EnviarData();
                                        }, function (error) {
                                            DesBloquearPantalla();
                                            notify(error.mensaje);
                                            my_dialog("", "", "close");
                                            RegresarAPaginaAnterior("pickupplan_page");
                                        });
                                        BloquearPantalla();
                                        var timeOut_2 = setTimeout(function () {
                                            $.mobile.changePage("#UiSurveyPage", {
                                                transition: "flow",
                                                reverse: true,
                                                showLoadMsg: false
                                            });
                                            clearTimeout(timeOut_2);
                                        }, 1000);
                                    }
                                    else {
                                        $.mobile.changePage("#pickupplan_page", {
                                            transition: "flow",
                                            reverse: true,
                                            showLoadMsg: false
                                        });
                                        EnviarData();
                                    }
                                };
                                if (_this_1.tarea.hasDraft) {
                                    _this_1.prepararOrdenDeVentaParaActualizar(function (ordenDeVenta) {
                                        _this_1.ordenDeVentaServicio.actualizarOrdenDeVentaDraft(ordenDeVenta, function () {
                                            finalizarProcesoDraft_1();
                                        }, function (resultado) {
                                            notify(resultado.mensaje);
                                        });
                                    });
                                }
                                else {
                                    _this_1.prepararOrdenDeVentaParaInsertar(function (ordenDeVenta) {
                                        _this_1.ordenDeVentaServicio.insertarOrdenDeVentaDraft(ordenDeVenta, function () {
                                            finalizarProcesoDraft_1();
                                        }, function (resultado) {
                                            notify(resultado.mensaje);
                                        });
                                    });
                                }
                            }
                        }, "Sonda® " + SondaVersion, "No,Si");
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                });
            }
            else {
                notify("No tiene ningun producto.");
            }
        }
        catch (err) {
            notify("Error al guardar draft: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.ordenDeVentaDraftEntregado = function (mensaje, subcriber) {
        var dvc = subcriber;
        dvc.ordenDeVentaDraft = mensaje.ordenDeVenta;
        dvc.seCargoDatosDraft = false;
        dvc.listaDeSkuOrdenDeVenta = [];
        for (var i = 0; i < subcriber.ordenDeVentaDraft.ordenDeVentaDetalle.length; i++) {
            var detalleOrdenDeVentaDetalle = subcriber.ordenDeVentaDraft.ordenDeVentaDetalle[i];
            var sku = new Sku();
            sku.sku = detalleOrdenDeVentaDetalle.sku;
            sku.skuName = detalleOrdenDeVentaDetalle.skuName;
            sku.qty = trunc_number(detalleOrdenDeVentaDetalle.qty, dvc.configuracionDecimales.defaultCalculationsDecimals);
            sku.total = trunc_number(detalleOrdenDeVentaDetalle.totalLine, dvc.configuracionDecimales.defaultCalculationsDecimals);
            sku.cost = trunc_number(detalleOrdenDeVentaDetalle.price, dvc.configuracionDecimales.defaultCalculationsDecimals);
            sku.codePackUnit = detalleOrdenDeVentaDetalle.codePackUnit;
            sku.available = trunc_number(detalleOrdenDeVentaDetalle.available, dvc.configuracionDecimales.defaultCalculationsDecimals);
            subcriber.listaDeSkuOrdenDeVenta.push(sku);
        }
    };
    DocumentoVentaControlador.prototype.obtenerConfiguracionDeDecimales = function () {
        var _this_1 = this;
        this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this_1.configuracionDecimales = decimales;
        }, function (operacion) {
            notify(operacion.mensaje);
        });
    };
    DocumentoVentaControlador.prototype.usuarioDeseaVerInformacionDeOrdenDeVenta = function () {
        this.limpiarListaDeSku(function () {
            $.mobile.changePage("#pos_skus_inofrmation_page", {
                transition: "pop",
                reverse: true,
                showLoadMsg: false
            });
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    DocumentoVentaControlador.prototype.usuarioDeseaRetornarAOrdenDeVenta = function () {
        $.mobile.changePage("pos_skus_page", {
            transition: "pop",
            reverse: true,
            showLoadMsg: false,
            data: {
                cliente: this.cliente,
                tarea: this.tarea,
                configuracionDecimales: this.configuracionDecimales,
                esPrimeraVez: this.esPrimeraVez
            }
        });
    };
    DocumentoVentaControlador.prototype.usuarioDeseaModificarCliente = function () {
        this.cliente.origen = "DocumenoDeVentaControlador";
        $.mobile.changePage("UiPageCustomerInfo", {
            transition: "pop",
            reverse: true,
            showLoadMsg: false,
            data: {
                cliente: this.cliente,
                tarea: this.tarea,
                configuracionDecimales: this.configuracionDecimales,
                esPrimeraVez: this.esPrimeraVez
            }
        });
    };
    DocumentoVentaControlador.prototype.publicarCargarPorPrimeraVezListaSkuMensaje = function () {
        var msg = new CargarPorPrimeraVezListaSkuMensaje(this);
        this.mensajero.publish(msg, getType(CargarPorPrimeraVezListaSkuMensaje));
    };
    DocumentoVentaControlador.prototype.mostrarCaracteresRestantes = function () {
        var uiComentarioDeOrdenDeVenta = $("#UiComentarioDeOrdenDeVenta");
        var uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = $("#UiCaracteresRestantesDelComentarioDeDocumentoDeVenta");
        var caracteresRestantes = 250 - uiComentarioDeOrdenDeVenta.val().length;
        uiCaracteresRestantesDelComentarioDeDocumentoDeVenta.html(caracteresRestantes + " Caracteres restantes");
        uiComentarioDeOrdenDeVenta = null;
        uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = null;
    };
    DocumentoVentaControlador.prototype.limpiarComentario = function () {
        var uiComentarioDeOrdenDeVenta = $("#UiComentarioDeOrdenDeVenta");
        uiComentarioDeOrdenDeVenta.val("");
        uiComentarioDeOrdenDeVenta = null;
        var uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = $("#UiCaracteresRestantesDelComentarioDeDocumentoDeVenta");
        uiCaracteresRestantesDelComentarioDeDocumentoDeVenta.html("250 Caracteres restantes");
        uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = null;
    };
    DocumentoVentaControlador.prototype.obtenerBonificacionPorUnidad = function (sku, listaDeSkuABonificar) {
        try {
            if (sku.qty !== 0) {
                this.listaDeSkuParaBonificacion.map(function (boniSku) {
                    if (sku.sku === boniSku.parentCodeSku &&
                        sku.codePackUnit === boniSku.parentCodePackUnit) {
                        listaDeSkuABonificar.push(boniSku);
                    }
                });
            }
        }
        catch (err) {
            notify("Error al obtener bonificacion por unidad: " + err.message);
        }
    };
    DocumentoVentaControlador.prototype.obtenerDescuentos = function (total, callback) {
        var _this_1 = this;
        this.descuentoServicio.obtenerDescuentoPorMontoGeneral(this.cliente, total, function (descuentoPorMontoGeneral) {
            var resultadoDePromoHistorico = _this_1
                .listaHistoricoDePromos.find(function (promo) {
                return promo.promoId === descuentoPorMontoGeneral.promoId;
            });
            if (resultadoDePromoHistorico) {
                var promoDeBonificacion = new Promo();
                promoDeBonificacion.promoId = descuentoPorMontoGeneral.promoId;
                promoDeBonificacion.promoName = descuentoPorMontoGeneral.promoName;
                promoDeBonificacion.frequency = descuentoPorMontoGeneral.frequency;
                _this_1.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico, function (aplicaPromo) {
                    if (aplicaPromo) {
                        _this_1.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
                    }
                    else {
                        _this_1.descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
                    }
                    callback();
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }
            else {
                _this_1.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
                callback();
            }
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    DocumentoVentaControlador.prototype.obtenerTotalDeOrdenDeVenta = function (descuentoDelCliente, listaDeSku) {
        var _this_1 = this;
        var total = 0;
        listaDeSku.map(function (skuParaTotal) {
            var totalPaquete = skuParaTotal.total;
            var descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
            var descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
            var resultadoDescuentoPorMontoGeneralYFamilia = _this_1
                .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
            });
            if (resultadoDescuentoPorMontoGeneralYFamilia) {
                descuentoPorMontoGeneralYFamilia = resultadoDescuentoPorMontoGeneralYFamilia;
            }
            var resultadoDescuentoPorFamiliaYTipoPago = _this_1
                .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
            });
            if (resultadoDescuentoPorFamiliaYTipoPago) {
                descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
            }
            totalPaquete = _this_1.descuentoServicio.aplicarLosDescuentos(skuParaTotal, skuParaTotal.isUniqueDiscountScale, _this_1.listaDeOrdenAplicarDescuentos, descuentoPorMontoGeneralYFamilia, descuentoPorFamiliaYTipoPago);
            total += totalPaquete;
            totalPaquete = null;
        });
        total =
            descuentoDelCliente !== 0
                ? total - (descuentoDelCliente * total) / 100
                : total;
        return total;
    };
    DocumentoVentaControlador.prototype.obtenerTotalParaEnviar = function (listaDeSku, sku) {
        var _this_1 = this;
        var total = 0;
        listaDeSku.map(function (skuParaTotal) {
            var totalPaquete = skuParaTotal.total;
            var descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
            var descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
            var resultadoDescuentoPorMontoGeneralYFamilia = _this_1
                .listaDeDescuentoPorMontoGeneralYFamilia.find(function (descuentoABuscar) {
                return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
            });
            if (resultadoDescuentoPorMontoGeneralYFamilia) {
                descuentoPorMontoGeneralYFamilia = resultadoDescuentoPorMontoGeneralYFamilia;
            }
            var resultadoDescuentoPorFamiliaYTipoPago = _this_1
                .listaDeDescuentoPorFamiliaYTipoPago.find(function (descuentoABuscar) {
                return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
            });
            if (resultadoDescuentoPorFamiliaYTipoPago) {
                descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
            }
            totalPaquete = _this_1.descuentoServicio.aplicarLosDescuentos(skuParaTotal, skuParaTotal.isUniqueDiscountScale, _this_1.listaDeOrdenAplicarDescuentos, descuentoPorMontoGeneralYFamilia, descuentoPorFamiliaYTipoPago);
            total += totalPaquete;
            totalPaquete = null;
        });
        return total;
    };
    DocumentoVentaControlador.prototype.establecerFotoInicio = function (fotografia) {
        this.cliente.fotoDeInicioDeVisita = fotografia;
    };
    DocumentoVentaControlador.prototype.validarFotoYTareaSinGestion = function (_this) {
        _this.validarReglaDeTomarFotoAlInicio(_this, function (fotografia, validarFotografia) {
            if (validarFotografia) {
                _this.permiterRegregarPantallaAnterior = false;
                if (fotografia === "") {
                    _this.finalizarTareaSinGestion(function () {
                        _this.validarFotoYTareaSinGestion(_this);
                    });
                    return;
                }
                else {
                    _this.establecerFotoInicio(fotografia);
                }
            }
            else {
                _this.permiterRegregarPantallaAnterior = true;
            }
            _this.validarSiModificaDmg(_this, function () {
                _this.cargarTarea();
                _this.cargarListaSku();
                _this.establecerTotalOrdenDeVenta(_this);
            });
        });
    };
    DocumentoVentaControlador.prototype.validarReglaDeTomarFotoAlInicio = function (_this, callback) {
        try {
            if (_this.cliente.fotoDeInicioDeVisita === undefined ||
                _this.cliente.fotoDeInicioDeVisita === "") {
                _this.tareaServicio.obtenerRegla("TomarFotoAlInicio", function (listaDeReglas) {
                    if (listaDeReglas.length > 0 &&
                        listaDeReglas[0].enabled.toUpperCase() === "SI") {
                        TomarFoto(function (fotografia) {
                            callback(fotografia, true);
                        }, function (resultado) {
                            callback("", true);
                        });
                    }
                    else {
                        callback("", false);
                    }
                }, function (resultado) {
                    notify(resultado.mensaje);
                    my_dialog("", "", "closed");
                });
            }
            else {
                callback("", false);
            }
        }
        catch (ex) {
            notify("Error al validar la regla tomar foto al inicio: " + ex.message);
        }
    };
    DocumentoVentaControlador.prototype.obtenerBonificacionesPorComboEnListado = function (callback) {
        var _this_1 = this;
        this.bonoServicio.obtenerBonificacionesPorCombo(this.cliente.bonoPorCombos, this.listaDeSkuOrdenDeVenta, function (bonificacionPorCombosEnListaDeSkus) {
            _this_1.listaDeSkuParaBonificacionDeCombo = bonificacionPorCombosEnListaDeSkus;
            callback();
        }, function (resultado) {
            notify("Error al calcular bonificaciones por combo: " + resultado.mensaje);
            callback();
        });
    };
    DocumentoVentaControlador.prototype.obtenerCombo = function (comboId) {
        for (var i = 0; i < this.listaDeSkuParaBonificacionDeCombo.length; i++) {
            if (this.listaDeSkuParaBonificacionDeCombo[i].comboId === comboId) {
                this.publicarCombo(i);
                $.mobile.changePage("UiPageBonusByCombo", {
                    transition: "pop",
                    reverse: true,
                    showLoadMsg: false,
                    data: {
                        listaDeSkuBonificacionPorCombo: this
                            .listaDeSkuParaBonificacionDeCombo[i],
                        indice: i
                    }
                });
                break;
            }
        }
    };
    DocumentoVentaControlador.prototype.validarConfiguracionDeBonificacionPorCombos = function (callback, errCallback) {
        try {
            var estanConfiguradosLosCombos_1 = true;
            this.listaDeSkuParaBonificacionDeCombo.map(function (bono) {
                if (estanConfiguradosLosCombos_1 &&
                    bono.bonusSubType ===
                        SubTipoDeBonificacionPorCombo.Unica.toString() &&
                    bono.isConfig === false &&
                    bono.skusDeBonoPorCombo.length > 1) {
                    estanConfiguradosLosCombos_1 = false;
                    errCallback({
                        codigo: -1,
                        mensaje: "No se han configurado todos los combos"
                    });
                }
            });
            if (estanConfiguradosLosCombos_1) {
                callback();
            }
        }
        catch (e) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar combos del pedido: " + e.message
            });
        }
    };
    DocumentoVentaControlador.prototype.validarSiModificaDmg = function (_this, callback) {
        try {
            _this.tareaServicio.obtenerRegla("ModificacionDescuentoPorMontoGeneralMovil", function (listaDeReglas) {
                _this.usuarioPuedeModificarDescuento = false;
                if (listaDeReglas.length >= 1) {
                    if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
                        _this.usuarioPuedeModificarDescuento = true;
                    }
                }
                callback();
            }, function (resultado) {
                notify(resultado.mensaje);
                _this.usuarioPuedeModificarDescuento = false;
            });
        }
        catch (err) {
            notify("Error al validar si modifica DMG: " + err.message);
            _this.usuarioPuedeModificarDescuento = false;
        }
    };
    DocumentoVentaControlador.prototype.cargarPantalla = function (_this) {
        _this.bonoServicio.validarSiModificaBonificacionPorCombo(function (puedeModificar) {
            _this.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
            _this.esPrimerMensajeDeDescuento = true;
            _this.establecerTotalOrdenDeVenta(_this);
        }, function (resultado) {
            _this.usuarioPuedeModificarBonificacionDeCombo = false;
            notify("Error al validar si puede modificar la bonificacion por combo: " +
                resultado.mensaje);
        });
    };
    DocumentoVentaControlador.prototype.limpiarListas = function (_this, callback) {
        if (_this.esPrimeraVez) {
            if (!_this.tarea.hasDraft) {
                _this.listaDeSkuOrdenDeVenta.length = 0;
                _this.listaDeSkuParaBonificacion.length = 0;
                _this.listaDeSkuParaBonificacionDeCombo.length = 0;
                _this.ordenDeVentaDraft = new OrdenDeVenta();
            }
            _this.cargarTarea();
            _this.esPrimeraVez = false;
            callback();
        }
        else {
            callback();
        }
    };
    DocumentoVentaControlador.prototype.cargarBonificacionesPorMontoGeneral = function (callback, errCallback) {
        var _this_1 = this;
        try {
            var totalOriginalOrdenDeVenta = this.obtenerTotalDeOrdenDeVenta(this.cliente.appliedDiscount, this.listaDeSkuOrdenDeVenta);
            this.bonoServicio.obtenerBonificacionPorMontoGeneral(this.cliente, totalOriginalOrdenDeVenta, function (listaDeBonificacionesPorMontoGeneral) {
                _this_1.validarSiAplicaLaBonificacionesPorMontoGeneral(listaDeBonificacionesPorMontoGeneral, 0, _this_1.listaHistoricoDePromos, function (listaDeBonificacionesParaAplicar) {
                    _this_1.listaDeBonificacionesPorMontoGeneral = new Array();
                    if (listaDeBonificacionesParaAplicar.length > 0) {
                        _this_1.listaDeBonificacionesPorMontoGeneral = listaDeBonificacionesParaAplicar;
                        var liParaAgregar_1 = new Array();
                        _this_1.listaDeBonificacionesPorMontoGeneral.map(function (bono) {
                            liParaAgregar_1.push("<li esCombo='0' style='display: flex;border-bottom: 2px solid #F3F781; border-top: 2px solid #F3F781; border-left: 2px solid #F3F781; border-right: 2px solid #F3F781;'> ");
                            liParaAgregar_1.push("<p><span style='display:inline-block;word-wrap:break-word' class='small- roboto'>Bonificaci\u00F3n: " + bono.skuNameBonus + "</span><br/> ");
                            liParaAgregar_1.push("<span class='small-roboto'>Cod. SKU: " + bono.codeSkuBonus + " UM.: " + bono.codePackUnitBonus + " Cant.: " + bono.bonusQty + "</span><br/> ");
                            liParaAgregar_1.push("</p></li> ");
                        });
                        var posSkuPageListview = $("#pos_skus_page_listview");
                        posSkuPageListview.append(liParaAgregar_1.join(""));
                        posSkuPageListview.listview("refresh");
                        posSkuPageListview = null;
                        liParaAgregar_1 = null;
                        callback();
                    }
                    else {
                        callback();
                    }
                }, function (resultado) {
                    errCallback(resultado);
                });
            }, function (resultado) {
                errCallback(resultado);
            });
            totalOriginalOrdenDeVenta = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al cargar bonificaciones por monto general: " + ex.message
            });
        }
    };
    DocumentoVentaControlador.prototype.validarSiAplicaLaBonificacionesPorMontoGeneral = function (listaDeBonificaciones, indiceDeListaDeBonificacion, listaHistoricoDePromos, callBack, errCallback) {
        var _this_1 = this;
        try {
            if (listaHistoricoDePromos.length > 0) {
                if (this.listaDeBonificacionesTerminoDeIterar(listaDeBonificaciones, indiceDeListaDeBonificacion)) {
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
                            _this_1.validarSiAplicaLaBonificacionesPorMontoGeneral(listaDeBonificaciones, indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0), listaHistoricoDePromos, function (listaDeBonificaciones) {
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
                        this.validarSiAplicaLaBonificacionesPorMontoGeneral(listaDeBonificaciones, indiceDeListaDeBonificacion + 1, listaHistoricoDePromos, function (listaDeDescuento) {
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
                mensaje: "Error al validar la si aplica la bonificacion por monto general: " + ex.message
            });
        }
    };
    DocumentoVentaControlador.prototype.listaDeBonificacionesTerminoDeIterar = function (listaDeBonificaciones, indiceDeListaDeBonificacion) {
        return (listaDeBonificaciones.length > 0 &&
            listaDeBonificaciones.length > indiceDeListaDeBonificacion);
    };
    DocumentoVentaControlador.prototype.obtenerDescuentosPorMontoYFamiliaYTipoPago = function (callback, errCallback) {
        var _this_1 = this;
        try {
            this.obtenerHistoricodePromo(function () {
                _this_1.obtenerOrdenParaAplicarDescuentos(function () {
                    var listaDePaquetes = [];
                    _this_1.descuentoServicio.obtenerDescuentos(listaDePaquetes, _this_1.listaDeSkuOrdenDeVenta, _this_1.cliente, _this_1.listaHistoricoDePromos, function (listaDescuentoPorMontoGeneralYFamilia, listaDescuentoPorFamiliaYTipoPago) {
                        _this_1.listaDeDescuentoPorMontoGeneralYFamilia = listaDescuentoPorMontoGeneralYFamilia;
                        _this_1.listaDeDescuentoPorFamiliaYTipoPago = listaDescuentoPorFamiliaYTipoPago;
                        callback();
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }, function (resultado) {
                    errCallback(resultado);
                });
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al cargar bonificaciones por monto general: " + ex.message
            });
        }
    };
    DocumentoVentaControlador.prototype.obtenerHistoricodePromo = function (callBack, errCallback) {
        var _this_1 = this;
        try {
            this.promoServicio.obtenerHistoricoDePromosParaCliente(this.cliente, function (listaHistoricoDePromos) {
                _this_1.listaHistoricoDePromos = listaHistoricoDePromos;
                callBack();
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
    DocumentoVentaControlador.prototype.obtenerOrdenParaAplicarDescuentos = function (callback, errCallback) {
        var _this_1 = this;
        try {
            this.descuentoServicio.obtenerOrdeParaAplicarDescuentos(function (listaDeOrdenAplicarDescuentos) {
                _this_1.listaDeOrdenAplicarDescuentos = listaDeOrdenAplicarDescuentos;
                callback();
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener orden para aplicar los descuentos: " + ex.message
            });
        }
    };
    DocumentoVentaControlador.prototype.prepararReglaDeValidacionDeLimiteDeCredito = function () {
        var _this_1 = this;
        ObtenerReglas("LimiteDeCreditoCero", function (reglas) {
            if (reglas && reglas.length) {
                var regla = reglas.item(0);
                _this_1.aplicaReglaDeValidacionDeLimiteDeCredito =
                    regla && regla.ENABLED && regla.ENABLED.toUpperCase() == "SI";
            }
            else {
                _this_1.aplicaReglaDeValidacionDeLimiteDeCredito = false;
            }
        }, function (error) {
            notify("Error al verificar si se aplica validaci\u00F3n de limite de cr\u00E9dito. " + error);
        });
    };
    return DocumentoVentaControlador;
}());
//# sourceMappingURL=DocumentoVentaControlador.js.map