/**
 * Un color de categoría es un hexadecimal de 6 dígitos con almohadilla.
 *
 * Es el único formato que producen los selectores de color del navegador y el
 * que CSS entiende tal cual. Aceptar variantes como `FF5733` o `#fff` deja
 * pasar valores que después no se pueden pintar.
 */
export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const HEX_COLOR_MESSAGE =
  'color debe ser un hexadecimal de 6 dígitos, por ejemplo #FF5733';
