import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { HttpClient } from '@angular/common/http';
import { Router , NavigationExtras} from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service';

@Component({
  selector: 'app-creator-dashboard',
  templateUrl: './creator-dashboard.component.html',
  styleUrls: ['./creator-dashboard.component.scss']
})
export class CreatorDashboardComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService, private http: HttpClient, private router: Router, private route: ActivatedRoute, private backendApi: BackendApiService) { }
  streamKey
  streamerUsername
  streamTitle
  streamDescription
  streamCategory
  streamFlairs
  streamerProfile
  categories
  // deny access if they dont have appropriate permissions
  // add price component // add go to creator dashboard on that componet
  ngOnInit(): void {
    this.globalVars._updateDeSoExchangeRate()
    this.route.paramMap.subscribe(params => {
      this.streamerUsername = params.get("username")
      this.getCategories()
      this.getStreamKey()
    })
  }

  getCategories() {
    this.http.get('http://149.159.16.161:3123/categories').subscribe((data: {categories})=>this.categories=data.categories)
  }

  goBackToChannel() {
    this.router.navigate([`/${this.globalVars.loggedInUser.ProfileEntryResponse.Username}`])
  }

  updateStreamInfo() {
    this.http.post(`http://149.159.16.161:3123/stream/${this.streamerProfile.PublicKeyBase58Check}/info`, {
      category: this.streamCategory,
      title: this.streamTitle,
      description: this.streamDescription
    }).subscribe((data)=>{console.log(data)})
    console.log(this.streamTitle, this.streamDescription, this.streamCategory)
  }

  getStreamKey() {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.streamerUsername).subscribe(
      (res) => {
        this.streamerProfile = res.Profile;
        // use logged in user information to avoid server side auth
        console.log(`http://149.159.16.161:3123/private/stream/${this.streamerProfile.PublicKeyBase58Check}`)
        this.http.get(`http://149.159.16.161:3123/private/stream/${this.streamerProfile.PublicKeyBase58Check}`).subscribe((data: {stream: {streamKey, _doc: {category, title, description}}})=>{
          console.log(data)
          this.streamCategory = data.stream._doc.category
          this.streamDescription = data.stream._doc.description
          this.streamTitle = data.stream._doc.title

          this.streamKey = data.stream.streamKey})})}

  resetStreamKey() {
    this.http.post("http://149.159.16.161:3123/stream", { username: this.globalVars.loggedInUser.ProfileEntryResponse.Username, publicKey: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data: {streamKey}) => {
    console.log(data)  
    this.streamKey=data.streamKey
  console.log(this.streamKey)})
    }

  backToSigma() {
    this.router.navigate(['/'])
  }

}
