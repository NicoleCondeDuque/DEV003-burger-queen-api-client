import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { IResponseOrder } from 'src/app/models/views/chef.interface';
import { HttpsService } from 'src/app/services/https.service';
import { SwitchService } from 'src/app/services/switch.service';
import { ToastrService } from 'ngx-toastr';
import { NavComponent } from '../../nav.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent {
  @ViewChild('btnPending') btnPending!: ElementRef;
  @ViewChild('btnComplete') btnComplete!: ElementRef;

  public dataOrders: IResponseOrder[] = []; // generamos un array que modidifcaremos con la data que recibamos del servidor
  public orderFilter: IResponseOrder[] = [];

  public modalSwitch: boolean = false;

  constructor(
    private HttpsService: HttpsService,
    public switchS: SwitchService,
    private renderer2: Renderer2,
    private toastr: ToastrService,
    private navComponent: NavComponent
  ) {}

  public filterOrder(status: 'delivering' | 'pending') {
    this.orderFilter = this.dataOrders.filter(
      (order) => order.status === status
    );
  }

  private getOrders(): void {
    this.HttpsService.get('orders').subscribe({
      next: (response: IResponseOrder[]) => {
        this.dataOrders = response.sort(
          (a, b) =>
            new Date(a.dateEntry).getTime() - new Date(b.dateEntry).getTime()
        );
        this.filterOrder('pending');
      },
      error: (err: any) => {
        console.log('error', err); // gestion de errores
        if (err.status === 401) {
          this.navComponent.logout('success');
        }
      },
      complete: () => {
        console.log('complete'); // codigo correcto
      },
    });
  }

  public finishOrder(data: IResponseOrder): void {
    const dataFinish = {
      id: data.id,
      userId: data.userId,
      client: data.client,
      products: data.products,
      status: data.status,
      dateEntry: data.dateEntry,
    };
    setTimeout(() => {
      this.switchS.$dataOrder.emit(dataFinish);
    }, 1);
  }

  public openModal(data: IResponseOrder) {
    this.modalSwitch = true;
    this.finishOrder(data);
  }

  ShowSuccess() {
    this.toastr.success('se envia al mesero.', 'Orden completada!', {
      easing: 'ease-in',
      easeTime: 500,
    });
  }

  public completeOrder(id: number) {
    // funcion que marca el pedido como ccompletado
    const bodyHttp = {
      dateProcessed: new Date(),
      status: 'delivering',
    };
    this.HttpsService.patch('orders' + '/' + id, bodyHttp).subscribe({
      next: (response: any) => {
        console.log('respuesta', response);
      },
      error: (err: any) => {
        console.log('error', err); // gestion de errores
        if (err.status === 401) {
          this.navComponent.logout('success');
        }
      },
      complete: () => {
        this.getOrders();
        this.ShowSuccess();
        console.log('complete'); // codigo correcto
      },
    });
  }

  public kitchenTimer(dataOrder: IResponseOrder) {
    let timeGralSeconds =
      (new Date(dataOrder.dateProcessed).getTime() -
        new Date(dataOrder.dateEntry).getTime()) /
      1000;

    let timerInSeconds = parseInt(timeGralSeconds.toString()).toString();
    let seconds = timerInSeconds.substring(
      timerInSeconds.length - 2,
      timerInSeconds.length
    );
    if (seconds.length !== 1) {
      if (Number(seconds) >= 60) {
        seconds = (Number(seconds) - 60).toString();
      }
    }

    let timerInMinutes = parseInt((timeGralSeconds / 60).toString()).toString();
    let minutes = timerInMinutes.substring(
      timerInMinutes.length - 2,
      timerInMinutes.length
    );
    if (minutes.length !== 1) {
      if (Number(minutes) >= 60) {
        minutes = (Number(minutes) - 60).toString();
      }
    }

    let hours = parseInt((timeGralSeconds / 60 / 60).toString()).toString();
    return `${hours}:${minutes}:${seconds}`;
  }

  public changeColor(button: string) {
    const btnPending = this.btnPending.nativeElement;
    const btnComplete = this.btnComplete.nativeElement;

    if (button === 'pendiente') {
      this.renderer2.setStyle(btnPending, 'backgroundColor', 'black');
      this.renderer2.setStyle(btnComplete, 'backgroundColor', 'gray');
    } else {
      this.renderer2.setStyle(btnPending, 'backgroundColor', 'gray');
      this.renderer2.setStyle(btnComplete, 'backgroundColor', 'black');
    }
  }

  ngOnInit(): void {
    this.getOrders();
    this.switchS.$switchModal.subscribe((res) => (this.modalSwitch = res));
  }
}
