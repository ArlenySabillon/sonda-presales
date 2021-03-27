var SerieSku;
(function (SerieSku) {
    SerieSku[SerieSku["No"] = 0] = "No";
    SerieSku[SerieSku["Si"] = 1] = "Si";
})(SerieSku || (SerieSku = {}));
var EquipoSku;
(function (EquipoSku) {
    EquipoSku[EquipoSku["No"] = 0] = "No";
    EquipoSku[EquipoSku["Si"] = 1] = "Si";
})(EquipoSku || (EquipoSku = {}));
var PadreSku;
(function (PadreSku) {
    PadreSku[PadreSku["No"] = 0] = "No";
    PadreSku[PadreSku["Si"] = 1] = "Si";
})(PadreSku || (PadreSku = {}));
var ExposicionSku;
(function (ExposicionSku) {
    ExposicionSku[ExposicionSku["No"] = 0] = "No";
    ExposicionSku[ExposicionSku["Si"] = 1] = "Si";
})(ExposicionSku || (ExposicionSku = {}));
var SiNo;
(function (SiNo) {
    SiNo[SiNo["No"] = 0] = "No";
    SiNo[SiNo["Si"] = 1] = "Si";
})(SiNo || (SiNo = {}));
var ResultadoOperacionTipo;
(function (ResultadoOperacionTipo) {
    ResultadoOperacionTipo[ResultadoOperacionTipo["Exitoso"] = 0] = "Exitoso";
    ResultadoOperacionTipo[ResultadoOperacionTipo["Error"] = 1] = "Error";
})(ResultadoOperacionTipo || (ResultadoOperacionTipo = {}));
var EstaEnLinea;
(function (EstaEnLinea) {
    EstaEnLinea[EstaEnLinea["No"] = 0] = "No";
    EstaEnLinea[EstaEnLinea["Si"] = 1] = "Si";
})(EstaEnLinea || (EstaEnLinea = {}));
var TipoTarea;
(function (TipoTarea) {
    TipoTarea[TipoTarea["Entrega"] = "DELIVERY"] = "Entrega";
    TipoTarea[TipoTarea["Preventa"] = "PRESALE"] = "Preventa";
    TipoTarea[TipoTarea["Venta"] = "SALE"] = "Venta";
    TipoTarea[TipoTarea["Obsoleto"] = "SALES"] = "Obsoleto";
    TipoTarea[TipoTarea["Scouting"] = "SCOUTING"] = "Scouting";
})(TipoTarea || (TipoTarea = {}));
var TIpoDeDocumento;
(function (TIpoDeDocumento) {
    TIpoDeDocumento[TIpoDeDocumento["OrdenDeVenta"] = "SALES_ORDER"] = "OrdenDeVenta";
    TIpoDeDocumento[TIpoDeDocumento["Inventario"] = "TAKE_INVENTORY"] = "Inventario";
    TIpoDeDocumento[TIpoDeDocumento["PreVenta"] = "SALE_ORDER"] = "PreVenta";
    TIpoDeDocumento[TIpoDeDocumento["Pago"] = "PAYMENT"] = "Pago";
    TIpoDeDocumento[TIpoDeDocumento["EncuestaDeCliente"] = "CLIENT_SURVEY"] = "EncuestaDeCliente";
    TIpoDeDocumento[TIpoDeDocumento["PagoDeFacturaVencida"] = "CREDIT_INVOICE_PAYMENT"] = "PagoDeFacturaVencida";
})(TIpoDeDocumento || (TIpoDeDocumento = {}));
var TipoDeRazon;
(function (TipoDeRazon) {
    TipoDeRazon[TipoDeRazon["OrdenDeVenta"] = "SALES_ORDER_REASONS"] = "OrdenDeVenta";
    TipoDeRazon[TipoDeRazon["Entrega"] = "NOT_DELIVERY_REASONS"] = "Entrega";
    TipoDeRazon[TipoDeRazon["SinRazones"] = "NO_REASONS"] = "SinRazones";
})(TipoDeRazon || (TipoDeRazon = {}));
var TipoDePago;
(function (TipoDePago) {
    TipoDePago[TipoDePago["Efectivo"] = "PMCASH"] = "Efectivo";
    TipoDePago[TipoDePago["Cheque"] = "PMPAPERCHECK"] = "Cheque";
})(TipoDePago || (TipoDePago = {}));
var TipoDeFoto;
(function (TipoDeFoto) {
    TipoDeFoto[TipoDeFoto["Frontal"] = "CamaraFrontal"] = "Frontal";
    TipoDeFoto[TipoDeFoto["Trasera"] = "CamaraTrasera"] = "Trasera";
})(TipoDeFoto || (TipoDeFoto = {}));
var TipoDeBonificacion;
(function (TipoDeBonificacion) {
    TipoDeBonificacion[TipoDeBonificacion["PorEscala"] = "PorEscala"] = "PorEscala";
    TipoDeBonificacion[TipoDeBonificacion["PorMultiplo"] = "PorMultiplo"] = "PorMultiplo";
    TipoDeBonificacion[TipoDeBonificacion["Ambos"] = "Ambos"] = "Ambos";
})(TipoDeBonificacion || (TipoDeBonificacion = {}));
var TipoDeBonificacionPorCombo;
(function (TipoDeBonificacionPorCombo) {
    TipoDeBonificacionPorCombo[TipoDeBonificacionPorCombo["Unica"] = "UNIQUE"] = "Unica";
    TipoDeBonificacionPorCombo[TipoDeBonificacionPorCombo["PorCombo"] = "BY_COMBO"] = "PorCombo";
})(TipoDeBonificacionPorCombo || (TipoDeBonificacionPorCombo = {}));
var SubTipoDeBonificacionPorCombo;
(function (SubTipoDeBonificacionPorCombo) {
    SubTipoDeBonificacionPorCombo[SubTipoDeBonificacionPorCombo["Unica"] = "UNIQUE"] = "Unica";
    SubTipoDeBonificacionPorCombo[SubTipoDeBonificacionPorCombo["Multiple"] = "MULTIPLE"] = "Multiple";
})(SubTipoDeBonificacionPorCombo || (SubTipoDeBonificacionPorCombo = {}));
var DescripcionSubTipoDeBonificacionPorCombo;
(function (DescripcionSubTipoDeBonificacionPorCombo) {
    DescripcionSubTipoDeBonificacionPorCombo[DescripcionSubTipoDeBonificacionPorCombo["Unica"] = "Simple"] = "Unica";
    DescripcionSubTipoDeBonificacionPorCombo[DescripcionSubTipoDeBonificacionPorCombo["Multiple"] = "Discrecional"] = "Multiple";
})(DescripcionSubTipoDeBonificacionPorCombo || (DescripcionSubTipoDeBonificacionPorCombo = {}));
var OpcionEnListadoDePedido;
(function (OpcionEnListadoDePedido) {
    OpcionEnListadoDePedido[OpcionEnListadoDePedido["Modificar"] = "UPDATE"] = "Modificar";
    OpcionEnListadoDePedido[OpcionEnListadoDePedido["Eliminar"] = "DELETE"] = "Eliminar";
})(OpcionEnListadoDePedido || (OpcionEnListadoDePedido = {}));
var OpcionDeOrdenDelListadoDeSku;
(function (OpcionDeOrdenDelListadoDeSku) {
    OpcionDeOrdenDelListadoDeSku[OpcionDeOrdenDelListadoDeSku["CodigoDeProducto"] = "SP.SKU"] = "CodigoDeProducto";
    OpcionDeOrdenDelListadoDeSku[OpcionDeOrdenDelListadoDeSku["NombreDeProducto"] = "SP.SKU_NAME"] = "NombreDeProducto";
    OpcionDeOrdenDelListadoDeSku[OpcionDeOrdenDelListadoDeSku["UltimaCompra"] = "IH.QTY"] = "UltimaCompra";
    OpcionDeOrdenDelListadoDeSku[OpcionDeOrdenDelListadoDeSku["Precio"] = "PLS.PRICE"] = "Precio";
    OpcionDeOrdenDelListadoDeSku[OpcionDeOrdenDelListadoDeSku["Inventario"] = "SP.ON_HAND"] = "Inventario";
})(OpcionDeOrdenDelListadoDeSku || (OpcionDeOrdenDelListadoDeSku = {}));
var DescripcionOpcionDeOrdenDelListadoDeSku;
(function (DescripcionOpcionDeOrdenDelListadoDeSku) {
    DescripcionOpcionDeOrdenDelListadoDeSku[DescripcionOpcionDeOrdenDelListadoDeSku["CodigoDeProducto"] = "Código"] = "CodigoDeProducto";
    DescripcionOpcionDeOrdenDelListadoDeSku[DescripcionOpcionDeOrdenDelListadoDeSku["NombreDeProducto"] = "Nombre"] = "NombreDeProducto";
    DescripcionOpcionDeOrdenDelListadoDeSku[DescripcionOpcionDeOrdenDelListadoDeSku["UltimaCompra"] = "Última compra"] = "UltimaCompra";
    DescripcionOpcionDeOrdenDelListadoDeSku[DescripcionOpcionDeOrdenDelListadoDeSku["Precio"] = "Precio"] = "Precio";
    DescripcionOpcionDeOrdenDelListadoDeSku[DescripcionOpcionDeOrdenDelListadoDeSku["Inventario"] = "Inventario"] = "Inventario";
})(DescripcionOpcionDeOrdenDelListadoDeSku || (DescripcionOpcionDeOrdenDelListadoDeSku = {}));
var TipoDeOrdenDelListadoDeSku;
(function (TipoDeOrdenDelListadoDeSku) {
    TipoDeOrdenDelListadoDeSku[TipoDeOrdenDelListadoDeSku["Ascendente"] = "ASC"] = "Ascendente";
    TipoDeOrdenDelListadoDeSku[TipoDeOrdenDelListadoDeSku["Descendente"] = "DESC"] = "Descendente";
})(TipoDeOrdenDelListadoDeSku || (TipoDeOrdenDelListadoDeSku = {}));
var DescripcionDeTipoDeOrdenDelListadoDeSku;
(function (DescripcionDeTipoDeOrdenDelListadoDeSku) {
    DescripcionDeTipoDeOrdenDelListadoDeSku[DescripcionDeTipoDeOrdenDelListadoDeSku["Ascendente"] = "Ascendente"] = "Ascendente";
    DescripcionDeTipoDeOrdenDelListadoDeSku[DescripcionDeTipoDeOrdenDelListadoDeSku["Descendente"] = "Descendente"] = "Descendente";
})(DescripcionDeTipoDeOrdenDelListadoDeSku || (DescripcionDeTipoDeOrdenDelListadoDeSku = {}));
var ComboBonoParser;
(function (ComboBonoParser) {
    ComboBonoParser[ComboBonoParser["CodigoDeSku"] = 0] = "CodigoDeSku";
    ComboBonoParser[ComboBonoParser["UnidadDeMedida"] = 1] = "UnidadDeMedida";
    ComboBonoParser[ComboBonoParser["CantidadMaxima"] = 2] = "CantidadMaxima";
    ComboBonoParser[ComboBonoParser["Indice"] = 3] = "Indice";
})(ComboBonoParser || (ComboBonoParser = {}));
var OrigenDeEnvioDeBorradoresDeBonificacion;
(function (OrigenDeEnvioDeBorradoresDeBonificacion) {
    OrigenDeEnvioDeBorradoresDeBonificacion[OrigenDeEnvioDeBorradoresDeBonificacion["SincronizacionServicio"] = "SincronizacionServicio"] = "SincronizacionServicio";
    OrigenDeEnvioDeBorradoresDeBonificacion[OrigenDeEnvioDeBorradoresDeBonificacion["ReportarDispositivo"] = "ReportarDispositivo"] = "ReportarDispositivo";
    OrigenDeEnvioDeBorradoresDeBonificacion[OrigenDeEnvioDeBorradoresDeBonificacion["FinDeRuta"] = "FinDeRuta"] = "FinDeRuta";
})(OrigenDeEnvioDeBorradoresDeBonificacion || (OrigenDeEnvioDeBorradoresDeBonificacion = {}));
var TiposDeDescuento;
(function (TiposDeDescuento) {
    TiposDeDescuento[TiposDeDescuento["Porcentaje"] = "PERCENTAGE"] = "Porcentaje";
    TiposDeDescuento[TiposDeDescuento["Monetario"] = "MONETARY"] = "Monetario";
})(TiposDeDescuento || (TiposDeDescuento = {}));
var TiposDePago;
(function (TiposDePago) {
    TiposDePago[TiposDePago["Contado"] = "CASH"] = "Contado";
    TiposDePago[TiposDePago["Credito"] = "CREDIT"] = "Credito";
})(TiposDePago || (TiposDePago = {}));
var SqliteError;
(function (SqliteError) {
    SqliteError[SqliteError["Desconocido"] = 0] = "Desconocido";
    SqliteError[SqliteError["Db"] = 1] = "Db";
    SqliteError[SqliteError["Version"] = 2] = "Version";
    SqliteError[SqliteError["DemasiadoGrande"] = 3] = "DemasiadoGrande";
    SqliteError[SqliteError["EspacioInsuficiente"] = 4] = "EspacioInsuficiente";
    SqliteError[SqliteError["SintaxisErronea"] = 5] = "SintaxisErronea";
    SqliteError[SqliteError["Restriccion"] = 6] = "Restriccion";
    SqliteError[SqliteError["SeAcaboElTiempo"] = 7] = "SeAcaboElTiempo";
})(SqliteError || (SqliteError = {}));
var ListaDeDocumentosDeFinDeRuta;
(function (ListaDeDocumentosDeFinDeRuta) {
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["Tareas"] = 0] = "Tareas";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["Clientes"] = 1] = "Clientes";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["Pagos"] = 2] = "Pagos";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["OrdenesDeVenta"] = 3] = "OrdenesDeVenta";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["BorradoresDeOrdenesDeVenta"] = 4] = "BorradoresDeOrdenesDeVenta";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["CambiosDeClientes"] = 5] = "CambiosDeClientes";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["TomasDeInventario"] = 6] = "TomasDeInventario";
    ListaDeDocumentosDeFinDeRuta[ListaDeDocumentosDeFinDeRuta["OrdenesDeVentaValidadas"] = 7] = "OrdenesDeVentaValidadas";
})(ListaDeDocumentosDeFinDeRuta || (ListaDeDocumentosDeFinDeRuta = {}));
var TipoPeriodicidadDePromo;
(function (TipoPeriodicidadDePromo) {
    TipoPeriodicidadDePromo[TipoPeriodicidadDePromo["Siempre"] = "ALWAYS"] = "Siempre";
    TipoPeriodicidadDePromo[TipoPeriodicidadDePromo["Unica"] = "UNIQUE"] = "Unica";
    TipoPeriodicidadDePromo[TipoPeriodicidadDePromo["PorDia"] = "DAY"] = "PorDia";
    TipoPeriodicidadDePromo[TipoPeriodicidadDePromo["PorSemana"] = "WEEK"] = "PorSemana";
    TipoPeriodicidadDePromo[TipoPeriodicidadDePromo["PorMes"] = "MONTH"] = "PorMes";
})(TipoPeriodicidadDePromo || (TipoPeriodicidadDePromo = {}));
var ListaDeDescuento;
(function (ListaDeDescuento) {
    ListaDeDescuento[ListaDeDescuento["DescuentoPorEscala"] = "DE"] = "DescuentoPorEscala";
    ListaDeDescuento[ListaDeDescuento["DescuentoPorMontoGeneralYFamilia"] = "DMF"] = "DescuentoPorMontoGeneralYFamilia";
    ListaDeDescuento[ListaDeDescuento["DescuentoPorFamiliaYTipoPago"] = "DFTP"] = "DescuentoPorFamiliaYTipoPago";
})(ListaDeDescuento || (ListaDeDescuento = {}));
var TipoDePregunta;
(function (TipoDePregunta) {
    TipoDePregunta[TipoDePregunta["Unica"] = "UNIQUE"] = "Unica";
    TipoDePregunta[TipoDePregunta["Multiple"] = "MULTIPLE"] = "Multiple";
    TipoDePregunta[TipoDePregunta["Texto"] = "TEXT"] = "Texto";
    TipoDePregunta[TipoDePregunta["Numero"] = "NUMBER"] = "Numero";
    TipoDePregunta[TipoDePregunta["Fecha"] = "DATE"] = "Fecha";
})(TipoDePregunta || (TipoDePregunta = {}));
var DisparadorDeEncuesta;
(function (DisparadorDeEncuesta) {
    DisparadorDeEncuesta[DisparadorDeEncuesta["InicioDeTarea"] = 1] = "InicioDeTarea";
    DisparadorDeEncuesta[DisparadorDeEncuesta["FinDeTarea"] = 2] = "FinDeTarea";
})(DisparadorDeEncuesta || (DisparadorDeEncuesta = {}));
var GrupoParametro;
(function (GrupoParametro) {
    GrupoParametro[GrupoParametro["Factura"] = "INVOICE"] = "Factura";
})(GrupoParametro || (GrupoParametro = {}));
var TipoDeParametro;
(function (TipoDeParametro) {
    TipoDeParametro[TipoDeParametro["PorcentajeMinimoDePagoDeFacturasVencidas"] = "MINIMUM_PERCENT_OF_PAID"] = "PorcentajeMinimoDePagoDeFacturasVencidas";
})(TipoDeParametro || (TipoDeParametro = {}));
var TipoDePagoDeFactura;
(function (TipoDePagoDeFactura) {
    TipoDePagoDeFactura[TipoDePagoDeFactura["FacturaVencida"] = "OVERDUE_INVOICE"] = "FacturaVencida";
    TipoDePagoDeFactura[TipoDePagoDeFactura["FacturaAbierta"] = "OPEN_INVOICE"] = "FacturaAbierta";
})(TipoDePagoDeFactura || (TipoDePagoDeFactura = {}));
var TipoDePagoFacturaVencida;
(function (TipoDePagoFacturaVencida) {
    TipoDePagoFacturaVencida[TipoDePagoFacturaVencida["Cheque"] = "BANK_CHECK"] = "Cheque";
    TipoDePagoFacturaVencida[TipoDePagoFacturaVencida["Deposito"] = "BANK_DEPOSIT"] = "Deposito";
    TipoDePagoFacturaVencida[TipoDePagoFacturaVencida["Efectivo"] = "CASH"] = "Efectivo";
})(TipoDePagoFacturaVencida || (TipoDePagoFacturaVencida = {}));
var BotonSeleccionado;
(function (BotonSeleccionado) {
    BotonSeleccionado[BotonSeleccionado["Si"] = 2] = "Si";
    BotonSeleccionado[BotonSeleccionado["No"] = 1] = "No";
    BotonSeleccionado[BotonSeleccionado["Atras"] = 0] = "Atras";
})(BotonSeleccionado || (BotonSeleccionado = {}));
var ResultadoDePosteoEnServidor;
(function (ResultadoDePosteoEnServidor) {
    ResultadoDePosteoEnServidor[ResultadoDePosteoEnServidor["Exitoso"] = 1] = "Exitoso";
    ResultadoDePosteoEnServidor[ResultadoDePosteoEnServidor["Fallido"] = 0] = "Fallido";
})(ResultadoDePosteoEnServidor || (ResultadoDePosteoEnServidor = {}));
var OpcionDisponibleParaDocumentoDePagoSeleccionado;
(function (OpcionDisponibleParaDocumentoDePagoSeleccionado) {
    OpcionDisponibleParaDocumentoDePagoSeleccionado[OpcionDisponibleParaDocumentoDePagoSeleccionado["Reimprimir"] = "REPRINT"] = "Reimprimir";
    OpcionDisponibleParaDocumentoDePagoSeleccionado[OpcionDisponibleParaDocumentoDePagoSeleccionado["VerDetalle"] = "DETAIL"] = "VerDetalle";
})(OpcionDisponibleParaDocumentoDePagoSeleccionado || (OpcionDisponibleParaDocumentoDePagoSeleccionado = {}));
var ReglaTipo;
(function (ReglaTipo) {
    ReglaTipo[ReglaTipo["CobroDeFacturaVencida"] = "FacturarAunConFacturasVencidas"] = "CobroDeFacturaVencida";
    ReglaTipo[ReglaTipo["NoVenderAlContadoConLimiteExcedido"] = ("NoVenderAlContadoConLimiteExcedido")] = "NoVenderAlContadoConLimiteExcedido";
    ReglaTipo[ReglaTipo["VisualizarFacturasAbiertasOVencidas"] = ("VisualizarListadoDeFacturasVencidasOAbiertas")] = "VisualizarFacturasAbiertasOVencidas";
    ReglaTipo[ReglaTipo["OperadorPuedeModificarPrecioDeProducto"] = ("OperadorPuedeModificarPrecioDeProducto")] = "OperadorPuedeModificarPrecioDeProducto";
})(ReglaTipo || (ReglaTipo = {}));
//# sourceMappingURL=Tipos.js.map