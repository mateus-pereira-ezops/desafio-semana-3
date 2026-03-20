#!/bin/sh
set -e

aws s3 cp s3://${CONFIGS_BUCKET}/observability/alertmanager.yml /etc/alertmanager/alertmanager.yml

exec /bin/alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --web.external-url=http://localhost/alertmanager \
  --web.route-prefix=/alertmanager
