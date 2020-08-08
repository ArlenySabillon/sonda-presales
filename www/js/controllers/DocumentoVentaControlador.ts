/// <reference path="../vertical/messenger.ts" />
/// <reference path="../vertical/mensaje.ts" />
/// <reference path="../vertical/ListaSkuParaDenominacionMensaje.ts" />

//------Funciones de lado JavaScriopt

class DocumentoVentaControlador {
  tokenCliente: SubscriptionToken;
  tokenListaSku: SubscriptionToken;
  tokenOrdeDeVentaDraft: SubscriptionToken;
  tokenlistaDeSkuParaBonificacionDeCombo: SubscriptionToken;
  tokenListaDeSkuParaBonificacionDeComboInicioDeVenta: SubscriptionToken;
  tokenSocketIo: SubscriptionToken;

  clienteServicio = new ClienteServicio();
  tareaServicio = new TareaServcio();
  ordenDeVentaServicio = new OrdenDeVentaServicio();
  configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
  razonServicio = new RazonServicio();
  encuestaServicio: EncuestaServicio = new EncuestaServicio();

  cliente: Cliente;
  listaDeSkuOrdenDeVenta: Sku[] = [];
  tarea: Tarea;
  ordenDeVentaDraft: OrdenDeVenta;
  seCargoDatosDraft: boolean = false;
  estadoDeTareaAnterior: string;
  configuracionDecimales: ManejoDeDecimales;

  bonoServicio = new BonoServicio();
  listaDeSkuParaBonificacion = Array<Sku>();
  descuentoServicio = new DescuentoServicio();
  permiterRegregarPantallaAnterior: boolean = true;

  esPrimerMensajeDeDescuento: boolean = true;

  listaDeSkuParaBonificacionDeCombo = Array<BonoPorCombo>();

  descuentoPorMontoGeneral: DescuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
  usuarioPuedeModificarDescuento = false;

  usuarioYaColocoDescuento: boolean = false;
  usuarioPuedeModificarBonificacionDeCombo: boolean = false;
  esPrimeraVez = true;
  listaDeBonificacionesPorMontoGeneral = new Array<BonoPorMontoGeneral>();
  promoServicio: PromoServicio = new PromoServicio();
  socketIo: SocketIOClient.Socket;
  listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[] = [];
  listaDeDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago[] = [];
  listaHistoricoDePromos: Array<Promo> = [];
  listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento> = [];
  aplicaReglaDeValidacionDeLimiteDeCredito: boolean = false;

  draftServicio: DraftServicio = new DraftServicio();
  impresionServicio: ImpresionServicio = new ImpresionServicio();

  constructor(public mensajero: Messenger) {
    this.obtenerConfiguracionDeDecimales();
    this.tokenSocketIo = mensajero.subscribe<SocketIoMensaje>(
      this.socketIoEntregado,
      getType(SocketIoMensaje),
      this
    );
    this.tokenCliente = mensajero.subscribe<ClienteMensaje>(
      this.clienteEntregado,
      getType(ClienteMensaje),
      this
    );
    this.tokenListaSku = mensajero.subscribe<ListaSkuMensaje>(
      this.listaSkuEntregado,
      getType(ListaSkuMensaje),
      this
    );
    this.tokenOrdeDeVentaDraft = mensajero.subscribe<OrdenDeVentaDraftMensaje>(
      this.ordenDeVentaDraftEntregado,
      getType(OrdenDeVentaDraftMensaje),
      this
    );
    this.tokenlistaDeSkuParaBonificacionDeCombo = mensajero.subscribe<
      BonoPorComboMensaje
    >(
      this.listaDeSkuParaBonificacionDeComboEntregado,
      getType(BonoPorComboMensaje),
      this
    );
    this.tokenListaDeSkuParaBonificacionDeComboInicioDeVenta = mensajero.subscribe<
      ListaDeSkuParaBonificacionDeComboMensaje
    >(
      this.listaDeSkuParaBonificacionDeComboInicioDeVentaEntregado,
      getType(ListaDeSkuParaBonificacionDeComboMensaje),
      this
    );
  }

