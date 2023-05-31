#!/usr/bin/env bash
set -ex

here=$(dirname $0)

export ORG=vimc
export TOKEN_KEY_PATH=$PWD/token_key

function cleanup() {
    docker-compose --project-name montagu down || true
    orderly-web stop $here --force || true
}

trap cleanup ERR

# Run up all the APIs and Portals which are to be proxied
docker-compose pull
docker-compose --compatibility --project-name montagu up -d

# Start the APIs
docker exec montagu_api_1 mkdir -p /etc/montagu/api/
docker exec montagu_api_1 touch /etc/montagu/api/go_signal

# Wait for the database
docker exec montagu_db_1 montagu-wait.sh

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

# Start OW
pip3 install constellation
pip3 install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple orderly-web

orderly-web start $here
orderly-web admin $here add-users test.user@example.com
orderly-web admin $here grant test.user@example.com "*/reports.read"
