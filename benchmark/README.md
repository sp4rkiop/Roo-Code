# Benchmark Harness

Configure ENV vars (OpenRouter, PostHog, etc):

```sh
cp .env.local.sample .env.local
# Update ENV vars as needed.
```

Build and run a Docker image with the development environment needed to run the
benchmarks (C++, Go, Java, Node.js, Python & Rust):

```sh
npm run docker:start
```

Run an exercise:

```sh
npm run docker:benchmark -- -e exercises/javascript/binary
```
