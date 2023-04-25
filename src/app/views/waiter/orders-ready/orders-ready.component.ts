import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { HttpsService } from 'src/app/services/https.service';
import { IResponseOrder } from 'src/app/models/views/chef.interface';
import { SwitchService } from 'src/app/services/switch.service';

@Component({
  selector: 'app-orders-ready',
  templateUrl: './orders-ready.component.html',
  styleUrls: ['./orders-ready.component.css'],
})
export class OrdersReadyComponent {
  @ViewChild('btnDeliver') btnDeliver!: ElementRef;
  @ViewChild('btnDelivered') btnDelivered!: ElementRef;

  public allOrders: IResponseOrder[] = [];
  public ordersView: IResponseOrder[] = [];

  constructor(
    private HttpsService: HttpsService,
    private renderer2: Renderer2
  ) {}

  public filterOrder(status: 'delivering' | 'delivered') {
    this.ordersView = this.allOrders.filter((order) => order.status === status);
  }

  public getOrders(): void {
    this.HttpsService.get('orders').subscribe({
      // Nos subscribimos al observable
      next: (data: IResponseOrder[]) => {
        // codigo correcto
        this.allOrders = data.filter((order) => order.status !== 'pending');
        this.filterOrder('delivering');
      },
      error: (err: object) => {
        console.log('error', err); // gestion de errores
      },
      complete: () => console.log('complete'), // codigo que se ejecuta al finalizar la subscripción
    });
  }

  public completeTimer(dataOrder: IResponseOrder) {
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
    const btnDeliver = this.btnDeliver.nativeElement;
    const btnDelivered = this.btnDelivered.nativeElement;

    if (button === 'delivering') {
      this.renderer2.setStyle(btnDeliver, 'backgroundColor', 'black');
      this.renderer2.setStyle(btnDelivered, 'backgroundColor', 'gray');
    } else {
      this.renderer2.setStyle(btnDeliver, 'backgroundColor', 'gray');
      this.renderer2.setStyle(btnDelivered, 'backgroundColor', 'black');
    }
  }

  ngOnInit(): void {
    this.getOrders();
  }
}