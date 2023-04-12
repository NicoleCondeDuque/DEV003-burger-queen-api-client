import { Component } from '@angular/core';
import { ServiceAddToCarService } from 'src/app/services/service-add-to-car.service';
import { IProductToCar } from 'src/app/models/views/waiter.interface';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { HttpsService } from 'src/app/services/https.service';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})

export class CartComponent {
  public productsCart: IProductToCar[] = []
  public total:number = 0

  /** Declaramos un objeto en forma de formGroup **/
  client = new FormGroup({
    'name': new FormControl('', [Validators.required, Validators.minLength(2)]), // establecemos valor por defecto y reglas de validacion para cada campo
  })

  /**Definimos geters **/
  get name(){
    return this.client.get('name') as FormControl
  }

  private addToCart (newElement:IProductToCar):boolean {
    let add:boolean = true
    this.productsCart.forEach(element => { //validamos si ya existe el elemento
      if(element.product.id === newElement.product.id){
        element.qty ++
        add = false
      }
    })
    return add
  }

  public deleteProduct():void {
    this.productsCart = this.productsCart.filter((product) => product.qty > 0 )
  }

  public sumTotal():void {
    this.productsCart.length === 0
    ? this.total = 0
    : this.productsCart.length === 1
      ? this.total = this.productsCart[0].qty * this.productsCart[0].product.price
      : this.total = this.productsCart.reduce((accumulator, currentValue):any => accumulator + currentValue.product.price * currentValue.qty, 0)
  }
  
  public sendOrder () {
    console.log(this.name.value)
    const bodyHttp = {
      userId: Number(sessionStorage.getItem('userId')), 
      client: this.name.value,
      products: this.productsCart,
      status: 'pending',
      dataEntry: new Date().toLocaleString()
    }
    this.HttpsService.post('products', bodyHttp)
    .subscribe({  // Nos subscribimos al observable
      next: (data: any)=> { // codigo correcto
        console.log(data)
        this.productsCart = []
        this.total = 0
        this.client.reset()
      },
      error: (err: any)=> {
        console.log('error',err) // gestion de errores
      },
      complete:()=> {
        console.log('complete') // codigo correcto
      }
    })
  }
  
  constructor (
    private ServiceAdd: ServiceAddToCarService,
    private HttpsService: HttpsService
  ) {}

  ngOnInit():void {
    this.ServiceAdd.activatorAddToCart
      .subscribe(data => {
        if (this.addToCart(data)) { //si es true podemos hacer push
          this.productsCart.push(data)
        }
        this.sumTotal()
      })
  }
}
