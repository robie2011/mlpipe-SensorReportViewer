const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
    const files = [
        './dist/SensorReportViewer/runtime-es2015.js',
        './dist/SensorReportViewer/polyfills-es2015.js',
        './dist/SensorReportViewer/scripts.js',
        './dist/SensorReportViewer/main-es2015.js',
    ]
    await fs.ensureDir('./dist/elements')
    await concat(files, './dist/elements/materialized-sensor.js');
    await fs.copyFile('./dist/SensorReportViewer/styles.css', './dist/elements/styles.css')
    await fs.copy('./dist/SensorReportViewer/assets/', './dist/elements/assets/' )
    
})()