/// <reference path="../../../typings/tsd.d.ts" />
//-----Variables Globales
declare var gIsOnline: number;
declare var gVentaEsReimpresion: boolean;
declare var gClientName: string;
declare var gtaskStatus: string;
declare var gtaskid: number;
declare var gdbuser: string;
declare var gdbuserpass: string;
declare var gCurrentGPS: string;
declare var gLastGPS: string;
declare var TareaEstado: any;
declare var gClientID: string;
declare var gTaskType: string;
declare var TareaTipo: any;
declare var OrdenDeVentaTipo: any;
declare var OpcionValidarSaldoCliente: any;
declare var OrigenFirma: any;
declare var gCurrentRoute: string;
declare var gSalesOrderType: string;
declare var OpcionRespuesta: any;
declare var ReglaEstado: any;
declare var plugins: any;
declare var SondaVersion: string;
declare var OpcionFirmaYFotoTipo: any;
declare var TipoDocumento: any;
declare var gBatteryLevel: any;
declare var OpcionImprimir: any;
declare var gMaxImpresiones: number;
declare var gVentaEsReimpresion: boolean;
declare var gtaskStatus: string;
declare var MaximoCF: number;
declare var TareaTipoDescripcion: any;
declare var gLastLogin: any;
declare var _foto: any;
declare var odatajs: any;
declare var estaEnControlDeFinDeRuta: boolean;

declare var pUserID: any;
declare var gLoggedUser: any;
declare var gUserCode: any;
declare var gDefaultWhs: any;
declare var gPreSaleWhs: any;
declare var gTimeout: any;
declare var bluetoothSerial: any;
declare var gManifestID: any;
declare var gpicture: any;
declare var gGuideToDeliver: any;
declare var pSignature: any;
declare var gDESTINATION_CLIENTNAME_ToDeliver: any;
declare var gRELATED_CLIENT_NAME_ToDeliver: any;
declare var gGuideToDeliver: any;
declare var gSignatedDelivery: any;
declare var gSaldoPen: any;
declare var gInsertsInitialRoute: any;
declare var _actualizandoRuta: boolean;
declare var TipoDeValidacionDeOrdenDeVenta: any;
declare var pPinCode: any;
declare var gNetworkState: any;
declare var states: any;
declare var gTaskIsFrom: string;
declare var tipoDeRedALaQueEstaConectadoElDispositivo: string;

declare function notify(pMessage: string): void;
declare var SONDA_DB_Session: Database;
declare var socket: SocketIOClient.Socket;
declare var SondaServerURL: string;
declare var gPrintAddress: string;
declare var estaCargandoInicioRuta: number;
declare var EstadoEnvioDoc: any;
declare var mensajero: Messenger;
declare var tipoDePagoProcesadoEnCobroDeFacturasVencidas: TipoDePagoDeFactura;

//-----Funciones Globales-----
declare function DeviceIsOnline(): void;
declare function EstaGpsDesavilitado(callback: () => void): void;
declare function ObtenerPosicionGPS(callback: () => void): void;
declare function my_dialog(
  titulo: string,
  mensaje: string,
  estadoDelDialogo: string
): void;
declare function ToDecimal(valor: number): number;
declare function ValidarFechaDeEntrega(
  fechaActual: Date,
  fechaDeEntrega: Date
): boolean;
declare function ObtenerFecha(): Date;
declare function MostrarCapturaDeFirmaYFoto(
  opcionFirmaYFotoTipo: any,
  callback: (firma: string, foto: string) => void
): void;
declare function GetNexSequence(
  tipo: string,
  callback: (sequencia: string) => void,
  callbackError: (error: any) => void
): void;
declare function ObtenerSecuenciaSiguiente(
  tipoDocumento: any,
  callback: (serie: string, numeroDeDocumento: number) => void,
  callbackError: (error: any) => void
): void;
declare function ObtenerPosicionGPS(callback: () => void): void;
declare function getDateTime(): string;
declare function format_number(
  cantidad: number,
  cantidadDeDecimales: number
): number;
declare function ConectarImpresora(
  printAddress: string,
  callback: () => void
): void;
declare function DesconectarImpresora(
  resolve: (result: boolean) => void,
  reject: (reason: Error) => void
);
declare function ImprimirDocumento(
  documento: string,
  callback: () => void,
  callbackError: (error: any) => void
): void;
declare function EnviarData(): void;
declare function CrearTarea(
  cliente: any,
  tipoTarea: string,
  callback: (clienteNuevo: string, codigoTarea: string) => void
): void;
declare function ShowListPicker(
  configoptions: any,
  callback: (item: any) => void
);

