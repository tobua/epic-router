import { click } from 'epic-router'

export function About() {
  return (
    <div>
      <h1>About</h1>
      <p>This plugin is a router to switch between different pages.</p>
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
