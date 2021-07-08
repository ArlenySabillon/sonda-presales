var EncuestaControlador = (function() {
    function EncuestaControlador(mensajero) {
        this.mensajero = mensajero;
        this.encuestaServicio = new EncuestaServicio();
        this.clienteServicio = new ClienteServicio();
        this.encuestas = [];
        this.tokenEncuestaMensaje = mensajero.subscribe(this.encuestaMensajeEntregado, getType(EncuestaMensaje), this);
    }
    EncuestaControlador.prototype.delegarEncuestaControlador = function() {
        var _this = this;
        $("#UiSurveyPage").on("pageshow", function(e) {
            my_dialog("", "", "close");
            e.preventDefault();
            _this.cargarDatosDeEncuestaAProcesar();
        });
        $("#UiBtnCancelClientSurvey").on("click", function(e) {
            e.preventDefault();
            _this.solicitarConfirmacionDeUsuario(function() {
                _this.regresarAPantallaAnterior();
            });
        });
        $("#UiBtnSaveClientSurvey").on("click", function(e) {
            e.preventDefault();
            BloquearPantalla();
            _this.usuarioDeseaGuardarEncuestaDeCliente();
        });
    };
    EncuestaControlador.prototype.encuestaMensajeEntregado = function(mensaje, subscriber) {
        subscriber.encuestas = mensaje.encuestas;
        subscriber.numeroDeEncuestaEnProceso = mensaje.numeroDeEncuestaAProcesar;
        subscriber.callbackAction = mensaje.callbackAction;
        subscriber.tareaEsBorrador = mensaje.isFromDraft;
    };
    EncuestaControlador.prototype.procesarErrores = function(error) {
        DesBloquearPantalla();
        notify(error.mensaje);
    };
    EncuestaControlador.prototype.limpiarDatosDeEncuesta = function(callback) {
        this.encuestas.length = 0;
        this.encuestaEnProceso = new Microencuesta();
        this.numeroDeEncuestaEnProceso = 0;
        callback();
    };
    EncuestaControlador.prototype.regresarAPantallaAnterior = function() {
        var _this = this;
        this.limpiarDatosDeEncuesta(function() {
            _this.callbackAction();
            var timeOut = setTimeout(function() {
                _this.callbackAction = function() {};
                clearTimeout(timeOut);
                DesBloquearPantalla();
            }, 1000);
        });
    };
    EncuestaControlador.prototype.cargarDatosDeEncuestaAProcesar = function() {
        var _this = this;
        if (this.numeroDeEncuestaEnProceso <= this.encuestas.length - 1) {
            this.encuestaEnProceso = this.encuestas[this.numeroDeEncuestaEnProceso];
            this.encuestaEnProceso.isFromDraft = this.tareaEsBorrador;
            this.establecerTituloYOpcionesGeneralesDeEncuesta(function() {
                _this.construirListadoDePreguntasDeEncuesta(function() {
                    DesBloquearPantalla();
                }, _this.procesarErrores);
            }, this.procesarErrores);
        } else {
            this.regresarAPantallaAnterior();
        }
    };
    EncuestaControlador.prototype.establecerVisualizacionDeBotonAtras = function(visualizarBoton) {
        var botonAtras = $("#UiBtnCancelClientSurveyContainer");
        var botonGuardarEncuesta = $("#UiBtnSaveClientSurveyContainer");
        if (visualizarBoton) {
            botonAtras.css("display", "none");
            botonAtras = null;
            botonGuardarEncuesta.css("width", "100%");
            botonGuardarEncuesta = null;
        } else {
            botonAtras.css("display", "block");
            botonAtras.css("width", "50%");
            botonAtras = null;
            botonGuardarEncuesta.css("width", "50%");
            botonGuardarEncuesta = null;
        }
    };
    EncuestaControlador.prototype.establecerTituloYOpcionesGeneralesDeEncuesta = function(callback, errorCallbak) {
        try {
            this.establecerVisualizacionDeBotonAtras(this.encuestaEnProceso.isMandatory == 1);
            var tituloEncuesta = $("#UiSurveyName");
            tituloEncuesta.text(this.encuestaEnProceso.name);
            tituloEncuesta = null;
            callback();
        } catch (error) {
            errorCallbak({
                codigo: -1,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: error.message
            });
        }
    };
    EncuestaControlador.prototype.construirListadoDePreguntasDeEncuesta = function(callback, errorCallbak) {
        var _this = this;
        try {
            var contenedorDePreguntas_1 = $("#UiSurveyQuestionsContainer");
            contenedorDePreguntas_1.children().remove();
            contenedorDePreguntas_1.empty();
            this.encuestaEnProceso.questions.forEach(function(pregunta) {
                var li = [];
                li.push("<li>");
                li.push("<span>");
                li.push("" + pregunta.question);
                li.push("</span>");
                li.push(_this.obtenerObjetoHtmlDePreguntaEnBaseATipoDePregunta(pregunta));
                li.push("</li>");
                contenedorDePreguntas_1.append(li.join(""));
            });
            contenedorDePreguntas_1.trigger("create");
            callback();
        } catch (error) {
            errorCallbak({
                codigo: -1,
                resultado: ResultadoOperacionTipo.Error,
                mensaje: error.message
            });
        }
    };
    EncuestaControlador.prototype.obtenerObjetoHtmlDePreguntaEnBaseATipoDePregunta = function(pregunta) {
        if (pregunta.typeQuestion == TipoDePregunta.Unica)
            return this.construirHtmlParaPreguntaDeTipoSeleccionUnica(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Multiple)
            return this.construirHtmlParaPreguntaDeTipoSeleccionMultiple(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Texto)
            return this.construirHtmlParaPreguntaDeTipoTexto(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Numero)
            return this.construirHtmlParaPreguntaDeTipoNumero(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Fecha)
            return this.construirHtmlParaPreguntaDeTipoFecha(pregunta);
    };
    EncuestaControlador.prototype.construirHtmlParaPreguntaDeTipoTexto = function(pregunta) {
        var html = [];
        html.push("<form>");
        html.push("<p>");
        html.push("<textarea cols=\"40\" name=\"PRE_" + pregunta.id + "\" id=\"PRE_" + pregunta.id + "\"></textarea>");
        html.push("</p>");
        html.push("</form>");
        return html.join("");
    };
    EncuestaControlador.prototype.construirHtmlParaPreguntaDeTipoNumero = function(pregunta) {
        var html = [];
        html.push("<input is=\"text-input\" type=\"number\" id=\"PRE_" + pregunta.id + "\" name=\"PRE_" + pregunta.id + "\">");
        return html.join("");
    };
    EncuestaControlador.prototype.construirHtmlParaPreguntaDeTipoFecha = function(pregunta) {
        var html = [];
        html.push("<form>");
        html.push("<input is=\"date-input\" id=\"PRE_" + pregunta.id + "\" type=\"date\">");
        html.push("</form>");
        return html.join("");
    };
    EncuestaControlador.prototype.construirHtmlParaPreguntaDeTipoSeleccionMultiple = function(pregunta) {
        var html = [];
        html.push("<form>");
        html.push("<fieldset is=\"controlgroup-radio\" data-role=\"controlgroup\" id=\"PRE_" + pregunta.id + "\">");
        pregunta.answers.forEach(function(respuesta) {
            html.push("<input is=\"checkbox-button\" VALUE=\"" + respuesta.answer + "\" type=\"checkbox\" name=\"RES_" + respuesta.id + "\" id=\"RES_" + respuesta.id + "\">");
            html.push("<label for=\"RES_" + respuesta.id + "\">" + respuesta.answer + "</label>");
        });
        html.push("</fieldset>");
        html.push("</form>");
        return html.join("");
    };
    EncuestaControlador.prototype.construirHtmlParaPreguntaDeTipoSeleccionUnica = function(pregunta) {
        var html = [];
        pregunta.answers.unshift({
            id: null,
            questionId: null,
            answer: "Seleccionar"
        });
        html.push("<form>");
        html.push("<select is=\"selectmenu\" id=\"PRE_" + pregunta.id + "\">");
        pregunta.answers.forEach(function(respuesta) {
            html.push("<option value=\"" + respuesta.answer + "\">" + respuesta.answer + "</option>");
        });
        html.push("</select>");
        html.push("</form>");
        return html.join("");
    };
    EncuestaControlador.prototype.solicitarConfirmacionDeUsuario = function(callback) {
        navigator.notification.confirm("¿Está seguro de abandonar la encuesta?", function(buttonIndex) {
            if (buttonIndex === 2) {
                callback();
            }
        }, "Sonda® " + SondaVersion, "No,Si");
    };
    EncuestaControlador.prototype.usuarioDeseaGuardarEncuestaDeCliente = function() {
        var _this = this;
        try {
            this.obtenerRespuestasDeUsuario(0, function() {
                var almacenarEncuestaProcesada = function() {
                    _this.verificarRespuestasAPreguntas(function() {
                        _this.encuestaServicio.prepararDatosParaGuardarEncuestaProcesadaACliente(_this.encuestaEnProceso, function(encuestaDeCliente) {
                            _this.encuestaServicio.guardarEncuestaProcesadaACliente(encuestaDeCliente, function() {
                                _this.encuestaServicio.actualizarSecuenciaDeDocumentos(TIpoDeDocumento.EncuestaDeCliente.toString(), encuestaDeCliente[0].docNum, function() {
                                    _this.numeroDeEncuestaEnProceso++;
                                    var timeOut = setTimeout(function() {
                                        _this.cargarDatosDeEncuestaAProcesar();
                                        clearTimeout(timeOut);
                                    }, 1000);
                                }, _this.procesarErrores);
                            }, _this.procesarErrores);
                        }, _this.procesarErrores);
                    });
                };
                var encuestaEsObligatoria = _this.encuestaActualEsObligatoria();
                if (encuestaEsObligatoria) {
                    var preguntasObligatoriasDeEncuestaActual = _this.obtenerPreguntasObligatorias();
                    if (preguntasObligatoriasDeEncuestaActual &&
                        preguntasObligatoriasDeEncuestaActual.length > 0) {
                        _this.verificarRespuestasAPreguntasObligatorias(preguntasObligatoriasDeEncuestaActual, function() {
                            _this.encuestaServicio.prepararDatosParaGuardarEncuestaProcesadaACliente(_this.encuestaEnProceso, function(encuestaDeCliente) {
                                _this.encuestaServicio.guardarEncuestaProcesadaACliente(encuestaDeCliente, function() {
                                    _this.encuestaServicio.actualizarSecuenciaDeDocumentos(TIpoDeDocumento.EncuestaDeCliente.toString(), encuestaDeCliente[0].docNum, function() {
                                        _this.numeroDeEncuestaEnProceso++;
                                        var timeOut = setTimeout(function() {
                                            _this.cargarDatosDeEncuestaAProcesar();
                                            clearTimeout(timeOut);
                                        }, 1000);
                                    }, _this.procesarErrores);
                                }, _this.procesarErrores);
                            }, _this.procesarErrores);
                        });
                    } else {
                        almacenarEncuestaProcesada();
                    }
                } else {
                    almacenarEncuestaProcesada();
                }
            });
        } catch (error) {
            DesBloquearPantalla();
            notify(error.message);
        }
    };
    EncuestaControlador.prototype.verificarRespuestasAPreguntasObligatorias = function(preguntasObligatorias, callback) {
        var preguntasObligatoriasSinRespuesta = preguntasObligatorias.filter(function(preguntaObligatoria) {
            return preguntaObligatoria.answersOfUser.length <= 0;
        });
        if (preguntasObligatoriasSinRespuesta &&
            preguntasObligatoriasSinRespuesta.length > 0) {
            throw new Error("La encuesta en proceso tiene preguntas obligatorias que aún no se han respondido.");
        } else {
            callback();
        }
    };
    EncuestaControlador.prototype.verificarRespuestasAPreguntas = function(callback) {
        var preguntasSinResponder = this.encuestaEnProceso.questions.filter(function(pregunta) {
            return pregunta.answersOfUser.length <= 0 && pregunta.required == 1;
        });
        if (preguntasSinResponder && preguntasSinResponder.length > 0) {
            throw new Error("Debe responder todas las preguntas.");
        } else {
            callback();
        }
    };
    EncuestaControlador.prototype.obtenerRespuestasDeUsuario = function(numeroDePregunta, callback) {
        if (numeroDePregunta <= this.encuestaEnProceso.questions.length - 1) {
            var pregunta = this.encuestaEnProceso.questions[numeroDePregunta];
            pregunta.answersOfUser.length = 0;
            pregunta.answersOfUser = this.obtenerRespuestasPorTipoDePregunta(pregunta);
            this.obtenerRespuestasDeUsuario(numeroDePregunta + 1, callback);
        } else {
            callback();
        }
    };
    EncuestaControlador.prototype.obtenerRespuestasPorTipoDePregunta = function(pregunta) {
        if (pregunta.typeQuestion == TipoDePregunta.Unica)
            return this.obtenerRespuestasDePreguntaDeTipoSeleccionUnica(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Multiple)
            return this.obtenerRespuestasDePreguntaDeTipoSeleccionMultiple(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Texto)
            return this.obtenerRespuestasDePreguntaDeTipoTexto(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Numero)
            return this.obtenerRespuestasDePreguntaDeTipoNumero(pregunta);
        if (pregunta.typeQuestion == TipoDePregunta.Fecha)
            return this.obtenerRespuestasDePreguntaDeTipoFecha(pregunta);
    };
    EncuestaControlador.prototype.encuestaActualEsObligatoria = function() {
        return this.encuestaEnProceso.isMandatory == 1;
    };
    EncuestaControlador.prototype.obtenerPreguntasObligatorias = function() {
        var preguntasObligatorias = this.encuestaEnProceso.questions.filter(function(pregunta) {
            return pregunta.required == 1;
        });
        return preguntasObligatorias;
    };
    EncuestaControlador.prototype.obtenerRespuestasDePreguntaDeTipoTexto = function(pregunta) {
        var objetoPregunta = $("#PRE_" + pregunta.id);
        var respuestas = [];
        if (objetoPregunta && objetoPregunta.val().trim() != "") {
            var respuesta = new Respuesta();
            respuesta.questionId = pregunta.id;
            respuesta.answer = objetoPregunta.val();
            respuestas.push(respuesta);
            return respuestas;
        } else {
            return respuestas;
        }
    };
    EncuestaControlador.prototype.obtenerRespuestasDePreguntaDeTipoNumero = function(pregunta) {
        var objetoPregunta = $("#PRE_" + pregunta.id);
        var respuestas = [];
        if (objetoPregunta && objetoPregunta.val()) {
            var respuesta = new Respuesta();
            respuesta.questionId = pregunta.id;
            respuesta.answer = objetoPregunta.val();
            respuestas.push(respuesta);
            return respuestas;
        } else {
            return respuestas;
        }
    };
    EncuestaControlador.prototype.obtenerRespuestasDePreguntaDeTipoFecha = function(pregunta) {
        var objetoPregunta = $("#PRE_" + pregunta.id);
        var respuestas = [];
        if (objetoPregunta && objetoPregunta.val() != "") {
            var respuesta = new Respuesta();
            respuesta.questionId = pregunta.id;
            respuesta.answer = objetoPregunta.val();
            respuestas.push(respuesta);
            return respuestas;
        } else {
            return respuestas;
        }
    };
    EncuestaControlador.prototype.obtenerRespuestasDePreguntaDeTipoSeleccionMultiple = function(pregunta) {
        var respuestas = [];
        pregunta.answers.forEach(function(respuestaEnPregunta) {
            var respuestaSeleccionada = $("#RES_" + respuestaEnPregunta.id).is(":checked");
            if (respuestaSeleccionada) {
                var respuesta = new Respuesta();
                respuesta.questionId = pregunta.id;
                respuesta.answer = "" + $("#RES_" + respuestaEnPregunta.id).attr("VALUE");
                respuestas.push(respuesta);
            }
        });
        return respuestas;
    };
    EncuestaControlador.prototype.obtenerRespuestasDePreguntaDeTipoSeleccionUnica = function(pregunta) {
        var objetoPregunta = $("#PRE_" + pregunta.id);
        var respuestas = [];
        if (objetoPregunta &&
            objetoPregunta.val() != "" &&
            objetoPregunta.val() != "null" &&
            objetoPregunta.val() != "Seleccionar") {
            var respuesta = new Respuesta();
            respuesta.questionId = pregunta.id;
            respuesta.answer = objetoPregunta.val();
            respuestas.push(respuesta);
            return respuestas;
        } else {
            return respuestas;
        }
    };
    return EncuestaControlador;
}());
//# sourceMappingURL=EncuestaControlador.js.map