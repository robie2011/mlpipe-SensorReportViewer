# Readme
To build project execute the following code:

    ng build --prod --aot

After building we have two kinds of files for deployment. 
The first one are static files which are in our case icon and JS-Files.
The other one is our `index.html` template file for generating reports.


Both can be found in subdirectory:

    dist/SensorReportViewer/

## Note
During developement we used www.jsdelivr.com as CDN for serving static files. We can upload our static files to [a free github](https://github.com/robie2011/mlpipe-report-staticfiles) repository and acces our files through jsdelivr-service. Of course it is possible to use an internal webserver for this purpose.

