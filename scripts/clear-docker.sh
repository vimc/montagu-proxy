docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume prune --force
docker network prune --force
