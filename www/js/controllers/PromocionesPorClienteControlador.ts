class PromocionesPorClienteControlador {
  //----------Propiedades----------//
  cliente: Cliente = new Cliente();
  configuracionDeDecimales: ManejoDeDecimales = new ManejoDeDecimales();
  listaHistoricoDePromos: Promo[] = [];
  promoServicio: PromoServicio = new PromoServicio();
  //----------Servicios----------//
  descuentoServicio: DescuentoServicio = new DescuentoServicio();
  bonoServicio: BonoServicio = new BonoServicio();

  delegarPromocionesPorClienteControlador() {
    const este = this;

    document.addEventListener(
      "backbutton",
      () => {
        este.mostrarPantallaAnterior();
      },
      true
    );

    $(document).on("pagebeforechange", (event, data) => {
      if (data.toPage === "PantallaDePromociones") {
        este.cliente = data.options.data.cliente;
        este.configuracionDeDecimales =
          data.options.data.configuracionDecimales;
        este.limpiarControles(
          () => {
            este.cargarPantalla(
              () => {
                my_dialog("", "", "closed");
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
        $.mobile.changePage("#PantallaDePromociones");
      }
    });
  }

  mostrarPantallaAnterior() {
    switch ($.mobile.activePage[0].id) {
      case "PantallaDePromociones":
        window.history.back();
        break;
    }
  }

  limpiarControles(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      let uiContenedorDePromociones = $("#UiContenedorDePromociones");
      uiContenedorDePromociones.empty();
      uiContenedorDePromociones = null;
      callback();
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al limpiar los controles: ${ex.message}`
      });
    }
  }

  cargarPantalla(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      my_dialog("Sonda® " + SondaVersion, "Cargando promociones...", "open");
      this.obtenerHistoricodePromo(
        () => {
          this.generarAcordionDePromoDescuentosPorEscala(
            () => {
              this.generarAcordionDePromoDescuentosPorMontoGeneral(
                () => {
                  this.generarAcordionDePromoDescuentosPorMontoYFamilia(
                    () => {
                      this.generarAcordionDePromoDescuentosPorFamiliaYTipoPago(
                        () => {
                          this.generarAcordionDePromoBonificacionPorMontoGeneral(
                            () => {
                              this.generarAcordionDePromoBonificacionesPorEscala(
                                () => {
                                  this.generarAcordionDePromoBonificacionesPorMultiplo(
                                    () => {
                                      this.generarAcordionDePromoBonificacionesPorCombo(
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
        mensaje: `Error al cargar los controles: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoDescuentosPorEscala(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.descuentoServicio.obtenerTodosLosDescuentosDeEscalaPorCliente(
        this.cliente,
        (listaDeDescuentos: DescuentoPorEscalaSku[]) => {
          this.validarSiAplicaElDescuento(
            listaDeDescuentos,
            0,
            (listaDeDescuentosDisponibles: DescuentoPorEscalaSku[]) => {
              let listaDescuentos: DescuentoPorEscalaSku[] = listaDeDescuentosDisponibles;
              if (listaDescuentos.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionDescuentoPorEscala">`
                );
                listaAcordion.push(
                  `<h5>Descuentos por Escala<span is="span" class="ui-li-count" id="Cant">${listaDescuentos.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">Sku</th>`);
                listaAcordion.push(`<th class="filaPromo">Escala</th>`);
                listaAcordion.push(`<th class="filaPromo">Descuento</th>`);
                listaAcordion.push(`</tr>`);
                listaDescuentos.map((descuento: DescuentoPorEscalaSku) => {
                  listaAcordion.push(`<tr class="filaCambioDeColor">`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(`${descuento.codeSku}`);
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${descuento.lowLimit}-${descuento.highLimit} ${descuento.codePackUnit}`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  switch (descuento.discountType) {
                    case TiposDeDescuento.Porcentaje.toString():
                      listaAcordion.push(
                        `${format_number(
                          descuento.discount,
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )}%`
                      );
                      break;
                    case TiposDeDescuento.Monetario.toString():
                      listaAcordion.push(
                        `${DarFormatoAlMonto(
                          format_number(
                            descuento.discount,
                            this.configuracionDeDecimales.defaultDisplayDecimals
                          )
                        )}`
                      );
                      break;
                  }
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`</tr>`);
                });
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoDescuentosPorMontoGeneral(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.descuentoServicio.obtenerDescuentosPorMontoGeneralPorCliente(
        this.cliente,
        (listaDeDescuentos: DescuentoPorMontoGeneral[]) => {
          this.validarSiAplicaElDescuentoPorMontoGeneral(
            listaDeDescuentos,
            0,
            (listaDeDescuentosDisponibles: DescuentoPorMontoGeneral[]) => {
              let listaDescuento: DescuentoPorMontoGeneral[] = listaDeDescuentosDisponibles;
              if (listaDescuento.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionDescuentoPorMontoGeneral">`
                );
                listaAcordion.push(
                  `<h5>DMG<span is="span" class="ui-li-count" id="Cant">${listaDescuento.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">LI</th>`);
                listaAcordion.push(`<th class="filaPromo">LS</th>`);
                listaAcordion.push(`<th class="filaPromo">Descuento</th>`);
                listaAcordion.push(`</tr>`);
                listaDescuento.map((descuento: DescuentoPorMontoGeneral) => {
                  listaAcordion.push(`<tr class="filaCambioDeColor">`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${DarFormatoAlMonto(
                      format_number(
                        descuento.lowAmount,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${DarFormatoAlMonto(
                      format_number(
                        descuento.highAmount,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${format_number(
                      descuento.discount,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )}%`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`</tr>`);
                });
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoDescuentosPorMontoYFamilia(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.descuentoServicio.obtenerListaDeDescuentoPorMontoGeneralYFamilia(
        this.cliente,
        (listaDeDescuentos: DescuentoPorMontoGeneralYFamilia[]) => {
          this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
            listaDeDescuentos,
            0,
            (
              listaDeDescuentosDisponibles: DescuentoPorMontoGeneralYFamilia[]
            ) => {
              let listaDescuento: DescuentoPorMontoGeneralYFamilia[] = listaDeDescuentosDisponibles;
              if (listaDescuento.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionDescuentoPorMontoYFamilia">`
                );
                listaAcordion.push(
                  `<h5>DMF<span is="span" class="ui-li-count" id="Cant">${listaDescuento.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">Familia</th>`);
                listaAcordion.push(`<th class="filaPromo">LI</th>`);
                listaAcordion.push(`<th class="filaPromo">LS</th>`);
                listaAcordion.push(`<th class="filaPromo">Descuento</th>`);
                listaAcordion.push(`</tr>`);
                listaDescuento.map(
                  (descuento: DescuentoPorMontoGeneralYFamilia) => {
                    //if(descuento.lowAmount > 0 && descuento.highAmount > 0){
                    listaAcordion.push(`<tr class="filaCambioDeColor">`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    listaAcordion.push(`${descuento.descriptionFamilySku}`);
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    listaAcordion.push(
                      `${DarFormatoAlMonto(
                        format_number(
                          descuento.lowAmount,
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )
                      )}`
                    );
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    listaAcordion.push(
                      `${DarFormatoAlMonto(
                        format_number(
                          descuento.highAmount,
                          this.configuracionDeDecimales.defaultDisplayDecimals
                        )
                      )}`
                    );
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    switch (descuento.discountType) {
                      case TiposDeDescuento.Porcentaje.toString():
                        listaAcordion.push(
                          `${format_number(
                            descuento.discount,
                            this.configuracionDeDecimales.defaultDisplayDecimals
                          )}%`
                        );
                        break;
                      case TiposDeDescuento.Monetario.toString():
                        listaAcordion.push(
                          `${DarFormatoAlMonto(
                            format_number(
                              descuento.discount,
                              this.configuracionDeDecimales
                                .defaultDisplayDecimals
                            )
                          )}`
                        );
                        break;
                    }
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`</tr>`);
                    //}
                  }
                );
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoDescuentosPorFamiliaYTipoPago(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (!this.cliente || !this.cliente.discountByFamilyAndPaymentTypeListId) {
        return callback();
      }

      this.descuentoServicio.obtenerDescuentoPorFamiliaYTipoPagoPorCliente(
        this.cliente,
        (listaDeDescuentos: DescuentoPorFamiliaYTipoPago[]) => {
          this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(
            listaDeDescuentos,
            0,
            (listaDeDescuentosDisponibles: DescuentoPorFamiliaYTipoPago[]) => {
              let listaDescuento: DescuentoPorFamiliaYTipoPago[] = listaDeDescuentosDisponibles;
              if (listaDescuento.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionDescuentoPorFamiliaYTipoPago">`
                );
                listaAcordion.push(
                  `<h5>DTPF<span is="span" class="ui-li-count" id="Cant">${listaDescuento.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">Familia</th>`);
                listaAcordion.push(`<th class="filaPromo">Tipo Pago</th>`);
                listaAcordion.push(`<th class="filaPromo">Descuento</th>`);
                listaAcordion.push(`</tr>`);
                listaDescuento.map(
                  (descuento: DescuentoPorFamiliaYTipoPago) => {
                    //if(descuento.lowAmount > 0 && descuento.highAmount > 0){
                    listaAcordion.push(`<tr class="filaCambioDeColor">`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    listaAcordion.push(`${descuento.descriptionFamilySku}`);
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    switch (descuento.paymentType) {
                      case TiposDePago.Credito.toString():
                        listaAcordion.push(`Credito`);
                        break;
                      case TiposDePago.Contado.toString():
                        listaAcordion.push(`Contado`);
                        break;
                    }
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`<td class="filaPromo">`);
                    switch (descuento.discountType) {
                      case TiposDeDescuento.Porcentaje.toString():
                        listaAcordion.push(
                          `${format_number(
                            descuento.discount,
                            this.configuracionDeDecimales.defaultDisplayDecimals
                          )}%`
                        );
                        break;
                      case TiposDeDescuento.Monetario.toString():
                        listaAcordion.push(
                          `${DarFormatoAlMonto(
                            format_number(
                              descuento.discount,
                              this.configuracionDeDecimales
                                .defaultDisplayDecimals
                            )
                          )}`
                        );
                        break;
                    }
                    listaAcordion.push(`</td>`);
                    listaAcordion.push(`</tr>`);
                    //}
                  }
                );
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoBonificacionPorMontoGeneral(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.bonoServicio.obtenerBonificacionPorMontoGeneralPorCliente(
        this.cliente,
        (listaDeBonificacion: BonoPorMontoGeneral[]) => {
          this.validarSiAplicaLaBonificacionesPorMontoGeneral(
            listaDeBonificacion,
            0,
            (listaDeBonificacionDisponibles: BonoPorMontoGeneral[]) => {
              let listaBonificacion: BonoPorMontoGeneral[] = listaDeBonificacionDisponibles;
              if (listaBonificacion.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionBonificacionPorMontoGeneral">`
                );
                listaAcordion.push(
                  `<h5>BMG<span is="span" class="ui-li-count" id="Cant">${listaBonificacion.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">Compra</th>`);
                listaAcordion.push(`<th class="filaPromo">Bonificaciones</th>`);
                listaAcordion.push(`</tr>`);
                listaBonificacion.map((bonificacion: BonoPorMontoGeneral) => {
                  listaAcordion.push(`<tr class="filaCambioDeColor">`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${DarFormatoAlMonto(
                      format_number(
                        bonificacion.lowLimit,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}-${DarFormatoAlMonto(
                      format_number(
                        bonificacion.highLimit,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${format_number(
                      bonificacion.bonusQty,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )}-${bonificacion.codePackUnitBonus}-${
                      bonificacion.codeSkuBonus
                    }`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`</tr>`);
                });
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoBonificacionesPorEscala(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.bonoServicio.obtenerTodasLasBonificacionPorEscalaPorCliente(
        this.cliente,
        (listaDeBonificacion: Bono[]) => {
          this.validarSiAplicaLaBonificacionesPorEscala(
            listaDeBonificacion,
            0,
            (listaDeBonificacionDisponibles: Bono[]) => {
              let listaBonificacion: Bono[] = listaDeBonificacionDisponibles;
              if (listaBonificacion.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionBonificacionPorEscala">`
                );
                listaAcordion.push(
                  `<h5>Bonificaciones por Escala<span is="span" class="ui-li-count" id="Cant">${listaBonificacion.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">Compra</th>`);
                listaAcordion.push(`<th class="filaPromo">Bonificaciones</th>`);
                listaAcordion.push(`</tr>`);
                listaBonificacion.map((bonificacion: Bono) => {
                  listaAcordion.push(`<tr class="filaCambioDeColor">`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${format_number(
                      bonificacion.lowLimitTemp,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )}-${DarFormatoAlMonto(
                      format_number(
                        bonificacion.highLimitTemp,
                        this.configuracionDeDecimales.defaultDisplayDecimals
                      )
                    )}-${bonificacion.codePackUnit} ${bonificacion.codeSku}`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${format_number(
                      bonificacion.bonusQtyTemp,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )}-${bonificacion.codePackUnitBonues}-${
                      bonificacion.codeSkuBonus
                    }`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`</tr>`);
                });
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  generarAcordionDePromoBonificacionesPorMultiplo(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      this.bonoServicio.obtenerTodasLasBonificacionesDeMultiploPorCliente(
        this.cliente,
        (listaDeBonificacion: Bono[]) => {
          this.validarSiAplicaLaBonificacionesPorMultiplo(
            listaDeBonificacion,
            0,
            (listaDeBonificacionDisponbiles: Bono[]) => {
              let listaBonificacion: Bono[] = listaDeBonificacionDisponbiles;
              if (listaBonificacion.length > 0) {
                let uiContenedorDePromociones = <any>(
                  $("#UiContenedorDePromociones")
                );
                uiContenedorDePromociones.collapsibleset().trigger("create");

                let listaAcordion: string[] = [];
                listaAcordion.push(
                  `<div is="collapsible" data-role="collapsible" id="UiAcordionBonificacionPorMultiplo">`
                );
                listaAcordion.push(
                  `<h5>Bonificaciones por Multiplo<span is="span" class="ui-li-count" id="Cant">${listaBonificacion.length}</span></h5>`
                );
                listaAcordion.push(
                  `<table class="tablePromo" style="width: 100%">`
                );
                listaAcordion.push(`<tr class="filaCambioDeColor">`);
                listaAcordion.push(`<th class="filaPromo">Por Cada</th>`);
                listaAcordion.push(`<th class="filaPromo">Bonifica</th>`);
                listaAcordion.push(`</tr>`);
                listaBonificacion.map((bonificacion: Bono) => {
                  listaAcordion.push(`<tr class="filaCambioDeColor">`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${format_number(
                      bonificacion.multiplo,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )} ${bonificacion.codePackUnit} ${bonificacion.codeSku}`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`<td class="filaPromo">`);
                  listaAcordion.push(
                    `${format_number(
                      bonificacion.bonusQtyMultiplo,
                      this.configuracionDeDecimales.defaultDisplayDecimals
                    )}-${bonificacion.codePackUnitBonues}-${
                      bonificacion.codeSkuBonus
                    }`
                  );
                  listaAcordion.push(`</td>`);
                  listaAcordion.push(`</tr>`);
                });
                listaAcordion.push(`</table>`);
                listaAcordion.push(`</div>`);
                uiContenedorDePromociones
                  .append(listaAcordion.join(""))
                  .collapsibleset("refresh");
                uiContenedorDePromociones.trigger("create");
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
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }
  generarAcordionDePromoBonificacionesPorCombo(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.cliente.bonoPorCombos.length > 0) {
        let uiContenedorDePromociones = <any>$("#UiContenedorDePromociones");
        uiContenedorDePromociones.collapsibleset().trigger("create");

        let listaAcordion: string[] = [];
        listaAcordion.push(
          `<div is="collapsible" data-role="collapsible" id="UiAcordionBonificacionPorMultiplo">`
        );
        listaAcordion.push(
          `<h5>Combos<span is="span" class="ui-li-count" id="Cant">${this.cliente.bonoPorCombos.length}</span></h5>`
        );
        listaAcordion.push(`<table class="tablePromo" style="width: 100%">`);
        listaAcordion.push(`<tr class="filaCambioDeColor">`);
        listaAcordion.push(`<th class="filaPromo">Al comprar el Combo</th>`);
        listaAcordion.push(`<th class="filaPromo">Tipo</th>`);
        listaAcordion.push(`<th class="filaPromo">Bonifica</th>`);
        listaAcordion.push(`</tr>`);
        this.cliente.bonoPorCombos.map((bonificacion: BonoPorCombo) => {
          listaAcordion.push(`<tr class="filaCambioDeColor">`);
          listaAcordion.push(
            `<td class="filaPromo" rowspan="${bonificacion.skusPorCombo.length}">`
          );
          listaAcordion.push(`${bonificacion.descriptionCombo}`);
          listaAcordion.push(`</td>`);
          listaAcordion.push(
            `<td class="filaPromo" rowspan="${bonificacion.skusPorCombo.length}">`
          );
          listaAcordion.push(
            `${
              bonificacion.isBonusByLowPurchase === 1
                ? "Compra " +
                  format_number(
                    bonificacion.lowQty,
                    this.configuracionDeDecimales.defaultDisplayDecimals
                  ) +
                  "Min"
                : ""
            }-${bonificacion.isBonusByCombo === 1 ? "Completo" : ""}`
          );
          listaAcordion.push(`<td class="filaPromo">`);
          listaAcordion.push(
            `${format_number(
              bonificacion.skusPorCombo[0].qty,
              this.configuracionDeDecimales.defaultDisplayDecimals
            )} ${bonificacion.skusPorCombo[0].codePackUnit} ${
              bonificacion.skusPorCombo[0].codeSku
            }`
          );
          listaAcordion.push(`</td>`);
          listaAcordion.push(`</td>`);
          listaAcordion.push(`</tr>`);
          let pasoYaPrimeraVez = false;
          bonificacion.skusPorCombo.map((skuPorCombo: SkuPorCombo) => {
            if (pasoYaPrimeraVez) {
              listaAcordion.push(`<tr class="filaCambioDeColor">`);
              listaAcordion.push(`<td class="filaPromo">`);
              listaAcordion.push(
                `${format_number(
                  skuPorCombo.qty,
                  this.configuracionDeDecimales.defaultDisplayDecimals
                )} ${skuPorCombo.codePackUnit} ${skuPorCombo.codeSku}`
              );
              listaAcordion.push(`</td>`);
              listaAcordion.push(`</tr>`);
            } else {
              pasoYaPrimeraVez = true;
            }
          });
        });
        listaAcordion.push(`</table>`);
        listaAcordion.push(`</div>`);
        uiContenedorDePromociones
          .append(listaAcordion.join(""))
          .collapsibleset("refresh");
        uiContenedorDePromociones.trigger("create");
        callback();
      } else {
        callback();
      }
    } catch (ex) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: `Error al obtener acordion de promo: ${ex.message}`
      });
    }
  }

  /**
   * Validar los descuentos y bonificaciones disponibles
   */

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
  /**
   * Validar los descuentos y bonificaciones disponibles
   */
  //--Descuentos por escala
  validarSiAplicaElDescuento(
    listaDeDescuento: DescuentoPorEscalaSku[],
    indiceDeListaDeDescuento: number,
    callBack: (listaDeDescuento: DescuentoPorEscalaSku[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
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
          let resultadoDePromoHistorico = (this
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

  //--Descuentos por monto general
  validarSiAplicaElDescuentoPorMontoGeneral(
    listaDeDescuento: DescuentoPorMontoGeneral[],
    indiceDeListaDeDescuento: number,
    callBack: (listaDeDescuento: DescuentoPorMontoGeneral[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeDescuentoPorMontoGeneralTerminoDeIterar(
            listaDeDescuento,
            indiceDeListaDeDescuento
          )
        ) {
          let descuentoAValidar: DescuentoPorMontoGeneral =
            listaDeDescuento[indiceDeListaDeDescuento];
          let resultadoDePromoHistorico = (this
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
                    (descuento: DescuentoPorMontoGeneral) => {
                      return (
                        resultadoDePromoHistorico.promoId !== descuento.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaElDescuentoPorMontoGeneral(
                  listaDeDescuento,
                  indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0),
                  (listaDeDescuento: DescuentoPorMontoGeneral[]) => {
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
            this.validarSiAplicaElDescuentoPorMontoGeneral(
              listaDeDescuento,
              indiceDeListaDeDescuento + 1,
              (listaDeDescuento: DescuentoPorMontoGeneral[]) => {
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
  listaDeDescuentoPorMontoGeneralTerminoDeIterar(
    listaDeDescuento: DescuentoPorMontoGeneral[],
    indiceDeListaDeDescuento: number
  ): boolean {
    return (
      listaDeDescuento.length > 0 &&
      listaDeDescuento.length > indiceDeListaDeDescuento
    );
  }

  //--Descuentos por monto general y familia
  validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
    listaDeDescuento: DescuentoPorMontoGeneralYFamilia[],
    indiceDeListaDeDescuento: number,
    callBack: (listaDeDescuento: DescuentoPorMontoGeneralYFamilia[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar(
            listaDeDescuento,
            indiceDeListaDeDescuento
          )
        ) {
          let descuentoAValidar: DescuentoPorMontoGeneralYFamilia =
            listaDeDescuento[indiceDeListaDeDescuento];
          let resultadoDePromoHistorico = (this
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
                    (descuento: DescuentoPorMontoGeneralYFamilia) => {
                      return (
                        resultadoDePromoHistorico.promoId !== descuento.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
                  listaDeDescuento,
                  indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0),
                  (listaDeDescuento: DescuentoPorMontoGeneralYFamilia[]) => {
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
            this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
              listaDeDescuento,
              indiceDeListaDeDescuento + 1,
              (listaDeDescuento: DescuentoPorMontoGeneralYFamilia[]) => {
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
        mensaje: `Error al validar la si aplica el descuento por monto general y familia: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar(
    listaDeDescuento: DescuentoPorMontoGeneralYFamilia[],
    indiceDeListaDeDescuento: number
  ): boolean {
    return (
      listaDeDescuento.length > 0 &&
      listaDeDescuento.length > indiceDeListaDeDescuento
    );
  }

  //--Descuentos por familia y tipo pago
  validarSiAplicaElDescuentoPorFamiliaYTipoPago(
    listaDeDescuento: DescuentoPorFamiliaYTipoPago[],
    indiceDeListaDeDescuento: number,
    callBack: (listaDeDescuento: DescuentoPorFamiliaYTipoPago[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeDescuentoPorFamiliaYTipoPagoTerminoDeIterar(
            listaDeDescuento,
            indiceDeListaDeDescuento
          )
        ) {
          let descuentoAValidar: DescuentoPorFamiliaYTipoPago =
            listaDeDescuento[indiceDeListaDeDescuento];
          let resultadoDePromoHistorico = (this
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
                    (descuento: DescuentoPorFamiliaYTipoPago) => {
                      return (
                        resultadoDePromoHistorico.promoId !== descuento.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(
                  listaDeDescuento,
                  indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0),
                  (listaDeDescuento: DescuentoPorFamiliaYTipoPago[]) => {
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
            this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(
              listaDeDescuento,
              indiceDeListaDeDescuento + 1,
              (listaDeDescuento: DescuentoPorFamiliaYTipoPago[]) => {
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
        mensaje: `Error al validar la si aplica el descuento por monto general y familia: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeDescuentoPorFamiliaYTipoPagoTerminoDeIterar(
    listaDeDescuento: DescuentoPorFamiliaYTipoPago[],
    indiceDeListaDeDescuento: number
  ): boolean {
    return (
      listaDeDescuento.length > 0 &&
      listaDeDescuento.length > indiceDeListaDeDescuento
    );
  }

  //--Bonificacion por monto general
  validarSiAplicaLaBonificacionesPorMontoGeneral(
    listaDeBonificaciones: BonoPorMontoGeneral[],
    indiceDeListaDeBonificacion: number,
    callBack: (listaDeBonificaciones: BonoPorMontoGeneral[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeBonificacionesTerminoDeIterar(
            listaDeBonificaciones,
            indiceDeListaDeBonificacion
          )
        ) {
          let bonificacionAValidar: BonoPorMontoGeneral =
            listaDeBonificaciones[indiceDeListaDeBonificacion];
          let resultadoDePromoHistorico = (this
            .listaHistoricoDePromos as any).find((promo: Promo) => {
            return promo.promoId === bonificacionAValidar.promoId;
          });
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

  //--Bonificacion por esala
  validarSiAplicaLaBonificacionesPorEscala(
    listaDeBonificaciones: Bono[],
    indiceDeListaDeBonificacion: number,
    callBack: (listaDeBonificaciones: Bono[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeBonificacionesPorEscalaTerminoDeIterar(
            listaDeBonificaciones,
            indiceDeListaDeBonificacion
          )
        ) {
          let bonificacionAValidar: Bono =
            listaDeBonificaciones[indiceDeListaDeBonificacion];
          let resultadoDePromoHistorico = (this
            .listaHistoricoDePromos as any).find((promo: Promo) => {
            return promo.promoId === bonificacionAValidar.promoIdScale;
          });
          if (resultadoDePromoHistorico) {
            let promoDeBonificacion: Promo = new Promo();
            promoDeBonificacion.promoId = bonificacionAValidar.promoIdScale;
            promoDeBonificacion.promoName = bonificacionAValidar.promoNameScale;
            promoDeBonificacion.frequency = bonificacionAValidar.frequencyScale;
            this.promoServicio.validarSiAplicaPromo(
              promoDeBonificacion,
              resultadoDePromoHistorico,
              (aplicaPromo: boolean) => {
                if (!aplicaPromo) {
                  listaDeBonificaciones = listaDeBonificaciones.filter(
                    (bonificacion: Bono) => {
                      return (
                        resultadoDePromoHistorico.promoId !==
                        bonificacion.promoIdScale
                      );
                    }
                  );
                }
                this.validarSiAplicaLaBonificacionesPorEscala(
                  listaDeBonificaciones,
                  indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0),
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
            this.validarSiAplicaLaBonificacionesPorEscala(
              listaDeBonificaciones,
              indiceDeListaDeBonificacion + 1,
              (listaDeDescuento: Bono[]) => {
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
        mensaje: `Error al validar la si aplica la bonificacion por escala: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeBonificacionesPorEscalaTerminoDeIterar(
    listaDeBonificaciones: Bono[],
    indiceDeListaDeBonificacion: number
  ): boolean {
    return (
      listaDeBonificaciones.length > 0 &&
      listaDeBonificaciones.length > indiceDeListaDeBonificacion
    );
  }

  //--Bonificacion por esala
  validarSiAplicaLaBonificacionesPorMultiplo(
    listaDeBonificaciones: Bono[],
    indiceDeListaDeBonificacion: number,
    callBack: (listaDeBonificaciones: Bono[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (this.listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeBonificacionesPorMultiploTerminoDeIterar(
            listaDeBonificaciones,
            indiceDeListaDeBonificacion
          )
        ) {
          let bonificacionAValidar: Bono =
            listaDeBonificaciones[indiceDeListaDeBonificacion];
          let resultadoDePromoHistorico = (this
            .listaHistoricoDePromos as any).find((promo: Promo) => {
            return promo.promoId === bonificacionAValidar.promoIdMultiple;
          });
          if (resultadoDePromoHistorico) {
            let promoDeBonificacion: Promo = new Promo();
            promoDeBonificacion.promoId = bonificacionAValidar.promoIdMultiple;
            promoDeBonificacion.promoName =
              bonificacionAValidar.promoNameMultiple;
            promoDeBonificacion.frequency =
              bonificacionAValidar.frequencyMultiple;
            this.promoServicio.validarSiAplicaPromo(
              promoDeBonificacion,
              resultadoDePromoHistorico,
              (aplicaPromo: boolean) => {
                if (!aplicaPromo) {
                  listaDeBonificaciones = listaDeBonificaciones.filter(
                    (bonificacion: Bono) => {
                      return (
                        resultadoDePromoHistorico.promoId !==
                        bonificacion.promoIdMultiple
                      );
                    }
                  );
                }
                this.validarSiAplicaLaBonificacionesPorEscala(
                  listaDeBonificaciones,
                  indiceDeListaDeBonificacion + (aplicaPromo ? 1 : 0),
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
            this.validarSiAplicaLaBonificacionesPorEscala(
              listaDeBonificaciones,
              indiceDeListaDeBonificacion + 1,
              (listaDeDescuento: Bono[]) => {
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
        mensaje: `Error al validar la si aplica la bonificacion por escala: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeBonificacionesPorMultiploTerminoDeIterar(
    listaDeBonificaciones: Bono[],
    indiceDeListaDeBonificacion: number
  ): boolean {
    return (
      listaDeBonificaciones.length > 0 &&
      listaDeBonificaciones.length > indiceDeListaDeBonificacion
    );
  }
}
