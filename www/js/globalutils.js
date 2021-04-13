var mensajero;
var gMaxImpresiones = 5;
var pictureSource; // picture source
var destinationType; // sets the format of returned value
var SONDA_DB_Session;
var gInvoiceNUM;
var gTotalInvoiced = new Number();
var gTotalInvoicesProc = new Number();
var gClientName = "";
var gClientID = "";
var gpackages = new Number();
var pSignature = "";
var gSignated = false;
var gSignatedDelivery = false;
var gTimeout = 0;
var gTimeout2 = 0;
var gdbuserpass = "";
var gdbuser = "";
var gLastGPS = "";
var gtaskStatus = "";
var gTaskIsFrom = "";
var estaEnControlDeFinDeRuta = false;
var tipoDeRedALaQueEstaConectadoElDispositivo = "";

var gPACKAGES_ToDeliver = "";
var gRELATED_CLIENT_NAME_ToDeliver = "";
var gDESTINATION_CLIENTNAME_ToDeliver = "";

var gNoVisitDesc = "";
var gpicture = default_image;
var gUserCD = 0;
var gLoginStatus = "CLOSED";
var pNewGuideID = "";
var gTaskOffPlanID = 0;
var gGuideToDeliver = "";
var gInputedName_formated = "";
var gInputedAdress_formated = "";

var gGuideScannedPacks = parseInt(0);
var gManifestID = parseInt(0);
var gManifestPresent = parseInt(0);

var canvas;
var signaturePad;

var gBatteryLevel = 0;
var gSKUsJson = "";
var gNetworkState = 0;
var gPrepared = 0;
var gPanelOptionsIsOpen = 0;
var pPOSStatus = "CLOSED";
var gtaskid = 0;
var gTaskOffPlan = 0;
var gtaskgps = "";
var socket;
var states = {};
var gMyLocalIP = "";
var pUserID = "";
var gUserCode = 0;
var socketConnectTimeInterval;
var gPrintAddress = "";
var gBankName = "";

var gBranches = [];
var gBankAccounts = [];
var objetoImagen;
var gInsertsInitialRoute = [];
var gSelectedAccount;
var gTaskType = "";
var gCurrentRoute = "";
var gDefaultWhs = "";
var gPreSaleWhs = "";
var gNotDeliveryReasons = [];
var gSalesOrderType = null;
var gPreguntaTipoOrdenDeVenta = null;
var gVentaEsReimpresion = false;
var tareaDetalleControlador;
var listaSkuControlador;
var documentoVentaControlador;
var estaCargandoInicioRuta = 0;
var estadisticaDeVentaControlador;
var encuestaControlador;
var cobroDeFacturaVencidaControlador;
var tipoDePagoDeFacturaVencidaControlador;
var confirmacionDePagoDeFacturaVencidaControlador;
var listaDePagoControlador;
var detalleDePagoControlador;
var catalogoDeProductoControlador;
var galeriaDeImagenControlador;

var default_image;
//var SondaServerURL = "http://190.56.115.27:8596"; //IP Publica Servidor Dev Mobility
//var SondaServerURL = "http://190.56.115.27:9596"; //IP Publica Servidor QA Mobility
var SondaServerURL = "";

var currentBranch = "cendalzaRoute";
var SondaVersion = "2021.04.13";
var SondaServerOptions = {
    reconnect: true,
    "max reconnection attempts": 60000
};

var gCurrentGPS = "0,0";

var gNewTask = 1;
var gPrinterIsAvailable = 0;
var gLastLogin = "";
var gLoggedUser = "";
var gIsOnline = 0;

var gHeaderSerial = "";
var gDetailSerial = "";

function onMenuKeyDown() {
    try {
        var globalUtilsServicio = new GlobalUtilsServicio(mensajero);
        var myPanel;
        switch ($.mobile.activePage[0].id) {
            case "deliver_guides_page":
                scanpackage();
                break;
            case "scanmanifest_page":
                cordova.plugins.barcodeScanner.scan(
                    function(result) {
                        if (!result.cancelled) {
                            $("#lblScannedManifest").text(result.text);
                            gManifestID = parseInt(result.text);

                            my_dialog("Verificando", "Buscando manifiesto", "open");

                            globalUtilsServicio.socketIo.emit("manifest_scanned", {
                                scanned: gManifestID
                            });
                        }
                    },
                    function(error) {
                        notify("Scanning failed: " + error);
                    }
                );
                break;
            case "login_page":
                myPanel = $.mobile.activePage.children('[data-role="panel"]');
                myPanel.panel("toggle");
                break;
            case "menu_page":
                myPanel = $.mobile.activePage.children('[data-role="panel"]');
                myPanel.panel("toggle");
                break;

            case "taskpickupguide_page":
                GetAvailablePackageTypes();
                break;
            case "pickupplan_page":
                myPanel = $.mobile.activePage.children('[data-role="presales_panel"]');
                myPanel.panel("toggle");
                break;
            case "UiPageRepPreSale":
                myPanel = $.mobile.activePage.children('[data-role="UiPanelDerrecho"]');
                myPanel.panel("toggle");
                break;
            default:
                myPanel = $.mobile.activePage.children('[data-role="panel"]');
                myPanel.panel("toggle");
                break;
        }
        globalUtilsServicio = null;
    } catch (e) {
        console.log(e.message);
    }
}

function onSuccessGPS(position) {
    window.plugins.spinnerDialog.hide();
    gCurrentGPS = position.coords.latitude + "," + position.coords.longitude;
    gLastGPS = gCurrentGPS;

    $(".gpsclass").text(
        position.coords.latitude + "," + position.coords.longitude
    );
}

function DeviceIsOnline() {
    try {
        gNetworkState = navigator.connection.type.toUpperCase();

        states[0] = "[]";
        states[Connection.UNKNOWN.toUpperCase()] = "?";
        states[Connection.ETHERNET.toUpperCase()] = "Ethernet";
        states[Connection.WIFI.toUpperCase()] = "WiFi";
        states[Connection.CELL_2G.toUpperCase()] = "2G";
        states[Connection.CELL_3G.toUpperCase()] = "3G";
        states[Connection.CELL_4G.toUpperCase()] = "4G";
        states[Connection.CELL.toUpperCase()] = "EDGE";
        states[Connection.NONE.toUpperCase()] = "NONE";
        tipoDeRedALaQueEstaConectadoElDispositivo =
            gNetworkState.toString() === "0" ? "[]" : states[gNetworkState];

        $(".networkclass").text(tipoDeRedALaQueEstaConectadoElDispositivo);
        $(".networkclass").buttonMarkup({ icon: "cloud" });

        navigator.geolocation.getCurrentPosition(onSuccessGPS, onErrorGPS, {
            maximumAge: 30000,
            timeout: 15000,
            enableHighAccuracy: true
        });

        if (gLoginStatus === "OPEN") {
            if (!socket || !socket.connected) {
                var validacionDeLicencia = new ValidacionDeLicenciaControlador(
                    new Messenger()
                );
                validacionDeLicencia.validarLicencia(
                    localStorage.getItem("pUserID"),
                    localStorage.getItem("pUserCode"),
                    false
                );
            }
        }

        if (socket) {
            socket.emit("IdentifyDeviceInRoute", {
                user: localStorage.getItem("pUserID"),
                routeId: gCurrentRoute,
                deviceId: device.uuid,
                message: "Registrando desde la aplicacion " + SondaVersion
            });

            socket.emit("RegisterClientSocketConnected", { routeid: gCurrentRoute });
        }
    } catch (e) {
        notify("DeviceIsOnline: " + e.message);
        console.log("DeviceIsOnline: " + e.message);
    }
}

function DeviceIsOffline() {
    $("#login_isonline").text("OFF");

    $("#login_isonline").text("OFF");
    $("#lblNetworkLogin").text("OFF");
    $("#lblNetworkDeliveryMenu").text("OFF");
    $("#btnNetworkStatus").buttonMarkup({ icon: "forbidden" });
    $(".networkclass").text("OFF");
    $(".networkclass").buttonMarkup({ icon: "forbidden" });

    gIsOnline = 0;
}

function my_dialog(pTitle, pMessage, pAction) {
    if (pAction === "open") {
        window.plugins.spinnerDialog.show(pTitle, pMessage);
    } else {
        window.plugins.spinnerDialog.hide();
    }
}

function onErrorGPS(error) {
    window.plugins.spinnerDialog.hide();
    $("#myCurrentGPS").text("GPS is unable at this moment");
    ToastThis("GPS is unreachable at this moment.");
}

function add_sku() {
    $.mobile.changePage("#dialog_sku_list", "pop", true, true);
}

