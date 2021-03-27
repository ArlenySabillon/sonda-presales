var _enviandoClientes = false;
var _enviandoFacturas = false;
var _enviandoPagos = false;
var _enviandoConsignaciones = false;
var _enviandoTareas = false;
var _enviandoEtiquetasPorCliente = false;
var _enviandoOrdenesDeCompra = false;
var _enviandoNumeroDeImprecionesDeOrdenesDeVenta = false;
var _enviandoNumeroDeSecuenciaDeDocumentos = false;
var _enviandoOrdenesDeVentaAnuladas = false;
var _enviandoInventarioReservadoPorOrdenesDeVentaAnuladas = false;
var _enviandoBorradoresDeOrdenesDeCompra = false;
var _enviandoActualizacionesBorradoresDeOrdenesDeCompra = false;
var _enviandoTomaDeInventario = false;
var _enviandoCambiosDeClientes = false;
var _enviandoValidacionDeOrdenesDeVenta = false;
var _enviandoHistoricoDePromociones = false;
var _enviandoEncuestasDeCliente = false;
var _enviandoDocumentosDePagoDeFacturasVencidas = false;

function DelegarASincronizacion() {
  $("#UiBtnEnviarDatos").bind("touchstart", function() {
    ToastThis("Se enviaran todos los datos");
    EnviarDatosBajoDemanda(
      function() {
        ToastThis("Se han enviado todos los datos");
      },
      function(err) {
        notify("Error al enviar datos: " + err.message);
      }
    );
  });
}

function ActualizarClienteNuevoHandHeld(clienteNuevo, callback, errCallback) {
  if (gClientID === clienteNuevo.client.CodigoHH) {
    gClientID = clienteNuevo.client.CodigoBo;
  }
  if (
    _preSalesControllerCustomer != undefined &&
    _preSalesControllerCustomer.CustomerId ===
      delete clienteNuevo.client.CodigoHH
  ) {
    _preSalesControllerCustomer.CustomerId = clienteNuevo.client.CodigoBo;
  }

  SONDA_DB_Session.transaction(
    function(tx) {
      //ACTUALIZA EN BASE DE DATOS LOCAL EL CLIENTE NUEVO
      var sql =
        "UPDATE CLIENTS SET IS_POSTED = 2 " +
        ",CLIENT_ID = '" +
        clienteNuevo.client.CodigoBo +
        "' " +
        ", SERVER_POSTED_DATETIME = '" +
        clienteNuevo.client.ServerPostedDateTime +
        "' " +
        ",SYNC_ID = NULL WHERE CLIENT_ID = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sql);

      sql =
        "UPDATE CLIENTS_FREQUENCY SET CODE_CUSTOMER = '" +
        clienteNuevo.client.CodigoBo +
        "'  WHERE CODE_CUSTOMER = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sql);

      sql =
        "UPDATE TAGS_X_CUSTOMER SET CUSTOMER_SYNC = 1, CUSTOMER = '" +
        clienteNuevo.client.CodigoBo +
        "' WHERE CUSTOMER = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sql);

      //ACTUALIZA EN BASE DE DATOS LOCAL LAS TAREAS ASIGNADAS A ESE CLIENTE

      sql =
        "UPDATE SALES_ORDER_HEADER SET CLIENT_ID = '" +
        clienteNuevo.client.CodigoBo +
        "'  WHERE CLIENT_ID = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sql);

      var sqltask =
        "UPDATE PRESALES_ROUTE SET RELATED_CLIENT_CODE = '" +
        clienteNuevo.client.CodigoBo +
        "'  WHERE RELATED_CLIENT_CODE = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sqltask);

      sql =
        "UPDATE PAYMENT_HEADER SET CLIENT_ID = '" +
        clienteNuevo.client.CodigoBo +
        "'  WHERE CLIENT_ID = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sql);

      sql =
        "UPDATE TASK SET RELATED_CLIENT_CODE = '" +
        clienteNuevo.client.CodigoBo +
        "'  WHERE RELATED_CLIENT_CODE = '" +
        clienteNuevo.client.CodigoHH +
        "'";
      tx.executeSql(sql);

      callback();
    },
    function(err) {
      if (err.code !== 0) errCallback(err);
    }
  );
}

function ObtenerPagosNoPosteados(callback, errCallBack, pagos) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT *  ";
      sql += " FROM PAYMENT_HEADER ";
      sql += " WHERE IS_POSTED IN (0,1)";
      sql += " AND substr(CLIENT_ID,1,1 ) <> '-'";
      sql += " ORDER BY POSTED_DATETIME";

      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
            var pago = {
              PaymentNum: results.rows.item(i).PAYMENT_NUM,
              PostedDatetime: results.rows.item(i).POSTED_DATETIME,
              ClientId: results.rows.item(i).CLIENT_ID,
              ClientName: results.rows.item(i).CLIENT_NAME,
              PosTerminal: results.rows.item(i).POS_TERMINAL,
              Gps: results.rows.item(i).GPS,
              DocDate: results.rows.item(i).DOC_DATE,
              DepositToDate: results.rows.item(i).DEPOSIT_TO_DATE,
              TotalAmount: results.rows.item(i).TOTAL_AMOUNT,
              IsPosted: results.rows.item(i).IS_POSTED,
              Status: results.rows.item(i).STATUS,
              DocSerie: results.rows.item(i).DOC_SERIE,
              DocNum: results.rows.item(i).DOC_NUM,
              PaymentRows: Array()
            };
            pagos.push(pago);
          }
          callback(pagos);
        },
        function(tx, err) {
          if (err.code !== 0) errCallBack(err);
        }
      );
    },
    function(err) {
      errCallBack(err);
    }
  );
}

function ObtenerLineasDePagosNoPosteados(
  pago,
  errCallBack,
  pagos,
  i,
  callback,
  returncallBack
) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT * ";
      sql += " FROM PAYMENT_DETAIL ";
      sql += " WHERE PAYMENT_NUM=" + pago.PaymentNum + "";
      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          for (var j = 0; j < results.rows.length; j++) {
            var detPago = {
              PaymentNum: results.rows.item(j).PAYMENT_NUM,
              LineNum: results.rows.item(j).LINE_NUM,
              InvoiceNum: results.rows.item(j).INVOICE_NUM,
              SatSerie: results.rows.item(j).INVOICE_SERIE,
              PaymentType: results.rows.item(j).PAYMENT_TYPE,
              DocDate: results.rows.item(j).DOC_DATE,
              DocNum: results.rows.item(j).DOC_NUM,
              Image: results.rows.item(j).IMAGE,
              BankId: results.rows.item(j).BANK_ID,
              AccountNum: results.rows.item(j).ACCOUNT_NUM,
              AmountPaid: results.rows.item(j).AMOUNT_PAID,
              PaymentId: results.rows.item(j).ID,
              DocumentNumber: results.rows.item(j).DOCUMENT_NUMBER,
              SourceDocType: results.rows.item(j).SOURCE_DOC_TYPE,
              SourceDocSerie: results.rows.item(j).SOURCE_DOC_SERIE,
              SourceDocNum: results.rows.item(j).SOURCE_DOC_NUM,
              Image1: results.rows.item(j).IMAGE_1,
              Image2: results.rows.item(j).IMAGE_2
            };
            pago.PaymentRows.push(detPago);
          }
          pagos = callback(pagos, i, pago);

          if (pagos.length - 1 === i) {
            returncallBack(pagos);
          }
        },
        function(tx, err) {
          if (err.code !== 0) errCallBack(err);
        }
      );
    },
    function(err) {
      errCallBack(err);
    }
  );
}

function ObtenerDetalleDePagosNoPosteados(callback, errCallBack, pagos) {
  var i;
  for (i = 0; i < pagos.length; i++) {
    ObtenerLineasDePagosNoPosteados(
      pagos[i],
      errCallBack,
      pagos,
      i,
      function(pagosm, index, pago) {
        pagosm[index] = pago;
        return pagosm;
      },
      callback
    );
  }
  if (i === 0) {
    callback(pagos);
  }
}

function ActualizarEnvioPagos(data, callback, errCallBack) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "UPDATE PAYMENT_HEADER";
      sql += " SET IS_POSTED=1";
      sql += " WHERE";
      sql += " PAYMENT_NUM =" + data.PaymentNum;
      console.log(sql);
      tx.executeSql(sql);
    },
    function(err) {
      errCallBack(err);
    },
    function() {
      callback(data);
    }
  );
}

function EnviarPagos(callback, errCallback) {
  if (_enviandoPagos) {
    callback();
    return;
  }
  _enviandoPagos = true;
  var pagos = Array();
  ObtenerPagosNoPosteados(
    function(pagos) {
      ObtenerDetalleDePagosNoPosteados(
        function(pagos) {
          for (var i = 0; i < pagos.length; i++) {
            var data = {
              payment: pagos[i],
              dbuser: gdbuser,
              dbuserpass: gdbuserpass,
              battery: gBatteryLevel,
              routeid: gCurrentRoute
            };
            socket.emit("SendPayment", data);
          }
          _enviandoPagos = false;
        },
        errCallback,
        pagos
      );
    },
    errCallback,
    pagos
  );
}

function ObtenerClientessNoPosteados(callback, errCallBack, clientes) {
  var fecha = getDateTime().split(" ");
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT * ";
      sql += " FROM CLIENTS ";
      sql += " WHERE IS_POSTED IN (0,1)";

      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
            var cliente = {
              CodigoHH: results.rows.item(i).CLIENT_ID,
              CodigoBo: null,
              Nombre: results.rows.item(i).CLIENT_NAME,
              Telefono: results.rows.item(i).PHONE,
              Direccion: results.rows.item(i).ADDRESS,
              Ruta: gCurrentRoute,
              Seller_code: gLoggedUser,
              loginid: gLoggedUser,
              PostedDatetime: getDateTime(),
              ContactCustomer: results.rows.item(i).CONTACT_CUSTOMER,
              Sign: results.rows.item(i).SIGN,
              Photo: results.rows.item(i).PHOTO,
              Status: results.rows.item(i).STATUS,
              New: results.rows.item(i).NEW,
              Gps: results.rows.item(i).GPS,
              Reference: results.rows.item(i).REFERENCE,
              PostDateTime: results.rows.item(i).POST_DATETIME,
              PosSaleName: results.rows.item(i).POS_SALE_NAME,
              InvoiceName: results.rows.item(i).INVOICE_NAME,
              InvoiceAddress: results.rows.item(i).INVOICE_ADDRESS,
              Nit: results.rows.item(i).NIT,
              ContactId: results.rows.item(i).CONTACT_ID,
              DiasVisita: Array(),
              UpdatedFromBo: results.rows.item(i).UPDATED_FROM_BO,
              OwnerId: results.rows.item(i).OWNER_ID,
              SyncId:
                results.rows.item(i).SYNC_ID === "null" ||
                results.rows.item(i).SYNC_ID === null ||
                results.rows.item(i).SYNC_ID === "undefined"
                  ? gCurrentRoute +
                    fecha[0] +
                    fecha[1] +
                    results.rows.item(i).CLIENT_ID
                  : results.rows.item(i).SYNC_ID,
              ServerPostedDateTime: "",
              DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
              IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE
            };
            clientes.push(cliente);
          }
          callback(clientes);
        },
        function(tx, err) {
          if (err.code !== 0) errCallBack(err);
        }
      );
    },
    function(err) {
      errCallBack(err);
    }
  );
}

