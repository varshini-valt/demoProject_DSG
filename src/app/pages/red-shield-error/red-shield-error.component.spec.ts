import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RedShieldErrorComponent } from './red-shield-error.component'

describe('RedShieldErrorComponent', () => {
  let component: RedShieldErrorComponent
  let fixture: ComponentFixture<RedShieldErrorComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // declarations: [ RedShieldErrorComponent ]
    })
      .compileComponents()

    fixture = TestBed.createComponent(RedShieldErrorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
