import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService) { }

  ngOnInit(): void {
  }

}
