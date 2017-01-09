# MME Battleship

MME project repository

## How-to: Installieren & Ausführen

### Im lokalen Repository:

#### Requirements
Die App benötigt eine lokale Postgres-Instanz. Die URL zu dieser Datenbank muss der App dann beim Start als `environment variable` übergeben werden. Dies kann über zwei Wege geschehen:

- per `export`:
```
#!cmd

export DATABASE_URL=postgres:///$(whoami)
```

- per .env Datei:
```
#!cmd

DATABASE_URL=postgres:///$(whoami)
```

Diese und weitere Informationen zum Einrichten einer lokalen Postgres-Instanz: [Postgres Local Setup](https://devcenter.heroku.com/articles/heroku-postgresql#local-setup)

#### Setup

- Installieren mit:
```
#!cmd

npm install
```

- Ausführen mit:
```
#!cmd

npm start
```

Die App ist jetzt über `localhost:8080` erreichbar.


### Im Heroku Repository:
Es steht jederzeit auch eine funktionierende Kopie der App zum Testing bereit. Die gehostete Version steht unter folgendem Link zur Verfügung: [MME Battleship](mme-battleship.herokuapp.com)



## Dokumentation

### Kommunikation Client / Server

Die Kommunikation zwischen Client und Server ist mit `socket.io` realisiert und basiert auf den folgenden Events:

#### "connection"
Dieses Event wird auf dem Server ausgelöst, wenn sich ein neuer Client verbindet, i.e. die Website im Browser aufruft. Dabei wird das 'socket', also der Peer, übergeben und auf diesem Socket-Objekt werden jetzt mehrere Event-Listener registriert, die auf die folgenden Events reagieren.

#### "login"
Dieses Event wird beim Client auf dem Socket aufgerufen, wenn sich der Nutzer über den Login in der Chatbox mit seinem Benutzernamen anmeldet. Dieser wird zusammen mit dem Event übertragen. Der Server reagiert auf dieses Event, indem er den neuen Nutzer in der Datenbank zusammen mit seiner Socket-ID persistiert oder die aktuelle Socket-ID eines bereits bestehenden Nutzers in der Datenbank aktualisiert.

#### "message"
Dieses Event wird beim Client auf dem Socket aufgerufen, wenn der Nutzer über das Eingabefeld der Chatbox eine Nachricht abschickt. Diese wird zusammen mit dem Event übertragen. Der Server reagiert darauf, indem er die mitgeschickte Chatnachricht zusammen mit dem Nutzernamen, der auf dem Server dem abschickenden Socket zugewiesen ist, an alle anderen Sockets im selben 'Room' schickt. Dieser Room ist entweder die Lobby oder private Room zweier Sockets während eines Matches.

#### "log"
Dieses Event kann vom Client oder vom Server hervorgerufen werden. Dabei wird eine Systemnachricht entweder vom Server an alle Sockets oder alle Sockets eines Rooms geschickt oder von einem Client zu den jeweils anderen Clients im selben Room geschickt. Die Lognachricht wird mit dem Event mitgeschickt.

#### "update"
Dieses Event wird vom Client ausgelöst, um die Einträge eines Nutzers in der Datenbank zu aktualisieren. Dabei wird ein Objekt mit den neuen Einträgen des Nutzers mitgeschickt. Nur die darin befindlichen Werte werden auf dem Server aktualisiert – alle anderen bleiben unverändert.

#### "ready"
Dieses Event wird beim Client auf dem Socket aufgerufen, wenn der Nutzer den Ready-Button vor Matchbeginn betätigt. Dem Event werden keine Daten beigefügt. Auf dem Server wird dadurch der Matchmaking-Prozess ausgelöst.

#### "turn"
Dieses Event wird beim Client auf dem Socket aufgerufen, wenn der Zug eines Nutzers beendet wird. Dem Event werden keine Daten beigefügt. Der Server leitet dieses Event dann an das andere Socket im privaten Match-Room weiter, wodurch der Zug des anderen Nutzers beginnt.

#### "action"
Dieses Event wird beim Client auf dem Socket aufgerfuden, wenn der Nutzer eine Aktion getätigt hat. Dabei kann es sich um einen simplen Klick auf die gegnerische Map handeln oder die Verwendung eines Powerups. Dem Event wird ein Objekt beigefügt, das einen 'type' der Aktion und die Koordinaten der durch die Aktion betroffenen Felder enthält.

#### "report"
Dieses Event wird beim Client auf dem Socket aufgerufen, wenn die Aktionen eines 'action'-Events ausgeführt wurden. Dem Event wird ein Objekt beigefügt, das ein oder mehrere Resultate bzw. Rückmeldungen der Aktion auf den unterschiedlichen Feldern beinhaltet.

#### "disconnect"
Dieses Event wird vom Socket des Clients aufgerufen, wenn der Client vom Server getrennt wird, z.B. Schließen des Browserfensters.

### Funktionalität
 - Sobald ein neuer Nutzer die Seite aufruft, wird er in die Lobby mit allen anderen Spielern geschickt.
 - Wenn der Nutzer sich per Nutzername anmeldet, wird er in der Datenbank persistiert. Falls er sich schon registriert hat, wird nur noch sein existierender Eintrag mit der aktuellen Socket-ID aktualisiert. Dies kann auch während dem Spiel noch geschehen.
 - Der Datensatz, der gespeichert wird, umfasst deswegen die socketID, damit man für die spätere Entwicklung eine Schnittstelle zwischen Socket und der Datenbank zur Verfügung hat.
 - Ein Klick auf den Ready-Button verhindert die weitere Veränderung der Positionen der Schiffe und startet das Matchmaking. Hierbei wird der Spieler auf eine Warteliste gesetzt und gewartet, dass sich ein anderer Nutzer ebenso als 'ready' markiert.
 - Wurde ein Gegner gefunden, startet das Spiel. Die beiden Spieler werden aus der Lobby getrennt, in einen privaten 'Room' geschickt und können spielen.
 - Während dem Spiel haben die Nutzer mehrere Möglichkeiten:
    - Der einfache Schuss trifft wie im originalen Schiffeversenken ein Feld.
    - Ein Scan kann eine Fläche von 4x4 Feldern aufdecken.
    - Das Schild beschützt eine Fläche von 3x3 auf dem eigenen Spielfeld und bildet so eine einmalige Schutzschicht über jedes Feld.
    - Die Bombe kann 2x2 Felder abschießen und reagiert sonst wie ein einfacher Schuss.
    - Eine Missile wird bei einem Treffer, das ganze Schiff zerstören. Wenn dieses unter einem Schild liegt, werden alle Teile des Schilds zerstört unter dem das Schiff liegt.
 - Der Wirkungsradius der einzelnen Powerups, als auch die Anzahl, wie viele davon pro Match zur Verfügung stehen, können wie viele andere Parameter des Spiels über eine zentrale 'Settings'-Datei angpasst werden.
 - Jeder Spieler bekommt am Anfang des Spiels jeweils drei zufällige Powerups für das Match zur Verfügung gestellt.
 - Wenn ein Spieler alle Schiffe des Gegners zerstört hat, wird eine Schlusssequenz animiert. Nun können die Spieler weiterhin chatten und die Karte drehen, um ihr Spiel zum Beispiel noch zu analysieren.
 - Bei einem disconnect des Spielers, wie oben beschrieben, wird der jeweils andere Spieler informiert, dass der Gegner das Spiel verlassen hat. 

### Was ist möglich?
Unsere Battleship-Applikation ermöglicht es jeweils 2 Spielern über 2 verschiedene Browserfenster Schifferversenken zu spielen. Hierbei ist es egal, ob sie am selben Rechner sitzen oder am anderen Ende der Welt.
Es wird ein reibungsloser Ablauf gewährleistet und ein erweitertes Spielprinzip für das schon in die Jahre gekommene Schiffeversenken. Der Spieler bekommt bei dem Spiel nicht nur erweiterte Möglichkeiten im Spiel selbst, sondern kann auch mit Spielern in Echtzeit chatten. Das Spielfeld besteht aus 10x10 Feldern und wird automatisch mit Schiffen bestückt, die randomisiert platziert werden. Der Spieler kann seine Schiffe via "Drag and Drop" platzieren wie er will. Hierbei wird ihm angezeigt, wo er diese platzieren kann und wo nicht. Außerdem kann er Schiffe, wenn es möglich ist, per Klick auf jenes rotieren lassen. Neben dem Spielfeld haben die Nutzer eine Chatbox, die zur Kommunikation in den einzelnen Chaträumen einlädt. Hier kann sich der Nutzer auch mit einem Nutzernamen anmelden, der als Entität in einer Datenbank gespeichert wird. Sobald der Nutzer nun auf den "Ready"-Button drückt, sucht der Server nach einem anderen Spieler. Ab diesem Zeitpunkt ist es nicht mehr möglich die Schiffe zu bewegen. Wenn nun ein zweiter Spieler nach einem Gegner sucht, werden die beiden in einen einzelnen Raum platziert. Nun sind die beiden Spieler abgekapselt und chatten und spielen nur für sich. Dabei handelt es sich um eine ganz normale rundenbasierte Spielweise. Die Extras, die jedem Nutzer bereitstehen, sind folgende: Schild, Scan, Bombe und Missile. Die Anwendung dieser, wird dem Gegner im Chat mitgeteilt. Das Schild kann einen Bereich, wenn gewünscht auch doppelt, auf dem eigenen Spielfeld sichern. Es kann 2-mal genutzt werden und deckt 3x3 Felder ab. Wenn der Gegner nun auf eine vom Schild geschützte Fläche trifft, wird zwar das Schild zerstört, aber die Schiffe darunter nicht. Der Gegner muss noch einmal treffen, um die darunterliegenden Schiffe zu zerstören. Nach dem Benutzen des Schildes, kann der Spieler nochmal eine Aktion betätigen. Entweder er verwendet eines der anderen Powerups oder versucht einen normalen Treffer zu landen. Der Scan ist eine weitere Komponente der Powerups. Es handelt sich hierbei um eine Funktion, die Koordinaten der Schiffe des Gegners herauszufinden. Ein Schild wird jedoch nicht angezeigt. Der Scan deckt 4x4 Felder ab und kann 1-mal genutzt werden. Die Bombe hat die Funktion eines erweiterten Schusses, da hier 2x2 Felder statt 1 Feld abgeschossen wird. Dieses Powerup steht genau 3-mal zur Verfügung. Zu guter Letzt wird die Missile beschrieben. Eine Rakete, die bei einem direkten Treffer das ganze Schiff zerstört. Wenn das Schiff nun geschützt ist, wird erst jeder geschützte Teil des Schiffes abgeschossen und falls das Schild nicht mehr das ganze Schiff beschützt, wird dieser Teil gleich getroffen. Die Missile steht dem Spieler insgesamt 4-mal zur Verfügung. Jeder Spieler erhält zufällig 3 Powerups bei Beginn eines Spieles, was eine gewisse Flexibilität des Spielprinzips ermöglicht. Während jedem Zug läuft ein Timer ab, der die Dauer des Zuges limitiert und wird nur abgebrochen, wenn der Nutzer eine Aktion, außer dem Setzen eines Schildes, ausführt. Außerdem kann der Spieler im laufenden Zug die Karte drehen, um sich beide Spielfelder anzusehen. Beendet er den Zug, kann er nur noch seine eigene Karte sehen. Das Spiel endet, wenn alle Schiffe eines Spielers zerstört wurden. Die Gewinnbedingung kann aber auch durch das Verlassen, des jeweils anderen ausgelöst werden. Endet das Spiel, wird eine Grafik eingeblendet und die Wins, Losses und Points in der Datenbank persistiert..
Danach kann man weiterhin mit dem Gegner kommunizieren und die Karte drehen.

### Was wurde nicht umgesetzt?

Außer dem Spiel und der erweiterten Spielmechanik haben wir uns einige andere Funktionen überlegt. Die Kernfeatures konnten beinahe alle implementiert werden. Nur der Highscore und das Einladen von Freunden, wurden aus zeitlichen Gründen nicht eingebracht. Wir haben uns bei diesem Projekt mehr auf eine saubere Codebasis und eine vielfach erweiterbare Struktur des Spieles konzentriert, als auf einen möglichst großen Funktionsumfang. Deswegen konnte auch nur eines der Zusatzfeatures, nämlich das Punktesystem, bereitgestellt werden. Die Arbeit an diesem Projekt hat uns viel Spaß bereitet und könnte in näherer Zukunft noch erweitert werden.


## Anforderungskatalog

### Schiffe versenken

#### Teilnehmer
Robert Schweizer und Thomas Oswald

#### Projektbeschreibung
In unserem Projekt werden wir ein Schiffe versenken umsetzen. Was macht Schiffe versenken oder Seeschlacht aus? Angefangen hat alles mit Papier, Stift und einem einfachen Spielprinzip. Man setzt verschieden große Schiffe auf ein 10x10 großes Feld und versucht bei dem jeweils Anderem einen Treffer über eine bestimmte Koordinate zu landen. Nun versuchen wir ein ansprechendes Konzept und Endprodukt zu schaffen, dass das traditionelle Spiel auf den Bildschirm beziehungsweise auf den Browser bringt. Hierbei legen wir großen Wert auf die Multiplayerkomponente und die damit einhergehende rundenbasierte Spielweise. Unser Spiel soll die klassischen Mechaniken mit sinnvollen Erweiterungen ergänzen und nebenbei soziale Aspekte berücksichtigen. Dabei wollen wir die strategischen Eigenschaften des Spiels erweitern und damit nicht nur die Spieltiefe ausbauen, sondern auch einen gewissen Wiederspielwert schaffen.

#### Anforderungen
Unser Spiel soll wie oben beschrieben einen Fokus auf den Multiplayer legen. Wir setzen uns also zum Ziel die Spiellogik zu erweitern und eine Echtzeitschnittstelle anzulegen. Diese Erweiterungen müssen natürlich sinnvoll und nahtlos ins Spielgeschehen passen, um das Spiel nicht zu stark vom Original zu entwickeln.

#### Kernfeatures
-   Schiff positionieren / rotieren
-   Feld beschießen
-   Powerups anwenden
-   Anmeldung / Registrierung
-   Chat (In-Game sowie auf der Startseite)
-   Powerups:
    -   Schild
        -   Größe 3x3
        -   kann auf alle Felder gelegt werden ( mit und ohne Schiff )
        -   wird nur auf der eigenen Karte angezeigt
    -   Scan
        -   Größe 4x4
        -   kann nur Schiffe scannen, kein Schild
        -   wird nur mit der gegnerischen Karte angezeigt
    -   Bombe (4 Felder treffen)
        -   Größe 2x2
        -   wird nur mit der gegnerischen Karte angezeigt
    -   Missile (Schiff zerstören)
        -   Größe 1x1 (1 Feld)
        -   wird nur mit der gegnerischen Karte angezeigt
        -   Zerstört im Falle eines Treffers das gesamte Schiff
-   Score / Highscore:
-   Automatische Gegnersuche (Matchmaking)
-   Herausfordern von Freunden

#### Zusatzfeatures
-   Onlinestatus der Spieler
-   Freunde einladen
-   Powerup-Inventar oder Shop
-   Ranking / Levelsystem
-   Punkte für unterschiedliche Ereignisse:
    -   Hits
    -   Sieg
    -   Sieg gegen Gegner mit höherem Rank
-   Effekte:
    -   Explosionen
    -   Scan
    -   Animierte Schiffsplatzierung
-   Sounds:
    -   Effektsounds
    -   Chatsounds


## Technisches

### Voraussetzungen

*Für die Umsetzung des Projektes müssen die folgende Funktionalitäten und Aufgaben ermöglicht werden.*

- **Dom-Manipulation, Effekte und Animationen:** Das User Interface (HTML5, CSS3) wird an gegebener Stelle mit CSS3 Animations, Transforms und Transitions arbeiten.
Für das Game Interface wird auf eine HTML5 Canvas und Animation Engine zurückgegriffen, die für Tile-basierte 2D Spiele geeignet ist und die Ausgabe von Sounds ermöglicht.

- **Web-Server:** Für die Darstellung des User und Game Interface wird ein Webserver benötigt, der statische Inhalte ausliefern kann. Für die einzelnen User und Game Interactions muss eine Kommunikationsmöglichkeit zwischen Client und Server geschaffen werden über die Daten auf dem Server persistiert werden können und/oder das Interface aktualisiert werden kann.

- **Kommunikation zwischen Server und Client:** Eine technische Vorraussetzung ist die Echtzeitkommunikation zwischen Server und Client, wodurch erst ein Online-Multiplayer möglich wird. Dafür wird auf eine Echtzeit-Engine über Websockets zurückgegriffen.

- **Persistente Speicherung von Daten:** Für die Speicherung der Nutzerdaten der einzelnen Spieler, deren Spieldaten und Verknüpfungen ist eine Datenbank nötig. Es handelt sich hierbei um verschiedene Daten, wie zum Beispiel Punktestände, Highscores, Freundesliste, Chats, etc...

### Recherche

*Für die Implementierung der oben genannten technischen Anforderungen bieten sich folgende Frameworks und Libraries an.*

Feature | Framework / Library | Ausgesucht weil | Testing | Mögliche Alternativen
--------|---------------------|-----------------|---------|----------------------
Platform | Heroku PaaS | Kostenlos und „ready-to-go“ inklusive Datenbank (Postgres). Push-to-deploy (GitHub) und CLI-Tool (Heroku-Toolbelt). Postgres eignet sich als relationelle Datenbank gut, um die verschiedenen Datentypen miteinander zu verknüpfen (Nutzerprofile, Level & Punkte, Freunde, Highscores, etc.). Sehr schnell. | Initialisierung via CLI. Verbindung mit GitHub Repo und Test des „push-to-deploy“. Verbindung zu Postgres über Node-Module. | Parse, Digital Ocean (zu komplex, da Setup nötig), ...
Datenbank | Postgres
Web-Server | Node (express) | Node ermöglicht die Implementierung eines Servers in JavaScript. Benötigte Funktionen können über ein Modul aus dem Paketmanager (npm) verfügbar gemacht werden. Außerdem ist die grundsätzliche Funktionalität bereits aus dem Kurs bekannt.  Für das Ausliefern des HTML-Content und das Routing der REST-Schnittstelle wird das aus dem Kurs bekannte express-Modul verwendet. Für die Postgres-Anbindung kann das entsprechende Node-Modul verwendet werden, das alle nötigen Datenbankoperationen gestattet. Für die Echtzeit-Kommunikation zwischen Server und Client wird SocketIO (als WebSockets Wrapper) genutzt. | Durcharbeit der Beispiele aus dem Kurs. Coding eines DEMO-Projekts: Statisches Ausliefern eines HTML-Dokuments, Textuelle Anwort auf einen GET-Request über eine URL-Route, Add-on von Postgres auf Heroku und Verbindung mit der Datenbank über Node. | Apache, nginx, ...
Postgres-Anbindung | Node (pg)
Real-time engine | Node (socket.io) | | | SocketCluster, SockJS, WebSocket API (nicht immer verfügbar)
DOM-Manipulation | JavaScript | JavaScript und CSS ist bereits allen Teammitgliedern bekannt und man benötigt so nicht noch eine weitere Library. | MME | jQuery
Effekte & Animationen (User Interface) | CSS3 Animations, Transistions & Transforms
Effekte & Animationen (Game) | TweenJS
Game engine | EaselJS | Ist modular aufgebaut und skalierbar. Gute Dokumentation. Großer Umfang an Möglichkeiten. Falls während des Projekts noch weitere Anforderungen entstehen sollten, sind wir mit CreateJS am besten bedient. | Walkthrough der "Getting started"-Guides und Beispiele. | Quintus, Phaser, melonJS, ...
