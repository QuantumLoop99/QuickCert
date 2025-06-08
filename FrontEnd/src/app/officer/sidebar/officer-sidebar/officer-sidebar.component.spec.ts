import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerSidebarComponent } from './officer-sidebar.component';

describe('OfficerSidebarComponent', () => {
  let component: OfficerSidebarComponent;
  let fixture: ComponentFixture<OfficerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