function ObtenerLineasDeFrecuencioasNoPosteados(
  cliente,
  errCallBack,
  clientes,
  i,
  callback,
  returncallBack
) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT *";
      sql += " FROM CLIENTS_FREQUENCY";
      sql += " WHERE CODE_CUSTOMER='" + cliente.CodigoHH + "'";
      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          for (var j = 0; j < results.rows.length; j++) {
            var frecuencia = {
              CodeCustiner: results.rows.item(j).CODE_CUSTOMER,
              Sunday: results.rows.item(j).SUNDAY,
              Monday: results.rows.item(j).MONDAY,
              Tuesday: results.rows.item(j).TUESDAY,
              Wednesday: results.rows.item(j).WEDNESDAY,
              Thursday: results.rows.item(j).THURSDAY,
              Friday: results.rows.item(j).FRIDAY,
              Saturday: results.rows.item(j).SATURDAY,
              FrequencyWeeks: results.rows.item(j).FREQUENCY_WEEKS,
              LastDateVisited: results.rows.item(j).LAST_DATE_VISITED
            };
            cliente.DiasVisita.push(frecuencia);
          }
          clientes = callback(clientes, i, cliente);

          if (clientes.length - 1 === i) {
            returncallBack(clientes);
          }
        },
        function(tx, err) {
          if (err.code !== 0) errCallBack(err);
        }
      );
    },
    function(err) {
      errCallBack(err);
    }
  );
}

function ObtenerFrecuenciaDeClientesNoPosteados(
  callback,
  errCallBack,
  clientes
) {
  var i;
  for (i = 0; i < clientes.length; i++) {
    ObtenerLineasDeFrecuencioasNoPosteados(
      clientes[i],
      errCallBack,
      clientes,
      i,
      function(clientesN1, index, cliente) {
        clientesN1[index] = cliente;
        return clientesN1;
      },
      callback
    );
  }
  if (i === 0) {
    callback(clientes);
  }
}

function ActualizarEnvioCliente(pData, callback, errCallBack) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "UPDATE CLIENTS";
      sql += " SET IS_POSTED=1, SYNC_ID = NULL ";
      sql += " WHERE";
      sql += " CLIENT_ID ='" + pData.client.CodigoHH + "'";
      console.log(sql);
      tx.executeSql(sql);
    },
    function(err) {
      errCallBack(err);
    },
    function() {
      callback(pData);
    }
  );
}

function EnviarClientesNoPosteados(callback, errCallback) {
  if (_enviandoClientes) {
    callback();
    return;
  }
  _enviandoClientes = true;
  var clientes = Array();
  ObtenerClientessNoPosteados(
    function(clientesN1) {
      ObtenerFrecuenciaDeClientesNoPosteados(
        function(clientesN2) {
          for (var i = 0; i < clientesN2.length; i++) {
            var data = {
              client: clientesN2[i],
              dbuser: gdbuser,
              dbuserpass: gdbuserpass,
              battery: gBatteryLevel,
              routeid: gCurrentRoute,
              uuid: device.uuid
            };
            ActualizarEnvioCliente(
              data,
              function(pData) {
                socket.emit("insert_new_client", pData);
              },
              function(err) {
                ToastThis(err.message);
              }
            );
          }
          _enviandoClientes = false;
        },
        errCallback,
        clientesN1
      );
    },
    errCallback,
    clientes
  );
}

function EnviarClientes(callback, errCallback) {
  EnviarClientesNoPosteados(callback, errCallback);
}

///*********************ENVIO DE ETIQUETAS POR CLIENTE *********************/

function EnviarEtiquetas(callback, errCallback) {
  EnviarEtiquetasNoPosteados(callback, errCallback);
}

function EnviarEtiquetasNoPosteados(callback, errCallback) {
  if (_enviandoEtiquetasPorCliente) {
    callback();
    return;
  }
  _enviandoEtiquetasPorCliente = true;

  ObtenerEtiquetasPorClienteNoPosteados(function(etiquetasPoCliente) {
    for (var i = 0; i < etiquetasPoCliente.length; i++) {
      var data = {
        tagscolor: etiquetasPoCliente[i].TAG_COLOR,
        customer: etiquetasPoCliente[i].CUSTOMER,
        deviceNetworkType: etiquetasPoCliente[i].DEVICE_NETWORK_TYPE,
        isPostedOffLine: etiquetasPoCliente[i].IS_POSTED_OFFLINE,
        dbuser: gdbuser,
        dbuserpass: gdbuserpass,
        battery: gBatteryLevel,
        routeid: gCurrentRoute
      };
      console.log(data.toString());
      socket.emit("insert_tags_x_client", data);
    }
    _enviandoEtiquetasPorCliente = false;
  }, errCallback);
}

function ActualizarEnvioEtiquetaClienteError(pData) {
  SONDA_DB_Session.transaction(function(tx) {
    var sql = "UPDATE TAGS_X_CUSTOMER";
    sql += " SET IS_POSTED=1";
    sql += " WHERE CLIENT_ID ='" + pData.data.CUSTOMER + "'";
    sql += " AND TAG_COLOR ='" + pData.data.TAG_COLOR + "'";
    console.log(sql);
    tx.executeSql(sql);
  });
}

function ObtenerEtiquetasPorClienteNoPosteados(callback, errCallBack) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT ";
      sql += " TAG_COLOR ";
      sql += " , CUSTOMER" + ", DEVICE_NETWORK_TYPE" + ", IS_POSTED_OFFLINE";
      sql += " FROM TAGS_X_CUSTOMER ";
      sql += " WHERE IS_POSTED IN (0,1)";
      sql += " AND CUSTOMER_SYNC = 1";

      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          var etiquetasPorCliente = Array();
          for (var i = 0; i < results.rows.length; i++) {
            var item = {
              TAG_COLOR: results.rows.item(i).TAG_COLOR,
              CUSTOMER: results.rows.item(i).CUSTOMER,
              DEVICE_NETWORK_TYPE: results.rows.item(i).DEVICE_NETWORK_TYPE,
              IS_POSTED_OFFLINE: results.rows.item(i).IS_POSTED_OFFLINE
            };
            etiquetasPorCliente.push(item);
          }
          callback(etiquetasPorCliente);
        },
        function(tx, err) {
          if (err.code !== 0) errCallBack(err);
        }
      );
    },
    function(err) {
      errCallBack(err);
    }
  );
}

function ActualizarEtiqutaPorClienteHandHeld(etiquetaPorCliente) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql =
        "UPDATE TAGS_X_CUSTOMER SET IS_POSTED = 2 WHERE TAG_COLOR = '" +
        etiquetaPorCliente.tagscolor +
        "' AND CUSTOMER = '" +
        etiquetaPorCliente.customer +
        "'";
      tx.executeSql(sql);
    },
    function(err) {
      if (err.code !== 0) notify(err.message);
    }
  );
}

///*********************ENVIO DE TAREAS *********************/
{
  function MarcarTareasComoSincronizada(task) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE TASK";
        sql += " SET IS_POSTED=2";
        sql += ", TASK_BO_ID = " + task.TaskBoId;
        sql += " WHERE";
        sql += " TASK_ID =" + task.TaskId;
        console.log(sql);
        tx.executeSql(sql);

        sql = "UPDATE SALES_ORDER_HEADER";
        sql += " SET";
        sql += " TASK_ID_BO = " + task.TaskBoId;
        sql += " WHERE";
        sql += " TASK_ID =" + task.TaskId;
        console.log(sql);
        tx.executeSql(sql);

        EnviarDataSinClientes();
      },
      function(err) {
        ToastThis(err.message);
      },
      function() {}
    );
  }

  function ObtenerTareasNoPosteados(callback, errCallBack, tareas) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT DISTINCT *  ";
        sql += " FROM TASK ";
        sql += " WHERE IS_POSTED IN (0,1)";
        sql += " AND substr(RELATED_CLIENT_CODE,1,1 ) <> '-'";
        sql += " AND TASK_TYPE <> 'DELIVERY'";
        sql += " ORDER BY CREATED_STAMP";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var tarea = {
                TaskId: results.rows.item(i).TASK_ID,
                TaskType: results.rows.item(i).TASK_TYPE,
                TaskDate: results.rows.item(i).TASK_DATE,
                ScheduleFor: results.rows.item(i).SCHEDULE_FOR,
                CreatedStamp: results.rows.item(i).CREATED_STAMP,
                AssigendTo: results.rows.item(i).ASSIGEND_TO,
                AssignedBy: results.rows.item(i).ASSIGNED_BY,
                AcceptedStamp: results.rows.item(i).ACCEPTED_STAMP,
                CompletedStamp: results.rows.item(i).COMPLETED_STAMP,
                ExpectedGps: results.rows.item(i).EXPECTED_GPS,
                PostedGps: results.rows.item(i).POSTED_GPS,
                TaskComments: results.rows.item(i).TASK_COMMENTS,
                TaskSeq: results.rows.item(i).TASK_SEQ,
                TaskAddress: results.rows.item(i).TASK_ADDRESS,
                RelatedClientCode: results.rows.item(i).RELATED_CLIENT_CODE,
                RelatedClientName: results.rows.item(i).RELATED_CLIENT_NAME,
                TaskStatus: results.rows.item(i).TASK_STATUS,
                IsPosted: results.rows.item(i).IS_POSTED,
                TaskBoId: results.rows.item(i).TASK_BO_ID,
                CreateBy: results.rows.item(i).CREATE_BY,
                CompletedSuccessfully: results.rows.item(i)
                  .COMPLETED_SUCCESSFULLY,
                Reason: results.rows.item(i).REASON,
                InPlanRoute: results.rows.item(i).IN_PLAN_ROUTE,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE
              };
              tareas.push(tarea);
            }
            callback(tareas);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function EnviarTareas(callback, errCallback) {
    if (_enviandoTareas) {
      callback();
      return;
    }
    _enviandoTareas = true;
    var tareas = Array();
    ObtenerTareasNoPosteados(
      function(tareasN1) {
        for (var i = 0; i < tareasN1.length; i++) {
          var data = {
            task: tareasN1[i],
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            battery: gBatteryLevel,
            routeid: gCurrentRoute
          };
          socket.emit("SendTask", data);
        }
        _enviandoTareas = false;
      },
      errCallback,
      tareas
    );
  }

  function ActualizarEnvioTarea(data, callback, errCallback) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE TASK ";
        sql += "SET IS_POSTED=1 ";
        sql += "WHERE ";
        sql += " TASK_ID =" + data.TaskId;
        tx.executeSql(sql);
      },
      function(err) {
        errCallback(err);
      },
      function() {
        callback(data);
      }
    );
  }
}

