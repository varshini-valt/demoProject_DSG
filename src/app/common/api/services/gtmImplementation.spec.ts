import { TestBed } from '@angular/core/testing'
import { gtmImplementation } from './gtmImplementation'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { CookieService } from 'ngx-cookie-service'

jest.mock('crypto-js', () => ({
  SHA256: jest.fn(() => ({
    toString: jest.fn(() => 'mocked_sha256_hash')
  })),
  enc: { Hex: 'hex' }
}))

declare global {
  interface Window {
    dataLayer: any[]
  }
}

describe('gtmImplementation', () => {
  let service: gtmImplementation
  let userInputServiceMock: any
  let cookieServiceMock: any

  beforeEach(() => {
    userInputServiceMock = {
      getValue: jest.fn()
    }
    cookieServiceMock = {
      get: jest.fn().mockReturnValue('TEAM1')
    }

    TestBed.configureTestingModule({
      providers: [
        gtmImplementation,
        { provide: UserInputService, useValue: userInputServiceMock },
        { provide: CookieService, useValue: cookieServiceMock }
      ]
    })

    service = TestBed.inject(gtmImplementation)
    Object.defineProperty(window, 'dataLayer', { value: [], writable: true })
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.dataLayer.length = 0
  })

  it('should push correct event data when values exist (pageView)', () => {
    userInputServiceMock.getValue.mockImplementation((key: string) => {
      const values: any = {
        preferredCountryCode: { option_label: 'United States' },
        preferredStudyLevel: { option_label: 'Bachelor Level' },
        studyPlanTimeline: { option_label: 'Now' },
        primary_email: { option_label: 'test@example.com' }
      }
      return values[key]
    })

    service.pageView('TestPage', 'signed_in_user', 'user_registration')

    expect(window.dataLayer.length).toBe(1)
    expect(window.dataLayer[0]).toEqual(expect.objectContaining({
      event: 'pageview',
      destination_country: 'united_states',
      study_level: 'bachelor_level',
      intake_year: 'now',
      pagename: 'TestPage',
      user_id: 'mocked_sha256_hash',
      feature: 'user_registration',
      office_id: 'team1',
      office_location: 'na',
      user_login_status: 'signed_in_user'
    }))
  })

  it('should push event with default values when data is missing (pageView)', () => {
    userInputServiceMock.getValue.mockReturnValue(undefined)

    service.pageView('MissingDataPage', 'signed_in_user', 'na')

    expect(window.dataLayer[0]).toEqual(expect.objectContaining({
      destination_country: 'na',
      study_level: 'na',
      intake_year: 'na',
      user_id: 'mocked_sha256_hash'
    }))
  })

  it('should initialize dataLayer when not defined (trackKPI)', () => {
    delete (window as any).dataLayer
    userInputServiceMock.getValue.mockReturnValue(undefined)

    service.trackKPI('wir_signin_submit', 'signin', 'sign_in_button', 'user_signin', 'sign_in', 'anonymous_user')

    expect(window.dataLayer).toBeDefined()
    expect(window.dataLayer.length).toBe(1)
    expect(window.dataLayer[0]).toEqual(expect.objectContaining({
      event: 'Track_KPI',
      destination_country: 'na',
      intake_year: 'na',
      study_level: 'na',
      office_location: 'na',
      office_id: 'team1',
      user_login_status: 'anonymous_user',
      user_id: 'mocked_sha256_hash'
    }))
  })


  it('should push correct event data (trackEvents)', () => {
    userInputServiceMock.getValue.mockReturnValue(undefined)

    service.trackEvents('wir_other_details', 'next_button', 'next', 'other_details', 'signed_in_user', 'user_registration')

    expect(window.dataLayer.length).toBe(1)
    expect(window.dataLayer[0]).toEqual(expect.objectContaining({
      event: 'track_events',
      eventname: 'wir_other_details',
      event_label: 'next_button',
      event_action: 'next',
      pagename: 'other_details',
      user_login_status: 'signed_in_user',
      feature: 'user_registration',
      office_id: 'team1',
      user_id: 'mocked_sha256_hash'
    }))
  })

  it('should initialize dataLayer if undefined (trackEvents)', () => {
    delete (window as any).dataLayer
    userInputServiceMock.getValue.mockReturnValue(undefined)

    service.trackEvents('wir_other_details', 'next_button', 'next', 'other_details', 'signed_in_user', 'user_registration')

    expect(window.dataLayer).toBeDefined()
    expect(window.dataLayer.length).toBe(1)
    expect(window.dataLayer[0]).toEqual(expect.objectContaining({
      event: 'track_events',
      eventname: 'wir_other_details',
      event_label: 'next_button',
      event_action: 'next',
      pagename: 'other_details',
      user_login_status: 'signed_in_user',
      feature: 'user_registration',
      office_id: 'team1',
      user_id: 'mocked_sha256_hash'
    }))
  })
})
