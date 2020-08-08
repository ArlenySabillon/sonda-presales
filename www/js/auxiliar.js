function preparedb() {
  try {
    SONDA_DB_Session = window.openDatabase(
      "SONDA_ROUTE_DB",
      "1.0",
      "SONDA_ROUTE_DB",
      20000000
    ); //20mg

    SONDA_DB_Session.transaction(
      function (tx) {
        try {
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PRESALES_ROUTE (TASK_ID INTEGER, SCHEDULE_FOR, ASSIGNED_BY, ACCEPTED_STAMP, COMPLETED_STAMP, DOC_PARENT, EXPECTED_GPS, POSTED_GPS, TASK_COMMENTS, TASK_SEQ, TASK_ADDRESS, RELATED_CLIENT_PHONE_1, EMAIL_TO_CONFIRM, RELATED_CLIENT_CODE, RELATED_CLIENT_NAME, TASK_PRIORITY, TASK_STATUS, SYNCED, NO_PICKEDUP, NO_VISIT_REASON, IS_OFFLINE, DOC_NUM, TASK_TYPE, DOC_PRINTED, TARGET_DOC, IN_PLAN_ROUTE, CREATE_BY, PAYMENT_PRINTED, PRIMARY KEY(TASK_ID))"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS REASONS(REASON_TYPE, REASON_PRIORITY, REASON_VALUE, REASON_PROMPT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BRANCHES(CLIENT_CODE, BRANCH_CODE, BRANCH_PDE, BRANCH_NAME, BRANCH_ADDRESS, GEO_ROUTE, GPS_LAT_LON, PHONE_1, DELIVERY_EMAIL, RECOLLECT_EMAIL)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SKUS(SKU, SKU_NAME,SKU_DESCRIPTION, PRICE_LIST,SKU_PRICE, SKU_LINK, REQUERIES_SERIE, IS_KIT, ON_HAND, ROUTE_ID, IS_PARENT, PARENT_SKU, EXPOSURE, PRIORITY, QTY_RELATED, LOADED_LAST_UPDATED, CODE_FAMILY_SKU, SALES_PACK_UNIT, HANDLE_DIMENSION,OWNER,OWNER_ID)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SALES_SKUS(SKU, SKU_NAME, SKU_PRICE, SKU_LINK, REQUERIES_SERIE, IS_KIT, ON_HAND, ROUTE_ID, IS_PARENT, PARENT_SKU, EXPOSURE, PRIORITY, QTY_RELATED, LOADED_LAST_UPDATED)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS NO_VISIT(PARAM_NAME, PARAM_CAPTION)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PDE(GEO_ROUTE, CODE_GEO_ROUTE, CODE_POINT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SKUS_X_ORDER(ORDER_ID, SKU_ID, SKU_DESCRIPTION, QTY, UNIT_PRICE, TOTAL_PRICE, SOURCE_TASK, IS_OFFLINE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS ORDERS(ORDER_ID, CREATED_DATESTAMP, DELIVERY_ADDRESS, DELIVERY_BRANCH_PDE, DELIVERY_BRANCH_NAME, DELIVERY_BRANCH_ADDRESS, DELIVERY_ROUTE, SYNCHRONIZED, STATUS, SOURCE_TASK, IS_OFFLINE, SIGNATURE, TAKEN_IMAGE, TOTAL_AMOUNT, CLIENT_CODE, CLIENT_NAME)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS MANIFEST_DETAIL(INVOICE_SEQ, INVOICE_ID, GEO_ROUTE, SEQUENCY, INVOICE_STATUS, DESTINATION_CLIENTNAME, DESTINATION_ADDRESS, DELIVERY_POINT, DELIVERY_DATE, DELIVERY_BATT, DELIVERY_GPS, DELIVERY_IMAGE, SCANNED_PACKS, IS_OFFLINE, SIGNATURE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TMP_SCANNED(GUIDE_ID, PACKAGE_ID UNIQUE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SKU_SERIES(SKU, IMEI, SERIE, PHONE, ICC, STATUS, LOADED_LAST_UPDATED)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS INVOICE_HEADER(INVOICE_NUM, TERMS, POSTED_DATETIME, CLIENT_ID, CLIENT_NAME, POS_TERMINAL, GPS, TOTAL_AMOUNT, PAID_TO_DATE, ERP_INVOICE_ID, IS_POSTED, STATUS, IS_CREDIT_NOTE, VOID_REASON, VOID_NOTES, VOID_INVOICE_ID, PRINT_REQUEST, PRINTED_COUNT, AUTH_ID, SAT_SERIE, CHANGE, IMG1, IMG2, IMG3, GPS_EXPECTED, DOC_DUE_DATE, TASK_ID, IS_DRAFT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS INVOICE_DETAIL(INVOICE_NUM, SKU, SKU_NAME, QTY, PRICE, DISCOUNT, TOTAL_LINE, SERIE, SERIE_2, REQUERIES_SERIE, LINE_SEQ, IS_ACTIVE, COMBO_REFERENCE, PARENT_SEQ, EXPOSURE, PHONE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PRICE_LIST(LIST_ID, SKU, BASE_PRICE, MAX_DISCOUNT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CLIENTS(CLIENT_ID, CLIENT_NAME, CLIENT_TAX_ID, BASE_PRICELIST,ADDRESS, IS_POSTED, PHONE,CLIENT_HH_ID_OLD,CONTACT_CUSTOMER,SIGN,PHOTO,STATUS,NEW,GPS,REFERENCE,POST_DATETIME,POS_SALE_NAME,INVOICE_NAME,INVOICE_ADDRESS,NIT,CONTACT_ID,CREDIT_LIMIT,EXTRADAYS,DISCOUNT,UPDATED_FROM_BO,SYNC_ID,RGA_CODE,DISCOUNT_LIST_ID,BONUS_LIST_ID,PRICE_LIST_ID,SALES_BY_MULTIPLE_LIST_ID,PREVIUS_BALANCE,LAST_PURCHASE_DATE,LAST_PURCHASE,OWNER_ID, SERVER_POSTED_DATETIME, CLIENT_ID_OLD, DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE, [SPECIAL_PRICE_LIST_ID], CODE_CHANNEL, GROUP_NUM, OUTSTANDING_BALANCE, [DFPT_LIST_ID])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DEPOSITS(TRANS_ID, TRANS_TYPE, TRANS_DATETIME, BANK_ID, ACCOUNT_NUM, AMOUNT, GPS_URL, IS_POSTED, IMG1)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BANK_ACCOUNTS(BANK, ACCOUNT_BASE, ACCOUNT_NAME, ACCOUNT_NUMBER)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS VOID_REASONS(REASON_ID, REASON_DESCRIPTION)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS POS_FACTS(CASH_AMOUNT, CREDIT_AMOUNT, SKUS_QTY, INVOICES_QTY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS FAVS_FACTS(SKU, SKU_NAME, QTY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PAYMENT_HEADER(PAYMENT_NUM,CLIENT_ID,CLIENT_NAME,TOTAL_AMOUNT,POSTED_DATETIME,POS_TERMINAL,GPS, DOC_DATE, DEPOSIT_TO_DATE, IS_POSTED, STATUS,PAYMENT_BO_NUM, DOC_SERIE, DOC_NUM, SERVER_POSTED_DATETIME )"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PAYMENT_DETAIL(ID,PAYMENT_NUM,PAYMENT_TYPE, LINE_NUM,DOC_DATE,DOC_NUM,IMAGE,BANK_ID,ACCOUNT_NUM, INVOICE_NUM, INVOICE_SERIE, AMOUNT_PAID, DOCUMENT_NUMBER, SOURCE_DOC_TYPE, SOURCE_DOC_SERIE, SOURCE_DOC_NUM, IMAGE_1, IMAGE_2 )"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SWIFT_SEQUENCES(SEQUENCE_NAME,CURRENT_NUMBER)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CONSIGNMENT_HEADER([CONSIGNMENT_ID],[CUSTOMER_ID],[DATE_CREATE],[DATE_UPDATE],[STATUS],[POSTED_BY],[IS_POSTED],[POS_TERMINAL],[GPS_URL],[DOC_DATE],[CLOSED_ROUTE_DATETIME],[IS_ACTIVE_ROUTE],[DUE_DATE],[CONSIGNMENT_BO_NUM])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CONSIGNMENT_DETAIL([CONSIGNMENT_ID],[SKU],[LINE_NUM],[QTY],[PRICE],[DISCOUNT],[TOTAL_LINE],[POSTED_DATETIME], [PAYMENT_ID])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CLIENTS_FREQUENCY([CODE_CUSTOMER],[SUNDAY],[MONDAY],[TUESDAY],[WEDNESDAY],[THURSDAY],[FRIDAY],[SATURDAY],[FREQUENCY_WEEKS],[LAST_DATE_VISITED])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TASK(TASK_ID,TASK_TYPE,TASK_DATE,SCHEDULE_FOR,CREATED_STAMP,ASSIGEND_TO,ASSIGNED_BY,ACCEPTED_STAMP,COMPLETED_STAMP,EXPECTED_GPS,POSTED_GPS,TASK_COMMENTS,TASK_SEQ,TASK_ADDRESS,RELATED_CLIENT_CODE,RELATED_CLIENT_NAME,TASK_STATUS, IS_POSTED, TASK_BO_ID, TARGET_DOC, COMPLETED_SUCCESSFULLY, REASON, IN_PLAN_ROUTE, CREATE_BY, DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE )"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TAGS(TAG_COLOR,TAG_VALUE_TEXT,TAG_PRIORITY,TAG_COMMENTS)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TAGS_X_CUSTOMER(TAG_COLOR,CUSTOMER,IS_POSTED, CUSTOMER_SYNC, DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS RULE(EVENT_ID, NAME_EVENT, TYPE, FILTERS, ACTION, NAME_ACTION, TYPE_ACTION, ENABLED, CODE, EVENT_ORDER)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SALES_ORDER_HEADER([SALES_ORDER_ID],[TERMS],[POSTED_DATETIME],[CLIENT_ID],[POS_TERMINAL],[GPS_URL],[TOTAL_AMOUNT],[STATUS],[POSTED_BY],[IMAGE_1],[IMAGE_2],[IMAGE_3],[DEVICE_BATTERY_FACTOR],[VOID_DATETIME],[VOID_REASON],[VOID_NOTES],[VOIDED],[CLOSED_ROUTE_DATETIME],[IS_ACTIVE_ROUTE],[GPS_EXPECTED],[SALES_ORDER_ID_BO],[IS_POSTED],[DELIVERY_DATE],[TASK_ID],[IS_PARENT],[REFERENCE_ID], TIMES_PRINTED, SINC, DOC_SERIE, DOC_NUM, IS_POSTED_VOID, IS_VOID, SALES_ORDER_TYPE, DISCOUNT, IS_DRAFT, TOTAL_AMOUNT_DISPLAY, IS_UPDATED, TASK_ID_BO, COMMENT, PAYMENT_TIMES_PRINTED, PAID_TO_DATE, TO_BILL, AUTHORIZED, DETAIL_QTY, IS_POSTED_VALIDATED,DISCOUNT_BY_GENERAL_AMOUNT, SERVER_POSTED_DATETIME, DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE, GOAL_HEADER_ID)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SALES_ORDER_DETAIL([SALES_ORDER_ID],[SKU],[LINE_SEQ],[QTY],[PRICE],[DISCOUNT],[TOTAL_LINE],[POSTED_DATETIME],[SERIE],[SERIE_2],[REQUERIES_SERIE],[COMBO_REFERENCE],[PARENT_SEQ],[IS_ACTIVE_ROUTE],[SKU_NAME],IS_POSTED_VOID,IS_VOID,CODE_PACK_UNIT,TOTAL_AMOUNT_DISPLAY,DOC_SERIE,DOC_NUM,IS_BONUS,LONG,IS_SALES_BY_MULTIPLE,MULTIPLE_SALE_QTY,OWNER,OWNER_ID,DISCOUNT_TYPE, DISCOUNT_BY_FAMILY, DISCOUNT_BY_GENERAL_AMOUNT, DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE, TYPE_OF_DISCOUNT_BY_FAMILY, TYPE_OF_DISCOUNT_BY_GENERAL_AMOUNT, TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE, BASE_PRICE, CODE_FAMILY, UNIQUE_DISCOUNT_BY_SCALE_APPLIED)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SKU_PRESALE([WAREHOUSE], [SKU], SKU_NAME, [ON_HAND], [IS_COMITED], [DIFFERENCE], SKU_PRICE, CODE_FAMILY_SKU, SALES_PACK_UNIT, HANDLE_DIMENSION,OWNER,OWNER_ID)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TASK_AUX(PRESALES_ROUTE_ID, HTML)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DOCUMENT_SEQUENCE(DOC_TYPE, DOC_FROM,DOC_TO,SERIE,CURRENT_DOC, BRANCH_NAME, BRANCH_ADDRESS)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PACK_UNIT(PACK_UNIT,CODE_PACK_UNIT,DESCRIPTION_PACK_UNIT,[UM_ENTRY])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PACK_CONVERSION(PACK_CONVERSION,CODE_SKU,CODE_PACK_UNIT_FROM,CODE_PACK_UNIT_TO, CONVERSION_FACTOR, [ORDER])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS FAMILY_SKU(FAMILY_SKU, CODE_FAMILY_SKU, DESCRIPTION_FAMILY_SKU, ORDER_SKU)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PRICE_LIST_BY_CUSTOMER(CODE_PRICE_LIST,CODE_CUSTOMER)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PRICE_LIST_BY_SKU(CODE_PRICE_LIST,CODE_SKU,COST, UM_ENTRY, CODE_PACK_UNIT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS ITEM_HISTORY (DOC_TYPE, CODE_CUSTOMER, CODE_SKU, QTY, CODE_PACK_UNIT, LAST_PRICE, SALE_DATE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PACK_UNIT_BY_SKU(CODE_SKU, PACK_UNIT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PRICE_LIST_BY_SKU_PACK_SCALE([CODE_PRICE_LIST],[CODE_SKU],[CODE_PACK_UNIT],[PRIORITY],[LOW_LIMIT],[HIGH_LIMIT],[PRICE])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TAKE_INVENTORY_HEADER([TAKE_INVENTORY_ID],[POSTED_DATETIME],[CLIENT_ID],[CODE_ROUTE],[GPS_URL],[POSTED_BY],[DEVICE_BATERY_FACTOR],[IS_ACTIVE_ROUTE],[GPS_EXPECTED],[TAKE_INVENTORY_ID_BO],[DOC_SERIE],[DOC_NUM],[IS_VOID],[TASK_ID],[IS_POSTED], SERVER_POSTED_DATETIME, DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TAKE_INVENTORY_DETAIL([TAKE_INVENTORY_ID],[CODE_SKU],[QTY],[CODE_PACK_UNIT],[LAST_QTY])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CUSTOMER_CHANGE(CUSTOMER_CHANGE_ID,CODE_CUSTOMER,PHONE_CUSTOMER,ADRESS_CUSTOMER,CONTACT_CUSTOMER,GPS,POSTED_DATETIME,POSTED_BY,CODE_ROUTE,IS_POSTED,TAX_ID,INVOICE_NAME, CUSTOMER_NAME, NEW_CUSTOMER_NAME, SERVER_POSTED_DATETIME, DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE )"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS TAG_X_CUSTOMER_CHANGE([CUSTOMER_CHANGE_ID],[TAG_COLOR],[CODE_CUSTOMER], DEVICE_NETWORK_TYPE, IS_POSTED_OFFLINE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_LIST_BY_CUSTOMER(BONUS_LIST_ID,CODE_CUSTOMER)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_LIST_BY_SKU(BONUS_LIST_ID,CODE_SKU,CODE_PACK_UNIT,LOW_LIMIT,HIGH_LIMIT,CODE_SKU_BONUS,BONUS_QTY,CODE_PACK_UNIT_BONUES, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DISCOUNT_LIST_BY_CUSTOMER(DISCOUNT_LIST_ID,CODE_CUSTOMER)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DISCOUNT_LIST_BY_SKU(DISCOUNT_LIST_ID, CODE_SKU, PACK_UNIT, LOW_LIMIT, HIGH_LIMIT, DISCOUNT, PROMO_ID, PROMO_NAME, PROMO_TYPE, DISCOUNT_TYPE, FREQUENCY, IS_UNIQUE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_LIST_BY_SKU_MULTIPLE(BONUS_LIST_ID,CODE_SKU,CODE_PACK_UNIT,MULTIPLE,CODE_SKU_BONUS,CODE_PACK_UNIT_BONUES,BONUS_QTY, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SKU_SALES_BY_MULTIPLE_LIST_BY_SKU(SALES_BY_MULTIPLE_LIST_ID, CODE_SKU, CODE_PACK_UNIT, MULTIPLE, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_LIST_BY_COMBO(BONUS_LIST_ID,COMBO_ID,BONUS_TYPE,BONUS_SUB_TYPE,IS_BONUS_BY_LOW_PURCHASE,IS_BONUS_BY_COMBO,LOW_QTY, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_LIST_BY_COMBO_SKU(BONUS_LIST_ID,COMBO_ID,CODE_SKU,CODE_PACK_UNIT,QTY,IS_MULTIPLE)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS COMBO(COMBO_ID,NAME_COMBO,DESCRIPTION_COMBO)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SKU_BY_COMBO(COMBO_ID,CODE_SKU,CODE_PACK_UNIT,QTY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DISCOUNT_LIST_BY_GENERAL_AMOUNT(DISCOUNT_LIST_ID, LOW_AMOUNT, HIGH_AMOUNT, DISCOUNT, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS COMPANY(COMPANY_ID,COMPANY_NAME)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_DRAFT(id,codeRoute,clientId,typeBonus,sku,codePackUnit,skuName,skuDescription,qty,parentCodeSku,parentCodePackUnit,skuPrice,discount,multipleSaleQty,isSaleByMultiple,owner,ownerId, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS BONUS_LIST_BY_GENERAL_AMOUNT(BONUS_LIST_ID, LOW_LIMIT, HIGH_LIMIT, CODE_SKU_BONUS, CODE_PACK_UNIT_BONUS, BONUS_QTY, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS HISTORY_BY_PROMO([DOC_SERIE], [DOC_NUM], [CODE_ROUTE], [CODE_CUSTOMER], [HISTORY_DATETIME], [PROMO_ID], [PROMO_NAME], [FREQUENCY], [IS_POSTED], [SERVER_POSTED_DATETIME], [DEVICE_NETWORK_TYPE], [IS_POSTED_OFFLINE], [SALES_ORDER_DOCUMENT_NUMBER], [SALES_ORDER_DOCUMENT_SERIES] )"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DISCOUNT_LIST_BY_GENERAL_AMOUNT_AND_FAMILY(DISCOUNT_LIST_ID, CODE_FAMILY, LOW_AMOUNT, HIGH_AMOUNT, DISCOUNT_TYPE, DISCOUNT, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS DISCOUNT_LIST_BY_FAMILY_AND_PAYMENT_TYPE(DISCOUNT_LIST_ID, PAYMENT_TYPE, CODE_FAMILY, DISCOUNT_TYPE, DISCOUNT, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS PRESALE_STATISTICS(GOAL_HEADER_ID, TEAM_NAME, GOAL_NAME, RANKING, GOAL_AMOUNT, ACCUMULATED_AMOUNT, GOAL_PERCENTAGE_COVERED, REMAINING_DAYS, GOAL_AMOUNT_OF_DAY)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS ORDER_FOR_DISCOUNT_FOR_APPLY([ORDER], [CODE_DISCOUNT], [DESCRIPTION])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS SPECIAL_PRICE_LIST_BY_SCALE([SPECIAL_PRICE_LIST_ID],[CODE_SKU],[PACK_UNIT],[LOW_LIMIT],[HIGH_LIMIT],[SPECIAL_PRICE],[PROMO_ID],[PROMO_NAME],[PROMO_TYPE],[FREQUENCY],[APPLY_DISCOUNT])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS MICROSURVEY([ID], [NAME], [VALID_FROM], [VALID_TO], [ORDER], [IS_REQUIRED], [APPLY_IN], [CHANNELS_ON_QUIZ])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS MICROSURVEY_QUESTION([ID], [MICROSURVEY_ID], [QUESTION], [ORDER], [IS_REQUIRED], [TYPE_QUESTION])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS ANSWER([ID], [QUESTION_ID], [ANSWER])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CUSTOMER_SURVEY([DOC_SERIE], [DOC_NUM], [CODE_ROUTE], [CODE_CUSTOMER], [IS_POSTED], [CREATED_DATE], [POSTED_DATE], [GPS], [CUSTOMER_GPS], [SURVEY_ID], [SURVEY_NAME], [QUESTION], [TYPE_QUESTION], [ANSWER])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CUSTOMER_SURVEY_HEADER([DOC_SERIE], [DOC_NUM], [CODE_CUSTOMER], [IS_POSTED], [SURVEY_ID], [IS_FROM_DRAFT])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS CHANNELS_BY_QUIZ([ID], [QUIZ_ID], [CODE_CHANNEL])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_BY_CUSTOMER(ID,INVOICE_ID,DOC_ENTRY,CODE_CUSTOMER,CREATED_DATE,DUE_DATE,TOTAL_AMOUNT,PENDING_TO_PAID, IS_EXPIRED )"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_PAYMENT_HEADER(ID,CODE_CUSTOMER,DOC_SERIE,DOC_NUM,CREATED_DATE,POSTED_DATE,CODE_ROUTE,LOGIN_ID,PAYMENT_AMOUNT,IS_POSTED, COMMENT, PAYMENT_APPLIED_TO)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_PAYMENT_DETAIL(ID,PAYMENT_HEADER_ID,INVOICE_ID,DOC_ENTRY,DOC_SERIE,DOC_NUM,PAYED_AMOUNT, AMOUNT_TO_DATE, PENDING_AMOUNT)"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS OVERDUE_INVOICE_PAYMENT_TYPE_DETAIL([PAYMENT_TYPE_ID],[PAYMENT_HEADER_ID],[PAYMENT_TYPE],[FRONT_IMAGE],[BACK_IMAGE],[DOCUMENT_NUMBER],[BANK_ACCOUNT],[BANK_NAME],[AMOUNT],[DOC_SERIE],[DOC_NUM])"
          );

          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS IMAGE_BY_SKU([ID], [CODE_SKU], [IMAGE1], [IMAGE2], [IMAGE3], [IMAGE4], [IMAGE5])"
          );

          AgregarColumnas();
        } catch (e) {
          notify("preparedb:" + e.message);
        }
      },
      function (
        err //Fail
      ) {
        //console.clear();
        notify("preparedb: " + err.message);
      },
      function () //Success
      {
        my_dialog("", "", "close");
      }
    );
  } catch (e) {
    notify("preparedb.catch.2:" + e.message);
  }
}

function get_guide_options(pGuide) {
  try {
    var config_options = {
      title: "Guia " + pGuide,

      items: [
        { text: "Anular Pedio", value: "DELETE_GUIDE" },
        { text: "Ver Detalle", value: "GUIDE_DETAIL" }
      ],
      doneButtonLabel: "Ok",
      cancelButtonLabel: "Cancelar"
    };

    window.plugins.listpicker.showPicker(config_options, function (item) {
      switch (item) {
        case "DELETE_GUIDE":
          navigator.notification.confirm(
            "Confirma anular pedido ?", // message
            function (buttonIndex) {
              if (buttonIndex === 2) {
                SONDA_DB_Session.transaction(
                  function (tx) {
                    pSQL =
                      "DELETE FROM SKUS_X_ORDER WHERE ORDER_ID = '" +
                      pGuide +
                      "'";
                    tx.executeSql(pSQL);

                    pSQL =
                      "DELETE FROM ORDERS WHERE ORDER_ID = '" + pGuide + "'";
                    tx.executeSql(pSQL);
                  },
                  function (err) {
                    my_dialog("", "", "close");
                    notify("get_guide_options.catch:" + err.message);
                  },
                  function () {
                    RefreshMyGuidesOnTask();
                  }
                );
              }
            }, // callback to invoke with index of button pressed
            "Sonda® Ruta " + SondaVersion, // title
            "No,Si" // buttonLabels
          );

          break;
        case "TEST_RECIBO":
          printtest(pPrinterAddress, "RECIBO", 0, ptotal);
          break;
        default:
          break;
      }
    });
  } catch (e) {
    notify(e.message);
  }
}

function scanpackage() {
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      $("#lblScannedData").text(result.text);
      //ojo
      var n = result.text.indexOf("-");
      var pScannedGuide = "";
      var pError = true;

      try {
        pScannedGuide = result.text.slice(0, n);
      } catch (e) {
        notify(e.message);
      }

      if (parseInt(pScannedGuide) === parseInt(gGuideToDeliver)) {
        SONDA_DB_Session.transaction(
          function (tx) {
            pSQL =
              "INSERT INTO TMP_SCANNED(GUIDE_ID, PACKAGE_ID) VALUES('" +
              gGuideToDeliver +
              "','" +
              result.text +
              "')";
            tx.executeSql(pSQL);

            pSQL =
              "UPDATE MANIFEST_DETAIL SET SCANNED_PACKS = SCANNED_PACKS + 1 WHERE GUIDE_ID= '" +
              gGuideToDeliver +
              "'";
            tx.executeSql(pSQL);
          },
          function (tx, err) {
            notify("ERROR, " + result.text + " Paquete ya fue escaneado");
            pError = true;
          },
          function () {
            pError = false;
            simulate_scanpackage();
          }
        );
      } else {
        notify(
          "ERROR, Paquete " +
          result.text +
          ", No corresponde a la guia en curso"
        );
      }
    },
    function (error) {
      alert("Scanning failed: " + error);
    }
  );
}

function RefreshScannedInfo() {
  SONDA_DB_Session.transaction(
    function (tx) {
      var pSQL =
        "SELECT * FROM MANIFEST_DETAIL WHERE GUIDE_ID = '" +
        gGuideToDeliver +
        "'";
      console.log(pSQL);
      tx.executeSql(
        pSQL,
        [],
        function (tx, results) {
          gGuideScannedPacks = results.rows.item(0).SCANNED_PACKS;
          $("#lblScannedPacks").text(gGuideScannedPacks);

          var pPacks = results.rows.item(0).PACKAGES;
          $("#lblGuidePacks").text(pPacks);

          var pLabels = results.rows.item(0).LABELS;
          $("#lblGuideLabels").text(pLabels);

          var pPacksPending = parseInt(pPacks) - parseInt(gGuideScannedPacks);
          $("#lblPendingPacks").text(pPacksPending);

          if (pPacksPending <= 0) {
            $("#btnDeliveryPhotoSignature").removeClass("ui-disabled");
            /*
                        $("#btnDeliveryPrint").removeClass("ui-disabled");
                        $("#btnDeliveryFinish").removeClass("ui-disabled");
                        */
          }
        },
        function (err) {
          my_dialog("", "", "close");
          if (err.code !== 0) {
            alert("(RefreshScannedInfo)Error processing SQL: " + err.code);
          }
        }
      );
    },
    function (err) {
      if (err.code !== 0) {
        alert("(tx.func.04)Error processing SQL: " + err.code);
      }
    }
  );
}

function get_order_detail(guide, div_id) {
  var xlistviewid = "list_" + div_id;
  var vLI1 = "";

  try {
    SONDA_DB_Session.transaction(
      function (tx) {
        var pSQL1 =
          "SELECT * FROM SKUS_X_ORDER WHERE GUIDE_ID = '" + guide + "'";
        //var pSQL1 = "SELECT * FROM PACKAGES_X_GUIDE";
        console.log("detalle: " + pSQL1 + " guide:" + guide);
        tx.executeSql(
          pSQL1,
          [],
          function (tx, results1) {
            var gDetail = [];

            for (j = 0; j <= results1.rows.length - 1; j++) {
              //UM_CODE, UM_DESCRIPTION, QTY,
              console.log(results1.rows.item(j).GUIDE_ID);

              if (parseInt(results1.rows.item(j).GROUPED_BY) >= 2) {
                gDetail.push({
                  text:
                    results1.rows.item(j).QTY +
                    " " +
                    results1.rows.item(j).UM_DESCRIPTION +
                    " Agrupado en " +
                    results1.rows.item(j).GROUPED_BY,
                  value: results1.rows.item(j).UM_CODE
                });
              } else {
                gDetail.push({
                  text:
                    results1.rows.item(j).QTY +
                    " " +
                    results1.rows.item(j).UM_DESCRIPTION,
                  value: results1.rows.item(j).UM_CODE
                });
              }

              var config_options = {
                title: "Detalle de la guia " + guide,
                items: gDetail,
                doneButtonLabel: "Ok",
                cancelButtonLabel: "Cancelar"
              };

              window.plugins.listpicker.showPicker(config_options, function (
                item
              ) { });
            }
          },
          function (err) {
            my_dialog("", "", "close");
            if (err.code !== 0) {
              alert("(guide_detail)Error processing SQL: " + err.code);
            }
          }
        );
      },
      function (err) {
        if (err.code !== 0) {
          alert("(tx.func.04)Error processing SQL: " + err.code);
        }
      }
    );
  } catch (e) {
    return e.message;
  }
}

function CheckforOffline() {
  //check for pickup
  SONDA_DB_Session.transaction(
    function (tx) {
      pSQL = "SELECT * FROM ORDERS WHERE IS_OFFLINE = 1 AND STATUS = 'SIGNED'";

      tx.executeSql(
        pSQL,
        [],
        function (tx, results) {
          for (i = 0; i <= results.rows.length - 1; i++) {
            gtaskid = results.rows.item(i).SOURCE_TASK;
            ProcessPickupTask(1);
          }
        },
        function (err) {
          my_dialog("", "", "close");
          alert("ShowHideOptions.0.Error processing SQL: " + err.message);
        }
      );
    },
    function (err) {
      alert("CheckforOffline.1.Error processing SQL: " + err.message);
    }
  );

  //check for delivery
  SONDA_DB_Session.transaction(
    function (tx) {
      pSQL =
        "SELECT * FROM MANIFEST_DETAIL WHERE IS_OFFLINE = 1 AND INVOICE_STATUS = 'COMPLETED'";

      tx.executeSql(
        pSQL,
        [],
        function (tx, results) {
          if (results.rows.length >= 1) {
            for (var i = 0; i <= results.rows.length - 1; i++) {
              window.gtaskid = results.rows(i).SOURCE_TASK;
              ProcessPickupTask(1);
            }
          }
        },
        function (err) {
          my_dialog("", "", "close");
          alert("ShowHideOptions.0.Error processing SQL: " + err.message);
        }
      );
    },
    function (err) {
      my_dialog("", "", "close");
      alert("ShowHideOptions.1.Error processing SQL: " + err.message);
    }
  );
}

function create_task_offplan() {
  try {
    SONDA_DB_Session.transaction(
      function (tx) {
        var xdate = getDateTime();
        var pInputedAdress = "";
        var pInputedPhone = "";

        var pInputedName = "";

        pInputedAdress = $("#txtClientAddr_offplan").val();
        gInputedAdress_formated = pInputedAdress.replace("'", "").toUpperCase();

        //pInputedName = $("#txtClientAddr_offplan").val();
        pInputedName = $("#txtClientName_offplan").val();
        gInputedName_formated = pInputedName.replace("'", "").toUpperCase();

        pInputedPhone = $("#txtClientPhone_offplan").val();

        try {
          gTaskOffPlanID = localStorage.getItem("gTaskOffPlanID");
        } catch (e) {
          localStorage.setItem("gTaskOffPlanID", 99999);
        }

        if (isNaN(gTaskOffPlanID)) {
          gTaskOffPlanID = 99999;
          localStorage.setItem("gTaskOffPlanID", 99999);
        } else {
          gTaskOffPlanID = localStorage.getItem("gTaskOffPlanID");
        }

        var pSQL =
          "INSERT INTO PRESALES_ROUTE(TASK_ID, SCHEDULE_FOR, ASSIGNED_BY, DOC_PARENT, EXPECTED_GPS, ";
        pSQL +=
          "TASK_COMMENTS, TASK_SEQ, TASK_ADDRESS, RELATED_CLIENT_PHONE_1, EMAIL_TO_CONFIRM, RELATED_CLIENT_CODE, RELATED_CLIENT_NAME, TASK_PRIORITY, TASK_STATUS, SYNCED, IS_OFFLINE)";
        pSQL +=
          "VALUES(" + gTaskOffPlanID + ",'" + xdate + "','" + xdate + "',0";
        pSQL +=
          ", '" +
          gCurrentGPS +
          "','TAREA CREADA FUERA DEL PLAN DE RUTA',1,'" +
          gInputedAdress_formated +
          "'";
        pSQL +=
          ", '" +
          pInputedPhone +
          "','','999999','" +
          gInputedName_formated +
          "',1,'ASSIGNED', 1, 1)";
        console.log(pSQL);

        tx.executeSql(pSQL);

        gTaskOffPlanID += 1;
        localStorage.setItem("gTaskOffPlanID", gTaskOffPlanID);
      },
      function (tx, err) {
        my_dialog("", "", "close");
      },
      function () {
        gTaskOffPlanID += 1;
        localStorage.setItem("gTaskOffPlanID", gTaskOffPlanID);

        $("#txtClientAddr_offplan").val("");
        $("#txtClientAddr_offplan").val("");
        $("#txtClientComments_offplan").val("");

        $.mobile.changePage("#pickupplan_page", {
          transition: "flow",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
      }
    );
  } catch (e) {
    notify("task_offplan.catch:" + e.message);
  }
}

function AgregarColumnas() {

}
