// ── DATA: 300 German verbs with prepositions ──────────────────────────────
const ALL_CARDS = [
  {
    "verb": "achten",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Bitte achte auf die Aussprache."
  },
  {
    "verb": "anfangen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Ich fange morgen mit dem neuen Kapitel an."
  },
  {
    "verb": "ankommen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Am Ende kommt es auf die richtige Vorbereitung an."
  },
  {
    "verb": "sich ärgern",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Sie ärgert sich über die ständigen Verspätungen."
  },
  {
    "verb": "sich bedanken",
    "prep": "bei",
    "kasus": "Dat. / für",
    "example": "Ich möchte mich bei dir für deine Hilfe bedanken."
  },
  {
    "verb": "beginnen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Der Professor beginnt mit einer kurzen Einführung."
  },
  {
    "verb": "berichten",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Die Zeitung berichtet über den ungewöhnlichen Vorfall."
  },
  {
    "verb": "bestehen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Das Team besteht aus fünf erfahrenen Mitarbeitern."
  },
  {
    "verb": "bestehen",
    "prep": "auf",
    "kasus": "Dat.",
    "example": "Der Kunde besteht auf einer schriftlichen Bestätigung."
  },
  {
    "verb": "sich bewerben",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Er bewirbt sich um eine Stelle bei einem Beratungsunternehmen."
  },
  {
    "verb": "bitten",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Sie bat mich um einen Gefallen."
  },
  {
    "verb": "sich beschweren",
    "prep": "bei",
    "kasus": "Dat. / über",
    "example": "Der Gast beschwerte sich beim Manager über den Lärm."
  },
  {
    "verb": "sich beschäftigen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Zurzeit beschäftige ich mich mit künstlicher Intelligenz."
  },
  {
    "verb": "sich beziehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Diese Aussage bezieht sich auf den ersten Abschnitt."
  },
  {
    "verb": "sich beschränken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Wir sollten uns auf die wichtigsten Punkte beschränken."
  },
  {
    "verb": "sich beteiligen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Viele Studierende beteiligen sich an der Diskussion."
  },
  {
    "verb": "denken",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Denk bitte an deinen Termin morgen."
  },
  {
    "verb": "diskutieren",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Wir diskutierten lange über die möglichen Folgen."
  },
  {
    "verb": "sich entscheiden",
    "prep": "für",
    "kasus": "Akk. / gegen",
    "example": "Nach langem Überlegen entschied er sich für das Angebot."
  },
  {
    "verb": "sich entschuldigen",
    "prep": "bei",
    "kasus": "Dat. / für",
    "example": "Er entschuldigte sich bei seiner Kollegin für den Fehler."
  },
  {
    "verb": "entstehen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus diesem Projekt ist eine interessante Geschäftsidee entstanden."
  },
  {
    "verb": "sich erinnern",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Ich erinnere mich noch gut an meinen ersten Arbeitstag."
  },
  {
    "verb": "erkennen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Man erkennt ihn leicht an seiner Stimme."
  },
  {
    "verb": "fragen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Der Tourist fragte nach dem Weg zum Bahnhof."
  },
  {
    "verb": "sich freuen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Kinder freuen sich schon auf die Ferien."
  },
  {
    "verb": "sich freuen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Ich habe mich sehr über deine Nachricht gefreut."
  },
  {
    "verb": "führen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Fehlende Kommunikation kann zu Konflikten führen."
  },
  {
    "verb": "glauben",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Sie glaubt an ihre Fähigkeiten."
  },
  {
    "verb": "gehören",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Dieses Kapitel gehört zu den schwierigsten Teilen des Kurses."
  },
  {
    "verb": "geraten",
    "prep": "in",
    "kasus": "Akk.",
    "example": "Durch einen Fehler geriet das Unternehmen in finanzielle Schwierigkeiten."
  },
  {
    "verb": "gewöhnen",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Nach einigen Wochen gewöhnte ich mich an den neuen Rhythmus."
  },
  {
    "verb": "hoffen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Anleger hoffen auf eine Erholung des Marktes."
  },
  {
    "verb": "sich informieren",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Vor der Reise informierte ich mich über die Einreisebestimmungen."
  },
  {
    "verb": "sich irren",
    "prep": "in",
    "kasus": "Dat.",
    "example": "Du irrst dich in diesem Punkt."
  },
  {
    "verb": "kämpfen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Die Organisation kämpft für bessere Arbeitsbedingungen."
  },
  {
    "verb": "kämpfen",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Die Regierung kämpft gegen die steigende Inflation."
  },
  {
    "verb": "klagen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Viele Beschäftigte klagen über zu viel Stress."
  },
  {
    "verb": "sich konzentrieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Im Moment konzentriere ich mich auf meine Prüfung."
  },
  {
    "verb": "sich kümmern",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Wer kümmert sich um die Kundenanfragen?"
  },
  {
    "verb": "leiden",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Er leidet an chronischem Zeitmangel."
  },
  {
    "verb": "leiden",
    "prep": "unter",
    "kasus": "Dat.",
    "example": "Die Stadt leidet unter dem starken Verkehr."
  },
  {
    "verb": "liegen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Das liegt wahrscheinlich an der schlechten Planung."
  },
  {
    "verb": "nachdenken",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Ich muss noch über deinen Vorschlag nachdenken."
  },
  {
    "verb": "reden",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Wir haben gestern über unsere Zukunft gesprochen."
  },
  {
    "verb": "reagieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Markt reagierte sofort auf die Nachricht."
  },
  {
    "verb": "rechnen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Wir müssen mit weiteren Verzögerungen rechnen."
  },
  {
    "verb": "reden",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Ich muss noch mit meiner Betreuerin reden."
  },
  {
    "verb": "riechen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "In der Küche riecht es nach frischem Brot."
  },
  {
    "verb": "schützen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Diese Versicherung schützt dich vor hohen Kosten."
  },
  {
    "verb": "schreiben",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Ich habe gestern an meine ehemalige Professorin geschrieben."
  },
  {
    "verb": "schreiben",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Sie schreibt ihre Masterarbeit über digitale Geschäftsmodelle."
  },
  {
    "verb": "schützen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Sonnencreme schützt die Haut vor UV-Strahlung."
  },
  {
    "verb": "sich sehnen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Nach Monaten voller Arbeit sehnte er sich nach Ruhe."
  },
  {
    "verb": "sich spezialisieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Kanzlei hat sich auf Wirtschaftsrecht spezialisiert."
  },
  {
    "verb": "sprechen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Wir sollten offen über dieses Problem sprechen."
  },
  {
    "verb": "sprechen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Morgen spreche ich mit dem Abteilungsleiter."
  },
  {
    "verb": "sprechen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Er spricht oft von seinem früheren Arbeitgeber."
  },
  {
    "verb": "sterben",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Der Patient starb an einer schweren Infektion."
  },
  {
    "verb": "stimmen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Mehr als die Hälfte stimmte für den Antrag."
  },
  {
    "verb": "streben",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Viele junge Unternehmen streben nach schnellem Wachstum."
  },
  {
    "verb": "teilnehmen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Nächste Woche nehme ich an einer Konferenz teil."
  },
  {
    "verb": "überzeugen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Die Ergebnisse überzeugten mich von seiner Methode."
  },
  {
    "verb": "überzeugen",
    "prep": "durch",
    "kasus": "Akk.",
    "example": "Das Unternehmen überzeugt durch innovative Produkte."
  },
  {
    "verb": "sich unterhalten",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Ich habe mich lange mit meinem Nachbarn unterhalten."
  },
  {
    "verb": "sich unterhalten",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Wir unterhielten uns über die politische Lage."
  },
  {
    "verb": "sich verabschieden",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Sie verabschiedete sich von ihren Kollegen."
  },
  {
    "verb": "verfügen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Das Labor verfügt über moderne Geräte."
  },
  {
    "verb": "vergleichen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Man kann diese Zahlen kaum mit den Vorjahreswerten vergleichen."
  },
  {
    "verb": "verstoßen",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Das Unternehmen hat gegen geltende Vorschriften verstoßen."
  },
  {
    "verb": "vertrauen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "In schwierigen Situationen vertraue ich auf meine Erfahrung."
  },
  {
    "verb": "warnen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Experten warnen vor möglichen Engpässen."
  },
  {
    "verb": "warten",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Seit einer Stunde warten wir auf den Bus."
  },
  {
    "verb": "wirken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Schlafmangel wirkt sich negativ auf die Konzentration aus."
  },
  {
    "verb": "sich wenden",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Bei Fragen können Sie sich an die Verwaltung wenden."
  },
  {
    "verb": "zweifeln",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Niemand zweifelte an ihrer Kompetenz."
  },
  {
    "verb": "abhängen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Ob wir fahren, hängt vom Wetter ab."
  },
  {
    "verb": "absehen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Wir sehen diesmal von einer weiteren Prüfung ab."
  },
  {
    "verb": "absehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Er hat es offenbar auf meinen Posten abgesehen."
  },
  {
    "verb": "anregen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Der Vortrag regte mich zu weiteren Überlegungen an."
  },
  {
    "verb": "appellieren",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Die Bürgermeisterin appellierte an die Bevölkerung."
  },
  {
    "verb": "arbeiten",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Das Entwicklerteam arbeitet an einer neuen Lösung."
  },
  {
    "verb": "arbeiten",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Wir arbeiten seit Jahren mit diesem Anbieter."
  },
  {
    "verb": "ausgehen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Wir gehen von einem moderaten Wachstum aus."
  },
  {
    "verb": "sich auseinandersetzen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Im Seminar setzen wir uns mit ethischen Fragen auseinander."
  },
  {
    "verb": "beitragen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Kleine Änderungen können erheblich zum Erfolg beitragen."
  },
  {
    "verb": "sich beziehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Bericht bezieht sich auf das Geschäftsjahr 2025."
  },
  {
    "verb": "sich beklagen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Die Anwohner beklagen sich über den Verkehrslärm."
  },
  {
    "verb": "beruhen",
    "prep": "auf",
    "kasus": "Dat.",
    "example": "Die Entscheidung beruht auf mehreren Faktoren."
  },
  {
    "verb": "sich berufen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Er berief sich auf sein Recht."
  },
  {
    "verb": "sich befassen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Der Ausschuss befasst sich mit dem neuen Gesetz."
  },
  {
    "verb": "sich eignen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Dieser Ansatz eignet sich besonders für kleine Unternehmen."
  },
  {
    "verb": "sich einlassen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Ich würde mich nicht auf ein solches Risiko einlassen."
  },
  {
    "verb": "einigen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Parteien einigten sich auf einen Kompromiss."
  },
  {
    "verb": "sich einigen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Wir konnten uns mit dem Lieferanten einigen."
  },
  {
    "verb": "sich einsetzen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Sie setzt sich für faire Arbeitsbedingungen ein."
  },
  {
    "verb": "sich entscheiden",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Das Management entschied sich gegen die geplante Übernahme."
  },
  {
    "verb": "entkommen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Zwei Häftlinge entkamen aus dem Gefängnis."
  },
  {
    "verb": "entkommen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Niemand kann vor seinen eigenen Fehlern entkommen."
  },
  {
    "verb": "entnehmen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Diese Information kann man dem Bericht entnehmen."
  },
  {
    "verb": "erkennen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Die Qualität erkennt man oft an kleinen Details."
  },
  {
    "verb": "sich ergeben",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus der Analyse ergeben sich interessante Erkenntnisse."
  },
  {
    "verb": "sich erholen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Nach dem Projekt brauchte sie eine Woche, um sich davon zu erholen."
  },
  {
    "verb": "erwarten",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Was erwartest du von diesem Kurs?"
  },
  {
    "verb": "experimentieren",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Die Forscher experimentieren mit einem neuen Verfahren."
  },
  {
    "verb": "sich erstrecken",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Das Bauprojekt erstreckt sich über mehrere Jahre."
  },
  {
    "verb": "sich fürchten",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Manche Menschen fürchten sich vor Veränderungen."
  },
  {
    "verb": "folgen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Auf diese Entscheidung folgte eine intensive Debatte."
  },
  {
    "verb": "forschen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Die Wissenschaftler forschen an neuen Batterietechnologien."
  },
  {
    "verb": "forschen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Sie forscht zu den Auswirkungen des Klimawandels."
  },
  {
    "verb": "gebieten",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Das Unternehmen gebietet über enorme finanzielle Ressourcen."
  },
  {
    "verb": "gelten",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Diese Regel gilt für alle Mitarbeiter."
  },
  {
    "verb": "gratulieren",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Ich gratuliere dir herzlich zum Abschluss."
  },
  {
    "verb": "handeln",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Der Roman handelt von einer komplizierten Familiengeschichte."
  },
  {
    "verb": "handeln",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Das Unternehmen handelt mit Maschinen aus Asien."
  },
  {
    "verb": "hängen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Der Erfolg hängt von mehreren Bedingungen ab."
  },
  {
    "verb": "hinarbeiten",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Wir arbeiten gemeinsam auf dieses Ziel hin."
  },
  {
    "verb": "hindeuten",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Daten deuten auf einen möglichen Zusammenhang hin."
  },
  {
    "verb": "hinweisen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Bericht weist auf erhebliche Risiken hin."
  },
  {
    "verb": "sich identifizieren",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Viele Mitarbeiter identifizieren sich stark mit dem Unternehmen."
  },
  {
    "verb": "imponieren",
    "prep": "auf",
    "kasus": "Dat.",
    "example": "Seine Ruhe imponiert mir in schwierigen Situationen."
  },
  {
    "verb": "investieren",
    "prep": "in",
    "kasus": "Akk.",
    "example": "Das Unternehmen investiert viel Geld in Forschung."
  },
  {
    "verb": "kandidieren",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Er kandidiert für den Vorsitz des Vereins."
  },
  {
    "verb": "konkurrieren",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Kleine Firmen können nur schwer mit globalen Konzernen konkurrieren."
  },
  {
    "verb": "konkurrieren",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Mehrere Bewerber konkurrieren um dieselbe Stelle."
  },
  {
    "verb": "sich orientieren",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Wir orientieren uns an den Bedürfnissen unserer Kunden."
  },
  {
    "verb": "plädieren",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Die Experten plädieren für eine vorsichtige Reform."
  },
  {
    "verb": "profitieren",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Beide Seiten profitieren von der Zusammenarbeit."
  },
  {
    "verb": "protestieren",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Tausende Menschen protestierten gegen die geplante Reform."
  },
  {
    "verb": "reagieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Firma reagierte schnell auf die Kritik."
  },
  {
    "verb": "referieren",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Morgen referiert sie über moderne Finanzsysteme."
  },
  {
    "verb": "resignieren",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Er resignierte über die mangelnden Fortschritte."
  },
  {
    "verb": "resultieren",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Die Unterschiede resultieren aus verschiedenen Annahmen."
  },
  {
    "verb": "schließen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus diesen Zahlen lässt sich einiges schließen."
  },
  {
    "verb": "schließen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Daraus kann man auf ein strukturelles Problem schließen."
  },
  {
    "verb": "sich schämen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Er schämt sich noch immer für seinen Fehler."
  },
  {
    "verb": "sich scheuen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Gute Führungskräfte scheuen sich nicht vor schwierigen Entscheidungen."
  },
  {
    "verb": "sich sehnen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Nach dem hektischen Semester sehnte sie sich nach einem ruhigen Wochenende."
  },
  {
    "verb": "sich unterscheiden",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Diese Methode unterscheidet sich deutlich von der klassischen Variante."
  },
  {
    "verb": "sich unterscheiden",
    "prep": "in",
    "kasus": "Dat.",
    "example": "Die beiden Modelle unterscheiden sich nur in wenigen Punkten."
  },
  {
    "verb": "sich richten",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Der Preis richtet sich nach der Nachfrage."
  },
  {
    "verb": "sich spezialisieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Agentur hat sich auf mittelständische Kunden spezialisiert."
  },
  {
    "verb": "sich streiten",
    "prep": "mit",
    "kasus": "Dat. / über",
    "example": "Sie stritt sich mit ihrem Kollegen über eine Kleinigkeit."
  },
  {
    "verb": "sich sträuben",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Viele Unternehmen sträuben sich gegen zusätzliche Bürokratie."
  },
  {
    "verb": "stammen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Das Zitat stammt aus einem historischen Dokument."
  },
  {
    "verb": "streben",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Das Start-up strebt nach internationalem Wachstum."
  },
  {
    "verb": "teilhaben",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Die Mitarbeiter sollen stärker am Erfolg des Unternehmens teilhaben."
  },
  {
    "verb": "tendieren",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Die Nachfrage tendiert derzeit zu günstigeren Produkten."
  },
  {
    "verb": "übergehen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Danach gingen wir zu einem anderen Thema über."
  },
  {
    "verb": "überreden",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Niemand konnte mich zu dieser Entscheidung überreden."
  },
  {
    "verb": "verfügen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Die Universität verfügt über eine hervorragende Bibliothek."
  },
  {
    "verb": "verlangen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Die Situation verlangt nach einer schnellen Lösung."
  },
  {
    "verb": "sich verlassen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Auf ihn kann man sich jederzeit verlassen."
  },
  {
    "verb": "sich vorbereiten",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Ich bereite mich intensiv auf die Prüfung vor."
  },
  {
    "verb": "sich verabreden",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Ich habe mich für Samstag mit Freunden verabredet."
  },
  {
    "verb": "sich verhalten",
    "prep": "gegenüber",
    "kasus": "Dat.",
    "example": "Er verhielt sich gegenüber seinen Mitarbeitern stets respektvoll."
  },
  {
    "verb": "verfügen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Der Bewerber verfügt über ausgezeichnete Sprachkenntnisse."
  },
  {
    "verb": "verzichten",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Wegen des Wetters verzichteten wir auf die Wanderung."
  },
  {
    "verb": "sich verständigen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die beiden Parteien verständigten sich auf einen neuen Vertrag."
  },
  {
    "verb": "sich verständigen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Obwohl sie verschiedene Sprachen sprechen, konnten sie sich mit Gesten verständigen."
  },
  {
    "verb": "sich vergewissern",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Bitte vergewissern Sie sich über die aktuellen Öffnungszeiten."
  },
  {
    "verb": "sich verteidigen",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Das Unternehmen verteidigte sich gegen die Vorwürfe."
  },
  {
    "verb": "sich wenden",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Der Verband wendet sich gegen diese Form der Ausgrenzung."
  },
  {
    "verb": "werben",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Die Kampagne wirbt für nachhaltige Mobilität."
  },
  {
    "verb": "werben",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Die Firma wirbt um hochqualifizierte Fachkräfte."
  },
  {
    "verb": "wirken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Entscheidung könnte sich negativ auf das Vertrauen auswirken."
  },
  {
    "verb": "zählen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "In schwierigen Phasen zählt das Team auf seine erfahrensten Mitarbeiter."
  },
  {
    "verb": "zeugen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Seine Reaktion zeugt von großer Professionalität."
  },
  {
    "verb": "zusammenhängen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Schlafprobleme können mit beruflichem Stress zusammenhängen."
  },
  {
    "verb": "zurückgreifen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Bei Problemen können wir auf frühere Daten zurückgreifen."
  },
  {
    "verb": "zurückkommen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Später komme ich noch einmal auf diesen Punkt zurück."
  },
  {
    "verb": "zustimmen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Nicht alle Abgeordneten stimmten dem Vorschlag zu."
  },
  {
    "verb": "zweifeln",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Ich zweifle nicht an seiner guten Absicht."
  },
  {
    "verb": "sich abfinden",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Irgendwann musste er sich mit der Situation abfinden."
  },
  {
    "verb": "sich abheben",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Das Produkt hebt sich deutlich von der Konkurrenz ab."
  },
  {
    "verb": "sich anpassen",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Unternehmen müssen sich an neue Marktbedingungen anpassen."
  },
  {
    "verb": "sich berufen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Angeklagte berief sich auf sein Recht zu schweigen."
  },
  {
    "verb": "sich befreien",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Mit diesem Schritt konnte sie sich von alten Verpflichtungen befreien."
  },
  {
    "verb": "sich bekennen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Der Konzern bekannte sich ausdrücklich zu seinen Grundwerten."
  },
  {
    "verb": "beitragen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Jeder kann zum Gelingen des Projekts beitragen."
  },
  {
    "verb": "sich einigen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Nach langen Verhandlungen einigten sich beide Seiten auf einen Kompromiss."
  },
  {
    "verb": "sich entfernen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Das Schiff entfernte sich langsam vom Hafen."
  },
  {
    "verb": "sich entschließen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Schließlich entschloss sie sich zu einem Neustart."
  },
  {
    "verb": "sich ergeben",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus den Gesprächen ergaben sich neue Möglichkeiten."
  },
  {
    "verb": "sich erweisen",
    "prep": "als",
    "kasus": "Akk.",
    "example": "Die anfängliche Skepsis erwies sich als unbegründet."
  },
  {
    "verb": "führen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Eine falsche Interpretation kann zu erheblichen Problemen führen."
  },
  {
    "verb": "sich herleiten",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Die Formel lässt sich aus einem einfachen Grundprinzip herleiten."
  },
  {
    "verb": "hinwirken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Reform soll auf mehr Transparenz hinwirken."
  },
  {
    "verb": "in Verbindung stehen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Die Beschwerden stehen möglicherweise mit dem Wetter in Verbindung."
  },
  {
    "verb": "sich konzentrieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Das Unternehmen konzentriert sich inzwischen auf den europäischen Markt."
  },
  {
    "verb": "sich orientieren",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Die Gestaltung orientiert sich an internationalen Standards."
  },
  {
    "verb": "resultieren",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Die hohen Kosten resultieren aus mehreren Faktoren."
  },
  {
    "verb": "schützen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Ein gutes Passwort schützt vor unbefugtem Zugriff."
  },
  {
    "verb": "sich unterscheiden",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Theorie und Praxis unterscheiden sich manchmal erheblich voneinander."
  },
  {
    "verb": "sich unterwerfen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Das Land unterwarf sich dem internationalen Druck."
  },
  {
    "verb": "sich verpflichten",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Beide Parteien verpflichteten sich zur Vertraulichkeit."
  },
  {
    "verb": "sich verständigen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Regierung und die Opposition verständigten sich auf einen Kompromiss."
  },
  {
    "verb": "sich verhalten",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Wie verhält sich diese Zahl zu den Ergebnissen des Vorjahres?"
  },
  {
    "verb": "sich widmen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Nach seinem Studium widmete er sich vollständig der Forschung."
  },
  {
    "verb": "sich widersprechen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Seine Aussagen widersprechen den bisherigen Ergebnissen."
  },
  {
    "verb": "sich widersetzen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Die Beschäftigten widersetzten sich der geplanten Änderung."
  },
  {
    "verb": "abzielen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die neue Strategie zielt auf eine langfristige Verbesserung ab."
  },
  {
    "verb": "absehen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Wegen der hohen Kosten sehen wir von diesem Projekt ab."
  },
  {
    "verb": "anstoßen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Reform stieß eine wichtige Diskussion über Datenschutz an."
  },
  {
    "verb": "aufbauen",
    "prep": "auf",
    "kasus": "Dat.",
    "example": "Das neue Modell baut auf früheren Forschungsergebnissen auf."
  },
  {
    "verb": "aufpassen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Kannst du während meiner Abwesenheit auf die Pflanzen aufpassen?"
  },
  {
    "verb": "ausbrechen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Mehrere Tiere sind aus dem Gehege ausgebrochen."
  },
  {
    "verb": "sich auszeichnen",
    "prep": "durch",
    "kasus": "Akk.",
    "example": "Die Bewerberin zeichnet sich durch außergewöhnliche Kreativität aus."
  },
  {
    "verb": "sich befreien",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Er konnte sich nur schwer aus dieser schwierigen Lage befreien."
  },
  {
    "verb": "sich beruhigen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Er konnte sich über die Entscheidung zunächst nicht beruhigen."
  },
  {
    "verb": "bestehen",
    "prep": "in",
    "kasus": "Dat.",
    "example": "Die eigentliche Herausforderung besteht in der Umsetzung."
  },
  {
    "verb": "sich beteiligen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Auch kleinere Unternehmen beteiligen sich an der Initiative."
  },
  {
    "verb": "sich beziehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Meine Frage bezieht sich auf den letzten Abschnitt."
  },
  {
    "verb": "sich distanzieren",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Der Politiker distanzierte sich von früheren Aussagen."
  },
  {
    "verb": "drängen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Gewerkschaft drängt auf höhere Löhne."
  },
  {
    "verb": "eingehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Autor geht ausführlich auf diesen Einwand ein."
  },
  {
    "verb": "einwirken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Medien können stark auf die öffentliche Meinung einwirken."
  },
  {
    "verb": "sich einstellen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Wir müssen uns auf weitere Veränderungen einstellen."
  },
  {
    "verb": "sich ergeben",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus den Interviews ergeben sich überraschende Ergebnisse."
  },
  {
    "verb": "sich entwickeln",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Das kleine Start-up entwickelte sich zu einem internationalen Unternehmen."
  },
  {
    "verb": "sich erfreuen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Der Park erfreut sich bei Familien großer Beliebtheit."
  },
  {
    "verb": "sich erheben",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Viele Bürger erhoben sich gegen die neue Regelung."
  },
  {
    "verb": "sich erkundigen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Ich erkundigte mich nach den aktuellen Bedingungen."
  },
  {
    "verb": "sich erstrecken",
    "prep": "von",
    "kasus": "Dat. bis",
    "example": "Das Naturschutzgebiet erstreckt sich von der Küste bis ins Gebirge."
  },
  {
    "verb": "fliehen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Tausende Menschen mussten vor dem Krieg fliehen."
  },
  {
    "verb": "sich fokussieren",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Das Unternehmen fokussiert sich zunehmend auf digitale Produkte."
  },
  {
    "verb": "sich freuen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Sie freut sich an den kleinen Dingen des Alltags."
  },
  {
    "verb": "sich fürchten",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Die Eltern fürchten um die Sicherheit ihres Kindes."
  },
  {
    "verb": "gelten",
    "prep": "als",
    "kasus": "Nom.",
    "example": "Diese Methode gilt als besonders zuverlässig."
  },
  {
    "verb": "genügen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Diese Daten genügen für eine erste Einschätzung."
  },
  {
    "verb": "geraten",
    "prep": "unter",
    "kasus": "Akk.",
    "example": "Das Unternehmen geriet durch die Krise unter erheblichen Druck."
  },
  {
    "verb": "gründen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Seine Argumentation gründet auf mehreren empirischen Studien."
  },
  {
    "verb": "greifen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Das Unternehmen greift nach neuen Marktanteilen."
  },
  {
    "verb": "hinauslaufen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Am Ende läuft die Diskussion auf einen Kompromiss hinaus."
  },
  {
    "verb": "hinweisen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Zahlen weisen auf eine strukturelle Veränderung hin."
  },
  {
    "verb": "hinwirken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Maßnahmen wirken auf eine nachhaltige Lösung hin."
  },
  {
    "verb": "sich hinauszögern",
    "prep": "bis zu",
    "kasus": "Dat.",
    "example": "Die Verhandlungen zogen sich bis zu einer endgültigen Einigung hinaus."
  },
  {
    "verb": "sich halten",
    "prep": "an",
    "kasus": "Akk.",
    "example": "Bitte halten Sie sich an die vereinbarten Regeln."
  },
  {
    "verb": "sich handeln",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Bei diesem Dokument handelt es sich um einen Entwurf."
  },
  {
    "verb": "herausgehen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Viele nützliche Informationen gehen aus der Studie hervor."
  },
  {
    "verb": "hervorgehen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus dem Bericht geht deutlich hervor, dass die Kosten gestiegen sind."
  },
  {
    "verb": "hervorgehen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Aus den Ergebnissen geht eine klare Tendenz hervor."
  },
  {
    "verb": "investieren",
    "prep": "in",
    "kasus": "Akk.",
    "example": "Immer mehr Firmen investieren in erneuerbare Energien."
  },
  {
    "verb": "isolieren",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Die Region war jahrelang von der Außenwelt isoliert."
  },
  {
    "verb": "sich lösen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Sie konnte sich endlich von alten Denkmustern lösen."
  },
  {
    "verb": "messen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Erfolg sollte nicht nur am Umsatz gemessen werden."
  },
  {
    "verb": "münden",
    "prep": "in",
    "kasus": "Akk.",
    "example": "Die Verhandlungen mündeten in einem überraschenden Abkommen."
  },
  {
    "verb": "sich orientieren",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Das Design orientiert sich an modernen europäischen Standards."
  },
  {
    "verb": "sich äußern",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Der Minister äußerte sich kritisch zu dem Vorschlag."
  },
  {
    "verb": "sich rächen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Der Konflikt rächte sich später an allen Beteiligten."
  },
  {
    "verb": "sich rächen",
    "prep": "für",
    "kasus": "Akk.",
    "example": "Er wollte sich für die erlittene Niederlage rächen."
  },
  {
    "verb": "sich richten",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Die Kritik richtet sich gegen die Unternehmensleitung."
  },
  {
    "verb": "schöpfen",
    "prep": "aus",
    "kasus": "Dat.",
    "example": "Das Team schöpft viel Energie aus dem gemeinsamen Erfolg."
  },
  {
    "verb": "schwören",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Meine Großmutter schwört auf dieses traditionelle Rezept."
  },
  {
    "verb": "sich sträuben",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Viele Menschen sträuben sich gegen unnötige Veränderungen."
  },
  {
    "verb": "sich stützen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die These stützt sich auf aktuelle Forschungsergebnisse."
  },
  {
    "verb": "stolpern",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Der Journalist stolperte über einen unerwarteten Fehler im Dokument."
  },
  {
    "verb": "sich täuschen",
    "prep": "in",
    "kasus": "Dat.",
    "example": "Du hast dich in seiner Absicht getäuscht."
  },
  {
    "verb": "tendieren",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Die Branche tendiert zunehmend zu flexiblen Arbeitsmodellen."
  },
  {
    "verb": "übergehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Nach der Pause gingen wir auf ein neues Thema über."
  },
  {
    "verb": "überleiten",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Der Moderator leitete geschickt zum nächsten Thema über."
  },
  {
    "verb": "sich überschneiden",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Meine Arbeitszeit überschneidet sich mit der Vorlesung."
  },
  {
    "verb": "überzeugen",
    "prep": "durch",
    "kasus": "Akk.",
    "example": "Das Konzept überzeugt durch seine klare Struktur."
  },
  {
    "verb": "verfügen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Die Abteilung verfügt über ein begrenztes Budget."
  },
  {
    "verb": "sich verlassen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Auf zuverlässige Daten muss man sich verlassen können."
  },
  {
    "verb": "verlangen",
    "prep": "nach",
    "kasus": "Dat.",
    "example": "Die aktuelle Lage verlangt nach einer schnellen Reaktion."
  },
  {
    "verb": "sich versteifen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Er versteifte sich auf eine einzige Lösung."
  },
  {
    "verb": "sich vorsehen",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "In diesem Stadtteil sollte man sich nachts vor Taschendieben vorsehen."
  },
  {
    "verb": "sich wenden",
    "prep": "gegen",
    "kasus": "Akk.",
    "example": "Die Kampagne wendet sich gegen soziale Ungleichheit."
  },
  {
    "verb": "widerstehen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Er konnte der Versuchung nicht widerstehen."
  },
  {
    "verb": "sich widmen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Nach der Pensionierung widmete sie sich ganz der Fotografie."
  },
  {
    "verb": "widersprechen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Seine Aussage widerspricht den verfügbaren Fakten."
  },
  {
    "verb": "sich widersetzen",
    "prep": "",
    "kasus": "Dat.",
    "example": "Die Mitarbeiter widersetzen sich dem geplanten Abbau von Stellen."
  },
  {
    "verb": "zurückführen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Erfolg lässt sich auf mehrere Faktoren zurückführen."
  },
  {
    "verb": "zurückgreifen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Bei Bedarf können wir auf ältere Daten zurückgreifen."
  },
  {
    "verb": "zurückkommen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Ich möchte später noch einmal auf diesen Punkt zurückkommen."
  },
  {
    "verb": "zusammenarbeiten",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Unsere Fakultät arbeitet mit mehreren Unternehmen zusammen."
  },
  {
    "verb": "zusammenhängen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Die Probleme hängen eng mit fehlender Kommunikation zusammen."
  },
  {
    "verb": "zusammenstoßen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Das Auto stieß mit einem Lieferwagen zusammen."
  },
  {
    "verb": "zunehmen",
    "prep": "an",
    "kasus": "Dat.",
    "example": "Die Region nimmt zunehmend an wirtschaftlicher Bedeutung zu."
  },
  {
    "verb": "zugreifen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Nutzer können jederzeit auf die gespeicherten Dateien zugreifen."
  },
  {
    "verb": "zurückschrecken",
    "prep": "vor",
    "kasus": "Dat.",
    "example": "Gute Führungskräfte schrecken nicht vor schwierigen Entscheidungen zurück."
  },
  {
    "verb": "sich abmühen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Seit Stunden müht er sich mit diesem komplizierten Problem ab."
  },
  {
    "verb": "sich abfinden",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Irgendwann musste sie sich mit der Realität abfinden."
  },
  {
    "verb": "sich abheben",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Das Unternehmen hebt sich durch seinen Service von der Konkurrenz ab."
  },
  {
    "verb": "sich anfreunden",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Nach und nach freundete er sich mit der neuen Situation an."
  },
  {
    "verb": "sich anmaßen",
    "prep": "",
    "kasus": "Akk.",
    "example": "Niemand sollte sich anmaßen, über andere zu urteilen."
  },
  {
    "verb": "sich aufregen",
    "prep": "über",
    "kasus": "Akk.",
    "example": "Sie regt sich ständig über kleine Fehler auf."
  },
  {
    "verb": "ausgehen",
    "prep": "von",
    "kasus": "Dat.",
    "example": "Wir gehen derzeit von einem stabilen Wachstum aus."
  },
  {
    "verb": "auskommen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Mit einem begrenzten Budget muss man vernünftig auskommen."
  },
  {
    "verb": "sich auseinandersetzen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Studierende müssen sich kritisch mit verschiedenen Positionen auseinandersetzen."
  },
  {
    "verb": "beitragen",
    "prep": "zu",
    "kasus": "Dat.",
    "example": "Gute Kommunikation trägt wesentlich zum Erfolg eines Projekts bei."
  },
  {
    "verb": "sich befassen",
    "prep": "mit",
    "kasus": "Dat.",
    "example": "Die Kommission befasst sich derzeit mit dem Fall."
  },
  {
    "verb": "sich belaufen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Gesamtkosten belaufen sich auf rund zwei Millionen Euro."
  },
  {
    "verb": "sich bemühen",
    "prep": "um",
    "kasus": "Akk.",
    "example": "Das Unternehmen bemüht sich um eine faire Lösung."
  },
  {
    "verb": "beruhen",
    "prep": "auf",
    "kasus": "Dat.",
    "example": "Die Entscheidung beruht auf mehreren unabhängigen Analysen."
  },
  {
    "verb": "sich berufen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Angeklagte berief sich auf sein Schweigerecht."
  },
  {
    "verb": "sich beschränken",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Der Bericht beschränkt sich auf die wichtigsten Kennzahlen."
  },
  {
    "verb": "bestehen",
    "prep": "auf",
    "kasus": "Dat.",
    "example": "Der Kunde bestand auf einer vollständigen Rückerstattung."
  },
  {
    "verb": "sich bewähren",
    "prep": "in",
    "kasus": "Dat.",
    "example": "Seine Strategie hat sich in schwierigen Situationen bewährt."
  },
  {
    "verb": "sich beziehen",
    "prep": "auf",
    "kasus": "Akk.",
    "example": "Die Regel bezieht sich ausschließlich auf Vollzeitbeschäftigte."
  }
];

