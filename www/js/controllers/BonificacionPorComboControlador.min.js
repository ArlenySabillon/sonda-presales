var BonificacionPorComboControlador = (function () {
    function BonificacionPorComboControlador(mensajero) {
        this.mensajero = mensajero;
        this.bonoServicio = new BonoServicio();
        this.usuarioPuedeModificarBonificacionDeCombo = false;
        this.tokenCombo = mensajero.subscribe(this.bonificacionPorCombo, getType(BonoPorComboMensaje), this);
    }
    BonificacionPorComboControlador.prototype.delegarBonificacionPorComboControlador = function () {
        var este = this;
        document.addEventListener("backbutton", function () {
            este.usuarioDeseaVerPantallaAnterior();
        }, true);
        $(document).on("pagebeforechange", function (event, data) {
            if (data.toPage === "UiPageBonusByCombo") {
                este.listaDeSkuBonificacionPorCombo = data.options.data.listaDeSkuBonificacionPorCombo;
                este.indice = data.options.data.indice;
                este.cargarPantalla();
                $.mobile.changePage("#UiPageBonusByCombo");
            }
        });
        $("#uiBtnAceptarBonificacionDeCombo").on("click", function () {
            este.validarSkusBonificacion(function () {
                este.publicarBonoPorCombo(este.listaDeSkuBonificacionPorCombo, este.indice, function () {
                    este.usuarioDeseaVerPantallaAnterior();
                });
            }, function (resultado) {
                notify(resultado.mensaje);
            });
        });
        $("#uiBtnCancelarBonificacionDeCombo").on("click", function () {
            este.usuarioDeseaRetornarAListadoDeVenta();
        });
    };
    BonificacionPorComboControlador.prototype.cargarSkusBonificacionPorCombo = function () {
        try {
            my_dialog("Cargando...", "Cargando lista de SKUs bonificados, por favor, espere...", "open");
            var objetoListaDeSkuBonificados = $("#uiListaSkuBonificacionCombo");
            objetoListaDeSkuBonificados.children().remove("li");
            var esElPrimero = !(this.listaDeSkuBonificacionPorCombo.isConfig);
            var lblTitulo = $("#UiLblComboBonificacion");
            var etiquetaPrincipalCombos = $("#etiquetaPrincipalCombos");
            if (this.listaDeSkuBonificacionPorCombo.bonusSubType === SubTipoDeBonificacionPorCombo.Multiple.toString()) {
                lblTitulo.html(this.listaDeSkuBonificacionPorCombo.nameCombo + " <br>" + DescripcionSubTipoDeBonificacionPorCombo.Multiple.toString());
                etiquetaPrincipalCombos.html('Debe de escoger por lo menos una bonificación');
                esElPrimero = false;
            }
            else {
                etiquetaPrincipalCombos.html("Solo puede escoger una bonificación");
                lblTitulo.html(this.listaDeSkuBonificacionPorCombo.nameCombo + "<br>Bonificación " + DescripcionSubTipoDeBonificacionPorCombo.Unica.toString());
            }
            var li = '<li data-icon="false">';
            li += '<table name="' + this.listaDeSkuBonificacionPorCombo.comboId + '" id= "' + this.listaDeSkuBonificacionPorCombo.comboId + '" data-role="table" data-mode="reflow" class="ui-responsive table-stroke">';
            var indice = 0;
            for (var _i = 0, _a = this.listaDeSkuBonificacionPorCombo.skusDeBonoPorCombo; _i < _a.length; _i++) {
                var skuBonificado = _a[_i];
                li += "<tr>";
                li += '<td style="width: 15%">';
                li += '<input type="';
                li += (this.listaDeSkuBonificacionPorCombo.bonusSubType === SubTipoDeBonificacionPorCombo.Multiple.toString()) ? 'checkbox' : 'radio';
                li += "\" class=\"configuracionBonificacionPorCombo\" name=\"eleccionDeBonificacionPorCombo\" id=\"e" + skuBonificado.codeSku + "|" + skuBonificado.codePackUnit + "\" value=\"" + skuBonificado.codeSku + "|" + skuBonificado.codePackUnit + "|" + skuBonificado.qty + "|" + indice + "\" ";
                li += (esElPrimero || skuBonificado.isCheacked || (!this.usuarioPuedeModificarBonificacionDeCombo && this.listaDeSkuBonificacionPorCombo.bonusSubType === SubTipoDeBonificacionPorCombo.Multiple.toString()) ? 'checked="checked" ' : "");
                li += (!this.usuarioPuedeModificarBonificacionDeCombo && this.listaDeSkuBonificacionPorCombo.bonusSubType === SubTipoDeBonificacionPorCombo.Multiple.toString()) ? "disabled />" : "/>";
                li += "</td>";
                li += '<td style="width: 90%;word-wrap: break-word;word-break: break-all;">';
                li += "<p>" + skuBonificado.codeSku + "</p>" +
                    "<p>" + skuBonificado.descriptionSku + "</p>" +
                    "<p>" + skuBonificado.descriptionPackUnit + "</p>";
                if (this.usuarioPuedeModificarBonificacionDeCombo === false) {
                    li += "<p class='small-roboto id='cant" + skuBonificado.codeSku + "|" + skuBonificado.codePackUnit + "'>" + skuBonificado.qty + "</p>";
                }
                else {
                    var cantidadParaBonificar = (localStorage.getItem("USE_MAX_BONUS") === "1" ? skuBonificado.qty : "");
                    cantidadParaBonificar = (skuBonificado.isCheacked ? skuBonificado.selectedQty : cantidadParaBonificar);
                    li += "<input class='configuracionBonificacionPorComboCantidad ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset' type='number' pattern='[0-9]*' id='cant" + skuBonificado.codeSku + skuBonificado.codePackUnit + "' value='" + cantidadParaBonificar + "' placeholder='Bonificacion Maxima " + skuBonificado.qty + "'/>";
                }
                li += "</td>";
                li += "</tr>";
                if (esElPrimero) {
                    esElPrimero = false;
                }
                indice++;
            }
            if (this.usuarioPuedeModificarBonificacionDeCombo && this.listaDeSkuBonificacionPorCombo.bonusSubType === SubTipoDeBonificacionPorCombo.Unica.toString()) {
                li += "<tr>";
                li += '<td style="width: 15%">';
                li += '<input type="radio" class="configuracionBonificacionPorCombo" name="eleccionDeBonificacionPorCombo" id="none" value="none" ' + ((this.listaDeSkuBonificacionPorCombo.isConfig && this.listaDeSkuBonificacionPorCombo.isEmpty) ? 'checked="checked" ' : "") + '/>';
                li += "</td>";
                li += '<td style="width: 60%">';
                li += "<span>Ninguno</span>";
                li += "</td>";
                li += "</tr>";
            }
            li += "</table></li>";
            objetoListaDeSkuBonificados.append(li);
            objetoListaDeSkuBonificados.listview("refresh");
            li = null;
            lblTitulo = null;
            objetoListaDeSkuBonificados = null;
            my_dialog("", "", "close");
        }
        catch (e) {
            my_dialog("", "", "close");
            notify("No se ha podido cargar la lista de SKUs a bonificar debido a: " + e.message);
        }
    };
    BonificacionPorComboControlador.prototype.usuarioDeseaVerPantallaAnterior = function () {
        switch ($.mobile.activePage[0].id) {
            case "UiPageBonusByCombo":
                this.usuarioDeseaRetornarAListadoDeVenta();
                break;
        }
    };
    BonificacionPorComboControlador.prototype.usuarioDeseaRetornarAListadoDeVenta = function () {
        window.history.back();
    };
    BonificacionPorComboControlador.prototype.bonificacionPorCombo = function (mensaje, subcriber) {
        subcriber.listaDeSkuBonificacionPorCombo = mensaje.bonoPorCombo;
        subcriber.indice = mensaje.indice;
    };
    BonificacionPorComboControlador.prototype.publicarBonoPorCombo = function (bonoPorCombo, index, callback) {
        var msg = new BonoPorComboMensaje(this);
        msg.bonoPorCombo = bonoPorCombo;
        msg.indice = index;
        this.mensajero.publish(msg, getType(BonoPorComboMensaje));
        callback();
    };
    BonificacionPorComboControlador.prototype.validarSkusBonificacion = function (callback, errCallback) {
        var _this = this;
        try {
            this.colocarComoNoSelecionado(function () {
                var bonificacionesPorCombo = [];
                var sku;
                var skuSeleccionado;
                var valorDeObjeto = "";
                var sinErrores = true;
                if (_this.listaDeSkuBonificacionPorCombo.bonusSubType ===
                    SubTipoDeBonificacionPorCombo.Multiple.toString()) {
                    $('input[type="checkbox"]').filter('.configuracionBonificacionPorCombo')
                        .map(function (index, element) {
                        var control = element;
                        if (control.checked) {
                            var datosDeBono = control.value.split("|");
                            var cantidad = parseInt(datosDeBono[ComboBonoParser.CantidadMaxima]);
                            skuSeleccionado = _this.listaDeSkuBonificacionPorCombo.skusDeBonoPorCombo[datosDeBono[ComboBonoParser.Indice]];
                            if (_this.usuarioPuedeModificarBonificacionDeCombo) {
                                valorDeObjeto = obtenerValorDeObjeto("cant" + datosDeBono[ComboBonoParser.CodigoDeSku] + datosDeBono[ComboBonoParser.UnidadDeMedida]);
                                cantidad = (valorDeObjeto === '' ? 0 : parseInt(valorDeObjeto));
                            }
                            if (cantidad > 0 && cantidad <= parseInt(datosDeBono[ComboBonoParser.CantidadMaxima])) {
                                skuSeleccionado.selectedQty = cantidad;
                                skuSeleccionado.isCheacked = true;
                                bonificacionesPorCombo.push(skuSeleccionado);
                                datosDeBono.length = 0;
                                skuSeleccionado = null;
                                _this.listaDeSkuBonificacionPorCombo.isEmpty = false;
                            }
                            else {
                                if (cantidad !== 0) {
                                    sinErrores = false;
                                    errCallback({ codigo: -1, mensaje: "Error: La cantidad ingresada debe ser entre 1 y " + datosDeBono[ComboBonoParser.CantidadMaxima] });
                                    return;
                                }
                            }
                        }
                        control = null;
                    });
                }
                else {
                    var control = $('input[name=eleccionDeBonificacionPorCombo]:checked');
                    if (control.val() === "none") {
                        _this.listaDeSkuBonificacionPorCombo.isEmpty = true;
                    }
                    else {
                        var datosDeBono = control.val().split("|");
                        var cantidad = parseInt(datosDeBono[ComboBonoParser.CantidadMaxima]);
                        skuSeleccionado = _this.listaDeSkuBonificacionPorCombo.skusDeBonoPorCombo[datosDeBono[ComboBonoParser.Indice]];
                        if (_this.usuarioPuedeModificarBonificacionDeCombo) {
                            valorDeObjeto = obtenerValorDeObjeto("cant" + datosDeBono[ComboBonoParser.CodigoDeSku] + datosDeBono[ComboBonoParser.UnidadDeMedida]);
                            cantidad = (valorDeObjeto === '' ? 0 : parseInt(valorDeObjeto));
                        }
                        if (cantidad > 0 && cantidad <= parseInt(datosDeBono[ComboBonoParser.CantidadMaxima])) {
                            skuSeleccionado.selectedQty = cantidad;
                            skuSeleccionado.isCheacked = true;
                            bonificacionesPorCombo.push(skuSeleccionado);
                            datosDeBono.length = 0;
                            skuSeleccionado = null;
                            _this.listaDeSkuBonificacionPorCombo.isEmpty = false;
                        }
                        else {
                            errCallback({ codigo: -1, mensaje: "Error: La cantidad ingresada debe de estar entre 1 y " + datosDeBono[ComboBonoParser.CantidadMaxima] });
                            sinErrores = false;
                            return false;
                        }
                    }
                    control = null;
                }
                if (sinErrores) {
                    if (bonificacionesPorCombo.length > 0) {
                        _this.listaDeSkuBonificacionPorCombo.skusDeBonoPorComboAsociados = bonificacionesPorCombo;
                    }
                    else {
                        _this.listaDeSkuBonificacionPorCombo.isEmpty = true;
                    }
                    _this.listaDeSkuBonificacionPorCombo.isConfig = true;
                    callback();
                }
            });
        }
        catch (e) {
            errCallback({ codigo: -1, mensaje: "Error al validar configuracion: " + e.message });
        }
    };
    BonificacionPorComboControlador.prototype.colocarComoNoSelecionado = function (callback) {
        this.listaDeSkuBonificacionPorCombo.skusDeBonoPorCombo.map(function (skuBonificado) {
            skuBonificado.isCheacked = false;
        });
        callback();
    };
    BonificacionPorComboControlador.prototype.cargarPantalla = function () {
        var _this = this;
        this.bonoServicio.validarSiModificaBonificacionPorCombo(function (puedeModificar) {
            _this.usuarioPuedeModificarBonificacionDeCombo = puedeModificar;
            _this.cargarSkusBonificacionPorCombo();
        }, function (resultado) {
            _this.usuarioPuedeModificarBonificacionDeCombo = false;
            notify("Error al validar si puede modificar la bonificacion por combo: " + resultado.mensaje);
        });
    };
    return BonificacionPorComboControlador;
}());
//# sourceMappingURL=BonificacionPorComboControlador.js.map