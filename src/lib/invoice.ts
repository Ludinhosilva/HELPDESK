export function generateInvoicePDF(
  ticketNumber: number,
  amount: number,
  paymentReference: string,
  userName: string,
  orgName: string
): string {
  const date = new Date().toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `FACTURA ELECTRONICA
${orgName}

Fecha: ${date}
Referencia: ${paymentReference}

Cliente: ${userName}
Ticket: TK-${ticketNumber}
Concepto: Ticket Exprés - Respuesta garantizada < 2 horas

Subtotal: S/ ${((amount * 0.82) / 100).toFixed(2)}
IGV (18%): S/ ${((amount * 0.18) / 100).toFixed(2)}
Total: S/ ${(amount / 100).toFixed(2)}

Forma de pago: Tarjeta de credito/debito
Estado: CANCELADO

Gracias por confiar en Flix Support.
`;
}
