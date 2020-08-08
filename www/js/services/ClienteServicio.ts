declare var SONDA_DB_Session: Database;

class ClienteServicio implements IClienteServicio {
  tareaServicio = new TareaServcio();

  obtenerCliente(
    cliente: Cliente,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ): void {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT";
        sql += " C.CLIENT_ID";
        sql += " ,C.CLIENT_NAME";
        sql += " ,C.CLIENT_TAX_ID";
        sql += " ,C.INVOICE_NAME";
        sql += " ,C.NIT";
        sql += " ,C.ADDRESS";
        sql += " ,C.PHONE";
        sql += " ,C.CLIENT_HH_ID_OLD";
        sql += " ,C.CONTACT_CUSTOMER";
        sql += " ,C.GPS";
        sql += " ,C.REFERENCE";
        sql += " ,C.DISCOUNT";
        sql += " ,C.RGA_CODE";
        sql += " ,C.BONUS_LIST_ID";
        sql += " ,C.DISCOUNT_LIST_ID";
        sql += " ,C.PRICE_LIST_ID";
        sql += " ,C.SALES_BY_MULTIPLE_LIST_ID";
        sql += " ,C.NEW";
        sql += " ,C.PREVIUS_BALANCE";
        sql += " ,C.LAST_PURCHASE";
        sql += " ,C.LAST_PURCHASE_DATE";
        sql += " ,C.SPECIAL_PRICE_LIST_ID";
        sql += " ,C.CODE_CHANNEL";
        sql += " ,C.OUTSTANDING_BALANCE";
        sql += " ,C.DFPT_LIST_ID";
        sql += " FROM CLIENTS C";
        sql += ` WHERE C.CLIENT_ID = '${cliente.clientId}' `;
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            let clienteTemp: any = results.rows.item(0);
            let clienteRespuesta: Cliente = <Cliente>{
              clientId: clienteTemp.CLIENT_ID,
              clientName: clienteTemp.CLIENT_NAME,
              clientTaxId: clienteTemp.CLIENT_TAX_ID,
              invoiceTaxId: clienteTemp.NIT,
              invoiceName: clienteTemp.INVOICE_NAME,
              address: clienteTemp.ADDRESS,
              phone: clienteTemp.PHONE,
              clientHhIdOld: clienteTemp.CLIENT_HH_ID_OLD,
              contactCustomer: clienteTemp.CONTACT_CUSTOMER,
              gps: clienteTemp.GPS,
              discountMax: trunc_number(
                clienteTemp.DISCOUNT,
                configuracionDecimales.defaultCalculationsDecimals
              ),
              discount: trunc_number(
                0,
                configuracionDecimales.defaultCalculationsDecimals
              ),
              appliedDiscount: trunc_number(
                0,
                configuracionDecimales.defaultCalculationsDecimals
              ),
              totalAmout: trunc_number(
                0,
                configuracionDecimales.defaultCalculationsDecimals
              ),
              cuentaCorriente: new CuentaCorriente(),
              deliveryDate: new Date(),
              skus: "",
              rgaCode: clienteTemp.RGA_CODE,
              bonusListId: clienteTemp.BONUS_LIST_ID,
              discountListId: clienteTemp.DISCOUNT_LIST_ID,
              priceListId: clienteTemp.PRICE_LIST_ID,
              salesByMultipleListId: clienteTemp.SALES_BY_MULTIPLE_LIST_ID,
              isNew:
                clienteTemp.NEW === "1" || clienteTemp.NEW === 1 ? true : false,
              previousBalance: clienteTemp.PREVIUS_BALANCE,
              lastPurchase: clienteTemp.LAST_PURCHASE,
              bonoPorCombos: new Array<BonoPorCombo>(),
              spcialPriceListId: clienteTemp.SPECIAL_PRICE_LIST_ID,
              channel: clienteTemp.CODE_CHANNEL,
              lastPurchaseDate: clienteTemp.LAST_PURCHASE_DATE
                ? clienteTemp.LAST_PURCHASE_DATE.split("T")[0]
                : null,
              outStandingBalance: clienteTemp.OUTSTANDING_BALANCE,
              discountByFamilyAndPaymentTypeListId: clienteTemp.DFPT_LIST_ID
            };
            callback(clienteRespuesta);
          } else {
            callbackError(<Operacion>{
              codigo: -1,
              mensaje:
                "Error al obtener el cliente: No se puede encontrar el cliente"
            });
          }
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener el Cliente: " + err.message
        });
      }
    );
  }

  obtenerListaDePrecioPorCliente(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT";
        sql += " P.CODE_PRICE_LIST";
        sql += " FROM PRICE_LIST_BY_CUSTOMER P";
        sql += " WHERE P.CODE_CUSTOMER = '" + cliente.clientId + "'";
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            var clienteTemp: any = results.rows.item(0);
            cliente.priceListId = clienteTemp.CODE_PRICE_LIST;
            callback(cliente);
          } else {
            cliente.priceListId = localStorage.getItem("gDefaultPriceList");
            callback(cliente);
          }
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "No se pudo obtener la Lista de Precios del Cliente debido al siguiente error: " +
            err.message
        });
      }
    );
  }

  obtenerCuentaCorriente(
    cliente: Cliente,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      let configuracion: ManejoDeDecimales = configuracionDecimales;
      this.obtenerSiTieneFacturasVenciadas(
        cliente,
        (cliente: Cliente) => {
          this.obtenerLimiteDeCredito(
            cliente,
            configuracion,
            (cliente: Cliente) => {
              this.obtenerSiTieneDiasDeCreditoVencidos(
                cliente,
                (cliente: Cliente) => {
                  this.obtenerSaldoActual(
                    cliente,
                    configuracion,
                    (cliente: Cliente) => {
                      this.obtenerSaldoDeFacturas(
                        cliente,
                        configuracion,
                        (cliente: Cliente) => {
                          this.obtenerSaldoDeOrdenesDeVenta(
                            cliente,
                            configuracion,
                            (cliente: Cliente) => {
                              callback(cliente);
                            },
                            (reultado: Operacion) => {
                              callbackError(reultado);
                            }
                          );
                        },
                        (reultado: Operacion) => {
                          callbackError(reultado);
                        }
                      );
                    },
                    (reultado: Operacion) => {
                      callbackError(reultado);
                    }
                  );
                },
                (reultado: Operacion) => {
                  callbackError(reultado);
                }
              );
            },
            (reultado: Operacion) => {
              callbackError(reultado);
            }
          );
        },
        (reultado: Operacion) => {
          callbackError(reultado);
        }
      );
    } catch (err) {
      callbackError(<Operacion>{
        codigo: -1,
        mensaje: "Error al obtener el cuenta corriente: " + err.message
      });
    }
  }

  obtenerSiTieneFacturasVenciadas(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT ";
        sql += " I.DOC_DUE_DATE";
        sql += " FROM INVOICE_HEADER I";
        sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
        sql += " AND I.IS_POSTED = 3";
        sql += " AND I.DOC_DUE_DATE <= DATE()";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length > 0) {
            cliente.cuentaCorriente.facturasVencidas = true;
          } else {
            cliente.cuentaCorriente.facturasVencidas = false;
          }
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener facturas vencidas: " + err.message
        });
      }
    );
  }

  obtenerLimiteDeCredito(
    cliente: Cliente,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT ";
        sql += " C.CREDIT_LIMIT";
        sql += " ,C.EXTRADAYS";
        sql += " FROM CLIENTS C";
        sql += " WHERE C.CLIENT_ID = '" + cliente.clientId + "'";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length >= 1) {
            var clienteTemp: any = results.rows.item(0);
            cliente.cuentaCorriente.limiteDeCredito = trunc_number(
              clienteTemp.CREDIT_LIMIT,
              configuracionDecimales.defaultCalculationsDecimals
            );
            cliente.cuentaCorriente.diasCredito = clienteTemp.EXTRADAYS;
          } else {
            cliente.cuentaCorriente.limiteDeCredito = trunc_number(
              0,
              configuracionDecimales.defaultCalculationsDecimals
            );
            cliente.cuentaCorriente.diasCredito = 0;
          }
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener limite de credito y dias credito: " + err.message
        });
      }
    );
  }

  obtenerSiTieneDiasDeCreditoVencidos(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT ";
        sql += " I.POSTED_DATETIME";
        sql += " FROM INVOICE_HEADER I";
        sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
        sql += " AND I.IS_POSTED = 3";
        sql +=
          " AND date(I.POSTED_DATETIME, '+" +
          cliente.cuentaCorriente.diasCredito +
          " day') <= DATE()";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length > 0) {
            cliente.cuentaCorriente.diasCreditoVencidos = true;
          } else {
            cliente.cuentaCorriente.diasCreditoVencidos = false;
          }
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener dias de credito vencidos: " + err.message
        });
      }
    );
  }

  obtenerSaldoActual(
    cliente: Cliente,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT ";
        sql += " IFNULL(SUM(I.TOTAL_AMOUNT),0) TOTAL_AMOUNT";
        sql += " FROM INVOICE_HEADER I";
        sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
        sql += " AND IS_POSTED = 3";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length > 0) {
            var clienteTemp: any = results.rows.item(0);
            cliente.cuentaCorriente.saldoActual += trunc_number(
              clienteTemp.TOTAL_AMOUNT,
              configuracionDecimales.defaultCalculationsDecimals
            );
          } else {
            cliente.cuentaCorriente.saldoActual += trunc_number(
              0,
              configuracionDecimales.defaultCalculationsDecimals
            );
          }
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener facturas vencidas: " + err.message
        });
      }
    );
  }

  obtenerSaldoDeFacturas(
    cliente: Cliente,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT ";
        sql += " IFNULL(SUM(I.TOTAL_AMOUNT),0) TOTAL_AMOUNT";
        sql += " FROM INVOICE_HEADER I";
        sql += " WHERE I.CLIENT_ID = '" + cliente.clientId + "'";
        sql += " AND IS_POSTED != 3";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length > 0) {
            var clienteTemp: any = results.rows.item(0);
            cliente.cuentaCorriente.saldoActual += trunc_number(
              clienteTemp.TOTAL_AMOUNT,
              configuracionDecimales.defaultCalculationsDecimals
            );
          } else {
            cliente.cuentaCorriente.saldoActual += trunc_number(
              0,
              configuracionDecimales.defaultCalculationsDecimals
            );
          }
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener facturas vencidas: " + err.message
        });
      }
    );
  }

  obtenerSaldoDeOrdenesDeVenta(
    cliente: Cliente,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = "SELECT ";
        sql += " IFNULL(SUM(H.TOTAL_AMOUNT),0) TOTAL_AMOUNT";
        sql += " FROM SALES_ORDER_HEADER H";
        sql += " WHERE H.CLIENT_ID = '" + cliente.clientId + "'";
        sql += " AND IS_DRAFT = 0";
        sql += " AND IS_VOID = 0";
        sql += " AND SALES_ORDER_TYPE = 'CREDIT'";

        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          if (results.rows.length > 0) {
            var clienteTemp: any = results.rows.item(0);
            cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta += trunc_number(
              clienteTemp.TOTAL_AMOUNT,
              configuracionDecimales.defaultCalculationsDecimals
            );
          } else {
            cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta += trunc_number(
              0,
              configuracionDecimales.defaultCalculationsDecimals
            );
          }
          cliente.cuentaCorriente.saldoActual +=
            cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta;
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener facturas vencidas: " + err.message
        });
      }
    );
  }

  validarDatosGeneralesCuentaCorriente(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      this.tareaServicio.obtenerRegla(
        "NoValidarAntiguedadDeSaldos",
        (reglas: Regla[]) => {
          if (reglas.length > 0) {
            if (reglas[0].enabled === "Si") {
              callback(cliente);
            } else {
              this.validarAntiguedadDeSaldos(
                cliente,
                (clienteN1: Cliente) => {
                  callback(clienteN1);
                },
                (resultado: Operacion) => {
                  callbackError(resultado);
                }
              );
            }
          } else {
            this.validarAntiguedadDeSaldos(
              cliente,
              (clienteN1: Cliente) => {
                callback(clienteN1);
              },
              (resultado: Operacion) => {
                callbackError(resultado);
              }
            );
          }
        },
        (reultado: Operacion) => {
          callbackError(reultado);
        }
      );
    } catch (err) {
      callbackError(<Operacion>{
        codigo: -1,
        mensaje: "Error al validar cuenta corriente: " + err.message
      });
    }
  }

  validarAntiguedadDeSaldos(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      if (cliente.cuentaCorriente.facturasVencidas) {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Tiene facturas vencidas"
        });
      } else if (cliente.cuentaCorriente.limiteDeCredito <= 0) {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "El cliente no tiene configurado el límite de crédito"
        });
      } else if (cliente.cuentaCorriente.diasCredito <= 0) {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "El cliente no tiene configurado la cantidad de días de crédito"
        });
      } else if (cliente.cuentaCorriente.diasCreditoVencidos) {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Tiene una factura emitida que ya vencieron los días de crédito"
        });
      } else {
        callback(cliente);
      }
    } catch (err) {
      callbackError(<Operacion>{
        codigo: -1,
        mensaje: "Error al validar cuenta corriente: " + err.message
      });
    }
  }

  validarCuentaCorriente(
    cliente: Cliente,
    listasku: Sku[],
    ordenDeVentaTipo: any,
    configuracionDecimales: ManejoDeDecimales,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      var totalSku = 0;

      for (var i = 0; i < listasku.length; i++) {
        var sku = listasku[i];
        totalSku += trunc_number(
          sku.qty * sku.cost,
          configuracionDecimales.defaultCalculationsDecimals
        );
      }

      if (ordenDeVentaTipo === OrdenDeVentaTipo.Contado) {
        callback(cliente);
      } else {
        if (
          trunc_number(
            cliente.cuentaCorriente.saldoActual + cliente.totalAmout + totalSku,
            configuracionDecimales.defaultCalculationsDecimals
          ) <=
          trunc_number(
            cliente.cuentaCorriente.limiteDeCredito,
            configuracionDecimales.defaultCalculationsDecimals
          )
        ) {
          my_dialog("", "", "closed");
          callback(cliente);
        } else {
          my_dialog("", "", "close");
          callbackError(<Operacion>{
            codigo: -1,
            mensaje: "El crédito es insuficiente"
          });
        }
      }
    } catch (err) {
      callbackError(<Operacion>{
        codigo: -1,
        mensaje: "Error al validar cuenta corriente: " + err.message
      });
    }
  }

  enviarSolicitudParaObtenerCuentaCorriente(
    socketIo: SocketIOClient.Socket,
    cliente: Cliente,
    opcionValidarSaldoCliente: string,
    ordenDeVentaTipo: string,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      var data = {
        Total:
          cliente.totalAmout +
          cliente.cuentaCorriente.saldoActualDeOrdenesDeVenta,
        CodeCustomer: cliente.clientId,
        sku: "",
        cantidad: 0,
        source: opcionValidarSaldoCliente,
        salesOrderType: ordenDeVentaTipo,
        dbuser: gdbuser,
        dbuserpass: gdbuserpass,
        routeid: gCurrentRoute
      };
      socketIo.emit("GetCurrentAccountByCustomer", data);
      callback(cliente);
    } catch (err) {
      var operacion = new Operacion();
      operacion.resultado = ResultadoOperacionTipo.Error;
      operacion.codigo = err.code;
      operacion.mensaje = err.message;
      callbackError(operacion);
    }
  }

  obtenerTodosLosClientesAbordo(
    criterio: String,
    callback: (clientes: Cliente[]) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      var clientes: Cliente[] = [];
      SONDA_DB_Session.transaction(
        tx => {
          var sql = "SELECT";
          sql += " C.CLIENT_ID";
          sql += " ,C.CLIENT_NAME";
          sql += " ,C.CLIENT_TAX_ID";
          sql += " ,C.ADDRESS";
          sql += " ,C.PHONE";
          sql += " ,C.CLIENT_HH_ID_OLD";
          sql += " ,C.CONTACT_CUSTOMER";
          sql += " ,C.GPS";
          sql += " ,C.REFERENCE";
          sql += " ,C.DISCOUNT";
          sql += " ,C.RGA_CODE";
          sql += " ,C.PRICE_LIST_ID";
          sql += " FROM CLIENTS C";
          sql +=
            " WHERE C.CLIENT_ID NOT IN(SELECT RELATED_CLIENT_CODE FROM PRESALES_ROUTE) AND";
          sql +=
            " (C.CLIENT_ID LIKE '" +
            "%" +
            criterio +
            "%" +
            "' OR C.CLIENT_NAME LIKE '" +
            "%" +
            criterio +
            "%" +
            "' OR C.ADDRESS LIKE '" +
            "%" +
            criterio +
            "%" +
            "' OR C.RGA_CODE = '" +
            criterio +
            "' )";
          tx.executeSql(
            sql,
            [],
            (tx: SqlTransaction, results: SqlResultSet) => {
              for (var i = 0; i < results.rows.length; i++) {
                var clienteTemp: any = results.rows.item(i);
                var clienteRespuesta: Cliente = <Cliente>{
                  clientId: clienteTemp.CLIENT_ID,
                  clientName: clienteTemp.CLIENT_NAME,
                  clientTaxId: clienteTemp.CLIENT_TAX_ID,
                  address: clienteTemp.ADDRESS,
                  phone: clienteTemp.PHONE,
                  clientHhIdOld: clienteTemp.CLIENT_HH_ID_OLD,
                  contactCustomer: clienteTemp.CONTACT_CUSTOMER,
                  gps: clienteTemp.GPS,
                  discountMax: clienteTemp.DISCOUNT,
                  discount: 0,
                  appliedDiscount: 0,
                  totalAmout: 0,
                  cuentaCorriente: new CuentaCorriente(),
                  deliveryDate: new Date(),
                  skus: "",
                  rgaCode: clienteTemp.RGA_CODE,
                  priceListId: clienteTemp.PRICE_LIST_ID
                };
                clientes.push(clienteRespuesta);
              }
              callback(clientes);
            }
          );
        },
        (err: SqlError) => {
          callbackError(<Operacion>{
            codigo: -1,
            mensaje: "Error al obtener el Cliente: " + err.message
          });
        }
      );
    } catch (err) {
      var operacion = new Operacion();
      operacion.resultado = ResultadoOperacionTipo.Error;
      operacion.codigo = err.code;
      operacion.mensaje = err.message;
      callbackError(operacion);
    }
  }

  obtenerEtiquetas(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = " SELECT TC.*";
        sql += " ,T.TAG_VALUE_TEXT";
        sql += " ,T.TAG_PRIORITY";
        sql += " ,T.TAG_COMMENTS";
        sql += " FROM TAGS_X_CUSTOMER TC";
        sql += " INNER JOIN TAGS T ON (T.TAG_COLOR = TC.TAG_COLOR)";
        sql += " WHERE CUSTOMER = '" + cliente.clientId + "'";
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          var listaEtiquetas: Etiqueta[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            let etiquetaSql: any = results.rows.item(i);
            let etiqueta: Etiqueta = <Etiqueta>{
              tagColor: etiquetaSql.TAG_COLOR,
              tagValueText: etiquetaSql.TAG_VALUE_TEXT,
              tagPriority: etiquetaSql.TAG_PRIORITY,
              tagComments: etiquetaSql.TAG_COMMENTS
            };
            listaEtiquetas.push(etiqueta);
          }
          cliente.etiquetas = listaEtiquetas;
          callback(cliente);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje: "Error al obtener etiquetas del Cliente: " + err.message
        });
      }
    );
  }

  obtnerFormatoSqlDeInsertarClienteModificado(
    cliente: Cliente,
    sequence: string
  ) {
    let sql = `INSERT INTO CUSTOMER_CHANGE (CUSTOMER_CHANGE_ID,
                CODE_CUSTOMER,
                PHONE_CUSTOMER,
                ADRESS_CUSTOMER,
                CONTACT_CUSTOMER,
                GPS,
                POSTED_DATETIME,
                POSTED_BY,
                CODE_ROUTE,
                IS_POSTED,
                TAX_ID,
                INVOICE_NAME,
                CUSTOMER_NAME,
                NEW_CUSTOMER_NAME,
                DEVICE_NETWORK_TYPE,
                IS_POSTED_OFFLINE)
                VALUES('${sequence}'
                ,'${cliente.clientId}'
                ,'${cliente.phone}'
                ,'${cliente.address}'
                ,'${cliente.contactCustomer}'
                ,'${cliente.gps}'
                ,'${getDateTime()}'
                ,'${gLastLogin}'
                ,'${gCurrentRoute}'
                ,0
                ,'${cliente.invoiceTaxId}'
                ,'${cliente.invoiceName}'
                ,'${cliente.clientName}'
                ,'${cliente.clientNewName}'
                ,'${tipoDeRedALaQueEstaConectadoElDispositivo}'
                ,${gIsOnline === SiNo.Si ? 0 : 1});`;
    return sql;
  }

  obtnerFormatoSqlDeInsertarEtiquetaDeClienteModificado(
    cliente: Cliente,
    etiqueta: Etiqueta,
    sequence: string
  ) {
    let sql = `INSERT INTO TAG_X_CUSTOMER_CHANGE (
                CUSTOMER_CHANGE_ID,
                TAG_COLOR,
                CODE_CUSTOMER,
                DEVICE_NETWORK_TYPE,
                IS_POSTED_OFFLINE)
                VALUES(
                '${sequence}'
                ,'${etiqueta.tagColor}'
                ,'${cliente.clientId}'
                ,'${tipoDeRedALaQueEstaConectadoElDispositivo}'
                ,${gIsOnline === SiNo.Si ? 0 : 1});`;
    return sql;
  }

  guardarCambiosDeCliente(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    this.obtenerSecuenciaDeCambios(
      this,
      (sequence: string, controlador: any) => {
        SONDA_DB_Session.transaction(
          tx => {
            var sql = controlador.obtnerFormatoSqlDeInsertarClienteModificado(
              cliente,
              sequence
            );
            tx.executeSql(sql);
            for (let i = 0; i < cliente.etiquetas.length; i++) {
              sql = controlador.obtnerFormatoSqlDeInsertarEtiquetaDeClienteModificado(
                cliente,
                cliente.etiquetas[i],
                sequence
              );
              tx.executeSql(sql);
            }
            callback(cliente);
          },
          (err: SqlError) => {
            callbackError(<Operacion>{
              codigo: -1,
              mensaje:
                "Error al insertar el los cambios del cliente: " + err.message
            });
          }
        );
      }
    );
  }

  obtenerSecuenciaDeCambios(
    controlador: any,
    callback: (sequence: string, controlador: any) => void
  ) {
    try {
      GetNexSequence(
        "CUSTOMER_CHANGE",
        sequence => {
          callback(sequence, controlador);
        },
        err => {
          notify("Error al obtener sequencia de cambios: " + err.message);
        }
      );
    } catch (err) {
      notify("Error al obtener secuencia de cambios: " + err.message);
    }
  }

  obtenerEtiquetasNoAsociadasAlCliente(
    cliente: Cliente,
    callback: (etiquetas: Etiqueta[]) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    SONDA_DB_Session.transaction(
      tx => {
        var sql = " SELECT T.TAG_COLOR";
        sql += " ,T.TAG_VALUE_TEXT";
        sql += " ,T.TAG_PRIORITY";
        sql += " ,T.TAG_COMMENTS";
        sql += " FROM TAGS T";
        sql +=
          " LEFT JOIN TAGS_X_CUSTOMER TC ON (T.TAG_COLOR = TC.TAG_COLOR) AND CUSTOMER = '" +
          cliente.clientId +
          "'";
        sql += " WHERE CUSTOMER IS NULL";
        tx.executeSql(sql, [], (tx: SqlTransaction, results: SqlResultSet) => {
          var listaEtiquetas: Etiqueta[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            let etiquetaSql: any = results.rows.item(i);
            let etiqueta: Etiqueta = <Etiqueta>{
              tagColor: etiquetaSql.TAG_COLOR,
              tagValueText: etiquetaSql.TAG_VALUE_TEXT,
              tagPriority: etiquetaSql.TAG_PRIORITY,
              tagComments: etiquetaSql.TAG_COMMENTS
            };
            listaEtiquetas.push(etiqueta);
          }
          callback(listaEtiquetas);
        });
      },
      (err: SqlError) => {
        callbackError(<Operacion>{
          codigo: -1,
          mensaje:
            "Error al obtener etiquetas no asociadas al cliente: " + err.message
        });
      }
    );
  }

  obtenerClienteBo(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    callbackError: (resultado: Operacion) => void
  ) {
    try {
      SONDA_DB_Session.transaction(
        tx => {
          var sql = "SELECT";
          sql += " C.CLIENT_ID";
          sql += " FROM CLIENTS C";
          sql += " WHERE C.CLIENT_HH_ID_OLD = '" + cliente.clientHhIdOld + "'";
          sql += " OR C.CLIENT_ID = '" + cliente.clientHhIdOld + "'";
          tx.executeSql(
            sql,
            [],
            (tx: SqlTransaction, results: SqlResultSet) => {
              if (results.rows.length > 0) {
                var clienteTemp: any = results.rows.item(0);
                cliente.clientId = clienteTemp.CLIENT_ID;
              } else {
                callbackError(<Operacion>{
                  codigo: -1,
                  mensaje:
                    "Error al obtener el codigo de cliente: Sin resultados"
                });
              }
              callback(cliente);
            }
          );
        },
        (err: SqlError) => {
          callbackError(<Operacion>{
            codigo: -1,
            mensaje: "Error al obtener el codigo de cliente: " + err.message
          });
        }
      );
    } catch (err) {
      var operacion = new Operacion();
      operacion.resultado = ResultadoOperacionTipo.Error;
      operacion.codigo = err.code;
      operacion.mensaje = err.message;
      callbackError(operacion);
    }
  }
}
