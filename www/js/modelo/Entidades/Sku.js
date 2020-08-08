var Sku = (function () {
    function Sku(obj) {
        if (obj === void 0) { obj = null; }
        this.sku = "";
        this.skuName = "";
        this.skuDescription = "";
        this.priceList = 0;
        this.skuPrice = 0;
        this.skuLink = "";
        this.requieresSerie = SerieSku.No;
        this.isKit = EquipoSku.No;
        this.onHand = 0;
        this.routeId = "";
        this.isParent = 0;
        this.parentSku = PadreSku.No;
        this.exposure = ExposicionSku.No;
        this.priority = 0;
        this.qtyRelated = 0;
        this.loadedLastUpdated = new Date();
        this.skus = "";
        this.codeFamilySku = "";
        this.descriptionFamilySku = "";
        this.cost = 0;
        this.isComited = 0;
        this.difference = 0;
        this.lastQtySold = 0;
        this.qty = 0;
        this.total = 0;
        this.totalCD = 0;
        this.available = 0;
        this.codePackUnit = "";
        this.parentCodeSku = "";
        this.parentCodePackUnit = "";
        this.isBonus = 0;
        this.discount = 0;
        this.appliedDiscount = 0;
        this.qtyBonusMax = 0;
        this.lowLimit = 0;
        this.highLimit = 0;
        this.unidadMedidaSeleccionada = "";
        this.handleDimension = false;
        this.dimension = 0;
        this.dimensions = new Array();
        this.warehouse = "";
        this.isSaleByMultiple = false;
        this.multipleSaleQty = 0;
        this.modificando = false;
        this.originalDiscount = 0;
        this.owner = "";
        this.ownerId = "";
        this.descuentoEscala = new Array();
        this.deleted = false;
        this.discountType = "";
        this.listPromo = [];
        this.discountByFamily = 0;
        this.discountByFamilyAndPaymentType = 0;
        this.typeOfDiscountByFamily = "";
        this.typeOfDiscountByFamilyAndPaymentType = "";
        this.isUniqueDiscountScale = false;
        this.basePrice = 0;
        this.specialPrice = new PrecioEspecial();
        this.originalPrice = 0;
        this.lastCodePackUnitSold = "";
        this.lastPriceSold = 0;
        this.lastSaleDate = "";
        this.canNegotiatePrice = false;
        this.negotiatedPrice = 0;
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
    return Sku;
}());
//# sourceMappingURL=Sku.js.map