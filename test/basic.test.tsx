import React from 'react'
import { create, act } from 'react-test-renderer'
import { Page, Router } from '../index'

const Overview = () => <p>Overview</p>
const OverviewMarkup = create(<Overview />).toJSON()
function About() {
  return <p>About</p>
}
const AboutMarkup = create(<About />).toJSON()
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>
const Custom404 = () => <p>Page not found</p>
const Custom404Markup = create(<Custom404 />).toJSON()
const Article5Markup = create(<Article id="5" />).toJSON()
const Fragment = (name: string, count: number) => (
  <>
    <p>{name}</p>
    <span>{count}</span>
  </>
)

Router.setPages(
  {
    overview: Overview,
    about: About,
    article: Article,
    static: <p>Hello</p>,
    fragment: Fragment,
    404: Custom404,
  },
  'overview'
)

test('Intial page is rendered without interaction.', () => {
  const page = create(<Page />).toJSON()
  expect(page).toEqual(OverviewMarkup)
  expect(Router.history.location.pathname).toEqual('/')
})

test('go: Switches to page.', () => {
  act(() => {
    Router.go('about')
  })
  const page = create(<Page />).toJSON()
  expect(page).toEqual(AboutMarkup)
  expect(Router.history.location.pathname).toEqual('/about')
})

test('back: Goes back to the initial page.', async () => {
  act(() => {
    Router.back()
  })
  // Takes some time until back has happened.
  await new Promise((done) => {
    setTimeout(done, 100)
  })
  const page = create(<Page />).toJSON()
  expect(page).toEqual(OverviewMarkup)
  expect(Router.history.location.pathname).toEqual('/')
})

test('go: Switches to page with parameters.', () => {
  act(() => {
    Router.go('article', { id: 5 })
  })
  const page = create(<Page />).toJSON()
  expect(page).toEqual(Article5Markup)
  expect(Router.history.location.pathname).toEqual('/article')
  expect(Router.history.location.search).toEqual('?id=5')
})

test('go: Initial route is found on /.', () => {
  expect(Router.initialRoute).toEqual('overview')
  act(() => {
    Router.go(Router.initialRoute)
  })
  const page = create(<Page />).toJSON()
  expect(page).toEqual(OverviewMarkup)
  expect(Router.route).toEqual('overview')
  expect(Router.history.location.pathname).toEqual('/')
  expect(Router.history.location.search).toEqual('')
})

test('go: Missing route shows 404 fallback in page.', () => {
  act(() => {
    Router.go('missing')
  })
  const page = create(<Page />).toJSON()
  expect(page).toEqual(Custom404Markup)
  expect(Router.history.location.pathname).toEqual('/missing')
})
