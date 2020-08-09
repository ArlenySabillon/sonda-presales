function GetrouteInvCompleted(data) {
  if (data.pResult !== "OK") {
    my_dialog("", "", "close");
    notify(data.pResult);
  }
}

function ErrorMessage(data) {
  my_dialog("", "", "close");
  notify(data.message);
  DesBloquearPantalla();
}

function NoSkusFound(data) {
  ToastThis("No existen productos para la bodega : " + data.default_warehouse);
}

function AddToPosSku(data) {
  // var pSql = "DELETE FROM SKUS WHERE SKU = '" + data.row.SKU + "'";
  // window.gInsertsInitialRoute.push(pSql);

  var pSql =
    "INSERT INTO SKUS(SKU, SKU_NAME, SKU_PRICE, SKU_LINK, REQUERIES_SERIE, IS_KIT, ON_HAND, ROUTE_ID, IS_PARENT, PARENT_SKU, EXPOSURE, PRIORITY, QTY_RELATED, LOADED_LAST_UPDATED, CODE_FAMILY_SKU, SALES_PACK_UNIT)";
  pSql +=
    "VALUES('" +
    data.row.SKU +
    "','" +
    data.row.SKU_NAME +
    "'," +
    format_number(data.row.SKU_PRICE, 2) +
    ",'...',";
  pSql +=
    data.row.REQUERIES_SERIE +
    "," +
    data.row.IS_KIT +
    "," +
    data.row.ON_HAND +
    ",'" +
    data.row.ROUTE_ID +
    "',";
  pSql +=
    data.row.IS_PARENT +
    ",'" +
    data.row.PARENT_SKU +
    "'," +
    data.row.EXPOSURE +
    "," +
    data.row.PRIORITY +
    ",";
  pSql +=
    data.row.QTY_RELATED +
    ",'" +
    getDateTime() +
    "', '" +
    data.row.CODE_FAMILY_SKU +
    "', '" +
    data.row.SALESSALES_PACK_UNIT +
    "')";
  window.gInsertsInitialRoute.push(pSql);
}

function PosSkusCompleted(data) {
  if (gDefaultWhs === "") {
    my_dialog("", "", "close");
    notify(
      "ERROR, No hay ruta actual definida, contacte a su Administrador de Sonda."
    );
    return;
  }
}

function RequestedSerie(data) {
  // var pSql = "DELETE FROM SKU_SERIES";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoSeriesFound(data) {
  ToastThis("No se econtraron series para la ruta: " + data.routeid);
}

function AddToSeries(data) {
  // var pSql =
  //   "DELETE FROM SKU_SERIES WHERE SKU = '" +
  //   data.row.SKU +
  //   "' AND SERIE = '" +
  //   data.row.SKU_SERIE +
  //   "'";
  // window.gInsertsInitialRoute.push(pSql);
  var pSql =
    "INSERT INTO SKU_SERIES(SKU, IMEI, SERIE, PHONE, ICC, STATUS, LOADED_LAST_UPDATED)";
  pSql +=
    "VALUES('" +
    data.row.SKU +
    "','" +
    data.row.SKU_ICC +
    "','" +
    data.row.SKU_SERIE +
    "','" +
    data.row.SKU_PHONE +
    "',";
  pSql += "'" + data.row.SKU_ICC + "',0,'" + getDateTime() + "')";
  window.gInsertsInitialRoute.push(pSql);
}

function SeriesCompleted(data) {
  ToastThis("Tus Series de SKU's han sido cargadas exitosamente");
}

var vistaCargandosePorPrimeraVez = false;
function GetInitialRouteCompleted(data) {
  var mensajes = new Array();
  mensajes[1] = "Estamos preparando su información...";
  mensajes[2] = "Ya casi estamos listos...";
  mensajes[3] = "Por favor, espere...";
  mensajes[4] = "Estamos trabajando...";
  mensajes[5] = "Estamos validando los ultimos datos";

  var intervalo = setInterval(function() {
    var indice = Math.floor(Math.random() * 5 + 1);
    ToastThis(mensajes[indice]);
  }, 1000);

  InsertarRegistrosBDCompleta(
    function() {
      window.gInsertsInitialRoute.length = 0;
      localStorage.setItem("APP_IS_READY", "1");
      //cargarListaDeTareas();
      var to = setTimeout(function() {
        clearInterval(intervalo);
        clearTimeout(to);
        validarDesbloqueoDePantalla();

      }, 5000);
    },
    function(err) {
      notify(err);
    }
  );
}

function InsertarRegistrosBDCompleta(callBack, errorCallBack) {
  try {
    console.log(
      "registros a procesar => " + window.gInsertsInitialRoute.length
    );
    var iterationNumber = 0;
    var lastQuery = "";
    SONDA_DB_Session.transaction(
      function(trans) {
        for (
          iterationNumber = 0;
          iterationNumber < window.gInsertsInitialRoute.length;
          iterationNumber++
        ) {
          var sql = window.gInsertsInitialRoute[iterationNumber];
          lastQuery = sql;
          trans.executeSql(sql);
        }
        if (window.gInsertsInitialRoute.length <= 8000) {
          callBack();
        } else if (window.gInsertsInitialRoute.length > 8000) {
          setTimeout(callBack(), 15000);
        }
      },
      function(error) {
        console.log("Error al procesar instruccion SQL de inicio de ruta =>");
        console.log({
          "Ejecucion No.": iterationNumber,
          Instruccion: lastQuery
        });
        errorCallBack(error.message);
      }
    );
  } catch (e) {
    errorCallBack(e.message);
  }
}

function validarDesbloqueoDePantalla() {
  try {
    DesBloquearPantalla();
    localStorage.setItem("SeCargaronListas", "SI");
    $.mobile.changePage("#menu_page", {
      transition: "none",
      reverse: true,
      showLoadMsg: false
    });
    window.vistaCargandosePorPrimeraVez = true;
    cargarListaDeTareas();
  } catch (e) {
    notify(e.message);
  }
}

function RequestedSkus(data) {
  // var pSql = "DELETE FROM SKUS WHERE ROUTE_ID = '" + gCurrentRoute + "'";
  // window.gInsertsInitialRoute.push(pSql);
}

//----------Etiqueta---------//
function RequestedTags(data) {
  // var pSql = "DELETE FROM TAGS";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoTagsFound(data) {
  ToastThis("No se econtraron etiquetas para clientes: " + data.routeid);
}

function AddToTags(data) {
  // var pSql = "DELETE FROM TAGS WHERE TAG_COLOR = '" + data.row.TAG_COLOR + "'";
  // window.gInsertsInitialRoute.push(pSql);

  var pSql =
    "INSERT INTO TAGS(TAG_COLOR,TAG_VALUE_TEXT,TAG_PRIORITY,TAG_COMMENTS)";
  pSql +=
    "VALUES('" +
    data.row.TAG_COLOR +
    "','" +
    data.row.TAG_VALUE_TEXT +
    "','" +
    data.row.TAG_PRIORITY +
    "','" +
    data.row.TAG_COMMENTS +
    "')";
  window.gInsertsInitialRoute.push(pSql);
}

function TagsCompleted(data) {
  ToastThis("Tus Etiquetas han sido cargadas exitosamente");
}

//----------Fin Etiqueta---------//

//----------Cliente---------//
function RequestedGetCustomer(data) {
  // var pSql = "DELETE FROM CLIENTS";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetCustomerFound(data) {
  ToastThis("No se econtraron clientes: " + data.routeid);
}

