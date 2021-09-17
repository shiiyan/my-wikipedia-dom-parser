.DEFAULT_GOAL := help
.PHONY: $(shell grep -h -E '^[a-zA-Z_-]+:' $(MAKEFILE_LIST) | sed 's/://')

start-cors-proxy: ## Start cors proxy in localhost
	node backend/index.js

install:
	cd backend && npm install && cd ..

dev: install ## Start development enviroment
	open frontend/index.html
	node backend/index.js

# https://postd.cc/auto-documented-makefile/
help: ## Draw help message
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'	