function onBackKeyDown() {
    var myPanel = $.mobile.activePage.children('[data-role="panel"]');

    switch ($.mobile.activePage[0].id) {
        case "pageDeliveryOrder":
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "NotDeliveryReason_page":
            $.mobile.changePage("#pageDeliveryOrder", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;

        case "series_page":
            $.mobile.changePage("#pos_skus_page", {
                transition: "none",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "dialog_startpos":
            $.mobile.changePage("#login_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "offplan_task_page":
            $.mobile.changePage("#pickupplan_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "deliver_guides_page":
            $.mobile.changePage("#manifest_guides_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "manifest_guides_page":
            if (gManifestPresent === 1) {
                $.mobile.changePage("#menu_page", {
                    transition: "flow",
                    reverse: true,

                    showLoadMsg: false
                });
            } else {
                $.mobile.changePage("#scanmanifest_page", {
                    transition: "flow",
                    reverse: true,

                    showLoadMsg: false
                });
            }

            break;
        case "scanmanifest_page":
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "PantallaDeControlDeFinDeRuta":
            estaEnControlDeFinDeRuta = false;
            $.mobile.changePage("#menu_page", {
                transition: "pop",
                reverse: true,
                showLoadMsg: false
            });
            break;
        case "pickupsignature_page":
            window.history.back();
            break;
        case "taskpickup_page":
            $.mobile.changePage("#pickupplan_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
            break;

        case "pickupplan_page":
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
            break;
        case "pageDeliverys":
            gotomypickupplan();
            break;
        case "pageManifestHeader":
            var panel = $("#UiManifestPanel");
            if (panel.panel("open")) {
                panel.panel("close");
            }
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            panel = null;
            break;
        case "pageInfInvoce":
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "taskdetail_page":
            $.mobile.changePage("#pickupplan_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;

        case "taskpickupguide_page":
            $.mobile.changePage("#taskpickup_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;

        case "taskpickuppackage_page":
            $.mobile.changePage("#taskpickupguide_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;

        case "printers_page":
            window.history.back();
            break;

        case "login_page":
            if (myPanel.css("visibility") === "hidden") {
                bluetoothSerial.disconnect(
                    function() {},
                    function() {
                        notify("Printer is unable to get disconnected");
                    }
                );
                navigator.app.exitApp();
            } else {
                myPanel.panel("toggle");
            }
            break;
        case "menu_page":
            if (myPanel.css("visibility") === "visible") {
                myPanel.panel("toggle");
            } else {
                bluetoothSerial.disconnect(
                    function() {},
                    function() {
                        notify("Printer is unable to get disconnected");
                    }
                );
                navigator.app.exitApp();
            }
            break;
        case "page_new_client":
            var newClientPanel = $.mobile.activePage.children(
                '[id="new_client_panel"] '
            );
            var clientPanel = $.mobile.activePage.children('[id="client_panel"] ');

            if (
                newClientPanel.css("visibility") === "hidden" &&
                clientPanel.css("visibility") === "hidden"
            ) {
                UsuarioDeseaCancelarClienteNuevo();
            } else {
                if (newClientPanel.css("visibility") !== "hidden")
                    newClientPanel.panel("toggle");
                else clientPanel.panel("toggle");
            }

            break;
        case "page_report_client":
            $.mobile.changePage("#pickupplan_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
            break;
        case "UiPageRepPreSale":
            if (!$("#listaFirmFotoPreVenta").is(":visible")) {
                $.mobile.changePage("#pickupplan_page", {
                    transition: "flow",
                    reverse: true,
                    showLoadMsg: false
                });
            }
            break;

        case "UiPageSalesOrderList":
            window.history.back();
            break;

        case "UiPageDocsDraft":
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
            break;
        case "UiPageTaskCompletedWithReason":
            $.mobile.changePage("#pickupplan_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });
            break;
        case "map-page":
            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
            break;
        case "UiOverdueInvoicePaymentPage":
            cobroDeFacturaVencidaControlador.irAPantallaDeCliente();
            break;
        case "UiOverdueInvoicePaymentDetailPage":
            tipoDePagoDeFacturaVencidaControlador.enviarInformacionDeDetalleDePagos(
                function() {
                    window.history.back();
                }
            );
            break;
        case "UiPaymentDetailPage":
            detalleDePagoControlador.regresarAPantallaAnterior();
            break;
        case "UiPaymentListPage":
            window.history.back();
            break;
        case "UiSelectedSkuImagePage":
            var contenedorDeImagenSeleccionada = $("#ImagenDeProductoSeleccionada");
            contenedorDeImagenSeleccionada.attr("src", "");
            contenedorDeImagenSeleccionada = null;
            window.history.back();
            break;
        case "UiProductCatalogPage":
            catalogoDeProductoControlador.usuarioDeseaRegresarAPantallaAnterior();
            break;
        case "UiSkuImagesPage":
            galeriaDeImagenControlador.usuarioDeseaRegresarAPantallaAnterior();
            break;
    }
}

function showmenu() {
    $("#popupMenu").popup("open", {
        positionTo: "#myMenuList",
        transtion: "slideup"
    });
}

function preview_picture(pID) {
    var pSrc = $("#btnPreviewImg" + pID).attr("srcpic");
    $("#popphoto").attr("src", pSrc);
    $("#popupPic")
        .popup()
        .popup("open", { transition: "none" });
}

function ShowInvoiceConfirmation() {
    $("#lblNewInvoice").text(gInvoiceNUM);
    //check if 75%

    $.mobile.changePage("#confirmation_page", {
        transition: "slide",
        reverse: true,
        changeHash: true,
        showLoadMsg: false
    });
}

function ToastThis(pMessage) {
    try {
        window.plugins.toast.show(
            pMessage,
            "short",
            "center",
            function(a) {},
            function(b) {}
        );
    } catch (e) {
        notify(e.message);
    }
}

function ShowHideOptions() {
    try {
        var pSQL = "";

        SONDA_DB_Session.transaction(
            function(tx) {
                pSQL = "SELECT * FROM PRESALES_ROUTE WHERE TASK_STATUS = 'COMPLETED'";

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        if (results.rows.length >= 1) {
                            $("#btnFinishCollecting")
                                .removeClass("ui-disabled")
                                .addClass("ui-enabled");
                        } else {
                            $("#btnFinishCollecting")
                                .removeClass("ui-enabled")
                                .addClass("ui-disabled");
                        }
                    },
                    function(tx, err) {
                        my_dialog("", "", "close");
                        notify("ShowHideOptions: " + err.message);
                    }
                );
            },
            function(err) {
                notify("ShowHideOptions.1.Error processing SQL: " + err.message);
            }
        );

        SONDA_DB_Session.transaction(
            function(tx) {
                pSQL = "SELECT * FROM MANIFEST_DETAIL WHERE GUIDE_STATUS = 'COMPLETED'";

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        if (results.rows.length >= 1) {
                            $("#btnFinishDelivery")
                                .removeClass("ui-disabled")
                                .addClass("ui-enabled");
                        } else {
                            $("#btnFinishDelivery")
                                .removeClass("ui-enabled")
                                .addClass("ui-disabled");
                        }
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        notify("ShowHideOptions: " + err.message);
                    }
                );
            },
            function(err) {
                notify("ShowHideOptions.3.Error processing SQL: " + err.message);
            }
        );
    } catch (e) {
        notify("ShowHideOptions: " + e.message);
    }
}

function notify(pMessage) {
    InteraccionConUsuarioServicio.desbloquearPantalla();
    navigator.notification.alert(
        pMessage, // message
        null, // callback to invoke with index of button pressed
        "Sonda®  " + SondaVersion,
        "OK" //button caption
    );
}

function MakeACall(pPhoneNumber) {
    phonedialer.dial(
        pPhoneNumber,
        function(err) {
            if (err === "empty") notify("Unknown phone number");
            else notify("Dialer Error:" + err);
        },
        function(success) {}
    );
}

function gettask(taskid) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pSQL = "SELECT * FROM PRESALES_ROUTE WHERE TASK_ID =" + taskid;

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        if (results.rows.length >= 1) {
                            //cambio
                            gVentaEsReimpresion = false;
                            gtaskid = taskid;
                            gTaskType = results.rows.item(0).TASK_TYPE;
                            if (gTaskType === "DRAFT") {
                                gTaskType = "PRESALE";
                            }
                            gtaskgps = results.rows.item(0).EXPECTED_GPS;
                            gClientName = results.rows.item(0).RELATED_CLIENT_NAME;
                            gClientID = results.rows.item(0).RELATED_CLIENT_CODE;

                            $("#lblClientName_pickup").text(
                                results.rows.item(0).RELATED_CLIENT_NAME
                            );
                            $("#lblAddress_pickup").text(results.rows.item(0).TASK_ADDRESS);
                            //$("#lblAddress_directions").val(results.rows.item(0).TASK_COMMENTS);

                            $("#btnMyPickupRoutePhone").text(
                                results.rows.item(0).RELATED_CLIENT_PHONE_1
                            );
                            $("#btnMyPickupRoutePhone").unbind("touchstart");
                            $("#btnMyPickupRoutePhone").bind("touchstart", function() {
                                MakeACall(results.rows.item(0).RELATED_CLIENT_PHONE_1);
                            });

                            if (gClientID === 999999) {
                                $("#btnBranchName").text("OFF-PLAN");
                                $("#txtPDE").val("OFF-PLAN");
                                $("#lblBranchAddress").text(results.rows.item(0).TASK_ADDRESS);
                                $("#txtAddressInputed").val(results.rows.item(0).TASK_ADDRESS);
                            } else {
                                $("#btnBranchName").text("");
                                $("#txtPDE").val("");
                                $("#lblBranchAddress").text("");
                                $("#txtAddressInputed").val("");
                            }

                            $("#btnTakeMeThere").unbind("touchstart");
                            $("#btnTakeMeThere").bind("touchstart", function() {
                                navigateto();
                            });

                            $("#btnTakeMeThere").unbind("touchstart");
                            $("#btnTakeMeThere").bind("touchstart", function() {
                                navigateto();
                            });

                            $("#btnNewOrder").removeClass("ui-disabled");
                            $("#btnSignatureGuide").removeClass("ui-disabled");
                            $("#btnFinishPickup").removeClass("ui-disabled");

                            $("#btnNewOrder").removeClass("ui-enabled");
                            $("#btnSignatureGuide").removeClass("ui-enabled");
                            $("#btnFinishPickup").removeClass("ui-enabled");

                            BorrarDetallesTemporales();

                            gSignated = false;
                            switch (results.rows.item(0).TASK_STATUS) {
                                case TareaEstado.Aceptada:
                                    window.gTaskIsFrom = TareaEstado.Aceptada;
                                    $("#lblRemitenteName").text(gClientName);

                                    $("#btnNewGuide").addClass("ui-enabled");
                                    $("#btnSignatureGuide").addClass("ui-enabled");
                                    $("#btnFinishPickup").addClass("ui-enabled");

                                    switch (gTaskType) {
                                        case TareaTipo.Entrega:
                                            gotomyDelivery();
                                            break;
                                        case TareaTipo.Preventa:
                                            tareaDetalleControlador.usuarioDeseaCargarTarea();
                                            break;
                                        case TareaTipo.Venta:
                                            EjecutarTareaDeVenta(gClientID);
                                            break;
                                        case TareaTipo.Obsoleto:
                                            EjecutarTareaDeVenta(gClientID);
                                            break;
                                        case TareaTipo.TomaDeInventario:
                                            tareaDetalleControlador.usuarioDeseaCargarTarea();
                                            break;
                                    }
                                    break;

                                case TareaEstado.Asignada:
                                    window.gTaskIsFrom = TareaEstado.Asignada;
                                    $("#btnNewOrder").addClass("ui-enabled");
                                    $("#btnSignatureGuide").addClass("ui-enabled");
                                    $("#btnFinishPickup").addClass("ui-enabled");

                                    //cambio
                                    $.mobile.changePage("#taskdetail_page", "flow", true, true);
                                    break;
                                case TareaEstado.Completada:
                                    window.gTaskIsFrom = TareaEstado.Completada;
                                    switch (gTaskType) {
                                        case TareaTipo.Scouting:
                                            MostrarPaginaReporte(gClientID);
                                            break;
                                        case TareaTipo.Preventa:
                                            var tareaServicio = new TareaServcio();
                                            var tarea = new Tarea();
                                            tarea.taskId = gtaskid;
                                            tareaServicio.obtenerTarea(
                                                tarea,
                                                function(tareaN1) {
                                                    if (tareaN1.completedSuccessfully) {
                                                        gVentaEsReimpresion = true;
                                                        $.mobile.changePage("#UiPageRepPreSale", {
                                                            transition: "flow",
                                                            reverse: true,
                                                            showLoadMsg: false
                                                        });
                                                    } else {
                                                        $.mobile.changePage(
                                                            "#UiPageTaskCompletedWithReason", {
                                                                transition: "flow",
                                                                reverse: true,
                                                                showLoadMsg: false
                                                            }
                                                        );
                                                    }
                                                },
                                                function(resultado) {
                                                    notify(resultado.mensaje);
                                                }
                                            );
                                            break;
                                        case TareaTipo.TomaDeInventario:
                                            usuarioDeseaVerResumenInventario();
                                            break;
                                        default:
                                            $("#lblRemitenteName").text(gClientName);
                                            $("#btnNewOrder").addClass("ui-disabled");
                                            $("#btnSignatureGuide").addClass("ui-disabled");
                                            $("#btnFinishPickup").addClass("ui-disabled");

                                            $.mobile.changePage("#taskpickup_page", {
                                                transition: "flow",
                                                reverse: true,

                                                showLoadMsg: false
                                            });
                                            break;
                                    }
                                    break;
                            }
                        }
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(gettask.0)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(gettask.1)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        console.log(e.message);
    }
}

function usuarioDeseaVerResumenInventario() {
    $.mobile.changePage("#UiPageSummaryTakeInventory", {
        transition: "flow",
        reverse: true,
        showLoadMsg: false
    });
}

function irAOrdenDeVentaValidandoSaldoDeCliente() {
    ValidarSaldoCliente(
        gClientID,
        0,
        "",
        0,
        OpcionValidarSaldoCliente.EjecutarTarea,
        gSalesOrderType,
        function() {
            SeguirTareaPreventa();
        },
        function(err) {
            notify(err.message);
        }
    );
}

function gotomydeliveryplan() {
    try {
        if (gManifestPresent === 1) {
            $.mobile.changePage("#manifest_guides_page", {
                transition: "flow",
                reverse: true,

                showLoadMsg: false
            });

            showmanifestlist("PENDING");
        } else {
            $.mobile.changePage("#scanmanifest_page", "flow", true, true);
        }
    } catch (e) {
        my_dialog("", "", "close");
        console.log(e.message);
    }
}

function gotomypickupplan() {
    $.mobile.changePage("#pickupplan_page", "flow", true, true);
}

function RefreshMyRoutePlan() {
    try {
        my_dialog("SondaÂ® " + SondaVersion, "Cargando Tareas...", "open");

        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";

                tx.executeSql(
                    "SELECT * FROM PRESALES_ROUTE", [],
                    function(tx, results) {
                        var pDomElement = $("#pickup_listview");
                        pDomElement.children().remove("li");

                        for (i = 0; i <= results.rows.length - 1; i++) {
                            var pClick = "gettask(" + results.rows.item(i).TASK_ID + ");";

                            vLI = "";
                            vLI =
                                '<li style="opacity: 1" class="ui-alt-icon ui-nodisc-icon"> <a href="#" onclick=' +
                                pClick +
                                ">";

                            var pDocNum = "";
                            if (
                                results.rows.item(i).DOC_NUM === null ||
                                results.rows.item(i).DOC_NUM === 0
                            ) {
                                if (results.rows.item(i).TASK_TYPE === "DELIVERY") {
                                    pDocNum = "Fuera de ruta";
                                } else if (
                                    results.rows.item(i).TASK_TYPE === "TAKE_INVENTORY"
                                ) {
                                    pDocNum = "Toma de Inventario";
                                } else {
                                    pDocNum = "Preventa";
                                }
                            } else {
                                pDocNum = results.rows.item(i).DOC_NUM.toString();
                            }

                            switch (results.rows.item(i).TASK_TYPE) {
                                case TareaTipo.Entrega:
                                    break;
                                default:
                                    vLI +=
                                        '<span lass="ui-li small-roboto">' +
                                        pDocNum +
                                        "</span></p>";
                                    break;
                            }

                            vLI +=
                                '<p><span class="small-roboto">' +
                                gtaskid +
                                ") " +
                                results.rows.item(i).RELATED_CLIENT_CODE +
                                " " +
                                results.rows.item(i).RELATED_CLIENT_NAME +
                                "</span></p>";
                            vLI +=
                                '<p><span class="small-roboto">' +
                                results.rows.item(i).TASK_ADDRESS +
                                "</span></p>";

                            switch (results.rows.item(i).TASK_STATUS) {
                                case TareaEstado.Asignada:
                                    vLI +=
                                        '<span class="ui-li-count small-roboto" style="background-color:yellow"><img src="css/styles/images/icons-png/notify-black.png"></span>';
                                    break;
                                case TareaEstado.Aceptada:
                                    vLI +=
                                        '<span class="ui-li-count small-roboto" style="background-color:lime"><img src="css/styles/images/icons-png/check-black.png"></span>';
                                    break;
                                case TareaEstado.Completada:
                                    vLI +=
                                        '<span class="ui-li-count small-roboto" style="background-color:lightsteelblue"><img src="css/styles/images/icons-png/tag-black.png"></span>';
                                    break;
                                default:
                                    vLI +=
                                        '<span class="ui-li-count ui-btn small-roboto" style="background-color:silver">Sin Status</span>';
                                    break;
                            }

                            switch (results.rows.item(i).NO_PICKEDUP) {
                                case 1:
                                    vLI +=
                                        '<p><span class="small-roboto" style="text-shadow: none; color:#ffffff; background-color:orangered">No Recolectado. ' +
                                        results.rows.item(i).NO_VISIT_REASON +
                                        "</span></p>";
                                    break;
                                case 0:
                                    vLI +=
                                        '<p><span class="small-roboto" style="background-color:silver"></span></p>';
                                    break;
                                default:
                                    vLI +=
                                        '<p><span class="small-roboto" style="background-color:silver"></span></p>';
                                    break;
                            }

                            vLI += "</a></li>";

                            pDomElement.append(vLI);
                            pDomElement.listview("refresh");
                        }
                        pDomElement = null;
                        my_dialog("", "", "close");
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(7)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(100)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        my_dialog("", "", "close");
        console.log(e.message);
    }
}

function saveGuide() {
    var xdate = new Date();
    var pGuideID = new Number();
    var pskus_count = $("#listview_packs_detail li").size();

    try {
        if (pskus_count >= 1) {
            xdate = getDateTime();
            var pBranchCode = $("#btnBranchID").text();
            var pClientPickup = $("#lblClientName_pickup").text();

            var pDeliveryBranchName = $("#btnBranchName").text();

            var pDeliveryBranchAddress = $("#lblBranchAddress").text();

            if (pDeliveryBranchAddress.length === 0) {
                pDeliveryBranchAddress = $("#txtAddressInputed").val();
                pDeliveryBranchName = "(sin agencia)";
            }

            var pDeliveryRoute = $("#btnGEORoute").text();
            var pDeliveryBranchPDE = $("#txtPDE").val();

            if (isNaN(pGuideID)) {
                pGuideID = 1;
            } else {
                try {
                    pGuideID = parseInt(localStorage.getItem("pGuideID")) + parseInt(1);
                    if (isNaN(pGuideID)) {
                        pGuideID = 1;
                        localStorage.setItem("pGuideID", 1);
                    }
                } catch (e) {
                    pGuideID = 1;
                    localStorage.setItem("pGuideID", 1);
                }
            }

            pNewGuideID = device.uuid.toString() + gtaskid + "" + pGuideID;

            var pTotalAmount = parseFloat($("#lblTotalOrder").text());

            SONDA_DB_Session.transaction(
                function(tx) {
                    pSQL =
                        "INSERT INTO ORDERS(ORDER_ID, CREATED_DATESTAMP, DELIVERY_ADDRESS, DELIVERY_BRANCH_PDE, DELIVERY_BRANCH_NAME, ";
                    pSQL +=
                        " DELIVERY_BRANCH_ADDRESS, STATUS, SOURCE_TASK, IS_OFFLINE, TOTAL_AMOUNT, CLIENT_CODE, CLIENT_NAME)";
                    pSQL +=
                        " VALUES('" +
                        pNewGuideID +
                        "'," +
                        "'" +
                        xdate +
                        "','" +
                        pClientPickup +
                        "','" +
                        pDeliveryBranchPDE +
                        "','" +
                        pDeliveryBranchName +
                        "','" +
                        pDeliveryBranchAddress +
                        "',";
                    pSQL +=
                        " 'CREATED'," +
                        gtaskid +
                        ", 1, " +
                        pTotalAmount +
                        ",'" +
                        gClientID +
                        "', '" +
                        pClientPickup +
                        " ')";

                    gpackages += parseFloat(pTotalAmount);
                    console.log(pSQL);

                    tx.executeSql(pSQL);

                    pSQL =
                        "UPDATE SKUS_X_ORDER SET ORDER_ID = '" +
                        pNewGuideID +
                        "' WHERE ORDER_ID = '-9999'";
                    console.log(pSQL);
                    tx.executeSql(pSQL);

                    localStorage.setItem("pGuideID", pGuideID);
                    cleanupuide();
                },
                function(err) {
                    notify("saveGuide.catch:" + err.message);
                    my_dialog("", "", "close");
                },
                function() {}
            );
        } else {
            notify("ERROR, No se puede completar un pedido vacio");
            my_dialog("", "", "close");
        }
    } catch (e) {
        notify("SaveGuide.Cath.01:" + e.message);
    }
}

function clearup_manifiesto() {
    try {
        $("#lblScannedManifest").text("");
        $("#lblGuiasManifest").text("");
        $("#lblAssignedCourier").text("");
        $("#lblPacksManifest").text("");

        $("#btnAcceptManifest").css("visibility", "hidden");
    } catch (e) {
        notify(e.message);
    }
}

function setpackage(um_code, um_desc, list_price) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var xdate = getDateTime();
                pSQL =
                    "INSERT INTO SKUS_X_ORDER(ORDER_ID, SKU_ID, SKU_DESCRIPTION, QTY, UNIT_PRICE, TOTAL_PRICE, SOURCE_TASK, IS_OFFLINE)";
                pSQL +=
                    " VALUES('-9999','" +
                    um_code +
                    "','" +
                    um_desc +
                    "', 1, " +
                    list_price +
                    ", " +
                    list_price +
                    "," +
                    gtaskid +
                    ", 1)";
                tx.executeSql(pSQL);

                console.log(pSQL);
            },
            function(tx, err) {
                my_dialog("", "", "close");
            },
            function() {
                RefreshSkusXOrder();

                $.mobile.changePage("#taskpickupguide_page", {
                    transition: "flow",
                    reverse: true,

                    showLoadMsg: false
                });
            }
        );
    } catch (e) {
        notify("setpackage.catch:" + e.message);
    }
}

function ProcessGuide() {}

function RefreshMyGuidesOnTask() {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";
                var pLocalTotal = new Number(0);

                var pSQL =
                    "SELECT ORDER_ID, DELIVERY_BRANCH_ADDRESS, DELIVERY_BRANCH_NAME, TOTAL_AMOUNT FROM ORDERS WHERE SOURCE_TASK=" +
                    gtaskid;
                console.log("RefreshMyGuidesOnTask: " + pSQL);
                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        $("#guides_listing")
                            .children()
                            .remove("li");
                        var xpackages = new Number();

                        for (i = 0; i <= results.rows.length - 1; i++) {
                            pLocalTotal += parseFloat(results.rows.item(i).TOTAL_AMOUNT);
                            var xguide_ = results.rows.item(i).ORDER_ID;

                            var xclick =
                                "get_guide_options('" + results.rows.item(i).ORDER_ID + "')";

                            vLI = "";
                            vLI =
                                '<li class="ui-nodisc-icon ui-noboxshadow ui-icon-alt" onclick="' +
                                xclick +
                                '">';
                            vLI +=
                                '<p><span class="small-roboto"><strong>' +
                                results.rows.item(i).ORDER_ID +
                                "</strong>";
                            vLI +=
                                '<p><span class="small-roboto">' +
                                results.rows.item(i).DELIVERY_BRANCH_NAME +
                                "</span></p>";
                            vLI +=
                                '<p><span class="small-roboto">' +
                                results.rows.item(i).DELIVERY_BRANCH_ADDRESS +
                                "</span></p>";
                            vLI +=
                                '<p><span class="ui-li-count small-roboto">Q ' +
                                format_number(results.rows.item(i).TOTAL_AMOUNT, 2) +
                                "</span></p>";

                            vLI += "</li>";
                            console.log(vLI);
                            $("#guides_listing").append(vLI);
                            $("#guides_listing").listview("refresh");
                        }

                        $("#btnOrderSumm").text(
                            "Q " + format_number(parseFloat(pLocalTotal), 2)
                        );

                        my_dialog("", "", "close");
                    },
                    function(tx, err) {
                        my_dialog("", "", "close");
                        notify("(21)Error processing SQL: " + err.message);
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(22)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        notify("RefreshMyGuidesOnTask:" + e.message);
    }
}

function printguide(pGuide) {
    try {
        var xdate;
        xdate = getDateTime();

        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";
                var pSQL =
                    "SELECT A.*, B.RELATED_CLIENT_CODE, B.RELATED_CLIENT_NAME FROM ORDERS A, PRESALES_ROUTE B WHERE A.ORDER_ID = '" +
                    pGuide +
                    "' AND B.TASK_ID = A.SOURCE_TASK";
                console.log(pSQL);

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        var lheader = "";
                        var i = 0;

                        if (results.rows.length >= 1) {
                            while (i <= results.rows.item(0).LABELS - 1) {
                                try {
                                    lheader = "! 0 50 50 620 1\r\n";
                                    lheader +=
                                        "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
                                    lheader += "CENTER 570 T 0 3 0 10 MOBILITY SCM\r\n";
                                    lheader += "B QR 380 60 M 2 U 8 \r\n";
                                    lheader +=
                                        "M0A," +
                                        pGuide +
                                        "-" +
                                        (i + 1) +
                                        "/" +
                                        results.rows.item(0).PACKAGES +
                                        "\r\n";
                                    lheader += "ENDQR \r\n";
                                    lheader +=
                                        "LEFT 5 T 4 4 0 70 " +
                                        (i + 1) +
                                        "/" +
                                        results.rows.item(0).PACKAGES +
                                        "\r\n";
                                    lheader += "L 5 240 570 240 1\r\n";
                                    lheader += "CENTER 570 T 0 3 0 270 GUIA: " + pGuide + "\r\n";
                                    lheader +=
                                        "LEFT 5 T 0 2 0 300 REMITENTE    : " +
                                        results.rows.item(0).RELATED_CLIENT_CODE +
                                        " " +
                                        results.rows.item(0).RELATED_CLIENT_NAME +
                                        "\r\n";
                                    lheader +=
                                        "LEFT 5 T 0 2 0 330 DESTINATARIO : " +
                                        results.rows.item(0).DESTINATION_CLIENTNAME +
                                        "\r\n";
                                    lheader +=
                                        "LEFT 5 T 0 2 0 360 " +
                                        results.rows.item(0).DELIVERY_BRANCH_NAME +
                                        " " +
                                        results.rows.item(0).DELIVERY_BRANCH_ADDRESS +
                                        "\r\n";
                                    lheader +=
                                        "LEFT 5 T 0 2 0 390 COURIER      : " +
                                        gUserCode +
                                        " " +
                                        gLoggedUser +
                                        "\r\n";
                                    lheader +=
                                        "LEFT 5 T 0 2 0 420 FECHA Y HORA : " + xdate + "\r\n";
                                    lheader += "L 5 470 570 470 1\r\n";
                                    lheader += "CENTER 570 T 0 1 1 500 www.mobilityscm.com\r\n";

                                    lheader += "\r\nPRINT\r\n";
                                } catch (e) {
                                    notify("error en header:" + e.message);
                                }

                                bluetoothSerial.write(
                                    lheader,
                                    function() {},
                                    function() {
                                        notify("unable to write to printer");
                                    }
                                );

                                i++;
                            }
                        }

                        my_dialog("", "", "close");
                    },
                    function(txt, err) {
                        my_dialog("", "", "close");
                        notify("(2)Error processing SQL: " + err.message);
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(3)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        notify("printguide.catch:" + e.message);
    }
}

function GuideCompleted() {
    try {
        navigator.notification.confirm(
            "Pedido completo?", // message
            function(buttonIndex) {
                if (buttonIndex === 2) {
                    var pskus_count = $("#listview_packs_detail li").size();

                    if (pskus_count >= 1) {
                        my_dialog("Enviando Pedido", "Procesando...", "close");
                        saveGuide();
                        printguide(pNewGuideID);
                        my_dialog("", "", "close");

                        $.mobile.changePage("#taskpickup_page", {
                            transition: "flow",
                            reverse: true,

                            showLoadMsg: false
                        });
                    } else {
                        notify("ERROR, el pedido aun esta vacio, no puede ser completada.");
                    }
                }
            }, // callback to invoke with index of button pressed
            "Sonda® Ruta " + SondaVersion, // title
            "No,Si" // buttonLabels
        );
    } catch (e) {
        notify("GuideCompleted:" + e.message);
    }
}

function updatepackage(um_code) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var xdate = getDateTime();
                var pqty = $("#pack_qty_" + um_code.replace(" ", "")).val();

                pSQL =
                    "UPDATE SKUS_X_ORDER SET QTY = " +
                    pqty +
                    " WHERE ORDER_ID = '-9999' AND SKU_ID = '" +
                    um_code +
                    "'";
                console.log(pSQL);

                tx.executeSql(pSQL);
            },
            function(tx, err) {
                my_dialog("", "", "close");
                notify("um.add.row:" + err);
            },
            function() {
                RefreshSkusXOrder();
            }
        );
    } catch (e) {
        notify("updatepackage:" + e.message);
    }
}

