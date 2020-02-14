#!/bin/bash
target_dir=../mlpipe-report-staticfiles
rm $target_dir/*
cp dist/SensorReportViewer/*.{ico,js} $target_dir/