function AddToCustomer(data) {
  var pSql = "";
  pSql = " INSERT INTO CLIENTS(";
  pSql += " CLIENT_ID";
  pSql += " , CLIENT_NAME";
  pSql += " , CLIENT_TAX_ID";
  pSql += " , BASE_PRICELIST";
  pSql += " , ADDRESS";
  pSql += " , IS_POSTED";
  pSql += " , PHONE";
  pSql += " , CLIENT_HH_ID_OLD";
  pSql += " , CONTACT_CUSTOMER";
  pSql += " , STATUS";
  pSql += " , NEW";
  pSql += " , CREDIT_LIMIT";
  pSql += " , EXTRADAYS";
  pSql += " , DISCOUNT";
  pSql += " , GPS";
  pSql += " , RGA_CODE";
  pSql += " , DISCOUNT_LIST_ID";
  pSql += " , BONUS_LIST_ID";
  pSql += " , PRICE_LIST_ID";
  pSql += " , SALES_BY_MULTIPLE_LIST_ID";
  pSql += " , PREVIUS_BALANCE";
  pSql += " , LAST_PURCHASE";
  pSql += " , INVOICE_NAME";
  pSql += " , SPECIAL_PRICE_LIST_ID";
  pSql += " , CODE_CHANNEL";
  pSql += " , GROUP_NUM";
  pSql += " , OUTSTANDING_BALANCE";
  pSql += " , LAST_PURCHASE_DATE";
  pSql += " , [DFPT_LIST_ID]";
  pSql += " )VALUES('" + data.row.CODE_CUSTOMER + "'";
  pSql += " , '" + data.row.NAME_CUSTOMER + "'";
  pSql += " , '" + data.row.TAX_ID_NUMBER + "'";
  pSql += " , '0'";
  pSql += " , '" + data.row.ADRESS_CUSTOMER + "'";
  pSql += " , -1";
  pSql += " , '" + data.row.PHONE_CUSTOMER + "'";
  pSql += " , '" + data.row.CODE_CUSTOMER + "'";
  pSql += " , '" + data.row.CONTACT_CUSTOMER + "'";
  pSql += " , 'NEW'";
  pSql += " , 0";
  pSql += " , " + ToDecimal(data.row.CREDIT_LIMIT);
  pSql += " , " + data.row.EXTRA_DAYS;
  pSql += " , " + data.row.DISCOUNT;
  pSql += " , '" + data.row.GPS + "'";
  pSql += " , '" + data.row.RGA_CODE + "'";
  pSql += " , " + data.row.DISCOUNT_LIST_ID;
  pSql += " , " + data.row.BONUS_LIST_ID;
  pSql += " , '" + data.row.PRICE_LIST_ID + "'";
  if (data.row.SALES_BY_MULTIPLE_LIST_ID === undefined) {
    pSql += ", " + null;
  } else {
    pSql += ", " + data.row.SALES_BY_MULTIPLE_LIST_ID;
  }
  pSql += " , " + data.row.PREVIUS_BALANCE;
  pSql += " , " + data.row.LAST_PURCHASE;

  if (data.row.INVOICE_NAME === null) {
    pSql += " , NULL";
  } else {
    pSql += " , '" + data.row.INVOICE_NAME + "'";
  }
  pSql += " , " + data.row.SPECIAL_PRICE_LIST_ID;
  pSql += " , '" + data.row.CODE_CHANNEL + "'";
  pSql += " , " + data.row.GROUP_NUM;
  pSql += " , " + data.row.OUTSTANDING_BALANCE;
  pSql += data.row.LAST_PURCHASE_DATE
    ? " , '" + data.row.LAST_PURCHASE_DATE + "'"
    : ", NULL";
  pSql += " , " + data.row.DFPT_LIST_ID;
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetCustomerCompleted(data) {
  ToastThis("Tus Clientes han sido cargados exitosamente");
}

//----------Fin Cliente---------//

//----------Frecuencia Cliente---------//
function RequestedGetCustomerFrequency(data) {
  // var pSql = "DELETE FROM CLIENTS_FREQUENCY";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetCustomerFrequencyFound(data) {
  ToastThis("No se econtraron frecuencias de clientes: " + data.routeid);
}

function AddToCustomerFrequency(data) {
  var pSql = "";

  pSql = " INSERT INTO CLIENTS_FREQUENCY(";
  pSql += " CODE_CUSTOMER";
  pSql += " , SUNDAY";
  pSql += " , MONDAY";
  pSql += " , TUESDAY";
  pSql += " , WEDNESDAY";
  pSql += " , THURSDAY";
  pSql += " , FRIDAY";
  pSql += " , SATURDAY";
  pSql += " , FREQUENCY_WEEKS";
  pSql += " )VALUES(";
  pSql += " '" + data.row.CODE_CUSTOMER + "'";
  pSql += " , '" + data.row.SUNDAY + "'";
  pSql += " , '" + data.row.MONDAY + "'";
  pSql += " , '" + data.row.TUESDAY + "'";
  pSql += " , '" + data.row.WEDNESDAY + "'";
  pSql += " , '" + data.row.THURSDAY + "'";
  pSql += " , '" + data.row.FRIDAY + "'";
  pSql += " , '" + data.row.SATURDAY + "'";
  pSql += " , '" + data.row.FREQUENCY_WEEKS + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetCustomerFrequencyCompleted(data) {
  ToastThis("Tus Frecuencias de Clientes han sido cargadas exitosamente");
}

//----------Fin Frecuencia Cliente---------//

//----------Etiquetas por Cliente---------//
function RequestedGetTagsXCustomer(data) {
  // var pSql = "DELETE FROM TAGS_X_CUSTOMER";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetTagsXCustomerFound(data) {
  ToastThis("No se econtraron etiquetas para los clientes: " + data.routeid);
}

function AddToTagsXCustomer(data) {
  var pSql = "";

  pSql = " INSERT INTO TAGS_X_CUSTOMER(";
  pSql += " TAG_COLOR";
  pSql += " , CUSTOMER";
  pSql += " , IS_POSTED";
  pSql += " , CUSTOMER_SYNC";
  pSql += " )VALUES(";
  pSql += " '" + data.row.TAG_COLOR + "'";
  pSql += " , '" + data.row.CUSTOMER + "'";
  pSql += " , -1";
  pSql += " , 1";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetTagsXCustomerCompleted(data) {
  ToastThis(" Tus Etiquetas de Clientes han sido cargadas exitosamente");
}

//----------Fin Etiquetas por Cliente---------//

//----------Reglas---------//
function RequestedGetRules(data) {
  // var pSql = "DELETE FROM RULE";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetRulesFound(data) {
  ToastThis("No se econtraron REGLAS para la ruta: " + data.routeid);
}

function AddToRule(data) {
  var pSql = "";

  pSql = " INSERT INTO RULE(";
  pSql += " EVENT_ID";
  pSql += " , NAME_EVENT";
  pSql += " , TYPE";
  pSql += " , FILTERS";
  pSql += " , ACTION";
  pSql += " , NAME_ACTION";
  pSql += " , TYPE_ACTION";
  pSql += " , ENABLED";
  pSql += " , CODE";
  pSql += " , EVENT_ORDER";
  pSql += " )VALUES(";
  pSql += " " + data.row.EVENT_ID;
  pSql += " , '" + data.row.NAME_EVENT + "'";
  pSql += " , '" + data.row.TYPE + "'";
  pSql += " , '" + data.row.FILTERS + "'";
  pSql += " , '" + data.row.ACTION + "'";
  pSql += " , '" + data.row.NAME_ACTION + "'";
  pSql += " , '" + data.row.TYPE_ACTION + "'";
  pSql += " , '" + data.row.ENABLED + "'";
  pSql += " , '" + data.row.CODE + "'";
  pSql += " , '" + data.row.EVENT_ORDER + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetRuleCompleted(data) {
  //ToastThis("Reglas cargadas exitosamente");
}

//----------Fin Reglas---------//

//----------Tareas---------//
function RequestedGetTask(data) {
  // var pSql = "DELETE FROM PRESALES_ROUTE";
  // window.gInsertsInitialRoute.push(pSql);
  // pSql = "DELETE FROM TASK";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetTasksFound(data) {
  ToastThis("No se econtraron TAREAS para la ruta: " + data.routeid);
}

function AddToTask(data) {
  var pSql = "";

  pSql = " INSERT INTO PRESALES_ROUTE(";
  pSql += "TASK_ID";
  pSql += ", SCHEDULE_FOR";
  pSql += ", ASSIGNED_BY";
  pSql += ", ACCEPTED_STAMP";
  pSql += ", COMPLETED_STAMP";
  pSql += ", DOC_PARENT";
  pSql += ", EXPECTED_GPS";
  pSql += ", POSTED_GPS";
  pSql += ", TASK_COMMENTS";
  pSql += ", TASK_SEQ";
  pSql += ", TASK_ADDRESS";
  pSql += ", RELATED_CLIENT_PHONE_1";
  pSql += ", EMAIL_TO_CONFIRM";
  pSql += ", RELATED_CLIENT_CODE";
  pSql += ", RELATED_CLIENT_NAME";
  pSql += ", TASK_PRIORITY";
  pSql += ", TASK_STATUS";
  pSql += ", SYNCED";
  pSql += ", NO_PICKEDUP";
  pSql += ", NO_VISIT_REASON";
  pSql += ", IS_OFFLINE";
  pSql += ", DOC_NUM";
  pSql += ", TASK_TYPE";
  pSql += ", DOC_PRINTED";
  pSql += ", TARGET_DOC";
  pSql += ", IN_PLAN_ROUTE";
  pSql += ", CREATE_BY";
  pSql += " ) VALUES (";
  pSql += data.row.TASK_ID;
  pSql += ",'" + data.row.SCHEDULE_FOR + "'";
  pSql += ",'" + data.row.ASSIGNED_BY + "'";
  pSql += ",NULL";
  pSql += ",NULL";
  pSql += ",0";
  pSql += ",'" + data.row.EXPECTED_GPS + "'";
  pSql += ",NULL";
  pSql += ",'" + data.row.TASK_COMMENTS + "'";
  pSql += "," + data.row.TASK_SEQ;
  pSql += ",'" + data.row.TASK_ADDRESS + "'";
  pSql += ",'" + data.row.RELATED_CLIENT_PHONE_1 + "'";
  if (data.row.EMAIL_TO_CONFIRM !== null) {
    pSql += ",'" + data.row.EMAIL_TO_CONFIRM + "'";
  } else {
    pSql += ",NULL";
  }
  pSql += ",'" + data.row.RELATED_CLIENT_CODE + "'";
  pSql += ",'" + data.row.RELATED_CLIENT_NAME + "'";
  pSql += "," + data.row.TASK_PRIORITY;
  pSql += ",'" + data.row.TASK_STATUS + "'";
  pSql += "," + data.row.SYNCED;
  if (data.row.NO_PICKEDUP !== null) {
    pSql += ",'" + data.row.NO_PICKEDUP + "'";
  } else {
    pSql += ",NULL";
  }
  if (data.row.NO_VISIT_REASON !== null) {
    pSql += ",'" + data.row.NO_VISIT_REASON + "'";
  } else {
    pSql += ",NULL";
  }
  pSql += "," + data.row.IS_OFFLINE;
  if (data.row.DOC_NUM !== null) {
    pSql += ",'" + data.row.DOC_NUM + "'";
  } else {
    pSql += ",NULL";
  }
  pSql += ",'" + data.row.TASK_TYPE + "'";
  pSql += ",NULL";
  pSql += "," + data.row.TARGET_DOC;
  if (data.row.IN_PLAN_ROUTE !== null) {
    pSql += "," + data.row.IN_PLAN_ROUTE;
  } else {
    pSql += ",NULL";
  }
  if (data.row.CREATE_BY !== null) {
    pSql += ",'" + data.row.CREATE_BY + "'";
  } else {
    pSql += ",NULL";
  }
  pSql += ")";
  window.gInsertsInitialRoute.push(pSql);

  pSql = " INSERT INTO TASK(";
  pSql += "TASK_ID";
  pSql += ", TASK_TYPE";
  pSql += ", TASK_DATE";
  pSql += ", SCHEDULE_FOR";
  pSql += ", CREATED_STAMP";
  pSql += ", ASSIGEND_TO";
  pSql += ", ASSIGNED_BY";
  pSql += ", ACCEPTED_STAMP";
  pSql += ", COMPLETED_STAMP";
  pSql += ", EXPECTED_GPS";
  pSql += ", POSTED_GPS";
  pSql += ", TASK_COMMENTS";
  pSql += ", TASK_SEQ";
  pSql += ", TASK_ADDRESS";
  pSql += ", RELATED_CLIENT_CODE";
  pSql += ", RELATED_CLIENT_NAME";
  pSql += ", TASK_STATUS";
  pSql += ", IS_POSTED";
  pSql += ", TASK_BO_ID";
  pSql += ", TARGET_DOC";
  pSql += ", IN_PLAN_ROUTE";
  pSql += ", CREATE_BY";
  pSql += ", TASK_BO_ID";
  pSql += " ) VALUES (";
  pSql += data.row.TASK_ID;
  pSql += ",'" + data.row.TASK_TYPE + "'";
  pSql += ",'" + data.row.TASK_DATE + "'";
  pSql += ",'" + data.row.SCHEDULE_FOR + "'";
  pSql += ",'" + data.row.TASK_DATE + "'";
  pSql += ",'" + data.row.ASSIGEND_TO + "'";
  pSql += ",'" + data.row.ASSIGNED_BY + "'";
  pSql += ",NULL";
  pSql += ",NULL";
  pSql += ",'" + data.row.EXPECTED_GPS + "'";
  pSql += ",NULL";
  pSql += ",'" + data.row.TASK_COMMENTS + "'";
  pSql += "," + data.row.TASK_SEQ;
  pSql += ",'" + data.row.TASK_ADDRESS + "'";
  pSql += ",'" + data.row.RELATED_CLIENT_CODE + "'";
  pSql += ",'" + data.row.RELATED_CLIENT_NAME + "'";
  pSql += ",'" + data.row.TASK_STATUS + "'";
  pSql += ",2";
  pSql += "," + data.row.TASK_ID;
  pSql += "," + data.row.TARGET_DOC;
  if (data.row.IN_PLAN_ROUTE !== null) {
    pSql += "," + data.row.IN_PLAN_ROUTE;
  } else {
    pSql += ",NULL";
  }
  if (data.row.CREATE_BY !== null) {
    pSql += ",'" + data.row.CREATE_BY + "'";
  } else {
    pSql += ",NULL";
  }
  pSql += "," + data.row.TASK_ID;
  pSql += ")";
  window.gInsertsInitialRoute.push(pSql);
}

function AddToReasons(data) {
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        var pSql =
          " DELETE FROM REASONS WHERE REASON_VALUE = '" +
          data.NAME_CLASSIFICATION +
          "'";
        tx.executeSql(pSql);

        pSql = " INSERT INTO REASONS(";
        pSql += "  REASON_TYPE";
        pSql += ", REASON_PRIORITY";
        pSql += ", REASON_VALUE";
        pSql += ", REASON_PROMPT) VALUES";

        pSql += "('" + data.GROUP_CLASSIFICATION + "'";
        pSql += ",'" + data.PRIORITY_CLASSIFICATION + "'";
        pSql += ",'" + data.NAME_CLASSIFICATION + "'";
        pSql += ",'" + data.VALUE_TEXT_CLASSIFICATION + "')";

        tx.executeSql(pSql);
      },
      function(err) {
        alert(err.message);
      },
      function() {
        /* empty */
      }
    );
  } catch (e) {
    /* empty */
  }
}

function GetTaskCompleted(data) {
  ToastThis("Tus Tareas han sido cargadas exitosamente");
}

//----------Fin Tareas---------//

//----------SkuPreSale---------//
function RequestedGetSkuPreSale(data) {
  // var pSql = "DELETE FROM SKU_PRESALE";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetSkuPreSaleFound(data) {
  ToastThis(
    "No se econtraron sku para la orden de venta, para la ruta: " + data.routeid
  );
}

var isNullsku = 0
function AddToSkuPreSale(data) {
  var pSql = "";

  pSql = " INSERT INTO SKU_PRESALE(";
  pSql += " WAREHOUSE";
  pSql += " , SKU";
  pSql += " , ON_HAND";
  pSql += " , IS_COMITED";
  pSql += " , DIFFERENCE";
  pSql += " , SKU_NAME";
  pSql += " , SKU_PRICE";
  pSql += " , CODE_FAMILY_SKU";
  pSql += " , SALES_PACK_UNIT";
  pSql += " , HANDLE_DIMENSION";
  pSql += " , OWNER";
  pSql += " , OWNER_ID";
  pSql += " , BARCODE_SKU";
  pSql += " )VALUES(";
  pSql += " '" + data.row.WAREHOUSE + "'";
  pSql += " , '" + data.row.SKU + "'";
  pSql += " , '" + data.row.ON_HAND + "'";
  pSql += " , '" + data.row.IS_COMITED + "'";
  pSql += " , '" + data.row.DIFFERENCE + "'";
  pSql += " , '" + data.row.SKU_NAME + "'";
  pSql += " , " + data.row.SKU_PRICE + "";
  pSql += " , '" + data.row.CODE_FAMILY_SKU + "'";
  pSql += " , '" + data.row.SALES_PACK_UNIT + "'";
  if (
    data.row.HANDLE_DIMENSION === null ||
    data.row.HANDLE_DIMENSION === "null" ||
    data.row.HANDLE_DIMENSION === undefined ||
    data.row.HANDLE_DIMENSION === "NULL" ||
    data.row.HANDLE_DIMENSION === 0 ||
    data.row.HANDLE_DIMENSION === "0"
  ) {
    pSql += ", " + 0;
  } else {
    pSql += ", " + 1;
  }
  pSql += " , '" + data.row.OWNER + "'";
  pSql += " , '" + data.row.OWNER_ID + "'";
  pSql += " , '" + (data.row.BARCODE_SKU || '') + "'";
  pSql += " )";
  
  if (Math.random() < 0.0005 || data.row.BARCODE_SKU == '7891153033082') {
    console.log(pSql)
  }
  window.gInsertsInitialRoute.push(pSql);
}

function GetSkuPreSaleCompleted(data) {
  ToastThis("Tus SKU's para ordenes de venta han sido cargados exitosamente");
}
//----------Fin SkuPreSale---------//

//----------Secuencia de Documentos---------//
function GetDocumentSequenceStart(data) {
  // var pSql = "DELETE FROM DOCUMENT_SEQUENCE";
  // window.gInsertsInitialRoute.push(pSql);
}

function GetDocumentSequenceNoFound(data) {
  ToastThis(
    "No se encontraron secuencias de documentos, para la ruta: " + data.routeid
  );
}

function AddToDocumentSequence(data) {
  var pSql = "";

  pSql = " INSERT INTO DOCUMENT_SEQUENCE(";
  pSql += " DOC_TYPE";
  pSql += " , DOC_FROM";
  pSql += " , DOC_TO";
  pSql += " , SERIE";
  pSql += " , CURRENT_DOC";
  pSql += " , BRANCH_NAME";
  pSql += " , BRANCH_ADDRESS";
  pSql += " )VALUES(";
  pSql += " '" + data.row.DOC_TYPE + "'";
  pSql += " , " + data.row.DOC_FROM;
  pSql += " , " + data.row.DOC_TO;
  pSql += " , '" + data.row.SERIE + "'";
  pSql += " , " + data.row.CURRENT_DOC;
  pSql += " , '" + data.row.BRANCH_NAME + "'";
  pSql += " , '" + data.row.BRANCH_ADDRESS + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetDocumentSequenceCompleted(data) {
  ToastThis("Tus Secuencias De Documentos han sido cargadas exitosamente");
}
//----------Fin Secuencia de Documentos---------//

//----------Paquetes---------//
function GetPackUnitStart(data) {
  // var pSql = "DELETE FROM PACK_UNIT";
  // window.gInsertsInitialRoute.push(pSql);
}

function GetPackUnitNoFound(data) {
  ToastThis("No se encontraron paquetes");
}

function AddToPackUnit(data) {
  var pSql = "";
  pSql = "INSERT INTO PACK_UNIT(";
  pSql += " PACK_UNIT";
  pSql += " , CODE_PACK_UNIT";
  pSql += " , DESCRIPTION_PACK_UNIT";
  pSql += " , [UM_ENTRY]";
  pSql += " )VALUES(";
  pSql += data.row.PACK_UNIT;
  pSql += " , '" + data.row.CODE_PACK_UNIT + "'";
  pSql += " , '" + data.row.DESCRIPTION_PACK_UNIT + "'";
  pSql += " , " + data.row.UM_ENTRY;
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetPackUnitCompleted(data) {
  //ToastThis("Tus Paquetes Por SKU han sido cargados exitosamente");
}
//----------Fin Paquetes---------//

//----------Conversion de Paquetes---------//
function GetPackConversionStart(data) {
  // var pSql = "DELETE FROM PACK_CONVERSION";
  // window.gInsertsInitialRoute.push(pSql);
}

function GetPackConversionNoFound(data) {
  ToastThis("No se encontraron conversiones de paquetes");
}

function AddToPackConversion(data) {
  var pSql = "";

  pSql = "INSERT INTO PACK_CONVERSION(";
  pSql += " PACK_CONVERSION";
  pSql += " , CODE_SKU";
  pSql += " , CODE_PACK_UNIT_FROM";
  pSql += " , CODE_PACK_UNIT_TO";
  pSql += " , CONVERSION_FACTOR";
  pSql += " , [ORDER]";
  pSql += " )VALUES(";
  pSql += data.row.PACK_CONVERSION;
  pSql += " , '" + data.row.CODE_SKU + "'";
  pSql += " , '" + data.row.CODE_PACK_UNIT_FROM + "'";
  pSql += " , '" + data.row.CODE_PACK_UNIT_TO + "'";
  pSql += " , " + data.row.CONVERSION_FACTOR;
  pSql += " , " + data.row.ORDER;
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetPackConversionCompleted(data) {
  //ToastThis("Conversiones de paquetes cargados exitosamente");
}
//----------Fin Conversion de Paquetes---------//

//----------Información de Inicio---------//
function MostarInformacionDeUsuario(data) {
  $("#UiImgUsuario").attr("src", data.IMAGE);
  $("#UiLblLogin").text(data.LOGIN);
  $("#UiLblRuta").text(data.SELLER_ROUTE);
  $("#UiLblBodegaVenta").text(data.DEFAULT_WAREHOUSE);
  $("#UiLblBodegaVentaNombre").text(data.DEFAULT_WAREHOUSE_DESCRIPTION);
  $("#UiLblBodegaPreventa").text(data.PRESALE_WAREHOUSE);
  $("#UiLblBodegaPreventaNombre").text(data.PRESALE_WAREHOUSE_DESCRIPTION);
  $("#UiLblUsaUnidadDePaquete").text(data.USE_PACK_UNIT === 0 ? "NO" : "SI");
  localStorage.setItem("USE_PACK_UNIT", data.USE_PACK_UNIT);
  if (data.SELLER_OWNER !== "")
    localStorage.setItem("SELLER_OWNER", data.SELLER_OWNER);
  if (data.SELLER_OWNER_ID !== 0)
    localStorage.setItem("SELLER_OWNER_ID", data.SELLER_OWNER_ID);
  else {
    var data1 = {
      routeid: data.SELLER_ROUTE,
      default_warehouse: data.DEFAULT_WAREHOUSE,
      dbuser: gdbuser,
      dbuserpass: gdbuserpass
    };
    socket.emit("GetCompanies", data1);
  }
}

function AddCompany(data) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var pSql;

      pSql = " DELETE FROM COMPANY";
      tx.executeSql(pSql);

      for (var i = 0; i < data.data.length; i++) {
        var detalle = data.data[i];

        pSql = " INSERT INTO COMPANY(";
        pSql += " COMPANY_ID";
        pSql += " , COMPANY_NAME";
        pSql += " )VALUES(";
        pSql += " " + detalle.COMPANY_ID;
        pSql += " , '" + detalle.COMPANY_NAME + "'";
        pSql += " )";

        tx.executeSql(pSql);
      }

      if (data.data.length === 1) {
        localStorage.setItem("SELLER_OWNER", data.data[0].COMPANY_NAME);
        localStorage.setItem("SELLER_OWNER_ID", data.data[0].COMPANY_ID);
      }
    },
    function(err) {
      my_dialog("", "", "close");
      alert(err.message);
    },
    function() {}
  );
}

function MostarResolucion(data) {
  if (data) {
    $("#UiLblAutorizacion").text(data.AUTH_ID || "N/A");
    $("#UiLblSerie").text(data.AUTH_SERIE || "N/A");
    $("#UiLblFechaAutorizacion").text(data.AUTH_POST_DATETIME || "N/A");
    $("#UiLblFechaVencimiento").text(data.AUTH_LIMIT_DATETIME || "N/A");
    $("#UiLblFacturaInicio").text(data.AUTH_DOC_FROM || "N/A");
    $("#UiLblFacturaFinal").text(data.AUTH_DOC_TO || "N/A");
    $("#UiLblFacturaActual").text(data.AUTH_CURRENT_DOC || "N/A");
  }
}

function MostarSecuenciaDeDocumentos(data) {
  var vLI = "";

  var pElement = $("#UiSecuenciaDeDocumentos");
  pElement.children().remove("li");

  for (var i = 0; i < data.length; i++) {
    vLI = "";
    vLI += '<li class="ui-field-contain">';
    vLI += '<span class="small-roboto">Tipo Doc. </span>';
    vLI += '<span class="ui-li-count">' + data[i].DOC_TYPE + "</span> </li>";

    vLI += '<li class="ui-field-contain">';
    vLI += '<span><span class="small-roboto">Serie: </span>';
    vLI += '<span class="ui-li-count">' + data[i].SERIE + "</span> </li>";

    vLI += '<li class="ui-field-contain">';
    vLI += '<span><span class="small-roboto">Fecha: </span>';
    vLI +=
      '<span class="ui-li-count">' + data[i].POST_DATETIME + "</span> </li>";

    vLI += '<li class="ui-field-contain">';
    vLI += '<span><span class="small-roboto">Inicial: </span>';
    vLI += '<span class="ui-li-count">' + data[i].DOC_FROM + "</span> </li>";

    vLI += '<li class="ui-field-contain">';
    vLI += '<span><span class="small-roboto">Final: </span>';
    vLI += '<span class="ui-li-count">' + data[i].DOC_TO + "</span> </li>";

    vLI += '<li class="ui-field-contain">';
    vLI += '<span><span class="small-roboto">Actual: </span>';
    vLI += '<span class="ui-li-count">' + data[i].CURRENT_DOC + "</span> </li>";

    pElement.append(vLI);
  }
  pElement.listview("refresh");
  pElement = null;
}

function MostarResumenDeTareas(data) {
  if (!data) {
    return;
  }
  var vLI = "";
  var total_tasks = 0;
  var pElement = $("#UiResumenDeTareas");

  pElement.children().remove("li");

  for (var i = 0; i < data.length; i++) {
    vLI = "";
    vLI += "<li>";
    vLI += '<span class="small-roboto">Tarea(s) de ';
    vLI += data[i].TASK_TYPE + "</span>";
    vLI +=
      '<span class="small-roboto ui-li-count">' +
      data[i].TOTAL_TASK_TYPE +
      "</span>";
    vLI += "</li>";

    total_tasks += data[i].TOTAL_TASK_TYPE;
    pElement.append(vLI);
    pElement.listview("refresh");
  }

  $("#lblmistareas_count").text(total_tasks);
}

function MostarResumenDeCantidad(data) {
  var vLI = "";
  $("#UiResumenDeCantidad")
    .children()
    .remove("li");
  for (var i = 0; i < data.length; i++) {
    vLI = "";
    vLI += '<li class="ui-field-contain">';
    vLI += '<span><span class="medium">Total de Clientes: </span>';
    vLI += '<span class="title">' + data[i].CLIENT_QTY + "</span></span>";
    vLI += '<br/><span><span class="medium">Productos de Venta: </span>';
    vLI += '<span class="title">' + data[i].SKU_SALE_QTY + "</span></span>";
    vLI += '<br/><span><span class="medium">Productos de Preventa: </span>';
    vLI += '<span class="title">' + data[i].SKU_PRESALE_QTY + "</span></span>";
    vLI += '<br/><span><span class="medium">Total de Tareas: </span>';
    vLI += '<span class="title">' + data[i].TASK_QTY + "</span></span>";
    vLI += '<br/><span><span class="medium">Facturas Disponibles: </span>';
    vLI += '<span class="title">' + data[i].INVOICE_QTY + "</span></span>";
    vLI += '<br/><span><span class="medium">Ordenes Disponibles: </span>';
    vLI += '<span class="title">' + data[i].SALES_ORDER_QTY + "</span></span>";
    vLI += "</li>";

    $("#UiResumenDeCantidad").append(vLI);
    $("#UiResumenDeCantidad").listview("refresh");
  }
}

function LimpiarInicioDeRuta() {
  $("#UiImgUsuario").attr("src", "");
  $("#UiLblLogin").text("...");
  $("#UiLblRuta").text("...");
  $("#UiLblBodegaVenta").text("...");
  $("#UiLblBodegaVentaNombre").text("...");
  $("#UiLblBodegaPreventa").text("...");
  $("#UiLblBodegaPreventaNombre").text("...");

  $("#UiLblAutorizacion").text("...");
  $("#UiLblSerie").text("...");
  $("#UiLblFechaAutorizacion").text("....-..-..");
  $("#UiLblFechaVencimiento").text("...-..-..");
  $("#UiLblFacturaInicio").text("0");
  $("#UiLblFacturaFinal").text("0");
  $("#UiLblFacturaActual").text("0");

  $("#UiSecuenciaDeDocumentos")
    .children()
    .remove("li");
  $("#UiResumenDeTareas")
    .children()
    .remove("li");
  $("#UiResumenDeCantidad")
    .children()
    .remove("li");

  $("#UiAcordionInformacionUsuario").collapsible("option", "collapsed", false);
}
//----------Fin Información de Inicio---------//

//----------Inicio Familia de sku---------//

function RequestedGetFamilySku(data) {
  // var pSql = "DELETE FROM FAMILY_SKU";
  // window.gInsertsInitialRoute.push(pSql);
}

function NoGetFamilySkuFound(data) {
  ToastThis("No se econtraron familias de sku para la ruta: " + data.routeid);
}

function AddToFamilySku(data) {
  var pSql = "";

  pSql = " INSERT INTO FAMILY_SKU(";
  pSql += " FAMILY_SKU";
  pSql += " , CODE_FAMILY_SKU";
  pSql += " , DESCRIPTION_FAMILY_SKU";
  pSql += " , ORDER_SKU";
  pSql += " )VALUES(";
  pSql += " " + data.row.FAMILY_SKU;
  pSql += " , '" + data.row.CODE_FAMILY_SKU + "'";
  pSql += " , '" + data.row.DESCRIPTION_FAMILY_SKU + "'";
  pSql += " , " + data.row.ORDER;
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetFamilySkuCompleted(data) {
  //ToastThis("Familias de Sku cargadas exitosamente");
}

//----------Fin Familia de sku---------//

//----------Inicio Facturas---------//

function NoGetInvoiceFound(data) {
  ToastThis("No se econtraron facturas para la ruta: " + data.routeid);
}

function AddInvoice(data) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var pSql =
        "DELETE FROM INVOICE_HEADER WHERE INVOICE_NUM = " + data.invoiceId;
      pSql += " AND CLIENT_ID = '" + data.clientId + "'";
      pSql += " AND IS_POSTED  = 3";
      tx.executeSql(pSql);

      pSql = "DELETE FROM INVOICE_DETAIL WHERE INVOICE_NUM = " + data.invoiceId;
      tx.executeSql(pSql);

      pSql = " INSERT INTO INVOICE_HEADER(";
      pSql += " INVOICE_NUM";
      pSql += " , TOTAL_AMOUNT";
      pSql += " , POSTED_DATETIME";
      pSql += " , DOC_DUE_DATE";
      pSql += " , CLIENT_ID";
      pSql += " , SAT_SERIE";
      pSql += " , IS_POSTED";
      pSql += " )VALUES(";
      pSql += " " + data.invoiceId;
      pSql += " , " + data.totalAmount;
      pSql += " , '" + data.docDate + "'";
      pSql += " , '" + data.docDueDate + "'";
      pSql += " , '" + data.clientId + "'";
      pSql += " , '" + data.serie + "'";
      pSql += " , 3";
      pSql += " )";
      tx.executeSql(pSql);

      for (var i = 0; i < data.details.length; i++) {
        var detalle = data.details[i];
        pSql = " INSERT INTO INVOICE_DETAIL(";
        pSql += " INVOICE_NUM";
        pSql += " , LINE_SEQ";
        pSql += " , SKU";
        pSql += " , SKU_NAME";
        pSql += " , QTY";
        pSql += " , PRICE";
        pSql += " , TOTAL_LINE";

        pSql += " )VALUES(";
        pSql += " " + detalle.invoiceId;
        pSql += " , " + detalle.lineSeq;
        pSql += " , '" + detalle.sku + "'";
        pSql += " , '" + detalle.skuName + "'";
        pSql += " , " + detalle.qty;
        pSql += " , " + detalle.price;
        pSql += " , " + detalle.totalLine;
        pSql += " )";

        tx.executeSql(pSql);
      }
    },
    function(err) {
      my_dialog("", "", "close");
      alert(err.message);
    },
    function() {}
  );
}

