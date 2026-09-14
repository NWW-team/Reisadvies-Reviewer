---
name: Reisadvies-Reviewer
last_updated: 2026-09-14
---

# Reisadvies-Reviewer — Strategie

## Doelprobleem

Reisadviezen worden vaak met haast aangepast, terwijl er veel richtlijnen gelden over welke onderwerpen er wel in mogen, welke we alleen kort noemen en verwijzen, en welke er helemaal niet in thuishoren. De toets daarop zit bij één persoon, dus werk wacht soms tot die uit een meeting is — en ondertussen staan er adviezen live die te lang zijn, fouten bevatten of informatie bevatten die er niet in thuishoort, met discussie achteraf.

## Onze aanpak

De tool toetst alleen wat objectief te toetsen is — B1, begrijpelijkheid, de schrijfwijzer en de onderwerpen-matrix — en zegt niets over politieke gevoeligheden; die weging blijft mensenwerk. Eerst draai ik hem zelf over de reisadviezen; pas als ik vertrouwen heb dat de review goed gebeurt, kan mijn review ertussenuit en raadpleegt de redacteur de tool in plaats van mij.

Randvoorwaarden: bouwen in de browser met Claude Code, geen lokale installatie, en een prototype dat we aan collega's kunnen laten zien zonder interne hosting. In fase 1 toetsen we de reisadviezen die al op de website gepubliceerd staan; conceptteksten uit Word komen daarna, en daarvoor moet eerst duidelijk zijn of nog niet gepubliceerde tekst naar een externe dienst mag.

## Voor wie

**Primair:** De redacteur — hij heeft net een reisadvies aangepast en wil weten of hij het kan publiceren.

**Secundair (fase 1):** Ikzelf als reviewer — ik haal alle reisadviezen die nu live staan door de tool om te zien wat niet voldoet.

## Sporen

### Richtlijnen omzetten in toetsbare regels

De schrijfwijzer en de format-matrix zo opschrijven dat een tool er consistent tegen kan toetsen: harde regels (woordaantallen, vaste formuleringen, verboden onderwerpen) vast in code, oordeelsregels (B1, begrijpelijkheid, kort noemen en verwijzen) met een model dat ook een herschrijfvoorstel op zinsniveau doet.

_Waarom het de aanpak dient:_ Zonder expliciete regels blijft de toets smaak, en juist dat veroorzaakt nu de discussie.

### Teksten erin krijgen

Van een bulkslag over alle 226 live reisadviezen via de open data v2 API tot losse Word-concepten die de redacteur erin sleept.

_Waarom het de aanpak dient:_ De redacteur moet één advies snel kunnen checken; de bulkslag laat zien hoe groot de achterstand werkelijk is.

### Vertrouwen opbouwen in de toets

Uitkomsten vergelijken met mijn eigen oordeel, fouten in de tool corrigeren, en per bevinding laten zien waaróm iets niet voldoet.

_Waarom het de aanpak dient:_ Mijn review kan er pas tussenuit als ik erop vertrouw dat de tool het net zo zorgvuldig doet.

## Niet aan werken

- Politieke gevoeligheden: daar zegt de tool niets over, die review blijft bij mensen.
- Inkorten van een te lang reisadvies: de tool signaleert de overschrijding en wijst de langste blokken aan, maar schrapt niet zelf — wat weg kan is een inhoudelijke keuze.
- Een koppeling met SharePoint: Word-concepten gaan er handmatig in en uit.
