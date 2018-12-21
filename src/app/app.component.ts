import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperComponent, SwiperConfigInterface } from 'ngx-swiper-wrapper';
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
	title: string;
	pageToken: string = null;
	swiperConfig: SwiperConfigInterface = {
		autoplay: false,
		speed: 800,
		effect: 'fade',
		fadeEffect: { crossFade: true },
		loop: false,
		preloadImages: false,
		lazy: {
			loadPrevNext: true,
			loadOnTransitionStart: true
		},
		observer: true
	};
	isFullscreen: boolean;
	isActualDay: boolean;
	weddingDate: number[];
	errorCount = 0;
	capNumber = 500;
	currentFrame = 0;
	private isAlive: boolean;
	showDescription: boolean;

	constructor(private domSanitizer: DomSanitizer,
		private instaService: InstagramService) {
		this.isAlive = true;
		this.weddingDate = [];
		this.images = [];
	}

	ngOnInit() {
		this.isActualDay = true; // this.eventIsLive(new Date());
		this.title = environment.title;
		this.showDescription = environment.showDescription;
    this.getPublicHashtags(true);

    IntervalObservable.create(environment.refreshTiming)
      .takeWhile(() => this.isAlive || this.images.length >= this.capNumber)
      .subscribe(() => {
        if (this.isActualDay) {
          this.getPublicHashtags();
        }
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
		} else {
		  return false;
    }
	}

	getPublicHashtags(init: boolean = false) {
		// check if there's new posts
		console.log('Check new posts');
		this.instaService.getInstagramPostsByHashtags(environment.hashtags)
				.subscribe(r => this.processResponse(r, init), this.processError);

		if (!init && this.images.length - this.currentFrame <= environment.bufferBefore) {
			// continue from previous loaded ones
			console.log('Continue previously loaded');
			this.instaService.getInstagramPostsByHashtags(environment.hashtags, this.pageToken)
				.subscribe(r => this.processResponse(r), this.processError);
		}
	}

	processResponse(r: any, init: boolean = false) {
		console.log('see responses', r, init);
		this.errorCount = 0;

		r.forEach(posts => this.processPosts(posts, init, this.currentFrame));
	}

	processError(e) {
		console.error('error count', ++this.errorCount, e);
		if (this.errorCount >= 3) {
      this.isAlive = false;
    }
	}

	processPosts(r: any, init: boolean = false, currIndex) {
		// update page token only if not checking for 1st page updates
		if (r.graphql) {
			console.log('posts', r.graphql.hashtag);
			const media = r.graphql.hashtag.edge_hashtag_to_media;
			if (!init && media.page_info.has_next_page) {
				this.pageToken = media.page_info.end_cursor;
				console.log('update page token', this.pageToken);
			}

			if (this.images.length === 0) {
				this.images = media.edges;
				setTimeout(() => {
					this.swiper.config.loop = true;
					this.swiper.config.autoplay = {
						delay: environment.slideTiming,
						stopOnLastSlide: false,
						disableOnInteraction: false
					};
					this.swiper.directiveRef!!.update();
					this.swiper.directiveRef.startAutoplay();
				}, 0);
			} else {
				const loadedPics: any[] = media.edges;
				const newImages = loadedPics.filter(t => {
					return this.images.findIndex(i => i.node.id === t.node.id) === -1;
				});
				if (newImages.length > 0) {
					// this.images.splice.apply(this.images, [currIndex, 0].concat(newImages));
					console.log('Inserting ', newImages.length, 'images in at ', currIndex);
					this.images.splice(currIndex+1, 0, ...newImages);
					this.swiper!!.directiveRef!!.update();
				}
				console.log('Current Pic Frame:', currIndex + 1, 'of', this.images.length);
			}
		}
	}

	calculateNextLoad() {
		console.log('navigating to', this.currentFrame);
	}

	trackPost(index: number, item: any) {
		return item.node.id;
	}

	sanitizeUrl(url: string) {
		const c = this.domSanitizer.bypassSecurityTrustStyle(`url(${url})`);
		return c;
	}

	fullscreen() {
		if (this.isFullscreen) {
			if (document.exitFullscreen) { document.exitFullscreen(); }
			else if ((<any>document).mozCancelFullScreen) { (<any>document).mozCancelFullScreen(); }
			else if ((<any>document).webkitExitFullScreen) { (<any>document).webkitExitFullScreen(); }
			else if ((<any>document).webkitCancelFullScreen) { (<any>document).webkitCancelFullScreen(); }
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
