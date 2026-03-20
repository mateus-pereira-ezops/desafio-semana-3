FROM amazon/aws-cli:latest

COPY --from=prom/prometheus:latest /bin/prometheus /bin/prometheus
COPY --from=prom/prometheus:latest /etc/prometheus /etc/prometheus
COPY --from=prom/prometheus:latest /prometheus /prometheus

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
