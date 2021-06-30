var estadoListaTarea = "";
var listadoDeListasAsignadas = [];
var listadoDeListasAceptadas = [];
var listadoDeListasCompletadas = [];

function DelegarTareaControlador() {
    $("#uiTxtFiltroClientesAsignados").on("keypress", function(e) {
        if (e.keyCode === 13) {
            setTimeout(FiltrarClienteAsignados(), 1500);
            return false;
        }
    });

    $("#UiBotonCamaraClientesAsignados").on("click", function() {
        cordova.plugins.diagnostic.isCameraAuthorized(
            function(enabled) {
                if (enabled) {
                    LeerCodigoBarraConCamara(function(codigoLeido) {
                        var uiTxtFiltroClientesAceptadas = $(
                            "#uiTxtFiltroClientesAsignados"
                        );
                        uiTxtFiltroClientesAceptadas.val(codigoLeido);

                        if (codigoLeido !== "") {
                            FiltrarClienteAsignados();
                        }
                        uiTxtFiltroClientesAceptadas = null;
                    });
                } else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(
                        function(authorization) {
                            if (authorization === "DENIED") {
                                cordova.plugins.diagnostic.switchToSettings(
                                    function() {
                                        ToastThis(
                                            "Debe autorizar el uso de la Cámara para poder leer el Código."
                                        );
                                    },
                                    function(error) {
                                        notify(error);
                                    }
                                );
                            } else if (authorization === "GRANTED") {
                                LeerCodigoBarraConCamara(function(codigoLeido) {
                                    var uiTxtFiltroClientesAceptadas = $(
                                        "#uiTxtFiltroClientesAsignados"
                                    );
                                    uiTxtFiltroClientesAceptadas.val(codigoLeido);

                                    if (codigoLeido !== "") {
                                        FiltrarClienteAsignados();
                                    }
                                    uiTxtFiltroClientesAceptadas = null;
                                });
                            } else {
                                cordova.plugins.diagnostic.switchToSettings(
                                    function() {
                                        ToastThis(
                                            "Debe autorizar el uso de la Cámara para poder leer el Código."
                                        );
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
                }
            },
            function(error) {
                notify(error);
            }
        );
    });

    $("#uiTxtFiltroClientesAceptadas").on("keypress", function(e) {
        if (e.keyCode === 13) {
            setTimeout(FiltrarClienteAceptadas(), 1500);
            return false;
        }
    });

    $("#UiBotonCamaraClientesAceptadas").on("click", function() {
        cordova.plugins.diagnostic.isCameraAuthorized(
            function(enabled) {
                if (enabled) {
                    LeerCodigoBarraConCamara(function(codigoLeido) {
                        var uiTxtFiltroClientesAceptadas = $(
                            "#uiTxtFiltroClientesAceptadas"
                        );
                        uiTxtFiltroClientesAceptadas.val(codigoLeido);

                        if (codigoLeido !== "") {
                            FiltrarClienteAceptadas();
                        }
                        uiTxtFiltroClientesAceptadas = null;
                    });
                } else {
                    cordova.plugins.diagnostic.requestCameraAuthorization(
                        function(authorization) {
                            if (authorization === "DENIED") {
                                cordova.plugins.diagnostic.switchToSettings(
                                    function() {
                                        ToastThis(
                                            "Debe autorizar el uso de la Cámara para poder leer el Código."
                                        );
                                    },
                                    function(error) {
                                        notify(error);
                                    }
                                );
                            } else if (authorization === "GRANTED") {
                                LeerCodigoBarraConCamara(function(codigoLeido) {
                                    var uiTxtFiltroClientesAceptadas = $(
                                        "#uiTxtFiltroClientesAceptadas"
                                    );
                                    uiTxtFiltroClientesAceptadas.val(codigoLeido);

                                    if (codigoLeido !== "") {
                                        FiltrarClienteAceptadas();
                                    }
                                    uiTxtFiltroClientesAceptadas = null;
                                });
                            } else {
                                cordova.plugins.diagnostic.switchToSettings(
                                    function() {
                                        ToastThis(
                                            "Debe autorizar el uso de la Cámara para poder leer el Código."
                                        );
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
                }
            },
            function(error) {
                notify(error);
            }
        );
    });

    $("#uiTxtFiltroClientesCompletadas").on("keypress", function(e) {
        if (e.keyCode === 13) {
            setTimeout(FiltrarClienteCompletadas(), 1500);
            return false;
        }
    });

    $("#UiBotonCamaraClientesCompletadas").on("click", function() {
        LeerCodigoBarraConCamara(function(codigoLeido) {
            var uiTxtFiltroClientesCompletadas = $("#uiTxtFiltroClientesCompletadas");
            uiTxtFiltroClientesCompletadas.val(codigoLeido);

            if (codigoLeido !== "") {
                FiltrarClienteCompletadas();
            }
            uiTxtFiltroClientesCompletadas = null;
        });
    });
}

function FiltrarClienteAsignados() {
    var tareasEcontradas = 0;
    var idTarea = "";
    var criterioDeFiltro = $("#uiTxtFiltroClientesAsignados").val();
    for (var i = 0; i < listadoDeListasAsignadas.length; i++) {
        $("#" + listadoDeListasAsignadas[i] + " li").each(function(e, object, res) {
            var control = $("#" + object.id);
            if (control.attr("rga") === criterioDeFiltro) {
                tareasEcontradas++;
                idTarea = object.id.substring(8, object.id.length);
            }
            control = null;
        });
    }
    if (tareasEcontradas === 1) {
        $("#uiTxtFiltroClientesAsignados").val("");
        gettask(idTarea);
    } else if (tareasEcontradas === 0) {
        notify("No se encontraron clientes para el filtro aplicado");
    }
}

function FiltrarClienteAceptadas() {
    var tareasEcontradas = 0;
    var idTarea = "";
    var criterioDeFiltro = $("#uiTxtFiltroClientesAceptadas").val();
    for (var i = 0; i < listadoDeListasAceptadas.length; i++) {
        $("#" + listadoDeListasAceptadas[i] + " li").each(function(e, object, res) {
            var control = $("#" + object.id);
            if (control.attr("rga") === criterioDeFiltro) {
                tareasEcontradas++;
                idTarea = object.id.substring(8, object.id.length);
            }
            control = null;
        });
    }
    if (tareasEcontradas === 1) {
        $("#uiTxtFiltroClientesAceptadas").val("");
        gettask(idTarea);
    } else if (tareasEcontradas === 0) {
        notify("No se encontraron clientes para el filtro aplicado");
    }
}

function FiltrarClienteCompletadas() {
    var tareasEcontradas = 0;
    var idTarea = "";
    var criterioDeFiltro = $("#uiTxtFiltroClientesCompletadas").val();
    for (var i = 0; i < listadoDeListasCompletadas.length; i++) {
        $("#" + listadoDeListasCompletadas[i] + " li").each(function(
            e,
            object,
            res
        ) {
            var control = $("#" + object.id);
            if (control.attr("rga") === criterioDeFiltro) {
                tareasEcontradas++;
                idTarea = object.id.substring(8, object.id.length);
            }
            control = null;
        });
    }
    if (tareasEcontradas === 1) {
        $("#uiTxtFiltroClientesCompletadas").val("");
        gettask(idTarea);
    } else if (tareasEcontradas === 0) {
        notify("No se encontraron clientes para el filtro aplicado");
    }
}

function LlenarListaDeTareas(estado) {
    try {
        window.contadorListas++;
        if (localStorage.getItem("LISTA_TIPO_DOCUMENTO") === null) {
            localStorage.setItem("LISTA_TIPO_DOCUMENTO", "TASK_TYPE");
        }
        var tipo = localStorage.getItem("LISTA_TIPO_DOCUMENTO");
        //ToastThis("Cargando Tareas");
        my_dialog("Sonda® " + SondaVersion, "Cargando Tareas...", "open");
        SONDA_DB_Session.transaction(
            function(tx) {
                var strSql = "";
                estadoListaTarea = estado;
                if (tipo === "ALL") {
                    strSql +=
                        " SELECT *" +
                        ", (SELECT COUNT(TASK_ID) FROM PRESALES_ROUTE PD WHERE PD.TASK_STATUS = '" +
                        estado +
                        "') AS QTY " +
                        "FROM PRESALES_ROUTE PP " +
                        "LEFT JOIN TASK_AUX TU ON (PP.TASK_ID = TU.PRESALES_ROUTE_ID) " +
                        "LEFT JOIN CLIENTS C ON (PP.RELATED_CLIENT_CODE = C.CLIENT_ID) " +
                        "WHERE PP.TASK_STATUS = '" +
                        estado +
                        "' ";
                    strSql += " ORDER BY PP.TASK_SEQ";
                } else {
                    strSql += " SELECT DISTINCT*,";
                    strSql +=
                        " (SELECT COUNT(PD." +
                        tipo +
                        ") FROM PRESALES_ROUTE PD WHERE PD." +
                        tipo +
                        " = PP." +
                        tipo +
                        " AND PD.TASK_STATUS = '" +
                        estado +
                        "') AS QTY";
                    strSql +=
                        " FROM PRESALES_ROUTE PP " +
                        "LEFT JOIN TASK_AUX TU ON (PP.TASK_ID = TU.PRESALES_ROUTE_ID) " +
                        "LEFT JOIN CLIENTS C ON (PP.RELATED_CLIENT_CODE = C.CLIENT_ID) " +
                        "INNER JOIN TASK T ON T.TASK_ID = PP.TASK_ID " +
                        "WHERE PP.TASK_STATUS = '" +
                        estado +
                        "' ";
                    strSql += " ORDER BY PP." + tipo + ", PP.TASK_SEQ";
                }

                var nombreDeArcordion = obtenerNombreAcordionPorEstadoTarea(estado);

                if (nombreDeArcordion === "") {
                    return;
                }

                var pAcordionElement = $("#" + nombreDeArcordion);
                pAcordionElement.collapsibleset().trigger("create");

                tx.executeSql(
                    strSql, [],
                    function(tx, results) {
                        pAcordionElement.children().remove("div");

                        var codigoAcordionPorTipoTarea = "";
                        var nombreAcordion = "";
                        var vLi = "";
                        for (var i = 0; i <= results.rows.length - 1; i++) {
                            vLi = "";
                            var crearEtiqueta = false;

                            switch (tipo) {
                                case "TASK_TYPE":
                                    if (
                                        codigoAcordionPorTipoTarea !==
                                        results.rows.item(i).TASK_TYPE
                                    ) {
                                        codigoAcordionPorTipoTarea = results.rows.item(i).TASK_TYPE;
                                        crearEtiqueta = true;
                                    }
                                    break;
                                case "RELATED_CLIENT_CODE":
                                    if (
                                        codigoAcordionPorTipoTarea !==
                                        results.rows.item(i).RELATED_CLIENT_CODE
                                    ) {
                                        codigoAcordionPorTipoTarea = results.rows.item(i)
                                            .RELATED_CLIENT_CODE;
                                        crearEtiqueta = true;
                                    }
                                    break;
                                case "ALL":
                                    if (codigoAcordionPorTipoTarea !== "ALL") {
                                        codigoAcordionPorTipoTarea = "ALL";
                                        crearEtiqueta = true;
                                    }
                                    break;
                            }
                            if (crearEtiqueta) {
                                var acordion = obtenerAcordionParaListaTarea(
                                    codigoAcordionPorTipoTarea,
                                    estado,
                                    results.rows.item(i).QTY,
                                    results.rows.item(i).RELATED_CLIENT_NAME
                                );

                                pAcordionElement.append(acordion).collapsibleset("refresh");
                                pAcordionElement.trigger("create");
                            }

                            //SI NO SE GENERÓ GESTIÓN SE MOSTRARÁ (NO GENERÓ GESTIÓN)  LUEGO DEL NOMBRE DEL CLIENTE

                            if (results.rows.item(i).REASON == 'Genero Gestion') {
                                vLi = obtenerLiParaListaDeTareas(
                                    results.rows.item(i).TASK_ID,
                                    results.rows.item(i).TASK_TYPE,
                                    results.rows.item(i).TASK_STATUS,
                                    results.rows.item(i).RELATED_CLIENT_CODE,
                                    results.rows.item(i).RELATED_CLIENT_NAME,
                                    results.rows.item(i).TASK_ADDRESS,
                                    results.rows.item(i).NO_PICKEDUP,
                                    i,
                                    results.rows.item(i).RGA_CODE
                                );
                            } else {
                                vLi = obtenerLiParaListaDeTareas(
                                    results.rows.item(i).TASK_ID,
                                    results.rows.item(i).TASK_TYPE,
                                    results.rows.item(i).TASK_STATUS,
                                    results.rows.item(i).RELATED_CLIENT_CODE,
                                    results.rows.item(i).RELATED_CLIENT_NAME + ' (NO GENERÓ GESTIÓN)',
                                    results.rows.item(i).TASK_ADDRESS,
                                    results.rows.item(i).NO_PICKEDUP,
                                    i,
                                    results.rows.item(i).RGA_CODE
                                );
                            }


                            var uilista = $(
                                "#Lista" + estado + "-" + codigoAcordionPorTipoTarea
                            );
                            uilista.append(vLi);
                            uilista.listview("refresh");

                            var uiCantidadAcordion = $(
                                "#Cant" + estado + "-" + codigoAcordionPorTipoTarea
                            );
                            uiCantidadAcordion.text(parseInt(uilista["0"].childElementCount));

                            uilista = null;
                            if (i === 0) {
                                var uiAcordion = $(
                                    "#Acordion" + estado + "-" + codigoAcordionPorTipoTarea
                                );
                                uiAcordion.collapsible("option", "collapsed", false);
                                uiAcordion = null;
                            }
                        }
                        vLi = "";
                        my_dialog("", "", "close");
                        pAcordionElement = null;

                        //liberar la pantalla
                        if (contadorListas === 3) {
                            contadorListas = 0;
                            $.unblockUI();
                            document.addEventListener("menubutton", onMenuKeyDown, true);
                            document.addEventListener("backbutton", onBackKeyDown, true);
                            if (window.vistaCargandosePorPrimeraVez) {
                                notify(
                                    "La información de la Ruta ha sido cargada exitosamente..."
                                );
                            }
                        }
                    },
                    function(err) {
                        my_dialog("", "", "close");
                        if (err.code !== 0) {
                            alert("(6)Error processing SQL: " + err.code);
                        }
                    }
                );
            },
            function(err) {
                if (err.code !== 0) {
                    alert("(1)Error processing SQL: " + err.code);
                }
            }
        );
    } catch (e) {
        my_dialog("", "", "close");
        notify(e.message);
    }
}

function obtenerLiParaListaDeTareas(
    idTarea,
    tipoDeTarea,
    estadoTarea,
    codigoCliente,
    nombreCliente,
    direccionCliente,
    noReolectado,
    indiceDeLista,
    codeRga
) {
    var vLi = "";
    var totales = "";
    var pClick = "gettask(" + idTarea + ");";
    vLi += "";
    vLi +=
        '<li style="opacity: 1" class="ui-alt-icon ui-nodisc-icon" id="LITAREA-' +
        idTarea +
        '" rga="' +
        codeRga +
        '"> ' +
        '<a href="#" onclick=' +
        pClick +
        ' id="TAREA-' +
        idTarea +
        '" >';

    vLi +=
        '<p><span class="small-roboto">' +
        (indiceDeLista + 1) +
        ') </span> <span class="small-roboto" id="UiEtiquetaTskCliente-' +
        idTarea +
        '">' +
        codigoCliente +
        " " +
        nombreCliente +
        "</span></p>";
    vLi +=
        '<p><span class="small-roboto" id="UiEtiquetaTskClienteDireccion-' +
        idTarea +
        '">' +
        direccionCliente +
        "</span></p>";
    vLi += "<p style='display: none'>" + codeRga + "</p>";

    switch (estadoTarea) {
        case TareaEstado.Asignada:
            vLi +=
                '<span class="ui-li-count small-roboto" style="background-color:yellow"><img src="css/styles/images/icons-png/alert-black.png"></span>';
            break;
        case TareaEstado.Aceptada:
            vLi +=
                '<span class="ui-li-count small-roboto" style="background-color:lime"><img src="css/styles/images/icons-png/check-black.png"></span>';
            break;
        case TareaEstado.Completada:
            vLi += totales;
            vLi +=
                '<span class="ui-li-count small-roboto" style="background-color:lightsteelblue"><img src="css/styles/images/icons-png/tag-black.png"></span>';
            break;
        default:
            vLi +=
                '<span class="ui-li-count ui-btn small-roboto" style="background-color:silver">Sin Status ' +
                estadoTarea +
                "</span>";
            break;
    }

    switch (noReolectado) {
        case 1:
            vLi +=
                '<p><span class="small-roboto" style="text-shadow: none; color:#ffffff; background-color:orangered">No Recolectado. ' +
                noReolectado +
                "</span></p>";
            break;
        case 0:
            vLi +=
                '<p><span class="small-roboto" style="background-color:silver"></span></p>';
            break;
        default:
            vLi +=
                '<p><span class="small-roboto" style="background-color:silver"></span></p>';
            break;
    }
    vLi += "</a>";
    vLi += "</li>";
    return vLi;
}

function obtenerNombreAcordionPorEstadoTarea(estadoDeTarea) {
    var nombreDeArcordion = "";

    switch (estadoDeTarea) {
        case "ASSIGNED":
            nombreDeArcordion = "UiAcordionPadreTareasAsignadas";
            break;
        case "ACCEPTED":
            nombreDeArcordion = "UiAcordionPadreTareasAceptadas";
            break;
        case "COMPLETED":
            nombreDeArcordion = "UiAcordionPadreTareasCompletadas";
            break;
    }

    return nombreDeArcordion;
}

function obtenerNombreFiltro(estadoDeTarea) {
    var nombreFiltro = "";

    switch (estadoDeTarea) {
        case "ASSIGNED":
            nombreFiltro = "uiTxtFiltroClientesAsignados";
            break;
        case "ACCEPTED":
            nombreFiltro = "uiTxtFiltroClientesAceptadas";
            break;
        case "COMPLETED":
            nombreFiltro = "uiTxtFiltroClientesCompletadas";
            break;
    }

    return nombreFiltro;
}

function obtenerAcordionParaListaTarea(
    codigoAcordionPorTipoTarea,
    estadoDeTarea,
    cantidad,
    nombreCliente
) {
    var nombreAcordion = "";
    switch (codigoAcordionPorTipoTarea) {
        case "ALL":
            nombreAcordion = "Cant.";
            break;
        case TareaTipo.Preventa:
            nombreAcordion = TareaTipoDescripcion.Preventa;
            break;
        case TareaTipo.Venta:
            nombreAcordion = TareaTipoDescripcion.Venta;
            break;
        case TareaTipo.Scouting:
            nombreAcordion = TareaTipoDescripcion.Scouting;
            break;
        case TareaTipo.Entrega:
            nombreAcordion = TareaTipoDescripcion.Entrega;
            break;
        case TareaTipo.Borrador:
            nombreAcordion = TareaTipoDescripcion.Borrador;
            break;
        case TareaTipo.TomaDeInventario:
            nombreAcordion = TareaTipoDescripcion.TomaDeInventario;
            break;
        default:
            nombreAcordion = "Cant. -" + nombreCliente;
            break;
    }

    var nombreLista =
        "Lista" + estadoDeTarea + "-" + codigoAcordionPorTipoTarea + "";
    switch (estadoDeTarea) {
        case "ASSIGNED":
            listadoDeListasAsignadas.push(nombreLista);
            break;
        case "ACCEPTED":
            listadoDeListasAceptadas.push(nombreLista);
            break;
        case "COMPLETED":
            listadoDeListasCompletadas.push(nombreLista);
            break;
    }
    var acordion = "";
    acordion +=
        "<div data-role='collapsible' id='Acordion" +
        estadoDeTarea +
        "-" +
        codigoAcordionPorTipoTarea +
        "'>";
    acordion +=
        "<h5>" +
        nombreAcordion +
        "<span class='ui-li-count' id='Cant" +
        estadoDeTarea +
        "-" +
        codigoAcordionPorTipoTarea +
        "'>" +
        cantidad +
        "</span></h5>";
    acordion +=
        "<ul data-role='listview' data-mini='true' data-filter='true' data-input='#" +
        obtenerNombreFiltro(estadoDeTarea) +
        "' data-filter-placeholder='Buscar' data-filter-theme='a' data-divider-theme='c' id='Lista" +
        estadoDeTarea +
        "-" +
        codigoAcordionPorTipoTarea +
        "' ></ul>";
    acordion += "</div>";

    return acordion;
}

function UsuarioDeseaVerListaPorTipo() {
    var listaDeTipos = [];
    listaDeTipos.push({
        text: "Todos",
        value: "ALL"
    });
    listaDeTipos.push({
        text: "Tarea",
        value: "TASK_TYPE"
    });
    listaDeTipos.push({
        text: "Cliente",
        value: "RELATED_CLIENT_CODE"
    });
    var configoptions = {
        title: "Listado de productos",
        items: listaDeTipos,
        doneButtonLabel: "Ok",
        cancelButtonLabel: "Cancelar"
    };

    window.plugins.listpicker.showPicker(configoptions, function(item) {
        localStorage.setItem("LISTA_TIPO_DOCUMENTO", item);
        LlenarListaDeTareas(estadoListaTarea);
    });
}

var contadorListas = 0;

function cargarListaDeTareas() {
    BloquearPantalla();
    LlenarListaDeTareas("ASSIGNED");
    LlenarListaDeTareas("ACCEPTED");
    LlenarListaDeTareas("COMPLETED");
}

function actualizarListadoDeTareas(
    idTarea,
    tipoDeTarea,
    estadoDeTarea,
    codigoCliente,
    nombreCliente,
    direccionCliente,
    noReolectado,
    estadoDeTareaAnterior,
    rgaCode
) {
    var nombreDeArcordion = obtenerNombreAcordionPorEstadoTarea(estadoDeTarea);

    if (nombreDeArcordion === "") {
        return;
    }

    var pAcordionElement = $("#" + nombreDeArcordion);
    pAcordionElement.collapsibleset().trigger("create");

    var uiCantidadAcordion;
    var cantidadAcordion = 0;
    var uiLista;

    var uiAcordionPorTipo = $("#Acordion" + estadoDeTarea + "-" + tipoDeTarea);

    if (
        uiAcordionPorTipo === undefined ||
        uiAcordionPorTipo === null ||
        uiAcordionPorTipo.length === 0
    ) {
        var acordion = obtenerAcordionParaListaTarea(
            tipoDeTarea,
            estadoDeTarea,
            1,
            nombreCliente
        );
        pAcordionElement.append(acordion).collapsibleset("refresh");
        pAcordionElement.trigger("create");
    } else {
        //if (estadoDeTarea !== estadoDeTareaAnterior) {
        //    var uiListaT = $("#Lista" + estadoDeTarea + "-" + tipoDeTarea);
        //    uiCantidadAcordion = $("#Cant" + estadoDeTarea + "-" + tipoDeTarea);
        //    //cantidadAcordion = uiCantidadAcordion.text();
        //    uiCantidadAcordion.text(parseInt(uiListaT["0"].childElementCount));
        //}
    }

    if (estadoDeTarea !== estadoDeTareaAnterior) {
        var uiTarea = $("#TAREA-" + idTarea);
        //uiTarea.remove();
        uiTarea.closest("li").remove();
        uiTarea = null;

        uiLista = $("#Lista" + estadoDeTarea + "-" + tipoDeTarea);
        //uiLista.find("#TAREA-" + idTarea).remove();
        uiLista.listview("refresh");

        var li = obtenerLiParaListaDeTareas(
            idTarea,
            tipoDeTarea,
            estadoDeTarea,
            codigoCliente,
            nombreCliente,
            direccionCliente,
            noReolectado,
            parseInt(cantidadAcordion),
            rgaCode
        );
        uiLista.append(li);
        uiLista.listview("refresh");

        uiLista = null;
    }
    uiLista = $("#Lista" + estadoDeTarea + "-" + tipoDeTarea);
    if (uiLista["0"] !== undefined) {
        uiCantidadAcordion = $("#Cant" + estadoDeTarea + "-" + tipoDeTarea);
        uiCantidadAcordion.text(parseInt(uiLista["0"].childElementCount));
        uiCantidadAcordion = null;
    }

    uiLista = null;

    uiLista = $("#Lista" + estadoDeTareaAnterior + "-" + tipoDeTarea);
    if (uiLista["0"] !== undefined) {
        uiCantidadAcordion = $("#Cant" + estadoDeTareaAnterior + "-" + tipoDeTarea);
        uiCantidadAcordion.text(parseInt(uiLista["0"].childElementCount));
        uiCantidadAcordion = null;
    }

    uiLista = null;

    uiAcordionPorTipo = null;
    pAcordionElement = null;
}

function actualizarDatosDeTareaDom(
    tareaId,
    idCliente,
    nombreCliente,
    direccionCliente
) {
    var uiEtiquetaTskCliente = $("#UiEtiquetaTskCliente-" + tareaId);
    var uiEtiquetaTskClienteDireccion = $(
        "#UiEtiquetaTskClienteDireccion-" + tareaId
    );
    uiEtiquetaTskCliente.text(idCliente + " " + nombreCliente);
    uiEtiquetaTskClienteDireccion.text(direccionCliente);

    uiEtiquetaTskCliente = null;
    uiEtiquetaTskClienteDireccion = null;
}