FROM envoyproxy/envoy:v1.20-latest
COPY ./envoy.yaml /etc/envoy.yaml
CMD /usr/local/bin/envoy -c /etc/envoy.yaml