  delegarDocumentoControlador() {
    var este: DocumentoVentaControlador = this;
    document.addEventListener(
      "backbutton",
      () => {
        este.usuarioDeseaRegresarAPaginaAnterior();
      },
      true
    );
    document.addEventListener(
      "menubutton",
      () => {
        este.usuarioDeseaVerListaSku();
      },
      true
    );

    $(document).on("pagebeforechange", (event, data) => {
      if (data.toPage === "pos_skus_page") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.configuracionDecimales = data.options.data.configuracionDecimales;
        este.esPrimeraVez = data.options.data.esPrimeraVez;

        este.limpiarListas(este, () => {
          este.cargarPantalla(este);
          $.mobile.changePage("#pos_skus_page");
        });
      }
      if (data.toPage === "skus_list_page") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.configuracionDecimales = data.options.data.configuracionDecimales;
        este.esPrimeraVez = data.options.data.esPrimeraVez;
      }
    });

    $("#pos_skus_page").on("pageshow", () => {
      este.bonoServicio.validarSiModificaBonificacionPorCombo(
        (puedeModificar: boolean) => {
          este.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
          este.esPrimerMensajeDeDescuento = true;
          este.validarFotoYTareaSinGestion(este);
          este.establecerTotalOrdenDeVenta(este);
          este.prepararReglaDeValidacionDeLimiteDeCredito();
          InteraccionConUsuarioServicio.desbloquearPantalla();
        },
        (resultado: Operacion) => {
          este.usuarioPuedeModificarBonificacionDeCombo = false;
          notify(
            "Error al validar si puede modificar la bonificacion por combo: " +
              resultado.mensaje
          );
        }
      );
    });

    $("#uiShowMenuPosSkuPage").bind("touchstart", () => {
      este.publicarDatos();
      este.mostrorPantallaListaSku();
    });

    $("#pos_skus_page").on("click", "#pos_skus_page_listview li", event => {
      var esCombo: any = (<any>event).currentTarget.attributes["esCombo"]
        .nodeValue;
      if (esCombo === "1") {
        this.limpiarListaDeSku(
          () => {
            var id: any = (<any>event).currentTarget.attributes["id"].nodeValue;
            // tslint:disable-next-line: radix
            este.obtenerCombo(parseInt(id));
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      }
    });

    $("#pos_skus_page").on("click", "#pos_skus_page_listview a", event => {
      let id: any = (<any>event).currentTarget.attributes["id"].nodeValue;
      if (id !== "") {
        let propiedades: any = id.split("|");

        if (OpcionEnListadoDePedido.Modificar.toString() === propiedades[0]) {
          este.obtenerSku(propiedades[1], propiedades[2]);
        } else {
          este.esPrimerMensajeDeDescuento = true;
          este.usuarioDeseaEliminarSku(propiedades[1], propiedades[2]);
        }
      }
    });

    $("#UiBotonCalularDescuento").bind("touchstart", () => {
      este.esPrimerMensajeDeDescuento = true;
      este.usuarioDeseaCalcularDescuento(este);
    });

    $("#panelTotalSKU").bind("touchstart", () => {
      este.usuarioDeseaFinalizarOrdenDeVenta();
    });

    $("#UiBotonGuardarVentaDraft").bind("touchstart", () => {
      este.usuarioDeseaGuardarDraft();
    });

    $("#UiBotonCancelarVentaDraft").bind("touchstart", () => {
      este.usuarioDeseaCancelarDraft();
    });

    $("#uiBtnInfoOrdenDeVenta").bind("touchstart", () => {
      este.usuarioDeseaVerInformacionDeOrdenDeVenta();
    });

    $("#uiAceptarCambiosInfoOrdenDeVenta").bind("touchstart", () => {
      este.usuarioDeseaRetornarAOrdenDeVenta();
    });

    $("#UiBotonCambiosEnCliente").bind("touchstart", () => {
      este.usuarioDeseaModificarCliente();
    });

    $("#UiComentarioDeOrdenDeVenta").keyup(() => {
      este.mostrarCaracteresRestantes();
    });

    $("#uiBotonListadoDeSkus").bind("touchstart", () => {
      este.usuarioDeseaVerlistadoDeSkus();
    });
  }

  limpiarListaDeSku(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      let skulist = $("#pos_skus_page_listview");
      skulist.children().remove("li");
      skulist = null;
      callback();
    } catch (err) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: "Error al limpiar el listado de sku " + err.mensaje
      });
    }
  }

  delegarSockets() {
    this.socketIo.on("GetCurrentAccountByCustomer_Request", data => {
      switch (data.option) {
        case OpcionRespuesta.Exito:
          my_dialog("", "", "close");
          console.log("Validando Saldo desde: " + data.source);
          switch (data.source) {
            case OpcionValidarSaldoCliente.FinalizarDocumento:
              if (gTaskType === TareaTipo.Preventa) {
                if (
                  $("#FechaEntrega").val() === "" ||
                  !ValidarFechaDeEntrega(
                    ObtenerFecha(),
                    $("#FechaEntrega").val()
                  )
                ) {
                  notify("ERROR, Tiene que indicar una fecha correcta.");
                  return;
                }
              }
              this.finalizarOrdenDeVenta();

              this.limpiarComentario();
              break;
          }
          break;
        case OpcionRespuesta.Error:
          my_dialog("", "", "close");
          notify("Error al validar saldo del cliente: " + <string>data.message);
          console.log("Error al validar saldo del cliente: " + data.message);
          break;
        case OpcionRespuesta.Recibido:
          console.log("Validando saldo del cliente");
          break;
      }
    });
  }

  socketIoEntregado(mensaje: SocketIoMensaje, subscriber: any) {
    subscriber.socketIo = mensaje.socket;
    subscriber.delegarSockets();
  }

  usuarioDeseaVerlistadoDeSkus() {
    this.limpiarListaDeSku(
      () => {
        my_dialog("Preparando Sku", "Espere...", "open");
        this.publicarDatos();
        this.mostrorPantallaListaSku();
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  usuarioDeseaVerListaSku() {
    switch ($.mobile.activePage[0].id) {
      case "pos_skus_page":
        my_dialog("Preparando Sku", "Espere...", "open");
        this.publicarDatos();
        this.mostrorPantallaListaSku();
        break;
    }
  }

  usuarioDeseaRegresarAPaginaAnterior() {
    switch ($.mobile.activePage[0].id) {
      case "pos_skus_page":
        this.validarFecha(() => {
          if (this.permiterRegregarPantallaAnterior) {
            this.finalizarTareaSinGestion(() => {});
          }
        });
        break;
      case "pos_skus_inofrmation_page":
        this.usuarioDeseaRetornarAOrdenDeVenta();
        break;
    }
  }

  obtenerFechaFormato(fecha: string, agregarDia: boolean): string {
    let date = new Date(fecha);
    let anio = date.getFullYear().toString();
    let mes = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    let dia = (date.getDate() + (agregarDia ? 1 : 0)).toString();
    // let resultado =
    //   anio +
    //   "/" +
    //   (mes[1] ? mes : "0" + mes[0]) +
    //   "/" +
    //   (dia[1] ? dia : "0" + dia[0]); // padding

    let resultado =
      anio +
      "-" +
      (mes[1] ? mes : "0" + mes[0]) +
      "-" +
      (dia[1] ? dia : "0" + dia[0]); // padding
    return resultado;
  }

  usuarioDeseaFinalizarOrdenDeVenta() {
    try {
      if (this.cliente.totalAmout <= 0) {
        this.finalizarTareaSinGestion(() => {});
      } else {
        if (
          this.cliente.cuentaCorriente.limiteDeCredito > 0 &&
          this.aplicaReglaDeValidacionDeLimiteDeCredito
        ) {
          let totalDeVenta = this.obtenerTotalDeOrdenDeVenta(
            this.cliente.appliedDiscount,
            this.listaDeSkuOrdenDeVenta
          );

          if (this.cliente.outStandingBalance < totalDeVenta) {
            notify(
              "ERROR, No tiene credito sufiente para esta venta, disponible: " +
                DarFormatoAlMonto(
                  format_number(
                    this.cliente.outStandingBalance,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )
                )
            );
            return;
          }
        }

        this.validarConfiguracionDeBonificacionPorCombos(
          () => {
            let uiComentarioDeOrdenDeVenta = $("#UiComentarioDeOrdenDeVenta");
            this.cliente.salesComment = uiComentarioDeOrdenDeVenta.val();
            uiComentarioDeOrdenDeVenta = null;

            this.esPrimerMensajeDeDescuento = true;
            this.calcularDescuento(
              this,
              () => {
                this.tareaServicio.obtenerRegla(
                  "AplicarReglasComerciales",
                  (listaDeReglasAplicarReglasComerciales: Regla[]) => {
                    if (
                      listaDeReglasAplicarReglasComerciales.length > 0 &&
                      listaDeReglasAplicarReglasComerciales[0].enabled.toUpperCase() ===
                        "SI"
                    ) {
                      this.tareaServicio.obtenerRegla(
                        "ValidarConServidorAntiguedadDeSaldos",
                        (
                          listaDeReglasValidarConServidorAntiguedadDeSaldos: Regla[]
                        ) => {
                          if (
                            gIsOnline === EstaEnLinea.No ||
                            (listaDeReglasValidarConServidorAntiguedadDeSaldos.length ===
                              0 ||
                              listaDeReglasValidarConServidorAntiguedadDeSaldos[0].enabled.toUpperCase() ===
                                "NO")
                          ) {
                            var listaSku: Sku[] = [];

                            this.clienteServicio.validarCuentaCorriente(
                              this.cliente,
                              listaSku,
                              this.tarea.salesOrderType,
                              this.configuracionDecimales,
                              (cliente: Cliente) => {
                                if (
                                  this.tarea.taskType === TareaTipo.Preventa
                                ) {
                                  if (
                                    $("#FechaEntrega").val() === "" ||
                                    !ValidarFechaDeEntrega(
                                      ObtenerFecha(),
                                      $("#FechaEntrega").val()
                                    )
                                  ) {
                                    notify(
                                      "ERROR, Tiene que indicar una fecha correcta."
                                    );
                                    return;
                                  }
                                }
                                this.finalizarOrdenDeVenta();
                                this.limpiarComentario();
                              },
                              (resultado: Operacion) => {
                                notify(resultado.mensaje);
                              }
                            );
                          } else {
                            this.clienteServicio.enviarSolicitudParaObtenerCuentaCorriente(
                              this.socketIo,
                              this.cliente,
                              OpcionValidarSaldoCliente.FinalizarDocumento,
                              this.tarea.salesOrderType,
                              (cliente: Cliente) => {
                                //----
                              },
                              (resultado: Operacion) => {
                                notify(resultado.mensaje);
                                my_dialog("", "", "closed");
                              }
                            );
                          }
                        },
                        (resultado: Operacion) => {
                          notify(resultado.mensaje);
                          my_dialog("", "", "closed");
                        }
                      );
                    } else {
                      this.finalizarOrdenDeVenta();
                      this.limpiarComentario();
                    }
                  },
                  (resultado: Operacion) => {
                    notify(resultado.mensaje);
                    my_dialog("", "", "closed");
                  }
                );
              },
              (resultado: Operacion) => {
                if (this.esPrimerMensajeDeDescuento) notify(resultado.mensaje);
                my_dialog("", "", "closed");
              }
            );
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      }
    } catch (err) {
      notify("Error al finalizar la orden de venta: " + err.message);
    }
  }

  finalizarOrdenDeVenta() {
    try {
      navigator.notification.confirm(
        "Desea finalizar el documento?",
        buttonIndex => {
          if (buttonIndex === 2) {
            my_dialog("", "", "close");
            var uiFechaEntrega = $("#FechaEntrega");
            this.cliente.deliveryDate = uiFechaEntrega.val();
            uiFechaEntrega = null;
            this.mostarResumenDeOrdenDeVenta();
          }
        },
        "Sonda® " + SondaVersion,
        <any>"No,Si"
      );
    } catch (err) {
      notify("Error al finalizar la orden de venta: " + err.message);
    }
  }

  finalizarTareaSinGestion(errorCallback: () => void) {
    try {
      navigator.notification.confirm(
        "Desea finalizar la tarea sin gestion?",
        buttonIndex => {
          if (buttonIndex === 2) {
            my_dialog("", "", "close");
            var tipoDeRazon: string = "";

            switch (this.tarea.taskType) {
              case TipoTarea.Preventa.toString():
                tipoDeRazon = TipoDeRazon.OrdenDeVenta.toString();
                break;
            }

            this.razonServicio.obtenerRazones(
              tipoDeRazon,
              (razones: Razon[]) => {
                var listadoDeRazones = [];
                for (var i = 0; i < razones.length; i++) {
                  listadoDeRazones.push({
                    text: razones[i].reasonValue,
                    value: razones[i].reasonValue
                  });
                }

                var config = {
                  title: "Razones",
                  items: listadoDeRazones,
                  doneButtonLabel: "Ok",
                  cancelButtonLabel: "Cancelar"
                };

                ListPicker(
                  config,
                  item => {
                    let procesarOrdenDeVentaDeCliente = () => {
                      ObtenerPosicionGPS(() => {
                        this.tarea.completedSuccessfully = false;
                        this.tarea.reason = item;
                        this.tarea.taskStatus = TareaEstado.Completada;
                        this.tareaServicio.actualizarTareaEstado(
                          this.tarea,
                          () => {
                            actualizarListadoDeTareas(
                              this.tarea.taskId,
                              this.tarea.taskType,
                              TareaEstado.Completada,
                              this.cliente.clientId,
                              this.cliente.clientName,
                              this.cliente.address,
                              0,
                              TareaEstado.Aceptada,
                              this.cliente.rgaCode
                            );

                            $.mobile.changePage("#pickupplan_page", {
                              transition: "flow",
                              reverse: true,
                              showLoadMsg: false
                            });

                            EnviarData();

                            this.limpiarComentario();
                            this.listaDeSkuOrdenDeVenta.length = 0;
                          },
                          (resultado: Operacion) => {
                            notify(
                              "Error al actualizar la tarea: " +
                                resultado.mensaje
                            );
                          }
                        );
                      });
                    };

                    var encuestasAEjecutarEnFinalizacionDeTarea: Microencuesta[] = this.encuestaServicio.filtrarEncuestasPorDisparador(
                      this.tarea.microsurveys,
                      DisparadorDeEncuesta.FinDeTarea
                    );

                    if (
                      encuestasAEjecutarEnFinalizacionDeTarea &&
                      encuestasAEjecutarEnFinalizacionDeTarea.length > 0
                    ) {
                      BloquearPantalla();
                      this.encuestaServicio.procesarEncuestasDeCliente(
                        encuestasAEjecutarEnFinalizacionDeTarea,
                        0,
                        this.tarea.hasDraft,
                        procesarOrdenDeVentaDeCliente,
                        (error: Operacion) => {
                          notify(error.mensaje);
                        }
                      );

                      let timeOut = setTimeout(() => {
                        $.mobile.changePage("#UiSurveyPage", {
                          transition: "flow",
                          reverse: true,
                          showLoadMsg: false
                        });
                        clearTimeout(timeOut);
                      }, 1000);
                    } else {
                      procesarOrdenDeVentaDeCliente();
                    }
                  },
                  () => {
                    errorCallback();
                  }
                );
              },
              (resultado: Operacion) => {
                notify("Error al obtener las razones: " + resultado.mensaje);
              }
            );
          } else {
            errorCallback();
          }
        },
        "Sonda® " + SondaVersion,
        <any>"No,Si"
      );
    } catch (err) {
      notify("Error al obtener razones: " + err.message);
    }
  }

  mostarResumenDeOrdenDeVenta() {
    EstaGpsDesavilitado(() => {
      BloquearPantalla();
      this.limpiarListaDeSku(
        () => {
          if (this.descuentoPorMontoGeneral.apply) {
            let promo: Promo = new Promo();
            promo.promoId = this.descuentoPorMontoGeneral.promoId;
            promo.promoName = this.descuentoPorMontoGeneral.promoName;
            promo.promoType = this.descuentoPorMontoGeneral.promoType;
            promo.frequency = this.descuentoPorMontoGeneral.frequency;
            this.listaDeSkuOrdenDeVenta[0].listPromo.push(promo);
            promo = null;
          }

          this.listaDeSkuOrdenDeVenta.map((sku: Sku) => {
            let descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
            let descuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();

            let resultadoDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (this
              .listaDeDescuentoPorMontoGeneralYFamilia as any).find(
              (descuentoABuscar: DescuentoPorMontoGeneralYFamilia) => {
                return descuentoABuscar.codeFamily === sku.codeFamilySku;
              }
            );

            if (resultadoDescuentoPorMontoGeneralYFamilia) {
              descuentoPorMontoGeneralYFamilia = resultadoDescuentoPorMontoGeneralYFamilia;
            }

            let resultadoDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (this
              .listaDeDescuentoPorFamiliaYTipoPago as any).find(
              (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
                return descuentoABuscar.codeFamily === sku.codeFamilySku;
              }
            );
            if (resultadoDescuentoPorFamiliaYTipoPago) {
              descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
            }

            sku.totalCD = this.descuentoServicio.aplicarLosDescuentos(
              sku,
              sku.isUniqueDiscountScale,
              this.listaDeOrdenAplicarDescuentos,
              descuentoPorMontoGeneralYFamilia,
              descuentoPorFamiliaYTipoPago
            );
          });

          $.mobile.changePage("SalesOrderSummaryPage", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false,
            data: {
              cliente: this.cliente,
              tarea: this.tarea,
              configuracionDecimales: this.configuracionDecimales,
              listaSku: this.listaDeSkuOrdenDeVenta,
              listaDeSkuParaBonificacion: this.listaDeSkuParaBonificacion,
              listaDeSkuParaBonificacionDeCombo: this
                .listaDeSkuParaBonificacionDeCombo,
              usuarioPuedeModificarBonificacionDeCombo: this
                .usuarioPuedeModificarBonificacionDeCombo,
              listaDeBonificacionesPorMontoGeneral: this
                .listaDeBonificacionesPorMontoGeneral,
              listaDeDescuentoPorMontoGeneralYFamilia: this
                .listaDeDescuentoPorMontoGeneralYFamilia,
              listaDeDescuentoPorFamiliaYTipoPago: this
                .listaDeDescuentoPorFamiliaYTipoPago,
              listaDeOrdenAplicarDescuentos: this.listaDeOrdenAplicarDescuentos
            }
          });
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    });
  }

  establecerDescuentoClienteEnEtiqueta() {
    var porcentajeDescuento = $("#UiPorcentajeDeDescuento");
    porcentajeDescuento.attr(
      "placeholder",
      "Descuento disponible: " + this.cliente.discountMax + "%"
    );
    porcentajeDescuento = null;
  }

  obtenerSku(idSku: string, packUnit: string): void {
    try {
      let listarSku: Sku[] = [];
      let listaDeSkuParaBonificacion: Sku[] = Array<Sku>();
      this.listaDeSkuOrdenDeVenta.map((sku, index, array) => {
        if (sku.sku === idSku) {
          sku.unidadMedidaSeleccionada = packUnit;
          sku.modificando = true;
          sku.originalDiscount = sku.appliedDiscount;
          listarSku.push(sku);
        }
      });

      listarSku.map(lSku => {
        this.tarea.salesOrderTotal = this.obtenerTotalParaEnviar(
          this.listaDeSkuOrdenDeVenta,
          lSku
        );
        this.obtenerBonificacionPorUnidad(lSku, listaDeSkuParaBonificacion);
      });

      this.limpiarListaDeSku(
        () => {
          $.mobile.changePage("skucant_page", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false,
            data: {
              cliente: this.cliente,
              tarea: this.tarea,
              configuracionDecimales: this.configuracionDecimales,
              sku: listarSku.length > 0 ? listarSku[0] : null,
              listaSku: listarSku,
              estaAgregando: false,
              listaDeSkuParaBonificacion: listaDeSkuParaBonificacion,
              listaDeSkuOrdenDeVenta: this.listaDeSkuOrdenDeVenta
            }
          });
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (err) {
      notify(`Error al obtener sku: ${err.message}`);
    }
  }

  eliminarSku(
    idSku: string,
    packUnit: string,
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      for (var i = 0; i < this.listaDeSkuOrdenDeVenta.length; i++) {
        var sku = this.listaDeSkuOrdenDeVenta[i];
        if (sku.sku === idSku && sku.codePackUnit === packUnit) {
          this.listaDeSkuOrdenDeVenta.splice(i, 1);
          this.establecerTotalOrdenDeVenta(this);

          var tieneMasUnidades = false;
          for (var j = 0; j < this.listaDeSkuOrdenDeVenta.length; j++) {
            var skuTemp = this.listaDeSkuOrdenDeVenta[j];
            if (
              sku.sku === skuTemp.sku &&
              sku.codePackUnit !== skuTemp.codePackUnit
            ) {
              tieneMasUnidades = true;
              break;
            }
          }
          if (!tieneMasUnidades) {
            var listaSku: Sku[] = [];
            listaSku.push(sku);
          }

          //-----Borra las bonificaciones el sku y la unidad de medida
          for (
            let indice = 0;
            indice < this.listaDeSkuParaBonificacion.length;
            indice++
          ) {
            if (
              idSku === this.listaDeSkuParaBonificacion[indice].parentCodeSku &&
              packUnit ===
                this.listaDeSkuParaBonificacion[indice].parentCodePackUnit
            ) {
              this.listaDeSkuParaBonificacion.splice(indice, 1);
              indice--;
            }
          }

          callback();
          break;
        }
      }
    } catch (err) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: "Error al eliminar sku: " + err.mensaje
      });
    }
  }

  publicarAgregarOQuitarDelistaSkuMensaje(listaSku: Sku[]) {
    var msg = new AgregarOQuitarDeListaSkuMensaje(this);
    msg.listaSku = listaSku;
    msg.agregarSku = true;
    msg.quitarSku = false;
    this.mensajero.publish(msg, getType(AgregarOQuitarDeListaSkuMensaje));
  }

  usuarioDeseaEliminarSku(idSku: string, packUnit: string) {
    try {
      navigator.notification.confirm(
        "Confirma remover de la lista al SKU " + idSku + "?", // message
        buttonIndex => {
          if (buttonIndex === 2) {
            this.eliminarSku(
              idSku,
              packUnit,
              () => {
                this.obtenerBonificacionesPorComboEnListado(() => {
                  this.cargarListaSku();
                });
              },
              (resultado: Operacion) => {
                notify(resultado.mensaje);
              }
            );
          }
        }, // callback to invoke with index of button pressed
        "Sonda® " + SondaVersion, // title
        <any>"No,Si" // buttonLabels
      );
    } catch (err) {
      notify("Error al eliminar sku: " + err.mensaje);
    }
  }

  publicarDatos() {
    try {
      this.cliente.skus = "";
      this.listaDeSkuOrdenDeVenta.map(sku => {
        if (this.cliente.skus === "") {
          this.cliente.skus += `'${sku.sku}'`;
        } else {
          this.cliente.skus += `,'${sku.sku}'`;
        }
      });
    } catch (err) {
      notify("Error al publicar datos: " + err.message);
    }
  }

  mostrorPantallaListaSku() {
    $.mobile.changePage("skus_list_page", {
      transition: "none",
      reverse: true,
      showLoadMsg: false,
      data: {
        cliente: this.cliente,
        tarea: this.tarea,
        configuracionDecimales: this.configuracionDecimales,
        esPrimeraVez: this.esPrimeraVez,
        listaDeSkuOrdenDeVenta: this.listaDeSkuOrdenDeVenta
      }
    });
  }

  cargarTarea() {
    try {
      this.tarea = new Tarea();
      this.tarea.taskId = gtaskid;
      this.tarea.taskType = gTaskType;
      this.tarea.salesOrderType = gSalesOrderType;
      this.tarea.taskStatus = TareaEstado.Aceptada;
      this.tarea.completedSuccessfully = true;
      this.tarea.reason = "Genero Gestion";
      this.tarea.hasDraft =
        this.ordenDeVentaDraft &&
        (this.ordenDeVentaDraft.ordenDeVentaDetalle !== undefined
          ? this.ordenDeVentaDraft.ordenDeVentaDetalle.length !== 0
          : false);
      if (this.tarea.hasDraft) {
        this.tarea.salesOrderIdDraft = this.ordenDeVentaDraft.salesOrderId;
        this.tarea.salesOrderDocSerieDraft = this.ordenDeVentaDraft.docSerie;
        this.tarea.salesOrderDocNumDraft = this.ordenDeVentaDraft.docNum;
        if (!this.seCargoDatosDraft) {
          var porcentajeDescuento = $("#UiPorcentajeDeDescuento");
          if (parseInt(this.ordenDeVentaDraft.discount.toString()) === 0) {
            porcentajeDescuento.val("");
          } else {
            porcentajeDescuento.val(this.ordenDeVentaDraft.discount);
          }
          porcentajeDescuento = null;

          var uiFechaEntrega = $("#FechaEntrega");
          uiFechaEntrega.val(
            this.obtenerFechaFormato(
              this.ordenDeVentaDraft.deliveryDate.toString(),
              this.ordenDeVentaDraft.salesOrderId > 0
            )
          );
          uiFechaEntrega = null;

          this.seCargoDatosDraft = true;
        }
      }
      this.estadoDeTareaAnterior = gtaskStatus;
      let cliente = new Cliente();
      cliente.clientId = gClientID;

      cliente = this.cliente || cliente;

      this.encuestaServicio.obtenerEncuestas(
        cliente,
        (encuestas: Microencuesta[]) => {
          this.tarea.microsurveys = encuestas;
        },
        (error: Operacion) => {
          notify(error.mensaje);
        }
      );
    } catch (err) {
      notify("Error al cargar la Tarea: " + err.mensaje);
    }
  }

  mostrarCliente() {
    alert(this.cliente.clientName);
  }

  clienteEntregado(mensaje: ClienteMensaje, subcriber: any): void {
    subcriber.cliente = mensaje.cliente;
  }

  listaSkuEntregado(mensaje: ListaSkuMensaje, subcriber: any): void {
    var lstSkuTemp: Sku[] = [];

    if (mensaje.listaSku.length === 0) {
      subcriber.limpiarListas(subcriber, () => {});
    } else {
      //----Borrar todas las bonificaciones del sku
      let listaDeSkuParaBonificacion = <Array<Sku>>(
        JSON.parse(JSON.stringify(mensaje.listaDeSkuParaBonificacion))
      );
      subcriber.listaDeSkuParaBonificacion = subcriber.listaDeSkuParaBonificacion.filter(
        sku => {
          return mensaje.listaSku[0].sku !== sku.parentCodeSku;
        }
      );

      mensaje.listaDeSkuParaBonificacion = <Array<Sku>>(
        JSON.parse(JSON.stringify(listaDeSkuParaBonificacion))
      );

      //----Agregamos las nuevas bonificaciones del sku
      for (let skuParaBonificar of mensaje.listaDeSkuParaBonificacion) {
        subcriber.listaDeSkuParaBonificacion.push(skuParaBonificar);
      }

      //-----Validar si exite para su actualizacion o eliminacion
      subcriber.listaDeSkuOrdenDeVenta.map((skuFiltrado: Sku) => {
        if (skuFiltrado.sku === mensaje.listaSku[0].sku) {
          skuFiltrado.deleted = true;
          let resultadoDeBusqueda = mensaje.listaSku.filter((sku: Sku) => {
            return sku.codePackUnit === skuFiltrado.codePackUnit;
          });
          if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
            if (
              resultadoDeBusqueda[0].qty > 0 &&
              !isNaN(resultadoDeBusqueda[0].qty)
            ) {
              skuFiltrado.qty = trunc_number(
                resultadoDeBusqueda[0].qty,
                subcriber.configuracionDecimales.defaultCalculationsDecimals
              );
              skuFiltrado.total = trunc_number(
                resultadoDeBusqueda[0].qty * resultadoDeBusqueda[0].cost,
                subcriber.configuracionDecimales.defaultCalculationsDecimals
              );
              skuFiltrado.appliedDiscount =
                resultadoDeBusqueda[0].appliedDiscount;
              skuFiltrado.discount = resultadoDeBusqueda[0].discount;
              skuFiltrado.discountType = resultadoDeBusqueda[0].discountType;
              skuFiltrado.cost = resultadoDeBusqueda[0].cost;
              skuFiltrado.listPromo = resultadoDeBusqueda[0].listPromo;
              skuFiltrado.deleted = false;
            }
          }
          resultadoDeBusqueda = null;
        }
      });

      mensaje.listaSku.map((skuFiltrado: Sku) => {
        let seAgregarSku = true;
        for (let sku of subcriber.listaDeSkuOrdenDeVenta as Array<Sku>) {
          if (
            sku.sku === skuFiltrado.sku &&
            sku.codePackUnit === skuFiltrado.codePackUnit
          ) {
            seAgregarSku = false;
          }
        }
        if (seAgregarSku) {
          subcriber.listaDeSkuOrdenDeVenta.push(skuFiltrado);
        }
      });

      subcriber.listaDeSkuOrdenDeVenta = subcriber.listaDeSkuOrdenDeVenta.filter(
        sku => {
          return sku.deleted === false;
        }
      );

      subcriber.publicarDatos();
      subcriber.obtenerBonificacionesPorComboEnListado(() => {});
    }
  }

  listaDeSkuParaBonificacionDeComboEntregado(
    mensaje: BonoPorComboMensaje,
    subcriber: any
  ): void {
    subcriber.listaDeSkuParaBonificacionDeCombo[mensaje.indice] =
      mensaje.bonoPorCombo;
  }

  listaDeSkuParaBonificacionDeComboInicioDeVentaEntregado(
    mensaje: ListaDeSkuParaBonificacionDeComboMensaje,
    subcriber: any
  ): void {
    subcriber.EsPrimerMensajeDeDescuento = true;
    subcriber.listaDeSkuParaBonificacionDeCombo =
      mensaje.listaDeSkuParaBonificacionDeCombo;

    subcriber.usuarioYaColocoDescuento = false;
  }

  cancelarSuscripcion() {
    this.mensajero.unsubscribe(this.tokenCliente.guid, getType(ClienteMensaje));
  }

  publicarCombo(indice) {
    var msg = new BonoPorComboMensaje(this);
    msg.bonoPorCombo = this.listaDeSkuParaBonificacionDeCombo[indice];
    msg.indice = indice;
    this.mensajero.publish(msg, getType(BonoPorComboMensaje));
  }

  cargarListaSku() {
    try {
      my_dialog("Sonda® " + SondaVersion, "Cargando Sku...", "open");
      let usarMaximaBonificacion =
        localStorage.getItem("USE_MAX_BONUS") === "1";
      let cantidadSinDetalle = 0;
      let skulist = $("#pos_skus_page_listview");
      skulist.children().remove("li");
      this.obtenerDescuentosPorMontoYFamiliaYTipoPago(
        () => {
          this.cargarBonificacionesPorMontoGeneral(
            () => {
              if (this.listaDeSkuOrdenDeVenta.length > 0) {
                for (
                  let j = 0;
                  j < this.listaDeSkuParaBonificacionDeCombo.length;
                  j++
                ) {
                  if (
                    this.listaDeSkuParaBonificacionDeCombo[j].skusDeBonoPorCombo
                      .length > 0
                  ) {
                    let liPorCombo = `<li LineSeq='${j.toString()}' esCombo='1' id='${
                      this.listaDeSkuParaBonificacionDeCombo[j].comboId
                    }' data-filtertext='${
                      this.listaDeSkuParaBonificacionDeCombo[j].comboId
                    } ${
                      this.listaDeSkuParaBonificacionDeCombo[j].nameCombo
                    }' style='padding:5px; background-color:#1a8dff'>`;
                    liPorCombo +=
                      "<a class='ui-alt-icon ui-shadow ui-nodisc-icon' href='#' id=''>";
                    liPorCombo +=
                      "<h4>" +
                      this.listaDeSkuParaBonificacionDeCombo[j].nameCombo +
                      " - " +
                      (this.listaDeSkuParaBonificacionDeCombo[j]
                        .bonusSubType ===
                      SubTipoDeBonificacionPorCombo.Unica.toString()
                        ? DescripcionSubTipoDeBonificacionPorCombo.Unica.toString()
                        : DescripcionSubTipoDeBonificacionPorCombo.Multiple.toString()) +
                      "</h4>";

                    if (this.listaDeSkuParaBonificacionDeCombo[j].isConfig) {
                      if (this.listaDeSkuParaBonificacionDeCombo[j].isEmpty) {
                        liPorCombo += `<span class='small-roboto'>Se configuro el combo para que no bonifique</span><br/>`;
                      } else {
                        for (let skuParaBonificacionDeCombo of this
                          .listaDeSkuParaBonificacionDeCombo[j]
                          .skusDeBonoPorComboAsociados) {
                          liPorCombo += `<span class='small-roboto'>Bonificación: ${skuParaBonificacionDeCombo.descriptionSku}</span><br/>`;
                          if (
                            skuParaBonificacionDeCombo.selectedQty >
                            skuParaBonificacionDeCombo.qty
                          ) {
                            skuParaBonificacionDeCombo.selectedQty =
                              skuParaBonificacionDeCombo.qty;
                          } else {
                            if (
                              !this.usuarioPuedeModificarBonificacionDeCombo
                            ) {
                              skuParaBonificacionDeCombo.selectedQty =
                                skuParaBonificacionDeCombo.qty;
                            }
                          }
                          liPorCombo += `<span class='small-roboto'>Cod. SKU: ${skuParaBonificacionDeCombo.codeSku} UM.: ${skuParaBonificacionDeCombo.codePackUnit} Cant.: ${skuParaBonificacionDeCombo.selectedQty}</span><br/>`;
                        }
                      }
                    } else {
                      if (
                        this.listaDeSkuParaBonificacionDeCombo[j]
                          .bonusSubType ===
                          SubTipoDeBonificacionPorCombo.Unica.toString() &&
                        this.listaDeSkuParaBonificacionDeCombo[j]
                          .skusDeBonoPorCombo.length > 1
                      ) {
                        liPorCombo += `<span class='small-roboto'>No se ha configurado la Bonificación</span><br/>`;
                      } else {
                        if (
                          this.usuarioPuedeModificarBonificacionDeCombo &&
                          usarMaximaBonificacion === false
                        ) {
                          liPorCombo += `<span class='small-roboto'>Se configuro el combo para que no bonifique</span><br/>`;
                        } else {
                          for (let skuParaBonificacionDeCombo of this
                            .listaDeSkuParaBonificacionDeCombo[j]
                            .skusDeBonoPorCombo) {
                            liPorCombo += `<span class='small-roboto'>Bonificación: ${skuParaBonificacionDeCombo.descriptionSku}</span><br/>`;
                            if (
                              skuParaBonificacionDeCombo.selectedQty >
                              skuParaBonificacionDeCombo.qty
                            ) {
                              skuParaBonificacionDeCombo.selectedQty =
                                skuParaBonificacionDeCombo.qty;
                            } else {
                              if (
                                !this
                                  .usuarioPuedeModificarBonificacionDeCombo ||
                                usarMaximaBonificacion
                              ) {
                                skuParaBonificacionDeCombo.selectedQty =
                                  skuParaBonificacionDeCombo.qty;
                              }
                            }
                            liPorCombo += `<span class='small-roboto'>Cod. SKU: ${skuParaBonificacionDeCombo.codeSku} UM.: ${skuParaBonificacionDeCombo.codePackUnit} Cant.: ${skuParaBonificacionDeCombo.qty}</span><br/>`;
                          }
                        }
                      }
                    }

                    liPorCombo += "</a>";
                    liPorCombo += "</li>";
                    skulist.append(liPorCombo);
                  } else {
                    cantidadSinDetalle++;
                  }
                }

                if (cantidadSinDetalle > 0) {
                  notify(
                    `Tiene ${cantidadSinDetalle} combo(s) que bonifica(n) productos que en este momento no se encuentran en su bodega de preventa.`
                  );
                }
              }

              let tabla =
                '<li esCombo="0" data-icon="false">' +
                '<table data-role="table" data-mode="reflow" class="ui-responsive table-stroke" style="width: 100%">';
              for (var i = 0; i < this.listaDeSkuOrdenDeVenta.length; i++) {
                var sku = this.listaDeSkuOrdenDeVenta[i];
                tabla += '<tr style="display: flex;">';
                tabla +=
                  '<td style="width: 10%" valign="center" align="center">' +
                  '<a href="#" id="' +
                  OpcionEnListadoDePedido.Eliminar.toString() +
                  "|" +
                  sku.sku +
                  "|" +
                  sku.codePackUnit +
                  '|detalle" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext" style="margin-top: 20px;"></a></td>';

                tabla += '<td style="width: 60%; word-break: break-all;">';
                tabla += `<span class='small-roboto'>${
                  sku.skuName.length > 40
                    ? sku.skuName.substring(0, 40)
                    : sku.skuName
                }</span><br/>`;
                tabla += `<span id='SKU_QTY_${sku.sku.replace(
                  " ",
                  "_"
                )}' class='small-roboto'>Cant.: ${format_number(
                  sku.qty,
                  this.configuracionDecimales.defaultDisplayDecimals
                )}  UM: ${sku.codePackUnit}  Pre.: ${DarFormatoAlMonto(
                  format_number(
                    sku.cost,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )
                )}</span><br/>`;
                tabla += `<span id='SKU_AVAIL_${sku.sku.replace(
                  " ",
                  "_"
                )}' class='small-roboto'>Disponible: ${format_number(
                  sku.available,
                  this.configuracionDecimales.defaultDisplayDecimals
                )}</span><br/>`;

                if (sku.handleDimension) {
                  tabla +=
                    "<table style='width: 75%;' data-role='table' data-mode='reflow' class='ui-responsive table-stroke'>";
                  //cabeceras
                  tabla += "<tr>";
                  tabla += "<td style='width: 30%; text-align: left;'>";
                  tabla +=
                    "<span class='small-roboto'>" + "<b>" + "CANTIDAD" + "</b>";
                  tabla += "</td>";
                  tabla += "<td style='width: 30%;text-align: center;'>";
                  tabla +=
                    "<span class='small-roboto'>" +
                    "<b>" +
                    "DIMENSION" +
                    "</b>";
                  tabla += "</td>";
                  tabla += "<td style='width: 30%;text-align: right;'>";
                  tabla +=
                    "<span class='small-roboto'>" + "<b>" + "TOTAL" + "</b>";
                  tabla += "</td>";
                  tabla += "</tr>";
                  for (let dimension of sku.dimensions) {
                    let dimensionSku = trunc_number(
                      dimension.dimensionSku,
                      this.configuracionDecimales.defaultCalculationsDecimals
                    );
                    let cantidad = trunc_number(
                      dimension.qtySku,
                      this.configuracionDecimales.defaultCalculationsDecimals
                    );
                    let total = trunc_number(
                      parseFloat(dimension.total.toString()),
                      this.configuracionDecimales.defaultCalculationsDecimals
                    );
                    tabla += "<tr>";
                    tabla += "<td style='width: 30%; text-align: left;'>";
                    tabla += `<span class='small-roboto'>${format_number(
                      cantidad,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}</span>`;
                    tabla += "</td>";
                    tabla += "<td style='width: 30%;text-align: center;'>";
                    tabla += `<span class='small-roboto'>${format_number(
                      dimensionSku,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}</span>`;
                    tabla += "</td>";
                    tabla += "<td style='width: 30%;text-align: right;'>";
                    tabla += `<span class='small-roboto'>${format_number(
                      total,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}</span>`;
                    tabla += "</td>";
                    tabla += "</tr>";
                  }
                  tabla += "</table><br/>";
                }

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

                //-----Agregarmos el descuento por escala-----//
                if (sku.discount !== 0) {
                  switch (sku.discountType) {
                    case TiposDeDescuento.Porcentaje.toString():
                      tabla += `<span id='SKU_DISCOUNT_${sku.sku.replace(
                        " ",
                        "_"
                      )}' class='small-roboto'> Des: ${format_number(
                        sku.appliedDiscount,
                        this.configuracionDecimales.defaultDisplayDecimals
                      )}%</span>`;
                      break;
                    case TiposDeDescuento.Monetario.toString():
                      tabla += `<span id='SKU_DISCOUNT_${sku.sku.replace(
                        " ",
                        "_"
                      )}' class='small-roboto'> Des: ${DarFormatoAlMonto(
                        format_number(
                          sku.appliedDiscount,
                          this.configuracionDecimales.defaultDisplayDecimals
                        )
                      )}</span>`;
                      break;
                  }
                  //-----Validamos si no hay mas descuentos para mostrar el monto general-----//
                  if (
                    !resultadoDescuentoPorMontoGeneralYFamilia &&
                    !resultadoDescuentoPorFamiliaYTipoPago
                  ) {
                    tabla += `<span id='SKU_LINE_TOTALCD_${sku.sku.replace(
                      " ",
                      "_"
                    )}' class='small-roboto'> Total: ${format_number(
                      sku.total,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}</span>`;
                  }
                }

                //-----Agregamos el descuento por monto general y familia
                if (resultadoDescuentoPorMontoGeneralYFamilia) {
                  switch (
                    resultadoDescuentoPorMontoGeneralYFamilia.discountType
                  ) {
                    case TiposDeDescuento.Porcentaje.toString():
                      tabla += `<span id='SKU_DISCOUNT_MGF_${sku.sku.replace(
                        " ",
                        "_"
                      )}' class='small-roboto'> DMF: ${format_number(
                        resultadoDescuentoPorMontoGeneralYFamilia.discount,
                        this.configuracionDecimales.defaultDisplayDecimals
                      )}%</span>`;
                      break;
                    case TiposDeDescuento.Monetario.toString():
                      tabla += `<span id='SKU_DISCOUNT_MGF_${sku.sku.replace(
                        " ",
                        "_"
                      )}' class='small-roboto'> DMF: ${DarFormatoAlMonto(
                        format_number(
                          resultadoDescuentoPorMontoGeneralYFamilia.discount,
                          this.configuracionDecimales.defaultDisplayDecimals
                        )
                      )}</span>`;
                      break;
                  }

                  if (!resultadoDescuentoPorFamiliaYTipoPago) {
                    tabla += `<span id='SKU_LINE_TOTALCD_${sku.sku.replace(
                      " ",
                      "_"
                    )}' class='small-roboto'> Total: ${format_number(
                      sku.total,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )}</span>`;
                  }
                }
                //-----Agregamos el descuento por familia y tipo pago

                if (resultadoDescuentoPorFamiliaYTipoPago) {
                  if (!sku.specialPrice || sku.specialPrice.applyDiscount) {
                    switch (
                      resultadoDescuentoPorFamiliaYTipoPago.discountType
                    ) {
                      case TiposDeDescuento.Porcentaje.toString():
                        tabla += `<span id='SKU_DISCOUNT_MGF_${sku.sku.replace(
                          " ",
                          "_"
                        )}' class='small-roboto'> DFT: ${format_number(
                          resultadoDescuentoPorFamiliaYTipoPago.discount,
                          this.configuracionDecimales.defaultDisplayDecimals
                        )}%</span>`;
                        break;
                      case TiposDeDescuento.Monetario.toString():
                        tabla += `<span id='SKU_DISCOUNT_MGF_${sku.sku.replace(
                          " ",
                          "_"
                        )}' class='small-roboto'> DFT: ${DarFormatoAlMonto(
                          format_number(
                            resultadoDescuentoPorFamiliaYTipoPago.discount,
                            this.configuracionDecimales.defaultDisplayDecimals
                          )
                        )}</span>`;
                        break;
                    }
                  }
                  tabla += `<p id='SKU_LINE_TOTALCD_${sku.sku.replace(
                    " ",
                    "_"
                  )}' class='small-roboto'> Total: ${DarFormatoAlMonto(
                    format_number(
                      sku.total,
                      this.configuracionDecimales.defaultDisplayDecimals
                    )
                  )}</p>`;
                }

                tabla += "";
                tabla += "</td>";

                tabla += '<td style="width: 20%">';
                let total = sku.total;

                if (!resultadoDescuentoPorMontoGeneralYFamilia) {
                  resultadoDescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
                }
                if (!resultadoDescuentoPorFamiliaYTipoPago) {
                  resultadoDescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
                }

                total = this.descuentoServicio.aplicarLosDescuentos(
                  sku,
                  sku.isUniqueDiscountScale,
                  this.listaDeOrdenAplicarDescuentos,
                  resultadoDescuentoPorMontoGeneralYFamilia,
                  resultadoDescuentoPorFamiliaYTipoPago
                );

                tabla += `<a href="#" id="${OpcionEnListadoDePedido.Modificar.toString()}|${
                  sku.sku
                }|${
                  sku.codePackUnit
                }|detalle" class='ui-btn ui-corner-all small-roboto' style="margin-top: 20px;width: 80%">${DarFormatoAlMonto(
                  format_number(
                    total,
                    this.configuracionDecimales.defaultDisplayDecimals
                  )
                )}</a>`;

                tabla += "</td></tr>";

                let listaDeSkuABonificar: Array<Sku> = new Array<Sku>();
                this.obtenerBonificacionPorUnidad(sku, listaDeSkuABonificar);
                let tieneBonificaciones = listaDeSkuABonificar.length > 0;
                if (tieneBonificaciones) {
                  tabla +=
                    '<tr style="display: flex;border-bottom: 1px solid #00ff00;border-top: 1px solid #00ff00;border-left: 1px solid #00ff00;border-right: 1px solid #00ff00;">';
                  tabla +=
                    '<td style="width: 10%" valign="center" align="center"><a href="#" id="' +
                    OpcionEnListadoDePedido.Eliminar.toString() +
                    "|" +
                    sku.sku +
                    "|" +
                    sku.codePackUnit +
                    '|bonificacion" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext"></a></td>';
                  tabla += '<td style="width: 65%">';
                  for (let skuParaBonificacion of listaDeSkuABonificar) {
                    tabla += `<span style="display:inline-block;width:100px;word-wrap:break-word" class='small-roboto'>Bonificación: ${skuParaBonificacion.skuDescription}</span><br/>`;
                    tabla += `<span class='small-roboto'>Cod. SKU: ${skuParaBonificacion.sku} UM.: ${skuParaBonificacion.codePackUnit} Cant.: ${skuParaBonificacion.qty}</span><br/>`;
                  }
                  tabla += "</td>";
                  tabla += '<td style="width: 25%">';
                  tabla += "</td></tr>";
                }
              }

              tabla += "</table></li>";
              skulist.append(tabla);
              skulist.listview("refresh");
              skulist = null;

              this.establecerTotalOrdenDeVenta(this);
              my_dialog("", "", "close");
            },
            (resultado: Operacion) => {
              my_dialog("", "", "close");
              notify(resultado.mensaje);
            }
          );
        },
        (resultado: Operacion) => {
          my_dialog("", "", "close");
          notify(resultado.mensaje);
        }
      );
    } catch (err) {
      notify("Error al cargar la lista de sku: " + err.message);
    }
  }

  establecerTotalOrdenDeVenta(_this: DocumentoVentaControlador) {
    try {
      let total = 0;
      for (let i = 0; i < _this.listaDeSkuOrdenDeVenta.length; i++) {
        let sku = _this.listaDeSkuOrdenDeVenta[i];
        total += sku.total;
        sku = null;
      }
      _this.cliente.totalAmout = total;
      const saldoActual = _this.cliente.cuentaCorriente.saldoActual + total;
      const limiteDeCredito =
        _this.cliente.cuentaCorriente.limiteDeCredito - saldoActual;
      var uiTotalOrdenVenta = $("#lblTotalSKU");

      let porcentajeDeImpuesto: number = parseFloat(
        localStorage.getItem("TAX_PERCENT_PARAMETER")
      );
      _this.tareaServicio.obtenerRegla(
        "CalcularTotalDeImpuesto",
        (listaDeReglas: Regla[]) => {
          if (
            listaDeReglas.length > 0 &&
            listaDeReglas[0].enabled.toUpperCase() === "SI"
          ) {
            let totalOrden = 0;
            const totalOriginalOrdenDeVenta = _this.obtenerTotalDeOrdenDeVenta(
              _this.cliente.appliedDiscount,
              _this.listaDeSkuOrdenDeVenta
            );

            porcentajeDeImpuesto = (porcentajeDeImpuesto > 0
              ? porcentajeDeImpuesto / 100
              : 0.0) as any;

            totalOrden =
              totalOriginalOrdenDeVenta * porcentajeDeImpuesto +
              totalOriginalOrdenDeVenta;

            uiTotalOrdenVenta.text(
              "TOTAL C.I: " +
                DarFormatoAlMonto(
                  format_number(
                    totalOrden,
                    _this.configuracionDecimales.defaultDisplayDecimals
                  )
                )
            );
            uiTotalOrdenVenta = null;
          } else {
            let totalOrdenDeVenta = _this.obtenerTotalDeOrdenDeVenta(
              _this.cliente.appliedDiscount,
              _this.listaDeSkuOrdenDeVenta
            );

            uiTotalOrdenVenta.text(
              "TOTAL: " +
                DarFormatoAlMonto(
                  format_number(
                    totalOrdenDeVenta,
                    _this.configuracionDecimales.defaultDisplayDecimals
                  )
                )
            );

            uiTotalOrdenVenta = null;
          }
        },
        resultado => {
          uiTotalOrdenVenta.text(
            "TOTAL: " +
              DarFormatoAlMonto(
                format_number(
                  _this.obtenerTotalDeOrdenDeVenta(
                    _this.cliente.appliedDiscount,
                    _this.listaDeSkuOrdenDeVenta
                  ),
                  _this.configuracionDecimales.defaultDisplayDecimals
                )
              )
          );
          uiTotalOrdenVenta = null;
        }
      );

      if (_this.tarea) {
        _this.tarea.salesOrderTotal = _this.obtenerTotalDeOrdenDeVenta(
          0,
          _this.listaDeSkuOrdenDeVenta
        );
      }

      var uiSubTotalOrdenDeventa = $("#lblSubTotalSKU");
      uiSubTotalOrdenDeventa.text(
        DarFormatoAlMonto(
          format_number(
            _this.obtenerTotalDeOrdenDeVenta(0, _this.listaDeSkuOrdenDeVenta),
            _this.configuracionDecimales.defaultDisplayDecimals
          )
        )
      );
      var uiSaldoTotal = $("#lblSaldoTotal");
      uiSaldoTotal.text(
        DarFormatoAlMonto(
          format_number(
            saldoActual,
            _this.configuracionDecimales.defaultDisplayDecimals
          )
        )
      );
      var uiSaldoTotal2 = $("#lblSaldoTotal2");
      uiSaldoTotal2.text(
        DarFormatoAlMonto(
          format_number(
            saldoActual,
            _this.configuracionDecimales.defaultDisplayDecimals
          )
        )
      );
      var uiLimiteDeCredito = $("#lblLimiteDeCredito");
      uiLimiteDeCredito.text(
        DarFormatoAlMonto(
          format_number(
            limiteDeCredito,
            _this.configuracionDecimales.defaultDisplayDecimals
          )
        )
      );
      let uiTotalDescuento = $("#lblTotalDescuento");
      uiTotalDescuento.text(
        DarFormatoAlMonto(
          format_number(
            _this.obtenerTotalDeOrdenDeVenta(
              _this.cliente.appliedDiscount,
              _this.listaDeSkuOrdenDeVenta
            ),
            _this.configuracionDecimales.defaultDisplayDecimals
          )
        )
      );
      uiTotalDescuento = null;
      uiSaldoTotal = null;
      uiSubTotalOrdenDeventa = null;
      uiSaldoTotal2 = null;
      var tot = DarFormatoAlMonto(
        format_number(
          _this.obtenerTotalDeOrdenDeVenta(0, _this.listaDeSkuOrdenDeVenta),
          _this.configuracionDecimales.defaultDisplayDecimals
        )
      );
      tot = tot.substr(1);
      _this.obtenerDescuentos(parseFloat(tot), () => {
        _this.tarea.discountPerGeneralAmountLowLimit =
          _this.descuentoPorMontoGeneral.lowAmount;
        if (_this.descuentoPorMontoGeneral.highAmount === 0) {
          _this.tarea.discountPerGeneralAmountHighLimit = -1;
        } else {
          _this.tarea.discountPerGeneralAmountHighLimit =
            _this.descuentoPorMontoGeneral.highAmount;
        }

        let uiDmgMaximo = $("#UiEtiquetaDMGMaximo");
        uiDmgMaximo.html(
          "DMG a Aplicar: (" + _this.descuentoPorMontoGeneral.discount + "%)"
        );
        uiDmgMaximo = null;

        let uiTxtDmg = $("#UiPorcentajeDeDescuento");
        if (!_this.usuarioPuedeModificarDescuento) {
          uiTxtDmg.attr("readonly", "true");
          uiTxtDmg.attr("data-clear-btn", "false");
          uiTxtDmg.val(_this.descuentoPorMontoGeneral.discount);
        } else {
          uiTxtDmg.removeAttr("readonly");
          uiTxtDmg.attr("data-clear-btn", "true");

          if (
            _this.cliente.appliedDiscount >= 0 &&
            _this.usuarioYaColocoDescuento
          ) {
            uiTxtDmg.val(_this.cliente.appliedDiscount);
          } else {
            uiTxtDmg.val(_this.descuentoPorMontoGeneral.discount);
          }
          _this.tarea.discountPerGeneralAmount =
            parseFloat(uiTxtDmg.val()) / 100;
        }
        uiTxtDmg = null;

        _this.calcularDescuento(
          _this,
          () => {},
          (resultado: Operacion) => {
            if (_this.esPrimerMensajeDeDescuento) notify(resultado.mensaje);
          }
        );
      });
      tot = null;
    } catch (err) {
      notify(
        "Error al establecer el total de la orden de venta: " + err.message
      );
    }
  }

  usuarioDeseaCalcularDescuento(_this: DocumentoVentaControlador) {
    _this.calcularDescuento(
      _this,
      () => {
        _this.usuarioYaColocoDescuento = true;
      },
      (resultado: Operacion) => {
        if (_this.esPrimerMensajeDeDescuento) notify(resultado.mensaje);
      }
    );
  }

  calcularDescuento(
    _this: DocumentoVentaControlador,
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      var uiOrdenDeVentaDescuento = $("#UiPorcentajeDeDescuento");
      var descuento: number = uiOrdenDeVentaDescuento.val();
      uiOrdenDeVentaDescuento = null;

      if (
        descuento === undefined ||
        descuento === null ||
        descuento.toString() === "" ||
        descuento.toString() === "0"
      ) {
        _this.cliente.appliedDiscount = 0;
        _this.cliente.discount = trunc_number(
          _this.cliente.totalAmout -
            (_this.cliente.appliedDiscount * _this.cliente.totalAmout) / 100,
          _this.configuracionDecimales.defaultCalculationsDecimals
        );
      } else {
        if (
          descuento < 0 ||
          descuento > _this.descuentoPorMontoGeneral.discount
        ) {
          let operacion = new Operacion();
          operacion.codigo = -1;
          operacion.mensaje =
            "El descuento no puede ser menor a 0% y mayor a " +
            _this.descuentoPorMontoGeneral.discount +
            "%";
          console.log(operacion.mensaje);

          _this.usuarioYaColocoDescuento = false;
          errCallback(operacion);
          _this.esPrimerMensajeDeDescuento = false;
          return;
        } else {
          _this.cliente.appliedDiscount = trunc_number(
            descuento,
            _this.configuracionDecimales.defaultCalculationsDecimals
          );
          _this.cliente.discount = trunc_number(
            _this.cliente.totalAmout -
              (_this.cliente.appliedDiscount * _this.cliente.totalAmout) / 100,
            _this.configuracionDecimales.defaultCalculationsDecimals
          );
        }
      }
      var uiTotalDescuento = $("#lblTotalDescuento");
      uiTotalDescuento.text(
        format_number(
          _this.obtenerTotalDeOrdenDeVenta(
            _this.cliente.appliedDiscount,
            _this.listaDeSkuOrdenDeVenta
          ),
          _this.configuracionDecimales.defaultDisplayDecimals
        )
      );
      uiTotalDescuento = null;

      var uiTotalConDescuento = $("#lblTotalSKUCD");
      uiTotalConDescuento.text(
        format_number(
          _this.cliente.discount,
          _this.configuracionDecimales.defaultDisplayDecimals
        )
      );
      uiTotalConDescuento = null;

      callback();
    } catch (err) {
      let operacion = new Operacion();
      operacion.codigo = -1;
      operacion.mensaje =
        "Error al calcular el descuento de la orden de venta: " + err.message;
      console.log(operacion.mensaje);

      errCallback(operacion);
    }
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
        "DRAFT",
        sequence => {
          ObtenerSecuenciaSiguiente(
            TipoDocumento.Borrador,
            (serie, numeroDeDocumento) => {
              callback(sequence, serie, numeroDeDocumento, controlador);
            },
            err => {
              notify("Error al obtener sequencia de documento: " + err.message);
            }
          );
        },
        err => {
          notify("Error al obtener sequencia de documento: " + err.message);
        }
      );
    } catch (err) {
      notify("Error al obtener secuencia de documento: " + err.message);
    }
  }

  prepararOrdenDeVentaParaInsertar(
    callback: (ordenDeVenta: OrdenDeVenta) => void
  ) {
    try {
      this.obtenerSecuenciaDeDocumentos(
        this,
        (
          sequence: string,
          serie: string,
          numeroDeDocumento: number,
          controlador: DocumentoVentaControlador
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
          ordenDeVenta.image1 = null;
          ordenDeVenta.image2 = null;
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
          ordenDeVenta.isParent = true;
          ordenDeVenta.referenceId =
            localStorage.getItem("LAST_LOGIN_ID") + getDateTime() + sequence;
          ordenDeVenta.timesPrinted = 0;
          ordenDeVenta.paymentTimesPrinted = 0;
          ordenDeVenta.sinc = 0;
          ordenDeVenta.isPostedVoid = 2;
          ordenDeVenta.isVoid = false;
          ordenDeVenta.salesOrderType = gSalesOrderType;
          ordenDeVenta.discountByGeneralAmountApplied =
            controlador.cliente.appliedDiscount;
          ordenDeVenta.discountApplied = controlador.cliente.discount;
          ordenDeVenta.taskId = controlador.tarea.taskId;
          ordenDeVenta.salesOrderIdBo = 0;
          ordenDeVenta.isDraft = 1;
          ordenDeVenta.isUpdated = 1;
          ordenDeVenta.ordenDeVentaDetalle = [];
          ordenDeVenta.comment = controlador.cliente.salesComment;
          ordenDeVenta.paidToDate = 0;
          ordenDeVenta.toBill = null;
          ordenDeVenta.isPostedValidated = 0;
          ordenDeVenta.totalAmountDisplay = this.obtenerTotalDeOrdenDeVenta(
            this.cliente.appliedDiscount,
            this.listaDeSkuOrdenDeVenta
          );
          ordenDeVenta.goalHeaderId = localStorage.getItem("GOAL_HEADER_ID")
            ? parseInt(localStorage.getItem("GOAL_HEADER_ID"))
            : null;

          ordenDeVenta.authorized = false;

          this.prepararDetalleDeOrdenDeVentaDraft(ordenDeVenta, callback);
        }
      );
    } catch (err) {
      notify("Error al preparar ordenDeVenta: " + err.message);
    }
  }

  prepararOrdenDeVentaParaActualizar(
    callback: (ordenDeVenta: OrdenDeVenta) => void
  ) {
    try {
      this.ordenDeVentaDraft.terms = null;
      this.ordenDeVentaDraft.postedDatetime = getDateTime();
      this.ordenDeVentaDraft.clientId = this.cliente.clientId;
      this.ordenDeVentaDraft.posTerminal = gCurrentRoute;
      this.ordenDeVentaDraft.gpsUrl = gCurrentGPS;
      this.ordenDeVentaDraft.status = "0";
      this.ordenDeVentaDraft.postedBy = localStorage.getItem("LAST_LOGIN_ID");
      this.ordenDeVentaDraft.image1 = null;
      this.ordenDeVentaDraft.image2 = null;
      this.ordenDeVentaDraft.image3 =
        this.cliente.fotoDeInicioDeVisita !== ""
          ? this.cliente.fotoDeInicioDeVisita
          : null;
      this.ordenDeVentaDraft.deviceBatteryFactor = gBatteryLevel;
      this.ordenDeVentaDraft.voidDatetime = null;
      this.ordenDeVentaDraft.voidReason = null;
      this.ordenDeVentaDraft.voidNotes = null;
      this.ordenDeVentaDraft.voided = null;
      this.ordenDeVentaDraft.closedRouteDatetime = null;
      this.ordenDeVentaDraft.datetime = null;
      this.ordenDeVentaDraft.isActiveRoute = 1;
      this.ordenDeVentaDraft.gpsExpected = this.cliente.gps;
      this.ordenDeVentaDraft.salesOrderIdBo = null;
      this.ordenDeVentaDraft.isPosted = 0;
      this.ordenDeVentaDraft.deliveryDate = this.cliente.deliveryDate;
      this.ordenDeVentaDraft.isParent = true;

      this.ordenDeVentaDraft.timesPrinted = 0;
      this.ordenDeVentaDraft.paymentTimesPrinted = 0;
      this.ordenDeVentaDraft.sinc = 0;
      this.ordenDeVentaDraft.isPostedVoid = 2;
      this.ordenDeVentaDraft.isVoid = false;
      this.ordenDeVentaDraft.salesOrderType = gSalesOrderType;
      this.ordenDeVentaDraft.discountByGeneralAmountApplied = this.cliente.appliedDiscount;
      this.ordenDeVentaDraft.discountApplied = this.cliente.discount;
      this.ordenDeVentaDraft.taskId = this.tarea.taskId;
      this.ordenDeVentaDraft.salesOrderIdBo = 0;
      this.ordenDeVentaDraft.isDraft = 1;
      this.ordenDeVentaDraft.isUpdated = 1;
      this.ordenDeVentaDraft.ordenDeVentaDetalle = [];
      this.ordenDeVentaDraft.comment = this.cliente.salesComment;
      this.ordenDeVentaDraft.paidToDate = 0;
      this.ordenDeVentaDraft.toBill = null;
      this.ordenDeVentaDraft.isPostedValidated = 0;
      this.ordenDeVentaDraft.totalAmountDisplay = this.obtenerTotalDeOrdenDeVenta(
        this.cliente.appliedDiscount,
        this.listaDeSkuOrdenDeVenta
      );
      this.ordenDeVentaDraft.goalHeaderId = localStorage.getItem(
        "GOAL_HEADER_ID"
      )
        ? parseInt(localStorage.getItem("GOAL_HEADER_ID"))
        : null;

      this.ordenDeVentaDraft.authorized = false;
      this.ordenDeVentaDraft.ordenDeVentaDetalle = [];

      this.prepararDetalleDeOrdenDeVentaDraft(this.ordenDeVentaDraft, callback);
    } catch (err) {
      notify(`Error al preparar ordenDeVenta: ${err.message}`);
    }
  }

  prepararDetalleDeOrdenDeVentaDraft(
    ordenDeVenta: OrdenDeVenta,
    callback: (ordenDeVentaProcesada: OrdenDeVenta) => void
  ) {
    let total = 0;

    this.listaDeSkuOrdenDeVenta.map((sku: Sku, lineSequence: number) => {
      let ordenDeVentaDetalle = new OrdenDeVentaDetalle();

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

      ordenDeVentaDetalle.totalAmountDisplay = this.descuentoServicio.aplicarLosDescuentos(
        sku,
        sku.isUniqueDiscountScale,
        this.listaDeOrdenAplicarDescuentos,
        resultadoDescuentoPorMontoGeneralYFamilia,
        resultadoDescuentoPorFamiliaYTipoPago
      );

      ordenDeVentaDetalle.postedDatetime = getDateTime();
      ordenDeVentaDetalle.serie = "0";
      ordenDeVentaDetalle.serie2 = "0";
      ordenDeVentaDetalle.requeriesSerie = false;
      ordenDeVentaDetalle.comboReference = sku.sku;
      ordenDeVentaDetalle.parentSeq = lineSequence;
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
      ordenDeVentaDetalle.discountByFamily = !sku.specialPrice.applyDiscount
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
      ordenDeVentaDetalle.discountByFamilyAndPaymentType = !sku.specialPrice
        .applyDiscount
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
      ordenDeVentaDetalle.applyDiscountBySpecialPrice = sku.specialPrice
        .applyDiscount
        ? 1
        : 0;
      ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
      total += ordenDeVentaDetalle.totalLine;
    });

    ordenDeVenta.detailQty = ordenDeVenta.ordenDeVentaDetalle.length || 0;
    ordenDeVenta.totalAmount = total;

    callback(ordenDeVenta);
  }

  usuarioDeseaCancelarDraft() {
    try {
      if (this.tarea.hasDraft) {
        navigator.notification.confirm(
          "Desea cancelar la venta como borrador?",
          buttonIndex => {
            if (buttonIndex === 2) {
              this.ordenDeVentaServicio.cancelarOCompletarOrdenDeVentaDraft(
                this.ordenDeVentaDraft,
                () => {
                  this.tarea.hasDraft = false;
                  this.ordenDeVentaDraft = new OrdenDeVenta();
                  this.ordenDeVentaDraft.ordenDeVentaDetalle = [];
                  EnviarData();
                },
                (resultado: Operacion) => {
                  notify(resultado.mensaje);
                }
              );
            }
          },
          "Sonda® " + SondaVersion,
          <any>"No,Si"
        );
      }
    } catch (err) {
      notify("Error al cancelar el borrador: " + err.message);
    }
  }

  validarFecha(callback: () => void) {
    if (this.tarea.hasDraft) {
      var uiFechaEntrega = $("#FechaEntrega");
      var fecha = new Date();
      var fechaHoy = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
      );
      var fechaActual = new Date(uiFechaEntrega.val());

      if (fechaHoy > fechaActual) {
        notify("La fecha tiene que ser mayor o igual al de hoy.");
      } else if (
        this.estadoDeTareaAnterior === TareaEstado.Asignada &&
        this.tarea.hasDraft
      ) {
        if (
          this.obtenerFechaFormato(uiFechaEntrega.val(), false) ===
          this.obtenerFechaFormato(
            this.ordenDeVentaDraft.deliveryDate.toString(),
            this.ordenDeVentaDraft.salesOrderId > 0
          )
        ) {
          notify(
            "La fecha de entrega es la misma con que se guardo en el borrador."
          );
        } else {
          callback();
        }
      } else {
        callback();
      }
      uiFechaEntrega = null;
    } else {
      callback();
    }
  }

  usuarioDeseaGuardarDraft() {
    try {
      var _este = this;
      if (this.listaDeSkuOrdenDeVenta.length >= 1) {
        this.validarFecha(() => {
          var uiFechaEntrega = $("#FechaEntrega");
          this.cliente.deliveryDate = uiFechaEntrega.val();
          uiFechaEntrega = null;
          this.calcularDescuento(
            this,
            () => {
              navigator.notification.confirm(
                "Desea guardar la venta como borrador?",
                buttonIndex => {
                  if (buttonIndex === 2) {
                    let finalizarProcesoDraft = () => {
                      let encuestasAEjecutarEnFinalizacionDeTarea: Microencuesta[] = _este.encuestaServicio.filtrarEncuestasPorDisparador(
                        _este.tarea.microsurveys,
                        DisparadorDeEncuesta.FinDeTarea
                      );

                      if (
                        encuestasAEjecutarEnFinalizacionDeTarea &&
                        encuestasAEjecutarEnFinalizacionDeTarea.length > 0
                      ) {
                        _este.encuestaServicio.procesarEncuestasDeCliente(
                          encuestasAEjecutarEnFinalizacionDeTarea,
                          0,
                          _este.tarea.hasDraft,
                          () => {
                            $.mobile.changePage("#pickupplan_page", {
                              transition: "flow",
                              reverse: true,
                              showLoadMsg: false
                            });
                            EnviarData();
                            InteraccionConUsuarioServicio.desbloquearPantalla();
                          },
                          (error: Operacion) => {
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
                            showLoadMsg: false
                          });
                          clearTimeout(timeOut);
                        }, 1000);
                      } else {
                        $.mobile.changePage("#pickupplan_page", {
                          transition: "flow",
                          reverse: true,
                          showLoadMsg: false
                        });
                        EnviarData();
                        InteraccionConUsuarioServicio.desbloquearPantalla();
                      }
                    };

                    if (this.tarea.hasDraft) {
                      this.prepararOrdenDeVentaParaActualizar(
                        (ordenDeVenta: OrdenDeVenta) => {
                          this.ordenDeVentaServicio.actualizarOrdenDeVentaDraft(
                            ordenDeVenta,
                            () => {
                              this.confirmarImpresionDeDocumentoDraft(
                                (imprimirDraft: boolean) => {
                                  InteraccionConUsuarioServicio.bloquearPantalla();
                                  if (imprimirDraft) {
                                    this.usuarioDeseaImprimirDraft(
                                      ordenDeVenta,
                                      () => {
                                        finalizarProcesoDraft();
                                      }
                                    );
                                  } else {
                                    finalizarProcesoDraft();
                                  }
                                }
                              );
                            },
                            (resultado: Operacion) => {
                              notify(resultado.mensaje);
                            }
                          );
                        }
                      );
                    } else {
                      this.prepararOrdenDeVentaParaInsertar(
                        (ordenDeVenta: OrdenDeVenta) => {
                          this.ordenDeVentaServicio.insertarOrdenDeVentaDraft(
                            ordenDeVenta,
                            () => {
                              this.confirmarImpresionDeDocumentoDraft(
                                (imprimirDraft: boolean) => {
                                  InteraccionConUsuarioServicio.bloquearPantalla();
                                  if (imprimirDraft) {
                                    this.usuarioDeseaImprimirDraft(
                                      ordenDeVenta,
                                      () => {
                                        finalizarProcesoDraft();
                                      }
                                    );
                                  } else {
                                    finalizarProcesoDraft();
                                  }
                                }
                              );
                            },
                            (resultado: Operacion) => {
                              notify(resultado.mensaje);
                            }
                          );
                        }
                      );
                    }
                  }
                },
                "Sonda® " + SondaVersion,
                ["No", "Si"]
              );
            },
            (resultado: Operacion) => {
              notify(resultado.mensaje);
            }
          );
        });
      } else {
        notify("No tiene ningun producto.");
      }
    } catch (err) {
      notify("Error al guardar draft: " + err.message);
    }
  }

  ordenDeVentaDraftEntregado(
    mensaje: OrdenDeVentaDraftMensaje,
    subcriber: any
  ): void {
    var dvc = <DocumentoVentaControlador>subcriber;
    dvc.ordenDeVentaDraft = mensaje.ordenDeVenta;
    dvc.seCargoDatosDraft = false;
    dvc.listaDeSkuOrdenDeVenta = [];
    for (
      var i = 0;
      i < subcriber.ordenDeVentaDraft.ordenDeVentaDetalle.length;
      i++
    ) {
      var detalleOrdenDeVentaDetalle =
        subcriber.ordenDeVentaDraft.ordenDeVentaDetalle[i];

      var sku = new Sku();
      sku.sku = detalleOrdenDeVentaDetalle.sku;
      sku.skuName = detalleOrdenDeVentaDetalle.skuName;

      sku.qty = detalleOrdenDeVentaDetalle.qty;

      sku.total = detalleOrdenDeVentaDetalle.totalLine;

      sku.cost = detalleOrdenDeVentaDetalle.price;

      sku.codePackUnit = detalleOrdenDeVentaDetalle.codePackUnit;
      sku.available = detalleOrdenDeVentaDetalle.available;

      sku.appliedDiscount = detalleOrdenDeVentaDetalle.discount;
      sku.dimension = detalleOrdenDeVentaDetalle.long;
      sku.isSaleByMultiple = detalleOrdenDeVentaDetalle.isSaleByMultiple;
      sku.multipleSaleQty = detalleOrdenDeVentaDetalle.multipleSaleQty;
      sku.owner = detalleOrdenDeVentaDetalle.owner;
      sku.ownerId = detalleOrdenDeVentaDetalle.ownerId;
      sku.discountType = detalleOrdenDeVentaDetalle.discountType;
      sku.codeFamilySku = detalleOrdenDeVentaDetalle.codeFamilySku;
      sku.basePrice = detalleOrdenDeVentaDetalle.basePrice;
      sku.totalCD = detalleOrdenDeVentaDetalle.totalAmountDisplay;

      subcriber.listaDeSkuOrdenDeVenta.push(sku);
    }
  }

  obtenerConfiguracionDeDecimales() {
    this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
      (decimales: ManejoDeDecimales) => {
        this.configuracionDecimales = decimales;
      },
      (operacion: Operacion) => {
        notify(operacion.mensaje);
      }
    );
  }

  usuarioDeseaVerInformacionDeOrdenDeVenta() {
    this.limpiarListaDeSku(
      () => {
        $.mobile.changePage("#pos_skus_inofrmation_page", {
          transition: "pop",
          reverse: true,
          showLoadMsg: false
        });
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  usuarioDeseaRetornarAOrdenDeVenta() {
    $.mobile.changePage("pos_skus_page", {
      transition: "pop",
      reverse: true,
      showLoadMsg: false,
      data: {
        cliente: this.cliente,
        tarea: this.tarea,
        configuracionDecimales: this.configuracionDecimales,
        esPrimeraVez: this.esPrimeraVez
      }
    });
  }

  usuarioDeseaModificarCliente() {
    this.cliente.origen = "DocumenoDeVentaControlador";
    $.mobile.changePage("UiPageCustomerInfo", {
      transition: "pop",
      reverse: true,
      showLoadMsg: false,
      data: {
        cliente: this.cliente,
        tarea: this.tarea,
        configuracionDecimales: this.configuracionDecimales,
        esPrimeraVez: this.esPrimeraVez
      }
    });
  }

  publicarCargarPorPrimeraVezListaSkuMensaje() {
    var msg = new CargarPorPrimeraVezListaSkuMensaje(this);
    this.mensajero.publish(msg, getType(CargarPorPrimeraVezListaSkuMensaje));
  }

  mostrarCaracteresRestantes() {
    var uiComentarioDeOrdenDeVenta = $("#UiComentarioDeOrdenDeVenta");
    var uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = $(
      "#UiCaracteresRestantesDelComentarioDeDocumentoDeVenta"
    );

    var caracteresRestantes = 250 - uiComentarioDeOrdenDeVenta.val().length;
    uiCaracteresRestantesDelComentarioDeDocumentoDeVenta.html(
      caracteresRestantes + " Caracteres restantes"
    );

    uiComentarioDeOrdenDeVenta = null;
    uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = null;
  }

  limpiarComentario() {
    var uiComentarioDeOrdenDeVenta = $("#UiComentarioDeOrdenDeVenta");
    uiComentarioDeOrdenDeVenta.val("");
    uiComentarioDeOrdenDeVenta = null;

    var uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = $(
      "#UiCaracteresRestantesDelComentarioDeDocumentoDeVenta"
    );
    uiCaracteresRestantesDelComentarioDeDocumentoDeVenta.html(
      "250 Caracteres restantes"
    );
    uiCaracteresRestantesDelComentarioDeDocumentoDeVenta = null;
  }

  obtenerBonificacionPorUnidad(
    sku: Sku,
    listaDeSkuABonificar: Array<Sku>
  ): void {
    try {
      if (sku.qty !== 0) {
        this.listaDeSkuParaBonificacion.map(boniSku => {
          if (
            sku.sku === boniSku.parentCodeSku &&
            sku.codePackUnit === boniSku.parentCodePackUnit
          ) {
            listaDeSkuABonificar.push(boniSku);
          }
        });
      }
    } catch (err) {
      notify("Error al obtener bonificacion por unidad: " + err.message);
    }
  }

  obtenerDescuentos(total: number, callback: () => void) {
    this.descuentoServicio.obtenerDescuentoPorMontoGeneral(
      this.cliente,
      total,
      descuentoPorMontoGeneral => {
        let resultadoDePromoHistorico = (this
          .listaHistoricoDePromos as any).find((promo: Promo) => {
          return promo.promoId === descuentoPorMontoGeneral.promoId;
        });
        if (resultadoDePromoHistorico) {
          let promoDeBonificacion: Promo = new Promo();
          promoDeBonificacion.promoId = descuentoPorMontoGeneral.promoId;
          promoDeBonificacion.promoName = descuentoPorMontoGeneral.promoName;
          promoDeBonificacion.frequency = descuentoPorMontoGeneral.frequency;
          this.promoServicio.validarSiAplicaPromo(
            promoDeBonificacion,
            resultadoDePromoHistorico,
            aplicaPromo => {
              if (aplicaPromo) {
                this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
              } else {
                this.descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
              }
              callback();
            },
            (resultado: Operacion) => {
              notify(resultado.mensaje);
            }
          );
        } else {
          this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
          callback();
        }
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  obtenerTotalDeOrdenDeVenta(
    descuentoDelCliente: number,
    listaDeSku: Array<Sku>
  ): number {
    let total = 0;
    listaDeSku.map((skuParaTotal: Sku) => {
      let totalPaquete: number = skuParaTotal.total;

      let descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
      let descuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();

      let resultadoDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (this
        .listaDeDescuentoPorMontoGeneralYFamilia as any).find(
        (descuentoABuscar: DescuentoPorMontoGeneralYFamilia) => {
          return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
        }
      );

      if (resultadoDescuentoPorMontoGeneralYFamilia) {
        descuentoPorMontoGeneralYFamilia = resultadoDescuentoPorMontoGeneralYFamilia;
      }

      let resultadoDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (this
        .listaDeDescuentoPorFamiliaYTipoPago as any).find(
        (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
          return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
        }
      );
      if (resultadoDescuentoPorFamiliaYTipoPago) {
        descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
      }

      totalPaquete = this.descuentoServicio.aplicarLosDescuentos(
        skuParaTotal,
        skuParaTotal.isUniqueDiscountScale,
        this.listaDeOrdenAplicarDescuentos,
        descuentoPorMontoGeneralYFamilia,
        descuentoPorFamiliaYTipoPago
      );

      total += totalPaquete;
      totalPaquete = null;
    });
    total =
      descuentoDelCliente !== 0
        ? total - (descuentoDelCliente * total) / 100
        : total;
    return total;
  }

  obtenerTotalParaEnviar(listaDeSku: Array<Sku>, sku: Sku): number {
    let total = 0;
    listaDeSku.map((skuParaTotal: Sku) => {
      let totalPaquete: number = skuParaTotal.total;

      let descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
      let descuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();

      let resultadoDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (this
        .listaDeDescuentoPorMontoGeneralYFamilia as any).find(
        (descuentoABuscar: DescuentoPorMontoGeneralYFamilia) => {
          return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
        }
      );

      if (resultadoDescuentoPorMontoGeneralYFamilia) {
        descuentoPorMontoGeneralYFamilia = resultadoDescuentoPorMontoGeneralYFamilia;
      }

      let resultadoDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (this
        .listaDeDescuentoPorFamiliaYTipoPago as any).find(
        (descuentoABuscar: DescuentoPorFamiliaYTipoPago) => {
          return descuentoABuscar.codeFamily === skuParaTotal.codeFamilySku;
        }
      );
      if (resultadoDescuentoPorFamiliaYTipoPago) {
        descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
      }

      totalPaquete = this.descuentoServicio.aplicarLosDescuentos(
        skuParaTotal,
        skuParaTotal.isUniqueDiscountScale,
        this.listaDeOrdenAplicarDescuentos,
        descuentoPorMontoGeneralYFamilia,
        descuentoPorFamiliaYTipoPago
      );

      total += totalPaquete;
      totalPaquete = null;
    });
    return total;
  }

  establecerFotoInicio(fotografia: string) {
    this.cliente.fotoDeInicioDeVisita = fotografia;
  }

  validarFotoYTareaSinGestion(_this: DocumentoVentaControlador) {
    _this.validarReglaDeTomarFotoAlInicio(
      _this,
      (fotografia: string, validarFotografia: boolean) => {
        if (validarFotografia) {
          _this.permiterRegregarPantallaAnterior = false;
          if (fotografia === "") {
            _this.finalizarTareaSinGestion(() => {
              _this.validarFotoYTareaSinGestion(_this);
            });
            return;
          } else {
            _this.establecerFotoInicio(fotografia);
          }
        } else {
          _this.permiterRegregarPantallaAnterior = true;
        }
        _this.validarSiModificaDmg(_this, () => {
          _this.cargarTarea();
          _this.cargarListaSku();
          //_this.establecerDescuentoClienteEnEtiqueta();
          _this.establecerTotalOrdenDeVenta(_this);
        });
      }
    );
  }

  validarReglaDeTomarFotoAlInicio(
    _this: DocumentoVentaControlador,
    callback: (fotografia: string, validarFotografia: boolean) => void
  ) {
    try {
      if (
        _this.cliente.fotoDeInicioDeVisita === undefined ||
        _this.cliente.fotoDeInicioDeVisita === ""
      ) {
        _this.tareaServicio.obtenerRegla(
          "TomarFotoAlInicio",
          (listaDeReglas: Regla[]) => {
            if (
              listaDeReglas.length > 0 &&
              listaDeReglas[0].enabled.toUpperCase() === "SI"
            ) {
              TomarFoto(
                fotografia => {
                  callback(fotografia, true);
                },
                (resultado: Operacion) => {
                  callback("", true);
                }
              );
            } else {
              callback("", false);
            }
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
            my_dialog("", "", "closed");
          }
        );
      } else {
        callback("", false);
      }
    } catch (ex) {
      notify("Error al validar la regla tomar foto al inicio: " + ex.message);
    }
  }

  obtenerBonificacionesPorComboEnListado(callback: () => void) {
    this.bonoServicio.obtenerBonificacionesPorCombo(
      this.cliente.bonoPorCombos,
      this.listaDeSkuOrdenDeVenta,
      (bonificacionPorCombosEnListaDeSkus: Array<BonoPorCombo>) => {
        this.listaDeSkuParaBonificacionDeCombo = bonificacionPorCombosEnListaDeSkus;
        callback();
      },
      (resultado: Operacion) => {
        notify(
          "Error al calcular bonificaciones por combo: " + resultado.mensaje
        );
        callback();
      }
    );
  }

  obtenerCombo(comboId: number) {
    for (let i = 0; i < this.listaDeSkuParaBonificacionDeCombo.length; i++) {
      if (this.listaDeSkuParaBonificacionDeCombo[i].comboId === comboId) {
        this.publicarCombo(i);

        $.mobile.changePage("UiPageBonusByCombo", {
          transition: "pop",
          reverse: true,

          showLoadMsg: false,
          data: {
            listaDeSkuBonificacionPorCombo: this
              .listaDeSkuParaBonificacionDeCombo[i],
            indice: i
          }
        });

        break;
      }
    }
  }

  validarConfiguracionDeBonificacionPorCombos(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      let estanConfiguradosLosCombos = true;
      this.listaDeSkuParaBonificacionDeCombo.map(bono => {
        if (
          estanConfiguradosLosCombos &&
          bono.bonusSubType ===
            SubTipoDeBonificacionPorCombo.Unica.toString() &&
          bono.isConfig === false &&
          bono.skusDeBonoPorCombo.length > 1
        ) {
          estanConfiguradosLosCombos = false;
          errCallback({
            codigo: -1,
            mensaje: "No se han configurado todos los combos"
          } as Operacion);
        }
      });

      if (estanConfiguradosLosCombos) {
        callback();
      }
    } catch (e) {
      errCallback({
        codigo: -1,
        mensaje: "Error al validar combos del pedido: " + e.message
      } as Operacion);
    }
  }

  validarSiModificaDmg(_this: DocumentoVentaControlador, callback: () => void) {
    try {
      _this.tareaServicio.obtenerRegla(
        "ModificacionDescuentoPorMontoGeneralMovil",
        (listaDeReglas: Regla[]) => {
          _this.usuarioPuedeModificarDescuento = false;
          if (listaDeReglas.length >= 1) {
            if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
              _this.usuarioPuedeModificarDescuento = true;
            }
          }
          callback();
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
          _this.usuarioPuedeModificarDescuento = false;
        }
      );
    } catch (err) {
      notify("Error al validar si modifica DMG: " + err.message);
      _this.usuarioPuedeModificarDescuento = false;
    }
  }

  cargarPantalla(_this: DocumentoVentaControlador) {
    _this.bonoServicio.validarSiModificaBonificacionPorCombo(
      (puedeModificar: boolean) => {
        _this.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
        _this.esPrimerMensajeDeDescuento = true;
        //_this.validarFotoYTareaSinGestion(_this);
        _this.establecerTotalOrdenDeVenta(_this);
      },
      (resultado: Operacion) => {
        _this.usuarioPuedeModificarBonificacionDeCombo = false;
        notify(
          "Error al validar si puede modificar la bonificacion por combo: " +
            resultado.mensaje
        );
      }
    );
  }

  limpiarListas(_this: DocumentoVentaControlador, callback) {
    if (_this.esPrimeraVez) {
      if (!_this.tarea.hasDraft) {
        let uiFechaEntrega = $("#FechaEntrega");
        uiFechaEntrega.val(_this.obtenerFechaFormato(new Date().toString(), false));
        uiFechaEntrega = null;
        
        _this.listaDeSkuOrdenDeVenta.length = 0;
        _this.listaDeSkuParaBonificacion.length = 0;
        _this.listaDeSkuParaBonificacionDeCombo.length = 0;
        _this.ordenDeVentaDraft = new OrdenDeVenta();
      }

      _this.cargarTarea();
      _this.esPrimeraVez = false;
      callback();
    } else {
      callback();
    }
  }

  cargarBonificacionesPorMontoGeneral(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      let totalOriginalOrdenDeVenta = this.obtenerTotalDeOrdenDeVenta(
        this.cliente.appliedDiscount,
        this.listaDeSkuOrdenDeVenta
      );
      this.bonoServicio.obtenerBonificacionPorMontoGeneral(
        this.cliente,
        totalOriginalOrdenDeVenta,
        (listaDeBonificacionesPorMontoGeneral: BonoPorMontoGeneral[]) => {
          this.validarSiAplicaLaBonificacionesPorMontoGeneral(
            listaDeBonificacionesPorMontoGeneral,
            0,
            this.listaHistoricoDePromos,
            (listaDeBonificacionesParaAplicar: BonoPorMontoGeneral[]) => {
              this.listaDeBonificacionesPorMontoGeneral = new Array<
                BonoPorMontoGeneral
              >();
              if (listaDeBonificacionesParaAplicar.length > 0) {
                this.listaDeBonificacionesPorMontoGeneral = listaDeBonificacionesParaAplicar;
                let liParaAgregar = new Array<string>();
                this.listaDeBonificacionesPorMontoGeneral.map(
                  (bono: BonoPorMontoGeneral) => {
                    liParaAgregar.push(
                      `<li esCombo='0' style='display: flex;border-bottom: 2px solid #F3F781; border-top: 2px solid #F3F781; border-left: 2px solid #F3F781; border-right: 2px solid #F3F781;'> `
                    );
                    liParaAgregar.push(
                      `<p><span style='display:inline-block;word-wrap:break-word' class='small- roboto'>Bonificación: ${bono.skuNameBonus}</span><br/> `
                    );
                    liParaAgregar.push(
                      `<span class='small-roboto'>Cod. SKU: ${bono.codeSkuBonus} UM.: ${bono.codePackUnitBonus} Cant.: ${bono.bonusQty}</span><br/> `
                    );
                    liParaAgregar.push(`</p></li> `);
                  }
                );
                let posSkuPageListview = $("#pos_skus_page_listview");
                posSkuPageListview.append(liParaAgregar.join(""));
                posSkuPageListview.listview("refresh");
                posSkuPageListview = null;
                liParaAgregar = null;
                callback();
              } else {
                callback();
              }
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
      totalOriginalOrdenDeVenta = null;
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje:
          "Error al cargar bonificaciones por monto general: " + ex.message
      } as Operacion);
    }
  }

  //----------Promo---------//
  validarSiAplicaLaBonificacionesPorMontoGeneral(
    listaDeBonificaciones: BonoPorMontoGeneral[],
    indiceDeListaDeBonificacion: number,
    listaHistoricoDePromos: Promo[],
    callBack: (listaDeBonificaciones: BonoPorMontoGeneral[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeBonificacionesTerminoDeIterar(
            listaDeBonificaciones,
            indiceDeListaDeBonificacion
          )
        ) {
          let bonificacionAValidar: BonoPorMontoGeneral =
            listaDeBonificaciones[indiceDeListaDeBonificacion];
          let resultadoDePromoHistorico = (listaHistoricoDePromos as any).find(
            (promo: Promo) => {
              return promo.promoId === bonificacionAValidar.promoId;
            }
          );
          if (resultadoDePromoHistorico) {
            let promoDeBonificacion: Promo = new Promo();
            promoDeBonificacion.promoId = bonificacionAValidar.promoId;
            promoDeBonificacion.promoName = bonificacionAValidar.promoName;
            promoDeBonificacion.frequency = bonificacionAValidar.frequency;
            this.promoServicio.validarSiAplicaPromo(
              promoDeBonificacion,
              resultadoDePromoHistorico,
              (aplicaPromo: boolean) => {
                if (!aplicaPromo) {
                  listaDeBonificaciones = listaDeBonificaciones.filter(
                    (bonificacion: BonoPorMontoGeneral) => {
                      return (
                        resultadoDePromoHistorico.promoId !==
                        bonificacion.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaLaBonificacionesPorMontoGeneral(
                  listaDeBonificaciones,
                  indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0),
                  listaHistoricoDePromos,
                  (listaDeBonificaciones: BonoPorMontoGeneral[]) => {
                    callBack(listaDeBonificaciones);
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
            promoDeBonificacion = null;
          } else {
            this.validarSiAplicaLaBonificacionesPorMontoGeneral(
              listaDeBonificaciones,
              indiceDeListaDeBonificacion + 1,
              listaHistoricoDePromos,
              (listaDeDescuento: BonoPorMontoGeneral[]) => {
                callBack(listaDeDescuento);
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          }
        } else {
          callBack(listaDeBonificaciones);
        }
      } else {
        callBack(listaDeBonificaciones);
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al validar la si aplica la bonificacion por monto general: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeBonificacionesTerminoDeIterar(
    listaDeBonificaciones: BonoPorMontoGeneral[],
    indiceDeListaDeBonificacion: number
  ): boolean {
    return (
      listaDeBonificaciones.length > 0 &&
      listaDeBonificaciones.length > indiceDeListaDeBonificacion
    );
  }

  obtenerDescuentosPorMontoYFamiliaYTipoPago(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.obtenerHistoricodePromo(
        () => {
          this.obtenerOrdenParaAplicarDescuentos(
            () => {
              let listaDePaquetes: Array<Paquete> = [];
              this.descuentoServicio.obtenerDescuentos(
                listaDePaquetes,
                this.listaDeSkuOrdenDeVenta,
                this.cliente,
                this.listaHistoricoDePromos,
                (
                  listaDescuentoPorMontoGeneralYFamilia: Array<
                    DescuentoPorMontoGeneralYFamilia
                  >,
                  listaDescuentoPorFamiliaYTipoPago: Array<
                    DescuentoPorFamiliaYTipoPago
                  >
                ) => {
                  this.listaDeDescuentoPorMontoGeneralYFamilia = listaDescuentoPorMontoGeneralYFamilia;
                  this.listaDeDescuentoPorFamiliaYTipoPago = listaDescuentoPorFamiliaYTipoPago;
                  callback();
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
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje:
          "Error al cargar bonificaciones por monto general: " + ex.message
      } as Operacion);
    }
  }

  obtenerHistoricodePromo(
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.promoServicio.obtenerHistoricoDePromosParaCliente(
        this.cliente,
        (listaHistoricoDePromos: Promo[]) => {
          this.listaHistoricoDePromos = listaHistoricoDePromos;
          callBack();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al obtener historico de promociones: ${ex.message}`
      } as Operacion);
    }
  }

  obtenerOrdenParaAplicarDescuentos(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.descuentoServicio.obtenerOrdeParaAplicarDescuentos(
        (listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento>) => {
          this.listaDeOrdenAplicarDescuentos = listaDeOrdenAplicarDescuentos;
          callback();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al obtener orden para aplicar los descuentos: ${ex.message}`
      } as Operacion);
    }
  }

  confirmarImpresionDeDocumentoDraft(
    callback: (imprimirDraft: boolean) => void
  ): void {
    navigator.notification.confirm(
      "¿Desea imprimir el documento?",
      (accionSeleccionada: number) => {
        callback(accionSeleccionada === 2);
      },
      "Imprimir Draft",
      ["No", "Si"]
    );
  }

  usuarioDeseaImprimirDraft(ordenDeVenta: OrdenDeVenta, callBack: () => void) {
    try {
      this.draftServicio.obtenerFormatoDeImpresionDeBorradorDeOrdenDeVenta(
        this.cliente,
        ordenDeVenta,
        (formatoDeImpresion: string) => {
          this.impresionServicio.validarEstadosYImprimir(
            false,
            gPrintAddress,
            formatoDeImpresion,
            true,
            (resultado: Operacion) => {
              if (resultado.resultado !== ResultadoOperacionTipo.Exitoso) {
                notify(
                  `Error al imprimir el documento debido a: ${resultado.mensaje}`
                );
              }
              callBack();
            }
          );
        },
        (resultado: Operacion) => {
          notify(
            `Error al imprimir el documento debido a: ${resultado.mensaje}`
          );
          callBack();
        }
      );
    } catch (error) {
      notify(`Error al imprimir el documento debido a: ${error.message}`);
    }
  }

  prepararReglaDeValidacionDeLimiteDeCredito(): void {
    ObtenerReglas(
      "LimiteDeCreditoCero",
      (reglas: any) => {
        if (reglas && reglas.length) {
          let regla = reglas.item(0);
          this.aplicaReglaDeValidacionDeLimiteDeCredito =
            regla && regla.ENABLED && regla.ENABLED.toUpperCase() == "SI";
        } else {
          this.aplicaReglaDeValidacionDeLimiteDeCredito = false;
        }
      },
      (error: string) => {
        notify(
          `Error al verificar si se aplica validación de limite de crédito. ${error}`
        );
      }
    );
  }
}
