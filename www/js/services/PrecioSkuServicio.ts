/// <reference path="../../../typings/tsd.d.ts" />
declare var SONDA_DB_Session: Database;

class PrecioSkuServicio implements IPrecioSkuServicio {
  obtenerPreciosDePaquetes(
    cliente: Cliente,
    sku: Sku,
    paquetes: Paquete[],
    decimales: ManejoDeDecimales,
    callback: (paquetes: Paquete[]) => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    for (var i: number = 0; i < paquetes.length; i++) {
      this.obtenerPrecioDePaquete(
        cliente,
        sku,
        paquetes[i],
        i,
        decimales,
        (paquete: Paquete, index: number) => {
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

  obtenerPrecioDePaquete(
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
        let qty: number = paquete.qty === 0 ? 1 : paquete.qty;
        let listaParaEjecucion: string[] = [];
        listaParaEjecucion.push("SELECT");
        listaParaEjecucion.push(" SPS.PRICE price");
        listaParaEjecucion.push(" FROM PRICE_LIST_BY_SKU_PACK_SCALE SPS");
        listaParaEjecucion.push(
          ` WHERE (SPS.CODE_PRICE_LIST = '${cliente.priceListId}') `
        );
        listaParaEjecucion.push(` AND SPS.CODE_SKU = '${sku.sku}'`);
        listaParaEjecucion.push(
          ` AND SPS.CODE_PACK_UNIT = '${paquete.codePackUnit}'`
        );
        listaParaEjecucion.push(` AND ${qty} BETWEEN LOW_LIMIT AND HIGH_LIMIT`);
        listaParaEjecucion.push(" ORDER BY SPS.[PRIORITY] DESC");
        listaParaEjecucion.push(" LIMIT 1");
        tx.executeSql(
          listaParaEjecucion.join(""),
          [],
          (tx: SqlTransaction, results: SqlResultSet) => {
            if (results.rows.length > 0) {
              var stPaquete: any = results.rows.item(0);
              if (sku.canNegotiatePrice && sku.skuPrice > 0) {
                paquete.price = trunc_number(
                  sku.canNegotiatePrice ? sku.cost : sku.skuPrice,
                  decimales.defaultCalculationsDecimals
                );
                paquete.originalPrice = trunc_number(
                  sku.originalPrice,
                  decimales.defaultCalculationsDecimals
                );
              } else {
                paquete.price = trunc_number(
                  stPaquete.price,
                  decimales.defaultCalculationsDecimals
                );
                paquete.originalPrice = trunc_number(
                  stPaquete.price,
                  decimales.defaultCalculationsDecimals
                );
              }
            } else {
              paquete.price = -1;
              paquete.originalPrice = -1;
            }
            callback(paquete, index);
          }
        );
        listaParaEjecucion = null;
        qty = null;
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
