import React from "react";
import { Link } from "react-router";
import { Truck, MapPinned, Store } from "lucide-react";
import { PolicyPage, P, UL, formatCLP } from "../components/PolicyPage";
import { useStore } from "../context/StoreContext";
import { SHIPPING_METHODS } from "../data/chileData";

/**
 * Política de envíos. Costos y plazos salen de SHIPPING_METHODS y el umbral de
 * despacho gratis de la configuración del panel, para que la página nunca
 * diga algo distinto de lo que cobra el checkout.
 */
export const PoliticaEnviosPage: React.FC = () => {
  const { settings } = useStore();
  const delivery = SHIPPING_METHODS.find((m) => m.id === "private_courier")!;
  const pickup = SHIPPING_METHODS.find((m) => m.id === "pickup")!;
  const freeFrom = settings.freeShippingThreshold > 0 ? formatCLP(settings.freeShippingThreshold) : null;

  return (
    <PolicyPage
      eyebrow="Información"
      title="Política de envíos"
      subtitle="Cómo, cuándo y dónde recibes tu pedido."
      updated="15 de octubre de 2026"
      intro={
        <P>
          Despachamos desde nuestro taller en Vitacura, Santiago, a todo Chile. Puedes recibir tu pedido en tu casa o retirarlo
          sin costo en el taller.
        </P>
      }
      highlights={[
        {
          icon: Truck,
          title: "Santiago (RM)",
          text: (
            <>
              Despacho a domicilio {formatCLP(delivery.costRM)}, en {delivery.estimatedDays}.
              {freeFrom && <> Gratis en compras sobre {freeFrom}.</>}
            </>
          ),
        },
        {
          icon: MapPinned,
          title: "Regiones",
          text: "Coordinamos el envío contigo por WhatsApp y te cotizamos el costo según tu comuna.",
        },
        {
          icon: Store,
          title: "Retiro en taller",
          text: `Sin costo en Vitacura, Santiago. ${pickup.estimatedDays}.`,
        },
      ]}
      sections={[
        {
          id: "preparacion",
          title: "Preparación de tu pedido",
          content: (
            <>
              <P>Preparamos tu pedido una vez confirmado el pago:</P>
              <UL>
                <li>
                  <strong>Mercado Pago:</strong> la confirmación es inmediata.
                </li>
                <li>
                  <strong>Transferencia bancaria:</strong> cuando recibimos y verificamos tu comprobante (lo puedes enviar por
                  WhatsApp con el mensaje que te armamos al finalizar la compra).
                </li>
              </UL>
              <P>
                Si tu pedido incluye una pieza hecha a pedido o con colores personalizados, te avisamos por WhatsApp el plazo de
                confección antes de despacharla.
              </P>
            </>
          ),
        },
        {
          id: "region-metropolitana",
          title: "Despacho en la Región Metropolitana",
          content: (
            <>
              <P>
                Enviamos con despachador privado, directo a tu puerta. El despacho cuesta {formatCLP(delivery.costRM)} y llega en{" "}
                {delivery.estimatedDays} desde que tu pedido sale del taller.
              </P>
              {freeFrom && (
                <P>
                  <strong>Despacho gratis en compras sobre {freeFrom}</strong> con entrega a domicilio en la Región Metropolitana. El
                  descuento se aplica automáticamente en el checkout.
                </P>
              )}
            </>
          ),
        },
        {
          id: "regiones",
          title: "Despacho a regiones",
          content: (
            <>
              <P>
                Llegamos a todas las regiones de Chile. Como el costo depende del destino, no lo cobramos en la web: al recibir tu
                pedido te escribimos por WhatsApp para cotizar el envío con el courier (por ejemplo, Blue Express o Correos de Chile) y
                acordar el pago.
              </P>
              <P>
                Una vez despachado, te enviamos el número de seguimiento para que sigas tu pedido en el sitio del courier. Los plazos de
                entrega los define el courier y dependen de tu comuna.
              </P>
            </>
          ),
        },
        {
          id: "retiro",
          title: "Retiro en nuestro taller",
          content: (
            <>
              <P>
                Puedes retirar tu pedido sin costo en nuestro taller de Vitacura, Santiago, de lunes a viernes. Te avisamos por
                WhatsApp cuando esté listo para coordinar el día y la hora.
              </P>
              <P>
                Si lo retira otra persona, avísanos antes indicando tu número de pedido y el nombre y RUT de quien retira.
              </P>
            </>
          ),
        },
        {
          id: "direccion",
          title: "Datos de entrega",
          content: (
            <>
              <P>
                Revisa con cuidado tu dirección, comuna y teléfono al comprar. Si notas un error, escríbenos lo antes posible: podemos
                corregirlo mientras el pedido no haya salido del taller.
              </P>
              <P>
                Si el envío no se puede entregar por una dirección incorrecta o porque no hay nadie para recibirlo, el nuevo despacho
                puede tener costo.
              </P>
            </>
          ),
        },
        {
          id: "danos",
          title: "Si tu pedido llega dañado",
          content: (
            <P>
              Revisa tu pedido al recibirlo. Si el paquete o algún producto llega dañado, escríbenos el mismo día con fotos del paquete
              y del producto, y lo solucionamos. Revisa también nuestra{" "}
              <Link to="/cambios-y-devoluciones" style={{ color: "var(--primary)", fontWeight: 500 }}>
                política de cambios y devoluciones
              </Link>
              .
            </P>
          ),
        },
      ]}
    />
  );
};
