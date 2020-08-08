class ClienteMensaje {
  cliente: Cliente;

  // propiedades utilizadas por modulo de pagos
  vistaCargandosePorPrimeraVez: boolean;
  tipoDePagoAProcesar: TipoDePagoDeFactura;
  funcionDeRetornoAPocesoPrincipal: Function = null;
  permitirSoloVisualizacionDeFacturasVencidasOAbiertas: boolean = false;

  constructor(public sender: any) {}
}
