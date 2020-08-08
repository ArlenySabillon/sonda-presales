var CambiosEnClienteControlador = (function () {
    function CambiosEnClienteControlador(mensajero) {
        this.mensajero = mensajero;
        this.viendoMapa = false;
        this.clienteServicio = new ClienteServicio();
        this.tareaServicio = new TareaServcio();
        this.markersFence = new Array();
        this.esPrimeraVez = true;
        this.tokenCliente = mensajero.subscribe(this.clienteEntregado, getType(ClienteMensaje), this);
    }
    CambiosEnClienteControlador.prototype.clienteEntregado = function (mensaje, subcriber) {
        subcriber.cliente = JSON.parse(JSON.stringify(mensaje.cliente));
    };
    CambiosEnClienteControlador.prototype.delegarCambiosEnClienteControlador = function () {
        var _this_1 = this;
        var este = this;
        document.addEventListener("backbutton", function () {
            este.usuarioDeseaRegresarAPaginaAnterior();
        }, true);
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "UiPageCustomerInfo") {
                este.cliente = data.options.data.cliente;
                este.tarea = data.options.data.tarea;
                este.configuracionDecimales = data.options.data.configuracionDecimales;
                este.esPrimeraVez = data.options.data.esPrimeraVez;
                este.cargarPantalla(este);
                $.mobile.changePage("#UiPageCustomerInfo");
            }
        });
        $("#UiBotonCancelarModificarCliente").bind("touchstart", function () {
            este.usuarioDeseaRegresarAPaginaAnterior();
        });
        $("#UiPageCustomerInfo").on("click", "#UiModificacionDeClienteListaEtiquetas a", function (event) {
            var id = event.currentTarget.attributes["id"].nodeValue;
            _this_1.usuarioDeseaEliminarEtiqueta("#" + id);
        });
        $("#UiPageCustomerInfo").on("click", "#UiModificarClienteListadoDeEtiquetas li", function (event) {
            var id = event.currentTarget.attributes["id"].nodeValue;
            _this_1.usuarioDeseaAgregarEtiqueta("#" + id);
        });
        $("#UiBtnMostrarListadoDeEtiquetasModificacionDeCliente").on("click", function () {
            var myPanel = $.mobile.activePage.children('[id="UiModificarClientePanelDeEtiquetas"]');
            myPanel.panel("toggle");
            myPanel = null;
        });
        $("#UiBotonObtnerGpsDeModificarCliente").bind("touchstart", function () {
            este.usuarioDeseaObtenerGps(este);
        });
        $("#UiBotonMostarMapaDeModificarCliente").bind("touchstart", function () {
            este.usuarioDeseaVerMapa();
        });
        $("#UiBotonAceptarModificarCliente").bind("touchstart", function () {
            este.usuarioDeseaGuardarCambiosDeCliente(este);
        });
    };
    CambiosEnClienteControlador.prototype.usuarioDeseaRegresarAPaginaAnterior = function () {
        var _this_1 = this;
        switch ($.mobile.activePage[0].id) {
            case "UiPageCustomerInfo":
                if (this.viendoMapa === false) {
                    navigator.notification.confirm("¿Está Seguro de abandonar la modificación del cliente?", function (buttonIndex) {
                        if (buttonIndex === 2) {
                            _this_1.regresarAPantallaAnterior();
                        }
                    }, 'Sonda® ' + SondaVersion, 'No,Si');
                }
                else {
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
    };
    CambiosEnClienteControlador.prototype.cargarInformacionDeCliente = function () {
        var uiEtiquetaModificacionDeClienteCodigoDeCliente = $("#UiEtiquetaModificacionDeClienteCodigoDeCliente");
        uiEtiquetaModificacionDeClienteCodigoDeCliente.text(this.cliente.clientId);
        uiEtiquetaModificacionDeClienteCodigoDeCliente = null;
        var uiModificacionDeClienteNombre = $("#UiModificacionDeClienteNombre");
        uiModificacionDeClienteNombre.val(this.cliente.clientName);
        uiModificacionDeClienteNombre = null;
        var uiModificacionDeClienteDireccion = $("#UiModificacionDeClienteDireccion");
        uiModificacionDeClienteDireccion.val(this.cliente.address);
        uiModificacionDeClienteDireccion = null;
        var uiModificacionDeClienteContacto = $("#UiModificacionDeClienteContacto");
        uiModificacionDeClienteContacto.val(this.cliente.contactCustomer);
        uiModificacionDeClienteContacto = null;
        var uiModificacionDeClienteTelefono = $("#UiModificacionDeClienteTelefono");
        uiModificacionDeClienteTelefono.val(this.cliente.phone);
        uiModificacionDeClienteTelefono = null;
        var uiModificacionDeClienteNumeroIdentificacionTributaria = $("#UiModificacionDeClienteNumeroIdentificacionTributaria");
        uiModificacionDeClienteNumeroIdentificacionTributaria.text(this.labelTaxId);
        uiModificacionDeClienteNumeroIdentificacionTributaria = null;
        var uiModificacionDeClienteTxtNumeroIdentificacionTributaria = $("#UiModificacionDeClienteTxtNumeroIdentificacionTributaria");
        uiModificacionDeClienteTxtNumeroIdentificacionTributaria.val(this.cliente.clientTaxId);
        uiModificacionDeClienteTxtNumeroIdentificacionTributaria = null;
        var uiModificacionDeClienteNombreDeFacturacion = $("#UiModificacionDeClienteNombreDeFacturacion");
        uiModificacionDeClienteNombreDeFacturacion.text(this.labelInvoiceName);
        uiModificacionDeClienteNombreDeFacturacion = null;
        var uiModificacionDeClienteTxtNombreDeFacturacion = $("#UiModificacionDeClienteTxtNombreDeFacturacion");
        uiModificacionDeClienteTxtNombreDeFacturacion.val(this.cliente.invoiceName);
        uiModificacionDeClienteTxtNombreDeFacturacion = null;
    };
    CambiosEnClienteControlador.prototype.cargarEtiquetasDeCliente = function (cliente) {
        try {
            var uiModificacionDeClienteListaEtiquetas = $('#UiModificacionDeClienteListaEtiquetas');
            uiModificacionDeClienteListaEtiquetas.children().remove('li');
            var vLi = "";
            for (var i = 0; i < cliente.etiquetas.length; i++) {
                var etiqueta = cliente.etiquetas[i];
                vLi += "<li id='" +
                    etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() +
                    "' data-icon='false; class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check' >";
                vLi += "<a href='#' style='background-color:" + etiqueta.tagColor + ";' id='" + "ID_" + etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() + ">";
                var colorSugerido = "";
                var hex = etiqueta.tagColor;
                var percent = 100;
                hex = hex.replace(/^\s*#|\s*$/g, '');
                if (hex.length == 3) {
                    hex = hex.replace(/(.)/g, '$1$1');
                }
                var r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
                var y = 2.99 * r + 5.87 * g + 1.14 * b;
                if (y >= 1275) {
                    colorSugerido = '#000000';
                }
                else {
                    colorSugerido = '#FFFFFF';
                }
                vLi += "<FONT color='" + colorSugerido + "'>";
                vLi += etiqueta.tagValueText;
                vLi += "</FONT></td>";
                vLi += "</a>";
                vLi +=
                    '<a href="#" data-role="button" data-theme="b" data-icon="delete" class="ui-nodisc-icon" data-mini="true" id="' + etiqueta.tagColor.substring(1, etiqueta.tagColor.length).toString() + '"></a>';
                vLi += "</li>";
            }
            if (vLi !== "") {
                uiModificacionDeClienteListaEtiquetas.append(vLi);
                uiModificacionDeClienteListaEtiquetas.listview("refresh");
                uiModificacionDeClienteListaEtiquetas = null;
            }
        }
        catch (e) {
            notify("Error al cargar las etiquetas del cliente: " + e.message);
        }
    };
    CambiosEnClienteControlador.prototype.cargarEtiquetasRestantes = function (_this) {
        _this.clienteServicio.obtenerEtiquetasNoAsociadasAlCliente(_this.cliente, function (etiquetas) {
            _this.etiquetas = etiquetas;
            _this.cargarEtiquetasNoAsociadasCliente(etiquetas);
        }, function (resultado) {
            notify(resultado.mensaje);
        });
    };
    CambiosEnClienteControlador.prototype.cargarEtiquetasNoAsociadasCliente = function (etiquetas) {
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
                var hex = etiqueta.tagColor;
                var percent = 100;
                hex = hex.replace(/^\s*#|\s*$/g, '');
                if (hex.length == 3) {
                    hex = hex.replace(/(.)/g, '$1$1');
                }
                var r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
                var y = 2.99 * r + 5.87 * g + 1.14 * b;
                if (y >= 1275) {
                    colorSugerido = '#000000';
                }
                else {
                    colorSugerido = '#FFFFFF';
                }
                vLi += "<FONT color='" + colorSugerido + "'>";
                vLi += etiqueta.tagValueText;
                vLi += "</FONT></li>";
                uiModificarClienteListadoDeEtiquetas.append(vLi);
                uiModificarClienteListadoDeEtiquetas.listview("refresh");
            }
            uiModificarClienteListadoDeEtiquetas = null;
        }
        catch (e) {
            notify("Error al cargar las etiquetas no asociadas al cliente: " + e.message);
        }
    };
    CambiosEnClienteControlador.prototype.limpiarCamposDeModificarCliente = function (callback) {
        var uiEtiquetaModificacionDeClienteCodigoDeCliente = $("#UiEtiquetaModificacionDeClienteCodigoDeCliente");
        uiEtiquetaModificacionDeClienteCodigoDeCliente.text("...");
        uiEtiquetaModificacionDeClienteCodigoDeCliente = null;
        var uiModificacionDeClienteNombre = $("#UiModificacionDeClienteNombre");
        uiModificacionDeClienteNombre.text("");
        uiModificacionDeClienteNombre = null;
        var uiModificacionDeClienteDireccion = $("#UiModificacionDeClienteDireccion");
        uiModificacionDeClienteDireccion.text("");
        uiModificacionDeClienteDireccion = null;
        var uiModificacionDeClienteContacto = $("#UiModificacionDeClienteContacto");
        uiModificacionDeClienteContacto.text("");
        uiModificacionDeClienteContacto = null;
        var uiModificacionDeClienteTelefono = $("#UiModificacionDeClienteTelefono");
        uiModificacionDeClienteTelefono.text("");
        uiModificacionDeClienteTelefono = null;
        var uiModificacionDeClienteListaEtiquetas = $("#UiModificacionDeClienteListaEtiquetas");
        uiModificacionDeClienteListaEtiquetas.children().remove("li");
        uiModificacionDeClienteListaEtiquetas = null;
        var uiModificarClienteListadoDeEtiquetas = $("#UiModificarClienteListadoDeEtiquetas");
        uiModificarClienteListadoDeEtiquetas.children().remove("li");
        uiModificarClienteListadoDeEtiquetas = null;
        this.viendoMapa = false;
        var uiModificarClienteDatosGenerales = $("#UiModificarClienteDatosGenerales");
        var uiModificarClienteMapa = $("#UiModificarClienteMapa");
        uiModificarClienteDatosGenerales.show();
        uiModificarClienteMapa.hide();
        uiModificarClienteDatosGenerales = null;
        uiModificarClienteMapa = null;
        callback();
    };
    CambiosEnClienteControlador.prototype.usuarioDeseaEliminarEtiqueta = function (tagColor) {
        var etiqueta;
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
    };
    CambiosEnClienteControlador.prototype.usuarioDeseaAgregarEtiqueta = function (tagColor) {
        var etiqueta;
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
    };
    CambiosEnClienteControlador.prototype.usuarioDeseaObtenerGps = function (_this) {
        ObtenerPosicionGPS(function () {
            _this.cliente.gps = gCurrentGPS.toString();
            ToastThis("GPS obtenido");
        });
    };
    CambiosEnClienteControlador.prototype.usuarioDeseaVerMapa = function () {
        var _this_1 = this;
        ObtenerPosicionGPS(function () {
            _this_1.viendoMapa = true;
            var uiModificarClienteDatosGenerales = $("#UiModificarClienteDatosGenerales");
            var uiModificarClienteMapa = $("#UiModificarClienteMapa");
            uiModificarClienteDatosGenerales.hide();
            uiModificarClienteMapa.show();
            uiModificarClienteDatosGenerales = null;
            uiModificarClienteMapa = null;
            _this_1.mostarMapa(gCurrentGPS.toString());
            ToastThis("GPS obtenido");
        });
    };
    CambiosEnClienteControlador.prototype.usuarioDeseaGuardarCambiosDeCliente = function (_this) {
        navigator.notification.confirm("¿Está Seguro de guardar los cambios del cliente?", function (buttonIndex) {
            if (buttonIndex === 2) {
                try {
                    var uiModificacionDeClienteDireccion = $("#UiModificacionDeClienteDireccion");
                    _this.cliente.address = uiModificacionDeClienteDireccion.val();
                    uiModificacionDeClienteDireccion = null;
                    var uiModificacionDeClienteContacto = $("#UiModificacionDeClienteContacto");
                    _this.cliente.contactCustomer = uiModificacionDeClienteContacto.val();
                    uiModificacionDeClienteContacto = null;
                    var uiModificacionDeClienteTelefono = $("#UiModificacionDeClienteTelefono");
                    _this.cliente.phone = uiModificacionDeClienteTelefono.val();
                    uiModificacionDeClienteTelefono = null;
                    var uiModificacionDeClienteInvoiceTaxId = $("#UiModificacionDeClienteTxtNumeroIdentificacionTributaria");
                    _this.cliente.invoiceTaxId = uiModificacionDeClienteInvoiceTaxId.val();
                    _this.cliente.clientTaxId = uiModificacionDeClienteInvoiceTaxId.val();
                    uiModificacionDeClienteInvoiceTaxId = null;
                    var uiModificacionDeClienteInvoiceName = $("#UiModificacionDeClienteTxtNombreDeFacturacion");
                    _this.cliente.invoiceName = uiModificacionDeClienteInvoiceName.val();
                    uiModificacionDeClienteInvoiceName = null;
                    var regExp = new RegExp("^[^`'\"]*$");
                    var uiModificacionDeClienteNombre = $("#UiModificacionDeClienteNombre");
                    _this.cliente.clientNewName = uiModificacionDeClienteNombre.val();
                    uiModificacionDeClienteNombre = null;
                    if (!regExp.test(_this.cliente.clientNewName) || !_this.cliente.clientNewName) {
                        notify("El nombre contiene caracteres invalidos o esta vacio.");
                        return;
                    }
                    _this.clienteServicio.guardarCambiosDeCliente(_this.cliente, function (clienteN1) {
                        if (clienteN1.origen === "TareaDetalleControlador" &&
                            _this.tarea.taskIsFrom === TareaEstado.Asignada && _this.cliente.estaEnModificacionObligatoria) {
                            EnviarData();
                            _this.tareaServicio.actualizarTareaEstado(_this.tarea, function () {
                                actualizarListadoDeTareas(_this.tarea.taskId, _this.tarea.taskType, _this.tarea.taskStatus, _this.cliente.clientId, _this.cliente.clientName, _this.cliente.address, 0, gtaskStatus, _this.cliente.rgaCode);
                                if (_this.tarea.hasDraft) {
                                    _this.motrarPantallaOrdenDeVenta();
                                }
                                else {
                                    _this.mostrarPantallaDeListadoDeSkus();
                                }
                            }, function (resultado) {
                                notify(resultado.mensaje);
                            });
                        }
                        else {
                            _this.regresarAPantallaAnterior();
                            EnviarData();
                        }
                    }, function (resultado) {
                        notify(resultado.mensaje);
                    });
                }
                catch (e) {
                    notify("Error al guardar los cambios del cliente: " + e.message);
                }
            }
        }, "Sonda\u00AE " + SondaVersion, ["No", "Si"]);
    };
    CambiosEnClienteControlador.prototype.cargarMapa = function () {
        var _this_1 = this;
        var defaultLatLng = new google.maps.LatLng(14.645866, -90.55291745);
        var self = this;
        try {
            if (navigator.geolocation) {
                var success = function (pos) {
                    _this_1.mostarMapa(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                };
                var fail = function () {
                    self.mostarMapa(defaultLatLng);
                };
                navigator.geolocation.getCurrentPosition(success, fail, { maximumAge: 500000, enableHighAccuracy: true, timeout: 6000 });
            }
            else {
                self.mostarMapa(defaultLatLng);
            }
        }
        catch (e) {
            notify("Error al cargar el mapa: " + e.message);
        }
    };
    CambiosEnClienteControlador.prototype.mostarMapa = function (latlng) {
        var _this_1 = this;
        try {
            var myOptions = {
                zoom: 18,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
            map.addListener('click', function (e) {
                _this_1.colocarPuntoEnMapa(e.latLng, map);
            });
            var marker = new google.maps.Marker({
                position: latlng,
                icon: 'http://www.google.com/mapfiles/arrow.png',
                map: map,
                title: "Greetings!"
            });
            marker.addListener('click', function () {
                map.setZoom(8);
                map.setCenter(marker.getPosition());
            });
        }
        catch (e) {
            notify("Error al mostrar el mapa: " + e.message);
        }
    };
    CambiosEnClienteControlador.prototype.colocarPuntoEnMapa = function (latLng, map) {
        var xindex = this.markersFence.length + 1;
        var iconname = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + xindex + '|00FF00|000000';
        var marker = new google.maps.Marker({
            position: latLng,
            icon: iconname,
            map: map
        });
        map.panTo(latLng);
        this.markersFence.push(marker);
    };
    CambiosEnClienteControlador.prototype.regresarAPantallaAnterior = function () {
        switch (this.cliente.origen) {
            case "DocumenoDeVentaControlador":
                $.mobile.changePage("pos_skus_page", {
                    transition: "pop",
                    reverse: true,
                    showLoadMsg: false,
                    data: {
                        "cliente": this.cliente,
                        "tarea": this.tarea,
                        "configuracionDecimales": this.configuracionDecimales,
                        "esPrimeraVez": this.esPrimeraVez
                    }
                });
                break;
            case "TareaDetalleControlador":
                $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
                break;
            case "ResumenOrdenDeVentaControlador":
                gVentaEsReimpresion = true;
                gClientID = this.cliente.clientId;
                gtaskid = this.tarea.taskId;
                gTaskType = this.tarea.taskType;
                $.mobile.changePage("#UiPageRepPreSale", {
                    transition: "pop",
                    reverse: true,
                    showLoadMsg: false
                });
                break;
        }
    };
    CambiosEnClienteControlador.prototype.cargarPantalla = function (_this) {
        var parameterTaxId = localStorage.getItem("TAX_ID");
        var parameterInvoiceName = localStorage.getItem("INVOICE_NAME");
        if (parameterTaxId === null || parameterTaxId === undefined || parameterTaxId === "") {
            _this.labelTaxId = "...";
        }
        else {
            _this.labelTaxId = parameterTaxId;
        }
        if (parameterInvoiceName === null || parameterInvoiceName === undefined || parameterInvoiceName === "") {
            _this.labelInvoiceName = "...";
        }
        else {
            _this.labelInvoiceName = parameterInvoiceName;
        }
        _this.limpiarCamposDeModificarCliente(function () {
            _this.clienteServicio.obtenerEtiquetas(_this.cliente, function (clienteN1) {
                _this.cliente = clienteN1;
                _this.cargarInformacionDeCliente();
                _this.cargarEtiquetasDeCliente(_this.cliente);
                _this.cargarEtiquetasRestantes(_this);
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        });
    };
    CambiosEnClienteControlador.prototype.motrarPantallaOrdenDeVenta = function () {
        $.mobile.changePage("#pos_skus_page", {
            transition: "flow",
            reverse: true,
            changeHash: true,
            showLoadMsg: false,
            data: {
                "cliente": this.cliente,
                "tarea": this.tarea,
                "configuracionDecimales": this.configuracionDecimales,
                "esPrimeraVez": this.esPrimeraVez
            }
        });
    };
    CambiosEnClienteControlador.prototype.mostrarPantallaDeListadoDeSkus = function () {
        $.mobile.changePage("skus_list_page", {
            transition: "flow",
            reverse: true,
            changeHash: true,
            showLoadMsg: false,
            data: {
                "cliente": this.cliente,
                "tarea": this.tarea,
                "configuracionDecimales": this.configuracionDecimales,
                "esPrimeraVez": this.esPrimeraVez
            }
        });
    };
    return CambiosEnClienteControlador;
}());
//# sourceMappingURL=CambiosEnClienteControlador.js.map