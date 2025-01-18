import { parameters, route } from 'epic-router'

export function Footer() {
  return (
    <footer>
      <p>
        Current route <span style={{ fontWeight: 'bold' }}>{route()}</span> with parameters{' '}
        <span style={{ fontWeight: 'bold' }}>{JSON.stringify(parameters())}</span>
      </p>
    </footer>
  )
}
