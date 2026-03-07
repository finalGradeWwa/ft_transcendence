FROM alpine:3.23

# Install OpenSSL to generate certificates
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /certs

# Copy the dedicated startup script with permissions
COPY generate-certs.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/generate-certs.sh

CMD ["/usr/local/bin/generate-certs.sh"]
