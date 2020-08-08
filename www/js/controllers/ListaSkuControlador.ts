class ListaSkuControlador {
  tokenCliente: SubscriptionToken;
  tokenTarea: SubscriptionToken;
  tokenCargarPorPrimeraVezListaSkuMensaje: SubscriptionToken;
  tokenAgregarOQuitarDeListaSkuMensaje: SubscriptionToken;
  tokenListaSku: SubscriptionToken;

  skuServicio = new SkuServicio();
  decimalesServicio = new ManejoDeDecimalesServicio();
  descuentoServicio = new DescuentoServicio();
  tareaServicio = new TareaServcio();
  razonServicio = new RazonServicio();

  consultaDeInventarioPorZonaControlador = new ConsultaDeInventarioPorZonaControlador();

  listaSkuQueNoSeModifica: Sku[] = [];
  listaSkuOriginal: Sku[] = [];
  listaSku: Sku[] = [];
  listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento> = [];
  listaHistoricoDePromos: Array<Promo> = [];

  configuracionDecimales: ManejoDeDecimales;
  cliente: Cliente;
  tarea: Tarea;
  descuentoPorMontoGeneral: DescuentoPorMontoGeneral;
  permiterRegregarPantallaAnterior: boolean = true;
  promoServicio: PromoServicio = new PromoServicio();

  pivotLimit = 25; // cantidad de skus que se desean mostrar
  currentLimit = 0; // limite maximo que se extrae del arreglo de skus
  lastLowLimit = 0; // ultimo limite inferior en el que se posiciono
  esPrimeraVez = true;
  listaDeSkuOrdenDeVenta: Sku[] = [];
  listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[] = [];
  listaDeDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago[] = [];

  constructor(public mensajero: Messenger) {
    this.tokenAgregarOQuitarDeListaSkuMensaje = mensajero.subscribe<
      AgregarOQuitarDeListaSkuMensaje
    >(
      this.agregarOQuitarDeListaSkuMensajeEntregado,
      getType(AgregarOQuitarDeListaSkuMensaje),
      this
    );
    this.tokenListaSku = mensajero.subscribe<ListaSkuMensaje>(
      this.listaSkuEntregado,
      getType(ListaSkuMensaje),
      this
    );
  }

  delegadoListaSkuControlador() {
    const este = this;

    $(document).on("pagebeforechange", (event, data) => {
      if (data.toPage === "skus_list_page") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.configuracionDecimales = data.options.data.configuracionDecimales;
        este.esPrimeraVez = data.options.data.esPrimeraVez;
        este.listaDeSkuOrdenDeVenta = data.options.data.listaDeSkuOrdenDeVenta;
        este.obtenerDescuentosPorMontoYFamiliaYTipoPago(
          () => {
            if (este.esPrimeraVez) {
              este.publicarEsPrimeraVez(este);
            }
            $.mobile.changePage("#skus_list_page");
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      }
      if (data.toPage === "pos_skus_page") {
        este.cliente = data.options.data.cliente;
        este.tarea = data.options.data.tarea;
        este.configuracionDecimales = data.options.data.configuracionDecimales;
        este.obtenerDescuentosPorMontoYFamiliaYTipoPago(
          () => {
            //--
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
        // este.esPrimeraVez = data.options.data.esPrimeraVez;
      }
    });

    $("#skus_list_page").on("pageshow", () => {
      let criterioDeBusquedaSku = $("#uiTxtFilterListSkusPage");
      criterioDeBusquedaSku.val("");
      criterioDeBusquedaSku.trigger("click");
      criterioDeBusquedaSku.focus();
      criterioDeBusquedaSku = null;
      if (
        este.configuracionDecimales == undefined ||
        este.configuracionDecimales == null ||
        !este.configuracionDecimales
      ) {
        this.decimalesServicio.obtenerInformacionDeManejoDeDecimales(
          (decimales: ManejoDeDecimales) => {
            este.configuracionDecimales = decimales;
            este.obtenerDescuentosPorMontoYFamiliaYTipoPago(
              () => {
                este.cargarPantalla(este);
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
        este.obtenerDescuentosPorMontoYFamiliaYTipoPago(
          () => {
            este.cargarPantalla(este);
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
      }
    });

    document.addEventListener(
      "backbutton",
      () => {
        este.volverAPantallaAnterior();
        return false;
      },
      true
    );

    $("#skus_list_page").on("click", "#skus_listview_panel li", event => {
      var id = (<any>event).currentTarget.attributes["id"].nodeValue;
      this.usuarioSeleccionoSku(id);
    });

    $("#UiBotonAgruparListaSku").bind("touchstart", () => {
      this.usuarioDeseaAgruparListaSku();
    });

    $("#uiBtnIrAPaginaAnteriorDeSkus").on("click", () => {
      if (this.lastLowLimit !== 0) {
        this.cargarListaSku(
          this.listaSku.slice(
            this.lastLowLimit - this.pivotLimit,
            this.lastLowLimit
          ),
          this.configuracionDecimales
        );
        this.currentLimit = this.lastLowLimit;
        this.lastLowLimit = this.lastLowLimit - this.pivotLimit;
      }
    });

    $("#uiBtnIrAPaginaSiguienteDeSkus").on("click", () => {
      if (this.currentLimit <= this.listaSku.length) {
        this.cargarListaSku(
          this.listaSku.slice(
            this.currentLimit,
            this.currentLimit + this.pivotLimit
          ),
          this.configuracionDecimales
        );
        this.lastLowLimit = this.currentLimit;
        this.currentLimit = this.currentLimit + this.pivotLimit;
      }
    });

    $("#uiBtnFilterListSkus").on("click", () => {
      var codigoSku = $("#uiTxtFilterListSkusPage");
      this.recargarListaDeSkuPorBusqueda(codigoSku.val().toUpperCase());

      var skusFiltrados = este.listaSkuOriginal;
      // var skusFiltrados = este.listaSkuOriginal.filter(skuFiltered => {
      //   const n = (skuFiltered.sku.toUpperCase() as any).includes(
      //     codigoSku.val().toUpperCase()
      //   );
      //   const m = (skuFiltered.skuDescription.toUpperCase() as any).includes(
      //     codigoSku.val().toUpperCase()
      //   );

      //   if (n || m) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // });
      console.log(skusFiltrados.length);
      //this.listaSku = skusFiltrados;
      // this.cargarListaSku(
      //   skusFiltrados.slice(0, this.pivotLimit),
      //   this.configuracionDecimales
      // );
      this.lastLowLimit = 0;
      this.currentLimit = this.pivotLimit;
    });

    $(document).on("click", "#form-search-skus .ui-input-clear", () => {
      this.listaSku = this.listaSkuOriginal;
      this.cargarListaSku(
        this.listaSku.slice(0, this.pivotLimit),
        this.configuracionDecimales
      );
      this.lastLowLimit = 0;
      this.currentLimit = this.pivotLimit;
    });

    $("#uiTxtFilterListSkusPage").on("keypress", e => {
      if (e.keyCode === 13 || e.keyCode === 9) {
        e.preventDefault();

        if ((<any>e.target).value === "") {
          notify(
            "Debe proporcionar un criterio de busqueda, por favor verifique y vuelva a intentar."
          );
        } else {
          this.recargarListaDeSkuPorBusqueda((<any>e.target).value.toUpperCase());
          var skusFiltrados = this.listaSkuOriginal;
          // const skusFiltrados = this.listaSkuOriginal.filter(skuFiltered => {
          //   const n = (skuFiltered.sku.toUpperCase() as any).includes(
          //     (<any>e.target).value.toUpperCase()
          //   );
          //   const m = (skuFiltered.skuDescription.toUpperCase() as any).includes(
          //     (<any>e.target).value.toUpperCase()
          //   );

          //   if (n || m) {
          //     return true;
          //   } else {
          //     return false;
          //   }
          // });
          console.log(skusFiltrados.length);
          //this.listaSku = skusFiltrados;
          // this.cargarListaSku(
          //   skusFiltrados.slice(0, this.pivotLimit),
          //   this.configuracionDecimales
          // );
          this.lastLowLimit = 0;
          this.currentLimit = this.pivotLimit;
        }
      } else {
        return true;
      }
    });

    $("#uiTxtFilterListSkusPage").on("keyup", e => {
      if (e.keyCode === 8 && (e.target as any).value === "") {
        e.preventDefault();
        this.recargarListaDeSkuPorBusqueda((e.target as any).value.toUpperCase());
        this.listaSku = this.listaSkuOriginal;
        // this.cargarListaSku(
        //   this.listaSku.slice(0, this.pivotLimit),
        //   this.configuracionDecimales
        // );
        this.lastLowLimit = 0;
        this.currentLimit = this.pivotLimit;
      } else {
        return true;
      }
    });

    $("#UiBotonOrdenarLisadoDeSkus").on("click", () => {
      este.usuarioDeseaCambiarElOrdenDelListado();
    });
    $("#UiBotonPromocionesListaSku").bind("touchstart", () => {
      este.usuarioDeseaVerPromocionesDisponibles();
    });
  }

  listaSkuEntregado(mensaje: ListaSkuMensaje, subcriber: any): void {
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
  }

  limpiarListaDeSku(
    callback: () => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      let skulist = $("#skus_listview_panel");
      skulist.children().remove("li");
      skulist = null;
      this.listaSkuQueNoSeModifica = null;

      localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", "ALL");

      callback();
    } catch (err) {
      errCallback(<Operacion>{
        codigo: -1,
        mensaje: "Error al limpiar el listado de sku " + err.mensaje
      });
    }
  }

  usuarioDeseaAgruparListaSku() {
    this.skuServicio.obtenerFamiliaSku(
      familiaSku => {
        var listaDeFamiliaSku = [];
        listaDeFamiliaSku.push({
          text: "Todos",
          value: "ALL"
        });
        for (var i = 0; i < familiaSku.rows.length; i++) {
          listaDeFamiliaSku.push({
            text: familiaSku.rows.item(i).DESCRIPTION_FAMILY_SKU,
            value: familiaSku.rows.item(i).CODE_FAMILY_SKU
          });
        }

        var configoptions = {
          title: "Listado de productos",
          items: listaDeFamiliaSku,
          doneButtonLabel: "Ok",
          cancelButtonLabel: "Cancelar"
        };
        ShowListPicker(configoptions, item => {
          var prevCodeFamilySku = localStorage.getItem(
            "LISTA_TIPO_FAMILIA_SKU"
          );
          localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", item);
          this.obtenerListaSku((operacion: Operacion) => {
            if (operacion.resultado === ResultadoOperacionTipo.Error) {
              notify(operacion.mensaje);
              localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", prevCodeFamilySku);
            }
          });
        });
      },
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  obtenerListaSku(callback: (operacion: Operacion) => void) {
    try {
      var sku = new Sku();
      if (localStorage.getItem("LISTA_TIPO_FAMILIA_SKU") === null) {
        localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", "ALL");
      }

      sku.codeFamilySku = localStorage.getItem("LISTA_TIPO_FAMILIA_SKU");

      this.decimalesServicio.obtenerInformacionDeManejoDeDecimales(
        (decimales: ManejoDeDecimales) => {
          if (this.tarea.taskType === TareaTipo.Venta) {
            this.skuServicio.obtenerSkuParaVenta(
              this.cliente,
              sku,
              decimales,
              (listaSku: Sku[]) => {
                this.cargarListaSku(listaSku, decimales);
              },
              callback
            );
          } else if (this.tarea.taskType === TareaTipo.Preventa) {
            var codigoSku = $("#uiTxtFilterListSkusPage");
            this.skuServicio.obtenerSkuParaPreVenta(
              this.cliente,
              sku,
              decimales,
              localStorage.getItem("SORT_BY"),
              localStorage.getItem("SORT_OPTION"),
              codigoSku.val().toUpperCase(),
              (listaSku: Sku[]) => {
                this.listaSku = listaSku;
                this.cargarListaSku(
                  this.listaSku.slice(0, this.pivotLimit),
                  decimales
                );
                this.lastLowLimit = 0;
                this.currentLimit = this.pivotLimit;
              },
              callback
            );
          }
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (err) {
      notify(err.mensaje);
    }
  }

  cargarListaSku(listaSku: Sku[], decimales: ManejoDeDecimales) {
    try {
      my_dialog("Sonda® " + SondaVersion, "Cargando Sku...", "open");

      this.obtenerDescuentos(() => {
        var skulist = $("#skus_listview_panel");
        skulist.listview();
        skulist.children().remove("li");
        if (listaSku.length >= 1) {
          let li = "";
          for (let i = 0; i < listaSku.length; i++) {
            const sku = listaSku[i];
            li += this.obtnerLiParaListaSku(sku, decimales);
          }
          skulist.append(li);
          skulist.listview("refresh");
        } else {
          notify("No se encontraron Sku para preventa.");
        }
        skulist = null;
        my_dialog("", "", "close");
      });
    } catch (err) {
      notify(err.message);
    }
  }

  obtnerLiParaListaSku(sku: Sku, decimales: ManejoDeDecimales): string {
    let li: string;
    li =
      "<li data-icon='false' class='ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'";
    li += ` id='lstSku${sku.sku.replace(" ", "_")}'>`;
    li += " <a href='#'";
    li += " <p>";
    li +=
      " <span style='background-color: #005599; border-radius: 4px; color: #ffffff; padding: 3px; ";
    li += ` text-shadow: none; font-size:13px' > ${format_number(
      sku.onHand,
      decimales.defaultDisplayDecimals
    )}</span>&nbsp`;
    li += ` <span style='font-size:12px;'>${sku.sku}</span>`;
    li += ` </p><p> <span style='font-size:12px;'>${sku.skuName}</span>`;
    li += " </p>";
    li += " <p>";
    li += ` <span class='ui-li-count'> ${DarFormatoAlMonto(
      format_number(sku.cost, decimales.defaultDisplayDecimals)
    )}</span>`;

    if (sku.codeFamilySku !== null && sku.codeFamilySku !== "") {
      li += `<span class='small-roboto'>Cod. Fam. SKU: ${sku.codeFamilySku}</span>`;
    }

    if (sku.discount !== 0) {
      li += `<span class='small-roboto'> Descuento: ${sku.discount}%</span>`;
    }

    if (this.tarea.taskType === TareaTipo.Preventa) {
      li += "</p>";
      li += "<p>";
      li += `<span class="small-roboto"> Reservados:${format_number(
        sku.isComited,
        decimales.defaultDisplayDecimals
      )}</span>`;
      li += `<span class="small-roboto"> Diferencia: ${format_number(
        sku.difference,
        decimales.defaultDisplayDecimals
      )}</span>`;
    }

    if (sku.lastQtySold > 0) {
      li += `<p class='small-roboto'> Ult. Pedido: ${format_number(
        sku.lastQtySold,
        decimales.defaultDisplayDecimals
      )}</p>`;
    }

    li += "</p>";
    li += "</a>";
    li += "</li>";

    return li;
  }

  publicarSku(sku: Sku) {
    const msg = new SkuMensaje(this);
    msg.sku = sku;
    this.mensajero.publish(msg, getType(SkuMensaje));
  }

  usuarioSeleccionoSku(idSku: string): void {
    let _this: ListaSkuControlador = this;

    let sku: Sku = (_this.listaSku as any).find((skuEnLista: Sku) => {
      return skuEnLista.sku === idSku.replace("_", " ").substr(6);
    });

    if (sku) {
      sku.qty = 1;

      _this.tarea.salesOrderTotal = this.obtenerTotalParaEnviar(
        this.listaDeSkuOrdenDeVenta,
        sku.codeFamilySku
      );

      $.mobile.changePage("skucant_page", {
        transition: "flow",
        reverse: true,
        changeHash: true,
        showLoadMsg: false,
        data: {
          cliente: _this.cliente,
          tarea: _this.tarea,
          configuracionDecimales: _this.configuracionDecimales,
          sku: sku,
          estaAgregando: true,
          listaDeSkuParaBonificacion: new Array<Sku>(),
          listaSku: new Array<Sku>(),
          listaDeSkuOrdenDeVenta: this.listaDeSkuOrdenDeVenta
        }
      });
    }
  }

  cargarPorPrimeraVezListaSkuMensajeEntregado(
    subcriber: any,
    callBack: () => void,
    errorCallBack: (resultado: Operacion) => void
  ): void {
    try {
      var sku = new Sku();
      if (localStorage.getItem("LISTA_TIPO_FAMILIA_SKU") === null) {
        localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", "ALL");
      }

      sku.codeFamilySku = localStorage.getItem("LISTA_TIPO_FAMILIA_SKU");

      if (subcriber.tarea.taskType === TareaTipo.Venta) {
        subcriber.skuServicio.obtenerSkuParaVenta(
          subcriber.cliente,
          sku,
          subcriber.configuracionDecimales,
          (listaSku: Sku[]) => {
            subcriber.listaSku = listaSku;
            subcriber.listaSkuOriginal = listaSku;
            subcriber.listaSkuQueNoSeModifica = <Sku[]>(
              JSON.parse(JSON.stringify(listaSku))
            );
            subcriber.cargarListaSku(
              listaSku.slice(0, subcriber.pivotLimit),
              subcriber.configuracionDecimales
            );
            subcriber.lastLowLimit = 0;
            subcriber.currentLimit = subcriber.pivotLimit;
            callBack();
          },
          (resultado: Operacion) => {
            errorCallBack(resultado);
          }
        );
      } else if (subcriber.tarea.taskType === TareaTipo.Preventa) {
        subcriber.skuServicio.obtenerSkuParaPreVenta(
          subcriber.cliente,
          sku,
          subcriber.configuracionDecimales,
          localStorage.getItem("SORT_BY"),
          localStorage.getItem("SORT_OPTION"),
          "",
          (listaSku: Sku[]) => {
            subcriber.listaSku = listaSku;
            subcriber.listaSkuOriginal = listaSku;
            subcriber.listaSkuQueNoSeModifica = <Sku[]>(
              JSON.parse(JSON.stringify(listaSku))
            );
            subcriber.cargarListaSku(
              listaSku.slice(0, subcriber.pivotLimit),
              subcriber.configuracionDecimales
            );
            subcriber.lastLowLimit = 0;
            subcriber.currentLimit = subcriber.pivotLimit;
            callBack();
          },
          (resultado: Operacion) => {
            errorCallBack(resultado);
          }
        );
      }
    } catch (ex) {
      errorCallBack(<Operacion>{
        codigo: -1,
        resultado: ResultadoOperacionTipo.Error,
        mensaje: ex.message
      });
    }
  }

  agregarOQuitarDeListaSkuMensajeEntregado(
    mensaje: AgregarOQuitarDeListaSkuMensaje,
    subcriber: any
  ): void {
    if (!mensaje.agregarSku && !mensaje.quitarSku) {
      return;
    }

    let sku = new Sku();
    let entroSku = false;
    if (mensaje.agregarSku) {
      for (var i = 0; i < subcriber.listaSkuQueNoSeModifica.length; i++) {
        let skuTemp = subcriber.listaSkuQueNoSeModifica[i];
        if (skuTemp.sku === mensaje.listaSku[0].sku) {
          sku = skuTemp;
          entroSku = true;
          break;
        }
      }
    } else {
      for (var i = 0; i < subcriber.listaSkuOriginal.length; i++) {
        let skuTemp = subcriber.listaSkuOriginal[i];
        if (skuTemp.sku === mensaje.listaSku[0].sku) {
          sku = skuTemp;
          entroSku = true;
          break;
        }
      }
    }

    if (!entroSku) {
      return;
    }

    if (mensaje.agregarSku) {
      let skulist = $("#skus_listview_panel");
      let li = subcriber.obtnerLiParaListaSku(
        sku,
        subcriber.configuracionDecimales
      );
      subcriber.listaSkuOriginal.push(sku);

      skulist.append(li);
      skulist.listview("refresh");
    } else if (mensaje.quitarSku) {
      let uiTarea = $("#lstSku" + sku.sku.replace(" ", "_"));
      uiTarea.closest("li").remove();
      uiTarea = null;

      let indice = subcriber.listaSkuOriginal.indexOf(sku);
      subcriber.listaSkuOriginal.splice(indice, 1);
    }

    subcriber.cargarPorPrimeraVezListaSkuMensajeEntregado(
      subcriber,
      () => {},
      (resultado: Operacion) => {
        notify(resultado.mensaje);
      }
    );
  }

  obtenerDescuentos(callback: () => void) {
    this.descuentoServicio.obtenerDescuentosPorCliente(
      this.cliente,
      (listaDeDescuento: Array<Descuento>) => {
        for (let i = 0; i < this.listaSku.length; i++) {
          let sku = this.listaSku[i];
          for (let j = 0; j < listaDeDescuento.length; j++) {
            let descuento = listaDeDescuento[j];
            if (sku.sku === descuento.codeSku) {
              sku.discount = descuento.discount;
              break;
            }
          }
        }
        callback();
      },
      (resultado: Operacion) => {
        callback();
        notify("Error al obtener los descuentos: " + resultado.mensaje);
      }
    );
  }

  obtenerDescuentoPorMontoGeneral(total: number, callback: () => void) {
    try {
      this.descuentoServicio.obtenerDescuentoPorMontoGeneral(
        this.cliente,
        total,
        descuentoPorMontoGeneral => {
          this.obtenerHistoricodePromo(
            () => {
              let resultadoDePromoHistorico = (this
                .listaHistoricoDePromos as any).find((promo: Promo) => {
                return promo.promoId === descuentoPorMontoGeneral.promoId;
              });
              if (resultadoDePromoHistorico) {
                let promoDeBonificacion: Promo = new Promo();
                promoDeBonificacion.promoId = descuentoPorMontoGeneral.promoId;
                promoDeBonificacion.promoName =
                  descuentoPorMontoGeneral.promoName;
                promoDeBonificacion.frequency =
                  descuentoPorMontoGeneral.frequency;
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
          //this.descuentoPorMontoGeneral = descuentoPorMontoGeneral;
          //callback();
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (ex) {
      notify(`Error al obtener el descuento por monto general: ${ex.message}`);
    }
  }

  volverAPantallaAnterior() {
    switch ($.mobile.activePage[0].id) {
      case "skus_list_page":
        this.limpiarListaDeSku(
          () => {
            $.mobile.changePage("pos_skus_page", {
              transition: "flow",
              reverse: true,
              changeHash: true,
              showLoadMsg: false,
              data: {
                cliente: this.cliente,
                tarea: this.tarea,
                configuracionDecimales: this.configuracionDecimales,
                esPrimeraVez: this.esPrimeraVez
              }
            });
          },
          (resultado: Operacion) => {
            notify(resultado.mensaje);
          }
        );
        break;
    }
  }

  validarReglaDeTomarFotoAlInicio(
    callback: (fotografia: string, validarFotografia: boolean) => void
  ) {
    try {
      if (
        this.cliente.fotoDeInicioDeVisita === undefined ||
        this.cliente.fotoDeInicioDeVisita === ""
      ) {
        this.tareaServicio.obtenerRegla(
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

  establecerFotoInicio(fotografia: string) {
    this.cliente.fotoDeInicioDeVisita = fotografia;
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
                        },
                        (resultado: Operacion) => {
                          notify(
                            "Error al actualizar la tarea: " + resultado.mensaje
                          );
                        }
                      );
                    });
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

  validarFotoYTareaSinGestion() {
    this.validarReglaDeTomarFotoAlInicio(
      (fotografia: string, validarFotografia: boolean) => {
        if (validarFotografia) {
          this.permiterRegregarPantallaAnterior = false;
          if (fotografia === "") {
            this.finalizarTareaSinGestion(() => {
              this.validarFotoYTareaSinGestion();
            });
            return;
          } else {
            this.establecerFotoInicio(fotografia);
          }
        } else {
          this.permiterRegregarPantallaAnterior = true;
        }
      }
    );
  }

  usuarioDeseaCambiarElOrdenDelListado() {
    let listaDeOpcionesDeOrdenamiento = [];
    listaDeOpcionesDeOrdenamiento.push({
      text: DescripcionOpcionDeOrdenDelListadoDeSku.CodigoDeProducto.toString(),
      value: OpcionDeOrdenDelListadoDeSku.CodigoDeProducto.toString()
    });
    listaDeOpcionesDeOrdenamiento.push({
      text: DescripcionOpcionDeOrdenDelListadoDeSku.NombreDeProducto.toString(),
      value: OpcionDeOrdenDelListadoDeSku.NombreDeProducto.toString()
    });
    listaDeOpcionesDeOrdenamiento.push({
      text: DescripcionOpcionDeOrdenDelListadoDeSku.UltimaCompra.toString(),
      value: OpcionDeOrdenDelListadoDeSku.UltimaCompra.toString()
    });
    listaDeOpcionesDeOrdenamiento.push({
      text: DescripcionOpcionDeOrdenDelListadoDeSku.Precio.toString(),
      value: OpcionDeOrdenDelListadoDeSku.Precio.toString()
    });

    let configuracionDeOpcionesDeOrdenamiento = {
      title: "Ordenar por",
      items: listaDeOpcionesDeOrdenamiento,
      doneButtonLabel: "Ok",
      cancelButtonLabel: "Cancelar"
    };

    ShowListPicker(configuracionDeOpcionesDeOrdenamiento, item => {
      this.preguntarTipoDeOrden(item.toString());
    });
  }

  preguntarTipoDeOrden(opcionDeOrdenamiento: string) {
    let listaDeTipoDeOrdenamiento = [];
    listaDeTipoDeOrdenamiento.push({
      text: DescripcionDeTipoDeOrdenDelListadoDeSku.Ascendente.toString(),
      value: TipoDeOrdenDelListadoDeSku.Ascendente.toString()
    });
    listaDeTipoDeOrdenamiento.push({
      text: DescripcionDeTipoDeOrdenDelListadoDeSku.Descendente.toString(),
      value: TipoDeOrdenDelListadoDeSku.Descendente.toString()
    });

    let configuracionDeOpcionesDeOrdenamiento = {
      title: "Tipo de Orden",
      items: listaDeTipoDeOrdenamiento,
      doneButtonLabel: "Ok",
      cancelButtonLabel: "Cancelar"
    };

    ShowListPicker(configuracionDeOpcionesDeOrdenamiento, item => {
      this.recargarListaDeSkuPorOrden(opcionDeOrdenamiento, item.toString());
    });
  }

  recargarListaDeSkuPorOrden(
    opcionDeOrdenamiento: string,
    tipoDeOrdenamiento: string
  ) {
    try {
      let sku = new Sku();
      if (localStorage.getItem("LISTA_TIPO_FAMILIA_SKU") === null) {
        localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", "ALL");
      }
      sku.codeFamilySku = localStorage.getItem("LISTA_TIPO_FAMILIA_SKU");
      var codigoSku = $("#uiTxtFilterListSkusPage");
      this.skuServicio.obtenerSkuParaPreVenta(
        this.cliente,
        sku,
        this.configuracionDecimales,
        opcionDeOrdenamiento,
        tipoDeOrdenamiento,
        codigoSku.val().toUpperCase(),
        (listaSku: Sku[]) => {
          this.listaSku = listaSku;
          this.listaSkuOriginal = listaSku;
          this.listaSkuQueNoSeModifica = <Sku[]>(
            JSON.parse(JSON.stringify(listaSku))
          );
          this.cargarListaSku(
            listaSku.slice(0, this.pivotLimit),
            this.configuracionDecimales
          );
          this.lastLowLimit = 0;
          this.currentLimit = this.pivotLimit;

          localStorage.setItem("SORT_BY", opcionDeOrdenamiento);
          localStorage.setItem("SORT_OPTION", tipoDeOrdenamiento);
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (e) {
      notify("Error al regarcar el listado de productos: " + e.mensaje);
    }
  }

  recargarListaDeSkuPorBusqueda(
    texto: string,
  ) {
    try {
      let sku = new Sku();
      if (localStorage.getItem("LISTA_TIPO_FAMILIA_SKU") === null) {
        localStorage.setItem("LISTA_TIPO_FAMILIA_SKU", "ALL");
      }
      sku.codeFamilySku = localStorage.getItem("LISTA_TIPO_FAMILIA_SKU");
      this.skuServicio.obtenerSkuParaPreVenta(
        this.cliente,
        sku,
        this.configuracionDecimales,
        localStorage.getItem("SORT_BY"),
        localStorage.getItem("SORT_OPTION"),
        texto,
        (listaSku: Sku[]) => {
          this.listaSku = listaSku;
          this.listaSkuOriginal = listaSku;
          this.listaSkuQueNoSeModifica = <Sku[]>(
            JSON.parse(JSON.stringify(listaSku))
          );
          this.cargarListaSku(
            listaSku.slice(0, this.pivotLimit),
            this.configuracionDecimales
          );
          this.lastLowLimit = 0;
          this.currentLimit = this.pivotLimit;
        },
        (resultado: Operacion) => {
          notify(resultado.mensaje);
        }
      );
    } catch (e) {
      notify("Error al regarcar el listado de productos: " + e.mensaje);
    }
  }

  cargarPantalla(_this: any) {
    if (
      !_this.cliente.fotoDeInicioDeVisita ||
      _this.cliente.fotoDeInicioDeVisita === undefined ||
      _this.cliente.fotoDeInicioDeVisita === "" ||
      _this.cliente.fotoDeInicioDeVisita === null
    ) {
      _this.validarFotoYTareaSinGestion();
    }

    let lblTotal = $("#UiTotalListadoSkus");
    _this.tarea.salesOrderTotal = this.obtenerTotalParaEnviar(
      this.listaDeSkuOrdenDeVenta,
      ""
    );
    if (_this.tarea.salesOrderTotal > 0) {
      if (
        _this.tarea.salesOrderTotal >=
          _this.tarea.discountPerGeneralAmountLowLimit &&
        _this.tarea.discountPerGeneralAmountHighLimit >=
          _this.tarea.salesOrderTotal
      ) {
        lblTotal.text(
          DarFormatoAlMonto(
            format_number(
              _this.tarea.salesOrderTotal -
                _this.tarea.salesOrderTotal *
                  (_this.cliente.appliedDiscount / 100),
              _this.configuracionDecimales.defaultDisplayDecimals
            )
          )
        );
      } else {
        _this.obtenerDescuentoPorMontoGeneral(
          _this.tarea.salesOrderTotal,
          () => {
            if (_this.descuentoPorMontoGeneral.apply) {
              if (
                _this.seAplicaElDescuentoModificado(
                  _this.cliente.discount,
                  _this.cliente.appliedDiscount,
                  _this.descuentoPorMontoGeneral.discount
                )
              ) {
                lblTotal.text(
                  DarFormatoAlMonto(
                    format_number(
                      _this.tarea.salesOrderTotal -
                        _this.tarea.salesOrderTotal *
                          (_this.cliente.appliedDiscount / 100),
                      _this.configuracionDecimales.defaultDisplayDecimals
                    )
                  )
                );
              } else {
                lblTotal.text(
                  DarFormatoAlMonto(
                    format_number(
                      _this.tarea.salesOrderTotal -
                        _this.tarea.salesOrderTotal *
                          (_this.descuentoPorMontoGeneral.discount / 100),
                      _this.configuracionDecimales.defaultDisplayDecimals
                    )
                  )
                );
              }
              lblTotal = null;
            } else {
              lblTotal.text(
                DarFormatoAlMonto(
                  format_number(
                    _this.tarea.salesOrderTotal,
                    _this.configuracionDecimales.defaultDisplayDecimals
                  )
                )
              );
            }
          }
        );
      }
    } else {
      lblTotal.text(
        DarFormatoAlMonto(
          format_number(0, _this.configuracionDecimales.defaultDisplayDecimals)
        )
      );
      lblTotal = null;
    }

    this.cargarPorPrimeraVezListaSkuMensajeEntregado(
      this,
      () => {
        my_dialog("", "", "close");
        InteraccionConUsuarioServicio.desbloquearPantalla();
      },
      resultado => {
        notify(resultado.mensaje);
      }
    );
  }

  publicarEsPrimeraVez(_this: ListaSkuControlador) {
    try {
      var msg = new ListaSkuMensaje(this);
      msg.listaSku = [];
      _this.mensajero.publish(msg, getType(ListaSkuMensaje));
      _this.esPrimeraVez = false;
    } catch (e) {
      _this.esPrimeraVez = true;
      notify("Error al limpiar listado: " + e.message);
    }
  }

  //----------Inicio Descuento---------//

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

      /*this.descuentoServicio.obtenerListaDeDescuentoPorMontoGeneralYFamilia(this.cliente,(listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[])=>{
                this.obtenerHistoricodePromo((listaHistoricoDePromos: Promo[]) => {
                    this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDeDescuentoPorMontoGeneralYFamilia,0,listaHistoricoDePromos, (listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[])=>{
                        this.descuentoServicio.obtenerDescuentoPorFamiliaYTipoPago(this.cliente, this.tarea, (listaDeDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago[])=>{
                            this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDeDescuentoPorFamiliaYTipoPago,0,listaHistoricoDePromos, (listaDeDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago[])=>{
                                this.listaDeDescuentoPorFamiliaYTipoPago = listaDeDescuentoPorFamiliaYTipoPago;
                                if(listaDeDescuentoPorMontoGeneralYFamilia.length > 0){
                                    let listaDeSku: Sku[] = [];                
                                    this.listaDeSkuOrdenDeVenta.forEach((skuOrden: Sku)=>{                                        
                                        
                                        //Obtemos el monto toal con el descuento aplicado de otras promociones
                                        let total = 0;
                                        if (skuOrden.discount !== 0) {                        
                                            switch (skuOrden.discountType) {
                                                case TiposDeDescuento.Porcentaje.toString():
                                                    total = trunc_number((skuOrden.total - ((skuOrden.appliedDiscount * skuOrden.total) / 100)), this.configuracionDecimales.defaultCalculationsDecimals);
                                                    break;
                                                case TiposDeDescuento.Monetario.toString():
                                                    total = trunc_number(skuOrden.total - skuOrden.appliedDiscount, this.configuracionDecimales.defaultCalculationsDecimals);
                                                    break;
                                            }                        
                                        }
                                        else{
                                            total  += trunc_number(skuOrden.total, this.configuracionDecimales.defaultCalculationsDecimals);
                                        }
        
                                        //Validamos que si exite el sku de lo contrario lo agregamos
                                        let resultadoSku:Sku = listaDeSku.find((sku: Sku) => {
                                            return (skuOrden.codeFamilySku === sku.codeFamilySku);
                                        });
        
                                        if (resultadoSku) {
                                            resultadoSku.total += trunc_number(total, this.configuracionDecimales.defaultCalculationsDecimals);
                                        }
                                        else{
                                            let skuAAgregar: Sku = new Sku();                                    
                                            skuAAgregar.codeFamilySku = skuOrden.codeFamilySku
                                            skuAAgregar.total = trunc_number(total, this.configuracionDecimales.defaultCalculationsDecimals);
                                            listaDeSku.push(skuAAgregar);
                                        }
                                    })
        
                                    let listaDeDescuentoPorMontoGeneralYFamiliaAEstablecer :DescuentoPorMontoGeneralYFamilia[]=[];
        
                                    listaDeSku.forEach((sku: Sku) => {
                                        let resultadoDescuento :DescuentoPorMontoGeneralYFamilia = listaDeDescuentoPorMontoGeneralYFamilia.find((descuento: DescuentoPorMontoGeneralYFamilia) => {
                                            return (sku.codeFamilySku === descuento.codeFamily) && (descuento.lowAmount <= sku.total && sku.total <= descuento.highAmount);                                    
                                        });
                                        if(resultadoDescuento){
                                            listaDeDescuentoPorMontoGeneralYFamiliaAEstablecer.push(resultadoDescuento)
                                        }
                                    });
        
                                    this.listaDeDescuentoPorMontoGeneralYFamilia = listaDeDescuentoPorMontoGeneralYFamiliaAEstablecer;                                    
                                    callback();
                                }else{
                                    callback();
                                }     
                            }, (resultado: Operacion) => {
                                errCallback(resultado);
                            }); 
                        }, (resultado: Operacion) => {
                            errCallback(resultado);
                        });                        
                    }, (resultado: Operacion) => {
                    errCallback(resultado);
                });
                }, (resultado: Operacion) => {
                    errCallback(resultado);
                });                              
            }, (resultado: Operacion) => {
                errCallback(resultado);
            });*/
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje:
          "Error al cargar bonificaciones por monto general: " + ex.message
      } as Operacion);
    }
  }

  //----------Fin Descuento---------//

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

  obtenerTotalParaEnviar(listaDeSku: Array<Sku>, codeFamily: string): number {
    let total = 0;
    try {
      listaDeSku.forEach((skuParaTotal: Sku) => {
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
    } catch (ex) {
      notify(`Error al obtener el total: ${ex.message}`);
    }
    return total;
  }

  usuarioDeseaVerPromocionesDisponibles() {
    try {
      let _this = this;
      $.mobile.changePage("PantallaDePromociones", {
        transition: "flow",
        reverse: true,
        changeHash: true,
        showLoadMsg: false,
        data: {
          cliente: _this.cliente,
          configuracionDecimales: _this.configuracionDecimales
        }
      });
    } catch (err) {
      notify("Error al mostrar las promos: " + err.message);
      my_dialog("", "", "closed");
    }
  }
}
