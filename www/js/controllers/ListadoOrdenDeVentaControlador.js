function DelegarListadoOrdenDeVentaControlador() {
    $("#UiBtnListadoOrdenesDeVenta").bind("touchstart", function () {
        UsuarioDeseaVerListadoDeOrdenesDeVenta();
    });

}

function DelegarSocketsListadoOrdenDeVentaControlador(socketIo) {

    socketIo.on('SendSalesOrderVoid_Request', function (data) {
        switch (data.option) {
            case 'success':
                console.log("Orden de venta cancelada en BO");
                AnularOrdenDeVenta(data.data.DocSerie,
                    data.data.DocNum,
                    function () {
                        CargarOrdenesDeVenta();
                        EnviarData();
                        my_dialog("", "", "close");
                        notify("Se ha anulado correctamente la orden de venta");
                    },
                    function (err) {
                        my_dialog("", "", "close");
                        notify("2-Error al anular la ordene de venta: " + err.message);
                    });
                break;
            case 'fail':
                console.log("1-Error al anular la orden de venta: " + data.message);
                my_dialog("", "", "close");
                notify("1-Error al anular la orden de venta: " + data.message);
                break;
            case 'receive':
                console.log("Orden de venta cancelada recivida en NodeJS");
                break;
        }
    });
}

function UsuarioDeseaVerListadoDeOrdenesDeVenta() {
    $.mobile.changePage("#UiPageSalesOrderList", {
        transition: "flow",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
    });

    CargarOrdenesDeVenta();
}

function CargarOrdenesDeVenta() {
    ObtenerOrdenesDeVentaNoAnuladasPorReferencia(function (ordenesDeVenta) {
        try {
            var vLI = '';
            var click = '';
            $('#UiListaOrdenDeVenta').children().remove('li');
            for (var i = 0; i < ordenesDeVenta.length; i++) {
                click = '';
                click = "UsuarioDeseaVerOpcionesDelListadoDeOrdenesDeVenta('" + ordenesDeVenta[i].DocSerie + "'," + ordenesDeVenta[i].DocNum + ")";
                vLI = '';

                if (ordenesDeVenta[i].IsPosted === 2) {
                    vLI += '<li data-icon="check" >';
                } else {
                    vLI += '<li data-icon="delete" >';
                }
                vLI += '<a href="#" onclick="' + click + '">';
                vLI += '<span><span class="medium"> ' + ordenesDeVenta[i].ClientId  + " - " + ordenesDeVenta[i].ClientName + ' </span><br>';
                vLI += '<p><span><span class="medium">Serie Doc: </span>';
                vLI += "<span class='ui-li-count' style='position:absolute; top:50%'>" + ordenesDeVenta[i].DocSerie + "</span></p>";
                vLI += '<p><span><span class="medium">No. Doc: </span>';
                vLI += "<span class='ui-li-count' style='position:absolute; top:67%'>" + ordenesDeVenta[i].DocNum + "</span></p>";
                vLI += '<p><span><span class="medium">Total: </span>';
                vLI += "<span class='ui-li-count' style='position:absolute; top:85%'>" + DarFormatoAlMonto(format_number(ordenesDeVenta[i].TotalAmount,2)) + "</span></p>";
                vLI += '</a></li>';

                $("#UiListaOrdenDeVenta").append(vLI);
            }
            $("#UiListaOrdenDeVenta").listview('refresh');
        } catch (err) {
            notify("Error al obtener la lista de ordenes de venta: " + err.message);
        }
    }, function (err) {
        notify("Error al obtener la lista de ordenes de venta: " + err.message);
    });
}

function UsuarioDeseaAnularDeOrdenDeVenta(docSerie, docNum) {
    navigator.notification.confirm(
        "Esta seguro que desea anular la orden de venta?", // message
        function (buttonIndex) {
            if (buttonIndex === 2) {
                if (gIsOnline) {
                    ValidarSiYaFueEnvidaYValidadaLaOrdenDeVenta(docSerie,
                        docNum,
                        function (fueEnviadaYValidada) {
                            if (fueEnviadaYValidada) {
                                my_dialog("Orden de Venta", "Anulando orden...", "open");
                                var data =
                                {
                                    'IsVoid': 1,
                                    'DocSerie': docSerie,
                                    'DocNum': docNum,
                                    'dbuser': gdbuser,
                                    'dbuserpass': gdbuserpass,
                                    'routeid': gCurrentRoute

                                };
                                socket.emit("SendSalesOrderVoid", data);
                            } else {
                                EnviarData();
                                notify("Para poder anular la orden de venta debe de estar sincronizada con el BO");
                            }
                        },
                        function (err) {
                            notify("Error al validar la orden de venta: " + err.message);
                        });
                } else {
                    notify("No tiene conexión al Servidor, por favor intente más tarde");
                }
            }
        }, // callback to invoke with index of button pressed
        'Sonda®  ' + SondaVersion, // title
        'No,Si' // buttonLabels
    );
}

function UsuarioDeseaVerOpcionesDelListadoDeOrdenesDeVenta(docSerie, docNum) {
    try {
        // Prepare the picker configuration
        var config = {
            title: "Opciones",
            items: [
                { text: "Anular", value: OpcionListaOrdenDeVenta.Anular }
                //,{ text: "Ver Detalle", value: "detail" }
            ],
            //selectedValue: "reprint",
            doneButtonLabel: "Ok",
            cancelButtonLabel: "Cancelar"
        };
        // Show the picker
        window.plugins.listpicker.showPicker(config,
            function (item) {
                switch (item) {
                    case OpcionListaOrdenDeVenta.Anular:
                        UsuarioDeseaAnularDeOrdenDeVenta(docSerie, docNum);
                        break;
                }
            }
        );
    } catch (e) {
        notify("Error al cargar las opciones: " + e.message);
    }
}