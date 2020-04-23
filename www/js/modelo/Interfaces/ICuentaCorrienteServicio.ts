interface ICuentaCorrienteServicio {
  agregarFacturaVencidaDeCliente(data: any): void;

  obtenerFacturasVencidasDeCliente(
    cliente: Cliente,
    callback: (facturasVencidas: Array<FacturaVencidaDeCliente>) => void,
    errorCallback: (resultado: Operacion) => void
  ): void;

  obtenerCuentaCorrienteDeCliente(
    cliente: Cliente,
    callback: (cuentaCorriente: CuentaCorrienteDeCliente) => void,
    errorCallback: (resultado: Operacion) => void
  ): void;

  obtenerSumatoriaTotalDeFacturasEnRutaDeCliente(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    errorCallback: (error: Operacion) => void
  ): void;

  procesarInformacionDeCuentaCorrienteDeCliente(
    codigoDeCliente: string,
    callbak: (cliente: Cliente) => void,
    errorCallback: (resultado: Operacion) => void
  ): void;

  verificarSiElClienteTieneLimiteDeCreditoYDiasDeCreditoConfigurados(
    cliente: Cliente
  ): boolean;

  verificarSiElLimiteDeCreditoDelClienteNoHaSidoSobrepasadoPorElMontoFacturadoEnElDia(
    cliente: Cliente
  ): boolean;

  obtenerFechaDeVencimientoDeFacturaEnBaseADiasDeCreditoDelCliente(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    errorCallback: (error: Operacion) => void
  ): void;

  obtenerSumatoriaDePagosRealizadosPorClienteDuranteElDia(
    cliente: Cliente,
    callback: (cliente: Cliente) => void,
    errorCallback: (resultado: Operacion) => void
  ): void;

  clienteTieneFacturasAbiertasOVencidas(
    facturasVencidas: FacturaVencidaDeCliente[]
  ): boolean;
}