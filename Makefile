.PHONY: dev dev-drafts build drafts quality-gate

dev:
	hugo server

dev-drafts:
	hugo server -D

build:
	hugo --gc --minify

drafts:
	hugo list drafts

quality-gate: build
