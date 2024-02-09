/// <reference lib="dom" />

import './setup-dom'
import React from 'react'
import { test, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { Page, Router } from '../index'

const Overview = () => <p>Overview</p>
const Error = ({ onError }: { onError: (message: string) => any }) => (
  <p>sending an error {onError('whatt?')}</p>
)

const { asFragment: OverviewMarkup } = render(<Overview />)
const { asFragment: ErrorMarkup } = render(<Error onError={() => ''} />)

Router.setPages(
  {
    overview: Overview,
    error: Error,
  },
  'overview',
)

const wait = (time = 1) =>
  new Promise((done) => {
    setTimeout(done, time * 10)
  })

const serializer = new XMLSerializer()
const serializeFragment = (asFragment: () => DocumentFragment) =>
  serializer.serializeToString(asFragment())

test('Props handed to Page can be accessed from pages.', async () => {
  const errorMock = mock()
  expect(errorMock.mock.calls.length).toEqual(0)
  const page = render(<Page onError={errorMock} />)
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(OverviewMarkup))
  Router.go('error')
  await wait()
  expect(errorMock.mock.calls.length).toEqual(1)
  expect(serializeFragment(page.asFragment)).toEqual(serializeFragment(ErrorMarkup))
})
