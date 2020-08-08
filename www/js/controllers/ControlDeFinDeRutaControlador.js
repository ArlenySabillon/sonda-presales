var ControlDeFinDeRutaControlador = (function () {
    function ControlDeFinDeRutaControlador() {
        this.documentosDeFinDeRuta = [];
    }
    ControlDeFinDeRutaControlador.prototype.delegarControlDeFinDeRuta = function () {
        var este = this;
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "PantallaDeControlDeFinDeRuta") {
                este.documentosDeFinDeRuta = data.options.data.documentosParaFinDeRuta;
                este.permitirFinalizarRuta(este.documentosDeFinDeRuta);
                $.mobile.changePage("#PantallaDeControlDeFinDeRuta");
            }
        });
        $("#PantallaDeControlDeFinDeRuta").on("pageshow", function () {
            estaEnControlDeFinDeRuta = true;
            este.generarListadoDeDocumentos(este.documentosDeFinDeRuta);
        });
        $("#BotonSincronizarTodosLosDocumentosPendientesDeEnvio").on("click", function () {
            este.enviarTodosLosDocumentosPendientesDeEnvioHaciaElServidor();
        });
        $("#BotonFinalizarRutaYMostrarResumenDeFinDeRuta").on("click", function () {
            if (gIsOnline === SiNo.Si) {
                navigator.notification.confirm("¿Está seguro de finalizar ruta?", function (buttonIndex) {
                    if (buttonIndex === 2) {
                        localStorage.setItem("APP_IS_READY", "0");
                        my_dialog("Por favor espere...", "Finalizando ruta", "open");
                        var data = {
                            'routeid': gCurrentRoute,
                            'default_warehouse': gDefaultWhs,
                            'dbuser': gdbuser,
                            'dbuserpass': gdbuserpass,
                            "optionPrint": SiNo.Si
                        };
                        socket.emit("SetActiveRoute", data);
                        EnviarBorradoresDeBonificaciones(OrigenDeEnvioDeBorradoresDeBonificacion.FinDeRuta);
                    }
                }, "Sonda\u00AE Ruta " + SondaVersion, ["No", "Si"]);
            }
            else {
                notify("Debe tener conexión al servidor para poder finalizar ruta.");
            }
        });
    };
    ControlDeFinDeRutaControlador.prototype.generarListadoDeDocumentos = function (documentosDeFinDeRuta) {
        var contenedorDeTablaDeInformacionDeFinDeRuta = $("#ContenedorDeTablaDeInformacionDeFinDeRuta");
        try {
            this.limpiarInformacionDeResumenDeTotalDePedidosYPedidosNoSincronizados();
            var tablaAntiguaAEliminar = $("#ContenedorDeInformacionDeFinDeRuta");
            tablaAntiguaAEliminar.remove();
            tablaAntiguaAEliminar = null;
            var etiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta = $("#EtiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta");
            etiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta.remove();
            etiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta = null;
            var agregarTablaDeInformacion_1 = false;
            var htmlDeTablaDeInformacionDeFinDeRuta_1 = new Array();
            htmlDeTablaDeInformacionDeFinDeRuta_1
                .push("<table id=\"ContenedorDeInformacionDeFinDeRuta\" class=\"table-stroke\">\n                                                      <thead>\n                                                        <tr>\n                                                          <th>No. Documento</th>\n                                                          <th>Tipo</th>\n                                                          <th>Estado</th>\n                                                          <th>Hora De Env\u00EDo</th>\n                                                        </tr>\n                                                      </thead>\n                                                      <tbody>");
            documentosDeFinDeRuta.map(function (contenedorDeDocumentos) {
                if (contenedorDeDocumentos.habilitadoParaReporte) {
                    contenedorDeDocumentos.documentos.map(function (documentoObtenido) {
                        agregarTablaDeInformacion_1 = true;
                        htmlDeTablaDeInformacionDeFinDeRuta_1.push("<tr>\n                                                        <td style=\"text-align: left;\">\n                                                           " + documentoObtenido.DOC_NO + "\n                                                        </td>\n                                                        <td style=\"text-align: center;\">\n                                                            " + documentoObtenido.DOC_TYPE + "\n                                                        </td>\n                                                        <td style=\"text-align: center;\">\n                                                            " + ((documentoObtenido.DOC_STATUS == 2)
                            ? "Enviado"
                            : "Pendiente") + "\n                                                        </td>\n                                                        <td style=\"text-align: right;\">\n                                                            " + documentoObtenido.DOC_POSTED_DATE + "\n                                                        </td>\n                                                    </tr>");
                    });
                }
            });
            htmlDeTablaDeInformacionDeFinDeRuta_1.push("</tbody></table>");
            if (agregarTablaDeInformacion_1) {
                contenedorDeTablaDeInformacionDeFinDeRuta.append(htmlDeTablaDeInformacionDeFinDeRuta_1.join(""));
                this.generarInformacionDePedidosParaResumenDeInformacionDeFinDeRuta(documentosDeFinDeRuta);
            }
            else {
                contenedorDeTablaDeInformacionDeFinDeRuta
                    .append("<p id=\"EtiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta\">No se encontraron documentos para el fin de ruta </p>");
            }
        }
        catch (e) {
            notify("No se ha podido mostrar la informaci\u00F3n de los documentos debido a: " + e.message);
        }
        finally {
            contenedorDeTablaDeInformacionDeFinDeRuta = null;
        }
    };
    ControlDeFinDeRutaControlador.prototype.generarInformacionDePedidosParaResumenDeInformacionDeFinDeRuta = function (documentosDeFinDeRuta) {
        var _this = this;
        var cantidadTotalDeDocumentosDeTipoPedidoDeRuta = $("#CantidadTotalDeDocumentosDeTipoPedidoDeRuta");
        var cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = $("#CantidadTotalDeDocumentosDeRutaPendientesDeEnvio");
        try {
            this.obtenerCantidadTotalDeDocumentosPendientesDeSincronizar(documentosDeFinDeRuta, function (documentosNoSincronizados, cantidadTotalDeDocumentos) {
                cantidadTotalDeDocumentosDeTipoPedidoDeRuta.text(cantidadTotalDeDocumentos.toString());
                cantidadTotalDeDocumentosDeRutaPendientesDeEnvio.text(documentosNoSincronizados.toString());
                _this.habilitarBotonDeEnvioDeTodosLosDocumentosPendientesDeSincronizar(documentosNoSincronizados > 0);
            });
        }
        catch (e) {
            notify("No se ha podido generar la informaci\u00F3n del resumen de pedidos debido a: " + e.message);
        }
        finally {
            cantidadTotalDeDocumentosDeTipoPedidoDeRuta = null;
            cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = null;
        }
    };
    ControlDeFinDeRutaControlador.prototype.enviarTodosLosDocumentosPendientesDeEnvioHaciaElServidor = function () {
        var este = this;
        try {
            if (gIsOnline === SiNo.Si) {
                BloquearPantalla();
                my_dialog("Por favor espere...", "Un minuto por favor, estamos sincronizando la información.", "open");
                EnviarData();
                var iteracionDeIntervaloDeEspera_1 = 0;
                var intervaloDeEspera_1 = setInterval(function () {
                    iteracionDeIntervaloDeEspera_1++;
                    if (iteracionDeIntervaloDeEspera_1 === 60) {
                        clearInterval(intervaloDeEspera_1);
                        ObtenerDocumentosParaControlDeFinDeRuta(function (documentos) {
                            DesBloquearPantalla();
                            este.permitirFinalizarRuta(documentos, function (documentosDeFinDeRuta) {
                                este.generarListadoDeDocumentos(documentosDeFinDeRuta);
                                my_dialog("", "", "close");
                            });
                        }, function (errorMessage) {
                            DesBloquearPantalla();
                            my_dialog("", "", "close");
                            notify(errorMessage);
                        });
                    }
                }, 1000);
            }
            else {
                notify("Debe tener conexión al servidor para poder enviar los documentos pendientes de envío.");
            }
        }
        catch (e) {
            DesBloquearPantalla();
            my_dialog("", "", "close");
            notify("No se ha podido enviar los documentos hacia el servidor debido a: " + e.message);
        }
    };
    ControlDeFinDeRutaControlador.prototype.permitirFinalizarRuta = function (documentosDeFinDeRuta, callback) {
        try {
            this.obtenerCantidadTotalDeDocumentosPendientesDeSincronizar(documentosDeFinDeRuta, function (cantidadDeDocumentosPendientesDeSincronizar, cantidadTotalDeDocumentos) {
                var botonDeFinalizacionDeRuta = $("#BotonFinalizarRutaYMostrarResumenDeFinDeRuta");
                if (cantidadDeDocumentosPendientesDeSincronizar !== 0) {
                    botonDeFinalizacionDeRuta.addClass("ui-disabled");
                    if (callback) {
                        callback(documentosDeFinDeRuta);
                    }
                }
                else {
                    botonDeFinalizacionDeRuta.removeClass("ui-disabled");
                    if (callback) {
                        callback(documentosDeFinDeRuta);
                    }
                }
                botonDeFinalizacionDeRuta = null;
            });
        }
        catch (e) {
            notify("No se ha podido habilitar el fin de ruta debido a: " + e.message);
        }
    };
    ControlDeFinDeRutaControlador.prototype.limpiarInformacionDeResumenDeTotalDePedidosYPedidosNoSincronizados = function () {
        var cantidadTotalDeDocumentosDeTipoPedidoDeRuta = $("#CantidadTotalDeDocumentosDeTipoPedidoDeRuta");
        var cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = $("#CantidadTotalDeDocumentosDeRutaPendientesDeEnvio");
        cantidadTotalDeDocumentosDeTipoPedidoDeRuta.text("0");
        cantidadTotalDeDocumentosDeRutaPendientesDeEnvio.text("0");
        cantidadTotalDeDocumentosDeTipoPedidoDeRuta = null;
        cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = null;
        this.habilitarBotonDeEnvioDeTodosLosDocumentosPendientesDeSincronizar(false);
    };
    ControlDeFinDeRutaControlador.prototype.habilitarBotonDeEnvioDeTodosLosDocumentosPendientesDeSincronizar = function (habilitarBoton) {
        var botonSincronizarTodosLosDocumentosPendientesDeEnvio = $("#BotonSincronizarTodosLosDocumentosPendientesDeEnvio");
        if (habilitarBoton) {
            botonSincronizarTodosLosDocumentosPendientesDeEnvio.removeClass("ui-disabled");
            botonSincronizarTodosLosDocumentosPendientesDeEnvio = null;
        }
        else {
            botonSincronizarTodosLosDocumentosPendientesDeEnvio.addClass("ui-disabled");
            botonSincronizarTodosLosDocumentosPendientesDeEnvio = null;
        }
    };
    ControlDeFinDeRutaControlador.prototype.obtenerCantidadTotalDeDocumentosPendientesDeSincronizar = function (documentosDeFinDeRuta, callback) {
        var cantidadDeDocumentosPendientesDeEnvio = 0;
        var cantidadTotalDeDocumentos = 0;
        documentosDeFinDeRuta.map(function (contenedorDeDocumentos) {
            if (contenedorDeDocumentos.habilitadoParaReporte) {
                cantidadTotalDeDocumentos += contenedorDeDocumentos.documentos.length;
                contenedorDeDocumentos.documentos.map(function (documentoObtenido) {
                    if (documentoObtenido.DOC_STATUS !== EstadoEnvioDoc.EnviadoConAcuseDeRecibido && documentoObtenido.DOC_STATUS !== EstadoEnvioDoc.EnviadoConAcuseDeRecibido.toString()) {
                        cantidadDeDocumentosPendientesDeEnvio++;
                    }
                });
            }
        });
        callback(cantidadDeDocumentosPendientesDeEnvio, cantidadTotalDeDocumentos);
    };
    return ControlDeFinDeRutaControlador;
}());
//# sourceMappingURL=ControlDeFinDeRutaControlador.js.map