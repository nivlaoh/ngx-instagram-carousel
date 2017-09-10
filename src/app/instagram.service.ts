import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { environment } from '../environments/environment';

@Injectable()
export class InstagramService {

	constructor(private http: Http) { }

	getInstagramPostsByHashtags(tag: string, maxId: string = null) {
		const url = maxId === null ? `${environment.baseUrl}/instagram?tag=${tag}` : `${environment.baseUrl}/instagram?tag=${tag}&max_id=${maxId}`
		return this.http.get(url)
			.map(data => data.json())
			.catch(this.handleError);
	}

	handleError(e: any, p2: any) {
		console.error(e);
		return Observable.throw(e);
	}

}
