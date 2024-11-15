import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  IResponseAuth,
  IErrorAuth,
} from 'src/app/models/login/login.inferface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class loginComponent {

  constructor(
    private AuthService: AuthService,
     private router: Router,
     private toastr: ToastrService
     ) { }

  /** Establecemos geters para poderlos ocupar en html y tener un codigo mas limpio **/
  get email() {
    return this.credential.get('email') as FormControl;
  }
  get password() {
    return this.credential.get('password') as FormControl;
  }

  /** Declaramos un objeto en forma de formGroup **/
  credential = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]), // establecemos valor por defecto y reglas de validacion para cada campo
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  errorHttp = '';

  ShowSuccess() {
    this.toastr.success(
      '',
      'Bienvenido a BURGER QUEEN!',
      {
        easing: 'ease-in',
        easeTime: 1000,
      }
    );
  }

  public login() {
    console.log(this.credential.value);
    this.AuthService.auth('/login', this.credential.value) //esto restorna un observable
      .subscribe({
        // Nos subscribimos al observable
        next: (data: IResponseAuth) => {
          // codigo correcto
          sessionStorage.setItem('userToken', data.accessToken);
          sessionStorage.setItem('userRole', data.user.role);
          sessionStorage.setItem('userMail', data.user.email);
          sessionStorage.setItem('userId', data.user.id.toString());
        },
        error: (err: IErrorAuth) => {
          console.log('error', err); // gestion de errores
          err.error === 'Cannot find user'
            ? (this.errorHttp =
              'Usuario no autorizado, contacta al administrador')
            : err.error === 'Incorrect password'
              ? (this.errorHttp =
                'Contraseña incorrecta, verifica tus credenciales')
              : (this.errorHttp =
                'Error desconocido, vuelve a intentar o contacta al administrador');
          console.error(err);
        },
        complete: () => {
          this.ShowSuccess();
        setTimeout(() => {
          let user = sessionStorage.getItem('userRole');
          if (user) {
            this.router.navigate([`/nav/${user}`]);
          } // navegacion
        }, 1000);
       
        },
      });
  }
}
