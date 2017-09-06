import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit {
	@Input()
	count: number = 100;

	digits: number[];

	constructor() {
		this.digits = [];
	}

	ngOnInit() {
		let counter: number = this.count;
		do {
			this.digits.unshift(counter % 10);
			counter = Math.floor(counter / 10);
		} while (counter > 0);
	}

}
