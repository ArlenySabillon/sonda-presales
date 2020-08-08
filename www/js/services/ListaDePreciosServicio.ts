class ListaDePreciosServicio implements IListaDePreciosServicio {

    agregarListaDePreciosPorSku(listaDePrecio: any, callBack: () => void, errorCallBack: (resultado: Operacion) => void) {
        const result = new Operacion();
        try {
            let sql = "";
            SONDA_DB_Session.transaction((trans) => {
                sql = " INSERT INTO PRICE_LIST_BY_SKU_PACK_SCALE(";
                sql += " CODE_PRICE_LIST";
                sql += ", CODE_SKU";
                sql += ", CODE_PACK_UNIT";
                sql += ", PRIORITY";
                sql += ", LOW_LIMIT";
                sql += ", HIGH_LIMIT";
                sql += ", PRICE";
                sql += ")VALUES(";
                sql += "'" + listaDePrecio.CODE_PRICE_LIST + "'";
                sql += " , '" + listaDePrecio.CODE_SKU + "'";
                sql += " , '" + listaDePrecio.CODE_PACK_UNIT + "'";
                if (listaDePrecio.PRIORITY === undefined)
                    sql += " , 0";
                else
                    sql += " , " + listaDePrecio.PRIORITY;

                if (listaDePrecio.LOW_LIMIT === undefined)
                    sql += " , 1";
                else
                    sql += " , " + listaDePrecio.LOW_LIMIT;

                if (listaDePrecio.HIGH_LIMIT === undefined)
                    sql += " , 1000000";
                else
                    sql += " , " + listaDePrecio.HIGH_LIMIT;
                                                
                sql += " , '" + listaDePrecio.PRICE + "'";
                sql += " )";
                console.log(sql);
                trans.executeSql(sql);
                callBack();
            }, (err: SqlError) => {
                result.codigo = -1;
                result.mensaje = err.message;
                console.log(result);
                errorCallBack(result);
            });
        } catch (e) {
            result.codigo = -1;
            result.mensaje = e.message;
            console.log(result);
            errorCallBack(result);
        }
    }

    establecerListaDePreciosACliente(cliente: Cliente, callBack: () => void, errorCallBack: (resultado: Operacion) => void) {
        const result = new Operacion();
        try {
            let sql = "";
            SONDA_DB_Session.transaction((trans) => {
                sql = " UPDATE CLIENTS ";
                sql += " SET PRICE_LIST_ID = '" + cliente.priceListId + "'";
                sql += " WHERE CLIENT_ID = '" + cliente.clientId + "'";                
                console.log(sql);
                trans.executeSql(sql);
                callBack();
            }, (err: SqlError) => {
                result.codigo = -1;
                result.mensaje = err.message;
                console.log(result);
                errorCallBack(result);
            });
        } catch (e) {
            result.codigo = -1;
            result.mensaje = e.message;
            console.log(result);
            errorCallBack(result);
        }
    }


    agregarPaqueteDeListaDePreciosPorSku(paqueteDeListaDePrecios: any, cliente: any,callBack: (cliente: any) => void, errorCallBack: (resultado: Operacion) => void) {
        const result = new Operacion();
        try {
            let sql = "";
            SONDA_DB_Session.transaction((trans) => {

                //sql = `DELETE FROM PRICE_LIST_BY_SKU_PACK_SCALE WHERE CODE_PRICE_LIST = '${paqueteDeListaDePrecios[0].CODE_PRICE_LIST}'`;
                //console.log(sql);
                //trans.executeSql(sql);

                for (let i=0; i < paqueteDeListaDePrecios.length; i++) {
                    let listaDePrecio = paqueteDeListaDePrecios[i];
                    sql = " INSERT INTO PRICE_LIST_BY_SKU_PACK_SCALE(";
                    sql += " CODE_PRICE_LIST";
                    sql += ", CODE_SKU";
                    sql += ", CODE_PACK_UNIT";
                    sql += ", PRIORITY";
                    sql += ", LOW_LIMIT";
                    sql += ", HIGH_LIMIT";
                    sql += ", PRICE";
                    sql += ")VALUES(";
                    sql += "'" + listaDePrecio.CODE_PRICE_LIST + "'";
                    sql += " , '" + listaDePrecio.CODE_SKU + "'";
                    sql += " , '" + listaDePrecio.CODE_PACK_UNIT + "'";
                    if (listaDePrecio.PRIORITY === undefined)
                        sql += " , 0";
                    else
                        sql += " , " + listaDePrecio.PRIORITY;

                    if (listaDePrecio.LOW_LIMIT === undefined)
                        sql += " , 1";
                    else
                        sql += " , " + listaDePrecio.LOW_LIMIT;

                    if (listaDePrecio.HIGH_LIMIT === undefined)
                        sql += " , 1000000";
                    else
                        sql += " , " + listaDePrecio.HIGH_LIMIT;

                    sql += " , '" + listaDePrecio.PRICE + "'";
                    sql += " )";
                    console.log(sql);
                    trans.executeSql(sql);
                }
                callBack(cliente);
            }, (err: SqlError) => {
                result.codigo = -1;
                result.mensaje = err.message;
                console.log(result);
                errorCallBack(result);
            });
        } catch (e) {
            result.codigo = -1;
            result.mensaje = e.message;
            console.log(result);
            errorCallBack(result);
        }
    }
}