///*********************ENVIO DE ORDES DE COMPRA *********************/
{
  function ObtenerOrdernesDeCompraNoPosteados(
    callback,
    errCallBack,
    ordenesDeCompra,
    usaFiltro
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT DISTINCT *";
        sql += " FROM SALES_ORDER_HEADER ";
        if (usaFiltro) {
          sql += " WHERE IS_POSTED IN (0,1)";
          sql += " AND substr(CLIENT_ID,1,1 ) <> '-'";
          sql += " AND IFNULL(TASK_ID_BO,0) > 0";
          sql += " AND IS_DRAFT = 0";
        }
        sql += " ORDER BY POSTED_DATETIME";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var ordenDeCompra = {
                SalesOrderId: results.rows.item(i).SALES_ORDER_ID,
                Terms: results.rows.item(i).TERMS,
                PostedDatetime: results.rows.item(i).POSTED_DATETIME,
                ClientId: results.rows.item(i).CLIENT_ID,
                PosTerminal: results.rows.item(i).POS_TERMINAL,
                GpsUrl: results.rows.item(i).GPS_URL,
                TotalAmount: results.rows.item(i).TOTAL_AMOUNT,
                Status: results.rows.item(i).STATUS,
                PostedBy: results.rows.item(i).POSTED_BY,
                Image1: results.rows.item(i).IMAGE_1,
                Image2: results.rows.item(i).IMAGE_2,
                Image3: results.rows.item(i).IMAGE_3,
                DeviceBatteryFactor: results.rows.item(i).DEVICE_BATTERY_FACTOR,
                VoidDatetime: results.rows.item(i).VOID_DATETIME,
                VoidReason: results.rows.item(i).VOID_REASON,
                VoidNotes: results.rows.item(i).VOID_NOTES,
                Voided: results.rows.item(i).VOIDED,
                ClosedRouteDatetime: results.rows.item(i).CLOSED_ROUTE_DATETIME,
                IsActiveRoute: results.rows.item(i).IS_ACTIVE_ROUTE,
                GpsExpected: results.rows.item(i).GPS_EXPECTED,
                SalesOrderIdBo: results.rows.item(i).SALES_ORDER_ID_BO,
                DeliveryDate: results.rows.item(i).DELIVERY_DATE,
                IsParent: results.rows.item(i).IS_PARENT,
                ReferenceId: results.rows.item(i).REFERENCE_ID,
                TimesPrinted: results.rows.item(i).TIMES_PRINTED,
                DocSerie: results.rows.item(i).DOC_SERIE,
                DocNum: results.rows.item(i).DOC_NUM,
                IsVoid: results.rows.item(i).IS_VOID,
                SalesOrderType: results.rows.item(i).SALES_ORDER_TYPE,
                Discount: results.rows.item(i).DISCOUNT_BY_GENERAL_AMOUNT,
                IsDraft: results.rows.item(i).IS_DRAFT,
                TaskId: results.rows.item(i).TASK_ID_BO,
                Comment: results.rows.item(i).COMMENT,
                IsPosted: results.rows.item(i).IS_POSTED,
                Sinc: results.rows.item(i).SINC,
                IsPostedVoid: results.rows.item(i).IS_POSTED_VOID,
                IsUpdated: results.rows.item(i).IS_UPDATED,
                PaymentTimesPrinted: results.rows.item(i).PAYMENT_TIMES_PRINTED,
                PaidToDate: results.rows.item(i).PAID_TO_DATE,
                ToBill: results.rows.item(i).TO_BILL,
                Authorized: results.rows.item(i).AUTHORIZED,
                DetailQty: results.rows.item(i).DETAIL_QTY,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffline: results.rows.item(i).IS_POSTED_OFFLINE,
                GoalHeaderId: results.rows.item(i).GOAL_HEADER_ID,
                TotalAmountDisplay: results.rows.item(i).TOTAL_AMOUNT_DISPLAY,
                SaleDetails: []
              };
              ordenesDeCompra.push(ordenDeCompra);
            }
            callback(ordenesDeCompra);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerLineasDeOrdernesDeCompraNoPosteados(
    ordenDeCompra,
    errCallBack,
    ordenesDeCompra,
    i,
    callback,
    returncallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT * ";
        sql += " FROM SALES_ORDER_DETAIL ";
        sql += " WHERE SALES_ORDER_ID=" + ordenDeCompra.SalesOrderId + "";
        sql += " AND DOC_SERIE = '" + ordenDeCompra.DocSerie + "'";
        sql += " AND DOC_NUM =" + ordenDeCompra.DocNum + "";
        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var j = 0; j < results.rows.length; j++) {
              var detOrdenDeCompra = {
                SalesOrderId: results.rows.item(j).SALES_ORDER_ID,
                Sku: results.rows.item(j).SKU,
                LineSeq: results.rows.item(j).LINE_SEQ,
                Qty: results.rows.item(j).QTY,
                Price: results.rows.item(j).PRICE,
                Discount: results.rows.item(j).DISCOUNT,
                TotalLine: results.rows.item(j).TOTAL_LINE,
                PostedDatetime: results.rows.item(j).POSTED_DATETIME,
                Serie: results.rows.item(j).SERIE,
                Serie2: results.rows.item(j).SERIE_2,
                RequeriesSerie: results.rows.item(j).REQUERIES_SERIE,
                ComboReference: results.rows.item(j).COMBO_REFERENCE,
                ParentSeq: results.rows.item(j).PARENT_SEQ,
                IsActiveRoute: results.rows.item(j).IS_ACTIVE_ROUTE,
                CodePackUnit: results.rows.item(j).CODE_PACK_UNIT,
                IsBonus: results.rows.item(j).IS_BONUS,
                IsPostedVoid: results.rows.item(j).IS_POSTED_VOID,
                Long: results.rows.item(j).LONG,
                DiscountType: results.rows.item(j).DISCOUNT_TYPE,
                DiscountByFamily: results.rows.item(j).DISCOUNT_BY_FAMILY,
                DiscountByGeneralAmount: results.rows.item(j)
                  .DISCOUNT_BY_GENERAL_AMOUNT,
                DiscountByFamilyAndPaymentType: results.rows.item(j)
                  .DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE,
                TypeOfDiscountByFamily: results.rows.item(j)
                  .TYPE_OF_DISCOUNT_BY_FAMILY,
                TypeOfDiscountByGeneralAmount: results.rows.item(j)
                  .TYPE_OF_DISCOUNT_BY_GENERAL_AMOUNT,
                TypeOfDiscountByFamilyAndPaymentType: results.rows.item(j)
                  .TYPE_OF_DISCOUNT_BY_FAMILY_AND_PAYMENT_TYPE,
                BasePrice: results.rows.item(j).BASE_PRICE,
                CodeFamily: results.rows.item(j).CODE_FAMILY,
                UniqueDiscountByScaleApplied: results.rows.item(j)
                  .UNIQUE_DISCOUNT_BY_SCALE_APPLIED,
                TotalAmountDisplay: results.rows.item(j).TOTAL_AMOUNT_DISPLAY
              };
              ordenDeCompra.SaleDetails.push(detOrdenDeCompra);
            }
            ordenesDeCompra = callback(ordenesDeCompra, i, ordenDeCompra);

            if (ordenesDeCompra.length - 1 === i) {
              returncallBack(ordenesDeCompra);
            }
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerDetalleDeOrdernesDeCompraNoPosteados(
    callback,
    errCallBack,
    ordenesDeCompra
  ) {
    var i;
    for (i = 0; i < ordenesDeCompra.length; i++) {
      ObtenerLineasDeOrdernesDeCompraNoPosteados(
        ordenesDeCompra[i],
        errCallBack,
        ordenesDeCompra,
        i,
        function(ordenesDeCompraN1, index, ordenDeCompra) {
          ordenesDeCompraN1[index] = ordenDeCompra;
          return ordenesDeCompraN1;
        },
        callback
      );
    }
    if (i === 0) {
      callback(ordenesDeCompra);
    }
  }

  function ActualizarEnvioDeOrdernesDeCompra(data, callback, errCallBack) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE SALES_ORDER_HEADER";
        sql += " SET IS_POSTED=1";
        sql += " WHERE";
        sql += " SALES_ORDER_ID =" + data.SalesOrderId;
        sql += " AND DOC_SERIE ='" + data.DocSerie + "'";
        sql += " AND DOC_NUM =" + data.DocNum;

        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  function EnviarOrdenDeVenta(ordenesdeCompra, index, esUltimo) {
    var data = {
      salesOrder: ordenesdeCompra[index],
      dbuser: gdbuser,
      dbuserpass: gdbuserpass,
      battery: gBatteryLevel,
      routeid: gCurrentRoute,
      warehouse: gPreSaleWhs,
      uuid: device.uuid
    };
    socket.emit("SendSalesOrder", data);
    if (esUltimo) return;
    setTimeout(function() {
      var actual = index + 1;
      EnviarOrdenDeVenta(
        ordenesdeCompra,
        actual,
        ordenesdeCompra.length - 1 === actual
      );
    }, 5000);
  }

  function EnviarOrdenesDeVenta(callback, errCallback) {
    if (_enviandoOrdenesDeCompra) {
      callback();
      return;
    }
    _enviandoOrdenesDeCompra = true;
    var ordenesDeCompra = Array();
    ObtenerOrdernesDeCompraNoPosteados(
      function(ordenesDeCompraN1) {
        ObtenerDetalleDeOrdernesDeCompraNoPosteados(
          function(ordenesDeCompraN2) {
            if (ordenesDeCompraN2.length > 0)
              EnviarOrdenDeVenta(
                ordenesDeCompraN2,
                0,
                ordenesDeCompraN2.length - 1 === 0
              );
            _enviandoOrdenesDeCompra = false;
          },
          errCallback,
          ordenesDeCompraN1
        );
      },
      errCallback,
      ordenesDeCompra,
      true
    );
  }
}

