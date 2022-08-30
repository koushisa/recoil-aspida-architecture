import axios from 'axios'

export const HOST = 'http://localhost:3000'

export const http = axios.create({
  baseURL: HOST,
})

function delay(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, time)
  })
}

http.interceptors.response.use(
  async (response) => {
    await delay(300)

    return response
  },
  async (error) => {
    await delay(300)

    return Promise.reject(error)
  }
)
