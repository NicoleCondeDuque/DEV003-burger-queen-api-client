import { Component } from '@angular/core';
import { HttpsService } from 'src/app/services/https.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})


export class NewComponent {
  constructor(
    private HttpsService: HttpsService,
    private toastr: ToastrService,
    private router: Router,
  ) { }


  get name() {
    return this.productForm.get('name') as FormControl;
  }

  get image() {
    return this.productForm.get('image') as FormControl;
  }

  get type() {
    return this.productForm.get('type') as FormControl;
  }

  get price() {
    return this.productForm.get('price') as FormControl;
  }


  productForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    //solicitar el required para url
    image: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required,Validators.minLength(1)]),

  })

  newProduct() {
    const data = this.productForm.value
    const productNew = {
      name: data.name,
      image: data.image,
      type: data.type,
      price: data.price,
      dateEntry: new Date()
    }
    this.HttpsService.post('products', productNew).subscribe({
      next: (response: any) => {
        console.log('respuesta', response);
      },
      error: (err: any) => {
        console.log('error', err);
      },
      complete: () => {
        console.log('complete')
        setTimeout(() => {
          this.router.navigate(['/nav/admin/products'])
        }, 3000);
      }
    })

  }





}
