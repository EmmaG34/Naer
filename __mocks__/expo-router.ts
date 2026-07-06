export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
}

export const useLocalSearchParams = jest.fn(() => ({}))
export const useRouter = jest.fn(() => router)
export const Link = 'Link'
export const Redirect = 'Redirect'
