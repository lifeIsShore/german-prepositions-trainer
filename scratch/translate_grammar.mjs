import fs from 'fs';

function translateConnectors() {
  const path = 'pages/connectors.html';
  let html = fs.readFileSync(path, 'utf8');

  const replacements = {
    'Categorized by exact verb position effect: Position 0 (ADUSO), Subordinate Verb-End (Nebensatz), Position 1 Inversion (Conjunctive Adverbs), and Two-Part Connectors.': 'Kategorisiert nach exaktem Einfluss auf die Verbposition: Position 0 (ADUSO), Nebensatz (Verb am Ende), Inversion an Position 1 (Konjunktionaladverbien) und Doppelkonjunktionen.',
    '>All Groups<': '>Alle Gruppen<',
    'Group 1: ADUSO (Position 0)': 'Gruppe 1: ADUSO (Position 0)',
    'Group 2: Nebensatz (Verb-End)': 'Gruppe 2: Nebensatz (Verb am Ende)',
    'Group 3: Inversion (Position 1)': 'Gruppe 3: Inversion (Position 1)',
    'Group 4: Doppelkonjunktionen': 'Gruppe 4: Doppelkonjunktionen',
    
    'Group 1: ADUSO (Coordinating Conjunctions)': 'Gruppe 1: ADUSO (Nebenordnende Konjunktionen)',
    'Position 0 Effect (Verb stays in Position 2)': 'Position 0 Effekt (Verb bleibt auf Position 2)',
    
    'Group 2: Nebensatz (Subordinating Conjunctions)': 'Gruppe 2: Nebensatz (Unterordnende Konjunktionen)',
    'Subordinate Effect (Verb at End)': 'Nebensatz Effekt (Verb am Satzende)',
    
    'Group 3: Konjunktionaladverbien (Inversion)': 'Gruppe 3: Konjunktionaladverbien (Inversion)',
    'Inversion Effect (Subject moves to Position 3)': 'Inversion Effekt (Subjekt rückt auf Position 3)',
    
    'Group 4: Doppelkonjunktionen (Two-Part)': 'Gruppe 4: Doppelkonjunktionen (Zweiteilig)',
    'Multi-Part Effect': 'Mehrteiliger Effekt',
    
    '>Adversative Contrast<': '>Gegensatz / Einschränkung<',
    '>Causal Explanation<': '>Kausale Begründung<',
    '>Alternative<': '>Alternative<',
    '>Negative Alternative<': '>Negative Alternative<',
    '>Concessive Contrast<': '>Konzessiver Gegensatz<',
    '>Consequence / Result<': '>Folge / Resultat<',
    '>Condition<': '>Bedingung<',
    '>Time (Simultaneous)<': '>Zeit (Gleichzeitig)<',
    '>Time (After)<': '>Zeit (Danach)<',
    '>Time (Before)<': '>Zeit (Davor)<',
    '>Time (Until)<': '>Zeit (Bis)<',
    '>Time (Since)<': '>Zeit (Seit)<',
    '>Time (Whenever)<': '>Zeit (Immer wenn)<',
    '>Time (Once in past)<': '>Zeit (Einmal in der Vergangenheit)<',
    '>Purpose / Intention<': '>Zweck / Absicht<',
    '>Means / Instrument<': '>Mittel / Instrument<',
    '>Result / Addition<': '>Ergebnis / Ergänzung<',
    '>Addition / Sequence<': '>Zusatz / Reihenfolge<',
    '>Positive Addition<': '>Positive Ergänzung<',
    '>Negative Addition<': '>Negative Ergänzung<',
    '>Proportionality<': '>Proportionalität<',
    '>Restricting Alternative<': '>Einschränkende Alternative<',
    'Trainer Home': 'Trainer Startseite',
    'Word Order Rules': 'Satzbau & Wortstellung',
    'Connectors (Konnektoren)': 'Konnektoren'
  };

  for (const [en, de] of Object.entries(replacements)) {
    html = html.split(en).join(de);
  }

  fs.writeFileSync(path, html);
  console.log('Translated connectors.html safely');
}

