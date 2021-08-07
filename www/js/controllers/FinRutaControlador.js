var _formatoImpresion = "";
var _fila = 150;
var _actualizandoRuta = false;

function DelegarAFinDeRuta() {
  $("#linkfinishroute").bind("touchstart", function() {
    ValidarFinDeRuta();
  });
  $("#btnImprimirReporteFinDeRuta").bind("touchstart", function() {
    ImprimirFinDia();
  });
  $("#UiFinRuta").on("pageshow", function() {
    my_dialog("", "", "close");
    var mainNavBar = $("#NavBarFinishDayMain");
    var secondNavBar = $("#NavBarFinishDayAlternate");

    if (localStorage.getItem("isPrinterZebra") === "1") {
      mainNavBar.css("display", "none");
      secondNavBar.css("display", "block");
    } else {
      mainNavBar.css("display", "block");
      secondNavBar.css("display", "none");
    }
  });
  $("#btnImprimirReporteDeFinDeRuta").on("click", function() {
    var printMacAddress = localStorage.getItem("PRINTER_ADDRESS");
    if (
      printMacAddress !== undefined &&
      printMacAddress !== "" &&
      printMacAddress !== null &&
      printMacAddress !== "undefined"
    ) {
      printMacAddress = null;
      ImprimirFinDia();
    } else {
      notify("No tiene impresora asociada.");
      printMacAddress = null;
      _actualizandoRuta = false;
    }
  });

  $("#btnFinalizarRutaSinImprimirReporteDeFinDeRuta").on("click", function() {
    ImprimirFinDia();
  });
}

function ValidarFinDeRuta() {
  try {
    var verificarCantidadDeTareasFinalizadas = function(documentosDeFinDeRuta) {
      ObtenerReglas(
        "ValidarTareasDePreventa",
        function(reglas) {
          if (
            reglas.rows.length >= 1 &&
            reglas.rows.item(0).ENABLED.toUpperCase() === "SI" &&
            documentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta.Tareas]
              .documentos.length > 0
          ) {
            notify(
              "Debe de completar todas las tareas de Pre Venta para finalizar ruta."
            );
            return;
          } else {
            MostrarPantallaDeControlDeFinDeRuta(documentosDeFinDeRuta);
          }
        },
        function(error) {
          my_dialog("", "", "close");
          notify(error);
        }
      );
    };

    ObtenerDocumentosParaControlDeFinDeRuta(
      function(documentos) {
        verificarCantidadDeTareasFinalizadas(documentos);
      },
      function(errorMessage) {
        notify(errorMessage);
      }
    );
  } catch (err) {
    notify(
      "No se pudieron realizar las validaciones del fin de ruta debido a: " +
        err.message
    );
  }
}

