/* eslint-disable react/react-in-jsx-scope */
import '../setup-dom'
import { expect, mock, test } from 'bun:test'
import { render, serializeElement } from 'epic-jsx/test'
import { batch, plugin } from 'epic-state'
import { connect } from 'epic-state/connect'
// Import from local folder to avoid using entry tsconfig (different JSX configrations required).
import { Page, back, create, go, history, reset } from './source/index'

// Clean up rendered content from other suite.
document.body.innerHTML = ''

plugin(connect)

const Overview = () => <p>Overview</p>
const { serialized: OverviewMarkup } = render(<Overview />)
function About() {
  return <p>About</p>
}
const { serialized: AboutMarkup } = render(<About />)
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>
const Custom404 = () => <p>Page not found</p>
const { serialized: Custom404Markup } = render(<Custom404 />)
const { serialized: Article5Markup } = render(<Article id="5" />)
const FragmentPage = (name: string, count: number) => (
  <>
    <p>{name}</p>
    <span>{count}</span>
  </>
)

const { Router } = create(
  {
    overview: Overview,
    about: About,
    article: Article,
    static: <p>Hello</p>,
    fragment: FragmentPage,
    404: Custom404,
  },
  'overview',
)

const page = render(<Page />)

test('Intial page is rendered without interaction.', () => {
  expect(page.serialized).toEqual(OverviewMarkup)
  expect(Router.route).toBe('overview')
  expect(history.location.pathname).toEqual('/')
})

test('go: Switches to page.', () => {
  go('about')
  batch()
  expect(serializeElement()).toEqual(AboutMarkup)
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test('go: Can rerender already rendered page.', () => {
  // NOTE this used to require a workaround as double rendering lead to an error.
  go('about')
  batch()
  expect(serializeElement()).toEqual(AboutMarkup)
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test('back: Goes back to the initial page.', () => {
  back()
  back()
  batch()
  expect(serializeElement()).toEqual(OverviewMarkup)
  expect(history.location.pathname).toEqual('/')
})

test('go: Switches to page with parameters.', () => {
  go('article', { id: 5 })
  batch()
  expect(serializeElement()).toEqual(Article5Markup)
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=5')
})

test('go: Initial route is found on /.', () => {
  expect(Router.initialRoute).toEqual('overview')
  go(Router.initialRoute)
  batch()
  expect(serializeElement()).toEqual(OverviewMarkup)
  expect(Router.route).toEqual('overview')
  expect(history.location.pathname).toEqual('/')
  expect(history.location.search).toEqual('')
})

test('go: Missing route shows 404 fallback in page.', () => {
  go('missing')
  batch()
  expect(serializeElement()).toEqual(Custom404Markup)
  expect(history.location.pathname).toEqual('/missing')
})

test('Props handed to Page can be accessed from pages.', () => {
  reset()

  const errorMock = mock(() => 'whatt?')
  const Overview2 = () => <p>Overview</p>
  const ErrorPage = ({ onError }: { onError: (message: string) => string }) => <p>sending an error {onError('whatt?')}</p>

  const { serialized: Overview2Markup } = render(<Overview2 />)
  const { serialized: ErrorMarkup } = render(<ErrorPage onError={(value = '') => value} />)

  create(
    {
      overview: Overview,
      error: ErrorPage,
    },
    'overview',
  )

  go('overview')

  expect(errorMock.mock.calls.length).toEqual(0)
  render(<Page onError={errorMock} />)
  expect(serializeElement()).toEqual(Overview2Markup)
  go('error')
  batch()
  expect(serializeElement()).toEqual(ErrorMarkup)
  expect(errorMock.mock.calls.length).toEqual(1)
})
