class ResumenDePedidoControlador {
  tokenCliente: SubscriptionToken;
  tokenTarea: SubscriptionToken;
  tokenListaDeSkusParaResumenDeOrdenDeVenta: SubscriptionToken;
  tokenPago: SubscriptionToken;
  tokenFirma: SubscriptionToken;

  manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
  ordenDeVentaServicio = new OrdenDeVentaServicio();
  promoServicio: PromoServicio = new PromoServicio();
  tareaServicio = new TareaServcio();
  pagoServicio = new PagoServicio();
  bonoServicio = new BonoServicio();
  encuestaServicio: EncuestaServicio = new EncuestaServicio();

  cliente: Cliente;
  tarea: Tarea;
  listaDeSkuDeVenta: Sku[] = [];
  ordenDeVenta: OrdenDeVenta;
  pago: PagoEncabezado;
  configuracionDecimales: ManejoDeDecimales;

  listaSkuOrdenDeVentaPrincipal: Sku[] = [];
  listaDeOrdnesDeVEntaCf: (Sku[])[] = [];
  listaDeSkuParaBonificacionParaOrdenDeVenta: Sku[] = [];
  listaDeSkuParaBonificacion: Sku[] = [];
  listaDeSkuParaBonificacionDeCombo: BonoPorCombo[] = [];
  listaDeBonificacionesPorMontoGeneral = new Array<BonoPorMontoGeneral>();

  usuarioPuedeModificarBonificacionDeCombo: boolean = false;
  esOrdenDeVentaParaCobrar: boolean = false;
  seCreoTareaAceptada: boolean = false;
  obtuboGps: boolean = false;

  isImpresoraZebra = localStorage.getItem("isPrinterZebra") === "1";
  firma: string = null;
  foto: string = null;
  formatoDeOrdenDeVenta: string = "";
  formatoDePago: string = "";
  imprimio: Boolean;
  firmaObligatoria: Boolean;
  fotoObligatoria: Boolean;
  pagoProcesado: Boolean;
  ordenProcesada: Boolean;
  cargaPrimeraVez: Boolean;
  listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[] = [];
  listaDeDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago[] = [];
  listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento> = [];

  constructor(public mensajero: Messenger) {
    this.tokenPago = mensajero.subscribe<PagoMensaje>(
      this.pagoEntregado,
      getType(PagoMensaje),
      this
    );
    this.tokenFirma = mensajero.subscribe<FirmaMensaje>(
      this.firmaEntregado,
      getType(FirmaMensaje),
      this
    );
  }

  delegarResumenDePedidoControlador() {
    let este: ResumenDePedidoControlador = this;

    $(document).on("pagebeforechange", (event, data) => {
      if (data.toPage === "SalesOrderSummaryPage") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.configuracionDecimales = data.options.data.configuracionDecimales;
        este.listaDeSkuDeVenta = data.options.data.listaSku;
        este.listaDeSkuParaBonificacion =
          data.options.data.listaDeSkuParaBonificacion;
        este.listaDeSkuParaBonificacionDeCombo =
          data.options.data.listaDeSkuParaBonificacionDeCombo;
        este.usuarioPuedeModificarBonificacionDeCombo =
          data.options.data.usuarioPuedeModificarBonificacionDeCombo;
        este.listaDeBonificacionesPorMontoGeneral =
          data.options.data.listaDeBonificacionesPorMontoGeneral;
        este.listaDeDescuentoPorMontoGeneralYFamilia =
          data.options.data.listaDeDescuentoPorMontoGeneralYFamilia;
        este.listaDeDescuentoPorFamiliaYTipoPago =
          data.options.data.listaDeDescuentoPorFamiliaYTipoPago;
        este.listaDeOrdenAplicarDescuentos =
          data.options.data.listaDeOrdenAplicarDescuentos;
        $.mobile.changePage("#SalesOrderSummaryPage");
      }
    });
    $("#SalesOrderSummaryPage").on("pageshow", () => {
      este.cargarPantalla();
    });

    $("#uiFirmaResumen").bind("touchstart", () => {
      este.publicarFirma(() => {
        $.mobile.changePage("#UiUserSignaturPage");
      });
    });

    $("#uiFotoResumen").bind("touchstart", () => {
      cordova.plugins.diagnostic.isCameraAuthorized(
        enabled => {
          if (enabled) {
            TomarFoto(
              fotografia => {
                este.establecerFoto(fotografia);
              },
              (op: Operacion) => {
                notify(op.toString());
              }
            );
          } else {
            cordova.plugins.diagnostic.requestCameraAuthorization(
              authorization => {
                if (authorization === "DENIED") {
                  cordova.plugins.diagnostic.switchToSettings(
                    () => {
                      ToastThis(
                        "Debe autorizar el uso de la Cámara para poder leer el Código."
                      );
                    },
                    error => {
                      console.log(error);
                    }
                  );
                } else if (authorization === "GRANTED") {
                  TomarFoto(
                    fotografia => {
                      este.establecerFoto(fotografia);
                    },
                    (op: Operacion) => {
                      notify(op.toString());
                    }
                  );
                } else {
                  cordova.plugins.diagnostic.switchToSettings(
                    () => {
                      ToastThis(
                        "Debe autorizar el uso de la Cámara para poder leer el Código."
                      );
                    },
                    error => {
                      console.log(error);
                    }
                  );
                }
              },
              error => {
                notify(error);
              }
            );
          }
        },
        error => {
          notify(error);
        }
      );
    });

    $("#uiImprimirResumen").bind("touchstart", () => {
      este.usuarioDeseaImprimirOrdenDeVenta();
    });

    $("#uiGuardarResumen").bind("touchstart", () => {
      este.usuarioDeseaFinalizarOrdenDeVenta();
    });

    $("#UiBotonFormaDePago").bind("touchstart", () => {
      este.usuarioDeseaSeleccionarFormaDePago();
    });
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

  pagoEntregado(mensaje: PagoMensaje, subcriber: any) {
    subcriber.pago = mensaje.pago;

    let uiBotonDeFormaDePago = $("#UiBotonFormaDePago");
    if (subcriber.pago === null || subcriber.pago === undefined) {
      uiBotonDeFormaDePago.text("Efectivo");
    } else {
      switch (subcriber.pago.tipoDePago) {
        case TipoDePago.Efectivo.toString():
          uiBotonDeFormaDePago.text("Efectivo");
          break;
        case TipoDePago.Cheque.toString():
          uiBotonDeFormaDePago.text("Cheque");
          break;
      }
    }
    uiBotonDeFormaDePago = null;
  }

  firmaEntregado(mensaje: FirmaMensaje, subcriber: any) {
    subcriber.firma = mensaje.firma;
    subcriber.origen = mensaje.origen;
  }

  establecerFoto(fotografia: string) {
    this.foto = fotografia;
  }

