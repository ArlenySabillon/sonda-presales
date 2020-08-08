interface ISkuServicio {

    obtenerSkuParaVenta(cliente: Cliente, sku: Sku, configuracionDecimales: ManejoDeDecimales, callback: (listaSkus: Sku[]) => void, callbackError: (reultado: Operacion) => void): void;

    obtenerSkuParaPreVenta(cliente: Cliente, sku: Sku, configuracionDecimales: ManejoDeDecimales, opcionDeOrdenamiento: string, tipoDeOrdenamiento: string, filtro: string, callback: (listaSkus: Sku[]) => void, callbackError: (reultado: Operacion) => void): void;

    obtenerFamiliaSku(callback: (results: any) => void, callbackError: (reultado: Operacion) => void): void;

    obtenerCatalogoDeProductos(cliente: Cliente,
        sku: Sku,
        configuracionDecimales: ManejoDeDecimales,
        callback: (catalogoDeProductos: Array<Sku>) => void,
        errorCallBack: (resultado: Operacion) => void,
        opcionDeOrdenamiento?: string,
        tipoDeOrdenamiento?: string): void;
}