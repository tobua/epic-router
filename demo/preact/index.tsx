import { Page, addPage, back, configure, forward, go } from 'epic-router'
import { connect } from 'epic-state/preact'
import { Exmpl } from 'exmpl'
import { render } from 'preact'

const { router } = configure<{ id: number }>('overview', undefined, undefined, connect)

const Overview = () => <span>Overview</span>
const About = () => <span>About</span>
const Article = () => <span>Article: {router.parameters.id}</span>
const Nested = () => <span>Nested</span>
const Custom404 = () => <span>Page not found!</span>

addPage('overview', Overview)
addPage('about', About)
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
        Uses <span style={{ fontWeight: 'bold' }}>preact</span> for rendering.
      </p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Button text="← Back" onClick={() => back()} />
        <Button text="Forward →" onClick={() => forward()} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Button text="Overview" onClick={() => go('overview')} />
        <Button text="About" onClick={() => go('about')} />
        <Button text="Article 1" onClick={() => go('article', { id: 1 })} />
        <Button text="Article 2" onClick={() => go('article', { id: 2 })} />
        <Button text="Article 3" onClick={() => go('article', { id: 3 })} />
        <Button text="Nested/Overview" onClick={() => go('nested/overview')} />
      </div>
      <Page />
    </div>
  </Exmpl>,
  document.body,
)
