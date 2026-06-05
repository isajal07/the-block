# The Block — dev tasks
# `make` (or `make dev`) runs the API and web app together.

.DEFAULT_GOAL := dev
.PHONY: dev install build start clean help

## Install dependencies for both packages (runs automatically on first `make dev`)
install: server/node_modules web/node_modules

server/node_modules: server/package.json
	cd server && pnpm install

web/node_modules: web/package.json
	cd web && pnpm install

## Run the API (:4000) and web app (:5173) together; Ctrl+C stops both
dev: server/node_modules web/node_modules
	@echo "→ API  http://localhost:4000"
	@echo "→ Web  http://localhost:5173"
	@echo "  (Ctrl+C stops both)"
	@trap 'kill 0' EXIT; \
		( cd server && pnpm dev ) & \
		( cd web && pnpm dev ) & \
		wait

## Build both packages for production
build: server/node_modules web/node_modules
	cd server && pnpm build
	cd web && pnpm build

## Run the production builds (API serves :4000, web preview :4173)
start: build
	@trap 'kill 0' EXIT; \
		( cd server && pnpm start ) & \
		( cd web && pnpm preview ) & \
		wait

## Remove build output and installed dependencies
clean:
	rm -rf server/dist server/node_modules web/dist web/node_modules

## List available targets
help:
	@grep -B1 -E '^[a-z-]+:' $(MAKEFILE_LIST) | grep -A1 '^##' | sed 's/^## //; s/:.*//' | paste - - | column -t -s$$'\t'
