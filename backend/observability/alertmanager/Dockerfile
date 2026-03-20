FROM amazon/aws-cli:latest

COPY --from=prom/alertmanager:latest /bin/alertmanager /bin/alertmanager
COPY --from=prom/alertmanager:latest /etc/alertmanager /etc/alertmanager

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
