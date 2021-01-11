var PrecioSkuServicio = (function () {
    function PrecioSkuServicio() {
    }
    PrecioSkuServicio.prototype.obtenerPreciosDePaquetes = function (cliente, sku, paquetes, decimales, callback, callbackError) {
        for (var i = 0; i < paquetes.length; i++) {
            this.obtenerPrecioDePaquete(cliente, sku, paquetes[i], i, decimales, function (paquete, index) {
                if (paquetes.length - 1 === index) {
                    callback(paquetes);
                }
            }, function (resultado) {
                callbackError(resultado);
            });
        }
    };
    PrecioSkuServicio.prototype.obtenerPrecioDePaquete = function (cliente, sku, paquete, index, decimales, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var qty = paquete.qty === 0 ? 1 : paquete.qty;
            var listaParaEjecucion = [];
            listaParaEjecucion.push("SELECT");
            listaParaEjecucion.push(" SPS.PRICE price");
            listaParaEjecucion.push(" FROM PRICE_LIST_BY_SKU_PACK_SCALE SPS");
            listaParaEjecucion.push(" WHERE (SPS.CODE_PRICE_LIST = '" + cliente.priceListId + "') ");
            listaParaEjecucion.push(" AND SPS.CODE_SKU = '" + sku.sku + "'");
            listaParaEjecucion.push(" AND SPS.CODE_PACK_UNIT = '" + paquete.codePackUnit + "'");
            listaParaEjecucion.push(" AND " + qty + " BETWEEN LOW_LIMIT AND HIGH_LIMIT");
            listaParaEjecucion.push(" ORDER BY SPS.[PRIORITY] DESC");
            listaParaEjecucion.push(" LIMIT 1");
            tx.executeSql(listaParaEjecucion.join(""), [], function (tx, results) {
                if (results.rows.length > 0) {
                    var stPaquete = results.rows.item(0);
                    if (sku.skuPrice > 0) {
                        paquete.price = trunc_number(sku.canNegotiatePrice ? sku.cost : sku.skuPrice, decimales.defaultCalculationsDecimals);
                        paquete.originalPrice = trunc_number(sku.originalPrice, decimales.defaultCalculationsDecimals);
                    }
                    else {
                        paquete.price = trunc_number(stPaquete.price, decimales.defaultCalculationsDecimals);
                        paquete.originalPrice = trunc_number(stPaquete.price, decimales.defaultCalculationsDecimals);
                    }
                }
                else {
                    paquete.price = -1;
                    paquete.originalPrice = -1;
                }
                callback(paquete, index);
            });
            listaParaEjecucion = null;
            qty = null;
        }, function (err) {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = err.code;
            operacion.mensaje = err.message;
            callbackError(operacion);
        });
    };
    return PrecioSkuServicio;
}());
//# sourceMappingURL=PrecioSkuServicio.js.map