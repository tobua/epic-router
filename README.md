# epic-router

<img align="right" src="https://github.com/tobua/epic-router/raw/main/logo.svg" width="30%" alt="Router Logo" />

Router for the Web and React Native.

- Navigate between different screens
- Handles browser history
- Supports back and forward button
- 404 error page

## Installation

```sh
npm install epic-router
# Install peer dependencies if not yet installed.
npm install epic-state react
```

## Usage

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Router, Page } from 'epic-router'

// Declare some components used as pages.
const Overview = () => <p>Overview</p>
const About = () => <p>About</p>
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>

// Configure available and initial pages before rendering.
Router.setPages(
  {
    overview: Overview,
    'nested/about': About,
    article: Article,
    // Custom 404 page for missing routes.
    404: Custom404
  },
  'overview' // Initial page.
)

createRoot(document.body).render(
  <div>
    <button onClick={() => Router.go('nested/about')}>About</button>
    <button onClick={() => Router.go('article', { id: 2 })}>Article 2</button>
    {/* Currently active page will be displayed in Page component. */}
    <Page />
  </div>
)
```

## `<Page />`

```js
import { Page } from 'epic-router'
```

Use the `<Page />` component anywhere in your layout to display the current page. Any props you pass to it will be handed over to the page components themselves:

```jsx
<Page onError={(error) => console.error(error)} />
```

## Router

```js
import { Router } from 'epic-router'
```

The `Router`-Store can be accessed from anywhere to access, configure and modify the state of the Router.

```ts
Router.setPages(pages: { [key: string]: React.ReactNode }, initialRoute: string)
```

Configure the route keys and their associated components, plus the route to be displayed initially.

```ts
Router.go(route: string, parameters: object = {}, state: object = {}, replace = false)
```

Navigates to a route. Parameters will be added to the URL search query and together with the state (both optional) will be passed to the page component as props. If replace is true, `back()` will not lead to the previous page.

`Router.back()` go back one step in the history.

`Router.forward()` go forward one step.

`Router.initial()` go to the initial route.

```ts
addPage(route: string, component: React.ReactNode)
```

Add a single page after initialization. This can be useful when pages are loaded on request.

```ts
// Currently active route.
Router.route => string
// Parameters for current route.
Router.parameters => Object
// Initial route.
Router.initialRoute => string
// Available routes.
Router.pages => Object
// Underlieing history object, either BrowserHistory or MemoryHistory.
Router.history => History
```

### Error Route (404 Not Found)

The `404` page can be set to show a custom error page when a route is not found.

```tsx
import { Router } from 'epic-router'

const Custom404 = () => <p>Page Not Found!</p>

Router.setPages({
  404: Custom404,
})
```

## Notes

If `process.env.PUBLIC_URL` is set during build the path will be adapted accordingly.
