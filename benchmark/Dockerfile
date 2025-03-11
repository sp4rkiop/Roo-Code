# docker build -f Dockerfile.base -t roo-code-benchmark-base ..
# docker build -f Dockerfile -t roo-code-benchmark ..
# docker run -d -it roo-code-benchmark
# docker exec -it $(docker ps --filter "ancestor=roo-code-benchmark" -q) /bin/bash

FROM ubuntu:latest

# Install dependencies
RUN apt update && apt install -y sudo curl git vim

# Create a `vscode` user
RUN useradd -m vscode -s /bin/bash && \
  echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode && \
  chmod 0440 /etc/sudoers.d/vscode

# Install VS Code
# https://code.visualstudio.com/docs/setup/linux
RUN apt install -y wget gpg apt-transport-https
RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
RUN install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
RUN echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | tee /etc/apt/sources.list.d/vscode.list > /dev/null
RUN rm -f packages.microsoft.gpg
RUN apt update && apt install -y code

# Install Xvfb
RUN apt install -y xvfb

# Install Node.js 18
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt update && apt install -y nodejs

# Install Python 3.12
RUN apt install -y python3 python3-venv python3-dev python3-pip

WORKDIR /home/vscode
USER vscode

COPY --chown=vscode:vscode package*.json /home/vscode/repo/
COPY --chown=vscode:vscode webview-ui/package*.json /home/vscode/repo/webview-ui/
COPY --chown=vscode:vscode e2e/package*.json /home/vscode/repo/e2e/
COPY --chown=vscode:vscode benchmark/package*.json /home/vscode/repo/benchmark/

WORKDIR /home/vscode/repo
RUN npm run install:all

COPY --chown=vscode:vscode . /home/vscode/repo

WORKDIR /home/vscode/repo
RUN npm run compile

WORKDIR /home/vscode/repo/webview-ui
RUN npm run build

WORKDIR /home/vscode/repo/benchmark
RUN git clone https://github.com/cte/Roo-Code-Benchmark.git exercises
RUN npm run build

CMD ["/bin/bash"]

# Commented out code preserved from original Dockerfile
# FROM buildpack-deps:jammy

# # Install Python 3.11
# RUN apt-get update && apt-get install -y \
#     software-properties-common \
#     cmake \
#     libboost-all-dev \
#     && add-apt-repository ppa:deadsnakes/ppa \
#     && apt-get update \
#     ca-certificates-java \
#     openjdk-21-jdk \
#     libtbb-dev \
#     && rm -rf /var/lib/apt/lists/*

# # Make python3.11 the default python3
# RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# # Install Go with architecture detection
# RUN ARCH=$(uname -m) && \
#     if [ "$ARCH" = "x86_64" ]; then \
#         GOARCH="amd64"; \
#     elif [ "$ARCH" = "aarch64" ]; then \
#         GOARCH="arm64"; \
#     else \
#         false; \
#     fi && \
#     curl -L "https://golang.org/dl/go1.21.5.linux-$GOARCH.tar.gz" -o go.tar.gz && \
#     tar -C /usr/local -xzf go.tar.gz && \
#     rm go.tar.gz
# ENV PATH="/usr/local/go/bin:${PATH}"

# # Install Rust
# ADD https://sh.rustup.rs /tmp/rustup.sh
# RUN chmod +x /tmp/rustup.sh && /tmp/rustup.sh -y && rm /tmp/rustup.sh
# ENV PATH="/root/.cargo/bin:${PATH}"

# # Install Node.js and dependencies
# RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
#     apt-get install -y nodejs && \
#     rm -rf /var/lib/apt/lists/* && \
#     mkdir -p /npm-install && \
#     cd /npm-install && \
#     npm init -y && \
#     npm install \
#     jest \
#     @babel/core@7.25.2 \
#     @exercism/babel-preset-javascript@0.2.1 \
#     @exercism/eslint-config-javascript@0.6.0 \
#     @types/jest@29.5.12 \
#     @types/node@20.12.12 \
#     babel-jest@29.6.4 \
#     core-js@3.37.1 \
#     eslint@8.49.0

# COPY . /aider
# RUN pip3 install --no-cache-dir --upgrade pip uv
# RUN uv pip install --system --no-cache-dir -e /aider[dev]
# RUN git config --global --add safe.directory /aider
# WORKDIR /aider
