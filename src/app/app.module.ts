import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';
// import { SwiperModule } from 'angular2-useful-swiper';
import 'hammerjs';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarModule, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SWIPER_CONFIG, SwiperConfigInterface, SwiperModule } from 'ngx-swiper-wrapper';

import { AppComponent } from './app.component';
import { InstagramService } from './instagram.service';
import { SharedModule } from './shared/shared.module';
import { CounterComponent } from './counter/counter.component';

const DEFAULT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true
};

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

@NgModule({
  declarations: [
    AppComponent,
    CounterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    JsonpModule,
    SharedModule,
    PerfectScrollbarModule,
    SwiperModule
  ],
  providers: [InstagramService, {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_SCROLLBAR_CONFIG
  }, {
    provide: SWIPER_CONFIG,
    useValue: DEFAULT_SWIPER_CONFIG
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
