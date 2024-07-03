/* eslint-disable react/react-in-jsx-scope */
import '../setup-dom'
import { expect, mock, test } from 'bun:test'
import { render, serializeElement } from 'epic-jsx/test'
import { state as createState, plugin } from 'epic-state'
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

const wait = (time = 1) =>
  new Promise((done) => {
    setTimeout(done, time * 10)
  })

const page = render(<Page />)

test('State is connected.', async () => {
  const root = createState({
    count: 1,
    // Derivation
    get currentCountTripled() {
      return root.count * 3
    },
    // Action
    double: () => {
      root.count *= 2
    },
  })

  function App() {
    return (
      <div>
        Hey {root.count} {root.currentCountTripled}
      </div>
    )
  }

  const markup = render(<App />)
  expect(markup.serialized).toEqual('<body><div>Hey 1 3</div></body>')
  expect(root.currentCountTripled).toBe(3)
  root.double()
  // TODO issue with derivations in epic-state as they do not update.
  expect(serializeElement()).toEqual('<body><div>Hey 2 3</div></body>')
  expect(root.currentCountTripled).toBe(6)
  expect(serializeElement()).toEqual('<body><div>Hey 2 3</div></body>')
})

test('Intial page is rendered without interaction.', () => {
  expect(page.serialized).toEqual(OverviewMarkup)
  expect(Router.route).toBe('overview')
  expect(history.location.pathname).toEqual('/')
})

test.skip('go: Switches to page.', async () => {
  go('about')
  await wait()
  expect(serializeElement()).toEqual(AboutMarkup)
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test.skip('go: Can rerender already rendered page.', async () => {
  // NOTE this used to require a workaround as double rendering lead to an error.
  go('about')
  await wait()
  expect(serializeElement()).toEqual(AboutMarkup)
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test.skip('back: Goes back to the initial page.', async () => {
  back()
  back()
  await wait()
  expect(serializeElement()).toEqual(OverviewMarkup)
  expect(history.location.pathname).toEqual('/')
})

test.skip('go: Switches to page with parameters.', async () => {
  go('article', { id: 5 })
  await wait()
  expect(serializeElement()).toEqual(Article5Markup)
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=5')
})

test.skip('go: Initial route is found on /.', async () => {
  expect(Router.initialRoute).toEqual('overview')
  go(Router.initialRoute)
  await wait()
  expect(serializeElement()).toEqual(OverviewMarkup)
  expect(Router.route).toEqual('overview')
  expect(history.location.pathname).toEqual('/')
  expect(history.location.search).toEqual('')
})

test.skip('go: Missing route shows 404 fallback in page.', async () => {
  go('missing')
  await wait()
  expect(serializeElement()).toEqual(Custom404Markup)
  expect(history.location.pathname).toEqual('/missing')
})

test.skip('Props handed to Page can be accessed from pages.', async () => {
  reset()

  const Overview2 = () => <p>Overview</p>
  const ErrorPage = ({ onError }: { onError: (message: string) => string }) => <p>sending an error {onError('whatt?')}</p>

  const { serialized: Overview2Markup } = render(<Overview2 />)
  const { serialized: ErrorMarkup } = render(<ErrorPage onError={(value = '') => value} />)

  create(
    {
      overview: Overview,
      error: Error,
    },
    'overview',
  )

  go('overview')

  const errorMock = mock(() => 'whatt?')
  expect(errorMock.mock.calls.length).toEqual(0)
  render(<Page onError={errorMock} />)
  expect(serializeElement()).toEqual(Overview2Markup)
  go('error')
  await wait()
  expect(errorMock.mock.calls.length).toEqual(1)
  expect(serializeElement()).toEqual(ErrorMarkup)
})
