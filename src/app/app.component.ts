import { Component, ElementRef, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperComponent } from 'angular2-useful-swiper';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/takeWhile';

import { environment } from '../environments/environment';
import { InstagramService } from './instagram.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	images: any[];
	@ViewChild('slideshow') slideshow: ElementRef;
	@ViewChild('swiper') swiper: SwiperComponent;
	config = {};
	title: string;
	hashtag: string;
	pageToken: string = null;
	swiperConfig = {
		autoplay: 5000,
		speed: 800,
		autoplayDisableOnInteraction: true,
		effect: 'fade',
		fade: { crossFade: true },
		loop: true
	};
	isFullscreen: boolean;
	isActualDay: boolean;
	weddingDate: number[];
	private isAlive: boolean;

	constructor(private domSanitizer: DomSanitizer,
		private instaService: InstagramService) {
		this.isAlive = true;
		this.weddingDate = [];
		this.images = [];
	}

	ngOnInit() {
		this.getPublicHashtags(true);
		this.isActualDay = this.eventIsLive(new Date());
		this.hashtag = environment.hashtag;
		this.title = environment.title;

		IntervalObservable.create(10000)
			.takeWhile(() => this.isAlive)
			.subscribe(() => {
				this.isActualDay = true; // this.eventIsLive(new Date());
				if (this.isActualDay)
					this.getPublicHashtags();
			});
	}

	ngOnDestroy() {
		this.isAlive = false;
	}

	private eventIsLive(d: Date): boolean {
		this.weddingDate = environment.dateOfWedding;
		if (d.getFullYear() >= this.weddingDate[2] && d.getMonth() >= this.weddingDate[1]
			&& d.getDay() >= this.weddingDate[0]) {
			return true;
		} else return false;
	}

	getPublicHashtags(init: boolean = false) {
		let playRemaining = 0;
		let currIndex = 0;
		if (typeof this.swiper !== 'undefined') {
			currIndex = this.swiper.swiper.activeIndex;
			playRemaining = this.images.length - (currIndex + 1);
		}
		if (init || playRemaining <= environment.bufferBefore) {
			this.instaService.getInstagramPostsByHashtags(environment.hashtag, this.pageToken).subscribe(r => {
				console.log(r);
				// update page token
				if (r.tag.media.page_info.has_next_page) {
					this.pageToken = r.tag.media.page_info.end_cursor;
					// console.log('update page token', this.pageToken);
				}

				if (this.images.length === 0) {
					this.images = r.tag.media.nodes;
				} else {
					const loadedPics: any[] = r.tag.media.nodes;
					const newImages = loadedPics.filter(t => {
						return this.images.findIndex(i => i.id === t.id) === -1;
					});
					if (newImages.length > 0) {
						this.images.splice.apply(this.images, [currIndex, 0].concat(newImages));
					}
					console.log('Currently at:', currIndex, this.images.length);
				}
			});
		}
	}

	trackPost(index: number, item: any) {
		return item.id;
	}

	sanitizeUrl(url: string) {
		const c = this.domSanitizer.sanitize(SecurityContext.STYLE, url);
		return c;
	}

	sanitizeSrc(url: string) {
		const c = this.domSanitizer.sanitize(SecurityContext.URL, url);
		return c;
	}

	fullscreen() {
		if (this.isFullscreen) {
			if (document.exitFullscreen) { document.exitFullscreen(); }
			else if ((<any>document).mozCancelFullScreen) { (<any>document).mozCancelFullScreen(); }
			else if ((<any>document).webkitExitFullScreen) { (<any>document).webkitExitFullScreen(); }
			else if (document.webkitCancelFullScreen) { document.webkitCancelFullScreen(); }
			else if ((<any>document).msExitFullscreen) { (<any>document).msExitFullscreen(); }
			this.isFullscreen = false;
		} else {
			if (this.slideshow.nativeElement.requestFullscreen) {
				this.slideshow.nativeElement.requestFullscreen();
			} else if (this.slideshow.nativeElement.mozRequestFullScreen) {
				this.slideshow.nativeElement.mozRequestFullScreen();
			} else if (this.slideshow.nativeElement.webkitRequestFullScreen) {
				this.slideshow.nativeElement.webkitRequestFullScreen();
			} else if (this.slideshow.nativeElement.msRequestFullscreen) {
				this.slideshow.nativeElement.msRequestFullscreen();
			} else {
				console.log('Full screen not supported');
			}
			this.isFullscreen = true;
		}
	}
}
