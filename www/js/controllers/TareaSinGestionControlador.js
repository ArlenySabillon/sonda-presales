var TareaSinGestion = (function () {
    function TareaSinGestion(mensajero) {
        this.mensajero = mensajero;
        this.clienteServicio = new ClienteServicio();
        this.tareaServicio = new TareaServcio();
        this.configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.tarea = new Tarea();
        this.cliente = new Cliente();
        this.obtenerConfiguracionDeDecimales();
    }
    TareaSinGestion.prototype.delegadoTareaSinGestion = function () {
        var _this = this;
        $("#UiPageTaskCompletedWithReason").on("pageshow", function () {
            _this.limpiarControles();
            _this.obtenerDatos();
        });
        swipe("#UiPageTaskCompletedWithReason", function (direccion) {
            if (direccion === "right") {
                var myPanel = $.mobile.activePage.children('[id="UiPanelDerrechoTareaCompletaSinGestion"]');
                myPanel.panel("toggle");
            }
        });
        $("#UIBotonCrearNuevaTareaCompletaSinGestion").bind("touchstart", function () {
            _this.usuarioDeseaCrearTareaPreventa();
        });
    };
    TareaSinGestion.prototype.obtenerConfiguracionDeDecimales = function () {
        var _this = this;
        this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this.configuracionDecimales = decimales;
        }, function (operacion) {
            notify(operacion.mensaje);
        });
    };
    TareaSinGestion.prototype.obtenerDatos = function () {
        var _this = this;
        try {
            this.tarea.taskId = gtaskid;
            this.tareaServicio.obtenerTarea(this.tarea, function (tarea) {
                _this.tarea = tarea;
                _this.cliente.clientId = gClientID;
                _this.clienteServicio.obtenerCliente(_this.cliente, _this.configuracionDecimales, function (cliente) {
                    _this.cliente = cliente;
                    _this.cargarDatos();
                }, function (resultado) {
                    my_dialog("", "", "closed");
                    notify(resultado.mensaje);
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (ex) {
            notify("Error al obtener datos: " + ex.message);
        }
    };
    TareaSinGestion.prototype.limpiarControles = function () {
        try {
            var uiEtiquetaNombreClienteTareaCompletaSinGestion = $('#UiEtiquetaNombreClienteTareaCompletaSinGestion');
            uiEtiquetaNombreClienteTareaCompletaSinGestion.text("...");
            uiEtiquetaNombreClienteTareaCompletaSinGestion = null;
            var uiEtiquetaDireccionClienteTareaCompletaSinGestion = $('#UiEtiquetaDireccionClienteTareaCompletaSinGestion');
            uiEtiquetaDireccionClienteTareaCompletaSinGestion.text("...");
            uiEtiquetaDireccionClienteTareaCompletaSinGestion = null;
            var uiEtiquetaNoTelefonoTareaCompletaSinGestion = $('#UiEtiquetaNoTelefonoTareaCompletaSinGestion');
            uiEtiquetaNoTelefonoTareaCompletaSinGestion.text("...");
            uiEtiquetaNoTelefonoTareaCompletaSinGestion = null;
            var uiEtiquetaContactoTareaCompletaSinGestion = $('#UiEtiquetaContactoTareaCompletaSinGestion');
            uiEtiquetaContactoTareaCompletaSinGestion.text("...");
            uiEtiquetaContactoTareaCompletaSinGestion = null;
            var uiEtiquetaRazonTareaCompletaSinGestion = $('#UiEtiquetaRazonTareaCompletaSinGestion');
            uiEtiquetaRazonTareaCompletaSinGestion.text("...");
            uiEtiquetaRazonTareaCompletaSinGestion = null;
            var uiEtiquetaTipoTareaTareaCompletaSinGestion = $('#UiEtiquetaTipoTareaTareaCompletaSinGestion');
            uiEtiquetaTipoTareaTareaCompletaSinGestion.text("...");
            uiEtiquetaTipoTareaTareaCompletaSinGestion = null;
        }
        catch (ex) {
            notify("Error al limpiar controles: " + ex.message);
        }
    };
    TareaSinGestion.prototype.cargarDatos = function () {
        try {
            var uiEtiquetaNombreClienteTareaCompletaSinGestion = $('#UiEtiquetaNombreClienteTareaCompletaSinGestion');
            uiEtiquetaNombreClienteTareaCompletaSinGestion.text(this.cliente.clientName);
            uiEtiquetaNombreClienteTareaCompletaSinGestion = null;
            var direccion = this.cliente.address;
            if (direccion === "") {
                direccion = "No tiene direccion";
            }
            var uiEtiquetaDireccionClienteTareaCompletaSinGestion = $('#UiEtiquetaDireccionClienteTareaCompletaSinGestion');
            uiEtiquetaDireccionClienteTareaCompletaSinGestion.text(direccion);
            uiEtiquetaDireccionClienteTareaCompletaSinGestion = null;
            var uiEtiquetaNoTelefonoTareaCompletaSinGestion = $('#UiEtiquetaNoTelefonoTareaCompletaSinGestion');
            uiEtiquetaNoTelefonoTareaCompletaSinGestion.text(this.cliente.phone);
            uiEtiquetaNoTelefonoTareaCompletaSinGestion = null;
            var uiEtiquetaContactoTareaCompletaSinGestion = $('#UiEtiquetaContactoTareaCompletaSinGestion');
            uiEtiquetaContactoTareaCompletaSinGestion.text(this.cliente.contactCustomer);
            uiEtiquetaContactoTareaCompletaSinGestion = null;
            var uiEtiquetaRazonTareaCompletaSinGestion = $('#UiEtiquetaRazonTareaCompletaSinGestion');
            uiEtiquetaRazonTareaCompletaSinGestion.text(this.tarea.reason);
            uiEtiquetaRazonTareaCompletaSinGestion = null;
            var uiEtiquetaTipoTareaTareaCompletaSinGestion = $('#UiEtiquetaTipoTareaTareaCompletaSinGestion');
            var descriptionTipoTarea = "";
            switch (this.tarea.taskType) {
                case TareaTipo.Preventa:
                    descriptionTipoTarea = TareaTipoDescripcion.Preventa;
                    break;
            }
            uiEtiquetaTipoTareaTareaCompletaSinGestion.text(descriptionTipoTarea);
            uiEtiquetaTipoTareaTareaCompletaSinGestion = null;
        }
        catch (ex) {
            notify("Error al cargar datos: " + ex.message);
        }
    };
    TareaSinGestion.prototype.usuarioDeseaCrearTareaPreventa = function () {
        var _this = this;
        try {
            this.creatTarea(this.tarea, this.cliente, function (taskId) {
                gtaskid = taskId;
                gTaskType = _this.tarea.taskType;
                gClientID = _this.cliente.clientId;
                gVentaEsReimpresion = false;
                actualizarListadoDeTareas(gtaskid, _this.tarea.taskType, TareaEstado.Asignada, _this.cliente.clientId, _this.cliente.clientName, _this.cliente.address, 0, "", _this.cliente.rgaCode);
                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        }
        catch (err) {
            notify("Error al crear la tarea: " + err.message);
        }
    };
    TareaSinGestion.prototype.creatTarea = function (tarea, cliente, callback, errCallBack) {
        try {
            var direccion = cliente.address;
            if (direccion === "") {
                direccion = "No tiene direccion";
            }
            var clienteTarea = {
                Nombre: cliente.clientName,
                Direccion: direccion,
                Telefono: cliente.phone,
                CodigoHH: cliente.clientId
            };
            CrearTarea(clienteTarea, tarea.taskType, function (clienteNuevo, codigoTarea) {
                callback(Number(codigoTarea));
            });
        }
        catch (err) {
            errCallBack({ codigo: -1, mensaje: "Error al crear la tarea:" + err.message });
        }
    };
    return TareaSinGestion;
}());
//# sourceMappingURL=TareaSinGestionControlador.js.map