var ClienteServicio = (function () {
    function ClienteServicio() {
        this.tareaServicio = new TareaServcio();
    }
    ClienteServicio.prototype.obtenerCliente = function (cliente, configuracionDecimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " C.CLIENT_ID";
            sql += " ,C.CLIENT_NAME";
            sql += " ,C.CLIENT_TAX_ID";
            sql += " ,C.INVOICE_NAME";
            sql += " ,C.NIT";
            sql += " ,C.ADDRESS";
            sql += " ,C.PHONE";
            sql += " ,C.CLIENT_HH_ID_OLD";
            sql += " ,C.CONTACT_CUSTOMER";
            sql += " ,C.GPS";
            sql += " ,C.REFERENCE";
            sql += " ,C.DISCOUNT";
            sql += " ,C.RGA_CODE";
            sql += " ,C.BONUS_LIST_ID";
            sql += " ,C.DISCOUNT_LIST_ID";
            sql += " ,C.PRICE_LIST_ID";
            sql += " ,C.SALES_BY_MULTIPLE_LIST_ID";
            sql += " ,C.NEW";
            sql += " ,C.PREVIUS_BALANCE";
            sql += " ,C.LAST_PURCHASE";
            sql += " ,C.LAST_PURCHASE_DATE";
            sql += " ,C.SPECIAL_PRICE_LIST_ID";
            sql += " ,C.CODE_CHANNEL";
            sql += " ,C.OUTSTANDING_BALANCE";
            sql += " ,C.DFPT_LIST_ID";
            sql += " FROM CLIENTS C";
            sql += " WHERE C.CLIENT_ID = '" + cliente.clientId + "' ";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var clienteTemp = results.rows.item(0);
                    var clienteRespuesta = {
                        clientId: clienteTemp.CLIENT_ID,
                        clientName: clienteTemp.CLIENT_NAME,
                        clientTaxId: clienteTemp.CLIENT_TAX_ID,
                        invoiceTaxId: clienteTemp.NIT,
                        invoiceName: clienteTemp.INVOICE_NAME,
                        address: clienteTemp.ADDRESS,
                        phone: clienteTemp.PHONE,
                        clientHhIdOld: clienteTemp.CLIENT_HH_ID_OLD,
                        contactCustomer: clienteTemp.CONTACT_CUSTOMER,
                        gps: clienteTemp.GPS,
                        discountMax: trunc_number(clienteTemp.DISCOUNT, configuracionDecimales.defaultCalculationsDecimals),
                        discount: trunc_number(0, configuracionDecimales.defaultCalculationsDecimals),
                        appliedDiscount: trunc_number(0, configuracionDecimales.defaultCalculationsDecimals),
                        totalAmout: trunc_number(0, configuracionDecimales.defaultCalculationsDecimals),
                        cuentaCorriente: new CuentaCorriente(),
                        deliveryDate: new Date(),
                        skus: "",
                        rgaCode: clienteTemp.RGA_CODE,
                        bonusListId: clienteTemp.BONUS_LIST_ID,
                        discountListId: clienteTemp.DISCOUNT_LIST_ID,
                        priceListId: clienteTemp.PRICE_LIST_ID,
                        salesByMultipleListId: clienteTemp.SALES_BY_MULTIPLE_LIST_ID,
                        isNew: clienteTemp.NEW === "1" || clienteTemp.NEW === 1 ? true : false,
                        previousBalance: clienteTemp.PREVIUS_BALANCE,
                        lastPurchase: clienteTemp.LAST_PURCHASE,
                        bonoPorCombos: new Array(),
                        spcialPriceListId: clienteTemp.SPECIAL_PRICE_LIST_ID,
                        channel: clienteTemp.CODE_CHANNEL,
                        lastPurchaseDate: clienteTemp.LAST_PURCHASE_DATE
                            ? clienteTemp.LAST_PURCHASE_DATE.split("T")[0]
                            : null,
                        outStandingBalance: clienteTemp.OUTSTANDING_BALANCE,
                        discountByFamilyAndPaymentTypeListId: clienteTemp.DFPT_LIST_ID
                    };
                    callback(clienteRespuesta);
                }
                else {
                    callbackError({
                        codigo: -1,
                        mensaje: "Error al obtener el cliente: No se puede encontrar el cliente"
                    });
                }
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener el Cliente: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerListaDePrecioPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " P.CODE_PRICE_LIST";
            sql += " FROM PRICE_LIST_BY_CUSTOMER P";
            sql += " WHERE P.CODE_CUSTOMER = '" + cliente.clientId + "'";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var clienteTemp = results.rows.item(0);
                    cliente.priceListId = clienteTemp.CODE_PRICE_LIST;
                    callback(cliente);
                }
                else {
                    cliente.priceListId = localStorage.getItem("gDefaultPriceList");
                    callback(cliente);
                }
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "No se pudo obtener la Lista de Precios del Cliente debido al siguiente error: " +
                    err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerCuentaCorriente = function (cliente, configuracionDecimales, callback, callbackError) {
        var _this = this;
        try {
            var configuracion_1 = configuracionDecimales;
            this.obtenerSiTieneFacturasVenciadas(cliente, function (cliente) {
                _this.obtenerLimiteDeCredito(cliente, configuracion_1, function (cliente) {
                    _this.obtenerSiTieneDiasDeCreditoVencidos(cliente, function (cliente) {
                        _this.obtenerSaldoActual(cliente, configuracion_1, function (cliente) {
                            _this.obtenerSaldoDeFacturas(cliente, configuracion_1, function (cliente) {
                                _this.obtenerSaldoDeOrdenesDeVenta(cliente, configuracion_1, function (cliente) {
                                    callback(cliente);
                                }, function (reultado) {
                                    callbackError(reultado);
                                });
                            }, function (reultado) {
                                callbackError(reultado);
                            });
                        }, function (reultado) {
                            callbackError(reultado);
                        });
                    }, function (reultado) {
                        callbackError(reultado);
                    });
                }, function (reultado) {
                    callbackError(reultado);
                });
            }, function (reultado) {
                callbackError(reultado);
            });
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener el cuenta corriente: " + err.message
            });
        }
    };
    ClienteServicio.prototype.obtenerSiTieneFacturasVenciadas = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " I.DOC_DUE_DATE";
            sql += " FROM INVOICE_HEADER I";
            sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
            sql += " AND I.IS_POSTED = 3";
            sql += " AND I.DOC_DUE_DATE <= DATE()";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    cliente.cuentaCorriente.facturasVencidas = true;
                }
                else {
                    cliente.cuentaCorriente.facturasVencidas = false;
                }
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener facturas vencidas: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerLimiteDeCredito = function (cliente, configuracionDecimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " C.CREDIT_LIMIT";
            sql += " ,C.EXTRADAYS";
            sql += " FROM CLIENTS C";
            sql += " WHERE C.CLIENT_ID = '" + cliente.clientId + "'";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var clienteTemp = results.rows.item(0);
                    cliente.cuentaCorriente.limiteDeCredito = trunc_number(clienteTemp.CREDIT_LIMIT, configuracionDecimales.defaultCalculationsDecimals);
                    cliente.cuentaCorriente.diasCredito = clienteTemp.EXTRADAYS;
                }
                else {
                    cliente.cuentaCorriente.limiteDeCredito = trunc_number(0, configuracionDecimales.defaultCalculationsDecimals);
                    cliente.cuentaCorriente.diasCredito = 0;
                }
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener limite de credito y dias credito: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerSiTieneDiasDeCreditoVencidos = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " I.POSTED_DATETIME";
            sql += " FROM INVOICE_HEADER I";
            sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
            sql += " AND I.IS_POSTED = 3";
            sql +=
                " AND date(I.POSTED_DATETIME, '+" +
                    cliente.cuentaCorriente.diasCredito +
                    " day') <= DATE()";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    cliente.cuentaCorriente.diasCreditoVencidos = true;
                }
                else {
                    cliente.cuentaCorriente.diasCreditoVencidos = false;
                }
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener dias de credito vencidos: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerSaldoActual = function (cliente, configuracionDecimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " IFNULL(SUM(I.TOTAL_AMOUNT),0) TOTAL_AMOUNT";
            sql += " FROM INVOICE_HEADER I";
            sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
            sql += " AND IS_POSTED = 3";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    var clienteTemp = results.rows.item(0);
                    cliente.cuentaCorriente.saldoActual += trunc_number(clienteTemp.TOTAL_AMOUNT, configuracionDecimales.defaultCalculationsDecimals);
                }
                else {
                    cliente.cuentaCorriente.saldoActual += trunc_number(0, configuracionDecimales.defaultCalculationsDecimals);
                }
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener facturas vencidas: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerSaldoDeFacturas = function (cliente, configuracionDecimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " IFNULL(SUM(I.TOTAL_AMOUNT),0) TOTAL_AMOUNT";
            sql += " FROM INVOICE_HEADER I";
            sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
            sql += " AND IS_POSTED != 3";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    var clienteTemp = results.rows.item(0);
                    cliente.cuentaCorriente.saldoActual += trunc_number(clienteTemp.TOTAL_AMOUNT, configuracionDecimales.defaultCalculationsDecimals);
                }
                else {
                    cliente.cuentaCorriente.saldoActual += trunc_number(0, configuracionDecimales.defaultCalculationsDecimals);
                }
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener facturas vencidas: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerSaldoDeOrdenesDeVenta = function (cliente, configuracionDecimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT ";
            sql += " IFNULL(SUM(H.TOTAL_AMOUNT),0) TOTAL_AMOUNT";
            sql += " FROM SALES_ORDER_HEADER H";
            sql += " WHERE H.CLIENT_ID = '" + cliente.clientId + "'";
            sql += " AND IS_DRAFT = 0";
            sql += " AND IS_VOID = 0";
            sql += " AND SALES_ORDER_TYPE = 'CREDIT'";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    var clienteTemp = results.rows.item(0);
                    cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta += trunc_number(clienteTemp.TOTAL_AMOUNT, configuracionDecimales.defaultCalculationsDecimals);
                }
                else {
                    cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta += trunc_number(0, configuracionDecimales.defaultCalculationsDecimals);
                }
                cliente.cuentaCorriente.saldoActual +=
                    cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta;
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener facturas vencidas: " + err.message
            });
        });
    };
    ClienteServicio.prototype.validarDatosGeneralesCuentaCorriente = function (cliente, callback, callbackError) {
        var _this = this;
        try {
            this.tareaServicio.obtenerRegla("NoValidarAntiguedadDeSaldos", function (reglas) {
                if (reglas.length > 0) {
                    if (reglas[0].enabled === "Si") {
                        callback(cliente);
                    }
                    else {
                        _this.validarAntiguedadDeSaldos(cliente, function (clienteN1) {
                            callback(clienteN1);
                        }, function (resultado) {
                            callbackError(resultado);
                        });
                    }
                }
                else {
                    _this.validarAntiguedadDeSaldos(cliente, function (clienteN1) {
                        callback(clienteN1);
                    }, function (resultado) {
                        callbackError(resultado);
                    });
                }
            }, function (reultado) {
                callbackError(reultado);
            });
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al validar cuenta corriente: " + err.message
            });
        }
    };
    ClienteServicio.prototype.validarAntiguedadDeSaldos = function (cliente, callback, callbackError) {
        try {
            if (cliente.cuentaCorriente.facturasVencidas) {
                callbackError({
                    codigo: -1,
                    mensaje: "Tiene facturas vencidas"
                });
            }
            else if (cliente.cuentaCorriente.limiteDeCredito <= 0) {
                callbackError({
                    codigo: -1,
                    mensaje: "El cliente no tiene configurado el límite de crédito"
                });
            }
            else if (cliente.cuentaCorriente.diasCredito <= 0) {
                callbackError({
                    codigo: -1,
                    mensaje: "El cliente no tiene configurado la cantidad de días de crédito"
                });
            }
            else if (cliente.cuentaCorriente.diasCreditoVencidos) {
                callbackError({
                    codigo: -1,
                    mensaje: "Tiene una factura emitida que ya vencieron los días de crédito"
                });
            }
            else {
                callback(cliente);
            }
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al validar cuenta corriente: " + err.message
            });
        }
    };
    ClienteServicio.prototype.validarCuentaCorriente = function (cliente, listasku, ordenDeVentaTipo, configuracionDecimales, callback, callbackError) {
        try {
            var totalSku = 0;
            for (var i = 0; i < listasku.length; i++) {
                var sku = listasku[i];
                totalSku += trunc_number(sku.qty * sku.cost, configuracionDecimales.defaultCalculationsDecimals);
            }
            if (ordenDeVentaTipo === OrdenDeVentaTipo.Contado) {
                callback(cliente);
            }
            else {
                if (trunc_number(cliente.cuentaCorriente.saldoActual + cliente.totalAmout + totalSku, configuracionDecimales.defaultCalculationsDecimals) <=
                    trunc_number(cliente.cuentaCorriente.limiteDeCredito, configuracionDecimales.defaultCalculationsDecimals)) {
                    my_dialog("", "", "closed");
                    callback(cliente);
                }
                else {
                    my_dialog("", "", "close");
                    callbackError({
                        codigo: -1,
                        mensaje: "El crédito es insuficiente"
                    });
                }
            }
        }
        catch (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al validar cuenta corriente: " + err.message
            });
        }
    };
    ClienteServicio.prototype.enviarSolicitudParaObtenerCuentaCorriente = function (socketIo, cliente, opcionValidarSaldoCliente, ordenDeVentaTipo, callback, callbackError) {
        try {
            var data = {
                Total: cliente.totalAmout +
                    cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta,
                CodeCustomer: cliente.clientId,
                sku: "",
                cantidad: 0,
                source: opcionValidarSaldoCliente,
                salesOrderType: ordenDeVentaTipo,
                dbuser: gdbuser,
                dbuserpass: gdbuserpass,
                routeid: gCurrentRoute
            };
            socketIo.emit("GetCurrentAccountByCustomer", data);
            callback(cliente);
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        }
    };
    ClienteServicio.prototype.obtenerTodosLosClientesAbordo = function (criterio, callback, callbackError) {
        try {
            var clientes = [];
            SONDA_DB_Session.transaction(function (tx) {
                var sql = "SELECT";
                sql += " C.CLIENT_ID";
                sql += " ,C.CLIENT_NAME";
                sql += " ,C.CLIENT_TAX_ID";
                sql += " ,C.ADDRESS";
                sql += " ,C.PHONE";
                sql += " ,C.CLIENT_HH_ID_OLD";
                sql += " ,C.CONTACT_CUSTOMER";
                sql += " ,C.GPS";
                sql += " ,C.REFERENCE";
                sql += " ,C.DISCOUNT";
                sql += " ,C.RGA_CODE";
                sql += " ,C.PRICE_LIST_ID";
                sql += " FROM CLIENTS C";
                sql +=
                    " WHERE C.CLIENT_ID NOT IN(SELECT RELATED_CLIENT_CODE FROM PRESALES_ROUTE) AND";
                sql +=
                    " (C.CLIENT_ID LIKE '" +
                        "%" +
                        criterio +
                        "%" +
                        "' OR C.CLIENT_NAME LIKE '" +
                        "%" +
                        criterio +
                        "%" +
                        "' OR C.ADDRESS LIKE '" +
                        "%" +
                        criterio +
                        "%" +
                        "' OR C.RGA_CODE = '" +
                        criterio +
                        "' )";
                tx.executeSql(sql, [], function (tx, results) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var clienteTemp = results.rows.item(i);
                        var clienteRespuesta = {
                            clientId: clienteTemp.CLIENT_ID,
                            clientName: clienteTemp.CLIENT_NAME,
                            clientTaxId: clienteTemp.CLIENT_TAX_ID,
                            address: clienteTemp.ADDRESS,
                            phone: clienteTemp.PHONE,
                            clientHhIdOld: clienteTemp.CLIENT_HH_ID_OLD,
                            contactCustomer: clienteTemp.CONTACT_CUSTOMER,
                            gps: clienteTemp.GPS,
                            discountMax: clienteTemp.DISCOUNT,
                            discount: 0,
                            appliedDiscount: 0,
                            totalAmout: 0,
                            cuentaCorriente: new CuentaCorriente(),
                            deliveryDate: new Date(),
                            skus: "",
                            rgaCode: clienteTemp.RGA_CODE,
                            priceListId: clienteTemp.PRICE_LIST_ID
                        };
                        clientes.push(clienteRespuesta);
                    }
                    callback(clientes);
                });
            }, function (err) {
                callbackError({
                    codigo: -1,
                    mensaje: "Error al obtener el Cliente: " + err.message
                });
            });
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        }
    };
    ClienteServicio.prototype.obtenerEtiquetas = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = " SELECT TC.*";
            sql += " ,T.TAG_VALUE_TEXT";
            sql += " ,T.TAG_PRIORITY";
            sql += " ,T.TAG_COMMENTS";
            sql += " FROM TAGS_X_CUSTOMER TC";
            sql += " INNER JOIN TAGS T ON (T.TAG_COLOR = TC.TAG_COLOR)";
            sql += " WHERE CUSTOMER = '" + cliente.clientId + "'";
            tx.executeSql(sql, [], function (tx, results) {
                var listaEtiquetas = [];
                for (var i = 0; i < results.rows.length; i++) {
                    var etiquetaSql = results.rows.item(i);
                    var etiqueta = {
                        tagColor: etiquetaSql.TAG_COLOR,
                        tagValueText: etiquetaSql.TAG_VALUE_TEXT,
                        tagPriority: etiquetaSql.TAG_PRIORITY,
                        tagComments: etiquetaSql.TAG_COMMENTS
                    };
                    listaEtiquetas.push(etiqueta);
                }
                cliente.etiquetas = listaEtiquetas;
                callback(cliente);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener etiquetas del Cliente: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtnerFormatoSqlDeInsertarClienteModificado = function (cliente, sequence) {
        var sql = "INSERT INTO CUSTOMER_CHANGE (CUSTOMER_CHANGE_ID,\n                CODE_CUSTOMER,\n                PHONE_CUSTOMER,\n                ADRESS_CUSTOMER,\n                CONTACT_CUSTOMER,\n                GPS,\n                POSTED_DATETIME,\n                POSTED_BY,\n                CODE_ROUTE,\n                IS_POSTED,\n                TAX_ID,\n                INVOICE_NAME,\n                CUSTOMER_NAME,\n                NEW_CUSTOMER_NAME,\n                DEVICE_NETWORK_TYPE,\n                IS_POSTED_OFFLINE)\n                VALUES('" + sequence + "'\n                ,'" + cliente.clientId + "'\n                ,'" + cliente.phone + "'\n                ,'" + cliente.address + "'\n                ,'" + cliente.contactCustomer + "'\n                ,'" + cliente.gps + "'\n                ,'" + getDateTime() + "'\n                ,'" + gLastLogin + "'\n                ,'" + gCurrentRoute + "'\n                ,0\n                ,'" + cliente.invoiceTaxId + "'\n                ,'" + cliente.invoiceName + "'\n                ,'" + cliente.clientName + "'\n                ,'" + cliente.clientNewName + "'\n                ,'" + tipoDeRedALaQueEstaConectadoElDispositivo + "'\n                ," + (gIsOnline === SiNo.Si ? 0 : 1) + ");";
        return sql;
    };
    ClienteServicio.prototype.obtnerFormatoSqlDeInsertarEtiquetaDeClienteModificado = function (cliente, etiqueta, sequence) {
        var sql = "INSERT INTO TAG_X_CUSTOMER_CHANGE (\n                CUSTOMER_CHANGE_ID,\n                TAG_COLOR,\n                CODE_CUSTOMER,\n                DEVICE_NETWORK_TYPE,\n                IS_POSTED_OFFLINE)\n                VALUES(\n                '" + sequence + "'\n                ,'" + etiqueta.tagColor + "'\n                ,'" + cliente.clientId + "'\n                ,'" + tipoDeRedALaQueEstaConectadoElDispositivo + "'\n                ," + (gIsOnline === SiNo.Si ? 0 : 1) + ");";
        return sql;
    };
    ClienteServicio.prototype.guardarCambiosDeCliente = function (cliente, callback, callbackError) {
        this.obtenerSecuenciaDeCambios(this, function (sequence, controlador) {
            SONDA_DB_Session.transaction(function (tx) {
                var sql = controlador.obtnerFormatoSqlDeInsertarClienteModificado(cliente, sequence);
                tx.executeSql(sql);
                for (var i = 0; i < cliente.etiquetas.length; i++) {
                    sql = controlador.obtnerFormatoSqlDeInsertarEtiquetaDeClienteModificado(cliente, cliente.etiquetas[i], sequence);
                    tx.executeSql(sql);
                }
                callback(cliente);
            }, function (err) {
                callbackError({
                    codigo: -1,
                    mensaje: "Error al insertar el los cambios del cliente: " + err.message
                });
            });
        });
    };
    ClienteServicio.prototype.obtenerSecuenciaDeCambios = function (controlador, callback) {
        try {
            GetNexSequence("CUSTOMER_CHANGE", function (sequence) {
                callback(sequence, controlador);
            }, function (err) {
                notify("Error al obtener sequencia de cambios: " + err.message);
            });
        }
        catch (err) {
            notify("Error al obtener secuencia de cambios: " + err.message);
        }
    };
    ClienteServicio.prototype.obtenerEtiquetasNoAsociadasAlCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = " SELECT T.TAG_COLOR";
            sql += " ,T.TAG_VALUE_TEXT";
            sql += " ,T.TAG_PRIORITY";
            sql += " ,T.TAG_COMMENTS";
            sql += " FROM TAGS T";
            sql +=
                " LEFT JOIN TAGS_X_CUSTOMER TC ON (T.TAG_COLOR = TC.TAG_COLOR) AND CUSTOMER = '" +
                    cliente.clientId +
                    "'";
            sql += " WHERE CUSTOMER IS NULL";
            tx.executeSql(sql, [], function (tx, results) {
                var listaEtiquetas = [];
                for (var i = 0; i < results.rows.length; i++) {
                    var etiquetaSql = results.rows.item(i);
                    var etiqueta = {
                        tagColor: etiquetaSql.TAG_COLOR,
                        tagValueText: etiquetaSql.TAG_VALUE_TEXT,
                        tagPriority: etiquetaSql.TAG_PRIORITY,
                        tagComments: etiquetaSql.TAG_COMMENTS
                    };
                    listaEtiquetas.push(etiqueta);
                }
                callback(listaEtiquetas);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener etiquetas no asociadas al cliente: " + err.message
            });
        });
    };
    ClienteServicio.prototype.obtenerClienteBo = function (cliente, callback, callbackError) {
        try {
            SONDA_DB_Session.transaction(function (tx) {
                var sql = "SELECT";
                sql += " C.CLIENT_ID";
                sql += " FROM CLIENTS C";
                sql += " WHERE C.CLIENT_HH_ID_OLD = '" + cliente.clientHhIdOld + "'";
                sql += " OR C.CLIENT_ID = '" + cliente.clientHhIdOld + "'";
                tx.executeSql(sql, [], function (tx, results) {
                    if (results.rows.length > 0) {
                        var clienteTemp = results.rows.item(0);
                        cliente.clientId = clienteTemp.CLIENT_ID;
                    }
                    else {
                        callbackError({
                            codigo: -1,
                            mensaje: "Error al obtener el codigo de cliente: Sin resultados"
                        });
                    }
                    callback(cliente);
                });
            }, function (err) {
                callbackError({
                    codigo: -1,
                    mensaje: "Error al obtener el codigo de cliente: " + err.message
                });
            });
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        }
    };
    return ClienteServicio;
}());
//# sourceMappingURL=ClienteServicio.js.map