// ── STATE ────────────────────────────────────────────────────────────────────
let state = {
  deck: [...ALL_CARDS],
  index: 0,
  flipped: false,
  correct: 0,
  wrong: 0,
  filter: 'all',   // 'all' | 'akk' | 'dat'
  mode: 'sequential',
  wrongCards: [],
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function isAkk(card) { return card.kasus.toLowerCase().includes('akk'); }
function isDat(card) { return card.kasus.toLowerCase().includes('dat'); }

function buildDeck() {
  let source = ALL_CARDS;
  if (state.filter === 'akk') source = ALL_CARDS.filter(isAkk);
  if (state.filter === 'dat') source = ALL_CARDS.filter(isDat);
  if (state.mode === 'random') {
    source = [...source].sort(() => Math.random() - 0.5);
  }
  return source;
}

function getCard() { return state.deck[state.index]; }

// ── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  const card = getCard();
  if (!card) { showDone(); return; }

  // Front
  document.getElementById('verb-display').textContent = card.verb;
  document.getElementById('card-number').textContent = `#${state.index + 1} / ${state.deck.length}`;

  // Back
  document.getElementById('back-verb').textContent = card.verb;
  document.getElementById('back-prep').textContent = card.prep;
  document.getElementById('back-example').textContent = card.example;

  const kasusBadge = document.getElementById('back-kasus');
  kasusBadge.textContent = card.kasus;
  kasusBadge.className = 'kasus-badge' + (isDat(card) && !isAkk(card) ? ' dat' : '');

  // Flip state
  const cardEl = document.getElementById('card');
  cardEl.classList.toggle('flipped', state.flipped);

  // Progress
  const pct = ((state.index + 1) / state.deck.length) * 100;
  document.getElementById('progress-bar').style.setProperty('--pct', pct + '%');
  document.getElementById('progress-text').textContent = `${state.index + 1} / ${state.deck.length}`;

  // Stats
  document.getElementById('total-count').textContent = state.deck.length;
  document.getElementById('correct-count').textContent = state.correct;
  document.getElementById('wrong-count').textContent = state.wrong;
}

