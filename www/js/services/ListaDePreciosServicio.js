var ListaDePreciosServicio = (function () {
    function ListaDePreciosServicio() {
    }
    ListaDePreciosServicio.prototype.agregarListaDePreciosPorSku = function (listaDePrecio, callBack, errorCallBack) {
        var result = new Operacion();
        try {
            var sql_1 = "";
            SONDA_DB_Session.transaction(function (trans) {
                sql_1 = " INSERT INTO PRICE_LIST_BY_SKU_PACK_SCALE(";
                sql_1 += " CODE_PRICE_LIST";
                sql_1 += ", CODE_SKU";
                sql_1 += ", CODE_PACK_UNIT";
                sql_1 += ", PRIORITY";
                sql_1 += ", LOW_LIMIT";
                sql_1 += ", HIGH_LIMIT";
                sql_1 += ", PRICE";
                sql_1 += ")VALUES(";
                sql_1 += "'" + listaDePrecio.CODE_PRICE_LIST + "'";
                sql_1 += " , '" + listaDePrecio.CODE_SKU + "'";
                sql_1 += " , '" + listaDePrecio.CODE_PACK_UNIT + "'";
                if (listaDePrecio.PRIORITY === undefined)
                    sql_1 += " , 0";
                else
                    sql_1 += " , " + listaDePrecio.PRIORITY;
                if (listaDePrecio.LOW_LIMIT === undefined)
                    sql_1 += " , 1";
                else
                    sql_1 += " , " + listaDePrecio.LOW_LIMIT;
                if (listaDePrecio.HIGH_LIMIT === undefined)
                    sql_1 += " , 1000000";
                else
                    sql_1 += " , " + listaDePrecio.HIGH_LIMIT;
                sql_1 += " , '" + listaDePrecio.PRICE + "'";
                sql_1 += " )";
                console.log(sql_1);
                trans.executeSql(sql_1);
                callBack();
            }, function (err) {
                result.codigo = -1;
                result.mensaje = err.message;
                console.log(result);
                errorCallBack(result);
            });
        }
        catch (e) {
            result.codigo = -1;
            result.mensaje = e.message;
            console.log(result);
            errorCallBack(result);
        }
    };
    ListaDePreciosServicio.prototype.establecerListaDePreciosACliente = function (cliente, callBack, errorCallBack) {
        var result = new Operacion();
        try {
            var sql_2 = "";
            SONDA_DB_Session.transaction(function (trans) {
                sql_2 = " UPDATE CLIENTS ";
                sql_2 += " SET PRICE_LIST_ID = '" + cliente.priceListId + "'";
                sql_2 += " WHERE CLIENT_ID = '" + cliente.clientId + "'";
                console.log(sql_2);
                trans.executeSql(sql_2);
                callBack();
            }, function (err) {
                result.codigo = -1;
                result.mensaje = err.message;
                console.log(result);
                errorCallBack(result);
            });
        }
        catch (e) {
            result.codigo = -1;
            result.mensaje = e.message;
            console.log(result);
            errorCallBack(result);
        }
    };
    ListaDePreciosServicio.prototype.agregarPaqueteDeListaDePreciosPorSku = function (paqueteDeListaDePrecios, cliente, callBack, errorCallBack) {
        var result = new Operacion();
        try {
            var sql_3 = "";
            SONDA_DB_Session.transaction(function (trans) {
                for (var i = 0; i < paqueteDeListaDePrecios.length; i++) {
                    var listaDePrecio = paqueteDeListaDePrecios[i];
                    sql_3 = " INSERT INTO PRICE_LIST_BY_SKU_PACK_SCALE(";
                    sql_3 += " CODE_PRICE_LIST";
                    sql_3 += ", CODE_SKU";
                    sql_3 += ", CODE_PACK_UNIT";
                    sql_3 += ", PRIORITY";
                    sql_3 += ", LOW_LIMIT";
                    sql_3 += ", HIGH_LIMIT";
                    sql_3 += ", PRICE";
                    sql_3 += ")VALUES(";
                    sql_3 += "'" + listaDePrecio.CODE_PRICE_LIST + "'";
                    sql_3 += " , '" + listaDePrecio.CODE_SKU + "'";
                    sql_3 += " , '" + listaDePrecio.CODE_PACK_UNIT + "'";
                    if (listaDePrecio.PRIORITY === undefined)
                        sql_3 += " , 0";
                    else
                        sql_3 += " , " + listaDePrecio.PRIORITY;
                    if (listaDePrecio.LOW_LIMIT === undefined)
                        sql_3 += " , 1";
                    else
                        sql_3 += " , " + listaDePrecio.LOW_LIMIT;
                    if (listaDePrecio.HIGH_LIMIT === undefined)
                        sql_3 += " , 1000000";
                    else
                        sql_3 += " , " + listaDePrecio.HIGH_LIMIT;
                    sql_3 += " , '" + listaDePrecio.PRICE + "'";
                    sql_3 += " )";
                    console.log(sql_3);
                    trans.executeSql(sql_3);
                }
                callBack(cliente);
            }, function (err) {
                result.codigo = -1;
                result.mensaje = err.message;
                console.log(result);
                errorCallBack(result);
            });
        }
        catch (e) {
            result.codigo = -1;
            result.mensaje = e.message;
            console.log(result);
            errorCallBack(result);
        }
    };
    return ListaDePreciosServicio;
}());
//# sourceMappingURL=ListaDePreciosServicio.js.map