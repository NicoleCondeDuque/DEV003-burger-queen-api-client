import { Component } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { min } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { AuthService } from './auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class loginComponent {

  /** Establecemos geters para poderlos ocupar en html y tener un codigo mas limpio **/
  get email(){
    return this.credential.get('email') as FormControl
  }
  get password(){
    return this.credential.get('password') as FormControl
  }

  /** Declaramos un objeto en forma de formGroup **/
  credential = new FormGroup({
    'email': new FormControl('', [Validators.required, Validators.email]), // establecemos valor por defecto y reglas de validacion para cada campo
    'password': new FormControl('', [Validators.required, Validators.minLength(6)]),
  })

    constructor(private AuthService:AuthService) {

  }

  public login(){
    this.AuthService.get('http://localhost:8080/login', this.credential.value)
    .subscribe(result => {
      console.log(result)
    })
  }

}