function removepackage(um_code) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var xdate = getDateTime();

                pSQL =
                    "DELETE FROM SKUS_X_ORDER WHERE ORDER_ID = '-9999' AND SKU_ID = '" +
                    um_code +
                    "'";
                console.log(pSQL);

                tx.executeSql(pSQL);
            },
            function(tx, err) {
                my_dialog("", "", "close");
                notify("um.add.row:" + err);
            },
            function() {
                RefreshSkusXOrder();
            }
        );
    } catch (e) {
        notify("removepackage:" + e.message);
    }
}

function qtykeyup(pUM) {
    try {
        updatepackage(pUM);
    } catch (e) {
        notify("keyup:" + e.message);
    }
}

function RefreshSkusXOrder() {
    try {
        my_dialog("Paquetes", "cargando datos...", "open");

        var vLI = "";
        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";
                var pRunningTotal = new Number(0);
                $("#divSKUsOrder").collapsible("expand");
                tx.executeSql(
                    "SELECT * FROM SKUS_X_ORDER WHERE ORDER_ID = '-9999'", [],
                    function(tx, results) {
                        $("#listview_packs_detail")
                            .children()
                            .remove("li");
                        $("#lblTotalOrder").text("0.00");

                        for (i = 0; i <= results.rows.length - 1; i++) {
                            var pClickRemove =
                                "removepackage('" + results.rows.item(i).SKU_ID + "');";
                            var pClickUpdate =
                                "updatepackage('" + results.rows.item(i).SKU_ID + "');";

                            var pKeyUp = "qtykeyup('" + results.rows.item(i).SKU_ID + "');";

                            vLI = "";
                            vLI =
                                '<li data-corners="false" data-mini="true" class="ui-alt-icon ui-nodisc-icon ui-btn ui-shadow ui-btn-icon-tag "><a href="#">';

                            vLI +=
                                '<p><span class="small-roboto">' +
                                results.rows.item(i).SKU_DESCRIPTION +
                                "</span></p>";

                            vLI += '<p><div data-role="controlgroup" data-type="horizontal">';
                            vLI +=
                                '<input style="width:35%" class="ui-btn-a ui-corner-all small-roboto allownumericwithoutdecimal" data-corners="true" onblur="' +
                                pKeyUp +
                                '" type="text" id="pack_qty_' +
                                results.rows.item(i).SKU_ID.replace(" ", "") +
                                '" value="' +
                                results.rows.item(i).QTY +
                                '">';

                            vLI +=
                                '<span class="small-roboto"> P/U Q ' +
                                format_number(results.rows.item(i).UNIT_PRICE, 2) +
                                "</span></p>";
                            vLI +=
                                '<span class="small-roboto ui-li-count">Q' +
                                format_number(
                                    parseFloat(results.rows.item(i).UNIT_PRICE) *
                                    parseFloat(results.rows.item(i).QTY),
                                    2
                                ) +
                                "</span>";
                            vLI += "</div></a>";

                            vLI += '<a href="#"  onclick="' + pClickRemove + '"></a></li>';

                            $("#listview_packs_detail").append(vLI);
                            $("#listview_packs_detail").listview("refresh");

                            pRunningTotal =
                                parseFloat(pRunningTotal) +
                                parseFloat(results.rows.item(i).UNIT_PRICE) *
                                parseFloat(results.rows.item(i).QTY);

                            $("#lblTotalOrder").text(format_number(pRunningTotal, 2));
                        }

                        my_dialog("", "", "close");
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(4)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(1)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        my_dialog("", "", "close");
        console.log(e.message);
    }
}

function refresh_guidetodeliver_stats() {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";
                $("#manifest_guides_listview")
                    .children()
                    .remove("li");

                var pSQL =
                    "SELECT * FROM MANIFEST_DETAIL WHERE INVOICE_ID = '" +
                    gGuideToDeliver +
                    "'";
                console.log(pSQL);

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        $("#lblGuideToDeliver").text("Guia:" + gGuideToDeliver);

                        gGuideScannedPacks = results.rows.item(0).SCANNED_PACKS;
                        $("#lblScannedPacks").text(gGuideScannedPacks);

                        var pPacks = results.rows.item(0).PACKAGES;
                        $("#lblGuidePacks").text(pPacks);

                        var pLabels = results.rows.item(0).LABELS;
                        $("#lblGuideLabels").text(pLabels);

                        var pPacksPending = parseInt(pPacks) - parseInt(gGuideScannedPacks);
                        $("#lblPendingPacks").text(pPacksPending);

                        if (parseInt(gGuideScannedPacks) >= parseInt(pLabels)) {
                            $("#btnDeliveryPhotoSignature").removeClass("ui-disabled");
                        }

                        gPACKAGES_ToDeliver = results.rows.item(0).PACKAGES;
                        gRELATED_CLIENT_NAME_ToDeliver = results.rows.item(0).CLIENT_NAME;
                        gDESTINATION_CLIENTNAME_ToDeliver =
                            results.rows.item(0).DESTINATION_CLIENTNAME +
                            ". " +
                            results.rows.item(0).DESTINATION_ADDRESS;

                        my_dialog("", "", "close");
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(6)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(6)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        notify("refresh_guidetodeliver_stats:" + e.message);
    }
}

function getguide(pguide) {
    try {
        gGuideToDeliver = pguide;

        my_dialog("Entregar Guia", "cargando datos...", "open");

        $.mobile.changePage("#deliver_guides_page", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });

        refresh_guidetodeliver_stats();

        my_dialog("", "", "close");
    } catch (e) {
        my_dialog("", "", "close");

        notify("get_guide:" + e.message);
    }
}

function showmanifestlist(pstatus) {
    SONDA_DB_Session.transaction(
        function(tx) {
            var pDoc = "";
            var pImg = "";
            $("#manifest_guides_listview")
                .children()
                .remove("li");

            var pSQL =
                "SELECT * FROM MANIFEST_DETAIL WHERE INVOICE_STATUS = '" +
                pstatus +
                "'";

            tx.executeSql(
                pSQL, [],
                function(tx, results) {
                    var i;
                    for (i = 0; i <= results.rows.length - 1; i++) {
                        var pClick = "";

                        vLI = "";
                        var vLIStat = "";

                        switch (results.rows.item(i).GUIDE_STATUS) {
                            case "PENDING":
                                pClick = "getguide(" + results.rows.item(i).GUIDE_ID + ");";
                                vLIStat +=
                                    '<span class="small-roboto" style="background-color:yellow"><img src="css/styles/images/icons-png/notify-black.png"></span>';
                                break;
                            case "ACCEPTED":
                                //pClick = "getguide(" + results.rows.item(i).GUIDE_ID + ");";
                                pClick =
                                    "EjecutarTareaDeVenta(" +
                                    results.rows.item(i).RELATED_CLIENT_CODE +
                                    ")";
                                vLIStat +=
                                    '<span class="small-roboto" style="background-color:lime"><img src="css/styles/images/icons-png/check-black.png"></span>';
                                break;
                            case "DELIVERED":
                                pClick = 'notify("Pedido ya fue entregado");';
                                vLIStat +=
                                    '<span class="small-roboto" style="background-color:lightsteelblue"><img src="css/styles/images/icons-png/tag-black.png"></span>';
                                break;
                            default:
                                vLIStat +=
                                    '<span class="small-roboto" style="background-color:silver">' +
                                    results.rows.item(i).GUIDE_STATUS +
                                    "</span>";
                                break;
                        }

                        vLI =
                            '<li class="ui-alt-icon ui-nodisc-icon ui-btn ui-shadow ui-btn-icon-tag"> <a href="#" onclick=' +
                            pClick +
                            ">";
                        vLI +=
                            '<p><span class="small-roboto">' +
                            vLIStat +
                            results.rows.item(i).GUIDE_SEQ +
                            ") " +
                            results.rows.item(i).GUIDE_ID +
                            " " +
                            results.rows.item(i).DESTINATION_CLIENTNAME +
                            "</span></p>";
                        vLI +=
                            '<p><textarea cols="25" rows="2" class="small-roboto">' +
                            results.rows.item(i).DESTINATION_ADDRESS +
                            "</textarea></p>";
                        vLI +=
                            '<p><span class="ui-li-count">' +
                            results.rows.item(i).PACKAGES +
                            "</span></p>";
                        vLI += "</a></li>";

                        $("#manifest_guides_listview").append(vLI);
                        $("#manifest_guides_listview").listview("refresh");
                    }
                    my_dialog("", "", "close");
                },
                function(tx, err) {
                    my_dialog("", "", "close");
                    if (err.code !== 0) {
                        notify("(5)Error processing SQL: " + err.message);
                    }
                }
            );
        },
        function(err) {
            if (err.code !== 0) {
                notify("(1)Error processing SQL: " + err.code);
            }
        }
    );
}

