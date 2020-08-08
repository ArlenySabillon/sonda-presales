function ObtenerSecuenciaSiguiente(tipoDocumento, callback, errCallback) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "UPDATE DOCUMENT_SEQUENCE";
      sql += " SET CURRENT_DOC = (CURRENT_DOC + 1)";
      sql += " WHERE DOC_TYPE = '" + tipoDocumento + "'";

      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          ObtenerSecuencia(
            tx,
            tipoDocumento,
            function(serie, numeroDeDocumento) {
              ValidarCantidadRestante(tipoDocumento);
              callback(serie, numeroDeDocumento);
            },
            function(err) {
              errCallback(err);
            }
          );
        },
        function(tx, err) {
          if (err.code !== 0) errCallback(err);
        }
      );
    },
    function(err) {
      errCallback(err);
    }
  );
}

function ObtenerSecuencia(tx, tipoDocumento, callback, errCallback) {
  var sql = "SELECT SERIE,CURRENT_DOC";
  sql += " FROM DOCUMENT_SEQUENCE";
  sql += " WHERE DOC_TYPE = '" + tipoDocumento + "'";

  tx.executeSql(
    sql,
    [],
    function(tx, results) {
      if (results.rows.length > 0) {
        callback(results.rows.item(0).SERIE, results.rows.item(0).CURRENT_DOC);
      } else {
        errCallback({
          code: -1,
          message:
            " La Ruta actual no cuenta con Secuencia de Documentos de tipo " +
            tipoDocumento
        });
      }
    },
    function(tx, err) {
      if (err.code !== 0) errCallback(err);
    }
  );
}

function ValidarCantidadRestante(tipoDocumento) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT (DOC_TO - CURRENT_DOC) REMAINING";
      sql += " FROM DOCUMENT_SEQUENCE";
      sql += " WHERE DOC_TYPE = '" + tipoDocumento + "'";

      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          if (
            results.rows.item(0).REMAINING <
            AlertaRestanteDeSecuenciaDeDocumentos
          ) {
            switch (tipoDocumento) {
              case TipoDocumento.OrdenDeVenta:
                notify(
                  "Alerta: Solo le restan " +
                    results.rows.item(0).REMAINING +
                    " documentos de ordenes de venta disponibles"
                );
                break;
              default:
                notify(
                  "Alerta: Solo le restan " +
                    results.rows.item(0).REMAINING +
                    " documentos de " +
                    tipoDocumento +
                    "disponibles"
                );
                break;
            }
          }
        },
        function(tx, err) {
          ToastThis("No se pudo validar cantidad restante de documentos");
        }
      );
    },
    function(err) {
      ToastThis("No se pudo validar cantidad restante de documentos");
    }
  );
}

function ObtenerCantidadDeSecuenciasDisponibles(
  tipoDocumento,
  callback,
  errCallback
) {
  SONDA_DB_Session.transaction(
    function(tx) {
      var sql = "SELECT  *, (DOC_TO - CURRENT_DOC) AVAILABLE ";
      sql += " FROM DOCUMENT_SEQUENCE ";
      sql += " WHERE DOC_TYPE = '" + tipoDocumento + "'";

      tx.executeSql(
        sql,
        [],
        function(tx, results) {
          if (results.rows.length >= 1) {
            callback(
              results.rows.item(0).DOC_TYPE,
              results.rows.item(0).DOC_FROM,
              results.rows.item(0).DOC_TO,
              results.rows.item(0).SERIE,
              results.rows.item(0).CURRENT_DOC,
              results.rows.item(0).AVAILABLE
            );
          } else {
            errCallback("No se encontro la secuencia.");
          }
        },
        function(tx, err) {
          if (err.code !== 0) errCallback(err);
        }
      );
    },
    function(err) {
      errCallback(err);
    }
  );
}

function ValidarSequenciaDeDocumentos(
  tipoDeDocumento,
  callBack,
  errorCallBack
) {
  var error = "";
  var sql = "";
  try {
    SONDA_DB_Session.transaction(
      function(tx) {
        sql =
          "SELECT 1 AS VALIDA FROM DOCUMENT_SEQUENCE WHERE ((CURRENT_DOC + 1) >= DOC_FROM AND (CURRENT_DOC + 1) <= DOC_TO) AND DOC_TYPE = '" +
          tipoDeDocumento +
          "' ";
        tx.executeSql(
          sql,
          [],
          function(tx2, results) {
            if (results.rows.length > 0) {
              if (parseInt(results.rows.item(0).VALIDA) === 1) {
                callBack(true);
              } else {
                callBack(false);
              }
            } else {
              callBack(false);
            }
          },
          function(tx2, err) {
            if (err.code !== 0) {
              error =
                "No se pudo validar la Secuencia de Documentos debido a: " +
                err.message;
              errorCallBack(error);
            }
          }
        );
      },
      function(err) {
        if (err.code !== 0) {
          error =
            "No se pudo validar la Secuencia de Documentos debido a: " +
            err.message;
          errorCallBack(error);
        }
      }
    );
  } catch (e) {
    error =
      "No se pudo validar la existencia de la Secuencia de Documentos debido a: " +
      e.message;
    errorCallBack(error);
  }
}
