# react-native-opengraph-parser

react-native-opengraph-parser is a package for React-Native applications that utilizes the Open Graph protocol to easily extract and parse metadata from web pages. This package is based on [react-native-opengraph-kit](https://github.com/Osedea/react-native-opengraph-kit) and has been updated to support the latest version of React Native and TypeScript.

## Installation

```sh
npm install @sleiv/react-native-opengraph-parser
```

or

```sh
yarn add @sleiv/react-native-opengraph-parser
```

## Usage

```js
import { OpenGraphParser } from '@sleiv/react-native-opengraph-parser';

// ...

OpenGraphParser.extractMeta('https://sleiv.net/')
  .then((metadata) => {
    console.log(metadata);
  })
  .catch((e) => {
    console.error(e);
  });
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