function welcome_back() {
    try {
        my_dialog("", "", "close");

        cordova.plugins.notification.badge.configure({ autoClear: true });
        cordova.plugins.notification.badge.configure({ smallIcon: "icon" });
        cordova.plugins.notification.badge.configure({
            title: "%d Nueva(s) tareas"
        });

        gCurrentRoute = "";

        ximg = localStorage.getItem("LOGIN_IMAGE");

        xlast_username = localStorage.getItem("LAST_LOGIN_NAME");

        gCurrentRoute = localStorage.getItem("LAST_LOGIN_ROUTE");

        $("#loginimg").attr("src", ximg);
        $("#lblnameuser").text(xlast_username);
        $("#lblnameuser1").text(xlast_username);

        gdbuser = localStorage.getItem("dbuser");
        gdbuserpass = localStorage.getItem("dbuserpass");

        clearTimeout(gTimeout);
        if (localStorage.getItem("isPrinterZebra") !== "1") {
            ConectarImpresora(localStorage.getItem("PRINTER_ADDRESS"), function() {});
        }

        gManifestPresent = localStorage.getItem("MANIFEST_PRESENT");
        gManifestID = localStorage.getItem("MANIFEST_SCANNED");

        var estadoDeLaRuta = localStorage.getItem("POS_STATUS");

        if (estadoDeLaRuta !== "OPEN") {
            MostrarPaginaDeInicioDeRuta();
        } else {
            var intervalRoutePlan = setInterval(function() {
                if (socket) {
                    socket.emit("getmyrouteplan", {
                        loginid: gLastLogin,
                        dbuser: gdbuser,
                        dbuserpass: gdbuserpass
                    });
                    clearInterval(intervalRoutePlan);
                }
            }, 1000);

            $.mobile.changePage("#menu_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
        }
    } catch (e) {
        notify("ERROR.welcome_back.catch: " + e.message);
    }
}

function finishdeliveryroute() {
    navigator.notification.confirm(
        "Confirma finalizacion de ruta de entrega?", // message
        function(buttonIndex) {
            if (buttonIndex === 2) {
                localStorage.removeItem("MANIFEST_PRESENT");

                SONDA_DB_Session.transaction(
                    function(tx) {
                        pSQL = "DELETE FROM MANIFEST_DETAIL";
                        console.log(pSQL);

                        tx.executeSql(pSQL);
                    },
                    function(tx, err) {
                        my_dialog("", "", "close");
                        notify("finishdeliveryroute.CATCH:" + err);
                    },
                    function() {
                        navigator.app.exitApp();
                    }
                );
            }
        }, // callback to invoke with index of button pressed
        "SondaÂ® Ruta " + SondaVersion, // title
        "No,Si" // buttonLabels
    );
}

function getzpl() {
    socket.emit("getzpl", { labelid: "STANDARD_GUIDE" });
}

function filtermydispatchplan(pstatus) {
    try {
        my_dialog("Ruta de despacho", "cargando datos...", "open");

        showmanifestlist(pstatus);
    } catch (e) {
        my_dialog("", "", "close");
        notify("filtermy.catch:" + e.message);
        console.log(e.message);
    }
}

function filtermyplan(pstatus) {
    try {
        var pdomElement;

        my_dialog("SondaÂ® " + SondaVersion, "Cargando Tareas...", "open");

        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";

                tx.executeSql(
                    "SELECT * FROM PRESALES_ROUTE WHERE TASK_STATUS = '" +
                    pstatus +
                    "' ORDER BY TASK_SEQ", [],
                    function(tx, results) {
                        pdomElement = $("#pickup_listview");
                        pdomElement.children().remove("li");

                        for (i = 0; i <= results.rows.length - 1; i++) {
                            var pClick = "gettask(" + results.rows.item(i).TASK_ID + ");";
                            //pClick = "EjecutarTareaDeVenta(" + results.rows.item(i).RELATED_CLIENT_CODE + ")";

                            vLI = "";

                            vLI =
                                '<li style="opacity: 1" class="ui-alt-icon ui-nodisc-icon"> <a href="#" onclick=' +
                                pClick +
                                ">";
                            /*
                                          switch (results.rows.item(i).TASK_TYPE) {
                                              case TareaTipo.Entrega:
                                                  //vLI += '<img src="img/E.png" style="top:5px; margin-left:5px">';
                                                  break;
                                              case TareaTipo.Preventa:
                                                  vLI += '<img src="img/P.png" style="top:5px; margin-left:5px">';
                                                  break;
                                              case TareaTipo.Venta:
                                                  vLI += '<img src="img/S.png" style="top:5px; margin-left:5px">';
                                                  break;
                                              case TareaTipo.Obsoleto:
                                                  vLI += '<img src="img/S.png" style="top:5px; margin-left:5px">';
                                                  break;
                                              case TareaTipo.Scouting:
                                                  vLI += '<img src="img/SC.png" style="top:5px; margin-left:5px">';
                                                  break;
                                          }*/

                            var pDocNum = "";
                            if (
                                results.rows.item(i).DOC_NUM === null ||
                                results.rows.item(i).DOC_NUM === 0
                            ) {
                                switch (results.rows.item(i).TASK_TYPE) {
                                    case TareaTipo.Entrega:
                                        pDocNum = "Entrega";
                                        break;
                                    case TareaTipo.Preventa:
                                        pDocNum = "Preventa";
                                        break;
                                    case TareaTipo.Venta:
                                        pDocNum = "Venta";
                                        break;
                                    case TareaTipo.Obsoleto:
                                        pDocNum = "Venta";
                                        break;
                                    case TareaTipo.Scouting:
                                        pDocNum = "Scouting";
                                        break;
                                    default:
                                        pDocNum = "Fuera de ruta";
                                        break;
                                }
                            } else {
                                pDocNum = results.rows.item(i).DOC_NUM.toString();
                            }
                            if (results.rows.item(i).DOC_NUM !== TareaTipo.Entrega) {
                                vLI +=
                                    '<span lass="ui-li small-roboto">' + pDocNum + "</span></p>";
                            }
                            //vLI = '<li class="ui-alt-icon ui-nodisc-icon ui-btn ui-shadow ui-btn-icon-tag"> <a href="#" onclick='+ pClick +'>';
                            vLI +=
                                '<p><span class="small-roboto">' +
                                (i + 1) +
                                ") " +
                                results.rows.item(i).RELATED_CLIENT_CODE +
                                " " +
                                results.rows.item(i).RELATED_CLIENT_NAME +
                                "</span></p>";
                            vLI +=
                                '<p><span class="small-roboto">' +
                                results.rows.item(i).TASK_ADDRESS +
                                "</span></p>";

                            switch (results.rows.item(i).TASK_STATUS) {
                                case TareaEstado.Asignada:
                                    vLI +=
                                        '<span class="ui-li-count small-roboto" style="background-color:yellow"><img src="css/styles/images/icons-png/notify-black.png"></span>';
                                    break;
                                case TareaEstado.Aceptada:
                                    vLI +=
                                        '<span class="ui-li-count small-roboto" style="background-color:lime"><img src="css/styles/images/icons-png/check-black.png"></span>';
                                    break;
                                case TareaEstado.Completada:
                                    vLI +=
                                        '<span class="ui-li-count small-roboto" style="background-color:lightsteelblue"><img src="css/styles/images/icons-png/tag-black.png"></span>';
                                    break;
                                default:
                                    vLI +=
                                        '<span class="ui-li-count ui-btn small-roboto" style="background-color:silver">Sin Status ' +
                                        results.rows.item(i).TASK_STATUS +
                                        "</span>";
                                    break;
                            }

                            switch (results.rows.item(i).NO_PICKEDUP) {
                                case 1:
                                    vLI +=
                                        '<p><span class="small-roboto" style="text-shadow: none; color:#ffffff; background-color:orangered">No Recolectado. ' +
                                        results.rows.item(i).NO_VISIT_REASON +
                                        "</span></p>";
                                    break;
                                case 0:
                                    vLI +=
                                        '<p><span class="small-roboto" style="background-color:silver"></span></p>';
                                    break;
                                default:
                                    vLI +=
                                        '<p><span class="small-roboto" style="background-color:silver"></span></p>';
                                    break;
                            }

                            vLI += "</a></li>";

                            pdomElement.append(vLI);
                            pdomElement.listview("refresh");
                        }
                        pdomElement = null;
                        my_dialog("", "", "close");
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(6)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(1)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        my_dialog("", "", "close");
        notify("filterplan:" + e.message);
        console.log(e.message);
    }
}

function trunc_number(pnumber, decimals) {
    var result = parseFloat(format_number(pnumber, decimals));
    return result;
}

function format_number(cantidad, decimals) {
    if (isNaN(cantidad)) {
        return 0;
    }

    if (cantidad === "") {
        return 0;
    }

    var result = parseFloat(cantidad > 0 ? (cantidad * 100) / 100 : 0).toFixed(
        decimals
    );
    return result;
}

function getDateTime() {
    var dateTime = ObtenerFecha() + " " + ObtenerHora();
    return dateTime;
}

function ObtenerFecha() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();

    if (month.toString().length === 1) {
        month = "0" + month;
    }
    if (day.toString().length === 1) {
        day = "0" + day;
    }

    var dateTime = year + "/" + month + "/" + day;
    return dateTime;
}

function ObtenerHora() {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    if (hour.toString().length === 1) {
        hour = "0" + hour;
    }
    if (minute.toString().length === 1) {
        minute = "0" + minute;
    }
    if (second.toString().length === 1) {
        second = "0" + second;
    }
    var dateTime = hour + ":" + minute + ":" + second;
    return dateTime;
}

function ObtenerFechaFutura(diasAdicionales) {
    var fecha = new Date(Date.parse(ObtenerFecha()));
    var dia = fecha.getDate();
    fecha.setDate(dia + diasAdicionales);
    return (
        fecha.getFullYear() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getDate()
    );
}

function closeprinter() {
    bluetoothSerial.disconnect(
        function() {
            notify("Printer is disconnected");
        },
        function() {
            notify("Printer is unable to get disconnected");
        }
    );
}

function printinvoice_joininfo(pInvoiceID, pIsRePrinted) {
    var lheader = "";
    var ldetail = "";
    var lfooter = "";

    try {
        pSQL =
            "SELECT A.*, B.* FROM INVOICE_HEADER A, INVOICE_DETAIL B WHERE A.INVOICE_NUM = " +
            pInvoiceID;
        pSQL +=
            " AND B.INVOICE_NUM = A.INVOICE_NUM AND A.IS_CREDIT_NOTE = 0 AND B.IS_ACTIVE = 1 AND B.EXPOSURE = 1";

        SONDA_DB_Session.transaction(function(tx) {
            tx.executeSql(
                pSQL, [],
                function(tx, results) {
                    var print_doc_len = new Number();
                    var pExpiresAuth = localStorage.getItem("SAT_RES_EXPIRE");

                    print_doc_len = 290; //header;
                    print_doc_len += parseInt(parseInt(results.rows.length) * 150); //detail
                    print_doc_len += parseInt(290); //footer

                    var pRes = localStorage.getItem("POS_SAT_RESOLUTION");

                    lheader = "! 0 50 50 " + print_doc_len + " 1\r\n";
                    lheader +=
                        "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
                    lheader += "CENTER 550 T 1 2 0 10 Ways, S.A / Ways, Zacapa\r\n";
                    lheader +=
                        "CENTER 550 T 0 2 0 60 Calzada La Paz, Ofibodega Centro 5, Bodega #13 18-40, Guatemala Ciudad\r\n";
                    lheader += "CENTER 550 T 0 2 0 90 SUJETO A PAGOS TRIMESTRALES\r\n";
                    lheader += "CENTER 550 T 0 2 0 120 NIT: 3517713-6\r\n";
                    lheader += "CENTER 550 T 0 2 0 150 ResoluciÃ³n #: " + pRes + " \r\n";
                    lheader +=
                        "CENTER 550 T 0 2 0 180 Fecha Auto. : " +
                        pCurrentSAT_Res_Date +
                        " \r\n";
                    lheader +=
                        "CENTER 550 T 0 2 0 210 Resol.Vence : " + pExpiresAuth + " \r\n";
                    lheader +=
                        "CENTER 550 T 0 2 0 240 Del: " +
                        pCurrentSAT_Res_DocStart +
                        " Al: " +
                        pCurrentSAT_Res_DocFinish +
                        "\r\n";
                    lheader +=
                        "CENTER 550 T 0 3 0 280 Factura Serie " +
                        results.rows.item(0).SAT_SERIE +
                        " # " +
                        pInvoiceID +
                        "\r\n";
                    lheader += "L 5 310 570 310 1\r\n";
                    lheader +=
                        "CENTER 550 T 0 2 0 340 A NOMBRE DE: NIT:" +
                        results.rows.item(0).CLIENT_ID +
                        "-" +
                        results.rows.item(0).CLIENT_NAME +
                        "\r\n";
                    lheader += "L 5 370 570 370 1\r\n";

                    var pRow = 410;

                    ldetail = "";
                    var pImei = 0;
                    var pImeiPrint = 0;
                    var i;
                    for (i = 0; i <= results.rows.length - 1; i++) {
                        ldetail =
                            ldetail +
                            "LEFT 5 T 0 2 0 " +
                            pRow +
                            " " +
                            results.rows.item(i).SKU +
                            "- " +
                            results.rows.item(i).SKU_NAME +
                            "\r\n";
                        pRow += parseInt(30);

                        ldetail =
                            ldetail +
                            "LEFT 5 T 0 2 0 " +
                            pRow +
                            " CANTIDAD: " +
                            results.rows.item(i).QTY +
                            " / PREC.UNIT. : Q" +
                            format_number(results.rows.item(i).PRICE, 2) +
                            "\r\n";
                        pRow += parseInt(30);

                        pImei = results.rows.item(i).SERIE_2;
                        if (isNaN(pImei)) {
                            pImeiPrint = 0;
                        } else {
                            pImeiPrint = pImei;
                        }

                        ldetail =
                            ldetail +
                            "LEFT 5 T 0 2 0 " +
                            pRow +
                            " SERIE: " +
                            results.rows.item(i).SERIE +
                            "/ IMEI: " +
                            pImeiPrint +
                            "/ " +
                            results.rows.item(i).PHONE +
                            "\r\n";
                        pRow += parseInt(30);

                        ldetail =
                            ldetail +
                            "RIGHT 550 T 0 2 0 " +
                            (pRow - 90) +
                            " Q" +
                            format_number(results.rows.item(i).PRICE, 2) +
                            "\r\n";

                        ldetail = ldetail + "L 5 " + pRow + " 570 " + pRow + " 1\r\n";
                        pRow += parseInt(10);
                    }

                    pRow += parseInt(30);
                    lfooter = "LEFT 5 T 0 2 0 " + pRow + " TOTAL: \r\n";
                    lfooter =
                        lfooter +
                        "RIGHT 550 T 0 2 0 " +
                        pRow +
                        " Q" +
                        format_number(results.rows.item(0).TOTAL_AMOUNT, 2) +
                        "\r\n";

                    pRow += parseInt(30);
                    lfooter += "LEFT 5 T 0 2 0 " + pRow + " EFECTIVO: \r\n";
                    lfooter +=
                        "RIGHT 550 T 0 2 0 " +
                        pRow +
                        " Q" +
                        format_number(
                            Number(results.rows.item(0).TOTAL_AMOUNT) +
                            Number(results.rows.item(0).CHANGE),
                            2
                        ) +
                        "\r\n";

                    pRow += parseInt(30);
                    lfooter += "LEFT 5 T 0 2 0 " + pRow + " CAMBIO: \r\n";
                    lfooter +=
                        "RIGHT 550 T 0 2 0 " +
                        pRow +
                        " Q" +
                        format_number(results.rows.item(0).CHANGE, 2) +
                        "\r\n";

                    pRow += parseInt(30);
                    lfooter +=
                        "CENTER 550 T 0 2 0 " +
                        pRow +
                        " " +
                        getDateTime() +
                        " / RUTA " +
                        gCurrentRoute +
                        " \r\n";

                    pRow += parseInt(30);
                    lfooter += lfooter + "L 5  " + pRow + " 570 " + pRow + " 1\r\n";

                    pRow += parseInt(30);
                    lfooter +=
                        "CENTER 550 T 0 2 0 " + pRow + " " + pIsRePrinted + "\r\nPRINT\r\n";

                    //pIsRePrinted lfooter = lfooter + "";CENTER 550 T 0 2 0 " + pRow + " " + getDateTime() + " / RUTA " + gCurrentRoute + " \r\n
                    pCpCl = lheader + ldetail + lfooter;
                    var x = 0;

                    for (
                        i = 0; i <= 1; i++ //print twice, one copy for the client, one for backoffice.
                    ) {
                        bluetoothSerial.write(
                            pCpCl,
                            function() {},
                            function() {
                                notify("unable to write to printer");
                            }
                        );

                        if (i === 0) {
                            lfooter = "CENTER 550 T 0 2 0 50 *** ORIGINAL CLIENTE ***\r\n";
                        } else {
                            lfooter = "CENTER 550 T 0 2 0 50 *** COPIA CONTABILIDAD ***\r\n";
                        }

                        lfooter = lfooter + "L 5  80 570 80 1\r\nPRINT\r\n";
                        print_doc_len = 150;

                        lheader = "! 0 50 50 " + print_doc_len + " 1\r\n";
                        lheader +=
                            "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
                        bluetoothSerial.write(
                            lheader + lfooter,
                            function() {},
                            function() {
                                notify("unable to write to printer");
                            }
                        );
                    }

                    bluetoothSerial.disconnect(
                        function() {},
                        function() {
                            notify("Printer is unable to get disconnected");
                        }
                    );

                    my_dialog("", "", "close");
                },
                function(err) {
                    my_dialog("", "", "close");
                    notify("ERROR, 8.1.17: " + err.code);
                    return err.code;
                }
            );
        });
        my_dialog("", "", "close");
    } catch (e) {
        notify("print.invoice.catch:" + e.message);
        my_dialog("", "", "close");
        return e.message;
    }
}

function savezpl() {
    try {
        var pTextZPL = $("#text_prtZpl").text();
        socket.emit("savezpl", { labelid: "STANDARD_GUIDE", zpltext: pTextZPL });
    } catch (e) {
        notify(e.message);
    }
}

function printtest(pPrinterAddress, pType) {
    try {
        var lheader = "";
        var xdate = getDateTime();

        lheader = "! 0 50 50 620 1\r\n";
        lheader +=
            "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
        lheader += "CENTER 570 T 0 3 0 10 MOBILITY SCM\r\n";
        lheader += "B QR 380 60 M 2 U 8 \r\n";
        lheader += "M0A,1234515155-1/1\r\n";
        lheader += "ENDQR \r\n";
        lheader += "LEFT 5 T 4 4 0 70 1/1\r\n";
        lheader += "L 5 240 570 240 1\r\n";
        lheader += "CENTER 570 T 0 3 0 270 GUIA: 1234515155\r\n";
        lheader +=
            "LEFT 5 T 0 2 0 300 REMITENTE    : CODIGO Y NOMBRE REMITENTE\r\n";
        lheader +=
            "LEFT 5 T 0 2 0 330 DESTINATARIO : CODIGO Y NOMBRE DESTINATARIO\r\n";
        lheader += "LEFT 5 T 0 2 0 360 DIRECCION DESTINARIO 1\r\n";
        lheader += "LEFT 5 T 0 2 0 390 COURIER      : CODIGO, NOMBRE COURIER\r\n";
        lheader += "LEFT 5 T 0 2 0 420 FECHA Y HORA : " + xdate + "\r\n";
        lheader += "L 5 470 570 470 1\r\n";
        lheader += "CENTER 570 T 0 1 1 500 www.mobilityscm.com\r\n";

        lheader += "\r\nPRINT\r\n";
        lheader += '! U1 getvar "device.host_status"\r\n';
        $("#lblScannedQR").text("");

        /*bluetoothSerial.isConnected(
                function () {
                    
                    my_dialog("", "", "close");
                    bluetoothSerial.write(lheader, function () { }, function () { notify('unable to write to printer'); });
                    //bluetoothSerial.disconnect(function () { }, function () { notify('Printer is unable to get disconnected'); });
                    $(".printerclass").buttonMarkup({ icon: "print" });
                    gPrinterIsAvailable = 1;

                },
                function () {
                    bluetoothSerial.connectInsecure(pPrinterAddress,
                        function () {
                            
                            my_dialog("", "", "close");
                            bluetoothSerial.write(lheader, function () { }, function () { notify('unable to write to printer'); });
                            //bluetoothSerial.disconnect(function () { }, function () { notify('Printer is unable to get disconnected'); });
                            gPrinterIsAvailable = 1;
                            $(".printerclass").buttonMarkup({ icon: "print" });
                        },
                        function () {
                            $(".printerclass").buttonMarkup({ icon: "delete" });

                            notify("ERROR, No se pudo conectar a la impresora:" + pPrinterAddress);
                            my_dialog("", "", "close");
                            gPrinterIsAvailable = 0;

                        }
                    );
                }
            );*/

        try {
            bluetoothSerial.isConnected(
                function() {
                    try {
                        $(".printerclass").buttonMarkup({ icon: "print" });
                        bluetoothSerial.write(
                            lheader,
                            function() {
                                DesconectarImpresora(
                                    function() {
                                        console.log("Disconnect succesful");
                                        return true;
                                    },
                                    function() {
                                        notify("Unable to disconnect from printer");
                                        return false;
                                    }
                                );
                            },
                            function() {
                                notify("unable to write to printer");
                            }
                        );
                        gPrinterIsAvailable = 1;
                    } catch (ex) {
                        console.log(ex.message);
                    }
                },
                function() {
                    $(".printerclass").buttonMarkup({ icon: "print" });
                    bluetoothSerial.connect(
                        pPrinterAddress,
                        function() {
                            $(".printerclass").buttonMarkup({ icon: "print" });
                            try {
                                bluetoothSerial.write(
                                    lheader,
                                    function() {
                                        DesconectarImpresora(
                                            function() {
                                                console.log("Disconnect succesful");
                                            },
                                            function() {
                                                notify("Unable to disconnect from printer");
                                            }
                                        );
                                    },
                                    function() {
                                        notify("unable to write to printer");
                                    }
                                );
                                gPrinterIsAvailable = 1;
                            } catch (e) {
                                console.log(e.message);
                            }
                        },
                        function() {
                            notify(
                                "ERROR, No se pudo conectar a la impresora:" + pPrinterAddress
                            );
                            gPrinterIsAvailable = 0;
                        }
                    );
                    ToastThis("Conectado a " + pPrinterAddress);
                }
            );
        } catch (e) {
            notify("print.guide.catch:" + e.message);
        }
        my_dialog("", "", "close");
    } catch (e) {
        notify("print.test.catch:" + e.message);
    }
}

function onBatteryStatus(info) {
    // Handle the online event
    gBatteryLevel = info.level;

    $(".batteryclass" + "" + "" + "").text("    " + gBatteryLevel + "%");
    switch (true) {
        case gBatteryLevel < 6:
            $(".batteryclass").addClass("fa-battery-empty");
            break;

        case gBatteryLevel > 5 && gBatteryLevel < 45:
            $(".batteryclass").addClass("fa-battery-quarter");
            break;

        case gBatteryLevel > 44 && gBatteryLevel < 70:
            $(".batteryclass").addClass("fa-battery-half");
            break;

        case gBatteryLevel > 69 && gBatteryLevel < 95:
            $(".batteryclass").addClass("fa-battery-three-quarters");
            break;

        case gBatteryLevel > 94 && gBatteryLevel < 101:
            $(".batteryclass").addClass("fa-battery-full");
            break;
    }
    //$('.batteryclass').buttonMarkup({ icon: "battery-full" });
    $(".batteryclass").css("color", "white");
}

function onBatteryCritical(info) {
    // Handle the battery critical event
    gBatteryLevel = info.level;

    $(".batteryclass").text(gBatteryLevel + "%");
    $(".batteryclass").buttonMarkup({ icon: "delete" });
    $(".batteryclass").css("color", "white");

    notify("Critical Battery Level " + info.level + "%\n Â¡Recarge pronto!");
}

function onBatteryLow(info) {
    // Handle the battery low event
    gBatteryLevel = info.level;

    $(".batteryclass").text(gBatteryLevel + "%");
    $(".batteryclass").buttonMarkup({ icon: "notify" });
    $(".batteryclass").css("color", "white");

    notify("Low Battery Level " + info.level + "%");
}

function getType(sender) {
    var tp = sender.name;
    return tp;
}

function ShowListPicker(options, callback) {
    window.plugins.listpicker.showPicker(options, callback);
}

var logOb;

function onDeviceReady() {
    const path = cordova.file.externalDataDirectory;
    console.log(path)
    window.resolveLocalFileSystemURL(path, (dir) => {
        console.log("got main dir", dir);
        dir.getFile("conf.json", { create: true }, (file) => {
            console.log("got the file", file);
            logOb = file;
        });
    });
    try {
        $("#login_isonline").text("OFF");
        $(".sonda-version").text("Sonda " + SondaVersion);

        delegate_events();

        $("#login_isonline").text("/");

        if (gPrepared === 0) {
            try {
                preparedb();
                gPrepared = 1;
            } catch (ex) {
                notify("onDeviceReady:" + ex.message);
            }
        }

        DelegateSondaRoute();
        DelagateSalesController();
        DelegeteStartRouteController();
        DelegateCustomerController();
        DelegatePaymentController();
        DelegarACapturaDeFirma();
        DelegarASincronizacion();
        DelegarAFinDeRuta();
        DelegarPreSaleController();
        DelegarTareaControlador();
        DelegarListadoOrdenDeVentaControlador();
        DelegadoDispositivo();

        if (mensajero === undefined) {
            mensajero = new Messenger();
        }

        tareaDetalleControlador = new TareaDetalleControlador(mensajero);
        tareaDetalleControlador.delegadoTareaDetalleControlador();

        var documentoVentaControlador = new DocumentoVentaControlador(mensajero);
        documentoVentaControlador.delegarDocumentoControlador();

        var listaSkuControlador = new ListaSkuControlador(mensajero);
        listaSkuControlador.delegadoListaSkuControlador();

        var denominacionSkuControlador = new DenominacionSkuControlador(mensajero);
        denominacionSkuControlador.delegarDenominacionSkuControlador();

        var resumenOrdenDeVentaControlador = new ResumenOrdenDeVentaControlador(
            mensajero
        );
        resumenOrdenDeVentaControlador.delegarResumenOrdenDeVentaControlador();

        var draftControlador = new DraftControlador(mensajero);
        draftControlador.delegarDraftControlador();

        var dividirOrdenDeVentaControlador = new DividirOrdenDeVentaControlador(
            mensajero
        );
        dividirOrdenDeVentaControlador.delegadoDividirOrdenDeVentaControlador();

        var tomaDeInventarioControlador = new TomaDeInventarioControlador(
            mensajero
        );
        tomaDeInventarioControlador.delegarTomaDeInventarioControlador();

        var unidadesDeMedidaTomaDeInventarioControlador = new UnidadesDeMedidaTomaDeInventarioControlador(
            mensajero
        );
        unidadesDeMedidaTomaDeInventarioControlador.delegarUnidadesDeMedidaTomaDeInventarioControlador();

        var listaSkuTomaDeInventarioControlador = new ListaSkuTomaDeInventarioControlador(
            mensajero
        );
        listaSkuTomaDeInventarioControlador.delegadoListaSkuTomaDeInventarioControlador();

        var resumenTomaDeInventarioControlador = new ResumenTomaDeInventarioControlador(
            mensajero
        );
        resumenTomaDeInventarioControlador.delegadoResumenTomaDeInventarioControlador();

        var tareaSinGestion = new TareaSinGestion(mensajero);
        tareaSinGestion.delegadoTareaSinGestion();

        var nuevaTareaControlador = new NuevaTareaControlador(mensajero);
        nuevaTareaControlador.delegarNuevaTareaControlador();

        var cambiosEnClienteControlador = new CambiosEnClienteControlador(
            mensajero
        );
        cambiosEnClienteControlador.delegarCambiosEnClienteControlador();

        var impresionManifiestoControlador = new ImpresionManifiestoControlador(
            mensajero
        );
        impresionManifiestoControlador.delegarImpresionManifiestoConrolador();

        var pagoControlador = new PagoControlador(mensajero);
        pagoControlador.delegadoPagoControlador();

        var consultaDeInventarioPorZonaControlador = new ConsultaDeInventarioPorZonaControlador();
        consultaDeInventarioPorZonaControlador.delegarConsultaDeInventarioControlador();

        var bonificacionPorComboControlador = new BonificacionPorComboControlador(
            mensajero
        );
        bonificacionPorComboControlador.delegarBonificacionPorComboControlador();

        var validacionDeLicenciaControlador = new ValidacionDeLicenciaControlador(
            mensajero
        );
        validacionDeLicenciaControlador.delegarValidacionDeLicenciaControlador();

        var seleccionDeImpresoraControlador = new SeleccionDeImpresoraControlador(
            mensajero
        );
        seleccionDeImpresoraControlador.delegarSeleccionDeImpresoraControlador();

        var firmaControlador = new FirmaControlador(mensajero);
        firmaControlador.delegadoFirmaControlador();

        var resumenDePedidoControlador = new ResumenDePedidoControlador(mensajero);
        resumenDePedidoControlador.delegarResumenDePedidoControlador();

        var controlDeFinDeRutaControlador = new ControlDeFinDeRutaControlador();
        controlDeFinDeRutaControlador.delegarControlDeFinDeRuta();

        estadisticaDeVentaControlador = new EstadisticaDeVentaControlador();

        var promocionesPorClienteControlador = new PromocionesPorClienteControlador();
        promocionesPorClienteControlador.delegarPromocionesPorClienteControlador();

        var avanceDeRutaControlador = new AvanceDeRutaControlador();
        avanceDeRutaControlador.delegarAvanceDeRutaControlador();

        encuestaControlador = new EncuestaControlador(mensajero);
        encuestaControlador.delegarEncuestaControlador();

        cobroDeFacturaVencidaControlador = new CobroDeFacturaVencidaControlador(
            mensajero
        );
        cobroDeFacturaVencidaControlador.delegarCobroDeFacturaVencidaControlador();

        tipoDePagoDeFacturaVencidaControlador = new TipoDePagoEnFacturaVencidaControlador(
            mensajero
        );
        tipoDePagoDeFacturaVencidaControlador.delegarTipoDePagoEnFacturaVencidaControlador();

        confirmacionDePagoDeFacturaVencidaControlador = new ConfirmacionDePagoControlador(
            mensajero
        );
        confirmacionDePagoDeFacturaVencidaControlador.delegarConfirmacionDePagoControlador();

        listaDePagoControlador = new ListaDePagoControlador(mensajero);
        listaDePagoControlador.delegarListaDePagoControlador();

        detalleDePagoControlador = new DetalleDePagoControlador(mensajero);
        detalleDePagoControlador.delegarDetalleDePagoControlador();

        catalogoDeProductoControlador = new CatalogoDeProductoControlador(
            mensajero
        );
        catalogoDeProductoControlador.delegarCatalogoDeProductoControlador();

        galeriaDeImagenControlador = new GaleriaDeImagenControlador();
        galeriaDeImagenControlador.delegarGaleriaDeImagenControlador();

        //// TODO: EJEMPLO DE COMO USAR EL MESSENGER
        //var mensajero = new Messenger();
        //var publisher = new Publisher(mensajero);
        //var subscriptor = new Subscriber(mensajero);
        //var subscriptor2 = new Subscriber(mensajero);
        //publisher.publicarMensaje();
        //subscriptor.cancelarSuscripcion();
        //publisher.publicarMensaje();

        $("#login_panel").css({ opacity: 0.9 });
        $("#menu_panel").css({ opacity: 0.9 });
        $("#presales_panel").css({ opacity: 0.9 });

        UpdateLoginInfo("get");
        checkloginstatus();

        var pPrinterAddress = "";
        gPrintAddress = localStorage.getItem("PRINTER_GUIAS");

        $(".printerclass").buttonMarkup({ icon: "forbidden" });

        window.bluetoothSerial.connectInsecure(
            pPrinterAddress,
            function() {
                $(".printerclass").buttonMarkup({ icon: "print" });
            },
            function() {
                $(".printerclass").buttonMarkup({ icon: "delete" });
            }
        );

        if (gLoginStatus === "OPEN") {
            if (!socket || !socket.connected) {
                var validacionDeLicencia = new ValidacionDeLicenciaControlador(
                    new Messenger()
                );
                validacionDeLicencia.validarLicencia(
                    localStorage.getItem("pUserID"),
                    localStorage.getItem("pUserCode"),
                    false
                );
            }

            ToastThis("Bienvenido " + gLastLogin);
            gTimeout = setTimeout(welcome_back(), 1000);
            clearTimeout(gTimeout);
        } else {
            $("#txtUserID").text(gLastLogin);

            if (gLastLogin !== null) {
                $("#txtPin").focus();
            } else {
                $("#txtUserID").focus();
            }
        }

        if (
            localStorage.getItem("POS_STATUS") !== undefined &&
            localStorage.getItem("POS_STATUS") !== null &&
            localStorage.getItem("POS_STATUS") === "OPEN"
        ) {
            if (
                localStorage.getItem("SeCargaronListas") !== undefined &&
                localStorage.getItem("SeCargaronListas") !== null &&
                localStorage.getItem("SeCargaronListas") === "SI"
            ) {
                cargarListaDeTareas();
            }
        }

        //Polyfill de metodos que no se incluyen en librerias de android 4
        //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/includes
        if (!Array.prototype.includes) {
            Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
                "use strict";
                var O = Object(this);
                var len = parseInt(O.length) || 0;
                if (len === 0) {
                    return false;
                }
                var n = parseInt(arguments[1]) || 0;
                var k;
                if (n >= 0) {
                    k = n;
                } else {
                    k = len + n;
                    if (k < 0) {
                        k = 0;
                    }
                }
                var currentElement;
                while (k < len) {
                    currentElement = O[k];
                    if (
                        searchElement === currentElement ||
                        (searchElement !== searchElement &&
                            currentElement !== currentElement)
                    ) {
                        return true;
                    }
                    k++;
                }
                return false;
            };
        }

        //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/String/includes
        if (!String.prototype.includes) {
            String.prototype.includes = function(search, start) {
                "use strict";
                if (typeof start !== "number") {
                    start = 0;
                }

                if (start + search.length > this.length) {
                    return false;
                } else {
                    return this.indexOf(search, start) !== -1;
                }
            };
        }

        //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
        if (!Array.prototype.map) {
            Array.prototype.map = function(callback, thisArg) {
                var T, A, k;

                if (this == null) {
                    throw new TypeError(" this is null or not defined");
                }

                // 1. Let O be the result of calling ToObject passing the |this|
                //    value as the argument.
                var O = Object(this);

                // 2. Let lenValue be the result of calling the Get internal
                //    method of O with the argument "length".
                // 3. Let len be ToUint32(lenValue).
                var len = O.length >>> 0;

                // 4. If IsCallable(callback) is false, throw a TypeError exception.
                // See: http://es5.github.com/#x9.11
                if (typeof callback !== "function") {
                    throw new TypeError(callback + " is not a function");
                }

                // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 1) {
                    T = thisArg;
                }

                // 6. Let A be a new array created as if by the expression new Array(len)
                //    where Array is the standard built-in constructor with that name and
                //    len is the value of len.
                A = new Array(len);

                // 7. Let k be 0
                k = 0;

                // 8. Repeat, while k < len
                while (k < len) {
                    var kValue, mappedValue;

                    // a. Let Pk be ToString(k).
                    //   This is implicit for LHS operands of the in operator
                    // b. Let kPresent be the result of calling the HasProperty internal
                    //    method of O with argument Pk.
                    //   This step can be combined with c
                    // c. If kPresent is true, then
                    if (k in O) {
                        // i. Let kValue be the result of calling the Get internal
                        //    method of O with argument Pk.
                        kValue = O[k];

                        // ii. Let mappedValue be the result of calling the Call internal
                        //     method of callback with T as the this value and argument
                        //     list containing kValue, k, and O.
                        mappedValue = callback.call(T, kValue, k, O);

                        // iii. Call the DefineOwnProperty internal method of A with arguments
                        // Pk, Property Descriptor
                        // { Value: mappedValue,
                        //   Writable: true,
                        //   Enumerable: true,
                        //   Configurable: true },
                        // and false.

                        // In browsers that support Object.defineProperty, use the following:
                        // Object.defineProperty(A, k, {
                        //   value: mappedValue,
                        //   writable: true,
                        //   enumerable: true,
                        //   configurable: true
                        // });

                        // For best browser support, use the following:
                        A[k] = mappedValue;
                    }
                    // d. Increase k by 1.
                    k++;
                }

                // 9. return A
                return A;
            };
        }

        if (!Array.prototype.find) {
            Object.defineProperty(Array.prototype, "find", {
                value: function(predicate) {
                    // 1. Let O be ? ToObject(this value).
                    if (this == null) {
                        throw new TypeError('"this" is null or not defined');
                    }

                    var o = Object(this);

                    // 2. Let len be ? ToLength(? Get(O, "length")).
                    var len = o.length >>> 0;

                    // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                    if (typeof predicate !== "function") {
                        throw new TypeError("predicate must be a function");
                    }

                    // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                    var thisArg = arguments[1];

                    // 5. Let k be 0.
                    var k = 0;

                    // 6. Repeat, while k < len
                    while (k < len) {
                        // a. Let Pk be ! ToString(k).
                        // b. Let kValue be ? Get(O, Pk).
                        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                        // d. If testResult is true, return kValue.
                        var kValue = o[k];
                        if (predicate.call(thisArg, kValue, k, o)) {
                            return kValue;
                        }
                        // e. Increase k by 1.
                        k++;
                    }

                    // 7. Return undefined.
                    return undefined;
                }
            });
        }

        //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/reduce
        if (!Array.prototype.reduce) {
            Array.prototype.reduce = function(fun /*, inicial*/ ) {
                var longitud = this.length;
                if (typeof fun != "function") throw new TypeError();

                // no se devuelve ningún valor si no hay valor inicial y el array está vacío
                if (longitud == 0 && arguments.length == 1) throw new TypeError();

                var indice = 0;
                if (arguments.length >= 2) {
                    var rv = arguments[1];
                } else {
                    do {
                        if (indice in this) {
                            rv = this[indice++];
                            break;
                        }

                        // si el array no contiene valores, no existe valor inicial a devolver
                        if (++indice >= longitud) throw new TypeError();
                    } while (true);
                }

                for (; indice < longitud; indice++) {
                    if (indice in this)
                        rv = fun.call(null, rv, this[indice], indice, this);
                }

                return rv;
            };
        }
    } catch (e) {
        console.log("onDeviceReady:" + e.message);
        notify("onDeviceReady:" + e.message);
    }
}