// ── FLIP ─────────────────────────────────────────────────────────────────────
function flipCard() {
  if (state.flipped) return; // only flip to back from front
  state.flipped = true;
  render();
}

// ── ANSWER ───────────────────────────────────────────────────────────────────
function markCorrect() {
  state.correct++;
  nextCard();
}
function markWrong() {
  state.wrong++;
  state.wrongCards.push(getCard());
  nextCard();
}

function nextCard() {
  state.index++;
  state.flipped = false;
  if (state.index >= state.deck.length) { showDone(); return; }
  render();
}

function prevCard() {
  if (state.index <= 0) return;
  state.index--;
  state.flipped = false;
  render();
}

// ── DONE ─────────────────────────────────────────────────────────────────────
function showDone() {
  document.getElementById('done-screen').style.display = 'flex';
  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  document.getElementById('done-correct').textContent = state.correct;
  document.getElementById('done-wrong').textContent = state.wrong;
  document.getElementById('done-pct').textContent = pct + '%';
  document.getElementById('btn-wrong-only').style.display = state.wrongCards.length > 0 ? 'block' : 'none';
}

function hideDone() {
  document.getElementById('done-screen').style.display = 'none';
}

function restart(deck) {
  state.deck = deck || buildDeck();
  state.index = 0;
  state.flipped = false;
  state.correct = 0;
  state.wrong = 0;
  state.wrongCards = [];
  hideDone();
  render();
}

