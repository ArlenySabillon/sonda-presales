var DraftControlador = (function () {
    function DraftControlador(mensajero) {
        this.mensajero = mensajero;
        this.draftServicio = new DraftServicio();
        this.clienteServicio = new ClienteServicio();
        this.tareaServicio = new TareaServcio();
        this.impresionServicio = new ImpresionServicio();
        this.manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
    }
    DraftControlador.prototype.delegarDraftControlador = function () {
        var _this = this;
        $("#UiBtnListadoDocumentosDraft").bind("touchstart", function () {
            _this.usuarioDeseaVerListadoDeDraft();
        });
        $("#UiPageDocsDraft").on("pageshow", function () {
            _this.obtenerDrafts();
        });
        $("#UiPageDocsDraft").on("click", "#UiListaOrdenDeVentaDraft li", function (event) {
            var id = event.currentTarget.attributes["id"].nodeValue;
            _this.usuarioDeseaVerDocumentoDeDraft(id);
        });
    };
    DraftControlador.prototype.usuarioDeseaVerListadoDeDraft = function () {
        $.mobile.changePage("#UiPageDocsDraft", {
            transition: "pop",
            reverse: true,
            changeHash: true,
            showLoadMsg: false
        });
    };
    DraftControlador.prototype.obtenerDrafts = function () {
        var _this = this;
        var listaSalesOrderDraft = $("#UiListaOrdenDeVentaDraft");
        listaSalesOrderDraft.children().remove("li");
        listaSalesOrderDraft = null;
        this.draftServicio.obtenerDraftsOrdenDeVenta(function (ordenes) {
            _this.draftServicio.obtenerDetalleDeOrdenDeVentaDraft(ordenes, function (ordenes) {
                _this.ordenesDeVentaDraft = ordenes;
                _this.cargarLista(null, ordenes);
                _this.actualizarTareaIdABorradorOrdeDeVenta();
            }, function (resultado) {
                _this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
            });
        }, function (resultado) {
            _this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
        });
    };
    DraftControlador.prototype.actualizarTareaIdABorradorOrdeDeVenta = function () {
        var _this = this;
        try {
            for (var i = 0; i < this.ordenesDeVentaDraft.length; i++) {
                if (this.ordenesDeVentaDraft[i].taskId === 0) {
                    this.draftServicio.obtenerTaskIdParaBorradorDeOrdenDeVenta(this.ordenesDeVentaDraft[i], i, function (ordenDeVenta, indice) {
                        _this.ordenesDeVentaDraft[indice] = ordenDeVenta;
                        if (_this.ordenesDeVentaDraft[indice].taskId !== 0) {
                            _this.draftServicio.actualizarTareaIdParaBorradorDeOrdenDeVenta(_this.ordenesDeVentaDraft[indice], function () {
                            }, function (resultado) {
                                _this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
                            });
                        }
                    }, function (resultado) {
                        _this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
                    });
                }
            }
        }
        catch (err) {
            notify("Erro al actualizar la tarea id para el borrador: " + err.message);
        }
    };
    DraftControlador.prototype.cargarLista = function (facturas, ordenDeVenta) {
        var objetoUl = null;
        var esFactura = true;
        if (facturas === null || facturas === undefined) {
            esFactura = false;
            objetoUl = $("#UiListaOrdenDeVentaDraft");
        }
        for (var i = 0; i < (esFactura ? facturas.length : ordenDeVenta.length); i++) {
            var li = "";
            li +=
                "<li data-icon='false' id='" +
                    (esFactura
                        ? "IV" + facturas[i].invoiceNum
                        : "SO" + ordenDeVenta[i].salesOrderId) +
                    "'>";
            li +=
                "<span class='title'>Documento No. " +
                    (esFactura ? facturas[i].invoiceNum : ordenDeVenta[i].salesOrderId) +
                    "</span>";
            li += "<p>";
            li +=
                "<span class='ui-content'>" +
                    "<b>" +
                    "CLIENTE: " +
                    "</b>" +
                    (esFactura ? facturas[i].clientName : ordenDeVenta[i].clientName) +
                    "</span> <br>";
            li +=
                "<span class='ui-content'>" +
                    "<b>" +
                    "MONTO: " +
                    "</b>" +
                    DarFormatoAlMonto(esFactura ? facturas[i].totalAmount : ordenDeVenta[i].totalAmount) +
                    "</span><br>";
            li +=
                "<span class='ui-content'>" +
                    "<b>" +
                    "CREADA EL: " +
                    "</b>" +
                    (esFactura
                        ? facturas[i].postedDatetime
                        : ordenDeVenta[i].postedDatetime) +
                    "</span>";
            li += "</p>";
            li += "</li>";
            objetoUl.append(li);
            objetoUl.listview("refresh");
            objetoUl.trigger("create");
        }
        objetoUl = null;
    };
    DraftControlador.prototype.mostrarMsjDeVacio = function (mensaje, objeto) {
        var objetoUl = objeto === "Facturas"
            ? $("#UiListaFacturasDraft")
            : $("#UiListaOrdenDeVentaDraft");
        objetoUl.children().remove("li");
        var li = "";
        li += "<li style='text-align:center'>";
        li +=
            "<span style='text-align:center;font-size:10px;'>" + mensaje + "</span>";
        li += "</li>";
        objetoUl.append(li);
        objetoUl.listview("refresh");
        objetoUl.trigger("create");
        objetoUl = null;
    };
    DraftControlador.prototype.usuarioDeseaVerDocumentoDeDraft = function (id) {
        var _this = this;
        if (id !== undefined && id !== null) {
            var esFactura = id.substring(0, 2) === "IV";
            var listaDeDocumentos = esFactura
                ? this.facturasDraft
                : this.ordenesDeVentaDraft;
            var idDoc = parseInt(id.substring(2));
            var documentoSoDraft_1 = null;
            if (esFactura) {
                return;
            }
            else {
                documentoSoDraft_1 = listaDeDocumentos.find(function (documento) {
                    return documento.salesOrderId === idDoc;
                });
            }
            if (!documentoSoDraft_1) {
                return;
            }
            var verDetalleDeBorradorDeOrdenDeVenta_1 = function () {
                gtaskid = documentoSoDraft_1.taskId === 0 ? 0 : documentoSoDraft_1.taskId;
                gTaskType = TareaTipo.Preventa;
                gClientID = documentoSoDraft_1.clientId;
                if (gtaskid !== 0) {
                    var tarea = new Tarea();
                    tarea.taskId = gtaskid;
                    _this.tareaServicio.obtenerTarea(tarea, function (tarea) {
                        switch (tarea.taskStatus) {
                            case TareaEstado.Aceptada:
                                _this.publicarSolicitudDeMetodoCargarTarea(TipoTarea.Preventa);
                                break;
                            case TareaEstado.Asignada:
                                $.mobile.changePage("#taskdetail_page", {
                                    transition: "flow",
                                    reverse: true,
                                    showLoadMsg: false
                                });
                                break;
                        }
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
                else {
                    _this.publicarSolicitudDeMetodoCargarTarea(TipoTarea.Preventa);
                    _this.publicarOrdenDeVentaDraft(documentoSoDraft_1);
                }
            };
            var opcionesDeConfiguracion = {
                title: "Seleccionar",
                items: [
                    { text: "Imprimir", value: "PRINT_DOCUMENT" },
                    { text: "Continuar pedido", value: "CONTINUE_DOCUMENT" }
                ],
                doneButtonLabel: "Aceptar",
                cancelButtonLabel: "Cancelar"
            };
            ShowListPicker(opcionesDeConfiguracion, function (opcionSelecionada) {
                switch (opcionSelecionada) {
                    case "PRINT_DOCUMENT":
                        InteraccionConUsuarioServicio.bloquearPantalla();
                        _this.imprimirBorradorDeOrdenDeVenta(documentoSoDraft_1);
                        break;
                    default:
                        verDetalleDeBorradorDeOrdenDeVenta_1();
                        break;
                }
            });
        }
    };
    DraftControlador.prototype.publicarOrdenDeVentaDraft = function (ordenDeVenta) {
        var msg = new OrdenDeVentaDraftMensaje(this);
        msg.ordenDeVenta = ordenDeVenta;
        this.mensajero.publish(msg, getType(OrdenDeVentaDraftMensaje));
        this.sePublicoSoDraft = true;
    };
    DraftControlador.prototype.publicarSolicitudDeMetodoCargarTarea = function (tipoTarea) {
        var msg = new ProcesarTipoDeTareaMensaje(this);
        msg.tipoTarea = tipoTarea;
        this.mensajero.publish(msg, getType(ProcesarTipoDeTareaMensaje));
    };
    DraftControlador.prototype.imprimirBorradorDeOrdenDeVenta = function (ordenDeVenta) {
        var _this = this;
        try {
            var cliente_1 = new Cliente();
            cliente_1.clientId = ordenDeVenta.clientId;
            this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (configuracionDeDecimales) {
                _this.clienteServicio.obtenerCliente(cliente_1, configuracionDeDecimales, function (clienteCompleto) {
                    _this.draftServicio.obtenerFormatoDeImpresionDeBorradorDeOrdenDeVenta(clienteCompleto, ordenDeVenta, function (formatoDeImpresion) {
                        _this.impresionServicio.validarEstadosYImprimir(false, gPrintAddress, formatoDeImpresion, true, function (resultado) {
                            if (resultado.resultado !== ResultadoOperacionTipo.Exitoso) {
                                notify("Error al imprimir el documento debido a: " + resultado.mensaje);
                            }
                            else {
                                InteraccionConUsuarioServicio.desbloquearPantalla();
                            }
                        });
                    }, function (resultado) {
                        notify("Error al imprimir el documento debido a: " + resultado.mensaje);
                    });
                }, function (resultado) {
                    notify(resultado.mensaje);
                });
            }, null);
        }
        catch (error) {
            notify("Error al imprimir el documento debido a: " + error.message);
        }
    };
    return DraftControlador;
}());
//# sourceMappingURL=DraftControlador.js.map