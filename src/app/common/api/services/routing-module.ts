import { Injectable } from '@angular/core'
import { CanActivate } from '@angular/router'

@Injectable({
  providedIn: 'root'
})

export class CanActivateRouteModule implements CanActivate {
  canActivate (): boolean {
    if (sessionStorage.getItem('previousURL') === 'thankyou') {
      return false
    } else {
      return true
    }
  }
}
