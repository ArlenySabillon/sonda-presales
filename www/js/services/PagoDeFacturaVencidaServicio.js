var PagoDeFacturaVencidaServicio = (function () {
    function PagoDeFacturaVencidaServicio() {
        this.impresionServicio = new ImpresionServicio();
    }
    PagoDeFacturaVencidaServicio.prototype.guardarDocumentoDePago = function (documentoDePago, callback, errorCallback) {
        var _this = this;
        try {
            SONDA_DB_Session.transaction(function (trans) {
                trans.executeSql(_this.obtenerFormatoSqlDeInsercionDeEncabezadoDeDocumentoDePago(documentoDePago));
                documentoDePago.overdueInvoicePaymentDetail.forEach(function (detalleDeDocumentoDePago) {
                    trans.executeSql(_this.obtenerFormatoSqlDeInsercionDeDetalleDeDocumentoDePago(detalleDeDocumentoDePago));
                });
                documentoDePago.overdueInvoicePaymentDetail.forEach(function (detalleDeDocumentoDePago) {
                    trans.executeSql(_this.obtenerFormatoSqlDeActualizacionDeMontoPendienteDePagoEnFacturaOriginal(detalleDeDocumentoDePago));
                });
                documentoDePago.overdueInvoicePaymentTypeDetail.forEach(function (tipoDePago) {
                    trans.executeSql(_this.obtenerFormatoSqlDeInsercionDeTipoDePago(tipoDePago));
                });
                trans.executeSql(_this.obtenerFormatoDeActualizacionDeBalanceDeCliente(documentoDePago));
                trans.executeSql(_this.obtenerFormatoDeActualizacionDeSecuenciaDeDocumentos(documentoDePago));
            }, function (error) {
                errorCallback({
                    codigo: error.code,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: error.message
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
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoSqlDeInsercionDeEncabezadoDeDocumentoDePago = function (documentoDePago) {
        var sql = [];
        sql.push("INSERT INTO OVERDUE_INVOICE_PAYMENT_HEADER(CODE_CUSTOMER, DOC_SERIE, DOC_NUM");
        sql.push(" ,CREATED_DATE, CODE_ROUTE, LOGIN_ID, PAYMENT_AMOUNT, IS_POSTED, COMMENT, PAYMENT_APPLIED_TO)");
        sql.push(" VALUES(");
        sql.push(" '" + documentoDePago.codeCustomer + "'");
        sql.push(" ,'" + documentoDePago.docSerie + "'");
        sql.push(" ," + documentoDePago.docNum);
        sql.push(" ,'" + documentoDePago.createdDate + "'");
        sql.push(" ,'" + documentoDePago.codeRoute + "'");
        sql.push(" ,'" + documentoDePago.loginId + "'");
        sql.push(" ," + documentoDePago.paymentAmount);
        sql.push(" ," + SiNo.No);
        sql.push(" ,'" + documentoDePago.paidComment + "'");
        sql.push(" ,'" + documentoDePago.paymentType + "'");
        sql.push(" )");
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoSqlDeInsercionDeDetalleDeDocumentoDePago = function (detalleDeDocumentoDePago) {
        var sql = [];
        sql.push("INSERT INTO OVERDUE_INVOICE_PAYMENT_DETAIL(INVOICE_ID, DOC_ENTRY, DOC_SERIE, DOC_NUM, PAYED_AMOUNT, AMOUNT_TO_DATE, PENDING_AMOUNT)");
        sql.push(" VALUES(");
        sql.push(" '" + detalleDeDocumentoDePago.invoiceId + "'");
        sql.push(" ,'" + detalleDeDocumentoDePago.docEntry + "'");
        sql.push(" ,'" + detalleDeDocumentoDePago.docSerie + "'");
        sql.push(" ," + detalleDeDocumentoDePago.docNum);
        sql.push(" ," + detalleDeDocumentoDePago.payedAmount);
        sql.push(" ," + detalleDeDocumentoDePago.amountToDate);
        sql.push(" ," + detalleDeDocumentoDePago.pendingAmount);
        sql.push(" )");
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerDocumentosDePagoNoPosteadosEnElServidor = function (callback) {
        this.obtenerEncabezadoDeDocumentosNoPosteadosEnElServidor(callback);
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerEncabezadoDeDocumentosNoPosteadosEnElServidor = function (callback) {
        var _this = this;
        var sql = [];
        var documentosDePagoNoPosteados = [];
        sql.push("SELECT CODE_CUSTOMER, DOC_SERIE, DOC_NUM, CREATED_DATE, CODE_ROUTE");
        sql.push(", LOGIN_ID, PAYMENT_AMOUNT, COMMENT FROM OVERDUE_INVOICE_PAYMENT_HEADER");
        sql.push("WHERE IS_POSTED = " + SiNo.No);
        SONDA_DB_Session.transaction(function (trans) {
            trans.executeSql(sql.join(" "), [], function (transResult, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var documentoTemporal = results.rows.item(i);
                    var documento = new PagoDeFacturaVencidaEncabezado();
                    documento.codeCustomer = documentoTemporal.CODE_CUSTOMER;
                    documento.docSerie = documentoTemporal.DOC_SERIE;
                    documento.docNum = documentoTemporal.DOC_NUM;
                    documento.createdDate = documentoTemporal.CREATED_DATE;
                    documento.codeRoute = documentoTemporal.CODE_ROUTE;
                    documento.loginId = documentoTemporal.LOGIN_ID;
                    documento.paymentAmount = documentoTemporal.PAYMENT_AMOUNT;
                    documento.paidComment = documentoTemporal.COMMENT;
                    documentosDePagoNoPosteados.push(documento);
                }
                _this.obtenerDetalleDeDocumentosDePagoNoPosteadosEnElServidor(documentosDePagoNoPosteados, 0, function (documentosDePago, transaccionActual) {
                    _this.obtenerDetalleDeTiposDePagoDeDocumentosDePagoNoPosteadosEnElServidor(documentosDePago, 0, callback, transaccionActual);
                }, transResult);
            }, function (transResult, error) {
                console.log("Error al obtener los documentos de pago de facturas vencidas no posteados debido a: '" + error.message + "'");
            });
        }, function (error) {
            console.log("Error al obtener los documentos de pago de facturas vencidas no posteados debido a: '" + error.message + "'");
        });
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerDetalleDeDocumentosDePagoNoPosteadosEnElServidor = function (documentosDePagoNoPosteadosEnElServidor, posicionActualDeDocumentoProcesado, callback, transaccionActual) {
        var _this = this;
        if (documentosDePagoNoPosteadosEnElServidor.length >
            posicionActualDeDocumentoProcesado) {
            var sql = [];
            sql.push("SELECT INVOICE_ID, DOC_ENTRY, DOC_SERIE, DOC_NUM, PAYED_AMOUNT, AMOUNT_TO_DATE, PENDING_AMOUNT FROM OVERDUE_INVOICE_PAYMENT_DETAIL");
            sql.push(" WHERE DOC_SERIE = '" + documentosDePagoNoPosteadosEnElServidor[posicionActualDeDocumentoProcesado].docSerie + "'");
            sql.push(" AND DOC_NUM = " + documentosDePagoNoPosteadosEnElServidor[posicionActualDeDocumentoProcesado].docNum);
            transaccionActual.executeSql(sql.join(""), [], function (transResult, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var detalleTemporal = results.rows.item(i);
                    var detalle = new PagoDeFacturaVencidaDetalle();
                    detalle.invoiceId = detalleTemporal.INVOICE_ID;
                    detalle.docEntry = detalleTemporal.DOC_ENTRY;
                    detalle.docSerie = detalleTemporal.DOC_SERIE;
                    detalle.docNum = detalleTemporal.DOC_NUM;
                    detalle.payedAmount = detalleTemporal.PAYED_AMOUNT;
                    detalle.amountToDate = detalleTemporal.AMOUNT_TO_DATE;
                    detalle.pendingAmount = detalleTemporal.PENDING_AMOUNT;
                    documentosDePagoNoPosteadosEnElServidor[posicionActualDeDocumentoProcesado].overdueInvoicePaymentDetail.push(detalle);
                }
                _this.obtenerDetalleDeDocumentosDePagoNoPosteadosEnElServidor(documentosDePagoNoPosteadosEnElServidor, posicionActualDeDocumentoProcesado + 1, callback, transResult);
            }, function (transResult, error) {
                console.log("Error al obtener el detalle de los documentos de pago de facturas vencidas no posteados debido a: '" + error.message + "'");
            });
        }
        else {
            callback(documentosDePagoNoPosteadosEnElServidor, transaccionActual);
        }
    };
    PagoDeFacturaVencidaServicio.prototype.marcarDocumentosDePagoComoPosteadosEnElServidor = function (documentosDePagoPosteadosEnElServidor) {
        var _this = this;
        try {
            if (documentosDePagoPosteadosEnElServidor.length > 0) {
                SONDA_DB_Session.transaction(function (trans) {
                    documentosDePagoPosteadosEnElServidor.forEach(function (documentoPosteado) {
                        if (documentoPosteado.RESULT ===
                            ResultadoDePosteoEnServidor.Exitoso) {
                            trans.executeSql(_this.obtenerFormatoDeActualizacionDePosteoDeEncabezadoDeDocumentoDePago(documentoPosteado));
                            trans.executeSql(_this.obtenerFormatoDeActualizacionDePosteoDeDetalleDeDocumentoDePago(documentoPosteado));
                            trans.executeSql(_this.obtenerFormatoDeActualizacionDePosteoDeDetalleDeTipoDePagoDeDocumentoDePago(documentoPosteado));
                        }
                    });
                }, function (error) {
                    console.log("Error al marcar el pago de factura vencida como posteado en el servidor debido a: '" + error.message + "'");
                });
            }
        }
        catch (e) {
            console.log("Error al actualizar los documentos de pago de facturas vencidas posteados en el servidor debido a: " + e.message);
        }
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoDeActualizacionDePosteoDeEncabezadoDeDocumentoDePago = function (documentoPosteado) {
        var sql = [];
        sql.push("UPDATE OVERDUE_INVOICE_PAYMENT_HEADER");
        sql.push(" SET IS_POSTED = " + SiNo.Si + ", ID = " + documentoPosteado.PAYMENT_ID_BO);
        sql.push(" WHERE DOC_SERIE = '" + documentoPosteado.DOC_SERIE + "' AND DOC_NUM = " + documentoPosteado.DOC_NUM);
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoDeActualizacionDePosteoDeDetalleDeDocumentoDePago = function (documentoPosteado) {
        var sql = [];
        sql.push("UPDATE OVERDUE_INVOICE_PAYMENT_DETAIL SET PAYMENT_HEADER_ID = " + documentoPosteado.PAYMENT_ID_BO + " ");
        sql.push(" WHERE DOC_SERIE = '" + documentoPosteado.DOC_SERIE + "' AND DOC_NUM = " + documentoPosteado.DOC_NUM);
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.imprimirPago = function (pago, callback, errorCallback) {
        this.impresionServicio.obtenerFormatoDeImpresionDePago(pago, function (formatoDeImpresion) {
            ConectarImpresora(gPrintAddress, function () {
                ImprimirDocumento(formatoDeImpresion, function () {
                    callback();
                }, errorCallback);
            });
        }, errorCallback);
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoDeActualizacionDeSecuenciaDeDocumentos = function (documentoDePago) {
        var sql = [];
        sql.push("UPDATE DOCUMENT_SEQUENCE SET CURRENT_DOC = " + documentoDePago.docNum);
        sql.push(" WHERE SERIE='" + documentoDePago.docSerie + "' AND DOC_TYPE = '" + TIpoDeDocumento.PagoDeFacturaVencida + "'");
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerParametroDePorcentajeDePagoMinimoDeFacturasVencidas = function (callback, errorCallback) {
        try {
            var parametroPorcentajeMinimoDePago = localStorage.getItem("MINIMUM_PERCENTAGE_OF_PAYMENT");
            if (parametroPorcentajeMinimoDePago == null ||
                parametroPorcentajeMinimoDePago === "null" ||
                parametroPorcentajeMinimoDePago === "0" ||
                isNaN(parseFloat(parametroPorcentajeMinimoDePago))) {
                callback(false, 0);
            }
            else {
                callback(true, parseFloat(parametroPorcentajeMinimoDePago));
            }
        }
        catch (e) {
            errorCallback({
                codigo: -1,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: "Error al obtener el parametro de porcentaje de pago minimo de facturas vencidas debido a: " + e.message
            });
        }
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoSqlDeActualizacionDeMontoPendienteDePagoEnFacturaOriginal = function (detalleDeDocumentoDePago) {
        var sql = [];
        sql.push("UPDATE OVERDUE_INVOICE_BY_CUSTOMER SET PENDING_TO_PAID = PENDING_TO_PAID - " + detalleDeDocumentoDePago.payedAmount);
        sql.push(" WHERE INVOICE_ID = '" + detalleDeDocumentoDePago.invoiceId + "' AND DOC_ENTRY = '" + detalleDeDocumentoDePago.docEntry + "'");
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerSecuenciaDeDocumentoDePago = function (callback, errorCallback) {
        var sql = [];
        sql.push("SELECT SERIE, (CURRENT_DOC + 1) AS CURRENT_DOC, BRANCH_NAME, BRANCH_ADDRESS ");
        sql.push(" FROM DOCUMENT_SEQUENCE WHERE DOC_TYPE = '" + TIpoDeDocumento.PagoDeFacturaVencida + "'");
        SONDA_DB_Session.transaction(function (trans) {
            trans.executeSql(sql.join(""), [], function (transResult, results) {
                if (results.rows.length > 0) {
                    var secuencia = {
                        serie: results.rows.item(0).SERIE,
                        numero: results.rows.item(0).CURRENT_DOC,
                        nombreSucursal: results.rows.item(0).BRANCH_NAME,
                        direccionSucursal: results.rows.item(0).BRANCH_ADDRESS
                    };
                    callback(secuencia);
                }
                else {
                    errorCallback({
                        codigo: -1,
                        resultado: ResultadoOperacionTipo.Error,
                        mensaje: "Operador no cuenta con secuencia de documentos de tipo " + TIpoDeDocumento.PagoDeFacturaVencida + ", por favor contacte a su administrador."
                    });
                }
            }, function (transResult, error) {
                errorCallback({
                    codigo: error.code,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: "Error al obtener la secuencia de documentos de tipo " + TIpoDeDocumento.PagoDeFacturaVencida + " debido a: " + error.message
                });
            });
        }, function (error) {
            errorCallback({
                codigo: error.code,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: "Error al obtener la secuencia de documentos de tipo " + TIpoDeDocumento.PagoDeFacturaVencida + " debido a: " + error.message
            });
        });
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoSqlDeInsercionDeTipoDePago = function (tipoDePago) {
        var sql = [];
        sql.push("INSERT INTO OVERDUE_INVOICE_PAYMENT_TYPE_DETAIL(");
        sql.push(" [PAYMENT_TYPE],[FRONT_IMAGE]");
        sql.push(" ,[BACK_IMAGE],[DOCUMENT_NUMBER],[BANK_ACCOUNT],[BANK_NAME]");
        sql.push(" ,[AMOUNT],[DOC_SERIE],[DOC_NUM])");
        sql.push(" VALUES(");
        sql.push(" '" + tipoDePago.paymentType + "'");
        sql.push(" ,'" + tipoDePago.frontImage + "'");
        sql.push(" ,'" + tipoDePago.backImage + "'");
        sql.push(" ,'" + tipoDePago.documentNumber + "'");
        sql.push(" ,'" + tipoDePago.bankAccount + "'");
        sql.push(" ,'" + tipoDePago.bankName + "'");
        sql.push(" ," + tipoDePago.amount);
        sql.push(" ,'" + tipoDePago.docSerie + "'");
        sql.push(" ," + tipoDePago.docNum);
        sql.push(" )");
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerDetalleDeTiposDePagoDeDocumentosDePagoNoPosteadosEnElServidor = function (documentosDePagoNoPosteadosEnElServidor, posicionActualDeDocumentoProcesado, callback, transaccionActual) {
        var _this = this;
        if (documentosDePagoNoPosteadosEnElServidor.length >
            posicionActualDeDocumentoProcesado) {
            var sql = [];
            sql.push("SELECT");
            sql.push(" [PAYMENT_TYPE],[FRONT_IMAGE]");
            sql.push(" ,[BACK_IMAGE],[DOCUMENT_NUMBER],[BANK_ACCOUNT],[BANK_NAME]");
            sql.push(" ,[AMOUNT],[DOC_SERIE],[DOC_NUM]");
            sql.push(" FROM OVERDUE_INVOICE_PAYMENT_TYPE_DETAIL");
            sql.push(" WHERE DOC_SERIE = '" + documentosDePagoNoPosteadosEnElServidor[posicionActualDeDocumentoProcesado].docSerie + "'");
            sql.push(" AND DOC_NUM = " + documentosDePagoNoPosteadosEnElServidor[posicionActualDeDocumentoProcesado].docNum);
            transaccionActual.executeSql(sql.join(""), [], function (transResult, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var detalleTemporal = results.rows.item(i);
                    var detalle = new TipoDePagoEnFacturaVencida();
                    detalle.paymentType = detalleTemporal.PAYMENT_TYPE;
                    detalle.frontImage = detalleTemporal.FRONT_IMAGE;
                    detalle.backImage = detalleTemporal.BACK_IMAGE;
                    detalle.documentNumber = detalleTemporal.DOCUMENT_NUMBER;
                    detalle.bankAccount = detalleTemporal.BANK_ACCOUNT;
                    detalle.bankName = detalleTemporal.BANK_NAME;
                    detalle.amount = detalleTemporal.AMOUNT;
                    detalle.docSerie = detalleTemporal.DOC_SERIE;
                    detalle.docNum = detalleTemporal.DOC_NUM;
                    documentosDePagoNoPosteadosEnElServidor[posicionActualDeDocumentoProcesado].overdueInvoicePaymentTypeDetail.push(detalle);
                }
                _this.obtenerDetalleDeTiposDePagoDeDocumentosDePagoNoPosteadosEnElServidor(documentosDePagoNoPosteadosEnElServidor, posicionActualDeDocumentoProcesado + 1, callback, transResult);
            }, function (transResult, error) {
                console.log("Error al obtener el detalle de los tipos de pago, para los documentos de pago de facturas vencidas no posteados debido a: '" + error.message + "'");
            });
        }
        else {
            callback(documentosDePagoNoPosteadosEnElServidor);
        }
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoDeActualizacionDePosteoDeDetalleDeTipoDePagoDeDocumentoDePago = function (documentoPosteado) {
        var sql = [];
        sql.push("UPDATE OVERDUE_INVOICE_PAYMENT_TYPE_DETAIL SET PAYMENT_HEADER_ID = " + documentoPosteado.PAYMENT_ID_BO + " ");
        sql.push(" WHERE DOC_SERIE = '" + documentoPosteado.DOC_SERIE + "' AND DOC_NUM = " + documentoPosteado.DOC_NUM);
        return sql.join("");
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerEncabezadoDeDocumentosDePagoParaReporte = function (callback, errorCallbak) {
        var _this = this;
        var documentosDePago = [];
        SONDA_DB_Session.transaction(function (trans) {
            var sql = [];
            sql.push("SELECT OIPH.CODE_CUSTOMER");
            sql.push(" , OIPH.DOC_SERIE");
            sql.push(" , OIPH.DOC_NUM");
            sql.push(" , OIPH.PAYMENT_AMOUNT");
            sql.push(" , OIPH.COMMENT");
            sql.push(" , (SELECT C.CLIENT_NAME FROM CLIENTS AS C WHERE C.CLIENT_ID = OIPH.CODE_CUSTOMER LIMIT 1) AS NAME_CUSTOMER");
            sql.push(" FROM OVERDUE_INVOICE_PAYMENT_HEADER AS OIPH ORDER BY OIPH.DOC_NUM ASC");
            trans.executeSql(sql.join(""), [], function (transResult, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var pagoTemp = results.rows.item(i);
                    var pago = new PagoDeFacturaVencidaEncabezado();
                    pago.docNum = pagoTemp.DOC_NUM;
                    pago.docSerie = pagoTemp.DOC_SERIE;
                    pago.codeCustomer = pagoTemp.CODE_CUSTOMER;
                    pago.nameCustomer = pagoTemp.NAME_CUSTOMER;
                    pago.paymentAmount = pagoTemp.PAYMENT_AMOUNT;
                    pago.paidComment = pagoTemp.COMMENT;
                    documentosDePago.push(pago);
                }
                _this.obtenerDetalleDeDocumentosDePagoParaReporte(documentosDePago, 0, function (documentosDePagoConDetalle, transaccion) {
                    _this.obtenerDetalleDeTiposDePagoDeDocumentosDePagoParaReporte(documentosDePagoConDetalle, 0, callback, errorCallbak, transaccion);
                }, errorCallbak, transResult);
            }, function (transResult, error) {
                errorCallbak({
                    codigo: error.code,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: "Ha ocurrido un error al obtener los documentos de pago, por favor, vuelva a intentar."
                });
            });
        }, function (error) {
            errorCallbak({
                codigo: error.code,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: "Ha ocurrido un error al obtener los documentos de pago, por favor, vuelva a intentar."
            });
        });
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerDetalleDeDocumentosDePagoParaReporte = function (documentosDePago, posicionActualDeDocumentoProcesado, callback, errorCallback, transaccionActual) {
        var _this = this;
        if (documentosDePago.length > posicionActualDeDocumentoProcesado) {
            var sql = [];
            sql.push("SELECT OIPD.INVOICE_ID");
            sql.push(" , OIPD.DOC_ENTRY");
            sql.push(" , OIPD.DOC_SERIE");
            sql.push(" , OIPD.DOC_NUM");
            sql.push(" , OIPD.PAYED_AMOUNT");
            sql.push(" , (SELECT datetime(OIC.CREATED_DATE)) as CREATED_DATE");
            sql.push(" , (SELECT datetime(OIC.DUE_DATE)) as DUE_DATE");
            sql.push(" , OIC.PENDING_TO_PAID");
            sql.push(" FROM OVERDUE_INVOICE_PAYMENT_DETAIL OIPD");
            sql.push(" INNER JOIN OVERDUE_INVOICE_BY_CUSTOMER OIC ON(OIC.INVOICE_ID = OIPD.INVOICE_ID AND OIC.DOC_ENTRY = OIPD.DOC_ENTRY)");
            sql.push(" WHERE OIPD.DOC_SERIE = '" + documentosDePago[posicionActualDeDocumentoProcesado].docSerie + "'");
            sql.push(" AND OIPD.DOC_NUM = " + documentosDePago[posicionActualDeDocumentoProcesado].docNum);
            transaccionActual.executeSql(sql.join(""), [], function (transResult, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var detalleTemporal = results.rows.item(i);
                    var detalle = new PagoDeFacturaVencidaDetalle();
                    detalle.invoiceId = detalleTemporal.INVOICE_ID;
                    detalle.docEntry = detalleTemporal.DOC_ENTRY;
                    detalle.docSerie = detalleTemporal.DOC_SERIE;
                    detalle.docNum = detalleTemporal.DOC_NUM;
                    detalle.payedAmount = detalleTemporal.PAYED_AMOUNT;
                    detalle.createdDate = detalleTemporal.CREATED_DATE;
                    detalle.dueDate = detalleTemporal.DUE_DATE;
                    detalle.pendingToPaid = detalleTemporal.PENDING_TO_PAID;
                    documentosDePago[posicionActualDeDocumentoProcesado].overdueInvoicePaymentDetail.push(detalle);
                }
                _this.obtenerDetalleDeDocumentosDePagoParaReporte(documentosDePago, posicionActualDeDocumentoProcesado + 1, callback, errorCallback, transResult);
            }, function (transResult, error) {
                console.log("Error al obtener el detalle de los documentos de pago debido a: '" + error.message + "'");
                errorCallback({
                    codigo: error.code,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: "Ha ocurrido un error al obtener el detalle de los documentos de pago, por favor, vuelva a intentar."
                });
            });
        }
        else {
            callback(documentosDePago, transaccionActual);
        }
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerDetalleDeTiposDePagoDeDocumentosDePagoParaReporte = function (documentosDePago, posicionActualDeDocumentoProcesado, callback, errorCallback, transaccionActual) {
        var _this = this;
        if (documentosDePago.length > posicionActualDeDocumentoProcesado) {
            var sql = [];
            sql.push("SELECT");
            sql.push(" [PAYMENT_TYPE],[FRONT_IMAGE]");
            sql.push(" ,[BACK_IMAGE],[DOCUMENT_NUMBER],[BANK_ACCOUNT],[BANK_NAME]");
            sql.push(" ,[AMOUNT],[DOC_SERIE],[DOC_NUM]");
            sql.push(" FROM OVERDUE_INVOICE_PAYMENT_TYPE_DETAIL");
            sql.push(" WHERE DOC_SERIE = '" + documentosDePago[posicionActualDeDocumentoProcesado].docSerie + "'");
            sql.push(" AND DOC_NUM = " + documentosDePago[posicionActualDeDocumentoProcesado].docNum);
            transaccionActual.executeSql(sql.join(""), [], function (transResult, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var detalleTemporal = results.rows.item(i);
                    var detalle = new TipoDePagoEnFacturaVencida();
                    detalle.paymentType = detalleTemporal.PAYMENT_TYPE;
                    detalle.frontImage = detalleTemporal.FRONT_IMAGE;
                    detalle.backImage = detalleTemporal.BACK_IMAGE;
                    detalle.documentNumber = detalleTemporal.DOCUMENT_NUMBER;
                    detalle.bankAccount = detalleTemporal.BANK_ACCOUNT;
                    detalle.bankName = detalleTemporal.BANK_NAME;
                    detalle.amount = detalleTemporal.AMOUNT;
                    detalle.docSerie = detalleTemporal.DOC_SERIE;
                    detalle.docNum = detalleTemporal.DOC_NUM;
                    documentosDePago[posicionActualDeDocumentoProcesado].overdueInvoicePaymentTypeDetail.push(detalle);
                }
                _this.obtenerDetalleDeTiposDePagoDeDocumentosDePagoParaReporte(documentosDePago, posicionActualDeDocumentoProcesado + 1, callback, errorCallback, transResult);
            }, function (transResult, error) {
                console.log("Error al obtener el detalle de los documentos de pago debido a: '" + error.message + "'");
                errorCallback({
                    codigo: error.code,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: "Ha ocurrido un error al obtener el detalle de los documentos de pago, por favor, vuelva a intentar."
                });
            });
        }
        else {
            callback(documentosDePago);
        }
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerInformacionDeSecuenciaDeDocumentoDePago = function (callback, errorCallback) {
        var sql = [];
        sql.push("SELECT SERIE, CURRENT_DOC, BRANCH_NAME, BRANCH_ADDRESS ");
        sql.push(" FROM DOCUMENT_SEQUENCE WHERE DOC_TYPE = '" + TIpoDeDocumento.PagoDeFacturaVencida + "'");
        SONDA_DB_Session.transaction(function (trans) {
            trans.executeSql(sql.join(""), [], function (transResult, results) {
                if (results.rows.length > 0) {
                    var secuencia = {
                        serie: results.rows.item(0).SERIE,
                        numero: results.rows.item(0).CURRENT_DOC,
                        nombreSucursal: results.rows.item(0).BRANCH_NAME,
                        direccionSucursal: results.rows.item(0).BRANCH_ADDRESS
                    };
                    callback(secuencia);
                }
                else {
                    errorCallback({
                        codigo: -1,
                        resultado: ResultadoOperacionTipo.Error,
                        mensaje: "Operador no cuenta con secuencia de documentos de tipo " + TIpoDeDocumento.PagoDeFacturaVencida + ", por favor contacte a su administrador."
                    });
                }
            }, function (transResult, error) {
                errorCallback({
                    codigo: error.code,
                    resultado: ResultadoOperacionTipo.Error,
                    mensaje: "Error al obtener la secuencia de documentos de tipo " + TIpoDeDocumento.PagoDeFacturaVencida + " debido a: " + error.message
                });
            });
        }, function (error) {
            errorCallback({
                codigo: error.code,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: "Error al obtener la secuencia de documentos de tipo " + TIpoDeDocumento.PagoDeFacturaVencida + " debido a: " + error.message
            });
        });
    };
    PagoDeFacturaVencidaServicio.prototype.obtenerFormatoDeActualizacionDeBalanceDeCliente = function (pago) {
        var formato = [];
        formato.push("UPDATE CLIENTS SET OUTSTANDING_BALANCE = OUTSTANDING_BALANCE + " + pago.paymentAmount + ", PREVIUS_BALANCE = PREVIUS_BALANCE - " + pago.paymentAmount);
        formato.push("WHERE CLIENT_ID = '" + pago.codeCustomer + "'");
        return formato.join(" ");
    };
    return PagoDeFacturaVencidaServicio;
}());
//# sourceMappingURL=PagoDeFacturaVencidaServicio.js.map