declare function ListPicker(
  configoptions: any,
  callback: (item: any) => void,
  cancelledCallback: () => void
);

declare function gotomyDelivery(): void;
declare function EjecutarTareaDeVenta(clienteId: string): void;

declare function trunc_number(
  cantidad: number,
  cantidadDeDecimales: number
): number;

declare function swipe(
  pagina: string,
  callback: (direccion: string) => void
): void;

declare function actualizarListadoDeTareas(
  idTarea: number,
  tipoDeTarea: string,
  estadoDeTarea: string,
  codigoCliente: string,
  nombreCliente: string,
  direccionCliente: string,
  noReolectado: number,
  estadoDeTareaAnterior: string,
  rgaCode: string
): void;

declare function ObtenerCantidadDeSecuenciasDisponibles(
  tipoDocumento: string,
  callback: (
    docType: string,
    docFrom: number,
    docTo: number,
    serie: string,
    currentDoc: number,
    available: number
  ) => void,
  errCallback: (errorMensaje: string) => void
): void;

declare function TomarFoto(
  callback: (fotografia: string) => void,
  errCallback: (resultado: any) => void
): void;

declare function DarFormatoAlMonto(monto: number): string;

declare function LeerCodigoBarraConCamara(
  callback: (codigoLeido: string) => void
): void;

declare function BloquearPantalla(): void;

declare function DesBloquearPantalla(): void;

declare function AddPriceListByCustomer(data): void;

declare function seleccionoOpcionEnBonificacionPorCombo(nombreDeObjeto): void;

declare function obtenerValorDeObjeto(nombreDeObjeto): string;

