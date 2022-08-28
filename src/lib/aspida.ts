import axiosClient from '@aspida/axios'
import api from 'api/$api'
import { http } from '@/lib/http'

export const aspida = api(axiosClient(http))
