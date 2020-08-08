/// <reference path="cuentacorriente.ts" />

class Cliente {
  clientId: string;
  clientName: string;
  clientNewName: string;
  clientTaxId: string;
  address: string;
  phone: string;
  clientHhIdOld: string;
  contactCustomer: string;
  gps: string;
  discountMax: number;
  discount: number;
  appliedDiscount: number;
  cuentaCorriente: CuentaCorriente;
  totalAmout: number;
  priceListId: string;
  skus: string;
  deliveryDate: Date;
  salesComment: string;
  etiquetas: Etiqueta[];
  origen: string;
  fotoDeInicioDeVisita: string = "";
  rgaCode: string = "";
  discountListId: number = 0;
  bonusListId: number = 0;
  salesByMultipleListId: number;
  isNew: boolean;
  bonoPorCombos: BonoPorCombo[];
  invoiceTaxId: string;
  invoiceName: string;
  estaEnModificacionObligatoria: boolean = false;
  previousBalance: number;
  lastPurchase: number;
  isPostedOffLine: number = 0;
  deviceNetworkType: string = "";
  spcialPriceListId: number = 0;
  channel: string;
  lastPurchaseDate: string = null;
  discountByFamilyAndPaymentTypeListId: number = null;

  // propiedades usadas por modulo de cobro de facturas vencidas
  paymentType: TipoDePagoDeFactura;
  overdueInvoices: Array<FacturaVencidaDeCliente> = [];
  totalAmountPayedOfOverdueInvoices: number = 0;
  totalAmountOfOpenInvoices: number = 0;
  creditAmount: number = 0;
  cashAmount: number = 0;
  currentAccountingInformation: CuentaCorrienteDeCliente = new CuentaCorrienteDeCliente();
  canBuyOnCredit: boolean = false;
  invoiceDueDate: Date = new Date();
  outStandingBalance : number = 0;  

  constructor() {
    this.clientId = null;
    this.clientName = null;
    this.clientNewName = null;
    this.clientTaxId = null;
    this.address = null;
    this.phone = null;
    this.clientHhIdOld = null;
    this.contactCustomer = null;
    this.gps = null;
    this.discountMax = null;
    this.discount = null;
    this.appliedDiscount = null;
    this.cuentaCorriente = new CuentaCorriente();
    this.totalAmout = null;
    this.priceListId = null;
    this.skus = null;
    this.deliveryDate = null;
    this.salesComment = null;
    this.etiquetas = new Array();
    this.origen = null;
    this.fotoDeInicioDeVisita = null;
    this.rgaCode = null;
    this.discountListId = null;
    this.bonusListId = null;
    this.salesByMultipleListId = null;
    this.isNew = null;
    this.bonoPorCombos = new Array();
    this.invoiceTaxId = null;
    this.invoiceName = null;
    this.estaEnModificacionObligatoria = null;
    this.previousBalance = null;
    this.lastPurchase = null;
    this.isPostedOffLine = 0;
    this.deviceNetworkType = "";
    this.channel = "";
    this.outStandingBalance = 0;
  }
}
