import '../setup-dom'
import { expect, mock, test } from 'bun:test'
import { render } from '@testing-library/preact'
import { connect } from 'epic-state/preact'
// Import from local folder to avoid using entry tsconfig (different JSX configrations required).
import { addPage, back, configure, go, history, Page, reset, type WithRouter } from './source/index'

// Clean up rendered content from other suite.
document.body.innerHTML = ''

// TODO why doesn't globally connected preact plugin work?
// plugin(connect)

const wait = (time = 1) =>
  new Promise((done) => {
    setTimeout(done, time * 10)
  })

const serializer = new XMLSerializer()
const serializeFragment = (asFragment: () => DocumentFragment) => serializer.serializeToString(asFragment())

test('Sets up and runs the router.', async () => {
  const { router } = configure<{ id: number }>('overview', undefined, undefined, connect)

  const Overview = () => <p>Overview</p>
  function About() {
    return <p>About</p>
  }
  const Custom404 = () => <p>Page not found</p>
  const Article = ({ router: currentRouter }: WithRouter<{ id: number }>) => <p>Article: {currentRouter.parameters.id}</p>
  const ArticleRouterProps = () => <p>Article: {router.parameters.id}</p>
  const FragmentPage = (name: string, count: number) => (
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

  const OverviewMarkup = serializeFragment(render(<Overview />).asFragment)
  const AboutMarkup = serializeFragment(render(<About />).asFragment)
  const Custom404Markup = serializeFragment(render(<Custom404 />).asFragment)
  const ArticleIdMarkup = {
    5: serializeFragment(render(<p>Article: 5</p>).asFragment),
    6: serializeFragment(render(<p>Article: 6</p>).asFragment),
    7: serializeFragment(render(<p>Article: 7</p>).asFragment),
    8: serializeFragment(render(<p>Article: 8</p>).asFragment),
  }

  const page = render(<Page />)

  expect(serializeFragment(page.asFragment)).toEqual(OverviewMarkup)
  expect(router.route).toBe('overview')
  expect(history.location.pathname).toEqual('/')

  go('about')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(AboutMarkup)
  expect(router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')

  back()
  back()
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(OverviewMarkup)
  expect(history.location.pathname).toEqual('/')

  go('article', { id: 5 })
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(ArticleIdMarkup[5])
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=5')

  go('article', { id: 6 })
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(ArticleIdMarkup[6])
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=6')

  go('article-props', { id: 7 })
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(ArticleIdMarkup[7])
  expect(history.location.pathname).toEqual('/article-props')
  expect(history.location.search).toEqual('?id=7')

  go('article-props', { id: 8 })
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(ArticleIdMarkup[8])
  expect(history.location.pathname).toEqual('/article-props')
  expect(history.location.search).toEqual('?id=8')

  expect(router.initialRoute).toEqual('overview')
  go(router.initialRoute)
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(OverviewMarkup)
  expect(router.route).toEqual('overview')
  expect(history.location.pathname).toEqual('/')
  expect(history.location.search).toEqual('')

  go('missing')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(Custom404Markup)
  expect(history.location.pathname).toEqual('/missing')
})

test('Props handed to Page can be accessed from pages.', async () => {
  reset()

  const errorMock = mock(() => 'error, oh no!')
  const Overview2 = () => <p>Overview</p>
  const ErrorPage = ({ onError }: { onError: (message: string) => string }) => <p>sending an error {onError?.('error, oh no!')}</p>
  const Overview2Markup = serializeFragment(render(<Overview2 />).asFragment)
  const ErrorMarkup = serializeFragment(render(<ErrorPage onError={(value = '') => value} />).asFragment)

  configure('overview', undefined, undefined, connect)
  addPage('overview', Overview2)
  addPage('error', ErrorPage)
  go('overview')

  expect(errorMock.mock.calls.length).toEqual(0)
  const page = render(<Page another="here!" onError={errorMock} />)
  expect(serializeFragment(page.asFragment)).toEqual(Overview2Markup)
  go('error')
  await wait()
  // NOTE if fails, skip the previous test, first connect still active...
  expect(serializeFragment(page.asFragment)).toEqual(ErrorMarkup)
  expect(errorMock.mock.calls.length).toEqual(1)
})
