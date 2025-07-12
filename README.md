# GameDig Exporter for Prometheus

Run a docker container that performs [GameDig](https://github.com/gamedig/node-gamedig) queries that can be scraped by Prometheus.
GameDig provides hundreds of [available games](https://github.com/gamedig/node-gamedig/blob/master/GAMES_LIST.md) and voice applications to query, all of which are supported. 

The easiest way to get started is to just run the docker container with arguments
```shell
docker run --rm -p 9339:9339 gamedig-exporter:latest index.js \ 
--type=minecraft \
--name=hypixel \
--host=mc.hypixel.net
```

The exposed metrics will be available at  http://0.0.0.0:9339/metrics by default, with the following metrics exposed for the Hypixel minecraft server: 
- Up/Down status
- Ping
- Players online
- Max players
- Password required
- Version

Prometheus metric names follow this format:
```
gamedig_{type}_{name}_{metric}

ex. gamedig_minecraft_hypixel_players_online
```

## Configuration File

To easily configure many servers and add custom metrics, you can create a config.yml file. A basic file looks like this: 
```yaml
games:
  hypixel:
    type: minecraft
    host: mc.hypixel.net
```

With the breadth of games that GameDig provides, there are many configuration options that you can specify. Please see [their documentation](https://github.com/gamedig/node-gamedig?tab=readme-ov-file#optional-fields) 
for the available options when configuring a game.

The config file can then be mounted into the container at the path `/app/config.yml` and will be automatically loaded.
```shell
docker run --rm -p 9339:9339 -v ./examples/all.config.yml:/app/config.yml gamedig-exporter:latest
```

# Running with cli args
```shell
docker run --rm -p 8080:80 gamedig-exporter:latest /app/dist/index.js -vvv
```

##  Custom Metrics

Many games expose custom data that you may want to include in a metric. 
Custom metrics that represent this data can be included in the config file like so
```yaml
games:
  hypixel:
    type: minecraft
    host: mc.hypixel.net
    metrics:
      protocol:
        description: 'Minecraft Protocol'
        type: 'gauge'
        value: raw.vanilla.raw.version.protocol
        labels:
          connect: raw.connect
          otherMetric: (data) => data.version.toUpper()
```

The value of a metric or label can be given using a JSON path style string, or a javascript function that receives the raw data. 

To view the raw data that a game exposes, you can run the docker container with increased verbosity. This will then print the raw data that is available to you.
```yaml
docker run --rm -v ./examples/all.config.yml:/app/config.yml gamedig-exporter:latest index.js -vvv
```



## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
