import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service';
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-creator-dashboard',
  templateUrl: './creator-dashboard.component.html',
  styleUrls: ['./creator-dashboard.component.scss']
})
export class CreatorDashboardComponent implements OnInit {
  formSubmissionAlert = false

  constructor(public globalVars: GlobalVarsService, private http: HttpClient, private router: Router, private route: ActivatedRoute, private backendApi: BackendApiService) { }
  streamKey
  streamerUsername
  streamTitle
  streamDescription
  streamCategory
  streamFlairs
  streamerProfile
  categories
  streamerPublicKey
  // deny access if they dont have appropriate permissions
  // add price component // add go to creator dashboard on that componet
  ngOnInit(): void {
    this.globalVars._updateDeSoExchangeRate()
    // account for case when no username
    this.streamerPublicKey = this.globalVars.loggedInUser.PublicKeyBase58Check
    this.getStreamKey()
  }

  onAccountChange() {
    // fix this so info changes accordingly
    // this.streamerProfile = {}
    this.ngOnInit()
  }

  getCategories() {
    this.http.get(`${environment.apiURL}/categories`).subscribe((data: { categories }) => this.categories = data.categories)
  }
  
  closeFormSubmissionAlert() {
    this.formSubmissionAlert = false
  }
  updateStreamInfo() {
    this.backendApi.jwtPost(`${environment.apiURL}`, `/stream/info`, this.globalVars.loggedInUser.PublicKeyBase58Check, {
      PublicKeyBase58Check: this.globalVars.loggedInUser.PublicKeyBase58Check,
      category: this.streamCategory,
      title: this.streamTitle,
      description: this.streamDescription
    }).subscribe((data) => {this.formSubmissionAlert=true; console.log("form submitted");console.log(data)})
    console.log(this.streamTitle, this.streamDescription, this.streamCategory)
  }

  getStreamKey() {
    
    this.backendApi.GetSingleProfile(this.globalVars.localNode, this.streamerPublicKey, "").subscribe(
      (res) => {
        console.log(res)
        this.streamerProfile = res.Profile;
        console.log(this.streamerProfile)
        // use logged in user information to avoid server side auth
      })
      
      this.backendApi.jwtGet(`${environment.apiURL}`, `/private/stream`, this.globalVars.loggedInUser.PublicKeyBase58Check).subscribe((data: { stream: { streamKey, _doc: { category, title, description } } }) => {
          console.log(data)
          this.streamCategory = data.stream._doc.category
          this.streamDescription = data.stream._doc.description
          this.streamTitle = data.stream._doc.title

          this.streamKey = data.stream.streamKey
        })
      
      this.getCategories()
  }
  
  redirectToHomePage() {
    console.log("clicked")
    this.router.navigate(['/'])
  }

  resetStreamKey() {
    this.backendApi.jwtPost(`${environment.apiURL}`, '/stream', this.globalVars.loggedInUser.PublicKeyBase58Check,
      { username: this.globalVars.loggedInUser.ProfileEntryResponse.Username, PublicKeyBase58Check: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data: { streamKey }) => {
        console.log(data)
        this.streamKey = data.streamKey
        console.log(this.streamKey)
      })
  }

}
