var mensajero;
var currencySymbol = "Q";
var configurationDecimalsForResummePage = {};
var resumeInvoiceObject = {};
var methodCalculationType = "";
var gcountPrints = 0;
var mainInvoiceHasBeenPrinted = false;
var invoiceCopyHasBeenPrinted = false;
var gMaxImpresiones = 5;
var pictureSource; // picture source
var destinationType; // sets the format of returned value
var SONDA_DB_Session;
var gInvoiceNUM;
var gInvocingTotal = 0;
var gInvocingTotalToSave = 0;
var gTotalInvoiced = new Number();
var gTotalInvoicesProc = new Number();
var gSkuList = new Array();
var facturaTieneConsignacion = false;
var vieneDeIngresoCantidad = false;
var vieneDeListadoDeDocumentosDeEntrega = false;
var esEntregaParcial = false;
var estaEnEscaneoDeRga = false;
var esFacturaDeEntrega = false;
var demandaDeDespachoEnProcesoDeEntrega;
var gDefaultWhs = "";
var gBranchName = "";
var gCompanyName = "";
var gBranchAddress = "";
var pInvoiceJson;
var gPhoneNumber = "";
var gCarrierName = "";
var gClientCode = "";
var gTaskId = null;
var gTaskType = "";
var gCountReload = 0;
var gDiscount = 0;

var gBatteryLevel = 0;
var gSKUsJson = "";
var gNetworkState = 0;
var gPrepared = 0;
var gPanelOptionsIsOpen = 0;
var pPOSStatus = "CLOSED";
var pCpCl = "";
var states = {};
var gMyLocalIP = "";
var pUserID = "";
var socketConnectTimeInterval;
var gPrintAddress = "";
var gBankName = "";
var gdbuser = "";
var gdbuserpass = "";

var gVoidReasons = [];
var gBankAccounts = [];
var gSelectedAccount;
var gCalculaImpuesto = false;
var gImpuestoDeFactura = 0;
var gUsuarioEntraAResumenDeFacturacionDesdeListadoDeSkus = true;
var gNit = "";
var gClientName = "";
var lastDeliveryNoteId = 0;
var listaDeDetalleDeDemandaDeDespachoParaProcesoDeEntrega = [];
var listaDeDemandasDeDespachoEnProcesoDeEntrega = [];
var esEntregaConsolidada = false;
var esEntregaPorDocumento = false;
var guardarInventarioDeFacturaCancelada = false;
var estaEnFacturaTemporal = false;

var tokenListaDeDetalleDeDemandaDeDespachoConsolidado;
var clienteProcesadoConInformacionDeCuentaCorrienteParaPagoDeFacturasAbiertas;
var clienteProcesadoConInformacionDeCuentaCorriente;

var _globalUtils = this;
var tipoDePagoProcesadoEnCobroDeFacturasVencidas;

var SondaServerURL = ""; //DA

var logOb;

var gTaskType = "";
var gCurrentRoute = "";
var gDefaultWhs = "";
var gPreSaleWhs = "";
var gNotDeliveryReasons = [];
var gSalesOrderType = null;
var gPreguntaTipoOrdenDeVenta = null;
var gVentaEsReimpresion = false;
var tareaDetalleControlador;
var listaSkuControlador;
var documentoVentaControlador;
var estaCargandoInicioRuta = 0;
var estadisticaDeVentaControlador;
var encuestaControlador;
var cobroDeFacturaVencidaControlador;
var tipoDePagoDeFacturaVencidaControlador;
var confirmacionDePagoDeFacturaVencidaControlador;
var listaDePagoControlador;
var detalleDePagoControlador;
var catalogoDeProductoControlador;
var galeriaDeImagenControlador;

var default_image;
//var SondaServerURL = "http://190.56.115.27:8596"; //IP Publica Servidor Dev Mobility
//var SondaServerURL = "http://190.56.115.27:9596"; //IP Publica Servidor QA Mobility
var SondaServerURL = "";

var currentBranch = "cendalzaRoute";
var SondaVersion = "2020.11.10";
var SondaServerOptions = {
  reconnect: true,
  "max reconnection attempts": 60000
};
var gCurrentGPS = "0,0";
var gImageURI_1 = "";
var gImageURI_2 = "";
var gImageURI_3 = "";
var gImageURI_Deposit = "";
var gInitialTaskImage = "";

var gPagado = 0;
var gPrinterIsAvailable = 0;
var gLastLogin = "";
var gCurrentRoute = "";
var gRouteReturnWarehouse = "";
var gIsOnline = 0;

var pCurrentInvoiceID = 0;
var pCurrentNoteID = 0;

var pCurrentSAT_Resolution = 0;
var pCurrentSAT_Res_Serie = 0;

var pCurrentSAT_Resolution_notes = 0;
var pCurrentSAT_Res_Serie_notes = 0;

var pCurrentSAT_Res_DocStart = 0;
var pCurrentSAT_Res_DocFinish = 0;
var pCurrentSAT_Res_Date = "";

var pCurrentSAT_Res_DocStart_notes = 0;
var pCurrentSAT_Res_DocFinish_notes = 0;
var pCurrentSAT_Res_Date_notes = "";

var pCurrentDepositID = 0;

var gTotalDeposited = new Number();

var gHeaderSerial = "";
var gDetailSerial = "";

var gTaskOnRoutePlan = 1;
var gIsOnNotificationPage = false;

var currentBranch = "G-Force@Jakarta";
var SondaVersion = "9.2.1";

var estaEnConfirmacionDeFacturacion = false;

var gPuedeIniciarRuta = false;
var gInvoiceHeader;

// INFO: variables globales para controladores
var imagenDeEntregaControlador;
var firmaControlador;
var manifiestoControlador;
var estadisticaDeVentaPorDiaControlador;
var estadisticaDeVentaControlador;
var resumenDeTareaControlador;
var tareaControladorADelegar;
var confirmacionControlador;

// INFO: variable global para observacion de posicionamiento
var identificadorDeObservacionDePosicionamiento = null;

// INFO: variables globales para servicios
var controlDeSecuenciaServicio;
var facturacionElectronicaServicio;

