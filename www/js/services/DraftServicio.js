var DraftServicio = (function () {
    function DraftServicio() {
    }
    DraftServicio.prototype.obtenerDraftsOrdenDeVenta = function (callback, callbackError) {
        var contador;
        var pSql = null;
        SONDA_DB_Session.transaction(function (tx) {
            pSql = " SELECT";
            pSql += " SOH.SALES_ORDER_ID";
            pSql += ", SOH.TERMS";
            pSql += ", SOH.POSTED_DATETIME";
            pSql += ", SOH.CLIENT_ID";
            pSql += ", C.CLIENT_NAME";
            pSql += ", SOH.POS_TERMINAL";
            pSql += ", SOH.GPS_URL";
            pSql += ", SOH.TOTAL_AMOUNT";
            pSql += ", SOH.STATUS";
            pSql += ", SOH.DEVICE_BATTERY_FACTOR";
            pSql += ", SOH.VOID_DATETIME";
            pSql += ", SOH.VOID_REASON";
            pSql += ", SOH.VOID_NOTES";
            pSql += ", SOH.VOIDED";
            pSql += ", SOH.CLOSED_ROUTE_DATETIME";
            pSql += ", SOH.IS_ACTIVE_ROUTE";
            pSql += ", SOH.GPS_EXPECTED";
            pSql += ", SOH.DELIVERY_DATE";
            pSql += ", SOH.IS_PARENT";
            pSql += ", SOH.REFERENCE_ID";
            pSql += ", SOH.TIMES_PRINTED";
            pSql += ", SOH.DOC_SERIE";
            pSql += ", SOH.DOC_NUM";
            pSql += ", SOH.IS_VOID";
            pSql += ", SOH.SALES_ORDER_TYPE";
            pSql += ", SOH.DISCOUNT";
            pSql += ", SOH.SALES_ORDER_ID_BO";
            pSql += ", SOH.TASK_ID";
            pSql += ", SOH.IMAGE_3";
            pSql += " FROM SALES_ORDER_HEADER AS SOH";
            pSql += " INNER JOIN CLIENTS AS C ON(";
            pSql += " SOH.CLIENT_ID = C.CLIENT_ID)";
            pSql += "  WHERE SOH.IS_DRAFT = 1 AND SOH.IS_VOID = 0";
            tx.executeSql(pSql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var ordenes = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        var stOrden = results.rows.item(i);
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
                        if (stOrden.TASK_ID === null || stOrden.TASK_ID === "") {
                            orden.taskId = 0;
                        }
                        else {
                            orden.taskId = stOrden.TASK_ID;
                        }
                        orden.ordenDeVentaDetalle = Array();
                        ordenes.push(orden);
                    }
                    callback(ordenes);
                }
                else {
                    var operacion = new Operacion();
                    operacion.resultado = ResultadoOperacionTipo.Error;
                    operacion.codigo = 0;
                    operacion.mensaje = "No se encontraron Ordenes de Venta en Estado Draft.";
                    callbackError(operacion);
                }
            });
        }, function (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        });
    };
    DraftServicio.prototype.obtenerDraftDeFacturas = function (callback, callbackError) {
        var pSql = null;
        SONDA_DB_Session.transaction(function (tx) {
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
            pSql += " ,IH.GPS_EXPECTED";
            pSql += " ,IH.IS_DRAFT";
            pSql += " FROM INVOICE_HEADER AS IH";
            pSql += " INNER JOIN CLIENTS AS C ON(";
            pSql += " IH.CLIENT_ID = C.CLIENT_ID)";
            pSql += " WHERE IH.IS_DRAFT = 1";
            tx.executeSql(pSql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var facturas = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        var stFactura = results.rows.item(i);
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
                }
                else {
                    var operacion = new Operacion();
                    operacion.resultado = ResultadoOperacionTipo.Error;
                    operacion.codigo = 0;
                    operacion.mensaje = "No se encontraron Facturas en Estado Draft.";
                    callbackError(operacion);
                }
            });
        }, function (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        });
    };
    DraftServicio.prototype.obtenerDetalleDeOrdenDeVentaDraft = function (ordenes, callback, callbackError) {
        var i;
        var ultima = 0;
        var ordenesTemp = [];
        for (i = 0; i < ordenes.length; i++) {
            if (i === ordenes.length - 1) {
                ultima = 1;
            }
            this.obtenerDetalleOrden(ordenes[i], ultima, function (orden, ultimaR) {
                ordenesTemp.push(orden);
                if (ultimaR === 1) {
                    callback(ordenesTemp);
                }
            }, function (resultado) {
                var operacion = new Operacion();
                operacion.resultado = resultado.resultado;
                operacion.codigo = resultado.codigo;
                operacion.mensaje = resultado.mensaje;
                callbackError(operacion);
            });
        }
    };
    DraftServicio.prototype.obtenerDetalleOrden = function (orden, ultima, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
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
            sql += " FROM SALES_ORDER_DETAIL AS SOD";
            sql += " INNER JOIN SKU_PRESALE AS SP ON(SOD.SKU = SP.SKU)";
            sql += " WHERE SALES_ORDER_ID =" + orden.salesOrderId;
            sql += " AND DOC_SERIE = '" + orden.docSerie + "'";
            sql += " AND DOC_NUM =" + orden.docNum;
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    for (var j = 0; j < results.rows.length; j++) {
                        var detalleTemp = results.rows.item(j);
                        var detalle = new OrdenDeVentaDetalle();
                        detalle.salesOrderId = detalleTemp.SALES_ORDER_ID;
                        detalle.sku = detalleTemp.SKU;
                        detalle.skuName = detalleTemp.SKU_NAME;
                        detalle.skuAvailable = detalleTemp.AVAILABLE;
                        detalle.lineSeq = detalleTemp.LINE_SEQ;
                        detalle.qty = detalleTemp.QTY;
                        detalle.price = detalleTemp.PRICE;
                        detalle.discount = detalleTemp.discount;
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
                        orden.ordenDeVentaDetalle.push(detalle);
                    }
                    callback(orden, ultima);
                }
                else {
                    var operacion = new Operacion();
                    callbackError(operacion);
                    operacion = null;
                }
            });
        }, function (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener sku para la orden de venta draft: " + err.message });
        });
    };
    DraftServicio.prototype.obtenerFormatoActualizarTareaIdParaBorradorDeOrdenDeVenta = function (ordenDeVenta) {
        var sql = "";
        sql += "UPDATE SALES_ORDER_HEADER SET";
        sql += " TASK_ID = " + ordenDeVenta.taskId;
        sql += " WHERE SALES_ORDER_ID = " + ordenDeVenta.salesOrderId;
        sql += " AND DOC_SERIE = '" + ordenDeVenta.docSerie + "'";
        sql += " AND DOC_NUM = " + ordenDeVenta.docNum;
        return sql;
    };
    DraftServicio.prototype.actualizarTareaIdParaBorradorDeOrdenDeVenta = function (ordenDeVenta, callback, callbackError) {
        var _this = this;
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "";
            sql = _this.obtenerFormatoActualizarTareaIdParaBorradorDeOrdenDeVenta(ordenDeVenta);
            if (sql !== "") {
                tx.executeSql(sql);
            }
            callback();
        }, function (err) {
            callbackError({ codigo: -1, mensaje: "Error al insertar orden de venta: " + err.message });
        });
    };
    DraftServicio.prototype.obtenerTaskIdParaBorradorDeOrdenDeVenta = function (ordenDeVenta, indice, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "";
            sql += "SELECT";
            sql += " TASK_ID";
            sql += " FROM TASK";
            sql += " WHERE TARGET_DOC =" + ordenDeVenta.salesOrderId;
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var detalleTemp = results.rows.item(0);
                    ordenDeVenta.taskId = detalleTemp.TASK_ID;
                }
                callback(ordenDeVenta, indice);
            });
        }, function (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener sku para la orden de venta draft: " + err.message });
        });
    };
    return DraftServicio;
}());
//# sourceMappingURL=DraftServicio.js.map