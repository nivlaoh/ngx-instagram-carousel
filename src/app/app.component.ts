import { Component, ElementRef, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
//import { SwiperComponent } from 'angular2-useful-swiper';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
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
	@ViewChild('swiper') swiper: any;
	swiperInstance: any;
	config = {};
	title: string;
	hashtag: string;
	pageToken: string = null;
	bgStyleUrl: string;
	swiperConfig: SwiperConfigInterface = {
		autoplay: {
			delay: 6000,
			stopOnLast: false,
			disableOnInteraction: true
		},
		speed: 800,
		effect: 'fade',
		fadeEffect: { crossFade: true },
		loop: true,
		preloadImages: false,
		lazy: {
			loadPrevNext: true,
			loadOnTransitionStart: true
		}
	};
	isFullscreen: boolean;
	isActualDay: boolean;
	weddingDate: number[];
	playRemaining: number = 0;
	errorCount: number = 0;
	capNumber: number = 500;
	private isAlive: boolean;

	constructor(private domSanitizer: DomSanitizer,
		private instaService: InstagramService) {
		this.isAlive = true;
		this.weddingDate = [];
		this.images = [];
	}

	ngOnInit() {
		this.getPublicHashtags(true);
		this.isActualDay = true; //this.eventIsLive(new Date());
		this.hashtag = environment.hashtag;
		this.title = environment.title;

		IntervalObservable.create(10000)
			.takeWhile(() => this.isAlive || this.images.length >= this.capNumber)
			.subscribe(() => {
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
		// check new posts
		this.instaService.getInstagramPostsByHashtags(environment.hashtag)
			.subscribe(r => this.processPosts(r, true), e => {
				console.error('error count', ++this.errorCount);
				if (this.errorCount >= 3)
					this.isAlive = false;
			});
		// load more if needed
		if (this.playRemaining <= environment.bufferBefore) {
			this.instaService.getInstagramPostsByHashtags(environment.hashtag, this.pageToken).subscribe(r => this.processPosts(r));
		}
	}

	processPosts(r: any, init: boolean = false) {
		let currIndex = 0;
		this.errorCount = 0;

		if (typeof this.swiper !== 'undefined') {
			this.swiperInstance = this.swiper.directiveRef.swiper();
			currIndex = this.swiperInstance.activeIndex;
			this.playRemaining = this.images.length - (currIndex + 1);
		}

		console.log('posts', r, this.swiper);
		// update page token only if not checking for 1st page updates
		if (r.graphql) {
			const media = r.graphql.hashtag.edge_hashtag_to_media;
			if (!init && media.page_info.has_next_page) {
				this.pageToken = media.page_info.end_cursor;
				console.log('update page token', this.pageToken);
			}

			if (this.images.length === 0) {
				this.images = media.edges;
			} else {
				const loadedPics: any[] = media.edges;
				const newImages = loadedPics.filter(t => {
					return this.images.findIndex(i => i.node.id === t.node.id) === -1;
				});
				if (newImages.length > 0) {
					// this.images.splice.apply(this.images, [currIndex, 0].concat(newImages));
					this.images.splice(currIndex+1, 0, ...newImages);
				}
				console.log('Currently at:', currIndex, this.images.length);
			}
		}
	}

	trackPost(index: number, item: any) {
		return item.node.id;
	}

	sanitizeUrl(url: string) {
		const c = this.domSanitizer.bypassSecurityTrustStyle(`url(${url})`);
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
