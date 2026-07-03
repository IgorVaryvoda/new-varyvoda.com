.PHONY: dev dev-drafts build drafts quality-gate install-tools

HTMLTEST := $(shell command -v htmltest 2>/dev/null || echo ./bin/htmltest)

dev:
	hugo server

dev-drafts:
	hugo server -D

build:
	hugo --gc --minify

drafts:
	hugo list drafts

quality-gate: build
	$(HTMLTEST) -c .htmltest.yml

install-tools:
	mkdir -p bin
	curl -sfL https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz | tar -xz -C bin htmltest
	chmod +x bin/htmltest
