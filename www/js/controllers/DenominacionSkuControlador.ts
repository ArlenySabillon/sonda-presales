class DenominacionSkuControlador {
  // ----------Propiedades----------//
  sku: Sku = new Sku();
  paquetes: Paquete[] = [];
  cliente: Cliente = new Cliente();
  tarea: Tarea = new Tarea();
  configuracionDeDecimales: ManejoDeDecimales = new ManejoDeDecimales();
  paqueteSeleccionadoActual: Paquete = new Paquete();
  descuentoActual: DescuentoPorEscalaSku = new DescuentoPorEscalaSku();
  estaAgregandoSku: boolean = false;
  listaDeSku: Sku[] = [];
  listaDeSkuDeBonificacion: Sku[] = [];
  listaDeBonificaciones: Bono[] = [];
  usuarioPuedeModificarBonificacion: boolean = true;
  listaDeDescuento: DescuentoPorEscalaSku[] = [];
  usuarioPuedeModificarDescuentos: boolean = false;
  estaValidandoElDescuento: boolean = false;
  listaHistoricoDePromos: Promo[] = [];
  descuentoPorMontoGeneral: DescuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
  usuarioEstaRegresandoAPantallaAnterior: boolean = false;
  descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
  descuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
  listaDeSkuOrdenDeVenta: Sku[] = [];
  listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento> = [];
  listaDePreciosEspeciales: Array<PrecioEspecial>;
  usuarioPuedeModificarPrecioDeProducto: boolean = false;
  listadoDeImagenesDeProductoSeleccionado: Array<string> = [];

  // ----------Fin Propiedades----------//

  // ----------Servicios----------//
  paqueteServicio: PaqueteServicio = new PaqueteServicio();
  historicoDeArticuloServicio: HistoricoDeArticuloServicio = new HistoricoDeArticuloServicio();
  precioSkuServicio: PrecioSkuServicio = new PrecioSkuServicio();
  tareaServicio: TareaServcio = new TareaServcio();
  clienteServicio: ClienteServicio = new ClienteServicio();
  bonoServicio: BonoServicio = new BonoServicio();
  ventasPorMultiploServicio: VentasPorMultiploServicio = new VentasPorMultiploServicio();
  descuentoServicio: DescuentoServicio = new DescuentoServicio();
  promoServicio: PromoServicio = new PromoServicio();
  precioEspecialServicio: PrecioEspecialServicio = new PrecioEspecialServicio();
  imagenDeSkuServicio: ImagenDeSkuServicio = new ImagenDeSkuServicio();
  // ----------Fin Servicios----------//

  // ----------Constructor y Delegados----------//
  constructor(public mensajero: Messenger) {}

  delegarDenominacionSkuControlador(): void {
    let este: DenominacionSkuControlador = this;

    document.addEventListener(
      "backbutton",
      () => {
        este.usuarioEstaRegresandoAPantallaAnterior = true;
        este.mostrarPantallaAnterior();
      },
      true
    );

    $(document).on("pagebeforechange", (event, data) => {
      if (data.toPage === "skucant_page") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.sku = data.options.data.sku;
        este.estaAgregandoSku = data.options.data.estaAgregando;
        este.configuracionDeDecimales =
          data.options.data.configuracionDecimales;
        este.listaDeSku = <Array<Sku>>(
          JSON.parse(JSON.stringify(data.options.data.listaSku))
        );
        este.listaDeSkuDeBonificacion = <Array<Sku>>(
          JSON.parse(
            JSON.stringify(data.options.data.listaDeSkuParaBonificacion)
          )
        );
        este.usuarioEstaRegresandoAPantallaAnterior = false;
        este.listaDeSkuOrdenDeVenta = data.options.data.listaDeSkuOrdenDeVenta;
        este.cargarPantalla();
        $.mobile.changePage("#skucant_page");
      }
    });

    $("#UiBotonListadoDeUnidadesDeMedida").bind("touchstart", () => {
      este.usuarioSeleccionoPaquete();
    });

    $("#UiBotonAceptarCantidadSku").bind("touchstart", () => {
      BloquearPantalla();
      este.usuarioCambioCantidaDePaquete(() => {
        este.estaValidandoElDescuento = true;
        este.validarBonificacionesIngresadas(
          () => {
            este.validarIngresoDeDescuento(
              (resultado: Operacion) => {
                notify(resultado.mensaje);
                DesBloquearPantalla();
                este.estaValidandoElDescuento = false;
              },
              () => {
                este.estaValidandoElDescuento = false;
                let to = setTimeout(() => {
                  clearTimeout(to);
                  este.usuarioDeseaAceptarElSku();
                }, 300);
              }
            );
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
            DesBloquearPantalla();
          }
        );
      });
    });

    $("#UiTextoCantidadUnidadMedida").on("focusout", () => {
      if (!este.usuarioEstaRegresandoAPantallaAnterior) {
        if (!este.estaValidandoElDescuento) {
          este.usuarioCambioCantidaDePaquete(() => {
            este.validarBonificacionesIngresadas(
              () => {
                este.validarIngresoDeDescuento((resultado: Operacion) => {
                  notify(resultado.mensaje);
                });
              },
              (resultado: Operacion) => {
                notify(resultado.mensaje);
              }
            );
          });
        }
      }
    });

    $("#skucant_page").bind("swiperight", () => {
      este.usuarioDeseaVerResumenDelSku();
    });

    $("#UiTextoDescuentoSku").on("focusout", () => {
      este.validarIngresoDeDescuento(() => {
        DesBloquearPantalla();
      });
    });

    $("#UiTextoCantidadUnidadMedida").on("keypress", e => {
      if (e.keyCode === 13) {
        e.preventDefault();

        let UiBotonAceptarCantidadSku: JQuery = $("#UiBotonAceptarCantidadSku");
        UiBotonAceptarCantidadSku.focus();
        UiBotonAceptarCantidadSku.trigger("touchstart");
        UiBotonAceptarCantidadSku = null;
      }
    });

    $("#UiTxtPrecioNegociadoConCliente").on(
      "focusout",
      (e: JQueryEventObject) => {
        e.preventDefault();
        if (!este.usuarioEstaRegresandoAPantallaAnterior) {
          if (!este.estaValidandoElDescuento) {
            let precioNegociadoConCliente: JQuery = $(
              "#UiTxtPrecioNegociadoConCliente"
            );

            if (
              precioNegociadoConCliente.val() === "" ||
              isNaN(precioNegociadoConCliente.val()) ||
              parseFloat(precioNegociadoConCliente.val()) === 0
            ) {
              notify("Debe ingresar un monto valido.");
              precioNegociadoConCliente.focus();
              return false;
            }

            este.obtenerPaqueteSeleccionado(
              (paqueteSeleccionado: Paquete) => {
                if (
                  paqueteSeleccionado.originalPrice >
                  parseFloat(precioNegociadoConCliente.val())
                ) {
                  notify(
                    `El precio negociado no puede ser menor a ${este.configuracionDeDecimales.currencySymbol}${paqueteSeleccionado.originalPrice}`
                  );
                  return;
                }

                este.usuarioCambioCantidaDePaquete(() => {
                  este.validarBonificacionesIngresadas(
                    () => {
                      este.validarIngresoDeDescuento((resultado: Operacion) => {
                        notify(resultado.mensaje);
                      });
                    },
                    (resultado: Operacion) => {
                      notify(resultado.mensaje);
                    }
                  );
                });
              },
              (resultado: Operacion) => {
                notify(resultado.mensaje);
              }
            );
          }
        }
      }
    );

    $("#skucant_page").on(
      "click",
      "#UiSkuImageContainer div",
      (e: JQueryEventObject) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let identificadorDeImagen: string = (e as any).currentTarget.attributes[
          "id"
        ].nodeValue;
        let indiceDeImagen = identificadorDeImagen.substring(12);
        if (indiceDeImagen && indiceDeImagen.length > 0) {
          let imagenSeleccionada = this.listadoDeImagenesDeProductoSeleccionado[
            parseInt(indiceDeImagen)
          ];
          if (imagenSeleccionada) {
            this.imagenDeSkuServicio.usuarioDeseaVerImagenDeProductoEnPantallaCompleta(
              imagenSeleccionada
            );
          }
        }
      }
    );
  }
  // ----------Fin Constructor y Delegados----------//

  // ----------Carga de Pantallas----------//
  cargarPantalla(): void {
    try {
      this.listadoDeImagenesDeProductoSeleccionado.length = 0;
      my_dialog(
        "Espere",
        "Preparando información, por favor espere...",
        "open"
      );
      let uiEtiquetaCodigoYNombreDeSku: JQuery = $(
        "#UiEtiquetaCodigoYNombreDeSku"
      );
      uiEtiquetaCodigoYNombreDeSku.text(
        `${this.sku.sku}/${this.sku.skuDescription}`
      );
      uiEtiquetaCodigoYNombreDeSku = null;

      this.obtenerAutorizacionDeModificacionDePrecioDeProducto(() => {
        this.generarListadoDePaquetes(
          () => {
            this.obtenerHistoricodePromo(
              () => {
                this.obtenerOrdenParaAplicarDescuentos(
                  () => {
                    this.cargarBonificaciones(
                      () => {
                        this.cargarDescuentos(
                          () => {
                            this.cargarPreciosEspeciales(
                              () => {
                                if (this.estaAgregandoSku) {
                                  this.seleccionarPrimerPaquete();
                                  this.prepararImagenesDeProducto(() => {
                                    this.cargarControlesDeDescuento(
                                      () => {
                                        my_dialog("", "", "close");
                                      },
                                      (resultado: Operacion) => {}
                                    );
                                  });
                                } else {
                                  this.cargarListaSkuAPaquetes(
                                    () => {
                                      this.procesarPaquetes(
                                        (paquetes: Paquete[]) => {
                                          this.paquetes = paquetes;
                                          this.paquetes.forEach(
                                            (paquete: Paquete) => {
                                              paquete.codeFamily = this.sku.codeFamilySku;
                                            }
                                          );

                                          this.cargarListaDeSkuBonficadas(
                                            () => {
                                              this.obtenerBonificacionesDelPaqueteSeleccionado(
                                                (
                                                  listaBonificaciones: Bono[]
                                                ) => {
                                                  this.cargarControlesBonificaciones(
                                                    listaBonificaciones,
                                                    () => {
                                                      this.cargarControlesDeDescuento(
                                                        () => {
                                                          this.obtenerTotalDePaquetesConDescuentoAplicados(
                                                            (total: number) => {
                                                              this.tarea.salesOrderTotal -= total;
                                                              this.cargarDatosDelPaqueteSeleccionado(
                                                                () => {
                                                                  this.prepararImagenesDeProducto(
                                                                    () => {
                                                                      my_dialog(
                                                                        "",
                                                                        "",
                                                                        "close"
                                                                      );
                                                                    }
                                                                  );
                                                                }
                                                              );
                                                            },
                                                            (
                                                              resultado: Operacion
                                                            ) => {
                                                              my_dialog(
                                                                "",
                                                                "",
                                                                "close"
                                                              );
                                                              notify(
                                                                resultado.mensaje
                                                              );
                                                            }
                                                          );
                                                        },
                                                        (
                                                          resultado: Operacion
                                                        ) => {
                                                          my_dialog(
                                                            "",
                                                            "",
                                                            "close"
                                                          );
                                                          notify(
                                                            resultado.mensaje
                                                          );
                                                        }
                                                      );
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
                                            },
                                            (resultado: Operacion) => {
                                              my_dialog("", "", "close");
                                              notify(resultado.mensaje);
                                            }
                                          );
                                        },
                                        (resultado: Operacion) => {
                                          notify(resultado.mensaje);
                                        }
                                      );
                                    },
                                    (resultado: Operacion) => {
                                      my_dialog("", "", "close");
                                      notify(resultado.mensaje);
                                    }
                                  );
                                }
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
      });
    } catch (ex) {
      my_dialog("", "", "close");
      notify(`Error al cargar la pantalla: ${ex.message}`);
    }
  }

  generarListadoDePaquetes(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.paqueteServicio.obtenerDenominacionesPorSku(
        this.sku,
        this.configuracionDeDecimales,
        this.cliente,
        true,
        (paquetes: Paquete[]) => {
          this.historicoDeArticuloServicio.colocarSugerenciaDeVentaAPaquetes(
            TIpoDeDocumento.PreVenta,
            this.cliente,
            this.sku,
            paquetes,
            this.configuracionDeDecimales,
            (paquetesSugeridos: Paquete[]) => {
              this.paquetes = paquetesSugeridos;
              this.paquetes.forEach((paquete: Paquete) => {
                paquete.codeFamily = this.sku.codeFamilySku;
              });
              this.procesarPaquetes(
                (paquetes: Paquete[]) => {
                  this.paquetes = paquetes.filter((paquete: Paquete) => {
                    return paquete.price !== -1;
                  });
                  this.limpiarControles(
                    () => {
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
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al generar listado de paquetes: ${ex.message}`
      });
    }
  }

  procesarPaquetes(
    callback: (paquete: Paquete[]) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    this.precioSkuServicio.obtenerPreciosDePaquetes(
      this.cliente,
      this.sku,
      this.paquetes,
      this.configuracionDeDecimales,
      (paquetes: Paquete[]) => {
        callback(paquetes);
      },
      (resultado: Operacion) => {
        errCallback(<Operacion>{ codigo: -1, mensaje: resultado.mensaje });
      }
    );
  }

  limpiarControles(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      // -----Total del Pedido-----//
      let uiTotalCantidadSkus: JQuery = $("#UiTotalCantidadSkus");
      uiTotalCantidadSkus.text(
        DarFormatoAlMonto(
          format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)
        )
      );
      uiTotalCantidadSkus = null;
      // -----Fin Total del Pedido-----//

      // -----Cantidad del Sku-----//
      let uiTextoCantidadUnidadMedida: JQuery = $(
        "#UiTextoCantidadUnidadMedida"
      );
      uiTextoCantidadUnidadMedida.text("");
      uiTextoCantidadUnidadMedida = null;
      // -----Fin Cantidad del Sku-----//

      // -----Historico del Sku-----

      this.limpiarInformacionDeHistoricoDeSku();

      // -----Fin Historico del Sku-----

      // -----Descuento del Sku-----//
      let uiEtiquetaDescuentoSkuMaximo: JQuery = $(
        "#UiEtiquetaDescuentoSkuMaximo"
      );
      uiEtiquetaDescuentoSkuMaximo.text("Descuento 0%");
      uiEtiquetaDescuentoSkuMaximo = null;

      let uiTextoDescuentoSku: JQuery = $("#UiTextoDescuentoSku");
      uiTextoDescuentoSku.text("");
      uiTextoDescuentoSku = null;

      let uiLiDescuentoSkuMaximo: JQuery = $("#UiLiDescuentoSkuMaximo");
      uiLiDescuentoSkuMaximo.hide();
      uiLiDescuentoSkuMaximo = null;
      // -----Fin Descuento del Sku-----//

      // -----Totales del Sku-----//
      let uiEtiquetaPrecioUnidadMedida: JQuery = $(
        "#UiEtiquetaPrecioUnidadMedida"
      );
      uiEtiquetaPrecioUnidadMedida.text(
        `Precio: ${DarFormatoAlMonto(
          format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)
        )}`
      );
      uiEtiquetaPrecioUnidadMedida = null;

      let uiEtiquetaTotalUnidadMedida: JQuery = $(
        "#UiEtiquetaTotalUnidadMedida"
      );
      uiEtiquetaTotalUnidadMedida.text(
        `Precio: ${DarFormatoAlMonto(
          format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)
        )}`
      );
      uiEtiquetaTotalUnidadMedida = null;

      let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
        "#UiEtiquetaTotalCDUnidadMedida"
      );
      uiEtiquetaTotalCdUnidadMedida.text(
        `Total CD: ${DarFormatoAlMonto(
          format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)
        )}`
      );
      uiEtiquetaTotalCdUnidadMedida.hide();
      uiEtiquetaTotalCdUnidadMedida = null;
      // -----Fin Totales del Sku-----//

      // -----Bonificaciones del Sku-----//
      let uiListaDeBonificacionesUnidadMedida: JQuery = $(
        "#UiListaDeBonificacionesUnidadMedida"
      );
      uiListaDeBonificacionesUnidadMedida.children().remove("li");
      uiListaDeBonificacionesUnidadMedida = null;

      let uiAcordionDeBonificacionesUnidadMedida: JQuery = $(
        "#UiAcordionDeBonificacionesUnidadMedida"
      );
      uiAcordionDeBonificacionesUnidadMedida.hide();
      uiAcordionDeBonificacionesUnidadMedida = null;
      // -----Fin Bonificaciones del Sku-----//

      // -----Vento por Multiplo-----//
      let uiEtiquetaUnidadesTotales: JQuery = $("#UiEtiquetaCantidadesTotales");
      uiEtiquetaUnidadesTotales.text("Cantidad Total: 0");
      uiEtiquetaUnidadesTotales.css("display", "none");
      uiEtiquetaUnidadesTotales = null;
      // -----Fin Vento por Multiplo-----//

      // ---- Modificacion de precio de producto -------

      let uiTxtPrecioNegociadoConCliente: JQuery = $(
        "#UiTxtPrecioNegociadoConCliente"
      );
      uiTxtPrecioNegociadoConCliente.val(
        format_number(0, this.configuracionDeDecimales.defaultDisplayDecimals)
      );
      uiTxtPrecioNegociadoConCliente = null;

      callback();
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al limpiar los controles: ${ex.message}`
      });
    }
  }

  seleccionarPrimerPaquete(): void {
    try {
      if (this.paquetes) {
        this.establecerPaqueteSeleccionado(
          this.paquetes[this.paquetes.length - 1].codePackUnit,
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          },
          () => {
            this.cargarDatosDelPaqueteSeleccionado();
          }
        );
      }
    } catch (ex) {
      notify(`Error al seleccionar el primer paquete: ${ex.message}`);
    }
  }

  cargarListaSkuAPaquetes(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.paquetes.forEach((paquete: Paquete) => {
        let resultadoDeBusqueda: Sku[] = this.listaDeSku.filter((sku: Sku) => {
          return sku.codePackUnit === paquete.codePackUnit;
        });
        if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
          paquete.qty = resultadoDeBusqueda[0].qty;
          paquete.appliedDiscount = resultadoDeBusqueda[0].appliedDiscount;
          paquete.discountType = resultadoDeBusqueda[0].discountType;
          if (
            paquete.codePackUnit ===
            resultadoDeBusqueda[0].unidadMedidaSeleccionada
          ) {
            this.establecerPaqueteSeleccionado(
              resultadoDeBusqueda[0].unidadMedidaSeleccionada,
              (resultado: Operacion) => {
                errCallback(resultado);
              },
              () => {
                callback();
              }
            );
          }
        }
        resultadoDeBusqueda = null;
      });
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al cargar listado de sku a paquetes: ${ex.message}`
      });
    }
  }

  establecerPaqueteSeleccionado(
    codePackUnit: string,
    errCallback: (resultado: Operacion) => void,
    callback?: () => void
  ): void {
    try {
      this.sku.unidadMedidaSeleccionada = codePackUnit;
      this.paqueteSeleccionadoActual.packUnit = codePackUnit === "" ? 0 : 1;
      this.paqueteSeleccionadoActual.codePackUnit = codePackUnit;
      this.paqueteSeleccionadoActual.isSaleByMultiple = false;
      this.ventasPorMultiploServicio.verificarVentasPorMultiploSkuUm(
        this.cliente,
        this.sku,
        (skuMultiplo: VentaPorMultiplo) => {
          if (skuMultiplo.apply) {
            let promoParaValidar: Promo = new Promo();
            promoParaValidar.promoId = skuMultiplo.promoId;
            promoParaValidar.promoName = skuMultiplo.promoName;
            promoParaValidar.frequency = skuMultiplo.frequency;

            let resultadoDePromoHistorico: Promo = (this
              .listaHistoricoDePromos as any).find((promo: Promo) => {
              return promo.promoId === skuMultiplo.promoId;
            });

            if (resultadoDePromoHistorico) {
              this.promoServicio.validarSiAplicaPromo(
                promoParaValidar,
                resultadoDePromoHistorico,
                aplicaPromo => {
                  if (aplicaPromo) {
                    this.paqueteSeleccionadoActual.isSaleByMultiple = true;
                    this.paqueteSeleccionadoActual.multiple =
                      skuMultiplo.multiple;
                    promoParaValidar.apply = true;
                    this.paqueteSeleccionadoActual.promoVentaPorMultiplo = promoParaValidar;
                    promoParaValidar = null;
                  } else {
                    this.paqueteSeleccionadoActual.promoVentaPorMultiplo = new Promo();
                  }
                  if (callback) {
                    callback();
                  }
                },
                (resultado: Operacion) => {
                  notify(resultado.mensaje);
                }
              );
            } else {
              this.paqueteSeleccionadoActual.isSaleByMultiple = true;
              this.paqueteSeleccionadoActual.multiple = skuMultiplo.multiple;
              promoParaValidar.apply = true;
              this.paqueteSeleccionadoActual.promoVentaPorMultiplo = promoParaValidar;

              if (callback) {
                callback();
              }
            }
          } else {
            if (callback) {
              callback();
            }
          }
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al establecer el paquete seleccionado: ${ex.message}`
      });
    }
  }

  // ----------Fin Carga de Pantallas----------//

  // ----------Seleecion de Paquetes----------//
  usuarioCambioCantidaDePaquete(callback?: () => void): void {
    try {
      let uiTextoCantidadUnidadMedida: JQuery = $(
        "#UiTextoCantidadUnidadMedida"
      );
      const cantidad: number = parseFloat(
        uiTextoCantidadUnidadMedida.val() === ""
          ? 0
          : uiTextoCantidadUnidadMedida.val()
      );
      uiTextoCantidadUnidadMedida = null;
      if (cantidad > 0) {
        this.validarSiCambioLaCantidad(
          (esIgualLaCantidad: boolean) => {
            if (
              esIgualLaCantidad &&
              !this.usuarioPuedeModificarPrecioDeProducto
            ) {
              if (callback) {
                callback();
              }
            } else {
              this.obtenerPaqueteSeleccionado(
                (paquete: Paquete) => {
                  let uiTextoCantidadUnidadMedida: JQuery = $(
                    "#UiTextoCantidadUnidadMedida"
                  );
                  const cantidad: number = parseFloat(
                    uiTextoCantidadUnidadMedida.val() === ""
                      ? 0
                      : uiTextoCantidadUnidadMedida.val()
                  );
                  uiTextoCantidadUnidadMedida = null;
                  paquete.qty =
                    cantidad *
                    (this.paqueteSeleccionadoActual.isSaleByMultiple
                      ? this.paqueteSeleccionadoActual.multiple
                      : 1);
                  paquete.promoVentaPorMultiplo = this.paqueteSeleccionadoActual.promoVentaPorMultiplo;
                  this.validarSiCambioElPrecioDelPaquete(
                    () => {
                      if (callback) {
                        callback();
                      }
                    },
                    (resultado: Operacion) => {
                      notify(resultado.mensaje);
                      DesBloquearPantalla();
                    }
                  );
                },
                (resultado: Operacion) => {
                  notify(resultado.mensaje);
                  DesBloquearPantalla();
                }
              );
            }
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
            DesBloquearPantalla();
          }
        );
      } else {
        notify(`La cantidad tiene que ser mayor a cero.`);
        DesBloquearPantalla();
      }
    } catch (ex) {
      notify(`Error al cambar cantidad de paquete: ${ex.messages}`);
      DesBloquearPantalla();
    }
  }

  validarSiCambioElPrecioDelPaquete(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.procesarPaquetes(
        (paquetes: Paquete[]) => {
          this.paquetes = paquetes;
          this.paquetes.forEach((paquete: Paquete) => {
            paquete.codeFamily = this.sku.codeFamilySku;
          });
          this.obtenerBonificacionesDelPaqueteSeleccionado(
            (listaBonificaciones: Bono[]) => {
              this.cargarControlesBonificaciones(
                listaBonificaciones,
                () => {
                  this.cargarControlesDeDescuento(
                    () => {
                      this.validarIngresoDeDescuento(
                        (resultado: Operacion) => {
                          notify(resultado.mensaje);
                        },
                        () => {
                          this.cargarDatosDelPaqueteSeleccionado(() => {
                            callback();
                          });
                        }
                      );
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
            },
            (resultado: Operacion) => {
              notify(resultado.mensaje);
            }
          );
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar si cambio el precio del paquete: ${ex.message}`
      });
    }
  }

  usuarioSeleccionoPaquete(): void {
    try {
      if (!this.paquetes) {
        return;
      }

      let listaDeUnidadesDeMedida: Object[] = [];

      this.paquetes.forEach(p =>
        listaDeUnidadesDeMedida.push({
          text: p.descriptionPackUnit,
          value: p.codePackUnit
        })
      );

      let configOptions: any = {
        title: "Listado de Unidades de Medida",
        items: listaDeUnidadesDeMedida,
        doneButtonLabel: "Ok",
        cancelButtonLabel: "Cancelar"
      };
      ShowListPicker(configOptions, item => {
        this.validarBonificacionesIngresadas(
          () => {
            this.validarIngresoDeDescuento(
              (resultado: Operacion) => {
                notify(resultado.mensaje);
                DesBloquearPantalla();
              },
              () => {
                this.establecerPaqueteSeleccionado(
                  item,
                  (resultado: Operacion) => {
                    notify(resultado.mensaje);
                  },
                  () => {
                    let uiTextoCantidadUnidadMedida: JQuery = $(
                      "#UiTextoCantidadUnidadMedida"
                    );
                    uiTextoCantidadUnidadMedida.focus();
                    uiTextoCantidadUnidadMedida.trigger("keyup");
                    uiTextoCantidadUnidadMedida = null;
                    this.obtenerBonificacionesDelPaqueteSeleccionado(
                      (listaBonificaciones: Bono[]) => {
                        this.cargarControlesBonificaciones(
                          listaBonificaciones,
                          () => {
                            this.cargarControlesDeDescuento(
                              () => {
                                this.cargarDatosDelPaqueteSeleccionado();
                              },
                              (resultado: Operacion) => {
                                notify(resultado.mensaje);
                                DesBloquearPantalla();
                              }
                            );
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
                  }
                );
              }
            );
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      });
      configOptions = null;
      listaDeUnidadesDeMedida = null;
    } catch (ex) {
      notify(`Error al seleccionar la unidad de medida: ${ex.message}`);
    }
  }

  cargarDatosDelPaqueteSeleccionado(callback?: () => void): void {
    try {
      this.obtenerPaqueteSeleccionado(
        (paquete: Paquete) => {
          let uiTextoCantidadUnidadMedida: JQuery = $(
            "#UiTextoCantidadUnidadMedida"
          );

          let cantidad: number = this.paqueteSeleccionadoActual.isSaleByMultiple
            ? paquete.qty / this.paqueteSeleccionadoActual.multiple
            : paquete.qty;

          uiTextoCantidadUnidadMedida.val(
            paquete.qty === 0
              ? ""
              : format_number(
                  cantidad,
                  this.configuracionDeDecimales.defaultDisplayDecimals
                )
          );

          if (paquete.lastQtySold && paquete.lastQtySold > 0) {
            // ----- Historico del Sku -----
            let uiEtiquetaFechaUltimaCompra: JQuery = $(
              "#UiEtiquetaFechaUltimaCompra"
            );
            uiEtiquetaFechaUltimaCompra.text(
              `Última compra: (${
                paquete.lastSaleDate && paquete.lastSaleDate.indexOf("T") !== -1
                  ? paquete.lastSaleDate.split("T")[0]
                  : "N/A"
              })`
            );
            uiEtiquetaFechaUltimaCompra = null;

            let uiEtiquetaCantidadUltimaCompra: JQuery = $(
              "#UiEtiquetaCantidadUltimaCompra"
            );
            uiEtiquetaCantidadUltimaCompra.text(
              format_number(
                paquete.lastQtySold,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )
            );
            uiEtiquetaCantidadUltimaCompra = null;

            let uiEtiquetaUnidadDeMedidaUltimaCompra: JQuery = $(
              "#UiEtiquetaUnidadDeMedidaUltimaCompra"
            );
            uiEtiquetaUnidadDeMedidaUltimaCompra.text(
              paquete.lastCodePackUnitSold
            );
            uiEtiquetaUnidadDeMedidaUltimaCompra = null;

            let uiEtiquetaPrecioUltimaCompra: JQuery = $(
              "#UiEtiquetaPrecioUltimaCompra"
            );
            uiEtiquetaPrecioUltimaCompra.text(
              `${this.configuracionDeDecimales.currencySymbol}${format_number(
                paquete.lastPriceSold,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )}`
            );
            uiEtiquetaPrecioUltimaCompra = null;

            let uiLiUltimoPedidoUnidadMedida: JQuery = $(
              "#UiLiUltimoPedidoUnidadMedida"
            );
            uiLiUltimoPedidoUnidadMedida.show();
            uiLiUltimoPedidoUnidadMedida = null;
          } else {
            this.limpiarInformacionDeHistoricoDeSku();
          }

          uiTextoCantidadUnidadMedida = null;
          let uiEtiquetaUnidadDeMedida: JQuery = $("#UiEtiquetaUnidadDeMedida");
          uiEtiquetaUnidadDeMedida.text(paquete.codePackUnit);
          uiEtiquetaUnidadDeMedida = null;

          let uiEtiquetaUnidadesTotales: JQuery = $(
            "#UiEtiquetaCantidadesTotales"
          );

          if (this.paqueteSeleccionadoActual.isSaleByMultiple) {
            uiEtiquetaUnidadesTotales.css("display", "block");
            uiEtiquetaUnidadesTotales.text(
              `Cantidad Total: ${format_number(
                cantidad * this.paqueteSeleccionadoActual.multiple,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )}`
            );
          } else {
            uiEtiquetaUnidadesTotales.css("display", "none");
          }
          cantidad = null;
          uiEtiquetaUnidadesTotales = null;

          let uiEtiquetaPrecioOriginalDePaqueteSeleccionado: JQuery = $(
            "#UiEtiquetaPrecioOriginalDePaqueteSeleccionado"
          );

          let uiTxtPrecioNegociadoConCliente: JQuery = $(
            "#UiTxtPrecioNegociadoConCliente"
          );
          if (this.usuarioPuedeModificarPrecioDeProducto) {
            uiEtiquetaPrecioOriginalDePaqueteSeleccionado.text(
              `Mínimo ${
                this.configuracionDeDecimales.currencySymbol
              }${format_number(
                paquete.originalPrice,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )}`
            );
            uiTxtPrecioNegociadoConCliente.val(
              format_number(
                paquete.price < paquete.originalPrice
                  ? paquete.originalPrice
                  : paquete.price,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )
            );
          } else {
            uiEtiquetaPrecioOriginalDePaqueteSeleccionado.text("");
            uiTxtPrecioNegociadoConCliente.val(0);
          }
          uiEtiquetaPrecioOriginalDePaqueteSeleccionado = null;

          let uiEtiquetaPrecioUnidadMedida: JQuery = $(
            "#UiEtiquetaPrecioUnidadMedida"
          );
          uiEtiquetaPrecioUnidadMedida.text(
            `Precio: ${DarFormatoAlMonto(
              format_number(
                paquete.price,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )
            )}`
          );
          uiEtiquetaPrecioUnidadMedida = null;

          let uiEtiquetaTotalUnidadMedida: JQuery = $(
            "#UiEtiquetaTotalUnidadMedida"
          );
          uiEtiquetaTotalUnidadMedida.text(
            `Total: ${DarFormatoAlMonto(
              format_number(
                paquete.price * paquete.qty,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )
            )}`
          );
          uiEtiquetaTotalUnidadMedida = null;

          this.obtenerTotalDePaquetesConDescuentoAplicados(
            (total: number) => {
              this.ObtenerTotalDeLaOrden(
                (totalConDes: number) => {
                  let uiTotalCantidadSkus: JQuery = $("#UiTotalCantidadSkus");
                  let totalDeLaOrden: number = totalConDes + total;

                  let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
                    "#UiEtiquetaTotalCDUnidadMedida"
                  );
                  uiEtiquetaTotalCdUnidadMedida.text(
                    `Total CD: ${DarFormatoAlMonto(
                      format_number(
                        total,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}`
                  );
                  uiEtiquetaTotalCdUnidadMedida = null;

                  if (
                    totalDeLaOrden >=
                      this.tarea.discountPerGeneralAmountLowLimit &&
                    this.tarea.discountPerGeneralAmountHighLimit >=
                      totalDeLaOrden
                  ) {
                    uiTotalCantidadSkus.text(
                      DarFormatoAlMonto(
                        format_number(
                          totalDeLaOrden -
                            totalDeLaOrden *
                              (this.cliente.appliedDiscount / 100),
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )
                      )
                    );
                    if (callback) {
                      callback();
                    }
                  } else {
                    if (totalDeLaOrden > 0) {
                      this.obtenerDescuentoPorMontoGeneral(
                        totalDeLaOrden,
                        () => {
                          if (this.descuentoPorMontoGeneral.apply) {
                            if (
                              this.seAplicaElDescuentoModificado(
                                this.cliente.discount,
                                this.cliente.appliedDiscount,
                                this.descuentoPorMontoGeneral.discount
                              )
                            ) {
                              uiTotalCantidadSkus.text(
                                DarFormatoAlMonto(
                                  format_number(
                                    totalDeLaOrden -
                                      totalDeLaOrden *
                                        (this.cliente.appliedDiscount / 100),
                                    this.configuracionDeDecimales
                                      .defaultDisplayDecimals
                                  )
                                )
                              );
                            } else {
                              uiTotalCantidadSkus.text(
                                DarFormatoAlMonto(
                                  format_number(
                                    totalDeLaOrden -
                                      totalDeLaOrden *
                                        (this.descuentoPorMontoGeneral
                                          .discount /
                                          100),
                                    this.configuracionDeDecimales
                                      .defaultDisplayDecimals
                                  )
                                )
                              );
                            }
                            uiTotalCantidadSkus = null;
                            if (callback) {
                              callback();
                            }
                          } else {
                            uiTotalCantidadSkus.text(
                              DarFormatoAlMonto(
                                format_number(
                                  totalDeLaOrden,
                                  this.configuracionDeDecimales
                                    .defaultDisplayDecimals
                                )
                              )
                            );
                            uiTotalCantidadSkus = null;
                            if (callback) {
                              callback();
                            }
                          }
                        },
                        (resultado: Operacion) => {
                          notify(resultado.mensaje);
                        }
                      );
                    } else {
                      uiTotalCantidadSkus.text(
                        DarFormatoAlMonto(
                          format_number(
                            0,
                            this.configuracionDeDecimales.defaultDisplayDecimals
                          )
                        )
                      );
                      uiTotalCantidadSkus = null;
                      if (callback) {
                        callback();
                      }
                    }
                  }
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
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (ex) {
      notify(`Error al cargar datos del paquete seleccionado: ${ex.message}`);
    }
  }

  obtenerPaqueteSeleccionado(
    callback: (paquete: Paquete) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let resultadoDeBusqueda: Paquete[] = this.paquetes.filter(
        (paquete: Paquete) => {
          return (
            paquete.codePackUnit === this.paqueteSeleccionadoActual.codePackUnit
          );
        }
      );
      if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
        callback(resultadoDeBusqueda[0]);
      } else {
        callback(null);
      }
      resultadoDeBusqueda = null;
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener el paquete seleccionado: ${ex.message}`
      });
    }
  }

  // ----------Fin Seleecion de Paquetes----------//

  // ----------Aceptar Paquetes----------//
  usuarioDeseaAceptarElSku(): void {
    try {
      this.validarElIngresoDeCantidadesDePaquetes(
        () => {
          this.obtenerPaqueteProcesadosEnSku(
            (listaDeSku: Sku[]) => {
              if (gIsOnline === EstaEnLinea.No) {
                this.tareaServicio.obtenerRegla(
                  "AplicarReglasComerciales",
                  (listaDeReglasAplicarReglasComerciales: Regla[]) => {
                    if (
                      listaDeReglasAplicarReglasComerciales.length > 0 &&
                      listaDeReglasAplicarReglasComerciales[0].enabled.toUpperCase() ===
                        "SI"
                    ) {
                      this.clienteServicio.validarCuentaCorriente(
                        this.cliente,
                        listaDeSku,
                        this.tarea.salesOrderType,
                        this.configuracionDeDecimales,
                        () => {
                          this.publicarEntidades(
                            listaDeSku,
                            () => {
                              DesBloquearPantalla();
                              window.history.back();
                            },
                            (resultado: Operacion) => {
                              DesBloquearPantalla();
                              notify(resultado.mensaje);
                            }
                          );
                        },
                        (resultado: Operacion) => {
                          DesBloquearPantalla();
                          notify(resultado.mensaje);
                        }
                      );
                    } else {
                      this.publicarEntidades(
                        listaDeSku,
                        () => {
                          DesBloquearPantalla();
                          window.history.back();
                        },
                        (resultado: Operacion) => {
                          DesBloquearPantalla();
                          notify(resultado.mensaje);
                        }
                      );
                    }
                  },
                  (resultado: Operacion) => {
                    DesBloquearPantalla();
                    notify(resultado.mensaje);
                    my_dialog("", "", "closed");
                  }
                );
              } else {
                this.publicarEntidades(
                  listaDeSku,
                  () => {
                    DesBloquearPantalla();
                    window.history.back();
                  },
                  (resultado: Operacion) => {
                    DesBloquearPantalla();
                    notify(resultado.mensaje);
                  }
                );
              }
            },
            (resultado: Operacion) => {
              notify(resultado.mensaje);
            }
          );
        },
        (resultado: Operacion) => {
          DesBloquearPantalla();
          notify(resultado.mensaje);
        }
      );
    } catch (ex) {
      notify(ex.message);
    }
  }

  validarElIngresoDeCantidadesDePaquetes(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let resultadoDeBusqueda: Paquete[] = this.paquetes.filter(
        (paquete: Paquete) => {
          return paquete.qty !== 0;
        }
      );
      if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
        callback();
      } else {
        errCallback(<Operacion>{
          codigo: -1,
          mensaje: "Debe ingresar la cantidad del SKU seleccionado..."
        });
      }
      resultadoDeBusqueda = null;
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar el ingreso de la cantidad: ${ex.message}`
      });
    }
  }

  obtenerPaqueteProcesadosEnSku(
    callback: (listaDeSku: Sku[]) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let resultadoDeBusqueda: Paquete[] = this.paquetes.filter(
        (paquete: Paquete) => {
          return paquete.qty !== 0;
        }
      );
      if (resultadoDeBusqueda && resultadoDeBusqueda.length > 0) {
        let listaDeSku: Sku[] = [];

        resultadoDeBusqueda.forEach((paquete: Paquete) => {
          let sku: Sku = new Sku();
          sku.sku = this.sku.sku;
          sku.skuName = this.sku.skuName;
          sku.skuDescription = this.sku.skuDescription;
          sku.skuPrice = trunc_number(
            paquete.price,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.skuLink = this.sku.skuLink;
          sku.requieresSerie = this.sku.requieresSerie;
          sku.isKit = this.sku.isKit;
          sku.onHand = trunc_number(
            this.sku.onHand,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.routeId = this.sku.routeId;
          sku.isParent = this.sku.isParent;
          sku.parentSku = this.sku.parentSku;
          sku.exposure = this.sku.exposure;
          sku.priority = this.sku.priority;
          sku.qtyRelated = this.sku.qtyRelated;
          sku.loadedLastUpdated = this.sku.loadedLastUpdated;
          sku.skus = this.sku.skus;
          sku.codeFamilySku = this.sku.codeFamilySku;
          sku.descriptionFamilySku = this.sku.descriptionFamilySku;
          sku.cost = trunc_number(
            paquete.price,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.isComited = trunc_number(
            this.sku.isComited,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.difference = trunc_number(
            this.sku.difference,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.lastQtySold = this.sku.lastQtySold;
          sku.qty = trunc_number(
            paquete.qty,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.available = trunc_number(
            this.sku.available,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.codePackUnit = paquete.codePackUnit;
          sku.total = trunc_number(
            paquete.qty * paquete.price,
            this.configuracionDeDecimales.defaultCalculationsDecimals
          );
          sku.discount = paquete.appliedDiscount;
          sku.appliedDiscount = paquete.appliedDiscount;
          sku.handleDimension = this.sku.handleDimension;
          sku.isSaleByMultiple = this.sku.isSaleByMultiple;
          sku.multipleSaleQty = this.sku.multipleSaleQty;
          sku.owner = this.sku.owner;
          sku.ownerId = this.sku.ownerId;
          sku.discountType = paquete.discountType;
          sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
          sku.basePrice = paquete.basePrice;
          sku.specialPrice = paquete.specialPrice;
          sku.originalPrice = paquete.originalPrice;
          if (this.paqueteTieneDescuentoAplicado(paquete)) {
            sku.listPromo.push(paquete.promoDescuento);
          }
          if (paquete.promoVentaPorMultiplo.apply) {
            sku.listPromo.push(paquete.promoVentaPorMultiplo);
          }
          listaDeSku.push(sku);
        });
        callback(listaDeSku);
        listaDeSku = null;
        resultadoDeBusqueda = null;
      } else {
        resultadoDeBusqueda = null;
        errCallback(<Operacion>{
          codigo: -1,
          mensaje: "No se encontraron paquetes mayor a cero."
        });
      }
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener paquetes procesados en sku: ${ex.message}`
      });
    }
  }

  paqueteTieneDescuentoAplicado(paquete: Paquete): boolean {
    return paquete.appliedDiscount !== 0;
  }

  validarSiCambioLaCantidad(
    callback: (esIgualLaCantidad: boolean) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.obtenerPaqueteSeleccionado(
        (paquete: Paquete) => {
          let uiTextoCantidadUnidadMedida: JQuery = $(
            "#UiTextoCantidadUnidadMedida"
          );
          let cantidad: number = parseFloat(
            uiTextoCantidadUnidadMedida.val() === ""
              ? 0
              : uiTextoCantidadUnidadMedida.val()
          );
          uiTextoCantidadUnidadMedida = null;
          cantidad =
            cantidad *
            (this.paqueteSeleccionadoActual.isSaleByMultiple
              ? this.paqueteSeleccionadoActual.multiple
              : 1);
          if (cantidad === paquete.qty) {
            callback(true);
          } else {
            callback(false);
          }
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener total de paquetes: ${ex.message}`
      });
    }
  }
  // ----------Fin Aceptar Paquetes----------//

  // ----------Obtener Totales----------//
  obtenerTotalDePaquetesSinDescuentoAplicados(
    callback: (total: number) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let total: number = 0;
      this.paquetes.forEach((paquete: Paquete) => {
        if (paquete.qty !== 0) {
          total += paquete.qty * paquete.price;
        }
      });
      callback(total);
      total = null;
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener total de paquetes: ${ex.message}`
      });
    }
  }

  obtenerTotalDePaquetesConDescuentoAplicados(
    callback: (total: number) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let total: number = 0;
      this.paquetes.forEach((paquete: Paquete) => {
        if (paquete.qty !== 0) {
          let totalPaquete: number = paquete.price * paquete.qty;

          let sku: Sku = new Sku();
          sku.total = paquete.price * paquete.qty;
          sku.discount = paquete.appliedDiscount;
          sku.discountType = paquete.discountType;
          sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
          totalPaquete = this.descuentoServicio.aplicarLosDescuentos(
            sku,
            paquete.isUniqueDiscountScale,
            this.listaDeOrdenAplicarDescuentos,
            this.descuentoPorMontoGeneralYFamilia,
            this.descuentoPorFamiliaYTipoPago
          );

          total += totalPaquete;
          totalPaquete = null;
        }
      });
      callback(total);
      total = null;
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener total de paquetes: ${ex.message}`
      });
    }
  }
  // ----------Fin Obtener Totales----------//

  // ----------Publicar Entidades----------//
  publicarEntidades(
    listaDeSku: Sku[],
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.publicarTarea(
        () => {
          this.publicarListaSku(
            listaDeSku,
            () => {
              this.publicarAgregarOQuitarDeListaSkuMensaje(
                listaDeSku,
                () => {
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
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al publicar entidades: ${ex.message}`
      });
    }
  }

  publicarTarea(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.obtenerTotalDePaquetesConDescuentoAplicados(
        (total: number) => {
          this.ObtenerTotalDeLaOrden(
            (totalConDes: number) => {
              let msg: TareaMensaje = new TareaMensaje(this);
              this.tarea.salesOrderTotal = totalConDes + total;
              msg.tarea = this.tarea;
              this.mensajero.publish(msg, getType(TareaMensaje));
              callback();
            },
            (resultado: Operacion) => {
              errCallback(<Operacion>{
                codigo: -1,
                mensaje: resultado.mensaje
              });
            }
          );
        },
        (resultado: Operacion) => {
          errCallback(<Operacion>{ codigo: -1, mensaje: resultado.mensaje });
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al publicar tarea: ${ex.message}`
      });
    }
  }

  publicarListaSku(
    listaSku: Sku[],
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.obtenerListaDeSkuDeBonificacionesParaPublicar(
        (listadoDeSkuParaBonificar: Sku[]) => {
          let msg: ListaSkuMensaje = new ListaSkuMensaje(this);
          msg.listaSku = listaSku;
          msg.listaDeSkuParaBonificacion = listadoDeSkuParaBonificar;
          this.mensajero.publish(msg, getType(ListaSkuMensaje));
          msg = null;
          callBack();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al publicar listado de sku: ${ex.message}`
      });
    }
  }

  publicarAgregarOQuitarDeListaSkuMensaje(
    listaSku: Sku[],
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let msg: AgregarOQuitarDeListaSkuMensaje = new AgregarOQuitarDeListaSkuMensaje(
        this
      );
      msg.listaSku = listaSku;
      msg.quitarSku = this.estaAgregandoSku;
      msg.agregarSku = false;
      this.mensajero.publish(msg, getType(AgregarOQuitarDeListaSkuMensaje));
      msg = null;
      callBack();
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al publicar agregar o quitar de lista sku: ${ex.message}`
      });
    }
  }
  // ----------Fin Publicar Entidades----------//

  // ----------Regregar a la pantalla anterior----------//
  mostrarPantallaAnterior(): void {
    switch ($.mobile.activePage[0].id) {
      case "skucant_page":
        this.imagenDeSkuServicio.limpiarContenedorDeImagenesDeProducto(
          false,
          () => {
            this.listadoDeImagenesDeProductoSeleccionado.length = 0;
            window.history.back();
          }
        );
        break;
    }
  }
  // ----------Fin Regregar a la pantalla anterior----------//

  // ----------Resumen del sku----------//
  usuarioDeseaVerResumenDelSku(): void {
    let myPanel: JQuery = $.mobile.activePage.children(
      '[id="UiPanelIzquierdoPaginaDenominacion"]'
    ) as any;
    myPanel.panel("toggle");
    myPanel = null;
    this.validarBonificacionesIngresadas(
      () => {
        this.validarIngresoDeDescuento(
          (resultado: Operacion) => {
            notify(resultado.mensaje);
            DesBloquearPantalla();
          },
          () => {
            this.cargarResumenDelSku();
          }
        );
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  cargarResumenDelSku(): void {
    try {
      if (!this.paquetes) {
        return;
      }

      let uiListaResumenUnidadMedida: JQuery = $("#UiListaResumenUnidadMedida");
      uiListaResumenUnidadMedida.children().remove("li");

      for (let paquete of this.paquetes) {
        if (paquete.qty !== 0) {
          let total: number = paquete.qty * paquete.price;
          let totalConDescuentoPorEscala: number = 0;
          let totalConDescuentoPorFamilia: number = 0;
          switch (paquete.discountType) {
            case TiposDeDescuento.Porcentaje.toString():
              total = trunc_number(
                total - (paquete.appliedDiscount * total) / 100,
                this.configuracionDeDecimales.defaultCalculationsDecimals
              );
              break;
            case TiposDeDescuento.Monetario.toString():
              total =
                trunc_number(
                  total,
                  this.configuracionDeDecimales.defaultCalculationsDecimals
                ) < paquete.appliedDiscount
                  ? 0
                  : trunc_number(
                      total - paquete.appliedDiscount,
                      this.configuracionDeDecimales.defaultCalculationsDecimals
                    );
              break;
          }
          totalConDescuentoPorEscala = total;

          // -----Validamos si aplica el descuento por monto general y familia
          if (this.descuentoPorMontoGeneralYFamilia.discount > 0) {
            // -----Aplicamos el descuento por monto general y familia
            switch (this.descuentoPorMontoGeneralYFamilia.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                total = trunc_number(
                  total -
                    (this.descuentoPorMontoGeneralYFamilia.discount * total) /
                      100,
                  this.configuracionDeDecimales.defaultCalculationsDecimals
                );
                break;
              case TiposDeDescuento.Monetario.toString():
                total =
                  trunc_number(
                    total,
                    this.configuracionDeDecimales.defaultCalculationsDecimals
                  ) < this.descuentoPorMontoGeneralYFamilia.discount
                    ? 0
                    : trunc_number(
                        total - this.descuentoPorMontoGeneralYFamilia.discount,
                        this.configuracionDeDecimales
                          .defaultCalculationsDecimals
                      );
                break;
            }
          }
          totalConDescuentoPorFamilia = total;

          // -----Validamos si aplica el descuento por familia y tipo pago
          if (this.descuentoPorFamiliaYTipoPago.discount > 0) {
            // -----Aplicamos el descuento por familia y tipo pago
            switch (this.descuentoPorFamiliaYTipoPago.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                total = trunc_number(
                  total -
                    (this.descuentoPorFamiliaYTipoPago.discount * total) / 100,
                  this.configuracionDeDecimales.defaultCalculationsDecimals
                );
                break;
              case TiposDeDescuento.Monetario.toString():
                total =
                  trunc_number(
                    total,
                    this.configuracionDeDecimales.defaultCalculationsDecimals
                  ) < this.descuentoPorFamiliaYTipoPago.discount
                    ? 0
                    : trunc_number(
                        total - this.descuentoPorFamiliaYTipoPago.discount,
                        this.configuracionDeDecimales
                          .defaultCalculationsDecimals
                      );
                break;
            }
          }

          let li: string =
            "<li class='ui-field - contain' data-theme='a' style='text- align: right'>";
          li +=
            "<a href='#' style='text-align: left; background-color: #666;' data-theme='b' class='ui-btn ui-btn-icon-top ui-nodisc-icon'>";
          li += `<FONT color='#FFFFFF'>${paquete.descriptionPackUnit}</FONT>`;
          li += "</a>";
          li += "</li>";

          uiListaResumenUnidadMedida.append(li);
          uiListaResumenUnidadMedida.listview("refresh");

          li =
            "<li class='ui-field-contain' data-theme='a' style='text-align: right'>";
          li += `<span class='HeaderSmall'>Cantidad &emsp;&emsp; ${format_number(
            paquete.qty,
            this.configuracionDeDecimales.defaultDisplayDecimals
          )}</span><br>`;
          li += `<span class='HeaderSmall'>Precio &emsp;&emsp; ${DarFormatoAlMonto(
            format_number(
              paquete.price,
              this.configuracionDeDecimales.defaultDisplayDecimals
            )
          )}</span><hr>`;
          li += `<span class='HeaderSmall'>Total &emsp;&emsp; ${DarFormatoAlMonto(
            format_number(
              paquete.qty * paquete.price,
              this.configuracionDeDecimales.defaultDisplayDecimals
            )
          )}</span><br>`;

          if (paquete.appliedDiscount && paquete.appliedDiscount !== 0) {
            switch (paquete.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                li += `<span class='HeaderSmall'>Descuento(${
                  paquete.appliedDiscount
                }%) &emsp;&emsp; ${DarFormatoAlMonto(
                  format_number(
                    (paquete.appliedDiscount / 100) *
                      (paquete.qty * paquete.price),
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  )
                )}</span><hr>`;
                break;
              case TiposDeDescuento.Monetario.toString():
                li += `<span class='HeaderSmall'>Descuento &emsp;&emsp; ${DarFormatoAlMonto(
                  format_number(
                    paquete.appliedDiscount,
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  )
                )}</span><hr>`;
                break;
            }
            // validamos si hay un descuento por familia o tipo de pago
            if (
              this.descuentoPorMontoGeneralYFamilia.discount <= 0 &&
              this.descuentoPorFamiliaYTipoPago.discount <= 0
            ) {
              li += `<span class='HeaderSmall'> Total CD: ${DarFormatoAlMonto(
                format_number(
                  total,
                  this.configuracionDeDecimales.defaultDisplayDecimals
                )
              )}</span>`;
            }
          }

          // validamos si aplica el descuento por monto genera y familia
          if (this.descuentoPorMontoGeneralYFamilia.discount > 0) {
            switch (this.descuentoPorMontoGeneralYFamilia.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                li += `<span class='HeaderSmall'>Descuento(${
                  this.descuentoPorMontoGeneralYFamilia.discount
                }%) &emsp;&emsp; ${DarFormatoAlMonto(
                  format_number(
                    (this.descuentoPorMontoGeneralYFamilia.discount / 100) *
                      totalConDescuentoPorEscala,
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  )
                )}</span><hr>`;
                break;
              case TiposDeDescuento.Monetario.toString():
                li += `<span class='HeaderSmall'>Descuento &emsp;&emsp; ${DarFormatoAlMonto(
                  format_number(
                    this.descuentoPorMontoGeneralYFamilia.discount,
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  )
                )}</span><hr>`;
                break;
            }
            if (this.descuentoPorFamiliaYTipoPago.discount <= 0) {
              li += `<span class='HeaderSmall'> Total CD: ${DarFormatoAlMonto(
                format_number(
                  total,
                  this.configuracionDeDecimales.defaultDisplayDecimals
                )
              )}</span>`;
            }
          }
          // validamos si aplica el descuento por familia y tipo pago
          if (this.descuentoPorFamiliaYTipoPago.discount > 0) {
            switch (this.descuentoPorFamiliaYTipoPago.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                li += `<span class='HeaderSmall'>Descuento(${
                  this.descuentoPorFamiliaYTipoPago.discount
                }%) &emsp;&emsp; ${DarFormatoAlMonto(
                  format_number(
                    (this.descuentoPorFamiliaYTipoPago.discount / 100) *
                      totalConDescuentoPorFamilia,
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  )
                )}</span><hr>`;
                break;
              case TiposDeDescuento.Monetario.toString():
                li += `<span class='HeaderSmall'>Descuento &emsp;&emsp; ${DarFormatoAlMonto(
                  format_number(
                    this.descuentoPorFamiliaYTipoPago.discount,
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  )
                )}</span><hr>`;
                break;
            }
            li += `<span class='HeaderSmall'> Total CD: ${DarFormatoAlMonto(
              format_number(
                total,
                this.configuracionDeDecimales.defaultDisplayDecimals
              )
            )}</span>`;
          }

          li += "</li>";
          uiListaResumenUnidadMedida.append(li);
          uiListaResumenUnidadMedida.listview("refresh");

          let listadoDeBonificacionesFiltradas: Bono[] = this.listaDeBonificaciones.filter(
            (bonificacion: Bono) => {
              return (
                bonificacion.codePackUnit === paquete.codePackUnit &&
                bonificacion.bonusQty > 0
              );
            }
          );

          if (
            listadoDeBonificacionesFiltradas &&
            listadoDeBonificacionesFiltradas.length > 0
          ) {
            li =
              "<li class='ui-field-contain' data-theme='a' style='text-align: right'>";
            li +=
              // tslint:disable-next-line: max-line-length
              "<div data-role='collapsible' data-content-theme='a' data-inset='true' data-mini='true' data-theme='b' class='ui-nodisc-icon' data-collapsed-icon='carat-d' data-expanded-icon='carat-u' Width='100%'>";
            li += "<h5 style='text- align:center'>Bonificaciones</h5>";
            li += `<ul data-role='listview' data-inset='false' data-divider-theme='a' id='UiListaBonificacionResumenUnidadMedida${paquete.codePackUnit}' >`;
            li += "</ul>";
            li += "</div>";
            li += "</li>";

            uiListaResumenUnidadMedida.append(li);
            uiListaResumenUnidadMedida.listview("refresh");
            uiListaResumenUnidadMedida.trigger("create");

            listadoDeBonificacionesFiltradas.forEach((bonificacion: Bono) => {
              let uiListaBonificacionResumenUnidadMedida: JQuery = $(
                `#UiListaBonificacionResumenUnidadMedida${paquete.codePackUnit}`
              );
              let listaDeLi: string[] = [];
              listaDeLi.push(
                "<li class='ui-field - contain' data-theme='a' style='text- align: left'>"
              );
              listaDeLi.push(
                `<span class='medium'>${bonificacion.codeSkuBonus}</span><br/>`
              );
              listaDeLi.push(
                `<span class='medium'>${bonificacion.descriptionSkuBonues}</span><br/>`
              );
              listaDeLi.push(
                `<span class='medium'>UM.: ${bonificacion.codePackUnitBonues} Cant.: ${bonificacion.bonusQty}</span><br/>`
              );
              listaDeLi.push("</li>");
              uiListaBonificacionResumenUnidadMedida.append(listaDeLi.join(""));
              uiListaBonificacionResumenUnidadMedida.listview("refresh");
              uiListaBonificacionResumenUnidadMedida = null;
              listaDeLi = null;
            });
          }

          total = null;
        }
      }
      uiListaResumenUnidadMedida = null;
    } catch (ex) {
      notify(`Error al cargar la informacion: ${ex.message}`);
    }
  }
  // ----------Fin Resumen del sku----------//

  // ----------Bonificaciones----------//
  cargarBonificaciones(
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.obtenerSiElUsuarioPudeModificarBonificaciones(
        () => {
          this.bonoServicio.obtenerBonificacionPorEscalaPorCliente(
            this.cliente,
            this.sku,
            (listaDeBonificacionesPorEscala: Bono[]) => {
              this.validarSiAplicaLaBonificaciones(
                listaDeBonificacionesPorEscala,
                0,
                true,
                (listaDeBonificacionesPorEscalaParaAplicar: Bono[]) => {
                  this.listaDeBonificaciones = [];
                  listaDeBonificacionesPorEscalaParaAplicar.map(
                    bonificacion => {
                      let resultadoDeBonificacionDeBusqueda: Bono = (this
                        .listaDeBonificaciones as any).find(
                        (bonificacionExistente: Bono) => {
                          return (
                            bonificacion.codePackUnit ===
                              bonificacionExistente.codePackUnit &&
                            bonificacion.codeSkuBonus ===
                              bonificacionExistente.codeSkuBonus &&
                            bonificacion.codePackUnitBonues ===
                              bonificacionExistente.codePackUnitBonues
                          );
                        }
                      );
                      if (resultadoDeBonificacionDeBusqueda) {
                        const escalaDeBono: EscalaDeBono = new EscalaDeBono();
                        escalaDeBono.lowLimit = bonificacion.lowLimitTemp;
                        escalaDeBono.highLimit = bonificacion.highLimitTemp;
                        escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
                        escalaDeBono.promoId = bonificacion.promoIdScale;
                        escalaDeBono.promoName = bonificacion.promoNameScale;
                        escalaDeBono.promoType = bonificacion.promoTypeScale;
                        escalaDeBono.frequency = bonificacion.frequencyScale;
                        resultadoDeBonificacionDeBusqueda.escalas.push(
                          escalaDeBono
                        );
                      } else {
                        const escalaDeBono: EscalaDeBono = new EscalaDeBono();
                        escalaDeBono.lowLimit = bonificacion.lowLimitTemp;
                        escalaDeBono.highLimit = bonificacion.highLimitTemp;
                        escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
                        escalaDeBono.bonusQty = bonificacion.bonusQtyTemp;
                        escalaDeBono.promoId = bonificacion.promoIdScale;
                        escalaDeBono.promoName = bonificacion.promoNameScale;
                        escalaDeBono.promoType = bonificacion.promoTypeScale;
                        escalaDeBono.frequency = bonificacion.frequencyScale;
                        bonificacion.escalas.push(escalaDeBono);
                        bonificacion.lowLimitTemp = 0;
                        bonificacion.highLimitTemp = 0;
                        bonificacion.bonusQtyTemp = 0;
                        bonificacion.bonusQty = -1;
                        bonificacion.promoIdScale = 0;
                        bonificacion.promoNameScale = "";
                        bonificacion.promoTypeScale = "";
                        bonificacion.frequencyScale = "";
                        bonificacion.tipoDeBonificacion =
                          TipoDeBonificacion.PorEscala;
                        this.listaDeBonificaciones.push(bonificacion);
                      }
                      resultadoDeBonificacionDeBusqueda = null;
                    }
                  );

                  this.bonoServicio.obtenerBonoPorMultiploPorCliente(
                    this.cliente,
                    this.sku,
                    (listaDeBonosPorMultiplo: Bono[]) => {
                      this.validarSiAplicaLaBonificaciones(
                        listaDeBonosPorMultiplo,
                        0,
                        false,
                        (listaDeBonosPorMultiploParaAplicar: Bono[]) => {
                          listaDeBonosPorMultiploParaAplicar.map(
                            (bonificacion: Bono) => {
                              let resultadoDeBonificacionDeBusqueda: Bono = (this
                                .listaDeBonificaciones as any).find(
                                (bonificacionExistente: Bono) => {
                                  return (
                                    bonificacion.codePackUnit ===
                                      bonificacionExistente.codePackUnit &&
                                    bonificacion.codeSkuBonus ===
                                      bonificacionExistente.codeSkuBonus &&
                                    bonificacion.codePackUnitBonues ===
                                      bonificacionExistente.codePackUnitBonues
                                  );
                                }
                              );
                              if (resultadoDeBonificacionDeBusqueda) {
                                resultadoDeBonificacionDeBusqueda.tipoDeBonificacion =
                                  TipoDeBonificacion.Ambos;
                                resultadoDeBonificacionDeBusqueda.multiplo =
                                  bonificacion.multiplo;
                                resultadoDeBonificacionDeBusqueda.bonusQtyMultiplo =
                                  bonificacion.bonusQtyMultiplo;
                                resultadoDeBonificacionDeBusqueda.promoIdMultiple =
                                  bonificacion.promoIdMultiple;
                                resultadoDeBonificacionDeBusqueda.promoNameMultiple =
                                  bonificacion.promoNameMultiple;
                                resultadoDeBonificacionDeBusqueda.promoTypeMultiple =
                                  bonificacion.promoTypeMultiple;
                                resultadoDeBonificacionDeBusqueda.frequencyMultiple =
                                  bonificacion.frequencyMultiple;
                              } else {
                                bonificacion.lowLimitTemp = 0;
                                bonificacion.highLimitTemp = 0;
                                bonificacion.bonusQtyTemp = 0;
                                bonificacion.bonusQty = -1;
                                bonificacion.tipoDeBonificacion =
                                  TipoDeBonificacion.PorMultiplo;
                                this.listaDeBonificaciones.push(bonificacion);
                              }
                              resultadoDeBonificacionDeBusqueda = null;
                            }
                          );
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
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al cargar las bonificaciones: ${ex.message}`
      });
    }
  }

  obtenerSiElUsuarioPudeModificarBonificaciones(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.usuarioPuedeModificarBonificacion = false;
      this.tareaServicio.obtenerRegla(
        "ModificacionBonificacionMovil",
        (listaDeReglas: Regla[]) => {
          if (listaDeReglas.length >= 1) {
            this.usuarioPuedeModificarBonificacion =
              listaDeReglas[0].enabled.toUpperCase() === "SI";
          }
          callback();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (err) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar si modifica bonificacion: ${err.message}`
      });
    }
  }

  obtenerBonificacionesDelPaqueteSeleccionado(
    callBack: (listaBonificaciones: Bono[]) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let resultadoDeBonificacionDeBusqueda: Bono[] = this.listaDeBonificaciones.filter(
        bonificacionExistente => {
          return (
            this.paqueteSeleccionadoActual.codePackUnit ===
            bonificacionExistente.codePackUnit
          );
        }
      );

      if (
        resultadoDeBonificacionDeBusqueda &&
        resultadoDeBonificacionDeBusqueda.length > 0
      ) {
        callBack(resultadoDeBonificacionDeBusqueda);
      } else {
        callBack([]);
      }
      resultadoDeBonificacionDeBusqueda = null;
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar si el paquete tiene bonificaciones: ${ex.message}`
      });
    }
  }

  cargarControlesBonificaciones(
    listaBonificaciones: Bono[],
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let uiAcordionDeBonificacionesUnidadMedida: JQuery = $(
        "#UiAcordionDeBonificacionesUnidadMedida"
      );
      uiAcordionDeBonificacionesUnidadMedida.hide();
      uiAcordionDeBonificacionesUnidadMedida = null;

      let uiListaDeBonificacionesUnidadMedida: JQuery = $(
        "#UiListaDeBonificacionesUnidadMedida"
      );
      uiListaDeBonificacionesUnidadMedida.children().remove("li");
      uiListaDeBonificacionesUnidadMedida = null;

      this.obtenerPaqueteSeleccionado(
        (paquete: Paquete) => {
          listaBonificaciones.map((bonificacion: Bono) => {
            bonificacion.bonusQtyTemp = 0;
            if (
              this.tipoDeBonificacionEsPorMultiploOMultiploYEscala(bonificacion)
            ) {
              bonificacion.bonusQtyTemp = this.obtenerValorDeBonoMultiplo(
                bonificacion.multiplo,
                paquete.qty,
                bonificacion.bonusQtyMultiplo
              );
              bonificacion.applyPromoByMultiple =
                bonificacion.bonusQtyTemp !== 0;
            }

            bonificacion.promoIdScale = 0;
            bonificacion.promoNameScale = "";
            bonificacion.promoTypeScale = "";
            bonificacion.frequencyScale = "";

            let escalasFiltradas: EscalaDeBono = (bonificacion.escalas as any).find(
              (escala: EscalaDeBono) => {
                return (
                  escala.lowLimit <= paquete.qty &&
                  paquete.qty <= escala.highLimit
                );
              }
            );
            if (escalasFiltradas) {
              bonificacion.bonusQtyTemp += escalasFiltradas.bonusQty;
              bonificacion.promoIdScale = escalasFiltradas.promoId;
              bonificacion.promoNameScale = escalasFiltradas.promoName;
              bonificacion.promoTypeScale = escalasFiltradas.promoType;
              bonificacion.frequencyScale = escalasFiltradas.frequency;
            }
            escalasFiltradas = null;

            if (bonificacion.bonusQtyTemp > 0) {
              let uiAcordionDeBonificacionesUnidadMedida: JQuery = $(
                "#UiAcordionDeBonificacionesUnidadMedida"
              );
              uiAcordionDeBonificacionesUnidadMedida.show();
              uiAcordionDeBonificacionesUnidadMedida = null;

              let uiListaDeBonificacionesUnidadMedida: JQuery = $(
                "#UiListaDeBonificacionesUnidadMedida"
              );

              let liParaAgregar: string[] = [];
              liParaAgregar.push(
                "<li class='ui-field - contain' data-theme='a' style='text- align: left'>"
              );
              liParaAgregar.push(
                `<span class='medium'>${bonificacion.descriptionSkuBonues}</span><br/>`
              );
              liParaAgregar.push(
                `<span class='medium'>${bonificacion.codeSkuBonus}</span><br/>`
              );
              liParaAgregar.push(
                `<span class='medium' id='UiEtiquetaTextoBonificacion${bonificacion.codeSkuBonus}${bonificacion.codePackUnitBonues}'>UM.: ${bonificacion.codePackUnitBonues} Cant.: ${bonificacion.bonusQtyTemp}</span><br/>`
              );
              if (this.usuarioPuedeModificarBonificacion) {
                if (
                  localStorage.getItem("USE_MAX_BONUS") === SiNo.Si.toString()
                ) {
                  if (bonificacion.bonusQty === -1) {
                    bonificacion.bonusQty = bonificacion.bonusQtyTemp;
                  }
                }
                liParaAgregar.push(
                  `<input type='number' class='validarEnteros' id='UiTextoBonificacion${
                    bonificacion.codeSkuBonus
                  }${
                    bonificacion.codePackUnitBonues
                  }' data-clear-btn='true' placeholder='Cantidad' value='${
                    bonificacion.bonusQty <= 0 ? "" : bonificacion.bonusQty
                  }' />`
                );
              } else {
                bonificacion.bonusQty = bonificacion.bonusQtyTemp;
              }

              liParaAgregar.push("</li>");
              uiListaDeBonificacionesUnidadMedida.append(
                liParaAgregar.join("")
              );
              uiListaDeBonificacionesUnidadMedida.listview("refresh");
              uiListaDeBonificacionesUnidadMedida.trigger("create");
              uiListaDeBonificacionesUnidadMedida = null;
              liParaAgregar = null;
            } else {
              bonificacion.bonusQty = -1;
            }
          });
          callBack();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al establecer bonificaciones: ${ex.message}`
      });
    }
  }

  tipoDeBonificacionEsPorMultiploOMultiploYEscala(bonificacion: Bono): boolean {
    return (
      bonificacion.tipoDeBonificacion === TipoDeBonificacion.PorMultiplo ||
      bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos
    );
  }

  validarBonificacionesIngresadas(
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      if (this.usuarioPuedeModificarBonificacion) {
        this.obtenerBonificacionesDelPaqueteSeleccionado(
          (listaBonificaciones: Bono[]) => {
            this.obtenerPaqueteSeleccionado(
              (paquete: Paquete) => {
                let hayIngresosQueSobrepesanLoMaximo: boolean = false;
                listaBonificaciones.map((bonificacion: Bono) => {
                  let validarBonificacion: boolean = false;
                  if (
                    bonificacion.tipoDeBonificacion ===
                      TipoDeBonificacion.PorMultiplo ||
                    bonificacion.tipoDeBonificacion === TipoDeBonificacion.Ambos
                  ) {
                    validarBonificacion = true;
                  }
                  let escalasFiltradas: EscalaDeBono = (bonificacion.escalas as any).find(
                    (escala: EscalaDeBono) => {
                      return (
                        escala.lowLimit <= paquete.qty &&
                        paquete.qty <= escala.highLimit
                      );
                    }
                  );
                  if (escalasFiltradas || validarBonificacion) {
                    let uiEtiquetaTotalUnidadMedida: JQuery = $(
                      `#UiTextoBonificacion${bonificacion.codeSkuBonus}${bonificacion.codePackUnitBonues}`
                    );
                    let cantidadDeBonificacion: any =
                      uiEtiquetaTotalUnidadMedida.val() === ""
                        ? 0
                        : uiEtiquetaTotalUnidadMedida.val();
                    if (cantidadDeBonificacion > bonificacion.bonusQtyTemp) {
                      hayIngresosQueSobrepesanLoMaximo = true;
                    } else {
                      bonificacion.bonusQty = cantidadDeBonificacion;
                    }
                    cantidadDeBonificacion = null;
                    uiEtiquetaTotalUnidadMedida = null;
                  }
                  escalasFiltradas = null;
                });
                if (hayIngresosQueSobrepesanLoMaximo) {
                  errCallback(<Operacion>{
                    codigo: -1,
                    mensaje:
                      "Hay bonificaciones que sobrepasan lo máximo establecido."
                  });
                } else {
                  callBack();
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
      } else {
        callBack();
      }
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar bonificaciones ingresadas: ${ex.message}`
      });
    }
  }

  obtenerListaDeSkuDeBonificacionesParaPublicar(
    callBack: (listadoDeSkuParaBonificar: Sku[]) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let listaFiltrada: Sku[] = this.listaDeBonificaciones.reduce(
        (listaRecorrida: Sku[], bonificacion: Bono) => {
          if (bonificacion.bonusQty > 0) {
            let skuParaBonificacion: Sku = new Sku();
            skuParaBonificacion.sku = bonificacion.codeSkuBonus;
            skuParaBonificacion.codePackUnit = bonificacion.codePackUnitBonues;
            skuParaBonificacion.skuName = bonificacion.descriptionSkuBonues;
            skuParaBonificacion.skuDescription =
              bonificacion.descriptionSkuBonues;
            skuParaBonificacion.qty = bonificacion.bonusQty;
            skuParaBonificacion.parentCodeSku = this.sku.sku;
            skuParaBonificacion.parentCodePackUnit = bonificacion.codePackUnit;
            skuParaBonificacion.lowLimit = 0;
            skuParaBonificacion.highLimit = 0;
            skuParaBonificacion.owner = bonificacion.owner;
            skuParaBonificacion.ownerId = bonificacion.ownerId;
            if (this.promoDeEscalaSeAgregaALaBonificacion(bonificacion)) {
              let promo: Promo = new Promo();
              promo.promoId = bonificacion.promoIdScale;
              promo.promoName = bonificacion.promoNameScale;
              promo.promoType = bonificacion.promoTypeScale;
              promo.frequency = bonificacion.frequencyScale;
              skuParaBonificacion.listPromo.push(promo);
              promo = null;
            }
            if (bonificacion.applyPromoByMultiple) {
              let promo: Promo = new Promo();
              promo.promoId = bonificacion.promoIdMultiple;
              promo.promoName = bonificacion.promoNameMultiple;
              promo.promoType = bonificacion.promoTypeMultiple;
              promo.frequency = bonificacion.frequencyMultiple;
              skuParaBonificacion.listPromo.push(promo);
              promo = null;
            }
            listaRecorrida.push(skuParaBonificacion);
            skuParaBonificacion = null;
          }
          return listaRecorrida;
        },
        []
      );
      callBack(listaFiltrada);
      listaFiltrada = null;
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar bonificaciones ingresadas: ${ex.message}`
      });
    }
  }

  promoDeEscalaSeAgregaALaBonificacion(bonificacion: Bono): boolean {
    return bonificacion.promoIdScale !== 0;
  }

  cargarListaDeSkuBonficadas(
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.listaDeSkuDeBonificacion.map((skuBonificado: Sku) => {
        let resultadoBonificacion: Bono = (this
          .listaDeBonificaciones as any).find((bonificacion: Bono) => {
          return (
            bonificacion.codePackUnit === skuBonificado.parentCodePackUnit &&
            bonificacion.codeSkuBonus === skuBonificado.sku &&
            bonificacion.codePackUnitBonues === skuBonificado.codePackUnit
          );
        });
        if (resultadoBonificacion) {
          resultadoBonificacion.bonusQty = skuBonificado.qty;
        }
        resultadoBonificacion = null;
      });
      callBack();
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al cargar lista de sku bonificadas: ${ex.message}`
      });
    }
  }

  obtenerValorDeBonoMultiplo(
    multiplo: number,
    cantidad: number,
    cantidadBono: number
  ): number {
    if (multiplo === 1) {
      return cantidad * cantidadBono;
    }
    if (cantidad < multiplo) {
      return 0;
    }
    if (cantidad === multiplo) {
      return cantidadBono;
    }

    let encontroCantidad: boolean = false;
    let indice: number = 1;
    while (!encontroCantidad) {
      if (
        multiplo * indice <= cantidad &&
        cantidad <= multiplo * (indice + 1) - 1
      ) {
        encontroCantidad = true;
      } else {
        indice++;
      }
    }
    return cantidadBono * indice;
  }
  // ----------Fin Bonificaciones----------//

  // ----------Descuentos----------//

  obtenerSiElUsuarioPudeModificarDescuentos(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.usuarioPuedeModificarDescuentos = false;
      this.tareaServicio.obtenerRegla(
        "ModificacionDescuentoMovil",
        (listaDeReglas: Regla[]) => {
          if (listaDeReglas.length >= 1) {
            this.usuarioPuedeModificarDescuentos =
              listaDeReglas[0].enabled.toUpperCase() === "SI";
          }
          callback();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (err) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al validar si modifica bonificacion: ${err.message}`
      });
    }
  }

  cargarDescuentos(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.obtenerSiElUsuarioPudeModificarDescuentos(
        () => {
          this.descuentoServicio.obtenerDescuentosPorClienteSku(
            this.cliente,
            this.sku,
            (listaDeDescuento: DescuentoPorEscalaSku[]) => {
              this.validarSiAplicaElDescuento(
                listaDeDescuento,
                0,
                (listaDeDescuentoParaAplicar: DescuentoPorEscalaSku[]) => {
                  this.listaDeDescuento = listaDeDescuentoParaAplicar;
                  this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(
                    () => {
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
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener descuentos: ${ex.message}`
      });
    }
  }

  cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
      this.descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
      /// -------------------INICIA LA APLICACION DE PRIORIDAD-------------------///
      this.descuentoServicio.obtenerDescuentos(
        this.paquetes,
        this.listaDeSkuOrdenDeVenta,
        this.cliente,
        this.listaHistoricoDePromos,
        (
          listaDescuentoPorMontoGeneralYFamilia: Array<
            DescuentoPorMontoGeneralYFamilia
          >,
          listaDescuentoPorFamiliaYTipoPago: Array<DescuentoPorFamiliaYTipoPago>
        ) => {
          this.obtenerPaqueteSeleccionado(
            (paquete: Paquete) => {
              let aplicarDescuentos: boolean = true;

              if (paquete) {
                aplicarDescuentos = paquete.specialPrice.applyDiscount;
              }

              let esDescuentoUnicoDeEscala: boolean = true;
              this.paquetes.map((paquete: Paquete) => {
                if (!paquete.isUniqueDiscountScale) {
                  esDescuentoUnicoDeEscala = paquete.isUniqueDiscountScale;
                }
              });

              // tslint:disable-next-line: max-line-length
              let resultadoDescuentoMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (listaDescuentoPorMontoGeneralYFamilia as any).find(
                (descuento: DescuentoPorMontoGeneralYFamilia) => {
                  return this.sku.codeFamilySku === descuento.codeFamily;
                }
              );
              if (
                resultadoDescuentoMontoGeneralYFamilia &&
                !esDescuentoUnicoDeEscala &&
                aplicarDescuentos
              ) {
                this.descuentoPorMontoGeneralYFamilia = resultadoDescuentoMontoGeneralYFamilia;
              }

              let resultadoDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (listaDescuentoPorFamiliaYTipoPago as any).find(
                (descuento: DescuentoPorFamiliaYTipoPago) => {
                  return this.sku.codeFamilySku === descuento.codeFamily;
                }
              );

              if (
                resultadoDescuentoPorFamiliaYTipoPago &&
                !esDescuentoUnicoDeEscala &&
                aplicarDescuentos
              ) {
                this.descuentoPorFamiliaYTipoPago = resultadoDescuentoPorFamiliaYTipoPago;
              }

              let descuentoPorFamilia: number = this
                .descuentoPorMontoGeneralYFamilia.discount;
              let descuentoPorTipoPago: number = this
                .descuentoPorFamiliaYTipoPago.discount;

              // -----Ocultamos las etiquetas
              let uiLiDescuentoPorFamilia: JQuery = $(
                "#UiLiDescuentoPorFamilia"
              );
              uiLiDescuentoPorFamilia.css("display", "none");
              uiLiDescuentoPorFamilia = null;

              let uiEtiquetaDescuentoPorFamiliaMaximo: JQuery = $(
                "#UiEtiquetaDescuentoPorFamiliaMaximo"
              );
              uiEtiquetaDescuentoPorFamiliaMaximo.css("display", "none");
              uiEtiquetaDescuentoPorFamiliaMaximo = null;

              let uiEtiquetaDescuentoPorTipoPagoMaximo: JQuery = $(
                "#UiEtiquetaDescuentoPorTipoPagoMaximo"
              );
              uiEtiquetaDescuentoPorTipoPagoMaximo.css("display", "none");
              uiEtiquetaDescuentoPorTipoPagoMaximo = null;

              // -----Validamos si  aplica un descuento
              if (descuentoPorFamilia > 0 || descuentoPorTipoPago > 0) {
                let UiLiDescuentoPorFamilia: JQuery = $(
                  "#UiLiDescuentoPorFamilia"
                );
                UiLiDescuentoPorFamilia.css("display", "block");
                UiLiDescuentoPorFamilia = null;
              }
              // ----Validamos si aplica el descuento por monto general y familia
              if (descuentoPorFamilia > 0) {
                let uiEtiquetaDescuentoPorFamiliaMaximo: JQuery = $(
                  "#UiEtiquetaDescuentoPorFamiliaMaximo"
                );
                uiEtiquetaDescuentoPorFamiliaMaximo.css("display", "block");
                switch (this.descuentoPorMontoGeneralYFamilia.discountType) {
                  case TiposDeDescuento.Porcentaje.toString():
                    uiEtiquetaDescuentoPorFamiliaMaximo.text(
                      `Descuento por monto general y familia: ${format_number(
                        descuentoPorFamilia,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )}%`
                    );
                    break;
                  case TiposDeDescuento.Monetario.toString():
                    uiEtiquetaDescuentoPorFamiliaMaximo.text(
                      `Descuento por monto general y familia: ${DarFormatoAlMonto(
                        format_number(
                          descuentoPorFamilia,
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )
                      )}`
                    );
                    break;
                }
                uiEtiquetaDescuentoPorFamiliaMaximo = null;
              }
              // ----Validamos si aplica el descuento por familia y tipo pago
              if (descuentoPorTipoPago > 0) {
                let uiEtiquetaDescuentoPorTipoPagoMaximo: JQuery = $(
                  "#UiEtiquetaDescuentoPorTipoPagoMaximo"
                );
                uiEtiquetaDescuentoPorTipoPagoMaximo.css("display", "block");
                switch (this.descuentoPorFamiliaYTipoPago.discountType) {
                  case TiposDeDescuento.Porcentaje.toString():
                    uiEtiquetaDescuentoPorTipoPagoMaximo.text(
                      `Descuento por familia y tipo pago: ${format_number(
                        descuentoPorTipoPago,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )}%`
                    );
                    break;
                  case TiposDeDescuento.Monetario.toString():
                    uiEtiquetaDescuentoPorTipoPagoMaximo.text(
                      `Descuento por familia y tipo pago: ${DarFormatoAlMonto(
                        format_number(
                          descuentoPorTipoPago,
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )
                      )}`
                    );
                    break;
                }
                uiEtiquetaDescuentoPorTipoPagoMaximo = null;
              }
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
      /// -------------------FIN DE INICIA LA APLICACION DE PRIORIDAD-------------------///
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener descuentos por familias: ${ex.message}`
      });
    }
  }

  validarIngresoDeDescuento(
    errCallback: (resultado: Operacion) => void,
    callBack?: () => void
  ): void {
    try {
      this.obtenerPaqueteSeleccionado(
        (paquete: Paquete) => {
          paquete.appliedDiscount = 0;
          paquete.promoDescuento = new Promo();
          let elDescuentoIngresadoSobrepasaLoMaximo: boolean = false;
          paquete.specialPrice = new PrecioEspecial();
          paquete.price =
            paquete.basePrice > 0 ? paquete.basePrice : paquete.price;

          let resultadoDescuento: DescuentoPorEscalaSku = (this
            .listaDeDescuento as any).find(
            (descuento: DescuentoPorEscalaSku) => {
              return (
                this.paqueteSeleccionadoActual.codePackUnit ===
                  descuento.codePackUnit &&
                (descuento.lowLimit <= paquete.qty &&
                  paquete.qty <= descuento.highLimit)
              );
            }
          );

          let restultadoPrecioEspecial: PrecioEspecial = (this
            .listaDePreciosEspeciales as any).find(
            (precioEspecial: PrecioEspecial) => {
              return (
                this.paqueteSeleccionadoActual.codePackUnit ===
                  precioEspecial.codePackUnit &&
                (precioEspecial.lowLimit <= paquete.qty &&
                  paquete.qty <= precioEspecial.highLimit)
              );
            }
          );

          // if (restultadoPrecioEspecial) {
          //   paquete.basePrice = paquete.price;
          //   paquete.price = restultadoPrecioEspecial.specialPrice;
          //   paquete.specialPrice = restultadoPrecioEspecial;
          // }

          if (restultadoPrecioEspecial) {
            paquete.basePrice = paquete.price;

            if (this.usuarioPuedeModificarPrecioDeProducto) {
              let uiTxtPrecioNegociadoConCliente: JQuery = $(
                "#UiTxtPrecioNegociadoConCliente"
              );
              paquete.price =
                uiTxtPrecioNegociadoConCliente.val() === "" ||
                isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                  ? paquete.price // prueba
                  : parseFloat(uiTxtPrecioNegociadoConCliente.val());
              uiTxtPrecioNegociadoConCliente = null;
            } else {
              paquete.price = restultadoPrecioEspecial.specialPrice;
            }

            paquete.originalPrice = restultadoPrecioEspecial.specialPrice;
            paquete.specialPrice = restultadoPrecioEspecial;
          } else {
            if (this.usuarioPuedeModificarPrecioDeProducto) {
              let uiTxtPrecioNegociadoConCliente: JQuery = $(
                "#UiTxtPrecioNegociadoConCliente"
              );
              paquete.price =
                uiTxtPrecioNegociadoConCliente.val() === "" ||
                isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                  ? paquete.price // prueba
                  : parseFloat(uiTxtPrecioNegociadoConCliente.val());
              uiTxtPrecioNegociadoConCliente = null;
            }
          }

          if (resultadoDescuento && paquete.specialPrice.applyDiscount) {
            if (this.usuarioPuedeModificarDescuentos) {
              let uiTextoDescuentoSku: JQuery = $("#UiTextoDescuentoSku");
              let cantidadDeDescuento: number =
                uiTextoDescuentoSku.val() === ""
                  ? 0
                  : parseFloat(uiTextoDescuentoSku.val());
              if (cantidadDeDescuento > resultadoDescuento.discount) {
                elDescuentoIngresadoSobrepasaLoMaximo = true;
                let uiListaSkuMedidas: JQuery = $("#UiTextoDescuentoSku");
                uiListaSkuMedidas.focus();
                uiListaSkuMedidas = null;
              } else {
                resultadoDescuento.qty = cantidadDeDescuento;
                paquete.appliedDiscount = cantidadDeDescuento;
                paquete.discountType = resultadoDescuento.discountType;
                paquete.isUniqueDiscountScale = resultadoDescuento.isUnique;
              }
              cantidadDeDescuento = null;
              uiTextoDescuentoSku = null;
            } else {
              paquete.appliedDiscount = resultadoDescuento.qty;
              paquete.discountType = resultadoDescuento.discountType;
              paquete.isUniqueDiscountScale = resultadoDescuento.isUnique;
            }
            paquete.promoDescuento.promoId = resultadoDescuento.promoId;
            paquete.promoDescuento.promoName = resultadoDescuento.promoName;
            paquete.promoDescuento.promoType = resultadoDescuento.promoType;
            paquete.promoDescuento.frequency = resultadoDescuento.frequency;

            this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(
              () => {
                let totalDescuento: number = paquete.qty * paquete.price;

                let sku: Sku = new Sku();
                sku.total = paquete.price * paquete.qty;
                sku.discount = paquete.appliedDiscount;
                sku.discountType = paquete.discountType;
                sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                totalDescuento = this.descuentoServicio.aplicarLosDescuentos(
                  sku,
                  sku.isUniqueDiscountScale,
                  this.listaDeOrdenAplicarDescuentos,
                  this.descuentoPorMontoGeneralYFamilia,
                  this.descuentoPorFamiliaYTipoPago
                );

                let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
                  "#UiEtiquetaTotalCDUnidadMedida"
                );
                uiEtiquetaTotalCdUnidadMedida.text(
                  `Total CD: ${DarFormatoAlMonto(
                    format_number(
                      totalDescuento,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )
                  )}`
                );
                uiEtiquetaTotalCdUnidadMedida = null;

                if (elDescuentoIngresadoSobrepasaLoMaximo) {
                  errCallback(<Operacion>{
                    codigo: -1,
                    mensaje: "El descuento sobrepasa lo máximo establecido."
                  });
                } else {
                  if (callBack) {
                    callBack();
                  }
                }
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          } else {
            this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(
              () => {
                let totalDescuento: number = paquete.qty * paquete.price;
                let sku: Sku = new Sku();
                sku.total = paquete.price * paquete.qty;
                sku.discount = 0;
                sku.discountType = "";
                sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                totalDescuento = this.descuentoServicio.aplicarLosDescuentos(
                  sku,
                  paquete.isUniqueDiscountScale,
                  this.listaDeOrdenAplicarDescuentos,
                  this.descuentoPorMontoGeneralYFamilia,
                  this.descuentoPorFamiliaYTipoPago
                );

                let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
                  "#UiEtiquetaTotalCDUnidadMedida"
                );
                uiEtiquetaTotalCdUnidadMedida.css("display", "block");
                uiEtiquetaTotalCdUnidadMedida.css("display", "inline");
                uiEtiquetaTotalCdUnidadMedida.text(
                  `Total CD: ${DarFormatoAlMonto(
                    format_number(
                      totalDescuento,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )
                  )}`
                );
                uiEtiquetaTotalCdUnidadMedida = null;
                totalDescuento = null;
                if (elDescuentoIngresadoSobrepasaLoMaximo) {
                  errCallback(<Operacion>{
                    codigo: -1,
                    mensaje: "El descuento sobrepasa lo máximo establecido."
                  });
                } else {
                  if (callBack) {
                    callBack();
                  }
                }
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          }
          resultadoDescuento = null;
          restultadoPrecioEspecial = null;
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al establecer bonificaciones: ${ex.message}`
      });
    }
  }

  cargarControlesDeDescuento(
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let uiListViewDescuento: JQuery = $("#UiLiDescuentoSkuMaximo");
      uiListViewDescuento.css("display", "none");
      uiListViewDescuento = null;

      let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
        "#UiEtiquetaTotalCDUnidadMedida"
      );
      uiEtiquetaTotalCdUnidadMedida.css("display", "none");
      uiEtiquetaTotalCdUnidadMedida = null;

      this.cargarDescuentosPorMontoGeneralYFamiliaYTipoPago(
        () => {
          this.obtenerPaqueteSeleccionado(
            (paquete: Paquete) => {
              let restultadoPrecioEspecial: PrecioEspecial = (this
                .listaDePreciosEspeciales as any).find(
                (precioEspecial: PrecioEspecial) => {
                  return (
                    this.paqueteSeleccionadoActual.codePackUnit ===
                      precioEspecial.codePackUnit &&
                    (precioEspecial.lowLimit <= paquete.qty &&
                      paquete.qty <= precioEspecial.highLimit)
                  );
                }
              );

              if (restultadoPrecioEspecial) {
                paquete.basePrice = paquete.price;

                if (this.usuarioPuedeModificarPrecioDeProducto) {
                  let uiTxtPrecioNegociadoConCliente: JQuery = $(
                    "#UiTxtPrecioNegociadoConCliente"
                  );
                  paquete.price =
                    uiTxtPrecioNegociadoConCliente.val() === "" ||
                    isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                    parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                      ? paquete.price // prueba
                      : parseFloat(uiTxtPrecioNegociadoConCliente.val());
                  uiTxtPrecioNegociadoConCliente = null;
                } else {
                  paquete.price = restultadoPrecioEspecial.specialPrice;
                }

                paquete.originalPrice = restultadoPrecioEspecial.specialPrice;
                paquete.specialPrice = restultadoPrecioEspecial;
              } else {
                if (this.usuarioPuedeModificarPrecioDeProducto) {
                  let uiTxtPrecioNegociadoConCliente: JQuery = $(
                    "#UiTxtPrecioNegociadoConCliente"
                  );
                  paquete.price =
                    uiTxtPrecioNegociadoConCliente.val() === "" ||
                    isNaN(parseFloat(uiTxtPrecioNegociadoConCliente.val())) ||
                    parseFloat(uiTxtPrecioNegociadoConCliente.val()) === 0
                      ? paquete.price // prueba
                      : parseFloat(uiTxtPrecioNegociadoConCliente.val());
                  uiTxtPrecioNegociadoConCliente = null;
                }
              }

              if (paquete.specialPrice.applyDiscount) {
                let resultadoDeDescuento: DescuentoPorEscalaSku = (this
                  .listaDeDescuento as any).find(
                  (descuento: DescuentoPorEscalaSku) => {
                    return (
                      this.paqueteSeleccionadoActual.codePackUnit ===
                        descuento.codePackUnit &&
                      (descuento.lowLimit <= paquete.qty &&
                        paquete.qty <= descuento.highLimit)
                    );
                  }
                );
                if (resultadoDeDescuento) {
                  let resultadoListaDeDescuento: DescuentoPorEscalaSku[] = this.listaDeDescuento.filter(
                    (descuento: DescuentoPorEscalaSku) => {
                      return (
                        this.paqueteSeleccionadoActual.codePackUnit ===
                          descuento.codePackUnit &&
                        (descuento.lowLimit !== resultadoDeDescuento.lowLimit &&
                          resultadoDeDescuento.highLimit !==
                            descuento.highLimit)
                      );
                    }
                  );

                  if (
                    resultadoListaDeDescuento &&
                    resultadoListaDeDescuento.length > 0
                  ) {
                    resultadoListaDeDescuento.map(
                      (descuento: DescuentoPorEscalaSku) => {
                        descuento.qty = -1;
                      }
                    );
                  }
                  resultadoListaDeDescuento = null;

                  let uiListViewDescuento: JQuery = $(
                    "#UiLiDescuentoSkuMaximo"
                  );
                  uiListViewDescuento.css("display", "block");
                  uiListViewDescuento = null;

                  let textoAMostrar: string = "";

                  switch (resultadoDeDescuento.discountType.toString()) {
                    case TiposDeDescuento.Porcentaje.toString():
                      textoAMostrar = `Descuento: ${resultadoDeDescuento.discount}%`;
                      break;
                    case TiposDeDescuento.Monetario.toString():
                      textoAMostrar = `Descuento: ${DarFormatoAlMonto(
                        format_number(
                          resultadoDeDescuento.discount,
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )
                      )}`;
                      break;
                  }

                  let uiEtiquetaDescuentoSkuMaximo: JQuery = $(
                    "#UiEtiquetaDescuentoSkuMaximo"
                  );
                  uiEtiquetaDescuentoSkuMaximo.text(textoAMostrar);
                  uiEtiquetaDescuentoSkuMaximo = null;

                  let uiDivIngresoDescuentoSku: JQuery = $(
                    "#UiDivIngresoDescuentoSku"
                  );
                  uiDivIngresoDescuentoSku.css("display", "none");

                  if (this.usuarioPuedeModificarDescuentos) {
                    uiDivIngresoDescuentoSku.css("display", "block");
                    if (
                      localStorage.getItem("USE_MAX_DISCOUNT") ===
                      SiNo.Si.toString()
                    ) {
                      if (resultadoDeDescuento.qty === -1) {
                        resultadoDeDescuento.qty =
                          paquete.appliedDiscount > 0
                            ? paquete.appliedDiscount
                            : resultadoDeDescuento.discount;
                      }
                    }
                    let uiTextoDescuentoSku: JQuery = $("#UiTextoDescuentoSku");
                    uiTextoDescuentoSku.val(
                      resultadoDeDescuento.qty > 0
                        ? resultadoDeDescuento.qty
                        : ""
                    );
                    uiTextoDescuentoSku = null;
                  } else {
                    resultadoDeDescuento.qty = resultadoDeDescuento.discount;
                  }

                  let totalDescuento: number = paquete.qty * paquete.price;

                  let sku: Sku = new Sku();
                  sku.total = paquete.price * paquete.qty;
                  sku.discount = totalDescuento;
                  sku.discountType = paquete.discountType;
                  sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                  totalDescuento = this.descuentoServicio.aplicarLosDescuentos(
                    sku,
                    sku.isUniqueDiscountScale,
                    this.listaDeOrdenAplicarDescuentos,
                    this.descuentoPorMontoGeneralYFamilia,
                    this.descuentoPorFamiliaYTipoPago
                  );

                  let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
                    "#UiEtiquetaTotalCDUnidadMedida"
                  );
                  uiEtiquetaTotalCdUnidadMedida.css("display", "block");
                  uiEtiquetaTotalCdUnidadMedida.css("display", "inline");
                  uiEtiquetaTotalCdUnidadMedida.text(
                    `Total CD: ${DarFormatoAlMonto(
                      format_number(
                        totalDescuento,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}`
                  );
                  uiEtiquetaTotalCdUnidadMedida = null;

                  let uiTextoDescuentoSku: JQuery = $("#UiTextoDescuentoSku");
                  uiTextoDescuentoSku.val(resultadoDeDescuento.discount);
                  uiTextoDescuentoSku = null;

                  uiDivIngresoDescuentoSku = null;
                } else {
                  let totalDescuento: number = paquete.qty * paquete.price;

                  let sku: Sku = new Sku();
                  sku.total = paquete.price * paquete.qty;
                  sku.discount = 0;
                  sku.discountType = "";
                  sku.isUniqueDiscountScale = paquete.isUniqueDiscountScale;

                  totalDescuento = this.descuentoServicio.aplicarLosDescuentos(
                    sku,
                    paquete.isUniqueDiscountScale,
                    this.listaDeOrdenAplicarDescuentos,
                    this.descuentoPorMontoGeneralYFamilia,
                    this.descuentoPorFamiliaYTipoPago
                  );

                  let uiEtiquetaTotalCdUnidadMedida: JQuery = $(
                    "#UiEtiquetaTotalCDUnidadMedida"
                  );
                  uiEtiquetaTotalCdUnidadMedida.css("display", "block");
                  uiEtiquetaTotalCdUnidadMedida.css("display", "inline");
                  uiEtiquetaTotalCdUnidadMedida.text(
                    `Total CD: ${DarFormatoAlMonto(
                      format_number(
                        totalDescuento,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}`
                  );
                  uiEtiquetaTotalCdUnidadMedida = null;
                  totalDescuento = null;
                }
                resultadoDeDescuento = null;
                callBack();
              } else {
                callBack();
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al establecer bonificaciones: ${ex.message}`
      });
    }
  }

  obtenerOrdenParaAplicarDescuentos(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
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

  obtenerDescuentoPorMontoGeneral(
    total: number,
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      this.descuentoServicio.obtenerDescuentoPorMontoGeneral(
        this.cliente,
        total,
        descuentoPorMontoGeneral => {
          let resultadoDePromoHistorico: Promo = (this
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
                  descuentoPorMontoGeneral.apply = true;
                  this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
                } else {
                  this.descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
                }
                callback();
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          } else {
            this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
            callback();
          }
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al obtener el descuento por monto general: ${ex.message}`
      } as Operacion);
    }
  }

  seAplicaElDescuentoModificado(
    descuentoOriginalDeModificacion: number,
    descuentoModificado: number,
    descuentoNuevo: number
  ): boolean {
    return (
      descuentoOriginalDeModificacion !== 0 &&
      descuentoModificado <= descuentoNuevo
    );
  }

  // ----------Fin Descuentos----------//

  // ----------Inicio Promociones----------//

  obtenerHistoricodePromo(
    callBack: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
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

  validarSiAplicaLaBonificaciones(
    listaDeBonificaciones: Bono[],
    indiceDeListaDeBonificaciones: number,
    esBonificacionPorEscala: boolean,
    callBack: (listaDeBonificaciones: Bono[]) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeBonificacionesTerminoDeIterar(
            listaDeBonificaciones,
            indiceDeListaDeBonificaciones
          )
        ) {
          let bonificacionAValidar: Bono =
            listaDeBonificaciones[indiceDeListaDeBonificaciones];
          let resultadoDePromoHistorico: Promo = (this
            .listaHistoricoDePromos as any).find((promo: Promo) => {
            return (
              promo.promoId ===
              (esBonificacionPorEscala
                ? bonificacionAValidar.promoIdScale
                : bonificacionAValidar.promoIdMultiple)
            );
          });
          if (resultadoDePromoHistorico) {
            let promoDeBonificacion: Promo = new Promo();
            promoDeBonificacion.promoId = esBonificacionPorEscala
              ? bonificacionAValidar.promoIdScale
              : bonificacionAValidar.promoIdMultiple;
            promoDeBonificacion.promoName = esBonificacionPorEscala
              ? bonificacionAValidar.promoNameScale
              : bonificacionAValidar.promoNameMultiple;
            promoDeBonificacion.frequency = esBonificacionPorEscala
              ? bonificacionAValidar.frequencyScale
              : bonificacionAValidar.frequencyMultiple;
            this.promoServicio.validarSiAplicaPromo(
              promoDeBonificacion,
              resultadoDePromoHistorico,
              (aplicaBonificacion: boolean) => {
                if (!aplicaBonificacion) {
                  listaDeBonificaciones = listaDeBonificaciones.filter(
                    (bonificacion: Bono) => {
                      return (
                        resultadoDePromoHistorico.promoId !==
                        (esBonificacionPorEscala
                          ? bonificacion.promoIdScale
                          : bonificacion.promoIdMultiple)
                      );
                    }
                  );
                }
                this.validarSiAplicaLaBonificaciones(
                  listaDeBonificaciones,
                  indiceDeListaDeBonificaciones + (aplicaBonificacion ? 1 : 0),
                  esBonificacionPorEscala,
                  (listaDeBonificaciones: Bono[]) => {
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
            this.validarSiAplicaLaBonificaciones(
              listaDeBonificaciones,
              indiceDeListaDeBonificaciones + 1,
              esBonificacionPorEscala,
              (listaDeBonificaciones: Bono[]) => {
                callBack(listaDeBonificaciones);
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
        mensaje: `Error al validar la si aplica la bonificación: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeBonificacionesTerminoDeIterar(
    listaDeBonificaciones: Bono[],
    indiceDeListaDeBonificaciones: number
  ): boolean {
    return (
      listaDeBonificaciones.length > 0 &&
      listaDeBonificaciones.length > indiceDeListaDeBonificaciones
    );
  }

  validarSiAplicaElDescuento(
    listaDeDescuento: DescuentoPorEscalaSku[],
    indiceDeListaDeDescuento: number,
    callBack: (listaDeDescuento: DescuentoPorEscalaSku[]) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeDescuentoTerminoDeIterar(
            listaDeDescuento,
            indiceDeListaDeDescuento
          )
        ) {
          let descuentoAValidar: DescuentoPorEscalaSku =
            listaDeDescuento[indiceDeListaDeDescuento];
          let resultadoDePromoHistorico: Promo = (this
            .listaHistoricoDePromos as any).find((promo: Promo) => {
            return promo.promoId === descuentoAValidar.promoId;
          });
          if (resultadoDePromoHistorico) {
            let promoDeDescuento: Promo = new Promo();
            promoDeDescuento.promoId = descuentoAValidar.promoId;
            promoDeDescuento.promoName = descuentoAValidar.promoName;
            promoDeDescuento.frequency = descuentoAValidar.frequency;
            this.promoServicio.validarSiAplicaPromo(
              promoDeDescuento,
              resultadoDePromoHistorico,
              (aplicaDescuento: boolean) => {
                if (!aplicaDescuento) {
                  listaDeDescuento = listaDeDescuento.filter(
                    (descuento: DescuentoPorEscalaSku) => {
                      return (
                        resultadoDePromoHistorico.promoId !== descuento.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaElDescuento(
                  listaDeDescuento,
                  indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0),
                  (listaDeDescuento: DescuentoPorEscalaSku[]) => {
                    callBack(listaDeDescuento);
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
            promoDeDescuento = null;
          } else {
            this.validarSiAplicaElDescuento(
              listaDeDescuento,
              indiceDeListaDeDescuento + 1,
              (listaDeDescuento: DescuentoPorEscalaSku[]) => {
                callBack(listaDeDescuento);
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          }
        } else {
          callBack(listaDeDescuento);
        }
      } else {
        callBack(listaDeDescuento);
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al validar la si aplica el descuento: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeDescuentoTerminoDeIterar(
    listaDeDescuento: DescuentoPorEscalaSku[],
    indiceDeListaDeDescuento: number
  ): boolean {
    return (
      listaDeDescuento.length > 0 &&
      listaDeDescuento.length > indiceDeListaDeDescuento
    );
  }

  validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
    descuentoAValidar: DescuentoPorMontoGeneralYFamilia,
    indiceDeListaDeDescuento: number,
    callBack: (descuento: DescuentoPorMontoGeneralYFamilia) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        let resultadoDePromoHistorico: Promo = (this
          .listaHistoricoDePromos as any).find((promo: Promo) => {
          return promo.promoId === descuentoAValidar.promoId;
        });
        if (resultadoDePromoHistorico) {
          let promoDeDescuento: Promo = new Promo();
          promoDeDescuento.promoId = descuentoAValidar.promoId;
          promoDeDescuento.promoName = descuentoAValidar.promoName;
          promoDeDescuento.frequency = descuentoAValidar.frequency;

          this.promoServicio.validarSiAplicaPromo(
            promoDeDescuento,
            resultadoDePromoHistorico,
            (aplicaDescuento: boolean) => {
              if (!aplicaDescuento) {
                descuentoAValidar = new DescuentoPorMontoGeneralYFamilia();
              }
              callBack(descuentoAValidar);
            },
            (resultado: Operacion) => {
              errCallback(resultado);
            }
          );
        } else {
          callBack(descuentoAValidar);
        }
      } else {
        callBack(descuentoAValidar);
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al validar la si aplica el descuento por monto general y familia: ${ex.message}`
      } as Operacion);
    }
  }

  validarSiAplicaElDescuentoPorFamiliaYTipoPago(
    descuentoAValidar: DescuentoPorFamiliaYTipoPago,
    indiceDeListaDeDescuento: number,
    callBack: (descuento: DescuentoPorFamiliaYTipoPago) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        let resultadoDePromoHistorico: Promo = (this
          .listaHistoricoDePromos as any).find((promo: Promo) => {
          return promo.promoId === descuentoAValidar.promoId;
        });
        if (resultadoDePromoHistorico) {
          let promoDeDescuento: Promo = new Promo();
          promoDeDescuento.promoId = descuentoAValidar.promoId;
          promoDeDescuento.promoName = descuentoAValidar.promoName;
          promoDeDescuento.frequency = descuentoAValidar.frequency;

          this.promoServicio.validarSiAplicaPromo(
            promoDeDescuento,
            resultadoDePromoHistorico,
            (aplicaDescuento: boolean) => {
              if (!aplicaDescuento) {
                descuentoAValidar = new DescuentoPorFamiliaYTipoPago();
              }
              callBack(descuentoAValidar);
            },
            (resultado: Operacion) => {
              errCallback(resultado);
            }
          );
        } else {
          callBack(descuentoAValidar);
        }
      } else {
        callBack(descuentoAValidar);
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al validar la si aplica el descuento por familia y tipo pago: ${ex.message}`
      } as Operacion);
    }
  }

  ObtenerTotalDeLaOrden(
    callBack: (total: number) => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let totalOrden: number = this.tarea.salesOrderTotal;
      callBack(totalOrden);
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al obtener el total: ${ex.message}`
      } as Operacion);
    }
  }

  // ----------Fin Promociones----------//

  cargarPreciosEspeciales(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ): void {
    try {
      let sku: Sku = new Sku();
      sku.sku = this.sku.sku;
      this.precioEspecialServicio.obtenerPreciosEspecialesPorCliente(
        0,
        this.cliente,
        sku,
        (listaDePreciosEspeciales: Array<PrecioEspecial>) => {
          this.listaDePreciosEspeciales = listaDePreciosEspeciales;
          callback();
        },
        (resultado: Operacion) => {
          errCallback(resultado);
        }
      );
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener descuentos: ${ex.message}`
      });
    }
  }

  limpiarInformacionDeHistoricoDeSku(): void {
    let uiEtiquetaFechaUltimaCompra: JQuery = $("#UiEtiquetaFechaUltimaCompra");
    uiEtiquetaFechaUltimaCompra.text("");
    uiEtiquetaFechaUltimaCompra = null;

    let uiEtiquetaCantidadUltimaCompra: JQuery = $(
      "#UiEtiquetaCantidadUltimaCompra"
    );
    uiEtiquetaCantidadUltimaCompra.text("");
    uiEtiquetaCantidadUltimaCompra = null;

    let uiEtiquetaUnidadDeMedidaUltimaCompra: JQuery = $(
      "#UiEtiquetaUnidadDeMedidaUltimaCompra"
    );
    uiEtiquetaUnidadDeMedidaUltimaCompra.text("");
    uiEtiquetaUnidadDeMedidaUltimaCompra = null;

    let uiEtiquetaPrecioUltimaCompra: JQuery = $(
      "#UiEtiquetaPrecioUltimaCompra"
    );
    uiEtiquetaPrecioUltimaCompra.text("");
    uiEtiquetaPrecioUltimaCompra = null;

    let uiLiUltimoPedidoUnidadMedida: JQuery = $(
      "#UiLiUltimoPedidoUnidadMedida"
    );
    uiLiUltimoPedidoUnidadMedida.hide();
    uiLiUltimoPedidoUnidadMedida = null;
  }

  obtenerAutorizacionDeModificacionDePrecioDeProducto(
    callback: () => void
  ): void {
    try {
      ObtenerReglas(
        ReglaTipo.OperadorPuedeModificarPrecioDeProducto.toString(),
        (reglas: SqlResultSet) => {
          this.usuarioPuedeModificarPrecioDeProducto =
            reglas.rows.length > 0 &&
            (reglas.rows.item(0) as any).ENABLED.toUpperCase() === "SI";

          let uiLiPrecioNegociadoConCliente: JQuery = $(
            "#UiLiPrecioNegociadoConCliente"
          );
          if (this.usuarioPuedeModificarPrecioDeProducto) {
            uiLiPrecioNegociadoConCliente.show();
          } else {
            uiLiPrecioNegociadoConCliente.hide();
          }
          uiLiPrecioNegociadoConCliente = null;

          this.sku.canNegotiatePrice = this.usuarioPuedeModificarPrecioDeProducto;

          callback();
        },
        (error: string) => {
          notify(error);
        }
      );
    } catch (error) {
      notify(error);
    }
  }

  prepararImagenesDeProducto(callback: () => void) {
    try {
      this.imagenDeSkuServicio.obtenerImagenesDeProducto(
        this.sku,
        (imagenesDeProducto: Array<string>) => {
          this.listadoDeImagenesDeProductoSeleccionado = imagenesDeProducto;
          this.imagenDeSkuServicio.construirListadoDeImagenesParaProductoSeleccionado(
            imagenesDeProducto,
            false,
            callback
          );
        }
      );
    } catch (error) {
      notify(error.message);
    }
  }
}
