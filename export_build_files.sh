#!/bin/bash

SCRIPT=$(realpath $0)
ROOT_DIR=$(cd `dirname $SCRIPT` && pwd)
CDN_DIR=$ROOT_DIR/cdn

rm $CDN_DIR/*
cp $ROOT_DIR/dist/SensorReportViewer/*.{ico,js} $CDN_DIR/


# copy html-template to MLPIPE (only works if repo is named "mlpipe")
MLPIPE_DIR=$(cd `dirname $SCRIPT` && cd ../mlpipe && pwd)
cp $ROOT_DIR/dist/SensorReportViewer/index.html $MLPIPE_DIR/mlpipe/analytics_report_template.html

cd -