function checkloginstatus() {
    try {
        gLoginStatus = localStorage.getItem("LOGIN_STATUS");
        if (gLoginStatus === null) {
            gLoginStatus = "CLOSED";
        }
    } catch (e) {
        gLoginStatus = "CLOSED";
    }
}

function onResume() {}

function simulate_scanpackage() {
    var xscanned = $("#lblScannedPacks").text();
    var xlabels = $("#lblGuideLabels").text();

    if (parseInt(xscanned) >= parseInt(xlabels)) {
        $("#btnDeliveryPhotoSignature").removeClass("ui-disabled");
    } else {
        $("#btnDeliveryPhotoSignature")
            .removeClass("ui-disabled")
            .addClass("ui-disabled");

        xscanned = parseInt(xscanned) + 1;
        $("#lblScannedPacks").text(xscanned);

        if (parseInt(xscanned) >= parseInt(xlabels)) {
            $("#btnDeliveryPhotoSignature").removeClass("ui-disabled");
        } else {
            $("#btnDeliveryPhotoSignature")
                .removeClass("ui-disabled")
                .addClass("ui-disabled");
        }
        refresh_guidetodeliver_stats();
    }
}

function delegate_events() {
    document.addEventListener("menubutton", onMenuKeyDown, true);
    document.addEventListener("backbutton", onBackKeyDown, true);
    document.addEventListener("online", DeviceIsOnline, true);
    document.addEventListener("offline", DeviceIsOffline, true);

    window.addEventListener("batterystatus", onBatteryStatus, true);
    window.addEventListener("batterycritical", onBatteryCritical, true);
    window.addEventListener("batterylow", onBatteryLow, true);

    $("#btnPictureOnDelivery").bind("touchstart", function() {
        take_picture_pickup("delivery");
    });
    $("#btnAcceptOnDelivery").bind("touchstart", function() {
        CompletedDeliveryTask();
    });

    $("#btnDeliveryRoute").bind("touchstart", function() {
        StartDeliveryRoute();
    });

    $(".loggedclass").bind("touchstart", function() {
        var usuario =
            localStorage.getItem("LAST_LOGIN_NAME") +
            "\n\r" +
            localStorage.getItem("pUserID");
        notify(usuario);
        usuario = null;
    });

    $("#btnStartMyManifest").bind("touchstart", function() {
        UserWantsAcceptManifest();
    });

    $("#btnCancelManifest").bind("touchstart", function() {
        $("#lblManifest").text("");
        $("#lblManifestDateCreation").text("dd/mm/yyyy");
        $("#lblManifestNumDoc").text("");
        $("#lblManifestRuta").text("");

        $("#txtManifestHeader").val("");
        $("#txtManifestHeader").focus();
    });

    $("#btnScannManifest").bind("touchstart", function() {
        cordova.plugins.diagnostic.isCameraAuthorized(
            function(enabled) {
                if (enabled) {
                    cordova.plugins.barcodeScanner.scan(
                        function(result) {
                            if (result.text.length > 0) {
                                var existe = false;
                                var resultado = result.text.split("");

                                if (
                                    resultado.indexOf("L") !== -1 &&
                                    resultado.indexOf("P") !== -1
                                ) {
                                    existe = true;
                                }

                                if (existe) {
                                    resultado = result.text.split("LP")[1];
                                    document.getElementById(
                                        "UiTxtNumeroDeManifiesto"
                                    ).value = resultado;
                                    $.mobile.changePage("#UiPagePrintManifest", {
                                        transition: "flow",
                                        reverse: true,

                                        showLoadMsg: false
                                    });
                                } else {
                                    $("#txtManifestHeader").val(result.text);
                                    UserWantsGetManifest();
                                    navigator.vibrate(1000);
                                }
                            }
                        },
                        function(error) {
                            notify("No se ha podido escanear debido a: " + error);
                        }
                    );
                } else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(
                        function(authorization) {
                            if (authorization === "DENIED") {
                                ToastThis(
                                    "Debe autorizar el uso de la Cámara para poder leer el Código."
                                );
                                cordova.plugins.diagnostic.switchToSettings();
                            } else if (authorization === "GRANTED") {
                                cordova.plugins.barcodeScanner.scan(
                                    function(result) {
                                        if (result.text.length > 0) {
                                            var existe = false;
                                            var resultado = result.text.split("");

                                            if (
                                                resultado.indexOf("L") !== -1 &&
                                                resultado.indexOf("P") !== -1
                                            ) {
                                                existe = true;
                                            }

                                            if (existe) {
                                                resultado = result.text.split("LP")[1];
                                                document.getElementById(
                                                    "UiTxtNumeroDeManifiesto"
                                                ).value = resultado;
                                                $.mobile.changePage("#UiPagePrintManifest", {
                                                    transition: "flow",
                                                    reverse: true,

                                                    showLoadMsg: false
                                                });
                                            } else {
                                                $("#txtManifestHeader").val(result.text);
                                                UserWantsGetManifest();
                                                navigator.vibrate(1000);
                                            }
                                        }
                                    },
                                    function(error) {
                                        notify("No se ha podido escanear debido a: " + error);
                                    }
                                );
                            } else {
                                cordova.plugins.diagnostic.switchToSettings();
                            }
                        },
                        function(error) {
                            notify(error);
                        }
                    );
                }
            },
            function(error) {
                notify(error);
            }
        );
    });

    $("#btnDeliveryPhotoSignature").bind("touchstart", function() {
        SignAndPhoto("delivery");
    });

    $("#btnDeliveryPrint").bind("touchstart", function() {
        printdelivery();
    });

    $("#btnDeliveryFinish").bind("touchstart", function() {
        navigator.notification.confirm(
            "Confirma finalizar entrega?",
            function(buttonIndex) {
                if (buttonIndex === 2) {
                    postguide();
                }
            },
            "Sonda® Ruta " + SondaVersion, ["No", "Si"]
        );
    });

    $("#btnNewTaskOffPlan").bind("touchstart", function() {
        $.mobile.changePage("#offplan_task_page", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });
    });

    $("#btnSaveTaskOffPlan").bind("touchstart", function() {
        create_task_offplan();
    });

    $("#btnAcceptManifest").bind("touchstart", function() {
        navigator.notification.confirm(
            "Acepta manifiesto?", // message
            function(buttonIndex) {
                if (buttonIndex === 2) {
                    ProcessAcceptManifest(gManifestID);
                    my_dialog("", "", "close");
                }
            }, // callback to invoke with index of button pressed
            "Sonda® Ruta " + SondaVersion, // title
            "No,Si" // buttonLabels
        );
    });

    $("#btntestqrscanner").bind("touchstart", function() {
        cordova.plugins.barcodeScanner.scan(
            function(result) {
                $("#lblScannedQR").text(result.text);
                navigator.vibrate(1000);
            },
            function(error) {
                notify("Scanning failed: " + error);
            }
        );
    });

    $("#btnFinishCollecting").bind("touchstart", function() {
        finishroute();
    });

    $("#btnSignatureGuide").bind("touchstart", function() {
        SignAndPhoto("pickup");
    });

    $("#btnSignatureGuideInvoice").bind("touchstart", function() {
        SignAndPhoto("pickup");
    });

    $("#btnClearSignature").bind("touchstart", function() {
        clearsignaturepad();
    });

    $("#btnClearSignature_delivery").bind("touchstart", function() {
        clearsignaturepad();
    });

    $("#btnTakePicture").bind("touchstart", function() {
        take_picture_pickup("pickup");
    });

    $("#btnTakePicture_delivery").bind("touchstart", function() {
        take_picture_pickup("delivery");
    });

    $("#btnSaveSignAndPicture").bind("touchstart", function() {
        savesignature("pickup");
    });

    $("#btnSaveSignAndPicture_delivery").bind("touchstart", function() {
        savesignature("delivery");
    });

    $("#btnFinishPickup").bind("touchstart", function() {
        CompletePreSaleTask();
    });

    $("#btnGuideIsCompleted").bind("touchstart", function() {
        GuideCompleted();
    });

    $("#btnNewOrder").bind("touchstart", function() {
        ShowNewOrder();
    });

    $("#btnShowPrinterConfig").bind("touchstart", function() {
        if (localStorage.getItem("isPrinterZebra") === "1") {
            $.mobile.changePage("#UiPaginaSeleccionDeImpresora", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
        } else {
            exploredevices();
            $.mobile.changePage("#printers_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
        }
    });

    $(".printerclass_btn").bind("touchstart", function() {
        if (localStorage.getItem("isPrinterZebra") === "1") {
            $.mobile.changePage("#UiPaginaSeleccionDeImpresora", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
        } else {
            exploredevices();
            $.mobile.changePage("#printers_page", {
                transition: "flow",
                reverse: true,
                showLoadMsg: false
            });
        }
    });

    $("#btnTryPrinter").bind("touchstart", function() {
        TryPrinter();
    });
    $("#btnSavePrinter").bind("touchstart", function() {
        SavePrinter();
    });

    $("#btnTryPrinter1").bind("touchstart", function() {
        gPrintAddress = $("input[name=itemDev]:checked").val();
        if (gPrintAddress !== "") {
            printtest(gPrintAddress, "");
        }
    });

    $("#btnSavePrinter1").bind("touchstart", function() {
        SavePrinter();
    });

    $("#btnOut").bind("touchstart", function() {
        bluetoothSerial.disconnect(
            function() {},
            function() {
                notify("Printer is unable to get disconnected");
            }
        );
        navigator.app.exitApp();
    });
    $("#btnPrintIT").bind("touchstart", function() {
        printinvoice(gInvoiceNUM, "");
    });

    $("#btnCloseInvoiceDialog").bind("touchstart", function() {
        $("#invoice_actions_dialog").popup("close");
    });
    $("#btnRePrintInvoice").bind("touchstart", function() {
        printinvoice(gInvoiceNUM, "***RE-IMPRESO***");
    });
    $("#btnVoidInvoice").bind("touchstart", function() {
        showvoidinvoice(gInvoiceNUM);
    });
    $("#btnProcessVoidInvoice").bind("touchstart", function() {
        ProcessVoidInvoice(gInvoiceNUM);
    });

    $("#btnGetImagesInvoice").bind("touchstart", function() {
        notify(gInvoiceNUM);
    });
    $("#btnShowDeposit").bind("touchstart", function() {
        showdepositform();
    });

    $("#btnFinishPOS").bind("touchstart", function() {
        closepos_action();
    });
    $("#btnLogByScan").bind("touchstart", function() {
        scanloginid();
    });
    $("#btnQuit").bind("touchstart", function() {
        bluetoothSerial.disconnect(
            function() {},
            function() {
                notify("Printer is unable to get disconnected");
            }
        );
        navigator.app.exitApp();
    });
    $("#btnPOS").bind("touchstart", function() {
        start_invoicing();
    });
    $("#btnListingClient").bind("touchstart", function() {
        cust_list();
    });

    $("#btnOK_series").bind("touchstart", function() {
        UpdateSKUSeries();
    });

    $("#btnCancel_series").bind("touchstart", function() {
        ReturnSkus();
    });
    $("#btnContinue_Client").bind("touchstart", function() {
        ContinueToSkus();
    });
    $("#btnSetCF").bind("touchstart", function() {
        SetCF();
    });

    $("#btnConfirmedInvoice").bind("touchstart", function() {
        ConfirmedInvoice();
    });

    $("#btnPreviewImg1").bind("touchstart", function() {
        preview_picture("1");
    });
    $("#btnPreviewImg2").bind("touchstart", function() {
        preview_picture("2");
    });
    $("#btnPreviewImg3").bind("touchstart", function() {
        preview_picture("3");
    });

    $("#btnTakePicDepositBank").bind("touchstart", function() {
        take_picture_deposit();
    });
    $("#btnMakeDepositBank").bind("touchstart", function() {
        ProcessDeposit();
    });

    $("#btnViewInv").bind("touchstart", function() {
        ShowInventoryPage();
    });
    $("#btnInvoiceList").bind("touchstart", function() {
        ShowInvoiceListPage();
    });

    $("#btnDepositsList").bind("touchstart", function() {
        ShowDepositsListPage();
    });
    $("#btnDepositsListSumm").bind("touchstart", function() {
        ShowDepositsListPage();
    });

    $(document).on("pageshow", "#finishroutes_page", function() {
        ShowHideOptions();
    });

    $(document).on("pageshow", "#pageManifestHeader", function() {
        $("#txtManifestHeader").focus();
    });

    $(document).on("pageshow", "#NotDeliveryReason_page", function() {
        SONDA_DB_Session.transaction(
            function(tx) {
                pSQL =
                    "SELECT * FROM REASONS WHERE REASON_TYPE = 'NOT_DELIVERY_REASONS'";
                gNotDeliveryReasons = [];
                var xclick = "";

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        if (results.rows.length >= 1) {
                            var pDomElement = $("#listview_no_delivery_reason");
                            pDomElement.children().remove("li");

                            for (i = 0; i <= results.rows.length - 1; i++) {
                                xclick =
                                    "ProcessNotDelivered('" +
                                    results.rows.item(i).REASON_PROMPT +
                                    "');";
                                //ojo

                                var pInjectedHtml =
                                    '<li class="ui-alt-icon ui-nodisc-icon"><a href="#" onclick="' +
                                    xclick +
                                    '">' +
                                    results.rows.item(i).REASON_VALUE +
                                    "</a></li>";
                                console.log(pInjectedHtml);

                                pDomElement.append(pInjectedHtml);

                                pDomElement.listview("refresh");
                            }
                            pDomElement = null;
                        }
                    },
                    function(tx, err) {
                        my_dialog("", "", "close");
                        notify("ShowHideOptions: " + err.message);
                    }
                );
            },
            function(err) {
                notify("ProcessNotDelivered.1.Error processing SQL: " + err.message);
            }
        );
    });

    $(document).on("pageshow", "#deliver_guides_page", function() {
        try {
            refresh_guidetodeliver_stats();
            if (gSignatedDelivery === true) {
                $("#btnDeliveryPrint")
                    .removeClass("ui-disabled")
                    .addClass("ui-enabled");
            } else {
                $("#btnDeliveryPrint")
                    .removeClass("ui-disabled")
                    .addClass("ui-disabled");
            }
        } catch (e) {
            notify(e.message);
        }
    });
    $(document).on("pageshow", "#manifest_guides_page", function() {
        filtermydispatchplan("PENDING");
    });

    $(document).on("pageshow", "#taskpickup_page", function() {
        $("#listview_guidedetail")
            .listview()
            .listview("refresh");
        RefreshMyGuidesOnTask();
    });

    $(document).on("pageshow", "#pickupplan_page", function() {
        EnviarData();
    });

    $(document).on("pageshow", "#series_page", function() {
        $("#txtSerie_series").focus();
    });

    $("#login_page").swipe({
        swipe: function(
            event,
            direction,
            distance,
            duration,
            fingerCount,
            fingerData
        ) {
            if (fingerCount === 1 && direction === "right") {
                var myPanel = $.mobile.activePage.children('[data-role="panel"]');
                myPanel.panel("toggle");
            }
        }
    });

    $("#taskpickupguide_page").on("swiperight", function() {
        GetAvailablePackageTypes();
    });

    $("#menu_page").swipe({
        swipe: function(
            event,
            direction,
            distance,
            duration,
            fingerCount,
            fingerData
        ) {
            if (direction === "right") {
                var myPanel = $.mobile.activePage.children('[data-role="panel"]');
                myPanel.panel("toggle");
            }
        }
    });

    $("#menu_page").on("pageshow", function() {
        if (socket) {
            socket.emit("RegisterClientSocketConnected", { routeid: gCurrentRoute });
        }

        estadisticaDeVentaControlador.mostrarUOcultarContenedorDeModuloDeMetas();

        tareaDetalleControlador.debeCobrarFacturasVencidas(
            ReglaTipo.CobroDeFacturaVencida.toString(),
            function(cobrarFacturasVencidas) {
                tareaDetalleControlador.debeCobrarFacturasVencidas(
                    ReglaTipo.NoVenderAlContadoConLimiteExcedido.toString(),
                    function(cobrarFacturasAbiertas) {
                        if (cobrarFacturasVencidas || cobrarFacturasAbiertas) {
                            $("#UiBtnShowPaymentsList").css("display", "block");
                        } else {
                            $("#UiBtnShowPaymentsList").css("display", "none");
                        }
                    }
                );
            }
        );
    });

    $(".allownumericwithoutdecimal").on("keypress keyup blur", function(event) {
        $(this).val(
            $(this)
            .val()
            .replace(/[^\d].+/, "")
        );

        if (event.which < 48 || event.which > 57) {
            event.preventDefault();
        }
    });

    $("#UiBtnGeoFences").bind("touchstart", function() {
        $.mobile.changePage("#map-page", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });
    });

    $("#loginimg").on("click", function() {
        cordova.plugins.diagnostic.isCameraAuthorized(
            function(enabled) {
                if (enabled) {
                    TomarFoto(
                        function(imagen) {
                            var imagenDeUsuario = $("#loginimg");
                            var imagenBase64 = "data:image/png;base64," + imagen;
                            imagenDeUsuario.attr("src", imagenBase64);
                            localStorage.setItem("LOGIN_IMAGE", imagenBase64);
                            imagenDeUsuario = null;
                            if (socket)
                                socket.emit("UpdateUserImage", {
                                    routeid: gCurrentRoute,
                                    image: imagenBase64,
                                    dbuser: gdbuser,
                                    dbuserpass: gdbuserpass
                                });
                        },
                        function(error) {
                            if (error !== "Camera cancelled.") notify(error);
                        }
                    );
                } else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(
                        function(authorization) {
                            if (authorization === "DENIED") {
                                ToastThis(
                                    "Debe autorizar el uso de la Cámara para poder capturar la imágen."
                                );
                                cordova.plugins.diagnostic.switchToSettings();
                            } else if (authorization === "GRANTED") {
                                TomarFoto(
                                    function(imagen) {
                                        var imagenDeUsuario = $("#loginimg");
                                        var imagenBase64 = "data:image/png;base64," + imagen;
                                        imagenDeUsuario.attr("src", imagenBase64);
                                        localStorage.setItem("LOGIN_IMAGE", imagenBase64);
                                        imagenDeUsuario = null;
                                        if (socket)
                                            socket.emit("UpdateUserImage", {
                                                routeid: gCurrentRoute,
                                                image: imagenBase64,
                                                dbuser: gdbuser,
                                                dbuserpass: gdbuserpass
                                            });
                                    },
                                    function(error) {
                                        if (error !== "Camera cancelled.") notify(error);
                                    }
                                );
                            } else {
                                cordova.plugins.diagnostic.switchToSettings();
                            }
                        },
                        function(error) {
                            notify(error);
                        }
                    );
                }
            },
            function(error) {
                notify(error);
            }
        );
    });
}

