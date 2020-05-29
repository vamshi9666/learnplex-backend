#!/bin/bash
set -e

start() {
  echo "BUILDING CONTAINER"
    docker-compose build

  echo
  echo "STARTING CONTAINERS"
    docker-compose up -d postgres pgadmin redis

  echo
  echo "FIRING UP PG_ADMIN"
    docker exec -it learnplex-pgadmin python /pgadmin4/setup.py --load-servers /tmp/servers.json

  echo
  echo "DONE, STATUS:"
    docker-compose ps
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/" && pwd )"
pushd $DIR &>/dev/null
case $1 in
  start)
    start
    ;;

  populate-db)
    // call script to populate db
    ;;

  stop)
    docker-compose down
    ;;

  logs)
    docker-compose logs -f $2
    ;;

  *)
    echo 'Usage: ./docker.sh start|stop|logs';
    echo
    echo "STATUS:"
    docker-compose ps
    ;;
esac
