import { type Plugin, state } from 'epic-state'
import { createBrowserHistory, createMemoryHistory } from 'history'
import { create } from 'logua'
import queryString from 'query-string'
import type React from 'react'
import join from 'url-join'
import type { GenericFunctionComponent, LazyComponent, NavigateListener, PageComponent, Pages, Parameters, RouterState } from './types'

export const log = create('epic-router', 'yellow')

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
export type WithRouter<T extends object> = {
  router: { route: string; parameters: T }
}

const navigateListeners: NavigateListener[] = []

export function onNavigate(listener: NavigateListener) {
  navigateListeners.push(listener)
}

function notifyNavigateListeners(initialRender = false) {
  for (const listener of navigateListeners) {
    listener(router.route, router.parameters, initialRender)
  }
}

const removeSlashRegex = /^\/*/
const removeLeadingSlash = (path: string) => path.replace(removeSlashRegex, '')

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

function ErrorPage(message: React.JSX.Element): PageComponent {
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

function writePath(currentRoute: string) {
  const publicUrl = removeLeadingSlash(process.env.PUBLIC_URL ?? '')

  if (currentRoute === getHomeRoute()) {
    // biome-ignore lint/style/noParameterAssign: Much easier in this case.
    currentRoute = '/'
  }

  if (publicUrl) {
    return join('/', publicUrl, currentRoute)
  }

  // join will not work properly in this case.
  if (currentRoute === '') {
    return '/'
  }

  return join('/', currentRoute)
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
      const currentRoute = pathnameToRoute(location) ?? getInitialRoute()
      const currentParameters = Object.assign(getSearchParameters(location), location.state ?? {})
      if (router.parameters !== currentParameters) {
        // TODO implement deep object compare in epic-jsx.
        // router.parameters = Object.assign(getSearchParameters(location), location.state ?? {})
      }
      if (router.route !== currentRoute) {
        router.route = currentRoute
      }
    },
    loading: true,
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

  setTimeout(() => {
    notifyNavigateListeners(true)
  }, 0)

  return { router: router as RouterState<T>, removeListener }
}

export function addPage(name: string, markup: PageComponent | LazyComponent) {
  if (!name || typeof name !== 'string') {
    log('Invalid page name provided to addPage(name: string, markup: JSX).', 'warning')
    return
  }

  pages[name] = markup

  // Use the first page as the initial route if not provided.
  if (!router.initialRoute) {
    router.initialRoute = name
  }
}

export function go(newRoute: string, newParameters: Parameters = {}, historyState: object = {}, replace = false) {
  router.route = newRoute
  router.parameters = newParameters

  const hasParameters = Object.keys(newParameters).length
  const searchParameters = hasParameters ? `?${queryString.stringify(newParameters)}` : ''

  if (newRoute === router.initialRoute && !hasParameters) {
    // biome-ignore lint/style/noParameterAssign: Existing logic, might be improved.
    newRoute = ''
  }

  const historyAction = replace ? history.replace : history.push
  // WORKAROUND https://github.com/ReactTraining/history/issues/814
  historyAction(
    {
      hash: '',
      search: searchParameters,
      pathname: writePath(newRoute),
    },
    historyState,
  )

  notifyNavigateListeners()
}

export function back() {
  history.back()
  notifyNavigateListeners()
}

export function forward() {
  history.forward()
  notifyNavigateListeners()
}

// <a href="/" onClick={click('overview')}>Homepage</a>
export function click(nextRoute: string, nextParameters?: Parameters) {
  return ((event) => {
    event.preventDefault()
    go(nextRoute, nextParameters)
  }) as React.MouseEventHandler<Element>
}

export function initial() {
  router.route = getInitialRoute()
  history.push(writePath(router.route))
  notifyNavigateListeners()
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

function DynamicImport({ page, props }: { page: LazyComponent; props: React.ComponentPropsWithoutRef<'div'> }) {
  if (page._component) {
    return <page._component {...props} router={router} />
  }

  // biome-ignore lint/nursery/noFloatingPromises: Doesn't need to be awaited.
  page.lazy().then((module) => {
    page._component = module.default
    router.loading = false
  })

  if (router.loading) {
    return page.loading ?? <p>Loading...!</p>
  }

  const Component = page._component as unknown as GenericFunctionComponent

  if (Component) {
    return <Component {...props} router={router} />
  }

  return <p>Failed to dynamically load component, make sure it has a default export.</p>
}

export function Page(props: React.ComponentPropsWithoutRef<'div'>) {
  const Component = router.page
  if (typeof Component !== 'function') {
    if (typeof Component === 'object' && Object.hasOwn(Component, 'lazy')) {
      return <DynamicImport page={Component as LazyComponent} props={props} />
    }
    return Component as React.ReactElement // Rendered JSX element.
  }
  return <Component {...props} router={router} />
}
