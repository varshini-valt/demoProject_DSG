/*
  * ValidatorService
  * @author: Dinesh Kumar P
  * @project: WIR
  * @see: Service to provide validating methods
*/

import { Injectable } from '@angular/core'
@Injectable({
  providedIn: 'root'
})

export class ValidatorService {
  isDigit (value: any): any {
    return /^\d+$/.test(value)
  }

  isValidEmail (): any {
    return /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  }
}
