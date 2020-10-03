class CobroDeFacturaVencidaControlador {
  tokenCliente: SubscriptionToken;
  tokenDetalleDeTiposDePagoRealizados: SubscriptionToken;
  tokenActualizacionDeInformacionDePagoDeFacturasVencidas: SubscriptionToken;

  cuentaCorrienteServicio: CuentaCorrienteServicio = new CuentaCorrienteServicio();
  pagoServicio: PagoDeFacturaVencidaServicio = new PagoDeFacturaVencidaServicio();
  cliente: Cliente = new Cliente();
  sumatoriaTotalPendienteDePagoDeFacturasVencidas: number = 0;
  facturasCubiertasPorElPagoActual: Array<FacturaVencidaDeCliente> = [];
  aplicaPorcentajeMinimoDePagoDeFacturasVencidas: boolean = false;
  valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas: number = 0;
  porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual: number = 0;
  detalleDeTiposDePagoRealizadosEnElDocumentoAcutal: TipoDePagoEnFacturaVencida[] = [];
  vistaCargandosePorPrimeraVez: boolean = true;
  cargarVistaParaPagoDeFacturas: TipoDePagoDeFactura;
  tipoDePagoParaFacturasProcesadas: TipoDePagoDeFactura;
  manejoDeDecimalesServicio: ManejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
  configuracionDeDecimales: ManejoDeDecimales = new ManejoDeDecimales();
  montoCubiertoPorUltimoPagoProcesado: number = 0;
  funcionDeRetornoAPocesoPrincipal: Function = null;
  permitirSoloVisualizacionDeFacturasVencidasOAbiertas: boolean = false;

  constructor(public mensajero: Messenger) {
    this.tokenCliente = mensajero.subscribe<ClienteMensaje>(
      this.clienteEntregado,
      getType(ClienteMensaje),
      this
    );
    this.tokenDetalleDeTiposDePagoRealizados = mensajero.subscribe<
      DetalleDeTipoDePagoMensaje
    >(
      this.detalleDeTiposDePagosEntregados,
      getType(DetalleDeTipoDePagoMensaje),
      this
    );
    this.tokenActualizacionDeInformacionDePagoDeFacturasVencidas = mensajero.subscribe<
      ActualizacionDeInformacionDePagoDeFacturasVencidasMensaje
    >(
      this.actualizacionDeInformacionDePagoDeFacturasVencidasEntregado,
      getType(ActualizacionDeInformacionDePagoDeFacturasVencidasMensaje),
      this
    );
  }

  actualizacionDeInformacionDePagoDeFacturasVencidasEntregado(
    message: ActualizacionDeInformacionDePagoDeFacturasVencidasMensaje,
    subscriber: any
  ): void {
    subscriber.montoCubiertoPorUltimoPagoProcesado =
      message.montoCubiertoPorUltimoPagoProcesado;
  }

  clienteEntregado(
    message: ClienteMensaje,
    subscriber: CobroDeFacturaVencidaControlador
  ): void {
    subscriber.cliente = message.cliente;
    subscriber.vistaCargandosePorPrimeraVez =
      message.vistaCargandosePorPrimeraVez;

    subscriber.cargarVistaParaPagoDeFacturas = message.tipoDePagoAProcesar;
    subscriber.tipoDePagoParaFacturasProcesadas = message.tipoDePagoAProcesar;
    subscriber.funcionDeRetornoAPocesoPrincipal =
      message.funcionDeRetornoAPocesoPrincipal;
    subscriber.permitirSoloVisualizacionDeFacturasVencidasOAbiertas =
      message.permitirSoloVisualizacionDeFacturasVencidasOAbiertas;

    let pageTitle: JQuery = $("#UiLblOverdueInvoicePaymentPageTitle");
    pageTitle.text(
      `${
        message.permitirSoloVisualizacionDeFacturasVencidasOAbiertas
          ? "Listado"
          : "Pago"
      } de Facturas ${
        message.tipoDePagoAProcesar === TipoDePagoDeFactura.FacturaVencida
          ? "Vencidas"
          : "Abiertas"
      }`
    );
    pageTitle = null;
  }

  delegarCobroDeFacturaVencidaControlador(): void {
    $("#UiOverdueInvoicePaymentPage").on("pageshow", () => {
      this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
        (manejoDeDecimales: ManejoDeDecimales) => {
          this.configuracionDeDecimales = manejoDeDecimales;
          try {
            this.sumatoriaTotalPendienteDePagoDeFacturasVencidas = 0;
            this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas = 0;
            this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual = 0;
            this.cliente.paymentType = this.tipoDePagoParaFacturasProcesadas;

            tipoDePagoProcesadoEnCobroDeFacturasVencidas = this
              .tipoDePagoParaFacturasProcesadas;

            this.cuentaCorrienteServicio.obtenerFacturasVencidasDeCliente(
              this.cliente,
              (facturasVencidas: Array<FacturaVencidaDeCliente>) => {
                this.cliente.overdueInvoices = facturasVencidas;
                this.cuentaCorrienteServicio.obtenerSumatoriaDePagosRealizadosPorClienteDuranteElDia(
                  this.cliente,
                  (clienteConInformacionCompleta: Cliente) => {
                    this.cliente = clienteConInformacionCompleta;

                    if (
                      this.cliente.paymentType ===
                      TipoDePagoDeFactura.FacturaAbierta
                    ) {
                      this.cliente.totalAmountPayedOfOverdueInvoices = this.montoCubiertoPorUltimoPagoProcesado;
                    }

                    this.crearListadoDeFacturasVencidasDeCliente(() => {
                      this.actualizarPorcentajeCubiertoPorPagoActual();
                      InteraccionConUsuarioServicio.desbloquearPantalla();

                      if (this.vistaCargandosePorPrimeraVez) {
                        this.verificarSiYaSeAlcanzoElPorcentajeMinimoDePagoDeFacturasVencidas();
                      }
                    });
                  },
                  (resultado: Operacion) => {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                    notify(
                      `Lo sentimos, ha habido un error al obtener la sumatoria de pagos realizados por el cliente ${this.cliente.clientId}`
                    );
                  }
                );
              },
              (resultado: Operacion) => {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify(
                  `Lo sentimos, ha habido un error al obtener las facturas vencidas de cliente ${this.cliente.clientId}`
                );
              }
            );
          } catch (e) {
            notify(
              `Error al cargar los datos iniciales del proceso, por favor, vuelva a intentar.`
            );
          }
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    });

    $("#UiLblPercentageOfOverdueInvoicesPayment").on(
      "click",
      (e: JQueryEventObject) => {
        e.preventDefault();
        if (this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas) {
          return false;
        }

        this.obtenerAutorizacionDeUsuarioParaProcesarPago(() => {
          this.procesarCobroDeFacturas();
        });
      }
    );

    $("#UiBtnShowPaymentTypeDetailPage").on("click", (e: JQueryEventObject) => {
      e.preventDefault();
      this.enviarInformacionDeDetalleDePagos(() => {
        this.irAPantalla("UiOverdueInvoicePaymentDetailPage");
      });
    });

    $("#UiBtnGoBackFromOverdueInvoicePaymentPage").on(
      "click",
      (e: JQueryEventObject) => {
        e.preventDefault();
        this.irAPantallaDeCliente();
      }
    );
  }

  irAPantalla(pantalla: string): void {
    $.mobile.changePage(`#${pantalla}`, {
      transition: "pop",
      reverse: false,
      showLoadMsg: false
    });
  }

  crearListadoDeFacturasVencidasDeCliente(callback: () => void): void {
    let contenedorDeFacturasVencidasDeCliente: JQuery = $(
      "#UlDetailOverdueInvoices"
    );
    let etiquetaDeSumaTotalDeFacturasVencidas: JQuery = $(
      "#UiLblOverdueInvoicesAmount"
    );
    let campoComentarioDePago: JQuery = $("#UiTxtPaidComment");
    let campoDeMontoDePago: JQuery = $("#UiLblPayedAmount");
    let etiquetaDePorcentajeDePagoMinimo: JQuery = $(
      "#UiLblMinimumPaidPercentaje"
    );

    let contenedorDeBotonMostrarPantallaDeDetalleDePago: JQuery = $(
      "#UiContainerOfUiBtnShowPaymentTypeDetailPage"
    );

    let contenedorDeMontoDePago: JQuery = $("#UiContainerOfPaymentAmount");
    let contenedorComentarioDePago: JQuery = $("#UiContainerOfPaymentComment");
    let contenedorPorcentajeMinimoDePago: JQuery = $(
      "#UiContainerOfMinimumPercentagePayment"
    );

    if (this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas) {
      contenedorDeBotonMostrarPantallaDeDetalleDePago.css("display", "none");
      contenedorDeMontoDePago.css("display", "none");
      contenedorComentarioDePago.css("display", "none");
      contenedorPorcentajeMinimoDePago.css("display", "none");
    } else {
      contenedorDeBotonMostrarPantallaDeDetalleDePago.css("display", "block");
      contenedorDeMontoDePago.css("display", "block");
      contenedorComentarioDePago.css("display", "block");
      contenedorPorcentajeMinimoDePago.css("display", "block");
    }
    $("#OverdueInvoicePaymentMenu").trigger("refresh");

    contenedorDeBotonMostrarPantallaDeDetalleDePago = null;
    contenedorDeMontoDePago = null;
    contenedorComentarioDePago = null;
    contenedorPorcentajeMinimoDePago = null;

    campoDeMontoDePago.text(
      `${this.configuracionDeDecimales.currencySymbol} ${format_number(
        this.obtenerMontoIngresadoEnCampoDePago(),
        this.configuracionDeDecimales.defaultDisplayDecimals
      )}`
    );

    campoComentarioDePago.val("");

    this.actualizarPorcentajeCubiertoPorPagoActual();
    contenedorDeFacturasVencidasDeCliente.children().remove("li");
    let htmlDeFacturasVencidas: Array<string> = [];

    this.cliente.overdueInvoices.forEach(
      (facturaVencida: FacturaVencidaDeCliente) => {
        this.sumatoriaTotalPendienteDePagoDeFacturasVencidas +=
          facturaVencida.pendingToPaid;
        htmlDeFacturasVencidas.push(
          this.obtenerFormatoHtmlDeObjetoFactura(facturaVencida)
        );
      }
    );

    etiquetaDeSumaTotalDeFacturasVencidas.text(
      `${this.configuracionDeDecimales.currencySymbol} ${format_number(
        this.sumatoriaTotalPendienteDePagoDeFacturasVencidas,
        this.configuracionDeDecimales.defaultDisplayDecimals
      )}`
    );

    if (htmlDeFacturasVencidas.length > 0) {
      contenedorDeFacturasVencidasDeCliente.append(
        htmlDeFacturasVencidas.join("")
      );
      contenedorDeFacturasVencidasDeCliente.listview("refresh");
    }

    contenedorDeFacturasVencidasDeCliente = null;
    etiquetaDeSumaTotalDeFacturasVencidas = null;
    campoDeMontoDePago = null;
    campoComentarioDePago = null;

    this.verificarSiAplicaPorcentajeMinimoDePago(
      (aplicaPorcentajeMinimoDePago, valorDePorcentajeMinimoDePago) => {
        this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas = aplicaPorcentajeMinimoDePago;
        this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas =
          valorDePorcentajeMinimoDePago > 100
            ? 100
            : valorDePorcentajeMinimoDePago;
        etiquetaDePorcentajeDePagoMinimo.text(
          this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas.toString()
        );
        callback();
      }
    );
  }

  verificarSiAplicaPorcentajeMinimoDePago(
    callback: (
      aplicaPorcentajeMinimoDePago: boolean,
      valorDeParametroDePorcentajeDePagoMinimoDeFacturasVencidas: number
    ) => void
  ): void {
    try {
      this.pagoServicio.obtenerParametroDePorcentajeDePagoMinimoDeFacturasVencidas(
        (aplicaParametro: boolean, valorDeParametro: number) => {
          var porcentajeMinimoAAplicar: any =
            this.cliente.paymentType === TipoDePagoDeFactura.FacturaVencida
              ? valorDeParametro
              : this.obtenerPorcentajeMinimoDePagoEnBaseAFacturasAbiertas(
                  this.cliente
                );
          callback(aplicaParametro, porcentajeMinimoAAplicar);
        },
        (resultado: Operacion) => {
          notify(
            // tslint:disable-next-line: max-line-length
            `Lo sentimos, ha ocurrido un error al validar si se aplica el porcentaje mínimo de pago de facturas vencidas, por favor vuelva a intentar.`
          );
          callback(false, 0);
        }
      );
    } catch (e) {
      notify(
        // tslint:disable-next-line: max-line-length
        `Lo sentimos, ha ocurrido un error al validar si se aplica el porcentaje mínimo de pago de facturas vencidas, por favor vuelva a intentar.`
      );
      callback(false, 0);
    }
  }

  obtenerPorcentajeMinimoDePagoEnBaseAFacturasAbiertas(
    cliente: Cliente
  ): number {
    let porcentaje: number = 0;

    if (cliente.totalAmountOfOpenInvoices <= 0) {
      return porcentaje;
    }

    porcentaje =
      (cliente.totalAmountOfOpenInvoices +
        (cliente.cashAmount + cliente.creditAmount) -
        cliente.currentAccountingInformation.creditLimit) /
      (cliente.totalAmountOfOpenInvoices -
        cliente.currentAccountingInformation.currentAmountOnCredit);

    return Math.ceil(porcentaje * 100);
  }

  obtenerFormatoHtmlDeObjetoFactura(
    facturaVencida: FacturaVencidaDeCliente
  ): string {
    let html: Array<string> = [];

    html.push(`<li class="ui-field-contain" data-count-theme="b">`);
    html.push(`<table>`);
    html.push(`<tr>`);
    html.push(`<td>`);
    html.push(`<p><b>Factura: </b>${facturaVencida.invoiceId}</p>`);
    html.push(
      `<p><b>Creada: </b>${
        facturaVencida.createdDate.toString().split(" ")[0]
      } </p>`
    );
    html.push(
      `<p><b>Vencimiento: </b>${
        facturaVencida.dueDate.toString().split(" ")[0]
      } </p>`
    );
    html.push(
      `<p><b>Facturado: </b>${
        this.configuracionDeDecimales.currencySymbol
      } ${format_number(
        facturaVencida.totalAmount,
        this.configuracionDeDecimales.defaultDisplayDecimals
      )} </p>`
    );
    html.push(`</td>`);
    html.push(`<td>`);
    html.push(
      `<span class="ui-li-count">${
        this.configuracionDeDecimales.currencySymbol
      } ${format_number(
        facturaVencida.pendingToPaid,
        this.configuracionDeDecimales.defaultDisplayDecimals
      )} </span>`
    );
    html.push(`</td>`);
    html.push(`</tr>`);
    html.push(`</table>`);
    html.push(`</li>`);

    return html.join("");
  }

  actualizarPorcentajeCubiertoPorPagoActual(): void {
    let etiquetaDePorcentajeDePagoCubierto: JQuery = $(
      "#UiLblPercentageOfOverdueInvoicesPayment"
    );
    let valorDePorcentaje: number = format_number(
      format_number(
        this.obtenerPorcentajeDePagoCubiertoEnElPagoActual(),
        this.configuracionDeDecimales.defaultCalculationsDecimals
      ),
      this.configuracionDeDecimales.defaultDisplayDecimals
    );
    etiquetaDePorcentajeDePagoCubierto.text(`${valorDePorcentaje}%`);
    this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual = valorDePorcentaje;

    if (this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas) {
      if (
        valorDePorcentaje >=
        this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas
      ) {
        etiquetaDePorcentajeDePagoCubierto.css("color", "#4cff00");
      } else {
        etiquetaDePorcentajeDePagoCubierto.css("color", "#d64161");
      }
    } else {
      etiquetaDePorcentajeDePagoCubierto.css("color", "#4cff00");
    }

    etiquetaDePorcentajeDePagoCubierto = null;
  }

  obtenerPorcentajeDePagoCubiertoEnElPagoActual(): number {
    let montoDePago: any = this.obtenerMontoIngresadoEnCampoDePago();
    if (this.sumatoriaTotalPendienteDePagoDeFacturasVencidas <= 0) {
      return 0;
    }
    let porcentajeDePagoCubierto: number = 0;

    porcentajeDePagoCubierto =
      ((this.cliente.totalAmountPayedOfOverdueInvoices + montoDePago) /
        (this.cliente.totalAmountPayedOfOverdueInvoices +
          this.sumatoriaTotalPendienteDePagoDeFacturasVencidas)) *
      100;

    return porcentajeDePagoCubierto > 100 ? 100 : porcentajeDePagoCubierto;
  }

  obtenerMontoIngresadoEnCampoDePago(): number {
    let montoDePago: number = 0;

    this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal.forEach(
      (pago: TipoDePagoEnFacturaVencida) => {
        montoDePago += pago.amount;
      }
    );

    return montoDePago;
  }

  obtenerAutorizacionDeUsuarioParaProcesarPago(callback: () => void): void {
    navigator.notification.confirm(
      "¿Está seguro de procesar el pago actual?",
      buttonIndex => {
        if (buttonIndex === BotonSeleccionado.Si) {
          InteraccionConUsuarioServicio.bloquearPantalla();
          callback();
        }
      },
      `Sonda® ${SondaVersion}`,
      ["No", "Si"]
    );
  }

  obtenerAutorizacionDeUsuarioParaContinuarPedido(callback: () => void): void {
    InteraccionConUsuarioServicio.desbloquearPantalla();
    navigator.notification.confirm(
      "El monto de pago es cero. ¿Desea continuar el proceso de venta?",
      buttonIndex => {
        if (buttonIndex === BotonSeleccionado.Si) {
          InteraccionConUsuarioServicio.bloquearPantalla();
          callback();
        }
      },
      `Sonda® ${SondaVersion}`,
      ["No", "Si"]
    );
  }

  procesarCobroDeFacturas(): void {
    try {
      let montoDePago: number = this.obtenerMontoIngresadoEnCampoDePago();
      if (montoDePago === 0) {
        if (
          this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas <=
            0 &&
          this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas
        ) {
          this.obtenerAutorizacionDeUsuarioParaContinuarPedido(() => {
            this.funcionDeRetornoAPocesoPrincipal();
          });
        } else {
          InteraccionConUsuarioServicio.desbloquearPantalla();
          notify(`Por favor, ingrese un monto válido.`);
        }
      } else {
        if (
          montoDePago > this.sumatoriaTotalPendienteDePagoDeFacturasVencidas
        ) {
          montoDePago = this.sumatoriaTotalPendienteDePagoDeFacturasVencidas;
        }

        this.obtenerFacturasParaDetalleDePago(montoDePago, () => {
          this.prepararPago(montoDePago, documentoDePago => {
            this.montoCubiertoPorUltimoPagoProcesado =
              documentoDePago.paymentAmount;

            this.pagoServicio.guardarDocumentoDePago(
              documentoDePago,
              () => {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                this.publicarCobroProcesado(documentoDePago, () => {
                  this.irAPantalla("UiPaymentConfirmationPage");
                });
              },
              (resultado: Operacion) => {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify(
                  `Lo sentimos, ha ocurrido un error al guardar el documento de pago, por favor, vuelva a intentar.`
                );
              }
            );
          });
        });
      }
    } catch (e) {
      InteraccionConUsuarioServicio.desbloquearPantalla();
      notify(
        `Lo sentimos ha ocurrido un error al procesar las facturas para el pago actual, por favor, vuelva a intentar.`
      );
    }
  }

  obtenerFacturasParaDetalleDePago(
    montoDePago: number,
    callbak: () => void
  ): void {
    let montoDePagoDisponible: number = montoDePago;
    this.facturasCubiertasPorElPagoActual.length = 0;

    let facturasOrdenadas: FacturaVencidaDeCliente[] = this.cliente.overdueInvoices.sort(
      (a: FacturaVencidaDeCliente, b: FacturaVencidaDeCliente) => {
        return a.dueDate.toString().localeCompare(b.dueDate.toString());
      }
    );

    facturasOrdenadas.forEach((facturaVencida: FacturaVencidaDeCliente) => {
      facturaVencida.amountToDate = facturaVencida.pendingToPaid;
      if (facturaVencida.pendingToPaid <= montoDePagoDisponible) {
        facturaVencida.payedAmount = facturaVencida.pendingToPaid;
        facturaVencida.pendingToPaid = 0;
        this.facturasCubiertasPorElPagoActual.push(facturaVencida);
        montoDePagoDisponible -= facturaVencida.payedAmount;
      } else if (montoDePagoDisponible > 0) {
        facturaVencida.payedAmount = montoDePagoDisponible;
        facturaVencida.pendingToPaid =
          facturaVencida.pendingToPaid - facturaVencida.payedAmount;
        this.facturasCubiertasPorElPagoActual.push(facturaVencida);
        montoDePagoDisponible -= facturaVencida.payedAmount;
      }
    });

    callbak();
  }

  prepararPago(
    montoDePago: number,
    callback: (documentoDePagoCompleto: PagoDeFacturaVencidaEncabezado) => void
  ): void {
    let documentoDePago: PagoDeFacturaVencidaEncabezado = new PagoDeFacturaVencidaEncabezado();
    documentoDePago.paymentAmount = montoDePago;

    ValidarSequenciaDeDocumentos(
      TIpoDeDocumento.PagoDeFacturaVencida,
      (secuenciaValida: boolean) => {
        if (secuenciaValida) {
          this.pagoServicio.obtenerSecuenciaDeDocumentoDePago(
            secuenciaDeDocumentos => {
              documentoDePago.docNum = secuenciaDeDocumentos.numero;
              documentoDePago.docSerie = secuenciaDeDocumentos.serie;
              documentoDePago.branchName = secuenciaDeDocumentos.nombreSucursal;
              documentoDePago.branchAddress =
                secuenciaDeDocumentos.direccionSucursal;
              documentoDePago.codeCustomer = this.cliente.clientId;
              documentoDePago.codeRoute = gCurrentRoute;
              documentoDePago.isPosted = SiNo.No;
              documentoDePago.loginId = gLastLogin;
              documentoDePago.createdDate = getDateTime() as any;
              documentoDePago.validateMinimumPercentOfPaid = this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas;
              documentoDePago.minimumPercentOfPaid = this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas;
              documentoDePago.percentCoveredWhitThePaid = this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual;
              documentoDePago.paidComment = this.obtenerComentarioDePago();
              documentoDePago.paymentType = this.tipoDePagoParaFacturasProcesadas;

              this.facturasCubiertasPorElPagoActual.forEach(
                (facturaVencida: FacturaVencidaDeCliente) => {
                  let pagoDefacturaDetalle: PagoDeFacturaVencidaDetalle = new PagoDeFacturaVencidaDetalle();

                  pagoDefacturaDetalle.docNum = documentoDePago.docNum;
                  pagoDefacturaDetalle.docSerie = documentoDePago.docSerie;
                  pagoDefacturaDetalle.invoiceId = facturaVencida.invoiceId;
                  pagoDefacturaDetalle.docEntry = facturaVencida.docEntry;
                  pagoDefacturaDetalle.payedAmount = facturaVencida.payedAmount;
                  pagoDefacturaDetalle.amountToDate =
                    facturaVencida.amountToDate;
                  pagoDefacturaDetalle.pendingAmount =
                    facturaVencida.pendingToPaid;
                  documentoDePago.overdueInvoicePaymentDetail.push(
                    pagoDefacturaDetalle
                  );
                }
              );

              this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal.forEach(
                (tipoDePago: TipoDePagoEnFacturaVencida) => {
                  tipoDePago.docSerie = documentoDePago.docSerie;
                  tipoDePago.docNum = documentoDePago.docNum;

                  documentoDePago.overdueInvoicePaymentTypeDetail.push(
                    tipoDePago
                  );
                }
              );

              callback(documentoDePago);
            },
            resultado => {
              InteraccionConUsuarioServicio.desbloquearPantalla();
              console.log(resultado.mensaje);
              if (resultado.codigo === -1) {
                notify(resultado.mensaje);
              } else {
                notify(
                  `Ha ocurrido un error al obtener la secuencia de documentos de pago, por favor, vuelva a intentar.`
                );
              }
            }
          );
        } else {
          InteraccionConUsuarioServicio.desbloquearPantalla();
          notify(
            `No cuenta con una secuencia de documentos válida para procesar el cobro, por favor, comuníquese con su administrador.`
          );
        }
      },
      (error: any) => {
        console.log(
          `Error al validar la secuencia de documentos de pago de facturas vencidas: ${error}`
        );
        InteraccionConUsuarioServicio.desbloquearPantalla();
        notify(`Ha ocurrido un error al validar la secuencia de documentos.`);
      }
    );
  }

  publicarCobroProcesado(
    pagoProcesado: PagoDeFacturaVencidaEncabezado,
    callback: () => void
  ): void {
    let pagoMensaje: PagoDeFacturaVencidaMensaje = new PagoDeFacturaVencidaMensaje(
      this
    );
    pagoMensaje.pago = pagoProcesado;
    pagoMensaje.cliente = this.cliente;
    pagoMensaje.funcionDeRetornoAPocesoPrincipal = this.funcionDeRetornoAPocesoPrincipal;
    this.mensajero.publish(pagoMensaje, getType(PagoDeFacturaVencidaMensaje));

    callback();
  }

  obtenerComentarioDePago(): string {
    let campoComentario: JQuery = $("#UiTxtPaidComment");
    return campoComentario.val() ? campoComentario.val() : "";
  }

  verificarSiYaSeAlcanzoElPorcentajeMinimoDePagoDeFacturasVencidas(): void {
    if (
      this.aplicaPorcentajeMinimoDePagoDeFacturasVencidas &&
      this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas > 0
    ) {
      if (
        this.porcentajeDePagoDeFacturasVencidasCubiertoPorElPagoActual >=
        this.valorDeParametroDePorcentajeMinimoDePagoDeFacturasVencidas
      ) {
        if (this.cliente.paymentType === TipoDePagoDeFactura.FacturaVencida) {
          notify(
            `Porcentaje de pago mínimo alcanzado, puede seguir con el proceso de venta.`
          );
        } else {
          notify(`Porcentaje de pago mínimo alcanzado, puede continuar.`);
        }
        this.funcionDeRetornoAPocesoPrincipal();
      }
    }
  }

  detalleDeTiposDePagosEntregados(
    message: DetalleDeTipoDePagoMensaje,
    subscriber: any
  ): void {
    subscriber.vistaCargandosePorPrimeraVez = false;
    subscriber.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal =
      message.detalleDePagosRealizados;
  }

  enviarInformacionDeDetalleDePagos(callback: () => void): void {
    let mensaje: DetalleDeTipoDePagoMensaje = new DetalleDeTipoDePagoMensaje(
      this
    );
    mensaje.detalleDePagosRealizados = this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal;
    this.mensajero.publish(mensaje, getType(DetalleDeTipoDePagoMensaje));

    callback();
  }

  irAPantallaDeCliente(): void {
    this.detalleDeTiposDePagoRealizadosEnElDocumentoAcutal.length = 0;
    this.vistaCargandosePorPrimeraVez = true;

    this.montoCubiertoPorUltimoPagoProcesado = 0;
    this.funcionDeRetornoAPocesoPrincipal = null;
    this.permitirSoloVisualizacionDeFacturasVencidasOAbiertas = false;

    this.enviarInformacionDeDetalleDePagos(() => {
      window.history.back();
    });
  }
}