function swipe(pagina, callback) {
    $(pagina).swipe({
        swipe: function(
            event,
            direction,
            distance,
            duration,
            fingerCount,
            fingerData
        ) {
            callback(direction);
        }
    });
}

function showVoidOptions(pInvoiceID) {
    SONDA_DB_Session.transaction(
        function(tx) {
            var pDoc = "";
            var pImg = "";

            var psql = "SELECT * FROM VOID_REASONS ";
            console.log(psql);
            tx.executeSql(
                psql, [],
                function(tx, results) {
                    var xskus_len = results.rows.length - 1;
                    gVoidReasons = [];
                    for (i = 0; i <= xskus_len; i++) {
                        try {
                            gVoidReasons.push({
                                text: results.rows.item(i).REASON_DESCRIPTION,
                                value: results.rows.item(i).REASON_ID
                            });
                        } catch (e) {
                            notiy(e.message);
                        }
                    }
                    console.log(gVoidReasons);
                    var config_options = {
                        title: "Motivos de anulaciÃ³n",
                        items: gVoidReasons,
                        doneButtonLabel: "Ok",
                        cancelButtonLabel: "Cancelar"
                    };

                    window.plugins.listpicker.showPicker(config_options, function(item) {
                        navigator.notification.confirm(
                            "Confirma Anulacion?", // message
                            function(buttonIndex) {
                                if (buttonIndex === 2) {
                                    my_dialog("Anulando factura", "Procesando...", "close");
                                    ProcessVoidInvoice(pInvoiceID, item, item);
                                    my_dialog("", "", "close");
                                }
                            }, // callback to invoke with index of button pressed
                            "SondaÂ® Ruta " + SondaVersion, // title
                            "No,Si" // buttonLabels
                        );
                    });
                    my_dialog("", "", "close");
                },
                function(err) {
                    my_dialog("", "", "close");
                    if (err.code !== 0) {
                        notify("(12)Error processing SQL: " + err.code);
                    }
                }
            );
        },
        function(tx, err) {
            notify("(13)Error processing SQL: " + err.message);
        }
    );
}

