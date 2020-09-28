
build-client:
	docker build -t client -f Dockerfile.client .

push-client:
	docker tag client:latest registry.heroku.com/nohouse-client/web
	docker push registry.heroku.com/nohouse-client/web

release-client:
	heroku container:release web -a nohouse-client

deploy-client:
	$(MAKE) build-client
	$(MAKE) push-client
	$(MAKE) release-client

build-server:
	docker build -t server -f Dockerfile.server .

push-server:
	docker tag server:latest registry.heroku.com/nohouse-server/web
	docker push registry.heroku.com/nohouse-server/web

release-server:
	heroku container:release web -a nohouse-server

deploy-server:
	$(MAKE) build-server
	$(MAKE) push-server
	$(MAKE) release-server

tail-client:
	heroku logs -a nohouse-client --tail

tail-server:
	heroku logs -a nohouse-server --tail