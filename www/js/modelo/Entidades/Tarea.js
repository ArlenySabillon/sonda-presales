var Tarea = (function () {
    function Tarea() {
        this.hasDraft = false;
        this.salesOrderTotal = 0;
        this.discountPerGeneralAmount = 0;
        this.discountPerGeneralAmountLowLimit = -1;
        this.discountPerGeneralAmountHighLimit = -1;
        this.taskIsFrom = "";
        this.isPostedOffLine = 0;
        this.deviceNetworkType = "";
        this.microsurveys = [];
    }
    return Tarea;
}());
//# sourceMappingURL=Tarea.js.map