class ControlDeFinDeRutaControlador {
    documentosDeFinDeRuta = [];

    delegarControlDeFinDeRuta() {
        let este: ControlDeFinDeRutaControlador = this;
        $(document).on("pagebeforechange",
            (event, data) => {
                if (data.toPage === "PantallaDeControlDeFinDeRuta") {
                    este.documentosDeFinDeRuta = data.options.data.documentosParaFinDeRuta;
                    este.permitirFinalizarRuta(este.documentosDeFinDeRuta);
                    $.mobile.changePage("#PantallaDeControlDeFinDeRuta");
                }
            });

        $("#PantallaDeControlDeFinDeRuta").on("pageshow",
            () => {
                estaEnControlDeFinDeRuta = true;
                este.generarListadoDeDocumentos(este.documentosDeFinDeRuta);
            });

        $("#BotonSincronizarTodosLosDocumentosPendientesDeEnvio").on("click",
            () => {
                este.enviarTodosLosDocumentosPendientesDeEnvioHaciaElServidor();
            });

        $("#BotonFinalizarRutaYMostrarResumenDeFinDeRuta").on("click", () => {
            if (gIsOnline === SiNo.Si) {

                navigator.notification.confirm(
                    "¿Está seguro de finalizar ruta?",  (buttonIndex) =>{
                        if (buttonIndex === 2) {
                            localStorage.setItem("APP_IS_READY", "0");
                            my_dialog("Por favor espere...", "Finalizando ruta", "open");
                            let data = {
                                'routeid': gCurrentRoute,
                                'default_warehouse': gDefaultWhs,
                                'dbuser': gdbuser,
                                'dbuserpass': gdbuserpass
                                , "optionPrint": SiNo.Si
                            };
                            socket.emit("SetActiveRoute", data);
                            EnviarBorradoresDeBonificaciones(OrigenDeEnvioDeBorradoresDeBonificacion.FinDeRuta);
                        }
                    }, `Sonda® Ruta ${SondaVersion}`,["No","Si"]);
            } else {
                notify("Debe tener conexión al servidor para poder finalizar ruta.");
            }
        });
    }

    generarListadoDeDocumentos(documentosDeFinDeRuta) {
        let contenedorDeTablaDeInformacionDeFinDeRuta = $("#ContenedorDeTablaDeInformacionDeFinDeRuta");
        try {
            this.limpiarInformacionDeResumenDeTotalDePedidosYPedidosNoSincronizados();

            let tablaAntiguaAEliminar = $("#ContenedorDeInformacionDeFinDeRuta");
            tablaAntiguaAEliminar.remove();
            tablaAntiguaAEliminar = null;

            let etiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta =
                $("#EtiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta");
            etiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta.remove();
            etiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta = null;

            let agregarTablaDeInformacion: boolean = false;
            let htmlDeTablaDeInformacionDeFinDeRuta = new Array<string>();

            //Encabezado de tabla
            htmlDeTablaDeInformacionDeFinDeRuta
                .push(`<table id="ContenedorDeInformacionDeFinDeRuta" class="table-stroke">
                                                      <thead>
                                                        <tr>
                                                          <th>No. Documento</th>
                                                          <th>Tipo</th>
                                                          <th>Estado</th>
                                                          <th>Hora De Envío</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>`);

            //Cuerpo de tabla (Informacion de Documentos De Ruta)
            documentosDeFinDeRuta.map((contenedorDeDocumentos) => {
                if (contenedorDeDocumentos.habilitadoParaReporte) {
                    contenedorDeDocumentos.documentos.map((documentoObtenido) => {
                        agregarTablaDeInformacion = true;
                        htmlDeTablaDeInformacionDeFinDeRuta.push(`<tr>
                                                        <td style="text-align: left;">
                                                           ${documentoObtenido.DOC_NO}
                                                        </td>
                                                        <td style="text-align: center;">
                                                            ${documentoObtenido.DOC_TYPE}
                                                        </td>
                                                        <td style="text-align: center;">
                                                            ${
                            (documentoObtenido.DOC_STATUS == 2)
                            ? "Enviado"
                            : "Pendiente"}
                                                        </td>
                                                        <td style="text-align: right;">
                                                            ${documentoObtenido.DOC_POSTED_DATE}
                                                        </td>
                                                    </tr>`);
                    });
                }
            });

            //Pie de tabla
            htmlDeTablaDeInformacionDeFinDeRuta.push(`</tbody></table>`);

            //Se agrega la tabla a la pantalla para su visualizacion
            if (agregarTablaDeInformacion) {
                contenedorDeTablaDeInformacionDeFinDeRuta.append(htmlDeTablaDeInformacionDeFinDeRuta.join(""));
                this.generarInformacionDePedidosParaResumenDeInformacionDeFinDeRuta(documentosDeFinDeRuta);
            } else {
                contenedorDeTablaDeInformacionDeFinDeRuta
                    .append(`<p id="EtiquetaDeNotificacionDeFaltaDeDocumentosParaFinDeRuta">No se encontraron documentos para el fin de ruta </p>`);
            }

        } catch (e) {
            notify(`No se ha podido mostrar la información de los documentos debido a: ${e.message}`);
        } finally {
            contenedorDeTablaDeInformacionDeFinDeRuta = null;
        }
    }

