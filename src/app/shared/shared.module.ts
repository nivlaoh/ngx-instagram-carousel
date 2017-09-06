import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
  	CommonModule,
  	FlexLayoutModule,
  	MaterialModule
  ],
  declarations: []
})
export class SharedModule { }