function MostrarFinDeRuta() {
  _actualizandoRuta = false;
  $.mobile.changePage("#UiFinRuta", {
    transition: "flow",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
  //_formatoImpresion = "! 0 50 _len_ 50 1 \r\n";
  _formatoImpresion = "! U1 LMARGIN 10 \r\n";
  _formatoImpresion = _formatoImpresion + "! U \r\n";
  _formatoImpresion = _formatoImpresion + "! U1 PAGE-WIDTH 1400 \r\n";
  _formatoImpresion = _formatoImpresion + "ON-FEED IGNORE \r\n";
  _formatoImpresion =
    _formatoImpresion +
    "CENTER 550 T 1 2 0 10 " +
    localStorage.getItem("POS_SAT_BRANCH_NAME").toString() +
    "\r\n";
  if (
    localStorage.getItem("POS_SAT_BRANCH_ADDRESS").toString() != null &&
    localStorage.getItem("POS_SAT_BRANCH_ADDRESS").toString() !== "null"
  ) {
    _formatoImpresion =
      _formatoImpresion +
      "CENTER 550 T 0 2 0 90 " +
      localStorage.getItem("POS_SAT_BRANCH_ADDRESS").toString() +
      "\r\n";
  }
  _fila = 150;
  GenerarReporte();
}

function UsuarioImprimeFactura(optionPrint) {
  try {
    if (_actualizandoRuta === false) {
      _actualizandoRuta = true;
      var data = {
        routeid: gCurrentRoute,
        default_warehouse: gDefaultWhs,
        dbuser: gdbuser,
        dbuserpass: gdbuserpass,
        optionPrint: optionPrint
      };
      socket.emit("SetActiveRoute", data);
      EnviarBorradoresDeBonificaciones(
        OrigenDeEnvioDeBorradoresDeBonificacion.FinDeRuta
      );
    }
  } catch (err) {
    _actualizandoRuta = false;
    notify("Validar: " + err.message);
  }
}

function ImprimirFinDia() {
  my_dialog("", "", "close");
  my_dialog("Espere...", "validando impresora", "open");
  var impresionServicio = new ImpresionServicio();
  if (
    localStorage.getItem("PRINTER_ADDRESS") !== null &&
    localStorage.getItem("PRINTER_ADDRESS") !== ""
  ) {
    impresionServicio.validarEstadosYImprimir(
      localStorage.getItem("isPrinterZebra") === "1",
      localStorage.getItem("PRINTER_ADDRESS"),
      _formatoImpresion,
      true,
      function(resultado) {
        if (resultado.resultado === ResultadoOperacionTipo.Exitoso) {
          //BorrarDatosTablas();
          MostrarPantallaDeInicioDeSesion();
        } else {
          if (localStorage.getItem("isPrinterZebra") !== "1") {
            notify(resultado.mensaje);
          }
          _actualizandoRuta = false;
        }
        my_dialog("", "", "close");
      }
    );
  } else {
    //BorrarDatosTablas();
    MostrarPantallaDeInicioDeSesion();
    my_dialog("", "", "close");
  }
}

function BorrarDatosTablas() {
  try {
    var establecerValoresIniciales = function() {
      localStorage.setItem("LOGIN_STATUS", "CLOSE");
      localStorage.setItem("POS_STATUS", "CLOSE");
      localStorage.setItem("SeCargaronListas", "NO");
      var btnStartPosAction = $("#btnStartPOS_action");
      btnStartPosAction.css("display", "none");
      btnStartPosAction = null;
      _actualizandoRuta = false;
    };

    LimpiarBaseDeDatosCompleta(establecerValoresIniciales, function(error) {
      notify(error);
    });
  } catch (e) {
    notify("Error al finalizar la ruta..." + e.message);
  }
}

function GenerarReporte() {
  try {
    //ConectarImpresora(localStorage.getItem('PRINTER_ADDRESS'), function () {
    ObtenerPagos(
      function(pagos) {
        GenerarReportePagos(
          pagos,
          function() {
            ObtenerPagosPorConsignacion(
              function(consignaciones) {
                GenerarReporteConsignacion(
                  consignaciones,
                  function() {
                    ObtenerVentas(
                      function(ventas) {
                        GenerarReporteVentas(
                          ventas,
                          function() {
                            ObtenerVentasPorCliente(
                              function(ventasPorCliente) {
                                GenerarReporteVentasPorCliente(
                                  ventasPorCliente,
                                  function() {
                                    ObtenerProductosDeOrdenesDeVenta(
                                      function(ordenes) {
                                        GenerarReporteDeProductosDeOrdenesDeVenta(
                                          ordenes,
                                          function() {
                                            ObtenerClientesDeOrdenesDeVenta(
                                              function(ordenes) {
                                                GenerarReporteDeClientesDeOrdenesDeVenta(
                                                  ordenes,
                                                  function() {
                                                    _fila += parseInt(80);
                                                    _formatoImpresion =
                                                      _formatoImpresion +
                                                      "L 5 " +
                                                      _fila +
                                                      " 570 " +
                                                      _fila +
                                                      " 1\r\n";
                                                    _fila += parseInt(10);
                                                    _formatoImpresion =
                                                      _formatoImpresion +
                                                      "LEFT 20 T 0 2 0 " +
                                                      _fila +
                                                      " Firma Vendedor\r\n";

                                                    _fila += parseInt(80);
                                                    _formatoImpresion =
                                                      _formatoImpresion +
                                                      "L 5 " +
                                                      _fila +
                                                      " 570 " +
                                                      _fila +
                                                      " 1\r\n";
                                                    _fila += parseInt(10);
                                                    _formatoImpresion =
                                                      _formatoImpresion +
                                                      "LEFT 20 T 0 2 0 " +
                                                      _fila +
                                                      " Firma Supervisor\r\n";

                                                    _fila += parseInt(50);
                                                    _formatoImpresion =
                                                      _formatoImpresion +
                                                      "CENTER 550 T 0 2 0 " +
                                                      _fila +
                                                      " " +
                                                      getDateTime() +
                                                      " / RUTA " +
                                                      gCurrentRoute +
                                                      " \r\n";

                                                    _formatoImpresion =
                                                      _formatoImpresion +
                                                      "L 5  80 570 80 1\r\nPRINT\r\n";
                                                    _formatoImpresion =
                                                      "! 0 50 50 " +
                                                      (_fila + 80) +
                                                      " 1 \r\n" +
                                                      _formatoImpresion;

                                                    BorrarDatosTablas();
                                                  },
                                                  function(err) {
                                                    notify(err);
                                                  }
                                                );
                                              },
                                              function(err) {
                                                notify(err);
                                              }
                                            );
                                          },
                                          function(err) {
                                            notify(err);
                                          }
                                        );
                                      },
                                      function(err) {
                                        notify(err);
                                      }
                                    );
                                  },
                                  function(err) {
                                    notify(err);
                                  }
                                );
                              },
                              function(err) {
                                notify(err);
                              }
                            );
                          },
                          function(err) {
                            notify(err);
                          }
                        );
                      },
                      function(err) {
                        notify(err);
                      }
                    );
                  },
                  function(err) {
                    notify(err);
                  }
                );
              },
              function(err) {
                notify(err);
              }
            );
          },
          function(err) {
            notify(err);
          }
        );
      },
      function(err) {
        notify(err);
      }
    );
    //});
  } catch (err) {
    notify("GenerarReporte: " + err.message);
  }
}

function GenerarReportePagos(pagos, callback, errCallBack) {
  try {
    if (pagos.rows.length > 0) {
      document.getElementById("acordionPagos").style.display = "";

      _formatoImpresion =
        _formatoImpresion + "CENTER 550 T 0 3 0 " + _fila + " Pagos  \r\n";
      _fila += parseInt(30);
      $("#lstReportePagos")
        .children()
        .remove("li");
      for (var i = 0; i < pagos.rows.length; i++) {
        var tipoDePago = "";
        switch (pagos.rows.item(i).PAYMENT_TYPE) {
          case "CONSIGNMENT":
            tipoDePago = "Consignacion";
            break;
          case "PMCASH":
            tipoDePago = "Contado";
            break;
        }
        var vLi =
          " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
        vLi = vLi + " <p><h4>";
        vLi = vLi + tipoDePago;
        vLi = vLi + " </h4></p> ";
        vLi =
          vLi +
          " <p><span class='ui-li-count' style='position:absolute; top:70%'>";
        vLi =
          vLi + DarFormatoAlMonto(format_number(pagos.rows.item(i).TOTAL, 2));
        vLi = vLi + "  </span></p></li>";

        $("#lstReportePagos").append(vLi);
        $("#lstReportePagos").listview("refresh");

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 20 T 0 2 0 " +
          _fila +
          " " +
          tipoDePago +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "RIGHT 550 T 0 2 0 " +
          (_fila - 30) +
          " " +
          DarFormatoAlMonto(format_number(pagos.rows.item(i).TOTAL, 2)) +
          "\r\n";
        _fila += parseInt(10);

        if (i === pagos.rows.length - 1) {
          _fila += parseInt(10);
          _formatoImpresion =
            _formatoImpresion + "L 5 " + _fila + " 570 " + _fila + " 1\r\n";
          _fila += parseInt(10);
        }
      }
    } else {
      document.getElementById("acordionPagos").style.display = "none";
    }
    callback();
  } catch (err) {
    errCallBack("GenerarReportePagos: " + err.message);
  }
}

function GenerarReporteConsignacion(consignaciones, callback, errCallBack) {
  try {
    if (consignaciones.rows.length > 0) {
      document.getElementById("acordionConsignacion").style.display = "";

      _formatoImpresion =
        _formatoImpresion +
        "CENTER 550 T 0 3 0 " +
        _fila +
        " Consignacion  \r\n";
      _fila += parseInt(30);
      $("#lstReporteConsginacion")
        .children()
        .remove("li");
      for (var i = 0; i < consignaciones.rows.length; i++) {
        var vLi =
          " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
        vLi = vLi + " <p><h4>";
        vLi = vLi + consignaciones.rows.item(i).SKU;
        vLi = vLi + " </h4></p> ";
        vLi = vLi + " <p><b>Cantidad: </b><span> ";
        vLi = vLi + format_number(consignaciones.rows.item(i).QTY);
        vLi = vLi + " </span> ";
        vLi =
          vLi +
          " <span class='ui-li-count' style='position:absolute; top:70%'>";
        vLi =
          vLi +
          DarFormatoAlMonto(
            format_number(consignaciones.rows.item(i).TOTAL, 2)
          );
        vLi = vLi + "  </span></p></li>";

        $("#lstReporteConsginacion").append(vLi);
        $("#lstReporteConsginacion").listview("refresh");

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " " +
          consignaciones.rows.item(i).SKU +
          "/" +
          consignaciones.rows.item(i).SKU_NAME +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " Cantidad:" +
          format_number(consignaciones.rows.item(i).QTY) +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "RIGHT 550 T 0 2 0 " +
          (_fila - 30) +
          " " +
          DarFormatoAlMonto(
            format_number(consignaciones.rows.item(i).TOTAL, 2)
          ) +
          "\r\n";
        _fila += parseInt(10);

        if (i === consignaciones.rows.length - 1) {
          _fila += parseInt(10);
          _formatoImpresion =
            _formatoImpresion + "L 5 " + _fila + " 570 " + _fila + " 1\r\n";
          _fila += parseInt(10);
        }
      }
    } else {
      document.getElementById("acordionConsignacion").style.display = "none";
    }
    callback();
  } catch (err) {
    errCallBack("GenerarReporteConsignacion: " + err.message);
  }
}

function GenerarReporteVentas(ventas, callback, errCallBack) {
  try {
    if (ventas.rows.length > 0) {
      document.getElementById("acordionVentas").style.display = "";

      _formatoImpresion =
        _formatoImpresion + "CENTER 550 T 0 3 0 " + _fila + " Ventas  \r\n";
      _fila += parseInt(30);
      $("#lstReporteVentas")
        .children()
        .remove("li");
      for (var i = 0; i < ventas.rows.length; i++) {
        var vLi =
          " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
        vLi = vLi + " <p><h4>";
        vLi = vLi + ventas.rows.item(i).SKU;
        vLi = vLi + " </h4></p> ";
        vLi = vLi + " <p><b>Cantidad: </b><span> ";
        vLi = vLi + format_number(ventas.rows.item(i).QTY);
        vLi = vLi + " </span> ";
        vLi =
          vLi +
          " <span class='ui-li-count' style='position:absolute; top:70%'>";
        vLi =
          vLi + DarFormatoAlMonto(format_number(ventas.rows.item(i).TOTAL, 2));
        vLi = vLi + "  </span></p></li>";

        $("#lstReporteVentas").append(vLi);
        $("#lstReporteVentas").listview("refresh");

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " " +
          ventas.rows.item(i).SKU +
          "/" +
          ventas.rows.item(i).SKU_NAME +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " Cantidad:" +
          format_number(ventas.rows.item(i).QTY) +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "RIGHT 550 T 0 2 0 " +
          (_fila - 30) +
          " " +
          DarFormatoAlMonto(format_number(ventas.rows.item(i).TOTAL, 2)) +
          "\r\n";
        _fila += parseInt(10);

        if (i === ventas.rows.length - 1) {
          _fila += parseInt(10);
          _formatoImpresion =
            _formatoImpresion + "L 5 " + _fila + " 570 " + _fila + " 1\r\n";
          _fila += parseInt(10);
        }
      }
    } else {
      document.getElementById("acordionVentas").style.display = "none";
    }
    callback();
  } catch (err) {
    errCallBack("GenerarReporteVenta: " + err.message);
  }
}

function GenerarReporteVentasPorCliente(
  ventasPorCliente,
  callback,
  errCallBack
) {
  try {
    if (ventasPorCliente.rows.length > 0) {
      document.getElementById("acordionVentasPorCliente").style.display = "";

      _formatoImpresion =
        _formatoImpresion +
        "CENTER 550 T 0 3 0 " +
        _fila +
        " Venta por Cliente  \r\n";
      _fila += parseInt(30);
      $("#lstReporteVentasPorCliente")
        .children()
        .remove("li");
      var cliente = "";
      var vLi = "";
      for (var i = 0; i < ventasPorCliente.rows.length; i++) {
        if (cliente != ventasPorCliente.rows.item(i).CLIENT_ID) {
          if (vLi != "") {
            vLi = vLi + " </li> ";
            $("#lstReporteVentasPorCliente").append(vLi);
            $("#lstReporteVentasPorCliente").listview("refresh");
          }
          cliente = ventasPorCliente.rows.item(i).CLIENT_ID.toString();
          vLi =
            " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
          vLi = vLi + " <h4>";
          vLi =
            vLi +
            ventasPorCliente.rows.item(i).CLIENT_ID.toString() +
            "/" +
            ventasPorCliente.rows.item(i).CLIENT_NAME;
          vLi = vLi + " </h4> ";

          _formatoImpresion =
            _formatoImpresion +
            "CENTER 550 T 0 2 0 " +
            _fila +
            " " +
            ventasPorCliente.rows.item(i).CLIENT_ID.toString() +
            "/" +
            ventasPorCliente.rows.item(i).CLIENT_NAME +
            "\r\n";
          _fila += parseInt(30);
        }
        vLi =
          vLi +
          " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'> ";
        vLi = vLi + " <b>Factura: </b><span> ";
        vLi =
          vLi +
          ventasPorCliente.rows.item(i).INVOICE_NUM.toString() +
          "/" +
          ventasPorCliente.rows.item(i).SAT_SERIE;
        vLi = vLi + " </span><span  class='ui-li-count'>";
        vLi =
          vLi +
          DarFormatoAlMonto(
            format_number(ventasPorCliente.rows.item(i).TOTAL_AMOUNT, 2)
          );
        vLi = vLi + " </span></li>";

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " Factura:" +
          ventasPorCliente.rows.item(i).INVOICE_NUM.toString() +
          "/" +
          ventasPorCliente.rows.item(i).SAT_SERIE +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "RIGHT 550 T 0 2 0 " +
          (_fila - 30) +
          " " +
          DarFormatoAlMonto(
            format_number(ventasPorCliente.rows.item(i).TOTAL_AMOUNT, 2)
          ) +
          "\r\n";
        _fila += parseInt(10);

        if (i === ventasPorCliente.rows.length - 1) {
          _fila += parseInt(10);
          _formatoImpresion =
            _formatoImpresion + "L 5 " + _fila + " 570 " + _fila + " 1\r\n";
          _fila += parseInt(10);
        }
      }
      if (vLi != "") {
        vLi = vLi + " </li> ";
        $("#lstReporteVentasPorCliente").append(vLi);
        $("#lstReporteVentasPorCliente").listview("refresh");
      }
    } else {
      document.getElementById("acordionVentasPorCliente").style.display =
        "none";
    }
    callback();
  } catch (err) {
    errCallBack("GenerarReporteVentasPorCliente: " + err.message);
  }
}

function GenerarReporteDeProductosDeOrdenesDeVenta(
  ordenes,
  callback,
  errCallBack
) {
  try {
    if (ordenes.rows.length > 0) {
      document.getElementById("acordionProductosOrdenesDeVenta").style.display =
        "";

      _formatoImpresion =
        _formatoImpresion +
        "CENTER 550 T 0 3 0 " +
        _fila +
        " Productos De Ordenes De Venta \r\n";
      _fila += parseInt(30);
      $("#lstReporteProductosOrdenesDeVenta")
        .children()
        .remove("li");
      var vLi = "";
      var cantidadTotal = 0;
      var montoTotal = 0.0;
      for (var i = 0; i < ordenes.rows.length; i++) {
        vLi =
          " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
        vLi = vLi + " <p><h4>";
        vLi =
          vLi + ordenes.rows.item(i).SKU + "/" + ordenes.rows.item(i).SKU_NAME;
        vLi = vLi + " </h4></p> ";
        vLi = vLi + " <p><b>Cantidad: </b><span> ";
        vLi = vLi + ordenes.rows.item(i).QTY;
        vLi = vLi + " </span> ";
        vLi =
          vLi +
          " <span class='ui-li-count' style='position:absolute; top:70%'>";
        vLi = vLi + DarFormatoAlMonto(ToDecimal(ordenes.rows.item(i).TOTAL));
        vLi = vLi + "  </span></p></li>";

        $("#lstReporteProductosOrdenesDeVenta").append(vLi);
        $("#lstReporteProductosOrdenesDeVenta").listview("refresh");

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " " +
          ordenes.rows.item(i).SKU +
          "/" +
          ordenes.rows.item(i).SKU_NAME +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " Cantidad:" +
          ordenes.rows.item(i).QTY +
          "\r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "RIGHT 550 T 0 2 0 " +
          (_fila - 30) +
          " " +
          DarFormatoAlMonto(ToDecimal(ordenes.rows.item(i).TOTAL)) +
          "\r\n";
        _fila += parseInt(10);

        cantidadTotal += ordenes.rows.item(i).QTY;
        montoTotal += ToDecimal(ordenes.rows.item(i).TOTAL);
      }

      //Se agrega la sumatora
      vLi =
        " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
      vLi = vLi + " <p><h4><b>Cantidad Total: </b></h4>";
      vLi =
        vLi + " <span class='ui-li-count' style='position:absolute; top:33%'>";
      vLi = vLi + cantidadTotal;
      vLi = vLi + "  </span></p>";
      vLi = vLi + " <p><h4><b>Monto Total: </b></h4>";
      vLi =
        vLi + " <span class='ui-li-count' style='position:absolute; top:70%'>";
      vLi = vLi + DarFormatoAlMonto(ToDecimal(montoTotal));
      vLi = vLi + "  </span></p>";

      $("#lstReporteProductosOrdenesDeVenta").append(vLi);
      $("#lstReporteProductosOrdenesDeVenta").listview("refresh");

      _fila += parseInt(40);
      _formatoImpresion =
        _formatoImpresion + "LEFT 5 T 0 2 0 " + _fila + " Cantidad Total: \r\n";
      _formatoImpresion =
        _formatoImpresion +
        "RIGHT 550 T 0 2 0 " +
        _fila +
        " " +
        cantidadTotal +
        "\r\n";
      _fila += parseInt(30);
      _fila += parseInt(10);

      _formatoImpresion =
        _formatoImpresion + "LEFT 5 T 0 2 0 " + _fila + " Monto Total: \r\n";
      _formatoImpresion =
        _formatoImpresion +
        "RIGHT 550 T 0 2 0 " +
        _fila +
        " " +
        DarFormatoAlMonto(ToDecimal(montoTotal)) +
        "\r\n";
      _fila += parseInt(30);
      _fila += parseInt(10);

      _fila += parseInt(10);
      _formatoImpresion =
        _formatoImpresion + "L 5 " + _fila + " 570 " + _fila + " 1\r\n";
      _fila += parseInt(10);
    } else {
      document.getElementById("acordionProductosOrdenesDeVenta").style.display =
        "none";
    }

    callback();
  } catch (err) {
    errCallBack("GenerarReporteProductosOrdenesDeVenta: " + err.message);
  }
}

function GenerarReporteDeClientesDeOrdenesDeVenta(
  ordenes,
  callback,
  errCallBack
) {
  try {
    if (ordenes.rows.length > 0) {
      document.getElementById("acordionClientesOrdenesDeVenta").style.display =
        "";

      _formatoImpresion =
        _formatoImpresion +
        "CENTER 550 T 0 3 0 " +
        _fila +
        " Clientes De Ordenes De Venta  \r\n";
      _fila += parseInt(30);
      $("#lstReporteClientesOrdenesDeVenta")
        .children()
        .remove("li");
      var vLi = "";
      var cantidadTotal = 0;
      var montoTotal = 0.0;
      for (var i = 0; i < ordenes.rows.length; i++) {
        vLi =
          " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
        vLi = vLi + " <p><h4>";
        vLi =
          vLi +
          ordenes.rows.item(i).CLIENT_ID +
          "/" +
          ordenes.rows.item(i).CLIENT_NAME;
        vLi = vLi + " </h4></p> ";
        vLi = vLi + " <p><b>Referencia de Orden de Venta: </b><span> ";
        vLi = vLi + ordenes.rows.item(i).SALES_ORDER_ID * -1;
        vLi = vLi + " </span> ";
        vLi =
          vLi +
          " <span class='ui-li-count' style='position:absolute; top:70%'>";
        vLi =
          vLi + DarFormatoAlMonto(ToDecimal(ordenes.rows.item(i).TOTAL_AMOUNT_DISPLAY));
        vLi = vLi + "  </span></p></li>";

        $("#lstReporteClientesOrdenesDeVenta").append(vLi);
        $("#lstReporteClientesOrdenesDeVenta").listview("refresh");

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " " +
          ordenes.rows.item(i).CLIENT_ID +
          "/" +
          ordenes.rows.item(i).CLIENT_NAME +
          "\r\n";
        _fila += parseInt(30);

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          " Referencia de Orden de Venta #" +
          ordenes.rows.item(i).SALES_ORDER_ID * -1 +
          "\r\n";
        _fila += parseInt(30);

        _formatoImpresion =
          _formatoImpresion +
          "LEFT 5 T 0 2 0 " +
          _fila +
          "Total de Documento \r\n";
        _fila += parseInt(30);
        _formatoImpresion =
          _formatoImpresion +
          "RIGHT 550 T 0 2 0 " +
          (_fila - 30) +
          " " +
          DarFormatoAlMonto(ToDecimal(ordenes.rows.item(i).TOTAL_AMOUNT_DISPLAY)) +
          "\r\n";
        _fila += parseInt(10);

        cantidadTotal += 1;
        montoTotal += ToDecimal(ordenes.rows.item(i).TOTAL_AMOUNT_DISPLAY);
      }

      //Se agrega la sumatora
      vLi =
        " <li data-icon='false' class='ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check'>";
      vLi = vLi + " <p><h4><b>Total De Clientes: </b></h4>";
      vLi =
        vLi + " <span class='ui-li-count' style='position:absolute; top:33%'>";
      vLi = vLi + cantidadTotal;
      vLi = vLi + "  </span></p>";
      vLi = vLi + " <p><h4><b>Monto Total: </b></h4>";
      vLi =
        vLi + " <span class='ui-li-count' style='position:absolute; top:70%'>";
      vLi = vLi + DarFormatoAlMonto(ToDecimal(montoTotal));
      vLi = vLi + "  </span></p>";

      $("#lstReporteClientesOrdenesDeVenta").append(vLi);
      $("#lstReporteClientesOrdenesDeVenta").listview("refresh");

      _fila += parseInt(40);
      _formatoImpresion =
        _formatoImpresion +
        "LEFT 5 T 0 2 0 " +
        _fila +
        " Cantidad De Clientes: \r\n";
      _formatoImpresion =
        _formatoImpresion +
        "RIGHT 550 T 0 2 0 " +
        _fila +
        " " +
        cantidadTotal +
        "\r\n";
      _fila += parseInt(30);
      _fila += parseInt(10);

      _formatoImpresion =
        _formatoImpresion + "LEFT 5 T 0 2 0 " + _fila + " Monto Total: \r\n";
      _formatoImpresion =
        _formatoImpresion +
        "RIGHT 550 T 0 2 0 " +
        _fila +
        " " +
        DarFormatoAlMonto(ToDecimal(montoTotal)) +
        "\r\n";
      _fila += parseInt(30);
      _fila += parseInt(10);

      _fila += parseInt(10);
      _formatoImpresion =
        _formatoImpresion + "L 5 " + _fila + " 570 " + _fila + " 1\r\n";
      _fila += parseInt(10);
    } else {
      document.getElementById("acordionClientesOrdenesDeVenta").style.display =
        "none";
    }

    callback();
  } catch (err) {
    errCallBack("GenerarReporteClientesOrdenesDeVenta: " + err.message);
  }
}

function BorrarTablasParaInicioDeRuta() {
  LimpiarBaseDeDatosCompleta(
    function() {
      var btnImprimirReporteFinDeRuta = $("btnImprimirReporteFinDeRuta");
      btnImprimirReporteFinDeRuta.prop("disabled", true);
      btnImprimirReporteFinDeRuta = null;
      localStorage.setItem("LOGIN_STATUS", "CLOSE");
      localStorage.setItem("POS_STATUS", "CLOSE");
      localStorage.setItem("SeCargaronListas", "NO");
      _actualizandoRuta = false;
    },
    function(error) {
      notify(error);
    }
  );
}

function MostrarPantallaDeControlDeFinDeRuta(documentosParaFinDeRuta) {
  try {
    $.mobile.changePage("PantallaDeControlDeFinDeRuta", {
      transition: "pop",
      reverse: false,
      changeHash: true,
      showLoadMsg: false,
      data: {
        documentosParaFinDeRuta: documentosParaFinDeRuta
      }
    });
  } catch (e) {
    notify("No se ha podido mostrar el fin de ruta debido a: " + e.message);
  }
}

function MostrarPantallaDeInicioDeSesion() {
  $("#btnImprimirReporteFinDeRuta").prop("disabled", true);
  $.mobile.changePage("#login_page", {
    transition: "flow",
    reverse: true,
    changeHash: true,
    showLoadMsg: false
  });
}

function LimpiarBaseDeDatosCompleta(callback, errCallback) {
  SONDA_DB_Session.transaction(
    function(tx) {
      try {
        var query = "SELECT name FROM sqlite_master WHERE type='table'";
        tx.executeSql(
          query,
          [],
          function(txRet, results) {
            if (results.rows.length > 1) {
              for (var index = 1; index < results.rows.length; index++) {
                var tableName = results.rows.item(index).name;
                txRet.executeSql("DELETE FROM " + tableName);
              }
              callback();
            } else {
              callback();
            }
          },
          function(txRet, error) {
            errCallback("Error al finalizar la ruta..." + error.message);
          }
        );
      } catch (e) {
        errCallback("Error al finalizar la ruta..." + e.message);
      }
    },
    function(err) {
      errCallback("Error al finalizar la ruta..." + err.message);
    }
  );
}