///*********************ENVIO DE NUMERO DE IMPRECIONES ORDES DE COMPRA *********************/
{
  function ObtenerNumeroDeImprecionesDeOrdernesDeCompraNoPosteados(
    callback,
    errCallBack,
    ordenesDeCompra
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *";
        sql += " FROM SALES_ORDER_HEADER ";
        sql += " WHERE IS_POSTED = 2";
        sql += " AND substr(CLIENT_ID,1,1 ) <> '-'";
        sql += " AND SINC IN (0,1)";
        sql += " ORDER BY POSTED_DATETIME";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var ordenDeCompra = {
                SalesOrderId: results.rows.item(i).SALES_ORDER_ID_BO,
                DocSerie: results.rows.item(i).DOC_SERIE,
                DocNum: results.rows.item(i).DOC_NUM,
                TimesPrinted: results.rows.item(i).TIMES_PRINTED,
                PaymentTimesPrinted: results.rows.item(i).PAYMENT_TIMES_PRINTED
              };
              ordenesDeCompra.push(ordenDeCompra);
            }
            callback(ordenesDeCompra);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ActualizarEnvioDeNumeroDeImprecionesDeOrdenesDeVenta(
    data,
    callback,
    errCallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE SALES_ORDER_HEADER";
        sql += " SET SINC = " + data.estado;
        sql += " WHERE";
        sql += " SALES_ORDER_ID_BO =" + data.SalesOrderId;
        sql += " AND DOC_SERIE ='" + data.DocSerie + "'";
        sql += " AND DOC_NUM =" + data.DocNum;
        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  function EnviarNumeroDeImprecionesDeOrdenesDeVenta(callback, errCallback) {
    if (_enviandoNumeroDeImprecionesDeOrdenesDeVenta) {
      callback();
      return;
    }
    _enviandoNumeroDeImprecionesDeOrdenesDeVenta = true;
    var ordenesDeCompra = Array();
    ObtenerNumeroDeImprecionesDeOrdernesDeCompraNoPosteados(
      function(ordenesDeCompraN1) {
        for (var i = 0; i < ordenesDeCompraN1.length; i++) {
          var data = {
            salesOrder: ordenesDeCompraN1[i],
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            battery: gBatteryLevel,
            routeid: gCurrentRoute,
            warehouse: gPreSaleWhs
          };
          socket.emit("SendSalesOrderTimesPrinted", data);
        }
        _enviandoNumeroDeImprecionesDeOrdenesDeVenta = false;
      },
      errCallback,
      ordenesDeCompra
    );
  }
}

///*********************ENVIO DE NUMERO DE DOCUMENTO ACTUAL *********************/
{
  function ObtenerNumeroDeSecuenciaDeDocumentos(
    callback,
    errCallBack,
    documentos
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT DOC_TYPE,SERIE,CURRENT_DOC";
        sql += " FROM DOCUMENT_SEQUENCE ";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var documento = {
                DocType: results.rows.item(i).DOC_TYPE,
                Serie: results.rows.item(i).SERIE,
                DocNum: results.rows.item(i).CURRENT_DOC
              };
              documentos.push(documento);
            }
            callback(documentos);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function EnviarNumeroDeSecuenciaDeDocumentos() {
    if (_enviandoNumeroDeSecuenciaDeDocumentos) {
      return;
    }
    _enviandoNumeroDeSecuenciaDeDocumentos = true;
    var documentos = Array();
    ObtenerNumeroDeSecuenciaDeDocumentos(
      function(documentosN1) {
        for (var i = 0; i < documentosN1.length; i++) {
          var data = {
            DocType: documentosN1[i].DocType,
            Serie: documentosN1[i].Serie,
            DocNum: documentosN1[i].DocNum,
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            routeid: gCurrentRoute
          };
          socket.emit("SendDocumentSecuence", data);
        }
        _enviandoNumeroDeSecuenciaDeDocumentos = false;
      },
      function(err) {
        ToastThis(
          "Error al actualizar secuencia de documentos: " + err.message
        );
      },
      documentos
    );
  }
}

///*********************ENVIO DE INVENTARIO ANULADO POR ORDENES DE VENTA ANULADAS *********************/
{
  function ActualizarInventarioReservadoPorOrdenesDeVentaAnuladas(
    data,
    estado,
    callback,
    errCallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE SALES_ORDER_DETAIL";
        sql += " SET IS_POSTED_VOID = " + estado;
        sql += " WHERE SALES_ORDER_ID = " + data.data.SalesOrderId;
        sql += " AND DOC_SERIE  = '" + data.data.DocSerie + "'";
        sql += " AND DOC_NUM = " + data.data.DocNum;
        sql += " AND SKU = '" + data.data.CodeSku + "'";
        sql += " AND QTY = " + data.data.Qty;

        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  function ObtenerInventarioReservadoPorOrdenesDeVentaAnuladas(
    callback,
    errCallBack,
    ordenesDeVenta
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql =
          "SELECT D.SKU, D.QTY, D.SALES_ORDER_ID, D.DOC_NUM, D.DOC_SERIE";
        sql += " FROM SALES_ORDER_DETAIL D";
        sql += " WHERE D.IS_POSTED_VOID IN (0,1)";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var ordenDeVenta = {
                Qty: results.rows.item(i).QTY,
                CodeSku: results.rows.item(i).SKU,
                SalesOrderId: results.rows.item(i).SALES_ORDER_ID,
                DocSerie: results.rows.item(i).DOC_SERIE,
                DocNum: results.rows.item(i).DOC_NUM
              };
              ordenesDeVenta.push(ordenDeVenta);
            }
            callback(ordenesDeVenta);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function EnviarInventarioReservadoPorOrdenesDeVentaAnuladas() {
    if (_enviandoInventarioReservadoPorOrdenesDeVentaAnuladas) {
      return;
    }
    _enviandoInventarioReservadoPorOrdenesDeVentaAnuladas = true;
    var ordenesDeVenta = Array();
    ObtenerInventarioReservadoPorOrdenesDeVentaAnuladas(
      function(ordenesDeVentaN1) {
        for (var i = 0; i < ordenesDeVentaN1.length; i++) {
          var data = {
            Qty: ordenesDeVentaN1[i].Qty,
            CodeSku: ordenesDeVentaN1[i].CodeSku,
            SalesOrderId: ordenesDeVentaN1[i].SalesOrderId,
            DocSerie: ordenesDeVentaN1[i].DocSerie,
            DocNum: ordenesDeVentaN1[i].DocNum,
            warehouse: gPreSaleWhs,
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            routeid: gCurrentRoute
          };
          socket.emit("SendCommitedInventoryVoid", data);
        }
        _enviandoInventarioReservadoPorOrdenesDeVentaAnuladas = false;
      },
      function(err) {
        ToastThis(
          "Error al devolver el invetario reservado por ordenes de venta anuladas: " +
            err.message
        );
      },
      ordenesDeVenta
    );
  }
}

function ObtenerBroadCastPendientes() {
  var data = {
    dbuser: gdbuser,
    dbuserpass: gdbuserpass,
    battery: gBatteryLevel,
    routeid: gCurrentRoute,
    warehouse: gPreSaleWhs
  };
  socket.emit("ObtenerBroadCastPendientes", data);
}

function EnviarData() {
  try {
    if (gIsOnline === 1 && socket.sendBuffer.length === 0) {
      EnviarClientes(function() {}, function() {});

      EnviarDataSinClientes();

      ObtenerBroadcastPerdidos();
    }
  } catch (e) {
    /* empty */
  }
}

function EnviarDataSinClientes() {
  if (gIsOnline) {
    setTimeout(EnviarCambiosDeClientes(function() {}, function(err) {}), 100);

    setTimeout(EnviarPagos(function() {}, function(err) {}), 100);

    setTimeout(EnviarTareas(function() {}, function(err) {}), 100);

    setTimeout(EnviarEtiquetas(function() {}, function(err) {}), 100);

    setTimeout(EnviarOrdenesDeVenta(function() {}, function(err) {}), 100);

    setTimeout(
      EnviarNumeroDeImprecionesDeOrdenesDeVenta(
        function() {},
        function(err) {}
      ),
      100
    );

    setTimeout(EnviarNumeroDeSecuenciaDeDocumentos(), 100);

    setTimeout(EnviarInventarioReservadoPorOrdenesDeVentaAnuladas(), 100);

    setTimeout(
      EnviarBorradoresDeOrdenesDeCompra(function() {}, function(err) {}),
      100
    );

    setTimeout(
      EnviarActualizacionesDeBorradoresDeOrdenesDeCompra(
        function() {},
        function(err) {}
      ),
      100
    );

    setTimeout(EnviarTomasDeInventario(function() {}, function(err) {}), 100);

    setTimeout(function() {
      if (_enviandoHistoricoDePromociones) return;
      enviarHistoricoDePromocionesNoPosteadas();
    }, 200);

    setTimeout(EnviarEncuestasDeClienteNoPosteadas(), 200);

    setTimeout(EnviarDocumentosDePagoDeFacturasVencidas(), 500);
  }
}

///*********************Metodos de Broadcast*********************/

function InsertarNuevaEtiqueta(data, callback, errCallBack) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql =
        "INSERT INTO TAGS(TAG_COLOR,TAG_VALUE_TEXT,TAG_PRIORITY,TAG_COMMENTS)";
      sql += " VALUES (";
      sql += " '" + data.TagColor + "'";
      sql += " ,'" + data.TagValueText + "'";
      sql += " ," + data.TagPriority;
      sql += " ,'" + data.TagComments + "'";
      sql += ");";
      console.log(sql);
      tx.executeSql(sql);
    },
    function(err) {
      errCallBack(err);
    },
    function() {
      callback(data);
    }
  );
}

