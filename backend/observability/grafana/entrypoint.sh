#!/bin/sh
set -e

echo "Baixando configs do S3..."

aws s3 cp s3://${CONFIGS_BUCKET}/observability/grafana/datasources.yml \
    /etc/grafana/provisioning/datasources/datasources.yml

aws s3 cp s3://${CONFIGS_BUCKET}/observability/grafana/dashboards.yml \
    /etc/grafana/provisioning/dashboards/dashboards.yml

aws s3 sync s3://${CONFIGS_BUCKET}/observability/grafana/dashboards/ \
    /var/lib/grafana/dashboards/

aws s3 cp s3://${CONFIGS_BUCKET}/observability/grafana/alerting/rules.yml \
    /etc/grafana/provisioning/alerting/rules.yml

aws s3 cp s3://${CONFIGS_BUCKET}/observability/grafana/alerting/notification-policies.yml \
    /etc/grafana/provisioning/alerting/notification-policies.yml

aws s3 cp s3://${CONFIGS_BUCKET}/observability/grafana/alerting/contact-points.yml \
    /etc/grafana/provisioning/alerting/contact-points.yml

echo "Iniciando Grafana..."
exec /run.sh "$@"
