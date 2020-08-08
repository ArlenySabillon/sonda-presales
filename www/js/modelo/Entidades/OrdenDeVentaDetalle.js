var OrdenDeVentaDetalle = (function () {
    function OrdenDeVentaDetalle() {
        this.isBonus = 0;
        this.discountByFamily = 0;
        this.discountByGeneralAmount = 0;
        this.discountByFamilyAndPaymentType = 0;
        this.typeOfDiscountByFamily = "";
        this.typeOfDiscountByGeneralAmount = "";
        this.typeOfDiscountByFamilyAndPaymentType = "";
        this.codeFamilySku = "";
        this.basePrice = 0;
        this.uniqueDiscountByScaleAplied = 0;
        this.applyDiscountBySpecialPrice = 0;
    }
    return OrdenDeVentaDetalle;
}());
//# sourceMappingURL=OrdenDeVentaDetalle.js.map