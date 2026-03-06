#!/bin/sh
set -eu

CERT_DIR="/certs"
CA_KEY="$CERT_DIR/ca.key"
CA_CERT="$CERT_DIR/ca.crt"

NGINX_KEY="$CERT_DIR/nginx.key"
NGINX_CERT="$CERT_DIR/nginx.crt"

BACKEND_KEY="$CERT_DIR/backend.key"
BACKEND_CERT="$CERT_DIR/backend.crt"

FRONTEND_KEY="$CERT_DIR/frontend.key"
FRONTEND_CERT="$CERT_DIR/frontend.crt"

# Generate only if CA cert doesn't exist
if [ ! -f "$CA_CERT" ]; then
  echo "Generating Internal Root CA..."
  openssl genrsa -out "$CA_KEY" 4096
  openssl req -x509 -new -nodes -key "$CA_KEY" -sha256 -days 3650 \
    -out "$CA_CERT" \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=InternalRootCA"

  echo "Generating keys and certificate signing requests for services..."

  # Nginx
  openssl genrsa -out "$NGINX_KEY" 2048
  openssl req -new -key "$NGINX_KEY" -out "$CERT_DIR/nginx.csr" \
    -subj "/CN=localhost"

  cat > "$CERT_DIR/nginx.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = nginx
IP.1 = 127.0.0.1
EOF

  openssl x509 -req -in "$CERT_DIR/nginx.csr" -CA "$CA_CERT" -CAkey "$CA_KEY" \
    -CAcreateserial -out "$NGINX_CERT" -days 825 -sha256 -extfile "$CERT_DIR/nginx.ext"


  # Backend
  openssl genrsa -out "$BACKEND_KEY" 2048
  openssl req -new -key "$BACKEND_KEY" -out "$CERT_DIR/backend.csr" \
    -subj "/CN=backend"

  cat > "$CERT_DIR/backend.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = backend
EOF

  openssl x509 -req -in "$CERT_DIR/backend.csr" -CA "$CA_CERT" -CAkey "$CA_KEY" \
    -CAcreateserial -out "$BACKEND_CERT" -days 825 -sha256 -extfile "$CERT_DIR/backend.ext"


  # Frontend
  openssl genrsa -out "$FRONTEND_KEY" 2048
  openssl req -new -key "$FRONTEND_KEY" -out "$CERT_DIR/frontend.csr" \
    -subj "/CN=frontend"

  cat > "$CERT_DIR/frontend.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = frontend
EOF

  openssl x509 -req -in "$CERT_DIR/frontend.csr" -CA "$CA_CERT" -CAkey "$CA_KEY" \
    -CAcreateserial -out "$FRONTEND_CERT" -days 825 -sha256 -extfile "$CERT_DIR/frontend.ext"

  echo "Certificates generated successfully."
else
  echo "Certificates already exist. Skipping generation."
fi

# Set appropriate permissions
chmod 644 $CERT_DIR/*.crt
chmod 600 $CERT_DIR/*.key

# Keep the container alive briefly or just exit gracefully
exit 0
