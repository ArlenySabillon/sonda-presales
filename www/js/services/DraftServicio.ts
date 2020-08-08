/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../modelo/interfaces/IDraftServicio.ts" />
declare var SONDA_DB_Session: Database;

class DraftServicio implements IDraftServico {
  private decimalesServicio: ManejoDeDecimalesServicio = new ManejoDeDecimalesServicio();

  obtenerDraftsOrdenDeVenta(
    callback: (ordenes: OrdenDeVenta[]) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    var contador: number;
    var pSql: string = null;
    SONDA_DB_Session.transaction(
      tx => {
        pSql = " SELECT";
        pSql += " SOH.SALES_ORDER_ID";
        pSql += ", SOH.DELIVERY_DATE";
        pSql += ", C.CLIENT_NAME";
        pSql += ", SOH.TIMES_PRINTED";
        pSql += ", SOH.REFERENCE_ID";
        pSql += ", SOH.TOTAL_AMOUNT";
        pSql += ", SOH.DOC_SERIE";
        pSql += ", SOH.DOC_NUM";
        pSql += ", SOH.IS_VOID";
        pSql += ", SOH.IS_DRAFT";
        pSql += ", SOH.DISCOUNT";
        pSql += ", SOH.TASK_ID";
        pSql += ", SOH.COMMENT ";
        pSql += ", SOH.IMAGE_3";
        pSql += " , SOH.DISCOUNT_BY_GENERAL_AMOUNT";
        pSql += " , SOH.TOTAL_AMOUNT_DISPLAY";
        pSql += ", SOH.POSTED_DATETIME";
        pSql += ", SOH.CLIENT_ID";
        pSql += ", SOH.POS_TERMINAL";
        pSql += ", SOH.GPS_URL";
        pSql += ", SOH.STATUS";
        pSql += ", SOH.DEVICE_BATTERY_FACTOR";
        pSql += ", SOH.VOID_DATETIME";
        pSql += ", SOH.VOID_REASON";
        pSql += ", SOH.VOID_NOTES";
        pSql += ", SOH.VOIDED";
        pSql += ", SOH.CLOSED_ROUTE_DATETIME";
        pSql += ", SOH.IS_ACTIVE_ROUTE";
        pSql += ", SOH.GPS_EXPECTED";
        pSql += ", SOH.IS_PARENT";
        pSql += ", SOH.SALES_ORDER_TYPE";
        pSql += ", SOH.SALES_ORDER_ID_BO";
        pSql += " FROM SALES_ORDER_HEADER AS SOH";
        pSql += " INNER JOIN CLIENTS AS C ON(";
        pSql += " SOH.CLIENT_ID = C.CLIENT_ID)";
        pSql += "  WHERE SOH.IS_DRAFT = 1 AND SOH.IS_VOID = 0";

        tx.executeSql(pSql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            var ordenes: OrdenDeVenta[] = [];
            for (var i = 0; i < results.rows.length; i++) {
              var stOrden: any = results.rows.item(i);
              var orden = new OrdenDeVenta();
              orden.salesOrderId = stOrden.SALES_ORDER_ID;
              orden.terms = stOrden.TERMS;
              orden.postedDatetime = stOrden.POSTED_DATETIME.split("T", 1);
              orden.clientId = stOrden.CLIENT_ID;
              orden.clientName = stOrden.CLIENT_NAME;
              orden.posTerminal = stOrden.POS_TERMINAL;
              orden.gpsUrl = stOrden.GPS_URL;
              orden.totalAmount = stOrden.TOTAL_AMOUNT;
              orden.status = stOrden.STATUS;
              orden.deviceBatteryFactor = stOrden.DEVICE_BATTERY_FACTOR;
              orden.gpsExpected = stOrden.GPS_EXPECTED;
              orden.deliveryDate = stOrden.DELIVERY_DATE;
              orden.isParent = stOrden.IS_PARENT;
              orden.referenceId = stOrden.REFERENCE_ID;
              orden.timesPrinted = stOrden.TIMES_PRINTED;
              orden.docSerie = stOrden.DOC_SERIE;
              orden.docNum = stOrden.DOC_NUM;
              orden.isVoid = stOrden.IS_VOID;
              orden.salesOrderType = stOrden.SALES_ORDER_TYPE;
              orden.discount = stOrden.DISCOUNT;
              orden.salesOrderIdBo = stOrden.SALES_ORDER_ID_BO;
              orden.image3 = stOrden.IMAGE_3;
              orden.totalAmountDisplay = stOrden.TOTAL_AMOUNT_DISPLAY;
              orden.discountByGeneralAmountApplied =
                stOrden.DISCOUNT_BY_GENERAL_AMOUNT;
              orden.discount = stOrden.DISCOUNT;

              if (stOrden.TASK_ID === null || stOrden.TASK_ID === "") {
                orden.taskId = 0;
              } else {
                orden.taskId = stOrden.TASK_ID;
              }

              orden.clientName = stOrden.CLIENT_NAME;

              orden.ordenDeVentaDetalle = Array();

              ordenes.push(orden);
            }
            callback(ordenes);
          } else {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = 0;
            operacion.mensaje =
              "No se encontraron Ordenes de Venta en Estado Draft.";
            callbackError(operacion);
          }
        });
      },
      (err: SqlError) => {
        var operacion = new Operacion();
        operacion.resultado = ResultadoOperacionTipo.Error;
        operacion.codigo = err.code;
        operacion.mensaje = err.message;
        callbackError(operacion);
      }
    );
  }

  obtenerDraftDeFacturas(
    callback: (facturas: Factura[]) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    var pSql: string = null;
    SONDA_DB_Session.transaction(
      tx => {
        pSql = "SELECT IH.INVOICE_NUM";
        pSql += " ,IH.TERMS";
        pSql += " ,IH.POSTED_DATETIME";
        pSql += " ,IH.CLIENT_ID";
        pSql += " ,C.CLIENT_NAME";
        pSql += " ,IH.POS_TERMINAL";
        pSql += " ,IH.GPS";
        pSql += " ,IH.TOTAL_AMOUNT";
        pSql += " ,IH.STATUS";
        pSql += " ,IH.IMG1";
        pSql += " ,IH.IMG2";
        pSql += " ,IH.IMG3";
        //pSql += " ,IH.IS_CREDIT_NOTE";
        //pSql += " ,IH.VOID_REASON";
        //pSql += " ,IH.VOID_NOTES";
        //pSql += " ,IH.PRINTED_COUNT";
        pSql += " ,IH.GPS_EXPECTED";
        pSql += " ,IH.IS_DRAFT";
        pSql += " FROM INVOICE_HEADER AS IH";
        pSql += " INNER JOIN CLIENTS AS C ON(";
        pSql += " IH.CLIENT_ID = C.CLIENT_ID)";
        pSql += " WHERE IH.IS_DRAFT = 1";

        tx.executeSql(pSql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            var facturas: Factura[] = [];
            for (var i = 0; i < results.rows.length; i++) {
              var stFactura: any = results.rows.item(i);
              var factura = new Factura();

              factura.invoiceNum = stFactura.INVOICE_NUM;
              factura.terms = stFactura.TERMS;
              factura.postedDatetime = stFactura.POSTED_DATETIME.split("T", 1);
              factura.clientId = stFactura.CLIENT_ID;
              factura.clientName = stFactura.CLIENT_NAME;
              factura.posTerminal = stFactura.POS_TERMINAL;
              factura.gps = stFactura.GPS;
              factura.totalAmount = stFactura.TOTAL_AMOUNT;
              factura.status = stFactura.STATUS;
              factura.img1 = stFactura.IMG1;
              factura.img2 = stFactura.IMG2;
              factura.img3 = stFactura.IMG3;
              factura.gpsExpected = stFactura.GPS_EXPECTED;

              facturas.push(factura);
            }
            callback(facturas);
          } else {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = 0;
            operacion.mensaje = "No se encontraron Facturas en Estado Draft.";
            callbackError(operacion);
          }
        });
      },
      (err: SqlError) => {
        var operacion = new Operacion();
        operacion.resultado = ResultadoOperacionTipo.Error;
        operacion.codigo = err.code;
        operacion.mensaje = err.message;
        callbackError(operacion);
      }
    );
  }

  obtenerDetalleDeOrdenDeVentaDraft(
    ordenes: OrdenDeVenta[],
    callback: (ordenes: OrdenDeVenta[]) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    var i: number;
    var ultima = 0;
    var ordenesTemp: OrdenDeVenta[] = [];
    for (i = 0; i < ordenes.length; i++) {
      if (i === ordenes.length - 1) {
        ultima = 1;
      }
      this.obtenerDetalleOrden(
        ordenes[i],
        ultima,
        (orden: OrdenDeVenta, ultimaR: number) => {
          ordenesTemp.push(orden);
          if (ultimaR === 1) {
            callback(ordenesTemp);
          }
        },
        (resultado: Operacion) => {
          var operacion = new Operacion();
          operacion.resultado = resultado.resultado;
          operacion.codigo = resultado.codigo;
          operacion.mensaje = resultado.mensaje;
          callbackError(operacion);
        }
      );
    }
  }

  obtenerDetalleOrden(
    orden: OrdenDeVenta,
    ultima: number,
    callback: (orden: OrdenDeVenta, ultimaR: number) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "";
        sql += "SELECT";
        sql += " SOD.SALES_ORDER_ID";
        sql += " ,SOD.SKU";
        sql += " ,SP.SKU_NAME";
        sql += " ,(SP.ON_HAND - SP.IS_COMITED) AS AVAILABLE";
        sql += " ,SOD.LINE_SEQ";
        sql += " ,SOD.QTY";
        sql += " ,SOD.PRICE";
        sql += " ,SOD.DISCOUNT";
        sql += " ,SOD.TOTAL_LINE";
        sql += " ,SOD.POSTED_DATETIME";
        sql += " ,SOD.SERIE";
        sql += " ,SOD.SERIE_2";
        sql += " ,SOD.REQUERIES_SERIE";
        sql += " ,SOD.COMBO_REFERENCE";
        sql += " ,SOD.PARENT_SEQ";
        sql += " ,SOD.IS_ACTIVE_ROUTE";
        sql += " ,SOD.IS_POSTED_VOID";
        sql += " ,SOD.IS_VOID";
        sql += " ,SOD.CODE_PACK_UNIT";
        sql += " , SOD.DISCOUNT";
        sql += " , SOD.DISCOUNT_TYPE";
        sql += " , SOD.DISCOUNT_BY_FAMILY";
        sql += " , SOD.DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE";
        sql += " , SOD.TYPE_OF_DISCOUNT_BY_FAMILY";
        sql += " , SOD.TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE";
        sql += " , SOD.TOTAL_AMOUNT_DISPLAY";
        sql += " FROM SALES_ORDER_DETAIL AS SOD";
        sql += " INNER JOIN SKU_PRESALE AS SP ON(SOD.SKU = SP.SKU)";
        sql += " WHERE SALES_ORDER_ID =" + orden.salesOrderId;
        sql += " AND DOC_SERIE = '" + orden.docSerie + "'";
        sql += " AND DOC_NUM =" + orden.docNum;
        sql += ` AND WAREHOUSE = '${localStorage.getItem("PRESALE_WHS")}'`;

        //indice = ordenes[i].salesOrderId;
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            for (var j = 0; j < results.rows.length; j++) {
              var detalleTemp: any = results.rows.item(j);
              var detalle = new OrdenDeVentaDetalle();
              detalle.salesOrderId = detalleTemp.SALES_ORDER_ID;
              detalle.sku = detalleTemp.SKU;
              detalle.skuName = detalleTemp.SKU_NAME;
              detalle.skuAvailable = detalleTemp.AVAILABLE;
              detalle.lineSeq = detalleTemp.LINE_SEQ;
              detalle.qty = detalleTemp.QTY;
              detalle.price = detalleTemp.PRICE;
              detalle.discount = detalleTemp.DISCOUNT;
              detalle.totalLine = detalleTemp.TOTAL_LINE;
              detalle.postedDatetime = detalleTemp.POSTED_DATETIME;
              detalle.serie = detalleTemp.SERIE;
              detalle.serie2 = detalleTemp.SERIE_2;
              detalle.requeriesSerie = detalleTemp.REQUERIES_SERIE;
              detalle.comboReference = detalleTemp.COMBO_REFERENCE;
              detalle.parentSeq = detalleTemp.PARENT_SEQ;
              detalle.isActiveRoute = detalleTemp.IS_ACTIVE_ROUTE;
              detalle.isPostedVoid = detalleTemp.IS_POSTED_VOID;
              detalle.isVoid = detalleTemp.IS_VOID;
              detalle.codePackUnit = detalleTemp.CODE_PACK_UNIT;
              detalle.discountType = detalleTemp.DISCOUNT_TYPE;
              detalle.discountByFamily = detalleTemp.DISCOUNT_BY_FAMILY;
              detalle.discountByFamilyAndPaymentType =
                detalleTemp.DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE;
              detalle.typeOfDiscountByFamily =
                detalleTemp.TYPE_OF_DISCOUNT_BY_FAMILY;
              detalle.typeOfDiscountByFamilyAndPaymentType =
                detalleTemp.TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE;
              detalle.totalAmountDisplay = detalleTemp.TOTAL_AMOUNT_DISPLAY;

              orden.ordenDeVentaDetalle.push(detalle);
            }

            callback(orden, ultima);
          } else {
            let operacion = new Operacion();
            callbackError(operacion);
            operacion = null;
          }
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener sku para la orden de venta draft: " + err.message
        });
      }
    );
  }

  obtenerFormatoActualizarTareaIdParaBorradorDeOrdenDeVenta(
    ordenDeVenta: OrdenDeVenta
  ) {
    var sql = "";
    sql += "UPDATE SALES_ORDER_HEADER SET";
    sql += " TASK_ID = " + ordenDeVenta.taskId;
    sql += " WHERE SALES_ORDER_ID = " + ordenDeVenta.salesOrderId;
    sql += " AND DOC_SERIE = '" + ordenDeVenta.docSerie + "'";
    sql += " AND DOC_NUM = " + ordenDeVenta.docNum;
    return sql;
  }

  actualizarTareaIdParaBorradorDeOrdenDeVenta(
    ordenDeVenta: OrdenDeVenta,
    callback: () => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "";
        sql = this.obtenerFormatoActualizarTareaIdParaBorradorDeOrdenDeVenta(
          ordenDeVenta
        );
        if (sql !== "") {
          tx.executeSql(sql);
        }
        callback();
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al insertar orden de venta: " + err.message
        });
      }
    );
  }

  obtenerTaskIdParaBorradorDeOrdenDeVenta(
    ordenDeVenta: OrdenDeVenta,
    indice: number,
    callback: (orden: OrdenDeVenta, indice: number) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "";
        sql += "SELECT";
        sql += " TASK_ID";
        sql += " FROM TASK";
        sql += " WHERE TARGET_DOC =" + ordenDeVenta.salesOrderId;

        //indice = ordenes[i].salesOrderId;
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            var detalleTemp: any = results.rows.item(0);
            ordenDeVenta.taskId = detalleTemp.TASK_ID;
          }
          callback(ordenDeVenta, indice);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener sku para la orden de venta draft: " + err.message
        });
      }
    );
  }

  obtenerFormatoDeImpresionDeBorradorDeOrdenDeVenta(
    cliente: Cliente,
    ordenDeVenta: OrdenDeVenta,
    callback: (formato: string) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    this.decimalesServicio.obtenerInformacionDeManejoDeDecimales(
      configuracionDeDecimales => {
        let tipoDeFormatoDeImpresion = localStorage.getItem(
          TipoDeParametro.FormatoDeImpresion
        );
        switch (tipoDeFormatoDeImpresion) {
          case FormatoDeImpresion.Pacasa:
            this.obtenerFormatoDeImpresionDeOrdenDeVentaPacasaHonduras(
              cliente,
              ordenDeVenta,
              callback,
              callbackError,
              configuracionDeDecimales
            );
            break;
          default:
            this.obtenerFormatoDeImpresionEstandarParaOrdenDeVenta(
              cliente,
              ordenDeVenta,
              callback,
              callbackError
            );
            break;
        }
      }
    );
  }

  /**
   * obtenerFormatoDeImpresionEstandarParaOrdenDeVenta
   */
  public obtenerFormatoDeImpresionEstandarParaOrdenDeVenta(
    cliente: Cliente,
    ordenDeVenta: OrdenDeVenta,
    callback: (formato: string) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      var nameEnterprise = localStorage.getItem("NAME_ENTERPRISE");
      var lheader = "";
      var ldetail = "";
      var lfooter = "";
      var imprimirUM =
        localStorage.getItem("SALE_ORDER_PRINT_UM").toString() === "1" ? 1 : 0;
      var nameUser = localStorage.getItem("LAST_LOGIN_NAME");

      var serie = ordenDeVenta.docSerie;
      var docNum = ordenDeVenta.docNum;

      lheader +=
        "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
      lheader += "CENTER 550 T 0 3 0 10 " + nameEnterprise + "\r\n";
      lheader += "L 5  50 570 50 1\r\n";

      lheader += "CENTER 550 T 0 3 0 60 Cotizacion Serie " + serie + "\r\n";
      lheader += "CENTER 550 T 0 3 0 90 No." + docNum + "\r\n";

      lheader +=
        "LEFT 550 T 0 2 0 130 Cliente: " +
        cliente.clientId +
        "-" +
        cliente.clientName +
        "\r\n";

      lheader += "LEFT 550 T 0 2 0 160 " + cliente.address + "\r\n";

      lfooter +=
        "LEFT 550 T 0 2 0 190 Fecha de vencimiento: " +
        ordenDeVenta.deliveryDate +
        " \r\n";

      var pRow = 250;

      ldetail = "";
      let i = 0;
      var item = new OrdenDeVentaDetalle();
      let totalDeOrden = 0;
      for (i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
        item = ordenDeVenta.ordenDeVentaDetalle[i];
        if (item.isBonus === 0) {
          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " " +
            item.sku +
            "- " +
            item.skuName +
            "\r\n";
          pRow += 30;

          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " CANTIDAD: " +
            item.qty +
            " / " +
            (imprimirUM === 1 ? "UM: " + item.codePackUnit + "/ " : "") +
            " PREC.UNIT. : " +
            DarFormatoAlMonto(format_number(item.price, 2)) +
            "\r\n";
          ldetail =
            ldetail +
            "RIGHT 550 T 0 2 0 " +
            pRow +
            " " +
            DarFormatoAlMonto(format_number(item.totalLine, 2)) +
            "\r\n";
          if (item.long > 0) {
            pRow += 25;
            ldetail =
              ldetail +
              "LEFT 5 T 0 2 0 " +
              pRow +
              " DIMENSION: " +
              format_number(item.long, 2) +
              "\r\n";
          }
          pRow += 30;

          if (item.discount !== 0) {
            let totalDescuento = 0;
            switch (item.discountType) {
              case TiposDeDescuento.Porcentaje.toString():
                totalDescuento =
                  item.totalLine - (item.discount * item.totalLine) / 100;
                ldetail =
                  ldetail +
                  "LEFT 5 T 0 2 0 " +
                  pRow +
                  " DESCUENTO: " +
                  format_number(item.discount, 2) +
                  "%" +
                  "\r\n";
                break;
              case TiposDeDescuento.Monetario.toString():
                totalDescuento = item.totalLine - item.discount;
                ldetail =
                  ldetail +
                  "LEFT 5 T 0 2 0 " +
                  pRow +
                  " DESCUENTO: " +
                  DarFormatoAlMonto(format_number(item.discount, 2)) +
                  "" +
                  "\r\n";
                break;
            }
            ldetail =
              ldetail +
              "RIGHT 550 T 0 2 0 " +
              pRow +
              " " +
              DarFormatoAlMonto(format_number(totalDescuento, 2)) +
              "\r\n";
            pRow += 30;
            totalDeOrden += totalDescuento;
          } else {
            totalDeOrden += item.totalLine;
          }

          ldetail = ldetail + "L 5 " + pRow + " 570 " + pRow + " 1\r\n";
          pRow += 10;
        }
        //pTotal += item.TOTAL_LINE;
      }

      let totalConDescuento = totalDeOrden;
      if (ordenDeVenta.discount > 0) {
        totalConDescuento =
          totalDeOrden - (ordenDeVenta.discount * totalDeOrden) / 100;
      }

      pRow += 30;
      lfooter += "LEFT 5 T 0 2 0 " + pRow + " SUBTOTAL: \r\n";
      lfooter +=
        "RIGHT 550 T 0 2 0 " +
        pRow +
        " " +
        DarFormatoAlMonto(format_number(ordenDeVenta.totalAmount, 2)) +
        "\r\n";

      pRow += 30;
      lfooter += "LEFT 5 T 0 2 0 " + pRow + " DESCUENTO: \r\n";
      lfooter +=
        "RIGHT 550 T 0 2 0 " +
        pRow +
        " " +
        DarFormatoAlMonto(
          format_number(ordenDeVenta.totalAmount - totalConDescuento, 2)
        ) +
        "\r\n";

      if (ordenDeVenta.discountApplied - ordenDeVenta.totalAmountDisplay > 0) {
        pRow += 30;
        lfooter += "LEFT 5 T 0 2 0 " + pRow + " AJUSTE: \r\n";
        lfooter +=
          "RIGHT 550 T 0 2 0 " +
          pRow +
          " " +
          DarFormatoAlMonto(
            format_number(
              totalConDescuento - ordenDeVenta.totalAmountDisplay,
              2
            )
          ) +
          "\r\n";
      }

      pRow += 30;
      lfooter +=
        "LEFT 5 T 0 2 0 " +
        pRow +
        " TOTAL:" +
        (ordenDeVenta.discount !== 0
          ? "(" +
            DarFormatoAlMonto(format_number(totalDeOrden, 2)) +
            " Descuento: " +
            format_number(ordenDeVenta.discount, 2) +
            "%)"
          : "") +
        "\r\n";
      lfooter +=
        "RIGHT 550 T 0 2 0 " +
        pRow +
        " " +
        DarFormatoAlMonto(format_number(totalConDescuento, 2)) +
        "\r\n";

      let agregarEncabezadoBonificacion = true;

      for (i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
        item = ordenDeVenta.ordenDeVentaDetalle[i];
        if (item.isBonus === 1) {
          if (agregarEncabezadoBonificacion) {
            pRow += 30;
            ldetail =
              ldetail +
              "CENTER 550 T 0 3 0 " +
              pRow +
              " Bonificaciones" +
              "\r\n";
            pRow += 30;

            agregarEncabezadoBonificacion = false;
          }

          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " " +
            item.sku +
            "- " +
            item.skuName +
            "\r\n";
          pRow += 30;

          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " CANTIDAD: " +
            item.qty +
            " / " +
            (imprimirUM === 1 ? "UM: " + item.codePackUnit + " " : "") +
            "\r\n";
          pRow += 30;

          ldetail = ldetail + "L 5 " + pRow + " 570 " + pRow + " 1\r\n";
          pRow += 10;
        }
      }

      pRow += 30;
      lfooter +=
        "CENTER 550 T 0 2 0 " +
        pRow +
        " " +
        getDateTime() +
        " / " +
        gCurrentRoute +
        "-" +
        nameUser +
        " \r\n";

      pRow += 30;
      lfooter += "L 5  120 570 120 1\r\n"; //Linea bajo los datos del encabezado...
      lfooter += "PRINT\r\n";

      lheader = "! 0 50 50 " + (pRow + 40) + " 1\r\n" + lheader;

      var pCpCl = lheader + ldetail + lfooter;
      callback(pCpCl);
    } catch (err) {
      callbackError(<Operacion>{
        codigo: -1,
        mensaje:
          "Error al obtener formato de impresion de orden de venta: " +
          err.message
      });
    }
  }

  /**
   * obtenerFormatoDeImpresionDeOrdenDeVentaPacasaHonduras
   */
  public obtenerFormatoDeImpresionDeOrdenDeVentaPacasaHonduras(
    cliente: Cliente,
    ordenDeVenta: OrdenDeVenta,
    callback: (formato: string) => void,
    callbackError: (resultado: Operacion) => void,
    configuracionDeDecimales: ManejoDeDecimales
  ) {
    try {
      var nameEnterprise = localStorage.getItem("NAME_ENTERPRISE");
      var lheader = "";
      var ldetail = "";
      var lfooter = "";
      var imprimirUM =
        localStorage.getItem("SALE_ORDER_PRINT_UM").toString() === "1" ? 1 : 0;
      var nameUser = localStorage.getItem("LAST_LOGIN_NAME");

      var serie = ordenDeVenta.docSerie;
      var docNum = ordenDeVenta.docNum;

      lheader +=
        "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
      lheader += "CENTER 550 T 0 3 0 10 " + nameEnterprise + "\r\n";
      lheader += "L 5  50 570 50 1\r\n";

      lheader += "CENTER 550 T 0 3 0 60 Cotizacion Serie " + serie + "\r\n";
      lheader += "CENTER 550 T 0 3 0 90 No." + docNum + "\r\n";

      lheader +=
        "LEFT 550 T 0 2 0 130 Cliente: " +
        cliente.clientId +
        "-" +
        cliente.clientName +
        "\r\n";

      lheader += "LEFT 550 T 0 2 0 160 " + cliente.address + "\r\n";

      lfooter +=
        "LEFT 550 T 0 2 0 190 Fecha de vencimiento: " +
        ordenDeVenta.deliveryDate +
        " \r\n";

      var pRow = 250;

      ldetail = "";
      let i = 0;
      var item = new OrdenDeVentaDetalle();
      for (i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
        item = ordenDeVenta.ordenDeVentaDetalle[i];
        if (item.isBonus === 0) {
          pRow += 15;
          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " " +
            item.sku +
            "- " +
            item.skuName +
            "\r\n";

          pRow += 30;
          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " CANTIDAD: " +
            format_number(
              item.qty,
              configuracionDeDecimales.defaultDisplayDecimals
            ) +
            " / " +
            (imprimirUM === 1 ? "UM: " + item.codePackUnit + "/ " : "") +
            " PREC.UNIT. : " +
            DarFormatoAlMonto(
              format_number(
                item.price,
                configuracionDeDecimales.defaultDisplayDecimals
              )
            ) +
            "\r\n";
          ldetail =
            ldetail +
            "RIGHT 550 T 0 2 0 " +
            pRow +
            " " +
            DarFormatoAlMonto(
              format_number(
                item.totalAmountDisplay,
                configuracionDeDecimales.defaultDisplayDecimals
              )
            ) +
            "\r\n";
          if (item.long > 0) {
            pRow += 25;
            ldetail =
              ldetail +
              "LEFT 5 T 0 2 0 " +
              pRow +
              " DIMENSION: " +
              format_number(
                item.long,
                configuracionDeDecimales.defaultDisplayDecimals
              ) +
              "\r\n";
          }

          let descuentosAplicados = this.obtenerDescuentosAplicadosEnLineaDeProducto(
            item,
            configuracionDeDecimales
          );

          if (descuentosAplicados) {
            pRow += 30;
            ldetail =
              ldetail +
              "LEFT 5 T 0 2 0 " +
              pRow +
              " " +
              descuentosAplicados +
              "\r\n";
          }

          pRow += 30;
          ldetail = ldetail + "L 5 " + pRow + " 570 " + pRow + " 1\r\n";
        }
      }

      pRow += 30;
      lfooter += "LEFT 5 T 0 2 0 " + pRow + " TOTAL:" + "\r\n";
      lfooter +=
        "RIGHT 550 T 0 2 0 " +
        pRow +
        " " +
        DarFormatoAlMonto(
          format_number(
            ordenDeVenta.totalAmountDisplay,
            configuracionDeDecimales.defaultDisplayDecimals
          )
        ) +
        "\r\n";

      let agregarEncabezadoBonificacion = true;

      for (i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
        item = ordenDeVenta.ordenDeVentaDetalle[i];
        if (item.isBonus === 1) {
          if (agregarEncabezadoBonificacion) {
            pRow += 30;
            ldetail =
              ldetail +
              "CENTER 550 T 0 3 0 " +
              pRow +
              " Bonificaciones" +
              "\r\n";
            pRow += 30;

            agregarEncabezadoBonificacion = false;
          }

          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " " +
            item.sku +
            "- " +
            item.skuName +
            "\r\n";
          pRow += 30;

          ldetail =
            ldetail +
            "LEFT 5 T 0 2 0 " +
            pRow +
            " CANTIDAD: " +
            format_number(
              item.qty,
              configuracionDeDecimales.defaultDisplayDecimals
            ) +
            " / " +
            (imprimirUM === 1 ? "UM: " + item.codePackUnit + " " : "") +
            "\r\n";
          pRow += 30;

          ldetail = ldetail + "L 5 " + pRow + " 570 " + pRow + " 1\r\n";
          pRow += 10;
        }
      }

      pRow += 30;
      lfooter +=
        "CENTER 550 T 0 2 0 " +
        pRow +
        " " +
        getDateTime() +
        " / " +
        gCurrentRoute +
        "-" +
        nameUser +
        " \r\n";

      pRow += 30;
      lfooter += "L 5  120 570 120 1\r\n"; //Linea bajo los datos del encabezado...
      lfooter += "PRINT\r\n";

      lheader = "! 0 50 50 " + (pRow + 40) + " 1\r\n" + lheader;

      var pCpCl = lheader + ldetail + lfooter;
      callback(pCpCl);
    } catch (err) {
      callbackError({
        codigo: -1,
        mensaje: "Error al obtener formato de impresion: " + err.message
      } as Operacion);
    }
  }

  private obtenerDescuentosAplicadosEnLineaDeProducto(
    lineaDeDetalle: OrdenDeVentaDetalle,
    configuracionDeDecimales: ManejoDeDecimales
  ): string {
    let tiposDeDescuentoAplicadosALineaDeProducto: Array<string> = [];

    if (lineaDeDetalle.discount && lineaDeDetalle.discount > 0) {
      switch (lineaDeDetalle.discountType) {
        case TiposDeDescuento.Porcentaje.toString():
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DESC: ${format_number(
              lineaDeDetalle.discount,
              configuracionDeDecimales.defaultDisplayDecimals
            )}%`
          );
          break;
        case TiposDeDescuento.Monetario.toString():
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DESC: ${DarFormatoAlMonto(
              format_number(
                lineaDeDetalle.discount,
                configuracionDeDecimales.defaultDisplayDecimals
              )
            )}`
          );
          break;
        default:
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DESC: ${format_number(
              lineaDeDetalle.discount,
              configuracionDeDecimales.defaultDisplayDecimals
            )}`
          );
          break;
      }
    }

    if (
      lineaDeDetalle.discountByFamily &&
      lineaDeDetalle.discountByFamily > 0
    ) {
      switch (lineaDeDetalle.discountType) {
        case TiposDeDescuento.Porcentaje.toString():
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DMF: ${format_number(
              lineaDeDetalle.discountByFamily,
              configuracionDeDecimales.defaultDisplayDecimals
            )}%`
          );
          break;
        case TiposDeDescuento.Monetario.toString():
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DMF: ${DarFormatoAlMonto(
              format_number(
                lineaDeDetalle.discountByFamily,
                configuracionDeDecimales.defaultDisplayDecimals
              )
            )}`
          );
          break;
        default:
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DMF: ${format_number(
              lineaDeDetalle.discountByFamily,
              configuracionDeDecimales.defaultDisplayDecimals
            )}`
          );
          break;
      }
    }

    if (
      lineaDeDetalle.discountByFamilyAndPaymentType &&
      lineaDeDetalle.discountByFamilyAndPaymentType > 0
    ) {
      switch (lineaDeDetalle.typeOfDiscountByFamilyAndPaymentType) {
        case TiposDeDescuento.Porcentaje.toString():
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DTPF: ${format_number(
              lineaDeDetalle.discountByFamilyAndPaymentType,
              configuracionDeDecimales.defaultDisplayDecimals
            )}%`
          );
          break;
        case TiposDeDescuento.Monetario.toString():
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DTPF: ${DarFormatoAlMonto(
              format_number(
                lineaDeDetalle.discountByFamilyAndPaymentType,
                configuracionDeDecimales.defaultDisplayDecimals
              )
            )}`
          );
          break;
        default:
          tiposDeDescuentoAplicadosALineaDeProducto.push(
            `DTPF: ${format_number(
              lineaDeDetalle.discountByFamilyAndPaymentType,
              configuracionDeDecimales.defaultDisplayDecimals
            )}`
          );
          break;
      }
    }

    if (
      lineaDeDetalle.discountByGeneralAmount &&
      lineaDeDetalle.discountByGeneralAmount > 0
    ) {
      tiposDeDescuentoAplicadosALineaDeProducto.push(
        `DMG: ${format_number(
          lineaDeDetalle.discountByGeneralAmount,
          configuracionDeDecimales.defaultDisplayDecimals
        )}`
      );
    }

    return tiposDeDescuentoAplicadosALineaDeProducto.join(" ");
  }
}
