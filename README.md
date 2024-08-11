# epic-router

<img align="right" src="https://github.com/tobua/epic-router/raw/main/logo.svg" width="30%" alt="Router Logo" />

Router for the Web.

- Navigate between different screens
- Handles browser history
- Supports back and forward button
- 404 error page
- See [reactigation](https://github.com/tobua/reactigation) for a React Native router

## Installation

```sh
bun install epic-router
# Install a JSX rendering framework.
bun install epic-jsx / bun install preact
```

## Usage

```jsx
import { Page, addPage, back, configure, go, forward } from 'epic-router'
import { connect } from 'epic-state/connect'
import { render } from 'epic-jsx'

const { router } = configure<{ id: number }>('overview', undefined, undefined, connect)

// Declare some components used as pages.
const Overview = () => <p>Overview</p>
const About = () => <p>About</p>
const Article = () => <p>Article: {router.parameters.id}</p>

addPage('overview', Overview)
addPage('nested/about', About)
addPage('article', Article)
// Custom 404 page for missing routes.
addPage('404', () => <p>Not found!</p>)

render(
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

```ts
import { configure, addPage, go, back, forward, initial } from 'epic-router'

// Setup and configure the Router.
const { router } = configure(initialRoute?: string, homeRoute?: string, initialParameters?: Parameters, connect?: typeof preactConnect)
// Register a page for a route.
addPage(route: string | number, component: JSX | ReactNode)
// Navigates to a route. Parameters will be added to the URL search query and together with the state (both optional) will be passed to the page component as props. If replace is true, `back()` will not lead to the previous page.
go(route: string, parameters: object = {}, state: object = {}, replace = false)
// go back one step in the history.
back()
// Go forward one step in the history.
forward()
// Go to the initial route.
initial()
```

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
import { addPage } from 'epic-router'

const Custom404 = () => <p>Page Not Found!</p>

addPage(404: Custom404)
```

### Parameters

Parameters will automatically be added to the URL and are accessible in different ways as shown below.

```tsx
import { configure, getRouter, type WithRouter } from 'epic-router'

type Parameters = { id: number }

const { router } = configure<Parameters>(...)

const Article = () => <p>Article: {router.parameters.id}</p>
const ArticleGlobal = () => <p>Article: {getRouter().parameters.id}</p>
const ArticleProps = ({ router }: WithRouter<Parameters>) => <p>Article: {router.parameters.id}</p>
```

## Notes

If `process.env.PUBLIC_URL` is set during build the path will be adapted accordingly. This router assumes an SPA (Single Page Application) environment on the server. For initial URL requests to arrive at the router the server has to be instructed to rewrite requests to the index. See [Legacy SPA Fallback](https://vercel.com/docs/projects/project-configuration#legacy-spa-fallback) on how to configure this for Vercel in `vercel.json`.
