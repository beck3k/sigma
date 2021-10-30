import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatorProfileTopCardStreamViewComponent } from './creator-profile-top-card-stream-view.component';

describe('CreatorProfileTopCardStreamViewComponent', () => {
  let component: CreatorProfileTopCardStreamViewComponent;
  let fixture: ComponentFixture<CreatorProfileTopCardStreamViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatorProfileTopCardStreamViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorProfileTopCardStreamViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
