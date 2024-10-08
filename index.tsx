import { type Plugin, state } from 'epic-state'
import { createBrowserHistory, createMemoryHistory } from 'history'
import queryString from 'query-string'
import type { ComponentPropsWithoutRef, JSX, MouseEventHandler, ReactElement } from 'react'
import join from 'url-join'
import type { PageComponent, Pages, Parameters, RouterState } from './types'

let router: RouterState<Parameters> = {} as RouterState<Parameters>
const pages: Pages = {}

const createHistory = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    return createBrowserHistory()
  }

  // No URL for ReactNative and Testing (happy-dom doesn't work otherwise).
  return createMemoryHistory()
}

export const history = createHistory()
export const getRouter = () => router
export type WithRouter<T extends object> = { router: { route: string; parameters: T } }

const removeLeadingSlash = (path: string) => path.replace(/^\/*/, '')

function Code({ children }: { children: string | string[] }) {
  return (
    <span
      style={{
        fontFamily: 'monospace',
        color: 'initial',
        background: 'lightgray',
        borderRadius: 5,
        paddingLeft: 2,
        paddingRight: 2,
        paddingBottom: 1,
      }}
    >
      {children}
    </span>
  )
}

function ErrorPage(message: JSX.Element): PageComponent {
  return () => <div style={{ color: 'red', fontWeight: 'bold' }}>{message}</div>
}

function pathnameToRoute(location = history.location) {
  let name = location.pathname

  const publicUrl = removeLeadingSlash((typeof process !== 'undefined' && process.env.PUBLIC_URL) || '')
  name = removeLeadingSlash(name) // Cleanup slash.

  if (publicUrl) {
    // Cleanup public url part.
    name = removeLeadingSlash(name.replace(publicUrl, ''))
  }

  if (name === '' && router && router.initialRoute) {
    return router.initialRoute
  }

  return name !== '' ? name : undefined
}

function getSearchParameters<T extends Parameters>(location = history.location) {
  const { search } = location
  if (!search || search.length === 0) {
    return {} as T
  }
  return queryString.parse(search) as T
}

function writePath(route: string) {
  const publicUrl = removeLeadingSlash(process.env.PUBLIC_URL ?? '')

  if (route === getHomeRoute()) {
    // biome-ignore lint/style/noParameterAssign: Much easier in this case.
    route = '/'
  }

  if (publicUrl) {
    return join('/', publicUrl, route)
  }

  // join will not work properly in this case.
  if (route === '') {
    return '/'
  }

  return join('/', route)
}

const getInitialRoute = () => (router.initialRoute || Object.keys(pages)[0]) ?? ''
const getHomeRoute = () => (router.homeRoute || Object.keys(pages)[0]) ?? ''

export function configure<T extends Parameters>(initialRoute?: string, homeRoute?: string, initialParameters?: T, connect?: Plugin) {
  router = state<RouterState<T>>({
    // Configuration.
    initialRoute, // First rendered if URL empty.
    homeRoute: homeRoute ?? initialRoute, // Home route where URL === '/'.
    // State
    route: pathnameToRoute() ?? initialRoute ?? '',
    parameters: initialParameters ?? getSearchParameters<T>(),
    // Plugins, connect state to React.
    plugin: connect,
    // Retrieve current state from history, was private.
    listener({ location }) {
      const route = pathnameToRoute(location) ?? getInitialRoute()
      const parameters = Object.assign(getSearchParameters(location), location.state ?? {})
      if (router.parameters !== parameters) {
        // TODO implement deep object compare in epic-jsx.
        // router.parameters = Object.assign(getSearchParameters(location), location.state ?? {})
      }
      if (router.route !== route) {
        router.route = route
      }
    },
    // Derivations
    get page() {
      if (process.env.NODE_ENV !== 'production' && !getInitialRoute()) {
        return ErrorPage(
          <span>
            No <Code>pages</Code> or <Code>initialRoute</Code> configured, configure with <Code>router.setPages(pages, initialRoute)</Code>.
          </span>,
        )
      }

      if (router.route === '') {
        return pages[getInitialRoute()] as PageComponent
      }

      if (!pages[router.route]) {
        const userErrorPage = pages['404']
        if (typeof userErrorPage !== 'undefined') {
          return pages['404'] as PageComponent
        }
        return ErrorPage(
          process.env.NODE_ENV === 'production' ? (
            <span>Page not found!</span>
          ) : (
            <span>
              Route <Code>/{router.route}</Code> has no associated page!
            </span>
          ),
        )
      }
      return pages[router.route] as PageComponent
    },
  })

  const removeListener = history.listen(router.listener)

  return { router: router as RouterState<T>, removeListener }
}

export function addPage(name: string, markup: PageComponent) {
  if (!name || typeof name !== 'string') {
    // biome-ignore lint/suspicious/noConsoleLog: Validation error for user.
    console.log('Invalid page name provided to addPage(name: string, markup: JSX).')
    return
  }

  pages[name] = markup

  // Use the first page as the initial route if not provided.
  if (!router.initialRoute) {
    router.initialRoute = name
  }
}

export function go(route: string, parameters: Parameters = {}, historyState: object = {}, replace = false) {
  router.route = route
  router.parameters = parameters

  const hasParameters = Object.keys(parameters).length
  const searchParameters = hasParameters ? `?${queryString.stringify(parameters)}` : ''

  if (route === router.initialRoute && !hasParameters) {
    // biome-ignore lint/style/noParameterAssign: Existing logic, might be improved.
    route = ''
  }

  const historyAction = replace ? history.replace : history.push
  // WORKAROUND https://github.com/ReactTraining/history/issues/814
  historyAction(
    {
      hash: '',
      search: searchParameters,
      pathname: writePath(route),
    },
    historyState,
  )
}

export function back() {
  history.back()
}

export function forward() {
  history.forward()
}

// <a href="/" onClick={click('overview')}>Homepage</a>
export function click(route: string, parameters?: Parameters) {
  return ((event) => {
    event.preventDefault()
    go(route, parameters)
  }) as MouseEventHandler<HTMLAnchorElement>
}

export function initial() {
  router.route = getInitialRoute()
  history.push(writePath(router.route))
}

export function reset() {
  for (const key of Object.keys(pages)) {
    delete pages[key]
  }
  router.initialRoute = ''
  router.route = ''
}

export function route() {
  return router.route
}

export function parameters() {
  return router.parameters
}

export function Page(props: ComponentPropsWithoutRef<'div'>) {
  const Page = router.page
  if (typeof Page !== 'function') {
    return Page as ReactElement
  }
  // biome-ignore lint/suspicious/noExplicitAny: Need to convert epic-jsx JSX to a namespace.
  return (<Page {...props} router={router} />) as any
}
