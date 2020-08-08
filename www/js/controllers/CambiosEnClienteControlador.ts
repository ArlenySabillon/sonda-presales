/// <reference path="../../../typings/tsd.d.ts" />

class CambiosEnClienteControlador {
    tokenCliente: SubscriptionToken;
    

    cliente: Cliente;
    etiquetas: Etiqueta[];
    tarea: Tarea;
    configuracionDecimales: ManejoDeDecimales;
    viendoMapa: boolean = false;

    clienteServicio = new ClienteServicio();
    tareaServicio = new TareaServcio();
    markersFence = new Array<google.maps.Marker>();
    
    labelTaxId: string;
    labelInvoiceName: string;
    esPrimeraVez: boolean = true;

    constructor(public mensajero: Messenger) {
        this.tokenCliente = mensajero.subscribe<ClienteMensaje>(this.clienteEntregado, getType(ClienteMensaje), this);
    }

    clienteEntregado(mensaje: ClienteMensaje, subcriber: any) {
        subcriber.cliente = <Cliente>JSON.parse(JSON.stringify(mensaje.cliente));
    }

    delegarCambiosEnClienteControlador() {

        var este: CambiosEnClienteControlador = this;

        document.addEventListener("backbutton",
            () => {
                este.usuarioDeseaRegresarAPaginaAnterior();
            },
            true);

        $(document).on("pagebeforechange",
            (event, data) => {
                if (data.toPage === "UiPageCustomerInfo") {
                    este.cliente = data.options.data.cliente;
                    este.tarea = data.options.data.tarea;
                    este.configuracionDecimales = data.options.data.configuracionDecimales;
                    este.esPrimeraVez = data.options.data.esPrimeraVez;

                    este.cargarPantalla(este);
                    $.mobile.changePage("#UiPageCustomerInfo");
                }
            });

        $("#UiBotonCancelarModificarCliente").bind("touchstart",
            () => {
                este.usuarioDeseaRegresarAPaginaAnterior();
            });

        $("#UiPageCustomerInfo").on("click","#UiModificacionDeClienteListaEtiquetas a",
            (event) => {
                const id = (event as any).currentTarget.attributes["id"].nodeValue;
                this.usuarioDeseaEliminarEtiqueta(`#${id}`);
            });
// ReSharper disable once TsResolvedFromInaccessibleModule
        //$("#UiPageCustomerInfo").swipe("#UiModificacionDeClienteListaEtiquetas li",{
        //    swipe(event, direction, distance, duration, fingerCount, fingerData) {
        //        if (fingerCount === 1 && direction === "left") {
        //            const id = (event as any).currentTarget.attributes["id"].nodeValue;
        //            this.usuarioDeseaEliminarEtiqueta(`#${id}`);
        //        }
        //    }
        //});

        $("#UiPageCustomerInfo").on("click",
            "#UiModificarClienteListadoDeEtiquetas li",
            (event) => {
                var id = (event as any).currentTarget.attributes["id"].nodeValue;
                this.usuarioDeseaAgregarEtiqueta(`#${id}`);
            });

// ReSharper disable once TsResolvedFromInaccessibleModule
        //$("#UiPageCustomerInfo").swipe({
        //    swipe(event, direction, distance, duration, fingerCount, fingerData) {
        //        if (fingerCount === 1 && direction === "right") {
        //            let myPanel = $.mobile.activePage.children('[id="UiModificarClientePanelDeEtiquetas"]') as any;
        //            myPanel.panel("toggle");
        //            myPanel = null;
        //        }
        //    }
        //});

        $("#UiBtnMostrarListadoDeEtiquetasModificacionDeCliente").on("click",
            () => {
                let myPanel = $.mobile.activePage.children('[id="UiModificarClientePanelDeEtiquetas"]') as any;
                myPanel.panel("toggle");
                myPanel = null;
            });

        $("#UiBotonObtnerGpsDeModificarCliente").bind("touchstart",
            () => {
                este.usuarioDeseaObtenerGps(este);
            });

        $("#UiBotonMostarMapaDeModificarCliente").bind("touchstart",
            () => {
                este.usuarioDeseaVerMapa();
            });

        $("#UiBotonAceptarModificarCliente").bind("touchstart",
            () => {
                este.usuarioDeseaGuardarCambiosDeCliente(este);
            });
    }