function ActualizarNuevaEtiqueta(data, callback, errCallBack) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "UPDATE TAGS";
      sql += " SET";
      sql += " TAG_VALUE_TEXT = '" + data.TagValueText + "'";
      sql += " ,TAG_PRIORITY = " + data.TagPriority;
      sql += " ,TAG_COMMENTS = '" + data.TagComments + "'";
      sql += " WHERE TAG_COLOR = '" + data.TagColor + "'";
      console.log(sql);
      tx.executeSql(sql);
    },
    function(err) {
      errCallBack(err);
    },
    function() {
      callback(data);
    }
  );
}

function BroadcastRecivido(id, borrar) {
  console.log("actualizacion de broadcast");
  var data = {
    Id: id,
    Status: "RECEIVED",
    dbuser: gdbuser,
    dbuserpass: gdbuserpass,
    battery: gBatteryLevel,
    routeid: gCurrentRoute
  };
  if (borrar === 1) {
    socket.emit("DeleteBroadcast", data);
  } else {
    socket.emit("UpdateBroadcast", data);
  }
}

function EliminarEtiqueta(data, callback, errCallBack) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "DELETE FROM TAGS";
      sql += " WHERE TAG_COLOR = '" + data.TagColor + "'";
      console.log(sql);
      tx.executeSql(sql);
    },
    function(err) {
      errCallBack(err);
    },
    function() {
      callback(data);
    }
  );
}

function ObtenerBroadcastPerdidos() {
  var data = {
    dbuser: gdbuser,
    dbuserpass: gdbuserpass,
    battery: gBatteryLevel,
    routeid: gCurrentRoute
  };
  socket.emit("GetBroadcastLost", data);
  console.log("ObtenerBroadcastPerdidos");
}

