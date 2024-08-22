import type { WithRouter } from 'epic-router'

export function Article({ router }: WithRouter<{ id: number }>) {
  return (
    <div>
      <h1>Article: {router.parameters.id}</h1>
      <p>The parameter for the specific article is stored in the URL!</p>
    </div>
  )
}
