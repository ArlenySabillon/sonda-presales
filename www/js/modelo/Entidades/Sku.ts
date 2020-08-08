class Sku {
  sku: string = "";
  skuName: string = "";
  skuDescription: string = "";
  priceList: number = 0;
  skuPrice: number = 0;
  skuLink: string = "";
  requieresSerie: SerieSku = SerieSku.No;
  isKit: EquipoSku = EquipoSku.No;
  onHand: number = 0;
  routeId: string = "";
  isParent: number = 0;
  parentSku: PadreSku = PadreSku.No;
  exposure: ExposicionSku = ExposicionSku.No;
  priority: number = 0;
  qtyRelated: number = 0;
  loadedLastUpdated: Date = new Date();
  skus: string = "";
  codeFamilySku: string = "";
  descriptionFamilySku: string = "";
  cost: number = 0;
  isComited: number = 0;
  difference: number = 0;
  lastQtySold: number = 0;
  qty: number = 0;
  total: number = 0;
  totalCD: number = 0;
  available: number = 0;
  codePackUnit: string = "";
  skuUnidadMinima: Sku;
  parentCodeSku: string = "";
  parentCodePackUnit: string = "";
  isBonus: number = 0;
  discount: number = 0;
  appliedDiscount: number = 0;
  qtyBonusMax: number = 0;
  lowLimit: number = 0;
  highLimit: number = 0;
  unidadMedidaSeleccionada: string = "";
  handleDimension: boolean = false;
  dimension: number = 0;
  dimensions: Array<DimensionSku> = new Array<DimensionSku>();
  warehouse: string = "";
  isSaleByMultiple: boolean = false;
  multipleSaleQty: number = 0;
  modificando: boolean = false;
  originalDiscount: number = 0;
  owner: string = "";
  ownerId: string = "";
  descuentoEscala: Array<DescuentoPorEscalaSku> = new Array<
    DescuentoPorEscalaSku
  >();
  deleted: boolean = false;
  discountType: string = "";
  listPromo: Promo[] = [];
  discountByFamily: number = 0;
  discountByFamilyAndPaymentType: number = 0;
  typeOfDiscountByFamily: string = "";
  typeOfDiscountByFamilyAndPaymentType: string = "";
  isUniqueDiscountScale: boolean = false;
  basePrice: number = 0;
  specialPrice: PrecioEspecial = new PrecioEspecial();
  originalPrice: number = 0;

  lastCodePackUnitSold: string = "";
  lastPriceSold: number = 0;
  lastSaleDate: string = "";

  canNegotiatePrice: boolean = false;
  negotiatedPrice: number = 0;

  constructor(obj: any = null) {
    if (obj === null) {
      return;
    }

    this.sku = obj.sku;
    this.codePackUnit = obj.codePackUnit;
    this.skuName = obj.skuName;
    this.skuDescription = obj.skuDescription;
    this.qty = obj.qty;
    this.parentCodeSku = obj.parentCodeSku;
    this.parentCodePackUnit = obj.parentCodePackUnit;
    this.skuPrice = obj.skuPrice === undefined ? 0 : obj.skuPrice;
    this.discount = obj.discount;
    this.multipleSaleQty = obj.multipleSaleQty;
    this.isSaleByMultiple =
      obj.isSaleByMultiple === undefined ? false : obj.isSaleByMultiple === 1;
    this.owner = obj.owner;
    this.ownerId = obj.ownerId;
  }
}
