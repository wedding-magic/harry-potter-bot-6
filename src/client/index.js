//entrypoint for app, renders app component

import React from 'react';
import { render } from 'react-dom';
import App from './App.jsx';

render(
  <App />, document.getElementById('root')
);