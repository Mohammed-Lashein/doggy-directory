import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import App from "./App"
import mockFetch from "./mocks/mockFetch"
import userEvent from "@testing-library/user-event"

beforeEach(() => {
  jest.spyOn(window, "fetch").mockImplementation(mockFetch)
})
afterEach(() => {
  jest.resetAllMocks()
})

test("initial App render", async () => {
  render(<App />)

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/doggy directory/i)
  expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Search" })).toBeDisabled()

  expect(screen.getByRole("combobox")).toBeInTheDocument()
  expect(screen.getByRole("combobox")).toHaveDisplayValue(/select a breed/i)

  expect(screen.getByRole("img")).toBeInTheDocument()
  expect(await screen.findByRole("option", { name: "husky" })).toBeInTheDocument()
})
test("should be able to search and display dog image results", async () => {
  // render App
  render(<App />)
  // get the select
  const select = screen.getByRole("combobox")
  // make sure that it has the option cattledog ... what's special about it?
  // => in our mockFetch, we are checking for either husky or cattle-dog in our switch statement

  /*
  Asserting that the option exists before selecting it is super important, otherwise the test will
  throw an error saying that it can't find the option we are trying to select.

  Also by using findByRole(), we are forcing our test to wait for the promise to resolve, thus we make
  sure that our element was added to the DOM
   */
  expect(await screen.findByRole("option", { name: "cattledog" })).toBeInTheDocument()

  // choose the cattledog option
  userEvent.selectOptions(select, "cattledog")
  expect(select).toHaveValue("cattledog")

  // click on the search button
  userEvent.click(screen.getByRole("button", { name: "Search" }))

  // make sure that loading what added and removed to the DOM
  /* we need to use queryBy* here because the el won't be immediately available */
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))

  // check that dog images exist
  const dogImages = screen.getAllByRole("img")

  // has a length of two
  expect(dogImages).toHaveLength(2)

  // each image tag has an alternate text with the expected text
  expect(dogImages[0]).toHaveAccessibleName("cattledog 1 of 2")
  expect(dogImages[1]).toHaveAccessibleName("cattledog 2 of 2")
})
