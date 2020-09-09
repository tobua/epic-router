import React from 'react'
import { render } from 'react-dom'
import { Router, Page } from 'epic-react-router'

const Overview = () => <p>Overview</p>
const About = () => <p>About</p>
const Article = ({ id }: { id: string }) => <p>Article: {id}</p>

Router.setPages({
  overview: Overview,
  about: About,
  Article: Article,
})

render(
  <div>
    React App
    <Page />
  </div>,
  document.body
)
