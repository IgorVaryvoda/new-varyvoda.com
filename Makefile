.PHONY: dev dev-drafts build drafts sync-fonts verify-fonts validate-projects test-typography quality-gate install-tools

HTMLTEST := $(shell command -v htmltest 2>/dev/null || echo ./bin/htmltest)

dev: sync-fonts
	hugo server

dev-drafts: sync-fonts
	hugo server -D

build: sync-fonts
	hugo --gc --minify

drafts:
	hugo list drafts

sync-fonts:
	python3 scripts/sync-literata-italics.py

verify-fonts:
	python3 scripts/sync-literata-italics.py --check

validate-projects:
	node scripts/validate-projects.mjs

test-typography:
	node --test scripts/test-typography.mjs

quality-gate: build test-typography verify-fonts
	node scripts/validate-projects.mjs
	$(HTMLTEST) -c .htmltest.yml
	node scripts/test-agent-readiness.mjs

install-tools:
	mkdir -p bin
	curl -sfL https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz | tar -xz -C bin htmltest
	chmod +x bin/htmltest
