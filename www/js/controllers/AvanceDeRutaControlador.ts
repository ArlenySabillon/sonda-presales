class AvanceDeRutaControlador {
    ordenDeVentaServicio = new OrdenDeVentaServicio();
    configuracionDecimales: ManejoDeDecimales;
    configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();
    
    delegarAvanceDeRutaControlador(){
        const este = this;

        document.addEventListener("backbutton", () => {            
            este.mostrarPantallaAnterior();
        }, true);

        $("#UiBotonConsultarAvanceDeRuta").bind("touchstart", () => {
            este.usuarioDeseaVerConsultaDeAvanceDeRuta();
        });

        $(document).on("pagebeforechange",
            (event, data) => {
                if (data.toPage === "UiPaginaAvanceDeRuta") {                   
                    este.cargarPantalla();
                    $.mobile.changePage("#UiPaginaAvanceDeRuta");
            }
        });            
    }

    mostrarPantallaAnterior() {
        switch ($.mobile.activePage[0].id) {
            case "UiPaginaAvanceDeRuta":
                window.history.back();
                break;
        }
    }

    usuarioDeseaVerConsultaDeAvanceDeRuta(){        
        try{
            
            let _this = this;
            $.mobile.changePage("UiPaginaAvanceDeRuta", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false,                
            });
        }
        catch (err) {
            notify("Error al mostrar la consulta avance de ruta: " + err.message);
            my_dialog("", "", "closed");
        }
    }

    cargarPantalla(){
        try{
            this.configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales((decimales: ManejoDeDecimales) => {
                this.configuracionDecimales = decimales;
                this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerCantidadDeTotalDeOrdenDeVenta(),(total: number)=>{
                    let uiEtiquetaDeTituloTotalDePedidos = $('#UiEtiquetaDeTituloTotalDePedidos');
                    uiEtiquetaDeTituloTotalDePedidos.text('Total CD(' + total + '):');
                    uiEtiquetaDeTituloTotalDePedidos = null;
                    this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalDeOrdenDeVenta(),(total: number)=>{
                        let uiEtiquetaARTotalDePedidos = $('#UiEtiquetaARTotalDePedidos');
                        uiEtiquetaARTotalDePedidos.text(DarFormatoAlMonto(format_number(total, this.configuracionDecimales.defaultDisplayDecimals)));
                        uiEtiquetaARTotalDePedidos = null;
                        this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalDeClientesAVisitar(),(total: number)=>{
                            let totalClientesAVisitar = total;                            
                            this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalDeClientesConVisitados(),(total: number)=>{
                                let uiEtiquetaARTotalClientesVisitados = $('#UiEtiquetaARTotalClientesVisitados');
                                uiEtiquetaARTotalClientesVisitados.text( total + '/' + totalClientesAVisitar);
                                uiEtiquetaARTotalClientesVisitados = null;
                                this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalDeTareasSinGestion(),(total: number)=>{
                                    let uiEtiquetaARTotalTareasSinGestion = $('#UiEtiquetaARTotalTareasSinGestion');
                                    uiEtiquetaARTotalTareasSinGestion.text(total);
                                    uiEtiquetaARTotalTareasSinGestion = null;
                                    this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalDeTareasFueraPlanDeRuta(),(total: number)=>{
                                        let uiEtiquetaARTotalDeTareasFueraPlanDeRuta = $('#UiEtiquetaARTotalDeTareasFueraPlanDeRuta');
                                        uiEtiquetaARTotalDeTareasFueraPlanDeRuta.text(total);
                                        uiEtiquetaARTotalDeTareasFueraPlanDeRuta = null;
                                        this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalClientesNuevos(),(total: number)=>{
                                            let uiEtiquetaARTotalClientesNuevos = $('#UiEtiquetaARTotalClientesNuevos');
                                            uiEtiquetaARTotalClientesNuevos.text(total);
                                            uiEtiquetaARTotalClientesNuevos = null;
                                            this.ordenDeVentaServicio.ObtenerTotalesParaEstadoDeRuta(this.ordenDeVentaServicio.ObtenerTotalSinDescuentoDeOrdenDeVenta(),(total: number)=>{
                                                let uiEtiquetaARTotalDePedidosSinDescuento = $('#UiEtiquetaARTotalDePedidosSinDescuento');
                                                uiEtiquetaARTotalDePedidosSinDescuento.text(DarFormatoAlMonto(format_number(total, this.configuracionDecimales.defaultDisplayDecimals)));                                                
                                                uiEtiquetaARTotalDePedidosSinDescuento = null;
                                            }, (resultado: Operacion) => {
                                                notify(resultado.mensaje);
                                            });
                                        }, (resultado: Operacion) => {
                                            notify(resultado.mensaje);
                                        });
                                    }, (resultado: Operacion) => {
                                        notify(resultado.mensaje);
                                    });
                                }, (resultado: Operacion) => {
                                    notify(resultado.mensaje);
                                });
                            }, (resultado: Operacion) => {
                                notify(resultado.mensaje);
                            });
                        }, (resultado: Operacion) => {
                            notify(resultado.mensaje);
                        });
                    }, (resultado: Operacion) => {
                        notify(resultado.mensaje);
                    });
                }, (resultado: Operacion) => {
                    notify(resultado.mensaje);
                });
            }, (operacion: Operacion) => {
                notify(operacion.mensaje);
            });
        }
        catch (err) {
            notify("Error al cargar la pantalla: " + err.message);
            my_dialog("", "", "closed");
        }
    }
}