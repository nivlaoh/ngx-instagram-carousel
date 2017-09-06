import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import { environment } from '../environments/environment';

@Injectable()
export class InstagramService {

	constructor(private http: Http) { }

	getInstagramPostsByHashtags(tag: string, maxId: string = null) {
		const url = maxId === null ? `https://www.instagram.com/explore/tags/${tag}/?__a=1` : `https://www.instagram.com/explore/tags/${tag}/?__a=1&max_id=${maxId}`
		return this.http.get(url)
			.map(data => data.json())
			.catch(this.handleError);
	}

	handleError(e: any, p2: any) {
		console.error(e);
		return Observable.throw(e);
	}

}
