// Datos de contacto centralizados. Cambie el número aquí y se actualiza en todo el sitio.
// Formato internacional sin "+", espacios ni guiones (Bolivia = 591).
// TODO: reemplazar por el número real de WhatsApp de SIAC.
export const WHATSAPP_NUMBER = '59170000000';
export const WHATSAPP_DEFAULT_MSG = 'Hola SIAC, quisiera información sobre la administración de mi condominio.';
export const FACEBOOK_URL = 'https://www.facebook.com/siac.scz';

export const whatsappLink = (msg: string = WHATSAPP_DEFAULT_MSG) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