// ── FILTER / MODE ─────────────────────────────────────────────────────────────
function setFilter(f) {
  state.filter = f;
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === f);
  });
  restart();
}

function setMode(m) {
  state.mode = m;
  document.querySelectorAll('[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === m);
  });
  restart();
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────
document.getElementById('card').addEventListener('click', flipCard);

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); flipCard(); }
  if (e.code === 'ArrowRight') { if (state.flipped) markCorrect(); else nextCard(); }
  if (e.code === 'ArrowLeft')  { prevCard(); }
  if (e.code === 'Digit1' && state.flipped) markWrong();
  if (e.code === 'Digit2' && state.flipped) markCorrect();
});

document.getElementById('btn-correct').addEventListener('click', e => { e.stopPropagation(); markCorrect(); });
document.getElementById('btn-wrong').addEventListener('click',   e => { e.stopPropagation(); markWrong(); });
document.getElementById('btn-next').addEventListener('click', () => { if (state.flipped) markCorrect(); else flipCard(); });
document.getElementById('btn-prev').addEventListener('click', prevCard);
document.getElementById('btn-restart').addEventListener('click', () => restart());
document.getElementById('btn-done-restart').addEventListener('click', () => restart());
document.getElementById('btn-wrong-only').addEventListener('click', () => {
  const wrongDeck = state.wrongCards.length > 0 ? [...state.wrongCards] : buildDeck();
  restart(state.mode === 'random' ? wrongDeck.sort(() => Math.random() - 0.5) : wrongDeck);
});

document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});
document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ── INIT ──────────────────────────────────────────────────────────────────────
render();
