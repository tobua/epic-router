import { render } from 'epic-jsx'
import { Page, addPage, configure, go, initial, onNavigate } from 'epic-router'
import { list, plugin, state } from 'epic-state'
import { connect } from 'epic-state/connect'

const State = state({
  loading: true,
  posts: list((post) => post, []),
})

setTimeout(() => {
  State.posts.replace([
    { id: 1, text: 'First post content' },
    { id: 2, text: 'Second post content' },
  ])
  State.loading = false
}, 1000)

plugin(connect)

onNavigate((route, parameters, initial) => {
  console.log('onNavigate:', route, parameters.id, initial)
  State.loading = true

  setTimeout(() => {
    State.loading = false
  }, 1000)
})

const { router } = configure<{ id: number }>('posts')

const Posts = () => {
  if (State.loading) return <p id="loading">Loading...</p>
  return (
    <>
      <p id="posts">Posts</p>
      {/* <p>{State.posts.length}</p> */}
      {/* {State.posts.map(post => <div><h1>{post.text} #{post.id}</h1></div>)} */}
    </>
  )
}
const Post = () => <p id="post">Post #{router.parameters.id}</p>
function About() {
  return <p>About</p>
}

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

addPage('posts', Posts)
addPage('post', Post)
addPage('about', About)
addPage('nested/overview', Nested)

const Button = ({ children, onClick }) => (
  <button
    style={{
      border: 'none',
      background: 'black',
      color: 'white',
      padding: 10,
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    {children}
  </button>
)

function Static({ children }) {
  return (
    <div>
      <header>
        <p>Header</p>
        <Button onClick={() => go('posts')}>Posts</Button>
        <Button onClick={() => go('post', { id: 1 })}>First Post</Button>
        <Button onClick={() => go('post', { id: 2 })}>Second Post</Button>
        <Button onClick={() => go('nested/overview')}>Nested</Button>
      </header>
      <main>{children}</main>
      {/* <footer>
          <p>Footer</p>
          <Button onClick={() => go('about')}>About</Button>
        </footer> */}
    </div>
  )
}

render(
  <Static>
    <Page />
  </Static>,
)
