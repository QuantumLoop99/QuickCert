import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackApplicationComponent } from './track-application.component';

describe('TrackApplicationComponent', () => {
  let component: TrackApplicationComponent;
  let fixture: ComponentFixture<TrackApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
