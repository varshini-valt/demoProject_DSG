import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class UserInputService {
  private formData: { [key: string]: any } = {}

  setValue (key: string, value: any): void {
    if (key === 'first_name' || key === 'last_name' ||
        key === 'primary_mobile_number' || key === 'primary_email' ||
        key === 'dialCode' || key === 'marketing_acceptance_flag' ||
      key === 'date_of_birth') {
      this.formData[key] = { option_value: value, option_label: value }
    } else {
      this.formData[key] = value
    }
  }

  getValue (key: string): any {
    return this.formData[key]
  }

  getAllValues (): { [key: string]: any } {
    return { ...this.formData }
  }

  deleteValue (field: string): void {
    delete this.formData[field]
  }

  clearAll (): void {
    const demoEmail = this.formData['demo_registered_email']
    const demoPassword = this.formData['demo_registered_password']
    const snapshot = { ...this.formData }
    this.formData = {}
    if (demoEmail !== undefined) {
      this.formData['demo_registered_email'] = demoEmail
      this.formData['demo_registered_password'] = demoPassword
      this.formData['demo_form_snapshot'] = snapshot
    }
  }

  restoreSnapshot (): void {
    const snapshot = this.formData['demo_form_snapshot']
    if (snapshot) {
      const demoEmail = this.formData['demo_registered_email']
      const demoPassword = this.formData['demo_registered_password']
      this.formData = { ...snapshot }
      this.formData['demo_registered_email'] = demoEmail
      this.formData['demo_registered_password'] = demoPassword
      delete this.formData['demo_form_snapshot']
      delete this.formData['cp_call_done']
    }
  }
}
