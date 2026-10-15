import React from "react";
import { RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";
import { PolicyPage, P, UL } from "../components/PolicyPage";

/**
 * Política de cambios y devoluciones, basada en la Ley N° 19.496 (derecho a
 * retracto de 10 días en compras a distancia y garantía legal de 6 meses).
 */
export const CambiosDevolucionesPage: React.FC = () => (
  <PolicyPage
    eyebrow="Información"
    title="Cambios y devoluciones"
    subtitle="Queremos que ames lo que recibes. Si algo no está bien, lo resolvemos."
    updated="15 de octubre de 2026"
    highlights={[
      {
        icon: RotateCcw,
        title: "10 días para retractarte",
        text: "Desde que recibes tu pedido, si el producto está sin uso y en su embalaje original.",
      },
      {
        icon: ShieldCheck,
        title: "6 meses de garantía legal",
        text: "Si un producto tiene una falla, eliges cambio, reparación o devolución del dinero.",
      },
      {
        icon: MessageCircle,
        title: "Todo por WhatsApp",
        text: "Escríbenos con tu número de pedido y te guiamos en cada paso.",
      },
    ]}
    sections={[
      {
        id: "retracto",
        title: "Derecho a retracto",
        content: (
          <>
            <P>
              Como compraste a distancia, la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores te da{" "}
              <strong>10 días desde que recibes tu pedido</strong> para retractarte de la compra, sin tener que explicar el motivo.
            </P>
            <P>Para ejercerlo, el producto debe estar:</P>
            <UL>
              <li>Sin uso y en buen estado.</li>
              <li>Con su embalaje original y todos sus elementos (etiquetas, bolsas, accesorios).</li>
            </UL>
            <P>
              En este caso, el envío de vuelta al taller corre por tu cuenta, o puedes traerlo sin costo a nuestro taller de Vitacura.
              Una vez que recibimos y revisamos el producto, te devolvemos lo que pagaste por él.
            </P>
          </>
        ),
      },
      {
        id: "excepciones",
        title: "Productos sin derecho a retracto",
        content: (
          <>
            <P>No aplica el derecho a retracto en:</P>
            <UL>
              <li>Piezas hechas a pedido o personalizadas según tus indicaciones (por ejemplo, un ramo con los colores que elegiste).</li>
              <li>Productos usados, abiertos o intervenidos (por ejemplo, insumos que ya se ensartaron o cortaron).</li>
            </UL>
            <P>Estas excepciones no afectan tu garantía legal si el producto tiene una falla.</P>
          </>
        ),
      },
      {
        id: "garantia",
        title: "Garantía legal: productos con falla",
        content: (
          <>
            <P>
              Si un producto llega con una falla, dañado o no corresponde a lo que compraste, tienes{" "}
              <strong>6 meses desde que lo recibes</strong> para elegir entre:
            </P>
            <UL>
              <li>Cambiarlo por el mismo producto.</li>
              <li>Repararlo.</li>
              <li>La devolución del dinero.</li>
            </UL>
            <P>
              En estos casos, nosotros asumimos los costos de envío. Te pedimos que nos escribas con fotos del producto para revisar el
              caso.
            </P>
          </>
        ),
      },
      {
        id: "cambios",
        title: "Cambios por otro producto o color",
        content: (
          <P>
            Si quieres cambiar un producto por otro o por otro color, escríbenos dentro de los 10 días desde que lo recibes. El producto
            debe estar sin uso y en su embalaje original. Los envíos de ida y vuelta corren por tu cuenta, salvo que el cambio sea por
            una falla; también puedes hacerlo en nuestro taller de Vitacura.
          </P>
        ),
      },
      {
        id: "como-solicitar",
        title: "Cómo solicitar un cambio o devolución",
        content: (
          <>
            <P>Escríbenos por WhatsApp o email con:</P>
            <UL>
              <li>Tu número de pedido.</li>
              <li>Tu nombre y RUT.</li>
              <li>El motivo (retracto, falla o cambio) y fotos del producto si tiene algún problema.</li>
            </UL>
            <P>Te respondemos y coordinamos contigo cómo llega el producto de vuelta: por courier o entregándolo en el taller.</P>
          </>
        ),
      },
      {
        id: "reembolsos",
        title: "Reembolsos",
        content: (
          <>
            <P>Devolvemos el dinero por el mismo medio con que pagaste:</P>
            <UL>
              <li>
                <strong>Mercado Pago:</strong> reversamos el pago; el plazo en que se refleja depende de Mercado Pago y de tu banco o
                tarjeta.
              </li>
              <li>
                <strong>Transferencia bancaria:</strong> te transferimos a la cuenta que nos indiques, a nombre del titular de la compra.
              </li>
            </UL>
            <P>Hacemos la devolución a la brevedad una vez recibido y revisado el producto, dentro de los plazos que establece la ley.</P>
          </>
        ),
      },
    ]}
  />
);
