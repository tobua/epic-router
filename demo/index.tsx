import { render } from 'epic-jsx'
import { Page, addPage, back, configure, forward, go, initial, onNavigate } from 'epic-router'
import { plugin } from 'epic-state'
import { connect } from 'epic-state/connect'
import { Exmpl } from 'exmpl'
import { Footer } from './Footer'
import { About } from './page/About'
import { Article } from './page/Article'
import { Overview } from './page/Overview'

plugin(connect)

onNavigate((route, parameters, initial) => {
  console.log('onNavigate:', route, parameters.id, initial)
})

const { router } = configure<{ id: number }>('overview')

// TODO epic-jsx bug, link will not be removed when a Fragment is used here instead of the <div>
const Nested = () => (
  <div>
    <p>Nested Route: "{router.route}"</p>
    <a
      href="/"
      style={{
        textDecoration: 'none',
        fontWeight: 'bold',
        color: 'black',
      }}
      onClick={(event) => {
        event.preventDefault()
        initial()
      }}
    >
      Go to Homepage
    </a>
  </div>
)
const Custom404 = () => <span>Page not found!</span>

addPage('overview', Overview)
addPage('about', About)
addPage('dynamic', { lazy: () => import('./page/Lazy'), loading: <p>Loading...</p> })
addPage('article', Article)
addPage('nested/overview', Nested)
addPage('404', Custom404)

const Button = ({ text, onClick }) => (
  <button
    type="button"
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
      <p>
        Uses <span style={{ fontWeight: 'bold' }}>epic-jsx</span> for rendering.
      </p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Button text="← Back" onClick={() => back()} />
        <Button text="Forward →" onClick={() => forward()} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Button text="Overview" onClick={() => go('overview')} />
        <Button text="About" onClick={() => go('about')} />
        <Button text="Lazy Loaded" onClick={() => go('dynamic')} />
        <Button text="Article 1" onClick={() => go('article', { id: 1 })} />
        <Button text="Article 2" onClick={() => go('article', { id: 2 })} />
        <Button text="Article 3" onClick={() => go('article', { id: 3 })} />
        <Button text="Nested/Overview" onClick={() => go('nested/overview')} />
        <Button text="Missing Page" onClick={() => go('missing')} />
      </div>
      <Page />
      <Footer />
    </div>
  </Exmpl>,
)
