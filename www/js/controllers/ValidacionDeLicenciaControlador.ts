/// <reference path="../../../typings/tsd.d.ts" />

class ValidacionDeLicenciaControlador {
  validacionDeLicenciaServicio = new ValidacionDeLicenciaServicio();
  constructor(public mensajero: Messenger) {
    localStorage.setItem("isPrinterZebra", "0");
  }

  delegarValidacionDeLicenciaControlador() {
    $("#btnLogme").bind("touchstart", () => {
      this.validateCredentials();
    });

    $("#txtPin").keyup(event => {
      if (event.keyCode === 13) {
        this.validateCredentials();
        this.limpiarInicioDeRuta();
      }
    });
  }

  validateCredentials() {
    pUserID = $("#txtUserID").val();
    pPinCode = $("#txtPin").val();
    localStorage.setItem("APP_IS_READY", "0");
    
    if (isNaN(pPinCode)) {
      my_dialog("", "", "close");
      notify("ERROR, Debe ingresar un valor numerico");
      $("#txtPin").val("");
      $("#txtPin").focus();
    } else {
      if (pPinCode === "") {
        my_dialog("", "", "close");
        notify("ERROR, ingrese usuario/pin.");
        return -1;
      }
      if (navigator.connection.type === "none") {
        notify(
          "Debe tener conectividad a Internet para poder iniciar sesión. Por favor, verifique y vuelva a intentar."
        );
        return -1;
      } else {
        my_dialog("Espere...", "validando usuario y password", "open");
        this.validarLicencia(pUserID, pPinCode, true);
      }
    }
  }

  fromDisconet: Boolean = false;
  validarLicencia(
    usuario: any,
    contraseña: any,
    estaIniciandoSession: boolean
  ) {
    this.validacionDeLicenciaServicio.validarLicencia(
      usuario,
      contraseña,
      data => {
        try {
          const globalUtilsServicio = new GlobalUtilsServicio(),
            tareaDetalleControlador = new TareaDetalleControlador(
              this.mensajero
            ),
            consultaDeInventarioPorZonaControlador = new ConsultaDeInventarioPorZonaControlador(),
            impresionManifiestoControlador = new ImpresionManifiestoControlador(),
            unidadesDeMedidaTomaDeInventarioControlador = new UnidadesDeMedidaTomaDeInventarioControlador(
              this.mensajero
            );

          //socket = io.connect(data.CommunicationAddress);
          socket = io.connect("http://190.5.93.109:1987");
          localStorage.setItem("pUserID", usuario);
          localStorage.setItem("pUserCode", contraseña);

          socket.on("connect", () => {
            try {
              // estaCargandoInicioRuta = 1;
              if (gIsOnline === 0) {
                DeviceIsOnline();

                socket.emit("IdentifyDeviceInRoute", {
                  user: localStorage.getItem("pUserID"),
                  routeId: gCurrentRoute,
                  deviceId: device.uuid,
                  message: `Registrando desde la aplicacion nueva ${SondaVersion}`
                });
              }

              $(".networkclass").text(
                tipoDeRedALaQueEstaConectadoElDispositivo
              );
              $(".networkclass").buttonMarkup({ icon: "cloud" });

              gIsOnline = 1;

              //Delegar Sockets
              if (!this.fromDisconet) {
                globalUtilsServicio.delegarSockets(socket);
                tareaDetalleControlador.delegarSockets(socket);
                consultaDeInventarioPorZonaControlador.delegarSockets(socket);
                impresionManifiestoControlador.delegarSockets(socket);
                unidadesDeMedidaTomaDeInventarioControlador.delegarSockets(
                  socket
                );
                DelegarABroadcast(socket);
                DelegarSocketsListadoOrdenDeVentaControlador(socket);
              }

              //Verificar estado de Sesion
              CheckforOffline();
              if (localStorage.getItem("POS_STATUS") === "OPEN") {
                EnviarData();
              }
            } catch (ex) {
              notify(`error: ${ex.message}`);
            }
          });

          socket.on("disconnect", () => {
            this.fromDisconet = true;
            $(".networkclass").text("OFF");
            $(".networkclass").buttonMarkup({ icon: "forbidden" });

            gIsOnline = 0;

            if (socket.connected) {
              DeviceIsOnline();
            } else {
              if (estaCargandoInicioRuta === 1) {
                //INFO: Asegurar limpiar data que se hara obtenido en el intento de inicio de ruta.
                console.log("Registros obtenidos hasta el momento de desconexion => " + gInsertsInitialRoute.length);
                gInsertsInitialRoute.length = 0;

                BorrarTablasParaInicioDeRuta();
                estaCargandoInicioRuta = 0;
                notify("Ha perdido la conexión a internet.");

                $("#btnStartPOS_action").css("display", "none");

                $.mobile.changePage("#login_page", {
                  transition: "flow",
                  reverse: true,
                  showLoadMsg: false
                });
                DesBloquearPantalla();
              } else if (estaEnControlDeFinDeRuta) {
                DesBloquearPantalla();
                my_dialog("", "", "close");
              }
            }
          });

          socket.on("error_message", data => {
            notify(data.message);
          });

          if (estaIniciandoSession) {
            let to: any = setTimeout(() => {
              socket.emit("validatecredentials", {
                loginid: usuario,
                pin: contraseña,
                uuid: device.uuid,
                validationtype: data.ValidationType,
                version: SondaVersion
              });
              clearTimeout(to);
            }, 1000);
          }
        } catch (e) {
          my_dialog("", "", "close");
          notify(e.message);
        }
        return -1;
      },
      err => {
        my_dialog("", "", "close");
        notify(err.message);
      }
    );
  }

  limpiarInicioDeRuta() {
    $("#UiImgUsuario").attr("src", "");
    $("#UiLblLogin").text("...");
    $("#UiLblRuta").text("...");
    $("#UiLblBodegaVenta").text("...");
    $("#UiLblBodegaVentaNombre").text("...");
    $("#UiLblBodegaPreventa").text("...");
    $("#UiLblBodegaPreventaNombre").text("...");

    $("#UiLblAutorizacion").text("...");
    $("#UiLblSerie").text("...");
    $("#UiLblFechaAutorizacion").text("....-..-..");
    $("#UiLblFechaVencimiento").text("...-..-..");
    $("#UiLblFacturaInicio").text("0");
    $("#UiLblFacturaFinal").text("0");
    $("#UiLblFacturaActual").text("0");

    $("#UiSecuenciaDeDocumentos")
      .children()
      .remove("li");
    $("#UiResumenDeTareas")
      .children()
      .remove("li");
    $("#UiResumenDeCantidad")
      .children()
      .remove("li");

    $("#UiAcordionInformacionUsuario").collapsible(
      "option",
      "collapsed",
      false
    );
  }
}
