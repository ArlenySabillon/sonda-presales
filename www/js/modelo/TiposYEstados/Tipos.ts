enum SerieSku {
  No,
  Si
}

enum EquipoSku {
  No,
  Si
}

enum PadreSku {
  No,
  Si
}

enum ExposicionSku {
  No,
  Si
}

enum SiNo {
  No,
  Si
}

enum ResultadoOperacionTipo {
  Exitoso,
  Error
}

enum EstaEnLinea {
  No,
  Si
}

enum TipoTarea {
  "Entrega" = <any>"DELIVERY",
  "Preventa" = <any>"PRESALE",
  "Venta" = <any>"SALE",
  "Obsoleto" = <any>"SALES",
  "Scouting" = <any>"SCOUTING"
}

enum TIpoDeDocumento {
  "OrdenDeVenta" = <any>"SALES_ORDER",
  "Inventario" = <any>"TAKE_INVENTORY",
  "PreVenta" = <any>"SALE_ORDER",
  "Pago" = <any>"PAYMENT",
  "EncuestaDeCliente" = <any>"CLIENT_SURVEY",
  "PagoDeFacturaVencida" = <any>"CREDIT_INVOICE_PAYMENT"
}

enum TipoDeRazon {
  "OrdenDeVenta" = <any>"SALES_ORDER_REASONS",
  "Entrega" = <any>"NOT_DELIVERY_REASONS",
  "SinRazones" = <any>"NO_REASONS"
}

enum TipoDePago {
  "Efectivo" = <any>"PMCASH",
  "Cheque" = <any>"PMPAPERCHECK"
}

enum TipoDeFoto {
  "Frontal" = <any>"CamaraFrontal",
  "Trasera" = <any>"CamaraTrasera"
}

enum TipoDeBonificacion {
  "PorEscala" = <any>"PorEscala",
  "PorMultiplo" = <any>"PorMultiplo",
  "Ambos" = <any>"Ambos"
}

enum TipoDeBonificacionPorCombo {
  "Unica" = <any>"UNIQUE",
  "PorCombo" = <any>"BY_COMBO"
}

enum SubTipoDeBonificacionPorCombo {
  "Unica" = <any>"UNIQUE",
  "Multiple" = <any>"MULTIPLE"
}

enum DescripcionSubTipoDeBonificacionPorCombo {
  "Unica" = <any>"Simple",
  "Multiple" = <any>"Discrecional"
}

enum OpcionEnListadoDePedido {
  "Modificar" = <any>"UPDATE",
  "Eliminar" = <any>"DELETE"
}

enum OpcionDeOrdenDelListadoDeSku {
  "CodigoDeProducto" = <any>"SP.SKU",
  "NombreDeProducto" = <any>"SP.SKU_NAME",
  "UltimaCompra" = <any>"IH.QTY",
  "Precio" = <any>"PLS.PRICE",
  "Inventario" = <any>"SP.ON_HAND"
}

enum DescripcionOpcionDeOrdenDelListadoDeSku {
  "CodigoDeProducto" = <any>"Código",
  "NombreDeProducto" = <any>"Nombre",
  "UltimaCompra" = <any>"Última compra",
  "Precio" = <any>"Precio",
  "Inventario" = <any>"Inventario"
}

enum TipoDeOrdenDelListadoDeSku {
  "Ascendente" = <any>"ASC",
  "Descendente" = <any>"DESC"
}

enum DescripcionDeTipoDeOrdenDelListadoDeSku {
  "Ascendente" = <any>"Ascendente",
  "Descendente" = <any>"Descendente"
}

enum ComboBonoParser {
  "CodigoDeSku" = 0,
  "UnidadDeMedida" = 1,
  "CantidadMaxima" = 2,
  "Indice" = 3
}

enum OrigenDeEnvioDeBorradoresDeBonificacion {
  "SincronizacionServicio" = <any>"SincronizacionServicio",
  "ReportarDispositivo" = <any>"ReportarDispositivo",
  "FinDeRuta" = <any>"FinDeRuta"
}

enum TiposDeDescuento {
  "Porcentaje" = <any>"PERCENTAGE",
  "Monetario" = <any>"MONETARY"
}

enum TiposDePago {
  "Contado" = <any>"CASH",
  "Credito" = <any>"CREDIT"
}

