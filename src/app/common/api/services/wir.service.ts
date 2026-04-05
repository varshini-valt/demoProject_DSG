import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { map, delay } from 'rxjs/operators'
import { environment } from '../../../../environments/environment'
import { ApiHttpService } from '../providers/api-http.service'
import { CookieService } from 'ngx-cookie-service'
import { UuidServiceService } from './uuid-service'
import { UserInputService } from './user-input.service'
import { BehaviorSubject, of } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class WIRService extends ApiHttpService {
  public socialSignout = new BehaviorSubject<boolean>(false)
  jwtTokenFromCookies: any
  constructor (
    public override http: HttpClient,
    public cookieService: CookieService,
    public uuid: UuidServiceService,
    private userInputService: UserInputService
  ) {
    super(http)
  }

  isUserAlreadyExist (email: any, language: any): any {
    if (environment.demoMode) {
      return of({ student_already_exists: false }).pipe(delay(300))
    }
    const countryCode = this.cookieService.get('countrycode')
    const wirCounsellorTeam = this.cookieService.get('wirCounsellorTeam')
    this.jwtTokenFromCookies = this.cookieService.get('jwtToken') || undefined
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Source-App': 'WIR QR',
        Authorization: this.jwtTokenFromCookies,
        'X-Correlation-ID': this.uuid.uuidv4()
      }),
      params: new HttpParams({
        fromString: 'studentEmail=' + email + '&lang=' + language + '&staff_office_country=' + countryCode + '&counsellor_mode=' + 'In-Person' + '&staff_office_team=' + wirCounsellorTeam + '&counsellorEmail=' + ''
      })
    }
    const endpoint = environment.isUserExistAPI
    return this.get(endpoint, options).pipe(map((result) => {
      return result
    }))
  }

  studentExistInCognito (email: any): any {
    if (environment.demoMode) {
      const storedEmail = this.userInputService.getValue('demo_registered_email')
      const exists = storedEmail === email
      return of({ is_exists: exists }).pipe(delay(300))
    }
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Correlation-ID': this.uuid.uuidv4(),
        'Source-App': 'WIR QR',
        Authorization: this.uuid.uuidv4()
      }),
      params: new HttpParams({
        fromString: 'email=' + email
      })
    }
    const endpoint = environment.studentExistInCognito
    return this.get(endpoint, options).pipe(map((result) => {
      return result
    }))
  }

  userRegistrationForm (userDetail: any): any {
    if (environment.demoMode) {
      console.log('Demo mode - registration payload:', userDetail)
      return of({ success: true, message: 'Registration successful (demo)' }).pipe(delay(500))
    }
    this.jwtTokenFromCookies = this.cookieService.get('jwtToken') || undefined
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Source-App': 'WIR QR',
        Authorization: this.jwtTokenFromCookies,
        'X-Correlation-ID': this.uuid.uuidv4()
      })
    }
    const endpoint = environment.postPPRegistration
    return this.post(endpoint, userDetail, options).pipe(map((result) => {
      return result
    }))
  }
}
