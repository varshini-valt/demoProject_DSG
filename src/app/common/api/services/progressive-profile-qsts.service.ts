import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { UuidServiceService } from './uuid-service'
import { mockPPQuestionsResponse } from '../../json/mock-questions'

@Injectable({
  providedIn: 'root'
})
export class ProgressiveProfileQuestionsService {
  serviceQuestions: any
  ppQuestionsObject = new BehaviorSubject({})
  ppQuestionsData = this.ppQuestionsObject.asObservable()

  constructor (
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private uuid: UuidServiceService
  ) {}

  private getProgressiveProfileQstns (country: string, language: string, officeId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Correlation-ID': this.uuid.uuidv4(),
      'Source-App': 'WIR QR',
      Authorization: this.uuid.uuidv4()
    })

    const params = new HttpParams().set('lang', language).set('country', country).set('office_id', officeId)
    const endpoint = environment.getProgressiveProfileQuestionsApi

    return this.http.get(endpoint, { headers, params }).pipe(map(result => result))
  }

  getPPqstns (): Observable<any> {
    const country = this.cookieService.get('country')
    const language = localStorage.getItem('languageSelected') || 'EN'
    const officeId = this.cookieService.get('officeId')

    if (!officeId || !country) {
      if (environment.demoMode) {
        return this.getMockPPqstns()
      }
      this.router.navigateByUrl('/error')
      return new Observable()
    }

    if (environment.demoMode) {
      return this.getMockPPqstns()
    }

    return this.getProgressiveProfileQstns(country, language, officeId).pipe(
      tap((ppQuestions: any) => {
        this.ppQuestionsObject.next(ppQuestions)

        this.cookieService.delete('wirCounsellorTeam')
        const wirCounsellorTeam = ppQuestions.wir_counsellor_team
        this.cookieService.set('wirCounsellorTeam', wirCounsellorTeam)

        this.serviceQuestions = ppQuestions
      }),
      catchError((error) => {
        console.error(error)
        this.router.navigateByUrl('/error')
        return throwError(() => error)
      })
    )
  }

  private getMockPPqstns (): Observable<any> {
    const ppQuestions = mockPPQuestionsResponse
    this.ppQuestionsObject.next(ppQuestions)
    this.cookieService.delete('wirCounsellorTeam')
    this.cookieService.set('wirCounsellorTeam', ppQuestions.wir_counsellor_team)
    this.serviceQuestions = ppQuestions
    return of(ppQuestions)
  }
}
