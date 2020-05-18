#!/usr/bin/env bash
set -ex

here=$(dirname $0)

export REGISTRY=docker.montagu.dide.ic.ac.uk:5000
export TOKEN_KEY_PATH=$PWD/token_key

function cleanup() {
    docker-compose --project-name montagu down || true
}

trap cleanup ERR

# Run up all the APIs and Portals which are to be proxied
docker volume rm montagu_orderly_volume -f
docker-compose pull
docker-compose --project-name montagu up -d

# Start the APIs
docker exec montagu_api_1 mkdir -p /etc/montagu/api/
docker exec montagu_api_1 touch /etc/montagu/api/go_signal
docker exec montagu_orderly_web_web_1 mkdir -p /etc/orderly/web
docker cp $here/orderlywebconfig.properties montagu_orderly_web_web_1:/etc/orderly/web/config.properties
docker exec montagu_orderly_web_web_1 touch /etc/orderly/web/go_signal
docker exec montagu_orderly_web_web_1 touch /etc/orderly/web/go_signal
docker exec montagu_orderly_1 touch /orderly_go

# Wait for the database
docker exec montagu_db_1 montagu-wait.sh

# Migrate the database
migrate_image=$REGISTRY/montagu-migrate:master
docker pull $migrate_image
docker run --network=montagu_proxy $migrate_image

# Generate montagu test data
test_data_image=$REGISTRY/montagu-generate-test-data:master
docker pull $test_data_image
docker run --rm --network=montagu_proxy $test_data_image

# Generate report test data
rm demo -rf
rm git -rf
docker pull $REGISTRY/orderly:master
docker run --rm \
  --entrypoint create_orderly_demo.sh \
  -u $UID \
  -v $PWD:/orderly \
  -w "/orderly" \
  $REGISTRY/orderly:master \
  "."

# Migrate the orderlyweb tables
ow_migrate_image=$REGISTRY/orderlyweb-migrate:master
docker pull $ow_migrate_image
docker run --rm --network=montagu_proxy \
  -v $PWD/demo:/orderly \
  $ow_migrate_image

# Add test user
export NETWORK=montagu_proxy

$here/cli.sh add "Test User" test.user \
    test.user@example.com password \
    --if-not-exists

$here/cli.sh addRole test.user user
$here/cli.sh addRole test.user admin

$here/cli.sh add "Password Reset Test User" passwordtest.user \
    passwordtest.user@example.com password \
    --if-not-exists

$here/cli.sh addRole passwordtest.user user

# Add user to orderly_web
$here/orderly_web_cli.sh add-users test.user@example.com
$here/orderly_web_cli.sh grant test.user@example.com */reports.read