enum SqliteError {
  "Desconocido" = 0, //The transaction failed for reasons unrelated to the database itself and not covered by any other error code.
  "Db" = 1, //The statement failed for database reasons not covered by any other error code.
  "Version" = 2, //The operation failed because the actual database version was not what it should be. For example, a statement found that the actual database version no longer matched the expected version of the Database or DatabaseSync object, or the Database.changeVersion() or DatabaseSync.changeVersion() methods were passed a version that doesn't match the actual database version.
  "DemasiadoGrande" = 3, //The statement failed because the data returned from the database was too large. The SQL "LIMIT" modifier might be useful to reduce the size of the result set.
  "EspacioInsuficiente" = 4, //The statement failed because there was not enough remaining storage space, or the storage quota was reached and the user declined to give more space to the database.
  "SintaxisErronea" = 5, //The statement failed because of a syntax error, or the number of arguments did not match the number of ? placeholders in the statement, or the statement tried to use a statement that is not allowed, such as BEGIN, COMMIT, or ROLLBACK, or the statement tried to use a verb that could modify the database but the transaction was read-only.
  "Restriccion" = 6, //An INSERT, UPDATE, or REPLACE statement failed due to a constraint failure. For example, because a row was being inserted and the value given for the primary key column duplicated the value of an existing row.
  "SeAcaboElTiempo" = 7 // A lock for the transaction could not be obtained in a reasonable time.
}

enum ListaDeDocumentosDeFinDeRuta {
  "Tareas" = 0,
  "Clientes" = 1,
  "Pagos" = 2,
  "OrdenesDeVenta" = 3,
  "BorradoresDeOrdenesDeVenta" = 4,
  "CambiosDeClientes" = 5,
  "TomasDeInventario" = 6,
  "OrdenesDeVentaValidadas" = 7
}

enum TipoPeriodicidadDePromo {
  "Siempre" = <any>"ALWAYS",
  "Unica" = <any>"UNIQUE",
  "PorDia" = <any>"DAY",
  "PorSemana" = <any>"WEEK",
  "PorMes" = <any>"MONTH"
}

enum ListaDeDescuento {
  "DescuentoPorEscala" = <any>"DE",
  "DescuentoPorMontoGeneralYFamilia" = <any>"DMF",
  "DescuentoPorFamiliaYTipoPago" = <any>"DFTP"
}

enum TipoDePregunta {
  "Unica" = <any>"UNIQUE",
  "Multiple" = <any>"MULTIPLE",
  "Texto" = <any>"TEXT",
  "Numero" = <any>"NUMBER",
  "Fecha" = <any>"DATE"
}

enum DisparadorDeEncuesta {
  "InicioDeTarea" = 1,
  "FinDeTarea" = 2
}

// enumeraciones utilizadas por modulo de pago de facturas vencidas
enum GrupoParametro {
  "Factura" = <any>"INVOICE"
}

enum TipoDeParametro {
  "PorcentajeMinimoDePagoDeFacturasVencidas" = "MINIMUM_PERCENT_OF_PAID",
  "FormatoDeImpresion" = "PRINT_FORMAT"
}

enum TipoDePagoDeFactura {
  FacturaVencida = "OVERDUE_INVOICE" as any,
  FacturaAbierta = "OPEN_INVOICE" as any
}

enum TipoDePagoFacturaVencida {
  Cheque = "BANK_CHECK" as any,
  Deposito = "BANK_DEPOSIT" as any,
  Efectivo = "CASH" as any,
  Tarjeta = "CREDIT_OR_DEBIT_CARD" as any
}

enum BotonSeleccionado {
  "Si" = 2,
  "No" = 1,
  "Atras" = 0
}

enum ResultadoDePosteoEnServidor {
  "Exitoso" = 1,
  "Fallido" = 0
}

enum OpcionDisponibleParaDocumentoDePagoSeleccionado {
  Reimprimir = "REPRINT" as any,
  VerDetalle = "DETAIL" as any
}

enum ReglaTipo {
  "CobroDeFacturaVencida" = <any>"FacturarAunConFacturasVencidas",
  "NoVenderAlContadoConLimiteExcedido" = <any>(
    "NoVenderAlContadoConLimiteExcedido"
  ),
  "VisualizarFacturasAbiertasOVencidas" = <any>(
    "VisualizarListadoDeFacturasVencidasOAbiertas"
  ),
  "OperadorPuedeModificarPrecioDeProducto" = <any>(
    "OperadorPuedeModificarPrecioDeProducto"
  )
}

enum FormatoDeImpresion {
  "Estandar" = "STANDARD",
  "Pacasa" = "PACASA-HN"
}
