# eleven-http-api #
This is the (work in progress) HTTP API for [Eleven Giants](http://elevengiants.com).

## Setup ##
Install the required packages using `npm install`, set up a local configuration file in the config directory and you should be good to go!

## Operation ##
All actions are invoked via [`npm`](https://www.npmjs.org/doc/cli/npm.html).
The following operations are available:

* `start` run the HTTP API
* `jshint` runs jshint to check for errors
* `jscs` runs jscs to lint

These scripts can be called using `npm run-script` (or the alias `npm run`); the
`-s` flag hides distracting additional output, e.g.:
```bash
npm -s run test
```
## Contributing ##
Help is always welcome! If you are interested, please [get in touch]
(http://elevengiants.com/contact.php) to get access to our [Slack]
(http://slack.com/) instance, internal documentation, guidelines and other
resources.

## License ##
[MIT](https://github.com/ElevenGiants/eleven-http-api/blob/master/LICENSE)
