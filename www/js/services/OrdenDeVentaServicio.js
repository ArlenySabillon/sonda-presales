var OrdenDeVentaServicio = (function () {
    function OrdenDeVentaServicio() {
        this.clienteServicio = new ClienteServicio();
        this.tareaServicio = new TareaServcio();
        this.decimalesServicio = new ManejoDeDecimalesServicio();
    }
    OrdenDeVentaServicio.prototype.insertarOrdenDeVenta = function (ordenDeVenta, callback, callbackError) {
        var _this = this;
        try {
            var sql_1 = "";
            var localIsOnline_1 = gIsOnline;
            SONDA_DB_Session.transaction(function (tx) {
                sql_1 = "SELECT";
                sql_1 += " C.CLIENT_ID";
                sql_1 += " FROM CLIENTS C";
                sql_1 += " WHERE C.CLIENT_HH_ID_OLD = '" + ordenDeVenta.clientId + "'";
                sql_1 += " OR C.CLIENT_ID = '" + ordenDeVenta.clientId + "'";
                tx.executeSql(sql_1, [], function (txClient, resultsClient) {
                    if (resultsClient.rows.length > 0) {
                        ordenDeVenta.clientId = resultsClient.rows.item(0).CLIENT_ID;
                        sql_1 = "SELECT";
                        sql_1 += " T.TASK_BO_ID";
                        sql_1 += " FROM TASK T";
                        sql_1 += " WHERE T.TASK_ID = " + ordenDeVenta.taskId;
                        txClient.executeSql(sql_1, [], function (txTask, resultsTask) {
                            if (resultsTask.rows.length > 0) {
                                ordenDeVenta.taskIdBo =
                                    resultsTask.rows.item(0).TASK_BO_ID != null
                                        ? resultsTask.rows.item(0).TASK_BO_ID
                                        : 0;
                                sql_1 = _this.obtnerFormatoSqlDeInsertarOrdenDeVentaHencabezado(ordenDeVenta);
                                txTask.executeSql(sql_1);
                                ordenDeVenta.ordenDeVentaDetalle.map(function (salesOrderDetail, index, array) {
                                    sql_1 = _this.obtnerFormatoSqlDeInsertarOrdenDeVentaDetalle(salesOrderDetail, index + 1);
                                    txTask.executeSql(sql_1);
                                    if (localIsOnline_1 === SiNo.No) {
                                        sql_1 = _this.actualizaInventarioPreventa(salesOrderDetail);
                                        if (sql_1 !== "") {
                                            txTask.executeSql(sql_1);
                                        }
                                    }
                                });
                                if (ordenDeVenta.isParent) {
                                    sql_1 = _this.actualizaOrdenReferenciaId(ordenDeVenta);
                                    txTask.executeSql(sql_1);
                                    _this.obtenerTotalDeProductosDeOrdenDeVenta(gtaskid, txTask, function (qty, total, transTotal) {
                                        var html = "<p>";
                                        html += '<span class="small-roboto">';
                                        html += "Cant." + qty;
                                        html += "</span>";
                                        html +=
                                            '<span class="ui-li-count" style="position:absolute; top:73%">';
                                        html += DarFormatoAlMonto(ToDecimal(total));
                                        html += "</span>";
                                        html += "</p>";
                                        sql_1 = _this.obtenerQueryInsertarTareasAuxiliar(gtaskid, html);
                                        transTotal.executeSql(sql_1);
                                        callback();
                                    }, function (resultado) {
                                        callbackError(resultado);
                                    });
                                }
                                else {
                                    callback();
                                }
                            }
                            else {
                                callbackError({
                                    codigo: -1,
                                    mensaje: "Error al obtener el codigo de tarea: Sin resultados"
                                });
                            }
                        });
                    }
                    else {
                        callbackError({
                            codigo: -1,
                            mensaje: "Error al obtener el codigo de cliente: Sin resultados"
                        });
                    }
                });
            }, function (errClient) {
                callbackError({
                    codigo: -1,
                    mensaje: "Error al insertar la orden de venta: " + errClient.message
                });
            });
        }
        catch (e) {
            callbackError({
                codigo: -1,
                mensaje: "Error al insertar la orden de venta: " + e.message
            });
        }
    };
    OrdenDeVentaServicio.prototype.obtnerFormatoSqlDeInsertarOrdenDeVentaHencabezado = function (ordenDeVenta) {
        var sql = "";
        sql += "INSERT INTO SALES_ORDER_HEADER (";
        sql += "SALES_ORDER_ID";
        sql += ", TERMS";
        sql += ", POSTED_DATETIME";
        sql += ", CLIENT_ID";
        sql += ", POS_TERMINAL";
        sql += ", GPS_URL";
        sql += ", TOTAL_AMOUNT";
        sql += ", STATUS";
        sql += ", POSTED_BY";
        sql += ", IMAGE_1";
        sql += ", IMAGE_2";
        sql += ", IMAGE_3";
        sql += ", DEVICE_BATTERY_FACTOR";
        sql += ", VOID_DATETIME";
        sql += ", VOID_REASON";
        sql += ", VOID_NOTES";
        sql += ", VOIDED";
        sql += ", CLOSED_ROUTE_DATETIME";
        sql += ", IS_ACTIVE_ROUTE";
        sql += ", GPS_EXPECTED";
        sql += ", SALES_ORDER_ID_BO";
        sql += ", IS_POSTED";
        sql += ", DELIVERY_DATE";
        sql += ", TASK_ID";
        sql += ", IS_PARENT";
        sql += ", REFERENCE_ID";
        sql += ", TIMES_PRINTED";
        sql += ", SINC";
        sql += ", DOC_SERIE";
        sql += ", DOC_NUM";
        sql += ", IS_POSTED_VOID";
        sql += ", IS_VOID";
        sql += ", SALES_ORDER_TYPE";
        sql += ", DISCOUNT";
        sql += ", IS_DRAFT";
        sql += ", IS_UPDATED";
        sql += ", COMMENT";
        sql += ", TASK_ID_BO";
        sql += ", PAYMENT_TIMES_PRINTED";
        sql += ", PAID_TO_DATE";
        sql += ", TO_BILL";
        sql += ", AUTHORIZED";
        sql += ", DETAIL_QTY";
        sql += ", IS_POSTED_VALIDATED";
        sql += ", DISCOUNT_BY_GENERAL_AMOUNT";
        sql += ", DEVICE_NETWORK_TYPE";
        sql += ", IS_POSTED_OFFLINE ";
        sql += ", TOTAL_AMOUNT_DISPLAY";
        sql += ", GOAL_HEADER_ID";
        sql += ", PURCHASE_ORDER_NUMBER";
        sql += ") VALUES(";
        sql += "" + ordenDeVenta.salesOrderId;
        sql += ",'" + ordenDeVenta.terms + "'";
        sql += ",'" + ordenDeVenta.postedDatetime + "'";
        sql += ",'" + ordenDeVenta.clientId + "'";
        sql += ",'" + ordenDeVenta.posTerminal + "'";
        sql += ",'" + ordenDeVenta.gpsUrl + "'";
        sql += "," + ordenDeVenta.totalAmount;
        sql += ",'" + ordenDeVenta.status + "'";
        sql += ",'" + ordenDeVenta.postedBy + "'";
        if (ordenDeVenta.image1 === null || ordenDeVenta.image1 === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.image1 + "'";
        }
        if (ordenDeVenta.image2 === null || ordenDeVenta.image2 === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.image2 + "'";
        }
        if (ordenDeVenta.image3 === null || ordenDeVenta.image3 === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.image3 + "'";
        }
        sql += ",'" + ordenDeVenta.deviceBatteryFactor + "'";
        if (ordenDeVenta.voidDatetime === null ||
            ordenDeVenta.voidDatetime === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.voidDatetime + "'";
        }
        if (ordenDeVenta.voidReason === null ||
            ordenDeVenta.voidReason === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.voidReason + "'";
        }
        if (ordenDeVenta.voidNotes === null ||
            ordenDeVenta.voidNotes === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.voidNotes + "'";
        }
        if (ordenDeVenta.voided === null || ordenDeVenta.voided === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.voided + "'";
        }
        if (ordenDeVenta.closedRouteDatetime === null ||
            ordenDeVenta.closedRouteDatetime === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.closedRouteDatetime + "'";
        }
        sql += "," + ordenDeVenta.isActiveRoute;
        sql += ",'" + ordenDeVenta.gpsExpected + "'";
        sql += "," + ordenDeVenta.salesOrderIdBo;
        sql += "," + ordenDeVenta.isPosted;
        sql += ",'" + ordenDeVenta.deliveryDate + "'";
        sql += "," + ordenDeVenta.taskId;
        sql += "," + (ordenDeVenta.isParent ? 1 : 0);
        sql += ",'" + ordenDeVenta.referenceId + "'";
        sql += "," + ordenDeVenta.timesPrinted;
        sql += "," + ordenDeVenta.sinc;
        sql += ",'" + ordenDeVenta.docSerie + "'";
        sql += "," + ordenDeVenta.docNum;
        sql += "," + ordenDeVenta.isPostedVoid;
        sql += "," + (ordenDeVenta.isVoid ? 1 : 0);
        sql += ",'" + ordenDeVenta.salesOrderType + "'";
        if (ordenDeVenta.discount === null ||
            ordenDeVenta.discount === undefined ||
            ordenDeVenta.discount <= 0) {
            sql += ",'0'";
        }
        else {
            sql += ",'" + ordenDeVenta.discount + "'";
        }
        sql += "," + ordenDeVenta.isDraft;
        sql += "," + ordenDeVenta.isUpdated;
        if (ordenDeVenta.comment === null || ordenDeVenta.comment === undefined) {
            sql += ",null";
        }
        else {
            sql += ",'" + ordenDeVenta.comment + "'";
        }
        sql += ", " + ordenDeVenta.taskIdBo;
        sql += ", " + ordenDeVenta.paymentTimesPrinted;
        sql += ", " + ordenDeVenta.paidToDate;
        sql += ", " + ordenDeVenta.toBill;
        sql += ", " + (ordenDeVenta.authorized ? 1 : 0);
        if (ordenDeVenta.detailQty === null ||
            ordenDeVenta.detailQty === undefined) {
            sql += ",null";
        }
        else {
            sql += "," + ordenDeVenta.detailQty;
        }
        if (ordenDeVenta.isPostedValidated === null ||
            ordenDeVenta.isPostedValidated === undefined) {
            sql += ",null";
        }
        else {
            sql += "," + ordenDeVenta.isPostedValidated;
        }
        if (ordenDeVenta.discountByGeneralAmountApplied === null ||
            ordenDeVenta.discountByGeneralAmountApplied === undefined) {
            sql += ",null";
        }
        else {
            sql += "," + ordenDeVenta.discountByGeneralAmountApplied;
        }
        sql += ",'" + tipoDeRedALaQueEstaConectadoElDispositivo + "'";
        sql += "," + (gIsOnline === SiNo.Si ? 0 : 1);
        sql += "," + (ordenDeVenta.totalAmountDisplay ? ordenDeVenta.totalAmountDisplay : 0);
        sql += "," + ordenDeVenta.goalHeaderId;
        sql += ordenDeVenta.purchaseOrderNumber && ordenDeVenta.purchaseOrderNumber.length ? ", '" + ordenDeVenta.purchaseOrderNumber + "'" : ", NULL";
        sql += ")";
        return sql;
    };
    OrdenDeVentaServicio.prototype.obtnerFormatoSqlDeInsertarOrdenDeVentaDetalle = function (ordenDeVentaDetalle, numeroDeLinea) {
        var listaDeLi = [];
        listaDeLi.push("INSERT INTO SALES_ORDER_DETAIL (");
        listaDeLi.push("SALES_ORDER_ID");
        listaDeLi.push(",SKU");
        listaDeLi.push(",LINE_SEQ");
        listaDeLi.push(",QTY");
        listaDeLi.push(",PRICE");
        listaDeLi.push(",DISCOUNT");
        listaDeLi.push(",TOTAL_LINE");
        listaDeLi.push(",POSTED_DATETIME");
        listaDeLi.push(",SERIE");
        listaDeLi.push(",SERIE_2");
        listaDeLi.push(",REQUERIES_SERIE");
        listaDeLi.push(",COMBO_REFERENCE");
        listaDeLi.push(",PARENT_SEQ");
        listaDeLi.push(",IS_ACTIVE_ROUTE");
        listaDeLi.push(", IS_POSTED_VOID");
        listaDeLi.push(", IS_VOID");
        listaDeLi.push(", CODE_PACK_UNIT");
        listaDeLi.push(" , DOC_SERIE");
        listaDeLi.push(" , DOC_NUM");
        listaDeLi.push(" , IS_BONUS");
        listaDeLi.push(" , LONG");
        listaDeLi.push(" , IS_SALES_BY_MULTIPLE");
        listaDeLi.push(" , MULTIPLE_SALE_QTY");
        listaDeLi.push(" , OWNER");
        listaDeLi.push(" , OWNER_ID");
        listaDeLi.push(" , DISCOUNT_TYPE");
        listaDeLi.push(" , DISCOUNT_BY_FAMILY");
        listaDeLi.push(" , DISCOUNT_BY_GENERAL_AMOUNT");
        listaDeLi.push(" , DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE");
        listaDeLi.push(" , TYPE_OF_DISCOUNT_BY_FAMILY");
        listaDeLi.push(" , TYPE_OF_DISCOUNT_BY_GENERAL_AMOUNT");
        listaDeLi.push(" , TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE");
        listaDeLi.push(" , TOTAL_AMOUNT_DISPLAY");
        listaDeLi.push(" , BASE_PRICE");
        listaDeLi.push(" , CODE_FAMILY");
        listaDeLi.push(" , UNIQUE_DISCOUNT_BY_SCALE_APPLIED");
        listaDeLi.push(") VALUES(");
        listaDeLi.push("" + ordenDeVentaDetalle.salesOrderId);
        listaDeLi.push(",'" + ordenDeVentaDetalle.sku + "'");
        listaDeLi.push("," + numeroDeLinea);
        listaDeLi.push("," + ordenDeVentaDetalle.qty);
        listaDeLi.push("," + ordenDeVentaDetalle.price);
        listaDeLi.push("," + ordenDeVentaDetalle.discount);
        listaDeLi.push("," + ordenDeVentaDetalle.totalLine);
        listaDeLi.push(",'" + ordenDeVentaDetalle.postedDatetime + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.serie + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.serie2 + "'");
        listaDeLi.push(",'" + (ordenDeVentaDetalle.requeriesSerie ? 1 : 0) + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.comboReference + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.parentSeq + "'");
        listaDeLi.push("," + ordenDeVentaDetalle.isActiveRoute);
        listaDeLi.push("," + ordenDeVentaDetalle.isPostedVoid);
        listaDeLi.push("," + (ordenDeVentaDetalle.isVoid ? 1 : 0));
        listaDeLi.push(",'" + ordenDeVentaDetalle.codePackUnit + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.docSerie + "'");
        listaDeLi.push("," + ordenDeVentaDetalle.docNum);
        listaDeLi.push("," + ordenDeVentaDetalle.isBonus);
        if (!ordenDeVentaDetalle.long || ordenDeVentaDetalle.long === NaN) {
            listaDeLi.push(", NULL");
        }
        else {
            listaDeLi.push("," + ordenDeVentaDetalle.long + ",");
        }
        listaDeLi.push("," + (ordenDeVentaDetalle.isSaleByMultiple ? 1 : 0));
        if (!ordenDeVentaDetalle.isSaleByMultiple) {
            listaDeLi.push(",null");
        }
        else {
            listaDeLi.push("," + ordenDeVentaDetalle.multipleSaleQty);
        }
        listaDeLi.push(",'" + ordenDeVentaDetalle.owner + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.ownerId + "'");
        if (ordenDeVentaDetalle.discountType) {
            listaDeLi.push(",'" + ordenDeVentaDetalle.discountType + "'");
        }
        else {
            listaDeLi.push(",null");
        }
        listaDeLi.push("," + ordenDeVentaDetalle.discountByFamily);
        listaDeLi.push("," + ordenDeVentaDetalle.discountByGeneralAmount);
        listaDeLi.push("," + ordenDeVentaDetalle.discountByFamilyAndPaymentType);
        listaDeLi.push(",'" + ordenDeVentaDetalle.typeOfDiscountByFamily + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.typeOfDiscountByGeneralAmount + "'");
        listaDeLi.push(",'" + ordenDeVentaDetalle.typeOfDiscountByFamilyAndPaymentType + "'");
        listaDeLi.push("," + (ordenDeVentaDetalle.totalAmountDisplay
            ? ordenDeVentaDetalle.totalAmountDisplay
            : 0));
        listaDeLi.push("," + ordenDeVentaDetalle.basePrice);
        listaDeLi.push(ordenDeVentaDetalle.codeFamilySku &&
            ordenDeVentaDetalle.codeFamilySku.length > 0
            ? ", '" + ordenDeVentaDetalle.codeFamilySku + "'"
            : ", " + null);
        listaDeLi.push(",'" + ordenDeVentaDetalle.uniqueDiscountByScaleAplied + "'");
        listaDeLi.push(")");
        return listaDeLi.join("");
    };
    OrdenDeVentaServicio.prototype.actualizaOrdenReferenciaId = function (ordenDeVenta) {
        var sql = "";
        sql += " UPDATE SALES_ORDER_HEADER SET ";
        sql += " REFERENCE_ID = '" + ordenDeVenta.referenceId + "'";
        sql += " WHERE TASK_ID = " + ordenDeVenta.taskId;
        return sql;
    };
    OrdenDeVentaServicio.prototype.obtenerTotalDeProductosDeOrdenDeVenta = function (taskid, tx, callback, errCallBack) {
        try {
            var sql = "SELECT SUM(D.QTY) QTY ,SUM(D.TOTAL_LINE) TOTAL";
            sql += " FROM SALES_ORDER_HEADER H";
            sql +=
                " INNER JOIN SALES_ORDER_DETAIL D ON (H.SALES_ORDER_ID = D.SALES_ORDER_ID AND H.DOC_SERIE = D.DOC_SERIE AND H.DOC_NUM = D.DOC_NUM)";
            sql += " WHERE H.TASK_ID = " + taskid;
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var ordenDeVenta = results.rows.item(0);
                    callback(ordenDeVenta.QTY, ordenDeVenta.TOTAL, tx);
                }
                else {
                    callback(0, 0, tx);
                }
            }, function (err) {
                if (err.code !== 0)
                    errCallBack({
                        codigo: -1,
                        mensaje: "Error al obtener Toltal de productos: " + err.message
                    });
            });
        }
        catch (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener Toltal de productos" + err.message
            });
        }
    };
    OrdenDeVentaServicio.prototype.obtenerQueryInsertarTareasAuxiliar = function (taskId, html) {
        var sql = "";
        sql += "INSERT INTO TASK_AUX (";
        sql += "PRESALES_ROUTE_ID";
        sql += ",HTML";
        sql += ")VALUES(";
        sql += taskId;
        sql += ",'" + html + "'";
        sql += ")";
        return sql;
    };
    OrdenDeVentaServicio.prototype.actualizaInventarioPreventa = function (ordenDeVentaDetalle) {
        var sql = "";
        sql += "UPDATE SKU_PRESALE SET";
        sql += " IS_COMITED = (IS_COMITED +" + ordenDeVentaDetalle.qty + ")";
        sql += " ,DIFFERENCE = (ON_HAND - IS_COMITED)";
        sql += " WHERE SKU = '" + ordenDeVentaDetalle.sku + "'";
        return sql;
    };
    OrdenDeVentaServicio.prototype.obtenerFormatoDeImpresionPreSale = function (cliente, ordenDeVenta, callback, callbackError) {
        var _this = this;
        this.decimalesServicio.obtenerInformacionDeManejoDeDecimales(function (configuracionDeDecimales) {
            var tipoDeFormatoDeImpresion = localStorage.getItem(TipoDeParametro.FormatoDeImpresion);
            switch (tipoDeFormatoDeImpresion) {
                case FormatoDeImpresion.Pacasa:
                    _this.obtenerFormatoDeImpresionDeOrdenDeVentaPacasaHonduras(cliente, ordenDeVenta, callback, callbackError, configuracionDeDecimales);
                    break;
                default:
                    _this.obtenerFormatoDeImpresionEstandarParaOrdenDeVenta(cliente, ordenDeVenta, callback, callbackError);
                    break;
            }
        });
    };
    OrdenDeVentaServicio.prototype.actualizarDocumnetoImpreso = function (taskId, documento, documentoDePago, callback, errCallBack) {
        documento = documento.replace("***** ORIGINAL *****", "***** REIMPRESION *****");
        documentoDePago = documentoDePago.replace("***** ORIGINAL *****", "***** REIMPRESION *****");
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "UPDATE PRESALES_ROUTE";
            sql += " SET";
            sql += " DOC_PRINTED = '" + documento + "'";
            sql += " ,PAYMENT_PRINTED = '" + documentoDePago + "'";
            sql += " WHERE TASK_ID = " + taskId;
            tx.executeSql(sql, [], function (tx, results) {
                callback();
            }, function (tx, err) {
                if (err.code !== 0)
                    errCallBack({
                        codigo: -1,
                        mensaje: "Error al actualizar el documento de impreso: " + err.message
                    });
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al actualizar el documento de impreso: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerOrdenDeVentaPorTarea = function (tarea, decimales, callback, errCallBack) {
        var _this = this;
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " H.SALES_ORDER_ID ";
            sql += " , H.DELIVERY_DATE ";
            sql += " , C.CLIENT_NAME ";
            sql += " , C.ADDRESS ";
            sql += " , C.PHONE ";
            sql += " , C.CONTACT_CUSTOMER ";
            sql += " , H.TIMES_PRINTED ";
            sql += " , H.REFERENCE_ID ";
            sql += " , H.TOTAL_AMOUNT ";
            sql += " , H.DOC_SERIE ";
            sql += " , H.DOC_NUM ";
            sql += " , H.IS_VOID ";
            sql += " , H.IS_DRAFT ";
            sql += " , H.DISCOUNT ";
            sql += " , H.TASK_ID ";
            sql += " , H.COMMENT ";
            sql += " , H.PAYMENT_TIMES_PRINTED";
            sql += " , H.IMAGE_3";
            sql += " , H.DISCOUNT_BY_GENERAL_AMOUNT";
            sql += " , H.IS_POSTED";
            sql += " , H.TOTAL_AMOUNT_DISPLAY";
            sql += " , H.SALES_ORDER_TYPE";
            sql += " FROM CLIENTS C ";
            sql +=
                " INNER JOIN SALES_ORDER_HEADER H ON (C.CLIENT_ID = H.CLIENT_ID) ";
            sql += " WHERE h.TASK_ID = " + tarea.taskId;
            sql += " AND IS_PARENT = 1 ";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var ordenDeVentaTemp = results.rows.item(0);
                    var ordenDeVenta = new OrdenDeVenta();
                    ordenDeVenta.salesOrderId = ordenDeVentaTemp.SALES_ORDER_ID;
                    ordenDeVenta.deliveryDate = ordenDeVentaTemp.DELIVERY_DATE;
                    ordenDeVenta.clientName = ordenDeVentaTemp.CLIENT_NAME;
                    ordenDeVenta.timesPrinted = ordenDeVentaTemp.TIMES_PRINTED;
                    ordenDeVenta.referenceId = ordenDeVentaTemp.REFERENCE_ID;
                    ordenDeVenta.totalAmount = trunc_number(ordenDeVentaTemp.TOTAL_AMOUNT, decimales.defaultCalculationsDecimals);
                    ordenDeVenta.docSerie = ordenDeVentaTemp.DOC_SERIE;
                    ordenDeVenta.docNum = ordenDeVentaTemp.DOC_NUM;
                    ordenDeVenta.isVoid = ordenDeVentaTemp.IS_VOID === 1;
                    ordenDeVenta.isDraft = ordenDeVentaTemp.IS_DRAFT;
                    ordenDeVenta.discount = trunc_number(ordenDeVentaTemp.DISCOUNT, decimales.defaultCalculationsDecimals);
                    ordenDeVenta.taskId = ordenDeVentaTemp.TASK_ID;
                    ordenDeVenta.comment = ordenDeVentaTemp.COMMENT;
                    ordenDeVenta.paymentTimesPrinted = ordenDeVentaTemp.TIMES_PRINTED;
                    ordenDeVenta.paymentTimesPrinted =
                        ordenDeVentaTemp.PAYMENT_TIMES_PRINTED;
                    ordenDeVenta.image3 = ordenDeVentaTemp.IMAGE_3;
                    ordenDeVenta.discountByGeneralAmountApplied =
                        ordenDeVentaTemp.DISCOUNT_BY_GENERAL_AMOUNT;
                    ordenDeVenta.totalAmountDisplay =
                        ordenDeVentaTemp.TOTAL_AMOUNT_DISPLAY;
                    ordenDeVenta.isPosted =
                        ordenDeVentaTemp.IS_POSTED === undefined ||
                            ordenDeVentaTemp.IS_POSTED === null ||
                            ordenDeVentaTemp.IS_POSTED === "null" ||
                            ordenDeVentaTemp.IS_POSTED === "NULL"
                            ? 0
                            : parseInt(ordenDeVentaTemp.IS_POSTED);
                    ordenDeVenta.salesOrderType = ordenDeVentaTemp.SALES_ORDER_TYPE;
                    _this.obtenerOrdenDeVentaDetalle(ordenDeVenta, decimales, function (ordenDeVenta) {
                        var total = 0;
                        for (var i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
                            total += ordenDeVenta.ordenDeVentaDetalle[i].totalLine;
                        }
                        ordenDeVenta.totalAmount = total;
                        callback(ordenDeVenta);
                    }, function (resultado) {
                        errCallBack(resultado);
                    });
                }
                else {
                    var ordenDeVentaNew = new OrdenDeVenta();
                    ordenDeVentaNew.ordenDeVentaDetalle = [];
                    callback(ordenDeVentaNew);
                }
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener la orden de venta: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerOrdenDeVentaDetalle = function (ordenDeVenta, decimales, callback, errCallBack) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaDeLi = [];
            listaDeLi.push(" SELECT ");
            listaDeLi.push(" D.SKU ");
            listaDeLi.push(" , MAX(S.SKU_NAME) SKU_NAME");
            listaDeLi.push(" , MAX(D.PRICE) PRICE");
            listaDeLi.push(" , MAX(D.QTY) QTY");
            listaDeLi.push(" , MAX(D.TOTAL_LINE) TOTAL_LINE");
            listaDeLi.push(" , MAX(D.SERIE) SERIE");
            listaDeLi.push(" , MAX(TOTAL_AMOUNT) TOTAL_AMOUNT");
            listaDeLi.push(" , MAX(CODE_FAMILY) CODE_FAMILY");
            listaDeLi.push(" , D.CODE_PACK_UNIT");
            listaDeLi.push(" , MAX(S.ON_HAND) - MAX(S.IS_COMITED) AVAILABLE");
            listaDeLi.push(" , D.IS_BONUS");
            listaDeLi.push(" , D.DISCOUNT");
            listaDeLi.push(" , D.LONG");
            listaDeLi.push(" , D.DISCOUNT_TYPE");
            listaDeLi.push(" , D.DISCOUNT_BY_FAMILY");
            listaDeLi.push(" , D.DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE");
            listaDeLi.push(" , D.TYPE_OF_DISCOUNT_BY_FAMILY");
            listaDeLi.push(" , D.TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE");
            listaDeLi.push(" , D.TOTAL_AMOUNT_DISPLAY");
            listaDeLi.push(" FROM SALES_ORDER_HEADER H");
            listaDeLi.push(" INNER JOIN SALES_ORDER_DETAIL D ON (H.SALES_ORDER_ID = D.SALES_ORDER_ID AND H.DOC_SERIE = D.DOC_SERIE AND H.DOC_NUM = D.DOC_NUM)");
            listaDeLi.push(" INNER JOIN SKU_PRESALE S ON (S.SKU = D.SKU)");
            if (!ordenDeVenta.taskId) {
                listaDeLi.push(" WHERE H.TASK_ID = " + ordenDeVenta.taskId);
            }
            else {
                listaDeLi.push(" WHERE H.SALES_ORDER_ID = " + ordenDeVenta.salesOrderId);
                listaDeLi.push(" AND H.DOC_SERIE = '" + ordenDeVenta.docSerie + "'");
                listaDeLi.push(" AND H.DOC_NUM = " + ordenDeVenta.docNum);
            }
            listaDeLi.push(" GROUP BY D.SKU, D.CODE_PACK_UNIT, D.IS_BONUS,D.LONG");
            console.log(listaDeLi.join(""));
            tx.executeSql(listaDeLi.join(""), [], function (tx, results) {
                if (results.rows.length >= 1) {
                    ordenDeVenta.ordenDeVentaDetalle = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        var detalleTemp = results.rows.item(i);
                        var ordenDeVentaDetalle = new OrdenDeVentaDetalle();
                        ordenDeVentaDetalle.sku = detalleTemp.SKU;
                        ordenDeVentaDetalle.skuName = detalleTemp.SKU_NAME;
                        ordenDeVentaDetalle.price = trunc_number(detalleTemp.PRICE, decimales.defaultCalculationsDecimals);
                        ordenDeVentaDetalle.qty = trunc_number(detalleTemp.QTY, decimales.defaultCalculationsDecimals);
                        ordenDeVentaDetalle.totalLine = trunc_number(detalleTemp.TOTAL_LINE, decimales.defaultCalculationsDecimals);
                        ordenDeVentaDetalle.serie = detalleTemp.SERIE;
                        ordenDeVentaDetalle.codePackUnit = detalleTemp.CODE_PACK_UNIT;
                        ordenDeVentaDetalle.skuAvailable = trunc_number(detalleTemp.AVAILABLE, decimales.defaultCalculationsDecimals);
                        ordenDeVentaDetalle.isBonus = detalleTemp.IS_BONUS;
                        ordenDeVentaDetalle.discount = detalleTemp.DISCOUNT;
                        ordenDeVentaDetalle.long = detalleTemp.LONG;
                        ordenDeVentaDetalle.discountType = detalleTemp.DISCOUNT_TYPE;
                        ordenDeVentaDetalle.discountByFamily =
                            detalleTemp.DISCOUNT_BY_FAMILY;
                        ordenDeVentaDetalle.discountByFamilyAndPaymentType =
                            detalleTemp.DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE;
                        ordenDeVentaDetalle.typeOfDiscountByFamily =
                            detalleTemp.TYPE_OF_DISCOUNT_BY_FAMILY;
                        ordenDeVentaDetalle.typeOfDiscountByFamilyAndPaymentType =
                            detalleTemp.TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE;
                        ordenDeVentaDetalle.totalAmountDisplay =
                            detalleTemp.TOTAL_AMOUNT_DISPLAY;
                        ordenDeVentaDetalle.codeFamilySku = detalleTemp.CODE_FAMILY;
                        ordenDeVenta.ordenDeVentaDetalle.push(ordenDeVentaDetalle);
                    }
                    callback(ordenDeVenta);
                }
                else {
                    errCallBack({
                        codigo: -1,
                        mensaje: "Error no se encontraron detalles de la orden de venta."
                    });
                }
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener la orden de venta: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerFormatoImpresoOrdenDeVenta = function (tarea, callback, errCallBack) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = " SELECT ";
            sql += " DOC_PRINTED ";
            sql += " FROM PRESALES_ROUTE ";
            sql += " WHERE TASK_ID = " + tarea.taskId;
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var detalleTemp = results.rows.item(0);
                    callback(detalleTemp.DOC_PRINTED);
                }
                else {
                    errCallBack({
                        codigo: -1,
                        mensaje: "Error no se encontro el formato de impresion"
                    });
                }
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener el formato de impresion: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerFormatoImpresoOrdenDeVentaPago = function (tarea, callback, errCallBack) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = " SELECT ";
            sql += " PAYMENT_PRINTED";
            sql += " FROM PRESALES_ROUTE ";
            sql += " WHERE TASK_ID = " + tarea.taskId;
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var detalleTemp = results.rows.item(0);
                    callback(detalleTemp.PAYMENT_PRINTED);
                }
                else {
                    errCallBack({
                        codigo: -1,
                        mensaje: "Error no se encontro el formato de impresion"
                    });
                }
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener el formato de impresion: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.actualizarVecesImpresionOrdenDeVenta = function (tarea, ordenDeVenta, callback, errCallBack) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = " UPDATE SALES_ORDER_HEADER SET ";
            sql += " TIMES_PRINTED = " + ordenDeVenta.timesPrinted;
            sql += " ,PAYMENT_TIMES_PRINTED = " + ordenDeVenta.paymentTimesPrinted;
            sql += " ,SINC = 0 ";
            sql += " WHERE TASK_ID = " + tarea.taskId;
            tx.executeSql(sql, [], function (tx, results) {
                callback();
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error no se pudo actualizar la cantidad de veces de impresion.: " +
                    err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerVecesImpresionOrdenDeVenta = function (tarea, callback, errCallBack) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = " SELECT ";
            sql += " TIMES_PRINTED,PAYMENT_TIMES_PRINTED ";
            sql += " FROM SALES_ORDER_HEADER ";
            sql += " WHERE TASK_ID = " + tarea.taskId;
            console.log(sql);
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var detalleTemp = results.rows.item(0);
                    callback(detalleTemp.TIMES_PRINTED, detalleTemp.PAYMENT_TIMES_PRINTED);
                }
                else {
                    errCallBack({
                        codigo: -1,
                        mensaje: "Error no se encontro la cantidad de veces para impresion"
                    });
                }
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener la cantidad de veces para impresion: " +
                    err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.insertarOrdenDeVentaDraft = function (ordenDeVenta, callback, callbackError) {
        var _this = this;
        SONDA_DB_Session.transaction(function (tx) {
            var sql = _this.obtnerFormatoSqlDeInsertarOrdenDeVentaHencabezado(ordenDeVenta);
            tx.executeSql(sql);
            ordenDeVenta.ordenDeVentaDetalle.map(function (ordenDeVentaDetalle, index, array) {
                sql = _this.obtnerFormatoSqlDeInsertarOrdenDeVentaDetalle(ordenDeVentaDetalle, index + 1);
                tx.executeSql(sql);
            });
            callback();
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al insertar el borrador de orden de venta: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.actualizarOrdenDeVentaDraft = function (ordenDeVenta, callback, callbackError) {
        var _this = this;
        SONDA_DB_Session.transaction(function (tx) {
            var sql = _this.obtnerFormatoSqlDeActualizacionOrdenDeVentaHencabezado(ordenDeVenta);
            tx.executeSql(sql);
            sql = _this.obtnerFormatoSqlDeBorrarOrdenDeVentaDetalle(ordenDeVenta);
            tx.executeSql(sql);
            ordenDeVenta.ordenDeVentaDetalle.map(function (ordenDeVentaDetalle, index, array) {
                sql = _this.obtnerFormatoSqlDeInsertarOrdenDeVentaDetalle(ordenDeVentaDetalle, index + 1);
                tx.executeSql(sql);
            });
            callback();
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al insertar el borrador de orden de venta: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtnerFormatoSqlDeActualizacionOrdenDeVentaHencabezado = function (ordenDeVenta) {
        var sql = "";
        sql += " UPDATE SALES_ORDER_HEADER SET ";
        sql += " TERMS = '" + ordenDeVenta.terms + "'";
        sql += " , POSTED_DATETIME = '" + ordenDeVenta.postedDatetime + "'";
        sql += " , CLIENT_ID = '" + ordenDeVenta.clientId + "'";
        sql += " , POS_TERMINAL = '" + ordenDeVenta.posTerminal + "'";
        sql += " , GPS_URL = '" + ordenDeVenta.gpsUrl + "'";
        sql += " , TOTAL_AMOUNT = " + ordenDeVenta.totalAmount;
        sql += " , STATUS = '" + ordenDeVenta.status + "'";
        sql += " , POSTED_BY = '" + ordenDeVenta.postedBy + "'";
        sql += " , IMAGE_1 = '" + ordenDeVenta.image1 + "'";
        sql += " , IMAGE_2 = '" + ordenDeVenta.image2 + "'";
        sql += " , IMAGE_3 = '" + ordenDeVenta.image3 + "'";
        sql +=
            " , DEVICE_BATTERY_FACTOR = '" + ordenDeVenta.deviceBatteryFactor + "'";
        sql += " , VOID_DATETIME = '" + ordenDeVenta.voidDatetime + "'";
        sql += " , VOID_REASON = '" + ordenDeVenta.voidReason + "'";
        sql += " , VOID_NOTES = '" + ordenDeVenta.voidNotes + "'";
        sql += " , VOIDED = '" + ordenDeVenta.voided + "'";
        sql +=
            " , CLOSED_ROUTE_DATETIME = '" + ordenDeVenta.closedRouteDatetime + "'";
        sql += " , IS_ACTIVE_ROUTE = " + ordenDeVenta.isActiveRoute;
        sql += " , GPS_EXPECTED = '" + ordenDeVenta.gpsExpected + "'";
        sql += " , DELIVERY_DATE = '" + ordenDeVenta.deliveryDate + "'";
        sql += " , TASK_ID = " + ordenDeVenta.taskId;
        sql += " , IS_PARENT = " + (ordenDeVenta.isParent ? 1 : 0);
        sql += " , REFERENCE_ID = '" + ordenDeVenta.referenceId + "'";
        sql += " , TIMES_PRINTED = " + ordenDeVenta.timesPrinted;
        sql += " , SINC = " + ordenDeVenta.sinc;
        sql += " , IS_POSTED_VOID = " + ordenDeVenta.isPostedVoid;
        sql += " , IS_VOID = " + (ordenDeVenta.isVoid ? 1 : 0);
        sql += " , SALES_ORDER_TYPE = '" + ordenDeVenta.salesOrderType + "'";
        sql += " , DISCOUNT = '" + ordenDeVenta.discount + "'";
        sql += " , IS_DRAFT = " + ordenDeVenta.isDraft;
        sql += " , IS_UPDATED = " + ordenDeVenta.isUpdated;
        sql += ", DEVICE_NETWORK_TYPE = '" + tipoDeRedALaQueEstaConectadoElDispositivo + "'";
        sql += ", IS_POSTED_OFFLINE = " + (gIsOnline === SiNo.Si ? 0 : 1);
        sql += " WHERE SALES_ORDER_ID = " + ordenDeVenta.salesOrderId;
        sql += " AND DOC_SERIE = '" + ordenDeVenta.docSerie + "'";
        sql += " AND DOC_NUM = " + ordenDeVenta.docNum;
        return sql;
    };
    OrdenDeVentaServicio.prototype.obtnerFormatoSqlDeBorrarOrdenDeVentaDetalle = function (ordenDeVenta) {
        var sql = "";
        sql += " DELETE FROM SALES_ORDER_DETAIL ";
        sql += " WHERE SALES_ORDER_ID = " + ordenDeVenta.salesOrderId;
        sql += " AND DOC_SERIE = '" + ordenDeVenta.docSerie + "'";
        sql += " AND DOC_NUM = " + ordenDeVenta.docNum;
        return sql;
    };
    OrdenDeVentaServicio.prototype.obtnerFormatoSqlDeCancelarOCompletarOrdenDeVentaDraft = function (ordenDeVenta) {
        var sql = "";
        sql += " UPDATE SALES_ORDER_HEADER SET ";
        sql += " IS_VOID = 1";
        sql += ", IS_UPDATED = 0";
        sql += " WHERE SALES_ORDER_ID = " + ordenDeVenta.salesOrderId;
        sql += " AND DOC_SERIE = '" + ordenDeVenta.docSerie + "'";
        sql += " AND DOC_NUM = " + ordenDeVenta.docNum;
        return sql;
    };
    OrdenDeVentaServicio.prototype.cancelarOCompletarOrdenDeVentaDraft = function (ordenDeVenta, callback, callbackError) {
        var _this = this;
        SONDA_DB_Session.transaction(function (tx) {
            var sql = _this.obtnerFormatoSqlDeCancelarOCompletarOrdenDeVentaDraft(ordenDeVenta);
            tx.executeSql(sql);
            callback();
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al insertar el borrador de orden de venta: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerCantidadDeSkuPorOrdenDeVenta = function (ordenDeVenta, callback) {
        var i = 0;
        var item = new OrdenDeVentaDetalle();
        var cantidad = 0;
        for (i = 0; i < ordenDeVenta.ordenDeVentaDetalle.length; i++) {
            item = ordenDeVenta.ordenDeVentaDetalle[i];
            cantidad += item.qty;
        }
        callback(cantidad);
    };
    OrdenDeVentaServicio.prototype.marcarOrdenesDeVentaComoPosteadasYValidadasDesdeBo = function (ordenesDeVenta, callback, errorCallback) {
        try {
            SONDA_DB_Session.transaction(function (tx) {
                ordenesDeVenta.map(function (ordenDeVenta) {
                    var sql = "UPDATE SALES_ORDER_HEADER SET IS_POSTED = 2, IS_POSTED_VALIDATED = 2 WHERE DOC_SERIE = '" + ordenDeVenta.DOC_SERIE + "' AND DOC_NUM = " + ordenDeVenta.DOC_NUM;
                    tx.executeSql(sql);
                });
            }, function (err) {
                errorCallback({
                    codigo: -1,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: err.message
                });
            }, callback);
        }
        catch (e) {
            errorCallback({
                codigo: -1,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: e.message
            });
        }
    };
    OrdenDeVentaServicio.prototype.ObtenerCantidadDeTotalDeOrdenDeVenta = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" COUNT(SALES_ORDER_ID) AS TOTAL");
        listaDeLaCadena.push(" FROM SALES_ORDER_HEADER ");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalDeOrdenDeVenta = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" SUM(TOTAL_AMOUNT_DISPLAY) AS TOTAL");
        listaDeLaCadena.push(" FROM SALES_ORDER_HEADER ");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalSinDescuentoDeOrdenDeVenta = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" SUM(TOTAL_AMOUNT) AS TOTAL");
        listaDeLaCadena.push(" FROM SALES_ORDER_HEADER ");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalDeClientesConVisitados = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" COUNT(TASK_ID) AS TOTAL");
        listaDeLaCadena.push(" FROM TASK ");
        listaDeLaCadena.push(" WHERE TASK_STATUS = 'COMPLETED' ");
        listaDeLaCadena.push(" AND TASK_TYPE = 'PRESALE'");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalDeClientesAVisitar = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" COUNT(TASK_ID) AS TOTAL");
        listaDeLaCadena.push(" FROM TASK ");
        listaDeLaCadena.push(" WHERE TASK_TYPE = 'PRESALE'");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalDeTareasSinGestion = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" COUNT(TASK_ID) AS TOTAL");
        listaDeLaCadena.push(" FROM TASK ");
        listaDeLaCadena.push(" WHERE COMPLETED_SUCCESSFULLY = 0 ");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalDeTareasFueraPlanDeRuta = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" COUNT(TASK_ID) AS TOTAL");
        listaDeLaCadena.push(" FROM TASK ");
        listaDeLaCadena.push(" WHERE IN_PLAN_ROUTE = 0 ");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalClientesNuevos = function () {
        var listaDeLaCadena = [];
        listaDeLaCadena.push(" SELECT ");
        listaDeLaCadena.push(" COUNT(CLIENT_ID) AS TOTAL");
        listaDeLaCadena.push(" FROM CLIENTS ");
        listaDeLaCadena.push(" WHERE NEW = 1 ");
        return listaDeLaCadena.join("");
    };
    OrdenDeVentaServicio.prototype.ObtenerTotalesParaEstadoDeRuta = function (sql, callback, errCallBack) {
        SONDA_DB_Session.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var detalleTemp = results.rows.item(0);
                    var total = detalleTemp.TOTAL;
                    callback(total);
                }
                else {
                    callback(0);
                }
            });
        }, function (err) {
            errCallBack({
                codigo: -1,
                mensaje: "Error al obtener el total: " + err.message
            });
        });
    };
    OrdenDeVentaServicio.prototype.obtenerFormatoDeImpresionEstandarParaOrdenDeVenta = function (cliente, ordenDeVenta, callback, callbackError) {
        try {
            var nameEnterprise = localStorage.getItem("NAME_ENTERPRISE");
            var lheader = "";
            var ldetail = "";
            var lfooter = "";
            var imprimirUM = localStorage.getItem("SALE_ORDER_PRINT_UM").toString() === "1" ? 1 : 0;
            var nameUser = localStorage.getItem("LAST_LOGIN_NAME");
            var serie = ordenDeVenta.docSerie;
            var docNum = ordenDeVenta.docNum;
            lheader +=
                "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
            lheader += "CENTER 550 T 0 3 0 10 " + nameEnterprise + "\r\n";
            lheader += "L 5  50 570 50 1\r\n";
            lheader += "CENTER 550 T 0 3 0 60 Orden de Venta Serie " + serie + "\r\n";
            lheader += "CENTER 550 T 0 3 0 90 No." + docNum + "\r\n";
            lheader +=
                "LEFT 550 T 0 2 0 130 Cliente: " +
                    cliente.clientId +
                    "-" +
                    cliente.clientName +
                    "\r\n";
            lheader += "LEFT 550 T 0 2 0 160 " + cliente.address + "\r\n";
            lfooter +=
                "LEFT 550 T 0 2 0 190 Fecha de entrega: " +
                    ordenDeVenta.deliveryDate +
                    " \r\n";
            lheader += "CENTER 550 T 0 3 0 220 ***** ORIGINAL ***** \r\n";
            var pRow = 250;
            ldetail = "";
            var i = 0;
            var item = new OrdenDeVentaDetalle();
            var totalDeOrden = 0;
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
                        var totalDescuento = 0;
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
                    }
                    else {
                        totalDeOrden += item.totalLine;
                    }
                    ldetail = ldetail + "L 5 " + pRow + " 570 " + pRow + " 1\r\n";
                    pRow += 10;
                }
            }
            var totalConDescuento = totalDeOrden;
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
                    DarFormatoAlMonto(format_number(ordenDeVenta.totalAmount - totalConDescuento, 2)) +
                    "\r\n";
            if (ordenDeVenta.discountApplied - ordenDeVenta.totalAmountDisplay > 0) {
                pRow += 30;
                lfooter += "LEFT 5 T 0 2 0 " + pRow + " AJUSTE: \r\n";
                lfooter +=
                    "RIGHT 550 T 0 2 0 " +
                        pRow +
                        " " +
                        DarFormatoAlMonto(format_number(totalConDescuento - ordenDeVenta.totalAmountDisplay, 2)) +
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
            var agregarEncabezadoBonificacion = true;
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
            lfooter += "L 5  120 570 120 1\r\n";
            lfooter += "PRINT\r\n";
            lheader = "! 0 50 50 " + (pRow + 40) + " 1\r\n" + lheader;
            var pCpCl = lheader + ldetail + lfooter;
            callback(pCpCl);
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener formato de impresion de orden de venta: " +
                    err.message
            });
        }
    };
    OrdenDeVentaServicio.prototype.obtenerFormatoDeImpresionDeOrdenDeVentaPacasaHonduras = function (cliente, ordenDeVenta, callback, callbackError, configuracionDeDecimales) {
        try {
            var nameEnterprise = localStorage.getItem("NAME_ENTERPRISE");
            var lheader = "";
            var ldetail = "";
            var lfooter = "";
            var imprimirUM = localStorage.getItem("SALE_ORDER_PRINT_UM").toString() === "1" ? 1 : 0;
            var nameUser = localStorage.getItem("LAST_LOGIN_NAME");
            var serie = ordenDeVenta.docSerie;
            var docNum = ordenDeVenta.docNum;
            lheader +=
                "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
            lheader += "CENTER 550 T 0 3 0 10 " + nameEnterprise + "\r\n";
            lheader += "L 5  50 570 50 1\r\n";
            lheader += "CENTER 550 T 0 3 0 60 Orden de Venta Serie " + serie + "\r\n";
            lheader += "CENTER 550 T 0 3 0 90 No." + docNum + "\r\n";
            lheader +=
                "LEFT 550 T 0 2 0 130 Cliente: " +
                    cliente.clientId +
                    "-" +
                    cliente.clientName +
                    "\r\n";
            lheader += "LEFT 550 T 0 2 0 160 " + cliente.address + "\r\n";
            lfooter +=
                "LEFT 550 T 0 2 0 190 Fecha de entrega: " +
                    ordenDeVenta.deliveryDate +
                    " \r\n";
            lheader += "CENTER 550 T 0 3 0 220 ***** ORIGINAL ***** \r\n";
            var pRow = 250;
            ldetail = "";
            var i = 0;
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
                            format_number(item.qty, configuracionDeDecimales.defaultDisplayDecimals) +
                            " / " +
                            (imprimirUM === 1 ? "UM: " + item.codePackUnit + "/ " : "") +
                            " PREC.UNIT. : " +
                            DarFormatoAlMonto(format_number(item.price, configuracionDeDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                    ldetail =
                        ldetail +
                            "RIGHT 550 T 0 2 0 " +
                            pRow +
                            " " +
                            DarFormatoAlMonto(format_number(item.totalAmountDisplay, configuracionDeDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                    if (item.long > 0) {
                        pRow += 25;
                        ldetail =
                            ldetail +
                                "LEFT 5 T 0 2 0 " +
                                pRow +
                                " DIMENSION: " +
                                format_number(item.long, configuracionDeDecimales.defaultDisplayDecimals) +
                                "\r\n";
                    }
                    var descuentosAplicados = this.obtenerDescuentosAplicadosEnLineaDeProducto(item, configuracionDeDecimales);
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
                    DarFormatoAlMonto(format_number(ordenDeVenta.totalAmountDisplay, configuracionDeDecimales.defaultDisplayDecimals)) +
                    "\r\n";
            var agregarEncabezadoBonificacion = true;
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
                            format_number(item.qty, configuracionDeDecimales.defaultDisplayDecimals) +
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
            lfooter += "L 5  120 570 120 1\r\n";
            lfooter += "PRINT\r\n";
            lheader = "! 0 50 50 " + (pRow + 40) + " 1\r\n" + lheader;
            var pCpCl = lheader + ldetail + lfooter;
            callback(pCpCl);
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener formato de impresion de orden de venta: " +
                    err.message
            });
        }
    };
    OrdenDeVentaServicio.prototype.obtenerDescuentosAplicadosEnLineaDeProducto = function (lineaDeDetalle, configuracionDeDecimales) {
        var tiposDeDescuentoAplicadosALineaDeProducto = [];
        if (lineaDeDetalle.discount && lineaDeDetalle.discount > 0) {
            switch (lineaDeDetalle.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DESC: " + format_number(lineaDeDetalle.discount, configuracionDeDecimales.defaultDisplayDecimals) + "%");
                    break;
                case TiposDeDescuento.Monetario.toString():
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DESC: " + DarFormatoAlMonto(format_number(lineaDeDetalle.discount, configuracionDeDecimales.defaultDisplayDecimals)));
                    break;
                default:
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DESC: " + format_number(lineaDeDetalle.discount, configuracionDeDecimales.defaultDisplayDecimals));
                    break;
            }
        }
        if (lineaDeDetalle.discountByFamily &&
            lineaDeDetalle.discountByFamily > 0) {
            switch (lineaDeDetalle.discountType) {
                case TiposDeDescuento.Porcentaje.toString():
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DMF: " + format_number(lineaDeDetalle.discountByFamily, configuracionDeDecimales.defaultDisplayDecimals) + "%");
                    break;
                case TiposDeDescuento.Monetario.toString():
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DMF: " + DarFormatoAlMonto(format_number(lineaDeDetalle.discountByFamily, configuracionDeDecimales.defaultDisplayDecimals)));
                    break;
                default:
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DMF: " + format_number(lineaDeDetalle.discountByFamily, configuracionDeDecimales.defaultDisplayDecimals));
                    break;
            }
        }
        if (lineaDeDetalle.discountByFamilyAndPaymentType &&
            lineaDeDetalle.discountByFamilyAndPaymentType > 0) {
            switch (lineaDeDetalle.typeOfDiscountByFamilyAndPaymentType) {
                case TiposDeDescuento.Porcentaje.toString():
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DTPF: " + format_number(lineaDeDetalle.discountByFamilyAndPaymentType, configuracionDeDecimales.defaultDisplayDecimals) + "%");
                    break;
                case TiposDeDescuento.Monetario.toString():
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DTPF: " + DarFormatoAlMonto(format_number(lineaDeDetalle.discountByFamilyAndPaymentType, configuracionDeDecimales.defaultDisplayDecimals)));
                    break;
                default:
                    tiposDeDescuentoAplicadosALineaDeProducto.push("DTPF: " + format_number(lineaDeDetalle.discountByFamilyAndPaymentType, configuracionDeDecimales.defaultDisplayDecimals));
                    break;
            }
        }
        if (lineaDeDetalle.discountByGeneralAmount &&
            lineaDeDetalle.discountByGeneralAmount > 0) {
            tiposDeDescuentoAplicadosALineaDeProducto.push("DMG: " + format_number(lineaDeDetalle.discountByGeneralAmount, configuracionDeDecimales.defaultDisplayDecimals));
        }
        return tiposDeDescuentoAplicadosALineaDeProducto.join(" ");
    };
    return OrdenDeVentaServicio;
}());
//# sourceMappingURL=OrdenDeVentaServicio.js.map