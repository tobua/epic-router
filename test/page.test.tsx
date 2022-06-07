import React from 'react'
import { create, act } from 'react-test-renderer'
import { Page, Router } from '../index'

const Overview = () => <p>Overview</p>
const Error = ({ onError }: { onError: (message: string) => any }) => (
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
  act(() => {
    Router.go('error')
  })
  create(<Page onError={errorMock} />)
  expect(errorMock.mock.calls.length).toEqual(1)
})