function GetInvoiceCompleted(data) {
  ObtenerSaldoActual(
    gClientID,
    function(idCliente, saldo) {
      window.gSaldoTotal = saldo;
      $("#lblSaldoTotal").text(format_number(ToDecimal(window.gSaldoTotal), 2));
    },
    function(err) {
      notify("Error al obtener saldo del cliente: " + err.message);
    }
  );
}
//----------Fin de Facturas---------//

//----------Inicio de Listas de Precios por Cliente---------//
function PriceListByCustomerReceived() {
  // var sql = "DELETE FROM PRICE_LIST_BY_CUSTOMER";
  // window.gInsertsInitialRoute.push(sql);
}

function PriceListByCustomerNotFound(data) {
  ToastThis(
    "No se encontraron Listas de Precio por Cliente para la Ruta: " +
      data.routeid
  );
}

function AddPriceListByCustomer(data) {
  var pSql = null;
  pSql = " INSERT INTO PRICE_LIST_BY_CUSTOMER(";
  pSql += " CODE_PRICE_LIST";
  pSql += " , CODE_CUSTOMER";
  pSql += " )VALUES(";
  pSql += " '" + data.row.CODE_PRICE_LIST + "'";
  pSql += " , '" + data.row.CODE_CUSTOMER + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function PriceListByCustomerCompleted() {
  //ToastThis("Listas de Precio por Cliente Cargadas Exitosamente.");
}

//----------Fin de Listas de Precios por Cliente---------//

//----------Inicio de Listas de Precios por SKU---------//
function PriceListBySKUReceived() {
  // var pSql = "DELETE FROM PRICE_LIST_BY_SKU";
  // window.gInsertsInitialRoute.push(pSql);
}

function PriceListBySKUNotFound(data) {
  ToastThis(
    "No se encontraron Listas de Precio por SKU para la Ruta: " + data.routeid
  );
}

function AddPriceListBySKU(data) {
  var pSql = null;

  pSql = " INSERT INTO PRICE_LIST_BY_SKU(";
  pSql += " CODE_PRICE_LIST";
  pSql += " , CODE_SKU";
  pSql += " , COST";
  pSql += ",CODE_PACK_UNIT";
  pSql += ",UM_ENTRY";
  pSql += " )VALUES(";
  pSql += " '" + data.row.CODE_PRICE_LIST + "'";
  pSql += " , '" + data.row.CODE_SKU + "'";
  pSql += " , '" + data.row.COST + "'";
  pSql += " , '" + data.row.CODE_PACK_UNIT + "'";
  pSql += " , " + data.row.UM_ENTRY;
  pSql += ")";
  window.gInsertsInitialRoute.push(pSql);
}

function PriceListBySKUCompleted() {
  //ToastThis("Listas de Precio por SKU Cargadas Exitosamente.");
}

//----------Fin de Listas de Precios por SKU---------//

//----------Inicio de Lista de Precios por Defecto---------//
function PriceListDefaultReceived() {
  //ToastThis("Recibiendo Lista de Precios por Defecto");
}

function PriceListDefaultNotFound(data) {
  ToastThis(
    "No se enconto Lista de Precios por Defecto para la Ruta: " + data.routeid
  );
}

function AddPriceListDefault(data) {
  try {
    localStorage.setItem("gDefaultPriceList", data.row.CODE_PRICE_LIST);
  } catch (e) {
    notify(e.message);
  }
}

function PriceListDefaultCompleted() {
  //ToastThis("Listas de Precios por Defecto Cargada Exitosamente.");
}

//----------Fin de Lista de Precios por Defecto---------//

//----------Inicio de Item History---------//

function GetItemHistoryNotFound(data) {
  ToastThis("No se enconto  Historial de Ventas para la Ruta: " + data.routeid);
}

function AddItemHistory(data) {
  var pSql = null;

  pSql = " INSERT INTO ITEM_HISTORY(";
  pSql += " DOC_TYPE";
  pSql += " , CODE_CUSTOMER";
  pSql += " , CODE_SKU";
  pSql += " , QTY";
  pSql += " , CODE_PACK_UNIT";
  pSql += " , LAST_PRICE";
  pSql += " , SALE_DATE";
  pSql += " )VALUES(";
  pSql += " '" + data.row.DOC_TYPE + "'";
  pSql += " , '" + data.row.CODE_CUSTOMER + "'";
  pSql += " , '" + data.row.CODE_SKU + "'";
  pSql += " , " + data.row.QTY;
  pSql += " , '" + data.row.CODE_PACK_UNIT + "'";
  pSql += " , " + data.row.LAST_PRICE || "NULL";
  pSql += data.row.SALE_DATE ? " , '" + data.row.SALE_DATE + "'" : " , NULL";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function GetItemHistoryCompleted() {
  //ToastThis("Historial de Ventas Cargado Exitosamente.");
}

//----------Fin de Item History---------//

//----------Inicio de Sales Order Draft---------//
function GetSalesOrderDraftNotFound() {
  ToastThis("No se econtraron Ordenes de Venta en Estado Draft");
}

function AddSalesOrderDraft(data) {
  var pSql = null;

  // pSql =
  //   "DELETE FROM SALES_ORDER_HEADER WHERE SALES_ORDER_ID = " +
  //   data.data.SALES_ORDER_ID_HH;
  // pSql += " AND CLIENT_ID = '" + data.data.CLIENT_ID + "'";
  // pSql += " AND IS_DRAFT  = " + data.data.IS_DRAFT;
  // window.gInsertsInitialRoute.push(pSql);

  // pSql =
  //   "DELETE FROM SALES_ORDER_DETAIL WHERE SALES_ORDER_ID = " +
  //   data.data.SALES_ORDER_ID_HH;
  // window.gInsertsInitialRoute.push(pSql);

  pSql = " INSERT INTO SALES_ORDER_HEADER(";
  pSql += " SALES_ORDER_ID";
  pSql += " , TERMS";
  pSql += " , POSTED_DATETIME";
  pSql += " , CLIENT_ID";
  pSql += " , POS_TERMINAL";
  pSql += " , GPS_URL";
  pSql += " , TOTAL_AMOUNT";
  pSql += " , STATUS";
  pSql += " , POSTED_BY";
  pSql += " , IMAGE_1";
  pSql += " , IMAGE_2";
  pSql += " , IMAGE_3";
  pSql += " , DEVICE_BATTERY_FACTOR";
  pSql += " , VOID_DATETIME";
  pSql += " , VOID_REASON";
  pSql += " , VOID_NOTES";
  pSql += " , VOIDED";
  pSql += " , CLOSED_ROUTE_DATETIME";
  pSql += " , IS_ACTIVE_ROUTE";
  pSql += " , GPS_EXPECTED";
  pSql += " , DELIVERY_DATE";
  pSql += ", IS_POSTED";
  pSql += " , SALES_ORDER_ID_BO";
  pSql += " , IS_PARENT";
  pSql += " , REFERENCE_ID";
  pSql += " , TIMES_PRINTED";
  pSql += " , DOC_SERIE";
  pSql += " , DOC_NUM";
  pSql += " , IS_VOID";
  pSql += " , SALES_ORDER_TYPE";
  pSql += " , DISCOUNT";
  pSql += " , IS_DRAFT";
  pSql += " , IS_UPDATED";
  pSql += " )VALUES(";
  pSql += " " + data.data.SALES_ORDER_ID; //ID del lado de la HH
  pSql += " , '" + data.data.TERMS + "'";
  pSql += " , '" + data.data.POSTED_DATETIME + "'";
  pSql += " , '" + data.data.CLIENT_ID + "'";
  pSql += " , '" + data.data.POS_TERMINAL + "'";
  pSql += " , '" + data.data.GPS_URL + "'";
  pSql += " , " + data.data.TOTAL_AMOUNT;
  pSql += " , " + data.data.STATUS;
  pSql += " , '" + data.data.POSTED_BY + "'";
  pSql += " , '" + data.data.IMAGE_1 + "'";
  pSql += " , '" + data.data.IMAGE_2 + "'";
  pSql += " , '" + data.data.IMAGE_3 + "'";
  pSql += " , " + data.data.DEVICE_BATTERY_FACTOR;
  pSql += " , '" + data.data.VOID_DATETIME + "'";
  pSql += " , '" + data.data.VOID_REASON + "'";
  pSql += " , '" + data.data.VOID_NOTES + "'";
  pSql += " , " + data.data.VOIDED;
  pSql += " , '" + data.data.CLOSED_ROUTE_DATETIME + "'";
  pSql += " , " + data.data.IS_ACTIVE_ROUTE;
  pSql += " , '" + data.data.GPS_EXPECTED + "'";
  pSql += " , '" + data.data.DELIVERY_DATE + "'";
  pSql += " , 2";
  pSql += " , '" + data.data.SALES_ORDER_ID + "'"; //ID del lado del Servidor
  pSql += " , 1";
  pSql += " , '" + data.data.REFERENCE_ID + "'";
  pSql += " , " + data.data.TIMES_PRINTED;
  pSql += " , '" + data.data.DOC_SERIE + "'";
  pSql += " , " + data.data.DOC_NUM;
  pSql += " , " + data.data.IS_VOID;
  pSql += " , '" + data.data.SALES_ORDER_TYPE + "'";
  pSql += " , " + data.data.DISCOUNT;
  pSql += " , " + data.data.IS_DRAFT;
  pSql += " , 1";
  pSql += " )";

  window.gInsertsInitialRoute.push(pSql);

  for (var i = 0; i < data.data.details.length; i++) {
    var detalle = data.data.details[i];
    pSql = " INSERT INTO SALES_ORDER_DETAIL(";
    pSql += " SALES_ORDER_ID";
    pSql += " , SKU";
    pSql += " , LINE_SEQ";
    pSql += " , QTY";
    pSql += " , PRICE";
    pSql += " , DISCOUNT";
    pSql += " , TOTAL_LINE";
    pSql += " , POSTED_DATETIME";
    pSql += " , SERIE";
    pSql += " , SERIE_2";
    pSql += " , REQUERIES_SERIE";
    pSql += " , COMBO_REFERENCE";
    pSql += " , PARENT_SEQ";
    pSql += " , IS_ACTIVE_ROUTE";
    pSql += " , IS_POSTED_VOID";
    pSql += " , DOC_SERIE";
    pSql += " , DOC_NUM";
    pSql += " , CODE_PACK_UNIT";
    pSql += " )VALUES(";
    pSql += " " + detalle.SALES_ORDER_ID;
    pSql += " , '" + detalle.SKU + "'";
    pSql += " , " + detalle.LINE_SEQ;
    pSql += " , " + detalle.QTY;
    pSql += " , " + detalle.PRICE;
    pSql += " , " + detalle.DISCOUNT;
    pSql += " , " + detalle.TOTAL_LINE;
    pSql += " , '" + detalle.POSTED_DATETIME + "'";
    pSql += " , '" + detalle.SERIE + "'";
    pSql += " , '" + detalle.SERIE_2 + "'";
    pSql += " , " + detalle.REQUERIES_SERIE;
    pSql += " , '" + detalle.COMBO_REFERENCE + "'";
    pSql += " , " + detalle.PARENT_SEQ;
    pSql += " , " + detalle.IS_ACTIVE_ROUTE;
    pSql += " , 2";
    pSql += " , '" + data.data.DOC_SERIE + "'";
    pSql += " , " + data.data.DOC_NUM;
    pSql += " , '" + detalle.CODE_PACK_UNIT + "'";
    pSql += " )";
    window.gInsertsInitialRoute.push(pSql);
  }
}

function GetSalesOrderDraftComplete(data) {
  //ToastThis("Ordenes de Venta en Estado Draft, Cargadas Exitosamente");
}
//----------Fin de Sales Order Draft---------//

//----------Inicio de Invoice Draft---------//
function AddInvoiceDraft(data) {
  // var pSql =
  //   "DELETE FROM INVOICE_HEADER WHERE INVOICE_NUM = " + data.INVOICE_ID;
  // pSql += " AND CLIENT_ID = '" + data.CLIENT_ID + "'";
  // pSql += " AND IS_DRAFT  = 1";
  // window.gInsertsInitialRoute.push(pSql);

  // pSql = "DELETE FROM INVOICE_DETAIL WHERE INVOICE_NUM = " + data.INVOICE_ID;
  // window.gInsertsInitialRoute.push(pSql);

  var pSql = "INSERT INTO INVOICE_HEADER(INVOICE_NUM";
  pSql += " ,TERMS";
  pSql += " ,POSTED_DATETIME";
  pSql += " ,CLIENT_ID";
  pSql += " ,POS_TERMINAL";
  pSql += " ,GPS";
  pSql += " ,TOTAL_AMOUNT";
  pSql += " ,STATUS";
  pSql += " ,IMG1";
  pSql += " ,IMG2";
  pSql += " ,IMG3";
  pSql += " ,IS_CREDIT_NOTE";
  pSql += " ,VOID_REASON";
  pSql += " ,VOID_NOTES";
  pSql += " ,PRINTED_COUNT"; //CDF_PRINTED_COUNT";
  pSql += " ,GPS_EXPECTED";
  pSql += " ,IS_DRAFT";
  pSql += " ) VALUES(";
  pSql += " " + data.INVOICE_ID;
  pSql += " , '" + data.TERMS + "'";
  pSql += " , '" + data.POSTED_DATETIME + "'";
  pSql += " , '" + data.CLIENT_ID + "'";
  pSql += " , '" + data.POS_TERMINAL + "'";
  pSql += " , '" + data.GPS_URL + "'";
  pSql += " , " + data.TOTAL_AMOUNT;
  pSql += " , " + data.STATUS;
  pSql += " , '" + data.IMAGE_1 + "'";
  pSql += " , '" + data.IMAGE_2 + "'";
  pSql += " , '" + data.IMAGE_3 + "'";
  pSql += " , " + data.IS_CREDIT_NOTE;
  pSql += " , '" + data.VOID_REASON + "'";
  pSql += " , '" + data.VOID_NOTES + "'";
  pSql += " , " + data.CDF_PRINTED_COUNT;
  pSql += " , '" + data.GPS_EXPECTED + "'";
  pSql += " , " + data.IS_DRAFT;
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);

  for (var i = 0; i < data.details.length; i++) {
    var detalle = data.details[i];
    pSql = "INSERT INTO INVOICE_DETAIL (INVOICE_NUM";
    pSql += ", SKU";
    pSql += ", LINE_SEQ";
    pSql += ", QTY";
    pSql += ", PRICE";
    pSql += ", DISCOUNT";
    pSql += ", TOTAL_LINE";
    pSql += ", SERIE";
    pSql += ", SERIE_2";
    pSql += ", REQUERIES_SERIE";
    pSql += ", COMBO_REFERENCE";
    pSql += ", PARENT_SEQ";
    pSql += ") VALUES(";
    pSql += " " + detalle.INVOICE_ID;
    pSql += " , '" + detalle.SKU + "'";
    pSql += " , " + detalle.LINE_SEQ;
    pSql += " , " + detalle.QTY;
    pSql += " , " + detalle.PRICE;
    pSql += " , " + detalle.DISCOUNT;
    pSql += " , " + detalle.TOTAL_LINE;
    pSql += " , '" + detalle.SERIE + "'";
    pSql += " , '" + detalle.SERIE_2 + "'";
    pSql += " , " + detalle.REQUERIES_SERIE;
    pSql += " , '" + detalle.COMBO_REFERENCE + "'";
    pSql += " , " + detalle.PARENT_SEQ;
    pSql += " )";
    window.gInsertsInitialRoute.push(pSql);
  }
}

//----------Fin de Invoice Draft---------//

//----------Inicio de reglas de calculo---------//
function CalculationRulesReceived() {
  //ToastThis("Recibiendo reglas de calculo");
}

function CalculationRulesNotFound(data) {
  ToastThis("No se encontraron reglas de calculo");
}

function AddCalculationRules(data) {
  try {
    localStorage.setItem(data.row.PARAMETER_ID, data.row.VALUE);
  } catch (e) {
    notify(e.message);
  }
}

function CalculationRulesCompleted() {
  //ToastThis("Reglas de calculo Cargada Exitosamente.");
}

//----------Fin de reglas de calculo---------//

//----------Inicio de Default Pack Unit SKU---------//
function AddDefaultPackSku(data) {
  var pSql = null;

  // pSql = "DELETE FROM PACK_UNIT_BY_SKU";
  // pSql += " WHERE CODE_SKU = '" + data.row.CODE_SKU + "'";
  // pSql += " AND PACK_UNIT = '" + data.row.CODE_PACK_UNIT + "'";
  // window.gInsertsInitialRoute.push(pSql);

  // pSql = null;

  pSql = " INSERT INTO PACK_UNIT_BY_SKU(";
  pSql += " CODE_SKU";
  pSql += " , PACK_UNIT";
  pSql += " )VALUES(";
  pSql += " '" + data.row.CODE_SKU + "'";
  pSql += " , '" + data.row.CODE_PACK_UNIT + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function NoPackUnitBySkuFound() {
  ToastThis("No se encontraron Unidades de Paquete Default para los SKU.");
}

function DefaultPackUnitBySkuCompleted() {
  //ToastThis("Unidades de Paquete Default para SKU cargadas exitosamente.");
}
//----------Fin de Default Pack Unit SKU---------//
//----------Inicio de lista de Precios por sku y unidad de medida---------//
function PriceListBySkuPackScaleReceived() {}

function PriceListBySkuPackScaleNotFound(data) {
  ToastThis("No se encontraron listas de precios por SKU y unidad de medida");
}

function AddPriceListBySkuPackScale(data) {
  var pSql = null;

  pSql = " INSERT INTO PRICE_LIST_BY_SKU_PACK_SCALE(";
  pSql += " CODE_PRICE_LIST";
  pSql += " ,CODE_SKU";
  pSql += " ,CODE_PACK_UNIT";
  pSql += " ,[PRIORITY]";
  pSql += " ,LOW_LIMIT";
  pSql += " ,HIGH_LIMIT";
  pSql += " ,PRICE";
  pSql += " )VALUES(";
  pSql += " '" + data.row.CODE_PRICE_LIST + "'";
  pSql += " ,'" + data.row.CODE_SKU + "'";
  pSql += " ,'" + data.row.CODE_PACK_UNIT + "'";
  pSql += " ," + data.row.PRIORITY;
  pSql += " ," + data.row.LOW_LIMIT;
  pSql += " ," + data.row.HIGH_LIMIT;
  pSql += " ," + data.row.PRICE;
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function PriceListBySkuPackScaleCompleted() {
  //ToastThis("Listas de precios por SKU y unidad de medida Cargadas Exitosamente.");
}
//----------Fin de lista de Precios por sku y unidad de medida---------//

//----------Inicio de parametro impresión---------//
function GetPrintUMParameterReceived() {
  //ToastThis("Recibiendo parámetro de impresión.");
}

function GetPrintUMParameterNotFound(data) {
  ToastThis("No se encontró el parámetro de impresión");
}

function AddGetPrintUMParameter(data) {
  try {
    localStorage.setItem("SALE_ORDER_PRINT_UM", data.row.Value);
  } catch (e) {
    notify(e.message);
  }
}

function GetPrintUMParameterCompleted() {
  //ToastThis("Parámetro de impresión Cargado Exitosamente.");
}

//----------Fin de reglas de calculo---------//

//----------Inicio de parametro uso de descuento maximo---------//
function GetMaxDiscountParameterReceived() {
  //ToastThis("Recibiendo parámetro uso de descuento maximo.");
}

function GetMaxDiscountParameterNotFound(data) {
  try {
    localStorage.setItem("USE_MAX_DISCOUNT", 0);
  } catch (e) {
    notify(e.message);
  }
}

function AddGetMaxDiscountParameter(data) {
  try {
    localStorage.setItem("USE_MAX_DISCOUNT", data.row.Value);
  } catch (e) {
    notify(e.message);
  }
}

function GetMaxDiscountParameterCompleted() {
  //ToastThis("Parámetro uso de descuento maximo Cargado Exitosamente.");
}

//----------Inicio de Listas de bonos por Cliente---------//
function BonusListByCustomerReceived() {
  //ToastThis("Recibiendo Listas de bonos por Cliente");
}

function BonusListByCustomerNotFound(data) {
  ToastThis(
    "No se encontraron Listas de bonos por Cliente para la Ruta: " +
      data.routeid
  );
}

function AddBonusListByCustomer(data) {
  var pSql = null;

  // pSql =
  //   "DELETE FROM BONUS_LIST_BY_CUSTOMER WHERE BONUS_LIST_ID = '" +
  //   data.row.BONUS_LIST_ID +
  //   "'";
  // pSql += " AND CODE_CUSTOMER = '" + data.row.CODE_CUSTOMER + "'";
  // window.gInsertsInitialRoute.push(pSql);

  // pSql = null;

  pSql = " INSERT INTO BONUS_LIST_BY_CUSTOMER(";
  pSql += " BONUS_LIST_ID";
  pSql += " , CODE_CUSTOMER";
  pSql += " )VALUES(";
  pSql += "" + data.row.BONUS_LIST_ID;
  pSql += " , '" + data.row.CODE_CUSTOMER + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function BonusListByCustomerCompleted() {
  //ToastThis("Listas de bonos por Cliente Cargadas Exitosamente.");
}

//----------Fin de Listas de bonos por Cliente---------//

//----------Inicio de Listas de bonos por sku---------//
function BonusListBySkuReceived() {
  //ToastThis("Recibiendo Listas de bonos por sku");
}

function BonusListBySkuNotFound(data) {
  ToastThis(
    "No se encontraron Listas de bonos por sku para la Ruta: " + data.routeid
  );
}

function AddBonusListBySku(data) {
  var pSql = null;

  // pSql =
  //   "DELETE FROM BONUS_LIST_BY_SKU WHERE BONUS_LIST_ID = '" +
  //   data.row.BONUS_LIST_ID +
  //   "'";
  // pSql += " AND CODE_SKU = '" + data.row.CODE_SKU + "'";
  // window.gInsertsInitialRoute.push(pSql);

  // pSql = null;

  pSql = " INSERT INTO BONUS_LIST_BY_SKU(";
  pSql += " BONUS_LIST_ID";
  pSql += " ,CODE_SKU";
  pSql += " ,CODE_PACK_UNIT";
  pSql += " ,LOW_LIMIT";
  pSql += " ,HIGH_LIMIT";
  pSql += " ,CODE_SKU_BONUS";
  pSql += " ,BONUS_QTY";
  pSql += " ,CODE_PACK_UNIT_BONUES";
  pSql += " ,PROMO_ID";
  pSql += " ,PROMO_NAME";
  pSql += " ,PROMO_TYPE";
  pSql += " ,FREQUENCY";
  pSql += " )VALUES(";
  pSql += "" + data.row.BONUS_LIST_ID;
  pSql += " , '" + data.row.CODE_SKU + "'";
  pSql += " , '" + data.row.CODE_PACK_UNIT + "'";
  pSql += " , " + data.row.LOW_LIMIT;
  pSql += " , " + data.row.HIGH_LIMIT;
  pSql += " , '" + data.row.CODE_SKU_BONUS + "'";
  pSql += " , " + data.row.BONUS_QTY;
  pSql += " , '" + data.row.CODE_PACK_UNIT_BONUES + "'";
  pSql += " , " + data.row.PROMO_ID;
  pSql += " , '" + data.row.PROMO_NAME + "'";
  pSql += " , '" + data.row.PROMO_TYPE + "'";
  pSql += " , '" + data.row.FREQUENCY + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function BonusListBySkuCompleted() {
  //ToastThis("Listas de bonos por sku Cargadas Exitosamente.");
}

//----------Fin de Listas de bonos por sku---------//

//----------Inicio de Listas de descuentos por Cliente---------//
function DiscountListByCustomerReceived() {
  //ToastThis("Recibiendo Listas de descuentos por Cliente");
}

function DiscountListByCustomerNotFound(data) {
  ToastThis(
    "No se encontraron Listas de descuentos por Cliente para la Ruta: " +
      data.routeid
  );
}

function AddDiscountListByCustomer(data) {
  var pSql = null;

  // pSql =
  //   "DELETE FROM DISCOUNT_LIST_BY_CUSTOMER WHERE DISCOUNT_LIST_ID = '" +
  //   data.row.DISCOUNT_LIST_ID +
  //   "'";
  // pSql += " AND CODE_CUSTOMER = '" + data.row.CODE_CUSTOMER + "'";
  // window.gInsertsInitialRoute.push(pSql);

  // pSql = null;

  pSql = " INSERT INTO DISCOUNT_LIST_BY_CUSTOMER(";
  pSql += " DISCOUNT_LIST_ID";
  pSql += " , CODE_CUSTOMER";
  pSql += " )VALUES(";
  pSql += "" + data.row.DISCOUNT_LIST_ID;
  pSql += " , '" + data.row.CODE_CUSTOMER + "'";
  pSql += " )";
  window.gInsertsInitialRoute.push(pSql);
}

function BonusListByCustomerCompleted() {
  //ToastThis("Listas de descuentos por Cliente Cargadas Exitosamente.");
}

//----------Fin de Listas de descuentos por Cliente---------//

//----------Inicio de Listas de descuentos por Monto General---------//
function DiscountListByGeneralAmountReceived() {
  //ToastThis("Recibiendo Listas de descuentos por Cliente");
}

function DiscountListByGeneralAmountNotFound(data) {
  ToastThis(
    "No se encontraron Listas de descuentos por Monto General para la Ruta: " +
      data.routeid
  );
}

function AddDiscountListByGeneralAmount(data) {
  var listaParaEjecucion = [];

  // listaParaEjecucion.push(
  //   "DELETE FROM DISCOUNT_LIST_BY_GENERAL_AMOUNT WHERE DISCOUNT_LIST_ID = '" +
  //     data.row.DISCOUNT_LIST_ID +
  //     "'"
  // );
  // listaParaEjecucion.push(" AND LOW_AMOUNT = " + data.row.LOW_AMOUNT + " ");
  // listaParaEjecucion.push(" AND HIGH_AMOUNT = " + data.row.HIGH_AMOUNT + " ");

  // window.gInsertsInitialRoute.push(listaParaEjecucion.join(""));

  // listaParaEjecucion = [];

  listaParaEjecucion.push(" INSERT INTO DISCOUNT_LIST_BY_GENERAL_AMOUNT(");
  listaParaEjecucion.push(" DISCOUNT_LIST_ID");
  listaParaEjecucion.push(" , LOW_AMOUNT");
  listaParaEjecucion.push(" , HIGH_AMOUNT");
  listaParaEjecucion.push(" , DISCOUNT");
  listaParaEjecucion.push(" , PROMO_ID");
  listaParaEjecucion.push(" , PROMO_NAME");
  listaParaEjecucion.push(" , PROMO_TYPE");
  listaParaEjecucion.push(" , FREQUENCY");
  listaParaEjecucion.push(" )VALUES(");
  listaParaEjecucion.push("" + data.row.DISCOUNT_LIST_ID);
  listaParaEjecucion.push(" , " + data.row.LOW_AMOUNT + "");
  listaParaEjecucion.push(" , " + data.row.HIGH_AMOUNT + "");
  listaParaEjecucion.push(" , " + data.row.DISCOUNT + "");
  listaParaEjecucion.push(" ," + data.row.PROMO_ID);
  listaParaEjecucion.push(" , '" + data.row.PROMO_NAME + "'");
  listaParaEjecucion.push(" , '" + data.row.PROMO_TYPE + "'");
  listaParaEjecucion.push(" , '" + data.row.FREQUENCY + "'");
  listaParaEjecucion.push(" )");

  window.gInsertsInitialRoute.push(listaParaEjecucion.join(""));
  listaParaEjecucion = null;
}

function DiscountListByGeneralAmountCompleted() {
  //ToastThis("Listas de descuentos por sku Cargadas Exitosamente.");
}

//----------Fin de Listas de descuentos por Monto General---------//

//----------Inicio de Listas de descuentos por sku---------//
function DiscountListBySkuReceived() {
  //ToastThis("Recibiendo Listas de bonos por sku");
}

function DiscountListBySkuNotFound(data) {
  ToastThis(
    "No se encontraron Listas de bonos por sku para la Ruta: " + data.routeid
  );
}

function AddDiscountListBySku(data) {
  var listaParaEjecucion = [];

  // listaParaEjecucion.push(
  //   "DELETE FROM DISCOUNT_LIST_BY_SKU WHERE DISCOUNT_LIST_ID = '" +
  //     data.row.DISCOUNT_LIST_ID +
  //     "'"
  // );
  // listaParaEjecucion.push(" AND CODE_SKU = '" + data.row.CODE_SKU + "'");
  // window.gInsertsInitialRoute.push(listaParaEjecucion.join(""));

  // listaParaEjecucion = [];

  listaParaEjecucion.push(" INSERT INTO DISCOUNT_LIST_BY_SKU(");
  listaParaEjecucion.push(" DISCOUNT_LIST_ID");
  listaParaEjecucion.push(" ,CODE_SKU");
  listaParaEjecucion.push(" ,PACK_UNIT");
  listaParaEjecucion.push(" ,LOW_LIMIT");
  listaParaEjecucion.push(" ,HIGH_LIMIT");
  listaParaEjecucion.push(" ,DISCOUNT");
  listaParaEjecucion.push(" ,PROMO_ID");
  listaParaEjecucion.push(" ,PROMO_NAME");
  listaParaEjecucion.push(" ,PROMO_TYPE");
  listaParaEjecucion.push(" ,DISCOUNT_TYPE");
  listaParaEjecucion.push(" ,FREQUENCY");
  listaParaEjecucion.push(" ,IS_UNIQUE");
  listaParaEjecucion.push(" )VALUES(");
  listaParaEjecucion.push("" + data.row.DISCOUNT_LIST_ID);
  listaParaEjecucion.push(" , '" + data.row.CODE_SKU + "'");
  listaParaEjecucion.push(" , " + data.row.PACK_UNIT);
  listaParaEjecucion.push(" , " + data.row.LOW_LIMIT);
  listaParaEjecucion.push(" , " + data.row.HIGH_LIMIT);
  listaParaEjecucion.push(" , " + data.row.DISCOUNT);
  listaParaEjecucion.push(" , " + data.row.PROMO_ID);
  listaParaEjecucion.push(" , '" + data.row.PROMO_NAME + "'");
  listaParaEjecucion.push(" , '" + data.row.PROMO_TYPE + "'");
  listaParaEjecucion.push(" , '" + data.row.DISCOUNT_TYPE + "'");
  listaParaEjecucion.push(" , '" + data.row.FREQUENCY + "'");
  listaParaEjecucion.push(" , " + data.row.IS_UNIQUE);
  listaParaEjecucion.push(" )");
  window.gInsertsInitialRoute.push(listaParaEjecucion.join(""));
  listaParaEjecucion = null;
}

function DiscountListBySkuCompleted() {
  //ToastThis("Listas de descuentos por sku Cargadas Exitosamente.");
}

//----------Fin de Listas de descuentos por sku---------//

//----------Inicio de Moneda---------//
function CurrencyReceived() {
  //ToastThis("Recibiendo Moneda");
}

function CurrencyNotFound(data) {
  ToastThis("No se encontro la moneda por defecto: " + data.routeid);
}

function AddCurrency(data) {
  localStorage.setItem("DISPLAY_SYMBOL_CURRENCY", data.row.SYMBOL_CURRENCY);
}

function CurrencyCompleted() {
  //ToastThis("Moneda Cargada Exitosamente.");
}

//----------Fin de Listas de descuentos por sku---------//

function SetMaxBonusParameter(value) {
  try {
    localStorage.setItem("USE_MAX_BONUS", value);
  } catch (e) {
    notify(e.message);
  }
}

//----------Inicio de Bonificacion por Monto General---------//

function AgregarBonoPorMontoGeneral(row) {
  var listaDeLi = [];
  listaDeLi.push(
    "INSERT INTO BONUS_LIST_BY_GENERAL_AMOUNT(BONUS_LIST_ID, LOW_LIMIT, HIGH_LIMIT, CODE_SKU_BONUS, CODE_PACK_UNIT_BONUS, BONUS_QTY, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY) VALUES"
  );
  listaDeLi.push("(" + row.BONUS_LIST_ID);
  listaDeLi.push("," + row.LOW_LIMIT);
  listaDeLi.push("," + row.HIGH_LIMIT);
  listaDeLi.push(",'" + row.CODE_SKU_BONUS + "'");
  listaDeLi.push("," + row.CODE_PACK_UNIT_BONUS);
  listaDeLi.push("," + row.BONUS_QTY);
  listaDeLi.push("," + row.PROMO_ID);
  listaDeLi.push(",'" + row.PROMO_NAME + "'");
  listaDeLi.push(",'" + row.PROMO_TYPE + "'");
  listaDeLi.push(",'" + row.FREQUENCY + "'");
  listaDeLi.push(")");
  gInsertsInitialRoute.push(listaDeLi.join(""));
  listaDeLi = null;
}
//----------Fin de Bonificacion por Monto General---------//

//----------Inicio de Historico por promo---------//

function AgregarHistoricoPorPromo(row) {
  var listaDeLi = [];
  listaDeLi.push(
    "INSERT INTO HISTORY_BY_PROMO([DOC_SERIE], [DOC_NUM], [CODE_ROUTE], [CODE_CUSTOMER], [HISTORY_DATETIME], [PROMO_ID], [PROMO_NAME], [FREQUENCY], [IS_POSTED]) VALUES"
  );
  listaDeLi.push("('" + row.DOC_SERIE + "'");
  listaDeLi.push("," + row.DOC_NUM);
  listaDeLi.push(",'" + row.CODE_ROUTE + "'");
  listaDeLi.push(",'" + row.CODE_CUSTOMER + "'");
  listaDeLi.push(",'" + row.HISTORY_DATETIME + "'");
  listaDeLi.push("," + row.PROMO_ID);
  listaDeLi.push(",'" + row.PROMO_NAME + "'");
  listaDeLi.push(",'" + row.FREQUENCY + "'");
  listaDeLi.push(", 0");
  listaDeLi.push(")");
  gInsertsInitialRoute.push(listaDeLi.join(""));
  listaDeLi = null;
}

//----------Fin de Historico por promo---------//

//----------Inicia Parametro para aplicar el descuento---------//

function SetApplyDiscountParameter(value) {
  try {
    localStorage.setItem(
      "APPLY_DISCOUNT_PERCENTAGE_AND_THEN_THE_MONETARY",
      value
    );
  } catch (e) {
    notify(e.message);
  }
}

//----------Fin Parametro para aplicar el descuento---------//

//----------Inicio de Descuentos por monto general y familia---------//

function DiscountListByGeneralAmountAndFamilyNotFound(data) {
  ToastThis(
    "No se encontraron Listas de descuentos por monto general y familia para la Ruta: " +
      data.routeid
  );
}

function AddDiscountListByGeneralAmountAndFamily(row) {
  var listLi = [];
  listLi.push(
    "INSERT INTO DISCOUNT_LIST_BY_GENERAL_AMOUNT_AND_FAMILY(DISCOUNT_LIST_ID, CODE_FAMILY, LOW_AMOUNT, HIGH_AMOUNT, DISCOUNT_TYPE, DISCOUNT, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY) VALUES"
  );
  listLi.push("(" + row.DISCOUNT_LIST_ID + "");
  listLi.push(",'" + row.CODE_FAMILY + "'");
  listLi.push("," + row.LOW_AMOUNT);
  listLi.push("," + row.HIGH_AMOUNT);
  listLi.push(",'" + row.DISCOUNT_TYPE + "'");
  listLi.push("," + row.DISCOUNT);
  listLi.push("," + row.PROMO_ID);
  listLi.push(",'" + row.PROMO_NAME + "'");
  listLi.push(",'" + row.PROMO_TYPE + "'");
  listLi.push(",'" + row.FREQUENCY + "'");
  listLi.push(")");
  gInsertsInitialRoute.push(listLi.join(""));
  listLi = null;
}

//----------Fin de Historico por monto general y familia---------//

//----------Inicio de Descuentos por familia y tipo de pago---------//

function DiscountListByFamilyAndPaymentTypeNotFound(data) {
  ToastThis(
    "No se encontraron Listas de descuentos por familia y tipo pago: " +
      data.routeid
  );
}

function AddDiscountListByFamilyAndPaymentType(row) {
  var listLi = [];
  listLi.push(
    "INSERT INTO DISCOUNT_LIST_BY_FAMILY_AND_PAYMENT_TYPE(DISCOUNT_LIST_ID, PAYMENT_TYPE, CODE_FAMILY, DISCOUNT_TYPE, DISCOUNT, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY) VALUES"
  );
  listLi.push("(" + row.DISCOUNT_LIST_ID);
  listLi.push(",'" + row.PAYMENT_TYPE + "'");
  listLi.push(",'" + row.CODE_FAMILY + "'");
  listLi.push(",'" + row.DISCOUNT_TYPE + "'");
  listLi.push("," + row.DISCOUNT);
  listLi.push("," + row.PROMO_ID);
  listLi.push(",'" + row.PROMO_NAME + "'");
  listLi.push(",'" + row.PROMO_TYPE + "'");
  listLi.push(",'" + row.FREQUENCY + "'");
  listLi.push(")");
  gInsertsInitialRoute.push(listLi.join(""));
  listLi = null;
}

//----------Fin de Descuentos por familia y tipo de pago---------//

//----------Inicio de orden para aplicar los descuentos---------//
function AddOrderForDiscountForApply(row) {
  var listLi = [];
  listLi.push(
    "INSERT INTO ORDER_FOR_DISCOUNT_FOR_APPLY([ORDER], [CODE_DISCOUNT], [DESCRIPTION]) VALUES"
  );
  listLi.push("(" + row.ORDER);
  listLi.push(",'" + row.CODE_DISCOUNT + "'");
  listLi.push(",'" + row.DESCRIPTION + "'");
  listLi.push(")");
  gInsertsInitialRoute.push(listLi.join(""));
  listLi = null;
}
//----------Fin de orden para aplicar los descuentos---------//

//----------- Inicio de Precios Especiales ----------------------//
function AddListOfSpecialPriceByScale(row) {
  var sql = [];
  sql.push("INSERT INTO SPECIAL_PRICE_LIST_BY_SCALE(");
  sql.push("[SPECIAL_PRICE_LIST_ID]");
  sql.push(",[CODE_SKU]");
  sql.push(",[PACK_UNIT]");
  sql.push(",[LOW_LIMIT]");
  sql.push(",[HIGH_LIMIT]");
  sql.push(",[SPECIAL_PRICE]");
  sql.push(",[PROMO_ID]");
  sql.push(",[PROMO_NAME]");
  sql.push(",[PROMO_TYPE]");
  sql.push(",[FREQUENCY]");
  sql.push(",[APPLY_DISCOUNT]");
  sql.push(") VALUES(");
  sql.push(row.SPECIAL_PRICE_LIST_ID);
  sql.push(",'" + row.CODE_SKU + "'");
  sql.push("," + row.PACK_UNIT);
  sql.push("," + row.LOW_LIMIT);
  sql.push("," + row.HIGH_LIMIT);
  sql.push("," + row.SPECIAL_PRICE);
  sql.push("," + row.PROMO_ID);
  sql.push(", '" + row.PROMO_NAME + "'");
  sql.push(", '" + row.PROMO_TYPE + "'");
  sql.push(", '" + row.FREQUENCY + "'");
  sql.push("," + row.APPLY_DISCOUNT);
  sql.push(")");
  gInsertsInitialRoute.push(sql.join(""));
  sql = null;
}
//----------- Fin de Precios Especiales ----------------------//

//----------- Inicia Microencuestas ----------------------//

function AddMicrosurvey(row) {
  var sql = [];
  sql.push("INSERT INTO MICROSURVEY(");
  sql.push("[ID]");
  sql.push(",[NAME]");
  sql.push(",[VALID_FROM]");
  sql.push(",[VALID_TO]");
  sql.push(",[ORDER]");
  sql.push(",[IS_REQUIRED]");
  sql.push(",[APPLY_IN]");
  sql.push(",[CHANNELS_ON_QUIZ]");
  sql.push(") VALUES(");
  sql.push(row.QUIZ_ID);
  sql.push(",'" + row.NAME_QUIZ + "'");
  sql.push(",'" + row.VALID_START_DATETIME + "'");
  sql.push(",'" + row.VALID_END_DATETIME + "'");
  sql.push("," + row.ORDER);
  sql.push("," + row.REQUIRED);
  sql.push("," + row.QUIZ_START);
  sql.push("," + row.CHANNELS_ON_QUIZ);
  sql.push(")");

  gInsertsInitialRoute.push(sql.join(""));
  sql = null;
}

function AddQuestionOfMicrosurvey(row) {
  var sql = [];
  sql.push("INSERT INTO MICROSURVEY_QUESTION([ID], [MICROSURVEY_ID]");
  sql.push(", [QUESTION], [ORDER]");
  sql.push(", [IS_REQUIRED], [TYPE_QUESTION]");
  sql.push(") VALUES(");
  sql.push(row.QUESTION_ID);
  sql.push("," + row.QUIZ_ID);
  sql.push(", '" + row.QUESTION + "'");
  sql.push("," + row.ORDER);
  sql.push("," + row.REQUIRED);
  sql.push(", '" + row.TYPE_QUESTION + "'");
  sql.push(")");

  gInsertsInitialRoute.push(sql.join(""));
  sql = null;
}

function AddAnswerOfQuestionOfMicrosurvey(row) {
  var sql = [];
  sql.push("INSERT INTO ANSWER([ID]");
  sql.push(", [QUESTION_ID], [ANSWER]");
  sql.push(") VALUES (");
  sql.push(row.ANSWER_ID);
  sql.push("," + row.QUESTION_ID);
  sql.push(", '" + row.ANSWER + "'");
  sql.push(")");

  gInsertsInitialRoute.push(sql.join(""));
  sql = null;
}

function AddChannelsOfMicrosurvey(row) {
  var sql = [];
  sql.push("INSERT INTO CHANNELS_BY_QUIZ([ID]");
  sql.push(", [QUIZ_ID], [CODE_CHANNEL]");
  sql.push(") VALUES (");
  sql.push(row.CHANNEL_BY_QUIZ_ID);
  sql.push("," + row.QUIZ_ID);
  sql.push(", '" + row.CODE_CHANNEL + "'");
  sql.push(")");

  gInsertsInitialRoute.push(sql.join(""));
  sql = null;
}

//----------- Finaliza Microencuestas ----------------------//
