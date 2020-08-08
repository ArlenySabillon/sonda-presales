class EncuestaControlador {
  tokenEncuestaMensaje: SubscriptionToken;

  encuestaServicio: EncuestaServicio = new EncuestaServicio();
  clienteServicio: ClienteServicio = new ClienteServicio();

  encuestas: Microencuesta[] = [];
  numeroDeEncuestaEnProceso: number;
  callbackAction: () => void;
  encuestaEnProceso: Microencuesta;
  tareaEsBorrador: boolean;

  constructor(public mensajero: Messenger) {
    this.tokenEncuestaMensaje = mensajero.subscribe<EncuestaMensaje>(
      this.encuestaMensajeEntregado,
      getType(EncuestaMensaje),
      this
    );
  }

  delegarEncuestaControlador(): void {
    $("#UiSurveyPage").on("pageshow", (e: JQueryEventObject) => {
      my_dialog("", "", "close");
      e.preventDefault();
      this.cargarDatosDeEncuestaAProcesar();
    });

    $("#UiBtnCancelClientSurvey").on("click", (e: JQueryEventObject) => {
      e.preventDefault();
      this.solicitarConfirmacionDeUsuario(() => {
        this.regresarAPantallaAnterior();
      });
    });

    $("#UiBtnSaveClientSurvey").on("click", (e: JQueryEventObject) => {
      e.preventDefault();
      BloquearPantalla();
      this.usuarioDeseaGuardarEncuestaDeCliente();
    });
  }

  encuestaMensajeEntregado(mensaje: EncuestaMensaje, subscriber: any): void {
    subscriber.encuestas = mensaje.encuestas;
    subscriber.numeroDeEncuestaEnProceso = mensaje.numeroDeEncuestaAProcesar;
    subscriber.callbackAction = mensaje.callbackAction;
    subscriber.tareaEsBorrador = mensaje.isFromDraft;
  }

  procesarErrores(error: Operacion): void {
    DesBloquearPantalla();
    notify(error.mensaje);
  }

  limpiarDatosDeEncuesta(callback: () => void): void {
    this.encuestas.length = 0;
    this.encuestaEnProceso = new Microencuesta();
    this.numeroDeEncuestaEnProceso = 0;
    callback();
  }

  regresarAPantallaAnterior(): void {
    this.limpiarDatosDeEncuesta(() => {
      this.callbackAction();
      let timeOut = setTimeout(() => {
        this.callbackAction = () => {};
        clearTimeout(timeOut);
        DesBloquearPantalla();
      }, 1000);
    });
  }

  cargarDatosDeEncuestaAProcesar(): void {
    if (this.numeroDeEncuestaEnProceso <= this.encuestas.length - 1) {
      this.encuestaEnProceso = this.encuestas[this.numeroDeEncuestaEnProceso];
      
      this.encuestaEnProceso.isFromDraft = this.tareaEsBorrador;
      this.establecerTituloYOpcionesGeneralesDeEncuesta(() => {
      this.construirListadoDePreguntasDeEncuesta(() => {
          DesBloquearPantalla();
        }, this.procesarErrores);
      }, this.procesarErrores);
    } else {
      this.regresarAPantallaAnterior();
    }
  }

  establecerVisualizacionDeBotonAtras(visualizarBoton: boolean): void {
    let botonAtras = $("#UiBtnCancelClientSurveyContainer");
    let botonGuardarEncuesta = $("#UiBtnSaveClientSurveyContainer");

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
  }

  establecerTituloYOpcionesGeneralesDeEncuesta(
    callback: () => void,
    errorCallbak: (error: Operacion) => void
  ): void {
    try {
      this.establecerVisualizacionDeBotonAtras(
        this.encuestaEnProceso.isMandatory == 1
      );
      let tituloEncuesta = $("#UiSurveyName");
      tituloEncuesta.text(this.encuestaEnProceso.name);
      tituloEncuesta = null;
      callback();
    } catch (error) {
      errorCallbak({
        codigo: -1,
        resultado: ResultadoOperacionTipo.Error,
        mensaje: error.message
      } as Operacion);
    }
  }

  construirListadoDePreguntasDeEncuesta(
    callback: () => void,
    errorCallbak: (error: Operacion) => void
  ): void {
    try {
      let contenedorDePreguntas = $("#UiSurveyQuestionsContainer");
      contenedorDePreguntas.children().remove();

      contenedorDePreguntas.empty();
      this.encuestaEnProceso.questions.forEach((pregunta: Pregunta) => {
        let li: string[] = [];
        li.push(`<li>`);
        li.push(`<span>`);
        li.push(`${pregunta.question}`);
        li.push(`</span>`);
        li.push(
          this.obtenerObjetoHtmlDePreguntaEnBaseATipoDePregunta(pregunta)
        );
        li.push(`</li>`);
        contenedorDePreguntas.append(li.join(""));
      });
      contenedorDePreguntas.trigger("create");

      callback();
    } catch (error) {
      errorCallbak({
        codigo: -1,
        resultado: ResultadoOperacionTipo.Error,
        mensaje: error.message
      } as Operacion);
    }
  }

  obtenerObjetoHtmlDePreguntaEnBaseATipoDePregunta(pregunta: Pregunta): string {
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
  }

  construirHtmlParaPreguntaDeTipoTexto(pregunta: Pregunta): string {
    let html: string[] = [];

    html.push(`<form>`);
    html.push(`<p>`);
    html.push(
      `<textarea cols="40" name="PRE_${pregunta.id}" id="PRE_${
        pregunta.id
      }"></textarea>`
    );
    html.push(`</p>`);
    html.push(`</form>`);

    return html.join("");
  }

  construirHtmlParaPreguntaDeTipoNumero(pregunta: Pregunta): string {
    let html: string[] = [];

    html.push(
      `<input is="text-input" type="number" id="PRE_${pregunta.id}" name="PRE_${
        pregunta.id
      }">`
    );

    return html.join("");
  }

  construirHtmlParaPreguntaDeTipoFecha(pregunta: Pregunta): string {
    let html: string[] = [];

    html.push(`<form>`);
    html.push(`<input is="date-input" id="PRE_${pregunta.id}" type="date">`);
    html.push(`</form>`);

    return html.join("");
  }

  construirHtmlParaPreguntaDeTipoSeleccionMultiple(pregunta: Pregunta): string {
    let html: string[] = [];
    html.push(`<form>`);
    html.push(
      `<fieldset is="controlgroup-radio" data-role="controlgroup" id="PRE_${
        pregunta.id
      }">`
    );

    pregunta.answers.forEach((respuesta: Respuesta) => {
      html.push(
        `<input is="checkbox-button" VALUE="${
          respuesta.answer
        }" type="checkbox" name="RES_${respuesta.id}" id="RES_${respuesta.id}">`
      );
      html.push(`<label for="RES_${respuesta.id}">${respuesta.answer}</label>`);
    });

    html.push(`</fieldset>`);
    html.push(`</form>`);

    return html.join("");
  }

  construirHtmlParaPreguntaDeTipoSeleccionUnica(pregunta: Pregunta): string {
    let html: string[] = [];
    pregunta.answers.unshift({
      id: null,
      questionId: null,
      answer: "Seleccionar"
    } as Respuesta);

    html.push(`<form>`);
    html.push(`<select is="selectmenu" id="PRE_${pregunta.id}">`);

    pregunta.answers.forEach((respuesta: Respuesta) => {
      html.push(
        `<option value="${respuesta.answer}">${respuesta.answer}</option>`
      );
    });

    html.push(`</select>`);
    html.push(`</form>`);

    return html.join("");
  }

  solicitarConfirmacionDeUsuario(callback: () => void): void {
    navigator.notification.confirm(
      "¿Está seguro de abandonar la encuesta?",
      buttonIndex => {
        if (buttonIndex === 2) {
          callback();
        }
      },
      "Sonda® " + SondaVersion,
      <any>"No,Si"
    );
  }

  usuarioDeseaGuardarEncuestaDeCliente(): void {
    try {
      this.obtenerRespuestasDeUsuario(0, () => {
        let almacenarEncuestaProcesada = () => {
          this.verificarRespuestasAPreguntas(() => {
            this.encuestaServicio.prepararDatosParaGuardarEncuestaProcesadaACliente(
              this.encuestaEnProceso,
              (encuestaDeCliente: EncuestaDeCliente[]) => {
                this.encuestaServicio.guardarEncuestaProcesadaACliente(
                  encuestaDeCliente,
                  () => {
                    this.encuestaServicio.actualizarSecuenciaDeDocumentos(
                      TIpoDeDocumento.EncuestaDeCliente.toString(),
                      encuestaDeCliente[0].docNum,
                      () => {
                        this.numeroDeEncuestaEnProceso++;
                        let timeOut = setTimeout(() => {
                          this.cargarDatosDeEncuestaAProcesar();
                          clearTimeout(timeOut);
                        }, 1000);
                      },
                      this.procesarErrores
                    );
                  },
                  this.procesarErrores
                );
              },
              this.procesarErrores
            );
          });
        };

        let encuestaEsObligatoria = this.encuestaActualEsObligatoria();

        if (encuestaEsObligatoria) {
          let preguntasObligatoriasDeEncuestaActual = this.obtenerPreguntasObligatorias();
          if (
            preguntasObligatoriasDeEncuestaActual &&
            preguntasObligatoriasDeEncuestaActual.length > 0
          ) {
            this.verificarRespuestasAPreguntasObligatorias(
              preguntasObligatoriasDeEncuestaActual,
              () => {
                this.encuestaServicio.prepararDatosParaGuardarEncuestaProcesadaACliente(
                  this.encuestaEnProceso,
                  (encuestaDeCliente: EncuestaDeCliente[]) => {
                    this.encuestaServicio.guardarEncuestaProcesadaACliente(
                      encuestaDeCliente,
                      () => {
                        this.encuestaServicio.actualizarSecuenciaDeDocumentos(
                          TIpoDeDocumento.EncuestaDeCliente.toString(),
                          encuestaDeCliente[0].docNum,
                          () => {
                            this.numeroDeEncuestaEnProceso++;
                            let timeOut = setTimeout(() => {
                              this.cargarDatosDeEncuestaAProcesar();
                              clearTimeout(timeOut);
                            }, 1000);
                          },
                          this.procesarErrores
                        );
                      },
                      this.procesarErrores
                    );
                  },
                  this.procesarErrores
                );
              }
            );
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
  }

  verificarRespuestasAPreguntasObligatorias(
    preguntasObligatorias: Pregunta[],
    callback: () => void
  ): void {
    let preguntasObligatoriasSinRespuesta: Pregunta[] = preguntasObligatorias.filter(
      (preguntaObligatoria: Pregunta) => {
        return preguntaObligatoria.answersOfUser.length <= 0;
      }
    );

    if (
      preguntasObligatoriasSinRespuesta &&
      preguntasObligatoriasSinRespuesta.length > 0
    ) {
      throw new Error(
        "La encuesta en proceso tiene preguntas obligatorias que aún no se han respondido."
      );
    } else {
      callback();
    }
  }

  verificarRespuestasAPreguntas(callback: () => void): void {
    let preguntasSinResponder: Pregunta[] = this.encuestaEnProceso.questions.filter(
      (pregunta: Pregunta) => {
        return pregunta.answersOfUser.length <= 0;
      }
    );

    if (preguntasSinResponder && preguntasSinResponder.length > 0) {
      throw new Error("Debe responder todas las preguntas.");
    } else {
      callback();
    }
  }

  obtenerRespuestasDeUsuario(
    numeroDePregunta: number,
    callback: () => void
  ): void {
    if (numeroDePregunta <= this.encuestaEnProceso.questions.length - 1) {
      let pregunta: Pregunta = this.encuestaEnProceso.questions[
        numeroDePregunta
      ];
      pregunta.answersOfUser.length = 0;
      pregunta.answersOfUser = this.obtenerRespuestasPorTipoDePregunta(
        pregunta
      );
      this.obtenerRespuestasDeUsuario(numeroDePregunta + 1, callback);
    } else {
      callback();
    }
  }

  obtenerRespuestasPorTipoDePregunta(pregunta: Pregunta): Array<Respuesta> {
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
  }

  encuestaActualEsObligatoria(): boolean {
    return this.encuestaEnProceso.isMandatory == 1;
  }

  obtenerPreguntasObligatorias(): Array<Pregunta> {
    let preguntasObligatorias: Pregunta[] = this.encuestaEnProceso.questions.filter(
      (pregunta: Pregunta) => {
        return pregunta.required == 1;
      }
    );

    return preguntasObligatorias;
  }

  obtenerRespuestasDePreguntaDeTipoTexto(pregunta: Pregunta): Array<Respuesta> {
    let objetoPregunta = $(`#PRE_${pregunta.id}`);
    let respuestas: Respuesta[] = [];
    if (objetoPregunta && objetoPregunta.val().trim() != "") {
      let respuesta: Respuesta = new Respuesta();

      respuesta.questionId = pregunta.id;
      respuesta.answer = objetoPregunta.val();
      respuestas.push(respuesta);
      return respuestas;
    } else {
      return respuestas;
    }
  }

  obtenerRespuestasDePreguntaDeTipoNumero(
    pregunta: Pregunta
  ): Array<Respuesta> {
    let objetoPregunta = $(`#PRE_${pregunta.id}`);
    let respuestas: Respuesta[] = [];
    if (objetoPregunta && objetoPregunta.val()) {
      let respuesta: Respuesta = new Respuesta();

      respuesta.questionId = pregunta.id;
      respuesta.answer = objetoPregunta.val();
      respuestas.push(respuesta);
      return respuestas;
    } else {
      return respuestas;
    }
  }

  obtenerRespuestasDePreguntaDeTipoFecha(pregunta: Pregunta): Array<Respuesta> {
    let objetoPregunta = $(`#PRE_${pregunta.id}`);
    let respuestas: Respuesta[] = [];
    if (objetoPregunta && objetoPregunta.val() != "") {
      let respuesta: Respuesta = new Respuesta();

      respuesta.questionId = pregunta.id;
      respuesta.answer = objetoPregunta.val();
      respuestas.push(respuesta);
      return respuestas;
    } else {
      return respuestas;
    }
  }

  obtenerRespuestasDePreguntaDeTipoSeleccionMultiple(
    pregunta: Pregunta
  ): Array<Respuesta> {
    let respuestas: Respuesta[] = [];

    pregunta.answers.forEach((respuestaEnPregunta: Respuesta) => {
      let respuestaSeleccionada = $(`#RES_${respuestaEnPregunta.id}`).is(
        ":checked"
      );

      if (respuestaSeleccionada) {
        let respuesta: Respuesta = new Respuesta();

        respuesta.questionId = pregunta.id;
        respuesta.answer = `${$(`#RES_${respuestaEnPregunta.id}`).attr(
          "VALUE"
        )}`;
        respuestas.push(respuesta);
      }
    });

    return respuestas;
  }

  obtenerRespuestasDePreguntaDeTipoSeleccionUnica(
    pregunta: Pregunta
  ): Array<Respuesta> {
    let objetoPregunta = $(`#PRE_${pregunta.id}`);
    let respuestas: Respuesta[] = [];
    if (
      objetoPregunta &&
      objetoPregunta.val() != "" &&
      objetoPregunta.val() != "null" &&
      objetoPregunta.val() != "Seleccionar"
    ) {
      let respuesta: Respuesta = new Respuesta();

      respuesta.questionId = pregunta.id;
      respuesta.answer = objetoPregunta.val();
      respuestas.push(respuesta);
      return respuestas;
    } else {
      return respuestas;
    }
  }
}
