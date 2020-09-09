import React from 'react'
import { observable, action, Reaction } from 'mobx'
import { observer } from 'mobx-react'
import { createBrowserHistory } from 'history'
import { parse, stringify } from 'query-string'

const history = createBrowserHistory()

export const Router = new (class {
  pages = {}
  @observable route
  @observable parameters = {}

  constructor() {
    const { pathname, search } = history.location

    const path = pathname.replace(/^\//, '')

    if (path && path.length > 0) {
      this.route = path
    }

    if (!search || search.length === 0) {
      return
    }

    this.parameters = parse(search)
  }

  @action
  go(route, parameters) {
    this.route = route
    this.parameters = parameters

    history.push(`${route}?${stringify(parameters)}`)
  }

  @action
  back() {
    this.Page = null
  }

  @action
  setPages(pages: { [key: string]: React.ReactNode }) {
    this.pages = pages
  }
})()

export const Page = observer(() => {
  const { route, parameters } = Router

  let Component = Overview

  if (route === 'detail') {
    Component = Detail
  }

  return <Component {...parameters} />
})
