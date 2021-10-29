import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.scss']
})
export class FollowingComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  targetUsername
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.targetUsername = params.username;
      console.log(this.targetUsername);
    })
  }

}
