/// <reference path="../vertical/procesartipodetareamensaje.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../modelo/tiposyestados/tipos.ts" />
/// <reference path="../modelo/entidades/operacion.ts" />
/// <reference path="../services/DraftServicio.ts" />
/// <reference path="../vertical/facturadraftmensaje.ts" />
/// <reference path="../vertical/ordendeventadraftmensaje.ts" />

declare function notify(pMessage: string): void;

class DraftControlador {
  draftServicio = new DraftServicio();
  clienteServicio = new ClienteServicio();

  ordenesDeVentaDraft: OrdenDeVenta[];
  facturasDraft: Factura[];
  sePublicoSoDraft: boolean;
  tareaServicio = new TareaServcio();
  impresionServicio: ImpresionServicio = new ImpresionServicio();
  manejoDeDecimalesServicio: ManejoDeDecimalesServicio = new ManejoDeDecimalesServicio();

  constructor(public mensajero: Messenger) {}

  delegarDraftControlador() {
    $("#UiBtnListadoDocumentosDraft").bind("touchstart", () => {
      this.usuarioDeseaVerListadoDeDraft();
    });

    $("#UiPageDocsDraft").on("pageshow", () => {
      this.obtenerDrafts();
    });

    $("#UiPageDocsDraft").on("click", "#UiListaOrdenDeVentaDraft li", event => {
      var id = (<any>event).currentTarget.attributes["id"].nodeValue;
      this.usuarioDeseaVerDocumentoDeDraft(id);
    });
  }