function ShowNewOrder() {
    $.mobile.changePage("#taskpickupguide_page", {
        transition: "flow",
        reverse: true,
        showLoadMsg: false
    });
}

function GetClientBranches() {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";

                var psql =
                    "SELECT * FROM BRANCHES where CLIENT_CODE = '" + gClientID + "'";
                console.log(psql);

                tx.executeSql(
                    psql, [],
                    function(tx, results) {
                        var xskus_len = results.rows.length - 1;
                        gBranches = [];

                        gBranches.push({
                            text: "NINGUNA",
                            value: "NINGUNA"
                        });

                        for (i = 0; i <= xskus_len; i++) {
                            try {
                                gBranches.push({
                                    text: results.rows.item(i).BRANCH_NAME,
                                    value: results.rows.item(i).BRANCH_CODE
                                });
                            } catch (e) {
                                notiy(e.message);
                            }
                        }
                        console.log(gBranches);
                        var config_options = {
                            title: "Agencias del cliente",
                            items: gBranches,
                            doneButtonLabel: "Ok",
                            cancelButtonLabel: "Cancelar"
                        };

                        window.plugins.listpicker.showPicker(config_options, function(
                            item
                        ) {
                            SONDA_DB_Session.transaction(
                                function(tx) {
                                    if (item === "NINGUNA") {
                                        $("#btnBranchID").text("NINGUNA");

                                        $("#txtAddressInputed").text("");

                                        $("#txtPDE").text("0");
                                        $("#txtPDE").attr("readonly", true);

                                        $("#txtAddressInputed").css("visibility", "visible");
                                        $("#lblBranchAddress").css("visibility", "visible");
                                        //$("#txtPDE").css("visibility","hidden");

                                        $("#lblBranchAddress").text("");
                                        $("#btnGEORoute").text("");
                                        $("#txtAddressInputed").focus();
                                    } else {
                                        var psql1 =
                                            "SELECT * FROM BRANCHES where BRANCH_CODE = '" +
                                            item +
                                            "'";
                                        console.log(psql1);
                                        tx.executeSql(
                                            psql1, [],
                                            function(tx, results) {
                                                $("#btnBranchName").text(
                                                    results.rows.item(0).BRANCH_NAME
                                                );
                                                $("#btnBranchID").text(
                                                    results.rows.item(0).BRANCH_CODE
                                                );
                                                $("#lblBranchAddress").text(
                                                    results.rows.item(0).BRANCH_ADDRESS
                                                );
                                                $("#txtAddressInputed").css("visibility", "hidden");

                                                $("#txtPDE").css("visibility", "visible");
                                                $("#txtPDE").attr("readonly", true);
                                                $("#txtPDE").val(results.rows.item(0).BRANCH_PDE);

                                                $("#btnGEORoute").text(results.rows.item(0).GEO_ROUTE);

                                                my_dialog("", "", "close");
                                            },
                                            function(err) {
                                                my_dialog("", "", "close");
                                                if (err.code !== 0) {
                                                    notify("(15)Error processing SQL: " + err.code);
                                                }
                                            }
                                        );
                                    }
                                },
                                function(err) {
                                    if (err.code !== 0) {
                                        notify("(16)Error processing SQL: " + err.code);
                                    }
                                }
                            );
                        });

                        console.log("picker called");
                        my_dialog("", "", "close");
                    },
                    function(err) {
                        notify(" error pickier ");
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(12)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(13)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        console.log("GetClientBranches:" + e.message);
        notify("GetClientBranches:" + e.message);
    }
}

function GetAvailablePackageTypes() {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";

                var psql =
                    "SELECT * FROM SKUS WHERE SKU_ID NOT IN (SELECT SKU_ID FROM SKUS_X_ORDER WHERE ORDER_ID = '-9999') ";
                console.log(psql);
                tx.executeSql(
                    psql, [],
                    function(tx, results) {
                        var xskus_len = results.rows.length - 1;
                        gBranches = [];

                        for (var i = 0; i <= xskus_len; i++) {
                            try {
                                gBranches.push({
                                    text: results.rows.item(i).SKU_DESCRIPTION +
                                        "\n Q" +
                                        format_number(results.rows.item(i).PRICE_LIST, 2),
                                    value: results.rows.item(i).SKU_ID
                                });
                            } catch (e) {
                                notiy(e.message);
                            }
                        }
                        console.log(gBranches);
                        var config_options = {
                            title: "Listado de productos",
                            items: gBranches,
                            doneButtonLabel: "Ok",
                            cancelButtonLabel: "Cancelar"
                        };

                        window.plugins.listpicker.showPicker(config_options, function(
                            item
                        ) {
                            SONDA_DB_Session.transaction(
                                function(tx) {
                                    var pUMDesc = GetUMDesc(item);
                                },
                                function(err) {
                                    if (err.code !== 0) {
                                        notify("(16)Error processing SQL: " + err.code);
                                    }
                                }
                            );
                        });

                        console.log("picker called");
                        my_dialog("", "", "close");
                    },
                    function(tx, err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(12)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(13)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        console.log("GetClientBranches:" + e.message);
        notify("GetClientBranches:" + e.message);
    }
}

function GetNoVisitDesc(item) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pSQL = "SELECT * FROM NO_VISIT WHERE PARAM_NAME = '" + item + "'";
                var pUM = "";

                console.log(pSQL);

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        if (results.rows.length >= 1) {
                            socket.emit("process_novisit", {
                                taskid: gtaskid,
                                reason: results.rows.item(0).PARAM_NAME
                            });
                        } else {
                            return "N/F";
                        }
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("(GetNoVisitDesc.0)Error processing SQL: " + err.code);
                            return "ERROR";
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(GetNoVisitDesc.1)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        notify("GetNoVisitDesc: " + e.message);
    }
}

function GetUMDesc(pUM) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var pSQL = "SELECT * FROM SKUS WHERE SKU_ID = '" + pUM + "'";

                console.log(pSQL);

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        if (results.rows.length >= 1) {
                            setpackage(
                                pUM,
                                results.rows.item(0).SKU_DESCRIPTION,
                                results.rows.item(0).PRICE_LIST
                            );
                        } else {
                            return "N/F";
                        }
                    },
                    function(tx, err) {
                        my_dialog("", "", "close");

                        notify("(GetUMDesc.0)Error processing SQL: " + err.message);
                        return "ERROR";
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    notify("(GetUMDesc.1)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        notify("GetUMDesc: " + e.message);
    }
}

function AcceptTask() {
    try {
        $("#lblRemitenteName").text(gClientName);

        if (gIsOnline === 1) {
            var conn_option = {
                taskid: gtaskid,
                dbuser: gdbuser,
                dbuserpass: gdbuserpass,
                gps: ""
            };

            navigator.geolocation.getCurrentPosition(
                function(position) {
                    gCurrentGPS =
                        position.coords.latitude + "," + position.coords.longitude;
                    gLastGPS = gCurrentGPS;

                    conn_option.gps = gCurrentGPS;
                    $(".gpsclass").text(
                        position.coords.latitude + "," + position.coords.longitude
                    );

                    socket.emit("task_accepted", conn_option);
                },
                function() {
                    gCurrentGPS = gLastGPS;
                    conn_option.gps = gCurrentGPS;
                    socket.emit("task_accepted", conn_option);
                }, { maximumAge: 30000, timeout: 15000, enableHighAccuracy: true }
            );
        }
        //cambio
        switch (gTaskType) {
            case TareaTipo.Entrega:
                gotomyDelivery();
                break;
            case TareaTipo.Preventa:
                ValidarSaldoCliente(
                    gClientID,
                    0,
                    "",
                    0,
                    OpcionValidarSaldoCliente.EjecutarTarea,
                    OrdenDeVentaTipo.Credito,
                    function() {
                        SeguirTareaPreventa();
                    },
                    function(err) {
                        notify(err.message);
                    }
                );

                break;
            case TareaTipo.Venta:
                EjecutarTareaDeVenta(gClientID);
                break;
            case TareaTipo.Obsoleto:
                EjecutarTareaDeVenta(gClientID);
                break;
        }
    } catch (e) {
        notify("AcceptTask:" + e.message);
    }
}

function refreshguidelist() {
    /*
    <li>
		<span class="middle"><strong>#251050</strong></span><p></p>
        <span class="small-roboto"><strong>FARMACIA SIMAN #1, LA LIMA.</strong></span><p></p>
        <span class="small-roboto">Direccion del remitente</span><p></p>
        <span class="small-roboto">PDE-GeoRuta</span><p></p>
        <span class="ui-li-count">7</span>
    </li>
    */
}

function SavePrinter() {
    try {
        gPrintAddress = $("input[name=itemDev]:checked").val();

        localStorage.setItem("PRINTER_ADDRESS", gPrintAddress);

        ConectarImpresora(gPrintAddress, function() {
            ToastThis("Impresora sincronizada correctamente");
            window.history.back();
        });
    } catch (e) {
        notify("Error al sincronizar impresora: " + e.message);
    }
}

function ConectarImpresora(impresora, callback) {
    try {
        if (impresora !== "") {
            gPrintAddress = impresora;

            bluetoothSerial.isConnected(
                function() {
                    $(".printerclass").buttonMarkup({ icon: "print" });
                    callback();
                },
                function() {
                    bluetoothSerial.connectInsecure(
                        gPrintAddress,
                        function() {
                            $(".printerclass").buttonMarkup({ icon: "print" });
                            gTimeout = setTimeout(callback(), 2500);
                            clearTimeout(gTimeout);
                        },
                        function() {
                            $(".printerclass").buttonMarkup({ icon: "delete" });
                            callback();
                        }
                    );
                }
            );
        } else {
            callback();
        }
    } catch (e) {
        callback();
    }
}

function DesconectarImpresora(resolve, reject) {
    VerificarEstado(
        0,
        function() {
            bluetoothSerial.disconnect(
                function() {
                    sleep(function() {
                        console.log("Disconnected");
                        resolve(true);
                    }, 5000);
                },
                function(reason) {
                    reject(LanzarExcepcionDesconexion(reason));
                }
            );
        },
        reject
    );
}

function sleep(resolve, time) {
    setTimeout(resolve, time);
}

function VerificarEstado(currentTry, resolve, reject) {
    return bluetoothSerial.read(
        function(result) {
            if (result != "")
            //yay printer ready!!!
                resolve(true);
            else {
                if (currentTry < 20)
                    sleep(function() {
                        VerificarEstado(currentTry + 1, resolve, reject);
                    }, 1000);
                else reject(LanzarExcepcionDesconexion(new Error("Tiempo agotado")));
            }
        },
        function(e) {
            reject(LanzarExcepcionDesconexion(e));
        }
    );
}

function LanzarExcepcionDesconexion(e) {
    notify("Error al desconectar impresora: " + e.message);

    return e;
}

function exploredevices() {
    try {
        //my_dialog("Obteniendo dispositivos", "Espere...", "open");
        try {
            bluetoothSerial.list(
                function(devices) {
                    devices.forEach(function(device) {
                        xdevname = device.name;

                        if (xdevname.substring(1, 2) === "X") {
                            var xxitem = $("#item-" + device.name);

                            if (xxitem.length <= 0) {
                                var pHtml = "";
                                if (device.address === gPrintAddress) {
                                    pHtml =
                                        pHtml +
                                        "<input type='radio' name='itemDev' id='item-" +
                                        device.name +
                                        "' value='" +
                                        device.address +
                                        "' checked='checked'>";
                                } else {
                                    pHtml =
                                        pHtml +
                                        "<input type='radio' name='itemDev' id='item-" +
                                        device.name +
                                        "' value='" +
                                        device.address +
                                        "'>";
                                }

                                pHtml =
                                    pHtml +
                                    "<label class='medium' for='item-" +
                                    device.name +
                                    "'>" +
                                    device.name +
                                    " " +
                                    device.address +
                                    "</label>";

                                $("#cmbDevices").append(pHtml);
                                $("#item-" + device.name)
                                    .checkboxradio()
                                    .checkboxradio("refresh");
                            }
                        }
                    });
                    $("#cmbDevices")
                        .controlgroup()
                        .controlgroup("refresh");
                },
                function(err) {
                    console.log(err);
                }
            );
        } catch (e) {
            notify(e.message);
        }
        my_dialog("", "", "close");
    } catch (e) {
        my_dialog("", "", "close");
        notify("cannot print " + e.message);
    }
}

function ProcessPresaleTask(pIsCheckingOffline) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                if (pIsCheckingOffline === 0) {
                    //SIGNATURE, IMAGE
                    pSQL =
                        "UPDATE ORDERS SET SIGNATURE = '" +
                        pSignature +
                        "', TAKEN_IMAGE = '" +
                        gpicture +
                        "' WHERE SOURCE_TASK = " +
                        gtaskid;
                    console.log(pSQL);

                    tx.executeSql(pSQL);
                }
            },
            function(tx, err) {
                my_dialog("", "", "close");
                notify("ProcessPresaleTask.catch:" + err.message);
            },
            function() {
                console.log(".....");
            }
        );

        SONDA_DB_Session.transaction(
            function(tx) {
                var pDoc = "";
                var pImg = "";
                var pSQL = "";
                var pOrderResults = Array();
                var pPacksResults = Array();
                var dataemit;

                pSQL = "SELECT * FROM ORDERS WHERE SOURCE_TASK = " + gtaskid;

                console.log("ProcessPresaleTask:" + pSQL);

                tx.executeSql(
                    pSQL, [],
                    function(tx, results) {
                        var ORDER_JSON = {};

                        for (var i = 0; i <= results.rows.length - 1; i++) {
                            ORDER_JSON = {
                                ORDER_ID: results.rows.item(i).ORDER_ID,
                                CREATED_DATESTAMP: results.rows.item(i).CREATED_DATESTAMP,
                                PRESALE_ROUTE: gCurrentRoute,
                                DELIVERY_POINT: results.rows.item(i).DELIVERY_BRANCH_PDE,
                                CLIENT_CODE: results.rows.item(i).CLIENT_CODE,
                                CLIENT_NAME: results.rows.item(i).CLIENT_NAME,

                                DELIVERY_BRANCH_NAME: results.rows.item(i).DELIVERY_BRANCH_NAME,
                                DELIVERY_BRANCH_ADDRESS: results.rows.item(i).DELIVERY_ADDRESS,
                                TOTAL_AMOUNT: results.rows.item(i).TOTAL_AMOUNT,
                                SOURCE_TASK: results.rows.item(i).SOURCE_TASK,

                                STATUS: results.rows.item(i).STATUS,

                                SIGNATURE: results.rows.item(i).SIGNATURE,
                                IMAGE: results.rows.item(i).TAKEN_IMAGE
                            };

                            pOrderResults.push(ORDER_JSON);
                        }
                        console.log(pOrderResults);

                        SONDA_DB_Session.transaction(
                            function(tx) {
                                var pSQL = "";

                                pSQL =
                                    "SELECT * FROM SKUS_X_ORDER WHERE SOURCE_TASK = " + gtaskid;
                                //console.clear();
                                //console.log(pSQL);

                                tx.executeSql(
                                    pSQL, [],
                                    function(tx, results) {
                                        var SKUS_X_ORDER = {};
                                        var x = 0;
                                        console.log(
                                            "results.SKUS_X_ORDER.length:" + results.rows.length
                                        );

                                        for (x = 0; x <= results.rows.length - 1; x++) {
                                            SKUS_X_ORDER = {
                                                ORDER_ID: results.rows.item(x).ORDER_ID,
                                                SKU_ID: results.rows.item(x).SKU_ID,
                                                SKU_DESCRIPTION: results.rows.item(x).SKU_DESCRIPTION,
                                                QTY: results.rows.item(x).QTY,
                                                UNIT_PRICE: results.rows.item(x).UNIT_PRICE,
                                                TOTAL_PRICE: results.rows.item(x).TOTAL_PRICE
                                            };

                                            pPacksResults.push(SKUS_X_ORDER);
                                        }
                                        console.log(pPacksResults);

                                        var xandroiddate = getDateTime();
                                        var porder_string = "";
                                        var pskus_string = "";

                                        porder_string = JSON.stringify(pOrderResults);

                                        pskus_string = JSON.stringify(pPacksResults);

                                        var datatoemit = {
                                            data_order: porder_string,
                                            data_skus: pskus_string,
                                            loginid: gLoggedUser,

                                            battery: gBatteryLevel,
                                            gps: gCurrentGPS,
                                            task: gtaskid,
                                            created: xandroiddate
                                        };

                                        console.log("datatoemit:" + datatoemit.data_skus);

                                        ActualizarTareaEstado(
                                            gtaskid,
                                            TareaEstado.Completada,
                                            function() {
                                                if (gIsOnline === 1) {
                                                    var conn_option = {
                                                        data: datatoemit,
                                                        dbuser: gdbuser,
                                                        dbuserpass: gdbuserpass
                                                    };
                                                    socket.emit("post_order", conn_option);
                                                }
                                            },
                                            function(err) {
                                                my_dialog("", "", "close");
                                                notify(err.message);
                                            }
                                        );
                                    },
                                    function(tx, err) {
                                        console.log(err.message);

                                        my_dialog("", "", "close");
                                        notify("post_presale: " + err.message);
                                    }
                                );
                                my_dialog("", "", "close");
                            },
                            function(err) {
                                my_dialog("", "", "close");
                                if (err.code !== 0) {
                                    notify("Error processing SQL: " + err.code);
                                }
                            }
                        );
                    },
                    function(err) {
                        console.log(err.message);

                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            notify("Error processing SQL: " + err.code);
                        }
                    }
                );
                my_dialog("", "", "close");
            },
            function(tx, err) {
                my_dialog("", "", "close");
                notify("Error processing SQL: " + err.message);
            }
        );
    } catch (e) {
        notify("ProcessPresaleTask:" + e.message);
    }
}

