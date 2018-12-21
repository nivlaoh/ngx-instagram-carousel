import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../environments/environment';

@Injectable()
export class InstagramService {

	constructor(private http: HttpClient) { }

	getInstagramPostsByHashtags(tags: string[], maxId: string = null) {
		const urls = tags.map(tag => maxId === null
			? `${environment.baseUrl}/instagram?tag=${tag}`
			: `${environment.baseUrl}/instagram?tag=${tag}&max_id=${maxId}`);
		const obs = urls.map(url => this.http.get(url));
		return forkJoin(obs);
	}

	handleError(e: any) {
		console.error(e);
		return Observable.throw(e);
	}

}
