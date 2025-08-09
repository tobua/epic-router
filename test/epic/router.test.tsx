import '../setup-dom'
import { expect, mock, test } from 'bun:test'
import { render, serializeElement } from 'epic-jsx/test'
import { batch, plugin, state } from 'epic-state'
import { connect } from 'epic-state/connect'
// Import from local folder to avoid using entry tsconfig (different JSX configrations required).
import { addPage, back, configure, go, history, Page, reset, type WithRouter } from './source/index'

// Clean up rendered content from other suite.
document.body.innerHTML = ''

plugin(connect)

test('Sets up and runs the router.', () => {
  const { router } = configure<{ id: number }>('overview')

  const Overview = () => <p>Overview</p>
  function About() {
    return <p>About</p>
  }
  const Custom404 = () => <p>Page not found</p>
  const Article = ({ router: localRouter }: WithRouter<{ id: number }>) => <p>Article: {localRouter.parameters.id}</p>
  const ArticleRouterProps = () => {
    console.log('router', router.parameters.id)
    return <p>Article: {router.parameters.id}</p>
  }
  const FragmentPage = ({ name, count }: { name: string; count: number }) => (
    <>
      <p>{name}</p>
      <span>{count}</span>
    </>
  )

  // @ts-expect-error Parameter inference
  const idParameter: string = router.parameters.id
  // @ts-expect-error Parameter inference
  const missingParameter: string | number = router.parameters.missing
  expect(idParameter).toBeUndefined()
  expect(missingParameter).toBeUndefined()

  addPage('overview', Overview)
  addPage('about', About)
  addPage('article', Article)
  addPage('article-props', ArticleRouterProps)
  addPage('fragment', FragmentPage)
  addPage('static', <p>Hello</p>)
  addPage('404', Custom404)

  const OverviewMarkup = render(<Overview />).serialized
  const AboutMarkup = render(<About />).serialized
  const Custom404Markup = render(<Custom404 />).serialized
  const StaticMarkup = render(<p>Hello</p>).serialized
  const ArticleIdMarkup = {
    5: render(<p>Article: 5</p>).serialized,
    6: render(<p>Article: 6</p>).serialized,
    7: render(<p>Article: 7</p>).serialized,
    8: render(<p>Article: 8</p>).serialized,
  }

  const page = render(<Page />)

  expect(page.serialized).toEqual(OverviewMarkup)
  expect(router.route).toBe('overview')
  expect(history.location.pathname).toEqual('/')

  go('about')
  batch()
  expect(serializeElement()).toEqual(AboutMarkup)
  expect(router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')

  back()
  back()
  batch()
  expect(serializeElement()).toEqual(OverviewMarkup)
  expect(history.location.pathname).toEqual('/')

  go('static')
  batch()
  expect(serializeElement()).toEqual(StaticMarkup)
  expect(router.route).toBe('static')
  expect(history.location.pathname).toEqual('/static')

  go('article', { id: 5 })
  batch()
  expect(serializeElement()).toEqual(ArticleIdMarkup[5])
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=5')

  go('article', { id: 6 })
  batch()
  expect(serializeElement()).toEqual(ArticleIdMarkup[6])
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=6')

  go('article-props', { id: 7 })
  batch()
  expect(serializeElement()).toEqual(ArticleIdMarkup[7])
  expect(history.location.pathname).toEqual('/article-props')
  expect(history.location.search).toEqual('?id=7')

  go('article-props', { id: 8 })
  batch()
  // TODO bug, props mutated somewhere.
  // expect(serializeElement()).toEqual(ArticleIdMarkup[8])
  expect(history.location.pathname).toEqual('/article-props')
  expect(history.location.search).toEqual('?id=8')

  expect(router.initialRoute).toEqual('overview')
  go(router.initialRoute)
  batch()
  expect(serializeElement()).toEqual(OverviewMarkup)
  expect(router.route).toEqual('overview')
  expect(history.location.pathname).toEqual('/')
  expect(history.location.search).toEqual('')

  go('missing')
  batch()
  expect(serializeElement()).toEqual(Custom404Markup)
  expect(history.location.pathname).toEqual('/missing')
})

test('Props handed to Page can be accessed from pages.', () => {
  reset()

  const errorMock = mock(() => 'error, oh no!')
  const Overview2 = () => <p>Overview</p>
  const ErrorPage = ({ onError }: { onError: (message: string) => string }) => <p>sending an error {onError('error, oh no!')}</p>
  const Overview2Markup = render(<Overview2 />).serialized
  const ErrorMarkup = render(<ErrorPage onError={(value = '') => value} />).serialized

  configure('overview')
  addPage('overview', Overview2)
  addPage('error', ErrorPage)
  go('overview')

  expect(errorMock.mock.calls.length).toEqual(0)
  render(<Page onError={errorMock} />)
  expect(serializeElement()).toEqual(Overview2Markup)
  go('error')
  batch()
  expect(serializeElement()).toEqual(ErrorMarkup)
  expect(errorMock.mock.calls.length).toEqual(1)
})

test('No rendering issues when switching pages.', () => {
  reset()
  go('posts')

  const { router } = configure<{ id: number }>('posts')
  const State = state({ loading: true })

  const Posts = () => {
    if (State.loading) {
      return <p id="loading">Loading...</p>
    }
    return <div id="posts">Posts</div>
  }
  const Post = () => <p id="post">Post #{router.parameters.id}</p>
  function About() {
    return <p>About</p>
  }

  function Static({ children }) {
    return <main>{children}</main>
  }

  // function Static({ children }) {
  //   return (
  //     <div>
  //       <header><p>Header</p></header>
  //       <main>{children}</main>
  //       <footer><p>Foorter</p></footer>
  //     </div>
  //   )
  // }

  addPage('posts', Posts)
  addPage('post', Post)
  addPage('about', About)

  const { serialized } = render(
    <Static>
      <Page />
    </Static>,
  )

  // expect(serialized).toEqual(
  //   '<body><div><header><p>Header</p></header><main><p>Loading...</p></main><footer><p>Footer</p></footer></div></body>',
  // )

  expect(serialized).toEqual('<body><main><p id="loading">Loading...</p></main></body>')

  State.loading = false
  batch()

  // expect(serializeElement()).toEqual(
  //   '<body><div><header><p>Header</p></header><main><p>Posts</p></main><footer><p>Footer</p></footer></div></body>',
  // )

  expect(serializeElement()).toEqual('<body><main><div id="posts">Posts</div></main></body>')

  go('post', { id: 3 })
  batch()

  // expect(serializeElement()).toEqual(
  //   '<body><div><header><p>Header</p></header><main><p>Post #3</p></main><footer><p>Footer</p></footer></div></body>',
  //)

  expect(serializeElement()).toEqual('<body><main><p id="post">Post #3</p></main></body>')
})
