#!/bin/bash -x
mount -t vboxsf ForgeTgis /media
cp -Rv /opt2/Neo4j/neo4j-community-2.1.3/gSource/TgisGraphInterface/. /media/TgisGraphInterface
