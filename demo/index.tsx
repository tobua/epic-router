import { render } from 'preact'
import { Exmpl } from 'exmpl'
import { Router, Page } from 'epic-router'

const Overview = () => <span>Overview</span>
const About = () => <span>About</span>
const Article = ({ id }: { id: string }) => <span>Article: {id}</span>
const Nested = () => <span>Nested</span>
const Custom404 = () => <span>Page not found!</span>

Router.setPages(
  {
    overview: Overview,
    about: About,
    article: Article,
    'nested/overview': Nested,
    404: Custom404,
  },
  'overview',
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
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    {text}
  </button>
)

render(
  <Exmpl title="epic-router Demo" npm="epic-router" github="tobua/epic-router">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Button text="← Back" onClick={() => Router.back()} />
        <Button text="Forward →" onClick={() => Router.forward()} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Button text="Overview" onClick={() => Router.go('overview')} />
        <Button text="About" onClick={() => Router.go('about')} />
        <Button text="Article 1" onClick={() => Router.go('article', { id: 1 })} />
        <Button text="Article 2" onClick={() => Router.go('article', { id: 2 })} />
        <Button text="Article 3" onClick={() => Router.go('article', { id: 3 })} />
        <Button text="Nested/Overview" onClick={() => Router.go('nested/overview')} />
      </div>
      <Page />
    </div>
  </Exmpl>,
  document.body,
)
