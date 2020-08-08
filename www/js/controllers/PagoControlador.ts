class PagoControlador {
  tokenCliente: SubscriptionToken;
  tokenTarea: SubscriptionToken;
  tokenListaOrdenDeVenta: SubscriptionToken;
  tokenPago: SubscriptionToken;

  ordenDeVentaServicio = new OrdenDeVentaServicio();
  taareaServicio = new TareaServcio();
  clienteServicio = new ClienteServicio();
  manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
  pagoServicio = new PagoServicio();

  cliente: Cliente;
  tarea: Tarea;
  pago: PagoEncabezado;
  listaDeSkuDeVenta: Sku[] = [];
  configuracionDecimales: ManejoDeDecimales;

  tipoDePago: TipoDePago;
  imagen1: string;
  imagen2: string;

  constructor(public mensajero: Messenger) {
    this.tokenCliente = mensajero.subscribe<ClienteMensaje>(
      this.clienteEntregado,
      getType(ClienteMensaje),
      this
    );
    this.tokenTarea = mensajero.subscribe<TareaMensaje>(
      this.tareaEntregado,
      getType(TareaMensaje),
      this
    );
    this.tokenListaOrdenDeVenta = mensajero.subscribe<ListaSkuMensaje>(
      this.listaDeSkuDeVentaEntregado,
      getType(ListaSkuMensaje),
      this
    );
    this.tokenPago = mensajero.subscribe<PagoMensaje>(
      this.pagoEntregado,
      getType(PagoMensaje),
      this
    );
  }

  clienteEntregado(mensaje: ClienteMensaje, subcriber: any) {
    subcriber.cliente = mensaje.cliente;
  }

  tareaEntregado(mensaje: TareaMensaje, subcriber: any) {
    subcriber.tarea = mensaje.tarea;
    subcriber.esReimpresion = false;
  }

  listaDeSkuDeVentaEntregado(mensaje: ListaSkuMensaje, subcriber: any) {
    subcriber.listaDeSkuDeVenta = mensaje.listaSku;
    subcriber.listaSkuOrdenDeVentaPrincipal = [];
    subcriber.listaDeOrdnesDeVEntaCf = [];
    subcriber.listaDeSkuParaBonificacion = mensaje.listaDeSkuParaBonificacion;
  }

  pagoEntregado(mensaje: PagoMensaje, subcriber: any) {
    subcriber.pago = mensaje.pago;
    if (subcriber.pago === null || subcriber.pago === undefined) {
      subcriber.imagen1 = null;
      subcriber.imagen2 = null;
      subcriber.tipoDePago = TipoDePago.Efectivo;
    } else {
      subcriber.imagen1 = subcriber.pago.pagoDetalle[0].image1;
      subcriber.imagen2 = subcriber.pago.pagoDetalle[0].image2;
      subcriber.tipoDePago = subcriber.pago.pagoDetalle[0].paymentType;
    }
  }

  delegadoPagoControlador() {
    let este: PagoControlador = this;

    $(document).on("pagebeforechange", (event, data) => {
      if (data.toPage === "UiPagePayment") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.configuracionDecimales = data.options.data.configuracionDecimales;
        este.pago = data.options.data.pago;
        este.cargarPantalla(este);
        $.mobile.changePage("#UiPagePayment");
      }
    });

    $("#UiBotonListadoDeFormaDePago").bind("touchstart", () => {
      este.usuarioSeleccionoFormaDePago();
    });

    document.addEventListener(
      "backbutton",
      () => {
        este.usuarioDeseaVerPantallaAnterior();
      },
      true
    );

    $("#UiBotonAtrasFormaDePago").on("click", () => {
      este.usuarioDeseaVerPantallaAnterior();
    });

    $("#UiBotonAceptarFormaDePago").on("click", () => {
      este.usuarioSelecionoAceptarFormaDePago(este);
    });

    $("#UiBotonImagenFrontal").on("click", () => {
      este.usuarioDeseaTomarImagen(TipoDeFoto.Frontal, este);
    });

    $("#UiBotonImagenTrasera").on("click", () => {
      este.usuarioDeseaTomarImagen(TipoDeFoto.Trasera, este);
    });
  }

  usuarioDeseaVerPantallaAnterior() {
    let uiTextoNumeroDeDocumentoDeCheque = $(
      "#UiTextoNumeroDeDocumentoDeCheque"
    );
    let uiEtiquetaFormaDePagoSeleccionada = $(
      "#UiEtiquetaFormaDePagoSeleccionada"
    );

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
  }

  obtenerConfiguracionDeDecimales() {
    this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
      (decimales: ManejoDeDecimales) => {
        this.configuracionDecimales = decimales;
      },
      (operacion: Operacion) => {
        notify(operacion.mensaje);
      }
    );
  }

  usuarioSeleccionoFormaDePago() {
    let listaDeUnidadesDeMedida = [];

    listaDeUnidadesDeMedida.push({
      text: "Efectivo",
      value: TipoDePago.Efectivo.toString()
    });

    listaDeUnidadesDeMedida.push({
      text: "Cheque",
      value: TipoDePago.Cheque.toString()
    });

    let configoptions = {
      title: "Forma de Pago",
      items: listaDeUnidadesDeMedida,
      doneButtonLabel: "Ok",
      cancelButtonLabel: "Cancelar"
    };

    ShowListPicker(configoptions, item => {
      this.mostrarOpcionDeTipoDePago(item.toString(), "");
    });
  }

  usuarioSelecionoAceptarFormaDePago(_this: PagoControlador) {
    let uiTextoNumeroDeDocumentoDeCheque = $(
      "#UiTextoNumeroDeDocumentoDeCheque"
    );
    if (
      _this.tipoDePago === TipoDePago.Cheque &&
      (uiTextoNumeroDeDocumentoDeCheque.val().trim() === "" ||
        _this.imagen1 === null)
    ) {
      notify("Debe ingresar el numero de documento y tomar la imagen frontal");
    } else {
      if (_this.pago === null || _this.pago === undefined) {
        let numeroDeDocumento = uiTextoNumeroDeDocumentoDeCheque.val();

        _this.pagoServicio.formarPagoUnicoDesdeLista(
          _this.cliente,
          _this.listaDeSkuDeVenta,
          _this.tipoDePago,
          numeroDeDocumento,
          _this.imagen1,
          _this.imagen2,
          (pago: PagoEncabezado) => {
            _this.pago = pago;
            _this.pago.pagoDetalle[0].documentNumber = uiTextoNumeroDeDocumentoDeCheque.val();

            //_this.publicarCliente();
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
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);

            uiTextoNumeroDeDocumentoDeCheque.val("");
            uiTextoNumeroDeDocumentoDeCheque = null;
          }
        );
      } else {
        if (_this.tipoDePago === TipoDePago.Cheque) {
          _this.pago.pagoDetalle[0].paymentType = TipoDePago.Cheque.toString();
          _this.pago.pagoDetalle[0].documentNumber = uiTextoNumeroDeDocumentoDeCheque.val();
          _this.pago.pagoDetalle[0].image1 = _this.imagen1;
          _this.pago.pagoDetalle[0].image2 = _this.imagen2;
        } else {
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
  }

  publicarTarea() {
    let msg = new TareaMensaje(this);
    msg.tarea = this.tarea;
    this.mensajero.publish(msg, getType(TareaMensaje));
  }

  publicarListaDeSkuOrdenDeVenta() {
    let msg = new ListaSkuMensaje(this);
    msg.listaSku = this.listaDeSkuDeVenta;
    msg.listaDeSkuParaBonificacion = this.listaDeSkuDeVenta;
    this.mensajero.publish(msg, getType(ListaSkuMensaje));
  }

  publicarPago() {
    let msg = new PagoMensaje(this);
    msg.pago = this.pago;
    this.mensajero.publish(msg, getType(PagoMensaje));
  }

  mostrarOpcionDeTipoDePago(tipoDePago: string, numeroDeDocumento: string) {
    let uiEtiquetaFormaDePagoSeleccionada = $(
      "#UiEtiquetaFormaDePagoSeleccionada"
    );
    let uiListaDePagoConCheque = $("#UiListaDePagoConCheque");
    let uiTextoNumeroDeDocumentoDeCheque = $(
      "#UiTextoNumeroDeDocumentoDeCheque"
    );

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
  }

  usuarioDeseaTomarImagen(tipoDeFoto: TipoDeFoto, controlador: any) {
    navigator.camera.getPicture(
      function(imageUri) {
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
      },
      function(message) {
        notify("Error al tomar la foto," + message);
      },
      {
        quality: 90,
        targetWidth: 350,
        targetHeight: 350,
        saveToPhotoAlbum: false,
        sourceType: <any>Camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        destinationType: Camera.DestinationType.DATA_URL
      }
    );
  }

  cargarPantalla(_this: any) {
    if (_this.pago === null || _this.pago === undefined) {
      _this.imagen1 = null;
      _this.imagen2 = null;
      _this.tipoDePago = TipoDePago.Efectivo;
    } else {
      _this.imagen1 = _this.pago.pagoDetalle[0].image1;
      _this.imagen2 = _this.pago.pagoDetalle[0].image2;
      _this.tipoDePago = _this.pago.pagoDetalle[0].paymentType;
    }

    if (_this.pago === null || _this.pago === undefined) {
      _this.mostrarOpcionDeTipoDePago(TipoDePago.Efectivo.toString(), "");
    } else {
      _this.mostrarOpcionDeTipoDePago(
        _this.pago.pagoDetalle[0].paymentType,
        _this.pago.pagoDetalle[0].documentNumber
      );
    }
  }
}
