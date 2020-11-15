import React from 'react'
import { create } from 'react-test-renderer'
import { Page, Router } from '..'

const Overview = () => <p>Overview</p>
const Error = ({ onError }: { onError: (message: string) => void }) => (
  <p>sending an error {onError('whatt?')}</p>
)

Router.setPages(
  {
    overview: Overview,
    error: Error,
  },
  'overview'
)

test('Props handed to Page can be accessed from pages.', () => {
  const errorMock = jest.fn()
  expect(errorMock.mock.calls.length).toEqual(0)
  Router.go('error')
  create(<Page onError={errorMock} />)
  expect(errorMock.mock.calls.length).toEqual(1)
})
