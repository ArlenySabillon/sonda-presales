var BonoServicio = (function () {
    function BonoServicio() {
        this.tareaServicio = new TareaServcio();
    }
    BonoServicio.prototype.obtenerBonificacionPorEscalaPorCliente = function (cliente, sku, callback, callbackError, indiceDeListaSku, listaDeSkuDeBonificacion) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT DISTINCT";
            sql += " BLS.BONUS_LIST_ID";
            sql += " ,BLS.CODE_SKU";
            sql += " ,BLS.CODE_PACK_UNIT";
            sql += " ,BLS.LOW_LIMIT";
            sql += " ,BLS.HIGH_LIMIT";
            sql += " ,BLS.CODE_SKU_BONUS";
            sql += " ,BLS.BONUS_QTY";
            sql += " ,BLS.CODE_PACK_UNIT_BONUES";
            sql += " ,SP.SKU_NAME";
            sql += " ,SP.OWNER";
            sql += " ,SP.OWNER_ID";
            sql += " ,SP.OWNER_ID";
            sql += " ,BLS.PROMO_ID";
            sql += " ,BLS.PROMO_NAME";
            sql += " ,BLS.PROMO_TYPE";
            sql += " ,BLS.FREQUENCY";
            sql += " FROM BONUS_LIST_BY_SKU BLS";
            sql += " INNER JOIN SKU_PRESALE SP ";
            sql += " ON (SP.SKU = BLS.CODE_SKU_BONUS)";
            sql += " WHERE BLS.BONUS_LIST_ID = " + cliente.bonusListId;
            sql += " AND BLS.CODE_SKU = '" + sku.sku + "'";
            sql += " ORDER BY BLS.LOW_LIMIT";
            tx.executeSql(sql, [], function (tx, results) {
                var listaDeBonos = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var bonoSql = results.rows.item(i);
                    var bono = new Bono();
                    bono.bonusListId = bonoSql.BONUS_LIST_ID;
                    bono.codeSku = bonoSql.CODE_SKU;
                    bono.codePackUnit = bonoSql.CODE_PACK_UNIT;
                    bono.lowLimitTemp = bonoSql.LOW_LIMIT;
                    bono.highLimitTemp = bonoSql.HIGH_LIMIT;
                    bono.codeSkuBonus = bonoSql.CODE_SKU_BONUS;
                    bono.descriptionSkuBonues = bonoSql.SKU_NAME;
                    bono.bonusQtyTemp = bonoSql.BONUS_QTY;
                    bono.codePackUnitBonues = bonoSql.CODE_PACK_UNIT_BONUES;
                    bono.owner = bonoSql.OWNER;
                    bono.ownerId = bonoSql.OWNER_ID;
                    bono.promoIdScale = bonoSql.PROMO_ID;
                    bono.promoNameScale = bonoSql.PROMO_NAME;
                    bono.promoTypeScale = bonoSql.PROMO_TYPE;
                    bono.frequencyScale = bonoSql.FREQUENCY;
                    listaDeBonos.push(bono);
                }
                if (indiceDeListaSku >= 0) {
                    callback(listaDeBonos, indiceDeListaSku, listaDeSkuDeBonificacion);
                }
                else {
                    callback(listaDeBonos);
                }
            });
        }, function (err) {
            if (indiceDeListaSku >= 0) {
                callbackError({ codigo: -1, mensaje: "Error al obtener el bonificaciones: " + err.message }, indiceDeListaSku, listaDeSkuDeBonificacion);
            }
            else {
                callbackError({ codigo: -1, mensaje: "Error al obtener el bonificaciones: " + err.message });
            }
        });
    };
    BonoServicio.prototype.obtenerListaDeSkuParaBonoficaciones = function (cliente, listaDeSku, callback, callbackError) {
        try {
            this.recorrerListaDeSkuParaBonificacion(0, listaDeSku, cliente, new Array(), function (listaDeSkuDeBonificacion) {
                callback(listaDeSkuDeBonificacion);
            });
        }
        catch (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener lista de sku para bonificaciones: " + err.message });
        }
    };
    BonoServicio.prototype.recorrerListaDeSkuParaBonificacion = function (indiceDeListaDeSku, listaDeSku, cliente, listaDeSkuDeBonificacion, callback) {
        var _this = this;
        if (indiceDeListaDeSku < listaDeSku.length) {
            this.obtenerBonificacionPorEscalaPorCliente(cliente, listaDeSku[indiceDeListaDeSku], function (listaDeBonos, indiceDeListaSku, listaDeSkuDeBonificacion) {
                var encontroBonificacion = false;
                for (var i = 0; i < listaDeBonos.length; i++) {
                    var bonificacion = listaDeBonos[i];
                    if (listaDeSku[indiceDeListaDeSku].codePackUnit === bonificacion.codePackUnit && (bonificacion.lowLimitTemp <= listaDeSku[indiceDeListaDeSku].qty && listaDeSku[indiceDeListaDeSku].qty <= bonificacion.highLimitTemp)) {
                        var skuBonificacion = new Sku();
                        skuBonificacion.sku = bonificacion.codeSkuBonus;
                        skuBonificacion.skuDescription = bonificacion.descriptionSkuBonues;
                        skuBonificacion.skuName = bonificacion.descriptionSkuBonues;
                        skuBonificacion.qty = bonificacion.bonusQtyTemp;
                        skuBonificacion.codePackUnit = bonificacion.codePackUnitBonues;
                        skuBonificacion.parentCodeSku = listaDeSku[indiceDeListaDeSku].sku;
                        skuBonificacion.parentCodePackUnit = listaDeSku[indiceDeListaDeSku].codePackUnit;
                        listaDeSkuDeBonificacion.push(skuBonificacion);
                        encontroBonificacion = true;
                        _this.recorrerListaDeSkuParaBonificacion((indiceDeListaDeSku + 1), listaDeSku, cliente, listaDeSkuDeBonificacion, function (listaDeSkuDeBonificacion) {
                            callback(listaDeSkuDeBonificacion);
                        });
                        break;
                    }
                }
                if (!encontroBonificacion) {
                    _this.recorrerListaDeSkuParaBonificacion((indiceDeListaDeSku + 1), listaDeSku, cliente, listaDeSkuDeBonificacion, function (listaDeSkuDeBonificacion) {
                        callback(listaDeSkuDeBonificacion);
                    });
                }
            }, function (resultado, indiceDeListaSku, listaDeSkuDeBonificacion) {
                callback(listaDeSkuDeBonificacion);
            }, indiceDeListaDeSku, listaDeSkuDeBonificacion);
        }
        else {
            callback(listaDeSkuDeBonificacion);
        }
    };
    BonoServicio.prototype.limpiarTablaDeBonificacionesPorMultiplo = function (callBack, errorCallBack) {
        var result = new Operacion();
        try {
            var sql_1 = "";
            SONDA_DB_Session.transaction(function (trans) {
                sql_1 = "DELETE FROM BONUS_LIST_BY_SKU_MULTIPLE";
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
    BonoServicio.prototype.agregarBonificacionPorMultiplo = function (bonificacion, callBack, errorCallBack) {
        var result = new Operacion();
        try {
            var sql_2 = "";
            SONDA_DB_Session.transaction(function (trans) {
                sql_2 = " INSERT INTO BONUS_LIST_BY_SKU_MULTIPLE(";
                sql_2 += " BONUS_LIST_ID";
                sql_2 += ", CODE_SKU";
                sql_2 += ", CODE_PACK_UNIT";
                sql_2 += ", MULTIPLE";
                sql_2 += ", CODE_SKU_BONUS";
                sql_2 += ", BONUS_QTY";
                sql_2 += ", CODE_PACK_UNIT_BONUES";
                sql_2 += ", PROMO_ID";
                sql_2 += ", PROMO_NAME";
                sql_2 += ", PROMO_TYPE";
                sql_2 += ")VALUES(";
                sql_2 += bonificacion.BONUS_LIST_ID;
                sql_2 += " , '" + bonificacion.CODE_SKU + "'";
                sql_2 += " , '" + bonificacion.CODE_PACK_UNIT + "'";
                sql_2 += " , " + bonificacion.MULTIPLE;
                sql_2 += " , '" + bonificacion.CODE_SKU_BONUS + "'";
                sql_2 += " , " + bonificacion.BONUS_QTY;
                sql_2 += " , '" + bonificacion.CODE_PACK_UNIT_BONUES + "'";
                sql_2 += " , " + bonificacion.PROMO_ID;
                sql_2 += " , '" + bonificacion.PROMO_NAME + "'";
                sql_2 += " , '" + bonificacion.PROMO_TYPE + "'";
                sql_2 += " )";
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
    BonoServicio.prototype.obtenerBonoPorMultiploPorCliente = function (cliente, sku, callback, callbackError) {
        var operacion = new Operacion();
        try {
            SONDA_DB_Session.transaction(function (trans) {
                var sql = "SELECT DISTINCT";
                sql += " BLS.BONUS_LIST_ID";
                sql += " ,BLS.CODE_SKU";
                sql += " ,BLS.CODE_PACK_UNIT";
                sql += " ,BLS.MULTIPLE";
                sql += " ,BLS.CODE_SKU_BONUS";
                sql += " ,BLS.BONUS_QTY";
                sql += " ,BLS.CODE_PACK_UNIT_BONUES";
                sql += " ,SP.SKU_NAME";
                sql += " ,SP.OWNER";
                sql += " ,SP.OWNER_ID";
                sql += " ,BLS.PROMO_ID";
                sql += " ,BLS.PROMO_NAME";
                sql += " ,BLS.PROMO_TYPE";
                sql += " ,BLS.FREQUENCY";
                sql += " FROM BONUS_LIST_BY_SKU_MULTIPLE BLS";
                sql += " INNER JOIN SKU_PRESALE SP ";
                sql += " ON (SP.SKU = BLS.CODE_SKU_BONUS)";
                sql += " WHERE BLS.BONUS_LIST_ID = " + cliente.bonusListId;
                sql += " AND BLS.CODE_SKU = '" + sku.sku + "'";
                sql += " ORDER BY BLS.MULTIPLE";
                console.log(sql);
                trans.executeSql(sql, [], function (tx, results) {
                    var listaDeBonos = new Array();
                    for (var i = 0; i < results.rows.length; i++) {
                        var bonoSql = results.rows.item(i);
                        var bono = new Bono();
                        bono.bonusListId = bonoSql.BONUS_LIST_ID;
                        bono.codeSku = bonoSql.CODE_SKU;
                        bono.codePackUnit = bonoSql.CODE_PACK_UNIT;
                        bono.lowLimitTemp = 0;
                        bono.highLimitTemp = 0;
                        bono.multiplo = bonoSql.MULTIPLE;
                        bono.codeSkuBonus = bonoSql.CODE_SKU_BONUS;
                        bono.descriptionSkuBonues = bonoSql.SKU_NAME;
                        bono.bonusQtyTemp = 0;
                        bono.bonusQtyMultiplo = bonoSql.BONUS_QTY;
                        bono.codePackUnitBonues = bonoSql.CODE_PACK_UNIT_BONUES;
                        bono.owner = bonoSql.OWNER;
                        bono.ownerId = bonoSql.OWNER_ID;
                        bono.promoIdMultiple = bonoSql.PROMO_ID;
                        bono.promoNameMultiple = bonoSql.PROMO_NAME;
                        bono.promoTypeMultiple = bonoSql.PROMO_TYPE;
                        bono.frequencyMultiple = bonoSql.FREQUENCY;
                        listaDeBonos.push(bono);
                    }
                    callback(listaDeBonos);
                });
            }, function (error) {
                operacion.codigo = -1;
                operacion.mensaje = error.message;
                console.log(operacion);
                callbackError(operacion);
            });
        }
        catch (e) {
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            callbackError(operacion);
        }
    };
    BonoServicio.prototype.obtenerBonificacionesPorCombo = function (bonoPorCombos, listaDeSku, callback, callbackError) {
        try {
            var bonificacionPorCombosEnListaDeSkus_1 = [];
            bonoPorCombos.map(function (bono) {
                var cantidadTotalDeProductosVendidos = 0;
                var listaDeSkuEnCombo = [];
                var cantidadQueConcuerdan = 0;
                bono.skusPorCombo.map(function (skuDeCombo) {
                    listaDeSku.map(function (skuDeVenta) {
                        if (skuDeCombo.codeSku === skuDeVenta.sku && skuDeCombo.codePackUnit === skuDeVenta.codePackUnit && skuDeVenta.qty > 0) {
                            cantidadTotalDeProductosVendidos += skuDeVenta.qty;
                            listaDeSkuEnCombo.push(skuDeVenta);
                        }
                    });
                });
                if (bono.isBonusByLowPurchase === SiNo.Si && cantidadTotalDeProductosVendidos >= bono.lowQty) {
                    var residuo = cantidadTotalDeProductosVendidos % bono.lowQty;
                    var cantidadDeVecesDelCombo_1 = (cantidadTotalDeProductosVendidos - residuo) / bono.lowQty;
                    bono.skusDeBonoPorCombo.map(function (skuDeBono) {
                        if (skuDeBono.isMultiple) {
                            skuDeBono.qty = (skuDeBono.originalQty * cantidadDeVecesDelCombo_1);
                        }
                    });
                    bonificacionPorCombosEnListaDeSkus_1.push(bono);
                }
                else {
                    if (bono.isBonusByCombo === SiNo.Si && listaDeSkuEnCombo.length > 0) {
                        var cantidadDeVecesDelCombo_2 = 0;
                        var clasificaAlCombo_1 = true;
                        bono.skusPorCombo.map(function (skuDeCombo) {
                            listaDeSku.map(function (skuDeVenta) {
                                if (clasificaAlCombo_1 && skuDeCombo.codeSku === skuDeVenta.sku && skuDeCombo.codePackUnit === skuDeVenta.codePackUnit) {
                                    if (skuDeVenta.qty < skuDeCombo.qty) {
                                        clasificaAlCombo_1 = false;
                                    }
                                    else {
                                        cantidadQueConcuerdan++;
                                        var residuo = skuDeVenta.qty % skuDeCombo.qty;
                                        var cantidadDeVecesDelComboPorProducto = (skuDeVenta.qty - residuo) / skuDeCombo.qty;
                                        if (cantidadDeVecesDelCombo_2 === 0 || cantidadDeVecesDelComboPorProducto < cantidadDeVecesDelCombo_2) {
                                            cantidadDeVecesDelCombo_2 = cantidadDeVecesDelComboPorProducto;
                                        }
                                    }
                                }
                            });
                        });
                        if (clasificaAlCombo_1 && cantidadQueConcuerdan === bono.skusPorCombo.length) {
                            bono.skusDeBonoPorCombo.map(function (bonoDeCombo) {
                                if (bonoDeCombo.isMultiple) {
                                    bonoDeCombo.qty = (bonoDeCombo.originalQty * cantidadDeVecesDelCombo_2);
                                }
                            });
                            bonificacionPorCombosEnListaDeSkus_1.push(bono);
                        }
                    }
                }
            });
            callback(bonificacionPorCombosEnListaDeSkus_1);
        }
        catch (e) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            callbackError(operacion);
        }
    };
    BonoServicio.prototype.validarSiModificaBonificacionPorCombo = function (callback, errCallback) {
        try {
            this.tareaServicio.obtenerRegla("ModificacionDeBonificacionDeComboEnMovil", function (listaDeReglas) {
                if (listaDeReglas.length >= 1) {
                    if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                }
                else {
                    callback(false);
                }
            }, function (resultado) {
                errCallback(resultado);
            });
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = err.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    };
    BonoServicio.prototype.insertParaBonificacionesNormalesAlDraft = function (id, codigoDeRuta, cliente, bonosNormales, bonosPorCombo, callback, errCallback) {
        try {
            SONDA_DB_Session.transaction(function (trans) {
                var insert = "";
                bonosNormales.map(function (sku, index, array) {
                    insert = "INSERT INTO BONUS_DRAFT (\n                        id\n                        ,codeRoute\n                        ,clientId\n                        ,typeBonus\n                        ,sku\n                        ,codePackUnit\n                        ,skuName\n                        ,skuDescription\n                        ,qty\n                        ,parentCodeSku\n                        ,parentCodePackUnit\n                        ,skuPrice\n                        ,discount\n                        ,multipleSaleQty\n                        ,isSaleByMultiple\n                        ,owner\n                        ,ownerId\n                    ) VALUES (\n                        " + id + "\n                        ,'" + codigoDeRuta + "'\n                        ,'" + cliente.clientId + "'\n                        ,'BONUS_BY_SCALE'\n                        ,'" + sku.sku + "'\n                        ,'" + sku.codePackUnit + "'\n                        ,'" + sku.skuName + "'\n                        ,'" + sku.skuDescription + "'\n                        ," + sku.qty + "\n                        ,'" + sku.parentCodeSku + "'\n                        ,'" + sku.parentCodePackUnit + "'\n                        ," + sku.skuPrice + "\n                        ," + sku.discount + "\n                        ," + sku.multipleSaleQty + "\n                        ,'" + (sku.isSaleByMultiple ? 1 : 0) + "'\n                        ,'" + sku.owner + "'\n                        ,'" + sku.ownerId + "'\n                    );";
                    trans.executeSql(insert);
                });
                callback(bonosNormales, bonosPorCombo);
            }, function (err) {
                var operacion = new Operacion();
                operacion.codigo = -1;
                operacion.mensaje = err.message;
                errCallback(operacion);
            });
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = err.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    };
    BonoServicio.prototype.insertParaBonificacionesPorComboAlDraft = function (id, codigoDeRuta, cliente, bonosNormales, bonosPorCombo, callback, errCallback) {
        try {
            SONDA_DB_Session.transaction(function (trans) {
                var insert = "";
                bonosPorCombo.map(function (bono, index, array) {
                    if (!bono.isEmpty) {
                        bono.skusDeBonoPorComboAsociados.map(function (sku) {
                            insert = "INSERT INTO BONUS_DRAFT (\n                        id\n                        ,codeRoute\n                        ,clientId\n                        ,typeBonus\n                        ,sku\n                        ,codePackUnit\n                        ,skuName\n                        ,skuDescription\n                        ,qty\n                        ,parentCodeSku\n                        ,parentCodePackUnit\n                        ,skuPrice\n                        ,discount\n                        ,multipleSaleQty\n                        ,isSaleByMultiple\n                        ,owner\n                        ,ownerId\n                    ) VALUES (\n                        " + id + "\n                        ,'" + codigoDeRuta + "'\n                        ,'" + cliente.clientId + "'\n                        ,'BONUS_BY_SCALE'\n                        ,'" + sku.codeSku + "'\n                        ,'" + sku.codePackUnit + "'\n                        ,'" + sku.descriptionSku + "'\n                        ,'" + sku.descriptionSku + "'\n                        ,'" + sku.selectedQty + "'\n                        ,'" + sku.codeSku + "'\n                        ,'" + sku.codePackUnit + "'\n                        ,0.00\n                        ,0.00\n                        ,0\n                        ,0\n                        ,'" + sku.owner + "'\n                        ,'" + sku.ownerId + "'\n                    );";
                            trans.executeSql(insert);
                        });
                    }
                });
                callback(bonosNormales, bonosPorCombo);
            }, function (err) {
                var operacion = new Operacion();
                operacion.codigo = -1;
                operacion.mensaje = err.message;
                errCallback(operacion);
            });
        }
        catch (err) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = err.message;
            errCallback(operacion);
        }
    };
    BonoServicio.prototype.obtnerBonificacionUnida = function (id, callback, errCallback) {
        var operacion = new Operacion();
        try {
            SONDA_DB_Session.transaction(function (trans) {
                var sql = "SELECT\n                            [B].sku\n                            ,[B].codePackUnit\n                            ,MAX([B].skuName) skuName\n                            ,MAX([B].skuDescription) skuDescription\n                            ,SUM([B].qty) qty\n                            ,MAX([B].parentCodeSku) parentCodeSku\n                            ,MAX([B].parentCodePackUnit) parentCodePackUnit\n                            ,MAX([B].skuPrice) skuPrice\n                            ,MAX([B].discount) discount\n                            ,MAX([B].multipleSaleQty) multipleSaleQty\n                            ,MAX([B].isSaleByMultiple) isSaleByMultiple\n                            ,MAX([B].owner) owner\n                            ,MAX([B].ownerId) ownerId\n                          FROM BONUS_DRAFT [B]\n                          WHERE [B].id = " + id + "\n                          GROUP BY [B].sku, [B].codePackUnit\n                          ORDER BY [B].sku, [B].codePackUnit\n                        ";
                trans.executeSql(sql, [], function (tx, results) {
                    var bonosFinales = new Array();
                    for (var i = 0; i < results.rows.length; i++) {
                        var bonoSql = results.rows.item(i);
                        bonosFinales.push(new Sku(bonoSql));
                    }
                    callback(bonosFinales);
                });
            }, function (error) {
                operacion.codigo = -1;
                operacion.mensaje = error.message;
                console.log(operacion);
                errCallback(operacion);
            });
        }
        catch (e) {
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    };
    BonoServicio.prototype.unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo = function (id, codigoDeRuta, cliente, bonosNormales, bonosPorCombo, callback, errCallback) {
        var _this = this;
        this.insertParaBonificacionesNormalesAlDraft(id, codigoDeRuta, cliente, bonosNormales, bonosPorCombo, function (bonosNormalesN1, bonosPorComboN1) {
            _this.insertParaBonificacionesPorComboAlDraft(id, codigoDeRuta, cliente, bonosNormalesN1, bonosPorComboN1, function (bonosNormalesN2, bonosPorComboN2) {
                _this.obtnerBonificacionUnida(id, function (bonosFinales) {
                    callback(bonosFinales);
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
    BonoServicio.prototype.obtenerBorradoresDeBonificacion = function (callback, errorCallback) {
        try {
            SONDA_DB_Session.transaction(function (trans) {
                var sql = "";
                sql = "SELECT * FROM BONUS_DRAFT";
                trans.executeSql(sql, [], function (transReturn, results) {
                    var borradoresDeBonificacion = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        borradoresDeBonificacion.push(results.rows.item(i));
                    }
                    callback(borradoresDeBonificacion);
                }, function (transReturn, error) {
                    errorCallback({ codigo: error.code, resultado: ResultadoOperacionTipo.Error, mensaje: error.message });
                });
            }, function (error) {
                errorCallback({ codigo: error.code, resultado: ResultadoOperacionTipo.Error, mensaje: error.message });
            });
        }
        catch (e) {
            errorCallback({ codigo: -1, resultado: ResultadoOperacionTipo.Error, mensaje: e.message });
        }
    };
    BonoServicio.prototype.obtenerBonificacionPorMontoGeneral = function (cliente, total, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaDeLi = [];
            listaDeLi.push("SELECT DISTINCT");
            listaDeLi.push(" BLGA.BONUS_LIST_ID");
            listaDeLi.push(" ,BLGA.LOW_LIMIT");
            listaDeLi.push(" ,BLGA.HIGH_LIMIT");
            listaDeLi.push(" ,BLGA.CODE_SKU_BONUS");
            listaDeLi.push(" ,PU.CODE_PACK_UNIT CODE_PACK_UNIT_BONUS");
            listaDeLi.push(" ,BLGA.BONUS_QTY");
            listaDeLi.push(" ,BLGA.PROMO_ID");
            listaDeLi.push(" ,BLGA.PROMO_NAME");
            listaDeLi.push(" ,BLGA.PROMO_TYPE");
            listaDeLi.push(" ,SP.SKU_NAME");
            listaDeLi.push(" ,SP.OWNER");
            listaDeLi.push(" ,SP.OWNER_ID");
            listaDeLi.push(" ,BLGA.FREQUENCY");
            listaDeLi.push(" FROM BONUS_LIST_BY_GENERAL_AMOUNT BLGA");
            listaDeLi.push(" INNER JOIN SKU_PRESALE SP ");
            listaDeLi.push(" ON (SP.SKU = BLGA.CODE_SKU_BONUS)");
            listaDeLi.push(" INNER JOIN PACK_UNIT PU ");
            listaDeLi.push(" ON (PU.PACK_UNIT = BLGA.CODE_PACK_UNIT_BONUS)");
            listaDeLi.push(" WHERE BLGA.BONUS_LIST_ID = " + cliente.bonusListId);
            listaDeLi.push(" AND " + total + " BETWEEN BLGA.LOW_LIMIT AND BLGA.HIGH_LIMIT");
            tx.executeSql(listaDeLi.join(''), [], function (tx, results) {
                var listaDeBonificacionesPorMontoGeneral = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var bonoPorMontoGeneral = new BonoPorMontoGeneral();
                    bonoPorMontoGeneral.bonusListId = descuentoSql.BONUS_LIST_ID;
                    bonoPorMontoGeneral.lowLimit = descuentoSql.LOW_LIMIT;
                    bonoPorMontoGeneral.highLimit = descuentoSql.HIGH_LIMIT;
                    bonoPorMontoGeneral.codeSkuBonus = descuentoSql.CODE_SKU_BONUS;
                    bonoPorMontoGeneral.codePackUnitBonus = descuentoSql.CODE_PACK_UNIT_BONUS;
                    bonoPorMontoGeneral.bonusQty = descuentoSql.BONUS_QTY;
                    bonoPorMontoGeneral.promoId = descuentoSql.PROMO_ID;
                    bonoPorMontoGeneral.promoName = descuentoSql.PROMO_NAME;
                    bonoPorMontoGeneral.promoType = descuentoSql.PROMO_TYPE;
                    bonoPorMontoGeneral.skuNameBonus = descuentoSql.SKU_NAME;
                    bonoPorMontoGeneral.owner = descuentoSql.OWNER;
                    bonoPorMontoGeneral.ownerId = descuentoSql.OWNER_ID;
                    bonoPorMontoGeneral.frequency = descuentoSql.FREQUENCY;
                    listaDeBonificacionesPorMontoGeneral.push(bonoPorMontoGeneral);
                    descuentoSql = null;
                    bonoPorMontoGeneral = null;
                }
                callback(listaDeBonificacionesPorMontoGeneral);
                listaDeBonificacionesPorMontoGeneral = null;
            });
        }, function (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener las bonificaciones por monto general: " + err.message });
        });
    };
    BonoServicio.prototype.obtenerBonificacionPorMontoGeneralPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var listaDeLi = [];
            listaDeLi.push("SELECT DISTINCT");
            listaDeLi.push(" BLGA.BONUS_LIST_ID");
            listaDeLi.push(" ,BLGA.LOW_LIMIT");
            listaDeLi.push(" ,BLGA.HIGH_LIMIT");
            listaDeLi.push(" ,BLGA.CODE_SKU_BONUS");
            listaDeLi.push(" ,PU.CODE_PACK_UNIT CODE_PACK_UNIT_BONUS");
            listaDeLi.push(" ,BLGA.BONUS_QTY");
            listaDeLi.push(" ,BLGA.PROMO_ID");
            listaDeLi.push(" ,BLGA.PROMO_NAME");
            listaDeLi.push(" ,BLGA.PROMO_TYPE");
            listaDeLi.push(" ,SP.SKU_NAME");
            listaDeLi.push(" ,SP.OWNER");
            listaDeLi.push(" ,SP.OWNER_ID");
            listaDeLi.push(" ,BLGA.FREQUENCY");
            listaDeLi.push(" FROM BONUS_LIST_BY_GENERAL_AMOUNT BLGA");
            listaDeLi.push(" INNER JOIN SKU_PRESALE SP ");
            listaDeLi.push(" ON (SP.SKU = BLGA.CODE_SKU_BONUS)");
            listaDeLi.push(" INNER JOIN PACK_UNIT PU ");
            listaDeLi.push(" ON (PU.PACK_UNIT = BLGA.CODE_PACK_UNIT_BONUS)");
            listaDeLi.push(" WHERE BLGA.BONUS_LIST_ID = " + cliente.bonusListId);
            tx.executeSql(listaDeLi.join(''), [], function (tx, results) {
                var listaDeBonificacionesPorMontoGeneral = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var descuentoSql = results.rows.item(i);
                    var bonoPorMontoGeneral = new BonoPorMontoGeneral();
                    bonoPorMontoGeneral.bonusListId = descuentoSql.BONUS_LIST_ID;
                    bonoPorMontoGeneral.lowLimit = descuentoSql.LOW_LIMIT;
                    bonoPorMontoGeneral.highLimit = descuentoSql.HIGH_LIMIT;
                    bonoPorMontoGeneral.codeSkuBonus = descuentoSql.CODE_SKU_BONUS;
                    bonoPorMontoGeneral.codePackUnitBonus = descuentoSql.CODE_PACK_UNIT_BONUS;
                    bonoPorMontoGeneral.bonusQty = descuentoSql.BONUS_QTY;
                    bonoPorMontoGeneral.promoId = descuentoSql.PROMO_ID;
                    bonoPorMontoGeneral.promoName = descuentoSql.PROMO_NAME;
                    bonoPorMontoGeneral.promoType = descuentoSql.PROMO_TYPE;
                    bonoPorMontoGeneral.skuNameBonus = descuentoSql.SKU_NAME;
                    bonoPorMontoGeneral.owner = descuentoSql.OWNER;
                    bonoPorMontoGeneral.ownerId = descuentoSql.OWNER_ID;
                    bonoPorMontoGeneral.frequency = descuentoSql.FREQUENCY;
                    listaDeBonificacionesPorMontoGeneral.push(bonoPorMontoGeneral);
                    descuentoSql = null;
                    bonoPorMontoGeneral = null;
                }
                callback(listaDeBonificacionesPorMontoGeneral);
                listaDeBonificacionesPorMontoGeneral = null;
            });
        }, function (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener las bonificaciones por monto general: " + err.message });
        });
    };
    BonoServicio.prototype.obtenerTodasLasBonificacionPorEscalaPorCliente = function (cliente, callback, callbackError) {
        SONDA_DB_Session.transaction(function (tx) {
            var sql = "SELECT DISTINCT";
            sql += " BLS.BONUS_LIST_ID";
            sql += " ,BLS.CODE_SKU";
            sql += " ,BLS.CODE_PACK_UNIT";
            sql += " ,BLS.LOW_LIMIT";
            sql += " ,BLS.HIGH_LIMIT";
            sql += " ,BLS.CODE_SKU_BONUS";
            sql += " ,BLS.BONUS_QTY";
            sql += " ,BLS.CODE_PACK_UNIT_BONUES";
            sql += " ,SP.SKU_NAME";
            sql += " ,SP.OWNER";
            sql += " ,SP.OWNER_ID";
            sql += " ,SP.OWNER_ID";
            sql += " ,BLS.PROMO_ID";
            sql += " ,BLS.PROMO_NAME";
            sql += " ,BLS.PROMO_TYPE";
            sql += " ,BLS.FREQUENCY";
            sql += " FROM BONUS_LIST_BY_SKU BLS";
            sql += " INNER JOIN SKU_PRESALE SP ";
            sql += " ON (SP.SKU = BLS.CODE_SKU_BONUS)";
            sql += " WHERE BLS.BONUS_LIST_ID = " + cliente.bonusListId;
            sql += " ORDER BY BLS.LOW_LIMIT";
            tx.executeSql(sql, [], function (tx, results) {
                var listaDeBonos = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var bonoSql = results.rows.item(i);
                    var bono = new Bono();
                    bono.bonusListId = bonoSql.BONUS_LIST_ID;
                    bono.codeSku = bonoSql.CODE_SKU;
                    bono.codePackUnit = bonoSql.CODE_PACK_UNIT;
                    bono.lowLimitTemp = bonoSql.LOW_LIMIT;
                    bono.highLimitTemp = bonoSql.HIGH_LIMIT;
                    bono.codeSkuBonus = bonoSql.CODE_SKU_BONUS;
                    bono.descriptionSkuBonues = bonoSql.SKU_NAME;
                    bono.bonusQtyTemp = bonoSql.BONUS_QTY;
                    bono.codePackUnitBonues = bonoSql.CODE_PACK_UNIT_BONUES;
                    bono.owner = bonoSql.OWNER;
                    bono.ownerId = bonoSql.OWNER_ID;
                    bono.promoIdScale = bonoSql.PROMO_ID;
                    bono.promoNameScale = bonoSql.PROMO_NAME;
                    bono.promoTypeScale = bonoSql.PROMO_TYPE;
                    bono.frequencyScale = bonoSql.FREQUENCY;
                    listaDeBonos.push(bono);
                }
                callback(listaDeBonos);
            });
        }, function (err) {
            callbackError({ codigo: -1, mensaje: "Error al obtener el bonificaciones: " + err.message });
        });
    };
    BonoServicio.prototype.obtenerTodasLasBonificacionesDeMultiploPorCliente = function (cliente, callback, callbackError) {
        var operacion = new Operacion();
        try {
            SONDA_DB_Session.transaction(function (trans) {
                var sql = "SELECT DISTINCT";
                sql += " BLS.BONUS_LIST_ID";
                sql += " ,BLS.CODE_SKU";
                sql += " ,BLS.CODE_PACK_UNIT";
                sql += " ,BLS.MULTIPLE";
                sql += " ,BLS.CODE_SKU_BONUS";
                sql += " ,BLS.BONUS_QTY";
                sql += " ,BLS.CODE_PACK_UNIT_BONUES";
                sql += " ,SP.SKU_NAME";
                sql += " ,SP.OWNER";
                sql += " ,SP.OWNER_ID";
                sql += " ,BLS.PROMO_ID";
                sql += " ,BLS.PROMO_NAME";
                sql += " ,BLS.PROMO_TYPE";
                sql += " ,BLS.FREQUENCY";
                sql += " FROM BONUS_LIST_BY_SKU_MULTIPLE BLS";
                sql += " INNER JOIN SKU_PRESALE SP ";
                sql += " ON (SP.SKU = BLS.CODE_SKU_BONUS)";
                sql += " WHERE BLS.BONUS_LIST_ID = " + cliente.bonusListId;
                sql += " ORDER BY BLS.MULTIPLE";
                console.log(sql);
                trans.executeSql(sql, [], function (tx, results) {
                    var listaDeBonos = new Array();
                    for (var i = 0; i < results.rows.length; i++) {
                        var bonoSql = results.rows.item(i);
                        var bono = new Bono();
                        bono.bonusListId = bonoSql.BONUS_LIST_ID;
                        bono.codeSku = bonoSql.CODE_SKU;
                        bono.codePackUnit = bonoSql.CODE_PACK_UNIT;
                        bono.lowLimitTemp = 0;
                        bono.highLimitTemp = 0;
                        bono.multiplo = bonoSql.MULTIPLE;
                        bono.codeSkuBonus = bonoSql.CODE_SKU_BONUS;
                        bono.descriptionSkuBonues = bonoSql.SKU_NAME;
                        bono.bonusQtyTemp = 0;
                        bono.bonusQtyMultiplo = bonoSql.BONUS_QTY;
                        bono.codePackUnitBonues = bonoSql.CODE_PACK_UNIT_BONUES;
                        bono.owner = bonoSql.OWNER;
                        bono.ownerId = bonoSql.OWNER_ID;
                        bono.promoIdMultiple = bonoSql.PROMO_ID;
                        bono.promoNameMultiple = bonoSql.PROMO_NAME;
                        bono.promoTypeMultiple = bonoSql.PROMO_TYPE;
                        bono.frequencyMultiple = bonoSql.FREQUENCY;
                        listaDeBonos.push(bono);
                    }
                    callback(listaDeBonos);
                });
            }, function (error) {
                operacion.codigo = -1;
                operacion.mensaje = error.message;
                console.log(operacion);
                callbackError(operacion);
            });
        }
        catch (e) {
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            callbackError(operacion);
        }
    };
    return BonoServicio;
}());
//# sourceMappingURL=BonoServicio.js.map