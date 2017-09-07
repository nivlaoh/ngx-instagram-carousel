import { Component, ElementRef, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
	config = {};
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
	}

	ngOnInit() {
		this.getPublicHashtags();
		this.isActualDay = this.eventIsLive(new Date());

		IntervalObservable.create(10000)
			.takeWhile(() => this.isAlive)
			.subscribe(() => {
				this.isActualDay = this.eventIsLive(new Date());
				if (this.isActualDay)
					this.getPublicHashtags()
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

	getPublicHashtags() {
		this.instaService.getInstagramPostsByHashtags(environment.hashtag).subscribe(r => {
			console.log(r);
			if (typeof this.images === 'undefined') {
				this.images = r.tag.top_posts.nodes;
			} else {
				const loadedPics: any[] = r.tag.top_posts.nodes;
				const newImages = loadedPics.filter(t => {
					return this.images.findIndex(i => i.id === t.id) === -1;
				});
				if (newImages.length > 0)
					this.images = [...newImages, ...this.images];
				console.log(this.images.length);
			}
			const hasNextPage: boolean = r.tag.media.page_info.has_next_page;
			const cursor: string = r.tag.media.page_info.end_cursor;
		});
	}

	trackPost(index: number, item: any) {
		return item.id;
	}

	sanitizeUrl(url: string) {
		const c = this.domSanitizer.sanitize(SecurityContext.STYLE, url);
		return c;
	}

	fullscreen() {
		if (document.webkitFullscreenElement) {
			document.webkitCancelFullScreen();
			this.isFullscreen = false;
		} else {
			if (this.slideshow.nativeElement.requestFullscreen) {
				this.slideshow.nativeElement.requestFullscreen();
			} else {
				this.slideshow.nativeElement.webkitRequestFullScreen();
			}
			this.isFullscreen = true;
		}
	}
}
