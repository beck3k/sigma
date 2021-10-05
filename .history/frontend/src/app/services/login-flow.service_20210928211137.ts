import { Injectable } from '@angular/core';
import { HttpParams } from "@angular/common/http";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class LoginFlowService {

  constructor() { }

  IdentityUsersKey = "identityUsers";

  // whether we are using test or mainnet
  isTestnet = false;
  // used to store user data
  identityServiceUsers
  // used to store users public key
  identityServicePublicKeyAdded
  // url for identity service
  identityServiceURL: string = 'https://identity.deso.org';
  sanitizedIdentityServiceURL;

  // for defining the popup window for login flow
  private identityWindow;
  private identityWindowSubject;

  launchIdentityFlow(event: string): void {
    console.log("launchidentity")
    this.launch("/log-in", { referralCode: localStorage.getItem("referralCode") }).subscribe((res) => {
      this.setIdentityServiceUsers(res.users, res.publicKeyAdded);
    });
  }

  setIdentityServiceUsers(users: any, publicKeyAdded?: string) {
    this.SetStorage(this.IdentityUsersKey, users);
    this.identityServiceUsers = users;
    this.identityServicePublicKeyAdded = publicKeyAdded;
  }

  SetStorage(key: string, value: any) {
    localStorage.setItem(key, value ? JSON.stringify(value) : "");
  }

    // Launch a new identity window

  launch(
      path?: string,
      params?: { publicKey?: string; tx?: string; referralCode?: string; public_key?: string }
    ){
      let url = this.identityServiceURL as string;
      if (path) {
        url += path;
        console.log(url)
      }
  
      let httpParams = new HttpParams();
      if (this.isTestnet) {
        httpParams = httpParams.append("testnet", "true");
      }
  
      if (params?.publicKey) {
        httpParams = httpParams.append("publicKey", params.publicKey);
      }
  
      if (params?.tx) {
        httpParams = httpParams.append("tx", params.tx);
      }
  
      if (params?.referralCode) {
        httpParams = httpParams.append("referralCode", params.referralCode);
      }
  
      if (params?.public_key) {
        httpParams = httpParams.append("public_key", params.public_key);
      }
  
      const paramsStr = httpParams.toString();
      if (paramsStr) {
        url += `?${paramsStr}`;
      }
  
      // center the window
      const h = 1000;
      const w = 800;
      const y = window.outerHeight / 2 + window.screenY - h / 2;
      const x = window.outerWidth / 2 + window.screenX - w / 2;
  
      this.identityWindow = window.open(url, null, `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`);
      this.identityWindowSubject = new Subject();
  
      return this.identityWindowSubject;
    }

    launchLoginFlow() {
      this.launchIdentityFlow("login");
      console.log("login")
    }
  
    launchSignupFlow() {
      this.launchIdentityFlow("create");
    }
}
