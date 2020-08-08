var PagoControlador = (function () {
    function PagoControlador(mensajero) {
        this.mensajero = mensajero;
        this.ordenDeVentaServicio = new OrdenDeVentaServicio();
        this.taareaServicio = new TareaServcio();
        this.clienteServicio = new ClienteServicio();
        this.manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
        this.pagoServicio = new PagoServicio();
        this.listaDeSkuDeVenta = [];
        this.tokenCliente = mensajero.subscribe(this.clienteEntregado, getType(ClienteMensaje), this);
        this.tokenTarea = mensajero.subscribe(this.tareaEntregado, getType(TareaMensaje), this);
        this.tokenListaOrdenDeVenta = mensajero.subscribe(this.listaDeSkuDeVentaEntregado, getType(ListaSkuMensaje), this);
        this.tokenPago = mensajero.subscribe(this.pagoEntregado, getType(PagoMensaje), this);
    }
    PagoControlador.prototype.clienteEntregado = function (mensaje, subcriber) {
        subcriber.cliente = mensaje.cliente;
    };
    PagoControlador.prototype.tareaEntregado = function (mensaje, subcriber) {
        subcriber.tarea = mensaje.tarea;
        subcriber.esReimpresion = false;
    };
    PagoControlador.prototype.listaDeSkuDeVentaEntregado = function (mensaje, subcriber) {
        subcriber.listaDeSkuDeVenta = mensaje.listaSku;
        subcriber.listaSkuOrdenDeVentaPrincipal = [];
        subcriber.listaDeOrdnesDeVEntaCf = [];
        subcriber.listaDeSkuParaBonificacion = mensaje.listaDeSkuParaBonificacion;
    };
    PagoControlador.prototype.pagoEntregado = function (mensaje, subcriber) {
        subcriber.pago = mensaje.pago;
        if (subcriber.pago === null || subcriber.pago === undefined) {
            subcriber.imagen1 = null;
            subcriber.imagen2 = null;
            subcriber.tipoDePago = TipoDePago.Efectivo;
        }
        else {
            subcriber.imagen1 = subcriber.pago.pagoDetalle[0].image1;
            subcriber.imagen2 = subcriber.pago.pagoDetalle[0].image2;
            subcriber.tipoDePago = subcriber.pago.pagoDetalle[0].paymentType;
        }
    };
    PagoControlador.prototype.delegadoPagoControlador = function () {
        var este = this;
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "UiPagePayment") {
                este.cliente = data.options.data.cliente;
                este.tarea = data.options.data.tarea;
                este.configuracionDecimales = data.options.data.configuracionDecimales;
                este.pago = data.options.data.pago;
                este.cargarPantalla(este);
                $.mobile.changePage("#UiPagePayment");
            }
        });
        $("#UiBotonListadoDeFormaDePago").bind("touchstart", function () {
            este.usuarioSeleccionoFormaDePago();
        });
        document.addEventListener("backbutton", function () {
            este.usuarioDeseaVerPantallaAnterior();
        }, true);
        $("#UiBotonAtrasFormaDePago").on("click", function () {
            este.usuarioDeseaVerPantallaAnterior();
        });
        $("#UiBotonAceptarFormaDePago").on("click", function () {
            este.usuarioSelecionoAceptarFormaDePago(este);
        });
        $("#UiBotonImagenFrontal").on("click", function () {
            este.usuarioDeseaTomarImagen(TipoDeFoto.Frontal, este);
        });
        $("#UiBotonImagenTrasera").on("click", function () {
            este.usuarioDeseaTomarImagen(TipoDeFoto.Trasera, este);
        });
    };
    PagoControlador.prototype.usuarioDeseaVerPantallaAnterior = function () {
        var uiTextoNumeroDeDocumentoDeCheque = $("#UiTextoNumeroDeDocumentoDeCheque");
        var uiEtiquetaFormaDePagoSeleccionada = $("#UiEtiquetaFormaDePagoSeleccionada");
        uiTextoNumeroDeDocumentoDeCheque.text("");
        uiEtiquetaFormaDePagoSeleccionada.text("Efectivo");
        switch ($.mobile.activePage[0].id) {
            case "UiPagePayment":
                $.mobile.changePage("#SalesOrderSummaryPage", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
                break;
        }
        uiTextoNumeroDeDocumentoDeCheque = null;
        uiEtiquetaFormaDePagoSeleccionada = null;
    };
    PagoControlador.prototype.obtenerConfiguracionDeDecimales = function () {
        var _this_1 = this;
        this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (decimales) {
            _this_1.configuracionDecimales = decimales;
        }, function (operacion) {
            notify(operacion.mensaje);
        });
    };
    PagoControlador.prototype.usuarioSeleccionoFormaDePago = function () {
        var _this_1 = this;
        var listaDeUnidadesDeMedida = [];
        listaDeUnidadesDeMedida.push({
            text: "Efectivo",
            value: TipoDePago.Efectivo.toString()
        });
        listaDeUnidadesDeMedida.push({
            text: "Cheque",
            value: TipoDePago.Cheque.toString()
        });
        var configoptions = {
            title: "Forma de Pago",
            items: listaDeUnidadesDeMedida,
            doneButtonLabel: "Ok",
            cancelButtonLabel: "Cancelar"
        };
        ShowListPicker(configoptions, function (item) {
            _this_1.mostrarOpcionDeTipoDePago(item.toString(), "");
        });
    };
    PagoControlador.prototype.usuarioSelecionoAceptarFormaDePago = function (_this) {
        var uiTextoNumeroDeDocumentoDeCheque = $("#UiTextoNumeroDeDocumentoDeCheque");
        if (_this.tipoDePago === TipoDePago.Cheque &&
            (uiTextoNumeroDeDocumentoDeCheque.val().trim() === "" ||
                _this.imagen1 === null)) {
            notify("Debe ingresar el numero de documento y tomar la imagen frontal");
        }
        else {
            if (_this.pago === null || _this.pago === undefined) {
                var numeroDeDocumento = uiTextoNumeroDeDocumentoDeCheque.val();
                _this.pagoServicio.formarPagoUnicoDesdeLista(_this.cliente, _this.listaDeSkuDeVenta, _this.tipoDePago, numeroDeDocumento, _this.imagen1, _this.imagen2, function (pago) {
                    _this.pago = pago;
                    _this.pago.pagoDetalle[0].documentNumber = uiTextoNumeroDeDocumentoDeCheque.val();
                    _this.publicarListaDeSkuOrdenDeVenta();
                    _this.publicarTarea();
                    _this.publicarPago();
                    $.mobile.changePage("#SalesOrderSummaryPage", {
                        transition: "flow",
                        reverse: true,
                        showLoadMsg: false
                    });
                    uiTextoNumeroDeDocumentoDeCheque.val("");
                    uiTextoNumeroDeDocumentoDeCheque = null;
                }, function (resultado) {
                    notify(resultado.mensaje);
                    uiTextoNumeroDeDocumentoDeCheque.val("");
                    uiTextoNumeroDeDocumentoDeCheque = null;
                });
            }
            else {
                if (_this.tipoDePago === TipoDePago.Cheque) {
                    _this.pago.pagoDetalle[0].paymentType = TipoDePago.Cheque.toString();
                    _this.pago.pagoDetalle[0].documentNumber = uiTextoNumeroDeDocumentoDeCheque.val();
                    _this.pago.pagoDetalle[0].image1 = _this.imagen1;
                    _this.pago.pagoDetalle[0].image2 = _this.imagen2;
                }
                else {
                    _this.pago.pagoDetalle[0].paymentType = TipoDePago.Efectivo.toString();
                    _this.pago.pagoDetalle[0].documentNumber = null;
                    _this.pago.pagoDetalle[0].image1 = null;
                    _this.pago.pagoDetalle[0].image2 = null;
                }
                _this.publicarListaDeSkuOrdenDeVenta();
                _this.publicarTarea();
                _this.publicarPago();
                $.mobile.changePage("#SalesOrderSummaryPage", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
                uiTextoNumeroDeDocumentoDeCheque.val("");
                uiTextoNumeroDeDocumentoDeCheque = null;
            }
        }
    };
    PagoControlador.prototype.publicarTarea = function () {
        var msg = new TareaMensaje(this);
        msg.tarea = this.tarea;
        this.mensajero.publish(msg, getType(TareaMensaje));
    };
    PagoControlador.prototype.publicarListaDeSkuOrdenDeVenta = function () {
        var msg = new ListaSkuMensaje(this);
        msg.listaSku = this.listaDeSkuDeVenta;
        msg.listaDeSkuParaBonificacion = this.listaDeSkuDeVenta;
        this.mensajero.publish(msg, getType(ListaSkuMensaje));
    };
    PagoControlador.prototype.publicarPago = function () {
        var msg = new PagoMensaje(this);
        msg.pago = this.pago;
        this.mensajero.publish(msg, getType(PagoMensaje));
    };
    PagoControlador.prototype.mostrarOpcionDeTipoDePago = function (tipoDePago, numeroDeDocumento) {
        var uiEtiquetaFormaDePagoSeleccionada = $("#UiEtiquetaFormaDePagoSeleccionada");
        var uiListaDePagoConCheque = $("#UiListaDePagoConCheque");
        var uiTextoNumeroDeDocumentoDeCheque = $("#UiTextoNumeroDeDocumentoDeCheque");
        switch (tipoDePago) {
            case TipoDePago.Efectivo.toString():
                this.tipoDePago = TipoDePago.Efectivo;
                uiEtiquetaFormaDePagoSeleccionada.text("Efectivo");
                uiListaDePagoConCheque.hide();
                break;
            case TipoDePago.Cheque.toString():
                this.tipoDePago = TipoDePago.Cheque;
                uiEtiquetaFormaDePagoSeleccionada.text("Cheque");
                uiTextoNumeroDeDocumentoDeCheque.text(numeroDeDocumento);
                uiListaDePagoConCheque.show();
                break;
        }
        uiEtiquetaFormaDePagoSeleccionada = null;
        uiListaDePagoConCheque = null;
        uiTextoNumeroDeDocumentoDeCheque = null;
    };
    PagoControlador.prototype.usuarioDeseaTomarImagen = function (tipoDeFoto, controlador) {
        navigator.camera.getPicture(function (imageUri) {
            $("#uiFotoTomada").attr("src", "data:image/jpeg;base64," + imageUri);
            $("#uiDivFotoTomada").css("visibility", "visible");
            switch (tipoDeFoto) {
                case TipoDeFoto.Frontal:
                    controlador.imagen1 = imageUri;
                    break;
                case TipoDeFoto.Trasera:
                    controlador.imagen2 = imageUri;
                    break;
            }
        }, function (message) {
            notify("Error al tomar la foto," + message);
        }, {
            quality: 90,
            targetWidth: 350,
            targetHeight: 350,
            saveToPhotoAlbum: false,
            sourceType: Camera.PictureSourceType.CAMERA,
            correctOrientation: true,
            destinationType: Camera.DestinationType.DATA_URL
        });
    };
    PagoControlador.prototype.cargarPantalla = function (_this) {
        if (_this.pago === null || _this.pago === undefined) {
            _this.imagen1 = null;
            _this.imagen2 = null;
            _this.tipoDePago = TipoDePago.Efectivo;
        }
        else {
            _this.imagen1 = _this.pago.pagoDetalle[0].image1;
            _this.imagen2 = _this.pago.pagoDetalle[0].image2;
            _this.tipoDePago = _this.pago.pagoDetalle[0].paymentType;
        }
        if (_this.pago === null || _this.pago === undefined) {
            _this.mostrarOpcionDeTipoDePago(TipoDePago.Efectivo.toString(), "");
        }
        else {
            _this.mostrarOpcionDeTipoDePago(_this.pago.pagoDetalle[0].paymentType, _this.pago.pagoDetalle[0].documentNumber);
        }
    };
    return PagoControlador;
}());
//# sourceMappingURL=PagoControlador.js.map