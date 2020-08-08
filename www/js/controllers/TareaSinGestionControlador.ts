class TareaSinGestion {
    clienteServicio = new ClienteServicio();
    tareaServicio = new TareaServcio();
    configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();

    tarea = new Tarea();
    cliente = new Cliente();
    configuracionDecimales: ManejoDeDecimales;

    constructor(public mensajero: Messenger) {
        this.obtenerConfiguracionDeDecimales();
    }

    delegadoTareaSinGestion() {

        $("#UiPageTaskCompletedWithReason").on("pageshow", () => {
            this.limpiarControles();
            this.obtenerDatos();
        });

        swipe("#UiPageTaskCompletedWithReason", direccion => {
            if (direccion === "right") {
                var myPanel = <any>$.mobile.activePage.children('[id="UiPanelDerrechoTareaCompletaSinGestion"]');
                myPanel.panel("toggle");
            }
        });

        //$("#UiPageTaskCompletedWithReason").on("swiperight", () => {
        //    var myPanel = <any>$.mobile.activePage.children('[id="UiPanelDerrechoTareaCompletaSinGestion"]');
        //    myPanel.panel("toggle");
        //});

        $("#UIBotonCrearNuevaTareaCompletaSinGestion").bind("touchstart", () => {
            this.usuarioDeseaCrearTareaPreventa();
        });
    }

    obtenerConfiguracionDeDecimales() {
        this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales((decimales: ManejoDeDecimales) => {
            this.configuracionDecimales = decimales;
        }, (operacion: Operacion) => {
            notify(operacion.mensaje);
        });
    }

    obtenerDatos() {
        try {
            this.tarea.taskId = gtaskid;
            this.tareaServicio.obtenerTarea(this.tarea, (tarea: Tarea) => {
                this.tarea = tarea;
                this.cliente.clientId = gClientID;
                this.clienteServicio.obtenerCliente(this.cliente, this.configuracionDecimales, (cliente: Cliente) => {
                    this.cliente = cliente;
                    this.cargarDatos();
                }, (resultado: Operacion) => {
                    my_dialog("", "", "closed");
                    notify(resultado.mensaje);
                });
            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
        } catch (ex) {
            notify("Error al obtener datos: " + ex.message);
        }
    }

    limpiarControles() {
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

        } catch (ex) {
            notify("Error al limpiar controles: " + ex.message);
        }
    }

    cargarDatos() {
        try {
            let uiEtiquetaNombreClienteTareaCompletaSinGestion = $('#UiEtiquetaNombreClienteTareaCompletaSinGestion');
            uiEtiquetaNombreClienteTareaCompletaSinGestion.text(this.cliente.clientName);
            uiEtiquetaNombreClienteTareaCompletaSinGestion = null;
            var direccion = this.cliente.address;
            if (direccion === "") {
                direccion = "No tiene direccion";
            }
            let uiEtiquetaDireccionClienteTareaCompletaSinGestion = $('#UiEtiquetaDireccionClienteTareaCompletaSinGestion');
            uiEtiquetaDireccionClienteTareaCompletaSinGestion.text(direccion);
            uiEtiquetaDireccionClienteTareaCompletaSinGestion = null;
            let uiEtiquetaNoTelefonoTareaCompletaSinGestion = $('#UiEtiquetaNoTelefonoTareaCompletaSinGestion');
            uiEtiquetaNoTelefonoTareaCompletaSinGestion.text(this.cliente.phone);
            uiEtiquetaNoTelefonoTareaCompletaSinGestion = null;
            let uiEtiquetaContactoTareaCompletaSinGestion = $('#UiEtiquetaContactoTareaCompletaSinGestion');
            uiEtiquetaContactoTareaCompletaSinGestion.text(this.cliente.contactCustomer);
            uiEtiquetaContactoTareaCompletaSinGestion = null;
            let uiEtiquetaRazonTareaCompletaSinGestion = $('#UiEtiquetaRazonTareaCompletaSinGestion');
            uiEtiquetaRazonTareaCompletaSinGestion.text(this.tarea.reason);
            uiEtiquetaRazonTareaCompletaSinGestion = null;
            let uiEtiquetaTipoTareaTareaCompletaSinGestion = $('#UiEtiquetaTipoTareaTareaCompletaSinGestion');
            let descriptionTipoTarea = "";
            switch (this.tarea.taskType) {
                case TareaTipo.Preventa:
                    descriptionTipoTarea = TareaTipoDescripcion.Preventa;
                    break;
            }
            uiEtiquetaTipoTareaTareaCompletaSinGestion.text(descriptionTipoTarea);
            uiEtiquetaTipoTareaTareaCompletaSinGestion = null;

        } catch (ex) {
            notify("Error al cargar datos: " + ex.message);
        }
    }

    usuarioDeseaCrearTareaPreventa() {
        try {
            this.creatTarea(this.tarea, this.cliente, (taskId: number) => {
                gtaskid = taskId;
                gTaskType = this.tarea.taskType;
                gClientID = this.cliente.clientId;
                gVentaEsReimpresion = false;

                actualizarListadoDeTareas(gtaskid, this.tarea.taskType, TareaEstado.Asignada, this.cliente.clientId, this.cliente.clientName, this.cliente.address, 0, "", this.cliente.rgaCode);

                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });

            }, (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
        } catch (err) {
            notify("Error al crear la tarea: " + err.message);
        }
    }

    creatTarea(tarea: Tarea, cliente: Cliente, callback: (taskId: number) => any, errCallBack: (resultado: Operacion) => void) {
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
            }

            CrearTarea(clienteTarea, tarea.taskType, (clienteNuevo: string, codigoTarea: string) => {
                callback(Number(codigoTarea));
            });
        } catch (err) {
            errCallBack(<Operacion>{ codigo: -1, mensaje: "Error al crear la tarea:" + err.message });
        }
    }
}