function onMenuKeyDown() {
  var myFooter;

  try {
    switch ($.mobile.activePage[0].id) {
      case "pos_client_page":
        myFooter = $("#navFooter_POS_CUST");
        if (myFooter.css("visibility") === "hidden") {
          myFooter.css("visibility", "visible");
        } else {
          myFooter.css("visibility", "hidden");
        }
        break;
      case "pos_skus_page":
        if (!vieneDeListadoDeDocumentosDeEntrega) {
          PopulateAndShowSKUPanel();
        }
        break;
      case "login_page":
        break;
      default:
        var myPanel = $.mobile.activePage.children('[data-role="panel"]');
        myPanel.panel("toggle");
        break;
    }
  } catch (e) {}
}
function onSuccessGPS(position) {
  navigator.notification.activityStop();
  gCurrentGPS = position.coords.latitude + "," + position.coords.longitude;
  $("#myCurrentGPS").text(
    position.coords.latitude + "," + position.coords.longitude
  );
}
function DeviceIsOnline() {
  try {
    gNetworkState = navigator.connection.type;

    states[Connection.UNKNOWN] = "Unknown";
    states[Connection.ETHERNET] = "Ethernet";
    states[Connection.WIFI] = "WiFi";
    states[Connection.CELL_2G] = "2G";
    states[Connection.CELL_3G] = "3G";
    states[Connection.CELL_4G] = "4G";
    states[Connection.CELL] = "EDGE";
    states[Connection.NONE] = "NONE";

    $("#login_isonline").text("OnLine: " + states[gNetworkState]);
    $("#lblNetworkLogin").text(states[gNetworkState]);
    $("#lblNetworkDeliveryMenu").text(states[gNetworkState]);

    navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS, {
      maximumAge: 30000,
      timeout: 15000,
      enableHighAccuracy: true
    });
  } catch (e) {
    notify("DeviceIsOnline: " + e.message);
  }
}
function DeviceIsOffline() {
  $("#login_isonline").text("Offline");

  $("#login_isonline").text("OffLine");
  $("#lblNetworkLogin").text("OffLine");
  $("#lblNetworkDeliveryMenu").text("OffLine");

  gIsOnline = EstaEnLinea.No;
}
function my_dialog(pTitle, pMessage, pAction) {
  if (pAction === "open") {
    navigator.notification.activityStart(pTitle, pMessage);
  } else {
    navigator.notification.activityStop();
  }
}
function onErrorGPS(error) {
  navigator.notification.activityStop();
  $("#myCurrentGPS").text("GPS is unable at this moment");
  ToastThis("GPS is unreachable at this moment.");
}
function add_sku() {
  $.mobile.changePage("#dialog_sku_list", "pop", true, true);
}
function onBackKeyDown() {
  var myPanel = $.mobile.activePage.children('[data-role="panel"]');

  switch ($.mobile.activePage[0].id) {
    case "UiScoutingPage":
      navigator.notification.confirm(
        "¿Está seguro de cancelar el scouting? \n",
        function(buttonIndex) {
          if (buttonIndex === 2) {
            var scoutingControlador = new ScoutingControlador(new Messenger());
            scoutingControlador.limpiarCamposDeScouting(function() {
              $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false
              });
              scoutingControlador = null;
            });
          }
        },
        "Sonda® SD " + SondaVersion,
        ["No", "Si"]
      );
      break;
    case "UiPagetoAssociatePhoneNumerWithInvoice":
      navigator.notification.confirm(
        "¿Está seguro de cancelar el proceso? \n",
        function(buttonIndex) {
          if (buttonIndex === 2) {
            ShowInvoiceListPage();
          }
        },
        "Sonda® SD " + SondaVersion,
        ["No", "Si"]
      );
      break;
    case "remote_invoice_page":
      $("#lblRemoteInvoice_NIT").text("");
      $("#lblRemoteInvoice_Nombre").text("");
      $("#lblRemoteInvoice_Monto").text("Q 0.00");
      $("#lblRemoteInvoice_FechaHora").text("");

      $.mobile.changePage("#menu_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "printer_page":
      $.mobile.changePage("#menu_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "skus_list_page":
      window.vieneDeIngresoCantidad = false;
      $.mobile.changePage("#pos_skus_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "void_invoice_page":
      $.mobile.changePage("#menu_page", {
        transition: "flow",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "deposit_list_page":
      $.mobile.changePage("#menu_page", {
        transition: "slide",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "deposit_page":
      $.mobile.changePage("#menu_page", {
        transition: "slide",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "view_invoice_page":
      $.mobile.changePage("#invoice_list_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "invoice_list_page":
      var myDialog = $("#invoice_actions_dialog");

      guardarInventarioDeFacturaCancelada = false;

      if (gPanelOptionsIsOpen === 1) {
        myDialog.popup("close");
      } else {
        $.mobile.changePage("#menu_page", {
          transition: "none",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      }
      break;

    case "inv_page":
      $.mobile.changePage("#menu_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "skucant_page":
      window.vieneDeIngresoCantidad = true;

      $.mobile.changePage("#pos_skus_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;

    case "summary_page":
      if (PagoConsignacionesControlador.EstaEnPagoDeConsignacion) {
        PagoConsignacionesControlador.MostrarPantallaPrincipalDePagoDeConsignacion();
        PagoConsignacionesControlador.EliminarSkusDeProcesoDePago();
        PagoConsignacionesControlador.ConsignacionesPagadas.length = 0;
      } else {
        window.vieneDeIngresoCantidad = false;
        $.mobile.changePage("#pos_skus_page", {
          transition: "none",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      }
      break;
    case "series_page":
      window.vieneDeIngresoCantidad = false;
      $.mobile.changePage("#pos_skus_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "pos_skus_page":
      if (gClientCode === "C000000") {
        navigator.notification.confirm(
          "Esta seguro de abandonar la tarea actual? \n",
          function(buttonIndex) {
            if (buttonIndex === 2) {
              onResume(function() {
                $.mobile.changePage("#menu_page", {
                  transition: "pop",
                  reverse: true,
                  changeHash: true,
                  showLoadMsg: false
                });
              });
            }
          },
          "Sonda® SD " + SondaVersion,
          ["No", "Si"]
        );
      } else {
        if (!vieneDeListadoDeDocumentosDeEntrega) {
          ClasificacionesServicio.ObtenerRasones(
            TiposDeRazones.NoFacturacion,
            function(razones) {
              if (razones.length > 0) {
                var listaRazones = new Array();
                for (var i = 0; i < razones.length; i++) {
                  var item = {
                    text: razones[i].REASON_PROMPT,
                    value: razones[i].REASON_VALUE
                  };
                  listaRazones.push(item);
                }

                var configOptions = {
                  title: "¿Por qué abandona la tarea?: ",
                  items: listaRazones,
                  doneButtonLabel: "OK",
                  cancelButtonLabel: "CANCELAR"
                };
                window.plugins.listpicker.showPicker(configOptions, function(
                  item
                ) {
                  var reglaServicio = new ReglaServicio();
                  reglaServicio.obtenerRegla(
                    "NuevaTareaConBaseEnTareaSinGestion",
                    regla => {
                      if (
                        regla.rows.length > 0 &&
                        regla.rows.item(0).ENABLED.toUpperCase() === "SI"
                      ) {
                        navigator.notification.confirm(
                          "¿Desea crear una nueva tarea?",
                          buttonIndex => {
                            switch (buttonIndex) {
                              case 1:
                                // InteraccionConUsuarioServicio.bloquearPantalla();
                                actualizarEstadoDeTarea(
                                  gTaskId,
                                  TareaGeneroGestion.No,
                                  item,
                                  () => {
                                    onResume(() => {
                                      EnviarData();
                                      gTaskOnRoutePlan = 1;
                                      $.mobile.changePage("#menu_page", {
                                        transition: "pop",
                                        reverse: true,
                                        changeHash: true,
                                        showLoadMsg: false
                                      });
                                    });
                                  },
                                  TareaEstado.Completada
                                );
                                break;
                              case 2:
                                resumenDeTareaControlador.crearNuevaTarea();
                                actualizarEstadoDeTarea(
                                  gTaskId,
                                  TareaGeneroGestion.No,
                                  item,
                                  () => {
                                    onResume(() => {
                                      EnviarData();
                                      gTaskOnRoutePlan = 1;
                                    });
                                  },
                                  TareaEstado.Completada
                                );
                                break;
                              default:
                                break;
                            }
                          },
                          "Sonda® SD " + SondaVersion,
                          ["No", "Si"]
                        );
                      } else {
                        actualizarEstadoDeTarea(
                          gTaskId,
                          TareaGeneroGestion.No,
                          item,
                          () => {
                            onResume(() => {
                              EnviarData();
                              gTaskOnRoutePlan = 1;
                              $.mobile.changePage("#menu_page", {
                                transition: "pop",
                                reverse: true,
                                changeHash: true,
                                showLoadMsg: false
                              });
                            });
                          },
                          TareaEstado.Completada
                        );
                      }
                    }
                  );
                });
              } else {
                notify(
                  "Lo sentimos, no se han encontrado razones de No Facturación, por favor, intente nuevamente."
                );
              }
            },
            function(error) {
              notify(error);
            }
          );
        } else {
          var entregaServicio = new EntregaServicio();
          entregaServicio.obtenerSkuModificados(
            entregaServicio,
            EstadoDeFactura.EnProceso,
            function(listaSkuModificados, entregaServicio) {
              if (listaSkuModificados.length > 0) {
                navigator.notification.confirm(
                  "¿Confirma salir, esto perdera sus cambios.?",
                  function(buttonIndex) {
                    if (UsuarioSeleccionoBotonSi(buttonIndex)) {
                      onResume(function() {
                        EnviarData();
                        var tarea = new Tarea();
                        tarea.taskId = gTaskId;
                        tarea.taskType = gTaskType;

                        PublicarTareaDeEntrega(tarea);

                        $.mobile.changePage("#UiDeliveryDetailPage", {
                          transition: "pop",
                          reverse: true,
                          changeHash: true,
                          showLoadMsg: false
                        });
                      });
                    } else {
                      vieneDeListadoDeDocumentosDeEntrega = true;
                    }
                  },
                  "Sonda® " + SondaVersion,
                  ["No", "Si"]
                );
              } else {
                onResume(function() {
                  EnviarData();
                  var tarea = new Tarea();
                  tarea.taskId = gTaskId;
                  tarea.taskType = gTaskType;

                  PublicarTareaDeEntrega(tarea);

                  $.mobile.changePage("#UiDeliveryDetailPage", {
                    transition: "pop",
                    reverse: true,
                    changeHash: true,
                    showLoadMsg: false
                  });
                });
              }
            },
            function(error) {
              notify(error.mensaje);
            }
          );

          esFacturaDeEntrega = false;
          demandaDeDespachoEnProcesoDeEntrega = new DemandaDeDespachoEncabezado();
          PagoConsignacionesControlador.EstaEnPagoDeConsignacion = false;
          PagoConsignacionesControlador.EstaEnDetalle = false;
          gcountPrints = 0;
          mainInvoiceHasBeenPrinted = false;
          invoiceCopyHasBeenPrinted = false;
          vieneDeListadoDeDocumentosDeEntrega = false;
          listaDeDetalleDeDemandaDeDespachoParaProcesoDeEntrega.length = 0;
          listaDeDemandasDeDespachoEnProcesoDeEntrega.length = 0;
          esEntregaConsolidada = false;
          esEntregaPorDocumento = false;
        }
      }

      break;
    case "dialog_sku_list":
      $.mobile.changePage("#pos_client_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;

    case "dialog_cust_list":
      $.mobile.changePage("#pos_client_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;

    case "pos_client_page":
      if (myPanel.css("visibility") === "hidden") {
        $.mobile.changePage("#menu_page", {
          transition: "none",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      } else {
        myPanel.panel("toggle");
      }

      break;
    case "dialog_startpos":
      if (
        localStorage.getItem("POS_STATUS") === "CLOSED" ||
        localStorage.getItem("POS_STATUS") === null ||
        localStorage.getItem("POS_STATUS") === undefined
      ) {
        return;
      } else {
        $.mobile.changePage("#menu_page", {
          transition: "pop",
          reverse: false,
          changeHash: false,
          showLoadMsg: false
        });
      }

      break;

    case "login_page":
      if (myPanel.css("visibility") === "hidden") {
        navigator.app.exitApp();
      } else {
        myPanel.panel("toggle");
      }
      break;
    case "menu_page":
      if (estaEnEscaneoDeRga === false) {
        if (myPanel.css("visibility") === "visible") {
          myPanel.panel("toggle");
        } else {
          navigator.app.exitApp();
        }
      } else {
        estaEnEscaneoDeRga = false;
      }
      break;
    case "pageDevolucion":
      $.mobile.changePage("#menu_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "PageConsignmentList":
      $.mobile.changePage("#menu_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "UiVentanaDetalleConsignacion":
      $.mobile.changePage("#PageConsignmentList", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "UiCantidadAConsignacionPage":
      RegresarAPantallaDeConsignacion();
      break;
    case "PageConsignment":
      CancelarIngresoConsignacion();
      break;
    case "UiPageConsignmentPayment":
      if (PagoConsignacionesControlador.EstaEnDetalle) {
        document.getElementById(
          "DivUiListaConsignacionesAPagar"
        ).style.display = "block";
        document.getElementById(
          "DivUiListaDetalleDeConsignacionAPagar"
        ).style.display = "none";
        PagoConsignacionesControlador.EstaEnDetalle = false;
      } else {
        PagoConsignacionesControlador.VolverAPantallaPrincipal();
        //PagoConsignacionesControlador.EstaEnPagoDeConsignacion = false;
      }
      break;
    case "UiInsertQtySkuConsignmnetPage":
      CantidadSkuEnConsignacionControlador.VolverAPantallaAnterior();
      //PagoConsignacionesControlador.EstaEnIngresoDeCantidadSku = false;
      break;
    case "UiPageCollectQtySkuFromConsignment":
      CantidadSkuARecogerProductoEnConsignacionControlador.VolverAPantallaAnterior();
      break;
    case "UiDevolutionDocumentsPage":
      if (DocumentosDeDevolucionControlador.EstaEnDetalle) {
        document.getElementById("navBarHeader").style.display = "block";
        document.getElementById("navBarDetail").style.display = "none";

        document.getElementById(
          "DivUiListaDocumentosDevolucion"
        ).style.display = "block";
        document.getElementById(
          "DivUiListaDetalleDeDocumentoDeDevolucion"
        ).style.display = "none";
        DocumentosDeDevolucionControlador.EstaEnDetalle = false;
      } else {
        DocumentosDeDevolucionControlador.VolverAMenu();
      }
      break;
    case "UiConfirmationProcessPaidPage":
      PagoConsignacionesControlador.EstaEnDetalle = false;
      PagoConsignacionesControlador.EstaEnPagoDeConsignacion = false;
      PagoConsignacionesControlador.EstaEnIngresoDeCantidadSku = false;
      DocumentosDeDevolucionControlador.VolverAMenu();
      break;
    case "UiConfirmationRecollectPage":
      PagoConsignacionesControlador.EstaEnDetalle = false;
      PagoConsignacionesControlador.EstaEnPagoDeConsignacion = false;
      PagoConsignacionesControlador.EstaEnIngresoDeCantidadSku = false;
      DocumentosDeDevolucionControlador.VolverAMenu();
      break;
    case "confirmation_consignment":
      DocumentosDeDevolucionControlador.VolverAMenu();
      break;
    case "UiLiquidationReportPage":
      DocumentosDeDevolucionControlador.VolverAMenu();
      break;
    case "UiNewTaskOutsideOfRoutePlanPage":
      $.mobile.changePage("#menu_page", {
        transition: "pop",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
    case "businnes_rival_poll":
      navigator.notification.confirm(
        "Esta seguro que desea cancelar la encuesta?",
        function(buttonIndex) {
          if (buttonIndex === 2) {
            $.mobile.changePage("#confirmation_page", {
              transition: "none",
              reverse: true,
              changeHash: true,
              showLoadMsg: false
            });
          }
        },
        "Sonda®  " + SondaVersion,
        "No,Si"
      );
      break;
    case "UiNotificationPage":
      var notificacionControlador = new NotificacionControlador();
      notificacionControlador.VolverAMenuPrincipal();
      notificacionControlador = null;
      window.gIsOnNotificationPage = false;
      break;

    case "UiDetailTransferPage":
      var transferenciaDetalleControlador = new TransferenciaDetalleControlador();
      transferenciaDetalleControlador.IrAPantalla("UiNotificationPage");
      transferenciaDetalleControlador = null;
      break;

    case "UiPageScanManifest":
      manifiestoControlador.regresarAPantallaAnterior("menu_page");
      break;

    case "UiDeliveryPage":
      var entregaControlador = new EntregaControlador(mensajero);
      entregaControlador.irAPantalla("menu_page");
      entregaControlador = null;
      break;
    case "UiDeliveryDetailPage":
      var entregaDetalleControlador = new EntregaDetalleControlador(mensajero);
      entregaDetalleControlador.irAPantalla("UiDeliveryPage");
      entregaDetalleControlador = null;
      break;
    case "UiDeliveryReportPage":
      var reporteDeEntregaControlador = new ReporteDeEntregaControlador(
        new Messenger()
      );
      reporteDeEntregaControlador.irAPantalla("menu_page");
      reporteDeEntregaControlador = null;
      break;

    case "UiOverdueInvoicePaymentPage":
      var cobroDeFacturaVencidaControlador = new CobroDeFacturaVencidaControlador(
        mensajero
      );
      cobroDeFacturaVencidaControlador.irAPantallaDeCliente();
      cobroDeFacturaVencidaControlador = null;
      break;

    case "UiOverdueInvoicePaymentDetailPage":
      var tipoDePagoEnFacturaVencidaControlador = new TipoDePagoEnFacturaVencidaControlador(
        mensajero
      );
      tipoDePagoEnFacturaVencidaControlador.irAPantalla(
        "UiOverdueInvoicePaymentPage"
      );
      tipoDePagoEnFacturaVencidaControlador = null;
      break;

    case "UiPaymentListPage":
      var listaDePagoControlador = new ListaDePagoControlador(mensajero);
      listaDePagoControlador.irAPantalla("menu_page");
      listaDePagoControlador = null;
      break;

    case "UiPaymentDetailPage":
      var detalleDePagoControlador = new DetalleDePagoControlador(mensajero);
      detalleDePagoControlador.documentoDePago = new PagoDeFacturaVencidaEncabezado();
      detalleDePagoControlador.irAPantalla("UiPaymentListPage");
      break;

    case "UiDeliveryImagePage":
      imagenDeEntregaControlador.usuarioDeseaRegresarAPantallaAnterior();
      break;
    case "UiSignaturePage":
      firmaControlador.usuarioDeseaVolverAPantallaAnterior();
      break;
    case "UiSaleStatisticPage":
      estadisticaDeVentaPorDiaControlador.regresarPantallaAutorizacion();
      break;
    case "UiTaskResumePage":
      $.mobile.changePage("#menu_page", {
        transition: "none",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
      });
      break;
  }
}

function UsuarioSeleccionoBotonSi(indiceBoton) {
  return indiceBoton === BotonSeleccionado.Si;
}

function UsuarioSeleccionoBotonAtras(indiceBoton) {
  return indiceBoton === BotonSeleccionado.Atras;
}

function UsuarioSeleccionoBotonNo(indiceBoton) {
  return indiceBoton === BotonSeleccionado.No;
}

function showmenu() {
  $("#popupMenu").popup("open", {
    positionTo: "#myMenuList",
    transtion: "slideup"
  });
}
function preview_picture(pID) {
  var pSrc = $("#btnPreviewImg" + pID).attr("srcpic");
  $("#popphoto").attr("src", pSrc);
  $("#popupPic")
    .popup()
    .popup("open", { transition: "none" });
}
function ShowInvoiceConfirmation() {
  PagoConsignacionesControlador.EstaEnPagoDeConsignacion = false;
  PagoConsignacionesControlador.EstaEnDetalle = false;
  window.gcountPrints = 0;
  mainInvoiceHasBeenPrinted = false;
  invoiceCopyHasBeenPrinted = false;
  if (window.vieneDeListadoDeDocumentosDeEntrega) {
    window.vieneDeListadoDeDocumentosDeEntrega = false;
    window.esFacturaDeEntrega = false;
    window.demandaDeDespachoEnProcesoDeEntrega = new DemandaDeDespachoEncabezado();
    if (listaDeDetalleDeDemandaDeDespachoParaProcesoDeEntrega)
      listaDeDetalleDeDemandaDeDespachoParaProcesoDeEntrega.length = 0;
    if (listaDeDemandasDeDespachoEnProcesoDeEntrega)
      listaDeDemandasDeDespachoEnProcesoDeEntrega.length = 0;
    esEntregaConsolidada = false;
    esEntregaPorDocumento = false;
  }

  ClearUpInvoice();

  $("#lblNewInvoice").text(gInvoiceNUM);

  $.mobile.changePage("#confirmation_page", {
    transition: "slide",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });

  estaEnConfirmacionDeFacturacion = false;
}

function take_picture(pID) {
  var pSQL = "";
  try {
    navigator.camera.getPicture(
      function(imageURI) {
        $("#btnTakePic" + pID).attr(
          "srcpic",
          "data:image/jpeg;base64," + imageURI
        );

        $("#btnTakePic" + pID).buttonMarkup({ icon: "check" });

        switch (pID) {
          case "1":
            gImageURI_1 = "data:image/jpeg;base64," + imageURI;
            break;
          case "2":
            gImageURI_2 = "data:image/jpeg;base64," + imageURI;
            break;
          case "3":
            gImageURI_3 = "data:image/jpeg;base64," + imageURI;
            break;
        }
      },
      function(message) {},
      {
        quality: 90,
        targetWidth: 350,
        targetHeight: 350,
        saveToPhotoAlbum: false,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        destinationType: Camera.DestinationType.DATA_URL
      }
    );
  } catch (e) {
    notify("take_picture: " + e.message);
  }
}
function ToastThis(pMessage) {
  try {
    window.plugins.toast.show(
      pMessage,
      "short",
      "center",
      function(a) {},
      function(b) {}
    );
  } catch (e) {
    alert(e.message + " " + pMessage);
  }
}
function ShowHideOptions() {
  try {
    var pPOSStatus = CheckPOS();

    if (pPOSStatus === "CLOSED") {
      if (gPrintAddress !== 0) {
        $("#btnStartPOS").show();
      } else {
        $("#btnStartPOS").hide();
      }

      $("#btnFinishPOS").hide();
      $("#btnShowDeposit").hide();
      $("#btnViewInv").hide();
      $("#btnDepositsList").hide();
      $("#btnSkuReturn").hide();

      $("#btnCreateNewInvoice").buttonMarkup({ icon: "forbidden" });
      $("#btnCreateNewInvoice").attr("onclick", "");

      $("#btnCreateNewDeposit").buttonMarkup({ icon: "forbidden" });
      $("#btnCreateNewDeposit").attr("href", "#");

      $("#lblPOSStartedTime").text("Cerrado");
    } else {
      $("#btnStartPOS").hide();
      if (
        localStorage.getItem("ID_ROUTE_RETURN") === undefined ||
        localStorage.getItem("ID_ROUTE_RETURN") === null ||
        localStorage.getItem("ID_ROUTE_RETURN") === "0"
      ) {
        $("#btnFinishPOS").show();
      } else {
        $("#btnFinishPOS").hide();
      }

      $("#btnViewInv").show();
      $("#btnShowDeposit").show();
      $("#btnDepositsList").show();
      $("#btnSkuReturn").show();

      $("#btnCreateNewInvoice").buttonMarkup({ icon: "plus" });
      $("#btnCreateNewInvoice").attr("onclick", "start_invoicing();");

      $("#btnCreateNewDeposit").buttonMarkup({ icon: "plus" });
      $("#btnCreateNewDeposit").attr("href", "#deposit_page");

      $("#lblPOSStartedTime").text("Abierto");
    }
  } catch (e) {
    notify("ShowHideOptions: " + e.message);
  }
}

function ActualizarCantidadDeNotificaciones() {
  ObtenerListadoDeNotifiaciones(
    function(listaNotificaciones) {
      var notificacionesNuevas = 0;
      for (var i = 0; i < listaNotificaciones.length; i++) {
        var notificacion = listaNotificaciones[i];
        if (notificacion.IS_NEW === 1) {
          notificacionesNuevas++;
        }
      }
      $("#UiBtnNotifications").text(
        notificacionesNuevas === 0 ? "" : notificacionesNuevas
      );
    },
    function(error) {
      notify(error);
    }
  );
}

function notify(pMessage) {
  InteraccionConUsuarioServicio.desbloquearPantalla();
  navigator.notification.alert(
    pMessage,
    function() {
      navigator.notification.activityStop();
    },
    "Sonda® SD " + SondaVersion,
    "OK"
  );
}
function preparedb() {
  SONDA_DB_Session = window.openDatabase(
    "SONDA_POS_DB",
    "1.0",
    "SONDA_POS_DB",
    20000000
  ); //20mg

  SONDA_DB_Session.transaction(
    function(tx) {
      try {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SKU_SERIES(SKU, IMEI, SERIE, PHONE, ICC, STATUS, LOADED_LAST_UPDATED)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SKUS(SKU, SKU_NAME, SKU_PRICE, SKU_LINK, REQUERIES_SERIE, IS_KIT, ON_HAND, ROUTE_ID, IS_PARENT, PARENT_SKU, EXPOSURE, PRIORITY, QTY_RELATED, LOADED_LAST_UPDATED, TAX_CODE, CODE_PACK_UNIT_STOCK, SALES_PACK_UNIT)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS INVOICE_HEADER(INVOICE_NUM, TERMS, POSTED_DATETIME, CLIENT_ID, CLIENT_NAME, POS_TERMINAL, GPS, TOTAL_AMOUNT, ERP_INVOICE_ID, IS_POSTED, STATUS, IS_CREDIT_NOTE, VOID_REASON, VOID_NOTES, VOID_INVOICE_ID, PRINT_REQUEST, PRINTED_COUNT, AUTH_ID, SAT_SERIE, CHANGE, IMG1, IMG2, IMG3, CONSIGNMENT_ID, IS_PAID_CONSIGNMENT, INITIAL_TASK_IMAGE, IN_ROUTE_PLAN, ID_BO, IS_POSTED_VALIDATED, DETAIL_QTY,HANDLE_TAX, TAX_PERCENT, TELEPHONE_NUMBER, IS_FROM_DELIVERY_NOTE, DISCOUNT, COMMENT, DUE_DATE, CREDIT_AMOUNT, CASH_AMOUNT, PAID_TO_DATE, TASK_ID, GOAL_HEADER_ID, ELECTRONIC_SIGNATURE, DOCUMENT_SERIES, DOCUMENT_NUMBER, DOCUMENT_URL, SHIPMENT, VALIDATION_RESULT, SHIPMENT_DATETIME, SHIPMENT_RESPONSE, IS_CONTINGENCY_DOCUMENT, CONTINGENCY_DOC_SERIE, CONTINGENCY_DOC_NUM, FEL_DOCUMENT_TYPE, FEL_STABLISHMENT_CODE)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS INVOICE_DETAIL(INVOICE_NUM, SKU, SKU_NAME, QTY, PRICE, DISCOUNT, TOTAL_LINE, SERIE, SERIE_2, REQUERIES_SERIE, LINE_SEQ, IS_ACTIVE, COMBO_REFERENCE, PARENT_SEQ, EXPOSURE, PHONE, TAX_CODE, ON_HAND, IS_BONUS, PACK_UNIT, CODE_PACK_UNIT_STOCK, CONVERSION_FACTOR)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS DEPOSITS(TRANS_ID, TRANS_TYPE, TRANS_DATETIME, BANK_ID, ACCOUNT_NUM, AMOUNT, GPS_URL, IS_POSTED, IMG1, DOC_SERIE, DOC_NUM)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS BANK_ACCOUNTS(BANK, ACCOUNT_BASE, ACCOUNT_NAME, ACCOUNT_NUMBER)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS VOID_REASONS(REASON_ID, REASON_DESCRIPTION)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS POS_FACTS(CASH_AMOUNT, CREDIT_AMOUNT, SKUS_QTY, INVOICES_QTY)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS FAVS_FACTS(SKU, SKU_NAME, QTY)"
        );
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS TASK(TASK_ID,TASK_TYPE,TASK_DATE,SCHEDULE_FOR,CREATED_STAMP,ASSIGEND_TO,ASSIGNED_BY,ACCEPTED_STAMP,COMPLETED_STAMP,EXPECTED_GPS,POSTED_GPS,TASK_COMMENTS,TASK_SEQ,TASK_ADDRESS,RELATED_CLIENT_CODE,RELATED_CLIENT_NAME,TASK_STATUS, IS_POSTED, TASK_BO_ID, COMPLETED_SUCCESSFULLY, REASON, RGA_CODE, NIT, PHONE_CUSTOMER, CODE_PRICE_LIST, IN_PLAN_ROUTE, MUNICIPALITY, DEPARTMENT)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CONSIGNMENT_HEADER(CONSIGNMENT_ID, CUSTOMER_ID, DATE_CREATE, DATE_UPDATE, STATUS, POSTED_BY, IS_POSTED, POS_TERMINAL, GPS_URL, DOC_DATE, CLOSED_ROUTE_DATETIME, IS_ACTIVE_ROUTE, DUE_DATE, CONSIGNMENT_BO_NUM, TOTAL_AMOUNT, DOC_SERIE, DOC_NUM, IMG, IS_CLOSED, IS_RECONSIGN, REASON, IN_ROUTE, CONSIGNMENT_TYPE, INVOICE_SERIE, INVOICE_NUM)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CONSIGNMENT_DETAIL(CONSIGNMENT_ID, SKU, LINE_NUM, QTY, PRICE, DISCOUNT, TOTAL_LINE, POSTED_DATETIME, PAYMENT_ID, HANDLE_SERIAL,SERIAL_NUMBER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS DOCUMENT_SEQUENCE(DOC_TYPE, DOC_FROM, DOC_TO, SERIE, CURRENT_DOC, BRANCH_NAME, BRANCH_ADDRESS)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS RULE(EVENT_ID,NAME_EVENT,TYPE,FILTERS,ACTION,NAME_ACTION,TYPE_ACTION,ENABLED,CODE,EVENT_ORDER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SKU_COLLECTED_HEADER(SKU_COLLECTED_ID, CUSTOMER_ID, DOC_SERIE, DOC_NUM, CODE_ROUTE, GPS_URL, POSTED_DATETIME, POSTED_BY, LAST_UPDATE, LAST_UPDATE_BY, TOTAL_AMOUNT, IS_POSTED, IMG_1, IMG_2, IMG_3, SKU_COLLECTED_BO_ID)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SKU_COLLECTED_DETAIL(SKU_COLLECTED_ID, CODE_SKU, QTY_SKU, IS_GOOD_STATE, LAST_UPDATE, LAST_UPDATE_BY, SOURCE_DOC_TYPE, SOURCE_DOC_NUM, TOTAL_AMOUNT, SKU_PRICE, HANDLE_SERIAL, SERIAL_NUMBER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PARAMETERS(IDENTITY,GROUP_ID,PARAMETER_ID,VALUE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CONSIGNMENT_HEADER_TEMP(CONSIGNMENT_ID, CUSTOMER_ID, DATE_CREATE, DATE_UPDATE, STATUS, POSTED_BY, IS_POSTED, POS_TERMINAL, GPS_URL, DOC_DATE, CLOSED_ROUTE_DATETIME, IS_ACTIVE_ROUTE, DUE_DATE, CONSIGNMENT_BO_NUM, TOTAL_AMOUNT)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CONSIGNMENT_DETAIL_TEMP(CONSIGNMENT_ID, SKU, LINE_NUM, QTY, PRICE, DISCOUNT, TOTAL_LINE, POSTED_DATETIME, PAYMENT_ID, QTY_PAID, QTY_RECONSIGNED, QTY_RECOLLECTED, LAST_PAYMENT_OPTION, PRICE_SKU_FOR_RECONSIGN, DUE_DATE_CONSIGNMENT,HANDLE_SERIAL,SERIAL_NUMBER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS REASONS(REASON_TYPE, REASON_PRIORITY, REASON_VALUE, REASON_PROMPT)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS HISTORICAL_TRACEABILITY_CONSIGNMENT(CONSIGNMENT_ID, DOC_SERIE_SOURCE, DOC_NUM_SOURCE, SKU, QTY, ACTION, DOC_SERIE_TARGET, DOC_NUM_TARGET, DATE_TRANSACTION, IS_POSTED, HANDLE_SERIAL, SERIAL_NUMBER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SKU_HISTORY(SKU, SKU_NAME, SKU_PRICE, SKU_LINK, REQUERIES_SERIE, IS_KIT, ON_HAND, ROUTE_ID, IS_PARENT, PARENT_SKU, EXPOSURE, PRIORITY, QTY_RELATED, LOADED_LAST_UPDATED, QTY_SOLD, QTY_CONSIGNED, QTY_COLLECTED, QTY_TRANSFERED)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS BUSINESS_RIVAL_POLL(INVOICE_RESOLUTION,INVOICE_SERIE,INVOICE_NUM,CODE_CUSTOMER,BUSSINESS_RIVAL_NAME,BUSSINESS_RIVAL_TOTAL_AMOUNT,CUSTOMER_TOTAL_AMOUNT,COMMENT,CODE_ROUTE,POSTED_DATETIME,IS_POSTED)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CLASSIFICATION(GROUP_CLASSIFICATION,NAME_CLASSIFICATION,PRIORITY_CLASSIFICATION,VALUE_TEXT_CLASSIFICATION)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS NOTIFICATION(TYPE,ID,EXTRA_INFO,DATE,IS_NEW)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS TRANSFER_HEADER(TRANSFER_ID,CODE_WAREHOUSE_SOURCE,STATUS,DATE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS TRANSFER_DETAIL(TRANSFER_ID,SKU_CODE,DESCRIPTION_SKU,SERIE,QTY,STATUS, SALES_PACK_UNIT, CODE_PACK_UNIT_STOCK, VAT_CODE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CLIENT(CLIENT_ID,CLIENT_NAME,CLIENT_TAX_ID,ADDRESS,PHONE,CLIENT_HH_ID_OLD,CONTACT_CUSTOMER, CONTACT_CUSTOMER_PHONE, PHOTO,PHOTO_2,PHOTO_3,STATUS,NEW,GPS,CREATED_FROM, INVOICE_NAME, INVOICE_ADDRESS,SYNC_ID, IS_POSTED, DOC_SERIE, DOC_NUM, POSTED_DATETIME, TAGS_QTY,IS_POSTED_VALIDATED)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS TAG(TAG_COLOR,TAG_VALUE_TEXT,TAG_PRIORITY,TAG_COMMENTS)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS TAG_X_CUSTOMER(TAG_COLOR,CLIENT_ID, DOC_SERIE_CLIENT, DOC_NUM_CLIENT)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SWIFT_SEQUENCES(SEQUENCE_NAME,CURRENT_NUMBER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SWIFT_TAX(TAX_CODE, TAX_NAME, TAX_VALUE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS MANIFEST_HEADER(MANIFEST_HEADER_ID,DRIVER,VEHICLE,DISTRIBUTION_CENTER,CREATED_DATE,STATUS,LAST_UPDATE,LAST_UPDATE_BY,MANIFEST_TYPE,TRANSFER_REQUEST_ID, IS_POSTED)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS MANIFEST_DETAIL(MANIFEST_DETAIL_ID,MANIFEST_HEADER_ID,CODE_ROUTE,CLIENT_CODE,WAVE_PICKING_ID,MATERIAL_ID,QTY,STATUS,LAST_UPDATE,LAST_UPDATE_BY,ADDRESS_CUSTOMER,CLIENT_NAME,LINE_NUM,PICKING_DEMAND_HEADER_ID,STATE_CODE,CERTIFICATION_TYPE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SONDA_DELIVERY_NOTE_BY_INVOICE(DELIVERY_NOTE_DOC_NUM,DELIVERY_NOTE_SERIE,INVOICE_ID,LAST_UPDATE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SONDA_DELIVERY_NOTE_DETAIL(DELIVERY_NOTE_DETAIL_ID, DELIVERY_NOTE_ID, CODE_SKU, QTY, PRICE, TOTAL_LINE, IS_BONUS, APPLIED_DISCOUNT, CREATED_DATETIME, POSTED_DATETIME, PICKING_DEMAND_HEADER_ID)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SONDA_DELIVERY_NOTE_HEADER(DELIVERY_NOTE_ID, DOC_SERIE, DOC_NUM, CODE_CUSTOMER, DELIVERY_NOTE_ID_HH, TOTAL_AMOUNT, IS_POSTED, CREATED_DATETIME, POSTED_DATETIME, TASK_ID, INVOICE_ID, CONSIGNMENT_ID, DEVOLUTION_ID, DELIVERY_IMAGE, BILLED_FROM_SONDA,IS_CANCELED, REASON_CANCEL, DISCOUNT, DELIVERY_IMAGE_2, DELIVERY_IMAGE_3, DELIVERY_IMAGE_4, DELIVERY_SIGNATURE)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS NEXT_PICKING_DEMAND_HEADER(PICKING_DEMAND_HEADER_ID,DOC_NUM,CLIENT_CODE,CODE_ROUTE,CODE_SELLER,TOTAL_AMOUNT,SERIAL_NUMBER,DOC_NUM_SEQUENCE,EXTERNAL_SOURCE_ID,IS_FROM_ERP,IS_FROM_SONDA,LAST_UPDATE,LAST_UPDATE_BY,IS_COMPLETED,WAVE_PICKING_ID,CODE_WAREHOUSE,IS_AUTHORIZED,ATTEMPTED_WITH_ERROR,IS_POSTED_ERP,POSTED_ERP,POSTED_RESPONSE,ERP_REFERENCE,CLIENT_NAME,CREATED_DATE,ERP_REFERENCE_DOC_NUM,DOC_ENTRY,IS_CONSOLIDATED,PRIORITY,HAS_MASTERPACK,POSTED_STATUS,OWNER,CLIENT_OWNER,MASTER_ID_SELLER,SELLER_OWNER,SOURCE_TYPE,INNER_SALE_STATUS,INNER_SALE_RESPONSE,DEMAND_TYPE,TRANSFER_REQUEST_ID,ADDRESS_CUSTOMER,STATE_CODE, MANIFEST_HEADER_ID, PROCESS_STATUS, DISCOUNT )"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS NEXT_PICKING_DEMAND_DETAIL(PICKING_DEMAND_DETAIL_ID,PICKING_DEMAND_HEADER_ID,MATERIAL_ID, MATERIAL_DESCRIPTION, REQUERIES_SEERIE, QTY,LINE_NUM,ERP_OBJECT_TYPE,PRICE,WAS_IMPLODED,QTY_IMPLODED,MASTER_ID_MATERIAL,MATERIAL_OWNER,ATTEMPTED_WITH_ERROR,IS_POSTED_ERP,POSTED_ERP,ERP_REFERENCE,POSTED_STATUS,POSTED_RESPONSE,INNER_SALE_STATUS,INNER_SALE_RESPONSE,TONE,CALIBER, IS_BONUS, DISCOUNT, CODE_PACK_UNIT_STOCK, SALES_PACK_UNIT, CONVERSION_FACTOR)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS NEXT_PICKING_DEMAND_DETAIL_BY_SERIAL_NUMBER(MANIFEST_HEADER_ID, MATERIAL_ID, SERIAL_NUMBER)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS DELIVERY_CANCELED(DELIVERY_CANCELED_ID, PICKING_DEMAND_HEADER_ID, DOC_NUM_DELIVERY, DOC_ENTRY, DOC_NUM, DOC_SERIE, IS_POSTED, POSTED_DATETIME, REASON_CANCEL)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS BASKET_BY_MANIFEST(MANIFEST_HEADER_ID, PICKING_DEMAND_HEADER_ID, BARCODE, DOC_NUM, ERP_REFERENCE_DOC_NUM)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PICKING_DEMAND_BY_TASK(PICKING_DEMAND_HEADER_ID, TASK_ID, IS_POSTED, PICKING_DEMAND_STATUS)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_BY_CUSTOMER(ID,INVOICE_ID,DOC_ENTRY,CODE_CUSTOMER,CREATED_DATE,DUE_DATE,TOTAL_AMOUNT,PENDING_TO_PAID, IS_EXPIRED )"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS CUSTOMER_ACCOUNTING_INFORMATION(ID,CODE_CUSTOMER,GROUP_NUM,CREDIT_LIMIT,OUTSTANDING_BALANCE,EXTRA_DAYS)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_PAYMENT_HEADER(ID,CODE_CUSTOMER,DOC_SERIE,DOC_NUM,CREATED_DATE,POSTED_DATE,CODE_ROUTE,LOGIN_ID,PAYMENT_AMOUNT,IS_POSTED, COMMENT, PAYMENT_APPLIED_TO)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_PAYMENT_DETAIL(ID,PAYMENT_HEADER_ID,INVOICE_ID,DOC_ENTRY,DOC_SERIE,DOC_NUM,PAYED_AMOUNT)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PRICE_LIST_BY_SKU_PACK_SCALE([CODE_PRICE_LIST],[CODE_SKU],[CODE_PACK_UNIT],[PRIORITY],[LOW_LIMIT],[HIGH_LIMIT],[PRICE])"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PACK_UNIT_BY_SKU(PACK_UNIT, CODE_PACK_UNIT, DESCRIPTION_CODE_PACK_UNIT, UM_ENTRY)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PACK_CONVERSION(PACK_CONVERSION,CODE_SKU,CODE_PACK_UNIT_FROM,CODE_PACK_UNIT_TO, CONVERSION_FACTOR, [ORDER])"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PRESALE_STATISTICS(GOAL_HEADER_ID, TEAM_NAME, GOAL_NAME, RANKING, GOAL_AMOUNT, ACCUMULATED_AMOUNT, GOAL_PERCENTAGE_COVERED, REMAINING_DAYS, GOAL_AMOUNT_OF_DAY)"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_PAYMENT_TYPE_DETAIL([PAYMENT_TYPE_ID],[PAYMENT_HEADER_ID],[PAYMENT_TYPE],[FRONT_IMAGE],[BACK_IMAGE],[DOCUMENT_NUMBER],[BANK_ACCOUNT],[BANK_NAME],[AMOUNT],[DOC_SERIE],[DOC_NUM])"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS STATISTIC_SALES_BY_CUSTOMER([ID],[CLIENT_ID],[CODE_SKU],[SKU_NAME],[QTY],[SALE_PACK_UNIT])"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS SEQUENCE_CONTROL([SEQUENCE_TYPE], [LAST_USED], [CREATED_DATE], [LAST_UPDATE])"
        );

        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS PHRASE_AND_SCENARIO([ID], [FEL_DOCUMENT_TYPE], [PHRASE_CODE], [SCENARIO_CODE], [DESCRIPTION], [TEXT_TO_SHOW])"
        );
      } catch (e) {
        notify("preparedb: " + e.message);
      }
    },
    function(
      tx,
      error //Fail
    ) {},
    function() //Success
    {
      my_dialog("", "", "close");
    }
  );
}

function GetAlertLimit(data) {
  SocketControlador.socketIo.emit("getalertlimit", data);
}

function OnConfirmFinishPOS(buttonIndex) {
  try {
    if (buttonIndex === 2) {
      my_dialog("Procesando", "Finalizando Ruta", "open");

      if (gIsOnline == EstaEnLinea.Si) {
        //check if some invoice is offline
        CheckforOffline();

        SONDA_DB_Session.transaction(
          function(tx) {
            var pDoc = "";
            var pImg = "";

            tx.executeSql(
              "SELECT * FROM INVOICE_HEADER",
              [],
              function(tx, results) {
                SocketControlador.socketIo.emit("debug_on_server", {
                  data: results.rows,
                  msg: "fin de ruta:" + gLastLogin + " " + gInvoiceNUM,
                  dir_data: true,
                  save_to_file: true,
                  file_name: "froute_" + gLastLogin
                });
              },
              function(err) {
                my_dialog("", "", "close");
                if (err.code !== 0) {
                  notify("Error processing SQL: " + err.code);
                }
              }
            );
          },
          function(err) {
            if (err.code !== 0) {
              alert("Error processing SQL: " + err.code);
            }
          }
        );

        var data = {
          routeid: gCurrentRoute,
          loginid: gLastLogin,
          lastinvoice:
            parseInt(localStorage.getItem("POS_CURRENT_INVOICE_ID")) + 1,
          dbuser: gdbuser,
          dbuserpass: gdbuserpass
        };
        SocketControlador.socketIo.emit("finish_route", data);
      } else {
        InteraccionConUsuarioServicio.bloquearPantalla();
        notify(
          "ERROR, Debe estar conectado al server para poder finalizar la ruta."
        );
        my_dialog("", "", "close");
      }
      my_dialog("", "", "close");
    }
  } catch (e) {
    InteraccionConUsuarioServicio.desbloquearPantalla();
    notify("OnConfirmFinishPOS:" + e.message);
  }
}
function startpos_action() {
  try {
    navigator.notification.confirm(
      "¿Confirma Iniciar Ruta?", // message
      function(buttonIndex) {
        if (buttonIndex === 2) {
          var data = {
            routeid: gCurrentRoute,
            default_warehouse: gDefaultWhs,
            dbuser: gdbuser,
            dbuserpass: gdbuserpass
          };
          my_dialog("Espere...", "Procesando caja", "open");
          InteraccionConUsuarioServicio.bloquearPantalla();

          /* save sat auth. info to global variable */
          pCurrentSAT_Resolution = $("#lblCurrent_AuthID").text();
          pCurrentSAT_Res_Serie = $("#lblCurrent_Serie").text();

          /* show result on the page (invoices) */
          pCurrentSAT_Res_Date = $("#lblCurrent_DateAuth").text();
          pCurrentSAT_Res_DocStart = $("#lblCurrent_From").text();
          pCurrentSAT_Res_DocFinish = $("#lblCurrent_To").text();
          pCurrentInvoiceID = $("#lblCurrent_CurrentInvoice").text();

          gBranchAddress = $("#lblBranchAddress").text();
          gBranchName = $("#lblBranchName").text();
          gCompanyName = $("#lblCompanyName").text();

          /* show result on the page (notes) */
          pCurrentSAT_Resolution_notes = $("#lblCurrent_AuthID_notes").text();
          pCurrentSAT_Res_Serie_notes = $("#lblCurrent_Serie_notes").text();

          pCurrentSAT_Res_Date_notes = $("#lblCurrent_DateAuth_notes").text();
          pCurrentSAT_Res_DocStart_notes = $("#lblCurrent_From_notes").text();
          pCurrentSAT_Res_DocFinish_notes = $("#lblCurrent_To_notes").text();
          pCurrentNoteID = $("#lblCurrent_From_notes").text();

          /* show result on the page (invoices)*/
          $("#lblSumm_Autho").text(pCurrentSAT_Resolution);
          $("#lblSumm_Serie").text(pCurrentSAT_Res_Serie);
          $("#lblSumm_AuthDate").text(pCurrentSAT_Res_Date);
          $("#lblSumm_DocFrom").text(pCurrentSAT_Res_DocStart);
          $("#lblSumm_DocTo").text(pCurrentSAT_Res_DocFinish);
          $("#lblSumm_CurrentDoc").text(
            pCurrentInvoiceID == 0 ? 0 : pCurrentInvoiceID - 1
          );

          /* show result on the page (notes) */
          $("#lblSumm_Autho_notes").text(pCurrentSAT_Resolution_notes);
          $("#lblSumm_Serie_notes").text(pCurrentSAT_Res_Serie_notes);
          $("#lblSumm_AuthDate_notes").text(pCurrentSAT_Res_Date_notes);
          $("#lblSumm_DocFrom_notes").text(pCurrentSAT_Res_DocStart_notes);
          $("#lblSumm_DocTo_notes").text(pCurrentSAT_Res_DocFinish_notes);
          $("#lblSumm_CurrentDoc_notes").text(pCurrentNoteID);

          /* save results on device (invoices)*/
          localStorage.setItem("POS_SAT_RESOLUTION", pCurrentSAT_Resolution);
          localStorage.setItem("POS_SAT_RES_SERIE", pCurrentSAT_Res_Serie);
          localStorage.setItem(
            "POS_SAT_RES_DOC_START",
            pCurrentSAT_Res_DocStart
          );
          localStorage.setItem(
            "POS_SAT_RES_DOC_FINISH",
            pCurrentSAT_Res_DocFinish
          );
          localStorage.setItem("POS_SAT_RES_DATE", pCurrentSAT_Res_Date);
          localStorage.setItem(
            "POS_CURRENT_INVOICE_ID",
            pCurrentInvoiceID == 0 ? 0 : pCurrentInvoiceID - 1
          );

          /* save results on device (notes)*/
          localStorage.setItem(
            "POS_SAT_RESOLUTION_NOTES",
            pCurrentSAT_Resolution_notes
          );
          localStorage.setItem(
            "POS_SAT_RES_SERIE_NOTES",
            pCurrentSAT_Res_Serie_notes
          );
          localStorage.setItem(
            "POS_SAT_RES_DOC_START_NOTES",
            pCurrentSAT_Res_DocStart_notes
          );
          localStorage.setItem(
            "POS_SAT_RES_DOC_FINISH_NOTES",
            pCurrentSAT_Res_DocFinish_notes
          );
          localStorage.setItem(
            "POS_SAT_RES_DATE_NOTES",
            pCurrentSAT_Res_Date_notes
          );
          localStorage.setItem(
            "POS_CURRENT_CREDIT_NOTE",
            pCurrentSAT_Res_DocStart_notes
          );

          localStorage.setItem("POS_SAT_BRANCH_NAME", gBranchName);
          localStorage.setItem("POS_SAT_BRANCH_ADDRESS", gBranchAddress);
          localStorage.setItem("POS_COMPANY_NAME", gCompanyName);

          localStorage.setItem("ROUTE_RETURN_WAREHOUSE", gRouteReturnWarehouse);

          SocketControlador.socketIo.emit("get_sales_inventory", data);
        }
      }, // callback to invoke with index of button pressed
      "Sonda® SD " + SondaVersion, // title
      "No,Si" // buttonLabels
    );
  } catch (e) {
    notify("startpos_action: " + e.message);
  }
}

function checkperc(pFinalNum, pCurrentNum, pPercToEval) {
  try {
  } catch (e) {
    notify("ERROR, checkperc: " + e.message);
  }
}

function cust_list() {
  $.mobile.changePage("#dialog_cust_list", "pop", true, true);
}

function trunc_number(pnumber, decimals) {
  var result = parseFloat(format_number(pnumber, decimals));
  return result;
}

function format_number(cantidad, decimals) {
  if (isNaN(cantidad)) {
    return 0;
  }

  if (cantidad === "") {
    return 0;
  }

  var result = parseFloat(cantidad > 0 ? (cantidad * 100) / 100 : 0).toFixed(
    decimals
  );
  return result;
}

function ClearUpInvoice() {
  //clear up client
  $("#txtNIT").val("");
  $("#txtNombre").val("");
  //clear up amounts
  $("#txtCash_summ").val("");
  $("#UiLblCurrencyVueltoSumm").text(currencySymbol + ". ");
  $("#txtVuelto_summ").text("0.00");
  //clear up images
  gImageURI_1 = "";
  gImageURI_2 = "";
  gImageURI_3 = "";
  $("#btnTakePic1").buttonMarkup({ icon: "user" });
  $("#btnTakePic2").buttonMarkup({ icon: "user" });
  $("#btnTakePic3").buttonMarkup({ icon: "comment" });

  gPagado = 0;
  //gTaskId = null;
  //gTaskType = "";
  //reload sku list
  PopulateInvoiceSKUsList();
}

function SetSpecifiSKUQty(qty, unitMeasure) {
  var codeSku = $("#lblSKU_IDCant").attr("SKU");

  AddSKU(codeSku, qty, false, unitMeasure);
  codeSku = null;
}
function SelectClient(xid, xcust_name, xnit) {
  $("#txtNIT").val(xnit);
  $("#txtNombre").val(xcust_name);
  $("#client_list_panel").panel("toggle");
}
function getDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if (month.toString().length === 1) {
    month = "0" + month;
  }
  if (day.toString().length === 1) {
    day = "0" + day;
  }
  if (hour.toString().length === 1) {
    hour = "0" + hour;
  }
  if (minute.toString().length === 1) {
    minute = "0" + minute;
  }
  if (second.toString().length === 1) {
    second = "0" + second;
  }
  var dateTime =
    year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  return dateTime;
}

function RefreshSkusList() {
  gTotalInvoiced = 0;
  gTotalInvoicesProc = 0;
  gTotalDeposited = 0;

  localStorage.setItem("POS_TOTAL_INVOICED", 0);
  localStorage.setItem("POS_TOTAL_INVOICES_PROC", 0);
  localStorage.setItem("POS_TOTAL_DEPOSITED", 0);
  localStorage.setItem("POS_TOTAL_DEPOSITS_PROC", Number(0));

  $("#lblTotalDeposited").text(currencySymbol + " " + "0.00");
  $("#lblTotalDeposits").text("0");

  $("#lblTotalInvoices").text("0");
  $("#lblSold").text(currencySymbol + " 0.00");

  $.mobile.changePage("#menu_page", {
    transition: "none",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}

function OnDemandRefreshSkusList() {
  //confirm
  navigator.notification.confirm(
    "Confirma Actualizacion de Inventario?", // message
    function(buttonIndex) {
      if (buttonIndex === 2) {
        my_dialog("Espere", "Actualizando inventario", "open");
        LoadRemoteSKUs();
        my_dialog("", "", "close");
        hiddeskupanel();

        $.mobile.changePage("#menu_page", {
          transition: "none",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      }
    }, // callback to invoke with index of button pressed
    "Sonda® SD " + SondaVersion, // title
    "No,Si" // buttonLabels
  );
}

function LoadRemoteSeries() {
  if (gDefaultWhs === "") {
    notify(
      "ERROR, No hay ruta actual definida, contacte a su administrador de Sonda."
    );
    return -1;
  }
  var data = {
    default_warehouse: gDefaultWhs,
    dbuser: gdbuser,
    dbuserpass: gdbuserpass
  };

  SocketControlador.socketIo.emit("getskuseries", data);

  my_dialog("", "", "close");
}
function hiddeskupanel() {
  var myPanel = $.mobile.activePage.children('[data-role="panel"]');
  myPanel.panel("close");
}

function PopulateSKUGrid() {
  var clientId = gClientCode;
  var skuList = $("#skus_listview_panel");

  skuList.children().remove("li");

  ObtenerListaDePreciosDeCliente(
    clientId,
    function(priceListId) {
      ObtenerSkusPorListaDePrecios(
        priceListId,
        function(productos, configuracionDecimales) {
          var vLi = "";
          var uClick;
          if (productos.length > 0) {
            for (var i = 0; i < productos.length; i++) {
              var producto = productos[i];
              var unidadDeMedidaAVender = obtenerUnidadDeMedidaDeProductoAVender(
                producto
              );
              var cantidadDeProductoEnPrimerIngreso =
                parseFloat(
                  format_number(
                    producto.ON_HAND,
                    configuracionDecimales.defaultDisplayDecimalsForSkuQty
                  )
                ) > 1
                  ? 1
                  : parseFloat(
                      format_number(
                        producto.ON_HAND,
                        configuracionDecimales.defaultDisplayDecimalsForSkuQty
                      )
                    );
              if (
                unidadDeMedidaAVender &&
                cantidadDisponibleDeProductoEsSuficienteParaVender(
                  producto,
                  unidadDeMedidaAVender
                )
              )
                try {
                  if (
                    producto.REQUERIES_SERIE === 1 ||
                    producto.REQUERIES_SERIE === "1"
                  ) {
                    uClick =
                      "AddSeriesForSku('" +
                      producto.SKU +
                      "','" +
                      producto.SKU_NAME +
                      "'," +
                      unidadDeMedidaAVender.PRICE +
                      ")";
                  } else {
                    uClick =
                      "InsertInvoiceDetail('" +
                      producto.SKU +
                      "'," +
                      unidadDeMedidaAVender.PRICE +
                      "," +
                      cantidadDeProductoEnPrimerIngreso +
                      ",ReturnSkus, '" +
                      unidadDeMedidaAVender.CODE_PACK_UNIT +
                      "', '" +
                      producto.CODE_PACK_UNIT_STOCK +
                      "', " +
                      unidadDeMedidaAVender.CONVERSION_FACTOR +
                      ")";
                  }
                  vLi +=
                    "<li data-icon='false' class='ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
                  vLi += '<a href="#" onclick="' + uClick + '">';
                  vLi += "<p>";
                  vLi +=
                    "<span style='background-color: #005599; color: #ffffff; padding: 3px; box-shadow: 1px 10px 10px 1px silver; text-shadow: none'>" +
                    format_number(
                      producto.ON_HAND,
                      configuracionDecimales.defaultDisplayDecimalsForSkuQty
                    ) +
                    "</span><br>";
                  vLi +=
                    "<br><span class='small-roboto' style='white-space : normal;'>" +
                    producto.SKU +
                    " " +
                    producto.SKU_NAME +
                    "</span><br>";
                  vLi +=
                    "<span class='ui-li-count'>" +
                    currencySymbol +
                    " " +
                    format_number(
                      unidadDeMedidaAVender.PRICE,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "</span><br>";
                  vLi +=
                    "<span>UM:" +
                    unidadDeMedidaAVender.CODE_PACK_UNIT +
                    "</span>";
                  vLi += "</p></li>";
                } catch (e) {
                  notify(
                    "Error al generar el listado de SKU's para la venta: " +
                      e.message
                  );
                }
            }
            skuList.append(vLi);
            skuList.listview("refresh");
            skuList = null;
          } else {
            skuList = null;
          }
        },
        function(err) {
          notify(err.message);
        }
      );
    },
    function(err) {
      notify(err.message);
    }
  );
}

function obtenerUnidadDeMedidaDeProductoAVender(producto) {
  if (producto.MEASURE_UNITS.length > 0) {
    var unidadDeMedidaDeVenta = producto.MEASURE_UNITS.find(function(
      measureUnit
    ) {
      return (
        measureUnit.CODE_PACK_UNIT.toUpperCase() ===
          producto.SALES_PACK_UNIT.toUpperCase() &&
        measureUnit.CONVERSION_FACTOR <= producto.ON_HAND
      );
    });

    if (unidadDeMedidaDeVenta) {
      return unidadDeMedidaDeVenta;
    }

    var unidadesDeMedidaOrdeneasEnBaseAOrdenDeAplicacion = producto.MEASURE_UNITS.sort(
      function(actual, siguiente) {
        return actual.ORDER.toString().localeCompare(
          siguiente.ORDER.toString()
        );
      }
    );

    return unidadesDeMedidaOrdeneasEnBaseAOrdenDeAplicacion[0];
  } else {
    return null;
  }
}

function cantidadDisponibleDeProductoEsSuficienteParaVender(
  producto,
  unidadDeMedidaAVender
) {
  var cantidadSuficiente = false;

  if (
    producto.SALES_PACK_UNIT.toUpperCase() !==
    producto.CODE_PACK_UNIT_STOCK.toUpperCase()
  ) {
    cantidadSuficiente =
      producto.ON_HAND >= unidadDeMedidaAVender.CONVERSION_FACTOR;
  } else {
    cantidadSuficiente = true;
  }

  return cantidadSuficiente;
}

function PopulateInvGrid() {
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        var pDoc = "";
        var pImg = "";

        var vLI = "";

        tx.executeSql(
          "SELECT * FROM SKUS",
          [],
          function(tx, results) {
            $("#inv_listview")
              .children()
              .remove("li");

            if (results.rows.length > 0) {
              for (var i = 0; i <= results.rows.length - 1; i++) {
                vLI +=
                  '<li class="ui-alt-icon ui-nodisc-icon ui-btn ui-shadow ui-btn-icon-tag">';
                vLI +=
                  '<p><span class="medium small-roboto">' +
                  results.rows.item(i).SKU_NAME +
                  "</span></p>";

                if (
                  parseFloat(format_number(results.rows.item(i).ON_HAND, 2)) >=
                  1
                ) {
                  vLI =
                    vLI +
                    '<span class="ui-li-count" style="color:white">' +
                    format_number(results.rows.item(i).ON_HAND, 2) +
                    "</span>";
                } else {
                  vLI =
                    vLI +
                    '<span class="ui-li-count" style="color:red">' +
                    format_number(results.rows.item(i).ON_HAND, 2) +
                    "</span>";
                }

                vLI = vLI + "</li>";
              }

              $("#inv_listview").append(vLI);
              $("#inv_listview").listview("refresh");
            } else {
              my_dialog("", "", "close");
            }
            my_dialog("", "", "close");
          },
          function(err) {
            my_dialog("", "", "close");
            if (err.code !== 0) {
              alert("Error processing SQL: " + err.code);
            }
          }
        );
      },
      function(err) {
        if (err.code !== 0) {
          alert("Error processing SQL: " + err.code);
        }
      }
    );
  } catch (e) {
    my_dialog("", "", "close");
  }
}
function ReturnSkus() {
  $.mobile.changePage("#pos_skus_page", {
    transition: "none",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}
function UpdateSKUSeries(pSKU, pLINE_SEQ, pSN, pIMEN, pPHONE) {
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        var pSQL1 =
          'UPDATE INVOICE_DETAIL SET SERIE = "' +
          pSN +
          '", SERIE_2 = "' +
          pIMEN +
          '", PHONE = "' +
          pPHONE +
          '" WHERE INVOICE_NUM = -9999 AND LINE_SEQ = ' +
          pLINE_SEQ;
        tx.executeSql(pSQL1);

        pSQL1 =
          'UPDATE SKU_SERIES SET STATUS = 3 WHERE SKU = "' +
          pSKU +
          '" AND SERIE = "' +
          pSN +
          '"';
        tx.executeSql(pSQL1);

        $.mobile.changePage("#pos_skus_page", {
          transition: "flow",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      },
      function(err) {
        if (err.code !== 0) {
          alert("Error processing SQL: " + err);
        }
      }
    );
  } catch (e) {
    notify("jv.catch.10.5.6: " + e.message);
  }
}

function closeprinter() {
  bluetoothSerial.disconnect(
    function() {
      alert("Printer is disconnected");
    },
    function() {
      alert("Printer is unable to get disconnected");
    }
  );
}

function CenterText(text) {
  if (text.length > 45) {
    var line1 = text.substring(0, 45);
    var line2 = text.substring(46, text.length - 1);
    return line1 + "\r\n" + line2;
  } else {
    return text;
  }
}

function printinvoice_joininfo(invoiceId, pIsRePrinted, callBack, escopia) {
  var headerFormat = "";
  var detailFormat = "";
  var footerFormat = "";

  var facturaManejaImpuesto = false;
  var impuestoDeFactura = 0;
  var rowPosition;
  var pos = 0;

  var etiquetaDeImpuesto = localStorage.getItem("TAX_ID");
  var etiquetaDeResolucion = localStorage.getItem("TAX_RESOLUTION_ID");
  var etiquetaPorcentajeDeImpuesto = localStorage.getItem("TAX_PERCENT");

  try {
    var muestraPorcentaje = {};
    var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();

    var procesarImpresionDeFactura = function procesarImpresionDeFactura(
      rutaUsaFel,
      frasesYEscenarios
    ) {
      ParametroServicio.ObtenerParametro(
        "INVOICE",
        "SHOW_PERCENTAGE_INVOICE",
        function(parametro) {
          muestraPorcentaje = parametro;

          configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
            function(configuracionDecimales) {
              var pSQL =
                "SELECT IFNULL(A.DISCOUNT,0) AS DISCOUNT_HEADER, A.*, B.*, ";
              pSQL +=
                "IFNULL((SELECT TASK_ADDRESS FROM TASK T WHERE T.TASK_ID = A.TASK_ID), '__________') ";
              pSQL +=
                "AS TASK_ADDRESS FROM INVOICE_HEADER A, INVOICE_DETAIL B ";
              pSQL += "WHERE A.INVOICE_NUM = " + invoiceId;
              pSQL +=
                " AND B.INVOICE_NUM = A.INVOICE_NUM AND A.IS_CREDIT_NOTE = 0";

              SONDA_DB_Session.transaction(function(tx) {
                tx.executeSql(
                  pSQL,
                  [],
                  function(tx, results) {
                    resultados = results;
                    var expiresAuth = localStorage.getItem("SAT_RES_EXPIRE");
                    var resolution = localStorage.getItem("POS_SAT_RESOLUTION");
                    var discount = results.rows.item(0).DISCOUNT_HEADER;
                    var discountAmount =
                      discount > 0
                        ? (discount / 100) * results.rows.item(0).TOTAL_AMOUNT
                        : 0;
                    var creditAmount = results.rows.item(0).CREDIT_AMOUNT;
                    facturaManejaImpuesto =
                      results.rows.item(0).HANDLE_TAX === 1 ||
                      results.rows.item(0).HANDLE_TAX === "1";

                    headerFormat = "! 0 50 50 _DOC_LEN_ 1\r\n";
                    headerFormat +=
                      "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";

                    pos = 10;
                    headerFormat +=
                      "CENTER 550 T 0 2 0 " +
                      pos +
                      " " +
                      CenterText(gCompanyName) +
                      "\r\n";

                    pos += 30;
                    headerFormat +=
                      "CENTER 550 T 0 2 0 " +
                      pos +
                      " " +
                      CenterText(gBranchName) +
                      "\r\n";

                    if (gBranchAddress.length > 30) {
                      pos += 30;
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        pos +
                        " " +
                        gBranchAddress.substring(0, 30) +
                        "\r\n";

                      pos += 30;
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        pos +
                        " " +
                        gBranchAddress.substring(
                          31,
                          gBranchAddress.length - 1
                        ) +
                        "\r\n";
                    } else {
                      if (
                        localStorage.getItem("direccionFacturacion01").length >
                        0
                      ) {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " " +
                          localStorage.getItem("direccionFacturacion01") +
                          "\r\n";
                      }

                      if (
                        localStorage.getItem("direccionFacturacion02").length >
                        0
                      ) {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " " +
                          localStorage.getItem("direccionFacturacion02") +
                          "\r\n";
                      }

                      if (
                        localStorage.getItem("direccionFacturacion03").length >
                        0
                      ) {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " " +
                          localStorage.getItem("direccionFacturacion03") +
                          "\r\n";
                      }

                      if (
                        localStorage.getItem("direccionFacturacion04").length >
                        0
                      ) {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " " +
                          localStorage.getItem("direccionFacturacion04") +
                          "\r\n";
                      }
                    }

                    //Cambio de informacion en el encabezado del documento impreso cuando es FEL
                    if (rutaUsaFel) {
                      pos += 30;
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        pos +
                        " " +
                        etiquetaDeImpuesto +
                        ":  " +
                        localStorage.getItem("NitEnterprise") +
                        " \r\n";

                      pos += 30;
                      headerFormat += "L 5 " + pos + " 570 " + pos + " 1\r\n";

                      if (results.rows.item(0).IS_CONTINGENCY_DOCUMENT === 1) {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " DOCUMENTO EN CONTINGENCIA \r\n";

                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " SERIE: " +
                          results.rows.item(0).CONTINGENCY_DOC_SERIE +
                          " NUMERO: " +
                          results.rows.item(0).CONTINGENCY_DOC_NUM +
                          "\r\n";
                      } else {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " DOCUMENTO TRIBUTARIO ELECTRONICO \r\n";

                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " + pos + " FACTURA \r\n";

                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " No. Autorizacion: \r\n";

                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " " +
                          results.rows.item(0).ELECTRONIC_SIGNATURE +
                          "\r\n";

                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " SERIE: " +
                          results.rows.item(0).DOCUMENT_SERIES +
                          " NUMERO: " +
                          results.rows.item(0).DOCUMENT_NUMBER +
                          "\r\n";
                      }

                      pos += 30;
                      headerFormat += "L 5 " + pos + " 570 " + pos + " 1\r\n";

                      pos += 30;
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        pos +
                        " CLIENTE: " +
                        results.rows.item(0).CLIENT_ID +
                        "\r\n";

                      pos += 30;
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        pos +
                        " NOMBRE: " +
                        results.rows.item(0).CLIENT_NAME +
                        "\r\n";

                      pos += 30;
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        pos +
                        " " +
                        etiquetaDeImpuesto +
                        ": " +
                        results.rows.item(0).ERP_INVOICE_ID +
                        "\r\n";

                      if (results.rows.item(0).TASK_ADDRESS.length > 45) {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " DIRECCION: " +
                          results.rows.item(0).TASK_ADDRESS.substring(0, 45) +
                          "\r\n";

                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " " +
                          results.rows
                            .item(0)
                            .TASK_ADDRESS.substring(
                              46,
                              results.rows.item(0).TASK_ADDRESS.length - 1
                            ) +
                          "\r\n";
                      } else {
                        pos += 30;
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          pos +
                          " DIRECCION: " +
                          results.rows.item(0).TASK_ADDRESS +
                          "\r\n";
                      }

                      pos += 30;
                      headerFormat += "L 5 " + pos + " 570 " + pos + " 1\r\n";

                      pos += 30;
                      rowPosition = pos;
                    } else {
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (190 + pos) +
                        " SUJETO A PAGOS TRIMESTRALES\r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (215 + pos) +
                        " " +
                        etiquetaDeImpuesto +
                        ":  " +
                        localStorage.getItem("NitEnterprise") +
                        " \r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (235 + pos) +
                        " " +
                        etiquetaDeResolucion +
                        ": " +
                        resolution +
                        " \r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (265 + pos) +
                        " Autorización: " +
                        pCurrentSAT_Res_Date +
                        " \r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (295 + pos) +
                        " Vencimiento: " +
                        expiresAuth +
                        " \r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (335 + pos) +
                        " Del: " +
                        pCurrentSAT_Res_DocStart +
                        " Al: " +
                        pCurrentSAT_Res_DocFinish +
                        "\r\n";
                      headerFormat +=
                        "CENTER 550 T 0 3 0 " +
                        (385 + pos) +
                        " Factura Serie " +
                        results.rows.item(0).SAT_SERIE +
                        " # " +
                        invoiceId +
                        "\r\n";
                      headerFormat +=
                        "L 5 " + (375 + pos) + " 570 " + (375 + pos) + " 1\r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (415 + pos) +
                        " NOMBRE: " +
                        results.rows.item(0).CLIENT_NAME +
                        "\r\n";
                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (450 + pos) +
                        " " +
                        etiquetaDeImpuesto +
                        ": " +
                        results.rows.item(0).ERP_INVOICE_ID +
                        "\r\n";
                      headerFormat +=
                        "L 5 " + (495 + pos) + " 570 " + (495 + pos) + " 1\r\n";
                      if (escopia === 1) {
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          (525 + pos) +
                          " *** COPIA CONTABILIDAD ***\r\n";
                      } else {
                        headerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          (525 + pos) +
                          " *** ORIGINAL CLIENTE ***\r\n";
                      }

                      headerFormat +=
                        "CENTER 550 T 0 2 0 " +
                        (545 + pos) +
                        "  " +
                        pIsRePrinted +
                        " \r\n";

                      rowPosition = 570 + pos;
                    }

                    detailFormat = "";
                    var pImei = 0;
                    var pImeiPrint = 0;

                    for (var i = 0; i <= results.rows.length - 1; i++) {
                      if (results.rows.item(i).SKU_NAME.length > 35) {
                        detailFormat =
                          detailFormat +
                          "LEFT 5 T 0 2 0 " +
                          rowPosition +
                          " " +
                          results.rows.item(i).SKU +
                          " - " +
                          results.rows.item(i).SKU_NAME.substring(0, 35) +
                          "..." +
                          "\r\n";
                      } else {
                        detailFormat =
                          detailFormat +
                          "LEFT 5 T 0 2 0 " +
                          rowPosition +
                          " " +
                          results.rows.item(i).SKU +
                          " - " +
                          results.rows.item(i).SKU_NAME +
                          "\r\n";
                      }

                      rowPosition += parseInt(30);

                      detailFormat =
                        detailFormat +
                        "LEFT 5 T 0 2 0 " +
                        rowPosition +
                        " CANTIDAD: " +
                        format_number(
                          results.rows.item(i).QTY,
                          configuracionDecimales.defaultDisplayDecimalsForSkuQty
                        ) +
                        " / PREC.UNIT. : " +
                        currencySymbol +
                        ". " +
                        format_number(
                          results.rows.item(i).PRICE,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";
                      rowPosition += parseInt(30);

                      if (
                        Object.keys(muestraPorcentaje).length !== 0 &&
                        muestraPorcentaje.Value == 1
                      ) {
                        detailFormat =
                          detailFormat +
                          "LEFT 5 T 0 2 0 " +
                          rowPosition +
                          " DESC: " +
                          format_number(
                            results.rows.item(i).DISCOUNT,
                            configuracionDecimales.defaultDisplayDecimalsForSkuQty
                          ) +
                          "% --- " +
                          currencySymbol +
                          ". " +
                          format_number(
                            results.rows.item(i).PRICE *
                              results.rows.item(i).QTY *
                              (results.rows.item(i).DISCOUNT / 100),
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                        rowPosition += parseInt(30);
                      }

                      pImei = results.rows.item(i).SERIE_2;
                      if (isNaN(pImei)) {
                        pImeiPrint = 0;
                      } else {
                        pImeiPrint = pImei;
                      }

                      var phone =
                        results.rows.item(i).PHONE === null ||
                        results.rows.item(i).PHONE === "null"
                          ? "..."
                          : results.rows.item(i).PHONE;

                      detailFormat =
                        detailFormat +
                        "LEFT 5 T 0 2 0 " +
                        rowPosition +
                        " SERIE: " +
                        results.rows.item(i).SERIE +
                        "/ IMEI: " +
                        pImeiPrint +
                        "/ " +
                        phone +
                        "\r\n";
                      rowPosition += parseInt(30);

                      detailFormat =
                        detailFormat +
                        "RIGHT 550 T 0 2 0 " +
                        (rowPosition - 90) +
                        " " +
                        currencySymbol +
                        ". " +
                        format_number(
                          trunc_number(
                            results.rows.item(i).PRICE *
                              results.rows.item(i).QTY *
                              (1 - results.rows.item(i).DISCOUNT / 100),
                            configuracionDecimales.defaultCalculationsDecimals
                          ),
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      detailFormat =
                        detailFormat +
                        "L 5 " +
                        rowPosition +
                        " 570 " +
                        rowPosition +
                        " 1\r\n";
                      rowPosition += parseInt(10);
                    }

                    if (facturaManejaImpuesto) {
                      if (impuestoDeFactura > 0) {
                        rowPosition += parseInt(30);
                        footerFormat =
                          "LEFT 5 T 0 2 0 " + rowPosition + "SUB TOTAL: \r\n";
                        footerFormat =
                          footerFormat +
                          "RIGHT 550 T 0 2 0 " +
                          rowPosition +
                          " " +
                          currencySymbol +
                          ". " +
                          format_number(
                            results.rows.item(0).TOTAL_AMOUNT -
                              impuestoDeFactura,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                      } else {
                        rowPosition += parseInt(30);
                        footerFormat =
                          "LEFT 5 T 0 2 0 " + rowPosition + "SUB TOTAL: \r\n";
                        footerFormat =
                          footerFormat +
                          "RIGHT 550 T 0 2 0 " +
                          rowPosition +
                          " " +
                          currencySymbol +
                          ". " +
                          format_number(
                            results.rows.item(0).TOTAL_AMOUNT,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                      }

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " +
                        rowPosition +
                        " IMPUESTO " +
                        etiquetaPorcentajeDeImpuesto +
                        "%: \r\n";
                      footerFormat +=
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        format_number(
                          impuestoDeFactura,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " + rowPosition + " TOTAL: \r\n";
                      footerFormat +=
                        footerFormat +
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        format_number(
                          results.rows.item(0).TOTAL_AMOUNT,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      if (creditAmount && creditAmount > 0) {
                        rowPosition += parseInt(30);
                        footerFormat +=
                          "LEFT 5 T 0 2 0 " + rowPosition + " CREDITO: \r\n";
                        footerFormat +=
                          "RIGHT 550 T 0 2 0 " +
                          rowPosition +
                          " " +
                          currencySymbol +
                          ". " +
                          format_number(
                            creditAmount,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                      }

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " + rowPosition + " EFECTIVO:\r\n";
                      footerFormat +=
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        (creditAmount && creditAmount > 0
                          ? format_number(
                              Number(results.rows.item(0).CASH_AMOUNT),
                              configuracionDecimales.defaultDisplayDecimals
                            )
                          : format_number(
                              Number(results.rows.item(0).TOTAL_AMOUNT) +
                                Number(results.rows.item(0).CHANGE),
                              configuracionDecimales.defaultDisplayDecimals
                            )) +
                        "\r\n";

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " + rowPosition + " CAMBIO: \r\n";
                      footerFormat +=
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        format_number(
                          results.rows.item(0).CHANGE,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";
                    } else {
                      if (
                        Object.keys(muestraPorcentaje).length !== 0 &&
                        muestraPorcentaje.Value == 1
                      ) {
                        rowPosition += parseInt(30);
                        footerFormat =
                          "LEFT 5 T 0 2 0 " + rowPosition + " DESCUENTO: \r\n";
                        footerFormat =
                          footerFormat +
                          "RIGHT 550 T 0 2 0 " +
                          rowPosition +
                          " %. " +
                          format_number(
                            discount,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          " --- " +
                          currencySymbol +
                          ". " +
                          format_number(
                            discountAmount,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                      }

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " + rowPosition + " TOTAL: \r\n";
                      footerFormat +=
                        footerFormat +
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        format_number(
                          results.rows.item(0).TOTAL_AMOUNT - discountAmount,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      if (creditAmount && creditAmount > 0) {
                        rowPosition += parseInt(30);
                        footerFormat +=
                          "LEFT 5 T 0 2 0 " + rowPosition + " CREDITO: \r\n";
                        footerFormat +=
                          "RIGHT 550 T 0 2 0 " +
                          rowPosition +
                          " " +
                          currencySymbol +
                          ". " +
                          format_number(
                            creditAmount,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                      }

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " + rowPosition + " EFECTIVO: \r\n";
                      footerFormat +=
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        (creditAmount && creditAmount > 0
                          ? format_number(
                              results.rows.item(0).CASH_AMOUNT,
                              configuracionDecimales.defaultDisplayDecimals
                            )
                          : format_number(
                              Number(
                                results.rows.item(0).TOTAL_AMOUNT -
                                  discountAmount
                              ) + Number(results.rows.item(0).CHANGE),
                              configuracionDecimales.defaultDisplayDecimals
                            )) +
                        "\r\n";

                      rowPosition += parseInt(30);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " + rowPosition + " CAMBIO: \r\n";
                      footerFormat +=
                        "RIGHT 550 T 0 2 0 " +
                        rowPosition +
                        " " +
                        currencySymbol +
                        ". " +
                        format_number(
                          results.rows.item(0).CHANGE,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";
                    }

                    if (creditAmount && creditAmount > 0) {
                      rowPosition += parseInt(50);
                      footerFormat +=
                        "LEFT 5 T 0 2 0 " +
                        rowPosition +
                        " Fecha de Vencimiento: " +
                        (results.rows.item(0).DUE_DATE
                          ? results.rows.item(0).DUE_DATE.split(" ")[0]
                          : getDateTime()) +
                        "\r\n";
                    }

                    if (rutaUsaFel) {
                      rowPosition += 30;
                      footerFormat =
                        footerFormat +
                        "L 5 " +
                        rowPosition +
                        " 570 " +
                        rowPosition +
                        " 1\r\n";

                      if (results.rows.item(0).IS_CONTINGENCY_DOCUMENT === 0) {
                        frasesYEscenarios.forEach(function(frase) {
                          rowPosition += 25;
                          footerFormat +=
                            "LEFT 5 T 0 2 0 " +
                            rowPosition +
                            " " +
                            frase.TextToShow +
                            "\r\n";
                        });

                        rowPosition += 30;
                        footerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          rowPosition +
                          " DATOS DEL CERTIFICADOR \r\n";

                        rowPosition += 20;
                        footerFormat +=
                          "LEFT 5 T 0 2 0 " +
                          rowPosition +
                          " " +
                          etiquetaDeImpuesto +
                          ": " +
                          (localStorage.getItem("FEL_CERTIFIER_TAX_ID") ||
                            "N/A") +
                          "\r\n";

                        rowPosition += 20;
                        footerFormat +=
                          "LEFT 5 T 0 2 0 " +
                          rowPosition +
                          " " +
                          (localStorage.getItem("FEL_CERTIFIER_NAME") ||
                            "N/A") +
                          "\r\n";
                      } else {
                        rowPosition += 25;
                        footerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          rowPosition +
                          " Emision en contingencia, verifique su validez en el sitio\r\n";

                        rowPosition += 25;
                        footerFormat +=
                          "CENTER 550 T 0 2 0 " +
                          rowPosition +
                          " www.sat.gob.gt/fel\r\n";
                      }

                      rowPosition += 30;
                      footerFormat =
                        footerFormat +
                        "L 5 " +
                        rowPosition +
                        " 570 " +
                        rowPosition +
                        " 1\r\n";
                    }

                    rowPosition += 30;
                    footerFormat +=
                      "CENTER 550 T 0 2 0 " +
                      rowPosition +
                      " [" +
                      gIsOnline +
                      "] " +
                      getDateTime() +
                      " / RUTA " +
                      gCurrentRoute +
                      " \r\n";

                    rowPosition += parseInt(30);

                    footerFormat = footerFormat + "\r\nPRINT\r\n";

                    var invoiceFormat =
                      headerFormat + detailFormat + footerFormat;

                    invoiceFormat = invoiceFormat.replace(
                      "_DOC_LEN_",
                      rowPosition + 200
                    );

                    bluetoothSerial.write(
                      invoiceFormat,
                      function() {
                        callBack();
                      },
                      function() {
                        my_dialog("", "", "close");
                        notify(
                          "Lo sentimos no se pudo imprimir el documento..."
                        );
                        callBack();
                      }
                    );

                    my_dialog("", "", "close");
                  },
                  function(_txError, err) {
                    my_dialog("", "", "close");
                    notify("ERROR: " + err.message);
                    return err.code;
                  }
                );
              });
              my_dialog("", "", "close");
            }
          );
        },
        function(error) {
          notify(
            "Error al obtener parámetro para impresión de porcentaje: " +
              error.message
          );
        }
      );
    };

    var implementacionUsaFel = localStorage.getItem("IMPLEMENTS_FEL");
    if (implementacionUsaFel && implementacionUsaFel == "true") {
      var tipoDeDocumentoFel = localStorage.getItem("FEL_DOCUMENT_TYPE");

      if (!tipoDeDocumentoFel || tipoDeDocumentoFel.length === 0) {
        notify(
          "Error al imprimir factura, no se ha encontrado el tipo de documento FEL a utilizar."
        );
        procesarImpresionDeFactura(false, []);
      } else {
        var facturacionElectronicaServicio = new FacturacionElectronicaServicio();
        facturacionElectronicaServicio.obtenerFrasesYEscenariosPorTipoDeDocumentoFel(
          tipoDeDocumentoFel,
          function(frasesYEscenarios) {
            procesarImpresionDeFactura(true, frasesYEscenarios);
          },
          function(resultado) {
            notify(
              "Error al imprimir factura, no se han podido obtener frases FEL. " +
                resultado.mensaje
            );
            procesarImpresionDeFactura(false, []);
          }
        );
      }
    } else {
      procesarImpresionDeFactura(false, []);
    }
  } catch (e) {
    notify("Error al intentar imprimir la factura debido a: " + e.message);
    my_dialog("", "", "close");
  }
}

function formatoImpresionHonduras(pInvoiceId, pIsReprinted, callback, escopia) {
  var invoicePrintFormat = "";
  var resultados;
  var facturaManejaImpuesto = false;
  var impuestoDeFactura = 0,
    posY = 0;
  var fecha;

  var etiquetaDeImpuesto = localStorage.getItem("TAX_ID");
  var etiquetaDeResolucion = localStorage.getItem("TAX_RESOLUTION_ID");
  var etiquetaPorcentajeDeImpuesto = localStorage.getItem("TAX_PERCENT");

  try {
    var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
    var muestraPorcentaje = {};
    ParametroServicio.ObtenerParametro(
      "INVOICE",
      "SHOW_PERCENTAGE_INVOICE",
      function(parametro) {
        muestraPorcentaje = parametro;
      },
      function(error) {
        notify(
          "Error al obtener parámetro para impresión de porcentaje: " +
            error.message
        );
      }
    );

    calcularImpuestoPorLineaDeFactura(function(resumenDefactura) {
      resumeInvoiceObject = resumenDefactura;
    });

    configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
      function(configuracionDecimales) {
        var pSql =
          "SELECT IFNULL(IH.DISCOUNT,0) AS DISCOUNT_HEADER, IH.*, ID.*, IFNULL(T.TASK_ADDRESS, '') TASK_ADDRESS ";
        pSql +=
          " FROM INVOICE_HEADER IH INNER JOIN INVOICE_DETAIL ID ON IH.INVOICE_NUM = ID.INVOICE_NUM ";
        pSql +=
          " LEFT JOIN TASK T ON T.RELATED_CLIENT_CODE = IH.CLIENT_ID AND T.TASK_TYPE = 'SALE'  ";
        pSql +=
          " WHERE IH.IS_CREDIT_NOTE = 0 AND IH.INVOICE_NUM = " + pInvoiceId;

        SONDA_DB_Session.transaction(function(tx) {
          tx.executeSql(
            pSql,
            [],
            function(tx, results) {
              resultados = results;
              fecha = new Date(results.rows.item(0).POSTED_DATETIME);
              var discount = results.rows.item(0).DISCOUNT_HEADER;
              var discountAmount =
                discount > 0
                  ? (discount / 100) * results.rows.item(0).TOTAL_AMOUNT
                  : 0;
              var creditAmount = results.rows.item(0).CREDIT_AMOUNT;

              var dia = fecha.getDate();
              var mes = fecha.getMonth() + 1;
              var año = fecha.getFullYear();
              var hora = fecha.getHours();
              var minuto = fecha.getMinutes();

              if (
                results.rows.item(0).HANDLE_TAX === 1 ||
                results.rows.item(0).HANDLE_TAX === "1"
              ) {
                facturaManejaImpuesto = true;
                methodCalculationType = localStorage.getItem(
                  "METHOD_CALCULATION_TAX"
                );
                impuestoDeFactura = results.rows.item(0).TAX_PERCENT;
              }

              var pExpiresAuth = localStorage.getItem("SAT_RES_EXPIRE");
              fecha = new Date(pExpiresAuth);
              var diaExpiracion = fecha.getDate();
              var mesExpiracion = fecha.getMonth() + 1;
              var añoExpiracion = fecha.getFullYear();

              var pRes = localStorage.getItem("POS_SAT_RESOLUTION");

              invoicePrintFormat = "! 0 50 50 _DocLength_ 1\r\n";
              invoicePrintFormat += "! U1 LMARGIN 10\r\n";
              invoicePrintFormat += "! U\r\n";
              invoicePrintFormat += "! U1 PAGE-WIDTH 1400\r\n";
              invoicePrintFormat += "ON-FEED IGNORE\r\n";

              if (gBranchName.length > 35) {
                posY += 40;
                invoicePrintFormat += "SETBOLD 1\r\n";
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  CenterText(gCompanyName) +
                  "\r\n";
                invoicePrintFormat += "SETBOLD 0\r\n";

                posY += 40;
                invoicePrintFormat += "SETBOLD 1\r\n";
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  gBranchName.substring(0, 35) +
                  "\r\n";
                invoicePrintFormat += "SETBOLD 0\r\n";

                posY += 40;
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  gBranchName.substring(35, gBranchName.length - 1) +
                  "\r\n";
              } else {
                posY += 40;
                invoicePrintFormat += "SETBOLD 1\r\n";
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  CenterText(gCompanyName) +
                  "\r\n";
                invoicePrintFormat += "SETBOLD 0\r\n";

                posY += 40;
                invoicePrintFormat += "SETBOLD 1\r\n";
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " + posY + " " + gBranchName + "\r\n";
                invoicePrintFormat += "SETBOLD 0\r\n";
              }

              posY += 40;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " +
                posY +
                " " +
                etiquetaDeImpuesto +
                ": " +
                localStorage.getItem("NitEnterprise") +
                " \r\n";
              posY += 10;

              if (gBranchAddress.length > 30) {
                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  gBranchAddress.substring(0, 30) +
                  "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  gBranchAddress.substring(31, gBranchAddress.length - 1) +
                  "\r\n";
              } else {
                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  localStorage.getItem("direccionFacturacion01") +
                  "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " +
                  posY +
                  " " +
                  localStorage.getItem("direccionFacturacion02") +
                  "\r\n";

                if (localStorage.getItem("direccionFacturacion03").length > 0) {
                  posY += 30;
                  invoicePrintFormat +=
                    "CENTER 550 T 0 2 0 " +
                    posY +
                    " " +
                    localStorage.getItem("direccionFacturacion03") +
                    "\r\n";
                }

                if (localStorage.getItem("direccionFacturacion04").length > 0) {
                  posY += 30;
                  invoicePrintFormat +=
                    "CENTER 550 T 0 2 0 " +
                    posY +
                    " " +
                    localStorage.getItem("direccionFacturacion04") +
                    "\r\n";
                }
              }

              posY += 30;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " +
                posY +
                " Tel.: " +
                localStorage.getItem("telefonoEmpresa") +
                "\r\n";

              posY += 30;
              invoicePrintFormat += "UNDERLINE ON\r\n";
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " +
                posY +
                " " +
                localStorage.getItem("correoElectronicoEmpresa") +
                "\r\n";
              invoicePrintFormat += "UNDERLINE OFF\r\n";

              posY += 45;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 0 " + posY + " " + etiquetaDeResolucion + ":\r\n";
              posY += 30;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 0 " + posY + " " + pRes + "\r\n";

              posY += 45;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 0 " + posY + " Factura No.:\r\n";
              invoicePrintFormat += "SETBOLD 1\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 115 " +
                posY +
                " " +
                results.rows.item(0).SAT_SERIE +
                " " +
                pInvoiceId +
                "\r\n";
              invoicePrintFormat += "SETBOLD 0\r\n";

              posY += 30;
              invoicePrintFormat += "LEFT 5 T 0 2 0 " + posY + " Fecha:\r\n";
              invoicePrintFormat += "SETBOLD 1\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 115 " +
                posY +
                " " +
                (dia < 10 ? "0" + dia : dia) +
                "/" +
                (mes < 10 ? "0" + mes : mes) +
                "/" +
                año +
                "\r\n";
              invoicePrintFormat += "SETBOLD 0\r\n";

              posY += 30;
              invoicePrintFormat += "LEFT 5 T 0 2 0 " + posY + " Hora:\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 115 " +
                posY +
                " " +
                (hora < 10 ? "0" + hora : hora) +
                ":" +
                (minuto < 10 ? "0" + minuto : minuto) +
                "\r\n";

              posY += 60;
              invoicePrintFormat += "LEFT 5 T 0 2 0 " + posY + " Cliente:\r\n";
              invoicePrintFormat += "SETBOLD 1\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 115 " +
                posY +
                " " +
                results.rows.item(0).CLIENT_NAME +
                "\r\n";
              invoicePrintFormat += "SETBOLD 0\r\n";

              posY += 30;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 0 " + posY + " " + etiquetaDeImpuesto + ":\r\n";
              invoicePrintFormat += "SETBOLD 1\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 150 " +
                posY +
                " " +
                results.rows.item(0).ERP_INVOICE_ID +
                "\r\n";
              invoicePrintFormat += "SETBOLD 0\r\n";

              posY += 30;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 0 " + posY + " Dirección:\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 115 " +
                posY +
                " " +
                results.rows.item(0).TASK_ADDRESS +
                "\r\n";

              posY += 60;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 100 " + posY + " DESCRIPCIÓN\r\n";
              invoicePrintFormat += "LEFT 5 T 0 2 335 " + posY + " CANT.\r\n";
              invoicePrintFormat +=
                "LEFT 5 T 0 2 395 " + posY + " PRECIO/U\r\n";
              invoicePrintFormat += "RIGHT 550 T 0 2 0 " + posY + " TOTAL\r\n";

              var i;
              for (i = 0; i <= results.rows.length - 1; i++) {
                posY += 30;
                if (results.rows.item(i).SKU_NAME.length > 35) {
                  invoicePrintFormat +=
                    "LEFT 5 T 0 2 0 " +
                    posY +
                    " " +
                    results.rows.item(i).SKU_NAME.substring(0, 35) +
                    "..." +
                    "\r\n";
                } else {
                  invoicePrintFormat +=
                    "LEFT 5 T 0 2 0 " +
                    posY +
                    " " +
                    results.rows.item(i).SKU_NAME +
                    "\r\n";
                }

                invoicePrintFormat +=
                  "RIGHT 550 T 0 2 0 " +
                  posY +
                  " " +
                  format_number(
                    results.rows.item(i).PRICE *
                      results.rows.item(i).QTY *
                      (1 - results.rows.item(i).DISCOUNT / 100),
                    configuracionDecimales.defaultDisplayDecimals
                  ) +
                  "\r\n"; //format_number(trunc_number((results.rows.item(i).PRICE * results.rows.item(i).QTY), configuracionDecimales.defaultCalculationsDecimals), configuracionDecimales.defaultDisplayDecimals) + "\r\n";
                invoicePrintFormat +=
                  "RIGHT 460 T 0 2 0 " +
                  posY +
                  " " +
                  format_number(
                    trunc_number(
                      results.rows.item(i).PRICE,
                      configuracionDecimales.defaultCalculationsDecimals
                    ),
                    configuracionDecimales.defaultDisplayDecimals
                  ) +
                  "\r\n";
                invoicePrintFormat +=
                  "RIGHT 370 T 0 2 0 " +
                  posY +
                  " " +
                  format_number(
                    results.rows.item(i).QTY,
                    configuracionDecimales.defaultDisplayDecimalsForSkuQty
                  ) +
                  "\r\n";
                if (
                  Object.keys(muestraPorcentaje).length !== 0 &&
                  muestraPorcentaje.Value == 1
                ) {
                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 0 2 0 " + posY + " Desc: \r\n";
                  invoicePrintFormat +=
                    "RIGHT 370 T 0 2 0 " +
                    posY +
                    " " +
                    format_number(
                      results.rows.item(i).DISCOUNT,
                      configuracionDecimales.defaultDisplayDecimalsForSkuQty
                    ) +
                    "\r\n";
                  invoicePrintFormat +=
                    "RIGHT 460 T 0 2 0 " +
                    posY +
                    " " +
                    format_number(
                      trunc_number(
                        results.rows.item(i).PRICE *
                          results.rows.item(i).QTY *
                          (results.rows.item(i).DISCOUNT / 100),
                        configuracionDecimales.defaultCalculationsDecimals
                      ),
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";
                }
              }

              posY += 30;
              invoicePrintFormat += "L 5 " + posY + " 570 " + posY + " 1\r\n";

              if (facturaManejaImpuesto) {
                switch (methodCalculationType) {
                  case "BY_ROW":
                    posY += 30;
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Total Gravado:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        trunc_number(
                          resumeInvoiceObject.total -
                            resumeInvoiceObject.impuesto,
                          configuracionDecimales.defaultCalculationsDecimals
                        ),
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";

                    posY += 30;
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Exento:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        0,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";

                    posY += 30;
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Impuesto " +
                      etiquetaPorcentajeDeImpuesto +
                      "% S/V:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        resumeInvoiceObject.impuesto,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";

                    posY += 30;
                    invoicePrintFormat += "SETBOLD 1\r\n";
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Total:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        resumeInvoiceObject.total,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";
                    invoicePrintFormat += "SETBOLD 0\r\n";
                    break;

                  case "BY_TOTAL_AMOUNT":
                    posY += 30;
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Total Gravado:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        trunc_number(
                          results.rows.item(0).TOTAL_AMOUNT - impuestoDeFactura,
                          configuracionDecimales.defaultCalculationsDecimals
                        ),
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";

                    posY += 30;
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Exento:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        0,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";

                    posY += 30;
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Impuesto " +
                      etiquetaPorcentajeDeImpuesto +
                      "% S/V:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        impuestoDeFactura,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";

                    posY += 30;
                    invoicePrintFormat += "SETBOLD 1\r\n";
                    invoicePrintFormat +=
                      "RIGHT 550 T 0 2 0 " +
                      posY +
                      " Total:\t" +
                      currencySymbol +
                      ".\t" +
                      format_number(
                        results.rows.item(0).TOTAL_AMOUNT,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      "\r\n";
                    invoicePrintFormat += "SETBOLD 0\r\n";
                    break;
                }
              } else {
                posY += 30;
                invoicePrintFormat +=
                  "RIGHT 550 T 0 2 0 " +
                  posY +
                  " Total Gravado:\t" +
                  currencySymbol +
                  ".\t" +
                  format_number(
                    results.rows.item(0).TOTAL_AMOUNT,
                    configuracionDecimales.defaultDisplayDecimals
                  ) +
                  "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "RIGHT 550 T 0 2 0 " +
                  posY +
                  " Exento:\t" +
                  currencySymbol +
                  ".\t" +
                  format_number(
                    0,
                    configuracionDecimales.defaultDisplayDecimals
                  ) +
                  "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "RIGHT 550 T 0 2 0 " +
                  posY +
                  " Impuesto " +
                  etiquetaPorcentajeDeImpuesto +
                  "% S/V:\t" +
                  currencySymbol +
                  ".\t" +
                  format_number(
                    0,
                    configuracionDecimales.defaultDisplayDecimals
                  ) +
                  "\r\n";

                if (
                  Object.keys(muestraPorcentaje).length !== 0 &&
                  muestraPorcentaje.Value == 1
                ) {
                  posY += 30;
                  invoicePrintFormat += "SETBOLD 1\r\n";
                  invoicePrintFormat +=
                    "RIGHT 550 T 0 2 0 " +
                    posY +
                    " Descuento: %." +
                    format_number(
                      discount,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    " --- " +
                    currencySymbol +
                    ". " +
                    format_number(
                      discountAmount,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";
                  invoicePrintFormat += "SETBOLD 0\r\n";
                }

                posY += 30;
                invoicePrintFormat += "SETBOLD 1\r\n";
                invoicePrintFormat +=
                  "RIGHT 550 T 0 2 0 " +
                  posY +
                  " Total:\t" +
                  currencySymbol +
                  ".\t" +
                  format_number(
                    results.rows.item(0).TOTAL_AMOUNT - discountAmount,
                    configuracionDecimales.defaultDisplayDecimals
                  ) +
                  "\r\n";
                invoicePrintFormat += "SETBOLD 0\r\n";
              }

              if (creditAmount && creditAmount > 0) {
                posY += parseInt(50);
                invoicePrintFormat +=
                  "LEFT 5 T 0 2 0 " +
                  posY +
                  " Fecha de Vencimiento: " +
                  (results.rows.item(0).DUE_DATE
                    ? results.rows.item(0).DUE_DATE.split(" ")[0]
                    : getDateTime()) +
                  " (Crédito) \r\n";
              }

              posY += 35;
              invoicePrintFormat +=
                "LEFT 5 T 0 2 0 " +
                posY +
                " Vendedor: " +
                localStorage.getItem("NAME_USER") +
                "\r\n";

              posY += 50;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " +
                posY +
                " ****** Gracias por su Compra ******\r\n";

              posY += 50;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " + posY + " Rango Autorizado\r\n";

              posY += 30;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " +
                posY +
                " Del: " +
                results.rows.item(0).SAT_SERIE +
                " " +
                pCurrentSAT_Res_DocStart +
                " al " +
                results.rows.item(0).SAT_SERIE +
                " " +
                pCurrentSAT_Res_DocFinish +
                "\r\n";

              var fechaLimite = new Date(
                localStorage.getItem("SAT_RES_EXPIRE")
              );

              var diaL = fechaLimite.getDate();
              var mesL = fechaLimite.getMonth() + 1;
              var añoL = fechaLimite.getFullYear();

              posY += 30;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " +
                posY +
                " Fecha Limite Emisión: " +
                (diaL < 10 ? "0" + diaL : diaL) +
                "/" +
                (mesL < 10 ? "0" + mesL : mesL) +
                "/" +
                añoL +
                "\r\n";

              posY += 50;
              if (escopia === 1) {
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " + posY + " Copia: Contabilidad\r\n";
              } else {
                invoicePrintFormat +=
                  "CENTER 550 T 0 2 0 " + posY + " Original: Cliente\r\n";
              }

              posY += 30;
              invoicePrintFormat +=
                "CENTER 550 T 0 2 0 " + posY + "  " + pIsReprinted + " \r\n";

              invoicePrintFormat += "PRINT\r\n";

              invoicePrintFormat = invoicePrintFormat.replace(
                "_DocLength_",
                (posY + 200).toString()
              );

              bluetoothSerial.write(
                invoicePrintFormat,
                function() {
                  callback();
                },
                function() {
                  my_dialog("", "", "close");
                  notify("Lo sentimos no se pudo imprimir el documento...");
                  callback();
                }
              );

              my_dialog("", "", "close");
            },
            function(err) {
              my_dialog("", "", "close");
              notify("ERROR, 8.1.17: " + err.code);
              return err.code;
            }
          );
        });
        my_dialog("", "", "close");
      }
    );
  } catch (e) {
    notify("printinvoice_joininfo: " + e.message);
    my_dialog("", "", "close");
    return e.message;
  }
}

function obtenerNombreDelMes(numeroDeMes) {
  switch (numeroDeMes) {
    case 1:
      return "Enero";
    case 2:
      return "Febrero";
    case 3:
      return "Marzo";
    case 4:
      return "Abril";
    case 5:
      return "Mayo";
    case 6:
      return "Junio";
    case 7:
      return "Julio";
    case 8:
      return "Agosto";
    case 9:
      return "Septiembre";
    case 10:
      return "Octubre";
    case 11:
      return "Noviembre";
    case 12:
      return "Diciembre";
    default:
      return numeroDeMes;
  }
}

function formatoDeImpresionDiprocom(invoiceId, isReprint, callback, esCopia) {
  var invoicePrintFormat = "";
  var resultados;
  var facturaManejaImpuesto = false;
  var impuestoDeFactura = 0,
    posY = 0;
  var fecha;

  var etiquetaTipoDeImpuesto = localStorage.getItem("TAX_LABEL_ID");
  var etiquetaDeImpuesto = localStorage.getItem("TAX_ID");
  var etiquetaDeResolucion = localStorage.getItem("TAX_RESOLUTION_ID");
  var etiquetaPorcentajeDeImpuesto = localStorage.getItem("TAX_PERCENT");

  try {
    var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();

    var muestraPorcentaje = {};
    ParametroServicio.ObtenerParametro(
      "INVOICE",
      "SHOW_PERCENTAGE_INVOICE",
      function(parametro) {
        muestraPorcentaje = parametro;
      },
      function(error) {
        notify(
          "Error al obtener parámetro para impresión de porcentaje: " +
            error.message
        );
      }
    );

    calcularImpuestoPorLineaDeFactura(function(resumenDefactura) {
      resumeInvoiceObject = resumenDefactura;

      ParametroServicio.ObtenerParametro(
        "INVOICE",
        "LENGHT_TO_FILL_NUMBER",
        resultado => {
          var longitudDelNumero = resultado;
          ParametroServicio.ObtenerParametro(
            "INVOICE",
            "CHARACTER_TO_FILL_NUMER",
            resultado => {
              var caracterDeRelleno = resultado;

              configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
                function(configuracionDecimales) {
                  var pSql =
                    "SELECT IFNULL(IH.DISCOUNT,0) AS DISCOUNT_HEADER, IH.*, ID.*, IFNULL(T.TASK_ADDRESS, '') TASK_ADDRESS ";
                  pSql +=
                    " FROM INVOICE_HEADER IH INNER JOIN INVOICE_DETAIL ID ON IH.INVOICE_NUM = ID.INVOICE_NUM ";
                  pSql +=
                    " LEFT JOIN TASK T ON T.RELATED_CLIENT_CODE = IH.CLIENT_ID AND T.TASK_TYPE = 'SALE'  ";
                  pSql +=
                    " WHERE IH.IS_CREDIT_NOTE = 0 AND IH.INVOICE_NUM = " +
                    invoiceId;

                  SONDA_DB_Session.transaction(function(tx) {
                    tx.executeSql(
                      pSql,
                      [],
                      function(tx, results) {
                        resultados = results;
                        var discount = results.rows.item(0).DISCOUNT_HEADER;
                        var discountAmount =
                          discount > 0
                            ? (discount / 100) *
                              results.rows.item(0).TOTAL_AMOUNT
                            : 0;
                        var creditAmount = results.rows.item(0).CREDIT_AMOUNT;

                        if (
                          results.rows.item(0).HANDLE_TAX === 1 ||
                          results.rows.item(0).HANDLE_TAX === "1"
                        ) {
                          facturaManejaImpuesto = true;
                          methodCalculationType = localStorage.getItem(
                            "METHOD_CALCULATION_TAX"
                          );
                          impuestoDeFactura = results.rows.item(0).TAX_PERCENT;
                        }

                        var pRes = localStorage.getItem("POS_SAT_RESOLUTION");

                        invoicePrintFormat = "! 0 50 50 _DocLength_ 1\r\n";
                        invoicePrintFormat += "! U1 LMARGIN 10\r\n";
                        invoicePrintFormat += "! U\r\n";
                        invoicePrintFormat += "! U1 PAGE-WIDTH 1400\r\n";
                        invoicePrintFormat += "ON-FEED IGNORE\r\n";

                        //Informacion de la empresa-----------------------------------------------------------------------------------------------

                        posY += 40;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          " " +
                          gCompanyName +
                          "\r\n";

                        posY += 40;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          " " +
                          gBranchName +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          " " +
                          localStorage.getItem("direccionFacturacion01") +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          " " +
                          localStorage.getItem("direccionFacturacion02") +
                          "\r\n";

                        if (
                          localStorage.getItem("direccionFacturacion03")
                            .length > 0
                        ) {
                          posY += 30;
                          invoicePrintFormat +=
                            "CENTER 550 T 0 2 0 " +
                            posY +
                            " " +
                            localStorage.getItem("direccionFacturacion03") +
                            "\r\n";
                        }

                        if (
                          localStorage.getItem("direccionFacturacion04")
                            .length > 0
                        ) {
                          posY += 30;
                          invoicePrintFormat +=
                            "CENTER 550 T 0 2 0 " +
                            posY +
                            " " +
                            localStorage.getItem("direccionFacturacion04") +
                            "\r\n";
                        }

                        posY += 50;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          " " +
                          localStorage.getItem("correoElectronicoEmpresa") +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          "  " +
                          localStorage.getItem("telefonoEmpresa") +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "CENTER 550 T 0 2 0 " +
                          posY +
                          " " +
                          etiquetaDeImpuesto +
                          ": " +
                          localStorage.getItem("NitEnterprise") +
                          " \r\n";

                        posY += 40;
                        invoicePrintFormat +=
                          "L 5 " + posY + " 570 " + posY + " 1\r\n";

                        //Informacion de resolucion de facturacion (CAI) -------------------------------------------------------------------------------------------

                        posY += 30;
                        var fechaCreacion = new Date(
                          results.rows.item(0).POSTED_DATETIME
                        );
                        invoicePrintFormat +=
                          "CENTER 550 T 7 0 0 " +
                          posY +
                          " " +
                          ((fechaCreacion.getDate() < 10
                            ? "0" + fechaCreacion.getDate()
                            : fechaCreacion.getDate()) +
                            " de " +
                            obtenerNombreDelMes(fechaCreacion.getMonth() + 1) +
                            " de " +
                            fechaCreacion.getFullYear()) +
                          " \r\n";

                        posY += 30;
                        invoicePrintFormat += "SETBOLD 1\r\n";
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " FACTURA No.: " +
                          results.rows.item(0).SAT_SERIE +
                          rellenarPalabra(
                            longitudDelNumero.Value,
                            caracterDeRelleno.Value,
                            invoiceId.toString()
                          ) +
                          "\r\n";
                        invoicePrintFormat += "SETBOLD 0\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " " +
                          etiquetaDeResolucion +
                          ": " +
                          pRes +
                          " \r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " RANGO AUTORIZADO DE FACTURAS \r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " INICIAL: " +
                          (results.rows.item(0).SAT_SERIE +
                            rellenarPalabra(
                              longitudDelNumero.Value,
                              caracterDeRelleno.Value,
                              pCurrentSAT_Res_DocStart.toString()
                            )) +
                          " \r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " FINAL: " +
                          (results.rows.item(0).SAT_SERIE +
                            rellenarPalabra(
                              longitudDelNumero.Value,
                              caracterDeRelleno.Value,
                              pCurrentSAT_Res_DocFinish.toString()
                            )) +
                          " \r\n";

                        var fechaLimite = new Date(
                          localStorage.getItem("SAT_RES_EXPIRE")
                        );

                        var diaL = fechaLimite.getDate();
                        var mesL = fechaLimite.getMonth() + 1;
                        var añoL = fechaLimite.getFullYear();

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " FECHA LIMITE DE EMISION: " +
                          (diaL < 10 ? "0" + diaL : diaL) +
                          "/" +
                          (mesL < 10 ? "0" + mesL : mesL) +
                          "/" +
                          añoL +
                          " \r\n";

                        posY += 40;
                        invoicePrintFormat +=
                          "L 5 " + posY + " 570 " + posY + " 1\r\n";

                        //Informacion del comprador -----------------------------------------------------------------------------------

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " CLIENTE: " +
                          results.rows.item(0).CLIENT_ID +
                          "/" +
                          results.rows.item(0).CLIENT_NAME +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " DIRECCION: " +
                          (results.rows.item(0).TASK_ADDRESS.length > 30
                            ? results.rows
                                .item(0)
                                .TASK_ADDRESS.substring(0, 25) + "..."
                            : results.rows.item(0).TASK_ADDRESS) +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " TELEFONO: " +
                          (results.rows.item(0).TELEPHONE_NUMBER
                            ? results.rows.item(0).TELEPHONE_NUMBER
                            : "N/A") +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " " +
                          etiquetaDeImpuesto +
                          ": " +
                          results.rows.item(0).ERP_INVOICE_ID +
                          "\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " VENDEDOR: " +
                          (gCurrentRoute +
                            "/" +
                            localStorage.getItem("NAME_USER")) +
                          "\r\n";

                        posY += 40;
                        if (esCopia === 1) {
                          invoicePrintFormat +=
                            "CENTER 550 T 7 0 0 " +
                            posY +
                            " *Copia (Contabilidad)\r\n";
                        } else {
                          invoicePrintFormat +=
                            "CENTER 550 T 7 0 0 " +
                            posY +
                            " *Original (Cliente)\r\n";
                        }

                        posY += 40;
                        invoicePrintFormat +=
                          "L 5 " + posY + " 570 " + posY + " 1\r\n";

                        //Informacion de Productos comprados ---------------------------------------------------------------------------------------------------------
                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 5 " + posY + " CODIGO\r\n";
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 150 " + posY + " DESCRIPCION\r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 15 " + posY + " CANTIDAD\r\n";
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 165 " + posY + " PRECIO UNIT.\r\n";
                        invoicePrintFormat +=
                          "RIGHT 550 T 7 0 0 " + posY + " TOTAL\r\n";

                        posY += 40;
                        invoicePrintFormat +=
                          "L 5 " + posY + " 570 " + posY + " 1\r\n";

                        var i;
                        for (i = 0; i <= results.rows.length - 1; i++) {
                          var product = results.rows.item(i);

                          var skuPrice =
                            facturaManejaImpuesto &&
                            methodCalculationType == "BY_ROW"
                              ? product.PRICE -
                                obtenerValorADescontarEnBaseaImpuesto(
                                  product,
                                  resumeInvoiceObject
                                ) /
                                  product.QTY
                              : product.PRICE;

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 5 " +
                            posY +
                            " " +
                            product.SKU +
                            "\r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 150 " +
                            posY +
                            " " +
                            (product.SKU_NAME.length > 30
                              ? product.SKU_NAME.substring(0, 25) + "..."
                              : product.SKU_NAME) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 0 2 15 " +
                            posY +
                            " " +
                            (format_number(
                              product.QTY,
                              configuracionDecimales.defaultDisplayDecimalsForSkuQty
                            ) +
                              " " +
                              product.PACK_UNIT) +
                            "\r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 0 2 165 " +
                            posY +
                            " " +
                            format_number(
                              trunc_number(
                                skuPrice,
                                configuracionDecimales.defaultCalculationsDecimals
                              ),
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 0 2 0 " +
                            posY +
                            " " +
                            format_number(
                              skuPrice * product.QTY,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";
                        }

                        posY += 30;
                        invoicePrintFormat +=
                          "L 5 " + posY + " 570 " + posY + " 1\r\n";

                        if (facturaManejaImpuesto) {
                          switch (methodCalculationType) {
                            case "BY_ROW":
                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " BASE GRAVADA " +
                                etiquetaPorcentajeDeImpuesto +
                                "% \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  resumeInvoiceObject.baseGravada,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " BASE GRAVADA 18% \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  0,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " + posY + " BASE EXENTA \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  resumeInvoiceObject.exento,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " BASE EXONERADA \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  0,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " + posY + " SUB TOTAL \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  trunc_number(
                                    resumeInvoiceObject.subTotal,
                                    configuracionDecimales.defaultCalculationsDecimals
                                  ),
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              if (
                                Object.keys(muestraPorcentaje).length !== 0 &&
                                muestraPorcentaje.Value == 1
                              ) {
                                posY += 30;
                                invoicePrintFormat +=
                                  "LEFT 5 T 7 0 0 " + posY + " DESCUENTO \r\n";
                                invoicePrintFormat +=
                                  "LEFT 5 T 7 0 350 " +
                                  posY +
                                  " " +
                                  currencySymbol +
                                  ".\r\n";
                                invoicePrintFormat +=
                                  "RIGHT 550 T 7 0 0 " +
                                  posY +
                                  " " +
                                  format_number(
                                    0,
                                    configuracionDecimales.defaultDisplayDecimals
                                  ) +
                                  "\r\n";
                              }

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " " +
                                etiquetaTipoDeImpuesto +
                                " -" +
                                etiquetaPorcentajeDeImpuesto +
                                "%- \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  resumeInvoiceObject.impuesto,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " + posY + " ISV -18%- \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  0,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " TOTAL A PAGAR \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  resumeInvoiceObject.total,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              break;

                            case "BY_TOTAL_AMOUNT":
                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " BASE GRAVADA " +
                                etiquetaPorcentajeDeImpuesto +
                                "%- \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  resumeInvoiceObject.baseGravada,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " BASE GRAVADA 18% \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  0,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " + posY + " BASE EXENTA \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  resumeInvoiceObject.exento,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " BASE EXONERADA \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  0,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " + posY + " SUB TOTAL \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  trunc_number(
                                    results.rows.item(0).TOTAL_AMOUNT -
                                      impuestoDeFactura,
                                    configuracionDecimales.defaultCalculationsDecimals
                                  ),
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              if (
                                Object.keys(muestraPorcentaje).length !== 0 &&
                                muestraPorcentaje.Value == 1
                              ) {
                                posY += 30;
                                invoicePrintFormat +=
                                  "LEFT 5 T 7 0 0 " + posY + " DESCUENTO \r\n";
                                invoicePrintFormat +=
                                  "LEFT 5 T 7 0 350 " +
                                  posY +
                                  " " +
                                  currencySymbol +
                                  ".\r\n";
                                invoicePrintFormat +=
                                  "RIGHT 550 T 7 0 0 " +
                                  posY +
                                  " " +
                                  format_number(
                                    0,
                                    configuracionDecimales.defaultDisplayDecimals
                                  ) +
                                  "\r\n";
                              }

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " +
                                posY +
                                " " +
                                etiquetaTipoDeImpuesto +
                                " -" +
                                etiquetaPorcentajeDeImpuesto +
                                "%- \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  impuestoDeFactura,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              posY += 30;
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 0 " + posY + " TOTAL \r\n";
                              invoicePrintFormat +=
                                "LEFT 5 T 7 0 350 " +
                                posY +
                                " " +
                                currencySymbol +
                                ".\r\n";
                              invoicePrintFormat +=
                                "RIGHT 550 T 7 0 0 " +
                                posY +
                                " " +
                                format_number(
                                  results.rows.item(0).TOTAL_AMOUNT,
                                  configuracionDecimales.defaultDisplayDecimals
                                ) +
                                "\r\n";

                              break;
                          }
                        } else {
                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " +
                            posY +
                            " BASE GRAVADA " +
                            etiquetaPorcentajeDeImpuesto +
                            "%- \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              resumeInvoiceObject.baseGravada,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " + posY + " BASE GRAVADA 18% \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              0,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " + posY + " BASE EXENTA \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              0,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " + posY + " BASE EXONERADA \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              0,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " + posY + " SUB TOTAL \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              results.rows.item(0).TOTAL_AMOUNT,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          if (
                            Object.keys(muestraPorcentaje).length !== 0 &&
                            muestraPorcentaje.Value == 1
                          ) {
                            posY += 30;
                            invoicePrintFormat +=
                              "LEFT 5 T 7 0 0 " + posY + " DESCUENTO \r\n";
                            invoicePrintFormat +=
                              "LEFT 5 T 7 0 350 " +
                              posY +
                              " " +
                              currencySymbol +
                              ".\r\n";
                            invoicePrintFormat +=
                              "RIGHT 550 T 7 0 0 " +
                              posY +
                              " " +
                              format_number(
                                discount,
                                configuracionDecimales.defaultDisplayDecimals
                              ) +
                              "\r\n";
                          }

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " +
                            posY +
                            " " +
                            etiquetaTipoDeImpuesto +
                            " -" +
                            etiquetaPorcentajeDeImpuesto +
                            "%- \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              0,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " + posY + " ISV -18%- \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              0,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " + posY + " TOTAL A PAGAR \r\n";
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 350 " +
                            posY +
                            " " +
                            currencySymbol +
                            ".\r\n";
                          invoicePrintFormat +=
                            "RIGHT 550 T 7 0 0 " +
                            posY +
                            " " +
                            format_number(
                              results.rows.item(0).TOTAL_AMOUNT,
                              configuracionDecimales.defaultDisplayDecimals
                            ) +
                            "\r\n";
                        }

                        //Pie de factura --------------------------------------------------------------------------------------------------------------------------------------------------------------------

                        var totalInvoicedInWords =
                          numberToWord(
                            results.rows.item(0).TOTAL_AMOUNT
                          ).toUpperCase() +
                          " " +
                          localStorage.getItem("NAME_CURRENCY");

                        if (totalInvoicedInWords.length > 45) {
                          posY += 50;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " +
                            posY +
                            " " +
                            totalInvoicedInWords.substring(0, 46) +
                            " \r\n";

                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " +
                            posY +
                            " " +
                            totalInvoicedInWords.substring(
                              46,
                              totalInvoicedInWords.length
                            ) +
                            " \r\n";
                        } else {
                          posY += 50;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " +
                            posY +
                            " " +
                            totalInvoicedInWords +
                            " \r\n";
                        }

                        posY += 30;
                        invoicePrintFormat +=
                          "L 5 " + posY + " 570 " + posY + " 1\r\n";

                        posY += 25;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " No. ORDEN COMPRA EXENTA: \r\n";

                        posY += 20;
                        invoicePrintFormat +=
                          "LEFT 35 L 285 " + posY + " 550 " + posY + " 1 \r\n";

                        posY += 20;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " No. REGISTRO EXONERADOS: \r\n";

                        posY += 20;
                        invoicePrintFormat +=
                          "LEFT 35 L 280 " + posY + " 550 " + posY + " 1 \r\n";

                        posY += 20;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " No. REGISTRO S.A.G.: \r\n";

                        posY += 20;
                        invoicePrintFormat +=
                          "LEFT 35 L 235 " + posY + " 550 " + posY + " 1 \r\n";

                        posY += 50;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " +
                          posY +
                          " FORMA DE PAGO: " +
                          (creditAmount && creditAmount > 0
                            ? "Crédito"
                            : "Contado") +
                          " \r\n";
                        if (creditAmount && creditAmount > 0) {
                          posY += 30;
                          invoicePrintFormat +=
                            "LEFT 5 T 7 0 0 " +
                            posY +
                            " FECHA DE VENCIMIENTO: " +
                            (results.rows.item(0).DUE_DATE
                              ? results.rows.item(0).DUE_DATE.split(" ")[0]
                              : getDateTime()) +
                            " \r\n";
                        }

                        posY += 150;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " + posY + " FIRMA: \r\n";

                        posY += 20;
                        invoicePrintFormat +=
                          "LEFT 35 L 70 " + posY + " 550 " + posY + " 1 \r\n";

                        posY += 50;
                        invoicePrintFormat +=
                          "CENTER 550 T 7 0 0 " +
                          posY +
                          " GRACIAS POR SU COMPRA \r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "CENTER 550 T 7 0 0 " +
                          posY +
                          " LA FACTURA ES BENEFICIO DE TODOS, EXIJALA \r\n";

                        posY += 30;
                        invoicePrintFormat +=
                          "CENTER 550 T 7 0 0 " +
                          posY +
                          " ORIGINAL: Cliente - COPIA: Emisor \r\n";

                        posY += 40;
                        invoicePrintFormat +=
                          "CENTER 550 T 7 0 0 " +
                          posY +
                          "  " +
                          isReprint +
                          " \r\n";

                        invoicePrintFormat += "PRINT\r\n";

                        invoicePrintFormat = invoicePrintFormat.replace(
                          "_DocLength_",
                          (posY + 200).toString()
                        );

                        bluetoothSerial.write(
                          invoicePrintFormat,
                          function() {
                            callback();
                          },
                          function() {
                            my_dialog("", "", "close");
                            notify(
                              "Lo sentimos no se pudo imprimir el documento..."
                            );
                            callback();
                          }
                        );

                        my_dialog("", "", "close");
                      },
                      function(err) {
                        my_dialog("", "", "close");
                        notify("ERROR, 8.1.17: " + err.code);
                        return err.code;
                      }
                    );
                  });
                  my_dialog("", "", "close");
                }
              );
            },
            error => {
              notify(
                "Error al obtener parámetro para la longitud del numero: " +
                  error
              );
            }
          );
        },
        error => {
          notify(
            "Error al obtener parámetro para la longitud del numero: " + error
          );
        }
      );
    });
  } catch (e) {
    notify("printinvoice_joininfo: " + e.message);
    my_dialog("", "", "close");
    return e.message;
  }
}

function formatoDeImpresionSaritaHonduras(
  invoiceId,
  isReprint,
  callback,
  esCopia
) {
  var invoicePrintFormat = "";
  var resultados;
  var facturaManejaImpuesto = false;
  var impuestoDeFactura = 0,
    posY = 0;
  var fecha;

  var etiquetaTipoDeImpuesto = localStorage.getItem("TAX_LABEL_ID");
  var etiquetaDeImpuesto = localStorage.getItem("TAX_ID");
  var etiquetaDeResolucion = localStorage.getItem("TAX_RESOLUTION_ID");
  var etiquetaPorcentajeDeImpuesto = localStorage.getItem("TAX_PERCENT");

  try {
    var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();

    var muestraPorcentaje = {};
    ParametroServicio.ObtenerParametro(
      "INVOICE",
      "SHOW_PERCENTAGE_INVOICE",
      function(parametro) {
        muestraPorcentaje = parametro;
      },
      function(error) {
        notify(
          "Error al obtener parámetro para impresión de porcentaje: " +
            error.message
        );
      }
    );

    calcularImpuestoPorLineaDeFactura(function(resumenDefactura) {
      resumeInvoiceObject = resumenDefactura;

      configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
        function(configuracionDecimales) {
          var pSql =
            "SELECT IFNULL(IH.DISCOUNT,0) AS DISCOUNT_HEADER, IH.*, ID.*, IFNULL(T.TASK_ADDRESS, '') TASK_ADDRESS ";
          pSql +=
            " FROM INVOICE_HEADER IH INNER JOIN INVOICE_DETAIL ID ON IH.INVOICE_NUM = ID.INVOICE_NUM ";
          pSql +=
            " LEFT JOIN TASK T ON T.RELATED_CLIENT_CODE = IH.CLIENT_ID AND T.TASK_TYPE = 'SALE'  ";
          pSql +=
            " WHERE IH.IS_CREDIT_NOTE = 0 AND IH.INVOICE_NUM = " + invoiceId;

          SONDA_DB_Session.transaction(function(tx) {
            tx.executeSql(
              pSql,
              [],
              function(tx, results) {
                resultados = results;
                var discount = results.rows.item(0).DISCOUNT_HEADER;
                var discountAmount =
                  discount > 0
                    ? (discount / 100) * results.rows.item(0).TOTAL_AMOUNT
                    : 0;
                var creditAmount = results.rows.item(0).CREDIT_AMOUNT;

                if (
                  results.rows.item(0).HANDLE_TAX === 1 ||
                  results.rows.item(0).HANDLE_TAX === "1"
                ) {
                  facturaManejaImpuesto = true;
                  methodCalculationType = localStorage.getItem(
                    "METHOD_CALCULATION_TAX"
                  );
                  impuestoDeFactura = results.rows.item(0).TAX_PERCENT;
                }

                var pRes = localStorage.getItem("POS_SAT_RESOLUTION");

                invoicePrintFormat = "! 0 50 50 _DocLength_ 1\r\n";
                invoicePrintFormat += "! U1 LMARGIN 10\r\n";
                invoicePrintFormat += "! U\r\n";
                invoicePrintFormat += "! U1 PAGE-WIDTH 1400\r\n";
                invoicePrintFormat += "ON-FEED IGNORE\r\n";

                //Informacion de la empresa-----------------------------------------------------------------------------------------------

                posY += 5;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " + posY + " " + gCompanyName + "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " + posY + " " + gBranchName + "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " +
                  posY +
                  " " +
                  localStorage.getItem("direccionFacturacion01") +
                  "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " +
                  posY +
                  " " +
                  localStorage.getItem("direccionFacturacion02") +
                  "\r\n";

                if (localStorage.getItem("direccionFacturacion03").length > 0) {
                  posY += 30;
                  invoicePrintFormat +=
                    "CENTER 550 T 7 0 0 " +
                    posY +
                    " " +
                    localStorage.getItem("direccionFacturacion03") +
                    "\r\n";
                }

                if (localStorage.getItem("direccionFacturacion04").length > 0) {
                  posY += 30;
                  invoicePrintFormat +=
                    "CENTER 550 T 7 0 0 " +
                    posY +
                    " " +
                    localStorage.getItem("direccionFacturacion04") +
                    "\r\n";
                }

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " +
                  posY +
                  " " +
                  localStorage.getItem("correoElectronicoEmpresa") +
                  "\r\n";

                if (localStorage.getItem("telefonoEmpresa").length > 0) {
                  posY += 30;
                  invoicePrintFormat +=
                    "CENTER 550 T 7 0 0 " +
                    posY +
                    "  " +
                    localStorage.getItem("telefonoEmpresa") +
                    "\r\n";
                }

                posY += 30;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " +
                  posY +
                  " " +
                  etiquetaDeImpuesto +
                  ": " +
                  localStorage.getItem("NitEnterprise") +
                  " \r\n";

                posY += 25;
                invoicePrintFormat += "L 5 " + posY + " 570 " + posY + " 1\r\n";

                //Informacion de resolucion de facturacion (CAI) -------------------------------------------------------------------------------------------

                posY += 10;
                var fechaCreacion = new Date(
                  results.rows.item(0).POSTED_DATETIME
                );
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " +
                  posY +
                  " Impreso el " +
                  ((fechaCreacion.getDate() < 10
                    ? "0" + fechaCreacion.getDate()
                    : fechaCreacion.getDate()) +
                    " de " +
                    obtenerNombreDelMes(fechaCreacion.getMonth() + 1) +
                    " de " +
                    fechaCreacion.getFullYear()) +
                  " \r\n";

                posY += 30;
                invoicePrintFormat += "SETBOLD 1\r\n";
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " FACTURA No.: " +
                  (results.rows.item(0).SAT_SERIE +
                    rellenarPalabra(8, "0", invoiceId.toString())) +
                  "\r\n";
                invoicePrintFormat += "SETBOLD 0\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " " +
                  etiquetaDeResolucion +
                  ": " +
                  pRes +
                  " \r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " RANGO AUTORIZADO DE FACTURAS \r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " INICIAL: " +
                  (results.rows.item(0).SAT_SERIE +
                    rellenarPalabra(8, "0", pCurrentSAT_Res_DocStart)) +
                  " \r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " FINAL: " +
                  (results.rows.item(0).SAT_SERIE +
                    rellenarPalabra(8, "0", pCurrentSAT_Res_DocFinish)) +
                  " \r\n";

                var fechaLimite = new Date(
                  localStorage.getItem("SAT_RES_EXPIRE")
                );

                var diaL = fechaLimite.getDate();
                var mesL = fechaLimite.getMonth() + 1;
                var añoL = fechaLimite.getFullYear();

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " FECHA LIMITE DE EMISION: " +
                  (diaL < 10 ? "0" + diaL : diaL) +
                  "/" +
                  (mesL < 10 ? "0" + mesL : mesL) +
                  "/" +
                  añoL +
                  " \r\n";

                posY += 20;
                invoicePrintFormat += "L 5 " + posY + " 570 " + posY + " 1\r\n";

                //Informacion del comprador -----------------------------------------------------------------------------------
                cortarLineaDeTexto(
                  results.rows.item(0).CLIENT_ID +
                    "/" +
                    results.rows.item(0).CLIENT_NAME,
                  35
                ).forEach(function(linea, numeroDeLinea) {
                  posY += numeroDeLinea > 0 ? 18 : 10;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " +
                    posY +
                    (numeroDeLinea === 0 ? " CLIENTE: " : " ") +
                    linea +
                    "\r\n";
                });

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " " +
                  etiquetaDeImpuesto +
                  ": " +
                  results.rows.item(0).ERP_INVOICE_ID +
                  "\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " VENDEDOR: " +
                  (gCurrentRoute + "/" + localStorage.getItem("NAME_USER")) +
                  "\r\n";

                posY += 40;
                invoicePrintFormat += "L 5 " + posY + " 570 " + posY + " 1\r\n";

                //Informacion de Productos comprados ---------------------------------------------------------------------------------------------------------
                posY += 30;
                invoicePrintFormat += "LEFT 5 T 7 0 5 " + posY + " CODIGO\r\n";
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 150 " + posY + " DESCRIPCION\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 15 " + posY + " CANTIDAD\r\n";
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 165 " + posY + " PRECIO UNIT.\r\n";

                invoicePrintFormat +=
                  "LEFT 5 T 7 0 325 " + posY + " DESCUENTO\r\n";

                invoicePrintFormat +=
                  "RIGHT 550 T 7 0 0 " + posY + " TOTAL\r\n";

                posY += 40;
                invoicePrintFormat += "L 5 " + posY + " 570 " + posY + " 1\r\n";

                var i;
                for (i = 0; i <= results.rows.length - 1; i++) {
                  var product = results.rows.item(i);

                  var skuPrice =
                    facturaManejaImpuesto && methodCalculationType == "BY_ROW"
                      ? product.PRICE -
                        obtenerValorADescontarEnBaseaImpuesto(
                          product,
                          resumeInvoiceObject
                        ) /
                          product.QTY
                      : product.PRICE;

                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 5 " + posY + " " + product.SKU + "\r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 150 " +
                    posY +
                    " " +
                    (product.SKU_NAME.length > 30
                      ? product.SKU_NAME.substring(0, 25) + "..."
                      : product.SKU_NAME) +
                    "\r\n";

                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 0 2 15 " +
                    posY +
                    " " +
                    (format_number(
                      product.QTY,
                      configuracionDecimales.defaultDisplayDecimalsForSkuQty
                    ) +
                      " " +
                      product.PACK_UNIT) +
                    "\r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 0 2 165 " +
                    posY +
                    " " +
                    format_number(
                      trunc_number(
                        skuPrice,
                        configuracionDecimales.defaultCalculationsDecimals
                      ),
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";

                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 325 " +
                    posY +
                    " " +
                    format_number(
                      product.DISCOUNT ? product.DISCOUNT : 0,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";

                  invoicePrintFormat +=
                    "RIGHT 550 T 0 2 0 " +
                    posY +
                    " " +
                    format_number(
                      skuPrice * product.QTY,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";
                }

                posY += 20;
                invoicePrintFormat += "L 5 " + posY + " 570 " + posY + " 1\r\n";

                if (facturaManejaImpuesto) {
                  switch (methodCalculationType) {
                    case "BY_ROW":
                      posY += 10;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " EXENTO \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          resumeInvoiceObject.exento,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " SUB TOTAL \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          trunc_number(
                            resumeInvoiceObject.subTotal,
                            configuracionDecimales.defaultCalculationsDecimals
                          ),
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      // if (
                      //   Object.keys(muestraPorcentaje).length !== 0 &&
                      //   muestraPorcentaje.Value == 1
                      // ) {
                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " DESCUENTO \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          discount,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";
                      //}

                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " +
                        posY +
                        " " +
                        etiquetaTipoDeImpuesto +
                        " -" +
                        etiquetaPorcentajeDeImpuesto +
                        "%- \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          resumeInvoiceObject.impuesto,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " TOTAL \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          resumeInvoiceObject.total,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      break;

                    case "BY_TOTAL_AMOUNT":
                      posY += 10;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " EXENTO \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          resumeInvoiceObject.exento,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " SUB TOTAL \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          trunc_number(
                            results.rows.item(0).TOTAL_AMOUNT -
                              impuestoDeFactura,
                            configuracionDecimales.defaultCalculationsDecimals
                          ),
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      if (
                        Object.keys(muestraPorcentaje).length !== 0 &&
                        muestraPorcentaje.Value == 1
                      ) {
                        posY += 30;
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 0 " + posY + " DESCUENTO \r\n";
                        invoicePrintFormat +=
                          "LEFT 5 T 7 0 350 " +
                          posY +
                          " " +
                          currencySymbol +
                          ".\r\n";
                        invoicePrintFormat +=
                          "RIGHT 550 T 7 0 0 " +
                          posY +
                          " " +
                          format_number(
                            0,
                            configuracionDecimales.defaultDisplayDecimals
                          ) +
                          "\r\n";
                      }

                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " +
                        posY +
                        " " +
                        etiquetaTipoDeImpuesto +
                        " -" +
                        etiquetaPorcentajeDeImpuesto +
                        "%- \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          impuestoDeFactura,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      posY += 30;
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 0 " + posY + " TOTAL \r\n";
                      invoicePrintFormat +=
                        "LEFT 5 T 7 0 350 " +
                        posY +
                        " " +
                        currencySymbol +
                        ".\r\n";
                      invoicePrintFormat +=
                        "RIGHT 550 T 7 0 0 " +
                        posY +
                        " " +
                        format_number(
                          results.rows.item(0).TOTAL_AMOUNT,
                          configuracionDecimales.defaultDisplayDecimals
                        ) +
                        "\r\n";

                      break;
                  }
                } else {
                  posY += 10;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " + posY + " EXENTO \r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 350 " + posY + " " + currencySymbol + ".\r\n";
                  invoicePrintFormat +=
                    "RIGHT 550 T 7 0 0 " +
                    posY +
                    " " +
                    format_number(
                      0,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";

                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " + posY + " SUB TOTAL \r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 350 " + posY + " " + currencySymbol + ".\r\n";
                  invoicePrintFormat +=
                    "RIGHT 550 T 7 0 0 " +
                    posY +
                    " " +
                    format_number(
                      results.rows.item(0).TOTAL_AMOUNT,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";

                  // if (
                  //   Object.keys(muestraPorcentaje).length !== 0 &&
                  //   muestraPorcentaje.Value == 1
                  // ) {
                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " + posY + " DESCUENTO \r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 350 " + posY + " " + currencySymbol + ".\r\n";
                  invoicePrintFormat +=
                    "RIGHT 550 T 7 0 0 " +
                    posY +
                    " " +
                    format_number(
                      discount,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";
                  //}

                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " +
                    posY +
                    " " +
                    etiquetaTipoDeImpuesto +
                    " -" +
                    etiquetaPorcentajeDeImpuesto +
                    "%- \r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 350 " + posY + " " + currencySymbol + ".\r\n";
                  invoicePrintFormat +=
                    "RIGHT 550 T 7 0 0 " +
                    posY +
                    " " +
                    format_number(
                      0,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";

                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " + posY + " TOTAL \r\n";
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 350 " + posY + " " + currencySymbol + ".\r\n";
                  invoicePrintFormat +=
                    "RIGHT 550 T 7 0 0 " +
                    posY +
                    " " +
                    format_number(
                      results.rows.item(0).TOTAL_AMOUNT,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "\r\n";
                }

                //Pie de factura --------------------------------------------------------------------------------------------------------------------------------------------------------------------

                var totalInvoicedInWords =
                  numberToWord(
                    results.rows.item(0).TOTAL_AMOUNT
                  ).toUpperCase() +
                  " " +
                  localStorage.getItem("NAME_CURRENCY");

                if (totalInvoicedInWords.length > 45) {
                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " +
                    posY +
                    " " +
                    totalInvoicedInWords.substring(0, 46) +
                    " \r\n";

                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " +
                    posY +
                    " " +
                    totalInvoicedInWords.substring(
                      46,
                      totalInvoicedInWords.length
                    ) +
                    " \r\n";
                } else {
                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " +
                    posY +
                    " " +
                    totalInvoicedInWords +
                    " \r\n";
                }

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " FORMA DE PAGO: " +
                  (creditAmount && creditAmount > 0 ? "Crédito" : "Contado") +
                  " \r\n";
                if (creditAmount && creditAmount > 0) {
                  posY += 30;
                  invoicePrintFormat +=
                    "LEFT 5 T 7 0 0 " +
                    posY +
                    " FECHA DE VENCIMIENTO: " +
                    (results.rows.item(0).DUE_DATE
                      ? results.rows.item(0).DUE_DATE.split(" ")[0]
                      : getDateTime()) +
                    " \r\n";
                }

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " + posY + " No. Correlativo exento:\r\n";
                invoicePrintFormat +=
                  "L 325 " + (posY + 20) + " 570 " + (posY + 20) + " 1\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " + posY + " No. Correlativo exonerado:\r\n";
                invoicePrintFormat +=
                  "L 325 " + (posY + 20) + " 570 " + (posY + 20) + " 1\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " + posY + " No. Registro S.A.G. :\r\n";
                invoicePrintFormat +=
                  "L 325 " + (posY + 20) + " 570 " + (posY + 20) + " 1\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " + posY + " ORIGINAL: CLIENTE\r\n";

                posY += 30;
                invoicePrintFormat +=
                  "LEFT 5 T 7 0 0 " +
                  posY +
                  " COPIA: Obligado tributario emisor\r\n";

                posY += 40;
                invoicePrintFormat += "LEFT 5 T 7 0 0 " + posY + " FIRMA: \r\n";

                posY += 20;
                invoicePrintFormat +=
                  "LEFT 35 L 70 " + posY + " 570 " + posY + " 1 \r\n";

                // posY += 10;
                // if (esCopia === 1) {
                //   invoicePrintFormat += "CENTER 550 T 7 0 0 " + posY + " *Copia (Contabilidad)\r\n";
                // } else {
                //   invoicePrintFormat += "CENTER 550 T 7 0 0 " + posY + " *Original (Cliente)\r\n";
                // }

                posY += 20;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " + posY + " GRACIAS POR SU COMPRA \r\n";

                posY += 20;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " +
                  posY +
                  " LA FACTURA ES BENEFICIO DE TODOS, EXIJALA \r\n";

                posY += 20;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " + posY + " www.heladosarita.com \r\n";

                posY += 18;
                invoicePrintFormat +=
                  "CENTER 550 T 7 0 0 " + posY + "  " + isReprint + " \r\n";

                invoicePrintFormat += "PRINT\r\n";

                invoicePrintFormat = invoicePrintFormat.replace(
                  "_DocLength_",
                  (posY + 70).toString()
                );

                bluetoothSerial.write(
                  invoicePrintFormat,
                  function() {
                    my_dialog("", "", "close");
                    callback();
                  },
                  function() {
                    my_dialog("", "", "close");
                    notify("Lo sentimos no se pudo imprimir el documento...");
                    callback();
                  }
                );
              },
              function(err) {
                my_dialog("", "", "close");
                console.log("Lo sentimos no se pudo imprimir el documento...");
                console.dir(err);
                notify("Lo sentimos no se pudo imprimir el documento.");
                callback();
              }
            );
          });
          my_dialog("", "", "close");
        }
      );
    });
  } catch (e) {
    notify("Lo sentimos no se pudo imprimir el documento. Error: " + e.message);
    my_dialog("", "", "close");
  }
}

function obtenerValorADescontarEnBaseaImpuesto(product, resumeInvoiceObject) {
  var sku = resumeInvoiceObject.skusDeDetalle.find(function(skuDetalle) {
    return (
      skuDetalle.SKU == product.SKU && skuDetalle.PACK_UNIT == product.PACK_UNIT
    );
  });

  if (sku && sku.TAX_VALUE > 0) {
    return sku.TAX;
  } else {
    return 0;
  }
}

function printinvoice(pInvoice, pIsRePrinted, callBack) {
  try {
    my_dialog("Imprimiendo Factura", "#" + pInvoice + " Espere...", "open");
    var to;
    var procesarImpresionDeFactura = function(invoiceId, isReprint, callback) {
      switch (localStorage.getItem("PRINT_FORMAT")) {
        case "GT-STANDARD":
          printinvoice_joininfo(
            invoiceId,
            isReprint,
            function() {
              callback();
            },
            0
          );

          to = setTimeout(function() {
            printinvoice_joininfo(invoiceId, isReprint, function() {}, 1);
            clearTimeout(to);
          }, 2000);

          break;

        case "HN-STANDARD":
          formatoImpresionHonduras(
            invoiceId,
            isReprint,
            function() {
              callback();
            },
            0
          );

          to = setTimeout(function() {
            formatoImpresionHonduras(invoiceId, isReprint, function() {}, 1);
            clearTimeout(to);
          }, 2000);

          break;

        case "HN-STANDARD-DIPROCOM":
          formatoDeImpresionDiprocom(
            invoiceId,
            isReprint,
            function() {
              callback();
            },
            0
          );

          to = setTimeout(function() {
            formatoDeImpresionDiprocom(invoiceId, isReprint, function() {}, 1);
            clearTimeout(to);
          }, 2000);

          break;

        case "HN-STANDARD-SARITA":
          formatoDeImpresionSaritaHonduras(
            invoiceId,
            isReprint,
            function() {
              callback();
            },
            0
          );

          to = setTimeout(function() {
            formatoDeImpresionSaritaHonduras(
              invoiceId,
              isReprint,
              function() {},
              1
            );
            clearTimeout(to);
          }, 2000);

          break;

        default:
          printinvoice_joininfo(
            invoiceId,
            isReprint,
            function() {
              callback();
            },
            0
          );

          to = setTimeout(function() {
            printinvoice_joininfo(invoiceId, isReprint, function() {}, 1);
            clearTimeout(to);
          }, 2000);

          break;
      }
    };

    bluetoothSerial.isConnected(
      function() {
        procesarImpresionDeFactura(pInvoice, pIsRePrinted, callBack);
      },
      function() {
        try {
          bluetoothSerial.connect(
            gPrintAddress,
            function() {
              procesarImpresionDeFactura(pInvoice, pIsRePrinted, callBack);
            },
            function() {
              my_dialog("", "", "close");
              notify(
                "ERROR, Unable to connect to the printer.(" +
                  gPrintAddress +
                  ")"
              );
            }
          );
        } catch (e) {
          my_dialog("", "", "close");
          notify("printinvoice: " + e.message);
        }
      }
    );
  } catch (e) {
    my_dialog("", "", "close");
    alert("cannot print " + e.message);
  }
}
function onBatteryStatus(info) {
  // Handle the online event
  gBatteryLevel = info.level;
  $("#lblBattLevel").text(gBatteryLevel + "%");
  $("#lblBattLevel").buttonMarkup({ icon: "eye" });
  $("#lblBattLevel").css("color", "white");

  $("#lblBattLevelMenu").text(gBatteryLevel + "%");
  $("#lblBattLevelMenu").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelMenu").css("color", "white");

  $("#lblBattLevelCust").text(gBatteryLevel + "%");
  $("#lblBattLevelCust").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelCust").css("color", "white");

  $("#lblBattLevelSkusPOS").text(gBatteryLevel + "%");
  $("#lblBattLevelSkusPOS").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelSkusPOS").css("color", "white");

  $("#lblBattLevelSkusPOS_1").text(gBatteryLevel + "%");
  $("#lblBattLevelSkusPOS_1").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelSkusPOS_1").css("color", "white");

  $("#lblBattLevelLogin").text(gBatteryLevel + "%");
  $("#lblBattLevelLogin").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelLogin").css("color", "white");

  //--
  $("#lblBattLevelDevolucion").text(gBatteryLevel + "%");
  $("#lblBattLevelDevolucion").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelDevolucion").css("color", "white");

  // dato de estadistica page
  $("#lblBattLevelEstadistica").text(gBatteryLevel + "%");
  $("#lblBattLevelEstadistica").buttonMarkup({ icon: "eye" });
  $("#lblBattLevelEstadistica").css("color", "white");
}
function onBatteryCritical(info) {
  // Handle the battery critical event
  gBatteryLevel = info.level;
  $("#lblBattLevel").text(gBatteryLevel + "%");
  $("#lblBattLevel").css("color", "red");
  $("#lblBattLevel").buttonMarkup({ icon: "delete" });

  $("#lblBattLevelMenu").text(gBatteryLevel + "%");
  $("#lblBattLevelMenu").buttonMarkup({ icon: "delete" });
  $("#lblBattLevelMenu").css("color", "red");

  $("#lblBattLevelCust").text(gBatteryLevel + "%");
  $("#lblBattLevelCust").buttonMarkup({ icon: "delete" });
  $("#lblBattLevelCust").css("color", "red");

  $("#lblBattLevelSkusPOS").text(gBatteryLevel + "%");
  $("#lblBattLevelSkusPOS").buttonMarkup({ icon: "delete" });
  $("#lblBattLevelSkusPOS").css("color", "red");

  $("#lblBattLevelSkusPOS_1").text(gBatteryLevel + "%");
  $("#lblBattLevelSkusPOS_1").buttonMarkup({ icon: "delete" });
  $("#lblBattLevelSkusPOS_1").css("color", "red");

  //--
  $("#lblBattLevelDevolucion").text(gBatteryLevel + "%");
  $("#lblBattLevelDevolucion").buttonMarkup({ icon: "delete" });
  $("#lblBattLevelDevolucion").css("color", "red");

  // dato de estadistica page
  $("#lblBattLevelEstadistica").text(gBatteryLevel + "%");
  $("#lblBattLevelEstadistica").buttonMarkup({ icon: "delete" });
  $("#lblBattLevelEstadistica").css("color", "red");

  notify("Battery Level Critical " + info.level + "%\n Recarge pronto!");
}
function onBatteryLow(info) {
  // Handle the battery low event
  gBatteryLevel = info.level;
  $("#lblBattLevel").text(gBatteryLevel + "%");
  $("#lblBattLevel").css("color", "yellow");
  $("#lblBattLevel").buttonMarkup({ icon: "alert" });

  $("#lblBattLevelMenu").text(gBatteryLevel + "%");
  $("#lblBattLevelMenu").buttonMarkup({ icon: "alert" });
  $("#lblBattLevelMenu").css("color", "yellow");

  $("#lblBattLevelCust").text(gBatteryLevel + "%");
  $("#lblBattLevelCust").buttonMarkup({ icon: "alert" });
  $("#lblBattLevelCust").css("color", "yellow");

  $("#lblBattLevelSkusPOS").text(gBatteryLevel + "%");
  $("#lblBattLevelSkusPOS").buttonMarkup({ icon: "alert" });
  $("#lblBattLevelSkusPOS").css("color", "yellow");

  $("#lblBattLevelSkusPOS_1").text(gBatteryLevel + "%");
  $("#lblBattLevelSkusPOS_1").buttonMarkup({ icon: "alert" });
  $("#lblBattLevelSkusPOS_1").css("color", "yellow");

  //alert("Battery Level Low " + info.level + "%");

  // dato de estadistica page
  $("#lblBattLevelEstadistica").text(gBatteryLevel + "%");
  $("#lblBattLevelEstadistica").buttonMarkup({ icon: "alert" });
  $("#lblBattLevelEstadistica").css("color", "yellow");
}
function ShowInventoryPage() {
  $.mobile.changePage("#inv_page", {
    transition: "none",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });

  PopulateInvGrid();
}
function ShowInvoiceListPage() {
  listallinvoices();
  $.mobile.changePage("#invoice_list_page", {
    transition: "pop",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}

function ShowTaskOutOfRoutePlanPage() {
  limpiarFiltro();
  $.mobile.changePage("#UiNewTaskOutsideOfRoutePlanPage", {
    transition: "slide",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}

function listallinvoices() {
  try {
    var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
    configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
      function(configuracionDecimales) {
        var telephoneNumber = "";
        SONDA_DB_Session.transaction(
          function(tx) {
            var vLI = "";

            var sql =
              "SELECT * FROM INVOICE_HEADER AS IH " +
              "WHERE IH.IS_CREDIT_NOTE = 0 " +
              "ORDER BY IH.INVOICE_NUM";
            tx.executeSql(
              sql,
              [],
              function(tx, results) {
                $("#invoiceslist_listview")
                  .children()
                  .remove("li");
                $("#invoiceslist_listview").listview();
                var xonclick1 = "";
                for (var i = 0; i <= results.rows.length - 1; i++) {
                  var pIS_POSTED = results.rows.item(i).IS_POSTED;
                  var pSTATUS = results.rows.item(i).STATUS;
                  telephoneNumber = results.rows.item(i).TELEPHONE_NUMBER;
                  var isFromDeliveryNote = results.rows.item(i)
                    .IS_FROM_DELIVERY_NOTE;
                  var isContingencyDocument = results.rows.item(i)
                    .IS_CONTINGENCY_DOCUMENT;
                  var taskId = results.rows.item(i).TASK_ID;
                  var validationResult = results.rows.item(i).VALIDATION_RESULT;

                  try {
                    var pcName = results.rows.item(i).CLIENT_NAME.trim();

                    xonclick1 =
                      "showInvoiceActions(" +
                      results.rows.item(i).INVOICE_NUM +
                      "," +
                      format_number(
                        results.rows.item(i).TOTAL_AMOUNT,
                        configuracionDecimales.defaultDisplayDecimals
                      ) +
                      ",'" +
                      pcName.trim() +
                      "'," +
                      results.rows.item(i).IS_PAID_CONSIGNMENT +
                      "," +
                      (telephoneNumber === "" ? "''" : telephoneNumber) +
                      "," +
                      (isFromDeliveryNote ? isFromDeliveryNote : 0) +
                      "," +
                      (isContingencyDocument ? isContingencyDocument : 0) +
                      "," +
                      taskId +
                      "," +
                      validationResult +
                      ");";
                  } catch (e) {
                    notify("listallinvoices.add.catch:" + e.message);
                  }

                  var xmsg;
                  if (results.rows.item(i).IS_POSTED === 2) {
                    xmsg =
                      "<img src='css/styles/images/icons-png/check-black.png'></img>";
                  } else {
                    xmsg =
                      "<img src='css/styles/images/icons-png/forbidden-black.png'></img>";
                  }

                  var imgDocType = "";
                  if (localStorage.getItem("IMPLEMENTS_FEL") === "true") {
                    let styles = [];
                    let properties = [];
                    styles.push("right: 0px;");
                    styles.push("width: 10%;");
                    styles.push("height: 24%;");
                    styles.push("position: absolute;");
                    styles.push("transform: rotate(-20deg);");
                    // properties.push("width='30'");
                    // properties.push("height='30'");
                    properties.push("style='" + styles.join(" ") + "'");
                    if (results.rows.item(i).VALIDATION_RESULT == 1) {
                      imgDocType =
                        "<img src='css/styles/images/icons-png/signed-doc.png' " +
                        properties.join(" ") +
                        "></img>";
                    } else {
                      if (results.rows.item(i).IS_CONTINGENCY_DOCUMENT === 1) {
                        imgDocType =
                          "<img src='css/styles/images/icons-png/contingency-doc.png' " +
                          properties.join(" ") +
                          "></img>";
                      }
                    }
                  }

                  vLI = "";
                  if (results.rows.item(i).STATUS == 3) {
                    vLI = '<li class="ui-nodisc-icon ui-alt-icon">';
                    vLI =
                      vLI +
                      '<p><span class="title" style="color:red">' +
                      xmsg +
                      " Factura #" +
                      results.rows.item(i).INVOICE_NUM +
                      " (Anulada)</span>" +
                      imgDocType +
                      "</p>";
                  } else {
                    vLI =
                      '<li class="ui-nodisc-icon ui-alt-icon" onclick="' +
                      xonclick1 +
                      '">';
                    if (
                      telephoneNumber !== null &&
                      telephoneNumber !== undefined
                    ) {
                      vLI =
                        vLI +
                        '<p><span class="title" style="color: green;">' +
                        xmsg +
                        " Factura #" +
                        results.rows.item(i).INVOICE_NUM +
                        " (" +
                        (results.rows.item(i).CREDIT_AMOUNT &&
                        results.rows.item(i).CREDIT_AMOUNT > 0
                          ? "Crédito"
                          : "Contado") +
                        ")</span>" +
                        imgDocType +
                        "</p>";
                    } else {
                      vLI =
                        vLI +
                        '<p><span class="title" style="color: red;">' +
                        xmsg +
                        " Factura #" +
                        results.rows.item(i).INVOICE_NUM +
                        " (" +
                        (results.rows.item(i).CREDIT_AMOUNT &&
                        results.rows.item(i).CREDIT_AMOUNT > 0
                          ? "Crédito"
                          : "Contado") +
                        ")</span>" +
                        imgDocType +
                        "</p>";
                    }
                  }

                  vLI =
                    vLI +
                    '<p><span class="medium">' +
                    results.rows.item(i).CLIENT_NAME +
                    "</span></p>";

                  vLI =
                    vLI +
                    '<p><span class="medium">' +
                    results.rows.item(i).POSTED_DATETIME +
                    "</span></p>";
                  vLI =
                    vLI +
                    '<p><span class="small-roboto ui-li-count">' +
                    currencySymbol +
                    ". " +
                    format_number(
                      results.rows.item(i).TOTAL_AMOUNT,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "</span></p>";
                  if (
                    results.rows.item(i).CONSIGNMENT_ID !== undefined &&
                    results.rows.item(i).CONSIGNMENT_ID !== null
                  ) {
                    facturaTieneConsignacion = true;
                    vLI +=
                      '<p><span class="small-roboto">Consignación: ' +
                      results.rows.item(i).CONSIGNMENT_ID +
                      "</span></p>";
                  } else {
                    facturaTieneConsignacion = false;
                  }
                  if (
                    telephoneNumber !== undefined &&
                    telephoneNumber !== null
                  ) {
                    vLI =
                      vLI +
                      '<p><span class="medium">Número Telefónico: ' +
                      results.rows.item(i).TELEPHONE_NUMBER +
                      "</span></p>";
                  } else {
                    vLI =
                      vLI +
                      '<p><span class="medium">Número Telefónico: SIN ASIGNAR </span></p>';
                  }
                  vLI = vLI + "</li>";
                  //alert(vLI);
                  try {
                    $("#invoiceslist_listview")
                      .append(vLI)
                      .trigger("create");
                    $("#invoiceslist_listview").listview("refresh");
                  } catch (ex) {
                    notify("listallinvoices: " + ex.message);
                  }
                }

                my_dialog("", "", "close");
              },
              function(err) {
                if (err.code !== 0) {
                  alert("Error processing SQL: " + err.code);
                }
              }
            );
          },
          function(err) {
            if (err.code !== 0) {
              alert("Error processing SQL: " + err.code);
            }
          }
        );
      }
    );
    my_dialog("", "", "close");
  } catch (e) {
    notify("listallinvoices: " + e.message);
  }
}
function showinvoicedetail(pInvoiceID) {
  try {
    var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
    configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
      function(configuracionDecimales) {
        var fieldSet = $("#fldDetailView");
        fieldSet.empty();

        SONDA_DB_Session.transaction(
          function(tx) {
            var vLI = "";
            tx.executeSql(
              "SELECT * FROM INVOICE_DETAIL WHERE INVOICE_NUM =" + pInvoiceID,
              [],
              function(tx, results) {
                for (i = 0; i <= results.rows.length - 1; i++) {
                  vLI = "";
                  vLI =
                    '<div data-role="collapsible" class="ui-nodisc-icon ui-alt-icon" data-mini="true" data-collapsed-icon="carat-d" data-expanded-icon="carat-u"  data-inset="true">';
                  vLI +=
                    '<h4><span class="small-roboto">' +
                    results.rows.item(i).SKU_NAME +
                    "</span></h4>";
                  vLI +=
                    '<ul data-role="listview" data-inset="false" data-count-theme="b">';
                  vLI +=
                    '<li><span class="medium">Cantidad: ' +
                    format_number(
                      results.rows.item(i).QTY,
                      configuracionDecimales.defaultDisplayDecimalsForSkuQty
                    ) +
                    "</span>";
                  vLI +=
                    '<span class="small-roboto ui-li-count">' +
                    currencySymbol +
                    ". " +
                    format_number(
                      results.rows.item(i).PRICE,
                      configuracionDecimales.defaultDisplayDecimals
                    ) +
                    "</span></li>";
                  vLI +=
                    '<li><span class="medium">Celular: ' +
                    results.rows.item(i).PHONE +
                    "</span></li>";
                  vLI +=
                    '<li><span class="medium">Serie: ' +
                    results.rows.item(i).SERIE +
                    "</span></li>";
                  vLI +=
                    '<li><span class="medium">#IMEI: ' +
                    results.rows.item(i).SERIE_2 +
                    "</span></li></ul></div>";
                  vLI += "";

                  fieldSet.append(vLI);
                }

                fieldSet.trigger("create");

                my_dialog("", "", "close");
              },
              function(err) {
                if (err.code != 0) {
                  alert("Error processing SQL: " + err.code);
                }
              }
            );
          },
          function(err) {
            if (err.code != 0) {
              alert("Error processing SQL: " + err.code);
            }
          },
          function() {
            if (facturaTieneConsignacion) {
              var contenedorSkus = $("#contenedorDetalleSkusConsignacion");
              contenedorSkus.css("display", "block");
              contenedorSkus = null;
              var sql = "";
              sql =
                "SELECT CH.CONSIGNMENT_ID FROM INVOICE_HEADER IH INNER JOIN CONSIGNMENT_HEADER CH ON (CH.CONSIGNMENT_BO_NUM = IH.CONSIGNMENT_ID) WHERE INVOICE_NUM = " +
                pInvoiceID;

              SONDA_DB_Session.transaction(
                function(tx) {
                  tx.executeSql(
                    sql,
                    [],
                    function(tx, results) {
                      if (results.rows.length > 0) {
                        var consignacionId = results.rows.item(0)
                          .CONSIGNMENT_ID;
                        ObtenerDetallePorConsignacion(
                          consignacionId,
                          null,
                          function(detalleConsignacion) {
                            if (detalleConsignacion.length > 0) {
                              var objetoUl = $("#UiListaSkusConsignacion");
                              objetoUl.children().remove("li");

                              for (
                                var i = 0;
                                i < detalleConsignacion.length;
                                i++
                              ) {
                                var itemDetalle = detalleConsignacion[i];
                                var li = "";

                                li = "<li>";
                                li += "<a href='#'>";
                                li +=
                                  "<h5>" +
                                  itemDetalle.SKU +
                                  " " +
                                  itemDetalle.SKU_NAME +
                                  "</h2>";
                                li += "<p>";
                                li +=
                                  "<strong>Cantidad: </strong> " +
                                  itemDetalle.QTY_CONSIGNMENT;
                                li +=
                                  "<strong> Precio: </strong> " +
                                  currencySymbol +
                                  ". " +
                                  format_number(
                                    itemDetalle.PRICE,
                                    configuracionDecimales.defaultDisplayDecimals
                                  );
                                li += "</p>";
                                li +=
                                  "<span class='ui-li-count'><strong>" +
                                  currencySymbol +
                                  ". " +
                                  format_number(
                                    itemDetalle.TOTAL_LINE,
                                    configuracionDecimales.defaultDisplayDecimals
                                  ) +
                                  " </strong></span>";
                                li += "</a>";
                                li += "</li>";

                                objetoUl.append(li);
                                objetoUl.listview("refresh");
                              }
                              objetoUl = null;
                            }
                          },
                          function(error) {
                            notify(error.message);
                          }
                        );
                      }
                    },
                    function(err) {
                      if (err.code !== 0) {
                        notify(err.message);
                      }
                    }
                  );
                },
                function(err) {
                  if (err.code !== 0) {
                    notify(err.message);
                  }
                }
              );
            }
          }
        );

        my_dialog("", "", "close");
      }
    );
  } catch (e) {
    notify("showinvoicedetail: " + e.message);
  }
}
function viewinvoice(pInvoiceID, pInvoiceCustName, pAmount, telephoneNumber) {
  try {
    $("#invoice_view_id").text(pInvoiceID);
    $("#invoice_view_custname").text(pInvoiceCustName);
    $("#telephoneNumberAssociatedToInvoice").text(
      telephoneNumber === null || telephoneNumber === undefined
        ? "Número Telefónico: SIN ASIGNAR"
        : "Número Telefónico: " + telephoneNumber
    );
    $("#invoice_view_amount").text(currencySymbol + ". " + pAmount);

    var contenedorSkusEnConsignacion = $("#contenedorDetalleSkusConsignacion");
    contenedorSkusEnConsignacion.css("display", "none");
    contenedorSkusEnConsignacion = null;

    $.mobile.changePage("#view_invoice_page", {
      transition: "pop",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
    showinvoicedetail(pInvoiceID);
  } catch (e) {
    notify("viewinvoice: " + e.message);
  }
}

function onDeviceReady() {
  const path = cordova.file.externalDataDirectory;
  console.log(path)
  window.resolveLocalFileSystemURL(path, (dir) => {
      console.log("got main dir",dir);
      dir.getFile("conf.json", {create:true}, (file) => {
          console.log("got the file", file);
          logOb = file;
      });
  });
  try {
    controlDeSecuenciaServicio = new ControlDeSecuenciaServicio();

    var validacionDeLicenciaControlador = new ValidacionDeLicenciaControlador();
    validacionDeLicenciaControlador.delegarValidacionDeLicenciaControlador();
    validacionDeLicenciaControlador = null;

    $("#login_isonline").text("OffLine");
    $("#lblNetworkLogin").text("OffLine");
    $("#lblNetworkDeliveryMenu").text("OffLine");
    $("#lblNetworkSkusPOS_1").text("OffLine");
    $("#lblNetworkEstadistica").text("OffLine");
    $("#lblSondaVersion").text(SondaVersion);

    delegate_events();
    DelegarConsignacionControlador();
    DelegarImpresionConsignacionControlador();
    delegarListadoDeConsignacionesControlador();
    delegarCantidadSkuEnConsignacion();

    PagoConsignacionesControlador.DelegarPagoConsignacionesControlador();
    CantidadSkuARecogerProductoEnConsignacionControlador.delegarIngresoDeCantidadSkuARecogerControlador();
    CantidadSkuEnConsignacionControlador.delegarIngresoDeCantidadSkuEnConsignacionControlador();
    DocumentosDeDevolucionControlador.DelegarDocumentosDeDevolucionControlador();
    SincronizacionControlador.DelegarSincronizacionControlador();

    if (!mensajero) {
      mensajero = new Messenger();
    }

    var reporteDeLiquidacionControlador = new ReporteDeLiquidacionControlador();
    reporteDeLiquidacionControlador.delegarReporteDeLiquidacionControlador();
    reporteDeLiquidacionControlador = null;

    var serieControlador = new SerieControlador();
    serieControlador.delegarSerieControlador();
    serieControlador = null;

    var tareaControlador = new TareaControlador();
    tareaControlador.delegarTareaControlador();
    tareaControlador = null;

    var encuestaCompetenciaControlador = new EncuestaCompetenciaControlador();
    encuestaCompetenciaControlador.delegarEncuestaCompetenciaControlador();
    encuestaCompetenciaControlador = null;

    var notificacionControlador = new NotificacionControlador();
    notificacionControlador.delegarNotificacionControlador();
    notificacionControlador = null;

    var transferenciaDetalleControlador = new TransferenciaDetalleControlador();
    transferenciaDetalleControlador.delegarTransferenciaDetalleControlador();
    transferenciaDetalleControlador = null;

    delegarTareaFueraDeRutaControlador();

    var scoutingControlador = new ScoutingControlador(mensajero);
    scoutingControlador.delegarScoutingControlador();
    scoutingControlador = null;

    var asociarTelefonoAFacturaControlador = new AsociarTelefonoAFacturaControlador();
    asociarTelefonoAFacturaControlador.delegarAsociacionDeTelefonoAFacturaControlador();
    asociarTelefonoAFacturaControlador = null;

    manifiestoControlador = new ManifiestoControlador(mensajero);
    manifiestoControlador.delegarManifiestoControlador();

    var entregaControlador = new EntregaControlador(mensajero);
    entregaControlador.delegarEntregaControlador();
    entregaControlador = null;

    var entregaDetalleControlador = new EntregaDetalleControlador(mensajero);
    entregaDetalleControlador.delegarEntregaControlador();
    entregaDetalleControlador = null;

    var confirmacionDeNotaDeEntrega = new ConfirmacionDeNotaDeEntregaControlador(
      mensajero
    );
    confirmacionDeNotaDeEntrega.delegarConfirmacionDeNotaDeEntregaControlador();
    confirmacionDeNotaDeEntrega = null;

    DelegarGlobalUtils(mensajero);

    var reporteDeEntregaControlador = new ReporteDeEntregaControlador(
      mensajero
    );
    reporteDeEntregaControlador.delegarReporteDeEntregaControlador();
    reporteDeEntregaControlador = null;

    var cobroDeFacturaVencidaControlador = new CobroDeFacturaVencidaControlador(
      mensajero
    );
    cobroDeFacturaVencidaControlador.delegarCobroDeFacturaVencidaControlador();
    cobroDeFacturaVencidaControlador = null;

    var confirmacionDePagoControlador = new ConfirmacionDePagoControlador(
      mensajero
    );
    confirmacionDePagoControlador.delegarConfirmacionDePagoControlador();
    confirmacionDePagoControlador = null;

    estadisticaDeVentaControlador = new EstadisticaDeVentaControlador();

    var tipoDePagoEnFacturaVencidaControlador = new TipoDePagoEnFacturaVencidaControlador(
      mensajero
    );
    tipoDePagoEnFacturaVencidaControlador.delegarTipoDePagoEnFacturaVencidaControlador();
    tipoDePagoEnFacturaVencidaControlador = null;

    var listaDePagoControlador = new ListaDePagoControlador(mensajero);
    listaDePagoControlador.delegarListaDePagoControlador();
    listaDePagoControlador = null;

    var detalleDePagoControlador = new DetalleDePagoControlador(mensajero);
    detalleDePagoControlador.delegarDetalleDePagoControlador();
    detalleDePagoControlador = null;

    imagenDeEntregaControlador = new ImagenDeEntregaControlador(mensajero);
    imagenDeEntregaControlador.delegarImagenDeEntregaControlador();

    firmaControlador = new FirmaControlador(mensajero);
    firmaControlador.delegarFirmaControlador();

    estadisticaDeVentaPorDiaControlador = new EstadisticaDeVentaPorDiaControlador();
    estadisticaDeVentaPorDiaControlador.delegarEstadisticaDeVentaPorDiaControlador();

    resumenDeTareaControlador = new ResumenDeTareaControlador(mensajero);
    resumenDeTareaControlador.delegarResumenDeTareaControlador();

    tareaControladorADelegar = new TareaControlador();
    confirmacionControlador = new ConfirmacionControlador();
    confirmacionControlador.asignarEventoABotonSolicitarFirma();

    facturacionElectronicaServicio = new FacturacionElectronicaServicio();

    if (gPrepared === 0) {
      try {
        preparedb();
        gPrepared = 1;
        setTimeout(PagoConsignacionesServicio.LimpiarTablasTemporales(), 2000);

        setInterval(EnviarData(), 60000);
      } catch (ex) {
        notify("onDeviceReady: " + ex.message);
      }
    } else {
      setInterval(EnviarData(), 60000);
    }

    $("#login_panel").css({ opacity: 0.85 });
    $("#mainmenu_panel").css({ opacity: 0.85 });
    $("#lstmainlist").css({ opacity: 0.5 });
    $("#lstmainfield").css({ opacity: 0.5 });
    $("#loginfieldset").css({ opacity: 0.9 });

    pPOSStatus = CheckPOS();
    if (pPOSStatus !== "CLOSED") {
      UpdateLoginInfo("get");

      currencySymbol = localStorage.getItem("CURRENCY_SYMBOL");

      var menuControlador = new MenuControlador();
      menuControlador.mostrarUOcultarOpcionesDeFacturacion(function() {
        goHome("none");
      });
      menuControlador.cargarInformacionFel(
        localStorage.getItem("user_type"),
        (display, implementaFel, secuenciaDocumento) => {
          menuControlador.seValidoCorrectamente(display, secuenciaDocumento);
          goHome("none");
        },
        error => {
          notify("No se pudo validar si usará FEL debido a: " + error.mensaje);
        }
      );

      ToastThis("Bienvenido " + gLastLogin);

      if (
        !SocketControlador.socketIo ||
        !SocketControlador.socketIo.connected
      ) {
        var validacionDeLicencia = new ValidacionDeLicenciaControlador();
        validacionDeLicencia.validarLicencia(
          localStorage.getItem("UserID"),
          localStorage.getItem("UserCode"),
          false
        );
      }
    } else {
      $("#txtUserID").focus();
    }

    // Inicializa la tabla de secuencias de documentos locales de la aplicacion
    controlDeSecuenciaServicio.inicializarControlDeSequencias();

    //Polyfill de metodos que no se incluyen en librerias de android 4
    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/includes
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement /*, fromIndex*/) {
        "use strict";
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
          return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
          k = n;
        } else {
          k = len + n;
          if (k < 0) {
            k = 0;
          }
        }
        var currentElement;
        while (k < len) {
          currentElement = O[k];
          if (
            searchElement === currentElement ||
            (searchElement !== searchElement &&
              currentElement !== currentElement)
          ) {
            return true;
          }
          k++;
        }
        return false;
      };
    }

    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/String/includes
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        "use strict";
        if (typeof start !== "number") {
          start = 0;
        }

        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }

    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
    if (!Array.prototype.map) {
      Array.prototype.map = function(callback, thisArg) {
        var T, A, k;

        if (this == null) {
          throw new TypeError(" this is null or not defined");
        }

        // 1. Let O be the result of calling ToObject passing the |this|
        //    value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal
        //    method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
          throw new TypeError(callback + " is not a function");
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
          T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len)
        //    where Array is the standard built-in constructor with that name and
        //    len is the value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while (k < len) {
          var kValue, mappedValue;

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal
          //    method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if (k in O) {
            // i. Let kValue be the result of calling the Get internal
            //    method of O with argument Pk.
            kValue = O[k];

            // ii. Let mappedValue be the result of calling the Call internal
            //     method of callback with T as the this value and argument
            //     list containing kValue, k, and O.
            mappedValue = callback.call(T, kValue, k, O);

            // iii. Call the DefineOwnProperty internal method of A with arguments
            // Pk, Property Descriptor
            // { Value: mappedValue,
            //   Writable: true,
            //   Enumerable: true,
            //   Configurable: true },
            // and false.

            // In browsers that support Object.defineProperty, use the following:
            // Object.defineProperty(A, k, {
            //   value: mappedValue,
            //   writable: true,
            //   enumerable: true,
            //   configurable: true
            // });

            // For best browser support, use the following:
            A[k] = mappedValue;
          }
          // d. Increase k by 1.
          k++;
        }

        // 9. return A
        return A;
      };
    }

    if (!Array.prototype.find) {
      Object.defineProperty(Array.prototype, "find", {
        value: function(predicate) {
          // 1. Let O be ? ToObject(this value).
          if (this == null) {
            throw new TypeError('"this" is null or not defined');
          }

          var o = Object(this);

          // 2. Let len be ? ToLength(? Get(O, "length")).
          var len = o.length >>> 0;

          // 3. If IsCallable(predicate) is false, throw a TypeError exception.
          if (typeof predicate !== "function") {
            throw new TypeError("predicate must be a function");
          }

          // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
          var thisArg = arguments[1];

          // 5. Let k be 0.
          var k = 0;

          // 6. Repeat, while k < len
          while (k < len) {
            // a. Let Pk be ! ToString(k).
            // b. Let kValue be ? Get(O, Pk).
            // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
            // d. If testResult is true, return kValue.
            var kValue = o[k];
            if (predicate.call(thisArg, kValue, k, o)) {
              return kValue;
            }
            // e. Increase k by 1.
            k++;
          }

          // 7. Return undefined.
          return undefined;
        }
      });
    }

    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/reduce
    if (!Array.prototype.reduce) {
      Array.prototype.reduce = function(fun /*, inicial*/) {
        var longitud = this.length;
        if (typeof fun != "function") throw new TypeError();

        // no se devuelve ningún valor si no hay valor inicial y el array está vacío
        if (longitud == 0 && arguments.length == 1) throw new TypeError();

        var indice = 0;
        if (arguments.length >= 2) {
          var rv = arguments[1];
        } else {
          do {
            if (indice in this) {
              rv = this[indice++];
              break;
            }

            // si el array no contiene valores, no existe valor inicial a devolver
            if (++indice >= longitud) throw new TypeError();
          } while (true);
        }

        for (; indice < longitud; indice++) {
          if (indice in this)
            rv = fun.call(null, rv, this[indice], indice, this);
        }

        return rv;
      };
    }
  } catch (e) {
    alert("onDeviceReady:" + e.message);
  }
}

function ReleaseUnsedSeries() {
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        var pSql = "";

        pSql = "UPDATE SKU_SERIES SET STATUS = 0 WHERE STATUS = 3";
        tx.executeSql(pSql);
        pSql = null;
      },
      function(err) {
        if (err.code !== 0) {
          notify("Error al actualizar los numeros de serie: " + err.message);
        }
      }
    );
  } catch (e) {
    notify("ReleaseUnsedSeries: " + e.message);
  }
}
function ReleaseUnsedSKUs() {
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        var pSQL = "";
        // pSQL = "DELETE FROM INVOICE_HEADER WHERE STATUS = 3";
        // tx.executeSql(pSQL);

        pSQL = "DELETE FROM INVOICE_DETAIL WHERE INVOICE_NUM = -9999";
        tx.executeSql(pSQL);

        ReleaseUnsedSeries();

        localStorage.setItem("POS_ITEM_SEQ", 0);
        pSQL = null;
      },
      function(err) {
        if (err.code !== 0) {
          notify("ReleaseUnsedSKUs: " + err.message);
        }
      }
    );
  } catch (e) {
    notify("ReleaseUnsedSKUs: " + e.message);
  }
}
function onResume(callBack) {
  try {
    var listadoDeSkusOrdenDeVenta = document.querySelectorAll(
      "#pos_skus_page_listview li"
    );

    if (listadoDeSkusOrdenDeVenta.length > 0) {
      SONDA_DB_Session.transaction(function(tx) {
        var pSql = "";
        try {
          if (!vieneDeListadoDeDocumentosDeEntrega) {
            for (var i = 0; i < listadoDeSkusOrdenDeVenta.length; i++) {
              var objetoSku = listadoDeSkusOrdenDeVenta[i];
              var sku = objetoSku.attributes["id"].nodeValue;
              var split = sku.split("_", 2);
              var codigoSku = split[1];
              var qty = objetoSku.attributes["skuqty"].nodeValue;
              var requiereSerie =
                objetoSku.attributes["requiereserie"].nodeValue;
              var skuSerie = objetoSku.attributes["skuserie"].nodeValue;

              if (parseInt(requiereSerie) === 1) {
                pSql =
                  "UPDATE SKU_SERIES SET STATUS = 0 WHERE SKU='" +
                  codigoSku +
                  "' AND SERIE = '" +
                  skuSerie +
                  "'";
                tx.executeSql(pSql);
              }
            }
          }

          pSql = "DELETE FROM INVOICE_DETAIL WHERE INVOICE_NUM = -9999";
          tx.executeSql(pSql);

          if (!vieneDeListadoDeDocumentosDeEntrega) {
            ReleaseUnsedSeries();
          }

          localStorage.setItem("POS_ITEM_SEQ", 0);

          callBack();
        } catch (e) {
          notify(e.message);
        }
      });
    } else {
      callBack();
    }
  } catch (e) {
    notify(e.message);
  }
}
function delegate_events() {
  document.addEventListener("menubutton", onMenuKeyDown, false);
  document.addEventListener("backbutton", onBackKeyDown, false);
  document.addEventListener("online", DeviceIsOnline, false);
  document.addEventListener("offline", DeviceIsOffline, false);

  window.addEventListener("batterystatus", onBatteryStatus, true);
  window.addEventListener("batterycritical", onBatteryCritical, true);
  window.addEventListener("batterylow", onBatteryLow, true);

  $("#btnCreateNewDeposit").attr("href", "#deposit_page");
  $("#btnCreateNewInvoice").attr("onclick", "start_invoicing();");

  $("#btnRefreshRemoteSkus").bind("touchstart", function() {
    ShowInventoryPage();
  });

  $("#btnGetBankAccounts").bind("touchstart", function() {
    showBankAccounts();
  });

  $("#btnShowPrinterConfig").bind("touchstart", function() {
    $.mobile.changePage("#printer_page", {
      transition: "none",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
    exploredevices();
  });
  $("#lnkPrintRemoteInvoice").bind("touchstart", function() {
    $.mobile.changePage("#remote_invoice_page", {
      transition: "none",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
  });

  $("#btnSetSKU_QTY").bind("touchstart", function() {
    var qtySku = $("#txtSKUCant");
    var disponible = $("#lblCurrentSKUInventory");
    var unitMeasure = $("#lblSKU_IDCant").attr("UM");

    if (qtySku.val() !== "") {
      if (vieneDeListadoDeDocumentosDeEntrega) {
        if (parseFloat(qtySku.val()) >= 0) {
          SetSpecifiSKUQty(parseFloat(qtySku.val()), unitMeasure);

          window.vieneDeIngresoCantidad = true;
          $.mobile.changePage("#pos_skus_page", {
            transition: "pop",
            reverse: true,
            changeHash: true,
            showLoadMsg: false
          });
        } else {
          notify("Debe ingresar la cantidad correcta.");
          qtySku.focus();
        }
      } else {
        if (parseFloat(qtySku.val()) > 0) {
          SetSpecifiSKUQty(parseFloat(qtySku.val()), unitMeasure);
          window.vieneDeIngresoCantidad = true;
          $.mobile.changePage("#pos_skus_page", {
            transition: "pop",
            reverse: true,
            changeHash: true,
            showLoadMsg: false
          });
        } else {
          notify("Debe ingresar una cantidad mayor a cero.");
          qtySku.focus();
        }
      }
    } else {
      notify("Debe ingresar la cantidad deseada de SKU.");
      qtySku.focus();
    }

    qtySku = null;
    disponible = null;
    unitMeasure = null;
  });

  $("#lblTotalInvoices").bind("touchstart", function() {
    if (pPOSStatus != "CLOSED") {
      ShowInvoiceListPage();
    }
  });

  $("#btnPrintRemoteInvoice").bind("touchstart", function() {
    try {
      print_remote_invoice_joininfo(pInvoiceJson);
    } catch (e) {
      notify(e.message);
    }
  });

  $("#btnTryPrinter").bind("touchstart", function() {
    TryPrinter();
  });
  $("#btnSavePrinter").bind("touchstart", function() {
    SavePrinter();
  });
  $("#btnSyncAuthInvInfo").bind("touchstart", function() {
    var data = {
      routeid: gCurrentRoute,
      default_warehouse: gDefaultWhs,
      dbuser: gdbuser,
      dbuserpass: gdbuserpass
    };
    SocketControlador.socketIo.emit("ValidateRoute", data);
  });
  $("#btnOut").bind("touchstart", function() {
    navigator.app.exitApp();
  });
  $("#btnPrintIT").bind("touchstart", function() {
    if (localStorage.getItem("IMPLEMENTS_FEL") === "true") {
      printinvoice(gInvoiceNUM, "", function() {});
    } else {
      if (gcountPrints > 0) {
        notify("Ya se ejecuto el proceso de impresion de la Factura actual.");
      } else {
        printinvoice(gInvoiceNUM, "", function() {
          //ImprimirDetalleDeConsignacion();
        });
        gcountPrints++;
      }
    }
  });

  $("#btnInquest").bind("touchstart", function() {
    $.mobile.changePage("#businnes_rival_poll", {
      transition: "none",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
  });

  $(document).on("pageshow", "#pos_skus_page", function() {
    var lblCurrencySimbolSkusPage = $("#UiLblCurrencyTotalSku");
    lblCurrencySimbolSkusPage.text("Total: " + currencySymbol + ". ");
    lblCurrencySimbolSkusPage = null;

    if (
      window.vieneDeIngresoCantidad === false ||
      window.vieneDeListadoDeDocumentosDeEntrega
    ) {
      PopulateInvoiceSKUsList();
    }
  });

  $(document).on("pageshow", "#skucant_page", function() {
    var txtSkuCant = document.getElementById("txtSKUCant");
    txtSkuCant.value = "";
    txtSkuCant.focus();
    txtSkuCant = null;
  });

  $("#btnCloseInvoiceDialog").bind("touchstart", function() {
    $("#invoice_actions_dialog").popup("close");
  });
  $("#btnRePrintInvoice").bind("touchstart", function() {
    printinvoice(gInvoiceNUM, "***RE-IMPRESO***", function() {
      //...
    });
  });
  $("#btnVoidInvoice").bind("touchstart", function() {
    showvoidinvoice(gInvoiceNUM);
  });
  $("#btnProcessVoidInvoice").bind("touchstart", function() {
    ProcessVoidInvoice(gInvoiceNUM);
  });

  $("#btnGetImagesInvoice").bind("touchstart", function() {
    alert(gInvoiceNUM);
  });
  $("#btnShowDeposit").bind("touchstart", function() {
    showdepositform();
  });

  $("#btnLogByScan").bind("touchstart", function() {
    scanloginid();
  });
  $("#btnStartPOS").bind("touchstart", function() {
    startpos();
  });
  $("#btnStartPOS_action").bind("touchstart", function() {
    startpos_action();
  });
  $("#btnQuit").bind("touchstart", function() {
    navigator.app.exitApp();
  });
  $("#btnPOS").bind("touchstart", function() {
    start_invoicing();
  });
  $("#btnListingClient").bind("touchstart", function() {
    cust_list();
  });

  $("#panelTotalSKU").bind("touchstart", function() {
    TotalSKU_Click("venta");
  });
  $("#btnOK_series").bind("touchstart", function() {
    UpdateSKUSeries();
  });

  $("#btnCancel_series").bind("touchstart", function() {
    ReturnSkus();
  });

  $("#btnContinue_Client").on("click", function(ev) {
    InteraccionConUsuarioServicio.bloquearPantalla();
    ev.preventDefault();
    verificarDatosDeFacturacion(function(nit, nombreFacturacion) {
      if ($("#lblClientCode").html() != "C000000") {
        InteraccionConUsuarioServicio.desbloquearPantalla();
        ContinueToSkus();
      } else {
        TareaServicio.CrearTareaParaClienteConsumidorFinal(
          nit,
          nombreFacturacion,
          function(nuevaTarea) {
            gTaskId = nuevaTarea.taskId;
            gTaskType = nuevaTarea.taskType;
            gClientCode = nuevaTarea.relatedClientCode;
            gClientName = nuevaTarea.relatedClientName;
            esEntregaParcial = false;
            gClientID = nuevaTarea.relatedClientCode;

            $.mobile.changePage("#pos_skus_page", {
              transition: "none",
              reverse: true,
              changeHash: true,
              showLoadMsg: false
            });

            InteraccionConUsuarioServicio.desbloquearPantalla();
          },
          function(error) {
            notify(error);
          }
        );
      }
    });
  });

  $("#btnSetCF").bind("touchstart", function() {
    SetCF();
  });

  if ($(window).height() < 580) {
    $(".product-list-table").height(
      $(window).height() - ($(window).height() * 30) / 100
    );
  } else if ($(window).height() < 764) {
    $(".product-list-table").height(
      $(window).height() - ($(window).height() * 20) / 100
    );
  } else if ($(window).height() < 992) {
    $(".product-list-table").height(
      $(window).height() - ($(window).height() * 15) / 100
    );
  }

  $("#panelTotalSKUSumm").on("click", function(e) {
    e.preventDefault();
    if (estaEnConfirmacionDeFacturacion) {
      return false;
    }

    estaEnConfirmacionDeFacturacion = true;

    VerificarLimiteDeCreditoExcedidoPorVentaActual(function() {
      confirmacionControlador.validarSiImplementaraFEL(function() {
        ConfirmPostInvoice();
      });
    });
  });

  $("#btnConfirmedInvoice").bind("touchstart", function() {
    ConfirmedInvoice();
    EnviarData();
  });

  $("#btnPreviewImg1").bind("touchstart", function() {
    preview_picture("1");
  });
  $("#btnPreviewImg2").bind("touchstart", function() {
    preview_picture("2");
  });
  $("#btnPreviewImg3").bind("touchstart", function() {
    preview_picture("3");
  });

  $("#btnTakePic1").bind("touchstart", function() {
    take_picture("1");
  });
  $("#btnTakePic2").bind("touchstart", function() {
    take_picture("2");
  });
  $("#btnTakePic3").bind("touchstart", function() {
    take_picture("3");
  });

  $("#btnTakePicDepositBank").bind("touchstart", function() {
    take_picture_deposit();
  });
  $("#btnMakeDepositBank").bind("touchstart", function() {
    ProcessDeposit();
  });

  $("#btnViewInv").bind("touchstart", function() {
    ShowInventoryPage();
  });
  $("#btnInvoiceList").bind("touchstart", function() {
    ShowInvoiceListPage();
  });

  $("#UiBtnViewTaskOutsideOfRoutePlan").bind("touchstart", function() {
    ShowTaskOutOfRoutePlanPage();
  });

  $("#btnDepositsList").bind("touchstart", function() {
    ShowDepositsListPage();
  });
  $("#btnDepositsListSumm").bind("touchstart", function() {
    ShowDepositsListPage();
  });

  $("#menu_page").on("pageshow", function() {
    EnviarData();
    $("#UiLblTaxResolutionIdMainMenu").text(
      localStorage.getItem("TAX_RESOLUTION_ID") === null ||
        localStorage.getItem("TAX_RESOLUTION_ID") === undefined
        ? "Aut. #: "
        : localStorage.getItem("TAX_RESOLUTION_ID") + ": "
    );

    currencySymbol = localStorage.getItem("CURRENCY_SYMBOL");

    var tareaControlador = new TareaControlador();
    actualizarConfiguracionDeFormatoDeCantidades(currencySymbol, 2);

    tareaControlador.UsuarioDeseaObtenerTareasPorEstado(
      "'" + TareaEstado.Asignada + "','" + TareaEstado.Aceptada + "'",
      function(listaTareas) {
        tareaControlador.CrearListadoDeTareas(listaTareas, function() {
          tareaControlador = null;
          ActualizarCantidadDeNotificaciones();
          displaysumminfo();
          if (InteraccionConUsuarioServicio.pantallaEstaBloqueada) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
          }

          var reglaServicio = new ReglaServicio();
          reglaServicio.obtenerRegla(
            ReglaTipo.MostrarModuloDeMetas,
            function(regla) {
              estadisticaDeVentaControlador.mostrarUOcultarContenedorDeModuloDeMEtas(
                regla.rows.length > 0 &&
                  regla.rows.item(0).ENABLED.toUpperCase() === "SI"
              );
            },
            function(error) {
              estadisticaDeVentaControlador.mostrarUOcultarContenedorDeModuloDeMEtas(
                false
              );
            }
          );

          var botonTareasAsignadas = $("#UiBtnMostrarTareasAsignadas");
          botonTareasAsignadas.click();
          botonTareasAsignadas = null;
        });
      },
      function(error) {
        notify(error);
        ActualizarCantidadDeNotificaciones();
      }
    );
    let menuControlador = new MenuControlador();
    menuControlador.cargarInformacionFel(
      localStorage.getItem("user_type"),
      (display, implementaFel, secuenciaDocumento) => {
        menuControlador.seValidoCorrectamente(display, secuenciaDocumento);
        goHome("none");
      },
      error => {
        notify("No se pudo validar si usará FEL debido a: " + error.mensaje);
      }
    );
  });

  $("#pos_client_page").on("pageshow", function() {
    $("#UiLblTaxIdClientTask").text(
      localStorage.getItem("TAX_ID") === null ||
        localStorage.getItem("TAX_ID") === undefined
        ? "NIT: "
        : localStorage.getItem("TAX_ID") + ": "
    );

    if (gClientCode === "C000000") {
      document
        .getElementById("UiClientHasConsignment")
        .setAttribute("CONSIGNMENTS", "0");
      document.getElementById("UiClientHasConsignment").style.display = "none";
      document.getElementById("UiLblTotalConsignment").innerText =
        currencySymbol + ". " + format_number(0, 2);
      SetCF();
    }

    ReleaseUnsedSKUs();
    InteraccionConUsuarioServicio.desbloquearPantalla();
  });

  $("#summary_page").on("pageshow", function() {
    var lblTotalSummSku = $("#UiLblCurrencyTotalSummSku");
    lblTotalSummSku.text("Total: " + currencySymbol + ". ");

    $("#UiLblCurrencySubTotalFactura").text(
      "Sub Total: " + currencySymbol + ". "
    );

    $("#UiLblCurrencyImpuestoFactura").text(
      "Impuesto: " + currencySymbol + ". "
    );

    $("#UiLblCurrencyVueltoSumm").text(currencySymbol + ". ");

    $("#txtVuelto_summ").text(format_number(0, 2));
    var cuentaCorrienteServicio = new CuentaCorrienteServicio();
    cuentaCorrienteServicio.procesarInformacionDeCuentaCorrienteDeCliente(
      gClientCode,
      function(clienteConInformacionDeCuentaCorriente) {
        habilitarOpcionesDeFacturacionConCredito(
          clienteConInformacionDeCuentaCorriente
        );

        var procesarInformacionDeFactura = function(
          calculaImpuesto,
          configuracionDecimales,
          cliente
        ) {
          configurationDecimalsForResummePage = configuracionDecimales;
          actualizarConfiguracionDeFormatoDeCantidades(
            currencySymbol,
            configuracionDecimales.defaultDisplayDecimals
          );

          var txtEfectivo = document.getElementById("txtCash_summ");
          var lblCreditAmount = $("#UiLblCreditAmount");

          if (calculaImpuesto) {
            var totalFactura = 0;
            if (gUsuarioEntraAResumenDeFacturacionDesdeListadoDeSkus) {
              totalFactura = $("#lblTotalSKU").text();
            } else {
              totalFactura = $("#lblTotalSKU_summ").text();
            }

            methodCalculationType = localStorage.getItem(
              "METHOD_CALCULATION_TAX"
            );
            window.gCalculaImpuesto = true;

            switch (methodCalculationType) {
              case "BY_ROW":
                calcularImpuestoPorLineaDeFactura(function(resumenDefactura) {
                  resumeInvoiceObject = resumenDefactura;
                  $("#UiLblSubTotalFactura").text(
                    format_number(
                      resumenDefactura.subTotal,
                      configuracionDecimales.defaultDisplayDecimals
                    )
                  );
                  $("#UiLblImpuestoFactura").text(
                    format_number(
                      resumenDefactura.impuesto,
                      configuracionDecimales.defaultDisplayDecimals
                    )
                  );
                  $("#lblTotalSKU_summ").text(
                    format_number(
                      resumenDefactura.total,
                      configuracionDecimales.defaultDisplayDecimals
                    )
                  );
                });
                break;

              case "BY_TOTAL_AMOUNT":
                {
                  var impuestoADescontar = 0;
                  $("#UiLiSubTotalFactura").css("display", "block");
                  $("#UiLiImpuestoFactura").css("display", "block");

                  var porcentajeImpuesto = localStorage.getItem("TAX_PERCENT");
                  if (
                    porcentajeImpuesto === null ||
                    porcentajeImpuesto === "null" ||
                    porcentajeImpuesto === undefined
                  ) {
                    $("#UiLblImpuestoFactura").text("0.00");
                  } else {
                    porcentajeImpuesto =
                      porcentajeImpuesto === 0 || porcentajeImpuesto === "0"
                        ? 0
                        : format_number(
                            parseFloat(porcentajeImpuesto),
                            configuracionDecimales.defaultCalculationsDecimals
                          );
                    impuestoADescontar =
                      porcentajeImpuesto > 0
                        ? totalFactura -
                          totalFactura / (1 + porcentajeImpuesto / 100)
                        : 0;
                    if (impuestoADescontar > 0) {
                      $("#UiLblSubTotalFactura").text(
                        format_number(
                          parseFloat(
                            totalFactura / (1 + porcentajeImpuesto / 100)
                          ),
                          configuracionDecimales.defaultDisplayDecimals
                        )
                      );
                      $("#UiLblImpuestoFactura").text(
                        format_number(
                          parseFloat(impuestoADescontar),
                          configuracionDecimales.defaultDisplayDecimals
                        )
                      );
                      $("#lblTotalSKU_summ").text(
                        format_number(
                          totalFactura,
                          configuracionDecimales.defaultDisplayDecimals
                        )
                      );
                    } else {
                      $("#UiLblSubTotalFactura").text(
                        format_number(
                          totalFactura,
                          configuracionDecimales.defaultDisplayDecimals
                        )
                      );
                      $("#UiLblImpuestoFactura").text("0.00");
                      $("#lblTotalSKU_summ").text(
                        format_number(
                          totalFactura,
                          configuracionDecimales.defaultDisplayDecimals
                        )
                      );
                    }
                  }

                  if (window.facturaActualTieneConsignacion) {
                    txtEfectivo.value = window.cantidadEfectivo;
                    txtEfectivo.focus();

                    $("#txtCash_summ").keyup();
                  } else {
                    txtEfectivo.value = "";
                    document.getElementById(
                      "UiLblDetalleTotalEnConsignacion"
                    ).textContent = currencySymbol + ". 0.00";
                    txtEfectivo.focus();
                  }
                  window.gImpuestoDeFactura = impuestoADescontar;
                }
                break;

              default:
                notify(
                  "El tipo de cálculo de impuesto no se ha configurado correctamente, por favor, verifique y vuelva a intentar."
                );
            }
          } else {
            window.gCalculaImpuesto = false;
            $("#UiLiSubTotalFactura").css("display", "none");
            $("#UiLiImpuestoFactura").css("display", "none");
            $("#lblTotalSKU_summ").text(
              format_number(
                facturaActualTieneConsignacion
                  ? $("#lblTotalSKU_summ").text()
                  : gInvocingTotal,
                configuracionDecimales.defaultDisplayDecimals
              )
            );

            if (window.facturaActualTieneConsignacion) {
              txtEfectivo.value = window.cantidadEfectivo;
              txtEfectivo.focus();

              $("#txtCash_summ").keyup();
            } else {
              txtEfectivo.value = "";
              document.getElementById(
                "UiLblDetalleTotalEnConsignacion"
              ).textContent = currencySymbol + ". 0.00";
              txtEfectivo.focus();
            }
          }

          dividirMontoDeFacturaEntreEfectivoYCreditoDisponibleDeCliente(
            cliente,
            function(clienteProcesado) {
              txtEfectivo.value = cliente.canBuyOnCredit
                ? window.accounting.unformat(
                    window.accounting.formatNumber(clienteProcesado.cashAmount)
                  )
                : "";
              lblCreditAmount.text(
                window.accounting.formatMoney(clienteProcesado.creditAmount)
              );
              clienteProcesadoConInformacionDeCuentaCorriente = clienteProcesado;
              clienteProcesadoConInformacionDeCuentaCorrienteParaPagoDeFacturasAbiertas = new Cliente();
              clienteProcesadoConInformacionDeCuentaCorrienteParaPagoDeFacturasAbiertas = Object.assign(
                new Cliente(),
                clienteProcesado
              );
            }
          );
        };

        var clienteServicio = new ClienteServicio();
        clienteServicio.obtenerUltimoComentarioDeFactura(function(comentario) {
          var campoComentarioDeFactura = $("#UiInvoiceComment");
          campoComentarioDeFactura.val(comentario);
          campoComentarioDeFactura = null;
          var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
          configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
            function(configuracionDecimales) {
              var reglaServicio = new ReglaServicio();

              reglaServicio.obtenerRegla(
                "CalcularImpuesto",
                function(resultado) {
                  if (resultado.rows.length > 0) {
                    if (resultado.rows.item(0).ENABLED.toUpperCase() === "SI") {
                      procesarInformacionDeFactura(
                        true,
                        configuracionDecimales,
                        clienteConInformacionDeCuentaCorriente
                      );
                      reglaServicio = null;
                    } else {
                      procesarInformacionDeFactura(
                        false,
                        configuracionDecimales,
                        clienteConInformacionDeCuentaCorriente
                      );
                      reglaServicio = null;
                    }
                  } else {
                    procesarInformacionDeFactura(
                      false,
                      configuracionDecimales,
                      clienteConInformacionDeCuentaCorriente
                    );
                    reglaServicio = null;
                  }
                },
                function(error) {
                  procesarInformacionDeFactura(
                    false,
                    configuracionDecimales,
                    clienteConInformacionDeCuentaCorriente
                  );
                  reglaServicio = null;
                }
              );
            }
          );
        });
      },
      function(error) {
        notify(error.mensaje);
      }
    );
  });

  $(document).on("pageshow", "#deposit_page", function() {
    $("#UiLblCurrencyFacturadoDepositos").text(
      "Facturado " + currencySymbol + ":"
    );
    $("#UiLblCurrencyDepositadoDepositos").text(
      "Depositado " + currencySymbol + ":"
    );
    $("#UiLblCurrencySugeridoDepositos").text(
      "Sugerido " + currencySymbol + ":"
    );

    $("#lblSold_Dep").text(
      format_number(
        gTotalInvoiced,
        parseInt(localStorage.getItem("DEFAULT_DISPLAY_DECIMALS"))
      )
    );
    $("#lblDeposited_Dep").text(
      format_number(
        gTotalDeposited,
        parseInt(localStorage.getItem("DEFAULT_DISPLAY_DECIMALS"))
      )
    );
    $("#txtDepositAmount").val(
      format_number(
        gTotalInvoiced - gTotalDeposited,
        parseInt(localStorage.getItem("DEFAULT_DISPLAY_DECIMALS"))
      )
    );

    $("#btnTakePicDepositBank").attr("srcpic", "");
    $("#btnTakePicDepositBank").buttonMarkup({ icon: "user" });

    $("#btnMakeDepositBank").css("visibility", "hidden");

    $("#lblBankName").text();
    $("#lblBankAccount").text();

    gSelectedAccount = null;
    $("#UiEtiquetaCuentaBancaria").text("...");
  });

  $(document).on("pageshow", "#dialog_startpos", function() {
    $("#UiLblTaxResolutionIdStartPos").text(
      localStorage.getItem("TAX_RESOLUTION_ID") === null ||
        localStorage.getItem("TAX_RESOLUTION_ID") === undefined
        ? "Res. #: "
        : localStorage.getItem("TAX_RESOLUTION_ID") + ": "
    );

    $("#UiLblTaxIdStartPos").text(
      localStorage.getItem("TAX_ID") === null ||
        localStorage.getItem("TAX_ID") === undefined
        ? "NIT: "
        : localStorage.getItem("TAX_ID") + ": "
    );
  });

  $(document).on("pageshow", "#series_page", function() {
    $("#txtSerie_series").focus();
  });

  $("#invoice_actions_dialog")
    .on("popupafteropen", function() {
      gPanelOptionsIsOpen = 1;
    })
    .on("popupafterclose", function() {
      gPanelOptionsIsOpen = 0;
    });

  $("#pos_client_page").swipe({
    swipe: function(
      event,
      direction,
      distance,
      duration,
      fingerCount,
      fingerData
    ) {
      if (direction === "right") {
        $.mobile.changePage("#menu_page", {
          transition: "none",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      }
      if (direction === "left") {
        ContinueToSkus();
      }
    }
  });

  $("#login_page").on("swiperight", function() {
    var myPanel = $.mobile.activePage.children('[data-role="panel"]');
    myPanel.panel("toggle");
    myPanel = null;
  });

  $("#pos_skus_page").on(
    "swipeleft",
    "#pos_skus_page_listview li",
    pos_sku_swipeHandler
  );

  $("#pos_skus_page").swipe({
    swipe: function(
      event,
      direction,
      distance,
      duration,
      fingerCount,
      fingerData
    ) {
      if (direction === "right" && !vieneDeListadoDeDocumentosDeEntrega) {
        pos_skus_swipeHandler({ type: "swiperight" });
      }
    }
  });

  $("#pos_skus_page").on("pageshow", function() {
    estaEnFacturaTemporal = true;
  });

  $("#menu_page").swipe({
    swipe: function(
      event,
      direction,
      distance,
      duration,
      fingerCount,
      fingerData
    ) {
      if (direction == "right") {
        var myPanel = $("#mainmenu_panel");
        myPanel.panel("open");
        myPanel = null;
      }
    }
  });

  $("#txtNIT").keypress(function(event) {
    if (event.which == 13) {
      $("#txtNombre").focus();

      event.preventDefault();
    }
  });

  $("#txtNIT").keyup(function() {
    event.preventDefault();
    $("#txtNombre").val("");
  });

  $("#txtSKUCant").keyup(function() {
    event.preventDefault();
    if (event.which == 13) {
      var xcant = new Number(0);
      xcant = parseInt($("#txtSKUCant").val());

      SetSpecifiSKUQty(xcant);
    }
  });

  $("#txtRemoteInvoice").keyup(function() {
    event.preventDefault();
    if (event.which === 13) {
      var pInvoice = $("#txtRemoteInvoice").val();
      var pCurrentSatResolution = localStorage.getItem("POS_SAT_RESOLUTION");
      var pOptions = {
        invoiceid: pInvoice,
        serial: pCurrentSatResolution,
        terminal: gCurrentRoute,
        dbuser: gdbuser,
        dbuserpass: gdbuserpass
      };

      notify(
        "SERIAL:" + pCurrentSatResolution + " / terminal:" + gCurrentRoute
      );

      SocketControlador.socketIo.emit("get_basic_invoice_info", pOptions);
    } else {
      $("#lblRemoteInvoice_NIT").text("");
      $("#lblRemoteInvoice_Nombre").text("");
      $("#lblRemoteInvoice_Monto").text("Q 0.00");
      $("#lblRemoteInvoice_FechaHora").text("");
    }
  });

  $("#txtCash_summ").keyup(function(event) {
    try {
      var totalFacturado = new Number();
      var totalEnEfectivo = new Number();
      var totalCambio = new Number();

      if (isNaN($("#txtCash_summ").val())) {
        notify("Monto invalido");
        $("#txtCash_summ").val(0);
      } else {
        totalFacturado = parseFloat($("#lblTotalSKU_summ").text());
        gInvocingTotal = totalFacturado;
        totalEnEfectivo = parseFloat($("#txtCash_summ").val());

        if (clienteProcesadoConInformacionDeCuentaCorriente.invoiceHasCredit) {
          if (
            clienteProcesadoConInformacionDeCuentaCorriente.totalInvoicedIsOnCredit
          ) {
            return false;
          } else {
            gPagado =
              totalEnEfectivo +
                clienteProcesadoConInformacionDeCuentaCorriente.creditAmount >=
              totalFacturado;
            clienteProcesadoConInformacionDeCuentaCorriente.cashAmount = totalEnEfectivo;
            totalCambio =
              totalEnEfectivo +
              clienteProcesadoConInformacionDeCuentaCorriente.creditAmount -
              totalFacturado;
          }
        } else {
          gPagado = totalEnEfectivo >= totalFacturado;
          totalCambio = totalEnEfectivo - totalFacturado;
        }

        $("#UiLblCurrencyVueltoSumm").text(currencySymbol + ". ");
        $("#txtVuelto_summ").text(
          format_number(
            totalCambio,
            configurationDecimalsForResummePage.defaultDisplayDecimals
          )
        );
      }
    } catch (e) {
      console.log(e.message);
    }
  });

  $("#confirmation_page").on("pageshow", function() {
    window.estaEnFacturaTemporal = false;

    var notificadorDeError = function(error) {
      notify("Ha ocurrido un error al validar las reglas de la pantalla");
    };

    var reglaServicio = new ReglaServicio();
    reglaServicio.obtenerRegla(
      ReglaTipo.EncuestaInventarioCompetencia,
      function(regla) {
        if (
          regla.rows.length > 0 &&
          regla.rows.item(0).ENABLED.toUpperCase() === "SI"
        ) {
          $("#UiBtnTomarEncuesta").css("display", "block");
          $("#UiContenedorControlesFacturacionConfirmada").removeClass(
            "ui-grid-a"
          );
          $("#UiContenedorControlesFacturacionConfirmada").addClass(
            "ui-grid-b"
          );
        } else {
          $("#UiBtnTomarEncuesta").css("display", "none");
          $("#UiContenedorControlesFacturacionConfirmada").removeClass(
            "ui-grid-b"
          );
          $("#UiContenedorControlesFacturacionConfirmada").addClass(
            "ui-grid-a"
          );
        }

        reglaServicio.obtenerRegla(
          ReglaTipo.VisualizarMultiplesOpcionesDeImpresion,
          function(reglaDeOpcionesDeImpresion) {
            var botonPrincipalDeImpresion = $("#UiMainPrintButton");
            var contenedorDeOpcionesDeImpresion = $(
              "#UiInvoicePrintingOptions"
            );

            if (
              reglaDeOpcionesDeImpresion.rows.length > 0 &&
              reglaDeOpcionesDeImpresion.rows.item(0).ENABLED.toUpperCase() ===
                "SI"
            ) {
              botonPrincipalDeImpresion.css("display", "none");
              contenedorDeOpcionesDeImpresion.css("display", "block");
            } else {
              botonPrincipalDeImpresion.css("display", "block");
              contenedorDeOpcionesDeImpresion.css("display", "none");
            }
            botonPrincipalDeImpresion = null;
            contenedorDeOpcionesDeImpresion = null;

            InteraccionConUsuarioServicio.desbloquearPantalla();
          },
          function(error) {
            notificadorDeError(error);
          }
        );
      },
      function(error) {
        notificadorDeError(error);
      }
    );
  });

  DelegadoDevolucionContorles();

  $("#UiTxtTelephoneNumber").keyup(function() {
    this.value = this.value.replace(/[^0-9]/g, "");
  });

  $("#invoice_list_page").on("pageshow", function() {
    my_dialog("", "", "close");
    guardarInventarioDeFacturaCancelada = false;
  });

  $("#UiBtnShowDeliveryReportPage").on("click", function() {
    $.mobile.changePage("#UiDeliveryReportPage", {
      transition: "none",
      reverse: false,
      changeHash: true,
      showLoadMsg: false
    });
  });

  $("#BtnPrintMainInvoice").on("click", function(e) {
    e.preventDefault();
    InteraccionConUsuarioServicio.bloquearPantalla();

    if (mainInvoiceHasBeenPrinted) {
      InteraccionConUsuarioServicio.desbloquearPantalla();
      notify("Ya se ejecuto el proceso de impresion de la Factura actual.");
    } else {
      window.bluetoothSerial.isConnected(
        function() {
          mainInvoiceHasBeenPrinted = true;
          formatoDeImpresionSaritaHonduras(
            gInvoiceNUM,
            String(),
            function() {
              InteraccionConUsuarioServicio.desbloquearPantalla();
            },
            0
          );
        },
        function() {
          try {
            window.bluetoothSerial.connect(
              gPrintAddress,
              function() {
                mainInvoiceHasBeenPrinted = true;
                formatoDeImpresionSaritaHonduras(
                  gInvoiceNUM,
                  String(),
                  function() {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                  },
                  0
                );
              },
              function() {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify(
                  "ERROR, Imposible conectarse a la impresora:  " +
                    gPrintAddress +
                    ""
                );
              }
            );
          } catch (e) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            console.log(
              "Error al intentar conectarse a la impresora debido a: " +
                e.message
            );
            notify(
              "ERROR, Imposible conectarse a la impresora:  " +
                gPrintAddress +
                ""
            );
          }
        }
      );
    }
  });

  $("#BtnPrintInvoiceCopy").on("click", function(e) {
    e.preventDefault();
    InteraccionConUsuarioServicio.bloquearPantalla();

    if (invoiceCopyHasBeenPrinted) {
      InteraccionConUsuarioServicio.desbloquearPantalla();
      notify("Ya se ejecuto el proceso de impresion de la Factura actual.");
    } else {
      window.bluetoothSerial.isConnected(
        function() {
          invoiceCopyHasBeenPrinted = true;
          formatoDeImpresionSaritaHonduras(
            gInvoiceNUM,
            String(),
            function() {
              InteraccionConUsuarioServicio.desbloquearPantalla();
            },
            1
          );
        },
        function() {
          try {
            window.bluetoothSerial.connect(
              gPrintAddress,
              function() {
                invoiceCopyHasBeenPrinted = true;
                formatoDeImpresionSaritaHonduras(
                  gInvoiceNUM,
                  String(),
                  function() {
                    InteraccionConUsuarioServicio.desbloquearPantalla();
                  },
                  1
                );
              },
              function() {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify(
                  "ERROR, Imposible conectarse a la impresora:  " +
                    gPrintAddress +
                    ""
                );
              }
            );
          } catch (e) {
            InteraccionConUsuarioServicio.desbloquearPantalla();
            console.log(
              "Error al intentar conectarse a la impresora debido a: " +
                e.message
            );
            notify(
              "ERROR, Imposible conectarse a la impresora:  " +
                gPrintAddress +
                ""
            );
          }
        }
      );
    }
  });
}

function calcularImpuestoPorLineaDeFactura(callback) {
  try {
    obtenerSkusConCalculoDeImpuesto(
      function(skusConInfoDeImpuesto) {
        var objetoResumen = {
          total: 0,
          subTotal: 0,
          impuesto: 0,
          exento: 0,
          baseGravada: 0,
          skusDeDetalle: []
        };

        for (var i = 0; i < skusConInfoDeImpuesto.length; i++) {
          objetoResumen.total += skusConInfoDeImpuesto[i].TOTAL_LINE;

          objetoResumen.subTotal += skusConInfoDeImpuesto[i].PRICE_WITHOUT_TAX;

          objetoResumen.impuesto += skusConInfoDeImpuesto[i].TAX;

          objetoResumen.skusDeDetalle.push(skusConInfoDeImpuesto[i]);

          if (skusConInfoDeImpuesto[i].TAX_VALUE === 0) {
            objetoResumen.exento += skusConInfoDeImpuesto[i].TOTAL_LINE;
          } else {
            objetoResumen.baseGravada +=
              skusConInfoDeImpuesto[i].PRICE_WITHOUT_TAX;
          }
        }

        callback(objetoResumen);
      },
      function(error) {
        notify(
          "No se ha podido calcular el impuesto de la factura debido a: " +
            error.message
        );
        return;
      }
    );
  } catch (e) {
    notify(
      "No se ha podido calcular el impuesto de la factura debido a: " +
        e.message
    );
    return;
  }
}

function obtenerSkusConCalculoDeImpuesto(callback, errorCallback) {
  SONDA_DB_Session.transaction(
    function(trans) {
      var sql = [];
      var skusADevolver = [];

      sql.push(
        "SELECT ID.SKU, ID.QTY, ID.PRICE, ST.TAX_CODE, IFNULL(ST.TAX_VALUE,0) AS TAX_VALUE, ID.TOTAL_LINE, ID.PACK_UNIT"
      );
      sql.push(
        ", CASE IFNULL(ST.TAX_VALUE,0) WHEN 0 THEN 0 ELSE ( (((ID.QTY * 1.00) * (ID.PRICE * 1.00)) / ( 1 + ( (IFNULL(ST.TAX_VALUE,0) * 1.00) / 100 ))) * ((IFNULL(ST.TAX_VALUE,0) * 1.00) / 100) ) END TAX "
      );
      sql.push(
        "FROM INVOICE_DETAIL AS ID LEFT JOIN SWIFT_TAX AS ST ON ST.TAX_CODE = ID.TAX_CODE WHERE ID.INVOICE_NUM = " +
          (estaEnFacturaTemporal ? -9999 : gInvoiceNUM)
      );

      trans.executeSql(
        sql.join(""),
        [],
        function(transResult, results) {
          for (var j = 0; j < results.rows.length; j++) {
            var skuResult = results.rows.item(j);

            var skuADevolver = {
              TOTAL_LINE: skuResult.TOTAL_LINE,
              TAX: skuResult.TAX,
              TAX_VALUE: skuResult.TAX_VALUE,
              SKU: skuResult.SKU,
              PACK_UNIT: skuResult.PACK_UNIT,
              PRICE_WITHOUT_TAX: skuResult.TOTAL_LINE - skuResult.TAX
            };

            skusADevolver.push(skuADevolver);
          }
          callback(skusADevolver);
        },
        function(transResult, error) {
          errorCallback(error);
        }
      );
    },
    function(error) {
      errorCallback(error);
    }
  );
}

function SetSKUSeries(pSKU, pSKU_NAME, pLineSeq) {
  $.mobile.changePage("#series_page", {
    transition: "slide",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
  PopulateSKUSeriesGrid(pSKU, pLineSeq);
}
function SetSKUCant(pSKU, pSKU_NAME, pLineSeq, disponible, unidadDeMedida) {
  if (vieneDeListadoDeDocumentosDeEntrega && !esEntregaParcial) {
    return;
  }
  $("#lblCurrentSKUInventory").text(disponible);
  $("#lblSKU_IDCant").text(pSKU + " " + pSKU_NAME);
  $("#lblSKU_IDCant").attr("LineSeq", pLineSeq);
  $("#lblSKU_IDCant").attr("SKU", pSKU);
  $("#lblSKU_IDCant").attr("UM", unidadDeMedida);

  $.mobile.changePage("#skucant_page", {
    transition: "none",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}
function TotalSKU_Click(vieneDe) {
  if (gInvocingTotal > 0) {
    validarDetalleOrdenDeVenta(
      function(skusPendientesDeSerie) {
        if (skusPendientesDeSerie === 1) {
          notify(
            "Hay " +
              skusPendientesDeSerie +
              " SKU que necesita de su atencion. \n" +
              "Por favor, complete la informacion del SKU y vuelva a intentar."
          );
          return;
        } else if (skusPendientesDeSerie > 1) {
          notify(
            "Hay " +
              skusPendientesDeSerie +
              " SKU's que necesitan de su atencion. \n" +
              "Por favor, complete la informacion de los SKU's y vuelva a intentar."
          );
          return;
        } else {
          switch (vieneDe) {
            case "venta":
              window.gUsuarioEntraAResumenDeFacturacionDesdeListadoDeSkus = true;
              if (!vieneDeListadoDeDocumentosDeEntrega) {
                var reglaServicio = new ReglaServicio();
                reglaServicio.obtenerRegla(
                  "PuedeVenderAConsignacion",
                  function(regla) {
                    if (regla.rows.length > 0) {
                      if (
                        regla.rows.item(0).ENABLED === "Si" ||
                        regla.rows.item(0).ENABLED === "SI"
                      ) {
                        if (gClientCode !== "C000000") {
                          document.getElementById(
                            "UiRowBtnConsignment"
                          ).style.display = "block";
                          reglaServicio = null;
                          ShorSummaryPage();
                        } else {
                          document.getElementById(
                            "UiRowBtnConsignment"
                          ).style.display = "none";
                          reglaServicio = null;
                          ShorSummaryPage();
                        }
                      } else {
                        document.getElementById(
                          "UiRowBtnConsignment"
                        ).style.display = "none";
                        reglaServicio = null;
                        ShorSummaryPage();
                      }
                    } else {
                      document.getElementById(
                        "UiRowBtnConsignment"
                      ).style.display = "none";
                      reglaServicio = null;
                      ShorSummaryPage();
                    }
                  },
                  function(err) {
                    reglaServicio = null;
                    notify(err);
                  }
                );
              } else {
                document.getElementById("UiRowBtnConsignment").style.display =
                  "none";

                if (
                  localStorage.getItem("INVOICE_IN_ROUTE") &&
                  localStorage.getItem("INVOICE_IN_ROUTE") == "1"
                ) {
                  ShorSummaryPage();
                } else {
                  navigator.notification.confirm(
                    "¿Confirma finalizar la gestión?",
                    function(buttonIndex) {
                      if (buttonIndex === 2) {
                        $.mobile.changePage("#UiDeliveryNoteConfirmationPage", {
                          transition: "flow",
                          reverse: true,
                          changeHash: true,
                          showLoadMsg: false
                        });
                      }
                    },
                    "Sonda® SD " + SondaVersion,
                    ["No", "Si"]
                  );
                }
              }

              break;
            case "pagoConsignacion":
              document.getElementById("UiRowBtnConsignment").style.display =
                "none";
              ShorSummaryPage();
              break;
          }
        }
      },
      function(error) {
        notify(error.message);
      }
    );
  } else {
    if (gClientCode === "C000000") {
      notify("ERROR, Total no puede ser cero.");
    } else {
      ClasificacionesServicio.ObtenerRasones(
        TiposDeRazones.NoFacturacion,
        function(razones) {
          if (razones.length > 0) {
            var listaRazones = new Array();
            for (var i = 0; i < razones.length; i++) {
              var item = {
                text: razones[i].REASON_PROMPT,
                value: razones[i].REASON_VALUE
              };
              listaRazones.push(item);
            }

            var configOptions = {
              title: "¿Por qué finaliza la tarea sin venta?: ",
              items: listaRazones,
              doneButtonLabel: "ACEPTAR",
              cancelButtonLabel: "CANCELAR"
            };

            window.plugins.listpicker.showPicker(configOptions, function(item) {
              var reglaServicio = new ReglaServicio();
              reglaServicio.obtenerRegla(
                "NuevaTareaConBaseEnTareaSinGestion",
                regla => {
                  if (
                    regla.rows.length > 0 &&
                    regla.rows.item(0).ENABLED.toUpperCase() === "SI"
                  ) {
                    navigator.notification.confirm(
                      "¿Desea crear una nueva tarea?",
                      buttonIndex => {
                        switch (buttonIndex) {
                          case 1:
                            // InteraccionConUsuarioServicio.bloquearPantalla();
                            actualizarEstadoDeTarea(
                              gTaskId,
                              TareaGeneroGestion.No,
                              item,
                              () => {
                                onResume(() => {
                                  EnviarData();
                                  gTaskOnRoutePlan = 1;
                                  $.mobile.changePage("#menu_page", {
                                    transition: "pop",
                                    reverse: true,
                                    changeHash: true,
                                    showLoadMsg: false
                                  });
                                });
                              },
                              TareaEstado.Completada
                            );
                            break;
                          case 2:
                            resumenDeTareaControlador.crearNuevaTarea();
                            actualizarEstadoDeTarea(
                              gTaskId,
                              TareaGeneroGestion.No,
                              item,
                              () => {
                                onResume(() => {
                                  EnviarData();
                                  gTaskOnRoutePlan = 1;
                                });
                              },
                              TareaEstado.Completada
                            );
                            break;
                          default:
                            break;
                        }
                      },
                      "Sonda® SD " + SondaVersion,
                      ["No", "Si"]
                    );
                  } else {
                    actualizarEstadoDeTarea(
                      gTaskId,
                      TareaGeneroGestion.No,
                      item,
                      () => {
                        onResume(() => {
                          EnviarData();
                          gTaskOnRoutePlan = 1;
                          $.mobile.changePage("#menu_page", {
                            transition: "pop",
                            reverse: true,
                            changeHash: true,
                            showLoadMsg: false
                          });
                        });
                      },
                      TareaEstado.Completada
                    );
                  }
                }
              );
            });
          } else {
            notify(
              "Lo sentimos, no se han encontrado razones de No Facturación, por favor, intente nuevamente."
            );
          }
        },
        function(error) {
          notify(error);
        }
      );
    }
  }
}

function ShowDeliveryNoteConfirmationPage() {
  $.mobile.changePage("#summary_page", {
    transition: "flow",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}

function ShorSummaryPage() {
  try {
    LimpiarDatosConsignacion();

    var pNit = vieneDeListadoDeDocumentosDeEntrega ? gNit : $("#txtNIT").val();
    var pCustName = vieneDeListadoDeDocumentosDeEntrega
      ? gClientName
      : $("#txtNombre").val();

    $("#lblClientName_summ").text(pNit + "-" + pCustName);
    $("#lblClientName_summ").attr("taxid", pNit);
    $("#lblClientName_summ").attr("clientid", pNit);
    estaEnConfirmacionDeFacturacion = false;

    $.mobile.changePage("#summary_page", {
      transition: "flow",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
  } catch (e) {
    notify(e.message);
  }
}
function ShowViewPicture() {
  $("#popupPic").popup("open", { positionTo: "window", transtion: "slideup" });
}
function showInvoiceActions(
  pInvoiceId,
  pAmount,
  pClientName,
  isPaidConsignment,
  telephoneNumber,
  isFromDeliveryNote,
  isContingencyDocument,
  taskId,
  isSigned = 0
) {
  try {
    gTaskId = taskId;
    var opcionesAMostrar = [
      { text: "Re-imprimir", value: "reprint" },
      { text: "Ver Detalle", value: "detail" }
    ];
    if (localStorage.getItem("IMPLEMENTS_FEL") === "true") {
      if (isSigned === 0) {
        if (isContingencyDocument === 1) {
          opcionesAMostrar.push({ text: "Solicitar firma", value: "sign" });
        }
      }
    } else {
      opcionesAMostrar.push({ text: "Anular", value: "void" });
    }
    var callback = function(opciones) {
      var config = {
        title: "Opciones",
        items: opciones,
        doneButtonLabel: "Ok",
        cancelButtonLabel: "Cancelar"
      };

      // Show the picker
      window.plugins.listpicker.showPicker(config, function(item) {
        gInvoiceNUM = pInvoiceId;
        switch (item) {
          case "reprint":
            printinvoice(gInvoiceNUM, "*** RE-IMPRESO ***", function() {
              //...
            });
            break;
          case "void":
            if (gIsOnline == EstaEnLinea.Si) {
              if (isFromDeliveryNote === SiNo.Si) {
                navigator.notification.confirm(
                  "¿El producto facturado se encuentra en buen estado?",
                  function(buttonIndex) {
                    guardarInventarioDeFacturaCancelada = buttonIndex === 2;
                    showVoidOptions(pInvoiceId, isPaidConsignment);
                  },
                  "Sonda® SD " + SondaVersion,
                  ["No", "Si"]
                );
              } else {
                showVoidOptions(pInvoiceId, isPaidConsignment);
              }
            } else {
              notify(
                "No tiene conexión al Servidor, por favor intente más tarde"
              );
            }
            break;
          case "detail":
            viewinvoice(gInvoiceNUM, pClientName, pAmount, telephoneNumber);
            break;
          case "asignTelephoneNumberToInvoice":
            $.mobile.changePage("#UiPagetoAssociatePhoneNumerWithInvoice", {
              transition: "flow",
              reverse: true,
              changeHash: true,
              showLoadMsg: false
            });
            break;
          case "sign":
            confirmacionControlador.usuarioDeseaSolicitarFirmaElectronica(1);
            break;
        }
      });
    };

    var reglaServicio = new ReglaServicio();
    reglaServicio.obtenerRegla(
      "AsociarNumeroTelefonicoAFactura",
      function(regla) {
        if (regla.rows.length > 0) {
          if (
            regla.rows.item(0).ENABLED === "Si" ||
            regla.rows.item(0).ENABLED === "SI"
          ) {
            opcionesAMostrar.push({
              text: "Asignar Número",
              value: "asignTelephoneNumberToInvoice"
            });
            callback(opcionesAMostrar);
            reglaServicio = null;
          } else {
            callback(opcionesAMostrar);
            reglaServicio = null;
          }
        } else {
          callback(opcionesAMostrar);
          reglaServicio = null;
        }
      },
      function(err) {
        callback(opcionesAMostrar);
        reglaServicio = null;
        notify(err);
      }
    );
  } catch (e) {
    notify("showInvoiceActions: " + e.message);
  }
}
function showVoidOptions(pInvoiceID, isPaidConsignment) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var pDoc = "";
      var pImg = "";

      var psql = "SELECT * FROM VOID_REASONS ";

      tx.executeSql(
        psql,
        [],
        function(tx, results) {
          var xskus_len = results.rows.length - 1;
          gVoidReasons = [];
          for (var i = 0; i <= xskus_len; i++) {
            try {
              gVoidReasons.push({
                text: results.rows.item(i).REASON_DESCRIPTION,
                value: results.rows.item(i).REASON_ID
              });
            } catch (e) {
              notiy(e.message);
            }
          }

          var config_options = {
            title: "Motivos de anulación",
            items: gVoidReasons,
            doneButtonLabel: "Ok",
            cancelButtonLabel: "Cancelar"
          };

          window.plugins.listpicker.showPicker(config_options, function(item) {
            navigator.notification.confirm(
              "Confirma Anulacion?",
              function(buttonIndex) {
                if (buttonIndex == 2) {
                  my_dialog("Anulando factura", "Procesando...", "close");
                  if (isPaidConsignment === 1) {
                    navigator.notification.confirm(
                      "Desea tomar fotografía del comprobante de anulacion?",
                      function(opcion) {
                        if (opcion === 2) {
                          checkInvoiceIsPosted(
                            pInvoiceID,
                            function() {
                              capturarImagenDeConsignacion(
                                function(imagen) {
                                  ProcessVoidInvoice(
                                    pInvoiceID,
                                    item,
                                    item,
                                    isPaidConsignment,
                                    imagen,
                                    1
                                  );
                                },
                                function(error) {
                                  notify(error);
                                  my_dialog("", "", "close");
                                }
                              );
                            },
                            function(error) {
                              notify(error);
                              my_dialog("", "", "close");
                            }
                          );
                        } else {
                          checkInvoiceIsPosted(
                            pInvoiceID,
                            function() {
                              ProcessVoidInvoice(
                                pInvoiceID,
                                item,
                                item,
                                isPaidConsignment,
                                null,
                                1
                              );
                            },
                            function(error) {
                              notify(error);
                              my_dialog("", "", "close");
                            }
                          );
                        }
                      },
                      "Sonda® SD " + SondaVersion,
                      ["No", "Si"]
                    );
                  } else {
                    checkInvoiceIsPosted(
                      pInvoiceID,
                      function() {
                        ProcessVoidInvoice(
                          pInvoiceID,
                          item,
                          item,
                          isPaidConsignment,
                          null,
                          1
                        );
                      },
                      function(error) {
                        notify(error);
                        my_dialog("", "", "close");
                      }
                    );
                  }
                }
              },
              "Sonda® SD " + SondaVersion,
              ["No", "Si"]
            );
          });
          my_dialog("", "", "close");
        },
        function(err) {
          my_dialog("", "", "close");
          if (err.code != 0) {
            alert("Error processing SQL: " + err.code);
          }
        }
      );
    },
    function(err) {
      if (err.code != 0) {
        alert("Error processing SQL: " + err.code);
      }
    }
  );
}

function GetRoutePlan() {
  try {
    my_dialog("Plan de ruta", "Procesando...", "close");
    setTimeout(function() {
      SocketControlador.socketIo.emit("get_sales_route", {
        default_warehouse: gDefaultWhs,
        routeid: gCurrentRoute,

        loginid: gLastLogin,
        dbuser: gdbuser,
        dbuserpass: gdbuserpass
      });
    }, 2000);
  } catch (e) {
    notify(e.message);
  }
}

function obtenerCuentasDeBancos(callback, errCallback) {
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT BANK, ACCOUNT_NUMBER FROM BANK_ACCOUNTS";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            if (results.rows.length > 0) {
              var cuentasDeBancos = [];
              for (var i = 0; i < results.rows.length; i++) {
                var cuentaDeBanco = {
                  banco: results.rows.item(i).BANK,
                  numeroDeCuenta: results.rows.item(i).ACCOUNT_NUMBER
                };

                cuentasDeBancos.push(cuentaDeBanco);
              }
              callback(cuentasDeBancos);
            } else {
              errCallback({
                code: -1,
                message:
                  "4-Error al obtener las cuentas de bancos: No hay cuentas de bancos configuradas"
              });
            }
          },
          function(tx, err) {
            errCallback({
              code: -1,
              message:
                "3-Error al obtener las cuentas de bancos: " + err.message
            });
          }
        );
      },
      function(err) {
        errCallback({
          code: -1,
          message: "2-Error al obtener las cuentas de bancos: " + err.message
        });
      }
    );
  } catch (e) {
    errCallback({
      code: -1,
      message: "1-Error al obtener las cuentas de bancos: " + e.message
    });
  }
}

function showBankAccounts() {
  try {
    obtenerCuentasDeBancos(
      function(cuentaDeBanco) {
        var items = [];
        for (var i = 0; i < cuentaDeBanco.length; i++) {
          var item = {
            text:
              cuentaDeBanco[i].banco + " - " + cuentaDeBanco[i].numeroDeCuenta,
            value: cuentaDeBanco[i].numeroDeCuenta
          };
          items.push(item);
        }

        var config_options = {
          title: "Cuentas habilitadas",
          items: items,
          doneButtonLabel: "Ok",
          cancelButtonLabel: "Cancelar"
        };

        window.plugins.listpicker.showPicker(config_options, function(item) {
          gSelectedAccount = item;
          $("#lblBankAccount").text(gSelectedAccount.value);
          $("#lblBankName").text(gSelectedAccount.text);
          $("#UiEtiquetaCuentaBancaria").text(gSelectedAccount);
        });
      },
      function(err) {
        notify(err.message);
      }
    );
  } catch (e) {}
}

function AddToTask(data) {
  var pSql = "";
  SONDA_DB_Session.transaction(
    function(tx) {
      pSql = "DELETE FROM TASK WHERE TASK_ID = " + data.row.TASK_ID;
      tx.executeSql(pSql);

      pSql = " INSERT INTO TASK(";
      pSql += "TASK_ID";
      pSql += ", TASK_TYPE";
      pSql += ", TASK_DATE";
      pSql += ", SCHEDULE_FOR";
      pSql += ", CREATED_STAMP";
      pSql += ", ASSIGEND_TO";
      pSql += ", ASSIGNED_BY";
      pSql += ", ACCEPTED_STAMP";
      pSql += ", COMPLETED_STAMP";
      pSql += ", EXPECTED_GPS";
      pSql += ", POSTED_GPS";
      pSql += ", TASK_COMMENTS";
      pSql += ", TASK_SEQ";
      pSql += ", TASK_ADDRESS";
      pSql += ", RELATED_CLIENT_CODE";
      pSql += ", RELATED_CLIENT_NAME";
      pSql += ", TASK_STATUS";
      pSql += ", IS_POSTED";
      pSql += ", TASK_BO_ID";
      pSql += ", RGA_CODE";
      pSql += ", NIT";
      pSql += ", PHONE_CUSTOMER";
      pSql += ", CODE_PRICE_LIST";
      pSql += ", IN_PLAN_ROUTE";
      pSql += ", DEPARTMENT";
      pSql += ", MUNICIPALITY";
      pSql += " ) VALUES (";
      pSql += data.row.TASK_ID;
      pSql += ",'" + data.row.TASK_TYPE + "'";
      pSql += ",'" + data.row.TASK_DATE + "'";
      pSql += ",'" + data.row.SCHEDULE_FOR + "'";
      pSql += ",'" + data.row.TASK_DATE + "'";
      pSql += ",'" + data.row.ASSIGEND_TO + "'";
      pSql += ",'" + data.row.ASSIGNED_BY + "'";
      pSql += ",NULL";
      pSql += ",NULL";
      pSql += ",'" + data.row.EXPECTED_GPS + "'";
      pSql += ",NULL";
      pSql += ",'" + data.row.TASK_COMMENTS + "'";
      pSql += "," + data.row.TASK_SEQ;
      pSql += ",'" + data.row.TASK_ADDRESS + "'";
      pSql += ",'" + data.row.RELATED_CLIENT_CODE + "'";
      pSql += ",'" + data.row.RELATED_CLIENT_NAME + "'";
      pSql += ",'" + data.row.TASK_STATUS + "'";
      pSql += ",3";
      pSql += "," + data.row.TASK_ID;
      pSql += ",'" + data.row.RGA_CODE + "'";
      pSql += ",'" + data.row.NIT + "'";
      pSql += ",'" + data.row.PHONE_CUSTOMER + "'";
      pSql += ",'" + data.row.CODE_PRICE_LIST + "'";
      pSql += ",'" + data.row.IN_PLAN_ROUTE + "'";
      pSql += ",'" + data.row.DEPARTAMENT + "'";
      pSql += ",'" + data.row.MUNICIPALITY + "'";
      pSql += ")";

      tx.executeSql(pSql);
    },
    function(err) {
      my_dialog("", "", "close");
      notify("A2T.CATCH:" + err.message);
    }
  );
}

function PopulateSalesTasks(estadoTarea) {
  try {
    var listaTareas = $("#skus_listview_sales_route");

    SONDA_DB_Session.transaction(
      function(tx) {
        var pDoc = "";
        var pImg = "";

        var psql =
          "SELECT * FROM TASK AS T  WHERE T.TASK_STATUS ='" +
          estadoTarea +
          "' ORDER BY T.TASK_SEQ";

        tx.executeSql(
          psql,
          [],
          function(tx, results) {
            listaTareas.children().remove("li");
            for (var i = 0; i < results.rows.length; i++) {
              var vLI = "";
              var xonclick1 = "";

              if (results.rows.item(i).EXPECTED_GPS === "0,0") {
                xonclick1 = "notify('No hay punto GPS');";
                vLI =
                  '<li data-mini="true" class="ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-forbidden">';
              } else {
                xonclick1 =
                  "TaskNavigateTo('" +
                  results.rows.item(i).EXPECTED_GPS +
                  "','" +
                  results.rows.item(i).RELATED_CLIENT_NAME +
                  "')";
                vLI =
                  '<li data-mini="true" class="ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-navigation">';
              }

              var xonclick2 =
                "InvoiceThisTask(" +
                results.rows.item(i).TASK_ID +
                ",'" +
                results.rows.item(i).RELATED_CLIENT_CODE +
                "','" +
                results.rows.item(i).RELATED_CLIENT_NAME +
                "','" +
                results.rows.item(i).NIT +
                "','" +
                results.rows.item(i).TASK_TYPE +
                "','" +
                results.rows.item(i).TASK_STATUS +
                "')";

              vLI += '<a href="#" onclick="' + xonclick2 + '">';
              vLI += "<h2>";
              vLI += '<span class="small-roboto">';
              vLI += i + ")</span>&nbsp";
              vLI +=
                '<span class="small-roboto">' +
                results.rows.item(i).RELATED_CLIENT_NAME +
                "</span>";
              vLI += "</h2>";
              vLI += "<p>" + results.rows.item(i).TASK_ADDRESS + "</p>";
              vLI += "</a>";
              vLI += '<a href="#" onclick="' + xonclick1 + '">';
              vLI += "</a>";
              vLI += "</li>";

              listaTareas.append(vLI);
              listaTareas.listview("refresh");

              vLI = null;
              xonclick1 = null;
              xonclick2 = null;
            }
            var clientscount = $("#skus_listview_sales_route li").size();

            document.getElementById("lblClientsToVisit").innerText =
              "Plan de ruta (" + clientscount + ")";
            clientscount = null;
          },
          function(tx, err) {
            if (err.code !== 0) {
              notify(
                "No se ha podido crear el listado de tareas debido a: " +
                  err.message
              );
            }
          }
        );
      },
      function(err) {
        if (err.code !== 0) {
          notify(
            "No se ha podido crear el listado de tareas debido a: " +
              err.message
          );
        }
      }
    );
  } catch (e) {
    notify(e.message);
  }
}

function TaskNavigateTo(gps, clientname) {
  try {
    var pUrl = gps.split(",");

    var pGPS = "waze://?ll=" + pUrl[0] + "," + pUrl[1] + "&navigate=yes";

    WazeLink.open(pGPS);
  } catch (e) {
    notify(e.message);
  }
}

function ObtenerCodigoNit(nitCliente, parametroParaNitPorDefecto) {
  return nitCliente == "NULL" ||
    nitCliente == "null" ||
    nitCliente == null ||
    nitCliente == "Cf" ||
    nitCliente == "..."
    ? parametroParaNitPorDefecto.Value
    : nitCliente;
}

function InvoiceThisTask(
  taskid,
  client_code,
  client_name,
  client_nit,
  taskType,
  taskStatus
) {
  try {
    gTaskId = taskid;
    gTaskType = taskType;
    gClientCode = client_code;
    gClientName = client_name;
    esEntregaParcial = false;
    gClientID = client_code;

    if (taskType === "DELIVERY_SD") {
      var tarea = new Tarea();
      tarea.taskId = taskid;
      tarea.taskType = taskType;
      PublicarTareaDeEntrega(tarea);

      ParametroServicio.ObtenerParametro(
        "INVOICE",
        "DEFAULT_NIT_VALUE",
        function(parametroDeNitDefault) {
          gNit = ObtenerCodigoNit(client_nit, parametroDeNitDefault);
          ShowDeliveryPage();
        },
        function(error) {
          gNit = ObtenerCodigoNit(client_nit, { Value: "C/F" });
          ShowDeliveryPage();
        }
      );
    } else {
      if (taskStatus === "COMPLETED") {
        $.mobile.changePage("#UiTaskResumePage", {
          reverse: false,
          changeHash: true,
          showLoadMsg: false
        });
      } else {
        vieneDeListadoDeDocumentosDeEntrega = false;
        ClearUpInvoice();
        PagoConsignacionesServicio.LimpiarTablasTemporales();
        PagoConsignacionesControlador.EstaEnPagoDeConsignacion = false;
        PagoConsignacionesControlador.EstaEnDetalle = false;
        PagoConsignacionesControlador.EstaEnIngresoDeCantidadSku = false;

        var consignmentsClient = 0;
        var totalConsignacion = 0;

        var procesarTareaParaFactura = function(parametroDeNit) {
          if (gClientCode === "C000000") {
            $("#lblClientCode").text(client_code);
            $("#txtNIT").val(parametroDeNit.Value);
            $("#txtNIT").attr("taskid", taskid);

            $("#txtNombre").val(client_name);

            ShowClientPage();
          } else {
            window.ObtenerConsignaciones(
              function(consignaciones) {
                gNit =
                  client_nit == "NULL" ||
                  client_nit == "null" ||
                  client_nit == null ||
                  client_nit == "Cf" ||
                  client_nit == "..."
                    ? parametroDeNit.Value
                    : client_nit;
                if (consignaciones.length > 0) {
                  for (var i = 0; i < consignaciones.length; i++) {
                    var consignacion = consignaciones[i];
                    if (
                      consignacion.CustomerId === gClientCode &&
                      (consignacion.Status === ConsignmentStatus.Activa ||
                        consignacion.Status === ConsignmentStatus.Vencida)
                    ) {
                      consignmentsClient++;
                      totalConsignacion += consignacion.TotalAmount;
                    }
                  }

                  if (totalConsignacion > 0) {
                    document
                      .getElementById("UiClientHasConsignment")
                      .setAttribute(
                        "CONSIGNMENTS",
                        consignmentsClient.toString()
                      );
                    document.getElementById(
                      "UiClientHasConsignment"
                    ).style.display = "block";
                    document.getElementById("UiLblTotalConsignment").innerText =
                      currencySymbol +
                      ". " +
                      format_number(totalConsignacion, 2);
                    document.getElementById(
                      "UiBtnTotalEnProcesoDeConsignacion"
                    ).innerText =
                      currencySymbol +
                      ". " +
                      format_number(totalConsignacion, 2);
                    document.getElementById("UiTotalCash").innerText =
                      currencySymbol + ". " + "0.00";
                    document.getElementById("UiTotalConsignacion").innerText =
                      currencySymbol + ". " + "0.00";
                    document.getElementById("UiTotalRecogido").innerText =
                      currencySymbol + ". " + "0.00";

                    var listaConsignaciones = $("#UiListaConsignacionesAPagar");
                    listaConsignaciones.children().remove("li");
                    listaConsignaciones = null;

                    var objetoListaDetalleDeConsignacion = $(
                      "#UiListaDetalleDeConsignacionAPagar"
                    );
                    objetoListaDetalleDeConsignacion.children().remove("li");
                    objetoListaDetalleDeConsignacion = null;

                    $("#lblClientCode").text(client_code);
                    $("#txtNIT").val(gNit);
                    $("#txtNIT").attr("taskid", taskid);

                    $("#txtNombre").val(client_name);

                    ShowClientPage();
                  } else {
                    document
                      .getElementById("UiClientHasConsignment")
                      .setAttribute(
                        "CONSIGNMENTS",
                        consignmentsClient.toString()
                      );
                    document.getElementById(
                      "UiClientHasConsignment"
                    ).style.display = "none";
                    document.getElementById("UiLblTotalConsignment").innerText =
                      currencySymbol +
                      ". " +
                      format_number(totalConsignacion, 2);

                    $("#lblClientCode").text(client_code);
                    $("#txtNIT").val(gNit);
                    $("#txtNIT").attr("taskid", taskid);

                    $("#txtNombre").val(client_name);

                    ShowClientPage();
                  }
                } else {
                  document
                    .getElementById("UiClientHasConsignment")
                    .setAttribute(
                      "CONSIGNMENTS",
                      consignmentsClient.toString()
                    );
                  document.getElementById(
                    "UiClientHasConsignment"
                  ).style.display = "none";
                  document.getElementById("UiLblTotalConsignment").innerText =
                    currencySymbol + ". " + format_number(totalConsignacion, 2);

                  $("#lblClientCode").text(client_code);
                  $("#txtNIT").val(gNit);
                  $("#txtNIT").attr("taskid", taskid);

                  $("#txtNombre").val(client_name);

                  ShowClientPage();
                }
              },
              function(error) {
                InteraccionConUsuarioServicio.desbloquearPantalla();
                notify(error.message);
              }
            );
          }
        };

        ParametroServicio.ObtenerParametro(
          "INVOICE",
          "DEFAULT_NIT_VALUE",
          function(parametroDeNitDefault) {
            procesarTareaParaFactura(parametroDeNitDefault);
          },
          function(error) {
            procesarTareaParaFactura({ Value: "C/F" });
          }
        );
      }
    }
  } catch (e) {
    InteraccionConUsuarioServicio.desbloquearPantalla();
    notify(e.message);
  }
}

function ShowDeliveryPage() {
  try {
    $.mobile.changePage("#UiDeliveryPage", {
      transition: "none",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
  } catch (e) {
    notify(e.message);
  }
}

function ShowClientPage() {
  try {
    vieneDeListadoDeDocumentosDeEntrega = false;
    $.mobile.changePage("#pos_client_page", {
      transition: "none",
      reverse: true,
      changeHash: true,
      showLoadMsg: false
    });
  } catch (e) {
    notify(e.message);
  }
}

function GetPriceLists() {
  var data = {
    default_warehouse: gDefaultWhs,
    routeid: gCurrentRoute,
    loginid: gLastLogin,
    dbuser: gdbuser,
    dbuserpass: gdbuserpass
  };

  SocketControlador.socketIo.emit("GetPriceLists", data);
}

function validarDetalleOrdenDeVenta(callBack, errcallBack) {
  try {
    var contadorSkusPendientesDeSerie = 0;
    var listadoDeSkusOrdenDeVenta = document.querySelectorAll(
      "#pos_skus_page_listview li"
    );
    for (var i = 0; i < listadoDeSkusOrdenDeVenta.length; i++) {
      var objetoSku = listadoDeSkusOrdenDeVenta[i];
      var serieSku = objetoSku.attributes["skuserie"].nodeValue;
      var requiereSerie = objetoSku.attributes["requiereserie"].nodeValue;

      if (serieSku === "0" && parseInt(requiereSerie) === 1) {
        contadorSkusPendientesDeSerie++;
      }
      objetoSku = null;
      serieSku = null;
    }
    callBack(contadorSkusPendientesDeSerie);
    listadoDeSkusOrdenDeVenta = null;
  } catch (e) {
    errcallBack(e);
  }
}

function GetNexSequence(sequenceName, callback, errCallback) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql =
        "SELECT COUNT(SEQUENCE_NAME) CNT FROM SWIFT_SEQUENCES WHERE SEQUENCE_NAME = '" +
        sequenceName +
        "'";
      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          if (results.rows.item(0).CNT === 0) {
            sql =
              "INSERT INTO SWIFT_SEQUENCES(SEQUENCE_NAME,CURRENT_NUMBER) VALUES ('" +
              sequenceName +
              "',1) ";
            tx.executeSql(sql);
          }
          sql =
            "SELECT (CURRENT_NUMBER+1) NEXT_NUMBER FROM SWIFT_SEQUENCES WHERE SEQUENCE_NAME='" +
            sequenceName +
            "'";
          tx.executeSql(
            sql,
            [],
            function(tx, results) {
              sql =
                "UPDATE SWIFT_SEQUENCES SET CURRENT_NUMBER=" +
                results.rows.item(0).NEXT_NUMBER;
              sql += " WHERE SEQUENCE_NAME='" + sequenceName + "'";
              tx.executeSql(sql);
              callback(new Number(results.rows.item(0).NEXT_NUMBER) * -1);
            },
            function(tx, err) {
              if (err.code !== 0) {
                errCallback(err);
              }
            }
          );
        },
        function(tx, err) {
          if (err.code != 0) {
            errCallback(err);
          }
        }
      );
    },
    function(err) {
      errCallback(err);
    }
  );
}

function AddSeriesForSku(sku, skuName, precioSku) {
  if (vieneDeListadoDeDocumentosDeEntrega) {
    return;
  }
  try {
    var labelSku = $("#UiLblSkuSerie");
    labelSku.attr("SKU", sku);
    labelSku.attr("SKU_NAME", skuName);
    labelSku.attr("SKU_PRICE", precioSku);

    var serieControlador = new SerieControlador();
    serieControlador.MostrarPantallaDeSeries();
    serieControlador = null;
    labelSku = null;
  } catch (e) {
    notify(e.message);
  }
}

function PublicarTareaDeEntrega(_tarea) {
  try {
    var msg = new TareaMensaje(this);
    msg.tarea = _tarea;
    mensajero.publish(msg, getType(TareaMensaje));
  } catch (e) {
    notify("Error, PublicarTareaDeEntrega: " + e.message);
  }
}

function getType(sender) {
  var tp = sender.name;
  return tp;
}

function DelegarGlobalUtils(messengerLocal) {
  _globalUtils.tokenListaDeDetalleDeDemandaDeDespachoConsolidado = messengerLocal.subscribe(
    listaDeDetalleConsolidadoEntregado,
    getType(ListaDeDetalleDeDemandaDeDespachoConsolidadoMensaje),
    _globalUtils
  );
}

function listaDeDetalleConsolidadoEntregado(message, subscriber) {
  subscriber.listaDeDetalleDeDemandaDeDespachoParaProcesoDeEntrega =
    message.listaDeDetalleDeDemandaDeDespachoConsolidado;
}

function lanzarEventoDePerdidaDeConexionAlServidor() {
  // Creamos el evento.
  var event = document.createEvent("Event");

  /* Definimos el nombre del evento que es 'build'.*/
  // ReSharper disable once Html.EventNotResolved
  event.initEvent("server-connection-lost", true, true);

  //disparamos el evento
  document.dispatchEvent(event);

  event = null;
}

function delegarSocketsDeObjetosJs(socketIo) {
  var transferenciaDetalleControlador = new TransferenciaDetalleControlador(),
    notificacionControlador = new NotificacionControlador();

  transferenciaDetalleControlador.delegarSockets(socketIo);
  notificacionControlador.delegarSockets(socketIo);
}

function habilitarOpcionesDeFacturacionConCredito(cliente) {
  var uiColLblChashAmount = $("#UiColLblChashAmount");
  var uiColLblCreditAmount = $("#UiColLblCreditAmount");
  var uiColTxtCashAmount = $("#UiColTxtCashAmount");
  var uiColLblCreditAmountTotal = $("#UiColLblCreditAmountTotal");
  var liInvoiceDueDate = $("#UiLiInvoiceDueDate");
  var uiLblInvoiceDueDate = $("#UiLblInvoiceDueDate");
  var uiRowBtnConsignment = $("#UiRowBtnConsignment");
  var uiLblInvoiceDueDateInfo = $("#UiLblInvoiceDueDateInfo");

  if (cliente.canBuyOnCredit) {
    uiColLblCreditAmountTotal.css("display", "block");
    uiColLblCreditAmount.css("display", "block");
    liInvoiceDueDate.css("display", "block");

    uiLblInvoiceDueDate.text(cliente.invoiceDueDate.split(" ")[0]);
    uiLblInvoiceDueDateInfo.text(
      "Fecha de Vencimiento: (" +
        cliente.currentAccountingInformation.extraDays +
        " Días)"
    );

    uiColLblChashAmount.css("width", "50%");
    uiColLblCreditAmount.css("width", "50%");
    uiColTxtCashAmount.css("width", "50%");
    uiColLblCreditAmountTotal.css("width", "50%");
    uiRowBtnConsignment.css("display", "none");
  } else {
    uiLblInvoiceDueDateInfo.text("");
    uiColLblCreditAmount.css("display", "none");
    liInvoiceDueDate.css("display", "none");
    uiColLblChashAmount.css("width", "100%");

    uiColTxtCashAmount.css("width", "100%");
    uiColLblCreditAmountTotal.css("display", "none");
  }

  uiLblInvoiceDueDateInfo = null;
  uiColLblChashAmount = null;
  uiColLblCreditAmount = null;
  uiColTxtCashAmount = null;
  uiColLblCreditAmountTotal = null;
  liInvoiceDueDate = null;
  uiLblInvoiceDueDate = null;
  uiRowBtnConsignment = null;
}

function dividirMontoDeFacturaEntreEfectivoYCreditoDisponibleDeCliente(
  cliente,
  callback
) {
  if (
    cliente.canBuyOnCredit &&
    cliente.currentAccountingInformation.outstandingBalance > 0
  ) {
    if (
      gInvocingTotal <= cliente.currentAccountingInformation.outstandingBalance
    ) {
      cliente.totalInvoicedIsOnCredit = true;
      cliente.creditAmount = gInvocingTotal;
      cliente.cashAmount = 0;
      gPagado = 1;
    } else {
      cliente.cashAmount =
        gInvocingTotal -
        cliente.currentAccountingInformation.outstandingBalance;
      cliente.creditAmount =
        cliente.currentAccountingInformation.outstandingBalance;
      gPagado = gInvocingTotal === cliente.cashAmount + cliente.creditAmount;
    }

    cliente.invoiceHasCredit = true;

    callback(cliente);
  } else {
    cliente.cashAmount = gInvocingTotal;
    cliente.creditAmount = 0;
    cliente.totalInvoicedIsOnCredit = false;
    cliente.invoiceHasCredit = false;
    callback(cliente);
  }
}

function actualizarConfiguracionDeFormatoDeCantidades(
  currencySymbol,
  decimalPlaces
) {
  window.accounting.settings = {
    currency: {
      symbol: currencySymbol + ".", // default currency symbol is 'Q.'
      format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
      decimal: ".", // decimal point separator
      thousand: ",", // thousands separator
      precision: decimalPlaces // decimal places
    },
    number: {
      precision: decimalPlaces, // default precision on numbers is 0
      thousand: ",",
      decimal: "."
    }
  };
}

function publicarClienteParaProcesoDeCobroDeFacturasVencidas(callback) {
  var cliente = new Cliente();
  var clienteMensaje = new ClienteMensaje(this);

  cliente.clientId = gClientCode;
  cliente.clientName = gClientName;
  cliente.clientTaxId = gNit;

  clienteMensaje.cliente = cliente;
  clienteMensaje.vistaCargandosePorPrimeraVez = true;
  clienteMensaje.tipoDePagoAProcesar = TipoDePagoDeFactura.FacturaVencida;

  mensajero.publish(clienteMensaje, getType(ClienteMensaje));

  callback();
}

function rellenarPalabra(
  cantidadDeCaracteresCorrectos,
  caracterDeRelleno,
  palabraARellenar
) {
  if (palabraARellenar.length < cantidadDeCaracteresCorrectos) {
    palabraARellenar = caracterDeRelleno + palabraARellenar;
    return rellenarPalabra(
      cantidadDeCaracteresCorrectos,
      caracterDeRelleno,
      palabraARellenar
    );
  } else {
    return palabraARellenar.toString();
  }
}

function cortarLineaDeTexto(texto, maximoDeCaracteres) {
  var objetoARetornar = [];
  var palabras = texto.split(/\b/);

  var lineaActual = "";
  var ultimoEspacio = "";
  palabras.forEach(function(d) {
    var anterior = lineaActual;
    lineaActual += ultimoEspacio + d;

    var longitud = lineaActual.length;

    if (longitud > maximoDeCaracteres) {
      objetoARetornar.push(anterior.trim());
      lineaActual = d;
      ultimoEspacio = "";
    } else {
      var aplica = lineaActual.match(/(.*)(\s+)$/);
      ultimoEspacio = (aplica && aplica.length === 3 && aplica[2]) || "";
      lineaActual = (aplica && aplica.length === 3 && aplica[1]) || lineaActual;
    }
  });

  if (lineaActual) {
    objetoARetornar.push(lineaActual.trim());
  }

  return objetoARetornar;
}

function goHome(
  transition,
  reverse = false,
  changeHash = false,
  showLoadMsg = false
) {
  $.mobile.changePage("#menu_page", {
    transition,
    reverse,
    changeHash,
    showLoadMsg
  });
}

function verificarDatosDeFacturacion(callback) {
  var nit = $("#txtNIT").val();
  var nombreFacturacion = $("#txtNombre").val();

  if (!nit || !nombreFacturacion) {
    notify(
      "Los datos de facturación no debn estar vacíos, por favor verifique y vuelva a intentar."
    );
  } else {
    callback(nit, nombreFacturacion);
  }
}
