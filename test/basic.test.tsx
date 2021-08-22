import React from 'react'
import { create, act } from 'react-test-renderer'
import { Page, Router } from '../index'

const Overview = () => <p>Overview</p>
const OverviewMarkup = create(<Overview />).toJSON()
const About = () => <p>About</p>
const AboutMarkup = create(<About />).toJSON()
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>
const Article5Markup = create(<Article id="5" />).toJSON()

Router.setPages(
  {
    overview: Overview,
    about: About,
    article: Article,
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
  await new Promise((_) => setTimeout(_, 100))
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
