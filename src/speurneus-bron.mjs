/**
 * Waar de lijsten van SpellingSpeurneus staan. Uit docs/index.html van SpellingSpeurneus; wisselt
 * die van project of sleutel, dan alleen hier aanpassen. De sleutel is de publieke (publishable):
 * hij geeft alleen leesrecht, en SpellingSpeurneus zet hem zelf ook in zijn pagina.
 *
 * Gebruikt door scripts/haal-speurneus.mjs (de ochtendronde) en door de pagina zelf, die de lijst
 * bij het openen ook rechtstreeks ophaalt, zodat een wijziging van vandaag er meteen in zit.
 */
export const SPEURNEUS = {
  url: 'https://riwznqurcluudvyrkwxe.supabase.co',
  sleutel: 'sb_publishable_8D0tbPlRD5eWqjIJDdQgKg_BxKn2Knx',
};
