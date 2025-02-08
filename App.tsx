import React from 'react';
import HoldingsList from './src/components/HoldingsList';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView>
      <HoldingsList />
    </GestureHandlerRootView>
  );
};

export default App;
