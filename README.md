<p align="center">
  <img src="https://github.com/tobua/epic-react-router/raw/master/logo.png" alt="epic-react-router" width="320">
</p>

# epic-react-router

MobX based router for React and React Native

## Installation

```console
npm i epic-react-router mobx mobx-react react react-dom
```

## Usage

```js
import React from 'react'
import { render } from 'react-dom'
import { Router, Page } from 'epic-react-router'

// Declare some components used as pages.
const Overview = () => <p>Overview</p>
const About = () => <p>About</p>
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>

// Configure available and initial pages before rendering.
Router.setPages(
  {
    overview: Overview,
    about: About,
    article: Article,
  },
  'overview' // Initial page.
)

render(
  <div>
    <button onClick={() => Router.go('about')}>About</button>
    <button onClick={() => Router.go('article', { id: 2 })}>Article 2</button>
    // Currently active page will be displayed here.
    <Page />
  </div>,
  document.body
)
```

## <Page />

Use the `<Page />` component anywhere in your layout to display the current page.

## Router

The `Router`-Store can be accessed from anywhere to modify the state of the Router.

`Router.setPages(pages: { [key: string]: React.ReactNode }, initialRoute: string)` configure the route keys and their associated components, plus the route to be displayed initially.

`Router.go(route: string, parameters: object = {}, state: object = {}, replace = false)` Navigates to a route. Parameters will be added to the URL search query and together with the state (both optional) will be passed to the page component as props. If replace is true, `back()` will not lead to the previous page.

`Router.back()` go back one step in the history.

`Router.forward()` go forward one step.

`Router.reset()` go back to the initial route.
