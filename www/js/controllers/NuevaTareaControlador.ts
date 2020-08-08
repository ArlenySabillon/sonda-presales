class NuevaTareaControlador {


    constructor(public mensajero: Messenger) {


    }

    clienteServicio = new ClienteServicio();
    clientes: Cliente[] = [];
    cliente = new Cliente();
    tarea = new Tarea();
    criterio: string;

    pivotLimit = 25;  //cantidad de skus que se desean mostrar
    currentLimit = 0; // limite maximo que se extrae del arreglo de skus
    lastLowLimit = 0; // ultimo limite inferior en el que se posiciono

    delegarNuevaTareaControlador() {

        const este = this;
        document.addEventListener("backbutton", () => {
            este.usuarioDeseaVerPantallaAnterior();
        }, true);

        $("#UiBtnCrearNuevaTarea").bind("touchstart", () => {
            //this.obtenerClientes(this.criterio);
            this.mostrarPantallaCrearNuevaTarea();
        });

        //$("#pickupplan_page").on("swiperight", () => {
        //    var myPanel = <any>$("#presales_panel");
        //    myPanel.panel("open");
        //    myPanel = null;
        //});

// ReSharper disable once TsResolvedFromInaccessibleModule
        $("#pickupplan_page").swipe({
            swipe: (event, direction, distance, duration, fingerCount, fingerData) => {
                if (fingerCount === 1 && direction === "right") {
                    var myPanel = <any>$.mobile.activePage.children('[id="presales_panel"]');
                    myPanel.panel("toggle");
                }
            }
        });

        $("#UiPageNewTask").on("pageshow", () => {
            //this.cargarListaDeClientesABordo();
// ReSharper disable once TsResolvedFromInaccessibleModule
            document.getElementById("uiTxtFiltroClientes").focus();
            this.limpiarFiltro();
        });

        $("#uiBtnAtrasListaClientesABordo").on("click", () => {
            this.usuarioDeseaRetornarAMenuPrincipal();
        });

        $("#uiBtnActualizarListaClientesABordo").on("click", () => {
            this.usuarioDeseaRecargarListaDeClientesABordo();
        });

        $("#UiPageNewTask").on("click", "#uiListaClientesABordo li", (event) => {
            var clientId = (<any>event).currentTarget.attributes["id"].nodeValue;
            this.usuarioDeseaCrearTarea(clientId);
        });

        $("#uiBtnLimpiarFiltroClientesABordo").on("click", () => {
            this.limpiarFiltro();
        });

        $("#uiTxtFiltroClientes").on("keypress", (e) => {
            if (e.keyCode === 13) {
                e.preventDefault();

                let txtFiltro = <any>document.getElementById("uiTxtFiltroClientes");

                if (txtFiltro.value === "") {
                    notify("Debe proporcionar un criterio de busqueda...");
                    txtFiltro.focus();
                    txtFiltro = null;
                } else {
                    this.criterio = txtFiltro.value.toString();
                    this.obtenerClientes(txtFiltro.value.toString());

                }
                return false;
            }
        });

        $("#UiBotonCamaraClientesNewTarea").on("click", () => {
            cordova.plugins.diagnostic.isCameraAuthorized(enabled => {
                if (enabled) {
                    LeerCodigoBarraConCamara((codigoLeido: string) => {
                        var uiTxtFiltroClientesAceptadas = $("#uiTxtFiltroClientes");
                        uiTxtFiltroClientesAceptadas.val(codigoLeido);
                        if (codigoLeido !== "") {

                            this.obtenerClientes(codigoLeido);
                        }

                        uiTxtFiltroClientesAceptadas = null;
                    });
                } else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(authorization => {
                        if (authorization === "DENIED") {
                            cordova.plugins.diagnostic.switchToSettings(() => {
                                ToastThis("Debe autorizar el uso de la Cámara para poder leer el Código.");    
                            },(error) => {
                                console.log(error);
                            });
                        } else if (authorization === "GRANTED") {
                            LeerCodigoBarraConCamara((codigoLeido: string) => {
                                var uiTxtFiltroClientesAceptadas = $("#uiTxtFiltroClientes");
                                uiTxtFiltroClientesAceptadas.val(codigoLeido);
                                if (codigoLeido !== "") {

                                    this.obtenerClientes(codigoLeido);
                                }

                                uiTxtFiltroClientesAceptadas = null;
                            });
                        } else {
                            cordova.plugins.diagnostic.switchToSettings(() => {
                                ToastThis("Debe autorizar el uso de la Cámara para poder leer el Código.");
                            }, (error) => {
                                console.log(error);
                            });
                        }
                    }, error => {
                        notify(error);
                    });
                }
            }, function (error) {
                notify(error);
            });
        });

        $("#UiBotonIrAPaginaAnteriorDeTareaFueraDelPlanDeRuta").on("click",
            () => {
                if (this.lastLowLimit !== 0) {
                    this.cargarListaDeClientesABordo(this.clientes.slice(this.lastLowLimit - this.pivotLimit, this.lastLowLimit));
                    this.currentLimit = this.lastLowLimit;
                    this.lastLowLimit = this.lastLowLimit - this.pivotLimit;
                }
            });

        $("#UiBotonIrAPaginaSiguienteDeTareaFueraDelPlanDeRuta").on("click",
            () => {
                if (this.currentLimit <= this.clientes.length) {
                    this.cargarListaDeClientesABordo(this.clientes.slice(this.currentLimit, this.currentLimit + this.pivotLimit));
                    this.lastLowLimit = this.currentLimit;
                    this.currentLimit = this.currentLimit + this.pivotLimit;
                }
            });

    }

    usuarioDeseaVerPantallaAnterior() {
        switch ($.mobile.activePage[0].id) {
            case "UiPageNewTask":
                this.usuarioDeseaRetornarAMenuPrincipal();
                break;
        }
    }

    obtenerClientes(criterio: string) {
        this.clienteServicio.obtenerTodosLosClientesAbordo(criterio, (clientes) => {
            this.clientes = clientes;
            if (clientes.length === 1) {
                var uiTxtFiltroClientesAceptadas = $("#uiTxtFiltroClientes");
                uiTxtFiltroClientesAceptadas.val("");
                this.usuarioDeseaCrearTarea(clientes[0].clientId);
                uiTxtFiltroClientesAceptadas = null;
            }
            else if (clientes.length === 0) {
                notify("No se encontraron clientes para el filtro aplicado");
                this.limpiarFiltro();
            } else {
                this.currentLimit = 0;
                this.lastLowLimit = 0;
                this.cargarListaDeClientesABordo(this.clientes.slice(0, this.pivotLimit));
            }

        }, (operacion) => {
            notify(operacion.mensaje);
        });
    }

    cargarListaDeClientesABordo(clientes: Cliente[]) {
        try {
            my_dialog("Cargando...", "Cargando lista de Clientes, por favor, espere...", "open");
            let objetoListaDeClientes = $("#uiListaClientesABordo");
            objetoListaDeClientes.children().remove("li");

            if (clientes.length > 0) {
                document.getElementById("UiContenedorListaDeClientes").style.display = "block";
                document.getElementById("UiNotificacionClientes").style.display = "none";
            } else {
                document.getElementById("UiNotificacionClientes").style.display = "block";
                document.getElementById("UiContenedorListaDeClientes").style.display = "none";
            }

            let li = "";
            for (let clienteTemp of clientes) {
                li += `<li id=${clienteTemp.clientId} class='small-roboto ui-content'>
                        <a href='#'>
                        <p>
                        <span>${clienteTemp.clientId}</span>
                        <br><span>${clienteTemp.clientName}</span>
                        <br><span>${clienteTemp.address}</span>
                        </p>
                        </a>
                      </li>`;
            }
            objetoListaDeClientes.append(li);
            objetoListaDeClientes.listview("refresh");
            li = null;
            objetoListaDeClientes = null;
            my_dialog("", "", "close");
        } catch (e) {
            my_dialog("", "", "close");
            notify(`No se ha podido cargar la lista de clientes a bordo debido a: ${e.message}`);
        }
    }

    usuarioDeseaRecargarListaDeClientesABordo() {
        try {
            //navigator.notification.confirm("Desea recargar la lista de clientes a bordo?", (buttonIndex) => {
            //if (buttonIndex === 2) {
            //my_dialog("Cargando...", "Cargando lista de Clientes, por favor, espere...", "open");
            //this.obtenerClientes();
            //this.cargarListaDeClientesABordo();
            //my_dialog("", "", "close");
            //}
            //}, `Sonda® ${SondaVersion}`, ["No","Si"]);
        } catch (e) {
            notify(`No se pudo recargar la información debido a: ${e.message}`);
        }
    }

    usuarioDeseaCrearTarea(clienteId: string) {
        try {
            BloquearPantalla();
            for (let clienteTemp of this.clientes) {
                if (clienteTemp.clientId === clienteId) {
                    this.cliente = clienteTemp;
                    this.crearTarea(this.cliente);
                    break;
                }
            }
        } catch (e) {
            notify(`No se ha podido generar la tarea para el cliente seleccionado debido a: ${e.message}`);
        }
    }

    crearTarea(cliente: Cliente) {
        try {
            ToastThis(`Generando tarea para el cliente: ${cliente.clientId}`);
            let direccion = cliente.address;

            if (direccion === "") {
                direccion = "No tiene direccion";
            }

            const clienteTarea = {
                Nombre: cliente.clientName
                , Direccion: direccion
                , Telefono: cliente.phone
                , CodigoHH: cliente.clientId
            };
            gCurrentGPS = cliente.gps;
            CrearTarea(clienteTarea, TareaTipo.Preventa, (cliente, tareaId) => {
                this.tarea.taskId = Number(tareaId);
                this.tarea.taskType = TareaTipo.Preventa;
                this.tarea.taskStatus = TareaEstado.Asignada;

                gtaskid = this.tarea.taskId;
                gTaskType = this.tarea.taskType;
                gClientID = this.cliente.clientId;
                gVentaEsReimpresion = false;
                gTaskIsFrom = TareaEstado.Asignada;

                EnviarData();
                actualizarListadoDeTareas(this.tarea.taskId, this.tarea.taskType, this.tarea.taskStatus, this.cliente.clientId, this.cliente.clientName, this.cliente.address, 0, TareaEstado.Aceptada, this.cliente.rgaCode);

                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
                DesBloquearPantalla();
            });

        } catch (e) {
            notify(`No se ha podido crear la tarea debido a: ${e.message}`);
        }
    }

    mostrarPantallaCrearNuevaTarea() {
        $.mobile.changePage("#UiPageNewTask", {
            transition: "flow"
            , reverse: true
            , showLoadMsg: false
        });
    }

    usuarioDeseaRetornarAMenuPrincipal() {
        $.mobile.changePage("#pickupplan_page", {
            transition: "flow"
            , reverse: true
            , showLoadMsg: false
        });
    }

    limpiarFiltro() {
        try {
            let txtFiltro = <any>document.getElementById("uiTxtFiltroClientes");
            txtFiltro.value = "";
            txtFiltro.focus();
            txtFiltro = null;

            let objetoListaDeClientes = $("#uiListaClientesABordo");
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
    }
}