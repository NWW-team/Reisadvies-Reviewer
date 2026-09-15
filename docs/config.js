/**
 * Publieke projectconfiguratie.
 *
 * Deze twee waarden horen in de frontend. Ze staan in elke browser die deze pagina
 * opent, en dat is de bedoeling: de publishable key zegt alleen welk project je
 * aanspreekt, niet wat je mag. Wat je mag, bepalen de row-level-security-policies
 * in Supabase.
 *
 * Wat hier NOOIT in mag, en ook niet in de repo of in een prompt:
 *   - de secret key (sb_secret_...) of de service-role key
 *   - het databasewachtwoord
 *   - een API-sleutel van een modelaanbieder
 */
window.SUPABASE_CONFIG = {
  url: 'https://cekxwqpudnzzzfdpstgi.supabase.co',
  publishableKey: 'sb_publishable_1HPbd3MQYoWff5lcLYh-Ig_PaTxjGtp'
};
