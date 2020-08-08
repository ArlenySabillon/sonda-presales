var AvanceDeRutaControlador = (function () {
    function AvanceDeRutaControlador() {
        this.ordenDeVentaServicio = new OrdenDeVentaServicio();
        this.configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
    }
    AvanceDeRutaControlador.prototype.delegarAvanceDeRutaControlador = function () {
        var este = this;
        document.addEventListener("backbutton", function () {
            este.mostrarPantallaAnterior();
        }, true);
        $("#UiBotonConsultarAvanceDeRuta").bind("touchstart", function () {
            este.usuarioDeseaVerConsultaDeAvanceDeRuta();
        });
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "UiPaginaAvanceDeRuta") {
                este.cargarPantalla();
                $.mobile.changePage("#UiPaginaAvanceDeRuta");
            }
        });
    };
    AvanceDeRutaControlador.prototype.mostrarPantallaAnterior = function () {
        switch ($.mobile.activePage[0].id) {
            case "UiPaginaAvanceDeRuta":
                window.history.back();
                break;
        }
    };
    AvanceDeRutaControlador.prototype.usuarioDeseaVerConsultaDeAvanceDeRuta = function () {
        try {
            var _this = this;
            $.mobile.changePage("UiPaginaAvanceDeRuta", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false
            });
        }
        catch (err) {
            notify("Error al mostrar la consulta avance de ruta: " + err.message);
            my_dialog("", "", "closed");
        }
    };
    AvanceDeRutaControlador.prototype.cargarPantalla = function () {
        var _this_1 = this;
        try {
            this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
                _this_1.configuracionDecimales = decimales;
                _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerCantidadDeTotalDeOrdenDeVenta(), function (total) {
                    var uiEtiquetaDeTituloTotalDePedidos = $('#UiEtiquetaDeTituloTotalDePedidos');
                    uiEtiquetaDeTituloTotalDePedidos.text('Total CD(' + total + '):');
                    uiEtiquetaDeTituloTotalDePedidos = null;
                    _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalDeOrdenDeVenta(), function (total) {
                        var uiEtiquetaARTotalDePedidos = $('#UiEtiquetaARTotalDePedidos');
                        uiEtiquetaARTotalDePedidos.text(DarFormatoAlMonto(format_number(total, _this_1.configuracionDecimales.defaultDisplayDecimals)));
                        uiEtiquetaARTotalDePedidos = null;
                        _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalDeClientesAVisitar(), function (total) {
                            var totalClientesAVisitar = total;
                            _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalDeClientesConVisitados(), function (total) {
                                var uiEtiquetaARTotalClientesVisitados = $('#UiEtiquetaARTotalClientesVisitados');
                                uiEtiquetaARTotalClientesVisitados.text(total + '/' + totalClientesAVisitar);
                                uiEtiquetaARTotalClientesVisitados = null;
                                _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalDeTareasSinGestion(), function (total) {
                                    var uiEtiquetaARTotalTareasSinGestion = $('#UiEtiquetaARTotalTareasSinGestion');
                                    uiEtiquetaARTotalTareasSinGestion.text(total);
                                    uiEtiquetaARTotalTareasSinGestion = null;
                                    _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalDeTareasFueraPlanDeRuta(), function (total) {
                                        var uiEtiquetaARTotalDeTareasFueraPlanDeRuta = $('#UiEtiquetaARTotalDeTareasFueraPlanDeRuta');
                                        uiEtiquetaARTotalDeTareasFueraPlanDeRuta.text(total);
                                        uiEtiquetaARTotalDeTareasFueraPlanDeRuta = null;
                                        _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalClientesNuevos(), function (total) {
                                            var uiEtiquetaARTotalClientesNuevos = $('#UiEtiquetaARTotalClientesNuevos');
                                            uiEtiquetaARTotalClientesNuevos.text(total);
                                            uiEtiquetaARTotalClientesNuevos = null;
                                            _this_1.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(_this_1.ordenDeVentaServicio.ObtenerTotalSinDescuentoDeOrdenDeVenta(), function (total) {
                                                var uiEtiquetaARTotalDePedidosSinDescuento = $('#UiEtiquetaARTotalDePedidosSinDescuento');
                                                uiEtiquetaARTotalDePedidosSinDescuento.text(DarFormatoAlMonto(format_number(total, _this_1.configuracionDecimales.defaultDisplayDecimals)));
                                                uiEtiquetaARTotalDePedidosSinDescuento = null;
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
                                    notify(resultado.mensaje);
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
                    notify(resultado.mensaje);
                });
            }, function (operacion) {
                notify(operacion.mensaje);
            });
        }
        catch (err) {
            notify("Error al cargar la pantalla: " + err.message);
            my_dialog("", "", "closed");
        }
    };
    return AvanceDeRutaControlador;
}());
//# sourceMappingURL=AvanceDeRutaControlador.js.map