///*********************ENVIO DE BORRADORES DE ORDES DE COMPRA *********************/
{
  //Nuevos Borradores

  function ObtenerBorradoresDeOrdernesDeCompraNoPosteados(
    callback,
    errCallBack,
    ordenesDeCompra
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *";
        sql += " FROM SALES_ORDER_HEADER ";
        sql += " WHERE IS_POSTED IN (0,1)";
        sql += " AND substr(CLIENT_ID,1,1 ) <> '-'";
        sql += " AND IS_DRAFT = 1";
        sql += " ORDER BY POSTED_DATETIME";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var ordenDeCompra = {
                SalesOrderId: results.rows.item(i).SALES_ORDER_ID,
                Terms: results.rows.item(i).TERMS,
                PostedDatetime: results.rows.item(i).POSTED_DATETIME,
                ClientId: results.rows.item(i).CLIENT_ID,
                PosTerminal: results.rows.item(i).POS_TERMINAL,
                GpsUrl: results.rows.item(i).GPS_URL,
                TotalAmount: results.rows.item(i).TOTAL_AMOUNT,
                Status: results.rows.item(i).STATUS,
                PostedBy: results.rows.item(i).POSTED_BY,
                Image1: results.rows.item(i).IMAGE_1,
                Image2: results.rows.item(i).IMAGE_2,
                Image3: results.rows.item(i).IMAGE_3,
                DeviceBatteryFactor: results.rows.item(i).DEVICE_BATTERY_FACTOR,
                VoidDatetime: results.rows.item(i).VOID_DATETIME,
                VoidReason: results.rows.item(i).VOID_REASON,
                VoidNotes: results.rows.item(i).VOID_NOTES,
                Voided: results.rows.item(i).VOIDED,
                ClosedRouteDatetime: results.rows.item(i).CLOSED_ROUTE_DATETIME,
                IsActiveRoute: results.rows.item(i).IS_ACTIVE_ROUTE,
                GpsExpected: results.rows.item(i).GPS_EXPECTED,
                SalesOrderIdBo: results.rows.item(i).SALES_ORDER_ID_BO,
                DeliveryDate: results.rows.item(i).DELIVERY_DATE,
                IsParent: results.rows.item(i).IS_PARENT,
                ReferenceId: results.rows.item(i).REFERENCE_ID,
                TimesPrinted: results.rows.item(i).TIMES_PRINTED,
                DocSerie: results.rows.item(i).DOC_SERIE,
                DocNum: results.rows.item(i).DOC_NUM,
                IsVoid: results.rows.item(i).IS_VOID,
                SalesOrderType: results.rows.item(i).SALES_ORDER_TYPE,
                Discount: results.rows.item(i).DISCOUNT_BY_GENERAL_AMOUNT,
                IsDraft: results.rows.item(i).IS_DRAFT,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE,
                SaleDetails: Array()
              };
              ordenesDeCompra.push(ordenDeCompra);
            }
            callback(ordenesDeCompra);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerLineasDeBorradoresDeOrdernesDeCompraNoPosteados(
    ordenDeCompra,
    errCallBack,
    ordenesDeCompra,
    i,
    callback,
    returncallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT * ";
        sql += " FROM SALES_ORDER_DETAIL ";
        sql += " WHERE SALES_ORDER_ID=" + ordenDeCompra.SalesOrderId + "";
        sql += " AND DOC_SERIE='" + ordenDeCompra.DocSerie + "'";
        sql += " AND DOC_NUM=" + ordenDeCompra.DocNum + "";
        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var j = 0; j < results.rows.length; j++) {
              var detOrdenDeCompra = {
                SalesOrderId: results.rows.item(j).SALES_ORDER_ID,
                Sku: results.rows.item(j).SKU,
                LineSeq: results.rows.item(j).LINE_SEQ,
                Qty: results.rows.item(j).QTY,
                Price: results.rows.item(j).PRICE,
                Discount: results.rows.item(j).DISCOUNT,
                TotalLine: results.rows.item(j).TOTAL_LINE,
                PostedDatetime: results.rows.item(j).POSTED_DATETIME,
                Serie: results.rows.item(j).SERIE,
                Serie2: results.rows.item(j).SERIE_2,
                RequeriesSerie: results.rows.item(j).REQUERIES_SERIE,
                ComboReference: results.rows.item(j).COMBO_REFERENCE,
                ParentSeq: results.rows.item(j).PARENT_SEQ,
                IsActiveRoute: results.rows.item(j).IS_ACTIVE_ROUTE,
                CodePackUnit: results.rows.item(j).CODE_PACK_UNIT,
                IsBonus: 0
              };
              ordenDeCompra.SaleDetails.push(detOrdenDeCompra);
            }
            ordenesDeCompra = callback(ordenesDeCompra, i, ordenDeCompra);

            if (ordenesDeCompra.length - 1 === i) {
              returncallBack(ordenesDeCompra);
            }
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerDetalleDeBorradoresDeOrdernesDeCompraNoPosteados(
    callback,
    errCallBack,
    ordenesDeCompra
  ) {
    var i;
    for (i = 0; i < ordenesDeCompra.length; i++) {
      ObtenerLineasDeBorradoresDeOrdernesDeCompraNoPosteados(
        ordenesDeCompra[i],
        errCallBack,
        ordenesDeCompra,
        i,
        function(ordenesDeCompraN1, index, ordenDeCompra) {
          ordenesDeCompraN1[index] = ordenDeCompra;
          return ordenesDeCompraN1;
        },
        callback
      );
    }
    if (i === 0) {
      callback(ordenesDeCompra);
    }
  }

  function ActualizarEnvioDeBorradoresDeOrdernesDeCompra(
    data,
    callback,
    errCallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE SALES_ORDER_HEADER";
        sql += " SET IS_POSTED = 2";
        sql += " , IS_UPDATED = 1 ";
        sql += " , IS_POSTED_VALIDATED = 2 ";
        sql +=
          " , SERVER_POSTED_DATETIME = '" + data.ServerPostedDateTime + "'";
        sql += " , SALES_ORDER_ID_BO =  " + data.SalesOrderIdBo;
        sql += " WHERE";
        sql += " SALES_ORDER_ID =" + data.SalesOrderId;
        sql += " AND IS_DRAFT = 1";
        sql += " AND DOC_SERIE ='" + data.DocSerie + "'";
        sql += " AND DOC_NUM =" + data.DocNum;
        tx.executeSql(sql);

        sql = "UPDATE SALES_ORDER_DETAIL";
        sql += " SET IS_POSTED_VOID = 2";
        sql += " WHERE SALES_ORDER_ID =" + data.SalesOrderId;
        sql += " AND DOC_SERIE ='" + data.DocSerie + "'";
        sql += " AND DOC_NUM =" + data.DocNum;

        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  function EnviarBorradorDeOnrdeDeVenta(ordenesdeCompra, index, esUltimo) {
    var data = {
      salesOrder: ordenesdeCompra[index],
      dbuser: gdbuser,
      dbuserpass: gdbuserpass,
      battery: gBatteryLevel,
      routeid: gCurrentRoute,
      warehouse: gPreSaleWhs
    };
    socket.emit("SendInsertSalesOrderDraft", data);
    if (esUltimo) return;
    setTimeout(function() {
      var actual = index + 1;
      EnviarOrdenDeVenta(
        ordenesdeCompra,
        actual,
        ordenesdeCompra.length - 1 === actual
      );
    }, 5000);
  }

  function EnviarBorradoresDeOrdenesDeCompra(callback, errCallback) {
    if (_enviandoBorradoresDeOrdenesDeCompra) {
      callback();
      return;
    }
    _enviandoBorradoresDeOrdenesDeCompra = true;
    var ordenesDeCompra = Array();
    ObtenerBorradoresDeOrdernesDeCompraNoPosteados(
      function(ordenesDeCompraN1) {
        ObtenerDetalleDeBorradoresDeOrdernesDeCompraNoPosteados(
          function(ordenesDeCompraN2) {
            if (ordenesDeCompraN2.length > 0)
              EnviarBorradorDeOnrdeDeVenta(
                ordenesDeCompraN2,
                0,
                ordenesDeCompraN2.length - 1 === 0
              );
            _enviandoBorradoresDeOrdenesDeCompra = false;
          },
          errCallback,
          ordenesDeCompraN1
        );
      },
      errCallback,
      ordenesDeCompra
    );
  }

  //Actualizaciones de Borradores

  function ObtenerActualizacionesDeBorradoresDeOrdernesDeCompraNoPosteados(
    callback,
    errCallBack,
    ordenesDeCompra
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *";
        sql += " FROM SALES_ORDER_HEADER ";
        sql += " WHERE IS_POSTED = 2";
        sql += " AND IS_UPDATED = 0";
        sql += " AND substr(CLIENT_ID,1,1 ) <> '-'";
        sql += " AND IS_DRAFT = 1";
        sql += " ORDER BY POSTED_DATETIME";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var ordenDeCompra = {
                SalesOrderId: results.rows.item(i).SALES_ORDER_ID,
                Terms: results.rows.item(i).TERMS,
                PostedDatetime: results.rows.item(i).POSTED_DATETIME,
                ClientId: results.rows.item(i).CLIENT_ID,
                PosTerminal: results.rows.item(i).POS_TERMINAL,
                GpsUrl: results.rows.item(i).GPS_URL,
                TotalAmount: results.rows.item(i).TOTAL_AMOUNT,
                Status: results.rows.item(i).STATUS,
                PostedBy: results.rows.item(i).POSTED_BY,
                Image1: results.rows.item(i).IMAGE_1,
                Image2: results.rows.item(i).IMAGE_2,
                Image3: results.rows.item(i).IMAGE_3,
                DeviceBatteryFactor: results.rows.item(i).DEVICE_BATTERY_FACTOR,
                VoidDatetime: results.rows.item(i).VOID_DATETIME,
                VoidReason: results.rows.item(i).VOID_REASON,
                VoidNotes: results.rows.item(i).VOID_NOTES,
                Voided: results.rows.item(i).VOIDED,
                ClosedRouteDatetime: results.rows.item(i).CLOSED_ROUTE_DATETIME,
                IsActiveRoute: results.rows.item(i).IS_ACTIVE_ROUTE,
                GpsExpected: results.rows.item(i).GPS_EXPECTED,
                SalesOrderIdBo: results.rows.item(i).SALES_ORDER_ID_BO,
                DeliveryDate: results.rows.item(i).DELIVERY_DATE,
                IsParent: results.rows.item(i).IS_PARENT,
                ReferenceId: results.rows.item(i).REFERENCE_ID,
                TimesPrinted: results.rows.item(i).TIMES_PRINTED,
                DocSerie: results.rows.item(i).DOC_SERIE,
                DocNum: results.rows.item(i).DOC_NUM,
                IsVoid: results.rows.item(i).IS_VOID,
                SalesOrderType: results.rows.item(i).SALES_ORDER_TYPE,
                Discount: results.rows.item(i).DISCOUNT_BY_GENERAL_AMOUNT,
                IsDraft: results.rows.item(i).IS_DRAFT,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE,
                SaleDetails: Array()
              };
              ordenesDeCompra.push(ordenDeCompra);
            }
            callback(ordenesDeCompra);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ActualizarEnvioDeActualizacionDeBorradoresDeOrdernesDeCompra(
    data,
    callback,
    errCallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE SALES_ORDER_HEADER";
        sql += " SET IS_UPDATED = 1 ";
        sql += " WHERE";
        sql += " SALES_ORDER_ID =" + data.SalesOrderId;
        sql += " AND IS_DRAFT = 1";
        sql += " AND DOC_SERIE = '" + data.DocSerie + "'";
        sql += " AND DOC_NUM = " + data.DocNum;
        tx.executeSql(sql);
        sql = "UPDATE SALES_ORDER_DETAIL";
        sql += " SET IS_POSTED_VOID = 2";
        sql += " WHERE SALES_ORDER_ID =" + data.SalesOrderId;
        sql += " AND DOC_SERIE = '" + data.DocSerie + "'";
        sql += " AND DOC_NUM = " + data.DocNum;
        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  function EnviarActualizacionDeBorradorDeOnrdeDeVenta(
    ordenesdeCompra,
    index,
    esUltimo
  ) {
    var data = {
      salesOrder: ordenesdeCompra[index],
      dbuser: gdbuser,
      dbuserpass: gdbuserpass,
      battery: gBatteryLevel,
      routeid: gCurrentRoute,
      warehouse: gPreSaleWhs
    };
    socket.emit("SendUpdateSalesOrderDraft", data);
    if (esUltimo) return;
    setTimeout(function() {
      var actual = index + 1;
      EnviarOrdenDeVenta(
        ordenesdeCompra,
        actual,
        ordenesdeCompra.length - 1 === actual
      );
    }, 5000);
  }

  function EnviarActualizacionesDeBorradoresDeOrdenesDeCompra(
    callback,
    errCallback
  ) {
    if (_enviandoActualizacionesBorradoresDeOrdenesDeCompra) {
      callback();
      return;
    }
    _enviandoActualizacionesBorradoresDeOrdenesDeCompra = true;
    var ordenesDeCompra = Array();
    ObtenerActualizacionesDeBorradoresDeOrdernesDeCompraNoPosteados(
      function(ordenesDeCompraN1) {
        ObtenerDetalleDeBorradoresDeOrdernesDeCompraNoPosteados(
          function(ordenesDeCompraN2) {
            if (ordenesDeCompraN2.length > 0)
              EnviarActualizacionDeBorradorDeOnrdeDeVenta(
                ordenesDeCompraN2,
                0,
                ordenesDeCompraN2.length - 1 === 0
              );
            _enviandoActualizacionesBorradoresDeOrdenesDeCompra = false;
          },
          errCallback,
          ordenesDeCompraN1
        );
      },
      errCallback,
      ordenesDeCompra
    );
  }

  ///*********************ENVIO DE TOMAS DE INVENTARIO *********************/

  function ObtenerTomasDeInventarioNoPosteados(
    callback,
    errCallBack,
    tomasDeInventario
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *";
        sql += " FROM TAKE_INVENTORY_HEADER ";
        sql += " WHERE IS_POSTED IN (0,1)";
        sql += " AND substr(CLIENT_ID,1,1 ) <> '-'";
        sql += " ORDER BY POSTED_DATETIME";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var tomaDeInventario = {
                TakeInventoryId: results.rows.item(i).TAKE_INVENTORY_ID,
                PostedDatetime: results.rows.item(i).POSTED_DATETIME,
                ClientId: results.rows.item(i).CLIENT_ID,
                CodeRoute: results.rows.item(i).CODE_ROUTE,
                GpsUrl: results.rows.item(i).GPS_URL,
                PostedBy: results.rows.item(i).POSTED_BY,
                DeviceBatteryFactor: results.rows.item(i).DEVICE_BATERY_FACTOR,
                IsActiveRoute: results.rows.item(i).IS_ACTIVE_ROUTE,
                GpsExpected: results.rows.item(i).GPS_EXPECTED,
                TakeInventoryIdBo: results.rows.item(i).TAKE_INVENTORY_ID_BO,
                DocSerie: results.rows.item(i).DOC_SERIE,
                DocNum: results.rows.item(i).DOC_NUM,
                IsVoid: results.rows.item(i).IS_VOID,
                TaskId: results.rows.item(i).TASK_ID,
                IsPosted: results.rows.item(i).IS_POSTED,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE,
                TakeInventoryDetails: Array()
              };
              tomasDeInventario.push(tomaDeInventario);
            }
            callback(tomasDeInventario);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerLineasDeTomasDeInventarioNoPosteados(
    tomaDeInventario,
    errCallBack,
    tomasDeInventario,
    i,
    callback,
    returncallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT * ";
        sql += " FROM TAKE_INVENTORY_DETAIL ";
        sql +=
          " WHERE TAKE_INVENTORY_ID=" + tomaDeInventario.TakeInventoryId + "";
        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var j = 0; j < results.rows.length; j++) {
              var detTomaDeInventario = {
                TakeInventoryId: results.rows.item(j).TAKE_INVENTORY_ID,
                CodeSku: results.rows.item(j).CODE_SKU,
                Qty: results.rows.item(j).QTY,
                CodePackUnit: results.rows.item(j).CODE_PACK_UNIT,
                LastQty: results.rows.item(j).LAST_QTY
              };
              tomaDeInventario.TakeInventoryDetails.push(detTomaDeInventario);
            }
            tomasDeInventario = callback(
              tomasDeInventario,
              i,
              tomaDeInventario
            );

            if (tomasDeInventario.length - 1 === i) {
              returncallBack(tomasDeInventario);
            }
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerDetalleDeTomasDeInventarioNoPosteados(
    callback,
    errCallBack,
    tomasDeInventario
  ) {
    var i;
    for (i = 0; i < tomasDeInventario.length; i++) {
      ObtenerLineasDeTomasDeInventarioNoPosteados(
        tomasDeInventario[i],
        errCallBack,
        tomasDeInventario,
        i,
        function(tomasDeInventarioN1, index, tomaDeInventario) {
          tomasDeInventarioN1[index] = tomaDeInventario;
          return tomasDeInventarioN1;
        },
        callback
      );
    }
    if (i === 0) {
      callback(tomasDeInventario);
    }
  }

  function EnviarTomaDeInventario(tomasDeInventario, index, esUltimo) {
    var data = {
      takeInventory: tomasDeInventario[index],
      dbuser: gdbuser,
      dbuserpass: gdbuserpass,
      battery: gBatteryLevel,
      routeid: gCurrentRoute
    };
    socket.emit("SendTakesInventory", data);
    if (esUltimo) return;
    setTimeout(function() {
      var actual = index + 1;
      EnviarTomaDeInventario(
        tomasDeInventario,
        actual,
        tomasDeInventario.length - 1 === actual
      );
    }, 5000);
  }

  function EnviarTomasDeInventario(callback, errCallback) {
    if (_enviandoTomaDeInventario) {
      callback();
      return;
    }
    _enviandoTomaDeInventario = true;
    var tomasDeInventario = Array();
    ObtenerTomasDeInventarioNoPosteados(
      function(tomasDeInventarioN1) {
        ObtenerDetalleDeTomasDeInventarioNoPosteados(
          function(tomasDeInventarioN2) {
            if (tomasDeInventarioN2.length > 0)
              EnviarTomaDeInventario(
                tomasDeInventarioN2,
                0,
                tomasDeInventarioN2.length - 1 === 0
              );
            _enviandoTomaDeInventario = false;
          },
          errCallback,
          tomasDeInventarioN1
        );
      },
      errCallback,
      tomasDeInventario
    );
  }

  function ActualizarEnvioDeTomasDeInventario(data, callback, errCallBack) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE TAKE_INVENTORY_HEADER";
        sql += " SET IS_POSTED=2";
        sql += " WHERE";
        sql += " SALES_ORDER_ID =" + data.TakeInventoryId;
        sql += " AND DOC_SERIE ='" + data.DocSerie + "'";
        sql += " AND DOC_NUM =" + data.DocNum;

        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  ///*********************ENVIO DE CAMBIOS DE CLIENTES *********************/

  function EnviarCambiosDeClientes(callback, errCallback) {
    if (_enviandoCambiosDeClientes) {
      callback();
      return;
    }
    _enviandoCambiosDeClientes = true;
    var cambiosDeClientes = Array();
    ObtenerCambiosDeClientes(
      function(clientesN1) {
        ObtenerEtiquetasDeCambiosDeClientes(
          function(clientesN2) {
            if (clientesN2.length > 0)
              EnviarCambioCliente(clientesN2, 0, clientesN2.length - 1 === 0);
            _enviandoCambiosDeClientes = false;
          },
          errCallback,
          clientesN1
        );
      },
      errCallback,
      cambiosDeClientes
    );
  }

  function ObtenerCambiosDeClientes(callback, errCallback, clientes) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *";
        sql += " FROM CUSTOMER_CHANGE ";
        sql += " WHERE IS_POSTED IN (0,1)";
        sql += " ORDER BY POSTED_DATETIME";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var cambioCliente = {
                CustomerChangeId: results.rows.item(i).CUSTOMER_CHANGE_ID,
                ClientId: results.rows.item(i).CODE_CUSTOMER,
                PhoneCustomer: results.rows.item(i).PHONE_CUSTOMER,
                AddressCustomer: results.rows.item(i).ADRESS_CUSTOMER,
                ContactCustomer: results.rows.item(i).CONTACT_CUSTOMER,
                Gps: results.rows.item(i).GPS,
                PostedDatetime: results.rows.item(i).POSTED_DATETIME,
                PostedBy: results.rows.item(i).POSTED_BY,
                CodeRoute: results.rows.item(i).CODE_ROUTE,
                IsPosted: results.rows.item(i).IS_POSTED,
                TaxId: results.rows.item(i).TAX_ID,
                InvoiceName: results.rows.item(i).INVOICE_NAME,
                CustomerName: results.rows.item(i).CUSTOMER_NAME,
                CustomerNewName: results.rows.item(i).NEW_CUSTOMER_NAME,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE,
                TagsByCustomer: Array()
              };
              clientes.push(cambioCliente);
            }
            callback(clientes);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerEtiquetasDeCambiosDeClientes(
    callback,
    errCallback,
    clientes
  ) {
    var i;
    for (i = 0; i < clientes.length; i++) {
      ObtenerTagsDeClientesNoPosteados(
        clientes[i],
        function(err) {
          errCallBack(err);
        },
        clientes,
        function(clientesN1, index, cliente) {
          clientesN1[index] = cliente;
          return clientesN1;
        },
        callback
      );
    }
    if (i === 0) {
      callback(clientes);
    }
  }

  function ObtenerTagsDeClientesNoPosteados(
    cliente,
    errCallBack,
    clientes,
    i,
    callback,
    returncallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *  ";
        sql += " FROM TAG_X_CUSTOMER_CHANGE ";
        sql += " WHERE CUSTOMER_CHANGE_ID= '" + cliente.CustomerChangeId + "'";
        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var j = 0; j < results.rows.length; j++) {
              var tagsCliente = {
                ClientId: results.rows.item(j).CODE_CUSTOMER,
                TagColor: results.rows.item(j).TAG_COLOR,
                DeviceNetworkType: results.rows.item(i).DEVICE_NETWORK_TYPE,
                IsPostedOffLine: results.rows.item(i).IS_POSTED_OFFLINE
              };
              cliente.TagsByCustomer.push(tagsCliente);
            }
            callback(clientes, i, cliente);

            if (clientes.length - 1 === i) {
              returncallBack(clientes);
            }
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function EnviarCambioCliente(clientes, index, esUltimo) {
    var data = {
      customer: clientes[index],
      dbuser: gdbuser,
      dbuserpass: gdbuserpass,
      battery: gBatteryLevel,
      routeid: gCurrentRoute
    };
    socket.emit("SendCustomerChange", data);
    if (esUltimo) return;
    setTimeout(function() {
      var actual = index + 1;
      EnviarCambioCliente(clientes, actual, clientes.length - 1 === actual);
    }, 5000);
  }

  function ActualizarEnvioDeCambiosDeClientes(data, callback, errCallBack) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "UPDATE CUSTOMER_CHANGE";
        sql += " SET IS_POSTED=2";
        sql += ", SERVER_POSTED_DATETIME = '" + data.ServerPostedDateTime + "'";
        sql += ", CUSTOMER_CHANGE_ID = " + data.CustomerChangeIdBo;
        sql += " WHERE CUSTOMER_CHANGE_ID ='" + data.CustomerChangeId + "'";
        tx.executeSql(sql);

        sql = "UPDATE TAG_X_CUSTOMER_CHANGE ";
        sql += "SET CUSTOMER_CHANGE_ID = " + data.CustomerChangeIdBo;
        sql += " WHERE CUSTOMER_CHANGE_ID ='" + data.CustomerChangeId + "'";
        tx.executeSql(sql);
      },
      function(err) {
        errCallBack(err);
      },
      function() {
        callback(data);
      }
    );
  }

  function ObtenerTodosLosScouitng(callback, errCallBack, clientes) {
    var fecha = getDateTime().split(" ");
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT * ";
        sql += " FROM CLIENTS";
        sql += " WHERE NEW = 1";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
              var cliente = {
                CodigoHH: results.rows.item(i).CLIENT_HH_ID_OLD,
                CodigoBo: results.rows.item(i).CLIENT_ID,
                Nombre: results.rows.item(i).CLIENT_NAME,
                Telefono: results.rows.item(i).PHONE,
                Direccion: results.rows.item(i).ADDRESS,
                Ruta: gCurrentRoute,
                Seller_code: gLoggedUser,
                loginid: gLoggedUser,
                PostedDatetime: getDateTime(),
                ContactCustomer: results.rows.item(i).CONTACT_CUSTOMER,
                Sign: results.rows.item(i).SIGN,
                Photo: results.rows.item(i).PHOTO,
                Status: results.rows.item(i).STATUS,
                New: results.rows.item(i).NEW,
                Gps: results.rows.item(i).GPS,
                Reference: results.rows.item(i).REFERENCE,
                PostDateTime: results.rows.item(i).POST_DATETIME,
                PosSaleName: results.rows.item(i).POS_SALE_NAME,
                InvoiceName: results.rows.item(i).INVOICE_NAME,
                InvoiceAddress: results.rows.item(i).INVOICE_ADDRESS,
                Nit: results.rows.item(i).NIT,
                ContactId: results.rows.item(i).CONTACT_ID,
                DiasVisita: Array(),
                UpdatedFromBo: results.rows.item(i).UPDATED_FROM_BO,
                SyncId:
                  results.rows.item(i).SYNC_ID === "null" ||
                  results.rows.item(i).SYNC_ID === null ||
                  results.rows.item(i).SYNC_ID === "undefined"
                    ? gCurrentRoute +
                      fecha[0] +
                      fecha[1] +
                      results.rows.item(i).CLIENT_ID
                    : results.rows.item(i).SYNC_ID,
                IsPosted: results.rows.item(i).IS_POSTED
              };
              clientes.push(cliente);
            }
            callback(clientes);
          },
          function(tx, err) {
            errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerLineasDeFrecuencioasDeTodosLosScouting(
    cliente,
    errCallBack,
    clientes,
    i,
    callback,
    returncallBack
  ) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT *";
        sql += " FROM CLIENTS_FREQUENCY";
        sql += " WHERE (CODE_CUSTOMER='" + cliente.CodigoHH + "'";
        sql += " OR CODE_CUSTOMER='" + cliente.CodigoBo + "')";
        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            for (var j = 0; j < results.rows.length; j++) {
              var frecuencia = {
                CodeCustiner: results.rows.item(j).CODE_CUSTOMER,
                Sunday: results.rows.item(j).SUNDAY,
                Monday: results.rows.item(j).MONDAY,
                Tuesday: results.rows.item(j).TUESDAY,
                Wednesday: results.rows.item(j).WEDNESDAY,
                Thursday: results.rows.item(j).THURSDAY,
                Friday: results.rows.item(j).FRIDAY,
                Saturday: results.rows.item(j).SATURDAY,
                FrequencyWeeks: results.rows.item(j).FREQUENCY_WEEKS,
                LastDateVisited: results.rows.item(j).LAST_DATE_VISITED
              };
              cliente.DiasVisita.push(frecuencia);
            }
            clientes = callback(clientes, i, cliente);

            if (clientes.length - 1 === i) {
              returncallBack(clientes);
            }
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function ObtenerFrecuenciaDeTodosLosScouting(
    callback,
    errCallBack,
    clientes
  ) {
    var i;
    for (i = 0; i < clientes.length; i++) {
      ObtenerLineasDeFrecuencioasDeTodosLosScouting(
        clientes[i],
        errCallBack,
        clientes,
        i,
        function(clientesN1, index, cliente) {
          clientesN1[index] = cliente;
          return clientesN1;
        },
        callback
      );
    }
    if (i === 0) {
      callback(clientes);
    }
  }

  function ObtenerEtiquetasDeTodosLosScouting(callback, errCallBack) {
    SONDA_DB_Session.transaction(
      function(tx) {
        var sql = "SELECT ";
        sql += " TAG_COLOR ";
        sql += " , CUSTOMER ";
        sql += " FROM TAGS_X_CUSTOMER ";
        sql += " WHERE IS_POSTED >= 0";

        tx.executeSql(
          sql,
          [],
          function(tx, results) {
            var etiquetasPorCliente = Array();
            for (var i = 0; i < results.rows.length; i++) {
              var item = {
                TAG_COLOR: results.rows.item(i).TAG_COLOR,
                CUSTOMER: results.rows.item(i).CUSTOMER
              };
              etiquetasPorCliente.push(item);
            }
            callback(etiquetasPorCliente);
          },
          function(tx, err) {
            if (err.code !== 0) errCallBack(err);
          }
        );
      },
      function(err) {
        errCallBack(err);
      }
    );
  }

  function EnviarDatosBajoDemanda(callback, errCallback) {
    if (socket) {
      EnviarTodasLasOrdenesDeVenta(
        function() {
          EnviarTodosLosScouting(
            function() {
              EnviarTodasEtiquetas(
                function() {
                  EnviarBorradoresDeBonificaciones(
                    OrigenDeEnvioDeBorradoresDeBonificacion.ReportarDispositivo
                  );
                  callback();
                },
                function(err) {
                  errCallback(err);
                }
              );
            },
            function(err) {
              errCallback(err);
            }
          );
        },
        function(err) {
          errCallback(err);
        }
      );
    } else {
      ToastThis("Verifique su conexión");
    }
  }

  function EnviarTodasLasOrdenesDeVenta(callback, errCallback) {
    var ordenesDeCompra = [];
    ObtenerOrdernesDeCompraNoPosteados(
      function(ordenesDeCompraN1) {
        if (ordenesDeCompraN1.length > 0) {
          ObtenerDetalleDeOrdernesDeCompraNoPosteados(
            function(ordenesDeCompraN2) {
              ordenesDeCompraN2.map(function(ordenDeVenta) {
                var data = {
                  salesOrder: ordenDeVenta,
                  dbuser: gdbuser,
                  dbuserpass: gdbuserpass,
                  battery: gBatteryLevel,
                  routeid: gCurrentRoute,
                  warehouse: gPreSaleWhs
                };
                socket.emit("SendAllSalesOrder", data);
              });
              callback();
            },
            errCallback,
            ordenesDeCompraN1
          );
        } else {
          ToastThis("No hay ordenes de venta para enviar");
          callback();
        }
      },
      errCallback,
      ordenesDeCompra,
      false
    );
  }

  function EnviarTodosLosScouting(callback, errCallback) {
    var clientes = [];
    ObtenerTodosLosScouitng(
      function(clientesN1) {
        ObtenerFrecuenciaDeTodosLosScouting(
          function(clientesN2) {
            clientesN2.map(function(cliente) {
              var data = {
                client: cliente,
                dbuser: gdbuser,
                dbuserpass: gdbuserpass,
                battery: gBatteryLevel,
                routeid: gCurrentRoute
              };
              socket.emit("InsertAllNewClient", data);
            });
            callback();
          },
          errCallback,
          clientesN1
        );
      },
      errCallback,
      clientes
    );
  }

  function EnviarTodasEtiquetas(callback, errCallback) {
    ObtenerEtiquetasDeTodosLosScouting(function(etiquetasPoCliente) {
      etiquetasPoCliente.map(function(etiqueta) {
        var data = {
          tagscolor: etiqueta.TAG_COLOR,
          customer: etiqueta.CUSTOMER,
          dbuser: gdbuser,
          dbuserpass: gdbuserpass,
          battery: gBatteryLevel,
          routeid: gCurrentRoute
        };
        socket.emit("InsertAllNewTagsXClient", data);
      });
      callback();
    }, errCallback);
  }

  //Envio de Bonus Draft
  function EnviarBorradoresDeBonificaciones(origenDeEnvio) {
    var bonoServicio = new BonoServicio();
    bonoServicio.obtenerBorradoresDeBonificacion(
      function(borradores) {
        if (borradores.length > 0) {
          var data = {
            borradores: borradores,
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            routeid: gCurrentRoute,
            Source: origenDeEnvio
          };
          socket.emit("InsertLogOfBonus", data);
        }
      },
      function(resultado) {
        notify(resultado.mensaje);
      }
    );
  }

  //============ Envio de Historico de promociones ==============================

  function obtenerHistoricoDePromocionesNoPosteadas(callback, errorCallback) {
    var historialDePromociones = [];
    SONDA_DB_Session.readTransaction(
      function(tx) {
        var sql = [];
        sql.push(
          "SELECT DOC_SERIE, DOC_NUM, CODE_ROUTE, CODE_CUSTOMER, HISTORY_DATETIME, PROMO_ID, PROMO_NAME, FREQUENCY, SALES_ORDER_DOCUMENT_NUMBER, SALES_ORDER_DOCUMENT_SERIES "
        );
        sql.push(" FROM HISTORY_BY_PROMO WHERE IS_POSTED = 1");

        tx.executeSql(
          sql.join(""),
          [],
          function(txReturn, recordset) {
            for (var i = 0; i < recordset.rows.length; i++) {
              var fecha = void 0;
              fecha = new Date(recordset.rows.item(i).HISTORY_DATETIME);
              var cadenaFecha =
                fecha.getFullYear() +
                "-" +
                (fecha.getMonth() + 1) +
                "-" +
                fecha.getDate();
              var promo = {
                docSerie: recordset.rows.item(i).DOC_SERIE,
                docNum: recordset.rows.item(i).DOC_NUM,
                codeRoute: recordset.rows.item(i).CODE_ROUTE,
                codeCustomer: recordset.rows.item(i).CODE_CUSTOMER,
                historyDateTime: cadenaFecha,
                promoId: recordset.rows.item(i).PROMO_ID,
                promoName: recordset.rows.item(i).PROMO_NAME,
                frequency: recordset.rows.item(i).FREQUENCY,
                salesOrderDocumentNumber: recordset.rows.item(i)
                  .SALES_ORDER_DOCUMENT_NUMBER,
                salesOrderDocumentSeries: recordset.rows.item(i)
                  .SALES_ORDER_DOCUMENT_SERIES
              };
              historialDePromociones.push(promo);
            }
            callback(historialDePromociones);
          },
          function(txResult, error) {
            if (error.code !== SqliteError.Desconocido) {
              errorCallback(
                "No se ha podido obtener el histórico de las promociones debido a: " +
                  error.message
              );
            }
          }
        );
      },
      function(err) {
        if (err.code != SqliteError.Desconocido) {
          errorCallback(
            "No se ha podido obtener el histórico de las promociones debido a: " +
              err.message
          );
        }
      }
    );
  }

  function MarcarHistoricoDePromocionesComoPosteado(historicoDePromociones) {
    SONDA_DB_Session.transaction(
      function(tx) {
        historicoDePromociones.map(function(promo) {
          tx.executeSql(
            "UPDATE HISTORY_BY_PROMO SET IS_POSTED = 2, SERVER_POSTED_DATETIME = '" +
              promo.SERVER_POSTED_DATETIME +
              "' WHERE DOC_SERIE = '" +
              promo.DOC_SERIE +
              "' AND DOC_NUM = " +
              promo.DOC_NUM
          );
        });
      },
      function(err) {
        if (err.code !== SqliteError.Desconocido) {
          notify(
            "No se ha podido actualizar el histórico de las promociones debido a: " +
              err.message
          );
        }
      }
    );
  }

  function enviarHistoricoDePromocionesNoPosteadas() {
    _enviandoHistoricoDePromociones = true;
    obtenerHistoricoDePromocionesNoPosteadas(
      function(historialDePromociones) {
        if (historialDePromociones.length > 0) {
          var data = {
            historialDePromociones: historialDePromociones,
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            routeid: gCurrentRoute
          };
          socket.emit("insertHistoryOfPromo", data);
        }
        _enviandoHistoricoDePromociones = false;
      },
      function(error) {
        notify(error);
        _enviandoHistoricoDePromociones = false;
      }
    );
  }

  //============ Finaliza Envio de Historico de promociones ==============================

  //============ Inicia Envio de Encuestas de Cliente ====================================

  function EnviarEncuestasDeClienteNoPosteadas() {
    if (_enviandoEncuestasDeCliente) return;

    _enviandoEncuestasDeCliente = true;

    var encuestaServicio = new EncuestaServicio();
    var encuestasAEnviar = [];

    encuestaServicio.obtenerEncuestasNoSincronizadas(function(
      encuestasNoSincronizadas
    ) {
      if (encuestasNoSincronizadas.length > 0) {
        var intervaloDeEnvioDeEncuestas = setInterval(() => {
          encuestasAEnviar = encuestasNoSincronizadas.splice(0, 5); //TODO:Se toman los primeros 5 objetos disponibles
          var data = {
            encuestas: encuestasAEnviar,
            dbuser: gdbuser,
            dbuserpass: gdbuserpass,
            routeid: gCurrentRoute,
            loginId: gLoggedUser
          };

          socket.emit("AddMicrosurveyByClient", data);
          if (encuestasNoSincronizadas.length === 0) {
            encuestasAEnviar.length = 0;
            clearInterval(intervaloDeEnvioDeEncuestas);
            _enviandoEncuestasDeCliente = false;
            encuestaServicio = null;
          }
        }, 2000);
      } else {
        encuestaServicio = null;
        _enviandoEncuestasDeCliente = false;
      }
    });
  }
  //============ Finaliza Envio de Encuestas de Cliente ==========================================
}

