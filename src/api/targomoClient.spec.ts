import { TargomoClient } from './targomoClient'
import * as nock from 'nock'
import { TargomoEnvironment } from '../constants'

describe('TargomoClient client', () => {
  const testClient = new TargomoClient('germany', process.env.TGM_TEST_API_KEY)

  test('metadata request', async () => {
    const result = await testClient.metadata()
    expect(result).toBeDefined()
    expect(result.speeds).toBeDefined()
    expect(result.transit).toBeDefined()
    expect(result.general).toBeDefined()
  })
})

describe('Targomo Client Interceptor', () => {
  const environments = [TargomoEnvironment.REVIEW, TargomoEnvironment.STAGING, TargomoEnvironment.PROD]

  let scope

  beforeEach(() => {
    scope = nock('https://api.targomo.com', {
      reqheaders: {
        'x-targomo-environment': (value) => environments.includes(value as TargomoEnvironment),
      },
    })
      .get(/.+/)
      .reply(200, {
        message: 'ok',
      })
  })

  afterAll(() => {
    nock.restore()
  })

  test('should include environment header on every request donde to A-Team services', async () => {
    const testClient = new TargomoClient('germany', '1234', { environment: TargomoEnvironment.STAGING })
    await testClient.statistics.metadata(0)
    scope.done()
  })

  test('should include environment header when calling point of interests', async () => {
    const testClient = new TargomoClient('germany', '1234', { environment: TargomoEnvironment.REVIEW })
    await testClient.pois.reachabilitySummary('')
    scope.done()
  })
})
