var NuevaTareaControlador = (function() {
    function NuevaTareaControlador(mensajero) {
        this.mensajero = mensajero;
        this.clienteServicio = new ClienteServicio();
        this.clientes = [];
        this.cliente = new Cliente();
        this.tarea = new Tarea();
        this.pivotLimit = 25;
        this.currentLimit = 0;
        this.lastLowLimit = 0;
    }
    NuevaTareaControlador.prototype.delegarNuevaTareaControlador = function() {
        var _this = this;
        var este = this;
        document.addEventListener("backbutton", function() {
            este.usuarioDeseaVerPantallaAnterior();
        }, true);
        $("#UiBtnCrearNuevaTarea").bind("touchstart", function() {
            _this.mostrarPantallaCrearNuevaTarea();
        });
        $("#pickupplan_page").swipe({
            swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
                if (fingerCount === 1 && direction === "right") {
                    var myPanel = $.mobile.activePage.children('[id="presales_panel"]');
                    myPanel.panel("toggle");
                }
            }
        });
        $("#UiPageNewTask").on("pageshow", function() {
            document.getElementById("uiTxtFiltroClientes").focus();
            _this.limpiarFiltro();
        });
        $("#uiBtnAtrasListaClientesABordo").on("click", function() {
            _this.usuarioDeseaRetornarAMenuPrincipal();
        });
        $("#uiBtnActualizarListaClientesABordo").on("click", function() {
            _this.usuarioDeseaRecargarListaDeClientesABordo();
        });
        $("#UiPageNewTask").on("click", "#uiListaClientesABordo li", function(event) {
            var clientId = event.currentTarget.attributes["id"].nodeValue;
            _this.usuarioDeseaCrearTarea(clientId);
        });
        $("#uiBtnLimpiarFiltroClientesABordo").on("click", function() {
            _this.limpiarFiltro();
        });
        $("#uiTxtFiltroClientes").on("keypress", function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                var txtFiltro = document.getElementById("uiTxtFiltroClientes");
                if (txtFiltro.value === "") {
                    notify("Debe proporcionar un criterio de busqueda...");
                    txtFiltro.focus();
                    txtFiltro = null;
                } else {
                    _this.criterio = txtFiltro.value.toString();
                    _this.obtenerClientes(txtFiltro.value.toString());
                }
                return false;
            }
        });
        $("#UiBotonCamaraClientesNewTarea").on("click", function() {
            cordova.plugins.diagnostic.isCameraAuthorized(function(enabled) {
                if (enabled) {
                    LeerCodigoBarraConCamara(function(codigoLeido) {
                        var uiTxtFiltroClientesAceptadas = $("#uiTxtFiltroClientes");
                        uiTxtFiltroClientesAceptadas.val(codigoLeido);
                        if (codigoLeido !== "") {
                            _this.obtenerClientes(codigoLeido);
                        }
                        uiTxtFiltroClientesAceptadas = null;
                    });
                } else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(function(authorization) {
                        if (authorization === "DENIED") {
                            cordova.plugins.diagnostic.switchToSettings(function() {
                                ToastThis("Debe autorizar el uso de la Cámara para poder leer el Código.");
                            }, function(error) {
                                console.log(error);
                            });
                        } else if (authorization === "GRANTED") {
                            LeerCodigoBarraConCamara(function(codigoLeido) {
                                var uiTxtFiltroClientesAceptadas = $("#uiTxtFiltroClientes");
                                uiTxtFiltroClientesAceptadas.val(codigoLeido);
                                if (codigoLeido !== "") {
                                    _this.obtenerClientes(codigoLeido);
                                }
                                uiTxtFiltroClientesAceptadas = null;
                            });
                        } else {
                            cordova.plugins.diagnostic.switchToSettings(function() {
                                ToastThis("Debe autorizar el uso de la Cámara para poder leer el Código.");
                            }, function(error) {
                                console.log(error);
                            });
                        }
                    }, function(error) {
                        notify(error);
                    });
                }
            }, function(error) {
                notify(error);
            });
        });
        $("#UiBotonIrAPaginaAnteriorDeTareaFueraDelPlanDeRuta").on("click", function() {
            if (_this.lastLowLimit !== 0) {
                _this.cargarListaDeClientesABordo(_this.clientes.slice(_this.lastLowLimit - _this.pivotLimit, _this.lastLowLimit));
                _this.currentLimit = _this.lastLowLimit;
                _this.lastLowLimit = _this.lastLowLimit - _this.pivotLimit;
            }
        });
        $("#UiBotonIrAPaginaSiguienteDeTareaFueraDelPlanDeRuta").on("click", function() {
            if (_this.currentLimit <= _this.clientes.length) {
                _this.cargarListaDeClientesABordo(_this.clientes.slice(_this.currentLimit, _this.currentLimit + _this.pivotLimit));
                _this.lastLowLimit = _this.currentLimit;
                _this.currentLimit = _this.currentLimit + _this.pivotLimit;
            }
        });
    };
    NuevaTareaControlador.prototype.usuarioDeseaVerPantallaAnterior = function() {
        switch ($.mobile.activePage[0].id) {
            case "UiPageNewTask":
                this.usuarioDeseaRetornarAMenuPrincipal();
                break;
        }
    };
    NuevaTareaControlador.prototype.obtenerClientes = function(criterio) {
        var _this = this;
        this.clienteServicio.obtenerTodosLosClientesAbordo(criterio, function(clientes) {
            _this.clientes = clientes;
            if (clientes.length === 1) {
                var uiTxtFiltroClientesAceptadas = $("#uiTxtFiltroClientes");
                uiTxtFiltroClientesAceptadas.val("");
                _this.usuarioDeseaCrearTarea(clientes[0].clientId);
                uiTxtFiltroClientesAceptadas = null;
            } else if (clientes.length === 0) {
                notify("No se encontraron clientes para el filtro aplicado");
                _this.limpiarFiltro();
            } else {
                _this.currentLimit = 0;
                _this.lastLowLimit = 0;
                _this.cargarListaDeClientesABordo(_this.clientes.slice(0, _this.pivotLimit));
            }
        }, function(operacion) {
            notify(operacion.mensaje);
        });
    };
    NuevaTareaControlador.prototype.cargarListaDeClientesABordo = function(clientes) {
        try {
            my_dialog("Cargando...", "Cargando lista de Clientes, por favor, espere...", "open");
            var objetoListaDeClientes = $("#uiListaClientesABordo");
            objetoListaDeClientes.children().remove("li");
            if (clientes.length > 0) {
                document.getElementById("UiContenedorListaDeClientes").style.display = "block";
                document.getElementById("UiNotificacionClientes").style.display = "none";
            } else {
                document.getElementById("UiNotificacionClientes").style.display = "block";
                document.getElementById("UiContenedorListaDeClientes").style.display = "none";
            }
            var li = "";
            const unicos = [];
            for (var _i = 0, clientes_1 = clientes; _i < clientes_1.length; _i++) {
                const valor = clientes_1[_i].clientId;
                //Se valida que no se dupliquen los clientes cuando crashea la app con un array y la funcion IndexOf
                if (unicos.indexOf(valor) < 0) {
                    unicos.push(valor);
                    var clienteTemp = clientes_1[_i];
                    li += "<li id=" + clienteTemp.clientId + " class='small-roboto ui-content'>\n                        <a href='#'>\n                        <p>\n                        <span>" + clienteTemp.clientId + "</span>\n                        <br><span>" + clienteTemp.clientName + "</span>\n                        <br><span>" + clienteTemp.address + "</span>\n                        </p>\n                        </a>\n                      </li>";
                }

            }
            objetoListaDeClientes.append(li);
            objetoListaDeClientes.listview("refresh");
            li = null;
            objetoListaDeClientes = null;
            my_dialog("", "", "close");
        } catch (e) {
            my_dialog("", "", "close");
            notify("No se ha podido cargar la lista de clientes a bordo debido a: " + e.message);
        }
    };
    NuevaTareaControlador.prototype.usuarioDeseaRecargarListaDeClientesABordo = function() {
        try {} catch (e) {
            notify("No se pudo recargar la informaci\u00F3n debido a: " + e.message);
        }
    };
    NuevaTareaControlador.prototype.usuarioDeseaCrearTarea = function(clienteId) {
        try {
            BloquearPantalla();
            for (var _i = 0, _a = this.clientes; _i < _a.length; _i++) {
                var clienteTemp = _a[_i];
                if (clienteTemp.clientId === clienteId) {
                    this.cliente = clienteTemp;
                    this.crearTarea(this.cliente);
                    break;
                }
            }
        } catch (e) {
            notify("No se ha podido generar la tarea para el cliente seleccionado debido a: " + e.message);
        }
    };
    NuevaTareaControlador.prototype.crearTarea = function(cliente) {
        var _this = this;
        try {
            ToastThis("Generando tarea para el cliente: " + cliente.clientId);
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
            gCurrentGPS = cliente.gps;
            CrearTarea(clienteTarea, TareaTipo.Preventa, function(cliente, tareaId) {
                _this.tarea.taskId = Number(tareaId);
                _this.tarea.taskType = TareaTipo.Preventa;
                _this.tarea.taskStatus = TareaEstado.Asignada;
                gtaskid = _this.tarea.taskId;
                gTaskType = _this.tarea.taskType;
                gClientID = _this.cliente.clientId;
                gVentaEsReimpresion = false;
                gTaskIsFrom = TareaEstado.Asignada;
                EnviarData();
                actualizarListadoDeTareas(_this.tarea.taskId, _this.tarea.taskType, _this.tarea.taskStatus, _this.cliente.clientId, _this.cliente.clientName, _this.cliente.address, 0, TareaEstado.Aceptada, _this.cliente.rgaCode);
                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
                gettask(tareaId);
                DesBloquearPantalla();
            });
        } catch (e) {
            notify("No se ha podido crear la tarea debido a: " + e.message);
        }
    };
    NuevaTareaControlador.prototype.mostrarPantallaCrearNuevaTarea = function() {
        $.mobile.changePage("#UiPageNewTask", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });
    };
    NuevaTareaControlador.prototype.usuarioDeseaRetornarAMenuPrincipal = function() {
        $.mobile.changePage("#pickupplan_page", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });
    };
    NuevaTareaControlador.prototype.limpiarFiltro = function() {
        try {
            var txtFiltro = document.getElementById("uiTxtFiltroClientes");
            txtFiltro.value = "";
            txtFiltro.focus();
            txtFiltro = null;
            var objetoListaDeClientes = $("#uiListaClientesABordo");
            objetoListaDeClientes.children().remove("li");
            objetoListaDeClientes = null;
            document.getElementById("UiContenedorListaDeClientes").style.display = "none";
            document.getElementById("UiNotificacionClientes").style.display = "none";
            this.criterio = "";
            this.clientes = [];
            this.currentLimit = 0;
            this.lastLowLimit = 0;
        } catch (e) {
            notify("No se ha podido limpiar el campo debido a: " + e.message);
        }
    };
    return NuevaTareaControlador;
}());
//# sourceMappingURL=NuevaTareaControlador.js.map