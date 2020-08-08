var ImpresionServicio = (function () {
    function ImpresionServicio() {
        this.manejoDeDecimalesServicio = new ManejoDeDecimalesServicio();
    }
    ImpresionServicio.prototype.validarEstadosYImprimir = function (esImpresoZebra, macAddress, documento, tambienImprimir, callback) {
        if (esImpresoZebra) {
            this.validarYimprimir(macAddress.split(":").join(""), documento, tambienImprimir, function (resultado) {
                callback(resultado);
            });
        }
        else {
            if (tambienImprimir) {
                ConectarImpresora(macAddress, function () {
                    documento += '! U1 getvar "device.host_status"\r\n';
                    ImprimirDocumento(documento, function () {
                        DesconectarImpresora(function (result) {
                            callback({
                                resultado: ResultadoOperacionTipo.Exitoso,
                                codigo: 1,
                                mensaje: "Exitoso"
                            });
                        }, function (err) {
                            callback({
                                resultado: ResultadoOperacionTipo.Error,
                                codigo: -1,
                                mensaje: " " + err
                            });
                        });
                    }, function (err) {
                        callback({
                            resultado: ResultadoOperacionTipo.Error,
                            codigo: -1,
                            mensaje: " " + err
                        });
                    });
                });
            }
            else {
                callback({
                    resultado: ResultadoOperacionTipo.Exitoso,
                    codigo: 1,
                    mensaje: "Exitoso"
                });
            }
        }
    };
    ImpresionServicio.prototype.validarYimprimir = function (macAddress, documento, tambienImprimir, callback) {
        var _this = this;
        window.linkOsPlugin.disconnect();
        window.linkOsPlugin.connect(macAddress).then(function (result) {
            window.linkOsPlugin.getStatus(macAddress, true).then(function (result) {
                if (result.isReadyToPrint) {
                    if (tambienImprimir) {
                        window.linkOsPlugin.printCPCL(documento).then(function (result) {
                            window.linkOsPlugin.disconnect();
                            callback({
                                resultado: ResultadoOperacionTipo.Exitoso,
                                codigo: 1,
                                mensaje: "Exitoso"
                            });
                        }, function (err) {
                            window.linkOsPlugin.disconnect();
                            navigator.notification.confirm("Error: " +
                                _this.obtenerMensajeTraducido(err.message) +
                                " ¿Desea intentarlo nuevamente?", function (respuesta) {
                                if (respuesta === 2) {
                                    _this.validarYimprimir(macAddress, documento, tambienImprimir, callback);
                                }
                                else {
                                    callback({
                                        resultado: ResultadoOperacionTipo.Error,
                                        codigo: -1,
                                        mensaje: "Get printer status failed: " + err
                                    });
                                }
                            }, "Sonda\u00AE " + SondaVersion, "No,Si");
                        });
                    }
                    else {
                        window.linkOsPlugin.disconnect();
                        callback({
                            resultado: ResultadoOperacionTipo.Exitoso,
                            codigo: 1,
                            mensaje: "Exitoso"
                        });
                    }
                }
                else {
                    window.linkOsPlugin.disconnect();
                    navigator.notification.confirm("Error: " +
                        _this.obtenerMensajeTraducido(result.message) +
                        " ¿Desea intentarlo nuevamente?", function (respuesta) {
                        if (respuesta === 2) {
                            _this.validarYimprimir(macAddress, documento, tambienImprimir, callback);
                        }
                        else {
                            callback({
                                resultado: ResultadoOperacionTipo.Error,
                                codigo: -1,
                                mensaje: "The printer is not ready : " + result.message
                            });
                        }
                    }, "Sonda\u00AE " + SondaVersion, "No,Si");
                }
            }, function (err) {
                window.linkOsPlugin.disconnect();
                navigator.notification.confirm("Error: " +
                    _this.obtenerMensajeTraducido(err.message) +
                    " ¿Desea intentarlo nuevamente?", function (respuesta) {
                    if (respuesta === 2) {
                        _this.validarYimprimir(macAddress, documento, tambienImprimir, callback);
                    }
                    else {
                        callback({
                            resultado: ResultadoOperacionTipo.Error,
                            codigo: -1,
                            mensaje: "Get printer status failed: " + err
                        });
                    }
                }, "Sonda\u00AE " + SondaVersion, "No,Si");
            });
        }, function (err) {
            window.linkOsPlugin.disconnect();
            navigator.notification.confirm("Error: " +
                _this.obtenerMensajeTraducido(err) +
                " ¿Desea intentarlo nuevamente?", function (respuesta) {
                if (respuesta === 2) {
                    _this.validarYimprimir(macAddress, documento, tambienImprimir, callback);
                }
                else {
                    callback({
                        resultado: ResultadoOperacionTipo.Error,
                        codigo: -1,
                        mensaje: "No connect: " + err
                    });
                }
            }, "Sonda\u00AE " + SondaVersion, "No,Si");
        });
    };
    ImpresionServicio.prototype.obtenerMensajeTraducido = function (mensaje) {
        var cadena = mensaje;
        switch (mensaje.toUpperCase()) {
            case "CANNOT ESTABLISH CONNECTION":
                cadena = "No se puede establecer la conexión.";
                break;
            case "PAPER OUT":
                cadena = "Sin papel.";
                break;
            case "HEAD OPEN":
                cadena = "Tapa abierta.";
                break;
            case "HEAD OPEN;PAPER OUT":
                cadena = "Tapa abierta.";
                break;
        }
        return cadena;
    };
    ImpresionServicio.prototype.impresionDePrueba = function (esImpresoZebra, macAddress, callback) {
        this.validarEstadosYImprimir(esImpresoZebra, macAddress, this.obterFormatoDePrueba(), true, function (resultado) {
            callback(resultado);
        });
    };
    ImpresionServicio.prototype.obterFormatoDePrueba = function () {
        var cadena = "";
        cadena = "! 0 50 50 620 1\r\n";
        cadena +=
            "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
        cadena += "CENTER 570 T 0 3 0 10 MOBILITY SCM\r\n";
        cadena += "B QR 380 60 M 2 U 8 \r\n";
        cadena += "M0A,1234515155-1/1\r\n";
        cadena += "ENDQR \r\n";
        cadena += "LEFT 5 T 4 4 0 70 1/1\r\n";
        cadena += "L 5 240 570 240 1\r\n";
        cadena += "CENTER 570 T 0 3 0 270 GUIA: 1234515155\r\n";
        cadena += "LEFT 5 T 0 2 0 300 REMITENTE    : CODIGO Y NOMBRE REMITENTE\r\n";
        cadena +=
            "LEFT 5 T 0 2 0 330 DESTINATARIO : CODIGO Y NOMBRE DESTINATARIO\r\n";
        cadena += "LEFT 5 T 0 2 0 360 DIRECCION DESTINARIO 1\r\n";
        cadena += "LEFT 5 T 0 2 0 390 COURIER      : CODIGO, NOMBRE COURIER\r\n";
        cadena += "LEFT 5 T 0 2 0 420 FECHA Y HORA : " + getDateTime() + "\r\n";
        cadena += "L 5 470 570 470 1\r\n";
        cadena += "CENTER 570 T 0 1 1 500 www.mobilityscm.com\r\n";
        cadena += "\r\nPRINT\r\n";
        return cadena;
    };
    ImpresionServicio.prototype.obtenerFormatoDeImpresionDePago = function (documentoDePago, callback, errorCallback) {
        var _this = this;
        this.manejoDeDecimalesServicio.obtenerInformacionDeManejoDeDecimales(function (configuracionDecimales) {
            try {
                var pagosEnEfectivo = documentoDePago.overdueInvoicePaymentTypeDetail.filter(function (pago) {
                    return pago.paymentType === TipoDePagoFacturaVencida.Efectivo;
                });
                var pagosEnCheque = documentoDePago.overdueInvoicePaymentTypeDetail.filter(function (pago) {
                    return pago.paymentType === TipoDePagoFacturaVencida.Cheque;
                });
                var pagosEnDeposito = documentoDePago.overdueInvoicePaymentTypeDetail.filter(function (pago) {
                    return pago.paymentType === TipoDePagoFacturaVencida.Deposito;
                });
                var pagosEnTarjeta = documentoDePago.overdueInvoicePaymentTypeDetail.filter(function (pago) {
                    return pago.paymentType === TipoDePagoFacturaVencida.Tarjeta;
                });
                var totalDePagoEnDepositos = 0;
                var totalDePagoEnCheques = 0;
                var totalDePagoEnTarjetas = 0;
                pagosEnDeposito.forEach(function (pago) {
                    totalDePagoEnDepositos += pago.amount;
                });
                pagosEnCheque.forEach(function (pago) {
                    totalDePagoEnCheques += pago.amount;
                });
                pagosEnTarjeta.forEach(function (pago) {
                    totalDePagoEnTarjetas += pago.amount;
                });
                var posicionDeLinea = 10;
                var formato = "";
                formato = "! 0 50 50 _DOC_LEN_ 1\r\n";
                formato +=
                    "! U1 LMARGIN 10\r\n! U\r\n! U1 PAGE-WIDTH 1400\r\nON-FEED IGNORE\r\n";
                formato +=
                    "CENTER 550 T 7 0 0 " +
                        posicionDeLinea +
                        " " +
                        _this.centerText(localStorage.getItem("NAME_ENTERPRISE") || "") +
                        "\r\n";
                posicionDeLinea += 30;
                formato +=
                    "CENTER 550 T 7 0 0 " +
                        posicionDeLinea +
                        " " +
                        _this.centerText(documentoDePago.branchName) +
                        "\r\n";
                if (documentoDePago.branchAddress.length > 30) {
                    posicionDeLinea += 30;
                    formato +=
                        "CENTER 550 T 0 2 0 " +
                            posicionDeLinea +
                            " " +
                            documentoDePago.branchAddress.substring(0, 30) +
                            "\r\n";
                    posicionDeLinea += 30;
                    formato +=
                        "CENTER 550 T 0 2 0 " +
                            posicionDeLinea +
                            " " +
                            documentoDePago.branchAddress.substring(31, documentoDePago.branchAddress.length - 1) +
                            "\r\n";
                }
                else {
                    posicionDeLinea += 30;
                    formato +=
                        "CENTER 550 T 0 2 0 " +
                            posicionDeLinea +
                            " " +
                            documentoDePago.branchAddress +
                            "\r\n";
                }
                posicionDeLinea += 20;
                formato +=
                    "L 0 " + posicionDeLinea + " 575 " + posicionDeLinea + " 2 \r\n";
                posicionDeLinea += 5;
                formato += "CENTER 575 \r\n";
                formato +=
                    "T 7 0 0 " +
                        posicionDeLinea +
                        " CLIENTE: " +
                        documentoDePago.codeCustomer +
                        "\r\n";
                posicionDeLinea += 20;
                formato += "CENTER 575 \r\n";
                formato +=
                    "T 7 0 0 " +
                        posicionDeLinea +
                        " SERIE: " +
                        documentoDePago.docSerie +
                        "\r\n";
                posicionDeLinea += 20;
                formato += "CENTER 575 \r\n";
                formato +=
                    "T 7 0 0 " +
                        posicionDeLinea +
                        "RECIBO #: " +
                        documentoDePago.docNum +
                        "\r\n";
                if (documentoDePago.isReprint) {
                    posicionDeLinea += 30;
                    formato +=
                        "CENTER 550 T 7 0 0 " +
                            posicionDeLinea +
                            " *** COPIA CONTABILIDAD ***\r\n";
                }
                else {
                    posicionDeLinea += 30;
                    formato +=
                        "CENTER 550 T 7 0 0 " +
                            posicionDeLinea +
                            " *** ORIGINAL CLIENTE ***\r\n";
                }
                posicionDeLinea += 30;
                formato += "LEFT 5 T 7 0 0 " + posicionDeLinea + " Factura No. \r\n";
                formato +=
                    "RIGHT 550 T 7 0 0 " + posicionDeLinea + " Monto Cancelado\r\n";
                posicionDeLinea += 20;
                formato +=
                    "L 0 " + posicionDeLinea + " 575 " + posicionDeLinea + " 2 \r\n";
                var totalFacturas = 0;
                documentoDePago.overdueInvoicePaymentDetail.forEach(function (detalleDePago, numeroDeIteracion) {
                    if (numeroDeIteracion === 0) {
                        posicionDeLinea += 20;
                    }
                    else {
                        posicionDeLinea += 30;
                    }
                    totalFacturas += detalleDePago.payedAmount;
                    formato +=
                        "LEFT 5 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            detalleDePago.invoiceId +
                            "\r\n";
                    formato +=
                        "RIGHT 550 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            (configuracionDecimales.currencySymbol + " " + format_number(detalleDePago.payedAmount, configuracionDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                });
                posicionDeLinea += 20;
                formato +=
                    "RIGHT 550 T 7 0 0 " +
                        posicionDeLinea +
                        " Total Facturas: " +
                        (configuracionDecimales.currencySymbol + " " + format_number(totalFacturas, configuracionDecimales.defaultDisplayDecimals)) +
                        "\r\n";
                posicionDeLinea += 30;
                formato +=
                    "CENTER 550 T 7 0 0 " + posicionDeLinea + " DETALLE DE PAGOS\r\n";
                if (pagosEnEfectivo.length > 0) {
                    posicionDeLinea += 30;
                    formato += "LEFT 5 T 7 0 5 " + posicionDeLinea + " Efectivo\r\n";
                    formato +=
                        "RIGHT 550 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            (configuracionDecimales.currencySymbol + " " + format_number(pagosEnEfectivo[0].amount, configuracionDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                }
                if (pagosEnDeposito.length > 0) {
                    posicionDeLinea += 30;
                    formato += "LEFT 5 T 7 0 5 " + posicionDeLinea + " Depósitos\r\n";
                    formato +=
                        "RIGHT 550 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            (configuracionDecimales.currencySymbol + " " + format_number(totalDePagoEnDepositos, configuracionDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                    pagosEnDeposito.forEach(function (pago, numeroDeIteracion) {
                        if (numeroDeIteracion === 0) {
                            posicionDeLinea += 25;
                        }
                        else {
                            posicionDeLinea += 20;
                        }
                        formato +=
                            "LEFT 5 T 7 0 15 " +
                                posicionDeLinea +
                                " " +
                                pago.bankName +
                                " " +
                                pago.documentNumber +
                                "\r\n";
                        formato +=
                            "LEFT 5 T 7 0 300 " +
                                posicionDeLinea +
                                " " +
                                (configuracionDecimales.currencySymbol + " " + format_number(pago.amount, configuracionDecimales.defaultDisplayDecimals)) +
                                "\r\n";
                    });
                }
                if (pagosEnCheque.length > 0) {
                    posicionDeLinea += 30;
                    formato += "LEFT 5 T 7 0 5 " + posicionDeLinea + " Cheques\r\n";
                    formato +=
                        "RIGHT 550 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            (configuracionDecimales.currencySymbol + " " + format_number(totalDePagoEnCheques, configuracionDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                    pagosEnCheque.forEach(function (pago, numeroDeIteracion) {
                        if (numeroDeIteracion === 0) {
                            posicionDeLinea += 25;
                        }
                        else {
                            posicionDeLinea += 20;
                        }
                        formato +=
                            "LEFT 5 T 7 0 15 " +
                                posicionDeLinea +
                                " " +
                                pago.bankName +
                                " " +
                                pago.documentNumber +
                                "\r\n";
                        formato +=
                            "LEFT 5 T 7 0 300 " +
                                posicionDeLinea +
                                " " +
                                (configuracionDecimales.currencySymbol + " " + format_number(pago.amount, configuracionDecimales.defaultDisplayDecimals)) +
                                "\r\n";
                    });
                }
                if (pagosEnTarjeta.length > 0) {
                    posicionDeLinea += 30;
                    formato += "LEFT 5 T 7 0 5 " + posicionDeLinea + " Tarjetas\r\n";
                    formato +=
                        "RIGHT 550 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            (configuracionDecimales.currencySymbol + " " + format_number(totalDePagoEnTarjetas, configuracionDecimales.defaultDisplayDecimals)) +
                            "\r\n";
                    pagosEnTarjeta.forEach(function (pago, numeroDeIteracion) {
                        if (numeroDeIteracion === 0) {
                            posicionDeLinea += 25;
                        }
                        else {
                            posicionDeLinea += 20;
                        }
                        formato +=
                            "LEFT 5 T 7 0 15 " +
                                posicionDeLinea +
                                " " +
                                pago.bankName +
                                " " +
                                pago.documentNumber +
                                "\r\n";
                        formato +=
                            "LEFT 5 T 7 0 300 " +
                                posicionDeLinea +
                                " " +
                                (configuracionDecimales.currencySymbol + " " + format_number(pago.amount, configuracionDecimales.defaultDisplayDecimals)) +
                                "\r\n";
                    });
                }
                posicionDeLinea += 25;
                formato +=
                    "L 0 " + posicionDeLinea + " 575 " + posicionDeLinea + " 2 \r\n";
                posicionDeLinea += 20;
                formato +=
                    "RIGHT 550 T 7 0 0 " +
                        posicionDeLinea +
                        " Total de Pagos: " +
                        (configuracionDecimales.currencySymbol + " " + format_number(documentoDePago.paymentAmount, configuracionDecimales.defaultDisplayDecimals)) +
                        "\r\n";
                if (documentoDePago.paidComment) {
                    posicionDeLinea += 20;
                    formato +=
                        "LEFT 5 T 7 0 0 " +
                            posicionDeLinea +
                            " " +
                            documentoDePago.paidComment +
                            "\r\n";
                }
                posicionDeLinea += 30;
                formato +=
                    "CENTER 550 T 0 2 0 " +
                        posicionDeLinea +
                        " [" +
                        gIsOnline +
                        "] " +
                        getDateTime() +
                        " / RUTA " +
                        gCurrentRoute +
                        " \r\n";
                if (documentoDePago.reprint) {
                    posicionDeLinea += 30;
                    formato +=
                        "CENTER 550 T 7 0 0 " +
                            posicionDeLinea +
                            " *** RE-IMPRESO *** \r\n";
                }
                posicionDeLinea += 20;
                formato = formato + "PRINT\r\n";
                formato = formato.replace("_DOC_LEN_", (posicionDeLinea + 100).toString());
                callback(formato);
            }
            catch (e) {
                errorCallback(e.message);
            }
        }, null);
    };
    ImpresionServicio.prototype.centerText = function (text) {
        if (text.length > 30) {
            var line1 = text.substring(0, 30);
            var line2 = text.substring(31, text.length - 1);
            return line1 + "\r\n" + line2;
        }
        else {
            return text;
        }
    };
    return ImpresionServicio;
}());
//# sourceMappingURL=ImpresionServicio.js.map