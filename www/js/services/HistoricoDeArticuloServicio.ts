/// <reference path="../../../typings/tsd.d.ts" />
// ReSharper disable once InconsistentNaming
declare var SONDA_DB_Session: Database;

class HistoricoDeArticuloServicio implements IHistoricoDeArticuloServicio {
  obtenerHistoricoDeArticuloParaCliente(
    tipoDeDocumento: TIpoDeDocumento,
    cliente: Cliente,
    callback: (historicoDeArticulos: HistoricoDeArticulo[]) => void,
    callbackError: (reultado: Operacion) => void
  ): void {
    SONDA_DB_Session.transaction(
      tx => {
        var sql =
          "SELECT" +
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
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            var historicoDeArticulos: HistoricoDeArticulo[] = [];
            for (var i = 0; i < results.rows.length; i++) {
              var stHistoricoDeArticulos: any = results.rows.item(i);
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
          } else {
            var operacion = new Operacion();
            operacion.resultado = ResultadoOperacionTipo.Error;
            operacion.codigo = 0;
            operacion.mensaje = "Este producto no tiene paquetes configurados";
            callbackError(operacion);
          }
        });
      },
      (err: SqlError) => {
        var operacion = new Operacion();
        operacion.resultado = ResultadoOperacionTipo.Error;
        operacion.codigo = err.code;
        operacion.mensaje = err.message;
        callbackError(operacion);
      }
    );
  }

  colocarSugerenciaDeVentaAPaquetes(
    tipoDeDocumento: TIpoDeDocumento,
    cliente: Cliente,
    sku: Sku,
    paquetes: Paquete[],
    decimales: ManejoDeDecimales,
    callback: (paquetes: Paquete[]) => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    for (var i = 0; i < paquetes.length; i++) {
      this.colocarSugerenciaDeVentaAPaquete(
        tipoDeDocumento,
        cliente,
        sku,
        paquetes[i],
        i,
        decimales,
        (paquete: Paquete, index: number) => {
          paquetes[index].lastQtySold = trunc_number(
            paquete.lastQtySold,
            decimales.defaultCalculationsDecimals
          );
          if (paquetes.length - 1 === index) {
            callback(paquetes);
          }
        },
        (resultado: Operacion) => {
          callbackError(resultado);
        }
      );
    }
  }

  colocarSugerenciaDeVentaAPaquete(
    tipoDeDocumento: TIpoDeDocumento,
    cliente: Cliente,
    sku: Sku,
    paquete: Paquete,
    index: number,
    decimales: ManejoDeDecimales,
    callback: (paquete: Paquete, index: number) => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    SONDA_DB_Session.transaction(
      tx => {
        var sql: string = "SELECT";
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
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length > 0) {
            var stHistoricoDeArticulo: any = results.rows.item(0);
            paquete.lastQtySold = trunc_number(
              stHistoricoDeArticulo.QTY,
              decimales.defaultCalculationsDecimals
            );
            paquete.lastCodePackUnitSold =
              stHistoricoDeArticulo.LAST_CODE_PACK_UNIT_SOLD;
            paquete.lastPriceSold = stHistoricoDeArticulo.LAST_PRICE_SOLD;
            paquete.lastSaleDate = stHistoricoDeArticulo.LAST_SALE_DATE;
          } else {
            paquete.lastQtySold = 0;
          }
          callback(paquete, index);
        });
      },
      (err: SqlError) => {
        var operacion = new Operacion();
        operacion.resultado = ResultadoOperacionTipo.Error;
        operacion.codigo = err.code;
        operacion.mensaje = err.message;
        callbackError(operacion);
      }
    );
  }
}
