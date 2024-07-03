/* eslint-disable react/react-in-jsx-scope */
import '../setup-dom'
import { expect, mock, test } from 'bun:test'
import { render } from '@testing-library/preact'
import { connect } from 'epic-state/preact'
// Import from local folder to avoid using entry tsconfig (different JSX configrations required).
import { Page, back, create, go, history, reset } from './source/index'

// Clean up rendered content from other suite.
document.body.innerHTML = ''

// TODO why doesn't globally connected preact plugin work?

const Overview = () => <p>Overview</p>
const { asFragment: OverviewMarkup } = render(<Overview />)
function About() {
  return <p>About</p>
}
const { asFragment: AboutMarkup } = render(<About />)
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>
const Custom404 = () => <p>Page not found</p>
const { asFragment: Custom404Markup } = render(<Custom404 />)
const { asFragment: Article5Markup } = render(<Article id="5" />)
const FragmentPage = (name: string, count: number) => (
  <>
    <p>{name}</p>
    <span>{count}</span>
  </>
)

const { Router, removeListener } = create(
  {
    overview: Overview,
    about: About,
    article: Article,
    static: <p>Hello</p>,
    fragment: FragmentPage,
    404: Custom404,
  },
  'overview',
  connect,
)

const wait = (time = 1) =>
  new Promise((done) => {
    setTimeout(done, time * 10)
  })

const serializer = new XMLSerializer()
const serializeFragment = (asFragment: () => DocumentFragment) => serializer.serializeToString(asFragment())

let page = render(<Page />)

test('Intial page is rendered without interaction.', () => {
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  expect(Router.route).toBe('overview')
  expect(history.location.pathname).toEqual('/')
})

test('go: Switches to page.', async () => {
  go('about')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(AboutMarkup))
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test('go: Can rerender already rendered page.', async () => {
  // NOTE this used to require a workaround as double rendering lead to an error.
  go('about')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(AboutMarkup))
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test('back: Goes back to the initial page.', async () => {
  back()
  back()
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  expect(history.location.pathname).toEqual('/')
})

test('go: Switches to page with parameters.', async () => {
  go('article', { id: 5 })
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(Article5Markup))
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=5')
})

test('go: Initial route is found on /.', async () => {
  expect(Router.initialRoute).toEqual('overview')
  go(Router.initialRoute)
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  expect(Router.route).toEqual('overview')
  expect(history.location.pathname).toEqual('/')
  expect(history.location.search).toEqual('')
})

test('go: Missing route shows 404 fallback in page.', async () => {
  go('missing')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(Custom404Markup))
  expect(history.location.pathname).toEqual('/missing')
})

test('Props handed to Page can be accessed from pages.', async () => {
  removeListener()
  reset()

  const Overview2 = () => <p>Overview</p>
  const ErrorPage = ({ onError }: { onError?: (message: string) => string }) => <p>sending an error {onError?.('whatt?')}</p>

  const { asFragment: Overview2Markup } = render(<Overview2 />)
  const { asFragment: ErrorMarkup } = render(<ErrorPage onError={(value = '') => value} />)

  const { Router } = create(
    {
      overview: Overview,
      error: ErrorPage,
    },
    'overview',
    connect,
  )

  go('overview')

  const errorMock = mock(() => 'whatt?')
  expect(errorMock.mock.calls.length).toEqual(0)
  page = render(<Page onError={errorMock} />)
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(Overview2Markup))
  expect(Router.route).toBe('overview')
  go('error')
  await wait()
  expect(errorMock.mock.calls.length).toEqual(1)
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(ErrorMarkup))
  expect(Router.route).toBe('error')
})
