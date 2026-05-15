reload-caddy:
    sudo docker compose kill -sUSR1 caddy

[confirm]
clean-data:
    rm -rf ./data

[script("uv", "run", "--script")]
make-folders:
    # /// script
    # requires-python = ">=3.12"
    # dependencies = [
    #     "pyyaml>=6",
    # ]
    # ///

    from pathlib import Path

    import yaml

    data = Path("./data").resolve()

    for file in Path(".").glob("*/docker-compose.yml"):
        compose = yaml.safe_load(file.read_text())

        for service in compose.get("services", {}).values():
            for volume in service.get("volumes", []):
                mapping = volume.split(":")

                if not mapping:
                    continue

                location = (file.parent / mapping[0]).resolve()

                if not location.is_relative_to(data):
                    continue

                location.mkdir(parents=True, exist_ok=True)

[script("uv", "run", "--script")]
make-compose:
    # /// script
    # requires-python = ">=3.12"
    # dependencies = [
    #     "pyyaml>=6",
    # ]
    # ///

    from pathlib import Path

    import yaml

    includes = {"include": [str(file) for file in Path(".").glob("*/docker-compose.yml")]}

    Path("./docker-compose.yml").write_text(yaml.dump(includes))
