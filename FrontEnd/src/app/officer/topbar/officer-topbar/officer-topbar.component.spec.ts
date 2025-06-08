import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerTopbarComponent } from './officer-topbar.component';

describe('OfficerTopbarComponent', () => {
  let component: OfficerTopbarComponent;
  let fixture: ComponentFixture<OfficerTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerTopbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficerTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