function translateTenses() {
  const path = 'pages/tenses.html';
  let html = fs.readFileSync(path, 'utf8');

  const replacements = {
    'Master all German tenses, passive constructions, and subjunctive forms. Understand exactly when native speakers use each tense in daily speech vs. formal writing.': 'Meistern Sie alle deutschen Zeitformen, Passivkonstruktionen und Konjunktivformen. Verstehen Sie genau, wann Muttersprachler welche Zeitform in der Alltagssprache im Vergleich zur formellen Schriftsprache verwenden.',
    'Current state or ongoing action:': 'Aktueller Zustand oder laufende Handlung:',
    'General truths &amp; facts:': 'Allgemeine Wahrheiten & Fakten:',
    'General truths & facts:': 'Allgemeine Wahrheiten & Fakten:',
    'Near future actions with time marker (Very Common!): Natives often use Präsens instead of Futur I when a time marker is present:': 'Handlungen in naher Zukunft mit Zeitangabe (Sehr häufig!): Muttersprachler verwenden oft Präsens statt Futur I, wenn eine Zeitangabe vorhanden ist:',
    'Completed actions in the past (Spoken language!).': 'Abgeschlossene Handlungen in der Vergangenheit (Gesprochene Sprache!).',
    'This is the default past tense for almost all conversations.': 'Dies ist die Standardvergangenheitsform für fast alle Gespräche.',
    'Formed with': 'Wird gebildet mit',
    ' or ': ' oder ', // Safe replacement for 'or'
    'Completed actions in the past (Written language!).': 'Abgeschlossene Handlungen in der Vergangenheit (Schriftsprache!).',
    'Used in novels, newspapers, and formal reports.': 'Wird in Romanen, Zeitungen und formellen Berichten verwendet.',
    'However, native speakers use Präteritum in speech for:': 'Muttersprachler verwenden jedoch Präteritum beim Sprechen für:',
    'Auxiliary verbs': 'Hilfsverben',
    'Modal verbs': 'Modalverben',
    'Actions that were already completed BEFORE another action in the past.': 'Handlungen, die VOR einer anderen Handlung in der Vergangenheit bereits abgeschlossen waren.',
    'The "Past in the Past".': 'Die "Vergangenheit in der Vergangenheit".',
    'Predictions, assumptions about the future, or firm promises.': 'Vorhersagen, Annahmen über die Zukunft oder feste Versprechen.',
    'Assumptions about the PRESENT:': 'Annahmen über die GEGENWART:',
    'Assumptions about what MIGHT have happened in the past.': 'Annahmen darüber, was in der Vergangenheit passiert sein KÖNNTE.',
    'Passive voice focuses on the ACTION, not who did it.': 'Das Passiv konzentriert sich auf die HANDLUNG, nicht auf die Person, die sie ausführt.',
    'The condition/state of something after an action is finished.': 'Der Zustand / die Verfassung von etwas, nachdem eine Aktion beendet ist.',
    'Polite requests, wishes, unreal conditions, and hypothetical situations.': 'Höfliche Bitten, Wünsche, irreale Bedingungen und hypothetische Situationen.',
    'The "would" / "could" / "should" of German.': 'Das "würde" / "könnte" / "sollte" des Deutschen.',
    'Indirect speech (reporting what someone else said).': 'Indirekte Rede (berichten, was jemand anderes gesagt hat).',
    'Used almost exclusively in formal news, newspapers, and official reports to maintain neutrality.': 'Wird fast ausschließlich in formellen Nachrichten, Zeitungen und offiziellen Berichten verwendet, um Neutralität zu wahren.',
    '>Usage Notes<': '>Hinweise zur Verwendung<',
    '>Tense Info<': '>Zeitform Info<',
    '>Sentence Structure<': '>Satzbau<',
    '>Action<': '>Aktion<',
    '>Result<': '>Ergebnis<',
    '>Request<': '>Bitte<',
    '>Hypothetical<': '>Hypothetisch<',
    '>News Report<': '>Nachrichtenmeldung<',
    'Trainer Home': 'Trainer Startseite',
    'Word Order Rules': 'Satzbau & Wortstellung',
    'Connectors (Konnektoren)': 'Konnektoren',
    '>Connectors<': '>Konnektoren<'
  };

  for (const [en, de] of Object.entries(replacements)) {
    html = html.split(en).join(de);
  }

  fs.writeFileSync(path, html);
  console.log('Translated tenses.html safely');
}

translateConnectors();
translateTenses();
