import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/internal/Observable'

@Injectable({
  providedIn: 'root'
})
export class ApiHttpService {
  constructor (
    public http: HttpClient
  ) { }

  public get<T>(url: string, options?: any): Observable<T> {
    return this.http.get<T>(url, (options as Object))
  }

  public post<T>(url: string, data: any, options?: any): Observable<T> {
    return this.http.post<T>(url, data, (options as Object))
  }
}
