.PHONY: dev dev-drafts build drafts validate-projects quality-gate install-tools

HTMLTEST := $(shell command -v htmltest 2>/dev/null || echo ./bin/htmltest)

dev:
	hugo server

dev-drafts:
	hugo server -D

build:
	hugo --gc --minify

drafts:
	hugo list drafts

validate-projects:
	node scripts/validate-projects.mjs

quality-gate: build
	node scripts/validate-projects.mjs
	$(HTMLTEST) -c .htmltest.yml
	node scripts/test-agent-readiness.mjs

install-tools:
	mkdir -p bin
	curl -sfL https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz | tar -xz -C bin htmltest
	chmod +x bin/htmltest
