import React from 'react'
import { render } from 'react-dom'
import { Router, Page } from 'epic-react-router'
import github from 'github.png'
import npm from 'npm.svg'

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

const Button = ({ text, onClick }) => (
  <button
    style={{
      border: 'none',
      outline: 'none',
      background: 'black',
      color: 'white',
      padding: 10,
      borderRadius: 10,
      marginRight: 10,
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    {text}
  </button>
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
          <img style={{ width: 30, marginLeft: 10 }} src={npm} />
        </a>
        <a href="https://github.com/tobua/epic-react-router">
          <img style={{ width: 30, marginLeft: 10 }} src={github} />
        </a>
      </nav>
    </header>
    <Button text="← Back" onClick={() => Router.back()} />
    <Button text="Forward →" onClick={() => Router.forward()} />
    <br />
    <br />
    <Button text="Overview" onClick={() => Router.go('overview')} />
    <Button text="About" onClick={() => Router.go('about')} />
    <Button text="Article 1" onClick={() => Router.go('article', { id: 1 })} />
    <Button text="Article 2" onClick={() => Router.go('article', { id: 2 })} />
    <Button text="Article 3" onClick={() => Router.go('article', { id: 3 })} />
    <Button
      text="Nested/Overview"
      onClick={() => Router.go('nested/overview')}
    />
    <Page />
  </div>,
  document.body
)
