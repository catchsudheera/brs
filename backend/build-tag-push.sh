#!/bin/bash

rm -rf target
mvn clean install && docker build -t ghcr.io/catchsudheera/brs-backend:v1.2 . --push