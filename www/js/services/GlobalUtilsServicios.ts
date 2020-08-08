﻿class GlobalUtilsServicio {
  estadisticaServicio = new EstadisticaDeVentaServicio();
  cuentaCorrienteServicio = new CuentaCorrienteServicio();
  imagenDeSkuServicio = new ImagenDeSkuServicio();

  delegarSockets(socketIo: SocketIOClient.Socket) {
    try {
      // Inicia Socket Login
      socketIo.on("welcome_to_sonda", data => {
        try {
          my_dialog("", "", "close");
          gCurrentRoute = data.routeid;
          gLastLogin = pUserID;
          gLoggedUser = pUserID;
          gUserCode = data.usercode;
          gCurrentRoute = data.routeid;
          gDefaultWhs = data.default_warehouse;
          gPreSaleWhs = data.presale_warehouse;
          localStorage.setItem("NAME_ENTERPRISE", data.name_enterprise);
          $("#loginimg").attr("src", data.loginimage);

          localStorage.setItem("LOGIN_IMAGE", data.loginimage);
          localStorage.setItem("LAST_LOGIN_NAME", data.user_name);
          localStorage.setItem("LAST_LOGIN_ROUTE", gCurrentRoute);

          localStorage.setItem("dbuser", data.dbuser);
          localStorage.setItem("dbuserpass", data.dbuserpass);
          localStorage.setItem("ULTIMA_CONSULTA_DE_INVENTARIO", "...");

          gdbuser = data.dbuser;
          gdbuserpass = data.dbuserpass;

          $("#lblnameuser").text(data.user_name);
          $("#lblnameuser1").text(data.user_name);
          UpdateLoginInfo("set");
          if (gIsOnline === 1) {
            socketIo.emit("getmyrouteplan", {
              loginid: gLastLogin,
              dbuser: gdbuser,
              dbuserpass: gdbuserpass
            });
            gTimeout = setTimeout(() => {
              socketIo.emit("get_all_novisit", {
                dbuser: gdbuser,
                dbuserpass: gdbuserpass
              });
            }, 1000);
            clearTimeout(gTimeout);
          }

          let pPrinterAddress = "";
          pPrinterAddress = localStorage.getItem("PRINTER_RECEIPT");

          $(".printerclass").buttonMarkup({ icon: "delete" });

          bluetoothSerial.connect(
            pPrinterAddress,
            () => {
              $(".printerclass").buttonMarkup({ icon: "check" });
            },
            () => {
              $(".printerclass").buttonMarkup({ icon: "delete" });
            }
          );
          clearTimeout(gTimeout);

          const estadoDeLaRuta = localStorage.getItem("POS_STATUS");
          if (estadoDeLaRuta !== "OPEN") {
            MostrarPaginaDeInicioDeRuta();
          } else {
            $.mobile.changePage("#menu_page", {
              transition: "flow",
              reverse: true,
              showLoadMsg: false
            });
          }
        } catch (e) {
          notify(`EROOR: ${e.message}`);
        }
      });

      socketIo.on("device_autenthication_failed", data => {
        notify(data.message);
      });
      //Finaliza Socket Login

      //Inicia Socket BroadCast
      socketIo.on("broadcast_receive", data => {
        navigator.geolocation.getCurrentPosition(
          position => {
            gCurrentGPS =
              position.coords.latitude + "," + position.coords.longitude;
            $(".gpsclass").text(gCurrentGPS);
            socketIo.emit("broadcast_response", {
              sockeit: socketIo.id,
              gps: gCurrentGPS,
              "message:": "OK",
              routeid: gCurrentRoute,
              loginid: gLastLogin
            });
          },
          error => {
            socketIo.emit("broadcast_response", {
              sockeit: socketIo.id,
              gps: "0,0",
              "message:": error,
              routeid: gCurrentRoute,
              loginid: gLastLogin
            });
          },
          { timeout: 30000, enableHighAccuracy: true }
        );
      });
      //Finaliza Socket Broadcast

      //Inicia Socket PickUp

      socketIo.on("add_to_getmyrouteplan", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var xdate = getDateTime();

            var pSQL =
              "DELETE FROM PRESALES_ROUTE WHERE TASK_ID = '" +
              data.row.TASK_ID +
              "'";

            tx.executeSql(pSQL);

            pSQL =
              "INSERT INTO PRESALES_ROUTE(TASK_ID, SCHEDULE_FOR, ASSIGNED_BY, DOC_PARENT, EXPECTED_GPS, ";
            pSQL +=
              "TASK_COMMENTS, TASK_SEQ, TASK_ADDRESS, RELATED_CLIENT_PHONE_1, EMAIL_TO_CONFIRM, RELATED_CLIENT_CODE, RELATED_CLIENT_NAME, TASK_PRIORITY, TASK_STATUS, SYNCED, IS_OFFLINE, TASK_TYPE, DOC_NUM, IN_PLAN_ROUTE, CREATE_BY)";
            pSQL += `VALUES(${data.row.TASK_ID},'${data.row.SCHEDULE_FOR}','${
              data.row.SCHEDULE_FOR
              }',0`;
            pSQL += `, '${data.row.EXPECTED_GPS}','${data.row.TASK_COMMENTS}',${
              data.row.TASK_SEQ
              },'${data.row.TASK_ADDRESS}'`;
            pSQL += `, '${data.row.CUSTOMER_PHONE}','${
              data.row.EMAIL_TO_CONFIRM
              }','${data.row.CUSTOMER_CODE}','${data.row.CUSTOMER_NAME}',${
              data.row.TASK_PRIORITY
              },'${data.row.TASK_STATUS}', 1, 1, '${data.row.TASK_TYPE}',${
              data.row.PICKING_NUMBER
              },1, 'BY_CALENDAR')`;
            tx.executeSql(pSQL);

            var sql =
              "INSERT INTO CLIENTS(CLIENT_ID, CLIENT_NAME, CLIENT_TAX_ID, BASE_PRICELIST, IS_POSTED, PHONE,CLIENT_HH_ID_OLD,STATUS,NEW, CREDIT_LIMIT,EXTRADAYS) ";
            sql += ` SELECT '${data.row.CUSTOMER_CODE}','${
              data.row.CUSTOMER_NAME
              }','C.F.',0,-1,0,'${data.row.CUSTOMER_CODE}','NEW',0,999999,30 `;
            sql += ` WHERE NOT EXISTS(SELECT 1 FROM CLIENTS WHERE CLIENT_ID= '${
              data.row.CUSTOMER_CODE
              }')`;
            tx.executeSql(sql);

            pSQL = ObtenerInsertTareaGU(
              data.row,
              data.row.TASK_ID,
              data.row.TASK_TYPE
            );

            tx.executeSql(pSQL);
            var uiTarea = $(`#TAREA-${data.row.TASK_ID}`);

            if (uiTarea[0] === undefined || uiTarea[0] === null) {
              actualizarListadoDeTareas(
                data.row.TASK_ID,
                data.row.TASK_TYPE,
                data.row.TASK_STATUS,
                data.row.CUSTOMER_CODE,
                data.row.CUSTOMER_NAME,
                data.row.TASK_ADDRESS,
                0,
                "",
                data.row.RGA_CODE
              );
            }
            uiTarea = null;
          },
          err => {
            my_dialog("", "", "close");
          },
          () => {
            socketIo.emit("task_has_been_received", {
              TASK_ID: data.row.TASK_ID
            });
          }
        );
      });

      socketIo.on("you_got_a_task", data => {
        if (data.ASSIGNED_TO === gLastLogin.toUpperCase()) {
          SONDA_DB_Session.transaction(
            tx => {
              var xdate = getDateTime();

              var pSQL =
                "INSERT INTO PRESALES_ROUTE(TASK_ID, SCHEDULE_FOR, ASSIGNED_BY, DOC_PARENT, EXPECTED_GPS, ";
              pSQL +=
                "TASK_COMMENTS, TASK_SEQ, TASK_ADDRESS, RELATED_CLIENT_PHONE_1, EMAIL_TO_CONFIRM, RELATED_CLIENT_CODE, RELATED_CLIENT_NAME, TASK_PRIORITY, TASK_STATUS, SYNCED, IS_OFFLINE, DOC_NUM, TASK_TYPE)";
              pSQL += "VALUES(" + data.TASK_ID + ",'" + xdate + "','',''";
              pSQL +=
                ", '" +
                data.EXPECTED_GPS +
                "','" +
                data.TASK_COMMENTS +
                "'," +
                data.TASK_SEQ +
                ",'" +
                data.TASK_ADDRESS +
                "'";
              pSQL += ", '" + data.RELATED_CLIENT_PHONE_1 + "','";
              pSQL +=
                data.EMAIL_TO_CONFIRM +
                "','" +
                data.RELATED_CLIENT_CODE +
                "','";
              pSQL +=
                data.RELATED_CLIENT_NAME +
                "'," +
                data.TASK_SEQ +
                ",'ASSIGNED', 1, 1, " +
                data.PICKING_NUMBER +
                "','" +
                data.TASK_TYPE +
                ")";

              tx.executeSql(pSQL);
            },
            () => {
              my_dialog("", "", "close");
            },
            () => {
              socketIo.emit("task_has_been_received", {
                TASK_ID: data.TASK_ID
              });

              ToastThis("Tiene una nueva tarea!");
              navigator.vibrate([500, 1000, 500, 1000, 3000]);
              // cordova.plugins.notification.badge.set(gNewTask);
              // gNewTask += 1;
            }
          );
        }
      });
      socketIo.on("task_accepted_completed", data => {
        SONDA_DB_Session.transaction(
          tx => {
            let pSQL =
              "UPDATE PICKUP_ROUTE SET SYNCED = 1 WHERE TASK_ID = " +
              data.taskid;

            tx.executeSql(pSQL);
            pSQL = null;
          },
          (err: SqlError) => {
            my_dialog("", "", "close");
          }
        );
        RefreshMyRoutePlan();
      });

      socketIo.on("getmyrouteplan_completed", data => {
        // gTimeout = setTimeout(socketIo.emit("get_all_skus", {'dbuser':gdbuser, 'dbuserpass':gdbuserpass}), 500);
        // clearTimeout(gTimeout);
      });

      socketIo.on("finishroute_completed", data => {
        my_dialog("", "", "close");

        SONDA_DB_Session.transaction(
          tx => {
            let pSQL = "DELETE FROM PICKUP_ROUTE";
            tx.executeSql(pSQL);

            pSQL = "DELETE FROM GUIDES";
            tx.executeSql(pSQL);

            pSQL = "DELETE FROM PACKAGES_X_GUIDE";
            tx.executeSql(pSQL);

            localStorage.setItem("LOGIN_STATUS", "CLOSED");
            // navigator.app.exitApp();
          },
          err => {
            my_dialog("", "", "close");
            notify("finishroute_completed.add.row:" + err);
          }
        );
      });

      socketIo.on("get_all_branches_completed", data => {
        gTimeout = setTimeout(() => {
          socketIo.emit("get_all_novisit", {
            dbuser: gdbuser,
            dbuserpass: gdbuserpass
          });
        }, 500);
      });
      socketIo.on("get_all_branches_received", data => {
        // delete table
        SONDA_DB_Session.transaction(
          tx => {
            let pSQL = "DELETE FROM BRANCHES";

            tx.executeSql(pSQL);
          },
          err => {
            my_dialog("", "", "close");
            notify("branches.add.row:" + err);
          }
        );
      });
      socketIo.on("post_order.posted", data => {
        SONDA_DB_Session.transaction(
          tx => {
            let pSQL =
              "UPDATE PRESALES_ROUTE SET IS_OFFLINE = 0 WHERE TASK_ID = " +
              data.taskid;

            tx.executeSql(pSQL);

            // ojo
            pSQL =
              "UPDATE SKUS_X_ORDER SET IS_OFFLINE = 0 WHERE SOURCE_TASK = " +
              data.taskid;

            tx.executeSql(pSQL);

            pSQL =
              "UPDATE ORDERS SET IS_OFFLINE = 0 WHERE SOURCE_TASK = " +
              data.taskid;

            tx.executeSql(pSQL);
          },
          err => {
            my_dialog("", "", "close");
            notify("branches.add.row:" + err);
          }
        );
      });

      socketIo.on("add_to_get_all_branches", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var xdate = getDateTime();

            let pSQL =
              "INSERT INTO BRANCHES(CLIENT_CODE, BRANCH_CODE, BRANCH_PDE, BRANCH_NAME, BRANCH_ADDRESS, GEO_ROUTE, GPS_LAT_LON, PHONE_1, DELIVERY_EMAIL, RECOLLECT_EMAIL)";
            pSQL +=
              " VALUES('" +
              data.row.CUSTOMER_CODE +
              "','" +
              data.row.BRANCH_CODE +
              "','" +
              data.row.BRANCH_PDE +
              "','" +
              data.row.BRANCH_NAME +
              "','" +
              data.row.BRANCH_ADDRESS +
              "','" +
              data.row.GEO_ROUTE;
            pSQL +=
              "', '" +
              data.row.GPS_LAT_LON +
              "','" +
              data.row.PHONE +
              "','" +
              data.row.DELIVERY_EMAIL +
              "','" +
              data.row.RECOLLECT_EMAIL +
              "')";

            tx.executeSql(pSQL);
          },
          err => {
            my_dialog("", "", "close");
            notify("branches.add.row:" + err);
          }
        );
      });

      socketIo.on("add_to_pde", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var pSQL = "INSERT INTO PDE(GEO_ROUTE, CODE_GEO_ROUTE, CODE_POINT)";
            pSQL +=
              " VALUES('" +
              data.row.GEO_ROUTE +
              "','" +
              data.row.CODE_GEO_ROUTE +
              "','" +
              data.row.CODE_POINT +
              "')";

            tx.executeSql(pSQL);
          },
          err => {
            my_dialog("", "", "close");
            notify("add_to_pde.add.row:" + err);
          }
        );
      });

      socketIo.on("getpde_completed", data => {
        if (data.rowcount === 0) {
          notify("ERROR, no hay PDE definidos en la ruta. \n Verifique");
        }
      });

      socketIo.on("manifest_already_open", data => {
        notify(
          `ERROR, Manifiesto ${data.manifestid}, Ya fue aceptado.\n Verifique.`
        );
        clearup_manifiesto();
      });

      socketIo.on("manifest_accepted_ok", data => {
        try {
          my_dialog("", "", "close");
          clearup_manifiesto();

          localStorage.setItem("MANIFEST_PRESENT", "1");
          localStorage.setItem("MANIFEST_SCANNED", gManifestID);
        } catch (e) {
          notify(e.message);
        }
      });

      socketIo.on("delivery_image_has_been_saved", data => {
        try {
          ToastThis("Grabado en el server");
        } catch (e) {
          notify("delivery_signature_has_been_saved " + e.message);
        }
      });

      socketIo.on("delivery_signature_has_been_saved", data => {
        try {
          socketIo.emit("process_delivery_image", {
            image: gpicture,
            guide_id: gGuideToDeliver
          });
        } catch (e) {
          notify("delivery_signature_has_been_saved " + e.message);
        }
      });

      socketIo.on("guide_delivered_returned", data => {
        try {
          if (data.pReturned === 0) {
            my_dialog("", "", "close");

            SONDA_DB_Session.transaction(
              tx => {
                let pSQL = `UPDATE MANIFEST_DETAIL SET IS_OFFLINE = 0 WHERE GUIDE_ID = ${
                  data.guideid
                  }`;

                tx.executeSql(pSQL);
              },
              err => {
                my_dialog("", "", "close");
                notify(`guide_delivered_returned.post.offline:${err}`);
              },
              () => {
                socketIo.emit("process_signature_delivery", {
                  dataurl: pSignature,
                  guide_id: gGuideToDeliver
                });
              }
            );
          } else {
            my_dialog("", "", "close");
            notify(`guide_delivered_returned:${data.pReturned}`);
          }
        } catch (e) {
          my_dialog("", "", "close");
          notify(`guide.delivered.catch:${e.message}`);
        }
      });

      socketIo.on("get_manifest_guide_row", data => {
        SONDA_DB_Session.transaction(
          tx => {
            let pSQL =
              "INSERT INTO MANIFEST_DETAIL(GUIDE_SEQ, GUIDE_ID, GEO_ROUTE, SEQUENCY, GUIDE_STATUS, SENDER_CLIENTCODE, CLIENT_NAME, DESTINATION_CLIENTNAME, DESTINATION_ADDRESS, PACKAGES, DELIVERY_POINT, SCANNED_PACKS, LABELS)";
            pSQL += ` VALUES('${data.row.GUIDE_SEQ}','${data.row.GUIDE_ID}','${
              data.row.GEO_ROUTE
              }','${data.row.SEQUENCY}','PENDING','${data.row.SENDER_CLIENTCODE}`;
            pSQL += `', '${data.row.CLIENT_NAME}','${
              data.row.DESTINATION_CLIENTNAME
              }','${data.row.DESTINATION_ADDRESS}',${data.row.PACKAGES},'${
              data.row.DELIVERY_POINT
              }', 0, ${data.row.LABELS})`;

            tx.executeSql(pSQL);
          },
          err => {
            my_dialog("", "", "close");
            notify("manifest.add.row:" + err);
          }
        );
      });

      socketIo.on("get_manifest_guide_completed", data => {
        if (data.rowcount === 0) {
          notify(
            `ERROR, Manifiesto ${gManifestID}, no tiene guias relacionadas. \n Verifique y vuelva a intentar`
          );
        } else {
          localStorage.setItem("MANIFEST_PRESENT", "1");
          localStorage.setItem("MANIFEST_SCANNED", gManifestID);

          $.mobile.changePage("#manifest_guides_page", {
            transition: "flow",
            reverse: true,
            changeHash: true,
            showLoadMsg: false
          });
          showmanifestlist("PENDING");
        }
      });

      socketIo.on("manifest_not_found", data => {
        try {
          my_dialog("", "", "close");
          notify(`Manifiesto ${data.manifestid}, No Existe.`);
          clearup_manifiesto();
        } catch (e) {
          notify(e.message);
        }
      });

      socketIo.on("manifest_summ", data => {
        try {
          $("#lstmanifestsumm").listview();
          my_dialog("", "", "close");

          $("#lblScannedManifest").text(gManifestID);
          $("#lblAssignedCourier").text(
            data.COURIER_CODE + " " + data.RELATED_COURIER_NAME
          );

          $("#lblPacksManifest").text("0");
          $("#lblGuiasManifest").text("0");

          $("#lblGuiasManifest").text(data.TOTAL_GUIDES);
          $("#lblPacksManifest").text(data.TOTAL_PACKAGES);

          $("#btnAcceptManifest").css("visibility", "visible");
          $("#lstmanifestsumm").listview("refresh");
        } catch (e) {
          notify(e.message);
        }
      });

      socketIo.on("signature_has_been_saved", data => {
        try {
          socketIo.emit("process_pickup_image", {
            taskid: data.taskid,
            image: gpicture
          });
        } catch (e) {
          notify(e.message);
        }
      });

      socketIo.on("delivery_signature_has_been_saved", data => {
        try {
          socketIo.emit("process_delivery_image", {
            guide_id: gGuideToDeliver,
            image: gpicture
          });

          gDESTINATION_CLIENTNAME_ToDeliver = "";
          gRELATED_CLIENT_NAME_ToDeliver = "";
          gGuideToDeliver = "";
          gSignatedDelivery = false;
        } catch (e) {
          notify(e.message);
        }
      });

      socketIo.on("process_novisit_completed", data => {
        try {
          SONDA_DB_Session.transaction(
            tx => {
              let pSQL = `UPDATE PICKUP_ROUTE SET TASK_STATUS = 'COMPLETED', NO_PICKEDUP = 1, NO_VISIT_REASON = '${
                data.reason
                }' WHERE TASK_ID = ${data.taskid}`;

              tx.executeSql(pSQL);
              RefreshMyRoutePlan();
              $.mobile.changePage("#pickupplan_page", {
                transition: "flow",
                reverse: true,
                changeHash: true,
                showLoadMsg: false
              });
            },
            err => { }
          );
        } catch (e) {
          notify(`process_novisit.complete.catch:${e.message}`);
        }
      });

      socketIo.on("get_all_skus_row", data => {
        if (data != undefined) {
          SONDA_DB_Session.transaction(
            tx => {
              let pSQL =
                "INSERT INTO SKUS(SKU_ID, SKU_DESCRIPTION, PRICE_LIST)";
              pSQL += ` VALUES('${data.row.CODE_SKU}','${
                data.row.DESCRIPTION_SKU
                }',${data.row.LIST_PRICE})`;

              tx.executeSql(pSQL);
            },
            err => {
              notify("get_all_skus_row:" + err.message);
            }
          );
        }
      });

      socketIo.on("get_all_skus_done", data => {
        gTimeout = setTimeout(() => {
          socketIo.emit("get_all_branches", {
            dbuser: gdbuser,
            dbuserpass: gdbuserpass
          });
        }, 500);
        clearTimeout(gTimeout);
      });

      socketIo.on("get_all_novisit_row", data => {
        if (data != undefined) {
          SONDA_DB_Session.transaction(
            tx => {
              let pSQL = "INSERT INTO NO_VISIT(PARAM_NAME, PARAM_CAPTION)";
              pSQL += ` VALUES('${data.row.PARAM_NAME}','${
                data.row.PARAM_CAPTION
                }')`;

              tx.executeSql(pSQL);
            },
            err => {
              // notify("um.add.row:" + err);
            }
          );
        }
      });

      //Finaliza Socket PickUp

      //Inicia DelegateSondaRoute
      socketIo.on("GetManifestHeaderSend", data => {
        $("#lblManifest").text(data.MANIFEST_HEADER);

        var dateCreaction = new Date(data.FECHA_CREACION);
        $("#lblManifestDateCreation").text(
          dateCreaction.getDate() +
          "/" +
          (dateCreaction.getMonth() + 1) +
          "/" +
          dateCreaction.getFullYear()
        );
        $("#lblManifestNumDoc").text(data.CANTIDAD_PEDIDOS);
        $("#lblManifestComments").text(data.COMMENTS);

        $("#lblManifestPilotAsigne").text(data.PILOTO_ASIGNADO);
        $("#lblManifestVehiculo").text(data.VEHICLE);
        $("#lblManifestRuta").text(data.GEO_RUTA);
      });

      socketIo.on("GetManifestHeaderFail", data => {
        notify(data.msg);
        ClearControlsPageManifest();
      });

      socketIo.on("CreateMyRoutePlanCompleted", data => {
        ClearControlsPageManifest();
        $("#txtManifestHeader").val("");
        $.mobile.changePage("#menu_page", {
          transition: "flow",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
        socketIo.emit("getmyrouteplan", {
          loginid: gLastLogin,
          dbuser: gdbuser,
          dbuserpass: gdbuserpass
        });
      });

      socketIo.on("GetInvoiceHeader", data => {
        //Invoice
        $("#lblInfInvoice_NunDoc").text(data.row.DocNum);
        $("#lblInfInvoice_TotalDoc").text(
          "Q " + format_number(parseFloat(data.row.DocTotal), 2)
        );
        //InvoiceGeneral
        $("#lblInvoiceCustomer").text(
          data.row.CardCode + "/" + data.row.CardName
        );
        $("#lblInvoiceTotalCostumer").text(
          "Q " + format_number(parseFloat(data.row.DocTotal), 2)
        );
        $("#lblInvoice_Address").text(data.row.Address);
        //Tatal
        $("#lblInfInvoiceTotal_ClientName").text(data.row.CardName);
        $("#lblInfInvoiceTotal_Saldo").text(
          "Q " + format_number(parseFloat(data.row.DocTotal), 2)
        );
        $("#lblInfInvoiceTotal_Pendiente").text(
          "Q " + format_number(parseFloat(data.row.DocTotal), 2)
        );
        $("#lblInfInvoiceTotal_Vuelto").text(
          "" + format_number(parseFloat("0"), 2)
        );
        gSaldoPen = parseInt(data.row.DocTotal);
      });

      socketIo.on("GetInvoiceDet", data => {
        var vLi = "";
        vLi =
          '<li data-icon="false" class="ui-field-contain ui-alt-icon ui-nodisc-icon ui-shadow ui-icon-check">';
        vLi = vLi + "<p>";
        vLi =
          vLi +
          '<span class="medium" style="background-color: #333333; border-radius: 4px; color: #ffffff; padding: 3px; box-shadow: 1px 10px 10px 1px silver; text-shadow: none">' +
          data.row.ItemCode +
          '</span>&nbsp<span class="small-roboto">' +
          data.row.Dscription +
          "</span>";
        vLi = vLi + "</p>";
        vLi = vLi + "<p>";
        vLi = vLi + "<span>Cantidad: " + data.row.Quantity + "</span>&nbsp";
        vLi =
          vLi +
          "<span>Unitario: " +
          "Q " +
          format_number(parseFloat(data.row.Price), 2) +
          "</span>";
        vLi =
          vLi +
          '<span class="ui-li-count" style="position:absolute; top:70%">' +
          "Q " +
          format_number(parseFloat(data.row.LineTotal), 2) +
          "</span>";
        vLi = vLi + "</p>";
        vLi = vLi + "</li>";

        $("#lstInfInvoice_Det").append(vLi);
      });

      socketIo.on("GetInvoiceDetCompleted", data => {
        $("#lstInfInvoice_Det").listview("refresh");
      });

      socketIo.on("SendDeliveryTask_fail", data => {
        notify(data.Message);
      });
      socketIo.on("SendDeliveryTask_success", data => {
        var clienteServicio = new ClienteServicio();
        var configuracionDeDecimalesServicio = new ManejoDeDecimalesServicio();

        configuracionDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(
          decimales => {
            var cliente = new Cliente();
            cliente.clientId = gClientID;
            clienteServicio.obtenerCliente(
              cliente,
              decimales,
              clienteN1 => {
                actualizarListadoDeTareas(
                  data.taskid,
                  "DELIVERY",
                  TareaEstado.Completada,
                  clienteN1.clientId,
                  clienteN1.clientName,
                  clienteN1.address,
                  0,
                  TareaEstado.Aceptada,
                  clienteN1.rgaCode
                );
                $.mobile.changePage("#menu_page", {
                  transition: "flow",
                  reverse: true,
                  changeHash: true,
                  showLoadMsg: false
                });
              },
              operacion => {
                notify(operacion.mensaje);
              }
            );
          },
          operacion => {
            notify(operacion.mensaje);
          }
        );
      });

      //Finaliza DelegateSondaRoute

      //Inicia StarRouteController

      socketIo.on("no_skus_found", data => {
        var message = `No se econtro data para ${data.default_warehouse}`;
        ToastThis(message);
      });
      socketIo.on("add_to_auth", data => {
        try {
          var dateAutho =
            data.row.AUTH_ASSIGNED_DATETIME.substring(0, 4) +
            "/" +
            data.row.AUTH_ASSIGNED_DATETIME.substring(5, 7) +
            "/" +
            data.row.AUTH_ASSIGNED_DATETIME.substring(8, 10);
          var dateAuthoLimit =
            data.row.AUTH_LIMIT_DATETIME.substring(0, 4) +
            "/" +
            data.row.AUTH_LIMIT_DATETIME.substring(5, 7) +
            "/" +
            data.row.AUTH_LIMIT_DATETIME.substring(8, 10);

          if (data.doctype === "FACTURA") {
            $("#lblCurrent_AuthID").text(data.row.AUTH_ID);
            $("#lblCurrent_Serie").text(data.row.AUTH_SERIE);

            $("#lblCurrent_DateAuth").text(dateAutho.toString());
            $("#lblCurrent_AuthFinishDate").text(dateAuthoLimit.toString());

            $("#lblCurrent_From").text(data.row.AUTH_DOC_FROM);
            $("#lblCurrent_To").text(data.row.AUTH_DOC_TO);

            $("#lblCurrent_CurrentInvoice").text(data.row.AUTH_CURRENT_DOC);

            $("#lblBranchName").text(data.row.AUTH_BRANCH_NAME);
            $("#lblBranchAddress").text(data.row.AUTH_BRANCH_ADDRESS);

            localStorage.setItem("SAT_RES_EXPIRE", dateAuthoLimit);
          }
          $("#btnStartPOS_action").css("display", "none");
          $("#btnStartPOS_action").css("visibility", "visible");
        } catch (e) {
          notify(e.message);
        }
      });

      socketIo.on("GetInitialRouteSend", data => {
        switch (data.option) {
          case "GetInitialRouteStarted":
            // ..
            break;
          case "requested_skus":
            RequestedSkus(data);
            break;
          case "getroute_inv_completed":
            GetrouteInvCompleted(data);
            break;
          case "error_message":
            my_dialog("", "", "close");
            ErrorMessage(data);
            break;
          case "no_skus_found":
            NoSkusFound(data);
            break;
          case "add_to_pos_sku":
            AddToPosSku(data);
            break;
          case "pos_skus_completed":
            PosSkusCompleted(data);
            break;
          case "requested_serie":
            RequestedSerie(data);
            break;
          case "no_series_found":
            NoSeriesFound(data);
            break;
          case "add_to_series":
            AddToSeries(data);
            break;
          case "series_completed":
            SeriesCompleted(data);
            break;
          case "GetInitialRouteCompleted":
            estaCargandoInicioRuta = 0;
            console.log("peticiones al server finalizadas.... inicia proceso de datos...");
            GetInitialRouteCompleted(data);
            break;
          //Etiquetas
          case "requested_tags":
            RequestedTags();
            break;
          case "no_tags_found":
            NoTagsFound(data);
            break;
          case "add_to_tags":
            AddToTags(data);
            break;
          case "tags_completed":
            TagsCompleted(data);
            break;
          //Clientes
          case "requested_get_customer":
            RequestedGetCustomer();
            break;
          case "no_get_customer_found":
            NoGetCustomerFound(data);
            break;
          case "add_to_get_customer":
            AddToCustomer(data);
            break;
          case "get_customer_completed":
            GetCustomerCompleted(data);
            break;
          //Frecuencia de Clientes
          case "requested_get_customer_frequency":
            RequestedGetCustomerFrequency();
            break;
          case "no_get_customer_frequency_found":
            NoGetCustomerFrequencyFound(data);
            break;
          case "add_to_customer_frequency":
            AddToCustomerFrequency(data);
            break;
          case "get_customer_frequency_completed":
            GetCustomerFrequencyCompleted(data);
            break;
          //Etiquetas por Clientes
          case "requested_get_tags_x_customer":
            RequestedGetTagsXCustomer();
            break;
          case "no_get_tags_x_customer_found":
            NoGetTagsXCustomerFound(data);
            break;
          case "add_to_get_tags_x_customer":
            AddToTagsXCustomer(data);
            break;
          case "get_tags_x_customer_completed":
            GetTagsXCustomerCompleted(data);
            break;
          //Reglas
          case "requested_get_rules":
            RequestedGetRules(data);
            break;
          case "no_get_rules_found":
            NoGetRulesFound(data);
            break;
          case "add_to_rule":
            AddToRule(data);
            break;
          case "get_rules_completed":
            GetRuleCompleted(data);
            break;
          //Tareas
          case "requested_get_tasks":
            RequestedGetTask(data);
            break;
          case "no_get_tasks_found":
            NoGetTasksFound(data);
            break;
          case "add_to_task":
            AddToTask(data);
            break;
          case "get_tasks_completed":
            GetTaskCompleted(data);
            break;
          //SkuPreSale
          case "requested_get_sku_presale":
            RequestedGetSkuPreSale(data);
            break;
          case "no_get_sku_presale_found":
            NoGetSkuPreSaleFound(data);
            break;
          case "add_to_sku_presale":
            AddToSkuPreSale(data);
            break;
          case "get_sku_presale_completed":
            GetSkuPreSaleCompleted(data);
            break;
          //Secuencia de documentos
          case "GetDocumentSequence_start":
            GetDocumentSequenceStart(data);
            break;
          case "GetDocumentSequence_NoFound":
            GetDocumentSequenceNoFound(data);
            break;
          case "GetDocumentSequence_AddDocument":
            AddToDocumentSequence(data);
            break;
          case "GetDocumentSequence_Completed":
            GetDocumentSequenceCompleted(data);
            break;
          //Obtener paquetes
          case "GetPackUnit_start":
            GetPackUnitStart(data);
            break;
          case "GetPackUnit_NoFound":
            GetPackUnitNoFound(data);
            break;
          case "GetPackUnit_AddPackUnit":
            AddToPackUnit(data);
            break;
          case "GetPackUnit_Completed":
            GetPackUnitCompleted(data);
            break;
          //Obtener conversion de paquetes
          case "GetPackConversion_start":
            GetPackConversionStart(data);
            break;
          case "GetPackConversion_NoFound":
            GetPackConversionNoFound(data);
            break;
          case "GetPackConversion_AddPackConversion":
            AddToPackConversion(data);
            break;
          case "GetPackConversion_Completed":
            GetPackConversionCompleted(data);
            break;
          //Familia de Sku
          case "requested_get_family_sku":
            RequestedGetFamilySku(data);
            break;
          case "no_get_family_sku_found":
            NoGetFamilySkuFound(data);
            break;
          case "add_to_get_family_sku":
            AddToFamilySku(data);
            break;
          case "get_family_sku_completed":
            GetFamilySkuCompleted(data);
            break;
          //Listas de Precios por Cliente
          case "get_price_list_by_customer_received":
            PriceListByCustomerReceived();
            break;
          case "no_price_list_by_customer_found":
            PriceListByCustomerNotFound(data);
            break;
          case "add_price_list_by_customer":
            AddPriceListByCustomer(data);
            break;
          case "get_price_list_by_customer_completed":
            PriceListByCustomerCompleted();
            break;
          //Listas de Precios por SKU
          case "get_price_list_by_sku_received":
            PriceListBySKUReceived();
            break;
          case "not_price_list_by_sku_found":
            PriceListBySKUNotFound(data);
            break;
          case "add_price_list_by_sku":
            AddPriceListBySKU(data);
            break;
          case "get_price_list_by_sku_completed":
            PriceListBySKUCompleted();
            break;
          //Lista de Precios Default
          case "get_price_list_default_received":
            PriceListDefaultReceived();
            break;
          case "not_found_default_price_list":
            PriceListDefaultNotFound(data);
            break;
          case "add_price_list_default":
            AddPriceListDefault(data);
            break;
          case "get_price_list_default_completed":
            PriceListDefaultCompleted();
            break;
          //Get Item History
          case "not_found_item_history":
            GetItemHistoryNotFound(data);
            break;
          case "add_item_history":
            AddItemHistory(data);
            break;
          case "get_price_item_history_completed":
            GetItemHistoryCompleted();
            break;
          //GetSalesOrderDraft
          case "get_sales_order_draft_received":
          //GetSalesOrderDraftReceived();
          case "not_found_sales_order_draft":
            //GetSalesOrderDraftNotFound();
            break;
          case "GetSalesOrderDraftComplete":
            GetSalesOrderDraftComplete();
            break;
          case "AddSalesOrderDraft":
            AddSalesOrderDraft(data);
            break;
          //GetSalesOrderDraft
          case "AddInvoiceDraft":
            AddInvoiceDraft(data.data);
            break;
          //Lista de Precios Default
          case "GetCalculationRules_received":
            CalculationRulesReceived();
            break;
          case "not_found_CalculationRules":
            CalculationRulesNotFound(data);
            break;
          case "add_GetCalculationRules":
            AddCalculationRules(data);
            break;
          case "GetCalculationRules_completed":
            CalculationRulesCompleted();
            break;
          //GetDefaultPackSku
          case "not_found_default_pack_sku":
            NoPackUnitBySkuFound();
            break;
          case "add_default_pack_sku":
            AddDefaultPackSku(data);
            break;
          case "get_default_pack_sku_completed":
            DefaultPackUnitBySkuCompleted();
            break;
          //Lista de Precios por sku y unidad de medida
          case "GetPriceListBySkuPackScale_received":
            PriceListBySkuPackScaleReceived();
            break;
          case "not_found_GetPriceListBySkuPackScale":
            PriceListBySkuPackScaleNotFound(data);
            break;
          case "add_GetPriceListBySkuPackScale":
            AddPriceListBySkuPackScale(data);
            break;
          case "GetPriceListBySkuPackScale_completed":
            PriceListBySkuPackScaleCompleted();
            break;
          //GetPrintUMParameter
          case "GetPrintUMParameter_received":
            GetPrintUMParameterReceived();
            break;
          case "not_found_GetPrintUMParameter":
            GetPrintUMParameterNotFound(data);
            break;
          case "add_GetPrintUMParameter":
            AddGetPrintUMParameter(data);
            break;
          case "GetPrintUMParameter_completed":
            GetPrintUMParameterCompleted();
            break;
          //GetMaxDiscountParameter
          case "GetMaxDiscountParameter_received":
            GetMaxDiscountParameterReceived();
            break;
          case "not_found_GetMaxDiscountParameter":
            GetMaxDiscountParameterNotFound(data);
            break;
          case "add_GetMaxDiscountParameter":
            AddGetMaxDiscountParameter(data);
            break;
          case "GetMaxDiscountParameter_completed":
            GetMaxDiscountParameterCompleted();
            break;
          //Listas de Bonos por Cliente
          case "get_bonus_list_by_customer_received":
            BonusListByCustomerReceived();
            break;
          case "no_bonus_list_by_customer_found":
            BonusListByCustomerNotFound(data);
            break;
          case "add_bonus_list_by_customer":
            AddBonusListByCustomer(data);
            break;
          case "get_bonus_list_by_customer_completed":
            BonusListByCustomerCompleted();
            break;
          //Listas de Bonos por sku
          case "get_bonus_list_by_sku_received":
            BonusListBySkuReceived();
            break;
          case "not_bonus_list_by_sku_found":
            BonusListBySkuNotFound(data);
            break;
          case "add_bonus_list_by_sku":
            AddBonusListBySku(data);
            break;
          case "get_bonus_list_by_sku_completed":
            BonusListBySkuCompleted();
            break;
          //Listas de Descuentos por Cliente
          case "get_discount_list_by_customer_received":
            DiscountListByCustomerReceived();
            break;
          case "no_discount_list_by_customer_found":
            DiscountListByCustomerNotFound(data);
            break;
          case "add_discount_list_by_customer":
            AddDiscountListByCustomer(data);
            break;
          case "get_discount_list_by_customer_completed":
            BonusListByCustomerCompleted();
            break;
          //Listas de Descuentos por Monto General
          case "get_discount_by_general_amount_list_received":
            DiscountListByGeneralAmountReceived();
            break;
          case "not_discount_by_general_amount_list_found":
            DiscountListByGeneralAmountNotFound(data);
            break;
          case "add_discount_by_general_amount_list":
            AddDiscountListByGeneralAmount(data);
            break;
          case "get_discount_by_general_amount_list_completed":
            DiscountListByGeneralAmountCompleted();
            break;
          //Listas de Descuento por sku
          case "get_discount_list_by_sku_received":
            DiscountListBySkuReceived();
            break;
          case "not_discount_list_by_sku_found":
            DiscountListBySkuNotFound(data);
            break;
          case "add_discount_list_by_sku":
            AddDiscountListBySku(data);
            break;
          case "get_discount_list_by_sku_completed":
            DiscountListBySkuCompleted();
            break;
          //Lista de Bonificaciones por Multiplo
          case "get_bonus_list_by_sku_multiple_received":
            var sql = "DELETE FROM BONUS_LIST_BY_SKU_MULTIPLE";
            gInsertsInitialRoute.push(sql);

            break;
          case "get_bonus_list_by_sku_multiple_fail":
            notify(
              "Error al obtener la Lista de Bonificaciones por Multiplo: " +
              data.error
            );
            break;
          case "get_bonus_list_by_sku_multiple_not_found":
            notify(data.error);
            break;
          case "add_bonus_sku_multiple":
            var bonificacion = data.row;
            let listaDeEjecucion: string[] = [];
            listaDeEjecucion.push(" INSERT INTO BONUS_LIST_BY_SKU_MULTIPLE(");
            listaDeEjecucion.push(" BONUS_LIST_ID");
            listaDeEjecucion.push(", CODE_SKU");
            listaDeEjecucion.push(", CODE_PACK_UNIT");
            listaDeEjecucion.push(", MULTIPLE");
            listaDeEjecucion.push(", CODE_SKU_BONUS");
            listaDeEjecucion.push(", BONUS_QTY");
            listaDeEjecucion.push(", CODE_PACK_UNIT_BONUES");
            listaDeEjecucion.push(", PROMO_ID");
            listaDeEjecucion.push(", PROMO_NAME");
            listaDeEjecucion.push(", PROMO_TYPE");
            listaDeEjecucion.push(", FREQUENCY");
            listaDeEjecucion.push(")VALUES(");
            listaDeEjecucion.push(`${bonificacion.BONUS_LIST_ID}`);
            listaDeEjecucion.push(` , '${bonificacion.CODE_SKU}'`);
            listaDeEjecucion.push(` , '${bonificacion.CODE_PACK_UNIT}'`);
            listaDeEjecucion.push(` , ${bonificacion.MULTIPLE}`);
            listaDeEjecucion.push(` , '${bonificacion.CODE_SKU_BONUS}'`);
            listaDeEjecucion.push(` , ${bonificacion.BONUS_QTY}`);
            listaDeEjecucion.push(` , '${bonificacion.CODE_PACK_UNIT_BONUES}'`);
            listaDeEjecucion.push(` , ${bonificacion.PROMO_ID}`);
            listaDeEjecucion.push(` , '${bonificacion.PROMO_NAME}'`);
            listaDeEjecucion.push(` , '${bonificacion.PROMO_TYPE}'`);
            listaDeEjecucion.push(` , '${bonificacion.FREQUENCY}'`);
            listaDeEjecucion.push(" )");
            gInsertsInitialRoute.push(listaDeEjecucion.join(""));

            break;
          case "add_bonus_sku_multiple_complete":
            // ..
            break;
          //Moneda
          case "get_currency_received":
            CurrencyReceived();
            break;
          case "get_currency_fail":
            notify("Error al obtener la moneda por defecto: " + data.error);
            break;
          case "get_currency_not_found":
            CurrencyNotFound(data);
            break;
          case "add_currency":
            AddCurrency(data);
            break;
          case "add_currency_complete":
            CurrencyCompleted();
            break;
          //GetTaxPercentParameter
          case "not_found_GetTaxPercentParameter":
            localStorage.setItem("TAX_PERCENT_PARAMETER", "0");
            break;
          case "add_GetTaxPercentParameter":
            try {
              localStorage.setItem("TAX_PERCENT_PARAMETER", data.row.Value);
            } catch (e) {
              notify(e.message);
            }
            break;
          //GetDefaultBonusAndDiscountListId
          case "GetDefaultBonusAndDiscountListId_AddInfo":
            localStorage.setItem(
              "DEFAULT_DISCOUNT_LIST_ID",
              data.recordset.DISCOUNT_LIST_ID
            );
            localStorage.setItem(
              "DEFAULT_BONUS_LIST_ID",
              data.recordset.BONUS_LIST_ID
            );
            localStorage.setItem(
              "DEFAULT_SALE_BY_MULTIPLE_LIST_ID",
              data.recordset.SALE_BY_MULTIPLE_LIST_ID
            );
            break;
          case "failGetInfo":
            localStorage.setItem("DEFAULT_DISCOUNT_LIST_ID", null);
            localStorage.setItem("DEFAULT_BONUS_LIST_ID", null);
            localStorage.setItem("DEFAULT_SALE_BY_MULTIPLE_LIST_ID", null);
            break;
          //Ventas por Multiplos
          case "get_sales_skus_by_multiple_list_received":
            sql = "DELETE FROM SKU_SALES_BY_MULTIPLE_LIST_BY_SKU";
            gInsertsInitialRoute.push(sql);
            break;

          case "add_sales_skus_by_multiple_list":
            let listaDeLi: string[] = [];
            listaDeLi.push(
              "INSERT INTO SKU_SALES_BY_MULTIPLE_LIST_BY_SKU(SALES_BY_MULTIPLE_LIST_ID, CODE_SKU, CODE_PACK_UNIT, MULTIPLE, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY)"
            );
            listaDeLi.push(" VALUES(");
            listaDeLi.push(`${data.row.SALES_BY_MULTIPLE_LIST_ID}`);
            listaDeLi.push(` , '${data.row.CODE_SKU}'`);
            listaDeLi.push(` , '${data.row.CODE_PACK_UNIT}'`);
            listaDeLi.push(` , ${data.row.MULTIPLE}`);
            listaDeLi.push(` , ${data.row.PROMO_ID}`);
            listaDeLi.push(` , '${data.row.PROMO_NAME}'`);
            listaDeLi.push(` , '${data.row.PROMO_TYPE}'`);
            listaDeLi.push(` , '${data.row.FREQUENCY}'`);
            listaDeLi.push(")");

            gInsertsInitialRoute.push(listaDeLi.join(""));
            break;
          //Combos
          case "GetCombosByRoute_received":
            sql = "DELETE FROM COMBO";
            gInsertsInitialRoute.push(sql);
            break;
          case "add_combo":
            sql = "INSERT INTO COMBO VALUES (";
            sql += data.row.COMBO_ID;
            sql += ",'" + data.row.NAME_COMBO + "'";
            sql += ",'" + data.row.DESCRIPTION_COMBO + "'";
            sql += ")";

            gInsertsInitialRoute.push(sql);
            break;
          //Productos de combo
          case "GetSkuForCombosByRoute_received":
            sql = "DELETE FROM SKU_BY_COMBO";
            gInsertsInitialRoute.push(sql);
            break;
          case "add_sku_for_combo":
            sql =
              "INSERT INTO SKU_BY_COMBO(COMBO_ID,CODE_SKU,CODE_PACK_UNIT,QTY) VALUES(";
            sql += data.row.COMBO_ID;
            sql += ",'" + data.row.CODE_SKU + "'";
            sql += ",'" + data.row.CODE_PACK_UNIT + "'";
            sql += "," + data.row.QTY + "";
            sql += ")";

            gInsertsInitialRoute.push(sql);
            break;
          //Combos en su lista de bonificacion
          case "GetBonusListCombosByRoute_received":
            sql = "DELETE FROM BONUS_LIST_BY_COMBO";
            gInsertsInitialRoute.push(sql);
            break;
          case "add_combo_to_bonus_list":
            let listaParaEjecutar: string[] = [];
            listaParaEjecutar.push(
              "INSERT INTO BONUS_LIST_BY_COMBO(BONUS_LIST_ID,COMBO_ID,BONUS_TYPE,BONUS_SUB_TYPE,IS_BONUS_BY_LOW_PURCHASE,IS_BONUS_BY_COMBO,LOW_QTY, PROMO_ID, PROMO_NAME, PROMO_TYPE, FREQUENCY) VALUES("
            );
            listaParaEjecutar.push(data.row.BONUS_LIST_ID);
            listaParaEjecutar.push(`,${data.row.COMBO_ID}`);
            listaParaEjecutar.push(`,'${data.row.BONUS_TYPE}'`);
            listaParaEjecutar.push(`,'${data.row.BONUS_SUB_TYPE}'`);
            listaParaEjecutar.push(`,${data.row.IS_BONUS_BY_LOW_PURCHASE}`);
            listaParaEjecutar.push(`,${data.row.IS_BONUS_BY_COMBO}`);
            listaParaEjecutar.push(`,${data.row.LOW_QTY}`);
            listaParaEjecutar.push(`,${data.row.PROMO_ID}`);
            listaParaEjecutar.push(`,'${data.row.PROMO_NAME}'`);
            listaParaEjecutar.push(`,'${data.row.PROMO_TYPE}'`);
            listaParaEjecutar.push(`,'${data.row.FREQUENCY}'`);
            listaParaEjecutar.push(")");

            gInsertsInitialRoute.push(listaParaEjecutar.join(""));
            break;
          //Producots a bonificar por combo
          case "GetBonusListCombosSkuByRoute_received":
            sql = "DELETE FROM BONUS_LIST_BY_COMBO_SKU";
            gInsertsInitialRoute.push(sql);
            break;
          case "add_sku_combo_to_bonus_list":
            sql =
              "INSERT INTO BONUS_LIST_BY_COMBO_SKU(BONUS_LIST_ID,COMBO_ID,CODE_SKU,CODE_PACK_UNIT,QTY,IS_MULTIPLE) VALUES(";
            sql += data.row.BONUS_LIST_ID;
            sql += "," + data.row.COMBO_ID;
            sql += ",'" + data.row.CODE_SKU + "'";
            sql += ",'" + data.row.CODE_PACK_UNIT + "'";
            sql += "," + data.row.QTY;
            sql += "," + data.row.IS_MULTIPLE;
            sql += ")";

            gInsertsInitialRoute.push(sql);
            break;
          //GetMaxBonusParameter
          case "not_found_GetMaxBonusParameter":
            SetMaxBonusParameter(0);
            break;
          case "add_GetMaxBonusParameter":
            SetMaxBonusParameter(data.row.Value);
            break;
          //GetLabelParameter
          case "GetLabelParameter_received":
            break;
          case "add_GetLabelParameter":
            almacenarParametroEnElLocalStorage(data.row);
            break;
          case "GetLabelParameter_completed":
            break;
          //GetBonusByGeneralAmountList
          case "AddBonusByGeneralAmountList":
            AgregarBonoPorMontoGeneral(data.row);
            break;
          case "ParameterOfSecondsForSynchronizationOfDataNotFound":
            almacenarParametroEnElLocalStorage({
              PARAMETER_ID: "SECONDS_FOR_SYNCHRONIZATION_OF_DATA",
              VALUE: 0
            });
            break;
          case "add_ParameterOfSecondsForSynchronizationOfData":
            almacenarParametroEnElLocalStorage(data.row);
            break;
          case "AddHistoryByPromoForRoute":
            AgregarHistoricoPorPromo(data.row);
            break;
          //DescuentosPorMontoGeneralYFamilia
          case "not_discount_by_general_amount_and_family_list_found":
            DiscountListByGeneralAmountAndFamilyNotFound(data);
            break;
          case "add_discount_by_general_amount_and_family_list":
            AddDiscountListByGeneralAmountAndFamily(data.row);
            break;
          //DescuentosPorFamiliaYTipoPago
          case "not_discount_by_family_and_payment_type_list_found":
            DiscountListByFamilyAndPaymentTypeNotFound(data);
            break;
          case "add_discount_by_family_and_payment_type_list":
            AddDiscountListByFamilyAndPaymentType(data.row);
            break;
          //GetMaxBonusParameter
          case "not_found_GetApplyDiscountParameter":
            SetApplyDiscountParameter(0);
            break;
          case "add_GetApplyDiscountParameter":
            SetApplyDiscountParameter(data.row.Value);
            break;
          //StatisticsByUser
          case "statistics_not_found":
            notify("No se encontraron las estadisticas de venta.");
            break;
          case "add_statistic":
            this.estadisticaServicio.agregarEstadisticaDeVenta(data.row);
            break;
          case "ListsOfSpecialPriceByScaleForRouteNotFound":
            notify(
              "No se encontraron listas de precios especiales para la ruta."
            );
            break;
          case "AddListsOfSpecialPriceByScaleForRoute":
            AddListOfSpecialPriceByScale(data.row);
            break;
          case "GetListsOfSpecialPriceByScaleForRouteCompleted":
            // ..
            break;
          case "add_order_discount_apply":
            AddOrderForDiscountForApply(data.row);
            break;

          //Microsurves for route
          case "add_microsurvey":
            AddMicrosurvey(data.row);
            break;

          //Questions of Microsurvey
          case "add_question_by_microsurvey":
            AddQuestionOfMicrosurvey(data.row);
            break;

          //Answers of Microsurvey
          case "add_answer_by_microsurvey":
            AddAnswerOfQuestionOfMicrosurvey(data.row);
            break;

          //Channels of Microsurvey
          case "add_channel_by_microsurvey":
            AddChannelsOfMicrosurvey(data.row);
            break;

          case "add_overdue_invoice_by_customer_for_route":
            this.cuentaCorrienteServicio.agregarFacturaVencidaDeCliente(
              data.row
            );
            break;

          case "add_parameter_minimum_percentage_of_payment":
            localStorage.setItem(
              "MINIMUM_PERCENTAGE_OF_PAYMENT",
              data.row.Value || "0"
            );
            break;
          case "add_parameter_use_goal_module":
            localStorage.setItem(
              "USE_GOAL_MODULE",
              data.row.Value || "0"
            );
            break;
          case "add_image_by_sku":
            if (data.row) {
              this.imagenDeSkuServicio.almacenarImagenesDeProducto(data.row);
            }
            break;
        }
      });

      socketIo.on("auth_not_found", data => {
        notify("No se econtraron autorizaciones para esta ruta");
      });

      socketIo.on("ValidateRoute_success", data => {
        ObtenerInformacionDeRuta();
      });
      socketIo.on("ValidateRoute_fail", data => {
        notify("No se puede validar la ruta por: \r\n" + data.message);
      });

      // ----------Información de Inicio---------//
      socketIo.on("GetRouteInfo_Send", data => {
        switch (data.option) {
          case "GetReasons_success":
            // insert into local table
            data.data.forEach(entry => {
              AddToReasons(entry);
            });
            break;
          case "DeliveryTaskError":
            my_dialog("", "", "close");
            notify("Error al crear el plan de ruta de entrega:" + data.msg);
            break;
          case "GetRouteInfo_Send_Start":
            my_dialog("Iniciando ruta", "Espere...", "open");
            break;
          case "GetRouteInfo_Send_fail":
            ErrorMessage(data);
            break;
          case "GetRouteInfo_Send_success":
            let btnStartPosAction = $("#btnStartPOS_action");
            btnStartPosAction.css("display", "");
            btnStartPosAction.css("visibility", "visible");
            btnStartPosAction = null;
            my_dialog("", "", "close");
            break;
          case "GetUserInfo":
            MostarInformacionDeUsuario(data.data);
            break;
          case "GetResolution":
            MostarResolucion(data.data);
            break;
          case "GetDocumentsSequence":
            MostarSecuenciaDeDocumentos(data.data);
            break;
          case "GetReviewTask":
            MostarResumenDeTareas(data.data);
            break;
          case "GetReviewQty":
            MostarResumenDeCantidad(data.data);
            break;
        }
      });

      socketIo.on("GetCompanies_Success", data => {
        AddCompany(data);
      });
      // ----------Fin Información de Inicio---------//

      //Finaliza StartRouteController

      //Inicia DelegateCustomerController

      socketIo.on("create_new_task_completed", data => {
        $.mobile.changePage("#menu_page", {
          transition: "flow",
          reverse: true,
          changeHash: true,
          showLoadMsg: false
        });
        socketIo.emit("getmyrouteplan", {
          loginid: gLastLogin,
          dbuser: gdbuser,
          dbuserpass: gdbuserpass
        });
      });

      //Finaliza DelegateCustomerController

      //Inicia DelegarSincronizacionServicio

      socketIo.on("PaymentReceive", data => {
        ActualizarEnvioPagos(
          data,
          dataN1 => { },
          err => {
            notify(`PaymentReceive ${err.message}`);
          }
        );
      });

      socketIo.on("insert_new_client_completed", data => {
        ActualizarClienteNuevoHandHeld(
          data,
          () => {
            EnviarDataSinClientes();
          },
          err => {
            notify(err.message);
          }
        );
      });

      socketIo.on("insert_tags_x_client_completed", data => {
        ActualizarEtiqutaPorClienteHandHeld(data);
      });

      socketIo.on("insert_tags_x_client_fail", data => {
        ActualizarEnvioEtiquetaClienteError(data);
        notify("Insertar etiquetas por cliente " + data.Message);
      });

      socketIo.on("PaymentReceiveComplete", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var sql = "UPDATE PAYMENT_HEADER";
            sql += " SET IS_POSTED=2";
            sql += ", PAYMENT_BO_NUM = " + data.PaymentBoNum;
            sql +=
              ", SERVER_POSTED_DATETIME = '" + data.ServerPostedDateTime + "'";
            sql += " WHERE";
            sql += " PAYMENT_NUM =" + data.PaymentNum;
            tx.executeSql(sql);
          },
          err => {
            notify("PaymentReceiveComplete" + err.message);
          }
        );
      });

      socketIo.on("PaymentFail", data => {
        notify("Pago fallido: " + data.Message);
      });

      socketIo.on("TaskReceive", data => {
        ActualizarEnvioTarea(
          data,
          dataN1 => { },
          err => {
            notify("Tarea recibida: " + err.message);
          }
        );
      });

      socketIo.on("SendTask_Request", data => {
        if (data.result === "ok") {
          MarcarTareasComoSincronizada(data.task);
        } else {
          notify("Envio de tarea: " + data.Message);
        }
      });

      socketIo.on("InvoiceReceive", data => {
        ActualizarEnvioFactura(
          data,
          dataN1 => { },
          err => {
            notify("InvoiceReceive " + err.message);
          }
        );
      });

      socketIo.on("InvoiceReceiveComplete", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var sql = `UPDATE INVOICE_HEADER SET IS_POSTED=2 WHERE  INVOICE_NUM =${
              data.InvoiceNum
              }`;
            tx.executeSql(sql);
          },
          err => {
            notify("Recepcion de factura fallida: " + err.message);
          }
        );
      });

      socketIo.on("InvoiceFail", data => {
        notify("Factura fallida: " + data.Message);
      });

      socketIo.on("ConsignmentReceive", data => {
        ActualizarEnvioConsignacion(
          data,
          dataN1 => { },
          err => {
            notify("Consignacion recibida: " + err.message);
          }
        );
      });

      socketIo.on("ConsignmentReceiveComplete", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var sql = "UPDATE CONSIGNMENT_HEADER";
            sql += " SET IS_POSTED = 2";
            sql += "  ,CONSIGNMENT_BO_NUM = " + data.ConsignmentBoNum;
            sql += " WHERE";
            sql += " CONSIGNMENT_ID =" + data.ConsignmentNum;
            tx.executeSql(sql);
          },
          err => {
            notify("Consignacion recibida completamente: " + err.message);
          }
        );
      });

      socketIo.on("ConsignmentFail", data => {
        notify("Consignacion Fallida: " + data.Message);
      });

      socketIo.on("ActiveRouteFail", data => {
        _actualizandoRuta = false;
        estaEnControlDeFinDeRuta = false;
        notify("Marcar ruta como activa: " + data.Message);
      });

      socketIo.on("ActiveRouteComplete", () => {
        estaEnControlDeFinDeRuta = false;
        MostrarFinDeRuta();
      });

      socketIo.on("SalesOrderReceive", data => {
        ActualizarEnvioDeOrdernesDeCompra(
          data,
          dataN1 => { },
          err => {
            notify("Orden de venta recibida: " + err.message);
          }
        );
      });

      socketIo.on("SalesOrderReceiveComplete", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var sql = "UPDATE SALES_ORDER_HEADER";
            sql += " SET IS_POSTED = 2";
            sql += ", IS_POSTED_VALIDATED = 2";
            sql += `, SERVER_POSTED_DATETIME = '${data.ServerPostedDateTime}'`;
            sql += `  ,SALES_ORDER_ID_BO = ${data.SalesOrderIdBo}`;
            sql += " WHERE";
            sql += ` SALES_ORDER_ID =${data.SalesOrderId}`;
            sql += ` AND DOC_SERIE ='${data.DocSerie}'`;
            sql += ` AND DOC_NUM =${data.DocNum}`;
            tx.executeSql(sql);
          },
          err => {
            notify("Orden de venta recibida completamente: " + err.message);
          }
        );
      });

      socketIo.on("SalesOrderFail", data => {
        notify("Orden de venta fallida: " + data.message);
      });

      socketIo.on("SendSalesOrderTimesPrintedReceive", data => {
        ActualizarEnvioDeNumeroDeImprecionesDeOrdenesDeVenta(
          data,
          dataN1 => { },
          err => {
            notify("Veces de impresion de orden de venta: " + err.message);
          }
        );
      });

      socketIo.on("SendSalesOrderTimesPrintedFail", data => {
        notify(
          "Veces de impresion de orden de venta fallidas: " + data.Message
        );
      });

      socketIo.on("SendDocumentSecuence_Request", data => {
        switch (data.option) {
          case "fail":
            notify(
              `Error al actualizar el numero de las secuencias de documentos ${
              data.message
              }`
            );
            break;
        }
      });

      socketIo.on("SendCommitedInventoryVoid_Request", data => {
        switch (data.option) {
          case "success":
            ActualizarInventarioReservadoPorOrdenesDeVentaAnuladas(
              data,
              2,
              () => { },
              err => {
                notify(
                  `Error al devolver inventario por orden de venta anulada ${
                  err.message
                  }`
                );
              }
            );
            break;
          case "fail":
            notify(
              `Error al devolver inventario por orden de venta anulada ${
              data.message
              }`
            );
            break;
          case "receive":
            ActualizarInventarioReservadoPorOrdenesDeVentaAnuladas(
              data,
              1,
              () => { },
              err => {
                notify(
                  `Error al actualizar la orden de venta anulada ${err.message}`
                );
              }
            );
            break;
        }
      });

      socketIo.on("SendSalesOrderDraft", data => {
        switch (data.option) {
          case "SendSalesOrderDraft_Completed":
            ActualizarEnvioDeBorradoresDeOrdernesDeCompra(
              data,
              () => {
                // --
              },
              err => {
                notify(
                  `Error al actualizar el borrador de orden de venta en HH: ${
                  err.message
                  }`
                );
              }
            );
            break;
          case "SendSalesOrderDraft_Fail":
            notify(
              `Error al insertar el borrador de orden de venta: ${data.Message}`
            );
            break;
        }
      });

      socketIo.on("SendUpdateSalesOrderDraft", data => {
        switch (data.option) {
          case "SendUpdateSalesOrderDraft_Completed":
            ActualizarEnvioDeActualizacionDeBorradoresDeOrdernesDeCompra(
              data,
              () => {
                // --
              },
              err => {
                notify(
                  `Error al actualizar el borrador de orden de venta en HH: ${
                  err.message
                  }`
                );
              }
            );
            break;
          case "SendUpdateSalesOrderDraft_Fail":
            notify(
              `Error al actualizar el borrador de orden de venta: ${
              data.Message
              }`
            );
            break;
        }
      });
      socketIo.on("TakeInventoryReceiveComplete", data => {
        SONDA_DB_Session.transaction(
          tx => {
            var sql = "UPDATE TAKE_INVENTORY_HEADER";
            sql += " SET IS_POSTED = 2";
            sql += "  ,TAKE_INVENTORY_ID_BO = " + data.TakeInventoryBoId;
            sql +=
              ", SERVER_POSTED_DATETIME = '" + data.ServerPostedDateTime + "'";
            sql += " WHERE";
            sql += " TAKE_INVENTORY_ID =" + data.TakeInventoryHhId;
            tx.executeSql(sql);
          },
          err => {
            notify(`Error al actualizar toma de inventario: ${err.message}`);
          },
          () => { }
        );
      });

      socketIo.on("SendCustomerChange_Request", data => {
        switch (data.option) {
          case "success":
            ActualizarEnvioDeCambiosDeClientes(
              data,
              () => { },
              err => {
                notify(`Error al enviar el cliente: ${err.message}`);
              }
            );

            break;
          case "fail":
            notify(`Error al actualizar cliente : ${data.message}`);
            break;
        }
      });

      //Finaliza DelegarSincronizacionServicio

      //Inicia Preventa Controlador
      socketIo.on("CheckInventorySend", data => {
        $("#SKU_AVAIL_" + data.sku).html(
          "Disponible: " + (data.on_hand - data.is_committed)
        );
        ActualizarInventarioPreVenta(data);
      });
      //Finaliza Preventa Controlador

      //Inicia SaldoClienteServicio

      socketIo.on("GetInvoice_Request", data => {
        switch (data.option) {
          case "NoGetInvoiceFound":
            NoGetInvoiceFound(data);
            break;
          case "AddInvoice":
            AddInvoice(data.data);
            break;
          case "GetInvoiceComplete":
            GetInvoiceCompleted(data);
            break;
          case "GetInvoiceError":
            notify("Error :" + data.error);
            DesBloquearPantalla();
            break;
        }
      });

      //Finaliza SaldoClienteServicio

      //Inicia Validacion De Datos En BO
      socketIo.on("GetSalesOrderForValidationInBo", data => {
        let sincronizacionDeDatosEnBoServicio: SincronizacionDeDatosEnBackOfficeServicio = new SincronizacionDeDatosEnBackOfficeServicio();
        sincronizacionDeDatosEnBoServicio.obtenerOrdenesDeVentaParaValidacionEnBackOffice(
          ordenesDeVenta => {
            socketIo.emit("GetSalesOrderForValidationInBo_response", {
              option: "success",
              salesOrders: ordenesDeVenta,
              socketServerId: data.socketServerId,
              dbuser: gdbuser,
              dbuserpass: gdbuserpass,
              battery: gBatteryLevel,
              routeid: gCurrentRoute,
              warehouse: gPreSaleWhs
            });
          },
          resultado => {
            socketIo.emit("GetSalesOrderForValidationInBo_response", {
              option: "fail",
              salesOrders: [],
              socketServerId: data.socketServerId,
              message: resultado.mensaje,
              dbuser: gdbuser,
              dbuserpass: gdbuserpass,
              battery: gBatteryLevel,
              routeid: gCurrentRoute,
              warehouse: gPreSaleWhs
            });
          }
        );
      });

      socketIo.on("markSalesOrdersAsPostedAndValidated", data => {
        let ordenDeVentaServicio: OrdenDeVentaServicio = new OrdenDeVentaServicio();
        ordenDeVentaServicio.marcarOrdenesDeVentaComoPosteadasYValidadasDesdeBo(
          data.ordenesDeVenta,
          () => {
            socketIo.emit("markSalesOrdersAsPostedAndValidated_response", {
              option: "success",
              socketServerId: data.socketServerId,
              dbuser: gdbuser,
              dbuserpass: gdbuserpass,
              battery: gBatteryLevel,
              routeid: gCurrentRoute,
              warehouse: gPreSaleWhs
            });
          },
          resultado => {
            socketIo.emit("markSalesOrdersAsPostedAndValidated_response", {
              option: "fail",
              socketServerId: data.socketServerId,
              message: resultado.mensaje,
              dbuser: gdbuser,
              dbuserpass: gdbuserpass,
              battery: gBatteryLevel,
              routeid: gCurrentRoute,
              warehouse: gPreSaleWhs
            });
          }
        );
      });

      socketIo.on("insertHistoryOfPromo_response", data => {
        switch (data.option) {
          case "success":
            MarcarHistoricoDePromocionesComoPosteado(data.recordset);
            break;
          case "fail":
            notify(data.message);
            break;
        }
      });

      socketIo.on("AddMicrosurveyByClientResponse", data => {
        switch (data.option) {
          case "success":
            if (data.recordset && data.recordset.length > 0) {
              let encuestaServicio = new EncuestaServicio();
              encuestaServicio.actualizarEstadoDePosteoDeEncuesta(
                data.recordset
              );
            }
            break;
          case "fail":
            console.log({ "Error al postear encuestas por cliente": data });
            break;
          default:
            console.log({ "Error al postear encuestas por cliente": data });
            break;
        }
      });

      socketIo.on("AddOverdueInvoicePaymentResponse", data => {
        switch (data.option) {
          case "success":
            let pagoServicio: PagoDeFacturaVencidaServicio = new PagoDeFacturaVencidaServicio();
            pagoServicio.marcarDocumentosDePagoComoPosteadosEnElServidor(
              data.recordsets
            );
            pagoServicio = null;
            break;
          case "fail":
            notify(
              `Error al postear documentos de pago de facturas vencidas en el servidor debido a: ${
              data.message
              }`
            );
            break;
        }
      });

      socketIo.on("add_to_bank_accounts", data => {
        var query: string =
          "INSERT INTO BANK_ACCOUNTS(BANK, ACCOUNT_BASE, ACCOUNT_NAME, ACCOUNT_NUMBER) VALUES('" +
          data.row.ACCOUNT_BANK +
          "','" +
          data.row.ACCOUNT_BASE +
          "','" +
          data.row.ACCOUNT_NAME +
          "','" +
          data.row.ACCOUNT_NUMBER +
          "')";

        gInsertsInitialRoute.push(query);
      });

      // posteo de documentos de pago de facturas vencidas
      socketIo.on("AddOverdueInvoicePaymentResponse", data => {
        switch (data.option) {
          case "success":
            let pagoServicio: PagoDeFacturaVencidaServicio = new PagoDeFacturaVencidaServicio();
            pagoServicio.marcarDocumentosDePagoComoPosteadosEnElServidor(
              data.recordsets
            );
            pagoServicio = null;
            break;
          case "fail":
            notify(
              `Error al postear documentos de pago de facturas vencidas en el servidor debido a: ${
              data.message
              }`
            );
            break;
        }
      });
    } catch (e) {
      notify("Error al intentar delegar sockets: " + e.message);
    }
  }
}