  usuarioDeseaVerListadoDeDraft() {
    $.mobile.changePage("#UiPageDocsDraft", {
      transition: "pop",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
  }

  obtenerDrafts() {
    var listaSalesOrderDraft = $("#UiListaOrdenDeVentaDraft");
    listaSalesOrderDraft.children().remove("li");
    listaSalesOrderDraft = null;

    this.draftServicio.obtenerDraftsOrdenDeVenta(
      (ordenes: OrdenDeVenta[]) => {
        this.draftServicio.obtenerDetalleDeOrdenDeVentaDraft(
          ordenes,
          (ordenes: OrdenDeVenta[]) => {
            this.ordenesDeVentaDraft = ordenes;
            this.cargarLista(null, ordenes);
            this.actualizarTareaIdABorradorOrdeDeVenta();
          },
          (resultado: Operacion) => {
            this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
          }
        );
      },
      (resultado: Operacion) => {
        this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
      }
    );
  }

  actualizarTareaIdABorradorOrdeDeVenta() {
    try {
      for (var i = 0; i < this.ordenesDeVentaDraft.length; i++) {
        if (this.ordenesDeVentaDraft[i].taskId === 0) {
          this.draftServicio.obtenerTaskIdParaBorradorDeOrdenDeVenta(
            this.ordenesDeVentaDraft[i],
            i,
            (ordenDeVenta: OrdenDeVenta, indice: number) => {
              this.ordenesDeVentaDraft[indice] = ordenDeVenta;
              if (this.ordenesDeVentaDraft[indice].taskId !== 0) {
                this.draftServicio.actualizarTareaIdParaBorradorDeOrdenDeVenta(
                  this.ordenesDeVentaDraft[indice],
                  () => {
                    //--
                  },
                  (resultado: Operacion) => {
                    this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
                  }
                );
              }
            },
            (resultado: Operacion) => {
              this.mostrarMsjDeVacio(resultado.mensaje, "OrdenesDeVenta");
            }
          );
        }
      }
    } catch (err) {
      notify("Erro al actualizar la tarea id para el borrador: " + err.message);
    }
  }

  cargarLista(facturas: Factura[], ordenDeVenta: OrdenDeVenta[]) {
    var objetoUl = null; //$('#UiListaFacturasDraft');
    var esFactura = true;
    if (facturas === null || facturas === undefined) {
      esFactura = false;
      objetoUl = $("#UiListaOrdenDeVentaDraft");
    }

    // ReSharper disable once QualifiedExpressionMaybeNull
    for (
      var i = 0;
      i < (esFactura ? facturas.length : ordenDeVenta.length);
      i++
    ) {
      var li: string = "";

      li +=
        "<li data-icon='false' id='" +
        (esFactura
          ? "IV" + facturas[i].invoiceNum
          : "SO" + ordenDeVenta[i].salesOrderId) +
        "'>";
      li +=
        "<span class='title'>Documento No. " +
        (esFactura ? facturas[i].invoiceNum : ordenDeVenta[i].salesOrderId) +
        "</span>";
      li += "<p>";
      li +=
        "<span class='ui-content'>" +
        "<b>" +
        "CLIENTE: " +
        "</b>" +
        (esFactura ? facturas[i].clientName : ordenDeVenta[i].clientName) +
        "</span> <br>";
      li +=
        "<span class='ui-content'>" +
        "<b>" +
        "MONTO: " +
        "</b>" +
        DarFormatoAlMonto(
          esFactura ? facturas[i].totalAmount : ordenDeVenta[i].totalAmount
        ) +
        "</span><br>";
      li +=
        "<span class='ui-content'>" +
        "<b>" +
        "CREADA EL: " +
        "</b>" +
        (esFactura
          ? facturas[i].postedDatetime
          : ordenDeVenta[i].postedDatetime) +
        "</span>";
      li += "</p>";
      li += "</li>";

      objetoUl.append(li);
      objetoUl.listview("refresh");
      objetoUl.trigger("create");
    }
    objetoUl = null;
  }

  mostrarMsjDeVacio(mensaje: string, objeto: string) {
    var objetoUl =
      objeto === "Facturas"
        ? $("#UiListaFacturasDraft")
        : $("#UiListaOrdenDeVentaDraft");
    objetoUl.children().remove("li");
    var li: string = "";
    li += "<li style='text-align:center'>";
    li +=
      "<span style='text-align:center;font-size:10px;'>" + mensaje + "</span>";
    li += "</li>";
    objetoUl.append(li);
    objetoUl.listview("refresh");
    objetoUl.trigger("create");
    objetoUl = null;
  }

  usuarioDeseaVerDocumentoDeDraft(id: string) {
    if (id !== undefined && id !== null) {
      var esFactura = id.substring(0, 2) === "IV";

      var listaDeDocumentos = esFactura
        ? this.facturasDraft
        : this.ordenesDeVentaDraft;
      var idDoc = parseInt(id.substring(2));

      let documentoSoDraft = null;
      if (esFactura) {
        return;
      } else {
        documentoSoDraft = (listaDeDocumentos as any).find(
          (documento: OrdenDeVenta) => {
            return documento.salesOrderId === idDoc;
          }
        );
      }

      if (!documentoSoDraft) {
        return;
      }

      let verDetalleDeBorradorDeOrdenDeVenta = () => {
        gtaskid = documentoSoDraft.taskId === 0 ? 0 : documentoSoDraft.taskId;
        gTaskType = TareaTipo.Preventa;
        gClientID = documentoSoDraft.clientId;

        if (gtaskid !== 0) {
          var tarea = new Tarea();
          tarea.taskId = gtaskid;
          this.tareaServicio.obtenerTarea(
            tarea,
            (tarea: Tarea) => {
              switch (tarea.taskStatus) {
                case TareaEstado.Aceptada:
                  this.publicarSolicitudDeMetodoCargarTarea(TipoTarea.Preventa);
                  break;
                case TareaEstado.Asignada:
                  $.mobile.changePage("#taskdetail_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                  });
                  break;
              }
            },
            (resultado: Operacion) => {
              notify(resultado.mensaje);
            }
          );
        } else {
          this.publicarSolicitudDeMetodoCargarTarea(TipoTarea.Preventa);
          this.publicarOrdenDeVentaDraft(documentoSoDraft);
        }
      };

      let opcionesDeConfiguracion: any = {
        title: "Seleccionar",
        items: [
          { text: "Imprimir", value: "PRINT_DOCUMENT" },
          { text: "Continuar pedido", value: "CONTINUE_DOCUMENT" }
        ],
        doneButtonLabel: "Aceptar",
        cancelButtonLabel: "Cancelar"
      };

      ShowListPicker(opcionesDeConfiguracion, opcionSelecionada => {
        switch (opcionSelecionada) {
          case "PRINT_DOCUMENT":
            InteraccionConUsuarioServicio.bloquearPantalla();
            this.imprimirBorradorDeOrdenDeVenta(documentoSoDraft);
            break;
          default:
            verDetalleDeBorradorDeOrdenDeVenta();
            break;
        }
      });
    }
  }

  publicarOrdenDeVentaDraft(ordenDeVenta: OrdenDeVenta) {
    var msg = new OrdenDeVentaDraftMensaje(this);
    msg.ordenDeVenta = ordenDeVenta;
    this.mensajero.publish(msg, getType(OrdenDeVentaDraftMensaje));
    this.sePublicoSoDraft = true;
  }

  publicarSolicitudDeMetodoCargarTarea(tipoTarea: TipoTarea) {
    var msg = new ProcesarTipoDeTareaMensaje(this);
    msg.tipoTarea = tipoTarea;
    this.mensajero.publish(msg, getType(ProcesarTipoDeTareaMensaje));
  }

  imprimirBorradorDeOrdenDeVenta(ordenDeVenta: OrdenDeVenta): void {
    try {
      let cliente = new Cliente();
      cliente.clientId = ordenDeVenta.clientId;
      this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
        (configuracionDeDecimales: ManejoDeDecimales) => {
          this.clienteServicio.obtenerCliente(
            cliente,
            configuracionDeDecimales,
            (clienteCompleto: Cliente) => {
              this.draftServicio.obtenerFormatoDeImpresionDeBorradorDeOrdenDeVenta(
                clienteCompleto,
                ordenDeVenta,
                (formatoDeImpresion: string) => {
                  this.impresionServicio.validarEstadosYImprimir(
                    false,
                    gPrintAddress,
                    formatoDeImpresion,
                    true,
                    (resultado: Operacion) => {
                      if (
                        resultado.resultado !== ResultadoOperacionTipo.Exitoso
                      ) {
                        notify(
                          `Error al imprimir el documento debido a: ${resultado.mensaje}`
                        );
                      } else {
                        InteraccionConUsuarioServicio.desbloquearPantalla();
                      }
                    }
                  );
                },
                (resultado: Operacion) => {
                  notify(
                    `Error al imprimir el documento debido a: ${resultado.mensaje}`
                  );
                }
              );
            },
            (resultado: Operacion) => {
              notify(resultado.mensaje);
            }
          );
        },
        null
      );
    } catch (error) {
      notify(`Error al imprimir el documento debido a: ${error.message}`);
    }
  }
}
