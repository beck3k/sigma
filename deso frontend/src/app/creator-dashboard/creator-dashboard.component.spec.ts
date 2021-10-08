import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatorDashboardComponent } from './creator-dashboard.component';

describe('CreatorDashboardComponent', () => {
  let component: CreatorDashboardComponent;
  let fixture: ComponentFixture<CreatorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatorDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