    generarInformacionDePedidosParaResumenDeInformacionDeFinDeRuta(documentosDeFinDeRuta) {
        let cantidadTotalDeDocumentosDeTipoPedidoDeRuta = $("#CantidadTotalDeDocumentosDeTipoPedidoDeRuta");
        let cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = $("#CantidadTotalDeDocumentosDeRutaPendientesDeEnvio");
        try {

            this.obtenerCantidadTotalDeDocumentosPendientesDeSincronizar(documentosDeFinDeRuta,
                (documentosNoSincronizados, cantidadTotalDeDocumentos) => {
                    cantidadTotalDeDocumentosDeTipoPedidoDeRuta.text(cantidadTotalDeDocumentos.toString());
                    cantidadTotalDeDocumentosDeRutaPendientesDeEnvio.text(documentosNoSincronizados.toString());
                    this.habilitarBotonDeEnvioDeTodosLosDocumentosPendientesDeSincronizar(documentosNoSincronizados > 0);
                });
        } catch (e) {
            notify(`No se ha podido generar la información del resumen de pedidos debido a: ${e.message}`);
        } finally {
            cantidadTotalDeDocumentosDeTipoPedidoDeRuta = null;
            cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = null;
        }
    }

    enviarTodosLosDocumentosPendientesDeEnvioHaciaElServidor() {
        let este = this;
        try {
            if (gIsOnline === SiNo.Si) {
                BloquearPantalla();
                my_dialog("Por favor espere...", "Un minuto por favor, estamos sincronizando la información.", "open");
                EnviarData();
                let iteracionDeIntervaloDeEspera: number = 0;
                let intervaloDeEspera = setInterval(() => {
                        iteracionDeIntervaloDeEspera++;
                        if (iteracionDeIntervaloDeEspera === 60) {
                            clearInterval(intervaloDeEspera);
                            ObtenerDocumentosParaControlDeFinDeRuta(documentos => {
                                    DesBloquearPantalla();
                                    este.permitirFinalizarRuta(documentos,
                                        (documentosDeFinDeRuta) => {
                                            este.generarListadoDeDocumentos(documentosDeFinDeRuta);
                                            my_dialog("", "", "close");
                                        });
                                },
                                errorMessage => {
                                    DesBloquearPantalla();
                                    my_dialog("", "", "close");
                                    notify(errorMessage);
                                });
                        }
                    },
                    1000);
            } else {
                notify("Debe tener conexión al servidor para poder enviar los documentos pendientes de envío.");
            }
            
        } catch (e) {
            DesBloquearPantalla();
            my_dialog("", "", "close");
            notify(`No se ha podido enviar los documentos hacia el servidor debido a: ${e.message}`);
        } 
    }

