import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service';
import { GlobalVarsService } from '../global-vars.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from '../app-routing.module';


@Component({
  selector: 'app-user-followers',
  templateUrl: './user-followers.component.html',
  styleUrls: ['./user-followers.component.scss']
})
export class UserFollowersComponent implements OnInit {
  AppRoutingModule = AppRoutingModule;
  loadingFirstPage
  constructor(private route: ActivatedRoute, private backendApi: BackendApiService, private globalVars: GlobalVarsService, private http: HttpClient) { }
  targetUsername
  targetProfile
  targetPublicKey
  appData = this.globalVars

  ngOnInit(): void {
    this.loadingFirstPage = true
      this.targetPublicKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
      this.backendApi.GetSingleProfile(this.globalVars.localNode, this.targetPublicKey, "").subscribe((data) => {
        this.targetProfile = data.Profile
        this.targetUsername = this.targetProfile.Username
        this.getFollowersProfiles()
      })
  }

  onAccountChange() {
    // this.getFollowersProfiles()
  }

  followersPublicKeys
  followersProfiles = []
  followersCount

  async getFollowersProfiles() {
    console.log(this.targetUsername, this.targetProfile, this.targetPublicKey)
    this.followersPublicKeys = await this.http.get(`${environment.apiURL}/followers`, { headers: { 'publickeybase58check': this.targetPublicKey } }).toPromise()
    console.log(this.followersPublicKeys)
    this.followersPublicKeys = this.followersPublicKeys.followers
    this.followersCount = this.followersPublicKeys.length
    console.log(this.followersPublicKeys)

    for (let i = 0; i < this.followersPublicKeys.length && i < 20; i++) {
      try {
        let data = await this.backendApi.GetSingleProfile(this.globalVars.localNode, this.followersPublicKeys[i], "").toPromise()
        this.followersProfiles.splice(i, 0, data.Profile)
        data = await this.backendApi.GetSingleProfilePicture(this.globalVars.localNode, this.followersPublicKeys[i], "").toPromise()
        this._readImageFileToProfilePicInput(data, i)
      } catch (error) {
        this.followersProfiles.splice(i, 0, { PublicKeyBase58Check: this.followersPublicKeys[i] })
        console.log(this.followersPublicKeys[i])
      }

      console.log(this.followersProfiles[i])
      this.loadingFirstPage = false
    }

    console.log(this.followersProfiles)
  }

  _readImageFileToProfilePicInput(file: Blob | File, i) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => {
      const base64Image = btoa(event.target.result);
      this.followersProfiles[i].ProfilePicture = `data:${file.type};base64,${base64Image}`;
      console.log(this.followersProfiles[i].ProfilePicture)
    };
  }

}