//----------------- ENVIO DE DOCUMENTOS DE PAGO DE FACTURAS VENCIDAS -----------------------------

function EnviarDocumentosDePagoDeFacturasVencidas() {
  if (_enviandoDocumentosDePagoDeFacturasVencidas) return;

  _enviandoDocumentosDePagoDeFacturasVencidas = true;

  var pagoServicio = new PagoDeFacturaVencidaServicio();
  var pagosAEnviar = [];

  pagoServicio.obtenerDocumentosDePagoNoPosteadosEnElServidor(function(
    documentosNoPosteados
  ) {
    if (documentosNoPosteados.length > 0) {
      var intervaloDeEnvioDeDocumentosDePago = setInterval(function() {
        pagosAEnviar = documentosNoPosteados.splice(0, 5); //Se envian los documentos de 5 en 5
        var data = {
          overdueInvoicePayment: pagosAEnviar,
          dbuser: gdbuser,
          dbuserpass: gdbuserpass,
          routeid: gCurrentRoute,
          loginId: gLastLogin
        };

        socket.emit("AddOverdueInvoicePayment", data);
        if (documentosNoPosteados.length === 0) {
          pagosAEnviar = null;
          clearInterval(intervaloDeEnvioDeDocumentosDePago);
          _enviandoDocumentosDePagoDeFacturasVencidas = false;
          pagoServicio = null;
        }
      }, 3000);
    } else {
      pagoServicio = null;
      _enviandoDocumentosDePagoDeFacturasVencidas = false;
    }
  });
}
//-------------------------------------------------------------------------------------------------
