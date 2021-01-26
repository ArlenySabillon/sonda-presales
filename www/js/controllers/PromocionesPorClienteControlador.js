var PromocionesPorClienteControlador = (function () {
    function PromocionesPorClienteControlador() {
        this.cliente = new Cliente();
        this.configuracionDeDecimales = new ManejoDeDecimales();
        this.listaHistoricoDePromos = [];
        this.promoServicio = new PromoServicio();
        this.descuentoServicio = new DescuentoServicio();
        this.bonoServicio = new BonoServicio();
    }
    PromocionesPorClienteControlador.prototype.delegarPromocionesPorClienteControlador = function () {
        var este = this;
        document.addEventListener("backbutton", function () {
            este.mostrarPantallaAnterior();
        }, true);
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "PantallaDePromociones") {
                este.cliente = data.options.data.cliente;
                este.configuracionDeDecimales = data.options.data.configuracionDecimales;
                este.limpiarControles(function () {
                    este.cargarPantalla(function () {
                        my_dialog("", "", "closed");
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
                $.mobile.changePage("#PantallaDePromociones");
            }
        });
    };
    PromocionesPorClienteControlador.prototype.mostrarPantallaAnterior = function () {
        switch ($.mobile.activePage[0].id) {
            case "PantallaDePromociones":
                window.history.back();
                break;
        }
    };
    PromocionesPorClienteControlador.prototype.limpiarControles = function (callback, errCallback) {
        try {
            var uiContenedorDePromociones = $('#UiContenedorDePromociones');
            uiContenedorDePromociones.empty();
            uiContenedorDePromociones = null;
            callback();
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al limpiar los controles: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.cargarPantalla = function (callback, errCallback) {
        var _this = this;
        try {
            my_dialog('Sonda® ' + SondaVersion, "Cargando promociones...", "open");
            this.obtenerHistoricodePromo(function () {
                _this.generarAcordionDePromoDescuentosPorEscala(function () {
                    _this.generarAcordionDePromoDescuentosPorMontoGeneral(function () {
                        _this.generarAcordionDePromoDescuentosPorEscalaYFamilia(function() {
                            _this.generarAcordionDePromoDescuentosPorMontoYFamilia(function () {
                                _this.generarAcordionDePromoDescuentosPorFamiliaYTipoPago(function () {
                                    _this.generarAcordionDePromoBonificacionPorMontoGeneral(function () {
                                        _this.generarAcordionDePromoBonificacionesPorEscala(function () {
                                            _this.generarAcordionDePromoBonificacionesPorMultiplo(function () {
                                                _this.generarAcordionDePromoBonificacionesPorCombo(function () {
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
                                }, function (resultado) {
                                    errCallback(resultado);
                                });
                            }, function (resultado) {
                                errCallback(resultado);
                            });
                        
                        }, function (resultado) {
                            errCallback(resultado);
                        });

                    }, function(resultado){
                        errCallback(resultado)
                    });
                    
                }, function (resultado) {
                    errCallback(resultado);
                });
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al cargar los controles: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoDescuentosPorEscala = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtenerTodosLosDescuentosDeEscalaPorCliente(this.cliente, function (listaDeDescuentos) {
                _this.validarSiAplicaElDescuento(listaDeDescuentos, 0, function (listaDeDescuentosDisponibles) {
                    var listaDescuentos = listaDeDescuentosDisponibles;
                    if (listaDescuentos.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_1 = [];
                        listaAcordion_1.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionDescuentoPorEscala\">");
                        listaAcordion_1.push("<h5>Descuentos por Escala<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaDescuentos.length + "</span></h5>");
                        listaAcordion_1.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_1.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_1.push("<th class=\"filaPromo\">Sku</th>");
                        listaAcordion_1.push("<th class=\"filaPromo\">Escala</th>");
                        listaAcordion_1.push("<th class=\"filaPromo\">Descuento</th>");
                        listaAcordion_1.push("</tr>");
                        listaDescuentos.map(function (descuento) {
                            listaAcordion_1.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_1.push("<td class=\"filaPromo\">");
                            listaAcordion_1.push("" + descuento.codeSku);
                            listaAcordion_1.push("</td>");
                            listaAcordion_1.push("<td class=\"filaPromo\">");
                            listaAcordion_1.push(descuento.lowLimit + "-" + descuento.highLimit + " " + descuento.codePackUnit);
                            listaAcordion_1.push("</td>");
                            listaAcordion_1.push("<td class=\"filaPromo\">");
                            switch (descuento.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaAcordion_1.push(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaAcordion_1.push("" + DarFormatoAlMonto(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                    break;
                            }
                            listaAcordion_1.push("</td>");
                            listaAcordion_1.push("</tr>");
                        });
                        listaAcordion_1.push("</table>");
                        listaAcordion_1.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_1.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoDescuentosPorMontoGeneral = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtenerDescuentosPorMontoGeneralPorCliente(this.cliente, function (listaDeDescuentos) {
                _this.validarSiAplicaElDescuentoPorMontoGeneral(listaDeDescuentos, 0, function (listaDeDescuentosDisponibles) {
                    var listaDescuento = listaDeDescuentosDisponibles;
                    if (listaDescuento.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_2 = [];
                        listaAcordion_2.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionDescuentoPorMontoGeneral\">");
                        listaAcordion_2.push("<h5>DMG<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaDescuento.length + "</span></h5>");
                        listaAcordion_2.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_2.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_2.push("<th class=\"filaPromo\">LI</th>");
                        listaAcordion_2.push("<th class=\"filaPromo\">LS</th>");
                        listaAcordion_2.push("<th class=\"filaPromo\">Descuento</th>");
                        listaAcordion_2.push("</tr>");
                        listaDescuento.map(function (descuento) {
                            listaAcordion_2.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_2.push("<td class=\"filaPromo\">");
                            listaAcordion_2.push("" + DarFormatoAlMonto(format_number(descuento.lowAmount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_2.push("</td>");
                            listaAcordion_2.push("<td class=\"filaPromo\">");
                            listaAcordion_2.push("" + DarFormatoAlMonto(format_number(descuento.highAmount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_2.push("</td>");
                            listaAcordion_2.push("<td class=\"filaPromo\">");
                            listaAcordion_2.push(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                            listaAcordion_2.push("</td>");
                            listaAcordion_2.push("</tr>");
                        });
                        listaAcordion_2.push("</table>");
                        listaAcordion_2.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_2.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoDescuentosPorMontoYFamilia = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtenerListaDeDescuentoPorMontoGeneralYFamilia(this.cliente, function (listaDeDescuentos) {
                _this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDeDescuentos, 0, function (listaDeDescuentosDisponibles) {
                    var listaDescuento = listaDeDescuentosDisponibles;
                    if (listaDescuento.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_3 = [];
                        listaAcordion_3.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionDescuentoPorEscalaYFamilia\">");
                        listaAcordion_3.push("<h5>DMF<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaDescuento.length + "</span></h5>");
                        listaAcordion_3.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_3.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_3.push("<th class=\"filaPromo\">Familia</th>");
                        listaAcordion_3.push("<th class=\"filaPromo\">LI</th>");
                        listaAcordion_3.push("<th class=\"filaPromo\">LS</th>");
                        listaAcordion_3.push("<th class=\"filaPromo\">Descuento</th>");
                        listaAcordion_3.push("</tr>");
                        listaDescuento.map(function (descuento) {
                            listaAcordion_3.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            listaAcordion_3.push("" + descuento.descriptionFamilySku);
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            listaAcordion_3.push("" + DarFormatoAlMonto(format_number(descuento.lowAmount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            listaAcordion_3.push("" + DarFormatoAlMonto(format_number(descuento.highAmount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            switch (descuento.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaAcordion_3.push(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaAcordion_3.push("" + DarFormatoAlMonto(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                    break;
                            }
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("</tr>");
                        });
                        listaAcordion_3.push("</table>");
                        listaAcordion_3.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_3.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };

    PromocionesPorClienteControlador.prototype.generarAcordionDePromoDescuentosPorEscalaYFamilia = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtener(this.cliente, function (listaDeDescuentos) {
                _this.validarSiAplicaElDescuentoPorEscalaYFamilia(listaDeDescuentos, 0, function (listaDeDescuentosDisponibles) {
                    var listaDescuento = listaDeDescuentosDisponibles;
                    if (listaDescuento.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_3 = [];
                        listaAcordion_3.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionDescuentoPorEscalaYFamilia\">");
                        listaAcordion_3.push("<h5>DMF<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaDescuento.length + "</span></h5>");
                        listaAcordion_3.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_3.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_3.push("<th class=\"filaPromo\">Familia</th>");
                        listaAcordion_3.push("<th class=\"filaPromo\">LI</th>");
                        listaAcordion_3.push("<th class=\"filaPromo\">LS</th>");
                        listaAcordion_3.push("<th class=\"filaPromo\">Descuento</th>");
                        listaAcordion_3.push("</tr>");
                        listaDescuento.map(function (descuento) {
                            listaAcordion_3.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            listaAcordion_3.push("" + descuento.descriptionFamilySku);
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            listaAcordion_3.push("" + DarFormatoAlMonto(format_number(descuento.lowAmount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            listaAcordion_3.push("" + DarFormatoAlMonto(format_number(descuento.highAmount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("<td class=\"filaPromo\">");
                            switch (descuento.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaAcordion_3.push(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaAcordion_3.push("" + DarFormatoAlMonto(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                    break;
                            }
                            listaAcordion_3.push("</td>");
                            listaAcordion_3.push("</tr>");
                        });
                        listaAcordion_3.push("</table>");
                        listaAcordion_3.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_3.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };

    PromocionesPorClienteControlador.prototype.generarAcordionDePromoDescuentosPorFamiliaYTipoPago = function (callback, errCallback) {
        var _this = this;
        try {
            this.descuentoServicio.obtenerDescuentoPorFamiliaYTipoPagoPorCliente(this.cliente, function (listaDeDescuentos) {
                _this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDeDescuentos, 0, function (listaDeDescuentosDisponibles) {
                    var listaDescuento = listaDeDescuentosDisponibles;
                    if (listaDescuento.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_4 = [];
                        listaAcordion_4.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionDescuentoPorFamiliaYTipoPago\">");
                        listaAcordion_4.push("<h5>DTPF<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaDescuento.length + "</span></h5>");
                        listaAcordion_4.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_4.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_4.push("<th class=\"filaPromo\">Familia</th>");
                        listaAcordion_4.push("<th class=\"filaPromo\">Tipo Pago</th>");
                        listaAcordion_4.push("<th class=\"filaPromo\">Descuento</th>");
                        listaAcordion_4.push("</tr>");
                        listaDescuento.map(function (descuento) {
                            listaAcordion_4.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_4.push("<td class=\"filaPromo\">");
                            listaAcordion_4.push("" + descuento.descriptionFamilySku);
                            listaAcordion_4.push("</td>");
                            listaAcordion_4.push("<td class=\"filaPromo\">");
                            switch (descuento.paymentType) {
                                case TiposDePago.Credito.toString():
                                    listaAcordion_4.push("Credito");
                                    break;
                                case TiposDePago.Contado.toString():
                                    listaAcordion_4.push("Contado");
                                    break;
                            }
                            listaAcordion_4.push("</td>");
                            listaAcordion_4.push("<td class=\"filaPromo\">");
                            switch (descuento.discountType) {
                                case TiposDeDescuento.Porcentaje.toString():
                                    listaAcordion_4.push(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals) + "%");
                                    break;
                                case TiposDeDescuento.Monetario.toString():
                                    listaAcordion_4.push("" + DarFormatoAlMonto(format_number(descuento.discount, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                                    break;
                            }
                            listaAcordion_4.push("</td>");
                            listaAcordion_4.push("</tr>");
                        });
                        listaAcordion_4.push("</table>");
                        listaAcordion_4.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_4.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoBonificacionPorMontoGeneral = function (callback, errCallback) {
        var _this = this;
        try {
            this.bonoServicio.obtenerBonificacionPorMontoGeneralPorCliente(this.cliente, function (listaDeBonificacion) {
                _this.validarSiAplicaLaBonificacionesPorMontoGeneral(listaDeBonificacion, 0, function (listaDeBonificacionDisponibles) {
                    var listaBonificacion = listaDeBonificacionDisponibles;
                    if (listaBonificacion.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_5 = [];
                        listaAcordion_5.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionBonificacionPorMontoGeneral\">");
                        listaAcordion_5.push("<h5>BMG<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaBonificacion.length + "</span></h5>");
                        listaAcordion_5.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_5.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_5.push("<th class=\"filaPromo\">Compra</th>");
                        listaAcordion_5.push("<th class=\"filaPromo\">Bonificaciones</th>");
                        listaAcordion_5.push("</tr>");
                        listaBonificacion.map(function (bonificacion) {
                            listaAcordion_5.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_5.push("<td class=\"filaPromo\">");
                            listaAcordion_5.push(DarFormatoAlMonto(format_number(bonificacion.lowLimit, _this.configuracionDeDecimales.defaultDisplayDecimals)) + "-" + DarFormatoAlMonto(format_number(bonificacion.highLimit, _this.configuracionDeDecimales.defaultDisplayDecimals)));
                            listaAcordion_5.push("</td>");
                            listaAcordion_5.push("<td class=\"filaPromo\">");
                            listaAcordion_5.push(format_number(bonificacion.bonusQty, _this.configuracionDeDecimales.defaultDisplayDecimals) + "-" + bonificacion.codePackUnitBonus + "-" + bonificacion.codeSkuBonus);
                            listaAcordion_5.push("</td>");
                            listaAcordion_5.push("</tr>");
                        });
                        listaAcordion_5.push("</table>");
                        listaAcordion_5.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_5.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoBonificacionesPorEscala = function (callback, errCallback) {
        var _this = this;
        try {
            this.bonoServicio.obtenerTodasLasBonificacionPorEscalaPorCliente(this.cliente, function (listaDeBonificacion) {
                _this.validarSiAplicaLaBonificacionesPorEscala(listaDeBonificacion, 0, function (listaDeBonificacionDisponibles) {
                    var listaBonificacion = listaDeBonificacionDisponibles;
                    if (listaBonificacion.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_6 = [];
                        listaAcordion_6.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionBonificacionPorEscala\">");
                        listaAcordion_6.push("<h5>Bonificaciones por Escala<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaBonificacion.length + "</span></h5>");
                        listaAcordion_6.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_6.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_6.push("<th class=\"filaPromo\">Compra</th>");
                        listaAcordion_6.push("<th class=\"filaPromo\">Bonificaciones</th>");
                        listaAcordion_6.push("</tr>");
                        listaBonificacion.map(function (bonificacion) {
                            listaAcordion_6.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_6.push("<td class=\"filaPromo\">");
                            listaAcordion_6.push(format_number(bonificacion.lowLimitTemp, _this.configuracionDeDecimales.defaultDisplayDecimals) + "-" + DarFormatoAlMonto(format_number(bonificacion.highLimitTemp, _this.configuracionDeDecimales.defaultDisplayDecimals)) + "-" + bonificacion.codePackUnit + " " + bonificacion.codeSku);
                            listaAcordion_6.push("</td>");
                            listaAcordion_6.push("<td class=\"filaPromo\">");
                            listaAcordion_6.push(format_number(bonificacion.bonusQtyTemp, _this.configuracionDeDecimales.defaultDisplayDecimals) + "-" + bonificacion.codePackUnitBonues + "-" + bonificacion.codeSkuBonus);
                            listaAcordion_6.push("</td>");
                            listaAcordion_6.push("</tr>");
                        });
                        listaAcordion_6.push("</table>");
                        listaAcordion_6.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_6.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoBonificacionesPorMultiplo = function (callback, errCallback) {
        var _this = this;
        try {
            this.bonoServicio.obtenerTodasLasBonificacionesDeMultiploPorCliente(this.cliente, function (listaDeBonificacion) {
                _this.validarSiAplicaLaBonificacionesPorMultiplo(listaDeBonificacion, 0, function (listaDeBonificacionDisponbiles) {
                    var listaBonificacion = listaDeBonificacionDisponbiles;
                    if (listaBonificacion.length > 0) {
                        var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                        uiContenedorDePromociones.collapsibleset().trigger('create');
                        var listaAcordion_7 = [];
                        listaAcordion_7.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionBonificacionPorMultiplo\">");
                        listaAcordion_7.push("<h5>Bonificaciones por Multiplo<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + listaBonificacion.length + "</span></h5>");
                        listaAcordion_7.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                        listaAcordion_7.push("<tr class=\"filaCambioDeColor\">");
                        listaAcordion_7.push("<th class=\"filaPromo\">Por Cada</th>");
                        listaAcordion_7.push("<th class=\"filaPromo\">Bonifica</th>");
                        listaAcordion_7.push("</tr>");
                        listaBonificacion.map(function (bonificacion) {
                            listaAcordion_7.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_7.push("<td class=\"filaPromo\">");
                            listaAcordion_7.push(format_number(bonificacion.multiplo, _this.configuracionDeDecimales.defaultDisplayDecimals) + " " + bonificacion.codePackUnit + " " + bonificacion.codeSku);
                            listaAcordion_7.push("</td>");
                            listaAcordion_7.push("<td class=\"filaPromo\">");
                            listaAcordion_7.push(format_number(bonificacion.bonusQtyMultiplo, _this.configuracionDeDecimales.defaultDisplayDecimals) + "-" + bonificacion.codePackUnitBonues + "-" + bonificacion.codeSkuBonus);
                            listaAcordion_7.push("</td>");
                            listaAcordion_7.push("</tr>");
                        });
                        listaAcordion_7.push("</table>");
                        listaAcordion_7.push("</div>");
                        uiContenedorDePromociones.append(listaAcordion_7.join('')).collapsibleset('refresh');
                        uiContenedorDePromociones.trigger('create');
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
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.generarAcordionDePromoBonificacionesPorCombo = function (callback, errCallback) {
        var _this = this;
        try {
            if (this.cliente.bonoPorCombos.length > 0) {
                var uiContenedorDePromociones = $("#UiContenedorDePromociones");
                uiContenedorDePromociones.collapsibleset().trigger('create');
                var listaAcordion_8 = [];
                listaAcordion_8.push("<div is=\"collapsible\" data-role=\"collapsible\" id=\"UiAcordionBonificacionPorMultiplo\">");
                listaAcordion_8.push("<h5>Combos<span is=\"span\" class=\"ui-li-count\" id=\"Cant\">" + this.cliente.bonoPorCombos.length + "</span></h5>");
                listaAcordion_8.push("<table class=\"tablePromo\" style=\"width: 100%\">");
                listaAcordion_8.push("<tr class=\"filaCambioDeColor\">");
                listaAcordion_8.push("<th class=\"filaPromo\">Al comprar el Combo</th>");
                listaAcordion_8.push("<th class=\"filaPromo\">Tipo</th>");
                listaAcordion_8.push("<th class=\"filaPromo\">Bonifica</th>");
                listaAcordion_8.push("</tr>");
                this.cliente.bonoPorCombos.map(function (bonificacion) {
                    listaAcordion_8.push("<tr class=\"filaCambioDeColor\">");
                    listaAcordion_8.push("<td class=\"filaPromo\" rowspan=\"" + bonificacion.skusPorCombo.length + "\">");
                    listaAcordion_8.push("" + bonificacion.descriptionCombo);
                    listaAcordion_8.push("</td>");
                    listaAcordion_8.push("<td class=\"filaPromo\" rowspan=\"" + bonificacion.skusPorCombo.length + "\">");
                    listaAcordion_8.push(((bonificacion.isBonusByLowPurchase === 1) ? "Compra " + format_number(bonificacion.lowQty, _this.configuracionDeDecimales.defaultDisplayDecimals) + "Min" : "") + "-" + ((bonificacion.isBonusByCombo === 1) ? "Completo" : ""));
                    listaAcordion_8.push("<td class=\"filaPromo\">");
                    listaAcordion_8.push(format_number(bonificacion.skusPorCombo.length ? bonificacion.skusPorCombo[0].qty : 0, _this.configuracionDeDecimales.defaultDisplayDecimals) + " " + (bonificacion.skusPorCombo.length ? bonificacion.skusPorCombo[0].codePackUnit : "N/A") + " " + (bonificacion.skusPorCombo.length ? bonificacion.skusPorCombo[0].codeSku : "N/A"));
                    listaAcordion_8.push("</td>");
                    listaAcordion_8.push("</td>");
                    listaAcordion_8.push("</tr>");
                    var pasoYaPrimeraVez = false;
                    bonificacion.skusPorCombo.map(function (skuPorCombo) {
                        if (pasoYaPrimeraVez) {
                            listaAcordion_8.push("<tr class=\"filaCambioDeColor\">");
                            listaAcordion_8.push("<td class=\"filaPromo\">");
                            listaAcordion_8.push(format_number(skuPorCombo.qty, _this.configuracionDeDecimales.defaultDisplayDecimals) + " " + skuPorCombo.codePackUnit + " " + skuPorCombo.codeSku);
                            listaAcordion_8.push("</td>");
                            listaAcordion_8.push("</tr>");
                        }
                        else {
                            pasoYaPrimeraVez = true;
                        }
                    });
                });
                listaAcordion_8.push("</table>");
                listaAcordion_8.push("</div>");
                uiContenedorDePromociones.append(listaAcordion_8.join('')).collapsibleset('refresh');
                uiContenedorDePromociones.trigger('create');
                callback();
            }
            else {
                callback();
            }
        }
        catch (ex) {
            errCallback({ codigo: -1, mensaje: "Error al obtener acordion de promo: " + ex.message });
        }
    };
    PromocionesPorClienteControlador.prototype.obtenerHistoricodePromo = function (callBack, errCallback) {
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
    PromocionesPorClienteControlador.prototype.validarSiAplicaElDescuento = function (listaDeDescuento, indiceDeListaDeDescuento, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_1 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_1 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_1.promoId;
                    });
                    if (resultadoDePromoHistorico_1) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_1.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_1.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_1.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_1, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return resultadoDePromoHistorico_1.promoId !== descuento.promoId;
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
    PromocionesPorClienteControlador.prototype.listaDeDescuentoTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 && listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    PromocionesPorClienteControlador.prototype.validarSiAplicaElDescuentoPorMontoGeneral = function (listaDeDescuento, indiceDeListaDeDescuento, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoPorMontoGeneralTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_2 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_2 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_2.promoId;
                    });
                    if (resultadoDePromoHistorico_2) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_2.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_2.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_2.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_2, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return resultadoDePromoHistorico_2.promoId !== descuento.promoId;
                                });
                            }
                            _this.validarSiAplicaElDescuentoPorMontoGeneral(listaDeDescuento, indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0), function (listaDeDescuento) {
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
                        this.validarSiAplicaElDescuentoPorMontoGeneral(listaDeDescuento, indiceDeListaDeDescuento + 1, function (listaDeDescuento) {
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
    PromocionesPorClienteControlador.prototype.listaDeDescuentoPorMontoGeneralTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 && listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    PromocionesPorClienteControlador.prototype.validarSiAplicaElDescuentoPorMontoGeneralYFamilia = function (listaDeDescuento, indiceDeListaDeDescuento, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_3 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_3 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_3.promoId;
                    });
                    if (resultadoDePromoHistorico_3) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_3.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_3.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_3.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_3, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return resultadoDePromoHistorico_3.promoId !== descuento.promoId;
                                });
                            }
                            _this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDeDescuento, indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0), function (listaDeDescuento) {
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
                        this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDeDescuento, indiceDeListaDeDescuento + 1, function (listaDeDescuento) {
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
                mensaje: "Error al validar la si aplica el descuento por monto general y familia: " + ex.message
            });
        }
    };
    PromocionesPorClienteControlador.prototype.listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 && listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    PromocionesPorClienteControlador.prototype.validarSiAplicaElDescuentoPorFamiliaYTipoPago = function (listaDeDescuento, indiceDeListaDeDescuento, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoPorFamiliaYTipoPagoTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_4 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_4 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_4.promoId;
                    });
                    if (resultadoDePromoHistorico_4) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_4.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_4.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_4.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_4, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return resultadoDePromoHistorico_4.promoId !== descuento.promoId;
                                });
                            }
                            _this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDeDescuento, indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0), function (listaDeDescuento) {
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
                        this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDeDescuento, indiceDeListaDeDescuento + 1, function (listaDeDescuento) {
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
                mensaje: "Error al validar la si aplica el descuento por monto general y familia: " + ex.message
            });
        }
    };
    PromocionesPorClienteControlador.prototype.listaDeDescuentoPorFamiliaYTipoPagoTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 && listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    PromocionesPorClienteControlador.prototype.validarSiAplicaLaBonificacionesPorMontoGeneral = function (listaDeBonificaciones, indiceDeListaDeBonificacion, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeBonificacionesTerminoDeIterar(listaDeBonificaciones, indiceDeListaDeBonificacion)) {
                    var bonificacionAValidar_1 = listaDeBonificaciones[indiceDeListaDeBonificacion];
                    var resultadoDePromoHistorico_5 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === bonificacionAValidar_1.promoId;
                    });
                    if (resultadoDePromoHistorico_5) {
                        var promoDeBonificacion = new Promo();
                        promoDeBonificacion.promoId = bonificacionAValidar_1.promoId;
                        promoDeBonificacion.promoName = bonificacionAValidar_1.promoName;
                        promoDeBonificacion.frequency = bonificacionAValidar_1.frequency;
                        this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico_5, function (aplicaPromo) {
                            if (!aplicaPromo) {
                                listaDeBonificaciones = listaDeBonificaciones.filter(function (bonificacion) {
                                    return resultadoDePromoHistorico_5.promoId !== bonificacion.promoId;
                                });
                            }
                            _this.validarSiAplicaLaBonificacionesPorMontoGeneral(listaDeBonificaciones, indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0), function (listaDeBonificaciones) {
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
                        this.validarSiAplicaLaBonificacionesPorMontoGeneral(listaDeBonificaciones, indiceDeListaDeBonificacion + 1, function (listaDeDescuento) {
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
    PromocionesPorClienteControlador.prototype.listaDeBonificacionesTerminoDeIterar = function (listaDeBonificaciones, indiceDeListaDeBonificacion) {
        return (listaDeBonificaciones.length > 0 && listaDeBonificaciones.length > indiceDeListaDeBonificacion);
    };
    PromocionesPorClienteControlador.prototype.validarSiAplicaLaBonificacionesPorEscala = function (listaDeBonificaciones, indiceDeListaDeBonificacion, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeBonificacionesPorEscalaTerminoDeIterar(listaDeBonificaciones, indiceDeListaDeBonificacion)) {
                    var bonificacionAValidar_2 = listaDeBonificaciones[indiceDeListaDeBonificacion];
                    var resultadoDePromoHistorico_6 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === bonificacionAValidar_2.promoIdScale;
                    });
                    if (resultadoDePromoHistorico_6) {
                        var promoDeBonificacion = new Promo();
                        promoDeBonificacion.promoId = bonificacionAValidar_2.promoIdScale;
                        promoDeBonificacion.promoName = bonificacionAValidar_2.promoNameScale;
                        promoDeBonificacion.frequency = bonificacionAValidar_2.frequencyScale;
                        this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico_6, function (aplicaPromo) {
                            if (!aplicaPromo) {
                                listaDeBonificaciones = listaDeBonificaciones.filter(function (bonificacion) {
                                    return resultadoDePromoHistorico_6.promoId !== bonificacion.promoIdScale;
                                });
                            }
                            _this.validarSiAplicaLaBonificacionesPorEscala(listaDeBonificaciones, indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0), function (listaDeBonificaciones) {
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
                        this.validarSiAplicaLaBonificacionesPorEscala(listaDeBonificaciones, indiceDeListaDeBonificacion + 1, function (listaDeDescuento) {
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
                mensaje: "Error al validar la si aplica la bonificacion por escala: " + ex.message
            });
        }
    };
    PromocionesPorClienteControlador.prototype.listaDeBonificacionesPorEscalaTerminoDeIterar = function (listaDeBonificaciones, indiceDeListaDeBonificacion) {
        return (listaDeBonificaciones.length > 0 && listaDeBonificaciones.length > indiceDeListaDeBonificacion);
    };
    PromocionesPorClienteControlador.prototype.validarSiAplicaLaBonificacionesPorMultiplo = function (listaDeBonificaciones, indiceDeListaDeBonificacion, callBack, errCallback) {
        var _this = this;
        try {
            if (this.listaHistoricoDePromos.length > 0) {
                if (this.listaDeBonificacionesPorMultiploTerminoDeIterar(listaDeBonificaciones, indiceDeListaDeBonificacion)) {
                    var bonificacionAValidar_3 = listaDeBonificaciones[indiceDeListaDeBonificacion];
                    var resultadoDePromoHistorico_7 = this.listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === bonificacionAValidar_3.promoIdMultiple;
                    });
                    if (resultadoDePromoHistorico_7) {
                        var promoDeBonificacion = new Promo();
                        promoDeBonificacion.promoId = bonificacionAValidar_3.promoIdMultiple;
                        promoDeBonificacion.promoName = bonificacionAValidar_3.promoNameMultiple;
                        promoDeBonificacion.frequency = bonificacionAValidar_3.frequencyMultiple;
                        this.promoServicio.validarSiAplicaPromo(promoDeBonificacion, resultadoDePromoHistorico_7, function (aplicaPromo) {
                            if (!aplicaPromo) {
                                listaDeBonificaciones = listaDeBonificaciones.filter(function (bonificacion) {
                                    return resultadoDePromoHistorico_7.promoId !== bonificacion.promoIdMultiple;
                                });
                            }
                            _this.validarSiAplicaLaBonificacionesPorEscala(listaDeBonificaciones, indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0), function (listaDeBonificaciones) {
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
                        this.validarSiAplicaLaBonificacionesPorEscala(listaDeBonificaciones, indiceDeListaDeBonificacion + 1, function (listaDeDescuento) {
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
                mensaje: "Error al validar la si aplica la bonificacion por escala: " + ex.message
            });
        }
    };
    PromocionesPorClienteControlador.prototype.listaDeBonificacionesPorMultiploTerminoDeIterar = function (listaDeBonificaciones, indiceDeListaDeBonificacion) {
        return (listaDeBonificaciones.length > 0 && listaDeBonificaciones.length > indiceDeListaDeBonificacion);
    };
    return PromocionesPorClienteControlador;
}());
//# sourceMappingURL=PromocionesPorClienteControlador.js.map