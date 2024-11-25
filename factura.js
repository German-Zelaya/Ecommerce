function calculaDigitoMod11(cadena, numDig, limMult, x10) {
  let mult, suma, i, n, dig;

  if (!x10) numDig = 1;

  for (n = 1; n <= numDig; n++) {
    suma = 0;
    mult = 2;

    for (i = cadena.length - 1; i >= 0; i--) {
      suma += mult * parseInt(cadena.substring(i, i + 1));
      if (++mult > limMult) mult = 2;
    }

    if (x10) {
      dig = ((suma * 10) % 11) % 10;
    } else {
      dig = suma % 11;
    }

    if (dig === 10) {
      cadena += "1";
    } else if (dig === 11) {
      cadena += "0";
    } else if (dig < 10) {
      cadena += dig.toString();
    }
  }

  return cadena.substring(cadena.length - numDig, cadena.length);
}

function obtenerModulo11(pCadena) {
  vDigito = calculaDigitoMod11(pCadena, 1, 9, false);
  console.log(vDigito);
  return vDigito;
}

class StringTools {
  static completeCero(pString, pMaxChar, pRight = false) {
    let vNewString = pString;

    if (pString.length < pMaxChar) {
      while (vNewString.length < pMaxChar) {
        vNewString = pRight ? vNewString + "0" : "0" + vNewString;
      }
    }
    return vNewString;
  }

  static base16(pString) {
    let vValor = BigInt(pString);
    return vValor.toString(16).toUpperCase();
  }

  static base10(pString) {
    let vValor = BigInt("0x" + pString);
    return vValor.toString(10);
  }
}

function solicitarDatos() {
  var nitEmisor = "1883059";
  var fechaHora = "20240416033400000";
  var sucursal = "0";
  var modalidad = "2";
  var tipoEmision = "1";
  var tipoFactura = "1";
  var tipoDocumento = "1";
  var numeroFactura = "6";
  var pos = "0";
  console.log("NIT EMISOR:", nitEmisor);
  console.log("FECHA / HORA:", fechaHora);
  console.log("SUCURSAL:", sucursal);
  console.log("MODALIDAD:", modalidad);
  console.log("TIPO EMISIÓN:", tipoEmision);
  console.log("TIPO FACTURA / DOCUMENTO AJUSTE:", tipoFactura);
  console.log("TIPO DOCUMENTO SECTOR:", tipoDocumento);
  console.log("NÚMERO DE FACTURA:", numeroFactura);
  console.log("POS:", pos);
  console.log(
    "---Se completa cada campo según la longitud definida con ceros a la izquierda:---"
  );
  nitEmisor = StringTools.completeCero(nitEmisor, 13);
  fechaHora = StringTools.completeCero(fechaHora, 17);
  sucursal = StringTools.completeCero(sucursal, 4);
  tipoDocumento = StringTools.completeCero(tipoDocumento, 2);
  numeroFactura = StringTools.completeCero(numeroFactura, 10);
  pos = StringTools.completeCero(pos, 4);
  console.log("NIT EMISOR:", StringTools.completeCero(nitEmisor, 13));
  console.log("FECHA / HORA:", StringTools.completeCero(fechaHora, 17));
  console.log("SUCURSAL:", StringTools.completeCero(sucursal, 4));
  console.log("MODALIDAD:", modalidad);
  console.log("TIPO EMISIÓN:", tipoEmision);
  console.log("TIPO FACTURA / DOCUMENTO AJUSTE:", tipoFactura);
  console.log(
    "TIPO DOCUMENTO SECTOR:",
    StringTools.completeCero(tipoDocumento, 2)
  );
  console.log(
    "NÚMERO DE FACTURA:",
    StringTools.completeCero(numeroFactura, 10)
  );
  console.log("POS:", StringTools.completeCero(pos, 4));
  console.log("---Se Concatena los campos:---");
  var codigo =
    nitEmisor +
    fechaHora +
    sucursal +
    modalidad +
    tipoEmision +
    tipoFactura +
    tipoDocumento +
    numeroFactura +
    pos;
  console.log(codigo);
  var codigo11 = codigo + obtenerModulo11(codigo);
  console.log("---Se obtiene el modulo 11:---");

  console.log(codigo11);
  console.log("---Se aplica base 16:---");

  codigobase16 = StringTools.base16(codigo11);

  console.log(codigobase16);

  console.log("---Se concatena el codigo de control:---");
  control = "87D7B8EE1D88E74";
  codigocompleto = codigobase16 + control;
  console.log(codigocompleto);
}
solicitarDatos();
