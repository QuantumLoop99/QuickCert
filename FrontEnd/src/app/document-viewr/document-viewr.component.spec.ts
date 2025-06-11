import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViewrComponent } from './document-viewr.component';

describe('DocumentViewrComponent', () => {
  let component: DocumentViewrComponent;
  let fixture: ComponentFixture<DocumentViewrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentViewrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
