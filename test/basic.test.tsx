/// <reference lib="dom" />

import './setup-dom'
import React from 'react'
import { test, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { Page, Router, history } from '../index'

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

Router.setPages(
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

const serializer = new XMLSerializer()
const serializeFragment = (asFragment: () => DocumentFragment) =>
  serializer.serializeToString(asFragment())

const page = render(<Page />)

test('Intial page is rendered without interaction.', () => {
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  expect(Router.route).toBe('overview')
  expect(history.location.pathname).toEqual('/')
})

test('go: Switches to page.', async () => {
  Router.go('about')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(AboutMarkup))
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test('go: Can rerender already rendered page.', async () => {
  // NOTE this only works with a workaround preventing rerender (needs investigation).
  Router.go('about')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(AboutMarkup))
  expect(Router.route).toBe('about')
  expect(history.location.pathname).toEqual('/about')
})

test('back: Goes back to the initial page.', async () => {
  Router.back()
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  expect(history.location.pathname).toEqual('/')
})

test('go: Switches to page with parameters.', async () => {
  Router.go('article', { id: 5 })
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(Article5Markup))
  expect(history.location.pathname).toEqual('/article')
  expect(history.location.search).toEqual('?id=5')
})

test('go: Initial route is found on /.', async () => {
  expect(Router.initialRoute).toEqual('overview')
  Router.go(Router.initialRoute)
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  expect(Router.route).toEqual('overview')
  expect(history.location.pathname).toEqual('/')
  expect(history.location.search).toEqual('')
})

test('go: Missing route shows 404 fallback in page.', async () => {
  Router.go('missing')
  await wait()
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(Custom404Markup))
  expect(history.location.pathname).toEqual('/missing')
})
