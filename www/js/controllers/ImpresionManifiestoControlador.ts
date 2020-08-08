class ImpresionManifiestoControlador {

    socketIo: SocketIOClient.Socket;
    
    impresionManifiestoServicio = new ImpresionManifiestoServicio();
    isImpresoraZebra = (localStorage.getItem("isPrinterZebra") === "1");

    delegarImpresionManifiestoConrolador() {
        

        let este = this;

        document.addEventListener("backbutton", () => {
            este.usuarioDeseaVolverAPaginaAnterior();
        }, true);

        $("#UiPagePrintManifest").on("pageshow", () => {
            this.limpiarCampos();
            var btnImprimirManifiesto = $("#UiBtnImprimirManifiesto");
            btnImprimirManifiesto.addClass("ui-state-disabled");
            btnImprimirManifiesto = null;
        });

        $("#UiBtnBuscarManifiesto").on("click", () => {
            this.buscarInformacionManifiesto();
        });

        $("#UiBtnLimpiarCamposImpresionManifiesto").on("click", () => {
            this.limpiarCampos();
        });

        $("#UiBtnAtrasImpresionManifiesto").on("click",() => {
            this.usuarioDeseaVolverAPaginaAnterior();
        });

        $("#UiBtnImprimirManifiesto").on("click", () => {
            //this.imprimirManifiesto();
        });
    }

    delegarSockets(socketIo: SocketIOClient.Socket) {
        this.socketIo = socketIo;
        socketIo.on("ObtenerInformacionDeManifiesto", (data) => {
            switch (data.option) {
                case "informacionDeManifiestoNoEncontrada":
                    notify("No se ha encontrado información para el manifiesto proporcionado.\rPor favor, verifíque y vuelva a intentar.");
                    break;
                case "procesarInformacionDeManifiesto":
                    this.procesarInformacionDeManifiesto(data.data);
                    break;
                case "fail":
                    notify(data.Message);
                    break;
            }
        });
    }

    limpiarCampos() {
        try {
            //let txtCodigoManifiesto = $("#UiTxtNumeroDeManifiesto");
            //txtCodigoManifiesto.val("");
            //txtCodigoManifiesto.focus();
            //txtCodigoManifiesto = null;

            let txtOperadorEnBodega = $("#UiTxtNombreBodeguero");
            txtOperadorEnBodega.val("");
            txtOperadorEnBodega.focus();
            txtOperadorEnBodega = null;

        } catch (e) {
            notify("No se han podido limpiar los camos debido a: " + e.message);
        } 
    }

    buscarInformacionManifiesto() {
        try {
            let txtManifiesto = $("#UiTxtNumeroDeManifiesto");
            let txtBodeguero = $("#UiTxtNombreBodeguero");
            if (txtManifiesto.val() === "") {
                notify("Por favor, proporcione un numero de manifiesto...");
                txtManifiesto.focus();
            } else if (txtBodeguero.val() === "") {
                notify("Por favor, proporcione el nombre del bodeguero...");
                txtBodeguero.focus();
            } else {
                this.impresionManifiestoServicio.enviarSolicitudDeInformacionDeManifiesto(
                        parseInt(txtManifiesto.val())
                    , (resultado) => {
                        notify(resultado.mensaje);
                    });
            }
            txtManifiesto = null;
            txtBodeguero = null;
        } catch (e) {
        notify("No se ha podido buscar informacion del manifiesto debido a" + e.message);
        } 
    }

    usuarioDeseaVolverAPaginaAnterior() {
        try {
            switch ($.mobile.activePage[0].id) {
                case "UiPagePrintManifest":
                    navigator.notification.confirm("Esta seguro de abandonar la Impresion Del Manifiesto? ", // message
                        (buttonIndex) => {
                            if (buttonIndex === 2) {
                                $.mobile.changePage("#pageManifestHeader", {
                                    transition: "flow",
                                    reverse: true,
                                    showLoadMsg: false
                                });
                            }
                        }, `Sonda® ${SondaVersion}`, ["No","Si"]);
                    break;
            }
        } catch (e) {
          notify("Error al intentar cambiar a la pantalla anterior debido a:" + e.message);
        } 
    }

    procesarInformacionDeManifiesto(data: any) {
        try {
            const operadorEnBodega = $("#UiTxtNombreBodeguero").val();

            this.impresionManifiestoServicio.generarObjetoManifiesto(
                data
                , (manifiesto) => {
                    this.impresionManifiestoServicio.obtenerFormatoDeImpresionManifiesto(
                        manifiesto
                        , operadorEnBodega
                        , (formato) => {
                            ToastThis("Imprimiendo manifiesto, por favor, espere...");
                            my_dialog("", "", "close");
                            my_dialog("Espere...", "validando impresora", "open");
                            const printMacAddress = localStorage.getItem('PRINTER_ADDRESS');
                            const impresionServicio = new ImpresionServicio();
                            impresionServicio.validarEstadosYImprimir(this.isImpresoraZebra, printMacAddress, formato, true,(resultado: Operacion) => {
                                my_dialog("", "", "close");
                                if (resultado.resultado === ResultadoOperacionTipo.Error) {
                                    if (!this.isImpresoraZebra) {
                                        notify(resultado.mensaje);
                                    }
                                }
                            });
                        }
                        , (resultado) => {
                            notify(resultado.mensaje);
                        });
                }
                , (resultado) => {
                    notify(resultado.mensaje);
                });

        } catch (e) {
          notify("No se ha podido procesar el detalle del manifiesto debido a: " + e.message);
        } 
    }
}