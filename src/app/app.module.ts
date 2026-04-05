import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatSelectModule } from '@angular/material/select'
import { ThankYouComponent } from './pages/thank-you/thank-you.component'
import { SignInComponent } from './pages/sign-in/sign-in.component'
import { HeaderComponent } from './common/component/header/header.component'
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component'
import { HttpClientModule } from '@angular/common/http'
import { CommonModule, DatePipe } from '@angular/common'
import { MatInputModule } from '@angular/material/input'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { PersonalDetailsComponent } from './pages/Registration-Pages/personal-details/personal-details.component'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { OtherDetailsComponent } from './pages/Registration-Pages/other-details/other-details.component'
import { ReviewDetailsComponent } from './pages/Registration-Pages/review-details/review-details.component'
import { MatNativeDateModule } from '@angular/material/core'
import { SignUpNewComponent } from './pages/sign-up-new/sign-up-new.component'
import { QrSignInComponent } from './pages/qr-sign-in/qr-sign-in.component'
import { QrSignUpComponent } from './pages/qr-sign-up/qr-sign-up.component'
import { QrForgotPasswordComponent } from './pages/qr-forgot-password/qr-forgot-password.component'
import { Amplify, ResourcesConfig } from 'aws-amplify'
import { environment } from 'src/environments/environment'
import { RedShieldErrorComponent } from './pages/red-shield-error/red-shield-error.component'
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search'

const authConfig: ResourcesConfig['Auth'] = {
  Cognito: {
    userPoolId: environment.userPoolId,
    userPoolClientId: environment.userPoolWebClientId,
    userPoolEndpoint: environment.endpoint
  }
}

if (!environment.demoMode) {
  Amplify.configure({
    Auth: authConfig
  })
}

@NgModule({
  declarations: [
    AppComponent,
    ThankYouComponent,
    SignInComponent,
    HeaderComponent,
    PageNotFoundComponent,
    PersonalDetailsComponent,
    OtherDetailsComponent,
    ReviewDetailsComponent,
    SignUpNewComponent,
    QrSignInComponent,
    QrSignUpComponent,
    QrForgotPasswordComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSelectModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AppRoutingModule,
    RedShieldErrorComponent,
    NgxMatSelectSearchModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
