import React from 'react'
import { render } from 'react-dom'
import { Router, Page } from 'epic-react-router'

const Overview = () => <p>Overview</p>
const About = () => <p>About</p>
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>
const Nested = () => <p>Nested</p>

Router.setPages(
  {
    overview: Overview,
    about: About,
    article: Article,
    'nested/overview': Nested,
  },
  'overview'
)

render(
  <div style={{ fontFamily: 'sans-serif', maxWidth: '75vw', margin: '0 auto' }}>
    <header style={{ display: 'flex' }}>
      <h1>epic-react-router Demo</h1>
      <nav
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <a href="https://www.npmjs.com/package/epic-react-router">
          <img style={{ width: 30, marginLeft: 10 }} src="npm.svg" />
        </a>
        <a href="https://github.com/tobua/epic-react-router">
          <img style={{ width: 30, marginLeft: 10 }} src="github.png" />
        </a>
      </nav>
    </header>
    <button onClick={() => Router.back()}>← Back</button>
    <button onClick={() => Router.forward()}>Forward →</button>
    <br />
    <br />
    <button onClick={() => Router.go('overview')}>Overview</button>
    <button onClick={() => Router.go('about')}>About</button>
    <button onClick={() => Router.go('article', { id: 1 })}>Article 1</button>
    <button onClick={() => Router.go('article', { id: 2 })}>Article 2</button>
    <button onClick={() => Router.go('article', { id: 3 })}>Article 3</button>
    <button onClick={() => Router.go('nested/overview')}>
      Nested/Overview
    </button>
    <Page />
  </div>,
  document.body
)
