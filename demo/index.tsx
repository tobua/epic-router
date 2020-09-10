import React from 'react'
import { render } from 'react-dom'
import { Router, Page } from 'epic-react-router'

const Overview = () => <p>Overview</p>
const About = () => <p>About</p>
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>

Router.setPages(
  {
    overview: Overview,
    about: About,
    article: Article,
  },
  'overview'
)

render(
  <div>
    <button onClick={() => Router.back()}>←</button>
    <button onClick={() => Router.back()}>→</button>
    <p>React App</p>
    <button onClick={() => Router.go('overview')}>Overview</button>
    <button onClick={() => Router.go('about')}>About</button>
    <button onClick={() => Router.go('article', { id: 1 })}>Article 1</button>
    <button onClick={() => Router.go('article', { id: 2 })}>Article 2</button>
    <button onClick={() => Router.go('article', { id: 3 })}>Article 3</button>
    <Page />
  </div>,
  document.body
)
