var DenominacionSkuControlador = (function () {
    function DenominacionSkuControlador(mensajero) {
        this.mensajero = mensajero;
        this.sku = new Sku();
        this.paquetes = [];
        this.cliente = new Cliente();
        this.tarea = new Tarea();
        this.configuracionDeDecimales = new ManejoDeDecimales();
        this.paqueteSeleccionadoActual = new Paquete();
        this.descuentoActual = new DescuentoPorEscalaSku();
        this.estaAgregandoSku = false;
        this.listaDeSku = [];
        this.listaDeSkuDeBonificacion = [];
        this.listaDeBonificaciones = [];
        this.usuarioPuedeModificarBonificacion = true;
        this.listaDeDescuento = [];
        this.usuarioPuedeModificarDescuentos = false;
        this.estaValidandoElDescuento = false;
        this.listaHistoricoDePromos = [];
        this.descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
        this.usuarioEstaRegresandoAPantallaAnterior = false;
        this.descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
        this.descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
        this.listaDeSkuOrdenDeVenta = [];
        this.listaDeOrdenAplicarDescuentos = [];
        this.usuarioPuedeModificarPrecioDeProducto = false;
        this.paqueteServicio = new PaqueteServicio();
        this.historicoDeArticuloServicio = new HistoricoDeArticuloServicio();
        this.precioSkuServicio = new PrecioSkuServicio();
        this.tareaServicio = new TareaServcio();
        this.clienteServicio = new ClienteServicio();
        this.bonoServicio = new BonoServicio();
        this.ventasPorMultiploServicio = new VentasPorMultiploServicio();
        this.descuentoServicio = new DescuentoServicio();
        this.promoServicio = new PromoServicio();
        this.precioEspecialServicio = new PrecioEspecialServicio();
    }
    DenominacionSkuControlador.prototype.delegarDenominacionSkuControlador = function () {
        var este = this;
        document.addEventListener("backbutton", function () {
            este.usuarioEstaRegresandoAPantallaAnterior = true;
            este.mostrarPantallaAnterior();
        }, true);
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "skucant_page") {
                este.cliente = data.options.data.cliente;
                este.tarea = data.options.data.tarea;
                este.sku = data.options.data.sku;
                este.estaAgregandoSku = data.options.data.estaAgregando;
                este.configuracionDeDecimales =
                    data.options.data.configuracionDecimales;
                este.listaDeSku = (JSON.parse(JSON.stringify(data.options.data.listaSku)));
                este.listaDeSkuDeBonificacion = (JSON.parse(JSON.stringify(data.options.data.listaDeSkuParaBonificacion)));
                este.usuarioEstaRegresandoAPantallaAnterior = false;
                este.listaDeSkuOrdenDeVenta = data.options.data.listaDeSkuOrdenDeVenta;
                este.cargarPantalla();
                $.mobile.changePage("#skucant_page");
            }
        });
        $("#UiBotonListadoDeUnidadesDeMedida").bind("touchstart", function () {
            este.usuarioSeleccionoPaquete();
        });
        $("#UiBotonAceptarCantidadSku").bind("touchstart", function () {
            BloquearPantalla();
            este.usuarioCambioCantidaDePaquete(function () {
                este.estaValidandoElDescuento = true;
                este.validarBonificacionesIngresadas(function () {
                    este.validarIngresoDeDescuento(function (resultado) {
                        notify(resultado.mensaje);
                        DesBloquearPantalla();
                        este.estaValidandoElDescuento = false;
                    }, function () {
                        este.estaValidandoElDescuento = false;
                        este.usuarioDeseaAceptarElSku();
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                    DesBloquearPantalla();
                });
            });
        });
        $("#UiTextoCantidadUnidadMedida").on("focusout", function () {
            if (!este.usuarioEstaRegresandoAPantallaAnterior) {
                if (!este.estaValidandoElDescuento) {
                    este.usuarioCambioCantidaDePaquete(function () {
                        este.validarBonificacionesIngresadas(function () {
                            este.validarIngresoDeDescuento(function (resultado) {
                                notify(resultado.mensaje);
                            });
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    });
                }
            }
        });
        $("#skucant_page").bind("swiperight", function () {
            este.usuarioDeseaVerResumenDelSku();
        });
        $("#UiTextoDescuentoSku").on("focusout", function () {
            este.validarIngresoDeDescuento(function () {
                DesBloquearPantalla();
            });
        });
        $("#UiTextoCantidadUnidadMedida").on("keypress", function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                var UiBotonAceptarCantidadSku = $("#UiBotonAceptarCantidadSku");
                UiBotonAceptarCantidadSku.focus();
                UiBotonAceptarCantidadSku.trigger("touchstart");
                UiBotonAceptarCantidadSku = null;
            }
        });
        $("#UiTxtPrecioNegociadoConCliente").on("focusout", function (e) {
            e.preventDefault();
            if (!este.usuarioEstaRegresandoAPantallaAnterior) {
                if (!este.estaValidandoElDescuento) {
                    var precioNegociadoConCliente_1 = $("#UiTxtPrecioNegociadoConCliente");
                    if (precioNegociadoConCliente_1.val() === "" ||
                        isNaN(precioNegociadoConCliente_1.val()) ||
                        parseFloat(precioNegociadoConCliente_1.val()) === 0) {
                        notify("Debe ingresar un monto valido.");
                        precioNegociadoConCliente_1.focus();
                        return false;
                    }
                    este.obtenerPaqueteSeleccionado(function (paqueteSeleccionado) {
                        if (paqueteSeleccionado.originalPrice >
                            parseFloat(precioNegociadoConCliente_1.val())) {
                            notify("El precio negociado no puede ser menor a " + este.configuracionDeDecimales.currencySymbol + paqueteSeleccionado.originalPrice);
                            return;
                        }
                        este.usuarioCambioCantidaDePaquete(function () {
                            este.validarBonificacionesIngresadas(function () {
                                este.validarIngresoDeDescuento(function (resultado) {
                                    notify(resultado.mensaje);
                                });
                            }, function (resultado) {
                                notify(resultado.mensaje);
                            });
                        });
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
            }
        });
    };
    DenominacionSkuControlador.prototype.cargarPantalla = function () {
        var _this = this;
        try {
            my_dialog("Espere", "Preparando información, por favor espere...", "open");
            var uiEtiquetaCodigoYNombreDeSku = $("#UiEtiquetaCodigoYNombreDeSku");
            uiEtiquetaCodigoYNombreDeSku.text(this.sku.sku + "/" + this.sku.skuDescription);
            uiEtiquetaCodigoYNombreDeSku = null;
            this.obtenerAutorizacionDeModificacionDePrecioDeProducto(function () {
                _this.generarListadoDePaquetes(function () {
                    _this.obtenerHistoricodePromo(function () {
                        _this.obtenerOrdenParaAplicarDescuentos(function () {
                            _this.cargarBonificaciones(function () {
                                _this.cargarDescuentos(function () {
                                    _this.cargarPreciosEspeciales(function () {
                                        if (_this.estaAgregandoSku) {
                                            _this.seleccionarPrimerPaquete();
                                            my_dialog("", "", "close");
                                        }
                                        else {
                                            _this.cargarListaSkuAPaquetes(function () {
                                                _this.procesarPaquetes(function (paquetes) {
                                                    _this.paquetes = paquetes;
                                                    _this.paquetes.forEach(function (paquete) {
                                                        paquete.codeFamily = _this.sku.codeFamilySku;
                                                    });
                                                    _this.cargarListaDeSkuBonficadas(function () {
                                                        _this.obtenerBonificacionesDelPaqueteSeleccionado(function (listaBonificaciones) {
                                                            _this.cargarControlesBonificaciones(listaBonificaciones, function () {
                                                                _this.cargarControlesDeDescuento(function () {
                                                                    _this.obtenerTotalDePaquetesConDescuentoAplicados(function (total) {
                                                                        _this.tarea.salesOrderTotal -= total;
                                                                        _this.cargarDatosDelPaqueteSeleccionado(function () {
                                                                            my_dialog("", "", "close");
                                                                        });
                                                                    }, function (resultado) {
                                                                        my_dialog("", "", "close");
                                                                        notify(resultado.mensaje);
                                                                    });
                                                                }, function (resultado) {
                                                                    my_dialog("", "", "close");
                                                                    notify(resultado.mensaje);
                                                                });
                                                            }, function (resultado) {
                                                                notify(resultado.mensaje);
                                                            });
                                                        }, function (resultado) {
                                                            notify(resultado.mensaje);
                                                        });
                                                    }, function (resultado) {
                                                        my_dialog("", "", "close");
                                                        notify(resultado.mensaje);
                                                    });
                                                }, function (resultado) {
                                                    notify(resultado.mensaje);
                                                });
                                            }, function (resultado) {
                                                my_dialog("", "", "close");
                                                notify(resultado.mensaje);
                                            });
                                        }
                                    }, function (resultado) {
                                        my_dialog("", "", "close");
                                        notify(resultado.mensaje);
                                    });
                                }, function (resultado) {
                                    my_dialog("", "", "close");
                                    notify(resultado.mensaje);
                                });
                            }, function (resultado) {
                                my_dialog("", "", "close");
                                notify(resultado.mensaje);
                            });
                        }, function (resultado) {
                            my_dialog("", "", "close");
                            notify(resultado.mensaje);
                        });
                    }, function (resultado) {
                        my_dialog("", "", "close");
                        notify(resultado.mensaje);
                    });
                }, function (resultado) {
                    my_dialog("", "", "close");
                    notify(resultado.mensaje);
                });
            });
        }
        catch (ex) {
            my_dialog("", "", "close");
            notify("Error al cargar la pantalla: " + ex.message);
        }
    };
    DenominacionSkuControlador.prototype.generarListadoDePaquetes = function (callback, errCallback) {
        var _this = this;
        try {
            this.paqueteServicio.obtenerDenominacionesPorSku(this.sku, this.configuracionDeDecimales, this.cliente, true, function (paquetes) {
                _this.historicoDeArticuloServicio.colocarSugerenciaDeVentaAPaquetes(TIpoDeDocumento.PreVenta, _this.cliente, _this.sku, paquetes, _this.configuracionDeDecimales, function (paquetesSugeridos) {
                    _this.paquetes = paquetesSugeridos;
                    _this.paquetes.forEach(function (paquete) {
                        paquete.codeFamily = _this.sku.codeFamilySku;
                    });
                    _this.procesarPaquetes(function (paquetes) {
                        _this.paquetes = paquetes.filter(function (paquete) {
                            return paquete.price !== -1;
                        });
                        _this.limpiarControles(function () {
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
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al generar listado de paquetes: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.procesarPaquetes = function (callback, errCallback) {
        this.precioSkuServicio.obtenerPreciosDePaquetes(this.cliente, this.sku, this.paquetes, this.configuracionDeDecimales, function (paquetes) {
            callback(paquetes);
        }, function (resultado) {
            errCallback({ codigo: -1, mensaje: resultado.mensaje });
        });
    };
    DenominacionSkuControlador.prototype.limpiarControles = function (callback, errCallback) {
        try {
            var uiTotalCantidadSkus = $("#UiTotalCantidadSkus");
            uiTotalCantidadSkus.text(DarFormatoAlMonto(format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)));
            uiTotalCantidadSkus = null;
            var uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
            uiTextoCantidadUnidadMedida.text("");
            uiTextoCantidadUnidadMedida = null;
            this.limpiarInformacionDeHistoricoDeSku();
            var uiEtiquetaDescuentoSkuMaximo = $("#UiEtiquetaDescuentoSkuMaximo");
            uiEtiquetaDescuentoSkuMaximo.text("Descuento 0%");
            uiEtiquetaDescuentoSkuMaximo = null;
            var uiTextoDescuentoSku = $("#UiTextoDescuentoSku");
            uiTextoDescuentoSku.text("");
            uiTextoDescuentoSku = null;
            var uiLiDescuentoSkuMaximo = $("#UiLiDescuentoSkuMaximo");
            uiLiDescuentoSkuMaximo.hide();
            uiLiDescuentoSkuMaximo = null;
            var uiEtiquetaPrecioUnidadMedida = $("#UiEtiquetaPrecioUnidadMedida");
            uiEtiquetaPrecioUnidadMedida.text("Precio: " + DarFormatoAlMonto(format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)));
            uiEtiquetaPrecioUnidadMedida = null;
            var uiEtiquetaTotalUnidadMedida = $("#UiEtiquetaTotalUnidadMedida");
            uiEtiquetaTotalUnidadMedida.text("Precio: " + DarFormatoAlMonto(format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)));
            uiEtiquetaTotalUnidadMedida = null;
            var uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
            uiEtiquetaTotalCdUnidadMedida.text("Total CD: " + DarFormatoAlMonto(format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)));
            uiEtiquetaTotalCdUnidadMedida.hide();
            uiEtiquetaTotalCdUnidadMedida = null;
            var uiListaDeBonificacionesUnidadMedida = $("#UiListaDeBonificacionesUnidadMedida");
            uiListaDeBonificacionesUnidadMedida.children().remove("li");
            uiListaDeBonificacionesUnidadMedida = null;
            var uiAcordionDeBonificacionesUnidadMedida = $("#UiAcordionDeBonificacionesUnidadMedida");
            uiAcordionDeBonificacionesUnidadMedida.hide();
            uiAcordionDeBonificacionesUnidadMedida = null;
            var uiEtiquetaUnidadesTotales = $("#UiEtiquetaCantidadesTotales");
            uiEtiquetaUnidadesTotales.text("Cantidad Total: 0");
            uiEtiquetaUnidadesTotales.css("display", "none");
            uiEtiquetaUnidadesTotales = null;
            var uiTxtPrecioNegociadoConCliente = $("#UiTxtPrecioNegociadoConCliente");
            uiTxtPrecioNegociadoConCliente.val(format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals));
            uiTxtPrecioNegociadoConCliente = null;
            callback();
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al limpiar los controles: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.seleccionarPrimerPaquete = function () {
        var _this = this;
        try {
            if (this.paquetes) {
                this.establecerPaqueteSeleccionado(this.paquetes[this.paquetes.length - 1].codePackUnit, function (resultado) {
                    notify(resultado.mensaje);
                }, function () {
                    _this.cargarDatosDelPaqueteSeleccionado();
                });
            }
        }
        catch (ex) {
            notify("Error al seleccionar el primer paquete: " + ex.message);
        }
    };
    DenominacionSkuControlador.prototype.cargarListaSkuAPaquetes = function (callback, errCallback) {
        var _this = this;
        try {
            this.paquetes.forEach(function (paquete) {
                var resultadoDeBusqueda = _this.listaDeSku.filter(function (sku) {
                    return sku.codePackUnit === paquete.codePackUnit;
                });
                if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
                    paquete.qty = resultadoDeBusqueda[0].qty;
                    paquete.appliedDiscount = resultadoDeBusqueda[0].appliedDiscount;
                    paquete.discountType = resultadoDeBusqueda[0].discountType;
                    if (paquete.codePackUnit ===
                        resultadoDeBusqueda[0].unidadMedidaSeleccionada) {
                        _this.establecerPaqueteSeleccionado(resultadoDeBusqueda[0].unidadMedidaSeleccionada, function (resultado) {
                            errCallback(resultado);
                        }, function () {
                            callback();
                        });
                    }
                }
                resultadoDeBusqueda = null;
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al cargar listado de sku a paquetes: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.establecerPaqueteSeleccionado = function (codePackUnit, errCallback, callback) {
        var _this = this;
        try {
            this.sku.unidadMedidaSeleccionada = codePackUnit;
            this.paqueteSeleccionadoActual.packUnit = codePackUnit === "" ? 0 : 1;
            this.paqueteSeleccionadoActual.codePackUnit = codePackUnit;
            this.paqueteSeleccionadoActual.isSaleByMultiple = false;
            this.ventasPorMultiploServicio.verificarVentasPorMultiploSkuUm(this.cliente, this.sku, function (skuMultiplo) {
                if (skuMultiplo.apply) {
                    var promoParaValidar_1 = new Promo();
                    promoParaValidar_1.promoId = skuMultiplo.promoId;
                    promoParaValidar_1.promoName = skuMultiplo.promoName;
                    promoParaValidar_1.frequency = skuMultiplo.frequency;
                    var resultadoDePromoHistorico = _this
                        .listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === skuMultiplo.promoId;
                    });
                    if (resultadoDePromoHistorico) {
                        _this.promoServicio.validarSiAplicaPromo(promoParaValidar_1, resultadoDePromoHistorico, function (aplicaPromo) {
                            if (aplicaPromo) {
                                _this.paqueteSeleccionadoActual.isSaleByMultiple = true;
                                _this.paqueteSeleccionadoActual.multiple =
                                    skuMultiplo.multiple;
                                promoParaValidar_1.apply = true;
                                _this.paqueteSeleccionadoActual.promoVentaPorMultiplo = promoParaValidar_1;
                                promoParaValidar_1 = null;
                            }
                            else {
                                _this.paqueteSeleccionadoActual.promoVentaPorMultiplo = new Promo();
                            }
                            if (callback) {
                                callback();
                            }
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    }
                    else {
                        _this.paqueteSeleccionadoActual.isSaleByMultiple = true;
                        _this.paqueteSeleccionadoActual.multiple = skuMultiplo.multiple;
                        promoParaValidar_1.apply = true;
                        _this.paqueteSeleccionadoActual.promoVentaPorMultiplo = promoParaValidar_1;
                        if (callback) {
                            callback();
                        }
                    }
                }
                else {
                    if (callback) {
                        callback();
                    }
                }
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al establecer el paquete seleccionado: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.usuarioCambioCantidaDePaquete = function (callback) {
        var _this = this;
        try {
            var uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
            var cantidad = parseFloat(uiTextoCantidadUnidadMedida.val() === ""
                ? 0
                : uiTextoCantidadUnidadMedida.val());
            uiTextoCantidadUnidadMedida = null;
            if (cantidad > 0) {
                this.validarSiCambioLaCantidad(function (esIgualLaCantidad) {
                    if (esIgualLaCantidad &&
                        !_this.usuarioPuedeModificarPrecioDeProducto) {
                        if (callback) {
                            callback();
                        }
                    }
                    else {
                        _this.obtenerPaqueteSeleccionado(function (paquete) {
                            var uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
                            var cantidad = parseFloat(uiTextoCantidadUnidadMedida.val() === ""
                                ? 0
                                : uiTextoCantidadUnidadMedida.val());
                            uiTextoCantidadUnidadMedida = null;
                            paquete.qty =
                                cantidad *
                                    (_this.paqueteSeleccionadoActual.isSaleByMultiple
                                        ? _this.paqueteSeleccionadoActual.multiple
                                        : 1);
                            paquete.promoVentaPorMultiplo = _this.paqueteSeleccionadoActual.promoVentaPorMultiplo;
                            _this.validarSiCambioElPrecioDelPaquete(function () {
                                if (callback) {
                                    callback();
                                }
                            }, function (resultado) {
                                notify(resultado.mensaje);
                                DesBloquearPantalla();
                            });
                        }, function (resultado) {
                            notify(resultado.mensaje);
                            DesBloquearPantalla();
                        });
                    }
                }, function (resultado) {
                    notify(resultado.mensaje);
                    DesBloquearPantalla();
                });
            }
            else {
                notify("La cantidad tiene que ser mayor a cero.");
                DesBloquearPantalla();
            }
        }
        catch (ex) {
            notify("Error al cambar cantidad de paquete: " + ex.messages);
            DesBloquearPantalla();
        }
    };
    DenominacionSkuControlador.prototype.validarSiCambioElPrecioDelPaquete = function (callback, errCallback) {
        var _this = this;
        try {
            this.procesarPaquetes(function (paquetes) {
                _this.paquetes = paquetes;
                _this.paquetes.forEach(function (paquete) {
                    paquete.codeFamily = _this.sku.codeFamilySku;
                });
                _this.obtenerBonificacionesDelPaqueteSeleccionado(function (listaBonificaciones) {
                    _this.cargarControlesBonificaciones(listaBonificaciones, function () {
                        _this.cargarControlesDeDescuento(function () {
                            _this.validarIngresoDeDescuento(function (resultado) {
                                notify(resultado.mensaje);
                            }, function () {
                                _this.cargarDatosDelPaqueteSeleccionado(function () {
                                    callback();
                                });
                            });
                        }, function (resultado) {
                            notify(resultado.mensaje);
                        });
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar si cambio el precio del paquete: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.usuarioSeleccionoPaquete = function () {
        var _this = this;
        try {
            if (!this.paquetes) {
                return;
            }
            var listaDeUnidadesDeMedida_1 = [];
            this.paquetes.forEach(function (p) {
                return listaDeUnidadesDeMedida_1.push({
                    text: p.descriptionPackUnit,
                    value: p.codePackUnit
                });
            });
            var configOptions = {
                title: "Listado de Unidades de Medida",
                items: listaDeUnidadesDeMedida_1,
                doneButtonLabel: "Ok",
                cancelButtonLabel: "Cancelar"
            };
            ShowListPicker(configOptions, function (item) {
                _this.validarBonificacionesIngresadas(function () {
                    _this.validarIngresoDeDescuento(function (resultado) {
                        notify(resultado.mensaje);
                        DesBloquearPantalla();
                    }, function () {
                        _this.establecerPaqueteSeleccionado(item, function (resultado) {
                            notify(resultado.mensaje);
                        }, function () {
                            var uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
                            uiTextoCantidadUnidadMedida.focus();
                            uiTextoCantidadUnidadMedida.trigger("keyup");
                            uiTextoCantidadUnidadMedida = null;
                            _this.obtenerBonificacionesDelPaqueteSeleccionado(function (listaBonificaciones) {
                                _this.cargarControlesBonificaciones(listaBonificaciones, function () {
                                    _this.cargarControlesDeDescuento(function () {
                                        _this.cargarDatosDelPaqueteSeleccionado();
                                    }, function (resultado) {
                                        notify(resultado.mensaje);
                                        DesBloquearPantalla();
                                    });
                                }, function (resultado) {
                                    notify(resultado.mensaje);
                                });
                            }, function (resultado) {
                                notify(resultado.mensaje);
                            });
                        });
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            });
            configOptions = null;
            listaDeUnidadesDeMedida_1 = null;
        }
        catch (ex) {
            notify("Error al seleccionar la unidad de medida: " + ex.message);
        }
    };
    DenominacionSkuControlador.prototype.cargarDatosDelPaqueteSeleccionado = function (callback) {
        var _this = this;
        try {
            this.obtenerPaqueteSeleccionado(function (paquete) {
                var uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
                var cantidad = _this.paqueteSeleccionadoActual.isSaleByMultiple
                    ? paquete.qty / _this.paqueteSeleccionadoActual.multiple
                    : paquete.qty;
                uiTextoCantidadUnidadMedida.val(paquete.qty === 0
                    ? ""
                    : format_number(cantidad, _this.configuracionDeDecimales.defaultDisplayDecimals));
                if (paquete.lastQtySold && paquete.lastQtySold > 0) {
                    var uiEtiquetaFechaUltimaCompra = $("#UiEtiquetaFechaUltimaCompra");
                    uiEtiquetaFechaUltimaCompra.text("\u00DAltima compra: (" + (paquete.lastSaleDate && paquete.lastSaleDate.indexOf("T") !== -1
                        ? paquete.lastSaleDate.split("T")[0]
                        : "N/A") + ")");
                    uiEtiquetaFechaUltimaCompra = null;
                    var uiEtiquetaCantidadUltimaCompra = $("#UiEtiquetaCantidadUltimaCompra");
                    uiEtiquetaCantidadUltimaCompra.text(format_number(paquete.lastQtySold, _this.configuracionDeDecimales.defaultDisplayDecimals));
                    uiEtiquetaCantidadUltimaCompra = null;
                    var uiEtiquetaUnidadDeMedidaUltimaCompra = $("#UiEtiquetaUnidadDeMedidaUltimaCompra");
                    uiEtiquetaUnidadDeMedidaUltimaCompra.text(paquete.lastCodePackUnitSold);
                    uiEtiquetaUnidadDeMedidaUltimaCompra = null;
                    var uiEtiquetaPrecioUltimaCompra = $("#UiEtiquetaPrecioUltimaCompra");
                    uiEtiquetaPrecioUltimaCompra.text("" + _this.configuracionDeDecimales.currencySymbol + format_number(paquete.lastPriceSold, _this.configuracionDeDecimales.defaultDisplayDecimals));
                    uiEtiquetaPrecioUltimaCompra = null;
                    var uiLiUltimoPedidoUnidadMedida = $("#UiLiUltimoPedidoUnidadMedida");
                    uiLiUltimoPedidoUnidadMedida.show();
                    uiLiUltimoPedidoUnidadMedida = null;
                }
                else {
                    _this.limpiarInformacionDeHistoricoDeSku();
                }
                uiTextoCantidadUnidadMedida = null;
                var uiEtiquetaUnidadDeMedida = $("#UiEtiquetaUnidadDeMedida");
                uiEtiquetaUnidadDeMedida.text(paquete.codePackUnit);
                uiEtiquetaUnidadDeMedida = null;
                var uiEtiquetaUnidadesTotales = $("#UiEtiquetaCantidadesTotales");
                if (_this.paqueteSeleccionadoActual.isSaleByMultiple) {
                    uiEtiquetaUnidadesTotales.css("display", "block");
                    uiEtiquetaUnidadesTotales.text("Cantidad Total: " + format_number(cantidad * _this.paqueteSeleccionadoActual.multiple, _this.configuracionDeDecimales.defaultDisplayDecimals));
                }
                else {
                    uiEtiquetaUnidadesTotales.css("display", "none");
                }
                cantidad = null;
                uiEtiquetaUnidadesTotales = null;
                var uiEtiquetaPrecioOriginalDePaqueteSeleccionado = $("#UiEtiquetaPrecioOriginalDePaqueteSeleccionado");
                var uiTxtPrecioNegociadoConCliente = $("#UiTxtPrecioNegociadoConCliente");
                if (_this.usuarioPuedeModificarPrecioDeProducto) {
                    uiEtiquetaPrecioOriginalDePaqueteSeleccionado.text("M\u00EDnimo " + _this.configuracionDeDecimales.currencySymbol + format_number(paquete.originalPrice, _this.configuracionDeDecimales.defaultDisplayDecimals));
                    uiTxtPrecioNegociadoConCliente.val(format_number(paquete.price < paquete.originalPrice
                        ? paquete.originalPrice
                        : paquete.price, _this.configuracionDeDecimales.defaultDisplayDecimals));
                }
                else {
                    uiEtiquetaPrecioOriginalDePaqueteSeleccionado.text("");
                    uiTxtPrecioNegociadoConCliente.val(0);
                }
                uiEtiquetaPrecioOriginalDePaqueteSeleccionado = null;
                var uiEtiquetaPrecioUnidadMedida = $("#UiEtiquetaPrecioUnidadMedida");
                uiEtiquetaPrecioUnidadMedida.text("Precio: " + DarFormatoAlMonto(format_number(paquete.price, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                uiEtiquetaPrecioUnidadMedida = null;
                var uiEtiquetaTotalUnidadMedida = $("#UiEtiquetaTotalUnidadMedida");
                uiEtiquetaTotalUnidadMedida.text("Total: " + DarFormatoAlMonto(format_number(paquete.price * paquete.qty, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                uiEtiquetaTotalUnidadMedida = null;
                _this.obtenerTotalDePaquetesConDescuentoAplicados(function (total) {
                    _this.ObtenerTotalDeLaOrden(function (totalConDes) {
                        var uiTotalCantidadSkus = $("#UiTotalCantidadSkus");
                        var totalDeLaOrden = totalConDes + total;
                        var uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
                        uiEtiquetaTotalCdUnidadMedida.text("Total CD: " + DarFormatoAlMonto(format_number(total, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                        uiEtiquetaTotalCdUnidadMedida = null;
                        if (totalDeLaOrden >=
                            _this.tarea.discountPerGeneralAmountLowLimit &&
                            _this.tarea.discountPerGeneralAmountHighLimit >=
                                totalDeLaOrden) {
                            uiTotalCantidadSkus.text(DarFormatoAlMonto(format_number(totalDeLaOrden -
                                totalDeLaOrden *
                                    (_this.cliente.appliedDiscount / 100), _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            if (callback) {
                                callback();
                            }
                        }
                        else {
                            if (totalDeLaOrden > 0) {
                                _this.obtenerDescuentoPorMontoGeneral(totalDeLaOrden, function () {
                                    if (_this.descuentoPorMontoGeneral.apply) {
                                        if (_this.seAplicaElDescuentoModificado(_this.cliente.discount, _this.cliente.appliedDiscount, _this.descuentoPorMontoGeneral.discount)) {
                                            uiTotalCantidadSkus.text(DarFormatoAlMonto(format_number(totalDeLaOrden -
                                                totalDeLaOrden *
                                                    (_this.cliente.appliedDiscount / 100), _this.configuracionDeDecimales
                                                .defaultDisplayDecimals)));
                                        }
                                        else {
                                            uiTotalCantidadSkus.text(DarFormatoAlMonto(format_number(totalDeLaOrden -
                                                totalDeLaOrden *
                                                    (_this.descuentoPorMontoGeneral
                                                        .discount /
                                                        100), _this.configuracionDeDecimales
                                                .defaultDisplayDecimals)));
                                        }
                                        uiTotalCantidadSkus = null;
                                        if (callback) {
                                            callback();
                                        }
                                    }
                                    else {
                                        uiTotalCantidadSkus.text(DarFormatoAlMonto(format_number(totalDeLaOrden, _this.configuracionDeDecimales
                                            .defaultDisplayDecimals)));
                                        uiTotalCantidadSkus = null;
                                        if (callback) {
                                            callback();
                                        }
                                    }
                                }, function (resultado) {
                                    notify(resultado.mensaje);
                                });
                            }
                            else {
                                uiTotalCantidadSkus.text(DarFormatoAlMonto(format_number(0, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                uiTotalCantidadSkus = null;
                                if (callback) {
                                    callback();
                                }
                            }
                        }
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (ex) {
            notify("Error al cargar datos del paquete seleccionado: " + ex.message);
        }
    };
    DenominacionSkuControlador.prototype.obtenerPaqueteSeleccionado = function (callback, errCallback) {
        var _this = this;
        try {
            var resultadoDeBusqueda = this.paquetes.filter(function (paquete) {
                return (paquete.codePackUnit === _this.paqueteSeleccionadoActual.codePackUnit);
            });
            if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
                callback(resultadoDeBusqueda[0]);
            }
            else {
                callback(null);
            }
            resultadoDeBusqueda = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener el paquete seleccionado: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.usuarioDeseaAceptarElSku = function () {
        var _this = this;
        try {
            this.validarElIngresoDeCantidadesDePaquetes(function () {
                _this.obtenerPaqueteProcesadosEnSku(function (listaDeSku) {
                    if (gIsOnline === EstaEnLinea.No) {
                        _this.tareaServicio.obtenerRegla("AplicarReglasComerciales", function (listaDeReglasAplicarReglasComerciales) {
                            if (listaDeReglasAplicarReglasComerciales.length > 0 &&
                                listaDeReglasAplicarReglasComerciales[0].enabled.toUpperCase() ===
                                    "SI") {
                                _this.clienteServicio.validarCuentaCorriente(_this.cliente, listaDeSku, _this.tarea.salesOrderType, _this.configuracionDeDecimales, function () {
                                    _this.publicarEntidades(listaDeSku, function () {
                                        DesBloquearPantalla();
                                        window.history.back();
                                    }, function (resultado) {
                                        DesBloquearPantalla();
                                        notify(resultado.mensaje);
                                    });
                                }, function (resultado) {
                                    DesBloquearPantalla();
                                    notify(resultado.mensaje);
                                });
                            }
                            else {
                                _this.publicarEntidades(listaDeSku, function () {
                                    DesBloquearPantalla();
                                    window.history.back();
                                }, function (resultado) {
                                    DesBloquearPantalla();
                                    notify(resultado.mensaje);
                                });
                            }
                        }, function (resultado) {
                            DesBloquearPantalla();
                            notify(resultado.mensaje);
                            my_dialog("", "", "closed");
                        });
                    }
                    else {
                        _this.publicarEntidades(listaDeSku, function () {
                            DesBloquearPantalla();
                            window.history.back();
                        }, function (resultado) {
                            DesBloquearPantalla();
                            notify(resultado.mensaje);
                        });
                    }
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                DesBloquearPantalla();
                notify(resultado.mensaje);
            });
        }
        catch (ex) {
            notify(ex.message);
        }
    };
    DenominacionSkuControlador.prototype.validarElIngresoDeCantidadesDePaquetes = function (callback, errCallback) {
        try {
            var resultadoDeBusqueda = this.paquetes.filter(function (paquete) {
                return paquete.qty !== 0;
            });
            if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
                callback();
            }
            else {
                errCallback({
                    codigo: -1,
                    mensaje: "Debe ingresar la cantidad del SKU seleccionado..."
                });
            }
            resultadoDeBusqueda = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar el ingreso de la cantidad: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerPaqueteProcesadosEnSku = function (callback, errCallback) {
        var _this = this;
        try {
            var resultadoDeBusqueda = this.paquetes.filter(function (paquete) {
                return paquete.qty !== 0;
            });
            if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
                var listaDeSku_1 = [];
                resultadoDeBusqueda.forEach(function (paquete) {
                    var sku = new Sku();
                    sku.sku = _this.sku.sku;
                    sku.skuName = _this.sku.skuName;
                    sku.skuDescription = _this.sku.skuDescription;
                    sku.skuPrice = trunc_number(paquete.price, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.skuLink = _this.sku.skuLink;
                    sku.requieresSerie = _this.sku.requieresSerie;
                    sku.isKit = _this.sku.isKit;
                    sku.onHand = trunc_number(_this.sku.onHand, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.routeId = _this.sku.routeId;
                    sku.isParent = _this.sku.isParent;
                    sku.parentSku = _this.sku.parentSku;
                    sku.exposure = _this.sku.exposure;
                    sku.priority = _this.sku.priority;
                    sku.qtyRelated = _this.sku.qtyRelated;
                    sku.loadedLastUpdated = _this.sku.loadedLastUpdated;
                    sku.skus = _this.sku.skus;
                    sku.codeFamilySku = _this.sku.codeFamilySku;
                    sku.descriptionFamilySku = _this.sku.descriptionFamilySku;
                    sku.cost = trunc_number(paquete.price, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.isComited = trunc_number(_this.sku.isComited, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.difference = trunc_number(_this.sku.difference, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.lastQtySold = _this.sku.lastQtySold;
                    sku.qty = trunc_number(paquete.qty, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.available = trunc_number(_this.sku.available, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.codePackUnit = paquete.codePackUnit;
                    sku.total = trunc_number(paquete.qty * paquete.price, _this.configuracionDeDecimales.defaultCalculationsDecimals);
                    sku.discount = paquete.appliedDiscount;
                    sku.appliedDiscount = paquete.appliedDiscount;
                    sku.handleDimension = _this.sku.handleDimension;
                    sku.isSaleByMultiple = _this.sku.isSaleByMultiple;
                    sku.multipleSaleQty = _this.sku.multipleSaleQty;
                    sku.owner = _this.sku.owner;
                    sku.ownerId = _this.sku.ownerId;
                    sku.discountType = paquete.discountType;
                    sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                    sku.basePrice = paquete.basePrice;
                    sku.specialPrice = paquete.specialPrice;
                    sku.originalPrice = paquete.originalPrice;
                    if (_this.paqueteTieneDescuentoAplicado(paquete)) {
                        sku.listPromo.push(paquete.promoDescuento);
                    }
                    if (paquete.promoVentaPorMultiplo.apply) {
                        sku.listPromo.push(paquete.promoVentaPorMultiplo);
                    }
                    listaDeSku_1.push(sku);
                });
                callback(listaDeSku_1);
                listaDeSku_1 = null;
                resultadoDeBusqueda = null;
            }
            else {
                resultadoDeBusqueda = null;
                errCallback({
                    codigo: -1,
                    mensaje: "No se encontraron paquetes mayor a cero."
                });
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener paquetes procesados en sku: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.paqueteTieneDescuentoAplicado = function (paquete) {
        return paquete.appliedDiscount !== 0;
    };
    DenominacionSkuControlador.prototype.validarSiCambioLaCantidad = function (callback, errCallback) {
        var _this = this;
        try {
            this.obtenerPaqueteSeleccionado(function (paquete) {
                var uiTextoCantidadUnidadMedida = $("#UiTextoCantidadUnidadMedida");
                var cantidad = parseFloat(uiTextoCantidadUnidadMedida.val() === ""
                    ? 0
                    : uiTextoCantidadUnidadMedida.val());
                uiTextoCantidadUnidadMedida = null;
                cantidad =
                    cantidad *
                        (_this.paqueteSeleccionadoActual.isSaleByMultiple
                            ? _this.paqueteSeleccionadoActual.multiple
                            : 1);
                if (cantidad === paquete.qty) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener total de paquetes: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerTotalDePaquetesSinDescuentoAplicados = function (callback, errCallback) {
        try {
            var total_1 = 0;
            this.paquetes.forEach(function (paquete) {
                if (paquete.qty !== 0) {
                    total_1 += paquete.qty * paquete.price;
                }
            });
            callback(total_1);
            total_1 = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener total de paquetes: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerTotalDePaquetesConDescuentoAplicados = function (callback, errCallback) {
        var _this = this;
        try {
            var total_2 = 0;
            this.paquetes.forEach(function (paquete) {
                if (paquete.qty !== 0) {
                    var totalPaquete = paquete.price * paquete.qty;
                    var sku = new Sku();
                    sku.total = paquete.price * paquete.qty;
                    sku.discount = paquete.appliedDiscount;
                    sku.discountType = paquete.discountType;
                    sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                    totalPaquete = _this.descuentoServicio.aplicarLosDescuentos(sku, paquete.isUniqueDiscountScale, _this.listaDeOrdenAplicarDescuentos, _this.descuentoPorMontoGeneralYFamilia, _this.descuentoPorFamiliaYTipoPago);
                    total_2 += totalPaquete;
                    totalPaquete = null;
                }
            });
            callback(total_2);
            total_2 = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener total de paquetes: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.publicarEntidades = function (listaDeSku, callback, errCallback) {
        var _this = this;
        try {
            this.publicarTarea(function () {
                _this.publicarListaSku(listaDeSku, function () {
                    _this.publicarAgregarOQuitarDeListaSkuMensaje(listaDeSku, function () {
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
                mensaje: "Error al publicar entidades: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.publicarTarea = function (callback, errCallback) {
        var _this = this;
        try {
            this.obtenerTotalDePaquetesConDescuentoAplicados(function (total) {
                _this.ObtenerTotalDeLaOrden(function (totalConDes) {
                    var msg = new TareaMensaje(_this);
                    _this.tarea.salesOrderTotal = totalConDes + total;
                    msg.tarea = _this.tarea;
                    _this.mensajero.publish(msg, getType(TareaMensaje));
                    callback();
                }, function (resultado) {
                    errCallback({
                        codigo: -1,
                        mensaje: resultado.mensaje
                    });
                });
            }, function (resultado) {
                errCallback({ codigo: -1, mensaje: resultado.mensaje });
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al publicar tarea: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.publicarListaSku = function (listaSku, callBack, errCallback) {
        var _this = this;
        try {
            this.obtenerListaDeSkuDeBonificacionesParaPublicar(function (listadoDeSkuParaBonificar) {
                var msg = new ListaSkuMensaje(_this);
                msg.listaSku = listaSku;
                msg.listaDeSkuParaBonificacion = listadoDeSkuParaBonificar;
                _this.mensajero.publish(msg, getType(ListaSkuMensaje));
                msg = null;
                callBack();
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al publicar listado de sku: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.publicarAgregarOQuitarDeListaSkuMensaje = function (listaSku, callBack, errCallback) {
        try {
            var msg = new AgregarOQuitarDeListaSkuMensaje(this);
            msg.listaSku = listaSku;
            msg.quitarSku = this.estaAgregandoSku;
            msg.agregarSku = false;
            this.mensajero.publish(msg, getType(AgregarOQuitarDeListaSkuMensaje));
            msg = null;
            callBack();
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al publicar agregar o quitar de lista sku: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.mostrarPantallaAnterior = function () {
        switch ($.mobile.activePage[0].id) {
            case "skucant_page":
                window.history.back();
                break;
        }
    };
    DenominacionSkuControlador.prototype.usuarioDeseaVerResumenDelSku = function () {
        var _this = this;
        var myPanel = $.mobile.activePage.children('[id="UiPanelIzquierdoPaginaDenominacion"]');
        myPanel.panel("toggle");
        myPanel = null;
        this.validarBonificacionesIngresadas(function () {
            _this.validarIngresoDeDescuento(function (resultado) {
                notify(resultado.mensaje);
                DesBloquearPantalla();
            }, function () {
                _this.cargarResumenDelSku();
            });
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    DenominacionSkuControlador.prototype.cargarResumenDelSku = function () {
        try {
            if (!this.paquetes) {
                return;
            }
            var uiListaResumenUnidadMedida = $("#UiListaResumenUnidadMedida");
            uiListaResumenUnidadMedida.children().remove("li");
            var _loop_1 = function (paquete) {
                if (paquete.qty !== 0) {
                    var total = paquete.qty * paquete.price;
                    var totalConDescuentoPorEscala = 0;
                    var totalConDescuentoPorFamilia = 0;
                    switch (paquete.discountType) {
                        case TiposDeDescuento.Porcentaje.toString():
                            total = trunc_number(total - (paquete.appliedDiscount * total) / 100, this_1.configuracionDeDecimales.defaultCalculationsDecimals);
                            break;
                        case TiposDeDescuento.Monetario.toString():
                            total =
                                trunc_number(total, this_1.configuracionDeDecimales.defaultCalculationsDecimals) < paquete.appliedDiscount
                                    ? 0
                                    : trunc_number(total - paquete.appliedDiscount, this_1.configuracionDeDecimales.defaultCalculationsDecimals);
                            break;
                    }
                    totalConDescuentoPorEscala = total;
                    if (this_1.descuentoPorMontoGeneralYFamilia.discount > 0) {
                        switch (this_1.descuentoPorMontoGeneralYFamilia.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                total = trunc_number(total -
                                    (this_1.descuentoPorMontoGeneralYFamilia.discount * total) /
                                        100, this_1.configuracionDeDecimales.defaultCalculationsDecimals);
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                total =
                                    trunc_number(total, this_1.configuracionDeDecimales.defaultCalculationsDecimals) < this_1.descuentoPorMontoGeneralYFamilia.discount
                                        ? 0
                                        : trunc_number(total - this_1.descuentoPorMontoGeneralYFamilia.discount, this_1.configuracionDeDecimales
                                            .defaultCalculationsDecimals);
                                break;
                        }
                    }
                    totalConDescuentoPorFamilia = total;
                    if (this_1.descuentoPorFamiliaYTipoPago.discount > 0) {
                        switch (this_1.descuentoPorFamiliaYTipoPago.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                total = trunc_number(total -
                                    (this_1.descuentoPorFamiliaYTipoPago.discount * total) / 100, this_1.configuracionDeDecimales.defaultCalculationsDecimals);
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                total =
                                    trunc_number(total, this_1.configuracionDeDecimales.defaultCalculationsDecimals) < this_1.descuentoPorFamiliaYTipoPago.discount
                                        ? 0
                                        : trunc_number(total - this_1.descuentoPorFamiliaYTipoPago.discount, this_1.configuracionDeDecimales
                                            .defaultCalculationsDecimals);
                                break;
                        }
                    }
                    var li = "<li class='ui-field - contain' data-theme='a' style='text- align: right'>";
                    li +=
                        "<a href='#' style='text-align: left; background-color: #666;' data-theme='b' class='ui-btn ui-btn-icon-top ui-nodisc-icon'>";
                    li += "<FONT color='#FFFFFF'>" + paquete.descriptionPackUnit + "</FONT>";
                    li += "</a>";
                    li += "</li>";
                    uiListaResumenUnidadMedida.append(li);
                    uiListaResumenUnidadMedida.listview("refresh");
                    li =
                        "<li class='ui-field-contain' data-theme='a' style='text-align: right'>";
                    li += "<span class='HeaderSmall'>Cantidad &emsp;&emsp; " + format_number(paquete.qty, this_1.configuracionDeDecimales.defaultDisplayDecimals) + "</span><br>";
                    li += "<span class='HeaderSmall'>Precio &emsp;&emsp; " + DarFormatoAlMonto(format_number(paquete.price, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                    li += "<span class='HeaderSmall'>Total &emsp;&emsp; " + DarFormatoAlMonto(format_number(paquete.qty * paquete.price, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><br>";
                    if (paquete.appliedDiscount && paquete.appliedDiscount !== 0) {
                        switch (paquete.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                li += "<span class='HeaderSmall'>Descuento(" + paquete.appliedDiscount + "%) &emsp;&emsp; " + DarFormatoAlMonto(format_number((paquete.appliedDiscount / 100) *
                                    (paquete.qty * paquete.price), this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                li += "<span class='HeaderSmall'>Descuento &emsp;&emsp; " + DarFormatoAlMonto(format_number(paquete.appliedDiscount, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                                break;
                        }
                        if (this_1.descuentoPorMontoGeneralYFamilia.discount <= 0 &&
                            this_1.descuentoPorFamiliaYTipoPago.discount <= 0) {
                            li += "<span class='HeaderSmall'> Total CD: " + DarFormatoAlMonto(format_number(total, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span>";
                        }
                    }
                    if (this_1.descuentoPorMontoGeneralYFamilia.discount > 0) {
                        switch (this_1.descuentoPorMontoGeneralYFamilia.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                li += "<span class='HeaderSmall'>Descuento(" + this_1.descuentoPorMontoGeneralYFamilia.discount + "%) &emsp;&emsp; " + DarFormatoAlMonto(format_number((this_1.descuentoPorMontoGeneralYFamilia.discount / 100) *
                                    totalConDescuentoPorEscala, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                li += "<span class='HeaderSmall'>Descuento &emsp;&emsp; " + DarFormatoAlMonto(format_number(this_1.descuentoPorMontoGeneralYFamilia.discount, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                                break;
                        }
                        if (this_1.descuentoPorFamiliaYTipoPago.discount <= 0) {
                            li += "<span class='HeaderSmall'> Total CD: " + DarFormatoAlMonto(format_number(total, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span>";
                        }
                    }
                    if (this_1.descuentoPorFamiliaYTipoPago.discount > 0) {
                        switch (this_1.descuentoPorFamiliaYTipoPago.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                li += "<span class='HeaderSmall'>Descuento(" + this_1.descuentoPorFamiliaYTipoPago.discount + "%) &emsp;&emsp; " + DarFormatoAlMonto(format_number((this_1.descuentoPorFamiliaYTipoPago.discount / 100) *
                                    totalConDescuentoPorFamilia, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                li += "<span class='HeaderSmall'>Descuento &emsp;&emsp; " + DarFormatoAlMonto(format_number(this_1.descuentoPorFamiliaYTipoPago.discount, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span><hr>";
                                break;
                        }
                        li += "<span class='HeaderSmall'> Total CD: " + DarFormatoAlMonto(format_number(total, this_1.configuracionDeDecimales.defaultDisplayDecimals)) + "</span>";
                    }
                    li += "</li>";
                    uiListaResumenUnidadMedida.append(li);
                    uiListaResumenUnidadMedida.listview("refresh");
                    var listadoDeBonificacionesFiltradas = this_1.listaDeBonificaciones.filter(function (bonificacion) {
                        return (bonificacion.codePackUnit === paquete.codePackUnit &&
                            bonificacion.bonusQty > 0);
                    });
                    if (listadoDeBonificacionesFiltradas &&
                        listadoDeBonificacionesFiltradas.length > 0) {
                        li =
                            "<li class='ui-field-contain' data-theme='a' style='text-align: right'>";
                        li +=
                            "<div data-role='collapsible' data-content-theme='a' data-inset='true' data-mini='true' data-theme='b' class='ui-nodisc-icon' data-collapsed-icon='carat-d' data-expanded-icon='carat-u' Width='100%'>";
                        li += "<h5 style='text- align:center'>Bonificaciones</h5>";
                        li += "<ul data-role='listview' data-inset='false' data-divider-theme='a' id='UiListaBonificacionResumenUnidadMedida" + paquete.codePackUnit + "' >";
                        li += "</ul>";
                        li += "</div>";
                        li += "</li>";
                        uiListaResumenUnidadMedida.append(li);
                        uiListaResumenUnidadMedida.listview("refresh");
                        uiListaResumenUnidadMedida.trigger("create");
                        listadoDeBonificacionesFiltradas.forEach(function (bonificacion) {
                            var uiListaBonificacionResumenUnidadMedida = $("#UiListaBonificacionResumenUnidadMedida" + paquete.codePackUnit);
                            var listaDeLi = [];
                            listaDeLi.push("<li class='ui-field - contain' data-theme='a' style='text- align: left'>");
                            listaDeLi.push("<span class='medium'>" + bonificacion.codeSkuBonus + "</span><br/>");
                            listaDeLi.push("<span class='medium'>" + bonificacion.descriptionSkuBonues + "</span><br/>");
                            listaDeLi.push("<span class='medium'>UM.: " + bonificacion.codePackUnitBonues + " Cant.: " + bonificacion.bonusQty + "</span><br/>");
                            listaDeLi.push("</li>");
                            uiListaBonificacionResumenUnidadMedida.append(listaDeLi.join(""));
                            uiListaBonificacionResumenUnidadMedida.listview("refresh");
                            uiListaBonificacionResumenUnidadMedida = null;
                            listaDeLi = null;
                        });
                    }
                    total = null;
                }
            };
            var this_1 = this;
            for (var _i = 0, _a = this.paquetes; _i < _a.length; _i++) {
                var paquete = _a[_i];
                _loop_1(paquete);
            }
            uiListaResumenUnidadMedida = null;
        }
        catch (ex) {
            notify("Error al cargar la informacion: " + ex.message);
        }
    };
    DenominacionSkuControlador.prototype.cargarBonificaciones = function (callBack, errCallback) {
        var _this = this;
        try {
            this.obtenerSiElUsuarioPudeModificarBonificaciones(function () {
                _this.bonoServicio.obtenerBonificacionPorEscalaPorCliente(_this.cliente, _this.sku, function (listaDeBonificacionesPorEscala) {
                    _this.validarSiAplicaLaBonificaciones(listaDeBonificacionesPorEscala, 0, true, function (listaDeBonificacionesPorEscalaParaAplicar) {
                        _this.listaDeBonificaciones = [];
                        listaDeBonificacionesPorEscalaParaAplicar.map(function (bonificacion) {
                            var resultadoDeBonificacionDeBusqueda = _this
                                .listaDeBonificaciones.find(function (bonificacionExistente) {
                                return (bonificacion.codePackUnit ===
                                    bonificacionExistente.codePackUnit &&
                                    bonificacion.codeSkuBonus ===
                                        bonificacionExistente.codeSkuBonus &&
                                    bonificacion.codePackUnitBonues ===
                                        bonificacionExistente.codePackUnitBonues);
                            });
                            if (resultadoDeBonificacionDeBusqueda) {
                                var escalaDeBono = new EscalaDeBono();
                                escalaDeBono.lowLimit = bonificacion.lowLimitTemp;
                                escalaDeBono.highLimit = bonificacion.highLimitTemp;
                                escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
                                escalaDeBono.promoId = bonificacion.promoIdScale;
                                escalaDeBono.promoName = bonificacion.promoNameScale;
                                escalaDeBono.promoType = bonificacion.promoTypeScale;
                                escalaDeBono.frequency = bonificacion.frequencyScale;
                                resultadoDeBonificacionDeBusqueda.escalas.push(escalaDeBono);
                            }
                            else {
                                var escalaDeBono = new EscalaDeBono();
                                escalaDeBono.lowLimit = bonificacion.lowLimitTemp;
                                escalaDeBono.highLimit = bonificacion.highLimitTemp;
                                escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
                                escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
                                escalaDeBono.promoId = bonificacion.promoIdScale;
                                escalaDeBono.promoName = bonificacion.promoNameScale;
                                escalaDeBono.promoType = bonificacion.promoTypeScale;
                                escalaDeBono.frequency = bonificacion.frequencyScale;
                                bonificacion.escalas.push(escalaDeBono);
                                bonificacion.lowLimitTemp = 0;
                                bonificacion.highLimitTemp = 0;
                                bonificacion.bonusQtyTemp = 0;
                                bonificacion.bonusQty = -1;
                                bonificacion.promoIdScale = 0;
                                bonificacion.promoNameScale = "";
                                bonificacion.promoTypeScale = "";
                                bonificacion.frequencyScale = "";
                                bonificacion.tipoDeBonificacion =
                                    TipoDeBonificacion.PorEscala;
                                _this.listaDeBonificaciones.push(bonificacion);
                            }
                            resultadoDeBonificacionDeBusqueda = null;
                        });
                        _this.bonoServicio.obtenerBonoPorMultiploPorCliente(_this.cliente, _this.sku, function (listaDeBonosPorMultiplo) {
                            _this.validarSiAplicaLaBonificaciones(listaDeBonosPorMultiplo, 0, false, function (listaDeBonosPorMultiploParaAplicar) {
                                listaDeBonosPorMultiploParaAplicar.map(function (bonificacion) {
                                    var resultadoDeBonificacionDeBusqueda = _this
                                        .listaDeBonificaciones.find(function (bonificacionExistente) {
                                        return (bonificacion.codePackUnit ===
                                            bonificacionExistente.codePackUnit &&
                                            bonificacion.codeSkuBonus ===
                                                bonificacionExistente.codeSkuBonus &&
                                            bonificacion.codePackUnitBonues ===
                                                bonificacionExistente.codePackUnitBonues);
                                    });
                                    if (resultadoDeBonificacionDeBusqueda) {
                                        resultadoDeBonificacionDeBusqueda.tipoDeBonificacion =
                                            TipoDeBonificacion.Ambos;
                                        resultadoDeBonificacionDeBusqueda.multiplo =
                                            bonificacion.multiplo;
                                        resultadoDeBonificacionDeBusqueda.bonusQtyMultiplo =
                                            bonificacion.bonusQtyMultiplo;
                                        resultadoDeBonificacionDeBusqueda.promoIdMultiple =
                                            bonificacion.promoIdMultiple;
                                        resultadoDeBonificacionDeBusqueda.promoNameMultiple =
                                            bonificacion.promoNameMultiple;
                                        resultadoDeBonificacionDeBusqueda.promoTypeMultiple =
                                            bonificacion.promoTypeMultiple;
                                        resultadoDeBonificacionDeBusqueda.frequencyMultiple =
                                            bonificacion.frequencyMultiple;
                                    }
                                    else {
                                        bonificacion.lowLimitTemp = 0;
                                        bonificacion.highLimitTemp = 0;
                                        bonificacion.bonusQtyTemp = 0;
                                        bonificacion.bonusQty = -1;
                                        bonificacion.tipoDeBonificacion =
                                            TipoDeBonificacion.PorMultiplo;
                                        _this.listaDeBonificaciones.push(bonificacion);
                                    }
                                    resultadoDeBonificacionDeBusqueda = null;
                                });
                                callBack();
                            }, function (resultado) {
                                errCallback(resultado);
                            });
                        }, function (resultado) {
                            errCallback(resultado);
                        });
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
                mensaje: "Error al cargar las bonificaciones: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerSiElUsuarioPudeModificarBonificaciones = function (callback, errCallback) {
        var _this = this;
        try {
            this.usuarioPuedeModificarBonificacion = false;
            this.tareaServicio.obtenerRegla("ModificacionBonificacionMovil", function (listaDeReglas) {
                if (listaDeReglas.length >= 1) {
                    _this.usuarioPuedeModificarBonificacion =
                        listaDeReglas[0].enabled.toUpperCase() === "SI";
                }
                callback();
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (err) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar si modifica bonificacion: " + err.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerBonificacionesDelPaqueteSeleccionado = function (callBack, errCallback) {
        var _this = this;
        try {
            var resultadoDeBonificacionDeBusqueda = this.listaDeBonificaciones.filter(function (bonificacionExistente) {
                return (_this.paqueteSeleccionadoActual.codePackUnit ===
                    bonificacionExistente.codePackUnit);
            });
            if (resultadoDeBonificacionDeBusqueda &&
                resultadoDeBonificacionDeBusqueda.length > 0) {
                callBack(resultadoDeBonificacionDeBusqueda);
            }
            else {
                callBack([]);
            }
            resultadoDeBonificacionDeBusqueda = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar si el paquete tiene bonificaciones: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.cargarControlesBonificaciones = function (listaBonificaciones, callBack, errCallback) {
        var _this = this;
        try {
            var uiAcordionDeBonificacionesUnidadMedida = $("#UiAcordionDeBonificacionesUnidadMedida");
            uiAcordionDeBonificacionesUnidadMedida.hide();
            uiAcordionDeBonificacionesUnidadMedida = null;
            var uiListaDeBonificacionesUnidadMedida = $("#UiListaDeBonificacionesUnidadMedida");
            uiListaDeBonificacionesUnidadMedida.children().remove("li");
            uiListaDeBonificacionesUnidadMedida = null;
            this.obtenerPaqueteSeleccionado(function (paquete) {
                listaBonificaciones.map(function (bonificacion) {
                    bonificacion.bonusQtyTemp = 0;
                    if (_this.tipoDeBonificacionEsPorMultiploOMultiploYEscala(bonificacion)) {
                        bonificacion.bonusQtyTemp = _this.obtenerValorDeBonoMultiplo(bonificacion.multiplo, paquete.qty, bonificacion.bonusQtyMultiplo);
                        bonificacion.applyPromoByMultiple =
                            bonificacion.bonusQtyTemp !== 0;
                    }
                    bonificacion.promoIdScale = 0;
                    bonificacion.promoNameScale = "";
                    bonificacion.promoTypeScale = "";
                    bonificacion.frequencyScale = "";
                    var escalasFiltradas = bonificacion.escalas.find(function (escala) {
                        return (escala.lowLimit <= paquete.qty &&
                            paquete.qty <= escala.highLimit);
                    });
                    if (escalasFiltradas) {
                        bonificacion.bonusQtyTemp += escalasFiltradas.bonusQty;
                        bonificacion.promoIdScale = escalasFiltradas.promoId;
                        bonificacion.promoNameScale = escalasFiltradas.promoName;
                        bonificacion.promoTypeScale = escalasFiltradas.promoType;
                        bonificacion.frequencyScale = escalasFiltradas.frequency;
                    }
                    escalasFiltradas = null;
                    if (bonificacion.bonusQtyTemp > 0) {
                        var uiAcordionDeBonificacionesUnidadMedida_1 = $("#UiAcordionDeBonificacionesUnidadMedida");
                        uiAcordionDeBonificacionesUnidadMedida_1.show();
                        uiAcordionDeBonificacionesUnidadMedida_1 = null;
                        var uiListaDeBonificacionesUnidadMedida_1 = $("#UiListaDeBonificacionesUnidadMedida");
                        var liParaAgregar = [];
                        liParaAgregar.push("<li class='ui-field - contain' data-theme='a' style='text- align: left'>");
                        liParaAgregar.push("<span class='medium'>" + bonificacion.descriptionSkuBonues + "</span><br/>");
                        liParaAgregar.push("<span class='medium'>" + bonificacion.codeSkuBonus + "</span><br/>");
                        liParaAgregar.push("<span class='medium' id='UiEtiquetaTextoBonificacion" + bonificacion.codeSkuBonus + bonificacion.codePackUnitBonues + "'>UM.: " + bonificacion.codePackUnitBonues + " Cant.: " + bonificacion.bonusQtyTemp + "</span><br/>");
                        if (_this.usuarioPuedeModificarBonificacion) {
                            if (localStorage.getItem("USE_MAX_BONUS") === SiNo.Si.toString()) {
                                if (bonificacion.bonusQty === -1) {
                                    bonificacion.bonusQty = bonificacion.bonusQtyTemp;
                                }
                            }
                            liParaAgregar.push("<input type='number' class='validarEnteros' id='UiTextoBonificacion" + bonificacion.codeSkuBonus + bonificacion.codePackUnitBonues + "' data-clear-btn='true' placeholder='Cantidad' value='" + (bonificacion.bonusQty <= 0 ? "" : bonificacion.bonusQty) + "' />");
                        }
                        else {
                            bonificacion.bonusQty = bonificacion.bonusQtyTemp;
                        }
                        liParaAgregar.push("</li>");
                        uiListaDeBonificacionesUnidadMedida_1.append(liParaAgregar.join(""));
                        uiListaDeBonificacionesUnidadMedida_1.listview("refresh");
                        uiListaDeBonificacionesUnidadMedida_1.trigger("create");
                        uiListaDeBonificacionesUnidadMedida_1 = null;
                        liParaAgregar = null;
                    }
                    else {
                        bonificacion.bonusQty = -1;
                    }
                });
                callBack();
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al establecer bonificaciones: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.tipoDeBonificacionEsPorMultiploOMultiploYEscala = function (bonificacion) {
        return (bonificacion.tipoDeBonificacion === TipoDeBonificacion.PorMultiplo ||
            bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos);
    };
    DenominacionSkuControlador.prototype.validarBonificacionesIngresadas = function (callBack, errCallback) {
        var _this = this;
        try {
            if (this.usuarioPuedeModificarBonificacion) {
                this.obtenerBonificacionesDelPaqueteSeleccionado(function (listaBonificaciones) {
                    _this.obtenerPaqueteSeleccionado(function (paquete) {
                        var hayIngresosQueSobrepesanLoMaximo = false;
                        listaBonificaciones.map(function (bonificacion) {
                            var validarBonificacion = false;
                            if (bonificacion.tipoDeBonificacion ===
                                TipoDeBonificacion.PorMultiplo ||
                                bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos) {
                                validarBonificacion = true;
                            }
                            var escalasFiltradas = bonificacion.escalas.find(function (escala) {
                                return (escala.lowLimit <= paquete.qty &&
                                    paquete.qty <= escala.highLimit);
                            });
                            if (escalasFiltradas || validarBonificacion) {
                                var uiEtiquetaTotalUnidadMedida = $("#UiTextoBonificacion" + bonificacion.codeSkuBonus + bonificacion.codePackUnitBonues);
                                var cantidadDeBonificacion = uiEtiquetaTotalUnidadMedida.val() === ""
                                    ? 0
                                    : uiEtiquetaTotalUnidadMedida.val();
                                if (cantidadDeBonificacion > bonificacion.bonusQtyTemp) {
                                    hayIngresosQueSobrepesanLoMaximo = true;
                                }
                                else {
                                    bonificacion.bonusQty = cantidadDeBonificacion;
                                }
                                cantidadDeBonificacion = null;
                                uiEtiquetaTotalUnidadMedida = null;
                            }
                            escalasFiltradas = null;
                        });
                        if (hayIngresosQueSobrepesanLoMaximo) {
                            errCallback({
                                codigo: -1,
                                mensaje: "Hay bonificaciones que sobrepasan lo máximo establecido."
                            });
                        }
                        else {
                            callBack();
                        }
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }, function (resultado) {
                    errCallback(resultado);
                });
            }
            else {
                callBack();
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar bonificaciones ingresadas: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerListaDeSkuDeBonificacionesParaPublicar = function (callBack, errCallback) {
        var _this = this;
        try {
            var listaFiltrada = this.listaDeBonificaciones.reduce(function (listaRecorrida, bonificacion) {
                if (bonificacion.bonusQty > 0) {
                    var skuParaBonificacion = new Sku();
                    skuParaBonificacion.sku = bonificacion.codeSkuBonus;
                    skuParaBonificacion.codePackUnit = bonificacion.codePackUnitBonues;
                    skuParaBonificacion.skuName = bonificacion.descriptionSkuBonues;
                    skuParaBonificacion.skuDescription =
                        bonificacion.descriptionSkuBonues;
                    skuParaBonificacion.qty = bonificacion.bonusQty;
                    skuParaBonificacion.parentCodeSku = _this.sku.sku;
                    skuParaBonificacion.parentCodePackUnit = bonificacion.codePackUnit;
                    skuParaBonificacion.lowLimit = 0;
                    skuParaBonificacion.highLimit = 0;
                    skuParaBonificacion.owner = bonificacion.owner;
                    skuParaBonificacion.ownerId = bonificacion.ownerId;
                    if (_this.promoDeEscalaSeAgregaALaBonificacion(bonificacion)) {
                        var promo = new Promo();
                        promo.promoId = bonificacion.promoIdScale;
                        promo.promoName = bonificacion.promoNameScale;
                        promo.promoType = bonificacion.promoTypeScale;
                        promo.frequency = bonificacion.frequencyScale;
                        skuParaBonificacion.listPromo.push(promo);
                        promo = null;
                    }
                    if (bonificacion.applyPromoByMultiple) {
                        var promo = new Promo();
                        promo.promoId = bonificacion.promoIdMultiple;
                        promo.promoName = bonificacion.promoNameMultiple;
                        promo.promoType = bonificacion.promoTypeMultiple;
                        promo.frequency = bonificacion.frequencyMultiple;
                        skuParaBonificacion.listPromo.push(promo);
                        promo = null;
                    }
                    listaRecorrida.push(skuParaBonificacion);
                    skuParaBonificacion = null;
                }
                return listaRecorrida;
            }, []);
            callBack(listaFiltrada);
            listaFiltrada = null;
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar bonificaciones ingresadas: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.promoDeEscalaSeAgregaALaBonificacion = function (bonificacion) {
        return bonificacion.promoIdScale !== 0;
    };
    DenominacionSkuControlador.prototype.cargarListaDeSkuBonficadas = function (callBack, errCallback) {
        var _this = this;
        try {
            this.listaDeSkuDeBonificacion.map(function (skuBonificado) {
                var resultadoBonificacion = _this
                    .listaDeBonificaciones.find(function (bonificacion) {
                    return (bonificacion.codePackUnit === skuBonificado.parentCodePackUnit &&
                        bonificacion.codeSkuBonus === skuBonificado.sku &&
                        bonificacion.codePackUnitBonues === skuBonificado.codePackUnit);
                });
                if (resultadoBonificacion) {
                    resultadoBonificacion.bonusQty = skuBonificado.qty;
                }
                resultadoBonificacion = null;
            });
            callBack();
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al cargar lista de sku bonificadas: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerValorDeBonoMultiplo = function (multiplo, cantidad, cantidadBono) {
        if (multiplo === 1) {
            return cantidad * cantidadBono;
        }
        if (cantidad < multiplo) {
            return 0;
        }
        if (cantidad === multiplo) {
            return cantidadBono;
        }
        var encontroCantidad = false;
        var indice = 1;
        while (!encontroCantidad) {
            if (multiplo * indice <= cantidad &&
                cantidad <= multiplo * (indice + 1) - 1) {
                encontroCantidad = true;
            }
            else {
                indice++;
            }
        }
        return cantidadBono * indice;
    };
    DenominacionSkuControlador.prototype.obtenerSiElUsuarioPudeModificarDescuentos = function (callback, errCallback) {
        var _this = this;
        try {
            this.usuarioPuedeModificarDescuentos = false;
            this.tareaServicio.obtenerRegla("ModificacionDescuentoMovil", function (listaDeReglas) {
                if (listaDeReglas.length >= 1) {
                    _this.usuarioPuedeModificarDescuentos =
                        listaDeReglas[0].enabled.toUpperCase() === "SI";
                }
                callback();
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (err) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar si modifica bonificacion: " + err.message
            });
        }
    };
    DenominacionSkuControlador.prototype.cargarDescuentos = function (callback, errCallback) {
        var _this = this;
        try {
            this.obtenerSiElUsuarioPudeModificarDescuentos(function () {
                _this.descuentoServicio.obtenerDescuentosPorClienteSku(_this.cliente, _this.sku, function (listaDeDescuento) {
                    _this.validarSiAplicaElDescuento(listaDeDescuento, 0, function (listaDeDescuentoParaAplicar) {
                        _this.listaDeDescuento = listaDeDescuentoParaAplicar;
                        _this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(function () {
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
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener descuentos: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
            this.descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
            this.descuentoServicio.obtenerDescuentos(this.paquetes, this.listaDeSkuOrdenDeVenta, this.cliente, this.listaHistoricoDePromos, function (listaDescuentoPorMontoGeneralYFamilia, listaDescuentoPorFamiliaYTipoPago) {
                _this.obtenerPaqueteSeleccionado(function (paquete) {
                    var aplicarDescuentos = true;
                    if (paquete) {
                        aplicarDescuentos = paquete.specialPrice.applyDiscount;
                    }
                    var esDescuentoUnicoDeEscala = true;
                    _this.paquetes.map(function (paquete) {
                        if (!paquete.isUniqueDiscountScale) {
                            esDescuentoUnicoDeEscala = paquete.isUniqueDiscountScale;
                        }
                    });
                    var resultadoDescuentoMontoGeneralYFamilia = listaDescuentoPorMontoGeneralYFamilia.find(function (descuento) {
                        return _this.sku.codeFamilySku === descuento.codeFamily;
                    });
                    if (resultadoDescuentoMontoGeneralYFamilia &&
                        !esDescuentoUnicoDeEscala &&
                        aplicarDescuentos) {
                        _this.descuentoPorMontoGeneralYFamilia = resultadoDescuentoMontoGeneralYFamilia;
                    }
                    var resultadoDescuentoPorFamiliaYTipoPago = listaDescuentoPorFamiliaYTipoPago.find(function (descuento) {
                        return _this.sku.codeFamilySku === descuento.codeFamily;
                    });
                    if (resultadoDescuentoPorFamiliaYTipoPago &&
                        !esDescuentoUnicoDeEscala &&
                        aplicarDescuentos) {
                        _this.descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
                    }
                    var descuentoPorFamilia = _this
                        .descuentoPorMontoGeneralYFamilia.discount;
                    var descuentoPorTipoPago = _this
                        .descuentoPorFamiliaYTipoPago.discount;
                    var uiLiDescuentoPorFamilia = $("#UiLiDescuentoPorFamilia");
                    uiLiDescuentoPorFamilia.css("display", "none");
                    uiLiDescuentoPorFamilia = null;
                    var uiEtiquetaDescuentoPorFamiliaMaximo = $("#UiEtiquetaDescuentoPorFamiliaMaximo");
                    uiEtiquetaDescuentoPorFamiliaMaximo.css("display", "none");
                    uiEtiquetaDescuentoPorFamiliaMaximo = null;
                    var uiEtiquetaDescuentoPorTipoPagoMaximo = $("#UiEtiquetaDescuentoPorTipoPagoMaximo");
                    uiEtiquetaDescuentoPorTipoPagoMaximo.css("display", "none");
                    uiEtiquetaDescuentoPorTipoPagoMaximo = null;
                    if (descuentoPorFamilia > 0 || descuentoPorTipoPago > 0) {
                        var UiLiDescuentoPorFamilia = $("#UiLiDescuentoPorFamilia");
                        UiLiDescuentoPorFamilia.css("display", "block");
                        UiLiDescuentoPorFamilia = null;
                    }
                    if (descuentoPorFamilia > 0) {
                        var uiEtiquetaDescuentoPorFamiliaMaximo_1 = $("#UiEtiquetaDescuentoPorFamiliaMaximo");
                        uiEtiquetaDescuentoPorFamiliaMaximo_1.css("display", "block");
                        switch (_this.descuentoPorMontoGeneralYFamilia.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                uiEtiquetaDescuentoPorFamiliaMaximo_1.text("Descuento por monto general y familia: " + format_number(descuentoPorFamilia, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                uiEtiquetaDescuentoPorFamiliaMaximo_1.text("Descuento por monto general y familia: " + DarFormatoAlMonto(format_number(descuentoPorFamilia, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                break;
                        }
                        uiEtiquetaDescuentoPorFamiliaMaximo_1 = null;
                    }
                    if (descuentoPorTipoPago > 0) {
                        var uiEtiquetaDescuentoPorTipoPagoMaximo_1 = $("#UiEtiquetaDescuentoPorTipoPagoMaximo");
                        uiEtiquetaDescuentoPorTipoPagoMaximo_1.css("display", "block");
                        switch (_this.descuentoPorFamiliaYTipoPago.discountType) {
                            case TiposDeDescuento.Porcentaje.toString():
                                uiEtiquetaDescuentoPorTipoPagoMaximo_1.text("Descuento por familia y tipo pago: " + format_number(descuentoPorTipoPago, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                                break;
                            case TiposDeDescuento.Monetario.toString():
                                uiEtiquetaDescuentoPorTipoPagoMaximo_1.text("Descuento por familia y tipo pago: " + DarFormatoAlMonto(format_number(descuentoPorTipoPago, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                break;
                        }
                        uiEtiquetaDescuentoPorTipoPagoMaximo_1 = null;
                    }
                    callback();
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
                mensaje: "Error al obtener descuentos por familias: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.validarIngresoDeDescuento = function (errCallback, callBack) {
        var _this = this;
        try {
            this.obtenerPaqueteSeleccionado(function (paquete) {
                paquete.appliedDiscount = 0;
                paquete.promoDescuento = new Promo();
                var elDescuentoIngresadoSobrepasaLoMaximo = false;
                paquete.specialPrice = new PrecioEspecial();
                paquete.price =
                    paquete.basePrice > 0 ? paquete.basePrice : paquete.price;
                var resultadoDescuento = _this
                    .listaDeDescuento.find(function (descuento) {
                    return (_this.paqueteSeleccionadoActual.codePackUnit ===
                        descuento.codePackUnit &&
                        (descuento.lowLimit <= paquete.qty &&
                            paquete.qty <= descuento.highLimit));
                });
                var restultadoPrecioEspecial = _this
                    .listaDePreciosEspeciales.find(function (precioEspecial) {
                    return (_this.paqueteSeleccionadoActual.codePackUnit ===
                        precioEspecial.codePackUnit &&
                        (precioEspecial.lowLimit <= paquete.qty &&
                            paquete.qty <= precioEspecial.highLimit));
                });
                if (restultadoPrecioEspecial) {
                    paquete.basePrice = paquete.price;
                    if (_this.usuarioPuedeModificarPrecioDeProducto) {
                        var uiTxtPrecioNegociadoConCliente = $("#UiTxtPrecioNegociadoConCliente");
                        paquete.price =
                            uiTxtPrecioNegociadoConCliente.val() === "" ||
                                isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                                parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                                ? paquete.price
                                : parseFloat(uiTxtPrecioNegociadoConCliente.val());
                        uiTxtPrecioNegociadoConCliente = null;
                    }
                    else {
                        paquete.price = restultadoPrecioEspecial.specialPrice;
                    }
                    paquete.originalPrice = restultadoPrecioEspecial.specialPrice;
                    paquete.specialPrice = restultadoPrecioEspecial;
                }
                else {
                    if (_this.usuarioPuedeModificarPrecioDeProducto) {
                        var uiTxtPrecioNegociadoConCliente = $("#UiTxtPrecioNegociadoConCliente");
                        paquete.price =
                            uiTxtPrecioNegociadoConCliente.val() === "" ||
                                isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                                parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                                ? paquete.price
                                : parseFloat(uiTxtPrecioNegociadoConCliente.val());
                        uiTxtPrecioNegociadoConCliente = null;
                    }
                }
                if (resultadoDescuento && paquete.specialPrice.applyDiscount) {
                    if (_this.usuarioPuedeModificarDescuentos) {
                        var uiTextoDescuentoSku = $("#UiTextoDescuentoSku");
                        var cantidadDeDescuento = uiTextoDescuentoSku.val() === ""
                            ? 0
                            : parseFloat(uiTextoDescuentoSku.val());
                        if (cantidadDeDescuento > resultadoDescuento.discount) {
                            elDescuentoIngresadoSobrepasaLoMaximo = true;
                            var uiListaSkuMedidas = $("#UiTextoDescuentoSku");
                            uiListaSkuMedidas.focus();
                            uiListaSkuMedidas = null;
                        }
                        else {
                            resultadoDescuento.qty = cantidadDeDescuento;
                            paquete.appliedDiscount = cantidadDeDescuento;
                            paquete.discountType = resultadoDescuento.discountType;
                            paquete.isUniqueDiscountScale = resultadoDescuento.isUnique;
                        }
                        cantidadDeDescuento = null;
                        uiTextoDescuentoSku = null;
                    }
                    else {
                        paquete.appliedDiscount = resultadoDescuento.qty;
                        paquete.discountType = resultadoDescuento.discountType;
                        paquete.isUniqueDiscountScale = resultadoDescuento.isUnique;
                    }
                    paquete.promoDescuento.promoId = resultadoDescuento.promoId;
                    paquete.promoDescuento.promoName = resultadoDescuento.promoName;
                    paquete.promoDescuento.promoType = resultadoDescuento.promoType;
                    paquete.promoDescuento.frequency = resultadoDescuento.frequency;
                    _this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(function () {
                        var totalDescuento = paquete.qty * paquete.price;
                        var sku = new Sku();
                        sku.total = paquete.price * paquete.qty;
                        sku.discount = paquete.appliedDiscount;
                        sku.discountType = paquete.discountType;
                        sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                        totalDescuento = _this.descuentoServicio.aplicarLosDescuentos(sku, sku.isUniqueDiscountScale, _this.listaDeOrdenAplicarDescuentos, _this.descuentoPorMontoGeneralYFamilia, _this.descuentoPorFamiliaYTipoPago);
                        var uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
                        uiEtiquetaTotalCdUnidadMedida.text("Total CD: " + DarFormatoAlMonto(format_number(totalDescuento, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                        uiEtiquetaTotalCdUnidadMedida = null;
                        if (elDescuentoIngresadoSobrepasaLoMaximo) {
                            errCallback({
                                codigo: -1,
                                mensaje: "El descuento sobrepasa lo máximo establecido."
                            });
                        }
                        else {
                            if (callBack) {
                                callBack();
                            }
                        }
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }
                else {
                    _this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(function () {
                        var totalDescuento = paquete.qty * paquete.price;
                        var sku = new Sku();
                        sku.total = paquete.price * paquete.qty;
                        sku.discount = 0;
                        sku.discountType = "";
                        sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                        totalDescuento = _this.descuentoServicio.aplicarLosDescuentos(sku, paquete.isUniqueDiscountScale, _this.listaDeOrdenAplicarDescuentos, _this.descuentoPorMontoGeneralYFamilia, _this.descuentoPorFamiliaYTipoPago);
                        var uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
                        uiEtiquetaTotalCdUnidadMedida.css("display", "block");
                        uiEtiquetaTotalCdUnidadMedida.css("display", "inline");
                        uiEtiquetaTotalCdUnidadMedida.text("Total CD: " + DarFormatoAlMonto(format_number(totalDescuento, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                        uiEtiquetaTotalCdUnidadMedida = null;
                        totalDescuento = null;
                        if (elDescuentoIngresadoSobrepasaLoMaximo) {
                            errCallback({
                                codigo: -1,
                                mensaje: "El descuento sobrepasa lo máximo establecido."
                            });
                        }
                        else {
                            if (callBack) {
                                callBack();
                            }
                        }
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }
                resultadoDescuento = null;
                restultadoPrecioEspecial = null;
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al establecer bonificaciones: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.cargarControlesDeDescuento = function (callBack, errCallback) {
        var _this = this;
        try {
            var uiListViewDescuento = $("#UiLiDescuentoSkuMaximo");
            uiListViewDescuento.css("display", "none");
            uiListViewDescuento = null;
            var uiEtiquetaTotalCdUnidadMedida = $("#UiEtiquetaTotalCDUnidadMedida");
            uiEtiquetaTotalCdUnidadMedida.css("display", "none");
            uiEtiquetaTotalCdUnidadMedida = null;
            this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(function () {
                _this.obtenerPaqueteSeleccionado(function (paquete) {
                    var restultadoPrecioEspecial = _this
                        .listaDePreciosEspeciales.find(function (precioEspecial) {
                        return (_this.paqueteSeleccionadoActual.codePackUnit ===
                            precioEspecial.codePackUnit &&
                            (precioEspecial.lowLimit <= paquete.qty &&
                                paquete.qty <= precioEspecial.highLimit));
                    });
                    if (restultadoPrecioEspecial) {
                        paquete.basePrice = paquete.price;
                        if (_this.usuarioPuedeModificarPrecioDeProducto) {
                            var uiTxtPrecioNegociadoConCliente = $("#UiTxtPrecioNegociadoConCliente");
                            paquete.price =
                                uiTxtPrecioNegociadoConCliente.val() === "" ||
                                    isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                                    parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                                    ? paquete.price
                                    : parseFloat(uiTxtPrecioNegociadoConCliente.val());
                            uiTxtPrecioNegociadoConCliente = null;
                        }
                        else {
                            paquete.price = restultadoPrecioEspecial.specialPrice;
                        }
                        paquete.originalPrice = restultadoPrecioEspecial.specialPrice;
                        paquete.specialPrice = restultadoPrecioEspecial;
                    }
                    else {
                        if (_this.usuarioPuedeModificarPrecioDeProducto) {
                            var uiTxtPrecioNegociadoConCliente = $("#UiTxtPrecioNegociadoConCliente");
                            paquete.price =
                                uiTxtPrecioNegociadoConCliente.val() === "" ||
                                    isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                                    parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                                    ? paquete.price
                                    : parseFloat(uiTxtPrecioNegociadoConCliente.val());
                            uiTxtPrecioNegociadoConCliente = null;
                        }
                    }
                    if (paquete.specialPrice.applyDiscount) {
                        var resultadoDeDescuento_1 = _this
                            .listaDeDescuento.find(function (descuento) {
                            return (_this.paqueteSeleccionadoActual.codePackUnit ===
                                descuento.codePackUnit &&
                                (descuento.lowLimit <= paquete.qty &&
                                    paquete.qty <= descuento.highLimit));
                        });
                        if (resultadoDeDescuento_1) {
                            var resultadoListaDeDescuento = _this.listaDeDescuento.filter(function (descuento) {
                                return (_this.paqueteSeleccionadoActual.codePackUnit ===
                                    descuento.codePackUnit &&
                                    (descuento.lowLimit !== resultadoDeDescuento_1.lowLimit &&
                                        resultadoDeDescuento_1.highLimit !==
                                            descuento.highLimit));
                            });
                            if (resultadoListaDeDescuento &&
                                resultadoListaDeDescuento.length > 0) {
                                resultadoListaDeDescuento.map(function (descuento) {
                                    descuento.qty = -1;
                                });
                            }
                            resultadoListaDeDescuento = null;
                            var uiListViewDescuento_1 = $("#UiLiDescuentoSkuMaximo");
                            uiListViewDescuento_1.css("display", "block");
                            uiListViewDescuento_1 = null;
                            var textoAMostrar = "";
                            switch (resultadoDeDescuento_1.discountType.toString()) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    textoAMostrar = "Descuento: " + resultadoDeDescuento_1.discount + "%";
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    textoAMostrar = "Descuento: " + DarFormatoAlMonto(format_number(resultadoDeDescuento_1.discount, _this.configuracionDeDecimales.defaultDisplayDecimals));
                                    break;
                            }
                            var uiEtiquetaDescuentoSkuMaximo = $("#UiEtiquetaDescuentoSkuMaximo");
                            uiEtiquetaDescuentoSkuMaximo.text(textoAMostrar);
                            uiEtiquetaDescuentoSkuMaximo = null;
                            var uiDivIngresoDescuentoSku = $("#UiDivIngresoDescuentoSku");
                            uiDivIngresoDescuentoSku.css("display", "none");
                            if (_this.usuarioPuedeModificarDescuentos) {
                                uiDivIngresoDescuentoSku.css("display", "block");
                                if (localStorage.getItem("USE_MAX_DISCOUNT") ===
                                    SiNo.Si.toString()) {
                                    if (resultadoDeDescuento_1.qty === -1) {
                                        resultadoDeDescuento_1.qty =
                                            paquete.appliedDiscount > 0
                                                ? paquete.appliedDiscount
                                                : resultadoDeDescuento_1.discount;
                                    }
                                }
                                var uiTextoDescuentoSku_1 = $("#UiTextoDescuentoSku");
                                uiTextoDescuentoSku_1.val(resultadoDeDescuento_1.qty > 0
                                    ? resultadoDeDescuento_1.qty
                                    : "");
                                uiTextoDescuentoSku_1 = null;
                            }
                            else {
                                resultadoDeDescuento_1.qty = resultadoDeDescuento_1.discount;
                            }
                            var totalDescuento = paquete.qty * paquete.price;
                            var sku = new Sku();
                            sku.total = paquete.price * paquete.qty;
                            sku.discount = totalDescuento;
                            sku.discountType = paquete.discountType;
                            sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                            totalDescuento = _this.descuentoServicio.aplicarLosDescuentos(sku, sku.isUniqueDiscountScale, _this.listaDeOrdenAplicarDescuentos, _this.descuentoPorMontoGeneralYFamilia, _this.descuentoPorFamiliaYTipoPago);
                            var uiEtiquetaTotalCdUnidadMedida_1 = $("#UiEtiquetaTotalCDUnidadMedida");
                            uiEtiquetaTotalCdUnidadMedida_1.css("display", "block");
                            uiEtiquetaTotalCdUnidadMedida_1.css("display", "inline");
                            uiEtiquetaTotalCdUnidadMedida_1.text("Total CD: " + DarFormatoAlMonto(format_number(totalDescuento, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            uiEtiquetaTotalCdUnidadMedida_1 = null;
                            var uiTextoDescuentoSku = $("#UiTextoDescuentoSku");
                            uiTextoDescuentoSku.val(resultadoDeDescuento_1.discount);
                            uiTextoDescuentoSku = null;
                            uiDivIngresoDescuentoSku = null;
                        }
                        else {
                            var totalDescuento = paquete.qty * paquete.price;
                            var sku = new Sku();
                            sku.total = paquete.price * paquete.qty;
                            sku.discount = 0;
                            sku.discountType = "";
                            sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                            totalDescuento = _this.descuentoServicio.aplicarLosDescuentos(sku, paquete.isUniqueDiscountScale, _this.listaDeOrdenAplicarDescuentos, _this.descuentoPorMontoGeneralYFamilia, _this.descuentoPorFamiliaYTipoPago);
                            var uiEtiquetaTotalCdUnidadMedida_2 = $("#UiEtiquetaTotalCDUnidadMedida");
                            uiEtiquetaTotalCdUnidadMedida_2.css("display", "block");
                            uiEtiquetaTotalCdUnidadMedida_2.css("display", "inline");
                            uiEtiquetaTotalCdUnidadMedida_2.text("Total CD: " + DarFormatoAlMonto(format_number(totalDescuento, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            uiEtiquetaTotalCdUnidadMedida_2 = null;
                            totalDescuento = null;
                        }
                        resultadoDeDescuento_1 = null;
                        callBack();
                    }
                    else {
                        callBack();
                    }
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
                mensaje: "Error al establecer bonificaciones: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.obtenerOrdenParaAplicarDescuentos = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtenerOrdeParaAplicarDescuentos(function (listaDeOrdenAplicarDescuentos) {
                _this.listaDeOrdenAplicarDescuentos = listaDeOrdenAplicarDescuentos;
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
    DenominacionSkuControlador.prototype.obtenerDescuentoPorMontoGeneral = function (total, callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtenerDescuentoPorMontoGeneral(this.cliente, total, function (descuentoPorMontoGeneral) {
                var resultadoDePromoHistorico = _this
                    .listaHistoricoDePromos.find(function (promo) {
                    return promo.promoId === descuentoPorMontoGeneral.promoId;
                });
                if (resultadoDePromoHistorico) {
                    var promoDeBonificacion = new Promo();
                    promoDeBonificacion.promoId = descuentoPorMontoGeneral.promoId;
                    promoDeBonificacion.promoName = descuentoPorMontoGeneral.promoName;
                    promoDeBonificacion.frequency = descuentoPorMontoGeneral.frequency;
                    _this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico, function (aplicaPromo) {
                        if (aplicaPromo) {
                            descuentoPorMontoGeneral.apply = true;
                            _this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
                        }
                        else {
                            _this.descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
                        }
                        callback();
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }
                else {
                    _this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
                    callback();
                }
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener el descuento por monto general: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.seAplicaElDescuentoModificado = function (descuentoOriginalDeModificacion, descuentoModificado, descuentoNuevo) {
        return (descuentoOriginalDeModificacion !== 0 &&
            descuentoModificado <= descuentoNuevo);
    };
    DenominacionSkuControlador.prototype.obtenerHistoricodePromo = function (callBack, errCallback) {
        var _this = this;
        try {
            this.promoServicio.obtenerHistoricoDePromosParaCliente(this.cliente, function (listaHistoricoDePromos) {
                _this.listaHistoricoDePromos = listaHistoricoDePromos;
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
    DenominacionSkuControlador.prototype.validarSiAplicaLaBonificaciones = function (listaDeBonificaciones, indiceDeListaDeBonificaciones, esBonificacionPorEscala, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeBonificacionesTerminoDeIterar(listaDeBonificaciones, indiceDeListaDeBonificaciones)) {
                    var bonificacionAValidar_1 = listaDeBonificaciones[indiceDeListaDeBonificaciones];
                    var resultadoDePromoHistorico_1 = this
                        .listaHistoricoDePromos.find(function (promo) {
                        return (promo.promoId ===
                            (esBonificacionPorEscala
                                ? bonificacionAValidar_1.promoIdScale
                                : bonificacionAValidar_1.promoIdMultiple));
                    });
                    if (resultadoDePromoHistorico_1) {
                        var promoDeBonificacion = new Promo();
                        promoDeBonificacion.promoId = esBonificacionPorEscala
                            ? bonificacionAValidar_1.promoIdScale
                            : bonificacionAValidar_1.promoIdMultiple;
                        promoDeBonificacion.promoName = esBonificacionPorEscala
                            ? bonificacionAValidar_1.promoNameScale
                            : bonificacionAValidar_1.promoNameMultiple;
                        promoDeBonificacion.frequency = esBonificacionPorEscala
                            ? bonificacionAValidar_1.frequencyScale
                            : bonificacionAValidar_1.frequencyMultiple;
                        this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico_1, function (aplicaBonificacion) {
                            if (!aplicaBonificacion) {
                                listaDeBonificaciones = listaDeBonificaciones.filter(function (bonificacion) {
                                    return (resultadoDePromoHistorico_1.promoId !==
                                        (esBonificacionPorEscala
                                            ? bonificacion.promoIdScale
                                            : bonificacion.promoIdMultiple));
                                });
                            }
                            _this.validarSiAplicaLaBonificaciones(listaDeBonificaciones, indiceDeListaDeBonificaciones + (aplicaBonificacion ? 1 : 0), esBonificacionPorEscala, function (listaDeBonificaciones) {
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
                        this.validarSiAplicaLaBonificaciones(listaDeBonificaciones, indiceDeListaDeBonificaciones + 1, esBonificacionPorEscala, function (listaDeBonificaciones) {
                            callBack(listaDeBonificaciones);
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
                mensaje: "Error al validar la si aplica la bonificaci\u00F3n: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.listaDeBonificacionesTerminoDeIterar = function (listaDeBonificaciones, indiceDeListaDeBonificaciones) {
        return (listaDeBonificaciones.length > 0 &&
            listaDeBonificaciones.length > indiceDeListaDeBonificaciones);
    };
    DenominacionSkuControlador.prototype.validarSiAplicaElDescuento = function (listaDeDescuento, indiceDeListaDeDescuento, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_1 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_2 = this
                        .listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_1.promoId;
                    });
                    if (resultadoDePromoHistorico_2) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_1.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_1.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_1.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_2, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return (resultadoDePromoHistorico_2.promoId !== descuento.promoId);
                                });
                            }
                            _this.validarSiAplicaElDescuento(listaDeDescuento, indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0), function (listaDeDescuento) {
                                callBack(listaDeDescuento);
                            }, function (resultado) {
                                errCallback(resultado);
                            });
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                        promoDeDescuento = null;
                    }
                    else {
                        this.validarSiAplicaElDescuento(listaDeDescuento, indiceDeListaDeDescuento + 1, function (listaDeDescuento) {
                            callBack(listaDeDescuento);
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                    }
                }
                else {
                    callBack(listaDeDescuento);
                }
            }
            else {
                callBack(listaDeDescuento);
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar la si aplica el descuento: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.listaDeDescuentoTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 &&
            listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    DenominacionSkuControlador.prototype.validarSiAplicaElDescuentoPorMontoGeneralYFamilia = function (descuentoAValidar, indiceDeListaDeDescuento, callBack, errCallback) {
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                var resultadoDePromoHistorico = this
                    .listaHistoricoDePromos.find(function (promo) {
                    return promo.promoId === descuentoAValidar.promoId;
                });
                if (resultadoDePromoHistorico) {
                    var promoDeDescuento = new Promo();
                    promoDeDescuento.promoId = descuentoAValidar.promoId;
                    promoDeDescuento.promoName = descuentoAValidar.promoName;
                    promoDeDescuento.frequency = descuentoAValidar.frequency;
                    this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico, function (aplicaDescuento) {
                        if (!aplicaDescuento) {
                            descuentoAValidar = new DescuentoPorMontoGeneralYFamilia();
                        }
                        callBack(descuentoAValidar);
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }
                else {
                    callBack(descuentoAValidar);
                }
            }
            else {
                callBack(descuentoAValidar);
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar la si aplica el descuento por monto general y familia: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.validarSiAplicaElDescuentoPorFamiliaYTipoPago = function (descuentoAValidar, indiceDeListaDeDescuento, callBack, errCallback) {
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                var resultadoDePromoHistorico = this
                    .listaHistoricoDePromos.find(function (promo) {
                    return promo.promoId === descuentoAValidar.promoId;
                });
                if (resultadoDePromoHistorico) {
                    var promoDeDescuento = new Promo();
                    promoDeDescuento.promoId = descuentoAValidar.promoId;
                    promoDeDescuento.promoName = descuentoAValidar.promoName;
                    promoDeDescuento.frequency = descuentoAValidar.frequency;
                    this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico, function (aplicaDescuento) {
                        if (!aplicaDescuento) {
                            descuentoAValidar = new DescuentoPorFamiliaYTipoPago();
                        }
                        callBack(descuentoAValidar);
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }
                else {
                    callBack(descuentoAValidar);
                }
            }
            else {
                callBack(descuentoAValidar);
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar la si aplica el descuento por familia y tipo pago: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.ObtenerTotalDeLaOrden = function (callBack, errCallback) {
        try {
            var totalOrden = this.tarea.salesOrderTotal;
            callBack(totalOrden);
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener el total: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.cargarPreciosEspeciales = function (callback, errCallback) {
        var _this = this;
        try {
            var sku = new Sku();
            sku.sku = this.sku.sku;
            this.precioEspecialServicio.obtenerPreciosEspecialesPorCliente(0, this.cliente, sku, function (listaDePreciosEspeciales) {
                _this.listaDePreciosEspeciales = listaDePreciosEspeciales;
                callback();
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al obtener descuentos: " + ex.message
            });
        }
    };
    DenominacionSkuControlador.prototype.limpiarInformacionDeHistoricoDeSku = function () {
        var uiEtiquetaFechaUltimaCompra = $("#UiEtiquetaFechaUltimaCompra");
        uiEtiquetaFechaUltimaCompra.text("");
        uiEtiquetaFechaUltimaCompra = null;
        var uiEtiquetaCantidadUltimaCompra = $("#UiEtiquetaCantidadUltimaCompra");
        uiEtiquetaCantidadUltimaCompra.text("");
        uiEtiquetaCantidadUltimaCompra = null;
        var uiEtiquetaUnidadDeMedidaUltimaCompra = $("#UiEtiquetaUnidadDeMedidaUltimaCompra");
        uiEtiquetaUnidadDeMedidaUltimaCompra.text("");
        uiEtiquetaUnidadDeMedidaUltimaCompra = null;
        var uiEtiquetaPrecioUltimaCompra = $("#UiEtiquetaPrecioUltimaCompra");
        uiEtiquetaPrecioUltimaCompra.text("");
        uiEtiquetaPrecioUltimaCompra = null;
        var uiLiUltimoPedidoUnidadMedida = $("#UiLiUltimoPedidoUnidadMedida");
        uiLiUltimoPedidoUnidadMedida.hide();
        uiLiUltimoPedidoUnidadMedida = null;
    };
    DenominacionSkuControlador.prototype.obtenerAutorizacionDeModificacionDePrecioDeProducto = function (callback) {
        var _this = this;
        try {
            ObtenerReglas(ReglaTipo.OperadorPuedeModificarPrecioDeProducto.toString(), function (reglas) {
                _this.usuarioPuedeModificarPrecioDeProducto =
                    reglas.rows.length > 0 &&
                        reglas.rows.item(0).ENABLED.toUpperCase() === "SI";
                var uiLiPrecioNegociadoConCliente = $("#UiLiPrecioNegociadoConCliente");
                if (_this.usuarioPuedeModificarPrecioDeProducto) {
                    uiLiPrecioNegociadoConCliente.show();
                }
                else {
                    uiLiPrecioNegociadoConCliente.hide();
                }
                uiLiPrecioNegociadoConCliente = null;
                _this.sku.canNegotiatePrice = _this.usuarioPuedeModificarPrecioDeProducto;
                callback();
            }, function (error) {
                notify(error);
            });
        }
        catch (error) {
            notify(error);
        }
    };
    return DenominacionSkuControlador;
}());
//# sourceMappingURL=DenominacionSkuControlador.js.map