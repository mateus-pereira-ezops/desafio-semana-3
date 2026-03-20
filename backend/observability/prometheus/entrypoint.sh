#!/bin/sh
set -e

aws s3 cp s3://${CONFIGS_BUCKET}/observability/prometheus.yml /etc/prometheus/prometheus.yml
aws s3 cp s3://${CONFIGS_BUCKET}/observability/alerts.yml /etc/prometheus/alerts.yml

exec /bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --web.enable-lifecycle \
  --storage.tsdb.path=/prometheus \
  --web.external-url=http://localhost/prometheus \
  --web.route-prefix=/prometheus
