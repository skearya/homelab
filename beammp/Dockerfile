FROM debian:13-slim

ARG DEBIAN_VERSION=13
ARG BEAMMP_VERSION=v3.9.3
ARG TARGETARCH

RUN apt-get update \
    && apt-get install -y curl liblua5.3-0 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 beammp \
    && mkdir -p /server \
    && chown -R beammp:beammp /server

RUN if [ "$TARGETARCH" = "amd64" ]; then \
    curl -L -o /server/BeamMP-Server https://github.com/BeamMP/BeamMP-Server/releases/download/${BEAMMP_VERSION}/BeamMP-Server.debian.${DEBIAN_VERSION}.x86_64; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
    curl -L -o /server/BeamMP-Server https://github.com/BeamMP/BeamMP-Server/releases/download/${BEAMMP_VERSION}/BeamMP-Server.debian.${DEBIAN_VERSION}.arm64; \
    else \
    exit 1; \
    fi \
    && chmod +x /server/BeamMP-Server

WORKDIR /server

USER beammp
EXPOSE 30814
ENTRYPOINT ["./BeamMP-Server"]