//Funciones Varias
function ObtenerInsertTareaGU(cliente, codigoTarea, tipoTarea) {
  var fechaActual = getDateTime();
  var sql = "";
  sql =
    "INSERT INTO TASK (" +
    "TASK_ID" +
    " ,TASK_TYPE" +
    " ,TASK_DATE" +
    " ,SCHEDULE_FOR" +
    " ,CREATED_STAMP" +
    " ,ASSIGEND_TO" +
    " ,ASSIGNED_BY" +
    " ,ACCEPTED_STAMP" +
    " ,COMPLETED_STAMP" +
    " ,EXPECTED_GPS" +
    " ,POSTED_GPS" +
    " ,TASK_COMMENTS" +
    " ,TASK_SEQ" +
    " ,TASK_ADDRESS" +
    " ,RELATED_CLIENT_CODE" +
    " ,RELATED_CLIENT_NAME" +
    " ,TASK_STATUS" +
    " ,IS_POSTED" +
    " ,IN_PLAN_ROUTE" +
    " ,CREATE_BY" +
    " ,TASK_BO_ID" +
    ")" +
    " SELECT " +
    parseInt(codigoTarea) +
    ",'" +
    tipoTarea +
    "'" +
    ",'" +
    fechaActual +
    "'" +
    ",'" +
    fechaActual +
    "'" +
    ",'" +
    fechaActual +
    "'" +
    ",'" +
    gLastLogin +
    "'" +
    ",'" +
    gLastLogin +
    "'" +
    ",null" +
    ",null" +
    ",'" +
    gCurrentGPS +
    "'" +
    ",null" +
    ",'Tarea generada para nuevo cliente " +
    cliente.CUSTOMER_NAME +
    "'" +
    ",0" +
    ",'" +
    cliente.TASK_ADDRESS +
    "'" +
    ",'" +
    cliente.CUSTOMER_CODE +
    "'" +
    ",'" +
    cliente.CUSTOMER_NAME +
    "'" +
    ",'ASSIGNED'" +
    ",2" +
    ",1" +
    ",'BY_CALENDAR' " +
    "," +
    parseInt(codigoTarea) +
    " WHERE NOT EXISTS(SELECT 1 FROM TASK WHERE TASK_ID= " +
    codigoTarea +
    ") ";

  return sql;
}

function almacenarParametroEnElLocalStorage(parametro: any) {
  switch (parametro.PARAMETER_ID) {
    case "TAX_ID":
      localStorage.setItem("TAX_ID", parametro.VALUE);
      break;
    case "INVOICE_NAME":
      localStorage.setItem("INVOICE_NAME", parametro.VALUE);
      break;
    case "SECONDS_FOR_SYNCHRONIZATION_OF_DATA":
      localStorage.setItem(
        "SECONDS_FOR_SYNCHRONIZATION_OF_DATA",
        parametro.VALUE
      );
      break;
  }
}
