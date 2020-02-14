#!/bin/bash
target_dir=../mlpipe-report-staticfiles
rm $target_dir/*
cp dist/SensorReportViewer/*.{ico,js} $target_dir/
commit_id=$(git log --format="%h" -n 1)

cd $target_dir
git add *
git commit -m "update $commit_id"
git push

cd -