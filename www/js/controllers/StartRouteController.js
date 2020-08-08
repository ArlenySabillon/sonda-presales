var _startRouteCallback;


function MostrarPaginaDeInicioDeRuta() {
    console.log("MostrarPaginaDeInicioDeRuta.1");
    try {
        //alert("MostrarPaginaDeInicioDeRuta");
        $("#lblCurrentLoggedRoute").text(gCurrentRoute);
        $.mobile.changePage("#dialog_startpos", {
            transition: "flow",
            reverse: true,
            showLoadMsg: false
        });

    } catch (e) {
        console.log("MostrarPaginaDeInicioDeRuta: "+ e.message);
        notify(e.message);
    }
}

function DelegeteStartRouteController() {

    $(document).on("pageshow", "#dialog_startpos", function () {
        $("#btnStartPOS_action").css("visibility", "hidden");
    });

    $("#btnSyncAuthInvInfo").bind("touchstart", function() { UserWantsSyncRoute(); });
    $("#btnStartPOS_action").bind("touchstart", function() { UserWantsStartRoute(); }); 
}



function UserWantsStartRoute() {
    try {

        navigator.notification.confirm(
            "¿Confirmar inicio de ruta?", // message
            function(buttonIndex) {
                if (buttonIndex == 2) {
                    estaCargandoInicioRuta = 1;
                    BloquearPantalla();//metodo para bloquear la pantalla de usuario al inicio de ruta

                    //localStorage.setItem('POS_STATUS', 'OPEN');
                    //localStorage.setItem('POS_DATE', getDateTime());

                    /* save sat auth. info to global variable */
                    var pCurrentSAT_Resolution = $("#lblCurrent_AuthID").text();
                    var pCurrentSAT_Res_Serie = $("#lblCurrent_Serie").text();


                    /* show result on the page (invoices) */
                    var pCurrentSAT_Res_Date = $("#lblCurrent_DateAuth").text();
                    var pCurrentSAT_Res_DocStart = $("#lblCurrent_From").text();
                    var pCurrentSAT_Res_DocFinish = $("#lblCurrent_To").text();
                    var pCurrentInvoiceID = $("#lblCurrent_CurrentInvoice").text();

                    var gBranchAddress = $("#lblBranchAddress").text();
                    var gBranchName = $("#lblBranchName").text();

                    /* show result on the page (notes) */
                    var pCurrentSAT_Resolution_notes = $("#lblCurrent_AuthID_notes").text();
                    var pCurrentSAT_Res_Serie_notes = $("#lblCurrent_Serie_notes").text();

                    var pCurrentSAT_Res_Date_notes = $("#lblCurrent_DateAuth_notes").text();
                    var pCurrentSAT_Res_DocStart_notes = $("#lblCurrent_From_notes").text();
                    var pCurrentSAT_Res_DocFinish_notes = $("#lblCurrent_To_notes").text();
                    var pCurrentNoteID = $("#lblCurrent_From_notes").text();


                    /* show result on the page (invoices)*/
                    $("#lblSumm_Autho").text(pCurrentSAT_Resolution);
                    $("#lblSumm_Serie").text(pCurrentSAT_Res_Serie);
                    $("#lblSumm_AuthDate").text(pCurrentSAT_Res_Date);
                    $("#lblSumm_DocFrom").text(pCurrentSAT_Res_DocStart);
                    $("#lblSumm_DocTo").text(pCurrentSAT_Res_DocFinish);
                    $("#lblSumm_CurrentDoc").text(pCurrentInvoiceID);

                    /* show result on the page (notes) */
                    $("#lblSumm_Autho_notes").text(pCurrentSAT_Resolution_notes);
                    $("#lblSumm_Serie_notes").text(pCurrentSAT_Res_Serie_notes);
                    $("#lblSumm_AuthDate_notes").text(pCurrentSAT_Res_Date_notes);
                    $("#lblSumm_DocFrom_notes").text(pCurrentSAT_Res_DocStart_notes);
                    $("#lblSumm_DocTo_notes").text(pCurrentSAT_Res_DocFinish_notes);
                    $("#lblSumm_CurrentDoc_notes").text(pCurrentNoteID);

                    /* save results on device (invoices)*/
                    localStorage.setItem('POS_SAT_RESOLUTION', pCurrentSAT_Resolution);
                    localStorage.setItem('POS_SAT_RES_SERIE', pCurrentSAT_Res_Serie);
                    localStorage.setItem('POS_SAT_RES_DOC_START', pCurrentSAT_Res_DocStart);
                    localStorage.setItem('POS_SAT_RES_DOC_FINISH', pCurrentSAT_Res_DocFinish);
                    localStorage.setItem('POS_SAT_RES_DATE', pCurrentSAT_Res_Date);
                    localStorage.setItem('POS_CURRENT_INVOICE_ID', pCurrentInvoiceID);

                    /* save results on device (notes)*/
                    localStorage.setItem('POS_SAT_RESOLUTION_NOTES', pCurrentSAT_Resolution_notes);
                    localStorage.setItem('POS_SAT_RES_SERIE_NOTES', pCurrentSAT_Res_Serie_notes);
                    localStorage.setItem('POS_SAT_RES_DOC_START_NOTES', pCurrentSAT_Res_DocStart_notes);
                    localStorage.setItem('POS_SAT_RES_DOC_FINISH_NOTES', pCurrentSAT_Res_DocFinish_notes);
                    localStorage.setItem('POS_SAT_RES_DATE_NOTES', pCurrentSAT_Res_Date_notes);
                    localStorage.setItem('POS_CURRENT_CREDIT_NOTE', pCurrentSAT_Res_DocStart_notes);

                    localStorage.setItem('POS_SAT_BRANCH_NAME', gBranchName);
                    localStorage.setItem('POS_SAT_BRANCH_ADDRESS', gBranchAddress);

                    localStorage.setItem('SORT_BY', OpcionDeOrdenDelListadoDeSku.CodigoDeProducto.toString());
                    localStorage.setItem('SORT_OPTION', TipoDeOrdenDelListadoDeSku.Ascendente.toString());
                    
                    var data = {
                        'routeid': gCurrentRoute,
                        'default_warehouse': gDefaultWhs,
                        'dbuser': gdbuser,
                        'dbuserpass': gdbuserpass
                        , 'loggeduser': gLoggedUser
                        , 'presale_warehouse': gPreSaleWhs
                    };
                    socket.emit('get_initial_route', data);
                }
            }, // callback to invoke with index of button pressed
            'Sonda® ' + SondaVersion, // title
            'No,Si' // buttonLabels
        );


    } catch (e) {
        notify("UserWantsStartRoute: " + e.message);
    }
}

