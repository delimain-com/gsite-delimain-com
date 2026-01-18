import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import _ from 'lodash';
import {map} from 'rxjs/operators';
import {SiteInfoService} from "../site-info/site-info.service";
import {SessionService} from "../session/session.service";
import {environment} from "../../../environments/environment";

@Injectable({
	providedIn: 'root'
})
export class ImageUtilService {

	public siteInfo: SiteInfoService = inject(SiteInfoService);
	public session: SessionService = inject(SessionService);

	public $domain = this.siteInfo.$domain;
	public $session = this.session.$session;

	private apiEndpoint = environment.napi.endpoint;

	private http: HttpClient = inject(HttpClient);

	constructor() {
	}

	ext(type: string): string {
		if (type === 'image/jpeg' || type === 'image/jpg') {
			return '.jpg';
		} else if (type === 'image/png') {
			return '.png';
		} else if (type === 'image/gif') {
			return '.gif';
		} else if (type === 'image/webp') {
			return '.webp';
		} else {
			return '';
		}
	}

	/**
	 *
	 * @param params
	 * @param params.file
	 * @param params.path
	 */
	upload(params: any = {}): Observable<any> {
		const file = params.file;
		const path = params.path;
		const formData = new FormData();
		{
			const domain: any = this.$domain();
			const session = this.$session() || {};
			formData.append('data.site.domain', domain);
			formData.append('auth.sid', _.get(session, 'auth.sid'));
			formData.append('auth.isLogin', _.get(session, 'auth.isLogin'));
			formData.append('path', path);
			formData.append('file', file);
		}
		const url = `${this.apiEndpoint}/api/cdn/upload`;
		return this.http.post(url, formData, {})
			.pipe(
				map((r: any) => {
					const results = r.results || {};
					return {results};
				})
			);
	}
}
