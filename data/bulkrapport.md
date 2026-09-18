# Bulkrapport reisadviezen

Gedraaid op 2026-09-18 over 226 reisadviezen.

## Hoe groot is de achterstand

- **99** van de 226 adviezen hebben geen enkele harde fout.
- **46** adviezen zitten boven de woordenlimiet.
- Gemiddeld 0.9 eigen fouten per advies, los van wat uit de standaardtekst komt.
- **88** van de 3845 bevindingen steunen op een aanvulling: de regel komt uit de schrijfwijzer, maar het woord of domein staat er niet letterlijk in. Die zijn in de tool gemarkeerd.

## Zit in de standaardtekst

Deze bevindingen staan woordelijk gelijk in 45 adviezen of meer. Eén keer aanpassen in
de standaardtekst lost ze allemaal tegelijk op.

| regel | in hoeveel adviezen | wat |
|---|---:|---|
| `link-tekstlengte` | 221 | Linktekst is 74 tekens. Maximaal 70. |
| `link-tekstlengte` | 208 | Linktekst is 75 tekens. Maximaal 70. |
| `zin-max-woorden` | 179 | Deze zin telt 16 woorden. Maximaal 15. De linktekst telt mee — kort die eerst in. |
| `zin-max-woorden` | 47 | Deze zin telt 18 woorden. Maximaal 15. De linktekst telt mee — kort die eerst in. |

## Per soort bevinding

De ernst is een soort, geen rangorde: rood is echt fout, geel/oranje te lang of te passief,
lichtblauw een lange zin met een link erin, roze twijfeltaal, grijs de rest.

| soort | bevindingen | in hoeveel adviezen |
|---|---:|---:|
| rood — fout | 210 | 127 |
| geel/oranje — let op | 2028 | 226 |
| lichtblauw — lange zin met link | 945 | 226 |
| grijs — ter overweging | 135 | 101 |
| roze — twijfeltaal | 527 | 183 |

## Per regel

| regel | adviezen | bevindingen |
|---|---:|---:|
| `zin-max-woorden` | 226 | 1900 |
| `link-tekstlengte` | 226 | 486 |
| `zin-twijfeltaal` | 183 | 527 |
| `zin-lijdende-vorm` | 123 | 272 |
| `aanhalingstekens` | 53 | 86 |
| `rubrieken-volgorde` | 53 | 53 |
| `kleur-variant` | 47 | 53 |
| `doc-woordenaantal` | 46 | 46 |
| `h3-alleen-bij-uitzondering` | 40 | 40 |
| `rubrieken-max` | 36 | 36 |
| `reisverzekering-vaste-tekst` | 32 | 32 |
| `regionaal-gebiedenzin` | 32 | 32 |
| `kleur-aanduiding` | 31 | 32 |
| `intro-vaste-tekst` | 26 | 26 |
| `h3-niet-melden` | 25 | 25 |
| `nood-contactcenter` | 20 | 20 |
| `bagage-heen` | 20 | 20 |
| `rijbewijs-anwb` | 13 | 13 |
| `h3-vaste-kop` | 11 | 11 |
| `actueel-max-woorden` | 10 | 10 |
| `bagage-terug` | 7 | 7 |
| `nood-lokale-hulpdiensten` | 7 | 7 |
| `nood-verwijzing-nood` | 7 | 7 |
| `nood-verwijzing-crisis` | 7 | 7 |
| `medicijnen-voldoende` | 7 | 7 |
| `link-verboden-partij` | 6 | 7 |
| `opmaak-vet-onderstreept` | 5 | 5 |
| `kleur-vervolg-bullet-kort` | 5 | 5 |
| `eenheden-voluit` | 5 | 5 |
| `titel-leestekens` | 5 | 5 |
| `vragen-opeenvolgend` | 5 | 6 |
| `regionaal-kleur-tekst` | 4 | 5 |
| `h2-vast` | 4 | 4 |
| `kinderen-documenten` | 4 | 4 |
| `schuine-streep` | 4 | 4 |
| `kleur-eerste-bullet-voluit` | 3 | 3 |
| `afkortingen-uitschrijven` | 3 | 3 |
| `reisverzekering-oranje-rood` | 3 | 3 |
| `lhbtiq-verwijzing` | 2 | 2 |
| `lhbtiq-schrijfwijze` | 2 | 2 |
| `kleur-formulering-verboden` | 2 | 2 |
| `kleur-vaste-tekst` | 2 | 2 |
| `alinea-max-woorden` | 2 | 4 |
| `getallen-cijfers` | 2 | 2 |
| `telefoon-notatie` | 2 | 3 |
| `criminaliteit-themapagina` | 2 | 2 |
| `genderneutraal` | 2 | 3 |
| `regionaal-kleur-kop` | 2 | 2 |
| `informatieservice-vaste-tekst` | 1 | 1 |
| `vaccinaties-ggd` | 1 | 1 |
| `vaccinaties-lcr` | 1 | 1 |
| `percentage-notatie` | 1 | 1 |
| `valuta-notatie` | 1 | 1 |
| `rood-herhaling-voorbereiding` | 1 | 1 |
| `tijd-notatie` | 1 | 1 |

## Langste adviezen

| land | woorden | limiet |
|---|---:|---:|
| Thailand | 3330 | 2000 |
| India | 3100 | 2000 |
| Ecuador | 2754 | 2000 |
| Indonesië | 2594 | 2000 |
| Colombia | 2556 | 2000 |
| Turkije | 2539 | 2000 |
| China | 2504 | 1500 |
| Rusland | 2501 | 2000 |
| Mexico | 2497 | 2000 |
| Peru | 2460 | 2000 |
| Tanzania | 2438 | 2000 |
| Filipijnen | 2436 | 2000 |
| Venezuela | 2332 | 2000 |
| Egypte | 2326 | 2000 |
| Irak | 2283 | 2000 |

---

Dit rapport gaat alleen over objectief toetsbare regels. Politieke gevoeligheden staan er
bewust niet in, en de tool kort niets in: bij een overschrijding wijst hij de langste blokken
aan, maar wat weg kan is een inhoudelijke keuze.