  preguntarSiSeImprimeOrdenDeVenta(
    formatoDeOrdenDeVenta: string,
    callback: () => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    DesBloquearPantalla();
    navigator.notification.confirm(
      "Desea imprimir la orden de venta?",
      respuesta => {
        if (respuesta === 2) {
          this.imprimio = true;
          my_dialog("", "", "close");
          my_dialog("Espere...", "validando impresora", "open");
          const impresionServicio = new ImpresionServicio();
          const printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
          impresionServicio.validarEstadosYImprimir(
            this.isImpresoraZebra,
            printMacAddress,
            formatoDeOrdenDeVenta,
            true,
            (resultado: Operacion) => {
              if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                callback();
              } else {
                callbackError(<Operacion>{
                  codigo: -1,
                  mensaje: resultado.mensaje
                });
              }
            }
          );
        } else {
          callback();
        }
      },
      "Sonda® " + SondaVersion,
      <any>"No,Si"
    );
  }

  cargarInformacionResumen(callback: () => void) {
    let uiLblCodigoClienteResumen = $("#UiLblCodigoClienteResumen");
    uiLblCodigoClienteResumen.text(this.cliente.clientId);
    uiLblCodigoClienteResumen = null;

    let uiLblNombreClienteResumen = $("#UiLblNombreClienteResumen");
    uiLblNombreClienteResumen.text(this.cliente.clientName);
    uiLblNombreClienteResumen = null;

    let uiLblDireccionClienteResumen = $("#UiLblDireccionClienteResumen");
    uiLblDireccionClienteResumen.text(this.cliente.address);
    uiLblDireccionClienteResumen = null;

    let uiLblTelefonoResumen = $("#UiLblTelefonoResumen");
    uiLblTelefonoResumen.text(this.cliente.phone);
    uiLblTelefonoResumen = null;

    let uiLblContactoResumen = $("#UiLblContactoResumen");
    uiLblContactoResumen.text(this.cliente.contactCustomer);
    uiLblContactoResumen = null;

    let uiLblFechaEntregaResumen = $("#UiLblFechaEntregaResumen");
    uiLblFechaEntregaResumen.text(
      this.cliente.deliveryDate === undefined
        ? "..."
        : this.cliente.deliveryDate.toString()
    );
    uiLblFechaEntregaResumen = null;

    let uiLblTotalResumen = $("#UiLblTotalResumen");
    uiLblTotalResumen.text(
      format_number(
        this.obtenerTotalDeOrdenDeVenta(
          this.cliente.appliedDiscount,
          this.listaDeSkuDeVenta
        ),
        this.configuracionDecimales.defaultDisplayDecimals
      )
    );
    uiLblTotalResumen = null;

    let uiTxtComentarioResumen = $("#UiTxtComentarioResumen");
    uiTxtComentarioResumen.val(this.cliente.salesComment);
    uiTxtComentarioResumen = null;

    let uiListaFormaDePago = $("#UiListaFormaDePago");
    uiListaFormaDePago.hide();

    if (this.esOrdenDeVentaParaCobrar) {
      if (this.cargaPrimeraVez) {
        notify("Debe de cobrar la orden de venta");
        this.cargaPrimeraVez = false;
      }
      uiListaFormaDePago.show();
      this.mostrarTipoDePago();
    }
    uiListaFormaDePago = null;

    callback();
  }

  mostrarTipoDePago() {
    let uiBotonDeFormaDePago = $("#UiBotonFormaDePago");
    try {
      if (this.pago === null || this.pago === undefined) {
        uiBotonDeFormaDePago.text("Efectivo");
      } else {
        switch (this.pago.pagoDetalle[0].paymentType) {
          case TipoDePago.Efectivo.toString():
            uiBotonDeFormaDePago.text("Efectivo");
            break;
          case TipoDePago.Cheque.toString():
            uiBotonDeFormaDePago.text("Cheque");
            break;
        }
      }
    } catch (ex) {
      notify("Error al mostrar el tipo de pago: " + ex.message);
    }
    uiBotonDeFormaDePago = null;
  }

  cargarSkus(callback) {
    try {
      var uiListaOrdenDeVenta = $("#UiListaSkuResumen");
      uiListaOrdenDeVenta.children().remove("li");
      let i = 0;
      let sku = new Sku();
      let listaDeLi: string[] = [];
      for (i = 0; i < this.listaDeSkuDeVenta.length; i++) {
        sku = this.listaDeSkuDeVenta[i];

        let resultadoDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
        let resultadoDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();

        if (!sku.isUniqueDiscountScale) {
          //-----Verificamos si el producto tiene un descuento por monto genral y familia-----//
          resultadoDescuentoPorMontoGeneralYFamilia = (this
            .listaDeDescuentoPorMontoGeneralYFamilia as any).find(
            (descuentoABuscar: DescuentoPorMontoGeneralYFamilia) => {
              return descuentoABuscar.codeFamily === sku.codeFamilySku;
            }
          );

          //-----Verificamos si el producto tiene un descuento por familia y tipo pago-----//
          resultadoDescuentoPorFamiliaYTipoPago = (this
            .listaDeDescuentoPorFamiliaYTipoPago as any).find(
            (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
              return descuentoABuscar.codeFamily === sku.codeFamilySku;
            }
          );
        }

        //let total = sku.total;
        let total = sku.totalCD;

        if (sku.dimensions.length > 0) {
          for (let skuConDimension of sku.dimensions) {
            listaDeLi.push("<li data-icon='false' class='ui-field-contain'>");
            listaDeLi.push(`<p><h4>${sku.sku}/${sku.skuName}</h4></p>`);
            listaDeLi.push("<p>");
            listaDeLi.push(`<b>UM: </b><span>${sku.codePackUnit} </span>`);
            listaDeLi.push(
              `<b> Cant: </b><span>${skuConDimension.qtySku} </span>`
            );
            listaDeLi.push(
              `<br/><b>Pre: </b><span>${format_number(
                sku.cost,
                this.configuracionDecimales.defaultDisplayDecimals
              )} </span>`
            );
            if (sku.discount !== 0) {
              listaDeLi.push(
                `<b> Des: </b><span>${format_number(
                  sku.appliedDiscount,
                  this.configuracionDecimales.defaultDisplayDecimals
                )}%</span>`
              );
              listaDeLi.push(
                `<b> Total: </b><span>${format_number(
                  sku.total,
                  this.configuracionDecimales.defaultDisplayDecimals
                )} </span>`
              );
              listaDeLi.push(
                `<span class='ui-li-count' style='position:absolute; top:55%'>${DarFormatoAlMonto(
                  format_number(
                    total,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )
                )}</span><br/>`
              );
            } else {
              listaDeLi.push(
                `<span class='ui-li-count' style='position:absolute; top:55%'>${DarFormatoAlMonto(
                  format_number(
                    skuConDimension.total,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )
                )}</span><br/>`
              );
            }
            listaDeLi.push(
              `<b>Dimensión: </b><span>${format_number(
                skuConDimension.dimensionSku,
                this.configuracionDecimales.defaultDisplayDecimals
              )}</span>`
            );

            listaDeLi.push("</p>");
          }
        } else {
          listaDeLi.push(
            "<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>"
          );
          listaDeLi.push(`<p><h4>${sku.sku}/${sku.skuName}</h4></p>`);
          listaDeLi.push("<p>");
          listaDeLi.push(`<b>UM: </b><span>${sku.codePackUnit} </span>`);
          listaDeLi.push(`<b> Cant: </b><span>${sku.qty} </span>`);
          listaDeLi.push(
            `<br/><b>Pre: </b><span>${format_number(
              sku.cost,
              this.configuracionDecimales.defaultDisplayDecimals
            )} </span>`
          );
          if (sku.discount !== 0) {
            switch (sku.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                listaDeLi.push(
                  `<b> Des: </b><span>${format_number(
                    sku.appliedDiscount,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )}%</span>`
                );
                break;
              case TiposDeDescuento.Monetario.toString():
                listaDeLi.push(
                  `<b> Des: </b><span>${DarFormatoAlMonto(
                    format_number(
                      sku.appliedDiscount,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )
                  )}</span>`
                );
                break;
            }

            //-----validamos y agregamos el descuento por monto general y familia
            if (
              resultadoDescuentoPorMontoGeneralYFamilia &&
              !sku.isUniqueDiscountScale
            ) {
              switch (resultadoDescuentoPorMontoGeneralYFamilia.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                  listaDeLi.push(
                    `<br/><b> DMF: </b><span>${format_number(
                      resultadoDescuentoPorMontoGeneralYFamilia.discount,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}%</span>`
                  );
                  break;
                case TiposDeDescuento.Monetario.toString():
                  listaDeLi.push(
                    `<br/><b> DMF: </b><span>${DarFormatoAlMonto(
                      format_number(
                        resultadoDescuentoPorMontoGeneralYFamilia.discount,
                        this.configuracionDecimales.defaultDisplayDecimals
                      )
                    )}</span>`
                  );
                  break;
              }
            }

            //-----validamos y agregamos el descuento por familia y tipo pago
            if (
              resultadoDescuentoPorFamiliaYTipoPago &&
              !sku.isUniqueDiscountScale
            ) {
              switch (resultadoDescuentoPorFamiliaYTipoPago.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                  listaDeLi.push(
                    `<br/><b> DFT: </b><span>${format_number(
                      resultadoDescuentoPorFamiliaYTipoPago.discount,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}%</span>`
                  );
                  break;
                case TiposDeDescuento.Monetario.toString():
                  listaDeLi.push(
                    `<br/><b> DFT: </b><span>${DarFormatoAlMonto(
                      format_number(
                        resultadoDescuentoPorFamiliaYTipoPago.discount,
                        this.configuracionDecimales.defaultDisplayDecimals
                      )
                    )}</span>`
                  );
                  break;
              }
            }

            listaDeLi.push(
              `<b> Total: </b><span>${format_number(
                sku.total,
                this.configuracionDecimales.defaultDisplayDecimals
              )} </span>`
            );
            listaDeLi.push(
              `<span class='ui-li-count' style='position:absolute; top:55%'>${DarFormatoAlMonto(
                format_number(
                  total,
                  this.configuracionDecimales.defaultDisplayDecimals
                )
              )}</span><br/>`
            );
          } else {
            //-----validamos y agregamos el descuento por monto general y familia
            if (
              resultadoDescuentoPorMontoGeneralYFamilia &&
              !sku.isUniqueDiscountScale
            ) {
              switch (resultadoDescuentoPorMontoGeneralYFamilia.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                  listaDeLi.push(
                    `<br/><b> DMF: </b><span>${format_number(
                      resultadoDescuentoPorMontoGeneralYFamilia.discount,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}%</span>`
                  );
                  break;
                case TiposDeDescuento.Monetario.toString():
                  listaDeLi.push(
                    `<br/><b> DMF: </b><span>${DarFormatoAlMonto(
                      format_number(
                        resultadoDescuentoPorMontoGeneralYFamilia.discount,
                        this.configuracionDecimales.defaultDisplayDecimals
                      )
                    )}</span>`
                  );
                  break;
              }
              if (!resultadoDescuentoPorFamiliaYTipoPago) {
                listaDeLi.push(
                  `<b> Total: </b><span>${format_number(
                    sku.total,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )} </span>`
                );
              }
            }

            //-----validamos y agregamos el descuento por familia y tipo pago
            if (
              resultadoDescuentoPorFamiliaYTipoPago &&
              !sku.isUniqueDiscountScale
            ) {
              switch (resultadoDescuentoPorFamiliaYTipoPago.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                  listaDeLi.push(
                    `<br/><b> DFT: </b><span>${format_number(
                      resultadoDescuentoPorFamiliaYTipoPago.discount,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}%</span>`
                  );
                  break;
                case TiposDeDescuento.Monetario.toString():
                  listaDeLi.push(
                    `<br/><b> DFT: </b><span>${DarFormatoAlMonto(
                      format_number(
                        resultadoDescuentoPorFamiliaYTipoPago.discount,
                        this.configuracionDecimales.defaultDisplayDecimals
                      )
                    )}</span>`
                  );
                  break;
              }
              listaDeLi.push(
                `<b> Total: </b><span>${format_number(
                  sku.total,
                  this.configuracionDecimales.defaultDisplayDecimals
                )} </span>`
              );
            }

            listaDeLi.push(
              `<span class='ui-li-count' style='position:absolute; top:55%'>${DarFormatoAlMonto(
                format_number(
                  total,
                  this.configuracionDecimales.defaultDisplayDecimals
                )
              )}</span><br/>`
            );
          }
          if (sku.dimension > 0) {
            listaDeLi.push(
              `<b>DIM: </b><span>${format_number(
                sku.dimension,
                this.configuracionDecimales.defaultDisplayDecimals
              )}</span>`
            );
          }

          listaDeLi.push("</p>");
        }
      }

      this.listaDeSkuParaBonificacionParaOrdenDeVenta.map(
        (skuBonificacion: Sku) => {
          listaDeLi.push(
            "<li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>"
          );
          listaDeLi.push(
            `<p><h4>${skuBonificacion.sku}/${(skuBonificacion.skuName = ""
              ? skuBonificacion.skuDescription
              : skuBonificacion.skuName)}</h4></p>`
          );
          listaDeLi.push("<p>");
          listaDeLi.push(
            `<b>UM: </b><span>${skuBonificacion.codePackUnit} </span>`
          );
          listaDeLi.push(
            `<b> Cantidad: </b><span>${skuBonificacion.qty} </span>`
          );
          listaDeLi.push("</p>");
        }
      );

      uiListaOrdenDeVenta.append(listaDeLi.join(""));
      uiListaOrdenDeVenta.listview("refresh");
      uiListaOrdenDeVenta = null;
      callback();
    } catch (err) {
      notify("Error al generar la lista de orden de venta: " + err.message);
    }
  }

  obtenerTotalDeOrdenDeVenta(
    descuento: number,
    _listaDeSku: Array<Sku>
  ): number {
    let total = 0;
    total = this.tarea.salesOrderTotal;
    total = descuento !== 0 ? total - (descuento * total) / 100 : total;
    return total;
  }

  unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(
    bonosNormales: Array<Sku>,
    listaDeBonificacionesPorMontoGeneral: BonoPorMontoGeneral[],
    bonosPorCombo: Array<BonoPorCombo>,
    callback: (bonosFinales: Array<Sku>) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      bonosPorCombo.map((bono, index, array) => {
        if (!bono.isConfig) {
          if (
            !this.usuarioPuedeModificarBonificacionDeCombo ||
            localStorage.getItem("USE_MAX_BONUS") === "1"
          ) {
            if (
              bono.bonusSubType ===
                SubTipoDeBonificacionPorCombo.Multiple.toString() ||
              (bono.bonusSubType ===
                SubTipoDeBonificacionPorCombo.Unica.toString() &&
                bono.skusDeBonoPorCombo.length === 1)
            ) {
              bono.skusDeBonoPorComboAsociados = bono.skusDeBonoPorCombo;
              bono.isConfig = true;
              bono.isEmpty = false;
            }
          }
        }
      });

      bonosPorCombo.map((bonoPorCombo: BonoPorCombo) => {
        bonoPorCombo.skusDeBonoPorComboAsociados.map(
          (skuDeBonoPorCombo: SkuDeBonoPorCombo) => {
            let bono: Sku = (bonosNormales as any).find((bonoNormal: Sku) => {
              return (
                bonoNormal.sku === skuDeBonoPorCombo.codeSku &&
                bonoNormal.codePackUnit === skuDeBonoPorCombo.codePackUnit
              );
            });

            if (bono) {
              bono.qty += skuDeBonoPorCombo.selectedQty;
            } else {
              let skuBonificacionNuevo: Sku = new Sku();
              skuBonificacionNuevo.sku = skuDeBonoPorCombo.codeSku;
              skuBonificacionNuevo.codePackUnit =
                skuDeBonoPorCombo.codePackUnit;
              skuBonificacionNuevo.skuDescription =
                skuDeBonoPorCombo.descriptionSku;
              skuBonificacionNuevo.skuName = skuDeBonoPorCombo.descriptionSku;
              skuBonificacionNuevo.qty = skuDeBonoPorCombo.selectedQty;
              skuBonificacionNuevo.owner = skuDeBonoPorCombo.owner;
              skuBonificacionNuevo.ownerId = skuDeBonoPorCombo.ownerId;
              bonosNormales.push(skuBonificacionNuevo);
            }
          }
        );
      });

      listaDeBonificacionesPorMontoGeneral.map(
        (bonoPorMontoGeneral: BonoPorMontoGeneral) => {
          let bono: Sku = (bonosNormales as any).find((bonoNormal: Sku) => {
            return (
              bonoNormal.sku === bonoPorMontoGeneral.codeSkuBonus &&
              bonoNormal.codePackUnit === bonoPorMontoGeneral.codePackUnitBonus
            );
          });

          if (bono) {
            bono.qty += bonoPorMontoGeneral.bonusQty;
          } else {
            let skuBonificacionNuevo: Sku = new Sku();
            skuBonificacionNuevo.sku = bonoPorMontoGeneral.codeSkuBonus;
            skuBonificacionNuevo.codePackUnit =
              bonoPorMontoGeneral.codePackUnitBonus;
            skuBonificacionNuevo.skuDescription =
              bonoPorMontoGeneral.skuNameBonus;
            skuBonificacionNuevo.qty = bonoPorMontoGeneral.bonusQty;
            skuBonificacionNuevo.owner = bonoPorMontoGeneral.owner;
            skuBonificacionNuevo.ownerId = bonoPorMontoGeneral.ownerId;
            bonosNormales.push(skuBonificacionNuevo);
          }
        }
      );
      callback(bonosNormales);
    } catch (e) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: "1-Error al unir bonificaciones del pedido: " + e.message
      });
    }
  }

  usuarioDeseaFinalizarOrdenDeVenta() {
    try {
      let mensaje = "Desea dar por finalizada la orden de venta?";
      let formaDePago = "";
      if (this.pago === null || this.pago === undefined) {
        formaDePago = "Efectivo";
      } else {
        switch (this.pago.pagoDetalle[0].paymentType) {
          case TipoDePago.Efectivo.toString():
            formaDePago = "Efectivo";
            break;
          case TipoDePago.Cheque.toString():
            formaDePago = "Cheque";
            break;
        }
      }
      if (this.esOrdenDeVentaParaCobrar) {
        mensaje =
          "El Monto del pedido es Q." +
          format_number(
            this.cliente.totalAmout,
            this.configuracionDecimales.defaultDisplayDecimals
          ) +
          " y es pagado en " +
          formaDePago +
          ", " +
          mensaje;
      }

      navigator.notification.confirm(
        mensaje,
        buttonIndex => {
          if (buttonIndex === 2) {
            this.seguirProcesoDeCrearOrdenDeVenta(this.firma, this.foto);
          }
        },
        "Sonda® " + SondaVersion,
        <any>"No,Si"
      );
    } catch (err) {
      notify("Error al mostrar finalizar la orden de venta: " + err.message);
    }
  }

  validarPedidoTipoCobro(callback: () => void) {
    this.tareaServicio.obtenerRegla(
      "CobrarOrdenDeVenta",
      (listaDeReglas: Regla[]) => {
        if (
          listaDeReglas.length > 0 &&
          listaDeReglas[0].enabled.toUpperCase() === "SI"
        ) {
          this.esOrdenDeVentaParaCobrar = true;
          callback();
        } else {
          callback();
        }
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  seguirProcesoDeCrearOrdenDeVenta(firma: string, foto: string) {
    if (this.fotoObligatoria) {
      if (foto == undefined || foto === "") {
        notify(
          "Debe de tomar una fotografia antes de finalizar la orden de venta."
        );
        return;
      }
    }
    if (this.firmaObligatoria) {
      if (firma == undefined || firma === "") {
        notify(
          "Debe de firmar el documento antes de finalizar la orden de venta."
        );
        return;
      }
    }
    my_dialog("Creando orden de venta", "Espere...", "open");
    BloquearPantalla();
    this.crearTareaParaOrdeDeVenta(
      (taskId: number) => {
        this.tarea.taskId = taskId;
        if (this.tarea.taskType === TareaTipo.Preventa) {
          this.procesarOrdenDeVenta(
            firma,
            foto,
            SiNo.Si,
            (ordenDeVenta: OrdenDeVenta) => {
              this.ordenDeVenta = ordenDeVenta;
              this.obtenerPago((pago: PagoEncabezado) => {
                pago.pagoDetalle[0].sourceDocSerie = ordenDeVenta.docSerie;
                pago.pagoDetalle[0].sourceDocNum = ordenDeVenta.docNum;
                this.pagoServicio.guardarPago(
                  pago,
                  this.esOrdenDeVentaParaCobrar,
                  (pagoGuardado: PagoEncabezado) => {
                    this.pago = pagoGuardado;

                    let cerrarDocumentoDeCliente = (
                      formatoOrdenDeventa: string,
                      formatoPago: string
                    ) => {
                      let encuestasAEjecutarEnFinalizacionDeTarea: Microencuesta[] = this.encuestaServicio.filtrarEncuestasPorDisparador(
                        this.tarea.microsurveys,
                        DisparadorDeEncuesta.FinDeTarea
                      );

                      if (
                        encuestasAEjecutarEnFinalizacionDeTarea &&
                        encuestasAEjecutarEnFinalizacionDeTarea.length > 0
                      ) {
                        this.encuestaServicio.procesarEncuestasDeCliente(
                          encuestasAEjecutarEnFinalizacionDeTarea,
                          0,
                          this.tarea.hasDraft,
                          () => {
                            this.usuarioDeseaCerrarDocumento(
                              formatoOrdenDeventa,
                              formatoPago
                            );
                          },
                          (error: Operacion) => {
                            DesBloquearPantalla();
                            notify(error.mensaje);
                            my_dialog("", "", "close");
                            RegresarAPaginaAnterior("pickupplan_page");
                          }
                        );
                        BloquearPantalla();
                        let timeOut = setTimeout(() => {
                          $.mobile.changePage("#UiSurveyPage", {
                            transition: "flow",
                            reverse: true,
                            changeHash: true,
                            showLoadMsg: false
                          });
                          clearTimeout(timeOut);
                        }, 1000);
                      } else {
                        this.usuarioDeseaCerrarDocumento(
                          formatoOrdenDeventa,
                          formatoPago
                        );
                      }
                    };

                    if (
                      !this.formatoDeOrdenDeVenta ||
                      this.formatoDeOrdenDeVenta === ""
                    ) {
                      this.obtenerFormatosDeImpresion(
                        this.cliente,
                        ordenDeVenta,
                        pagoGuardado,
                        this.esOrdenDeVentaParaCobrar,
                        (
                          formatoDeOrdenDeVenta: string,
                          formatoDePago: string
                        ) => {
                          cerrarDocumentoDeCliente(
                            formatoDeOrdenDeVenta,
                            formatoDePago
                          );
                        },
                        (resultado: Operacion) => {
                          notify(resultado.mensaje);
                          RegresarAPaginaAnterior("pickupplan_page");
                          my_dialog("", "", "close");
                          DesBloquearPantalla();
                        }
                      );
                    } else {
                      cerrarDocumentoDeCliente(
                        this.formatoDeOrdenDeVenta,
                        this.formatoDePago
                      );
                    }
                  },
                  (resultado: Operacion) => {
                    notify(resultado.mensaje);
                    RegresarAPaginaAnterior("pickupplan_page");
                    my_dialog("", "", "close");
                    DesBloquearPantalla();
                  }
                );
              });
            }
          );
        }
      },
      (resultado: Operacion) => {
        my_dialog("", "", "close");
        DesBloquearPantalla();
        notify(resultado.mensaje);
      }
    );
  }

  crearTareaParaOrdeDeVenta(
    callback: (taskId: number) => any,
    errCallBack: (resultado: Operacion) => void
  ) {
    try {
      if (this.tarea.taskId === 0) {
        this.crearTareaOv(
          this.tarea,
          this.cliente,
          (taskId: number) => {
            this.seCreoTareaAceptada = true;
            callback(taskId);
          },
          (resultado: Operacion) => {
            errCallBack(resultado);
          }
        );
      } else {
        callback(this.tarea.taskId);
      }
    } catch (err) {
      errCallBack(<Operacion>{
        codigo: -1,
        mensaje: "Error al crear la tarea:" + err.message
      });
    }
  }

  crearTareaOv(
    tarea: Tarea,
    cliente: Cliente,
    callback: (taskId: number) => any,
    errCallBack: (resultado: Operacion) => void
  ) {
    try {
      let direccion = cliente.address;
      if (direccion === "") {
        direccion = "No tiene direccion";
      }
      const clienteTarea = {
        Nombre: cliente.clientName,
        Direccion: direccion,
        Telefono: cliente.phone,
        CodigoHH: cliente.clientId
      };
      CrearTarea(
        clienteTarea,
        tarea.taskType,
        (clienteNuevo: string, codigoTarea: string) => {
          callback(Number(codigoTarea));
        }
      );
    } catch (err) {
      errCallBack(<Operacion>{
        codigo: -1,
        mensaje: "Error al crear la tarea:" + err.message
      });
    }
  }

  procesarOrdenDeVenta(
    firma: string,
    foto: string,
    guardarPedido: SiNo,
    callback: (ordenDeVenta: OrdenDeVenta) => void
  ) {
    try {
      this.prepararOrdenDeVenta(
        firma,
        foto,
        this.listaDeSkuDeVenta,
        true,
        (ordenDeVenta: OrdenDeVenta, listaDePromo: Promo[]) => {
          if (guardarPedido === SiNo.Si) {
            this.ordenDeVentaServicio.insertarOrdenDeVenta(
              ordenDeVenta,
              () => {
                this.recorrerListaDePromoParaInsertar(
                  listaDePromo,
                  0,
                  () => {
                    this.listaDeSkuParaBonificacionDeCombo = Array<
                      BonoPorCombo
                    >();
                    this.publicarCombo();
                    callback(ordenDeVenta);
                  },
                  (resultado: Operacion) => {
                    notify(resultado.mensaje);
                  }
                );
              },
              (resultado: Operacion) => {
                notify(resultado.mensaje);
              }
            );
          } else {
            callback(ordenDeVenta);
          }
        }
      );
    } catch (ex) {
      notify("Error al procesarOrdenDeVenta: " + ex.message);
    }
  }

  prepararOrdenDeVenta(
    firma: string,
    foto: string,
    listaSku: Sku[],
    esOrdenDeVentaPadre: boolean,
    callback: (ordenDeVenta: OrdenDeVenta, listaDePromo: Promo[]) => void
  ) {
    try {
      this.esOrdenDeVentaAutorizada(
        (autorizada: boolean) => {
          this.obtenerSecuenciaDeDocumentos(
            this,
            (
              sequence: string,
              serie: string,
              numeroDeDocumento: number,
              controlador: any
            ) => {
              var ordenDeVenta = new OrdenDeVenta();
              ordenDeVenta.salesOrderId = parseInt(sequence);
              ordenDeVenta.docSerie = serie;
              ordenDeVenta.docNum = numeroDeDocumento;
              ordenDeVenta.terms = null;
              ordenDeVenta.postedDatetime = getDateTime();
              ordenDeVenta.clientId = controlador.cliente.clientId;
              ordenDeVenta.posTerminal = gCurrentRoute;
              ordenDeVenta.gpsUrl = gCurrentGPS;
              ordenDeVenta.status = "0";
              ordenDeVenta.postedBy = localStorage.getItem("LAST_LOGIN_ID");
              ordenDeVenta.image1 = firma;
              ordenDeVenta.image2 = foto;
              ordenDeVenta.image3 =
                controlador.cliente.fotoDeInicioDeVisita !== ""
                  ? controlador.cliente.fotoDeInicioDeVisita
                  : null;
              ordenDeVenta.deviceBatteryFactor = gBatteryLevel;
              ordenDeVenta.voidDatetime = null;
              ordenDeVenta.voidReason = null;
              ordenDeVenta.voidNotes = null;
              ordenDeVenta.voided = null;
              ordenDeVenta.closedRouteDatetime = null;
              ordenDeVenta.datetime = null;
              ordenDeVenta.isActiveRoute = 1;
              ordenDeVenta.gpsExpected = controlador.cliente.gps;
              ordenDeVenta.salesOrderIdBo = null;
              ordenDeVenta.isPosted = 0;
              ordenDeVenta.deliveryDate = controlador.cliente.deliveryDate;
              ordenDeVenta.isParent = esOrdenDeVentaPadre;
              ordenDeVenta.referenceId =
                localStorage.getItem("LAST_LOGIN_ID") +
                getDateTime() +
                sequence;
              ordenDeVenta.timesPrinted = 0;
              ordenDeVenta.paymentTimesPrinted = 0;
              ordenDeVenta.sinc = 0;
              ordenDeVenta.isPostedVoid = 2;
              ordenDeVenta.isVoid = false;
              ordenDeVenta.salesOrderType = gSalesOrderType; //controlador.tarea.salesOrderType;
              ordenDeVenta.discountByGeneralAmountApplied =
                controlador.cliente.appliedDiscount;
              ordenDeVenta.discountApplied = controlador.cliente.discount;
              ordenDeVenta.taskId = controlador.tarea.taskId;
              ordenDeVenta.salesOrderIdBo = 0;
              ordenDeVenta.isDraft = 0;
              ordenDeVenta.isUpdated = 1;
              ordenDeVenta.ordenDeVentaDetalle = [];
              ordenDeVenta.comment = controlador.cliente.salesComment;
              ordenDeVenta.paidToDate = controlador.cliente.totalAmout;
              ordenDeVenta.toBill = controlador.esOrdenDeVentaParaCobrar
                ? 1
                : 0;
              ordenDeVenta.authorized = autorizada;
              ordenDeVenta.isPostedValidated = 0;
              ordenDeVenta.totalAmountDisplay = this.obtenerTotalDeOrdenDeVenta(
                this.cliente.appliedDiscount,
                this.listaDeSkuDeVenta
              );
              ordenDeVenta.goalHeaderId = localStorage.getItem("GOAL_HEADER_ID")
                ? parseInt(localStorage.getItem("GOAL_HEADER_ID"))
                : null;

              var total = 0;
              let lineSequence = 0;
              let ordenDeVentaDetalle: OrdenDeVentaDetalle = new OrdenDeVentaDetalle();
              let listaDePromosAGuardar: Promo[] = [];
              listaSku.map((sku: Sku) => {
                ordenDeVentaDetalle = new OrdenDeVentaDetalle();

                //----Obtenemos el descuento por monto general y familia
                let resultadoDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (this
                  .listaDeDescuentoPorMontoGeneralYFamilia as any).find(
                  (descuentoABuscar: DescuentoPorMontoGeneralYFamilia) => {
                    return descuentoABuscar.codeFamily === sku.codeFamilySku;
                  }
                );

                //----Obtenemos el descuento por familia y tipo pago
                let resultadoDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (this
                  .listaDeDescuentoPorFamiliaYTipoPago as any).find(
                  (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
                    return descuentoABuscar.codeFamily === sku.codeFamilySku;
                  }
                );

                ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                ordenDeVentaDetalle.sku = sku.sku;
                ordenDeVentaDetalle.lineSeq = lineSequence + 1;
                ordenDeVentaDetalle.qty = sku.qty;
                ordenDeVentaDetalle.price = sku.cost;
                ordenDeVentaDetalle.totalLine = sku.total;
                ordenDeVentaDetalle.totalAmountDisplay = sku.totalCD;
                ordenDeVentaDetalle.postedDatetime = getDateTime();
                ordenDeVentaDetalle.serie = "0";
                ordenDeVentaDetalle.serie2 = "0";
                ordenDeVentaDetalle.requeriesSerie = false;
                ordenDeVentaDetalle.comboReference = sku.sku;
                ordenDeVentaDetalle.parentSeq = 1;
                ordenDeVentaDetalle.isActiveRoute = 1;
                ordenDeVentaDetalle.skuName = sku.skuName;
                ordenDeVentaDetalle.isPostedVoid = 2;
                ordenDeVentaDetalle.isVoid = false;
                ordenDeVentaDetalle.discount = sku.appliedDiscount;
                ordenDeVentaDetalle.codePackUnit = sku.codePackUnit;
                ordenDeVentaDetalle.docSerie = ordenDeVenta.docSerie;
                ordenDeVentaDetalle.docNum = ordenDeVenta.docNum;
                ordenDeVentaDetalle.long = sku.dimension;
                ordenDeVentaDetalle.isSaleByMultiple = sku.isSaleByMultiple;
                ordenDeVentaDetalle.multipleSaleQty = sku.multipleSaleQty;
                ordenDeVentaDetalle.owner = sku.owner;
                ordenDeVentaDetalle.ownerId = sku.ownerId;
                ordenDeVentaDetalle.discountType = sku.discountType;
                ordenDeVentaDetalle.discountByFamily = !sku.specialPrice
                  .applyDiscount
                  ? 0
                  : sku.isUniqueDiscountScale
                  ? 0
                  : resultadoDescuentoPorMontoGeneralYFamilia
                  ? resultadoDescuentoPorMontoGeneralYFamilia.discount
                  : 0;
                ordenDeVentaDetalle.typeOfDiscountByFamily = !sku.specialPrice
                  .applyDiscount
                  ? ""
                  : sku.isUniqueDiscountScale
                  ? ""
                  : resultadoDescuentoPorMontoGeneralYFamilia
                  ? resultadoDescuentoPorMontoGeneralYFamilia.discountType
                  : "";
                ordenDeVentaDetalle.discountByFamilyAndPaymentType = !sku
                  .specialPrice.applyDiscount
                  ? 0
                  : sku.isUniqueDiscountScale
                  ? 0
                  : resultadoDescuentoPorFamiliaYTipoPago
                  ? resultadoDescuentoPorFamiliaYTipoPago.discount
                  : 0;
                ordenDeVentaDetalle.typeOfDiscountByFamilyAndPaymentType = !sku
                  .specialPrice.applyDiscount
                  ? ""
                  : sku.isUniqueDiscountScale
                  ? ""
                  : resultadoDescuentoPorFamiliaYTipoPago
                  ? resultadoDescuentoPorFamiliaYTipoPago.discountType
                  : "";
                ordenDeVentaDetalle.codeFamilySku = sku.codeFamilySku;
                ordenDeVentaDetalle.basePrice = sku.basePrice;
                ordenDeVentaDetalle.uniqueDiscountByScaleAplied = sku.isUniqueDiscountScale
                  ? 1
                  : 0;
                ordenDeVentaDetalle.applyDiscountBySpecialPrice = sku
                  .specialPrice.applyDiscount
                  ? 1
                  : 0;
                ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                total += ordenDeVentaDetalle.totalLine;
                sku.listPromo.map((promo: Promo) => {
                  promo.salesOrderDocumentNumber = numeroDeDocumento;
                  promo.salesOrderDocumentSeries = serie;
                  listaDePromosAGuardar.push(promo);
                });
                if (sku.specialPrice.promoId > 0) {
                  let resultadoPromoBusqueda = (listaDePromosAGuardar as any).find(
                    (promo: Promo) => {
                      return promo.promoId === sku.specialPrice.promoId;
                    }
                  );
                  if (!resultadoPromoBusqueda) {
                    let promoParaAgregar: Promo = new Promo();
                    promoParaAgregar.promoId = sku.specialPrice.promoId;
                    promoParaAgregar.promoName = sku.specialPrice.promoName;
                    promoParaAgregar.promoType = sku.specialPrice.promoType;
                    promoParaAgregar.frequency = sku.specialPrice.frequency;
                    promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                    promoParaAgregar.salesOrderDocumentSeries = serie;
                    listaDePromosAGuardar.push(promoParaAgregar);
                  }
                }
                lineSequence++;
              });

              let listaDescuentosPorMontoGeneralYFamiliaAGuardar: Array<
                DescuentoPorMontoGeneralYFamilia
              > = [];
              let listaDescuentoPorFamiliaYTipoPagoAGuardar: Array<
                DescuentoPorFamiliaYTipoPago
              > = [];

              //------Recorremos el detalle de para ver si hay descuentos de familia que se aprlicaron

              ordenDeVenta.ordenDeVentaDetalle.map(
                (ordenDeVentaDetalle: OrdenDeVentaDetalle) => {
                  if (ordenDeVentaDetalle.discountByFamily > 0) {
                    let resultadoDescuentoPorMontoGeneralYFamiliaDeTodos: DescuentoPorMontoGeneralYFamilia = (this
                      .listaDeDescuentoPorMontoGeneralYFamilia as any).find(
                      (descuentoABuscar: DescuentoPorMontoGeneralYFamilia) => {
                        return (
                          descuentoABuscar.codeFamily ===
                          ordenDeVentaDetalle.codeFamilySku
                        );
                      }
                    );

                    if (resultadoDescuentoPorMontoGeneralYFamiliaDeTodos) {
                      let resultadoDescuentoPorMontoGeneralYFamiliaAGuardar: DescuentoPorMontoGeneralYFamilia = (listaDescuentosPorMontoGeneralYFamiliaAGuardar as any).find(
                        (
                          descuentoABuscar: DescuentoPorMontoGeneralYFamilia
                        ) => {
                          return (
                            resultadoDescuentoPorMontoGeneralYFamiliaDeTodos.promoId ===
                            descuentoABuscar.promoId
                          );
                        }
                      );
                      if (!resultadoDescuentoPorMontoGeneralYFamiliaAGuardar) {
                        listaDescuentosPorMontoGeneralYFamiliaAGuardar.push(
                          resultadoDescuentoPorMontoGeneralYFamiliaDeTodos
                        );
                      }
                    }
                  }

                  //----Obtenemos el descuento por familia y tipo pago
                  if (ordenDeVentaDetalle.discountByFamilyAndPaymentType > 0) {
                    let resultadoDescuentoPorFamiliaYTipoPagoDeTodos: DescuentoPorFamiliaYTipoPago = (this
                      .listaDeDescuentoPorFamiliaYTipoPago as any).find(
                      (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
                        return (
                          descuentoABuscar.codeFamily ===
                          ordenDeVentaDetalle.codeFamilySku
                        );
                      }
                    );

                    if (resultadoDescuentoPorFamiliaYTipoPagoDeTodos) {
                      let resultadoDescuentoPorFamiliaYTipoPagoAGuardar: DescuentoPorFamiliaYTipoPago = (listaDescuentoPorFamiliaYTipoPagoAGuardar as any).find(
                        (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
                          return (
                            resultadoDescuentoPorFamiliaYTipoPagoDeTodos.promoId ===
                            descuentoABuscar.promoId
                          );
                        }
                      );
                      if (!resultadoDescuentoPorFamiliaYTipoPagoAGuardar) {
                        listaDescuentoPorFamiliaYTipoPagoAGuardar.push(
                          resultadoDescuentoPorFamiliaYTipoPagoDeTodos
                        );
                      }
                    }
                  }
                }
              );

              this.listaDeDescuentoPorMontoGeneralYFamilia = listaDescuentosPorMontoGeneralYFamiliaAGuardar;
              this.listaDeDescuentoPorFamiliaYTipoPago = listaDescuentoPorFamiliaYTipoPagoAGuardar;
              //------Fin Recorremos el detalle de para ver si hay descuentos de familia que se aprlicaron

              //------ Agregar sku de bonificacion
              this.listaDeSkuParaBonificacionParaOrdenDeVenta.map(
                (sku: Sku) => {
                  ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                  ordenDeVentaDetalle.salesOrderId = ordenDeVenta.salesOrderId;
                  ordenDeVentaDetalle.sku = sku.sku;
                  ordenDeVentaDetalle.lineSeq = lineSequence + 1;
                  ordenDeVentaDetalle.qty = sku.qty;
                  ordenDeVentaDetalle.price = 0;
                  ordenDeVentaDetalle.totalLine = 0;
                  ordenDeVentaDetalle.postedDatetime = getDateTime();
                  ordenDeVentaDetalle.serie = "0";
                  ordenDeVentaDetalle.serie2 = "0";
                  ordenDeVentaDetalle.requeriesSerie = false;
                  ordenDeVentaDetalle.comboReference = sku.sku;
                  ordenDeVentaDetalle.parentSeq = 1;
                  ordenDeVentaDetalle.isActiveRoute = 1;
                  ordenDeVentaDetalle.skuName = sku.skuName;
                  ordenDeVentaDetalle.isPostedVoid = 2;
                  ordenDeVentaDetalle.isVoid = false;
                  ordenDeVentaDetalle.discount = 0;
                  ordenDeVentaDetalle.codePackUnit = sku.codePackUnit;
                  ordenDeVentaDetalle.docSerie = ordenDeVenta.docSerie;
                  ordenDeVentaDetalle.docNum = ordenDeVenta.docNum;
                  ordenDeVentaDetalle.isBonus = 1;
                  ordenDeVentaDetalle.isSaleByMultiple = false;
                  ordenDeVentaDetalle.multipleSaleQty = 1;
                  ordenDeVentaDetalle.owner = sku.owner;
                  ordenDeVentaDetalle.ownerId = sku.ownerId;
                  ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                  sku.listPromo.map((promo: Promo) => {
                    promo.salesOrderDocumentNumber = numeroDeDocumento;
                    promo.salesOrderDocumentSeries = serie;
                    listaDePromosAGuardar.push(promo);
                  });

                  lineSequence++;
                }
              );

              //------ Agregar sku de bonificacion por combo
              this.listaDeSkuParaBonificacionDeCombo.map(
                (bonificacionPorCombo: BonoPorCombo) => {
                  if (
                    bonificacionPorCombo.skusDeBonoPorComboAsociados.length > 0
                  ) {
                    let promo: Promo = (listaDePromosAGuardar as any).find(
                      (bonificacionMontoGeneral: Promo) => {
                        return (
                          bonificacionMontoGeneral.promoId ===
                          bonificacionPorCombo.promoId
                        );
                      }
                    );
                    if (!promo) {
                      let promoParaAgregar: Promo = new Promo();
                      promoParaAgregar.promoId = bonificacionPorCombo.promoId;
                      promoParaAgregar.promoName =
                        bonificacionPorCombo.promoName;
                      promoParaAgregar.promoType =
                        bonificacionPorCombo.promoType;
                      promoParaAgregar.frequency =
                        bonificacionPorCombo.frequency;
                      promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                      promoParaAgregar.salesOrderDocumentSeries = serie;
                      listaDePromosAGuardar.push(promoParaAgregar);
                      promoParaAgregar = null;
                    }
                  }
                }
              );

              //------ Agregar sku de bonificacion por monto general
              this.listaDeBonificacionesPorMontoGeneral.map(
                (bonificacion: BonoPorMontoGeneral) => {
                  let promo: Promo = (listaDePromosAGuardar as any).find(
                    (bonificacionMontoGeneral: Promo) => {
                      return (
                        bonificacionMontoGeneral.promoId ===
                        bonificacion.promoId
                      );
                    }
                  );
                  if (!promo) {
                    let promoParaAgregar: Promo = new Promo();
                    promoParaAgregar.promoId = bonificacion.promoId;
                    promoParaAgregar.promoName = bonificacion.promoName;
                    promoParaAgregar.promoType = bonificacion.promoType;
                    promoParaAgregar.frequency = bonificacion.frequency;
                    promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                    promoParaAgregar.salesOrderDocumentSeries = serie;
                    listaDePromosAGuardar.push(promoParaAgregar);
                    promoParaAgregar = null;
                  }
                }
              );

              this.listaDeDescuentoPorMontoGeneralYFamilia.forEach(
                (descuento: DescuentoPorMontoGeneralYFamilia) => {
                  let promoParaAgregar: Promo = new Promo();
                  promoParaAgregar.promoId = descuento.promoId;
                  promoParaAgregar.promoName = descuento.promoName;
                  promoParaAgregar.promoType = descuento.promoType;
                  promoParaAgregar.frequency = descuento.frequency;
                  promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                  promoParaAgregar.salesOrderDocumentSeries = serie;
                  listaDePromosAGuardar.push(promoParaAgregar);
                  promoParaAgregar = null;
                }
              );

              this.listaDeDescuentoPorFamiliaYTipoPago.forEach(
                (descuento: DescuentoPorFamiliaYTipoPago) => {
                  let promoParaAgregar: Promo = new Promo();
                  promoParaAgregar.promoId = descuento.promoId;
                  promoParaAgregar.promoName = descuento.promoName;
                  promoParaAgregar.promoType = descuento.promoType;
                  promoParaAgregar.frequency = descuento.frequency;
                  promoParaAgregar.salesOrderDocumentNumber = numeroDeDocumento;
                  promoParaAgregar.salesOrderDocumentSeries = serie;
                  listaDePromosAGuardar.push(promoParaAgregar);
                  promoParaAgregar = null;
                }
              );

              ordenDeVenta.detailQty = ordenDeVenta.ordenDeVentaDetalle.length;
              ordenDeVenta.totalAmount = total;
              let to = setTimeout(() => {
                clearTimeout(to);
                callback(ordenDeVenta, listaDePromosAGuardar);
              }, 2000);
            }
          );
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (err) {
      notify("Error al preparar ordenDeVenta: " + err.message);
    }
  }

  esOrdenDeVentaAutorizada(
    callback: (autorizada: boolean) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    this.tareaServicio.obtenerRegla(
      "OrdenesDeVentaNoAutorizadas",
      (listaDeReglas: Regla[]) => {
        if (listaDeReglas.length > 0 && listaDeReglas[0].enabled === "Si") {
          callback(false);
        } else {
          callback(true);
        }
      },
      (resultado: Operacion) => {
        errCallback(resultado);
      }
    );
  }

  obtenerSecuenciaDeDocumentos(
    controlador: any,
    callback: (
      sequence: string,
      serie: string,
      numeroDeDocumento: number,
      controlador: any
    ) => void
  ) {
    try {
      GetNexSequence(
        "SALES",
        sequence => {
          ObtenerSecuenciaSiguiente(
            TipoDocumento.OrdenDeVenta,
            (serie, numeroDeDocumento) => {
              callback(sequence, serie, numeroDeDocumento, controlador);
            },
            err => {
              notify(`Error al obtener sequencia de documento: ${err.message}`);
            }
          );
        },
        err => {
          notify(`Error al obtener sequencia de documento: ${err.message}`);
        }
      );
    } catch (err) {
      notify(`Error al obtener secuencia de documento: ${err.message}`);
    }
  }

  publicarFirma(callback: () => void) {
    let msg = new FirmaMensaje(this);
    msg.firma = this.firma;
    msg.origen = OrigenFirma.OrdenDeVenta;

    this.mensajero.publish(msg, getType(FirmaMensaje));

    callback();
  }

  obtenerPago(callback: (pago: PagoEncabezado) => void) {
    if (this.esOrdenDeVentaParaCobrar) {
      if (this.pago === null || this.pago === undefined) {
        this.pagoServicio.formarPagoUnicoDesdeLista(
          this.cliente,
          this.listaDeSkuDeVenta,
          TipoDePago.Efectivo,
          null,
          null,
          null,
          (pago: PagoEncabezado) => {
            callback(pago);
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      } else {
        callback(this.pago);
      }
    } else {
      let pago = new PagoEncabezado();
      pago.pagoDetalle = [];
      let detalle = new PagoDetalle();
      pago.pagoDetalle.push(detalle);

      callback(pago);
    }
  }

  obtenerFormatosDeImpresion(
    cliente: Cliente,
    ordenDeVenta: OrdenDeVenta,
    pago: PagoEncabezado,
    esOrdenDeVentaParaCobrar: boolean,
    callback: (formatoDeOrdenDeVenta: string, formatoDePago: string) => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    this.ordenDeVentaServicio.obtenerFormatoDeImpresionPreSale(
      cliente,
      ordenDeVenta,
      (formatoDeOrdenDeVenta: string) => {
        if (esOrdenDeVentaParaCobrar) {
          this.pagoServicio.obtenerFormatoDeImpresionDePago(
            cliente,
            ordenDeVenta,
            pago,
            (formatoDePago: string) => {
              this.formatoDeOrdenDeVenta = formatoDeOrdenDeVenta;
              this.formatoDePago = formatoDePago;
              callback(formatoDeOrdenDeVenta, formatoDePago);
            },
            (resultadoN1: Operacion) => {
              notify(resultadoN1.mensaje);
            }
          );
        } else {
          this.formatoDeOrdenDeVenta = formatoDeOrdenDeVenta;
          callback(formatoDeOrdenDeVenta, "");
        }
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  cerrarDocumento(
    formatoDeOrdenDeVenta: string,
    formatoDePago: string,
    callback: () => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      this.ordenDeVentaServicio.actualizarDocumnetoImpreso(
        this.tarea.taskId,
        formatoDeOrdenDeVenta,
        formatoDePago,
        () => {
          this.tarea.taskStatus = TareaEstado.Completada;
          if (!this.seCreoTareaAceptada) {
            actualizarListadoDeTareas(
              this.tarea.taskId,
              this.tarea.taskType,
              this.tarea.taskStatus,
              this.cliente.clientId,
              this.cliente.clientName,
              this.cliente.address,
              0,
              TareaEstado.Aceptada,
              this.cliente.rgaCode
            );
          }
          this.tareaServicio.actualizarTareaEstado(
            this.tarea,
            () => {
              callback();
            },
            (resultado: Operacion) => {
              callbackError(resultado);
            }
          );
        },
        (resultado: Operacion) => {
          callbackError(resultado);
        }
      );
    } catch (err) {
      callbackError(<Operacion>{
        codigo: -1,
        mensaje:
          "Error al obtener formato de impresion de orden de venta: " +
          err.message
      });
    }
  }

  preguntarSiSeImprimePagoDeOrdenDeVenta(
    formatoDePago: string,
    esOrdenDeVentaParaCobrar: boolean,
    callback: () => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    if (esOrdenDeVentaParaCobrar) {
      DesBloquearPantalla();
      navigator.notification.confirm(
        "Desea imprimir el pago de la orden de venta?",
        respuesta => {
          if (respuesta === 2) {
            BloquearPantalla();
            my_dialog("", "", "close");
            my_dialog("Espere...", "validando impresora", "open");

            const impresionServicio = new ImpresionServicio();
            const printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            impresionServicio.validarEstadosYImprimir(
              this.isImpresoraZebra,
              printMacAddress,
              formatoDePago,
              true,
              (resultado: Operacion) => {
                if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                  callback();
                  DesBloquearPantalla();
                } else {
                  callbackError(<Operacion>{
                    codigo: -1,
                    mensaje: resultado.mensaje
                  });
                  DesBloquearPantalla();
                }
              }
            );
          } else {
            callback();
            DesBloquearPantalla();
          }
        },
        "Sonda® " + SondaVersion,
        <any>"No,Si"
      );
    } else {
      callback();
      DesBloquearPantalla();
    }
  }

  usuarioDeseaCerrarDocumento(
    formatoDeOrdenDeVenta: string,
    formatoDePago: string
  ) {
    this.cerrarDocumento(
      formatoDeOrdenDeVenta,
      formatoDePago,
      () => {
        this.pago = null;
        let printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
        if (
          printMacAddress !== undefined &&
          printMacAddress !== "" &&
          printMacAddress !== null &&
          printMacAddress !== "undefined"
        ) {
          printMacAddress = null;
          if (!this.imprimio) {
            this.preguntarSiSeImprimeOrdenDeVenta(
              formatoDeOrdenDeVenta,
              () => {
                this.preguntarSiSeImprimePagoDeOrdenDeVenta(
                  formatoDePago,
                  this.esOrdenDeVentaParaCobrar,
                  () => {
                    my_dialog("", "", "close");
                    RegresarAPaginaAnterior("pickupplan_page");
                    this.prepararVariablesParaProximaVenta();
                    DesBloquearPantalla();
                  },
                  (resultadoN5: Operacion) => {
                    if (!this.isImpresoraZebra) {
                      notify(resultadoN5.mensaje);
                    }
                    my_dialog("", "", "close");
                    DesBloquearPantalla();
                    RegresarAPaginaAnterior("pickupplan_page");
                    this.prepararVariablesParaProximaVenta();
                  }
                );
              },
              (resultadoN4: Operacion) => {
                if (!this.isImpresoraZebra) {
                  notify(resultadoN4.mensaje);
                }
                my_dialog("", "", "close");
                DesBloquearPantalla();
                RegresarAPaginaAnterior("pickupplan_page");
                this.prepararVariablesParaProximaVenta();
              }
            );
          } else {
            printMacAddress = null;
            my_dialog("", "", "close");
            DesBloquearPantalla();
            RegresarAPaginaAnterior("pickupplan_page");
            this.prepararVariablesParaProximaVenta();
          }
        } else {
          printMacAddress = null;
          my_dialog("", "", "close");
          DesBloquearPantalla();
          RegresarAPaginaAnterior("pickupplan_page");
          this.prepararVariablesParaProximaVenta();
        }
      },
      (resultado: Operacion) => {
        if (!this.isImpresoraZebra) {
          notify(resultado.mensaje);
        }
        my_dialog("", "", "close");
        DesBloquearPantalla();
        RegresarAPaginaAnterior("pickupplan_page");
        this.prepararVariablesParaProximaVenta();
      }
    );
    if (this.tarea.hasDraft) {
      const ordenDeVentaTemporal = new OrdenDeVenta();
      ordenDeVentaTemporal.salesOrderId = this.tarea.salesOrderIdDraft;
      ordenDeVentaTemporal.docSerie = this.tarea.salesOrderDocSerieDraft;
      ordenDeVentaTemporal.docNum = this.tarea.salesOrderDocNumDraft;
      this.ordenDeVentaServicio.cancelarOCompletarOrdenDeVentaDraft(
        ordenDeVentaTemporal,
        () => {
          this.tarea.hasDraft = false;
          RegresarAPaginaAnterior("pickupplan_page");
          my_dialog("", "", "close");
          DesBloquearPantalla();
          this.prepararVariablesParaProximaVenta();
        },
        (resultadoN3: Operacion) => {
          notify(resultadoN3.mensaje);
          RegresarAPaginaAnterior("pickupplan_page");
          my_dialog("", "", "close");
          DesBloquearPantalla();
          this.prepararVariablesParaProximaVenta();
        }
      );
    }
  }

  usuarioDeseaImprimirOrdenDeVenta() {
    if (this.fotoObligatoria) {
      if (this.foto == undefined || this.foto === "") {
        notify(
          "Debe de tomar una fotografia antes de imprimir la orden de venta."
        );
        return;
      }
    }

    if (this.firmaObligatoria) {
      if (this.firma == undefined || this.firma === "") {
        notify(
          "Debe de firmar el documento antes de imprimir la orden de venta."
        );
        return;
      }
    }

    let printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
    if (
      printMacAddress !== undefined &&
      printMacAddress !== "" &&
      printMacAddress !== null &&
      printMacAddress !== "undefined"
    ) {
      printMacAddress = null;
      this.procesarOrdenDeVenta(
        this.firma,
        this.foto,
        SiNo.No,
        (ordenDeVenta: OrdenDeVenta) => {
          this.ordenDeVenta = ordenDeVenta;
          this.obtenerPago((pago: PagoEncabezado) => {
            pago.pagoDetalle[0].sourceDocSerie = ordenDeVenta.docSerie;
            pago.pagoDetalle[0].sourceDocNum = ordenDeVenta.docNum;
            this.pagoServicio.guardarPago(
              pago,
              false,
              pagoN1 => {
                this.pago = pagoN1;
                if (
                  this.formatoDeOrdenDeVenta === "" ||
                  this.formatoDeOrdenDeVenta == undefined
                ) {
                  this.obtenerFormatosDeImpresion(
                    this.cliente,
                    ordenDeVenta,
                    pagoN1,
                    this.esOrdenDeVentaParaCobrar,
                    (formatoDeOrdenDeVenta: string, formatoDePago: string) => {
                      this.preguntarSiSeImprimeOrdenDeVenta(
                        formatoDeOrdenDeVenta,
                        () => {
                          this.preguntarSiSeImprimePagoDeOrdenDeVenta(
                            formatoDePago,
                            this.esOrdenDeVentaParaCobrar,
                            () => {
                              my_dialog("", "", "close");
                            },
                            (resultadoN5: Operacion) => {
                              if (!this.isImpresoraZebra) {
                                notify(resultadoN5.mensaje);
                              }
                              my_dialog("", "", "close");
                            }
                          );
                        },
                        (resultadoN4: Operacion) => {
                          if (!this.isImpresoraZebra) {
                            notify(resultadoN4.mensaje);
                          }
                          my_dialog("", "", "close");
                        }
                      );
                    },
                    (resultadoN2: Operacion) => {
                      notify(resultadoN2.mensaje);
                      my_dialog("", "", "close");
                    }
                  );
                } else {
                  this.preguntarSiSeImprimeOrdenDeVenta(
                    this.formatoDePago,
                    () => {
                      this.preguntarSiSeImprimePagoDeOrdenDeVenta(
                        this.formatoDePago,
                        this.esOrdenDeVentaParaCobrar,
                        () => {
                          my_dialog("", "", "close");
                        },
                        (resultadoN5: Operacion) => {
                          if (!this.isImpresoraZebra) {
                            notify(resultadoN5.mensaje);
                          }
                          my_dialog("", "", "close");
                        }
                      );
                    },
                    (resultadoN4: Operacion) => {
                      if (!this.isImpresoraZebra) {
                        notify(resultadoN4.mensaje);
                      }
                      my_dialog("", "", "close");
                    }
                  );
                }
              },
              (resultadoN1: Operacion) => {
                notify(resultadoN1.mensaje);
                my_dialog("", "", "close");
              }
            );
          });
        }
      );
    } else {
      printMacAddress = null;
      navigator.notification.confirm(
        "No tiene impresora asociada. Desea asociar una impresora?",
        respuesta => {
          if (respuesta === 2) {
            $.mobile.changePage("#UiPaginaSeleccionDeImpresora");
          }
        },
        "Sonda® " + SondaVersion,
        <any>"No,Si"
      );
      my_dialog("", "", "close");
    }
  }

  validarFirmaObligatoria(callback: () => void) {
    try {
      this.tareaServicio.obtenerRegla(
        "FirmaObligatoriaEnOrdenDeVenta",
        (listaDeReglas: Regla[]) => {
          if (listaDeReglas.length >= 1) {
            if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
              this.firmaObligatoria = true;
              callback();
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (err) {
      notify("Error al validar si modifica DMG: " + err.message);
    }
  }

  validarFotoObligatoria(callback: () => void) {
    try {
      this.tareaServicio.obtenerRegla(
        "FotografiaObligatoriaEnOrdenDeVenta",
        (listaDeReglas: Regla[]) => {
          if (listaDeReglas.length >= 1) {
            if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
              this.fotoObligatoria = true;
              callback();
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (err) {
      notify("Error al validar si modifica DMG: " + err.message);
    }
  }

  usuarioDeseaReImprimirlaVenta() {
    try {
      if (this.tarea.taskType === TareaTipo.Preventa) {
        this.ordenDeVentaServicio.obtenerFormatoImpresoOrdenDeVenta(
          this.tarea,
          (formato: string) => {
            my_dialog("", "", "close");
            my_dialog("Espere...", "validando impresora", "open");
            const impresionServicio = new ImpresionServicio();
            const printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
            impresionServicio.validarEstadosYImprimir(
              this.isImpresoraZebra,
              printMacAddress,
              formato,
              true,
              (resultado: Operacion) => {
                if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
                  this.ordenDeVenta.timesPrinted += 1;
                  this.ordenDeVentaServicio.actualizarVecesImpresionOrdenDeVenta(
                    this.tarea,
                    this.ordenDeVenta,
                    () => {
                      if (this.ordenDeVenta.timesPrinted === gMaxImpresiones) {
                        let uilistaImprimirPreVenta = $(
                          "#listaImprimirPreVenta"
                        );
                        uilistaImprimirPreVenta.hide();
                        uilistaImprimirPreVenta = null;
                      }
                    },
                    (resultado: Operacion) => {
                      notify(resultado.mensaje);
                    }
                  );
                } else {
                  if (!this.isImpresoraZebra) {
                    notify(resultado.mensaje);
                  }
                }
                my_dialog("", "", "close");
              }
            );
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      }
    } catch (err) {
      notify("Error al reimprimir la venta: " + err.message);
    }
  }

  usuarioDeseaSeleccionarFormaDePago() {
    this.publicarListaDeSkuOrdenDeVenta();

    $.mobile.changePage("UiPagePayment", {
      transition: "flow",
      reverse: true,
      showLoadMsg: false,
      data: {
        cliente: this.cliente,
        tarea: this.tarea,
        configuracionDecimales: this.configuracionDecimales,
        pago: this.pago
      }
    });
  }

  publicarTarea() {
    var msg = new TareaMensaje(this);
    msg.tarea = this.tarea;
    this.mensajero.publish(msg, getType(TareaMensaje));
  }

  publicarListaDeSkuOrdenDeVenta() {
    var msg = new ListaSkuMensaje(this);
    msg.listaSku = this.listaDeSkuDeVenta;
    msg.listaDeSkuParaBonificacion = this.listaDeSkuDeVenta;
    this.mensajero.publish(msg, getType(ListaSkuMensaje));
  }

  publicarPago() {
    var msg = new PagoMensaje(this);
    msg.pago = this.pago;
    this.mensajero.publish(msg, getType(PagoMensaje));
  }

  cargarPantalla() {
    this.esOrdenDeVentaParaCobrar = false;
    this.firmaObligatoria = false;
    this.fotoObligatoria = false;
    if (!this.obtuboGps) {
      ObtenerPosicionGPS(() => {
        this.obtuboGps = true;
        this.obtenerValoresInicialesDePantalla();
      });
    } else {
      this.obtenerValoresInicialesDePantalla();
    }
  }

  limpiarListas() {
    this.listaDeSkuDeVenta.length = 0;
    this.listaSkuOrdenDeVentaPrincipal.length = 0;
    this.listaDeSkuParaBonificacion.length = 0;
    this.listaDeSkuParaBonificacionDeCombo.length = 0;
    this.listaDeBonificacionesPorMontoGeneral.length = 0;
    this.listaDeSkuParaBonificacionParaOrdenDeVenta.length = 0;
  }

  prepararVariablesParaProximaVenta() {
    this.formatoDeOrdenDeVenta = "";
    this.formatoDePago = "";
    this.foto = "";
    this.firma = "";
    this.obtuboGps = false;
    this.limpiarListas();
  }

  publicarCombo() {
    let listaDeSkuParaBonificacionDeCombo: Array<BonoPorCombo> = [];
    let msg = new ListaDeSkuParaBonificacionDeComboMensaje(this);
    msg.listaDeSkuParaBonificacionDeCombo = listaDeSkuParaBonificacionDeCombo;
    this.mensajero.publish(
      msg,
      getType(ListaDeSkuParaBonificacionDeComboMensaje)
    );
  }

  obtenerValoresInicialesDePantalla() {
    this.validarFotoObligatoria(() => {
      this.validarFirmaObligatoria(() => {
        this.validarPedidoTipoCobro(() => {
          this.cargarInformacionResumen(() => {
            let bonificaciones = <Array<Sku>>(
              JSON.parse(JSON.stringify(this.listaDeSkuParaBonificacion))
            );
            this.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(
              bonificaciones,
              this.listaDeBonificacionesPorMontoGeneral,
              this.listaDeSkuParaBonificacionDeCombo,
              (bonosFinales: Array<Sku>) => {
                this.listaDeSkuParaBonificacionParaOrdenDeVenta = bonosFinales;
                this.cargarSkus(() => {
                  let uiListaFormaDePago = $("#UiListaFormaDePago");
                  uiListaFormaDePago.hide();

                  if (this.esOrdenDeVentaParaCobrar) {
                    if (this.cargaPrimeraVez) {
                      notify("Debe de cobrar la orden de venta");
                      this.cargaPrimeraVez = false;
                    }
                    uiListaFormaDePago.show();
                    this.mostrarTipoDePago();
                  }
                  uiListaFormaDePago = null;

                  DesBloquearPantalla();
                });
              },
              (resultado: Operacion) => {
                notify(resultado.mensaje);
              }
            );
          });
        });
      });
    });
  }

  recorrerListaDePromoParaInsertar(
    listaDePromo: Promo[],
    indiceDeLista: number,
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (listaDePromo.length > 0 && listaDePromo.length > indiceDeLista) {
        ObtenerSecuenciaSiguiente(
          TipoDocumento.Promo,
          (serie: string, numeroDeDocumento: number) => {
            let promo = listaDePromo[indiceDeLista];
            promo.docSerie = serie;
            promo.docNum = numeroDeDocumento;
            promo.codeCustomer = this.cliente.clientId;
            promo.codeRoute = gCurrentRoute;
            this.promoServicio.insertarHistoricoDePromo(
              promo,
              () => {
                this.recorrerListaDePromoParaInsertar(
                  listaDePromo,
                  indiceDeLista + 1,
                  () => {
                    callBack();
                  },
                  (resultado: Operacion) => {
                    errCallback(resultado);
                  }
                );
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
            promo = null;
          },
          err => {
            errCallback({
              codigo: -1,
              mensaje: `Error al obtener sequencia de documento: ${err.message}`
            } as Operacion);
          }
        );
      } else {
        callBack();
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al recorrer listado de promo para insertar: ${ex.message}`
      } as Operacion);
    }
  }
}
