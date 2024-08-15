import { render, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test } from 'vitest'
import Counter from './counter'

afterEach(cleanup)

test('count starts with 0', () => {
  const { getByTestId } = render(<Counter />)
  expect(getByTestId('count').textContent).toBe('Clicked 0 times')
})

test('clicking on button increments counter', async () => {
  const { getByText, getByTestId } = render(<Counter />)
  await userEvent.click(getByText('Increment'))
  expect(getByTestId('count').textContent).toBe('Clicked 1 time')
  await userEvent.click(getByText('Increment'))
  expect(getByTestId('count').textContent).toBe('Clicked 2 times')
})

test('window title changes after every increment if checkbox is checked', async () => {
  document.title = 'My Awesome App'
  const { getByText, getByLabelText } = render(<Counter />)

  // When checkbox is unchecked, incrementing has no effect
  await userEvent.click(getByText('Increment'))
  expect(document.title).toBe('My Awesome App')

  // Check and assert the document title changes
  const checkbox = getByLabelText('Check to display count in document title')
  await userEvent.click(checkbox)
  expect(document.title).toBe('Total number of clicks: 1')

  // Works if you increment multiple times
  await userEvent.click(getByText('Increment'))
  expect(document.title).toBe('Total number of clicks: 2')

  // Unchecking will return to the original document title
  await userEvent.click(checkbox)
  expect(document.title).toBe('My Awesome App')
})