    permitirFinalizarRuta(documentosDeFinDeRuta, callback?: (documentosDeFinDeRuta: any)=>void) {
        try {
            this.obtenerCantidadTotalDeDocumentosPendientesDeSincronizar(documentosDeFinDeRuta,
                (cantidadDeDocumentosPendientesDeSincronizar, cantidadTotalDeDocumentos) => {
                    let botonDeFinalizacionDeRuta = $("#BotonFinalizarRutaYMostrarResumenDeFinDeRuta");

                    if (cantidadDeDocumentosPendientesDeSincronizar !== 0) {
                        botonDeFinalizacionDeRuta.addClass("ui-disabled");
                        if (callback) {
                            callback(documentosDeFinDeRuta);
                        }
                    } else {
                        botonDeFinalizacionDeRuta.removeClass("ui-disabled");
                        if (callback) {
                            callback(documentosDeFinDeRuta);
                        }
                    }
                    botonDeFinalizacionDeRuta = null;
                });
        } catch (e) {
            notify(`No se ha podido habilitar el fin de ruta debido a: ${e.message}`);
        } 
    }

    limpiarInformacionDeResumenDeTotalDePedidosYPedidosNoSincronizados() {
        let cantidadTotalDeDocumentosDeTipoPedidoDeRuta = $("#CantidadTotalDeDocumentosDeTipoPedidoDeRuta");
        let cantidadTotalDeDocumentosDeRutaPendientesDeEnvio =
            $("#CantidadTotalDeDocumentosDeRutaPendientesDeEnvio");

        cantidadTotalDeDocumentosDeTipoPedidoDeRuta.text("0");
        cantidadTotalDeDocumentosDeRutaPendientesDeEnvio.text("0");

        cantidadTotalDeDocumentosDeTipoPedidoDeRuta = null;
        cantidadTotalDeDocumentosDeRutaPendientesDeEnvio = null;

        this.habilitarBotonDeEnvioDeTodosLosDocumentosPendientesDeSincronizar(false);
    }

    habilitarBotonDeEnvioDeTodosLosDocumentosPendientesDeSincronizar(habilitarBoton: boolean) {
        let botonSincronizarTodosLosDocumentosPendientesDeEnvio = $("#BotonSincronizarTodosLosDocumentosPendientesDeEnvio");

        if (habilitarBoton) {
            botonSincronizarTodosLosDocumentosPendientesDeEnvio.removeClass("ui-disabled");
            botonSincronizarTodosLosDocumentosPendientesDeEnvio = null;
        } else {
            botonSincronizarTodosLosDocumentosPendientesDeEnvio.addClass("ui-disabled");
            botonSincronizarTodosLosDocumentosPendientesDeEnvio = null;
        }
    }

    obtenerCantidadTotalDeDocumentosPendientesDeSincronizar(documentosDeFinDeRuta: any, callback: (cantidadDeDocumentosPendientesDeEnvio: number, cantidadTotalDeDocumentos: number)=>void) {
        let cantidadDeDocumentosPendientesDeEnvio: number = 0;
        let cantidadTotalDeDocumentos: number = 0;
        documentosDeFinDeRuta.map((contenedorDeDocumentos) => {
            if (contenedorDeDocumentos.habilitadoParaReporte) {
                cantidadTotalDeDocumentos += contenedorDeDocumentos.documentos.length;
                contenedorDeDocumentos.documentos.map((documentoObtenido) => {
                    if (documentoObtenido.DOC_STATUS !== EstadoEnvioDoc.EnviadoConAcuseDeRecibido && documentoObtenido.DOC_STATUS !== EstadoEnvioDoc.EnviadoConAcuseDeRecibido.toString()) {
                        cantidadDeDocumentosPendientesDeEnvio++;
                    }
                });
            }
        });
        callback(cantidadDeDocumentosPendientesDeEnvio, cantidadTotalDeDocumentos);
    }
}