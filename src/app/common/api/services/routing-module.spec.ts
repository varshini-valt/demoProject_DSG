import { CanActivateRouteModule } from './routing-module'

describe('CanActivateRouteModule', () => {
  let guard: CanActivateRouteModule

  beforeEach(() => {
    guard = new CanActivateRouteModule()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  it('should return false if previousURL is "thankyou"', () => {
    sessionStorage.setItem('previousURL', 'thankyou')
    expect(guard.canActivate()).toBe(false)
  })

  it('should return true if previousURL is not "thankyou"', () => {
    sessionStorage.setItem('previousURL', 'home')
    expect(guard.canActivate()).toBe(true)
  })

  it('should return true if previousURL is not set', () => {
    expect(guard.canActivate()).toBe(true)
  })
})
