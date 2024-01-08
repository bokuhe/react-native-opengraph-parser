import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { OpenGraphParser } from '@sleiv/react-native-opengraph-parser';

export default function App() {
  const [result, setResult] = React.useState<string | undefined>();

  React.useEffect(() => {
    OpenGraphParser.extractMeta('https://sleiv.net/')
      .then((metadata) => {
        console.log('metadata', metadata);
        setResult(JSON.stringify(metadata));
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
