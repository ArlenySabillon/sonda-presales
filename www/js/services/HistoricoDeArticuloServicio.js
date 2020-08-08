var HistoricoDeArticuloServicio = (function () {
    function HistoricoDeArticuloServicio() {
    }
    HistoricoDeArticuloServicio.prototype.obtenerHistoricoDeArticuloParaCliente = function (tipoDeDocumento, cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT" +
                " I.DOC_TYPE" +
                " ,I.CODE_CUSTOMER" +
                " ,I.CODE_SKU" +
                " ,I.QTY" +
                " ,I.CODE_PACK_UNIT" +
                " FROM ITEM_HISTORY I" +
                " WHERE I.DOC_TYPE = '" +
                tipoDeDocumento +
                "' " +
                " AND I.CODE_CUSTOMER = '" +
                cliente.clientId +
                "'";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length >= 1) {
                    var historicoDeArticulos = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        var stHistoricoDeArticulos = results.rows.item(i);
                        var historicoDeArticulo = new HistoricoDeArticulo();
                        historicoDeArticulo.docType = stHistoricoDeArticulos.DOC_TYPE;
                        historicoDeArticulo.codeCustomer =
                            stHistoricoDeArticulos.CODE_CUSTOMER;
                        historicoDeArticulo.codeSku = stHistoricoDeArticulos.CODE_SKU;
                        historicoDeArticulo.codePackUnit =
                            stHistoricoDeArticulos.CODE_PACK_UNIT;
                        historicoDeArticulo.qty = stHistoricoDeArticulos.QTY;
                        historicoDeArticulos.push(historicoDeArticulo);
                    }
                    callback(historicoDeArticulos);
                }
                else {
                    var operacion = new Operacion();
                    operacion.resultado = ResultadoOperacionTipo.Error;
                    operacion.codigo = 0;
                    operacion.mensaje = "Este producto no tiene paquetes configurados";
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
    HistoricoDeArticuloServicio.prototype.colocarSugerenciaDeVentaAPaquetes = function (tipoDeDocumento, cliente, sku, paquetes, decimales, callback, callbackError) {
        for (var i = 0; i < paquetes.length; i++) {
            this.colocarSugerenciaDeVentaAPaquete(tipoDeDocumento, cliente, sku, paquetes[i], i, decimales, function (paquete, index) {
                paquetes[index].lastQtySold = trunc_number(paquete.lastQtySold, decimales.defaultCalculationsDecimals);
                if (paquetes.length - 1 === index) {
                    callback(paquetes);
                }
            }, function (resultado) {
                callbackError(resultado);
            });
        }
    };
    HistoricoDeArticuloServicio.prototype.colocarSugerenciaDeVentaAPaquete = function (tipoDeDocumento, cliente, sku, paquete, index, decimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT";
            sql += " I.QTY";
            sql += " ,I.CODE_PACK_UNIT AS LAST_CODE_PACK_UNIT_SOLD";
            sql += " ,I.LAST_PRICE AS LAST_PRICE_SOLD";
            sql += " ,I.SALE_DATE AS LAST_SALE_DATE";
            sql += " FROM ITEM_HISTORY I";
            sql += " WHERE I.DOC_TYPE = '" + tipoDeDocumento + "'";
            sql += " AND I.CODE_CUSTOMER = '" + cliente.clientId + "'";
            sql += " AND I.CODE_SKU = '" + sku.sku + "'";
            sql += " AND I.CODE_PACK_UNIT = '" + paquete.codePackUnit + "'";
            sql += " LIMIT 1";
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    var stHistoricoDeArticulo = results.rows.item(0);
                    paquete.lastQtySold = trunc_number(stHistoricoDeArticulo.QTY, decimales.defaultCalculationsDecimals);
                    paquete.lastCodePackUnitSold =
                        stHistoricoDeArticulo.LAST_CODE_PACK_UNIT_SOLD;
                    paquete.lastPriceSold = stHistoricoDeArticulo.LAST_PRICE_SOLD;
                    paquete.lastSaleDate = stHistoricoDeArticulo.LAST_SALE_DATE;
                }
                else {
                    paquete.lastQtySold = 0;
                }
                callback(paquete, index);
            });
        }, function (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        });
    };
    return HistoricoDeArticuloServicio;
}());
//# sourceMappingURL=HistoricoDeArticuloServicio.js.map