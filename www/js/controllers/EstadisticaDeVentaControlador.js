var EstadisticaDeVentaControlador = (function () {
    function EstadisticaDeVentaControlador() {
        this.estadisticaDeVentaServicio = new EstadisticaDeVentaServicio();
        this.decimalesServicio = new ManejoDeDecimalesServicio();
        this.decimales = new ManejoDeDecimales();
    }
    EstadisticaDeVentaControlador.prototype.obtenerInformacionDeEstadisticaDeVentaActual = function () {
        var _this = this;
        this.estadisticaDeVentaServicio.obtenerInformacionDeEstadisticaDeVenta(function (estadistica) {
            _this.construirVisualizacionDeInformacionDeEstadisticaDeVenta(estadistica);
        });
    };
    EstadisticaDeVentaControlador.prototype.construirVisualizacionDeInformacionDeEstadisticaDeVenta = function (estadisticaDeVenta) {
        var _this = this;
        try {
            this.decimalesServicio
                .obtenerInformacionDeManejoDeDecimales(function (configuracionDeDecimales) {
                _this.decimales = configuracionDeDecimales;
                var teamName = $("#teamName");
                var goalName = $("#goalName");
                var ranking = $("#ranking");
                var goalAmount = $("#goalAmount");
                var accumulatedAmount = $("#accumulatedAmount");
                var remainingDays = $("#remainingDays");
                var goalAmountOfDay = $("#goalAmountOfDay");
                var soldToday = $("#soldToday");
                var salesOrdersOfDay = $("#salesOrdersOfDay");
                var pendingToSaleToday = $("#pendingToSaleToday");
                var currencySymbol = localStorage.getItem("DISPLAY_SYMBOL_CURRENCY") || "Q";
                if (estadisticaDeVenta.goalHeaderId) {
                    localStorage.setItem("GOAL_HEADER_ID", estadisticaDeVenta.goalHeaderId.toString());
                }
                teamName.text(estadisticaDeVenta.teamName);
                goalName.text(estadisticaDeVenta.goalName);
                ranking.text(estadisticaDeVenta.ranking);
                goalAmount
                    .text(currencySymbol + " " + format_number(estadisticaDeVenta.goalAmount, _this.decimales.defaultDisplayDecimals));
                accumulatedAmount
                    .text(currencySymbol + " " + format_number((estadisticaDeVenta.accumulatedAmount + estadisticaDeVenta.soldToday), _this.decimales.defaultDisplayDecimals) + " (" + _this.obtenerPorcentajeDeMetaCubiertoPorVentas(estadisticaDeVenta) + "%) ");
                remainingDays.text("" + estadisticaDeVenta.remainingDays);
                goalAmountOfDay
                    .text(currencySymbol + " " + format_number(estadisticaDeVenta.goalAmountOfDay, _this.decimales.defaultDisplayDecimals));
                soldToday
                    .text(currencySymbol + " " + format_number(estadisticaDeVenta.soldToday, _this.decimales.defaultDisplayDecimals));
                salesOrdersOfDay.text("(" + estadisticaDeVenta.salesOrdersOfDay + ")");
                pendingToSaleToday
                    .text(currencySymbol + " " + format_number(estadisticaDeVenta.pendingToSaleToday, _this.decimales.defaultDisplayDecimals));
                currencySymbol = null;
                teamName = null;
                goalName = null;
                ranking = null;
                goalAmount = null;
                accumulatedAmount = null;
                remainingDays = null;
                goalAmountOfDay = null;
                soldToday = null;
                salesOrdersOfDay = null;
                pendingToSaleToday = null;
            }, function (resultado) {
                console
                    .log("Error al obtener configuracion de decimales para estadistica de venta debido a: " + resultado.mensaje);
            });
        }
        catch (e) {
            console.log("Ha ocurrido un error al intentar mostrar la estad\u00EDstica de venta debido a: " + e.message);
            notify("Ha ocurrido un error al intentar mostrar la estad\u00EDstica de venta.");
        }
    };
    EstadisticaDeVentaControlador.prototype.obtenerPorcentajeDeMetaCubiertoPorVentas = function (estadisticaDeVenta) {
        var montoTotalAcumulado = 0;
        var porcentajeDeMetaCubierto = 0;
        montoTotalAcumulado = estadisticaDeVenta.accumulatedAmount + estadisticaDeVenta.soldToday;
        if (montoTotalAcumulado > 0 && estadisticaDeVenta.goalAmount > 0) {
            porcentajeDeMetaCubierto = (montoTotalAcumulado * 100) / estadisticaDeVenta.goalAmount;
        }
        return porcentajeDeMetaCubierto;
    };
    return EstadisticaDeVentaControlador;
}());
//# sourceMappingURL=EstadisticaDeVentaControlador.js.map