    usuarioDeseaRegresarAPaginaAnterior() {
        switch ($.mobile.activePage[0].id) {
            case "UiPageCustomerInfo":
                if (this.viendoMapa === false) {
                    navigator.notification.confirm(
                        "¿Está Seguro de abandonar la modificación del cliente?",
                        (buttonIndex) => {
                            if (buttonIndex === 2) {
                                this.regresarAPantallaAnterior();
                            }
                        },
                        'Sonda® ' + SondaVersion,
                        <any>'No,Si'
                    );
                } else {
                    this.viendoMapa = false;
                    var uiModificarClienteDatosGenerales = $("#UiModificarClienteDatosGenerales");
                    var uiModificarClienteMapa = $("#UiModificarClienteMapa");
                    uiModificarClienteDatosGenerales.show();
                    uiModificarClienteMapa.hide();
                    uiModificarClienteDatosGenerales = null;
                    uiModificarClienteMapa = null;
                }
                break;
        }
    }

    cargarInformacionDeCliente() {
        let uiEtiquetaModificacionDeClienteCodigoDeCliente = $("#UiEtiquetaModificacionDeClienteCodigoDeCliente");
        uiEtiquetaModificacionDeClienteCodigoDeCliente.text(this.cliente.clientId);
        uiEtiquetaModificacionDeClienteCodigoDeCliente = null;

        let uiModificacionDeClienteNombre = $("#UiModificacionDeClienteNombre");
        uiModificacionDeClienteNombre.val(this.cliente.clientName);
        uiModificacionDeClienteNombre = null;

        let uiModificacionDeClienteDireccion = $("#UiModificacionDeClienteDireccion");
        uiModificacionDeClienteDireccion.val(this.cliente.address);
        uiModificacionDeClienteDireccion = null;

        let uiModificacionDeClienteContacto = $("#UiModificacionDeClienteContacto");
        uiModificacionDeClienteContacto.val(this.cliente.contactCustomer);
        uiModificacionDeClienteContacto = null;

        let uiModificacionDeClienteTelefono = $("#UiModificacionDeClienteTelefono");
        uiModificacionDeClienteTelefono.val(this.cliente.phone);
        uiModificacionDeClienteTelefono = null;

        let uiModificacionDeClienteNumeroIdentificacionTributaria =
            $("#UiModificacionDeClienteNumeroIdentificacionTributaria");
        uiModificacionDeClienteNumeroIdentificacionTributaria.text(this.labelTaxId);
        uiModificacionDeClienteNumeroIdentificacionTributaria = null;

        let uiModificacionDeClienteTxtNumeroIdentificacionTributaria =
            $("#UiModificacionDeClienteTxtNumeroIdentificacionTributaria");
        uiModificacionDeClienteTxtNumeroIdentificacionTributaria.val(this.cliente.clientTaxId);
        uiModificacionDeClienteTxtNumeroIdentificacionTributaria = null;

        let uiModificacionDeClienteNombreDeFacturacion =
            $("#UiModificacionDeClienteNombreDeFacturacion");
        uiModificacionDeClienteNombreDeFacturacion.text(this.labelInvoiceName);
        uiModificacionDeClienteNombreDeFacturacion = null;

        let uiModificacionDeClienteTxtNombreDeFacturacion =
            $("#UiModificacionDeClienteTxtNombreDeFacturacion");
        uiModificacionDeClienteTxtNombreDeFacturacion.val(this.cliente.invoiceName);
        uiModificacionDeClienteTxtNombreDeFacturacion = null;
    }

