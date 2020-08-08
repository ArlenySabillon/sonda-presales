
interface IManejoDeDecimales {

    obtenerInformacionDeManejoDeDecimales(callback: (decimales: ManejoDeDecimales) => void, callbackError?: (reultado: Operacion) => void): void;

    calcularPorTipoDecimales(manejoDeDecimales: ManejoDeDecimales, valor : number):number;
}