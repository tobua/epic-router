import React from 'react'
import { create, act } from 'react-test-renderer'
import { Page, Router } from '..'

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
})

test('go: Switches to page.', () => {
  Router.go('about')
  const page = create(<Page />).toJSON()
  expect(page).toEqual(AboutMarkup)
})

test('back: Goes back to the initial page.', async () => {
  Router.back()
  // Takes some time until back has happened.
  await new Promise((_) => setTimeout(_, 100))
  const page = create(<Page />).toJSON()
  expect(page).toEqual(OverviewMarkup)
})

test('go: Switches to page with parameters.', () => {
  Router.go('article', { id: 5 })
  const page = create(<Page />).toJSON()
  expect(page).toEqual(Article5Markup)
})
