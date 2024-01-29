#!/bin/bash

rm -rf target
mvn clean install && docker build -t catchsudheera/brs-backend:v1.1 . --push