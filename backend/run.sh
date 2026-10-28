#!/usr/bin/env bash

cd /Volumes/SembarangData/LearningCode/Apps/dashboard11-firevegetation-classify/backend

uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8011
