import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLoggedInUsersFollowsPageComponent } from './manage-logged-in-users-follows-page.component';

describe('ManageLoggedInUsersFollowsPageComponent', () => {
  let component: ManageLoggedInUsersFollowsPageComponent;
  let fixture: ComponentFixture<ManageLoggedInUsersFollowsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageLoggedInUsersFollowsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLoggedInUsersFollowsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
