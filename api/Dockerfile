# Rust API image. Build context: this directory (api/).
FROM rust:1.96-slim-trixie AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends cmake clang && rm -rf /var/lib/apt/lists/*
COPY . .
RUN cargo build --release --bin haseki-api --bin seed

FROM debian:trixie-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/release/haseki-api /app/target/release/seed /usr/local/bin/
ENV RUST_LOG=haseki_api=info,tower_http=info
CMD ["haseki-api"]
