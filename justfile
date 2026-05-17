make-folders:
    docker compose config --format json | jq '.services[].volumes[]?.source' | grep -E "/(data|share)" | sort | xargs -p -I {} mkdir -p {}

make-compose:
    echo "include:" > docker-compose.yml
    find . -mindepth 2 -path "*/docker-compose.yml" | sort | sed 's/^/  - /' >> docker-compose.yml

reload-caddy:
    sudo docker compose kill -sUSR1 caddy

backup-env:
    find . -name ".env" -o -path "./community-fm/config/config.toml" | tar -cf env-backup.tar.gz -T -

restore-env:
    tar -xf env-backup.tar.gz

[confirm]
clean-data:
    sudo rm -rf ./data