function cleanupuide() {
    $("#btnGEORoute").text("");
    $("#lblBranchAddress").text("");
    $("#listview_packs_detail")
        .children()
        .remove("li");
    $("#btnBranchName").text("Destino");
    $("#lblTotalOrder").text("0.00");
}

function CompletePreSaleTask() {
    try {
        var pCreatedOrders = $("#guides_listing li:visible").length;

        navigator.notification.confirm(
            "Finalizar Preventa con " + pCreatedOrders + " pedido(s) creado(s) ?", // message
            function(buttonIndex) {
                if (buttonIndex === 2) {
                    if (pCreatedOrders <= 0) {
                        try {
                            SONDA_DB_Session.transaction(
                                function(tx) {
                                    var pDoc = "";
                                    var pImg = "";

                                    var psql = "SELECT * FROM NO_VISIT";

                                    console.log(psql);
                                    tx.executeSql(
                                        psql, [],
                                        function(tx, results) {
                                            var xskus_len = results.rows.length - 1;
                                            gBranches = [];

                                            for (var i = 0; i <= xskus_len; i++) {
                                                try {
                                                    gBranches.push({
                                                        value: results.rows.item(i).PARAM_NAME,
                                                        text: results.rows.item(i).PARAM_CAPTION
                                                    });
                                                } catch (e) {
                                                    notiy(e.message);
                                                }
                                            }
                                            console.log(gBranches);
                                            var config_options = {
                                                title: "Motivo de no gestion",
                                                items: gBranches,
                                                doneButtonLabel: "Ok",
                                                cancelButtonLabel: "Cancelar"
                                            };

                                            window.plugins.listpicker.showPicker(
                                                config_options,
                                                function(item) {
                                                    SONDA_DB_Session.transaction(
                                                        function(tx) {
                                                            var gNoVisitDesc = GetNoVisitDesc(item);
                                                        },
                                                        function(err) {
                                                            notify(
                                                                "(21)Error processing SQL: " + err.message
                                                            );
                                                        }
                                                    );
                                                }
                                            );

                                            console.log("picker called");
                                            my_dialog("", "", "close");
                                        },
                                        function(err) {
                                            notify(" error picker ");
                                            my_dialog("", "", "close");
                                            if (err.code !== 0) {
                                                notify("(12)Error processing SQL: " + err.code);
                                            }
                                        }
                                    );
                                },
                                function(err) {
                                    if (err.code !== 0) {
                                        notify("(13)Error processing SQL: " + err.code);
                                    }
                                }
                            );
                        } catch (e) {
                            console.log("GetNoVisitReasons:" + e.message);
                            notify(e.message);
                        }
                    } else {
                        if (gSignated) {
                            my_dialog("Enviando Pedido(s)", "Procesando...", "close");
                            navigator.geolocation.getCurrentPosition(
                                function(position) {
                                    gCurrentGPS =
                                        position.coords.latitude + "," + position.coords.longitude;
                                    gLastGPS = gCurrentGPS;

                                    $(".gpsclass").text(
                                        position.coords.latitude + "," + position.coords.longitude
                                    );
                                    ProcessPresaleTask(0);
                                },
                                function() {
                                    gCurrentGPS = gLastGPS;

                                    ProcessPresaleTask(0);
                                }, { maximumAge: 30000, timeout: 15000, enableHighAccuracy: true }
                            );

                            my_dialog("", "", "close");

                            //RefreshMyRoutePlan();

                            $.mobile.changePage("#pickupplan_page", {
                                transition: "flow",
                                reverse: true,

                                showLoadMsg: false
                            });
                        } else {
                            notify("Debe firmar el cliente.");
                            SignAndPhoto("pickup");
                        }
                    }
                }
            }, // callback to invoke with index of button pressed
            "SondaÂ® Ruta " + SondaVersion, // title
            "No,Si" // buttonLabels
        );
    } catch (e) {
        notify(e.message);
    }
}

function clearsignaturepad() {
    signaturePad.clear();
}

function SignAndPhoto(pType) {
    switch (pType) {
        case "pickup":
            canvas = document.querySelector("canvas");

            signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2,
                penColor: "rgb(64, 64, 64)"
            });

            $.mobile.changePage("#pickupsignature_page", "flow", true, true);
            break;
        case "delivery":
            canvas = document.querySelector("canvas[delivery]");

            signaturePad = new SignaturePad(canvas, {
                minWidth: 1,
                maxWidth: 2,
                penColor: "rgb(64, 64, 64)"
            });

            $.mobile.changePage("#deliverysignature_page", "flow", true, true);
            break;
    }
}

function SetPrinterRole(pPrinterAddress) {
    try {
        var config_options = {
            title: "Tipo Impresora",

            items: [
                { text: "Asignar Impresora", value: "GUIAS" },
                { text: "Test Impresora", value: "TEST" }
            ],
            doneButtonLabel: "Ok",
            cancelButtonLabel: "Cancelar"
        };

        window.plugins.listpicker.showPicker(config_options, function(item) {
            $(".printerclass").buttonMarkup({ icon: "delete" });

            bluetoothSerial.connectInsecure(
                pPrinterAddress,
                function() {
                    $(".printerclass").buttonMarkup({ icon: "print" });
                },
                function() {
                    $(".printerclass").buttonMarkup({ icon: "delete" });
                }
            );

            switch (item) {
                case "TEST":
                    printtest(pPrinterAddress, "");
                    break;
                default:
                    navigator.notification.confirm(
                        "Confirma seleccionar printer para " + item + "?", // message
                        function(buttonIndex) {
                            if (buttonIndex === 2) {
                                localStorage.setItem("PRINTER_" + item, pPrinterAddress);
                                $(".printerclass").buttonMarkup({ icon: "print" });
                                exploredevices();
                            }
                        }, // callback to invoke with index of button pressed
                        "Sonda® Ruta " + SondaVersion, // title
                        "No,Si" // buttonLabels
                    );
                    break;
            }
        });
    } catch (e) {
        notify(e.message);
    }
}

function PruebaImpresion() {
    printtest("AC:3F:A4:70:AA:AD", "");
}

function savesignature(ptype) {
    try {
        if (signaturePad.isEmpty()) {
            notify("ERROR, Por favor procesada a firmar.");
            if (ptype === "pickup") {
                gSignated = false;
            } else {
                gSignatedDelivery = false;
            }
        } else {
            if (ptype === "pickup") {
                pSignature = signaturePad.toDataURL();
                console.log(pSignature);
                gSignated = true;
            } else {
                pSignature = signaturePad.toDataURL();
                console.log(pSignature);
                gSignatedDelivery = true;
            }

            window.history.back();
        }
    } catch (e) {
        notify(e.message);
    }
}

function CleanUpDeliveryImage() {
    try {
        $("#imgDelivery").attr("src", "img/camera.png");
    } catch (e) {
        notify(e.message);
    }
}

function take_picture_pickup(ptype) {
    navigator.camera.getPicture(
        function(imageURI) {
            if (ptype === "pickup") {
                $("#imgPickup").attr("src", "data:image/jpeg;base64," + imageURI);
                $("#divPickupPicture").css("visibility", "visible");
            } else {
                $("#imgDelivery").attr("src", "data:image/jpeg;base64," + imageURI);
            }
            gpicture = imageURI;
        },
        function(message) {
            //notify("ERROR," + message);
        }, {
            quality: 90,
            targetWidth: 350,
            targetHeight: 350,
            saveToPhotoAlbum: false,
            sourceType: navigator.camera.PictureSourceType.CAMERA,
            correctOrientation: true,
            destinationType: Camera.DestinationType.DATA_URL
        }
    );
}

function finishroute() {
    try {
        if (gIsOnline === 1) {
            navigator.notification.confirm(
                "Confirma FinalizaciÃ³n?", // message
                function(buttonIndex) {
                    if (buttonIndex === 2) {
                        var conn_option = {
                            courierid: gLoggedUser,
                            gps: gCurrentGPS,
                            batt: gBatteryLevel,
                            dbuser: gdbuser,
                            dbuserpass: gdbuserpass
                        };

                        my_dialog("Fin de ruta", "cerrando ruta espere...", "open");
                        navigator.geolocation.getCurrentPosition(
                            function(position) {
                                gCurrentGPS =
                                    position.coords.latitude + "," + position.coords.longitude;
                                $(".gpsclass").text(
                                    position.coords.latitude + "," + position.coords.longitude
                                );

                                gLastGPS = gCurrentGPS;

                                socket.emit("finishroute", conn_option);
                            },
                            function() {
                                gCurrentGPS = gLastGPS;
                                socket.emit("finishroute", conn_option);
                            }, { maximumAge: 30000, timeout: 15000, enableHighAccuracy: true }
                        );
                    }
                }, // callback to invoke with index of button pressed
                "SondaÂ® Ruta " + SondaVersion, // title
                "No,Si" // buttonLabels
            );
        }
    } catch (e) {
        notify("finishroute.catch:" + e.message);
    }
}

function navigateto() {
    /*notify(gtaskgps);*/
    try {
        var pUrl = gtaskgps.split(",");

        //launchnavigator.navigateByLatLon(pUrl[0], pUrl[1], function(){}, function(err){});
        var pGPS = "waze://?ll=" + pUrl[0] + "," + pUrl[1] + "&navigate=yes";

        WazeLink.open(pGPS);
    } catch (e) {
        notify(e.message);
    }
}

function ProcessAcceptManifest() {
    try {
        if (gIsOnline === 1) {
            socket.emit("manifest_accepted", {
                manifestid: gManifestID,
                batt: gBatteryLevel,
                courierid: gUserCode,
                gps: gCurrentGPS,
                dbuser: gdbuser,
                dbuserpass: gdbuserpass
            });
        } else {
            notify(
                "ERROR, Necesita estar conectado al servidor, para aceptar el manifiesto"
            );
        }
    } catch (e) {
        notify(e.message);
        console.log(e.message);
    }
}

function printdelivery() {
    try {
        var xdate = getDateTime();

        lheader = "! 0 50 50 620 1\r\n";
        lheader +=
            "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
        lheader += "CENTER 570 T 0 3 0 10 MOBILITY SCM\r\n";
        lheader += "B QR 200 60 M 2 U 8 \r\n";
        lheader += "M0A," + gGuideToDeliver + "\r\n";
        lheader += "ENDQR \r\n";
        lheader += "L 5 240 570 240 1\r\n";
        lheader +=
            "CENTER 570 T 0 3 0 270 ENTREGA DE GUIA: " + gGuideToDeliver + "\r\n";
        lheader +=
            "LEFT 5 T 0 2 0 300 EMPAQUES     : " + gPACKAGES_ToDeliver + "\r\n";
        lheader +=
            "LEFT 5 T 0 2 0 330 REMITENTE    : " +
            gRELATED_CLIENT_NAME_ToDeliver +
            "\r\n";
        lheader +=
            "LEFT 5 T 0 2 0 360 DESTINATARIO : " +
            gDESTINATION_CLIENTNAME_ToDeliver +
            "\r\n";
        lheader +=
            "LEFT 5 T 0 2 0 420 COURIER      : " +
            gUserCode +
            " " +
            gLoggedUser +
            "\r\n";
        lheader += "LEFT 5 T 0 2 0 450 FECHA Y HORA : " + xdate + "\r\n";
        lheader += "L 5 500 570 500 1\r\n";
        lheader += "CENTER 600 T 0 1 1 600 www.mobilityscm.com\r\n";

        lheader += "\r\nPRINT\r\n";

        $("#btnDeliveryFinish").removeClass("ui-disabled");

        try {
            bluetoothSerial.isConnected(
                function() {
                    try {
                        $(".printerclass").buttonMarkup({ icon: "print" });
                        bluetoothSerial.write(
                            lheader,
                            function() {
                                console.log("Done...");
                            },
                            function() {
                                notify("unable to write to printer");
                            }
                        );
                    } catch (e) {
                        console.log(e.message);
                    }
                },
                function() {
                    $(".printerclass").buttonMarkup({ icon: "print" });
                    bluetoothSerial.connect(
                        gPrintAddress,
                        function() {
                            $(".printerclass").buttonMarkup({ icon: "print" });
                            try {
                                bluetoothSerial.write(
                                    lheader,
                                    function() {
                                        console.log("Done...");
                                    },
                                    function() {
                                        notify("unable to write to printer");
                                    }
                                );
                            } catch (e) {
                                console.log(e.message);
                            }
                        },
                        function() {
                            $(".printerclass").buttonMarkup({ icon: "delete" });
                        }
                    );
                    ToastThis("Conectado a " + gPrintAddress);
                }
            );
        } catch (e) {
            notify("print.guide.catch:" + e.message);
        }

        my_dialog("", "", "close");
    } catch (e) {
        notify("print.delivery_guide.catch:" + e.message);
    }
}

function BloquearPantalla() {
    var imagenCarga = $("#imgCargandoInicioDeRuta");
    var anchura = $(window).width() / 2;

    imagenCarga.height(anchura / 2);
    imagenCarga.width(anchura / 2);

    var margenIzquiero = $(window).width() / 2;
    var margenSuperior = $(window).height() / 2;

    if (imagenCarga.attr("id") !== undefined) {
        window.objetoImagen = imagenCarga;
    }

    $.blockUI({
        message: window.objetoImagen,
        css: {
            top: margenSuperior - anchura / 2 / 2 + "px",
            left: margenIzquiero - anchura / 2 / 2 + "px",
            width: anchura / 2 + "px",
            height: anchura / 2 + "px"
        }
    });
    document.removeEventListener("menubutton", onMenuKeyDown, true);
    document.removeEventListener("backbutton", onBackKeyDown, true);
    imagenCarga = null;
}

function DesBloquearPantalla() {
    $.unblockUI();
    document.addEventListener("menubutton", onMenuKeyDown, true);
    document.addEventListener("backbutton", onBackKeyDown, true);

    var appIsReady = localStorage.getItem("APP_IS_READY");
    if (appIsReady === "1") {
        localStorage.setItem("LOGIN_STATUS", "OPEN");
        localStorage.setItem("POS_STATUS", "OPEN");
        localStorage.setItem("POS_DATE", getDateTime());
    }
}

function seleccionoOpcionEnBonificacionPorCombo(nombreDeObjeto) {
    try {
        console.log("OpcionSeleccionada: " + nombreDeObjeto);
        var objeto = $("#" + nombreDeObjeto);
        var valor = objeto.val();
        objeto.trigger("keyup");
        objeto.focus();
        objeto.val("");
        objeto.val(valor);
        objeto = null;
        return false;
    } catch (e) {
        notify("Error al seleccionar una opcion: " + e.message);
    }
}

function obtenerValorDeObjeto(nombreDeObjeto) {
    try {
        console.log("OpcionSeleccionada: " + nombreDeObjeto);
        var objeto = $("#" + nombreDeObjeto);
        var valor = objeto.val();
        objeto = null;

        return valor;
    } catch (e) {
        notify("Error al obtener el valor de una opcion: " + e.message);
    }
}

function obtenerCuentasDeBancos(callback, errCallback) {
    try {
        SONDA_DB_Session.transaction(
            function(tx) {
                var sql = "SELECT BANK, ACCOUNT_NUMBER FROM BANK_ACCOUNTS";

                tx.executeSql(
                    sql, [],
                    function(tx, results) {
                        if (results.rows.length > 0) {
                            var cuentasDeBancos = [];
                            for (var i = 0; i < results.rows.length; i++) {
                                var cuentaDeBanco = {
                                    banco: results.rows.item(i).BANK,
                                    numeroDeCuenta: results.rows.item(i).ACCOUNT_NUMBER
                                };

                                cuentasDeBancos.push(cuentaDeBanco);
                            }
                            callback(cuentasDeBancos);
                        } else {
                            errCallback({
                                code: -1,
                                message: "4-Error al obtener las cuentas de bancos: No hay cuentas de bancos configuradas"
                            });
                        }
                    },
                    function(tx, err) {
                        errCallback({
                            code: -1,
                            message: "3-Error al obtener las cuentas de bancos: " + err.message
                        });
                    }
                );
            },
            function(err) {
                errCallback({
                    code: -1,
                    message: "2-Error al obtener las cuentas de bancos: " + err.message
                });
            }
        );
    } catch (e) {
        errCallback({
            code: -1,
            message: "1-Error al obtener las cuentas de bancos: " + e.message
        });
    }
}