    cargarEtiquetasDeCliente(cliente: Cliente) {
        try {
            var uiModificacionDeClienteListaEtiquetas = $('#UiModificacionDeClienteListaEtiquetas');
            uiModificacionDeClienteListaEtiquetas.children().remove('li');

            var vLi = "";
            for (var i = 0; i < cliente.etiquetas.length; i++) {
                var etiqueta = cliente.etiquetas[i];
                vLi += "<li id='" +
                    etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() +
                    "' data-icon='false; class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check' >";
                vLi += "<a href='#' style='background-color:" + etiqueta.tagColor + ";' id='" + "ID_" + etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() +">";
                var colorSugerido = "";

                //Obtener color de contraste para el texto
                var hex = etiqueta.tagColor;
                var percent = 100;

                hex = hex.replace(/^\s*#|\s*$/g, '');

                // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
                if (hex.length == 3) {
                    hex = hex.replace(/(.)/g, '$1$1');
                }
                var r = parseInt(hex.substr(0, 2), 16),
                    g = parseInt(hex.substr(2, 2), 16),
                    b = parseInt(hex.substr(4, 2), 16);

                var y = 2.99 * r + 5.87 * g + 1.14 * b;
                if (y >= 1275) {
                    colorSugerido = '#000000';
                } else {
                    colorSugerido = '#FFFFFF';
                }
                //--Fin
                vLi += "<FONT color='" + colorSugerido + "'>";
                vLi += etiqueta.tagValueText;
                vLi += "</FONT></td>";
                vLi += "</a>";
                vLi +=
                    '<a href="#" data-role="button" data-theme="b" data-icon="delete" class="ui-nodisc-icon" data-mini="true" id="' + etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() + '"></a>'; //'onclick="this.usuarioDeseaEliminarEtiqueta(\'' + etiqueta.tagColor +'\');"></a>';
                vLi += "</li>";
            }
            
            if (vLi !== "") {
                uiModificacionDeClienteListaEtiquetas.append(vLi);
                uiModificacionDeClienteListaEtiquetas.listview("refresh");
                //uiModificacionDeClienteListaEtiquetas.trigger("create");

                uiModificacionDeClienteListaEtiquetas = null;
            }
        } catch (e) {
            notify("Error al cargar las etiquetas del cliente: " + e.message);
        }

    }

    cargarEtiquetasRestantes(_this: CambiosEnClienteControlador) {
        _this.clienteServicio.obtenerEtiquetasNoAsociadasAlCliente(_this.cliente,
            (etiquetas: Etiqueta[]) => {
                _this.etiquetas = etiquetas;
                _this.cargarEtiquetasNoAsociadasCliente(etiquetas);
            },
            (resultado: Operacion) => {
                notify(resultado.mensaje);
            });
    }

    cargarEtiquetasNoAsociadasCliente(etiquetas: Etiqueta[]) {
        try {
            var uiModificarClienteListadoDeEtiquetas = $('#UiModificarClienteListadoDeEtiquetas');
            uiModificarClienteListadoDeEtiquetas.children().remove('li');

            for (var i = 0; i < etiquetas.length; i++) {
                var etiqueta = etiquetas[i];
                var eventoAgregar = "usuarioDeseaAgregarEtiqueta('" +
                    etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() +
                    "')";

                var vLi = " <li id='" +
                    etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() +
                    "' data-icon='false; class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check' style='background-color:" +
                    etiqueta.tagColor +
                    ";' onclick=" +
                    eventoAgregar +
                    " >";
                var colorSugerido = "";

                //Obtener color de contraste para el texto
                var hex = etiqueta.tagColor;
                var percent = 100;

                hex = hex.replace(/^\s*#|\s*$/g, '');

                // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
                if (hex.length == 3) {
                    hex = hex.replace(/(.)/g, '$1$1');
                }
                var r = parseInt(hex.substr(0, 2), 16),
                    g = parseInt(hex.substr(2, 2), 16),
                    b = parseInt(hex.substr(4, 2), 16);

                var y = 2.99 * r + 5.87 * g + 1.14 * b;
                if (y >= 1275) {
                    colorSugerido = '#000000';
                } else {
                    colorSugerido = '#FFFFFF';
                }
                //--Fin
                vLi += "<FONT color='" + colorSugerido + "'>";
                vLi += etiqueta.tagValueText;
                vLi += "</FONT></li>";

                uiModificarClienteListadoDeEtiquetas.append(vLi);
                uiModificarClienteListadoDeEtiquetas.listview("refresh");
            }

            uiModificarClienteListadoDeEtiquetas = null;
        } catch (e) {
            notify("Error al cargar las etiquetas no asociadas al cliente: " + e.message);
        }

    }

    limpiarCamposDeModificarCliente(callback: () => void) {
        let uiEtiquetaModificacionDeClienteCodigoDeCliente = $("#UiEtiquetaModificacionDeClienteCodigoDeCliente");
        uiEtiquetaModificacionDeClienteCodigoDeCliente.text("...");
        uiEtiquetaModificacionDeClienteCodigoDeCliente = null;

        let uiModificacionDeClienteNombre = $("#UiModificacionDeClienteNombre");
        uiModificacionDeClienteNombre.text("");
        uiModificacionDeClienteNombre = null;

        let uiModificacionDeClienteDireccion = $("#UiModificacionDeClienteDireccion");
        uiModificacionDeClienteDireccion.text("");
        uiModificacionDeClienteDireccion = null;
        let uiModificacionDeClienteContacto = $("#UiModificacionDeClienteContacto");
        uiModificacionDeClienteContacto.text("");
        uiModificacionDeClienteContacto = null;
        let uiModificacionDeClienteTelefono = $("#UiModificacionDeClienteTelefono");
        uiModificacionDeClienteTelefono.text("");
        uiModificacionDeClienteTelefono = null;

        let uiModificacionDeClienteListaEtiquetas = $("#UiModificacionDeClienteListaEtiquetas");
        uiModificacionDeClienteListaEtiquetas.children().remove("li");
        uiModificacionDeClienteListaEtiquetas = null;

        let uiModificarClienteListadoDeEtiquetas = $("#UiModificarClienteListadoDeEtiquetas");
        uiModificarClienteListadoDeEtiquetas.children().remove("li");
        uiModificarClienteListadoDeEtiquetas = null;

        this.viendoMapa = false;
        let uiModificarClienteDatosGenerales = $("#UiModificarClienteDatosGenerales");
        let uiModificarClienteMapa = $("#UiModificarClienteMapa");
        uiModificarClienteDatosGenerales.show();
        uiModificarClienteMapa.hide();
        uiModificarClienteDatosGenerales = null;
        uiModificarClienteMapa = null;

        callback();
    }

    usuarioDeseaEliminarEtiqueta(tagColor) {
        var etiqueta: Etiqueta;

        for (var i = 0; i < this.cliente.etiquetas.length; i++) {
            if (this.cliente.etiquetas[i].tagColor === tagColor) {
                etiqueta = this.cliente.etiquetas[i];
                this.cliente.etiquetas.splice(i, 1);
                this.etiquetas.push(etiqueta);
                break;
            }
        }
        this.cargarEtiquetasDeCliente(this.cliente);
        this.cargarEtiquetasNoAsociadasCliente(this.etiquetas);
    }

    usuarioDeseaAgregarEtiqueta(tagColor: string) {
        var etiqueta: Etiqueta;

        for (var i = 0; i < this.etiquetas.length; i++) {
            if (this.etiquetas[i].tagColor === tagColor) {
                etiqueta = this.etiquetas[i];
                this.etiquetas.splice(i, 1);
                this.cliente.etiquetas.push(etiqueta);
                break;
            }
        }
        this.cargarEtiquetasDeCliente(this.cliente);
        this.cargarEtiquetasNoAsociadasCliente(this.etiquetas);
    }

    usuarioDeseaObtenerGps(_this: CambiosEnClienteControlador) {
        ObtenerPosicionGPS(() => {
            _this.cliente.gps = gCurrentGPS.toString();
            ToastThis("GPS obtenido");
        });
    }

    usuarioDeseaVerMapa() {
        ObtenerPosicionGPS(() => {
            //this.cliente.gps = gCurrentGPS.toString();
            this.viendoMapa = true;

            var uiModificarClienteDatosGenerales = $("#UiModificarClienteDatosGenerales");
            var uiModificarClienteMapa = $("#UiModificarClienteMapa");
            uiModificarClienteDatosGenerales.hide();
            uiModificarClienteMapa.show();
            uiModificarClienteDatosGenerales = null;
            uiModificarClienteMapa = null;

            this.mostarMapa(gCurrentGPS.toString());
            ToastThis("GPS obtenido");
        });
    }

    usuarioDeseaGuardarCambiosDeCliente(_this: CambiosEnClienteControlador) {
        navigator.notification.confirm(
            "¿Está Seguro de guardar los cambios del cliente?",
            (buttonIndex) => {
                if (buttonIndex === 2) {
                    try {
                        let uiModificacionDeClienteDireccion = $("#UiModificacionDeClienteDireccion");
                        _this.cliente.address = uiModificacionDeClienteDireccion.val();
                        uiModificacionDeClienteDireccion = null;

                        let uiModificacionDeClienteContacto = $("#UiModificacionDeClienteContacto");
                        _this.cliente.contactCustomer = uiModificacionDeClienteContacto.val();
                        uiModificacionDeClienteContacto = null;

                        let uiModificacionDeClienteTelefono = $("#UiModificacionDeClienteTelefono");
                        _this.cliente.phone = uiModificacionDeClienteTelefono.val();
                        uiModificacionDeClienteTelefono = null;

                        let uiModificacionDeClienteInvoiceTaxId =
                            $("#UiModificacionDeClienteTxtNumeroIdentificacionTributaria");
                        _this.cliente.invoiceTaxId = uiModificacionDeClienteInvoiceTaxId.val();
                        _this.cliente.clientTaxId = uiModificacionDeClienteInvoiceTaxId.val();
                        uiModificacionDeClienteInvoiceTaxId = null;

                        let uiModificacionDeClienteInvoiceName = $("#UiModificacionDeClienteTxtNombreDeFacturacion");
                        _this.cliente.invoiceName = uiModificacionDeClienteInvoiceName.val();
                        uiModificacionDeClienteInvoiceName = null;

                        const regExp = new RegExp("^[^`'\"]*$");
                        let uiModificacionDeClienteNombre = $("#UiModificacionDeClienteNombre");
                        _this.cliente.clientNewName = uiModificacionDeClienteNombre.val();
                        uiModificacionDeClienteNombre = null;
                        if (!regExp.test(_this.cliente.clientNewName) || !_this.cliente.clientNewName) {
                            notify("El nombre contiene caracteres invalidos o esta vacio.");
                            return;
                        }

                        _this.clienteServicio.guardarCambiosDeCliente(_this.cliente,
                            (clienteN1: Cliente) => {
                                if (clienteN1.origen === "TareaDetalleControlador" &&
                                    _this.tarea.taskIsFrom === TareaEstado.Asignada && _this.cliente.estaEnModificacionObligatoria) {
                                    EnviarData();

                                    _this.tareaServicio.actualizarTareaEstado(
                                        _this.tarea,
                                        () => {
                                            actualizarListadoDeTareas(
                                                _this.tarea.taskId,
                                                _this.tarea.taskType,
                                                _this.tarea.taskStatus,
                                                _this.cliente.clientId,
                                                _this.cliente.clientName,
                                                _this.cliente.address,
                                                0,
                                                gtaskStatus,
                                                _this.cliente.rgaCode
                                            );

                                            if (_this.tarea.hasDraft) {
                                                _this.motrarPantallaOrdenDeVenta();
                                            } else {
                                                _this.mostrarPantallaDeListadoDeSkus();
                                            }

                                        },
                                        (resultado: Operacion) => {
                                            notify(resultado.mensaje);
                                        });

                                } else {
                                    _this.regresarAPantallaAnterior();
                                    EnviarData();
                                }
                            },
                            (resultado: Operacion) => {
                                notify(resultado.mensaje);
                            });

                    } catch (e) {
                        notify("Error al guardar los cambios del cliente: " + e.message);
                    }
                }
            },
            `Sonda® ${SondaVersion}`,
            ["No", "Si"]);
    }

    cargarMapa() {
        var defaultLatLng = new google.maps.LatLng(14.645866, -90.55291745);
        var self = this;
        //self.mostarMapa(defaultLatLng);  // Failed to find location, show default map
        try {
            if (navigator.geolocation) {
                const success = (pos: any) => {
                    this.mostarMapa(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                };
                const fail = () => {
                    self.mostarMapa(defaultLatLng); // Failed to find location, show default map
                };
                navigator.geolocation.getCurrentPosition(success, fail, { maximumAge: 500000, enableHighAccuracy: true, timeout: 6000 });
            } else {
                self.mostarMapa(defaultLatLng);  // No geolocation support, show default map
            }
        } catch (e) {
            notify("Error al cargar el mapa: " + e.message);
        }
    }

    mostarMapa(latlng: any) {
        try {
            var myOptions = {
                zoom: 18,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
            // Add an overlay to the map of current lat/lng

            map.addListener('click', e => {
                this.colocarPuntoEnMapa(e.latLng, map);
            });

            var marker = new google.maps.Marker({
                position: latlng,
                icon: 'http://www.google.com/mapfiles/arrow.png',
                map: map,
                title: "Greetings!"
            });

            marker.addListener('click', () => {
                map.setZoom(8);
                map.setCenter(marker.getPosition());
            });
        } catch (e) {
            notify("Error al mostrar el mapa: " + e.message);
        }
    }

    colocarPuntoEnMapa(latLng: any, map: google.maps.Map) {
        var xindex = this.markersFence.length + 1;
        //var iconname = 'http://maps.google.com/mapfiles/kml/paddle/' + xindex + '-lv.png';
        var iconname = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + xindex + '|00FF00|000000';
        //alert(iconname);

        var marker = new google.maps.Marker({
            position: latLng,
            icon: iconname,
            map: map
        });
        map.panTo(latLng);

        this.markersFence.push(marker);
    }

    regresarAPantallaAnterior() {
        switch (this.cliente.origen) {
            case "DocumenoDeVentaControlador":
                $.mobile.changePage("pos_skus_page", {
                    transition: "pop"
                    , reverse: true
                    , showLoadMsg: false,
                    data: {
                        "cliente": this.cliente
                        , "tarea": this.tarea
                        , "configuracionDecimales": this.configuracionDecimales
                        , "esPrimeraVez": this.esPrimeraVez
                    }
                });
                break;
            case "TareaDetalleControlador":
                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow"
                    , reverse: true
                    , showLoadMsg: false
                });
                break;
            case "ResumenOrdenDeVentaControlador":
                gVentaEsReimpresion = true;
                gClientID = this.cliente.clientId;
                gtaskid = this.tarea.taskId;
                gTaskType = this.tarea.taskType;
                $.mobile.changePage("#UiPageRepPreSale", {
                    transition: "pop"
                    , reverse: true
                    , showLoadMsg: false
                });
                break;
        }
    }

    cargarPantalla(_this: CambiosEnClienteControlador) {
        let parameterTaxId = localStorage.getItem("TAX_ID");
        let parameterInvoiceName = localStorage.getItem("INVOICE_NAME");

        if (parameterTaxId === null || parameterTaxId === undefined || parameterTaxId === "") {
            _this.labelTaxId = "...";
        } else {
            _this.labelTaxId = parameterTaxId;
        }

        if (parameterInvoiceName === null || parameterInvoiceName === undefined || parameterInvoiceName === ""
        ) {
            _this.labelInvoiceName = "...";
        } else {
            _this.labelInvoiceName = parameterInvoiceName;
        }

        _this.limpiarCamposDeModificarCliente(() => {
            _this.clienteServicio.obtenerEtiquetas(_this.cliente,
                (clienteN1: Cliente) => {
                    _this.cliente = clienteN1;
                    _this.cargarInformacionDeCliente();
                    _this.cargarEtiquetasDeCliente(_this.cliente);
                    _this.cargarEtiquetasRestantes(_this);
                    //todo: Se comento esta parte por la version de cordova cuando secreo,se debe de probar con la nueva version del proyecto
                    //_this.cargarMapa();
                    //ObtenerMapa();
                },
                (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
        });
    }

    motrarPantallaOrdenDeVenta() {
        $.mobile.changePage("#pos_skus_page", {
            transition: "flow",
            reverse: true,
            changeHash: true,
            showLoadMsg: false,
            data: {
                "cliente": this.cliente
                , "tarea": this.tarea
                , "configuracionDecimales": this.configuracionDecimales
                , "esPrimeraVez": this.esPrimeraVez
            }
        });
    }

    mostrarPantallaDeListadoDeSkus() {
        $.mobile.changePage("skus_list_page", {
            transition: "flow",
            reverse: true,
            changeHash: true,
            showLoadMsg: false,
            data: {
                "cliente": this.cliente
                , "tarea": this.tarea
                , "configuracionDecimales": this.configuracionDecimales
                , "esPrimeraVez": this.esPrimeraVez
            }
        });
    }
}