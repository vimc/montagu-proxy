#!/usr/bin/env bash
set -ex

here=$(dirname $0)

export ORG=vimc
export TOKEN_KEY_PATH=$PWD/token_key

function cleanup() {
    docker compose --project-name montagu down || true
}

trap cleanup ERR

# Run up all the APIs and Portals which are to be proxied
docker volume rm montagu_orderly_volume -f
docker compose pull
docker compose --project-name montagu up -d

# Start the APIs
docker exec montagu-api-1 mkdir -p /etc/montagu/api/
docker exec montagu-api-1 touch /etc/montagu/api/go_signal
docker exec montagu-orderly-web-web-1 mkdir -p /etc/orderly/web
docker cp $here/orderlywebconfig.properties montagu-orderly-web-web-1:/etc/orderly/web/config.properties
docker exec montagu-orderly-web-web-1 touch /etc/orderly/web/go_signal
docker exec montagu-orderly-web-web-1 touch /etc/orderly/web/go_signal
docker exec montagu-orderly-1 touch /orderly_go
docker cp $here/packitconfig.properties montagu-packit-api-1:/etc/packit/config.properties

# Packit db: Need to give the database a little time to initialise before we can run the migration
docker exec montagu-packit-db-1 wait-for-db
docker exec montagu-packit-db-1 psql -U packituser -d packit -a -f /packit-schema/schema.sql

# TODO: need this on CI?
sleep 30

# Wait for the database
docker exec montagu-db-1 montagu-wait.sh

# Migrate the database
migrate_image=$ORG/montagu-migrate:master
docker pull $migrate_image
docker run --network=montagu_proxy $migrate_image

# Generate test data if 'data' present as first param
if [ "$1" = "data" ]; then
  test_data_image=$ORG/montagu-generate-test-data:master
  docker pull $test_data_image
  docker run --rm --network=montagu_proxy $test_data_image
fi

# Always generate report test database
rm demo -rf
rm git -rf
docker pull $ORG/orderly:master
docker run --rm \
  --entrypoint create_orderly_demo.sh \
  -u $UID \
  -v $PWD:/orderly \
  -w "/orderly" \
  $ORG/orderly:master \
  "."

# Copy the demo db file to top level
docker cp $PWD/demo/orderly.sqlite montagu-orderly-web-web-1:/orderly/orderly.sqlite

# Migrate the orderlyweb tables
ow_migrate_image=$ORG/orderlyweb-migrate:master
docker pull $ow_migrate_image
docker run --rm --network=montagu_proxy \
  -v montagu_orderly_volume:/orderly \
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
