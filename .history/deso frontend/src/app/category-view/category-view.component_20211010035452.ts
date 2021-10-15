import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-category-view',
  templateUrl: './category-view.component.html',
  styleUrls: ['./category-view.component.scss']
})
export class CategoryViewComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) { }
  categoryID
  player
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryID = params.get("category")
      this.getCategoryStreams();
      if (this.player) {
        this.player.destroy()
      }
    })
  }

  getCategoryStreams() {
    this.http.get(`http://149.159.16.161:3123/category/${this.categoryID}`).subscribe((streams)=>{
      console.log(streams)
    }, (err)=> {
      console.log("error in fetching categories: ", err)
    })
  }

  onAccountChange(){
    
  }

}
