var DescuentoServicio = (function () {
    function DescuentoServicio() {
    }
    DescuentoServicio.prototype.obtenerDescuentosPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DLS.DISCOUNT_LIST_ID";
            sql += " ,DLS.CODE_SKU";
            sql += " ,DLS.DISCOUNT";
            sql += " FROM DISCOUNT_LIST_BY_SKU DLS";
            sql += " WHERE DLS.DISCOUNT_LIST_ID = " + cliente.discountListId;
            tx.executeSql(sql, [], function (tx, results) {
                var listaDeDescuentos = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new Descuento();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.codeSku = descuentoSql.CODE_SKU;
                    descuento.discount = descuentoSql.DISCOUNT;
                    listaDeDescuentos.push(descuento);
                }
                callback(listaDeDescuentos);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos: " + err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerDescuentosPorClienteSku = function (cliente, sku, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaDeEjecucion = [];
            listaDeEjecucion.push("SELECT");
            listaDeEjecucion.push(" DLS.DISCOUNT_LIST_ID");
            listaDeEjecucion.push(" ,DLS.CODE_SKU");
            listaDeEjecucion.push(" ,DLS.PACK_UNIT");
            listaDeEjecucion.push(" ,DLS.LOW_LIMIT");
            listaDeEjecucion.push(" ,DLS.HIGH_LIMIT");
            listaDeEjecucion.push(" ,DLS.DISCOUNT");
            listaDeEjecucion.push(" ,PU.CODE_PACK_UNIT");
            listaDeEjecucion.push(" ,DLS.DISCOUNT_TYPE");
            listaDeEjecucion.push(" ,DLS.PROMO_ID");
            listaDeEjecucion.push(" ,DLS.PROMO_NAME");
            listaDeEjecucion.push(" ,DLS.PROMO_TYPE");
            listaDeEjecucion.push(" ,DLS.FREQUENCY");
            listaDeEjecucion.push(" ,DLS.IS_UNIQUE");
            listaDeEjecucion.push(" FROM DISCOUNT_LIST_BY_SKU DLS");
            listaDeEjecucion.push(" INNER JOIN PACK_UNIT PU ON DLS.PACK_UNIT = PU.PACK_UNIT");
            listaDeEjecucion.push(" WHERE DLS.DISCOUNT_LIST_ID = " + cliente.discountListId);
            listaDeEjecucion.push(" AND DLS.CODE_SKU = '" + sku.sku + "'");
            tx.executeSql(listaDeEjecucion.join(""), [], function (tx, results) {
                var listaDeDescuentos = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorEscalaSku();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.codeSku = descuentoSql.CODE_SKU;
                    descuento.codePackUnit = descuentoSql.CODE_PACK_UNIT;
                    descuento.packUnit = descuentoSql.PACK_UNIT;
                    descuento.lowLimit = descuentoSql.LOW_LIMIT;
                    descuento.highLimit = descuentoSql.HIGH_LIMIT;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.isUnique = descuentoSql.IS_UNIQUE === 1;
                    listaDeDescuentos.push(descuento);
                    descuento = null;
                    descuentoSql = null;
                }
                callback(listaDeDescuentos);
                listaDeDescuentos = null;
            });
            listaDeEjecucion = null;
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos: " + err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerDescuentoPorMontoGeneral = function (cliente, total, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DLGA.DISCOUNT_LIST_ID";
            sql += " ,DLGA.LOW_AMOUNT";
            sql += " ,DLGA.HIGH_AMOUNT";
            sql += " ,DLGA.DISCOUNT";
            sql += " ,DLGA.PROMO_ID";
            sql += " ,DLGA.PROMO_NAME";
            sql += " ,DLGA.PROMO_TYPE";
            sql += " ,DLGA.FREQUENCY";
            sql += " FROM DISCOUNT_LIST_BY_GENERAL_AMOUNT DLGA";
            sql += " WHERE DLGA.DISCOUNT_LIST_ID = " + cliente.discountListId;
            sql +=
                " AND " + total + " BETWEEN DLGA.LOW_AMOUNT AND DLGA.HIGH_AMOUNT";
            tx.executeSql(sql, [], function (tx, results) {
                var descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorMontoGeneral();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.lowAmount = descuentoSql.LOW_AMOUNT;
                    descuento.highAmount = descuentoSql.HIGH_AMOUNT;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    descuentoPorMontoGeneral = descuento;
                }
                callback(descuentoPorMontoGeneral);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos por monto general: " + err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerDescuentoPorMontoGeneralYFamilia = function (cliente, sku, total, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DGF.DISCOUNT_LIST_ID";
            sql += " ,DGF.CODE_FAMILY";
            sql += " ,DGF.LOW_AMOUNT";
            sql += " ,DGF.HIGH_AMOUNT";
            sql += " ,DGF.DISCOUNT_TYPE";
            sql += " ,DGF.DISCOUNT";
            sql += " ,DGF.PROMO_ID";
            sql += " ,DGF.PROMO_NAME";
            sql += " ,DGF.PROMO_TYPE";
            sql += " ,DGF.FREQUENCY";
            sql += " FROM DISCOUNT_LIST_BY_GENERAL_AMOUNT_AND_FAMILY DGF";
            sql += " WHERE DGF.DISCOUNT_LIST_ID = " + cliente.discountListId;
            sql += " AND " + total + " BETWEEN DGF.LOW_AMOUNT AND DGF.HIGH_AMOUNT";
            sql += " AND DGF.CODE_FAMILY = '" + sku.codeFamilySku + "'";
            tx.executeSql(sql, [], function (tx, results) {
                var descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorMontoGeneralYFamilia();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.codeFamily = descuentoSql.CODE_FAMILY;
                    descuento.lowAmount = descuentoSql.LOW_AMOUNT;
                    descuento.highAmount = descuentoSql.HIGH_AMOUNT;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    descuentoPorMontoGeneralYFamilia = descuento;
                }
                callback(descuentoPorMontoGeneralYFamilia);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos por monto general y familia: " +
                    err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerListaDeDescuentoPorMontoGeneralYFamilia = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DGF.DISCOUNT_LIST_ID";
            sql += " ,DGF.CODE_FAMILY";
            sql += " ,FS.DESCRIPTION_FAMILY_SKU";
            sql += " ,DGF.LOW_AMOUNT";
            sql += " ,DGF.HIGH_AMOUNT";
            sql += " ,DGF.DISCOUNT_TYPE";
            sql += " ,DGF.DISCOUNT";
            sql += " ,DGF.PROMO_ID";
            sql += " ,DGF.PROMO_NAME";
            sql += " ,DGF.PROMO_TYPE";
            sql += " ,DGF.FREQUENCY";
            sql += " FROM DISCOUNT_LIST_BY_GENERAL_AMOUNT_AND_FAMILY DGF";
            sql +=
                " INNER JOIN FAMILY_SKU FS ON (FS.CODE_FAMILY_SKU = DGF.CODE_FAMILY)";
            sql += " WHERE DGF.DISCOUNT_LIST_ID = " + cliente.discountListId;
            tx.executeSql(sql, [], function (tx, results) {
                var listaDeDescuentoPorMontoGeneralYFamilia = [];
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorMontoGeneralYFamilia();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.codeFamily = descuentoSql.CODE_FAMILY;
                    descuento.descriptionFamilySku =
                        descuentoSql.DESCRIPTION_FAMILY_SKU;
                    descuento.lowAmount = descuentoSql.LOW_AMOUNT;
                    descuento.highAmount = descuentoSql.HIGH_AMOUNT;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    listaDeDescuentoPorMontoGeneralYFamilia.push(descuento);
                }
                callback(listaDeDescuentoPorMontoGeneralYFamilia);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener el listado de descuentos por monto general y familia: " +
                    err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerDescuentoPorFamiliaYTipoPago = function (cliente, tarea, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DFP.DISCOUNT_LIST_ID";
            sql += " ,DFP.PAYMENT_TYPE";
            sql += " ,DFP.CODE_FAMILY";
            sql += " ,DFP.DISCOUNT_TYPE";
            sql += " ,DFP.DISCOUNT";
            sql += " ,DFP.PROMO_ID";
            sql += " ,DFP.PROMO_NAME";
            sql += " ,DFP.PROMO_TYPE";
            sql += " ,DFP.FREQUENCY";
            sql += " FROM DISCOUNT_LIST_BY_FAMILY_AND_PAYMENT_TYPE DFP";
            sql += " WHERE DFP.DISCOUNT_LIST_ID = " + cliente.discountByFamilyAndPaymentTypeListId;
            sql += " AND DFP.PAYMENT_TYPE = '" + gSalesOrderType + "'";
            tx.executeSql(sql, [], function (tx, results) {
                var listaDescuentoPorFamiliaYTipoPago = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorFamiliaYTipoPago();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.paymentType = descuentoSql.PAYMENT_TYPE;
                    descuento.codeFamily = descuentoSql.CODE_FAMILY;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    listaDescuentoPorFamiliaYTipoPago.push(descuento);
                }
                callback(listaDescuentoPorFamiliaYTipoPago);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos por familia y tipo pago: " +
                    err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerUnDescuentoPorFamiliaYTipoPago = function (cliente, tarea, sku, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DFP.DISCOUNT_LIST_ID";
            sql += " ,DFP.PAYMENT_TYPE";
            sql += " ,DFP.CODE_FAMILY";
            sql += " ,DFP.DISCOUNT_TYPE";
            sql += " ,DFP.DISCOUNT";
            sql += " ,DFP.PROMO_ID";
            sql += " ,DFP.PROMO_NAME";
            sql += " ,DFP.PROMO_TYPE";
            sql += " ,DFP.FREQUENCY";
            sql += " FROM DISCOUNT_LIST_BY_FAMILY_AND_PAYMENT_TYPE DFP";
            sql += " WHERE DFP.DISCOUNT_LIST_ID = " + cliente.discountListId;
            sql += " AND DFP.PAYMENT_TYPE = '" + gSalesOrderType + "'";
            sql += " AND DFP.CODE_FAMILY = '" + sku.codeFamilySku + "'";
            tx.executeSql(sql, [], function (tx, results) {
                var descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorFamiliaYTipoPago();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.paymentType = descuentoSql.PAYMENT_TYPE;
                    descuento.codeFamily = descuentoSql.CODE_FAMILY;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    descuentoPorFamiliaYTipoPago = descuento;
                }
                callback(descuentoPorFamiliaYTipoPago);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos por familia y tipo de pago: " +
                    err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerTodosLosDescuentosDeEscalaPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaDeEjecucion = [];
            listaDeEjecucion.push("SELECT");
            listaDeEjecucion.push(" DLS.DISCOUNT_LIST_ID");
            listaDeEjecucion.push(" ,DLS.CODE_SKU");
            listaDeEjecucion.push(" ,DLS.PACK_UNIT");
            listaDeEjecucion.push(" ,DLS.LOW_LIMIT");
            listaDeEjecucion.push(" ,DLS.HIGH_LIMIT");
            listaDeEjecucion.push(" ,DLS.DISCOUNT");
            listaDeEjecucion.push(" ,PU.CODE_PACK_UNIT");
            listaDeEjecucion.push(" ,DLS.DISCOUNT_TYPE");
            listaDeEjecucion.push(" ,DLS.PROMO_ID");
            listaDeEjecucion.push(" ,DLS.PROMO_NAME");
            listaDeEjecucion.push(" ,DLS.PROMO_TYPE");
            listaDeEjecucion.push(" ,DLS.FREQUENCY");
            listaDeEjecucion.push(" FROM DISCOUNT_LIST_BY_SKU DLS");
            listaDeEjecucion.push(" INNER JOIN PACK_UNIT PU ON DLS.PACK_UNIT = PU.PACK_UNIT");
            listaDeEjecucion.push(" WHERE DLS.DISCOUNT_LIST_ID = " + cliente.discountListId);
            tx.executeSql(listaDeEjecucion.join(""), [], function (tx, results) {
                var listaDeDescuentos = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorEscalaSku();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.codeSku = descuentoSql.CODE_SKU;
                    descuento.codePackUnit = descuentoSql.CODE_PACK_UNIT;
                    descuento.packUnit = descuentoSql.PACK_UNIT;
                    descuento.lowLimit = descuentoSql.LOW_LIMIT;
                    descuento.highLimit = descuentoSql.HIGH_LIMIT;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    listaDeDescuentos.push(descuento);
                    descuento = null;
                    descuentoSql = null;
                }
                callback(listaDeDescuentos);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos: " + err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerDescuentosPorMontoGeneralPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaDeEjecucion = [];
            listaDeEjecucion.push("SELECT");
            listaDeEjecucion.push(" DLGA.DISCOUNT_LIST_ID");
            listaDeEjecucion.push(" ,DLGA.LOW_AMOUNT");
            listaDeEjecucion.push(" ,DLGA.HIGH_AMOUNT");
            listaDeEjecucion.push(" ,DLGA.DISCOUNT");
            listaDeEjecucion.push(" ,DLGA.PROMO_ID");
            listaDeEjecucion.push(" ,DLGA.PROMO_NAME");
            listaDeEjecucion.push(" ,DLGA.PROMO_TYPE");
            listaDeEjecucion.push(" ,DLGA.FREQUENCY");
            listaDeEjecucion.push(" FROM DISCOUNT_LIST_BY_GENERAL_AMOUNT DLGA");
            listaDeEjecucion.push(" WHERE DLGA.DISCOUNT_LIST_ID = " + cliente.discountListId);
            tx.executeSql(listaDeEjecucion.join(""), [], function (tx, results) {
                var listaDeDescuentoPorMontoGeneral = [];
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorMontoGeneral();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.lowAmount = descuentoSql.LOW_AMOUNT;
                    descuento.highAmount = descuentoSql.HIGH_AMOUNT;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    listaDeDescuentoPorMontoGeneral.push(descuento);
                }
                callback(listaDeDescuentoPorMontoGeneral);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos por monto general: " + err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerDescuentoPorFamiliaYTipoPagoPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " DFP.DISCOUNT_LIST_ID";
            sql += " ,DFP.PAYMENT_TYPE";
            sql += " ,DFP.CODE_FAMILY";
            sql += " ,FS.DESCRIPTION_FAMILY_SKU";
            sql += " ,DFP.DISCOUNT_TYPE";
            sql += " ,DFP.DISCOUNT";
            sql += " ,DFP.PROMO_ID";
            sql += " ,DFP.PROMO_NAME";
            sql += " ,DFP.PROMO_TYPE";
            sql += " ,DFP.FREQUENCY";
            sql += " FROM DISCOUNT_LIST_BY_FAMILY_AND_PAYMENT_TYPE DFP";
            sql +=
                " INNER JOIN FAMILY_SKU FS ON (FS.CODE_FAMILY_SKU = DFP.CODE_FAMILY)";
            sql +=
                " WHERE DFP.DISCOUNT_LIST_ID = " +
                    cliente.discountByFamilyAndPaymentTypeListId;
            tx.executeSql(sql, [], function (tx, results) {
                var listaDescuentoPorFamiliaYTipoPago = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var descuento = new DescuentoPorFamiliaYTipoPago();
                    descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
                    descuento.paymentType = descuentoSql.PAYMENT_TYPE;
                    descuento.codeFamily = descuentoSql.CODE_FAMILY;
                    descuento.descriptionFamilySku =
                        descuentoSql.DESCRIPTION_FAMILY_SKU;
                    descuento.discountType = descuentoSql.DISCOUNT_TYPE;
                    descuento.discount = descuentoSql.DISCOUNT;
                    descuento.promoId = descuentoSql.PROMO_ID;
                    descuento.promoName = descuentoSql.PROMO_NAME;
                    descuento.promoType = descuentoSql.PROMO_TYPE;
                    descuento.frequency = descuentoSql.FREQUENCY;
                    descuento.apply = true;
                    listaDescuentoPorFamiliaYTipoPago.push(descuento);
                }
                callback(listaDescuentoPorFamiliaYTipoPago);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los descuentos por familia y tipo de pago: " +
                    err.message
            });
        });
    };
    DescuentoServicio.prototype.obtenerOrdeParaAplicarDescuentos = function (callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT DISTINCT";
            sql += " [ORDER]";
            sql += " ,CODE_DISCOUNT";
            sql += " ,DESCRIPTION";
            sql += " FROM ORDER_FOR_DISCOUNT_FOR_APPLY";
            sql += " ORDER BY [ORDER]";
            tx.executeSql(sql, [], function (tx, results) {
                var listaDeOrdenAplicarDescuentos = [];
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var ordenDescuento = new OrdenParaAplicarDescuento();
                    ordenDescuento.order = descuentoSql.ORDER;
                    ordenDescuento.codeDiscount = descuentoSql.CODE_DISCOUNT;
                    ordenDescuento.description = descuentoSql.DESCRIPTION;
                    listaDeOrdenAplicarDescuentos.push(ordenDescuento);
                }
                callback(listaDeOrdenAplicarDescuentos);
            });
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener los el orden para aplicar los descuentos: " +
                    err.message
            });
        });
    };
    DescuentoServicio.prototype.aplicarLosDescuentos = function (sku, esDescuentoUnicoDeEscala, listaDeOrdenAplicarDescuentos, descuentoPorMontoGeneralYFamilia, listaDescuentoPorFamiliaYTipoPago) {
        var _this = this;
        var total = sku.total;
        if (sku.specialPrice.applyDiscount) {
            if (listaDeOrdenAplicarDescuentos.length > 0) {
                listaDeOrdenAplicarDescuentos.map(function (ordenDescuento) {
                    switch (ordenDescuento.codeDiscount) {
                        case ListaDeDescuento.DescuentoPorEscala:
                            total = _this.obtenerTotalConDescueto(total, sku.discount, sku.discountType);
                            break;
                        case ListaDeDescuento.DescuentoPorMontoGeneralYFamilia:
                            if (!esDescuentoUnicoDeEscala) {
                                total = _this.obtenerTotalConDescueto(total, descuentoPorMontoGeneralYFamilia.discount, descuentoPorMontoGeneralYFamilia.discountType);
                            }
                            break;
                        case ListaDeDescuento.DescuentoPorFamiliaYTipoPago:
                            if (!esDescuentoUnicoDeEscala) {
                                total = _this.obtenerTotalConDescueto(total, listaDescuentoPorFamiliaYTipoPago.discount, listaDescuentoPorFamiliaYTipoPago.discountType);
                            }
                            break;
                    }
                });
            }
            else {
                var descutnoPorPorcentaje = 0;
                var descutnoMonetario = 0;
                if (sku.discount > 0) {
                    switch (sku.discountType) {
                        case TiposDeDescuento.Porcentaje.toString():
                            descutnoPorPorcentaje += sku.discount;
                            break;
                        case TiposDeDescuento.Monetario.toString():
                            descutnoMonetario += sku.discount;
                            break;
                    }
                }
                if (descuentoPorMontoGeneralYFamilia) {
                    switch (descuentoPorMontoGeneralYFamilia.discountType) {
                        case TiposDeDescuento.Porcentaje.toString():
                            descutnoPorPorcentaje +=
                                descuentoPorMontoGeneralYFamilia.discount;
                            break;
                        case TiposDeDescuento.Monetario.toString():
                            descutnoMonetario += descuentoPorMontoGeneralYFamilia.discount;
                            break;
                    }
                }
                if (listaDescuentoPorFamiliaYTipoPago) {
                    switch (listaDescuentoPorFamiliaYTipoPago.discountType) {
                        case TiposDeDescuento.Porcentaje.toString():
                            descutnoPorPorcentaje +=
                                listaDescuentoPorFamiliaYTipoPago.discount;
                            break;
                        case TiposDeDescuento.Monetario.toString():
                            descutnoMonetario += listaDescuentoPorFamiliaYTipoPago.discount;
                            break;
                    }
                }
                total = this.obtenerTotalConDescueto(total, descutnoPorPorcentaje, TiposDeDescuento.Porcentaje.toString());
                total = this.obtenerTotalConDescueto(total, descutnoMonetario, TiposDeDescuento.Monetario.toString());
            }
        }
        return total;
    };
    DescuentoServicio.prototype.obtenerDescuentos = function (listaDePaquetes, listaDeSkuOrdenDeVenta, cliente, listaHistoricoDePromos, callback, errCallback) {
        var _this = this;
        this.obtenerLosTiposDeDescuentos(cliente, listaHistoricoDePromos, function (listaDeOrdenAplicarDescuentos, listaDescuentoPorMontoGeneralYFamilia, listaDescuentoPorFamiliaYTipoPago) {
            var listaDeSoloTotalesYFamilias = [];
            listaDeSkuOrdenDeVenta.map(function (sku) {
                var resultadoSku = listaDeSoloTotalesYFamilias.find(function (familia) {
                    return familia.codeFamilySku === sku.codeFamilySku;
                });
                if (!resultadoSku) {
                    var skuAAgregar = new Sku();
                    skuAAgregar.codeFamilySku = sku.codeFamilySku;
                    skuAAgregar.total = 0;
                    skuAAgregar.isUniqueDiscountScale = sku.isUniqueDiscountScale;
                    listaDeSoloTotalesYFamilias.push(skuAAgregar);
                }
                else {
                    if (!sku.isUniqueDiscountScale) {
                        resultadoSku.isUniqueDiscountScale = sku.isUniqueDiscountScale;
                    }
                }
            });
            listaDePaquetes.map(function (paquete) {
                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                    return familia.codeFamilySku === paquete.codeFamily;
                });
                if (!resultadoFamilia) {
                    var skuAAgregar = new Sku();
                    skuAAgregar.codeFamilySku = paquete.codeFamily;
                    skuAAgregar.total = 0;
                    skuAAgregar.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
                    listaDeSoloTotalesYFamilias.push(skuAAgregar);
                }
                else {
                    if (!paquete.isUniqueDiscountScale) {
                        resultadoFamilia.isUniqueDiscountScale =
                            paquete.isUniqueDiscountScale;
                    }
                }
            });
            var totalDeEscala = 0, totalDeMontoGeneralYFamilia = 0, totalDEFamiliaYTipoPago = 0;
            var listaDescuentoPorMontoGeneralYFamiliaARetornar = [];
            var listaDescuentoPorFamiliaYTipoPagoARetornar = [];
            if (listaDeOrdenAplicarDescuentos.length > 0) {
                listaDeOrdenAplicarDescuentos.map(function (ordenDescuento) {
                    var descuntoParaAplicar = 0;
                    var tipoDescuentoParaAplicar = "";
                    if (ordenDescuento.codeDiscount ===
                        ListaDeDescuento.DescuentoPorEscala) {
                        listaDeSkuOrdenDeVenta.map(function (sku) {
                            if (sku.discount > 0) {
                                var resultadoPaquetes = listaDePaquetes.find(function (paquete) {
                                    return (paquete.codeSku === sku.sku &&
                                        paquete.codePackUnit === sku.codePackUnit &&
                                        paquete.codeFamily === sku.codeFamilySku);
                                });
                                if (!resultadoPaquetes) {
                                    descuntoParaAplicar = sku.discount;
                                    tipoDescuentoParaAplicar = sku.discountType;
                                    var total = sku.total;
                                    if (sku.specialPrice.applyDiscount) {
                                        total = _this.obtenerTotalConDescueto(sku.total, descuntoParaAplicar, tipoDescuentoParaAplicar);
                                        var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                            return familia.codeFamilySku === sku.codeFamilySku;
                                        });
                                        if (resultadoFamilia) {
                                            resultadoFamilia.total += total;
                                        }
                                    }
                                }
                            }
                        });
                        listaDePaquetes.map(function (paquete) {
                            if (paquete.qty !== 0) {
                                var total = _this.obtenerTotalConDescueto(paquete.price * paquete.qty, paquete.appliedDiscount, paquete.discountType);
                                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                    return familia.codeFamilySku === paquete.codeFamily;
                                });
                                if (resultadoFamilia) {
                                    resultadoFamilia.total += total;
                                }
                            }
                        });
                    }
                    else if (ordenDescuento.codeDiscount ===
                        ListaDeDescuento.DescuentoPorMontoGeneralYFamilia) {
                        if (listaDeSoloTotalesYFamilias.length > 0) {
                            if (listaDeSoloTotalesYFamilias[0].total === 0) {
                                listaDeSkuOrdenDeVenta.map(function (sku) {
                                    var resultadoPaquetes = listaDePaquetes.find(function (paquete) {
                                        return (paquete.codeSku === sku.sku &&
                                            paquete.codePackUnit === sku.codePackUnit &&
                                            paquete.codeFamily === sku.codeFamilySku);
                                    });
                                    if (!resultadoPaquetes) {
                                        var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                            return familia.codeFamilySku === sku.codeFamilySku;
                                        });
                                        if (resultadoFamilia) {
                                            resultadoFamilia.total += sku.total;
                                        }
                                    }
                                });
                                listaDePaquetes.map(function (paquete) {
                                    if (paquete.qty !== 0) {
                                        var total = paquete.price * paquete.qty;
                                        var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                            return familia.codeFamilySku === paquete.codeFamily;
                                        });
                                        if (resultadoFamilia) {
                                            resultadoFamilia.total += total;
                                        }
                                    }
                                });
                            }
                        }
                        listaDeSoloTotalesYFamilias.map(function (familia) {
                            if (!familia.isUniqueDiscountScale) {
                                var descuentoPorMontoGeneralYFamilia_1 = listaDescuentoPorMontoGeneralYFamilia.find(function (descuento) {
                                    return (descuento.codeFamily === familia.codeFamilySku &&
                                        descuento.lowAmount <= familia.total &&
                                        descuento.highAmount >= familia.total);
                                });
                                if (descuentoPorMontoGeneralYFamilia_1) {
                                    var resultadoDescuento = listaDescuentoPorMontoGeneralYFamiliaARetornar.find(function (descuento) {
                                        return (descuento.promoId ===
                                            descuentoPorMontoGeneralYFamilia_1.promoId);
                                    });
                                    if (!resultadoDescuento) {
                                        listaDescuentoPorMontoGeneralYFamiliaARetornar.push(descuentoPorMontoGeneralYFamilia_1);
                                    }
                                }
                            }
                        });
                    }
                    else if (ordenDescuento.codeDiscount ===
                        ListaDeDescuento.DescuentoPorFamiliaYTipoPago) {
                        if (listaDeSoloTotalesYFamilias.length > 0) {
                            if (listaDeSoloTotalesYFamilias[0].total === 0) {
                                listaDeSkuOrdenDeVenta.map(function (sku) {
                                    var resultadoPaquetes = listaDePaquetes.find(function (paquete) {
                                        return (paquete.codeSku === sku.sku &&
                                            paquete.codePackUnit === sku.codePackUnit &&
                                            paquete.codeFamily === sku.codeFamilySku);
                                    });
                                    if (!resultadoPaquetes) {
                                        var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                            return familia.codeFamilySku === sku.codeFamilySku;
                                        });
                                        if (resultadoFamilia) {
                                            if (!resultadoFamilia.isUniqueDiscountScale) {
                                                resultadoFamilia.total += sku.total;
                                            }
                                        }
                                    }
                                });
                                listaDePaquetes.map(function (paquete) {
                                    if (paquete.qty !== 0) {
                                        var total = paquete.price * paquete.qty;
                                        var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                            return familia.codeFamilySku === paquete.codeFamily;
                                        });
                                        if (resultadoFamilia) {
                                            if (!resultadoFamilia.isUniqueDiscountScale) {
                                                resultadoFamilia.total += total;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        listaDeSoloTotalesYFamilias.map(function (familia) {
                            if (!familia.isUniqueDiscountScale) {
                                var descuentoPorFamiliaYTipoPago_1 = listaDescuentoPorFamiliaYTipoPago.find(function (descuento) {
                                    return descuento.codeFamily === descuento.codeFamily;
                                });
                                if (descuentoPorFamiliaYTipoPago_1) {
                                    var resultadoDescuento = listaDescuentoPorMontoGeneralYFamiliaARetornar.find(function (descuento) {
                                        return (descuento.promoId ===
                                            descuentoPorFamiliaYTipoPago_1.promoId);
                                    });
                                    if (!resultadoDescuento) {
                                        listaDescuentoPorFamiliaYTipoPago.push(descuentoPorFamiliaYTipoPago_1);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            else {
                var descuntoParaAplicar_1 = 0;
                var tipoDescuentoParaAplicar_1 = "";
                listaDeSkuOrdenDeVenta.map(function (sku) {
                    if (sku.discount > 0) {
                        var resultadoPaquetes = listaDePaquetes.find(function (paquete) {
                            return (paquete.codeSku === sku.sku &&
                                paquete.codePackUnit === sku.codePackUnit &&
                                paquete.codeFamily === sku.codeFamilySku);
                        });
                        if (!resultadoPaquetes) {
                            descuntoParaAplicar_1 = 0;
                            tipoDescuentoParaAplicar_1 = sku.discountType;
                            var total = sku.total;
                            if (sku.specialPrice.applyDiscount) {
                                total = _this.obtenerTotalConDescueto(sku.total, descuntoParaAplicar_1, tipoDescuentoParaAplicar_1);
                                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                    return familia.codeFamilySku === sku.codeFamilySku;
                                });
                                if (resultadoFamilia) {
                                    resultadoFamilia.total += total;
                                }
                            }
                        }
                    }
                });
                listaDePaquetes.map(function (paquete) {
                    if (paquete.qty !== 0) {
                        var total = _this.obtenerTotalConDescueto(paquete.price * paquete.qty, 0, paquete.discountType);
                        var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                            return familia.codeFamilySku === paquete.codeFamily;
                        });
                        if (resultadoFamilia) {
                            resultadoFamilia.total += total;
                        }
                    }
                });
                if (listaDeSoloTotalesYFamilias.length > 0) {
                    if (listaDeSoloTotalesYFamilias[0].total === 0) {
                        listaDeSkuOrdenDeVenta.map(function (sku) {
                            var resultadoPaquetes = listaDePaquetes.find(function (paquete) {
                                return (paquete.codeSku === sku.sku &&
                                    paquete.codePackUnit === sku.codePackUnit &&
                                    paquete.codeFamily === sku.codeFamilySku);
                            });
                            if (!resultadoPaquetes) {
                                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                    return familia.codeFamilySku === sku.codeFamilySku;
                                });
                                if (resultadoFamilia) {
                                    resultadoFamilia.total += sku.total;
                                }
                            }
                        });
                        listaDePaquetes.map(function (paquete) {
                            if (paquete.qty !== 0) {
                                var total = paquete.price * paquete.qty;
                                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                    return familia.codeFamilySku === paquete.codeFamily;
                                });
                                if (resultadoFamilia) {
                                    resultadoFamilia.total += total;
                                }
                            }
                        });
                    }
                }
                listaDeSoloTotalesYFamilias.map(function (familia) {
                    if (!familia.isUniqueDiscountScale) {
                        var descuentoPorMontoGeneralYFamilia_2 = listaDescuentoPorMontoGeneralYFamilia.find(function (descuento) {
                            return (descuento.codeFamily === familia.codeFamilySku &&
                                descuento.lowAmount <= familia.total &&
                                descuento.highAmount >= familia.total);
                        });
                        if (descuentoPorMontoGeneralYFamilia_2) {
                            var resultadoDescuento = listaDescuentoPorMontoGeneralYFamiliaARetornar.find(function (descuento) {
                                return (descuento.promoId ===
                                    descuentoPorMontoGeneralYFamilia_2.promoId);
                            });
                            if (!resultadoDescuento) {
                                listaDescuentoPorMontoGeneralYFamiliaARetornar.push(descuentoPorMontoGeneralYFamilia_2);
                            }
                        }
                    }
                });
                if (listaDeSoloTotalesYFamilias.length > 0) {
                    if (listaDeSoloTotalesYFamilias[0].total === 0) {
                        listaDeSkuOrdenDeVenta.map(function (sku) {
                            var resultadoPaquetes = listaDePaquetes.find(function (paquete) {
                                return (paquete.codeSku === sku.sku &&
                                    paquete.codePackUnit === sku.codePackUnit &&
                                    paquete.codeFamily === sku.codeFamilySku);
                            });
                            if (!resultadoPaquetes) {
                                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                    return familia.codeFamilySku === sku.codeFamilySku;
                                });
                                if (resultadoFamilia) {
                                    if (!resultadoFamilia.isUniqueDiscountScale) {
                                        resultadoFamilia.total += sku.total;
                                    }
                                }
                            }
                        });
                        listaDePaquetes.map(function (paquete) {
                            if (paquete.qty !== 0) {
                                var total = paquete.price * paquete.qty;
                                var resultadoFamilia = listaDeSoloTotalesYFamilias.find(function (familia) {
                                    return familia.codeFamilySku === paquete.codeFamily;
                                });
                                if (resultadoFamilia) {
                                    if (!resultadoFamilia.isUniqueDiscountScale) {
                                        resultadoFamilia.total += total;
                                    }
                                }
                            }
                        });
                    }
                }
                listaDeSoloTotalesYFamilias.map(function (familia) {
                    if (!familia.isUniqueDiscountScale) {
                        var descuentoPorFamiliaYTipoPago_2 = listaDescuentoPorFamiliaYTipoPago.find(function (descuento) {
                            return descuento.codeFamily === descuento.codeFamily;
                        });
                        if (descuentoPorFamiliaYTipoPago_2) {
                            var resultadoDescuento = listaDescuentoPorMontoGeneralYFamiliaARetornar.find(function (descuento) {
                                return (descuento.promoId === descuentoPorFamiliaYTipoPago_2.promoId);
                            });
                            if (!resultadoDescuento) {
                                listaDescuentoPorFamiliaYTipoPago.push(descuentoPorFamiliaYTipoPago_2);
                            }
                        }
                    }
                });
            }
            callback(listaDescuentoPorMontoGeneralYFamiliaARetornar, listaDescuentoPorFamiliaYTipoPago);
        }, function (resultado) {
            errCallback(resultado);
        });
    };
    DescuentoServicio.prototype.obtenerLosTiposDeDescuentos = function (cliente, listaHistoricoDePromos, callBack, errCallback) {
        var _this = this;
        this.obtenerOrdeParaAplicarDescuentos(function (listaDeOrdenAplicarDescuentos) {
            _this.obtenerListaDeDescuentoPorMontoGeneralYFamilia(cliente, function (listaDescuentoPorMontoGeneralYFamilia) {
                _this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDescuentoPorMontoGeneralYFamilia, 0, listaHistoricoDePromos, function (listaDescuentoPorMontoGeneralYFamilia) {
                    _this.obtenerDescuentoPorFamiliaYTipoPago(cliente, new Tarea(), function (listaDescuentoPorFamiliaYTipoPago) {
                        _this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDescuentoPorFamiliaYTipoPago, 0, listaHistoricoDePromos, function (listaDescuentoPorFamiliaYTipoPago) {
                            callBack(listaDeOrdenAplicarDescuentos, listaDescuentoPorMontoGeneralYFamilia, listaDescuentoPorFamiliaYTipoPago);
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                    }, function (resultado) {
                        errCallback(resultado);
                    });
                }, function (resultado) {
                    errCallback(resultado);
                });
            }, function (resultado) {
                errCallback(resultado);
            });
        }, function (resultado) {
            errCallback(resultado);
        });
    };
    DescuentoServicio.prototype.obtenerTotalConDescueto = function (total, discount, discountType) {
        switch (discountType) {
            case TiposDeDescuento.Porcentaje.toString():
                total =
                    parseFloat(discount.toString()) !== 0
                        ? total - (parseFloat(discount.toString()) * total) / 100
                        : total;
                break;
            case TiposDeDescuento.Monetario.toString():
                total =
                    parseFloat(discount.toString()) !== 0
                        ? total - parseFloat(discount.toString())
                        : total;
                break;
        }
        return total;
    };
    DescuentoServicio.prototype.validarSiAplicaElDescuentoPorMontoGeneralYFamilia = function (listaDeDescuento, indiceDeListaDeDescuento, listaHistoricoDePromos, callBack, errCallback) {
        var _this = this;
        try {
            if (listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_1 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_1 = listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_1.promoId;
                    });
                    if (resultadoDePromoHistorico_1) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_1.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_1.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_1.frequency;
                        this.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_1, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return (resultadoDePromoHistorico_1.promoId !== descuento.promoId);
                                });
                            }
                            _this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDeDescuento, indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0), listaHistoricoDePromos, function (listaDeDescuento) {
                                callBack(listaDeDescuento);
                            }, function (resultado) {
                                errCallback(resultado);
                            });
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                        promoDeDescuento = null;
                    }
                    else {
                        this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(listaDeDescuento, indiceDeListaDeDescuento + 1, listaHistoricoDePromos, function (listaDeDescuento) {
                            callBack(listaDeDescuento);
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                    }
                }
                else {
                    callBack(listaDeDescuento);
                }
            }
            else {
                callBack(listaDeDescuento);
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar si aplica el descuento por monto general y familia: " + ex.message
            });
        }
    };
    DescuentoServicio.prototype.listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 &&
            listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    DescuentoServicio.prototype.validarSiAplicaElDescuentoPorFamiliaYTipoPago = function (listaDeDescuento, indiceDeListaDeDescuento, listaHistoricoDePromos, callBack, errCallback) {
        var _this = this;
        try {
            if (listaHistoricoDePromos.length > 0) {
                if (this.listaDeDescuentoPorMontoFamiliaYTipoPagoTerminoDeIterar(listaDeDescuento, indiceDeListaDeDescuento)) {
                    var descuentoAValidar_2 = listaDeDescuento[indiceDeListaDeDescuento];
                    var resultadoDePromoHistorico_2 = listaHistoricoDePromos.find(function (promo) {
                        return promo.promoId === descuentoAValidar_2.promoId;
                    });
                    if (resultadoDePromoHistorico_2) {
                        var promoDeDescuento = new Promo();
                        promoDeDescuento.promoId = descuentoAValidar_2.promoId;
                        promoDeDescuento.promoName = descuentoAValidar_2.promoName;
                        promoDeDescuento.frequency = descuentoAValidar_2.frequency;
                        this.validarSiAplicaPromo(promoDeDescuento, resultadoDePromoHistorico_2, function (aplicaDescuento) {
                            if (!aplicaDescuento) {
                                listaDeDescuento = listaDeDescuento.filter(function (descuento) {
                                    return (resultadoDePromoHistorico_2.promoId !== descuento.promoId);
                                });
                            }
                            _this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDeDescuento, indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0), listaHistoricoDePromos, function (listaDeDescuento) {
                                callBack(listaDeDescuento);
                            }, function (resultado) {
                                errCallback(resultado);
                            });
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                        promoDeDescuento = null;
                    }
                    else {
                        this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(listaDeDescuento, indiceDeListaDeDescuento + 1, listaHistoricoDePromos, function (listaDeDescuento) {
                            callBack(listaDeDescuento);
                        }, function (resultado) {
                            errCallback(resultado);
                        });
                    }
                }
                else {
                    callBack(listaDeDescuento);
                }
            }
            else {
                callBack(listaDeDescuento);
            }
        }
        catch (ex) {
            errCallback({
                codigo: -1,
                mensaje: "Error al validar si aplica el descuento por familia y tipo pago: " + ex.message
            });
        }
    };
    DescuentoServicio.prototype.listaDeDescuentoPorMontoFamiliaYTipoPagoTerminoDeIterar = function (listaDeDescuento, indiceDeListaDeDescuento) {
        return (listaDeDescuento.length > 0 &&
            listaDeDescuento.length > indiceDeListaDeDescuento);
    };
    DescuentoServicio.prototype.validarSiAplicaPromo = function (promo, promoHistorico, callback, callbackError) {
        try {
            promoHistorico.historyDateTime.setHours(0);
            promoHistorico.historyDateTime.setMinutes(0);
            promoHistorico.historyDateTime.setSeconds(0);
            promoHistorico.historyDateTime.setMilliseconds(0);
            var cantidadDeDias = 0;
            switch (promo.frequency) {
                case TipoPeriodicidadDePromo.Siempre.toString():
                    callback(true);
                    break;
                case TipoPeriodicidadDePromo.Unica.toString():
                    callback(false);
                    break;
                case TipoPeriodicidadDePromo.PorDia.toString():
                    var fechaActual = new Date();
                    fechaActual.setHours(0);
                    fechaActual.setMinutes(0);
                    fechaActual.setSeconds(0);
                    fechaActual.setMilliseconds(0);
                    if (promoHistorico.historyDateTime < fechaActual) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                    fechaActual = null;
                    break;
                case TipoPeriodicidadDePromo.PorSemana.toString():
                    cantidadDeDias = 7;
                    break;
                case TipoPeriodicidadDePromo.PorMes.toString():
                    cantidadDeDias = 30;
                    break;
            }
            if (cantidadDeDias > 0) {
                this.obtenerFechaParaCompararLaPromo(cantidadDeDias, function (fecha) {
                    if (promoHistorico.historyDateTime <= fecha) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }, function (resultado) {
                    callbackError(resultado);
                });
            }
        }
        catch (ex) {
            callbackError({
                codigo: -1,
                mensaje: "Error al validar si aplica promo: " + ex.message
            });
        }
    };
    DescuentoServicio.prototype.obtenerFechaParaCompararLaPromo = function (diasARestar, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaParaEjecucion = [];
            listaParaEjecucion.push("SELECT DateTime('Now', 'LocalTime', '-" + diasARestar + " Day') AS DATE_PROMO");
            tx.executeSql(listaParaEjecucion.join(""), [], function (tx, results) {
                if (results.rows.length > 0) {
                    var registroPorComboSql = results.rows.item(0);
                    var fecha = void 0;
                    fecha = new Date(registroPorComboSql.DATE_PROMO);
                    fecha.setHours(0);
                    fecha.setMinutes(0);
                    fecha.setSeconds(0);
                    fecha.setMilliseconds(0);
                    callback(fecha);
                    fecha = null;
                    registroPorComboSql = null;
                }
                else {
                    callbackError({
                        codigo: -1,
                        mensaje: "No se pudo obtener la fecha para la comparaci\u00F3n."
                    });
                }
            });
            listaParaEjecucion = null;
        }, function (err) {
            callbackError({
                codigo: -1,
                mensaje: "Error al obtener fecha para compara la p de promo: " + err.message
            });
        });
    };
    return DescuentoServicio;
}());
//# sourceMappingURL=DescuentoServicio.js.map