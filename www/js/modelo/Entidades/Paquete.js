var Paquete = (function () {
    function Paquete() {
        this.packUnit = 0;
        this.dimensions = new Array();
        this.totalPorDimension = 0;
        this.appliedDiscount = 0;
        this.isSaleByMultiple = false;
        this.multiple = 0;
        this.discountType = "";
        this.promoDescuento = new Promo();
        this.promoVentaPorMultiplo = new Promo();
        this.codeFamily = "";
        this.isUniqueDiscountScale = false;
        this.basePrice = 0;
        this.specialPrice = new PrecioEspecial();
        this.lastCodePackUnitSold = "";
        this.lastPriceSold = 0;
        this.lastSaleDate = "";
        this.originalPrice = 0;
    }
    return Paquete;
}());
//# sourceMappingURL=Paquete.js.map