make-folders:
    docker compose config --format json | jq '.services[].volumes[]?.source' | grep "/data" | sort | xargs -p -I {} mkdir -p {}

make-compose:
    echo "include:" > docker-compose.yml
    find . -mindepth 2 -path "*/docker-compose.yml" | sort | sed 's/^/  - /' >> docker-compose.yml

reload-caddy:
    sudo docker compose kill -sUSR1 caddy

[confirm]
clean-data:
    sudo rm -rf ./data