function ShowStarRoutePage(callback) {
    _startRouteCallback = callback;
    $.mobile.changePage("#dialog_startpos", { transition: "flow", reverse: true, changeHash: true, showLoadMsg: false });
    $("#lblCurrentLoggedRoute").text(gCurrentRoute);
}

function UserWantsSyncRoute() {
    ValidacionesDeSincronizacion();
}

function ValidacionesDeSincronizacion() {
    var pRoute = $("#lblCurrentLoggedRoute").text();

    try {
        var data = {
            'routeid': pRoute,
            'doctype': "FACTURA",
            'dbuser': gdbuser,
            'dbuserpass': gdbuserpass
        };
        socket.emit('ValidateRoute', data);
    } catch (e) {
        console.log(e.message);
    }
}

function ObtenerInformacionDeAutorizacion() {
    var pRoute = $("#lblCurrentLoggedRoute").text();

    try {
        var data = {
            'routeid': pRoute,
            'doctype': "FACTURA",
            'dbuser': gdbuser,
            'dbuserpass': gdbuserpass
        };
        socket.emit('getauthinfo', data);
    } catch (e) {
        console.log(e.message);
    }
}

function ObtenerInformacionDeRuta() {
    var pRoute = $("#lblCurrentLoggedRoute").text();

    try {
        var data = {
            'routeid': pRoute,
            'doctype': "FACTURA",
            'dbuser': gdbuser,
            'dbuserpass': gdbuserpass
        };
        socket.emit('GetRouteInfo', data);
    } catch (e) {
        console.log(e.message);
    }
}