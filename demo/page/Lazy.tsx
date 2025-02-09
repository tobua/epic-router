import { click } from 'epic-router'

export default function Lazy() {
  return (
    <div>
      <h1>Dynamic Import (Lazy Loaded)</h1>
      <p>The code to render this page is only loaded when requested.</p>
      <a
        href="/"
        style={{
          textDecoration: 'none',
          fontWeight: 'bold',
          color: 'black',
        }}
        onClick={click('overview')}
      >
        Go to overview
      </a>
    </div>
  )
}
