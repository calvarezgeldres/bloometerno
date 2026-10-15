import React from "react";
import { PolicyPage, P, UL } from "../components/PolicyPage";
import { CONTACT_EMAIL } from "../data/contact";

/**
 * Política de privacidad. Describe lo que la tienda hace de verdad con los datos:
 * lo que pide el checkout, con quién se comparte (Mercado Pago, despacho,
 * proveedores de hosting/BD) y qué guarda en el navegador (sin analítica ni
 * publicidad). Si eso cambia (ej: se agrega Google Analytics), hay que actualizarla.
 */
export const PrivacidadPage: React.FC = () => {
  const email = CONTACT_EMAIL;

  return (
    <PolicyPage
      eyebrow="Información"
      title="Política de privacidad"
      subtitle="Qué datos te pedimos, para qué los usamos y cómo los cuidamos."
      updated="15 de octubre de 2026"
      intro={
        <P>
          En Bloom Eterno cuidamos tus datos personales y los tratamos conforme a la legislación chilena sobre protección de la vida
          privada y datos personales (Ley N° 19.628) y a la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores. Al
          comprar o navegar en nuestro sitio aceptas esta política.
        </P>
      }
      sections={[
        {
          id: "responsable",
          title: "Quién es responsable de tus datos",
          content: (
            <P>
              El responsable del tratamiento de tus datos es Bloom Eterno, tienda online con taller en Vitacura, Santiago. Para cualquier
              consulta sobre tus datos puedes escribirnos a <strong>{email}</strong>.
            </P>
          ),
        },
        {
          id: "datos",
          title: "Qué datos recopilamos",
          content: (
            <>
              <P>
                <strong>Cuando compras:</strong> tu nombre, RUT, email, número de WhatsApp, región, comuna, dirección de entrega y las
                notas que agregues al pedido, además del detalle de lo que compraste.
              </P>
              <P>
                <strong>Cuando pagas:</strong> si pagas con Mercado Pago, los datos de tu tarjeta los ingresas directamente en Mercado
                Pago; nosotros no los vemos ni los guardamos. Si pagas por transferencia, recibimos el comprobante que nos envías.
              </P>
              <P>
                <strong>Cuando nos escribes:</strong> lo que nos cuentes por WhatsApp, email o Instagram para responderte.
              </P>
              <P>No pedimos datos sensibles (como salud, creencias u orientación).</P>
            </>
          ),
        },
        {
          id: "finalidad",
          title: "Para qué usamos tus datos",
          content: (
            <UL>
              <li>Procesar tu compra, confirmar tu pago y despachar o preparar el retiro de tu pedido.</li>
              <li>Comunicarnos contigo sobre tu pedido, envío, cambios o devoluciones.</li>
              <li>Responder tus consultas.</li>
              <li>Cumplir nuestras obligaciones legales y tributarias.</li>
            </UL>
          ),
        },
        {
          id: "terceros",
          title: "Con quién compartimos tus datos",
          content: (
            <>
              <P>No vendemos ni arrendamos tus datos. Solo los compartimos con quienes necesitamos para atender tu pedido:</P>
              <UL>
                <li>
                  <strong>Mercado Pago</strong>, si eliges ese medio de pago.
                </li>
                <li>
                  <strong>El despachador o courier</strong> que entrega tu pedido (nombre, dirección y teléfono).
                </li>
                <li>
                  <strong>Proveedores tecnológicos</strong> que alojan nuestro sitio y base de datos, cuyos servidores pueden estar fuera
                  de Chile (por ejemplo, en Estados Unidos). Solo procesan los datos para prestarnos ese servicio.
                </li>
                <li>Autoridades, cuando la ley nos obligue a hacerlo.</li>
              </UL>
            </>
          ),
        },
        {
          id: "navegador",
          title: "Cookies y almacenamiento en tu navegador",
          content: (
            <>
              <P>
                No usamos cookies de publicidad ni herramientas de seguimiento o analítica. Para que la tienda funcione, guardamos en tu
                navegador (almacenamiento local) tu carrito de compras, una copia del catálogo y los pedidos que hiciste desde ese
                dispositivo. Puedes borrarlos cuando quieras desde la configuración de tu navegador.
              </P>
              <P>
                Si pagas con Mercado Pago, ese sitio puede usar sus propias cookies, según su política de privacidad.
              </P>
            </>
          ),
        },
        {
          id: "conservacion",
          title: "Cuánto tiempo guardamos tus datos",
          content: (
            <P>
              Guardamos los datos de tus pedidos mientras sean necesarios para atenderlos (incluidos cambios, devoluciones y garantía) y
              por el tiempo que nos exigen las normas legales y tributarias. Después, los eliminamos o anonimizamos.
            </P>
          ),
        },
        {
          id: "derechos",
          title: "Tus derechos",
          content: (
            <>
              <P>En cualquier momento puedes pedirnos:</P>
              <UL>
                <li>
                  <strong>Acceso:</strong> saber qué datos tuyos tenemos.
                </li>
                <li>
                  <strong>Rectificación:</strong> corregir datos incorrectos o incompletos.
                </li>
                <li>
                  <strong>Eliminación:</strong> borrar tus datos, salvo los que debamos conservar por ley.
                </li>
                <li>
                  <strong>Oposición:</strong> que dejemos de usarlos para un fin determinado.
                </li>
              </UL>
              <P>
                Escríbenos a <strong>{email}</strong> indicando tu nombre, RUT y lo que necesitas.
                Te responderemos dentro de los plazos que establece la ley.
              </P>
            </>
          ),
        },
        {
          id: "seguridad",
          title: "Cómo protegemos tus datos",
          content: (
            <P>
              Nuestro sitio usa conexión cifrada (HTTPS), el acceso al panel de administración está protegido con usuario y contraseña, y
              solo las personas que atienden tus pedidos pueden ver tus datos. Aunque ningún sistema es infalible, trabajamos para
              mantener tu información segura.
            </P>
          ),
        },
        {
          id: "menores",
          title: "Menores de edad",
          content: (
            <P>
              Nuestro sitio está dirigido a personas mayores de 18 años. Si eres menor de edad, compra con la autorización y
              acompañamiento de tu madre, padre o tutor.
            </P>
          ),
        },
        {
          id: "cambios",
          title: "Cambios a esta política",
          content: (
            <P>
              Podemos actualizar esta política para reflejar cambios en la tienda o en la ley. Publicaremos la nueva versión en esta
              página con su fecha de actualización.
            </P>
          ),
        },
      ]}
    />
  );
};
