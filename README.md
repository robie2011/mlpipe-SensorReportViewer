# SensorReportViewer

## Projektbeschreibung

Dieses Repository enthält den Sourcecode für die Applikation *SensorReportViewer*. 
Die Applikation wird in der [Masterarbeit *MLPIPE*](https://github.com/robie2011/mlpipe) 
für die Visualisierung der Metriken verwendet.
Dazu werden die berechneten Metriken von *MLPIPE* 
in die Angular Single Page Application eingebettet (Variable: `window.sensor_data`).

Es werden vier Angular Components für die Visualisierung eingesetzt.
Diese sind zu finden in `src/app/*/*.components.ts`.

Bei der Initialisierung der Applikation werden die Daten von der Funktion `createCachedData` (Datei `data-preprocessing.ts`) vorbereitet.

Die Observables bzw. Subjects für die asynchrone Kommmunikation 
zwischen den Komponenten werden im Service `SensorDataService` 
initialisiert und verwaltet. Von Benutzer ausgewhälte Daten 
werden mit der Funktion `DataProcessor.process` aggregiert.

## Build

Wir setzten den [Angular CLI](https://cli.angular.io/) 
für die Entwicklung ein. Um den Projekt zu kompilieren kann 
der folgende Befehl ausgeführt werden:

    ng build --prod --aot


## Deployment

Nach der Kompilation haben wir zwei Sorten von Dateien für das
Deployment. Das erste sind die statischen Dateien und das zweite die
HTML-Vorlage (`index.html`) für *MLPIPE*. Beide können im 
Ordner `dist/SensorReportViewer/` gefunden werden. 
Die HTML-Vorlage kopieren wir zu unserem *MLPIPE*-Projekt in 
dem Ordner `/templates`. Die statischen Dateien 
ermöglichen wir für den öffentlichen Zugriff über eine URL.
Der Stammpfad des URLs wird in der Konfiguration 
von *MLPIPE* (`app_config.yml`) als 
Attribut `reporting.hosting_url_prefix` angegeben.



Bemerkung: 

  * Die statischen Dateien können auch in die HTML-Vorlage eingebettet werden. Das würde aber die Dateigrösse des Analyseberichts unnötig vergrössern.
  * Während der Entwicklung haben wir den Dienst www.jsdelivr.com als CDN für die Bereitstellung der statischen Dateien verwendet. Dieser Dienst kann direkt auf die Dateien unseres Git-Repos zugreifen. Deshalb haben den Ordner `/cdn` für die statischen Dateien erstellt. Der Skript `export_build_files.sh` kopiert die statischen Dateien zum Ordner `/cdn`.


## Entwicklung

In der Entwicklungsphase können die Metriken für die Visualisierung auch von das *LocalStorage* (Key: `data`) wiederhergestellt werden.

