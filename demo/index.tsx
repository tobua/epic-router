import React from 'react'
import { createRoot } from 'react-dom/client'
import { Exmpl } from 'exmpl'
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

createRoot(document.body).render(
  <Exmpl title="epic-react-router Demo" npm="epic-react-router" github="tobua/epic-react-router">
    <Button text="← Back" onClick={() => Router.back()} />
    <Button text="Forward →" onClick={() => Router.forward()} />
    <br />
    <br />
    <Button text="Overview" onClick={() => Router.go('overview')} />
    <Button text="About" onClick={() => Router.go('about')} />
    <Button text="Article 1" onClick={() => Router.go('article', { id: 1 })} />
    <Button text="Article 2" onClick={() => Router.go('article', { id: 2 })} />
    <Button text="Article 3" onClick={() => Router.go('article', { id: 3 })} />
    <Button text="Nested/Overview" onClick={() => Router.go('nested/overview')} />
    <Page />
  </Exmpl>
)
