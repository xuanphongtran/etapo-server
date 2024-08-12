build: 
	rimraf dist && tsc && tsc-alias
	node dist/index.js

.PHONY: build