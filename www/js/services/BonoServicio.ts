class BonoServicio implements IBonoServicio {

    tareaServicio = new TareaServcio();

    obtenerBonificacionPorEscalaPorCliente(cliente: Cliente, sku: Sku, callback: (listaDeBonos: Array<Bono>, indiceDeListaSku?: number, listaDeSkuDeBonificacion?: Array<Sku>) => void, callbackError: (resultado: Operacion, indiceDeListaSku?: number, listaDeSkuDeBonificacion?: Array<Sku>) => void, indiceDeListaSku?: number, listaDeSkuDeBonificacion?: Array<Sku>) {
        SONDA_DB_Session.transaction(
            (tx) => {
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
                sql += " ON (SP.SKU = BLS.CODE_SKU)";
                sql += " WHERE BLS.BONUS_LIST_ID = " + cliente.bonusListId;
                sql += " AND BLS.CODE_SKU = '" + sku.sku + "'";
                sql += " ORDER BY BLS.LOW_LIMIT";
                tx.executeSql(sql, [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        let listaDeBonos = new Array<Bono>();
                        for (var i = 0; i < results.rows.length; i++) {
                            let bonoSql: any = results.rows.item(i);
                            let bono = new Bono();
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
                        } else {
                            callback(listaDeBonos);
                        }
                    }
                );

            }, (err: SqlError) => {
                if (indiceDeListaSku >= 0) {
                    callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener el bonificaciones: " + err.message }, indiceDeListaSku, listaDeSkuDeBonificacion);
                } else {
                    callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener el bonificaciones: " + err.message });
                }
            }
        );
    }

    obtenerListaDeSkuParaBonoficaciones(cliente: Cliente, listaDeSku: Array<Sku>, callback: (listaDeSkuParaBonificaciones: Array<Sku>) => void, callbackError: (resultado: Operacion) => void) {
        try {
            this.recorrerListaDeSkuParaBonificacion(0, listaDeSku, cliente, new Array<Sku>(), (listaDeSkuDeBonificacion: Array<Sku>) => {
                callback(listaDeSkuDeBonificacion);
            });
        } catch (err) {
            callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener lista de sku para bonificaciones: " + err.message });
        }
    }

    recorrerListaDeSkuParaBonificacion(indiceDeListaDeSku: number, listaDeSku: Array<Sku>, cliente: Cliente, listaDeSkuDeBonificacion: Array<Sku>, callback: (listaDeSkuDeBonificacion: Array<Sku>) => void) {

        if (indiceDeListaDeSku < listaDeSku.length) {
            this.obtenerBonificacionPorEscalaPorCliente(cliente, listaDeSku[indiceDeListaDeSku], (listaDeBonos: Array<Bono>, indiceDeListaSku: number, listaDeSkuDeBonificacion: Array<Sku>) => {
                let encontroBonificacion: boolean = false;
                for (let i = 0; i < listaDeBonos.length; i++) {
                    let bonificacion: Bono = listaDeBonos[i];
                    if (listaDeSku[indiceDeListaDeSku].codePackUnit === bonificacion.codePackUnit && (bonificacion.lowLimitTemp <= listaDeSku[indiceDeListaDeSku].qty && listaDeSku[indiceDeListaDeSku].qty <= bonificacion.highLimitTemp)) {
                        let skuBonificacion = new Sku();
                        skuBonificacion.sku = bonificacion.codeSkuBonus;
                        skuBonificacion.skuDescription = bonificacion.descriptionSkuBonues;
                        skuBonificacion.skuName = bonificacion.descriptionSkuBonues;
                        skuBonificacion.qty = bonificacion.bonusQtyTemp;
                        skuBonificacion.codePackUnit = bonificacion.codePackUnitBonues;
                        skuBonificacion.parentCodeSku = listaDeSku[indiceDeListaDeSku].sku;
                        skuBonificacion.parentCodePackUnit = listaDeSku[indiceDeListaDeSku].codePackUnit;
                        listaDeSkuDeBonificacion.push(skuBonificacion);
                        encontroBonificacion = true;
                        this.recorrerListaDeSkuParaBonificacion((indiceDeListaDeSku + 1), listaDeSku, cliente, listaDeSkuDeBonificacion, (listaDeSkuDeBonificacion: Array<Sku>) => {
                            callback(listaDeSkuDeBonificacion);
                        });
                        break;
                    }
                }
                if (!encontroBonificacion) {
                    this.recorrerListaDeSkuParaBonificacion((indiceDeListaDeSku + 1), listaDeSku, cliente, listaDeSkuDeBonificacion, (listaDeSkuDeBonificacion: Array<Sku>) => {
                        callback(listaDeSkuDeBonificacion);
                    });
                }
            }, (resultado: Operacion, indiceDeListaSku, listaDeSkuDeBonificacion) => {
                callback(listaDeSkuDeBonificacion);
            }, indiceDeListaDeSku, listaDeSkuDeBonificacion);
        } else {
            callback(listaDeSkuDeBonificacion);
        }
    }

    limpiarTablaDeBonificacionesPorMultiplo(callBack: () => void, errorCallBack: (resultado: Operacion) => void) {
        const result = new Operacion();
        try {
            let sql = "";
            SONDA_DB_Session.transaction((trans) => {
                sql = "DELETE FROM BONUS_LIST_BY_SKU_MULTIPLE";
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

    agregarBonificacionPorMultiplo(bonificacion: any, callBack: () => void, errorCallBack: (resultado: Operacion) => void) {
        const result = new Operacion();
        try {
            let sql = "";
            SONDA_DB_Session.transaction((trans) => {
                sql = " INSERT INTO BONUS_LIST_BY_SKU_MULTIPLE(";
                sql += " BONUS_LIST_ID";
                sql += ", CODE_SKU";
                sql += ", CODE_PACK_UNIT";
                sql += ", MULTIPLE";
                sql += ", CODE_SKU_BONUS";
                sql += ", BONUS_QTY";
                sql += ", CODE_PACK_UNIT_BONUES";
                sql += ", PROMO_ID";
                sql += ", PROMO_NAME";
                sql += ", PROMO_TYPE";
                sql += ")VALUES(";
                sql += bonificacion.BONUS_LIST_ID;
                sql += " , '" + bonificacion.CODE_SKU + "'";
                sql += " , '" + bonificacion.CODE_PACK_UNIT + "'";
                sql += " , " + bonificacion.MULTIPLE;
                sql += " , '" + bonificacion.CODE_SKU_BONUS + "'";
                sql += " , " + bonificacion.BONUS_QTY;
                sql += " , '" + bonificacion.CODE_PACK_UNIT_BONUES + "'";
                sql += " , " + bonificacion.PROMO_ID;
                sql += " , '" + bonificacion.PROMO_NAME + "'";
                sql += " , '" + bonificacion.PROMO_TYPE + "'";
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

    obtenerBonoPorMultiploPorCliente(
        cliente: Cliente
        , sku: Sku
        , callback: (listaDeBonos: Array<Bono>) => void
        , callbackError: (resultado: Operacion) => void
    ): void {

        const operacion = new Operacion();
        try {

            SONDA_DB_Session.transaction((trans) => {
                let sql = "SELECT DISTINCT";
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
                sql += " ON (SP.SKU = BLS.CODE_SKU)";
                sql += ` WHERE BLS.BONUS_LIST_ID = ${cliente.bonusListId}`;
                sql += ` AND BLS.CODE_SKU = '${sku.sku}'`;
                sql += " ORDER BY BLS.MULTIPLE";

                console.log(sql);
                trans.executeSql(sql, [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        const listaDeBonos = new Array<Bono>();
                        for (let i = 0; i < results.rows.length; i++) {
                            const bonoSql: any = results.rows.item(i);
                            const bono = new Bono();
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
                    }
                );

            }, (error: SqlError) => {
                operacion.codigo = -1;
                operacion.mensaje = error.message;
                console.log(operacion);
                callbackError(operacion);
            });
        } catch (e) {
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            callbackError(operacion);
        }
    }

    obtenerBonificacionesPorCombo(bonoPorCombos: Array<BonoPorCombo>, listaDeSku: Array<Sku>, callback: (bonificacionPorCombosEnListaDeSkus: Array<BonoPorCombo>) => void, callbackError: (resultado: Operacion) => void) {
        try {
            let bonificacionPorCombosEnListaDeSkus: Array<BonoPorCombo> = [];

            bonoPorCombos.map((bono) => {
                let cantidadTotalDeProductosVendidos: number = 0;
                let listaDeSkuEnCombo: Array<Sku> = [];
                let cantidadQueConcuerdan: number = 0;

                bono.skusPorCombo.map((skuDeCombo) => {
                    listaDeSku.map((skuDeVenta) => {
                        //console.log("-> " + skuDeCombo.codeSku + "===" + skuDeVenta.sku);
                        //console.log("-> " + skuDeCombo.codePackUnit + "===" + skuDeVenta.codePackUnit);
                        //console.log("-> " + skuDeVenta.qty);
                        if (skuDeCombo.codeSku === skuDeVenta.sku && skuDeCombo.codePackUnit === skuDeVenta.codePackUnit && skuDeVenta.qty > 0) {
                            cantidadTotalDeProductosVendidos += skuDeVenta.qty;
                            listaDeSkuEnCombo.push(skuDeVenta);
                        }
                    });
                });

                if (bono.isBonusByLowPurchase === SiNo.Si && cantidadTotalDeProductosVendidos >= bono.lowQty) {
                    let residuo: number = cantidadTotalDeProductosVendidos % bono.lowQty;
                    let cantidadDeVecesDelCombo: number = (cantidadTotalDeProductosVendidos - residuo) / bono.lowQty;

                    //console.log("---> cantidadDeVecesDelCombo: " + cantidadDeVecesDelCombo);
                    bono.skusDeBonoPorCombo.map((skuDeBono) => {
                        if (skuDeBono.isMultiple) {
                            skuDeBono.qty = (skuDeBono.originalQty * cantidadDeVecesDelCombo);
                        }
                    });
                    bonificacionPorCombosEnListaDeSkus.push(bono);
                } else {
                    if (bono.isBonusByCombo === SiNo.Si && listaDeSkuEnCombo.length > 0) {
                        let cantidadDeVecesDelCombo: number = 0;
                        let clasificaAlCombo = true;

                        bono.skusPorCombo.map((skuDeCombo) => {
                            listaDeSku.map((skuDeVenta) => {
                                //console.log("--> " + skuDeCombo.codeSku + " === " + skuDeVenta.sku);
                                //console.log("--> " + skuDeCombo.codePackUnit + " === " + skuDeVenta.codePackUnit);
                                if (clasificaAlCombo && skuDeCombo.codeSku === skuDeVenta.sku && skuDeCombo.codePackUnit === skuDeVenta.codePackUnit) {
                                    //console.log("----> " + skuDeVenta.qty + " < " + skuDeCombo.qty);
                                    if (skuDeVenta.qty < skuDeCombo.qty) {
                                        clasificaAlCombo = false;
                                        //console.log("------> No es combo");
                                    } else {
                                        cantidadQueConcuerdan++;
                                        //console.log("------> cantidadQueConcuerdan: " + cantidadQueConcuerdan);

                                        let residuo: number = skuDeVenta.qty % skuDeCombo.qty;
                                        let cantidadDeVecesDelComboPorProducto: number = (skuDeVenta.qty - residuo) / skuDeCombo.qty;
                                        //console.log("------> cantidadDeVecesDelComboPorProducto: " + cantidadDeVecesDelComboPorProducto);

                                        if (cantidadDeVecesDelCombo === 0 || cantidadDeVecesDelComboPorProducto < cantidadDeVecesDelCombo) {
                                            cantidadDeVecesDelCombo = cantidadDeVecesDelComboPorProducto;
                                        }
                                    }
                                }
                            });
                        });

                        //console.log("-> " + cantidadQueConcuerdan + " === " + bono.skusPorCombo.length);
                        if (clasificaAlCombo && cantidadQueConcuerdan === bono.skusPorCombo.length) {
                            //console.log("---> cantidadDeVecesDelCombo: " + cantidadDeVecesDelCombo);
                            bono.skusDeBonoPorCombo.map((bonoDeCombo) => {
                                if (bonoDeCombo.isMultiple) {
                                    bonoDeCombo.qty = (bonoDeCombo.originalQty * cantidadDeVecesDelCombo);
                                }
                            });

                            bonificacionPorCombosEnListaDeSkus.push(bono);
                        }
                    }
                }
            });
            callback(bonificacionPorCombosEnListaDeSkus);
        } catch (e) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            callbackError(operacion);
        }
    }

    validarSiModificaBonificacionPorCombo(callback: (puedeModificar: boolean) => void, errCallback: (resultado: Operacion) => void) {
        try {
            this.tareaServicio.obtenerRegla("ModificacionDeBonificacionDeComboEnMovil", (listaDeReglas: Regla[]) => {
                if (listaDeReglas.length >= 1) {
                    if (listaDeReglas[0].enabled.toUpperCase() === "SI") {
                        callback(true);
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            }, (resultado: Operacion) => {
                errCallback(resultado);
            });
        } catch (err) {
            var operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = err.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    }

    insertParaBonificacionesNormalesAlDraft(id: number, codigoDeRuta: string, cliente: Cliente, bonosNormales: Sku[], bonosPorCombo: BonoPorCombo[], callback: (bonosNormales: Sku[], bonosPorCombo: BonoPorCombo[]) => void,
        errCallback: (resultado: Operacion) => void): void {
        try {
            SONDA_DB_Session.transaction((trans) => {
                let insert: string = "";
                bonosNormales.map((sku, index, array) => {
                    insert = `INSERT INTO BONUS_DRAFT (
                        id
                        ,codeRoute
                        ,clientId
                        ,typeBonus
                        ,sku
                        ,codePackUnit
                        ,skuName
                        ,skuDescription
                        ,qty
                        ,parentCodeSku
                        ,parentCodePackUnit
                        ,skuPrice
                        ,discount
                        ,multipleSaleQty
                        ,isSaleByMultiple
                        ,owner
                        ,ownerId
                    ) VALUES (
                        ${id}
                        ,'${codigoDeRuta}'
                        ,'${cliente.clientId}'
                        ,'BONUS_BY_SCALE'
                        ,'${sku.sku}'
                        ,'${sku.codePackUnit}'
                        ,'${sku.skuName}'
                        ,'${sku.skuDescription}'
                        ,${sku.qty}
                        ,'${sku.parentCodeSku}'
                        ,'${sku.parentCodePackUnit}'
                        ,${sku.skuPrice}
                        ,${sku.discount}
                        ,${sku.multipleSaleQty}
                        ,'${(sku.isSaleByMultiple ? 1 : 0)}'
                        ,'${sku.owner}'
                        ,'${sku.ownerId}'
                    );`;
                    trans.executeSql(insert);
                });
                callback(bonosNormales, bonosPorCombo);
            }, (err: SqlError) => {
                let operacion = new Operacion();
                operacion.codigo = -1;
                operacion.mensaje = err.message;
                errCallback(operacion);
            });
        } catch (err) {
            let operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = err.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    }

    insertParaBonificacionesPorComboAlDraft(id: number, codigoDeRuta: string, cliente: Cliente, bonosNormales: Sku[], bonosPorCombo: BonoPorCombo[], callback: (ibonosNormales: Sku[], bonosPorCombo: BonoPorCombo[]) => void,
        errCallback: (resultado: Operacion) => void): void {
        try {
            SONDA_DB_Session.transaction((trans) => {
                let insert: string = "";
                bonosPorCombo.map((bono, index, array) => {
                    if (!bono.isEmpty) {
                        bono.skusDeBonoPorComboAsociados.map(sku => {
                            insert = `INSERT INTO BONUS_DRAFT (
                        id
                        ,codeRoute
                        ,clientId
                        ,typeBonus
                        ,sku
                        ,codePackUnit
                        ,skuName
                        ,skuDescription
                        ,qty
                        ,parentCodeSku
                        ,parentCodePackUnit
                        ,skuPrice
                        ,discount
                        ,multipleSaleQty
                        ,isSaleByMultiple
                        ,owner
                        ,ownerId
                    ) VALUES (
                        ${id}
                        ,'${codigoDeRuta}'
                        ,'${cliente.clientId}'
                        ,'BONUS_BY_SCALE'
                        ,'${sku.codeSku}'
                        ,'${sku.codePackUnit}'
                        ,'${sku.descriptionSku}'
                        ,'${sku.descriptionSku}'
                        ,'${sku.selectedQty}'
                        ,'${sku.codeSku}'
                        ,'${sku.codePackUnit}'
                        ,0.00
                        ,0.00
                        ,0
                        ,0
                        ,'${sku.owner}'
                        ,'${sku.ownerId}'
                    );`;
                            trans.executeSql(insert);
                        });
                    }
                });
                callback(bonosNormales, bonosPorCombo);
            }, (err: SqlError) => {
                let operacion = new Operacion();
                operacion.codigo = -1;
                operacion.mensaje = err.message;
                errCallback(operacion);
            });
        } catch (err) {
            let operacion = new Operacion();
            operacion.codigo = -1;
            operacion.mensaje = err.message;
            errCallback(operacion);
        }
    }

    obtnerBonificacionUnida(id: number, callback: (bonosFinales: Sku[]) => void, errCallback: (resultado: Operacion) => void): void {
        let operacion = new Operacion();
        try {
            SONDA_DB_Session.transaction((trans) => {
                let sql = `SELECT
                            [B].sku
                            ,[B].codePackUnit
                            ,MAX([B].skuName) skuName
                            ,MAX([B].skuDescription) skuDescription
                            ,SUM([B].qty) qty
                            ,MAX([B].parentCodeSku) parentCodeSku
                            ,MAX([B].parentCodePackUnit) parentCodePackUnit
                            ,MAX([B].skuPrice) skuPrice
                            ,MAX([B].discount) discount
                            ,MAX([B].multipleSaleQty) multipleSaleQty
                            ,MAX([B].isSaleByMultiple) isSaleByMultiple
                            ,MAX([B].owner) owner
                            ,MAX([B].ownerId) ownerId
                          FROM BONUS_DRAFT [B]
                          WHERE [B].id = ${id}
                          GROUP BY [B].sku, [B].codePackUnit
                          ORDER BY [B].sku, [B].codePackUnit
                        `;
                trans.executeSql(sql, [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        let bonosFinales = new Array<Sku>();
                        for (let i = 0; i < results.rows.length; i++) {
                            let bonoSql: any = results.rows.item(i);
                            bonosFinales.push(new Sku(bonoSql));
                        }
                        callback(bonosFinales);
                    }
                );

            }, (error: SqlError) => {
                operacion.codigo = -1;
                operacion.mensaje = error.message;
                console.log(operacion);
                errCallback(operacion);
            });
        } catch (e) {
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            errCallback(operacion);
        }
    }

    unirListaDeBonificaionesNormalConListaDeBonificacionPorCombo(id: number, codigoDeRuta: string, cliente: Cliente, bonosNormales: Sku[], bonosPorCombo: BonoPorCombo[], callback: (bonosFinales: Sku[]) => void, errCallback: (resultado: Operacion) => void): void {
        this.insertParaBonificacionesNormalesAlDraft(id, codigoDeRuta, cliente, bonosNormales, bonosPorCombo, (bonosNormalesN1, bonosPorComboN1) => {
            this.insertParaBonificacionesPorComboAlDraft(id, codigoDeRuta, cliente, bonosNormalesN1, bonosPorComboN1, (bonosNormalesN2, bonosPorComboN2) => {
                this.obtnerBonificacionUnida(id, (bonosFinales: Sku[]) => {
                    callback(bonosFinales);
                }, (resultado: Operacion) => {
                    errCallback(resultado);
                });
            }, (resultado: Operacion) => {
                errCallback(resultado);
            });
        }, (resultado: Operacion) => {
            errCallback(resultado);
        });
    }

    obtenerBorradoresDeBonificacion(callback: (bonificaciones) => void, errorCallback: (resultado: Operacion) => void): void {
        try {
            SONDA_DB_Session.transaction((trans: SqlTransaction) => {

                let sql: string = "";
                sql = "SELECT * FROM BONUS_DRAFT";
                trans.executeSql(sql, [], (transReturn: SqlTransaction, results: SqlResultSet) => {
                    let borradoresDeBonificacion = [];
                    for (let i = 0; i < results.rows.length; i++) {
                        borradoresDeBonificacion.push(results.rows.item(i));
                    }
                    callback(borradoresDeBonificacion);
                }, (transReturn: SqlTransaction, error: SqlError) => {
                    errorCallback({ codigo: error.code, resultado: ResultadoOperacionTipo.Error, mensaje: error.message } as Operacion);
                });

            }, (error: SqlError) => {
                errorCallback({ codigo: error.code, resultado: ResultadoOperacionTipo.Error, mensaje: error.message } as Operacion);
            });
        } catch (e) {
            errorCallback({ codigo: -1, resultado: ResultadoOperacionTipo.Error, mensaje: e.message } as Operacion);
        }
    }

    obtenerBonificacionPorMontoGeneral(cliente: Cliente, total: number, callback: (listaDeBonificacionesPorMontoGeneral: Array<BonoPorMontoGeneral>) => void, callbackError: (resultado: Operacion) => void) {
        SONDA_DB_Session.transaction(
            (tx) => {
                let listaDeLi: string[] = [];
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
                listaDeLi.push(` WHERE BLGA.BONUS_LIST_ID = ${cliente.bonusListId}`);
                listaDeLi.push(` AND ${total} BETWEEN BLGA.LOW_LIMIT AND BLGA.HIGH_LIMIT`);

                tx.executeSql(listaDeLi.join(''), [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        let listaDeBonificacionesPorMontoGeneral = new Array<BonoPorMontoGeneral>();
                        for (let i = 0; i < results.rows.length; i++) {
                            let descuentoSql: any = results.rows.item(i);
                            let bonoPorMontoGeneral = new BonoPorMontoGeneral();
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
                    }
                );

            }, (err: SqlError) => {
                callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener las bonificaciones por monto general: " + err.message });
            }
        );
    }
    //-----Para Visualizacion de promociones
    obtenerBonificacionPorMontoGeneralPorCliente(cliente: Cliente, callback: (listaDeBonificacionesPorMontoGeneral: Array<BonoPorMontoGeneral>) => void, callbackError: (resultado: Operacion) => void) {
        SONDA_DB_Session.transaction(
            (tx) => {
                let listaDeLi: string[] = [];
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
                listaDeLi.push(` WHERE BLGA.BONUS_LIST_ID = ${cliente.bonusListId}`);                

                tx.executeSql(listaDeLi.join(''), [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        let listaDeBonificacionesPorMontoGeneral = new Array<BonoPorMontoGeneral>();
                        for (let i = 0; i < results.rows.length; i++) {
                            let descuentoSql: any = results.rows.item(i);
                            let bonoPorMontoGeneral = new BonoPorMontoGeneral();
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
                    }
                );

            }, (err: SqlError) => {
                callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener las bonificaciones por monto general: " + err.message });
            }
        );
    }

    obtenerTodasLasBonificacionPorEscalaPorCliente(cliente: Cliente, callback: (listaDeBonos: Array<Bono>) => void, callbackError: (resultado: Operacion) => void) {
        SONDA_DB_Session.transaction(
            (tx) => {
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
<<<<<<< HEAD
                sql += " ON (SP.SKU = BLS.CODE_SKU_BONUS)";
=======
                sql += " ON (SP.SKU = BLS.CODE_SKU)";
>>>>>>> master
                sql += " WHERE BLS.BONUS_LIST_ID = " + cliente.bonusListId;                
                sql += " ORDER BY BLS.LOW_LIMIT";

                tx.executeSql(sql, [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        let listaDeBonos = new Array<Bono>();
                        for (var i = 0; i < results.rows.length; i++) {
                            let bonoSql: any = results.rows.item(i);
                            let bono = new Bono();
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
                    }
                );

            }, (err: SqlError) => {                
                callbackError(<Operacion>{ codigo: -1, mensaje: "Error al obtener el bonificaciones: " + err.message });                
            }
        );
    }

    obtenerTodasLasBonificacionesDeMultiploPorCliente(cliente: Cliente, callback: (listaDeBonos: Array<Bono>) => void, callbackError: (resultado: Operacion) => void): void {
        const operacion = new Operacion();
        try {

            SONDA_DB_Session.transaction((trans) => {
                let sql = "SELECT DISTINCT";
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
<<<<<<< HEAD
                sql += " ON (SP.SKU = BLS.CODE_SKU_BONUS)";
=======
                sql += " ON (SP.SKU = BLS.CODE_SKU)";
>>>>>>> master
                sql += ` WHERE BLS.BONUS_LIST_ID = ${cliente.bonusListId}`;                
                sql += " ORDER BY BLS.MULTIPLE";

                console.log(sql);
                trans.executeSql(sql, [],
                    (tx: SqlTransaction, results: SqlResultSet) => {
                        const listaDeBonos = new Array<Bono>();
                        for (let i = 0; i < results.rows.length; i++) {
                            const bonoSql: any = results.rows.item(i);
                            const bono = new Bono();
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
                    }
                );

            }, (error: SqlError) => {
                operacion.codigo = -1;
                operacion.mensaje = error.message;
                console.log(operacion);
                callbackError(operacion);
            });
        } catch (e) {
            operacion.codigo = -1;
            operacion.mensaje = e.message;
            console.log(operacion.mensaje);
            callbackError(operacion);
        }
    }
}