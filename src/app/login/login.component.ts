import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const user = {id:this.loginForm.value.email, 
                    password: this.loginForm.value.password};
      

      this.http.post('http://localhost:4000/login', user)
        .subscribe(
          (response) => {
            console.log('Respuesta exitosa:', response);
          },
          (error) => {
            console.error('Error en la solicitud:', error);
          }
        );
    }
  }
}
