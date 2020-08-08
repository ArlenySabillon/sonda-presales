class DescuentoServicio implements IDescuentoServicio {
  obtenerDescuentosPorCliente(
    cliente: Cliente,
    callback: (listaDeDescuentos: Array<Descuento>) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT";
        sql += " DLS.DISCOUNT_LIST_ID";
        sql += " ,DLS.CODE_SKU";
        sql += " ,DLS.DISCOUNT";
        sql += " FROM DISCOUNT_LIST_BY_SKU DLS";
        sql += " WHERE DLS.DISCOUNT_LIST_ID = " + cliente.discountListId;
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let listaDeDescuentos = new Array<Descuento>();
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new Descuento();
            descuento.discountListId = descuentoSql.DISCOUNT_LIST_ID;
            descuento.codeSku = descuentoSql.CODE_SKU;
            descuento.discount = descuentoSql.DISCOUNT;
            listaDeDescuentos.push(descuento);
          }
          callback(listaDeDescuentos);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener los descuentos: " + err.message
        });
      }
    );
  }

  obtenerDescuentosPorClienteSku(
    cliente: Cliente,
    sku: Sku,
    callback: (listaDeDescuentos: Array<DescuentoPorEscalaSku>) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        let listaDeEjecucion: string[] = [];
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
        listaDeEjecucion.push(
          " INNER JOIN PACK_UNIT PU ON DLS.PACK_UNIT = PU.PACK_UNIT"
        );
        listaDeEjecucion.push(
          ` WHERE DLS.DISCOUNT_LIST_ID = ${cliente.discountListId}`
        );
        listaDeEjecucion.push(` AND DLS.CODE_SKU = '${sku.sku}'`);

        tx.executeSql(
          listaDeEjecucion.join(""),
          [],
          (tx: SqlTransaction, results: SqlResultSet) => {
            let listaDeDescuentos = new Array<DescuentoPorEscalaSku>();
            for (let i = 0; i < results.rows.length; i++) {
              let descuentoSql: any = results.rows.item(i);
              let descuento = new DescuentoPorEscalaSku();

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
          }
        );
        listaDeEjecucion = null;
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: `Error al obtener los descuentos: ${err.message}`
        });
      }
    );
  }

  obtenerDescuentoPorMontoGeneral(
    cliente: Cliente,
    total: number,
    callback: (descuentoPorMontoGeneral: DescuentoPorMontoGeneral) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
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

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let descuentoPorMontoGeneral = new DescuentoPorMontoGeneral();
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new DescuentoPorMontoGeneral();

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
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los descuentos por monto general: " + err.message
        });
      }
    );
  }

  obtenerDescuentoPorMontoGeneralYFamilia(
    cliente: Cliente,
    sku: Sku,
    total: number,
    callback: (
      descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia
    ) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
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

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let descuentoPorMontoGeneralYFamilia = new DescuentoPorMontoGeneralYFamilia();
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new DescuentoPorMontoGeneralYFamilia();

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
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los descuentos por monto general y familia: " +
            err.message
        });
      }
    );
  }

  obtenerListaDeDescuentoPorMontoGeneralYFamilia(
    cliente: Cliente,
    callback: (
      listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[]
    ) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
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

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let listaDeDescuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia[] = [];
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new DescuentoPorMontoGeneralYFamilia();

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
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener el listado de descuentos por monto general y familia: " +
            err.message
        });
      }
    );
  }

  obtenerDescuentoPorFamiliaYTipoPago(
    cliente: Cliente,
    tarea: Tarea,
    callback: (
      listaDescuentoPorFamiliaYTipoPago: Array<DescuentoPorFamiliaYTipoPago>
    ) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
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

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let listaDescuentoPorFamiliaYTipoPago = new Array<
            DescuentoPorFamiliaYTipoPago
          >();
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new DescuentoPorFamiliaYTipoPago();

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
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los descuentos por familia y tipo pago: " +
            err.message
        });
      }
    );
  }

  obtenerUnDescuentoPorFamiliaYTipoPago(
    cliente: Cliente,
    tarea: Tarea,
    sku: Sku,
    callback: (
      listaDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago
    ) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
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

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let descuentoPorFamiliaYTipoPago = new DescuentoPorFamiliaYTipoPago();
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new DescuentoPorFamiliaYTipoPago();

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
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los descuentos por familia y tipo de pago: " +
            err.message
        });
      }
    );
  }

  //-----Para Visualizacion de promociones
  obtenerTodosLosDescuentosDeEscalaPorCliente(
    cliente: Cliente,
    callback: (listaDeDescuentos: Array<DescuentoPorEscalaSku>) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        let listaDeEjecucion: string[] = [];
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
        listaDeEjecucion.push(
          " INNER JOIN PACK_UNIT PU ON DLS.PACK_UNIT = PU.PACK_UNIT"
        );
        listaDeEjecucion.push(
          ` WHERE DLS.DISCOUNT_LIST_ID = ${cliente.discountListId}`
        );

        tx.executeSql(
          listaDeEjecucion.join(""),
          [],
          (tx: SqlTransaction, results: SqlResultSet) => {
            let listaDeDescuentos = new Array<DescuentoPorEscalaSku>();
            for (let i = 0; i < results.rows.length; i++) {
              let descuentoSql: any = results.rows.item(i);
              let descuento = new DescuentoPorEscalaSku();

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
          }
        );
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: `Error al obtener los descuentos: ${err.message}`
        });
      }
    );
  }

  obtenerDescuentosPorMontoGeneralPorCliente(
    cliente: Cliente,
    callback: (descuentoPorMontoGeneral: DescuentoPorMontoGeneral[]) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        let listaDeEjecucion: string[] = [];
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
        listaDeEjecucion.push(
          ` WHERE DLGA.DISCOUNT_LIST_ID = ${cliente.discountListId}`
        );

        tx.executeSql(
          listaDeEjecucion.join(""),
          [],
          (tx: SqlTransaction, results: SqlResultSet) => {
            let listaDeDescuentoPorMontoGeneral: DescuentoPorMontoGeneral[] = [];
            for (var i = 0; i < results.rows.length; i++) {
              let descuentoSql: any = results.rows.item(i);
              let descuento = new DescuentoPorMontoGeneral();

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
          }
        );
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los descuentos por monto general: " + err.message
        });
      }
    );
  }

  obtenerDescuentoPorFamiliaYTipoPagoPorCliente(
    cliente: Cliente,
    callback: (
      listaDescuentoPorFamiliaYTipoPago: Array<DescuentoPorFamiliaYTipoPago>
    ) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
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

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let listaDescuentoPorFamiliaYTipoPago = new Array<
            DescuentoPorFamiliaYTipoPago
          >();
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let descuento = new DescuentoPorFamiliaYTipoPago();

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
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los descuentos por familia y tipo de pago: " +
            err.message
        });
      }
    );
  }

  obtenerOrdeParaAplicarDescuentos(
    callback: (
      listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento>
    ) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT DISTINCT";
        sql += " [ORDER]";
        sql += " ,CODE_DISCOUNT";
        sql += " ,DESCRIPTION";
        sql += " FROM ORDER_FOR_DISCOUNT_FOR_APPLY";
        sql += " ORDER BY [ORDER]";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          let listaDeOrdenAplicarDescuentos: Array<
            OrdenParaAplicarDescuento
          > = [];
          for (var i = 0; i < results.rows.length; i++) {
            let descuentoSql: any = results.rows.item(i);
            let ordenDescuento = new OrdenParaAplicarDescuento();

            ordenDescuento.order = descuentoSql.ORDER;
            ordenDescuento.codeDiscount = descuentoSql.CODE_DISCOUNT;
            ordenDescuento.description = descuentoSql.DESCRIPTION;

            listaDeOrdenAplicarDescuentos.push(ordenDescuento);
          }
          callback(listaDeOrdenAplicarDescuentos);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener los el orden para aplicar los descuentos: " +
            err.message
        });
      }
    );
  }

  aplicarLosDescuentos(
    sku: Sku,
    esDescuentoUnicoDeEscala: boolean,
    listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento>,
    descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia,
    listaDescuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago
  ): number {
    let total: number = sku.total;
    if (sku.specialPrice.applyDiscount) {
      if (listaDeOrdenAplicarDescuentos.length > 0) {
        listaDeOrdenAplicarDescuentos.map(
          (ordenDescuento: OrdenParaAplicarDescuento) => {
            switch (ordenDescuento.codeDiscount) {
              case ListaDeDescuento.DescuentoPorEscala:
                total = this.obtenerTotalConDescueto(
                  total,
                  sku.discount,
                  sku.discountType
                );
                break;
              case ListaDeDescuento.DescuentoPorMontoGeneralYFamilia:
                if (!esDescuentoUnicoDeEscala) {
                  total = this.obtenerTotalConDescueto(
                    total,
                    descuentoPorMontoGeneralYFamilia.discount,
                    descuentoPorMontoGeneralYFamilia.discountType
                  );
                }
                break;
              case ListaDeDescuento.DescuentoPorFamiliaYTipoPago:
                if (!esDescuentoUnicoDeEscala) {
                  total = this.obtenerTotalConDescueto(
                    total,
                    listaDescuentoPorFamiliaYTipoPago.discount,
                    listaDescuentoPorFamiliaYTipoPago.discountType
                  );
                }
                break;
            }
          }
        );
      } else {
        let descutnoPorPorcentaje: number = 0;
        let descutnoMonetario: number = 0;

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

        total = this.obtenerTotalConDescueto(
          total,
          descutnoPorPorcentaje,
          TiposDeDescuento.Porcentaje.toString()
        );

        total = this.obtenerTotalConDescueto(
          total,
          descutnoMonetario,
          TiposDeDescuento.Monetario.toString()
        );
      }
    }
    return total;
  }

  obtenerDescuentos(
    listaDePaquetes: Array<Paquete>,
    listaDeSkuOrdenDeVenta: Array<Sku>,
    cliente: Cliente,
    listaHistoricoDePromos: Array<Promo>,
    callback: (
      listaDescuentoPorMontoGeneralYFamilia: Array<
        DescuentoPorMontoGeneralYFamilia
      >,
      listaDescuentoPorFamiliaYTipoPago: Array<DescuentoPorFamiliaYTipoPago>
    ) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    this.obtenerLosTiposDeDescuentos(
      cliente,
      listaHistoricoDePromos,
      (
        listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento>,
        listaDescuentoPorMontoGeneralYFamilia: Array<
          DescuentoPorMontoGeneralYFamilia
        >,
        listaDescuentoPorFamiliaYTipoPago: Array<DescuentoPorFamiliaYTipoPago>
      ) => {
        //--Obtenemos el listado de familias
        let listaDeSoloTotalesYFamilias: Array<Sku> = [];
        listaDeSkuOrdenDeVenta.map((sku: Sku) => {
          let resultadoSku: Sku = (listaDeSoloTotalesYFamilias as any).find(
            (familia: Sku) => {
              return familia.codeFamilySku === sku.codeFamilySku;
            }
          );

          if (!resultadoSku) {
            let skuAAgregar: Sku = new Sku();
            skuAAgregar.codeFamilySku = sku.codeFamilySku;
            skuAAgregar.total = 0;
            skuAAgregar.isUniqueDiscountScale = sku.isUniqueDiscountScale;
            listaDeSoloTotalesYFamilias.push(skuAAgregar);
          } else {
            if (!sku.isUniqueDiscountScale) {
              resultadoSku.isUniqueDiscountScale = sku.isUniqueDiscountScale;
            }
          }
        });

        listaDePaquetes.map((paquete: Paquete) => {
          let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
            (familia: Sku) => {
              return familia.codeFamilySku === paquete.codeFamily;
            }
          );
          if (!resultadoFamilia) {
            let skuAAgregar: Sku = new Sku();
            skuAAgregar.codeFamilySku = paquete.codeFamily;
            skuAAgregar.total = 0;
            skuAAgregar.isUniqueDiscountScale = paquete.isUniqueDiscountScale;
            listaDeSoloTotalesYFamilias.push(skuAAgregar);
          } else {
            if (!paquete.isUniqueDiscountScale) {
              resultadoFamilia.isUniqueDiscountScale =
                paquete.isUniqueDiscountScale;
            }
          }
        });
        //--Declaramos las variables necesarios.
        let totalDeEscala: number = 0,
          totalDeMontoGeneralYFamilia: number = 0,
          totalDEFamiliaYTipoPago: number = 0;

        let listaDescuentoPorMontoGeneralYFamiliaARetornar: Array<
          DescuentoPorMontoGeneralYFamilia
        > = [];
        let listaDescuentoPorFamiliaYTipoPagoARetornar: Array<
          DescuentoPorFamiliaYTipoPago
        > = [];
        //--Valida el orden configurado
        if (listaDeOrdenAplicarDescuentos.length > 0) {
          //listaDeSkuOrdenDeVenta.map((sku: Sku) => {
          //--Si tiene orden cofigurada
          //--Recorremos el orden configurado
          listaDeOrdenAplicarDescuentos.map(
            (ordenDescuento: OrdenParaAplicarDescuento) => {
              //--Establecemos el descuento por escala.

              let descuntoParaAplicar: number = 0;
              let tipoDescuentoParaAplicar: string = "";

              if (
                ordenDescuento.codeDiscount ===
                ListaDeDescuento.DescuentoPorEscala
              ) {
                listaDeSkuOrdenDeVenta.map((sku: Sku) => {
                  if (sku.discount > 0) {
                    let resultadoPaquetes: Paquete = (listaDePaquetes as any).find(
                      (paquete: Paquete) => {
                        return (
                          paquete.codeSku === sku.sku &&
                          paquete.codePackUnit === sku.codePackUnit &&
                          paquete.codeFamily === sku.codeFamilySku
                        );
                      }
                    );

                    if (!resultadoPaquetes) {
                      descuntoParaAplicar = sku.discount;
                      tipoDescuentoParaAplicar = sku.discountType;
                      let total = sku.total;
                      if (sku.specialPrice.applyDiscount) {
                        total = this.obtenerTotalConDescueto(
                          sku.total,
                          descuntoParaAplicar,
                          tipoDescuentoParaAplicar
                        );

                        let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                          (familia: Sku) => {
                            return familia.codeFamilySku === sku.codeFamilySku;
                          }
                        );

                        if (resultadoFamilia) {
                          resultadoFamilia.total += total;
                        }
                      }
                    }
                  }
                });

                listaDePaquetes.map((paquete: Paquete) => {
                  if (paquete.qty !== 0) {
                    let total = this.obtenerTotalConDescueto(
                      paquete.price * paquete.qty,
                      paquete.appliedDiscount,
                      paquete.discountType
                    );

                    let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                      (familia: Sku) => {
                        return familia.codeFamilySku === paquete.codeFamily;
                      }
                    );

                    if (resultadoFamilia) {
                      resultadoFamilia.total += total;
                    }
                  }
                });
              }
              //--Validamos si es de tipo monto general y familia
              else if (
                ordenDescuento.codeDiscount ===
                ListaDeDescuento.DescuentoPorMontoGeneralYFamilia
              ) {
                if (listaDeSoloTotalesYFamilias.length > 0) {
                  if (listaDeSoloTotalesYFamilias[0].total === 0) {
                    listaDeSkuOrdenDeVenta.map((sku: Sku) => {
                      let resultadoPaquetes: Paquete = (listaDePaquetes as any).find(
                        (paquete: Paquete) => {
                          return (
                            paquete.codeSku === sku.sku &&
                            paquete.codePackUnit === sku.codePackUnit &&
                            paquete.codeFamily === sku.codeFamilySku
                          );
                        }
                      );

                      if (!resultadoPaquetes) {
                        let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                          (familia: Sku) => {
                            return familia.codeFamilySku === sku.codeFamilySku;
                          }
                        );

                        if (resultadoFamilia) {
                          resultadoFamilia.total += sku.total;
                        }
                      }
                    });

                    listaDePaquetes.map((paquete: Paquete) => {
                      if (paquete.qty !== 0) {
                        let total = paquete.price * paquete.qty;

                        let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                          (familia: Sku) => {
                            return familia.codeFamilySku === paquete.codeFamily;
                          }
                        );

                        if (resultadoFamilia) {
                          resultadoFamilia.total += total;
                        }
                      }
                    });
                  }
                }
                listaDeSoloTotalesYFamilias.map((familia: Sku) => {
                  if (!familia.isUniqueDiscountScale) {
                    let descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (listaDescuentoPorMontoGeneralYFamilia as any).find(
                      (descuento: DescuentoPorMontoGeneralYFamilia) => {
                        return (
                          descuento.codeFamily === familia.codeFamilySku &&
                          descuento.lowAmount <= familia.total &&
                          descuento.highAmount >= familia.total
                        );
                      }
                    );
                    if (descuentoPorMontoGeneralYFamilia) {
                      let resultadoDescuento = (listaDescuentoPorMontoGeneralYFamiliaARetornar as any).find(
                        (descuento: DescuentoPorMontoGeneralYFamilia) => {
                          return (
                            descuento.promoId ===
                            descuentoPorMontoGeneralYFamilia.promoId
                          );
                        }
                      );
                      if (!resultadoDescuento) {
                        listaDescuentoPorMontoGeneralYFamiliaARetornar.push(
                          descuentoPorMontoGeneralYFamilia
                        );
                      }
                    }
                  }
                });
              }
              //--Validamos si es de tipo familia y tipo de pago
              else if (
                ordenDescuento.codeDiscount ===
                ListaDeDescuento.DescuentoPorFamiliaYTipoPago
              ) {
                if (listaDeSoloTotalesYFamilias.length > 0) {
                  if (listaDeSoloTotalesYFamilias[0].total === 0) {
                    listaDeSkuOrdenDeVenta.map((sku: Sku) => {
                      let resultadoPaquetes: Paquete = (listaDePaquetes as any).find(
                        (paquete: Paquete) => {
                          return (
                            paquete.codeSku === sku.sku &&
                            paquete.codePackUnit === sku.codePackUnit &&
                            paquete.codeFamily === sku.codeFamilySku
                          );
                        }
                      );

                      if (!resultadoPaquetes) {
                        let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                          (familia: Sku) => {
                            return familia.codeFamilySku === sku.codeFamilySku;
                          }
                        );

                        if (resultadoFamilia) {
                          if (!resultadoFamilia.isUniqueDiscountScale) {
                            resultadoFamilia.total += sku.total;
                          }
                        }
                      }
                    });

                    listaDePaquetes.map((paquete: Paquete) => {
                      if (paquete.qty !== 0) {
                        let total = paquete.price * paquete.qty;

                        let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                          (familia: Sku) => {
                            return familia.codeFamilySku === paquete.codeFamily;
                          }
                        );

                        if (resultadoFamilia) {
                          if (!resultadoFamilia.isUniqueDiscountScale) {
                            resultadoFamilia.total += total;
                          }
                        }
                      }
                    });
                  }
                }
                //------
                listaDeSoloTotalesYFamilias.map((familia: Sku) => {
                  if (!familia.isUniqueDiscountScale) {
                    let descuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (listaDescuentoPorFamiliaYTipoPago as any).find(
                      (descuento: DescuentoPorFamiliaYTipoPago) => {
                        return descuento.codeFamily === descuento.codeFamily;
                      }
                    );
                    if (descuentoPorFamiliaYTipoPago) {
                      let resultadoDescuento = (listaDescuentoPorMontoGeneralYFamiliaARetornar as any).find(
                        (descuento: DescuentoPorMontoGeneralYFamilia) => {
                          return (
                            descuento.promoId ===
                            descuentoPorFamiliaYTipoPago.promoId
                          );
                        }
                      );
                      if (!resultadoDescuento) {
                        listaDescuentoPorFamiliaYTipoPago.push(
                          descuentoPorFamiliaYTipoPago
                        );
                      }
                    }
                  }
                });
              }
            }
          );
        } else {
          let descuntoParaAplicar: number = 0;
          let tipoDescuentoParaAplicar: string = "";
          //Descuento por escala
          listaDeSkuOrdenDeVenta.map((sku: Sku) => {
            if (sku.discount > 0) {
              let resultadoPaquetes: Paquete = (listaDePaquetes as any).find(
                (paquete: Paquete) => {
                  return (
                    paquete.codeSku === sku.sku &&
                    paquete.codePackUnit === sku.codePackUnit &&
                    paquete.codeFamily === sku.codeFamilySku
                  );
                }
              );

              if (!resultadoPaquetes) {
                descuntoParaAplicar = 0;
                tipoDescuentoParaAplicar = sku.discountType;
                let total = sku.total;
                if (sku.specialPrice.applyDiscount) {
                  total = this.obtenerTotalConDescueto(
                    sku.total,
                    descuntoParaAplicar,
                    tipoDescuentoParaAplicar
                  );

                  let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                    (familia: Sku) => {
                      return familia.codeFamilySku === sku.codeFamilySku;
                    }
                  );

                  if (resultadoFamilia) {
                    resultadoFamilia.total += total;
                  }
                }
              }
            }
          });

          listaDePaquetes.map((paquete: Paquete) => {
            if (paquete.qty !== 0) {
              let total = this.obtenerTotalConDescueto(
                paquete.price * paquete.qty,
                0,
                paquete.discountType
              );

              let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                (familia: Sku) => {
                  return familia.codeFamilySku === paquete.codeFamily;
                }
              );

              if (resultadoFamilia) {
                resultadoFamilia.total += total;
              }
            }
          });
          //---
          //--Validamos si es de tipo monto general y familia
          if (listaDeSoloTotalesYFamilias.length > 0) {
            if (listaDeSoloTotalesYFamilias[0].total === 0) {
              listaDeSkuOrdenDeVenta.map((sku: Sku) => {
                let resultadoPaquetes: Paquete = (listaDePaquetes as any).find(
                  (paquete: Paquete) => {
                    return (
                      paquete.codeSku === sku.sku &&
                      paquete.codePackUnit === sku.codePackUnit &&
                      paquete.codeFamily === sku.codeFamilySku
                    );
                  }
                );

                if (!resultadoPaquetes) {
                  let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                    (familia: Sku) => {
                      return familia.codeFamilySku === sku.codeFamilySku;
                    }
                  );

                  if (resultadoFamilia) {
                    resultadoFamilia.total += sku.total;
                  }
                }
              });

              listaDePaquetes.map((paquete: Paquete) => {
                if (paquete.qty !== 0) {
                  let total = paquete.price * paquete.qty;

                  let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                    (familia: Sku) => {
                      return familia.codeFamilySku === paquete.codeFamily;
                    }
                  );

                  if (resultadoFamilia) {
                    resultadoFamilia.total += total;
                  }
                }
              });
            }
          }
          listaDeSoloTotalesYFamilias.map((familia: Sku) => {
            if (!familia.isUniqueDiscountScale) {
              let descuentoPorMontoGeneralYFamilia: DescuentoPorMontoGeneralYFamilia = (listaDescuentoPorMontoGeneralYFamilia as any).find(
                (descuento: DescuentoPorMontoGeneralYFamilia) => {
                  return (
                    descuento.codeFamily === familia.codeFamilySku &&
                    descuento.lowAmount <= familia.total &&
                    descuento.highAmount >= familia.total
                  );
                }
              );
              if (descuentoPorMontoGeneralYFamilia) {
                let resultadoDescuento = (listaDescuentoPorMontoGeneralYFamiliaARetornar as any).find(
                  (descuento: DescuentoPorMontoGeneralYFamilia) => {
                    return (
                      descuento.promoId ===
                      descuentoPorMontoGeneralYFamilia.promoId
                    );
                  }
                );
                if (!resultadoDescuento) {
                  listaDescuentoPorMontoGeneralYFamiliaARetornar.push(
                    descuentoPorMontoGeneralYFamilia
                  );
                }
              }
            }
          });
          //---
          //--Validamos si es de tipo familia y tipo de pago
          if (listaDeSoloTotalesYFamilias.length > 0) {
            if (listaDeSoloTotalesYFamilias[0].total === 0) {
              listaDeSkuOrdenDeVenta.map((sku: Sku) => {
                let resultadoPaquetes: Paquete = (listaDePaquetes as any).find(
                  (paquete: Paquete) => {
                    return (
                      paquete.codeSku === sku.sku &&
                      paquete.codePackUnit === sku.codePackUnit &&
                      paquete.codeFamily === sku.codeFamilySku
                    );
                  }
                );

                if (!resultadoPaquetes) {
                  let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                    (familia: Sku) => {
                      return familia.codeFamilySku === sku.codeFamilySku;
                    }
                  );

                  if (resultadoFamilia) {
                    if (!resultadoFamilia.isUniqueDiscountScale) {
                      resultadoFamilia.total += sku.total;
                    }
                  }
                }
              });

              listaDePaquetes.map((paquete: Paquete) => {
                if (paquete.qty !== 0) {
                  let total = paquete.price * paquete.qty;

                  let resultadoFamilia: Sku = (listaDeSoloTotalesYFamilias as any).find(
                    (familia: Sku) => {
                      return familia.codeFamilySku === paquete.codeFamily;
                    }
                  );

                  if (resultadoFamilia) {
                    if (!resultadoFamilia.isUniqueDiscountScale) {
                      resultadoFamilia.total += total;
                    }
                  }
                }
              });
            }
          }
          //------
          listaDeSoloTotalesYFamilias.map((familia: Sku) => {
            if (!familia.isUniqueDiscountScale) {
              let descuentoPorFamiliaYTipoPago: DescuentoPorFamiliaYTipoPago = (listaDescuentoPorFamiliaYTipoPago as any).find(
                (descuento: DescuentoPorFamiliaYTipoPago) => {
                  return descuento.codeFamily === descuento.codeFamily;
                }
              );
              if (descuentoPorFamiliaYTipoPago) {
                let resultadoDescuento = (listaDescuentoPorMontoGeneralYFamiliaARetornar as any).find(
                  (descuento: DescuentoPorMontoGeneralYFamilia) => {
                    return (
                      descuento.promoId === descuentoPorFamiliaYTipoPago.promoId
                    );
                  }
                );
                if (!resultadoDescuento) {
                  listaDescuentoPorFamiliaYTipoPago.push(
                    descuentoPorFamiliaYTipoPago
                  );
                }
              }
            }
          });
          //---
        }
        //--Retornamos el listado de los descuentos
        callback(
          listaDescuentoPorMontoGeneralYFamiliaARetornar,
          listaDescuentoPorFamiliaYTipoPago
        );
      },
      (resultado: Operacion) => {
        errCallback(resultado);
      }
    );
  }

  obtenerLosTiposDeDescuentos(
    cliente: Cliente,
    listaHistoricoDePromos: Array<Promo>,
    callBack: (
      listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento>,
      listaDescuentoPorMontoGeneralYFamilia: Array<
        DescuentoPorMontoGeneralYFamilia
      >,
      listaDescuentoPorFamiliaYTipoPago: Array<DescuentoPorFamiliaYTipoPago>
    ) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    this.obtenerOrdeParaAplicarDescuentos(
      (listaDeOrdenAplicarDescuentos: Array<OrdenParaAplicarDescuento>) => {
        this.obtenerListaDeDescuentoPorMontoGeneralYFamilia(
          cliente,
          (
            listaDescuentoPorMontoGeneralYFamilia: Array<
              DescuentoPorMontoGeneralYFamilia
            >
          ) => {
            this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
              listaDescuentoPorMontoGeneralYFamilia,
              0,
              listaHistoricoDePromos,
              (
                listaDescuentoPorMontoGeneralYFamilia: Array<
                  DescuentoPorMontoGeneralYFamilia
                >
              ) => {
                this.obtenerDescuentoPorFamiliaYTipoPago(
                  cliente,
                  new Tarea(),
                  (
                    listaDescuentoPorFamiliaYTipoPago: Array<
                      DescuentoPorFamiliaYTipoPago
                    >
                  ) => {
                    this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(
                      listaDescuentoPorFamiliaYTipoPago,
                      0,
                      listaHistoricoDePromos,
                      (
                        listaDescuentoPorFamiliaYTipoPago: Array<
                          DescuentoPorFamiliaYTipoPago
                        >
                      ) => {
                        callBack(
                          listaDeOrdenAplicarDescuentos,
                          listaDescuentoPorMontoGeneralYFamilia,
                          listaDescuentoPorFamiliaYTipoPago
                        );
                      },
                      (resultado: Operacion) => {
                        errCallback(resultado);
                      }
                    );
                  },
                  (resultado: Operacion) => {
                    errCallback(resultado);
                  }
                );
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          },
          (resultado: Operacion) => {
            errCallback(resultado);
          }
        );
      },
      (resultado: Operacion) => {
        errCallback(resultado);
      }
    );
  }

  obtenerTotalConDescueto(
    total: number,
    discount: number,
    discountType: string
  ): number {
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
  }

  //--Validar si aplica descuentos por monto general y familia
  validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
    listaDeDescuento: DescuentoPorMontoGeneralYFamilia[],
    indiceDeListaDeDescuento: number,
    listaHistoricoDePromos: Promo[],
    callBack: (listaDeDescuento: DescuentoPorMontoGeneralYFamilia[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar(
            listaDeDescuento,
            indiceDeListaDeDescuento
          )
        ) {
          let descuentoAValidar: DescuentoPorMontoGeneralYFamilia =
            listaDeDescuento[indiceDeListaDeDescuento];
          let resultadoDePromoHistorico = (listaHistoricoDePromos as any).find(
            (promo: Promo) => {
              return promo.promoId === descuentoAValidar.promoId;
            }
          );
          if (resultadoDePromoHistorico) {
            let promoDeDescuento: Promo = new Promo();
            promoDeDescuento.promoId = descuentoAValidar.promoId;
            promoDeDescuento.promoName = descuentoAValidar.promoName;
            promoDeDescuento.frequency = descuentoAValidar.frequency;
            this.validarSiAplicaPromo(
              promoDeDescuento,
              resultadoDePromoHistorico,
              (aplicaDescuento: boolean) => {
                if (!aplicaDescuento) {
                  listaDeDescuento = listaDeDescuento.filter(
                    (descuento: DescuentoPorMontoGeneralYFamilia) => {
                      return (
                        resultadoDePromoHistorico.promoId !== descuento.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
                  listaDeDescuento,
                  indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0),
                  listaHistoricoDePromos,
                  (listaDeDescuento: DescuentoPorMontoGeneralYFamilia[]) => {
                    callBack(listaDeDescuento);
                  },
                  (resultado: Operacion) => {
                    errCallback(resultado);
                  }
                );
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
            promoDeDescuento = null;
          } else {
            this.validarSiAplicaElDescuentoPorMontoGeneralYFamilia(
              listaDeDescuento,
              indiceDeListaDeDescuento + 1,
              listaHistoricoDePromos,
              (listaDeDescuento: DescuentoPorMontoGeneralYFamilia[]) => {
                callBack(listaDeDescuento);
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          }
        } else {
          callBack(listaDeDescuento);
        }
      } else {
        callBack(listaDeDescuento);
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al validar si aplica el descuento por monto general y familia: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeDescuentoPorMontoGeneralYFamiliaTerminoDeIterar(
    listaDeDescuento: DescuentoPorMontoGeneralYFamilia[],
    indiceDeListaDeDescuento: number
  ): boolean {
    return (
      listaDeDescuento.length > 0 &&
      listaDeDescuento.length > indiceDeListaDeDescuento
    );
  }

  //--Validar si aplica descuentos por familia y tipo pago
  validarSiAplicaElDescuentoPorFamiliaYTipoPago(
    listaDeDescuento: DescuentoPorFamiliaYTipoPago[],
    indiceDeListaDeDescuento: number,
    listaHistoricoDePromos: Promo[],
    callBack: (listaDeDescuento: DescuentoPorFamiliaYTipoPago[]) => void,
    errCallback: (resultado: Operacion) => void
  ) {
    try {
      if (listaHistoricoDePromos.length > 0) {
        if (
          this.listaDeDescuentoPorMontoFamiliaYTipoPagoTerminoDeIterar(
            listaDeDescuento,
            indiceDeListaDeDescuento
          )
        ) {
          let descuentoAValidar: DescuentoPorFamiliaYTipoPago =
            listaDeDescuento[indiceDeListaDeDescuento];
          let resultadoDePromoHistorico = (listaHistoricoDePromos as any).find(
            (promo: Promo) => {
              return promo.promoId === descuentoAValidar.promoId;
            }
          );
          if (resultadoDePromoHistorico) {
            let promoDeDescuento: Promo = new Promo();
            promoDeDescuento.promoId = descuentoAValidar.promoId;
            promoDeDescuento.promoName = descuentoAValidar.promoName;
            promoDeDescuento.frequency = descuentoAValidar.frequency;
            this.validarSiAplicaPromo(
              promoDeDescuento,
              resultadoDePromoHistorico,
              (aplicaDescuento: boolean) => {
                if (!aplicaDescuento) {
                  listaDeDescuento = listaDeDescuento.filter(
                    (descuento: DescuentoPorFamiliaYTipoPago) => {
                      return (
                        resultadoDePromoHistorico.promoId !== descuento.promoId
                      );
                    }
                  );
                }
                this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(
                  listaDeDescuento,
                  indiceDeListaDeDescuento + (aplicaDescuento ? 1 : 0),
                  listaHistoricoDePromos,
                  (listaDeDescuento: DescuentoPorFamiliaYTipoPago[]) => {
                    callBack(listaDeDescuento);
                  },
                  (resultado: Operacion) => {
                    errCallback(resultado);
                  }
                );
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
            promoDeDescuento = null;
          } else {
            this.validarSiAplicaElDescuentoPorFamiliaYTipoPago(
              listaDeDescuento,
              indiceDeListaDeDescuento + 1,
              listaHistoricoDePromos,
              (listaDeDescuento: DescuentoPorFamiliaYTipoPago[]) => {
                callBack(listaDeDescuento);
              },
              (resultado: Operacion) => {
                errCallback(resultado);
              }
            );
          }
        } else {
          callBack(listaDeDescuento);
        }
      } else {
        callBack(listaDeDescuento);
      }
    } catch (ex) {
      errCallback({
        codigo: -1,
        mensaje: `Error al validar si aplica el descuento por familia y tipo pago: ${ex.message}`
      } as Operacion);
    }
  }

  listaDeDescuentoPorMontoFamiliaYTipoPagoTerminoDeIterar(
    listaDeDescuento: DescuentoPorFamiliaYTipoPago[],
    indiceDeListaDeDescuento: number
  ): boolean {
    return (
      listaDeDescuento.length > 0 &&
      listaDeDescuento.length > indiceDeListaDeDescuento
    );
  }

  validarSiAplicaPromo(
    promo: Promo,
    promoHistorico: Promo,
    callback: (aplicarPromo: boolean) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      promoHistorico.historyDateTime.setHours(0);
      promoHistorico.historyDateTime.setMinutes(0);
      promoHistorico.historyDateTime.setSeconds(0);
      promoHistorico.historyDateTime.setMilliseconds(0);

      let cantidadDeDias: number = 0;
      switch (promo.frequency) {
        case TipoPeriodicidadDePromo.Siempre.toString():
          callback(true);
          break;
        case TipoPeriodicidadDePromo.Unica.toString():
          callback(false);
          break;
        case TipoPeriodicidadDePromo.PorDia.toString():
          let fechaActual = new Date();
          fechaActual.setHours(0);
          fechaActual.setMinutes(0);
          fechaActual.setSeconds(0);
          fechaActual.setMilliseconds(0);

          if (promoHistorico.historyDateTime < fechaActual) {
            callback(true);
          } else {
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
        this.obtenerFechaParaCompararLaPromo(
          cantidadDeDias,
          (fecha: Date) => {
            if (promoHistorico.historyDateTime <= fecha) {
              callback(true);
            } else {
              callback(false);
            }
          },
          (resultado: Operacion) => {
            callbackError(resultado);
          }
        );
      }
    } catch (ex) {
      callbackError({
        codigo: -1,
        mensaje: `Error al validar si aplica promo: ${ex.message}`
      } as Operacion);
    }
  }

  obtenerFechaParaCompararLaPromo(
    diasARestar: number,
    callback: (fecha: Date) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        let listaParaEjecucion: string[] = [];
        listaParaEjecucion.push(
          `SELECT DateTime('Now', 'LocalTime', '-${diasARestar} Day') AS DATE_PROMO`
        );
        tx.executeSql(
          listaParaEjecucion.join(""),
          [],
          (tx: SqlTransaction, results: SqlResultSet) => {
            if (results.rows.length > 0) {
              let registroPorComboSql: any = results.rows.item(0);
              let fecha: Date;
              fecha = new Date(registroPorComboSql.DATE_PROMO);
              fecha.setHours(0);
              fecha.setMinutes(0);
              fecha.setSeconds(0);
              fecha.setMilliseconds(0);
              callback(fecha);
              fecha = null;
              registroPorComboSql = null;
            } else {
              callbackError({
                codigo: -1,
                mensaje: `No se pudo obtener la fecha para la comparación.`
              } as Operacion);
            }
          }
        );
        listaParaEjecucion = null;
      },
      (err: SqlError) => {
        callbackError({
          codigo: -1,
          mensaje: `Error al obtener fecha para compara la p de promo: ${err.message}`
        } as Operacion);
      }
    );
  }
}