declare function CheckforOffline(): void;
declare function UpdateLoginInfo(option: string): void;
declare function MostrarPaginaDeInicioDeRuta(): void;
declare function RefreshMyRoutePlan(): void;
declare function clearup_manifiesto(): void;
declare function showmanifestlist(option: string): void;
declare function ClearControlsPageManifest(): void;
declare function RequestedSkus(data): void;
declare function GetrouteInvCompleted(data): void;
declare function ErrorMessage(data): void;
declare function NoSkusFound(data): void;
declare function AddToPosSku(data): void;
declare function PosSkusCompleted(data): void;
declare function RequestedSerie(data): void;
declare function NoSeriesFound(data): void;
declare function AddToSeries(data): void;
declare function SeriesCompleted(data): void;
declare function GetInitialRouteCompleted(data): void;
declare function RequestedTags(): void;
declare function NoTagsFound(data): void;
declare function AddToTags(data): void;
declare function TagsCompleted(data): void;
declare function RequestedGetCustomer(): void;
declare function NoGetCustomerFound(data): void;
declare function AddToCustomer(data): void;
declare function GetCustomerCompleted(data): void;
declare function RequestedGetCustomerFrequency(): void;
declare function NoGetCustomerFrequencyFound(data): void;
declare function AddToCustomerFrequency(data): void;
declare function GetCustomerFrequencyCompleted(data): void;
declare function RequestedGetTagsXCustomer(): void;
declare function NoGetTagsXCustomerFound(data): void;
declare function AddToTagsXCustomer(data): void;
declare function GetTagsXCustomerCompleted(data): void;
declare function RequestedGetRules(data): void;
declare function NoGetRulesFound(data): void;
declare function AddToRule(data): void;
declare function GetRuleCompleted(data): void;
declare function RequestedGetTask(data): void;
declare function NoGetTasksFound(data): void;
declare function AddToTask(data): void;
declare function GetTaskCompleted(data): void;
declare function RequestedGetSkuPreSale(data): void;
declare function NoGetSkuPreSaleFound(data): void;
declare function AddToSkuPreSale(data): void;
declare function GetSkuPreSaleCompleted(data): void;
declare function GetDocumentSequenceStart(data): void;
declare function GetDocumentSequenceNoFound(data): void;
declare function AddToDocumentSequence(data): void;
declare function GetDocumentSequenceCompleted(data): void;
declare function GetPackUnitStart(data): void;
declare function GetPackUnitNoFound(data): void;
declare function AddToPackUnit(data): void;
declare function GetPackUnitCompleted(data): void;
declare function GetPackConversionStart(data): void;
declare function GetPackConversionNoFound(data): void;
declare function AddToPackConversion(data): void;
declare function GetPackConversionCompleted(data): void;
declare function RequestedGetFamilySku(data): void;
declare function NoGetFamilySkuFound(data): void;
declare function AddToFamilySku(data): void;
declare function GetFamilySkuCompleted(data): void;
declare function PriceListByCustomerReceived(): void;
declare function PriceListByCustomerNotFound(data): void;
declare function PriceListByCustomerCompleted(): void;
declare function PriceListBySKUReceived(): void;
declare function PriceListBySKUNotFound(data): void;
declare function AddPriceListBySKU(data): void;
declare function PriceListBySKUCompleted(): void;
declare function PriceListDefaultReceived(): void;
declare function PriceListDefaultNotFound(data): void;
declare function AddPriceListDefault(data): void;
declare function PriceListDefaultCompleted(): void;
declare function GetItemHistoryNotFound(data): void;
declare function AddItemHistory(data): void;
declare function GetItemHistoryCompleted(): void;
declare function GetSalesOrderDraftComplete(): void;
declare function AddSalesOrderDraft(data): void;
declare function AddInvoiceDraft(data): void;
declare function CalculationRulesReceived(): void;
declare function CalculationRulesNotFound(data): void;
declare function AddCalculationRules(data): void;
declare function CalculationRulesCompleted(): void;
declare function NoPackUnitBySkuFound(): void;
declare function AddDefaultPackSku(data): void;
declare function DefaultPackUnitBySkuCompleted(): void;
declare function PriceListBySkuPackScaleReceived(): void;
declare function PriceListBySkuPackScaleNotFound(data): void;
declare function AddPriceListBySkuPackScale(data): void;
declare function PriceListBySkuPackScaleCompleted(): void;
declare function GetPrintUMParameterReceived(): void;
declare function GetPrintUMParameterNotFound(data): void;
declare function AddGetPrintUMParameter(data): void;
declare function GetPrintUMParameterCompleted(): void;
declare function GetMaxDiscountParameterReceived(): void;
declare function GetMaxDiscountParameterNotFound(data): void;
declare function AddGetMaxDiscountParameter(data): void;
declare function GetMaxDiscountParameterCompleted(): void;
declare function BonusListByCustomerReceived(): void;
declare function BonusListByCustomerNotFound(data): void;
declare function AddBonusListByCustomer(data): void;
declare function BonusListByCustomerCompleted(): void;
declare function BonusListBySkuReceived(): void;
declare function BonusListBySkuNotFound(data): void;
declare function AddBonusListBySku(data): void;
declare function BonusListBySkuCompleted(): void;
declare function DiscountListByCustomerReceived(): void;
declare function DiscountListByCustomerNotFound(data): void;
declare function AddDiscountListByCustomer(data): void;
declare function BonusListByCustomerCompleted(): void;
declare function DiscountListByGeneralAmountReceived(): void;
declare function DiscountListByGeneralAmountNotFound(data): void;
declare function AddDiscountListByGeneralAmount(data): void;
declare function DiscountListByGeneralAmountCompleted(): void;
declare function DiscountListBySkuReceived(): void;
declare function DiscountListBySkuNotFound(data): void;
declare function AddDiscountListBySku(data): void;
declare function DiscountListBySkuCompleted(): void;
declare function CurrencyReceived(): void;
declare function CurrencyNotFound(data): void;
declare function AddCurrency(data): void;
declare function CurrencyCompleted(): void;
declare function SetMaxBonusParameter(value): void;
declare function SetMaxBonusParameter(value): void;
declare function ObtenerInformacionDeRuta(): void;
declare function AddToReasons(entry): void;
declare function MostarInformacionDeUsuario(data): void;
declare function MostarResolucion(data): void;
declare function MostarSecuenciaDeDocumentos(data): void;
declare function MostarResumenDeTareas(data): void;
declare function MostarResumenDeCantidad(data): void;
declare function ActualizarEnvioPagos(
  data,
  callback: (data: any) => void,
  errorCallBack: (error: any) => void
): void;
declare function ActualizarClienteNuevoHandHeld(
  data,
  callback: () => void,
  errorCallBack: (error: any) => void
): void;
declare function EnviarDataSinClientes(): void;
declare function ActualizarEtiqutaPorClienteHandHeld(data): void;
declare function ActualizarEnvioEtiquetaClienteError(data): void;
declare function ActualizarEnvioTarea(
  data: any,
  callBack: (dataN1: any) => void,
  errorCallBack: (error: any) => void
): void;
declare function MarcarTareasComoSincronizada(task): void;
declare function ActualizarEnvioFactura(
  data: any,
  callback: (dataN1) => void,
  errorCallBack: (error) => void
): void;
declare function ActualizarEnvioConsignacion(
  data,
  callback: (dataN1) => void,
  errorCallBack: (erro) => void
): void;
declare function ImprimirFinDia(): void;
declare function ActualizarEnvioDeOrdernesDeCompra(
  data,
  callBack: (dataN1) => void,
  errorCallBack: (error) => void
): void;
declare function ActualizarEnvioDeNumeroDeImprecionesDeOrdenesDeVenta(
  data,
  callBack: (dataN1) => void,
  errorCallBack: (error) => void
): void;
declare function ActualizarInventarioReservadoPorOrdenesDeVentaAnuladas(
  data,
  index,
  callBack: () => void,
  errorCallBack: (error) => void
): void;
declare function ActualizarEnvioDeBorradoresDeOrdernesDeCompra(
  data,
  callBack: () => void,
  errorCallBack: (err) => void
): void;
declare function ActualizarEnvioDeActualizacionDeBorradoresDeOrdernesDeCompra(
  data,
  callBack: () => void,
  errorCallBack: (error) => void
): void;
declare function ActualizarEnvioDeCambiosDeClientes(
  data,
  callBack: () => void,
  errorCallBack: (error) => void
): void;
declare function CambiarEstadoParaReenviarOrdenesDeVenta(
  data,
  callBack: () => void,
  errorCallBack: (error) => void
): void;
declare function EnviarValidacionDeOrdenDeVenta(
  callBack: () => void,
  errorcallback: (err) => void
): void;
declare function ActualizarInventarioPreVenta(data): void;
declare function DelegarABroadcast(socket: SocketIOClient.Socket): void;
declare function DelegarSocketsListadoOrdenDeVentaControlador(
  socketIo: SocketIOClient.Socket
): void;
declare function NoGetInvoiceFound(data): void;
declare function AddInvoice(data): void;
declare function GetInvoiceCompleted(data): void;
declare function RegresarAPaginaAnterior(paginaAnterior: string): void;
declare function BorrarDatosTablas(): void;
declare function ObtenerReglas(
  tipo: string,
  callBack: (reglas: any) => void,
  errorCallBack: (error: string) => void
): void;
declare function SignaturePad(canvas: any, options: any): void;
declare function AddCompany(data: any);
declare function BorrarTablasParaInicioDeRuta(): void;
declare function AgregarBonoPorMontoGeneral(data): void;
declare function MostrarFinDeRuta(): void;
declare function ObtenerDocumentosParaControlDeFinDeRuta(
  callback: (listaDeDocumentosDeFinDeRuta: any) => void,
  errorCallback: (error: string) => void
): void;
declare function MostrarPantallaDeControlDeFinDeRuta(
  documentosDeFinDeRuta: any
): void;
declare function EnviarBorradoresDeBonificaciones(origenDeEnvio: number): void;
declare function AgregarHistoricoPorPromo(data): void;
declare function MarcarHistoricoDePromocionesComoPosteado(
  historialDePromociones: any
): void;
declare function DiscountListByGeneralAmountAndFamilyNotFound(data): void;
declare function AddDiscountListByGeneralAmountAndFamily(row): void;
declare function DiscountListByFamilyAndPaymentTypeNotFound(data): void;
declare function AddDiscountListByFamilyAndPaymentType(row): void;
declare function SetApplyDiscountParameter(value): void;
declare function AddOrderForDiscountForApply(row): void;
declare function AddListOfSpecialPriceByScale(row): void;
declare function AddMicrosurvey(row): void;
declare function AddQuestionOfMicrosurvey(row): void;
declare function AddAnswerOfQuestionOfMicrosurvey(row): void;
declare function AddChannelsOfMicrosurvey(row): void;
declare function onBackKeyDown(): void;
declare function onMenuKeyDown(): void;
declare function ValidarSequenciaDeDocumentos(
  tipoDeDocumento,
  callBack,
  errorCallBack
): void;

declare function publicarClienteParaProcesoDeCobroDeFacturasVencidas(
  callback: () => void
): void;

declare function obtenerCuentasDeBancos(
  callback: (cuentasDeBanco: any) => void,
  errCallback: (error: any) => void
): void;

class JavaScriptServicio { }
